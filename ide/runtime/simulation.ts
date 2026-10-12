import { loadProject, runTests, selectTests, type InputOverride, type OperationContext, type SimulatorBackend, type TestResult, type TestTarget } from './core/index';
import { freezeInputOverrides } from './core/input-overrides';
import { detectTools } from './toolchain/detect';
import { VerilatorBackend } from './verilator/index';

/** Node host boundary. No renderer, editor or VS Code API dependency. */
export class SimulationError extends Error {
  constructor(readonly kind: 'project' | 'tool' | 'busy' | 'cancelled', message: string) { super(message); }
}
export type BackendResolver = (context: OperationContext) => Promise<SimulatorBackend>;
export async function existingBackend(context: OperationContext, toolsDirectory?: string): Promise<SimulatorBackend> {
  context.signal?.throwIfAborted();
  const detection = await detectTools(context, toolsDirectory);
  context.signal?.throwIfAborted();
  if (!detection.toolchain) throw new SimulationError('tool', 'Verilator and C++ build tools are unavailable. Installation needs explicit approval.');
  const backend = new VerilatorBackend(detection.toolchain);
  await backend.check(context);
  return backend;
}

export interface SimulationRequest {
  root: string;
  /** Omitted means all explicitly registered tests; empty is an error. */
  names?: string[];
  toolsDirectory?: string;
  inputOverrides?: readonly InputOverride[];
}
export interface SimulationEvents extends OperationContext {
  onStart?: (target: TestTarget) => void;
  onResult?: (result: TestResult) => void;
}

export class SimulationService {
  private active?: AbortController;
  constructor(private readonly resolveBackend?: BackendResolver) {}
  get running(): boolean { return !!this.active; }
  cancel(): void { this.active?.abort(); }
  async inspect(root: string) {
    try { return await loadProject(root); }
    catch (error) { throw new SimulationError('project', String(error)); }
  }
  async run(request: SimulationRequest, events: SimulationEvents = {}): Promise<TestResult[]> {
    if (this.active) throw new SimulationError('busy', 'A simulation is already running. Cancel it or wait for completion.');
    const inputOverrides = freezeInputOverrides(request.inputOverrides);
    const controller = new AbortController();
    this.active = controller;
    const signal = events.signal ? AbortSignal.any([controller.signal, events.signal]) : controller.signal;
    try {
      signal.throwIfAborted();
      const project = await this.inspect(request.root);
      let targets: TestTarget[];
      try {
        if (project.backend !== 'verilator') throw Error(`Unsupported simulator: ${project.backend}`);
        if (project.packageOrder === 'auto' && project.packageSources?.length) throw Error('Automatic package ordering needs the semantic provider, which is not ported yet. Use sources.package_order="manifest" for this development slice.');
        if (request.names) {
          if (!request.names.length) throw Error('Select at least one test.');
          targets = [...new Set(request.names)].map(name => selectTests(project, { name })[0]);
        } else targets = selectTests(project);
      } catch (error) { throw new SimulationError('project', String(error)); }
      let backend: SimulatorBackend;
      try { backend = await (this.resolveBackend ? this.resolveBackend({ signal, onLog: events.onLog }) : existingBackend({ signal, onLog: events.onLog }, request.toolsDirectory)); }
      catch (error) {
        if (signal.aborted) throw new SimulationError('cancelled', 'Simulation cancelled before build.');
        throw new SimulationError('tool', String(error));
      }
      return await runTests(project, targets, backend, { ...events, signal, jobs: 1, inputOverrides });
    } catch (error) {
      if (signal.aborted) throw new SimulationError('cancelled', 'Simulation cancelled before a result was recorded.');
      throw error;
    } finally { this.active = undefined; }
  }
}
