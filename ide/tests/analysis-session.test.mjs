import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const require = createRequire(import.meta.url);
await build({ entryPoints: ['language/src/analysis-session.ts'], outfile: '.dev/editor-session/session.cjs', bundle: true, platform: 'node', format: 'cjs' });
const { AnalysisSession } = require('../.dev/editor-session/session.cjs');
const { SlangProvider } = require('../dist/runtime/semantic/slang.js');
const python = process.env.RTL_SEMANTIC_PYTHON;
const until = async condition => { const deadline = Date.now() + 10000; while (Date.now() < deadline) { if (await condition()) return; await new Promise(resolve => setTimeout(resolve, 20)); } throw Error('Session did not reach verification boundary.'); };
async function fixture(t, sources) {
  assert.ok(python, 'Use the verified existing compiler runtime.');
  const directory = await fs.mkdtemp(path.resolve('.dev/editor-session/project-'));
  const files = await Promise.all(sources.map(async (text, i) => { const file = path.join(directory, `한글 source ${i}.sv`); await fs.writeFile(file, text); return file; }));
  const bridge = path.join(directory, 'bridge.py'), pidFile = path.join(directory, 'pid'), gate = path.join(directory, 'gate');
  await fs.writeFile(bridge, `import runpy,json,os,sys,time\nwith open(${JSON.stringify(pidFile)},'w') as f: f.write(str(os.getpid()))\nns=runpy.run_path(${JSON.stringify(path.resolve('language/python/analyze.py'))})\noriginal=ns['complete']\ndef blocked(*args,**kwargs):\n while os.path.exists(${JSON.stringify(gate)}): time.sleep(0.02)\n return original(*args,**kwargs)\nns['editor_session'].__globals__['complete']=blocked\nwith open(sys.argv[1],encoding='utf-8') as f: request=json.load(f)\nif request.get('operation')=='editor-session': ns['editor_session'](request)\nelse:\n result=ns['run_request'](request)\n with open(sys.argv[2],'w',encoding='utf-8') as f: json.dump(result,f)\n`);
  const provider = new SlangProvider(python, bridge, path.join(directory, 'cache'));
  const project = { root: directory, name: 'session', sources: files, includeDirs: [], defines: {}, backend: 'verilator', timing: true, waveform: 'vcd', tests: [] };
  const controller = new AbortController(); let session;
  const open = async (overlays = [], options = {}) => { const result = await AnalysisSession.open(provider, project, overlays, controller.signal, options); session = result.session; return result; };
  t.after(async () => { controller.abort(); await session?.close(true); await fs.rm(directory, { recursive: true, force: true }); });
  return { directory, files, project, provider, controller, open, pidFile, gate };
}

test('unimported project package names and every qualified member are offered before prefix filtering', async t => {
  const source='package options_pkg; parameter int WIDTH=8; typedef logic [WIDTH-1:0] word_t; int counter; endpackage\nmodule top; initial begin $display(options_pkg::WIDTH); end endmodule';
  const f=await fixture(t,[source]),{session}=await f.open();
  const offset=source.indexOf('$display(')+9;
  const names=await session.complete({file:f.files[0],offset},f.controller.signal);
  assert.ok(names.some(s=>s.name==='options_pkg'&&s.kind==='package'));
  const members=await session.complete({file:f.files[0],offset,qualifier:'options_pkg'},f.controller.signal);
  for(const name of ['WIDTH','word_t','counter']) assert.ok(members.some(s=>s.name===name),name);
  assert.ok(!members.some(s=>s.kind==='module'||s.name==='options_pkg'));
});

