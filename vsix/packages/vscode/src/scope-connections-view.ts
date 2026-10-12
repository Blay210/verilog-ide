import { buildScopeConnections, type HierarchyNode, type ScopeTerminal, type SourcePoint } from '@rtl-dev/semantic';

const escape = (s: string) => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const label = (s: string) => escape(s.length > 28 ? s.slice(0,27)+'…' : s);
/** Topology columns are a presentation choice, never inferred physical placement. */
export function renderScopeConnections(scope: HierarchyNode, stale: boolean, source: (point:SourcePoint)=>string, observe?: (instance:string,port:string)=>string) {
  const graph = buildScopeConnections(scope), columns = new Map(graph.blocks.map(b=>[b.id,0]));
  const adjacency = new Map(graph.blocks.map(b=>[b.id,new Set<string>()])), indegree = new Map(graph.blocks.map(b=>[b.id,0]));
  for (const net of graph.nets) {
    if (net.ambiguous) continue;
    const driver = net.terminals.find(t=>t.role==='driver')!;
    if(driver.boundary) continue;
    for(const sink of net.terminals.filter(t=>!t.boundary && t.role==='sink' && t.instanceId!==driver.instanceId)) {
      const targets=adjacency.get(driver.instanceId)!;
      if(!targets.has(sink.instanceId)){targets.add(sink.instanceId);indegree.set(sink.instanceId,indegree.get(sink.instanceId)!+1);}
    }
  }
  const queue=graph.blocks.filter(b=>indegree.get(b.id)===0).map(b=>b.id), processed=new Set<string>();
  for(let i=0;i<queue.length;i++) {
    const id=queue[i];processed.add(id);
    for(const target of adjacency.get(id)!) {
      columns.set(target,Math.max(columns.get(target)!,columns.get(id)!+1));
      indegree.set(target,indegree.get(target)!-1);if(indegree.get(target)===0)queue.push(target);
    }
  }
  // Cycles are kept as visible module blocks; no fictitious acyclic flow is assigned.
  for(const b of graph.blocks) if(!processed.has(b.id)) columns.set(b.id,0);
  const maxColumn=Math.max(0,...columns.values()), width=600+(maxColumn+1)*360;
  const anchors=new Map<string,{x:number;y:number}>(), usedHeight=new Map<number,number>();
  let cards='', maxY=220;
  const terminalLabel=(t:ScopeTerminal,x:number,y:number,align='start')=>{
    const id=source(t.port.location), value=observe?.(t.instanceId,t.port.name);
    return `<text x="${x}" y="${y}" text-anchor="${align}" data-source="${escape(id)}"><title>${escape(t.port.name+' · '+t.port.direction+' '+t.port.type)}</title>${label(t.port.name)}</text>${value!==undefined?`<text x="${x}" y="${y+17}" text-anchor="${align}" data-port-value="${escape(value)}">${stale?'Unavailable':'…'}</text>`:''}`;
  };
  for(const block of graph.blocks) {
    const col=columns.get(block.id)!, x=260+col*360,y=usedHeight.get(col)??65;
    const ports=[...graph.nets.flatMap(n=>n.terminals),...graph.unresolved].filter(t=>!t.boundary&&t.instanceId===block.id);
    const left=ports.filter(t=>t.port.direction!=='output'),right=ports.filter(t=>t.port.direction==='output');
    const height=75+Math.max(left.length,right.length,1)*44;
    cards+=`<g data-node="${escape(block.id)}" class="scope" role="button" tabindex="${stale?'-1':'0'}" aria-disabled="${stale}" aria-label="View inside ${escape(block.id)}"><title>${escape(block.id)}</title><rect class="block" x="${x}" y="${y}" width="240" height="${height}" rx="5"/><text class="heading" x="${x+12}" y="${y+24}">${label(block.name)}</text><text class="muted" x="${x+12}" y="${y+43}">${label(block.module??'')}</text>`;
    for(const [group,side] of [[left,'left'],[right,'right']] as const) group.forEach((t,i)=>{
      const py=y+72+i*44,px=side==='left'?x:x+240;anchors.set(t.id,{x:px,y:py});
      cards+=`<circle class="signal" cx="${px}" cy="${py}" r="3"/>`+terminalLabel(t,side==='left'?px+10:px-10,py-4,side==='left'?'start':'end');
    });
    cards+='</g>';usedHeight.set(col,y+height+45);maxY=Math.max(maxY,y+height+65);
  }
  let inputs=0,outputs=0;
  for(const t of graph.boundary) {
    const output=t.port.direction==='output',y=85+(output?outputs++:inputs++)*54,x=output?width-55:55;
    anchors.set(t.id,{x,y});cards+=`<circle class="signal" cx="${x}" cy="${y}" r="4"/>`+terminalLabel(t,output?x-8:x+8,y-7,output?'end':'start');maxY=Math.max(maxY,y+60);
  }
  let wires='', connections=0;
  for(const net of graph.nets) {
    if(net.ambiguous) continue;
    const driver=net.terminals.find(t=>t.role==='driver')!,a=anchors.get(driver.id)!;
    for(const sink of net.terminals.filter(t=>t.role==='sink')) {
      const b=anchors.get(sink.id)!; const mid=a.x<b.x?(a.x+b.x)/2:Math.max(a.x,b.x)+25;
      wires+=`<g><title>${escape(net.id)}</title><path class="wire" data-scope-net="${escape(net.id)}" marker-end="url(#arrow)" d="M${a.x} ${a.y} H${mid} V${b.y} H${b.x}"/></g>`;connections++;
    }
  }
  const unresolved=graph.unresolved.filter(t=>t.port.connection.kind!=='unconnected');
  const ambiguous=graph.nets.filter(n=>n.ambiguous);
  const notes=[graph.limited?'View limited to 64 modules / 512 ports. Select a smaller scope.':'',
    unresolved.length?`${unresolved.length} ports have expressions, slices, interfaces or missing direct-signal metadata; no direct net is inferred.`:'',
    ambiguous.length?`${ambiguous.length} nets have no single visible driver or are bidirectional; connectivity is listed below without directional wires.`:'',
    processed.size<graph.blocks.length?'Module feedback is present; these blocks share a column. Placement is not timing analysis.':''].filter(Boolean);
  return {svg:`<rect x="20" y="20" width="${width-40}" height="${maxY-25}" class="scope-boundary"/>`+wires+cards,width,height:maxY+20,notes,graph,connections};
}
