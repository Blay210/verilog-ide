const fs = require('node:fs/promises'), path = require('node:path');
const [directory, phase] = process.argv.slice(2), original = fs.rename;
fs.rename = async (from, to) => {
  if (phase === 'before' && from !== path.join(directory, 'rtl.toml')) return original(from, to);
  if (phase === 'after' && !String(to).endsWith('/complete.json') && !String(to).endsWith('\\complete.json')) return original(from, to);
  if (phase === 'after') await original(from, to);
  setInterval(() => {}, 1000); // Keep the owned writer alive at the crash boundary.
  process.send({ phase }); await new Promise(() => {});
};
const { readImportSettings, saveImportSettings } = require('../../dist/runtime/core/index.js');
(async () => {
  const saved = await readImportSettings(directory);
  await saveImportSettings(directory, saved.revision, { folders: [{ path: '', role: 'simulation' }] });
})().catch(error => { process.send({ error: String(error) }); process.exitCode = 1; });
