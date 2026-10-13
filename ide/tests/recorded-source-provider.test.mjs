import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import Module, { createRequire } from 'node:module';
import path from 'node:path';
import { build, transformSync } from 'esbuild';
import { root } from '../scripts/environment.mjs';

const require = createRequire(import.meta.url);
// Real pinned URI/Event/Disposable, fake service responses/DOM only. No window.
const platformBundle = await build({ stdin: { contents: `export {Disposable} from './lifecycle.js';export {Emitter,Event} from './event.js';export {URI} from './uri.js';export {extUriBiasedIgnorePathCase} from './resources.js';export {isWindows} from './platform.js';`, resolveDir: path.join(root, 'upstream/src/vs/base/common') },
  bundle: true, write: false, platform: 'node', format: 'cjs', target: 'node22' });
const platformModule = new Module(path.join(root, '.dev/provider-platform.cjs')); platformModule.require = require;
platformModule._compile(platformBundle.outputFiles[0].text, path.join(root, '.dev/provider-platform.cjs'));
const platform = platformModule.exports, { Emitter, Event, URI } = platform;
const { RecordedSourceCache } = require('../dist/runtime/recorded-source-cache.js');
const source = await fs.readFile(new URL('../src/rtlSimulationHome.ts', import.meta.url), 'utf8');
const code = transformSync(source, { loader: 'ts', format: 'cjs', target: 'node22' }).code;
function gate() { let release; return { promise: new Promise(resolve => { release = resolve; }), release }; }

class Element {
  dataset = {}; children = []; classList = { add() {}, remove() {}, toggle() {} }; listeners = new Map();
  append(...elements) { this.children.push(...elements); for (const element of elements) element.parent = this; }
  replaceChildren(...elements) { this.children = []; this.append(...elements); }
  contains(element) { return this === element || this.children.some(child => child?.contains?.(element)); }
  insertBefore(element, reference) { if(element.parent) element.parent.children=element.parent.children.filter(child=>child!==element);const index=reference ? this.children.indexOf(reference):this.children.length;this.children.splice(index,0,element);element.parent=this;return element; }
  get options() { return this.children; }
  setAttribute() {} addEventListener(name, handler) { this.listeners.set(name, handler); }
  removeEventListener(name) { this.listeners.delete(name); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); }
}
function fixture(render = false) {
  const state = new Emitter(), removed = new Emitter(), opened = [], calls = [], providers = new Map(), events = [];
  let read = async () => ({ text: 'module tb; endmodule', file: 'tb/tb.sv' }), trusted = true;
  const recovery = { choice: 'candidate', confirmed: true, pick: undefined, confirm: undefined, text: async args => `# ${args.choice}\n` };
  const workingCopies = { onDidChangeDirty: Event.None, onDidChangeContent: Event.None, dirtyWorkingCopies: [] };
  const channel = { listen: () => state.event, call: async (name, args) => {
    calls.push({ name, args });
    if (name === 'source-read') return read(args);
    if (name === 'source-list') return [{ file: 'tb/tb.sv', unsaved: true }];
    if (name === 'import-recovery-text') { events.push('read'); return recovery.text(args); }
    if (name === 'import-recover') { events.push('write'); return { ...home.state, revision: home.state.revision + 1, importRecovery: [] }; }
    if (name === 'import-archive') { events.push('archive'); return { ...home.state, revision: home.state.revision + 1, importJournal: { count: 32, limit: 128 } }; }
    if (name === 'manage') { events.push('manage'); return home.state; }
    throw Error(`Unexpected fixture channel call: ${name}`);
  } };
  const window = { document: { createElement: () => new Element() }, addEventListener() {}, removeEventListener() {},
    clearTimeout() {}, setTimeout: () => 0, requestAnimationFrame: callback => { callback(); return 0; } };
  const loaded = new Module(path.join(root, '.dev/provider-home.cjs'));
  loaded.require = name => name.endsWith('/window.js') ? { mainWindow: window }
    : name.endsWith('/lifecycle.js') ? { Disposable: platform.Disposable }
      : name.endsWith('/event.js') ? { Emitter, Event }
        : name.endsWith('/platform.js') ? { isWindows: platform.isWindows }
          : name.endsWith('/uri.js') ? { URI }
            : name.endsWith('/resources.js') ? { extUriBiasedIgnorePathCase: platform.extUriBiasedIgnorePathCase }
              : name.endsWith('/recordedSourceCache.js') ? { RecordedSourceCache }
                : name.endsWith('/waveform/views.js') ? require('../dist/runtime/waveform/views.js')
                  : name.endsWith('/testFiles.js') ? require('../dist/runtime/test-files.js')
                    : name.endsWith('/folderRoles.js') ? require('../dist/runtime/folder-roles.js')
                      : name.endsWith('/files.js') ? { FileType: { File: 1 }, FilePermission: { Readonly: 1 }, FileSystemProviderCapabilities: { FileReadWrite: 2, Readonly: 4, PathCaseSensitive: 8 } }
                        : name.endsWith('/network.js') ? { FileAccess: { asBrowserUri: () => URI.file('/fixture/waveform.html') } }
                          : require(name);
  loaded._compile(code, path.join(root, '.dev/provider-home.cjs'));
  // Rendering is outside this headless provider check. Constructor/lifecycle/provider code is real.
  if (!render) loaded.exports.RtlSimulationHome.prototype.paint = () => {};
  const files = { registerProvider: (scheme, value) => { providers.set(scheme, value); return { dispose: () => { providers.delete(scheme); } }; }, onDidFilesChange: Event.None, exists: async () => true };
  const dialogs = { confirm: async args => { events.push('confirm'); return recovery.confirm ? recovery.confirm(args) : { confirmed: recovery.confirmed }; } };
  const quickInput = { pick: async choices => { events.push('pick'); return recovery.pick ? recovery.pick(choices) : choices.find(value => value.choice === recovery.choice); } };
  const home = new loaded.exports.RtlSimulationHome(new Element(), { getChannel: () => channel }, { onDidChangeWorkspaceFolders: Event.None },
    { onDidChangeTrust: Event.None, isWorkspaceTrusted: () => trusted }, {}, { openEditor: async editor => { events.push('open'); opened.push(editor); } },
    { onBeforeShutdown: Event.None, onWillShutdown: Event.None }, dialogs, quickInput, files,
    workingCopies, {}, { files: { onDidRemove: removed.event, models: [] } });
  home.accept({ revision: 1, root: '/project/a', phase: 'idle', tests: [], history: [], log: '' });
  const resource = (file = 'tb/tb.sv', project = '/project/a') => URI.from({ scheme: 'rtl-run-source', path: `/run/${file}`, query: JSON.stringify({ name: 'tb', runId: 'run', file, root: project }) });
  return { home, calls, opened, removed, state, resource, recovery, events, workingCopies, quickInput, trust: value => { trusted = value; }, get provider() { return providers.get('rtl-run-source'); }, get recoveryProvider() { return providers.get('rtl-import-recovery'); }, read: value => { read = value; } };
}

