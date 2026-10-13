import path from 'node:path';
import type { AnalysisInputs } from '../../runtime/semantic/model';
import type { Project } from '../../runtime/core/model';
import type { ProjectWatchPaths } from '../../runtime/core/config';

export const fileKey = (file: string) => process.platform === 'win32' ? path.resolve(file).toLowerCase() : path.resolve(file);
export function contains(directory: string, file: string): boolean {
  const relative = path.relative(fileKey(directory), fileKey(file));
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
}
export interface InputState { root: string; manifestMissing?: boolean; inputs?: AnalysisInputs; inputProject?: Project; watchPaths?: ProjectWatchPaths }
const indexes = new WeakMap<AnalysisInputs, { files: Set<string>; paths: Set<string>; ancestors: Set<string> }>();
function index(inputs: AnalysisInputs) {
  let value = indexes.get(inputs);
  if (!value) {
    const files = new Set(inputs.files.map(fileKey)), paths = new Set([...files, ...inputs.candidates.map(fileKey)]), ancestors = new Set<string>();
    for (const file of paths) {
      let parent = path.dirname(file);
      while (!ancestors.has(parent)) { ancestors.add(parent); const next = path.dirname(parent); if (next === parent) break; parent = next; }
    }
    value = { files, paths, ancestors }; indexes.set(inputs, value);
  }
  return value;
}
export const actualInput = (state: InputState, file: string) => !!state.inputs && index(state.inputs).files.has(fileKey(file));
export function searchDirectories(state: InputState): string[] {
  return [...new Set([state.root, ...(state.inputProject?.includeDirs ?? []),
    ...(state.watchPaths?.includes ?? []), ...(state.watchPaths?.sources.map(scope => scope.directory) ?? []),
    ...(state.inputProject?.sources ?? []).map(file => path.dirname(file)),
    ...(state.inputProject?.tests.flatMap(test => test.sources) ?? []).map(file => path.dirname(file)),
    ...(state.inputs?.files ?? []).map(file => path.dirname(file))])];
}
export function inputEvent(state: InputState, file: string): boolean {
  // Active journal changes invalidate stored Project handles. Archived records
  // follow the explicit retirement policy unless they are actual RTL includes.
  const manifest = path.join(state.root, 'rtl.toml'), journal = path.join(state.root, '.rtl/import-transactions');
  if (fileKey(file) === fileKey(manifest) || contains(journal, file) || contains(file, journal)) return true;
  // This flag describes a verified absent manifest. Configuration/journal and
  // ancestor events above still retry; source edits cannot configure the root.
  if (state.manifestMissing) return false;
  if (fileKey(file) === fileKey(path.join(state.root, 'rtl-tests.json'))) return true;
  const inputs = state.inputs;
  if (inputs) { const observed = index(inputs), key = fileKey(file); if (observed.paths.has(key) || observed.ancestors.has(key)) return true; }
  if (!inputs || inputs.conservative) {
    if (searchDirectories(state).some(directory => contains(directory, file) || contains(file, directory))) return true;
    return /\.(?:sv|v|svh|vh)$/i.test(file); // Preserve shared/external source behavior when uncertain.
  }
  // Static source prefixes conservatively include new glob members (of any
  // extension) and directory changes. Shared/external prefixes can select peers.
  if (generated(file)) return false;
  if (state.watchPaths) return state.watchPaths.sources.some(scope => contains(scope.directory, file) || contains(file, scope.directory));
  return /\.(?:sv|v|svh|vh)$/i.test(file); // Unknown selection provenance retains legacy routing.
}
// Match Core's case-sensitive glob ignore spellings. Case variants can still
// be discovered by globs and must not hide new membership notifications.
const generated = (file: string) => path.resolve(file).split(path.sep).some(part => ['.rtl', '.git', 'node_modules'].includes(part));
export function inputPatterns(states: Iterable<InputState>, workspaceRoots?: string[]): { directory: string; pattern: string }[] {
  const selected = [...states], roots = workspaceRoots ?? selected.map(state => state.root);
  const staticRtl = (file: string) => (process.platform === 'win32' ? /\.(sv|v|svh|vh)$/i : /\.(sv|v|svh|vh)$/).test(file) && !generated(file) && roots.some(root => contains(root, file));
  const patterns = new Map<string, { directory: string; pattern: string }>();
  const add = (directory: string, pattern: string) => patterns.set(`${fileKey(directory)}:${pattern}`, { directory, pattern });
  for (const state of selected) {
    if (state.manifestMissing) {
      // Keep a root-level creation watch and observe root replacement at its
      // parent. Use '*' so literal names containing glob syntax remain safe.
      add(state.root, '*'); add(path.dirname(state.root), '*');
      continue;
    }
    for (const file of [...(state.inputs?.files ?? []), ...(state.inputs?.candidates ?? [])]) if (!staticRtl(file)) add(path.dirname(file), '*');
    for (const scope of state.watchPaths?.sources ?? []) if (scope.auxiliary) add(scope.directory, '**/*');
    if (!state.inputs || state.inputs.conservative) for (const directory of searchDirectories(state)) add(directory, '**/*');
  }
  const compact: { directory: string; pattern: string }[] = [];
  const ordered = [...patterns.values()].sort((a, b) => a.directory.length - b.directory.length || a.directory.localeCompare(b.directory) || (a.pattern === b.pattern ? 0 : a.pattern === '**/*' ? -1 : 1));
  for (const candidate of ordered) if (!compact.some(parent => parent.pattern === '**/*' && contains(parent.directory, candidate.directory))) compact.push(candidate);
  return compact.sort((a, b) => `${a.directory}:${a.pattern}`.localeCompare(`${b.directory}:${b.pattern}`));
}
