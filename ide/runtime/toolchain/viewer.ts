// Ported from this project's MIT-licensed VSIX GTKWave adapter; owns no VSIX imports.
import { spawn } from 'node:child_process';
import { lstat } from 'node:fs/promises';
import path from 'node:path';
import type { ToolCommand, WaveformProvider } from '../core/model';

export class GtkWaveProvider implements WaveformProvider {
  constructor(private readonly command: ToolCommand) {}
  async open(file: string, signal?: AbortSignal): Promise<void> {
    signal?.throwIfAborted();
    const info = await lstat(file);
    if (!info.isFile() || info.isSymbolicLink() || !/\.(vcd|fst)$/i.test(file)) throw Error('VCD/FST 파형 파일을 선택해 주세요.');
    signal?.throwIfAborted();
    await new Promise<void>((resolve, reject) => {
      const child = spawn(this.command.executable, [...this.command.args, path.resolve(file)], {
        cwd: path.dirname(file), env: this.command.env, shell: false, windowsHide: false, detached: true, stdio: 'ignore'
      });
      child.once('error', reject);
      child.once('spawn', () => { child.unref(); resolve(); });
    });
  }
}
