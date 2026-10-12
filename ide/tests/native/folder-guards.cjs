const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  const root = vscode.workspace.workspaceFolders[0].uri;
  const folder = vscode.Uri.joinPath(root, 'verification');
  const manifest = vscode.Uri.joinPath(root, 'rtl.toml');
  const original = fs.readFileSync(manifest.fsPath);
  const temporary = path.resolve(root.fsPath, 'verification/h5g3-owned');
  const linked = path.resolve(root.fsPath, 'h5g3-owned-link');
  assert.ok(temporary.startsWith(path.resolve(root.fsPath) + path.sep));
  assert.ok(linked.startsWith(path.resolve(root.fsPath) + path.sep));
  assert.equal(fs.existsSync(temporary), false); assert.equal(fs.existsSync(linked), false);
  let created = false, createdLink = false, ownDirty = false;
  const receipt = { passed: false, trusted: vscode.workspace.isTrusted, checks: [], scope: 'Actual editor edits/commands/IPC/Explorer DOM and real build cancellation; physical menu/DPI separate.' };
  const state = () => vscode.commands.executeCommand('rtlIde.simulation.state');
  const until = async (predicate, timeout = 90000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) { const s = await state(); if (predicate(s)) return s; await new Promise(resolve => setTimeout(resolve, 100)); }
    throw Error('Role guard state did not settle: ' + JSON.stringify(await state()));
  };
  try {
    assert.equal(vscode.workspace.isTrusted, true);
    const deadline = Date.now() + 30000;
    while (!(await vscode.commands.getCommands(true)).includes('rtlIde.explorer.folder.source')) { assert.ok(Date.now() < deadline); await new Promise(resolve => setTimeout(resolve, 100)); }
    const initial = await until(s => s.project && s.phase === 'idle');
    const priorRun = initial.tests.find(test => test.name === 'tb.first').latest;
    const priorWave = priorRun?.waveform && fs.readFileSync(priorRun.waveform);
    const doc = await vscode.workspace.openTextDocument(manifest); assert.equal(doc.isDirty, false);
    await vscode.window.showTextDocument(doc);
    const edit = new vscode.WorkspaceEdit(); edit.insert(doc.uri, doc.positionAt(doc.getText().length), '# h5g3 unsaved role guard\n');
    assert.equal(await vscode.workspace.applyEdit(edit), true); ownDirty = true;
    await until(s => s.dirtyManifest);
    await assert.rejects(vscode.commands.executeCommand('rtlIde.explorer.folder.source', folder), /미저장/);
    assert.equal((await state()).review, undefined); assert.deepEqual(fs.readFileSync(manifest.fsPath), original);
    await vscode.commands.executeCommand('undo'); ownDirty = false; await until(s => !s.dirtyManifest);
    receipt.checks.push('Actual unsaved TOML edit blocks folder command before management; Undo restores availability and disk bytes never change');

    await vscode.commands.executeCommand('rtlIde.simulation.run', ['tb.first']);
    await until(s => s.phase === 'running' && /g\+\+/.test(s.log));
    await assert.rejects(vscode.commands.executeCommand('rtlIde.explorer.folder.simulation', folder), /실행 상태/);
    assert.equal((await state()).review, undefined);
    await vscode.commands.executeCommand('rtlIde.simulation.cancel');
    let current = await until(s => s.phase === 'idle');
    assert.equal(current.tests.find(test => test.name === 'tb.first').latest.status, 'cancelled');
    assert.equal(current.history.length, initial.history.length + 1);
    if (priorWave) assert.deepEqual(fs.readFileSync(priorRun.waveform), priorWave);
    assert.deepEqual(fs.readFileSync(manifest.fsPath), original);
    receipt.checks.push('Folder command is rejected during real Verilator build; cancellation settles and retains prior waveform plus cancelled history');

    await assert.rejects(vscode.commands.executeCommand('rtlIde.explorer.folder.source', vscode.Uri.joinPath(root, '.rtl')), /생성물/);
    fs.mkdirSync(temporary); created = true;
    fs.mkdirSync(path.join(temporary, 'nested')); fs.mkdirSync(path.join(temporary, 'empty')); fs.mkdirSync(path.join(temporary, 'excluded'));
    fs.writeFileSync(path.join(temporary, 'a.sv'), 'module h5g3_a; endmodule\n');
    fs.writeFileSync(path.join(temporary, 'nested/b.sv'), 'module h5g3_b; endmodule\n');
    fs.writeFileSync(path.join(temporary, 'excluded/c.sv'), 'module h5g3_c; endmodule\n');
    fs.symlinkSync(temporary, linked, 'junction'); createdLink = true;
    await assert.rejects(vscode.commands.executeCommand('rtlIde.explorer.folder.source', vscode.Uri.file(linked)), /링크/);
    await assert.rejects(vscode.commands.executeCommand('rtlIde.explorer.folder.source', vscode.Uri.file(path.join(linked, 'nested'))), /링크/);
    assert.equal((await state()).review, undefined);
    receipt.checks.push('Generated output, link folder and directory under a link are rejected before classification');

    await vscode.commands.executeCommand('rtlIde.simulation.manage');
    current = await until(s => s.review?.execution);
    const base = current.review;
    const prefix = 'verification/h5g3-owned';
    await vscode.commands.executeCommand('rtlIde.simulation.classify', {
      folders: [...base.folders, { path: prefix, role: 'simulation' }, { path: prefix + '/nested', role: 'source' }, { path: prefix + '/excluded', role: 'excluded' }],
      files: [...base.files, { path: prefix + '/nested/b.sv', role: 'simulation' }]
    });
    current = await until(s => s.review?.files.some(entry => entry.path === prefix + '/nested/b.sv'));
    const sources = current.review.inventory.sources;
    assert.equal(sources.find(source => source.path === prefix + '/a.sv').roleOrigin, 'folder');
    assert.equal(sources.find(source => source.path === prefix + '/nested/b.sv').roleOrigin, 'file');
    assert.equal(sources.find(source => source.path === prefix + '/nested/b.sv').role, 'simulation');
    assert.ok(!sources.some(source => source.path.startsWith(prefix + '/excluded/')));
    assert.ok(current.review.inventory.directories.includes(prefix + '/empty'));
    await vscode.commands.executeCommand('rtlIde.explorer.folder.source', vscode.Uri.file(path.join(temporary, 'nested')));
    current = await state();
    assert.equal(current.review.inventory.sources.find(source => source.path === prefix + '/nested/b.sv').role, 'simulation');
    await vscode.commands.executeCommand('rtlIde.showCode');
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(temporary, 'nested/b.sv'))));
    await vscode.commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
    let badge;
    for (let i = 0; i < 100; i++) {
      const explorer = await vscode.commands.executeCommand('rtlIde.explorer.state');
      badge = explorer.folders.find(b => b.resource === vscode.Uri.file(path.join(temporary, 'nested')).toString());
      if (badge?.role === 'source') break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.equal(badge?.role, 'source');
    await vscode.commands.executeCommand('rtlIde.explorer.folder.inherit', vscode.Uri.file(path.join(temporary, 'nested')));
    current = await state();
    assert.ok(!current.review.folders.some(entry => entry.path === prefix + '/nested'));
    assert.ok(current.review.folders.some(entry => entry.path === prefix + '/excluded'));
    assert.equal(current.review.inventory.sources.find(source => source.path === prefix + '/nested/b.sv').roleOrigin, 'file');
    assert.deepEqual(fs.readFileSync(manifest.fsPath), original);
    receipt.checks.push('Actual folder inheritance, child exclusion and file override agree with Explorer icon; setting/resetting one folder preserves child/file exceptions');
    await vscode.commands.executeCommand('rtlIde.simulation.refresh');
    await until(s => s.project && !s.review);
    receipt.passed = true;
  } catch (error) { receipt.error = String(error); throw error; }
  finally {
    try {
      let s = await state();
      if (['running', 'cancelling'].includes(s.phase)) { await vscode.commands.executeCommand('rtlIde.simulation.cancel'); await until(s => !['running', 'cancelling'].includes(s.phase)); }
      if (ownDirty) { const doc = await vscode.workspace.openTextDocument(manifest); assert.equal(doc.getText(), original.toString() + '# h5g3 unsaved role guard\n'); await vscode.window.showTextDocument(doc); await vscode.commands.executeCommand('workbench.action.files.revert'); }
      if (createdLink) fs.rmdirSync(linked);
      if (created) fs.rmSync(temporary, { recursive: true });
      s = await state(); if (s.review) await vscode.commands.executeCommand('rtlIde.simulation.refresh');
      await vscode.commands.executeCommand('rtlIde.showCode');
      await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(vscode.Uri.joinPath(folder, 'tb.sv')));
      assert.deepEqual(fs.readFileSync(manifest.fsPath), original);
    } catch (error) { receipt.passed = false; receipt.cleanupError = String(error); }
    fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2));
  }
};
