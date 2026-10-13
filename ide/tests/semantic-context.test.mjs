import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { root } from '../scripts/environment.mjs';
import { semanticEdit } from '../scripts/helpers/semantic-edit.mjs';
const require=createRequire(import.meta.url);
const {loadProject,ProjectManifestMissing}=require('../dist/runtime/core/config.js');
await build({entryPoints:['runtime/semantic/lexical.ts','language/src/index.ts'],outdir:'.dev/h7o-lexer',bundle:true,platform:'node',format:'cjs',outExtension:{'.js':'.cjs'}});
const {scanCode}=require('../.dev/h7o-lexer/runtime/semantic/lexical.cjs');
const {basicCompletions,planBlockEnter,planTemplate}=require('../.dev/h7o-lexer/language/src/index.cjs');
await build({entryPoints:['language/src/input-events.ts'],outfile:'.dev/h7o-inputs.cjs',bundle:true,platform:'node',format:'cjs'});
const {inputEvent,inputPatterns}=require('../.dev/h7o-inputs.cjs');
const manifest='version=1\n[project]\nname="context"\n[sources]\nrtl=["*.sv"]\n';

test('only an absent disk manifest gets the typed error; malformed, include/source ENOENT and dangling links remain failures',async t=>{
  const directory=await fs.mkdtemp(path.join(root,'.dev/h7o-config-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));
  const file=path.join(directory,'rtl.toml');
  await assert.rejects(loadProject(directory),e=>e instanceof ProjectManifestMissing&&e.root===directory&&e.cause.code==='ENOENT');
  await assert.rejects(loadProject(directory,'broken = ['),e=>!(e instanceof ProjectManifestMissing));
  await fs.writeFile(path.join(directory,'code.sv'),'module top; endmodule\n');
  await fs.writeFile(file,manifest+'include_dirs=["rtl.toml-missing/include"]\n');
  await assert.rejects(loadProject(directory),e=>!(e instanceof ProjectManifestMissing)&&/ENOENT/.test(String(e)));
  await fs.writeFile(file,manifest.replace('rtl=["*.sv"]','rtl=[{file="rtl.toml-missing/source.sv"}]'));
  await assert.rejects(loadProject(directory),e=>!(e instanceof ProjectManifestMissing)&&/ENOENT/.test(String(e)));
  await fs.unlink(file);await fs.symlink(path.join(directory,'missing-link-target'),file,process.platform==='win32'?'junction':'file');
  await assert.rejects(loadProject(directory),e=>!(e instanceof ProjectManifestMissing));
  await fs.unlink(file);await fs.writeFile(file,manifest);assert.equal((await loadProject(directory)).sources.length,1);
});
test('verified absent roots ignore source/peer events but retain manifest, journal and ancestor recovery without recursive watches',()=>{
  const directory=path.resolve('.dev/h7o-missing'),state={root:directory,manifestMissing:true};
  for(const file of ['notes/readme.js','new.sv','.rtl/build/unused.sv','rtl.toml-other'])assert.equal(inputEvent(state,path.join(directory,file)),false,file);
  assert.equal(inputEvent(state,path.resolve('.dev/peer/code.sv')),false);
  for(const file of [path.join(directory,'rtl.toml'),path.join(directory,'.rtl/import-transactions/id/intent.json'),directory,path.dirname(directory)])assert.equal(inputEvent(state,file),true,file);
  const patterns=inputPatterns([state]);assert.equal(patterns.length,2);assert.ok(patterns.every(p=>p.pattern==='*'));
  state.manifestMissing=false;assert.equal(inputEvent(state,path.join(directory,'new.sv')),true);assert.ok(inputPatterns([state]).some(p=>p.pattern==='**/*'));
});
test('object/function macros mask only their token/call while UTF-16 offsets, comments and real directives keep their boundaries',()=>{
  for(const text of ['logic [`WIDTH-1:0] a; fresh','int x=`CALL((1)," ) ",/*)*/2); fresh','int x=`CALL(\\escaped) name , 2); fresh','int x=`CALL(1, // )\r\n2); 한글 😀 fresh']){
    const scanned=scanCode(text);assert.equal(scanned.context,'code',text);assert.equal(scanned.code.length,text.length);assert.equal(scanned.code.indexOf('fresh'),text.indexOf('fresh'));assert.equal(scanned.hasDirective,true);
    assert.ok(basicCompletions(text,text.length,'systemverilog').items.some(i=>i.label==='logic'));
  }
  for(const text of ['`define BODY fresh','`define BODY \\\r\n fresh','`include "fresh','`ifdef fresh','`pragma fresh','int x=`MACRO','int x=`CALL(1, fresh','int x=`CALL("unterminated'])assert.equal(scanCode(text).context,'directive',text);
  for(const text of ['// `WIDTH fresh','/* `WIDTH fresh','"`WIDTH fresh','\\`WIDTH'])assert.notEqual(scanCode(text).context,'code',text);
  const text='int x=`CALL(begin,end,(case)); fresh';assert.doesNotMatch(scanCode(text).code,/\bbegin\b|\bend\b|\bcase\b/);
});
test('macro surface code never forces blocks or templates; ordinary code on following lines still expands explicitly',()=>{
  for(const text of ['`BODY begin','int x=`VALUE; begin','`HEADER module','`CALL(begin','`define BODY begin']){
    assert.equal(planBlockEnter(text,text.length,{unit:'  ',eol:'\n'}),undefined,text);
    assert.equal(planTemplate(text,text.length,'systemverilog'),undefined,text);
  }
  const text='`VALUE;\nbegin';assert.ok(planBlockEnter(text,text.length,{unit:'  ',eol:'\n'}));
});
test('actual IPC inline macro completion works; absent-root event work stops and configuration recovery/drain remain intact',{timeout:60000},async()=>{
  const receipt=await semanticEdit({files:3,inline:true});
  assert.equal(receipt.inlineCompletion,true);
  assert.equal(receipt.phases.find(p=>p.name==='edit-to-completion').launches,2);
  const burst=receipt.phases.find(p=>p.name==='100 unrelated events in mixed roots');
  assert.equal(burst.accounting.filter(r=>r.kind==='core-load').length,1);assert.equal(burst.launches,0);
  assert.equal(receipt.phases.find(p=>p.name==='create and repair manifests').launches,2);assert.equal(receipt.livePythonAfter,0);
});
