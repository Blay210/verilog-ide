import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, open, readdir, realpath, rename, link, unlink } from 'node:fs/promises';
import { z } from 'zod';
import { acquireImportLease } from './import-lease';

const missing = (error: unknown) => (error as NodeJS.ErrnoException).code === 'ENOENT';
const sha = (bytes: Uint8Array | string) => createHash('sha256').update(bytes).digest('hex');
const id = z.string().uuid(), hash = z.string().regex(/^[a-f0-9]{64}$/), revision = z.union([hash, z.literal('absent')]);
const intentSchema = z.object({ version: z.literal(1), id, base: revision, next: hash }).strict();
const doneSchema = z.object({ version: z.literal(1), previous: revision }).strict();
export type ImportRecoveryChoice = 'current' | 'previous' | 'candidate';
export interface ImportRecovery { id: string; revision: string; current: boolean; previous: boolean; candidate: boolean }
export interface ImportArchivePlan { revision: string; count: number; retained: number; bytes: number }
export interface ImportJournalState { count: number; limit: number; archive?: ImportArchivePlan }
export interface ImportArchiveReceipt { directory: string; count: number }
const LIMIT = 1048576;
const RECORD_LIMIT = 128, KEEP = 32;
interface JournalEntry { folder: string; view: ImportRecovery; prepared: boolean; settled: boolean; files?: { size: number; stamp: string; born: number } }
async function safeDirectory(file: string) {
  const stat = await lstat(file);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw Error('Import journal directory must not be a link.');
  const resolved = await realpath(file);
  const same = process.platform === 'win32' ? resolved.toLowerCase() === file.toLowerCase() : resolved === file;
  if (!same) throw Error('Import journal directory must not be a link.');
}
async function bytes(file: string, allowLinks = false, signal?: AbortSignal): Promise<Buffer | undefined> {
  try {
    signal?.throwIfAborted();
    const before = await lstat(file);
    if (!before.isFile() || before.isSymbolicLink() || (!allowLinks && before.nlink !== 1) || before.size > LIMIT) throw Error('Invalid, linked or oversized import journal/configuration file.');
    const handle = await open(file, 'r');
    try {
      const stat = await handle.stat();
      if (stat.ino !== before.ino || stat.dev !== before.dev || stat.size > LIMIT) throw Error('Import file changed while opening.');
      const buffer = Buffer.alloc(stat.size + 1); let length = 0;
      while (length < buffer.length) { signal?.throwIfAborted(); const read = await handle.read(buffer, length, buffer.length - length, length); if (!read.bytesRead) break; length += read.bytesRead; }
      signal?.throwIfAborted();
      const after = await handle.stat(), current = await lstat(file);
      if (length > LIMIT || length !== stat.size || after.size !== stat.size || after.mtimeMs !== stat.mtimeMs || current.ino !== stat.ino || current.dev !== stat.dev || current.isSymbolicLink()) throw Error('Import file changed while reading.');
      return buffer.subarray(0, length);
    } finally { await handle.close(); }
  } catch (error) { if (missing(error)) return undefined; throw error; }
}
async function write(file: string, value: string | Uint8Array) {
  const handle = await open(file, 'wx');
  try { await handle.writeFile(value); await handle.sync(); } finally { await handle.close(); }
}
async function metadata(file: string, value: object) {
  const temporary = `${file}-${randomUUID()}.tmp`;
  await write(temporary, JSON.stringify(value)); await rename(temporary, file);
}
async function base(root: string, create = false): Promise<string | undefined> {
  const generated = path.join(root, '.rtl'), directory = path.join(generated, 'import-transactions');
  try {
    await safeDirectory(generated);
    if (create) await mkdir(directory).catch(error => { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; });
    await safeDirectory(directory); return directory;
  } catch (error) { if (!create && missing(error)) return undefined; throw error; }
}
async function currentBytes(root: string, signal?: AbortSignal) {
  signal?.throwIfAborted();
  const file = path.join(root, 'rtl.toml'), stat = await lstat(file).catch(error => { if (missing(error)) return undefined; throw error; });
  if (!stat) return undefined;
  if (stat.nlink !== 1) {
    let owned = false;
    const directory = await base(root);
    if (directory) {
      const names = await readdir(directory); if (names.length > 128) throw Error('Import journal exceeds 128 transactions.');
      for (const name of names) {
        signal?.throwIfAborted();
        id.parse(name); const item = path.join(directory, name); await safeDirectory(item);
        const alias = await lstat(path.join(item, 'publish.tmp')).catch(error => { if (missing(error)) return undefined; throw error; });
        if (alias?.isFile() && !alias.isSymbolicLink() && alias.ino === stat.ino && alias.dev === stat.dev && stat.nlink === 2) owned = true;
      }
    }
    if (!owned) throw Error('Invalid linked rtl.toml: not an owned publication alias.');
  }
  return bytes(file, true, signal);
}
async function record(root: string, directory: string, name: string, context?: { current: Buffer | undefined; revision: string }, signal?: AbortSignal) {
  signal?.throwIfAborted();
  id.parse(name); const folder = path.join(directory, name); await safeDirectory(folder);
  const meta = await bytes(path.join(folder, 'intent.json'), false, signal);
  // An incomplete preparation never moved the current configuration.
  if (!meta) {
    if (await lstat(path.join(folder, 'previous.toml')).catch(error => { if (missing(error)) return undefined; throw error; })) throw Error('Import journal intent is missing; preserved files need review.');
    return undefined;
  }
  const intent = intentSchema.parse(JSON.parse(meta.toString('utf8'))); if (intent.id !== name) throw Error('Import journal identity mismatch.');
  const candidate = await bytes(path.join(folder, 'candidate.toml'), false, signal); if (!candidate || sha(candidate) !== intent.next) throw Error('Import journal candidate was modified.');
  const previous = await bytes(path.join(folder, 'previous.toml'), false, signal), current = context ? context.current : await currentBytes(root, signal);
  const previousRevision = previous ? sha(previous) : 'absent', currentRevision = context?.revision ?? (current ? sha(current) : 'absent');
  const complete = await bytes(path.join(folder, 'complete.json'), false, signal);
  const acknowledged = await bytes(path.join(folder, 'acknowledged.json'), false, signal);
  const unpublished = await bytes(path.join(folder, 'unpublished.json'), false, signal);
  if (unpublished) z.object({ version: z.literal(1) }).strict().parse(JSON.parse(unpublished.toString('utf8')));
  const acknowledgment = acknowledged && z.object({ version: z.literal(1), previous: revision }).strict().parse(JSON.parse(acknowledged.toString('utf8')));
  const done = complete && doneSchema.parse(JSON.parse(complete.toString('utf8')));
  const prepared = !acknowledgment && !done && !unpublished && !previous && currentRevision === intent.base;
  const settled = acknowledgment ? acknowledgment.previous === previousRevision : done ? done.previous === previousRevision : unpublished ? !previous : prepared;
  const stamp = sha(JSON.stringify([intent, previousRevision, currentRevision, complete?.toString(), acknowledged?.toString(), unpublished?.toString()]));
  return { folder, intent, previous, candidate, current, previousRevision, settled, prepared, retirable: settled && !!(acknowledgment || done || unpublished), view: { id: name, revision: stamp, current: !!current, previous: !!previous, candidate: true } satisfies ImportRecovery };
}
async function archiveFiles(folder: string, signal?: AbortSignal) {
  const names = (await readdir(folder)).sort(); if (names.length > 32) return undefined;
  const fixed = ['intent.json', 'candidate.toml', 'previous.toml', 'complete.json', 'acknowledged.json', 'unpublished.json', 'publish.tmp', 'restore.tmp'];
  const files = []; let size = 0;
  for (const name of names) {
    signal?.throwIfAborted();
    const temporary = name.match(/^(intent|complete|acknowledged|unpublished)\.json-(.*)\.tmp$/);
    if (!fixed.includes(name) && (!temporary || !id.safeParse(temporary[2]).success)) return undefined;
    const stat = await lstat(path.join(folder, name));
    if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || stat.size > LIMIT) return undefined;
    size += stat.size; files.push([name, stat.dev, stat.ino, stat.size, stat.mtimeMs, stat.ctimeMs, stat.mode]);
  }
  return { size, stamp: sha(JSON.stringify(files)), born: (await lstat(folder)).birthtimeMs };
}
async function scan(root: string, archive = false, signal?: AbortSignal) {
  signal?.throwIfAborted();
  const directory = await base(root), entries: JournalEntry[] = [];
  if (!directory) return { directory, names: [] as string[], entries, current: undefined as Buffer | undefined, currentRevision: 'absent' };
  const names = (await readdir(directory)).sort();
  if (names.length > RECORD_LIMIT) throw Error('Import journal exceeds 128 transactions; preserve and review its records.');
  const current = await currentBytes(root, signal), context = { current, revision: current ? sha(current) : 'absent' };
  for (let start = 0; start < names.length; start += 8) {
    signal?.throwIfAborted();
    const batch = await Promise.allSettled(names.slice(start, start + 8).map(async name => {
      const value = await record(root, directory, name, context, signal);
      if (!value) return undefined;
      const files = archive && value.retirable ? await archiveFiles(value.folder, signal) : undefined;
      // Keep summaries only: candidate/previous payloads are bounded by one batch.
      return { folder: value.folder, view: value.view, prepared: value.prepared, settled: value.settled, files };
    }));
    for (const result of batch) { if (result.status === 'rejected') throw result.reason; if (result.value) entries.push(result.value); }
  }
  const latest = await currentBytes(root, signal);
  if ((latest ? sha(latest) : 'absent') !== context.revision) throw Error('rtl.toml changed while inspecting import records.');
  // A publisher can add an interrupted transaction without changing the bytes
  // (including publishing the same text). Do not return that snapshot as ready.
  const latestDirectory = await base(root), latestNames = latestDirectory ? (await readdir(latestDirectory)).sort() : [];
  signal?.throwIfAborted();
  if (directory !== latestDirectory || JSON.stringify(names) !== JSON.stringify(latestNames)) throw Error('Import journal changed while inspecting import records.');
  return { directory, names, entries, current, currentRevision: context.revision };
}
function assertReady(entries: JournalEntry[]) {
  if (entries.some(entry => !entry.settled)) throw Error('설정 복구가 필요합니다. 현재 파일과 보관 후보를 검토한 뒤 명시적으로 선택해 주세요.');
}
/** Request-local snapshot: scan validates both current reads and journal membership.
 * Parse these bytes directly; never cache them or reread the path after this gate.
 */
