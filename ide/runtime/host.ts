import { readHistory, compareConfiguredResultInputs, discoverProject, readImportSettings, readImportedExecution, saveImportSettings, prepareImportTargets, confirmImportSettings, readImportRecovery, readImportRecoveryText, resolveImportRecovery, inspectImportJournal, archiveImportJournal } from './core/index';
import { projectTestCatalog } from './core/config';
import { readTestCatalog, editTestCatalog, saveTestCatalog, catalogKey, catalogDisplayName } from './core/test-catalog';
import type { TestListEdit } from './contract';
import { importProvider } from './import-runtime';
import { confirmSourceOnlySettings } from './core/import-settings';
export { createSourceProject, initializeSourceProject } from './core/workspace-project';
import { compareSourceInventory } from './core/source-sync';
import type { DiscoveryResult } from './discovery-model';
import type { SourceSyncState } from './contract';
import type { ImportSemanticProvider } from './core/import-targets';
import type { ImportSelection, DiscoveryReview } from './discovery-model';
import type { OperationContext } from './core/model';
import path from 'node:path';
import type { RoleSelection, FolderRole } from './discovery-model';
import { SimulationService } from './simulation';
import type { SimulationHost, SimulationState, SimulationResultView } from './contract';
import type { TestResult } from './core/model';
import { open, lstat } from 'node:fs/promises';
import { WaveformHost } from './waveform-host';
import type { WaveformDocument, WaveformQuery } from './contract';
import type { WaveViewEdit } from './contract';
import { WaveViewStore } from './waveform-views';
import { freezeInputOverrides } from './core/input-overrides';
import type { EditorInput } from './contract';
import type { ImportRecovery, ImportRecoveryChoice, ImportArchivePlan } from './contract';
import { loadRecordedInputs } from './core/snapshot';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { detectTools } from './toolchain/detect';
import { GtkWaveProvider } from './toolchain/viewer';
import { verifyRecordedTrace } from './core/trace';
import { mapTraceEnums } from './waveform/enums';

const resultView = (result: TestResult): SimulationResultView => ({
  name: result.name, displayName: result.source ? catalogDisplayName(result.name, path.relative(path.dirname(path.dirname(path.dirname(result.directory))), result.source).replaceAll('\\', '/'), result.top) : result.name, top: result.top, status: result.status, runId: result.runId,
  durationMs: result.durationMs, log: result.log, source: result.source, waveform: result.waveform, message: result.message, startedAt: result.startedAt, unsavedFiles: result.inputSnapshot?.unsavedFiles
});
const sameSource = (a: string, b: string) => process.platform === 'win32' ? path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase() : path.resolve(a) === path.resolve(b);
const retainedTests = (history: TestResult[]) => {
  const latest = new Map<string, TestResult>();
  for (const result of history) if (!latest.has(result.name)) latest.set(result.name, result);
  return [...latest.values()].map(result => ({ name: result.name, top: result.top, latest: resultView(result) }));
};

