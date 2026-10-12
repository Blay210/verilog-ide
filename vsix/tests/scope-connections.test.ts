import test from 'node:test';
import assert from 'node:assert/strict';
import { buildScopeConnections, type HierarchyNode, type PortBinding } from '@rtl-dev/semantic';
import { renderScopeConnections } from '../packages/vscode/src/scope-connections-view';
const location={file:'D:/design.sv',offset:0,line:0,character:0};
const port=(name:string,direction:string,net?:string):PortBinding=>({name,direction,type:'logic[7:0]',location,signalType:{text:'logic[7:0]',simpleIntegral:true,width:8},internalSignal:net,connection:{kind:net?'expression':'unconnected',text:net??'',directSignal:net,references:[]}});
const node=(id:string,ports:PortBinding[]=[],children:HierarchyNode[]=[]):HierarchyNode=>({id,name:id,module:'unit',kind:'instance',parameters:[],location,ports,children});
test('scope connectivity shares compiler identities across fanout and never aliases by display name',()=>{
  const a=node('top.a',[port('i','input','top.in'),port('o','output','top.link')],[node('top.a.hidden')]);
  const b=node('top.b',[port('i','input','top.link')]);
  const c=node('top.c',[port('i','input','top.in')]);
  const scope=node('top',[port('in','input','top.in'),port('out','output','top.link')],[a,{...node('top.g',[],[b,c]),kind:'generate'}]);
  const graph=buildScopeConnections(scope);
  assert.deepEqual(graph.blocks.map(b=>b.id),['top.a','top.b','top.c']);
  assert.deepEqual(graph.nets.map(n=>[n.id,n.terminals.length,n.ambiguous]),[['top.in',3,false],['top.link',3,false]]);
  const scene=renderScopeConnections(scope,false,()=> 'source');
  assert.equal(scene.connections,4);assert.match(scene.svg,/data-node="top.b"/);
  assert.doesNotMatch(scene.svg,/top.a.hidden/);assert.ok(scene.width>980);
});
test('expressions and slices remain unresolved, multiple drivers and inout never get directional wires',()=>{
  const expression=port('sum','input');expression.connection={kind:'expression',text:'top.x',references:[{name:'x',path:'top.x',location}]};
  const scope=node('top',[],[node('a',[port('o','output','x')]),node('b',[port('o','output','x'),port('io','inout','y')]),node('c',[port('i','input','x'),expression])]);
  const graph=buildScopeConnections(scope);assert.equal(graph.unresolved.length,1);assert.ok(graph.nets.every(n=>n.ambiguous));
  const scene=renderScopeConnections(scope,false,()=> 'source');assert.equal(scene.connections,0);assert.equal(scene.notes.length,2);
  assert.doesNotMatch(scene.svg,/marker-end/);
});
test('cycles terminate, escaped names stay opaque, stale blocks are inaccessible and limits bound output',()=>{
  const scope=node('top',[],[node('a',[port('i','input','n1'),port('o','output','n2')]),node('b',[port('i','input','n2'),port('o','output','n1')])]);
  const scene=renderScopeConnections(scope,true,()=> '0');assert.equal(scene.connections,2);
  assert.match(scene.notes.join(' '),/feedback/);assert.match(scene.svg,/tabindex="-1"/);
  const bounded=buildScopeConnections(node('top',[],Array.from({length:70},(_,i)=>node(`a${i}`,[port('i','input',`n${i}`)]))));
  assert.equal(bounded.blocks.length,64);assert.equal(bounded.limited,true);
  const escaped=renderScopeConnections(node('top',[],[node('<script>',[port('i','input','x')])]),false,()=> '0');
  assert.doesNotMatch(escaped.svg,/<script>/);assert.match(escaped.svg,/&lt;script&gt;/);
});
