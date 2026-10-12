const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  const workspace = path.join(fixture, '가져오기 실행 프로젝트');
  const files = ['rtl/연산 [0].sv', 'verification/tb.sv'];
  const original = files.map(file => fs.readFileSync(path.join(workspace, file)));
  const receipt = { passed: false, trusted: vscode.workspace.isTrusted, checks: [], scope: 'Actual workbench command/IPC/renderer acceptance; physical clicks are separate.' };
  const state = () => vscode.commands.executeCommand('rtlIde.simulation.state');
  const until = async (predicate, timeout = 15000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) { const current = await state(); if (predicate(current)) return current; await new Promise(resolve => setTimeout(resolve, 100)); }
    throw Error('Import/run/waveform state did not settle: ' + JSON.stringify(await state()));
  };
  try {
    assert.equal(vscode.workspace.isTrusted, true, 'Human must trust the private fixture first.');
    const deadline = Date.now() + 30000;
    while (!(await vscode.commands.getCommands(true)).includes('rtlIde.showSimulation')) {
      assert.ok(Date.now() < deadline); await new Promise(resolve => setTimeout(resolve, 100));
    }
    const resume = process.env.RTL_IDE_IMPORT_RESUME === '1';
    receipt.resumedRegisteredProject = resume;
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    await vscode.commands.executeCommand('rtlIde.simulation.refresh');
    if (!resume) {
    assert.equal(fs.existsSync(path.join(workspace, 'rtl.toml')), false, 'Use a fresh prepared fixture; never overwrite an earlier registered project.');
    await until(s => s.reviewVisible && s.phase === 'idle');
    await vscode.commands.executeCommand('rtlIde.simulation.classify', { folders: [{ path: 'verification', role: 'simulation' }] });
    let current = await until(s => s.review?.folders[0]?.role === 'simulation' && s.phase === 'idle');
    const selection = { ids: current.review.inventory.tops.filter(top => top.file === 'verification/tb.sv').map(top => top.id) };
    assert.equal(selection.ids.length, 2);
    await vscode.commands.executeCommand('rtlIde.simulation.prepareReview', selection);
    current = await until(s => s.importPreview?.tests.length === 2 && s.phase === 'idle');
    assert.deepEqual(current.importPreview.tests.map(test => test.name), ['tb.first', 'tb.second']);
    assert.equal(fs.existsSync(path.join(workspace, 'rtl.toml')), false);
    receipt.checks.push('Trusted actual UI/IPC selects and semantically verifies two file.top candidates without writes');
    await vscode.commands.executeCommand('rtlIde.simulation.confirmReview', selection);
    current = await until(s => s.tests.length === 2 && !s.reviewVisible && s.phase === 'idle');
    assert.equal(current.error, undefined); assert.equal(current.controls.allEnabled, true);
    assert.equal(current.rowCount, 2); assert.match(fs.readFileSync(path.join(workspace, 'rtl.toml'), 'utf8'), /imported execution project/);
    receipt.checks.push('Actual registration publishes executable TOML and renders two enabled test rows');
    } else {
      assert.match(fs.readFileSync(path.join(workspace, 'rtl.toml'), 'utf8'), /^# RTL IDE imported execution project v1/);
      const restored = await until(s => s.tests.length === 2 && !s.reviewVisible && s.phase === 'idle' && s.rowCount === 2 && s.controls.allEnabled);
      assert.deepEqual(restored.tests.map(test => test.name), ['tb.first', 'tb.second']);
      assert.equal(restored.rowCount, 2); assert.equal(restored.controls.allEnabled, true);
      receipt.checks.push('Previously registered owned fixture reloads two executable tests; no reimport or TOML rewrite');
    }
    const run = async names => {
      const before = (await state()).history?.length ?? 0;
      // Extension command serialization turns an explicit undefined argument
      // into null. Omit it to exercise the same call as the Run All button.
      if (names === undefined) await vscode.commands.executeCommand('rtlIde.simulation.run');
      else await vscode.commands.executeCommand('rtlIde.simulation.run', names);
      await until(s => s.phase === 'running', 10000);
      await vscode.commands.executeCommand('rtlIde.showCode'); await vscode.commands.executeCommand('rtlIde.showSimulation');
      const done = await until(s => s.phase === 'idle' || s.phase === 'error', names?.length === 1 ? 90000 : 150000);
      assert.equal(done.error, undefined);
      const count = names?.length ?? 2;
      assert.equal(done.history.length, before + count);
      for (const test of done.tests.filter(test => !names || names.includes(test.name))) {
        assert.equal(test.latest.status, 'passed', test.latest.message);
        assert.ok(fs.statSync(test.latest.waveform).size > 0);
      }
    };
    await run(['tb.first']); receipt.checks.push('Actual individual Verilator run PASS/VCD through renderer, surviving Code/Simulation switching');
    await vscode.commands.executeCommand('rtlIde.simulation.waveform', 'tb.first');
    let current = await until(s => s.waveforms[0]?.rendered?.rows > 0);
    const firstRun = current.waveforms[0].runId;
    assert.equal(current.waveforms[0].rendered.aligned, true);
    receipt.checks.push('Generated VCD opens in native sandbox waveform and renders aligned rows');
    await run(['tb.second', 'tb.first']); await run(undefined);
    current = await state(); assert.equal(current.waveforms[0].runId, firstRun);
    await vscode.commands.executeCommand('rtlIde.simulation.waveform', 'tb.first');
    current = await until(s => s.waveforms.length === 2 && s.waveforms[1]?.rendered?.rows > 0);
    assert.notEqual(current.waveforms[1].runId, firstRun);
    receipt.checks.push('Actual selected/all runs PASS; earlier waveform remains tied to its original run, newest opens separately');
    files.forEach((file, index) => assert.deepEqual(fs.readFileSync(path.join(workspace, file)), original[index]));
    assert.deepEqual(fs.readdirSync(workspace).sort(), ['.rtl', 'rtl', 'rtl.toml', 'verification']);
    receipt.checks.push('Original RTL bytes unchanged and generated project artifacts remain inside .rtl');
    receipt.passed = true; receipt.state = await state();
  } catch (error) { receipt.error = String(error); throw error; }
  finally { fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2)); }
};
