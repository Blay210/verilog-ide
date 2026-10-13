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

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
interface State { root: string; generation: number; manifestMissing?: boolean; project?: Project; inputProject?: Project; watchPaths?: ProjectWatchPaths; inputs?: AnalysisInputs; abort?: AbortController; timer?: NodeJS.Timeout; pending?: Promise<void>; analysis?: Analysis; published: Set<string>; status?: string; detail?: string }
const states = new Map<string, State>();
const work = new SemanticWork();
let provider: SlangProvider;
let stopping = false;
let dynamicWatches = false;
let workspaceFoldersSupported = false;
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
  provider = new SlangProvider(options.python, options.bridge, options.cache);
  for (const folder of params.workspaceFolders ?? (params.rootUri ? [{ uri: params.rootUri }] : [])) addRoot(folder.uri);
  return { capabilities: { textDocumentSync: TextDocumentSyncKind.Full, completionProvider: { triggerCharacters: ['.', ':', '('] }, signatureHelpProvider: { triggerCharacters: ['(', ','], retriggerCharacters: [')'] }, codeActionProvider: { codeActionKinds: ['refactor.rewrite'] }, hoverProvider: true, definitionProvider: true, semanticTokensProvider: { legend: { tokenTypes: ['class'], tokenModifiers: ['declaration'] }, full: true }, workspace: { workspaceFolders: { supported: true, changeNotifications: true } } } };
});
function clear(state: State) {
  for (const uri of state.published) connection.sendDiagnostics({ uri, diagnostics: [] });
  state.published.clear(); state.analysis = undefined; state.project = undefined;
}
function schedule(state: State) {
  if (stopping) return;
  state.status = "Analyzing"; state.detail = "Waiting for current source analysis.";
  state.generation++; state.abort?.abort(); state.abort = new AbortController(); clearTimeout(state.timer); clear(state);
  state.timer = setTimeout(() => { state.timer = undefined; void analyze(state); }, 250);
}
async function analyze(state: State): Promise<void> {
  const generation = state.generation;
  const abort = state.abort!;
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
        let result = await provider.analyze(project, overlays(), signal);
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
          result = await provider.analyze(project, overlays(), signal);
          signal.throwIfAborted(); state.inputs = result.inputs;
        }
        signal.throwIfAborted();
        return { project, result };
      });
      if (generation !== state.generation || abort.signal.aborted) return;
      state.status = result.diagnostics.some(d => d.severity === "error") ? "Source errors" : "Ready";
      state.detail = "Analysis completed. See Problems for source diagnostics.";
      state.analysis = result;
      state.project = project;
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
    } catch (error) {
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
const changedDocument = (uri: string) => {
  if (!uri.startsWith('file:')) return;
  const file = fileURLToPath(uri);
  for (const state of states.values()) if (inputEvent(state, file)) schedule(state);
};
const documentChanged = (document: TextDocument) => {
  if (document.uri.startsWith('file:') && (['verilog', 'systemverilog'].includes(document.languageId) || tracked(fileURLToPath(document.uri)))) changedDocument(document.uri);
};
documents.onDidChangeContent(event => documentChanged(event.document));
documents.onDidClose(event => documentChanged(event.document));
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
  if (state.timer) { clearTimeout(state.timer); state.timer = undefined; await analyze(state); }
  else if (!state.pending && state.status === 'Analysis busy') await analyze(state);
  else await state.pending;
  if (generation !== state.generation || documents.get(uri)?.version !== document.version) return;
  return { document, file, analysis: state.analysis ?? empty, state, generation };
}
function complete(current: NonNullable<Awaited<ReturnType<typeof snapshot>>>, query: { file: string; offset: number; qualifier?: string }, signal: AbortSignal) {
  // No settled-result cache: external file changes retain the existing watcher
  // invalidation contract. Both generation and exact query bind a shared job.
  return work.run(`query:${current.state.root}:${current.generation}:${JSON.stringify(query)}`, signal, async shared => {
    shared.throwIfAborted();
    return provider.complete(current.state.project!, overlays(), query, shared);
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
connection.languages.semanticTokens.on(async (params, token) => {
  const current = await snapshot(params.textDocument.uri);
  const builder = new SemanticTokensBuilder();
  if (!current || token.isCancellationRequested) return builder.build();
  for (const entry of moduleHighlights(current.analysis, current.file, current.document.getText())) {
    const position = current.document.positionAt(entry.start);
    builder.push(position.line, position.character, entry.length, 0, entry.declaration ? 1 : 0);
  }
  return builder.build();
});
connection.onCompletion(async (params, token) => {
  const current = await snapshot(params.textDocument.uri); if (!current) return [];
  const offset = current.document.offsetAt(params.position);
  const targetPort = connectionPort(current.analysis, current.file, current.document.getText(), offset);
  if (params.context?.triggerCharacter === '(' && !targetPort) return [];
  const result = portCompletions(current.analysis, current.file, current.document.getText(), offset);
  if (result.ports.length) return result.ports.map(port => ({ label: port.name, kind: CompletionItemKind.Field, detail: `${port.direction} ${port.type}`, textEdit: { range: { start: current.document.positionAt(result.start), end: current.document.positionAt(result.end) }, newText: port.name } }));
  const context = symbolCompletionContext(current.document.getText(), offset);
  if (!context || !current.state.project || token.isCancellationRequested) return [];
  const abort = new AbortController();
  const subscription = token.onCancellationRequested(() => abort.abort());
  const signal = current.state.abort ? AbortSignal.any([abort.signal, current.state.abort.signal]) : abort.signal;
  try {
    const symbols = await complete(current, { file: current.file, offset, qualifier: context.qualifier }, signal);
    if (signal.aborted || current.generation !== current.state.generation) return [];
    const kinds: Record<SemanticSymbol['kind'], CompletionItemKind> = { variable: CompletionItemKind.Variable, constant: CompletionItemKind.Constant, type: CompletionItemKind.Class, function: CompletionItemKind.Function, module: CompletionItemKind.Module, package: CompletionItemKind.Module };
    return symbols.filter(s => s.name.startsWith(context.prefix) && (!targetPort || s.kind !== 'module')).map(symbol => {
      const rank = connectionRank(targetPort, symbol);
      return { label: symbol.name, kind: kinds[symbol.kind], detail: symbol.detail + (rank.reason ? ` · ${rank.reason}` : ''), sortText: targetPort ? rank.sortText : '0_' + symbol.name, textEdit: { range: { start: current.document.positionAt(context.start), end: current.document.positionAt(context.end) }, newText: symbol.name } };
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
  const closed = await Promise.allSettled([work.close(), watches.close()]);
  for (const result of closed) if (result.status === 'rejected') throw result.reason;
}
connection.onRequest('rtl/prepareShutdown', async () => { await drain(); return { ready: true }; });
connection.onShutdown(drain);
documents.listen(connection); connection.listen();
