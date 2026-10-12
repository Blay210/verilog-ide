const vscode=require('vscode'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
exports.run=async()=>{
 const fixture=process.env.RTL_IDE_EDITOR_FIXTURE,root=vscode.workspace.workspaceFolders[0].uri;
 const original=['rtl.toml','rtl/연산 [0].sv','verification/tb.sv'].map(file=>[path.join(root.fsPath,file),fs.readFileSync(path.join(root.fsPath,file))]);
 const receipt={passed:false,trusted:vscode.workspace.isTrusted,checks:[],scope:'Actual run source QuickPick/virtual read-only editor/IPC/type/write denial; physical clicks separate.'};
 const state=()=>vscode.commands.executeCommand('rtlIde.simulation.state');
 const until=async predicate=>{const deadline=Date.now()+90000;while(Date.now()<deadline){const s=await state();if(predicate(s))return s;await new Promise(r=>setTimeout(r,100));}throw Error('Recorded source state did not settle');};
 try{
  assert.equal(vscode.workspace.isTrusted,true);const deadline=Date.now()+30000;while(!(await vscode.commands.getCommands(true)).includes('rtlIde.simulation.recordedSource')){assert.ok(Date.now()<deadline);await new Promise(r=>setTimeout(r,100));}
  await vscode.commands.executeCommand('rtlIde.showSimulation');await vscode.commands.executeCommand('rtlIde.simulation.refresh');const initial=await until(s=>s.phase==='idle'&&s.tests.length===2);
  const marker=JSON.parse(fs.readFileSync(path.join(fixture,'h6b3-retained.json'),'utf8'));const run=initial.history.find(run=>run.runId===marker.runId);assert.ok(run);
  assert.equal(fs.existsSync(path.join(root.fsPath,'rtl/h6b3_pkg.sv')),false);
  const opening=vscode.commands.executeCommand('rtlIde.simulation.recordedSource',run.name,run.runId);
  const pickerDeadline=Date.now()+30000;while(!(await vscode.commands.executeCommand('rtlIde.explorer.state')).pickerVisible){assert.ok(Date.now()<pickerDeadline);await new Promise(r=>setTimeout(r,100));}
  await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');await opening;
  const editor=vscode.window.activeTextEditor;assert.ok(editor);assert.equal(editor.document.uri.scheme,'rtl-run-source');assert.equal(editor.document.languageId,'systemverilog');
  const text=editor.document.getText();assert.match(text,/VALUE=8/);assert.equal(editor.document.isDirty,false);
  const record=JSON.parse(fs.readFileSync(path.join(path.dirname(run.log),'input-snapshot.json'),'utf8'));const mapping=record.mappings.find(entry=>entry.relative.replaceAll('\\','/')==='rtl/h6b3_pkg.sv');const retained=path.join(path.dirname(run.log),'inputs',mapping.relative);const bytes=fs.readFileSync(retained);
  assert.equal(text,bytes.toString());
  receipt.checks.push('Actual source picker opens deleted original package as SystemVerilog from the selected verified run with VALUE8, not current disk');
  await vscode.commands.executeCommand('type',{text:'must not edit'});assert.equal(editor.document.getText(),text);assert.equal(editor.document.isDirty,false);
  await assert.rejects(vscode.workspace.fs.writeFile(editor.document.uri,Buffer.from('overwrite')));
  assert.ok(fs.readFileSync(retained).equals(bytes));
  receipt.checks.push('Actual editor typing and provider write cannot modify the archived source; retained file bytes and dirty state stay intact');
  const before=initial.history.length;
  await vscode.commands.executeCommand('rtlIde.showSimulation');await vscode.commands.executeCommand('rtlIde.simulation.waveform',run.name,run.runId);await until(s=>s.waveforms.some(w=>w.runId===run.runId&&w.rendered?.rows>0));
  await vscode.commands.executeCommand('rtlIde.simulation.recordedSource',run.name,run.runId,'verification/tb.sv');
  assert.match(vscode.window.activeTextEditor.document.getText(),/y===10/);
  await assert.rejects(vscode.commands.executeCommand('rtlIde.simulation.recordedSource',run.name,run.runId,'../rtl.toml'),/보관된/);
  assert.equal((await state()).history.length,before);original.forEach(([file,bytes])=>assert.ok(fs.readFileSync(file).equals(bytes)));
  receipt.checks.push('Recorded TB and matching waveform open across spaces without a new simulation; unknown source is rejected and project/history preserved');
  receipt.passed=true;
 }catch(error){receipt.error=String(error);throw error;}
 finally{fs.writeFileSync(path.join(fixture,'receipt.json'),JSON.stringify(receipt,null,2));}
};
