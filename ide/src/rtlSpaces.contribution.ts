/* RTL IDE workspaces. Original project code; upstream imports use MIT Code-OSS. */
import { mainWindow } from '../../../../base/browser/window.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import product from '../../../../platform/product/common/product.js';
import { ISharedProcessService } from '../../../../platform/ipc/electron-browser/services.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkingCopyService } from '../../../services/workingCopy/common/workingCopyService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IWorkbenchLayoutService, Parts } from '../../../services/layout/browser/layoutService.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { RtlSimulationHome } from './rtlSimulationHome.js';
import { RtlExplorerRun } from './rtlExplorerRun.js';
import { explorerFileContribRegistry } from '../../files/browser/explorerFileContrib.js';
import { URI, type UriComponents } from '../../../../base/common/uri.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import type { RoleSelection, ImportSelection } from '../../../../platform/rtl/common/rtlSimulation.js';
import { MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { ExplorerFolderContext } from '../../files/common/files.js';

class RtlSpaces extends Disposable {
  private active: 'code' | 'simulation' = 'code';
  private readonly editor: HTMLElement;
  private readonly home: HTMLElement;
  private readonly navigation: HTMLElement;
  private readonly buttons: HTMLButtonElement[] = [];
  private readonly inertBefore = new Map<HTMLElement, boolean>();
  private sidebarBefore = true;
  private auxiliaryBefore = false;
  private readonly simulation: RtlSimulationHome;

  constructor(
    @IWorkbenchLayoutService private readonly layout: IWorkbenchLayoutService,
    @IEditorService private readonly editors: IEditorService,
    @IConfigurationService private readonly configuration: IConfigurationService,
    @ISharedProcessService shared: ISharedProcessService,
    @IWorkspaceContextService workspace: IWorkspaceContextService,
    @IWorkspaceTrustManagementService trust: IWorkspaceTrustManagementService,
    @ICommandService commands: ICommandService,
    @ILifecycleService lifecycle: ILifecycleService,
    @IDialogService dialogs: IDialogService,
    @IQuickInputService quickInput: IQuickInputService,
    @IFileService files: IFileService,
    @IWorkingCopyService workingCopies: IWorkingCopyService,
    @ITextFileService textFiles: ITextFileService,
    @INotificationService notifications: INotificationService
  ) {
    super();
    this.editor = this.layout.getContainer(mainWindow, Parts.EDITOR_PART)!;
    const activity = this.layout.getContainer(mainWindow, Parts.ACTIVITYBAR_PART)!;
    const style = mainWindow.document.createElement('style');
    style.textContent = `
      .rtl-explorer-testbench { position:relative; padding-right:26px; box-sizing:border-box; }
      .rtl-explorer-run { position:absolute; right:2px; top:1px; width:22px; height:20px; padding:0; border:0; border-radius:3px; color:var(--vscode-icon-foreground); background:var(--vscode-list-hoverBackground); cursor:pointer; opacity:0; pointer-events:none; }
      .rtl-explorer-run[hidden] { display:none; }
      .monaco-list-row:hover .rtl-explorer-run, .monaco-list-row.focused .rtl-explorer-run, .rtl-explorer-run:focus-visible { opacity:1; pointer-events:auto; }
      .rtl-explorer-run:focus-visible { outline:1px solid var(--vscode-focusBorder); }
      .rtl-explorer-run:disabled { cursor:default; color:var(--vscode-disabledForeground); }
      .rtl-folder-role { margin-left:6px; color:var(--vscode-descriptionForeground); flex-shrink:0; }
      .rtl-folder-role[hidden] { display:none; }
      .rtl-space-navigation { position:absolute; top:0; left:0; right:0; height:96px; display:flex; flex-direction:column; z-index:5; }
      .rtl-space-navigation button { flex:1; color:var(--vscode-activityBar-inactiveForeground); background:transparent; border:0; border-left:2px solid transparent; cursor:pointer; }
      .rtl-space-navigation button[aria-pressed=true] { color:var(--vscode-activityBar-foreground); border-left-color:var(--vscode-activityBar-activeBorder); }
      .rtl-space-navigation button:focus-visible { outline:1px solid var(--vscode-focusBorder); outline-offset:-3px; }
      .rtl-space-navigation .codicon { font-size:24px; }
      .rtl-space-navigation:not(.rtl-space-floating) ~ .content { margin-top:96px; }
      .rtl-space-navigation.rtl-space-floating { left:0; right:0; top:0; width:auto; height:40px; flex-direction:row; justify-content:flex-end; z-index:30; background:var(--vscode-editorWidget-background); }
      .rtl-space-floating button { flex:0 0 44px; border-left:0; border-bottom:2px solid transparent; }
      .rtl-space-floating button[aria-pressed=true] { border-bottom-color:var(--vscode-focusBorder); }
      .rtl-space-fallback .rtl-simulation-home { top:40px; }
      .rtl-space-fallback > .content { position:relative; }
      .rtl-simulation-home { position:absolute; inset:0; z-index:20; background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); overflow:auto; padding:48px; box-sizing:border-box; }
      .rtl-simulation-home[hidden] { display:none; }
      .rtl-wave-tabs { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:12px; }
      .rtl-wave-tabs[hidden], .rtl-wave-area[hidden], .rtl-wave-area iframe[hidden] { display:none; }
      .rtl-wave-open { padding:8px; display:flex; flex-direction:column; overflow:hidden; }
      .rtl-wave-area { flex:1; min-height:0; }
      .rtl-wave-area iframe { width:100%; height:100%; border:0; }
      .rtl-simulation-home h1 { font-size:28px; font-weight:500; margin:0 0 12px; }
      .rtl-simulation-home p { max-width:640px; line-height:1.7; }
      .rtl-simulation-home button { padding:8px 16px; border:0; background:var(--vscode-button-background); color:var(--vscode-button-foreground); cursor:pointer; }
      .rtl-simulation-home button:focus-visible { outline:2px solid var(--vscode-focusBorder); outline-offset:3px; }
      .rtl-simulation-home button:disabled { opacity:.45; cursor:default; }
      .rtl-simulation-toolbar { display:flex; flex-wrap:wrap; gap:8px; }
      .rtl-simulation-notice { color:var(--vscode-descriptionForeground); }
      .rtl-simulation-tests { margin-top:20px; }
      .rtl-simulation-test { display:flex; align-items:center; flex-wrap:wrap; gap:12px; padding:12px 0; border-bottom:1px solid var(--vscode-widget-border); }
      .rtl-simulation-test button[data-action=source] { background:transparent; color:var(--vscode-textLink-foreground); text-align:left; min-width:140px; }
      .rtl-simulation-result { flex:1; min-width:150px; font-size:12px; }
      .rtl-simulation-warning { color:var(--vscode-editorWarning-foreground); font-size:12px; }
      .rtl-simulation-test select { max-width:350px; background:var(--vscode-dropdown-background); color:var(--vscode-dropdown-foreground); border:1px solid var(--vscode-dropdown-border); padding:6px; }
      .rtl-simulation-test select[hidden] { display:none; }
      .rtl-simulation-log { margin-top:24px; }
      .rtl-simulation-log pre { max-height:300px; overflow:auto; white-space:pre-wrap; overflow-wrap:anywhere; padding:12px; background:var(--vscode-textCodeBlock-background); font-family:var(--monaco-monospace-font); font-size:12px; }
      .rtl-simulation-active > :not(.rtl-simulation-home):not(.rtl-space-navigation) { visibility:hidden; }
    `;
    mainWindow.document.head.append(style);
    this.navigation = mainWindow.document.createElement('nav');
    this.navigation.className = 'rtl-space-navigation';
    this.navigation.setAttribute('aria-label', 'RTL workspaces');
    for (const [space, label, icon] of [['code', 'Code', 'code'], ['simulation', 'Simulation', 'debug-start']] as const) {
      const button = mainWindow.document.createElement('button');
      button.type = 'button'; button.title = label; button.setAttribute('aria-label', label);
      const symbol = mainWindow.document.createElement('span');
      symbol.className = `codicon codicon-${icon}`; symbol.setAttribute('aria-hidden', 'true');
      button.append(symbol); button.addEventListener('click', () => this.show(space));
      this.navigation.append(button); this.buttons.push(button);
    }
    activity.prepend(this.navigation);
    this.home = mainWindow.document.createElement('section');
    this.home.className = 'rtl-simulation-home'; this.home.hidden = true;
    this.home.setAttribute('aria-label', 'Simulation home'); this.home.tabIndex = -1;
    this.editor.append(this.home);
    this.simulation = this._register(new RtlSimulationHome(this.home, shared, workspace, trust, commands, editors, lifecycle, dialogs, quickInput, files, workingCopies, configuration, textFiles));
    const runFile = async (resource: URI) => { if (await this.simulation.startFile(resource)) this.show('simulation'); };
    explorerFileContribRegistry.register({ create: (_insta, container) => new RtlExplorerRun(container, {
      changed: this.simulation.onDidChangeExplorer,
      targetCount: resource => this.simulation.fileTargets(resource).length,
      enabled: () => this.simulation.explorerEnabled,
      folderRole: resource => this.simulation.folderRole(resource),
      run: runFile, error: error => notifications.error(error instanceof Error ? error : String(error))
    }) });
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.runFile', (_accessor, resource) => {
      if (!resource || typeof resource !== 'object') throw Error('실행할 로컬 파일이 필요합니다.');
      return runFile(URI.revive(resource as UriComponents));
    }));
    this._register(CommandsRegistry.registerCommand('rtlIde.explorer.state', () => ({
      folders: Array.from(mainWindow.document.querySelectorAll<HTMLSpanElement>('.rtl-folder-role')).filter(badge => !badge.hidden).map(badge => ({ resource: badge.dataset.resource, role: badge.dataset.role, title: badge.title })),
      rows: Array.from(mainWindow.document.querySelectorAll<HTMLButtonElement>('.rtl-explorer-run')).map(button => {
        const bounds = button.getBoundingClientRect();
        return { resource: button.dataset.resource, hidden: button.hidden, disabled: button.disabled, label: button.getAttribute('aria-label'), opacity: mainWindow.getComputedStyle(button).opacity, width: bounds.width, height: bounds.height };
      }),
      pickerVisible: Array.from(mainWindow.document.querySelectorAll<HTMLElement>('.quick-input-widget')).some(element => element.getBoundingClientRect().height > 0)
    })));
    this._register(CommandsRegistry.registerCommand('rtlIde.explorer.activateRun', (_accessor, resource) => {
      if (!resource || typeof resource !== 'object') throw Error('로컬 파일이 필요합니다.');
      const target = URI.revive(resource as UriComponents).toString();
      const button = Array.from(mainWindow.document.querySelectorAll<HTMLButtonElement>('.rtl-explorer-run')).find(button => button.dataset.resource === target && !button.hidden && !button.disabled);
      if (!button) throw Error('이 파일의 실행 버튼이 현재 활성화되어 있지 않습니다.');
      button.click();
    }));
    void this.simulation.refresh().catch(error => notifications.error(error));
    for (const [suffix, title, role] of [
      ['source', 'RTL 소스 폴더로 지정', 'source'],
      ['simulation', '테스트벤치 폴더로 지정', 'simulation'],
      ['excluded', 'RTL 탐색에서 제외', 'excluded'],
      ['inherit', '폴더 역할 지정 해제 (상속)', undefined]
    ] as const) {
      const id = `rtlIde.explorer.folder.${suffix}`;
      this._register(CommandsRegistry.registerCommand(id, async (_accessor, resource) => {
        try {
          if (!resource || typeof resource !== 'object') throw Error('프로젝트 폴더를 선택해 주세요.');
          await this.simulation.setFolderRole(URI.revive(resource as UriComponents), role);
          this.show('simulation');
        } catch (error) { notifications.error(error instanceof Error ? error : String(error)); throw error; }
      }));
      this._register(MenuRegistry.appendMenuItem(MenuId.ExplorerContext, { command: { id, title }, group: 'rtl-folder-role', when: ExplorerFolderContext }));
    }
    const placeNavigation = () => {
      // Keep workspace entry points reachable without changing the user's layout.
      const floating = this.configuration.getValue<string>('workbench.activityBar.location') !== 'default' || !this.layout.isVisible(Parts.ACTIVITYBAR_PART);
      this.navigation.classList.toggle('rtl-space-floating', floating);
      const parent = floating ? this.editor : activity;
      if (this.navigation.parentElement !== parent) { parent.prepend(this.navigation); }
      if (this.editor.classList.contains('rtl-space-fallback') !== floating) {
        this.editor.classList.toggle('rtl-space-fallback', floating);
        this.layout.layout();
      }
    };
    placeNavigation();
    this._register(this.configuration.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('workbench.activityBar.location')) { placeNavigation(); }
    }));
    this._register(this.layout.onDidChangePartVisibility(placeNavigation));
    this.updateButtons();
    this._register(CommandsRegistry.registerCommand('rtlIde.showCode', () => this.show('code')));
    this._register(CommandsRegistry.registerCommand('rtlIde.showSimulation', () => this.show('simulation')));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.state', () => this.simulation.diagnostic));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.refresh', () => this.simulation.refresh()));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.manage', () => this.simulation.manageProject()));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.classify', (_accessor, roles) => this.simulation.classify(roles as RoleSelection)));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.saveReview', () => this.simulation.saveReview()));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.prepareReview', (_accessor, selection) => this.simulation.prepareReview(selection as ImportSelection | undefined)));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.confirmReview', (_accessor, selection) => this.simulation.prepareReview(selection as ImportSelection | undefined, true)));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.run', (_accessor, names?: string[]) => this.simulation.start(names)));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.cancel', () => this.simulation.cancel()));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.waveform', (_accessor, name: string, runId?: string) => this.simulation.openWaveform(name, runId)));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.recordedSource', (_accessor, name: string, runId?: string, file?: string) => this.simulation.openRecordedSource(name, runId, file)));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.selectRun', (_accessor, name: string, runId: string) => this.simulation.selectRun(name, runId)));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.compareRun', (_accessor, name: string) => this.simulation.compareSelectedRun(name)));
    this._register(CommandsRegistry.registerCommand('rtlIde.simulation.sourceDiff', (_accessor, name: string, runId?: string, file?: string) => this.simulation.openRecordedSource(name, runId, file, true)));
    this._register(CommandsRegistry.registerCommand('rtlIde.spaceState', () => {
      const bounds = this.navigation.getBoundingClientRect();
      const target = this.buttons[this.active === 'code' ? 1 : 0];
      const rect = target.getBoundingClientRect();
      const hit = mainWindow.document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      const focused = mainWindow.document.activeElement;
      const panel = this.layout.getContainer(mainWindow, Parts.PANEL_PART);
      const focusArea = focused && panel?.contains(focused) ? 'panel' : focused && this.editor.contains(focused) ? 'editor' : 'other';
      const content = this.active === 'simulation' ? this.home : this.editor.querySelector('.editor-group-container');
      const groupBounds = Array.from(this.editor.querySelectorAll('.editor-group-container')).map(group => { const rect = group.getBoundingClientRect(); return { top: rect.top, width: rect.width, height: rect.height }; });
      const navigationClear = !this.navigation.classList.contains('rtl-space-floating') || !!content && bounds.bottom <= content.getBoundingClientRect().top + 1;
      return { activeSpace: this.active, homeVisible: !this.home.hidden, sidebarVisible: this.layout.isVisible(Parts.SIDEBAR_PART), panelVisible: this.layout.isVisible(Parts.PANEL_PART), auxiliaryVisible: this.layout.isVisible(Parts.AUXILIARYBAR_PART), focusArea, navigationClear, layoutBounds: { navigationBottom: bounds.bottom, contentTop: content?.getBoundingClientRect().top, groupBounds, padding: (this.editor.querySelector(':scope > .content') as HTMLElement | null)?.style.paddingTop }, viewport: { width: mainWindow.innerWidth, height: mainWindow.innerHeight }, navigationPlacement: this.navigation.classList.contains('rtl-space-floating') ? 'editor' : 'activityBar', navigationReachable: bounds.width > 0 && bounds.height > 0 && !!hit && target.contains(hit) && !target.inert && !this.navigation.inert };
    }));
    this._register(this.layout.onDidChangePartVisibility(event => {
      if (this.active === 'simulation' && event.visible && (event.partId === Parts.SIDEBAR_PART || event.partId === Parts.AUXILIARYBAR_PART)) {
        // A newly opened tool is an explicit request, not the old Code layout.
        // Keep it visible when restoring the rest of that layout.
        if (event.partId === Parts.SIDEBAR_PART) { this.sidebarBefore = true; }
        else { this.auxiliaryBefore = true; }
        this.show('code'); // Explorer/Search/SCM activation returns to the Code space.
      }
    }));
    this._register(this.editors.onDidActiveEditorChange(() => {
      // Source navigation / Ctrl+N must reveal the editor instead of opening a
      // hidden document behind the Simulation home. Panel editors are separate.
      if (this.active === 'simulation' && this.editors.activeEditor) { this.show('code', false); }
    }));
    this._register(this.editors.onWillOpenEditor(() => {
      // Reveal even the already active input, but let the open operation choose
      // focus. Focusing the previous pane here races the new pane and ignores
      // preserveFocus requests from a shared panel.
      if (this.active === 'simulation') { this.show('code', false); }
    }));
    this._register({ dispose: () => { this.show('code'); style.remove(); this.home.remove(); this.navigation.remove(); } });
  }

  private updateButtons(): void {
    this.buttons[0].setAttribute('aria-pressed', String(this.active === 'code'));
    this.buttons[1].setAttribute('aria-pressed', String(this.active === 'simulation'));
  }

  private show(space: 'code' | 'simulation', restoreEditorFocus = true): void {
    if (space === this.active) { return; }
    this.active = space;
    if (space === 'simulation') {
      this.sidebarBefore = this.layout.isVisible(Parts.SIDEBAR_PART);
      this.auxiliaryBefore = this.layout.isVisible(Parts.AUXILIARYBAR_PART);
      this.layout.setPartHidden(true, Parts.SIDEBAR_PART);
      this.layout.setPartHidden(true, Parts.AUXILIARYBAR_PART);
      for (const child of Array.from(this.editor.children)) {
        if (child instanceof mainWindow.HTMLElement && child !== this.home && child !== this.navigation) {
          this.inertBefore.set(child, child.inert); child.inert = true;
        }
      }
      this.editor.classList.add('rtl-simulation-active'); this.home.hidden = false; this.home.focus();
      void this.simulation.enter();
    } else {
      this.home.hidden = true; this.editor.classList.remove('rtl-simulation-active');
      for (const [child, inert] of this.inertBefore) { child.inert = inert; }
      this.inertBefore.clear();
      this.layout.setPartHidden(!this.sidebarBefore, Parts.SIDEBAR_PART);
      this.layout.setPartHidden(!this.auxiliaryBefore, Parts.AUXILIARYBAR_PART);
      if (restoreEditorFocus) { this.editors.activeEditorPane?.focus(); }
    }
    this.updateButtons();
  }
}

if (product.applicationName === 'rtl-ide') {
  registerWorkbenchContribution2('rtl.workspaces', RtlSpaces, WorkbenchPhase.AfterRestored);
}
