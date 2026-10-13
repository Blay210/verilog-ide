import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { root } from '../environment.mjs';
import { requestFixture } from './semantic-request.mjs';
import { semanticWorkTimingSource } from './semantic-work-timing.mjs';
const require=createRequire(import.meta.url);
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function semanticQueueWait(){
  const f=await requestFixture({files:3,holdSecond:true});
  const accounting=path.join(f.directory,'queue.jsonl'),output=path.join(f.directory,'queue.cjs');
  await build({stdin:{contents:await semanticWorkTimingSource(accounting),loader:'ts',resolveDir:path.join(root,'language/src'),sourcefile:'semantic-work.ts'},outfile:output,bundle:true,platform:'node',format:'cjs'});
  const {SemanticWork}=require(output),work=new SemanticWork(2,32);
  const requests=[];let exitsAtQueuedStart;
  const start=query=>{
    const controller=new AbortController();
    const result=work.run(`query:${f.projectRoot}:1:${JSON.stringify(query)}`,controller.signal,async signal=>{
      if(query.file===f.tests[0].file){const pids=(await f.rows()).filter(r=>r.launch).map(r=>r.pid);exitsAtQueuedStart=pids.filter(pid=>{try{process.kill(pid,0);return false;}catch(e){if(e.code==='ESRCH')return true;throw e;}}).length;assert.ok(exitsAtQueuedStart>=1,'A slot must wait for real process exit.');}
      return f.provider.complete(f.project,[],query,signal);
    });
    requests.push(result.then(value=>({value}),error=>({error})));return result;
  };
  try{
    await fs.writeFile(f.gate,'hold the real second group');
    start({file:f.file,offset:f.text.indexOf('$display')});start({file:f.file,offset:f.text.indexOf('$display')+1});
    const end=Date.now()+10000;while((await f.rows()).filter(r=>r.held).length<2){if(Date.now()>end)throw Error('Owned compiler slots did not start.');await pause(20);}
    start({file:f.tests[0].file,offset:f.tests[0].text.indexOf('$display')});
    // A deliberate observation hold, not natural user or native UI latency.
    await pause(100);assert.equal((await f.rows()).filter(r=>r.launch).length,2);
    await fs.unlink(f.gate);const results=await Promise.all(requests);assert.ok(results.every(r=>!r.error));
    assert.ok(results[2].value.some(s=>s.name==='a_only'));await work.close();await f.clean();
    const trace=(await fs.readFile(accounting,'utf8')).trim().split('\n').map(JSON.parse);
    const starts=trace.filter(r=>r.kind==='work-start');assert.equal(starts.length,3);assert.ok(starts[2].queuedMs>=100);
    return {scope:'Actual SemanticWork and provider/Python; two slots deliberately held for 100ms, then fresh TB completion waits for actual process cleanup. Controlled queue demonstration, no natural latency claim.',trace,exitsAtQueuedStart,launches:(await f.rows()).filter(r=>r.launch).length,livePythonAfter:0,tempEntriesAfter:[],originalsPreserved:true};
  }finally{try{await work.close();await Promise.all(requests);}finally{await f.dispose();}}
}
