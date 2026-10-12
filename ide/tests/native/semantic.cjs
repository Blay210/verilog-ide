const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  const file = path.join(fixture, '의미 분석 프로젝트', '코드 공백.sv');
  const original = fs.readFileSync(file, 'utf8');
  const receipt = { passed: false, trusted: vscode.workspace.isTrusted, checks: [] };
  let editor;
  const poll = async (read, predicate, label) => {
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) { const value = await read(); if (predicate(value)) return value; await new Promise(resolve => setTimeout(resolve, 250)); }
    throw Error('Timed out: ' + label);
  };
  try {
    assert.equal(vscode.workspace.isTrusted, true, 'Human must trust this private fixture first; test never changes trust.');
    const builtin = vscode.extensions.getExtension('rtl-internal.rtl-language'); assert.ok(builtin); await builtin.activate();
    const document = await vscode.workspace.openTextDocument(file); editor = await vscode.window.showTextDocument(document);
    const ready = () => poll(() => vscode.commands.executeCommand('rtl.getLanguageStatus', document.uri.toString()), status => ['Ready', 'Source errors'].includes(status?.label), 'built-in client compiler analysis');
    await ready(); receipt.checks.push('Trusted built-in LanguageClient starts and analyzes real RTL through slang');
    const update = async text => {
      await editor.edit(builder => builder.replace(new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length)), text));
      const p = document.positionAt(text.length); editor.selection = new vscode.Selection(p, p);
    };
    const completion = async (text, expected) => {
      await update(text);
      return poll(async () => (await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', document.uri, editor.selection.active))?.items ?? [],
        items => items.some(item => (typeof item.label === 'string' ? item.label : item.label.label) === expected), 'completion ' + expected);
    };
    const prefix = original.slice(0, original.indexOf('alu u('));
    await completion(prefix + 'al', 'alu');
    await completion(prefix + 'local_', 'local_signal');
    const ports = await completion(prefix + 'alu u(.a(local_signal), .', 'b');
    assert.ok(!ports.some(item => (typeof item.label === 'string' ? item.label : item.label.label) === 'a'));
    receipt.checks.push('Real editor providers complete project modules, scoped signals and remaining named ports from unsaved RTL');
    await update(prefix + 'initial begin add(');
    const signatures = await poll(() => vscode.commands.executeCommand('vscode.executeSignatureHelpProvider', document.uri, editor.selection.active, '('), value => value?.signatures?.length > 0, 'function signature');
    assert.match(signatures.signatures[0].label, /foo/); assert.match(signatures.signatures[0].label, /boo/);
    receipt.checks.push('Real editor signature help names function arguments');
    await update(original.replace('assign y=a&b', 'assign y=missing_signal'));
    await poll(() => vscode.languages.getDiagnostics(document.uri), values => values.some(value => value.source === 'slang' && value.message.includes('missing_signal')), 'unsaved diagnostic');
    assert.equal(fs.readFileSync(file, 'utf8'), original);
    await update(original);
    await poll(() => vscode.languages.getDiagnostics(document.uri), values => !values.some(value => value.message.includes('missing_signal')), 'diagnostic recovery');
    receipt.checks.push('Unsaved RTL diagnostics appear and clear after correction without changing disk');
    const instancePosition = document.positionAt(original.indexOf('alu u(') + 1);
    const definitions = await poll(() => vscode.commands.executeCommand('vscode.executeDefinitionProvider', document.uri, instancePosition),
      values => values?.length > 0, 'module definition');
    assert.equal((definitions[0].uri ?? definitions[0].targetUri).toString(), document.uri.toString());
    assert.equal((definitions[0].range ?? definitions[0].targetSelectionRange).start.line, 0);
    await poll(() => vscode.commands.executeCommand('vscode.executeHoverProvider', document.uri, instancePosition), values => values?.length > 0, 'module hover');
    receipt.checks.push('Actual definition and hover providers resolve the instance module to its RTL declaration');
    const legend = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokensLegend', document.uri);
    assert.ok(legend.tokenTypes.includes('class'));
    const tokens = await poll(() => vscode.commands.executeCommand('vscode.provideDocumentSemanticTokens', document.uri), value => value?.data?.length > 0, 'module semantic tokens');
    let line = 0, character = 0; const decoded = [];
    for (let i = 0; i < tokens.data.length; i += 5) {
      line += tokens.data[i]; character = tokens.data[i] ? tokens.data[i + 1] : character + tokens.data[i + 1];
      decoded.push({ line, character, length: tokens.data[i + 2], type: legend.tokenTypes[tokens.data[i + 3]] });
    }
    assert.ok(decoded.some(token => token.line === 0 && token.character === 7 && token.length === 3 && token.type === 'class'));
    assert.ok(decoded.some(token => token.line === instancePosition.line && token.character === instancePosition.character - 1 && token.type === 'class'));
    receipt.checks.push('Actual semantic tokens mark the module declaration and instance type as class symbols');
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    assert.equal(document.getText(), original);
    await vscode.commands.executeCommand('rtlIde.showCode');
    assert.equal(vscode.window.activeTextEditor.document.uri.toString(), document.uri.toString());
    await ready();
    const manifest = await vscode.workspace.openTextDocument(path.join(path.dirname(file), 'rtl.toml'));
    assert.ok(!vscode.languages.getDiagnostics(manifest.uri).some(value => value.source === 'slang'));
    receipt.checks.push('Code/Simulation return retains document and semantic service; TOML has no slang diagnostics');
    receipt.passed = true;
  } catch (error) { receipt.error = String(error.stack ?? error); throw error; }
  finally {
    if (editor) {
      await editor.edit(builder => builder.replace(new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(editor.document.getText().length)), original));
      await vscode.window.showTextDocument(editor.document);
      await vscode.commands.executeCommand('workbench.action.files.revert');
    }
    receipt.diskUnchanged = fs.readFileSync(file, 'utf8') === original;
    fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2));
  }
};
