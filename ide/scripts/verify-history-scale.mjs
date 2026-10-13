import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { root } from './environment.mjs';

const require = createRequire(import.meta.url);
const { SimulationHostSession } = require('../dist/runtime/host.js');
const { SimulationService } = require('../dist/runtime/simulation.js');
const { readHistory } = require('../dist/runtime/core/index.js');
const { discoverProject } = require('../dist/runtime/core/discovery.js');

// Headless synthetic Core/host workload; not a simulator, GUI or real design benchmark.
await fs.mkdir(path.join(root, '.dev'), { recursive: true });
const retained = process.argv[2] === '--retained';
if (process.argv.length !== (retained ? 4 : 2)) throw Error('Usage: verify-history-scale.mjs [--retained <private-fixture>]');
const directory = retained ? path.resolve(process.argv[3]) : await fs.mkdtemp(path.join(root, '.dev/cloud-h7a-scale-'));
if (path.dirname(directory) !== path.join(root, '.dev') || !path.basename(directory).startsWith('cloud-h7a-scale-')) throw Error('Only private H7A fixtures are supported.');
const receipt = { directory, passed: false, sourceFiles: 300, historyRecords: 1000,
  versions: { node: process.version, platform: process.platform }, measurements: {} };
let host;
try {
  if (!retained) await fs.mkdir(path.join(directory, 'rtl'));
  const sources = new Map();
  for (let i = 0; i < receipt.sourceFiles; i++) {
    const name = `unit_${String(i).padStart(3, '0')}.sv`;
    const text = `module unit_${i}; logic value; endmodule\n// ${'x'.repeat(4000)}\n`;
    sources.set(`rtl/${name}`, text);
    if (!retained) await fs.writeFile(path.join(directory, 'rtl', name), text);
  }
  if (!retained) await fs.writeFile(path.join(directory, 'rtl.toml'), 'version=1\n[project]\nname="h7a-scale"\n[sources]\nrtl=["rtl/*.sv"]\n[simulation]\nwaveform="none"\n[[test]]\nname="scale"\ntop="unit_0"\nsources=["rtl/unit_000.sv"]\n');
  const backend = { id: 'verilator', capabilities: { waveforms: ['none'], timing: true, inputSnapshot: true },
    check: async () => {}, build: async ({ directory }) => ({ executable: 'synthetic', cwd: directory }), run: async () => {} };
  const service = new SimulationService(async () => backend);
  const result = retained ? (await readHistory(directory, 1000)).find(row => row.name === 'scale') : (await service.run({ root: directory }))[0];
  assert.ok(result);
  assert.equal(result.status, 'passed'); assert.equal(result.inputSnapshot.state, 'ready');
  receipt.sourceBytes = [...sources.values()].reduce((sum, text) => sum + Buffer.byteLength(text), 0);
  // No copies of the 300-file snapshot: these rows measure history metadata I/O only.
  const time = Date.now() - 10000;
  for (let i = 1; !retained && i < receipt.historyRecords; i++) {
    const run = path.join(directory, '.rtl/runs', `metadata-${String(i).padStart(4, '0')}`);
    await fs.mkdir(run);
    const row = { name: 'metadata', top: 'metadata', status: 'passed', durationMs: 1,
      directory: run, log: path.join(run, 'run.log'), runId: randomUUID(), startedAt: new Date(time - i * 1000).toISOString() };
    await fs.writeFile(row.log, 'metadata fixture');
    await fs.writeFile(path.join(run, 'result.json'), JSON.stringify(row));
  }
  host = new SimulationHostSession(() => {}, service); await host.inspect(directory);
  assert.equal(host.state.tests[0].latest.runId, result.runId);
  async function measure(name, check) {
    await check(); // Warm filesystem/runtime caches; report samples, not cold-start claims.
    const samplesMs = [];
    global.gc?.(); const before = process.memoryUsage();
    for (let i = 0; i < 3; i++) { const start = performance.now(); await check(); samplesMs.push(performance.now() - start); }
    const after = process.memoryUsage(), sorted = [...samplesMs].sort((a, b) => a - b);
    receipt.measurements[name] = { samplesMs, medianMs: sorted[1], minMs: sorted[0], maxMs: sorted[2],
      heapDeltaBytes: after.heapUsed - before.heapUsed, rssAfterBytes: after.rss };
  }
  await measure('history100', async () => {
    const rows = await readHistory(directory); assert.equal(rows.length, 100); assert.equal(rows[0].runId, result.runId);
  });
  await measure('history1000', async () => {
    const rows = await readHistory(directory, 1000); assert.equal(rows.length, 1000); assert.equal(rows[0].runId, result.runId);
  });
  await measure('sourceScan', async () => {
    const scan = await discoverProject(directory); assert.equal(scan.sources.length, receipt.sourceFiles);
  });
  const file = [...sources.keys()][0], original = sources.get(file);
  await measure('savedCurrentComparison', async () => {
    const comparison = await host.compareRun(result.name, result.runId, [{ path: path.join(directory, file), text: original + '// edit' }]);
    assert.equal(comparison.saved.state, 'matching'); assert.equal(comparison.current.state, 'changed');
  });
  await measure('recordedListAndRead', async () => {
    const files = await host.recordedSources(result.name, result.runId); assert.equal(files.length, receipt.sourceFiles);
    const source = await host.recordedSource(result.name, result.runId, file); assert.equal(source.text, original);
  });
  for (const [file, text] of sources) assert.equal(await fs.readFile(path.join(directory, file), 'utf8'), text);
  assert.equal((await readHistory(directory, 1000)).length, receipt.historyRecords);
  receipt.passed = true;
} catch (error) { receipt.error = String(error); process.exitCode = 1; }
finally {
  await host?.close();
  await fs.writeFile(path.join(directory, retained ? `receipt-${randomUUID()}.json` : 'receipt.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
}
