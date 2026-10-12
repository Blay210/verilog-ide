const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  const receipt = { passed: false, checks: [], trusted: vscode.workspace.isTrusted };
  try {
    const builtin = vscode.extensions.getExtension('rtl-internal.rtl-language');
    assert.ok(builtin, 'product-owned built-in discovered');
    await builtin.activate();
    if (!vscode.workspace.isTrusted) {
      const status = await vscode.commands.executeCommand('rtl.getLanguageStatus');
      assert.equal(status.label, 'Trust required');
      receipt.checks.push('Untrusted project semantic compiler is blocked while lexical editing stays available');
      const command = vscode.commands.executeCommand('rtl.setupTools');
      await new Promise(resolve => setTimeout(resolve, 200));
      await vscode.commands.executeCommand('notifications.clearAll');
      await command;
      assert.equal((await vscode.commands.executeCommand('rtl.toolSetupState')).phase, 'idle');
      receipt.checks.push('Actual tool setup command refuses untrusted checks/installation before creating a service');
    }
    const root = path.join(fixture, '설계 프로젝트');
    for (const [ext, id] of [['v', 'verilog'], ['vh', 'verilog'], ['sv', 'systemverilog'], ['svh', 'systemverilog']]) {
      const file = path.join(root, `한글 파일.${ext}`);
      fs.writeFileSync(file, '');
      assert.equal((await vscode.workspace.openTextDocument(file)).languageId, id);
    }
    receipt.checks.push('Built-in activation and four RTL file associations without trust/tool installation');
    const document = await vscode.workspace.openTextDocument({ language: 'systemverilog', content: 'module' });
    let editor = await vscode.window.showTextDocument(document);
    editor.options = { insertSpaces: true, tabSize: 4 };
    const cursor = offset => { const p = document.positionAt(offset); editor.selection = new vscode.Selection(p, p); };
    const set = async text => {
      await vscode.commands.executeCommand('leaveSnippet');
      await editor.edit(b => b.replace(new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length)), text));
      cursor(text.length);
    };
    cursor(6);
    await vscode.commands.executeCommand('rtl.expandTemplate');
    assert.equal(document.getText().replace(/\r\n/g, '\n'), 'module  (\n    \n);\n    \nendmodule');
    assert.equal(editor.selection.active.line, 0);
    await vscode.commands.executeCommand('jumpToNextSnippetPlaceholder');
    assert.equal(editor.selection.active.line, 1);
    await vscode.commands.executeCommand('jumpToNextSnippetPlaceholder');
    assert.equal(editor.selection.active.line, 3);
    receipt.checks.push('Module expansion and native name/port/body Tab fields');
    for (const [text, expected] of [
      ['package', 'package'], ['case', 'case ('], ['always', 'always @('],
      ['always_ff', 'always_ff @('], ['always_comb', 'always_comb begin'], ['always_latch', 'always_latch begin'], ['begin', 'begin\n    \nend']
    ]) {
      await set(text); await vscode.commands.executeCommand('rtl.expandTemplate');
      assert.ok(document.getText().replace(/\r\n/g, '\n').startsWith(expected), text);
    }
    await set('beginend'); cursor(5);
    await vscode.commands.executeCommand('rtl.insertNewline');
    assert.equal(document.getText().replace(/\r\n/g, '\n'), 'begin\n    \nend');
    assert.equal(editor.selection.active.line, 1);
    assert.equal(editor.selection.active.character, 4);
    receipt.checks.push('Explicit procedural/begin/case/package templates and Enter reuse existing end');
    for (const [text, wanted] of [['ini', 'initial'], ['$mon', '$monitor'], ['`time', '`timescale']]) {
      await set(text);
      const results = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', document.uri, editor.selection.active);
      assert.ok(results.items.some(i => (typeof i.label === 'string' ? i.label : i.label.label) === wanted), wanted);
    }
    for (const text of ['// initial', '"initial', 'pkg::', 'obj.']) {
      await set(text);
      const results = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', document.uri, editor.selection.active);
      assert.ok(!results.items.some(i => (typeof i.label === 'string' ? i.label : i.label.label) === 'initial'), text);
    }
    receipt.checks.push('Actual completion provider: built-ins/directives present, comments/string/member context excluded');
    assert.equal(fs.readFileSync(path.join(root, '한글 파일.sv'), 'utf8'), '');
    assert.equal(document.isDirty, true);
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    let home;
    const homeDeadline = Date.now() + 10000;
    do {
      home = await vscode.commands.executeCommand('rtlIde.simulation.state');
      if (home.controls.setupEnabled) break;
      await new Promise(resolve => setTimeout(resolve, 50));
    } while (Date.now() < homeDeadline);
    assert.equal(home.controls.setupEnabled, true);
    receipt.checks.push('Simulation home exposes its tool setup control');
    receipt.passed = true;
  } catch (error) { receipt.error = error.stack || String(error); throw error; }
  finally { fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2)); }
};
