import * as vscode from 'vscode';
import assert from 'node:assert/strict';
import path from 'node:path';
import {writeFile,readFile} from 'node:fs/promises';
import {readHistory} from '@rtl-dev/core';

/** Hold a real worker request, exercise production cancellation, then deliver it. */
export async function run() {
  const threads=require('node:worker_threads') as typeof import('node:worker_threads'), Native=threads.Worker;
  let held:(()=>void)|undefined, delayNext=false;
  threads.Worker=class extends Native {
    constructor(file:any,options?:any) {
      super(file,options);
      if(!String(file).endsWith('waveform-worker.cjs'))return;
      const post=this.postMessage.bind(this);
      this.postMessage=((message:any,...rest:any[])=>{
        if(delayNext&&message.kind==='clockEdge') {delayNext=false;held=()=>{held=undefined;(post as any)(message,...rest);};return;}
        return (post as any)(message,...rest);
      }) as typeof this.postMessage;
    }
  };
  const root=vscode.workspace.workspaceFolders![0].uri.fsPath;
  const state=()=>vscode.commands.executeCommand<any>('rtl.getStructure');
  const wait=async(check:()=>boolean|Promise<boolean>,timeout=10000)=>{const end=Date.now()+timeout;while(Date.now()<end){if(await check())return;await new Promise(r=>setTimeout(r,20));}assert.fail('Cancel harness observation timeout');};
  const report:any={passed:false,syntheticDispatchHold:true};
  const nativeTimer=globalThis.setTimeout;
  try {
    await vscode.extensions.getExtension('rtl-dev-local.rtl-dev')!.activate();
    const result=(await readHistory(root)).find(r=>r.status==='passed')!;assert.ok(result);
    await vscode.commands.executeCommand('rtl.showRecordedStructure',result);
    await vscode.commands.executeCommand('rtl.inspectStructure','pipeline_mac_tb.signed4');
    const clock=(await state()).trace.bindings.find((b:any)=>b.port==='clk');assert.equal(clock.state,'matched');
    await vscode.commands.executeCommand('rtl.chooseStructureClock',clock.signalId);
    await vscode.commands.executeCommand('rtl.setStructureTime','35000');
    if(process.env.RTL_E4_PHYSICAL_CLOCK==='1') {
      const gate=process.env.RTL_E4_GATE!,receipt=process.env.RTL_E4_RECEIPT!;
      const readGate=async()=>{try{return JSON.parse(await readFile(gate,'utf8'));}catch{return {};}};
      await writeFile(receipt,JSON.stringify({...report,stage:'ready'}));
      await wait(async()=>(await readGate()).start===true,300000);
      delayNext=true;
      // Give the human/UI observer time to act. The unmodified 15s deadline
      // has a separate native test; this mode checks the actual Cancel path.
      let extended=false;
      globalThis.setTimeout=((callback:any,ms:any,...args:any[])=>{
        if(!extended&&ms===15000){extended=true;return nativeTimer(callback,300000,...args);}
        return nativeTimer(callback,ms,...args);
      }) as typeof setTimeout;
      let finished=false;
      const pending=vscode.commands.executeCommand('rtl.moveStructureClock',1,'rising');
      void pending.then(()=>{finished=true;});
      await wait(()=>!!held);
      globalThis.setTimeout=nativeTimer;
      assert.ok(extended,'The physical observer deadline must be explicitly extended');
      report.observerDeadlineMs=300000;
      const started=Date.now();
      await writeFile(receipt,JSON.stringify({...report,stage:'click-progress-cancel'}));
      // Observe the production job without invoking the cancellation command.
      await wait(()=>finished,310000);
      report.elapsedMs=Date.now()-started;
      assert.ok(report.elapsedMs<290000,'Physical Cancel must settle before the observer deadline');
      assert.equal((await state()).trace.cursor,'35000');
      assert.ok(held,'Cancellation must finish while the real worker dispatch is still held');
      held!();await new Promise(r=>setTimeout(r,150));
      assert.equal((await state()).trace.cursor,'35000','Late native page cannot publish');
      assert.equal(await vscode.commands.executeCommand('rtl.moveStructureClock',1,'rising'),'45000');
      report.stage='retry-passed';
      await writeFile(receipt,JSON.stringify(report));
      await wait(async()=>(await readGate()).finish===true,300000);
      report.passed=true;report.physicalProgressCancel=true;
      console.log('RTL_STRUCTURE_PHYSICAL_CANCEL_PASS',JSON.stringify(report));
      return;
    }
    for(const action of ['cancel','close'] as const) {
      delayNext=true;
      const pending=vscode.commands.executeCommand('rtl.moveStructureClock',1,'rising');
      await wait(()=>!!held);
      const started=Date.now();
      if(action==='cancel')await vscode.commands.executeCommand('rtl.cancelStructureClock');
      else {const tab=vscode.window.tabGroups.all.flatMap(g=>g.tabs).find(t=>t.input instanceof vscode.TabInputWebview&&t.label.includes('RTL Structure'));assert.ok(tab);await vscode.window.tabGroups.close(tab);}
      let finished=false;void pending.then(()=>{finished=true;});
      await wait(()=>finished);
      report[action+'Ms']=Date.now()-started;
      assert.ok(report[action+'Ms']<2000,'Cancellation must not wait for the held worker page');
      if(action==='cancel')assert.equal((await state()).trace.cursor,'35000');else assert.equal((await state()).panelOpen,false);
      held!();await new Promise(r=>setTimeout(r,150));
      if(action==='cancel')assert.equal((await state()).trace.cursor,'35000','Late page cannot publish');
      else {await vscode.commands.executeCommand('rtl.openStructureWorkspace');await vscode.commands.executeCommand('rtl.refreshStructure');await vscode.commands.executeCommand('rtl.inspectStructure','pipeline_mac_tb.signed4');const nextClock=(await state()).trace.bindings.find((b:any)=>b.port==='clk');await vscode.commands.executeCommand('rtl.chooseStructureClock',nextClock.signalId);}
      await vscode.commands.executeCommand('rtl.setStructureTime','35000');
      assert.equal(await vscode.commands.executeCommand('rtl.moveStructureClock',1,'rising'),'45000','Retry must use the real worker');
      await vscode.commands.executeCommand('rtl.setStructureTime','35000');
    }
    delayNext=true;
    const started=Date.now(), timeoutQuery=vscode.commands.executeCommand('rtl.moveStructureClock',1,'rising');
    await wait(()=>!!held);
    let timedOut=false;void timeoutQuery.then(()=>{timedOut=true;});
    await wait(()=>timedOut,20000);
    report.timeoutMs=Date.now()-started;
    assert.ok(report.timeoutMs>=14500&&report.timeoutMs<18000,'Production 15-second deadline must settle the held page');
    assert.equal((await state()).trace.cursor,'35000');
    held!();await new Promise(r=>setTimeout(r,150));
    assert.equal((await state()).trace.cursor,'35000');
    assert.equal(await vscode.commands.executeCommand('rtl.moveStructureClock',1,'rising'),'45000');
    report.passed=true;console.log('RTL_STRUCTURE_CANCEL_PASS',JSON.stringify(report));
  } finally {held?.();threads.Worker=Native;globalThis.setTimeout=nativeTimer;await writeFile(process.env.RTL_E4_RECEIPT??path.join(root,'.rtl/e3-host.json'),JSON.stringify(report,null,2));}
}
