import path from 'node:path';
import { scanCode } from './lexical';
import type { Analysis } from './model';

/** Color only compiler-confirmed module declarations and instance type names. */
export function moduleHighlights(analysis: Analysis, file: string, text: string): { start: number; length: number; declaration: boolean }[] {
  const key = (f: string) => process.platform === 'win32' ? path.resolve(f).toLowerCase() : path.resolve(f);
  const code = scanCode(text).code;
  const names = new Set(analysis.modules.map(m => m.name));
  const instances = analysis.instances.filter(i => key(i.start.file) === key(file));
  const declarations = new Set(analysis.modules.filter(m => key(m.location.file) === key(file)).map(m => m.location.offset));
  const result: { start: number; length: number; declaration: boolean }[] = [];
  for (const match of code.matchAll(/[A-Za-z_][\w$]*/g)) {
    const name = match[0], start = match.index;
    if (!names.has(name) || /[\w$\\.:]/.test(code[start - 1] ?? '')) continue;
    const declaration = declarations.has(start);
    let at = start + name.length;
    while (/\s/.test(code[at] ?? '') && at < code.length) at++;
    if (code[at] === '#') {
      at++;
      while (/\s/.test(code[at] ?? '') && at < code.length) at++;
      if (code[at] !== '(') continue;
      let depth = 0;
      do { if (code[at] === '(') depth++; if (code[at] === ')') depth--; at++; } while (at < code.length && depth > 0);
      if (depth) continue;
      while (/\s/.test(code[at] ?? '') && at < code.length) at++;
    }
    if (declaration || instances.some(i => i.module === name && i.start.offset === at)) result.push({start, length: name.length, declaration});
  }
  return result;
}
