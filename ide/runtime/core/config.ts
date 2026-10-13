import { resolveCatalogTests, catalogOwnsFile } from './test-catalog';
import { readFile, stat, lstat } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'smol-toml';
import glob from 'fast-glob';
import { z } from 'zod';
import type { Project } from './model';
import { assertImportPublicationReady } from './import-publication';

const identifier = z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_$]*$/);
const paths = z.array(z.union([z.string().min(1), z.object({ file: z.string().min(1).max(4096) }).strict()]));
type SourcePattern = string | { file: string };
export interface ProjectWatchPaths {
  readonly sources: readonly { readonly directory: string; readonly auxiliary: boolean }[];
  readonly includes: readonly string[];
}
// Selection metadata belongs to this parsed Project/error, never to a settled
// file or configuration cache. It is not part of the serialized Project contract.
const catalogs = new WeakMap<object, Awaited<ReturnType<typeof resolveCatalogTests>>>();
export const projectTestCatalog = (value: unknown) => value && typeof value === 'object' ? catalogs.get(value) : undefined;
const watchPaths = new WeakMap<object, ProjectWatchPaths>();
export const projectWatchPaths = (value: unknown): ProjectWatchPaths | undefined => value && typeof value === 'object' ? watchPaths.get(value) : undefined;
export class ProjectManifestMissing extends Error {
  constructor(readonly root: string, cause: unknown) {
    super(`Cannot read rtl.toml: ${String(cause)}`, { cause });
    this.name = 'ProjectManifestMissing';
  }
}
function validatedPattern(original: SourcePattern): string | undefined {
  if (typeof original !== 'string') {
    const parts = original.file.replaceAll('\\', '/').split('/');
    if (path.isAbsolute(original.file) || /^[A-Za-z]:/.test(original.file) || parts.some(part => part === '..' || ['.rtl', '.git', 'node_modules'].includes(part.toLowerCase()))) throw Error('Literal source files must stay inside project source folders.');
    return;
  }
  const pattern = original.replaceAll('\\', '/');
  if (pattern.startsWith('!')) throw Error('Negative source globs are not supported; use explicit source groups.');
  // Bound nesting before either discovery or metadata invokes fast-glob's
  // parser; its upstream braces dependency has a stack-exhaustion advisory.
  if (pattern.length > 4096) throw Error('Source glob exceeds 4096 characters.');
  let braceDepth = 0, braceCount = 0;
  for (const char of pattern) {
    if (char === '{' && (++braceDepth > 16 || ++braceCount > 64)) throw Error('Source glob brace nesting is too complex; use separate source groups.');
    if (char === '}') braceDepth = Math.max(0, braceDepth - 1);
  }
  return pattern;
}
function selectionPaths(root: string, patterns: SourcePattern[], includes: string[]): ProjectWatchPaths {
  const scopes = new Map<string, { directory: string; auxiliary: boolean }>();
  for (const original of patterns) {
    // Validate before generateTasks invokes the upstream glob parser.
    const pattern = validatedPattern(original);
    const bases = pattern === undefined ? [path.dirname(path.resolve(root, (original as { file: string }).file))] : glob.generateTasks([pattern]).map(task => path.resolve(root, task.base));
    const spelling = pattern ?? (original as { file: string }).file;
    const rtlOnly = /\.(?:sv|v|svh|vh|\{(?:sv|v|svh|vh)(?:,(?:sv|v|svh|vh))*\})$/.test(spelling);
    for (const directory of bases) {
      const relative = path.relative(root, directory);
      const auxiliary = !rtlOnly || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative);
      const key = process.platform === 'win32' ? directory.toLowerCase() : directory;
      scopes.set(key, { directory, auxiliary: auxiliary || !!scopes.get(key)?.auxiliary });
    }
  }
  return Object.freeze({ sources: Object.freeze([...scopes.values()].map(scope => Object.freeze(scope))), includes: Object.freeze([...includes]) });
}
const schema = z.object({
  version: z.literal(1),
  project: z.object({ name: z.string().min(1) }).strict(),
  sources: z.object({ packages: paths.default([]), package_order: z.enum(['auto', 'manifest']).default('auto'), rtl: paths.default(['rtl/**/*.{sv,v}']), include_dirs: z.array(z.string().min(1)).default([]), defines: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}) }).strict().default({}),
  simulation: z.object({ backend: z.string().min(1).default('verilator'), timing: z.boolean().default(true), waveform: z.enum(['vcd', 'fst', 'none']).default('vcd'), timeout_ms: z.number().int().positive().max(86400000).default(60000), jobs: z.number().int().min(1).max(4).default(1) }).strict().default({}),
  test: z.array(z.object({ name: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/), top: identifier, sources: paths.min(1), tags: z.array(z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/)).default([]), timeout_ms: z.number().int().positive().max(86400000).optional() }).strict()).default([])
}).strict();

export async function discover(root: string, patterns: SourcePattern[]): Promise<string[]> {
  const files: string[] = [];
  for (const original of patterns) {
    const pattern = validatedPattern(original);
    if (typeof original !== 'string') {
      const parts = original.file.replaceAll('\\', '/').split('/');
      let file = path.resolve(root);
      for (const part of parts.filter(part => part && part !== '.')) {
        file = path.join(file, part);
        if ((await lstat(file)).isSymbolicLink()) throw Error('Literal source paths must not contain links.');
      }
      if (!(await lstat(file)).isFile()) throw Error(`Literal source is not a file: ${original.file}`);
      files.push(file); continue;
    }
    const found = await glob(pattern!, { cwd: root, absolute: true, onlyFiles: true, unique: true, followSymbolicLinks: false, ignore: ['**/.rtl/**', '**/node_modules/**', '**/.git/**'] });
    if (!found.length) throw Error(`Source pattern matched no files: ${original}`);
    files.push(...found.sort().map(file => path.resolve(file)));
  }
  const seen = new Set<string>();
  return files.filter(file => { const key = process.platform === 'win32' ? file.toLowerCase() : file; if (seen.has(key)) return false; seen.add(key); return true; });
}