export async function readImportConfiguration(root: string, signal?: AbortSignal): Promise<string | undefined> {
  const value = await scan(root, false, signal);
  assertReady(value.entries);
  if (!value.directory) {
    const current = await currentBytes(root, signal);
    if (await base(root)) throw Error('Import journal changed while reading configuration.');
    signal?.throwIfAborted();
    return current?.toString('utf8');
  }
  return value.current?.toString('utf8');
}
function archival(value: Awaited<ReturnType<typeof scan>>) {
  const eligible = value.entries.filter(entry => entry.files).sort((a,b) => b.files!.born - a.files!.born || b.view.id.localeCompare(a.view.id));
  const records = eligible.slice(KEEP);
  if (!records.length) return undefined;
  const stamp = sha(JSON.stringify([value.currentRevision, value.names, value.entries.map(entry => [entry.view, entry.settled, entry.prepared, entry.files])]));
  const plan: ImportArchivePlan = { revision: stamp, count: records.length, retained: value.names.length - records.length, bytes: records.reduce((total, entry) => total + entry.files!.size, 0) };
  return { plan, records };
}
/** Read-only inspection: opening a project never promotes or restores a journal. */
export async function readImportRecovery(root: string, signal?: AbortSignal): Promise<ImportRecovery[]> {
  return (await scan(root, false, signal)).entries.filter(entry => !entry.settled).map(entry => entry.view);
}
export async function inspectImportJournal(root: string, signal?: AbortSignal): Promise<{ journal: ImportJournalState; recoveries: ImportRecovery[] }> {
  const value = await scan(root, true, signal);
  return { journal: { count: value.names.length, limit: RECORD_LIMIT, archive: archival(value)?.plan }, recoveries: value.entries.filter(entry => !entry.settled).map(entry => entry.view) };
}
/** Explicit retirement, never deletion. Archived inodes stay reachable for old handles;
 * only the retained active records continue to gate normal project reads.
 * Each directory move commits independently, including when the caller is killed.
 */
