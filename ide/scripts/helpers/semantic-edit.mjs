import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createProtocolConnection, IPCMessageReader, IPCMessageWriter } from 'vscode-languageserver/node.js';
import { root } from '../environment.mjs';
import { requestFixture } from './semantic-request.mjs';
import { semanticWorkTimingSource } from './semantic-work-timing.mjs';
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function semanticEdit({ before=false,files=300,routingBefore=false,macroBefore=false,inline=false,bridgeBaseline=false,providerBaseline=false,timing=false }={}) {
  const f=await requestFixture({files,baseline:providerBaseline||before,bridgeBaseline});
  const others=['missing','malformed'].map(name=>path.join(f.directory,name));
  for(const folder of others){await fs.mkdir(folder);await fs.writeFile(path.join(folder,'code.sv'),'module simple; endmodule\n');}
  await fs.writeFile(path.join(others[1],'rtl.toml'),'broken = [');
  const accounting=path.join(f.directory,'accounting.jsonl'),server=path.join(f.directory,'server.cjs');
  const entry=path.join(root,routingBefore?'.dev/cloud/h7o/server-before.ts':'language/src/server.ts');
  let contents=await fs.readFile(entry,'utf8');const signature='async function snapshot(uri: string) {';assert.equal(contents.split(signature).length,2);
  contents=contents.replace(signature,`async function snapshot(uri: string) { const started=performance.now();try{return await measuredSnapshot(uri);}finally{await record('snapshot',started,uri);} }\nasync function measuredSnapshot(uri: string) {`);
  contents=`import {appendFile as profileAppend} from 'node:fs/promises';async function record(kind:string,started:number,root:string){await profileAppend(${JSON.stringify(accounting)},JSON.stringify({kind,root,wallMs:performance.now()-started})+'\\n');}\n`+contents;
  await build({stdin:{contents,loader:'ts',resolveDir:path.join(root,'language/src'),sourcefile:'server.ts'},outfile:server,bundle:true,platform:'node',format:'cjs',plugins:[{name:'private-request-accounting',setup(builder){
    builder.onResolve({filter:/^\.\.\/\.\.\/runtime\/core\/index$/},()=>({path:'core',namespace:'accounting'}));
    builder.onLoad({filter:/.*/,namespace:'accounting'},()=>({contents:`export * from ${JSON.stringify(path.join(root,'runtime/core/index.ts'))};import {loadProject as realLoad} from ${JSON.stringify(path.join(root,'runtime/core/index.ts'))};import {appendFile} from 'node:fs/promises';export async function loadProject(...args){const started=performance.now();try{return await realLoad(...args);}finally{await appendFile(${JSON.stringify(accounting)},JSON.stringify({kind:'core-load',root:args[0],wallMs:performance.now()-started})+'\\n');}}`,loader:'ts',resolveDir:root}));
    builder.onResolve({filter:/^\.\.\/\.\.\/runtime\/semantic\/index$/},()=>({path:'semantic',namespace:'providers'}));
    builder.onLoad({filter:/.*/,namespace:'providers'},()=>({contents:`export * from ${JSON.stringify(path.join(root,'runtime/semantic/index.ts'))};import {SlangProvider as Real} from ${JSON.stringify(path.join(root,'runtime/semantic/index.ts'))};import {appendFile} from 'node:fs/promises';export class SlangProvider extends Real{async analyze(...args){const started=performance.now();try{return await super.analyze(...args);}finally{await appendFile(${JSON.stringify(accounting)},JSON.stringify({kind:'provider-analysis',root:args[0].root,wallMs:performance.now()-started})+'\\n');}}async complete(...args){const started=performance.now();try{return await super.complete(...args);}finally{await appendFile(${JSON.stringify(accounting)},JSON.stringify({kind:'provider-complete',root:args[0].root,wallMs:performance.now()-started})+'\\n');}}}`,loader:'ts',resolveDir:root}));
    if(routingBefore)builder.onResolve({filter:/^\.\/input-events$/},()=>({path:path.join(root,'.dev/cloud/h7o/input-events-before.ts')}));
    if(macroBefore)builder.onLoad({filter:/runtime[\\/]semantic[\\/]lexical\.ts$/},async()=>({contents:await fs.readFile(path.join(root,'.dev/cloud/h7o/lexical-before.ts'),'utf8'),loader:'ts',resolveDir:path.join(root,'runtime/semantic')}));
    if(timing)builder.onLoad({filter:/language[\\/]src[\\/]semantic-work\.ts$/},async()=>({contents:await semanticWorkTimingSource(accounting),loader:'ts',resolveDir:path.join(root,'language/src')}));
    if(providerBaseline)builder.onLoad({filter:/runtime[\\/]semantic[\\/]slang\.ts$/},async()=>({contents:await fs.readFile(path.join(root,providerBaseline),'utf8'),loader:'ts',resolveDir:path.join(root,'runtime/semantic')}));
    if(before)builder.onLoad({filter:/runtime[\\/]semantic[\\/]slang\.ts$/},async()=>({contents:await fs.readFile(path.join(root,'.dev/cloud/h7n/slang-before.ts'),'utf8'),loader:'ts',resolveDir:path.join(root,'runtime/semantic')}));
  }}]});
  const child=fork(server,['--node-ipc',`--clientProcessId=${process.pid}`],{silent:true,execArgv:[]}),exited=once(child,'close');
  let stderr='';child.stderr.on('data',bytes=>{stderr=(stderr+bytes).slice(-16000);});
  const connection=createProtocolConnection(new IPCMessageReader(child),new IPCMessageWriter(child));const registrations=new Map(),logs=[];
  connection.onNotification('textDocument/publishDiagnostics',()=>{});connection.onNotification('window/logMessage',v=>logs.push(v.message));
  connection.onRequest('client/registerCapability',params=>{for(const v of params.registrations)registrations.set(v.id,v);return null;});
  connection.onRequest('client/unregisterCapability',params=>{for(const v of params.unregisterations)assert.equal(registrations.delete(v.id),true);return null;});connection.listen();
  const uri=pathToFileURL(f.file).href,uris=[uri,...others.map(folder=>pathToFileURL(path.join(folder,'code.sv')).href)];
  const status=index=>connection.sendRequest('rtl/languageStatus',{uri:uris[index]});
  const until=async condition=>{const end=Date.now()+20000;while(Date.now()<end){if(await condition())return;await pause(20);}throw Error('Edit accounting did not settle: '+logs.join('\n')+' '+stderr);};
  const jsonRows=()=>fs.readFile(accounting,'utf8').then(s=>s.trim().split('\n').filter(Boolean).map(JSON.parse)).catch(e=>{if(e.code==='ENOENT')return[];throw e;});
  const notify=file=>connection.sendNotification('workspace/didChangeWatchedFiles',{changes:[{uri:pathToFileURL(file).href,type:2}]});
  const receipt={mode:providerBaseline||typeof bridgeBaseline==='string'?'private provider/bridge baseline':routingBefore||macroBefore?'H7N baseline':bridgeBaseline?'H7O bridge':before?'H7M provider/current server':'H7S',files,scope:'Actual IPC/provider/Python with healthy, absent-manifest and malformed roots; controlled notifications and acknowledged modeled registrations. No native watcher/frame claim.',phases:[]};
  const digest=async file=>createHash('sha256').update(await fs.readFile(file)).digest('hex');
  receipt.sources={...f.sources,server:await digest(entry),events:await digest(path.join(root,routingBefore?'.dev/cloud/h7o/input-events-before.ts':'language/src/input-events.ts')),lexer:await digest(path.join(root,macroBefore?'.dev/cloud/h7o/lexical-before.ts':'runtime/semantic/lexical.ts')),core:await digest(path.join(root,'runtime/core/config.ts')),helper:await digest(path.join(root,'scripts/helpers/semantic-edit.mjs'))};
  const stop=async()=>{if(child.exitCode!==null)return;assert.deepEqual(await connection.sendRequest('rtl/prepareShutdown'),{ready:true});assert.equal(registrations.size,0);await connection.sendRequest('shutdown');await connection.sendNotification('exit');await exited;assert.equal(child.exitCode,0,stderr);};
  const phase=async(name,operation)=>{const start=(await f.rows()).length,index=(await jsonRows()).length,clock=performance.now();await operation();const wallMs=performance.now()-clock;receipt.phases.push({name,wallMs,launches:(await f.rows()).slice(start).filter(row=>row.launch).length,accounting:(await jsonRows()).slice(index)});};
  try{
    await phase('mixed-startup',async()=>{
      await connection.sendRequest('initialize',{processId:process.pid,workspaceFolders:[f.projectRoot,...others].map(folder=>({uri:pathToFileURL(folder).href,name:path.basename(folder)})),capabilities:{workspace:{workspaceFolders:true,didChangeWatchedFiles:{dynamicRegistration:true,relativePatternSupport:true}}},initializationOptions:{python:process.env.RTL_SEMANTIC_PYTHON,bridge:f.bridge,cache:f.cache}});
      await connection.sendNotification('initialized',{});await connection.sendNotification('textDocument/didOpen',{textDocument:{uri,languageId:'systemverilog',version:1,text:f.text}});
      await until(async()=> (await status(0)).label==='Ready'&&(await status(1)).label==='Project not configured'&&(await status(2)).label==='Analysis failed');
    });
    receipt.mixedPatterns=[...registrations.values()].flatMap(v=>v.registerOptions.watchers).filter(w=>others.some(folder=>w.globPattern.baseUri===pathToFileURL(folder).href));
    const recoveryPatterns=()=>[...registrations.values()].flatMap(v=>v.registerOptions.watchers).filter(w=>[others[0],path.dirname(others[0])].some(folder=>w.globPattern.baseUri===pathToFileURL(folder).href));
    receipt.missingRecoveryPatterns=recoveryPatterns();
    if(!routingBefore)assert.ok(receipt.missingRecoveryPatterns.every(w=>w.globPattern.pattern==='*'));
    // The inline variant reproduces the original H7N macro-context failure.
    const text=f.text.replace('logic [W-1:0] local_value;',inline?'int fresh_common;':'\nint fresh_common;').replace('$display(local_value)','$display(fresh_common)');
    const offset=text.indexOf('$display(fresh_common')+'$display(fresh'.length,prefix=text.slice(0,offset).split('\n');
    await phase('edit-to-completion',async()=>{
      await connection.sendNotification('textDocument/didChange',{textDocument:{uri,version:2},contentChanges:[{text}]});
      const result=await connection.sendRequest('textDocument/completion',{textDocument:{uri},position:{line:prefix.length-1,character:prefix.at(-1).length}});
      receipt.inlineCompletion=result.some(v=>v.label==='fresh_common');
      assert.equal(receipt.inlineCompletion,!(inline&&macroBefore),JSON.stringify({result,logs,status:await status(0)}));assert.ok(!result.some(v=>v.label==='local_value'));
      assert.equal((await status(0)).label,'Ready');
    });
    await phase('100 unrelated events in mixed roots',async()=>{
      const previous=(await jsonRows()).filter(r=>r.kind==='core-load').length;
      for(let i=0;i<100;i++)await notify(path.join(others[i%2],`notes/change-${i}.js`));
      await until(async()=> (await jsonRows()).filter(r=>r.kind==='core-load').length>=previous+(routingBefore?2:1)&&(await status(1)).label==='Project not configured'&&(await status(2)).label==='Analysis failed');
    });
    assert.equal(receipt.phases.at(-1).launches,0);
    assert.equal(receipt.phases.at(-1).accounting.filter(r=>r.kind==='core-load').length,routingBefore?2:1,'Only roots with unknown/broken configuration retry on unrelated events.');
    await phase('idle and 20 status queries',async()=>{await pause(500);for(let i=0;i<20;i++)await status(i%3);});assert.equal(receipt.phases.at(-1).launches,0);assert.deepEqual(receipt.phases.at(-1).accounting,[]);
    await phase('create and repair manifests',async()=>{
      for(const folder of others){await fs.writeFile(path.join(folder,'rtl.toml'),'version=1\n[project]\nname="recovered"\n[sources]\nrtl=["*.sv"]\n');await notify(path.join(folder,'rtl.toml'));}
      await until(async()=> (await status(1)).label==='Ready'&&(await status(2)).label==='Ready');
    });
    receipt.recoveryPatternsAfterRepair=recoveryPatterns();assert.deepEqual(receipt.recoveryPatternsAfterRepair,[]);
    await stop();await f.clean();receipt.livePythonAfter=0;receipt.registrationsAfter=0;receipt.parentExit=0;receipt.originalsPreserved=true;return receipt;
  }finally{try{await stop();}finally{connection.dispose();await f.dispose();}}
}
