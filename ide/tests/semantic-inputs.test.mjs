import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { createHash, randomUUID } from 'node:crypto';
import { createProtocolConnection, IPCMessageReader, IPCMessageWriter } from 'vscode-languageserver/node.js';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url);
await build({ entryPoints: ['language/src/input-events.ts', 'language/src/input-watches.ts'], outdir: '.dev/h7l-inputs', bundle: true, platform: 'node', format: 'cjs', outExtension: { '.js': '.cjs' } });
const { inputEvent, inputPatterns, actualInput, contains } = require('../.dev/h7l-inputs/input-events.cjs');
const { InputWatches } = require('../.dev/h7l-inputs/input-watches.cjs');
const { SlangProvider } = require('../dist/runtime/semantic/slang.js');
const { readImportRecovery, resolveImportRecovery } = require('../dist/runtime/core/index.js');
const { publishImportConfiguration } = require('../dist/runtime/core/import-publication.js');
const { acquireImportLease } = require('../dist/runtime/core/import-lease.js');
const { loadProject } = require('../dist/runtime/core/config.js');
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b; }); return { promise, resolve, reject }; };
const tick = () => new Promise(resolve => setImmediate(resolve));
const until = async (condition,detail=async()=> '') => { const deadline = Date.now()+10000; while(Date.now()<deadline) { if(await condition()) return; await new Promise(resolve=>setTimeout(resolve,20)); } throw Error('Input verification did not reach the expected boundary: '+await detail()); };
const key = file => process.platform === 'win32' ? path.resolve(file).toLowerCase() : path.resolve(file);
test('generated events are ignored only with confirmed inputs; includes, alternatives and active journal invalidate', () => {
  const directory = path.resolve('.dev/input-events'), include = path.join(directory,'.rtl/defs.inc');
  const state = { root: directory, inputs: { files:[path.join(directory,'code.sv'),include], candidates:[path.join(directory,'.rtl/near.inc')], conservative:false } };
  assert.equal(actualInput(state,include),true);
  for(const name of ['.rtl/unused.sv','.git/unused.vh','node_modules/unused.sv','.rtl/import-archive/old/previous.toml']) assert.equal(inputEvent(state,path.join(directory,name)),false,name);
  for(const name of ['.rtl/defs.inc','.rtl/near.inc','.rtl/import-transactions/id/previous.toml','.rtl/import-transactions/id/intent.json','.rtl/import-transactions/id/unknown','rtl.toml','.rtl','new.sv']) assert.equal(inputEvent(state,path.join(directory,name)),true,name);
  assert.equal(inputEvent(state,path.join(directory,'unrelated.toml')),false);
  assert.equal(contains(directory,path.join(directory,'..local.sv')),true);
  assert.equal(contains(directory,path.join(directory,'../sibling/file.sv')),false);
});
test('unknown and failed analysis conservatively preserve generated and external search events', () => {
  const directory=path.resolve('.dev/input-error'), external=path.resolve('.dev/headers');
  const state={root:directory,inputProject:{sources:[],tests:[],includeDirs:[external]}};
  assert.equal(inputEvent(state,path.join(directory,'.rtl/new.inc')),true);
  state.inputs={files:[],candidates:[],conservative:true};
  assert.equal(inputEvent(state,path.join(external,'missing.inc')),true);
  assert.equal(inputPatterns([state]).some(p=>key(p.directory)===key(external)&&p.pattern==='**/*'),true);
});
test('healthy non-RTL dependencies use parent watches and share directory registrations across roots', () => {
  const directory=path.resolve('.dev/input-watch'), file=path.join(directory,'defs[1].inc');
  const state={root:directory,inputs:{files:[file],candidates:[path.join(directory,'near.inc')],conservative:false}};
  assert.deepEqual(inputPatterns([state,state]),[{directory,pattern:'*'}]);
});
test('watch updates coalesce, install before releasing, and close waits for every acknowledgement', async () => {
  const entered=deferred(), gate=deferred(), released=deferred(), releaseGate=deferred(), trace=[];
  const watches=new InputWatches(async signature=>{trace.push('register '+signature); if(signature==='first'){entered.resolve();await gate.promise;} return async()=>{trace.push('release '+signature); if(signature==='last'){released.resolve();await releaseGate.promise;}};});
  const first=watches.sync('first'); await entered.promise;
  const requests=Array.from({length:20},(_,i)=>watches.sync(i===19?'last':'intermediate'));
  gate.resolve(); await Promise.all([first,...requests]);
  assert.deepEqual(trace,['register first','register last','release first']);
  const closed=watches.close(); let done=false;void closed.then(()=>{done=true;}); await released.promise;await tick();assert.equal(done,false);
  releaseGate.resolve();await closed;assert.deepEqual(trace.at(-1),'release last');
});
test('failed registration is reported to concurrent callers and can retry; failed release is joined on close', async () => {
  let fail=true, releases=0;
  const watches=new InputWatches(async()=>{if(fail)throw Error('registration rejected');return async()=>{releases++;if(releases===1)throw Error('release not confirmed');};});
  const results=await Promise.allSettled([watches.sync('first'),watches.sync('first')]);
  assert.ok(results.every(r=>r.status==='rejected'&&/registration rejected/.test(String(r.reason))));
  fail=false;await watches.sync('first');await assert.rejects(watches.sync('next'),/release not confirmed/);
  await watches.close();assert.equal(releases,3);
});

