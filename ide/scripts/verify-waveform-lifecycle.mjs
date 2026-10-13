import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { performance } from 'node:perf_hooks';
import { root } from './environment.mjs';
import { prepareRuntime } from './prepare-runtime.mjs';

const require = createRequire(import.meta.url);
const { createProject, readHistory } = require('../dist/runtime/core/index.js');
const { SimulationService } = require('../dist/runtime/simulation.js');
const { WaveformHost } = require('../dist/runtime/waveform-host.js');
const { WaveViewStore } = require('../dist/runtime/waveform-views.js');
const { resolveView } = require('../dist/runtime/waveform/views.js');
const threads = require('node:worker_threads'), NativeWorker = threads.Worker;
const workers = new Set(); let created = 0, exited = 0, peak = 0;
threads.Worker = class extends NativeWorker {
  constructor(...args) {
    super(...args); created++; workers.add(this); peak = Math.max(peak, workers.size);
    this.once('exit', () => { exited++; workers.delete(this); });
  }
};
const tick = () => new Promise(resolve => setImmediate(resolve));
const query = (doc, signals, cursor = '31') => ({ token: doc.token, kind: 'values', request: { signals, cursor } });

// A fresh OS process reopens the same retained bytes and disk view settings.
if (process.argv[2] === '--reopen') {
  const directory = path.resolve(process.argv[3] ?? ''), workerFile = path.resolve(process.argv[4] ?? '');
  assert.equal(path.dirname(directory), path.join(root, '.dev'));
  assert.ok(path.basename(directory).startsWith('cloud-h7d-wave-'));
  assert.equal(workerFile, path.join(directory, 'out/vs/platform/rtl/node/waveform-worker.cjs'));
  const rows = await readHistory(directory); assert.equal(rows.length, 1);
  const waves = new WaveformHost(workerFile);
  try {
    const doc = await waves.open(rows[0]); assert.equal(doc.metadata.signals.length, 4096);
    const stored = await new WaveViewStore(directory, rows[0].name, rows[0].top).read();
    assert.equal(stored.book.defaultId, 'scale');
    const selected = resolveView(stored.book.views[0], doc.metadata.signals);
    assert.equal(selected.selected.length, 32); assert.deepEqual(selected.missing, []);
    assert.ok((await waves.query(query(doc, selected.selected))).rows.every(row => row.value === '1'));
    await waves.dispose(); assert.equal(workers.size, 0); assert.equal(created, exited);
    process.stdout.write(JSON.stringify({ passed: true, pid: process.pid, runId: doc.runId, signals: doc.metadata.signals.length,
      restoredDefault: stored.book.defaultId, selected: selected.selected.length, created, exited }) + '\n');
  } finally { await waves.dispose(); threads.Worker = NativeWorker; }
} else {
  let realDirectory, rounds = 3;
  const usage = 'Usage: node --expose-gc scripts/verify-waveform-lifecycle.mjs [--rounds <1..12>] [--real-retained <private H7C fixture>]';
  const args = process.argv.slice(2), seen = new Set();
  while (args.length) {
    const flag = args.shift(), value = args.shift();
    if (seen.has(flag) || !value) throw Error(usage);
    seen.add(flag);
    if (flag === '--real-retained') realDirectory = path.resolve(value);
    else if (flag === '--rounds' && /^\d+$/.test(value) && +value >= 1 && +value <= 12) rounds = +value;
    else throw Error(usage);
  }
  if (!global.gc) throw Error(usage);
  if (realDirectory && (path.dirname(realDirectory) !== path.join(root, '.dev') || !path.basename(realDirectory).startsWith('cloud-h7c-real-'))) throw Error('Only private H7C fixtures are supported.');
  await fs.mkdir(path.join(root, '.dev'), { recursive: true });
  const directory = await fs.mkdtemp(path.join(root, '.dev/cloud-h7d-wave-'));
  const receipt = { passed: false, directory, pid: process.pid, versions: { node: process.version, platform: process.platform },
    workload: { signals: 4096, timestamps: 64, selected: 32, concurrentReaders: 4, rounds }, samples: [], openMs: [] };
  let waves;
  const sample = async label => {
    await tick(); global.gc(); await tick();
    receipt.samples.push({ label, workers: workers.size, ...process.memoryUsage() });
  };
  try {
    await prepareRuntime(directory); await createProject(directory, true);
    const workerFile = path.join(directory, 'out/vs/platform/rtl/node/waveform-worker.cjs');
    // Synthetic VCD, not a representative design or simulator benchmark.
    const lines = ['$timescale 1ns $end', '$scope module tb $end'];
    for (let i = 0; i < 4096; i++) lines.push(`$var wire 1 s${i} bit_${i} $end`);
    lines.push('$upscope $end', '$enddefinitions $end');
    for (let time = 0; time < 64; time++) {
      lines.push(`#${time}`);
      for (let i = 0; i < 4096; i++) lines.push(`${time % 2}s${i}`);
    }
    let vcd = lines.join('\n') + '\n'; lines.length = 0;
    receipt.workload.bytes = Buffer.byteLength(vcd);
    const service = new SimulationService(async () => ({ id: 'verilator', capabilities: { waveforms: ['vcd'], timing: true, inputSnapshot: true },
      check: async () => {}, build: async ({ directory }) => ({ executable: 'synthetic', cwd: directory }),
      run: async artifact => { await fs.writeFile(path.join(artifact.cwd, 'wave.vcd'), vcd); } }));
    const [result] = await service.run({ root: directory, names: ['counter_basic'] });
    assert.equal(result.status, 'passed'); assert.equal(result.traceIdentity.state, 'ready'); vcd = undefined;
    receipt.runId = result.runId;
    waves = new WaveformHost(workerFile); await sample('baseline');
    for (let round = 0; round < rounds; round++) {
      let docs = [];
      for (let i = 0; i < 4; i++) {
        const start = performance.now(), doc = await waves.open(result);
        receipt.openMs.push(performance.now() - start); docs.push(doc);
        assert.equal(doc.metadata.signals.length, 4096); assert.equal(doc.metadata.changes, 4096 * 64);
      }
      assert.equal(workers.size, 4); await assert.rejects(waves.open(result), /maximum 4/);
      const ids = docs[0].metadata.signals.slice(0, 32).map(signal => signal.id);
      const values = await waves.query(query(docs[0], ids)); assert.ok(values.rows.every(row => row.value === '1'));
      const window = await waves.query({ token: docs[0].token, kind: 'window', request: { signals: ids, from: '0', to: '63', cursor: '31', pixels: 1600 } });
      assert.equal(window.rows.length, 32); assert.ok(window.rows.every(row => row.changes.length > 0));
      assert.equal(await waves.query({ token: docs[0].token, kind: 'edge', signal: ids[0], time: '31', direction: 1 }), '32');
      if (round === 0) {
        const store = new WaveViewStore(directory, result.name, result.top);
        const saved = await store.edit({ action: 'save', revision: 'empty', view: { id: 'scale', name: '32 signals', radix: 'binary',
          signals: docs[0].metadata.signals.slice(0, 32).map(signal => ({ path: signal.path, color: 'blue' })) } });
        await store.edit({ action: 'default', revision: saved.revision, id: 'scale' });
      }
      await sample(`round${round + 1}-four-open`);
      // Reject queued requests on close and keep a separate reader usable.
      const pending = Array.from({ length: 32 }, () => waves.query(query(docs[0], ids)).then(() => 'done', error => String(error)));
      await Promise.all([waves.close(docs[0].token), waves.close(docs[0].token), waves.close(docs[1].token)]);
      assert.ok((await Promise.all(pending)).some(outcome => /cancel|closed/i.test(outcome)));
      assert.equal(workers.size, 2); assert.ok((await waves.query(query(docs[2], ids))).rows.every(row => row.value === '1'));
      await sample(`round${round + 1}-two-open`);
      await Promise.all(docs.slice(2).map(doc => waves.close(doc.token)));
      await assert.rejects(waves.query(query(docs[0], ids)), /closed/);
      docs = undefined; assert.equal(workers.size, 0); assert.equal(created, exited);
      await sample(`round${round + 1}-all-closed`);
    }
    await Promise.all([waves.dispose(), waves.dispose()]);
    receipt.freshProcess = JSON.parse((await promisify(execFile)(process.execPath, [fileURLToPath(import.meta.url), '--reopen', directory, workerFile],
      { timeout: 30000, maxBuffer: 1024 * 1024 })).stdout);
    assert.notEqual(receipt.freshProcess.pid, process.pid); assert.equal(receipt.freshProcess.runId, result.runId);
    // Reuse actual Verilator artifacts from H7C, without a new simulation or mutation.
    receipt.realRetained = realDirectory ? [] : { unrun: 'No retained real fixture supplied.' };
    if (realDirectory) {
      const realRows = (await readHistory(realDirectory)).filter(row => row.status === 'passed');
      assert.equal(realRows.length, 2);
      const realWaves = new WaveformHost(workerFile);
      try {
        for (const row of realRows) {
          const doc = await realWaves.open(row);
          const ids = doc.metadata.signals.slice(0, 32).map(signal => signal.id);
          assert.ok(ids.length > 0);
          const values = await realWaves.query(query(doc, ids, '0'));
          assert.equal(values.rows.length, ids.length);
          receipt.realRetained.push({ runId: row.runId, signals: doc.metadata.signals.length, queried: ids.length });
          await realWaves.close(doc.token);
        }
      } finally { await realWaves.dispose(); }
    }
    assert.equal(workers.size, 0); assert.equal(created, exited);
    receipt.workers = { created, exited, live: workers.size, peak };
    receipt.passed = true;
  } catch (error) { receipt.error = String(error); throw error; }
  finally {
    await waves?.dispose(); threads.Worker = NativeWorker;
    await fs.writeFile(path.join(directory, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
  }
}
