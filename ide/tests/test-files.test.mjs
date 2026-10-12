import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { testsForFile } = require('../dist/runtime/test-files.js');
const state = () => ({ root: 'D:\\설계 폴더', project: 'design', tests: [
  { name: 'tb.first', top: 'first', source: 'D:\\설계 폴더\\verification\\tb.sv' },
  { name: 'tb.second', top: 'second', source: 'D:\\설계 폴더\\verification\\tb.sv' },
  { name: 'single', top: 'tb_single', source: 'D:\\설계 폴더\\rtl\\arbitrary.sv' },
  { name: 'unknown', top: 'unknown' }
] });
test('file targets use registered exact paths, support many tops and do not assume tb folder or filename', () => {
  assert.deepEqual(testsForFile(state(), 'd:/設計/none.sv', true), []);
  assert.deepEqual(testsForFile(state(), 'd:/설계 폴더/verification/TB.SV', true).map(test => test.name), ['tb.first', 'tb.second']);
  assert.deepEqual(testsForFile(state(), 'D:/설계 폴더/rtl/arbitrary.sv', true).map(test => test.name), ['single']);
  assert.deepEqual(testsForFile(state(), 'D:/설계 폴더/tb/guessed_tb.sv', true), []);
});
test('outside roots, prefix siblings, traversal, missing project and management review never expose actions', () => {
  for (const file of ['D:/설계 폴더2/verification/tb.sv', 'D:/설계 폴더/../설계 폴더/verification/tb.sv', 'D:/설계 폴더/./verification/tb.sv', '']) assert.deepEqual(testsForFile(state(), file, true), []);
  for (const change of [{ root: undefined }, { project: undefined }, { review: {} }]) assert.deepEqual(testsForFile({ ...state(), ...change }, state().tests[0].source, true), []);
});
test('case-sensitive paths preserve distinct files on other platforms and follow updated registrations', () => {
  const current = state(), file = current.tests[0].source;
  assert.equal(testsForFile(current, file.toLowerCase(), false).length, 0);
  assert.equal(testsForFile(current, file, false).length, 2);
  current.tests = current.tests.slice(1);
  assert.deepEqual(testsForFile(current, file, false).map(test => test.name), ['tb.second']);
});
