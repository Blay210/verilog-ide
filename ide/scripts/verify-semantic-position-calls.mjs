import fs from 'node:fs/promises';
import path from 'node:path';
import { root } from './environment.mjs';
import { semanticPositionCalls } from './helpers/semantic-position-calls.mjs';
const compare=process.argv.includes('--compare'),before=process.argv.includes('--before');const receipts=[];
for(const baseline of compare?[true,false]:[before])receipts.push(await semanticPositionCalls({before:baseline}));
await fs.writeFile(path.join(root,'.dev/cloud/h7p-call-counts.json'),JSON.stringify(receipts,null,2));console.log(JSON.stringify(receipts,null,2));
