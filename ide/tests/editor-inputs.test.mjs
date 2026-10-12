import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url);
const { SimulationService } = require('../dist/runtime/simulation.js');
const { loadRecordedInputs, readHistory, compareResultInputs } = require('../dist/runtime/core/index.js');
const { freezeInputOverrides } = require('../dist/runtime/core/input-overrides.js');
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(root, '.dev/h6b-input-한글 공백-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, 'rtl')); await fs.mkdir(path.join(dir, 'tb')); await fs.mkdir(path.join(dir, 'inc'));
  await fs.writeFile(path.join(dir, 'rtl/dut.sv'), 'module dut; endmodule');
  await fs.writeFile(path.join(dir, 'tb/tb.sv'), 'module first; endmodule\nmodule second; endmodule');
  await fs.writeFile(path.join(dir, 'inc/value.svh'), '`define VALUE 1\n');
  await fs.writeFile(path.join(dir, 'rtl.toml'), 'version=1\n[project]\nname="edit"\n[sources]\nrtl=["rtl/*.sv"]\ninclude_dirs=["inc"]\n[simulation]\nwaveform="none"\n' + ['first','second'].map(top => `[[test]]\nname="${top}"\ntop="${top}"\nsources=["tb/tb.sv"]\n`).join(''));
  return dir;
}
const backend = build => ({ id:'verilator', capabilities:{waveforms:['vcd','fst','none'],timing:true,inputSnapshot:true}, check:async()=>{}, build, run:async()=>{} });
test('run request freezes editor buffers before awaits and reuses them for sequential tests, retained history and saved comparison', async t => {
  const dir = await fixture(t), file = path.join(dir,'rtl/dut.sv');
  const original = await fs.readFile(file,'utf8');
  const input = {path:file,text:'module dut; logic edited; endmodule',version:12}, inputs=[input];
  const seen=[];
  const service=new SimulationService(async()=>backend(async({project,directory})=>{
    seen.push(await fs.readFile(project.sources[0],'utf8'));
    input.text='module changed; endmodule'; inputs.length=0;
    return {executable:'fake',cwd:directory};
  }));
  const running=service.run({root:dir,inputOverrides:inputs}); input.text='module too_late; endmodule';
  const results=await running;
  assert.deepEqual(seen,['module dut; logic edited; endmodule','module dut; logic edited; endmodule']);
  assert.ok(results.every(result=>result.status==='passed'));
  assert.equal(await fs.readFile(file,'utf8'),original);
  const loaded=await loadRecordedInputs(results[0]);
  assert.equal(loaded.overrides[0].version,12);
  assert.deepEqual(results[0].inputSnapshot.unsavedFiles,[file]);
  assert.equal((await readHistory(dir))[0].inputSnapshot.unsavedFiles.length,1);
  assert.equal((await compareResultInputs(results[0],await service.inspect(dir))).state,'changed');
  assert.equal((await compareResultInputs(results[0],await service.inspect(dir),undefined,[{path:file,text:seen[0],version:999}])).state,'matching');
  assert.equal((await compareResultInputs(results[0],await service.inspect(dir),undefined,[{path:file,text:seen[0]+'// later'}])).state,'changed');
  assert.equal((await compareResultInputs(results[0],await service.inspect(dir),undefined,[])).state,'changed');
  await fs.writeFile(file,'module disk_changed; endmodule');
  assert.equal(await fs.readFile((await loadRecordedInputs(results[0])).project.sources[0],'utf8'),seen[0]);
  const record=path.join(results[0].directory,'input-snapshot.json');
  const saved=JSON.parse(await fs.readFile(record,'utf8')); saved.overrides[0].sha256='0'.repeat(64);
  await fs.writeFile(record,JSON.stringify(saved));
  await assert.rejects(loadRecordedInputs(results[0]),/provenance mismatch/);
});
test('edited include/header closure is retained and unrelated test source is not implicitly compiled', async t=>{
  const dir=await fixture(t), file=path.join(dir,'tb/tb.sv'), header=path.join(dir,'inc/value.svh');
  const unrelated=path.join(dir,'tb/unregistered.sv');await fs.writeFile(unrelated,'module unused; endmodule');
  const edited='`include "value.svh"\nmodule first; endmodule\nmodule second; endmodule';
  const service=new SimulationService(async()=>backend(async({target,directory})=>{assert.equal(await fs.readFile(target.sources[0],'utf8'),edited);return{executable:'fake',cwd:directory};}));
  const [result]=await service.run({root:dir,names:['first'],inputOverrides:[{path:file,text:edited},{path:header,text:'`define VALUE 2\n',version:3},{path:unrelated,text:'invalid unused'}]});
  assert.equal(result.status,'passed',result.message);
  const saved=await loadRecordedInputs(result);
  assert.equal(await fs.readFile(path.join(saved.project.includeDirs[0],'value.svh'),'utf8'),'`define VALUE 2\n');
  assert.equal(saved.overrides.length,2);assert.equal(saved.sourceMappings.some(mapping=>mapping.original===unrelated),false);
  assert.equal(await fs.readFile(header,'utf8'),'`define VALUE 1\n');
});
test('invalid snapshot inputs never fall back to disk and unsupported backends never build', async t=>{
  const dir=await fixture(t);let builds=0;
  const adapter=backend(async({directory})=>{builds++;return{executable:'fake',cwd:directory};});
  const service=new SimulationService(async()=>adapter);
  for (const input of [
    {path:path.join(dir,'tb/tb.sv'),text:'`include "missing.svh"\nmodule first; endmodule'},
    {path:path.join(dir,'missing.sv'),text:'module first; endmodule'},
    {path:path.join(root,'runtime/core/model.ts').replace(/\.ts$/,'.sv'),text:'external'},
    {path:path.join(dir,'.rtl/hidden.sv'),text:'generated'}
  ]) {
    const [result]=await service.run({root:dir,names:['first'],inputOverrides:[input]});
    assert.equal(result.status,'failed');assert.equal(result.inputSnapshot.state,'unavailable');
  }
  adapter.capabilities.inputSnapshot=false;
  const [result]=await service.run({root:dir,names:['first'],inputOverrides:[{path:path.join(dir,'rtl/dut.sv'),text:'edited'}]});
  assert.equal(result.status,'failed');assert.match(result.message,/cannot execute editor/);assert.equal(builds,0);
});
test('editor payload rejects non-RTL, relative, duplicate and unbounded/version-invalid inputs', ()=>{
  const file=path.join(root,'rtl.sv');
  for(const input of [[{path:'relative.sv',text:''}],[{path:path.join(root,'rtl.toml'),text:''}],[{path:file,text:'',version:-1}],[{path:file,text:''},{path:file,text:'other'}],[{path:file,text:'x'.repeat(32*1024*1024+1)}]])assert.throws(()=>freezeInputOverrides(input));
});

test('editor input through a junction or reserved folder is rejected before build', async t=>{
  const dir=await fixture(t), destination=await fixture(t), link=path.join(dir,'linked');
  await fs.symlink(destination,link,process.platform==='win32'?'junction':'dir');
  await fs.mkdir(path.join(dir,'.RTL'));
  await fs.writeFile(path.join(dir,'.RTL/private.sv'),'module private; endmodule');
  let built=false;
  const service=new SimulationService(async()=>backend(async()=>{built=true;throw Error('must not build');}));
  for(const file of [path.join(link,'rtl/dut.sv'),path.join(dir,'.RTL/private.sv')]){
    const [result]=await service.run({root:dir,names:['first'],inputOverrides:[{path:file,text:'edited'}]});
    assert.equal(result.status,'failed');assert.match(result.message,/symlink|source tree/);
  }
  assert.equal(built,false);
});
