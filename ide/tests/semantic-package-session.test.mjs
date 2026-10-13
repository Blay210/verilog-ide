import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { requestFixture } from '../scripts/helpers/semantic-request.mjs';

const until=async condition=>{const end=Date.now()+10000;while(Date.now()<end){if(await condition())return;await new Promise(r=>setTimeout(r,20));}throw Error('Did not reach the owned package approval boundary.');};
const mutate=async(f,needle,replacement)=>{const file=path.join(f.directory,'instrumented.py'),source=await fs.readFile(file,'utf8');assert.equal(source.split(needle).length,2);await fs.writeFile(file,source.replace(needle,replacement));return()=>fs.writeFile(file,source);};

test('cancellation after real package publication joins the single process before any test compilation; a new call recovers',{timeout:60000},async t=>{
  const f=await requestFixture({files:3});t.after(()=>f.dispose());
  const restore=await mutate(f,'        del graph',`        del graph\n        while os.path.exists(${JSON.stringify(f.gate)}): time.sleep(0.01)`);
  await fs.writeFile(f.gate,'hold after graph publication');const abort=new AbortController();
  const settled=f.provider.analyze(f.project,[],abort.signal).then(value=>({value}),error=>({error}));
  try{await until(async()=>{const dirs=await fs.readdir(f.cache).catch(e=>{if(e.code==='ENOENT')return[];throw e;});return(await Promise.all(dirs.map(d=>fs.stat(path.join(f.cache,d,'continue.json')).then(()=>true).catch(e=>{if(e.code==='ENOENT')return false;throw e;})))).some(Boolean);});}
  finally{abort.abort();await settled;}
  assert.ok((await settled).error);assert.deepEqual((await f.rows()).filter(r=>r.groupStart).map(r=>r.operation),['dependencies']);await f.clean();
  await fs.unlink(f.gate);await restore();assert.equal((await f.provider.analyze(f.project,[])).diagnostics.some(d=>d.severity==='error'),false);await f.clean();
});

test('bad graph protocol and premature bridge success never return unapproved results; each fresh request recovers',{timeout:60000},async t=>{
  const f=await requestFixture({files:3});t.after(()=>f.dispose());
  for(const [needle,replacement,message]of [
    ["{'protocol': 1, 'graph': graph}","{'protocol': 0, 'graph': graph}",/Invalid semantic package protocol/],
    ['        del graph',"        return {'protocol': 1, 'approval': None, 'result': {'analyses': []}}",/before package approval|package acknowledgement/],
  ]){
    const start=(await f.rows()).length,restore=await mutate(f,needle,replacement);
    await assert.rejects(f.provider.analyze(f.project,[]),message);assert.deepEqual((await f.rows()).slice(start).filter(r=>r.groupStart).map(r=>r.operation),['dependencies']);await f.clean();
    await restore();assert.equal((await f.provider.analyze(f.project,[])).diagnostics.some(d=>d.severity==='error'),false);await f.clean();
  }
});

test('failed atomic approval publication joins the waiting compiler and preserves fresh retry',{timeout:60000},async t=>{
  const f=await requestFixture({files:3});t.after(()=>f.dispose());
  const restore=await mutate(f,"        os.replace(channel['graph'] + '.tmp', channel['graph'])","        os.mkdir(channel['continue'])\n        os.replace(channel['graph'] + '.tmp', channel['graph'])");
  await assert.rejects(f.provider.analyze(f.project,[]),e=>['EISDIR','EPERM','EACCES','EEXIST','ENOTEMPTY'].includes(e.code));
  assert.deepEqual((await f.rows()).filter(r=>r.groupStart).map(r=>r.operation),['dependencies']);await f.clean();
  await restore();assert.equal((await f.provider.analyze(f.project,[])).diagnostics.some(d=>d.severity==='error'),false);await f.clean();
});

