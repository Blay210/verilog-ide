import path from 'node:path';
import { mkdir, mkdtemp, writeFile, readFile, rename, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { checkedProcess, ProcessFailure, orderPackages, type Project, type PackageGraph, type OperationContext } from '../core/index';
import type { Analysis, DocumentOverlay, SemanticProvider, SemanticQuery, SemanticSymbol, DesignHierarchy } from './model';
import type { InternalGraph } from './internal-operations';

// The same public dump switches are used by the simulator and editor snapshots.
const defines = (project: Project) => ({ ...project.defines,
  ...(project.waveform !== 'none' ? { RTL_WAVEFORM: '1' } : {}),
  ...(project.waveform === 'fst' ? { RTL_FST: '1' } : {}) });

export class SlangProvider implements SemanticProvider {
  constructor(readonly python: string, readonly bridge: string, readonly cache: string) {}
  async dependencies(project: Project, context: OperationContext = {}, overlays: DocumentOverlay[] = []): Promise<PackageGraph> {
    await mkdir(this.cache, { recursive: true });
    const directory = await mkdtemp(path.join(this.cache, 'dependencies-'));
    try {
      const input = path.join(directory, 'input.json'), output = path.join(directory, 'output.json');
      await writeFile(input, JSON.stringify({ operation: 'dependencies', sources: project.sources, includeDirs: project.includeDirs, defines: defines(project), overlays }));
      await checkedProcess({ executable: this.python, args: ['-I', '-B', this.bridge, input, output], cwd: project.root }, { ...context, signal: context.signal ? AbortSignal.any([context.signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
      return JSON.parse(await readFile(output, 'utf8')) as PackageGraph;
    } finally { await rm(directory, { recursive: true, force: true }); }
  }
  async analyze(project: Project, overlays: DocumentOverlay[], signal?: AbortSignal): Promise<Analysis> {
    return this.evaluate(project, overlays, signal);
  }
  async hierarchy(project: Project, test: string | undefined, overlays: DocumentOverlay[], signal?: AbortSignal): Promise<DesignHierarchy> {
    return this.structureQuery(project, test, overlays, signal) as Promise<DesignHierarchy>;
  }
  async internalOperations(project: Project, test: string | undefined, instanceId: string, overlays: DocumentOverlay[], signal?: AbortSignal): Promise<InternalGraph> {
    return this.structureQuery(project, test, overlays, signal, instanceId) as Promise<InternalGraph>;
  }
  async scopeOperations(project: Project, test: string | undefined, instanceId: string, overlays: DocumentOverlay[], signal?: AbortSignal): Promise<InternalGraph> {
    return this.structureQuery(project,test,overlays,signal,instanceId,true) as Promise<InternalGraph>;
  }
  private async request(project: Project, overlays: DocumentOverlay[], signal: AbortSignal | undefined, prefix: string,
    createRequest: (ordered: Project) => Record<string, unknown>, query?: SemanticQuery): Promise<unknown> {
    await mkdir(this.cache, { recursive: true });
    const directory = await mkdtemp(path.join(this.cache, prefix));
    const owned = new AbortController();
    const operationSignal = signal ? AbortSignal.any([signal, owned.signal]) : owned.signal;
    let timer = setTimeout(() => owned.abort(), 15000);
    let outcome: { error?: unknown } | undefined;
    let joined: Promise<void> | undefined;
    try {
      const input = path.join(directory, 'input.json'), output = path.join(directory, 'output.json');
      const automatic = project.packageOrder === 'auto' && !!project.packageSources?.length;
      const approval = automatic ? randomUUID() : undefined;
      const channel = { graph: path.join(directory, 'packages.json'), continue: path.join(directory, 'continue.json') };
      const request = automatic ? { operation: 'package-session', protocol: 1, packageChannel: channel,
        sources: project.sources, includeDirs: project.includeDirs, defines: defines(project), overlays,
        query } : createRequest(project);
      await writeFile(input, JSON.stringify(request));
      let announce!: () => void;
      const announced = new Promise<void>(resolve => { announce = resolve; });
      let notification = '';
      // Attach both outcomes immediately. Every exit, including a rejected Core
      // graph or failed continuation write, joins checkedProcess before cleanup.
      joined = checkedProcess({ executable: this.python, args: ['-I', '-B', this.bridge, input, output], cwd: project.root },
        { signal: operationSignal, onLog: automatic ? chunk => {
          notification = (notification + chunk).slice(-128);
          if (notification.includes('\u001eRTL_PACKAGE_READY_V1\n')) announce();
        } : undefined }).then(() => { outcome = {}; }, error => { outcome = { error }; });
      if (automatic) {
        // An owned stdout notification avoids polling disk while slang starts.
        // The graph is already atomically published when this marker is flushed.
        await Promise.race([announced, joined.then(() => { throw outcome?.error ?? Error('Semantic bridge ended before package approval.'); })]);
        operationSignal.throwIfAborted();
        const message = JSON.parse(await readFile(channel.graph, 'utf8'));
        if (message.protocol !== 1 || !message.graph) throw Error('Invalid semantic package protocol.');
        const ordered = orderPackages(project, message.graph as PackageGraph);
        operationSignal.throwIfAborted();
        // Preserve the existing dependency and analysis budgets. Hierarchy's
        // caller additionally supplies its existing overall 15-second deadline.
        clearTimeout(timer); timer = setTimeout(() => owned.abort(), 15000);
        const { includeDirs: _dirs, defines: _defines, overlays: _overlays, query: _query, ...continuation } = createRequest(ordered);
        await writeFile(channel.continue + '.tmp', JSON.stringify({ protocol: 1, approval, request: continuation }));
        operationSignal.throwIfAborted();
        await rename(channel.continue + '.tmp', channel.continue);
      }
      await joined;
      if (outcome?.error) throw outcome.error;
      const response = JSON.parse(await readFile(output, 'utf8'));
      if (!automatic) return response;
      if (response.protocol !== 1 || response.approval !== approval) throw Error('Invalid semantic package acknowledgement.');
      return response.result;
    } catch (error) {
      const cancelled = operationSignal.aborted;
      owned.abort();
      await joined;
      if (outcome?.error instanceof ProcessFailure && (outcome.error.cleanupFailed || cancelled)) throw outcome.error;
      throw error;
    } finally {
      clearTimeout(timer);
      await rm(directory, { recursive: true, force: true });
    }
  }
  private async structureQuery(project: Project, test: string | undefined, overlays: DocumentOverlay[], signal?: AbortSignal, instanceId?: string, scopeOperations = false): Promise<DesignHierarchy | InternalGraph> {
    const target = project.tests.find(t => t.name === test);
    if (test && !target || !test && project.tests.length) throw Error('Choose one registered test to elaborate its hierarchy.');
    const timeout = AbortSignal.timeout(15000);
    const operationSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
    operationSignal.throwIfAborted();
    const response = await this.request(project, overlays, operationSignal, 'hierarchy-', ordered => ({
      operation: instanceId === undefined ? 'hierarchy' : scopeOperations ? 'scopeOperations' : 'internalOperations', instanceId,
      sources: [...new Set([...ordered.sources, ...(target?.sources ?? [])])], top: target?.top,
      includeDirs: ordered.includeDirs, defines: defines(ordered), overlays }));
    return { ...response as DesignHierarchy | InternalGraph, test };
  }
  async complete(project: Project, overlays: DocumentOverlay[], query: SemanticQuery, signal?: AbortSignal): Promise<SemanticSymbol[]> {
    return (await this.evaluate(project, overlays, signal, query)).completions ?? [];
  }
  private async evaluate(project: Project, overlays: DocumentOverlay[], signal?: AbortSignal, query?: SemanticQuery): Promise<Analysis & { completions?: SemanticSymbol[] }> {
    const result: Analysis = { modules: [], instances: [], diagnostics: [], inputs: { files: [], candidates: [], conservative: false } };
    // Testbenches are independent compilations, just as they are in simulation.
    // Two tests may legitimately declare identically named helpers or tops.
    const key = (file: string) => process.platform === 'win32' ? path.resolve(file).toLowerCase() : path.resolve(file);
    const matchingTests = query ? project.tests.filter(t => t.sources.some(f => key(f) === key(query.file))) : [];
    const groups = matchingTests.length ? matchingTests : project.tests.length ? project.tests : [{ sources: [], top: undefined }];
    const common = { includeDirs: project.includeDirs, defines: defines(project), overlays, query };
    // Share process/import overhead only. The bridge creates a new source
    // manager and compilation for each group; nothing survives this request.
    const response = await this.request(project, overlays, signal, 'analysis-', ordered => {
      const sorted = groups.map(group => ({ sources: [...new Set([...ordered.sources, ...group.sources])], top: group.top }));
      return sorted.length === 1 ? { ...common, ...sorted[0] }
        : { ...common, operation: 'batch', sources: ordered.sources, groups: sorted };
    }, query);
    type Current = Analysis & { completions?: SemanticSymbol[] };
    const analyses: Current[] = groups.length === 1 ? [response as Current] : (response as { analyses: Current[] }).analyses;
    if (!Array.isArray(analyses) || analyses.length !== groups.length) throw Error('Semantic bridge returned incomplete test analyses.');
    let completions: SemanticSymbol[] | undefined;
    for (const current of analyses) {
      result.modules.push(...current.modules); result.instances.push(...current.instances); result.diagnostics.push(...current.diagnostics);
      if (current.inputs && result.inputs) {
        result.inputs.files.push(...current.inputs.files); result.inputs.candidates.push(...current.inputs.candidates);
        result.inputs.conservative ||= current.inputs.conservative;
      } else result.inputs = undefined; // Unknown provider output must not enable filtering.
      if (query) {
        const symbols = current.completions ?? [];
        // Shared RTL may elaborate in more than one test context. Only agree on
        // names, types and declarations valid in every such context.
        if (completions === undefined) completions = symbols;
        else {
          // Preserve exact whole-symbol agreement and first-context order,
          // without serializing every pair in a quadratic comparison.
          const agreed = new Set(symbols.map(symbol => JSON.stringify(symbol)));
          completions = completions.filter(symbol => agreed.has(JSON.stringify(symbol)));
        }
      }
    }
    const unique = <T>(items: T[]): T[] => [...new Map(items.map(item => [JSON.stringify(item), item])).values()];
    return { modules: unique(result.modules), instances: unique(result.instances), diagnostics: unique(result.diagnostics),
      ...(result.inputs ? { inputs: { ...result.inputs, files: unique(result.inputs.files), candidates: unique(result.inputs.candidates) } } : {}), ...(query ? { completions } : {}) };
  }
}
