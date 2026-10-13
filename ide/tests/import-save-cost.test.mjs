import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url), fs = require('node:fs/promises');
const { populate } = require('./helpers/import-journal.cjs');
const { readImportSettings, saveImportSettings, readImportedExecution, readImportRecovery } = require('../dist/runtime/core/index.js');
const { acquireImportLease } = require('../dist/runtime/core/import-lease.js');
const { publishImportConfiguration } = require('../dist/runtime/core/import-publication.js');
const { createHash } = require('node:crypto');
const sha = text => createHash('sha256').update(text).digest('hex');
async function fixture(t, count = 12) {
  const dir = await fs.mkdtemp(path.join(root, '.dev/import-save-cost-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return { dir, ...await populate(dir, count), count };
}
test('settings and save keep bounded scan and buffer costs as active records grow', async t => {
  const f = await fixture(t), open = fs.open; let candidates = 0, largest = 0;
  fs.open = async (file, ...args) => {
    if (args[0] === 'r' && path.basename(file) === 'candidate.toml') candidates++;
    const handle = await open(file, ...args), read = handle.read.bind(handle);
    handle.read = async (...values) => { largest = Math.max(largest, values[0].length); return read(...values); };
    return handle;
  };
  try {
    const settings = await readImportSettings(f.dir);
    assert.ok(candidates <= f.count, 'settings must not rescan the entire journal for the same snapshot');
    candidates = 0;
    assert.equal((await saveImportSettings(f.dir, settings.revision, {})).revision, settings.revision);
    assert.ok(candidates <= 3 * f.count, 'save must share final validation with publication');
    assert.ok(largest <= Math.max(Buffer.byteLength(f.text) + 1, 512), 'small settings must not allocate a fixed 1 MiB read buffer');
  } finally { fs.open = open; }
});
test('managed settings and execution documents survive short OS reads without truncation', async t => {
  const f = await fixture(t), open = fs.open;
  // Model a valid managed file with no active journal as well as the ordinary path.
  await fs.rm(path.join(f.dir, '.rtl'), { recursive: true });
  const execution = '# RTL IDE imported execution project v1\nversion = 1\n\n[project]\nname = "Short reads"\n\n[sources]\nrtl = []\npackages = []\npackage_order = "manifest"\ninclude_dirs = []\n\n[simulation]\nbackend = "verilator"\ntiming = true\nwaveform = "vcd"\ntimeout_ms = 60000\njobs = 1\n\n# Import roles: {"folders":[],"files":[]}\n';
  fs.open = async (...args) => {
    const handle = await open(...args), read = handle.read.bind(handle);
    handle.read = (buffer, offset, length, position) => read(buffer, offset, Math.min(length, 11), position);
    return handle;
  };
  try {
    assert.equal((await readImportSettings(f.dir)).revision, sha(f.text));
    await fs.writeFile(f.manifest, execution);
    assert.equal((await readImportedExecution(f.dir)).revision, sha(execution));
  } finally { fs.open = open; }
});
test('same-byte interrupted publication during a read invalidates the journal snapshot', async t => {
  const f = await fixture(t), readdir = fs.readdir, rename = fs.rename; let hit = false;
  fs.readdir = async (file, ...args) => {
    const names = await readdir(file, ...args);
    if (file === f.active && !hit) {
      hit = true; const release = await acquireImportLease(path.join(f.dir, '.rtl'));
      fs.rename = async (from, to) => { if (path.basename(to) === 'complete.json') throw Error('Interrupted same-byte publication'); return rename(from, to); };
      try { await assert.rejects(publishImportConfiguration(f.dir, sha(f.text), f.text), /Interrupted/); }
      finally { fs.rename = rename; await release(); }
    }
    return names;
  };
  try { await assert.rejects(readImportSettings(f.dir), /journal changed|설정 복구/); }
  finally { fs.readdir = readdir; fs.rename = rename; }
  assert.ok(hit); assert.equal(await fs.readFile(f.manifest, 'utf8'), f.text);
  assert.equal((await readImportRecovery(f.dir)).length, 1);
});
test('a journal created while reading a previously journal-free configuration cannot be skipped', async t => {
  const f = await fixture(t), open = fs.open, rename = fs.rename;
  await fs.rm(path.join(f.dir, '.rtl'), { recursive: true }); let hit = false;
  fs.open = async (file, ...args) => {
    const handle = await open(file, ...args);
    if (file === f.manifest && args[0] === 'r' && !hit) {
      hit = true; await fs.mkdir(path.join(f.dir, '.rtl'));
      const release = await acquireImportLease(path.join(f.dir, '.rtl'));
      fs.rename = async (from, to) => { if (path.basename(to) === 'complete.json') throw Error('Interrupted first journal'); return rename(from, to); };
      try { await assert.rejects(publishImportConfiguration(f.dir, sha(f.text), f.text), /Interrupted/); }
      finally { fs.rename = rename; await release(); }
    }
    return handle;
  };
  try { await assert.rejects(readImportSettings(f.dir), /changed|설정 복구/); }
  finally { fs.open = open; fs.rename = rename; }
  assert.ok(hit); assert.equal((await readImportRecovery(f.dir)).length, 1);
});
test('a late write to an active previous file during temporary sync still blocks the optimized save', async t => {
  const f = await fixture(t), settings = await readImportSettings(f.dir), open = fs.open;
  const previous = path.join(f.active, f.template, 'previous.toml'), old = await fs.open(previous, 'r+');
  let hit = false;
  fs.open = async (file, ...args) => {
    const handle = await open(file, ...args);
    if (/import-review-[a-f0-9-]+\.tmp$/.test(String(file))) {
      const sync = handle.sync.bind(handle);
      handle.sync = async () => { await sync(); hit = true; await old.write(Buffer.from('# late old handle\n'), 0, 18, 0); };
    }
    return handle;
  };
  try { await assert.rejects(saveImportSettings(f.dir, settings.revision, {}), /설정 복구/); }
  finally { fs.open = open; await old.close(); }
  assert.ok(hit); assert.equal(await fs.readFile(f.manifest, 'utf8'), f.text);
  assert.equal((await fs.readdir(f.active)).length, f.count);
  assert.equal((await readImportRecovery(f.dir)).length, 1);
  assert.ok(!(await fs.readdir(path.join(f.dir, '.rtl'))).some(name => name.startsWith('import-review-')));
});
test('aborting a settings scan joins in-flight readers, closes handles and permits a fresh read', async t => {
  const f = await fixture(t), open = fs.open, controller = new AbortController(); let live = 0, hit = false;
  fs.open = async (file, ...args) => {
    const handle = await open(file, ...args), close = handle.close.bind(handle); live++;
    handle.close = async () => { try { await close(); } finally { live--; } };
    if (path.basename(file) === 'candidate.toml' && !hit) { hit = true; controller.abort(); }
    return handle;
  };
  try { await assert.rejects(readImportSettings(f.dir, controller.signal), /abort/i); assert.equal(live, 0); }
  finally { fs.open = open; }
  assert.ok(hit); assert.equal((await readImportSettings(f.dir)).revision, sha(f.text));
});
test('cancellation during the final journal listing cannot publish a ready settings result', async t => {
  const f = await fixture(t), readdir = fs.readdir, controller = new AbortController(); let listings = 0;
  fs.readdir = async (file, ...args) => {
    const result = await readdir(file, ...args);
    if (file === f.active && ++listings === 2) controller.abort();
    return result;
  };
  try { await assert.rejects(readImportSettings(f.dir, controller.signal), /abort/i); }
  finally { fs.readdir = readdir; }
  assert.equal(listings, 2); assert.equal((await readImportSettings(f.dir)).revision, sha(f.text));
});
