import * as vscode from 'vscode';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { loadProject, loadRecordedInputs, type TestResult } from '@rtl-dev/core';
import { SlangProvider, type DesignHierarchy, type HierarchyNode, type SourcePoint, type InternalGraph } from '@rtl-dev/semantic';
import { detectSemanticRuntime, toolsHome } from '@rtl-dev/toolchain';
import { renderStructure, renderStructureWelcome } from './structure-view';
import { StructureNavigation } from './structure-navigation';
import { mapTracePorts, mapTraceInternalSignals, formatValue, formatTime, parseTime, type TracePortBinding } from '@rtl-dev/waveform';
import { RecordedTraceLinks, type RecordedTraceView } from './trace-links';

export function registerStructure(context: vscode.ExtensionContext, traces = new RecordedTraceLinks(context.asAbsolutePath('dist/waveform-worker.cjs'))): void {
  const changes = new vscode.EventEmitter<void>();
  type Selection = { root: string; test?: string; recorded?: TestResult };
  let design: DesignHierarchy | undefined, selected: Selection | undefined;
  let stale = false, generation = 0, active: AbortController | undefined, panel: vscode.WebviewPanel | undefined;
  let snapshot = '', rendered: ReturnType<typeof renderStructure> | undefined;
  let displayContext: { project: string; root: string; test?: string; top?: string; mode: 'current' | 'recorded'; runId?: string; startedAt?: string } | undefined;
  const navigation = new StructureNavigation();
  let disposed = false;
  let operations: InternalGraph | undefined, operationsAbort: AbortController | undefined, operationsJob = 0;
  let viewMode: 'schematic' | 'connections' | 'operations' = 'schematic', modeNotice = '';
  function clearOperations() { cancelClock(); operationsJob++; operationsAbort?.abort(); operationsAbort = undefined; operations = undefined; internalBindings = []; valueJob++; observed = {}; }
  const byId = new Map<string, HierarchyNode>();
  let trace: RecordedTraceView | undefined, traceReason = 'No recorded trace selected.', valueJob = 0;
  let bindings: TracePortBinding[] = [], observed: Record<string, { text: string; reason?: string }> = {};
  let internalBindings: TracePortBinding[] = [];
  let clockId: string | undefined, clockEdge: 'rising' | 'falling' = 'rising', clockJob = 0, clockAbort: AbortController | undefined;
  function cancelClock() { clockJob++; clockAbort?.abort(); clockAbort = undefined; }
  function clearTrace() { cancelClock(); clockId = undefined; valueJob++; trace?.dispose(); trace = undefined; bindings = []; observed = {}; }
  const clocks = () => trace?.metadata.signals.filter(s => s.width === 1 && ['wire','reg','logic','bit'].includes(s.type)) ?? [];
  async function chooseClock(id?: string) {
    if (stale || trace?.read().state !== 'ready') throw Error('Choose a verified recorded structure first.');
    const reader = trace, current = generation, page = snapshot;
    const candidates = clocks();
    if (!candidates.length) throw Error('No recorded one-bit integral signals. Dump a clock signal and run the test again.');
    const picked = id === undefined ? await vscode.window.showQuickPick(candidates.map(s => ({label:s.path, description:'Recorded one-bit signal', id:s.id})), {title:'Choose the recorded clock explicitly'}) : candidates.find(s => s.id === id);
    if (!picked || reader !== trace || current !== generation || page !== snapshot || stale || reader.read().state !== 'ready') return;
    cancelClock(); clockId = picked.id; render(); await updateValues(); return clockId;
  }
  async function moveClock(direction: -1 | 1, edge = clockEdge) {
    if (![-1,1].includes(direction) || !['rising','falling'].includes(edge)) throw Error('Invalid clock navigation.');
    const reader = trace, signal = clocks().find(s => s.id === clockId);
    if (stale || !reader || reader.read().state !== 'ready' || !signal) throw Error('Choose a verified recorded clock first.');
    cancelClock(); clockEdge = edge;
    const job = clockJob, current = generation, page = snapshot, state = reader.read(), abort = new AbortController(); clockAbort = abort;
    const valid = () => !disposed && !stale && !abort.signal.aborted && job === clockJob && current === generation && page === snapshot && reader === trace && reader.read().state === 'ready' && reader.read().revision === state.revision;
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; abort.abort(); }, 15000);
    try {
      const result = await vscode.window.withProgress({location:vscode.ProgressLocation.Notification,title:'Finding recorded clock edge',cancellable:true}, async (_, token) => {
        const subscription = token.onCancellationRequested(() => abort.abort());
        try {
          let offset: number | undefined;
          do {
            if (!valid()) return;
            // Cancellation must settle even while one worker page is pending.
            // Keep the shared reader alive; a late page may finish but cannot
            // change the cursor after this request has been cancelled.
            let cancelled: (() => void) | undefined;
            const cancellation = new Promise<void>(resolve => {
              cancelled = () => resolve(); abort.signal.addEventListener('abort', cancelled, {once:true});
              if (abort.signal.aborted) resolve();
            });
            let result;
            try { result = await Promise.race([reader.session.clockEdgePage({signal:signal.id,time:state.time,direction,edge,offset}), cancellation]); }
            finally { if (cancelled) abort.signal.removeEventListener('abort', cancelled); }
            if (!valid()) return;
            if (!result) return;
            if (result.time !== undefined) return result.time;
            offset = result.next;
          } while (offset !== undefined);
        } finally { subscription.dispose(); }
      });
      if (!valid()) return;
      if (result === undefined) { void vscode.window.showInformationMessage(`No ${direction === 1 ? 'later' : 'earlier'} recorded ${edge} edge. X/Z transitions are excluded.`); return; }
      reader.set(result); await updateValues(); return result;
    } finally {
      clearTimeout(timer); if (clockAbort === abort) clockAbort = undefined;
      if (timedOut && !disposed && !stale && job === clockJob && current === generation && page === snapshot && reader === trace && reader.read().revision === state.revision)
        void vscode.window.showInformationMessage('Recorded clock search timed out. Retry or choose another signal.');
    }
  }
  function presentation() {
    const state = trace?.read();
    return { state: !stale && state?.state === 'ready' ? 'ready' as const : 'unavailable' as const,
      time: trace ? formatTime(BigInt(state!.time), trace.metadata.timescale) : '0',
      end: trace ? formatTime(BigInt(trace.metadata.end), trace.metadata.timescale) : '0', reason: state?.reason ?? traceReason };
  }
  async function updateValues() {
    const job = ++valueJob, current = generation, page = snapshot, reader = trace, visible = rendered?.ports;
    if (!panel || !visible || displayContext?.mode !== 'recorded') return;
    const state = reader?.read(), values: typeof observed = {}, matched = new Map<string, TracePortBinding>();
    const index = new Map((operations ? internalBindings : bindings).map(binding => [JSON.stringify([binding.instanceId, binding.port]), binding]));
    for (const [id, port] of visible) {
      const binding = index.get(JSON.stringify([port.instanceId, port.port]));
      if (stale || state?.state !== 'ready') values[id] = { text: 'Unavailable', reason: state?.reason ?? traceReason };
      else if (binding?.state === 'matched') { matched.set(id, binding); values[id] = { text: '…' }; }
      else values[id] = { text: ({ missing: 'Not recorded', ambiguous: 'Ambiguous path', 'width-mismatch': 'Width mismatch', unsupported: 'Unsupported type' } as Record<string, string>)[binding?.state ?? 'missing'], reason: binding?.reason ?? 'Signal was not recorded.' };
    }
    const post = () => {
      if (disposed || job !== valueJob || current !== generation || page !== snapshot || reader !== trace) return;
      observed = values;
      const info = presentation();
      void panel?.webview.postMessage({ kind: 'traceValues', snapshot: page, revision: job, time: info.time, unavailable: info.state !== 'ready',
        status: info.state === 'ready' ? `Values at ${info.time} · End ${info.end} · Shared with waveform cursor` : info.reason, values });
    };
    post(); if (!reader || stale || state?.state !== 'ready') return;
    try {
      const ids = [...new Set([...matched.values()].map(binding => binding.signalId!))], raw = new Map<string, string>();
      for (let start = 0; start < ids.length; start += 32) {
        const result = await reader.values({ signals: ids.slice(start, start + 32), cursor: state.time });
        if (job !== valueJob || current !== generation || page !== snapshot || reader !== trace || reader.read().revision !== state.revision) return;
        result.rows.forEach(row => raw.set(row.id, row.value));
      }
      for (const [id, binding] of matched) { const value = raw.get(binding.signalId!); values[id] = { text: value === undefined ? 'Unavailable' : formatValue(value, 'hex'), reason: value }; }
      post();
    } catch (error) { if (reader === trace && job === valueJob) { traceReason = String(error); reader.invalidate(traceReason); } }
  }
  const tree = vscode.window.createTreeView('rtl.hierarchy', { treeDataProvider: {
    onDidChangeTreeData: changes.event,
    getChildren: (node?: HierarchyNode) => node?.children ?? design?.roots ?? [],
    getParent: (node: HierarchyNode) => navigation.parent(node.id),
    getTreeItem: (node: HierarchyNode) => {
      const item = new vscode.TreeItem(node.name, node.children.length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
      item.id = node.id; item.description = node.module ?? node.kind; item.contextValue = 'rtlHierarchyNode';
      item.tooltip = `${node.id}\n${node.parameters.map(p => `${p.name} = ${p.value}`).join('\n')}`;
      item.iconPath = new vscode.ThemeIcon(node.kind === 'instance' ? 'symbol-module' : 'symbol-array');
      item.command = { command: 'rtl.inspectStructure', title: 'Show connections', arguments: [node.id] };
      return item;
    }
  } });
  const report = (error: unknown) => { void vscode.window.showErrorMessage(`RTL structure: ${String(error)}`); };
  const index = (nodes: HierarchyNode[]) => { for (const n of nodes) { byId.set(n.id, n); index(n.children); } };
  function render() {
    const state = navigation.state();
    for (const [key, enabled] of Object.entries({ Ready: !stale && !!state.current, CanBack: !stale && state.canBack, CanForward: !stale && state.canForward, CanUp: !stale && !!state.parent })) {
      void vscode.commands.executeCommand('setContext', `rtl.structure${key}`, enabled);
    }
    const node = state.current ? byId.get(state.current) : undefined;
    if (!panel) return;
    if (!node) {
      snapshot = randomBytes(16).toString('hex'); rendered = undefined;
      panel.webview.html = renderStructureWelcome(snapshot);
      return;
    }
    valueJob++; snapshot = randomBytes(16).toString('hex'); rendered = renderStructure(node, snapshot, stale, displayContext ? { navigation: state, context: displayContext, trace: displayContext.mode === 'recorded' ? presentation() : undefined, clock: {name:clocks().find(s => s.id === clockId)?.path, edge:clockEdge}, operations, viewMode, modeNotice } : undefined);
    panel.title = `${displayContext?.mode === 'recorded' ? 'Recorded' : 'Current'} RTL Structure · ${node.name}`;
    panel.webview.html = rendered.html;
  }
  function invalidate() {
    if (!selected) return;
    const previous = displayContext?.mode === 'current' ? operations : undefined;
    generation++; active?.abort(); clearOperations(); operations = previous; modeNotice = ''; stale = true;
    trace?.invalidate('Recorded inputs changed — refresh before observing values.');
    tree.message = 'Sources changed — choose Update. Last analysis is retained.'; render(); changes.fire();
  }
  async function navigate(point?: SourcePoint) {
    if (stale) throw Error('Refresh the structure before opening a source location.');
    if (!point?.file) return;
    if (selected?.recorded) {
      const current = generation, recorded = selected.recorded;
      await loadRecordedInputs(recorded);
      if (current !== generation || stale || disposed) return;
      return vscode.commands.executeCommand('rtl.openRecordedSource', recorded, point.file, { line: point.line, character: point.character });
    }
    const position = new vscode.Position(point.line, point.character);
    await vscode.window.showTextDocument(vscode.Uri.file(point.file), { selection: new vscode.Range(position, position) });
  }
  async function inspect(id: string) {
    if (stale) throw Error('Refresh the structure before navigating.');
    if (!byId.has(id)) throw Error('Select an instance in the current hierarchy.');
    clearOperations();
    navigation.visit(id);
    ensurePanel();
    render(); panel!.reveal(undefined, true);
    if (tree.reveal) void Promise.resolve(tree.reveal(byId.get(id)!, { select: true, focus: false })).catch(() => {});
    await applyMode();
  }
  function ensurePanel() {
    if (!panel) {
      panel = vscode.window.createWebviewPanel('rtl.structure', 'RTL Structure', vscode.ViewColumn.Active, { enableScripts: true, localResourceRoots: [] });
      panel.onDidDispose(() => { const previous = displayContext?.mode==='current' ? operations : undefined; if(operationsAbort)modeNotice='Module analysis closed. Choose Update to retry.'; clearOperations(); operations=previous; if (active) { generation++; active.abort(); stale = true; } panel = undefined; rendered = undefined; snapshot = ''; clearTrace(); traceReason = 'Refresh structure to reconnect recorded values.'; }, undefined, context.subscriptions);
      panel.webview.onDidReceiveMessage(async message => {
        if (!message || message.snapshot !== snapshot) return;
        try {
          if (message.action === 'refresh') await refresh();
          else if (message.action === 'operations') await setMode('operations');
          else if (message.action === 'schematic') await setMode('schematic');
          else if (message.action === 'connections') await setMode('connections');
          else if (message.action === 'viewMode') await setMode(message.id);
          else if (message.action === 'context') await choose();
          else if (message.action === 'source' && typeof message.id === 'string') await navigate(rendered?.links.get(message.id));
          else if (message.action === 'node' && typeof message.id === 'string' && !stale && rendered?.nodes.has(message.id)) await inspect(message.id);
          else if (['back', 'forward', 'up'].includes(message.action)) await move(message.action);
          else if (message.action === 'traceClock') await chooseClock();
          else if (message.action === 'tracePrevious' || message.action === 'traceNext') await moveClock(message.action === 'traceNext' ? 1 : -1, message.id);
          else if (message.action === 'traceReady') await updateValues();
          else if (message.action === 'traceTime' && !stale && trace && typeof message.id === 'string') { trace.set(String(parseTime(message.id, trace.metadata.timescale))); await updateValues(); }
          else if (message.action === 'traceWave' && !stale && trace?.read().state === 'ready') await vscode.commands.executeCommand('vscode.openWith', vscode.Uri.file(trace.result.waveform!), 'rtl.waveform');
        } catch (error) { report(error); }
      }, undefined, context.subscriptions);
    }
  }
  function openWorkspace() {
    const existing = !!panel;
    ensurePanel();
    if (!existing) render();
    panel!.reveal(undefined, true);
  }
  async function move(action: 'back' | 'forward' | 'up') {
    if (stale) throw Error('Refresh the structure before navigating.');
    navigation[action]();
    if (navigation.current) await inspect(navigation.current);
  }
  async function setMode(mode: string) {
    if(!['schematic','connections','operations'].includes(mode)) throw Error('Unknown structure view.');
    if(stale) throw Error('Update the structure before changing its view.');
    viewMode = mode as typeof viewMode; await applyMode();
  }
  async function applyMode() {
    modeNotice = '';
    if(viewMode==='connections' || byId.get(navigation.current!)?.kind!=='instance') {
      clearOperations(); render(); await updateValues(); return;
    }
    await showOperations(viewMode==='schematic',viewMode==='schematic');
  }
  async function showOperations(scope = false, fallback = false) {
    if (stale || !selected || !navigation.current || !panel) throw Error('Refresh and select an instance first.');
    clearOperations();
    modeNotice = 'Reading module structure…'; render();
    const job = operationsJob, current = generation, selection = selected, id = navigation.current;
    const abort = new AbortController(); operationsAbort = abort;
    try {
      const graph = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Reading internal RTL operations', cancellable: true }, async (_, token) => {
        const subscription = token.onCancellationRequested(() => abort.abort());
        try {
          const python = await detectSemanticRuntime({ signal: abort.signal });
          if (!python) throw Error('Set up RTL language support first.');
          const saved = selection.recorded ? await loadRecordedInputs(selection.recorded) : undefined;
          const project = saved?.project ?? await loadProject(selection.root);
          const overlays = saved ? [] : vscode.workspace.textDocuments.filter(d => d.uri.scheme === 'file' && ['verilog', 'systemverilog'].includes(d.languageId)).map(d => ({ file: d.uri.fsPath, text: d.getText() }));
          const provider = new SlangProvider(python, context.asAbsolutePath('dist/analyze.py'), path.join(toolsHome(), 'cache', 'semantic'));
          const result = await (scope ? provider.scopeOperations(project, saved?.target.name ?? selection.test, id, overlays, abort.signal) : provider.internalOperations(project, saved?.target.name ?? selection.test, id, overlays, abort.signal));
          if (selection.recorded) await loadRecordedInputs(selection.recorded);
          return result;
        } finally { subscription.dispose(); }
      });
      if (disposed || abort.signal.aborted || stale || job !== operationsJob || current !== generation || id !== navigation.current || selection !== selected || !panel) return;
      if (graph.instanceId !== id) throw Error('Internal graph does not belong to the selected instance.');
      internalBindings = selection.recorded && trace && design ? mapTraceInternalSignals(design, graph, trace.metadata.signals, selection.recorded.top) : [];
      modeNotice = fallback && graph.status==='unsupported' ? `Showing connections: ${graph.reason}` : '';
      operations = fallback && graph.status==='unsupported' ? undefined : graph; render(); await updateValues();
      return graph;
    } catch (error) {
      if(!abort.signal.aborted && job===operationsJob && current===generation && id===navigation.current && selection===selected && panel) {
        modeNotice = `Could not read module logic: ${String(error)}. Choose Update to retry.`; render();
        if(!fallback) throw error;
      }
    }
    finally {
      if(abort.signal.aborted && job===operationsJob && current===generation && id===navigation.current && selection===selected && panel && !stale) { modeNotice='Module analysis cancelled. Choose Update to retry.'; render(); }
      if (operationsAbort === abort) operationsAbort = undefined;
    }
  }
  async function refresh(selection?: Selection): Promise<DesignHierarchy | undefined> {
    clearOperations();
    if (!vscode.workspace.isTrusted) throw Error('Trust this workspace before elaborating RTL.');
    if (selection) selected = selection;
    if (!selected) return choose();
    const request = { ...selected };
    if (!request.recorded && vscode.workspace.textDocuments.some(d => d.isDirty && d.uri.fsPath === path.join(request.root, 'rtl.toml'))) throw Error('Save rtl.toml before refreshing structure. Unsaved RTL edits are included.');
    const current = ++generation; active?.abort(); const abort = new AbortController(); active = abort;
    clearTrace(); traceReason = 'Reading recorded trace…';
    stale = true; tree.message = 'Elaborating structure…'; render();
    try {
      const recorded = request.recorded ? await loadRecordedInputs(request.recorded, abort.signal) : undefined;
      const project = recorded?.project ?? await loadProject(request.root);
      let python = await detectSemanticRuntime();
      if (abort.signal.aborted) return;
      if (!python) { await vscode.commands.executeCommand('rtl.setupLanguage'); python = await detectSemanticRuntime(); }
      if (!python) throw Error('Set up RTL language support to explore the design.');
      const provider = new SlangProvider(python, context.asAbsolutePath('dist/analyze.py'), path.join(toolsHome(), 'cache', 'semantic'));
      const overlays = recorded ? [] : vscode.workspace.textDocuments.filter(d => d.uri.scheme === 'file').map(d => ({ file: d.uri.fsPath, text: d.getText() }));
      const result = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Reading RTL structure', cancellable: true }, async (_, token) => {
        const subscription = token.onCancellationRequested(() => abort.abort());
        try { return await provider.hierarchy(project, request.test, overlays, abort.signal); }
        finally { subscription.dispose(); }
      });
      if (request.recorded && !abort.signal.aborted) await loadRecordedInputs(request.recorded, abort.signal);
      if (current !== generation || abort.signal.aborted || disposed) return;
      if (request.recorded && result.roots.length && !result.diagnostics.some(d => d.severity === 'error')) {
        let prepared: RecordedTraceView | undefined;
        try {
          prepared = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Reading recorded values', cancellable: true }, async (_, token) => {
            const subscription = token.onCancellationRequested(() => abort.abort());
            try { return await traces.open(request.recorded!, abort.signal); } finally { subscription.dispose(); }
          });
          if (current !== generation || abort.signal.aborted || disposed) { prepared.dispose(); return; }
          bindings = mapTracePorts(result, prepared.metadata.signals, request.recorded.top);
          trace = prepared;
          trace.subscribe(() => { void updateValues(); });
        } catch (error) { prepared?.dispose(); traceReason = String(error); if (abort.signal.aborted) throw error; }
      }
      if (current !== generation || abort.signal.aborted || disposed) return;
      const rootKey = path.resolve(project.root);
      navigation.update(result.roots, JSON.stringify([recorded ? 'recorded' : 'current', process.platform === 'win32' ? rootKey.toLowerCase() : rootKey, recorded?.runId ?? request.test ?? null]));
      design = result; stale = false; byId.clear(); index(result.roots);
      displayContext = { project: project.name, root: request.root, test: request.test, top: project.tests.find(test => test.name === request.test)?.top,
        mode: recorded ? 'recorded' : 'current', runId: recorded?.runId, startedAt: request.recorded?.startedAt };
      const errors = result.diagnostics.filter(d => d.severity === 'error');
      tree.message = errors.length ? `Cannot elaborate: ${errors[0].message}` : `${recorded ? `Recorded run ${recorded.runId}` : 'Current design'} · ${project.name} · ${request.test ?? 'Design roots'} · ${byId.size} nodes`;
      changes.fire();
      if (!result.roots.length) { panel?.dispose(); render(); if (errors.length) report(errors.map(e => e.message).slice(0, 3).join('\n')); }
      else await inspect(navigation.current!);
      await updateValues();
      return result;
    } catch (error) {
      if (current === generation) { tree.message = abort.signal.aborted ? 'Cancelled — refresh structure.' : 'Could not read structure — refresh to retry.'; stale = true; render(); }
      if (!abort.signal.aborted) throw error;
    } finally { if (active === abort) active = undefined; }
  }
  async function choose(test?: string): Promise<DesignHierarchy | undefined> {
    if (!vscode.workspace.isTrusted) throw Error('Trust this workspace before elaborating RTL.');
    const folders = vscode.workspace.workspaceFolders ?? [];
    const folder = folders.length === 1 ? folders[0] : await vscode.window.showWorkspaceFolderPick();
    if (!folder) return;
    const project = await loadProject(folder.uri.fsPath);
    if (test && !project.tests.some(t => t.name === test)) throw Error(`Unknown test: ${test}`);
    if (!test && project.tests.length) {
      const picked = await vscode.window.showQuickPick(project.tests.map(t => ({ label: t.name, description: t.top })), { title: 'Choose the test context for RTL structure' });
      if (!picked) return; test = picked.label;
    }
    return refresh({ root: project.root, test });
  }
  const command = (id: string, action: (...args: any[]) => unknown) => context.subscriptions.push(vscode.commands.registerCommand(id, (...args) => Promise.resolve().then(() => action(...args)).catch(report)));
  command('rtl.showStructure', choose);
  command('rtl.openStructureWorkspace', async () => {
    await vscode.commands.executeCommand('workbench.view.extension.rtl-structure');
    openWorkspace();
  });
  command('rtl.showRecordedStructure', (result: TestResult) => refresh({ root: path.dirname(path.dirname(path.dirname(result.directory))), test: result.name,
    recorded: JSON.parse(JSON.stringify(result)) as TestResult }));
  command('rtl.refreshStructure', () => refresh());
  command('rtl.showInternalOperations', () => setMode('operations'));
  command('rtl.showScopeOperations', () => setMode('schematic'));
  command('rtl.showStructureConnections', () => setMode('connections'));
  command('rtl.openInternalOperationSource', (id: string) => navigate(operations?.nodes.find(node => node.id === id)?.source));
  command('rtl.inspectStructure', (id: string) => inspect(id));
  command('rtl.structureBack', () => move('back'));
  command('rtl.structureForward', () => move('forward'));
  command('rtl.structureUp', () => move('up'));
  command('rtl.openStructureSource', (value: HierarchyNode | string, definition = false) => { const node = byId.get(typeof value === 'string' ? value : value.id); return navigate(definition ? node?.definition : node?.location); });
  command('rtl.openStructureDefinition', (value: HierarchyNode | string) => { const node = byId.get(typeof value === 'string' ? value : value.id); return navigate(node?.definition); });
  command('rtl.chooseStructureClock', chooseClock);
  command('rtl.moveStructureClock', moveClock);
  command('rtl.cancelStructureClock', cancelClock);
  command('rtl.setStructureTime', async (time: string) => { if (stale || !trace) throw Error('Choose a verified recorded structure first.'); trace.set(time); await updateValues(); });
  command('rtl.getStructure', () => ({ design, stale, selected, panelOpen: !!panel, viewMode, modeNotice, inspected: navigation.current, navigation: navigation.state(), context: displayContext, operations,
    trace: displayContext?.mode === 'recorded' ? { ...presentation(), runId: trace?.result.runId, cursor: trace?.read().time, clockId, clockEdge, bindings: operations ? internalBindings : bindings, values: observed } : undefined }));
  const watcher = vscode.workspace.createFileSystemWatcher('**/*');
  const changed = (uri: vscode.Uri) => {
    if (uri.scheme !== 'file') return;
    traces.changed(uri.fsPath);
    if (selected?.recorded) {
      const normalize = (file: string) => process.platform === 'win32' ? path.resolve(file).toLowerCase() : path.resolve(file);
      const file = normalize(uri.fsPath), directory = normalize(selected.recorded.directory);
      if (file === path.join(directory, 'input-snapshot.json') || file.startsWith(path.join(directory, 'inputs') + path.sep)) invalidate();
    } else if (/\.(sv|v|svh|vh|toml)$/i.test(uri.fsPath) && !uri.fsPath.split(path.sep).includes('.rtl')) invalidate();
  };
  context.subscriptions.push(changes, tree, tree.onDidChangeVisibility(event => { if (event.visible && !disposed) openWorkspace(); }), watcher, watcher.onDidCreate(changed), watcher.onDidChange(changed), watcher.onDidDelete(changed),
    vscode.workspace.onDidChangeTextDocument(event => changed(event.document.uri)), vscode.workspace.onDidCloseTextDocument(document => changed(document.uri)),
    vscode.workspace.onDidChangeWorkspaceFolders(() => { if (!selected?.recorded) invalidate(); }), { dispose: () => { disposed = true; active?.abort(); clearOperations(); clearTrace(); panel?.dispose(); } });
  render();
}
