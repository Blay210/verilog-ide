import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {loadProject} from '@rtl-dev/core';
import {SlangProvider} from '@rtl-dev/semantic';
import {renderInternalOperations} from '../../packages/vscode/src/internal-operations-view';
const python=process.env.RTL_SEMANTIC_PYTHON;
test('E4 bounded real graphs: short/long chain measurements and over-limit rejection', {skip:!python},async()=>{
  await mkdir('.dev/e4',{recursive:true});const root=await mkdtemp(path.resolve('.dev/e4/graph-scale-'));
  await writeFile(path.join(root,'rtl.toml'),'version=1\n[project]\nname="graph-scale"\n[sources]\nrtl=["design.sv"]\n');
  const samples=[];
  for(const count of [24,36,80]){
    const declarations=Array.from({length:count},(_,i)=>`wire [7:0] s${i} = ${i?'s'+(i-1):'a'} + 8'd1;`).join('\n');
    await writeFile(path.join(root,'design.sv'),`module dut(input wire [7:0] a,output wire [7:0] q);\n${declarations}\nassign q=s${count-1};\nendmodule`);
    const provider=new SlangProvider(python!,path.resolve('packages/semantic/python/analyze.py'),path.join(root,'.rtl/cache'));
    const start=performance.now(),graph=await provider.internalOperations(await loadProject(root),undefined,'dut',[]),analysisMs=performance.now()-start;
    const renderStart=performance.now(),scene=renderInternalOperations(graph,()=> 'source'),renderMs=performance.now()-renderStart;
    if(count<80){assert.equal(graph.status,'supported',graph.reason);assert.ok(graph.nodes.length<=256);assert.ok(Number.isFinite(scene.width)&&scene.width>0);}
    else{assert.equal(graph.status,'unsupported');assert.match(graph.reason,/exceeds 256 nodes/i);assert.deepEqual(graph.nodes,[]);assert.deepEqual(graph.edges,[]);}
    samples.push({count,status:graph.status,reason:graph.reason,nodes:graph.nodes.length,edges:graph.edges.length,analysisMs,renderMs,svgBytes:Buffer.byteLength(scene.svg),width:scene.width,height:scene.height,rssMiB:process.memoryUsage().rss/1024/1024});
  }
  await writeFile(path.join(root,'.rtl/e4-scale.json'),JSON.stringify({samples,scope:'Native analysis and SVG serialization; not browser frame latency or memory recovery'},null,2));
  console.log('E4_GRAPH_SCALE: '+root+' '+JSON.stringify(samples));
});