test('owned provider coalesces stat/read, returns copies, stays read-only and releases actual model-removal bytes', async t => {
  const f = fixture(); t.after(() => f.home.dispose());
  const uri = f.resource(), held = gate(); f.read(async () => { await held.promise; return { text: 'snapshot' }; });
  const stat = f.provider.stat(uri), read = f.provider.readFile(uri); held.release();
  assert.equal((await stat).size, 8); const bytes = await read; bytes[0] = 0;
  assert.equal(new TextDecoder().decode(await f.provider.readFile(uri)), 'snapshot');
  assert.equal(f.calls.filter(call => call.name === 'source-read').length, 1);
  await assert.rejects(f.provider.writeFile(uri, bytes), /읽기 전용/);
  assert.equal(f.home.recordedTexts.byteLength, 8); f.removed.fire(URI.file('/project/a/tb.sv')); assert.equal(f.home.recordedTexts.byteLength, 8);
  f.removed.fire(uri); assert.equal(f.home.recordedTexts.byteLength, 0);
  f.read(async () => { throw Error('Recorded source was modified.'); });
  await assert.rejects(f.provider.readFile(uri), /modified/); assert.equal(f.home.recordedTexts.size, 0);
});

const pendingRecovery = { id: 'a47db4df-6693-460b-9dcd-62d0cecc448c', revision: 'reviewed', current: true, previous: true, candidate: true };
function setRecovery(f, revision = 2, root = '/project/a') {
  f.state.fire({ revision, root, phase: 'error', historyOnly: true, tests: [], history: [], log: '', importRecovery: [pendingRecovery] });
}
test('settings recovery opens read-only diff before explicit confirmation and sends the reviewed choice only', async t => {
  const f = fixture(true); t.after(() => f.home.dispose()); setRecovery(f);
  assert.equal(f.home.manage.textContent, '설정 복구'); assert.equal(f.home.all.disabled, true); assert.equal(f.home.explorerEnabled, false);
  await f.home.manageProject();
  assert.deepEqual(f.events, ['pick', 'read', 'read', 'open', 'confirm', 'write']);
  const diff = f.opened[0]; assert.equal(diff.original.resource.scheme, 'rtl-import-recovery'); assert.equal(diff.modified.resource.scheme, 'rtl-import-recovery');
  assert.equal(JSON.parse(diff.modified.resource.query).choice, 'candidate');
  await assert.rejects(f.recoveryProvider.writeFile(diff.modified.resource, new Uint8Array()), /읽기 전용/);
  const call = f.calls.find(value => value.name === 'import-recover'); assert.deepEqual(call.args, { recovery: pendingRecovery, choice: 'candidate', approved: true });
  const text = await f.recoveryProvider.readFile(diff.modified.resource); text[0] = 0;
  assert.equal(new TextDecoder().decode(await f.recoveryProvider.readFile(diff.modified.resource)), '# candidate\n');
  f.removed.fire(diff.modified.resource); assert.ok(f.home.recordedTexts.byteLength > 0);
});

