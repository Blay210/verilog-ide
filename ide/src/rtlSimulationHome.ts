/* RTL IDE Simulation workspace. Original MIT project code. */
import { mainWindow } from '../../../../base/browser/window.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { isWindows } from '../../../../base/common/platform.js';
import { testsForFile } from '../../../../platform/rtl/common/testFiles.js';
import { relativeFolder, folderBadge, changeFolderRole, isReservedRoleFolder } from '../../../../platform/rtl/common/folderRoles.js';
import { FileAccess, type AppResourcePath } from '../../../../base/common/network.js';
import { URI } from '../../../../base/common/uri.js';
import { extUriBiasedIgnorePathCase } from '../../../../base/common/resources.js';
import { IFileService, FileSystemProviderCapabilities, FileType, FilePermission, type IFileSystemProviderWithFileReadWriteCapability } from '../../../../platform/files/common/files.js';
import type { RecordedSource, RecordedSourceText, RunComparison, TestListEdit } from '../../../../platform/rtl/common/rtlSimulation.js';
import { IWorkingCopyService } from '../../../services/workingCopy/common/workingCopyService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { ISharedProcessService } from '../../../../platform/ipc/electron-browser/services.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import type { SimulationState, SimulationTestView, SimulationResultView, WaveformDocument, WaveformQuery, SavedWaveViews, WaveViewEdit, RoleSelection, SourceRole, ImportSelection } from '../../../../platform/rtl/common/rtlSimulation.js';
import { parseWorkspaceSession, parseWaveSession, type WorkspaceSession, type RestoredWave, type WaveSessionState } from '../../../../platform/rtl/common/workspaceState.js';
import { parseView, retainMissing } from '../../../../platform/rtl/common/waveform/views.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { RecordedSourceCache } from '../../../../platform/rtl/common/recordedSourceCache.js';
import type { ImportRecoveryChoice } from '../../../../platform/rtl/common/rtlSimulation.js';

export class RtlSimulationHome extends Disposable {
  private readonly explorerChanged = this._register(new Emitter<void>({ leakWarningThreshold: 1024, leakWarningName: 'RTL Explorer row templates' })); // Virtualized rows each own and dispose one listener; zero rejects listeners upstream.
  readonly onDidChangeExplorer = this.explorerChanged.event;
  private explorerSignature = '';
  private state: SimulationState = { revision: -1, tests: [], phase: 'idle', log: '' };
  private readonly channel;
  private readonly recordedTexts = new RecordedSourceCache();
  private recordedEpoch = 0;
  private readonly status = mainWindow.document.createElement('p');
  private readonly notice = mainWindow.document.createElement('p');
  private readonly sourceNotice = mainWindow.document.createElement('p');
  private readonly rows = mainWindow.document.createElement('div');
  private readonly testCount = mainWindow.document.createElement('span');
  private readonly testScope = mainWindow.document.createElement('p');
  private readonly emptyTests = mainWindow.document.createElement('p');
  private readonly log = mainWindow.document.createElement('pre');
  private readonly selected = new Set<string>();
  private readonly rowElements = new Map<string, { element: HTMLDivElement; identity: string; result: HTMLElement; warning: HTMLElement; history: HTMLSelectElement; historySignature?: string; run: HTMLButtonElement; log: HTMLButtonElement; wave: HTMLButtonElement; source: HTMLButtonElement; compare: HTMLButtonElement; diff: HTMLButtonElement; remove: HTMLButtonElement }>();
  private readonly chosenRuns = new Map<string, string>();
  private comparisonTimer: number | undefined;
  private comparisonPending = false;
  private comparisonInFlight = false;
  private comparisonError?: string;
  private inputEpoch = 0;
  private selectedComparison?: string;
  private readonly runComparisons = new Map<string, { epoch: number; result: RunComparison }>();
  private readonly page = mainWindow.document.createElement('div');
  private readonly tabs = mainWindow.document.createElement('div');
  private homeTab!: HTMLButtonElement;
  private activeWave?: string;
  private readonly waveArea = mainWindow.document.createElement('div');
  private readonly documents = new Map<string, { doc: WaveformDocument; frame: HTMLIFrameElement; tab: HTMLElement; label: HTMLButtonElement; test: string; views?: SavedWaveViews; editing?: boolean; rendered?: { rows: number; aligned: boolean; cursor: string } }>();
  private openingWave = false;
  private readonly pendingWaves = new Map<string, { wave: RestoredWave; tab: HTMLElement }>();
  private readonly waveStates = new Map<string, WaveSessionState>();
  private sessionBook: WorkspaceSession;
  private persistenceTimer?: number;
  private restoreActive?: string;
  private restoringSelection = false;
  private projectPicker!: HTMLButtonElement;
  private all!: HTMLButtonElement;
  private selection!: HTMLButtonElement;
  private stop!: HTMLButtonElement;
  private reload!: HTMLButtonElement;
  private setup!: HTMLButtonElement;
  private manage!: HTMLButtonElement;
  private tagRun!: HTMLButtonElement;
  private historyButton!: HTMLButtonElement;
  private readonly jobs = mainWindow.document.createElement('select');
  private readonly historicalResults = new Map<string, SimulationResultView>();
  private addFolder!: HTMLButtonElement;
  private addFile!: HTMLButtonElement;
  private restoreTest!: HTMLButtonElement;
  private registrations!: HTMLElement;
  private managedRevision: string | undefined;
  private signature = '';
  private loading = false;
  private refreshPending?: Promise<void>;
  private stopped = false;
  private paintQueued = false;
  private displayedLog: string | undefined;
  private readonly importArea = mainWindow.document.createElement('section');
  private readonly importSearch = mainWindow.document.createElement('input');
  private readonly importContent = mainWindow.document.createElement('div');
  private reviewSignature = '';
  private readonly importTops = new Set<string>();
  private readonly importIncludes = mainWindow.document.createElement('textarea');
  private readonly onboarding = mainWindow.document.createElement('section');
  private readonly onboardingTitle = mainWindow.document.createElement('h2');
  private readonly onboardingDescription = mainWindow.document.createElement('p');
  private readonly onboardingActions = mainWindow.document.createElement('div');
  private controls!: HTMLElement;
  private testsSection!: HTMLElement;
  private logSection!: HTMLElement;
  private title!: HTMLElement;
  private description!: HTMLElement;
  private advancedOpen = false;
  private onboardingSignature = '';
  private initialTopSignature = '';
  private userError?: string;
  private readonly recentProjects = mainWindow.document.createElement('section');
  private readonly settings = mainWindow.document.createElement('div');
  private readonly settingsPanel = mainWindow.document.createElement('section');
  private recentPending = false;
  private recentLoaded = false;
  private settingsFocus?: HTMLElement;
  private settingsSourceChanged = false;
  private readonly excludedList = mainWindow.document.createElement('section');
  private readonly toolLocation = mainWindow.document.createElement('p');

  private uiReady = false;
  private initializeUi?: () => void;
  private ensureUi(): void {
    if (this.uiReady || this.stopped) return;
    this.uiReady = true;
    const initialize = this.initializeUi; this.initializeUi = undefined;
    initialize?.(); this.paint();
  }

