import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { root } from './environment.mjs';
const require = createRequire(import.meta.url);
const { createSimulationHost, initializeSourceProject } = require('../dist/runtime/host.js');
const directory = await fs.mkdtemp(path.join(root, '.dev/remediation-host-한글 공백-'));
await initializeSourceProject(directory, '보완 실제 실행');
const files = [
  ['rtl/z_base.sv', '`timescale 1ns/1ps\npackage z_base; typedef enum logic [1:0] {IDLE=0, RUN=1, DONE=2} state_t; localparam int VALUE=2; endpackage\n'],
  ['rtl/a_consumer.sv', '`timescale 1ns/1ps\npackage a_consumer; import z_base::*; localparam int EXPECTED=VALUE; endpackage\n'],
  ['tb/tb.sv', '`timescale 1ns/1ps\nmodule tb; import z_base::*; import a_consumer::EXPECTED; state_t state=IDLE; initial begin #1; state=RUN; #1; state=DONE; if (EXPECTED != 2) $fatal; #1; $finish; end endmodule\n']
];
for (const [file, content] of files) await fs.writeFile(path.join(directory, file), content);
const manifest = await fs.readFile(path.join(directory, 'rtl.toml'));
const host = createSimulationHost(() => {}, path.join(root, 'upstream/out/vs/platform/rtl/node/waveform-worker.cjs'), path.join(root, 'language/python/analyze.py'));
const receipt = { directory, passed: false, checks: [] };
try {
  await host.inspect(directory); assert.equal(host.state.tests.length, 1, host.state.error);
  const name = host.state.tests[0].name;
  host.start([name], true);
  const deadline = Date.now() + 180000;
  while (['running', 'cancelling'].includes(host.state.phase)) { assert.ok(Date.now() < deadline, 'Simulation deadline exceeded'); await new Promise(resolve => setTimeout(resolve, 50)); }
  assert.equal(host.state.phase, 'idle', host.state.error);
  const result = host.state.tests[0].latest; assert.equal(result.status, 'passed', result.message ?? host.state.log);
  receipt.checks.push('Untouched generated project uses live package discovery and real semantic dependency ordering through the production host');
  const doc = await host.openWaveform(name, result.runId);
  assert.ok(Object.values(doc.metadata.enumLabels ?? {}).some(labels => Object.values(labels).includes('IDLE') && Object.values(labels).includes('RUN') && Object.values(labels).includes('DONE')), JSON.stringify(doc.metadata.warnings));
  receipt.checks.push('Actual managed VCD opens through the host and recorded enum labels reach waveform metadata');
  await host.closeWaveform(doc.token);
  for (const [file, content] of files) assert.equal(await fs.readFile(path.join(directory, file), 'utf8'), content);
  assert.deepEqual(await fs.readFile(path.join(directory, 'rtl.toml')), manifest);
  assert.deepEqual((await fs.readdir(directory)).sort(), ['.gitignore', '.rtl', 'README.md', 'rtl', 'rtl.toml', 'tb']);
  receipt.checks.push('No dump code, source/TOML writes, automatic folder reorganization or generated output outside .rtl');
  receipt.passed = true;
} catch (error) { receipt.error = String(error); process.exitCode = 1; }
finally { await host.close(); await fs.writeFile(path.join(directory, '.rtl/acceptance.json'), JSON.stringify(receipt, null, 2)); console.log(JSON.stringify(receipt)); }
