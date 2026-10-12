import path from 'node:path';
import { mkdir, access, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { checkedProcess, type SimulatorBackend, type Toolchain, type OperationContext, type BuildRequest, type BuildArtifact } from '../core/index';
import { buildPaths } from './paths';
import { managedTraceHarness } from './trace-harness';

export class VerilatorBackend implements SimulatorBackend {
  readonly id = 'verilator';
  readonly capabilities = { waveforms: ['vcd', 'fst', 'none'] as const, timing: true, inputSnapshot: true, managedWaveform: true };
  constructor(private readonly tools: Toolchain) {}
  async check(context: OperationContext = {}): Promise<void> {
    const cmd = this.tools.compiler;
    const output = await checkedProcess({ ...cmd, args: [...cmd.args, '--version'], cwd: process.cwd() }, context);
    const match = output.match(/Verilator\s+(\d+)\.(\d+)/);
    if (!match || Number(match[1]) < 5) throw Error(`Verilator 5 or later is required: ${output}`);
  }
  async build({ project, target, directory }: BuildRequest, context: OperationContext = {}): Promise<BuildArtifact> {
    const buildDir = path.join(directory, 'build');
    await mkdir(buildDir, { recursive: true });
    const safeTop = target.top.replace(/[^A-Za-z0-9_$-]/g, '_').slice(0, 64) || 'top';
    const filename = `rtl_${safeTop}_${randomUUID()}.${project.waveform}`;
    const driverDir = path.join(directory, 'instrumentation'); await mkdir(driverDir, { recursive: true });
    const driver = path.join(driverDir, 'managed-main.cpp');
    await writeFile(driver, managedTraceHarness(project.waveform, filename, project.timing));
    context.onLog?.(project.waveform === 'none' ? 'IDE waveform recording disabled.\n' : `IDE managed ${project.waveform.toUpperCase()} waveform: ${filename}. Existing RTL dump statements remain unchanged.\n`);
    const cmd = this.tools.compiler;
    const paths = await buildPaths(project.root, this.tools.pathAliasDirectory);
    try {
    const includeArgs: string[] = [];
    for (const dir of project.includeDirs) includeArgs.push(`-I${await paths.directory(dir)}`);
    const sourceArgs: string[] = [];
    for (const file of new Set([...project.sources, ...target.sources])) sourceArgs.push(await paths.map(file));
    const args = [
      ...cmd.args, '--cc', '--exe', '--build', '--assert', project.timing ? '--timing' : '--no-timing',
      '--top-module', target.top, '--prefix', 'Vrtl', '--Mdir', await paths.directory(buildDir),
      ...(process.platform === 'win32' ? ['-MAKEFLAGS', `CURDIR=${await paths.directory(buildDir)}`] : []),
      '-o', 'simulation', '-j', '2', '-Wno-fatal',
      // GCC 16 / UCRT64 can emit unresolved std::string move symbols at -Os.
      // Keep this toolchain workaround in the adapter, outside project settings.
      '-CFLAGS', (process.platform === 'win32' ? '-std=c++20 -O2' : '-std=c++20') + ' -DVL_TIME_CONTEXT',
      ...(project.waveform === 'none' ? [] : [project.waveform === 'fst' ? '--trace-fst' : '--trace', '-DRTL_WAVEFORM']),
      ...(project.waveform === 'fst' ? ['-DRTL_FST'] : []),
      ...includeArgs,
      ...Object.entries(project.defines).map(([key, value]) => `-D${key}=${value}`),
      ...sourceArgs, await paths.map(driver)
    ];
    await checkedProcess({ ...cmd, args, cwd: await paths.directory(directory) }, { ...context, onLog: text => context.onLog?.(paths.original(text)) });
    let executable = path.join(buildDir, 'simulation');
    if (process.platform === 'win32') {
      try { await access(executable + '.exe'); executable += '.exe'; } catch { /* Some toolchains omit the suffix. */ }
    }
    await access(executable);
    return { executable, cwd: directory, env: cmd.env, waveform: project.waveform === 'none' ? undefined : path.join(directory, filename) };
    } catch (error) { throw Error(paths.original(String(error))); }
    finally { await paths.dispose(); }
  }
  async run(artifact: BuildArtifact, context: OperationContext = {}): Promise<void> {
    await checkedProcess({ ...artifact, args: [] }, context);
  }
}
