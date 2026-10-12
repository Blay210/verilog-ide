import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url);
const { readImportSettings, saveImportSettings, loadProject } = require('../dist/runtime/core/index.js');
const { SimulationHostSession } = require('../dist/runtime/host.js');
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(root, '.dev/import-settings-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, '설계 폴더'));
  await fs.writeFile(path.join(dir, '설계 폴더/two.sv'), 'module first; endmodule\nmodule second; endmodule\n');
  return dir;
}
test('explicit role save restores a new host and keeps candidate tests unregistered; updates persist', async t => {
  const dir = await fixture(t), host = new SimulationHostSession(() => {}); t.after(() => host.close());
  await host.inspect(dir); await host.classify({ folders: [{ path: '설계 폴더', role: 'simulation' }] });
  await assert.rejects(host.saveReview(false), /승인/);
  assert.equal((await readImportSettings(dir)).revision, 'absent');
  await host.saveReview(true); assert.equal(host.state.error, undefined);
  const fresh = new SimulationHostSession(() => {}); t.after(() => fresh.close()); await fresh.inspect(dir);
  assert.equal(fresh.state.review.inventory.sources[0].role, 'simulation');
  assert.equal(fresh.state.review.inventory.tops.length, 2); assert.equal(fresh.state.tests.length, 0);
  assert.throws(() => fresh.start(undefined, true), /rtl.toml/);
  await assert.rejects(loadProject(dir), /import_review/);
  await fresh.classify({ files: [{ path: '설계 폴더/two.sv', role: 'source' }] }); await fresh.saveReview(true);
  assert.equal((await readImportSettings(dir)).roles.files[0].role, 'source');
  assert.equal(await fs.readFile(path.join(dir, '설계 폴더/two.sv'), 'utf8'), 'module first; endmodule\nmodule second; endmodule\n');
  assert.deepEqual(await fs.readdir(path.join(dir, '.rtl')), []);
});
test('stale windows and external edits never overwrite a managed or ordinary manifest', async t => {
  const dir = await fixture(t);
  const first = await saveImportSettings(dir, 'absent', {});
  const second = await saveImportSettings(dir, first.revision, { folders: [{ path: '', role: 'simulation' }] });
  const file = path.join(dir, 'rtl.toml'), bytes = await fs.readFile(file);
  await assert.rejects(saveImportSettings(dir, first.revision, {}), /changed/);
  assert.deepEqual(await fs.readFile(file), bytes);
  await fs.appendFile(file, '# user edit\n'); const edited = await fs.readFile(file);
  await assert.rejects(saveImportSettings(dir, second.revision, {}), /manually changed/);
  assert.deepEqual(await fs.readFile(file), edited);
  await fs.writeFile(file, 'version = 1\n[project]\nname = "existing"\n');
  assert.equal(await readImportSettings(dir), undefined);
  await assert.rejects(saveImportSettings(dir, 'absent', {}), /changed/);
  assert.equal(await fs.readFile(file, 'utf8'), 'version = 1\n[project]\nname = "existing"\n');
});
test('concurrent creation has one winner; cancellation, invalid paths and damaged settings keep data intact', async t => {
  const dir = await fixture(t);
  const outcomes = await Promise.allSettled([saveImportSettings(dir, 'absent', {}), saveImportSettings(dir, 'absent', {})]);
  assert.equal(outcomes.filter(result => result.status === 'fulfilled').length, 1);
  const saved = await readImportSettings(dir), file = path.join(dir, 'rtl.toml'), bytes = await fs.readFile(file);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(saveImportSettings(dir, saved.revision, {}, controller.signal), /abort/i);
  const during = new AbortController();
  const cancelled = saveImportSettings(dir, saved.revision, {}, during.signal); during.abort();
  await assert.rejects(cancelled, /abort/i);
  await assert.rejects(saveImportSettings(dir, saved.revision, { files: [{ path: '../escape.sv', role: 'source' }] }), /relative/);
  await assert.rejects(saveImportSettings(dir, saved.revision, { files: [{ path: '.rtl/generated.sv', role: 'source' }] }), /Generated/);
  assert.deepEqual(await fs.readFile(file), bytes); assert.deepEqual(await fs.readdir(path.join(dir, '.rtl')), []);
  await fs.writeFile(file, 'broken = ['); await assert.rejects(readImportSettings(dir));
  await assert.rejects(saveImportSettings(dir, saved.revision, {})); assert.equal(await fs.readFile(file, 'utf8'), 'broken = [');
});
test('read-only and linked manifests/settings directories are rejected', async t => {
  const dir = await fixture(t), saved = await saveImportSettings(dir, 'absent', {}), file = path.join(dir, 'rtl.toml');
  await fs.chmod(file, 0o444);
  try { await assert.rejects(saveImportSettings(dir, saved.revision, {}), /read-only|EPERM|EACCES/); }
  finally { await fs.chmod(file, 0o666); }
  const external = await fixture(t); await fs.writeFile(path.join(external, 'outside.toml'), 'outside');
  await fs.unlink(file); await fs.link(path.join(external, 'outside.toml'), file);
  await assert.rejects(readImportSettings(dir), /linked/); assert.equal(await fs.readFile(path.join(external, 'outside.toml'), 'utf8'), 'outside');
  await fs.unlink(file); await fs.rmdir(path.join(dir, '.rtl')); await fs.symlink(external, path.join(dir, '.rtl'), 'junction');
  await assert.rejects(saveImportSettings(dir, 'absent', {}), /link/);
  assert.deepEqual((await fs.readdir(external)).sort(), ['outside.toml', '설계 폴더']);
  await fs.unlink(path.join(dir, '.rtl'));
});
