/** Preserve keyboard position across webview rebuilds; never activate controls. */
export const structureFocusScript=String.raw`
(()=>{
  const canvas=document.getElementById?.('structure-canvas');
  if(!canvas||!vscode.getState||!vscode.setState||!document.querySelectorAll)return;
  const parts=JSON.parse(canvas.dataset.viewKey),key=JSON.stringify(parts.slice(0,-1));
  const selector='button[data-source],button[data-action],button[data-camera],button[data-node],select[data-view-mode],select[data-scope],g[data-node],#structure-canvas';
  const describe=e=>{
    if(e===canvas)return {type:'canvas',value:''};
    for(const type of ['source','action','camera','node','viewMode','scope'])if(e.dataset?.[type]!==undefined)return {type,value:e.dataset[type]};
  };
  const enabled=e=>!e.disabled&&e.getAttribute?.('aria-disabled')!=='true';
  document.addEventListener('focusin',event=>{
    const e=event.target.closest?.(selector),focus=e&&describe(e);if(!focus||!enabled(e))return;
    const state=vscode.getState()??{},views={...(state.structureFocus??{})};delete views[key];views[key]=focus;
    for(const old of Object.keys(views).slice(0,Math.max(0,Object.keys(views).length-32)))delete views[old];
    vscode.setState({...state,structureFocus:views});
  });
  const saved=vscode.getState()?.structureFocus?.[key];
  if(saved)requestAnimationFrame(()=>{
    if(document.activeElement&&document.activeElement!==document.body)return;
    const target=[...document.querySelectorAll(selector)].find(e=>{
      const focus=describe(e);return focus&&focus.type===saved.type&&focus.value===saved.value&&enabled(e);
    });
    target?.focus();
  });
})();`;
