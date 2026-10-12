import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url);
const { SimulationHostSession } = require('../dist/runtime/host.js');
const { SimulationService } = require('../dist/runtime/simulation.js');
const { createProject, checkedProcess } = require('../dist/runtime/core/index.js');
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(root, '.dev/simulation-host-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await createProject(dir, true); return dir;
}
const backend = build => ({ id: 'verilator', capabilities: { waveforms: ['vcd'], timing: true, inputSnapshot: true }, build, check: async () => {}, run: async () => {} });
test('explicit past-run comparison is bound to its run, frozen buffers and project without changing history', async t=>{
 const dir=await fixture(t),file=path.join(dir,'rtl/counter.sv'),text=await fs.readFile(file,'utf8');
 const service=new SimulationService(async()=>backend(async({directory})=>({executable:'fixture',cwd:directory})));
 const host=new SimulationHostSession(()=>{},service);t.after(()=>host.close());await host.inspect(dir);
 host.start(['counter_basic'],true);await idle(host);await host.refreshInputs();const saved=host.state.tests[0].latest;
 host.start(['counter_basic'],true,undefined,[{path:file,text:text+'// edit'}]);await idle(host);await host.refreshInputs();const newer=host.state.tests[0].latest;
 const old=await host.compareRun(saved.name,saved.runId,[]);assert.equal(old.current.state,'matching');assert.equal(old.runId,saved.runId);
 const inputs=[{path:file,text:text+'// edit'}];const pending=host.compareRun(newer.name,newer.runId,inputs);inputs[0].text='changed after request';
 const current=await pending;assert.equal(current.saved.state,'changed');assert.equal(current.current.state,'matching');assert.equal(host.state.history.length,2);assert.equal(host.state.tests[0].latest.runId,newer.runId);
 await assert.rejects(host.compareRun(saved.name,'missing',[]),/not found/);
 const other=await fixture(t);let enter,release;const entered=new Promise(r=>{enter=r;});const gate=new Promise(r=>{release=r;});const inspect=service.inspect.bind(service);let first=true;
 service.inspect=async(...args)=>{if(first){first=false;enter();await gate;}return inspect(...args);};
 const stale=host.compareRun(saved.name,saved.runId,[]);await entered;await host.inspect(other);release();await assert.rejects(stale,/Project changed/);
});
async function idle(host) {
  const deadline = Date.now() + 10000;
  while (['running', 'cancelling'].includes(host.state.phase)) {
    assert.ok(Date.now() < deadline, 'host did not settle');
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

test('host forwards frozen editor inputs and retains unsaved provenance through result/history refresh', async t => {
  const dir = await fixture(t), file = path.join(dir, 'rtl/counter.sv');
  const original = await fs.readFile(file, 'utf8');
  const inputs = [{ path: file, text: original + '\n// edited snapshot\n', version: 19 }];
  let built;
  const host = new SimulationHostSession(() => {}, new SimulationService(async () => backend(async ({ project, directory }) => {
    built = await fs.readFile(project.sources[0], 'utf8'); return { executable: 'fixture', cwd: directory };
  })));
  t.after(() => host.close()); await host.inspect(dir);
  assert.throws(() => host.start(['counter_basic'], true, undefined, [{ path: file, text: '', version: -1 }]), /version/);
  assert.equal(host.state.phase, 'idle');
  host.start(['counter_basic'], true, undefined, inputs); inputs[0].text = 'too late';
  await idle(host); await host.refreshInputs();
  assert.equal(built, original + '\n// edited snapshot\n');
  assert.deepEqual(host.state.tests[0].latest.unsavedFiles, [file]);
  assert.deepEqual(host.state.history[0].unsavedFiles, [file]);
  await host.refreshInputs([{path:file,text:built,version:20}]);
  assert.equal(host.state.tests[0].latest.currentInputs.state,'matching');
  assert.equal(host.state.tests[0].latest.inputs.state,'changed');
  await host.refreshInputs([{path:file,text:built+'// changed',version:21}]);
  assert.equal(host.state.tests[0].latest.currentInputs.state,'changed');
  await host.refreshInputs([]);
  assert.equal(host.state.tests[0].latest.currentInputs.state,'changed');
  assert.equal(await fs.readFile(file, 'utf8'), original);
  const saved=host.state.tests[0].latest;
  const sources=await host.recordedSources(saved.name,saved.runId);
  const source=sources.find(source=>source.file==='rtl/counter.sv');assert.equal(source.unsaved,true);
  await fs.writeFile(file,'module current_changed; endmodule');
  assert.equal((await host.recordedSource(saved.name,saved.runId,source.file)).text,built);
  await fs.unlink(file);
  assert.equal((await host.recordedSource(saved.name,saved.runId,source.file)).text,built);
  await assert.rejects(host.recordedSource(saved.name,saved.runId,'../rtl.toml'),/not recorded/);
  await assert.rejects(host.recordedSource(saved.name,'unknown',source.file),/not found/);
  const record=JSON.parse(await fs.readFile(path.join(path.dirname(saved.log),'input-snapshot.json'),'utf8'));
  const mapping=record.mappings.find(mapping=>mapping.original.toLowerCase()===file.toLowerCase());
  const retained=path.join(path.dirname(saved.log),'inputs',mapping.relative);await fs.chmod(retained,0o666);await fs.writeFile(retained,'tampered');
  await assert.rejects(host.recordedSource(saved.name,saved.runId,source.file),/modified/);
});

test('overlapping editor comparisons publish the newest captured buffers, never the older scan', async t => {
  const dir=await fixture(t),file=path.join(dir,'rtl/counter.sv'),text=await fs.readFile(file,'utf8');
  const service=new SimulationService(async()=>backend(async({directory})=>({executable:'fixture',cwd:directory})));
  const host=new SimulationHostSession(()=>{},service);t.after(()=>host.close());
  await host.inspect(dir);host.start(['counter_basic'],true,undefined,[{path:file,text:text+'// snapshot'}]);await idle(host);await host.refreshInputs();
  let release,enter;const gate=new Promise(resolve=>{release=resolve;});const entered=new Promise(resolve=>{enter=resolve;});
  const inspect=service.inspect.bind(service);let first=true;
  service.inspect=async(...args)=>{if(first){first=false;enter();await gate;}return inspect(...args);};
  const older=host.refreshInputs([{path:file,text:text+'// other'}]);await entered;
  const current=[{path:file,text:text+'// snapshot',version:88}];const newest=host.refreshInputs(current);current[0].text='mutation after request';release();
  await Promise.all([older,newest]);assert.equal(host.state.tests[0].latest.currentInputs.state,'matching');assert.equal(host.state.tests[0].latest.inputs.state,'changed');
});
test('host publishes ordered results and compact state; refresh restores retained latest results', async t => {
  const dir = await fixture(t), observed = [], states = [];
  const host = new SimulationHostSession(state => states.push(state), new SimulationService(async () => backend(async ({ target, directory }) => {
    observed.push(target.name); return { executable: 'fixture', cwd: directory };
  })));
  await host.inspect(dir);
  assert.throws(() => host.start(undefined, false), /신뢰/);
  assert.deepEqual(observed, []);
  host.start(['counter_reset', 'counter_basic'], true);
  assert.throws(() => host.start(undefined, true), /busy/);
  await idle(host);
  assert.deepEqual(observed, ['counter_reset', 'counter_basic']);
  assert.ok(host.state.tests.every(test => test.latest.status === 'passed'));
  assert.ok(host.state.tests.every(test => !('inputIdentity' in test.latest)));
  assert.ok(states.some(s => s.activeTest === 'counter_basic'));
  assert.match(await host.readLog('counter_basic'), /Building counter_basic/);
  await assert.rejects(host.readLog('unknown'), /로그/);
  const identity = host.state.tests[0].latest.runId;
  await host.inspect(dir); assert.equal(host.state.tests[0].latest.runId, identity);
  await host.close(); assert.throws(() => host.start(undefined, true), /closed/);
});
test('host cancellation awaits process cleanup, retains cancelled result and can rerun', async t => {
  const dir = await fixture(t); let entered, hold = true;
  const ready = new Promise(resolve => { entered = resolve; });
  const service = new SimulationService(async () => backend(async ({ directory }, context) => {
    if (hold) {
      entered();
      await checkedProcess({ executable: process.execPath, args: ['-e', 'setInterval(()=>{},1000)'], cwd: directory }, context);
    }
    return { executable: 'fixture', cwd: directory };
  }));
  const host = new SimulationHostSession(() => {}, service);
  await host.inspect(dir); host.start(undefined, true); await ready;
  host.cancel(); await idle(host);
  assert.equal(host.state.tests[0].latest.status, 'cancelled');
  assert.doesNotMatch(host.state.tests[0].latest.message ?? '', /dumpfile|dumpvars/);
  assert.equal(host.state.tests[1].latest, undefined); assert.equal(service.running, false);
  hold = false; host.start(['counter_reset'], true); await idle(host);
  assert.equal(host.state.tests[1].latest.status, 'passed'); await host.close();
});
test('closing a host cancels its active run and different windows have independent state', async t => {
  const dir = await fixture(t); let entered;
  const ready = new Promise(resolve => { entered = resolve; });
  const host = new SimulationHostSession(() => {}, new SimulationService(async () => backend(async ({ directory }, context) => {
    entered(); await checkedProcess({ executable: process.execPath, args: ['-e', 'setInterval(()=>{},1000)'], cwd: directory }, context);
    return { executable: 'fixture', cwd: directory };
  })));
  const other = new SimulationHostSession(() => {});
  await host.inspect(dir); host.start(['counter_basic'], true); await ready;
  await host.close();
  assert.equal(host.state.tests[0].latest.status, 'cancelled');
  assert.equal(other.state.root, undefined); assert.equal(other.state.log, '');
  await other.inspect(dir); assert.equal(other.state.tests[0].latest.status, 'cancelled'); await other.close();
});
test('configuration/tool errors leave host refresh and rerun available', async t => {
  const dir = await fixture(t);
  const host = new SimulationHostSession(() => {}, new SimulationService(async () => { throw Error('fixture tool unavailable'); }));
  await host.inspect(dir); host.start(undefined, true); await idle(host);
  assert.equal(host.state.phase, 'error'); assert.match(host.state.error, /unavailable/);
  await host.inspect(dir); assert.equal(host.state.phase, 'idle');
  await fs.writeFile(path.join(dir, 'rtl.toml'), 'broken = [');
  await host.inspect(dir); assert.equal(host.state.phase, 'error'); assert.equal(host.state.tests.length, 0);
  await host.close();
});
test('history keeps old logs and compares saved inputs without replacing retained runs', async t => {
  const dir = await fixture(t); let builds = 0;
  const host = new SimulationHostSession(() => {}, new SimulationService(async () => backend(async ({ directory }, context) => {
    context.onLog?.(`history marker ${++builds}\n`); return { executable: 'fixture', cwd: directory };
  })));
  t.after(() => host.close());
  await host.inspect(dir); host.start(['counter_basic'], true); await idle(host); await host.refreshInputs();
  const first = host.state.tests[0].latest;
  assert.equal(first.inputs.state, 'matching');
  host.start(['counter_basic'], true); await idle(host); await host.refreshInputs();
  const latestId = host.state.tests[0].latest.runId;
  assert.equal(host.state.history.length, 2); assert.notEqual(latestId, first.runId);
  assert.match(await host.readLog('counter_basic', first.runId), /history marker 1/);
  assert.match(await host.readLog('counter_basic', latestId), /history marker 2/);
  await assert.rejects(host.readLog('counter_basic', 'unknown'), /로그/);
  const source = path.join(dir, 'rtl/counter.sv'), text = await fs.readFile(source, 'utf8');
  await fs.writeFile(source, text + '\n// changed saved source\n'); await host.refreshInputs();
  assert.equal(host.state.tests[0].latest.inputs.state, 'changed');
  assert.equal(host.state.tests[0].latest.runId, latestId); assert.equal(host.state.history.length, 2);
  await fs.writeFile(source, text); await host.refreshInputs(); assert.equal(host.state.tests[0].latest.inputs.state, 'matching');
  const manifest = path.join(dir, 'rtl.toml'), settings = await fs.readFile(manifest, 'utf8');
  await fs.writeFile(manifest, 'broken = ['); await host.refreshInputs();
  assert.equal(host.state.tests[0].latest.inputs.state, 'unavailable');
  assert.equal(host.state.tests[0].latest.currentInputs.state, 'unavailable');
  assert.match(await host.readLog('counter_basic', first.runId), /history marker 1/);
  await fs.writeFile(manifest, settings);
});
