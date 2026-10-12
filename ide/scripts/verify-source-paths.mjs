// Development-only real Verilator acceptance; no installs or existing profiles.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { root } from './environment.mjs';
const require = createRequire(import.meta.url);
const { SimulationService, existingBackend } = require('../dist/runtime/simulation.js');
const { loadRecordedTrace } = require('../dist/runtime/core/index.js');
await fs.mkdir(path.join(root, '.dev'), { recursive: true });
const directory = await fs.mkdtemp(path.join(root, '.dev/h5d3-paths-한글 공백-'));
const receipt = { directory, passed: false, checks: [], results: [] };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
try {
  await fs.mkdir(path.join(directory, 'rtl')); await fs.mkdir(path.join(directory, 'tb')); await fs.mkdir(path.join(directory, 'include 한글'));
  const files = {
    'include 한글/value [0].svh': '`define EXPECTED_VALUE 7\n',
    'rtl/연산 [0].sv': '`timescale 1ns/1ps\n`include "value [0].svh"\nmodule dut(output logic [3:0] y); assign y=`EXPECTED_VALUE; endmodule\n',
    'tb/테스트 bench [0].sv': '`timescale 1ns/1ps\nmodule tb; wire [3:0] y; dut u(y); initial begin $dumpfile("wave.vcd"); $dumpvars(0,tb); #1; assert(y==7) else $fatal(1,"bad include"); $display("source=%s", `__FILE__); $finish; end endmodule\n'
  };
  for (const [file, text] of Object.entries(files)) await fs.writeFile(path.join(directory, file), text);
  await fs.writeFile(path.join(directory, 'rtl.toml'), `version=1\n[project]\nname="path acceptance"\n[sources]\nrtl=[{file="rtl/연산 [0].sv"}]\ninclude_dirs=["include 한글"]\n[simulation]\nbackend="verilator"\ntiming=true\nwaveform="vcd"\ntimeout_ms=120000\n[[test]]\nname="tb.paths"\ntop="tb"\nsources=[{file="tb/테스트 bench [0].sv"}]\n`);
  const before = await Promise.all(Object.keys(files).map(async file => hash(await fs.readFile(path.join(directory, file)))));
  const backend = await existingBackend({});
  const cache = backend.tools.pathAliasDirectory;
  const aliasesBefore = (await fs.readdir(cache)).sort();
  const service = new SimulationService(async () => backend);
  const results = await service.run({ root: directory }, { onLog: text => process.stdout.write(text) });
  const result = results[0]; receipt.results = results;
  assert.equal(result.status, 'passed', result.message);
  assert.equal(result.inputSnapshot.state, 'ready');
  assert.ok((await fs.stat(result.waveform)).size > 0); await loadRecordedTrace(result);
  const log = await fs.readFile(result.log, 'utf8');
  assert.ok(log.includes('테스트 bench [0].sv'), '__FILE__ retains source name');
  assert.deepEqual(await Promise.all(Object.keys(files).map(async file => hash(await fs.readFile(path.join(directory, file))))), before);
  assert.deepEqual((await fs.readdir(directory)).sort(), ['.rtl','include 한글','rtl','rtl.toml','tb']);
  receipt.checks.push('Real build/run + VCD: Unicode/space/bracket source and header filenames, configured includes, __FILE__, recorded inputs, original hashes and output isolation PASS');
  assert.deepEqual((await fs.readdir(cache)).sort(), aliasesBefore);
  const tb = path.join(directory, 'tb/테스트 bench [0].sv');
  await fs.appendFile(tb, '\nmodule broken; assign = ; endmodule\n');
  const [failed] = await service.run({ root: directory }); receipt.results.push(failed);
  assert.equal(failed.status, 'failed');
  const failureLog = await fs.readFile(failed.log, 'utf8');
  assert.ok(failureLog.includes('테스트 bench [0].sv:4'), failureLog);
  assert.deepEqual((await fs.readdir(cache)).sort(), aliasesBefore);
  await fs.writeFile(tb, files['tb/테스트 bench [0].sv']);
  receipt.checks.push('Real syntax failure reports original filename/line and cleans aliases PASS');
  let cancelledInBuild = false;
  const [cancelled] = await service.run({ root: directory }, { onLog: text => {
    if (!cancelledInBuild && text.includes('g++ ')) { cancelledInBuild = true; service.cancel(); }
  } }); receipt.results.push(cancelled);
  assert.equal(cancelledInBuild, true); assert.equal(cancelled.status, 'cancelled');
  assert.deepEqual((await fs.readdir(cache)).sort(), aliasesBefore);
  assert.deepEqual(await Promise.all(Object.keys(files).map(async file => hash(await fs.readFile(path.join(directory, file))))), before);
  receipt.checks.push('Real C++ build cancellation cleans aliases and leaves source bytes intact PASS');
  receipt.passed = true;
} catch (error) { receipt.error = String(error); process.exitCode = 1; }
finally {
  await fs.writeFile(path.join(directory, 'receipt.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify({ directory, passed: receipt.passed, checks: receipt.checks, error: receipt.error }));
}
