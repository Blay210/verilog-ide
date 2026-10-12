import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
const { SimulationHostSession } = createRequire(import.meta.url)('../dist/runtime/host.js');
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(root, '.dev/import-review-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, '검증 폴더'));
  await fs.writeFile(path.join(dir, '검증 폴더/two.sv'), 'module first; initial $finish; endmodule\nmodule second; initial $finish; endmodule\n');
  const host = new SimulationHostSession(() => {}); t.after(() => host.close());
  return { dir, host };
}
test('unconfigured import stays read-only; per-file roles override folders and refresh preserves review', async t => {
  const { dir, host } = await fixture(t);
  const before = await fs.readFile(path.join(dir, '검증 폴더/two.sv'));
  await host.inspect(dir);
  assert.equal(host.state.review.inventory.tops.length, 2);
  assert.equal(host.state.tests.length, 0);
  assert.throws(() => host.start(undefined, true), /rtl.toml/);
  await host.classify({ folders: [{ path: '검증 폴더', role: 'simulation' }] });
  assert.equal(host.state.review.inventory.sources[0].role, 'simulation');
  await host.inspect(dir);
  assert.equal(host.state.review.folders[0].role, 'simulation');
  await host.classify({ folders: host.state.review.folders, files: [{ path: '검증 폴더/two.sv', role: 'source' }] });
  assert.equal(host.state.review.inventory.sources[0].roleOrigin, 'file');
  assert.equal(host.state.review.inventory.sources[0].role, 'source');
  await host.classify({ folders: [{ path: '검증 폴더', role: 'excluded' }] });
  assert.equal(host.state.review.inventory.sources.length, 0);
  await host.classify({}); assert.equal(host.state.review.inventory.sources.length, 1);
  assert.deepEqual(await fs.readFile(path.join(dir, '검증 폴더/two.sv')), before);
  assert.deepEqual((await fs.readdir(dir)).sort(), ['검증 폴더']);
});
test('invalid IPC roles retain previous review; existing malformed manifest never falls back or rewrites', async t => {
  const { dir, host } = await fixture(t); await host.inspect(dir);
  await assert.rejects(host.classify({ files: [{ path: 'x', role: 'bad' }] }), /Invalid/);
  await host.classify({ files: [{ path: '../outside.sv', role: 'source' }] });
  assert.match(host.state.error, /relative/); assert.equal(host.state.review.inventory.sources.length, 1);
  await fs.writeFile(path.join(dir, 'rtl.toml'), 'broken = [');
  await host.inspect(dir); assert.equal(host.state.phase, 'error'); assert.equal(host.state.review, undefined);
  assert.equal(await fs.readFile(path.join(dir, 'rtl.toml'), 'utf8'), 'broken = [');
});
test('scan cancellation settles and allows retry; closed host rejects classification', async t => {
  const { dir, host } = await fixture(t); await host.inspect(dir);
  const work = host.classify({}); host.cancel(); await work;
  assert.equal(host.state.phase, 'idle'); assert.match(host.state.error, /취소/);
  await host.classify({}); assert.equal(host.state.error, undefined);
  await host.close(); await assert.rejects(host.classify({}), /closed/);
});
