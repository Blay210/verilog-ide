const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  const restoring = process.env.RTL_IDE_FOLDER_RESTORE === '1';
  const root = vscode.workspace.workspaceFolders[0].uri;
  const rtl = vscode.Uri.joinPath(root, 'rtl');
  const dut = vscode.Uri.joinPath(rtl, '연산 [0].sv');
  const manifest = vscode.Uri.joinPath(root, 'rtl.toml');
  const marker = path.join(fixture, 'h5g2-original.json');
  const receipt = { passed: false, trusted: vscode.workspace.isTrusted, stage: restoring ? 'fresh-process-restore' : 'apply', checks: [], scope: 'Real app commands/IPC/DOM badges and separate process restart; physical menu separate.' };
  const state = () => vscode.commands.executeCommand('rtlIde.simulation.state');
  const until = async predicate => {
    const deadline = Date.now() + 90000;
    while (Date.now() < deadline) { const value = await state(); if (predicate(value)) return value; await new Promise(resolve => setTimeout(resolve, 100)); }
    throw Error('Saved-folder state did not settle: ' + JSON.stringify(await state()));
  };
  const showBadge = async (label) => {
    await vscode.commands.executeCommand('rtlIde.showCode');
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(dut));
    await vscode.commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
    for (let i = 0; i < 100; i++) {
      const explorer = await vscode.commands.executeCommand('rtlIde.explorer.state');
      const badge = explorer.folders.find(b => b.resource === rtl.toString());
      if (badge && badge.role === 'source' && badge.title.includes(label)) return badge;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw Error('Actual RTL folder badge missing: ' + label);
  };
  const selection = review => ({ ids: review.inventory.tops.filter(top => review.execution.tests.some(test => test.file === top.file && test.top === top.top)).map(top => top.id), includeDirs: review.execution.includeDirs, defines: review.execution.defines });
  try {
    assert.equal(vscode.workspace.isTrusted, true);
    const deadline = Date.now() + 30000;
    while (!(await vscode.commands.getCommands(true)).includes('rtlIde.explorer.folder.source')) { assert.ok(Date.now() < deadline); await new Promise(resolve => setTimeout(resolve, 100)); }
    let current = await until(s => s.project && s.phase === 'idle' && s.savedFolderRoles);
    assert.equal((await vscode.workspace.openTextDocument(manifest)).isDirty, false);
    if (!restoring) {
      assert.equal(fs.existsSync(marker), false, 'Keep an unfinished acceptance baseline intact; recover explicitly first');
      await vscode.commands.executeCommand('rtlIde.simulation.manage');
      current = await until(s => s.review?.execution);
      fs.writeFileSync(marker, JSON.stringify({ manifest: fs.readFileSync(manifest.fsPath).toString('base64'), dut: fs.readFileSync(dut.fsPath).toString('base64'), folders: current.review.folders, files: current.review.files, history: current.history.length, names: current.tests.map(test => test.name) }));
      await vscode.commands.executeCommand('rtlIde.explorer.folder.source', rtl);
      await showBadge('적용 전 검토');
      receipt.checks.push('Folder role draft shows review label before explicit Apply');
      current = await state();
      await vscode.commands.executeCommand('rtlIde.simulation.confirmReview', selection(current.review));
      current = await until(s => s.project && !s.review && s.savedFolderRoles?.folders.some(entry => entry.path === 'rtl' && entry.role === 'source'));
      assert.equal(current.error, undefined); await showBadge('저장됨');
      const baseline = JSON.parse(fs.readFileSync(marker));
      assert.equal(current.history.length, baseline.history);
      assert.equal(fs.readFileSync(dut.fsPath).toString('base64'), baseline.dut);
      assert.notEqual(fs.readFileSync(manifest.fsPath).toString('base64'), baseline.manifest);
      receipt.checks.push('Explicit Apply retains source/history and publishes saved role badge with runnable project');
      await vscode.commands.executeCommand('rtlIde.simulation.refresh');
      await until(s => s.project && s.savedFolderRoles?.folders.some(entry => entry.path === 'rtl')); await showBadge('저장됨');
      receipt.checks.push('Refresh reads canonical saved classification and preserves the actual badge');
    } else {
      const baseline = JSON.parse(fs.readFileSync(marker));
      assert.ok(current.savedFolderRoles.folders.some(entry => entry.path === 'rtl' && entry.role === 'source'));
      assert.equal(current.review, undefined); await showBadge('저장됨');
      assert.equal(current.history.length, baseline.history);
      assert.equal(fs.readFileSync(dut.fsPath).toString('base64'), baseline.dut);
      receipt.checks.push('Fresh native process restores saved RTL badge in Code without entering management');
      await vscode.commands.executeCommand('rtlIde.simulation.manage');
      await vscode.commands.executeCommand('rtlIde.simulation.classify', { folders: baseline.folders, files: baseline.files });
      current = await state();
      await vscode.commands.executeCommand('rtlIde.simulation.confirmReview', selection(current.review));
      current = await until(s => s.project && !s.review && !s.savedFolderRoles?.folders.some(entry => entry.path === 'rtl'));
      assert.equal(current.error, undefined);
      assert.equal(current.history.length, baseline.history);
      assert.deepEqual(current.tests.map(test => test.name), baseline.names);
      assert.equal(fs.readFileSync(manifest.fsPath).toString('base64'), baseline.manifest);
      assert.equal(fs.readFileSync(dut.fsPath).toString('base64'), baseline.dut);
      receipt.checks.push('Managed Apply restores original role rules/config bytes/test names/history without direct file overwrite');
      fs.renameSync(marker, path.join(fixture, 'h5g2-original-completed.json'));
    }
    receipt.passed = true;
  } catch (error) { receipt.error = String(error); throw error; }
  finally { fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2)); }
};
