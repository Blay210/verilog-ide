const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  const root = vscode.workspace.workspaceFolders[0].uri;
  const folder = vscode.Uri.joinPath(root, 'verification');
  const tb = vscode.Uri.joinPath(folder, 'tb.sv');
  const manifest = vscode.Uri.joinPath(root, 'rtl.toml');
  const originals = [manifest, tb].map(uri => [uri.fsPath, fs.readFileSync(uri.fsPath)]);
  const receipt = { passed: false, trusted: vscode.workspace.isTrusted, checks: [], scope: 'Real folder commands/IPC, Explorer DOM badges and review state; physical context menu separate.' };
  const state = () => vscode.commands.executeCommand('rtlIde.simulation.state');
  const until = async predicate => {
    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) { const value = await state(); if (predicate(value)) return value; await new Promise(resolve => setTimeout(resolve, 100)); }
    throw Error('Folder review did not settle: ' + JSON.stringify(await state()));
  };
  try {
    assert.equal(vscode.workspace.isTrusted, true);
    const deadline = Date.now() + 30000;
    while (!(await vscode.commands.getCommands(true)).includes('rtlIde.explorer.folder.simulation')) { assert.ok(Date.now() < deadline); await new Promise(resolve => setTimeout(resolve, 100)); }
    const initial = await until(s => s.project && s.phase === 'idle');
    assert.equal((await vscode.workspace.openTextDocument(manifest)).isDirty, false);
    await assert.rejects(vscode.commands.executeCommand('rtlIde.explorer.folder.simulation', tb), /폴더/);
    await assert.rejects(vscode.commands.executeCommand('rtlIde.explorer.folder.simulation', vscode.Uri.file(path.dirname(root.fsPath))), /프로젝트/);
    receipt.checks.push('Files and outside-root folders are rejected before opening management or writing');
    await vscode.commands.executeCommand('rtlIde.explorer.folder.simulation', folder);
    let current = await until(s => s.review?.folders.some(entry => entry.path === 'verification' && entry.role === 'simulation'));
    assert.ok(current.review.inventory.sources.find(source => source.path === 'verification/tb.sv').role === 'simulation');
    assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).activeSpace, 'simulation');
    assert.equal(current.history.length, initial.history.length);
    originals.forEach(([file, bytes]) => assert.deepEqual(fs.readFileSync(file), bytes));
    receipt.checks.push('Registered project enters managed review; folder classification changes candidates without changing TOML, sources or history');
    await vscode.commands.executeCommand('rtlIde.showCode');
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(tb));
    await vscode.commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
    let explorer;
    for (let i = 0; i < 100; i++) {
      explorer = await vscode.commands.executeCommand('rtlIde.explorer.state');
      if (explorer.folders.some(badge => badge.resource === folder.toString() && badge.role === 'simulation')) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(explorer.folders.some(badge => badge.resource === folder.toString() && badge.role === 'simulation'));
    assert.ok(!explorer.folders.some(badge => badge.resource === tb.toString()));
    receipt.checks.push('Actual Explorer folder shows role icon/description, with no folder badge on TB file');
    await vscode.commands.executeCommand('rtlIde.explorer.folder.inherit', folder);
    current = await until(s => s.review && !s.review.folders.some(entry => entry.path === 'verification'));
    await vscode.commands.executeCommand('rtlIde.simulation.refresh');
    current = await until(s => s.project && !s.review);
    assert.deepEqual(current.tests.map(test => test.name), initial.tests.map(test => test.name));
    originals.forEach(([file, bytes]) => assert.deepEqual(fs.readFileSync(file), bytes));
    assert.equal(current.history.length, initial.history.length);
    receipt.checks.push('Reset removes only explicit folder rule; refresh discards draft and restores original runnable targets/history');
    receipt.passed = true;
  } catch (error) { receipt.error = String(error); throw error; }
  finally {
    try { const s = await state(); if (s?.review) await vscode.commands.executeCommand('rtlIde.simulation.refresh'); } catch (error) { receipt.cleanupError = String(error); }
    fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2));
  }
};
