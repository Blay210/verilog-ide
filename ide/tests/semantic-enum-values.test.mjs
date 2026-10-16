import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
import { requestFixture } from '../scripts/helpers/semantic-request.mjs';
import { semanticLookup } from '../scripts/helpers/semantic-lookup.mjs';
const require=createRequire(import.meta.url);
const {checkedProcess}=require('../dist/runtime/core/index.js');

test('scope presentation cache bounds type/value/UTF-8 payload with exact live native identities and independent output copies',async()=>{
  assert.ok(process.env.RTL_SEMANTIC_PYTHON);
  const source=`import sys\nsys.path.insert(0,${JSON.stringify(path.join(root,'language/python'))})\nfrom analyze import ScopeEnumValues\nimport pyslang as slang\ntree=slang.syntax.SyntaxTree.fromText('module m; typedef enum logic [1:0] { A=0, B=1 } a_t; typedef enum logic [1:0] { C=0, D=1 } b_t; a_t x; b_t y; endmodule')\ncompilation=slang.ast.Compilation(); compilation.addSyntaxTree(tree)\nscope=compilation.getRoot().topInstances[0].body\na=scope.lookupName('x',slang.ast.LookupLocation.max,slang.ast.LookupFlags.NoUndeclaredError).type.canonicalType\nb=scope.lookupName('y',slang.ast.LookupLocation.max,slang.ast.LookupFlags.NoUndeclaredError).type.canonicalType\nvalues=[{'name':'A','value':'0'},{'name':'B','value':'1'}]\ncache=ScopeEnumValues(max_types=1,max_values=2,max_bytes=4)\nassert cache.put(a,values) and cache.get(b) is None\nvalues[0]['name']='changed'; copy=cache.get(a); copy[1]['value']='changed'\nassert cache.get(a)==[{'name':'A','value':'0'},{'name':'B','value':'1'}]\nassert not cache.put(a,[]) and not cache.put(b,[])\nassert cache.values==2 and cache.bytes==4 and len(cache.entries)==1\nassert not ScopeEnumValues(max_values=1).put(a,cache.get(a))\nassert not ScopeEnumValues(max_bytes=3).put(a,[{'name':'한','value':'0'}])\nassert not ScopeEnumValues(max_types=0).put(a,[])\nempty=ScopeEnumValues(); assert empty.put(a,[]) and empty.get(a)==[] and empty.get(b) is None\nprint('native identity, caps and output ownership verified')\n`;
  assert.match(await checkedProcess({executable:process.env.RTL_SEMANTIC_PYTHON,args:['-I','-B','-c',source],cwd:root}),/ownership verified/);
});

test('real enum completions retain shadowed package spelling/defaults and whole JSON when every cache budget refuses reuse',{timeout:180000},async t=>{
  const base=await semanticLookup({files:3});
  for(const cacheLimits of [{max_types:0},{max_values:31},{max_bytes:1}]){
    // This compares eight independent compiler requests, not one latency SLA.
    // Keep the full Unicode/enum workload and each provider's 15-second budget;
    // give every cache mode its own bounded functional comparison interval.
    await t.test(JSON.stringify(cacheLimits),{timeout:60000},async()=>{
      const limited=await semanticLookup({files:3,cacheLimits});
      assert.deepEqual(limited.phases.map(p=>p.semanticHash),base.phases.map(p=>p.semanticHash));
      assert.equal(limited.livePythonAfter,0);assert.deepEqual(limited.tempEntriesAfter,[]);
    });
  }
});

test('real parameterizations and subsequent overlays never share enum values solely by declaration, width or name',{timeout:60000},async t=>{
  const f=await requestFixture({files:3});t.after(()=>f.dispose());
  const text=f.text.replace('logic [W-1:0] local_value;','typedef enum logic [7:0] { ENUM_A=W, ENUM_B=W+1 } mode_t; mode_t local_mode; logic [W-1:0] local_value;');
  const testText=f.tests[0].text.replace('u();','u(); dut #(.W(8)) other();');
  const project={...f.project,tests:[f.project.tests[0]]};
  const query={file:f.file,offset:text.indexOf('$display')};
  const result=await f.provider.complete(project,[{file:f.file,text},{file:f.tests[0].file,text:testText}],query);
  assert.ok(!result.some(v=>['local_mode','ENUM_A','ENUM_B'].includes(v.name)),'Different native enum values in the same source must remain ambiguous.');
  const changed=text.replace('ENUM_A=W, ENUM_B=W+1','ENUM_A=32, ENUM_B=33');
  const fresh=await f.provider.complete(project,[{file:f.file,text:changed},{file:f.tests[0].file,text:testText}],{...query,offset:changed.indexOf('$display')});
  assert.ok(fresh.some(v=>v.name==='local_mode'&&v.enumValues?.length===2));await f.clean();
});

test('unsupported large or unknown enum presentations stay absent instead of publishing a truncated or reused value list',{timeout:60000},async t=>{
  const f=await requestFixture({files:2});t.after(()=>f.dispose());const project={...f.project,tests:[f.project.tests[0]]};
  for(const declaration of [
    'typedef enum logic [8:0] {'+Array.from({length:257},(_,i)=>`VALUE_${i}=${i}`).join(',')+'} mode_t;',
    "typedef enum logic [1:0] { BAD=2'bxx, GOOD=2'b01 } mode_t;",
  ]){
    const text=f.text.replace('logic [W-1:0] local_value;',declaration+' mode_t local_mode; mode_t another_mode; logic [W-1:0] local_value;');
    const result=await f.provider.complete(project,[{file:f.file,text}],{file:f.file,offset:text.indexOf('$display')});
    for(const name of ['local_mode','another_mode']){const entry=result.find(v=>v.name===name);assert.ok(entry);assert.equal(entry.enumValues,undefined);}
    await f.clean();
  }
});
