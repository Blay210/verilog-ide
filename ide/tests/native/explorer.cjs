const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  const root = vscode.workspace.workspaceFolders[0].uri;
  const tb = vscode.Uri.joinPath(root, 'verification', 'tb.sv');
  const dut = vscode.Uri.joinPath(root, 'rtl', '연산 [0].sv');
  const manifest = vscode.Uri.joinPath(root, 'rtl.toml');
  const original = [tb, dut, manifest].map(uri => [uri.fsPath, fs.readFileSync(uri.fsPath)]);
  const receipt = { passed: false, trusted: vscode.workspace.isTrusted, checks: [], scope: 'Actual Explorer row layout/DOM click, QuickPick commands and IPC; physical mouse hover/click separate.' };
  const state = async () => ({ simulation: await vscode.commands.executeCommand('rtlIde.simulation.state'), explorer: await vscode.commands.executeCommand('rtlIde.explorer.state'), space: await vscode.commands.executeCommand('rtlIde.spaceState') });
  const until = async (predicate, timeout = 30000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) { const s = await state(); if (predicate(s)) return s; await new Promise(resolve => setTimeout(resolve, 100)); }
    const s = await state(); throw Error('Explorer state did not settle: ' + JSON.stringify({ phase: s.simulation.phase, error: s.simulation.error, explorer: s.explorer, space: s.space.activeSpace }));
  };
  const row = s => s.explorer.rows.find(row => row.resource === tb.toString());
  try {
    assert.equal(vscode.workspace.isTrusted, true);
    const deadline = Date.now() + 30000;
    while (!(await vscode.commands.getCommands(true)).includes('rtlIde.explorer.state')) { assert.ok(Date.now() < deadline); await new Promise(resolve => setTimeout(resolve, 100)); }
    const recovery = await vscode.workspace.openTextDocument(manifest);
    if (recovery.isDirty) {
      assert.equal(recovery.getText(), original[2][1].toString() + '# unsaved explorer verification\n', 'Only revert the exact edit retained by this acceptance test');
      await vscode.window.showTextDocument(recovery);
      await vscode.commands.executeCommand('workbench.action.files.revert');
      assert.equal(recovery.isDirty, false);
    }
    await vscode.commands.executeCommand('rtlIde.showCode');
    // No Simulation entry/refresh: registration is initialized in the Code space.
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(tb));
    await vscode.commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
    let current = await until(s => row(s) && !row(s).hidden && !row(s).disabled && row(s).width > 0);
    assert.equal(current.space.activeSpace, 'code');
    assert.match(row(current).label, /2개/);
    assert.equal(row(current).opacity, '1');
    assert.equal(row(current).width, 22);
    assert.ok(current.explorer.rows.filter(row => !row.hidden).every(row => row.resource === tb.toString()));
    receipt.checks.push('Code startup recognizes registered tops; focused actual TB row has a 22px action and other files/folders do not');
    const initialHistory = current.simulation.history.length;
    await vscode.commands.executeCommand('rtlIde.explorer.activateRun', tb);
    await until(s => s.explorer.pickerVisible);
    await vscode.commands.executeCommand('workbench.action.closeQuickOpen');
    current = await until(s => !s.explorer.pickerVisible);
    assert.equal(current.simulation.phase, 'idle'); assert.equal(current.simulation.history.length, initialHistory); assert.equal(current.space.activeSpace, 'code');
    receipt.checks.push('Actual row click opens the multi-top picker; cancellation runs nothing and preserves Code');

    const doc = await vscode.workspace.openTextDocument(manifest); assert.equal(doc.isDirty, false);
    await vscode.window.showTextDocument(doc);
    const edit = new vscode.WorkspaceEdit(); edit.insert(doc.uri, doc.positionAt(doc.getText().length), '# unsaved explorer verification\n');
    assert.equal(await vscode.workspace.applyEdit(edit), true);
    current = await until(s => s.simulation.dirtyManifest && row(s)?.disabled);
    await assert.rejects(vscode.commands.executeCommand('rtlIde.explorer.activateRun', tb), /활성화/);
    assert.deepEqual(fs.readFileSync(manifest.fsPath), original[2][1]);
    await vscode.commands.executeCommand('undo');
    await until(s => !s.simulation.dirtyManifest && !row(s)?.disabled);
    receipt.checks.push('Unsaved TOML disables the real row button and blocks activation without writing the manifest');

    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(tb));
    await vscode.commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
    await vscode.commands.executeCommand('rtlIde.explorer.activateRun', tb);
    await until(s => s.explorer.pickerVisible);
    await vscode.commands.executeCommand('workbench.action.quickOpenSelectNext');
    await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
    current = await until(s => s.simulation.phase === 'running' && s.simulation.activeTest === 'tb.second', 90000);
    assert.equal(current.space.activeSpace, 'simulation');
    // The hidden Explorer may dispose virtual rows. Reopen Code to check its live action.
    await vscode.commands.executeCommand('rtlIde.showCode');
    await vscode.commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
    await until(s => row(s)?.disabled && s.simulation.phase === 'running');
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    current = await until(s => s.simulation.phase === 'idle' || s.simulation.phase === 'error', 90000);
    assert.equal(current.simulation.error, undefined);
    const result = current.simulation.tests.find(test => test.name === 'tb.second').latest;
    assert.equal(result.status, 'passed'); assert.ok(fs.statSync(result.waveform).size > 0);
    assert.equal(current.simulation.history.length, initialHistory + 1);
    receipt.checks.push('Selecting the second top starts exactly tb.second through the shared real Verilator runner and produces VCD');
    await vscode.commands.executeCommand('rtlIde.showCode');
    await until(s => !row(s)?.disabled);
    await assert.rejects(vscode.commands.executeCommand('rtlIde.simulation.runFile', dut), /등록된/);
    assert.equal((await state()).simulation.history.length, initialHistory + 1);
    original.forEach(([file, bytes]) => assert.deepEqual(fs.readFileSync(file), bytes));
    receipt.checks.push('Action re-enables after completion; unregistered RTL is rejected and all original source/config bytes remain');
    receipt.passed = true; receipt.state = await state();
  } catch (error) { receipt.error = String(error); throw error; }
  finally {
    // A failed assertion must not leave the quit confirmation waiting on a running build.
    try {
      const s = await state();
      if (['running', 'cancelling'].includes(s.simulation.phase)) {
        await vscode.commands.executeCommand('rtlIde.simulation.cancel');
        await until(s => !['running', 'cancelling'].includes(s.simulation.phase), 90000);
      }
    } catch (cleanupError) { receipt.cleanupError = String(cleanupError); }
    fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2));
  }
};
