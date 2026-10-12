import test from 'node:test';
import assert from 'node:assert/strict';
import type {InternalGraph} from '@rtl-dev/semantic';
import {renderScopeOperations} from '../packages/vscode/src/scope-operations-view';
import {renderStructure} from '../packages/vscode/src/structure-view';
import {StructureNavigation} from '../packages/vscode/src/structure-navigation';
import {schematicSymbol} from '../packages/vscode/src/schematic-symbol';
import {readFileSync} from 'node:fs';
const type={text:'logic[7:0]',width:8,signed:false,simpleIntegral:true};
const graph:InternalGraph={version:1,kind:'rtl-semantic',instanceId:'top',status:'supported',reason:'',diagnostics:[],nodes:[
  {id:'a',kind:'signal',label:'a',signalType:type,signalName:'a'},
  {id:'i',kind:'module-port',label:'i',signalType:type},
  {id:'o',kind:'module-port',label:'o',signalType:type},
  {id:'r',kind:'register',label:'q · next state',signalType:type},
  {id:'q',kind:'signal',label:'q',signalType:type,signalName:'q'}
],edges:[{source:'a',target:'i',role:'module input'},{source:'o',target:'r',role:'next state'},{source:'r',target:'q',role:'state output'}],
modules:[{instanceId:'top.u',name:'u',module:'leaf',ports:[{nodeId:'i',name:'i',direction:'input',connected:true},{nodeId:'o',name:'o',direction:'output',connected:true}]}]};
test('scope view groups opaque ports into a navigable module and observes only named local signals',()=>{
  const observed:string[]=[];const scene=renderScopeOperations(graph,false,()=> 'source',name=>{observed.push(name);return name;});
  assert.deepEqual(observed,['a','q']);assert.equal(scene.svg.match(/data-node="top.u"/g)?.length,1);
  assert.match(scene.svg,/aria-label="View inside top.u"/);assert.match(scene.svg,/stroke-dasharray="5 4"/);
  assert.ok(!scene.cyclicLayout);assert.match(scene.svg,/module input/);
});
test('opaque feedback layout is bounded, stale is inaccessible and module metadata is escaped',()=>{
  const value={...graph,edges:[...graph.edges,{source:'q',target:'a',role:'assignment'},{source:'o',target:'a',role:'assignment'}],modules:[{...graph.modules![0],name:'<script>',instanceId:'top.<u>'}]};
  const scene=renderScopeOperations(value,true,()=> 'source');assert.ok(scene.cyclicLayout);
  assert.ok(Number.isFinite(scene.width)&&scene.width<5000);assert.match(scene.svg,/tabindex="-1"/);
  assert.match(scene.svg,/&lt;script&gt;/);assert.doesNotMatch(scene.svg,/<script>/);
});
test('combined structure view authorizes actual child navigation and exposes only local observation identities',()=>{
  const location={file:'D:/design.sv',offset:0,line:0,character:0};
  const child={id:'top.u',name:'u',module:'leaf',kind:'instance' as const,location,parameters:[],ports:[],children:[]};
  const root={...child,id:'top',name:'top',children:[child]};
  const navigation=new StructureNavigation();navigation.update([root],'context');
  const view=renderStructure(root,'nonce',false,{navigation:navigation.state(),context:{project:'p',mode:'recorded'},operations:graph,trace:{state:'ready',time:'0',end:'100'}});
  assert.equal(view.nodes.get('top.u'),child);
  assert.deepEqual([...view.ports.values()],[{instanceId:'top',port:'a'},{instanceId:'top',port:'q'}]);
  assert.match(view.html,/data-action="schematic"/);assert.match(view.html,/Child internals remain opaque/);
});
test('schematic symbols distinguish arithmetic, storage, mux and explicit type conversion without deleting nodes',()=>{
  const node=(kind:InternalGraph['nodes'][number]['kind'],label:string)=>({id:kind,kind,label,signalType:type});
  assert.match(schematicSymbol(node('operator','×'),0,0).svg,/<circle/);
  assert.match(schematicSymbol(node('register','q · next state'),0,0).svg,/Register · D → Q/);
  assert.match(schematicSymbol(node('control','?:'),0,0).svg,/MUX/);
  assert.match(schematicSymbol(node('conversion','implicit conversion'),0,0).svg,/Convert/);
  assert.match(schematicSymbol(node('select','<unsafe>'),0,0).svg,/&lt;unsafe&gt;/);
  const value={...graph,nodes:[...graph.nodes,node('operator','+'),node('conversion','cast')],edges:[...graph.edges,
    {source:'a',target:'operator',role:'left'},{source:'q',target:'operator',role:'right'},
    {source:'operator',target:'conversion',role:'operand'},{source:'a',target:'r',role:'clock posedge'}]};
  const before=JSON.stringify(value),scene=renderScopeOperations(value,false,()=> 'source');
  assert.equal(JSON.stringify(value),before);assert.equal((scene.svg.match(/data-symbol=/g)??[]).length,5);
  const path=(role:string)=>scene.svg.match(new RegExp(`data-edge-role="${role}"><title>[^<]+</title><path[^>]+d="([^"]+)"`))![1];
  assert.notEqual(path('left'),path('right'));
  assert.match(path('clock posedge'),/ L[\d.]+ [\d.]+$/);
  assert.ok(Number.isFinite(scene.width)&&Number.isFinite(scene.height));
});
test('leaf schematic uses the same symbols while detailed leaf mode preserves the inspection view',()=>{
  const location={file:'design.sv',offset:0,line:0,character:0};
  const root={id:'top',name:'top',module:'top',kind:'instance' as const,location,parameters:[],ports:[],children:[]};
  const navigation=new StructureNavigation();navigation.update([root],'context');
  const leaf={...graph,modules:[],nodes:graph.nodes.filter(n=>n.kind!=='module-port'),edges:graph.edges.filter(e=>e.source==='r')};
  const options={navigation:navigation.state(),context:{project:'p',mode:'recorded' as const},operations:leaf,trace:{state:'ready' as const,time:'0',end:'100'}};
  const schematic=renderStructure(root,'nonce',false,{...options,viewMode:'schematic'});
  assert.match(schematic.html,/Register · D → Q/);assert.equal(schematic.ports.size,2);
  assert.doesNotMatch(renderStructure(root,'nonce',false,{...options,viewMode:'operations'}).html,/Register · D → Q/);
});
test('boundary layout requires unique compiler identity and width; never guesses from signal names',()=>{
  const location={file:'design.sv',offset:0,line:0,character:0};
  const port=(name:string,direction:string,identity:string,width=8)=>({name,direction,type:'logic',location,internalSignal:identity,signalType:{...type,width},connection:{kind:'top' as const,text:'',references:[]}});
  const scope={id:'top',name:'top',module:'<parent>',kind:'instance' as const,location,parameters:[],children:[],ports:[port('a','input','decl-a'),port('q','output','decl-q')]};
  const value={...graph,nodes:graph.nodes.map(n=>n.id==='a'?{...n,declarationId:'decl-a'}:n.id==='q'?{...n,declarationId:'decl-q'}:n)};
  const observed:string[]=[],scene=renderScopeOperations(value,false,()=> 'source',n=>{observed.push(n);return n;},scope);
  assert.equal((scene.svg.match(/data-boundary-port=/g)??[]).length,2);assert.deepEqual(observed,['a','q']);
  assert.match(scene.svg,/scope-boundary/);assert.match(scene.svg,/&lt;parent&gt;/);
  assert.equal((scene.svg.match(/data-node="top.u"/g)??[]).length,1);
  for(const invalid of [{...scope,id:'other'},{...scope,ports:[port('a','input','wrong')]},{...scope,ports:[port('a','input','decl-a',16)]},{...scope,ports:[port('a','input','decl-a'),port('alias','input','decl-a')]},{...scope,ports:[port('a','inout','decl-a')]}]) {
    assert.doesNotMatch(renderScopeOperations(value,false,()=> 'source',undefined,invalid).svg,/data-boundary-port=/);
  }
  const inputOnly=renderScopeOperations(value,false,()=> 'source',undefined,{...scope,ports:[scope.ports[0]]});
  assert.ok(Number.isFinite(inputOnly.width));assert.doesNotMatch(inputOnly.svg,/NaN|width="-/);
});
test('fanout junctions exist only for shared source edges and graph identity remains untouched',()=>{
  const value={...graph,edges:[...graph.edges,{source:'a',target:'r',role:'next state'}]},original=JSON.stringify(value);
  const scene=renderScopeOperations(value,false,()=> 'source');
  assert.match(scene.svg,/class="junction"/);assert.equal(JSON.stringify(value),original);
  assert.doesNotMatch(renderScopeOperations(graph,false,()=> 'source').svg,/class="junction"/);
  const separate=renderScopeOperations({...graph,edges:[...graph.edges,{source:'q',target:'r',role:'second net'}]},false,()=> 'source');
  const lane=(role:string)=>separate.svg.match(new RegExp(`data-edge-role="${role}"><title>[^<]+</title><path[^>]+d="M[^L]+L([^ ]+)`))![1];
  assert.notEqual(lane('module input'),lane('second net'),'Different source identities need different routing spines');
});
test('recorded pipeline MAC keeps product-to-enable and all state feedback routes visible',()=>{
  const fixture=JSON.parse(readFileSync(new URL('./fixtures/pipeline-routing.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
  const result=renderScopeOperations(fixture.graph,false,()=> 'source',undefined,fixture.selected);
  assert.deepEqual(result.routingUnrouted,[]);assert.equal(result.routingIncomplete,false);
  assert.equal((result.svg.match(/data-edge-role=/g)??[]).length,fixture.graph.edges.length);
});
test('incomplete geometry is disclosed above the canvas instead of silently disappearing in closed details',()=>{
  const location={file:'design.sv',offset:0,line:0,character:0};
  const child={id:'top.u',name:'u',module:'leaf',kind:'instance' as const,location,parameters:[],ports:[],children:[]};
  const root={...child,id:'top',name:'top',children:[child]},navigation=new StructureNavigation();navigation.update([root],'current');
  // Deliberately conflicting terminals exercise the renderer's fail-visible boundary.
  const invalid={...graph,edges:[...graph.edges,{source:'q',target:'i',role:'conflicting terminal'}]};
  const view=renderStructure(root,'nonce',false,{navigation:navigation.state(),context:{project:'p'},operations:invalid,viewMode:'schematic'});
  assert.match(view.html,/Diagram routing is incomplete/);
  assert.ok(view.html.indexOf('Diagram routing is incomplete')<view.html.indexOf('<details>'));
});
