import path from 'node:path';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import type { Writable } from 'node:stream';
import { performance } from 'node:perf_hooks';
import { checkedProcess, ProcessFailure, orderPackages, type Project } from '../../runtime/core/index';
import { SlangProvider, type Analysis, type DocumentOverlay, type SemanticQuery, type SemanticSymbol } from '../../runtime/semantic/index';

const marker = '\x1eRTL_EDITOR_V1 ';
type Ready = { kind: 'ready'; id: number; revision: number; analyses: Analysis[]; reusable: boolean; sourceBytes: number; rssBytes: number };
type Completed = { kind: 'complete'; id: number; revision: number; symbols: SemanticSymbol[]; rssBytes: number };
type Message = Ready | Completed;
type Ticket = { kind: Message['kind']; revision: number; resolve: (message: Message) => void; reject: (error: unknown) => void; timer: NodeJS.Timeout };
const identity = (file: string) => process.platform === 'win32' ? path.resolve(file).toLowerCase() : path.resolve(file);
async function modelInput(provider: SlangProvider, project: Project, overlays: DocumentOverlay[], signal: AbortSignal) {
  signal.throwIfAborted();
  const ordered = project.packageOrder === 'auto' && project.packageSources?.length
    ? orderPackages(project, await provider.dependencies(project, { signal }, overlays)) : project;
  signal.throwIfAborted();
  const groups = (project.tests.length ? project.tests : [{ sources: [], top: undefined }]).map(group => ({
    sources: [...new Set([...ordered.sources, ...group.sources])], testSources: group.sources, top: group.top
  }));
  if (groups.length > 4 || groups.some(group => group.sources.length > 2048)) throw Error('Editor session capacity exceeded; use one-shot analysis.');
  return { operation: 'editor-session', groups, sources: ordered.sources, overlays, includeDirs: ordered.includeDirs,
    defines: { ...ordered.defines, ...(ordered.waveform !== 'none' ? { RTL_WAVEFORM: '1' } : {}), ...(ordered.waveform === 'fst' ? { RTL_FST: '1' } : {}) } };
}
/** One owned worker, immutable compiler objects per revision. Rebuild releases
 * the former model; it never mutates finalized slang compilations in place. */
export class AnalysisSession {
  private input?: Writable;
  private buffer = '';
  private nextId = 0;
  private revision = 0;
  private building = true;
  private pending = new Map<number, Ticket>();
  private readonly controller = new AbortController();
  private process?: Promise<void>;
  private closePromise?: Promise<void>;
  private idle?: NodeJS.Timeout;
  private ended = false;
  private failure?: unknown;
  readonly metrics = { processStarts: 1, builds: 0, rebuilds: 0, queries: 0, buildMs: 0, queryMs: 0, sourceBytes: 0, rssBytes: 0, peakRssBytes: 0 };
  get usable(): boolean { return !this.ended && !this.closePromise && !this.controller.signal.aborted; }
  assertHealthy(): void { if ((this.failure as { cleanupFailed?: boolean })?.cleanupFailed) throw this.failure; }
  canRebuild(provider: SlangProvider, project: Project): boolean {
    this.assertHealthy();
    return this.persistent && this.usable && !this.building && this.revision < 64
      && identity(project.root) === this.root && provider.python === this.python && provider.bridge === this.bridge && provider.cache === this.cache;
  }
  private constructor(private readonly directory: string, private readonly lifetime: AbortSignal,
    private readonly persistent: boolean, private readonly root: string, private readonly python: string,
    private readonly bridge: string, private readonly cache: string) {}

