import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import v8 from 'node:v8';
import { root } from './environment.mjs';

const require = createRequire(import.meta.url), run = promisify(execFile);
const privatePath = (directory, prefix) => path.dirname(directory) === path.join(root, '.dev') && path.basename(directory).startsWith(prefix);
const tick = () => new Promise(resolve => setImmediate(resolve));

if (process.argv[2] === '--case') {
  if (!global.gc || process.platform !== 'linux') throw Error('Linux/--expose-gc required for memory diagnosis.');
  const configFile = path.resolve(process.argv[3] ?? '');
  assert.ok(privatePath(path.dirname(configFile), 'cloud-h7e-memory-'));
  const config = JSON.parse(await fs.readFile(configFile, 'utf8'));
  assert.ok(privatePath(config.fixture, 'cloud-h7d-wave-'));
  assert.equal(config.workerFile, path.join(path.dirname(configFile), 'profile-worker.cjs'));
  if (config.trimFile) assert.equal(config.trimFile, path.join(path.dirname(configFile), 'malloc-trim.node'));
  const { readHistory } = require('../dist/runtime/core/index.js');
  const { WaveformHost } = require('../dist/runtime/waveform-host.js');
  const { WaveformSession } = require('../dist/runtime/waveform/client.js');
  const threads = require('node:worker_threads'), NativeWorker = threads.Worker;
  const live = new Set(); let created = 0, exited = 0;
  threads.Worker = class extends NativeWorker {
    constructor(...args) { super(...args); created++; live.add(this); this.once('exit', () => { live.delete(this); exited++; }); }
  };
  const [result] = await readHistory(config.fixture); assert.ok(result);
  const waves = new WaveformHost(config.workerFile);
  const receipt = { passed: false, mode: config.mode, arena: config.arena, rounds: config.rounds, fixture: config.fixture,
    node: process.version, glibc: process.report.getReport().header.glibcVersionRuntime, samples: [], workerSamples: [] };
  async function sample(label) {
    await tick(); global.gc(); await tick();
    const smaps = await fs.readFile('/proc/self/smaps_rollup', 'utf8'), pages = {};
    for (const key of ['Rss', 'Pss', 'Anonymous', 'Private_Dirty', 'Private_Clean', 'Shared_Clean']) {
      pages[key] = +(smaps.match(new RegExp(`^${key}:\\s+(\\d+) kB$`, 'm'))?.[1] ?? NaN) * 1024;
    }
    const heap = v8.getHeapStatistics();
    receipt.samples.push({ label, workers: live.size, threads: (await fs.readdir('/proc/self/task')).length,
      ...process.memoryUsage(), pages, heap: { used: heap.used_heap_size, total: heap.total_heap_size, external: heap.external_memory },
      resources: process.getActiveResourcesInfo() });
  }
  try {
    await sample('baseline');
    for (let round = 0; round < config.rounds; round++) {
      let sessions;
      if (config.mode === 'idle') sessions = Array.from({ length: 4 }, () => new WaveformSession(config.workerFile));
      else {
        for (let i = 0; i < 4; i++) {
          const doc = await waves.open(result); assert.equal(doc.metadata.signals.length, 4096);
          const values = await waves.query({ token: doc.token, kind: 'values', request: { signals: doc.metadata.signals.slice(0, 32).map(signal => signal.id), cursor: '31' } });
          assert.equal(values.rows.length, 32); assert.ok(values.rows.every(row => row.value === '1'));
        }
        sessions = [...waves.readers.values()].map(entry => entry.reader);
      }
      assert.equal(live.size, 4);
      // The diagnostic wrapper reports real isolate heap without changing parser/query code.
      const profile = await Promise.all(sessions.map(session => session.request({ kind: '__memory' })));
      receipt.workerSamples.push({ round: round + 1, profile });
      if (round === 0 || round === config.rounds - 1) await sample(`round${round + 1}-four-open`);
      if (config.mode === 'idle') await Promise.all(sessions.map(session => session.dispose()));
      else await Promise.all([...waves.readers.keys()].map(token => waves.close(token)));
      sessions = undefined; assert.equal(live.size, 0); assert.equal(created, exited);
      await sample(`round${round + 1}-all-closed`);
    }
    await waves.dispose(); receipt.workers = { created, exited, live: live.size };
    // Only after all readers/threads exited. This child is a diagnosis, not a production fix.
    if (config.trimFile) {
      const allocator = require(config.trimFile);
      const allocatorInfo = () => {
        const xml = allocator.info();
        const total = type => +[...xml.matchAll(new RegExp(`<total type="${type}" count="\\d+" size="(\\d+)"`, 'g'))].at(-1)[1];
        const system = +[...xml.matchAll(/<system type="current" size="(\d+)"/g)].at(-1)[1];
        return { arenas: [...xml.matchAll(/<heap nr=/g)].length, system, freeChunks: total('fast') + total('rest'), mmap: total('mmap') };
      };
      receipt.trim = { allocatorBefore: allocatorInfo(), result: allocator.trim() };
      await sample('diagnostic-trim-after-all-closed');
      receipt.trim.allocatorAfter = allocatorInfo();
    } else receipt.trim = { unrun: 'No verified Node headers supplied for optional glibc diagnostic.' };
    receipt.passed = true;
  } finally {
    await waves.dispose(); threads.Worker = NativeWorker;
    process.stdout.write(JSON.stringify(receipt) + '\n');
  }
} else {
  let fixture, headers, rounds = 12;
  const args = process.argv.slice(2), usage = 'Usage: node scripts/verify-waveform-memory.mjs --retained <private H7D fixture> [--rounds <1..20>] [--headers <verified Node include/node>]';
  const seen = new Set();
  while (args.length) {
    const flag = args.shift(), value = args.shift(); if (!value || seen.has(flag)) throw Error(usage); seen.add(flag);
    if (flag === '--retained') fixture = path.resolve(value);
    else if (flag === '--headers') headers = path.resolve(value);
    else if (flag === '--rounds' && /^\d+$/.test(value) && +value >= 1 && +value <= 20) rounds = +value;
    else throw Error(usage);
  }
  if (!fixture || !privatePath(fixture, 'cloud-h7d-wave-') || process.platform !== 'linux') throw Error(usage);
  assert.equal(await fs.realpath(fixture), fixture);
  const actualWorker = path.join(fixture, 'out/vs/platform/rtl/node/waveform-worker.cjs');
  assert.equal(await fs.realpath(actualWorker), actualWorker);
  const directory = await fs.mkdtemp(path.join(root, '.dev/cloud-h7e-memory-'));
  const workerFile = path.join(directory, 'profile-worker.cjs');
  let trimFile;
  if (headers) {
    const header = await fs.readFile(path.join(headers, 'node_api.h'), 'utf8');
    assert.ok(header.includes('NAPI_MODULE_INIT'));
    trimFile = path.join(directory, 'malloc-trim.node');
    await run('gcc', ['-shared', '-fPIC', '-Wall', '-Wextra', '-Werror', '-DNAPI_VERSION=8', `-I${headers}`,
      path.join(root, 'scripts/helpers/malloc-trim.c'), '-o', trimFile], { timeout: 30000 });
  }
  // Intercept only the diagnostic message before the actual worker's handler.
  // Production code is loaded unchanged; no heap dump/flags or allocator tuning in the app.
  await fs.writeFile(workerFile, `const {parentPort}=require('node:worker_threads');const v8=require('node:v8');
const on=parentPort.on.bind(parentPort);
parentPort.on=(event,listener)=>event==='message'?on(event,message=>{
 if(message.kind!=='__memory')return listener(message);
 if(global.gc)global.gc();const heap=v8.getHeapStatistics();
 parentPort.postMessage({id:message.id,result:{gc:!!global.gc,...process.memoryUsage(),heap:{used:heap.used_heap_size,total:heap.total_heap_size,external:heap.external_memory}}});
}):on(event,listener);
require(${JSON.stringify(actualWorker)});\n`);
  const receipt = { passed: false, directory, fixture, rounds, cases: [], scope: 'Linux diagnostic child processes; same retained bytes, actual parser, no app or simulator.' };
  try {
    for (const [mode, arena] of [['idle', 'default'], ['trace', 'default'], ['trace', '2']]) {
      const configFile = path.join(directory, `${mode}-${arena}.json`);
      await fs.writeFile(configFile, JSON.stringify({ fixture, rounds, workerFile, trimFile, mode, arena }));
      const env = { ...process.env }; delete env.MALLOC_ARENA_MAX;
      if (arena === '2') env.MALLOC_ARENA_MAX = '2';
      const result = await run(process.execPath, ['--expose-gc', fileURLToPath(import.meta.url), '--case', configFile], { env, timeout: 180000, maxBuffer: 4 * 1024 * 1024 });
      const data = JSON.parse(result.stdout); assert.equal(data.passed, true); receipt.cases.push(data);
      await fs.writeFile(path.join(directory, `${mode}-${arena}-receipt.json`), JSON.stringify(data, null, 2) + '\n');
      console.log(`${mode}/${arena}: ${data.workers.created}/${data.workers.exited} workers exited; baseline/final RSS ${data.samples[0].rss}/${data.samples.at(-1).rss} bytes`);
    }
    receipt.passed = true;
  } finally {
    await fs.writeFile(path.join(directory, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
    console.log(JSON.stringify({ passed: receipt.passed, directory, cases: receipt.cases.length }));
  }
}
