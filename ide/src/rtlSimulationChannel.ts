/* RTL IDE node bridge. Original MIT project code. */
import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { onUnexpectedError } from '../../../base/common/errors.js';
import { IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import type { SimulationHost, SimulationState, RoleSelection, ImportSelection, EditorInput, TestListEdit } from '../common/rtlSimulation.js';
import { createSimulationHost } from './runtime.js';
import { fileURLToPath } from 'node:url';
import type { WaveformQuery, WaveViewEdit, ImportRecovery, ImportRecoveryChoice, ImportArchivePlan } from '../common/rtlSimulation.js';

export class RtlSimulationChannel extends Disposable implements IServerChannel {
  private readonly sessions = new Map<string, { host: SimulationHost; events: Emitter<SimulationState> }>();
  private session(context: string) {
    if (!/^window:\d+$/.test(context)) { throw Error('Simulation requires a local workbench window.'); }
    let session = this.sessions.get(context);
    if (!session) {
      const events = new Emitter<SimulationState>();
      session = { events, host: createSimulationHost(state => events.fire(state), fileURLToPath(new URL('./waveform-worker.cjs', import.meta.url)), fileURLToPath(new URL('./analyze.py', import.meta.url))) };
      this.sessions.set(context, session);
    }
    return session;
  }
  listen<T>(context: string, event: string): Event<T> {
    if (event !== 'state') { throw Error('Unknown simulation event.'); }
    return this.session(context).events.event as Event<T>;
  }
  async call<T>(context: string, command: string, arg?: { root?: string; testEdit?: TestListEdit; revision?: string; roles?: RoleSelection; selection?: ImportSelection; names?: string[]; name?: string; approved?: boolean; toolsDirectory?: string; runId?: string; file?: string; token?: string; query?: WaveformQuery; edit?: WaveViewEdit; inputOverrides?: readonly EditorInput[]; recovery?: ImportRecovery; choice?: ImportRecoveryChoice; archive?: ImportArchivePlan }): Promise<T> {
    const session = this.session(context);
    let result: unknown;
    switch (command) {
      case 'state': result = session.host.state; break;
      case 'test-list-edit':
        if (!arg?.testEdit || typeof arg.revision !== 'string') throw Error('TB 목록 변경과 검토한 버전이 필요합니다.');
        result = await session.host.editTestList(arg.testEdit, arg.revision, arg.approved === true); break;
      case 'manage': result = await session.host.manageProject(arg?.approved === true); break;
      case 'import-archive':
        if (!arg?.archive || typeof arg.archive.revision !== 'string') throw Error('검토한 보관 계획이 필요합니다.');
        result = await session.host.archiveImport(arg.archive, arg.approved === true); break;
      case 'import-recovery-text':
      case 'import-recover':
        if (!arg?.recovery || !['current', 'previous', 'candidate'].includes(arg.choice ?? '')) throw Error('복구할 설정 후보가 필요합니다.');
        result = command === 'import-recover' ? await session.host.recoverImport(arg.recovery, arg.choice!, arg.approved === true) : await session.host.importRecoveryText(arg.recovery, arg.choice!); break;
      case 'inspect':
        if (typeof arg?.root !== 'string') { throw Error('Project path required.'); }
        result = await session.host.inspect(arg.root); break;
      case 'start':
        if (arg?.toolsDirectory !== undefined && typeof arg.toolsDirectory !== 'string') { throw Error('Invalid tool storage directory.'); }
        if (arg?.names !== undefined && (!Array.isArray(arg.names) || !arg.names.every(name => typeof name === 'string'))) { throw Error('Invalid test selection.'); }
        result = session.host.start(arg?.names, arg?.approved === true, arg?.toolsDirectory, arg?.inputOverrides); break;
      case 'cancel': result = session.host.cancel(); break;
      case 'classify':
        if (!arg?.roles) { throw Error('Source roles required.'); }
        result = await session.host.classify(arg.roles); break;
      case 'review-save': result = await session.host.saveReview(arg?.approved === true); break;
      case 'review-prepare':
        if (!arg?.selection || (arg.toolsDirectory !== undefined && typeof arg.toolsDirectory !== 'string')) { throw Error('Invalid import selection.'); }
        result = await session.host.prepareReview(arg.selection, arg.approved === true, arg.toolsDirectory); break;
      case 'review-confirm':
        if (!arg?.selection || (arg.toolsDirectory !== undefined && typeof arg.toolsDirectory !== 'string')) { throw Error('Invalid import selection.'); }
        result = await session.host.confirmReview(arg.selection, arg.approved === true, arg.toolsDirectory); break;
      case 'log':
        if (typeof arg?.name !== 'string') { throw Error('Test name required.'); }
        result = await session.host.readLog(arg.name, arg.runId); break;
      case 'source-list':
        if (typeof arg?.name !== 'string' || typeof arg.runId !== 'string') throw Error('Recorded run required.');
        result = await session.host.recordedSources(arg.name, arg.runId); break;
      case 'run-compare':
        if (typeof arg?.name !== 'string' || typeof arg.runId !== 'string') throw Error('Recorded run required.');
        result = await session.host.compareRun(arg.name, arg.runId, arg.inputOverrides); break;
      case 'source-read':
        if (typeof arg?.name !== 'string' || typeof arg.runId !== 'string' || typeof arg.file !== 'string') throw Error('Recorded source required.');
        result = await session.host.recordedSource(arg.name, arg.runId, arg.file); break;
      case 'inputs': result = await session.host.refreshInputs(arg?.inputOverrides); break;
      case 'close':
        this.sessions.delete(context);
        try { await session.host.close(); } finally { session.events.dispose(); }
        break;
      case 'wave-open':
        if (typeof arg?.name !== 'string' || typeof arg.runId !== 'string') { throw Error('Recorded run required.'); }
        result = await session.host.openWaveform(arg.name, arg.runId); break;
      case 'wave-query':
        if (!arg?.query || typeof arg.query.token !== 'string') { throw Error('Waveform query required.'); }
        result = await session.host.queryWaveform(arg.query); break;
      case 'wave-close':
        if (typeof arg?.token !== 'string') { throw Error('Waveform token required.'); }
        await session.host.closeWaveform(arg.token); break;
      case 'wave-views':
        if (typeof arg?.token !== 'string') { throw Error('Waveform token required.'); }
        result = await session.host.readWaveViews(arg.token); break;
      case 'wave-view-edit':
        if (typeof arg?.token !== 'string' || !arg.edit || typeof arg.edit.revision !== 'string') { throw Error('Waveform view operation required.'); }
        result = await session.host.editWaveViews(arg.token, arg.edit); break;
      default: throw Error('Unknown simulation operation.');
    }
    return result as T;
  }
  disconnect(context: string): void {
    const session = this.sessions.get(context);
    if (session) { this.sessions.delete(context); void session.host.close().catch(onUnexpectedError).finally(() => session.events.dispose()); }
  }
  override dispose(): void {
    for (const session of this.sessions.values()) { void session.host.close().catch(onUnexpectedError); session.events.dispose(); }
    this.sessions.clear(); super.dispose();
  }
}
