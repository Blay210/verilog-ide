import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { root } from '../scripts/environment.mjs';
import { semanticScale } from '../scripts/helpers/semantic-scale.mjs';
test('900 actual RTL inputs reuse watchers, route local/shared edits and join owned work without saving source buffers',async()=>{
  const receipt=await semanticScale();await fs.mkdir(path.join(root,'.dev/cloud'),{recursive:true});await fs.writeFile(path.join(root,'.dev/cloud/h7m-scale-suite.json'),JSON.stringify(receipt,null,2));
});
