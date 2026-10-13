import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { RecordedSourceCache } = require('../dist/runtime/recorded-source-cache.js');
const bytes = text => new TextEncoder().encode(text);
function gate() { let release; return { promise: new Promise(resolve => { release = resolve; }), release }; }

test('byte LRU evicts older snapshots, retains recently used entries and permits verified reload', async () => {
  const cache = new RecordedSourceCache(8), loads = [];
  const read = key => cache.read(key, async () => { loads.push(key); return bytes(key.repeat(4)); });
  await read('a'); await read('b'); await read('a'); await read('c');
  assert.equal(cache.byteLength, 8); assert.equal(cache.size, 2); assert.deepEqual(loads, ['a', 'b', 'c']);
  await read('a'); await read('b'); assert.deepEqual(loads, ['a', 'b', 'c', 'b']);
  assert.equal(cache.byteLength, 8);
  // Eviction must revalidate through the loader; a damaged artifact is not a stale cache hit.
  await assert.rejects(cache.read('c', async () => { throw Error('Recorded source was modified.'); }), /modified/);
  assert.equal(cache.byteLength, 8); assert.equal(cache.size, 2);
});

test('metadata count bounds empty files and oversized values do not evict useful bytes', async () => {
  const cache = new RecordedSourceCache(8, 2);
  await cache.read('a', async () => bytes('aaaa'));
  await cache.read('huge', async () => bytes('0123456789')); assert.equal(cache.byteLength, 4); assert.equal(cache.size, 1);
  await cache.read('empty1', async () => new Uint8Array()); await cache.read('empty2', async () => new Uint8Array());
  assert.equal(cache.byteLength, 0); assert.equal(cache.size, 2);
  cache.release('empty1'); cache.release('absent'); assert.equal(cache.size, 1);
  cache.clear(); assert.equal(cache.size, 0);
});

test('simultaneous stat/read share one loader; failure is not cached and can be retried', async () => {
  const cache = new RecordedSourceCache(8), held = gate(); let calls = 0;
  const load = async () => { calls++; await held.promise; return bytes('data'); };
  const first = cache.read('same', load), second = cache.read('same', load);
  assert.equal(first, second); held.release(); assert.deepEqual(await first, await second); assert.equal(calls, 1);
  const fail = async () => { calls++; throw Error('read failed'); };
  const outcomes = await Promise.allSettled([cache.read('bad', fail), cache.read('bad', fail)]);
  assert.ok(outcomes.every(outcome => outcome.status === 'rejected')); assert.equal(calls, 2);
  await cache.read('bad', async () => bytes('okay')); assert.equal(cache.byteLength, 8);
});

test('model release and project clear invalidate pending loads without erasing a later request', async () => {
  const cache = new RecordedSourceCache(8), held = gate(), entered = gate();
  const old = cache.read('same', async () => { entered.release(); await held.promise; return bytes('old!'); });
  const rejected = assert.rejects(old, /cancelled/); await entered.promise; cache.release('same');
  const current = await cache.read('same', async () => bytes('new!')); held.release(); await rejected;
  assert.deepEqual(await cache.read('same', async () => { throw Error('should be cached'); }), current);
  const holdClear = gate(), enterClear = gate(), clearing = cache.read('other', async () => { enterClear.release(); await holdClear.promise; return bytes('late'); });
  const cleared = assert.rejects(clearing, /cancelled/); await enterClear.promise; cache.clear(); holdClear.release(); await cleared;
  assert.equal(cache.byteLength, 0); assert.equal(cache.size, 0);
});

test('window disposal drops bytes and rejects late results and later reads', async () => {
  const cache = new RecordedSourceCache(8), held = gate(), entered = gate();
  await cache.read('ready', async () => bytes('keep'));
  let called = false;
  const work = cache.read('loading', async () => { entered.release(); await held.promise; return bytes('late'); });
  const cancelled = assert.rejects(work, /cancelled/); await entered.promise;
  const queued = cache.read('unstarted', async () => { called = true; return bytes('never'); });
  const notStarted = assert.rejects(queued, /cancelled/);
  cache.dispose(); cache.dispose(); held.release(); await cancelled;
  await notStarted; assert.equal(called, false);
  assert.equal(cache.byteLength, 0); assert.equal(cache.size, 0);
  await assert.rejects(cache.read('new', async () => bytes('no')), /closed/);
});

test('production 64 MiB budget admits more files by eviction and counts UTF-8 bytes', async () => {
  const cache = new RecordedSourceCache();
  for (let i = 0; i < 5; i++) await cache.read(`file${i}`, async () => new Uint8Array(16 * 1024 * 1024));
  assert.equal(cache.byteLength, 64 * 1024 * 1024); assert.equal(cache.size, 4);
  await assert.rejects(cache.read('file0', async () => { throw Error('Evicted artifact must be reverified.'); }), /reverified/);
  cache.clear(); await cache.read('unicode', async () => bytes('🙂한글'));
  assert.equal(cache.byteLength, 10); cache.dispose(); assert.equal(cache.byteLength, 0);
});
