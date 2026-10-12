export interface Point {x:number;y:number}
export interface RoutingBlock {id:string;column:number;x:number;y:number;width:number;height:number}
export interface RoutingEdge {id:string;source:string;target:string;sourceBlock:string;targetBlock:string;start:Point;end:Point;clock:boolean;dashed:boolean}
export interface RoutedEdge extends RoutingEdge {points:Point[]}
const same=(a:Point,b:Point)=>a.x===b.x&&a.y===b.y;
export function crossesBlock(a:Point,b:Point,block:RoutingBlock,margin=4) {
  const left=block.x-margin,right=block.x+block.width+margin,top=block.y-margin,bottom=block.y+block.height+margin;
  if(a.x===b.x)return a.x>left&&a.x<right&&Math.max(a.y,b.y)>top&&Math.min(a.y,b.y)<bottom;
  if(a.y===b.y)return a.y>top&&a.y<bottom&&Math.max(a.x,b.x)>left&&Math.min(a.x,b.x)<right;
  return true;
}
/** Bounded column corridors; preserve terminals and identities, never infer connectivity. */
export function routeSchematic(edges:RoutingEdge[],blocks:RoutingBlock[]) {
  const byId=new Map(blocks.map(b=>[b.id,b])),columns=new Map<number,{left:number;right:number}>();
  for(const b of blocks){const c=columns.get(b.column)??{left:b.x,right:b.x+b.width};c.left=Math.min(c.left,b.x);c.right=Math.max(c.right,b.x+b.width);columns.set(b.column,c);}
  const sources=[...new Set(edges.map(e=>e.source))],offset=new Map(sources.map((id,i)=>[id,8+20*(i+1)/(sources.length+1)]));
  const ys=[...new Set(blocks.flatMap(b=>[b.y-12,b.y+b.height+12]))].filter(y=>y>=0);
  const routed:RoutedEdge[]=[],unrouted:string[]=[];
  const clear=(a:Point,b:Point,ignore?:string)=>blocks.every(block=>block.id===ignore||!crossesBlock(a,b,block));
  const overlapsOtherNet=(points:Point[],source:string)=>routed.some(route=>route.source!==source&&route.points.slice(1).some((d,j)=>points.slice(1).some((b,i)=>{
    const a=points[i],c=route.points[j];
    return a.y===b.y&&c.y===d.y&&a.y===c.y&&Math.min(Math.max(a.x,b.x),Math.max(c.x,d.x))-Math.max(Math.min(a.x,b.x),Math.min(c.x,d.x))>0.01
      ||a.x===b.x&&c.x===d.x&&a.x===c.x&&Math.min(Math.max(a.y,b.y),Math.max(c.y,d.y))-Math.max(Math.min(a.y,b.y),Math.min(c.y,d.y))>0.01;
  })));
  for(const edge of edges) {
    const source=byId.get(edge.sourceBlock),target=byId.get(edge.targetBlock);
    if(!source||!target){unrouted.push(edge.id);continue;}
    const shift=6*(sources.indexOf(edge.source)+1)/(sources.length+1);
    let points:Point[]|undefined;
    // An earlier route may use the initial escape lane at this terminal's height.
    // Try nearby empty corridors as well; never drop a valid feedback edge for one fixed lane.
    corridors:for(const sourceOffset of [offset.get(edge.source)!,6,32])for(const targetOffset of [offset.get(edge.source)!,6,32]) {
      const a={x:columns.get(source.column)!.right+sourceOffset,y:edge.start.y};
      const b={x:columns.get(target.column)!.left-targetOffset,y:edge.clock?target.y+target.height+12:edge.end.y};
      const tail=edge.clock?[b,{x:edge.end.x,y:b.y},edge.end]:[b,edge.end];
      if(!clear(edge.start,a,source.id)||tail.slice(1).some((p,i)=>!clear(tail[i],p,target.id)))continue;
      const candidates=[edge.start.y,b.y,...ys.map(y=>y+shift)].sort((u,v)=>Math.abs(u-a.y)+Math.abs(u-b.y)-Math.abs(v-a.y)-Math.abs(v-b.y)||u-v);
      for(const y of candidates) {
        const bendA={x:a.x,y},bendB={x:b.x,y};
        const candidate=[edge.start,a,bendA,bendB,...tail];
        if(clear(a,bendA)&&clear(bendA,bendB)&&clear(bendB,b)&&!overlapsOtherNet(candidate,edge.source)) {points=candidate;break corridors;}
      }
    }
    if(!points){unrouted.push(edge.id);continue;}
    // Retain bends but discard zero-length pieces for intersection classification.
    routed.push({...edge,points:points.filter((p,i)=>i===0||!same(p,points![i-1]))});
  }
  return {edges:routed,unrouted};
}
export function routePath(points:Point[]) {return points.map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join(' ');}

