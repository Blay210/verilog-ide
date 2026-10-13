import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
import { prepareRuntime } from '../scripts/prepare-runtime.mjs';
const require = createRequire(import.meta.url), fs = require('node:fs/promises');
const { createProject, readHistory, readImportRecovery } = require('../dist/runtime/core/index.js');
const { publishImportConfiguration } = require('../dist/runtime/core/import-publication.js');
const { acquireImportLease } = require('../dist/runtime/core/import-lease.js');
const { createHash } = require('node:crypto');
const { populate } = require('./helpers/import-journal.cjs');
const { SimulationService } = require('../dist/runtime/simulation.js');
const { SimulationHostSession } = require('../dist/runtime/host.js');
const { WaveformHost } = require('../dist/runtime/waveform-host.js');
let bundle, workerFile;
before(async () => { bundle = await fs.mkdtemp(path.join(root, '.dev/recovery-worker-')); await prepareRuntime(bundle); workerFile = path.join(bundle, 'out/vs/platform/rtl/node/waveform-worker.cjs'); });
after(() => fs.rm(bundle, { recursive: true, force: true }));
function gate() { let release; return { promise: new Promise(resolve => { release = resolve; }), release }; }
const tick = () => new Promise(resolve => setImmediate(resolve));
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(root, '.dev/project-recovery-')); t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await createProject(dir, true); let run = 0;
  const service = new SimulationService(async () => ({ id: 'verilator', capabilities: { waveforms: ['vcd'], timing: true, inputSnapshot: true },
    check: async () => {}, build: async ({ directory }) => ({ executable: 'synthetic', cwd: directory }), run: async artifact => {
      run++; await fs.writeFile(path.join(artifact.cwd, 'wave.vcd'), `$timescale 1ns $end\n$scope module tb $end\n$var wire 1 ! clk $end\n$upscope $end\n$enddefinitions $end\n#0\n0!\n#5\n${run % 2}!\n#10\n0!\n`);
    } }));
  const [older] = await service.run({ root: dir, names: ['counter_basic'] }), [latest] = await service.run({ root: dir, names: ['counter_basic'] });
  await fs.writeFile(latest.log, 'retained latest log');
  return { dir, service, older, latest, source: await fs.readFile(path.join(dir, 'rtl/counter.sv')), manifest: await fs.readFile(path.join(dir, 'rtl.toml')) };
}
function host(t, f) { const host = new SimulationHostSession(() => {}, f.service, new WaveformHost(workerFile)); t.after(() => host.close()); return host; }

test('missing DUT restores retained rows, log/source/wave without registering runnable tests or rewriting files', async t => {
  const f = await fixture(t); await fs.unlink(path.join(f.dir, 'rtl/counter.sv'));
  const session = host(t, f), state = await session.inspect(f.dir);
  assert.equal(state.history.length, 2); assert.equal(state.phase, 'error'); assert.equal(state.historyOnly, true); assert.equal(state.project, undefined);
  assert.equal(state.tests[0].latest.runId, f.latest.runId); assert.equal(state.tests[0].source, undefined);
  assert.throws(() => session.start(undefined, true), /유효한 rtl.toml/);
  await assert.rejects(session.compareRun(f.latest.name, f.latest.runId), /복구/);
  assert.equal(await session.readLog(f.latest.name), 'retained latest log');
  const sources = await session.recordedSources(f.older.name, f.older.runId), source = sources.find(item => item.file === 'rtl/counter.sv'); assert.ok(source);
  assert.equal((await session.recordedSource(f.older.name, f.older.runId, source.file)).text, f.source.toString('utf8'));
  const wave = await session.openWaveform(f.older.name, f.older.runId);
  assert.equal((await session.queryWaveform({ token: wave.token, kind: 'values', request: { signals: [wave.metadata.signals[0].id], cursor: '5' } })).rows[0].value, '1');
  await session.closeWaveform(wave.token); await assert.rejects(fs.stat(path.join(f.dir, 'rtl/counter.sv')), /ENOENT/);
  assert.deepEqual(await fs.readFile(path.join(f.dir, 'rtl.toml')), f.manifest); assert.equal((await readHistory(f.dir)).length, 2);
  await fs.writeFile(path.join(f.dir, 'rtl/counter.sv'), f.source);
  const recovered = await session.inspect(f.dir); assert.equal(recovered.historyOnly, false); assert.equal(recovered.phase, 'idle'); assert.equal(recovered.tests[0].latest.runId, f.latest.runId);
});