test('cancelled choices/dialogs and dirty/untrusted settings never write a recovery', async t => {
  for (const mode of ['pick-cancel', 'dialog-cancel', 'dirty', 'untrusted', 'loading']) {
    const f = fixture(); t.after(() => f.home.dispose()); setRecovery(f);
    if (mode === 'pick-cancel') f.recovery.pick = async () => undefined;
    if (mode === 'dialog-cancel') f.recovery.confirmed = false;
    if (mode === 'dirty') f.workingCopies.dirtyWorkingCopies = [{ resource: URI.file('/project/a/rtl.toml') }];
    if (mode === 'untrusted') f.trust(false);
    if (mode === 'loading') f.state.fire({ ...f.home.state, revision: 3, phase: 'loading' });
    if (['dirty', 'untrusted', 'loading'].includes(mode)) await assert.rejects(f.home.recoverSettings(), /신뢰|미저장/);
    else await f.home.recoverSettings();
    assert.equal(f.calls.filter(value => value.name === 'import-recover').length, 0);
    assert.equal(f.opened.length, mode === 'dialog-cancel' ? 1 : 0);
  }
});

test('recovery rejects project A/B/A, changed review, lost trust and dirty edits while awaiting confirmation', async t => {
  for (const mode of ['root', 'review', 'trust', 'dirty', 'close', 'running']) {
    const f = fixture(); t.after(() => f.home.dispose()); setRecovery(f);
    f.recovery.confirm = async () => {
      if (mode === 'root') { setRecovery(f, 3, '/project/b'); setRecovery(f, 4); }
      if (mode === 'review') f.state.fire({ ...f.home.state, revision: 3, importRecovery: [{ ...pendingRecovery, revision: 'new' }] });
      if (mode === 'trust') f.trust(false);
      if (mode === 'dirty') f.workingCopies.dirtyWorkingCopies = [{ resource: URI.file('/project/a/rtl.toml') }];
      if (mode === 'close') f.home.dispose();
      if (mode === 'running') f.state.fire({ ...f.home.state, revision: 3, phase: 'running' });
      return { confirmed: true };
    };
    await assert.rejects(f.home.recoverSettings(), /바뀌었/);
    assert.equal(f.calls.filter(value => value.name === 'import-recover').length, 0);
  }
});

test('pending recovery provider and navigation reject late project replies before opening any tab', async t => {
  const f = fixture(); t.after(() => f.home.dispose()); setRecovery(f);
  const entered = gate(), held = gate(); f.recovery.text = async () => { entered.release(); await held.promise; return 'stale'; };
  const opening = f.home.recoverSettings(), rejected = assert.rejects(opening, /바뀌었/);
  await entered.promise; setRecovery(f, 3, '/project/b'); setRecovery(f, 4); held.release(); await rejected;
  assert.equal(f.opened.length, 0); assert.equal(f.home.recordedTexts.size, 0);
});

