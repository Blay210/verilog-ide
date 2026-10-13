import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url), fs = require('node:fs/promises');
const { readImportSettings, saveImportSettings, readImportRecovery, readImportRecoveryText, resolveImportRecovery, loadProject } = require('../dist/runtime/core/index.js');
const { publishImportConfiguration } = require('../dist/runtime/core/import-publication.js');
const { acquireImportLease } = require('../dist/runtime/core/import-lease.js');
const sha = value => createHash('sha256').update(value).digest('hex');
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(root, '.dev/import-publication-')); t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const saved = await saveImportSettings(dir, 'absent', {}), manifest = path.join(dir, 'rtl.toml'), original = await fs.readFile(manifest, 'utf8');
  return { dir, saved, manifest, original };
}
async function conflict(f) {
  const rename = fs.rename, external = f.original + '# external\n'; let hit = false;
  fs.rename = async (from, to) => {
    if (!hit && from === f.manifest) { hit = true; await fs.writeFile(f.manifest, external); }
    return rename(from, to);
  };
  try { await assert.rejects(saveImportSettings(f.dir, f.saved.revision, { folders: [{ path: '', role: 'simulation' }] }), /changed during publication/); }
  finally { fs.rename = rename; }
  assert.ok(hit); const [request] = await readImportRecovery(f.dir); assert.ok(request); return { request, external };
}

test('final publication captures and preserves both in-place and atomic external replacements', async t => {
  for (const atomic of [false, true]) {
    const f = await fixture(t), rename = fs.rename, external = f.original + `# external ${atomic}\n`; let hit = false;
    fs.rename = async (from, to) => {
      if (!hit && from === f.manifest) {
        hit = true;
        if (atomic) { const other = path.join(f.dir, 'external.tmp'); await fs.writeFile(other, external); await rename(other, f.manifest); }
        else await fs.writeFile(f.manifest, external);
      }
      return rename(from, to);
    };
    try { await assert.rejects(saveImportSettings(f.dir, f.saved.revision, { folders: [{ path: '', role: 'simulation' }] }), /changed during publication/); }
    finally { fs.rename = rename; }
    assert.ok(hit); assert.equal(await fs.readFile(f.manifest, 'utf8'), external); assert.equal((await fs.lstat(f.manifest)).nlink, 1);
    const [request] = await readImportRecovery(f.dir); assert.deepEqual([request.current, request.previous, request.candidate], [true, true, true]);
    assert.equal(await readImportRecoveryText(f.dir, request, 'previous'), external);
    assert.match(await readImportRecoveryText(f.dir, request, 'candidate'), /simulation/);
    await assert.rejects(readImportSettings(f.dir), /설정 복구/); await assert.rejects(loadProject(f.dir), /설정 복구/);
  }
});

test('external file created in the empty publication gap wins without replacing either preserved candidate', async t => {
  const f = await fixture(t), link = fs.link, external = '# external gap file\n'; let hit = false;
  fs.link = async (from, to) => {
    if (!hit && to === f.manifest) { hit = true; await fs.writeFile(f.manifest, external, { flag: 'wx' }); }
    return link(from, to);
  };
  try { await assert.rejects(saveImportSettings(f.dir, f.saved.revision, { folders: [{ path: '', role: 'simulation' }] }), /게시를 중단/); }
  finally { fs.link = link; }
  const [request] = await readImportRecovery(f.dir);
  assert.ok(hit); assert.equal(await fs.readFile(f.manifest, 'utf8'), external);
  assert.equal(await readImportRecoveryText(f.dir, request, 'previous'), f.original);
  assert.match(await readImportRecoveryText(f.dir, request, 'candidate'), /simulation/);
  await resolveImportRecovery(f.dir, request, 'current');
  assert.equal(await fs.readFile(f.manifest, 'utf8'), external); assert.deepEqual(await readImportRecovery(f.dir), []);
});

