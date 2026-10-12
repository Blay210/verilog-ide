import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir, mkdtemp, readFile, writeFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {loadProject} from '@rtl-dev/core';
import {SlangProvider} from '@rtl-dev/semantic';
import {renderScopeOperations} from '../../packages/vscode/src/scope-operations-view';

const python = process.env.RTL_SEMANTIC_PYTHON;
test('real 4x4 opaque MAC connectivity retains all boundary ports and visible routes', {skip:!python}, async () => {
  await mkdir('.dev/e4', {recursive:true});
  const root = await mkdtemp(path.resolve('.dev/e4/schematic-4x4-'));
  const inputs = ['clk', 'load_weight', ...Array.from({length:4}, (_,r)=>`a${r}`), ...Array.from({length:16}, (_,i)=>`w${Math.floor(i/4)}${i%4}`)];
  const outputs = Array.from({length:4}, (_,c)=>`y${c}`);
  const wires:string[] = [], instances:string[] = [];
  for (let r=0;r<4;r++) for (let c=0;c<4;c++) {
    const out = r===3 ? `y${c}` : `partial${r}${c}`;
    if (r<3) wires.push(`wire signed [15:0] ${out};`);
    instances.push(`mac_pe pe${r}${c}(.clk(clk),.load_weight(load_weight),.data_in(a${r}),.weight_in(w${r}${c}),.acc_in(${r ? `partial${r-1}${c}` : "16'sd0"}),.acc_out(${out}));`);
  }
  const source = `module matrix(input logic clk,load_weight,input logic signed [7:0] ${inputs.slice(2).join(',')},output wire signed [15:0] ${outputs.join(',')});\n timeunit 1ns; timeprecision 1ps;\n${wires.join('\n')}\n${instances.join('\n')}\nendmodule\n`;
  await writeFile(path.join(root,'matrix.sv'), source);
  await writeFile(path.join(root,'mac_pe.sv'), await readFile('examples/systolic-mini/rtl/mac_pe.sv','utf8'));
  await writeFile(path.join(root,'rtl.toml'), 'version=1\n[project]\nname="schematic-4x4"\n[sources]\nrtl=["matrix.sv","mac_pe.sv"]\n');
  const project=await loadProject(root), provider=new SlangProvider(python!,path.resolve('packages/semantic/python/analyze.py'),path.join(root,'.rtl/cache'));
  const start=performance.now();
  const hierarchy=await provider.hierarchy(project,undefined,[]);
  const graph=await provider.scopeOperations(project,undefined,'matrix',[]);
  const analysisMs=performance.now()-start;
  assert.equal(graph.status,'supported',graph.reason);
  assert.equal(graph.modules?.length,16);
  const module=hierarchy.roots.find(n=>n.id==='matrix'); assert.ok(module);
  const renderStart=performance.now(), scene=renderScopeOperations(graph,false,()=> 'source',undefined,module), renderMs=performance.now()-renderStart;
  const boundaryCount=(scene.svg.match(/data-boundary-port=/g)??[]).length;
  const receipt={analysisMs,renderMs,nodes:graph.nodes.length,edges:graph.edges.length,modules:graph.modules?.length,boundaryCount,width:scene.width,height:scene.height,svgBytes:Buffer.byteLength(scene.svg),routingIncomplete:scene.routingIncomplete,routingUnrouted:scene.routingUnrouted,scope:'Native graph and SVG; not browser layout readability or interactive frame latency'};
  await writeFile(path.join(root,'.rtl/schematic-scale.json'),JSON.stringify(receipt,null,2));
  await writeFile(path.join(root,'.rtl/schematic.svg'),scene.svg);
  console.log('E4_SCHEMATIC_4X4: '+root+' '+JSON.stringify(receipt));
  assert.equal(boundaryCount,inputs.length+outputs.length);
  assert.equal(scene.routingIncomplete,false,'Every 4x4 connection must have a visible route');
  for (const child of graph.modules!) assert.ok(scene.svg.includes(`data-node="${child.instanceId}"`),child.instanceId);
});
