import { scanCode } from './lexical';

export const editIdleMs = 400;
export const statementIdleMs = 120;

/** Scheduling hint only, never proof of a valid SystemVerilog statement.
 * Bounded to avoid turning each edit into a second large-file parser. */
export function editDelay(before: string | undefined, after: string): number {
  if (before === undefined || before.length > 1024 * 1024 || after.length > 1024 * 1024) return editIdleMs;
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  let end = after.length, oldEnd = before.length;
  while (end > start && oldEnd > start && after[end - 1] === before[oldEnd - 1]) { end--; oldEnd--; }
  if (end === start) return editIdleMs; // Deletion and Enter alone use ordinary idle.
  const code = scanCode(after).code;
  let depth = 0;
  for (let i = 0; i < end; i++) {
    if (code[i] === '(') depth++;
    else if (code[i] === ')') depth = Math.max(0, depth - 1);
    else if (code[i] === ';' && i >= start && depth === 0) return statementIdleMs;
  }
  for (const match of code.matchAll(/\b(?:end|endcase|endmodule|endfunction|endtask|endpackage|endgenerate|endinterface|endprogram|join|join_any|join_none)\b/g)) {
    const last = match.index! + match[0].length;
    if (match.index! < end && last > start && last <= end) return statementIdleMs;
  }
  return editIdleMs;
}

/** Latest completion identity; native host separately checks suggest visibility. */
export interface CompletionIdentity { uri: string; version: number; line: number; character: number }
export function sameCompletion(a: CompletionIdentity | undefined, b: CompletionIdentity | undefined): boolean {
  return !!a && !!b && a.uri === b.uri && a.version === b.version && a.line === b.line && a.character === b.character;
}
