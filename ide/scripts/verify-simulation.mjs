import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { root } from './environment.mjs';
const require = createRequire(import.meta.url);
const { SimulationService } = require('../dist/runtime/simulation.js');
const { createProject, loadRecordedTrace, readHistory } = require('../dist/runtime/core/index.js');
await fs.mkdir(path.join(root, '.dev'), { recursive: true });
const retained = process.argv[2] === '--retained';
if (process.argv.length > (retained ? 4 : 2) || (process.argv[2] && !retained) || (retained && !process.argv[3])) throw Error('Usage: verify-simulation.mjs [--retained <private-fixture>]');
const directory = retained ? path.resolve(process.argv[3]) : await fs.mkdtemp(path.join(root, '.dev/h3a-real-'));
if (retained && (path.dirname(directory) !== path.join(root, '.dev') || !path.basename(directory).startsWith('h3a-real-'))) throw Error('Retained verification is restricted to private H3A fixtures.');
const receipt = { directory, passed: false, checks: [], results: [] };
const digest = text => createHash('sha256').update(text).digest('hex');
try {
  if (!retained) await createProject(directory, true);
  const service = new SimulationService();
  const manifest = path.join(directory, 'rtl.toml');
  const original = await fs.readFile(manifest, 'utf8');
  const project = await service.inspect(directory);
  const sources = [...new Set([...project.sources, ...project.tests.flatMap(t => t.sources)])];
  const hashes = await Promise.all(sources.map(async file => digest(await fs.readFile(file))));
  for (const format of ['vcd', 'fst']) {
    if (!retained) await fs.writeFile(manifest, original.replace('waveform = "vcd"', `waveform = "${format}"`));
    const results = retained ? (await readHistory(directory)).filter(r => r.traceIdentity?.format === format)
      .filter((r, index, all) => all.findIndex(previous => previous.name === r.name) === index)
      : await service.run({ root: directory }, { onLog: text => process.stdout.write(text) });
    assert.equal(results.length, 2);
    for (const result of results) {
      assert.equal(result.status, 'passed', result.message);
      assert.equal(result.inputSnapshot.state, 'ready');
      assert.equal(result.traceIdentity.state, 'ready');
      assert.ok(result.waveform.endsWith(`.${format}`));
      assert.ok((await fs.stat(result.waveform)).size > 0);
      await loadRecordedTrace(result);
      for (const input of result.inputIdentity.files) assert.equal(digest(await fs.readFile(input.path)), input.sha256);
      receipt.results.push(result);
      receipt.checks.push(`${format}/${result.name}: build, run, retained input and trace bytes PASS`);
    }
  }
  const after = await Promise.all(sources.map(async file => digest(await fs.readFile(file))));
  assert.deepEqual(after, hashes);
  assert.deepEqual((await fs.readdir(directory)).filter(f => f !== 'receipt.json' && f !== 'retained-receipt.json').sort(), ['.gitignore', '.rtl', 'README.md', 'rtl', 'rtl.toml', 'tb']);
  assert.equal(new Set(receipt.results.map(r => r.runId)).size, 4);
  receipt.checks.push('Original RTL unchanged; unique runs and outputs inside .rtl PASS');
  receipt.passed = true;
} catch (error) { receipt.error = String(error); process.exitCode = 1; }
finally {
  const file = path.join(directory, retained ? 'retained-receipt.json' : 'receipt.json');
  await fs.writeFile(file, JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify({ receipt: file, passed: receipt.passed, checks: receipt.checks, error: receipt.error }, null, 2));
}
