import { randomUUID } from 'node:crypto';
import { WaveformSession } from './waveform/client';
import { loadRecordedTrace } from './core/trace';
import type { TestResult } from './core/model';
import type { WaveformDocument, WaveformQuery } from './contract';

/** Window-owned readers, independent of the currently selected/latest test run. */
export class WaveformHost {
  private readers = new Map<string, WaveformSession>();
  private closed = false;
  constructor(private readonly workerFile?: string) {}
  async open(result: TestResult): Promise<WaveformDocument> {
    if (this.closed || !this.workerFile) throw Error('Waveform reader is unavailable.');
    if (this.readers.size >= 4) throw Error('Close a waveform before opening another (maximum 4).');
    if (!result.waveform?.toLowerCase().endsWith('.vcd')) throw Error('내장 파형은 현재 VCD를 지원합니다. FST 화면은 후속 단계에서 연결합니다.');
    const token = randomUUID(), reader = new WaveformSession(this.workerFile);
    this.readers.set(token, reader);
    try {
      const trace = await loadRecordedTrace(result);
      const verified = await reader.loadVerified(trace.bytes, trace.sha256);
      if (this.closed || !this.readers.has(token)) throw Error('Waveform loading cancelled.');
      return { token, runId: trace.runId, name: `${result.name} · ${trace.runId.slice(0, 8)}`, metadata: verified.metadata };
    } catch (error) { await this.close(token); throw error; }
  }
  async query(query: WaveformQuery): Promise<unknown> {
    const reader = this.readers.get(query.token);
    if (!reader) throw Error('Waveform reader closed.');
    if (query.kind === 'window' && query.request) return reader.window(query.request);
    if (query.kind === 'values' && query.request) return reader.values(query.request);
    if (query.kind === 'edge' && typeof query.signal === 'string' && typeof query.time === 'string' && [-1, 0, 1].includes(query.direction!)) return reader.edge(query.signal, query.time, query.direction!);
    throw Error('Invalid waveform query.');
  }
  async close(token: string): Promise<void> {
    const reader = this.readers.get(token); this.readers.delete(token); await reader?.dispose();
  }
  async dispose(): Promise<void> { this.closed = true; await Promise.all([...this.readers.keys()].map(token => this.close(token))); }
}