test('retained slang models match fresh scope/package/module queries including unsaved inputs', async t => {
  const source = 'package p; typedef logic [7:0] word; int public_value; endpackage\nmodule alu(input logic clk, output logic [7:0] result); endmodule\nmodule top; import p::*; logic wire_name; function void f(input int arg); int local_value; $display(arg); endfunction initial begin logic inner; $display(inner); end endmodule';
  const f = await fixture(t, [source]);
  const overlay = source.replace('wire_name', 'edited_wire');
  const { session, analysis } = await f.open([{ file: f.files[0], text: overlay }]);
  assert.ok(session.usable); assert.ok(analysis.modules.some(m => m.name === 'alu'));
  const positions = [overlay.indexOf('$display(arg)') + 9, overlay.indexOf('$display(inner)') + 9, overlay.indexOf('initial begin')];
  for (const offset of positions) {
    const query = { file: f.files[0], offset };
    assert.deepEqual(await session.complete(query, f.controller.signal), await f.provider.complete(f.project, [{ file: f.files[0], text: overlay }], query));
  }
  const symbols = await session.complete({ file: f.files[0], offset: positions[1] }, f.controller.signal);
  assert.ok(symbols.some(s => s.name === 'edited_wire')); assert.ok(symbols.some(s => s.name === 'inner')); assert.ok(!symbols.some(s => s.name === 'local_value'));
  const qualified = { file: f.files[0], offset: positions[1], qualifier: 'p' };
  assert.deepEqual(await session.complete(qualified, f.controller.signal), await f.provider.complete(f.project, [{ file: f.files[0], text: overlay }], qualified));
  assert.equal(await fs.readFile(f.files[0], 'utf8'), source);
  assert.equal(session.metrics.builds, 1); assert.equal(session.metrics.queries, 5);
  await session.close(); assert.equal(session.usable, false);
});

test('persistent worker replaces buffers, macros, defines and independent test models without starting another Python', async t => {
  const header='`define W 4\n', common='`include "defs.inc"\nmodule common(input logic [`W-1:0] data); endmodule',
    a='module first; logic first_value; common dut(); initial $display(first_value); endmodule',
    b='module second; logic second_value; common dut(); initial $display(second_value); endmodule';
  const f=await fixture(t,[common,a,b]);await fs.writeFile(path.join(f.directory,'defs.inc'),header);
  f.project.sources=[f.files[0]];f.project.tests=[{name:'first',top:'first',sources:[f.files[1]],timeoutMs:1000},{name:'second',top:'second',sources:[f.files[2]],timeoutMs:1000}];
  const {session}=await f.open([], {lifetime:f.controller.signal}),pid=Number(await fs.readFile(f.pidFile,'utf8'));
  const changed=a.replaceAll('first_value','edited_value');
  await fs.writeFile(path.join(f.directory,'defs.inc'),'`define W 9\n');
  const result=await session.rebuild(f.provider,f.project,[{file:f.files[1],text:changed}],f.controller.signal);
  assert.equal(result.modules.find(m=>m.name==='common').ports[0].signalType.width,9);
  let query={file:f.files[1],offset:changed.indexOf('$display')};
  const first=await session.complete(query,f.controller.signal);
  assert.ok(first.some(s=>s.name==='edited_value'));assert.ok(!first.some(s=>['first_value','second_value'].includes(s.name)));
  f.project.sources=[f.files[0],f.files[2]];f.project.tests=[];
  const next=await session.rebuild(f.provider,f.project,[],f.controller.signal);
  assert.ok(!next.modules.some(m=>m.name==='first'));
  query={file:f.files[2],offset:b.indexOf('$display')};
  const second=await session.complete(query,f.controller.signal);assert.ok(second.some(s=>s.name==='second_value'));
  assert.equal(Number(await fs.readFile(f.pidFile,'utf8')),pid);assert.doesNotThrow(()=>process.kill(pid,0));
  assert.equal(session.metrics.builds,3);assert.equal(session.metrics.rebuilds,2);assert.equal(session.metrics.processStarts,1);
  const leaves=await fs.readdir(path.join(f.directory,'cache'));assert.equal(leaves.length,1);
  assert.deepEqual(await fs.readdir(path.join(f.directory,'cache',leaves[0])),['input.json']);
  assert.deepEqual(second,await f.provider.complete(f.project,[],query));
  assert.equal(await fs.readFile(f.files[1],'utf8'),a);
});

