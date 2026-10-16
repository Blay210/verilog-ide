import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import Module from 'node:module';
import { transformSync } from 'esbuild';

// Exercise the actual contribution constructor with services available but no
// workbench parts, the normal BlockRestore condition (no visible app needed).
const source = await fs.readFile(new URL('../src/rtlSpaces.contribution.ts', import.meta.url), 'utf8');
const code = transformSync(source.replace('class RtlSpaces extends', 'export class RtlSpaces extends'), { loader: 'ts', format: 'cjs', target: 'node22', tsconfigRaw: { compilerOptions: { experimentalDecorators: true } } }).code;
const intentModule=new Module('restore-intent');
intentModule._compile(transformSync(await fs.readFile(new URL('../src/rtlCompletionIntent.ts',import.meta.url),'utf8'),{loader:'ts',format:'cjs'}).code,'restore-intent.cjs');
function fixture(editorRestore = Promise.resolve(), noFolder = false, mountEntry = false) {
  let resolve; const promise = new Promise(r => { resolve = r; });
  const evidence = { providers: 0, containers: 0, errors: [], stored: [], starts: 0, visible: new Map([['sidebar', true], ['auxiliary', false], ['activity', true]]) };
  const shutdownListeners = [];
  const decorator = () => undefined;
  class Disposable { items = []; _register(d) { this.items.push(d); return d; } dispose() { this.items.forEach(d => d.dispose()); } }
  class Home { constructor() { evidence.providers++; } dispose() {} }
  const module = new Module('restore-contribution');
  module.require = spec => {
    if (spec.endsWith('/window.js')) return { mainWindow: { document: { createElement: () => ({ setAttribute() {} }) } } };
    if (spec.endsWith('/common/lifecycle.js') && !spec.includes('/services/')) return { Disposable };
    if (spec.endsWith('/rtlSimulationHome.js')) return { RtlSimulationHome: Home };
    if (spec.endsWith('/rtlCompletionIntent.js')) return intentModule.exports;
    if (spec.endsWith('/rtlProjectStart.js')) return { RtlProjectStart: class { constructor() { evidence.starts++; } element = { focus() {} }; dispose() {} } };
    if (spec.endsWith('/product.js')) return { default: { applicationName: 'fixture' } };
    return new Proxy({}, { get: (_target, name) => name === 'CommandsRegistry' ? { registerCommand: () => ({ dispose() {} }) } : name === 'LifecyclePhase' ? { Ready: 2, Restored: 3 } : name === 'Parts' ? { EDITOR_PART: 'editor', ACTIVITYBAR_PART: 'activity', SIDEBAR_PART: 'sidebar', AUXILIARYBAR_PART: 'auxiliary' } : decorator });
  };
  module._compile(code, 'restore-contribution.cjs');
  const layout = { setPartHidden(hidden, part) { evidence.visible.set(part, !hidden); }, isVisible: part => evidence.visible.get(part), onDidChangePartVisibility: () => ({ dispose() {} }), getContainer() { evidence.containers++; if (mountEntry) return { append() {} }; throw Error('fixture: DOM mount reached'); } };
  const lifecycle = { when: phase => { assert.equal(phase, noFolder ? 2 : 3); return promise; }, onWillShutdown: listener => { shutdownListeners.push(listener); return { dispose() {} }; } };
  const storage = { store: (key, value) => evidence.stored.push({ key, value }) };
  const instance = new module.exports.RtlSpaces(layout, {}, {}, {}, { getWorkspace: () => ({ folders: noFolder ? [] : [{}] }) }, {}, {}, lifecycle, {}, {}, {}, {}, {}, { error: e => evidence.errors.push(e.message) }, undefined, undefined, undefined, storage, { whenRestored: editorRestore });
  return { instance, evidence, resolve, shutdown: () => shutdownListeners.forEach(listener => listener()) };
}
test('providers register synchronously before restoration and DOM mounts only afterwards', async () => {
  const f = fixture(); assert.equal(f.evidence.providers, 1); assert.equal(f.evidence.containers, 0);
  f.resolve(); await new Promise(r => setImmediate(r));
  assert.equal(f.evidence.containers, 1); assert.deepEqual(f.evidence.errors, ['fixture: DOM mount reached']);
  f.instance.dispose();
});
test('empty window creates only project entry without simulation providers or waiting for editors', async () => {
 const f=fixture(new Promise(()=>{}),true);assert.equal(f.evidence.starts,1);assert.equal(f.evidence.providers,0);
 f.resolve();await new Promise(resolve=>setImmediate(resolve));assert.equal(f.evidence.containers,1);f.instance.dispose();
});

test('project entry hides navigation temporarily and restores prior layout before project transition', async () => {
 const f=fixture(Promise.resolve(),true,true), original=new Map(f.evidence.visible);
 f.resolve();await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual([...f.evidence.visible.values()],[false,false,false]);assert.deepEqual(f.evidence.errors,[]);
 f.shutdown();assert.deepEqual(f.evidence.visible,original);f.instance.dispose();assert.deepEqual(f.evidence.visible,original);
});

test('closing the project entry before Ready prevents a late project screen', async () => {
 const f=fixture(Promise.resolve(),true,true);f.shutdown();f.resolve();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(f.evidence.containers,0);assert.deepEqual(f.evidence.errors,[]);f.instance.dispose();
});
test('disposal during restoration prevents late DOM work', async () => {
  const f = fixture(); f.instance.dispose(); f.resolve(); await new Promise(r => setImmediate(r));
  assert.equal(f.evidence.containers, 0); assert.deepEqual(f.evidence.errors, []);
});
test('workbench Restored alone cannot mount over a still restoring source editor', async () => {
  let finishEditors;
  const f = fixture(new Promise(resolve => { finishEditors = resolve; }));
  f.resolve(); await new Promise(r => setImmediate(r));
  assert.equal(f.evidence.providers, 1); assert.equal(f.evidence.containers, 0);
  finishEditors(); await new Promise(r => setImmediate(r));
  assert.equal(f.evidence.containers, 1);
  assert.deepEqual(f.evidence.errors, ['fixture: DOM mount reached']);
  f.instance.dispose();
});
test('workspace changes and shutdown do not persist UI session state', () => {
  const f = fixture();
  f.instance.active = 'simulation';
  f.instance.navigation = {};
  f.instance.editor = { classList: { remove() {} } };
  f.instance.buttons.push({ setAttribute() {} }, { setAttribute() {} });
  f.shutdown();
  assert.deepEqual(f.evidence.stored, []);
  f.instance.show('code'); // Normal cleanup may restore the native editor layout.
  assert.equal(f.instance.active, 'code');
  assert.deepEqual(f.evidence.stored, []);
  f.instance.dispose();
});
test('shutdown before restoration keeps stored workspace untouched and blocks late mounting', async () => {
  const f = fixture(); f.shutdown(); f.resolve(); await new Promise(r => setImmediate(r));
  assert.deepEqual(f.evidence.stored, []);
  assert.equal(f.evidence.containers, 0);
  assert.deepEqual(f.evidence.errors, []);
  f.instance.dispose();
});