  constructor(private readonly container: HTMLElement,
    shared: ISharedProcessService, private readonly workspace: IWorkspaceContextService,
    private readonly trust: IWorkspaceTrustManagementService, private readonly commands: ICommandService,
    private readonly editors: IEditorService, lifecycle: ILifecycleService, private readonly dialogs: IDialogService, private readonly quickInput: IQuickInputService,
    private readonly files: IFileService, private readonly workingCopies: IWorkingCopyService, private readonly configuration: IConfigurationService, private readonly textFiles: ITextFileService,
    private readonly persistence?: { read(): string | undefined; write(value: string): void },
    private readonly navigation?: { recent(): Promise<{ name: string; path: string; open(): Promise<void>; remove?(): Promise<void> }[]>; choosePath(folder: boolean): Promise<URI | undefined> }) {
    super(); this.channel = shared.getChannel('rtlSimulation');
    this.sessionBook = parseWorkspaceSession(persistence?.read());
    const denied = async (): Promise<never> => { throw Error('실행 보관 소스는 읽기 전용입니다. 현재 소스에서 편집해 주세요.'); };
    const provider: IFileSystemProviderWithFileReadWriteCapability = {
      capabilities: FileSystemProviderCapabilities.FileReadWrite | FileSystemProviderCapabilities.Readonly | FileSystemProviderCapabilities.PathCaseSensitive,
      onDidChangeCapabilities: Event.None, onDidChangeFile: Event.None, watch: () => ({ dispose() {} }),
      stat: async resource => ({ type: FileType.File, permissions: FilePermission.Readonly, ctime: 0, mtime: 0, size: (await this.recordedBytes(resource)).length }),
      readFile: async resource => (await this.recordedBytes(resource)).slice(),
      writeFile: denied, mkdir: denied, delete: denied, rename: denied, readdir: denied
    };
    this._register(this.files.registerProvider('rtl-run-source', provider));
    this._register(this.files.registerProvider('rtl-import-recovery', { ...provider,
      stat: async resource => ({ type: FileType.File, permissions: FilePermission.Readonly, ctime: 0, mtime: 0, size: (await this.recoveryBytes(resource)).length }),
      readFile: async resource => (await this.recoveryBytes(resource)).slice()
    }));
    this._register(this.textFiles.files.onDidRemove(resource => {
      if (['rtl-run-source', 'rtl-import-recovery'].includes(resource.scheme)) this.recordedTexts.release(resource.toString());
    }));
    this.initializeUi = () => {
      const title = mainWindow.document.createElement('h1'); title.textContent = 'Simulation';
      const description = mainWindow.document.createElement('p'); description.textContent = '테스트를 실행하고 결과와 로그를 확인하세요.';
      this.title = title; this.description = description;
      const header = mainWindow.document.createElement('header'); header.className = 'rtl-simulation-header';
      const heading = mainWindow.document.createElement('div'); heading.append(title, description);
      const toolbar = mainWindow.document.createElement('div'); toolbar.className = 'rtl-simulation-toolbar';
      this.all = this.button('전체 실행', () => this.start(), 'run-all');
      this.selection = this.button('선택 실행', () => this.start([...this.selected]), 'run-selected');
      this.stop = this.button('취소', () => this.call('cancel'), 'cancel');
      this.reload = this.iconButton('새로고침', () => this.refresh(), 'refresh', 'refresh');
      this.setup = this.button('도구 설정', async () => { await this.commands.executeCommand('rtl.setupTools'); await this.refresh(); }, 'setup-tools');
      this.manage = this.iconButton('Simulation 설정', () => this.openSettings(), 'manage-tests', 'settings');
      this.tagRun = this.button('태그로 실행', async () => {
        const tags = [...new Set(this.state.tests.flatMap(test => test.tags ?? []))].sort();
        const selection = await this.quickInput.pick(tags.map(tag => ({ label: tag })), { canPickMany: true, placeHolder: '선택한 모든 태그를 포함한 테스트 실행' });
        if (selection?.length) await this.start(undefined, selection.map(item => item.label));
      }, 'run-tags');
      this.historyButton = this.button('실행 이력', () => this.openHistory(), 'all-history');
      this.jobs.setAttribute('aria-label', '동시 실행 수');
      this.jobs.addEventListener('change', () => this.queuePersistence());
      for (const value of [1, 2, 4]) { const option = mainWindow.document.createElement('option'); option.value = String(value); option.textContent = value === 1 ? '순차 실행' : `동시 ${value}개`; this.jobs.append(option); }
      const runOptions = mainWindow.document.createElement('section');
      const runOptionsTitle = mainWindow.document.createElement('h3');
      runOptionsTitle.textContent = '동시 실행 수'; runOptions.append(runOptionsTitle, this.jobs, this.tagRun);
      const execution = this.group('실행', 'rtl-simulation-run-actions'); execution.append(this.all, this.selection, this.stop);
      const projectActions = this.group('Simulation 관리', 'rtl-simulation-project-actions'); projectActions.append(this.historyButton);
      toolbar.append(execution, projectActions);
      this.projectPicker = this.button('프로젝트 선택', async () => {
        const choice = await this.quickInput.pick(this.workspace.getWorkspace().folders.filter(folder => folder.uri.scheme === 'file').map(folder => ({ label: folder.name, description: folder.uri.fsPath, root: folder.uri.fsPath })), { placeHolder: 'Simulation에서 사용할 프로젝트' });
        if (choice) await this.refresh(choice.root);
      }, 'select-project');
      header.append(heading, this.projectPicker, this.manage);
      const controls = mainWindow.document.createElement('section'); controls.className = 'rtl-simulation-card rtl-simulation-controls';
      this.controls = controls;
      controls.setAttribute('aria-label', '프로젝트와 실행');
      this.status.className = 'rtl-simulation-project-status';
      this.status.setAttribute('role', 'status'); this.status.setAttribute('aria-live', 'polite');
      this.notice.className = 'rtl-simulation-notice';
      this.sourceNotice.className = 'rtl-simulation-notice';
      this.sourceNotice.dataset.action = 'source-sync-notice';
      this.sourceNotice.setAttribute('role', 'status');
      this.sourceNotice.setAttribute('aria-live', 'polite');
      this.rows.className = 'rtl-simulation-tests';
      const tests = mainWindow.document.createElement('section'); tests.className = 'rtl-simulation-test-section';
      this.testsSection = tests;
      tests.setAttribute('aria-label', '테스트 목록');
      const registrations = this.group('TB 등록과 제외 복원', 'rtl-simulation-registration-actions');
      this.registrations = registrations;
      this.addFolder = this.button('TB 폴더 설정', () => this.registerTestPath('folder'), 'add-tb-folder');
      this.addFile = this.button('TB 파일 가져오기', () => this.registerTestPath('file'), 'add-tb-file');
      this.restoreTest = this.button('제외한 TB 복원', () => this.restoreExcludedTest(), 'restore-tb');
      registrations.append(this.addFile, this.addFolder); projectActions.append(registrations);
      this.emptyTests.className = 'rtl-simulation-empty'; this.emptyTests.textContent = '테스트벤치 폴더에 코드를 추가하면 목록에 표시됩니다. 다른 위치의 파일은 프로젝트 설정에서 등록할 수 있습니다.';
      this.testScope.className = 'rtl-simulation-scope';
      tests.append(this.emptyTests, this.rows);
      const details = mainWindow.document.createElement('details'); details.className = 'rtl-simulation-card rtl-simulation-log';
      const summary = mainWindow.document.createElement('summary'); summary.textContent = '실행 로그';
      this.log.tabIndex = 0; this.log.setAttribute('aria-label', 'Simulation log');
      details.open = false; details.append(summary, this.log);
      const importTitle = mainWindow.document.createElement('h2'); importTitle.textContent = '프로젝트 가져오기';
      const importNote = mainWindow.document.createElement('p'); importNote.textContent = '찾은 파일과 역할을 확인한 뒤 분류 저장을 누르면 rtl.toml에 기록합니다. 원본 코드는 수정하지 않습니다. 실행 후보는 의미 분석 확인이 필요합니다.';
      this.importArea.className = 'rtl-simulation-card rtl-simulation-import';
      this.importArea.setAttribute('aria-label', '프로젝트 가져오기'); this.importArea.hidden = true;
      this.importSearch.type = 'search'; this.importSearch.placeholder = '파일 검색'; this.importSearch.setAttribute('aria-label', '가져오기 파일 검색');
      this.importSearch.addEventListener('input', () => { this.reviewSignature = ''; this.paintReview(); });
      this.importIncludes.placeholder = '추가 include 폴더 (프로젝트 상대 경로, 한 줄에 하나)';
      this.importIncludes.setAttribute('aria-label', '추가 include 폴더');
      this.importIncludes.addEventListener('input', () => { this.settingsSourceChanged = true; });
      const advanced = mainWindow.document.createElement('section'), advancedTitle = mainWindow.document.createElement('h3');
      advancedTitle.textContent = '헤더 파일 검색 폴더';
      const includeNote = mainWindow.document.createElement('p'); includeNote.textContent = '`include로 불러오는 .vh/.svh 파일을 찾을 추가 폴더입니다. 프로젝트 상대 경로를 한 줄에 하나씩 입력하세요. 필요 없으면 비워 둡니다.';
      advanced.append(advancedTitle, includeNote, this.importIncludes);
      importTitle.textContent = '프로젝트 소스'; importNote.textContent = '설계 파일·테스트벤치와 헤더 검색 폴더를 확인합니다. 변경은 적용할 때만 저장하며 원본 코드는 수정하지 않습니다.';
      this.importArea.append(importTitle, importNote, advanced, this.importSearch, this.importContent);
      const projectHeading = mainWindow.document.createElement('div'); projectHeading.className = 'rtl-simulation-section-heading'; projectHeading.append(this.status, this.reload);
      controls.append(projectHeading, this.testScope, toolbar, this.notice, this.sourceNotice, tests);
      this.page.className = 'rtl-simulation-page';
      this.logSection = details;
      this.onboarding.className = 'rtl-project-onboarding';
      this.onboardingActions.className = 'rtl-project-onboarding-actions';
      this.onboarding.append(this.onboardingTitle, this.onboardingDescription, this.onboardingActions);
      this.recentProjects.className = 'rtl-project-recents rtl-simulation-card'; this.recentProjects.hidden = true;
      this.page.append(header, this.onboarding, this.recentProjects, controls, details);
      this.settings.className = 'rtl-settings-overlay'; this.settings.hidden = true;
      this.settingsPanel.className = 'rtl-settings-panel'; this.settingsPanel.setAttribute('role', 'dialog'); this.settingsPanel.setAttribute('aria-modal', 'true'); this.settingsPanel.setAttribute('aria-label', 'Simulation 설정');
      const settingsHeading = mainWindow.document.createElement('div'); settingsHeading.className = 'rtl-simulation-section-heading';
      const settingsTitle = mainWindow.document.createElement('h2'); settingsTitle.textContent = 'Simulation 설정';
      settingsHeading.append(settingsTitle, this.iconButton('설정 닫기', () => this.closeSettings(), 'close-settings', 'close'));
      const tools = mainWindow.document.createElement('section'), toolsTitle = mainWindow.document.createElement('h3'), toolsNote = mainWindow.document.createElement('p');
      toolsTitle.textContent = '시뮬레이션 도구'; toolsNote.textContent = 'Verilator와 C++ 빌드 도구를 확인하거나 설치합니다. 설치는 별도 승인 후 진행합니다.';
      tools.append(toolsTitle, toolsNote, this.toolLocation, this.setup);
      const runNote = mainWindow.document.createElement('p'); runNote.textContent = '한 번에 실행할 테스트 수입니다. 기본은 순차 실행이며, 각 테스트의 결과와 파형은 따로 보관됩니다.'; runOptions.insertBefore(runNote, this.jobs);
      this.settingsPanel.append(settingsHeading, this.importArea, runOptions, tools, this.excludedList); this.settings.append(this.settingsPanel);
      this.settings.addEventListener('click', event => { if (event.target === this.settings) this.closeSettings(); });
      this.settings.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); this.closeSettings(); }
        if (event.key === 'Tab') {
          const elements = [...this.settingsPanel.querySelectorAll<HTMLElement>('button,input,select,textarea,summary')].filter(element => !(element as HTMLButtonElement).disabled && element.offsetParent !== null);
          const first = elements[0], last = elements.at(-1);
          if (event.shiftKey && mainWindow.document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && mainWindow.document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      });
      this.tabs.className = 'rtl-wave-tabs'; this.tabs.hidden = true;
      this.waveArea.className = 'rtl-wave-area'; this.waveArea.hidden = true;
      this.tabs.setAttribute('role', 'navigation'); this.tabs.setAttribute('aria-label', 'Simulation 탭');
      this.homeTab = this.iconButton('Simulation 홈', () => { this.restoreActive = undefined; this.showWave(); }, 'simulation-home', 'home');
      this.homeTab.setAttribute('aria-pressed', 'true'); this.tabs.append(this.homeTab);
      container.append(this.tabs, this.page, this.waveArea, this.settings);
    };
    const receive = (event: MessageEvent) => { void this.receiveWave(event); };
    mainWindow.addEventListener('message', receive);
    this._register({ dispose: () => mainWindow.removeEventListener('message', receive) });
    this._register(this.channel.listen<SimulationState>('state')(state => this.accept(state)));
    this._register(this.workspace.onDidChangeWorkspaceFolders(() => { void this.refresh().catch(error => this.fail(error)); }));
    this._register(this.trust.onDidChangeTrust(() => this.paint()));
    this._register(files.onDidFilesChange(event => {
      if (this.state.root && [...event.rawAdded, ...event.rawUpdated, ...event.rawDeleted].some(resource => extUriBiasedIgnorePathCase.isEqualOrParent(resource, URI.file(this.state.root!))
        && (!/[\\/](?:\.rtl|\.git|node_modules)([\\/]|$)/.test(resource.fsPath) || /[\\/]\.rtl[\\/]import-transactions[\\/].+[\\/]previous\.toml$/.test(resource.fsPath)))) { this.inputEpoch++; this.scheduleComparison(); this.paint(); }
    }));
    this._register(this.workingCopies.onDidChangeDirty(copy => { if (this.isInput(copy.resource)) { this.inputEpoch++; this.scheduleComparison(); this.paint(); } }));
    this._register(this.workingCopies.onDidChangeContent(copy => { if (copy.isDirty() && this.isInput(copy.resource)) { this.inputEpoch++; this.scheduleComparison(); this.paint(); } }));
    this._register(lifecycle.onBeforeShutdown(event => {
      if (this.busy) {
        event.veto(dialogs.confirm({ message: '실행 중인 시뮬레이션을 취소하고 닫을까요?', primaryButton: '취소 후 닫기' }).then(answer => !answer.confirmed), 'rtl.simulation');
      }
    }));
    this._register(lifecycle.onWillShutdown(event => {
      this.persistSession();
      event.join(this.channel.call<void>('close'), { id: 'rtl.simulation', label: '시뮬레이션 프로세스 정리' });
    }));
    this.paint();
  }
  private button(label: string, action: () => Promise<unknown> | unknown, id: string): HTMLButtonElement {
    const button = mainWindow.document.createElement('button'); button.type = 'button';
    button.textContent = label; button.dataset.action = id;
    button.addEventListener('click', () => { void Promise.resolve().then(action).catch(error => this.fail(error)); });
    return button;
  }
  private group(label: string, className: string): HTMLDivElement {
    const group = mainWindow.document.createElement('div'); group.className = className;
    group.setAttribute('role', 'group'); group.setAttribute('aria-label', label);
    return group;
  }
  openSettings(): void {
    this.ensureUi();
    this.settingsSourceChanged = false;
    this.settingsFocus = mainWindow.document.activeElement as HTMLElement | undefined;
    this.settings.hidden = false; this.page.inert = true; this.waveArea.inert = true; this.tabs.inert = true;
    this.settingsPanel.querySelector<HTMLElement>('button')?.focus();
    this.advancedOpen = true; this.paintReview(); this.paintSettings();
    if (!this.state.review && this.state.root && this.trust.isWorkspaceTrusted() && !this.busy && !this.loading) {
      void this.manageProject().then(async () => { if (this.settings.hidden) await this.refresh(); else this.paint(); }).catch(error => this.fail(error));
    }
  }
  private closeSettings(): void {
    this.settings.hidden = true; this.advancedOpen = false;
    this.page.inert = false; this.waveArea.inert = false; this.tabs.inert = false;
    this.paint(); this.settingsFocus?.focus();
    if (this.state.review?.execution) void this.refresh().catch(error => this.fail(error));
  }
  async refreshRecent(): Promise<void> {
    if (!this.uiReady) return;
    if (this.recentPending || !this.navigation) return;
    this.recentPending = true;
    try {
      const entries = await this.navigation.recent(); if (this.stopped) return;
      const title = mainWindow.document.createElement('h2'); title.textContent = '최근 프로젝트';
      this.recentProjects.replaceChildren(title);
      for (const entry of entries.slice(0, 12)) {
        const row = mainWindow.document.createElement('div'); row.className = 'rtl-project-recent'; row.title = entry.path;
        const open = this.button('', entry.open, 'open-recent-project'); open.className = 'rtl-project-recent-open';
        const name = mainWindow.document.createElement('strong'), location = mainWindow.document.createElement('span'); name.textContent = entry.name; location.textContent = entry.path;
        open.append(name, location); row.append(open);
        if (entry.remove) row.append(this.iconButton(`${entry.name} 최근 목록에서 제거`, async () => { await entry.remove!(); row.remove(); await this.refreshRecent(); }, 'remove-recent-project', 'close'));
        this.recentProjects.append(row);
      }
      if (!entries.length) { const note = mainWindow.document.createElement('p'); note.textContent = '최근에 연 프로젝트가 없습니다.'; this.recentProjects.append(note); }
      this.recentLoaded = true;
    } catch { this.recentProjects.textContent = '최근 프로젝트를 읽지 못했습니다. 최근 프로젝트 버튼으로 다시 확인해 주세요.'; }
    finally { this.recentPending = false; }
  }
  private paintSettings(): void {
    const directory = this.configuration.getValue<string>('rtl.toolsDirectory');
    this.toolLocation.textContent = `시뮬레이터: Verilator · 도구 저장 위치: ${directory || '기본 사용자 도구 폴더 (프로젝트 밖)'}`;
    const title = mainWindow.document.createElement('h3'); title.textContent = '제외된 테스트벤치';
    const note = mainWindow.document.createElement('p'); note.textContent = '코드와 실행 이력은 유지됩니다. 복원하면 실행 목록에 다시 나타납니다. 적용 전 소스 설정이 있다면 먼저 적용하세요.';
    this.excludedList.replaceChildren(title, note);
    const items = this.state.testList?.excluded ?? [];
    if (!items.length) { const empty = mainWindow.document.createElement('p'); empty.textContent = '제외된 테스트벤치가 없습니다.'; this.excludedList.append(empty); return; }
    for (const item of items.slice(0, 200)) {
      const row = mainWindow.document.createElement('div'); row.className = 'rtl-setting-list-row';
      const label = mainWindow.document.createElement('span'); label.textContent = `${item.top} · ${item.file}`;
      const restore = this.iconButton(`${item.top} 복원`, () => this.restoreItems([item]), 'restore-excluded-test', 'restore'); restore.disabled = this.busy || this.loading || !this.trust.isWorkspaceTrusted() || this.dirtyManifest;
      row.append(label, restore); this.excludedList.append(row);
    }
    const all = this.button('모두 복원', () => this.restoreItems(items, true), 'restore-all-tests'); all.disabled = this.busy || this.loading || !this.trust.isWorkspaceTrusted() || this.dirtyManifest;
    this.excludedList.append(all);
  }
  private async restoreItems(items: { file: string; top: string; name?: string }[], all = false): Promise<void> {
    const root = this.state.root, epoch = this.recordedEpoch;
    if (!root || !this.trust.isWorkspaceTrusted() || this.dirtyManifest || this.busy || this.loading) throw Error('진행 중인 작업과 프로젝트 설정을 확인해 주세요.');
    if (this.settingsSourceChanged && this.state.review) throw Error('변경한 소스 설정을 먼저 적용하거나 창을 닫고 다시 열어 주세요.');
    if (this.state.review) await this.refresh();
    if (all) {
      const revision = this.state.testList?.revision;
      if (!revision) throw Error('TB 목록을 다시 읽어 주세요.');
      await this.editTestList({ action: 'restore-all' }, root, revision, epoch); this.paintSettings(); return;
    }
    for (const item of items) {
      const revision = this.state.testList?.revision;
      if (!revision || root !== this.state.root || epoch !== this.recordedEpoch) throw Error('프로젝트가 바뀌었습니다. 다시 확인해 주세요.');
      await this.editTestList({ action: 'restore', ...item }, root, revision, epoch);
      if (this.state.error) throw Error(this.state.error);
    }
    this.paintSettings();
  }
  private iconButton(label: string, action: () => Promise<unknown> | unknown, id: string, icon: 'play' | 'terminal' | 'waveform' | 'home' | 'refresh' | 'close' | 'restore' | 'settings'): HTMLButtonElement {
    const button = this.button(label, action, id);
    button.title = icon === 'play' ? '실행' : icon === 'terminal' ? '로그' : icon === 'home' ? 'Simulation 홈' : '파형'; button.setAttribute('aria-label', label);
    const symbol = mainWindow.document.createElement('span'); symbol.className = `rtl-simulation-icon rtl-icon-${icon}`;
    symbol.setAttribute('aria-hidden', 'true'); button.replaceChildren(symbol);
    return button;
  }
  private async editTestList(edit: TestListEdit, root: string, revision: string, epoch: number): Promise<void> {
    if (this.stopped || this.recordedEpoch !== epoch || this.state.root !== root || this.busy || this.loading || this.state.phase === 'loading' || this.dirtyManifest || !this.trust.isWorkspaceTrusted() || this.state.testList?.revision !== revision) throw Error('프로젝트나 TB 목록이 바뀌었습니다. 새로고침한 뒤 다시 선택해 주세요.');
    await this.call('test-list-edit', { testEdit: edit, revision, approved: true });
  }
  private async registerTestPath(action: 'folder' | 'file'): Promise<void> {
    const root = this.state.root, revision = this.state.testList?.revision, epoch = this.recordedEpoch;
    if (!root || !revision) throw Error('프로젝트를 먼저 열어 주세요.');
    if (this.navigation) {
      const resource = await this.navigation.choosePath(action === 'folder');
      if (!resource) return;
      if (resource.scheme !== 'file') throw Error('로컬 코드 파일이나 폴더를 선택해 주세요.');
      const inside = extUriBiasedIgnorePathCase.isEqualOrParent(resource, URI.file(root));
      if (action === 'folder' && !inside) throw Error('프로젝트 안의 TB 폴더를 선택해 주세요. 외부 코드는 TB 파일 가져오기를 사용하세요.');
      const location = resource.fsPath.slice(root.length + 1).replaceAll('\\', '/');
      await this.editTestList({ action: inside ? action : 'import', path: inside ? location : resource.fsPath }, root, revision, epoch);
      return;
    }
    const value = await this.quickInput.input({ prompt: action === 'folder' ? '자동으로 TB를 찾을 폴더의 프로젝트 상대 경로' : '등록할 TB 코드 파일의 프로젝트 상대 경로', placeHolder: action === 'folder' ? 'verification/tb' : 'verification/counter_tb.sv' });
    if (value === undefined || !value.trim()) return;
    await this.editTestList({ action, path: value.trim() }, root, revision, epoch);
  }
  private async restoreExcludedTest(): Promise<void> {
    const root = this.state.root, revision = this.state.testList?.revision, epoch = this.recordedEpoch;
    if (!root || !revision) return;
    const chosen = await this.quickInput.pick((this.state.testList?.excluded ?? []).map(item => ({ label: item.top, description: item.file, item })), { placeHolder: '목록에서 제외했던 TB를 다시 등록' });
    if (chosen) await this.editTestList({ action: 'restore', ...chosen.item }, root, revision, epoch);
  }
  private async removeTest(test: SimulationTestView, root: string | undefined, epoch: number): Promise<void> {
    const revision = this.state.testList?.revision;
    if (!root || !revision || !test.source) return;
    const file = test.source.slice(root.length + 1).replaceAll('\\', '/');
    if (!extUriBiasedIgnorePathCase.isEqualOrParent(URI.file(test.source), URI.file(root))) throw Error('프로젝트 밖의 TB는 목록에서 관리할 수 없습니다.');
    await this.editTestList({ action: 'exclude', file, top: test.top, name: test.name }, root, revision, epoch);
  }
  get busy(): boolean { return this.state.phase === 'running' || this.state.phase === 'cancelling'; }
  private get dirtyManifest(): boolean {
    const root = this.state.root;
    if (!root) { return false; }
    const targets = ['rtl.toml', 'rtl-tests.json'].map(file => URI.joinPath(URI.file(root), file));
    return this.workingCopies.dirtyWorkingCopies.some(copy => copy.resource.scheme === 'file' && targets.some(target => extUriBiasedIgnorePathCase.isEqualOrParent(copy.resource, target)));
  }
  private showWave(runId?: string): void {
    if (!this.uiReady) return;
    if (runId && this.pendingWaves.has(runId)) { void this.restoreWave(runId).catch(error => this.fail(error)); return; }
    this.activeWave = runId;
    this.homeTab.setAttribute('aria-pressed', String(!runId));
    this.page.hidden = !!runId; this.waveArea.hidden = !runId;
    this.container.classList.toggle('rtl-wave-open', !!runId);
    for (const [id, item] of this.documents) {
      item.frame.hidden = id !== runId; item.tab.setAttribute('aria-current', String(id === runId));
      item.label.setAttribute('aria-pressed', String(id === runId));
    }
    this.queuePersistence();
  }
  private queuePersistence() {
    mainWindow.clearTimeout(this.persistenceTimer);
    this.persistenceTimer = mainWindow.setTimeout(() => this.persistSession(), 300);
  }
  private persistSession() {
    if (!this.persistence || !this.state.root) return;
    const root = this.state.root;
    const byId = new Map<string, RestoredWave>([...this.pendingWaves.values()].map(item => [item.wave.id, item.wave]));
    for (const item of this.documents.values()) byId.set(item.doc.runId, { id: item.doc.runId, name: item.test, file: item.doc.recorded === false ? item.doc.file : undefined, state: this.waveStates.get(item.doc.runId) });
    const waves = [...this.tabs.children].flatMap(tab => { const id = (tab as HTMLElement).dataset.runId; return id && byId.has(id) ? [byId.get(id)!] : []; });
    const project = { root, waves: waves.slice(0, 4), selected: [...this.selected].slice(0, 1000), runs: [...this.chosenRuns].slice(0, 1000), jobs: Number(this.jobs.value) || 1, activeWave: this.restoreActive ?? this.activeWave };
    this.sessionBook = { version: 1, activeRoot: root, projects: [...this.sessionBook.projects.filter(item => item.root !== root), project].slice(-20) };
    let contents = JSON.stringify(this.sessionBook);
    while (contents.length > 2 * 1024 * 1024 && this.sessionBook.projects.length > 1) { this.sessionBook.projects.shift(); contents = JSON.stringify(this.sessionBook); }
    while (contents.length > 2 * 1024 * 1024 && project.waves.length) { const index = project.waves.findIndex(wave => wave.id !== project.activeWave); project.waves.splice(index < 0 ? 0 : index, 1); contents = JSON.stringify(this.sessionBook); }
    this.persistence.write(contents);
  }
  private async clearWaveReaders() {
    const tokens = [...this.documents.values()].map(item => item.doc.token);
    for (const item of this.documents.values()) { item.frame.remove(); item.tab.remove(); }
    for (const item of this.pendingWaves.values()) item.tab.remove();
    this.documents.clear(); this.pendingWaves.clear(); this.waveStates.clear(); this.restoreActive = undefined;
    this.showWave(); this.tabs.hidden = true;
    mainWindow.clearTimeout(this.persistenceTimer);
    await Promise.all(tokens.map(token => this.channel.call('wave-close', { token })));
  }
  private restoreProjectSession() {
    const stored = this.sessionBook.projects.find(item => item.root === this.state.root);
    if (!stored) return;
    this.jobs.value = String(stored.jobs); this.restoreActive = stored.activeWave;
    for (const wave of stored.waves) {
      const tab = mainWindow.document.createElement('span'); tab.className = 'rtl-wave-tab'; tab.dataset.runId = wave.id;
      const label = this.button(wave.file ? wave.name : this.state.tests.find(test => test.name === wave.name)?.displayName ?? wave.name, () => this.restoreWave(wave.id), 'wave-tab');
      label.title = '이전 파형 · 선택하면 복원합니다.';
      const close = this.button('×', async () => { this.pendingWaves.delete(wave.id); tab.remove(); if (this.restoreActive === wave.id) this.restoreActive = undefined; this.tabs.hidden = !this.documents.size && !this.pendingWaves.size; this.persistSession(); }, 'wave-close');
      close.setAttribute('aria-label', `${wave.name} 파형 탭 닫기`); tab.append(label, close);
      this.pendingWaves.set(wave.id, { wave, tab }); this.tabs.append(tab);
    }
    this.tabs.hidden = !this.documents.size && !this.pendingWaves.size;
  }
  private async restoreWave(id: string) {
    const entry = this.pendingWaves.get(id); if (!entry || this.openingWave || this.loading || this.state.phase === 'loading') return;
    if (!entry.wave.file && !this.trust.isWorkspaceTrusted()) throw Error('프로젝트를 신뢰한 뒤 기록된 파형을 복원해 주세요.');
    const root = this.state.root, epoch = this.recordedEpoch;
    this.openingWave = true;
    try {
      const doc = await this.channel.call<WaveformDocument>(entry.wave.file ? 'wave-file' : 'wave-open', entry.wave.file ? { file: entry.wave.file } : { name: entry.wave.name, runId: id, toolsDirectory: this.configuration.getValue<string>('rtl.toolsDirectory') });
      if (this.stopped || root !== this.state.root || epoch !== this.recordedEpoch || !this.pendingWaves.has(id)) { await this.channel.call('wave-close', { token: doc.token }); return; }
      if (entry.wave.file) doc.runId = id;
      if (entry.wave.state) this.waveStates.set(id, entry.wave.state);
      await this.mountWaveform(doc, entry.wave.name); this.restoreActive = undefined;
    } finally { this.openingWave = false; this.paint(); }
  }
  private isInput(resource: URI): boolean {
    return !!this.state.root && resource.scheme === 'file' && extUriBiasedIgnorePathCase.isEqualOrParent(resource, URI.file(this.state.root)) && /\.(v|sv|vh|svh)$|[\\/](?:rtl\.toml|rtl-tests\.json)$/i.test(resource.fsPath) && !/[\\/](?:\.rtl|\.git|node_modules)([\\/]|$)/i.test(resource.fsPath);
  }
  private scheduleComparison(): void {
    this.comparisonPending = true;
    mainWindow.clearTimeout(this.comparisonTimer);
    this.comparisonTimer = mainWindow.setTimeout(() => {
      if (!this.stopped && !this.comparisonInFlight && !this.busy && !this.loading && this.state.phase !== 'loading' && !this.state.review) {
        this.comparisonPending = false;
        this.comparisonInFlight = true;
        this.comparisonError = undefined;
        void Promise.resolve().then(() => this.call('inputs', { inputOverrides: this.captureEditorInputs() })).catch(error => { this.comparisonError = String(error); this.fail(error); }).finally(() => {
          this.comparisonInFlight = false;
          this.paint();
          if (!this.stopped && this.comparisonPending) this.scheduleComparison();
        });
      }
    }, 500);
  }
  private chosenResult(test: SimulationTestView) {
    test = this.state.tests.find(current => current.name === test.name && current.top === test.top) ?? test;
    const id = this.chosenRuns.get(test.name);
    return (id && this.state.history?.find(result => result.name === test.name && result.top === test.top && result.runId === id)) || test.latest;
  }
  async openWaveform(name: string, runId?: string): Promise<void> {
    this.ensureUi();
    const id = runId ?? this.state.tests.find(test => test.name === name)?.latest?.runId;
    if (!id || this.openingWave) { return; }
    if (this.documents.has(id)) { this.showWave(id); return; }
    if (this.pendingWaves.has(id)) { await this.restoreWave(id); return; }
    if (this.documents.size + this.pendingWaves.size >= 4) throw Error('파형 탭은 최대 4개입니다. 이전 탭을 닫고 열어 주세요.');
    const recorded = this.state.history?.find(result => result.name === name && result.runId === id) ?? this.historicalResults.get(id) ?? this.state.tests.find(test => test.name === name)?.latest;
    const viewer = this.configuration.getValue<string>('rtl.waveform.viewer');
    if (viewer === 'gtkwave' || recorded?.waveform?.toLowerCase().endsWith('.fst')) {
      await this.externalWaveform({ name, runId: id }); return;
    }
    this.openingWave = true; this.paint();
    try {
      const doc = await this.channel.call<WaveformDocument>('wave-open', { name, runId: id, toolsDirectory: this.configuration.getValue<string>('rtl.toolsDirectory') });
      await this.mountWaveform(doc, name);
    } catch (error) {
      const answer = await this.quickInput.pick([{ label: 'GTKWave로 열기', id: 'external' }, { label: '닫기', id: 'close' }], { placeHolder: `내장 파형을 열지 못했습니다: ${String(error)}` });
      if (answer?.id === 'external') await this.externalWaveform({ name, runId: id }); else this.fail(error);
    } finally { this.openingWave = false; this.paint(); }
  }
  async openWaveformFile(resource: URI): Promise<void> {
    if (resource.scheme !== 'file' || !/\.(vcd|fst)$/i.test(resource.path)) throw Error('로컬 VCD/FST 파일을 선택해 주세요.');
    if (this.openingWave) return;
    if (/\.fst$/i.test(resource.path) || this.configuration.getValue<string>('rtl.waveform.viewer') === 'gtkwave') {
      await this.externalWaveform({ file: resource.fsPath }); return;
    }
    const existing = [...this.documents.values()].find(item => item.doc.recorded === false && item.doc.file === resource.fsPath);
    if (existing) { this.showWave(existing.doc.runId); return; }
    if (this.documents.size + this.pendingWaves.size >= 4) throw Error('파형 탭은 최대 4개입니다. 이전 탭을 닫고 열어 주세요.');
    this.openingWave = true; this.paint();
    try {
      const doc = await this.channel.call<WaveformDocument>('wave-file', { file: resource.fsPath });
      await this.mountWaveform(doc, doc.name);
    } catch (error) {
      const answer = await this.quickInput.pick([{ label: 'GTKWave로 열기', id: 'external' }, { label: '닫기', id: 'close' }], { placeHolder: `내장 파형을 열지 못했습니다: ${String(error)}` });
      if (answer?.id === 'external') await this.externalWaveform({ file: resource.fsPath }); else this.fail(error);
    } finally { this.openingWave = false; this.paint(); }
  }
  private async externalWaveform(request: { token?: string; name?: string; runId?: string; file?: string }) {
    const standalone = !!request.file || !!request.token && [...this.documents.values()].some(item => item.doc.token === request.token && item.doc.recorded === false);
    if (!standalone && !this.trust.isWorkspaceTrusted()) throw Error('프로젝트를 신뢰한 뒤 외부 뷰어를 실행해 주세요.');
    await this.channel.call('wave-external', { request, approved: standalone || this.trust.isWorkspaceTrusted(), toolsDirectory: this.configuration.getValue<string>('rtl.toolsDirectory') });
  }
  private async mountWaveform(doc: WaveformDocument, name: string): Promise<void> {
      const id = doc.runId;
      if (this.stopped) { await this.channel.call('wave-close', { token: doc.token }); return; }
      const placeholder = this.pendingWaves.get(id)?.tab, nextTab = placeholder?.nextSibling;
      placeholder?.remove(); this.pendingWaves.delete(id);
      const frame = mainWindow.document.createElement('iframe'); frame.title = `파형 ${doc.name}`;
      frame.setAttribute('sandbox', 'allow-scripts'); frame.setAttribute('referrerpolicy', 'no-referrer');
      const tab = mainWindow.document.createElement('span'); tab.className = 'rtl-wave-tab'; tab.dataset.runId = id;
      const record = this.state.history?.find(result => result.runId === id) ?? this.historicalResults.get(id);
      const detail = doc.recorded === false ? `${doc.file}\n외부 파형 파일` : `${name}${record?.startedAt ? '\n' + new Date(record.startedAt).toLocaleString() : ''}\n실행 ${id}`;
      const label = this.button(this.state.tests.find(test => test.name === name)?.displayName ?? record?.displayName ?? name, () => this.showWave(id), 'wave-tab'); label.title = detail;
      label.setAttribute('aria-label', detail);
      const close = this.button('×', async () => {
        const wasActive = this.activeWave === id;
        const ids = [...this.documents.keys()], index = ids.indexOf(id);
        const adjacent = ids[index + 1] ?? ids[index - 1];
        this.documents.delete(id); this.waveStates.delete(id); frame.remove(); tab.remove(); this.tabs.hidden = !this.documents.size && !this.pendingWaves.size;
        if (wasActive) this.showWave(adjacent);
        await this.channel.call('wave-close', { token: doc.token });
        this.queuePersistence();
      }, 'wave-close');
      close.title = `${name} 파형 탭 닫기`; close.setAttribute('aria-label', `${detail}\n파형 탭 닫기`);
      tab.append(label, close);
      this.documents.set(id, { doc, frame, tab, label, test: name }); this.tabs.insertBefore(tab, nextTab ?? null); this.tabs.hidden = false;
      this.waveArea.append(frame);
      frame.src = FileAccess.asBrowserUri('vs/platform/rtl/node/waveform.html' as AppResourcePath).toString(true);
      this.showWave(id);
  }
  private async receiveWave(event: MessageEvent): Promise<void> {
    const item = [...this.documents.values()].find(item => item.frame.contentWindow === event.source);
    const message = event.data?.rtlWaveform === true ? event.data.message : undefined;
    if (!item || !message || typeof message.kind !== 'string') { return; }
    const send = (value: unknown) => item.frame.contentWindow?.postMessage(value, '*');
    try {
      if (message.kind === 'sessionState') {
        const state = parseWaveSession(message.state);
        if (state) { this.waveStates.set(item.doc.runId, state); this.queuePersistence(); }
      } else if (message.kind === 'rendered' && Number.isInteger(message.rows) && message.rows >= 0 && message.rows <= 160 && typeof message.aligned === 'boolean' && typeof message.cursor === 'string') {
        item.rendered = { rows: message.rows, aligned: message.aligned, cursor: message.cursor };
      } else if (message.kind === 'ready' || message.kind === 'reload') {
        // Immutable reader snapshot. Reload redraws this run, never the latest run.
        try { item.views = await this.channel.call<SavedWaveViews>('wave-views', { token: item.doc.token }); }
        catch (error) { item.views = { reason: String(error) }; }
        send({ kind: 'init', metadata: item.doc.metadata, name: item.doc.name, sessionState: this.waveStates.get(item.doc.runId), cursorReuse: true, link: { reason: item.doc.recorded === false ? '외부 파일: 보관 소스 연결 없음' : `Recorded run ${item.doc.runId}` }, views: item.views });
      } else if (message.kind === 'external') {
        await this.externalWaveform({ token: item.doc.token });
      } else if (message.kind === 'viewEdit') {
        if (item.editing) { return; }
        item.editing = true;
        try {
          const current = item.views, book = current?.book;
          if (!book || !current.revision) { throw Error('Saved views are unavailable. Reload and retry.'); }
          const existing = book.views.find(view => view.id === message.viewId);
          let edit: WaveViewEdit | undefined;
          let selectedId = existing?.id;
          if (message.action === 'save') {
            const target = existing ? await this.quickInput.pick([{ label: '현재 보기 덮어쓰기', id: existing.id }, { label: '새 보기로 저장', id: '' }], { placeHolder: '신호 보기 저장' }) : { id: '' };
            if (!target) { return; }
            const name = target.id ? existing!.name : await this.quickInput.input({ prompt: '신호 보기 이름', placeHolder: '예: 기본 신호, 제어 신호', validateInput: async value => !value.trim() || value.trim().length > 60 || /[\x00-\x1f]/.test(value) ? '1~60자 이름을 입력하세요.' : book.views.some(view => view.name.toLowerCase() === value.trim().toLowerCase()) ? '이미 사용 중인 이름입니다.' : undefined });
            if (!name) { return; }
            const previous = target.id ? existing : undefined;
            selectedId = target.id || mainWindow.crypto.randomUUID();
            const view = parseView({ ...message.view, id: selectedId, name });
            view.signals = retainMissing(view.signals, previous, item.doc.metadata.signals);
            edit = { action: 'save', revision: current.revision, view };
          } else if (message.action === 'default' && existing) {
            edit = { action: 'default', revision: current.revision, id: book.defaultId === existing.id ? undefined : existing.id };
          } else if (message.action === 'manage' && existing) {
            const action = await this.quickInput.pick([{ label: '이름 변경', id: 'rename' }, { label: '저장된 보기 삭제', id: 'delete' }], { placeHolder: existing.name });
            if (!action) { return; }
            if (action.id === 'delete') {
              const answer = await this.quickInput.pick([{ label: '삭제', id: 'yes' }, { label: '취소', id: 'no' }], { placeHolder: `${existing.name} 보기를 삭제할까요?` });
              if (answer?.id !== 'yes') { return; }
              edit = { action: 'delete', revision: current.revision, id: existing.id }; selectedId = undefined;
            } else {
              const name = await this.quickInput.input({ prompt: '보기 이름 변경', value: existing.name });
              if (!name) { return; }
              edit = { action: 'save', revision: current.revision, view: parseView({ ...existing, name }) };
            }
          } else { throw Error('Invalid saved view operation.'); }
          const updated = await this.channel.call<SavedWaveViews>('wave-view-edit', { token: item.doc.token, edit });
          for (const other of this.documents.values()) {
            if (other.test !== item.test) { continue; }
            other.views = updated;
            other.frame.contentWindow?.postMessage({ kind: other === item ? 'views' : 'viewsChanged', views: updated, selectedId }, '*');
          }
        } catch (error) {
          try { item.views = await this.channel.call<SavedWaveViews>('wave-views', { token: item.doc.token }); send({ kind: 'viewsChanged', views: item.views }); } catch { /* Preserve existing selection on damaged data. */ }
          send({ kind: 'viewError', error: String(error) });
        } finally { item.editing = false; send({ kind: 'viewDone' }); }
      } else if (['window', 'values', 'edge'].includes(message.kind) && Number.isSafeInteger(message.requestId)) {
        const query: WaveformQuery = { token: item.doc.token, kind: message.kind, request: message.request, signal: message.signal, time: message.time, direction: message.direction };
        const result = await this.channel.call<unknown>('wave-query', { query });
        if (this.documents.has(item.doc.runId)) { send({ kind: message.kind, requestId: message.requestId, result }); }
      }
    } catch (error) { send({ kind: 'error', requestId: message.requestId, error: String(error) }); }
  }
  async enter(): Promise<void> {
    this.ensureUi();
    // The initial inspection can already be in flight when the saved workspace
    // becomes visible. Join it before reading the restored active waveform.
    if (this.refreshPending) await this.refreshPending;
    else if (!this.state.root && !this.loading) await this.refresh();
    else this.scheduleComparison();
    if (!this.stopped && this.restoreActive) await this.restoreWave(this.restoreActive);
  }
  private async call(command: string, arg?: unknown): Promise<void> {
    this.accept(await this.channel.call<SimulationState>(command, arg));
  }
  async refresh(requestedRoot?: string): Promise<void> {
    if (this.refreshPending) return this.refreshPending;
    if (this.busy || this.loading || this.stopped) { return; }
    const folders = this.workspace.getWorkspace().folders;
    const local = folders.filter(folder => folder.uri.scheme === 'file');
    const wanted = requestedRoot ?? this.state.root ?? this.sessionBook.activeRoot;
    const folder = local.find(folder => wanted && extUriBiasedIgnorePathCase.isEqual(folder.uri, URI.file(wanted))) ?? (requestedRoot ? undefined : local[0]);
    if (!folder) {
      if (requestedRoot) throw Error('열려 있는 로컬 프로젝트를 선택해 주세요.');
      if (this.state.root) {
        this.persistSession(); this.loading = true;
        try { await this.clearWaveReaders(); await this.call('project-reset'); }
        finally { this.loading = false; this.paint(); }
      }
      this.status.textContent = '로컬 프로젝트 폴더를 열어 주세요.'; return;
    }
    if (this.openingWave) throw Error('파형 열기가 끝난 뒤 프로젝트를 전환해 주세요.');
    if (this.state.root && !extUriBiasedIgnorePathCase.isEqual(URI.file(this.state.root), folder.uri)) {
      if (this.dirtyManifest) throw Error('현재 프로젝트 설정에 미저장 변경이 있습니다. 검토한 뒤 전환해 주세요.');
      this.persistSession(); this.loading = true; this.paint();
      try { await this.clearWaveReaders(); } catch (error) { this.loading = false; this.paint(); throw error; }
    }
    this.loading = true; this.paint();
    this.displayedLog = undefined;
    const work = (async () => {
      try { await this.call('inspect', { root: folder.uri.fsPath }); }
      catch (error) { this.fail(error); }
      finally { this.loading = false; this.scheduleComparison(); this.paint(); }
    })();
    this.refreshPending = work;
    try { await work; } finally { if (this.refreshPending === work) this.refreshPending = undefined; }
  }
  async start(names?: string[], tags?: string[]): Promise<void> {
    this.ensureUi();
    if (!this.trust.isWorkspaceTrusted()) { this.fail('신뢰하지 않는 프로젝트에서는 실행할 수 없습니다. 코드 편집은 계속할 수 있습니다.'); return; }
    if (this.busy || this.loading) { return; }
    if (this.dirtyManifest) throw Error('프로젝트 설정에 미저장 변경이 있습니다. 먼저 변경을 검토해 주세요.');
    if (!this.state.root) throw Error('프로젝트를 먼저 열어 주세요.');
    const inputOverrides = this.captureEditorInputs();
    this.displayedLog = undefined;
    await this.call('start', { names, inputOverrides, options: { tags, jobs: Number(this.jobs.value) || 1 }, approved: this.trust.isWorkspaceTrusted(), toolsDirectory: this.configuration.getValue<string>('rtl.toolsDirectory') });
  }
  private async openHistory(): Promise<void> {
    const root = this.state.root, epoch = this.recordedEpoch;
    const history = await this.channel.call<SimulationResultView[]>('history', { limit: 1000 });
    const check = () => { if (this.stopped || root !== this.state.root || epoch !== this.recordedEpoch) throw Error('프로젝트가 바뀌었습니다. 이력을 다시 열어 주세요.'); };
    check(); this.historicalResults.clear();
    for (const result of history) if (result.runId) this.historicalResults.set(result.runId, result);
    const selected = await this.quickInput.pick(history.filter(result => !!result.runId).map(result => ({
      label: result.displayName ?? result.name,
      description: `${result.status} · ${result.startedAt ? new Date(result.startedAt).toLocaleString() : '이전 실행'}`,
      detail: `${result.top} · ${Math.round(result.durationMs)} ms${this.state.tests.some(test => test.name === result.name) ? '' : ' · 현재 목록에서 제외됨'}`,
      result
    })), { placeHolder: history.length ? '최근 실행 최대 1,000개 · 현재 목록에서 제외한 테스트도 보존됩니다.' : '아직 실행 이력이 없습니다.' });
    if (!selected) return; check(); const result = selected.result;
    const actions = [{ label: '실행 로그', id: 'log' }, { label: '보관 소스', id: 'source' }, ...(result.waveform ? [{ label: '파형 열기', id: 'wave' }] : []), ...(this.state.tests.some(test => test.name === result.name) ? [{ label: '다시 실행', id: 'run' }] : [])];
    const action = await this.quickInput.pick(actions, { placeHolder: selected.label });
    if (!action) return; check();
    if (action.id === 'wave') await this.openWaveform(result.name, result.runId);
    else if (action.id === 'source') await this.openRecordedSource(result.name, result.runId);
    else if (action.id === 'run') await this.start([result.name]);
    else { this.displayedLog = await this.channel.call<string>('log', { name: result.name, runId: result.runId }); check(); this.paint(); }
  }
  private captureEditorInputs() {
    // Synchronous capture before IPC or editor/space changes. Never save files.
    if (!this.state.root) return [];
    const root = URI.file(this.state.root);
    const inputOverrides = [];
    let bytes = 0;
    for (const model of this.textFiles.files.models) {
      if (!model.isDirty() || model.resource.scheme !== 'file' || !extUriBiasedIgnorePathCase.isEqualOrParent(model.resource, root) || !/\.(sv|v|svh|vh)$/i.test(model.resource.fsPath)) continue;
      const relative = extUriBiasedIgnorePathCase.relativePath(root, model.resource);
      if (!relative || relative.split('/').some(part => ['.rtl', '.git', 'node_modules'].includes(part.toLowerCase()))) continue;
      if (!['utf8', 'utf8bom'].includes(model.getEncoding() ?? '')) throw Error('미저장 RTL 실행은 UTF-8 인코딩을 지원합니다. 파일 인코딩을 확인해 주세요. 원본은 저장하지 않았습니다.');
      const value = model.textEditorModel.getValue(undefined, true);
      const text = model.getEncoding() === 'utf8bom' && !value.startsWith('\uFEFF') ? '\uFEFF' + value : value;
      const size = new TextEncoder().encode(text).length;
      if (inputOverrides.length >= 10000 || size > 32 * 1024 * 1024 || (bytes += size) > 128 * 1024 * 1024) throw Error('미저장 실행 입력 크기 제한을 초과했습니다. 원본은 저장하지 않았습니다.');
      inputOverrides.push({ path: model.resource.fsPath, text, version: model.textEditorModel.getVersionId() });
    }
    return inputOverrides;
  }
  async cancel(): Promise<void> { await this.call('cancel'); }
  fileTargets(resource: URI): SimulationTestView[] { return resource.scheme === 'file' && !this.stopped ? testsForFile(this.state, resource.fsPath, isWindows) : []; }
  get testbenchUris(): string[] { return this.explorerEnabled ? [...new Set(this.state.tests.flatMap(test => test.source ? [URI.file(test.source).toString()] : []))] : []; }
  get explorerEnabled(): boolean { return !this.stopped && !!this.state.project && !this.state.historyOnly && !this.state.importRecovery?.length && this.trust.isWorkspaceTrusted() && !this.busy && !this.loading && this.state.phase !== 'loading' && !this.state.review && !this.dirtyManifest; }
  async startFile(resource: URI): Promise<boolean> {
    if (!this.state.root && !this.loading) await this.refresh();
    if (!this.explorerEnabled) throw Error('현재는 실행할 수 없습니다. 프로젝트 신뢰, 실행 상태와 미저장 rtl.toml을 확인해 주세요.');
    const targets = this.fileTargets(resource);
    if (!targets.length) throw Error('이 파일에 등록된 실행 대상이 없습니다. 테스트 관리에서 먼저 등록해 주세요.');
    const selected = targets.length === 1 ? targets[0] : await this.quickInput.pick(targets.map(test => ({ label: test.displayName ?? test.name, description: `top: ${test.top}`, name: test.name, top: test.top })), { placeHolder: '실행할 테스트벤치를 선택하세요', matchOnDescription: true });
    if (!selected) return false;
    if (!this.explorerEnabled || !this.fileTargets(resource).some(test => test.name === selected.name && test.top === selected.top)) throw Error('실행 대상이나 프로젝트 상태가 변경되었습니다. 다시 선택해 주세요.');
    await this.start([selected.name]); return true;
  }
  async classify(roles: RoleSelection): Promise<void> {
    this.ensureUi();
    if (!this.settings.hidden) this.settingsSourceChanged = true;
    try { await this.call('classify', { roles }); }
    finally { this.reviewSignature = ''; this.paintReview(); }
  }
  folderRole(resource: URI): { role: SourceRole; inherited: boolean; saved: boolean } | undefined {
    if (resource.scheme !== 'file') return undefined;
    const folder = relativeFolder(this.state.root, resource.fsPath, isWindows);
    if (folder === undefined) return undefined;
    return folderBadge(this.state.review, this.state.savedFolderRoles, folder, isWindows);
  }
  async setFolderRole(resource: URI, role: SourceRole | undefined): Promise<void> {
    if (resource.scheme !== 'file' || !this.trust.isWorkspaceTrusted() || this.stopped || this.busy || this.loading || this.state.phase === 'loading' || this.dirtyManifest) throw Error('현재 폴더 역할을 변경할 수 없습니다. 신뢰·실행 상태·미저장 rtl.toml을 확인해 주세요.');
    if (!this.state.root) await this.refresh();
    const root = this.state.root, folder = relativeFolder(root, resource.fsPath, isWindows);
    if (folder === undefined) throw Error('현재 프로젝트 안의 폴더를 선택해 주세요.');
    if (isReservedRoleFolder(folder, isWindows)) throw Error('생성물·Git·의존성 폴더는 RTL 역할을 지정할 수 없습니다.');
    const stat = await this.files.resolve(resource);
    if (!stat.isDirectory) throw Error('폴더를 선택해 주세요.');
    if (stat.isSymbolicLink) throw Error('링크 폴더는 RTL 탐색 대상이 아닙니다. 실제 프로젝트 폴더를 선택해 주세요.');
    const segments = folder.split('/').filter(Boolean);
    for (let length = 1; length < segments.length; length++) {
      const ancestor = await this.files.resolve(URI.joinPath(URI.file(root!), ...segments.slice(0, length)));
      if (!ancestor.isDirectory || ancestor.isSymbolicLink) throw Error('링크 폴더 아래에는 RTL 역할을 지정할 수 없습니다.');
    }
    if (!this.state.review) await this.manageProject();
    const review = this.state.review;
    if (!review || this.state.root !== root || this.busy || this.loading || this.dirtyManifest || !this.trust.isWorkspaceTrusted()) throw Error(this.state.error ?? '프로젝트를 가져오거나 IDE 소유 설정의 테스트 관리를 먼저 열어 주세요.');
    await this.classify(changeFolderRole(review, folder, role, isWindows));
    if (this.state.error) throw Error(this.state.error);
    this.showWave();
  }
  async saveReview(): Promise<void> {
    this.ensureUi();
    const root = this.state.root;
    if (!root || !this.state.review) { throw Error('먼저 프로젝트 가져오기를 검토해 주세요.'); }
    if (this.dirtyManifest) {
      throw Error('프로젝트 설정에 미저장 변경이 있습니다. 먼저 저장하거나 변경을 검토해 주세요.');
    }
    await this.call('review-save', { approved: true });
  }
  async manageProject(): Promise<void> {
    if (this.state.importRecovery?.length) { await this.recoverSettings(); return; }
    if (this.dirtyManifest) throw Error('프로젝트 설정에 미저장 변경이 있습니다. 먼저 변경을 검토해 주세요.');
    if (this.state.importJournal?.archive && this.state.importJournal.count >= 64) {
      const root = this.state.root, epoch = this.recordedEpoch, plan = this.state.importJournal.archive;
      const selected = await this.quickInput.pick([{ label: '테스트 관리', action: 'manage' }, { label: '이전 설정 기록 별도 보관', action: 'archive' }], { placeHolder: `설정 기록 ${this.state.importJournal.count}개 · 별도 보관하면 파일을 유지하며 조회 부담을 줄입니다` });
      if (!selected) return;
      if (this.stopped || root !== this.state.root || epoch !== this.recordedEpoch || this.busy || this.loading || this.state.phase === 'loading' || this.dirtyManifest || !this.trust.isWorkspaceTrusted() || this.state.importJournal?.archive?.revision !== plan.revision) throw Error('보관할 기록이나 프로젝트가 바뀌었습니다. 다시 확인해 주세요.');
      if (selected.action === 'archive') { await this.archiveSettings(); return; }
    }
    this.showWave();
    await this.call('manage', { approved: this.trust.isWorkspaceTrusted() });
  }
  private async archiveSettings(): Promise<void> {
    const root = this.state.root, epoch = this.recordedEpoch, plan = this.state.importJournal?.archive;
    if (!root || !plan) return;
    const check = () => { if (this.stopped || root !== this.state.root || epoch !== this.recordedEpoch || this.busy || this.loading || this.state.phase === 'loading' || this.dirtyManifest || !this.trust.isWorkspaceTrusted() || this.state.importJournal?.archive?.revision !== plan.revision) throw Error('보관할 기록이나 프로젝트가 바뀌었습니다. 다시 확인해 주세요.'); };
    check();
    const answer = await this.dialogs.confirm({ message: `이전 설정 기록 ${plan.count}개를 별도 보관할까요?`, detail: `현재 설정은 유지하고 파일을 삭제하지 않습니다. 약 ${Math.ceil(plan.bytes / 1024)} KiB를 별도 보관하며 ${plan.retained}개 기록은 계속 확인합니다. 보관한 기록은 자동 변경 검사에서 제외됩니다. 이전 설정을 열어 둔 다른 프로그램은 먼저 닫아 주세요.`, primaryButton: '별도 보관' });
    if (!answer.confirmed) return;
    check(); await this.call('import-archive', { archive: plan, approved: true });
  }
  private async recoveryBytes(resource: URI): Promise<Uint8Array> {
    const { root, request, choice } = JSON.parse(resource.query);
    const epoch = this.recordedEpoch;
    if (this.stopped || root !== this.state.root || !request || !['current', 'previous', 'candidate'].includes(choice)) throw Error('복구할 프로젝트나 설정 후보가 바뀌었습니다.');
    return this.recordedTexts.read(resource.toString(), async () => {
      const text = await this.channel.call<string>('import-recovery-text', { recovery: request, choice });
      if (this.stopped || root !== this.state.root || epoch !== this.recordedEpoch) throw Error('복구할 프로젝트가 바뀌었습니다.');
      return new TextEncoder().encode(text);
    });
  }
  private async recoverSettings(): Promise<void> {
    if (!this.trust.isWorkspaceTrusted() || this.dirtyManifest || this.busy || this.loading || this.state.phase === 'loading') throw Error('프로젝트 신뢰와 미저장 rtl.toml을 먼저 확인해 주세요.');
    const root = this.state.root, epoch = this.recordedEpoch, request = this.state.importRecovery?.[0];
    if (!root || !request) return;
    const labels: Record<ImportRecoveryChoice, string> = { current: '현재 rtl.toml 유지', previous: '이전 설정 복원', candidate: '요청한 설정 적용' };
    const choices = (['current', 'previous', 'candidate'] as const).filter(choice => request[choice]).map(choice => ({ label: labels[choice], choice }));
    const selected = await this.quickInput.pick(choices, { placeHolder: '복구할 설정을 선택하면 읽기 전용으로 내용을 확인할 수 있습니다' });
    if (!selected) return;
    const check = () => { if (this.stopped || root !== this.state.root || epoch !== this.recordedEpoch || this.busy || this.loading || this.state.phase === 'loading' || this.dirtyManifest || !this.trust.isWorkspaceTrusted() || this.state.importRecovery?.[0]?.revision !== request.revision) throw Error('복구할 설정이나 프로젝트가 바뀌었습니다. 다시 확인해 주세요.'); };
    check();
    const resource = (choice: ImportRecoveryChoice) => URI.from({ scheme: 'rtl-import-recovery', path: `/${request.id}/${choice}.toml`, query: JSON.stringify({ root, request, choice }) });
    const selectedResource = resource(selected.choice); await this.recoveryBytes(selectedResource); check();
    if (request.current && selected.choice !== 'current') {
      const current = resource('current'); await this.recoveryBytes(current); check();
      await this.editors.openEditor({ original: { resource: current, label: '현재 설정' }, modified: { resource: selectedResource, label: labels[selected.choice] }, label: '설정 복구 · 읽기 전용 비교', options: { pinned: true } });
    } else await this.editors.openEditor({ resource: selectedResource, label: labels[selected.choice], description: '설정 복구 · 읽기 전용', options: { pinned: true } });
    check();
    const answer = await this.dialogs.confirm({ message: `${labels[selected.choice]}로 복구할까요?`, detail: '열린 읽기 전용 내용을 확인해 주세요. 다른 후보는 보관되며, 확인 뒤 설정이 바뀌면 복구를 중단합니다.', primaryButton: '복구' });
    if (!answer.confirmed) return;
    check(); await this.call('import-recover', { recovery: request, choice: selected.choice, approved: true });
  }
  async prepareReview(selection?: ImportSelection, register = false): Promise<void> {
    this.ensureUi();
    if (!this.trust.isWorkspaceTrusted()) { throw Error('신뢰하지 않는 프로젝트에서는 의미 분석을 실행할 수 없습니다.'); }
    if (this.dirtyManifest) { throw Error('프로젝트 설정에 미저장 변경이 있습니다. 먼저 검토해 주세요.'); }
    await this.call(register ? 'review-confirm' : 'review-prepare', { selection: selection ?? { ids: [...this.importTops], includeDirs: this.importIncludes.value.split(/\r?\n/).map(line => line.trim()).filter(Boolean), defines: this.state.review?.execution?.defines }, approved: this.trust.isWorkspaceTrusted(), toolsDirectory: this.configuration.getValue<string>('rtl.toolsDirectory') });
  }
  private fail(error: unknown): void { this.userError = String(error); this.status.textContent = this.userError; this.paintOnboarding(); }
  private accept(state: SimulationState): void {
    if (this.stopped || state.revision < this.state.revision) { return; }
    const wasBusy = this.busy;
    const changedRoot = this.state.root !== state.root;
    if (changedRoot) { this.recordedEpoch++; this.recordedTexts.clear(); this.historicalResults.clear(); this.jobs.value = '1'; this.advancedOpen = false; this.restoringSelection = true; }
    this.state = state;
    if (wasBusy && !this.busy && this.state.root && !this.workspace.getWorkspace().folders.some(folder => folder.uri.scheme === 'file' && extUriBiasedIgnorePathCase.isEqual(folder.uri, URI.file(this.state.root!)))) {
      mainWindow.setTimeout(() => { void this.refresh().catch(error => this.fail(error)); }, 0);
    }
    if (changedRoot) this.restoreProjectSession();
    this.userError = undefined;
    if ((wasBusy && !this.busy) || (this.comparisonPending && !this.busy && !this.loading && state.phase !== 'loading' && !state.review)) { this.scheduleComparison(); }
    // Compiler output can arrive in many small chunks. Keep keyboard focus and
    // checkbox nodes intact; only patch row statuses and the bounded log text.
    if (!this.paintQueued) {
      this.paintQueued = true;
      mainWindow.requestAnimationFrame(() => { this.paintQueued = false; if (!this.stopped) { this.paint(); } });
    }
  }
  private paint(): void {
    const explorerSignature = JSON.stringify([this.state.root, this.state.project, this.state.tests.map(test => [test.name, test.top, test.source]), this.explorerEnabled, this.state.review, this.state.savedFolderRoles]);
    if (explorerSignature !== this.explorerSignature) { this.explorerSignature = explorerSignature; this.explorerChanged.fire(); }
    if (!this.uiReady) return;
    this.paintOnboarding();
    this.projectPicker.hidden = this.workspace.getWorkspace().folders.filter(folder => folder.uri.scheme === 'file').length < 2;
    this.projectPicker.disabled = this.busy || this.loading || this.openingWave;
    this.projectPicker.textContent = this.state.project ?? '프로젝트 선택';

    const trusted = this.trust.isWorkspaceTrusted();
    const disabled = this.busy || this.loading || this.state.phase === 'loading' || !!this.state.review || !!this.state.historyOnly || !!this.state.importRecovery?.length || !this.state.project || !this.state.tests.length || !trusted;
    this.manage.disabled = this.busy || this.loading || this.state.phase === 'loading' || !this.state.root || !trusted;
    const listLocked = this.busy || this.loading || this.state.phase === 'loading' || !this.state.testList || !!this.state.review || !!this.state.importRecovery?.length || this.dirtyManifest || !trusted;
    this.addFolder.disabled = listLocked; this.addFile.disabled = listLocked;
    this.restoreTest.disabled = listLocked || !this.state.testList?.excluded.length;
    this.registrations.hidden = !this.state.testList;
    this.all.disabled = disabled; this.selection.disabled = disabled || !this.selected.size;
    this.tagRun.disabled = disabled; this.tagRun.hidden = !this.state.tests.some(test => test.tags?.length);
    this.jobs.disabled = disabled; this.historyButton.disabled = this.busy || this.loading || !this.state.root;
    this.setup.disabled = this.busy || this.loading;
    this.stop.disabled = (!this.busy && !(this.state.phase === 'loading' && this.state.root)) || this.state.phase === 'cancelling'; this.reload.disabled = this.busy || this.loading || this.state.phase === 'loading';
    this.status.textContent = this.state.error ?? (this.busy ? `${this.state.phase === 'cancelling' ? '취소 중' : '실행 중'}${this.state.activeTest ? ': ' + this.state.activeTest : ''}`
      : this.loading || this.state.phase === 'loading' ? '프로젝트를 읽는 중…' : this.state.review ? `설정 전 · 파일 ${this.state.review.inventory.sources.length}개 · 실행 후보 ${this.state.review.inventory.tops.length}개` : this.state.project ? `${this.state.project} · 테스트 ${this.state.tests.length}개` : '프로젝트를 열어 주세요.');
    this.status.dataset.phase = this.state.error ? 'error' : this.busy ? this.state.phase : this.loading ? 'loading' : this.state.phase;
    const count = `${this.state.tests.length}개`;
    if (this.testCount.textContent !== count) { this.testCount.textContent = count; }
    this.emptyTests.hidden = this.state.tests.length > 0;
    const folders = this.state.testList?.folders ?? [];
    this.testScope.hidden = false;
    const scope = folders.length ? `자동 추적 중 · ${folders.map(folder => folder || '프로젝트 전체').join(' · ')}` : 'TB 폴더 미설정 · 폴더를 설정하면 파일 추가·삭제를 자동으로 추적합니다.';
    if (this.testScope.textContent !== scope) { this.testScope.textContent = scope; }
    this.notice.textContent = this.state.historyOnly ? '보관 이력을 표시합니다. 현재 설정과 소스를 복구한 뒤 새로고침하면 실행할 수 있습니다.' : trusted ? '실행 시점의 RTL 편집 내용을 보존합니다. 보관 소스에서 실제 사용한 코드를 읽기 전용으로 확인하세요.' : '신뢰하지 않는 프로젝트입니다. 실행은 잠겨 있고 코드 편집은 가능합니다.';
    this.notice.hidden = trusted && !this.state.historyOnly;
    const sync = this.state.sourceSync;
    this.manage.title = this.state.importRecovery?.length ? 'Simulation 설정 · 복구 필요' : 'Simulation 설정';
    this.sourceNotice.hidden = !!this.state.review || !sync || ['matching', 'protected'].includes(sync.state);
    this.sourceNotice.textContent = this.dirtyManifest && !this.sourceNotice.hidden
      ? '△ 파일 구성이 바뀌었거나 비교가 불가능합니다. 프로젝트 설정의 미저장 변경을 먼저 검토해 주세요.'
      : sync?.state === 'changed' ? `△ 추가 ${sync.added.length} · 삭제/누락 ${sync.removed.length} · 새 실행 후보 ${sync.candidates.length}. IDE 관리 폴더의 목록은 자동으로 갱신됩니다. 실행은 버튼을 눌렀을 때만 시작합니다.` : sync?.message ?? '';
    this.sourceNotice.title = sync ? [...sync.added.map(file => `추가: ${file}`), ...sync.removed.map(file => `삭제/누락: ${file}`), ...sync.candidates.map(file => `후보: ${file}`)].join('\n') : '';
    const signature = JSON.stringify([this.state.root, this.state.tests.map(test => [test.name, test.top, test.source])]);
    if (signature !== this.signature) {
      const changedRoot = this.state.root !== JSON.parse(this.signature || '[null]')[0];
      const focus = !changedRoot && this.rows.contains(mainWindow.document.activeElement) ? mainWindow.document.activeElement as HTMLElement : undefined;
      if (changedRoot) { this.selected.clear(); this.chosenRuns.clear(); this.runComparisons.clear(); this.inputEpoch++; this.rows.replaceChildren(); this.rowElements.clear(); }
      if (this.restoringSelection && this.state.phase !== 'loading') {
        const stored = this.sessionBook.projects.find(project => project.root === this.state.root);
        for (const name of stored?.selected ?? []) this.selected.add(name);
        for (const [name, run] of stored?.runs ?? []) this.chosenRuns.set(name, run);
        this.restoringSelection = false;
      }
      for (const name of this.selected) { if (!this.state.tests.some(test => test.name === name)) { this.selected.delete(name); } }
      const identities = new Map(this.state.tests.map(test => [test.name, JSON.stringify([test.top, test.source])]));
      for (const [name, row] of this.rowElements) if (identities.get(name) !== row.identity) {
        row.element.remove(); this.rowElements.delete(name); this.chosenRuns.delete(name);
      }
      for (const [index, test] of this.state.tests.entries()) {
        if (!this.rowElements.has(test.name)) this.addRow(test);
        const element = this.rowElements.get(test.name)!.element;
        if (this.rows.children[index] !== element) this.rows.insertBefore(element, this.rows.children[index] ?? null);
      }
      this.signature = signature;
      if (focus && this.rows.contains(focus) && mainWindow.document.activeElement !== focus) focus.focus({ preventScroll: true });
    }
    this.selection.disabled = disabled || !this.selected.size;
    for (const test of this.state.tests) {
      const row = this.rowElements.get(test.name)!;
      row.run.disabled = disabled;
      const records = (this.state.history ?? []).filter(result => result.name === test.name && result.top === test.top && result.runId);
      const historySignature = JSON.stringify(records.map(result => [result.runId, result.status, result.startedAt]));
      if (row.historySignature !== historySignature) {
        row.historySignature = historySignature; row.history.replaceChildren();
        for (const record of records) {
          const option = mainWindow.document.createElement('option'); option.value = record.runId!;
          option.textContent = `${record.runId === test.latest?.runId ? '최근 · ' : ''}${record.startedAt ? new Date(record.startedAt).toLocaleString() : '날짜 없음'} · ${record.status}${record.unsavedFiles?.length ? ' · 미저장 입력' : ''} · ${record.runId!.slice(0, 8)}`;
          row.history.append(option);
        }
      }
      row.history.hidden = records.length < 2;
      const result = this.chosenResult(test);
      row.history.value = result?.runId ?? '';
      row.result.textContent = this.state.activeTest === test.name && this.busy ? '실행 중' : result ? `${result.runId !== test.latest?.runId ? '이전 실행 · ' : ''}${{ passed: 'PASS', failed: 'FAIL', cancelled: '취소', timedOut: '시간 초과' }[result.status]} · ${(result.durationMs / 1000).toFixed(1)}초${result.waveform ? ' · 파형 생성됨' : ''}` : '실행 전';
      row.result.dataset.status = this.state.activeTest === test.name && this.busy ? 'running' : result?.status ?? 'idle';
      if (result?.unsavedFiles?.length) row.result.textContent += ' · 미저장 입력';
      row.result.title = [result?.message, result?.unsavedFiles?.length ? `실행 시 편집 내용을 보존한 파일:\n${result.unsavedFiles.join('\n')}` : undefined].filter(Boolean).join('\n');
      const dirty = this.state.root && this.workingCopies.dirtyWorkingCopies.some(copy => copy.resource.scheme === 'file'
        && extUriBiasedIgnorePathCase.isEqualOrParent(copy.resource, URI.file(this.state.root!)) && /\.(sv|v|svh|vh)$|[\\/]rtl\.toml$/i.test(copy.resource.fsPath));
      const previous = result?.runId && result.runId !== test.latest?.runId;
      const explicit = result?.runId ? this.runComparisons.get(result.runId) : undefined;
      const valid = explicit?.epoch === this.inputEpoch;
      const comparison = valid ? explicit.result.current : previous ? undefined : this.comparisonError ? { state: 'unavailable', message: this.comparisonError } : test.latest?.currentInputs;
      row.warning.textContent = this.dirtyManifest ? '△ 미저장 설정' : this.selectedComparison === result?.runId && !!result ? '선택한 실행 비교 중…' : explicit && !valid ? '비교 후 변경됨 · 다시 비교' : previous && !comparison ? '이전 실행 · 현재 입력 비교 미실시' : !previous && (this.comparisonPending || this.comparisonInFlight) ? '입력 비교 중…' : comparison?.state === 'changed' ? previous ? '△ 선택한 실행과 다름' : '△ 실행 후 변경됨' : comparison && ['legacy', 'unavailable'].includes(comparison.state) ? '△ 비교 불가' : comparison?.state === 'matching' ? dirty ? '현재 편집 내용 일치 · 미저장' : '현재 입력 일치' : dirty ? '△ 미저장 변경' : '';
      row.warning.dataset.state = !this.dirtyManifest && !dirty && comparison?.state === 'matching' && (!explicit || valid) && !this.selectedComparison && !this.comparisonPending && !this.comparisonInFlight ? 'matching' : 'attention';
      row.warning.title = this.dirtyManifest ? '프로젝트 설정의 미저장 변경은 실행에 사용하지 않습니다. 먼저 검토해 주세요.' : [comparison?.message, (valid ? explicit.result.saved : previous ? undefined : test.latest?.inputs)?.state === 'changed' ? '디스크에 저장된 입력은 이 실행과 다릅니다. 현재 편집 내용 비교와 별개입니다.' : undefined].filter(Boolean).join('\n');
      row.log.disabled = !result || this.busy;
      row.wave.disabled = !result?.waveform || !result.runId || this.openingWave;
      row.source.disabled = !result?.runId || this.busy;
      row.compare.disabled = !result?.runId || !this.state.project || this.busy || !!this.state.historyOnly || !!this.selectedComparison || this.dirtyManifest;
      row.diff.disabled = !result?.runId || this.busy || !!this.state.historyOnly;
      row.remove.disabled = listLocked || !!this.state.historyOnly || !test.source;
    }
    const output = this.displayedLog ?? this.state.log;
    if (this.log.textContent !== output) { this.log.textContent = output; }
    this.paintReview();
  }
  private paintOnboarding(): void {
    if (!this.uiReady) return;
    const review = this.state.review;
    const noFolder = !this.workspace.getWorkspace().folders.length;
    const preparing = !!review && !review.execution && !this.state.project;
    const unresolved = !noFolder && !this.state.project && !this.state.historyOnly && !review?.execution;
    this.title.textContent = noFolder ? 'Pulse' : 'Simulation';
    this.description.textContent = noFolder ? 'RTL 설계와 시뮬레이션을 시작하세요.' : '테스트를 실행하고 결과와 파형을 확인하세요.';
    this.controls.hidden = noFolder || unresolved;
    this.testsSection.hidden = noFolder || unresolved;
    this.logSection.hidden = noFolder || unresolved;
    this.container.classList.toggle('rtl-start-page', noFolder);
    this.container.classList.toggle('rtl-simulation-ready', !noFolder && !unresolved);
    this.manage.hidden = noFolder;
    this.recentProjects.hidden = !noFolder;
    if (noFolder && !this.recentLoaded) void this.refreshRecent();
    this.onboarding.hidden = !noFolder && !unresolved;
    if (this.onboarding.hidden) return;
    if (preparing && this.initialTopSignature !== this.state.root) {
      this.initialTopSignature = this.state.root ?? '';
      this.importTops.clear();
      for (const top of review!.inventory.tops) if (top.intent === 'simulation') this.importTops.add(top.id);
    }
    const signature = JSON.stringify([noFolder, this.state.root, preparing, review?.inventory.sources.length, review?.inventory.tops.length, this.state.error, this.userError, this.state.phase, this.loading, this.trust.isWorkspaceTrusted(), this.dirtyManifest, this.advancedOpen]);
    if (this.onboardingSignature === signature) return;
    this.onboardingSignature = signature;
    this.onboardingActions.replaceChildren();
    if (noFolder) {
      this.onboardingTitle.textContent = '프로젝트 시작';
      this.onboardingDescription.textContent = this.userError ?? '새 RTL 프로젝트를 만들거나 기존 소스 폴더를 열어 주세요.';
      this.onboardingActions.append(this.button('새 프로젝트', () => this.commands.executeCommand('rtlIde.project.new'), 'new-project'), this.button('기존 프로젝트 열기', () => this.commands.executeCommand('rtlIde.project.open'), 'open-project'));
      return;
    }
    this.onboardingTitle.textContent = preparing ? '프로젝트 준비' : '프로젝트 설정 확인';
    this.onboardingDescription.textContent = this.state.error ?? this.userError ?? (preparing ? `${review!.inventory.sources.length}개 파일을 찾았습니다. 테스트벤치 후보를 확인하고 IDE가 프로젝트 설정을 준비합니다. 원본 코드는 그대로 유지됩니다.` : '프로젝트 설정을 읽는 중이거나 설정을 확인해야 합니다.');
    if (preparing) {
      if (!review!.inventory.sources.length) this.onboardingActions.append(this.button('여기에 새 프로젝트 만들기', () => this.commands.executeCommand('rtlIde.project.initialize'), 'new-project-here'));
      this.onboardingActions.append(this.button(review!.inventory.sources.length ? '프로젝트 준비' : '이 폴더를 프로젝트로 사용', () => this.prepareProjectEntry(), 'prepare-project'));
      this.onboardingActions.append(this.button('설정 검토', () => { this.advancedOpen = true; this.openSettings(); this.paintReview(); }, 'review-project'));
    } else if (this.state.root && this.state.error) {
      this.onboardingActions.append(this.button('설정 파일 열기', () => this.editors.openEditor({ resource: URI.joinPath(URI.file(this.state.root!), 'rtl.toml') }), 'open-project-settings'), this.button('다시 읽기', () => this.refresh(), 'retry-project'));
    }
    this.onboardingActions.append(this.button('다른 프로젝트 열기', () => this.commands.executeCommand('rtlIde.project.open'), 'open-project'));
    for (const button of Array.from(this.onboardingActions.querySelectorAll('button'))) {
      if (button.dataset.action !== 'open-project') button.disabled = this.loading || this.state.phase === 'loading' || this.busy || this.dirtyManifest;
    }
  }
  private async prepareProjectEntry(): Promise<void> {
    if (!this.trust.isWorkspaceTrusted()) throw Error('이 프로젝트를 신뢰한 뒤 준비해 주세요. 코드 편집은 계속할 수 있습니다.');
    const root = this.state.root, epoch = this.recordedEpoch, review = this.state.review;
    if (!root || !review || this.busy || this.loading || this.dirtyManifest) throw Error('프로젝트 상태를 확인하고 다시 시도해 주세요.');
    if (!review.folders.length && !review.files.length) {
      const folders = new Map<string, 'simulation'>(), files: { path: string; role: 'simulation' }[] = [];
      for (const file of review.inventory.sources.filter(source => source.role === 'simulation')) {
        const parts = file.path.split('/'); parts.pop();
        const index = parts.findIndex(part => /^(tb|testbench|testbenches|tests|sim|simulation)$/i.test(part));
        const folder = (index >= 0 ? parts.slice(0, index + 1) : parts).join('/');
        if (folder) folders.set(folder, 'simulation'); else files.push({ path: file.path, role: 'simulation' });
      }
      for (const top of review.inventory.tops.filter(top => this.importTops.has(top.id))) {
        if (review.inventory.sources.find(source => source.path === top.file)?.role !== 'simulation' && !files.some(file => file.path === top.file)) files.push({ path: top.file, role: 'simulation' });
      }
      if (!folders.size && !files.length) folders.set('tb', 'simulation');
      await this.classify({ folders: [...folders].map(([path, role]) => ({ path, role })), files });
    }
    if (this.stopped || this.state.root !== root || this.recordedEpoch !== epoch) throw Error('프로젝트가 바뀌었습니다. 다시 확인해 주세요.');
    await this.prepareReview(undefined, true);
    if (/의미 분석 도구가 없습니다/.test(this.state.error ?? '')) {
      const tools = await this.commands.executeCommand<{ phase?: string }>('rtl.setupLanguage');
      if (tools?.phase !== 'ready' || this.stopped || this.state.root !== root || this.recordedEpoch !== epoch) return;
      await this.prepareReview(undefined, true);
    }
    if (!this.state.review && this.state.project) { this.advancedOpen = false; this.paint(); }
  }
  private paintReview(): void {
    if (!this.settings.hidden) this.paintSettings();
    const review = this.state.review;
    this.importArea.hidden = !review || !this.advancedOpen;
    if (!review) { this.importContent.replaceChildren(); this.reviewSignature = ''; this.importTops.clear(); this.managedRevision = undefined; return; }
    if (review.execution && this.managedRevision !== review.manifestRevision) {
      this.managedRevision = review.manifestRevision; this.importTops.clear();
      for (const test of review.execution.tests) { const top = review.inventory.tops.find(top => top.file === test.file && top.top === test.top); if (top) this.importTops.add(top.id); }
      this.importIncludes.value = review.execution.includeDirs.join('\n');
    }
    const disabled = this.loading || this.state.phase === 'loading';
    const signature = JSON.stringify([review, this.state.importPreview, this.importSearch.value]);
    if (signature !== this.reviewSignature) {
      this.reviewSignature = signature; this.importContent.replaceChildren();
      const roleSelect = (kind: 'folder' | 'file', location: string, current?: SourceRole, inherited?: SourceRole) => {
        const select = mainWindow.document.createElement('select'); select.dataset.roleKind = kind; select.dataset.rolePath = location;
        select.setAttribute('aria-label', `${location || '프로젝트 전체'} ${kind === 'folder' ? '폴더' : '파일'} 역할`);
        for (const [value, label] of [['', `자동${inherited ? ` (${inherited === 'simulation' ? '시뮬레이션' : 'RTL'})` : ''}`], ['source', 'RTL 소스'], ['simulation', '시뮬레이션'], ['excluded', '제외']]) {
          const option = mainWindow.document.createElement('option'); option.value = value; option.textContent = label; select.append(option);
        }
        select.value = current ?? '';
        select.addEventListener('change', () => {
          const original = this.state.review!;
          const list = (kind === 'folder' ? original.folders : original.files).filter(entry => entry.path !== location);
          if (select.value) { list.push({ path: location, role: select.value as SourceRole }); }
          void this.classify({ folders: kind === 'folder' ? list : original.folders, files: kind === 'file' ? list : original.files }).catch(error => { this.reviewSignature = ''; this.paintReview(); this.fail(error); });
        });
        return select;
      };
      const folders = new Set<string>(['', ...review.folders.map(entry => entry.path)]);
      for (const source of review.inventory.sources) {
        const parts = source.path.split('/'); parts.pop();
        while (parts.length) { folders.add(parts.join('/')); parts.pop(); }
      }
      const folderDetails = mainWindow.document.createElement('section');
      const summary = mainWindow.document.createElement('h3'); summary.textContent = '폴더별 파일 종류';
      const folderNote = mainWindow.document.createElement('p'); folderNote.textContent = '각 폴더가 설계 코드인지 테스트벤치인지 지정합니다. 자동은 파일 내용과 폴더 이름으로 판단하고, 제외는 소스 탐색에서 빼는 설정입니다.'; folderDetails.append(summary, folderNote);
      for (const folder of [...folders].sort().slice(0, 200)) {
        const row = mainWindow.document.createElement('div'); row.className = 'rtl-import-folder';
        const label = mainWindow.document.createElement('span'); label.textContent = folder || '프로젝트 전체';
        row.append(label, roleSelect('folder', folder, review.folders.find(entry => entry.path === folder)?.role)); folderDetails.append(row);
      }
      if (folders.size > 200) { const note = mainWindow.document.createElement('p'); note.textContent = '폴더 역할은 처음 200개를 표시합니다. 파일 검색으로 개별 역할을 지정할 수 있습니다.'; folderDetails.append(note); }
      const saved = mainWindow.document.createElement('p'); saved.textContent = review.manifestRevision === 'absent' ? '설정 파일 없음 · 분류 저장 후 다시 열어도 복원됩니다.' : '가져오기 설정 파일 있음 · 분류를 바꾸면 다시 저장해 주세요.';
      if (review.execution) saved.textContent = '선택한 모듈을 테스트 목록으로 저장합니다. 파일 종류와 헤더 검색 폴더도 함께 반영합니다. 적용 전 변경은 창을 닫으면 취소되며, 코드와 이전 실행 결과는 유지됩니다.';
      this.importContent.append(saved, folderDetails);
      if (!review.execution) this.importContent.append(this.button('분류 저장', () => this.saveReview(), 'save-classification'));
      this.importContent.append(this.button('분류 초기화', () => this.classify({}), 'reset-classification'));
      for (const id of this.importTops) { if (!review.inventory.tops.some(top => top.id === id)) { this.importTops.delete(id); } }
      const candidates = mainWindow.document.createElement('section'), candidateTitle = mainWindow.document.createElement('h3');
      candidateTitle.textContent = `실행할 테스트벤치 모듈 (${review.inventory.tops.length}개)`;
      const candidateNote = mainWindow.document.createElement('p'); candidateNote.textContent = '시뮬레이션을 시작할 최상위 모듈을 선택합니다. 한 파일의 여러 테스트 모듈도 각각 등록할 수 있습니다.'; candidates.append(candidateTitle, candidateNote);
      for (const top of review.inventory.tops.slice(0, 200)) {
        const label = mainWindow.document.createElement('label'), checkbox = mainWindow.document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = this.importTops.has(top.id);
        checkbox.setAttribute('aria-label', `${top.file} ${top.top} 실행 top 선택`);
        checkbox.addEventListener('change', () => { this.settingsSourceChanged = true; if (checkbox.checked) { this.importTops.add(top.id); } else { this.importTops.delete(top.id); } });
        label.style.display = 'block'; label.append(checkbox, `${top.file} · ${top.top}`); candidates.append(label);
      }
      if (review.inventory.tops.length > 200) { const note = mainWindow.document.createElement('p'); note.textContent = '처음 200개 후보 표시 · 폴더 분류로 탐색 범위를 좁혀 주세요.'; candidates.append(note); }
      const analyze = this.button('선택한 테스트 분석', () => this.prepareReview(), 'prepare-import');
      analyze.dataset.requiresTrust = 'true'; this.importContent.append(candidates, analyze);
      const confirm = this.button(review.execution ? '테스트 목록 적용' : '선택한 top 등록', () => this.prepareReview(undefined, true), 'confirm-import');
      confirm.dataset.requiresTrust = 'true'; this.importContent.append(confirm);
      if (this.state.importPreview) {
        const preview = mainWindow.document.createElement('div'), title = mainWindow.document.createElement('p');
        title.textContent = '저장된 코드의 의미 분석 확인 완료 · 아직 테스트로 등록되지 않았습니다. 코드 변경 후에는 다시 확인해 주세요.'; preview.append(title);
        for (const test of this.state.importPreview.tests) { const line = mainWindow.document.createElement('p'); line.textContent = `${test.name} · top ${test.top} · ${test.file}`; preview.append(line); }
        for (const warning of this.state.importPreview.warnings) { const line = mainWindow.document.createElement('p'); line.textContent = warning; preview.append(line); }
        this.importContent.append(preview);
      }
      const filesTitle = mainWindow.document.createElement('h3'); filesTitle.textContent = '파일별 종류'; this.importContent.append(filesTitle);
      const paths = new Set([...review.inventory.sources.map(source => source.path), ...review.files.map(entry => entry.path)]);
      const query = this.importSearch.value.toLocaleLowerCase();
      const filtered = [...paths].filter(file => file.toLocaleLowerCase().includes(query)).sort();
      for (const file of filtered.slice(0, 200)) {
        const source = review.inventory.sources.find(source => source.path === file);
        const row = mainWindow.document.createElement('div'); row.className = 'rtl-import-file';
        const name = this.button(file, () => this.editors.openEditor({ resource: URI.joinPath(URI.file(review.inventory.root), ...file.split('/')) }), 'import-source');
        const label = mainWindow.document.createElement('span');
        label.textContent = source ? `${source.kind} · ${source.declarations.filter(item => item.kind === 'module' || item.kind === 'program').map(item => item.name).join(', ') || '실행 후보 없음'}` : '제외됨';
        row.append(name, label, roleSelect('file', file, review.files.find(entry => entry.path === file)?.role, source?.role)); this.importContent.append(row);
      }
      if (filtered.length > 200) { const note = mainWindow.document.createElement('p'); note.textContent = `${filtered.length}개 중 처음 200개 표시 · 파일 검색으로 범위를 좁혀 주세요.`; this.importContent.append(note); }
      const warnings = mainWindow.document.createElement('details'); const heading = mainWindow.document.createElement('summary');
      heading.textContent = `확인 필요 ${review.inventory.warnings.length}건`; warnings.append(heading);
      for (const warning of review.inventory.warnings.slice(0, 200)) { const line = mainWindow.document.createElement('p'); line.textContent = `${warning.file ?? ''} ${warning.message}`; warnings.append(line); }
      if (review.inventory.warnings.length > 200) { const note = mainWindow.document.createElement('p'); note.textContent = '확인 필요 항목은 처음 200건을 표시합니다.'; warnings.append(note); }
      this.importContent.append(warnings);
    }
    this.importIncludes.disabled = disabled;
    for (const control of this.importContent.querySelectorAll<HTMLSelectElement | HTMLButtonElement | HTMLInputElement>('select,button,input')) { control.disabled = disabled || (control.dataset.requiresTrust === 'true' && !this.trust.isWorkspaceTrusted()); }
  }
  private addRow(test: SimulationTestView): void {
    const row = mainWindow.document.createElement('div'); row.className = 'rtl-simulation-test'; row.dataset.test = test.name;
    const check = mainWindow.document.createElement('input'); check.type = 'checkbox'; check.checked = this.selected.has(test.name); check.setAttribute('aria-label', `${test.name} 선택`);
    check.addEventListener('change', () => { if (check.checked) { this.selected.add(test.name); } else { this.selected.delete(test.name); } this.paint(); this.queuePersistence(); });
    const name = this.button(test.displayName ?? test.name, () => test.source && this.editors.openEditor({ resource: URI.file(test.source) }), 'source'); name.title = `${test.top}\n${test.source ?? ''}`; name.disabled = !test.source;
    const result = mainWindow.document.createElement('span'); result.className = 'rtl-simulation-result';
    const warning = mainWindow.document.createElement('span'); warning.className = 'rtl-simulation-warning'; warning.setAttribute('role', 'status');
    const history = mainWindow.document.createElement('select'); history.setAttribute('aria-label', `${test.name} 실행 이력`);
    history.addEventListener('change', () => { if (history.value === this.state.tests.find(current => current.name === test.name)?.latest?.runId) { this.chosenRuns.delete(test.name); } else { this.chosenRuns.set(test.name, history.value); } this.displayedLog = undefined; this.paint(); });
    const run = this.iconButton(`${test.name} 실행`, () => this.start([test.name]), 'run', 'play');
    const log = this.iconButton(`${test.name} 로그`, async () => { this.displayedLog = await this.channel.call<string>('log', { name: test.name, runId: this.chosenResult(test)?.runId }); this.paint(); }, 'log', 'terminal');
    const wave = this.iconButton(`${test.name} 파형`, () => this.openWaveform(test.name, this.chosenResult(test)?.runId), 'waveform', 'waveform');
    const quickActions = this.group(`${test.name} 실행과 결과`, 'rtl-simulation-quick-actions'); quickActions.append(run, log, wave);
    const source = this.button('보관 소스', () => this.openRecordedSource(test.name, this.chosenResult(test)?.runId), 'recorded-source');
    const compare = this.button('입력 비교', () => this.compareSelectedRun(test.name), 'compare-run');
    const diff = this.button('소스 차이', () => this.openRecordedSource(test.name, this.chosenResult(test)?.runId, undefined, true), 'source-diff');
    const rowRoot = this.state.root, rowEpoch = this.recordedEpoch;
    const remove = this.button('목록에서 제외', () => this.removeTest(test, rowRoot, rowEpoch), 'remove-test');
    remove.title = 'TB 코드와 실행 이력을 보존하고, 이 TB만 자동 등록 대상에서 제외합니다.';
    const metadata = mainWindow.document.createElement('div'); metadata.className = 'rtl-simulation-test-meta';
    const top = mainWindow.document.createElement('span'); top.className = 'rtl-simulation-top'; top.textContent = `top · ${test.top}`;
    const tags = mainWindow.document.createElement('span'); tags.textContent = (test.tags ?? []).join(' · ');
    metadata.append(top, tags, result, warning, history);
    const actions = mainWindow.document.createElement('div'); actions.className = 'rtl-simulation-test-actions';
    const inputs = this.group(`${test.name} Source Code`, 'rtl-simulation-input-actions');
    const inputLabel = mainWindow.document.createElement('span'); inputLabel.className = 'rtl-simulation-action-label'; inputLabel.textContent = 'Source Code';
    inputs.append(inputLabel, source, compare, diff); actions.append(inputs, remove);
    row.append(check, name, metadata, quickActions, actions); this.rows.append(row); this.rowElements.set(test.name, { element: row, identity: JSON.stringify([test.top, test.source]), result, warning, history, run, log, wave, source, compare, diff, remove });
  }
  private async recordedBytes(resource: URI): Promise<Uint8Array> {
    if (this.stopped) throw Error('보관 소스 보기가 종료되었습니다.');
    const args = JSON.parse(resource.query);
    if (typeof args.name !== 'string' || typeof args.runId !== 'string' || typeof args.file !== 'string') throw Error('Invalid recorded source URI.');
    if (!this.state.root) await this.refresh();
    const root = this.state.root, epoch = this.recordedEpoch;
    if (!root || (args.root !== undefined && (typeof args.root !== 'string' || !extUriBiasedIgnorePathCase.isEqual(URI.file(root), URI.file(args.root))))) throw Error('프로젝트가 바뀌었습니다. 다시 선택해 주세요.');
    return this.recordedTexts.read(resource.toString(), async () => {
      const result = await this.channel.call<RecordedSourceText>('source-read', args);
      if (this.stopped || this.state.root !== root || this.recordedEpoch !== epoch) throw Error('프로젝트가 바뀌었거나 보관 소스 보기가 종료되었습니다.');
      return new TextEncoder().encode(result.text);
    });
  }
  selectRun(name: string, id: string): void {
    this.ensureUi();
    const test = this.state.tests.find(test => test.name === name);
    if (!test || !this.state.history?.some(run => run.name === name && run.top === test.top && run.runId === id)) throw Error('현재 목록의 실행 기록을 선택해 주세요.');
    if (test.latest?.runId === id) this.chosenRuns.delete(name); else this.chosenRuns.set(name, id);
    this.displayedLog = undefined; this.paint(); this.queuePersistence();
  }
  async compareSelectedRun(name: string): Promise<void> {
    this.ensureUi();
    if (this.selectedComparison || this.busy || this.dirtyManifest) throw Error('실행·비교 중이거나 미저장 설정이 있습니다.');
    const test = this.state.tests.find(test => test.name === name), id = test && this.chosenResult(test)?.runId;
    if (!id) throw Error('실행 기록이 없습니다.');
    const root = this.state.root, epoch = this.inputEpoch, inputOverrides = this.captureEditorInputs();
    this.selectedComparison = id; this.paint();
    try {
      const result = await this.channel.call<RunComparison>('run-compare', { name, runId: id, inputOverrides });
      if (!this.stopped && this.state.root === root && this.inputEpoch === epoch && this.chosenResult(test!)?.runId === id) this.runComparisons.set(id, { epoch, result });
    } finally { this.selectedComparison = undefined; this.paint(); }
  }
  async openRecordedSource(name: string, runId?: string, file?: string, diff = false): Promise<void> {
    this.ensureUi();
    const root = this.state.root, epoch = this.recordedEpoch;
    const id = runId ?? this.state.tests.find(test => test.name === name)?.latest?.runId;
    if (!id) throw Error('실행 기록이 없습니다.');
    if (!root || this.stopped) throw Error('프로젝트가 없거나 보관 소스 보기가 종료되었습니다.');
    const sources = await this.channel.call<RecordedSource[]>('source-list', { name, runId: id });
    const selected = file ? sources.find(source => source.file === file) : await this.quickInput.pick(sources.map(source => ({ label: source.file, description: source.unsaved ? '미저장 입력 · 읽기 전용' : '저장된 입력 · 읽기 전용', source })), { placeHolder: `${name} · 실행 ${id.slice(0, 8)}에서 사용한 소스` }).then(item => item?.source);
    if (!selected) { if (file) throw Error('이 실행에 보관된 소스가 없습니다.'); return; }
    const check = () => { if (this.stopped || !root || this.state.root !== root || this.recordedEpoch !== epoch) throw Error('프로젝트가 바뀌었거나 보관 소스 보기가 종료되었습니다. 다시 선택해 주세요.'); };
    check();
    const resource = URI.from({ scheme: 'rtl-run-source', path: `/${id}/${selected.file}`, query: JSON.stringify({ name, runId: id, file: selected.file, root }) });
    await this.recordedBytes(resource);
    check();
    if (diff) {
      const current = URI.joinPath(URI.file(root), ...selected.file.split('/'));
      if (!await this.files.exists(current)) throw Error('현재 파일이 없습니다. 보관 소스에서 확인할 수 있습니다.');
      check();
      await this.editors.openEditor({ original: { resource, label: `보관 ${id.slice(0, 8)}` }, modified: { resource: current, label: '현재 소스' }, label: `${selected.file} · 보관 ${id.slice(0, 8)} ↔ 현재`, options: { pinned: true } });
    } else await this.editors.openEditor({ resource, label: `${selected.file.split('/').at(-1)} · 보관 ${id.slice(0, 8)}`, description: `${name} · ${selected.unsaved ? '미저장 입력' : '저장된 입력'} · 읽기 전용`, options: { pinned: true } });
  }
  override dispose(): void { this.persistSession(); this.stopped = true; this.recordedEpoch++; this.recordedTexts.dispose(); mainWindow.clearTimeout(this.comparisonTimer); mainWindow.clearTimeout(this.persistenceTimer); super.dispose(); }
}

