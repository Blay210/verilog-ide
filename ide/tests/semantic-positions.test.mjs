import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
import { requestFixture } from '../scripts/helpers/semantic-request.mjs';
const require=createRequire(import.meta.url);
const {checkedProcess}=require('../dist/runtime/core/index.js');
const python=process.env.RTL_SEMANTIC_PYTHON;
assert.ok(python,'Use the verified runtime; no silent semantic skip.');

test('compiler source positions match every UTF-8 byte boundary, CRLF/BOM/astral/Unicode lines and bounded fallback',async t=>{
  const directory=await fs.mkdtemp(path.join(root,'.dev/h7p-points-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));
  const script=path.join(directory,'test.py');
  await fs.writeFile(script,`import runpy,json\nimport pyslang as s\nns=runpy.run_path(${JSON.stringify(path.join(root,'language/python/analyze.py'))},run_name='position_test')\nmanager=s.SourceManager()\ntexts=['abc\\r\\nxyz\\n','\\ufeff한글😀é\\r\\n尾\\u2028x\\n','😀' * 1000 + '\\nend','\\n' * 1000]\nbuffers=[manager.assignText('buffer'+str(i)+'.sv',text) for i,text in enumerate(texts)]\ncount=0\nfor limits in [(4*1024*1024,64,4096),(0,0,0),(100,1,3)]:\n    positions=ns['SourcePositions'](manager,*limits)\n    for buffer in buffers:\n        data=manager.getSourceText(buffer.id).encode('utf-8')\n        for offset in range(len(data)+4):\n            location=s.SourceLocation(buffer.id,offset)\n            prefix=data[:offset].decode('utf-8',errors='replace')\n            expected={'file':str(manager.getFullPath(buffer.id)),'offset':len(prefix.encode('utf-16-le'))//2,'line':prefix.count('\\n'),'character':len(prefix.rsplit('\\n',1)[-1].encode('utf-16-le'))//2}\n            assert positions.point(location)==expected,(limits,offset,positions.point(location),expected)\n            count+=1\n        changed=positions.point(s.SourceLocation(buffer.id,0));changed['offset']=-999\n        assert positions.point(s.SourceLocation(buffer.id,0))['offset']==0\n    assert positions.bytes<=limits[0] and len(positions.buffers)<=limits[1] and len(positions.points)<=limits[2]\nprint(json.dumps({'checked':count,'bounded':True,'copies':True}))\n`);
  const result=await checkedProcess({executable:python,args:['-I','-B',script],cwd:directory},{signal:AbortSignal.timeout(15000)});
  const receipt=JSON.parse(result);assert.ok(receipt.checked>10000);assert.equal(receipt.bounded,true);assert.equal(receipt.copies,true);
});

test('large same-buffer unicode declarations preserve scope/order, exact UTF-16 locations, and fresh overlays across calls',{timeout:60000},async t=>{
  const f=await requestFixture({files:3});t.after(()=>f.dispose());
  const padding='// 한글 😀 é\r\n'.repeat(3000),text=padding+'module dut; int first; function int work(input int arg); int early; /*query*/ int later; return arg; endfunction endmodule\r\n';
  const entries=await f.provider.complete({...f.project,tests:[]},[{file:f.file,text}],{file:f.file,offset:text.indexOf('/*query*/')});
  for(const name of ['first','arg','early'])assert.ok(entries.some(s=>s.name===name),name);assert.ok(!entries.some(s=>s.name==='later'));
  const early=entries.find(s=>s.name==='early');assert.equal(early.location.offset,text.indexOf('early'));assert.equal(early.location.line,3000);assert.equal(early.location.character,text.slice(text.lastIndexOf('\n',text.indexOf('early'))+1,text.indexOf('early')).length);
  const updated=text.replace('int early;','int fresh;'),fresh=await f.provider.complete({...f.project,tests:[]},[{file:f.file,text:updated}],{file:f.file,offset:updated.indexOf('/*query*/')});
  assert.ok(fresh.some(s=>s.name==='fresh'));assert.ok(!fresh.some(s=>s.name==='early'));await f.clean();
});

test('new source managers never reuse coordinates for the same filename or buffer id',async t=>{
  const directory=await fs.mkdtemp(path.join(root,'.dev/h7p-managers-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));const script=path.join(directory,'test.py');
  await fs.writeFile(script,`import runpy,json\nimport pyslang as s\nns=runpy.run_path(${JSON.stringify(path.join(root,'language/python/analyze.py'))},run_name='position_test')\nresults=[]\nfor text in ['a\\nb','😀漢字\\r\\nb']:\n    manager=s.SourceManager();buffer=manager.assignText('same.sv',text);mapper=ns['SourcePositions'](manager)\n    results.append(mapper.point(s.SourceLocation(buffer.id,len(text.encode('utf-8')))))\nassert results[0]['offset']==3 and results[1]['offset']==7\nassert results[0]['line']==results[1]['line']==1\nassert results[0]['character']==results[1]['character']==1\nprint(json.dumps({'isolated':True}))\n`);
  const result=await checkedProcess({executable:python,args:['-I','-B',script],cwd:directory},{signal:AbortSignal.timeout(15000)});assert.equal(JSON.parse(result).isolated,true);
});

test('completion path reuse lasts one call: real source aliases work and retargeted foreign aliases cannot leak symbols',{timeout:60000},async t=>{
  const f=await requestFixture({files:3});t.after(()=>f.dispose());
  const alias=path.join(f.directory,'alias'),outside=path.join(f.directory,'outside');await fs.mkdir(outside);await fs.writeFile(path.join(outside,'dut.sv'),'module foreign; int outsider; endmodule\n');
  await fs.symlink(path.dirname(f.file),alias,process.platform==='win32'?'junction':'dir');
  const text='module dut; int alias_visible; initial $display(alias_visible); endmodule\n',query={file:path.join(alias,'dut.sv'),offset:text.indexOf('$display')},project={...f.project,tests:[]};
  const entries=await f.provider.complete(project,[{file:f.file,text}],query);assert.ok(entries.some(s=>s.name==='alias_visible'));assert.ok(!entries.some(s=>s.name==='outsider'));
  await fs.unlink(alias);await fs.symlink(outside,alias,process.platform==='win32'?'junction':'dir');assert.deepEqual(await f.provider.complete(project,[{file:f.file,text}],query),[]);await f.clean();
});
