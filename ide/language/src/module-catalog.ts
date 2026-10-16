import type { Analysis, SemanticSymbol } from '../../runtime/semantic/index';
import { symbolCompletionContext } from '../../runtime/semantic/index';
import { scanCode } from './lexical';
import { fileKey } from './input-events';

/** Fast lexical placement check, not a semantic scope or elaboration model. */
export function moduleItemContext(text: string, offset: number): boolean {
  if (text.length > 1024 * 1024) return false;
  const context = symbolCompletionContext(text, offset);
  if (!context || context.qualifier) return false;
  const head = scanCode(text.slice(0, context.start)).code;
  // Start of a line/item only; never an expression, named port or member access.
  if (!/(?:^|[;\n])\s*$/.test(head) && !/\b(?:begin|generate|end)\s*$/.test(head)) return false;
  const stack: { kind: string; header?: boolean; procedural?: boolean }[] = [];
  let depth = 0, procedural = false;
  const pop = (kind: string) => {
    let at = stack.length - 1;
    while (at >= 0 && stack[at].kind !== kind) at--;
    if (at >= 0) stack.splice(at);
    procedural = false;
  };
  for (const token of head.matchAll(/\b(?:module|endmodule|interface|endinterface|program|endprogram|package|endpackage|function|endfunction|task|endtask|class|endclass|begin|end|fork|join|join_any|join_none|generate|endgenerate|initial|final|always|always_comb|always_ff|always_latch|assign|defparam|wire|reg|logic|bit|int|integer|string|input|output|inout|parameter|localparam|typedef)\b|[(){};]/g)) {
    const word = token[0];
    if (word === '(' || word === '{') { depth++; continue; }
    if (word === ')' || word === '}') { depth = Math.max(0, depth - 1); continue; }
    if (word === ';') { if (depth === 0) { if (stack.at(-1)?.header) stack.at(-1)!.header = false; procedural = false; } continue; }
    if (/^(module|interface|program)$/.test(word)) { stack.push({ kind: word, header: true }); procedural = false; }
    else if (/^(package|function|task|class|generate)$/.test(word)) { stack.push({ kind: word }); procedural = false; }
    else if (word === 'begin' || word === 'fork') {
      stack.push({ kind: word, procedural: procedural || word === 'fork' || stack.some(scope => scope.procedural || /^(function|task|class|package)$/.test(scope.kind)) }); procedural = false;
    } else if (word === 'end') pop('begin');
    else if (word.startsWith('join')) pop('fork');
    else if (word.startsWith('end')) pop(word.slice(3));
    else procedural = true;
  }
  return depth === 0 && !procedural && stack.length > 0 && stack.some(scope => /^(module|interface|program)$/.test(scope.kind))
    && stack.every(scope => !scope.header && !scope.procedural && /^(module|interface|program|generate|begin)$/.test(scope.kind));
}

/** Confirmed project definition names only, independent of a previous query position. */
export class ModuleCatalog {
  private entries: { name: string; kind: string; file: string }[] = [];
  clear() { this.entries = []; }
  publish(analysis: Analysis) {
    const unique = new Map<string, { name: string; kind: string; file: string } | undefined>();
    for (const module of analysis.modules) {
      if (!/^[A-Za-z_][\w$]*$/.test(module.name) || module.name.length > 256 || !/^(module|interface|program)$/.test(module.kind)) continue;
      const entry = { name: module.name, kind: module.kind, file: fileKey(module.location.file) };
      if (!unique.has(entry.name)) unique.set(entry.name, entry);
      else { const previous = unique.get(entry.name); if (!previous || previous.file !== entry.file || previous.kind !== entry.kind) unique.set(entry.name, undefined); }
      if (unique.size > 4096) { this.clear(); return; }
    }
    const entries = [...unique.values()].filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);
    this.entries = JSON.stringify(entries).length * 2 <= 1024 * 1024 ? entries : [];
  }
  edit(file: string, text: string, previous?: string) {
    if (!this.entries.length || text === previous) return;
    if (text.length > 1024 * 1024) { this.clear(); return; }
    let start = 0, end = previous?.length ?? 0, nextEnd = text.length;
    if (previous !== undefined) {
      while (start < end && start < nextEnd && previous[start] === text[start]) start++;
      while (end > start && nextEnd > start && previous[end - 1] === text[nextEnd - 1]) { end--; nextEnd--; }
    }
    if (previous === undefined ? text.includes('`') : scanCode(previous.slice(0, start)).context === 'directive'
      || previous.slice(previous.lastIndexOf('\n', start - 1) + 1, end).includes('`') || text.slice(start, nextEnd).includes('`')) { this.clear(); return; }
    const code = scanCode(text).code;
    const names = new Set([...code.matchAll(/\b(module|interface|program)\s+(?:(?:automatic|static)\s+)?([A-Za-z_][\w$]*)/g)].map(match => `${match[1]}:${match[2]}`));
    const key = fileKey(file);
    this.entries = this.entries.filter(entry => entry.file !== key || names.has(`${entry.kind}:${entry.name}`));
  }
  candidates(text: string, offset: number): SemanticSymbol[] {
    if (!this.entries.length || !moduleItemContext(text, offset)) return [];
    return this.entries.map(entry => ({ name: entry.name, kind: 'module', detail: `${entry.kind} ${entry.name}`, instantiable: true,
      location: { file: '', offset: 0, line: 0, character: 0 } }));
  }
}