test('a wrong completion acknowledgement is rejected after actual compilation; manifest mode and public dependency calls remain independent',{timeout:60000},async t=>{
  const f=await requestFixture({files:3});t.after(()=>f.dispose());
  const restore=await mutate(f,"'approval': continuation['approval']","'approval': 'another-request'");
  await assert.rejects(f.provider.analyze(f.project,[]),/package acknowledgement/);await f.clean();await restore();
  const start=(await f.rows()).length;const graph=await f.provider.dependencies(f.project,{},[]);
  assert.ok(graph.declarations.some(d=>d.name==='base'));assert.equal((await f.rows()).slice(start).find(r=>r.launch).operation,'dependencies');await f.clean();
  const {orderPackages}=await import('../dist/runtime/core/index.js');const ordered=orderPackages(f.project,graph);
  const from=(await f.rows()).length;assert.equal((await f.provider.analyze(ordered,[])).diagnostics.some(d=>d.severity==='error'),false);
  const rows=(await f.rows()).slice(from);assert.equal(rows.filter(r=>r.launch).length,1);assert.ok(rows.filter(r=>r.groupStart).every(r=>r.operation!=='dependencies'));await f.clean();
});

test('hierarchy matches fresh manifest compilation; unimplemented internal operation queries retain explicit failure and cleanup',{timeout:60000},async t=>{
  const f=await requestFixture({files:3});t.after(()=>f.dispose());
  const {orderPackages}=await import('../dist/runtime/core/index.js');
  const ordered=orderPackages(f.project,await f.provider.dependencies(f.project,{},[]));
  let instance;
  for(const method of ['hierarchy','internalOperations','scopeOperations']){
    const start=(await f.rows()).length,args=method==='hierarchy'?['a',[]]:['a',instance,[]];
    if(method==='hierarchy'){
      const automatic=await f.provider[method](f.project,...args),manifest=await f.provider[method](ordered,...args);
      assert.deepEqual(automatic,manifest);assert.equal(automatic.diagnostics.some(d=>d.severity==='error'),false);
      assert.ok(automatic.roots.length);instance=automatic.roots[0].id;
    }else{
      // Independent IDE has no internal_operations.py adapter yet.
      // Do not replace the missing backend with a stub or borrow VSIX code.
      await assert.rejects(f.provider[method](f.project,...args),/No module named 'internal_operations'/);
      await assert.rejects(f.provider[method](ordered,...args),/No module named 'internal_operations'/);
    }
    const rows=(await f.rows()).slice(start);assert.equal(rows.filter(r=>r.launch).length,2);
    assert.deepEqual(rows.filter(r=>r.groupStart).map(r=>r.operation),['dependencies',method,method]);await f.clean();
  }
  assert.equal((await f.provider.hierarchy(f.project,'a',[])).diagnostics.some(d=>d.severity==='error'),false);await f.clean();
});

test('the real bridge abandons a missing Core approval within its existing 15-second wait budget',{timeout:30000},async t=>{
  const f=await requestFixture({files:2});t.after(()=>f.dispose());
  const {checkedProcess}=await import('../dist/runtime/core/index.js');await fs.mkdir(f.cache);
  const input=path.join(f.directory,'unapproved.json'),output=path.join(f.directory,'unapproved-output.json');
  await fs.writeFile(input,JSON.stringify({operation:'package-session',protocol:1,sources:f.project.sources,
    includeDirs:f.project.includeDirs,defines:f.project.defines,overlays:[],
    packageChannel:{graph:path.join(f.directory,'unapproved-graph.json'),continue:path.join(f.directory,'no-approval.json')}}));
  const start=performance.now();await assert.rejects(checkedProcess({executable:f.provider.python,args:['-I','-B',f.bridge,input,output],cwd:f.projectRoot}),/Semantic package approval did not arrive/);
  assert.ok(performance.now()-start<20000);assert.deepEqual((await f.rows()).filter(r=>r.groupStart).map(r=>r.operation),['dependencies']);await f.clean();
});