  static async open(provider: SlangProvider, project: Project, overlays: DocumentOverlay[], signal: AbortSignal,
    options: { lifetime?: AbortSignal } = {}): Promise<{ session: AnalysisSession; analysis: Analysis }> {
    const request = await modelInput(provider, project, overlays, signal);
    await mkdir(provider.cache, { recursive: true });
    const directory = await mkdtemp(path.join(provider.cache, 'editor-'));
    const lifetime = options.lifetime ?? signal;
    const session = new AnalysisSession(directory, lifetime, options.lifetime !== undefined,
      identity(project.root), provider.python, provider.bridge, provider.cache);
    try {
      const input = path.join(directory, 'input.json');
      await writeFile(input, JSON.stringify(request));
      signal.throwIfAborted(); lifetime.throwIfAborted();
      const started = performance.now(); session.metrics.builds++;
      const ready = session.ticket<Ready>(0, 'ready', 0);
      const abort = () => { void session.close(true).catch(() => {}); };
      lifetime.addEventListener('abort', abort, { once: true });
      session.process = checkedProcess({ executable: provider.python, args: ['-I', '-B', provider.bridge, input], cwd: project.root, termination: 'process' }, {
        signal: session.controller.signal, onStdin: input => { session.input = input; }, onLog: text => session.receive(text)
      }).then(() => {}, error => {
        if (!(session.controller.signal.aborted && error instanceof ProcessFailure && error.cancelled && !error.cleanupFailed)) {
          session.failure = error; throw error;
        }
      }).finally(() => {
        session.ended = true; clearTimeout(session.idle); lifetime.removeEventListener('abort', abort);
        const error = session.failure ?? Error('Compiler session closed.');
        for (const job of session.pending.values()) { clearTimeout(job.timer); job.reject(error); } session.pending.clear();
      });
      void session.process.catch(() => {});
      if (lifetime.aborted) abort();
      const message = await session.operation(ready, signal);
      signal.throwIfAborted(); lifetime.throwIfAborted();
      session.metrics.buildMs += performance.now() - started;
      const analysis = await session.accept(message, request.groups.length);
      signal.throwIfAborted(); lifetime.throwIfAborted();
      return { session, analysis };
    } catch (error) { await session.close(true); throw error; }
  }
  async rebuild(provider: SlangProvider, project: Project, overlays: DocumentOverlay[], signal: AbortSignal): Promise<Analysis> {
    if (!this.canRebuild(provider, project)) throw Error('Compiler worker cannot rebuild this project.');
    signal.throwIfAborted(); this.lifetime.throwIfAborted();
    this.building = true; this.revision++; clearTimeout(this.idle);
    const started = performance.now(), id = ++this.nextId, file = path.join(this.directory, `model-${id}.json`);
    try {
      const request = await modelInput(provider, project, overlays, signal);
      // Unique input is fully written before sending a bounded stdin command.
      await writeFile(file, JSON.stringify(request), { flag: 'wx' });
      signal.throwIfAborted(); this.lifetime.throwIfAborted();
      if (!this.usable || !this.input) throw Error('Compiler worker closed before rebuild.');
      const ready = this.ticket<Ready>(id, 'ready', this.revision);
      this.metrics.builds++; this.metrics.rebuilds++;
      this.input.write(JSON.stringify({ kind: 'rebuild', id, revision: this.revision, input: path.basename(file) }) + '\n');
      const message = await this.operation(ready, signal);
      signal.throwIfAborted(); this.lifetime.throwIfAborted();
      return await this.accept(message, request.groups.length);
    } catch (error) { await this.close(true); throw error; }
    finally { this.metrics.buildMs += performance.now() - started; await rm(file, { force: true }); }
  }
  private async accept(ready: Ready, contexts: number): Promise<Analysis> {
    if (ready.analyses.length !== contexts) throw Error('Compiler session returned incomplete contexts.');
    this.metrics.sourceBytes = ready.sourceBytes; this.measure(ready.rssBytes);
    const unique = <T>(values: T[]) => [...new Map(values.map(value => [JSON.stringify(value), value])).values()];
    const analyses = ready.analyses;
    const analysis: Analysis = { modules: unique(analyses.flatMap(a => a.modules)), instances: unique(analyses.flatMap(a => a.instances)), diagnostics: unique(analyses.flatMap(a => a.diagnostics)),
      ...(analyses.every(a => a.inputs) ? { inputs: { files: unique(analyses.flatMap(a => a.inputs!.files)), candidates: unique(analyses.flatMap(a => a.inputs!.candidates)), conservative: analyses.some(a => a.inputs!.conservative) } } : {}) };
    this.building = false;
    if (!ready.reusable) await this.close(); else if (this.usable && !this.pending.size) this.touch();
    return analysis;
  }
  private ticket<T extends Message>(id: number, kind: Message['kind'], revision: number): Promise<T> {
    const result = new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id); reject(Error('Compiler session deadline exceeded.'));
        void this.close(true).catch(() => {});
      }, 15000);
      this.pending.set(id, { kind, revision, resolve: message => resolve(message as T), reject, timer });
    });
    void result.catch(() => {}); return result;
  }
  private measure(rss: number) { this.metrics.rssBytes = rss; this.metrics.peakRssBytes = Math.max(this.metrics.peakRssBytes, rss); }
  private receive(text: string) {
    this.buffer += text;
    if (this.buffer.length > 64 * 1024 * 1024) { this.failure = Error('Compiler response capacity exceeded.'); this.controller.abort(); return; }
    for (;;) {
      const end = this.buffer.indexOf('\n'); if (end < 0) return;
      const line = this.buffer.slice(0, end); this.buffer = this.buffer.slice(end + 1);
      if (!line.startsWith(marker)) continue;
      try {
        const message: Message = JSON.parse(line.slice(marker.length));
        const job = this.pending.get(message.id); if (!job) throw Error('Unsolicited compiler response.');
        if (message.kind !== job.kind || message.revision !== job.revision || !Number.isFinite(message.rssBytes) || message.rssBytes < 0
          || (message.kind === 'ready' ? !Array.isArray(message.analyses) || !Number.isFinite(message.sourceBytes) || message.sourceBytes < 0 || typeof message.reusable !== 'boolean' : !Array.isArray(message.symbols))) throw Error('Invalid compiler response.');
        this.pending.delete(message.id); clearTimeout(job.timer); this.measure(message.rssBytes); job.resolve(message);
        if (!this.pending.size && !this.building && this.usable) this.touch();
      } catch (error) { this.failure = error; this.controller.abort(); }
    }
  }
  private touch() { clearTimeout(this.idle); this.idle = setTimeout(() => { void this.close().catch(() => {}); }, 120000); this.idle.unref(); }
  private async operation<T>(result: Promise<T>, signal: AbortSignal, soft = false): Promise<T> {
    let abort!: () => void;
    const cancelled = new Promise<never>((_, reject) => {
      abort = () => { if (!soft) void this.close(true).catch(() => {}); reject(signal.reason); };
      signal.addEventListener('abort', abort, { once: true }); if (signal.aborted) abort();
    });
    try { return await Promise.race([result, cancelled]); }
    catch (error) { if (!(soft && signal.aborted)) await this.close(true); throw error; }
    finally { signal.removeEventListener('abort', abort); }
  }
  async complete(query: SemanticQuery, signal: AbortSignal): Promise<SemanticSymbol[]> {
    this.assertHealthy(); signal.throwIfAborted(); this.lifetime.throwIfAborted();
    if (!this.usable || this.building || !this.input) throw Error('Compiler session is unavailable.');
    if (this.pending.size >= 32) throw Error('Compiler query capacity exceeded.');
    const id = ++this.nextId, revision = this.revision, started = performance.now(); this.metrics.queries++;
    const command = JSON.stringify({ kind: 'complete', id, revision, query }) + '\n';
    if (command.length > 16384) throw Error('Compiler query capacity exceeded.');
    clearTimeout(this.idle);
    const result = this.ticket<Completed>(id, 'complete', revision);
    try {
      this.input.write(command);
      const message = await this.operation(result, signal, this.persistent);
      signal.throwIfAborted(); this.lifetime.throwIfAborted();
      if (revision !== this.revision) throw Error('Compiler model was superseded.');
      return message.symbols;
    } finally {
      this.metrics.queryMs += performance.now() - started;
      // Cancelled queries keep their deadline and slot until their actual reply.
      if (this.usable && !this.pending.size && !this.building) this.touch();
    }
  }
  close(force = false): Promise<void> {
    if (this.closePromise) { if (force) this.controller.abort(); return this.closePromise; }
    clearTimeout(this.idle);
    this.closePromise = (async () => {
      let timer: NodeJS.Timeout | undefined;
      if (force) this.controller.abort();
      else if (!this.ended) { this.input?.end(); timer = setTimeout(() => this.controller.abort(), 1000); }
      try {
        try { await this.process; } catch (error) { if ((error as { cleanupFailed?: boolean })?.cleanupFailed) throw error; }
        this.assertHealthy();
      } finally { clearTimeout(timer); await rm(this.directory, { recursive: true, force: true }); }
    })();
    return this.closePromise;
  }
}
