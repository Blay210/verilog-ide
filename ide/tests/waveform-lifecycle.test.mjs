import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
import { prepareRuntime } from '../scripts/prepare-runtime.mjs';

const require = createRequire(import.meta.url), fs = require('node:fs/promises');
const { createProject, readHistory } = require('../dist/runtime/core/index.js');
const { SimulationService } = require('../dist/runtime/simulation.js');
const { SimulationHostSession } = require('../dist/runtime/host.js');
const { WaveformHost } = require('../dist/runtime/waveform-host.js');
const { resolveView } = require('../dist/runtime/waveform/views.js');
const threads = require('node:worker_threads'), NativeWorker = threads.Worker;
const workers = new Set();
// Observe real Worker exits, not just reader-map removal.
threads.Worker = class extends NativeWorker {
  constructor(...args) { super(...args); workers.add(this); this.once('exit', () => workers.delete(this)); }
};
let bundle, workerFile;
before(async () => {
  bundle = await fs.mkdtemp(path.join(root, '.dev/lifecycle-worker-'));
  await prepareRuntime(bundle); workerFile = path.join(bundle, 'out/vs/platform/rtl/node/waveform-worker.cjs');
});
after(async () => { threads.Worker = NativeWorker; await fs.rm(bundle, { recursive: true, force: true }); });
const vcd = '$timescale 1ns $end\n$scope module tb $end\n$var wire 1 ! clk $end\n$upscope $end\n$enddefinitions $end\n#0\n0!\n#5\n1!\n#10\n0!\n';
function gate() { let release; return { promise: new Promise(resolve => { release = resolve; }), release: () => release() }; }
const tick = () => new Promise(resolve => setImmediate(resolve));
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(root, '.dev/wave-lifecycle-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await createProject(dir, true);
  let trace = vcd;
  const service = new SimulationService(async () => ({ id: 'verilator', capabilities: { waveforms: ['vcd'], timing: true, inputSnapshot: true },
    check: async () => {}, build: async ({ directory }) => ({ executable: 'synthetic', cwd: directory }),
    run: async artifact => { await fs.writeFile(path.join(artifact.cwd, 'wave.vcd'), trace); } }));
  const [result] = await service.run({ root: dir, names: ['counter_basic'] });
  return { dir, service, result, trace: value => { trace = value; } };
}
// Deliberately hold an actual snapshot read even after abort. Close must join it.
function holdSnapshot(result) {
  const read = fs.readFile, entered = gate(), hold = gate(); let active = 0, first = true;
  fs.readFile = async (file, ...args) => {
    const bytes = await read(file, ...args);
    if (first && String(file) === path.join(result.directory, 'input-snapshot.json')) {
      first = false; active++; entered.release();
      try { await hold.promise; } finally { active--; }
    }
    return bytes;
  };
  return { entered, hold, active: () => active, restore: () => { fs.readFile = read; } };
}
const values = doc => ({ token: doc.token, kind: 'values', request: { signals: [doc.metadata.signals[0].id], cursor: '5' } });

test('fresh host restores retained run and view; missing/damaged trace never substitutes latest or overwrites settings', async t => {
  const f = await fixture(t), waves = new WaveformHost(workerFile);
  const first = new SimulationHostSession(() => {}, f.service, waves); t.after(() => first.close());
  await first.inspect(f.dir); const old = await first.openWaveform(f.result.name, f.result.runId);
  const view = { id: 'saved', name: '클럭', radix: 'binary', signals: [{ path: old.metadata.signals[0].path, color: 'amber' }, { path: 'tb.absent' }] };
  const saved = await first.editWaveViews(old.token, { action: 'save', revision: 'empty', view });
  const defaults = await first.editWaveViews(old.token, { action: 'default', revision: saved.revision, id: view.id });
  f.trace(vcd.replace('1!', '0!')); const [newer] = await f.service.run({ root: f.dir, names: [f.result.name] });
  await first.close(); assert.equal(workers.size, 0);
  const source = path.join(f.dir, 'rtl/counter.sv'), original = await fs.readFile(source);
  await fs.writeFile(source, Buffer.concat([original, Buffer.from('\n// changed after recorded run\n')]));
  const second = new SimulationHostSession(() => {}, new SimulationService(), new WaveformHost(workerFile)); t.after(() => second.close());
  const state = await second.inspect(f.dir);
  assert.equal(state.tests.find(test => test.name === f.result.name).latest.runId, newer.runId);
  await fs.unlink(source);
  const reopened = await second.openWaveform(f.result.name, f.result.runId);
  assert.equal(reopened.runId, f.result.runId); assert.notEqual(reopened.token, old.token);
  assert.equal((await second.queryWaveform(values(reopened))).rows[0].value, '1');
  assert.deepEqual(await second.readWaveViews(reopened.token), defaults);
  assert.deepEqual(resolveView(defaults.book.views[0], reopened.metadata.signals), { selected: [reopened.metadata.signals[0].id], missing: ['tb.absent'] });
  const settingsDir = path.join(f.dir, '.rtl/waveform-views'), settings = path.join(settingsDir, (await fs.readdir(settingsDir))[0]);
  const bytes = await fs.readFile(settings); await fs.writeFile(settings, '{damaged');
  await assert.rejects(second.readWaveViews(reopened.token));
  await assert.rejects(second.editWaveViews(reopened.token, { action: 'delete', revision: defaults.revision, id: view.id }));
  assert.equal(await fs.readFile(settings, 'utf8'), '{damaged');
  assert.equal((await second.queryWaveform(values(reopened))).rows[0].value, '1');
  await fs.writeFile(settings, bytes); await second.closeWaveform(reopened.token);
  await fs.writeFile(f.result.waveform, vcd.replace('1!', '0!'));
  await assert.rejects(second.openWaveform(f.result.name, f.result.runId), /modified/); assert.equal(workers.size, 0);
  await fs.writeFile(f.result.waveform, vcd); await fs.unlink(newer.waveform);
  await assert.rejects(fs.stat(source), /ENOENT/); await fs.writeFile(source, original);
  const restoredState = await second.inspect(f.dir);
  assert.equal(restoredState.tests.find(test => test.name === f.result.name).latest.runId, newer.runId);
  await assert.rejects(second.openWaveform(f.result.name, newer.runId), /파형 파일이 없습니다/);
  assert.equal((await readHistory(f.dir)).length, 2);
  await second.close(); assert.equal(workers.size, 0);
});

