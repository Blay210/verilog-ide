import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, open, readFile, realpath, rename, link, unlink } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'smol-toml';
import { z } from 'zod';
import type { RoleSelection } from '../discovery-model';
import type { DiscoveryReview, ImportSelection, ImportPreview } from '../discovery-model';
import { prepareImportTargets, type ImportSemanticProvider } from './import-targets';
import { loadProject } from './config';

const digest = (text: string) => createHash('sha256').update(text).digest('hex');
const missing = (error: unknown) => (error as NodeJS.ErrnoException).code === 'ENOENT';
const marker = '# RTL IDE managed import review v1\n';
const role = z.object({ path: z.string().max(4096), role: z.enum(['source', 'simulation', 'excluded']) }).strict();
const schema = z.object({ version: z.literal(1), project: z.object({ name: z.string().min(1) }).strict(),
  sources: z.object({ rtl: z.array(z.string()).length(0), packages: z.array(z.string()).length(0) }).strict(),
  test: z.array(z.unknown()).length(0),
  import_review: z.object({ version: z.literal(1), pending: z.literal(true), folders: z.array(role).max(1000), files: z.array(role).max(1000) }).strict()
}).strict();
export interface ImportSettings { revision: string; roles: RoleSelection; name: string }
function validated(entries: NonNullable<RoleSelection['files']>) {
  const seen = new Set<string>();
  return entries.map(entry => {
    const value = entry.path.replaceAll('\\', '/');
    if (path.isAbsolute(entry.path) || /^[A-Za-z]:/.test(value) || value.startsWith('/') || value.split('/').includes('..')) throw Error('Import roles must use project-relative paths.');
    const normalized = value.split('/').filter(part => part && part !== '.').join('/');
    if (normalized.split('/').some(part => ['.rtl', '.git', 'node_modules'].includes(part.toLowerCase()))) throw Error('Generated or dependency folders cannot be assigned import roles.');
    const key = process.platform === 'win32' ? normalized.toLowerCase() : normalized;
    if (seen.has(key)) throw Error('Duplicate import role.'); seen.add(key);
    return { path: normalized, role: entry.role };
  }).sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}
