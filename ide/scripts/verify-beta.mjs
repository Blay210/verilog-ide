import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { root, inside } from './environment.mjs';
import { createIcon, createPng, iconSvg } from './icon.mjs';
import { verifyPackageIntegrity } from './package-integrity.mjs';

// Inventory and Electron-as-Node CLI only. Never opens a workbench window.
const output = path.join(root, 'VSCode-win32-x64');
const reportDir = path.join(root, '.dev/windows-integrated');
const receipt = { passed: false, scope: 'Packaged file inventory and headless CLI; no GUI or clean-Windows acceptance', checks: [] };
await fs.mkdir(reportDir, { recursive: true });
try {
  const build = JSON.parse(await fs.readFile(path.join(reportDir, 'beta-receipt.json'), 'utf8'));
  if (!build.passed || build.output !== output || !inside(await fs.realpath(root), await fs.realpath(output))) throw Error('Expected a completed owned beta build.');
  const app = path.join(output, 'resources/app');
  const product = JSON.parse(await fs.readFile(path.join(app, 'product.json'), 'utf8'));
  const manifest = JSON.parse(await fs.readFile(path.join(app, 'package.json'), 'utf8'));
  if (product.applicationName !== 'rtl-ide') throw Error('Wrong product identity.');
  receipt.version = manifest.version;
  const expected = JSON.parse(await fs.readFile(path.join(root, 'config/product.json'), 'utf8')).values;
  if (product.nameShort !== expected.nameShort) throw Error('Package predates current product branding; rebuild before acceptance.');
  receipt.integrityFiles = verifyPackageIntegrity(app);
  receipt.checks.push('All ten upstream integrity checksums match actual packaged bundles');
  receipt.files = [];
  const required = [
    `${product.nameShort}.exe`, 'Pulse.VisualElementsManifest.xml', 'resources/app/resources/win32/code.ico', 'resources/app/resources/win32/code_70x70.png', 'resources/app/resources/win32/code_150x150.png', 'bin/rtl-ide.cmd', 'resources/app/out/cli.js',
    'resources/app/out/main.js', 'resources/app/out/mainImpl.js', 'resources/app/out/media/code-icon.svg',
    'resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js',
    'resources/app/out/vs/workbench/workbench.desktop.main.js',
    'resources/app/out/vs/platform/rtl/node/analyze.py', 'resources/app/out/vs/platform/rtl/node/rtl-cli.cjs', 'bin/pulse-rtl.cmd',
    'resources/app/out/vs/platform/rtl/node/waveform-worker.cjs',
    'resources/app/out/vs/platform/rtl/node/waveform.html',
    'resources/app/extensions/rtl-language/dist/extension.cjs',
    'resources/app/extensions/rtl-language/syntaxes/verilog.tmLanguage.json',
    'resources/app/extensions/rtl-language/LICENSE',
    'resources/app/extensions/git/package.json', 'resources/app/extensions/git-base/package.json',
    'resources/app/LICENSE.txt', 'resources/app/ThirdPartyNotices.txt'
  ];
  for (const relative of required) {
    const file = path.join(output, relative);
    if (!inside(output, await fs.realpath(file))) throw Error('Packaged resource escapes output: ' + relative);
    const bytes = await fs.readFile(file);
    if (!bytes.length) throw Error('Empty packaged resource: ' + relative);
    receipt.files.push({ relative, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  receipt.checks.push('Product identity, bundled RTL assets, language, Git and upstream notices present');
  for(const [relative,expectedBytes] of [['code.ico',createIcon()],['code_70x70.png',createPng(70)],['code_150x150.png',createPng(150)]]) {
    if(!(await fs.readFile(path.join(app,'resources/win32',relative))).equals(expectedBytes))throw Error('Packaged Pulse icon differs: '+relative);
  }
  if(!(await fs.readFile(path.join(output,'Pulse.VisualElementsManifest.xml'),'utf8')).includes('ShortDisplayName="Pulse"'))throw Error('Windows tile retains old product name');
  receipt.checks.push('Windows ICO, both tile PNGs and visual display name match Pulse');
  if((await fs.readFile(path.join(app,'out/media/code-icon.svg'),'utf8'))!==iconSvg)throw Error('Titlebar logo differs from Pulse');
  for (const extension of ['copilot', 'copilot-chat', 'github-authentication', 'microsoft-authentication']) {
    try { await fs.lstat(path.join(app, 'extensions', extension)); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    throw Error('Excluded extension exists: ' + extension);
  }
  receipt.checks.push('Copilot and authentication extensions absent');
  const env = { ...process.env, ELECTRON_RUN_AS_NODE: '1' };
  for (const key of ['VSCODE_DEV', 'NODE_PATH', 'NODE_OPTIONS']) delete env[key];
  const cli = await new Promise((resolve, reject) => {
    const child = spawn(path.join(output, `${product.nameShort}.exe`), [path.join(app, 'out/cli.js'), '--version'], {
      cwd: reportDir, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '', stderr = '';
    const timer = setTimeout(() => { child.kill(); reject(Error('Headless CLI version timed out')); }, 30000);
    child.stdout.on('data', b => { stdout += b; }); child.stderr.on('data', b => { stderr += b; });
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
  });
  receipt.cli = cli;
  if (cli.code !== 0 || cli.stdout.trim().split(/\r?\n/)[0] !== manifest.version || !/\bx64\b/.test(cli.stdout)) throw Error('Packaged CLI version failed');
  receipt.checks.push('Packaged Electron CLI --version exits 0 in a non-source working directory');
  receipt.passed = true;
} catch (error) { receipt.error = String(error); process.exitCode = 1; }
finally {
  await fs.writeFile(path.join(reportDir, 'beta-inventory.json'), JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({ passed: receipt.passed, checks: receipt.checks, cli: receipt.cli, error: receipt.error }, null, 2));
}
