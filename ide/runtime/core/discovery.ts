import path from 'node:path';
import { lstat, open, opendir, realpath } from 'node:fs/promises';

import type { SourceRole, FolderRole, DeclarationCandidate, DiscoveryResult } from '../discovery-model';
export type { SourceRole, FolderRole, DeclarationCandidate, DiscoveredSource, TopCandidate, DiscoveryResult } from '../discovery-model';
export interface DiscoveryOptions {
  folders?: FolderRole[];
  files?: FolderRole[];
  signal?: AbortSignal;
  maxFiles?: number;
  maxEntries?: number;
  maxFileBytes?: number;
  maxTotalBytes?: number;
}

const reservedFolders = new Set(['.rtl', '.git', 'node_modules']);
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
const key = (value: string) => process.platform === 'win32' ? value.toLowerCase() : value;
function relativeRole(value: string): string {
  const normalized = value.replaceAll('\\', '/');
  if (path.isAbsolute(value) || /^[A-Za-z]:/.test(normalized) || normalized.startsWith('/') || normalized.split('/').includes('..')) throw Error('Discovery roles must use project-relative paths.');
  return normalized.split('/').filter(part => part && part !== '.').join('/');
}
function roles(entries: FolderRole[] = []) {
  const result = new Map<string, SourceRole>();
  for (const entry of entries) {
    if (!['source', 'simulation', 'excluded'].includes(entry.role)) throw Error('Unknown discovery role.');
    const name = key(relativeRole(entry.path));
    if (result.has(name)) throw Error(`Duplicate discovery role: ${entry.path}`);
    result.set(name, entry.role);
  }
  return result;
}
function folderRole(file: string, entries: Map<string, SourceRole>): SourceRole | undefined {
  let parent = key(file);
  for (;;) {
    if (entries.has(parent)) return entries.get(parent);
    const split = parent.lastIndexOf('/');
    if (split < 0) return entries.get('');
    parent = parent.slice(0, split);
  }
}

/** Bounded lexical discovery only: preserve offsets, hide comments, strings,
 * escaped identifiers and directive lines. Never expand macros or execute tools. */
function mask(text: string): { code: string; preprocessor: boolean; escaped: boolean; incomplete: boolean } {
  const chars = text.split(''); let mode = '', preprocessor = false, escaped = false;
  const hide = (i: number) => { if (text[i] !== '\n' && text[i] !== '\r') chars[i] = ' '; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (mode === 'block') { hide(i); if (c === '*' && n === '/') { hide(++i); mode = ''; } }
    else if (mode === 'line') { hide(i); if (c === '\n') mode = ''; }
    else if (mode === 'string') { hide(i); if (c === '\\' && n !== undefined) hide(++i); else if (c === '"') mode = ''; }
    else if (mode === 'escaped') { hide(i); if (/\s/.test(c)) mode = ''; }
    else if (mode === 'directive') { hide(i); if (c === '\n' && text[i - 1] !== '\\' && !(text[i - 1] === '\r' && text[i - 2] === '\\')) mode = ''; }
    else if (c === '/' && (n === '/' || n === '*')) { mode = n === '*' ? 'block' : 'line'; hide(i); hide(++i); }
    else if (c === '"') { mode = 'string'; hide(i); }
    else if (c === '\\') { escaped = true; mode = 'escaped'; hide(i); }
    else if (c === '`') { preprocessor = true; mode = 'directive'; hide(i); }
  }
  return { code: chars.join(''), preprocessor, escaped, incomplete: mode === 'block' || mode === 'string' };
}
function declarations(code: string): DeclarationCandidate[] {
  const result: DeclarationCandidate[] = [];
  const expression = /\b(module|package|interface|program)\s+(?:(?:automatic|static)\s+)?([A-Za-z_][A-Za-z0-9_$]*)\b|\b(endmodule|endpackage|endinterface|endprogram)\b|\binitial\b|\$(?:finish|fatal|stop|dumpvars|dumpfile)\b/g;
  const stack: DeclarationCandidate[] = [];
  let line = 0, position = 0;
  // A review scanner does not claim to parse interface classes, extern module
  // prototypes, nested declarations, conditional compilation or elaboration.
  for (const match of code.matchAll(expression)) {
    const start = match.index!;
    while (position < start) if (code[position++] === '\n') line++;
    if (match[1]) {
      if (match[2] === 'class') continue;
      const entry: DeclarationCandidate = { kind: match[1] as DeclarationCandidate['kind'], name: match[2], offset: start, line, complete: false, simulationHints: [] };
      result.push(entry); stack.push(entry);
    } else if (match[3]) {
      if (stack.at(-1)?.kind === match[3].slice(3)) stack.pop()!.complete = true;
    } else if (stack.length) {
      const hint = match[0] === 'initial' ? 'initial block' : 'simulation system task';
      if (!stack.at(-1)!.simulationHints.includes(hint)) stack.at(-1)!.simulationHints.push(hint);
    }
  }
  return result;
}

