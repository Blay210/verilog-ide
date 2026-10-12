import test from 'node:test';
import assert from 'node:assert/strict';
import type { InternalGraph, HierarchyNode } from '@rtl-dev/semantic';
import { renderStructure } from '../packages/vscode/src/structure-view';
import { StructureNavigation } from '../packages/vscode/src/structure-navigation';
const source = { file: 'design.sv', line: 1, character: 2, offset: 3 };
const node: HierarchyNode = { id: 'top.dut', name: 'dut', kind: 'instance', location: source, parameters: [], ports: [], children: [] };
const navigation = new StructureNavigation(); navigation.update([node], 'current');
const graph: InternalGraph = { version: 1, kind: 'rtl-semantic', instanceId: node.id, status: 'supported', reason: '', diagnostics: [],
  nodes: [{ id: 'n0', kind: 'signal', label: '<script>alert(1)</script>', source, signalType: { text: 'logic[7:0]', simpleIntegral: true, width: 8, signed: false } },
    { id: 'n1', kind: 'register', label: 'count next state', source, signalType: { text: 'logic[7:0]', simpleIntegral: true, width: 8, signed: false } }],
  edges: [{ source: 'n0', target: 'n1', role: 'next state' }, { source: 'n1', target: 'n0', role: 'state output' }] };
test('internal graph shares diagram camera, escapes content, resolves source IDs and labels state feedback', () => {
  const rendered = renderStructure(node, 'nonce', false, { navigation: navigation.state(), context: { project: 'p' }, operations: graph });
  assert.match(rendered.html, /Internal operations · static RTL semantic structure/);
  assert.match(rendered.html, /not a synthesis netlist/);
  assert.match(rendered.html, /stroke-dasharray/);
  assert.doesNotMatch(rendered.html, /<script>alert/);
  assert.match(rendered.html, /id="structure-canvas"/);
  assert.match(rendered.html, /data-action="connections"/);
  assert.ok([...rendered.links.values()].some(p => p === source));
  assert.equal(rendered.ports.size, 0);
});
test('unsupported graph explains its reason, stale disables actions and ordinary connections remain available', () => {
  const unsupported = { ...graph, status: 'unsupported' as const, reason: '<async reset>', nodes: [], edges: [] };
  const rendered = renderStructure(node, 'nonce', true, { navigation: navigation.state(), context: { project: 'p' }, operations: unsupported });
  assert.match(rendered.html, /&lt;async reset&gt;/);
  assert.match(rendered.html, /data-action="connections" disabled/);
  const ordinary = renderStructure(node, 'nonce');
  assert.match(ordinary.html, /data-action="operations"/);
  assert.match(ordinary.html, /<h2>Port connections/);
});
test('recorded operations expose only compiler named signals with shared time controls', () => {
  const named = { ...graph, nodes: graph.nodes.map(n => n.kind === 'signal' ? { ...n, signalName: 'count' } : n) };
  const rendered = renderStructure(node, 'nonce', false, { navigation: navigation.state(), context: { project: 'p', mode: 'recorded' }, operations: named,
    trace: { state: 'ready', time: '26ns', end: '56ns' } });
  assert.deepEqual([...rendered.ports.values()], [{ instanceId: node.id, port: 'count' }]);
  assert.equal((rendered.html.match(/data-port-value="/g) ?? []).length, 1);
  assert.match(rendered.html, /id="trace-time"/);assert.match(rendered.html, /Shared with waveform cursor/);
  assert.match(rendered.html, /next-state nodes are not evaluated/);
  assert.match(rendered.html, /m.snapshot!==/);assert.match(rendered.html, /m.revision<revision/);
});
