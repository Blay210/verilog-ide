import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, mkdtemp, readFile, writeFile, copyFile } from 'node:fs/promises';
import { checkedProcess, loadProject, runTest, loadRecordedTrace } from '@rtl-dev/core';
import { detectTools } from '@rtl-dev/toolchain';
import { VerilatorBackend } from '@rtl-dev/verilator';
import { parseVcd, valueAt } from '@rtl-dev/waveform';

const fixture = path.resolve('tests/fixtures/internal-operations');
const python = process.env.RTL_SEMANTIC_PYTHON;
async function temp() {
  await mkdir('.dev/e0', { recursive: true });
  return mkdtemp(path.resolve('.dev/e0/probe-한글 '));
}
async function probe(file: string, top: string, root: string) {
  const output = path.join(root, 'probe.json');
  await checkedProcess({ executable: python!, args: ['-I', '-B', path.resolve('scripts/probe-internal-operations.py'), file, top, output], cwd: path.resolve('.') }, { signal: AbortSignal.timeout(15000) });
  return JSON.parse(await readFile(output, 'utf8'));
}
const walk = (value: any): any[] => value && typeof value === 'object' ? [value, ...Object.values(value).flatMap(walk)] : [];

test('E0 real AST: arithmetic widths, conversions, register control, source locations and exclusions', { skip: !python }, async () => {
  const root = await temp(), file = path.join(fixture, 'design.sv');
  const before = await readFile(file);
  const result = await probe(file, 'probe_top', root);
  assert.ok(!result.diagnostics.some((d: any) => ['Error', 'Fatal'].includes(d.severity)));
  for (const [instance, width] of [['mac8', 16], ['mac4', 8]] as const) {
    const product = result.signals.find((s: any) => s.path === `probe_top.${instance}.product`);
    assert.equal(product.width, width); assert.equal(product.signed, true);
    assert.equal(product.initializerMeaning, 'continuous');
    assert.equal(product.initializer.operator, 'Multiply'); assert.equal(product.initializer.width, width);
    assert.equal(product.initializer.left.kind, 'Conversion');
    assert.equal(product.initializer.left.operand.width, width / 2);
    assert.equal(product.source.line, 15);
    const process = result.processes.find((p: any) => p.scope === `probe_top.${instance}`);
    assert.equal(process.candidate, true); assert.equal(process.body.edge, 'PosEdge');
    assert.equal(process.body.clock.symbol, `probe_top.${instance}.clk`);
    const nodes = walk(process.body);
    assert.ok(nodes.some(n => n.nonblocking === true && n.left.symbol === `probe_top.${instance}.acc`));
    assert.ok(nodes.some(n => n.operator === 'Add' && n.width === width && n.signed === true));
    assert.ok(nodes.some(n => n.symbol === `probe_top.${instance}.rst`));
    assert.ok(nodes.some(n => n.symbol === `probe_top.${instance}.en`));
  }
  const sum = result.signals.find((s: any) => s.path === 'probe_top.adder.sum');
  assert.equal(sum.initializer.operator, 'Add'); assert.equal(sum.initializer.width, 9);
  const select = result.assignments.find((a: any) => a.scope === 'probe_top.adder');
  assert.equal(select.right.kind, 'ConditionalOp'); assert.equal(select.right.left.width, 8);
  assert.deepEqual(await readFile(file), before, 'Probe must not change RTL');
  const unsupported = await probe(path.join(fixture, 'unsupported.sv'), 'probe_unsupported', root);
  assert.equal(unsupported.processes.length, 2);
  assert.ok(unsupported.processes.every((p: any) => !p.candidate && p.reason));
});

test('E0 actual Verilator: named MAC intermediates are present at both parameter widths', { skip: !python || process.env.RTL_INTEGRATION !== '1', timeout: 180000 }, async () => {
  const root = await temp();
  for (const file of ['design.sv', 'tb.sv']) await copyFile(path.join(fixture, file), path.join(root, file));
  await writeFile(path.join(root, 'rtl.toml'), 'version=1\n[project]\nname="e0"\n[sources]\nrtl=["design.sv"]\n[[test]]\nname="mac"\ntop="probe_tb"\nsources=["tb.sv"]\n');
  const project = await loadProject(root), tools = await detectTools(); assert.ok(tools.toolchain);
  project.tests[0].timeoutMs = 120000;
  const result = await runTest(project, project.tests[0], new VerilatorBackend(tools.toolchain));
  assert.equal(result.status, 'passed', result.message);
  const trace = await loadRecordedTrace(result), data = parseVcd(trace.bytes.toString());
  const scale = { ns: 1n, ps: 1000n, fs: 1000000n }[data.timescale.unit as 'ns' | 'ps' | 'fs']; assert.ok(scale);
  for (const [instance, width] of [['mac8', 16], ['mac4', 8]] as const) {
    for (const [name, time, expected] of [['product', 26n, 21n], ['stage', 36n, 21n], ['stage', 56n, -6n], ['acc', 56n, 36n]] as const) {
      const expectedPath = `probe_tb.dut.${instance}.${name}`;
      const segments = ['probe_tb', 'dut', instance];
      const signals = data.signals.filter(s => s.reference === name &&
        [segments, ['TOP', ...segments]].some(scope => JSON.stringify(s.scopeSegments) === JSON.stringify(scope)));
      assert.equal(signals.length, 1, expectedPath); const signal = signals[0]; assert.equal(signal.width, width);
      assert.equal(valueAt(data.channels.get(signal.code)!, time * scale / BigInt(data.timescale.magnitude)), BigInt.asUintN(width, expected).toString(2).padStart(width, '0'));
    }
  }
  await writeFile(path.join(root, '.rtl/e0-receipt.json'), JSON.stringify({ passed: true, runId: result.runId, traceSha256: trace.sha256, stage: 'E0 feasibility only' }, null, 2));
});
