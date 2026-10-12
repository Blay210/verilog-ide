import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {structureFocusScript} from '../packages/vscode/src/structure-focus';

function runtime(saved:any={},disabled=false,alreadyFocused=false) {
  let state=saved,listener:any,restore:any,focused=0;
  const key=JSON.stringify(['project','current','','test','dut']);
  const canvas={dataset:{viewKey:JSON.stringify(['project','current','','test','dut','schematic'])}};
  const source={dataset:{source:'1'},disabled,getAttribute:()=>null,focus:()=>{focused++;},closest(){return this;}};
  const body={},document={body,activeElement:alreadyFocused?source:body,getElementById:()=>canvas,querySelectorAll:()=>[source],addEventListener:(_kind:string,fn:any)=>{listener=fn;}};
  vm.runInNewContext(structureFocusScript,{document,vscode:{getState:()=>state,setState:(next:any)=>{state=structuredClone(next);}},requestAnimationFrame:(fn:any)=>{restore=fn;}});
  return {key,focus:()=>listener({target:source}),restore:()=>restore?.(),get state(){return state;},get focused(){return focused;}};
}
test('source focus persists without discarding camera state and restores without activation',()=>{
  const first=runtime({structureCameras:{kept:true}});first.focus();assert.deepEqual(first.state.structureCameras,{kept:true});
  const next=runtime(first.state);next.restore();assert.equal(next.focused,1);
  assert.equal(runtime(first.state,true).focused,0);
  const disabled=runtime(first.state,true);disabled.restore();assert.equal(disabled.focused,0);
  const active=runtime(first.state,false,true);active.restore();assert.equal(active.focused,0);
});
test('focus history is bounded and ignores disabled controls',()=>{
  const views=Object.fromEntries(Array.from({length:40},(_,i)=>[String(i),{type:'canvas',value:''}]));
  const h=runtime({structureFocus:views});h.focus();assert.equal(Object.keys(h.state.structureFocus).length,32);
  const disabled=runtime({},true);disabled.focus();assert.deepEqual(disabled.state,{});
});
