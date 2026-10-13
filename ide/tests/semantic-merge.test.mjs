import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
import { requestFixture } from '../scripts/helpers/semantic-request.mjs';
const require=createRequire(import.meta.url);
const {SlangProvider}=require('../dist/runtime/semantic/slang.js');
const python=process.env.RTL_SEMANTIC_PYTHON;assert.ok(python,'Use the verified runtime; no silent semantic skip.');
const until=async fn=>{const deadline=Date.now()+10000;while(Date.now()<deadline){if(await fn())return;await new Promise(r=>setTimeout(r,20));}throw Error('Package request did not reach the owned process boundary.');};

test('independent context agreement preserves first order/duplicates and every nested type, enum, callable and declaration field',async t=>{
  const directory=await fs.mkdtemp(path.join(root,'.dev/h7q-merge-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));
  const cache=path.join(directory,'cache'),bridge=path.join(directory,'bridge.py'),file=path.join(directory,'shared.sv');
  const make=(name,extra={})=>({name,kind:'variable',detail:'int '+name,location:{file,offset:7,line:0,character:7},signalType:{text:'int',simpleIntegral:true,width:32,signed:true,fourState:false},...extra});
  const common=make('common'),duplicate=make('duplicate'),width=make('width'),where=make('where'),enumValue=make('enum',{enumValues:[{name:'A',value:'0'},{name:'B',value:'1'}]}),call=make('call',{kind:'function',callable:{kind:'function',returnType:'int',arguments:[{name:'arg',label:'input int arg = 1'}]}});
  const reordered={detail:common.detail,name:common.name,kind:common.kind,location:common.location,signalType:common.signalType};
  const first=[duplicate,common,duplicate,width,where,enumValue,call,make('reordered')];
  const second=[common,duplicate,{...width,signalType:{...width.signalType,width:16}},{...where,location:{...where.location,offset:8}},enumValue,call,{detail:'int reordered',name:'reordered',kind:'variable',location:common.location,signalType:common.signalType}];
  const third=[common,duplicate,{...enumValue,enumValues:[{name:'B',value:'1'},{name:'A',value:'0'}]},{...call,callable:{...call.callable,arguments:[{name:'arg',label:'input int arg = 2'}]}},reordered];
  const analyses=[first,second,third].map(completions=>({modules:[],instances:[],diagnostics:[],inputs:{files:[file],candidates:[],conservative:false},completions}));
  await fs.writeFile(bridge,`import sys,json\nwith open(sys.argv[1],encoding='utf-8') as f: request=json.load(f)\nassert request['operation']=='batch' and len(request['groups'])==3\nwith open(sys.argv[2],'w',encoding='utf-8') as f: json.dump(json.loads(${JSON.stringify(JSON.stringify({analyses}))}),f)\n`);
  const provider=new SlangProvider(python,bridge,cache),project={root:directory,sources:[file],packageSources:[],packageOrder:'manifest',defines:{},includeDirs:[],waveform:'none',tests:['a','b','c'].map(name=>({name,top:name,sources:[]}))};
  assert.deepEqual(await provider.complete(project,[],{file,offset:7}),[duplicate,common,duplicate]);assert.deepEqual(await fs.readdir(cache),[]);
});

test('real package validation remains authoritative: duplicate/cycle/unknown/same-file order reject before test compilation and recover', {timeout:60000},async t=>{
  const f=await requestFixture({files:3});t.after(()=>f.dispose());const consumer=path.join(f.projectRoot,'pkg/a-consumer.sv');
  const cases=[
    {message:/Duplicate package/,overlays:[{file:consumer,text:'package base; endpackage\n'}]},
    {message:/dependency cycle/,overlays:[{file:f.pkg,text:'package base; import consumer::*; parameter int WIDTH=4; endpackage\n'}]},
    {message:/Unknown package/,overlays:[{file:f.file,text:'module dut; import missing_pkg::*; endmodule\n'}]},
    {message:/used before its declaration/,overlays:[{file:consumer,text:'package consumer; import later::*; endpackage\npackage later; endpackage\n'}]},
  ];
  for(const c of cases){const previous=(await f.rows()).filter(r=>r.launch).length;await assert.rejects(f.provider.complete(f.project,c.overlays,{file:f.file,offset:30}),c.message);
    const rows=(await f.rows()).filter(r=>r.launch).slice(previous);assert.equal(rows.length,1);assert.equal(rows[0].operation,'package-session');assert.deepEqual((await f.rows()).filter(r=>r.groupStart).slice(-1).map(r=>r.operation),['dependencies']);await f.clean();}
  const fresh=await f.provider.complete(f.project,[],{file:f.file,offset:f.text.indexOf('$display')});assert.ok(fresh.some(s=>s.name==='dut'));await f.clean();
});

test('cancellation during the actual package probe joins the process, releases its temp files and allows a fresh complete request',{timeout:60000},async t=>{
  const f=await requestFixture({files:3});t.after(()=>f.dispose());
  let source=await fs.readFile(f.bridge,'utf8');source=source.replace("original=ns['analyze']",`while os.path.exists(${JSON.stringify(f.gate)}): time.sleep(0.02)\noriginal=ns['analyze']`);await fs.writeFile(f.bridge,source);await fs.writeFile(f.gate,'hold package probe');
  const abort=new AbortController(),result=f.provider.complete(f.project,[],{file:f.file,offset:f.text.indexOf('$display')},abort.signal).then(value=>({value}),error=>({error}));
  try{await until(async()=> (await f.rows()).some(r=>r.launch&&r.operation==='package-session'));}finally{abort.abort();await result;}
  assert.ok((await result).error);await f.clean();await fs.unlink(f.gate);
  assert.ok((await f.provider.complete(f.project,[],{file:f.file,offset:f.text.indexOf('$display')})).some(s=>s.name==='dut'));await f.clean();
});
