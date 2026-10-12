import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { compareSourceInventory } = require('../dist/runtime/core/source-sync.js');
const source = (path, kind = 'module', role = 'source') => ({ path, kind, role });
const top = (file, name) => ({ file, top: name, intent: 'simulation', displayName: `${file}.${name}` });
const preview = { packages: ['rtl/pkg.sv'], sources: ['rtl/연산 [0].sv'], includeDirs: ['rtl'], tests: [{ file: 'verification/tb.sv', top: 'first' }] };
const inventory = () => ({ sources: [source('rtl/pkg.sv', 'package'), source('rtl/연산 [0].sv'), source('rtl/defs.svh', 'header'), source('verification/tb.sv', 'module', 'simulation')], tops: [top('verification/tb.sv', 'first'), top('verification/tb.sv', 'ignored')], warnings: [] });
test('inventory comparison is stable, preserves intentionally unregistered tops and detects new tops without offset identity', () => {
  const base = inventory(); assert.equal(compareSourceInventory(base, preview, base).state, 'matching');
  const changed = inventory(); changed.tops.push(top('verification/새 테스트.sv', 'second'));
  const result = compareSourceInventory(changed, preview, base);
  assert.equal(result.state, 'changed'); assert.deepEqual(result.candidates, ['verification/새 테스트.sv.second']);
  assert.deepEqual(result.added, []); assert.deepEqual(result.removed, []);
  assert.equal(compareSourceInventory(changed, preview).state, 'matching');
});
test('common/package/header changes and missing registered tops remain separate from source-content stale results', () => {
  const base = inventory(), changed = inventory();
  changed.sources = changed.sources.filter(file => file.path !== 'rtl/연산 [0].sv');
  changed.sources.push(source('rtl/new.sv'), source('include/새 헤더.svh', 'header'));
  changed.sources[0].kind = 'module'; changed.tops = [];
  const result = compareSourceInventory(changed, preview, base);
  assert.equal(result.state, 'changed');
  assert.ok(result.added.includes('rtl/pkg.sv (분류 변경)'));
  assert.ok(result.added.includes('include/새 헤더.svh'));
  assert.ok(result.removed.includes('rtl/연산 [0].sv'));
  assert.ok(result.removed.includes('verification/tb.sv (first)'));
  assert.equal(new Set(result.added).size, result.added.length);
});
test('a removed header is detected even when its include directory remains configured', () => {
  const base = inventory(), changed = inventory(); changed.sources = changed.sources.filter(file => file.kind !== 'header');
  assert.deepEqual(compareSourceInventory(changed, preview, base).removed, ['rtl/defs.svh']);
});
