import * as vscode from 'vscode';
import path from 'node:path';
import { configureToolsHome, toolsHome } from '../../runtime/toolchain/detect';
import { detectSemanticRuntime } from '../../runtime/semantic-runtime';
import { registerLanguageStatus, type LanguageStatus } from './language-status';
import type { LanguageClient } from 'vscode-languageclient/node';

/** Thin owned adapter. Compiler/provider stays separate from editor and simulator. */
export function registerSemantic(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('RTL Language');
  let client: LanguageClient | undefined;
  let disposed = false;
  let probe: AbortController | undefined;
  let queue = Promise.resolve();
  let status: LanguageStatus = { label: 'Starting', detail: 'Checking existing language tools.' };
  const enabled = () => vscode.workspace.isTrusted && vscode.workspace.getConfiguration('rtl').get('editor.semantic', true);
  registerLanguageStatus(context, async uri => {
    if (!vscode.workspace.isTrusted) return { label: 'Trust required', detail: 'Semantic analysis executes an external compiler. Basic editing remains available.' };
    if (!vscode.workspace.getConfiguration('rtl').get('editor.semantic', true)) return { label: 'Disabled', detail: 'Basic editing remains available.' };
    if (!client?.isRunning() || !uri) return status;
    try { return await client.sendRequest<LanguageStatus>('rtl/languageStatus', { uri }); }
    catch (error) { return { label: 'Connection failed', detail: String(error) }; }
  }, () => output.show());
  async function restart(): Promise<void> {
    if (client) { await client.stop(); client = undefined; }
    if (disposed || !enabled()) return;
    status = { label: 'Starting', detail: 'Checking existing language tools.' };
    configureToolsHome(vscode.workspace.getConfiguration('rtl').get<string>('toolsDirectory'));
    probe = new AbortController();
    let python: string | undefined;
    try { python = await detectSemanticRuntime(probe.signal); }
    catch (error) { if (!probe.signal.aborted) { status = { label: 'Tools invalid', detail: String(error) }; output.appendLine(String(error)); } return; }
    finally { probe = undefined; }
    if (disposed || !enabled()) return;
    if (!python) { status = { label: 'Tools missing', detail: `Existing slang 11.0.0 tools not found at ${toolsHome()}. Tool installation UI will be connected separately; no automatic install.` }; return; }
    const { LanguageClient, TransportKind } = await import('vscode-languageclient/node');
    if (disposed || !enabled()) return;
    client = new LanguageClient('rtl-slang', 'RTL Language', {
      module: context.asAbsolutePath('dist/server.cjs'), transport: TransportKind.ipc
    }, {
      documentSelector: [{ scheme: 'file', language: 'verilog' }, { scheme: 'file', language: 'systemverilog' }],
      outputChannel: output,
      initializationOptions: { python, bridge: context.asAbsolutePath('dist/analyze.py'), cache: path.join(toolsHome(), 'cache/semantic') },
      synchronize: { fileEvents: watcher }
    });
    await client.start();
    status = { label: 'Ready', detail: 'Source analysis connected.' };
    if (disposed || !enabled()) { await client.stop(); client = undefined; }
  }
  const enqueue = () => {
    probe?.abort();
    queue = queue.then(restart).catch(error => { status = { label: 'Language failed', detail: String(error) }; output.appendLine(String(error)); });
    return queue;
  };
  const watcher = vscode.workspace.createFileSystemWatcher('**/{rtl.toml,*.sv,*.v,*.svh,*.vh}');
  context.subscriptions.push(output, watcher,
    vscode.commands.registerCommand('rtl.restartLanguage', enqueue),
    vscode.workspace.onDidGrantWorkspaceTrust(() => { void enqueue(); }),
    vscode.workspace.onDidChangeConfiguration(event => { if (event.affectsConfiguration('rtl.editor.semantic') || event.affectsConfiguration('rtl.toolsDirectory')) void enqueue(); }),
    { dispose: () => { disposed = true; probe?.abort(); void enqueue(); } });
  void enqueue();
}
