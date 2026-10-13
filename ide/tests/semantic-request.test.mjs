import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { requestFixture, semanticRequest } from '../scripts/helpers/semantic-request.mjs';

const until=async condition=>{const end=Date.now()+10000;while(Date.now()<end){if(await condition())return;await new Promise(r=>setTimeout(r,20));}throw Error('Did not reach the real second compilation boundary.');};
test('real compiler shares startup only: 300 RTL, independent tops, includes, auto packages and ambiguous completion', {timeout:60000}, async()=>{
  const receipt=await semanticRequest();
  assert.deepEqual(receipt.phases.map(p=>p.launches),[1,1,1]);
  assert.deepEqual(receipt.phases.map(p=>p.groups),[3,3,2]); // Includes a fresh dependency parse in the same process.
  assert.equal(receipt.livePythonAfter,0);
});
test('independent compilations do not retain macros or same-named declarations; errors recover on the next request', {timeout:60000}, async t=>{
  const f=await requestFixture({files:3});t.after(()=>f.dispose());
  const bad=f.tests[1].text.replace('`include "defs.inc"','').replace('`TEST_WIDTH','`ONLY_A');
  const good=f.tests[0].text.replace('`include "defs.inc"','`include "defs.inc"\n`define ONLY_A 13');
  const result=await f.provider.analyze(f.project,[{file:f.tests[0].file,text:good},{file:f.tests[1].file,text:bad}]);
  assert.ok(result.diagnostics.some(d=>d.severity==='error'&&d.location.file===f.tests[1].file&&/ONLY_A/.test(d.message)),JSON.stringify(result.diagnostics));
  assert.equal(result.inputs.conservative,true);
  const restored=await f.provider.analyze(f.project,[]);assert.ok(!restored.diagnostics.some(d=>d.severity==='error'));
  assert.equal(restored.inputs.conservative,false);
  const widths=restored.instances.filter(i=>i.name==='u').map(i=>i.ports);assert.equal(widths.length,2);
  await f.clean();
});
test('cancelling during the second real compilation joins the owned process and allows a fresh complete request', {timeout:60000}, async t=>{
  const f=await requestFixture({files:3,holdSecond:true});t.after(()=>f.dispose());
  await fs.writeFile(f.gate,'hold second group');
  const abort=new AbortController();const result=f.provider.analyze(f.project,[],abort.signal);
  // Attach rejection immediately so early failures cannot become unhandled.
  const settled=result.then(value=>({value}),error=>({error}));
  try{await until(async()=> (await f.rows()).some(row=>row.held));}finally{abort.abort();await settled;}
  const outcome=await settled;assert.ok(outcome.error,'A partial first-group result must never succeed.');
  await f.clean();await fs.unlink(f.gate);
  const fresh=await f.provider.analyze(f.project,[]);assert.equal(fresh.diagnostics.some(d=>d.severity==='error'),false);
  for(const test of f.tests)assert.ok(fresh.inputs.files.includes(test.file));await f.clean();
});
test('incomplete batch output fails closed and releases temporary files', {timeout:60000}, async t=>{
  const f=await requestFixture({files:2});t.after(()=>f.dispose());
  // Keep actual compilations, then simulate a truncated bridge result.
  let source=await fs.readFile(f.bridge,'utf8');source=source.replace("phase('serialization')","payload=result.get('result',result)\nif 'analyses' in payload: payload['analyses'].pop()\nphase('serialization')");await fs.writeFile(f.bridge,source);
  await assert.rejects(f.provider.analyze(f.project,[]),/incomplete test analyses/);await f.clean();
});

test('actual IPC edit waits for current analysis; mixed-root idle is quiet and manifest creation repairs both roots', {timeout:60000}, async()=>{
  const { semanticEdit }=await import('../scripts/helpers/semantic-edit.mjs');
  const receipt=await semanticEdit({files:3});
  assert.equal(receipt.phases.find(p=>p.name==='edit-to-completion').launches,2);
  assert.equal(receipt.phases.find(p=>p.name==='idle and 20 status queries').accounting.length,0);
  assert.equal(receipt.phases.find(p=>p.name==='create and repair manifests').launches,2);
  assert.equal(receipt.livePythonAfter,0);assert.equal(receipt.parentExit,0);
});
