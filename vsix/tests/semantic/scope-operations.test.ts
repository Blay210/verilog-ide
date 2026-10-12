import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import {loadProject,runTest,loadRecordedInputs,loadRecordedTrace} from '@rtl-dev/core';
import {SlangProvider} from '@rtl-dev/semantic';
import {renderScopeOperations} from '../../packages/vscode/src/scope-operations-view';
import {detectTools} from '@rtl-dev/toolchain';
import {VerilatorBackend} from '@rtl-dev/verilator';
import {parseVcd,mapTraceInternalSignals,valueAt} from '@rtl-dev/waveform';

const python=process.env.RTL_SEMANTIC_PYTHON;
const source=`module leaf(input logic [7:0] a,output wire [7:0] y); assign y=a+8'd1; endmodule
module parent(input logic clk,rst,input logic [7:0] a,b,output logic [7:0] y);
wire [7:0] sum,child_out;
assign sum=a+b;
leaf u(.a(sum),.y(child_out));
always_ff @(posedge clk) if(rst)y<=0;else y<=child_out;
endmodule`;
test('native parent logic joins opaque child ports and preserves writer, width and unsupported boundaries',
  {skip:!python},async()=>{
  await mkdir('.dev/scope-operations',{recursive:true});const root=await mkdtemp(path.resolve('.dev/scope-operations/parent 한글 '));
  const file=path.join(root,'design.sv');
  await writeFile(file,source);await writeFile(path.join(root,'rtl.toml'),'version=1\n[project]\nname="scope-operations"\n[sources]\nrtl=["design.sv"]\n');
  const project=await loadProject(root),provider=new SlangProvider(python!,path.resolve('packages/semantic/python/analyze.py'),path.join(root,'.rtl/cache'));
  const legacy=await provider.internalOperations(project,undefined,'parent',[]);assert.equal(legacy.status,'unsupported');assert.match(legacy.reason,/leaf/);
  const graph=await provider.scopeOperations(project,undefined,'parent',[]);assert.equal(graph.status,'supported',graph.reason);
  assert.equal(graph.modules?.length,1);assert.equal(graph.modules![0].instanceId,'parent.u');
  assert.equal(graph.nodes.filter(n=>n.kind==='operator'&&n.label==='+').length,1,'Child + stays opaque');
  assert.equal(graph.nodes.filter(n=>n.kind==='register').length,1);
  const sum=graph.nodes.find(n=>n.declarationId==='parent.sum')!,out=graph.nodes.find(n=>n.declarationId==='parent.child_out')!;
  const input=graph.modules![0].ports.find(p=>p.name==='a')!,output=graph.modules![0].ports.find(p=>p.name==='y')!;
  assert.ok(graph.edges.some(e=>e.source===sum.id&&e.target===input.nodeId&&e.role==='module input'));
  assert.ok(graph.edges.some(e=>e.source===output.nodeId&&e.target===out.id&&e.role==='module output'));
  const scene=renderScopeOperations(graph,false,()=> 'source',()=> 'value');
  assert.match(scene.svg,/data-node="parent.u"/);assert.match(scene.svg,/data-port-value/);assert.ok(scene.width>0&&scene.height>0);
  const cases=[
    [source.replace('assign sum=a+b;','assign sum=a+b; assign child_out=a;'),/Multiple writers/],
    [source.replace('output wire [7:0] y','inout wire [7:0] y').replace("assign y=a+8'd1;",''),/inout/],
    [source.replace('wire [7:0] sum,child_out;','wire [7:0] sum; wire [3:0] child_out;'),/width conversion/],
    [source.replace('leaf u(', 'for(genvar i=0;i<2;i++) begin:g wire local_net; end leaf u('),/Generate scopes/]
  ] as const;
  for(const [text,reason] of cases) {
    const result=await provider.scopeOperations(project,undefined,'parent',[{file,text}]);
    assert.equal(result.status,'unsupported',JSON.stringify(result));assert.match(result.reason,reason);
    assert.equal(result.nodes.length,0);assert.equal(result.edges.length,0);assert.equal(result.modules,undefined,'No partial opaque boundary on rejection');
  }
  const aborted=new AbortController();aborted.abort();await assert.rejects(provider.scopeOperations(project,undefined,'parent',[],aborted.signal));
  await writeFile(path.join(root,'.rtl/scope-receipt.json'),JSON.stringify({passed:true,parentOperators:1,registers:1,childBlocks:1,negativeCases:4},null,2));
  console.log('SCOPE_OPERATIONS_PASS: '+root);
});