async function fixture(t,{source='`include ".rtl/defs.inc"\nmodule top(input logic [`WIDTH-1:0] a); endmodule\n',dynamic=true,before=false,registration,prepare,semanticSessions=false,interactiveEditing=false,holdModels=false}={}) {
  const python=process.env.RTL_SEMANTIC_PYTHON;assert.ok(python,'Use the verified existing runtime; no silent skip.');
  const directory=await fs.mkdtemp(path.join(root,'.dev/h7l-lsp-')),project=path.join(directory,'project'),external=path.join(directory,'external'),cache=path.join(directory,'cache');
  await fs.mkdir(path.join(project,'.rtl'),{recursive:true});await fs.mkdir(external);
  const file=path.join(project,'code.sv'),manifest=path.join(project,'rtl.toml'),uri=pathToFileURL(file).href;
  await fs.writeFile(file,source);await fs.writeFile(path.join(project,'.rtl/defs.inc'),'`define WIDTH 4\n');
  await fs.writeFile(manifest,'version=1\n[project]\nname="inputs"\n[sources]\nrtl=["*.sv"]\ninclude_dirs=["../external"]\n');
  await prepare?.({project,external,file,manifest});
  const bridge=path.join(directory,'bridge.py'),gate=path.join(directory,'hold');
  const recordDirectory=path.join(directory,'starts');await fs.mkdir(recordDirectory);
  await fs.writeFile(bridge,`import os,sys,json,time,runpy\nwith open(sys.argv[1]) as f: request=json.load(f)\nrecord_file=os.path.join(${JSON.stringify(recordDirectory)},str(time.time_ns())+'-'+str(os.getpid())+'.json')\nwith open(record_file+'.tmp','w') as f: json.dump({'pid':os.getpid(),'query':bool(request.get('query')),'root':os.getcwd(),'sourceCount':len(request['sources'])},f)\nos.replace(record_file+'.tmp',record_file)\nwhile os.path.exists(${JSON.stringify(gate)}): time.sleep(0.02)\nsys.argv[0]=${JSON.stringify(path.join(root,'language/python/analyze.py'))}\nrunpy.run_path(sys.argv[0],run_name='__main__')\n`);
  const modelGate=path.join(directory,'hold-model'),modelEntered=path.join(directory,'model-entered');
  if(holdModels) {
    const source=await fs.readFile(bridge,'utf8'),anchor="runpy.run_path(sys.argv[0],run_name='__main__')";
    assert.equal(source.split(anchor).length,2);
    await fs.writeFile(bridge,source.replace(anchor,`ns=runpy.run_path(sys.argv[0])\noriginal_model=ns['analyze']\nmodel_count=0\ndef held_model(value,retained=None):\n global model_count\n model_count+=1\n if model_count>1:\n  with open(${JSON.stringify(modelEntered)},'w') as f: f.write('entered')\n  while os.path.exists(${JSON.stringify(modelGate)}): time.sleep(0.02)\n return original_model(value,retained)\nns['editor_session'].__globals__['analyze']=held_model\nns['editor_session'](request)`));
  }
  const server=path.join(directory,'server.cjs'),contents=await fs.readFile(path.join(root,before?(typeof before==='string'?before:'.dev/cloud/h7l/server-before.ts'):'language/src/server.ts'),'utf8');
  await build({stdin:{contents,loader:'ts',resolveDir:path.join(root,'language/src'),sourcefile:'server.ts'},outfile:server,bundle:true,platform:'node',format:'cjs'});
  const child=fork(server,['--node-ipc',`--clientProcessId=${process.pid}`],{silent:true,execArgv:[]});const exited=once(child,'close');let stderr='';child.stderr.on('data',bytes=>{stderr=(stderr+bytes).slice(-16000);});
  const connection=createProtocolConnection(new IPCMessageReader(child),new IPCMessageWriter(child));const registrations=new Map(),requests=[];
  const logs=[],diagnostics=[],ready=[];connection.onNotification('window/logMessage',entry=>logs.push(entry.message));connection.onNotification('textDocument/publishDiagnostics',entry=>diagnostics.push(entry));connection.onNotification('rtl/analysisReady',entry=>ready.push(entry));
  connection.onRequest('client/registerCapability',async params=>{requests.push(params);await registration?.(params,{project,external});for(const item of params.registrations)registrations.set(item.id,item);return null;});
  connection.onRequest('client/unregisterCapability',params=>{for(const item of params.unregisterations)assert.equal(registrations.delete(item.id),true);return null;});connection.listen();
  const starts=async()=>Promise.all((await fs.readdir(recordDirectory)).filter(name=>name.endsWith('.json')).sort().map(async name=>JSON.parse(await fs.readFile(path.join(recordDirectory,name),'utf8'))));
  const stop=async()=>{if(child.exitCode!==null)return;await connection.sendRequest('rtl/prepareShutdown');assert.equal(registrations.size,0);await connection.sendRequest('shutdown');await connection.sendNotification('exit');await exited;assert.equal(child.exitCode,0,stderr);for(const {pid}of await starts())assert.throws(()=>process.kill(pid,0),{code:'ESRCH'});assert.deepEqual((await fs.readdir(cache).catch(e=>{if(e.code==='ENOENT')return[];throw e;})).filter(n=>/^(analysis|dependencies)-/.test(n)),[]);};
  t.after(async()=>{
    await fs.unlink(gate).catch(error=>{if(error.code!=='ENOENT')throw error;});
    await fs.unlink(modelGate).catch(error=>{if(error.code!=='ENOENT')throw error;});
    let timer;
    try{await Promise.race([stop(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Input fixture shutdown timed out')),10000);})]);}
    finally{clearTimeout(timer);connection.dispose();if(child.exitCode===null){child.kill();await exited;}await fs.rm(directory,{recursive:true,force:true});}
  });
  await connection.sendRequest('initialize',{processId:process.pid,workspaceFolders:[{uri:pathToFileURL(project).href,name:'inputs'}],capabilities:{workspace:{workspaceFolders:true,...(dynamic?{didChangeWatchedFiles:{dynamicRegistration:true,relativePatternSupport:true}}:{})}},initializationOptions:{python,bridge,cache,semanticSessions,interactiveEditing}});
  await connection.sendNotification('initialized',{});await connection.sendNotification('textDocument/didOpen',{textDocument:{uri,languageId:'systemverilog',version:1,text:source}});
  return {directory,project,external,file,manifest,uri,source,connection,registrations,requests,starts,gate,modelGate,modelEntered,stop,logs,diagnostics,ready,
    hover:()=>connection.sendRequest('textDocument/hover',{textDocument:{uri},position:{line:source.split('\n').findIndex(line=>line.includes('module top')),character:8}}),
    status:(target=uri)=>connection.sendRequest('rtl/languageStatus',{uri:target}),
    watch:(file,type=2)=>connection.sendNotification('workspace/didChangeWatchedFiles',{changes:[{uri:pathToFileURL(file).href,type}]})};
}
test('compiler inputs union nested/macro headers and independent tests; unrelated overlays stay outside membership',async t=>{
  const f=await fixture(t,{dynamic:false});
  await fs.writeFile(path.join(f.external,'nested.inc'),'`define WIDTH 6\n');
  await fs.writeFile(path.join(f.project,'.rtl/defs.inc'),'`define FN "nested.inc"\n`include `FN\n');
  const testFile=path.join(f.project,'test.sv');await fs.writeFile(testFile,'module test; top dut(); endmodule\n');
  const project=await loadProject(f.project);project.tests=[{name:'test',top:'test',sources:[testFile],timeoutMs:1000}];
  const other=path.join(f.external,'unrelated.inc'),provider=new SlangProvider(process.env.RTL_SEMANTIC_PYTHON,path.join(root,'language/python/analyze.py'),path.join(f.directory,'direct-cache'));
  const result=await provider.analyze(project,[{file:other,text:'module should_not_leak; endmodule'}]);
  for(const file of [f.file,testFile,path.join(f.project,'.rtl/defs.inc'),path.join(f.external,'nested.inc')])assert.ok(result.inputs.files.some(input=>key(input)===key(file)),file);
  assert.equal(result.inputs.files.some(input=>key(input)===key(other)),false);
  assert.ok(result.inputs.candidates.includes(path.join(f.project,'.rtl/nested.inc')));
  assert.equal(result.modules.find(m=>m.name==='top').ports[0].type,'logic[5:0]');
});

test('interactive editing never flushes pending analysis and coalesces changes behind a gated compiler', async t => {
  const source='module top; logic old_signal; initial $display(old_signal); endmodule\n';
  const f=await fixture(t,{source,semanticSessions:true,interactiveEditing:true});
  await fs.writeFile(f.gate,'hold');
  await until(async()=>(await f.starts()).length>0,async()=>JSON.stringify({status:await f.status(),logs:f.logs}));
  const original=(await f.starts())[0], query=text=>f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position:{line:0,character:text.indexOf('$display(')+9}});
  const latencies=[];
  const fastQuery=async text=>{const start=performance.now();const result=await query(text);latencies.push(performance.now()-start);return result;};
  let timer;
  try { assert.deepEqual(await Promise.race([fastQuery(source),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Completion incorrectly waited for the gated compiler')),3000);})]),{isIncomplete:true,items:[]}); } finally {clearTimeout(timer);}
  let edited=source;
  for(let version=2;version<=12;version++) {
    edited=source.replaceAll('old_signal','latest_signal_'+version);
    await f.connection.sendNotification('textDocument/didChange',{textDocument:{uri:f.uri,version},contentChanges:[{text:edited}]});
    assert.deepEqual(await fastQuery(edited),{isIncomplete:true,items:[]});
  }
  // Let the quiet timer expire while analysis is still blocked: no overlap or
  // per-key process termination, and no stale symbols/diagnostics publication.
  await new Promise(resolve=>setTimeout(resolve,550));
  assert.equal((await f.starts()).length,1); assert.doesNotThrow(()=>process.kill(original.pid,0));
  let [metrics]=await f.connection.sendRequest('rtl/languagePerformance');
  assert.equal(metrics.starts,1); assert.equal(metrics.queued,true); assert.equal(f.ready.length,0);
  await fs.unlink(f.gate);
  await until(()=>f.ready.some(entry=>entry.version===12),f.status);
  assert.ok(f.ready.every(entry=>entry.version===12),'obsolete model must not announce readiness');
  const candidates=await query(edited);
  assert.ok(candidates.some(item=>item.label==='latest_signal_12'));
  assert.ok(!candidates.some(item=>item.label==='old_signal'));
  [metrics]=await f.connection.sendRequest('rtl/languagePerformance');
  assert.equal(metrics.starts,2);assert.equal(metrics.obsolete,1);assert.equal(metrics.queued,false);
  const sorted=[...latencies].sort((a,b)=>a-b);
  await fs.writeFile(path.join(root,'.dev/windows-integrated/pulse-edit-scheduling-measurement.json'),JSON.stringify({platform:process.platform,kind:'gated LSP fixture, not physical editor latency',edits:11,requests:latencies.length,latenciesMs:latencies,p50Ms:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.ceil(sorted.length*.95)-1],analysisJobs:metrics.starts,obsoleteJobs:metrics.obsolete,compilerStarts:(await f.starts()).length},null,2)+'\n');
  assert.equal(await fs.readFile(f.file,'utf8'),source);
  await f.stop();assert.deepEqual(await fs.readdir(path.join(f.directory,'cache')),[]);
});

test('semantic colors and port candidates remain available while a changed compiler model is gated',async t=>{
 const source='`timescale 1ns/1ps\nmodule child(input logic clk,input logic enable,input logic reset); endmodule\nmodule top; child u(.clk()); endmodule\n';
 const f=await fixture(t,{source,semanticSessions:true,interactiveEditing:true,holdModels:true});await until(()=>f.ready.length>0,f.status);
 const tokens=()=>f.connection.sendRequest('textDocument/semanticTokens/full',{textDocument:{uri:f.uri}});
 const original=await tokens();assert.equal(original.data.length,15,'two definitions and the child instance type');
 await fs.writeFile(f.modelGate,'hold');await fs.unlink(f.modelEntered).catch(error=>{if(error.code!=='ENOENT')throw error;});
 const edited=source.replace('.clk()', '.clk(),\n  .');
 await f.connection.sendNotification('textDocument/didChange',{textDocument:{uri:f.uri,version:2},contentChanges:[{text:edited}]});
 const offset=edited.indexOf('\n  .')+4,position={line:edited.slice(0,offset).split('\n').length-1,character:3};
 const query=()=>f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position,context:{triggerKind:2,triggerCharacter:'.'}});
 assert.deepEqual((await tokens()).data,original.data,'dirty request must not erase unchanged semantic colors');
 const began=performance.now(),quick=await query(),dirtyMs=performance.now()-began;assert.equal(quick.isIncomplete,true);
 assert.deepEqual(quick.items.map(item=>item.label).sort(),['enable','reset']);assert.ok(quick.items.every(item=>item.textEdit.newText.endsWith('(${1})$0')));
 await until(()=>fs.access(f.modelEntered).then(()=>true,()=>false),f.status);
 assert.deepEqual((await tokens()).data,original.data,'active rebuild must not erase the mapped snapshot');
 const heldBegan=performance.now(),held=await query(),heldMs=performance.now()-heldBegan;
 assert.deepEqual(held.items.map(item=>item.label).sort(),['enable','reset']);
 await fs.writeFile(path.join(root,'.dev/windows-integrated/pulse-continuity-measurement.json'),JSON.stringify({platform:process.platform,kind:'gated real compiler/LSP fixture, not physical editor or representative project latency',dirtyCompletionMs:dirtyMs,heldRebuildCompletionMs:heldMs,moduleTokens:original.data.length/5,previewCandidates:held.items.length},null,2)+'\n');
 assert.equal(f.ready.some(entry=>entry.version===2),false,'preview must not announce fresh analysis');
 assert.equal(await f.connection.sendRequest('textDocument/hover',{textDocument:{uri:f.uri},position:{line:2,character:14}}),null,'preview is not fresh hover authority');
 await fs.unlink(f.modelGate);await until(()=>f.ready.some(entry=>entry.version===2),f.status);
 assert.equal((await tokens()).data.length,15);assert.deepEqual((await query()).map(item=>item.label).sort(),['enable','reset']);
 // A real dependency event must discard presentation candidates immediately.
 await fs.writeFile(f.modelGate,'hold');await f.watch(f.manifest);
 assert.deepEqual((await tokens()).data,[]);assert.deepEqual(await query(),{isIncomplete:true,items:[]});
 await fs.unlink(f.modelGate);await f.stop();
});

test('project module names complete at a new malformed instance while analysis is gated',async t=>{
 const source='module top;\n  counter u_counter(.clk());\nendmodule\n';
 const f=await fixture(t,{source,semanticSessions:true,interactiveEditing:true,holdModels:true,
   prepare:async({project})=>fs.writeFile(path.join(project,'counter.sv'),'module counter(input logic clk,output logic [7:0] count); endmodule\n')});
 await until(()=>f.ready.length>0,f.status);await fs.writeFile(f.modelGate,'hold');
 const edited=source.replace('endmodule','  counter c1(.clk(), .count())\n  counter ();\n  coun\nendmodule');
 await f.connection.sendNotification('textDocument/didChange',{textDocument:{uri:f.uri,version:2},contentChanges:[{text:edited}]});
 const query=text=>{const offset=text.lastIndexOf('\n  coun')+'\n  coun'.length;return f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position:{line:text.slice(0,offset).split('\n').length-1,character:6}});};
 const quick=await query(edited),items=Array.isArray(quick)?quick:quick.items;
 assert.ok(items.some(item=>item.label==='counter'),'first use at a new position must not depend on a cached completion query');
 assert.equal(items.find(item=>item.label==='counter').textEdit.newText,'counter ${1} (${2});$0');
 assert.equal(items.find(item=>item.label==='counter').kind,7);
 assert.equal(items.filter(item=>item.label==='counter').length,1);
 await fs.unlink(f.modelGate);await until(()=>f.ready.some(entry=>entry.version===2),f.status);
 assert.ok((await query(edited)).some(item=>item.label==='counter'),'parser recovery must not hide known project definitions');
 await fs.unlink(path.join(f.project,'counter.sv'));await f.watch(path.join(f.project,'counter.sv'),3);
 const removed=await query(edited);assert.ok(!(Array.isArray(removed)?removed:removed.items).some(item=>item.label==='counter'),'deleted input cannot retain a project module name');
 await f.stop();
});

test('qualified candidate pool survives identifier typing without joining a compiler rebuild',async t=>{
 const source='package cfg; parameter int WIDTH=8; parameter int DEPTH=4; endpackage\nmodule top; initial $display(cfg::WIDTH); endmodule\n';
 const f=await fixture(t,{source,semanticSessions:true,interactiveEditing:true,holdModels:true});await until(()=>f.ready.length>0,f.status);
 const query=text=>{const offset=text.indexOf('::')+2+(text.includes('::DE')?2:0);return f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position:{line:1,character:offset-text.indexOf('\n')-1}});};
 const initial=await query(source);assert.ok(initial.some(item=>item.label==='DEPTH'));
 await fs.writeFile(f.modelGate,'hold');
 const edited=source.replace('::WIDTH','::DE');await f.connection.sendNotification('textDocument/didChange',{textDocument:{uri:f.uri,version:2},contentChanges:[{text:edited}]});
 const preview=await query(edited);assert.equal(preview.isIncomplete,true);assert.deepEqual(preview.items.map(item=>item.label),initial.map(item=>item.label));
 const changed=edited.replace('cfg::','wrong::');await f.connection.sendNotification('textDocument/didChange',{textDocument:{uri:f.uri,version:3},contentChanges:[{text:changed}]});
 assert.deepEqual(await query(changed),{isIncomplete:true,items:[]},'a different qualifier cannot inherit a cached pool');
 await fs.unlink(f.modelGate);await f.stop();
});

