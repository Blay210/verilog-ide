import { mkdir, open, readdir, writeFile, lstat, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { OperationContext, InputOverride, Project, SimulatorBackend, TestResult, TestTarget, PackageDependencyProvider } from './model';
import { freezeInputOverrides } from './input-overrides';
import { prepareProject } from './project';
import { captureInputs } from './identity';
import { captureTraceIdentity } from './trace';
import { createInputSnapshot, loadRecordedInputs, SnapshotPreparationError } from './snapshot';
import { ProcessFailure } from './process';
export interface RunContext extends OperationContext { inputOverrides?: readonly InputOverride[]; packageProvider?: PackageDependencyProvider; jobs?: number; onStart?: (target: TestTarget) => void; onTestLog?: (target: TestTarget, text: string) => void; onResult?: (result: TestResult) => void }

export async function runTest(project: Project, target: TestTarget, backend: SimulatorBackend, context: RunContext = {}): Promise<TestResult> {
  const inputOverrides = freezeInputOverrides(context.inputOverrides);
  const requestedPackageOrder = project.packageOrder;
  if (!inputOverrides.length) project = await prepareProject(project, context.packageProvider, context);
  if (project.backend !== backend.id) throw Error(`Unsupported simulator: ${project.backend}`);
  if (!backend.capabilities.waveforms.includes(project.waveform)) throw Error(`Unsupported waveform: ${project.waveform}`);
  const base = path.join(project.root, '.rtl');
  await mkdir(base, { recursive: true });
  if ((await lstat(base)).isSymbolicLink()) throw Error('.rtl must not be a symlink.');
  const runs = path.join(base, 'runs'); await mkdir(runs, { recursive: true });
  if ((await lstat(runs)).isSymbolicLink()) throw Error('.rtl/runs must not be a symlink.');
  const runId = randomUUID();
  const directory = path.join(runs, `${target.name}-${runId}`);
  await mkdir(directory, { recursive: true });
  const logPath = path.join(directory, 'run.log');
  const log = await open(logPath, 'w');
  let writes = Promise.resolve();
  const writeLog = (text: string) => { writes = writes.then(async () => { await log.write(text); }); context.onLog?.(text); };
  const start = Date.now();
  const controller = new AbortController();
  const abort = () => controller.abort();
  context.signal?.addEventListener('abort', abort, { once: true });
  if (context.signal?.aborted) controller.abort();
  let timedOut = false;
  let managedWaveform: string | undefined;
  const timer = setTimeout(() => {
    // A user's cancellation remains cancellation even if process cleanup is slow.
    if (!controller.signal.aborted) { timedOut = true; controller.abort(); }
  }, target.timeoutMs);
  const result: TestResult = { name: target.name, top: target.top, status: 'passed', durationMs: 0, directory, log: logPath, source: target.sources[0], startedAt: new Date(start).toISOString(), tags: target.tags ?? [], sources: [...new Set([...project.sources, ...target.sources])] };
  const finalizationError = (error: unknown) => result.cleanupFailure
    ? new ProcessFailure(`${result.cleanupFailure} Result finalization failed: ${String(error)}`, false, true) : error;
  try {
    controller.signal.throwIfAborted();
    if (inputOverrides.length && !backend.capabilities.inputSnapshot) throw new SnapshotPreparationError('Backend cannot execute editor input snapshots.');
    result.runId = runId;
    let buildProject = project, buildTarget = target;
    if (backend.capabilities.inputSnapshot) {
      try {
        const recorded = await createInputSnapshot({ ...project, packageOrder: requestedPackageOrder }, target, directory, runId, controller.signal, context.packageProvider, inputOverrides);
        result.inputIdentity = recorded.identity;
        result.inputSnapshot = { version: 1, state: 'ready', fingerprint: recorded.identity.fingerprint, ...(recorded.overrides?.length ? { unsavedFiles: recorded.overrides.map(input => input.path) } : {}) };
        buildProject = recorded.project; buildTarget = recorded.target;
        const key = (file: string) => process.platform === 'win32' ? path.resolve(file).toLowerCase() : path.resolve(file);
        const originals = new Map(recorded.sourceMappings.map(mapping => [key(mapping.recorded), mapping.original]));
        result.sources = [...new Set([...buildProject.sources, ...buildTarget.sources])].map(file => originals.get(key(file))!);
        writeLog('Building from recorded sources and package order.\n');
      } catch (error) {
        result.inputSnapshot = { version: 1, state: 'unavailable', reason: String(error) };
        if (inputOverrides.length || error instanceof SnapshotPreparationError) throw error;
        writeLog(`Recorded sources unavailable; using current project inputs: ${String(error)}\n`);
      }
    } else result.inputSnapshot = { version: 1, state: 'unavailable', reason: 'Backend does not support recorded input builds.' };
    result.inputIdentity ??= await captureInputs(project, target, controller.signal);
    controller.signal.throwIfAborted();
    writeLog(`Building ${target.name}\n`);
    const artifact = await backend.build({ project: buildProject, target: buildTarget, directory }, { signal: controller.signal, onLog: writeLog });
    if (artifact.waveform) {
      const normalize = (file: string) => process.platform === 'win32' ? path.resolve(file).toLowerCase() : path.resolve(file);
      if (!path.isAbsolute(artifact.waveform) || normalize(path.dirname(artifact.waveform)) !== normalize(directory) || !artifact.waveform.endsWith('.' + project.waveform)) throw Error('Backend waveform must be a local artifact of this run and format.');
      managedWaveform = artifact.waveform;
    }
    controller.signal.throwIfAborted();
    writeLog(`Running ${target.name}\n`);
    await backend.run(artifact, { signal: controller.signal, onLog: writeLog });
    controller.signal.throwIfAborted();
  } catch (error) {
    if (error instanceof ProcessFailure && error.cleanupFailed) result.cleanupFailure = error.message;
    result.status = result.cleanupFailure ? 'failed' : timedOut ? 'timedOut' : controller.signal.aborted ? 'cancelled' : 'failed';
    result.message = result.cleanupFailure ?? (timedOut ? `Exceeded ${target.timeoutMs} ms (build + simulation).` : String(error));
    writeLog(`${result.message}\n`);
  } finally {
    clearTimeout(timer); context.signal?.removeEventListener('abort', abort);
    result.durationMs = Date.now() - start;
    try { await writes.finally(() => log.close()); } catch (error) { throw finalizationError(error); }
  }
  result.runId = runId;
  if (result.inputSnapshot?.state === 'ready') {
    try { await loadRecordedInputs(result, context.signal); }
    catch (error) {
      result.inputSnapshot = { ...result.inputSnapshot, state: 'unavailable', reason: String(error) };
      if (result.inputIdentity) result.inputIdentity = { ...result.inputIdentity, state: 'unavailable', reason: String(error) };
    }
  } else if (result.inputIdentity?.fingerprint) {
    const after = await captureInputs(project, target, controller.signal);
    if (after.state === 'unavailable') result.inputIdentity = { ...result.inputIdentity, state: 'unavailable', reason: after.reason };
    else if (after.fingerprint !== result.inputIdentity.fingerprint) result.inputIdentity.state = 'changed-during-run';
  } else result.inputIdentity ??= { version: 1, coverage: 'configured-inputs', state: 'unavailable', reason: 'No inputs were observed before cancellation.' };
  if (project.waveform !== 'none') {
    if (managedWaveform) {
      try { const stat = await lstat(managedWaveform); if (stat.isFile() && !stat.isSymbolicLink() && stat.size > 0) result.waveform = managedWaveform; } catch { /* Build/run may end before any trace bytes are written. */ }
    } else if (!backend.capabilities.managedWaveform) {
      const files = (await readdir(directory)).filter(f => f.endsWith(`.${project.waveform}`)).sort();
      if (files.length) result.waveform = path.join(directory, files[0]);
    }
    if (!result.waveform && result.status === 'passed') result.message = [result.message, backend.capabilities.managedWaveform ? 'IDE waveform recording produced no trace. Check the execution log; no RTL dump code is required.' : 'No waveform generated. Add $dumpfile/$dumpvars to the testbench (see the example).'].filter(Boolean).join('\n');
  }
  if (result.waveform && project.waveform !== 'none') result.traceIdentity = await captureTraceIdentity(result, project.waveform, context.signal);
  try {
    await writeFile(path.join(directory, 'result.json.partial'), JSON.stringify(result, null, 2));
    await rename(path.join(directory, 'result.json.partial'), path.join(directory, 'result.json'));
  } catch (error) { throw finalizationError(error); }
  return result;
}

export async function runTests(project: Project, targets: TestTarget[], backend: SimulatorBackend, context: RunContext = {}): Promise<TestResult[]> {
  context = { ...context, inputOverrides: freezeInputOverrides(context.inputOverrides) };
  const jobs = context.jobs ?? project.jobs ?? 1;
  if (!Number.isInteger(jobs) || jobs < 1 || jobs > 4) throw Error('Parallel jobs must be 1..4.');
  if (context.signal?.aborted) return [];
  const results: (TestResult | undefined)[] = new Array(targets.length);
  const abort = new AbortController();
  const signal = context.signal ? AbortSignal.any([context.signal, abort.signal]) : abort.signal;
  let next = 0;
  const workers = Array.from({ length: Math.min(jobs, targets.length) }, async () => {
    try {
      while (!signal.aborted && next < targets.length) {
        const index = next++, target = targets[index]; context.onStart?.(target);
        const result = await runTest(project, target, backend, { ...context, signal, onLog: text => { context.onLog?.(text); context.onTestLog?.(target, text); } });
        results[index] = result; context.onResult?.(result);
        if (result.cleanupFailure) abort.abort();
      }
    } catch (error) { abort.abort(); throw error; }
  });
  const settled = await Promise.allSettled(workers);
  const failed = settled.find(r => r.status === 'rejected');
  if (failed?.status === 'rejected') throw failed.reason;
  return results.filter((r): r is TestResult => !!r);
}
