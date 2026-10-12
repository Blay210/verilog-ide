import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { root, inspect, validateSource } from './environment.mjs';
import { applyPatches } from './patches.mjs';
import { prepareDevelopmentExecutable } from './launcher.mjs';
import { prepareRuntime } from './prepare-runtime.mjs';
import { prepareLanguage } from './prepare-language.mjs';

const command = process.argv[2] ?? 'doctor';
const projectArgument = process.argv[3];
if (process.argv.length > 4 || (projectArgument && command !== 'start')) throw Error('Only start accepts an optional project folder.');
const projectFolder = projectArgument ? fs.realpathSync(path.resolve(projectArgument)) : undefined;
if (projectFolder && !fs.statSync(projectFolder).isDirectory()) throw Error('Project must be a folder.');
if (!['doctor', 'install', 'compile', 'compile-core', 'start'].includes(command)) throw Error('Use doctor, install, compile, compile-core or start.');
const source = path.join(root, 'upstream');
const sessionName = process.env.RTL_IDE_DEV_SESSION;
if (sessionName && !/^[a-z0-9-]{1,40}$/.test(sessionName)) throw Error('Development session must be a short lowercase identifier.');
const data = path.join(root, '.dev/rtl-ide', sessionName ?? '');
const report = inspect();
fs.mkdirSync(path.join(root, '.dev'), { recursive: true });
fs.writeFileSync(path.join(root, '.dev/environment.json'), JSON.stringify(report, null, 2));
for (const check of report.checks) console.log(`${check.ok ? 'OK' : 'MISSING'} ${check.name}${check.detail ? `: ${check.detail}` : ''}`);
if (!report.ready) {
  console.error('Environment incomplete. No dependencies installed or application launched.');
  process.exitCode = 1;
} else if (command !== 'doctor') {
  validateSource(source);
  applyPatches(source);
  await prepareLanguage(source);
  await prepareRuntime(source);
  const developmentExecutable = command === 'start' ? await prepareDevelopmentExecutable(source) : undefined;
  const npmCli = path.join(path.dirname(fs.realpathSync(process.execPath)), 'node_modules/npm/bin/npm-cli.js');
  if (command !== 'start' && !fs.existsSync(npmCli)) throw Error('npm CLI is unavailable alongside Node.');
  const env = { ...process.env, npm_config_cache: path.join(root, '.dev/npm-cache'), npm_config_devdir: path.join(root, '.dev/node-gyp') };
  // Upstream postinstall invokes git config. Never discover the outer repository.
  for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'NODE_PATH']) delete env[key];
  env.GIT_CEILING_DIRECTORIES = root;
  if (report.python) { env.npm_config_python = report.python; env.NODE_GYP_FORCE_PYTHON = report.python; }
  if (command === 'start') {
    delete env.ELECTRON_RUN_AS_NODE;
    env.RTL_IDE_DEV_EXECUTABLE = developmentExecutable;
    if (projectFolder) { env.VSCODE_DEV = '1'; env.NODE_ENV = 'development'; }
  } else delete env.RTL_IDE_DEV_EXECUTABLE;
  const executable = command === 'start' ? projectFolder ? developmentExecutable : process.env.ComSpec ?? 'cmd.exe' : process.execPath;
  // Fixed local batch path, no interpolated user shell arguments.
  const args = command === 'start' ? [...(projectFolder ? [source, projectFolder] : ['/d', '/c', 'scripts\\code.bat']), '--user-data-dir', path.join(data, 'profile'), '--shared-data-dir', path.join(data, 'shared'), '--extensions-dir', path.join(data, 'extensions'), '--skip-welcome']
    : [npmCli, ...(command === 'install' ? ['ci'] : command === 'compile-core' ? ['run', 'gulp', '--', 'compile-client'] : ['run', 'compile-client'])];
  const child = spawn(executable, args, { cwd: source, env, stdio: 'inherit', windowsHide: true });
  child.on('error', error => { console.error(error.message); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code ?? 1; });
}
