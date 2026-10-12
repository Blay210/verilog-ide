import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from './environment.mjs';
import { prepareRuntime } from './prepare-runtime.mjs';
await prepareRuntime();
const { RtlSimulationChannel } = await import('../upstream/out/vs/platform/rtl/node/rtlSimulationChannel.js');
const { createProject } = createRequire(import.meta.url)('../dist/runtime/core/index.js');
const directory = await fs.mkdtemp(path.join(root, '.dev/h3b-channel-'));
await createProject(directory, true);
const channel = new RtlSimulationChannel();
const context = 'window:901', states = [];
const listener = channel.listen(context, 'state')(state => states.push(state));
const receipt = { passed: false, directory, mode: 'compiled Node channel integration, not GUI trust or physical mouse acceptance', checks: [] };
async function until(predicate, timeout = 75000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const state = await channel.call(context, 'state');
    if (predicate(state)) return state;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw Error('Channel did not settle.');
}
try {
  await assert.rejects(channel.call('extension:external', 'state'), /local workbench/);
  await channel.call(context, 'inspect', { root: directory });
  await assert.rejects(channel.call(context, 'start', { approved: false }), /신뢰/);
  await channel.call(context, 'start', { approved: true, names: ['counter_basic'] });
  await assert.rejects(channel.call(context, 'start', { approved: true }), /busy/);
  const complete = await until(state => state.phase === 'idle' || state.phase === 'error');
  assert.equal(complete.tests[0].latest.status, 'passed', complete.error);
  assert.ok(complete.tests[0].latest.waveform.endsWith('.vcd'));
  assert.match(await channel.call(context, 'log', { name: 'counter_basic' }), /PASS counter_basic/);
  receipt.checks.push('Compiled channel + owned bundle: real Verilator build/run/VCD and retained log PASS');
  await channel.call(context, 'start', { approved: true, names: ['counter_reset'] });
  await until(state => state.log.includes('g++'));
  await channel.call(context, 'cancel');
  const cancelled = await until(state => state.phase === 'idle' || state.phase === 'error', 15000);
  assert.equal(cancelled.tests[1].latest.status, 'cancelled');
  assert.equal((await channel.call('window:902', 'state')).root, undefined);
  receipt.checks.push('Cancellation during actual C++ build returns cancelled result; other window remains independent');
  assert.ok(states.some(state => state.activeTest === 'counter_basic'));
  assert.ok(states.every(state => state.tests.every(test => !test.latest || !('inputIdentity' in test.latest))));
  receipt.checks.push('Window scope, explicit execution approval, duplicate rejection, compact events PASS');
  receipt.state = cancelled; receipt.passed = true;
} catch (error) { receipt.error = String(error); process.exitCode = 1; }
finally {
  await channel.call(context, 'close'); await channel.call('window:902', 'close');
  listener.dispose(); channel.dispose();
  await fs.writeFile(path.join(directory, 'receipt.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify({ receipt: path.join(directory, 'receipt.json'), passed: receipt.passed, checks: receipt.checks, error: receipt.error }, null, 2));
}