test('automatic package and port trigger requests return full visible candidate pools for local narrowing',async t=>{
 const source='package settings_pkg; parameter int WIDTH=8; typedef logic [7:0] word_t; int counter; endpackage\nmodule child(input logic clk,input logic enable,input logic reset); endmodule\nmodule top; logic local_signal; child u(.clk(),.enable()); initial $display(local_signal,settings_pkg::WIDTH); endmodule\n';
 const f=await fixture(t,{source,semanticSessions:true,interactiveEditing:true});await until(()=>f.ready.length>0,f.status);
 const pos=offset=>({line:source.slice(0,offset).split('\n').length-1,character:offset-(source.lastIndexOf('\n',offset-1)+1)});
 const query=(offset,triggerCharacter)=>f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position:pos(offset),context:{triggerKind:2,triggerCharacter}});
 const ordinary=await query(source.indexOf('$display(local_signal')+'$display(loc'.length,undefined);
 assert.ok(ordinary.some(item=>item.label==='local_signal'));assert.ok(ordinary.some(item=>item.label==='settings_pkg'));assert.ok(ordinary.some(item=>item.label==='child'));
 const pkg=await query(source.indexOf('settings_pkg::WIDTH')+'settings_pkg::'.length,':');
 for(const name of ['WIDTH','word_t','counter'])assert.ok(pkg.some(item=>item.label===name),name);
 const narrowed=await query(source.indexOf('settings_pkg::WIDTH')+'settings_pkg::W'.length,undefined);
 assert.deepEqual(narrowed.map(item=>item.label),pkg.map(item=>item.label),'the editor receives the pool rather than a new prefix-specific subset');
 const ports=await query(source.indexOf('.enable')+'.en'.length,'.');
 assert.ok(ports.some(item=>item.label==='enable'));assert.ok(ports.some(item=>item.label==='reset'));assert.ok(!ports.some(item=>item.label==='clk'));
 assert.ok(ports.every(item=>item.kind===5));
 const editing=source.replace('.enable()', '.');
 await f.connection.sendNotification('textDocument/didChange',{textDocument:{uri:f.uri,version:2},contentChanges:[{text:editing}]});
 await until(()=>f.ready.some(entry=>entry.version===2),f.status);
 const afterDot=await query(editing.indexOf('.clk(),.')+'.clk(),.'.length,'.');
 assert.ok(afterDot.some(item=>item.label==='enable'),'bare dot in an unfinished named connection');
 assert.ok(afterDot.some(item=>item.label==='reset'));assert.ok(!afterDot.some(item=>item.label==='clk'));
 await f.stop();
});

