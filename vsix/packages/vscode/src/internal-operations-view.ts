import type { InternalGraph, SourcePoint } from '@rtl-dev/semantic';

const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
/** Static read-only layout; state-output feedback does not affect layering. */
export function renderInternalOperations(graph: InternalGraph, source: (point: SourcePoint) => string, observe?: (name: string) => string) {
  const rank = new Map(graph.nodes.map(n => [n.id, 0]));
  for (let pass = 0; pass < graph.nodes.length; pass++) {
    let changed = false;
    for (const edge of graph.edges) {
      if (edge.role === 'state output' || edge.role.includes('hold')) continue;
      const next = (rank.get(edge.source) ?? 0) + 1;
      if (next > (rank.get(edge.target) ?? 0)) { rank.set(edge.target, next); changed = true; }
    }
    if (!changed) break;
  }
  const slots = new Map<number, number>(), positions = new Map<string, { x: number; y: number }>();
  for (const node of graph.nodes) {
    const column = rank.get(node.id)!, row = slots.get(column) ?? 0; slots.set(column, row + 1);
    positions.set(node.id, { x: 30 + column * 215, y: 30 + row * 95 });
  }
  const width = Math.max(980, 60 + (Math.max(0, ...rank.values()) + 1) * 215);
  const height = Math.max(200, 60 + Math.max(0, ...slots.values()) * 95);
  const edges = graph.edges.map(edge => {
    const a = positions.get(edge.source), b = positions.get(edge.target); if (!a || !b) return '';
    const feedback = edge.role === 'state output';
    return `<g><title>${escape(edge.role)}</title><path class="wire" ${feedback ? 'stroke-dasharray="5 4"' : ''} marker-end="url(#arrow)" d="M${a.x + 175},${a.y + 32} C${a.x + 195},${a.y + 32} ${b.x - 20},${b.y + 32} ${b.x},${b.y + 32}"/></g>`;
  }).join('');
  const nodes = graph.nodes.map(node => {
    const p = positions.get(node.id)!;
    const sourceId = node.source ? source(node.source) : undefined;
    const valueId = node.kind === 'signal' && node.signalName !== undefined ? observe?.(node.signalName) : undefined;
    return `<g ${sourceId !== undefined ? `data-source="${escape(sourceId)}"` : ''}><title>${escape(node.label + '\n' + node.signalType.text + '\n' + node.kind)}</title><rect class="block" x="${p.x}" y="${p.y}" width="175" height="65" rx="8"/><text x="${p.x + 10}" y="${p.y + 20}">${escape(node.label.slice(0, 22))}</text><text x="${p.x + 10}" y="${p.y + 40}">${escape(`${node.signalType.width} bit · ${node.signalType.signed ? 'signed' : 'unsigned'}`)}</text><text x="${p.x + 10}" y="${p.y + 56}" ${valueId !== undefined ? `data-port-value="${escape(valueId)}"` : ''}>${valueId !== undefined ? '…' : escape(node.kind)}</text></g>`;
  }).join('');
  return { svg: edges + nodes, width, height };
}
