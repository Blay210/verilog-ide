/** Window-owned retained UTF-8 bytes. Editor models own their displayed text;
 * evicting these bytes never closes a tab or changes its snapshot.
 */
export class RecordedSourceCache {
  private readonly entries = new Map<string, Uint8Array>();
  private readonly pending = new Map<string, Promise<Uint8Array>>();
  private bytes = 0;
  private stopped = false;
  constructor(private readonly limit = 64 * 1024 * 1024, private readonly maxEntries = 256) {
    if (!Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(maxEntries) || maxEntries < 1) throw Error('Invalid recorded source cache budget.');
  }
  get size(): number { return this.entries.size; }
  get byteLength(): number { return this.bytes; }
  read(key: string, load: () => Promise<Uint8Array>): Promise<Uint8Array> {
    if (this.stopped) return Promise.reject(Error('Recorded source cache is closed.'));
    const cached = this.entries.get(key);
    if (cached) {
      this.entries.delete(key); this.entries.set(key, cached);
      return Promise.resolve(cached);
    }
    const current = this.pending.get(key); if (current) return current;
    // A released/cleared request cannot publish into a later request's cache.
    const check = () => { if (this.stopped || this.pending.get(key) !== work) throw Error('Recorded source read cancelled.'); };
    const work = Promise.resolve().then(() => { check(); return load(); }).then(value => {
      check();
      if (value.byteLength <= this.limit) {
        while (this.entries.size >= this.maxEntries || this.bytes + value.byteLength > this.limit) this.release(this.entries.keys().next().value!);
        this.entries.set(key, value); this.bytes += value.byteLength;
      }
      return value;
    }).finally(() => { if (this.pending.get(key) === work) this.pending.delete(key); });
    this.pending.set(key, work); return work;
  }
  release(key: string): void {
    const cached = this.entries.get(key);
    if (cached) { this.bytes -= cached.byteLength; this.entries.delete(key); }
    this.pending.delete(key);
  }
  clear(): void { this.entries.clear(); this.pending.clear(); this.bytes = 0; }
  dispose(): void { this.stopped = true; this.clear(); }
}