test('interactive warm worker coalesces edits during a rebuild and publishes only the final input model', async t => {
  const source='module top; logic value_1; initial $display(value_1); endmodule\n';
  const f=await fixture(t,{source,semanticSessions:true,interactiveEditing:true,holdModels:true});
  await until(()=>f.ready.length>0,async()=>JSON.stringify({status:await f.status(),logs:f.logs}));
  const starts=(await f.starts()).length,pid=(await f.starts())[0].pid;
  await fs.rm(f.modelEntered,{force:true});await fs.writeFile(f.modelGate,'hold');
  const edit=version=>f.connection.sendNotification('textDocument/didChange',{textDocument:{uri:f.uri,version},contentChanges:[{text:source.replaceAll('value_1','value_'+version)}]});
  await edit(2);await until(()=>fs.stat(f.modelEntered).then(()=>true,()=>false));
  for(let version=3;version<=7;version++)await edit(version);
  await new Promise(resolve=>setTimeout(resolve,550));
  assert.equal((await f.starts()).length,starts);assert.doesNotThrow(()=>process.kill(pid,0));
  assert.deepEqual(await f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position:{line:0,character:source.indexOf('$display')+9}}),{isIncomplete:true,items:[]});
  await fs.unlink(f.modelGate);await until(()=>f.ready.some(entry=>entry.version===7),f.status);
  assert.ok(f.ready.every(entry=>entry.version===1||entry.version===7));
  const result=await f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position:{line:0,character:source.indexOf('$display')+9}});
  assert.ok(result.some(item=>item.label==='value_7'));assert.ok(!result.some(item=>item.label==='value_1'));
  const [metrics]=await f.connection.sendRequest('rtl/languagePerformance');assert.equal(metrics.metrics.processStarts,1);assert.ok(metrics.metrics.rebuilds>=2);assert.equal(metrics.obsolete,1);
  assert.equal((await f.starts()).length,starts);assert.equal(await fs.readFile(f.file,'utf8'),source);
  await f.stop();assert.deepEqual(await fs.readdir(path.join(f.directory,'cache')),[]);
});

test('interactive shutdown joins the active compiler and drops the queued latest edit', async t => {
  const source='module top; logic value; endmodule\n';
  const f=await fixture(t,{source,semanticSessions:true,interactiveEditing:true});
  await fs.writeFile(f.gate,'hold');await until(async()=>(await f.starts()).length>0);
  await f.connection.sendNotification('textDocument/didChange',{textDocument:{uri:f.uri,version:2},contentChanges:[{text:source.replace('value','new_value')}]});
  await new Promise(resolve=>setTimeout(resolve,550));
  await f.stop();assert.equal((await f.starts()).length,1);assert.equal(f.ready.length,0);
  assert.deepEqual(await fs.readdir(path.join(f.directory,'cache')),[]);
});

