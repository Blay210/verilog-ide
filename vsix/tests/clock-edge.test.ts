import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {parseVcd,queryClockEdge} from '@rtl-dev/waveform';
import {WaveformSession} from '@rtl-dev/waveform/client';
const header='$timescale 1ps $end $scope module tb $end $var wire 1 ! clk $end $var wire 1 ! alias $end $var wire 2 " bus $end $var real 1 % real_clock $end $upscope $end $enddefinitions $end ';
const data=parseVcd(header+'#0 1! #2 x! #3 1! #4 0! #5 z! #6 0! #7 1! #8 0! #9 1! #10');
test('strict clock edges exclude initial/XZ and current tick, support rising/falling and aliases',()=>{
  const find=(time:string,direction:-1|1,edge:'rising'|'falling')=>queryClockEdge(data,{signal:'0',time,direction,edge}).time;
  assert.equal(find('0',1,'rising'),'7');assert.equal(find('7',1,'rising'),'9');
  assert.equal(find('9',-1,'rising'),'7');assert.equal(find('7',-1,'rising'),undefined);
  assert.equal(find('0',1,'falling'),'4');assert.equal(find('8',-1,'falling'),'4');
  assert.equal(find('10',1,'rising'),undefined);assert.equal(find('0',-1,'falling'),undefined);
  assert.equal(queryClockEdge(data,{signal:'1',time:'0',direction:1,edge:'rising'}).time,'7');
});
test('clock query rejects unknown, bus/real, invalid bounds/direction/edge and continuation',()=>{
  const request={signal:'0',time:'0',direction:1 as const,edge:'rising' as const};
  for(const patch of [{signal:'missing'},{signal:'2'},{signal:'3'},{time:'11'},{time:'-1'},{direction:0},{edge:'both'},{offset:-1},{offset:999},{offset:1.5}]) assert.throws(()=>queryClockEdge(data,{...request,...patch} as any));
  const zero=parseVcd(header+'#0 0!');assert.equal(queryClockEdge(zero,request).time,undefined);
});
test('large timestamps remain exact; same tick updates use final recorded value',()=>{
  const large=parseVcd(header+'#0 0! #90071992547409935 1! #90071992547409936 0! 1! #90071992547409937 0!');
  assert.equal(queryClockEdge(large,{signal:'0',time:'90071992547409934',direction:1,edge:'rising'}).time,'90071992547409935');
  assert.equal(queryClockEdge(large,{signal:'0',time:'90071992547409937',direction:-1,edge:'falling'}).time,undefined);
});
test('edge search pages are bounded and scan resumes in both directions',()=>{
  const text=header+'#0 0! #1 1! '+Array.from({length:9000},(_,i)=>`#${i+2} ${i%2?'x':'z'}!`).join(' ')+' #9002 0! #9003 1!';
  const wave=parseVcd(text),request={signal:'0',time:'1',direction:1 as const,edge:'rising' as const};
  let page=queryClockEdge(wave,request),pages=1;
  assert.equal(page.scanned,4096);assert.notEqual(page.next,undefined);
  while(page.next!==undefined){page=queryClockEdge(wave,{...request,offset:page.next});assert.ok(page.scanned<=4096);pages++;}
  assert.equal(page.time,'9003');assert.equal(pages,3);
  const reverse={...request,time:'9003',direction:-1 as const};page=queryClockEdge(wave,reverse);
  while(page.next!==undefined)page=queryClockEdge(wave,{...reverse,offset:page.next});
  assert.equal(page.time,'1');
});
test('actual verified worker clock lookup and reader termination',async()=>{
  await mkdir('.dev/clock-edge',{recursive:true});const root=await mkdtemp(path.resolve('.dev/clock-edge/worker-')),file=path.join(root,'worker.cjs');
  await build({entryPoints:['packages/waveform/src/worker.ts'],bundle:true,platform:'node',format:'cjs',outfile:file});
  const reader=new WaveformSession(file),bytes=Buffer.from(header+'#0 0! #5 1! #10 0!');
  try {
    await reader.loadVerified(bytes,createHash('sha256').update(bytes).digest('hex'));
    assert.equal((await reader.clockEdgePage({signal:'0',time:'0',direction:1,edge:'rising'})).time,'5');
    assert.equal((await reader.clockEdgePage({signal:'0',time:'10',direction:-1,edge:'falling'})).time,undefined);
    const pending=assert.rejects(reader.clockEdgePage({signal:'0',time:'0',direction:1,edge:'rising'}),/cancelled|closed/);
    await reader.dispose();await pending;
  } finally {await reader.dispose();}
});