test('late writes through a pre-publication open handle remain reachable and invalidate the completed journal', async t => {
  const f = await fixture(t), handle = await fs.open(f.manifest, 'r+'); t.after(() => handle.close());
  const saved = await saveImportSettings(f.dir, f.saved.revision, { folders: [{ path: '', role: 'simulation' }] }), active = await fs.readFile(f.manifest);
  assert.deepEqual(await readImportRecovery(f.dir), []);
  const external = f.original + '# late handle writer\n'; await handle.truncate(0); await handle.writeFile(external); await handle.sync();
  assert.deepEqual(await fs.readFile(f.manifest), active);
  const [request] = await readImportRecovery(f.dir); assert.equal(await readImportRecoveryText(f.dir, request, 'previous'), external);
  await assert.rejects(saveImportSettings(f.dir, saved.revision, {}), /설정 복구/);
  await resolveImportRecovery(f.dir, request, 'current'); assert.deepEqual(await readImportRecovery(f.dir), []);
  await handle.write(Buffer.from('!'), 0, 1, 0); assert.equal((await readImportRecovery(f.dir)).length, 1);
});

test('cancellation after capture preserves all bytes and needs an explicit reviewed restoration', async t => {
  const f = await fixture(t), rename = fs.rename, controller = new AbortController(); let hit = false;
  fs.rename = async (from, to) => { await rename(from, to); if (from === f.manifest) { hit = true; controller.abort(); } };
  try { await assert.rejects(saveImportSettings(f.dir, f.saved.revision, {}, controller.signal), /abort/i); }
  finally { fs.rename = rename; }
  assert.ok(hit); await assert.rejects(fs.stat(f.manifest), /ENOENT/);
  const [request] = await readImportRecovery(f.dir); assert.equal(request.current, false);
  assert.equal(await readImportRecoveryText(f.dir, request, 'previous'), f.original);
  await resolveImportRecovery(f.dir, request, 'previous'); assert.equal(await fs.readFile(f.manifest, 'utf8'), f.original);
  assert.deepEqual(await readImportRecovery(f.dir), []); assert.equal((await readImportSettings(f.dir)).revision, f.saved.revision);
});

