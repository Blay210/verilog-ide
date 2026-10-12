import type { HierarchyNode, PortBinding } from './model';

export interface ScopeTerminal {
  id: string; instanceId: string; boundary: boolean; port: PortBinding;
  role: 'driver' | 'sink' | 'bidirectional' | 'unknown';
}
export interface ScopeNet { id: string; terminals: ScopeTerminal[]; ambiguous: boolean }
export interface ScopeConnections {
  scopeId: string; blocks: HierarchyNode[]; boundary: ScopeTerminal[];
  nets: ScopeNet[]; unresolved: ScopeTerminal[]; limited: boolean;
}
/** Whole-declaration connectivity only. No binding spelling, dotted-name parsing or inferred expression wiring. */
export function buildScopeConnections(scope: HierarchyNode): ScopeConnections {
  const blocks: HierarchyNode[] = []; let limited = false;
  const visit = (nodes: HierarchyNode[]) => {
    for (const node of nodes) {
      if (blocks.length >= 64) { limited = true; return; }
      if (node.kind === 'instance') blocks.push(node); else visit(node.children);
    }
  };
  visit(scope.children);
  const netMap = new Map<string, ScopeNet>(), unresolved: ScopeTerminal[] = [], boundary: ScopeTerminal[] = [];
  let count = 0;
  const add = (node: HierarchyNode, isBoundary: boolean) => {
    for (const port of node.ports) {
      if (count >= 512) { limited = true; return; } count++;
      const role = port.direction === 'inout' ? 'bidirectional' : port.direction === 'input' ? isBoundary ? 'driver' : 'sink' : port.direction === 'output' ? isBoundary ? 'sink' : 'driver' : 'unknown';
      const terminal: ScopeTerminal = {id: JSON.stringify([node.id,port.name,isBoundary]),instanceId:node.id,boundary:isBoundary,port,role};
      if (isBoundary) boundary.push(terminal);
      const identity = isBoundary ? port.internalSignal : port.connection.directSignal;
      if (!identity || !port.signalType?.simpleIntegral || role === 'unknown') { unresolved.push(terminal); continue; }
      let net = netMap.get(identity);
      if (!net) { net = {id:identity,terminals:[],ambiguous:false}; netMap.set(identity,net); }
      net.terminals.push(terminal);
    }
  };
  add(scope,true); blocks.forEach(block=>add(block,false));
  for (const net of netMap.values()) net.ambiguous = net.terminals.filter(t=>t.role==='driver').length !== 1 || net.terminals.some(t=>t.role==='bidirectional');
  return {scopeId:scope.id,blocks,boundary,nets:[...netMap.values()],unresolved,limited};
}
