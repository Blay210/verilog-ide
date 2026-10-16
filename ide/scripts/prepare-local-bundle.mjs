import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { root, inside, validateSource } from './environment.mjs';
import { applyPatches } from './patches.mjs';
import { prepareRuntime } from './prepare-runtime.mjs';
import { prepareLanguage } from './prepare-language.mjs';
import { prepareBranding, prepareDesktopBranding } from './prepare-branding.mjs';
import { prepareCliLauncher } from './prepare-cli-launcher.mjs';
import { refreshPackageIntegrity, verifyPackageIntegrity } from './package-integrity.mjs';

// A fresh local test app, never an installer/release or an in-place refresh.
// The validated Electron/native dependencies are reused as bytes, without links.
const verifyOnly = process.argv[2] === '--verify';
if (process.argv.length !== (verifyOnly ? 4 : 2) || process.platform !== 'win32' || process.arch !== 'x64') throw Error('Run without arguments, or --verify <owned candidate>, on the prepared Windows x64 host.');
const source = path.join(root, 'upstream'), base = path.join(root, 'VSCode-win32-x64');
const reportDir = path.join(root, '.dev/windows-integrated');
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
validateSource(source);
const build = JSON.parse(fs.readFileSync(path.join(reportDir, 'beta-receipt.json'), 'utf8'));
const inventory = JSON.parse(fs.readFileSync(path.join(reportDir, 'beta-inventory.json'), 'utf8'));
if (!build.passed || build.output !== base || !inventory.passed || !inside(root, fs.realpathSync(base))) throw Error('Expected an existing validated local native runtime.');
const checkBase = () => {
  for (const file of inventory.files) {
    const input = path.join(base, file.relative);
    if (!inside(base, fs.realpathSync(input)) || hash(input) !== file.sha256) throw Error('Validated base changed: ' + file.relative);
  }
};
checkBase();
const output = verifyOnly ? fs.realpathSync(process.argv[3]) : fs.mkdtempSync(path.join(root, '.dev/pulse-bundled-'));
if (path.dirname(output) !== fs.realpathSync(path.join(root, '.dev')) || !path.basename(output).startsWith('pulse-bundled-')) throw Error('Expected a dedicated owned local candidate.');
const receipt = verifyOnly ? JSON.parse(fs.readFileSync(path.join(output, '.pulse-build.json'), 'utf8')) : { kind: 'local-bundled', passed: false, output, base, scope: 'Fresh optimized local app; headless checks only, no UI acceptance, installer or release', checks: [] };
if (receipt.kind !== 'local-bundled' || receipt.output !== output || receipt.base !== base || verifyOnly && (!receipt.codeIdentity || !receipt.checks.includes('Official desktop esbuild bundle completed'))) throw Error('No matching owned completed bundle to verify.');
const receiptFile = path.join(output, '.pulse-build.json');
const env = { ...process.env, GIT_CEILING_DIRECTORIES: root };
for (const key of ['NODE_PATH', 'NODE_OPTIONS', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'VSCODE_DEV', 'ELECTRON_RUN_AS_NODE']) delete env[key];
const run = (exe, args, cwd, extraEnv = {}, logName) => new Promise((resolve, reject) => {
  const log = logName ? fs.openSync(path.join(reportDir, logName), 'w') : undefined;
  const child = spawn(exe, args, { cwd, env: { ...env, ...extraEnv }, windowsHide: true, stdio: ['ignore', log ?? 'pipe', log ?? 'pipe'] });
  let stdout = '', stderr = '', settled = false;
  child.stdout?.on('data', b => { if (stdout.length < 65536) stdout += b; });
  child.stderr?.on('data', b => { if (stderr.length < 65536) stderr += b; });
  const finish = (error, code) => {
    if (settled) return; settled = true; clearTimeout(timer); if (log !== undefined) fs.closeSync(log);
    if (error || code !== 0) reject(error ?? Error('Build/check failed: ' + code + ' ' + stderr)); else resolve({ code, stdout, stderr });
  };
  const timer = setTimeout(() => { child.kill(); finish(Error('Build/check timed out')); }, logName ? 600000 : 30000);
  child.once('error', error => finish(error)); child.once('close', code => finish(undefined, code));
});
const copy = (from, to, omit = []) => fs.cpSync(from, to, { recursive: true, errorOnExist: true, force: false, filter: file => {
  const relative = path.relative(from, file).replaceAll(path.sep, '/');
  if (omit.some(name => relative === name || relative.startsWith(name + '/'))) return false;
  if (fs.lstatSync(file).isSymbolicLink() || !inside(fs.realpathSync(from), fs.realpathSync(file))) throw Error('Linked build input: ' + file);
  return true;
} });
const inventoryTree = directory => {
  const result = [];
  const visit = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink() || !inside(directory, fs.realpathSync(file))) throw Error('Linked candidate file.');
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && file !== receiptFile) result.push({ relative: path.relative(directory, file).replaceAll(path.sep, '/'), size: fs.statSync(file).size, sha256: hash(file) });
      else if (!entry.isFile()) throw Error('Unsupported candidate entry.');
    }
  };
  visit(directory); return result;
};
try {
 if (!verifyOnly) {
  applyPatches(source);
  prepareBranding(source); prepareDesktopBranding(source);
  await prepareRuntime(source, { sourceBuild: true }); await prepareLanguage(source);
  await run(process.execPath, ['build/next/index.ts', 'bundle', '--out', 'out-vscode', '--target', 'desktop', '--nls'], source, {}, 'pulse-local-bundle.log');
  receipt.checks.push('Official desktop esbuild bundle completed');
  copy(base, output, ['resources/app/out', 'resources/app/extensions/rtl-language', 'data',
    'resources/app/extensions/debug-auto-launch', 'resources/app/extensions/vscode-api-tests', 'resources/app/extensions/vscode-test-resolver']);
  copy(path.join(source, 'out-vscode'), path.join(output, 'resources/app/out'));
  copy(path.join(source, 'extensions/rtl-language'), path.join(output, 'resources/app/extensions/rtl-language'));
  checkBase(); receipt.checks.push('Existing runtime and release candidate preserved');
  prepareBranding(output, { packaged: true }); prepareDesktopBranding(output, { packaged: true }); prepareCliLauncher(output);
 }
  const app = path.join(output, 'resources/app'), productFile = path.join(app, 'product.json');
  for (const relative of ['out/main.js', 'out/mainImpl.js', 'out/cli.js', 'out/vs/platform/rtl/node/analyze.py',
    'out/vs/platform/rtl/node/rtl-cli.cjs', 'out/vs/platform/rtl/node/waveform.html', 'out/vs/platform/rtl/node/waveform-worker.cjs',
    'extensions/rtl-language/dist/extension.cjs', 'extensions/rtl-language/dist/server.cjs', 'extensions/rtl-language/dist/analyze.py']) {
    const file = path.join(app, relative);
    if (!inside(app, fs.realpathSync(file)) || !fs.statSync(file).isFile() || fs.statSync(file).size === 0) throw Error('Missing local application resource: ' + relative);
  }
  const product = JSON.parse(fs.readFileSync(productFile, 'utf8'));
  if (product.applicationName !== 'rtl-ide' || product.nameShort !== 'Pulse') throw Error('Unexpected product identity.');
  // The native code-cache key must change for local Pulse code revisions too.
  const codeFiles = inventoryTree(path.join(app, 'out')).concat(inventoryTree(path.join(app, 'extensions/rtl-language')));
  const codeIdentity = createHash('sha256').update(JSON.stringify(codeFiles)).digest('hex');
  if (verifyOnly) {
    if (receipt.codeIdentity !== codeIdentity || product.commit !== codeIdentity.slice(0, 40) || product.rtlLocalBuild !== codeIdentity) throw Error('Candidate code differs from its completed bundle receipt.');
  } else {
    receipt.codeIdentity = codeIdentity; receipt.upstreamCommit = product.commit;
    product.commit = codeIdentity.slice(0, 40); product.rtlLocalBuild = codeIdentity;
    fs.writeFileSync(productFile, JSON.stringify(product, null, '\t') + '\n');
    refreshPackageIntegrity(app);
  }
  receipt.integrityFiles = verifyPackageIntegrity(app);
  if (!verifyOnly) receipt.checks.push('Ten native integrity resources verified; native code cache has a unique build key');
  for (const name of ['copilot', 'copilot-chat', 'github-authentication', 'microsoft-authentication']) if (fs.existsSync(path.join(app, 'extensions', name))) throw Error('Unexpected excluded extension: ' + name);
  const manifest = JSON.parse(fs.readFileSync(path.join(app, 'package.json'), 'utf8'));
  receipt.cli = await run(path.join(output, 'Pulse.exe'), [path.join(app, 'out/cli.js'), '--version'], reportDir, { ELECTRON_RUN_AS_NODE: '1' });
  if (receipt.cli.stdout.trim().split(/\r?\n/)[0] !== manifest.version || !/\bx64\b/.test(receipt.cli.stdout)) throw Error('Headless CLI identity mismatch.');
  receipt.checks.push('Electron-as-Node CLI version/x64 succeeds without opening a window');
  const { initializeSourceProject } = await import('../dist/runtime/core/workspace-project.js');
  const fixture = fs.mkdtempSync(path.join(reportDir, 'pulse-cli-bundle-'));
  await initializeSourceProject(fixture, 'bundle-check');
  fs.writeFileSync(path.join(fixture, 'rtl/dut.sv'), 'module dut; endmodule');
  fs.writeFileSync(path.join(fixture, 'tb/bench.sv'), 'module first; initial #1 $finish; endmodule\nmodule second; initial #2 $finish; endmodule');
  receipt.rtlCli = await run(path.join(output, 'Pulse.exe'), [path.join(app, 'out/vs/platform/rtl/node/rtl-cli.cjs'), 'check', '--project', fixture], reportDir, { ELECTRON_RUN_AS_NODE: '1' });
  const projectCheck = JSON.parse(receipt.rtlCli.stdout);
  if (projectCheck.name !== 'bundle-check' || JSON.stringify(projectCheck.tests.map(t => t.top).sort()) !== JSON.stringify(['first', 'second'])) throw Error('Bundled RTL CLI project/two-top discovery mismatch.');
  receipt.checks.push('Bundled RTL CLI loads an owned project and discovers both tops without compiling or opening a window');
  receipt.files = inventoryTree(output); receipt.passed = true; delete receipt.error;
} catch (error) { receipt.error = String(error); throw error; }
finally {
  fs.writeFileSync(receiptFile, JSON.stringify(receipt, null, 2) + '\n');
  fs.writeFileSync(path.join(reportDir, 'pulse-local-bundle-receipt.json'), JSON.stringify({ output, passed: receipt.passed, checks: receipt.checks, error: receipt.error }, null, 2) + '\n');
}
console.log(JSON.stringify({ output, passed: receipt.passed, checks: receipt.checks, files: receipt.files.length }));
