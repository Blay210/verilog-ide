// Real production backend/Core/CLI acceptance in an owned project only.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { root } from './environment.mjs';
const require = createRequire(import.meta.url);
const { SimulationService } = require('../dist/runtime/simulation.js');
const { loadRecordedTrace } = require('../dist/runtime/core/index.js');
const { parseVcd } = require('../dist/runtime/waveform/vcd.js');
const directory = await fs.mkdtemp(path.join(root, '.dev/h6a2-auto-한글 공백-'));
await fs.mkdir(path.join(directory, 'tb'));
const source = '`timescale 1ns/1ps\n' + ['first', 'second'].map(top => `module ${top};
logic [7:0] count=0;

\`ifdef IMMEDIATE
initial begin count=7; assert(count==7); $finish; end
\`elsif STATIC
initial count=7;
\`else
logic clk=0;
always #1 clk=~clk;
always @(posedge clk) count<=count+1;
initial begin #0.5; assert(count==0) else $fatal(1,"initial count"); #16.5;
\`ifdef FAIL
$fatal(1,"requested auto failure");
\`elsif LOOP
// Clock continues until the host cancels.
\`else
$finish;
\`endif
end
\`endif
final $display("FINAL ${top} count=%0d",count);
endmodule\n`).join('');
const file = path.join(directory, 'tb/테스트 [0].sv'); await fs.writeFile(file, source);
assert.ok(!source.includes('$dump'));
const receipt = { directory, passed: false, checks: [], results: [] };
const manifest = (format='vcd', defines='', timing=true, timeout=120000) => `version=1\n[project]\nname="auto waveform"\n[sources]\nrtl=[]\n${defines ? '[sources.defines]\n'+defines+'\n' : ''}[simulation]\nbackend="verilator"\ntiming=${timing}\nwaveform="${format}"\ntimeout_ms=${timeout}\n` + ['first','second'].map(top=>`[[test]]\nname="${top}"\ntop="${top}"\nsources=[{file="tb/테스트 [0].sv"}]\n`).join('');
const config = path.join(directory,'rtl.toml'); await fs.writeFile(config,manifest());
const service = new SimulationService();
const onLog = text => process.stdout.write(text);
const run = async (name='first', events={}) => { const [result] = await service.run({ root:directory, names:[name] }, {onLog,...events}); receipt.results.push(result); return result; };
try {
  const first = await run(); assert.equal(first.status,'passed',first.message);
  assert.match(path.basename(first.waveform),/^rtl_first_[a-f0-9-]+\.vcd$/);
  const trace = await loadRecordedTrace(first); const data = parseVcd(trace.bytes.toString());
  assert.equal(data.end,'17000'); assert.ok(data.signals.some(signal=>signal.path.includes('first.count')));
  assert.match(await fs.readFile(first.log,'utf8'),/FINAL first count=/);
  assert.ok((await fs.readFile(path.join(first.directory,'instrumentation/managed-main.cpp'),'utf8')).includes('trace->open'));
  receipt.checks.push('Production service builds untouched RTL with no dump tokens, records managed VCD and verified input/trace identity, preserves original top and final block');
  const {stdout,stderr} = await promisify(execFile)(process.execPath,[path.join(root,'scripts/rtl.mjs'),'test','first'],{cwd:directory,timeout:120000,maxBuffer:8*1024*1024,windowsHide:true});
  onLog(stderr);
  const [cli]=JSON.parse(stdout);receipt.results.push(cli);assert.equal(cli.status,first.status);
  const cliData=parseVcd((await loadRecordedTrace(cli)).bytes.toString());
  assert.deepEqual(cliData.signals.map(s=>s.path),data.signals.map(s=>s.path));
  assert.equal(cliData.end,data.end); assert.deepEqual(cliData.channels,data.channels);
  receipt.checks.push('Actual CLI test first and host service use identical sources/settings and produce matching status, signal paths and complete VCD transitions');
  await fs.writeFile(config,manifest('fst'));
  const fst=await run('second');assert.equal(fst.status,'passed',fst.message);assert.ok((await loadRecordedTrace(fst)).bytes.length>0);
  assert.match(path.basename(fst.waveform),/^rtl_second_.*\.fst$/);
  receipt.checks.push('Second top in the same file emits an explicitly selected FST with verified retained bytes');
  await fs.writeFile(config,manifest('none','IMMEDIATE="1"',false));
  const off=await run();assert.equal(off.status,'passed',off.message);assert.equal(off.waveform,undefined);
  assert.match(await fs.readFile(off.log,'utf8'),/FINAL first count=7/);
  assert.deepEqual((await fs.readdir(off.directory)).filter(name=>/\.(vcd|fst)$/.test(name)),[]);
  receipt.checks.push('Production timing=false and trace off compile/run with final block and no waveform artifact');
  await fs.writeFile(config,manifest('vcd','STATIC="1"'));
  const staticRun=await run();assert.equal(staticRun.status,'passed',staticRun.message);assert.ok(staticRun.waveform);
  assert.match(await fs.readFile(staticRun.log,'utf8'),/FINAL first count=7/);
  receipt.checks.push('Timing model with no pending events exits normally and executes final while still generating a time-zero trace');
  await fs.writeFile(config,manifest('vcd','FAIL="1"'));
  const failed=await run();assert.equal(failed.status,'failed');assert.match(failed.message,/requested auto failure/);
  assert.ok(failed.waveform);assert.ok((await loadRecordedTrace(failed)).bytes.length>0);
  receipt.checks.push('Actual $fatal produces FAIL with a verified partial managed waveform');
  await fs.writeFile(config,manifest('vcd'));
  let cancelled=false;
  const cancelledRun=await run('first',{onLog:text=>{onLog(text);if(!cancelled && text.includes('g++ ')){cancelled=true;service.cancel();}}});
  assert.ok(cancelled);assert.equal(cancelledRun.status,'cancelled');assert.equal(cancelledRun.waveform,undefined);
  assert.deepEqual((await loadRecordedTrace(first)).bytes,trace.bytes);
  receipt.checks.push('Cancel during real C++ build retains cancellation separately and leaves earlier managed waveform/input bytes readable');
  await fs.appendFile(file,'\nmodule broken; assign = ; endmodule\n');
  const compileFailure=await run();assert.equal(compileFailure.status,'failed');assert.equal(compileFailure.waveform,undefined);
  assert.match(await fs.readFile(compileFailure.log,'utf8'),/테스트 \[0\]\.sv/);
  await fs.writeFile(file,source);
  assert.equal(await fs.readFile(file,'utf8'),source);
  assert.deepEqual((await fs.readdir(directory)).sort(),['.rtl','rtl.toml','tb']);
  receipt.checks.push('Compile failure reports original Unicode filename; owned fixture restored and all generated outputs remain inside .rtl');
  receipt.passed=true;
} catch(error){receipt.error=String(error);process.exitCode=1;}
finally{await fs.writeFile(path.join(directory,'.rtl/acceptance.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify({directory,passed:receipt.passed,checks:receipt.checks,error:receipt.error}));}
