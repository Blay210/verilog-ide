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
const packaged = process.argv[4] === '--packaged';
if (process.argv[4] && !packaged) throw Error('Unknown launch option.');
if (packaged && !['verify-integrated', 'open'].includes(mode)) throw Error('Packaged acceptance uses the integrated session or normal open only. Obtain user confirmation before launch.');
const verifying = ['verify', 'verify-registered', 'verify-management', 'verify-source-sync', 'verify-explorer', 'verify-folders', 'verify-saved-folders', 'verify-restored-folders', 'verify-folder-guards', 'verify-auto-waveform', 'verify-editor-inputs', 'verify-editor-comparison', 'verify-editor-comparison-restore', 'verify-recorded-source', 'verify-run-comparison', 'verify-integrated'].includes(mode);
if (!['prepare', 'open', 'verify', 'verify-registered', 'verify-management', 'verify-source-sync', 'verify-explorer', 'verify-folders', 'verify-saved-folders', 'verify-restored-folders', 'verify-folder-guards', 'verify-auto-waveform', 'verify-editor-inputs', 'verify-editor-comparison', 'verify-editor-comparison-restore', 'verify-recorded-source', 'verify-run-comparison', 'verify-integrated'].includes(mode)) throw Error('Use prepare, open, verify, verify-registered, verify-management, verify-source-sync verify-explorer verify-folders, verify-saved-folders verify-restored-folders or verify-folder-guards <prepared fixture>.');
const source = path.join(root, 'upstream');
let executable;
let launchDirectory = source;
if (packaged) {
  const output = path.join(root, 'VSCode-win32-x64');
  const inventory = JSON.parse(fs.readFileSync(path.join(root, '.dev/windows-integrated/beta-inventory.json'), 'utf8'));
  const build = JSON.parse(fs.readFileSync(path.join(root, '.dev/windows-integrated/beta-receipt.json'), 'utf8'));
  if (!inventory.passed || !build.passed || build.output !== output || !inside(root, fs.realpathSync(output))) throw Error('Completed owned package and inventory required.');
  const product = JSON.parse(fs.readFileSync(path.join(output, 'resources/app/product.json'), 'utf8'));
  const expected = JSON.parse(fs.readFileSync(path.join(root, 'config/product.json'), 'utf8')).values;
  if (product.nameShort !== expected.nameShort) throw Error('Package predates current branding; rebuild before opening a verification window.');
  executable = path.join(output, `${product.nameShort}.exe`);
  launchDirectory = output;
} else {
  if (!inspect().ready) throw Error('Development environment is not ready.');
  validateSource(source);
  applyPatches(source); await prepareLanguage(source); await prepareRuntime(source);
  executable = await prepareDevelopmentExecutable(source);
}
let fixture;
if (mode === 'prepare') {
  if (process.argv[3]) throw Error('Prepare creates a fresh isolated fixture.');
  fixture = fs.mkdtempSync(path.join(root, '.dev/import-ui-'));
  const project = path.join(fixture, '가져오기 실행 프로젝트'); fs.mkdirSync(project);
  fs.mkdirSync(path.join(project, 'rtl')); fs.mkdirSync(path.join(project, 'verification'));
  fs.writeFileSync(path.join(project, 'rtl/연산 [0].sv'), '`timescale 1ns/1ps\nmodule dut(output logic y); assign y=1; endmodule\n');
  fs.writeFileSync(path.join(project, 'verification/tb.sv'), '`timescale 1ns/1ps\n' + ['first', 'second'].map(top => `module ${top}; wire y; dut u(y); initial begin $dumpfile("wave.vcd"); $dumpvars(0,${top}); #1; assert(y===1) else $fatal(1,"bad output"); $finish; end endmodule\n`).join(''));
  fs.writeFileSync(path.join(fixture, 'fixture.json'), JSON.stringify({ kind: 'rtl-import-ui', version: 1 }));
} else {
  if (!process.argv[3]) throw Error('Open/verify needs the prepared fixture path.');
  fixture = fs.realpathSync(path.resolve(process.argv[3]));
  if (!inside(path.join(root, '.dev'), fixture) || !path.basename(fixture).startsWith('import-ui-') ||
      JSON.parse(fs.readFileSync(path.join(fixture, 'fixture.json'), 'utf8')).kind !== 'rtl-import-ui') throw Error('Not an owned semantic fixture.');
}
const workspace = path.join(fixture, '가져오기 실행 프로젝트');
const args = [...(packaged ? [] : [source]), workspace, '--new-window', '--skip-welcome', '--skip-release-notes',
  '--user-data-dir', path.join(fixture, 'profile'), '--shared-data-dir', path.join(fixture, 'shared'), '--extensions-dir', path.join(fixture, 'extensions')];