/** One host per window. Space switching never recreates this execution owner. */
export class SimulationHostSession implements SimulationHost {
  state: SimulationState = { revision: 0, tests: [], phase: 'idle', log: '' };
  private pending?: Promise<void>;
  private comparisonQueued?: Promise<SimulationState>;
  private editorInputs: readonly EditorInput[] = [];
  private editorRevision = 0;
  private closed = false;
  private projectEpoch = 0;
  private readonly readControllers = new Set<AbortController>();
  private readonly readWork = new Set<Promise<unknown>>();
  private checking?: Promise<SimulationState>;
  private comparisonAbort?: AbortController;
  private discoveryAbort?: AbortController;
  private discoveryWork?: Promise<SimulationState>;
  private sourceBaseline?: DiscoveryResult;
  private readonly viewStores = new Map<string, WaveViewStore>();
  private readonly waveSources = new Map<string, TestResult | string>();
  constructor(private readonly notify: (state: SimulationState) => void, private readonly service = new SimulationService(), private readonly waves = new WaveformHost(), private readonly resolveImport?: (root: string, context: OperationContext, toolsDirectory?: string) => Promise<ImportSemanticProvider>) {}
  private update(change: Partial<SimulationState>): SimulationState {
    this.state = { ...this.state, ...change, revision: this.state.revision + 1 };
    if (!this.closed) this.notify(this.state);
    return this.state;
  }
  async reset(): Promise<SimulationState> {
    if (this.closed || this.pending || this.discoveryWork) throw Error('Simulation host is busy or closed.');
    this.projectEpoch++; this.comparisonAbort?.abort();
    for (const controller of this.readControllers) controller.abort();
    await this.checking?.catch(() => {});
    await Promise.all([...this.waveSources.keys()].map(token => this.closeWaveform(token)));
    this.editorInputs = []; this.editorRevision++; this.sourceBaseline = undefined;
    return this.update({ root: undefined, project: undefined, phase: 'idle', tests: [], history: [], historyOnly: false, activeTest: undefined, log: '', error: undefined, review: undefined, importPreview: undefined, importRecovery: undefined, importJournal: undefined, sourceSync: undefined, savedFolderRoles: undefined, testList: undefined });
  }
  async inspect(root: string): Promise<SimulationState> {
    if (this.closed || this.pending || ['loading', 'running', 'cancelling'].includes(this.state.phase)) throw Error('Simulation host is busy or closed.');
    this.projectEpoch++;
    for (const controller of this.readControllers) controller.abort();
    this.comparisonAbort?.abort(); await this.checking;
    this.editorInputs = []; this.editorRevision++;
    const rootKey = (value: string) => process.platform === 'win32' ? path.resolve(value).toLowerCase() : path.resolve(value);
    const previous = this.state.root && rootKey(this.state.root) === rootKey(root) ? this.state.review : undefined;
    if (!this.state.root || rootKey(this.state.root) !== rootKey(root)) this.sourceBaseline = undefined;
    this.update({ phase: 'loading', root, project: undefined, tests: [], history: [], historyOnly: false, importRecovery: undefined, importJournal: undefined, review: undefined, importPreview: undefined, sourceSync: undefined, savedFolderRoles: undefined, testList: undefined, error: undefined, log: '' });
    try {
      // Retained artifacts are independent of today's manifest/source validity.
      const retained = await readHistory(root);
      if (this.closed) throw Error('Simulation host closed while loading.');
      this.update({ history: retained.map(resultView), tests: retainedTests(retained), historyOnly: retained.length > 0 });
      const { journal, recoveries } = await inspectImportJournal(root);
      this.update({ importRecovery: recoveries, importJournal: journal });
      const settings = await readImportSettings(root);
      if (settings) {
        const draft = previous?.manifestRevision === settings.revision ? previous : undefined;
        await this.discover(root, draft?.folders ?? settings.roles.folders ?? [], draft?.files ?? settings.roles.files ?? [], settings.revision);
        if (!this.closed && this.state.root === root && this.state.review && settings.revision !== 'absent') return this.update({ savedFolderRoles: { folders: settings.roles.folders ?? [], directories: this.state.review.inventory.directories ?? [], manifestRevision: settings.revision } });
        return this.state;
      }
      const project = await this.service.inspect(root);
      const catalog = await readTestCatalog(root);
      const history = rootKey(project.root) === rootKey(root) ? retained : await readHistory(project.root);
      if (this.closed) throw Error('Simulation host closed while loading.');
      this.update({ phase: 'idle', root: project.root, project: project.name, historyOnly: false, testList: { revision: catalog.revision, folders: catalog.policy.folders.filter(item => item.role === 'simulation').map(item => item.path), manual: catalog.policy.manual, excluded: catalog.policy.excluded }, history: history.map(resultView), tests: project.tests.map(target => {
        const previous = history.find(result => result.name === target.name && result.top === target.top);
        return { name: target.name, displayName: catalogDisplayName(target.name, path.relative(project.root, target.sources[0]).replaceAll('\\', '/'), target.top), top: target.top, source: target.sources[0], tags: target.tags ?? [], latest: previous && resultView(previous) };
      }) });
      return await this.refreshInputs();
    } catch (error) {
      this.update({ phase: 'error', error: String(error) });
      return await this.refreshInputs();
    }
  }
  async editTestList(edit: TestListEdit, revision: string, approved: boolean): Promise<SimulationState> {
    if (!approved) throw Error('신뢰된 프로젝트에서 TB 목록을 변경해 주세요.');
    if (this.closed || this.pending || this.discoveryWork || this.state.phase === 'loading' || !this.state.root || this.state.review || this.state.importRecovery?.length) throw Error('TB 목록을 변경할 수 없습니다. 진행 중인 작업이 끝난 뒤 다시 시도해 주세요.');
    const root = this.state.root, controller = new AbortController(); this.discoveryAbort = controller;
    this.comparisonAbort?.abort();
    this.update({ phase: 'loading', error: undefined });
    this.discoveryWork = (async () => {
      try { await this.checking; controller.signal.throwIfAborted(); await editTestCatalog(root, revision, edit, controller.signal); }
      catch (error) { if (!this.closed) this.update({ error: String(error) }); }
      finally { this.discoveryWork = undefined; if (this.discoveryAbort === controller) this.discoveryAbort = undefined; }
      return this.state;
    })();
    await this.discoveryWork;
    if (this.closed || this.state.root !== root) return this.state;
    const error = this.state.error;
    this.update({ phase: 'idle' }); await this.refreshInputs();
    return error ? this.update({ error }) : this.state;
  }
  importRecoveryText(request: ImportRecovery, choice: ImportRecoveryChoice) {
    return this.readProject((root, signal) => readImportRecoveryText(root, request, choice, signal));
  }
  async archiveImport(request: ImportArchivePlan, approved: boolean): Promise<SimulationState> {
    if (!approved) throw Error('신뢰된 프로젝트에서 보관 정책을 확인해 주세요.');
    if (this.closed || this.pending || this.discoveryWork || this.state.phase === 'loading' || !this.state.root) throw Error('Simulation host is busy or closed.');
    const root = this.state.root, controller = new AbortController(); this.discoveryAbort = controller;
    this.update({ phase: 'loading', error: undefined }); let failure: unknown;
    this.discoveryWork = (async () => {
      try { await archiveImportJournal(root, request, controller.signal); }
      catch (error) { failure = error; }
      finally { this.discoveryAbort = undefined; this.discoveryWork = undefined; }
      return this.state;
    })();
    await this.discoveryWork;
    if (this.closed) return this.state;
    this.update({ phase: 'idle' }); await this.inspect(root);
    return failure ? this.update({ phase: 'error', error: String(failure) }) : this.state;
  }
  async recoverImport(request: ImportRecovery, choice: ImportRecoveryChoice, approved: boolean): Promise<SimulationState> {
    if (!approved) throw Error('신뢰된 프로젝트에서 복구할 설정을 확인해 주세요.');
    if (this.closed || this.pending || this.discoveryWork || this.state.phase === 'loading' || !this.state.root) throw Error('Simulation host is busy or closed.');
    const root = this.state.root, controller = new AbortController(); this.discoveryAbort = controller;
    this.update({ phase: 'loading', error: undefined });
    let success = false;
    this.discoveryWork = (async () => {
      try { await resolveImportRecovery(root, request, choice, controller.signal); success = true; }
      catch (error) { if (!this.closed) this.update({ phase: 'error', error: String(error), importRecovery: await readImportRecovery(root).catch(() => this.state.importRecovery) }); }
      finally { this.discoveryAbort = undefined; this.discoveryWork = undefined; }
      return this.state;
    })();
    await this.discoveryWork;
    if (success && !this.closed) { this.update({ phase: 'idle' }); return this.inspect(root); }
    return this.state;
  }
  async manageProject(approved: boolean): Promise<SimulationState> {
    if (!approved) throw Error('신뢰하지 않는 프로젝트에서는 테스트를 관리할 수 없습니다.');
    if (this.closed || this.pending || this.discoveryWork || this.state.phase === 'loading' || !this.state.root) throw Error('Simulation host is busy or has no project.');
    const root = this.state.root, previousProject = this.state.project;
    this.comparisonAbort?.abort();
    const controller = new AbortController(); this.discoveryAbort = controller;
    this.update({ phase: 'loading', error: undefined, importPreview: undefined });
    this.discoveryWork = (async () => {
      try {
        const settings = await readImportedExecution(root);
        controller.signal.throwIfAborted();
        if (!settings) throw Error('IDE가 생성한 원형 설정만 관리할 수 있습니다. 기존 설정은 그대로 보존합니다.');
        const catalog = await readTestCatalog(root);
        const folders = catalog.enabled ? catalog.policy.folders : settings.roles.folders ?? [];
        const files = catalog.enabled ? [...catalog.policy.files.filter(item => !catalog.policy.manual.some(file => catalogKey(file, '') === catalogKey(item.path, ''))), ...catalog.policy.manual.map(file => ({ path: file, role: 'simulation' as const }))] : settings.roles.files ?? [];
        const inventory = await discoverProject(root, { folders, files, signal: controller.signal });
        const tests = catalog.enabled ? this.state.tests.filter(test => test.source && inventory.tops.some(top => catalogKey(top.file, top.top) === catalogKey(path.relative(root, test.source!).replaceAll('\\', '/'), test.top))).map(test => ({ name: test.name, top: test.top, file: path.relative(root, test.source!).replaceAll('\\', '/') })) : settings.preview.tests;
        if (this.closed) return this.state;
        return this.update({ phase: 'idle', savedFolderRoles: { folders, directories: inventory.directories ?? [], manifestRevision: settings.revision }, project: undefined, review: { inventory, folders, files, manifestRevision: settings.revision,
          execution: { tests, includeDirs: settings.preview.includeDirs, defines: settings.preview.defines } } });
      } catch (error) {
        if (this.closed) return this.state;
        return this.update({ phase: 'idle', project: previousProject, error: controller.signal.aborted ? '테스트 관리 탐색을 취소했습니다.' : String(error) });
      } finally { this.discoveryAbort = undefined; this.discoveryWork = undefined; }
    })();
    return this.discoveryWork;
  }
  private discover(root: string, folders: FolderRole[], files: FolderRole[], manifestRevision = 'absent', execution?: DiscoveryReview['execution']): Promise<SimulationState> {
    const controller = new AbortController(); this.discoveryAbort = controller;
    this.discoveryWork = (async () => {
      try {
        const inventory = await discoverProject(root, { folders, files, signal: controller.signal });
        if (this.closed) return this.state;
        return this.update({ phase: 'idle', root: inventory.root, review: { inventory, folders, files, manifestRevision, execution }, error: undefined });
      } catch (error) {
        if (this.closed) return this.state;
        return this.update({ phase: 'idle', error: controller.signal.aborted ? '프로젝트 탐색을 취소했습니다.' : String(error) });
      } finally { this.discoveryAbort = undefined; this.discoveryWork = undefined; }
    })();
    return this.discoveryWork;
  }
  async classify(selection: RoleSelection): Promise<SimulationState> {
    if (this.closed || this.pending || this.discoveryWork || this.state.phase === 'loading') throw Error('Simulation host is busy or closed.');
    if (!this.state.review || !this.state.root || this.state.project) throw Error('Open an unconfigured project before classifying sources.');
    const validate = (entries: FolderRole[] | undefined): FolderRole[] => {
      if (entries === undefined) return [];
      if (!Array.isArray(entries) || entries.length > 1000 || entries.some(entry => !entry || typeof entry.path !== 'string' || entry.path.length > 4096 || !['source', 'simulation', 'excluded'].includes(entry.role))) throw Error('Invalid source role selection.');
      return entries.map(entry => ({ path: entry.path, role: entry.role }));
    };
    if (!selection || typeof selection !== 'object') throw Error('Source role selection required.');
    const folders = validate(selection.folders), files = validate(selection.files);
    this.update({ phase: 'loading', error: undefined, importPreview: undefined });
    return this.discover(this.state.root, folders, files, this.state.review.manifestRevision, this.state.review.execution);
  }
  async prepareReview(selection: ImportSelection, approved: boolean, toolsDirectory?: string): Promise<SimulationState> {
    return this.evaluateReview(selection, approved, toolsDirectory, false);
  }
  async confirmReview(selection: ImportSelection, approved: boolean, toolsDirectory?: string): Promise<SimulationState> {
    return this.evaluateReview(selection, approved, toolsDirectory, true);
  }
  private async evaluateReview(selection: ImportSelection, approved: boolean, toolsDirectory: string | undefined, register: boolean): Promise<SimulationState> {
    if (!approved) throw Error('신뢰하지 않는 프로젝트에서는 의미 분석을 실행할 수 없습니다.');
    if (this.closed || this.pending || this.discoveryWork || this.state.phase === 'loading') throw Error('Simulation host is busy or closed.');
    if (!this.state.review || !this.state.root || (!this.resolveImport && !(register && !selection.ids.length && !this.state.review.execution))) throw Error('프로젝트 가져오기 분석을 준비해 주세요.');
    const review = this.state.review, root = this.state.root;
    const controller = new AbortController(); this.discoveryAbort = controller;
    this.update({ phase: 'loading', importPreview: undefined, error: undefined });
    this.discoveryWork = (async () => {
      try {
        const catalog = register ? await readTestCatalog(root) : undefined;
        const preview = register && !selection.ids.length && !review.execution
          ? await confirmSourceOnlySettings(review, selection, controller.signal)
          : await (async () => {
            const provider = await this.resolveImport!(root, { signal: controller.signal }, toolsDirectory);
            return register ? confirmImportSettings(review, selection, provider, controller.signal) : prepareImportTargets(review, selection, provider, controller.signal);
          })();
        if (this.closed) return this.state;
        if (register) {
          const selected = new Set(preview.tests.map(test => catalogKey(test.file, test.top)));
          const policy = catalog!.policy;
          policy.folders = review.folders; policy.files = review.files;
          policy.manual = [...new Map([...policy.manual, ...preview.tests.map(test => test.file)].map(file => [catalogKey(file, ''), file])).values()];
          const excluded = new Map(policy.excluded.filter(item => !selected.has(catalogKey(item.file, item.top))).map(item => [catalogKey(item.file, item.top), item]));
          for (const top of review.inventory.tops) if (!selected.has(catalogKey(top.file, top.top))) excluded.set(catalogKey(top.file, top.top), { file: top.file, top: top.top });
          policy.excluded = [...excluded.values()];
          await saveTestCatalog(root, catalog!.revision, policy, controller.signal);
          const publication = await inspectImportJournal(root, controller.signal);
          const project = await this.service.inspect(root);
          const history = await readHistory(root);
          if (this.closed) return this.state;
          this.sourceBaseline = undefined;
          this.update({ phase: 'idle', importJournal: publication.journal, importRecovery: publication.recoveries, sourceSync: undefined, root: project.root, project: project.name, historyOnly: false, review: undefined, importPreview: undefined, tests: project.tests.map(target => {
            const previous = history.find(result => result.name === target.name && result.top === target.top);
            return { name: target.name, displayName: catalogDisplayName(target.name, path.relative(project.root, target.sources[0]).replaceAll('\\', '/'), target.top), top: target.top, source: target.sources[0], tags: target.tags ?? [], latest: previous && resultView(previous) };
          }), history: history.map(resultView) });
          // Initialize a new baseline only after the explicit, validated Apply.
          return await this.refreshInputs();
        }
        return this.update({ phase: 'idle', importPreview: preview });
      } catch (error) {
        if (this.closed) return this.state;
        return this.update({ phase: 'idle', importRecovery: await readImportRecovery(root).catch(() => this.state.importRecovery), error: controller.signal.aborted ? '실행 대상 확인을 취소했습니다.' : String(error) });
      } finally { this.discoveryAbort = undefined; this.discoveryWork = undefined; }
    })();
    return this.discoveryWork;
  }
  async saveReview(approved: boolean): Promise<SimulationState> {
    if (!approved) throw Error('분류 저장을 승인해 주세요.');
    if (this.closed || this.pending || this.discoveryWork || this.state.phase === 'loading') throw Error('Simulation host is busy or closed.');
    const review = this.state.review, root = this.state.root;
    if (review?.execution) throw Error('등록된 프로젝트는 테스트 목록 적용으로 저장해 주세요.');
    if (!review || !root || this.state.project) throw Error('가져오기 검토가 필요합니다.');
    const controller = new AbortController(); this.discoveryAbort = controller;
    this.update({ phase: 'loading', error: undefined });
    this.discoveryWork = (async () => {
      try {
        const saved = await saveImportSettings(root, review.manifestRevision, { folders: review.folders, files: review.files }, controller.signal);
        const publication = await inspectImportJournal(root, controller.signal);
        if (!this.closed) this.update({ importJournal: publication.journal, importRecovery: publication.recoveries });
        if (this.closed) return this.state;
        return this.update({ phase: 'idle', savedFolderRoles: { folders: saved.roles.folders ?? [], directories: review.inventory.directories ?? [], manifestRevision: saved.revision }, review: { ...review, folders: saved.roles.folders ?? [], files: saved.roles.files ?? [], manifestRevision: saved.revision }, error: undefined });
      } catch (error) {
        if (this.closed) return this.state;
        return this.update({ phase: 'idle', importRecovery: await readImportRecovery(root).catch(() => this.state.importRecovery), error: controller.signal.aborted ? '분류 저장을 취소했습니다.' : String(error) });
      } finally { this.discoveryAbort = undefined; this.discoveryWork = undefined; }
    })();
    return this.discoveryWork;
  }
  start(names: string[] | undefined, approved: boolean, toolsDirectory?: string, inputOverrides?: readonly EditorInput[], options: { tags?: string[]; jobs?: number } = {}): SimulationState {
    if (!approved) throw Error('신뢰하지 않는 프로젝트에서는 시뮬레이션을 실행할 수 없습니다.');
    if (this.closed || this.pending || ['loading', 'running', 'cancelling'].includes(this.state.phase)) throw Error('Simulation host is busy or closed.');
    if (!this.state.root || !this.state.project || this.state.historyOnly) throw Error('먼저 유효한 rtl.toml 프로젝트를 열어 주세요. 보관 이력은 실행 대상으로 등록되지 않습니다.');
    if (names && (!names.length || names.some(name => !this.state.tests.some(test => test.name === name)))) throw Error('실행할 테스트를 선택해 주세요.');
    if (options.jobs !== undefined && (!Number.isInteger(options.jobs) || options.jobs < 1 || options.jobs > 4)) throw Error('동시 실행 수는 1~4입니다.');
    if (options.tags && (!Array.isArray(options.tags) || options.tags.length > 100 || options.tags.some(tag => typeof tag !== 'string' || !tag || tag.length > 256))) throw Error('유효한 테스트 태그를 선택해 주세요.');
    const frozen = freezeInputOverrides(inputOverrides);
    this.editorInputs = frozen; this.editorRevision++;
    this.comparisonAbort?.abort();
    this.update({ phase: 'running', log: '', error: undefined, activeTest: undefined });
    this.pending = this.service.run({ root: this.state.root, names, toolsDirectory, inputOverrides: frozen, tags: options.tags, jobs: options.jobs }, {
      onStart: target => this.update({ activeTest: target.name }),
      onLog: chunk => this.update({ log: (this.state.log + chunk).slice(-65536) }),
      onResult: result => this.update({ history: [resultView(result), ...(this.state.history ?? []).filter(previous => previous.runId !== result.runId)].slice(0, 100), tests: this.state.tests.map(test => test.name === result.name && test.top === result.top ? { ...test, latest: resultView(result) } : test) })
    }).then(() => {
      this.update({ phase: this.service.cleanupFailure ? 'error' : 'idle', activeTest: undefined, error: this.service.cleanupFailure });
      if (!this.service.cleanupFailure) void this.refreshInputs().catch(() => {});
    }, error => {
      this.update({ phase: 'error', activeTest: undefined, error: String(error) });
    }).finally(() => { this.pending = undefined; });
    return this.state;
  }
  cancel(): SimulationState {
    if (this.discoveryAbort) { this.discoveryAbort.abort(); return this.state; }
    if (this.pending) { this.service.cancel(); return this.update({ phase: 'cancelling' }); }
    return this.state;
  }
  async refreshInputs(inputOverrides?: readonly EditorInput[]): Promise<SimulationState> {
    if (inputOverrides !== undefined) { this.editorInputs = freezeInputOverrides(inputOverrides); this.editorRevision++; }
    // A caller can arrive after the active scan sampled files. Coalesce callers
    // into one subsequent scan rather than returning that stale observation.
    if (this.checking) {
      if (!this.comparisonQueued) this.comparisonQueued = this.checking.then(() => {
        this.comparisonQueued = undefined;
        return this.refreshInputs();
      }, error => { this.comparisonQueued = undefined; throw error; });
      return this.comparisonQueued;
    }
    const root = this.state.root;
    if (this.closed || !root || this.state.review || ['loading', 'running', 'cancelling'].includes(this.state.phase)) return this.state;
    const revision = this.state.revision;
    const editorRevision = this.editorRevision, buffers = this.editorInputs;
    const controller = new AbortController(); this.comparisonAbort = controller;
    this.checking = (async () => {
      let sourceSync: SourceSyncState = { state: 'protected', added: [], removed: [], candidates: [], message: '' };
      let savedFolderRoles: SimulationState['savedFolderRoles'];
      let project;
      try { project = await this.service.inspect(root, controller.signal); } catch (error) {
        const recovery = await readImportRecovery(root).catch(() => this.state.importRecovery);
        const metadata = projectTestCatalog((error as Error).cause);
        if (!controller.signal.aborted && !this.closed && this.state.root === root && this.state.revision === revision && this.editorRevision === editorRevision) {
          if (metadata?.catalog.enabled && metadata.inventory && !recovery?.length) return this.update({ phase: 'error', error: String(error), project: undefined, historyOnly: false, testList: { revision: metadata.catalog.revision, folders: metadata.catalog.policy.folders.filter(item => item.role === 'simulation').map(item => item.path), manual: metadata.catalog.policy.manual, excluded: metadata.catalog.policy.excluded }, tests: metadata.tests.map(test => {
            const first = test.sources[0], previous = this.state.tests.find(item => item.name === test.name && item.top === test.top);
            const source = typeof first === 'object' ? path.resolve(root, first.file) : typeof first === 'string' && !/[?*{}[\]!]/.test(first) ? path.resolve(root, first) : previous?.source;
            return { name: test.name, top: test.top, source, latest: previous?.latest && { ...previous.latest, inputs: { state: 'unavailable' as const, message: String(error) }, currentInputs: { state: 'unavailable' as const, message: String(error) } } };
          }) });
          return this.update({ sourceSync, importRecovery: recovery, ...(recovery?.length ? { project: undefined, historyOnly: true, error: String(error) } : {}), tests: this.state.tests.map(test => ({ ...test, latest: test.latest && { ...test.latest, inputs: { state: 'unavailable', message: String(error) }, currentInputs: { state: 'unavailable', message: String(error) } } })) });
        }
        return this.state;
      }
      const metadata = projectTestCatalog(project), catalog = metadata?.catalog ?? await readTestCatalog(root);
      try {
        const settings = await readImportedExecution(root);
        controller.signal.throwIfAborted();
        if (settings) {
          const inventory = metadata?.inventory ?? await discoverProject(root, { ...settings.roles, signal: controller.signal });
          savedFolderRoles = { folders: settings.roles.folders ?? [], directories: inventory.directories ?? [], manifestRevision: settings.revision };
          sourceSync = compareSourceInventory(inventory, settings.preview, this.sourceBaseline);
          if (catalog.enabled) {
            const automatic = new Set((metadata?.candidates ?? []).map(top => top.displayName));
            sourceSync = { ...sourceSync, candidates: sourceSync.candidates.filter(candidate => !automatic.has(candidate)), removed: sourceSync.removed.filter(item => !settings.preview.tests.some(test => item === `${test.file} (${test.top})`)) };
            sourceSync.state = sourceSync.added.length || sourceSync.removed.length || sourceSync.candidates.length ? 'changed' : 'matching';
          }
          if (!controller.signal.aborted && !this.closed && this.state.root === root && this.state.revision === revision) this.sourceBaseline ??= inventory;
        }
      } catch (error) {
        if (controller.signal.aborted || this.closed) return this.state;
        sourceSync = { state: 'unavailable', added: [], removed: [], candidates: [], message: '파일 구성 비교가 불가능합니다. 설정이나 파일 접근 상태를 확인해 주세요.' };
      }
      if (catalog.enabled && metadata?.inventory) savedFolderRoles = {
        folders: catalog.policy.folders, directories: metadata.inventory.directories ?? [], manifestRevision: catalog.revision
      };
      if (controller.signal.aborted || this.closed) return this.state;
      const history = await readHistory(root);
      const latest = new Map<string, SimulationResultView>();
      for (const test of this.state.tests) {
        if (controller.signal.aborted) return this.state;
        const result = history.find(result => result.name === test.name && result.top === test.top && result.runId === test.latest?.runId);
        if (result) latest.set(test.name, { ...resultView(result), inputs: await compareConfiguredResultInputs(result, project, controller.signal), currentInputs: await compareConfiguredResultInputs(result, project, controller.signal, buffers) });
      }
      if (!controller.signal.aborted && !this.closed && this.state.root === root && this.state.revision === revision && this.editorRevision === editorRevision) return this.update({ sourceSync, savedFolderRoles, ...(!this.state.project && this.state.phase === 'error' ? { phase: 'idle' as const, error: undefined } : {}), project: project.name, historyOnly: false, testList: { revision: catalog.revision, folders: catalog.policy.folders.filter(item => item.role === 'simulation').map(item => item.path), manual: catalog.policy.manual, excluded: catalog.policy.excluded }, tests: project.tests.map(target => {
        const previous = history.find(result => result.name === target.name && result.top === target.top);
        return { name: target.name, displayName: catalogDisplayName(target.name, path.relative(project.root, target.sources[0]).replaceAll('\\', '/'), target.top), top: target.top, source: target.sources[0], tags: target.tags ?? [], latest: latest.get(target.name) ?? (previous && resultView(previous)) };
      }), history: history.map(resultView) });
      return this.state;
    })().finally(() => { this.checking = undefined; if (this.comparisonAbort === controller) this.comparisonAbort = undefined; });
    return this.checking;
  }
  async readLog(name: string, runId?: string): Promise<string> {
    return this.readProject(async (root, signal) => {
      const result = runId ? (await readHistory(root, 1000)).find(result => result.name === name && result.runId === runId) : this.state.tests.find(test => test.name === name)?.latest;
      const file = result && result.log;
      if (!file) throw Error('이 테스트의 실행 로그가 없습니다.');
      const stat = await lstat(file).catch(error => {
        if (error.code === 'ENOENT') throw Error('기록된 실행 로그 파일이 없습니다.');
        throw error;
      });
      if (!stat.isFile() || stat.isSymbolicLink()) throw Error('실행 로그 파일이 유효하지 않습니다.');
      signal.throwIfAborted();
      const handle = await open(file, 'r');
      try {
        const size = (await handle.stat()).size, buffer = Buffer.alloc(Math.min(size, 65536));
        const read = await handle.read(buffer, 0, buffer.length, Math.max(0, size - buffer.length));
        return buffer.subarray(0, read.bytesRead).toString('utf8');
      } finally { await handle.close(); }
    });
  }
  history(limit = 1000) {
    return this.readProject(async (root, signal) => { const results = await readHistory(root, limit); signal.throwIfAborted(); return results.map(resultView); });
  }
  private readProject<T>(read: (root: string, signal: AbortSignal) => Promise<T>, allowNoProject = false): Promise<T> {
    const root = this.state.root, epoch = this.projectEpoch;
    if (this.closed || (!root && !allowNoProject)) return Promise.reject(Error('Project is unavailable.'));
    const controller = new AbortController();
    this.readControllers.add(controller);
    const check = () => {
      if (this.closed) throw Error('Project is unavailable.');
      if (epoch !== this.projectEpoch || root !== this.state.root) throw Error('Project changed during read.');
      controller.signal.throwIfAborted();
    };
    const work = (async () => {
      try { const value = await read(root ?? '', controller.signal); check(); return value; }
      catch (error) { check(); throw error; }
      finally { this.readControllers.delete(controller); }
    })();
    this.readWork.add(work);
    const settled = () => { this.readWork.delete(work); };
    void work.then(settled, settled);
    return work;
  }
  private async sourceContext(root: string, name: string, runId: string, signal: AbortSignal) {
    const result = (await readHistory(root, 1000)).find(run => run.name === name && run.runId === runId);
    if (!result) throw Error('Recorded run not found.');
    return await loadRecordedInputs(result, signal);
  }
  async compareRun(name: string, runId: string, inputOverrides?: readonly EditorInput[]) {
    if (this.state.historyOnly) throw Error('현재 프로젝트 설정이나 소스를 복구한 뒤 입력을 비교해 주세요.');
    const buffers = freezeInputOverrides(inputOverrides);
    return this.readProject(async (root, signal) => {
      const result = (await readHistory(root)).find(run => run.name === name && run.runId === runId);
      if (!result) throw Error('Recorded run not found.');
      signal.throwIfAborted();
      const project = await this.service.inspect(root);
      const saved = await compareConfiguredResultInputs(result, project, signal);
      signal.throwIfAborted();
      const current = await compareConfiguredResultInputs(result, project, signal, buffers);
      return { name, runId, saved, current };
    });
  }
  async recordedSources(name: string, runId: string) {
    return this.readProject(async (root, signal) => {
      const inputs = await this.sourceContext(root, name, runId, signal);
      return inputs.sourceMappings.filter(mapping => /\.(v|sv|vh|svh)$/i.test(mapping.recorded)).map(mapping => ({
        file: path.relative(inputs.project.root, mapping.recorded).split(path.sep).join('/'),
        unsaved: !!inputs.overrides?.some(input => sameSource(input.path, mapping.original))
      }));
    });
  }
  async recordedSource(name: string, runId: string, file: string) {
    return this.readProject(async (root, signal) => {
      const inputs = await this.sourceContext(root, name, runId, signal);
      const mapping = inputs.sourceMappings.find(mapping => path.relative(inputs.project.root, mapping.recorded).split(path.sep).join('/') === file && /\.(v|sv|vh|svh)$/i.test(file));
      if (!mapping) throw Error('Source is not recorded in this run.');
      const bytes = await readFile(mapping.recorded, { signal });
      const hash = createHash('sha256').update(bytes).digest('hex');
      if (!inputs.identity.files?.some(input => input.path === mapping.original && input.sha256 === hash)) throw Error('Recorded source was modified.');
      return { file, text: new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes), unsaved: !!inputs.overrides?.some(input => sameSource(input.path, mapping.original)) };
    });
  }
  async openWaveform(name: string, runId: string, toolsDirectory?: string) {
    let opened: WaveformDocument | undefined;
    try {
      return await this.readProject(async (root, signal) => {
        const history = await readHistory(root, 1000);
        signal.throwIfAborted();
        const result = history.find(result => result.name === name && result.runId === runId);
        if (!result) throw Error('Recorded run not found. Refresh the test list.');
        if (!result.waveform) throw Error('이 실행의 기록된 파형 파일이 없습니다.');
        opened = await this.waves.open(result, signal);
        if (this.resolveImport) {
          try {
            const semanticSignal = AbortSignal.any([signal, AbortSignal.timeout(15000)]);
            const inputs = await loadRecordedInputs(result, semanticSignal);
            const provider = await this.resolveImport(root, { signal: semanticSignal }, toolsDirectory);
            const design = await provider.hierarchy(inputs.project, result.name, [], semanticSignal);
            await loadRecordedInputs(result, signal);
            if (design.diagnostics.some(diagnostic => diagnostic.severity === 'error')) throw Error('Recorded enum analysis has errors.');
            opened.metadata.enumLabels = mapTraceEnums(design, opened.metadata.signals, result.top);
          } catch (error) {
            signal.throwIfAborted();
            opened.metadata.warnings.push(`enum 이름을 연결하지 못했습니다. 숫자로 표시합니다: ${String(error)}`);
          }
        }
        signal.throwIfAborted();
        this.viewStores.set(opened.token, new WaveViewStore(root, result.name, result.top));
        this.waveSources.set(opened.token, result);
        return opened;
      });
    } catch (error) {
      if (opened) await this.closeWaveform(opened.token);
      throw error;
    }
  }
  async openWaveformFile(file: string) {
    let opened: WaveformDocument | undefined;
    try {
      return await this.readProject(async (_root, signal) => {
        opened = await this.waves.openFile(file, signal);
        signal.throwIfAborted(); this.waveSources.set(opened.token, path.resolve(file));
        return opened;
      }, true);
    } catch (error) { if (opened) await this.closeWaveform(opened.token); throw error; }
  }
  async openExternalWaveform(request: { token?: string; name?: string; runId?: string; file?: string }, approved: boolean, toolsDirectory?: string) {
    if (!approved) throw Error('외부 뷰어 실행에는 신뢰된 프로젝트 또는 명시적인 파일 열기가 필요합니다.');
    await this.readProject(async (root, signal) => {
      let source: TestResult | string | undefined;
      if (request.token) source = this.waveSources.get(request.token);
      else if (request.file) source = path.resolve(request.file);
      else if (request.name && request.runId && root) source = (await readHistory(root, 1000)).find(result => result.name === request.name && result.runId === request.runId);
      if (!source) throw Error('열려 있는 파형 또는 기록된 실행을 선택해 주세요.');
      const file = typeof source === 'string' ? source : (await verifyRecordedTrace(source, signal)).file;
      const tools = await detectTools({ signal }, toolsDirectory);
      if (!tools.viewer) throw Error('GTKWave가 없습니다. 도구 설정에서 설치하거나 기존 설치 위치를 지정해 주세요.');
      signal.throwIfAborted(); await new GtkWaveProvider(tools.viewer).open(file, signal);
    }, true);
  }
  queryWaveform(query: WaveformQuery) { return this.waves.query(query); }
  private viewStore(token: string) { const store = this.viewStores.get(token); if (this.closed || !store) throw Error('Waveform reader closed.'); return store; }
  readWaveViews(token: string) {
    if (!this.closed && typeof this.waveSources.get(token) === 'string') return Promise.resolve({ reason: '외부 파일에는 테스트별 저장 보기가 연결되지 않습니다.' });
    return this.viewStore(token).read();
  }
  editWaveViews(token: string, edit: WaveViewEdit) { return this.viewStore(token).edit(edit); }
  closeWaveform(token: string) { this.viewStores.delete(token); this.waveSources.delete(token); return this.waves.close(token); }
  async close(): Promise<void> {
    this.closed = true; this.discoveryAbort?.abort(); this.comparisonAbort?.abort();
    for (const controller of this.readControllers) controller.abort();
    this.viewStores.clear(); this.waveSources.clear(); this.service.cancel();
    await Promise.all([this.pending, this.checking, this.comparisonQueued, this.discoveryWork, this.waves.dispose(),
      ...Array.from(this.readWork, work => work.catch(() => {}))]);
    if (this.service.cleanupFailure) throw Error(this.service.cleanupFailure);
  }
}
export const createSimulationHost = (notify: (state: SimulationState) => void, workerFile?: string, bridge?: string): SimulationHost => new SimulationHostSession(notify, new SimulationService(undefined, bridge ? (project, context, toolsDirectory) => importProvider(project.root, bridge, context, toolsDirectory) : undefined), new WaveformHost(workerFile), bridge ? (root, context, toolsDirectory) => importProvider(root, bridge, context, toolsDirectory) : undefined);