test('interactive settled models invalidate on headers and malformed configuration without synchronous request builds', async t => {
  const source='`include ".rtl/defs.inc"\nmodule top; logic [`WIDTH-1:0] value; initial $display(value); endmodule\n';
  const f=await fixture(t,{source,semanticSessions:true,interactiveEditing:true});
  await until(()=>f.ready.length>0,async()=>JSON.stringify({status:await f.status(),logs:f.logs}));
  const query=()=>f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position:{line:1,character:source.split('\n')[1].indexOf('$display(')+9}});
  assert.ok((await query()).some(item=>item.label==='value'&&/3:0/.test(item.detail)));
  let count=f.ready.length;
  const header=path.join(f.project,'.rtl/defs.inc');await fs.writeFile(header,'`define WIDTH 9\n');await f.watch(header);
  assert.deepEqual(await query(),{isIncomplete:true,items:[]});
  await until(()=>f.ready.length>count,f.status);
  assert.ok((await query()).some(item=>item.label==='value'&&/8:0/.test(item.detail)));
  const manifest=await fs.readFile(f.manifest,'utf8');count=f.ready.length;
  await fs.writeFile(f.manifest,'invalid !');await f.watch(f.manifest);
  await until(async()=>(await f.status()).label==='Analysis failed');
  assert.deepEqual(await query(),{isIncomplete:true,items:[]});assert.equal(f.ready.length,count);
  await fs.writeFile(f.manifest,manifest);await f.watch(f.manifest);await until(()=>f.ready.length>count,f.status);
  assert.ok((await query()).some(item=>item.label==='value'));
});

test('editor sessions reuse compiler queries and replace models after headers, buffers and configuration change', async t => {
  const source='`include ".rtl/defs.inc"\nmodule top; logic [`WIDTH-1:0] local_signal; initial $display(local_signal); endmodule\n';
  const f=await fixture(t,{source,semanticSessions:true}); await f.hover();
  const query=text=>f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position:{line:1,character:text.split('\n')[1].indexOf('$display(')+9}});
  const before=(await f.starts()).length;
  for(let i=0;i<4;i++) assert.ok((await query(source)).some(item=>item.label==='local_signal'&&/3:0/.test(item.detail)));
  assert.equal((await f.starts()).length,before,'unchanged completion must not start another compiler');
  let [metrics]=await f.connection.sendRequest('rtl/languagePerformance'); assert.equal(metrics.retained,true);assert.equal(metrics.metrics.queries,4);
  const header=path.join(f.project,'.rtl/defs.inc'); await fs.writeFile(header,'`define WIDTH 8\n'); await f.watch(header);
  assert.ok((await query(source)).some(item=>item.label==='local_signal'&&/7:0/.test(item.detail)));
  const edited=source.replaceAll('local_signal','unsaved_signal');
  await f.connection.sendNotification('textDocument/didChange',{textDocument:{uri:f.uri,version:2},contentChanges:[{text:edited}]});
  const candidates=await query(edited);assert.ok(candidates.some(item=>item.label==='unsaved_signal'));assert.ok(!candidates.some(item=>item.label==='local_signal'));
  assert.equal(await fs.readFile(f.file,'utf8'),source);
  const manifest=await fs.readFile(f.manifest,'utf8');await fs.writeFile(f.manifest,'invalid !');await f.watch(f.manifest);
  assert.deepEqual(await query(edited),[]);assert.equal((await f.status()).label,'Analysis failed');
  await fs.writeFile(f.manifest,manifest);await f.watch(f.manifest);assert.ok((await query(edited)).some(item=>item.label==='unsaved_signal'));
  await f.stop();assert.deepEqual(await fs.readdir(path.join(f.directory,'cache')),[]);
});

