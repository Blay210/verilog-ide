import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url);
const { SimulationService } = require('../dist/runtime/simulation.js');
const { readHistory, compareResultInputs, checkedProcess, loadRecordedTrace } = require('../dist/runtime/core/index.js');

async function fixture(t) {
  await fs.mkdir(path.join(root, '.dev'), { recursive: true });
  const dir = await fs.mkdtemp(path.join(root, '.dev/simulation-한글 공백-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, 'rtl')); await fs.mkdir(path.join(dir, 'tb'));
  await fs.writeFile(path.join(dir, 'rtl/dut.sv'), 'module dut; endmodule');
  await fs.writeFile(path.join(dir, 'tb/tests.sv'), 'module first; endmodule\nmodule second; endmodule');
  await fs.writeFile(path.join(dir, 'rtl.toml'), `version=1
[project]
name="fixture"
[sources]
rtl=["rtl/*.sv", "rtl/dut.sv"]
[simulation]
waveform="none"
jobs=4
[[test]]
name="first"
top="first"
sources=["tb/*.sv"]
[[test]]
name="second"
top="second"
sources=["tb/*.sv"]
`);
  return dir;
}
function backend(build) {
  return { id: 'verilator', capabilities: { waveforms: ['none', 'vcd', 'fst'], timing: true, inputSnapshot: true },
    check: async () => {}, build, run: async () => {} };
}

test('IDE service records ordered saved-input runs, history and changed-input state', async t => {
  const dir = await fixture(t), seen = [], completed = [];
  const service = new SimulationService(async () => backend(async ({ project, target, directory }) => {
    seen.push(target.name);
    assert.ok(project.sources.every(f => f.startsWith(directory)));
    assert.equal(project.sources.length, 1);
    return { executable: 'fake', cwd: directory };
  }));
  const results = await service.run({ root: dir, names: ['second', 'first', 'second'], jobs: 1 }, { onResult: result => completed.push(result.name) });
  assert.deepEqual(seen, ['second', 'first']); assert.deepEqual(completed, seen);
  assert.ok(results.every(r => r.status === 'passed' && r.inputSnapshot.state === 'ready'));
  assert.notEqual(results[0].runId, results[1].runId);
  assert.equal((await readHistory(dir)).length, 2);
  const project = await service.inspect(dir);
  assert.equal((await compareResultInputs(results[0], project)).state, 'matching');
  await fs.writeFile(path.join(dir, 'rtl/dut.sv'), 'module dut; logic modified; endmodule');
  assert.equal((await compareResultInputs(results[0], project)).state, 'changed');
  assert.equal(await fs.readFile(results[0].sources[0], 'utf8'), 'module dut; logic modified; endmodule');
  assert.deepEqual((await fs.readdir(dir)).sort(), ['.rtl', 'rtl', 'rtl.toml', 'tb']);
});

test('explicit parallel jobs permit two isolated builds while returned results preserve selection order', { timeout: 10000 }, async t => {
  const dir = await fixture(t), directories = new Set(); let active = 0, peak = 0, release;
  const both = new Promise(resolve => { release = resolve; });
  const service = new SimulationService(async () => backend(async ({ directory }) => {
    directories.add(directory); active++; peak = Math.max(peak, active); if (active === 2) release();
    await both; active--; return { executable: 'fake', cwd: directory };
  }));
  const results = await service.run({ root: dir, names: ['second', 'first'], jobs: 2 });
  assert.equal(peak, 2); assert.equal(directories.size, 2); assert.deepEqual(results.map(result => result.name), ['second', 'first']);
  assert.ok(results.every(result => result.status === 'passed' && result.inputSnapshot.state === 'ready'));
});
test('invalid selection/backend fails before tool lookup or generated files', async t => {
  const dir = await fixture(t); let lookups = 0;
  const service = new SimulationService(async () => { lookups++; throw Error('must not resolve'); });
  for (const names of [[], ['missing']]) await assert.rejects(service.run({ root: dir, names }), e => e.kind === 'project');
  for (const jobs of [0, 5, 1.5]) await assert.rejects(service.run({ root: dir, jobs }), e => e.kind === 'project');
  const manifest = path.join(dir, 'rtl.toml');
  await fs.writeFile(manifest, (await fs.readFile(manifest, 'utf8')).replace('waveform="none"', 'backend="unsupported"\nwaveform="none"'));
  await assert.rejects(service.run({ root: dir }), e => e.kind === 'project');
  assert.equal(lookups, 0); assert.equal(service.running, false);
  await assert.rejects(fs.access(path.join(dir, '.rtl')));
});

test('active run rejects duplicate requests; cancel completes and allows retry', async t => {
  const dir = await fixture(t);
  let started; const ready = new Promise(resolve => { started = resolve; });
  const service = new SimulationService(async () => backend(async ({ directory }, context) => {
    started();
    await checkedProcess({ executable: process.execPath, args: ['-e', 'setInterval(()=>{},1000)'], cwd: directory }, context);
    return { executable: 'fake', cwd: directory };
  }));
  const pending = service.run({ root: dir, jobs: 1 }); await ready;
  await assert.rejects(service.run({ root: dir }), e => e.kind === 'busy');
  service.cancel();
  const results = await pending;
  assert.equal(results.length, 1); assert.equal(results[0].status, 'cancelled'); assert.equal(service.running, false);
  await assert.rejects(service.run({ root: dir, names: ['missing'] }), e => e.kind === 'project');
});

test('build timeout and compilation failure are retained as different results', async t => {
  const dir = await fixture(t);
  const service = new SimulationService(async () => backend(async ({ target, directory }, context) => {
    if (target.name === 'first') throw Error('compile failure fixture');
    await checkedProcess({ executable: process.execPath, args: ['-e', 'setInterval(()=>{},1000)'], cwd: directory }, context);
    return { executable: 'fake', cwd: directory };
  }));
  await fs.appendFile(path.join(dir, 'rtl.toml'), 'timeout_ms=200\n');
  const results = await service.run({ root: dir });
  assert.deepEqual(results.map(r => r.status), ['failed', 'timedOut']);
  assert.match(await fs.readFile(results[0].log, 'utf8'), /compile failure/);
});

test('missing tools leave project editable and service available for retry', async t => {
  const dir = await fixture(t);
  const service = new SimulationService(async () => { throw Error('unavailable fixture'); });
  await assert.rejects(service.run({ root: dir }), e => e.kind === 'tool');
  assert.equal(service.running, false); assert.equal((await service.inspect(dir)).tests.length, 2);
  await assert.rejects(fs.access(path.join(dir, '.rtl')));
});

test('CLI uses the owned project reader and returns failure status for missing tests', async t => {
  const dir = await fixture(t);
  const cli = path.join(root, 'scripts/rtl.mjs');
  const check = spawnSync(process.execPath, [cli, 'check'], { cwd: dir, encoding: 'utf8', windowsHide: true });
  assert.equal(check.status, 0, check.stderr);
  assert.deepEqual(JSON.parse(check.stdout).tests.map(t => t.name), ['first', 'second']);
  const missing = spawnSync(process.execPath, [cli, 'test', 'missing'], { cwd: dir, encoding: 'utf8', windowsHide: true });
  assert.equal(missing.status, 1); assert.match(missing.stderr, /No tests match/);
});

test('cancellation during tool resolution and pre-cancelled requests release service', async t => {
  const dir = await fixture(t); let entered;
  const ready = new Promise(resolve => { entered = resolve; });
  const service = new SimulationService(async ({ signal }) => {
    entered();
    await new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(Error('tool probe cancelled')), { once: true });
    });
  });
  const running = service.run({ root: dir }); await ready; service.cancel();
  await assert.rejects(running, e => e.kind === 'cancelled');
  assert.equal(service.running, false);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(service.run({ root: dir }, { signal: controller.signal }), e => e.kind === 'cancelled');
  assert.equal(service.running, false);
});

