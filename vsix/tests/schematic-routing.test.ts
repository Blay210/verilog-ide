import test from 'node:test';
import assert from 'node:assert/strict';
import {routeSchematic,crossesBlock,routingMarks,type RoutingBlock,type RoutingEdge,type RoutedEdge} from '../packages/vscode/src/schematic-routing';
const blocks:RoutingBlock[]=[{id:'a',column:0,x:20,y:55,width:180,height:80},{id:'obstacle',column:1,x:270,y:55,width:220,height:180},{id:'b',column:2,x:560,y:55,width:180,height:80}];
const edge:RoutingEdge={id:'wire',source:'a',target:'b',sourceBlock:'a',targetBlock:'b',start:{x:200,y:95},end:{x:560,y:95},clock:false,dashed:false};
test('long forward and backward routes preserve terminals and avoid intermediate cards',()=>{
  const reversed={...edge,id:'feedback',source:'b',target:'a',sourceBlock:'b',targetBlock:'a',start:{x:740,y:95},end:{x:20,y:95},dashed:true};
  const before=JSON.stringify({blocks,edge});
  const result=routeSchematic([edge,reversed],blocks);assert.equal(result.unrouted.length,0);
  for(const route of result.edges) {
    assert.deepEqual(route.points[0],route.start);assert.deepEqual(route.points.at(-1),route.end);
    for(let i=1;i<route.points.length;i++)for(const block of blocks) {
      if(i===1&&block.id===route.sourceBlock||i===route.points.length-1&&block.id===route.targetBlock)continue;
      assert.equal(crossesBlock(route.points[i-1],route.points[i],block),false,`${route.id} crosses ${block.id}`);
    }
  }
  assert.equal(JSON.stringify({blocks,edge}),before);
});
test('clock and same-block feedback use bottom and outside corridors without cutting through a register',()=>{
  const clock={...edge,clock:true,dashed:true,end:{x:650,y:135}};
  const loop={...edge,id:'loop',source:'b',sourceBlock:'b',target:'b',targetBlock:'b',start:{x:740,y:95},end:{x:560,y:110},dashed:true};
  const result=routeSchematic([clock,loop],blocks);assert.equal(result.unrouted.length,0);
  assert.equal(result.edges[0].points.at(-2)!.x,clock.end.x);assert.ok(result.edges[0].points.at(-2)!.y>clock.end.y);
  for(const route of result.edges)for(let i=2;i<route.points.length-(route.clock?2:1);i++)for(const block of blocks)assert.equal(crossesBlock(route.points[i-1],route.points[i],block),false);
  assert.deepEqual(routeSchematic([{...edge,sourceBlock:'missing'}],blocks).unrouted,['wire']);
});
test('different nets take distinct obstacle detours rather than sharing a collinear track',()=>{
  const extra={id:'z',column:0,x:20,y:170,width:180,height:80};
  const next={...edge,id:'second',source:'z',sourceBlock:'z',start:{x:200,y:210},end:{x:560,y:115}};
  const result=routeSchematic([edge,next],[...blocks,extra]);assert.equal(result.unrouted.length,0);
  const tracks=result.edges.map(e=>e.points.slice(1).filter((p,i)=>p.y===e.points[i].y&&Math.abs(p.x-e.points[i].x)>200).map(p=>p.y));
  assert.ok(tracks[0].length&&tracks[1].length);assert.ok(!tracks[0].some(y=>tracks[1].includes(y)));
});
const routed=(id:string,source:string,points:RoutedEdge['points']):RoutedEdge=>({...edge,id,source,points,start:points[0],end:points.at(-1)!});
test('a different-net crossing gets a gap, a same-net T gets a dot and a shared bend gets neither',()=>{
  const horizontal=routed('one','a',[{x:0,y:20},{x:80,y:20}]);
  const vertical=routed('two','b',[{x:40,y:0},{x:40,y:60}]);
  const crossing=routingMarks([horizontal,vertical]);assert.deepEqual(crossing.crossings,[{x:40,y:20}]);assert.deepEqual(crossing.junctions,[]);
  const branch=routingMarks([horizontal,routed('branch','a',[{x:40,y:20},{x:40,y:60}])]);
  assert.deepEqual(branch.junctions,[{x:40,y:20}]);assert.deepEqual(branch.crossings,[]);
  const bend=[{x:0,y:20},{x:40,y:20},{x:40,y:60}];assert.deepEqual(routingMarks([routed('same1','a',bend),routed('same2','a',bend)]).junctions,[]);
});
