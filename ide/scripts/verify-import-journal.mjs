import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { root } from './environment.mjs';
const require = createRequire(import.meta.url), fs = require('node:fs/promises');
const before = process.argv.includes('--before');
const core = require(before ? '../.dev/cloud/h7h-before-runtime/core/index.js' : '../dist/runtime/core/index.js');
const stateFile = path.join(root, '.dev/cloud/h7h-journal-fixture.json');
let fixtures;
if (!before) {
  fixtures = await fs.readFile(stateFile, 'utf8').then(JSON.parse).catch(error => { if (error.code === 'ENOENT') return undefined; throw error; });
  if (fixtures) {
    if (!Array.isArray(fixtures) || !fixtures.every(fixture => typeof fixture.directory === 'string' && path.dirname(path.resolve(fixture.directory)) === path.join(root, '.dev') && /^cloud-h7h-journal-[A-Za-z0-9]+$/.test(path.basename(fixture.directory)) && [32, 64, 128].includes(fixture.count))) throw Error('Saved journal fixtures must remain in the private IDE diagnostic namespace.');
    const healthy = await Promise.all(fixtures.map(async fixture => {
      try { return (await fs.readdir(path.join(fixture.directory, '.rtl/import-transactions'))).length === fixture.count && (await fs.stat(path.join(fixture.directory, 'rtl.toml'))).size === fixture.manifestBytes; }
      catch (error) { if (error.code === 'ENOENT') return false; throw error; }
    }));
    if (healthy.some(value => !value)) fixtures = undefined;
  }
}
if (!fixtures) {
  fixtures = [];
  for (const count of [32, 64, 128]) {
    const directory = await fs.mkdtemp(path.join(root, '.dev/cloud-h7h-journal-'));
    const roles = { files: Array.from({ length: 250 }, (_, i) => ({ path: `rtl/file-${i}-${'x'.repeat(220)}.sv`, role: 'source' })) };
    const initial = await core.saveImportSettings(directory, 'absent', roles);
    await core.saveImportSettings(directory, initial.revision, roles);
    const active = path.join(directory, '.rtl/import-transactions'), names = await fs.readdir(active);
    const template = (await Promise.all(names.map(async id => ({ id, previous: await fs.stat(path.join(active, id, 'previous.toml')).catch(() => undefined) })))).find(value => value.previous).id;
    for (const name of names) if (name !== template) await fs.rm(path.join(active, name), { recursive: true });
    const files = await fs.readdir(path.join(active, template));
    for (let i = 1; i < count; i++) {
      const id = randomUUID(), folder = path.join(active, id); await fs.mkdir(folder);
      for (const file of files) {
        const value = await fs.readFile(path.join(active, template, file));
        await fs.writeFile(path.join(folder, file), file === 'intent.json' ? JSON.stringify({ ...JSON.parse(value), id }) : value);
      }
    }
    fixtures.push({ directory, count, manifestBytes: (await fs.stat(path.join(directory, 'rtl.toml'))).size });
  }
  await fs.writeFile(stateFile, JSON.stringify(fixtures));
}
const rows = [];
for (const fixture of fixtures) {
  const open = fs.open; let reads = 0, currentReads = 0, readBytes = 0;
  fs.open = async (file, ...args) => {
    const handle = await open(file, ...args); reads++; if (file === path.join(fixture.directory, 'rtl.toml')) currentReads++;
    const read = handle.read.bind(handle);
    handle.read = async (...args) => { const result = await read(...args); readBytes += result.bytesRead; return result; };
    return handle;
  };
  const times = [];
  try { for (let i = 0; i < 3; i++) { const started = performance.now(); assert.deepEqual(await core.readImportRecovery(fixture.directory), []); times.push(performance.now() - started); } }
  finally { fs.open = open; }
  rows.push({ ...fixture, medianMs: times.sort((a,b) => a-b)[1], opensPerScan: reads/3, currentReadsPerScan: currentReads/3, bytesPerScan: readBytes/3 });
}
const largest = fixtures.at(-1), original = await fs.readFile(path.join(largest.directory, 'rtl.toml'));
if (before) await assert.rejects(core.saveImportSettings(largest.directory, (await core.readImportSettings(largest.directory)).revision, {}), /128 transactions/);
else {
  const { journal } = await core.inspectImportJournal(largest.directory); assert.equal(journal.count, 128); assert.equal(journal.archive.count, 96);
  const receipt = await core.archiveImportJournal(largest.directory, journal.archive); assert.equal(receipt.count, 96);
  assert.deepEqual(await fs.readFile(path.join(largest.directory, 'rtl.toml')), original);
  assert.equal((await fs.readdir(path.join(largest.directory, '.rtl/import-transactions'))).length, 32);
  const saved = await core.saveImportSettings(largest.directory, (await core.readImportSettings(largest.directory)).revision, {}); assert.ok(saved.revision);
  rows.push({ archived: receipt, savedAfter128: true });
}
const receipt = { mode: before ? 'H7G before' : 'H7H after', scope: 'Private synthetic valid journals, 250 role paths, no RTL simulation or GUI; three samples per size.', rows };
await fs.writeFile(path.join(root, `.dev/cloud/h7h-journal-${before ? 'before' : 'after'}.json`), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt, null, 2));
