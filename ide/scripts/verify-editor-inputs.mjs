// Own production-service fixture: no user source/profile/tool installation writes.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { root } from './environment.mjs';
const require=createRequire(import.meta.url);
const {SimulationService}=require('../dist/runtime/simulation.js');
const {loadRecordedInputs,loadRecordedTrace,readHistory,compareResultInputs}=require('../dist/runtime/core/index.js');
const {parseVcd}=require('../dist/runtime/waveform/vcd.js');
const directory=await fs.mkdtemp(path.join(root,'.dev/h6b1-real-한글 공백-'));
for(const name of ['rtl','tb','inc','pkg'])await fs.mkdir(path.join(directory,name));
const dut=path.join(directory,'rtl/연산 [0].sv'),tb=path.join(directory,'tb/검증.sv'),header=path.join(directory,'inc/value.svh'),pkg=path.join(directory,'pkg/value.sv');
const bench=expected=>'`timescale 1ns/1ps\n`include "value.svh"\n'+['first','second'].map(top=>`module ${top}; wire [7:0] y; dut u(y); initial begin #1; assert(y==${expected}) else $fatal(1,"wrong result %0d",y); $display("VALUE %0d",y); $finish; end endmodule\n`).join('');
await fs.writeFile(dut,'`timescale 1ns/1ps\nmodule dut(output wire [7:0] y); assign y=value_pkg::VALUE; endmodule\n');
await fs.writeFile(tb,bench('`EXPECTED'));await fs.writeFile(header,'`define EXPECTED 1\n');await fs.writeFile(pkg,'`timescale 1ns/1ps\npackage value_pkg; localparam int VALUE=1; endpackage\n');
await fs.writeFile(path.join(directory,'rtl.toml'),'version=1\n[project]\nname="editor inputs"\n[sources]\nrtl=["rtl/*.sv"]\npackages=["pkg/*.sv"]\npackage_order="manifest"\ninclude_dirs=["inc"]\n[simulation]\nwaveform="vcd"\ntimeout_ms=120000\n'+['first','second'].map(top=>`[[test]]\nname="${top}"\ntop="${top}"\nsources=["tb/*.sv"]\n`).join(''));
const originals=await Promise.all([dut,tb,header,pkg,path.join(directory,'rtl.toml')].map(async file=>[file,await fs.readFile(file)]));
const receipt={directory,passed:false,checks:[],results:[]};const service=new SimulationService();
const run=async request=>{const results=await service.run({root:directory,...request},{onLog:text=>process.stdout.write(text)});receipt.results.push(...results);return results;};
try{
  const [baseline]=await run({names:['first']});assert.equal(baseline.status,'passed',baseline.message);
  const oldTrace=(await loadRecordedTrace(baseline)).bytes;assert.match(await fs.readFile(baseline.log,'utf8'),/VALUE 1/);
  const inputs=[{path:pkg,text:'`timescale 1ns/1ps\npackage value_pkg; localparam int VALUE=2; endpackage\n',version:6},{path:header,text:'`define EXPECTED 2\n',version:9},{path:tb,text:bench('`EXPECTED'),version:4}];
  const executing=run({inputOverrides:inputs});inputs[0].text='invalid mutation after request';inputs.length=0;
  const edited=await executing;
  assert.equal(edited.length,2);
  for(const result of edited){
    assert.equal(result.status,'passed',result.message);assert.match(await fs.readFile(result.log,'utf8'),/VALUE 2/);
    const recorded=await loadRecordedInputs(result);assert.equal(recorded.overrides.length,3);assert.equal(recorded.overrides.find(input=>input.path===pkg).version,6);
    assert.match(await fs.readFile(recorded.project.sources[0],'utf8'),/VALUE=2/);
    const data=parseVcd((await loadRecordedTrace(result)).bytes.toString());
    assert.ok(data.signals.some(signal=>signal.path.includes(result.top+'.y') && data.channels.get(signal.code).some(change=>change.value==='00000010')));
    assert.equal((await compareResultInputs(result,await service.inspect(directory))).state,'changed');
  }
  receipt.checks.push('Real sequential two-top execution uses frozen package/header/TB buffers, emits VALUE 2 VCD and retains document versions without saving originals');
  const [invalid]=await run({names:['first'],inputOverrides:[{path:tb,text:'module first; assign = ; endmodule',version:10}]});
  assert.equal(invalid.status,'failed');assert.equal(invalid.waveform,undefined);assert.match(await fs.readFile(invalid.log,'utf8'),/검증\.sv/);
  const invalidInputs=await loadRecordedInputs(invalid);assert.equal(await fs.readFile(invalidInputs.target.sources[0],'utf8'),'module first; assign = ; endmodule');
  receipt.checks.push('Invalid unsaved TB produces compile FAIL with original filename and recorded bad text; saved valid source is never substituted');
  const [saved]=await run({names:['first']});assert.equal(saved.status,'passed',saved.message);assert.match(await fs.readFile(saved.log,'utf8'),/VALUE 1/);
  assert.equal(saved.inputSnapshot.unsavedFiles,undefined);assert.deepEqual((await loadRecordedTrace(baseline)).bytes,oldTrace);
  for(const [file,bytes]of originals)assert.deepEqual(await fs.readFile(file),bytes);
  const history=await readHistory(directory);assert.equal(history.length,5);assert.equal(history.filter(result=>result.inputSnapshot.unsavedFiles?.length===3).length,2);
  assert.deepEqual((await fs.readdir(directory)).sort(),['.rtl','inc','pkg','rtl','rtl.toml','tb']);
  receipt.checks.push('Disk-only execution remains VALUE 1; original RTL/TOML bytes, earlier trace and five independent recorded histories survive all edits');
  receipt.passed=true;
}catch(error){receipt.error=String(error);process.exitCode=1;}
finally{await fs.mkdir(path.join(directory,'.rtl'),{recursive:true});await fs.writeFile(path.join(directory,'.rtl/acceptance.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify({directory,passed:receipt.passed,checks:receipt.checks,error:receipt.error}));}
