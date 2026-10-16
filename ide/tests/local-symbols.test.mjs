import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildSync } from 'esbuild';
import Module from 'node:module';
const bundle = buildSync({ entryPoints: [path.resolve('language/src/local-symbols.ts')], bundle: true, write: false, platform: 'node', format: 'cjs' });
const module = new Module('local-symbols'); module._compile(bundle.outputFiles[0].text, 'local-symbols.cjs');
const { localSignals, moduleSnippet, portSnippet } = module.exports;
test('edited signals are visible only in their module and enclosing block/function', () => {
 const text='module a(input wire clk, output logic done); wire [7:0] data, other; function f; reg hidden; hidden=0; endfunction initial begin logic inner; inner=1; end endmodule module b; logic peer; endmodule';
 assert.deepEqual(localSignals(text,text.indexOf('inner=1')).sort(),['clk','done','data','other','inner'].sort());
 assert.ok(localSignals(text,text.indexOf('hidden=0')).includes('hidden'));
 assert.deepEqual(localSignals(text,text.indexOf('logic peer')+11),['peer']);
 const comments='module a; // wire fake\n logic yes; initial $display("wire bad"); endmodule';
 assert.deepEqual(localSignals(comments,comments.indexOf('wire fake')+4),[]);
 assert.deepEqual(localSignals(comments,comments.indexOf('wire bad')+4),[]);
});
test('module/port snippets preserve existing connection parentheses and escape identifiers', () => {
 assert.equal(moduleSnippet('alu'),'alu ${1} (${2});$0');
 assert.equal(portSnippet('clk',' '),'clk(${1})$0'); assert.equal(portSnippet('clk',' (clock)'),'clk');
 assert.ok(moduleSnippet('alu$2').startsWith('alu\\$2 '));
});
test('RTL defaults disable irrelevant color/Emmet and word-based guesses', () => {
 const config=JSON.parse(fs.readFileSync('language/package.json','utf8')).contributes.configurationDefaults;
 assert.ok(config['emmet.excludeLanguages'].includes('verilog'));assert.ok(config['emmet.excludeLanguages'].includes('systemverilog'));
 assert.equal(config['[verilog]']['editor.colorDecorators'],false);
 for(const language of ['verilog','systemverilog']) {
  assert.deepEqual(config[`[${language}]`]['editor.quickSuggestions'],{other:'on',comments:'off',strings:'off'});
  assert.equal(config[`[${language}]`]['editor.suggestOnTriggerCharacters'],true);
  assert.equal(config[`[${language}]`]['editor.suggest.snippetsPreventQuickSuggestions'],false);
 }
});
