import { spawn } from 'node:child_process';
import type { OperationContext, ProcessResult, ProcessSpec } from './model';

export class ProcessFailure extends Error {
  constructor(message: string, readonly cancelled = false, readonly cleanupFailed = false) { super(message); }
}

export async function runProcess(spec: ProcessSpec, context: OperationContext = {}): Promise<ProcessResult> {
  if (context.signal?.aborted) throw new ProcessFailure('Cancelled', true);
  return new Promise((resolve, reject) => {
    let output = '', cancelled = false, settled = false;
    const child = spawn(spec.executable, spec.args, { cwd: spec.cwd, env: spec.env ?? process.env, shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
    const append = (chunk: string) => { if (settled) return; output = (output + chunk).slice(-65536); context.onLog?.(chunk); };
    child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
    child.stdout.on('data', append); child.stderr.on('data', append);
    let killing: Promise<void> | undefined;
    let killer: ReturnType<typeof spawn> | undefined;
    let cleanupTimer: ReturnType<typeof setTimeout> | undefined;
    const finish = (error?: ProcessFailure, code: number | null = null) => {
      if (settled) return;
      settled = true; clearTimeout(cleanupTimer); context.signal?.removeEventListener('abort', abort);
      if (error?.cleanupFailed) {
        // A refused/hung termination must not retain pipes, emit late logs or claim success.
        child.stdout.destroy(); child.stderr.destroy(); child.unref();
        if (killer) { try { killer.kill(); } catch {} killer.unref(); }
      }
      if (error) reject(error); else resolve({ code, output, cancelled });
    };
    const failedCleanup = (reason: string) => finish(new ProcessFailure(`Process cleanup failed (PID ${child.pid ?? 'unknown'}): ${reason}. Stop the owned processes before retrying.`, false, true));
    const abort = () => {
      if (settled || killing) return;
      cancelled = true;
      cleanupTimer = setTimeout(() => failedCleanup('process tree exit was not confirmed within 5000 ms'), 5000);
      killing = new Promise<void>(done => {
        if (!child.pid) { done(); return; }
        if (process.platform === 'win32' && spec.termination === 'process') {
          // A known leaf has no descendants. Use its retained OS handle rather
          // than taskkill's PID lookup, which races an already exiting child.
          // A false result is never proof of success: close must still arrive
          // before the cleanup deadline. Refusal/error remains cleanupFailed.
          try { child.kill('SIGKILL'); } catch (error) { failedCleanup(String(error)); }
          done();
        } else if (process.platform === 'win32') {
          try { killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }); }
          catch (error) { failedCleanup(String(error)); done(); return; }
          killer.once('error', error => { failedCleanup(`taskkill could not start: ${error.message}`); done(); });
          killer.once('close', code => { if (code !== 0) failedCleanup(`taskkill exited with ${code}`); done(); });
        } else {
          try { process.kill(-child.pid, 'SIGKILL'); }
          catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ESRCH') failedCleanup(String(error)); }
          done();
        }
      });
    };
    context.signal?.addEventListener('abort', abort, { once: true });
    if (context.signal?.aborted) abort();
    child.once('error', error => {
      if (cancelled && spec.termination === 'process' && child.pid) failedCleanup(`leaf termination failed: ${error.message}`);
      else finish(new ProcessFailure(`Could not start ${spec.executable}: ${error.message}`, cancelled));
    });
    child.once('close', code => { void Promise.resolve(killing).then(() => finish(undefined, code)); });
  });
}

export async function checkedProcess(spec: ProcessSpec, context: OperationContext = {}): Promise<string> {
  const result = await runProcess(spec, context);
  if (result.cancelled) throw new ProcessFailure('Cancelled', true);
  if (result.code !== 0) throw new ProcessFailure(`Process exited with ${result.code}: ${result.output.trim()}`);
  return result.output;
}
