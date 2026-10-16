import { scanCode } from './lexical';

/** Bounded lexical fallback for edited declarations; never a compiler model. */
export function localSignals(text: string, offset: number): string[] {
  if (text.length > 1024 * 1024 || scanCode(text.slice(0, offset)).context !== 'code') return [];
  const code = scanCode(text).code;
  const scopes: { kind: string; start: number; end: number; parent?: number }[] = [{ kind: 'file', start: 0, end: code.length }];
  const stack = [0], at: { start: number; scope: number }[] = [];
  const open: Record<string, string> = { module: 'endmodule', function: 'endfunction', task: 'endtask', begin: 'end', fork: 'join', generate: 'endgenerate' };
  for (const match of code.matchAll(/\b(module|endmodule|function|endfunction|task|endtask|begin|end|fork|join|join_any|join_none|generate|endgenerate|wire|reg|logic|input|output|inout)\b/g)) {
    const word = match[0], position = match.index!;
    if (open[word]) { scopes.push({ kind: open[word], start: position, end: code.length, parent: stack.at(-1) }); stack.push(scopes.length - 1); }
    else if (/^(end|join)/.test(word)) {
      const closer = word.startsWith('join') ? 'join' : word;
      let index = stack.length - 1; while (index > 0 && scopes[stack[index]].kind !== closer) index--;
      if (index > 0) { for (const id of stack.splice(index)) scopes[id].end = position; }
    } else at.push({ start: position + word.length, scope: stack.at(-1)! });
  }
  const visible = new Set<number>();
  for (let i = 1; i < scopes.length; i++) if (offset >= scopes[i].start && offset <= scopes[i].end) visible.add(i);
  const result = new Set<string>();
  for (const declaration of at) {
    if (!visible.has(declaration.scope)) continue;
    const fragment = code.slice(declaration.start, Math.min(code.length, declaration.start + 8192)).split(';')[0];
    let depth = 0, expectName = true;
    for (const token of fragment.matchAll(/[A-Za-z_][\w$]*|[\[\](){}=,;]/g)) {
      const word = token[0];
      if (['[', '(', '{'].includes(word)) { depth++; continue; }
      if ([']', ')', '}'].includes(word)) { if (depth === 0) break; depth--; continue; }
      if (depth) continue;
      if (word === ',') { expectName = true; continue; }
      if (word === '=') { expectName = false; continue; }
      if (/^(wire|reg|logic|input|output|inout|signed|unsigned|var|bit|integer|int|automatic|static)$/.test(word)) continue;
      if (expectName && /^[A-Za-z_]/.test(word)) { result.add(word); expectName = false; }
    }
  }
  return [...result].slice(0, 1000);
}
const literal = (name: string) => name.replace(/[\\$}]/g, '\\$&');
export const moduleSnippet = (name: string) => `${literal(name)} \${1} (\${2});\$0`;
export const portSnippet = (name: string, following: string) => /^\s*\(/.test(following) ? literal(name) : `${literal(name)}(\${1})\$0`;
