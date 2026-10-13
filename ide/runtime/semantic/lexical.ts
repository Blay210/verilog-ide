export type LexicalContext = 'code' | 'comment' | 'string' | 'directive' | 'escapedIdentifier';

// Compiler directives consume a line. Macro names consume a token (and an
// optional balanced argument list); their expansion is always the compiler's job.
const directives = new Set(('begin_keywords end_keywords celldefine endcelldefine default_nettype define undef undefineall ' +
  'ifdef ifndef elsif else endif include line timescale resetall unconnected_drive nounconnected_drive pragma ' +
  'default_decay_time default_trireg_strength delay_mode_distributed delay_mode_path delay_mode_unit delay_mode_zero protect endprotect protected endprotected').split(' '));
function macroEnd(text: string, start: number): { end: number; closed: boolean } {
  let open = start;
  while (open < text.length && /[\t \r]/.test(text[open])) open++;
  if (text[open] !== '(') return { end: start, closed: start < text.length };
  let depth = 0, mode: 'code' | 'string' | 'line' | 'block' | 'escape' = 'code';
  for (let i = open; i < text.length; i++) {
    const char = text[i], next = text[i + 1];
    if (mode === 'string') { if (char === '\\') i++; else if (char === '"') mode = 'code'; }
    else if (mode === 'line') { if (char === '\n') mode = 'code'; }
    else if (mode === 'block') { if (char === '*' && next === '/') { i++; mode = 'code'; } }
    else if (mode === 'escape') { if (/\s/.test(char)) mode = 'code'; }
    else if (char === '"') mode = 'string';
    else if (char === '/' && next === '/') { i++; mode = 'line'; }
    else if (char === '/' && next === '*') { i++; mode = 'block'; }
    else if (char === '\\') mode = 'escape';
    else if (char === '(') depth++;
    else if (char === ')' && --depth === 0) return { end: i + 1, closed: true };
  }
  return { end: text.length, closed: false };
}

/** Mask non-code while preserving UTF-16 offsets and line endings. No preprocessing. */
export function scanCode(text: string): { code: string; context: LexicalContext; lineComment: boolean; hasDirective: boolean } {
  let context: LexicalContext = 'code';
  let blockComment = false;
  let hasDirective = false;
  const masked = text.split('');
  const hide = (i: number) => { if (text[i] !== '\n' && text[i] !== '\r') masked[i] = ' '; };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (context === 'comment') {
      hide(i);
      if (blockComment && ch === '*' && next === '/') { hide(++i); context = 'code'; }
      else if (!blockComment && ch === '\n') context = 'code';
    } else if (context === 'string') {
      hide(i);
      if (ch === '\\' && next !== undefined) hide(++i);
      else if (ch === '"') context = 'code';
    } else if (context === 'directive') {
      hide(i);
      if (ch === '\n' && text[i - 1] !== '\\' && !(text[i - 1] === '\r' && text[i - 2] === '\\')) context = 'code';
    } else if (context === 'escapedIdentifier') {
      hide(i); if (/\s/.test(ch)) context = 'code';
    } else if (ch === '/' && (next === '/' || next === '*')) {
      blockComment = next === '*'; context = 'comment'; hide(i); hide(++i);
    } else if (ch === '"') { context = 'string'; hide(i); }
    else if (ch === '\\') { context = 'escapedIdentifier'; hide(i); }
    else if (ch === '`') {
      hasDirective = true; hide(i);
      let end = i + 1;
      if (/[A-Za-z_]/.test(text[end] ?? '')) { end++; while (end < text.length && /[\w$]/.test(text[end])) end++; }
      const name = text.slice(i + 1, end);
      if (!name || directives.has(name)) { context = 'directive'; continue; }
      const macro = macroEnd(text, end);
      while (++i < macro.end) hide(i);
      i--;
      if (!macro.closed) context = 'directive';
    }
  }
  return { code: masked.join(''), context, lineComment: context === 'comment' && !blockComment, hasDirective };
}
