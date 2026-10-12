import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url);
const { WaveViewStore } = require('../dist/runtime/waveform-views.js');
const { resolveView, retainMissing } = require('../dist/runtime/waveform/views.js');
const view = { id: 'control', name: '제어 신호', radix: 'hex', signals: [{ path: 'tb.count', expanded: true, color: 'amber' }, { path: 'tb.clk' }] };
test('per-test saved views persist order, style, default, missing paths and reject stale edits', async t => {
  const dir = await fs.mkdtemp(path.join(root, '.dev/views-한글 ')); t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const store = new WaveViewStore(dir, 'tb.top1', 'top1');
  const empty = await store.read(); assert.equal(empty.revision, 'empty');
  assert.deepEqual(await fs.readdir(dir), []);
  const saved = await store.edit({ action: 'save', revision: empty.revision, view });
  const defaultBook = await store.edit({ action: 'default', revision: saved.revision, id: view.id });
  assert.deepEqual(await new WaveViewStore(dir, 'tb.top1', 'top1').read(), defaultBook);
  assert.equal(defaultBook.book.defaultId, view.id);
  assert.deepEqual((await new WaveViewStore(dir, 'tb.top2', 'top2').read()).book.views, []);
  const second = await store.edit({ action: 'save', revision: defaultBook.revision, view: { ...view, id: 'clock', name: '클럭만', signals: [view.signals[1]] } });
  assert.equal(second.book.views.length, 2); assert.equal(second.book.defaultId, view.id);
  assert.deepEqual(resolveView(view, [{ id: 'new-count', path: 'tb.count' }]), { selected: ['new-count'], missing: ['tb.clk'] });
  assert.deepEqual(retainMissing([view.signals[0]], view, [{ path: 'tb.count' }]), view.signals);
  const outcomes = await Promise.allSettled([
    store.edit({ action: 'save', revision: second.revision, view: { ...view, name: '이름 변경' } }),
    new WaveViewStore(dir, 'tb.top1', 'top1').edit({ action: 'delete', revision: second.revision, id: view.id })
  ]);
  assert.equal(outcomes.filter(outcome => outcome.status === 'fulfilled').length, 1);
  assert.match(outcomes.find(outcome => outcome.status === 'rejected').reason.message, /another tab/);
  const current = await store.read();
  await assert.rejects(store.edit({ action: 'save', revision: current.revision, view: { ...view, id: 'duplicate', name: current.book.views[0].name } }), /collection/);
  const deleted = await store.edit({ action: 'delete', revision: current.revision, id: view.id });
  assert.equal(deleted.book.defaultId, undefined); assert.deepEqual(deleted.book.views.map(view => view.id), ['clock']);
  assert.deepEqual(await fs.readdir(dir), ['.rtl']);
  assert.equal((await fs.readdir(path.join(dir, '.rtl/waveform-views'))).filter(file => file.endsWith('.tmp')).length, 0);
});
test('damaged or linked saved settings never overwrite existing data', async t => {
  const dir = await fs.mkdtemp(path.join(root, '.dev/views-invalid-')); t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const store = new WaveViewStore(dir, 'test', 'top');
  await store.edit({ action: 'save', revision: 'empty', view });
  const directory = path.join(dir, '.rtl/waveform-views'); const file = path.join(directory, (await fs.readdir(directory))[0]);
  await fs.writeFile(file, '{damaged');
  await assert.rejects(store.read()); await assert.rejects(store.edit({ action: 'delete', revision: 'empty', id: view.id }));
  assert.equal(await fs.readFile(file, 'utf8'), '{damaged');
  await fs.rm(directory, { recursive: true });
  const outside = path.join(dir, 'outside'); await fs.mkdir(outside); await fs.symlink(outside, directory, 'junction');
  await assert.rejects(store.read(), /links/);
  await assert.rejects(store.edit({ action: 'save', revision: 'empty', view }), /links/);
  assert.deepEqual(await fs.readdir(outside), []);
});
