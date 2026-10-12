const vscode=require('vscode'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
exports.run=async()=>{
 const fixture=process.env.RTL_IDE_EDITOR_FIXTURE,root=vscode.workspace.workspaceFolders[0].uri;
 const dut=vscode.Uri.joinPath(root,'rtl','연산 [0].sv'),tb=vscode.Uri.joinPath(root,'verification','tb.sv'),manifest=vscode.Uri.joinPath(root,'rtl.toml');
 const pkg=vscode.Uri.joinPath(root,'rtl','h6b3_pkg.sv'),header=vscode.Uri.joinPath(root,'rtl','h6b3_value.svh');
 const original=[dut,tb,manifest].map(uri=>[uri,fs.readFileSync(uri.fsPath)]),owned=new Map(),created=[];
 const baseline=JSON.parse(fs.readFileSync(path.join(fixture,'h6b2-before-h6b3-receipt.json'),'utf8')).state.savedFolderRoles.manifestRevision;
 const digest=bytes=>require('node:crypto').createHash('sha256').update(bytes).digest('hex');
 const recovery=digest(original[2][1])!==baseline;
 if(recovery){const bytes=Buffer.from(original[2][1].toString().replace('include_dirs = ["rtl"]','include_dirs = []'));assert.equal(digest(bytes),baseline,'Only recover the known include-root change caused by this acceptance');original[2][1]=bytes;}
 const originalIncludes=JSON.parse(original[2][1].toString().match(/^include_dirs = (.*)$/m)[1]);
 let managed=false;
 const receipt={passed:false,trusted:vscode.workspace.isTrusted,checks:[],scope:'Actual editor/commands/IPC/native renderer, package/header/BOM and new process restoration; physical clicks separate.'};
 const state=()=>vscode.commands.executeCommand('rtlIde.simulation.state');
 const until=async predicate=>{const deadline=Date.now()+120000;while(Date.now()<deadline){const s=await state();if(predicate(s))return s;await new Promise(r=>setTimeout(r,100));}throw Error('Comparison acceptance timed out: '+JSON.stringify(await state()));};
 const edit=async(uri,text)=>{const doc=await vscode.workspace.openTextDocument(uri);const change=new vscode.WorkspaceEdit();change.replace(uri,new vscode.Range(doc.positionAt(0),doc.positionAt(doc.getText().length)),text);assert.equal(await vscode.workspace.applyEdit(change),true);owned.set(uri.toString(),text);};
 const revert=async uri=>{const doc=await vscode.workspace.openTextDocument(uri);if(doc.isDirty){assert.equal(doc.getText(),owned.get(uri.toString()));await vscode.window.showTextDocument(doc);await vscode.commands.executeCommand('workbench.action.files.revert');assert.equal(doc.isDirty,false);}};
 const apply=async(restore=false)=>{await vscode.commands.executeCommand('rtlIde.simulation.manage');const s=await until(s=>s.review?.execution);const ids=s.review.inventory.tops.filter(top=>['first','second'].includes(top.top)&&top.file==='verification/tb.sv').map(top=>top.id);assert.equal(ids.length,2);await vscode.commands.executeCommand('rtlIde.simulation.confirmReview',{ids,...(restore?{includeDirs:originalIncludes}:{})});const current=await state();assert.equal(current.error,undefined);await until(s=>!s.review&&s.phase==='idle');};
 try{
  assert.equal(vscode.workspace.isTrusted,true);const deadline=Date.now()+30000;while(!(await vscode.commands.getCommands(true)).includes('rtlIde.simulation.run')){assert.ok(Date.now()<deadline);await new Promise(r=>setTimeout(r,100));}
  for(const [uri]of original)assert.equal((await vscode.workspace.openTextDocument(uri)).isDirty,false);
  await vscode.commands.executeCommand('rtlIde.showSimulation');await vscode.commands.executeCommand('rtlIde.simulation.refresh');const initial=await until(s=>s.phase==='idle'&&s.tests.length===2);
  if(recovery){await apply(true);assert.equal(digest(fs.readFileSync(manifest.fsPath)),baseline);receipt.recoveredKnownIncludeRoot=true;}
  if(process.env.RTL_IDE_EDITOR_COMPARISON_RESTORE==='1'){
   const marker=JSON.parse(fs.readFileSync(path.join(fixture,'h6b3-retained.json'),'utf8'));
   const run=initial.history.find(run=>run.runId===marker.runId);assert.ok(run);assert.equal(run.unsavedFiles.length,4);
   await vscode.commands.executeCommand('rtlIde.simulation.waveform',run.name,run.runId);const s=await until(s=>s.waveforms.some(w=>w.runId===run.runId&&w.rendered?.rows>0));assert.equal(s.waveforms.find(w=>w.runId===run.runId).rendered.aligned,true);
   assert.ok(fs.readFileSync(run.waveform).equals(Buffer.from(marker.trace,'base64')));
   assert.equal(fs.existsSync(pkg.fsPath),false);assert.equal(fs.existsSync(header.fsPath),false);
   receipt.checks.push('Fresh trusted process restores four-file unsaved provenance and retained VCD after temporary package/header and dirty buffers are gone');receipt.passed=true;return;
  }
  for(const [uri,text]of [[pkg,'`timescale 1ns/1ps\npackage h6b3_pkg; localparam int VALUE=7; endpackage\n'],[header,'\ufeff`define DELTA 1\n']]){assert.equal(fs.existsSync(uri.fsPath),false);fs.writeFileSync(uri.fsPath,text);created.push(uri);}
  managed=true;await apply();
  assert.match(fs.readFileSync(manifest.fsPath,'utf8'),/h6b3_pkg/);
  const configBytes=fs.readFileSync(manifest.fsPath);await edit(manifest,configBytes.toString()+'# h6b3 dirty guard\n');
  await until(s=>s.dirtyManifest);await assert.rejects(vscode.commands.executeCommand('rtlIde.simulation.run',['tb.first']),/미저장/);assert.equal((await state()).history.length,initial.history.length);assert.ok(fs.readFileSync(manifest.fsPath).equals(configBytes));await revert(manifest);
  receipt.checks.push('Managed discovery registers the temporary package/header and dirty TOML blocks Run without writing or creating a result');
  const pkg8='`timescale 1ns/1ps\npackage h6b3_pkg; localparam int VALUE=8; endpackage\n';
  await edit(pkg,pkg8);await edit(header,'`define DELTA 2\n');
  await edit(dut,'`timescale 1ns/1ps\n`include "h6b3_value.svh"\nmodule dut(output logic [7:0] y); assign y=h6b3_pkg::VALUE+`DELTA; endmodule\n');
  await edit(tb,original[1][1].toString().replaceAll('wire y;','wire [7:0] y;').replaceAll('y===1','y===10'));
  await vscode.commands.executeCommand('rtlIde.showSimulation');await vscode.commands.executeCommand('rtlIde.simulation.run',['tb.first']);
  let s=await until(s=>s.phase==='idle'&&s.history.length===initial.history.length+1);const result=s.tests.find(test=>test.name==='tb.first').latest;assert.equal(result.status,'passed',result.message);assert.equal(result.unsavedFiles.length,4);
  const record=JSON.parse(fs.readFileSync(path.join(path.dirname(result.log),'input-snapshot.json'),'utf8'));
  const retainedHeader=record.mappings.find(mapping=>mapping.original.toLowerCase()===header.fsPath.toLowerCase());const bytes=fs.readFileSync(path.join(path.dirname(result.log),'inputs',retainedHeader.relative));assert.ok(bytes.subarray(0,3).equals(Buffer.from([239,187,191])));assert.match(bytes.toString(),/DELTA 2/);
  await until(s=>s.tests.find(t=>t.name==='tb.first').latest.currentInputs?.state==='matching'&&s.results.find(r=>r.name==='tb.first').warning.includes('일치'));
  receipt.checks.push('Actual dirty package/header/DUT/TB produce PASS VALUE10; UTF-8 BOM is retained and UI matches the current unsaved content rather than disk');
  await edit(pkg,pkg8.replace('VALUE=8','VALUE=9'));await until(s=>s.tests.find(t=>t.name==='tb.first').latest.currentInputs?.state==='changed'&&s.results.find(r=>r.name==='tb.first').warning.includes('실행 후'));
  await edit(pkg,pkg8);await until(s=>s.tests.find(t=>t.name==='tb.first').latest.currentInputs?.state==='matching'&&s.results.find(r=>r.name==='tb.first').warning.includes('일치'));
  s=await state();assert.equal(s.tests.find(t=>t.name==='tb.first').latest.inputs.state,'changed');
  await vscode.commands.executeCommand('rtlIde.simulation.waveform','tb.first',result.runId);await until(s=>s.waveforms.some(w=>w.runId===result.runId&&w.rendered?.rows>0));
  fs.writeFileSync(path.join(fixture,'h6b3-retained.json'),JSON.stringify({runId:result.runId,trace:fs.readFileSync(result.waveform).toString('base64')}));
  receipt.checks.push('Further dirty package edit marks the run changed; restoring identical text with a new document version matches again while saved disk comparison remains changed');
  receipt.passed=true;
 }catch(error){receipt.error=String(error);throw error;}
 finally{
  try{
   const s=await state();if(['running','cancelling'].includes(s.phase)){await vscode.commands.executeCommand('rtlIde.simulation.cancel');await until(s=>!['running','cancelling'].includes(s.phase));}
   for(const uri of [dut,tb,manifest,...created])await revert(uri);
   for(const uri of created){assert.ok(path.resolve(uri.fsPath).startsWith(path.resolve(root.fsPath)+path.sep));fs.unlinkSync(uri.fsPath);}
   if(managed)await apply(true);
   for(const [uri,bytes]of original)assert.ok(fs.readFileSync(uri.fsPath).equals(bytes),'Original file/config restoration');
  }catch(error){receipt.cleanupError=String(error);receipt.passed=false;}
  fs.writeFileSync(path.join(fixture,'receipt.json'),JSON.stringify(receipt,null,2));
 }
};
