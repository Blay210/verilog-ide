import * as vscode from 'vscode';
export interface LanguageStatus { label: string; detail: string; root?: string }
export function registerLanguageStatus(context: vscode.ExtensionContext, read: (uri?: string) => Promise<LanguageStatus>, log: () => void): void {
  const bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 20);
  bar.name = 'RTL Language'; bar.command = 'rtl.languageStatus';
  let disposed = false, generation = 0, dirty = false;
  let timer: NodeJS.Timeout | undefined, pending: Promise<void> | undefined;
  const eligible = () => !!vscode.window.state.focused && !!vscode.window.activeTextEditor && ['verilog', 'systemverilog'].includes(vscode.window.activeTextEditor.document.languageId);
  function refresh(): void {
    if (disposed) return;
    generation++; dirty = true; clearTimeout(timer); timer = undefined;
    if (!eligible()) { if (!vscode.window.activeTextEditor || !['verilog', 'systemverilog'].includes(vscode.window.activeTextEditor.document.languageId)) bar.hide(); return; }
    if (pending) return;
    pending = Promise.resolve().then(async () => {
      try {
        while (dirty && !disposed && eligible()) {
          dirty = false;
          const generationNow = generation, uri = vscode.window.activeTextEditor!.document.uri.toString();
          const status = await read(uri);
          if (disposed || !eligible() || generationNow !== generation) continue;
          bar.text = `RTL: ${status.label}`; bar.tooltip = `${status.detail}${status.root ? '\nProject: ' + status.root : ''}\nClick for setup, retry and logs.`; bar.show();
        }
      } catch { /* The next visible poll can retry a transient status failure. */ }
      finally {
        pending = undefined;
        if (!disposed && eligible()) { timer = setTimeout(refresh, 1500); timer.unref?.(); }
      }
    });
  }
  context.subscriptions.push(bar, vscode.window.onDidChangeActiveTextEditor(refresh), vscode.window.onDidChangeWindowState(refresh),
    vscode.commands.registerCommand('rtl.getLanguageStatus', (uri?: string) => read(uri)),
    vscode.commands.registerCommand('rtl.languageStatus', async () => {
      const status = await read(vscode.window.activeTextEditor?.document.uri.toString());
      const selected = await vscode.window.showQuickPick([
        { label: '언어 도구 설정', command: 'rtl.setupLanguage' },
        { label: 'Retry Analysis', command: 'rtl.restartLanguage' },
        { label: 'Language Settings', command: 'workbench.action.openSettings' },
        { label: 'Show Language Log', command: '' }
      ], { title: `RTL Language: ${status.label}`, placeHolder: `${status.detail}${status.root ? ' · ' + status.root : ''}` });
      if (!selected) return;
      if (!selected.command) log();
      else await vscode.commands.executeCommand(selected.command, ...(selected.command === 'workbench.action.openSettings' ? ['rtl.editor.semantic'] : []));
    }), { dispose() { disposed = true; generation++; clearTimeout(timer); } });
  refresh();
}
