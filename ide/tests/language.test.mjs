import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import path from 'node:path';
import { root } from '../scripts/environment.mjs';
import { prepareLanguage } from '../scripts/prepare-language.mjs';

// Execute the independently copied regression suite, with no sibling build input.
await build({ entryPoints: ['language/ported.test.ts'], outfile: '.dev/language-tests.cjs',
  bundle: true, platform: 'node', format: 'cjs', target: 'node22' });
createRequire(import.meta.url)('../.dev/language-tests.cjs');

test('built-in deployment is repeatable and refuses foreign files and parent destinations', async t => {
  const source = fs.mkdtempSync(path.join(root, '.dev/language-bundle-'));
  t.after(() => fs.rmSync(source, { recursive: true, force: true }));
  const directory = path.join(source, 'extensions/rtl-language');
  fs.mkdirSync(directory, { recursive: true });
  await prepareLanguage(source);
  const target = path.join(directory, 'dist/extension.cjs');
  const first = fs.readFileSync(target, 'utf8');
  await prepareLanguage(source);
  assert.equal(fs.readFileSync(target, 'utf8'), first);
  assert.doesNotMatch(first, /@rtl-dev\/|\.\.\/vsix/);
  fs.writeFileSync(target, 'foreign implementation');
  await assert.rejects(prepareLanguage(source), /Unmanaged language/);
  assert.equal(fs.readFileSync(target, 'utf8'), 'foreign implementation');
  await assert.rejects(prepareLanguage(path.dirname(root)), /escaped IDE/);
});

test('built-in editor shortcuts preserve ordinary editor and snippet controls', () => {
  const pkg = JSON.parse(fs.readFileSync('language/package.json', 'utf8'));
  assert.equal(pkg.contributes.keybindings.length, 2);
  const tab = pkg.contributes.keybindings.find(k => k.key === 'tab');
  for (const context of ['!inSnippetMode', '!editorTabMovesFocus', '!inlineSuggestionVisible', '!editorHasMultipleSelections', '!editorReadonly', 'rtl.templateTab']) assert.ok(tab.when.includes(context));
  const enter = pkg.contributes.keybindings.find(k => k.key === 'enter');
  assert.ok(enter.when.includes('!suggestWidgetVisible || rtl.blockEnter'));
  assert.ok(enter.when.includes('!inSnippetMode || rtl.beginPair'));
  assert.equal(pkg.contributes.configuration.properties['rtl.editor.semantic'].default, true);
  for (const language of pkg.contributes.languages) for (const asset of Object.values(language.icon)) assert.ok(fs.existsSync(path.join('language', asset)));
});

test('registered grammars tokenize actual keywords, directives, strings and comments', async () => {
  const require = createRequire(new URL('../upstream/package.json', import.meta.url));
  const { Registry } = require('vscode-textmate');
  const oniguruma = require('vscode-oniguruma');
  await oniguruma.loadWASM(fs.readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm')));
  const registry = new Registry({
    onigLib: Promise.resolve({ createOnigScanner: p => new oniguruma.OnigScanner(p), createOnigString: s => new oniguruma.OnigString(s) }),
    loadGrammar: async scope => JSON.parse(fs.readFileSync(`language/syntaxes/${scope === 'source.verilog' ? 'verilog' : 'systemverilog'}.tmLanguage.json`, 'utf8'))
  });
  try {
    for (const scope of ['source.verilog', 'source.systemverilog']) {
      const grammar = await registry.loadGrammar(scope);
      for (const [line, expected] of [['module sample;', 'storage.type'], ['always begin', 'keyword'], ['// always begin', 'comment'], ['"begin end"', 'string'], ['`timescale 1ns/1ps', 'preprocessor']]) {
        const tokens = grammar.tokenizeLine(line).tokens;
        assert.ok(tokens.some(t => t.scopes.some(s => s.includes(expected))), `${scope}: ${line}`);
      }
    }
  } finally { registry.dispose(); }
});
