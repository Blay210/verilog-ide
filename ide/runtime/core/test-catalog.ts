/** Source-first TB selection. Discovery never writes preferences or invokes tools. */
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { lstat, readFile, realpath, mkdir, open, rename, unlink } from 'node:fs/promises';
import { z } from 'zod';
import { discoverProject } from './discovery';
import { parseImportedExecution, validatedImportRoles } from './execution-document';
import { acquireImportLease } from './import-lease';
import { assertImportPublicationReady } from './import-publication';
import type { FolderRole, TopCandidate } from '../discovery-model';

const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const key = (value: string) => process.platform === 'win32' ? value.toLowerCase() : value;
const relative = z.string().min(1).max(4096).transform(value => {
  const normalized = value.replaceAll('\\', '/');
  if (path.isAbsolute(value) || /^[A-Za-z]:/.test(normalized) || normalized.split('/').some(part => !part || part === '.' || part === '..' || ['.rtl', '.git', 'node_modules'].includes(part.toLowerCase()))) throw Error('TB selection paths must stay in project source folders.');
  return normalized;
});
const role = z.object({ path: z.string().max(4096), role: z.enum(['source', 'simulation', 'excluded']) }).strict();
const identity = z.object({ file: relative, top: z.string().regex(/^[A-Za-z_][A-Za-z0-9_$]*$/), name: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.-]*$/).optional() }).strict();
const schema = z.object({ version: z.literal(1), folders: z.array(role).max(1000), files: z.array(role).max(1000), manual: z.array(relative).max(1000), excluded: z.array(identity).max(10000) }).strict();
export type TestCatalogPolicy = z.infer<typeof schema>;
export type TestCatalogEdit = { action: 'folder'; path: string } | { action: 'file'; path: string } | { action: 'import'; path: string } | { action: 'exclude'; file: string; top: string; name?: string } | { action: 'restore'; file: string; top: string; name?: string } | { action: 'restore-all' };
export interface CatalogTest { name: string; top: string; sources: (string | { file: string })[]; tags: string[]; timeout_ms?: number }
export interface TestCatalog {
  policy: TestCatalogPolicy; revision: string; enabled: boolean;
}
export const catalogKey = (file: string, top: string) => key(path.posix.normalize(file.replaceAll('\\', '/'))) + '\0' + top;
const exclusionKey = (item: { file: string; top: string; name?: string }) => catalogKey(item.file, item.top) + '\0' + (item.name ?? '');
function validatedPolicy(value: unknown): TestCatalogPolicy {
  const policy = schema.parse(value); policy.folders = validatedImportRoles(policy.folders); policy.files = validatedImportRoles(policy.files);
  if (new Set(policy.manual.map(key)).size !== policy.manual.length || new Set(policy.excluded.map(exclusionKey)).size !== policy.excluded.length) throw Error('Duplicate TB selection identity.');
  return policy;
}
function defaults(text: string): TestCatalogPolicy {
  let roles;
  try { roles = parseImportedExecution('', text)?.roles; } catch { /* Preserve custom TOML; never adopt modified managed metadata. */ }
  return { version: 1, folders: roles?.folders ?? [], files: roles?.files ?? [], manual: [], excluded: [] };
}
async function safeRoot(directory: string) {
  const root = path.resolve(directory);
  const info = await lstat(root);
  if (!info.isDirectory() || info.isSymbolicLink() || key(await realpath(root)) !== key(root)) throw Error('TB project root must not be a link.');
  return root;
}
async function readDocument(root: string): Promise<string | undefined> {
  const file = path.join(root, 'rtl-tests.json');
  let before;
  try { before = await lstat(file); } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return; throw error; }
  if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1 || before.size > 1048576) throw Error('rtl-tests.json must be a regular, unlinked file within 1 MiB.');
  const bytes = await readFile(file), after = await lstat(file);
  if (!after.isFile() || after.isSymbolicLink() || after.nlink !== 1 || before.dev !== after.dev || before.ino !== after.ino || before.size !== bytes.length || after.size !== bytes.length || before.mtimeMs !== after.mtimeMs) throw Error('TB selection changed while reading.');
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
export async function readTestCatalog(directory: string, manifestText?: string): Promise<TestCatalog> {
  const root = await safeRoot(directory);
  const text = await readDocument(root);
  const manifest = manifestText ?? await readFile(path.join(root, 'rtl.toml'), 'utf8').catch(error => { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return ''; throw error; });
  const policy = text === undefined ? defaults(manifest) : validatedPolicy(JSON.parse(text));
  policy.folders = validatedImportRoles(policy.folders); policy.files = validatedImportRoles(policy.files);
  let managed = false;
  try { managed = !!parseImportedExecution(root, manifest); } catch { /* Never adopt a changed/user document. */ }
  return { policy, revision: text === undefined ? 'absent' : hash(text), enabled: managed || text !== undefined || policy.folders.some(item => item.role === 'simulation') || policy.files.some(item => item.role === 'simulation') };
}
function roleFor(file: string, rules: FolderRole[]) {
  return rules.filter(rule => !rule.path || key(file).startsWith(key(rule.path) + '/')).sort((a, b) => b.path.length - a.path.length)[0]?.role;
}
export function catalogOwnsFile(policy: TestCatalogPolicy, file: string) {
  const explicit = policy.files.find(rule => key(rule.path) === key(file))?.role;
  return policy.manual.some(item => key(item) === key(file)) || (explicit ?? roleFor(file, policy.folders)) === 'simulation';
}
export async function discoverCatalog(root: string, catalog: TestCatalog, signal?: AbortSignal) {
  const policy = catalog.policy;
  // A manual file is the user's explicit choice, including outside automatic folders.
  const folders = policy.folders.filter(rule => rule.role !== 'excluded' || !policy.manual.some(file => !rule.path || key(file).startsWith(key(rule.path) + '/')));
  const files = [...policy.files.filter(rule => !policy.manual.some(file => key(file) === key(rule.path))), ...policy.manual.map(file => ({ path: file, role: 'simulation' as const }))];
  const inventory = await discoverProject(root, { folders, files, signal });
  const seen = new Map<string, number>();
  for (const top of inventory.tops) seen.set(catalogKey(top.file, top.top), (seen.get(catalogKey(top.file, top.top)) ?? 0) + 1);
  const candidates = inventory.tops.filter(top => {
    const source = inventory.sources.find(source => key(source.path) === key(top.file));
    const declaration = source?.declarations.find(item => item.offset === top.offset);
    const selected = catalogOwnsFile(policy, top.file);
    return selected && declaration?.kind === 'module' && declaration.complete && seen.get(catalogKey(top.file, top.top)) === 1 && !policy.excluded.some(item => catalogKey(item.file, item.top) === catalogKey(top.file, top.top));
  });
  return { inventory, candidates };
}
function literalFile(test: CatalogTest, root: string): string | undefined {
  if (test.sources.length !== 1) return;
  const value = test.sources[0];
  if (typeof value === 'string' && /[?*{}[\]!]/.test(value)) return;
  const file = path.relative(root, path.resolve(root, typeof value === 'string' ? value : value.file)).replaceAll('\\', '/');
  if (file === '..' || file.startsWith('../') || path.isAbsolute(file)) return;
  return path.posix.normalize(file);
}
function automaticName(top: TopCandidate) {
  const readable = `${path.posix.basename(top.file, path.posix.extname(top.file)).toLowerCase()}.${top.top}`;
  const suffix = hash(catalogKey(top.file, top.top)).slice(0, 12);
  return /^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(readable) ? `${readable}-${suffix}` : `tb-${suffix}`;
}
export function catalogDisplayName(name: string, file: string, top: string): string {
  return name === automaticName({ file, top } as TopCandidate) ? `${path.posix.basename(file, path.posix.extname(file))}.${top}` : name;
}
export async function resolveCatalogTests(root: string, text: string, tests: CatalogTest[], signal?: AbortSignal) {
  const catalog = await readTestCatalog(root, text);
  if (!catalog.enabled) return { tests, catalog, inventory: undefined, candidates: [] as TopCandidate[], definedFiles: [] as string[] };
  const { inventory, candidates } = await discoverCatalog(root, catalog, signal);
  const selected = tests.filter(test => {
    const file = literalFile(test, root);
    if (catalog.policy.excluded.some(item => item.name === test.name)) return false;
    if (!file) return true; // Preserve custom multi-source/glob tests without guessing their identity.
    return inventory.tops.some(top => catalogKey(top.file, top.top) === catalogKey(file, test.top)) && !catalog.policy.excluded.some(item => catalogKey(item.file, item.top) === catalogKey(file, test.top) && (!item.name || item.name === test.name));
  });
  const identities = new Set(selected.flatMap(test => { const file = literalFile(test, root); return file ? [catalogKey(file, test.top)] : []; }));
  for (const top of candidates) {
    if (!identities.has(catalogKey(top.file, top.top))) selected.push({ name: automaticName(top), top: top.top, sources: [{ file: top.file }], tags: [] });
  }
  if (selected.length > 1000) throw Error('Simulation list exceeds 1000 tests; narrow the TB folder selection.');
  return { tests: selected, catalog, inventory, candidates, definedFiles: tests.flatMap(test => { const file = literalFile(test, root); return file ? [file] : []; }) };
}
/** Explicit user preferences only; automatic discovery never publishes a file. */
export async function saveTestCatalog(directory: string, revision: string, policy: TestCatalogPolicy, signal?: AbortSignal) {
  signal?.throwIfAborted();
  const root = await safeRoot(directory); await assertImportPublicationReady(root);
  const parsed = validatedPolicy(policy);
  const text = JSON.stringify(parsed, null, 2) + '\n';
  if (Buffer.byteLength(text) > 1048576) throw Error('TB selection exceeds 1 MiB.');
  const generated = path.join(root, '.rtl'); await mkdir(generated, { recursive: true });
  if ((await lstat(generated)).isSymbolicLink() || await realpath(generated) !== generated) throw Error('TB settings storage must not be a link.');
  const release = await acquireImportLease(generated, signal), temporary = path.join(generated, `test-catalog-${randomUUID()}.tmp`);
  try {
    signal?.throwIfAborted();
    if ((await readTestCatalog(root)).revision !== revision) throw Error('TB selection changed. Refresh before applying your change.');
    const handle = await open(temporary, 'wx'); try { await handle.writeFile(text); await handle.sync(); } finally { await handle.close(); }
    signal?.throwIfAborted(); await assertImportPublicationReady(root);
    if ((await readTestCatalog(root)).revision !== revision) throw Error('TB selection changed before publication.');
    await rename(temporary, path.join(root, 'rtl-tests.json'));
  } finally { try { await unlink(temporary).catch(error => { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }); } finally { await release(); } }
  return readTestCatalog(root);
}
export async function editTestCatalog(root: string, revision: string, edit: TestCatalogEdit, signal?: AbortSignal) {
  if (!edit || !['folder', 'file', 'import', 'exclude', 'restore', 'restore-all'].includes(edit.action)) throw Error('Unknown TB selection operation.');
  const current = await readTestCatalog(root), policy = current.policy;
  if (current.revision !== revision) throw Error('TB selection changed. Refresh before applying your change.');
  if (edit.action === 'restore-all') { policy.excluded = []; return saveTestCatalog(root, revision, policy, signal); }
  if (edit.action === 'import') {
    signal?.throwIfAborted();
    const projectRoot = await safeRoot(root), source = path.resolve(edit.path);
    if (!path.isAbsolute(edit.path) || !/\.(v|sv)$/i.test(source)) throw Error('가져올 Verilog/SystemVerilog 파일을 선택해 주세요.');
    const info = await lstat(source);
    if (!info.isFile() || info.isSymbolicLink() || key(await realpath(source)) !== key(source) || info.size > 8 * 1024 * 1024) throw Error('링크가 아닌 8 MiB 이하의 TB 코드 파일을 선택해 주세요.');
    const folder = relative.parse(policy.folders.find(item => item.role === 'simulation' && item.path)?.path ?? 'tb');
    let directory = projectRoot;
    for (const segment of folder.split('/')) {
      directory = path.join(directory, segment); await mkdir(directory).catch(error => { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; });
      const stat = await lstat(directory);
      if (!stat.isDirectory() || stat.isSymbolicLink() || key(await realpath(directory)) !== key(directory)) throw Error('TB 대상 폴더에 링크를 사용할 수 없습니다.');
    }
    const location = relative.parse(`${folder}/${path.basename(source)}`), destination = path.join(projectRoot, ...location.split('/'));
    const bytes = await readFile(source); signal?.throwIfAborted();
    if (bytes.length > 8 * 1024 * 1024 || key(await realpath(source)) !== key(source)) throw Error('가져오는 동안 원본 파일이 바뀌었습니다.');
    const handle = await open(destination, 'wx');
    try { await handle.writeFile(bytes); await handle.sync(); } finally { await handle.close(); }
    // A cancelled/conflicting registration leaves the copied source for review.
    // Never remove user-visible RTL as recovery or overwrite a same-name file.
    return editTestCatalog(projectRoot, revision, { action: 'file', path: location }, signal);
  }
  if (edit.action === 'folder' || edit.action === 'file') {
    const location = relative.parse(edit.path), resolved = path.join(root, ...location.split('/'));
    let parent = path.resolve(root);
    for (const segment of location.split('/')) { parent = path.join(parent, segment); if ((await lstat(parent)).isSymbolicLink()) throw Error('TB paths must not contain links.'); }
    const stat = await lstat(resolved);
    if (edit.action === 'folder') {
      if (!stat.isDirectory()) throw Error('Select a TB folder.');
      policy.folders = [...policy.folders.filter(item => key(item.path) !== key(location)), { path: location, role: 'simulation' }];
    } else {
      if (!stat.isFile() || !/\.(sv|v)$/i.test(location)) throw Error('Select a Verilog/SystemVerilog TB code file.');
      if (!policy.manual.some(file => key(file) === key(location))) policy.manual.push(location);
      // Explicitly adding a file restores its previously removed individual tops.
      policy.excluded = policy.excluded.filter(item => key(item.file) !== key(location));
      const found = await discoverCatalog(root, { ...current, policy }, signal);
      if (!found.candidates.some(item => key(item.file) === key(location))) throw Error('No complete, unique module was found in this TB file.');
    }
  } else {
    const item = identity.parse({ file: edit.file, top: edit.top, ...(edit.name ? { name: edit.name } : {}) });
    policy.excluded = policy.excluded.filter(old => catalogKey(old.file, old.top) !== catalogKey(item.file, item.top) || (item.name !== undefined && old.name !== item.name));
    if (edit.action === 'exclude') policy.excluded.push(item);
  }
  return saveTestCatalog(root, revision, policy, signal);
}
