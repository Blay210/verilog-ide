import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url);
const { discoverProject, prepareImportTargets } = require('../dist/runtime/core/index.js');
const { SlangProvider } = require('../dist/runtime/semantic/slang.js');
const { SimulationHostSession } = require('../dist/runtime/host.js');
const { importProvider } = require('../dist/runtime/import-runtime.js');
async function fixture(t, source = 'module first; initial $finish; endmodule\nmodule second; initial $finish; endmodule\n') {
  const dir = await fs.mkdtemp(path.join(root, '.dev/import-targets-'));
  const cache = await fs.mkdtemp(path.join(root, '.dev/import-cache-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true })); t.after(() => fs.rm(cache, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, 'verification')); await fs.writeFile(path.join(dir, 'verification/tb.sv'), source);
  const inventory = await discoverProject(dir, { folders: [{ path: 'verification', role: 'simulation' }] });
  const review = { inventory, folders: [{ path: 'verification', role: 'simulation' }], files: [], manifestRevision: 'absent' };
  const provider = new SlangProvider(path.join(os.homedir(), '.rtl-dev/tools/slang-11.0.0-python-3.14.7/python.exe'), path.join(root, 'language/python/analyze.py'), cache);
  return { dir, review, provider };
}
test('real slang independently elaborates two selected tops and preview never creates manifest or outputs', async t => {
  const { dir, review, provider } = await fixture(t);
  const result = await prepareImportTargets(review, { ids: review.inventory.tops.map(top => top.id) }, provider);
  assert.deepEqual(result.tests.map(target => target.name), ['tb.first', 'tb.second']);
  assert.deepEqual(result.tests.map(target => target.file), ['verification/tb.sv', 'verification/tb.sv']);
  assert.deepEqual(await fs.readdir(dir), ['verification']);
  await assert.rejects(importProvider(dir, '', {}, path.join(dir, '..cache')), /outside the project/);
});
test('real semantic errors and changed top identities reject confirmation; cancellation leaves sources untouched', async t => {
  const { dir, review, provider } = await fixture(t, 'module first; missing_module u(); endmodule\n');
  await assert.rejects(prepareImportTargets(review, { ids: [review.inventory.tops[0].id] }, provider), /missing_module|unknown|Unknown/);
  await fs.writeFile(path.join(dir, 'verification/tb.sv'), '\nmodule different; endmodule\n');
  await assert.rejects(prepareImportTargets(review, { ids: [review.inventory.tops[0].id] }, provider), /changed|disappeared/);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(prepareImportTargets(review, { ids: [review.inventory.tops[0].id] }, provider, controller.signal), /abort/i);
  assert.deepEqual(await fs.readdir(dir), ['verification']);
});
test('package dependency order and header include paths are inferred while unsafe options fail before compiler', async t => {
  const { dir, provider } = await fixture(t, 'module first; import b_pkg::*; initial $display(V); endmodule\n');
  await fs.mkdir(path.join(dir, 'rtl')); await fs.mkdir(path.join(dir, 'inc'));
  await fs.writeFile(path.join(dir, 'rtl/a_consumer.sv'), 'package b_pkg; import a_pkg::*; localparam int V=A; endpackage\n');
  await fs.writeFile(path.join(dir, 'rtl/z_base.sv'), 'package a_pkg; localparam int A=1; endpackage\n');
  await fs.writeFile(path.join(dir, 'inc/defs.svh'), '`define X 1\n');
  const inventory = await discoverProject(dir, { folders: [{ path: 'verification', role: 'simulation' }] });
  const review = { inventory, folders: [{ path: 'verification', role: 'simulation' }], files: [], manifestRevision: 'absent' };
  const ids = inventory.tops.filter(top => top.top === 'first').map(top => top.id);
  const result = await prepareImportTargets(review, { ids }, provider);
  assert.deepEqual(result.packages, ['rtl/z_base.sv', 'rtl/a_consumer.sv']); assert.deepEqual(result.includeDirs, ['inc']);
  await assert.rejects(prepareImportTargets(review, { ids, includeDirs: ['../outside'] }, provider), /relative/);
  await assert.rejects(prepareImportTargets(review, { ids, defines: { RTL_FST: '1' } }, provider), /reserved/);
});
test('host guards trust, publishes real preview and classification invalidates it', async t => {
  const { dir, provider } = await fixture(t);
  let calls = 0;
  const host = new SimulationHostSession(() => {}, undefined, undefined, async () => { calls++; return provider; }); t.after(() => host.close());
  await host.inspect(dir); await host.classify({ folders: [{ path: 'verification', role: 'simulation' }] });
  const selection = { ids: host.state.review.inventory.tops.map(top => top.id) };
  await assert.rejects(host.prepareReview(selection, false), /신뢰/); assert.equal(calls, 0);
  await host.prepareReview(selection, true); assert.equal(host.state.error, undefined); assert.equal(host.state.importPreview.tests.length, 2);
  assert.equal(host.state.tests.length, 0); await host.classify({}); assert.equal(host.state.importPreview, undefined);
});
test('saved input changes during real analysis reject the preview; host cancellation permits retry', async t => {
  const { dir, review, provider } = await fixture(t);
  const ids = [review.inventory.tops[0].id];
  const changing = { dependencies: (...args) => provider.dependencies(...args), hierarchy: async (...args) => {
    const result = await provider.hierarchy(...args);
    await fs.appendFile(path.join(dir, 'verification/tb.sv'), '// changed during compiler call\n'); return result;
  } };
  await assert.rejects(prepareImportTargets(review, { ids }, changing), /changed during analysis/);
  let entered, hold = true;
  const ready = new Promise(resolve => { entered = resolve; });
  const host = new SimulationHostSession(() => {}, undefined, undefined, async (_root, context) => {
    if (hold) { entered(); await new Promise((_resolve, reject) => { context.signal.addEventListener('abort', () => reject(Error('cancelled')), { once: true }); }); }
    return provider;
  }); t.after(() => host.close());
  await host.inspect(dir);
  const selection = { ids: [host.state.review.inventory.tops[0].id] };
  const work = host.prepareReview(selection, true); await ready; host.cancel(); await work;
  assert.match(host.state.error, /취소/); assert.equal(host.state.importPreview, undefined);
  hold = false; await host.prepareReview(selection, true); assert.equal(host.state.error, undefined); assert.equal(host.state.importPreview.tests.length, 1);
});
