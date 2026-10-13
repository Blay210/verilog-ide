interface Job {
  key: string;
  controller: AbortController;
  work: (signal: AbortSignal) => Promise<unknown>;
  result: Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  users: number;
  started: boolean;
}
export class SemanticQueueFull extends Error {
  constructor() { super('Semantic work queue is full. Retry the current request.'); }
}
/** Share only concurrent identical requests. Keep slots until actual work cleanup
 * finishes, even when all callers have already cancelled their own waits.
 */
export class SemanticWork {
  private readonly byKey = new Map<string, Job>();
  private readonly jobs = new Set<Job>();
  private readonly waiting: Job[] = [];
  private active = 0;
  private stopped = false;
  private failure?: unknown;
  constructor(private readonly limit = 2, private readonly backlog = 32) {}

  run<T>(key: string, signal: AbortSignal, work: (signal: AbortSignal) => Promise<T>): Promise<T> {
    if (signal.aborted) return Promise.reject(signal.reason);
    if (this.failure) return Promise.reject(this.failure);
    if (this.stopped) return Promise.reject(Error('Semantic work is closed.'));
    let job = this.byKey.get(key);
    if (!job || job.controller.signal.aborted) {
      if (this.active >= this.limit && this.waiting.length >= this.backlog) return Promise.reject(new SemanticQueueFull());
      let resolve!: Job['resolve'], reject!: Job['reject'];
      const result = new Promise<unknown>((yes, no) => { resolve = yes; reject = no; });
      void result.catch(() => {});
      job = { key, controller: new AbortController(), work, result, resolve, reject, users: 0, started: false };
      this.byKey.set(key, job); this.jobs.add(job); this.waiting.push(job);
    }
    const selected = job;
    selected.users++;
    const caller = new Promise<T>((resolve, reject) => {
      let settled = false;
      const finish = (error: unknown, value?: unknown) => {
        if (settled) return;
        settled = true; signal.removeEventListener('abort', abort);
        selected.users--;
        if (error !== undefined) reject(error); else resolve(value as T);
      };
      const abort = () => {
        finish(signal.reason);
        if (!selected.users) this.cancel(selected);
      };
      signal.addEventListener('abort', abort, { once: true });
      selected.result.then(value => finish(undefined, value), error => finish(error));
      if (signal.aborted) abort();
    });
    this.pump();
    return caller;
  }
  private cancel(job: Job) {
    job.controller.abort();
    if (!job.started && this.jobs.has(job)) {
      this.waiting.splice(this.waiting.indexOf(job), 1);
      this.finish(job, job.controller.signal.reason);
    }
  }
  private finish(job: Job, error?: unknown, value?: unknown) {
    this.jobs.delete(job);
    if (this.byKey.get(job.key) === job) this.byKey.delete(job.key);
    if (job.started) this.active--;
    if (error !== undefined) job.reject(error); else job.resolve(value);
    if ((error as { cleanupFailed?: boolean } | undefined)?.cleanupFailed) {
      this.failure = error;
      for (const other of [...this.jobs]) this.cancel(other);
    }
    this.pump();
  }
  private pump() {
    if (this.stopped || this.failure) return;
    while (this.active < this.limit && this.waiting.length) {
      const job = this.waiting.shift()!;
      job.started = true; this.active++;
      void Promise.resolve().then(async () => {
        job.controller.signal.throwIfAborted();
        const value = await job.work(job.controller.signal);
        job.controller.signal.throwIfAborted();
        return value;
      }).then(value => this.finish(job, undefined, value), error => this.finish(job, error ?? Error('Semantic operation failed.')));
    }
  }
  async close(): Promise<void> {
    this.stopped = true;
    const jobs = [...this.jobs];
    for (const job of jobs) this.cancel(job);
    await Promise.allSettled(jobs.map(job => job.result));
    if (this.failure) throw this.failure;
  }
}
