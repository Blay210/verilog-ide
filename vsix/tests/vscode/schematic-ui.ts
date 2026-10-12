import * as vscode from 'vscode';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {renderScopeOperations} from '../../packages/vscode/src/scope-operations-view';
import {probeStructureBrowser} from './structure-browser-probe';
export async function run() {
  await vscode.extensions.getExtension('rtl-dev-local.rtl-dev')!.activate();
  const root=vscode.workspace.workspaceFolders![0].uri.fsPath,out=path.join(root,'.rtl');
  await mkdir(out,{recursive:true});
  await vscode.commands.executeCommand('workbench.view.extension.rtl-structure');
  await vscode.commands.executeCommand('rtl.showStructure','matrix_basic');
  await vscode.commands.executeCommand('rtl.inspectStructure','matrix_tb.dut');
  const state=()=>vscode.commands.executeCommand<any>('rtl.getStructure');
  const modules=process.env.RTL_SCHEMATIC_4X4_FIXTURE?16:4;
  const first=await state();assert.equal(first.operations.status,'supported');assert.equal(first.operations.modules.length,modules);
  const dut=first.design.roots[0].children.find((n:any)=>n.id==='matrix_tb.dut');assert.ok(dut);
  const scene=renderScopeOperations(first.operations,false,()=> 'source',undefined,dut);
  assert.equal(scene.routingIncomplete,false,'All fixture edges need visible obstacle-free routes');
  const boundaries=(scene.svg.match(/data-boundary-port=/g)??[]).length;
  assert.equal(boundaries,dut.ports.length);assert.match(scene.svg,/scope-boundary/);assert.match(scene.svg,/class="junction"/);
  if(process.env.RTL_SCHEMATIC_BROWSER_PROBE==='1') {
    const report=await probeStructureBrowser(first,dut);
    await writeFile(path.join(out,'schematic-browser.json'),JSON.stringify(report,null,2));
    console.log('RTL_SCHEMATIC_BROWSER_PROBE',JSON.stringify(report));
    await vscode.commands.executeCommand('rtl.openStructureWorkspace');
    if(process.env.RTL_SCHEMATIC_BROWSER_ONLY==='1') {
      await writeFile(path.join(out,'schematic-ui-host.json'),JSON.stringify({passed:true,boundaries,modules,browserProbe:true,physicalInput:false}));
      console.log('RTL_SCHEMATIC_UI_PASS');return;
    }
  }
  await writeFile(path.join(out,'schematic-ui-ready.json'),JSON.stringify({ready:true,boundaries,modules}));
  const observations:any[]=[];
  for(let i=0;i<1200;i++) {
    const current=await state(),entry={inspected:current.inspected,mode:current.viewMode,operations:current.operations?.status,stale:current.stale};
    if(JSON.stringify(entry)!==JSON.stringify(observations.at(-1)))observations.push(entry);
    try {
      const verdict=JSON.parse(await readFile(path.join(out,'schematic-ui-finish.json'),'utf8'));
      if(verdict.finish){assert.equal(verdict.passed,true);await writeFile(path.join(out,'schematic-ui-host.json'),JSON.stringify({passed:true,boundaries,modules,observations,manual:verdict},null,2));console.log('RTL_SCHEMATIC_UI_PASS');return;}
    }catch(e){if((e as any).code!=='ENOENT')throw e;}
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  assert.fail('Schematic UI acceptance timed out.');
}
