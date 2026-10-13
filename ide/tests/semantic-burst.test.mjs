import test from 'node:test';
import { semanticBurst } from '../scripts/helpers/semantic-burst.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createProtocolConnection, StreamMessageReader, StreamMessageWriter } from 'vscode-languageserver/node.js';
import { root } from '../scripts/environment.mjs';
test('real language-server event burst bounds roots, shares concurrent queries, refreshes overlays and joins shutdown', { timeout: 60000 }, async () => {
  await semanticBurst();
});
test('real LSP retries a temporarily full analysis queue on demand without an idle retry loop', { timeout: 45000 }, async t => {
  const directory = await fs.mkdtemp(path.join(root, '.dev/semantic-capacity-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const folders = [], source = 'module top; endmodule\n', gate = path.join(directory, 'hold');
  for (let i = 0; i < 2; i++) {
    const folder = path.join(directory, `project-${i}`); await fs.mkdir(folder);
    await fs.writeFile(path.join(folder, 'rtl.toml'), 'version=1\n[project]\nname="capacity"\n[sources]\nrtl=["*.sv"]\n');
    await fs.writeFile(path.join(folder, 'code.sv'), source);
    folders.push({ uri: pathToFileURL(folder).href, name: `project-${i}` });
  }
  const bridge = path.join(directory, 'bridge.py');
  await fs.writeFile(gate, 'owned gate');
  await fs.writeFile(bridge, `import os,sys,time,runpy\nwhile os.path.exists(${JSON.stringify(gate)}): time.sleep(0.02)\nsys.argv[0]=${JSON.stringify(path.join(root,'language/python/analyze.py'))}\nrunpy.run_path(sys.argv[0],run_name='__main__')\n`);
  let contents = await fs.readFile(path.join(root, 'language/src/server.ts'), 'utf8');
  assert.ok(contents.includes('const work = new SemanticWork();'));
  // Reduce capacity only in this private bundle to deterministically exercise
  // overload with two roots. Production stays at two active / 32 queued jobs.
  contents = contents.replace('const work = new SemanticWork();', 'const work = new SemanticWork(1, 0);');
  const server = path.join(directory, 'server.cjs');
  await build({ stdin: { contents, loader: 'ts', resolveDir: path.join(root, 'language/src') }, outfile: server, bundle: true, platform: 'node', format: 'cjs' });
  assert.ok(process.env.RTL_SEMANTIC_PYTHON, 'Activate the verified semantic runtime.');
  const child = spawn(process.execPath, [server, '--stdio'], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true }), exit = once(child, 'exit');
  child.stderr.on('data', () => {});
  const connection = createProtocolConnection(new StreamMessageReader(child.stdout), new StreamMessageWriter(child.stdin));
  connection.onNotification('window/logMessage', () => {}); connection.onNotification('textDocument/publishDiagnostics', () => {}); connection.listen();
  t.after(async () => {
    await fs.unlink(gate).catch(error => { if (error.code !== 'ENOENT') throw error; });
    if (child.exitCode === null) { await connection.sendRequest('shutdown'); await connection.sendNotification('exit'); await exit; }
    connection.dispose();
  });
  await connection.sendRequest('initialize', { processId: process.pid, workspaceFolders: folders, capabilities: {}, initializationOptions: { python: process.env.RTL_SEMANTIC_PYTHON, bridge, cache: path.join(directory, 'cache') } });
  await connection.sendNotification('initialized', {});
  const uris = folders.map(folder => folder.uri + '/code.sv');
  for (const uri of uris) await connection.sendNotification('textDocument/didOpen', { textDocument: { uri, languageId: 'systemverilog', version: 1, text: source } });
  const active = connection.sendRequest('textDocument/semanticTokens/full', { textDocument: { uri: uris[0] } }); void active.catch(() => {});
  const status = () => connection.sendRequest('rtl/languageStatus', { uri: uris[1] });
  const deadline = Date.now() + 10000;
  while ((await status()).label !== 'Analysis busy' && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal((await status()).label, 'Analysis busy');
  assert.deepEqual((await connection.sendRequest('textDocument/semanticTokens/full', { textDocument: { uri: uris[1] } })).data, []);
  await fs.unlink(gate); assert.ok((await active).data.length);
  const recovered = await connection.sendRequest('textDocument/semanticTokens/full', { textDocument: { uri: uris[1] } });
  assert.ok(recovered.data.length, 'the same saved document must recover without another edit');
  assert.equal((await status()).label, 'Ready');
});
