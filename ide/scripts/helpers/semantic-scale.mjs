import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createProtocolConnection, IPCMessageReader, IPCMessageWriter } from 'vscode-languageserver/node.js';
import { root } from '../environment.mjs';
const pause = () => new Promise(resolve => setTimeout(resolve, 20));
export async function semanticScale({ before = false, filesPerRoot = 300 } = {}) {
  const python = process.env.RTL_SEMANTIC_PYTHON;
  assert.ok(python, 'Activate the verified semantic runtime; no silent skip.');
  const directory = await fs.mkdtemp(path.join(root, '.dev/semantic-scale-')), cache = path.join(directory, 'cache'), shared = path.join(directory, 'shared');
  await fs.mkdir(shared); const header = path.join(shared, 'defs.vh'); await fs.writeFile(header, '`define WIDTH 4\n');
  const folders = [], files = [], texts = [], versions = [1, 1, 1], originals = new Map();
  for (let project = 0; project < 3; project++) {
    const folder = path.join(directory, `project-${project}`); await fs.mkdir(folder);
    for (let i = 0; i < filesPerRoot; i++) {
      const parent = path.join(folder, 'rtl', `group-${String(i).padStart(3, '0')}`); await fs.mkdir(parent, { recursive: true });
      const file = path.join(parent, 'code.sv'), text = `module ${i ? 'leaf_' + i : 'top'}(input logic [3:0] a); endmodule\n`;
      await fs.writeFile(file, text); originals.set(file, text); if (!i) { files.push(file); texts.push(text); }
    }
    await fs.writeFile(path.join(folder, 'rtl.toml'), 'version=1\n[project]\nname="scale"\n[sources]\nrtl=["rtl/**/*.sv"]\ninclude_dirs=["../shared"]\n');
    folders.push({ uri: pathToFileURL(folder).href, name: `project-${project}` });
  }
  const startsFile = path.join(directory, 'starts.jsonl'), loadsFile = path.join(directory, 'loads.jsonl'), bridge = path.join(directory, 'bridge.py');
  await fs.writeFile(bridge, `import os,sys,json,time,runpy\nwith open(sys.argv[1]) as f: data=json.load(f)\nrow={'pid':os.getpid(),'root':os.getcwd(),'kind':'query' if data.get('query') else 'analysis','sources':len(data['sources'])}\nwith open(${JSON.stringify(startsFile)},'a') as f: f.write(json.dumps(row)+'\\n')\nstarted=time.perf_counter()\ncpu_started=time.process_time()\nsys.argv[0]=${JSON.stringify(path.join(root, 'language/python/analyze.py'))}\nrunpy.run_path(sys.argv[0],run_name='__main__')\nwith open(sys.argv[2]) as f: result=json.load(f)\nrow.update(end=True,elapsedMs=(time.perf_counter()-started)*1000,cpuMs=(time.process_time()-cpu_started)*1000,hasAdded=any(m['name']=='added' for m in result['modules']))\nwith open(${JSON.stringify(startsFile)},'a') as f: f.write(json.dumps(row)+'\\n')\n`);
  const entry = before ? path.join(root, '.dev/cloud/h7m/server-before.ts') : path.join(root, 'language/src/server.ts');
  const server = path.join(directory, 'server.cjs');
  await build({ stdin: { contents: await fs.readFile(entry, 'utf8'), loader: 'ts', resolveDir: path.join(root, 'language/src'), sourcefile: 'server.ts' }, outfile: server, bundle: true, platform: 'node', format: 'cjs', plugins: [{ name: 'private-scale-accounting', setup(builder) {
    builder.onResolve({ filter: /^\.\.\/\.\.\/runtime\/core\/index$/ }, () => ({ path: 'core', namespace: 'accounting' }));
    builder.onLoad({ filter: /.*/, namespace: 'accounting' }, () => ({ contents: `export * from ${JSON.stringify(path.join(root,'runtime/core/index.ts'))}; import {loadProject as realLoad} from ${JSON.stringify(path.join(root,'runtime/core/index.ts'))}; import {appendFile} from 'node:fs/promises'; export async function loadProject(...args){const started=performance.now();try{return await realLoad(...args);}finally{await appendFile(${JSON.stringify(loadsFile)},JSON.stringify({root:args[0],elapsedMs:performance.now()-started})+'\\n');}}`, loader: 'ts', resolveDir: root }));
    if (before) {
      builder.onResolve({ filter: /^\.\/input-events$/ }, () => ({ path: 'events', namespace: 'baseline' }));
      builder.onLoad({ filter: /.*/, namespace: 'baseline' }, async () => ({ contents: await fs.readFile(path.join(root, '.dev/cloud/h7m/input-events-before.ts'), 'utf8'), loader: 'ts', resolveDir: path.join(root, 'language/src') }));
    }
  } }] });
  const child = fork(server, ['--node-ipc', `--clientProcessId=${process.pid}`], { silent: true, execArgv: [] }), exited = once(child, 'close');
  let stderr = ''; child.stderr.on('data', bytes => { stderr = (stderr + bytes).slice(-16000); });
  const connection = createProtocolConnection(new IPCMessageReader(child), new IPCMessageWriter(child));
  const registrations = new Map(), logs = [], watcherStats = { registrations: 0, unregistrations: 0, peakPatterns: 0, peakOwned: 0 };
  connection.onNotification('window/logMessage', entry => logs.push(entry.message)); connection.onNotification('textDocument/publishDiagnostics', () => {});
  connection.onRequest('client/registerCapability', params => {
    for (const registration of params.registrations) { registrations.set(registration.id, registration); watcherStats.registrations++; watcherStats.peakPatterns = Math.max(watcherStats.peakPatterns, registration.registerOptions.watchers.length); }
    watcherStats.peakOwned = Math.max(watcherStats.peakOwned, registrations.size); return null;
  });
  connection.onRequest('client/unregisterCapability', params => { for (const registration of params.unregisterations) { assert.equal(registrations.delete(registration.id), true); watcherStats.unregistrations++; } return null; });
  connection.listen();
  const jsonLines = file => fs.readFile(file, 'utf8').then(text => text.trim().split('\n').filter(Boolean).map(JSON.parse)).catch(error => { if (error.code === 'ENOENT') return []; throw error; });
  const rows = () => jsonLines(startsFile), loads = () => jsonLines(loadsFile), uris = files.map(file => pathToFileURL(file).href);
  const status = uri => connection.sendRequest('rtl/languageStatus', { uri });
  const settle = async () => {
    const until = Date.now() + 20000;
    while (Date.now() < until) { const values = await Promise.all(uris.map(status)); if (values.every(value => value.label === 'Ready')) return; await pause(); }
    throw Error(`Scale roots did not become Ready: ${JSON.stringify(await Promise.all(uris.map(status)))}; ${logs.join('\n')}; ${stderr}`);
  };
  const hover = index => connection.sendRequest('textDocument/hover', { textDocument: { uri: uris[index] }, position: { line: texts[index].split('\n').findIndex(line => line.startsWith('module')), character: 8 } });
  const notify = file => connection.sendNotification('workspace/didChangeWatchedFiles', { changes: [{ uri: pathToFileURL(file).href, type: 2 }] });
  const edit = async (index, text) => { texts[index] = text; await connection.sendNotification('textDocument/didChange', { textDocument: { uri: uris[index], version: ++versions[index] }, contentChanges: [{ text }] }); };
  const receipt = { scope: 'Actual IPC/Python/slang with 3 roots, 300 RTL files/root in separate directories (900 total). RPC client delivers controlled notifications, not native filesystem/UI latency. Core load time is privately instrumented; same current Core in both modes.', mode: before ? 'H7L baseline' : 'H7M', filesPerRoot, phases: [] };
  const digest = async file => createHash('sha256').update(await fs.readFile(file)).digest('hex');
  receipt.sources = { server: await digest(entry), events: await digest(path.join(root, before ? '.dev/cloud/h7m/input-events-before.ts' : 'language/src/input-events.ts')), core: await digest(path.join(root,'runtime/core/config.ts')), helper: await digest(path.join(root,'scripts/helpers/semantic-scale.mjs')) };
  const phase = async (name, operation, widths) => {
    const previous = (await rows()).filter(row => !row.end).length, previousLoads = (await loads()).length, started = performance.now();
    await operation(); await settle();
    for (let i = 0; i < 3; i++) assert.match(JSON.stringify(await hover(i)), new RegExp(widths[i] + ':0'));
    const current = (await rows()).filter(row => !row.end).slice(previous), currentLoads = (await loads()).slice(previousLoads);
    receipt.phases.push({ name, compilations: current.length, byRoot: [0,1,2].map(i => current.filter(row => row.root === path.join(directory, `project-${i}`)).length), loads: currentLoads.length, coreLoadMs: currentLoads.reduce((sum,row) => sum+row.elapsedMs,0), settleMs: performance.now()-started });
  };
  const stop = async () => {
    if (child.exitCode !== null) return;
    assert.deepEqual(await connection.sendRequest('rtl/prepareShutdown'), { ready: true }); assert.equal(registrations.size, 0);
    await connection.sendRequest('shutdown'); await connection.sendNotification('exit'); await exited; assert.equal(child.exitCode, 0, stderr);
  };
  try {
    await phase('startup', async () => {
      await connection.sendRequest('initialize', { processId: process.pid, workspaceFolders: folders, capabilities: { workspace: { workspaceFolders: true, didChangeWatchedFiles: { dynamicRegistration: true, relativePatternSupport: true } } }, initializationOptions: { python, bridge, cache } });
      await connection.sendNotification('initialized', {});
      for (let i = 0; i < 3; i++) await connection.sendNotification('textDocument/didOpen', { textDocument: { uri: uris[i], languageId: 'systemverilog', version: 1, text: texts[i] } });
    }, [3,3,3]);
    receipt.startupWatches = { ...watcherStats, activePatterns: [...registrations.values()].reduce((count,value) => count+value.registerOptions.watchers.length,0) };
    await phase('local unsaved edit', () => edit(0, texts[0].replace('[3:0]', '[7:0]')), [7,3,3]);
    await phase('100 local source notifications', async () => { for (let i=0;i<100;i++) await notify(path.join(directory,'project-0/rtl',`group-${String(i).padStart(3,'0')}`,'code.sv')); }, [7,3,3]);
    await phase('unconfigured RTL notification', async () => { const file=path.join(directory,'project-2/notes/unlisted.sv'); await fs.mkdir(path.dirname(file)); await fs.writeFile(file,'module unlisted; endmodule\n'); await notify(file); }, [7,3,3]);
    await phase('new nested glob member', async () => { const file=path.join(directory,'project-0/rtl/new/nested/added.sv'); await fs.mkdir(path.dirname(file),{recursive:true}); await fs.writeFile(file,'module added; endmodule\n'); await notify(file); }, [7,3,3]);
    assert.ok((await rows()).some(row=>row.end&&row.root===path.join(directory,'project-0')&&row.hasAdded));
    await phase('two roots add shared include', async () => { for(const i of [0,1]) await edit(i,'`include "defs.vh"\nmodule top(input logic [`WIDTH-1:0] a); endmodule\n'); }, [3,3,3]);
    await phase('shared header change', async () => { await fs.writeFile(header,'`define WIDTH 16\n'); await notify(header); }, [15,15,3]);
    await phase('100 generated notifications', async () => { for(let i=0;i<100;i++)await notify(path.join(directory,`project-0/.rtl/unused-${i}.sv`)); }, [15,15,3]);
    await phase('20 readonly status requests', async () => { for(let i=0;i<20;i++)await status(uris[0]); }, [15,15,3]);
    if (!before) {
      for(const name of ['local unsaved edit','100 local source notifications','new nested glob member']) assert.deepEqual(receipt.phases.find(p=>p.name===name).byRoot,[1,0,0],name);
      for(const name of ['unconfigured RTL notification','100 generated notifications','20 readonly status requests']) assert.equal(receipt.phases.find(p=>p.name===name).compilations,0,name);
      assert.deepEqual(receipt.phases.find(p=>p.name==='shared header change').byRoot,[1,1,0]);
      assert.equal(receipt.phases.find(p=>p.name==='startup').compilations,3);
      assert.equal(receipt.startupWatches.activePatterns,0); assert.equal(receipt.startupWatches.peakPatterns,4);
    }
    for (const [file, text] of originals) assert.equal(await fs.readFile(file,'utf8'),text,'Unsaved buffers must not write source originals');
    const completed = (await rows()).filter(row=>row.end); receipt.pythonCpuMs = completed.reduce((sum,row)=>sum+row.cpuMs,0);
    receipt.watches = watcherStats; await stop();
    const started = (await rows()).filter(row=>!row.end); for(const row of started)assert.throws(()=>process.kill(row.pid,0),{code:'ESRCH'});
    receipt.livePythonAfterDrain=0;receipt.activeRegistrationsAfterDrain=registrations.size;
    receipt.tempEntriesAfterDrain=(await fs.readdir(cache)).filter(name=>/^(analysis|dependencies)-/.test(name));assert.deepEqual(receipt.tempEntriesAfterDrain,[]);
    receipt.parentExit=child.exitCode;receipt.originalSourcesPreserved=true;return receipt;
  } finally {
    try { await stop(); } finally { connection.dispose(); await fs.rm(directory,{recursive:true,force:true}); }
  }
}
