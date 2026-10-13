import { randomUUID } from 'node:crypto';
import { lstat, mkdir, open, readFile, readdir, realpath, rename, rmdir, unlink } from 'node:fs/promises';
import path from 'node:path';

const missing = (error: unknown) => (error as NodeJS.ErrnoException).code === 'ENOENT';
const occupied = (error: unknown) => ['EEXIST', 'ENOTEMPTY', 'EPERM', 'ENOTDIR', 'EISDIR'].includes((error as NodeJS.ErrnoException).code ?? '');
/** Publish an already populated lease directory atomically. Recovery removes
 * only the dead owner's unique file; it cannot remove a later populated lease.
 * Legacy files, unknown populated locks and live/reused PIDs are preserved.
 * An empty directory can finish an interrupted release; publication is populated.
 */
export async function acquireImportLease(directory: string, signal?: AbortSignal): Promise<() => Promise<void>> {
  const canonical = path.join(directory, 'import-review.lock'), token = randomUUID();
  const owner = `owner-${token}.json`, prepared = path.join(directory, `import-review-lease-${token}.tmp`);
  const safe = async (file: string) => {
    const stat = await lstat(file);
    if (!stat.isDirectory() || stat.isSymbolicLink() || await realpath(file) !== file) throw Error('Import lease directories must not be links.');
  };
  const cleanup = async (folder: string) => {
    await safe(folder).catch(error => { if (!missing(error)) throw error; });
    await unlink(path.join(folder, owner)).catch(error => { if (!missing(error)) throw error; });
    // A different owner's populated directory must remain untouched.
    await rmdir(folder).catch(error => { if (!missing(error) && !occupied(error)) throw error; });
  };
  await safe(directory); signal?.throwIfAborted(); await mkdir(prepared);
  let published = false;
  try {
    const file = await open(path.join(prepared, owner), 'wx');
    try { await file.writeFile(JSON.stringify({ version: 1, token, pid: process.pid })); await file.sync(); }
    finally { await file.close(); }
    for (let attempt = 0; attempt < 4; attempt++) {
      signal?.throwIfAborted(); await safe(directory);
      // Windows rename can replace an existing ordinary file with a directory.
      // Preserve legacy locks before attempting to publish our owned lease.
      const existing = await lstat(canonical).catch(error => { if (missing(error)) return undefined; throw error; });
      if (existing && (!existing.isDirectory() || existing.isSymbolicLink())) throw Error('Import settings are busy: legacy or unknown lock. Confirm its owner has stopped before manual recovery.');
      try { await rename(prepared, canonical); published = true; return () => cleanup(canonical); }
      catch (error) {
        if (!occupied(error)) throw error;
        const stat = await lstat(canonical);
        if (!stat.isDirectory() || stat.isSymbolicLink()) throw Error('Import settings are busy: legacy or unknown lock. Confirm its owner has stopped before manual recovery.');
        await safe(canonical);
        const names = await readdir(canonical);
        if (!names.length) { await rmdir(canonical).catch(error => { if (!missing(error) && !occupied(error)) throw error; }); continue; }
        if (names.length !== 1 || !/^owner-[a-f0-9-]{36}\.json$/.test(names[0])) throw Error('Import settings are busy: unknown lease data was preserved.');
        const record = path.join(canonical, names[0]), info = await lstat(record);
        if (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1 || info.size > 4096) throw Error('Import settings are busy: invalid lease data was preserved.');
        const saved = JSON.parse(await readFile(record, 'utf8'));
        if (saved.version !== 1 || !Number.isSafeInteger(saved.pid) || saved.pid < 1 || names[0] !== `owner-${saved.token}.json`) throw Error('Import settings are busy: unknown lease owner was preserved.');
        let dead = false;
        try { process.kill(saved.pid, 0); } catch (error) { dead = (error as NodeJS.ErrnoException).code === 'ESRCH'; }
        if (!dead) throw Error('Import settings are busy: another writer owns the lease.');
        signal?.throwIfAborted(); await safe(canonical);
        await unlink(record).catch(error => { if (!missing(error)) throw error; });
        await rmdir(canonical).catch(error => { if (!missing(error) && !occupied(error)) throw error; });
      }
    }
    throw Error('Import settings are busy. Retry after the other writer finishes.');
  } finally { if (!published) await cleanup(prepared); }
}
