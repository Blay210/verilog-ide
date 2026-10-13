import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';

const require = createRequire(import.meta.url);
const { SimulationService } = require('../dist/runtime/simulation.js');
const { SimulationHostSession } = require('../dist/runtime/host.js');
const { checkedProcess, createProject, readHistory } = require('../dist/runtime/core/index.js');
const { blockTermination, cleanupTree } = require('./helpers/termination-control.cjs');
const helper = path.join(root, 'tests/helpers/process-tree.cjs');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function alive(pid) {
  if (process.platform === 'linux') {
    try { const stat = await fs.readFile(`/proc/${pid}/stat`, 'utf8'); return !['Z','X'].includes(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[0]); }
    catch (error) { if (['ENOENT','ESRCH'].includes(error.code)) return false; throw error; }
  }
  try { process.kill(pid, 0); return true; } catch (error) { if (error.code === 'ESRCH') return false; throw error; }
}
async function stopped(pids) {
  const deadline = Date.now() + 3000;
  while ((await Promise.all(pids.map(alive))).some(Boolean) && Date.now() < deadline) await pause(10);
  assert.deepEqual(await Promise.all(pids.map(alive)), pids.map(() => false));
}
async function idle(host) {
  const deadline = Date.now() + 10000;
  while (['running','cancelling'].includes(host.state.phase)) { assert.ok(Date.now() < deadline); await pause(10); }
}
async function fixture(t, notify = () => {}) {
  const directory = await fs.mkdtemp(path.join(root, '.dev/process-host-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await createProject(directory, true);
  let runTree = false, ready; const entered = new Promise(resolve => { ready = resolve; });
  const pids = new Map(); let builds = 0;
  const service = new SimulationService(async () => ({ id: 'verilator', capabilities: { waveforms: ['vcd'], timing: true, inputSnapshot: true }, check: async () => {},
    build: async ({ directory }, context) => {
      builds++;
      if (runTree) {
        let log = '';
        await checkedProcess({ executable: process.execPath, args: [helper, '2'], cwd: directory }, { ...context, onLog: chunk => {
          context.onLog?.(chunk); log += chunk;
          for (const match of log.matchAll(/^TREE (.+)\n/gm)) { const row = JSON.parse(match[1]); pids.set(row.level, row.pid); }
          if (pids.size === 3) ready();
        } });
      }
      const waveform = path.join(directory, 'trace.vcd'); await fs.writeFile(waveform, '$enddefinitions $end\n#0\n');
      return { executable: 'synthetic', cwd: directory, waveform };
    }, run: async () => {} }));
  const host = new SimulationHostSession(notify, service); await host.inspect(directory);
  return { directory, host, service, pids, entered, tree: value => { runTree = value; }, builds: () => builds };
}

test('host cancel records one cancelled tree, preserves prior trace and permits a fresh retry', { timeout: 20000 }, async t => {
  const f = await fixture(t); t.after(() => f.host.close());
  f.host.start(['counter_basic'], true); await idle(f.host);
  const old = f.host.state.tests[0].latest, trace = await fs.readFile(old.waveform);
  f.tree(true); f.host.start(undefined, true); await f.entered;
  assert.throws(() => f.host.start(undefined, true), /busy/); f.host.cancel(); await idle(f.host);
  assert.equal(f.host.state.phase, 'idle'); assert.equal(f.service.running, false);
  assert.equal(f.host.state.tests[0].latest.status, 'cancelled'); assert.equal(f.host.state.history.length, 2);
  assert.equal(f.builds(), 2); await stopped([...f.pids.values()]); assert.deepEqual(await fs.readFile(old.waveform), trace);
  f.tree(false); f.host.start(['counter_basic'], true); await idle(f.host);
  assert.equal(f.host.state.tests[0].latest.status, 'passed'); assert.equal(f.host.state.history.length, 3);
});

test('host close joins its live tree, suppresses late notifications and preserves another active host', { timeout: 20000 }, async t => {
  let notifications = 0;
  const a = await fixture(t, () => { notifications++; }), b = await fixture(t);
  t.after(() => a.host.close()); t.after(() => b.host.close());
  a.tree(true); b.tree(true); a.host.start(['counter_basic'], true); b.host.start(['counter_basic'], true);
  await Promise.all([a.entered, b.entered]); const count = notifications; await a.host.close();
  assert.equal(a.host.state.tests[0].latest.status, 'cancelled'); await stopped([...a.pids.values()]);
  assert.ok((await Promise.all([...b.pids.values()].map(alive))).every(Boolean));
  await pause(150); assert.equal(notifications, count);
  b.host.cancel(); await idle(b.host); await stopped([...b.pids.values()]);
});

test('deadline kills a real tree and records timedOut separately from user cancellation', { timeout: 20000 }, async t => {
  const f = await fixture(t); t.after(() => f.host.close());
  const config = path.join(f.directory, 'rtl.toml');
  await fs.writeFile(config, (await fs.readFile(config, 'utf8')).replace('timeout_ms = 60000', 'timeout_ms = 3000'));
  await f.host.inspect(f.directory); f.tree(true); f.host.start(['counter_basic'], true);
  await f.entered; await idle(f.host);
  assert.equal(f.host.state.tests[0].latest.status, 'timedOut'); assert.equal(f.service.cleanupFailure, undefined);
  await stopped([...f.pids.values()]); f.tree(false); f.host.start(['counter_basic'], true); await idle(f.host);
  assert.equal(f.host.state.tests[0].latest.status, 'passed');
});

test('cleanup failure is persisted as failed, blocks further runs and rejects host close', { timeout: 20000 }, async t => {
  const f = await fixture(t); let restore = () => {};
  t.after(() => f.host.close().catch(() => {}));
  f.tree(true); f.host.start(undefined, true); await f.entered;
  const leader = f.pids.get(2);
  try {
    restore = blockTermination(leader);
    f.host.cancel(); await idle(f.host);
    assert.equal(f.host.state.phase, 'error'); assert.equal(f.host.state.tests[0].latest.status, 'failed');
    assert.match(f.host.state.error, /cleanup failed/); assert.equal(f.builds(), 1);
    const [record] = await readHistory(f.directory); assert.match(record.cleanupFailure, /PID/); assert.equal(record.status, 'failed');
    await assert.rejects(f.service.run({ root: f.directory }), error => error.kind === 'cleanup');
    await assert.rejects(f.host.close(), /cleanup failed/);
  } finally { restore(); await cleanupTree([...f.pids.values()], leader); await stopped([...f.pids.values()]); }
  const recovered = new SimulationHostSession(() => {}, new SimulationService(async () => ({ id: 'verilator', capabilities: { waveforms: ['vcd'], timing: true }, check: async () => {}, build: async ({ directory }) => ({ executable: 'synthetic', cwd: directory }), run: async () => {} })));
  t.after(() => recovered.close()); await recovered.inspect(f.directory); recovered.start(['counter_basic'], true); await idle(recovered);
  assert.equal(recovered.state.tests[0].latest.status, 'passed');
});

test('cleanup failure during tool resolution is not rewritten as ordinary cancellation', { timeout: 20000 }, async t => {
  const f = await fixture(t); let restore = () => {}; t.after(() => f.host.close());
  let ready; const entered = new Promise(resolve => { ready = resolve; }); const pids = new Map();
  const service = new SimulationService(async context => {
    let text = '';
    await checkedProcess({ executable: process.execPath, args: [helper, '2'], cwd: f.directory }, { ...context, onLog: chunk => {
      text += chunk; for (const match of text.matchAll(/^TREE (.+)\n/gm)) { const row = JSON.parse(match[1]); pids.set(row.level, row.pid); }
      if (pids.size === 3) ready();
    } });
    throw Error('tool probe should have been cancelled');
  });
  const outcome = service.run({ root: f.directory }).then(value => ({ value }), error => ({ error }));
  try {
    await entered; const leader = pids.get(2);
    restore = blockTermination(leader);
    service.cancel(); const { value, error } = await outcome;
    assert.equal(value, undefined); assert.equal(error.kind, 'cleanup'); assert.match(service.cleanupFailure, /PID/);
    await assert.rejects(service.run({ root: f.directory }), error => error.kind === 'cleanup');
  } finally { restore(); await cleanupTree([...pids.values()], pids.get(2)); await outcome; await stopped([...pids.values()]); }
});

test('result write failure cannot erase a process cleanup failure or permit retry', { timeout: 20000 }, async t => {
  const f = await fixture(t), write = fs.writeFile; let restore = () => {};
  t.after(() => f.host.close().catch(() => {}));
  f.tree(true); f.host.start(['counter_basic'], true); await f.entered; const leader = f.pids.get(2);
  try {
    restore = blockTermination(leader);
    fs.writeFile = (file, ...args) => String(file).endsWith('result.json.partial') ? Promise.reject(Error('injected result write failure')) : write(file, ...args);
    f.host.cancel(); await idle(f.host);
    assert.equal(f.host.state.phase, 'error'); assert.match(f.host.state.error, /cleanup failed.*finalization failed/);
    assert.match(f.service.cleanupFailure, /result write failure/);
    await assert.rejects(f.service.run({ root: f.directory }), error => error.kind === 'cleanup');
    assert.equal((await readHistory(f.directory)).length, 0); await assert.rejects(f.host.close(), /cleanup failed/);
  } finally { restore(); fs.writeFile = write; await cleanupTree([...f.pids.values()], leader); await stopped([...f.pids.values()]); }
});
