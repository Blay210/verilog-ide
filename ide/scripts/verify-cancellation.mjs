import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { root } from './environment.mjs';

if (process.platform !== 'linux') throw Error('This headless process-group receipt targets Linux; Windows acceptance is separate.');
const require = createRequire(import.meta.url), childProcess = require('node:child_process');
const { SimulationService } = require('../dist/runtime/simulation.js');
const { createProject, readHistory, loadRecordedTrace } = require('../dist/runtime/core/index.js');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const directory = await fs.mkdtemp(path.join(root, '.dev/cloud-h7c-real-'));
await createProject(directory, true);
const service = new SimulationService(), project = await service.inspect(directory);
const files = [path.join(directory, 'rtl.toml'), ...new Set([...project.sources, ...project.tests.flatMap(test => test.sources)])];
const original = new Map(await Promise.all(files.map(async file => [file, digest(await fs.readFile(file))])));
const receipt = { directory, passed: false, checks: [], results: [], groups: [], scope: 'Real Linux Verilator/GCC build cancellation and retry; no GUI or Windows acceptance.' };
const spawn = childProcess.spawn;
childProcess.spawn = (executable, args, options) => {
  const child = spawn(executable, args, options);
  if (args?.includes('--build') && child.pid) receipt.groups.push(child.pid);
  return child;
};
async function group(pid) {
  const rows = [];
  for (const name of await fs.readdir('/proc')) {
    if (!/^\d+$/.test(name)) continue;
    try {
      const stat = await fs.readFile(`/proc/${name}/stat`, 'utf8'), fields = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
      if (Number(fields[2]) === pid && !['Z','X'].includes(fields[0])) rows.push({ pid: Number(name), state: fields[0] });
    } catch (error) { if (!['ENOENT','ESRCH'].includes(error.code)) throw error; }
  }
  return rows;
}
try {
  const [baseline] = await service.run({ root: directory, names: ['counter_basic'] }, { onLog: text => process.stdout.write(text) });
  receipt.results.push(baseline); assert.equal(baseline.status, 'passed', baseline.message);
  const oldTrace = (await loadRecordedTrace(baseline)).bytes;
  let capture;
  const [cancelled] = await service.run({ root: directory, names: ['counter_basic'] }, { onLog: text => {
    process.stdout.write(text);
    if (!capture && text.includes('g++ ')) capture = (async () => {
      const pid = receipt.groups.at(-1); assert.ok(pid);
      receipt.cancelGroup = pid; receipt.liveAtCancel = await group(pid);
      service.cancel();
    })().catch(error => { receipt.captureError = String(error); service.cancel(); });
  } });
  await capture; receipt.results.push(cancelled);
  assert.equal(receipt.captureError, undefined);
  assert.ok(receipt.liveAtCancel?.length >= 2, 'Cancellation must observe a live compiler process tree.');
  assert.equal(cancelled.status, 'cancelled', cancelled.message); assert.equal(service.cleanupFailure, undefined);
  const deadline = Date.now() + 3000;
  while ((await group(receipt.cancelGroup)).length && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10));
  receipt.liveAfterCancel = await group(receipt.cancelGroup); assert.deepEqual(receipt.liveAfterCancel, []);
  assert.deepEqual((await loadRecordedTrace(baseline)).bytes, oldTrace);
  receipt.checks.push('Live Verilator/make/compiler group cancelled; zero live group members; earlier recorded VCD unchanged');
  const [retry] = await service.run({ root: directory, names: ['counter_basic'] }, { onLog: text => process.stdout.write(text) });
  receipt.results.push(retry); assert.equal(retry.status, 'passed', retry.message); await loadRecordedTrace(retry);
  assert.equal((await readHistory(directory)).length, 3);
  for (const [file, hash] of original) assert.equal(digest(await fs.readFile(file)), hash);
  assert.equal(new Set(receipt.results.map(result => result.runId)).size, 3);
  receipt.checks.push('Same service retries successfully; three independent results and original RTL/TOML bytes preserved');
  receipt.passed = true;
} catch (error) { receipt.error = String(error); process.exitCode = 1; }
finally {
  childProcess.spawn = spawn; service.cancel();
  await fs.writeFile(path.join(directory, 'receipt.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify({ directory, passed: receipt.passed, checks: receipt.checks, error: receipt.error, liveAtCancel: receipt.liveAtCancel, liveAfterCancel: receipt.liveAfterCancel }, null, 2));
}