function document(name: string, roles: RoleSelection) {
  const folders = validated(z.array(role).max(1000).parse(roles.folders ?? []));
  const files = validated(z.array(role).max(1000).parse(roles.files ?? []));
  const array = (entries: typeof folders) => `[${entries.map(entry => `{ path = ${JSON.stringify(entry.path)}, role = ${JSON.stringify(entry.role)} }`).join(', ')}]`;
  return marker + `version = 1\ntest = []\n\n[project]\nname = ${JSON.stringify(name)}\n\n[sources]\nrtl = []\npackages = []\n\n[import_review]\nversion = 1\npending = true\nfolders = ${array(folders)}\nfiles = ${array(files)}\n`;
}
async function contents(root: string): Promise<string | undefined> {
  const file = path.join(root, 'rtl.toml');
  try {
    const stat = await lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || stat.size > 1048576) throw Error('Invalid, linked or oversized rtl.toml; existing data was not changed.');
    const handle = await open(file, 'r');
    try {
      const current = await handle.stat();
      if (current.size > 1048576 || current.ino !== stat.ino || current.dev !== stat.dev) throw Error('rtl.toml changed while reading.');
      const buffer = Buffer.alloc(1048577); const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
      if (bytesRead > 1048576) throw Error('Oversized rtl.toml.');
      return buffer.subarray(0, bytesRead).toString('utf8');
    } finally { await handle.close(); }
  } catch (error) { if (!missing(error)) throw error; return undefined; }
}
/** Existing ordinary manifests are never adopted as IDE-owned review files. */
export async function readImportSettings(root: string): Promise<ImportSettings | undefined> {
  const text = await contents(root);
  if (text === undefined) return { revision: 'absent', roles: {}, name: path.basename(root) || 'RTL project' };
  const raw = parse(text);
  if (!text.startsWith(marker) && !('import_review' in raw)) return undefined;
  const parsed = schema.parse(raw);
  const roles = { folders: parsed.import_review.folders, files: parsed.import_review.files };
  if (text !== document(parsed.project.name, roles)) throw Error('Managed rtl.toml was manually changed. Preserve it and resolve the changes before saving import settings.');
  return { revision: digest(text), roles, name: parsed.project.name };
}
/** Explicit save only. Cooperative writer lock + revision check; first publication never replaces an existing file. */
export async function saveImportSettings(directory: string, revision: string, roles: RoleSelection, signal?: AbortSignal): Promise<ImportSettings> {
  return publish(directory, revision, roles, signal);
}
async function publish(directory: string, revision: string, roles: RoleSelection, signal?: AbortSignal, createText?: (name: string) => Promise<string>, reader = readImportSettings): Promise<ImportSettings> {
  signal?.throwIfAborted();
  const root = await realpath(directory);
  const rootStat = await lstat(directory);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw Error('Import project root must not be a link.');
  const initial = await reader(root);
  if (!initial || initial.revision !== revision) throw Error('rtl.toml changed. Refresh and review before saving; no manifest was overwritten.');
  document(initial.name, roles); signal?.throwIfAborted();
  const generated = path.join(root, '.rtl');
  try { await mkdir(generated); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
  const checkDirectory = async () => {
    const stat = await lstat(generated);
    if (!stat.isDirectory() || stat.isSymbolicLink() || await realpath(generated) !== generated) throw Error('Import settings directory must not be a link.');
  };
  await checkDirectory();
  const lockFile = path.join(generated, 'import-review.lock');
  const lock = await open(lockFile, 'wx').catch(error => { throw Error(`Import settings are busy or cannot be written: ${String(error)}`); });
  const temporary = path.join(generated, `import-review-${randomUUID()}.tmp`);
  try {
    signal?.throwIfAborted();
    const current = await reader(root);
    if (!current || current.revision !== revision) throw Error('rtl.toml changed. Refresh and review before saving; no manifest was overwritten.');
    const text = createText ? await createText(current.name) : document(current.name, roles);
    if (Buffer.byteLength(text) > 1048576) throw Error('Import settings exceed 1 MiB.');
    if (revision !== 'absent') {
      const stat = await lstat(path.join(root, 'rtl.toml'));
      if (!(stat.mode & 0o222)) throw Error('rtl.toml is read-only.');
      const writable = await open(path.join(root, 'rtl.toml'), 'r+'); await writable.close();
    }
    const file = await open(temporary, 'wx');
    try { await file.writeFile(text, 'utf8'); await file.sync(); } finally { await file.close(); }
    signal?.throwIfAborted(); await checkDirectory();
    const latest = await reader(root);
    if (!latest || latest.revision !== revision) throw Error('rtl.toml changed during save. Refresh before retrying.');
    signal?.throwIfAborted();
    if (revision === 'absent') await link(temporary, path.join(root, 'rtl.toml'));
    else await rename(temporary, path.join(root, 'rtl.toml'));
    return { revision: digest(text), roles: { folders: validated(roles.folders ?? []), files: validated(roles.files ?? []) }, name: current.name };
  } finally {
    try { await unlink(temporary).catch(error => { if (!missing(error)) throw error; }); }
    finally { try { await lock.close(); } finally { await unlink(lockFile); } }
  }
}
/** Reanalyze while holding the cooperative manifest lock. Never accepts a cached preview as authority. */
export async function confirmImportSettings(review: DiscoveryReview, selection: ImportSelection, provider: ImportSemanticProvider, signal?: AbortSignal): Promise<ImportPreview> {
  let preview: ImportPreview | undefined;
  await publish(review.inventory.root, review.manifestRevision, { folders: review.folders, files: review.files }, signal, async name => {
    preview = await prepareImportTargets(review, selection, provider, signal);
    const text = executionDocument(name, preview, { folders: review.folders, files: review.files });
    await loadProject(review.inventory.root, text);
    return text;
  }, review.execution ? readImportedExecution : readImportSettings);
  return preview!;
}

const executionMarker = '# RTL IDE imported execution project v1\n';
function executionDocument(name: string, preview: ImportPreview, roles: RoleSelection): string {
  const quote = JSON.stringify;
  const files = (paths: string[]) => `[${paths.map(file => `{ file = ${quote(file)} }`).join(', ')}]`;
  let text = executionMarker + 'version = 1\n\n[project]\nname = ' + quote(name) + '\n\n[sources]\n';
  text += `rtl = ${files(preview.sources)}\npackages = ${files(preview.packages)}\npackage_order = "manifest"\ninclude_dirs = ${quote(preview.includeDirs)}\n`;
  if (Object.keys(preview.defines).length) text += '\n[sources.defines]\n' + Object.entries(preview.defines).map(([key, value]) => `${quote(key)} = ${quote(value)}\n`).join('');
  text += '\n[simulation]\nbackend = "verilator"\ntiming = true\nwaveform = "vcd"\ntimeout_ms = 60000\njobs = 1\n';
  for (const test of preview.tests) text += `\n[[test]]\nname = ${quote(test.name)}\ntop = ${quote(test.top)}\nsources = ${files([test.file])}\n`;
  return text + '\n# Import roles: ' + quote({ folders: roles.folders ?? [], files: roles.files ?? [] }) + '\n';
}
const literal = z.object({ file: z.string().min(1).max(4096) }).strict();
const executable = z.object({ version: z.literal(1), project: z.object({ name: z.string().min(1) }).strict(),
  sources: z.object({ rtl: z.array(literal).max(10000), packages: z.array(literal).max(10000), package_order: z.literal('manifest'), include_dirs: z.array(z.string().max(4096)).max(100), defines: z.record(z.string()).optional() }).strict(),
  simulation: z.object({ backend: z.literal('verilator'), timing: z.literal(true), waveform: z.literal('vcd'), timeout_ms: z.literal(60000), jobs: z.literal(1) }).strict(),
  test: z.array(z.object({ name: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.-]*$/), top: z.string().regex(/^[A-Za-z_][A-Za-z0-9_$]*$/), sources: z.array(literal).length(1) }).strict()).max(32).default([])
}).strict();
/** Explicit management entry only; never used to auto-adopt ordinary/custom TOML.
 * Parse without checking old file existence, so a deleted source can be repaired.
 */
export async function readImportedExecution(root: string): Promise<(ImportSettings & { preview: ImportPreview }) | undefined> {
  const text = await contents(root);
  if (!text?.startsWith(executionMarker)) return undefined;
  const value = executable.parse(parse(text));
  const comment = text.match(/^# Import roles: (.+)$/m);
  if (!comment) throw Error('Imported project role metadata is missing. Preserve the manifest.');
  const roles = z.object({ folders: z.array(role).max(1000), files: z.array(role).max(1000) }).strict().parse(JSON.parse(comment[1]));
  validated(roles.folders); validated(roles.files);
  const preview: ImportPreview = { tests: value.test.map(test => ({ name: test.name, top: test.top, file: test.sources[0].file })),
    sources: value.sources.rtl.map(file => file.file), packages: value.sources.packages.map(file => file.file), includeDirs: value.sources.include_dirs, defines: value.sources.defines ?? {}, warnings: [] };
  if (text !== executionDocument(value.project.name, preview, roles)) throw Error('Imported rtl.toml was manually changed. Preserve it; automatic management is unavailable.');
  return { revision: digest(text), name: value.project.name, roles, preview };
}
