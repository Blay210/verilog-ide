import { randomUUID } from 'node:crypto';
import { WaveformSession } from './waveform/client';
import { loadRecordedTrace } from './core/trace';
import type { TestResult } from './core/model';
import type { WaveformDocument, WaveformQuery } from './contract';

/** Window-owned readers, independent of the currently selected/latest test run. */
export class WaveformHost {
  private readers = new Map<string, { reader: WaveformSession; controller: AbortController; closing?: Promise<void> }>();
  private openings = new Set<Promise<WaveformDocument>>();
  private closed = false;
  private disposal?: Promise<void>;
  constructor(private readonly workerFile?: string) {}
  open(result: TestResult, signal?: AbortSignal): Promise<WaveformDocument> {
    const work = this.openReader(result, signal);
    this.openings.add(work);
    const settled = () => { this.openings.delete(work); };
    void work.then(settled, settled);
    return work;
  }
  private async openReader(result: TestResult, signal?: AbortSignal): Promise<WaveformDocument> {
    signal?.throwIfAborted();
    if (this.closed || !this.workerFile) throw Error('Waveform reader is unavailable.');
    if (this.readers.size >= 4) throw Error('Close a waveform before opening another (maximum 4).');
    if (!result.waveform?.toLowerCase().endsWith('.vcd')) throw Error('내장 파형은 현재 VCD를 지원합니다. FST 화면은 후속 단계에서 연결합니다.');
    const token = randomUUID(), reader = new WaveformSession(this.workerFile);
    const controller = new AbortController();
    this.readers.set(token, { reader, controller });
    const abort = () => { void this.close(token).catch(() => {}); };
    signal?.addEventListener('abort', abort, { once: true });
    try {
      const trace = await loadRecordedTrace(result, controller.signal);
      controller.signal.throwIfAborted();
      const verified = await reader.loadVerified(trace.bytes, trace.sha256);
      controller.signal.throwIfAborted();
      if (this.closed || !this.readers.has(token)) throw Error('Waveform loading cancelled.');
      return { token, runId: trace.runId, name: `${result.name} · ${trace.runId.slice(0, 8)}`, metadata: verified.metadata };
    } catch (error) { await this.close(token); throw error; }
    finally { signal?.removeEventListener('abort', abort); }
  }
  async query(query: WaveformQuery): Promise<unknown> {
    const entry = this.readers.get(query.token);
    if (!entry || entry.controller.signal.aborted) throw Error('Waveform reader closed.');
    const { reader } = entry;
    if (query.kind === 'window' && query.request) return reader.window(query.request);
    if (query.kind === 'values' && query.request) return reader.values(query.request);
    if (query.kind === 'edge' && typeof query.signal === 'string' && typeof query.time === 'string' && [-1, 0, 1].includes(query.direction!)) return reader.edge(query.signal, query.time, query.direction!);
    throw Error('Invalid waveform query.');
  }
  close(token: string): Promise<void> {
    const entry = this.readers.get(token);
    if (!entry) return Promise.resolve();
    entry.controller.abort();
    // Reserve the slot until termination completes; repeated closes join it.
    return entry.closing ??= entry.reader.dispose().finally(() => { this.readers.delete(token); });
  }
  dispose(): Promise<void> {
    this.closed = true;
    return this.disposal ??= Promise.all([
      ...[...this.readers.keys()].map(token => this.close(token)),
      ...[...this.openings].map(work => work.catch(() => {}))
    ]).then(() => undefined);
  }
}