test('automatic package ordering and wave/define changes rebuild with fresh state in the same worker', async t => {
  const base='package base; parameter int W=4; endpackage',consumer='package use_pkg; typedef logic [base::W-1:0] word; endpackage',
    source='module top(input use_pkg::word data);\n`ifdef EXTRA\n int optional_value;\n`endif\n initial $display(data); endmodule';
  const f=await fixture(t,[consumer,base,source]);f.project.packageSources=f.files.slice(0,2);f.project.packageOrder='auto';
  const {session}=await f.open([],{lifetime:f.controller.signal});
  f.project.defines={EXTRA:'1'};f.project.waveform='fst';
  const overlays=[{file:f.files[1],text:base.replace('W=4','W=12')}];
  const analysis=await session.rebuild(f.provider,f.project,overlays,f.controller.signal);
  assert.equal(analysis.modules.find(m=>m.name==='top').ports[0].signalType.width,12);
  const query={file:f.files[2],offset:source.indexOf('$display')};assert.ok((await session.complete(query,f.controller.signal)).some(s=>s.name==='optional_value'));
  f.project.defines={};f.project.waveform='none';await session.rebuild(f.provider,f.project,[],f.controller.signal);
  const candidates=await session.complete(query,f.controller.signal);assert.ok(!candidates.some(s=>s.name==='optional_value'));
  assert.deepEqual(candidates,await f.provider.complete(f.project,[],query));
});

test('cancelling a persistent lookup preserves other callers and the bounded worker', async t => {
  const source='module top; logic alive; initial $display(alive); endmodule',f=await fixture(t,[source]);
  const {session}=await f.open([],{lifetime:f.controller.signal}),pid=Number(await fs.readFile(f.pidFile,'utf8'));
  await fs.writeFile(f.gate,'hold');const cancelled=new AbortController(),query={file:f.files[0],offset:source.indexOf('$display')};
  const first=session.complete(query,cancelled.signal);void first.catch(()=>{});
  const second=session.complete(query,f.controller.signal);void second.catch(()=>{});cancelled.abort();
  await assert.rejects(first);assert.equal(session.usable,true);assert.doesNotThrow(()=>process.kill(pid,0));
  await fs.unlink(f.gate);assert.ok((await second).some(s=>s.name==='alive'));
  assert.equal(Number(await fs.readFile(f.pidFile,'utf8')),pid);
});

test('cancelled protocol work remains bounded, and root lifetime ends even held lookups', async t => {
  const source='module top; logic value; endmodule',f=await fixture(t,[source]);
  const {session}=await f.open([],{lifetime:f.controller.signal}),pid=Number(await fs.readFile(f.pidFile,'utf8'));
  await fs.writeFile(f.gate,'hold');
  for(let i=0;i<32;i++){const controller=new AbortController();const pending=session.complete({file:f.files[0],offset:source.indexOf('value')},controller.signal);controller.abort();await assert.rejects(pending);}
  await assert.rejects(session.complete({file:f.files[0],offset:0},new AbortController().signal),/capacity exceeded/);
  f.controller.abort();await session.close(true);assert.throws(()=>process.kill(pid,0),{code:'ESRCH'});
  assert.deepEqual(await fs.readdir(path.join(f.directory,'cache')),[]);
});

test('an abandoned persistent query still enforces its real deadline and releases the owned process', async t => {
  const source='module top; logic value; endmodule',f=await fixture(t,[source]);
  const {session}=await f.open([],{lifetime:f.controller.signal}),pid=Number(await fs.readFile(f.pidFile,'utf8'));
  await fs.writeFile(f.gate,'hold');const controller=new AbortController();
  const pending=session.complete({file:f.files[0],offset:0},controller.signal);controller.abort();await assert.rejects(pending);
  const deadline=Date.now()+18000;
  while(session.usable&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,50));
  assert.equal(session.usable,false,'a cancelled caller must not disable the wire deadline');
  await session.close(true);assert.throws(()=>process.kill(pid,0),{code:'ESRCH'});assert.deepEqual(await fs.readdir(path.join(f.directory,'cache')),[]);
});

