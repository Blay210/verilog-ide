const vscode=require('vscode'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
exports.run=async()=>{
 const fixture=process.env.RTL_IDE_EDITOR_FIXTURE,root=vscode.workspace.workspaceFolders[0].uri.fsPath;
 const receipt={passed:false,trusted:vscode.workspace.isTrusted,checks:[],scope:'One trusted native workbench session: real FileService watcher/IPC, retained source/diff, actual Verilator/internal waveform. Physical checks follow separately.'};
 const state=()=>vscode.commands.executeCommand('rtlIde.simulation.state');
 const until=async predicate=>{const end=Date.now()+90000;while(Date.now()<end){const s=await state();if(predicate(s))return s;await new Promise(r=>setTimeout(r,100));}throw Error('Native integrated state did not settle: '+JSON.stringify(await state()));};
 const directory=path.join(root,'verification','native-integration');
 const originals=['rtl.toml','rtl/연산 [0].sv','verification/tb.sv'].map(file=>[path.join(root,file),fs.readFileSync(path.join(root,file))]);
 const preferences=path.join(root,'rtl-tests.json'),beforePreferences=fs.existsSync(preferences)?fs.readFileSync(preferences):undefined;
 let made=false;
 try{
  assert.equal(vscode.workspace.isTrusted,true);
  const end=Date.now()+30000;while(!(await vscode.commands.getCommands(true)).includes('rtlIde.simulation.state')){assert.ok(Date.now()<end);await new Promise(r=>setTimeout(r,100));}
  await vscode.commands.executeCommand('rtlIde.showSimulation');await vscode.commands.executeCommand('rtlIde.simulation.refresh');
  const initial=await until(s=>s.phase==='idle'&&s.tests.length===2&&s.testList);
  assert.ok(initial.testList.folders.includes('verification'));
  assert.equal(fs.existsSync(directory),false);fs.mkdirSync(directory);made=true;
  const file=path.join(directory,'two.sv');
  fs.writeFileSync(file,'`timescale 1ns/1ps\nmodule native_alpha; initial #1 $finish; endmodule\nmodule native_beta; initial #1 $finish; endmodule\n');
  // No refresh command here: only the production FileService event can update rows.
  await until(s=>s.tests.filter(t=>['native_alpha','native_beta'].includes(t.top)).length===2);
  fs.renameSync(file,path.join(directory,'renamed.sv'));
  await until(s=>s.tests.filter(t=>t.top.startsWith('native_')).length===2&&s.tests.filter(t=>t.top.startsWith('native_')).every(t=>t.source.endsWith('renamed.sv')));
  fs.unlinkSync(path.join(directory,'renamed.sv'));fs.rmdirSync(directory);made=false;
  await until(s=>s.tests.length===2);
  fs.mkdirSync(directory);made=true;fs.writeFileSync(file,'module native_recreated; initial $finish; endmodule\n');
  await until(s=>s.tests.some(t=>t.top==='native_recreated'));
  fs.unlinkSync(file);fs.rmdirSync(directory);made=false;
  const after=await until(s=>s.tests.length===2);
  assert.equal(after.history.length,initial.history.length);
  assert.equal(after.phase,'idle');assert.equal(after.log,initial.log);
  originals.forEach(([file,bytes])=>assert.deepEqual(fs.readFileSync(file),bytes));
  assert.deepEqual(fs.existsSync(preferences)?fs.readFileSync(preferences):undefined,beforePreferences);
  receipt.checks.push('Native FileService→home→shared-process/Core adds two independent tops, renames/deletes/recreates an empty child folder without Run/config writes/history changes');
  for(const name of ['run-comparison','recorded-source','auto-waveform']){
   await require('./'+name+'.cjs').run();
   const phase=JSON.parse(fs.readFileSync(path.join(fixture,'receipt.json'),'utf8'));
   assert.equal(phase.passed,true,phase.error);fs.writeFileSync(path.join(fixture,'integrated-'+name+'.json'),JSON.stringify(phase,null,2));
   receipt.checks.push(...phase.checks);
  }
  await vscode.commands.executeCommand('rtlIde.showSimulation');
  receipt.state=await state();receipt.passed=true;
 }catch(error){receipt.error=String(error);throw error;}
 finally{
  if(made){for(const name of ['two.sv','renamed.sv']){const file=path.join(directory,name);if(fs.existsSync(file))fs.unlinkSync(file);}fs.rmdirSync(directory);}
  originals.forEach(([file,bytes])=>{if(!fs.readFileSync(file).equals(bytes)){receipt.passed=false;receipt.cleanupError='Original project bytes changed: '+file;}});
  fs.writeFileSync(path.join(fixture,'receipt.json'),JSON.stringify(receipt,null,2));
 }
};
