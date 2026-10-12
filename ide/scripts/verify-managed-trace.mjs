// H6A real Verilator prototype. Never modifies existing projects or tool installations.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { root } from './environment.mjs';
const require = createRequire(import.meta.url);
const { existingBackend } = require('../dist/runtime/simulation.js');
const { checkedProcess } = require('../dist/runtime/core/index.js');
const { buildPaths } = require('../dist/runtime/verilator/paths.js');
const { managedTraceHarness } = require('../dist/runtime/verilator/trace-harness.js');
const { parseVcd } = require('../dist/runtime/waveform/vcd.js');
const directory = process.argv[2] ? await fs.realpath(path.resolve(process.argv[2])) : await fs.mkdtemp(path.join(root, '.dev/h6a-trace-한글 공백-'));
let resumed;
if (process.argv[2]) {
  assert.equal(path.dirname(directory), path.join(root, '.dev'));
  assert.ok(path.basename(directory).startsWith('h6a-trace-한글 공백-'));
  resumed = JSON.parse(await fs.readFile(path.join(directory, '.rtl/receipt.json'), 'utf8'));
  assert.equal(resumed.directory, directory);
  const stamp = Date.now();
  await fs.copyFile(path.join(directory, '.rtl/receipt.json'), path.join(directory, `.rtl/receipt.previous-${stamp}.json`));
  await fs.copyFile(path.join(directory, '.rtl/prototype.log'), path.join(directory, `.rtl/prototype.previous-${stamp}.log`));
}
const receipt = { directory, passed: false, checks: [], artifacts: [] };
const source = '`timescale 1ns/1ps\n' + ['first', 'second'].map((top, index) => `module ${top}(output logic [7:0] count);
  logic clk = 0;
  logic marker = 0;
  always #1 clk = ~clk;
  initial begin
    count = ${index};
    if ($test$plusargs("legacy")) begin $dumpfile("legacy.vcd"); $dumpvars(0, ${top}); end
    #2.125;
    marker = 1;
    assert(count == ${index}) else $fatal(1, "initial count");
    #0.875;
    if ($test$plusargs("fail")) $fatal(1, "requested failure");
    if (!$test$plusargs("loop")) begin #14; $display("TOP=${top} time=%0t count=%0d", $time, count); $finish; end
  end
  always @(posedge clk) if ($time > 3) count <= count + 1;
endmodule\n`).join('');
const sourceFile = path.join(directory, 'tb [0].sv');
if (resumed) assert.equal(await fs.readFile(sourceFile, 'utf8'), source);
else await fs.writeFile(sourceFile, source);
const hash = value => createHash('sha256').update(value).digest('hex');
const original = hash(await fs.readFile(sourceFile));
let log = '';
const onLog = text => { log = (log + text).slice(-65536); process.stdout.write(text); };
try {
  const backend = await existingBackend({ onLog }); const cmd = backend.tools.compiler;
  async function build(name, format, top, wrapper = false, input = sourceFile) {
    const run = path.join(directory, '.rtl', name), build = path.join(run, 'build');
    await fs.mkdir(build, { recursive: true });
    const driver = path.join(run, 'managed-main.cpp');
    if (resumed?.artifacts.some(artifact => artifact.name === name && artifact.format === format && artifact.top === top && artifact.run === run)) {
      assert.equal(await fs.readFile(driver, 'utf8'), managedTraceHarness(format, `${top}.${format}`));
      const executable = path.join(build, process.platform === 'win32' ? 'simulation.exe' : 'simulation');
      await fs.access(executable);
      receipt.artifacts.push({ name, format, top, run, reusedOwnedPrototype: true });
      return { executable, cwd: run, env: cmd.env };
    }
    await fs.writeFile(driver, managedTraceHarness(format, `${top}.${format}`));
    const paths = await buildPaths(directory, backend.tools.pathAliasDirectory);
    try {
      const sourceArgs = [await paths.map(input)];
      if (wrapper) {
        const wrapperFile = path.join(run, 'wrapper.sv');
        await fs.writeFile(wrapperFile, '`timescale 1ns/1ps\nmodule rtl_wrapper; first child(); initial begin $dumpfile("wrapper.vcd"); $dumpvars(0,rtl_wrapper); end endmodule\n');
        sourceArgs.push(await paths.map(wrapperFile));
      }
      const args = [...cmd.args, ...(wrapper ? ['--binary'] : ['--cc', '--exe', '--build']), '--timing', '--assert', '--top-module', wrapper ? 'rtl_wrapper' : top, '--prefix', 'Vrtl', '--Mdir', await paths.directory(build), '-o', 'simulation', '-j', '2', '-Wno-fatal', '-CFLAGS', (process.platform === 'win32' ? '-std=c++20 -O2' : '-std=c++20') + ' -DVL_TIME_CONTEXT', ...(process.platform === 'win32' ? ['-MAKEFLAGS', `CURDIR=${await paths.directory(build)}`] : []), ...(format === 'none' ? [] : [format === 'fst' ? '--trace-fst' : '--trace']), ...sourceArgs, ...(wrapper ? [] : [await paths.map(driver)])];
      await checkedProcess({ ...cmd, args, cwd: await paths.directory(run) }, { onLog, signal: AbortSignal.timeout(120000) });
    } finally { await paths.dispose(); }
    const executable = path.join(build, process.platform === 'win32' ? 'simulation.exe' : 'simulation');
    await fs.access(executable);
    const artifact = { executable, cwd: run, env: cmd.env }; receipt.artifacts.push({ name, format, top, run });
    return artifact;
  }
  const first = await build('managed-vcd', 'vcd', 'first');
  const output = await checkedProcess({ ...first, args: [] }, { onLog });
  assert.match(output, /TOP=first time=17000 count=6/);
  const firstWave = await fs.readFile(path.join(first.cwd, 'first.vcd'), 'utf8');
  const parsed = parseVcd(firstWave);
  assert.equal(parsed.end, '17000'); assert.deepEqual(parsed.timescale, { magnitude: 1, unit: 'ps' });
  assert.ok(parsed.signals.some(signal => signal.path.includes('first.count')));
  assert.ok(!parsed.signals.some(signal => /second|rtl_wrapper|child/.test(signal.path)));
  assert.ok(firstWave.includes('#2125'));
  receipt.checks.push('Managed C++ timing loop: no RTL dump required; output top port, assertion, fractional delay, 1ps scale and original first hierarchy preserved');
  const failDir = path.join(first.cwd, 'failure'); await fs.mkdir(failDir, { recursive: true });
  await assert.rejects(checkedProcess({ ...first, cwd: failDir, args: ['+fail'] }, { onLog }), /requested failure/);
  receipt.checks.push('The managed driver preserves real $fatal failure as abnormal exit');
  const loopDir = path.join(first.cwd, 'loop'); await fs.mkdir(loopDir, { recursive: true });
  await assert.rejects(checkedProcess({ ...first, cwd: loopDir, args: ['+loop'] }, { onLog, signal: AbortSignal.timeout(750) }), error => error.cancelled === true);
  receipt.checks.push('Infinite simulation can be cancelled through the common process layer');
  const legacyDir = path.join(first.cwd, 'legacy'); await fs.mkdir(legacyDir, { recursive: true });
  await checkedProcess({ ...first, cwd: legacyDir, args: ['+legacy'] }, { onLog });
  assert.ok((await fs.stat(path.join(legacyDir, 'legacy.vcd'))).size > 0);
  assert.ok((await fs.stat(path.join(legacyDir, 'first.vcd'))).size > 0);
  receipt.checks.push('Existing explicit SV dump coexists with managed dump; duplicate artifacts require a production selection policy');
  const second = await build('managed-fst', 'fst', 'second');
  assert.match(await checkedProcess({ ...second, args: [] }, { onLog }), /TOP=second time=17000 count=7/);
  assert.ok((await fs.stat(path.join(second.cwd, 'second.fst'))).size > 0);
  receipt.checks.push('Same source with two tops: second isolated run emits nonempty FST without RTL dump code');
  const disabled = await build('managed-off', 'none', 'first');
  assert.match(await checkedProcess({ ...disabled, args: ['+legacy'] }, { onLog }), /TOP=first/);
  assert.deepEqual((await fs.readdir(disabled.cwd)).filter(name => /\.(vcd|fst)$/.test(name)), []);
  receipt.checks.push('Trace disabled: no managed or explicit SV VCD/FST output');
  const wrapped = await build('wrapper', 'vcd', 'first', true);
  assert.match(await checkedProcess({ ...wrapped, args: [] }, { onLog }), /TOP=first time=17000 count=6/);
  const wrapperWave = parseVcd(await fs.readFile(path.join(wrapped.cwd, 'wrapper.vcd'), 'utf8'));
  assert.ok(wrapperWave.signals.some(signal => signal.path.includes('rtl_wrapper.child.count')));
  receipt.checks.push('RTL wrapper runs but introduces rtl_wrapper.child hierarchy; managed C++ driver preferred for existing signal paths');
  assert.equal(hash(await fs.readFile(sourceFile)), original);
  assert.equal(hash(await fs.readFile(path.join(first.cwd, 'first.vcd'), 'utf8')), hash(firstWave));
  const cleanFile = path.join(directory, '.rtl', 'no-dump.sv');
  const cleanSource = '`timescale 1ns/1ps\nmodule clean(output logic [7:0] count); initial begin count=0; #1; count=42; #1; assert(count==42) else $fatal(1,"clean assertion"); #1; $finish; end endmodule\n';
  assert.ok(!cleanSource.includes('$dump'));
  await fs.writeFile(cleanFile, cleanSource);
  const clean = await build('managed-no-dump-source', 'vcd', 'clean', false, cleanFile);
  await checkedProcess({ ...clean, args: [] }, { onLog });
  const cleanWave = parseVcd(await fs.readFile(path.join(clean.cwd, 'clean.vcd'), 'utf8'));
  assert.equal(cleanWave.end, '3000');
  assert.ok(cleanWave.signals.some(signal => signal.path.includes('clean.count')));
  assert.equal(await fs.readFile(cleanFile, 'utf8'), cleanSource);
  receipt.checks.push('Independent RTL source with no $dump tokens at all emits VCD with top output and 3ns endpoint');
  assert.deepEqual((await fs.readdir(directory)).sort(), ['.rtl', 'tb [0].sv']);
  receipt.checks.push('Original source bytes unchanged; all generated driver/build/log/trace paths inside .rtl');
  receipt.passed = true;
} catch (error) { receipt.error = String(error); process.exitCode = 1; }
finally {
  await fs.writeFile(path.join(directory, '.rtl', 'prototype.log'), log);
  await fs.writeFile(path.join(directory, '.rtl', 'receipt.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt));
}
