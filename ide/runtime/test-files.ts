interface FileTest { name: string; top: string; source?: string }
/** Exact registered source identity; no folder/basename/lexical TB guessing. */
export function testsForFile<T extends FileTest>(state: { root?: string; project?: string; review?: unknown; tests: T[] }, file: string, ignoreCase: boolean): T[] {
  if (!state.root || !state.project || state.review || !file) return [];
  const normalize = (value: string) => { const text = value.replaceAll('\\', '/'); return ignoreCase ? text.toLowerCase() : text; };
  const root = normalize(state.root).replace(/\/+$/, '') + '/', target = normalize(file);
  if (!target.startsWith(root) || target.slice(root.length).split('/').some(part => part === '..' || part === '.')) return [];
  return state.tests.filter(test => !!test.source && normalize(test.source) === target);
}
