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

async function fixture(t,{source='`include ".rtl/defs.inc"\nmodule top(input logic [`WIDTH-1:0] a); endmodule\n',dynamic=true,before=false,registration,prepare}={}) {
  const python=process.env.RTL_SEMANTIC_PYTHON;assert.ok(python,'Use the verified existing runtime; no silent skip.');
  const directory=await fs.mkdtemp(path.join(root,'.dev/h7l-lsp-')),project=path.join(directory,'project'),external=path.join(directory,'external'),cache=path.join(directory,'cache');
  await fs.mkdir(path.join(project,'.rtl'),{recursive:true});await fs.mkdir(external);
  const file=path.join(project,'code.sv'),manifest=path.join(project,'rtl.toml'),uri=pathToFileURL(file).href;
  await fs.writeFile(file,source);await fs.writeFile(path.join(project,'.rtl/defs.inc'),'`define WIDTH 4\n');
  await fs.writeFile(manifest,'version=1\n[project]\nname="inputs"\n[sources]\nrtl=["*.sv"]\ninclude_dirs=["../external"]\n');
  await prepare?.({project,external,file,manifest});
  const bridge=path.join(directory,'bridge.py'),gate=path.join(directory,'hold');
  await fs.writeFile(bridge,`import os,sys,json,time,runpy\nwith open(sys.argv[1]) as f: request=json.load(f)\nwith open(${JSON.stringify(path.join(directory,'starts.jsonl'))},'a') as f: f.write(json.dumps({'pid':os.getpid(),'query':bool(request.get('query')),'root':os.getcwd(),'sourceCount':len(request['sources'])})+'\\n')\nwhile os.path.exists(${JSON.stringify(gate)}): time.sleep(0.02)\nsys.argv[0]=${JSON.stringify(path.join(root,'language/python/analyze.py'))}\nrunpy.run_path(sys.argv[0],run_name='__main__')\n`);
  const server=path.join(directory,'server.cjs'),contents=await fs.readFile(path.join(root,before?(typeof before==='string'?before:'.dev/cloud/h7l/server-before.ts'):'language/src/server.ts'),'utf8');
  await build({stdin:{contents,loader:'ts',resolveDir:path.join(root,'language/src'),sourcefile:'server.ts'},outfile:server,bundle:true,platform:'node',format:'cjs'});
  const child=fork(server,['--node-ipc',`--clientProcessId=${process.pid}`],{silent:true,execArgv:[]});const exited=once(child,'close');let stderr='';child.stderr.on('data',bytes=>{stderr=(stderr+bytes).slice(-16000);});
  const connection=createProtocolConnection(new IPCMessageReader(child),new IPCMessageWriter(child));const registrations=new Map(),requests=[];
  const logs=[];connection.onNotification('window/logMessage',entry=>logs.push(entry.message));connection.onNotification('textDocument/publishDiagnostics',()=>{});
  connection.onRequest('client/registerCapability',async params=>{requests.push(params);await registration?.(params,{project,external});for(const item of params.registrations)registrations.set(item.id,item);return null;});
  connection.onRequest('client/unregisterCapability',params=>{for(const item of params.unregisterations)assert.equal(registrations.delete(item.id),true);return null;});connection.listen();
  const starts=async()=>fs.readFile(path.join(directory,'starts.jsonl'),'utf8').then(text=>text.trim().split('\n').filter(Boolean).map(JSON.parse)).catch(error=>{if(error.code==='ENOENT')return[];throw error;});
  const stop=async()=>{if(child.exitCode!==null)return;await connection.sendRequest('rtl/prepareShutdown');assert.equal(registrations.size,0);await connection.sendRequest('shutdown');await connection.sendNotification('exit');await exited;assert.equal(child.exitCode,0,stderr);for(const {pid}of await starts())assert.throws(()=>process.kill(pid,0),{code:'ESRCH'});assert.deepEqual((await fs.readdir(cache).catch(e=>{if(e.code==='ENOENT')return[];throw e;})).filter(n=>/^(analysis|dependencies)-/.test(n)),[]);};
  t.after(async()=>{try{await stop();}finally{connection.dispose();await fs.rm(directory,{recursive:true,force:true});}});
  await connection.sendRequest('initialize',{processId:process.pid,workspaceFolders:[{uri:pathToFileURL(project).href,name:'inputs'}],capabilities:{workspace:{workspaceFolders:true,...(dynamic?{didChangeWatchedFiles:{dynamicRegistration:true,relativePatternSupport:true}}:{})}},initializationOptions:{python,bridge,cache}});
  await connection.sendNotification('initialized',{});await connection.sendNotification('textDocument/didOpen',{textDocument:{uri,languageId:'systemverilog',version:1,text:source}});
  return {directory,project,external,file,manifest,uri,source,connection,registrations,requests,starts,gate,stop,logs,
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
  const f=await fixture(t,{source,prepare:({external})=>fs.writeFile(path.join(external,'defs.inc'),'`define WIDTH 4\n')}),second=path.join(f.directory,'second'),secondFile=path.join(second,'code.sv'),secondUri=pathToFileURL(secondFile).href;
  assert.match(JSON.stringify(await f.hover()),/3:0/);
  await fs.mkdir(second);await fs.writeFile(secondFile,source);await fs.writeFile(path.join(second,'rtl.toml'),'version=1\n[project]\nname="second"\n[sources]\nrtl=["*.sv"]\ninclude_dirs=["../external"]\n');
  const folder={uri:pathToFileURL(second).href,name:'second'};
  await f.connection.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[folder],removed:[]}});
  await f.connection.sendNotification('textDocument/didOpen',{textDocument:{uri:secondUri,languageId:'systemverilog',version:1,text:source}});
  const secondHover=()=>f.connection.sendRequest('textDocument/hover',{textDocument:{uri:secondUri},position:{line:1,character:8}});
  // Opening a second document can supersede an in-flight snapshot in either
  // root; wait for both startup generations rather than treating stale null as failure.
  await until(async()=> (await f.status()).label==='Ready'&&(await f.status(secondUri)).label==='Ready',async()=>JSON.stringify({first:await f.status(),second:await f.status(secondUri),logs:f.logs}));
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
  await f.watch(path.join(path.dirname(previous),'acknowledged.json'),1);await f.hover();assert.equal((await f.status()).label,'Ready');assert.ok((await query()).some(item=>item.label==='local_signal'));
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
