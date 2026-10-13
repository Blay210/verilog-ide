import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import { root } from './environment.mjs';
const require = createRequire(import.meta.url), fs = require('node:fs/promises');
const before = process.argv.includes('--before');
const core = require(before ? '../.dev/cloud/h7i-before-runtime/core/index.js' : '../dist/runtime/core/index.js');
const { populate } = require('../tests/helpers/import-journal.cjs');
const index = path.join(root, '.dev/cloud/h7i-save-fixtures.json');
let fixtures = await fs.readFile(index, 'utf8').then(JSON.parse).catch(error => { if (error.code !== 'ENOENT') throw error; });
if (!fixtures) {
  fixtures = [];
  for (const count of [32, 96]) for (const large of [false, true]) {
    const directory = await fs.mkdtemp(path.join(root, '.dev/cloud-h7i-save-'));
    const roles = large ? { files: Array.from({ length: 250 }, (_, i) => ({ path: `rtl/file-${i}-${'x'.repeat(220)}.sv`, role: 'source' })) } : {};
    await core.saveImportSettings(directory, 'absent', roles);
    await populate(directory, count);
    fixtures.push({ directory, count, roles });
  }
  await fs.writeFile(index, JSON.stringify(fixtures));
}
assert.equal(fixtures.length, 4);
const rows = [];
for (const fixture of fixtures) {
  assert.equal(path.dirname(path.resolve(fixture.directory)), path.join(root, '.dev'));
  assert.match(path.basename(fixture.directory), /^cloud-h7i-save-[A-Za-z0-9]+$/);
  assert.ok([32, 96].includes(fixture.count));
  const manifest = path.join(fixture.directory, 'rtl.toml'), active = path.join(fixture.directory, '.rtl/import-transactions');
  const original = await fs.readFile(manifest), names = new Set(await fs.readdir(active));
  assert.equal(names.size, fixture.count);
  const settings = await core.readImportSettings(fixture.directory);
  for (const operation of ['journal', 'settings', 'save']) {
    const samples = [];
    for (let i = 0; i < 3; i++) {
      const open = fs.open, readdir = fs.readdir, buffers = new WeakSet();
      let opens = 0, currentReads = 0, bytes = 0, bufferBytes = 0, maxBuffer = 0, listings = 0;
      fs.readdir = async (file, ...args) => { if (file === active) listings++; return readdir(file, ...args); };
      fs.open = async (file, ...args) => {
        const handle = await open(file, ...args); opens++;
        const read = handle.read.bind(handle);
        handle.read = async (...values) => {
          if (!buffers.has(values[0])) { buffers.add(values[0]); bufferBytes += values[0].length; maxBuffer = Math.max(maxBuffer, values[0].length); if (file === manifest) currentReads++; }
          const result = await read(...values); bytes += result.bytesRead; return result;
        };
        return handle;
      };
      const cpu = process.cpuUsage(), started = performance.now();
      try {
        if (operation === 'journal') assert.deepEqual(await core.readImportRecovery(fixture.directory), []);
        if (operation === 'settings') assert.equal((await core.readImportSettings(fixture.directory)).revision, settings.revision);
        if (operation === 'save') assert.equal((await core.saveImportSettings(fixture.directory, settings.revision, fixture.roles)).revision, settings.revision);
        const usage = process.cpuUsage(cpu);
        samples.push({ ms: performance.now() - started, cpuMs: (usage.user + usage.system)/1000, opens, currentReads, bytes, bufferBytes, maxBuffer, listings });
      } finally { fs.open = open; fs.readdir = readdir; }
      assert.deepEqual(await fs.readFile(manifest), original);
      // Reset only newly created records in this private diagnostic fixture.
      // This gives both versions the same root, journal entries and bytes.
      for (const name of await fs.readdir(active)) if (!names.has(name)) await fs.rm(path.join(active, name), { recursive: true });
      assert.equal((await fs.readdir(active)).length, fixture.count);
    }
    const median = key => samples.map(sample => sample[key]).sort((a,b) => a-b)[1];
    rows.push({ directory: fixture.directory, count: fixture.count, manifestBytes: original.length, operation, medianMs: median('ms'), medianCpuMs: median('cpuMs'), ...Object.fromEntries(['opens', 'currentReads', 'bytes', 'bufferBytes', 'maxBuffer', 'listings'].map(key => [key, median(key)])), samples });
  }
}
const receipt = { mode: before ? 'H7H before' : 'H7I after', scope: 'Same private synthetic roots, 32/96 settled records, small/250-role configurations; three sequential samples per operation. No GUI or simulation.', rows };
await fs.writeFile(path.join(root, `.dev/cloud/h7i-save-${before ? 'before' : 'after'}.json`), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt, null, 2));
