import { fork, type ChildProcess } from 'node:child_process';

export class LanguageCleanupFailure extends Error {
  readonly cleanupFailed = true;
}
export async function deadline<T>(work: Promise<T>, milliseconds: number, message: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try { return await Promise.race([work, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new LanguageCleanupFailure(message)), milliseconds); })]); }
  finally { clearTimeout(timer); }
}
/** Own the IPC process through the public MessageTransports factory API. No
 * library parent-only kill fallback; uncertain cleanup blocks replacement.
 */
export class SemanticProcess {
  readonly child: ChildProcess;
  readonly closed: Promise<void>;
  expectedClose = false;
  constructor(module: string, log: (text: string) => void, unexpected: (error: unknown) => void) {
    this.child = fork(module, ['--node-ipc', `--clientProcessId=${process.pid}`], { silent: true, execArgv: [], env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', ELECTRON_NO_ASAR: '1' } });
    this.child.stdout?.on('data', bytes => log(String(bytes)));
    this.child.stderr?.on('data', bytes => log(String(bytes)));
    this.closed = new Promise<void>((resolve, reject) => {
      let failure: unknown;
      this.child.once('error', error => { failure = new LanguageCleanupFailure(`Language process failed: ${String(error)}`); unexpected(failure); });
      this.child.once('close', (code, signal) => {
        if (!this.expectedClose) unexpected(new LanguageCleanupFailure(`Language connection exited unexpectedly (${code}, ${signal}).`));
        if (failure || code !== 0 || signal) reject(failure ?? new LanguageCleanupFailure(`Language process exit was not clean (${code}, ${signal}).`));
        else resolve();
      });
    });
    void this.closed.catch(() => {});
  }
}
