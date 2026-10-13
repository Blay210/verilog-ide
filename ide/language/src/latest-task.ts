/** One running transition and one latest request, without a request chain or
 * retry timer. Aborted work still joins before the next transition starts.
 */
export class LatestTask {
  private revision = 0;
  private pending?: Promise<void>;
  private current?: AbortController;
  private closing = false;
  private failure?: unknown;
  private closed?: Promise<void>;
  constructor(private readonly work: (signal: AbortSignal) => Promise<void>, private readonly report: (error: unknown) => void) {}
  block(error: unknown): void {
    if (this.failure) return;
    this.failure = error; this.current?.abort(); this.report(error);
  }
  request(): Promise<void> {
    if (this.closing || this.failure) return this.pending ?? Promise.resolve();
    this.revision++; this.current?.abort();
    return this.start();
  }
  private start(): Promise<void> {
    if (this.pending) return this.pending;
    this.pending = Promise.resolve().then(async () => {
      try {
        let handled: number;
        do {
          handled = this.revision;
          const controller = new AbortController(); this.current = controller;
          try { await this.work(controller.signal); }
          catch (error) {
            if ((error as { cleanupFailed?: boolean } | undefined)?.cleanupFailed) this.block(error);
            else if (!controller.signal.aborted) this.report(error);
          } finally { this.current = undefined; }
        } while (!this.failure && handled !== this.revision);
      } finally { this.pending = undefined; }
    });
    return this.pending;
  }
  close(): Promise<void> {
    if (this.closed) return this.closed;
    this.closing = true; this.revision++; this.current?.abort();
    this.closed = (async () => {
      if (!this.failure) await this.start(); else await this.pending;
      if (this.failure) throw this.failure;
    })();
    return this.closed;
  }
}
