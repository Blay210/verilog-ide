import path from 'node:path';
import { realpath } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import type { OperationContext } from './core/index';
import { detectTools, managedRoot, exists } from './toolchain/detect';
import { WindowsMsys2Provider } from './toolchain/install';
import { verifyToolchain } from './toolchain/verify';
import { detectSemanticRuntime, installSemanticRuntime, semanticRoot } from './toolchain/semantic';

export type ToolKind = 'simulation' | 'language';
export interface ToolPlan { id: string; kind: ToolKind; home: string; location: string; components: string[]; requiresInstall: boolean }
export interface ToolSetupState { phase: 'idle' | 'checking' | 'awaitingApproval' | 'installing' | 'ready' | 'cancelled' | 'failed'; plan?: ToolPlan; log: string; error?: string }
export interface ToolAction { location: string; components: string[]; install?: (context: OperationContext) => Promise<void> }
export type ToolPlanner = (kind: ToolKind, home: string, context: OperationContext) => Promise<ToolAction>;

/** Compare real ancestors too: a link must not hide a project-contained install. */
async function resolvedLocation(location: string): Promise<string> {
  let parent = path.resolve(location), suffix = '';
  for (;;) {
    try { return path.resolve(await realpath(parent), suffix); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    const next = path.dirname(parent); if (next === parent) throw Error('Tool location cannot be resolved.');
    suffix = path.join(path.basename(parent), suffix); parent = next;
  }
}
export async function requireExternalTools(home: string, projects: string[]): Promise<void> {
  const resolvedHome = await resolvedLocation(home);
  for (const project of projects) {
    const relative = path.relative(await resolvedLocation(project), resolvedHome);
    if (!relative || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep))) throw Error('Shared tools must be stored outside user project folders.');
  }
}

export const planTools: ToolPlanner = async (kind, home, context) => {
  if (kind === 'language') {
    context.onLog?.('Checking existing slang compiler…\n');
    const python = await detectSemanticRuntime(context, home);
    return { location: semanticRoot(home), components: python ? [] : ['Python 3.14.7', 'slang 11.0.0'],
      install: python ? undefined : async context => { await installSemanticRuntime(context, home); } };
  }
  context.onLog?.('Checking Verilator, C++ build tools and GTKWave…\n');
  const detected = await detectTools(context, home);
  if (detected.toolchain) {
    context.onLog?.('Building and running a small RTL verification…\n');
    await verifyToolchain(detected.toolchain, context, home);
  }
  if (!detected.missing.length) return { location: detected.toolchain!.description, components: [] };
  const provider = new WindowsMsys2Provider(home);
  const plan = await provider.plan(context);
  return { location: plan.root, components: [...plan.packages], install: async context => { await provider.install(plan, context); } };
};

/** Explicit update of our managed environment only; never modifies a reused system installation. */
export const planToolUpdate: ToolPlanner = async (kind, home, context) => {
  if (kind !== 'simulation') throw Error('현재 관리 도구 업데이트는 시뮬레이션 환경만 지원합니다.');
  if (!await exists(path.join(managedRoot(home), 'usr', 'bin', 'bash.exe'))) throw Error('이 위치에 관리 도구가 없습니다. 도구 설정으로 먼저 설치해 주세요.');
  const provider = new WindowsMsys2Provider(home), plan = await provider.plan(context);
  return { location: plan.root, components: ['관리 MSYS2 패키지 업데이트', ...plan.packages], install: async context => { await provider.install(plan, context); } };
};

/** Editor-free approval boundary. Installer receives only the internally retained plan. */
export class ToolSetupService {
  state: ToolSetupState = { phase: 'idle', log: '' };
  private active?: AbortController;
  private idle = Promise.resolve();
  private action?: ToolAction;
  constructor(readonly home: string, private readonly projects: string[], private readonly planner: ToolPlanner = planTools,
    private readonly notify: (state: ToolSetupState) => void = () => {}) {}
  private update(patch: Partial<ToolSetupState>) { this.state = { ...this.state, ...patch }; this.notify(this.state); }
  private context(controller: AbortController): OperationContext {
    return { signal: controller.signal, onLog: text => this.update({ log: (this.state.log + text).slice(-65536) }) };
  }
  async prepare(kind: ToolKind, trusted: boolean): Promise<ToolSetupState> {
    if (!trusted) throw Error('Trust this project before checking or installing executable tools.');
    if (this.active) throw Error('Tool setup is already running.');
    if (!['simulation', 'language'].includes(kind)) throw Error('Unknown tool group.');
    const controller = new AbortController(); this.active = controller; this.action = undefined;
    let settle!: () => void; this.idle = new Promise(resolve => { settle = resolve; });
    this.update({ phase: 'checking', plan: undefined, log: '', error: undefined });
    try {
      await requireExternalTools(this.home, this.projects);
      controller.signal.throwIfAborted();
      const action = await this.planner(kind, this.home, this.context(controller));
      controller.signal.throwIfAborted();
      const plan = Object.freeze({ id: randomUUID(), kind, home: this.home, location: action.location, components: [...action.components], requiresInstall: !!action.install });
      this.action = action;
      this.update({ phase: action.install ? 'awaitingApproval' : 'ready', plan });
    } catch (error) { this.update({ phase: controller.signal.aborted ? 'cancelled' : 'failed', error: controller.signal.aborted ? undefined : String(error) }); }
    finally { this.active = undefined; settle(); }
    return this.state;
  }
  async approve(id: string, approved: boolean, trusted: boolean): Promise<ToolSetupState> {
    if (!trusted) throw Error('Trust this project before installing executable tools.');
    if (this.active || this.state.phase !== 'awaitingApproval' || id !== this.state.plan?.id || !this.action?.install) throw Error('Installation plan expired; check tools again.');
    if (!approved) { this.action = undefined; this.update({ phase: 'cancelled' }); return this.state; }
    const install = this.action.install; this.action = undefined;
    const controller = new AbortController(); this.active = controller; this.update({ phase: 'installing', error: undefined });
    let settle!: () => void; this.idle = new Promise(resolve => { settle = resolve; });
    try {
      await requireExternalTools(this.home, this.projects);
      controller.signal.throwIfAborted(); await install(this.context(controller)); controller.signal.throwIfAborted();
      this.update({ phase: 'ready' });
    } catch (error) { this.update({ phase: controller.signal.aborted ? 'cancelled' : 'failed', error: controller.signal.aborted ? undefined : String(error) }); }
    finally { this.active = undefined; settle(); }
    return this.state;
  }
  cancel(): void { this.active?.abort(); if (!this.active && this.state.phase === 'awaitingApproval') { this.action = undefined; this.update({ phase: 'cancelled' }); } }
  async close(): Promise<void> { this.cancel(); await this.idle; }
}
