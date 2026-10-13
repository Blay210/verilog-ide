import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from './environment.mjs';
const require = createRequire(import.meta.url), fs = require('node:fs/promises');
const { saveImportSettings, readImportRecovery, readImportRecoveryText } = require('../dist/runtime/core/index.js');
const directory = await fs.mkdtemp(path.join(root, '.dev/cloud-h7f-writer-'));
const manifest = path.join(directory, 'rtl.toml'), rename = fs.rename;
const receipt = { directory, protected: false, injected: false, scope: 'Private fixture; external writer immediately before atomic capture of current manifest. No simulator/GUI.' };
try {
  const saved = await saveImportSettings(directory, 'absent', {});
  fs.rename = async (from, to) => {
    if (from === manifest) {
      receipt.injected = true;
      const external = (await fs.readFile(manifest, 'utf8')) + '# external edit after last revision check\n';
      await fs.writeFile(manifest, external);
      await fs.writeFile(path.join(directory, 'external-written.toml'), external);
    }
    return rename(from, to);
  };
  try { await saveImportSettings(directory, saved.revision, { folders: [{ path: '', role: 'simulation' }] }); }
  catch (error) { receipt.rejected = String(error); }
  assert.equal(receipt.injected, true);
  receipt.protected = (await fs.readFile(manifest, 'utf8')) === await fs.readFile(path.join(directory, 'external-written.toml'), 'utf8');
  const [recovery] = await readImportRecovery(directory); assert.ok(recovery);
  receipt.recovery = recovery;
  assert.equal(await readImportRecoveryText(directory, recovery, 'previous'), await fs.readFile(path.join(directory, 'external-written.toml'), 'utf8'));
  assert.match(await readImportRecoveryText(directory, recovery, 'candidate'), /simulation/);
  assert.ok(receipt.rejected); // Do not claim an unreviewed candidate was saved.
  if (!receipt.protected) { receipt.failure = 'External edit was overwritten in the final check/rename gap.'; process.exitCode = 1; }
} finally {
  fs.rename = rename;
  await fs.writeFile(path.join(directory, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify(receipt, null, 2));
}
