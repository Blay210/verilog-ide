import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { root, inspect, validateSource } from './environment.mjs';
import { applyPatches } from './patches.mjs';
import { prepareDevelopmentExecutable } from './launcher.mjs';
import { readAcceptanceDiagnostics } from './acceptance-log.mjs';
import { prepareRuntime } from './prepare-runtime.mjs';
import { prepareLanguage } from './prepare-language.mjs';

// Private native integration host: no extension installation, no user workspace.
const source = path.join(root, 'upstream');
const transport = process.argv[2] ?? 'native';
if (!['native','batch','terminal','simulation','waveform','language','import'].includes(transport)) throw Error('Unknown acceptance transport.');
if (!inspect().ready) throw Error('Development environment is not ready.');
validateSource(source);
applyPatches(source);
await prepareLanguage(source);
await prepareRuntime(source);
const executable = await prepareDevelopmentExecutable(source);
const fixture = fs.mkdtempSync(path.join(root, '.dev/editor-acceptance-'));
const workspace = path.join(fixture, ['simulation','waveform'].includes(transport) ? 'simulation-project' : '설계 프로젝트');
const extension = path.join(fixture, 'test-extension');
fs.mkdirSync(workspace);
fs.mkdirSync(extension);
fs.writeFileSync(path.join(workspace, '편집 검증.sv'), 'module editor_probe;\nendmodule\n');
if (transport === 'import') {
  fs.mkdirSync(path.join(workspace, '검증 폴더'));
  fs.writeFileSync(path.join(workspace, '검증 폴더/two.sv'), 'module first; initial $finish; endmodule\nmodule second; initial $finish; endmodule\n');
}
if (['simulation','waveform'].includes(transport)) {
  const { createRequire } = await import('node:module');
  const { createProject } = createRequire(import.meta.url)('../dist/runtime/core/index.js');
  await createProject(workspace, true);
  if (transport === 'waveform') {
    const { SimulationService } = createRequire(import.meta.url)('../dist/runtime/simulation.js');
    const service = new SimulationService(async () => ({ id: 'verilator', capabilities: { waveforms: ['vcd'], timing: true, inputSnapshot: true }, check: async () => {}, build: async ({ directory }) => ({ executable: 'fixture', cwd: directory }), run: async artifact => {
      fs.writeFileSync(path.join(artifact.cwd, 'wave.vcd'), '$timescale 1ns $end\n$scope module tb $end\n$var wire 1 ! clk $end\n$var wire 8 # count $end\n$upscope $end\n$enddefinitions $end\n#0\n0!\nb00000000 #\n#5\n1!\nb00000001 #\n#10\n0!\n');
    } }));
    await service.run({ root: workspace, names: ['counter_basic'] });
    await service.run({ root: workspace, names: ['counter_basic'] });
    const { WaveViewStore } = createRequire(import.meta.url)('../dist/runtime/waveform-views.js');
    const store = new WaveViewStore(workspace, 'counter_basic', 'counter_basic_tb');
    const saved = await store.edit({ action: 'save', revision: 'empty', view: { id: 'count-view', name: '카운터 비트', radix: 'hex', signals: [{ path: 'tb.count', expanded: true, color: 'amber' }] } });
    await store.edit({ action: 'default', revision: saved.revision, id: 'count-view' });
  }
}
fs.writeFileSync(path.join(extension, 'package.json'), JSON.stringify({
  name: 'rtl-ide-native-acceptance', publisher: 'rtl-internal', version: '0.0.0',
  engines: { vscode: '^1.141.0' }, main: 'extension.cjs', activationEvents: [],
  capabilities: { untrustedWorkspaces: { supported: true } },
}));
fs.writeFileSync(path.join(extension, 'extension.cjs'), 'exports.activate = () => {};\n');
// Keep the native test entry inside its extension so VS Code attributes its API
// calls to the fixture, instead of falling back to the default extension API.
const testEntry = path.join(extension, 'editor.cjs');
fs.copyFileSync(path.join(root, transport === 'import' ? 'tests/native/import.cjs' : transport === 'language' ? 'tests/native/language.cjs' : transport === 'waveform' ? 'tests/native/waveform.cjs' : transport === 'simulation' ? 'tests/native/simulation.cjs' : transport === 'terminal' ? 'tests/native/terminal.cjs' : 'tests/native/editor.cjs'), testEntry);
const env = { ...process.env, VSCODE_DEV: '1', NODE_ENV: 'development', RTL_IDE_EDITOR_FIXTURE: fixture };
for (const key of ['ELECTRON_RUN_AS_NODE', 'NODE_PATH', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'VSCODE_SKIP_PRELAUNCH', 'RTL_IDE_DEV_EXECUTABLE']) delete env[key];
env.GIT_CEILING_DIRECTORIES = root;
const log = fs.openSync(path.join(fixture, 'host.log'), 'w');
const argumentsForHost = [
  ...(transport === 'terminal' ? [] : [workspace]), '--new-window', '--skip-welcome', '--skip-release-notes',
  '--user-data-dir', path.join(fixture, 'profile'), '--shared-data-dir', path.join(fixture, 'shared'),
  '--extensions-dir', path.join(fixture, 'extensions'),
  `--extensionDevelopmentPath=${extension}`,
  `--extensionTestsPath=${testEntry}`,
];
if (transport === 'batch') env.RTL_IDE_DEV_EXECUTABLE = executable;
fs.writeFileSync(path.join(fixture,'launch.json'),JSON.stringify({transport,executable,arguments:argumentsForHost},null,2));
const child = spawn(transport === 'batch' ? process.env.ComSpec ?? 'cmd.exe' : executable,
  transport === 'batch' ? ['/d','/c','scripts\\code.bat',...argumentsForHost] : [source,...argumentsForHost],
  { cwd: source, env, stdio: ['ignore', log, log], windowsHide: true });
console.log(`Private editor acceptance: ${fixture}`);
const timer = setTimeout(() => {
  console.error('Private acceptance host timed out; cancelling its process tree.');
  spawn('taskkill.exe', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' });
}, 120000);
child.on('error', error => { clearTimeout(timer); fs.closeSync(log); console.error(error); process.exitCode = 1; });
child.on('exit', code => {
  clearTimeout(timer);
  fs.closeSync(log);
  const receiptFile = path.join(fixture, 'receipt.json');
  const receipt = fs.existsSync(receiptFile) ? JSON.parse(fs.readFileSync(receiptFile, 'utf8')) : null;
  const { languageDetectionError, attributionWarning } = readAcceptanceDiagnostics(fixture);
  fs.writeFileSync(path.join(fixture, 'exit.json'), JSON.stringify({ code, languageDetectionError, attributionWarning, passed: code === 0 && receipt?.passed === true && !languageDetectionError && !attributionWarning }, null, 2));
  if (code !== 0 || receipt?.passed !== true || languageDetectionError || attributionWarning) { console.error('FAIL native editor acceptance; inspect private logs.'); process.exitCode = 1; }
  else console.log(transport === 'import' ? 'PASS native read-only import review, classification IPC and space preservation acceptance.' : transport === 'language' ? 'PASS native built-in RTL language, templates, cursor fields and completion acceptance.' : transport === 'waveform' ? 'PASS native sandbox waveform/IPC/canvas and space preservation acceptance (fixture trace).' : transport === 'simulation' ? `PASS native Simulation list/IPC/input/trust acceptance; trusted execution=${receipt.executionAccepted}.` : transport === 'terminal' ? 'PASS native empty-window terminal lifecycle acceptance.' : 'PASS native editor open/edit/save/reopen and folder acceptance.');
});
