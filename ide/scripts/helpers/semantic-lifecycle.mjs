import fs from 'node:fs/promises';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import { build, transformSync } from 'esbuild';
import { root } from '../environment.mjs';
const require = createRequire(import.meta.url);
export const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
export const tick = () => new Promise(resolve => setImmediate(resolve));

/** Real owned adapter/queue; editor and client API boundaries are modeled. */
export async function lifecycleFixture({ before = false, probe, start, stop, drain } = {}) {
  const directory = await fs.mkdtemp(path.join(root, '.dev/semantic-lifecycle-'));
  const key = directory, stats = { probes: 0, clients: 0, starts: 0, stops: 0, drains: 0, processes: 0, logs: [], watches: [] }, subscriptions = [], commands = new Map(), clients = [], processes = [];
  let configuration, trust;
  const api = {
    StatusBarAlignment: { Right: 1 },
    workspace: { isTrusted: true, semantic: true, home: 'first tools',
      getConfiguration: () => ({ get: (name, fallback) => name === 'editor.semantic' ? api.workspace.semantic : name === 'toolsDirectory' ? api.workspace.home : fallback }),
      onDidGrantWorkspaceTrust: fn => { trust = fn; return { dispose() {} }; },
      onDidChangeConfiguration: fn => { configuration = fn; return { dispose() {} }; },
      createFileSystemWatcher: pattern => { stats.watches.push(pattern); return { pattern, dispose() {} }; } },
    commands: { registerCommand: (name, fn) => { commands.set(name, fn); return { dispose() {} }; }, executeCommand: async () => {} },
    window: { state: { focused: true }, activeTextEditor: undefined,
      createStatusBarItem: () => ({ hide() {}, show() {}, dispose() {} }),
      onDidChangeActiveTextEditor: () => ({ dispose() {} }), onDidChangeWindowState: () => ({ dispose() {} }),
      createOutputChannel: () => ({ appendLine: text => stats.logs.push(text), show() {}, dispose() {} }), showQuickPick: async () => undefined }
  };
  class Process {
    expectedClose = false;
    constructor() { stats.processes++; this.gate = deferred(); this.closed = this.gate.promise; this.child = {}; processes.push(this); }
  }
  class CleanupFailure extends Error { cleanupFailed = true; }
  class Client {
    constructor(id, name, factory, options) { stats.clients++; this.factory = factory; this.options = options; clients.push(this); }
    async start() {
      stats.starts++; if (typeof this.factory === 'function') await this.factory();
      await start?.(this); this.running = true;
    }
    async stop() {
      stats.stops++; this.running = false;
      await stop?.(this, stats.stops);
      processes.at(-1)?.gate.resolve();
    }
    isRunning() { return !!this.running; }
    async sendRequest(method) {
      if (method === 'rtl/prepareShutdown') { stats.drains++; return drain ? drain(this) : { ready: true }; }
      return { label: 'Ready', detail: 'fixture' };
    }
  }
  const fixture = { api, stats, clients, processes, commands, get trust() { return trust; }, change: () => configuration({ affectsConfiguration: () => true }) };
  globalThis[key] = {
    api,
    probe: { detectSemanticRuntime: async signal => { stats.probes++; return probe ? probe(signal, fixture) : 'verified-python'; } },
    client: { LanguageClient: Client, TransportKind: { ipc: 1 }, IPCMessageReader: class {}, IPCMessageWriter: class {}, ErrorAction: { Continue: 1 }, CloseAction: { DoNotRestart: 1 } },
    process: { SemanticProcess: Process, LanguageCleanupFailure: CleanupFailure, deadline: async work => work }
  };
  const source = before ? path.join(root, '.dev/cloud/h7k/semantic-before.ts') : path.join(root, 'language/src/semantic.ts');
  const contents = await fs.readFile(source, 'utf8'), outfile = path.join(directory, 'adapter.cjs');
  await build({ stdin: { contents, loader: 'ts', resolveDir: path.join(root, 'language/src') }, outfile, bundle: true, platform: 'node', format: 'cjs', plugins: [{ name: 'editor-boundaries', setup(builder) {
    builder.onResolve({ filter: /^(vscode|vscode-languageclient\/node)$/ }, args => ({ path: args.path === 'vscode' ? 'api' : 'client', namespace: 'modeled' }));
    builder.onResolve({ filter: /(^|\/)semantic-runtime$/ }, () => ({ path: 'probe', namespace: 'modeled' }));
    builder.onResolve({ filter: /^\.\/semantic-process$/ }, () => ({ path: 'process', namespace: 'modeled' }));
    builder.onLoad({ filter: /.*/, namespace: 'modeled' }, args => ({ contents: `module.exports=globalThis[${JSON.stringify(key)}][${JSON.stringify(args.path)}];`, loader: 'js' }));
  } }] });
  const close = require(outfile).registerSemantic({ subscriptions, asAbsolutePath: file => path.join(directory, file) });
  fixture.restart = () => commands.get('rtl.restartLanguage')();
  fixture.status = () => commands.get('rtl.getLanguageStatus')();
  fixture.close = async () => {
    if (close) await close();
    else { subscriptions.at(-1).dispose(); await tick(); }
  };
  fixture.cleanup = async () => { try { await fixture.close(); } finally { for (const item of subscriptions) item.dispose(); delete globalThis[key]; await fs.rm(directory, { recursive: true, force: true }); } };
  return fixture;
}

