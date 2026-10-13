import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url), fs = require('node:fs/promises');
const { readImportSettings, saveImportSettings } = require('../dist/runtime/core/index.js');
const { acquireImportLease } = require('../dist/runtime/core/import-lease.js');
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(root, '.dev/import-recovery-')); t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const saved = await saveImportSettings(dir, 'absent', {}); return { dir, saved };
}

test('real writer termination before and after atomic publication restores a fresh writer without promoting partial data', async t => {
  for (const phase of ['before', 'after']) {
    const { dir, saved } = await fixture(t), file = path.join(dir, 'rtl.toml'), before = await fs.readFile(file);
    const child = fork(new URL('./helpers/import-crash.cjs', import.meta.url), [dir, phase], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
    const exit = once(child, 'exit'); let timer;
    try {
      const message = await Promise.race([once(child, 'message').then(([message]) => message), new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Writer did not reach publication boundary')), 10000); })]);
      clearTimeout(timer); assert.equal(message.phase, phase);
      const active = await fs.readFile(file); if (phase === 'before') assert.deepEqual(active, before); else assert.notDeepEqual(active, before);
      await assert.rejects(saveImportSettings(dir, (await readImportSettings(dir)).revision, {}), /busy/);
      child.kill('SIGKILL'); await exit;
      const current = await readImportSettings(dir);
      if (phase === 'before') assert.equal(current.revision, saved.revision); else assert.equal(current.roles.folders[0].role, 'simulation');
      const orphanNames = (await fs.readdir(path.join(dir, '.rtl'))).filter(name => /^import-review-[a-f0-9-]+\.tmp$/.test(name));
      const orphanBytes = await Promise.all(orphanNames.map(name => fs.readFile(path.join(dir, '.rtl', name))));
      const updated = await saveImportSettings(dir, current.revision, { files: [{ path: 'tb.sv', role: 'source' }] });
      assert.equal((await readImportSettings(dir)).revision, updated.revision);
      await assert.rejects(fs.stat(path.join(dir, '.rtl/import-review.lock')), /ENOENT/);
      assert.deepEqual(await Promise.all(orphanNames.map(name => fs.readFile(path.join(dir, '.rtl', name)))), orphanBytes);
      // The independently fsynced review staging file is cleaned after publication returns.
      // A killed writer leaves it untouched at both boundaries; it is never promoted.
      assert.equal(orphanNames.length, 1);
    } finally { clearTimeout(timer); child.kill('SIGKILL'); await exit; }
  }
});

test('external edit after temporary fsync rejects publication and preserves external bytes', async t => {
  const { dir, saved } = await fixture(t), file = path.join(dir, 'rtl.toml'), open = fs.open; let written;
  fs.open = async (name, ...args) => {
    const handle = await open(name, ...args);
    if (/import-review-[a-f0-9-]+\.tmp$/.test(String(name))) {
      const sync = handle.sync.bind(handle);
      handle.sync = async () => { await sync(); written = (await fs.readFile(file, 'utf8')) + '# external writer\n'; await fs.writeFile(file, written); };
    }
    return handle;
  };
  try { await assert.rejects(saveImportSettings(dir, saved.revision, {}), /changed/); }
  finally { fs.open = open; }
  assert.equal(await fs.readFile(file, 'utf8'), written); assert.deepEqual(await fs.readdir(path.join(dir, '.rtl')), ['import-transactions']);
});

test('live, legacy, unknown and linked leases are preserved; empty interrupted release is recoverable', async t => {
  const { dir, saved } = await fixture(t), generated = path.join(dir, '.rtl'), canonical = path.join(generated, 'import-review.lock');
  const release = await acquireImportLease(generated);
  await assert.rejects(acquireImportLease(generated), /busy/); await release(); await release();
  await fs.writeFile(canonical, 'legacy'); await assert.rejects(saveImportSettings(dir, saved.revision, {}), /legacy|unknown|ENOTDIR/);
  assert.equal(await fs.readFile(canonical, 'utf8'), 'legacy'); await fs.unlink(canonical);
  await fs.mkdir(canonical); await fs.writeFile(path.join(canonical, 'unknown'), 'preserve');
  await assert.rejects(acquireImportLease(generated), /unknown/); assert.equal(await fs.readFile(path.join(canonical, 'unknown'), 'utf8'), 'preserve');
  await fs.unlink(path.join(canonical, 'unknown')); await fs.rmdir(canonical);
  await fs.mkdir(canonical); const empty = await acquireImportLease(generated); await empty();
  const outside = path.join(dir, 'outside'); await fs.mkdir(outside); await fs.writeFile(path.join(outside, 'marker'), 'outside');
  await fs.symlink(outside, canonical, 'junction'); await assert.rejects(acquireImportLease(generated), /link|ENOTDIR|busy/);
  assert.equal(await fs.readFile(path.join(outside, 'marker'), 'utf8'), 'outside'); await fs.unlink(canonical);
  assert.deepEqual(await fs.readdir(generated), ['import-transactions']);
});

test('a delayed stale reclaimer cannot remove a newer writer lease', async t => {
  const { dir } = await fixture(t), generated = path.join(dir, '.rtl'), canonical = path.join(generated, 'import-review.lock');
  const child = fork(new URL('./helpers/import-crash.cjs', import.meta.url), [dir, 'before'], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  const exit = once(child, 'exit'); let timer, release;
  const unlink = fs.unlink; let resume, entered;
  const held = new Promise(resolve => { resume = resolve; }), ready = new Promise(resolve => { entered = resolve; });
  try {
    const [message] = await Promise.race([once(child, 'message'), new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Writer boundary timed out')), 10000); })]);
    clearTimeout(timer); assert.equal(message.phase, 'before'); child.kill('SIGKILL'); await exit;
    const oldOwner = path.join(canonical, (await fs.readdir(canonical))[0]); let first = true;
    fs.unlink = async (file, ...args) => { if (file === oldOwner && first) { first = false; entered(); await held; } return unlink(file, ...args); };
    const older = acquireImportLease(generated).then(value => value, error => error);
    await ready; release = await acquireImportLease(generated);
    const fresh = await fs.readdir(canonical); assert.equal(fresh.length, 1); assert.notEqual(path.join(canonical, fresh[0]), oldOwner);
    resume(); assert.match(String(await older), /busy/); assert.deepEqual(await fs.readdir(canonical), fresh);
    await release(); release = undefined;
  } finally { clearTimeout(timer); resume(); fs.unlink = unlink; await release?.(); child.kill('SIGKILL'); await exit; }
});
