import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { root } from './environment.mjs';
import { semanticRequest } from './helpers/semantic-request.mjs';
const compare=process.argv.includes('--compare'),before=process.argv.includes('--before');
const samples=Number(process.argv.find(arg=>arg.startsWith('--samples='))?.split('=')[1]??1);
if(!Number.isInteger(samples)||samples<1||samples>5)throw Error('Choose 1 to 5 samples.');
await fs.mkdir(path.join(root,'.dev/cloud'),{recursive:true});
const receipts=[];
for(let i=0;i<samples;i++)for(const baseline of compare?(i%2?[false,true]:[true,false]):[before]){const result=await semanticRequest({before:baseline});result.sample=i+1;receipts.push(result);await fs.writeFile(path.join(root,`.dev/cloud/h7n-request-${baseline?'before':'after'}-${i+1}.json`),JSON.stringify(result,null,2));}
if(compare)for(let sample=1;sample<=samples;sample++){
  const pair=receipts.filter(r=>r.sample===sample);
  assert.deepEqual(pair[0].phases.map(p=>p.semanticHash),pair[1].phases.map(p=>p.semanticHash),'Paired semantic results must agree.');
}
await fs.writeFile(path.join(root,'.dev/cloud/h7n-request-results.json'),JSON.stringify(receipts,null,2));console.log(JSON.stringify(receipts,null,2));
