import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url);
const { discoverProject, saveImportSettings, confirmImportSettings, loadProject, discover } = require('../dist/runtime/core/index.js');
const { SlangProvider } = require('../dist/runtime/semantic/slang.js');
const { SimulationHostSession } = require('../dist/runtime/host.js');
const { SimulationService } = require('../dist/runtime/simulation.js');
async function fixture(t, source = 'module first; initial $finish; endmodule\nmodule second; initial $finish; endmodule\n') {
  const dir = await fs.mkdtemp(path.join(root, '.dev/import-confirm-한글 공백-'));
  const cache = await fs.mkdtemp(path.join(root, '.dev/import-confirm-cache-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true })); t.after(() => fs.rm(cache, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, 'verification')); await fs.writeFile(path.join(dir, 'verification/tb.sv'), source);
  const inventory = await discoverProject(dir, { folders: [{ path: 'verification', role: 'simulation' }] });
  const review = { inventory, folders: [{ path: 'verification', role: 'simulation' }], files: [], manifestRevision: 'absent' };
  const provider = new SlangProvider(path.join(os.homedir(), '.rtl-dev/tools/slang-11.0.0-python-3.14.7/python.exe'), path.join(root, 'language/python/analyze.py'), cache);
  return { dir, review, provider };
}
test('real confirmation converts pending TOML, host registers independent file.top tests and CLI reads the same configuration', async t => {
  const { dir, review, provider } = await fixture(t);
  const saved = await saveImportSettings(dir, 'absent', review);
  const backend = { id: 'verilator', capabilities: { waveforms: ['vcd'], timing: true, inputSnapshot: true }, check: async () => {}, build: async ({ directory }) => ({ executable: 'fixture', cwd: directory }), run: async () => {} };
  const host = new SimulationHostSession(() => {}, new SimulationService(async () => backend), undefined, async () => provider); t.after(() => host.close());
  await host.inspect(dir);
  const selection = { ids: host.state.review.inventory.tops.map(top => top.id) };
  await assert.rejects(host.confirmReview(selection, false), /신뢰/);
  await host.confirmReview(selection, true); assert.equal(host.state.error, undefined);
  assert.equal(host.state.review, undefined); assert.deepEqual(host.state.tests.map(target => target.name), ['tb.first', 'tb.second']);
  const project = await loadProject(dir); assert.equal(project.packageOrder, 'manifest');
  assert.deepEqual(project.tests.map(target => target.top), ['first', 'second']);
  const cli = spawnSync(process.execPath, [path.join(root, 'scripts/rtl.mjs'), 'check'], { cwd: dir, encoding: 'utf8' });
  assert.equal(cli.status, 0, cli.stderr); assert.deepEqual(JSON.parse(cli.stdout).tests, project.tests.map(({ name, top }) => ({ name, top })));
  host.start(['tb.second', 'tb.first'], true);
  const deadline = Date.now() + 10000;
  while (['running', 'cancelling'].includes(host.state.phase)) { assert.ok(Date.now() < deadline); await new Promise(resolve => setTimeout(resolve, 10)); }
  assert.ok(host.state.tests.every(target => target.latest.status === 'passed'));
  assert.equal(await fs.readFile(path.join(dir, 'verification/tb.sv'), 'utf8'), 'module first; initial $finish; endmodule\nmodule second; initial $finish; endmodule\n');
  assert.ok(saved.revision !== 'absent');
});
test('confirmation reanalyzes and rejects compiler errors, stale manifest and external edits during analysis', async t => {
  const { dir, review, provider } = await fixture(t, 'module first; missing_module u(); endmodule\n');
  const ids = review.inventory.tops.map(top => top.id);
  await assert.rejects(confirmImportSettings(review, { ids }, provider), /missing_module|Unknown/);
  assert.equal((await fs.readdir(dir)).includes('rtl.toml'), false);
  await fs.writeFile(path.join(dir, 'verification/tb.sv'), 'module first; endmodule\n');
  const saved = await saveImportSettings(dir, 'absent', review);
  await assert.rejects(confirmImportSettings(review, { ids }, provider), /changed/);
  const bytes = await fs.readFile(path.join(dir, 'rtl.toml'));
  const changing = { dependencies: (...args) => provider.dependencies(...args), hierarchy: async (...args) => {
    const result = await provider.hierarchy(...args); await fs.appendFile(path.join(dir, 'rtl.toml'), '# external edit\n'); return result;
  } };
  await assert.rejects(confirmImportSettings({ ...review, manifestRevision: saved.revision }, { ids }, changing), /manually changed/);
  assert.equal(await fs.readFile(path.join(dir, 'rtl.toml'), 'utf8'), bytes.toString() + '# external edit\n');
  assert.deepEqual(await fs.readdir(path.join(dir, '.rtl')), []);
});
test('literal file paths retain bracket filenames and reject traversal, links and generated folders', async t => {
  const { dir } = await fixture(t);
  const file = path.join(dir, 'verification/셀[0].sv'); await fs.writeFile(file, 'module cell0; endmodule\n');
  assert.deepEqual(await discover(dir, [{ file: 'verification/셀[0].sv' }]), [file]);
  await assert.rejects(discover(dir, [{ file: '../outside.sv' }]), /inside/);
  await assert.rejects(discover(dir, [{ file: '.rtl/generated.sv' }]), /inside/);
  await fs.symlink(path.join(dir, 'verification'), path.join(dir, 'linked'), 'junction');
  await assert.rejects(discover(dir, [{ file: 'linked/tb.sv' }]), /links/);
  await fs.unlink(path.join(dir, 'linked'));
});
test('cancelled and read-only confirmation preserve pending manifest and release writer lock', async t => {
  const { dir, review, provider } = await fixture(t);
  const saved = await saveImportSettings(dir, 'absent', review), pending = { ...review, manifestRevision: saved.revision };
  const file = path.join(dir, 'rtl.toml'), bytes = await fs.readFile(file), ids = review.inventory.tops.map(top => top.id);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(confirmImportSettings(pending, { ids }, provider, controller.signal), /abort/i);
  await fs.chmod(file, 0o444);
  try { await assert.rejects(confirmImportSettings(pending, { ids }, provider), /read-only|EPERM|EACCES/); } finally { await fs.chmod(file, 0o666); }
  assert.deepEqual(await fs.readFile(file), bytes); assert.deepEqual(await fs.readdir(path.join(dir, '.rtl')), []);
});