test('rebuild never publishes a superseded query and cancellation confirms worker exit', async t => {
  const source='module top; logic old_value; initial $display(old_value); endmodule',f=await fixture(t,[source]);
  const {session}=await f.open([],{lifetime:f.controller.signal}),pid=Number(await fs.readFile(f.pidFile,'utf8'));
  await fs.writeFile(f.gate,'hold');
  const query=session.complete({file:f.files[0],offset:source.indexOf('$display')},new AbortController().signal);void query.catch(()=>{});
  const controller=new AbortController(),rebuild=session.rebuild(f.provider,f.project,[{file:f.files[0],text:source.replaceAll('old_value','new_value')}],controller.signal);void rebuild.catch(()=>{});
  await new Promise(resolve=>setTimeout(resolve,60));await fs.unlink(f.gate);
  await assert.rejects(query,/superseded/);await rebuild;
  assert.ok((await session.complete({file:f.files[0],offset:source.indexOf('$display')},f.controller.signal)).some(s=>s.name==='new_value'));
  await fs.writeFile(f.gate,'hold');const blocked=session.complete({file:f.files[0],offset:0},new AbortController().signal);void blocked.catch(()=>{});
  const abort=new AbortController(),next=session.rebuild(f.provider,f.project,[],abort.signal);void next.catch(()=>{});abort.abort();await assert.rejects(next);await assert.rejects(blocked);
  await session.close(true);assert.throws(()=>process.kill(pid,0),{code:'ESRCH'});
});

test('wrong rebuild revision fails closed, joins the worker and permits a fresh verified session', async t => {
  const source='module top; endmodule',f=await fixture(t,[source]);
  const original=await fs.readFile(f.provider.bridge,'utf8');
  await fs.writeFile(f.provider.bridge,`import json,sys,os\nwith open(${JSON.stringify(f.pidFile)},'w') as f: f.write(str(os.getpid()))\ndef emit(value):\n print('\\x1eRTL_EDITOR_V1 '+json.dumps(value),flush=True)\nbase={'kind':'ready','id':0,'revision':0,'analyses':[{'modules':[],'instances':[],'diagnostics':[]}],'reusable':True,'sourceBytes':1,'rssBytes':1}\nemit(base)\nfor line in sys.stdin:\n command=json.loads(line)\n emit({**base,'id':command['id'],'revision':-1})\n`);
  const {session}=await f.open([],{lifetime:f.controller.signal}),pid=Number(await fs.readFile(f.pidFile,'utf8'));
  await assert.rejects(session.rebuild(f.provider,f.project,[],f.controller.signal),/Invalid compiler response/);
  assert.throws(()=>process.kill(pid,0),{code:'ESRCH'});assert.deepEqual(await fs.readdir(path.join(f.directory,'cache')),[]);
  await fs.writeFile(f.provider.bridge,original);const next=await f.open([],{lifetime:f.controller.signal});assert.ok(next.analysis.modules.some(m=>m.name==='top'));
});

test('worker recycling bounds consecutive models and refuses a different project identity', async t => {
  const source='module top; logic value; endmodule',f=await fixture(t,[source]);
  const {session}=await f.open([],{lifetime:f.controller.signal});
  assert.equal(session.canRebuild(f.provider,{...f.project,root:path.dirname(f.directory)}),false);
  for(let i=0;i<64;i++)await session.rebuild(f.provider,f.project,[{file:f.files[0],text:source.replace('value','value_'+i)}],f.controller.signal);
  assert.equal(session.metrics.builds,65);assert.equal(session.canRebuild(f.provider,f.project),false);
  await assert.rejects(session.rebuild(f.provider,f.project,[],f.controller.signal),/cannot rebuild/);assert.equal(session.usable,true);
});

test('200-file edit rebuilds measure fresh worker versus retained worker and exact latest completions', async t => {
  const source='module top; logic bench_signal_0; initial $display(bench_signal_0); endmodule';
  const f=await fixture(t,[source,...Array.from({length:199},(_,i)=>`module unit_${i}(input logic [7:0] a, output logic [7:0] b); assign b=a+1; endmodule`)]);
  const {session}=await f.open([],{lifetime:f.controller.signal}),pid=Number(await fs.readFile(f.pidFile,'utf8'));
  const warm=[],fresh=[],queries=[];
  for(let i=1;i<=4;i++) {
    const text=source.replaceAll('bench_signal_0','bench_signal_'+i),overlays=[{file:f.files[0],text}];
    let started=performance.now();await session.rebuild(f.provider,f.project,overlays,f.controller.signal);warm.push(performance.now()-started);
    started=performance.now();const symbols=await session.complete({file:f.files[0],offset:text.indexOf('$display')},f.controller.signal);queries.push(performance.now()-started);
    assert.ok(symbols.some(s=>s.name==='bench_signal_'+i));assert.ok(!symbols.some(s=>s.name==='bench_signal_0'));
    // Compare model preparation, not a cached query with a fresh full build.
    started=performance.now();const other=await AnalysisSession.open(f.provider,f.project,overlays,f.controller.signal);fresh.push(performance.now()-started);
    try {assert.deepEqual(symbols,await other.session.complete({file:f.files[0],offset:text.indexOf('$display')},f.controller.signal));} finally {await other.session.close();}
    assert.doesNotThrow(()=>process.kill(pid,0));
  }
  assert.equal(session.metrics.processStarts,1);assert.equal(session.metrics.rebuilds,4);
  const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
  await fs.writeFile('.dev/windows-integrated/pulse-worker-rebuild-measurement.json',JSON.stringify({platform:process.platform,files:200,changes:4,warmModelMs:warm,freshModelMs:fresh,firstQueriesMs:queries,warmMedianMs:median(warm),freshMedianMs:median(fresh),metrics:{...session.metrics},note:'Synthetic tiny RTL models; model preparation and first semantic query are separate; no UI timing.'},null,2)+'\n');
});

