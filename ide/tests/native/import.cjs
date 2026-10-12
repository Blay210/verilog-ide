const vscode = require('vscode');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  const receipt = { passed: false, checks: [] };
  const state = () => vscode.commands.executeCommand('rtlIde.simulation.state');
  const workspace = vscode.workspace.workspaceFolders[0].uri.fsPath;
  async function settled() {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      const current = await state();
      if (current.reviewVisible && current.phase === 'idle') return current;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw Error('Import review did not settle.');
  }
  try {
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    await vscode.commands.executeCommand('rtlIde.simulation.refresh');
    let current = await settled();
    assert.equal(current.reviewFileRows, 2); assert.equal(current.tests.length, 0);
    assert.equal(current.controls.allEnabled, false);
    assert.equal(current.review.inventory.tops.length, 3);
    receipt.checks.push('Unconfigured project renders inventory through actual shared-process IPC; execution disabled');
    await vscode.commands.executeCommand('rtlIde.simulation.classify', { folders: [{ path: '검증 폴더', role: 'simulation' }] });
    current = await settled();
    assert.equal(current.review.inventory.sources.find(f => f.path.endsWith('two.sv')).role, 'simulation');
    await vscode.commands.executeCommand('rtlIde.showCode');
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    await vscode.commands.executeCommand('rtlIde.simulation.refresh');
    current = await settled(); assert.equal(current.review.folders[0].role, 'simulation');
    receipt.checks.push('Folder role survives Code/Simulation switching and refresh');
    await vscode.commands.executeCommand('rtlIde.simulation.classify', { files: [{ path: '검증 폴더/two.sv', role: 'excluded' }] });
    current = await settled(); assert.equal(current.review.inventory.sources.length, 1);
    await vscode.commands.executeCommand('rtlIde.simulation.classify', {});
    current = await settled(); assert.equal(current.review.inventory.sources.length, 2);
    receipt.checks.push('File exclusion and reset work without source or manifest writes');
    assert.equal(fs.existsSync(path.join(workspace, '.rtl')), false);
    assert.equal(fs.existsSync(path.join(workspace, 'rtl.toml')), false);
    assert.equal(fs.readFileSync(path.join(workspace, '검증 폴더/two.sv'), 'utf8'), 'module first; initial $finish; endmodule\nmodule second; initial $finish; endmodule\n');
    receipt.checks.push('No generated directories, TOML or source modifications');
    await vscode.commands.executeCommand('rtlIde.simulation.classify', { folders: [{ path: '검증 폴더', role: 'simulation' }] });
    await vscode.commands.executeCommand('rtlIde.simulation.saveReview');
    current = await settled(); assert.equal(current.error, undefined);
    assert.notEqual(current.review.manifestRevision, 'absent');
    assert.match(fs.readFileSync(path.join(workspace, 'rtl.toml'), 'utf8'), /pending = true/);
    await vscode.commands.executeCommand('rtlIde.simulation.refresh');
    current = await settled(); assert.equal(current.review.folders[0].role, 'simulation');
    assert.equal(current.tests.length, 0); assert.equal(current.controls.allEnabled, false);
    receipt.checks.push('Explicit save publishes pending managed TOML and refresh restores roles without registering tests');
    const document = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(workspace, 'rtl.toml')));
    await vscode.window.showTextDocument(document);
    const bytes = fs.readFileSync(document.uri.fsPath, 'utf8');
    const edit = new vscode.WorkspaceEdit(); edit.insert(document.uri, new vscode.Position(0, 0), '# unsaved probe\n');
    await vscode.workspace.applyEdit(edit);
    receipt.dirtyDocument = document.isDirty;
    assert.equal(document.isDirty, true);
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    receipt.beforeDirtySave = await state();
    await assert.rejects(vscode.commands.executeCommand('rtlIde.simulation.saveReview'), /미저장/);
    assert.equal(document.isDirty, true); assert.equal(fs.readFileSync(document.uri.fsPath, 'utf8'), bytes);
    receipt.checks.push('Dirty TOML blocks save without auto-saving or changing disk');
    if (!vscode.workspace.isTrusted) {
      await assert.rejects(vscode.commands.executeCommand('rtlIde.simulation.prepareReview', { ids: current.review.inventory.tops.map(top => top.id) }), /신뢰/);
      await assert.rejects(vscode.commands.executeCommand('rtlIde.simulation.confirmReview', { ids: current.review.inventory.tops.map(top => top.id) }), /신뢰/);
      assert.equal((await state()).importPreview, undefined);
      assert.equal(fs.readFileSync(document.uri.fsPath, 'utf8'), bytes);
      receipt.checks.push('Untrusted import semantic analysis is blocked without modifying saved configuration');
    }
    receipt.passed = true;
  } catch (error) { receipt.error = String(error); throw error; }
  finally { fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2)); }
};