test('session requests retain conservative one-shot behavior without acknowledged dependency watches', async t => {
  const source='module top; logic local_signal; initial $display(local_signal); endmodule\n';
  const f=await fixture(t,{source,dynamic:false,semanticSessions:true}); await f.hover();
  const query=()=>f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position:{line:0,character:source.indexOf('$display(')+9}});
  const before=(await f.starts()).length; await query();await query();assert.equal((await f.starts()).length-before,2);
  const [metrics]=await f.connection.sendRequest('rtl/languagePerformance');assert.equal(metrics.retained,false);
});
test('new dependency watches are acknowledged before publishing and confirmation rereads race-time header writes',async t=>{
  let replaced=false;
  const f=await fixture(t,{registration:async(params,{project})=>{if(!replaced&&params.registrations[0].registerOptions.watchers.some(w=>w.globPattern.baseUri===pathToFileURL(path.join(project,'.rtl')).href)){replaced=true;await fs.writeFile(path.join(project,'.rtl/defs.inc'),'`define WIDTH 8\n');}}});
  assert.match(JSON.stringify(await f.hover()),/7:0/);assert.ok(replaced);assert.equal((await f.starts()).length,2);
  assert.ok(f.requests.some(r=>r.registrations[0].registerOptions.watchers.some(w=>w.globPattern.pattern==='*'&&w.globPattern.baseUri===pathToFileURL(path.join(f.project,'.rtl')).href)));
  assert.equal((await f.status(pathToFileURL(path.join(f.project,'.rtl/defs.inc')).href)).label,'Ready');
  await f.stop();
});
test('rejected watch registration publishes no Ready result and a later input event can retry',async t=>{
  let rejected=false;
  const f=await fixture(t,{registration:async()=>{if(!rejected){rejected=true;throw Error('watch permission rejected');}}});
  assert.equal(await f.hover(),null);assert.equal((await f.status()).label,'Analysis failed');assert.match((await f.status()).detail,/watch permission rejected/);
  await f.watch(f.manifest);assert.match(JSON.stringify(await f.hover()),/3:0/);assert.equal((await f.status()).label,'Ready');
});
test('external non-RTL includes, nearer header creation, dirty overlay and close update semantics without saving originals',async t=>{
  const f=await fixture(t,{source:'`include "defs.inc"\nmodule top(input logic [`WIDTH-1:0] a); endmodule\n',prepare:({external})=>fs.writeFile(path.join(external,'defs.inc'),'`define WIDTH 4\n')}),header=path.join(f.external,'defs.inc');
  assert.match(JSON.stringify(await f.hover()),/3:0/);
  const externalUri=pathToFileURL(header).href;
  assert.ok(f.requests.some(r=>r.registrations[0].registerOptions.watchers.some(w=>w.globPattern.baseUri===pathToFileURL(f.external).href)));
  await fs.writeFile(header,'`define WIDTH 8\n');await f.watch(header);assert.match(JSON.stringify(await f.hover()),/7:0/);
  await f.connection.sendNotification('textDocument/didOpen',{textDocument:{uri:externalUri,languageId:'plaintext',version:1,text:'`define WIDTH 12\n'}});assert.match(JSON.stringify(await f.hover()),/11:0/);
  await f.connection.sendNotification('textDocument/didClose',{textDocument:{uri:externalUri}});assert.match(JSON.stringify(await f.hover()),/7:0/);assert.equal(await fs.readFile(header,'utf8'),'`define WIDTH 8\n');
  const nearer=path.join(f.project,'defs.inc');await fs.writeFile(nearer,'`define WIDTH 16\n');await f.watch(nearer,1);assert.match(JSON.stringify(await f.hover()),/15:0/);
  await fs.unlink(nearer);await f.watch(nearer,3);assert.match(JSON.stringify(await f.hover()),/7:0/);
});
test('failed include outside search directories remains a watched candidate and recovers on creation',async t=>{
  const f=await fixture(t,{source:'`include "../other/missing.inc"\nmodule top(input logic [`WIDTH-1:0] a); endmodule\n'});
  await f.hover();assert.equal((await f.status()).label,'Source errors');
  const parent=path.join(f.directory,'other'),header=path.join(parent,'missing.inc');assert.ok(f.requests.some(r=>r.registrations[0].registerOptions.watchers.some(w=>w.globPattern.baseUri===pathToFileURL(parent).href)));
  await fs.mkdir(parent);await fs.writeFile(header,'`define WIDTH 10\n');await f.watch(header,1);assert.match(JSON.stringify(await f.hover()),/9:0/);assert.equal((await f.status()).label,'Ready');
});
test('ordinary new RTL glob members and deletions still refresh stored semantic analysis',async t=>{
  const f=await fixture(t);await f.hover();
  const extra=path.join(f.project,'extra.sv');await fs.writeFile(extra,'module extra; endmodule\n');await f.watch(extra,1);await f.hover();assert.equal((await f.status(pathToFileURL(extra).href)).label,'Ready');
  await fs.unlink(extra);await f.watch(extra,3);await f.hover();assert.equal((await f.status(pathToFileURL(extra).href)).label,'Not a listed source');
});
test('shared external headers refresh both roots and removed roots release their watches',async t=>{
  const source='`include "defs.inc"\nmodule top(input logic [`WIDTH-1:0] a); endmodule\n';
  const f=await fixture(t,{source,semanticSessions:true,prepare:({external})=>fs.writeFile(path.join(external,'defs.inc'),'`define WIDTH 4\n')}),second=path.join(f.directory,'second'),secondFile=path.join(second,'code.sv'),secondUri=pathToFileURL(secondFile).href;
  assert.match(JSON.stringify(await f.hover()),/3:0/);
  await fs.mkdir(second);await fs.writeFile(secondFile,source);await fs.writeFile(path.join(second,'rtl.toml'),'version=1\n[project]\nname="second"\n[sources]\nrtl=["*.sv"]\ninclude_dirs=["../external"]\n');
  const folder={uri:pathToFileURL(second).href,name:'second'};
  await f.connection.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[folder],removed:[]}});
  await f.connection.sendNotification('textDocument/didOpen',{textDocument:{uri:secondUri,languageId:'systemverilog',version:1,text:source}});
  const secondHover=()=>f.connection.sendRequest('textDocument/hover',{textDocument:{uri:secondUri},position:{line:1,character:8}});
  // Opening a second document can supersede an in-flight snapshot in either
  // root; wait for both startup generations rather than treating stale null as failure.
  await until(async()=> (await f.status()).label==='Ready'&&(await f.status(secondUri)).label==='Ready',async()=>JSON.stringify({first:await f.status(),second:await f.status(secondUri),logs:f.logs}));
  assert.equal((await f.connection.sendRequest('rtl/languagePerformance')).filter(state=>state.retained).length,2);
  for(const result of await Promise.all([f.hover(),secondHover()]))assert.match(JSON.stringify(result),/3:0/);
  const header=path.join(f.external,'defs.inc'),before=(await f.starts()).length;
  await fs.writeFile(header,'`define WIDTH 6\n');await f.watch(header);
  for(const result of await Promise.all([f.hover(),secondHover()]))assert.match(JSON.stringify(result),/5:0/);
  assert.equal((await f.starts()).length-before,2);
  await f.connection.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[],removed:[folder]}});
  await until(()=>![...f.registrations.values()].some(r=>r.registerOptions.watchers.some(w=>w.globPattern.baseUri===pathToFileURL(second).href)));
  assert.equal((await f.status(secondUri)).label,'Outside workspace');
  const remaining=(await f.starts()).length;await fs.writeFile(header,'`define WIDTH 8\n');await f.watch(header);assert.match(JSON.stringify(await f.hover()),/7:0/);assert.equal((await f.starts()).length-remaining,1);
});
test('active previous handle writes invalidate a cached Project and held queries; explicit recovery restores readiness',async t=>{
  const source='module top; logic local_signal, loc; initial $display(loc); endmodule\n',f=await fixture(t,{source});
  const original=await fs.readFile(f.manifest,'utf8'),revision=createHash('sha256').update(original).digest('hex'),handle=await fs.open(f.manifest,'r+');t.after(()=>handle.close());
  const release=await acquireImportLease(path.join(f.project,'.rtl'));try{await publishImportConfiguration(f.project,revision,original+'# published\n');}finally{await release();}
  await f.watch(f.manifest);await f.hover();assert.equal((await f.status()).label,'Ready');
  const position={line:0,character:source.indexOf('$display(loc')+'$display(loc'.length},query=()=>f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position});
  assert.ok((await query()).some(item=>item.label==='local_signal'));
  await fs.writeFile(f.gate,'held query');const count=(await f.starts()).filter(r=>r.query).length,pending=query();void pending.catch(()=>{});await until(async()=> (await f.starts()).filter(r=>r.query).length>count);
  await handle.write(Buffer.from('!'),0,1,0);await handle.sync();const stat=await handle.stat(),journal=path.join(f.project,'.rtl/import-transactions');let previous;
  for(const name of await fs.readdir(journal)){const candidate=path.join(journal,name,'previous.toml'),entry=await fs.stat(candidate).catch(error=>{if(error.code==='ENOENT')return;throw error;});if(entry?.ino===stat.ino&&entry?.dev===stat.dev)previous=candidate;}
  assert.ok(previous);await handle.close();
  await f.watch(previous);assert.deepEqual(await pending,[]);await f.hover();assert.equal((await f.status()).label,'Analysis failed');assert.match((await f.status()).detail,/설정 복구/);assert.deepEqual(await query(),[]);
  await fs.unlink(f.gate);const [recovery]=await readImportRecovery(f.project);assert.ok(recovery);const active=await fs.readFile(f.manifest);await resolveImportRecovery(f.project,recovery,'current');assert.deepEqual(await fs.readFile(f.manifest),active);
  await f.watch(path.join(path.dirname(previous),'acknowledged.json'),1);await f.hover();const restoredStatus=await f.status();assert.equal(restoredStatus.label,'Ready',JSON.stringify(restoredStatus));assert.ok((await query()).some(item=>item.label==='local_signal'));
});
test('local document changes preserve a held query in an unrelated healthy root',async t=>{
  const source='module top; logic local_signal, loc; initial $display(loc); endmodule\n',f=await fixture(t,{source});await f.hover();
  const second=path.join(f.directory,'second'),file=path.join(second,'code.sv'),uri=pathToFileURL(file).href;await fs.mkdir(second);await fs.writeFile(file,source);
  await fs.writeFile(path.join(second,'rtl.toml'),'version=1\n[project]\nname="peer"\n[sources]\nrtl=["*.sv"]\n');
  await f.connection.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToFileURL(second).href,name:'peer'}],removed:[]}});
  await f.connection.sendNotification('textDocument/didOpen',{textDocument:{uri,languageId:'systemverilog',version:1,text:source}});
  await until(async()=> (await f.status()).label==='Ready'&&(await f.status(uri)).label==='Ready');
  await fs.writeFile(f.gate,'held unrelated completion');const before=(await f.starts()).length,position={line:0,character:source.indexOf('$display(loc')+'$display(loc'.length};
  let settled=false;const peer=f.connection.sendRequest('textDocument/completion',{textDocument:{uri},position});void peer.then(()=>{settled=true;},()=>{settled=true;});
  await until(async()=> (await f.starts()).slice(before).some(row=>row.query&&row.root===second));
  const latest=source.replace('local_signal','local_latest');await f.connection.sendNotification('textDocument/didChange',{textDocument:{uri:f.uri,version:2},contentChanges:[{text:latest}]});
  await until(async()=> (await f.starts()).slice(before).some(row=>!row.query&&row.root===f.project));assert.equal(settled,false,'An unrelated edit must not cancel the peer query');
  await fs.unlink(f.gate);assert.ok((await peer).some(item=>item.label==='local_signal'));
  const result=await f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position:{line:0,character:latest.indexOf('$display(loc')+'$display(loc'.length}});
  assert.ok(result.some(item=>item.label==='local_latest'));assert.equal(await fs.readFile(f.file,'utf8'),source);
});
test('failed external source glob installs its search watch and recovers when a new source is created',async t=>{
  const f=await fixture(t,{prepare:({manifest})=>fs.writeFile(manifest,'version=1\n[project]\nname="late"\n[sources]\nrtl=["*.sv","../late/**/*.sv"]\n')}),late=path.join(f.directory,'late');
  assert.equal(await f.hover(),null);assert.equal((await f.status()).label,'Analysis failed');assert.match((await f.status()).detail,/Source pattern matched no files/);
  assert.ok(f.requests.some(request=>request.registrations[0].registerOptions.watchers.some(w=>w.globPattern.baseUri===pathToFileURL(late).href&&w.globPattern.pattern==='**/*')));
  await fs.mkdir(late);const file=path.join(late,'new.sv');await fs.writeFile(file,'module late; endmodule\n');await f.watch(file,1);
  assert.match(JSON.stringify(await f.hover()),/3:0/);assert.equal((await f.status()).label,'Ready');assert.equal((await f.starts()).at(-1).sourceCount,2);
});
test('configured non-RTL source globs watch new nested members and deletions',async t=>{
  const f=await fixture(t,{prepare:async({project,manifest})=>{await fs.mkdir(path.join(project,'more'));await fs.writeFile(path.join(project,'more/first.inc'),'module first; endmodule\n');await fs.writeFile(manifest,'version=1\n[project]\nname="nonrtl"\n[sources]\nrtl=["*.sv","more/**/*.inc"]\n');}});
  await f.hover();assert.equal((await f.status()).label,'Ready');const parent=path.join(f.project,'more');
  assert.ok(f.requests.some(request=>request.registrations[0].registerOptions.watchers.some(w=>w.globPattern.baseUri===pathToFileURL(parent).href&&w.globPattern.pattern==='**/*')));
  const file=path.join(parent,'deep/new.inc');await fs.mkdir(path.dirname(file));await fs.writeFile(file,'module next; endmodule\n');await f.watch(file,1);await f.hover();assert.equal((await f.starts()).at(-1).sourceCount,3);
  await fs.unlink(file);await f.watch(file,3);await f.hover();assert.equal((await f.starts()).at(-1).sourceCount,2);
});
test('obsolete configuration failure cannot replace current Analyzing status after a held watch acknowledgement',async t=>{
  const entered=deferred(),gate=deferred();let first=true;
  const before=process.env.RTL_H7M_STALE_FAILURE_BEFORE==='1';
  const f=await fixture(t,{before:before?'.dev/cloud/h7m/server-before.ts':false,prepare:({manifest})=>fs.unlink(manifest),registration:async()=>{if(first){first=false;entered.resolve();await gate.promise;}}});
  const old=f.hover();void old.catch(()=>{});await entered.promise;
  await fs.writeFile(f.gate,'hold current Python analysis');await fs.writeFile(f.manifest,'version=1\n[project]\nname="current"\n[sources]\nrtl=["*.sv"]\n');await f.watch(f.manifest);
  const current=f.hover();void current.catch(()=>{});gate.resolve();await until(async()=> (await f.starts()).length>0);
  assert.equal((await f.status()).label,before?'Project not configured':'Analyzing');
  await fs.unlink(f.gate);assert.match(JSON.stringify(await current),/3:0/);assert.equal(await old,null);assert.equal((await f.status()).label,'Ready');
});
test('actual LSP generated burst preserves included generated inputs and journal invalidation',async t=>{
  const receipt={scope:'Same actual IPC LSP/Python fixture, 100 generated notifications, capabilities without dynamic registration; dependency include preserved. This is compilation count, not UI latency.'};
  const compareBefore=process.env.RTL_H7L_COMPARE_BEFORE==='1'; // Explicit diagnostic only; ordinary suite never needs ignored baselines.
  for(const before of [compareBefore]){
    const f=await fixture(t,{before,dynamic:false});assert.match(JSON.stringify(await f.hover()),/3:0/);const initial=(await f.starts()).length;
    for(let i=0;i<100;i++)await f.watch(path.join(f.project,`.rtl/unused-${i}.sv`));assert.match(JSON.stringify(await f.hover()),/3:0/);
    const extra=(await f.starts()).length-initial;assert.equal(extra,before?1:0);receipt[before?'beforeExtraCompilations':'afterExtraCompilations']=extra;
    await fs.writeFile(path.join(f.project,'.rtl/defs.inc'),'`define WIDTH 8\n');await f.watch(path.join(f.project,'.rtl/defs.inc'));assert.match(JSON.stringify(await f.hover()),before?/3:0/:/7:0/);
    receipt[before?'beforeNonRtlHeaderRange':'afterNonRtlHeaderRange']=before?'3:0 (stale)':'7:0';
    const id=randomUUID(),folder=path.join(f.project,'.rtl/import-transactions',id),bytes=await fs.readFile(f.manifest),sha=createHash('sha256').update(bytes).digest('hex');
    await fs.mkdir(folder,{recursive:true});await fs.writeFile(path.join(folder,'previous.toml'),bytes);await fs.writeFile(path.join(folder,'candidate.toml'),bytes);
    await fs.writeFile(path.join(folder,'intent.json'),JSON.stringify({version:1,id,base:sha,next:sha}));await fs.writeFile(path.join(folder,'complete.json'),JSON.stringify({version:1,previous:sha}));
    await loadProject(f.project);assert.deepEqual(await readImportRecovery(f.project),[]);
    await fs.appendFile(path.join(folder,'previous.toml'),'# late writer\n');await f.watch(path.join(folder,'previous.toml'));const hover=await f.hover(),status=await f.status();
    if(before){assert.ok(hover);assert.equal(status.label,'Ready');}else{assert.equal(hover,null);assert.equal(status.label,'Analysis failed');assert.match(status.detail,/설정 복구/);}
    receipt[before?'beforeJournalStatus':'afterJournalStatus']=status.label;assert.equal((await readImportRecovery(f.project)).length,1);
    await f.stop();
  }
  await fs.mkdir(path.join(root,'.dev/cloud'),{recursive:true});
  await fs.writeFile(path.join(root,`.dev/cloud/h7l-inputs-${compareBefore?'before':'after'}.json`),JSON.stringify(receipt,null,2));
});

