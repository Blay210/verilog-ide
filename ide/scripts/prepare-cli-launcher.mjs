import fs from 'node:fs';
import path from 'node:path';
import { root, inside } from './environment.mjs';

/** Source preparation only; called by an explicit future package build. */
export function prepareCliLauncher(output) {
  if (!inside(fs.realpathSync(root), fs.realpathSync(output))) throw Error('CLI output escaped IDE.');
  const bin = path.join(output, 'bin');
  if (!inside(output, fs.realpathSync(bin))) throw Error('CLI bin escaped output.');
  const target = path.join(bin, 'pulse-rtl.cmd');
  const contents = '@echo off\r\nsetlocal\r\nset "ELECTRON_RUN_AS_NODE=1"\r\n"%~dp0..\\Pulse.exe" "%~dp0..\\resources\\app\\out\\vs\\platform\\rtl\\node\\rtl-cli.cjs" %*\r\nexit /b %errorlevel%\r\n';
  if (fs.existsSync(target)) {
    if (!inside(output, fs.realpathSync(target)) || fs.readFileSync(target, 'utf8') !== contents) throw Error('Unmanaged RTL CLI launcher; refusing overwrite.');
  } else fs.writeFileSync(target, contents, { flag: 'wx' });
}
