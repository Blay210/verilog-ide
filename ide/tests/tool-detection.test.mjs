import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url);
const detector = require('../dist/runtime/toolchain/detect.js');
const processLayer = require('../dist/runtime/core/process.js');
test('empty editor tool directory reuses the same configured home as omitted CLI directory', async t => {
  if (process.platform !== 'win32') return; // Windows managed-root contract.
  const home = await fs.mkdtemp(path.join(root, '.dev/tool-detection-'));
  t.after(() => fs.rm(home, { recursive: true, force: true }));
  const managed = path.join(home, 'tools/msys64');
  for (const file of ['ucrt64/bin/verilator_bin.exe','ucrt64/bin/g++.exe','ucrt64/bin/python3.exe','ucrt64/include/lz4.h','ucrt64/include/zlib.h','usr/bin/make.exe']) {
    const target = path.join(managed, file); await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, 'probe fixture');
  }
  const previous = processLayer.checkedProcess;
  processLayer.checkedProcess = async command => {
    assert.equal(command.executable, path.join(managed, 'ucrt64/bin/verilator_bin.exe'));
    return 'Verilator 5.050';
  };
  detector.configureToolsHome(home);
  t.after(() => { processLayer.checkedProcess = previous; detector.configureToolsHome(); });
  const omitted = await detector.detectTools({});
  const empty = await detector.detectTools({}, '');
  assert.ok(omitted.toolchain); assert.ok(empty.toolchain);
  assert.equal(empty.toolchain.compiler.executable, omitted.toolchain.compiler.executable);
  assert.equal(empty.toolchain.pathAliasDirectory, path.join(home, 'cache/path-aliases'));
});
