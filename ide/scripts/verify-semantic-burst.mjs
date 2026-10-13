import fs from 'node:fs/promises';
import path from 'node:path';
import { semanticBurst } from './helpers/semantic-burst.mjs';
import { root } from './environment.mjs';
const before = process.argv.includes('--before');
const receipt = await semanticBurst(before);
await fs.writeFile(path.join(root, `.dev/cloud/h7j-semantic-${before ? 'before' : 'after'}.json`), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt, null, 2));
if (!receipt.passed) process.exitCode = 1;
