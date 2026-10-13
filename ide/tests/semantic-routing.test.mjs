import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { root } from '../scripts/environment.mjs';
const require=createRequire(import.meta.url),{loadProject,projectWatchPaths}=require('../dist/runtime/core/config.js');
await build({entryPoints:['language/src/input-events.ts'],outfile:'.dev/h7m-routing.cjs',bundle:true,platform:'node',format:'cjs'});
const {inputEvent,inputPatterns}=require('../.dev/h7m-routing.cjs');
async function fixture(t){
  const directory=await fs.mkdtemp(path.join(root,'.dev/semantic-routing-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));
  const project=path.join(directory,'project'),external=path.join(directory,'external');
  for(const folder of ['rtl','pkg','tb'])await fs.mkdir(path.join(project,folder),{recursive:true});await fs.mkdir(external);
  await fs.writeFile(path.join(project,'rtl/code.sv'),'module top; endmodule\n');
  await fs.writeFile(path.join(project,'pkg/pkg[1].sv'),'package defs; endpackage\n');
  await fs.writeFile(path.join(project,'tb/test.sv'),'module test; endmodule\n');
  await fs.writeFile(path.join(external,'shared.sv'),'module shared; endmodule\n');
  const manifest='version=1\n[project]\nname="selection"\n[sources]\nrtl=["rtl/**/*.sv","../external/**/*.sv"]\npackages=[{file="pkg/pkg[1].sv"}]\n[[test]]\nname="test"\ntop="test"\nsources=["tb/**/*.sv"]\n';
  await fs.writeFile(path.join(project,'rtl.toml'),manifest);return{directory,project,external,manifest};
}
test('selection metadata covers package/literal/test/external prefixes without entering the serialized Project',async t=>{
  const f=await fixture(t),project=await loadProject(f.project),selection=projectWatchPaths(project);
  assert.deepEqual(selection.sources.map(scope=>scope.directory).sort(),[f.external,...['rtl','pkg','tb'].map(name=>path.join(f.project,name))].sort());
  assert.equal(selection.sources.find(scope=>scope.directory===f.external).auxiliary,true);
  assert.ok(selection.sources.filter(scope=>scope.directory!==f.external).every(scope=>!scope.auxiliary));
  assert.ok(Object.isFrozen(selection)&&Object.isFrozen(selection.sources)&&Object.isFrozen(selection.sources[0]));
  assert.equal(Object.keys(project).includes('watchPaths'),false);assert.equal(projectWatchPaths({...project}),undefined);
  await fs.writeFile(path.join(f.project,'rtl.toml'),f.manifest.replace('rtl/**/*.sv','tb/**/*.sv'));
  const current=projectWatchPaths(await loadProject(f.project));assert.equal(current.sources.some(scope=>scope.directory===path.join(f.project,'rtl')),false);
  assert.equal(selection.sources.some(scope=>scope.directory===path.join(f.project,'rtl')),true,'Each scope belongs to its own parsed configuration');
});
test('confirmed selection routes local/new members and shared prefixes while excluding unrelated roots and generated paths',async t=>{
  const f=await fixture(t),loaded=await loadProject(f.project),other=path.join(f.directory,'other');
  const state={root:f.project,watchPaths:projectWatchPaths(loaded),inputs:{files:loaded.sources,candidates:[],conservative:false}};
  const peer={root:other,watchPaths:{sources:[{directory:path.join(other,'rtl'),auxiliary:false}],includes:[]},inputs:{files:[],candidates:[],conservative:false}};
  for(const file of [path.join(f.project,'rtl/new/deep.sv'),path.join(f.project,'tb/new.sv'),path.join(f.project,'pkg/extra.inc')]){assert.equal(inputEvent(state,file),true);assert.equal(inputEvent(peer,file),false);}
  assert.equal(inputEvent(state,path.join(f.project,'notes/unlisted.sv')),false);assert.equal(inputEvent(state,path.join(f.project,'rtl/.rtl/generated.sv')),false);
  const caseVariant=path.join(f.project,'rtl/.RTL/new.sv');await fs.mkdir(path.dirname(caseVariant),{recursive:true});await fs.writeFile(path.join(path.dirname(caseVariant),'known.sv'),'module known_upper; endmodule\n');
  await fs.writeFile(path.join(f.project,'rtl.toml'),f.manifest.replace('"rtl/**/*.sv"','"rtl/**/*.sv","rtl/.RTL/*.sv"'));
  const declared=await loadProject(f.project),upperState={...state,watchPaths:projectWatchPaths(declared),inputs:{files:declared.sources,candidates:[],conservative:false}};
  await fs.writeFile(caseVariant,'module upper_folder; endmodule\n');
  assert.ok((await loadProject(f.project)).sources.includes(caseVariant),'Explicit case variants follow actual Core glob discovery');assert.equal(inputEvent(upperState,caseVariant),true);
  assert.equal(inputEvent(state,f.project),true,'Directory ancestor deletion invalidates configuration/input membership');
  peer.watchPaths={sources:[{directory:f.external,auxiliary:true}],includes:[]};const added=path.join(f.external,'new/deep.sv');
  assert.equal(inputEvent(state,added),true);assert.equal(inputEvent(peer,added),true,'New shared glob members must refresh every consuming prefix');
});
test('discovery failure retains validated external watch scopes for later file creation',async t=>{
  const f=await fixture(t),late=path.join(f.directory,'late');
  await fs.writeFile(path.join(f.project,'rtl.toml'),f.manifest.replace('../external/**/*.sv','../late/**/*.inc'));
  let failed;try{await loadProject(f.project);assert.fail('Missing source pattern must fail');}catch(error){failed=error;}
  assert.match(String(failed),/Source pattern matched no files/);
  const selection=projectWatchPaths(failed);assert.ok(selection.sources.some(scope=>scope.directory===late&&scope.auxiliary));
  const state={root:f.project,watchPaths:selection};assert.equal(inputEvent(state,path.join(late,'new.inc')),true);
  assert.ok(inputPatterns([state]).some(pattern=>pattern.directory===late&&pattern.pattern==='**/*'));
  await fs.mkdir(late);await fs.writeFile(path.join(late,'new.inc'),'module late; endmodule\n');
  assert.ok((await loadProject(f.project)).sources.includes(path.join(late,'new.inc')));
});
test('unsafe source patterns are rejected before the new metadata invokes the upstream glob parser',async t=>{
  const f=await fixture(t),glob=require('fast-glob'),original=glob.generateTasks;let calls=0;
  glob.generateTasks=(...args)=>{calls++;return original(...args);};
  try{
    for(const pattern of ['{'.repeat(17)+'x'+ '}'.repeat(17),'a'.repeat(4097),'!rtl/*.sv']){
      await fs.writeFile(path.join(f.project,'rtl.toml'),'version=1\n[project]\nname="guard"\n[sources]\nrtl=['+JSON.stringify(pattern)+']\n');
      await assert.rejects(loadProject(f.project),/nesting|4096|Negative source/);assert.equal(calls,0);
    }
  }finally{glob.generateTasks=original;}
});
test('hundreds of workspace RTL files reuse static watches; recursive parents absorb redundant children without dropping external or generated includes',()=>{
  const directory=path.join(root,'.dev/pattern-scale'),files=Array.from({length:300},(_,i)=>path.join(directory,`rtl/group-${i}/code.sv`));
  const state={root:directory,inputs:{files,candidates:[],conservative:false},watchPaths:{sources:[{directory:path.join(directory,'rtl'),auxiliary:false}],includes:[]}};
  assert.deepEqual(inputPatterns([state]),[]);
  const external=path.join(root,'.dev/external-header'),generated=path.join(directory,'.rtl');
  state.inputs={...state.inputs,files:[...files,path.join(external,'defs.vh'),path.join(generated,'defs.vh')]};
  assert.deepEqual(inputPatterns([state]).map(p=>p.directory).sort(),[external,generated].sort());
  state.inputs={...state.inputs,conservative:true};state.inputProject={sources:files,tests:[],includeDirs:[external]};
  assert.deepEqual(inputPatterns([state]),[{directory:external,pattern:'**/*'},{directory,pattern:'**/*'}].sort((a,b)=>`${a.directory}:${a.pattern}`.localeCompare(`${b.directory}:${b.pattern}`)));
});
