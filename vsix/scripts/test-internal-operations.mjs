import './build.mjs';
import { build } from 'esbuild';
import { mkdir, mkdtemp, copyFile, writeFile, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
const code = process.env.VSCODE_EXECUTABLE;
if (!code) throw Error('Set VSCODE_EXECUTABLE; uses an isolated development profile.');
await mkdir('.dev/e1-host', { recursive: true });
const root = await mkdtemp(path.resolve('.dev/e1-host/run-')), project = path.join(root, 'project');
await mkdir(project);
for (const file of ['design.sv', 'tb.sv']) await copyFile('tests/fixtures/internal-operations/' + file, path.join(project, file));
await writeFile(path.join(project, 'rtl.toml'), 'version=1\n[project]\nname="e1-host"\n[sources]\nrtl=["design.sv"]\n[[test]]\nname="mac"\ntop="probe_tb"\nsources=["tb.sv"]\n');
const suite = path.join(root, 'suite.cjs');
await build({ entryPoints: ['tests/vscode/internal-operations.ts'], bundle: true, platform: 'node', format: 'cjs', external: ['vscode'], outfile: suite });
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
console.log('E1 development host:', root);
const child = spawn(code, [project, '--new-window', '--disable-extensions', '--disable-workspace-trust', '--skip-welcome', '--skip-release-notes', '--user-data-dir', path.join(root, 'profile'), '--extensions-dir', path.join(root, 'extensions'), '--extensionDevelopmentPath=' + path.resolve('packages/vscode'), '--extensionTestsPath=' + suite], { env, windowsHide: true, stdio: 'inherit' });
child.on('error', error => { console.error(error); process.exitCode = 1; });
child.on('exit', async code => {
  process.exitCode = code ?? 1;
  try { if (JSON.parse(await readFile(path.join(project, '.rtl/e1-host.json'), 'utf8')).passed !== true) process.exitCode = 1; }
  catch { process.exitCode = 1; console.error('E1 host did not write a successful receipt.'); }
});
