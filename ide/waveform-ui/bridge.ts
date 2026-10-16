/** Local sandbox bridge; no extension API, Node, filesystem or command access. */
let saved: unknown;
(globalThis as any).acquireVsCodeApi = () => ({
  postMessage: (message: unknown) => parent.postMessage({ rtlWaveform: true, message }, '*'),
  getState: () => saved,
  setState: (state: unknown) => { saved = state; parent.postMessage({ rtlWaveform: true, message: { kind: 'sessionState', state } }, '*'); }
});
window.addEventListener('message', event => {
  if (event.source !== parent || event.data?.kind !== 'window') return;
  requestAnimationFrame(() => {
    const ruler = document.getElementById('ruler') as HTMLCanvasElement | null;
    const canvases = [...document.querySelectorAll<HTMLCanvasElement>('#trace-rows canvas')];
    parent.postMessage({ rtlWaveform: true, message: { kind: 'rendered', rows: canvases.length,
      cursor: document.getElementById('cursor-a')?.textContent,
      aligned: !!ruler && canvases.every(canvas => Math.abs(canvas.getBoundingClientRect().left - ruler.getBoundingClientRect().left) < 1 && Math.abs(canvas.getBoundingClientRect().width - ruler.getBoundingClientRect().width) < 1) } }, '*');
  });
});
