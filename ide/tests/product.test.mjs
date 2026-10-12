import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { root } from '../scripts/environment.mjs';
import { productText, productConfig, patches, patchedText, applyPatches } from '../scripts/patches.mjs';

const hash = text => createHash('sha256').update(text).digest('hex');
test('multiple patches in the same file compose without overwriting earlier guards', () => {
  const fixture = fs.mkdtempSync(path.join(root, '.dev/multi-patch-'));
  const grouped = new Map();
  for (const patch of patches) grouped.set(patch.file, [...(grouped.get(patch.file) ?? []), patch]);
  for (const [file, group] of grouped) {
    const target = path.join(fixture, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, group.map(p => p.before).join('\n'));
  }
  const settings = { baselineSha256: hash('{}'), appliedSha256: hash('{}\n'), values: {}, remove: [] };
  fs.writeFileSync(path.join(fixture, 'product.json'), 'unknown');
  assert.throws(() => applyPatches(fixture, settings), /Product baseline differs/);
  for (const patch of patches) assert.ok(fs.readFileSync(path.join(fixture, patch.file), 'utf8').includes(patch.before), patch.id);
  fs.writeFileSync(path.join(fixture, 'product.json'), '{}');
  applyPatches(fixture, settings);
  applyPatches(fixture, settings);
  for (const patch of patches) assert.ok(fs.readFileSync(path.join(fixture, patch.file), 'utf8').includes(patch.after), patch.id);
});
test('product overlay preserves license, separates identity and removes downloadable features', () => {
  const text = JSON.stringify({ nameShort: 'Code - OSS', licenseName: 'MIT', defaultChatAgent: { id: 'old' }, extensionsGallery: { serviceUrl: 'old' } });
  const expected = JSON.stringify({ applicationName: 'rtl-ide', licenseName: 'MIT', nameShort: 'RTL IDE' }, null, '\t') + '\n';
  const config = { baselineSha256: hash(text), appliedSha256: hash(expected), values: { nameShort: 'RTL IDE', applicationName: 'rtl-ide' }, remove: ['defaultChatAgent', 'extensionsGallery'] };
  assert.equal(productText(text, config), expected);
  assert.equal(productText(expected, config), expected);
  assert.equal(productText(text, { ...config, baselineSha256: hash('old'), previousAppliedSha256: hash(text) }), expected);
  assert.throws(() => productText(text + ' ', config), /baseline differs/);
  assert.throws(() => productText(text, { ...config, values: { applicationName: 'bad' } }), /overlay digest differs/);
});

test('every install entry guard rejects RTL IDE before side effects, and leaves upstream behavior alone', () => {
  const ids = ['no-vsix-install', 'no-location-install', 'no-profile-install', 'no-gallery-install', 'no-install-task'];
  class ExtensionManagementError extends Error { constructor(message, code) { super(message); this.code = code; } }
  const ExtensionManagementErrorCode = { NotAllowed: 'not-allowed' };
  for (const id of ids) {
    const patch = patches.find(p => p.id === id);
    assert.ok(patch, id);
    const guard = patch.after.slice(patch.before.length);
    const evaluate = new Function('ExtensionManagementError', 'ExtensionManagementErrorCode', guard + '\nreturn "continued";');
    assert.throws(() => evaluate.call({ productService: { applicationName: 'rtl-ide' } }, ExtensionManagementError, ExtensionManagementErrorCode), e => e.code === 'not-allowed');
    assert.equal(evaluate.call({ productService: { applicationName: 'code-oss' } }, ExtensionManagementError, ExtensionManagementErrorCode), 'continued');
    assert.equal(patchedText(patch.after, patch), patch.after);
  }
});

test('RTL Chat policy stays hidden even when the user setting requests AI', () => {
  const patch = patches.find(p => p.id === 'rtl-chat-hidden');
  const body = patch.after + ' return true; } return false;';
  const evaluate = new Function('product', 'ChatAIDisabledSettingId', body);
  const context = { _forceHidden: false, configurationService: { getValue: () => false } };
  assert.equal(evaluate.call(context, { applicationName: 'rtl-ide' }, 'chat.disableAIFeatures'), true);
  assert.equal(evaluate.call(context, { applicationName: 'code-oss' }, 'chat.disableAIFeatures'), false);
});
