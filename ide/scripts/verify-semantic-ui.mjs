import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { root, inside, inspect, validateSource } from './environment.mjs';
import { applyPatches } from './patches.mjs';
import { prepareDevelopmentExecutable } from './launcher.mjs';
import { prepareLanguage } from './prepare-language.mjs';
import { prepareRuntime } from './prepare-runtime.mjs';
import { readAcceptanceDiagnostics } from './acceptance-log.mjs';

// A dedicated profile: never copy trust or inject tests into an existing user
// session. Prepare first; the human grants trust before verify is requested.
const mode = process.argv[2] ?? 'prepare';
if (!['prepare', 'open', 'verify'].includes(mode)) throw Error('Use prepare, open <prepared fixture>, or verify <prepared fixture>.');
if (!inspect().ready) throw Error('Development environment is not ready.');
const source = path.join(root, 'upstream'); validateSource(source);
applyPatches(source); await prepareLanguage(source); await prepareRuntime(source);
const executable = await prepareDevelopmentExecutable(source);
let fixture;
if (mode === 'prepare') {
  if (process.argv[3]) throw Error('Prepare creates a fresh isolated fixture.');
  fixture = fs.mkdtempSync(path.join(root, '.dev/semantic-ui-'));
  const project = path.join(fixture, '의미 분석 프로젝트'); fs.mkdirSync(project);
  fs.writeFileSync(path.join(project, 'rtl.toml'), 'version=1\n[project]\nname="semantic-ui"\n[sources]\nrtl=["*.sv"]\n');
  fs.writeFileSync(path.join(project, '코드 공백.sv'), 'module alu(input logic a, input logic b, output logic y); assign y=a&b; endmodule\nmodule top; logic local_signal; function int add(input int foo, input string boo); return foo; endfunction\nalu u(.a(local_signal), .b(local_signal), .y()); endmodule\n');
  fs.writeFileSync(path.join(fixture, 'fixture.json'), JSON.stringify({ kind: 'rtl-semantic-ui', version: 1 }));
} else {
  if (!process.argv[3]) throw Error('Open/verify needs the prepared fixture path.');
  fixture = fs.realpathSync(path.resolve(process.argv[3]));
  if (!inside(path.join(root, '.dev'), fixture) || !path.basename(fixture).startsWith('semantic-ui-') ||
      JSON.parse(fs.readFileSync(path.join(fixture, 'fixture.json'), 'utf8')).kind !== 'rtl-semantic-ui') throw Error('Not an owned semantic fixture.');
}
const workspace = path.join(fixture, '의미 분석 프로젝트');
const args = [source, workspace, '--new-window', '--skip-welcome', '--skip-release-notes',
  '--user-data-dir', path.join(fixture, 'profile'), '--shared-data-dir', path.join(fixture, 'shared'), '--extensions-dir', path.join(fixture, 'extensions')];
if (mode === 'verify') {
  const extension = path.join(fixture, 'test-extension'); fs.mkdirSync(extension, { recursive: true });
  fs.writeFileSync(path.join(extension, 'package.json'), JSON.stringify({ name: 'rtl-semantic-ui-acceptance', publisher: 'rtl-internal', version: '0.0.0', engines: { vscode: '^1.141.0' }, main: 'extension.cjs', activationEvents: ['onStartupFinished'], capabilities: { untrustedWorkspaces: { supported: true } } }));
  // extensionTestsPath intentionally forces in-memory storage upstream, so it
  // cannot observe a human's persisted trust decision. Use ordinary dev-host
  // activation in this dedicated fixture only, without a trust override.
  fs.writeFileSync(path.join(extension, 'extension.cjs'), "exports.activate=()=>{setTimeout(async()=>{try{await require('./semantic.cjs').run();}catch(error){console.error(error);}finally{await require('vscode').commands.executeCommand('workbench.action.quit');}},500);};");
  fs.copyFileSync(path.join(root, 'tests/native/semantic.cjs'), path.join(extension, 'semantic.cjs'));
  args.push(`--extensionDevelopmentPath=${extension}`);
}
const env = { ...process.env, VSCODE_DEV: '1', NODE_ENV: 'development', RTL_IDE_EDITOR_FIXTURE: fixture, GIT_CEILING_DIRECTORIES: root };
for (const key of ['ELECTRON_RUN_AS_NODE', 'NODE_PATH', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE']) delete env[key];
if (mode === 'verify') fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify({ passed: false, status: 'running' }));
const log = fs.openSync(path.join(fixture, mode === 'verify' ? 'host.log' : 'prepare-host.log'), 'w');
fs.writeFileSync(path.join(fixture, mode + '-launch.json'), JSON.stringify({ executable, args }, null, 2));
const child = spawn(executable, args, { cwd: source, env, stdio: ['ignore', log, log], windowsHide: true, detached: mode !== 'verify' });
console.log(`Isolated semantic UI ${mode}: ${fixture}`);
if (mode !== 'verify') { child.unref(); fs.closeSync(log); }
else {
  const timer = setTimeout(() => { spawn('taskkill.exe', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' }); }, 120000);
  child.on('exit', code => {
    clearTimeout(timer); fs.closeSync(log);
    const receiptPath = path.join(fixture, 'receipt.json');
    const receipt = fs.existsSync(receiptPath) ? JSON.parse(fs.readFileSync(receiptPath, 'utf8')) : undefined;
    const diagnostics = readAcceptanceDiagnostics(fixture);
    const passed = code === 0 && receipt?.passed === true && !diagnostics.languageDetectionError && !diagnostics.attributionWarning;
    fs.writeFileSync(path.join(fixture, 'exit.json'), JSON.stringify({ code, passed, ...diagnostics }, null, 2));
    console.log(passed ? 'PASS native trusted semantic acceptance.' : `NOT PASSED: ${receipt?.error ?? 'Host exited before acceptance finished; inspect host.log.'}`);
    process.exitCode = passed ? 0 : 1;
  });
}
child.on('error', error => { console.error(error); process.exitCode = 1; });
