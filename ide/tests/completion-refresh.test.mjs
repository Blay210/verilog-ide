import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import Module from 'node:module';
import { transformSync } from 'esbuild';

// Execute the actual native command handler without a window. The import is
// deliberately gated to test a document change while its chunk is loading.
const source = await fs.readFile('src/rtlSpaces.contribution.ts', 'utf8');
const handler = source.match(/registerCommand\('rtlIde\.editor\.refreshCompletions', (async[\s\S]*?\n      })\)\);/)[1];
assert.equal((handler.match(/await import\([^)]+\)/g) ?? []).length, 1);
const module = new Module('completion-refresh-fixture');
module._compile(transformSync(`module.exports = function(isCodeEditor, contextKeys, loadController) { return ${handler.replace(/await import\([^)]+\)/, 'await loadController()')}; };`, { loader: 'ts', format: 'cjs' }).code, 'completion-refresh-fixture.cjs');
function fixture() {
  const state = { focus: true, visible: true, version: 2, line: 5, column: 9, uri: 'file:///design.sv', calls: [] };
  const editor = { hasTextFocus: () => state.focus, getModel: () => ({ uri: { toString: () => state.uri }, getVersionId: () => state.version }), getPosition: () => ({ lineNumber: state.line, column: state.column }), getDomNode: () => ({}) };
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const owner = { active: 'code', disposing: false, editors: { activeTextEditorControl: editor }, completionIntent: { allows: () => false } };
  const callback = module.exports.call(owner, value => value === editor, { getContext: () => ({ getValue: () => state.visible }) }, async () => { await gate; return { SuggestController: { get: () => ({ model: { trigger: value => state.calls.push(value) } }) } }; });
  const request = { uri: state.uri, version: 2, line: 4, character: 8 };
  return { state, owner, request, release, invoke: () => callback.call(owner, undefined, request) };
}
test('ready notification only refreshes an already visible suggestion at the same document and caret', async () => {
  const f = fixture(); f.release(); await f.invoke();
  assert.deepEqual(f.state.calls, [{ auto: true, retrigger: true }]);
  for (const changes of [{ visible: false }, { focus: false }, { version: 3 }, { line: 6 }, { column: 10 }, { uri: 'file:///other.sv' }]) {
    const f = fixture(); Object.assign(f.state, changes); f.release(); await f.invoke(); assert.equal(f.state.calls.length, 0);
  }
  for (const changes of [{ active: 'simulation' }, { disposing: true }]) {
    const f = fixture(); Object.assign(f.owner, changes); f.release(); await f.invoke(); assert.equal(f.state.calls.length, 0);
  }
});
test('Esc, edit, editor change or space switch during deferred import prevents late reopening', async () => {
  for (const change of [f => f.state.visible = false, f => f.state.version++, f => f.owner.active = 'simulation', f => f.owner.editors.activeTextEditorControl = undefined]) {
    const f = fixture(), pending = f.invoke(); change(f); f.release(); await pending; assert.equal(f.state.calls.length, 0);
  }
});

test('a still-live typing intent opens the first empty-result suggestion without Ctrl+Space', async () => {
  const f=fixture();let valid=true;f.state.visible=false;f.owner.completionIntent.allows=()=>valid;
  f.release();await f.invoke();assert.equal(f.state.calls.length,1);
  const g=fixture();g.state.visible=false;g.owner.completionIntent.allows=()=>valid;
  const pending=g.invoke();valid=false;g.release();await pending;assert.equal(g.state.calls.length,0);
});

test('native intent is armed only while a real suggestion request is pending, never after Escape or an idle controller', async () => {
  const body=source.match(/registerCommand\('rtlIde\.editor\.prepareCompletion', (async[\s\S]*?\n      })\)\);/)[1];
  const loaded=new Module('completion-prepare-fixture');
  loaded._compile(transformSync(`module.exports=function(isCodeEditor,loadController){return ${body.replace(/await import\([^)]+\)/,'await loadController()')};};`,{loader:'ts',format:'cjs'}).code,'prepare.cjs');
  for(const state of [0,1,2,undefined]){
    const f=fixture(),ticket={valid:()=>true,ready:false};f.owner.completionIntent.arm=()=>ticket;
    const callback=loaded.exports.call(f.owner,()=>true,async()=>({SuggestController:{get:()=>state===undefined?undefined:{model:{state}}}}));
    await callback.call(f.owner,undefined,f.request);assert.equal(ticket.ready,state===1||state===2);
  }
  const f=fixture();let valid=true,release;const gate=new Promise(resolve=>{release=resolve});
  const ticket={valid:()=>valid,ready:false};f.owner.completionIntent.arm=()=>ticket;
  const callback=loaded.exports.call(f.owner,()=>true,async()=>{await gate;return{SuggestController:{get:()=>({model:{state:2}})}}});
  const pending=callback.call(f.owner,undefined,f.request);valid=false;release();await pending;assert.equal(ticket.ready,false);
});
