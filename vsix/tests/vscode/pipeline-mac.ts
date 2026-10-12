import * as vscode from 'vscode';
import assert from 'node:assert/strict';
import path from 'node:path';
import {writeFile} from 'node:fs/promises';
import {readHistory} from '@rtl-dev/core';
import {reference,variants,bits} from '../pipeline-mac-reference';
import {renderScopeOperations} from '../../packages/vscode/src/scope-operations-view';
export async function run() {
  await vscode.extensions.getExtension('rtl-dev-local.rtl-dev')!.activate();
  const root=vscode.workspace.workspaceFolders![0].uri.fsPath;
  const result=(await readHistory(root)).find(r=>r.status==='passed')!;assert.ok(result);
  const state=()=>vscode.commands.executeCommand<any>('rtl.getStructure');
  const waitFor=async(check:()=>Promise<boolean>)=>{for(let i=0;i<100;i++){if(await check())return;await new Promise(r=>setTimeout(r,100));}assert.fail('E3 host cursor timeout');};
  await vscode.commands.executeCommand('rtl.showRecordedStructure',result);
  await vscode.commands.executeCommand('rtl.openWaveform',result.waveform);
  await waitFor(async()=> (await vscode.commands.executeCommand<any[]>('rtl.getWaveformState'))!.some(w=>w.link?.runId===result.runId&&w.link.state==='ready'));
  let observations=0;
  for(const v of variants){
    await vscode.commands.executeCommand('rtl.inspectStructure','pipeline_mac_tb.'+v.name);
    await vscode.commands.executeCommand('rtl.showScopeOperations');
    assert.equal((await state()).viewMode,'schematic');
    const graph=(await state()).operations;assert.equal(graph.status,'supported',graph.reason);
    const selected=(await state()).design.roots[0].children.find((n:any)=>n.id===graph.instanceId);assert.ok(selected);
    const rendered=renderScopeOperations(graph,false,()=> 'source',undefined,selected);
    if(rendered.routingIncomplete)await writeFile(path.join(root,'.rtl/routing-failure.json'),JSON.stringify({graph,selected,unrouted:rendered.routingUnrouted},null,2));
    assert.equal(rendered.routingIncomplete,false,'Recorded MAC needs complete diagram routes: '+rendered.routingUnrouted.join(','));
    const signals=graph.nodes.filter((n:any)=>n.kind==='signal'&&n.signalName!==undefined);
    const clock=(await state()).trace.bindings.find((b:any)=>b.port==='clk');assert.equal(clock.state,'matched');
    await vscode.commands.executeCommand('rtl.chooseStructureClock',clock.signalId);
    await vscode.commands.executeCommand('rtl.setStructureTime','5000');
    for(const sample of reference(v)){
      assert.equal(await vscode.commands.executeCommand('rtl.moveStructureClock',1,'rising'),sample.tick);
      const observed=await state();
      for(const name of ['product','stage','acc'] as const){
        const id=String(signals.findIndex((n:any)=>n.signalName===name));assert.notEqual(id,'-1');
        assert.equal(observed.trace.values[id]?.reason,bits(sample[name],name==='acc'?v.accWidth:2*v.width),`${v.name}.${name} cycle${sample.cycle}`);observations++;
      }
      await waitFor(async()=> (await vscode.commands.executeCommand<any[]>('rtl.getWaveformState'))!.some(w=>w.link?.runId===result.runId&&w.link.time===sample.tick));
    }
    const source=graph.nodes.find((n:any)=>n.kind==='operator')!;
    await vscode.commands.executeCommand('rtl.openInternalOperationSource',source.id);
    assert.equal(vscode.window.activeTextEditor?.document.uri.scheme,'rtl-recorded');
  }
  const waveformState=()=>vscode.commands.executeCommand<any[]>('rtl.getWaveformState');
  // Opening recorded source may replace VS Code's preview waveform tab.
  await vscode.commands.executeCommand('rtl.openWaveform',result.waveform);
  await waitFor(async()=> (await waveformState())!.some(w=>w.link?.runId===result.runId&&w.link.state==='ready'));
  console.log('E4_WAVE_PATH_IDENTITY',JSON.stringify({requested:result.waveform,opened:(await waveformState())!.map(w=>w.file)}));
  await vscode.commands.executeCommand('rtl.setWaveformTime',result.waveform,'35000');
  await waitFor(async()=> (await state()).trace?.cursor === '35000');
  const waveTab=vscode.window.tabGroups.all.flatMap(g=>g.tabs).find(t=>t.input instanceof vscode.TabInputCustom&&t.input.viewType==='rtl.waveform');assert.ok(waveTab);
  assert.ok(await vscode.window.tabGroups.close(waveTab));
  await waitFor(async()=>!(await waveformState())!.some(w=>w.link?.runId===result.runId));
  assert.equal((await state()).trace.cursor,'35000','Closing waveform must not disconnect the diagram');
  await vscode.commands.executeCommand('rtl.openWaveform',result.waveform);
  await waitFor(async()=> (await waveformState())!.some(w=>w.link?.runId===result.runId&&w.link.time==='35000'));
  const diagramTab=vscode.window.tabGroups.all.flatMap(g=>g.tabs).find(t=>t.input instanceof vscode.TabInputWebview&&t.label.includes('RTL Structure'));assert.ok(diagramTab);
  assert.ok(await vscode.window.tabGroups.close(diagramTab));
  await waitFor(async()=> !(await state()).panelOpen);
  await vscode.commands.executeCommand('rtl.openStructureWorkspace');
  assert.equal((await state()).trace.state,'unavailable','Closed diagram must request refresh rather than display old values');
  await vscode.commands.executeCommand('rtl.refreshStructure');
  await vscode.commands.executeCommand('rtl.inspectStructure','pipeline_mac_tb.signed4');
  await vscode.commands.executeCommand('rtl.showScopeOperations');
  const clock=(await state()).trace.bindings.find((b:any)=>b.port==='clk');assert.equal(clock.state,'matched');
  await vscode.commands.executeCommand('rtl.chooseStructureClock',clock.signalId);
  await vscode.commands.executeCommand('rtl.setStructureTime','35000');
  assert.equal(await vscode.commands.executeCommand('rtl.moveStructureClock',1,'rising'),'45000');
  assert.equal(await vscode.commands.executeCommand('rtl.moveStructureClock',-1,'rising'),'35000');
  await waitFor(async()=> (await waveformState())!.some(w=>w.link?.runId===result.runId&&w.link.time==='35000'));
  await writeFile(path.join(root,'.rtl/e3-host.json'),JSON.stringify({passed:true,runId:result.runId,observations,variants:variants.map(v=>v.name),sharedCursor:true,recordedSource:true,waveToDiagram:true,waveCloseReopen:true,diagramCloseRefresh:true,clockBothDirections:true},null,2));
  console.log('RTL_E3_HOST_PASS: three MAC graphs / 117 values / clock-wave cursor / readonly source');
}
