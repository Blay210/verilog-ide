const fs = require('node:fs/promises'), path = require('node:path');
const [directory, phase] = process.argv.slice(2), originalRename = fs.rename, originalLink = fs.link;
async function pause() {
  setInterval(() => {}, 1000);
  process.send({ phase }); await new Promise(() => {});
}
fs.rename = async (from, to) => {
  if (phase === 'commit' && path.basename(to) === 'complete.json') await pause();
  await originalRename(from, to);
  if (phase === 'captured' && from === path.join(directory, 'rtl.toml')) await pause();
};
fs.link = async (from, to) => {
  if (to === path.join(directory, 'rtl.toml') && phase === 'link-before') await pause();
  await originalLink(from, to);
  if (to === path.join(directory, 'rtl.toml') && phase === 'link-after') await pause();
};
const { readImportSettings, saveImportSettings } = require('../../dist/runtime/core/index.js');
(async () => {
  const saved = await readImportSettings(directory);
  await saveImportSettings(directory, saved.revision, { folders: [{ path: '', role: 'simulation' }] });
})().catch(error => { process.send({ error: String(error) }); process.exitCode = 1; });