if (verifying) {
  const acceptance = mode === 'verify-integrated' ? 'integrated.cjs' : mode === 'verify-run-comparison' ? 'run-comparison.cjs' : mode === 'verify-recorded-source' ? 'recorded-source.cjs' : ['verify-editor-comparison', 'verify-editor-comparison-restore', 'verify-recorded-source', 'verify-run-comparison', 'verify-integrated'].includes(mode) ? 'editor-comparison.cjs' : mode === 'verify-editor-inputs' ? 'editor-inputs.cjs' : mode === 'verify-auto-waveform' ? 'auto-waveform.cjs' : mode === 'verify-folder-guards' ? 'folder-guards.cjs' : ['verify-saved-folders', 'verify-restored-folders', 'verify-folder-guards', 'verify-auto-waveform', 'verify-editor-inputs', 'verify-editor-comparison', 'verify-editor-comparison-restore', 'verify-recorded-source', 'verify-run-comparison', 'verify-integrated'].includes(mode) ? 'saved-folders.cjs' : mode === 'verify-folders' ? 'folder-roles.cjs' : mode === 'verify-explorer' ? 'explorer.cjs' : mode === 'verify-source-sync' ? 'source-sync.cjs' : mode === 'verify-management' ? 'management.cjs' : 'import-trusted.cjs';
  const extension = path.join(fixture, 'test-extension'); fs.mkdirSync(extension, { recursive: true });
  fs.writeFileSync(path.join(extension, 'package.json'), JSON.stringify({ name: 'rtl-import-ui-acceptance', publisher: 'rtl-internal', version: '0.0.0', engines: { vscode: '^1.141.0' }, main: 'extension.cjs', activationEvents: ['onStartupFinished'], capabilities: { untrustedWorkspaces: { supported: true } } }));
  // extensionTestsPath intentionally forces in-memory storage upstream, so it
  // cannot observe a human's persisted trust decision. Use ordinary dev-host
  // activation in this dedicated fixture only, without a trust override.
  fs.writeFileSync(path.join(extension, 'extension.cjs'), `exports.activate=()=>{setTimeout(async()=>{try{await require('./${acceptance}').run();}catch(error){console.error(error);}finally{if(process.env.RTL_IDE_INTEGRATED_HOLD!=='1')await require('vscode').commands.executeCommand('workbench.action.quit');}},500);};`);
  fs.copyFileSync(path.join(root, 'tests/native', acceptance), path.join(extension, acceptance));
  args.push(`--extensionDevelopmentPath=${extension}`);
}
if(mode==='verify-integrated')for(const name of ['run-comparison','recorded-source','auto-waveform'])fs.copyFileSync(path.join(root,'tests/native',name+'.cjs'),path.join(fixture,'test-extension',name+'.cjs'));
const env = { ...process.env, RTL_IDE_INTEGRATED_HOLD: mode==='verify-integrated'?'1':'', RTL_IDE_EDITOR_COMPARISON_RESTORE: mode === 'verify-editor-comparison-restore' ? '1' : '', RTL_IDE_FOLDER_RESTORE: mode === 'verify-restored-folders' ? '1' : '', VSCODE_DEV: '1', NODE_ENV: 'development', RTL_IDE_EDITOR_FIXTURE: fixture, GIT_CEILING_DIRECTORIES: root, RTL_IDE_IMPORT_RESUME: mode === 'verify-registered' ? '1' : '' };
for (const key of ['ELECTRON_RUN_AS_NODE', 'NODE_PATH', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE']) delete env[key];
if (packaged) { delete env.VSCODE_DEV; delete env.NODE_OPTIONS; env.NODE_ENV = 'production'; }
if (verifying) fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify({ passed: false, status: 'running' }));
const log = fs.openSync(path.join(fixture, verifying ? 'host.log' : 'prepare-host.log'), 'w');
fs.writeFileSync(path.join(fixture, mode + '-launch.json'), JSON.stringify({ executable, args, packaged }, null, 2));
const child = spawn(executable, args, { cwd: launchDirectory, env, stdio: ['ignore', log, log], windowsHide: !packaged, detached: !verifying });
console.log(`Isolated import UI ${mode}: ${fixture}`);
if (!verifying) { child.unref(); fs.closeSync(log); }
else {
  const timer = setTimeout(() => { spawn('taskkill.exe', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' }); }, mode==='verify-integrated'?1800000:360000);
  child.on('exit', code => {
    clearTimeout(timer); fs.closeSync(log);
    const receiptPath = path.join(fixture, 'receipt.json');
    const receipt = fs.existsSync(receiptPath) ? JSON.parse(fs.readFileSync(receiptPath, 'utf8')) : undefined;
    const diagnostics = readAcceptanceDiagnostics(fixture);
    const passed = code === 0 && receipt?.passed === true && !diagnostics.languageDetectionError && !diagnostics.attributionWarning;
    fs.writeFileSync(path.join(fixture, 'exit.json'), JSON.stringify({ code, passed, ...diagnostics }, null, 2));
    console.log(passed ? 'PASS native trusted import/run/waveform acceptance.' : `NOT PASSED: ${receipt?.error ?? 'Host exited before acceptance finished; inspect host.log.'}`);
    process.exitCode = passed ? 0 : 1;
  });
}
child.on('error', error => { console.error(error); process.exitCode = 1; });