test('damaged, absent and linked manifest leave retained artifacts readable and never adopt or overwrite settings', async t => {
  const f = await fixture(t), file = path.join(f.dir, 'rtl.toml');
  for (const mode of ['damaged', 'absent', 'linked']) {
    await fs.rm(file, { force: true });
    if (mode === 'damaged') await fs.writeFile(file, 'broken = [');
    if (mode === 'linked') { const target = path.join(f.dir, 'outside.toml'); await fs.writeFile(target, f.manifest); await fs.link(target, file); }
    const session = host(t, f), state = await session.inspect(f.dir);
    assert.equal(state.history.length, 2); assert.equal(state.historyOnly, true); assert.equal(state.project, undefined);
    assert.throws(() => session.start([f.latest.name], true), /rtl.toml/);
    assert.equal(await session.readLog(f.latest.name, f.latest.runId), 'retained latest log');
    assert.ok((await session.recordedSources(f.latest.name, f.latest.runId)).length > 0);
    if (mode === 'absent') await assert.rejects(fs.lstat(file), /ENOENT/);
    if (mode === 'damaged') assert.equal(await fs.readFile(file, 'utf8'), 'broken = [');
    if (mode === 'linked') assert.equal((await fs.lstat(file)).nlink, 2);
    await session.close();
  }
});

test('damaged history and missing newest trace stay isolated from broken project restoration', async t => {
  const f = await fixture(t); await fs.writeFile(path.join(f.dir, 'rtl.toml'), 'broken = ['); await fs.unlink(f.latest.waveform);
  const interrupted = path.join(f.dir, '.rtl/runs/interrupted'); await fs.mkdir(interrupted);
  await fs.writeFile(path.join(interrupted, 'result.json.partial'), JSON.stringify(f.latest));
  await fs.writeFile(path.join(interrupted, 'result.json'), '{damaged');
  const session = host(t, f), state = await session.inspect(f.dir);
  assert.equal(state.history.length, 2); assert.equal(state.tests[0].latest.runId, f.latest.runId); assert.equal(state.tests[0].latest.waveform, undefined);
  await assert.rejects(session.openWaveform(f.latest.name, f.latest.runId), /파형 파일이 없습니다/);
  const wave = await session.openWaveform(f.older.name, f.older.runId); assert.equal(wave.runId, f.older.runId); await session.closeWaveform(wave.token);
  assert.equal(await fs.readFile(path.join(interrupted, 'result.json'), 'utf8'), '{damaged');
});

test('retained log rejects project A/B/A and close joins the file handle read', async t => {
  const a = await fixture(t), b = await fixture(t), session = host(t, a); await session.inspect(a.dir);
  const open = fs.open;
  for (const close of [false, true]) {
    const held = gate(), entered = gate(); let first = true, handleClosed = false;
    fs.open = async (file, ...args) => {
      const handle = await open(file, ...args);
      if (String(file) === a.latest.log && first) {
        first = false; const read = handle.read.bind(handle), end = handle.close.bind(handle);
        handle.read = async (...args) => { const value = await read(...args); entered.release(); await held.promise; return value; };
        handle.close = async () => { await end(); handleClosed = true; };
      }
      return handle;
    };
    const pending = session.readLog(a.latest.name, a.latest.runId).then(() => undefined, error => error);
    try {
      await entered.promise; let settled = false, closing;
      if (close) { closing = session.close().then(() => { settled = true; }); await tick(); assert.equal(settled, false); }
      else { await session.inspect(b.dir); await session.inspect(a.dir); }
      held.release(); assert.match(String(await pending), close ? /unavailable/ : /Project changed/);
      await closing; assert.equal(handleClosed, true);
    } finally { held.release(); await pending; fs.open = open; }
  }
});

async function interruptedPublication(f) {
  const controller = new AbortController(), rename = fs.rename, file = path.join(f.dir, 'rtl.toml');
  const release = await acquireImportLease(path.join(f.dir, '.rtl'));
  fs.rename = async (from, to) => { await rename(from, to); if (from === file) controller.abort(); };
  try { await assert.rejects(publishImportConfiguration(f.dir, createHash('sha256').update(f.manifest).digest('hex'), f.manifest.toString('utf8'), controller.signal), /abort/i); }
  finally { fs.rename = rename; await release(); }
  return (await readImportRecovery(f.dir))[0];
}

