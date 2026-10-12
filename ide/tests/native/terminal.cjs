const vscode = require('vscode');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

exports.run = async () => {
  const fixture = process.env.RTL_IDE_EDITOR_FIXTURE;
  if (!fixture) throw Error('Missing private fixture');
  const receipt = { passed: false, mode: 'native API; empty window, no trust overrides', checks: [] };
  let terminal;
  try {
    assert.equal(vscode.workspace.workspaceFolders?.length ?? 0, 0);
    assert.equal(vscode.workspace.isTrusted, true, 'Default empty window must allow the terminal');
    terminal = vscode.window.createTerminal({ name: 'RTL private terminal probe', shellPath: process.env.ComSpec, shellArgs: ['/d', '/q'], cwd: fixture });
    const deadline = new Promise((_, reject) => { const timer = setTimeout(() => reject(Error('Terminal PID timeout')), 15000); timer.unref(); });
    const pid = await Promise.race([terminal.processId, deadline]);
    assert.ok(pid > 0);
    receipt.pid = pid;
    process.kill(pid, 0);
    receipt.checks.push('Real cmd terminal starts in private empty window without changing trust');
    terminal.show(true);
    for (let count = 0; count < 3; count++) {
      await vscode.commands.executeCommand('rtlIde.showSimulation');
      assert.equal((await vscode.commands.executeCommand('rtlIde.spaceState')).activeSpace, 'simulation');
      assert.equal(await terminal.processId, pid);
      process.kill(pid, 0);
      assert.ok(vscode.window.terminals.includes(terminal));
      await vscode.commands.executeCommand('rtlIde.showCode');
      assert.equal(await terminal.processId, pid);
      process.kill(pid, 0);
    }
    receipt.checks.push('Same live terminal PID survives three Code/Simulation roundtrips');
    terminal.dispose();
    const stopDeadline = Date.now() + 10000;
    while (true) {
      try { process.kill(pid, 0); } catch (error) {
        if (error.code !== 'ESRCH') throw error;
        break;
      }
      if (Date.now() > stopDeadline) throw Error('Private terminal process did not stop');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    receipt.checks.push('Explicit disposal stops only the private terminal process');
    receipt.passed = true;
  } catch (error) {
    receipt.error = error.stack || String(error);
    throw error;
  } finally {
    terminal?.dispose();
    fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2));
  }
};