test('project A/B/A invalidates pending provider replies and cached bytes; old-project URI cannot read new root', async t => {
  const f = fixture(); t.after(() => f.home.dispose());
  await f.provider.readFile(f.resource('first.sv')); assert.ok(f.home.recordedTexts.byteLength > 0);
  const held = gate(), entered = gate(); f.read(async () => { entered.release(); await held.promise; return { text: 'stale' }; });
  const pending = f.provider.readFile(f.resource('second.sv')), rejected = assert.rejects(pending, /바뀌었/);
  await entered.promise;
  f.state.fire({ revision: 2, root: '/project/b', phase: 'idle', tests: [], log: '' }); assert.equal(f.home.recordedTexts.byteLength, 0);
  await assert.rejects(f.provider.readFile(f.resource()), /프로젝트가 바뀌었/);
  f.state.fire({ revision: 3, root: '/project/a', phase: 'idle', tests: [], log: '' }); held.release(); await rejected;
  assert.equal(f.home.recordedTexts.size, 0);
});

test('source navigation does not open a tab after A/B/A or disposal while bytes are loading', async t => {
  const f = fixture(); t.after(() => f.home.dispose());
  for (const close of [false, true]) {
    const held = gate(), entered = gate(); f.read(async () => { entered.release(); await held.promise; return { text: 'late' }; });
    const opening = f.home.openRecordedSource('tb', 'run', 'tb/tb.sv'), rejected = assert.rejects(opening, /바뀌었|종료/);
    await entered.promise;
    if (close) f.home.dispose();
    else { f.state.fire({ revision: 2, root: '/project/b', phase: 'idle', tests: [], log: '' }); f.state.fire({ revision: 3, root: '/project/a', phase: 'idle', tests: [], log: '' }); }
    held.release(); await rejected; assert.equal(f.opened.length, 0); assert.equal(f.home.recordedTexts.byteLength, 0);
  }
  assert.equal(f.provider, undefined); assert.equal(f.removed.hasListeners(), false);
});

test('new source URIs carry project context and legacy saved URIs still revalidate in current project', async t => {
  const f = fixture(); t.after(() => f.home.dispose());
  await f.home.openRecordedSource('tb', 'run', 'tb/tb.sv'); assert.equal(f.opened.length, 1);
  assert.equal(JSON.parse(f.opened[0].resource.query).root, '/project/a');
  const legacy = URI.from({ scheme: 'rtl-run-source', path: '/run/old.sv', query: JSON.stringify({ name: 'tb', runId: 'run', file: 'old.sv' }) });
  await f.provider.readFile(legacy); assert.equal(f.calls.at(-1).name, 'source-read');
  f.home.dispose(); assert.equal(f.home.recordedTexts.byteLength, 0);
  await assert.rejects(f.home.recordedBytes(legacy), /종료/);
});

test('removed source model reloads through verification rather than retaining old provider bytes', async t => {
  const f = fixture(); t.after(() => f.home.dispose());
  const uri = f.resource(); await f.provider.readFile(uri);
  f.removed.fire(uri); f.read(async () => { throw Error('Recorded source was modified.'); });
  await assert.rejects(f.provider.readFile(uri), /modified/);
  assert.equal(f.calls.filter(call => call.name === 'source-read').length, 2);
});

test('retained-only rows keep read buttons available, disable execution and rebuild current source after repair', async t => {
  const f = fixture(true); t.after(() => f.home.dispose());
  const latest = { name: 'tb', top: 'tb', runId: 'run', status: 'passed', log: '/saved/run.log', waveform: '/saved/wave.vcd' };
  const state = { revision: 2, root: '/project/a', phase: 'error', historyOnly: true, tests: [{ name: 'tb', top: 'tb', latest }], history: [latest], log: '', error: 'missing source' };
  f.state.fire(state);
  const row = f.home.rowElements.get('tb'); assert.equal(f.home.all.disabled, true); assert.equal(row.run.disabled, true); assert.equal(f.home.explorerEnabled, false);
  assert.equal(row.source.disabled, false); assert.equal(row.log.disabled, false); assert.equal(row.wave.disabled, false);
  assert.equal(row.compare.disabled, true); assert.equal(row.diff.disabled, true); assert.match(f.home.notice.textContent, /보관 이력/);
  const oldSourceButton = f.home.rows.children[0].children[1]; assert.equal(oldSourceButton.disabled, true);
  f.state.fire({ ...state, revision: 3, phase: 'idle', project: 'repaired', historyOnly: false, tests: [{ name: 'tb', top: 'tb', source: '/project/a/tb.sv', latest }], error: undefined });
  assert.equal(f.home.all.disabled, false); assert.equal(f.home.rowElements.get('tb').run.disabled, false);
  const sourceButton = f.home.rows.children[0].children[1]; assert.notEqual(sourceButton, oldSourceButton); assert.equal(sourceButton.disabled, false);
});

