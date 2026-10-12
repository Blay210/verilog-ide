import type {InternalGraph,SourcePoint,HierarchyNode,PortBinding} from '@rtl-dev/semantic';
import {schematicSymbol} from './schematic-symbol';
import {routeSchematic,routePath,routingMarks,type RoutingBlock} from './schematic-routing';
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
/** Group child boundary terminals into opaque cards. Grouping is layout, never child evaluation. */
export function renderScopeOperations(graph:InternalGraph,stale:boolean,source:(point:SourcePoint)=>string,observe?:(name:string)=>string,scope?:HierarchyNode) {
  const modules=graph.modules??[],owner=new Map<string,string>();
  modules.forEach((m,i)=>m.ports.forEach(p=>owner.set(p.nodeId,`module:${i}`)));
  const ordinary=graph.nodes.filter(n=>!owner.has(n.id));
  // Only exact compiler identity and matching width may turn a signal into a boundary terminal.
  const boundary=new Map<string,PortBinding>();
  if(scope?.id===graph.instanceId)for(const port of scope.ports) {
    if(!port.internalSignal||!['input','output'].includes(port.direction)||port.signalType?.width===undefined)continue;
    const matches=ordinary.filter(n=>n.kind==='signal'&&n.declarationId===port.internalSignal&&n.signalType.width===port.signalType!.width);
    if(matches.length===1&&scope.ports.filter(p=>p.internalSignal===port.internalSignal).length===1)boundary.set(matches[0].id,port);
  }
  const keys=[...ordinary.map(n=>n.id),...modules.map((_,i)=>`module:${i}`)];
  const degree=new Map(keys.map(k=>[k,0])),columns=new Map(keys.map(k=>[k,0])),adjacency=new Map(keys.map(k=>[k,new Set<string>()]));
  const group=(id:string)=>owner.get(id)??id;
  for(const edge of graph.edges) {
    if(edge.role==='state output'||edge.role.includes('hold')||edge.role.startsWith('clock'))continue;
    const a=group(edge.source),b=group(edge.target);
    if(a===b||!adjacency.has(a)||!adjacency.has(b)||adjacency.get(a)!.has(b))continue;
    adjacency.get(a)!.add(b);degree.set(b,degree.get(b)!+1);
  }
  const queue=keys.filter(k=>degree.get(k)===0),processed=new Set<string>();
  for(let i=0;i<queue.length;i++) {
    const k=queue[i];processed.add(k);
    for(const target of adjacency.get(k)!) {
      columns.set(target,Math.max(columns.get(target)!,columns.get(k)!+1));
      degree.set(target,degree.get(target)!-1);if(degree.get(target)===0)queue.push(target);
    }
  }
  for(const k of keys)if(!processed.has(k))columns.set(k,0);
  const outputColumn=boundary.size?Math.max(0,...columns.values())+2:undefined;
  if(outputColumn!==undefined) {
    for(const key of keys)columns.set(key,boundary.get(key)?.direction==='input'?0:boundary.get(key)?.direction==='output'?outputColumn:columns.get(key)!+1);
  }
  const columnWidths=new Map<number,number>();
  for(const key of keys) {
    const node=ordinary.find(n=>n.id===key),width=boundary.has(key)?180:node?schematicSymbol(node,0,0).width:220,column=columns.get(key)!;
    columnWidths.set(column,Math.max(columnWidths.get(column)??0,width));
  }
  const columnX=new Map<number,number>();let right=35;
  for(let column=0;column<=Math.max(outputColumn??0,...columns.values());column++) {
    columnX.set(column,right);right+=(columnWidths.get(column)??0)+70;
  }
  const positions=new Map<string,{input:{x:number;y:number};output:{x:number;y:number}}>(),rows=new Map<number,number>();
  const edgeInputs=new Map<InternalGraph['edges'][number],{x:number;y:number}>();
  const routingBlocks:RoutingBlock[]=[];
  let cards='',height=200;
  const place=(key:string,h:number)=>{
    const column=columns.get(key)!,p={x:columnX.get(column)!,y:rows.get(column)??55};
    rows.set(column,p.y+h+35);height=Math.max(height,p.y+h+45);return p;
  };
  for(const node of ordinary) {
    const p=place(node.id,80),symbol=schematicSymbol(node,p.x,p.y),sid=node.source?source(node.source):undefined,value=node.kind==='signal'&&node.signalName!==undefined?observe?.(node.signalName):undefined;
    const port=boundary.get(node.id);
    routingBlocks.push({id:node.id,column:columns.get(node.id)!,x:p.x,y:p.y,width:port?180:symbol.width,height:80});
    if(port) {
      positions.set(node.id,{input:{x:p.x,y:p.y+40},output:{x:p.x+180,y:p.y+40}});
      cards+=`<g data-boundary-port="${escape(port.name)}" ${sid!==undefined?`data-source="${escape(sid)}"`:''}><title>${escape(port.direction+' '+port.name+' · '+node.signalType.text)}</title><path class="signal" d="M${p.x} ${p.y+12} H${p.x+166} L${p.x+180} ${p.y+40} L${p.x+166} ${p.y+68} H${p.x} Z"/><text x="${p.x+10}" y="${p.y+31}">${escape(port.name.slice(0,21))}</text><text class="muted" x="${p.x+10}" y="${p.y+49}">${escape(port.direction+' · '+node.signalType.width+' bit')}</text><text x="${p.x+10}" y="${p.y+64}" ${value!==undefined?`data-port-value="${escape(value)}"`:''}>${value!==undefined?stale?'Unavailable':'…':''}</text></g>`;
      continue;
    }
    const arithmetic=node.kind==='operator'&&['+','×'].includes(node.label);
    positions.set(node.id,{input:{x:p.x,y:p.y+40},output:{x:p.x+symbol.width-(arithmetic?22:0),y:p.y+(arithmetic?32:40)}});
    const inputs=graph.edges.filter(e=>e.target===node.id&&!e.role.startsWith('clock'));
    inputs.forEach((edge,index)=>{
      const offset=20+40*(index+1)/(inputs.length+1);
      edgeInputs.set(edge,{x:p.x+(arithmetic?50-Math.sqrt(Math.max(0,28**2-(offset-32)**2)):0),y:p.y+offset});
    });
    graph.edges.filter(e=>e.target===node.id&&e.role.startsWith('clock')).forEach(edge=>edgeInputs.set(edge,{x:p.x+symbol.width/2,y:p.y+80}));
    cards+=`<g data-symbol="${node.kind}" ${sid!==undefined?`data-source="${escape(sid)}"`:''}><title>${escape(node.label+' · '+node.signalType.text+' · '+node.kind)}</title>${symbol.svg}<text x="${p.x+12}" y="${p.y+64}" ${value!==undefined?`data-port-value="${escape(value)}"`:''}>${value!==undefined?stale?'Unavailable':'…':''}</text></g>`;
  }
  modules.forEach((module,i)=>{
    const inputs=module.ports.filter(p=>p.direction==='input'),outputs=module.ports.filter(p=>p.direction==='output');
    const h=70+Math.max(inputs.length,outputs.length,1)*32,p=place(`module:${i}`,h);
    routingBlocks.push({id:`module:${i}`,column:columns.get(`module:${i}`)!,x:p.x,y:p.y,width:220,height:h});
    cards+=`<g data-node="${escape(module.instanceId)}" class="scope" role="button" tabindex="${stale?'-1':'0'}" aria-disabled="${stale}" aria-label="View inside ${escape(module.instanceId)}"><title>${escape(module.instanceId)}</title><rect class="block" x="${p.x}" y="${p.y}" width="220" height="${h}" rx="5"/><text class="heading" x="${p.x+10}" y="${p.y+24}">${escape(module.name.slice(0,28))}</text><text class="muted" x="${p.x+10}" y="${p.y+43}">${escape(module.module.slice(0,28))}</text>`;
    for(const [ports,isOutput] of [[inputs,false],[outputs,true]] as const)ports.forEach((port,index)=>{
      const x=p.x+(isOutput?220:0),y=p.y+70+index*32;
      positions.set(port.nodeId,{input:{x,y},output:{x,y}});
      const n=graph.nodes.find(n=>n.id===port.nodeId)!;
      cards+=`<circle class="signal" cx="${x}" cy="${y}" r="3"/><text x="${x+(isOutput?-8:8)}" y="${y-5}" text-anchor="${isOutput?'end':'start'}"><title>${escape(port.direction+' '+n.signalType.text+(port.connected?'':' · unconnected'))}</title>${escape(port.name.slice(0,18))}</text>`;
    });cards+='</g>';
  });
  const routing=routeSchematic(graph.edges.flatMap((edge,index)=>{
    const start=positions.get(edge.source)?.output,end=edgeInputs.get(edge)??positions.get(edge.target)?.input;
    return start&&end?[{id:String(index),source:edge.source,target:edge.target,sourceBlock:group(edge.source),targetBlock:group(edge.target),start,end,clock:edge.role.startsWith('clock'),dashed:edge.role==='state output'||edge.role.startsWith('clock')}]:[];
  }),routingBlocks);
  const marks=routingMarks(routing.edges);
  const wires=routing.edges.map(edge=>`<g data-edge-role="${escape(graph.edges[Number(edge.id)].role)}"><title>${escape(graph.edges[Number(edge.id)].role)}</title><path class="wire" ${edge.dashed?'stroke-dasharray="5 4"':''} marker-end="url(#arrow)" d="${routePath(edge.points)}"/></g>`).join('');
  const crossings=marks.crossings.map(p=>`<g class="nonconnecting-crossing"><title>Crossing · not connected</title><path class="crossing-gap" d="M${p.x-4} ${p.y} H${p.x+4}"/><path class="wire" d="M${p.x-4} ${p.y} H${p.x+4}"/></g>`).join('');
  const junctions=marks.junctions.map(p=>`<circle class="junction" cx="${p.x}" cy="${p.y}" r="3"/>`).join('');
  for(const edge of routing.edges)for(const p of edge.points){right=Math.max(right,p.x+20);height=Math.max(height,p.y+20);}
  const frame=outputColumn!==undefined?`<rect class="scope-boundary" x="${columnX.get(1)!-20}" y="8" width="${(columnX.get(outputColumn)!-30)-(columnX.get(1)!-20)}" height="${height}" rx="6"/><text class="muted" x="${columnX.get(1)!}" y="28">${escape(scope?.module??graph.instanceId)}</text>`:'';
  return {svg:frame+wires+crossings+junctions+cards,width:Math.max(980,right),height:height+20,cyclicLayout:processed.size<keys.length,routingIncomplete:routing.unrouted.length>0||marks.limited,routingUnrouted:routing.unrouted};
}
