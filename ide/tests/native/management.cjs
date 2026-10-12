const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  const workspace = path.join(fixture, '가져오기 실행 프로젝트');
  const originalFiles = ['rtl/연산 [0].sv','verification/tb.sv'];
  const original = originalFiles.map(file => fs.readFileSync(path.join(workspace, file)));
  const manifest = path.join(workspace, 'rtl.toml'), originalManifest = fs.readFileSync(manifest);
  const added = ['rtl/managed-helper.sv','verification/additional.sv'];
  const receipt = { passed: false, checks: [], trusted: vscode.workspace.isTrusted, scope: 'Workbench command/IPC/renderer acceptance; physical clicks separate.' };
  const state = () => vscode.commands.executeCommand('rtlIde.simulation.state');
  const until = async (predicate, timeout=20000) => {
    const deadline = Date.now()+timeout;
    while (Date.now()<deadline) { const current=await state(); if(predicate(current))return current; await new Promise(resolve=>setTimeout(resolve,100)); }
    throw Error('Management did not settle: '+JSON.stringify(await state()));
  };
  const idsFor = (current, names) => ({ ids: names.map(name => {
    const top=current.review.inventory.tops.find(top=>top.top===name && top.file.startsWith('verification/')); assert.ok(top); return top.id;
  }) });
  try {
    assert.equal(vscode.workspace.isTrusted,true);
    assert.match(originalManifest.toString(),/^# RTL IDE imported execution project v1/);
    added.forEach(file=>assert.equal(fs.existsSync(path.join(workspace,file)),false,'Never overwrite an existing fixture source'));
    const deadline=Date.now()+30000;
    while(!(await vscode.commands.getCommands(true)).includes('rtlIde.simulation.manage')) { assert.ok(Date.now()<deadline); await new Promise(resolve=>setTimeout(resolve,100)); }
    await vscode.commands.executeCommand('rtlIde.showSimulation'); await vscode.commands.executeCommand('rtlIde.simulation.refresh');
    const initial=await until(s=>s.rowCount===2 && s.controls.allEnabled);
    const oldRun=initial.tests.find(test=>test.name==='tb.first').latest.runId;
    const oldCount=initial.history.length;
    await vscode.commands.executeCommand('rtlIde.simulation.waveform','tb.first',oldRun);
    await until(s=>s.waveforms[0]?.rendered?.rows>0);
    fs.writeFileSync(path.join(workspace,added[0]),'`timescale 1ns/1ps\nmodule helper; endmodule\n');
    fs.writeFileSync(path.join(workspace,added[1]),'`timescale 1ns/1ps\nmodule third; wire y; dut u(y); initial begin $dumpfile("wave.vcd"); $dumpvars(0,third); #1; assert(y===1) else $fatal(1,"bad output"); $finish; end endmodule\n');
    await vscode.commands.executeCommand('rtlIde.simulation.manage');
    let current=await until(s=>s.review?.execution && s.reviewVisible && s.reviewSelectedTops.length===2 && !s.controls.allEnabled);
    assert.equal(current.error,undefined);
    assert.ok(current.review.inventory.sources.some(file=>file.path===added[0]));
    assert.ok(current.review.inventory.tops.some(top=>top.top==='third'));
    assert.deepEqual(fs.readFileSync(manifest),originalManifest);
    receipt.checks.push('Actual management view discovers new source/top, preselects registered tops and pauses Run without writing TOML');
    await vscode.commands.executeCommand('rtlIde.simulation.confirmReview',idsFor(current,['first','third']));
    current=await until(s=>s.rowCount===2 && !s.reviewVisible && s.controls.allEnabled);
    assert.deepEqual(current.tests.map(test=>test.name),['tb.first','additional.third']);
    assert.equal(current.tests[0].latest.runId,oldRun); assert.equal(current.history.length,oldCount);
    assert.match(fs.readFileSync(manifest,'utf8'),/managed-helper.sv/);
    assert.equal(current.waveforms[0].runId,oldRun);
    receipt.checks.push('Actual apply replaces test selection and source list, preserving retained history and the earlier waveform');
    await vscode.commands.executeCommand('rtlIde.simulation.run',['additional.third']);
    await until(s=>s.phase==='running');
    current=await until(s=>s.phase==='idle'||s.phase==='error',90000);
    assert.equal(current.error,undefined); assert.equal(current.tests[1].latest.status,'passed');
    assert.ok(fs.statSync(current.tests[1].latest.waveform).size>0);
    await vscode.commands.executeCommand('rtlIde.simulation.waveform','additional.third');
    current=await until(s=>s.waveforms[1]?.rendered?.rows>0);
    assert.equal(current.waveforms[1].rendered.aligned,true);
    receipt.checks.push('Newly registered top runs with real Verilator and generated VCD renders in the native viewer');
    added.forEach(file=>fs.unlinkSync(path.join(workspace,file)));
    await vscode.commands.executeCommand('rtlIde.simulation.manage');
    current=await until(s=>s.review?.execution && s.reviewVisible);
    await vscode.commands.executeCommand('rtlIde.simulation.confirmReview',idsFor(current,['first','second']));
    current=await until(s=>!s.reviewVisible && s.rowCount===2 && s.tests[1]?.name==='tb.second' && s.controls.allEnabled);
    assert.deepEqual(fs.readFileSync(manifest),originalManifest);
    assert.equal(current.history.length,oldCount+1);
    assert.equal(current.waveforms.length,2); assert.equal(current.waveforms[0].runId,oldRun);
    originalFiles.forEach((file,index)=>assert.deepEqual(fs.readFileSync(path.join(workspace,file)),original[index]));
    receipt.checks.push('Deleted temporary sources/top removed through management; original config/sources restored and all run artifacts/readers retained');
    receipt.passed=true; receipt.state=current;
  } catch(error) { receipt.error=String(error); throw error; }
  finally { fs.writeFileSync(path.join(fixture,'receipt.json'),JSON.stringify(receipt,null,2)); }
};
