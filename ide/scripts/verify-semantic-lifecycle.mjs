import fs from 'node:fs/promises';
import path from 'node:path';
import { lifecycleFixture, statusFixture, deferred, tick } from './helpers/semantic-lifecycle.mjs';
import { root } from './environment.mjs';
const before = process.argv.includes('--before');
const f = await lifecycleFixture({ before });
let restart;
try {
  await f.restart();
  const initial = { ...f.stats };
  await Promise.all(Array.from({ length: 20 }, () => f.restart()));
  restart = Object.fromEntries(['probes', 'clients', 'starts', 'stops'].map(key => [key, f.stats[key] - initial[key]]));
} finally { await f.cleanup(); }
const gate = deferred(), active = lifecycleFixture({ before, probe: async signal => { await gate.promise; return 'verified-python'; } });
const g = await active;
await tick(); const pending = Array.from({ length: 20 }, () => g.restart()); gate.resolve(); await Promise.all(pending);
const probing = { ...g.stats }; await g.cleanup();
const status = await statusFixture(before);
for (let i = 0; i < 10; i++) await status.fire();
const statusReads = status.reads.length;
status.close(); for (const read of status.reads) read.resolve({ label: 'Ready', detail: 'fixture' }); await tick();
const failure = await lifecycleFixture({ before, stop: async (_, count) => { if (count === 1) throw Error('Modeled native stop timeout'); } });
let failedStop;
try { await failure.restart(); await failure.restart(); await failure.restart(); failedStop = { clients: failure.stats.clients, stops: failure.stats.stops, status: (await failure.status()).label }; }
finally { await failure.cleanup().catch(() => {}); }
const receipt = { mode: before ? 'H7J before' : 'H7K after', scope: 'Actual owned adapter/status code with modeled VS Code and client API; 20 same-turn restart requests, 20 requests during held probe, 10 virtual slow-status ticks and native stop failure. Not native startup latency.', restart, probing, slowStatusReads: statusReads, failedStop };
await fs.writeFile(path.join(root, `.dev/cloud/h7k-lifecycle-${before ? 'before' : 'after'}.json`), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt, null, 2));
