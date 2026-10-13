import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { build } from 'esbuild';
import { createProtocolConnection, StreamMessageReader, StreamMessageWriter, CancellationTokenSource } from 'vscode-languageserver/node.js';
import { root } from '../environment.mjs';
const pause = () => new Promise(resolve => setTimeout(resolve, 20));
async function until(check, message) {
  const deadline = performance.now() + 12000;
  while (performance.now() < deadline) { const value = await check(); if (value) return value; await pause(); }
  throw Error(message);
}
const alive = pid => { try { process.kill(pid, 0); return true; } catch (error) { if (error.code === 'ESRCH') return false; throw error; } };
export async function semanticBurst(before = false) {
  const python = process.env.RTL_SEMANTIC_PYTHON;
  assert.ok(python, 'Activate the verified semantic runtime; do not silently skip.');
  const directory = await fs.mkdtemp(path.join(root, '.dev/cloud-h7j-lsp-')), cache = path.join(directory, 'cache');
  const source = 'module top; logic local_signal; initial $display(loc); endmodule\n';
  const folders = [];
  for (let i = 0; i < 3; i++) {
    const folder = path.join(directory, `project-${i}`); await fs.mkdir(folder);
    await fs.writeFile(path.join(folder, 'rtl.toml'), 'version=1\n[project]\nname="burst"\n[sources]\nrtl=["*.sv"]\n');
    await fs.writeFile(path.join(folder, 'code.sv'), source);
    folders.push({ uri: pathToFileURL(folder).href, name: `project-${i}` });
  }
  const file = path.join(directory, 'project-0/code.sv'), uri = pathToFileURL(file).href;
  const bridge = path.join(directory, 'instrument.py'), realBridge = path.join(root, 'language/python/analyze.py');
  const recordDirectory = path.join(directory, 'starts'); await fs.mkdir(recordDirectory);
  // Windows text append from multiple Python processes can interleave/truncate
  // a shared JSONL record. Publish one uniquely named complete file per start.
  await fs.writeFile(bridge, `import os, sys, json, time, runpy\nbase = ${JSON.stringify(directory)}\nwith open(sys.argv[1], encoding='utf8') as f: data=json.load(f)\nkind='query' if data.get('query') else 'analysis'\nrecord={'pid':os.getpid(),'kind':kind,'sources':data['sources']}\nname=str(time.time_ns())+'-'+str(os.getpid())\nrecord_file=os.path.join(base,'starts',name+'.json')\nwith open(record_file+'.tmp','w',encoding='utf8') as f: json.dump(record,f)\nos.replace(record_file+'.tmp',record_file)\nwhile os.path.exists(os.path.join(base,kind+'.hold')): time.sleep(0.02)\nsys.argv[0]=${JSON.stringify(realBridge)}\nrunpy.run_path(sys.argv[0],run_name='__main__')\n`);
  const server = path.join(directory, 'server.cjs');
  const contents = await fs.readFile(before ? path.join(root, '.dev/cloud/h7j/server-before.ts') : path.join(root, 'language/src/server.ts'), 'utf8');
  await build({ stdin: { contents, loader: 'ts', resolveDir: path.join(root, 'language/src'), sourcefile: 'server.ts' }, outfile: server, bundle: true, platform: 'node', format: 'cjs' });
  await fs.writeFile(path.join(directory, 'analysis.hold'), 'owned diagnostic gate');
  await fs.writeFile(path.join(directory, 'query.hold'), 'owned diagnostic gate');
  const child = spawn(process.execPath, [server, '--stdio'], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
  const exit = once(child, 'exit'); let stderr = '';
  child.stderr.on('data', bytes => { stderr = (stderr + bytes).slice(-16000); });
  const connection = createProtocolConnection(new StreamMessageReader(child.stdout), new StreamMessageWriter(child.stdin));
  connection.onNotification('window/logMessage', () => {});
  connection.onNotification('window/showMessage', () => {});
  connection.onNotification('textDocument/publishDiagnostics', () => {});
  connection.listen();
  const starts = async () => Promise.all((await fs.readdir(recordDirectory)).filter(name => name.endsWith('.json')).sort().map(async name => JSON.parse(await fs.readFile(path.join(recordDirectory, name), 'utf8'))));
  const receipt = { directory, mode: before ? 'H7I before' : 'H7J after', scope: 'Real stdio LSP and pyslang bridge, 3 roots, 100 watch events, 20 identical concurrent completions; private process gates are not UI latency.', watchEvents: 100, completionRequests: 20 };
  try {
    await connection.sendRequest('initialize', { processId: process.pid, rootUri: folders[0].uri, workspaceFolders: folders, capabilities: { workspace: { workspaceFolders: true } }, initializationOptions: { python, bridge, cache } });
    await connection.sendNotification('initialized', {});
    await connection.sendNotification('textDocument/didOpen', { textDocument: { uri, languageId: 'systemverilog', version: 1, text: source } });
    for (let i = 0; i < 100; i++) await connection.sendNotification('workspace/didChangeWatchedFiles', { changes: [{ uri, type: 2 }] });
    const offset = source.indexOf('$display(loc') + '$display(loc'.length;
    const cancelled = new CancellationTokenSource();
    const requests = Array.from({ length: 20 }, (_, i) => {
      const params = { textDocument: { uri }, position: { line: 0, character: offset } };
      return i === 0 ? connection.sendRequest('textDocument/completion', params, cancelled.token) : connection.sendRequest('textDocument/completion', params);
    });
    // Attach handlers immediately, including if setup fails while requests wait.
    const results = Promise.all(requests); void results.catch(() => {});
    const initial = await until(async () => { const rows = await starts(); return rows.filter(row => row.kind === 'analysis').length >= (before ? 3 : 2) ? rows : undefined; }, 'Root analyses did not reach the private gate.');
    receipt.heldRootProcesses = initial.filter(row => alive(row.pid)).length;
    assert.equal(receipt.heldRootProcesses, before ? 3 : 2);
    await fs.unlink(path.join(directory, 'analysis.hold'));
    const queryRows = await until(async () => { const rows = await starts(); return rows.filter(row => row.kind === 'query').length >= (before ? 20 : 1) ? rows : undefined; }, 'Completion queries did not reach the private gate.');
    receipt.heldQueryProcesses = queryRows.filter(row => row.kind === 'query' && alive(row.pid)).length;
    cancelled.cancel();
    const released = performance.now(); await fs.unlink(path.join(directory, 'query.hold'));
    const completed = await results; cancelled.dispose();
    assert.deepEqual(completed[0], []);
    for (const result of completed.slice(1)) assert.ok(result.some(item => item.label === 'local_signal'), JSON.stringify(result) + stderr);
    receipt.queryReleaseToResultsMs = performance.now() - released;
    let rows = await starts(); receipt.initialAnalyses = rows.filter(row => row.kind === 'analysis').length;
    receipt.initialQueries = rows.filter(row => row.kind === 'query').length;
    assert.equal(receipt.initialAnalyses, 3);
    assert.equal(receipt.initialQueries, before ? 20 : 1);
    // A later request must analyze again; no persistent result cache.
    const fresh = await connection.sendRequest('textDocument/completion', { textDocument: { uri }, position: { line: 0, character: offset } });
    assert.ok(fresh.some(item => item.label === 'local_signal'));
    assert.equal((await starts()).filter(row => row.kind === 'query').length, receipt.initialQueries + 1);
    await fs.writeFile(path.join(directory, 'query.hold'), 'stale generation gate');
    const stale = connection.sendRequest('textDocument/completion', { textDocument: { uri }, position: { line: 0, character: offset } });
    void stale.catch(() => {});
    await until(async () => (await starts()).filter(row => row.kind === 'query').length >= receipt.initialQueries + 2, 'Stale query did not start.');
    const latest = source.replace('local_signal', 'local_latest');
    await connection.sendNotification('textDocument/didChange', { textDocument: { uri, version: 2 }, contentChanges: [{ text: latest }] });
    const current = connection.sendRequest('textDocument/completion', { textDocument: { uri }, position: { line: 0, character: latest.indexOf('$display(loc') + '$display(loc'.length } });
    void current.catch(() => {});
    await until(async () => (await starts()).filter(row => row.kind === 'query').length >= receipt.initialQueries + 3, 'Fresh query did not start after cancellation.');
    assert.deepEqual(await stale, []); receipt.staleRejected = true;
    await fs.unlink(path.join(directory, 'query.hold'));
    const updated = await current;
    assert.ok(updated.some(item => item.label === 'local_latest')); assert.ok(!updated.some(item => item.label === 'local_signal'));
    assert.equal(await fs.readFile(file, 'utf8'), source);
    // Remove/re-add the same root while work is held, then shut down. Every
    // created provider process must be gone when shutdown acknowledges.
    await fs.writeFile(path.join(directory, 'analysis.hold'), 'shutdown gate');
    const count = (await starts()).length;
    await connection.sendNotification('workspace/didChangeWatchedFiles', { changes: [{ uri, type: 2 }] });
    await until(async () => (await starts()).length > count, 'Shutdown analysis did not start.');
    await connection.sendNotification('workspace/didChangeWorkspaceFolders', { event: { removed: [folders[0]], added: [folders[0]] } });
    await connection.sendRequest('shutdown');
    rows = await starts(); receipt.startedProcesses = rows.length;
    receipt.liveAfterShutdown = rows.filter(row => alive(row.pid)).map(row => row.pid);
    if (!before) assert.deepEqual(receipt.liveAfterShutdown, []);
    receipt.cacheEntriesAtShutdown = (await fs.readdir(cache)).filter(name => /^(analysis|dependencies)-/.test(name));
    if (!before) assert.deepEqual(receipt.cacheEntriesAtShutdown, []);
    await connection.sendNotification('exit'); await exit;
    receipt.serverExit = child.exitCode; assert.equal(child.exitCode, 0, stderr);
    receipt.passed = !receipt.liveAfterShutdown.length && !receipt.cacheEntriesAtShutdown.length;
    await fs.writeFile(path.join(directory, 'receipt.json'), JSON.stringify(receipt, null, 2));
    return receipt;
  } finally {
    for (const name of ['analysis.hold', 'query.hold']) await fs.unlink(path.join(directory, name)).catch(error => { if (error.code !== 'ENOENT') throw error; });
    if (child.exitCode === null) {
      let timer;
      try { await Promise.race([connection.sendRequest('shutdown'), new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Diagnostic shutdown timed out')), 6000); })]); }
      catch { /* Keep the server alive long enough to reap its owned bridge children. */ }
      finally { clearTimeout(timer); }
      const rows = await starts();
      for (const row of rows) if (alive(row.pid)) { try { process.kill(row.pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; } }
      await until(() => rows.every(row => !alive(row.pid)), 'Diagnostic bridge children were not reaped.');
      child.kill(); await exit;
    }
    connection.dispose();
  }
}