test('completion inventory preserves nested instances and compilation-unit signals beside module definitions', async t => {
  const text='int global_value; module child; endmodule\nmodule top; logic local_value; child nested(); initial $display(local_value,global_value); endmodule';
  const f=await fixture(t,[text,'int other_global; module unrelated; logic foreign_value; endmodule']);
  const {session}=await f.open();
  const query={file:f.files[0],offset:text.indexOf('$display')};
  const symbols=await session.complete(query,f.controller.signal),names=symbols.map(s=>s.name);
  for(const name of ['global_value','other_global','local_value','nested','child','top','unrelated']) assert.ok(names.includes(name),name);
  assert.ok(!names.includes('foreign_value'));
  assert.deepEqual(symbols,await f.provider.complete(f.project,[],query));
});

test('independent test contexts preserve per-top signals and intersect shared RTL', async t => {
  const common = 'module common; logic shared; endmodule', a = 'module first; logic only_first; common dut(); initial $display(only_first); endmodule', b = 'module second; logic only_second; common dut(); initial $display(only_second); endmodule';
  const f = await fixture(t, [common, a, b]);
  f.project.sources = [f.files[0]];
  f.project.tests = [a, b].map((text, i) => ({ name: i ? 'second' : 'first', top: i ? 'second' : 'first', sources: [f.files[i + 1]], timeoutMs: 1000 }));
  const { session } = await f.open();
  for (const [file, offset] of [[f.files[1], a.indexOf('$display')], [f.files[2], b.indexOf('$display')], [f.files[0], common.indexOf('shared') + 6]]) {
    const query = { file, offset }; assert.deepEqual(await session.complete(query, f.controller.signal), await f.provider.complete(f.project, [], query));
  }
});

test('cancelled retained compiler query confirms leaf exit and removes session files', async t => {
  const source = 'module top; logic alive; initial $display(alive); endmodule', f = await fixture(t, [source]);
  const { session } = await f.open(); const pid = Number(await fs.readFile(f.pidFile, 'utf8'));
  await fs.writeFile(f.gate, 'hold lookup'); const cancellation = new AbortController();
  const pending = session.complete({ file: f.files[0], offset: source.indexOf('$display') }, cancellation.signal);
  void pending.catch(() => {}); await new Promise(resolve => setTimeout(resolve, 80)); cancellation.abort();
  await assert.rejects(pending); await session.close(true);
  assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
  assert.deepEqual(await fs.readdir(path.join(f.directory, 'cache')), []);
});

test('compiler-derived cache separates declaration order, nested scopes and package qualifiers', async t => {
  const source='package p; int visible; endpackage\nmodule top; import p::*; function void f(); int before_value; $display(before_value); begin int nested; $display(nested); end int after_value; $display(after_value); endfunction endmodule';
  const f=await fixture(t,[source]);const {session}=await f.open();
  const offsets=[source.indexOf('$display(before_value)'),source.indexOf('$display(nested)'),source.indexOf('$display(after_value)'),source.indexOf('$display(before_value)')+4];
  for(const offset of offsets) for(const qualifier of [undefined,'p']) {
    const query={file:f.files[0],offset,qualifier};
    assert.deepEqual(await session.complete(query,f.controller.signal),await f.provider.complete(f.project,[],query));
  }
});