/** Read-only import inventory. Every inferred role/top is reviewable and no
 * rtl.toml, directory, source, cache or external compiler is created or changed. */
export async function discoverProject(directory: string, options: DiscoveryOptions = {}): Promise<DiscoveryResult> {
  const limits = { files: options.maxFiles ?? 10000, entries: options.maxEntries ?? 100000,
    fileBytes: options.maxFileBytes ?? 2 * 1024 * 1024, totalBytes: options.maxTotalBytes ?? 64 * 1024 * 1024 };
  for (const value of Object.values(limits)) if (!Number.isSafeInteger(value) || value <= 0) throw Error('Discovery limits must be positive safe integers.');
  const folders = roles(options.folders), overrides = roles(options.files);
  options.signal?.throwIfAborted();
  const root = await realpath(directory);
  if (!(await lstat(root)).isDirectory()) throw Error('Discovery needs a project folder.');
  const result: DiscoveryResult = { root, manifest: 'absent', sources: [], tops: [], warnings: [] };
  try { const manifest = await lstat(path.join(root, 'rtl.toml')); result.manifest = manifest.isFile() && !manifest.isSymbolicLink() ? 'present' : 'unavailable'; }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') result.manifest = 'unavailable'; }
  if (result.manifest === 'unavailable') result.warnings.push({ file: 'rtl.toml', message: 'Manifest is linked or unreadable; no settings were changed.' });
  const files: string[] = []; let entryCount = 0;
  const queue = [''];
  while (queue.length) {
    options.signal?.throwIfAborted();
    const relative = queue.pop()!;
    let handle;
    try { handle = await opendir(path.join(root, relative)); }
    catch (error) { result.warnings.push({ file: relative, message: `Cannot read folder: ${String(error)}` }); continue; }
    const children: string[] = [];
    for await (const entry of handle) {
      options.signal?.throwIfAborted();
      if (++entryCount > limits.entries) throw Error('Discovery entry limit exceeded; narrow the project folder.');
      const file = relative ? relative + '/' + entry.name : entry.name;
      if (entry.isSymbolicLink()) { result.warnings.push({ file, message: 'Symbolic link skipped; import does not follow links.' }); continue; }
      if (entry.isDirectory()) {
        if (!reservedFolders.has(key(entry.name))) {
          (result.directories ??= ['']).push(file);
          if (folderRole(file, folders) !== 'excluded') children.push(file);
        }
      } else if (entry.isFile() && /\.(?:sv|v|svh|vh)$/i.test(entry.name)) {
        if (files.length >= limits.files) throw Error('Discovery file limit exceeded; narrow the project folder.');
        files.push(file);
      }
    }
    queue.push(...children.sort(compare).reverse());
  }
  let totalBytes = 0;
  for (const file of files.sort(compare)) {
    options.signal?.throwIfAborted();
    const explicit = overrides.get(key(file));
    const inherited = folderRole(file, folders);
    const conventional = /(?:^|\/)(?:tb|testbench|testbenches|tests|sim|simulation)(?:\/|$)/i.test(file) || /(?:^|\/)(?:tb[_-]|[^/]*[_-]tb\.)/i.test(file);
    const role = explicit ?? inherited ?? (conventional ? 'simulation' : 'source');
    if (role === 'excluded') continue;
    const absolute = path.join(root, file);
    let text: string;
    try {
      const entry = await lstat(absolute);
      if (!entry.isFile() || entry.isSymbolicLink()) { result.warnings.push({ file, message: 'File changed or became a link; skipped.' }); continue; }
      if (entry.size > limits.fileBytes) { result.warnings.push({ file, message: 'File exceeds import inspection size limit; review manually.' }); continue; }
      totalBytes += entry.size;
      if (totalBytes > limits.totalBytes) throw Error('Discovery total byte limit exceeded; narrow the project folder.');
      // Bound actual reads as well as the initial stat: a file can grow during
      // inspection. Never allocate an unbounded readFile buffer from that race.
      const resolved = await realpath(absolute), location = path.relative(root, resolved);
      if (path.isAbsolute(location) || location === '..' || location.startsWith('..' + path.sep)) {
        result.warnings.push({ file, message: 'Source resolves outside the project; skipped.' }); continue;
      }
      const handle = await open(resolved, 'r');
      try {
        const buffers: Buffer[] = []; let bytes = 0;
        // Small files need small chunks, including the EOF probe. Keep a 4 KiB
        // floor so a file growing from an empty stat cannot cause bytewise I/O.
        const chunkBytes = Math.max(4096, Math.min(65536, entry.size + 1));
        while (bytes <= limits.fileBytes) {
          options.signal?.throwIfAborted();
          const buffer = Buffer.allocUnsafe(Math.min(chunkBytes, limits.fileBytes - bytes + 1));
          const { bytesRead } = await handle.read(buffer, 0, buffer.length, null);
          if (!bytesRead) break;
          bytes += bytesRead;
          if (totalBytes - entry.size + bytes > limits.totalBytes) throw Error('Discovery total byte limit exceeded; narrow the project folder.');
          buffers.push(buffer.subarray(0, bytesRead));
        }
        totalBytes += bytes - entry.size;
        if (bytes > limits.fileBytes) { result.warnings.push({ file, message: 'Source grew beyond inspection size limit; review manually.' }); continue; }
        text = Buffer.concat(buffers, bytes).toString('utf8');
      } finally { await handle.close(); }
    } catch (error) {
      options.signal?.throwIfAborted();
      if (String(error).includes('total byte limit exceeded')) throw error;
      result.warnings.push({ file, message: `Cannot inspect source: ${String(error)}` }); continue;
    }
    const scanned = mask(text), found = declarations(scanned.code);
    const kinds = new Set(found.map(entry => entry.kind));
    const header = /\.(?:svh|vh)$/i.test(file);
    const kind = header ? 'header' : kinds.size > 1 ? 'mixed' : kinds.has('package') ? 'package' : kinds.has('module') || kinds.has('program') ? 'module' : 'unknown';
    result.sources.push({ path: file, kind, role, roleOrigin: explicit ? 'file' : inherited ? 'folder' : conventional ? 'convention' : 'default', declarations: found, requiresPreprocessing: scanned.preprocessor });
    if (scanned.preprocessor) result.warnings.push({ file, message: 'Preprocessor syntax found; declarations may include inactive branches or omit macro-generated names.' });
    if (scanned.escaped) result.warnings.push({ file, message: 'Escaped identifiers require semantic review and are omitted from lexical names.' });
    if (scanned.incomplete) result.warnings.push({ file, message: 'Unterminated string or comment; candidate discovery may be incomplete.' });
    if (found.some(entry => !entry.complete)) result.warnings.push({ file, message: 'Incomplete declarations; compiler confirmation is required.' });
    if (!header) for (const entry of found.filter(entry => entry.kind === 'module' || entry.kind === 'program')) {
      const hints = [...entry.simulationHints];
      if (role === 'simulation') hints.unshift('simulation file role');
      result.tops.push({ id: `${file}::${entry.name}@${entry.offset}`, file, top: entry.name, offset: entry.offset,
        displayName: `${file.replace(/\.[^.]+$/, '')}.${entry.name}`, intent: role === 'simulation' || hints.length >= 2 ? 'simulation' : 'review', evidence: hints, confirmation: 'required' });
    }
  }
  const names = new Map<string, Set<string>>();
  for (const top of result.tops) { const ids = names.get(top.top) ?? new Set(); ids.add(top.id); names.set(top.top, ids); }
  for (const [name, ids] of names) if (ids.size > 1) result.warnings.push({ message: `Multiple declarations of ${name}; select sources and confirm the intended top with semantic analysis.` });
  options.signal?.throwIfAborted();
  result.directories = (result.directories ?? ['']).sort(compare);
  return result;
}
