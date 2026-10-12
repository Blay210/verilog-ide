import * as vscode from 'vscode';
import assert from 'node:assert/strict';
import path from 'node:path';
import {readFileSync} from 'node:fs';
import {writeFile,readFile} from 'node:fs/promises';
import {loadProject} from '@rtl-dev/core';

/** Native Windows process-tree cancellation; only one analyzer invocation is replaced. */
export async function run() {
  const receipt=process.env.RTL_E4_RECEIPT!, host=path.dirname(receipt);
  const sleeper=path.join(host,'analysis-sleeper.py');
  await writeFile(sleeper,`import os, sys, subprocess, time\np = subprocess.Popen([sys.executable, '-I', '-B', '-c', 'import time; time.sleep(120)'])\nprint('RTL_HOLD_PIDS %d %d' % (os.getpid(), p.pid), flush=True)\ntime.sleep(120)\n`);
  const cp=require('node:child_process') as typeof import('node:child_process'), nativeSpawn=cp.spawn;
  const nativeTimeout=AbortSignal.timeout;
  let next:string|undefined, held:{parent:number;child?:number;exited:boolean}|undefined;
  const report:any={passed:false,syntheticAnalyzerDelay:true,cases:[]};
  const wait=async(check:()=>boolean|Promise<boolean>,ms=10000)=>{const end=Date.now()+ms;while(Date.now()<end){if(await check())return;await new Promise(r=>setTimeout(r,20));}assert.fail('Analysis cancellation observation timeout');};
  const state=()=>vscode.commands.executeCommand<any>('rtl.getStructure');
  const alive=(pid:number)=>{try{process.kill(pid,0);return true;}catch(error:any){if(error.code==='ESRCH')return false;throw error;}};
  cp.spawn=((file:any,args:any[],options:any)=>{
    const index=args?.findIndex(a=>typeof a==='string'&&/[\\/]analyze\.py$/.test(a));
    if(next&&index>=0&&JSON.parse(readFileSync(args[index+1],'utf8')).operation===next){
      next=undefined;
      const copy=[...args];copy[index]=sleeper;
      const child=nativeSpawn(file,copy,options);held={parent:child.pid!,exited:false};
      const observation=held;let output='';
      child.stdout?.on('data',chunk=>{output+=String(chunk);const pids=output.match(/RTL_HOLD_PIDS (\d+) (\d+)/);if(pids){observation.parent=Number(pids[1]);observation.child=Number(pids[2]);}});
      child.on('close',()=>{observation.exited=true;});return child;
    }
    return nativeSpawn(file,args,options);
  }) as typeof cp.spawn;
  const root=vscode.workspace.workspaceFolders![0].uri.fsPath;
  const project=await loadProject(root),source=project.sources[0],original=await readFile(source,'utf8');
  try {
    await vscode.extensions.getExtension('rtl-dev-local.rtl-dev')!.activate();
    await vscode.commands.executeCommand('rtl.showStructure',project.tests[0].name);
    assert.ok((await state()).design?.roots.length,'Initial real hierarchy must load');
    await vscode.commands.executeCommand('rtl.inspectStructure','pipeline_mac_tb.signed4');
    if(process.env.RTL_E4_PHYSICAL_ANALYSIS==='1') {
      const gate=process.env.RTL_E4_GATE!;
      const verdict=async()=>{try{return JSON.parse(await readFile(gate,'utf8'));}catch{return {};}};
      await writeFile(sleeper,(await readFile(sleeper,'utf8')).replaceAll('sleep(120)','sleep(300)'));
      await writeFile(receipt,JSON.stringify({...report,stage:'ready'}));
      await wait(async()=>(await verdict()).start===true,300000);
      let extended=false;
      AbortSignal.timeout=((ms:number)=>{if(ms===15000){extended=true;return nativeTimeout(300000);}return nativeTimeout(ms);});
      next='scopeOperations';
      let settled=false;
      const pending=vscode.commands.executeCommand('rtl.showScopeOperations');void pending.then(()=>{settled=true;});
      await wait(()=>!!held?.child);AbortSignal.timeout=nativeTimeout;
      assert.ok(extended,'Physical observer deadline must be explicitly extended');
      const running=held!,started=Date.now();
      await writeFile(receipt,JSON.stringify({...report,stage:'click-progress-cancel',observerDeadlineMs:300000}));
      await wait(()=>settled&&running.exited,310000);
      assert.ok(Date.now()-started<290000,'Cancellation must happen before observer deadline');
      await wait(()=>!alive(running.parent)&&!alive(running.child!));
      const cancelled=await state();assert.equal(cancelled.panelOpen,true);assert.match(cancelled.modeNotice,/cancelled/);assert.equal(cancelled.operations,undefined);
      await vscode.commands.executeCommand('rtl.showScopeOperations');
      assert.equal((await state()).operations.status,'supported');
      report.physicalProgressCancel=true;report.observerDeadlineMs=300000;report.stage='retry-passed';
      await writeFile(receipt,JSON.stringify(report));
      await wait(async()=>(await verdict()).finish===true,300000);
      report.passed=true;console.log('RTL_ANALYSIS_PHYSICAL_CANCEL_PASS',JSON.stringify(report));return;
    }
    for(const operation of ['hierarchy','scopeOperations','internalOperations']) {
      report.stage=operation;
      held=undefined;next=operation;
      const pending=vscode.commands.executeCommand(operation==='hierarchy'?'rtl.refreshStructure':operation==='scopeOperations'?'rtl.showScopeOperations':'rtl.showInternalOperations');
      await wait(()=>!!held?.child);
      const running=held!;assert.ok(alive(running.parent)&&alive(running.child!));
      const tab=vscode.window.tabGroups.all.flatMap(g=>g.tabs).find(t=>t.input instanceof vscode.TabInputWebview&&t.label.includes('RTL Structure'));assert.ok(tab);
      const started=Date.now();await vscode.window.tabGroups.close(tab);
      let settled=false;void pending.then(()=>{settled=true;});
      await wait(()=>settled&&running.exited,8000);
      await wait(()=>!alive(running.parent)&&!alive(running.child!),8000);
      const closed=await state();assert.equal(closed.panelOpen,false);assert.equal(closed.operations,undefined);
      await new Promise(r=>setTimeout(r,150));assert.equal((await state()).panelOpen,false,'Late work must not reopen the panel');
      const elapsedMs=Date.now()-started;
      await vscode.commands.executeCommand('rtl.openStructureWorkspace');
      await vscode.commands.executeCommand('rtl.refreshStructure');
      await vscode.commands.executeCommand('rtl.inspectStructure','pipeline_mac_tb.signed4');
      const recovered=await state();assert.equal(recovered.stale,false);assert.equal(recovered.operations.status,'supported');
      assert.equal(await readFile(source,'utf8'),original);
      report.cases.push({operation,elapsedMs,parentExited:true,childExited:true,recovered:true});
    }
    report.passed=true;console.log('RTL_ANALYSIS_CANCEL_PASS',JSON.stringify(report));
  } finally {
    cp.spawn=nativeSpawn;
    AbortSignal.timeout=nativeTimeout;
    if(held&&!held.exited)nativeSpawn('taskkill.exe',['/PID',String(held.parent),'/T','/F'],{windowsHide:true,stdio:'ignore'});
    await writeFile(receipt,JSON.stringify(report,null,2));
  }
}
