import * as vscode from 'vscode';
import path from 'node:path';
import { configureToolsHome, toolsHome } from '../../runtime/toolchain/detect';
import { detectSemanticRuntime } from '../../runtime/semantic-runtime';
import { registerLanguageStatus, type LanguageStatus } from './language-status';
import type { LanguageClient } from 'vscode-languageclient/node';
import { LatestTask } from './latest-task';
import { SemanticProcess, LanguageCleanupFailure, deadline } from './semantic-process';

/** Thin owned adapter. Compiler/provider stays separate from editor and simulator. */
export function registerSemantic(context: vscode.ExtensionContext): () => Promise<void> {
  const output = vscode.window.createOutputChannel('RTL Language');
  let client: LanguageClient | undefined;
  let disposed = false;
  let server: SemanticProcess | undefined;
  let ready = false;
  let status: LanguageStatus = { label: 'Starting', detail: 'Checking existing language tools.' };
  const enabled = () => vscode.workspace.isTrusted && vscode.workspace.getConfiguration('rtl').get('editor.semantic', true);
  registerLanguageStatus(context, async uri => {
    if (!vscode.workspace.isTrusted) return { label: 'Trust required', detail: 'Semantic analysis executes an external compiler. Basic editing remains available.' };
    if (!vscode.workspace.getConfiguration('rtl').get('editor.semantic', true)) return { label: 'Disabled', detail: 'Basic editing remains available.' };
    const target = client;
    if (!ready || !target?.isRunning() || !uri) return status;
    try {
      const result = await target.sendRequest<LanguageStatus>('rtl/languageStatus', { uri });
      return target === client && ready ? result : status;
    } catch (error) { return target === client && ready ? { label: 'Connection failed', detail: String(error) } : status; }
  }, () => output.show());
  const log = (text: string) => { if (!disposed) output.appendLine(text); };
  const queue = new LatestTask(restart, error => {
    ready = false;
    status = { label: (error as { cleanupFailed?: boolean })?.cleanupFailed ? 'Language cleanup failed' : 'Language failed', detail: String(error) };
    log(String(error));
  });
  async function stop(): Promise<void> {
    if (!client) return;
    ready = false; status = { label: 'Stopping', detail: 'Waiting for language work and process cleanup.' };
    try {
      const result = await deadline(client.sendRequest<{ ready: boolean }>('rtl/prepareShutdown'), 10000, 'Language drain was not confirmed within 10000 ms. Stop owned processes before restarting.');
      if (result?.ready !== true || !server) throw new LanguageCleanupFailure('Language drain was not confirmed.');
      server.expectedClose = true;
      await client.stop();
      await deadline(server.closed, 5000, 'Language process exit was not confirmed. Stop owned processes before restarting.');
      client = undefined; server = undefined;
    } catch (error) { throw new LanguageCleanupFailure(`Language cleanup was not confirmed; replacement is blocked: ${String(error)}`); }
  }
  async function restart(signal: AbortSignal): Promise<void> {
    await stop();
    if (signal.aborted || disposed || !enabled()) return;
    status = { label: 'Starting', detail: 'Checking existing language tools.' };
    configureToolsHome(vscode.workspace.getConfiguration('rtl').get<string>('toolsDirectory'));
    const home = toolsHome();
    let python: string | undefined;
    try { python = await detectSemanticRuntime(signal); }
    catch (error) {
      if ((error as { cleanupFailed?: boolean })?.cleanupFailed) throw error;
      if (!signal.aborted) { status = { label: 'Tools invalid', detail: String(error) }; log(String(error)); }
      return;
    }
    if (signal.aborted || disposed || !enabled()) return;
    if (!python) { status = { label: 'Tools missing', detail: `Existing slang 11.0.0 tools not found at ${toolsHome()}. Tool installation UI will be connected separately; no automatic install.` }; return; }
    const { LanguageClient, IPCMessageReader, IPCMessageWriter, ErrorAction, CloseAction } = await import('vscode-languageclient/node');
    if (signal.aborted || disposed || !enabled()) return;
    let selected: LanguageClient | undefined, selectedServer: SemanticProcess | undefined;
    const failed = (error: unknown) => { if (selected && client === selected && !selectedServer?.expectedClose) queue.block(error); };
    selected = new LanguageClient('rtl-slang', 'RTL Language', async () => {
      signal.throwIfAborted();
      if (disposed || !enabled()) throw Error('Language startup is no longer enabled.');
      selectedServer = new SemanticProcess(context.asAbsolutePath('dist/server.cjs'), log, failed);
      server = selectedServer;
      return { reader: new IPCMessageReader(server.child), writer: new IPCMessageWriter(server.child) };
    }, {
      documentSelector: [{ scheme: 'file', language: 'verilog' }, { scheme: 'file', language: 'systemverilog' }],
      outputChannel: output,
      initializationOptions: { python, bridge: context.asAbsolutePath('dist/analyze.py'), cache: path.join(home, 'cache/semantic') },
      synchronize: { fileEvents: [watcher, journalWatcher] },
      errorHandler: {
        error: error => { failed(new LanguageCleanupFailure(`Language communication failed: ${String(error)}`)); return { action: ErrorAction.Continue, handled: true }; },
        closed: () => { failed(new LanguageCleanupFailure('Language connection closed unexpectedly; stop owned processes before restarting.')); return { action: CloseAction.DoNotRestart, handled: true }; }
      }
    });
    client = selected;
    try { await client.start(); }
    catch (error) { throw new LanguageCleanupFailure(`Language startup cleanup is unconfirmed: ${String(error)}`); }
    if (signal.aborted || disposed || !enabled()) { await stop(); return; }
    ready = true; status = { label: 'Ready', detail: 'Source analysis connected.' };
  }
  const enqueue = () => queue.request();
  const close = () => { disposed = true; ready = false; return queue.close(); };
  const watcher = vscode.workspace.createFileSystemWatcher('**/{rtl.toml,rtl-tests.json,*.sv,*.v,*.svh,*.vh}');
  const journalWatcher = vscode.workspace.createFileSystemWatcher('**/.rtl{,/import-transactions,/import-transactions/**}');
  context.subscriptions.push(output, watcher, journalWatcher,
    vscode.commands.registerCommand('rtl.restartLanguage', enqueue),
    vscode.workspace.onDidGrantWorkspaceTrust(() => { void enqueue(); }),
    vscode.workspace.onDidChangeConfiguration(event => { if (event.affectsConfiguration('rtl.editor.semantic') || event.affectsConfiguration('rtl.toolsDirectory')) void enqueue(); }),
    { dispose: () => { void close().catch(() => {}); } });
  void enqueue();
  return close;
}