export async function archiveImportJournal(root: string, request: ImportArchivePlan, signal?: AbortSignal): Promise<ImportArchiveReceipt> {
  await safeDirectory(root); await safeDirectory(path.join(root, '.rtl'));
  const release = await acquireImportLease(path.join(root, '.rtl'), signal);
  let folder: string | undefined; const moved: string[] = [];
  try {
    const value = await scan(root, true, signal), selected = archival(value);
    if (!selected || selected.plan.revision !== hash.parse(request.revision)) throw Error('보관할 기록이나 현재 설정이 바뀌었습니다. 다시 확인해 주세요.');
    const parent = path.join(root, '.rtl/import-archive');
    await mkdir(parent).catch(error => { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }); await safeDirectory(parent);
    const token = randomUUID(); folder = path.join(parent, token); await mkdir(folder);
    await metadata(path.join(folder, 'archive.json'), { version: 1, id: token, current: value.currentRevision, records: selected.records.map(entry => ({ id: entry.view.id, revision: entry.view.revision })) });
    for (const entry of selected.records) {
      signal?.throwIfAborted();
      const current = await currentBytes(root, signal), context = { current, revision: current ? sha(current) : 'absent' };
      if (context.revision !== value.currentRevision) throw Error('보관 도중 현재 설정이 바뀌었습니다. 다시 확인해 주세요.');
      const fresh = await record(root, value.directory!, entry.view.id, context, signal), files = fresh?.retirable && await archiveFiles(entry.folder, signal);
      if (!fresh || !files || fresh.view.revision !== entry.view.revision || files.stamp !== entry.files!.stamp) throw Error('보관 도중 기록이 바뀌었습니다. 다시 확인해 주세요.');
      await safeDirectory(parent); await safeDirectory(folder); await safeDirectory(entry.folder);
      signal?.throwIfAborted();
      await rename(entry.folder, path.join(folder, entry.view.id)); moved.push(entry.view.id);
    }
    signal?.throwIfAborted();
    await safeDirectory(parent); await safeDirectory(folder);
    await metadata(path.join(folder, 'complete.json'), { version: 1, records: moved });
    return { directory: folder, count: moved.length };
  } catch (error) {
    if (moved.length) throw Error(`${String(error)} · ${moved.length}개 기록은 별도 보관되었고 나머지는 유지됩니다.`, { cause: error });
    throw error;
  } finally { await release(); }
}
export async function assertImportPublicationReady(root: string): Promise<void> {
  if ((await readImportRecovery(root)).length) throw Error('설정 저장이 중단되었거나 외부 변경이 있습니다. 설정 복구에서 보관된 후보를 검토해 주세요.');
}
async function selected(root: string, request: ImportRecovery, signal?: AbortSignal) {
  const directory = await base(root); if (!directory) throw Error('Import recovery is unavailable.');
  const value = await record(root, directory, id.parse(request.id), undefined, signal);
  if (!value || value.settled || value.view.revision !== request.revision) throw Error('복구 후보나 현재 설정이 바뀌었습니다. 다시 확인해 주세요.');
  return value;
}
export async function readImportRecoveryText(root: string, request: ImportRecovery, choice: ImportRecoveryChoice, signal?: AbortSignal): Promise<string> {
  const value = await selected(root, request, signal), text = choice === 'current' ? value.current : choice === 'previous' ? value.previous : choice === 'candidate' ? value.candidate : undefined;
  if (!text) throw Error('이 복구 후보가 없습니다.');
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(text);
}
async function acknowledge(folder: string, previous: string) {
  await metadata(path.join(folder, 'acknowledged.json'), { version: 1, previous });
}
/** Caller owns the import lease. Capture first, publish with no replacement.
 * previous.toml remains reachable for writers holding the original file open.
 */
