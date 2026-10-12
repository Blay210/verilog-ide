import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
export const baseline = JSON.parse(fs.readFileSync(path.join(root, 'config/upstream.json'), 'utf8'));
export const buildTools = JSON.parse(fs.readFileSync(path.join(root, 'config/build-tools.json'), 'utf8'));
export function inside(directory, candidate) {
  const relative = path.relative(directory, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}
export function compatibleNode(actual, required) {
  const a = actual.replace(/^v/, '').split('.').map(Number);
  const b = required.split('.').map(Number);
  return a.length === 3 && a.every(Number.isInteger) && a[0] === b[0] && (a[1] > b[1] || a[1] === b[1] && a[2] >= b[2]);
}
export function validateSource(directory) {
  if (!inside(root, fs.realpathSync(directory))) throw Error('Upstream source must stay inside ide.');
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
  if (manifest.name !== 'code-oss-dev' || manifest.version !== baseline.tag) throw Error('Unexpected Code-OSS baseline.');
  if (fs.readFileSync(path.join(directory, '.nvmrc'), 'utf8').trim() !== baseline.node) throw Error('Unexpected Node baseline.');
  for (const name of ['package-lock.json', 'LICENSE.txt', 'scripts/code.bat', 'build/npm/preinstall.ts']) {
    if (!fs.existsSync(path.join(directory, name))) throw Error(`Source missing ${name}`);
  }
  const lockHash = createHash('sha256').update(fs.readFileSync(path.join(directory, 'package-lock.json'))).digest('hex');
  if (lockHash !== baseline.packageLockSha256) throw Error('Upstream dependency lock changed; review and record the baseline before building.');
  return manifest;
}
const run = (executable, args) => spawnSync(executable, args, { encoding: 'utf8', windowsHide: true, timeout: 15000 });
export function supportedMsvc(instances) {
  return instances.filter(i => /^(16|17)\./.test(i.installationVersion ?? '') && i.isComplete === true && i.isLaunchable === true);
}
export function validateGitBoundary(directory) {
  const env = { ...process.env, GIT_CEILING_DIRECTORIES: root };
  for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE']) delete env[key];
  const query = (...args) => {
    const result = spawnSync('git', ['-C', directory, 'rev-parse', ...args], { env, encoding: 'utf8', windowsHide: true, timeout: 15000 });
    if (result.status !== 0) throw Error('Pinned source requires its own local Git metadata; run bootstrap.');
    return result.stdout.trim();
  };
  if (path.resolve(query('--show-toplevel')) !== path.resolve(directory)) throw Error('Source Git root escaped upstream.');
  if (!inside(directory, query('--absolute-git-dir'))) throw Error('Source Git metadata escaped upstream.');
  if (query('HEAD') !== baseline.revision) throw Error('Unexpected source Git revision.');
}
export function inspect() {
  const checks = [{ name: 'Windows x64', ok: process.platform === 'win32' && process.arch === 'x64' },
    { name: `Node ${baseline.node}+ (same major)`, ok: compatibleNode(process.versions.node, baseline.node), detail: process.versions.node }];
  try { validateSource(path.join(root, 'upstream')); checks.push({ name: 'Pinned local Code-OSS source', ok: true }); }
  catch (error) { checks.push({ name: 'Pinned local Code-OSS source', ok: false, detail: error.message }); }
  try { validateGitBoundary(path.join(root, 'upstream')); checks.push({ name: 'Isolated pinned Git metadata', ok: true }); }
  catch (error) { checks.push({ name: 'Isolated pinned Git metadata', ok: false, detail: error.message }); }
  const localPython = path.resolve(root, buildTools.python.relativeExecutable);
  if (!inside(root, localPython)) throw Error('Managed Python path must stay inside ide.');
  const pythonCandidates = [...new Set([process.env.RTL_IDE_PYTHON, fs.existsSync(localPython) ? localPython : undefined, 'python', 'py'].filter(Boolean))];
  let python;
  for (const candidate of pythonCandidates) {
    const result = run(candidate, ['-c', 'import sys,json; print(json.dumps({"executable": sys.executable, "version": sys.version.split()[0]}))']);
    if (result.status === 0) {
      try {
        const info = JSON.parse(result.stdout);
        if (!path.isAbsolute(info.executable) || !fs.existsSync(info.executable)) continue;
        python = { executable: info.executable, detail: `${info.executable} (${info.version})` }; break;
      } catch {}
    }
  }
  checks.push({ name: 'Working Python for native modules', ok: !!python, detail: python?.detail ?? 'Set RTL_IDE_PYTHON to an installed interpreter; Windows Store alias is insufficient.' });
  const vswhere = path.join(process.env['ProgramFiles(x86)'] ?? '', 'Microsoft Visual Studio/Installer/vswhere.exe');
  let instances = [];
  if (fs.existsSync(vswhere)) {
    const result = run(vswhere, ['-products', '*', '-requires', 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64', '-format', 'json']);
    if (result.status === 0) { try { instances = JSON.parse(result.stdout); } catch {} }
  }
  // The pinned preinstall supports VS 2019/2022. Presence is only a preliminary check;
  // SDK, ATL and Spectre prerequisites are verified by the actual dependency build.
  const supported = supportedMsvc(instances);
  checks.push({ name: 'MSVC VS2019/2022 C++ toolchain', ok: supported.length > 0, detail: supported.map(i => i.installationPath).join(', ') || 'No supported C++ instance found via vswhere.' });
  return { checks, python: python?.executable, ready: checks.every(c => c.ok) };
}
