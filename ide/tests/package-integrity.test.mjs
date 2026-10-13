import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root } from '../scripts/environment.mjs';
import { integrityFiles, refreshPackageIntegrity, verifyPackageIntegrity } from '../scripts/package-integrity.mjs';

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(root, '.dev/integrity-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const name of integrityFiles) {
    const file = path.join(dir, 'out', name);
    fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, name);
  }
  fs.writeFileSync(path.join(dir, 'product.json'), JSON.stringify({ applicationName: 'rtl-ide', nameShort: 'Pulse', checksums: Object.fromEntries(integrityFiles.map(f => [f, 'old'])) }));
  return dir;
}
test('refreshed bundle hashes match upstream format and still detect subsequent corruption', t => {
  const dir = fixture(t);
  assert.throws(() => verifyPackageIntegrity(dir), /mismatch/);
  refreshPackageIntegrity(dir); assert.equal(verifyPackageIntegrity(dir).length, 10);
  fs.appendFileSync(path.join(dir, 'out', integrityFiles[1]), '\nnew bundle');
  assert.throws(() => verifyPackageIntegrity(dir), /mismatch/);
  refreshPackageIntegrity(dir); assert.equal(verifyPackageIntegrity(dir).length, 10);
  const product = JSON.parse(fs.readFileSync(path.join(dir, 'product.json')));
  assert.equal(product.nameShort, 'Pulse');
  assert.ok(Object.values(product.checksums).every(v => /^[A-Za-z0-9+/]{43}$/.test(v)));
});
test('unexpected integrity paths are rejected before changing product metadata', t => {
  const dir = fixture(t), file = path.join(dir, 'product.json');
  const product = JSON.parse(fs.readFileSync(file)); product.checksums['../escape'] = 'hash';
  fs.writeFileSync(file, JSON.stringify(product)); const before = fs.readFileSync(file);
  assert.throws(() => refreshPackageIntegrity(dir), /file list/);
  assert.deepEqual(fs.readFileSync(file), before);
});
