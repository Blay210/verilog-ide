const vscode=require('vscode'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
exports.run=async()=>{
 const fixture=process.env.RTL_IDE_EDITOR_FIXTURE,root=vscode.workspace.workspaceFolders[0].uri;
 const dut=vscode.Uri.joinPath(root,'rtl','연산 [0].sv'),tb=vscode.Uri.joinPath(root,'verification','tb.sv'),manifest=vscode.Uri.joinPath(root,'rtl.toml');
 const originals=[dut,tb,manifest].map(uri=>[uri.fsPath,fs.readFileSync(uri.fsPath)]),owned=new Map();
 const receipt={passed:false,trusted:vscode.workspace.isTrusted,checks:[],scope:'Actual editor buffers/workbench commands/QuickPick/IPC/renderer and real Verilator; physical clicks separate.'};
 const state=()=>vscode.commands.executeCommand('rtlIde.simulation.state');
 const until=async predicate=>{const deadline=Date.now()+120000;while(Date.now()<deadline){const s=await state();if(predicate(s))return s;await new Promise(r=>setTimeout(r,100));}throw Error('Editor input acceptance timed out: '+JSON.stringify(await state()));};
 const edit=async(uri,text)=>{const doc=await vscode.workspace.openTextDocument(uri);const change=new vscode.WorkspaceEdit();change.replace(uri,new vscode.Range(doc.positionAt(0),doc.positionAt(doc.getText().length)),text);assert.equal(await vscode.workspace.applyEdit(change),true);owned.set(uri.fsPath,text);assert.equal(doc.isDirty,true);};
 const checkInputs=(result,value)=>{const record=JSON.parse(fs.readFileSync(path.join(path.dirname(result.log),'input-snapshot.json'),'utf8'));assert.equal(record.overrides.length,2);const mapping=record.mappings.find(entry=>entry.original.toLowerCase()===dut.fsPath.toLowerCase());assert.match(fs.readFileSync(path.join(path.dirname(result.log),'inputs',mapping.relative),'utf8'),new RegExp('assign y='+value));};
 try{
  assert.equal(vscode.workspace.isTrusted,true);
  const deadline=Date.now()+30000;while(!(await vscode.commands.getCommands(true)).includes('rtlIde.simulation.run')){assert.ok(Date.now()<deadline);await new Promise(r=>setTimeout(r,100));}
  for(const uri of [dut,tb,manifest])assert.equal((await vscode.workspace.openTextDocument(uri)).isDirty,false);
  await vscode.commands.executeCommand('rtlIde.showSimulation');await vscode.commands.executeCommand('rtlIde.simulation.refresh');
  const initial=await until(s=>s.phase==='idle'&&s.tests.length===2);const count=initial.history.length;
  const prior=initial.history.find(run=>run.status==='passed'&&run.waveform);const priorBytes=fs.readFileSync(prior.waveform);
  const source2=originals[0][1].toString().replace('output logic y','output logic [7:0] y').replace('assign y=1','assign y=2');assert.notEqual(source2,originals[0][1].toString());
  const tb2=originals[1][1].toString().replaceAll('wire y;','wire [7:0] y;').replaceAll('y===1','y===2');assert.notEqual(tb2,originals[1][1].toString());
  await edit(dut,source2);await edit(tb,tb2);
  await vscode.commands.executeCommand('rtlIde.simulation.run',['tb.first']);await until(s=>s.phase==='running'&&s.log.includes('g++ '));
  await edit(dut,source2.replace('assign y=2','assign y=3'));
  let current=await until(s=>s.phase==='idle'&&s.history.length===count+1);const first=current.tests.find(test=>test.name==='tb.first').latest;
  assert.equal(first.status,'passed',first.message);assert.equal(first.unsavedFiles.length,2);checkInputs(first,2);
  originals.forEach(([file,bytes])=>assert.deepEqual(fs.readFileSync(file),bytes));
  receipt.checks.push('Selected GUI run uses dirty DUT/TB VALUE2; editing to VALUE3 during real build cannot alter the retained run, original disk/config remains');
  await vscode.commands.executeCommand('rtlIde.simulation.waveform','tb.first',first.runId);current=await until(s=>s.waveforms.some(w=>w.runId===first.runId&&w.rendered?.rows>0));assert.equal(current.waveforms.find(w=>w.runId===first.runId).rendered.aligned,true);
  await vscode.commands.executeCommand('rtlIde.showCode');await vscode.commands.executeCommand('rtlIde.showSimulation');
  assert.equal((await vscode.workspace.openTextDocument(dut)).isDirty,true);
  receipt.checks.push('Dirty source remains unsaved through Code/Simulation switching and recorded managed VCD renders aligned in the native viewer');
  const tb3=tb2.replaceAll('y===2','y===3');await edit(tb,tb3);
  await vscode.commands.executeCommand('rtlIde.simulation.run');current=await until(s=>s.phase==='idle'&&s.history.length===count+3);
  for(const test of current.tests){assert.equal(test.latest.status,'passed',test.latest.message);checkInputs(test.latest,3);}
  assert.ok(current.waveforms.some(w=>w.runId===first.runId));assert.deepEqual(fs.readFileSync(prior.waveform),priorBytes);
  receipt.checks.push('Run All captures the newer buffers for both tops; previous waveform stays bound to the earlier VALUE2 run and prior disk trace bytes survive');
  await edit(tb,tb3+'\nmodule broken; assign = ; endmodule\n');await vscode.commands.executeCommand('rtlIde.simulation.run',['tb.first']);
  current=await until(s=>s.phase==='idle'&&s.history.length===count+4);assert.equal(current.tests.find(test=>test.name==='tb.first').latest.status,'failed');
  await edit(tb,tb3);await vscode.commands.executeCommand('rtlIde.simulation.run',['tb.second']);await until(s=>s.phase==='running'&&s.log.includes('g++ '));await vscode.commands.executeCommand('rtlIde.simulation.cancel');
  current=await until(s=>s.phase==='idle'&&s.history.length===count+5);assert.equal(current.tests.find(test=>test.name==='tb.second').latest.status,'cancelled');
  receipt.checks.push('Invalid unsaved RTL yields FAIL without saved-source fallback; actual dirty build cancellation remains a separate recorded state');
  await vscode.commands.executeCommand('rtlIde.showCode');await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(tb));await vscode.commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
  const rowDeadline=Date.now()+30000;while(true){const explorer=await vscode.commands.executeCommand('rtlIde.explorer.state');const row=explorer.rows.find(row=>row.resource===tb.toString());if(row&&!row.hidden&&!row.disabled&&row.width>0)break;assert.ok(Date.now()<rowDeadline,'Explorer action did not re-enable');await new Promise(r=>setTimeout(r,100));}
  await vscode.commands.executeCommand('rtlIde.explorer.activateRun',tb);
  const pickerDeadline=Date.now()+30000;while(!(await vscode.commands.executeCommand('rtlIde.explorer.state')).pickerVisible){assert.ok(Date.now()<pickerDeadline);await new Promise(r=>setTimeout(r,100));}
  await vscode.commands.executeCommand('workbench.action.quickOpenSelectNext');await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
  current=await until(s=>s.phase==='idle'&&s.history.length===count+6);const last=current.tests.find(test=>test.name==='tb.second').latest;assert.equal(last.status,'passed',last.message);checkInputs(last,3);
  originals.forEach(([file,bytes])=>assert.deepEqual(fs.readFileSync(file),bytes));
  receipt.checks.push('Explorer multi-top row retry uses the same dirty buffers and succeeds without saving, preserving six separate outcomes');
  receipt.passed=true;receipt.state=current;
 }catch(error){receipt.error=String(error);throw error;}
 finally{
  try{const s=await state();if(['running','cancelling'].includes(s.phase)){await vscode.commands.executeCommand('rtlIde.simulation.cancel');await until(s=>!['running','cancelling'].includes(s.phase));}
   for(const uri of [dut,tb]){const doc=await vscode.workspace.openTextDocument(uri);if(doc.isDirty){assert.equal(doc.getText(),owned.get(uri.fsPath),'Only revert exact edits made by this acceptance');await vscode.window.showTextDocument(doc);await vscode.commands.executeCommand('workbench.action.files.revert');assert.equal(doc.isDirty,false);}}
   originals.forEach(([file,bytes])=>assert.deepEqual(fs.readFileSync(file),bytes));
  }catch(error){receipt.cleanupError=String(error);receipt.passed=false;}
  fs.writeFileSync(path.join(fixture,'receipt.json'),JSON.stringify(receipt,null,2));
 }
};
