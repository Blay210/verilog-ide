import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { createSourceProject, initializeSourceProject } = require('../dist/runtime/core/workspace-project.js');
const { loadProject } = require('../dist/runtime/core/config.js');
async function fixture(action) {
  const base = path.resolve('.dev'), root = await fs.mkdtemp(path.join(base, 'project-entry-'));
  try { await action(root); }
  finally { assert.ok(path.dirname(root) === base); await fs.rm(root, { recursive: true, force: true }); }
}
test('new Unicode project is useful without tools or examples and tracks source/TB membership without manifest writes', () => fixture(async parent => {
  const root = await createSourceProject(parent, '새 설계'), manifest = await fs.readFile(path.join(root, 'rtl.toml'));
  assert.deepEqual((await fs.readdir(root)).sort(), ['.gitignore', 'README.md', 'rtl', 'rtl.toml', 'tb']);
  assert.equal((await loadProject(root)).tests.length, 0);
  const source = path.join(root, 'rtl', 'alu.sv'); await fs.writeFile(source, 'module alu; endmodule');
  const tb = path.join(root, 'tb', 'tb.sv'); await fs.writeFile(tb, 'module top1; initial #1 $finish; endmodule\nmodule top2; initial #2 $finish; endmodule');
  const project = await loadProject(root);
  assert.deepEqual(project.sources, [source]); assert.deepEqual(project.tests.map(item => item.top).sort(), ['top1', 'top2']);
  await fs.unlink(source); assert.equal((await loadProject(root)).sources.length, 0);
  await fs.unlink(tb); assert.equal((await loadProject(root)).tests.length, 0);
  assert.deepEqual(await fs.readFile(path.join(root, 'rtl.toml')), manifest);
  assert.equal(await fs.stat(path.join(root, '.rtl')).then(() => true, () => false), false);
}));
test('creation refuses existing files, path traversal and Windows reserved names without changing originals', () => fixture(async parent => {
  const file = path.join(parent, 'design.sv'); await fs.writeFile(file, 'original');
  await assert.rejects(initializeSourceProject(parent, 'design'), /비어 있지 않은/);
  for (const name of ['..', '../escape', 'CON', ' design', 'design.']) await assert.rejects(createSourceProject(parent, name));
  assert.equal(await fs.readFile(file, 'utf8'), 'original'); assert.deepEqual(await fs.readdir(parent), ['design.sv']);
  await createSourceProject(parent, 'existing');
  const manifest = await fs.readFile(path.join(parent, 'existing', 'rtl.toml'));
  await assert.rejects(createSourceProject(parent, 'existing'), { code: 'EEXIST' });
  assert.deepEqual(await fs.readFile(path.join(parent, 'existing', 'rtl.toml')), manifest);
}));
