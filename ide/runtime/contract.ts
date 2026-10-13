/** Serializable host contract; contains no editor, Node or simulator imports. */
import type { WaveMetadata, WindowRequest } from './waveform/model.js';
import type { ViewBook, WaveView } from './waveform/views.js';
import type { DiscoveryReview, RoleSelection, ImportSelection, ImportPreview, SavedFolderRoles } from './discovery-model.js';
export type { DiscoveryReview, RoleSelection, FolderRole, SourceRole, ImportSelection, ImportPreview } from './discovery-model.js';
export interface SavedWaveViews { book?: ViewBook; revision?: string; label?: string; reason?: string }
export interface WaveViewEdit { action: 'save' | 'delete' | 'default'; revision: string; id?: string; view?: WaveView }
export interface WaveformDocument { token: string; runId: string; name: string; metadata: WaveMetadata }
export interface WaveformQuery { token: string; kind: 'window' | 'values' | 'edge'; request?: WindowRequest; signal?: string; time?: string; direction?: number }
export interface EditorInput { path: string; text: string; version?: number }
export interface RecordedSource { file: string; unsaved: boolean }
export interface RecordedSourceText extends RecordedSource { text: string }
export interface ImportRecovery { id: string; revision: string; current: boolean; previous: boolean; candidate: boolean }
export type ImportRecoveryChoice = 'current' | 'previous' | 'candidate';
export interface ImportArchivePlan { revision: string; count: number; retained: number; bytes: number }
export interface ImportJournalState { count: number; limit: number; archive?: ImportArchivePlan }
export interface RunComparison { name: string; runId: string; saved: NonNullable<SimulationResultView['inputs']>; current: NonNullable<SimulationResultView['currentInputs']> }
export interface SimulationResultView {
  name: string; top: string; status: 'passed' | 'failed' | 'cancelled' | 'timedOut';
  runId?: string; durationMs: number; log: string; source?: string; waveform?: string; message?: string;
  startedAt?: string; inputs?: { state: 'matching' | 'changed' | 'unavailable' | 'legacy'; message: string };
  unsavedFiles?: string[];
  currentInputs?: { state: 'matching' | 'changed' | 'unavailable' | 'legacy'; message: string };
}
export type TestListEdit = { action: 'folder'; path: string } | { action: 'file'; path: string } | { action: 'exclude'; file: string; top: string; name?: string } | { action: 'restore'; file: string; top: string; name?: string };
export interface SimulationTestView {
  name: string; top: string; source?: string; latest?: SimulationResultView;
}
export interface SourceSyncState {
  state: 'matching' | 'changed' | 'protected' | 'unavailable';
  added: string[]; removed: string[]; candidates: string[]; message: string;
}
export interface SimulationState {
  revision: number; root?: string; project?: string; tests: SimulationTestView[];
  phase: 'idle' | 'loading' | 'running' | 'cancelling' | 'error';
  activeTest?: string; log: string; error?: string;
  history?: SimulationResultView[];
  /** Rows come from retained results, not a runnable current project. */
  historyOnly?: boolean;
  importRecovery?: ImportRecovery[];
  importJournal?: ImportJournalState;
  review?: DiscoveryReview;
  importPreview?: ImportPreview;
  sourceSync?: SourceSyncState;
  savedFolderRoles?: SavedFolderRoles;
  testList?: { revision: string; folders: string[]; manual: string[]; excluded: { file: string; top: string; name?: string }[] };
}
export interface SimulationHost {
  readonly state: SimulationState;
  inspect(root: string): Promise<SimulationState>;
  editTestList(edit: TestListEdit, revision: string, approved: boolean): Promise<SimulationState>;
  manageProject(approved: boolean): Promise<SimulationState>;
  recoverImport(request: ImportRecovery, choice: ImportRecoveryChoice, approved: boolean): Promise<SimulationState>;
  importRecoveryText(request: ImportRecovery, choice: ImportRecoveryChoice): Promise<string>;
  archiveImport(request: ImportArchivePlan, approved: boolean): Promise<SimulationState>;
  classify(selection: RoleSelection): Promise<SimulationState>;
  saveReview(approved: boolean): Promise<SimulationState>;
  prepareReview(selection: ImportSelection, approved: boolean, toolsDirectory?: string): Promise<SimulationState>;
  confirmReview(selection: ImportSelection, approved: boolean, toolsDirectory?: string): Promise<SimulationState>;
  start(names: string[] | undefined, approved: boolean, toolsDirectory?: string, inputOverrides?: readonly EditorInput[]): SimulationState;
  cancel(): SimulationState;
  readLog(name: string, runId?: string): Promise<string>;
  recordedSources(name: string, runId: string): Promise<RecordedSource[]>;
  recordedSource(name: string, runId: string, file: string): Promise<RecordedSourceText>;
  compareRun(name: string, runId: string, inputOverrides?: readonly EditorInput[]): Promise<RunComparison>;
  refreshInputs(inputOverrides?: readonly EditorInput[]): Promise<SimulationState>;
  openWaveform(name: string, runId: string): Promise<WaveformDocument>;
  queryWaveform(query: WaveformQuery): Promise<unknown>;
  closeWaveform(token: string): Promise<void>;
  readWaveViews(token: string): Promise<SavedWaveViews>;
  editWaveViews(token: string, edit: WaveViewEdit): Promise<SavedWaveViews>;
  close(): Promise<void>;
}
