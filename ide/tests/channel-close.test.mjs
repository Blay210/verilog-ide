import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transformSync } from 'esbuild';

const require = createRequire(import.meta.url);
const source = await fs.readFile(new URL('../src/rtlSimulationChannel.ts', import.meta.url), 'utf8');
const filename = path.resolve('.dev/channel-close.cjs');
const code = transformSync(source, { loader: 'ts', format: 'cjs', target: 'node24', define: { 'import.meta.url': JSON.stringify(pathToFileURL(filename).href) } }).code;
const tick = () => new Promise(resolve => setImmediate(resolve));

// Execute the owned Node IPC adapter; substitute only platform events/error routing and host failure.
function fixture() {
  const hosts = [], emitters = [], errors = [];
  class Disposable { dispose() { this.disposed = true; } }
  class Emitter {
    constructor() { emitters.push(this); }
    event = () => ({ dispose() {} }); fire() {} dispose() { this.disposed = true; }
  }
  const loaded = new Module(filename);
  loaded.require = name => name.endsWith('/event.js') ? { Emitter } : name.endsWith('/lifecycle.js') ? { Disposable }
    : name.endsWith('/errors.js') ? { onUnexpectedError: error => { errors.push(error); } }
      : name === './runtime.js' ? { createSimulationHost: () => {
        let resolve, reject;
        const work = new Promise((yes, no) => { resolve = yes; reject = no; });
        const host = { state: { phase: 'idle', tests: [] }, close: () => { host.closeCalls++; return work; }, closeCalls: 0, resolve, reject };
        hosts.push(host); return host;
      } } : require(name);
  loaded._compile(code, filename);
  return { channel: new loaded.exports.RtlSimulationChannel(), hosts, emitters, errors };
}

test('explicit IPC close awaits cleanup, returns its failure and always disposes events', async () => {
  const f = fixture(); await f.channel.call('window:1', 'state');
  const error = Error('Process cleanup failed (PID fixture)'), closing = f.channel.call('window:1', 'close');
  const rejected = assert.rejects(closing, value => value === error);
  assert.equal(f.emitters[0].disposed, undefined); f.hosts[0].reject(error); await rejected;
  assert.equal(f.emitters[0].disposed, true); assert.equal(f.errors.length, 0);
  await f.channel.call('window:1', 'state'); assert.equal(f.hosts.length, 2);
  f.hosts[1].resolve(); await f.channel.call('window:1', 'close'); f.channel.dispose();
});

test('recovery IPC preserves review identity, validates choice and requires literal approval for writes', async () => {
  const f = fixture(); await f.channel.call('window:1', 'state'); const calls = [];
  const request = { id: 'review', revision: 'stamp', current: true, previous: true, candidate: true };
  f.hosts[0].importRecoveryText = async (...args) => { calls.push(args); return 'readonly candidate'; };
  f.hosts[0].recoverImport = async (...args) => { calls.push(args); return f.hosts[0].state; };
  assert.equal(await f.channel.call('window:1', 'import-recovery-text', { recovery: request, choice: 'previous' }), 'readonly candidate');
  await f.channel.call('window:1', 'import-recover', { recovery: request, choice: 'candidate', approved: 'true' });
  await f.channel.call('window:1', 'import-recover', { recovery: request, choice: 'current', approved: true });
  assert.deepEqual(calls, [[request, 'previous'], [request, 'candidate', false], [request, 'current', true]]);
  await assert.rejects(f.channel.call('window:1', 'import-recover', { recovery: request, choice: '../rtl.toml', approved: true }), /후보/);
  await assert.rejects(f.channel.call('window:1', 'import-recovery-text', {}), /후보/);
  f.hosts[0].resolve(); await f.channel.call('window:1', 'close'); f.channel.dispose();
});

test('disconnect reports asynchronous cleanup failure without an unhandled rejection', async () => {
  const f = fixture(); await f.channel.call('window:1', 'state'); const error = Error('cleanup failed');
  f.channel.disconnect('window:1'); f.hosts[0].reject(error); await tick();
  assert.deepEqual(f.errors, [error]); assert.equal(f.emitters[0].disposed, true); f.channel.dispose();
});

test('channel disposal routes each asynchronous close failure and releases their event owners', async () => {
  const f = fixture(); await f.channel.call('window:1', 'state'); await f.channel.call('window:2', 'state');
  f.channel.dispose(); assert.ok(f.emitters.every(emitter => emitter.disposed));
  const a = Error('cleanup A failed'), b = Error('cleanup B failed'); f.hosts[0].reject(a); f.hosts[1].reject(b); await tick();
  assert.deepEqual(f.errors, [a, b]); assert.ok(f.hosts.every(host => host.closeCalls === 1));
});

test('archive IPC validates reviewed plan and never promotes truthy strings into write approval', async () => {
  const f=fixture();await f.channel.call('window:1','state');const calls=[], plan={revision:'review',count:32,retained:32,bytes:4096};
  f.hosts[0].archiveImport=async(...args)=>{calls.push(args);return f.hosts[0].state;};
  await f.channel.call('window:1','import-archive',{archive:plan,approved:'true'});await f.channel.call('window:1','import-archive',{archive:plan,approved:true});
  assert.deepEqual(calls,[[plan,false],[plan,true]]);await assert.rejects(f.channel.call('window:1','import-archive',{}),/계획/);
  f.hosts[0].resolve();await f.channel.call('window:1','close');f.channel.dispose();
});