test('inline object/function macros permit compiler-backed signals, package completion and signatures after the call',async t=>{
  const source='`define W 4\n`define ID(x) (x)\npackage p; parameter int VALUE=9; endpackage\nmodule top; logic [`W-1:0] a; int fresh_common; function int add(input int left,input int right); return left+right; endfunction initial begin int copy=`ID((1)); $display(fresh_common); $display(add(1,2)); $display(p::VALUE); end endmodule\n';
  const f=await fixture(t,{source});await f.hover();
  const position=offset=>{const lines=source.slice(0,offset).split('\n');return{line:lines.length-1,character:lines.at(-1).length};};
  const entries=await f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position:position(source.indexOf('$display(fresh')+'$display(fre'.length)});
  assert.ok(entries.some(e=>e.label==='fresh_common'),JSON.stringify(entries));
  const pkg=await f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position:position(source.indexOf('p::VALUE')+'p::V'.length)});assert.ok(pkg.some(e=>e.label==='VALUE'));
  const signature=await f.connection.sendRequest('textDocument/signatureHelp',{textDocument:{uri:f.uri},position:position(source.indexOf('add(1,2)')+'add(1,'.length)});
  assert.ok(signature.signatures[0].label.includes('right'));assert.equal(signature.activeParameter,1);
  const before=(await f.starts()).length,inside=source.indexOf('`ID((1)')+'`ID((1'.length;
  assert.deepEqual(await f.connection.sendRequest('textDocument/completion',{textDocument:{uri:f.uri},position:position(inside)}),[]);assert.equal((await f.starts()).length,before);
});
test('an ENOENT include directory mentioning rtl.toml is Analysis failed, then fixes recover normally',async t=>{
  const missing='rtl.toml-missing-include';
  const before=process.env.RTL_H7O_CLASSIFICATION_BEFORE==='1'; // Private expected-fault diagnostic only.
  const f=await fixture(t,{before:before?'.dev/cloud/h7o/server-before.ts':false,prepare:({manifest})=>fs.writeFile(manifest,'version=1\n[project]\nname="paths"\n[sources]\nrtl=["*.sv"]\ninclude_dirs=["'+missing+'"]\n')});
  assert.equal(await f.hover(),null);assert.equal((await f.status()).label,before?'Project not configured':'Analysis failed');
  await fs.mkdir(path.join(f.project,missing));await f.watch(path.join(f.project,missing),1);assert.match(JSON.stringify(await f.hover()),/3:0/);assert.equal((await f.status()).label,'Ready');
});
test('manifest creation during recovery-watch acknowledgement is reread before settling Project not configured',async t=>{
  let written=false;
  const f=await fixture(t,{prepare:({manifest})=>fs.unlink(manifest),registration:async(params,{project})=>{
    if(!written&&params.registrations[0].registerOptions.watchers.some(w=>w.globPattern.baseUri===pathToFileURL(project).href&&w.globPattern.pattern==='*')){
      written=true;await fs.writeFile(path.join(project,'rtl.toml'),'version=1\n[project]\nname="ack-race"\n[sources]\nrtl=["*.sv"]\n');
    }
  }});
  assert.match(JSON.stringify(await f.hover()),/3:0/);assert.equal((await f.status()).label,'Ready');assert.equal(written,true);
});
test('deleting a healthy manifest releases old include watches, ignores edits, and ancestor/journal events can restore or fail safely',async t=>{
  const f=await fixture(t);await f.hover();await fs.unlink(f.manifest);await f.watch(f.manifest,3);await f.hover();assert.equal((await f.status()).label,'Project not configured');
  assert.ok(![...f.registrations.values()].some(r=>r.registerOptions.watchers.some(w=>w.globPattern.baseUri===pathToFileURL(f.external).href)));
  const before=(await f.starts()).length;
  await f.connection.sendNotification('textDocument/didChange',{textDocument:{uri:f.uri,version:2},contentChanges:[{text:f.source.replace('a);','fresh);')}]});await f.hover();assert.equal((await f.status()).label,'Project not configured');assert.equal((await f.starts()).length,before);
  // Restore on the ancestor notification rather than relying on a manifest event.
  await fs.writeFile(f.manifest,'version=1\n[project]\nname="ancestor"\n[sources]\nrtl=["*.sv"]\n');await f.watch(f.project,1);assert.match(JSON.stringify(await f.hover()),/3:0/);assert.equal((await f.status()).label,'Ready');
  await fs.unlink(f.manifest);await f.watch(f.manifest,3);await f.hover();
  const unknown=path.join(f.project,'.rtl/import-transactions/unknown');await fs.mkdir(unknown,{recursive:true});await fs.writeFile(path.join(unknown,'intent.json'),'{}');await f.watch(unknown,1);await f.hover();assert.equal((await f.status()).label,'Analysis failed');
  await fs.rm(unknown,{recursive:true});await fs.writeFile(f.manifest,'version=1\n[project]\nname="journal-restored"\n[sources]\nrtl=["*.sv"]\n');await f.watch(f.manifest,1);assert.match(JSON.stringify(await f.hover()),/3:0/);assert.equal((await f.status()).label,'Ready');
});
test('unsaved plain-text static RTL headers survive absent-manifest recovery without retaining their filesystem watches',async t=>{
  const source='`include "defs.vh"\nmodule top(input logic [`WIDTH-1:0] a); endmodule\n';
  const f=await fixture(t,{source,prepare:({project})=>fs.writeFile(path.join(project,'defs.vh'),'`define WIDTH 4\n')});
  assert.match(JSON.stringify(await f.hover()),/3:0/);const header=path.join(f.project,'defs.vh'),uri=pathToFileURL(header).href;
  await fs.unlink(f.manifest);await f.watch(f.manifest,3);await f.hover();assert.equal((await f.status()).label,'Project not configured');
  const before=(await f.starts()).length;
  await f.connection.sendNotification('textDocument/didOpen',{textDocument:{uri,languageId:'plaintext',version:1,text:'`define WIDTH 8\n'}});await f.hover();assert.equal((await f.starts()).length,before);
  await fs.writeFile(f.manifest,'version=1\n[project]\nname="plain-header"\n[sources]\nrtl=["*.sv"]\n');await f.watch(f.manifest,1);assert.match(JSON.stringify(await f.hover()),/7:0/);assert.equal((await f.status()).label,'Ready');
  assert.equal(await fs.readFile(header,'utf8'),'`define WIDTH 4\n');await f.connection.sendNotification('textDocument/didClose',{textDocument:{uri}});assert.match(JSON.stringify(await f.hover()),/3:0/);
});
