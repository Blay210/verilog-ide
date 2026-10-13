import test from 'node:test';
import assert from 'node:assert/strict';
import { semanticQueueWait } from '../scripts/helpers/semantic-queue-wait.mjs';
import { semanticEdit } from '../scripts/helpers/semantic-edit.mjs';

test('owned timing distinguishes real pool wait from compiler work and never starts the third process before cleanup',{timeout:60000},async()=>{
  const receipt=await semanticQueueWait();assert.equal(receipt.launches,3);assert.equal(receipt.livePythonAfter,0);
});
test('actual IPC timing reports current-analysis wait and query queue/active spans while preserving fresh completion and quiet idle',{timeout:60000},async()=>{
  const receipt=await semanticEdit({files:3,inline:true,timing:true});
  const edit=receipt.phases.find(p=>p.name==='edit-to-completion'),records=edit.accounting;
  const starts=records.filter(r=>r.kind==='work-start'),ends=records.filter(r=>r.kind==='work-end');
  assert.equal(starts.filter(r=>r.operation==='query').length,1);assert.ok(starts.some(r=>r.operation==='analysis'));
  const returned=starts.filter(start=>ends.find(end=>end.id===start.id)?.returned);
  assert.deepEqual(returned.map(r=>r.operation),['analysis','query']);
  // The malformed root may also run its conservative Core validation job.
  // Distinguish that rejection from the healthy snapshot's compiler work.
  assert.ok(starts.every(r=>r.queuedMs>=0));assert.equal(ends.length,starts.length);
  assert.equal(records.filter(r=>r.kind==='snapshot').length,1);assert.equal(edit.launches,2);assert.equal(receipt.inlineCompletion,true);
  assert.deepEqual(receipt.phases.find(p=>p.name==='idle and 20 status queries').accounting,[]);
  assert.equal(receipt.parentExit,0);assert.equal(receipt.registrationsAfter,0);
});
