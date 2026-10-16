import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Module from 'node:module';
import {transformSync} from 'esbuild';
const loaded=new Module('intent');loaded._compile(transformSync(fs.readFileSync('src/rtlCompletionIntent.ts','utf8'),{loader:'ts',format:'cjs'}).code,'intent.cjs');
const {RtlCompletionIntent}=loaded.exports;
function fixture(now){
 const events=new Map(),state={active:true,focus:true,version:2,line:3,column:8,uri:'file:///code.sv',empty:true};
 const listen=name=>fn=>{events.set(name,fn);return{dispose:()=>events.delete(name)}};
 const editor={hasTextFocus:()=>state.focus,getModel:()=>({uri:{toString:()=>state.uri},getVersionId:()=>state.version}),getPosition:()=>({lineNumber:state.line,column:state.column}),getSelection:()=>({isEmpty:()=>state.empty})};
 for(const name of ['onKeyDown','onMouseDown','onDidBlurEditorText','onDidChangeCursorSelection','onDidChangeModelContent','onDidChangeModel'])editor[name]=listen(name);
 const intent=new RtlCompletionIntent(now),request={uri:state.uri,version:2,line:2,character:7};
 const ticket=intent.arm(editor,request,()=>state.active);
 return {events,state,editor,intent,request,ticket};
}
test('typing intent survives an empty result but requires an armed exact live document and caret',()=>{
 const f=fixture();assert.equal(f.intent.allows(f.request),false);f.ticket.ready=true;assert.equal(f.intent.allows(f.request),true);
 for(const change of [{active:false},{focus:false},{version:3},{line:4},{column:9},{uri:'file:///other.sv'},{empty:false}]){
  const f=fixture();f.ticket.ready=true;Object.assign(f.state,change);assert.equal(f.intent.allows(f.request),false);
 }
 f.intent.dispose();assert.equal(f.intent.allows(f.request),false);assert.equal(f.events.size,0);
});

test('an old empty-result intent cannot reopen on an unrelated later analysis without a new typing request',()=>{
 let now=100;const f=fixture(()=>now);f.ticket.ready=true;
 now+=10001;assert.equal(f.intent.allows(f.request),false);
 const ticket=f.intent.arm(f.editor,f.request,()=>true);ticket.ready=true;assert.equal(f.intent.allows(f.request),true);
 now-=1;assert.equal(f.intent.allows(f.request),false);f.intent.dispose();
});
test('Escape, acceptance, pointer, focus and edit cancel intent permanently even before ready arrives',()=>{
 for(const [name,event] of [['onKeyDown',{keyCode:9}],['onKeyDown',{keyCode:3}],['onKeyDown',{keyCode:2}],...['onMouseDown','onDidBlurEditorText','onDidChangeCursorSelection','onDidChangeModelContent','onDidChangeModel'].map(name=>[name,{}])]){
  const f=fixture();f.events.get(name)(event);f.ticket.ready=true;assert.equal(f.intent.allows(f.request),false,name);f.intent.dispose();
 }
 const f=fixture(),old=f.ticket,newTicket=f.intent.arm(f.editor,f.request,()=>true);old.ready=true;assert.equal(old.valid(),false);newTicket.ready=true;assert.equal(f.intent.allows(f.request),true);f.intent.dispose();
});