const archivePlan = { revision: 'reviewed archive', count: 32, retained: 32, bytes: 4096 };
function setJournal(f, revision = 2, root = '/project/a') { f.state.fire({ revision, root, phase: 'idle', tests: [], log: '', importJournal: { count: 64, limit: 128, archive: archivePlan } }); }
test('journal pressure reuses management entry and explains automatic-monitoring retirement before literal approval', async t => {
  const f=fixture(true);t.after(()=>f.home.dispose());setJournal(f);
  assert.equal(f.home.manage.textContent,'테스트 관리 · 기록 보관');
  f.recovery.pick=async choices=>choices.find(value=>value.action==='archive');
  f.recovery.confirm=async args=>{assert.match(args.detail,/파일을 삭제하지/);assert.match(args.detail,/자동 변경 검사에서 제외/);assert.match(args.detail,/32개/);return {confirmed:true};};
  await f.home.manageProject();assert.deepEqual(f.events,['pick','confirm','archive']);
  assert.deepEqual(f.calls.find(value=>value.name==='import-archive').args,{archive:archivePlan,approved:true});
  assert.equal(f.home.manage.textContent,'테스트 관리');assert.equal(f.opened.length,0);
  setJournal(f,5);f.recovery.pick=async choices=>choices.find(value=>value.action==='manage');await f.home.manageProject();assert.equal(f.events.at(-1),'manage');
});

test('cancel, dirty/trust/loading, stale plan and project A/B/A during archive confirmation never retire records', async t => {
  for(const mode of ['cancel','dirty','trust','loading','stale','root','close']) {
    const f=fixture();t.after(()=>f.home.dispose());setJournal(f);f.recovery.pick=async choices=>choices.find(value=>value.action==='archive');
    f.recovery.confirm=async()=>{
      if(mode==='dirty')f.workingCopies.dirtyWorkingCopies=[{resource:URI.file('/project/a/rtl.toml')}];
      if(mode==='trust')f.trust(false);
      if(mode==='loading')f.state.fire({...f.home.state,revision:3,phase:'loading'});
      if(mode==='stale')f.state.fire({...f.home.state,revision:3,importJournal:{count:64,limit:128,archive:{...archivePlan,revision:'new'}}});
      if(mode==='root'){setJournal(f,3,'/project/b');setJournal(f,4);}
      if(mode==='close')f.home.dispose();return {confirmed:mode!=='cancel'};
    };
    if(mode==='cancel')await f.home.manageProject();else await assert.rejects(f.home.manageProject(),/바뀌었/);
    assert.equal(f.calls.filter(value=>value.name==='import-archive').length,0);
  }
});


test('TB file registration rejects a late picker answer after project A/B/A without writing preferences', async t => {
  const f=fixture(true);t.after(()=>f.home.dispose());const held=gate();f.quickInput.input=()=>held.promise;
  const list={revision:'absent',folders:[],manual:[],excluded:[]};
  f.state.fire({revision:2,root:'/project/a',phase:'idle',tests:[],log:'',testList:list});
  const pending=f.home.registerTestPath('file');
  f.state.fire({revision:3,root:'/project/b',phase:'idle',tests:[],log:'',testList:list});
  f.state.fire({revision:4,root:'/project/a',phase:'idle',tests:[],log:'',testList:list});held.release('tb/new.sv');
  await assert.rejects(pending,/프로젝트나 TB 목록/);assert.equal(f.calls.filter(call=>call.name==='test-list-edit').length,0);
});

test('dirty TB preferences and lost trust block registration before the IPC write', async t => {
  const f=fixture(true);t.after(()=>f.home.dispose());f.quickInput.input=async()=> 'tb/new.sv';
  f.state.fire({revision:2,root:'/project/a',phase:'idle',tests:[],log:'',testList:{revision:'absent',folders:[],manual:[],excluded:[]}});
  f.workingCopies.dirtyWorkingCopies=[{resource:URI.file('/project/a/rtl-tests.json')}];
  await assert.rejects(f.home.registerTestPath('file'),/프로젝트나 TB 목록/);f.workingCopies.dirtyWorkingCopies=[];f.trust(false);
  await assert.rejects(f.home.registerTestPath('file'),/프로젝트나 TB 목록/);assert.equal(f.calls.filter(call=>call.name==='test-list-edit').length,0);
});