test('retargeting an unlisted query alias cannot reuse the former compiler identity', async t => {
  const source='module top; logic original_signal; initial $display(original_signal); endmodule';
  const f=await fixture(t,[source]),alias=path.join(f.directory,'alias'),outside=path.join(f.directory,'foreign');
  await fs.mkdir(outside);await fs.writeFile(path.join(outside,path.basename(f.files[0])),'module foreign; logic foreign_signal; endmodule');
  await fs.symlink(f.directory,alias,process.platform==='win32'?'junction':'dir');
  const {session}=await f.open(),query={file:path.join(alias,path.basename(f.files[0])),offset:source.indexOf('$display')};
  const fresh=await f.provider.complete(f.project,[],query),reused=await session.complete(query,f.controller.signal);
  assert.ok(fresh.some(s=>s.name==='original_signal'),JSON.stringify({fresh,real:await fs.realpath(query.file),file:f.files[0]}));
  assert.deepEqual(reused,fresh);
  await fs.unlink(alias);await fs.symlink(outside,alias,process.platform==='win32'?'junction':'dir');
  assert.deepEqual(await session.complete(query,f.controller.signal),[]);
  await fs.unlink(alias);
});

test('single-module EOF without newline retains module-local signals despite equal outer scope ranges', async t => {
  const source='module top; wire a; reg b; logic c; initial $display(a,b,c); endmodule';
  const f=await fixture(t,[source]),{session}=await f.open(),query={file:f.files[0],offset:source.indexOf('$display')};
  for(const entries of [await f.provider.complete(f.project,[],query),await session.complete(query,f.controller.signal)]) {
    for(const name of ['a','b','c'])assert.ok(entries.some(symbol=>symbol.name===name),name);
  }
});

test('retained editor models use Core-approved automatic package order and unsaved package types', async t => {
  const consumer='package consumer; import base::*; typedef logic [W-1:0] word; endpackage',
    provider='package base; parameter int W=4; endpackage',
    source='module top(input consumer::word value); initial $display(value); endmodule';
  const f=await fixture(t,[consumer,provider,source]);f.project.packageSources=f.files.slice(0,2);f.project.packageOrder='auto';
  const overlays=[{file:f.files[1],text:provider.replace('W=4','W=8')}],{session,analysis}=await f.open(overlays);
  assert.equal(analysis.modules.find(m=>m.name==='top').ports[0].signalType.width,8);
  const query={file:f.files[2],offset:source.indexOf('$display')};
  assert.deepEqual(await session.complete(query,f.controller.signal),await f.provider.complete(f.project,overlays,query));
  assert.equal(await fs.readFile(f.files[1],'utf8'),provider);
});

test('representative hundreds-file Windows compiler reuse records cold/warm completion measurements', async t => {
  const source = 'module top; logic bench_signal; initial $display(bench_signal); endmodule';
  const f = await fixture(t, [source, ...Array.from({ length: 199 }, (_, i) => `module unit_${i}(input logic [7:0] a, output logic [7:0] b); assign b=a+1; endmodule`)]);
  const { session } = await f.open(); const query = { file: f.files[0], offset: source.indexOf('$display') };
  const warm = [];
  for (let i = 0; i < 12; i++) { const start = performance.now(); assert.ok((await session.complete({...query,offset:query.offset+i%3}, f.controller.signal)).some(s => s.name === 'bench_signal')); warm.push(performance.now() - start); }
  const fresh = [];
  for (let i = 0; i < 3; i++) { const start = performance.now(); await f.provider.complete(f.project, [], query); fresh.push(performance.now() - start); }
  const sorted = [...warm].sort((a,b) => a-b);
  const result = { platform: process.platform, files: 200, buildMs: session.metrics.buildMs, firstQueryMs: warm[0], warmQueryMs: warm, warmMedianMs: sorted[Math.floor(sorted.length / 2)], freshQueryMs: fresh, sourceBytes: session.metrics.sourceBytes, compilerBuilds: session.metrics.builds, peakRssBytes: session.metrics.peakRssBytes };
  await fs.writeFile('.dev/windows-integrated/pulse-completion-session-measurement.json', JSON.stringify(result, null, 2));
  assert.equal(session.metrics.builds, 1); assert.equal(session.metrics.queries, 12);
});
