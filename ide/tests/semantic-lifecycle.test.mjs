import test from 'node:test';
import assert from 'node:assert/strict';
import { lifecycleFixture, statusFixture, deferred, tick } from '../scripts/helpers/semantic-lifecycle.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import Module from 'node:module';
import { transformSync } from 'esbuild';
import { root } from '../scripts/environment.mjs';
const settle = async () => { for (let i = 0; i < 4; i++) await tick(); };
const cleanup = (t, f) => t.after(() => f.cleanup().catch(() => {}));

test('restart burst uses one fresh probe and start with the latest configuration', async t => {
  const f = await lifecycleFixture(); cleanup(t, f); await f.restart();
  const baseline = f.stats.probes;
  f.api.workspace.home = 'latest tools';
  await Promise.all(Array.from({ length: 20 }, () => f.restart()));
  assert.equal(f.stats.probes - baseline, 1); assert.equal(f.stats.starts, 2); assert.equal(f.stats.stops, 1);
  assert.ok(f.clients.at(-1).options.initializationOptions.cache.includes('latest tools'));
});

test('analysis ready refreshes only the last live completion identity and ignores stale clients and disabled editing', async t => {
  const f=await lifecycleFixture();cleanup(t,f);await f.restart();
  const client=f.clients.at(-1),uri='file:///design.sv',position={line:4,character:8};
  const document={uri:{toString:()=>uri},version:2};
  const selection={isEmpty:true,active:{...position}};
  f.api.window.activeTextEditor={document,selection};
  assert.equal(client.options.initializationOptions.interactiveEditing,true);
  const notify=client.notifications.get('rtl/analysisReady');
  notify({uri,version:2});await settle();assert.equal(f.stats.executions.length,0,'no prior completion must not open suggest');
  assert.deepEqual(await client.options.middleware.provideCompletionItem(document,position,{}, {},()=>[]),[]);
  notify({uri,version:2});await settle();
  assert.deepEqual(f.stats.executions,[['rtlIde.editor.prepareCompletion',{uri,version:2,...position}],['rtlIde.editor.refreshCompletions',{uri,version:2,...position}]]);
  const count=f.stats.executions.length;
  for(const change of [()=>document.version=3,()=>selection.active.character=9,()=>selection.isEmpty=false,()=>f.api.workspace.isTrusted=false,()=>f.api.workspace.semantic=false]) {
    document.version=2;selection.active={...position};selection.isEmpty=true;f.api.workspace.isTrusted=true;f.api.workspace.semantic=true;
    change();notify({uri,version:2});await settle();assert.equal(f.stats.executions.length,count);
  }
  f.api.workspace.semantic=true;await f.restart();
  notify({uri,version:2});await settle();assert.equal(f.stats.executions.length,count,'previous client cannot refresh the new session');
  await f.close();f.clients.at(-1).notifications.get('rtl/analysisReady')({uri,version:2});await settle();assert.equal(f.stats.executions.length,count);
});
test('changes during a probe join cancellation and replace only with the newest probe', async t => {
  const entered = deferred(), gate = deferred(); let signal;
  const f = await lifecycleFixture({ probe: async current => { signal = current; entered.resolve(); await gate.promise; return 'verified'; } }); cleanup(t, f);
  await entered.promise;
  f.api.workspace.home = 'second tools'; const requests = Array.from({ length: 20 }, () => f.restart());
  assert.ok(signal.aborted); await settle(); assert.equal(f.stats.probes, 1); assert.equal(f.stats.clients, 0);
  gate.resolve(); await Promise.all(requests);
  assert.equal(f.stats.probes, 2); assert.equal(f.stats.clients, 1); assert.equal(f.stats.starts, 1);
  assert.ok(f.clients[0].options.initializationOptions.cache.includes('second tools'));
});
test('trust loss during probing prevents startup; grant performs a fresh check', async t => {
  const entered = deferred(), gate = deferred();
  const f = await lifecycleFixture({ probe: async () => { entered.resolve(); await gate.promise; return 'verified'; } }); cleanup(t, f);
  await entered.promise; f.api.workspace.isTrusted = false; gate.resolve(); await settle();
  assert.equal(f.stats.clients, 0); assert.equal((await f.status()).label, 'Trust required');
  f.api.workspace.isTrusted = true; await f.trust(); await f.restart(); assert.equal(f.stats.clients, 1);
});
test('disabling and disposal during a held probe cannot publish or create a late client', async t => {
  const entered = deferred(), gate = deferred();
  const f = await lifecycleFixture({ probe: async () => { entered.resolve(); await gate.promise; return 'verified'; } }); cleanup(t, f);
  await entered.promise; f.api.workspace.semantic = false; f.change(); const closed = f.close();
  let done = false; void closed.then(() => { done = true; }); await tick(); assert.equal(done, false);
  gate.resolve(); await closed; assert.equal(f.stats.clients, 0); assert.equal(f.stats.probes, 1);
  await f.restart(); assert.equal(f.stats.probes, 1);
});
test('drain and actual process close precede replacement; newer requests wait together', async t => {
  const f = await lifecycleFixture(); cleanup(t, f); await f.restart();
  const old = f.processes[0], original = old.gate.resolve, stopped = deferred(); old.gate.resolve = () => stopped.resolve();
  const transition = f.restart(); await stopped.promise;
  assert.equal(f.stats.drains, 1); assert.equal(f.stats.probes, 1);
  f.api.workspace.home = 'final tools'; const latest = Array.from({ length: 20 }, () => f.restart());
  await tick(); assert.equal(f.stats.clients, 1);
  original(); await Promise.all([transition, ...latest]);
  assert.equal(f.stats.probes, 2); assert.equal(f.stats.clients, 2); assert.equal(f.stats.stops, 1);
  assert.ok(f.clients[1].options.initializationOptions.cache.includes('final tools'));
});
test('a failed native stop quarantines retries even if a second stop would report success', async t => {
  const f = await lifecycleFixture({ stop: async (_, count) => { if (count === 1) throw Error('Native stop timed out'); } }); cleanup(t, f); await f.restart();
  await f.restart(); await Promise.all(Array.from({ length: 20 }, () => f.restart()));
  assert.equal(f.stats.probes, 1); assert.equal(f.stats.clients, 1); assert.equal(f.stats.stops, 1);
  assert.equal((await f.status()).label, 'Language cleanup failed');
  await assert.rejects(f.close(), /cleanup was not confirmed/);
});
test('unconfirmed drain refuses native parent stop and any replacement', async t => {
  const f = await lifecycleFixture({ drain: async () => ({ ready: false }) }); cleanup(t, f); await f.restart();
  await f.restart(); await f.restart();
  assert.equal(f.stats.stops, 0); assert.equal(f.stats.clients, 1);
  await assert.rejects(f.close(), /drain was not confirmed/);
});
test('a late startup is drained before the one latest replacement and never becomes Ready', async t => {
  const entered = deferred(), gate = deferred();
  const f = await lifecycleFixture({ start: async () => { entered.resolve(); await gate.promise; } }); cleanup(t, f);
  await entered.promise; assert.equal((await f.status()).label, 'Starting');
  f.api.workspace.home = 'new home'; const requests = Array.from({ length: 20 }, () => f.restart());
  gate.resolve(); await Promise.all(requests);
  assert.equal(f.stats.starts, 2); assert.equal(f.stats.stops, 1); assert.equal(f.stats.drains, 1);
  assert.ok(f.clients[1].options.initializationOptions.cache.includes('new home'));
  assert.equal((await f.status()).label, 'Ready');
});
test('unexpected disconnection disables library auto-restart and quarantines manual retries', async t => {
  const f = await lifecycleFixture(); cleanup(t, f); await f.restart();
  const result = await f.clients[0].options.errorHandler.closed(); assert.equal(result.action, 1);
  await f.restart(); assert.equal(f.stats.starts, 1); assert.equal((await f.status()).label, 'Language cleanup failed');
});
test('late old-client errors cannot quarantine a healthy replacement', async t => {
  const f = await lifecycleFixture(); cleanup(t, f); await f.restart(); const old = f.clients[0];
  await f.restart(); old.options.errorHandler.error(Error('Late old error')); old.options.errorHandler.closed();
  assert.equal((await f.status()).label, 'Ready'); await f.restart(); assert.equal(f.stats.clients, 3);
});
test('expected closing transport errors are covered by drain and exit proof, not a stale global failure', async t => {
  const f = await lifecycleFixture({ stop: async current => { current.options.errorHandler.error(Error('Closing transport')); } }); cleanup(t, f); await f.restart();
  await f.restart(); assert.equal(f.stats.clients, 2); assert.equal((await f.status()).label, 'Ready');
});
test('probe cleanup failure cannot fall through to another probe; ordinary tool failure can retry', async t => {
  const failure = Object.assign(Error('Probe cleanup refused'), { cleanupFailed: true });
  const blocked = await lifecycleFixture({ probe: async () => { throw failure; } }); cleanup(t, blocked);
  await blocked.restart(); await blocked.restart(); assert.equal(blocked.stats.probes, 1); assert.equal(blocked.stats.starts, 0);
  await assert.rejects(blocked.close(), error => error === failure);
  let calls = 0;
  const ordinary = await lifecycleFixture({ probe: async () => { if (++calls === 1) throw Error('Invalid compiler'); return 'verified'; } }); cleanup(t, ordinary);
  await settle(); assert.equal((await ordinary.status()).label, 'Tools invalid');
  await ordinary.restart(); assert.equal(ordinary.stats.starts, 1);
});
test('slow status reads never overlap and disposal prevents a late update or timer', async () => {
  const f = await statusFixture();
  try {
    for (let i = 0; i < 10; i++) await f.fire(); assert.equal(f.reads.length, 1);
    f.reads[0].resolve({ label: 'Ready', detail: 'first' }); await tick(); assert.equal(f.jobs.size, 1);
    await f.fire(); assert.equal(f.reads.length, 2);
    f.close(); f.reads[1].resolve({ label: 'Late', detail: '' }); await tick(); assert.equal(f.jobs.size, 0); assert.notEqual(f.bar.text, 'RTL: Late');
  } finally { f.close(); }
});
test('editor bursts refresh only the latest document and unfocused/non-RTL editors do not poll', async () => {
  const f = await statusFixture();
  try {
    f.api.window.activeTextEditor.document.uri.toString = () => 'file:///latest.sv';
    for (let i = 0; i < 20; i++) f.editor();
    f.reads[0].resolve({ label: 'Old', detail: '' }); await tick(); assert.equal(f.reads.length, 2); assert.equal(f.reads[1].uri, 'file:///latest.sv'); assert.notEqual(f.bar.text, 'RTL: Old');
    f.reads[1].resolve({ label: 'Ready', detail: '' }); await tick();
    f.api.window.state.focused = false; f.focus();
    for (let i = 0; i < 10; i++) await f.fire(); assert.equal(f.reads.length, 2); assert.equal(f.jobs.size, 0);
    f.api.window.state.focused = true; f.focus(); await tick(); assert.equal(f.reads.length, 3);
    f.api.window.activeTextEditor.document.languageId = 'plaintext'; f.editor(); f.reads[2].resolve({ label: 'Late', detail: '' }); await tick();
    assert.equal(f.jobs.size, 0); assert.equal(f.bar.visible, false);
  } finally { f.close(); }
});
test('transient status failure schedules one retry and dispose cancels it', async () => {
  const f = await statusFixture();
  try { f.reads[0].reject(Error('Transient status failure')); await tick(); assert.equal(f.jobs.size, 1); f.close(); await f.fire(); assert.equal(f.reads.length, 1); }
  finally { f.close(); }
});
test('extension deactivation joins both language and tool cleanup before reporting a failure', async () => {
  const language = deferred(), tools = deferred(), failure = Error('Language cleanup failed'); let closed = false;
  const filename = path.join(root, '.dev/deactivate-model.cjs'), loaded = new Module(filename);
  const code = transformSync(await fs.readFile(path.join(root, 'language/src/extension.ts'), 'utf8'), { loader: 'ts', format: 'cjs' }).code;
  loaded.require = name => name === './editor' ? { registerEditor() {} } : name === './semantic' ? { registerSemantic: () => () => language.promise } : name === './tools' ? { registerTools: () => () => tools.promise } : {};
  loaded._compile(code, filename); loaded.exports.activate({ subscriptions: [] });
  const closing = loaded.exports.deactivate().finally(() => { closed = true; });
  const rejected = assert.rejects(closing, error => error === failure);
  language.reject(failure); await tick(); assert.equal(closed, false);
  tools.resolve(); await rejected; assert.equal(closed, true);
});