export async function publishImportConfiguration(root: string, expected: string, text: string, signal?: AbortSignal, validateCurrent?: (text: string | undefined) => void) {
  if (Buffer.byteLength(text) > LIMIT) throw Error('Import settings exceed 1 MiB.');
  if (expected !== 'absent') {
    const stat = await lstat(path.join(root, 'rtl.toml'));
    if (!(stat.mode & 0o222)) throw Error('rtl.toml is read-only.');
    const writable = await open(path.join(root, 'rtl.toml'), 'r+'); await writable.close();
  }
  const directory = (await base(root, true))!;
  const inspected = await scan(root, false, signal);
  // Normal saves share the final readiness scan with publication. Explicit
  // recovery deliberately permits pending records and uses its reviewed stamp.
  if (validateCurrent) { assertReady(inspected.entries); validateCurrent(inspected.current?.toString('utf8')); }
  // Under the writer lease, retire preparations that never touched rtl.toml.
  // Their candidate bytes stay preserved and cannot become pending on our next save.
  for (const value of inspected.entries) {
    if (value.prepared) await metadata(path.join(value.folder, 'unpublished.json'), { version: 1 });
  }
  if ((await readdir(directory)).length >= 128) throw Error('Import journal reached 128 transactions; preserve and review its records before saving.');
  const token = randomUUID(), folder = path.join(directory, token), manifest = path.join(root, 'rtl.toml');
  await mkdir(folder);
  // All intent/candidate bytes are durable before touching the current path.
  await write(path.join(folder, 'candidate.toml'), text);
  await write(path.join(folder, 'publish.tmp'), text);
  await metadata(path.join(folder, 'intent.json'), { version: 1, id: token, base: expected, next: sha(text) });
  signal?.throwIfAborted();
  if (expected !== 'absent') {
    await rename(manifest, path.join(folder, 'previous.toml'));
    const previous = await bytes(path.join(folder, 'previous.toml'));
    if (!previous || sha(previous) !== expected) {
      // Restore observed bytes only into a still empty path; never replace a writer.
      if (previous) {
        const restore = path.join(folder, 'restore.tmp'); await write(restore, previous);
        try { await link(restore, manifest); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
        finally { await unlink(restore); }
      }
      throw Error('rtl.toml changed during publication. 현재 파일과 보관 후보를 설정 복구에서 검토해 주세요.');
    }
  }
  signal?.throwIfAborted();
  try { await link(path.join(folder, 'publish.tmp'), manifest); }
  catch (error) { throw Error(`설정 게시를 중단했습니다. 현재 파일과 보관 후보가 유지됩니다: ${String(error)}`); }
  await unlink(path.join(folder, 'publish.tmp'));
  const current = await currentBytes(root), previous = await bytes(path.join(folder, 'previous.toml'));
  if (!current || sha(current) !== sha(text) || (previous ? sha(previous) : 'absent') !== expected) throw Error('설정 게시 중 외부 변경을 확인했습니다. 설정 복구에서 보관 후보를 검토해 주세요.');
  await metadata(path.join(folder, 'complete.json'), { version: 1, previous: expected });
}
/** Explicit reviewed choice. All files remain preserved, including rejected ones. */
export async function resolveImportRecovery(root: string, request: ImportRecovery, choice: ImportRecoveryChoice, signal?: AbortSignal) {
  await safeDirectory(root); await safeDirectory(path.join(root, '.rtl'));
  const release = await acquireImportLease(path.join(root, '.rtl'), signal);
  try {
    const value = await selected(root, request, signal); signal?.throwIfAborted();
    const alias = path.join(value.folder, 'publish.tmp'), stat = await lstat(alias).catch(error => { if (missing(error)) return undefined; throw error; });
    if (stat && value.current) {
      const current = await lstat(path.join(root, 'rtl.toml'));
      if (current.ino === stat.ino && current.dev === stat.dev) await unlink(alias);
    }
    if (choice === 'current') {
      if (!value.current) throw Error('현재 설정 파일이 없습니다. 보관 후보를 선택해 주세요.');
      const current = await currentBytes(root);
      if (!current || sha(current) !== sha(value.current)) throw Error('복구 도중 현재 설정이 바뀌었습니다. 다시 확인해 주세요.');
    } else {
      const text = choice === 'previous' ? value.previous : choice === 'candidate' ? value.candidate : undefined;
      if (!text) throw Error('이 복구 후보가 없습니다.');
      await publishImportConfiguration(root, value.current ? sha(value.current) : 'absent', new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(text), signal);
    }
    // A late write through an old handle also invalidates the reviewed choice.
    const now = await bytes(path.join(value.folder, 'previous.toml'));
    if ((now ? sha(now) : 'absent') !== value.previousRevision) throw Error('복구 도중 보관 설정이 바뀌었습니다. 다시 확인해 주세요.');
    signal?.throwIfAborted();
    await acknowledge(value.folder, value.previousRevision);
  } finally { await release(); }
}
