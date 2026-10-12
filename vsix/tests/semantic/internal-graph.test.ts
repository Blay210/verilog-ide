import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, mkdtemp, copyFile, writeFile, readdir } from 'node:fs/promises';
import { loadProject } from '@rtl-dev/core';
import { SlangProvider } from '@rtl-dev/semantic';
const python = process.env.RTL_SEMANTIC_PYTHON;
async function fixture(source?: string) {
  await mkdir('.dev/e1', { recursive: true });
  const root = await mkdtemp(path.resolve('.dev/e1/graph 한글 '));
  if (source) await writeFile(path.join(root, 'design.sv'), source);
  else await copyFile('tests/fixtures/internal-operations/design.sv', path.join(root, 'design.sv'));
  await writeFile(path.join(root, 'rtl.toml'), 'version=1\n[project]\nname="graph"\n[sources]\nrtl=["design.sv"]\n');
  const provider = new SlangProvider(python!, path.resolve('packages/semantic/python/analyze.py'), path.join(root, '.rtl/cache'));
  return { root, provider, project: await loadProject(root) };
}
test('E1 native graph preserves state boundary, reset/enable priority, widths and conversions', { skip: !python }, async () => {
  const { root, provider, project } = await fixture();
  for (const id of ['probe_top.counter', 'probe_top.adder', 'probe_top.mac8', 'probe_top.mac4']) {
    const graph = await provider.internalOperations(project, undefined, id, []);
    assert.equal(graph.status, 'supported', graph.reason);
    assert.ok(graph.nodes.length && graph.nodes.every(n => n.signalType.width && n.source?.file === path.join(root, 'design.sv')));
    assert.ok(graph.nodes.filter(n => n.kind === 'signal').every(n => n.signalName === n.label && typeof n.signalPath === 'string'));
    const ids = new Set(graph.nodes.map(n => n.id));
    assert.ok(graph.edges.every(e => ids.has(e.source) && ids.has(e.target)));
    if (id.endsWith('counter')) {
      assert.equal(graph.nodes.filter(n => n.kind === 'register').length, 1);
      assert.equal(graph.nodes.filter(n => n.kind === 'control').length, 2);
      assert.ok(graph.edges.some(e => e.role === 'false / hold'));
      assert.ok(graph.edges.some(e => e.role === 'state output'));
      assert.ok(graph.edges.some(e => e.role === 'clock ↑'));
    }
    if (id.endsWith('adder')) {
      assert.ok(graph.nodes.some(n => n.label === '+' && n.signalType.width === 9));
      assert.ok(graph.nodes.some(n => n.kind === 'select' && n.signalType.width === 8));
    }
  }
  const rootGraph = await provider.internalOperations(project, undefined, 'probe_top', []);
  assert.equal(rootGraph.status, 'unsupported'); assert.match(rootGraph.reason, /leaf/); assert.equal(rootGraph.nodes.length, 0);
  assert.deepEqual(await readdir(path.join(root, '.rtl/cache')), []);
});
const cases = [
  ['async reset', 'module dut(input logic clk,rst,a, output logic q); always_ff @(posedge clk or posedge rst) if(rst) q<=0; else q<=a; endmodule', /posedge/],
  ['procedural combinational', 'module dut(input logic a, output logic q); always_comb q=a; endmodule', /always_comb/],
  ['multiple writers', 'module dut(input wire a,b, output wire q); assign q=a; assign q=b; endmodule', /writers/],
  ['combinational cycle', 'module dut(output wire a,b); assign a=b; assign b=a; endmodule', /cycle/],
  ['startup initializer', 'module dut(output logic q=0); endmodule', /startup/],
  ['delayed assign', 'module dut(input wire a, output wire q); assign #1 q=a; endmodule', /Delayed/],
  ['unsupported operator', 'module dut(input wire [7:0] a,b, output wire [7:0] q); assign q=a-b; endmodule', /expression/],
  ['partial assignment', 'module dut(input wire a, output wire [1:0] q); assign q[0]=a; endmodule', /whole/],
  ['mixed clock', 'module dut(input logic c,d,a, output logic q,r); always_ff @(posedge c)q<=a; always_ff @(posedge d)r<=a; endmodule', /clocks/],
  ['repeated NBA', 'module dut(input logic c,a,output logic q);always_ff @(posedge c)begin q<=0;q<=a;end endmodule', /Repeated/],
  ['unique control', 'module dut(input logic c,a,output logic q);always_ff @(posedge c)unique if(a)q<=a;else q<=0;endmodule', /unique/],
  ['resolved net', 'module dut(input wire a, output wand q);assign q=a;endmodule', /net types/],
  ['drive strength', 'module dut(input wire a,output wire q);assign (weak1,weak0) q=a;endmodule', /strength/],
  ['bidirectional port', 'module dut(inout wire q);endmodule', /inout/],
  ['input writer', 'module dut(input wire a);assign a=0;endmodule', /input ports/],
] as const;
for (const [name, source, reason] of cases) test('E1 native rejects without partial graph: ' + name, { skip: !python }, async () => {
  const { provider, project } = await fixture(source);
  const graph = await provider.internalOperations(project, undefined, 'dut', []);
  assert.equal(graph.status, 'unsupported'); assert.match(graph.reason, reason); assert.deepEqual(graph.nodes, []); assert.deepEqual(graph.edges, []);
});
test('E1 native includes unsaved RTL and respects pre-cancellation', { skip: !python }, async () => {
  const { provider, project, root } = await fixture('module dut(input wire [7:0] a,b,output wire [7:0] q);assign q=a+b;endmodule');
  const graph = await provider.internalOperations(project, undefined, 'dut', [{ file: path.join(root, 'design.sv'), text: 'module dut(input wire a,output wire q);assign q=a;endmodule' }]);
  assert.equal(graph.status, 'supported'); assert.equal(graph.nodes.some(n => n.kind === 'operator'), false);
  const abort = new AbortController(); abort.abort();
  await assert.rejects(provider.internalOperations(project, undefined, 'dut', [], abort.signal));
});
