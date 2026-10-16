import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
buildSync({ entryPoints: ['language/src/edit-scheduling.ts'], outfile: '.dev/edit-scheduling.cjs', bundle: true, platform: 'node', format: 'cjs' });
const { editDelay, editIdleMs, statementIdleMs, sameCompletion } = require('../.dev/edit-scheduling.cjs');

test('completed statements and block closers shorten idle; incomplete edits and deletion still schedule', () => {
  for (const [before, after] of [['logic a', 'logic a;'], ['begin\n a=1;', 'begin\n a=1;\nend'], ['module m;\nendmodul', 'module m;\nendmodule'], ['a=1', 'a=1;\nb=2;']]) assert.equal(editDelay(before, after), statementIdleMs, after);
  for (const [before, after] of [['logic a;', 'logic a'], ['logic a;', 'logic a;\n'], ['m #(', 'm #(1'], ['logic a', 'logic ab']]) assert.equal(editDelay(before, after), editIdleMs, after);
});
test('strings, comments, directives, macros and for-header semicolons do not complete a statement', () => {
  for (const [before, after] of [['// note', '// note;'], ['/* note', '/* note; endmodule */'], ['$display("hello', '$display("hello;"'], ['for(i=0', 'for(i=0;'], ['for(i=0;', 'for(i=0;i<5;'], ['`define A x', '`define A x;'], ['`MACRO(', '`MACRO(a;)'], ['\\escaped', '\\escaped; ']]) assert.equal(editDelay(before, after), editIdleMs, after);
  assert.equal(editDelay('for(i=0;i<5;i++) a=1', 'for(i=0;i<5;i++) a=1;'), statementIdleMs);
  assert.equal(editDelay(undefined, 'module m;'), editIdleMs);
  assert.equal(editDelay('', 'x'.repeat(1024 * 1024 + 1) + ';'), editIdleMs);
});
test('refresh identity excludes changed version, file or caret and absent requests', () => {
  const a = { uri: 'file:///design.sv', version: 2, line: 4, character: 8 };
  assert.equal(sameCompletion(a, { ...a }), true);
  for (const changed of [{ uri: 'file:///other.sv' }, { version: 3 }, { line: 5 }, { character: 9 }]) assert.equal(sameCompletion(a, { ...a, ...changed }), false);
  assert.equal(sameCompletion(undefined, a), false);
});
