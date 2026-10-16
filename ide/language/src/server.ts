import { createConnection, ProposedFeatures, TextDocuments, TextDocumentSyncKind, CompletionItemKind, SemanticTokensBuilder, DiagnosticSeverity, DidChangeWatchedFilesNotification, RegistrationRequest, UnregistrationRequest, type Diagnostic, type InitializeParams } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { loadProject, ProjectManifestMissing, projectWatchPaths, type Project, type ProjectWatchPaths } from '../../runtime/core/index';
import { SlangProvider, moduleHighlights, enumCaseContext, planEnumCase, connectionPort, connectionRank, callableContext, callableSignature, parameterSignature, portSignature, portCompletions, symbolAt, symbolCompletionContext, type Analysis, type AnalysisInputs, type SemanticSymbol } from '../../runtime/semantic/index';
import { SemanticWork, SemanticQueueFull } from './semantic-work';
import { fileKey, contains, actualInput, inputEvent, inputPatterns } from './input-events';
import { InputWatches } from './input-watches';
import { moduleSnippet, portSnippet } from './local-symbols';
import { AnalysisSession } from './analysis-session';
import { editDelay } from './edit-scheduling';
import { SemanticContinuity } from './semantic-continuity';

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
interface State { root: string; generation: number; workerAbort?: AbortController; preparing?: Promise<void>; queued?: boolean; edits?: number; starts?: number; obsolete?: number; manifestMissing?: boolean; project?: Project; inputProject?: Project; watchPaths?: ProjectWatchPaths; inputs?: AnalysisInputs; abort?: AbortController; timer?: NodeJS.Timeout; pending?: Promise<void>; analysis?: Analysis; session?: AnalysisSession; retired?: Promise<void>; published: Set<string>; status?: string; detail?: string }
const states = new Map<string, State>();
const previews = new Map<State, SemanticContinuity>();
const preview = (state: State) => { let value = previews.get(state); if (!value) { if (previews.size >= 2) previews.delete(previews.keys().next().value!); value = new SemanticContinuity(); previews.set(state, value); } return value; };
const documentState = (file: string) => [...states.values()].filter(state => contains(state.root, file)).sort((a, b) => b.root.length - a.root.length)[0];
const work = new SemanticWork();
let provider: SlangProvider;
let stopping = false;
let dynamicWatches = false;
let workspaceFoldersSupported = false;
let tokenRefresh = false;
let reuseSessions = false;
let interactiveEditing = false;
// At most 16 small previous texts for scheduling hints; eviction only loses the
// fast boundary hint, never document contents or correctness.
const previousTexts = new Map<string, string>();
let reservedSessions = 0;
const sessions = new Set<AnalysisSession>();
const watches = new InputWatches(async signature => {
  const id = randomUUID(), method = DidChangeWatchedFilesNotification.type.method;
  await connection.sendRequest(RegistrationRequest.type, { registrations: [{ id, method, registerOptions: { watchers: JSON.parse(signature) } }] });
  return async () => { await connection.sendRequest(UnregistrationRequest.type, { unregisterations: [{ id, method }] }); };
});
const syncWatches = () => {
  if (!dynamicWatches || stopping) return Promise.resolve(false);
  const patterns = inputPatterns(states.values()).map(({ directory, pattern }) => ({ globPattern: { baseUri: pathToFileURL(directory).href, pattern } }));
  return watches.sync(patterns.length ? JSON.stringify(patterns) : '');
};
const ownPatterns = (state: State) => inputPatterns([state], [...states.values()].map(root => root.root));
const empty: Analysis = { modules: [], instances: [], diagnostics: [] };
const completionKinds: Record<SemanticSymbol['kind'], CompletionItemKind> = { variable: CompletionItemKind.Variable, constant: CompletionItemKind.Constant, type: CompletionItemKind.Class, function: CompletionItemKind.Function, module: CompletionItemKind.Class, package: CompletionItemKind.Module };
const isRtl = (file: string) => /\.(?:sv|v|svh|vh)$/i.test(file);
const tracked = (file: string) => [...states.values()].some(state => actualInput(state, file));
const overlays = () => documents.all().filter(d => d.uri.startsWith('file:') && (tracked(fileURLToPath(d.uri)) || ['verilog', 'systemverilog'].includes(d.languageId) && isRtl(fileURLToPath(d.uri)))).map(d => ({ file: fileURLToPath(d.uri), text: d.getText() }));
function addRoot(uri: string) {
  if (!uri.startsWith('file:')) return;
  const root = fileURLToPath(uri);
  states.set(uri, { root, generation: 0, published: new Set() });
}
connection.onInitialize((params: InitializeParams) => {
  const options = params.initializationOptions;
  dynamicWatches = params.capabilities.workspace?.didChangeWatchedFiles?.dynamicRegistration === true && params.capabilities.workspace.didChangeWatchedFiles.relativePatternSupport === true;
  workspaceFoldersSupported = params.capabilities.workspace?.workspaceFolders === true;
  tokenRefresh = params.capabilities.workspace?.semanticTokens?.refreshSupport === true;
  reuseSessions = options.semanticSessions === true;
  interactiveEditing = options.interactiveEditing === true;
  provider = new SlangProvider(options.python, options.bridge, options.cache);
  for (const folder of params.workspaceFolders ?? (params.rootUri ? [{ uri: params.rootUri }] : [])) addRoot(folder.uri);
  return { capabilities: { textDocumentSync: TextDocumentSyncKind.Full, completionProvider: { triggerCharacters: ['.', ':', '('] }, signatureHelpProvider: { triggerCharacters: ['(', ','], retriggerCharacters: [')'] }, codeActionProvider: { codeActionKinds: ['refactor.rewrite'] }, hoverProvider: true, definitionProvider: true, semanticTokensProvider: { legend: { tokenTypes: ['class'], tokenModifiers: ['declaration'] }, full: true }, workspace: { workspaceFolders: { supported: true, changeNotifications: true } } } };
});
function clear(state: State) {
  previews.get(state)?.clear(); previews.delete(state);
  state.workerAbort?.abort(); state.workerAbort = undefined;
  for (const uri of state.published) connection.sendDiagnostics({ uri, diagnostics: [] });
  state.published.clear(); state.analysis = undefined; state.project = undefined;
  const session = state.session; state.session = undefined;
  if (session || state.preparing) {
    const previous = state.retired;
    const closing = session?.close(true);
    state.retired = Promise.all([previous, state.preparing, closing]).then(() => { if (session) sessions.delete(session); });
    void state.retired.catch(error => connection.console.error(`Compiler cleanup: ${String(error)}`));
  }
}
async function analyzeInputs(state: State, project: Project, signal: AbortSignal): Promise<Analysis> {
  await state.retired; await state.preparing; signal.throwIfAborted();
  for (const session of sessions) session.assertHealthy();
  const retainable = reuseSessions && dynamicWatches && project.tests.length <= 4 && project.sources.length <= 2048
    && project.tests.every(test => project.sources.length + test.sources.length <= 2048);
  if (interactiveEditing && retainable && state.session?.canRebuild(provider, project)) return state.session.rebuild(provider, project, overlays(), signal);
  if (state.session) { const previous = state.session; state.session = undefined; await previous.close(true); sessions.delete(previous); }
  state.workerAbort?.abort(); state.workerAbort = undefined;
  // Without acknowledged dynamic dependency watches a retained compiler could
  // outlive external/non-RTL inputs. Keep the conservative one-shot path there.
  if (!retainable || reservedSessions + [...sessions].filter(s => s.usable).length >= 2) return provider.analyze(project, overlays(), signal);
  reservedSessions++;
  const lifetime = interactiveEditing ? new AbortController() : undefined;
  state.workerAbort = lifetime;
  const prepared = (async () => {
    try {
      const { session, analysis } = await AnalysisSession.open(provider, project, overlays(), signal, { lifetime: lifetime?.signal });
      if (signal.aborted) { await session.close(true); signal.throwIfAborted(); }
      sessions.add(session); state.session = session;
      return analysis;
    } finally { reservedSessions--; }
  })();
  // A cancelled open has no published session yet. Join its real cleanup before
  // another generation can spawn, preserving cleanupFailed quarantine.
  const preparing = prepared.then(() => {}, error => { if ((error as { cleanupFailed?: boolean })?.cleanupFailed) throw error; });
  state.preparing = preparing; void preparing.catch(() => {});
  try { return await prepared; }
  finally { if (state.preparing === preparing) state.preparing = undefined; }
}
function invalidate(state: State) {
  for (const uri of state.published) connection.sendDiagnostics({ uri, diagnostics: [] });
  state.published.clear(); state.analysis = undefined; state.project = undefined;
}
function startQueued(state: State) {
  if (stopping || ![...states.values()].includes(state) || state.pending || state.timer || !state.queued) return;
  state.queued = false;
  state.abort?.abort(); invalidate(state); state.abort = new AbortController();
  void analyze(state);
}
function schedule(state: State, delay = 250, editing = false) {
  if (stopping) return;
  state.status = "Analyzing"; state.detail = "Waiting for current source analysis.";
  if (interactiveEditing) {
    state.generation++; state.edits = (state.edits ?? 0) + (editing ? 1 : 0);
    state.queued = true; clearTimeout(state.timer); invalidate(state);
    // Retire authoritative results immediately; presentation has its own
    // bounded, edit-mapped snapshot and never authorizes compiler queries.
    // Configuration/external events still cancel invalid input work promptly.
    if (!editing) { state.abort?.abort(); clear(state); }
    state.timer = setTimeout(() => { state.timer = undefined; startQueued(state); }, delay);
    return;
  }
  state.generation++; state.abort?.abort(); state.abort = new AbortController(); clearTimeout(state.timer); clear(state);
  state.timer = setTimeout(() => { state.timer = undefined; void analyze(state); }, 250);
}
async function analyze(state: State): Promise<void> {
  const generation = state.generation;
  const abort = state.abort!;
  state.starts = (state.starts ?? 0) + 1;
  const pending = (async () => {
    try {
      const { project, result } = await work.run(`analysis:${state.root}:${generation}`, abort.signal, async signal => {
        let project: Project;
        try { project = await loadProject(state.root); }
        catch (error) {
          if (!(error instanceof ProjectManifestMissing)) throw error;
          signal.throwIfAborted();
          const before = JSON.stringify(ownPatterns(state));
          state.manifestMissing = true;
          state.inputProject = undefined; state.watchPaths = undefined;
          await syncWatches();
          signal.throwIfAborted();
          // Root replacement/manifest creation while a new recovery watch was
          // being installed must not leave the pre-registration absence settled.
          if (!dynamicWatches || before === JSON.stringify(ownPatterns(state))) throw error;
          project = await loadProject(state.root);
        }
        signal.throwIfAborted();
        state.manifestMissing = false;
        state.inputProject = project;
        state.watchPaths = projectWatchPaths(project);
        await syncWatches(); // Register conservative search directories before reading inputs.
        signal.throwIfAborted();
        let before = JSON.stringify(ownPatterns(state));
        let result = await analyzeInputs(state, project, signal);
        signal.throwIfAborted();
        state.inputs = result.inputs;
        // Watch discovery can expose previously unwatched external/non-RTL paths.
        // Confirm with a read after registration; never publish the discovery read.
        for (;;) {
          await syncWatches();
          signal.throwIfAborted();
          const patterns = ownPatterns(state), current = JSON.stringify(patterns);
          // A peer's registration update and removal-only transitions do not
          // discover new watches for this compilation. Static RTL watches remain.
          if (!patterns.length || current === before) break;
          before = current;
          result = await analyzeInputs(state, project, signal);
          signal.throwIfAborted(); state.inputs = result.inputs;
        }
        signal.throwIfAborted();
        return { project, result };
      });
      if (generation !== state.generation || abort.signal.aborted) { state.obsolete = (state.obsolete ?? 0) + 1; return; }
      state.status = result.diagnostics.some(d => d.severity === "error") ? "Source errors" : "Ready";
      state.detail = "Analysis completed. See Problems for source diagnostics.";
      state.analysis = result;
      state.project = project;
      if (interactiveEditing) preview(state).modules.publish(result);
      if (interactiveEditing) for (const document of documents.all()) {
        if (document.uri.startsWith('file:') && documentState(fileURLToPath(document.uri)) === state)
          preview(state).publish(document.uri, fileURLToPath(document.uri), document.getText(), result);
      }
      const grouped = new Map<string, Diagnostic[]>();
      for (const entry of result.diagnostics) {
        if (!entry.location.file || !isRtl(entry.location.file)) continue;
        const uri = pathToFileURL(entry.location.file).href;
        const start = { line: entry.location.line, character: entry.location.character };
        const list = grouped.get(uri) ?? [];
        list.push({ range: { start, end: { line: start.line, character: start.character + 1 } }, message: entry.message, source: 'slang', code: entry.code, severity: entry.severity === 'error' ? DiagnosticSeverity.Error : entry.severity === 'warning' ? DiagnosticSeverity.Warning : DiagnosticSeverity.Information });
        grouped.set(uri, list);
      }
      for (const [uri, diagnostics] of grouped) { connection.sendDiagnostics({ uri, diagnostics, version: documents.get(uri)?.version }); state.published.add(uri); }
      if (interactiveEditing) for (const document of documents.all()) {
        if (document.uri.startsWith('file:') && contains(state.root, fileURLToPath(document.uri)))
          connection.sendNotification('rtl/analysisReady', { uri: document.uri, version: document.version, generation });
      }
      if (interactiveEditing && tokenRefresh) connection.languages.semanticTokens.refresh();
    } catch (error) {
      if (abort.signal.aborted || generation !== state.generation) return;
      previews.get(state)?.clear();
      if (state.session) {
        const session = state.session; state.session = undefined;
        try { await session.close(true); sessions.delete(session); }
        catch (cleanupError) { error = cleanupError; }
      }
      if (abort.signal.aborted || generation !== state.generation) return;
      state.manifestMissing = error instanceof ProjectManifestMissing;
      if (state.manifestMissing) {
        // Release Project/search scopes. Retain last header membership only so
        // open plain-text buffers can still overlay a restored configuration.
        // Missing-root event/watch routing ignores these inactive input paths.
        state.inputProject = undefined; state.watchPaths = undefined;
      }
      // A previously healthy dependency set cannot authorize filtering after a
      // failed load/probe/registration. Retain known paths and widen search watches.
      state.inputs = state.inputs ? { ...state.inputs, conservative: true } : undefined;
      state.watchPaths = projectWatchPaths(error) ?? state.watchPaths;
      state.status = error instanceof SemanticQueueFull ? 'Analysis busy' : 'Analysis failed'; state.detail = String(error);
      connection.console.error(String(error));
      try { await syncWatches(); } catch (watchError) { connection.console.error(`Input watches: ${String(watchError)}`); }
      if (abort.signal.aborted || generation !== state.generation) return;
      // Missing manifests are normal in mixed workspaces; malformed manifests are actionable.
      if (error instanceof ProjectManifestMissing) { state.status = 'Project not configured'; state.detail = 'Open the folder containing rtl.toml. Nested project discovery is not supported.'; return; }
      // Configuration failures are status/log messages, never RTL diagnostics on TOML.
    }
  })();
  state.pending = pending;
  await pending;
  if (state.pending === pending) state.pending = undefined;
  if (interactiveEditing) startQueued(state);
}
connection.onInitialized(() => {
  for (const state of states.values()) schedule(state);
  if (workspaceFoldersSupported) connection.workspace.onDidChangeWorkspaceFolders(event => {
    for (const folder of event.removed) { const state = states.get(folder.uri); if (state) { state.abort?.abort(); clearTimeout(state.timer); clear(state); states.delete(folder.uri); } }
    void syncWatches().catch(error => connection.console.error(`Input watches: ${String(error)}`));
    for (const folder of event.added) { addRoot(folder.uri); const state = states.get(folder.uri); if (state) schedule(state); }
  });
});
// Source selection prefixes and actual includes retain shared-root invalidation.
const changedDocument = (uri: string, delay = 250, editing = false) => {
  if (!uri.startsWith('file:')) return;
  const file = fileURLToPath(uri);
  for (const state of states.values()) if (inputEvent(state, file)) schedule(state, delay, editing);
};
const documentChanged = (document: TextDocument) => {
  if (document.uri.startsWith('file:') && (['verilog', 'systemverilog'].includes(document.languageId) || tracked(fileURLToPath(document.uri)))) {
    const text = document.getText(), delay = editDelay(previousTexts.get(document.uri), text);
    if (interactiveEditing) for (const state of states.values()) if (inputEvent(state, fileURLToPath(document.uri))) previews.get(state)?.edit(document.uri, text, fileURLToPath(document.uri));
    previousTexts.delete(document.uri);
    if (text.length <= 1024 * 1024) previousTexts.set(document.uri, text);
    while (previousTexts.size > 16) previousTexts.delete(previousTexts.keys().next().value!);
    changedDocument(document.uri, delay, true);
  }
};
documents.onDidChangeContent(event => documentChanged(event.document));
documents.onDidClose(event => { previousTexts.delete(event.document.uri); changedDocument(event.document.uri); });
connection.onDidChangeWatchedFiles(event => {
  const files = event.changes.filter(change => change.uri.startsWith('file:')).map(change => fileURLToPath(change.uri));
  for (const state of states.values()) if (files.some(file => inputEvent(state, file))) schedule(state);
});
async function snapshot(uri: string) {
  if (stopping) return;
  const document = documents.get(uri);
  if (!document || !uri.startsWith('file:') || !['verilog', 'systemverilog'].includes(document.languageId) || !isRtl(fileURLToPath(uri))) return;
  const file = fileURLToPath(uri);
  const state = [...states.values()].filter(s => contains(s.root, file)).sort((a, b) => b.root.length - a.root.length)[0];
  if (!state) return;
  const generation = state.generation;
  // Passive editor requests must not flush the debounce or join a full build.
  // The separate lexical provider can respond while this generation is dirty.
  if (interactiveEditing && (state.timer || state.pending || state.queued || !state.analysis)) return;
  if (state.timer) { clearTimeout(state.timer); state.timer = undefined; await analyze(state); }
  else if (!state.pending && state.status === 'Analysis busy') await analyze(state);
  else await state.pending;
  if (generation !== state.generation || documents.get(uri)?.version !== document.version) return;
  return { document, file, analysis: state.analysis ?? empty, state, generation };
}
function complete(current: NonNullable<Awaited<ReturnType<typeof snapshot>>>, query: { file: string; offset: number; qualifier?: string }, signal: AbortSignal) {
  // No settled candidate cache: compiler lookup still applies exact scope,
  // declaration order and parameter context to this immutable generation.
  return work.run(`query:${current.state.root}:${current.generation}:${JSON.stringify(query)}`, signal, async shared => {
    shared.throwIfAborted();
    for (const active of sessions) active.assertHealthy();
    const session = current.state.session;
    session?.assertHealthy();
    return session?.usable ? session.complete(query, shared) : provider.complete(current.state.project!, overlays(), query, shared);
  });
}
connection.onRequest('rtl/languageStatus', (params: { uri: string }) => {
  if (!params.uri.startsWith('file:')) return { label: 'Save file first', detail: 'Semantic analysis requires a saved project file.' };
  const file = fileURLToPath(params.uri);
  const state = [...states.values()].filter(s => { const r = path.relative(s.root, file); return r !== '..' && !r.startsWith('..' + path.sep) && !path.isAbsolute(r); }).sort((a, b) => b.root.length - a.root.length)[0];
  if (!state) return { label: 'Outside workspace', detail: 'Open the folder containing rtl.toml.' };
  const project = state.project;
  if (project) {
    const listed = actualInput(state, file) || [...project.sources, ...(project.packageSources ?? []), ...project.tests.flatMap(t => t.sources)].some(f => fileKey(f) === fileKey(file));
    if (!listed) return { label: 'Not a listed source', detail: 'This file is neither a listed source nor a compiler-confirmed included header.', root: state.root };
  }
  return { label: state.status ?? 'Starting', detail: state.detail ?? 'Waiting for analysis.', root: state.root };
});
connection.onRequest('rtl/languagePerformance', () => [...states.values()].map(state => ({ generation: state.generation,
  retained: state.session?.usable === true, edits: state.edits ?? 0, starts: state.starts ?? 0, obsolete: state.obsolete ?? 0,
  queued: state.queued === true, metrics: state.session?.metrics })));
