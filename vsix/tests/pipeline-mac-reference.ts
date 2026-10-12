/** Independent wide-integer oracle; no RTL parsing or inferred graph evaluation. */
export const stimuli = [
  [1,1,7,7],[0,1,7,7],[0,1,7,7],[0,0,-2,3],[0,1,-2,3],
  [0,1,-8,-8],[0,1,15,15],[0,1,-1,2],[1,0,0,0],[0,0,7,7],
  [0,1,127,127],[0,1,127,127],[0,1,127,127]
] as const;
export const variants = [
  {name:'signed4',width:4,accWidth:6,signed:true},
  {name:'signed8',width:8,accWidth:10,signed:true},
  {name:'unsigned4',width:4,accWidth:6,signed:false}
] as const;
export function reference(v: typeof variants[number]) {
  const wrap = (n:bigint,width:number) => v.signed ? BigInt.asIntN(width,n) : BigInt.asUintN(width,n);
  let stage=0n,acc=0n;
  return stimuli.map(([reset,enable,a,b],i)=>{
    const product=wrap(BigInt(a),v.width)*wrap(BigInt(b),v.width);
    const previous={stage,acc};
    if(reset){stage=0n;acc=0n;}
    else if(enable){acc=wrap(acc+stage,v.accWidth);stage=wrap(product,2*v.width);}
    return {cycle:i+1,tick:String((15+i*10)*1000),product,stage,acc,previous};
  });
}
export const bits=(n:bigint,width:number)=>BigInt.asUintN(width,n).toString(2).padStart(width,'0');
