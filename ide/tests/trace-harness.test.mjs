import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { managedTraceHarness } = createRequire(import.meta.url)('../dist/runtime/verilator/trace-harness.js');
test('managed trace filenames cannot escape run directory or inject C++', () => {
  for (const name of ['../wave.vcd', 'C:/wave.vcd', 'wave".vcd', 'wave\n.vcd', 'wave.fst']) assert.throws(() => managedTraceHarness('vcd', name));
  assert.throws(() => managedTraceHarness('other', 'wave.vcd'));
  assert.ok(managedTraceHarness('vcd', 'tb.first.vcd'));
  assert.ok(managedTraceHarness('fst', 'second.fst'));
  assert.ok(managedTraceHarness('none', ''));
});
