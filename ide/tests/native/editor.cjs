const vscode = require('vscode');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

exports.run = async function () {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  if (!fixture) throw Error('Missing private fixture.');
  const focusRounds = Number(process.env.RTL_IDE_FOCUS_ROUNDS ?? 20);
  if (!Number.isInteger(focusRounds) || focusRounds < 1 || focusRounds > 20) throw Error('Focus rounds must be an integer from 1 to 20.');
  const workspace = path.join(fixture, '설계 프로젝트');
  const source = path.join(workspace, '편집 검증.sv');
  const receipt = { passed: false, mode: 'native extension-host API acceptance; not physical keyboard input', checks: [], stages: [] };
  const started = performance.now();
  const mark = name => {
    const stage = { name, utc: new Date().toISOString(), elapsedMs: Math.round(performance.now() - started) };
    receipt.stages.push(stage);
    console.log(`RTL_ACCEPTANCE_STAGE ${JSON.stringify(stage)}`);
  };
  mark('test-entry');
  let output;
  let terminal;
  try {
    assert.equal(vscode.workspace.workspaceFolders.length, 1);
    assert.equal(path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath).toLowerCase(), workspace.toLowerCase());
    receipt.checks.push('Unicode/space workspace folder');
    const document = await vscode.workspace.openTextDocument(vscode.Uri.file(source));
    await vscode.window.showTextDocument(document);
    assert.equal(vscode.window.activeTextEditor.document, document);
    assert.equal(document.getText(), 'module editor_probe;\nendmodule\n');
    receipt.checks.push('Open source and show active editor');
    mark('source-open');
    const edit = new vscode.WorkspaceEdit();
    edit.insert(document.uri, new vscode.Position(0, 0), '// 저장 검증\n');
    assert.equal(await vscode.workspace.applyEdit(edit), true);
    assert.equal(document.isDirty, true);
    assert.doesNotMatch(fs.readFileSync(source, 'utf8'), /저장 검증/);
    assert.equal(await document.save(), true);
    assert.equal(document.isDirty, false);
    assert.match(fs.readFileSync(source, 'utf8'), /^\/\/ 저장 검증\nmodule editor_probe;/);
    receipt.checks.push('Dirty model, unchanged disk before save, persisted save');
    mark('source-save');
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    const reopened = await vscode.workspace.openTextDocument(vscode.Uri.file(source));
    await vscode.window.showTextDocument(reopened);
    assert.equal(reopened.getText(), fs.readFileSync(source, 'utf8'));
    receipt.checks.push('Reopen saved source');
    // This public command reaches the real renderer language detection service.
    // In H1 no RTL language is registered yet: keep unknown .sv as plain text.
    assert.equal(reopened.languageId, 'plaintext');
    await vscode.commands.executeCommand('editor.detectLanguage');
    assert.equal(reopened.languageId, 'plaintext');
    receipt.checks.push('Unknown .sv detection completes without model worker; selected mode preserved');
    mark('rtl-detection');
    const knownSource = path.join(fixture, 'associations.json');
    fs.writeFileSync(knownSource, '{"probe":true}\n');
    const known = await vscode.workspace.openTextDocument(vscode.Uri.file(knownSource));
    mark('json-open');
    await vscode.window.showTextDocument(known);
    assert.equal(known.languageId, 'json');
    await vscode.commands.executeCommand('editor.detectLanguage');
    assert.equal(known.languageId, 'json');
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    await vscode.window.showTextDocument(reopened);
    receipt.checks.push('Registered JSON filename association retained by real language detection');
    mark('json-detection-and-return');
    output = vscode.window.createOutputChannel('RTL IDE acceptance');
    output.appendLine('Private editor acceptance passed.');
    output.show(true);
    assert.deepEqual(fs.readdirSync(workspace), ['편집 검증.sv']);
    receipt.checks.push('Output API and no project artifacts outside source');
    const registered = await vscode.commands.getCommands(true);
    assert.ok(registered.includes('rtlIde.showSimulation'));
    const active = vscode.window.activeTextEditor;
    const unchangedDisk = fs.readFileSync(source, 'utf8');
    const draft = new vscode.WorkspaceEdit();
    draft.insert(reopened.uri, new vscode.Position(0, 0), '// 미저장 공간 검증\n');
    assert.equal(await vscode.workspace.applyEdit(draft), true);
    active.selection = new vscode.Selection(1, 3, 1, 3);
    const dirtyText = reopened.getText();
    let pid;
    if (vscode.workspace.isTrusted) {
      terminal = vscode.window.createTerminal({ name: 'RTL private space acceptance', shellPath: process.env.ComSpec });
      pid = await terminal.processId;
      assert.ok(pid > 0);
      receipt.terminalCheck = 'trusted private workspace: terminal PID checked';
    } else {
      receipt.terminalCheck = 'not run: private workspace is untrusted; trust was not changed';
    }
    // Two real editor groups, with an independently scrolled long source and
    // the original unsaved model. Do not infer layout persistence from one tab.
    await vscode.window.showTextDocument(known, { viewColumn: vscode.ViewColumn.One, preview: false });
    await vscode.window.showTextDocument(reopened, { viewColumn: vscode.ViewColumn.One, preview: false });
    const longSource = path.join(fixture, '스크롤 검증.sv');
    fs.writeFileSync(longSource, Array.from({ length: 800 }, (_, index) => `// line ${index}`).join('\n'));
    const longDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(longSource));
    const longEditor = await vscode.window.showTextDocument(longDocument, { viewColumn: vscode.ViewColumn.Two, preview: false });
    longEditor.selection = new vscode.Selection(420, 2, 420, 8);
    longEditor.revealRange(new vscode.Range(420, 0, 421, 0), vscode.TextEditorRevealType.AtTop);
    const until = async predicate => {
      const deadline = Date.now() + 5000;
      while (!predicate()) {
        if (Date.now() > deadline) throw Error('Editor viewport did not settle');
        await new Promise(resolve => setTimeout(resolve, 25));
      }
    };
    await until(() => longEditor.visibleRanges[0]?.start.line >= 400);
    const scrollLine = longEditor.visibleRanges[0].start.line;
    const tabSnapshot = () => vscode.window.tabGroups.all.map(group => ({
      column: group.viewColumn, active: group.isActive,
      tabs: group.tabs.map(tab => ({ active: tab.isActive, dirty: tab.isDirty, uri: tab.input.uri?.toString() })),
    }));
    const tabsBefore = tabSnapshot();
    assert.equal(vscode.window.tabGroups.all.length, 2);
    assert.equal(vscode.window.tabGroups.all[0].tabs.length, 2);
    assert.equal(vscode.window.tabGroups.all.flatMap(group => group.tabs).length, 3);
    // Output.show crosses to the renderer asynchronously. Establish the panel
    // baseline after all group setup, rather than comparing to a stale snapshot.
    output.show(true);
    const panelDeadline = Date.now() + 5000;
    let beforeSpace;
    do {
      beforeSpace = await vscode.commands.executeCommand('rtlIde.spaceState');
      if (beforeSpace.panelVisible) break;
      if (Date.now() > panelDeadline) throw Error('Output panel did not become visible');
      await new Promise(resolve => setTimeout(resolve, 25));
    } while (true);
    assert.equal(beforeSpace.activeSpace, 'code');
    for (let count = 0; count < 3; count++) {
      await vscode.commands.executeCommand('rtlIde.showSimulation');
      const simulation = await vscode.commands.executeCommand('rtlIde.spaceState');
      assert.equal(simulation.activeSpace, 'simulation');
      assert.equal(simulation.homeVisible, true);
      assert.equal(simulation.sidebarVisible, false);
      assert.equal(simulation.panelVisible, beforeSpace.panelVisible);
      assert.equal(reopened.isDirty, true);
      assert.equal(reopened.getText(), dirtyText);
      assert.equal(fs.readFileSync(source, 'utf8'), unchangedDisk);
      if (terminal) {
        assert.equal(await terminal.processId, pid);
        assert.ok(vscode.window.terminals.includes(terminal));
      }
      await vscode.commands.executeCommand('rtlIde.showCode');
      const code = await vscode.commands.executeCommand('rtlIde.spaceState');
      assert.equal(code.homeVisible, false);
      assert.equal(code.sidebarVisible, beforeSpace.sidebarVisible);
      assert.equal(code.panelVisible, beforeSpace.panelVisible);
      assert.equal(vscode.window.activeTextEditor.document, longDocument);
      assert.equal(vscode.window.activeTextEditor.selection.anchor.line, 420);
      assert.equal(vscode.window.activeTextEditor.selection.anchor.character, 2);
      assert.equal(vscode.window.activeTextEditor.selection.active.character, 8);
      await until(() => longEditor.visibleRanges[0]?.start.line === scrollLine);
      assert.deepEqual(tabSnapshot(), tabsBefore);
      const originalEditor = vscode.window.visibleTextEditors.find(editor => editor.document === reopened);
      assert.ok(originalEditor);
      assert.equal(originalEditor.selection.active.line, 1);
      assert.equal(originalEditor.selection.active.character, 3);
      assert.equal(reopened.getText(), dirtyText);
    }
    receipt.checks.push('Three Code/Simulation roundtrips preserve two groups/tabs, active document, selection, scroll, unsaved model, disk and panel visibility');
    receipt.spaceCheck = { groups: 2, tabs: 3, roundtrips: 3, scrollLine, selection: '420:2-420:8' };
    mark('space-roundtrips');
    // Opening Explorer is an explicit request even when Code previously hid
    // the sidebar; returning from Simulation must not immediately hide it again.
    const sidebarState = await vscode.commands.executeCommand('rtlIde.spaceState');
    if (sidebarState.sidebarVisible) await vscode.commands.executeCommand('workbench.action.toggleSidebarVisibility');
    assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).sidebarVisible, false);
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    await vscode.commands.executeCommand('workbench.view.explorer');
    const explorerState = await vscode.commands.executeCommand('rtlIde.spaceState');
    assert.equal(explorerState.activeSpace, 'code');
    assert.equal(explorerState.homeVisible, false);
    assert.equal(explorerState.sidebarVisible, true, 'Explicit Explorer request must remain visible');
    assert.equal(reopened.getText(), dirtyText);
    receipt.checks.push('Explorer opened from Simulation stays visible after initially hidden Code sidebar');
    mark('explorer-return');
    await vscode.commands.executeCommand('workbench.action.togglePanel');
    assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).panelVisible, false);
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).panelVisible, false);
    // The common panel can be opened without leaving Simulation.
    await vscode.commands.executeCommand('workbench.action.togglePanel');
    const panelOpened = await vscode.commands.executeCommand('rtlIde.spaceState');
    assert.equal(panelOpened.activeSpace, 'simulation');
    assert.equal(panelOpened.panelVisible, true);
    await vscode.commands.executeCommand('rtlIde.showCode');
    assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).panelVisible, true);
    assert.equal(reopened.getText(), dirtyText);
    assert.equal(fs.readFileSync(source, 'utf8'), unchangedDisk);
    receipt.checks.push('Hidden shared panel remains hidden; panel opened in Simulation persists on Code return');
    mark('panel-toggle');
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    const newSource = path.join(fixture, '새 문서.sv');
    fs.writeFileSync(newSource, 'module next_probe;\nendmodule\n');
    const newDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(newSource));
    await vscode.window.showTextDocument(newDocument, { viewColumn: vscode.ViewColumn.Two, preview: false });
    assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).activeSpace, 'code', 'Opening a source must leave Simulation');
    await vscode.commands.executeCommand('type', { text: '// focus probe\n' });
    await until(() => newDocument.getText().startsWith('// focus probe\n'));
    assert.equal(newDocument.isDirty, true);
    assert.equal(fs.readFileSync(newSource, 'utf8'), 'module next_probe;\nendmodule\n');
    assert.equal(reopened.getText(), dirtyText);
    receipt.checks.push('Source opening from Simulation returns to Code with working typing focus; no autosave');
    mark('source-return-focus');
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    await vscode.window.showTextDocument(newDocument, { viewColumn: vscode.ViewColumn.Two, preview: false });
    assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).activeSpace, 'code', 'Reopening the same active source must leave Simulation');
    receipt.checks.push('Reopening the same active source returns to Code');
    mark('same-source-return');
    for (let count = 0; count < 2; count++) {
      await vscode.commands.executeCommand('rtlIde.showSimulation');
      await vscode.commands.executeCommand('workbench.action.toggleAuxiliaryBar');
      assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).activeSpace, 'code', 'Opening secondary sidebar must return to Code');
      assert.equal(reopened.getText(), dirtyText);
      assert.equal(fs.readFileSync(source, 'utf8'), unchangedDisk);
    }
    receipt.checks.push('Secondary sidebar opening returns to Code on two successive visits without saving source');
    mark('auxiliary-return');
    for (const visible of [false, true]) {
      if ((await vscode.commands.executeCommand('rtlIde.spaceState')).auxiliaryVisible !== visible) {
        await vscode.commands.executeCommand('workbench.action.toggleAuxiliaryBar');
      }
      assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).auxiliaryVisible, visible);
      await vscode.commands.executeCommand('rtlIde.showSimulation');
      assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).auxiliaryVisible, false);
      await vscode.commands.executeCommand('rtlIde.showCode');
      assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).auxiliaryVisible, visible);
    }
    receipt.checks.push('Secondary sidebar initially hidden/visible restores exact visibility after Simulation');
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
    assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).activeSpace, 'code');
    const untitled = vscode.window.activeTextEditor.document;
    assert.equal(untitled.isUntitled, true);
    await vscode.commands.executeCommand('type', { text: '// private untitled focus\n' });
    // Untitled uses the Windows CRLF default; source fixtures above use LF.
    await until(() => untitled.getText().replace(/\r\n/g, '\n') === '// private untitled focus\n');
    await vscode.commands.executeCommand('workbench.action.files.revert');
    receipt.checks.push('New Untitled command from Simulation returns to Code with working typing focus');
    mark('untitled-return');
    output.show(true);
    const outputDocument = () => vscode.workspace.textDocuments.find(doc => doc.uri.scheme === 'output' && doc.getText().includes('Private editor acceptance passed.'));
    await until(() => !!outputDocument());
    const outputBefore = outputDocument();
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    output.appendLine('Output survives Simulation.');
    await until(() => outputBefore.getText().includes('Output survives Simulation.'));
    assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).activeSpace, 'simulation');
    await vscode.commands.executeCommand('rtlIde.showCode');
    assert.ok(outputBefore.getText().includes('Private editor acceptance passed.'));
    assert.ok(outputBefore.getText().includes('Output survives Simulation.'));
    receipt.checks.push('Actual Output document retains prior text and appended Simulation text on Code return');
    mark('output-content');
    await vscode.commands.executeCommand('rtlIde.showSimulation');
    output.show(false);
    let focusedState;
    for (let attempt = 0; attempt < 100; attempt++) {
      focusedState = await vscode.commands.executeCommand('rtlIde.spaceState');
      if (focusedState.focusArea === 'panel') { break; }
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    assert.equal(focusedState.focusArea, 'panel', 'Output focus baseline');
    assert.equal(focusedState.activeSpace, 'simulation');
    const preservedFocusSource = await vscode.workspace.openTextDocument({ content: '// focus preservation probe\n', language: 'plaintext' });
    await vscode.window.showTextDocument(preservedFocusSource, { viewColumn: vscode.ViewColumn.One, preview: false, preserveFocus: true });
    const preservedFocusState = await vscode.commands.executeCommand('rtlIde.spaceState');
    receipt.preserveFocusState = preservedFocusState;
    assert.equal(preservedFocusState.activeSpace, 'code');
    assert.equal(preservedFocusState.focusArea, 'panel', 'Opening a source with preserveFocus must retain Output focus');
    receipt.checks.push('Source open with preserveFocus from Simulation retains shared Output focus');
    await vscode.window.showTextDocument(preservedFocusSource, { preserveFocus: false });
    await vscode.commands.executeCommand('workbench.action.files.revert');
    for (let round = 0; round < focusRounds; round++) {
      const viewColumn = round % 2 ? vscode.ViewColumn.One : vscode.ViewColumn.Two;
      await vscode.commands.executeCommand('rtlIde.showSimulation');
      const draft = await vscode.workspace.openTextDocument({ content: `// round ${round}\n`, language: 'plaintext' });
      await vscode.window.showTextDocument(draft, { viewColumn, preview: false, selection: new vscode.Range(0, 0, 0, 0) });
      receipt.focusProbe = { round, viewColumn, expectedUri: draft.uri.toString(), state: await vscode.commands.executeCommand('rtlIde.spaceState') };
      assert.equal(receipt.focusProbe.state.activeSpace, 'code');
      assert.equal(receipt.focusProbe.state.focusArea, 'editor');
      const prefix = `// immediate input ${round}\n`;
      await vscode.commands.executeCommand('type', { text: prefix });
      await until(() => draft.getText().replace(/\r\n/g, '\n').startsWith(prefix));
      assert.equal(reopened.getText(), dirtyText, 'Immediate typing must not reach the previously active source');
      assert.equal(fs.readFileSync(source, 'utf8'), unchangedDisk);
      await vscode.commands.executeCommand('rtlIde.showSimulation');
      await vscode.window.showTextDocument(draft, { viewColumn, preview: false });
      assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).activeSpace, 'code');
      await vscode.commands.executeCommand('type', { text: 'same source ' });
      await until(() => draft.getText().includes('same source '));
      await vscode.commands.executeCommand('workbench.action.files.revert');
    }
    receipt.checks.push(`${focusRounds} new/same-source Simulation returns accept immediate typing without touching the previous source or disk`);
    const layoutConfig = vscode.workspace.getConfiguration('workbench.activityBar');
    const oldLocation = layoutConfig.inspect('location').globalValue;
    const zoomConfig = vscode.workspace.getConfiguration('window');
    const oldZoom = zoomConfig.inspect('zoomLevel').globalValue;
    try {
      for (let zoom = 0; zoom < 6; zoom++) {
        if ((await vscode.commands.executeCommand('rtlIde.spaceState')).viewport.width < 800) { break; }
        await vscode.commands.executeCommand('workbench.action.zoomIn');
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      for (const location of ['hidden', 'top', 'bottom', 'default']) {
        await layoutConfig.update('location', location, vscode.ConfigurationTarget.Global);
        for (const space of ['code', 'simulation', 'code']) {
          await vscode.commands.executeCommand(space === 'code' ? 'rtlIde.showCode' : 'rtlIde.showSimulation');
          let state;
          for (let attempt = 0; attempt < 100; attempt++) {
            state = await vscode.commands.executeCommand('rtlIde.spaceState');
            if (state.navigationReachable && state.navigationClear && state.viewport.width < 800 && state.navigationPlacement === (location === 'default' ? 'activityBar' : 'editor')) { break; }
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          assert.equal(state.activeSpace, space);
          assert.equal(state.navigationReachable, true, `${location}/${space}: real renderer hit target must be reachable`);
          receipt.layoutState = state;
          assert.equal(state.navigationClear, true, `${location}/${space}: workspace navigation must not cover content`);
          assert.ok(state.viewport.width < 800, 'Zoomed renderer must exercise a narrow CSS viewport');
          receipt.narrowViewport = state.viewport;
          assert.equal(state.navigationPlacement, location === 'default' ? 'activityBar' : 'editor');
          assert.equal(reopened.getText(), dirtyText);
          assert.equal(fs.readFileSync(source, 'utf8'), unchangedDisk);
        }
        receipt.checks.push(`Activity Bar ${location}: visible non-inert navigation hit target in Code/Simulation/Code; draft and disk preserved`);
      }
    } finally {
      await layoutConfig.update('location', oldLocation, vscode.ConfigurationTarget.Global);
      await zoomConfig.update('zoomLevel', oldZoom, vscode.ConfigurationTarget.Global);
      await vscode.commands.executeCommand('workbench.action.zoomReset');
      await vscode.commands.executeCommand('rtlIde.showCode');
    }
    mark('activity-bar-layouts');
    await vscode.window.showTextDocument(newDocument, { viewColumn: vscode.ViewColumn.Two, preview: false });
    await vscode.commands.executeCommand('workbench.action.files.revert');
    // Revert only our private draft after the acceptance, never during a switch.
    await vscode.window.showTextDocument(reopened, { viewColumn: vscode.ViewColumn.One, preview: false });
    await vscode.commands.executeCommand('workbench.action.files.revert');
    assert.equal(reopened.isDirty, false);
    receipt.passed = true;
    mark('test-complete');
  } catch (error) {
    receipt.error = error.stack || String(error);
    const activeEditor = vscode.window.activeTextEditor;
    receipt.failureEditor = activeEditor ? { uri: activeEditor.document.uri.toString(), text: activeEditor.document.getText(), selection: activeEditor.selection } : null;
    throw error;
  } finally {
    output?.dispose();
    terminal?.dispose();
    fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2));
  }
};