/** Virtual timers drive the actual status adapter without using the screen. */
export async function statusFixture(before = false) {
  const source = await fs.readFile(path.join(root, before ? '.dev/cloud/h7k/status-before.ts' : 'language/src/language-status.ts'), 'utf8');
  const jobs = new Map(), reads = [], subscriptions = [], key = `status-${Math.random()}`;
  let number = 0, editorChanged, focusChanged;
  const timers = {
    setTimeout: fn => { const id = ++number; jobs.set(id, { fn, interval: false }); return id; },
    setInterval: fn => { const id = ++number; jobs.set(id, { fn, interval: true }); return id; },
    clearTimeout: id => jobs.delete(id), clearInterval: id => jobs.delete(id)
  };
  const bar = { visible: false, hide() { this.visible = false; }, show() { this.visible = true; }, dispose() {} };
  const api = { StatusBarAlignment: { Right: 1 }, commands: { registerCommand: () => ({ dispose() {} }) }, window: { state: { focused: true }, activeTextEditor: { document: { languageId: 'systemverilog', uri: { toString: () => 'file:///first.sv' } } }, createStatusBarItem: () => bar, onDidChangeActiveTextEditor: fn => { editorChanged = fn; return { dispose() {} }; }, onDidChangeWindowState: fn => { focusChanged = fn; return { dispose() {} }; } } };
  globalThis[key] = timers;
  const code = transformSync(source, { loader: 'ts', format: 'cjs', target: 'node22' }).code;
  const filename = path.join(root, '.dev/status-model.cjs'), loaded = new Module(filename);
  loaded.require = name => name === 'vscode' ? api : require(name);
  loaded._compile(`const {setTimeout,clearTimeout,setInterval,clearInterval}=globalThis[${JSON.stringify(key)}];\n` + code, filename);
  loaded.exports.registerLanguageStatus({ subscriptions }, uri => { const gate = deferred(); reads.push({ uri, ...gate }); return gate.promise; }, () => {});
  await tick();
  return { api, reads, jobs, bar, editor: () => editorChanged(), focus: () => focusChanged?.(),
    fire: async () => { for (const [id, job] of [...jobs]) { if (!job.interval) jobs.delete(id); job.fn(); } await tick(); },
    close: () => { for (const item of subscriptions) item.dispose(); delete globalThis[key]; } };
}