connection.languages.semanticTokens.on(async (params, token) => {
  const current = await snapshot(params.textDocument.uri);
  const builder = new SemanticTokensBuilder();
  if (token.isCancellationRequested) return builder.build();
  const document = current?.document ?? documents.get(params.textDocument.uri);
  if (!document || !document.uri.startsWith('file:')) return builder.build();
  const state = documentState(fileURLToPath(document.uri));
  const entries = current ? moduleHighlights(current.analysis, current.file, document.getText()) : state ? previews.get(state)?.tokens(document.uri) ?? [] : [];
  for (const entry of entries) {
    const position = document.positionAt(entry.start);
    builder.push(position.line, position.character, entry.length, 0, entry.declaration ? 1 : 0);
  }
  return builder.build();
});
connection.onCompletion(async (params, token) => {
  const current = await snapshot(params.textDocument.uri);
  if (!current) {
    if (!interactiveEditing || token.isCancellationRequested) return [];
    const document = documents.get(params.textDocument.uri);
    if (!document || !document.uri.startsWith('file:')) return { isIncomplete: true, items: [] };
    const file = fileURLToPath(document.uri), state = documentState(file), saved = state && previews.get(state);
    const offset = document.offsetAt(params.position), text = document.getText();
    const ports = saved?.ports(document.uri, file, offset);
    if (ports?.ports.length) return { isIncomplete: true, items: ports.ports.map(port => ({ label: port.name, kind: CompletionItemKind.Field,
      detail: `${port.direction} ${port.type}`, insertTextFormat: 2 as const,
      textEdit: { range: { start: document.positionAt(ports.start), end: document.positionAt(ports.end) }, newText: portSnippet(port.name, text.slice(ports.end)) } })) };
    const context = symbolCompletionContext(text, offset), modules = saved?.modules.candidates(text, offset) ?? [];
    const symbols = [...new Map([...(saved?.candidates(document.uri, offset) ?? []), ...modules].map(symbol => [symbol.name, symbol])).values()];
    if (!context || !symbols || params.context?.triggerCharacter === '(') return { isIncomplete: true, items: [] };
    return { isIncomplete: true, items: symbols.map(symbol => {
      const instantiate = symbol.instantiable === true && !/\b(?:module|interface|program)\s+(?:(?:automatic|static)\s+)?$/.test(text.slice(0, context.start));
      return { label: symbol.name, kind: completionKinds[symbol.kind], detail: symbol.detail,
        insertTextFormat: instantiate ? 2 as const : 1 as const, textEdit: { range: { start: document.positionAt(context.start), end: document.positionAt(context.end) }, newText: instantiate ? moduleSnippet(symbol.name) : symbol.name } };
    }) };
  }
  const offset = current.document.offsetAt(params.position);
  const targetPort = connectionPort(current.analysis, current.file, current.document.getText(), offset);
  if (params.context?.triggerCharacter === '(' && !targetPort) return [];
  const result = portCompletions(current.analysis, current.file, current.document.getText(), offset, false);
  if (result.ports.length) return result.ports.map(port => ({ label: port.name, kind: CompletionItemKind.Field, detail: `${port.direction} ${port.type}`, insertTextFormat: 2 as const, textEdit: { range: { start: current.document.positionAt(result.start), end: current.document.positionAt(result.end) }, newText: portSnippet(port.name, current.document.getText().slice(result.end)) } }));
  const context = symbolCompletionContext(current.document.getText(), offset);
  if (!context || !current.state.project || token.isCancellationRequested) return [];
  const abort = new AbortController();
  const subscription = token.onCancellationRequested(() => abort.abort());
  const signal = current.state.abort ? AbortSignal.any([abort.signal, current.state.abort.signal]) : abort.signal;
  try {
    const queried = await complete(current, { file: current.file, offset, qualifier: context.qualifier }, signal);
    if (signal.aborted || current.generation !== current.state.generation) return [];
    const modules = !targetPort && interactiveEditing ? previews.get(current.state)?.modules.candidates(current.document.getText(), offset) ?? [] : [];
    const symbols = [...new Map([...queried, ...modules].map(symbol => [symbol.name, symbol])).values()];
    if (interactiveEditing && !targetPort) preview(current.state).remember(current.document.uri, current.document.getText(), offset, symbols);
    // Give the editor the whole valid scope. It filters locally while typing,
    // without a fresh compiler round trip for each additional prefix letter.
    return symbols.filter(s => !targetPort || s.kind !== 'module').map(symbol => {
      const rank = connectionRank(targetPort, symbol);
      const instantiate = symbol.instantiable === true && !/\b(?:module|interface|program)\s+(?:(?:automatic|static)\s+)?$/.test(current.document.getText().slice(0, context.start));
      return { label: symbol.name, kind: completionKinds[symbol.kind], detail: symbol.detail + (rank.reason ? ` · ${rank.reason}` : ''), sortText: targetPort ? rank.sortText : '0_' + symbol.name, insertTextFormat: instantiate ? 2 as const : 1 as const, textEdit: { range: { start: current.document.positionAt(context.start), end: current.document.positionAt(context.end) }, newText: instantiate ? moduleSnippet(symbol.name) : symbol.name } };
    });
  } catch (error) {
    if (!signal.aborted) connection.console.error(`Completion: ${String(error)}`);
    return [];
  } finally { subscription.dispose(); }
});
connection.onCodeAction(async (params, token) => {
  if (params.context.only && !params.context.only.some(kind => 'refactor.rewrite'.startsWith(kind))) return [];
  const current = await snapshot(params.textDocument.uri); if (!current?.state.project) return [];
  const text = current.document.getText();
  const context = enumCaseContext(text, current.document.offsetAt(params.range.start));
  if (!context || token.isCancellationRequested) return [];
  const abort = new AbortController();
  const subscription = token.onCancellationRequested(() => abort.abort());
  const signal = current.state.abort ? AbortSignal.any([abort.signal, current.state.abort.signal]) : abort.signal;
  try {
    const symbols = await complete(current,{file:current.file,offset:context.expressionOffset},signal);
    if (signal.aborted || current.generation !== current.state.generation) return [];
    const values = symbols.find(s=>s.name === context.expression && s.kind === 'variable')?.enumValues;
    if (!values) return [];
    // Infer indentation from the enclosing body; honor tabs/CRLF. Four spaces is the fallback.
    const indents = text.split(/\r?\n/).map(line=>/^[\t ]*/.exec(line)![0]).filter(i=>i.length > context.base.length && i.startsWith(context.base));
    const unit = indents.sort((a,b)=>a.length-b.length)[0]?.slice(context.base.length) ?? (context.base.includes('\t') ? '\t' : '    ');
    const edit = planEnumCase(text,context,values,unit,text.includes('\r\n') ? '\r\n' : '\n');
    if (!edit) return [];
    const position = current.document.positionAt(edit.offset);
    return [{title:'Generate enum case branches',kind:'refactor.rewrite',edit:{documentChanges:[{textDocument:{uri:current.document.uri,version:current.document.version},edits:[{range:{start:position,end:position},newText:edit.text}]}]}}];
  } catch (error) { if (!signal.aborted) connection.console.error(`Enum case: ${String(error)}`); return []; }
  finally { subscription.dispose(); }
});
connection.onSignatureHelp(async (params, token) => {
  const current = await snapshot(params.textDocument.uri); if (!current) return;
  const offset = current.document.offsetAt(params.position);
  let signature = parameterSignature(current.analysis, current.file, current.document.getText(), offset) ?? portSignature(current.analysis, current.file, current.document.getText(), offset);
  if (!signature && current.state.project) {
    const context = callableContext(current.document.getText(), offset);
    if (context && !token.isCancellationRequested) {
      const abort = new AbortController();
      const subscription = token.onCancellationRequested(() => abort.abort());
      const signal = current.state.abort ? AbortSignal.any([abort.signal, current.state.abort.signal]) : abort.signal;
      try {
        const symbols = await complete(current, { file: current.file, offset: context.start, qualifier: context.qualifier }, signal);
        if (signal.aborted || current.generation !== current.state.generation) return;
        const symbol = symbols.find(s => s.name === context.name && s.callable);
        if (symbol) signature = callableSignature(symbol, context);
      } catch (error) { if (!signal.aborted) connection.console.error(`Signature help: ${String(error)}`); }
      finally { subscription.dispose(); }
    }
  }
  if (!signature) return;
  return { signatures: [{ label: signature.label, parameters: signature.parameters.map(label => ({ label })) }], activeSignature: 0, activeParameter: signature.parameters.length ? signature.activeParameter : undefined };
});
connection.onHover(async params => {
  const current = await snapshot(params.textDocument.uri); if (!current) return;
  const symbol = symbolAt(current.analysis, current.file, current.document.getText(), current.document.offsetAt(params.position));
  if (!symbol) return;
  const body = symbol.label + (symbol.ports ? ` (\n${symbol.ports.map(p => `  ${p.direction} ${p.type} ${p.name}`).join(',\n')}\n)` : '');
  return { contents: { kind: 'markdown', value: '```systemverilog\n' + body + '\n```' } };
});
connection.onDefinition(async params => {
  const current = await snapshot(params.textDocument.uri); if (!current) return;
  const symbol = symbolAt(current.analysis, current.file, current.document.getText(), current.document.offsetAt(params.position));
  if (!symbol?.location.file) return;
  const start = { line: symbol.location.line, character: symbol.location.character };
  return { uri: pathToFileURL(symbol.location.file).href, range: { start, end: start } };
});
async function drain(): Promise<void> {
  stopping = true;
  for (const state of states.values()) { state.abort?.abort(); clearTimeout(state.timer); }
  const closed = await Promise.allSettled([work.close(), watches.close(), ...[...sessions].map(session => session.close(true)), ...[...states.values()].map(state => state.retired)]);
  for (const result of closed) if (result.status === 'rejected') throw result.reason;
}
connection.onRequest('rtl/prepareShutdown', async () => { await drain(); return { ready: true }; });
connection.onShutdown(drain);
documents.listen(connection); connection.listen();
