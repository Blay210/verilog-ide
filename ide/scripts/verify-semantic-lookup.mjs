import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { root } from './environment.mjs';
import { semanticRequest } from './helpers/semantic-request.mjs';
import { semanticEdit } from './helpers/semantic-edit.mjs';
import { semanticLookup } from './helpers/semantic-lookup.mjs';

const compare=process.argv.includes('--compare'),before=process.argv.includes('--before'),profile=process.argv.includes('--profile');
const samples=Number(process.argv.find(v=>v.startsWith('--samples='))?.split('=')[1]??1);
if(!Number.isInteger(samples)||samples<1||samples>5)throw Error('Choose 1 to 5 samples.');
if(profile&&samples!==1)throw Error('Use one separate counting sample; keep ordinary latency runs unwrapped.');
const receipts=[];await fs.mkdir(path.join(root,'.dev/cloud'),{recursive:true});
for(let i=0;i<samples;i++)for(const baseline of compare?(i%2?[false,true]:[true,false]):[before]){
  const options={bridgeBaseline:baseline?'.dev/cloud/h7s/analyze-before.py':false};
  const lookup=await semanticLookup({before:baseline,profile});
  const request=profile?undefined:await semanticRequest({...options,hierarchy:true,large:true,completionStages:true});
  const edit=profile?undefined:await semanticEdit({...options,inline:true,timing:true});
  const result={mode:baseline?'H7R':'H7S',sample:i+1,profile,lookup,request,edit};receipts.push(result);
  await fs.writeFile(path.join(root,`.dev/cloud/h7s-${profile?'lookup-counts':'lookup'}-${baseline?'before':'after'}-${i+1}.json`),JSON.stringify(result,null,2));
  assert.ok(lookup.phases.every(p=>p.launches===1));
  if(edit){assert.equal(edit.inlineCompletion,true);assert.equal(edit.phases.find(p=>p.name==='edit-to-completion').launches,2);}
}
if(compare)for(let sample=1;sample<=samples;sample++){
  const pair=receipts.filter(r=>r.sample===sample);
  for(const kind of profile?['lookup']:['lookup','request'])assert.deepEqual(pair[0][kind].phases.map(p=>p.semanticHash),pair[1][kind].phases.map(p=>p.semanticHash));
}
await fs.writeFile(path.join(root,`.dev/cloud/h7s-${profile?'lookup-counts':'lookup'}-results.json`),JSON.stringify(receipts,null,2));
console.log(JSON.stringify(receipts,null,2));
