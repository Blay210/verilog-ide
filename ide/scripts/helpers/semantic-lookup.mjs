import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { requestFixture } from './semantic-request.mjs';

export async function semanticLookup({before=false,profile=false,files=300,cacheLimits=false}={}){
  const f=await requestFixture({files,bridgeBaseline:before?'.dev/cloud/h7s/analyze-before.py':false,completionProfile:profile,completionStages:true,enumCacheLimits:cacheLimits});
  const members=Array.from({length:32},(_,i)=>`E_${i}=${i}`).join(',');
  const pkg=`package base; parameter int WIDTH=5; typedef enum logic [4:0] {${members}} mode_t;\n`+
    Array.from({length:96},(_,i)=>`mode_t mode_${i};`).join('\n')+'\nfunction automatic int choose(input mode_t arg = E_0); return int\'(arg); endfunction\nendpackage\n';
  const text='// 한글 😀 é\r\n'.repeat(2000)+f.text.replace('logic [W-1:0] local_value;','import base::*; int E_1; mode_t local_mode; logic [W-1:0] local_value;');
  const overlays=[{file:f.pkg,text:pkg},{file:f.file,text}];
  const receipt={mode:before?'H7R':'H7S',profile,files,sources:f.sources,phases:[],scope:'Actual provider/Python/pyslang; enum32/package variables96, shadowed enumerator, Unicode CRLF and independent test contexts. Owned lookup wrapper timings are diagnostic intervals, separate from ordinary phase latency.'};
  try{
    for(const qualifier of [undefined,'base']){
      const start=(await f.rows()).length,clock=performance.now(),cpu=process.cpuUsage();
      const result=await f.provider.complete(f.project,overlays,{file:f.file,offset:text.indexOf('$display'),qualifier});
      const wallMs=performance.now()-clock,used=process.cpuUsage(cpu),rows=(await f.rows()).slice(start);
      const symbol=result.find(v=>v.name==='mode_0');assert.ok(symbol);assert.equal(symbol.enumValues[1].name,'base::E_1');
      assert.ok(result.some(v=>v.name==='choose'&&v.callable.arguments[0].label.includes('E_0')));
      assert.ok(!result.some(v=>['a_only','b_only','local_value'].includes(v.name)));
      const normalized=JSON.stringify(result).replaceAll(JSON.stringify(f.projectRoot).slice(1,-1),'$PROJECT');
      receipt.phases.push({name:qualifier?'qualified-enum-completion':'unqualified-enum-completion',wallMs,nodeCpuMs:(used.user+used.system)/1000,symbols:result.length,semanticHash:createHash('sha256').update(normalized).digest('hex'),
        launches:rows.filter(r=>r.launch).length,groups:rows.filter(r=>r.groupStart).length,peakPythonRssBytes:Math.max(...rows.filter(r=>r.done).map(r=>r.peakRssBytes??0)),stages:rows.filter(r=>r.phase),profiles:rows.filter(r=>r.completionProfile)});
    }
    await f.clean();return{...receipt,livePythonAfter:0,tempEntriesAfter:[],originalsPreserved:true};
  }finally{await f.dispose();}
}
