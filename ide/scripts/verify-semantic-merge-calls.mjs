import fs from 'node:fs/promises';
import path from 'node:path';
import { root } from './environment.mjs';
import { semanticMergeCalls } from './helpers/semantic-merge-calls.mjs';
const compare=process.argv.includes('--compare'),before=process.argv.includes('--before'),receipts=[];
for(const baseline of compare?[true,false]:[before])receipts.push(await semanticMergeCalls({before:baseline}));
await fs.writeFile(path.join(root,'.dev/cloud/h7q-merge-calls.json'),JSON.stringify(receipts,null,2));console.log(JSON.stringify(receipts,null,2));
