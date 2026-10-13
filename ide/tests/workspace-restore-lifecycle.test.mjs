import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import Module from 'node:module';
import { transformSync } from 'esbuild';

// Exercise the actual contribution constructor with services available but no
// workbench parts, the normal BlockRestore condition (no visible app needed).
const source = await fs.readFile(new URL('../src/rtlSpaces.contribution.ts', import.meta.url), 'utf8');
const code = transformSync(source.replace('class RtlSpaces extends', 'export class RtlSpaces extends'), { loader: 'ts', format: 'cjs', target: 'node22', tsconfigRaw: { compilerOptions: { experimentalDecorators: true } } }).code;
function fixture() {
  let resolve; const promise = new Promise(r => { resolve = r; });
  const evidence = { providers: 0, containers: 0, errors: [] };
  const decorator = () => undefined;
  class Disposable { items = []; _register(d) { this.items.push(d); return d; } dispose() { this.items.forEach(d => d.dispose()); } }
  class Home { constructor() { evidence.providers++; } dispose() {} }
  const module = new Module('restore-contribution');
  module.require = spec => {
    if (spec.endsWith('/window.js')) return { mainWindow: { document: { createElement: () => ({ setAttribute() {} }) } } };
    if (spec.endsWith('/common/lifecycle.js') && !spec.includes('/services/')) return { Disposable };
    if (spec.endsWith('/rtlSimulationHome.js')) return { RtlSimulationHome: Home };
    if (spec.endsWith('/product.js')) return { default: { applicationName: 'fixture' } };
    return new Proxy({}, { get: (_target, name) => name === 'LifecyclePhase' ? { Restored: 3 } : name === 'Parts' ? { EDITOR_PART: 'editor', ACTIVITYBAR_PART: 'activity' } : decorator });
  };
  module._compile(code, 'restore-contribution.cjs');
  const layout = { getContainer() { evidence.containers++; throw Error('fixture: DOM mount reached'); } };
  const instance = new module.exports.RtlSpaces(layout, {}, {}, {}, {}, {}, {}, { when: phase => { assert.equal(phase, 3); return promise; } }, {}, {}, {}, {}, {}, { error: e => evidence.errors.push(e.message) });
  return { instance, evidence, resolve };
}
test('providers register synchronously before restoration and DOM mounts only afterwards', async () => {
  const f = fixture(); assert.equal(f.evidence.providers, 1); assert.equal(f.evidence.containers, 0);
  f.resolve(); await new Promise(r => setImmediate(r));
  assert.equal(f.evidence.containers, 1); assert.deepEqual(f.evidence.errors, ['fixture: DOM mount reached']);
  f.instance.dispose();
});
test('disposal during restoration prevents late DOM work', async () => {
  const f = fixture(); f.instance.dispose(); f.resolve(); await new Promise(r => setImmediate(r));
  assert.equal(f.evidence.containers, 0); assert.deepEqual(f.evidence.errors, []);
});
