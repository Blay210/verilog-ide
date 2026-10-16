import { executionDocument, parseImportedExecution, validatedImportRoles as validated } from './execution-document';
import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, open, realpath, unlink } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'smol-toml';
import { z } from 'zod';
import type { RoleSelection } from '../discovery-model';
import type { DiscoveryReview, ImportSelection, ImportPreview } from '../discovery-model';
import { prepareImportTargets, type ImportSemanticProvider } from './import-targets';
import { discoverProject } from './discovery';
import { loadProject } from './config';
import { acquireImportLease } from './import-lease';
import { readImportConfiguration, publishImportConfiguration } from './import-publication';

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
function document(name: string, roles: RoleSelection) {
  const folders = validated(z.array(role).max(1000).parse(roles.folders ?? []));
  const files = validated(z.array(role).max(1000).parse(roles.files ?? []));
  const array = (entries: typeof folders) => `[${entries.map(entry => `{ path = ${JSON.stringify(entry.path)}, role = ${JSON.stringify(entry.role)} }`).join(', ')}]`;
  return marker + `version = 1\ntest = []\n\n[project]\nname = ${JSON.stringify(name)}\n\n[sources]\nrtl = []\npackages = []\n\n[import_review]\nversion = 1\npending = true\nfolders = ${array(folders)}\nfiles = ${array(files)}\n`;
}
/** Existing ordinary manifests are never adopted as IDE-owned review files. */
export async function readImportSettings(root: string, signal?: AbortSignal): Promise<ImportSettings | undefined> {
  return parseImportSettings(root, await readImportConfiguration(root, signal));
}
function parseImportSettings(root: string, text: string | undefined): ImportSettings | undefined {
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
async function publish(directory: string, revision: string, roles: RoleSelection, signal?: AbortSignal, createText?: (name: string) => Promise<string>, parser: (root: string, text: string | undefined) => ImportSettings | undefined = parseImportSettings): Promise<ImportSettings> {
  signal?.throwIfAborted();
  const root = await realpath(directory);
  const rootStat = await lstat(directory);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw Error('Import project root must not be a link.');
  const initial = parser(root, await readImportConfiguration(root, signal));
  if (!initial || initial.revision !== revision) throw Error('rtl.toml changed. Refresh and review before saving; no manifest was overwritten.');
  document(initial.name, roles); signal?.throwIfAborted();
  const generated = path.join(root, '.rtl');
  try { await mkdir(generated); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
  const checkDirectory = async () => {
    const stat = await lstat(generated);
    if (!stat.isDirectory() || stat.isSymbolicLink() || await realpath(generated) !== generated) throw Error('Import settings directory must not be a link.');
  };
  await checkDirectory();
  const releaseLease = await acquireImportLease(generated, signal);
  const temporary = path.join(generated, `import-review-${randomUUID()}.tmp`);
  try {
    signal?.throwIfAborted();
    const current = parser(root, await readImportConfiguration(root, signal));
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
    signal?.throwIfAborted();
    await publishImportConfiguration(root, revision, text, signal, contents => {
      const latest = parser(root, contents);
      if (!latest || latest.revision !== revision) throw Error('rtl.toml changed during save. Refresh before retrying.');
    });
    return { revision: digest(text), roles: { folders: validated(roles.folders ?? []), files: validated(roles.files ?? []) }, name: current.name };
  } finally {
    try { await unlink(temporary).catch(error => { if (!missing(error)) throw error; }); }
    finally { await releaseLease(); }
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
  }, review.execution ? parseImportedExecution : parseImportSettings);
  return preview!;
}

/** Useful before a TB/toolchain exists; explicit creation, no compiler probe. */
export async function confirmSourceOnlySettings(review: DiscoveryReview, selection: ImportSelection, signal?: AbortSignal): Promise<ImportPreview> {
  const settings = z.object({ ids: z.array(z.string()).length(0), includeDirs: z.array(z.string().min(1).max(4096)).max(100).default([]), defines: z.record(z.string().max(4096)).default({}) }).strict().parse(selection);
  if (Object.keys(settings.defines).length > 100 || Object.keys(settings.defines).some(name => !/^[A-Za-z_][A-Za-z0-9_$]*$/.test(name) || ['RTL_WAVEFORM', 'RTL_FST'].includes(name))) throw Error('Invalid or reserved define.');
  let preview: ImportPreview | undefined;
  await publish(review.inventory.root, review.manifestRevision, { folders: review.folders, files: review.files }, signal, async name => {
    const inventory = await discoverProject(review.inventory.root, { folders: review.folders, files: review.files, signal });
    const common = inventory.sources.filter(file => file.role === 'source' && file.kind !== 'header');
    if (common.some(file => file.kind === 'mixed')) throw Error('혼합 package/module 파일은 명시적 프로젝트 설정이 필요합니다.');
    const includeDirs = [...new Set([...inventory.sources.filter(file => file.kind === 'header').map(file => path.dirname(file.path)), ...settings.includeDirs])];
    for (const directory of includeDirs) {
      signal?.throwIfAborted();
      if (path.isAbsolute(directory) || /^[A-Za-z]:/.test(directory) || directory.replaceAll('\\', '/').split('/').includes('..')) throw Error('Include directories must be project-relative.');
      const absolute = path.resolve(inventory.root, directory), stat = await lstat(absolute), resolved = await realpath(absolute);
      const relative = path.relative(inventory.root, resolved);
      if (!stat.isDirectory() || stat.isSymbolicLink() || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) throw Error('Include directory is missing, linked or outside this project.');
    }
    preview = { tests: [], sources: common.filter(file => file.kind !== 'package').map(file => file.path), packages: common.filter(file => file.kind === 'package').map(file => file.path), includeDirs, defines: settings.defines, warnings: [] };
    return executionDocument(name, preview, { folders: review.folders, files: review.files });
  }, review.execution ? parseImportedExecution : parseImportSettings);
  return preview!;
}

/** Explicit management entry only; never used to auto-adopt ordinary/custom TOML.
 * Parse without checking old file existence, so a deleted source can be repaired.
 */
export async function readImportedExecution(root: string, signal?: AbortSignal): Promise<(ImportSettings & { preview: ImportPreview }) | undefined> {
  return parseImportedExecution(root, await readImportConfiguration(root, signal));
}
