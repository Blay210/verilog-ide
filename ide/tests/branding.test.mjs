import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root } from '../scripts/environment.mjs';
import { prepareBranding } from '../scripts/prepare-branding.mjs';
import { createIcon } from '../scripts/icon.mjs';

test('branding accepts the owned icon repeatedly and refuses foreign resources without overwriting them', t => {
  const source = fs.mkdtempSync(path.join(root, '.dev/pulse-brand-'));
  t.after(() => fs.rmSync(source, { recursive: true, force: true }));
  const file = path.join(source, 'resources/win32/code.ico');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, createIcon());
  for(const name of ['code_70x70.png','code_150x150.png','VisualElementsManifest.xml'])fs.copyFileSync(path.join(root,'upstream/resources/win32',name),path.join(path.dirname(file),name));
  assert.equal(prepareBranding(source).name, 'Pulse');
  prepareBranding(source);
  fs.writeFileSync(file, 'foreign icon');
  assert.throws(() => prepareBranding(source), /icon differs/);
  assert.equal(fs.readFileSync(file, 'utf8'), 'foreign icon');
});
