import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import { transformSync } from 'esbuild';
import { root } from '../scripts/environment.mjs';
const require=createRequire(import.meta.url);
const { createProject,loadProject,projectWatchPaths }=require('../dist/runtime/core/index.js');
const { readTestCatalog,editTestCatalog,saveTestCatalog }=require('../dist/runtime/core/test-catalog.js');
const { SimulationHostSession }=require('../dist/runtime/host.js');
const { SimulationService }=require('../dist/runtime/simulation.js');
async function fixture(t){
 const directory=await fs.mkdtemp(path.join(root,'.dev/tb-catalog-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));
 await createProject(directory,true);await fs.mkdir(path.join(directory,'verification'));
 let backendCalls=0,semanticCalls=0;
 const host=new SimulationHostSession(()=>{},new SimulationService(async()=>{backendCalls++;throw Error('Discovery invoked simulator')}),undefined,async()=>{semanticCalls++;throw Error('Discovery invoked compiler')});
 t.after(()=>host.close());await host.inspect(directory);
 const edit=async request=>{await host.editTestList(request,host.state.testList.revision,true);assert.equal(host.state.error,undefined,host.state.error)};
 return {directory,host,edit,tools:()=>({backendCalls,semanticCalls})};
}
test('folder adds/removes separate tops without invoking tools or writing on events; exclusion survives recreation/restart',async t=>{
 const f=await fixture(t),manifest=await fs.readFile(path.join(f.directory,'rtl.toml'));
 await f.edit({action:'folder',path:'verification'});const file=path.join(f.directory,'verification/two.sv');
 await fs.writeFile(file,'module first; endmodule\nmodule second; endmodule\n');await f.host.refreshInputs();
 assert.equal(f.host.state.tests.filter(item=>['first','second'].includes(item.top)).length,2);
 const second=f.host.state.tests.find(item=>item.top==='second').name;
 await f.edit({action:'exclude',file:'verification/two.sv',top:'first'});assert.ok(!f.host.state.tests.some(item=>item.top==='first'));
 const preferences=await fs.readFile(path.join(f.directory,'rtl-tests.json'));
 await fs.unlink(file);await f.host.refreshInputs();assert.ok(!f.host.state.tests.some(item=>item.top==='second'));
 await fs.writeFile(file,'// offset changed\nmodule first; endmodule\nmodule second; endmodule\n');await f.host.refreshInputs();
 assert.ok(!f.host.state.tests.some(item=>item.top==='first'));assert.equal(f.host.state.tests.find(item=>item.top==='second').name,second);
 await f.host.close();const fresh=new SimulationHostSession(()=>{});t.after(()=>fresh.close());await fresh.inspect(f.directory);
 assert.ok(!fresh.state.tests.some(item=>item.top==='first'));assert.ok(fresh.state.tests.some(item=>item.top==='second'));
 assert.deepEqual(await fs.readFile(path.join(f.directory,'rtl-tests.json')),preferences);assert.deepEqual(await fs.readFile(path.join(f.directory,'rtl.toml')),manifest);
 assert.deepEqual(f.tools(),{backendCalls:0,semanticCalls:0});
});
test('manual file outside the TB folder adds both modules and removal/restoration is specific to a top',async t=>{
 const f=await fixture(t);await fs.mkdir(path.join(f.directory,'other'));
 const file=path.join(f.directory,'other/outside [한글].sv');await fs.writeFile(file,'module external_a; endmodule\nmodule external_b; endmodule\n');
 await f.edit({action:'file',path:'other/outside [한글].sv'});assert.ok(f.host.state.tests.some(item=>item.top==='external_a'));assert.ok(f.host.state.tests.some(item=>item.top==='external_b'));
 await f.edit({action:'exclude',file:'other/outside [한글].sv',top:'external_a'});await f.host.refreshInputs();assert.ok(!f.host.state.tests.some(item=>item.top==='external_a'));
 await f.edit({action:'restore',file:'other/outside [한글].sv',top:'external_a'});assert.ok(f.host.state.tests.some(item=>item.top==='external_a'));
 await fs.unlink(file);await f.host.refreshInputs();assert.ok(!f.host.state.tests.some(item=>item.top.startsWith('external_')));assert.deepEqual(f.tools(),{backendCalls:0,semanticCalls:0});
});
test('manifest test is excluded/restored without changing its name or original source',async t=>{
 const f=await fixture(t),file=path.join(f.directory,'tb/counter_basic_tb.sv'),original=await fs.readFile(file);
 await f.edit({action:'exclude',file:'tb/counter_basic_tb.sv',top:'counter_basic_tb'});assert.ok(!f.host.state.tests.some(item=>item.name==='counter_basic'));
 await f.edit({action:'restore',file:'tb/counter_basic_tb.sv',top:'counter_basic_tb'});assert.ok(f.host.state.tests.some(item=>item.name==='counter_basic'));assert.deepEqual(await fs.readFile(file),original);
});
test('empty TB folder and preference JSON route actual semantic membership events',async t=>{
 const f=await fixture(t);await f.edit({action:'folder',path:'verification'});const project=await loadProject(f.directory),scopes=projectWatchPaths(project);
 assert.ok(scopes.sources.some(scope=>scope.directory===path.join(f.directory,'verification')));
 const mod=new Module(path.join(root,'.dev/catalog-events.cjs'));mod.require=require;
 mod._compile(transformSync(await fs.readFile(path.join(root,'language/src/input-events.ts'),'utf8'),{loader:'ts',format:'cjs'}).code,path.join(root,'.dev/catalog-events.cjs'));
 const state={root:f.directory,inputs:{files:[],candidates:[],conservative:false},watchPaths:scopes};
 assert.equal(mod.exports.inputEvent(state,path.join(f.directory,'rtl-tests.json')),true);assert.equal(mod.exports.inputEvent(state,path.join(f.directory,'verification/new.sv')),true);
});
test('untrusted/stale/escaped/linked/malformed preferences refuse changes and aborted writes preserve ownership',async t=>{
 const f=await fixture(t),absent=await readTestCatalog(f.directory);
 await assert.rejects(f.host.editTestList({action:'folder',path:'verification'},absent.revision,false),/신뢰/);
 await editTestCatalog(f.directory,absent.revision,{action:'folder',path:'verification'});const current=await readTestCatalog(f.directory),file=path.join(f.directory,'rtl-tests.json'),before=await fs.readFile(file);
 await assert.rejects(editTestCatalog(f.directory,'absent',{action:'file',path:'tb/counter_basic_tb.sv'}),/changed/);
 await assert.rejects(editTestCatalog(f.directory,current.revision,{action:'folder',path:'../'}),/project/);
 const controller=new AbortController();controller.abort();await assert.rejects(saveTestCatalog(f.directory,current.revision,current.policy,controller.signal));assert.deepEqual(await fs.readFile(file),before);
 await fs.symlink(path.join(f.directory,'tb'),path.join(f.directory,'linked'),process.platform==='win32'?'junction':'dir');await assert.rejects(editTestCatalog(f.directory,current.revision,{action:'folder',path:'linked'}),/links/);
 await fs.writeFile(file,'{}');await assert.rejects(loadProject(f.directory));assert.equal(await fs.readFile(file,'utf8'),'{}');
});

test('manual TB that was also a literal RTL source disappears on deletion while other tests and manifest remain',async t=>{
 const f=await fixture(t);await fs.mkdir(path.join(f.directory,'other'));
 const file=path.join(f.directory,'other/common_tb.sv');await fs.writeFile(file,'module common_tb; endmodule\n');
 const manifest=path.join(f.directory,'rtl.toml');const text=(await fs.readFile(manifest,'utf8')).replace('rtl = ["rtl/**/*.sv"]','rtl = ["rtl/**/*.sv", { file = "other/common_tb.sv" }]');await fs.writeFile(manifest,text);
 await f.edit({action:'file',path:'other/common_tb.sv'});assert.ok(f.host.state.tests.some(test=>test.top==='common_tb'));
 await fs.unlink(file);await f.host.refreshInputs();assert.ok(!f.host.state.tests.some(test=>test.top==='common_tb'));assert.equal(f.host.state.tests.length,2);assert.equal((await loadProject(f.directory)).tests.length,2);assert.equal(await fs.readFile(manifest,'utf8'),text);
});

test('TB metadata keeps synchronizing with a missing DUT while execution remains blocked, then recovers',async t=>{
 const f=await fixture(t);await f.edit({action:'folder',path:'verification'});const dut=path.join(f.directory,'rtl/counter.sv'),original=await fs.readFile(dut);await fs.unlink(dut);
 const file=path.join(f.directory,'verification/new.sv');await fs.writeFile(file,'module added_without_dut; endmodule\n');await f.host.refreshInputs();
 assert.ok(f.host.state.tests.some(test=>test.top==='added_without_dut'));assert.equal(f.host.state.project,undefined);assert.throws(()=>f.host.start(undefined,true),/유효한 rtl.toml/);assert.deepEqual(f.tools(),{backendCalls:0,semanticCalls:0});
 await fs.unlink(file);await f.host.refreshInputs();assert.ok(!f.host.state.tests.some(test=>test.top==='added_without_dut'));
 await fs.writeFile(dut,original);await f.host.refreshInputs();assert.equal(f.host.state.project,'counter');assert.equal(f.host.state.phase,'idle');assert.equal(f.host.state.error,undefined);
});

test('duplicate preference writes fail before publication and named legacy targets can be independently excluded',async t=>{
 const f=await fixture(t);const manifest=path.join(f.directory,'rtl.toml');await fs.appendFile(manifest,'\n[[test]]\nname = "basic_alias"\ntop = "counter_basic_tb"\nsources = ["tb/counter_basic_tb.sv"]\n');await f.host.inspect(f.directory);
 await f.edit({action:'exclude',file:'tb/counter_basic_tb.sv',top:'counter_basic_tb',name:'counter_basic'});assert.ok(!f.host.state.tests.some(test=>test.name==='counter_basic'));assert.ok(f.host.state.tests.some(test=>test.name==='basic_alias'));
 await f.edit({action:'exclude',file:'tb/counter_basic_tb.sv',top:'counter_basic_tb',name:'basic_alias'});assert.ok(!f.host.state.tests.some(test=>test.top==='counter_basic_tb'));
 await f.edit({action:'restore',file:'tb/counter_basic_tb.sv',top:'counter_basic_tb',name:'counter_basic'});assert.ok(f.host.state.tests.some(test=>test.name==='counter_basic'));assert.ok(!f.host.state.tests.some(test=>test.name==='basic_alias'));
 const current=await readTestCatalog(f.directory),before=await fs.readFile(path.join(f.directory,'rtl-tests.json'));current.policy.manual=['tb/counter_basic_tb.sv','tb/counter_basic_tb.sv'];
 await assert.rejects(saveTestCatalog(f.directory,current.revision,current.policy),/Duplicate/);assert.deepEqual(await fs.readFile(path.join(f.directory,'rtl-tests.json')),before);
});

test('a TB event arriving after the active scan is sampled coalesces into one fresh scan for all callers',async t=>{
 const f=await fixture(t);await f.edit({action:'folder',path:'verification'});
 const service=f.host.service,inspect=service.inspect.bind(service);let entered,release;
 const sampled=new Promise(resolve=>{entered=resolve}),gate=new Promise(resolve=>{release=resolve});let scans=0;
 service.inspect=async(root,signal)=>{const project=await inspect(root,signal);if(++scans===1){entered();await gate;}return project;};
 const first=f.host.refreshInputs();await sampled;
 await fs.writeFile(path.join(f.directory,'verification/late.sv'),'module late_a; endmodule\nmodule late_b; endmodule\n');
 const callers=Array.from({length:100},()=>f.host.refreshInputs());release();await Promise.all([first,...callers]);
 assert.equal(scans,2);assert.ok(f.host.state.tests.some(test=>test.top==='late_a'));assert.ok(f.host.state.tests.some(test=>test.top==='late_b'));
 assert.deepEqual(f.tools(),{backendCalls:0,semanticCalls:0});
});

test('closing joins a sampled TB scan and cannot publish its late membership',async t=>{
 const f=await fixture(t);await f.edit({action:'folder',path:'verification'});
 await fs.writeFile(path.join(f.directory,'verification/late.sv'),'module late_after_close; endmodule\n');
 const service=f.host.service,inspect=service.inspect.bind(service);let entered,release;
 const sampled=new Promise(resolve=>{entered=resolve}),gate=new Promise(resolve=>{release=resolve});
 service.inspect=async(root,signal)=>{const project=await inspect(root,signal);entered();await gate;signal?.throwIfAborted();return project;};
 const before=f.host.state.revision,scan=f.host.refreshInputs();await sampled;let closed=false;
 const closing=f.host.close().then(()=>{closed=true;});await new Promise(resolve=>setImmediate(resolve));assert.equal(closed,false);
 release();await Promise.all([scan,closing]);assert.equal(f.host.state.revision,before);assert.ok(!f.host.state.tests.some(test=>test.top==='late_after_close'));
 assert.deepEqual(f.tools(),{backendCalls:0,semanticCalls:0});
});
