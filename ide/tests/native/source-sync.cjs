const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  const workspace = path.join(fixture, '가져오기 실행 프로젝트');
  const manifest = path.join(workspace, 'rtl.toml'), originalManifest = fs.readFileSync(manifest);
  const originals = ['rtl/연산 [0].sv', 'verification/tb.sv'].map(file => [file, fs.readFileSync(path.join(workspace, file))]);
  const files = ['rtl/sync-helper.sv', 'rtl/sync-header.svh', 'verification/sync-candidate.sv'];
  const receipt = { passed: false, trusted: vscode.workspace.isTrusted, checks: [], scope: 'Real saved-file watcher, workbench command/IPC and rendered UI; physical mouse clicks separate.' };
  const state = () => vscode.commands.executeCommand('rtlIde.simulation.state');
  const until = async (predicate, timeout = 25000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) { const current = await state(); if (predicate(current)) return current; await new Promise(resolve => setTimeout(resolve, 100)); }
    throw Error('Source sync did not settle: ' + JSON.stringify(await state()));
  };
  const originalSelection = current => ({ ids: ['first', 'second'].map(name => {
    const top = current.review.inventory.tops.find(top => top.file === 'verification/tb.sv' && top.top === name); assert.ok(top); return top.id;
  }) });
  try {
    assert.equal(vscode.workspace.isTrusted, true);
    assert.match(originalManifest.toString(), /^# RTL IDE imported execution project v1/);
    assert.match(originalManifest.toString(), /include_dirs = \[\]/, 'Fixture starts without user include overrides');
    for (const file of files) assert.equal(fs.existsSync(path.join(workspace, file)), false, 'Do not overwrite preexisting files');
    const deadline = Date.now() + 30000;
    while (!(await vscode.commands.getCommands(true)).includes('rtlIde.simulation.manage')) { assert.ok(Date.now() < deadline); await new Promise(resolve => setTimeout(resolve, 100)); }
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    await vscode.commands.executeCommand('rtlIde.simulation.refresh');
    let current = await until(s => s.sourceSync?.state === 'matching' && s.rowCount === 2 && s.controls.allEnabled);
    const historyCount = current.history.length, oldRun = current.history.find(result => result.name === 'tb.first' && result.status === 'passed' && result.waveform)?.runId;
    assert.ok(oldRun, 'Retained passing waveform needed for reader preservation');
    fs.writeFileSync(path.join(workspace, files[0]), '`timescale 1ns/1ps\nmodule sync_helper; endmodule\n');
    fs.writeFileSync(path.join(workspace, files[1]), '`define SYNC_HEADER 1\n');
    fs.writeFileSync(path.join(workspace, files[2]), '`timescale 1ns/1ps\nmodule sync_candidate; initial begin #1; $finish; end endmodule\n');
    // Do not enter/refresh/manage or call inputs: only the real file watcher can trigger this comparison.
    current = await until(s => s.sourceSync?.added.includes(files[0]) && s.sourceSync?.added.includes(files[1]) && s.sourceSync?.candidates.some(name => name.endsWith('.sync_candidate')) && s.sourceNotice?.visible);
    assert.match(current.sourceNotice.manageLabel, /변경 확인/);
    assert.ok(current.sourceNotice.details.includes(files[0]));
    assert.deepEqual(fs.readFileSync(manifest), originalManifest);
    receipt.checks.push('Real file watcher detects RTL/header/new TB candidate and renders the notice without changing TOML');

    const doc = await vscode.workspace.openTextDocument(manifest); assert.equal(doc.isDirty, false);
    await vscode.window.showTextDocument(doc);
    const edit = new vscode.WorkspaceEdit(); edit.insert(doc.uri, doc.positionAt(doc.getText().length), '# unsaved verification\n');
    assert.equal(await vscode.workspace.applyEdit(edit), true);
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    current = await until(s => s.dirtyManifest && /미저장/.test(s.sourceNotice?.text));
    await assert.rejects(vscode.commands.executeCommand('rtlIde.simulation.manage'), /미저장/);
    assert.deepEqual(fs.readFileSync(manifest), originalManifest);
    await vscode.window.showTextDocument(doc); await vscode.commands.executeCommand('undo');
    await until(s => !s.dirtyManifest); assert.equal(doc.getText(), originalManifest.toString());
    receipt.checks.push('Unsaved TOML shows the guard and blocks management, preserving disk bytes; controlled edit undone');

    await vscode.commands.executeCommand('rtlIde.showSimulation');
    await vscode.commands.executeCommand('rtlIde.simulation.manage');
    current = await until(s => s.review?.execution && s.reviewSelectedTops.length === 2);
    await vscode.commands.executeCommand('rtlIde.simulation.confirmReview', originalSelection(current));
    current = await until(s => !s.review && s.sourceSync?.state === 'matching' && !s.sourceNotice.visible && s.controls.allEnabled);
    assert.match(fs.readFileSync(manifest, 'utf8'), /sync-helper.sv/);
    assert.equal(current.history.length, historyCount);
    assert.equal(current.tests.length, 2);
    receipt.checks.push('Explicit Apply synchronizes common sources, clears the notice and keeps the unselected candidate unregistered');

    await vscode.commands.executeCommand('rtlIde.simulation.waveform', 'tb.first', oldRun);
    await until(s => s.waveforms[0]?.rendered?.rows > 0);
    // Start through the normal UI command, then change a header during the actual build.
    await vscode.commands.executeCommand('rtlIde.simulation.run', ['tb.first']);
    await until(s => s.phase === 'running' && /g\+\+/.test(s.log), 90000);
    fs.unlinkSync(path.join(workspace, files[1]));
    await new Promise(resolve => setTimeout(resolve, 900));
    current = await state(); assert.equal(current.phase, 'running'); assert.equal(current.sourceSync.state, 'matching');
    await vscode.commands.executeCommand('rtlIde.simulation.cancel');
    current = await until(s => s.phase === 'idle' && s.sourceSync?.removed.includes(files[1]), 90000);
    assert.equal(current.tests[0].latest.status, 'cancelled');
    assert.equal(current.waveforms[0].runId, oldRun);
    assert.equal(current.waveforms[0].rendered.aligned, true);
    receipt.checks.push('File event during real build is deferred until cancellation settles; earlier waveform reader remains intact');

    fs.unlinkSync(path.join(workspace, files[0])); fs.unlinkSync(path.join(workspace, files[2]));
    current = await until(s => s.sourceSync?.removed.includes(files[0]));
    await vscode.commands.executeCommand('rtlIde.simulation.manage');
    current = await until(s => s.review?.execution);
    // H5E1 preserves include overrides; explicitly remove the temporary header directory setting.
    await vscode.commands.executeCommand('rtlIde.simulation.confirmReview', { ...originalSelection(current), includeDirs: [] });
    current = await until(s => !s.review && s.sourceSync?.state === 'matching' && s.controls.allEnabled);
    assert.deepEqual(fs.readFileSync(manifest), originalManifest);
    originals.forEach(([file, bytes]) => assert.deepEqual(fs.readFileSync(path.join(workspace, file)), bytes));
    assert.equal(current.history.length, historyCount + 1);
    assert.equal(current.waveforms[0].runId, oldRun);
    receipt.checks.push('Deleted registered source is detected and repaired via Apply; original config/source bytes and prior history/wave remain');
    receipt.passed = true; receipt.state = current;
  } catch (error) { receipt.error = String(error); throw error; }
  finally { fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2)); }
};
