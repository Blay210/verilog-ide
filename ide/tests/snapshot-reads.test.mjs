import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';

const require = createRequire(import.meta.url);
const fs = require('node:fs/promises');
const { SimulationService } = require('../dist/runtime/simulation.js');
const { SimulationHostSession } = require('../dist/runtime/host.js');
const { loadRecordedInputs } = require('../dist/runtime/core/index.js');
const tick = () => new Promise(resolve => setImmediate(resolve));
function gate() { let release; return { promise: new Promise(resolve => { release = resolve; }), release: () => release() }; }

async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(root, '.dev/snapshot-reads-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, 'rtl'));
  for (let i = 0; i < 16; i++) await fs.writeFile(path.join(dir, 'rtl', `unit${i}.sv`), `module unit${i}; endmodule\n`);
  await fs.writeFile(path.join(dir, 'rtl.toml'), 'version=1\n[project]\nname="reads"\n[sources]\nrtl=["rtl/*.sv"]\n[simulation]\nwaveform="none"\n[[test]]\nname="unit"\ntop="unit0"\nsources=["rtl/unit0.sv"]\n');
  const service = new SimulationService(async () => ({ id: 'verilator', capabilities: { waveforms: ['none'], timing: true, inputSnapshot: true },
    check: async () => {}, build: async ({ directory }) => ({ executable: 'synthetic', cwd: directory }), run: async () => {} }));
  const [result] = await service.run({ root: dir }); assert.equal(result.status, 'passed');
  const inputs = await loadRecordedInputs(result);
  return { dir, service, result, inputs };
}

