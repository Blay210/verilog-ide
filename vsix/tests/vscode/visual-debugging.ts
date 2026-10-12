import * as vscode from 'vscode';
import assert from 'node:assert/strict';
import path from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
import {readHistory} from '@rtl-dev/core';
export async function run() {
  await vscode.extensions.getExtension('rtl-dev-local.rtl-dev')!.activate();
  const root=vscode.workspace.workspaceFolders![0].uri.fsPath;
  const result=(await readHistory(root)).find(r=>r.status==='passed')!;assert.ok(result);
  await vscode.commands.executeCommand('rtl.showRecordedStructure',result);
  await vscode.commands.executeCommand('rtl.inspectStructure','pipeline_mac_tb.signed4');
  await vscode.commands.executeCommand('rtl.showScopeOperations');
  const first=await vscode.commands.executeCommand<any>('rtl.getStructure');
  const clock=first.trace.bindings.find((b:any)=>b.port==='clk');assert.equal(clock.state,'matched');
  await vscode.commands.executeCommand('rtl.chooseStructureClock',clock.signalId);
  await vscode.commands.executeCommand('rtl.setStructureTime','35000');
  const receipt=process.env.RTL_E4_RECEIPT??path.join(root,'.rtl/e4-host.json'),gate=process.env.RTL_E4_GATE??path.join(root,'.rtl/e4-finish.json');
  const state=()=>vscode.commands.executeCommand<any>('rtl.getStructure');
  await writeFile(path.join(root,'.rtl/e4-ready.json'),JSON.stringify({runId:result.runId,ready:true}));
  // Human/Computer Use acceptance gate, bounded to ten minutes; no production hook.
  const observations:any[]=[];
  for(let i=0;i<1200;i++){
    const current=await state();
    const entry={inspected:current.inspected,operations:current.operations?.status,cursor:current.trace?.cursor,clock:current.trace?.clockId,stale:current.stale};
    if(JSON.stringify(entry)!==JSON.stringify(observations.at(-1)))observations.push(entry);
    try {const verdict=JSON.parse(await readFile(gate,'utf8'));if(verdict.finish){assert.equal(verdict.passed,true);await writeFile(receipt,JSON.stringify({passed:true,observations,manual:verdict},null,2));console.log('RTL_E4_HOST_PASS: observed UI flow '+observations.length+' states');return;}}catch(e){if((e as any).code!=='ENOENT')throw e;}
    await new Promise(r=>setTimeout(r,500));
  }
  assert.fail('E4 UI acceptance timed out');
}