test('wave host dispose joins in-flight verification and repeated disposal, with real worker exit', async t => {
  const f = await fixture(t), waves = new WaveformHost(workerFile), held = holdSnapshot(f.result);
  t.after(() => waves.dispose());
  const outcome = waves.open(f.result).then(() => undefined, error => error);
  try {
    await held.entered.promise;
    const exits = [...workers].map(worker => new Promise(resolve => worker.once('exit', resolve)));
    let settled = false; const close = waves.dispose().then(() => { settled = true; });
    const again = waves.dispose(); await Promise.all(exits); await tick(); assert.equal(settled, false); assert.equal(held.active(), 1);
    held.hold.release(); assert.match(String(await outcome), /abort|cancel|closed/i); await Promise.all([close, again]);
    assert.equal(held.active(), 0); assert.equal(workers.size, 0);
    await assert.rejects(waves.open(f.result), /unavailable/);
  } finally { held.hold.release(); await outcome; held.restore(); }
});

test('waveform open rejects project A/B/A and does not attach settings to another root', async t => {
  const a = await fixture(t), b = await fixture(t), waves = new WaveformHost(workerFile);
  const host = new SimulationHostSession(() => {}, a.service, waves); t.after(() => host.close()); await host.inspect(a.dir);
  const held = holdSnapshot(a.result), outcome = host.openWaveform(a.result.name, a.result.runId).then(() => undefined, error => error);
  try {
    await held.entered.promise; await host.inspect(b.dir); await host.inspect(a.dir);
    held.hold.release(); assert.match(String(await outcome), /Project changed/);
    assert.equal(workers.size, 0); assert.equal(host.viewStores.size, 0);
    await assert.rejects(fs.stat(path.join(b.dir, '.rtl/waveform-views')), /ENOENT/);
    const doc = await host.openWaveform(a.result.name, a.result.runId);
    assert.equal((await host.queryWaveform(values(doc))).rows[0].value, '1');
    await host.closeWaveform(doc.token); assert.equal(workers.size, 0);
  } finally { held.hold.release(); await outcome; held.restore(); }
});

test('simulation host close waits for waveform verification and rejects publication after closing', async t => {
  const f = await fixture(t), host = new SimulationHostSession(() => {}, f.service, new WaveformHost(workerFile));
  t.after(() => host.close()); await host.inspect(f.dir);
  const held = holdSnapshot(f.result), outcome = host.openWaveform(f.result.name, f.result.runId).then(() => undefined, error => error);
  try {
    await held.entered.promise; let settled = false;
    const close = host.close().then(() => { settled = true; }), again = host.close();
    await tick(); assert.equal(settled, false); held.hold.release();
    assert.match(String(await outcome), /unavailable/); await Promise.all([close, again]);
    assert.equal(workers.size, 0); assert.equal(host.viewStores.size, 0);
  } finally { held.hold.release(); await outcome; held.restore(); }
});

test('closing reader keeps its slot until real termination; duplicate closes join and peer remains usable', async t => {
  const f = await fixture(t), waves = new WaveformHost(workerFile); t.after(() => waves.dispose());
  const docs = []; for (let i = 0; i < 4; i++) docs.push(await waves.open(f.result));
  const worker = [...workers][0], terminate = worker.terminate.bind(worker), held = gate();
  worker.terminate = async () => { await held.promise; return terminate(); };
  try {
    let firstDone = false, secondDone = false;
    const close = waves.close(docs[0].token).then(() => { firstDone = true; });
    const again = waves.close(docs[0].token).then(() => { secondDone = true; });
    await tick(); assert.equal(firstDone, false); assert.equal(secondDone, false);
    await assert.rejects(waves.open(f.result), /maximum 4/);
    await assert.rejects(waves.query(values(docs[0])), /closed/);
    assert.equal((await waves.query(values(docs[1]))).rows[0].value, '1');
    held.release(); await Promise.all([close, again]); assert.equal(workers.size, 3);
    const replacement = await waves.open(f.result); assert.equal(workers.size, 4);
    await waves.close(replacement.token); await waves.dispose(); assert.equal(workers.size, 0);
  } finally { held.release(); }
});
