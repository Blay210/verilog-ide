const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  const root = vscode.workspace.workspaceFolders[0].uri;
  const original = ['rtl.toml', 'verification/tb.sv', 'rtl/연산 [0].sv'].map(file => [path.join(root.fsPath, file), fs.readFileSync(path.join(root.fsPath, file))]);
  const receipt = { passed: false, trusted: vscode.workspace.isTrusted, checks: [], scope: 'Actual workbench commands/IPC/renderer with real Verilator and existing explicit dumps; physical clicks separate. No-dump RTL is independently verified through production service/CLI.' };
  const state = () => vscode.commands.executeCommand('rtlIde.simulation.state');
  const until = async (predicate, timeout = 120000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) { const s = await state(); if (predicate(s)) return s; await new Promise(resolve => setTimeout(resolve, 100)); }
    throw Error('Auto waveform state did not settle: ' + JSON.stringify(await state()));
  };
  try {
    assert.equal(vscode.workspace.isTrusted, true);
    const deadline = Date.now() + 30000;
    while (!(await vscode.commands.getCommands(true)).includes('rtlIde.simulation.state')) { assert.ok(Date.now() < deadline); await new Promise(resolve => setTimeout(resolve, 100)); }
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    await vscode.commands.executeCommand('rtlIde.simulation.refresh');
    const initial = await until(s => s.project && s.phase === 'idle');
    const prior = initial.history.find(run => run.status === 'passed' && run.waveform);
    assert.ok(prior); const priorBytes = fs.readFileSync(prior.waveform);
    await vscode.commands.executeCommand('rtlIde.simulation.waveform', prior.name, prior.runId);
    await until(s => s.waveforms.some(wave => wave.runId === prior.runId && wave.rendered?.rows > 0));
    await vscode.commands.executeCommand('rtlIde.simulation.run', ['tb.second']);
    let current = await until(s => s.phase === 'idle' && s.history.length === initial.history.length + 1);
    const latest = current.tests.find(test => test.name === 'tb.second').latest;
    const result = JSON.parse(fs.readFileSync(path.join(path.dirname(latest.waveform || latest.log), 'result.json'), 'utf8'));
    assert.equal(result.status, 'passed', result.message);
    assert.match(path.basename(result.waveform), /^rtl_second_[a-f0-9-]+\.vcd$/);
    assert.equal(result.traceIdentity.state, 'ready');
    assert.ok(fs.statSync(path.join(result.directory, 'wave.vcd')).size > 0);
    receipt.checks.push('Real GUI runner emits both untouched legacy dump and managed VCD; result selects only the explicitly declared managed trace');
    await vscode.commands.executeCommand('rtlIde.simulation.waveform', 'tb.second', result.runId);
    current = await until(s => s.waveforms.some(wave => wave.runId === result.runId && wave.rendered?.rows > 0));
    assert.equal(current.waveforms.find(wave => wave.runId === result.runId).rendered.aligned, true);
    assert.ok(current.waveforms.some(wave => wave.runId === prior.runId));
    receipt.checks.push('New managed trace renders aligned rows in the actual internal viewer while the previous run tab remains');
    await vscode.commands.executeCommand('rtlIde.showCode');
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    current = await state();
    assert.ok(current.waveforms.some(wave => wave.runId === result.runId));
    assert.deepEqual(fs.readFileSync(prior.waveform), priorBytes);
    original.forEach(([file, bytes]) => assert.deepEqual(fs.readFileSync(file), bytes));
    receipt.checks.push('Code/Simulation switching retains run tabs, previous waveform bytes and all original config/RTL bytes');
    receipt.passed = true; receipt.state = current;
  } catch (error) { receipt.error = String(error); throw error; }
  finally {
    try {
      const s = await state();
      if (['running', 'cancelling'].includes(s.phase)) { await vscode.commands.executeCommand('rtlIde.simulation.cancel'); await until(s => !['running', 'cancelling'].includes(s.phase)); }
    } catch (error) { receipt.cleanupError = String(error); }
    fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2));
  }
};
