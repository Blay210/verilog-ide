import { mainWindow } from '../../../../base/browser/window.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import type { IWorkspacesService } from '../../../../platform/workspaces/common/workspaces.js';
import { isRecentFolder } from '../../../../platform/workspaces/common/workspaces.js';
import type { ICommandService } from '../../../../platform/commands/common/commands.js';
import type { IHostService } from '../../../services/host/browser/host.js';

/** Project entry only: no simulation channel, trace reader, or editor restore. */
export class RtlProjectStart extends Disposable {
  readonly element = mainWindow.document.createElement('section');
  private readonly recent = mainWindow.document.createElement('section');
  private stopped = false;
  private revision = 0;
  constructor(commands: ICommandService, private readonly workspaces: IWorkspacesService, private readonly host: IHostService) {
    super(); this.element.className = 'pulse-project-start'; this.element.tabIndex = -1; this.element.setAttribute('aria-label', 'Pulse 프로젝트 시작');
    const style = mainWindow.document.createElement('style'); style.textContent = `
      .pulse-project-start { position:absolute; inset:0; z-index:40; overflow:auto; box-sizing:border-box; padding:48px max(28px,calc((100% - 1000px)/2)); background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); }
      .pulse-project-start h1 { font-size:32px; margin:0 0 16px; } .pulse-project-start h2 { font-size:22px; margin:40px 0 16px; }
      .pulse-project-start p,.pulse-project-start small { color:var(--vscode-descriptionForeground); line-height:1.6; }
      .pulse-project-start button { font:inherit; color:var(--vscode-button-secondaryForeground); background:var(--vscode-button-secondaryBackground,#30343b); border:0; border-radius:6px; padding:10px 16px; cursor:pointer; }
      .pulse-project-start button:hover { background:var(--vscode-button-secondaryHoverBackground); } .pulse-project-start button:focus-visible { outline:2px solid var(--vscode-focusBorder); }
      .pulse-project-start nav { display:flex; gap:12px; flex-wrap:wrap; } .pulse-project-start nav button:first-child { background:var(--vscode-button-background); color:var(--vscode-button-foreground); }
      .pulse-project-start .recent { margin-top:48px; padding:24px; border-radius:12px; background:var(--vscode-editorWidget-background); }
      .pulse-project-start .recent h2 { margin:0; padding-bottom:16px; border-bottom:1px solid var(--vscode-widget-border,#80808040); }
      .pulse-project-start .row { display:flex; align-items:center; border-bottom:1px solid var(--vscode-widget-border,#80808040); } .pulse-project-start .row:last-child { border:0; }
      .pulse-project-start .row:hover,.pulse-project-start .row:focus-within { background:var(--vscode-list-hoverBackground,#ffffff0d); }
      .pulse-project-start .row button { background:transparent; } .pulse-project-start .entry { flex:1; min-width:0; display:flex; flex-direction:column; text-align:left; gap:6px; }
      .pulse-project-start small { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100%; }`;
    const title = mainWindow.document.createElement('h1'); title.textContent = 'Pulse';
    const heading = mainWindow.document.createElement('h2'); heading.textContent = '프로젝트 시작';
    const note = mainWindow.document.createElement('p'); note.textContent = '새 RTL 프로젝트를 만들거나 기존 프로젝트를 열어 주세요.';
    const nav = mainWindow.document.createElement('nav');
    for (const [label, id] of [['새 프로젝트', 'rtlIde.project.new'], ['기존 프로젝트 열기', 'rtlIde.project.open']]) nav.append(this.button(label, () => commands.executeCommand(id)));
    this.recent.className = 'recent'; this.element.append(style, title, heading, note, nav, this.recent);
    this._register(workspaces.onDidChangeRecentlyOpened(() => { void this.refresh(); })); void this.refresh();
  }
  private button(label: string, action: () => Promise<unknown>) {
    const button = mainWindow.document.createElement('button'); button.textContent = label; button.title = label; button.setAttribute('aria-label', label);
    button.addEventListener('click', () => { void action().catch(error => { const message = mainWindow.document.createElement('p'); message.textContent = String(error); this.recent.append(message); }); }); return button;
  }
  private async refresh() {
    const revision = ++this.revision;
    try {
      const recent = await this.workspaces.getRecentlyOpened(); if (this.stopped || revision !== this.revision) return;
      const title = mainWindow.document.createElement('h2'); title.textContent = '최근 프로젝트'; this.recent.replaceChildren(title);
      const entries = recent.workspaces.filter(item => (isRecentFolder(item) ? item.folderUri : item.workspace.configPath).scheme === 'file').slice(0, 12);
      for (const item of entries) {
        const folder = isRecentFolder(item), resource = folder ? item.folderUri : item.workspace.configPath;
        const row = mainWindow.document.createElement('div'); row.className = 'row';
        const entry = this.button('', () => this.host.openWindow([folder ? { folderUri: resource } : { workspaceUri: resource }], { forceReuseWindow: true })); entry.className = 'entry'; entry.setAttribute('aria-label', resource.fsPath);
        const name = mainWindow.document.createElement('strong'), location = mainWindow.document.createElement('small'); name.textContent = item.label ?? resource.path.split('/').pop() ?? resource.fsPath; location.textContent = resource.fsPath; entry.append(name, location);
        const remove = this.button('×', async () => { await this.workspaces.removeRecentlyOpened([resource]); row.remove(); await this.refresh(); }); remove.title = '최근 목록에서 제거'; remove.setAttribute('aria-label', `${name.textContent} 최근 목록에서 제거`); row.append(entry, remove); this.recent.append(row);
      }
      if (!entries.length) { const empty = mainWindow.document.createElement('p'); empty.textContent = '최근에 연 프로젝트가 없습니다.'; this.recent.append(empty); }
    } catch (error) { if (!this.stopped) this.recent.textContent = `최근 프로젝트를 읽지 못했습니다: ${String(error)}`; }
  }
  override dispose(): void { this.stopped = true; this.revision++; this.element.remove(); super.dispose(); }
}
