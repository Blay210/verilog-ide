import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,mkdtemp,cp,readFile,writeFile} from 'node:fs/promises';
import {loadProject,runTest,loadRecordedInputs,loadRecordedTrace} from '@rtl-dev/core';
import {detectTools} from '@rtl-dev/toolchain';
import {VerilatorBackend} from '@rtl-dev/verilator';
import {SlangProvider} from '@rtl-dev/semantic';
import {parseVcd,mapTraceInternalSignals,valueAt,queryClockEdge} from '@rtl-dev/waveform';
import {reference,variants,bits} from '../pipeline-mac-reference';
const python=process.env.RTL_SEMANTIC_PYTHON;
test('E3 actual MAC reference assertions, retained graphs and every clock observation; faulty latency fails',
  {skip:!python||process.env.RTL_INTEGRATION!=='1',timeout:300000},async()=>{
  await mkdir('.dev/e3',{recursive:true});const root=await mkdtemp(path.resolve('.dev/e3/mac 한글 '));
  await cp('examples/pipeline-mac',root,{recursive:true,filter:source=>path.basename(source)!=='.rtl'});
  const project=await loadProject(root),tools=await detectTools();assert.ok(tools.toolchain);
  const backend=new VerilatorBackend(tools.toolchain),target=project.tests[0];
  const result=await runTest(project,target,backend);assert.equal(result.status,'passed',result.message);
  assert.match(await readFile(result.log,'utf8'),/E3_REFERENCE_PASS: 13 cycles, three instances/);
  const saved=await loadRecordedInputs(result),trace=await loadRecordedTrace(result),wave=parseVcd(trace.bytes.toString());
  assert.deepEqual(wave.timescale,{magnitude:1,unit:'ps'});
  const provider=new SlangProvider(python!,path.resolve('packages/semantic/python/analyze.py'),path.join(root,'.rtl/semantic-cache'));
  const design=await provider.hierarchy(saved.project,saved.target.name,[]);
  let observations=0;
  for(const variant of variants){
    const id='pipeline_mac_tb.'+variant.name;
    const graph=await provider.internalOperations(saved.project,saved.target.name,id,[]);
    assert.equal(graph.status,'supported',graph.reason);
    assert.ok(graph.nodes.some(n=>n.kind==='operator'&&n.label==='×'&&n.signalType.width===2*variant.width&&n.signalType.signed===variant.signed));
    assert.ok(graph.nodes.some(n=>n.kind==='conversion'&&n.signalType.width===variant.accWidth));
    const bindings=mapTraceInternalSignals(design,graph,wave.signals,result.top);
    const clock=bindings.find(b=>b.port==='clk')!;assert.equal(clock.state,'matched');
    let cursor='0';
    for(const sample of reference(variant)){
      // Skip reset-only initial 5ns edge, then traverse strict recorded rising edges.
      let edge=queryClockEdge(wave,{signal:clock.signalId!,time:cursor,direction:1,edge:'rising'}).time!;
      if(edge==='5000')edge=queryClockEdge(wave,{signal:clock.signalId!,time:edge,direction:1,edge:'rising'}).time!;
      assert.equal(edge,sample.tick);cursor=edge;
      for(const name of ['product','stage','acc'] as const){
        const binding=bindings.find(b=>b.port===name)!;assert.equal(binding.state,'matched');
        const width=name==='acc'?variant.accWidth:2*variant.width;
        const expected=bits(sample[name],width),changes=wave.channels.get(binding.code!)!;
        assert.equal(valueAt(changes,BigInt(edge)),expected,`${id}.${name} cycle${sample.cycle}`);
        assert.equal(valueAt(changes,BigInt(edge)+1000n),expected);
        if(name!=='product'&&sample.cycle>1)assert.equal(valueAt(changes,BigInt(edge)-1n),bits(sample.previous[name],width));
        observations++;
      }
    }
    assert.equal(queryClockEdge(wave,{signal:clock.signalId!,time:cursor,direction:1,edge:'rising'}).time,undefined);
  }
  const rtl=path.join(root,'rtl/pipeline_mac.sv'),original=await readFile(rtl,'utf8');
  await writeFile(rtl,original.replace('acc <= acc + stage','acc <= acc + product'));
  const faulty=await runTest(await loadProject(root),target,backend);
  assert.equal(faulty.status,'failed','Reference must detect use of same-cycle product.');
  assert.match(await readFile(faulty.log,'utf8'),/signed4 reference mismatch at cycle 2/);
  await writeFile(rtl,original);
  await writeFile(path.join(root,'.rtl/e3-receipt.json'),JSON.stringify({passed:true,runId:result.runId,traceSha256:trace.sha256,observations,variants:variants.map(v=>v.name),faultyLatency:faulty.status},null,2));
  console.log('E3_VERILATOR_PASS: '+root+' / '+observations+' observations / faulty latency rejected');
});
