const vscode=require('vscode'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
exports.run=async()=>{
 const fixture=process.env.RTL_IDE_EDITOR_FIXTURE,root=vscode.workspace.workspaceFolders[0].uri,tb=vscode.Uri.joinPath(root,'verification','tb.sv');
 const original=['rtl.toml','rtl/연산 [0].sv','verification/tb.sv'].map(file=>[path.join(root.fsPath,file),fs.readFileSync(path.join(root.fsPath,file))]);
 const receipt={passed:false,trusted:vscode.workspace.isTrusted,checks:[],scope:'Actual selection/IPC/current buffer comparison/diff editor; physical clicks and in-flight UI race separate.'};
 const state=()=>vscode.commands.executeCommand('rtlIde.simulation.state');
 const until=async predicate=>{const deadline=Date.now()+90000;while(Date.now()<deadline){const s=await state();if(predicate(s))return s;await new Promise(r=>setTimeout(r,100));}throw Error('Past run comparison did not settle: '+JSON.stringify(await state()));};
 let owned;
 try{
  assert.equal(vscode.workspace.isTrusted,true);const deadline=Date.now()+30000;while(!(await vscode.commands.getCommands(true)).includes('rtlIde.simulation.compareRun')){assert.ok(Date.now()<deadline);await new Promise(r=>setTimeout(r,100));}
  await vscode.commands.executeCommand('rtlIde.showSimulation');await vscode.commands.executeCommand('rtlIde.simulation.refresh');const initial=await until(s=>s.phase==='idle'&&s.tests.length===2);
  const latestId=initial.tests.find(t=>t.name==='tb.second').latest.runId;
  const old=initial.history.find(run=>run.name==='tb.second'&&run.status==='passed'&&!run.unsavedFiles?.length&&run.runId!==latestId);assert.ok(old);assert.notEqual(old.runId,latestId);
  const row=s=>s.results.find(r=>r.name==='tb.second');
  await vscode.commands.executeCommand('rtlIde.simulation.selectRun','tb.second',old.runId);await vscode.commands.executeCommand('rtlIde.simulation.compareRun','tb.second');
  await until(s=>row(s).runId===old.runId&&row(s).warning.includes('일치'));
  receipt.checks.push('Selecting the historical saved run reports matching current inputs independently of the newer unsaved result');
  const doc=await vscode.workspace.openTextDocument(tb);assert.equal(doc.isDirty,false);
  owned=doc.getText()+'\n// h6d dirty comparison\n';const edit=new vscode.WorkspaceEdit();edit.replace(tb,new vscode.Range(doc.positionAt(0),doc.positionAt(doc.getText().length)),owned);assert.equal(await vscode.workspace.applyEdit(edit),true);
  await until(s=>row(s).warning.includes('다시 비교'));await vscode.commands.executeCommand('rtlIde.simulation.compareRun','tb.second');await until(s=>row(s).warning.includes('선택한 실행과 다름'));
  receipt.checks.push('Dirty editing invalidates the explicit result; a new request reports selected-run differences without running a simulation');
  await vscode.commands.executeCommand('rtlIde.simulation.sourceDiff','tb.second',old.runId,'verification/tb.sv');
  const input=vscode.window.tabGroups.activeTabGroup.activeTab.input;assert.ok(input instanceof vscode.TabInputTextDiff);assert.equal(input.original.scheme,'rtl-run-source');assert.equal(input.modified.toString(),tb.toString());
  const left=await vscode.workspace.openTextDocument(input.original);assert.equal(left.getText(),original[2][1].toString());assert.equal((await vscode.workspace.openTextDocument(tb)).getText(),owned);
  const marker=JSON.parse(fs.readFileSync(path.join(fixture,'h6b3-retained.json'),'utf8'));
  await assert.rejects(vscode.commands.executeCommand('rtlIde.simulation.sourceDiff','tb.first',marker.runId,'rtl/h6b3_pkg.sv'),/현재 파일/);assert.equal(fs.existsSync(path.join(root.fsPath,'rtl/h6b3_pkg.sv')),false);
  receipt.checks.push('Actual diff editor separates immutable run text from dirty current TB; deleted current package is not recreated');
  await vscode.window.showTextDocument(doc);await vscode.commands.executeCommand('workbench.action.files.revert');owned=undefined;
  await vscode.commands.executeCommand('rtlIde.showSimulation');await vscode.commands.executeCommand('rtlIde.simulation.compareRun','tb.second');await until(s=>row(s).warning.includes('일치'));
  const current=await state();assert.equal(current.history.length,initial.history.length);assert.equal(current.tests.find(t=>t.name==='tb.second').latest.runId,initial.tests.find(t=>t.name==='tb.second').latest.runId);
  original.forEach(([file,bytes])=>assert.ok(fs.readFileSync(file).equals(bytes)));
  receipt.checks.push('Restoring original text matches the old run again while latest result/history and all original bytes remain');receipt.passed=true;
 }catch(error){receipt.error=String(error);throw error;}
 finally{try{const doc=await vscode.workspace.openTextDocument(tb);if(owned&&doc.isDirty){assert.equal(doc.getText(),owned);await vscode.window.showTextDocument(doc);await vscode.commands.executeCommand('workbench.action.files.revert');}}catch(error){receipt.cleanupError=String(error);receipt.passed=false;}fs.writeFileSync(path.join(fixture,'receipt.json'),JSON.stringify(receipt,null,2));}
};