test('host preserves retained views during journal recovery, rejects unapproved/stale choices and restores runnable state explicitly', async t => {
  const f = await fixture(t), request = await interruptedPublication(f), session = host(t, f);
  const state = await session.inspect(f.dir); assert.equal(state.phase, 'error'); assert.equal(state.historyOnly, true);
  assert.equal(state.history.length, 2); assert.deepEqual(state.importRecovery, [request]); assert.equal(state.project, undefined);
  assert.throws(() => session.start(undefined, true), /rtl.toml/);
  assert.equal(await session.readLog(f.latest.name), 'retained latest log');
  assert.equal(await session.importRecoveryText(request, 'previous'), f.manifest.toString('utf8'));
  await assert.rejects(session.recoverImport(request, 'candidate', false), /確認|확인/); await assert.rejects(fs.stat(path.join(f.dir, 'rtl.toml')), /ENOENT/);
  const stale = await session.recoverImport({ ...request, revision: 'stale' }, 'candidate', true);
  assert.equal(stale.phase, 'error'); assert.match(stale.error, /바뀌었/); assert.equal(stale.importRecovery.length, 1);
  const restored = await session.recoverImport(request, 'candidate', true);
  assert.equal(restored.phase, 'idle'); assert.equal(restored.historyOnly, false); assert.deepEqual(restored.importRecovery, []);
  assert.equal(restored.tests[0].latest.runId, f.latest.runId); assert.equal((await readHistory(f.dir)).length, 2);
  assert.deepEqual(await fs.readFile(path.join(f.dir, 'rtl.toml')), f.manifest);
});

test('host recovery reads reject project A/B/A and close waits for their file handles', async t => {
  const a = await fixture(t), b = await fixture(t), request = await interruptedPublication(a), session = host(t, a);
  await session.inspect(a.dir); const open = fs.open;
  for (const close of [false, true]) {
    const held = gate(), entered = gate(); let first = true, handleClosed = false;
    fs.open = async (file, ...args) => {
      const handle = await open(file, ...args);
      if (String(file).endsWith(path.join(request.id, 'previous.toml')) && first) {
        first = false; const read = handle.read.bind(handle), end = handle.close.bind(handle);
        handle.read = async (...args) => { const value = await read(...args); entered.release(); await held.promise; return value; };
        handle.close = async () => { await end(); handleClosed = true; };
      }
      return handle;
    };
    const pending = session.importRecoveryText(request, 'previous').then(() => undefined, error => error);
    try {
      await entered.promise; let settled = false, closing;
      if (close) { closing = session.close().then(() => { settled = true; }); await tick(); assert.equal(settled, false); }
      else { await session.inspect(b.dir); await session.inspect(a.dir); }
      held.release(); assert.match(String(await pending), close ? /unavailable/ : /Project changed/);
      await closing; assert.equal(handleClosed, true);
    } finally { held.release(); await pending; fs.open = open; }
  }
});

test('host explicitly archives reviewed records, keeps runnable/history state and denies stale or unapproved requests', async t => {
  const f=await fixture(t);const journal=await populate(f.dir,40), session=host(t,f), state=await session.inspect(f.dir), plan=state.importJournal.archive;
  assert.equal(plan.count,8);await assert.rejects(session.archiveImport(plan,false),/확인/);assert.equal((await fs.readdir(journal.active)).length,40);
  const stale=await session.archiveImport({...plan,revision:'f'.repeat(64)},true);assert.match(stale.error,/바뀌었/);assert.equal(stale.importJournal.count,40);
  const restored=await session.archiveImport(stale.importJournal.archive,true);assert.equal(restored.phase,'idle');assert.equal(restored.importJournal.count,32);
  assert.equal(restored.history.length,2);assert.equal(restored.tests[0].latest.runId,f.latest.runId);assert.equal(restored.historyOnly,false);
  assert.deepEqual(await fs.readFile(path.join(f.dir,'rtl.toml')),f.manifest);
});

test('host close aborts retirement and joins a held directory move before returning, without late notifications', async t => {
  const f=await fixture(t), journal=await populate(f.dir,40), notices=[], session=new SimulationHostSession(state=>notices.push(state),f.service,new WaveformHost(workerFile));t.after(()=>session.close());
  const plan=(await session.inspect(f.dir)).importJournal.archive, rename=fs.rename, entered=gate(), held=gate();let first=true;
  fs.rename=async(from,to)=>{if(first&&path.dirname(from)===journal.active){first=false;entered.release();await held.promise;}return rename(from,to);};
  const work=session.archiveImport(plan,true);
  try {await entered.promise;const count=notices.length;let closed=false;const closing=session.close().then(()=>{closed=true;});await tick();assert.equal(closed,false);
    held.release();await work;await closing;assert.equal(notices.length,count);assert.equal((await fs.readdir(journal.active)).length,39);
    await assert.rejects(fs.stat(path.join(f.dir,'.rtl/import-review.lock')),/ENOENT/);
  } finally {held.release();await work;fs.rename=rename;}
});
