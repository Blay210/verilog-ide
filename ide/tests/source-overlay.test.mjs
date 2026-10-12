import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { root } from '../scripts/environment.mjs';
import { patches, sourceOverlay, applyPatches } from '../scripts/patches.mjs';

function fixture() {
  const source = fs.mkdtempSync(path.join(root, '.dev/source-overlay-check-'));
  const grouped = new Map();
  for (const patch of patches) grouped.set(patch.file, [...(grouped.get(patch.file) ?? []), patch.before]);
  for (const [name, anchors] of grouped) {
    const file = path.join(source, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, anchors.join('\n'));
  }
  fs.writeFileSync(path.join(source, 'product.json'), '{}');
  const hash = text => createHash('sha256').update(text).digest('hex');
  return { source, settings: { baselineSha256: hash('{}'), appliedSha256: hash('{}\n'), values: {}, remove: [] } };
}

test('owned source overlay is repeatable and refuses unmanaged target changes before writing', () => {
  const { source, settings } = fixture();
  applyPatches(source, settings);
  applyPatches(source, settings);
  const target = path.join(source, sourceOverlay[0].target);
  assert.equal(fs.readFileSync(target, 'utf8'), fs.readFileSync(path.join(root, sourceOverlay[0].source), 'utf8'));
  fs.writeFileSync(target, 'foreign modification');
  const patchFile = path.join(source, patches[0].file);
  fs.writeFileSync(patchFile, patches[0].before);
  assert.throws(() => applyPatches(source, settings), /Source overlay differs/);
  assert.equal(fs.readFileSync(patchFile, 'utf8'), patches[0].before);
  assert.equal(fs.readFileSync(target, 'utf8'), 'foreign modification');
});

test('source overlay cannot write outside the own upstream tree', () => {
  const { source, settings } = fixture();
  sourceOverlay.push({ source: sourceOverlay[0].source, target: '../outside.ts' });
  try { assert.throws(() => applyPatches(source, settings), /Source overlay escaped ide/); }
  finally { sourceOverlay.pop(); }
  assert.equal(fs.readFileSync(path.join(source, 'product.json'), 'utf8'), '{}');
});
