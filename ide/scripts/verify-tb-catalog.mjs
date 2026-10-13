import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { createRequire } from 'node:module';
import { root } from './environment.mjs';

// Real filesystem delivery and Core/host workload. The workbench's event
// forwarding/debounce is represented here; this is not native UI acceptance.
const require = createRequire(import.meta.url);
const { createProject, loadProject, readHistory } = require('../dist/runtime/core/index.js');
const { SimulationHostSession } = require('../dist/runtime/host.js');
const { SimulationService } = require('../dist/runtime/simulation.js');
await fs.mkdir(path.join(root, '.dev'), { recursive: true });
const directory = await fs.mkdtemp(path.join(root, '.dev/cloud-tb-integration-'));
const receipt = { directory, passed: false, versions: { node: process.version, platform: process.platform }, scope: 'Node filesystem + production Core/host; modeled workbench forwarding, no UI.', measurements: {}, checks: {} };
let host, watcher, timer, active, pending = false, scans = 0, events = 0, tools = 0, failure;
const until = async condition => {
  const deadline = Date.now() + 15000;
  while (!await condition()) {
    if (failure) throw failure;
    if (Date.now() >= deadline) throw Error('Filesystem/host did not settle.');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
};
try {
  await createProject(directory, true);
  await fs.mkdir(path.join(directory, 'verification'));
  host = new SimulationHostSession(() => {}, new SimulationService(async () => { tools++; throw Error('Unexpected simulator'); }), undefined, async () => { tools++; throw Error('Unexpected compiler'); });
  await host.inspect(directory);
  await host.editTestList({ action: 'folder', path: 'verification' }, host.state.testList.revision, true);
  const manifest = await fs.readFile(path.join(directory, 'rtl.toml'));
  const preferences = await fs.readFile(path.join(directory, 'rtl-tests.json'));
  const forward = () => {
    pending = true; clearTimeout(timer);
    timer = setTimeout(() => {
      if (active) return;
      pending = false; scans++;
      active = host.refreshInputs().catch(error => { failure = error; }).finally(() => { active = undefined; if (pending) forward(); });
    }, 100);
  };
  watcher = watch(directory, { recursive: true }, (_event, name) => {
    if (!name || String(name).split(path.sep).some(part => ['.rtl', '.git', 'node_modules'].includes(part))) return;
    events++; forward();
  });
  watcher.on('error', error => { failure = error; });
  const file = path.join(directory, 'verification/two.sv');
  await fs.writeFile(file, 'module watched_a; endmodule\nmodule watched_b; endmodule\n');
  await until(() => host.state.tests.some(test => test.top === 'watched_a') && host.state.tests.some(test => test.top === 'watched_b'));
  await fs.rename(file, path.join(directory, 'verification/renamed.sv'));
  await until(() => { const rows = host.state.tests.filter(test => test.top.startsWith('watched_')); return rows.length === 2 && rows.every(test => test.source.endsWith('renamed.sv')); });
  await fs.rename(path.join(directory, 'verification'), path.join(directory, 'unregistered'));
  await until(() => !host.state.tests.some(test => test.top.startsWith('watched_')));
  await fs.mkdir(path.join(directory, 'verification'));
  await fs.writeFile(file, 'module recreated; endmodule\n');
  await until(() => host.state.tests.some(test => test.top === 'recreated'));
  await fs.unlink(file); await until(() => !host.state.tests.some(test => test.top === 'recreated'));
  await until(() => !active && !pending);
  receipt.checks.filesystem = { events, refreshes: scans, rename: true, folderMove: true, emptyFolderRecreation: true, delete: true };
  watcher.close(); watcher = undefined; clearTimeout(timer);
  await fs.rm(path.join(directory, 'unregistered'), { recursive: true });
  // 300 ordinary RTL files, 100 TB files with 2 independent tops each.
  for (let i = 0; i < 300; i++) await fs.writeFile(path.join(directory, `rtl/unit_${i}.sv`), `module unit_${i}; endmodule\n// ${'x'.repeat(4000)}\n`);
  for (let i = 0; i < 100; i++) await fs.writeFile(path.join(directory, `verification/test_${i}.sv`), `module scale_a_${i}; endmodule\nmodule scale_b_${i}; endmodule\n`);
  await host.refreshInputs(); assert.equal(host.state.tests.length, 202);
  async function measure(name, check, count = 5) {
    const samplesMs = [], cpu = process.cpuUsage(); global.gc?.(); const before = process.memoryUsage();
    const allocate = Buffer.allocUnsafe; let allocationCalls = 0, allocationBytes = 0;
    Buffer.allocUnsafe = size => { allocationCalls++; allocationBytes += size; return allocate(size); };
    try {
      for (let i = 0; i < count; i++) { const start = performance.now(); await check(); samplesMs.push(performance.now() - start); }
    } finally { Buffer.allocUnsafe = allocate; }
    global.gc?.(); const after = process.memoryUsage(), ordered = [...samplesMs].sort((a, b) => a - b);
    receipt.measurements[name] = { samplesMs, medianMs: ordered[Math.floor(count / 2)], maxMs: ordered.at(-1), cpuMicros: process.cpuUsage(cpu), heapBefore: before.heapUsed, heapAfter: after.heapUsed, rssAfter: after.rss, allocationCalls, allocationBytes, allocationBytesPerOperation: allocationBytes / count };
  }
  await measure('coreLoad', async () => assert.equal((await loadProject(directory)).tests.length, 202));
  await measure('hostRefresh', async () => { await host.refreshInputs(); assert.equal(host.state.tests.length, 202); });
  await measure('repeatAddDelete', async () => {
    await fs.writeFile(file, 'module repeated; endmodule\n'); await host.refreshInputs(); assert.equal(host.state.tests.length, 203);
    await fs.unlink(file); await host.refreshInputs(); assert.equal(host.state.tests.length, 202);
  }, 20);
  let notices = 0; host.notify = () => { notices++; }; const idleCpu = process.cpuUsage();
  await new Promise(resolve => setTimeout(resolve, 500));
  receipt.measurements.idle = { durationMs: 500, notifications: notices, cpuMicros: process.cpuUsage(idleCpu) };
  assert.equal(notices, 0); assert.equal(tools, 0); assert.equal((await readHistory(directory)).length, 0);
  assert.deepEqual(await fs.readFile(path.join(directory, 'rtl.toml')), manifest);
  assert.deepEqual(await fs.readFile(path.join(directory, 'rtl-tests.json')), preferences);
  await host.close(); await host.close();
  receipt.checks.automaticTools = tools; receipt.checks.history = 0; receipt.checks.preferencesUnchanged = true; receipt.checks.doubleClose = true;
  receipt.passed = true;
} catch (error) { receipt.error = String(error); process.exitCode = 1; }
finally {
  watcher?.close(); clearTimeout(timer); await active; await host?.close();
  await fs.writeFile(path.join(directory, 'receipt.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
}
