const fs = require('node:fs/promises'), path = require('node:path');
const [root] = process.argv.slice(2), rename = fs.rename; let moved = 0;
fs.rename = async (from, to) => {
  await rename(from, to);
  if (path.dirname(from) === path.join(root, '.rtl/import-transactions') && ++moved === 3) {
    setInterval(() => {}, 1000); process.send({ moved }); await new Promise(() => {});
  }
};
const { inspectImportJournal, archiveImportJournal } = require('../../dist/runtime/core/index.js');
(async () => { const { journal } = await inspectImportJournal(root); await archiveImportJournal(root, journal.archive); })().catch(error => { process.send({error:String(error)}); process.exitCode=1; });
