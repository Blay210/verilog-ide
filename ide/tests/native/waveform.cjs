const vscode = require('vscode');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  const receipt = { passed: false, checks: [], trace: 'recorded synthetic fixture, not a new real Verilator run', trusted: vscode.workspace.isTrusted };
  const state = () => vscode.commands.executeCommand('rtlIde.simulation.state');
  async function rendered() {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      const current = await state(); if (current.waveforms?.[0]?.rendered?.rows > 0) return current;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw Error('Sandbox waveform did not render.');
  }
  try {
    const commandDeadline = Date.now() + 30000;
    while (!(await vscode.commands.getCommands(true)).includes('rtlIde.showSimulation')) {
      if (Date.now() > commandDeadline) throw Error('RTL workbench commands did not become available.');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    await vscode.commands.executeCommand('rtlIde.simulation.refresh');
    let before;
    const loadedDeadline = Date.now() + 15000;
    while (Date.now() < loadedDeadline) { before = await state(); if (before.tests[0]?.latest?.inputs) break; await new Promise(resolve => setTimeout(resolve, 100)); }
    const runId = before.tests[0].latest.runId;
    assert.equal(before.history.length, 2);
    assert.equal(before.results[0].historyCount, 2);
    assert.equal(before.tests[0].latest.inputs.state, 'matching');
    receipt.checks.push('Two retained runs populate the per-test history selector with saved-input comparison');
    await vscode.commands.executeCommand('rtlIde.simulation.waveform', 'counter_basic');
    const view = await rendered();
    assert.equal(view.waveforms[0].runId, runId); assert.equal(view.waveforms[0].signals, 2);
    assert.equal(view.waveforms[0].rendered.rows, 9); assert.equal(view.waveforms[0].rendered.aligned, true);
    receipt.checks.push('Actual native iframe/IPC renders the saved default bus plus eight bit rows with ruler alignment');
    await vscode.commands.executeCommand('rtlIde.showCode'); await vscode.commands.executeCommand('rtlIde.showSimulation');
    assert.equal((await state()).waveforms[0].runId, runId);
    assert.equal((await state()).waveforms[0].visible, true);
    await vscode.commands.executeCommand('rtlIde.simulation.waveform', 'counter_basic', runId);
    assert.equal((await state()).waveforms.length, 1);
    receipt.checks.push('Code round trip preserves waveform reader/tab; opening same run reuses it');
    const source = vscode.Uri.file(path.join(fixture, 'simulation-project/rtl/counter.sv'));
    const document = await vscode.workspace.openTextDocument(source);
    const edit = new vscode.WorkspaceEdit(); edit.insert(source, new vscode.Position(0, 0), '// history/stale acceptance\n');
    await vscode.workspace.applyEdit(edit);
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.match((await state()).results[0].warning, /미저장/);
    await document.save();
    const deadline = Date.now() + 10000;
    let changed;
    while (Date.now() < deadline) { changed = await state(); if (changed.tests[0].latest.inputs.state === 'changed' && /코드 변경/.test(changed.results[0].warning)) break; await new Promise(resolve => setTimeout(resolve, 100)); }
    assert.equal(changed.tests[0].latest.inputs.state, 'changed');
    assert.match(changed.results[0].warning, /코드 변경/);
    assert.equal(changed.waveforms[0].runId, runId); assert.equal(changed.waveforms[0].rendered.rows, 9);
    receipt.checks.push('Unsaved badge becomes saved-input stale after Save; existing waveform run/default state stays unchanged');
    receipt.state = await state(); receipt.passed = true;
  } catch (error) { receipt.error = String(error); receipt.state = await state(); throw error; }
  finally { fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2)); }
};
