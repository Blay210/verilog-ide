import * as vscode from 'vscode';
import assert from 'node:assert/strict';
import {renderStructure} from '../../packages/vscode/src/structure-view';

/** Product HTML/camera in an actual Chromium webview. Inputs here are synthetic. */
export async function probeStructureBrowser(state:any,node:any) {
  const panel=vscode.window.createWebviewPanel('rtl.structureProbe','RTL diagram browser probe',vscode.ViewColumn.Active,{enableScripts:true,localResourceRoots:[]});
  const messages:any[]=[];
  const result=new Promise<any>((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('Diagram browser probe timeout')),90000);
    panel.webview.onDidReceiveMessage(message=>{
      if(message.kind==='browserProbe'){clearTimeout(timer);message.error?reject(Error(message.error)):resolve({...message,navigationMessages:messages});}
      else messages.push(message);
    });
  });
  const html=renderStructure(node,'browserprobe',false,{navigation:state.navigation,context:state.context,operations:state.operations,viewMode:'schematic'}).html;
  const script=String.raw`
  (async()=>{try{
    const canvas=document.getElementById('structure-canvas'),scene=document.getElementById('structure-scene');
    const frame=()=>new Promise(r=>requestAnimationFrame(r));
    await frame();await frame();
    const nodes=[...canvas.querySelectorAll('g[data-node]')];
    if(!nodes.length)throw Error('No keyboard module targets');
    const first=nodes[0];first.focus();
    if(document.activeElement!==first)throw Error('SVG module cannot receive focus');
    first.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
    first.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true,cancelable:true}));
    canvas.focus();
    const before=Number(canvas.dataset.zoom);
    canvas.dispatchEvent(new KeyboardEvent('keydown',{key:'+',bubbles:true,cancelable:true}));
    if(!(Number(canvas.dataset.zoom)>before))throw Error('Focused canvas zoom failed');
    canvas.dispatchEvent(new KeyboardEvent('keydown',{key:'0',bubbles:true,cancelable:true}));
    if(Math.abs(Number(canvas.dataset.zoom)-before)>1e-8)throw Error('Fit recovery failed');
    document.querySelector('[data-camera="actual"]').click();
    const lastNode=nodes[nodes.length-1],offscreen=lastNode.getBoundingClientRect(),viewport=canvas.getBoundingClientRect();
    const wasOffscreen=offscreen.left<viewport.left||offscreen.right>viewport.right||offscreen.top<viewport.top||offscreen.bottom>viewport.bottom;
    lastNode.focus({preventScroll:true});
    const revealed=lastNode.getBoundingClientRect();
    if(!wasOffscreen||Number(canvas.dataset.zoom)!==1||revealed.left<viewport.left||revealed.right>viewport.right||revealed.top<viewport.top||revealed.bottom>viewport.bottom)throw Error('Offscreen module focus did not reveal its bounds at unchanged zoom');
    canvas.focus();canvas.dispatchEvent(new KeyboardEvent('keydown',{key:'0',bubbles:true,cancelable:true}));
    const phases=[];
    const stats=samples=>{samples.sort((a,b)=>a-b);return {frames:samples.length,medianMs:samples[Math.floor(samples.length*.5)],p95Ms:samples[Math.floor(samples.length*.95)],maxMs:samples.at(-1),over50ms:samples.filter(n=>n>50).length};};
    for(let repeat=0;repeat<3;repeat++)for(const phase of ['idle','camera-no-layout','camera']){
      const samples=[],handlers=[],layouts=[];let last=await frame();
      for(let i=0;i<120;i++){
        if(phase!=='idle'){
          const start=performance.now();
          canvas.dispatchEvent(new KeyboardEvent('keydown',{key:i%2?'ArrowLeft':'ArrowRight',bubbles:true,cancelable:true}));
          canvas.dispatchEvent(new WheelEvent('wheel',{deltaY:i%2?10:-10,clientX:500,clientY:500,bubbles:true,cancelable:true}));
          handlers.push(performance.now()-start);
          if(phase==='camera'){const start=performance.now();scene.getBoundingClientRect();layouts.push(performance.now()-start);}
        }
        const now=await frame();samples.push(now-last);last=now;
      }
      phases.push({repeat,phase,...stats(samples),handler:handlers.length?stats(handlers):undefined,layout:layouts.length?stats(layouts):undefined});
    }
    const rect=canvas.getBoundingClientRect();
    vscode.postMessage({kind:'browserProbe',phases,offscreenFocus:true,moduleTargets:nodes.length,svgElements:canvas.querySelectorAll('*').length,viewport:{width:rect.width,height:rect.height},keyboardTarget:first.dataset.node,focusedCanvas:document.activeElement===canvas});
  }catch(error){vscode.postMessage({kind:'browserProbe',error:String(error)});}})();`;
  panel.webview.html=html.replace('</script></body>',script+'</script></body>');
  try {
    const report=await result;
    assert.equal(report.focusedCanvas,true);
    assert.equal(report.navigationMessages.filter((m:any)=>m.action==='node'&&m.id===report.keyboardTarget).length,2,'Enter and Space must both request module navigation');
    assert.ok(report.viewport.width>0&&report.viewport.height>0);
    return report;
  } finally {panel.dispose();}
}
