import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { root } from '../environment.mjs';

// Instrument an owned copy only; no production profiling API or persistent log.
export async function semanticWorkTimingSource(accounting){
  let source=await fs.readFile(path.join(root,'language/src/semantic-work.ts'),'utf8');
  const needle='job = { key, controller: new AbortController(), work, result, resolve, reject, users: 0, started: false };';
  assert.equal(source.split(needle).length,2);
  source=source.replace(needle,`const queuedAt=performance.now(),id=++profileJob;
      job = { key, controller: new AbortController(), work: async(signal:AbortSignal)=>{
        const started=performance.now();
        profileRecord({kind:'work-start',id,operation:key.split(':')[0],queuedMs:started-queuedAt,at:started});
        let returned=false;
        try{const value=await work(signal);returned=true;return value;}finally{profileRecord({kind:'work-end',id,returned,activeMs:performance.now()-started,at:performance.now()});}
      }, result, resolve, reject, users: 0, started: false };`);
  return `import {appendFileSync as profileAppend} from 'node:fs';
let profileJob=0;
function profileRecord(value:Record<string,unknown>){profileAppend(${JSON.stringify(accounting)},JSON.stringify(value)+'\\n');}
`+source;
}