/** Same-source junctions versus nonconnecting perpendicular crossings. No dot from a crossing alone. */
export function routingMarks(edges:RoutedEdge[]) {
  const segments=edges.flatMap(edge=>edge.points.slice(1).map((b,i)=>({a:edge.points[i],b,edge})));
  const junctions=new Map<string,Point>(),crossings=new Map<string,Point>();
  const sourceSegments=new Map<string,typeof segments>(),classified=new Set<string>();
  for(const segment of segments){const key=segment.edge.source+':'+segment.edge.dashed;const group=sourceSegments.get(key)??[];group.push(segment);sourceSegments.set(key,group);}
  let checks=0,limited=false;
  outer:for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++) {
    if(++checks>2_000_000){limited=true;break outer;}
    const one=segments[i],two=segments[j];if(one.edge.id===two.edge.id)continue;
    const horizontal=one.a.y===one.b.y?one:two,vertical=horizontal===one?two:one;
    if(horizontal.a.y!==horizontal.b.y||vertical.a.x!==vertical.b.x)continue;
    const p={x:vertical.a.x,y:horizontal.a.y};
    if(p.x<Math.min(horizontal.a.x,horizontal.b.x)||p.x>Math.max(horizontal.a.x,horizontal.b.x)||p.y<Math.min(vertical.a.y,vertical.b.y)||p.y>Math.max(vertical.a.y,vertical.b.y))continue;
    const key=p.x+','+p.y;
    if(one.edge.source===two.edge.source&&one.edge.dashed===two.edge.dashed) {
      const sourceKey=one.edge.source+':'+one.edge.dashed,classification=sourceKey+':'+key;
      if(classified.has(classification))continue;classified.add(classification);
      // Count directions at the intersection: a shared bend alone is not a branch.
      const directions=new Set<string>();
      for(const s of sourceSegments.get(sourceKey)!) {
        if(s.a.y===s.b.y&&s.a.y===p.y&&p.x>=Math.min(s.a.x,s.b.x)&&p.x<=Math.max(s.a.x,s.b.x)){if(Math.min(s.a.x,s.b.x)<p.x)directions.add('left');if(Math.max(s.a.x,s.b.x)>p.x)directions.add('right');}
        if(s.a.x===s.b.x&&s.a.x===p.x&&p.y>=Math.min(s.a.y,s.b.y)&&p.y<=Math.max(s.a.y,s.b.y)){if(Math.min(s.a.y,s.b.y)<p.y)directions.add('up');if(Math.max(s.a.y,s.b.y)>p.y)directions.add('down');}
      }
      if(directions.size>=3)junctions.set(key,p);
    } else if(p.x>Math.min(horizontal.a.x,horizontal.b.x)+4&&p.x<Math.max(horizontal.a.x,horizontal.b.x)-4&&p.y>Math.min(vertical.a.y,vertical.b.y)+4&&p.y<Math.max(vertical.a.y,vertical.b.y)-4)crossings.set(key,p);
  }
  // Do not erase a known branch; coincident different-net geometry remains an explicit limitation.
  for(const key of junctions.keys())crossings.delete(key);
  return {junctions:[...junctions.values()],crossings:[...crossings.values()],limited};
}
