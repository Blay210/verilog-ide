import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const { discoverProject } = createRequire(import.meta.url)('../dist/runtime/core/index.js');

async function fixture(files = {}) {
  const root = await fs.mkdtemp(path.resolve('.dev/discovery-'));
  for (const [name, text] of Object.entries(files)) {
    const file = path.join(root, name); await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, text);
  }
  return root;
}
async function snapshot(root) {
  const entries = (await fs.readdir(root, { recursive: true })).sort();
  const bytes = [];
  for (const entry of entries) { const file = path.join(root, entry); if ((await fs.lstat(file)).isFile()) bytes.push([entry, await fs.readFile(file, 'hex')]); }
  return { entries, bytes };
}

test('read-only discovery needs no manifest, keeps deterministic Unicode paths and separates multiple tops', async () => {
  const root = await fixture({ 'rtl/덧셈 alu.sv': 'module alu; endmodule', '검증/tb.v': 'module top1; initial $finish; endmodule\nmodule top2; endmodule', 'rtl/pkg.sv': 'package data_pkg; endpackage', 'rtl/types.svh': 'typedef logic [7:0] word_t;' });
  const before = await snapshot(root), result = await discoverProject(root);
  assert.equal(result.manifest, 'absent'); assert.deepEqual(await snapshot(root), before);
  assert.equal(result.sources.find(file => file.path.endsWith('pkg.sv')).kind, 'package');
  assert.equal(result.sources.find(file => file.path.endsWith('types.svh')).kind, 'header');
  const tops = result.tops.filter(top => top.file === '검증/tb.v');
  assert.deepEqual(tops.map(top => top.top), ['top1', 'top2']);
  assert.deepEqual(tops.map(top => top.displayName), ['검증/tb.top1', '검증/tb.top2']);
  assert.equal(tops[0].intent, 'simulation'); assert.ok(result.tops.every(top => top.confirmation === 'required'));
  assert.deepEqual(await discoverProject(root), result);
});

test('comments, strings, directive continuations and escaped names never become real declaration candidates', async () => {
  const root = await fixture({ 'tb/test.sv': '// module fake; endmodule\n/* package fake_pkg; endpackage */\n`define STUFF module macro_name; \\\nendmodule\nmodule automatic real_tb;\ninitial $display("module string_name; endmodule");\nendmodule\nmodule \\escaped_name ; endmodule\n' });
  const result = await discoverProject(root);
  assert.deepEqual(result.tops.map(top => top.top), ['real_tb']);
  assert.equal(result.sources[0].requiresPreprocessing, true);
  assert.ok(result.warnings.some(warning => warning.message.includes('inactive branches')));
  assert.ok(result.warnings.some(warning => warning.message.includes('Escaped identifiers')));
  assert.equal(result.sources[0].declarations[0].line, 4);
});

test('explicit file roles override longest folder role and conventions without changing disk', async () => {
  const root = await fixture({ 'tb/design.sv': 'module design; endmodule', 'tb/nested/custom.sv': 'module custom; endmodule', 'verification/a.sv': 'module a; endmodule', 'ignore/hidden.sv': 'module hidden; endmodule' });
  const before = await snapshot(root);
  const result = await discoverProject(root, {
    folders: [{ path: 'tb', role: 'source' }, { path: 'tb/nested', role: 'simulation' }, { path: 'ignore', role: 'excluded' }],
    files: [{ path: 'tb\\nested\\custom.sv', role: 'source' }, { path: 'verification/a.sv', role: 'simulation' }]
  });
  assert.equal(result.sources.find(file => file.path === 'tb/design.sv').roleOrigin, 'folder');
  assert.equal(result.sources.find(file => file.path === 'tb/nested/custom.sv').roleOrigin, 'file');
  assert.equal(result.sources.find(file => file.path === 'tb/nested/custom.sv').role, 'source');
  assert.equal(result.sources.find(file => file.path === 'verification/a.sv').role, 'simulation');
  assert.ok(!result.sources.some(file => file.path.startsWith('ignore/')));
  assert.deepEqual(await snapshot(root), before);
  await assert.rejects(discoverProject(root, { folders: [{ path: '../elsewhere', role: 'source' }] }), /project-relative/);
  await assert.rejects(discoverProject(root, { files: [{ path: 'C:\\external.sv', role: 'source' }] }), /project-relative/);
  await assert.rejects(discoverProject(root, { folders: [{ path: 'tb', role: 'source' }, { path: './tb/', role: 'simulation' }] }), /Duplicate/);
});

test('generated folders and filesystem links are skipped instead of importing external code', async () => {
  const root = await fixture({ 'rtl/ok.v': 'module ok; endmodule', '.rtl/runs/generated.sv': 'module wrong; endmodule', 'node_modules/a.sv': 'module wrong; endmodule', '.git/a.sv': 'module wrong; endmodule' });
  const outside = await fixture({ 'external.sv': 'module outside; endmodule' });
  await fs.symlink(outside, path.join(root, 'linked'), 'junction');
  const result = await discoverProject(root);
  assert.deepEqual(result.sources.map(file => file.path), ['rtl/ok.v']);
  assert.ok(result.warnings.some(warning => warning.file === 'linked'));
});

test('duplicate declarations, incomplete code and mixed files remain review candidates', async () => {
  const root = await fixture({ 'a.sv': 'package p; endpackage\nmodule same; endmodule\nmodule unfinished;', 'other/a.sv': 'module same; endmodule', 'headers.svh': 'module header_only; endmodule' });
  const result = await discoverProject(root);
  assert.equal(result.sources.find(file => file.path === 'a.sv').kind, 'mixed');
  assert.ok(result.warnings.some(warning => warning.message.includes('Multiple declarations of same')));
  assert.ok(result.warnings.some(warning => warning.message.includes('Incomplete')));
  assert.equal(new Set(result.tops.map(top => top.id)).size, result.tops.length);
  assert.ok(!result.tops.some(top => top.top === 'header_only'));
  assert.deepEqual(result.tops.filter(top => top.top === 'same').map(top => top.displayName), ['a.same', 'other/a.same']);
});

test('limits and cancellation stop import; empty and existing malformed manifest projects stay untouched', async () => {
  const empty = await fixture(); assert.deepEqual((await discoverProject(empty)).sources, []);
  assert.deepEqual(await fs.readdir(empty), []);
  const root = await fixture({ 'rtl.toml': 'broken = [', 'a.sv': 'module a; endmodule', 'b.sv': 'module b; endmodule' });
  const before = await snapshot(root);
  assert.equal((await discoverProject(root)).manifest, 'present');
  const controller = new AbortController(); controller.abort();
  await assert.rejects(discoverProject(root, { signal: controller.signal }), /abort/i);
  const active = new AbortController(); const pending = discoverProject(root, { signal: active.signal }); active.abort();
  await assert.rejects(pending, /abort/i);
  await assert.rejects(discoverProject(root, { maxFiles: 1 }), /file limit/);
  await assert.rejects(discoverProject(root, { maxEntries: 1 }), /entry limit/);
  await assert.rejects(discoverProject(root, { maxTotalBytes: 1 }), /total byte limit/);
  await assert.rejects(discoverProject(root, { maxFiles: 0 }), /positive/);
  const result = await discoverProject(root, { maxFileBytes: 1 }); assert.equal(result.sources.length, 0); assert.equal(result.warnings.length, 2);
  assert.deepEqual(await snapshot(root), before);
});
