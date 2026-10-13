import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
await build({ entryPoints: ['language/src/semantic-work.ts'], outfile: '.dev/semantic-work.cjs', bundle: true, platform: 'node', format: 'cjs' });
const { SemanticWork, SemanticQueueFull } = createRequire(import.meta.url)('../.dev/semantic-work.cjs');
const deferred = () => { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve }; };
const tick = () => new Promise(resolve => setImmediate(resolve));
const signal = () => new AbortController();
test('identical concurrent semantic requests share work but settled results are never cached', async () => {
  const pool = new SemanticWork(), gate = deferred(); let calls = 0;
  const run = async () => { calls++; await gate.promise; return ['fresh']; };
  const requests = Array.from({ length: 30 }, () => pool.run('root:1:query', signal().signal, run));
  await tick(); assert.equal(calls, 1); gate.resolve();
  for (const result of await Promise.all(requests)) assert.deepEqual(result, ['fresh']);
  await pool.run('root:1:query', signal().signal, run); assert.equal(calls, 2);
  await pool.close();
});
test('one cancelled consumer cannot cancel peers sharing the same semantic query', async () => {
  const pool = new SemanticWork(), gate = deferred(), a = signal(), b = signal(); let shared;
  const run = async current => { shared = current; await gate.promise; return 42; };
  const first = pool.run('query', a.signal, run), peer = pool.run('query', b.signal, run);
  const rejected = assert.rejects(first, /abort/i);
  await tick(); a.abort(); await rejected; assert.equal(shared.aborted, false);
  gate.resolve(); assert.equal(await peer, 42); await pool.close();
});
test('all cancelled consumers keep the slot until actual cleanup and new work waits', async () => {
  const pool = new SemanticWork(1), gate = deferred(), a = signal(); let started = 0;
  const old = pool.run('same', a.signal, async current => { started++; await gate.promise; assert.ok(current.aborted); return 'late'; });
  const rejected = assert.rejects(old, /abort/i); await tick(); a.abort(); await rejected;
  const fresh = pool.run('same', signal().signal, async () => { started++; return 'current'; });
  await tick(); assert.equal(started, 1); gate.resolve();
  assert.equal(await fresh, 'current'); assert.equal(started, 2); await pool.close();
});
test('concurrency and pending capacity are bounded; cancelled queued work never starts', async () => {
  const pool = new SemanticWork(2, 2), gate = deferred(); let started = 0;
  const run = async () => { started++; await gate.promise; return 1; };
  const active = [pool.run('a', signal().signal, run), pool.run('b', signal().signal, run)];
  const cancel = signal(), queued = pool.run('c', cancel.signal, run), rejected = assert.rejects(queued, /abort/i);
  const last = pool.run('d', signal().signal, run);
  await assert.rejects(pool.run('overflow', signal().signal, run), error => error instanceof SemanticQueueFull);
  await tick(); assert.equal(started, 2); cancel.abort(); await rejected;
  gate.resolve(); await Promise.all([...active, last]); assert.equal(started, 3);
  await pool.run('overflow', signal().signal, run); assert.equal(started, 4); await pool.close();
});
test('close joins cleanup, discards late results, cancels waiting work and is repeatable', async () => {
  const pool = new SemanticWork(1), gate = deferred(); let ran = 0, closed = false;
  const active = pool.run('a', signal().signal, async () => { await gate.promise; return 'late'; });
  const queued = pool.run('b', signal().signal, async () => { ran++; });
  const rejects = [assert.rejects(active, /abort/i), assert.rejects(queued, /abort/i)];
  await tick(); const closing = pool.close().then(() => { closed = true; });
  await tick(); assert.equal(closed, false); assert.equal(ran, 0);
  gate.resolve(); await Promise.all([...rejects, closing]); await pool.close();
  await assert.rejects(pool.run('c', signal().signal, async () => {}), /closed/);
});
test('unconfirmed process cleanup quarantines the pool and cannot release a slot for new work', async () => {
  const pool = new SemanticWork(1), failure = Object.assign(Error('cleanup refused'), { cleanupFailed: true }); let calls = 0;
  const active = pool.run('a', signal().signal, async () => { throw failure; });
  const queued = pool.run('b', signal().signal, async () => { calls++; });
  await Promise.all([assert.rejects(active, error => error === failure), assert.rejects(queued, /abort/i)]);
  await assert.rejects(pool.run('c', signal().signal, async () => { calls++; }), error => error === failure);
  assert.equal(calls, 0); await assert.rejects(pool.close(), error => error === failure);
});
