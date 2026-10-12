import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url);
const { buildPaths } = require('../dist/runtime/verilator/paths.js');

test('build path aliases preserve bytes, distinguish basenames and clean private resources', async t => {
  const base = await fs.mkdtemp(path.join(root, '.dev/verilator-paths-'));
  t.after(() => fs.rm(base, { recursive: true, force: true }));
  const project = path.join(base, '한글 project'), cache = path.join(base, 'cache');
  await fs.mkdir(path.join(project, 'a'), { recursive: true }); await fs.mkdir(path.join(project, 'b'));
  const bytes = Buffer.from('\ufeffmodule dut; endmodule\n');
  const a = path.join(project, 'a/신호 [0].sv'), b = path.join(project, 'b/신호 [0].sv');
  await fs.writeFile(a, bytes); await fs.writeFile(b, bytes);
  const paths = await buildPaths(project, cache);
  try {
    const first = await paths.map(a), second = await paths.map(b);
    assert.notEqual(first, second); assert.equal(await paths.map(a), first);
    assert.deepEqual(await fs.readFile(a), bytes); assert.deepEqual(await fs.readFile(b), bytes);
    if (process.platform === 'win32') {
      assert.match(first, /^[A-Za-z0-9_./:-]+$/);
      const copy = await fs.readFile(first, 'utf8');
      assert.ok(copy.startsWith('`line 1 "')); assert.ok(copy.endsWith(bytes.subarray(3).toString()));
      assert.equal(paths.original(first + ':2'), a.replaceAll('\\','/') + ':2');
      const directory = await paths.directory(path.dirname(a));
      assert.deepEqual(await fs.readFile(path.join(directory, path.basename(a))), bytes);
    } else assert.equal(first, a.replaceAll('\\','/'));
  } finally { await paths.dispose(); }
  if (process.platform === 'win32') assert.deepEqual(await fs.readdir(cache), []);
  assert.deepEqual(await fs.readFile(a), bytes);
});

test('failed file mapping can be disposed without retaining links or copies', async t => {
  const base = await fs.mkdtemp(path.join(root, '.dev/verilator-paths-error-'));
  t.after(() => fs.rm(base, { recursive: true, force: true }));
  const project = path.join(base, '공백 project'), cache = path.join(base, 'cache'); await fs.mkdir(project);
  const paths = await buildPaths(project, cache);
  try {
    if (process.platform === 'win32') {
      const source = path.join(project, '먼저 복사.sv'); await fs.writeFile(source, 'module a; endmodule\n');
      await paths.map(source);
      await assert.rejects(paths.map(path.join(project, '없는 source.sv')), /ENOENT/);
    }
  } finally { await paths.dispose(); }
  await paths.dispose();
  if (process.platform === 'win32') assert.deepEqual(await fs.readdir(cache), []);
});