test('each snapshot request revalidates all retained bytes, deletion, extra files and parent links', async t => {
  const { result, inputs } = await fixture(t);
  const file = inputs.sourceMappings.at(-1).recorded, bytes = await fs.readFile(file);
  await fs.chmod(file, 0o644); await fs.writeFile(file, 'changed late in the mapping list');
  await assert.rejects(loadRecordedInputs(result), /modified/);
  await fs.writeFile(file, bytes); assert.equal((await loadRecordedInputs(result)).sourceMappings.length, 16);
  await fs.unlink(file); await assert.rejects(loadRecordedInputs(result), /ENOENT/); await fs.writeFile(file, bytes);
  const extra = path.join(inputs.project.root, 'extra.sv'); await fs.writeFile(extra, 'unrecorded');
  await assert.rejects(loadRecordedInputs(result), /Unrecorded/); await fs.unlink(extra);
  const folder = path.join(inputs.project.root, 'rtl'), saved = path.join(result.directory, 'saved-rtl');
  await fs.rename(folder, saved); await fs.symlink(saved, folder, process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(loadRecordedInputs(result), /symlinks/); await fs.unlink(folder); await fs.rename(saved, folder);
  assert.equal((await loadRecordedInputs(result)).sourceMappings.length, 16);
});

test('duplicate or mismatched mappings never borrow another file identity', async t => {
  const { result } = await fixture(t), file = path.join(result.directory, 'input-snapshot.json');
  const original = await fs.readFile(file, 'utf8'), manifest = JSON.parse(original);
  manifest.mappings[1] = { ...manifest.mappings[0] }; await fs.writeFile(file, JSON.stringify(manifest));
  await assert.rejects(loadRecordedInputs(result), /Invalid snapshot mapping/);
  const changed = JSON.parse(original); changed.mappings[1].sha256 = '0'.repeat(64);
  await fs.writeFile(file, JSON.stringify(changed)); await assert.rejects(loadRecordedInputs(result), /identity mismatch/);
  await fs.writeFile(file, original); assert.equal((await loadRecordedInputs(result)).sourceMappings.length, 16);
});

test('a failed parallel read joins other active readers before rejecting', async t => {
  const { result, inputs } = await fixture(t);
  const bad = inputs.sourceMappings[0].recorded;
  await fs.chmod(bad, 0o644); await fs.writeFile(bad, 'damaged');
  const read = fs.readFile, entered = gate(), hold = gate(), badReturned = gate();
  let active = 0, peak = 0, settled = false;
  fs.readFile = async (file, ...args) => {
    if (!String(file).startsWith(inputs.project.root + path.sep)) return read(file, ...args);
    active++; peak = Math.max(peak, active);
    try {
      const bytes = await read(file, ...args);
      if (file === bad) { await entered.promise; badReturned.release(); }
      else { entered.release(); await hold.promise; }
      return bytes;
    } finally { active--; }
  };
  const outcome = loadRecordedInputs(result).then(() => { settled = true; return undefined; }, error => { settled = true; return error; });
  try {
    await badReturned.promise; await tick();
    assert.equal(settled, false); assert.ok(active > 0); assert.ok(peak <= 8);
    hold.release(); const error = await outcome; assert.match(String(error), /modified/); assert.equal(active, 0);
  } finally { hold.release(); await outcome; fs.readFile = read; }
});

test('abort during retained reads joins workers and cannot return a verified snapshot', async t => {
  const { result, inputs } = await fixture(t), controller = new AbortController();
  controller.abort(); await assert.rejects(loadRecordedInputs(result, controller.signal), /abort/i);
  const signal = new AbortController(), read = fs.readFile, entered = gate(), hold = gate(); let active = 0;
  fs.readFile = async (file, ...args) => {
    if (!String(file).startsWith(inputs.project.root + path.sep)) return read(file, ...args);
    active++;
    try { const bytes = await read(file, ...args); entered.release(); await hold.promise; return bytes; }
    finally { active--; }
  };
  const outcome = loadRecordedInputs(result, signal.signal).then(() => undefined, error => error);
  try {
    await entered.promise; signal.abort(); hold.release();
    assert.match(String(await outcome), /abort/i); assert.equal(active, 0);
  } finally { hold.release(); await outcome; fs.readFile = read; }
});

test('source reads reject a project A/B/A transition even when the root matches again', async t => {
  const a = await fixture(t), b = await fixture(t), host = new SimulationHostSession(() => {}, a.service);
  t.after(() => host.close()); await host.inspect(a.dir);
  const file = a.inputs.sourceMappings[0], relative = path.relative(a.inputs.project.root, file.recorded).split(path.sep).join('/');
  const read = fs.readFile, entered = gate(), hold = gate(); let first = true;
  fs.readFile = async (source, ...args) => {
    const bytes = await read(source, ...args);
    if (source === file.recorded && first) { first = false; entered.release(); await hold.promise; }
    return bytes;
  };
  const outcome = host.recordedSource(a.result.name, a.result.runId, relative).then(value => ({ value }), error => ({ error }));
  try {
    await entered.promise; await host.inspect(b.dir); await host.inspect(a.dir); hold.release();
    assert.match(String((await outcome).error), /Project changed/);
    assert.ok((await host.recordedSource(a.result.name, a.result.runId, relative)).text.includes('module'));
  } finally { hold.release(); await outcome; fs.readFile = read; }
});

test('host close aborts source reads and waits for their outstanding I/O', async t => {
  const { dir, service, result, inputs } = await fixture(t), host = new SimulationHostSession(() => {}, service);
  t.after(() => host.close()); await host.inspect(dir);
  const read = fs.readFile, entered = gate(), hold = gate(); let first = true, closed = false, active = 0;
  fs.readFile = async (file, ...args) => {
    if (!String(file).startsWith(inputs.project.root + path.sep)) return read(file, ...args);
    active++;
    try {
      const bytes = await read(file, ...args);
      if (first) { first = false; entered.release(); await hold.promise; }
      return bytes;
    } finally { active--; }
  };
  const outcome = host.recordedSources(result.name, result.runId).then(value => ({ value }), error => ({ error }));
  try {
    await entered.promise; const closing = host.close().then(() => { closed = true; }); await tick();
    assert.equal(closed, false); hold.release(); await closing;
    assert.match(String((await outcome).error), /unavailable/); assert.equal(active, 0);
  } finally { hold.release(); await outcome; fs.readFile = read; }
});

test('explicit comparison rejects project A/B/A changes while preserving a subsequent fresh request', async t => {
  const a = await fixture(t), b = await fixture(t), host = new SimulationHostSession(() => {}, a.service);
  t.after(() => host.close()); await host.inspect(a.dir);
  const inspect = a.service.inspect.bind(a.service), entered = gate(), hold = gate(); let first = true;
  a.service.inspect = async (...args) => { if (first) { first = false; entered.release(); await hold.promise; } return inspect(...args); };
  const outcome = host.compareRun(a.result.name, a.result.runId).then(value => ({ value }), error => ({ error }));
  try {
    await entered.promise; await host.inspect(b.dir); await host.inspect(a.dir); hold.release();
    assert.match(String((await outcome).error), /Project changed/);
    assert.equal((await host.compareRun(a.result.name, a.result.runId)).current.state, 'matching');
  } finally { hold.release(); await outcome; }
});
