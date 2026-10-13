import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createProtocolConnection, IPCMessageReader, IPCMessageWriter } from 'vscode-languageserver/node.js';
import { root } from '../scripts/environment.mjs';
await build({ entryPoints: ['language/src/semantic-process.ts'], outfile: '.dev/semantic-process.cjs', bundle: true, platform: 'node', format: 'cjs' });
const require = createRequire(import.meta.url), { SemanticProcess, deadline, LanguageCleanupFailure } = require('../.dev/semantic-process.cjs');
const { detectSemanticRuntime } = require('../dist/runtime/semantic-runtime.js');
const wait = async condition => {
  const until = Date.now() + 10000;
  while (Date.now() < until) { if (await condition()) return; await new Promise(resolve => setTimeout(resolve, 20)); }
  throw Error('Semantic process did not reach the diagnostic boundary.');
};
test('real runtime probe and owned IPC process drain Python work, preserve included generated headers and join exit', { timeout: 45000 }, async t => {
  const python = await detectSemanticRuntime(); assert.ok(python, 'Existing verified runtime required; no silent skip.');
  const directory = await fs.mkdtemp(path.join(root, '.dev/semantic-ipc-')), cache = path.join(directory, 'cache'), gate = path.join(directory, 'hold');
  await fs.mkdir(path.join(directory, '.rtl'));
  const source = '`include ".rtl/defs.vh"\nmodule top(input logic [`WIDTH-1:0] a); endmodule\n';
  await fs.writeFile(path.join(directory, 'code.sv'), source); await fs.writeFile(path.join(directory, '.rtl/defs.vh'), '`define WIDTH 4\n');
  await fs.writeFile(path.join(directory, 'rtl.toml'), 'version=1\n[project]\nname="ipc"\n[sources]\nrtl=["*.sv"]\n');
  const bridge = path.join(directory, 'bridge.py');
  await fs.writeFile(bridge, `import os,sys,time,runpy\nwith open(${JSON.stringify(path.join(directory,'pids.txt'))},'a') as f: f.write(str(os.getpid())+'\\n')\nwhile os.path.exists(${JSON.stringify(gate)}): time.sleep(0.02)\nsys.argv[0]=${JSON.stringify(path.join(root,'language/python/analyze.py'))}\nrunpy.run_path(sys.argv[0],run_name='__main__')\n`);
  const server = path.join(directory, 'server.cjs'); await build({ entryPoints: ['language/src/server.ts'], outfile: server, bundle: true, platform: 'node', format: 'cjs' });
  const unexpected = [], process = new SemanticProcess(server, () => {}, error => unexpected.push(error));
  const connection = createProtocolConnection(new IPCMessageReader(process.child), new IPCMessageWriter(process.child));
  connection.onNotification('window/logMessage', () => {}); connection.onNotification('textDocument/publishDiagnostics', () => {}); connection.listen();
  t.after(async () => {
    try {
      if (process.child.exitCode === null) {
        const ready = await deadline(connection.sendRequest('rtl/prepareShutdown'), 10000, 'Test drain not confirmed'); assert.equal(ready.ready, true);
        process.expectedClose = true; await connection.sendRequest('shutdown'); await connection.sendNotification('exit'); await process.closed;
      }
    } finally { connection.dispose(); await fs.rm(directory, { recursive: true, force: true }); }
  });
  const uri = pathToFileURL(path.join(directory, 'code.sv')).href, folder = pathToFileURL(directory).href;
  await connection.sendRequest('initialize', { processId: globalThis.process.pid, workspaceFolders: [{ uri: folder, name: 'ipc' }], capabilities: {}, initializationOptions: { python, bridge, cache } }); await connection.sendNotification('initialized', {});
  await connection.sendNotification('textDocument/didOpen', { textDocument: { uri, languageId: 'systemverilog', version: 1, text: source } });
  const hover = () => connection.sendRequest('textDocument/hover', { textDocument: { uri }, position: { line: 1, character: 8 } });
  assert.match(JSON.stringify(await hover()), /3:0/);
  const pids = async () => (await fs.readFile(path.join(directory, 'pids.txt'), 'utf8')).trim().split('\n').map(Number);
  const before = (await pids()).length;
  for (let i = 0; i < 20; i++) await connection.sendRequest('rtl/languageStatus', { uri }); assert.equal((await pids()).length, before);
  // H7L: compiler-confirmed generated headers still invalidate, unrelated
  // generated RTL notifications no longer start another Python compilation.
  for (let i = 0; i < 100; i++) await connection.sendNotification('workspace/didChangeWatchedFiles', { changes: [{ uri: pathToFileURL(path.join(directory, `.rtl/unused-${i}.sv`)).href, type: 2 }] });
  assert.match(JSON.stringify(await hover()), /3:0/); assert.equal((await pids()).length, before);
  await fs.writeFile(path.join(directory, '.rtl/defs.vh'), '`define WIDTH 8\n');
  await connection.sendNotification('workspace/didChangeWatchedFiles', { changes: [{ uri: pathToFileURL(path.join(directory, '.rtl/defs.vh')).href, type: 2 }] }); assert.match(JSON.stringify(await hover()), /7:0/);
  await fs.writeFile(gate, 'owned hold'); const count = (await pids()).length;
  await connection.sendNotification('workspace/didChangeWatchedFiles', { changes: [{ uri, type: 2 }] });
  const pending = hover(); void pending.catch(() => {}); await wait(async () => (await pids()).length > count);
  assert.deepEqual(await connection.sendRequest('rtl/prepareShutdown'), { ready: true }); await pending;
  assert.deepEqual((await fs.readdir(cache)).filter(name => name.startsWith('analysis-')), []);
  for (const pid of await pids()) assert.throws(() => globalThis.process.kill(pid, 0), { code: 'ESRCH' });
  await connection.sendNotification('workspace/didChangeWatchedFiles', { changes: [{ uri, type: 2 }] }); await hover(); assert.equal((await pids()).length, count + 1);
  process.expectedClose = true; await connection.sendRequest('shutdown'); await connection.sendNotification('exit'); await deadline(process.closed, 5000, 'Test process exit not confirmed');
  assert.equal(process.child.exitCode, 0); assert.deepEqual(unexpected, []);
  assert.equal(await fs.readFile(path.join(directory, 'code.sv'), 'utf8'), source);
  await fs.writeFile(path.join(root, '.dev/cloud/h7l-ipc.json'), JSON.stringify({ scope: 'Real owned IPC transport, actual runtime probe/Python/slang; one project, included .rtl header, controlled held Python work; private fixture removed after test.', initialAnalyses: before, readOnlyStatusRequests: 20, extraStatusAnalyses: 0, generatedNotifications: 100, extraGeneratedAnalyses: 0, includedHeaderRanges: ['3:0', '7:0'], pythonProcesses: (await pids()).length, livePythonAfterDrain: 0, cacheEntriesAfterDrain: 0, extraAnalysesAfterDrain: 0, parentExit: process.child.exitCode, sourcePreserved: true }, null, 2));
});
test('unexpected owned process exit and deadlines are explicit cleanup failures', async t => {
  const directory = await fs.mkdtemp(path.join(root, '.dev/semantic-exit-')); t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'exit.cjs'); await fs.writeFile(file, 'process.exit(3);\n');
  const errors = [], child = new SemanticProcess(file, () => {}, error => errors.push(error));
  await assert.rejects(child.closed, error => error instanceof LanguageCleanupFailure); assert.equal(errors.length, 1);
  await assert.rejects(deadline(new Promise(() => {}), 20, 'unconfirmed'), error => error.cleanupFailed && /unconfirmed/.test(error.message));
});