test('runtime source imports and dependency lock stay inside the IDE ownership boundary', async () => {
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { await walk(file); continue; }
      if (!entry.name.endsWith('.ts')) continue;
      const contents = await fs.readFile(file, 'utf8');
      assert.doesNotMatch(contents, /@rtl-dev\/|vsix[/\\]|vscode/);
      for (const match of contents.matchAll(/(?:from\s+|import\()(['"])(\.[^'"]+)\1/g)) {
        const resolved = path.resolve(path.dirname(file), match[2]);
        assert.ok(resolved.startsWith(path.join(root, 'runtime') + path.sep), `${file}: ${match[2]}`);
      }
    }
  }
  await walk(path.join(root, 'runtime'));
  const lock = await fs.readFile(path.join(root, 'package-lock.json'), 'utf8');
  assert.doesNotMatch(lock, /"link"\s*:\s*true|file:|vsix[/\\]/);
  assert.match(await fs.readFile(path.join(root, 'runtime/LICENSE'), 'utf8'), /2026 RTL Dev contributors/);
});

test('retained VCD and FST bytes verify identity and reject later artifact modification', async t => {
  const dir = await fixture(t);
  const manifest = path.join(dir, 'rtl.toml'), original = await fs.readFile(manifest, 'utf8');
  for (const format of ['vcd', 'fst']) {
    await fs.writeFile(manifest, original.replace('waveform="none"', `waveform="${format}"`));
    const service = new SimulationService(async () => backend(async ({ directory }) => {
      await fs.writeFile(path.join(directory, `wave.${format}`), 'artifact identity fixture');
      return { executable: 'fake', cwd: directory };
    }));
    const [result] = await service.run({ root: dir, names: ['first'] });
    assert.equal(result.traceIdentity.state, 'ready');
    assert.equal((await loadRecordedTrace(result)).bytes.toString(), 'artifact identity fixture');
    await fs.writeFile(result.waveform, 'changed artifact');
    await assert.rejects(loadRecordedTrace(result), /modified/);
  }
});

test('explicit managed trace wins over earlier legacy filenames and missing trace does not fall back', async t => {
  const dir = await fixture(t), manifest = path.join(dir, 'rtl.toml');
  await fs.writeFile(manifest, (await fs.readFile(manifest, 'utf8')).replace('waveform="none"', 'waveform="vcd"'));
  for (const missing of [false, true]) {
    const adapter = backend(async ({ directory }) => {
      await fs.writeFile(path.join(directory, 'aaa-legacy.vcd'), 'legacy');
      if (!missing) await fs.writeFile(path.join(directory, 'managed.vcd'), 'managed');
      return { executable: 'fake', cwd: directory, waveform: path.join(directory, 'managed.vcd') };
    });
    adapter.capabilities.managedWaveform = true;
    const service = new SimulationService(async () => adapter);
    const [result] = await service.run({ root: dir, names: ['first'] });
    if (missing) { assert.equal(result.waveform, undefined); assert.match(result.message, /no RTL dump code is required/); }
    else { assert.equal(path.basename(result.waveform), 'managed.vcd'); assert.equal((await loadRecordedTrace(result)).bytes.toString(), 'managed'); }
  }
});

test('an explicit backend trace outside this run is rejected before simulation', async t => {
  const dir = await fixture(t), manifest = path.join(dir, 'rtl.toml');
  await fs.writeFile(manifest, (await fs.readFile(manifest, 'utf8')).replace('waveform="none"', 'waveform="vcd"'));
  let ran = false;
  const adapter = backend(async ({ directory }) => ({ executable: 'fake', cwd: directory, waveform: path.join(dir, 'outside.vcd') }));
  adapter.run = async () => { ran = true; };
  const [result] = await new SimulationService(async () => adapter).run({ root: dir, names: ['first'] });
  assert.equal(result.status, 'failed'); assert.match(result.message, /local artifact/); assert.equal(ran, false);
});
