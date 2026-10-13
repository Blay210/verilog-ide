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
import type { SimulationState, SimulationTestView, WaveformDocument, WaveformQuery, SavedWaveViews, WaveViewEdit, RoleSelection, SourceRole, ImportSelection } from '../../../../platform/rtl/common/rtlSimulation.js';
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
  private readonly waveArea = mainWindow.document.createElement('div');
  private readonly documents = new Map<string, { doc: WaveformDocument; frame: HTMLIFrameElement; tab: HTMLElement; test: string; views?: SavedWaveViews; editing?: boolean; rendered?: { rows: number; aligned: boolean; cursor: string } }>();
  private openingWave = false;
  private readonly all: HTMLButtonElement;
  private readonly selection: HTMLButtonElement;
  private readonly stop: HTMLButtonElement;
  private readonly reload: HTMLButtonElement;
  private readonly setup: HTMLButtonElement;
  private readonly manage: HTMLButtonElement;
  private readonly addFolder: HTMLButtonElement;
  private readonly addFile: HTMLButtonElement;
  private readonly restoreTest: HTMLButtonElement;
  private managedRevision: string | undefined;
  private signature = '';
  private loading = false;
  private stopped = false;
  private paintQueued = false;
  private displayedLog: string | undefined;
  private readonly importArea = mainWindow.document.createElement('section');
  private readonly importSearch = mainWindow.document.createElement('input');
  private readonly importContent = mainWindow.document.createElement('div');
  private reviewSignature = '';
  private readonly importTops = new Set<string>();
  private readonly importIncludes = mainWindow.document.createElement('textarea');

  constructor(private readonly container: HTMLElement,
    shared: ISharedProcessService, private readonly workspace: IWorkspaceContextService,
    private readonly trust: IWorkspaceTrustManagementService, private readonly commands: ICommandService,
    private readonly editors: IEditorService, lifecycle: ILifecycleService, private readonly dialogs: IDialogService, private readonly quickInput: IQuickInputService,
    private readonly files: IFileService, private readonly workingCopies: IWorkingCopyService, private readonly configuration: IConfigurationService, private readonly textFiles: ITextFileService) {
    super(); this.channel = shared.getChannel('rtlSimulation');
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
    const title = mainWindow.document.createElement('h1'); title.textContent = 'Simulation';
    const description = mainWindow.document.createElement('p'); description.textContent = '테스트를 실행하고 결과와 로그를 확인하세요.';
    const header = mainWindow.document.createElement('header'); header.className = 'rtl-simulation-header';
    const heading = mainWindow.document.createElement('div'); heading.append(title, description);
    const toolbar = mainWindow.document.createElement('div'); toolbar.className = 'rtl-simulation-toolbar';
    this.all = this.button('전체 실행', () => this.start(), 'run-all');
    this.selection = this.button('선택 실행', () => this.start([...this.selected]), 'run-selected');
    this.stop = this.button('취소', () => this.call('cancel'), 'cancel');
    this.reload = this.button('새로고침', () => this.refresh(), 'refresh');
    this.setup = this.button('도구 설정', async () => { await this.commands.executeCommand('rtl.setupTools'); await this.refresh(); }, 'setup-tools');
    this.manage = this.button('테스트 관리', () => this.manageProject(), 'manage-tests');
    const execution = this.group('실행', 'rtl-simulation-run-actions'); execution.append(this.all, this.selection, this.stop);
    const projectActions = this.group('프로젝트 관리', 'rtl-simulation-project-actions'); projectActions.append(this.reload, this.manage, this.setup);
    toolbar.append(execution, projectActions);
    const open = this.button('폴더 열기', () => this.commands.executeCommand('workbench.action.files.openFolder'), 'open-folder');
    header.append(heading, open);
    const controls = mainWindow.document.createElement('section'); controls.className = 'rtl-simulation-card rtl-simulation-controls';
    controls.setAttribute('aria-label', '프로젝트와 실행');
    this.status.className = 'rtl-simulation-project-status';
    this.status.setAttribute('role', 'status'); this.status.setAttribute('aria-live', 'polite');
    this.notice.className = 'rtl-simulation-notice';
    this.sourceNotice.className = 'rtl-simulation-notice';
    this.sourceNotice.dataset.action = 'source-sync-notice';
    this.sourceNotice.setAttribute('role', 'status');
    this.sourceNotice.setAttribute('aria-live', 'polite');
    this.rows.className = 'rtl-simulation-tests';
    const tests = mainWindow.document.createElement('section'); tests.className = 'rtl-simulation-card rtl-simulation-test-section';
    tests.setAttribute('aria-label', '테스트 목록');
    const testsHeader = mainWindow.document.createElement('div'); testsHeader.className = 'rtl-simulation-section-heading';
    const testsTitle = mainWindow.document.createElement('h2'); testsTitle.textContent = '테스트';
    this.testCount.className = 'rtl-simulation-count'; testsHeader.append(testsTitle, this.testCount);
    const registrations = this.group('TB 등록과 제외 복원', 'rtl-simulation-registration-actions');
    this.addFolder = this.button('TB 폴더 등록', () => this.registerTestPath('folder'), 'add-tb-folder');
    this.addFile = this.button('TB 파일 추가', () => this.registerTestPath('file'), 'add-tb-file');
    this.restoreTest = this.button('제외한 TB 복원', () => this.restoreExcludedTest(), 'restore-tb');
    registrations.append(this.addFolder, this.addFile, this.restoreTest); testsHeader.append(registrations);
    this.emptyTests.className = 'rtl-simulation-empty'; this.emptyTests.textContent = '등록된 테스트가 없습니다. 프로젝트를 열거나 테스트 관리에서 실행할 테스트를 확인하세요.';
    this.testScope.className = 'rtl-simulation-scope';
    tests.append(testsHeader, this.testScope, this.emptyTests, this.rows);
    const details = mainWindow.document.createElement('details'); details.className = 'rtl-simulation-card rtl-simulation-log';
    const summary = mainWindow.document.createElement('summary'); summary.textContent = '실행 로그';
    this.log.tabIndex = 0; this.log.setAttribute('aria-label', 'Simulation log');
    details.open = true; details.append(summary, this.log);
    const importTitle = mainWindow.document.createElement('h2'); importTitle.textContent = '프로젝트 가져오기';
    const importNote = mainWindow.document.createElement('p'); importNote.textContent = '찾은 파일과 역할을 확인한 뒤 분류 저장을 누르면 rtl.toml에 기록합니다. 원본 코드는 수정하지 않습니다. 실행 후보는 의미 분석 확인이 필요합니다.';
    this.importArea.className = 'rtl-simulation-card rtl-simulation-import';
    this.importArea.setAttribute('aria-label', '프로젝트 가져오기'); this.importArea.hidden = true;
    this.importSearch.type = 'search'; this.importSearch.placeholder = '파일 검색'; this.importSearch.setAttribute('aria-label', '가져오기 파일 검색');
    this.importSearch.addEventListener('input', () => { this.reviewSignature = ''; this.paintReview(); });
    this.importIncludes.placeholder = '추가 include 폴더 (프로젝트 상대 경로, 한 줄에 하나)';
    this.importIncludes.setAttribute('aria-label', '추가 include 폴더');
    const advanced = mainWindow.document.createElement('details'), advancedTitle = mainWindow.document.createElement('summary');
    advancedTitle.textContent = '추가 분석 설정'; advanced.append(advancedTitle, this.importIncludes);
    this.importArea.append(importTitle, importNote, this.importSearch, advanced, this.importContent);
    controls.append(this.status, toolbar, this.notice, this.sourceNotice);
    this.page.className = 'rtl-simulation-page';
    this.page.append(header, controls, this.importArea, tests, details);
    this.tabs.className = 'rtl-wave-tabs'; this.tabs.hidden = true;
    this.waveArea.className = 'rtl-wave-area'; this.waveArea.hidden = true;
    this.tabs.append(this.button('Simulation 홈', () => this.showWave(), 'simulation-home'));
    container.append(this.tabs, this.page, this.waveArea);
    const receive = (event: MessageEvent) => { void this.receiveWave(event); };
    mainWindow.addEventListener('message', receive);
    this._register({ dispose: () => mainWindow.removeEventListener('message', receive) });
    this._register(this.channel.listen<SimulationState>('state')(state => this.accept(state)));
    this._register(this.workspace.onDidChangeWorkspaceFolders(() => { void this.refresh(); }));
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
  private iconButton(label: string, action: () => Promise<unknown> | unknown, id: string, icon: 'play' | 'terminal' | 'waveform'): HTMLButtonElement {
    const button = this.button(label, action, id);
    button.title = icon === 'play' ? '실행' : icon === 'terminal' ? '로그' : '파형'; button.setAttribute('aria-label', label);
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
  get diagnostic() { return { ...this.state, sourceNotice: { visible: !this.sourceNotice.hidden && !this.page.hidden, text: this.sourceNotice.textContent, details: this.sourceNotice.title, manageLabel: this.manage.textContent }, dirtyManifest: this.dirtyManifest, reviewVisible: !this.importArea.hidden, reviewFileRows: this.importContent.querySelectorAll('[data-role-kind=file]').length, reviewSelectedTops: [...this.importTops], selected: [...this.selected], trusted: this.trust.isWorkspaceTrusted(), controls: { allEnabled: !this.all.disabled, cancelEnabled: !this.stop.disabled, setupEnabled: !this.setup.disabled }, rowCount: this.rowElements.size,
    results: [...this.rowElements].map(([name, row]) => ({ name, warning: row.warning.textContent, runId: row.history.value, historyCount: row.history.options.length })),
    waveforms: [...this.documents.values()].map(item => ({ runId: item.doc.runId, signals: item.doc.metadata.signals.length, visible: !item.frame.hidden, rendered: item.rendered })) }; }
  private showWave(runId?: string): void {
    this.page.hidden = !!runId; this.waveArea.hidden = !runId;
    this.container.classList.toggle('rtl-wave-open', !!runId);
    for (const [id, item] of this.documents) { item.frame.hidden = id !== runId; item.tab.setAttribute('aria-current', String(id === runId)); }
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
    const id = runId ?? this.state.tests.find(test => test.name === name)?.latest?.runId;
    if (!id || this.openingWave) { return; }
    if (this.documents.has(id)) { this.showWave(id); return; }
    this.openingWave = true; this.paint();
    try {
      const doc = await this.channel.call<WaveformDocument>('wave-open', { name, runId: id });
      if (this.stopped) { await this.channel.call('wave-close', { token: doc.token }); return; }
      const frame = mainWindow.document.createElement('iframe'); frame.title = `파형 ${doc.name}`;
      frame.setAttribute('sandbox', 'allow-scripts'); frame.setAttribute('referrerpolicy', 'no-referrer');
      const tab = mainWindow.document.createElement('span');
      tab.append(this.button(doc.name, () => this.showWave(id), 'wave-tab'), this.button('닫기', async () => {
        this.documents.delete(id); frame.remove(); tab.remove(); this.tabs.hidden = !this.documents.size;
        this.showWave(); await this.channel.call('wave-close', { token: doc.token });
      }, 'wave-close'));
      this.documents.set(id, { doc, frame, tab, test: name }); this.tabs.append(tab); this.tabs.hidden = false;
      this.waveArea.append(frame);
      frame.src = FileAccess.asBrowserUri('vs/platform/rtl/node/waveform.html' as AppResourcePath).toString(true);
      this.showWave(id);
    } catch (error) { this.fail(error); }
    finally { this.openingWave = false; this.paint(); }
  }
  private async receiveWave(event: MessageEvent): Promise<void> {
    const item = [...this.documents.values()].find(item => item.frame.contentWindow === event.source);
    const message = event.data?.rtlWaveform === true ? event.data.message : undefined;
    if (!item || !message || typeof message.kind !== 'string') { return; }
    const send = (value: unknown) => item.frame.contentWindow?.postMessage(value, '*');
    try {
      if (message.kind === 'rendered' && Number.isInteger(message.rows) && message.rows >= 0 && message.rows <= 160 && typeof message.aligned === 'boolean' && typeof message.cursor === 'string') {
        item.rendered = { rows: message.rows, aligned: message.aligned, cursor: message.cursor };
      } else if (message.kind === 'ready' || message.kind === 'reload') {
        // Immutable reader snapshot. Reload redraws this run, never the latest run.
        try { item.views = await this.channel.call<SavedWaveViews>('wave-views', { token: item.doc.token }); }
        catch (error) { item.views = { reason: String(error) }; }
        send({ kind: 'init', metadata: item.doc.metadata, name: item.doc.name, cursorReuse: true, link: { reason: `Recorded run ${item.doc.runId}` }, views: item.views });
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
  async enter(): Promise<void> { if (!this.state.root && !this.loading) { await this.refresh(); } else { this.scheduleComparison(); } }
  private async call(command: string, arg?: unknown): Promise<void> {
    this.accept(await this.channel.call<SimulationState>(command, arg));
  }
  async refresh(): Promise<void> {
    if (this.busy || this.loading || this.stopped) { return; }
    const folders = this.workspace.getWorkspace().folders;
    if (folders.length !== 1 || folders[0].uri.scheme !== 'file') {
      this.status.textContent = '로컬 프로젝트 폴더 하나를 열어 주세요.'; return;
    }
    this.loading = true; this.paint();
    this.displayedLog = undefined;
    try { await this.call('inspect', { root: folders[0].uri.fsPath }); }
    catch (error) { this.fail(error); }
    finally { this.loading = false; this.scheduleComparison(); this.paint(); }
  }
  async start(names?: string[]): Promise<void> {
    if (!this.trust.isWorkspaceTrusted()) { this.fail('신뢰하지 않는 프로젝트에서는 실행할 수 없습니다. 코드 편집은 계속할 수 있습니다.'); return; }
    if (this.busy || this.loading) { return; }
    if (this.dirtyManifest) throw Error('프로젝트 설정에 미저장 변경이 있습니다. 먼저 변경을 검토해 주세요.');
    if (!this.state.root) throw Error('프로젝트를 먼저 열어 주세요.');
    const inputOverrides = this.captureEditorInputs();
    this.displayedLog = undefined;
    await this.call('start', { names, inputOverrides, approved: this.trust.isWorkspaceTrusted(), toolsDirectory: this.configuration.getValue<string>('rtl.toolsDirectory') });
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
  get explorerEnabled(): boolean { return !this.stopped && !!this.state.project && !this.state.historyOnly && !this.state.importRecovery?.length && this.trust.isWorkspaceTrusted() && !this.busy && !this.loading && this.state.phase !== 'loading' && !this.state.review && !this.dirtyManifest; }
  async startFile(resource: URI): Promise<boolean> {
    if (!this.state.root && !this.loading) await this.refresh();
    if (!this.explorerEnabled) throw Error('현재는 실행할 수 없습니다. 프로젝트 신뢰, 실행 상태와 미저장 rtl.toml을 확인해 주세요.');
    const targets = this.fileTargets(resource);
    if (!targets.length) throw Error('이 파일에 등록된 실행 대상이 없습니다. 테스트 관리에서 먼저 등록해 주세요.');
    const selected = targets.length === 1 ? targets[0] : await this.quickInput.pick(targets.map(test => ({ label: test.name, description: `top: ${test.top}`, name: test.name, top: test.top })), { placeHolder: '실행할 테스트벤치를 선택하세요', matchOnDescription: true });
    if (!selected) return false;
    if (!this.explorerEnabled || !this.fileTargets(resource).some(test => test.name === selected.name && test.top === selected.top)) throw Error('실행 대상이나 프로젝트 상태가 변경되었습니다. 다시 선택해 주세요.');
    await this.start([selected.name]); this.showWave(); return true;
  }
  async classify(roles: RoleSelection): Promise<void> {
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
    if (!review || this.state.root !== root || this.busy || this.loading || this.diagnostic.phase === 'loading' || this.dirtyManifest || !this.trust.isWorkspaceTrusted()) throw Error(this.state.error ?? '프로젝트를 가져오거나 IDE 소유 설정의 테스트 관리를 먼저 열어 주세요.');
    await this.classify(changeFolderRole(review, folder, role, isWindows));
    if (this.state.error) throw Error(this.state.error);
    this.showWave();
  }
  async saveReview(): Promise<void> {
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
    if (!this.trust.isWorkspaceTrusted()) { throw Error('신뢰하지 않는 프로젝트에서는 의미 분석을 실행할 수 없습니다.'); }
    if (this.dirtyManifest) { throw Error('프로젝트 설정에 미저장 변경이 있습니다. 먼저 검토해 주세요.'); }
    await this.call(register ? 'review-confirm' : 'review-prepare', { selection: selection ?? { ids: [...this.importTops], includeDirs: this.importIncludes.value.split(/\r?\n/).map(line => line.trim()).filter(Boolean), defines: this.state.review?.execution?.defines }, approved: this.trust.isWorkspaceTrusted(), toolsDirectory: this.configuration.getValue<string>('rtl.toolsDirectory') });
  }
  private fail(error: unknown): void { this.status.textContent = String(error); }
  private accept(state: SimulationState): void {
    if (this.stopped || state.revision < this.state.revision) { return; }
    const wasBusy = this.busy;
    if (this.state.root !== state.root) { this.recordedEpoch++; this.recordedTexts.clear(); }
    this.state = state;
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
    const trusted = this.trust.isWorkspaceTrusted();
    const disabled = this.busy || this.loading || this.state.phase === 'loading' || !!this.state.review || !!this.state.historyOnly || !!this.state.importRecovery?.length || !this.state.project || !this.state.tests.length || !trusted;
    this.manage.disabled = this.busy || this.loading || this.state.phase === 'loading' || !this.state.root || !trusted;
    const listLocked = this.busy || this.loading || this.state.phase === 'loading' || !this.state.testList || !!this.state.review || !!this.state.importRecovery?.length || this.dirtyManifest || !trusted;
    this.addFolder.disabled = listLocked; this.addFile.disabled = listLocked;
    this.restoreTest.disabled = listLocked || !this.state.testList?.excluded.length;
    this.all.disabled = disabled; this.selection.disabled = disabled || !this.selected.size;
    this.setup.disabled = this.busy || this.loading;
    this.stop.disabled = (!this.busy && !(this.state.phase === 'loading' && this.state.root)) || this.state.phase === 'cancelling'; this.reload.disabled = this.busy || this.loading || this.state.phase === 'loading';
    this.status.textContent = this.state.error ?? (this.busy ? `${this.state.phase === 'cancelling' ? '취소 중' : '실행 중'}${this.state.activeTest ? ': ' + this.state.activeTest : ''}`
      : this.loading || this.state.phase === 'loading' ? '프로젝트를 읽는 중…' : this.state.review ? `설정 전 · 파일 ${this.state.review.inventory.sources.length}개 · 실행 후보 ${this.state.review.inventory.tops.length}개` : this.state.project ? `${this.state.project} · 테스트 ${this.state.tests.length}개` : '프로젝트를 열어 주세요.');
    this.status.dataset.phase = this.state.error ? 'error' : this.busy ? this.state.phase : this.loading ? 'loading' : this.state.phase;
    const count = `${this.state.tests.length}개`;
    if (this.testCount.textContent !== count) { this.testCount.textContent = count; }
    this.emptyTests.hidden = this.state.tests.length > 0;
    const folders = this.state.testList?.folders ?? [];
    this.testScope.hidden = !folders.length;
    const scope = `자동 감지 폴더 · ${folders.map(folder => folder || '프로젝트 전체').join(' · ')}`;
    if (this.testScope.textContent !== scope) { this.testScope.textContent = scope; }
    this.notice.textContent = this.state.historyOnly ? '보관 이력을 표시합니다. 현재 설정과 소스를 복구한 뒤 새로고침하면 실행할 수 있습니다.' : trusted ? '실행 시점의 RTL 편집 내용을 보존합니다. 보관 소스에서 실제 사용한 코드를 읽기 전용으로 확인하세요.' : '신뢰하지 않는 프로젝트입니다. 실행은 잠겨 있고 코드 편집은 가능합니다.';
    const sync = this.state.sourceSync;
    this.manage.textContent = this.state.importRecovery?.length ? '설정 복구' : this.state.importJournal?.archive && this.state.importJournal.count >= 64 ? '테스트 관리 · 기록 보관' : sync?.state === 'changed' ? '테스트 관리 · 변경 확인' : '테스트 관리';
    this.sourceNotice.hidden = !!this.state.review || !sync || ['matching', 'protected'].includes(sync.state);
    this.sourceNotice.textContent = this.dirtyManifest && !this.sourceNotice.hidden
      ? '△ 파일 구성이 바뀌었거나 비교가 불가능합니다. 프로젝트 설정의 미저장 변경을 먼저 검토해 주세요.'
      : sync?.state === 'changed' ? `△ 추가 ${sync.added.length} · 삭제/누락 ${sync.removed.length} · 새 실행 후보 ${sync.candidates.length}. 테스트 관리에서 확인·적용해 주세요. 실행은 현재 설정을 사용합니다.` : sync?.message ?? '';
    this.sourceNotice.title = sync ? [...sync.added.map(file => `추가: ${file}`), ...sync.removed.map(file => `삭제/누락: ${file}`), ...sync.candidates.map(file => `후보: ${file}`)].join('\n') : '';
    const signature = JSON.stringify([this.state.root, this.state.tests.map(test => [test.name, test.top, test.source])]);
    if (signature !== this.signature) {
      const changedRoot = this.state.root !== JSON.parse(this.signature || '[null]')[0];
      const focus = !changedRoot && this.rows.contains(mainWindow.document.activeElement) ? mainWindow.document.activeElement as HTMLElement : undefined;
      if (changedRoot) { this.selected.clear(); this.chosenRuns.clear(); this.runComparisons.clear(); this.inputEpoch++; this.rows.replaceChildren(); this.rowElements.clear(); }
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
  private paintReview(): void {
    const review = this.state.review;
    this.importArea.hidden = !review;
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
      const folderDetails = mainWindow.document.createElement('details');
      const summary = mainWindow.document.createElement('summary'); summary.textContent = '폴더 역할'; folderDetails.append(summary);
      for (const folder of [...folders].sort().slice(0, 200)) {
        const row = mainWindow.document.createElement('div'); row.className = 'rtl-simulation-test';
        const label = mainWindow.document.createElement('span'); label.textContent = folder || '프로젝트 전체';
        row.append(label, roleSelect('folder', folder, review.folders.find(entry => entry.path === folder)?.role)); folderDetails.append(row);
      }
      if (folders.size > 200) { const note = mainWindow.document.createElement('p'); note.textContent = '폴더 역할은 처음 200개를 표시합니다. 파일 검색으로 개별 역할을 지정할 수 있습니다.'; folderDetails.append(note); }
      const saved = mainWindow.document.createElement('p'); saved.textContent = review.manifestRevision === 'absent' ? '설정 파일 없음 · 분류 저장 후 다시 열어도 복원됩니다.' : '가져오기 설정 파일 있음 · 분류를 바꾸면 다시 저장해 주세요.';
      if (review.execution) saved.textContent = '체크한 top만 테스트로 유지합니다. 적용하면 새 RTL/package/header도 반영합니다. 원본과 이전 실행은 보존하며, 취소하려면 새로고침을 누르세요.';
      this.importContent.append(saved, folderDetails);
      if (!review.execution) this.importContent.append(this.button('분류 저장', () => this.saveReview(), 'save-classification'));
      this.importContent.append(this.button('분류 초기화', () => this.classify({}), 'reset-classification'));
      for (const id of this.importTops) { if (!review.inventory.tops.some(top => top.id === id)) { this.importTops.delete(id); } }
      const candidates = mainWindow.document.createElement('details'), candidateTitle = mainWindow.document.createElement('summary');
      candidateTitle.textContent = `실행 top 선택 (${review.inventory.tops.length}개 후보)`; candidates.append(candidateTitle);
      for (const top of review.inventory.tops.slice(0, 200)) {
        const label = mainWindow.document.createElement('label'), checkbox = mainWindow.document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = this.importTops.has(top.id);
        checkbox.setAttribute('aria-label', `${top.file} ${top.top} 실행 top 선택`);
        checkbox.addEventListener('change', () => { if (checkbox.checked) { this.importTops.add(top.id); } else { this.importTops.delete(top.id); } });
        label.style.display = 'block'; label.append(checkbox, `${top.file} · ${top.top}`); candidates.append(label);
      }
      if (review.inventory.tops.length > 200) { const note = mainWindow.document.createElement('p'); note.textContent = '처음 200개 후보 표시 · 폴더 분류로 탐색 범위를 좁혀 주세요.'; candidates.append(note); }
      const analyze = this.button('선택한 top 확인', () => this.prepareReview(), 'prepare-import');
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
      const paths = new Set([...review.inventory.sources.map(source => source.path), ...review.files.map(entry => entry.path)]);
      const query = this.importSearch.value.toLocaleLowerCase();
      const filtered = [...paths].filter(file => file.toLocaleLowerCase().includes(query)).sort();
      for (const file of filtered.slice(0, 200)) {
        const source = review.inventory.sources.find(source => source.path === file);
        const row = mainWindow.document.createElement('div'); row.className = 'rtl-simulation-test';
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
    check.addEventListener('change', () => { if (check.checked) { this.selected.add(test.name); } else { this.selected.delete(test.name); } this.paint(); });
    const name = this.button(test.name, () => test.source && this.editors.openEditor({ resource: URI.file(test.source) }), 'source'); name.title = test.top; name.disabled = !test.source;
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
    metadata.append(top, result, warning, history);
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
    const test = this.state.tests.find(test => test.name === name);
    if (!test || !this.state.history?.some(run => run.name === name && run.top === test.top && run.runId === id)) throw Error('현재 목록의 실행 기록을 선택해 주세요.');
    if (test.latest?.runId === id) this.chosenRuns.delete(name); else this.chosenRuns.set(name, id);
    this.displayedLog = undefined; this.paint();
  }
  async compareSelectedRun(name: string): Promise<void> {
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
  override dispose(): void { this.stopped = true; this.recordedEpoch++; this.recordedTexts.dispose(); mainWindow.clearTimeout(this.comparisonTimer); super.dispose(); }
}

