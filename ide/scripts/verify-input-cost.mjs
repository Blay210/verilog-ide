import assert from 'node:assert/strict';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { root } from './environment.mjs';

const require = createRequire(import.meta.url);
const fs = require('node:fs/promises');
const { SimulationHostSession } = require('../dist/runtime/host.js');
const { loadProject, readHistory, loadRecordedInputs, captureInputs } = require('../dist/runtime/core/index.js');

// Explicit diagnostic instrumentation only; no production flags, caches or IPC changes.
if (process.argv.length !== 3) throw Error('Usage: verify-input-cost.mjs <private-H7A-fixture>');
const directory = path.resolve(process.argv[2]);
if (path.dirname(directory) !== path.join(root, '.dev') || !path.basename(directory).startsWith('cloud-h7a-scale-') || await fs.realpath(directory) !== directory) throw Error('Only private H7A fixtures are supported.');
const original = Object.fromEntries(['lstat', 'readFile', 'readdir', 'open'].map(name => [name, fs[name]]));
const receipt = { directory, passed: false, versions: { node: process.version, platform: process.platform }, measurements: {} };
let host;
try {
  const result = (await readHistory(directory, 1000)).find(row => row.name === 'scale');
  assert.ok(result);
  const project = await loadProject(directory), file = project.sources[0], text = await fs.readFile(file, 'utf8');
  const overrides = new Map([[process.platform === 'win32' ? file.toLowerCase() : file, Buffer.from(text + '// edited')]]);
  host = new SimulationHostSession(() => {}); await host.inspect(directory);
  const inputs = await loadRecordedInputs(result), recorded = inputs.sourceMappings.find(mapping => mapping.original === file);
  assert.ok(recorded);
  const relative = path.relative(inputs.project.root, recorded.recorded).split(path.sep).join('/');
  receipt.files = inputs.sourceMappings.length;
  async function measure(name, check) {
    await check();
    const samples = [];
    for (let i = 0; i < 3; i++) {
      const calls = Object.fromEntries(Object.keys(original).map(name => [name, 0]));
      for (const [method, implementation] of Object.entries(original)) fs[method] = (...args) => { calls[method]++; return implementation(...args); };
      const start = performance.now();
      try { await check(); } finally { Object.assign(fs, original); }
      samples.push({ elapsedMs: performance.now() - start, calls });
    }
    const sorted = samples.map(sample => sample.elapsedMs).sort((a, b) => a - b);
    receipt.measurements[name] = { medianMs: sorted[1], minMs: sorted[0], maxMs: sorted[2], samples };
  }
  await measure('history', async () => assert.equal((await readHistory(directory)).length, 100));
  await measure('projectRead', async () => assert.equal((await loadProject(directory)).sources.length, receipt.files));
  await measure('retainedValidation', async () => assert.equal((await loadRecordedInputs(result)).sourceMappings.length, receipt.files));
  await measure('savedCapture', async () => assert.equal((await captureInputs(project, project.tests[0])).fingerprint, result.inputIdentity.fingerprint));
  await measure('editorCapture', async () => assert.notEqual((await captureInputs(project, project.tests[0], undefined, undefined, overrides)).fingerprint, result.inputIdentity.fingerprint));
  await measure('savedCurrentComparison', async () => {
    const comparison = await host.compareRun(result.name, result.runId, [{ path: file, text: text + '// edited' }]);
    assert.equal(comparison.saved.state, 'matching'); assert.equal(comparison.current.state, 'changed');
  });
  await measure('recordedList', async () => assert.equal((await host.recordedSources(result.name, result.runId)).length, receipt.files));
  await measure('recordedRead', async () => assert.equal((await host.recordedSource(result.name, result.runId, relative)).text, text));
  receipt.passed = true;
} catch (error) { receipt.error = String(error); process.exitCode = 1; }
finally {
  Object.assign(fs, original); await host?.close();
  await fs.writeFile(path.join(directory, `input-cost-${randomUUID()}.json`), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
}
