import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { createProtocolConnection, StreamMessageReader, StreamMessageWriter } from 'vscode-languageserver/node.js';

const python = process.env.RTL_SEMANTIC_PYTHON ?? path.join(os.homedir(), '.rtl-dev/tools/slang-11.0.0-python-3.14.7/python.exe');
assert.ok(fs.existsSync(python), 'Semantic regression requires verified existing runtime; do not silently skip.');
process.env.RTL_SEMANTIC_PYTHON = python;
await build({ entryPoints: ['language/semantic-ported.test.ts'], outfile: '.dev/semantic-tests.cjs', bundle: true, platform: 'node', format: 'cjs' });
createRequire(import.meta.url)('../.dev/semantic-tests.cjs');

test('actual language server: unsaved module/ports/scope/signature/diagnostics and TOML exclusion', { timeout: 60000 }, async t => {
  const root = fs.mkdtempSync(path.resolve('.dev/semantic-lsp-'));
  const file = path.join(root, '코드 공백.sv');
  const manifest = path.join(root, 'rtl.toml');
  fs.writeFileSync(manifest, 'version=1\n[project]\nname="lsp"\n[sources]\nrtl=["*.sv"]\n');
  const prefix = 'module alu(input logic a, input logic b, output logic y); assign y=a&b; endmodule\nmodule top; logic local_signal; function int add(input int foo, input string boo); return foo; endfunction\n';
  const source = prefix + 'alu u(.a(local_signal), .b(local_signal), .y()); endmodule\n';
  fs.writeFileSync(file, source);
  await build({ entryPoints: ['language/src/server.ts'], outfile: path.join(root, 'server.cjs'), bundle: true, platform: 'node', format: 'cjs' });
  const child = spawn(process.execPath, [path.join(root, 'server.cjs'), '--stdio'], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
  let stderr = ''; child.stderr.on('data', b => { stderr += b; });
  const connection = createProtocolConnection(new StreamMessageReader(child.stdout), new StreamMessageWriter(child.stdin));
  let diagnostics = [];
  connection.onNotification('textDocument/publishDiagnostics', params => { diagnostics.push(params); });
  connection.onNotification('window/logMessage', () => {});
  connection.onNotification('window/showMessage', () => {});
  connection.listen();
  t.after(async () => {
    connection.dispose(); child.kill();
    await new Promise(resolve => child.exitCode !== null ? resolve() : child.once('exit', resolve));
  });
  const uri = pathToFileURL(file).href, folderUri = pathToFileURL(root).href;
  await connection.sendRequest('initialize', { processId: process.pid, rootUri: folderUri,
    workspaceFolders: [{ uri: folderUri, name: 'probe' }], capabilities: {},
    initializationOptions: { python, bridge: path.resolve('language/python/analyze.py'), cache: path.join(root, '.rtl/cache') } });
  await connection.sendNotification('initialized', {});
  let version = 0;
  const update = async text => {
    version++;
    if (version === 1) await connection.sendNotification('textDocument/didOpen', { textDocument: { uri, languageId: 'systemverilog', version, text } });
    else await connection.sendNotification('textDocument/didChange', { textDocument: { uri, version }, contentChanges: [{ text }] });
  };
  const position = text => { const lines = text.split('\n'); return { line: lines.length - 1, character: lines.at(-1).length }; };
  const complete = async text => {
    await update(text + ' endmodule\n');
    return await connection.sendRequest('textDocument/completion', { textDocument: { uri }, position: position(text) });
  };
  let result = await complete(prefix + 'alu u(.a(local_signal), .');
  assert.ok(result.some(i => i.label === 'b'), JSON.stringify(result) + stderr);
  assert.ok(!result.some(i => i.label === 'a'));
  result = await complete(prefix + 'initial $display(loc');
  assert.ok(result.some(i => i.label === 'local_signal'));
  assert.ok(!result.some(i => i.label === 'a' || i.label === 'foo'));
  result = await complete(prefix + 'al');
  assert.ok(result.some(i => i.label === 'alu'));
  const call = prefix + 'initial $display(add(1, ';
  await update(call + '"x")); endmodule\n');
  const help = await connection.sendRequest('textDocument/signatureHelp', { textDocument: { uri }, position: position(call) });
  assert.ok(help.signatures[0].label.includes('boo'));
  assert.equal(help.activeParameter, 1);
  await update(source);
  const tokens = await connection.sendRequest('textDocument/semanticTokens/full', { textDocument: { uri } });
  assert.ok(tokens.data.length >= 10, 'module declarations and instance types have semantic tokens');
  const instanceOffset = source.indexOf('alu u');
  const instancePosition = position(source.slice(0, instanceOffset + 1));
  const definition = await connection.sendRequest('textDocument/definition', { textDocument: { uri }, position: instancePosition });
  assert.equal(definition.uri, uri);
  assert.equal(definition.range.start.line, 0);
  await update(prefix + 'logic broken = undeclared_signal; endmodule\n');
  await connection.sendRequest('textDocument/completion', { textDocument: { uri }, position: { line: 2, character: 1 } });
  assert.ok(diagnostics.some(d => d.uri === uri && d.version === version && d.diagnostics.some(e => e.severity === 1)), JSON.stringify(diagnostics));
  const tomlUri = pathToFileURL(manifest).href;
  await connection.sendNotification('textDocument/didOpen', { textDocument: { uri: tomlUri, languageId: 'toml', version: 1, text: 'not RTL' } });
  assert.deepEqual(await connection.sendRequest('textDocument/completion', { textDocument: { uri: tomlUri }, position: { line: 0, character: 7 } }), []);
  fs.writeFileSync(manifest, 'broken = [');
  await connection.sendNotification('workspace/didChangeWatchedFiles', { changes: [{ uri: tomlUri, type: 2 }] });
  await connection.sendRequest('textDocument/completion', { textDocument: { uri }, position: { line: 2, character: 1 } });
  const status = await connection.sendRequest('rtl/languageStatus', { uri });
  assert.equal(status.label, 'Analysis failed');
  assert.ok(!diagnostics.some(d => d.uri === tomlUri));
  assert.equal(fs.readFileSync(file, 'utf8'), source, 'unsaved overlays never modify sources');
  await connection.sendRequest('shutdown'); await connection.sendNotification('exit');
});

test('semantic lexer matches the owned lexical engine without sibling source dependencies', () => {
  assert.equal(fs.readFileSync('runtime/semantic/lexical.ts', 'utf8'), fs.readFileSync('language/src/lexical.ts', 'utf8'));
});

test('manifest source globs refuse excessive nesting before invoking the glob parser', async () => {
  const { discover } = createRequire(import.meta.url)('../dist/runtime/core/config.js');
  await assert.rejects(discover(process.cwd(), ['{'.repeat(1000) + 'x' + '}'.repeat(1000)]), /nesting is too complex/);
  await assert.rejects(discover(process.cwd(), ['x'.repeat(4097)]), /4096 characters/);
  assert.ok((await discover(process.cwd(), ['language/src/*.{ts,sv}'])).some(p => p.endsWith('extension.ts')));
});
