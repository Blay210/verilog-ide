import type { InternalNode } from '@rtl-dev/semantic';

const escape = (s:string) => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
/** Presentation only: retain every compiler node, type and source identity. */
export function schematicSymbol(node:InternalNode,x:number,y:number) {
  const arithmetic=node.kind==='operator'&&['+','×'].includes(node.label);
  const width=arithmetic?100:node.kind==='signal'?180:node.kind==='register'?180:150;
  const height=80,center=x+width/2;
  let shape=`<rect class="block" x="${x}" y="${y}" width="${width}" height="${height}" rx="5"/>`;
  if(arithmetic)shape=`<circle class="block" cx="${center}" cy="${y+32}" r="28"/>`;
  if(node.kind==='control')shape=`<path class="block" d="M${x} ${y} L${x+width} ${y+15} V${y+65} L${x} ${y+80} Z"/>`;
  const label=arithmetic?node.label:node.kind==='control'?'MUX':node.kind==='register'?node.label.replace(/ · next state$/,''):node.kind==='conversion'?(node.label==='implicit conversion'?'Convert':node.label):node.label;
  const text=arithmetic?`<text class="schematic-operator" text-anchor="middle" x="${center}" y="${y+40}">${escape(label)}</text>`:
    `<text x="${x+12}" y="${y+23}">${escape(label.slice(0,21))}</text>`;
  const type=`${node.signalType.width} bit · ${node.signalType.signed?'signed':'unsigned'}`;
  const clock=node.kind==='register'?`<path class="wire" d="M${center-6} ${y+80} L${center} ${y+72} L${center+6} ${y+80}"/><text class="muted" x="${x+12}" y="${y+62}">Register · D → Q</text>`:'';
  return {width,height,svg:shape+text+`<text class="muted" ${arithmetic?'text-anchor="middle"':''} x="${arithmetic?center:x+12}" y="${y+(arithmetic?77:43)}">${escape(type)}</text>`+clock};
}
