import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { root, inside } from './environment.mjs';
import { prepareDevelopmentExecutable } from './launcher.mjs';
import { launchPlan } from './launch-plan.mjs';

// Development-only launch of an already built app. Preparing bundles and
// fingerprinting the Electron binary belong to build preparation, not startup.
const manifest = path.join(root, '.dev/latest-launch.json');
const source = path.join(root, 'upstream');
const mode = process.argv[2] ?? 'open';
if (!['prepare', 'prepare-bundled', '--check', 'open'].includes(mode) || process.argv.length > (mode === 'prepare-bundled' ? 4 : 3)) throw Error('Use prepare, prepare-bundled <candidate>, --check, or no argument.');
const began = performance.now();
const assetFiles = (executable, bundled = false) => bundled ? [executable, path.join(path.dirname(executable), '.pulse-build.json'),
  ...['product.json', 'package.json', 'out/main.js', 'out/mainImpl.js', 'out/vs/workbench/workbench.desktop.main.js',
    'out/vs/workbench/workbench.desktop.main.css', 'out/vs/platform/rtl/node/rtl-cli.cjs', 'out/vs/platform/rtl/node/waveform.html',
    'out/vs/platform/rtl/node/analyze.py', 'extensions/rtl-language/dist/extension.cjs', 'extensions/rtl-language/dist/server.cjs',
    'extensions/rtl-language/dist/analyze.py'].map(file => path.join(path.dirname(executable), 'resources/app', file))] : [executable, executable + '.json',
  'out/vs/workbench/contrib/rtl/browser/rtlSpaces.contribution.js',
  'out/vs/workbench/contrib/rtl/browser/rtlProjectStart.js',
  'out/vs/workbench/contrib/rtl/browser/rtlSimulationHome.js',
  'out/vs/platform/rtl/node/runtime.js',
  'extensions/rtl-language/dist/extension.cjs', 'extensions/rtl-language/dist/server.cjs',
  'extensions/rtl-language/dist/analyze.py'].map(file => path.isAbsolute(file) ? file : path.join(source, file));
const stamp = (file, boundary = source) => {
  const resolved = fs.realpathSync(file);
  if (!inside(fs.realpathSync(boundary), resolved)) throw Error('Prepared app asset escaped its owned directory.');
  const stat = fs.statSync(resolved);
  if (!stat.isFile()) throw Error('Expected a prepared app file.');
  return { file: resolved, size: stat.size, mtimeMs: stat.mtimeMs };
};
if (mode === 'prepare-bundled') {
  const candidate = fs.realpathSync(process.argv[3]);
  if (!inside(path.join(root, '.dev'), candidate) || path.dirname(candidate) !== fs.realpathSync(path.join(root, '.dev'))) throw Error('Expected a dedicated local candidate inside ide/.dev.');
  const receipt = JSON.parse(fs.readFileSync(path.join(candidate, '.pulse-build.json'), 'utf8'));
  if (!receipt.passed || receipt.output !== candidate || receipt.kind !== 'local-bundled') throw Error('Candidate has no completed build receipt.');
  const executable = path.join(candidate, 'Pulse.exe'), assets = assetFiles(executable, true).map(file => stamp(file, candidate));
  fs.writeFileSync(manifest, JSON.stringify({ version: 3, kind: 'bundled', executable, assets }, null, 2));
} else if (mode === 'prepare') {
  const executable = await prepareDevelopmentExecutable(source);
  const assets = assetFiles(executable).map(file => stamp(file));
  fs.mkdirSync(path.dirname(manifest), { recursive: true });
  fs.writeFileSync(manifest, JSON.stringify({ version: 2, executable, assets }, null, 2));
} else {
  const saved = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  const bundled = saved.version === 3 && saved.kind === 'bundled';
  const boundary = bundled ? path.dirname(saved.executable) : source;
  if (bundled && (!inside(path.join(root, '.dev'), fs.realpathSync(boundary)) || path.dirname(fs.realpathSync(boundary)) !== fs.realpathSync(path.join(root, '.dev')))) throw Error('Candidate escaped local build directory.');
  if ((!bundled && saved.version !== 2) || !Array.isArray(saved.assets) || saved.assets.length !== assetFiles(saved.executable, bundled).length ||
    new Set(saved.assets.map(item => item.file)).size !== saved.assets.length || assetFiles(saved.executable, bundled).some(file => !saved.assets.some(item => item.file === fs.realpathSync(file)))) throw Error('Prepared launch metadata is invalid. Prepare again after building.');
  for (const expected of saved.assets) {
    const actual = stamp(expected.file, boundary);
    if (actual.size !== expected.size || actual.mtimeMs !== expected.mtimeMs) throw Error('Prepared build changed. Run latest-launch.mjs prepare after building.');
  }
  if (mode === 'open') {
    const plan = launchPlan(root, saved);
    const child = spawn(plan.executable, plan.args, { cwd: plan.cwd, env: plan.env, detached: true, stdio: 'ignore', windowsHide: true });
    child.on('error', error => { console.error(error.message); process.exitCode = 1; });
    child.unref();
  }
}
console.log(`Prepared launch ${mode}: ${(performance.now() - began).toFixed(1)} ms (app UI readiness is separate).`);
