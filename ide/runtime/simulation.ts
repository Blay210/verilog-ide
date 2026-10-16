import { loadProject, runTests, selectTests, type InputOverride, type OperationContext, type SimulatorBackend, type TestResult, type TestTarget, type Project, type PackageDependencyProvider } from './core/index';
import { freezeInputOverrides } from './core/input-overrides';
import { detectTools } from './toolchain/detect';
import { VerilatorBackend } from './verilator/index';
import { ProcessFailure } from './core/process';

/** Node host boundary. No renderer, editor or VS Code API dependency. */
export class SimulationError extends Error {
  constructor(readonly kind: 'project' | 'tool' | 'busy' | 'cancelled' | 'cleanup', message: string, cause?: unknown) { super(message, { cause }); }
}
export type BackendResolver = (context: OperationContext) => Promise<SimulatorBackend>;
export type PackageResolver = (project: Project, context: OperationContext, toolsDirectory?: string) => Promise<PackageDependencyProvider>;
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
  tags?: string[];
  jobs?: number;
  toolsDirectory?: string;
  inputOverrides?: readonly InputOverride[];
}
export interface SimulationEvents extends OperationContext {
  onStart?: (target: TestTarget) => void;
  onResult?: (result: TestResult) => void;
}

export class SimulationService {
  private active?: AbortController;
  private failedCleanup?: string;
  constructor(private readonly resolveBackend?: BackendResolver, private readonly resolvePackages?: PackageResolver) {}
  get running(): boolean { return !!this.active; }
  get cleanupFailure(): string | undefined { return this.failedCleanup; }
  cancel(): void { this.active?.abort(); }
  async inspect(root: string, signal?: AbortSignal) {
    try { return await loadProject(root, undefined, signal); }
    catch (error) { throw new SimulationError('project', String(error), error); }
  }
  async run(request: SimulationRequest, events: SimulationEvents = {}): Promise<TestResult[]> {
    if (this.active) throw new SimulationError('busy', 'A simulation is already running. Cancel it or wait for completion.');
    if (this.failedCleanup) throw new SimulationError('cleanup', `${this.failedCleanup} Restart the session after the owned processes have stopped.`);
    if (request.jobs !== undefined && (!Number.isInteger(request.jobs) || request.jobs < 1 || request.jobs > 4)) throw new SimulationError('project', '동시 실행 수는 1~4입니다.');
    const inputOverrides = freezeInputOverrides(request.inputOverrides);
    const controller = new AbortController();
    this.active = controller;
    const signal = events.signal ? AbortSignal.any([controller.signal, events.signal]) : controller.signal;
    try {
      signal.throwIfAborted();
      const project = await this.inspect(request.root, signal);
      signal.throwIfAborted();
      let targets: TestTarget[];
      try {
        if (project.backend !== 'verilator') throw Error(`Unsupported simulator: ${project.backend}`);
        if (request.names) {
          if (!request.names.length) throw Error('Select at least one test.');
          targets = [...new Set(request.names)].map(name => selectTests(project, { name })[0]);
        } else targets = selectTests(project, request.tags?.length ? { tags: request.tags } : {});
        if (request.tags?.length && request.names) {
          const tagged = new Set(selectTests(project, { tags: request.tags }).map(target => target.name));
          targets = targets.filter(target => tagged.has(target.name));
          if (!targets.length) throw Error('선택한 태그와 일치하는 테스트가 없습니다.');
        }
      } catch (error) { throw new SimulationError('project', String(error)); }
      let backend: SimulatorBackend;
      try { backend = await (this.resolveBackend ? this.resolveBackend({ signal, onLog: events.onLog }) : existingBackend({ signal, onLog: events.onLog }, request.toolsDirectory)); }
      catch (error) {
        if (error instanceof ProcessFailure && error.cleanupFailed) throw error;
        if (signal.aborted) throw new SimulationError('cancelled', 'Simulation cancelled before build.');
        throw new SimulationError('tool', String(error));
      }
      const packageProvider = project.packageOrder === 'auto' && project.packageSources?.length
        ? await this.resolvePackages?.(project, { signal, onLog: events.onLog }, request.toolsDirectory) : undefined;
      if (project.packageOrder === 'auto' && project.packageSources?.length && !packageProvider) throw new SimulationError('tool', '자동 package 순서 분석기를 연결하지 못했습니다. 언어 도구 설정을 확인해 주세요.');
      const results = await runTests(project, targets, backend, { ...events, signal, jobs: request.jobs, packageProvider, inputOverrides });
      this.failedCleanup = results.find(result => result.cleanupFailure)?.cleanupFailure;
      return results;
    } catch (error) {
      if (error instanceof ProcessFailure && error.cleanupFailed) { this.failedCleanup = error.message; throw new SimulationError('cleanup', error.message); }
      if (signal.aborted) throw new SimulationError('cancelled', 'Simulation cancelled before a result was recorded.');
      throw error;
    } finally { this.active = undefined; }
  }
}
