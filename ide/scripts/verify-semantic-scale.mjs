import fs from 'node:fs/promises';
import path from 'node:path';
import { root } from './environment.mjs';
import { semanticScale } from './helpers/semantic-scale.mjs';
const compare=process.argv.includes('--compare'), before=process.argv.includes('--before');
const samples=Number(process.argv.find(arg=>arg.startsWith('--samples='))?.split('=')[1]??1);
if(!Number.isInteger(samples)||samples<1||samples>5)throw Error('Choose 1 to 5 samples.');
const receipts=[];
for(let sample=0;sample<samples;sample++) for(const baseline of compare?[true,false]:[before]){
  const result=await semanticScale({before:baseline});result.sample=sample+1;receipts.push(result);
  await fs.writeFile(path.join(root,`.dev/cloud/h7m-scale-${baseline?'before':'after'}-${sample+1}.json`),JSON.stringify(result,null,2));
}
if(compare)await fs.writeFile(path.join(root,'.dev/cloud/h7m-scale-paired.json'),JSON.stringify(receipts,null,2));
console.log(JSON.stringify(receipts,null,2));
