import { LatestTask } from './latest-task';

/** Replace registrations serially, installing the new watches before releasing old ones. */
export class InputWatches {
  private desired = '';
  private installed = '';
  private release?: () => Promise<void>;
  private readonly owned = new Set<() => Promise<void>>();
  private failure?: unknown;
  private readonly queue: LatestTask;
  constructor(register: (signature: string) => Promise<() => Promise<void>>) {
    this.queue = new LatestTask(async () => {
      try {
        const signature = this.desired;
        if (signature !== this.installed) {
          const release = signature ? await register(signature) : undefined;
          if (release) this.owned.add(release);
          this.release = release; this.installed = signature;
        }
        for (const release of this.owned) if (release !== this.release) { await release(); this.owned.delete(release); }
        this.failure = undefined;
      } catch (error) { this.failure = error; } // Even superseded registrations must report failures.
    }, error => { this.failure = error; });
  }
  async sync(signature: string): Promise<boolean> {
    const previous = this.installed;
    this.desired = signature;
    await this.queue.request();
    if (this.failure) throw this.failure;
    return previous !== this.installed;
  }
  async close(): Promise<void> { this.desired = ''; await this.queue.close(); if (this.failure) throw this.failure; }
}
