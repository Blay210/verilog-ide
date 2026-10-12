import type { SignalType, SourcePoint, SemanticDiagnostic } from './model';
export interface InternalNode {
  id: string;
  kind: 'signal' | 'constant' | 'operator' | 'conversion' | 'select' | 'register' | 'control' | 'module-port';
  label: string; signalType: SignalType; source?: SourcePoint; signalPath?: string;
  /** Compiler declaration name; signalPath is display-only and must never be split. */
  signalName?: string;
  /** Exact compiler declaration identity for scope connectivity; never a trace authorization. */
  declarationId?: string;
}
export interface InternalGraph {
  version: 1; kind: 'rtl-semantic'; instanceId: string;
  status: 'supported' | 'unsupported'; reason: string; nodes: InternalNode[];
  edges: { source: string; target: string; role: string }[];
  diagnostics: SemanticDiagnostic[];
  /** Present for explicitly requested scope operations. Child internals are opaque. */
  modules?: { instanceId: string; name: string; module: string; source?: SourcePoint;
    ports: { nodeId: string; name: string; direction: 'input' | 'output'; connected: boolean }[] }[];
}
