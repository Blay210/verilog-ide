const fs = require('node:fs/promises'), path = require('node:path'), { randomUUID, createHash } = require('node:crypto');
const { saveImportSettings } = require('../../dist/runtime/core/index.js');
const { publishImportConfiguration } = require('../../dist/runtime/core/import-publication.js');
const { acquireImportLease } = require('../../dist/runtime/core/import-lease.js');
module.exports.populate = async (root, count) => {
  const manifest = path.join(root, 'rtl.toml');
  if (!await fs.stat(manifest).catch(() => undefined)) await saveImportSettings(root, 'absent', {});
  await fs.mkdir(path.join(root, '.rtl'), { recursive: true });
  const text = await fs.readFile(manifest, 'utf8'), release = await acquireImportLease(path.join(root, '.rtl'));
  try { await publishImportConfiguration(root, createHash('sha256').update(text).digest('hex'), text); } finally { await release(); }
  const active = path.join(root, '.rtl/import-transactions'), names = await fs.readdir(active);
  const template = (await Promise.all(names.map(async id => ({ id, previous: await fs.stat(path.join(active, id, 'previous.toml')).catch(() => undefined) })))).find(value => value.previous).id;
  for (const name of names) if (name !== template) await fs.rm(path.join(active, name), { recursive: true });
  for (let i = 1; i < count; i++) {
    const id = randomUUID(), folder = path.join(active, id); await fs.mkdir(folder);
    for (const file of await fs.readdir(path.join(active, template))) {
      const value = await fs.readFile(path.join(active, template, file));
      await fs.writeFile(path.join(folder, file), file === 'intent.json' ? JSON.stringify({ ...JSON.parse(value), id }) : value);
    }
  }
  return { manifest, text, active, template };
};
