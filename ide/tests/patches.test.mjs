import test from 'node:test';
import assert from 'node:assert/strict';
import { patches, patchedText } from '../scripts/patches.mjs';

test('builtin control patch replaces user configuration with private development storage and is repeatable', () => {
  const patch = patches.find(p => p.id === 'local-builtin-control');
  const original = `header\n${patch.before}\nfooter`;
  const result = patchedText(original, patch);
  assert.equal(result, `header\n${patch.after}\nfooter`);
  assert.equal(patchedText(result, patch), result);
  assert.doesNotMatch(result, /os\.homedir/);
});
test('changed or ambiguous upstream anchors fail closed', () => {
  const patch = patches[0];
  for (const text of ['unrecognized upstream', `${patch.before}\n${patch.before}`, `${patch.before}\n${patch.after}`]) {
    assert.throws(() => patchedText(text, patch), /baseline differs/);
  }
});