test('real process termination across capture, link and commit requires review and never auto-promotes candidates', async t => {
  for (const phase of ['captured', 'link-before', 'link-after', 'commit']) {
    const f = await fixture(t), child = fork(new URL('./helpers/import-publication-crash.cjs', import.meta.url), [f.dir, phase], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
    const exit = once(child, 'exit'); let timer;
    try {
      const [message] = await Promise.race([once(child, 'message'), new Promise((_, reject) => { timer = setTimeout(() => reject(Error(`Writer did not reach ${phase}`)), 10000); })]);
      clearTimeout(timer); assert.equal(message.phase, phase);
      await assert.rejects(acquireImportLease(path.join(f.dir, '.rtl')), /busy/);
      child.kill('SIGKILL'); await exit;
      const [request] = await readImportRecovery(f.dir); assert.ok(request);
      assert.equal(request.current, ['link-after', 'commit'].includes(phase));
      assert.equal(await readImportRecoveryText(f.dir, request, 'previous'), f.original);
      const candidate = await readImportRecoveryText(f.dir, request, 'candidate'); assert.match(candidate, /simulation/);
      const before = request.current ? await fs.readFile(f.manifest) : undefined;
      await assert.rejects(readImportSettings(f.dir), /설정 복구/); await assert.rejects(loadProject(f.dir), /설정 복구/);
      if (before) assert.deepEqual(await fs.readFile(f.manifest), before); else await assert.rejects(fs.stat(f.manifest), /ENOENT/);
      // Fresh owner reclaims only the dead lease; the selected journal decides the bytes.
      await resolveImportRecovery(f.dir, request, phase === 'link-after' ? 'current' : 'candidate');
      assert.equal(await fs.readFile(f.manifest, 'utf8'), candidate); assert.equal((await fs.lstat(f.manifest)).nlink, 1);
      assert.deepEqual(await readImportRecovery(f.dir), []); assert.equal((await readImportSettings(f.dir)).roles.folders[0].role, 'simulation');
      const preserved = path.join(f.dir, '.rtl/import-transactions', request.id); assert.equal(await fs.readFile(path.join(preserved, 'previous.toml'), 'utf8'), f.original);
      assert.equal(await fs.readFile(path.join(preserved, 'candidate.toml'), 'utf8'), candidate);
      await assert.rejects(fs.stat(path.join(f.dir, '.rtl/import-review.lock')), /ENOENT/);
    } finally { clearTimeout(timer); child.kill('SIGKILL'); await exit; }
  }
});

test('review stamps reject changed current/previous/candidate bytes and invalid selections without writing', async t => {
  const f = await fixture(t), { request, external } = await conflict(f);
  await fs.writeFile(f.manifest, external + '# newer\n'); const changed = await fs.readFile(f.manifest);
  await assert.rejects(resolveImportRecovery(f.dir, request, 'candidate'), /바뀌었/); assert.deepEqual(await fs.readFile(f.manifest), changed);
  const [fresh] = await readImportRecovery(f.dir), folder = path.join(f.dir, '.rtl/import-transactions', fresh.id);
  await fs.appendFile(path.join(folder, 'previous.toml'), '# changed previous\n');
  await assert.rejects(readImportRecoveryText(f.dir, fresh, 'previous'), /바뀌었/);
  await assert.rejects(resolveImportRecovery(f.dir, fresh, 'previous'), /바뀌었/);
  const [last] = await readImportRecovery(f.dir);
  await assert.rejects(readImportRecoveryText(f.dir, { ...last, id: '../rtl.toml' }, 'current'));
  await assert.rejects(resolveImportRecovery(f.dir, last, 'anything'), /후보가 없습니다/);
  await fs.appendFile(path.join(folder, 'candidate.toml'), '# corruption\n');
  await assert.rejects(readImportRecovery(f.dir), /candidate was modified/); assert.deepEqual(await fs.readFile(f.manifest), changed);
});

test('an external replacement during explicit recovery is journaled rather than overwritten or acknowledged', async t => {
  const f = await fixture(t), { request } = await conflict(f), rename = fs.rename, latest = '# recovery external writer\n'; let hit = false;
  fs.rename = async (from, to) => { if (!hit && from === f.manifest) { hit = true; await fs.writeFile(f.manifest, latest); } return rename(from, to); };
  try { await assert.rejects(resolveImportRecovery(f.dir, request, 'candidate'), /changed during publication/); }
  finally { fs.rename = rename; }
  assert.ok(hit); assert.equal(await fs.readFile(f.manifest, 'utf8'), latest);
  const pending = await readImportRecovery(f.dir); assert.equal(pending.length, 2);
  assert.ok(await Promise.all(pending.map(value => readImportRecoveryText(f.dir, value, 'candidate'))));
  await assert.rejects(fs.stat(path.join(f.dir, '.rtl/import-transactions', request.id, 'acknowledged.json')), /ENOENT/);
});

test('journal links, unknown records, oversized metadata and retained-record limits fail closed', async t => {
  const f = await fixture(t), { request } = await conflict(f), directory = path.join(f.dir, '.rtl/import-transactions'), folder = path.join(directory, request.id);
  const candidate = path.join(folder, 'candidate.toml'), saved = await fs.readFile(candidate), outside = path.join(f.dir, 'outside');
  await fs.writeFile(outside, saved); await fs.unlink(candidate); await fs.symlink(outside, candidate);
  await assert.rejects(readImportRecovery(f.dir), /linked/); assert.deepEqual(await fs.readFile(outside), saved);
  await fs.unlink(candidate); await fs.writeFile(candidate, saved);
  const intent = path.join(folder, 'intent.json'), originalIntent = await fs.readFile(intent);
  await fs.writeFile(intent, Buffer.alloc(1048577)); await assert.rejects(readImportRecovery(f.dir), /oversized/); await fs.writeFile(intent, originalIntent);
  await fs.mkdir(path.join(directory, 'unknown')); await assert.rejects(readImportRecovery(f.dir)); await fs.rmdir(path.join(directory, 'unknown'));
  // Publishing the 129th transaction must leave rtl.toml and all existing records intact.
  const { randomUUID } = require('node:crypto');
  while ((await fs.readdir(directory)).length < 128) await fs.mkdir(path.join(directory, randomUUID()));
  const before = await fs.readFile(f.manifest), release = await acquireImportLease(path.join(f.dir, '.rtl'));
  try { await assert.rejects(publishImportConfiguration(f.dir, sha(before), 'candidate'), /128 transactions/); }
  finally { await release(); }
  assert.deepEqual(await fs.readFile(f.manifest), before); assert.equal((await fs.readdir(directory)).length, 128);
});

test('explicit recovery respects read-only current settings while current-choice acknowledgment preserves them', async t => {
  const f = await fixture(t), { request, external } = await conflict(f);
  await fs.chmod(f.manifest, 0o444); t.after(() => fs.chmod(f.manifest, 0o644).catch(() => {}));
  await assert.rejects(resolveImportRecovery(f.dir, request, 'candidate'), /read-only/);
  assert.equal(await fs.readFile(f.manifest, 'utf8'), external);
  assert.equal((await readImportRecovery(f.dir)).length, 1);
  await resolveImportRecovery(f.dir, request, 'current'); assert.deepEqual(await readImportRecovery(f.dir), []);
  assert.equal(await fs.readFile(f.manifest, 'utf8'), external); assert.equal((await fs.stat(f.manifest)).mode & 0o222, 0);
});

test('review and restoration preserve UTF-8 BOM bytes instead of silently removing them', async t => {
  const f = await fixture(t), { request } = await conflict(f);
  const previous = path.join(f.dir, '.rtl/import-transactions', request.id, 'previous.toml'), bom = Buffer.from('\ufeff' + f.original);
  await fs.writeFile(previous, bom); const [fresh] = await readImportRecovery(f.dir);
  assert.deepEqual(Buffer.from(await readImportRecoveryText(f.dir, fresh, 'previous')), bom);
  await resolveImportRecovery(f.dir, fresh, 'previous');
  assert.deepEqual(await fs.readFile(f.manifest), bom); assert.deepEqual(await fs.readFile(previous), bom);
  assert.deepEqual(await readImportRecovery(f.dir), []);
});

test('a publication interrupted after the initial readiness check cannot become a runnable disk configuration', async t => {
  const f = await fixture(t), before = 'version = 1\n[project]\nname = "Before"\n[sources]\nrtl = []\npackages = []\n';
  await fs.writeFile(f.manifest, before); const candidate = before.replace('Before', 'After');
  const readFile = fs.readFile, rename = fs.rename; let hit = false;
  fs.readFile = async (file, ...args) => {
    if (file === f.manifest && !hit) {
      hit = true; const release = await acquireImportLease(path.join(f.dir, '.rtl'));
      fs.rename = async (from, to) => { if (path.basename(to) === 'complete.json') throw Error('Interrupted before commit'); return rename(from, to); };
      try { await assert.rejects(publishImportConfiguration(f.dir, sha(before), candidate), /Interrupted/); }
      finally { fs.rename = rename; await release(); }
    }
    return readFile(file, ...args);
  };
  try { await assert.rejects(loadProject(f.dir), /설정 복구/); }
  finally { fs.readFile = readFile; fs.rename = rename; }
  assert.ok(hit); assert.equal(await fs.readFile(f.manifest, 'utf8'), candidate);
  const [request] = await readImportRecovery(f.dir); assert.equal(await readImportRecoveryText(f.dir, request, 'previous'), before);
  // An explicitly supplied preview remains a pure validation input.
  assert.equal((await loadProject(f.dir, candidate)).name, 'After');
});
