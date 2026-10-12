import test from 'node:test';
import assert from 'node:assert/strict';
import {reference,variants} from './pipeline-mac-reference';
test('MAC specification: latency, hold/reset, signedness and accumulator truncation landmarks',()=>{
  const [s4,s8,u4]=variants.map(reference);
  assert.deepEqual(s4.map(s=>s.acc),[0n,0n,-15n,-15n,-30n,28n,28n,29n,0n,0n,0n,1n,2n]);
  assert.deepEqual(u4.map(s=>s.acc),[0n,0n,49n,49n,34n,12n,12n,45n,0n,0n,0n,33n,2n]);
  assert.deepEqual(s8.map(s=>s.acc),[0n,0n,49n,49n,98n,92n,156n,381n,0n,0n,0n,-255n,-510n]);
  assert.equal(s4[6].product,1n);assert.equal(s8[6].product,225n);assert.equal(u4[6].product,225n);
  assert.equal(s4[3].product,-6n);assert.equal(s4[3].stage,49n);assert.equal(s4[4].stage,-6n);
});
