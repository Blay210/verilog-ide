import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';

const require = createRequire(import.meta.url);
const { runProcess, checkedProcess, ProcessFailure } = require('../dist/runtime/core/process.js');
const { blockTermination, cleanupTree } = require('./helpers/termination-control.cjs');
const helper = path.join(root, 'tests/helpers/process-tree.cjs');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function alive(pid) {
  if (process.platform === 'linux') {
    try { const stat = await fs.readFile(`/proc/${pid}/stat`, 'utf8'); return !['Z', 'X'].includes(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[0]); }
    catch (error) { if (['ENOENT', 'ESRCH'].includes(error.code)) return false; throw error; }
  }
  try { process.kill(pid, 0); return true; } catch (error) { if (error.code === 'ESRCH') return false; throw error; }
}
async function stopped(pids) {
  const deadline = Date.now() + 3000;
  while ((await Promise.all(pids.map(alive))).some(Boolean) && Date.now() < deadline) await pause(10);
  assert.deepEqual(await Promise.all(pids.map(alive)), pids.map(() => false));
}
function tree(signal, onLog = () => {}, args = []) {
  let text = '', ready; const pids = new Map();
  const entered = new Promise(resolve => { ready = resolve; });
  const running = runProcess({ executable: process.execPath, args: [helper, '2', ...args], cwd: root }, { signal, onLog: chunk => {
    onLog(chunk); text += chunk;
    for (const match of text.matchAll(/^TREE (.+)\n/gm)) { const row = JSON.parse(match[1]); pids.set(row.level, row.pid); }
    if (pids.size === 3) ready();
  } });
  const outcome = running.then(value => ({ value }), error => ({ error }));
  return { entered, outcome, pids };
}

test('literal arguments, nonzero exit, missing executable and pre-abort remain distinct', async () => {
  const value = '한글 space & $(echo wrong) "quoted"';
  assert.equal(await checkedProcess({ executable: process.execPath, args: ['-e', 'process.stdout.write(process.argv[1])', value], cwd: root }), value);
  await assert.rejects(checkedProcess({ executable: process.execPath, args: ['-e', 'console.error("compile failed");process.exit(3)'], cwd: root }), /compile failed/);
  await assert.rejects(runProcess({ executable: 'rtl-nonexistent-h7c', args: [], cwd: root }), /Could not start/);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(runProcess({ executable: process.execPath, args: [helper, '2'], cwd: root }, { signal: controller.signal }), error => error instanceof ProcessFailure && error.cancelled);
});

test('interactive owned leaf preserves UTF-8 input and EOF through the common runner', async () => {
  const value='한글 source #10;';
  const result=await checkedProcess({executable:process.execPath,args:['-e','process.stdin.setEncoding("utf8");process.stdin.on("data",s=>process.stdout.write(s))'],cwd:root,termination:'process'}, {onStdin:input=>input.end(value)});
  assert.equal(result,value);
});

test('failed interactive leaf termination reports cleanup failure and releases its input pipe', { timeout: 15000 }, async () => {
  const controller=new AbortController(); let pid, writer, entered;
  const ready=new Promise(resolve=>{entered=resolve;}); let text='';
  const running=runProcess({executable:process.execPath,args:['-e','process.stdout.write(String(process.pid)+"\\n");process.stdin.resume();setInterval(()=>{},1000)'],cwd:root,termination:'process'},
    {signal:controller.signal,onStdin:input=>{writer=input;},onLog:chunk=>{text+=chunk;if(text.includes('\n')){pid=Number(text.split('\n')[0]);entered();}}});
  const outcome=running.then(value=>({value}),error=>({error}));let restore=()=>{};
  try {
    await ready;restore=blockTermination(pid);controller.abort();const result=await outcome;
    assert.equal(result.error?.cleanupFailed,true);assert.equal(result.value,undefined);assert.equal(writer.destroyed,true);
  } finally {restore();if(pid)await cleanupTree([pid],pid);await outcome;if(pid)await stopped([pid]);}
});

test('owned leaf cancellation joins actual exit while the process races natural completion', { timeout: 30000 }, async () => {
  for (let i = 0; i < 20; i++) {
    const controller = new AbortController();
    const result = await runProcess({ executable: process.execPath, args: ['-e', 'process.stdout.write("ready"); process.exit(0)'], cwd: root, termination: 'process' },
      { signal: controller.signal, onLog: () => controller.abort() });
    assert.equal(result.cancelled, true);
  }
});

test('cancellation kills a real parent/child/grandchild group and preserves a separate peer', { timeout: 15000 }, async () => {
  const controller = new AbortController(), other = new AbortController();
  let logs = 0; const owned = tree(controller.signal, () => { logs++; }), peer = tree(other.signal);
  try {
    await Promise.all([owned.entered, peer.entered]); controller.abort();
    const { value, error } = await owned.outcome; assert.equal(error, undefined); assert.equal(value.cancelled, true);
    await stopped([...owned.pids.values()]);
    assert.ok((await Promise.all([...peer.pids.values()].map(alive))).every(Boolean));
    const count = logs; await pause(150); assert.equal(logs, count);
  } finally { controller.abort(); other.abort(); await Promise.all([owned.outcome, peer.outcome]); }
});

test('POSIX cancellation cleans descendants after their leader has exited', { timeout: 15000, skip: process.platform === 'win32' }, async () => {
  const controller = new AbortController(), owned = tree(controller.signal, undefined, ['--exit-leader']);
  try {
    await owned.entered; const leader = owned.pids.get(2); const deadline = Date.now() + 3000;
    while (await alive(leader)) { assert.ok(Date.now() < deadline); await pause(10); }
    assert.equal(await alive(owned.pids.get(0)), true); controller.abort();
    assert.equal((await owned.outcome).value.cancelled, true); await stopped([...owned.pids.values()]);
  } finally { controller.abort(); await owned.outcome; }
});

test('failed tree termination rejects promptly instead of hanging or claiming cancellation', { timeout: 15000 }, async () => {
  const controller = new AbortController(); let logs = 0;
  const owned = tree(controller.signal, () => { logs++; }); let restore = () => {};
  let timer;
  try {
    await owned.entered; const leader = owned.pids.get(2);
    restore = blockTermination(leader);
    controller.abort();
    const outcome = await Promise.race([owned.outcome, new Promise(resolve => { timer = setTimeout(() => resolve({ hung: true }), 1500); })]);
    assert.equal(outcome.hung, undefined, 'cleanup failure must settle instead of waiting forever');
    assert.equal(outcome.value, undefined); assert.equal(outcome.error.cleanupFailed, true); assert.match(String(outcome.error), /cleanup.*PID|PID.*cleanup/i);
    const count = logs; await pause(150); assert.equal(logs, count);
  } finally {
    clearTimeout(timer); restore();
    await cleanupTree([...owned.pids.values()], owned.pids.get(2));
    await owned.outcome; await stopped([...owned.pids.values()]);
  }
});

test('accepted termination without process exit hits the bounded cleanup deadline', { timeout: 15000 }, async () => {
  const controller = new AbortController(), owned = tree(controller.signal); let restore = () => {};
  try {
    await owned.entered; const leader = owned.pids.get(2);
    restore = blockTermination(leader, true);
    controller.abort(); const { error, value } = await owned.outcome;
    assert.equal(value, undefined); assert.equal(error.cleanupFailed, true); assert.match(error.message, /5000 ms/);
  } finally {
    restore(); await cleanupTree([...owned.pids.values()], owned.pids.get(2));
    await owned.outcome; await stopped([...owned.pids.values()]);
  }
});
