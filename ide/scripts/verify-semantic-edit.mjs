import fs from 'node:fs/promises';
import path from 'node:path';
import { root } from './environment.mjs';
import { semanticEdit } from './helpers/semantic-edit.mjs';
const compare=process.argv.includes('--compare'),before=process.argv.includes('--before'),samples=Number(process.argv.find(v=>v.startsWith('--samples='))?.split('=')[1]??1);
if(!Number.isInteger(samples)||samples<1||samples>5)throw Error('Choose 1 to 5 samples.');
await fs.mkdir(path.join(root,'.dev/cloud'),{recursive:true});const receipts=[];
for(let i=0;i<samples;i++)for(const baseline of compare?(i%2?[false,true]:[true,false]):[before]){const result=await semanticEdit({before:baseline});result.sample=i+1;receipts.push(result);await fs.writeFile(path.join(root,`.dev/cloud/h7n-edit-${baseline?'before':'after'}-${i+1}.json`),JSON.stringify(result,null,2));}
await fs.writeFile(path.join(root,'.dev/cloud/h7n-edit-results.json'),JSON.stringify(receipts,null,2));console.log(JSON.stringify(receipts,null,2));
