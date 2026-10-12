import { readHistory, compareConfiguredResultInputs, discoverProject, readImportSettings, readImportedExecution, saveImportSettings, prepareImportTargets, confirmImportSettings } from './core/index';
import { importProvider } from './import-runtime';
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
import type { WaveformQuery } from './contract';
import type { WaveViewEdit } from './contract';
import { WaveViewStore } from './waveform-views';
import { freezeInputOverrides } from './core/input-overrides';
import type { EditorInput } from './contract';
import { loadRecordedInputs } from './core/snapshot';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const resultView = (result: TestResult): SimulationResultView => ({
  name: result.name, top: result.top, status: result.status, runId: result.runId,
  durationMs: result.durationMs, log: result.log, source: result.source, waveform: result.waveform, message: result.message, startedAt: result.startedAt, unsavedFiles: result.inputSnapshot?.unsavedFiles
});
const sameSource = (a: string, b: string) => process.platform === 'win32' ? path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase() : path.resolve(a) === path.resolve(b);

/** One host per window. Space switching never recreates this execution owner. */
export class SimulationHostSession implements SimulationHost {
  state: SimulationState = { revision: 0, tests: [], phase: 'idle', log: '' };
  private pending?: Promise<void>;
  private comparisonQueued?: Promise<SimulationState>;
  private editorInputs: readonly EditorInput[] = [];
  private editorRevision = 0;
  private closed = false;
  private checking?: Promise<SimulationState>;
  private comparisonAbort?: AbortController;
  private discoveryAbort?: AbortController;
  private discoveryWork?: Promise<SimulationState>;
  private sourceBaseline?: DiscoveryResult;
  private readonly viewStores = new Map<string, WaveViewStore>();
  constructor(private readonly notify: (state: SimulationState) => void, private readonly service = new SimulationService(), private readonly waves = new WaveformHost(), private readonly resolveImport?: (root: string, context: OperationContext, toolsDirectory?: string) => Promise<ImportSemanticProvider>) {}
  private update(change: Partial<SimulationState>): SimulationState {
    this.state = { ...this.state, ...change, revision: this.state.revision + 1 };
    this.notify(this.state);
    return this.state;
  }
  async inspect(root: string): Promise<SimulationState> {
    if (this.closed || this.pending || ['loading', 'running', 'cancelling'].includes(this.state.phase)) throw Error('Simulation host is busy or closed.');
    this.comparisonAbort?.abort(); await this.checking;
    this.editorInputs = []; this.editorRevision++;
    const rootKey = (value: string) => process.platform === 'win32' ? path.resolve(value).toLowerCase() : path.resolve(value);
    const previous = this.state.root && rootKey(this.state.root) === rootKey(root) ? this.state.review : undefined;
    if (!this.state.root || rootKey(this.state.root) !== rootKey(root)) this.sourceBaseline = undefined;
    this.update({ phase: 'loading', root, project: undefined, tests: [], history: [], review: undefined, importPreview: undefined, sourceSync: undefined, savedFolderRoles: undefined, error: undefined, log: '' });
    try {
      const settings = await readImportSettings(root);
      if (settings) {
        const draft = previous?.manifestRevision === settings.revision ? previous : undefined;
        await this.discover(root, draft?.folders ?? settings.roles.folders ?? [], draft?.files ?? settings.roles.files ?? [], settings.revision);
        if (!this.closed && this.state.root === root && this.state.review && settings.revision !== 'absent') return this.update({ savedFolderRoles: { folders: settings.roles.folders ?? [], directories: this.state.review.inventory.directories ?? [], manifestRevision: settings.revision } });
        return this.state;
      }
      const project = await this.service.inspect(root);
      const history = await readHistory(project.root);
      if (this.closed) throw Error('Simulation host closed while loading.');
      this.update({ phase: 'idle', root: project.root, project: project.name, history: history.map(resultView), tests: project.tests.map(target => {
        const previous = history.find(result => result.name === target.name && result.top === target.top);
        return { name: target.name, top: target.top, source: target.sources[0], latest: previous && resultView(previous) };
      }) });
      return await this.refreshInputs();
    } catch (error) {
      this.update({ phase: 'error', error: String(error) });
      return await this.refreshInputs();
    }
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
        const folders = settings.roles.folders ?? [], files = settings.roles.files ?? [];
        const inventory = await discoverProject(root, { folders, files, signal: controller.signal });
        if (this.closed) return this.state;
        return this.update({ phase: 'idle', savedFolderRoles: { folders, directories: inventory.directories ?? [], manifestRevision: settings.revision }, project: undefined, review: { inventory, folders, files, manifestRevision: settings.revision,
          execution: { tests: settings.preview.tests, includeDirs: settings.preview.includeDirs, defines: settings.preview.defines } } });
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
    if (!this.resolveImport || !this.state.review || !this.state.root) throw Error('프로젝트 가져오기 분석을 준비해 주세요.');
    const review = this.state.review, root = this.state.root;
    const controller = new AbortController(); this.discoveryAbort = controller;
    this.update({ phase: 'loading', importPreview: undefined, error: undefined });
    this.discoveryWork = (async () => {
      try {
        const provider = await this.resolveImport!(root, { signal: controller.signal }, toolsDirectory);
        const preview = await (register ? confirmImportSettings(review, selection, provider, controller.signal) : prepareImportTargets(review, selection, provider, controller.signal));
        if (this.closed) return this.state;
        if (register) {
          const project = await this.service.inspect(root);
          const history = await readHistory(root);
          if (this.closed) return this.state;
          this.sourceBaseline = undefined;
          this.update({ phase: 'idle', sourceSync: undefined, root: project.root, project: project.name, review: undefined, importPreview: undefined, tests: project.tests.map(target => {
            const previous = history.find(result => result.name === target.name && result.top === target.top);
            return { name: target.name, top: target.top, source: target.sources[0], latest: previous && resultView(previous) };
          }), history: history.map(resultView) });
          // Initialize a new baseline only after the explicit, validated Apply.
          return await this.refreshInputs();
        }
        return this.update({ phase: 'idle', importPreview: preview });
      } catch (error) {
        if (this.closed) return this.state;
        return this.update({ phase: 'idle', error: controller.signal.aborted ? '실행 대상 확인을 취소했습니다.' : String(error) });
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
        if (this.closed) return this.state;
        return this.update({ phase: 'idle', savedFolderRoles: { folders: saved.roles.folders ?? [], directories: review.inventory.directories ?? [], manifestRevision: saved.revision }, review: { ...review, folders: saved.roles.folders ?? [], files: saved.roles.files ?? [], manifestRevision: saved.revision }, error: undefined });
      } catch (error) {
        if (this.closed) return this.state;
        return this.update({ phase: 'idle', error: controller.signal.aborted ? '분류 저장을 취소했습니다.' : String(error) });
      } finally { this.discoveryAbort = undefined; this.discoveryWork = undefined; }
    })();
    return this.discoveryWork;
  }
  start(names: string[] | undefined, approved: boolean, toolsDirectory?: string, inputOverrides?: readonly EditorInput[]): SimulationState {
    if (!approved) throw Error('신뢰하지 않는 프로젝트에서는 시뮬레이션을 실행할 수 없습니다.');
    if (this.closed || this.pending || ['loading', 'running', 'cancelling'].includes(this.state.phase)) throw Error('Simulation host is busy or closed.');
    if (!this.state.root || !this.state.project) throw Error('먼저 rtl.toml 프로젝트를 열어 주세요.');
    if (names && (!names.length || names.some(name => !this.state.tests.some(test => test.name === name)))) throw Error('실행할 테스트를 선택해 주세요.');
    const frozen = freezeInputOverrides(inputOverrides);
    this.editorInputs = frozen; this.editorRevision++;
    this.comparisonAbort?.abort();
    this.update({ phase: 'running', log: '', error: undefined, activeTest: undefined });
    this.pending = this.service.run({ root: this.state.root, names, toolsDirectory, inputOverrides: frozen }, {
      onStart: target => this.update({ activeTest: target.name }),
      onLog: chunk => this.update({ log: (this.state.log + chunk).slice(-65536) }),
      onResult: result => this.update({ history: [resultView(result), ...(this.state.history ?? []).filter(previous => previous.runId !== result.runId)].slice(0, 100), tests: this.state.tests.map(test => test.name === result.name && test.top === result.top ? { ...test, latest: resultView(result) } : test) })
    }).then(() => { this.update({ phase: 'idle', activeTest: undefined }); void this.refreshInputs().catch(() => {}); }, error => {
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
      let sourceSync: SourceSyncState;
      let savedFolderRoles: SimulationState['savedFolderRoles'];
      try {
        const settings = await readImportedExecution(root);
        controller.signal.throwIfAborted();
        if (settings) {
          const inventory = await discoverProject(root, { ...settings.roles, signal: controller.signal });
          savedFolderRoles = { folders: settings.roles.folders ?? [], directories: inventory.directories ?? [], manifestRevision: settings.revision };
          sourceSync = compareSourceInventory(inventory, settings.preview, this.sourceBaseline);
          if (!controller.signal.aborted && !this.closed && this.state.root === root && this.state.revision === revision) this.sourceBaseline ??= inventory;
        } else sourceSync = { state: 'protected', added: [], removed: [], candidates: [], message: '' };
      } catch (error) {
        if (controller.signal.aborted || this.closed) return this.state;
        sourceSync = { state: 'unavailable', added: [], removed: [], candidates: [], message: '파일 구성 비교가 불가능합니다. 설정이나 파일 접근 상태를 확인해 주세요.' };
      }
      if (controller.signal.aborted || this.closed) return this.state;
      let project;
      try { project = await this.service.inspect(root); } catch (error) {
        if (!controller.signal.aborted && !this.closed && this.state.root === root && this.state.revision === revision && this.editorRevision === editorRevision) return this.update({ sourceSync, savedFolderRoles, tests: this.state.tests.map(test => ({ ...test, latest: test.latest && { ...test.latest, inputs: { state: 'unavailable', message: String(error) }, currentInputs: { state: 'unavailable', message: String(error) } } })) });
        return this.state;
      }
      const history = await readHistory(root);
      const latest = new Map<string, SimulationResultView>();
      for (const test of this.state.tests) {
        if (controller.signal.aborted) return this.state;
        const result = history.find(result => result.name === test.name && result.top === test.top && result.runId === test.latest?.runId);
        if (result) latest.set(test.name, { ...resultView(result), inputs: await compareConfiguredResultInputs(result, project, controller.signal), currentInputs: await compareConfiguredResultInputs(result, project, controller.signal, buffers) });
      }
      if (!controller.signal.aborted && !this.closed && this.state.root === root && this.state.revision === revision && this.editorRevision === editorRevision) return this.update({ sourceSync, savedFolderRoles, tests: this.state.tests.map(test => ({ ...test, latest: latest.get(test.name) ?? test.latest })) });
      return this.state;
    })().finally(() => { this.checking = undefined; if (this.comparisonAbort === controller) this.comparisonAbort = undefined; });
    return this.checking;
  }
  async readLog(name: string, runId?: string): Promise<string> {
    const result = runId ? (this.state.root && (await readHistory(this.state.root)).find(result => result.name === name && result.runId === runId)) : this.state.tests.find(test => test.name === name)?.latest;
    const file = result && result.log;
    if (!file) throw Error('이 테스트의 실행 로그가 없습니다.');
    const stat = await lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink()) throw Error('실행 로그 파일이 유효하지 않습니다.');
    const handle = await open(file, 'r');
    try {
      const size = (await handle.stat()).size, buffer = Buffer.alloc(Math.min(size, 65536));
      const read = await handle.read(buffer, 0, buffer.length, Math.max(0, size - buffer.length));
      return buffer.subarray(0, read.bytesRead).toString('utf8');
    } finally { await handle.close(); }
  }
  private async sourceContext(name: string, runId: string) {
    if (this.closed || !this.state.root) throw Error('Project is unavailable.');
    const result = (await readHistory(this.state.root)).find(run => run.name === name && run.runId === runId);
    if (!result) throw Error('Recorded run not found.');
    return await loadRecordedInputs(result);
  }
  async compareRun(name: string, runId: string, inputOverrides?: readonly EditorInput[]) {
    const buffers = freezeInputOverrides(inputOverrides), root = this.state.root;
    if (this.closed || !root) throw Error('Project is unavailable.');
    const result = (await readHistory(root)).find(run => run.name === name && run.runId === runId);
    if (!result) throw Error('Recorded run not found.');
    const project = await this.service.inspect(root);
    const saved = await compareConfiguredResultInputs(result, project);
    const current = await compareConfiguredResultInputs(result, project, undefined, buffers);
    if (this.closed || this.state.root !== root) throw Error('Project changed during comparison.');
    return { name, runId, saved, current };
  }
  async recordedSources(name: string, runId: string) {
    const inputs = await this.sourceContext(name, runId);
    return inputs.sourceMappings.filter(mapping => /\.(v|sv|vh|svh)$/i.test(mapping.recorded)).map(mapping => ({
      file: path.relative(inputs.project.root, mapping.recorded).split(path.sep).join('/'),
      unsaved: !!inputs.overrides?.some(input => sameSource(input.path, mapping.original))
    }));
  }
  async recordedSource(name: string, runId: string, file: string) {
    const inputs = await this.sourceContext(name, runId);
    const mapping = inputs.sourceMappings.find(mapping => path.relative(inputs.project.root, mapping.recorded).split(path.sep).join('/') === file && /\.(v|sv|vh|svh)$/i.test(file));
    if (!mapping) throw Error('Source is not recorded in this run.');
    const bytes = await readFile(mapping.recorded);
    const hash = createHash('sha256').update(bytes).digest('hex');
    if (!inputs.identity.files?.some(input => input.path === mapping.original && input.sha256 === hash)) throw Error('Recorded source was modified.');
    return { file, text: new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes), unsaved: !!inputs.overrides?.some(input => sameSource(input.path, mapping.original)) };
  }
  async openWaveform(name: string, runId: string) {
    if (this.closed || !this.state.root || !this.state.tests.some(test => test.name === name)) throw Error('Unknown waveform test.');
    const history = await readHistory(this.state.root);
    const result = history.find(result => result.name === name && result.runId === runId);
    if (!result) throw Error('Recorded run not found. Refresh the test list.');
    const doc = await this.waves.open(result);
    this.viewStores.set(doc.token, new WaveViewStore(this.state.root, result.name, result.top));
    return doc;
  }
  queryWaveform(query: WaveformQuery) { return this.waves.query(query); }
  private viewStore(token: string) { const store = this.viewStores.get(token); if (this.closed || !store) throw Error('Waveform reader closed.'); return store; }
  readWaveViews(token: string) { return this.viewStore(token).read(); }
  editWaveViews(token: string, edit: WaveViewEdit) { return this.viewStore(token).edit(edit); }
  closeWaveform(token: string) { this.viewStores.delete(token); return this.waves.close(token); }
  async close(): Promise<void> { this.closed = true; this.discoveryAbort?.abort(); this.comparisonAbort?.abort(); this.viewStores.clear(); this.service.cancel(); await Promise.all([this.pending, this.checking, this.comparisonQueued, this.discoveryWork, this.waves.dispose()]); }
}
export const createSimulationHost = (notify: (state: SimulationState) => void, workerFile?: string, bridge?: string): SimulationHost => new SimulationHostSession(notify, undefined, new WaveformHost(workerFile), bridge ? (root, context, toolsDirectory) => importProvider(root, bridge, context, toolsDirectory) : undefined);
