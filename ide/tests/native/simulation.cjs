const vscode = require('vscode');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  const receipt = { passed: false, checks: [], trusted: vscode.workspace.isTrusted, executionAccepted: false };
  async function state() { return vscode.commands.executeCommand('rtlIde.simulation.state'); }
  async function until(predicate, timeout = 10000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const current = await state(); if (predicate(current)) return current;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw Error('Simulation state did not settle.');
  }
  try {
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    await vscode.commands.executeCommand('rtlIde.simulation.refresh');
    const loaded = await until(s => s.tests.length === 2 && s.rowCount === 2);
    assert.equal(loaded.project, 'counter');
    assert.deepEqual(loaded.tests.map(t => t.name), ['counter_basic', 'counter_reset']);
    receipt.checks.push('Renderer home loads two tests through actual shared-process IPC');
    const document = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(fixture, 'simulation-project/rtl/counter.sv')));
    await vscode.window.showTextDocument(document);
    const edit = new vscode.WorkspaceEdit(); edit.insert(document.uri, new vscode.Position(0, 0), '// native unsaved probe\n');
    await vscode.workspace.applyEdit(edit);
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    assert.equal(document.isDirty, true);
    if (!vscode.workspace.isTrusted) {
      assert.equal((await state()).controls.allEnabled, false);
      await vscode.commands.executeCommand('rtlIde.simulation.run', ['counter_basic']);
      assert.equal((await state()).phase, 'idle');
      assert.equal(fs.existsSync(path.join(fixture, 'simulation-project/.rtl')), false);
      receipt.checks.push('Untrusted workspace execution is blocked; no outputs or source auto-save');
      receipt.remaining = 'Trusted GUI Run/Cancel requires user workspace trust; no trust settings changed.';
    } else {
      await vscode.commands.executeCommand('rtlIde.simulation.run', ['counter_basic']);
      await until(s => s.phase === 'running');
      await vscode.commands.executeCommand('rtlIde.showCode');
      assert.equal(document.isDirty, true);
      await vscode.commands.executeCommand('rtlIde.showSimulation');
      const completed = await until(s => s.phase === 'idle' || s.phase === 'error', 75000);
      assert.equal(completed.tests[0].latest.status, 'passed', completed.error);
      assert.ok(completed.tests[0].latest.waveform.endsWith('.vcd'));
      receipt.executionAccepted = true;
      receipt.checks.push('Trusted real Verilator run survives space switching; retained result/waveform displayed');
      await vscode.commands.executeCommand('rtlIde.simulation.run', ['counter_reset']);
      await until(s => s.activeTest === 'counter_reset');
      await vscode.commands.executeCommand('rtlIde.simulation.cancel');
      const cancelled = await until(s => s.phase === 'idle' || s.phase === 'error');
      assert.equal(cancelled.tests[1].latest.status, 'cancelled');
      receipt.checks.push('Renderer cancellation waits for actual build cleanup and retains cancellation');
    }
    assert.equal(document.isDirty, true);
    assert.doesNotMatch(fs.readFileSync(document.uri.fsPath, 'utf8'), /native unsaved probe/);
    receipt.checks.push('Dirty source preserved, disk remains unchanged');
    receipt.state = await state(); receipt.passed = true;
  } catch (error) { receipt.error = String(error); throw error; }
  finally { fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2)); }
};
