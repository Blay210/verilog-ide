import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { root } from './environment.mjs';
import { semanticRequest } from './helpers/semantic-request.mjs';
import { semanticEdit } from './helpers/semantic-edit.mjs';

const compare=process.argv.includes('--compare'),before=process.argv.includes('--before');
const samples=Number(process.argv.find(v=>v.startsWith('--samples='))?.split('=')[1]??1);
if(!Number.isInteger(samples)||samples<1||samples>5)throw Error('Choose 1 to 5 samples.');
const receipts=[];
await fs.mkdir(path.join(root,'.dev/cloud'),{recursive:true});
for(let i=0;i<samples;i++)for(const baseline of compare?(i%2?[false,true]:[true,false]):[before]){
  const options={providerBaseline:baseline?'.dev/cloud/h7r/slang-before.ts':false,bridgeBaseline:baseline?'.dev/cloud/h7r/analyze-before.py':false};
  const request=await semanticRequest({...options,hierarchy:true,large:true});
  const edit=await semanticEdit({...options,inline:true});
  const result={mode:baseline?'H7Q':'H7R',sample:i+1,request,edit};receipts.push(result);
  await fs.writeFile(path.join(root,`.dev/cloud/h7r-package-${baseline?'before':'after'}-${i+1}.json`),JSON.stringify(result,null,2));
  assert.ok(request.phases.every(p=>p.launches===(baseline?2:1)));
  assert.equal(edit.phases.find(p=>p.name==='mixed-startup').launches,baseline?4:2);
  assert.equal(edit.phases.find(p=>p.name==='edit-to-completion').launches,baseline?4:2);
  assert.equal(edit.inlineCompletion,true);
}
if(compare)for(let sample=1;sample<=samples;sample++){
  const pair=receipts.filter(r=>r.sample===sample);
  assert.deepEqual(pair[0].request.phases.map(p=>p.semanticHash),pair[1].request.phases.map(p=>p.semanticHash));
}
await fs.writeFile(path.join(root,'.dev/cloud/h7r-package-results.json'),JSON.stringify(receipts,null,2));
console.log(JSON.stringify(receipts,null,2));