test('actual parent add, opaque child and clocked output agree with retained signal observations',
  {skip:!python||process.env.RTL_INTEGRATION!=='1',timeout:300000},async()=>{
  await mkdir('.dev/scope-operations',{recursive:true});const root=await mkdtemp(path.resolve('.dev/scope-operations/simulation 한글 '));
  await writeFile(path.join(root,'design.sv'),'`timescale 1ns/1ps\n'+source);
  await writeFile(path.join(root,'tb.sv'),`module scope_tb;
timeunit 1ns;timeprecision 1ps;
logic clk=0,rst=1;logic [7:0] a=0,b=0;wire [7:0] y;
parent dut(.*);always #5 clk=~clk;
initial begin
$dumpfile("waveform.vcd");$dumpvars(0,scope_tb);
#6;assert(y==0)else $fatal(1,"reset mismatch");rst=0;a=250;b=8;
#10;assert(y==3)else $fatal(1,"wrapped parent/child output mismatch");a=4;b=5;
#10;assert(y==10)else $fatal(1,"second clock output mismatch");$finish;
end endmodule`);
  await writeFile(path.join(root,'rtl.toml'),'version=1\n[project]\nname="scope-simulation"\n[sources]\nrtl=["design.sv"]\n[simulation]\nbackend="verilator"\ntiming=true\nwaveform="vcd"\n[[test]]\nname="basic"\ntop="scope_tb"\nsources=["tb.sv"]\n');
  const project=await loadProject(root),tools=await detectTools();assert.ok(tools.toolchain);
  const result=await runTest(project,project.tests[0],new VerilatorBackend(tools.toolchain));assert.equal(result.status,'passed',result.message);
  const saved=await loadRecordedInputs(result),trace=await loadRecordedTrace(result),wave=parseVcd(trace.bytes.toString());
  const provider=new SlangProvider(python!,path.resolve('packages/semantic/python/analyze.py'),path.join(root,'.rtl/cache'));
  const design=await provider.hierarchy(saved.project,saved.target.name,[]),graph=await provider.scopeOperations(saved.project,saved.target.name,'scope_tb.dut',[]);
  assert.equal(graph.status,'supported',graph.reason);assert.equal(graph.modules!.length,1);
  const bindings=mapTraceInternalSignals(design,graph,wave.signals,'scope_tb');
  for(const [name,time,value] of [['y','5000',0],['sum','15000',2],['child_out','15000',3],['y','15000',3],['sum','25000',9],['child_out','25000',10],['y','25000',10]] as const) {
    const binding=bindings.find(b=>b.port===name)!;assert.equal(binding.state,'matched');
    assert.equal(valueAt(wave.channels.get(binding.code!)!,BigInt(time)),value.toString(2).padStart(8,'0'),name+'@'+time);
  }
  assert.equal(bindings.length,graph.nodes.filter(n=>n.kind==='signal').length,'Child synthetic terminals cannot acquire parent observations');
  await writeFile(path.join(root,'.rtl/scope-simulation-receipt.json'),JSON.stringify({passed:true,simulation:result.status,runId:result.runId,observations:7,parentOperators:graph.nodes.filter(n=>n.kind==='operator').length,childBlocks:graph.modules!.length},null,2));
  console.log('SCOPE_SIMULATION_PASS: '+root);
});