export async function loadProject(directory: string, manifestText?: string, signal?: AbortSignal): Promise<Project> {
  const root = path.resolve(directory);
  if (manifestText === undefined) await assertImportPublicationReady(root);
  let text = manifestText;
  if (text === undefined) {
    const manifest = path.join(root, 'rtl.toml');
    try {
      const info = await lstat(manifest);
      if (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1) throw Error('rtl.toml must be a regular, unlinked configuration file.');
      text = await readFile(manifest, 'utf8');
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // A dangling link is a broken configuration, not an absent manifest.
        let absent = false;
        try { await lstat(manifest); }
        catch (probeError) { absent = (probeError as NodeJS.ErrnoException).code === 'ENOENT'; }
        if (absent) {
          await assertImportPublicationReady(root);
          throw new ProjectManifestMissing(root, error);
        }
      }
      throw Error(`Cannot read rtl.toml: ${String(error)}`, { cause: error });
    }
  }
  let raw: unknown;
  try { raw = parse(text); }
  catch (error) { throw Error(`Cannot read rtl.toml: ${String(error)}`); }
  if (manifestText === undefined) await assertImportPublicationReady(root);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw Error(parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n'));
  const config = parsed.data;
  for (const pattern of [...config.sources.packages, ...config.sources.rtl, ...config.test.flatMap(test => test.sources)]) validatedPattern(pattern);
  // Proposed import documents are checked as written; live folder discovery is read-only.
  const catalog = manifestText === undefined ? await resolveCatalogTests(root, text, config.test, signal) : undefined;
  if (catalog) config.test = catalog.tests;
  if (catalog?.inventory) {
    const key = (file: string) => process.platform === 'win32' ? file.toLowerCase() : file;
    const present = new Set(catalog.inventory.sources.map(source => key(source.path)));
    const declared = new Set(catalog.definedFiles.map(key));
    config.sources.rtl = config.sources.rtl.filter(pattern => {
      validatedPattern(pattern); // Never suppress invalid/escaping configuration entries.
      if (typeof pattern === 'string' && glob.isDynamicPattern(pattern)) return true;
      const file = path.relative(root, path.resolve(root, typeof pattern === 'string' ? pattern : pattern.file)).replaceAll('\\', '/');
      if (path.isAbsolute(file) || file.split('/').includes('..') || !/\.(sv|v)$/i.test(file)) return true;
      // A registered TB may also have been listed among RTL sources. Its deletion
      // removes membership; missing ordinary DUT/package inputs still fail closed.
      return present.has(key(file)) || (!declared.has(key(file)) && !catalogOwnsFile(catalog.catalog.policy, file));
    });
  }
  const includeDirs = config.sources.include_dirs.map(p => path.resolve(root, p));
  const selection = selectionPaths(root, [...config.sources.packages, ...config.sources.rtl, ...config.test.flatMap(test => test.sources), ...(catalog?.catalog.enabled ? [...catalog.catalog.policy.folders.filter(rule => rule.role === 'simulation').map(rule => ({ file: (rule.path ? rule.path + '/' : '') + '__rtl_watch__.sv' })), ...catalog.catalog.policy.manual.map(file => ({ file }))] : [])], includeDirs);
  try {
    const names = new Set<string>();
    for (const target of config.test) {
      if (names.has(target.name.toLowerCase())) throw Error(`Duplicate test name: ${target.name}`);
      names.add(target.name.toLowerCase());
    }
    for (const key of Object.keys(config.sources.defines)) if (!/^[A-Za-z_][A-Za-z0-9_$]*$/.test(key)) throw Error(`Invalid define: ${key}`);
    for (const key of ['RTL_WAVEFORM', 'RTL_FST']) if (key in config.sources.defines) throw Error(`${key} is reserved; set simulation.waveform instead.`);
    for (const dir of includeDirs) if (!(await stat(dir)).isDirectory()) throw Error(`Include path is not a directory: ${dir}`);
    const project: Project = {
      root, name: config.project.name,
      packageSources: await discover(root, config.sources.packages), packageOrder: config.sources.package_order, jobs: config.simulation.jobs,
      sources: await discover(root, [...config.sources.packages, ...config.sources.rtl]),
      includeDirs, defines: Object.fromEntries(Object.entries(config.sources.defines).map(([k, v]) => [k, String(v)])),
      backend: config.simulation.backend, timing: config.simulation.timing, waveform: config.simulation.waveform,
      tests: await Promise.all(config.test.map(async t => ({ name: t.name, top: t.top, tags: [...new Set(t.tags)], sources: await discover(root, t.sources), timeoutMs: t.timeout_ms ?? config.simulation.timeout_ms })))
    };
    if (manifestText === undefined) await assertImportPublicationReady(root);
    watchPaths.set(project, selection);
    if (catalog) catalogs.set(project, catalog);
    return project;
  } catch (error) {
    if (error && typeof error === 'object') { watchPaths.set(error, selection); if (catalog) catalogs.set(error, catalog); }
    throw error;
  }
}
