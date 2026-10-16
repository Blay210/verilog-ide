import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { root } from './environment.mjs';
const execute = promisify(execFile), base = path.join(root, '.dev');
const directory = await fs.mkdtemp(path.join(base, 'cli-remediation-'));
const project = path.join(directory, '한글 공백 프로젝트'); await fs.mkdir(project);
const entry = path.join(root, 'upstream/out/vs/platform/rtl/node/rtl-cli.cjs');
const call = async (...args) => JSON.parse((await execute(process.execPath, [entry, ...args, '--project', project], { cwd: directory, windowsHide: true, timeout: 30000, maxBuffer: 1048576 })).stdout);
try {
  await call('init');
  const original = await fs.readFile(path.join(project, 'rtl.toml'));
  assert.equal((await call('check')).tests.length, 0);
  await fs.writeFile(path.join(project, 'rtl', 'dut.sv'), 'module dut; endmodule');
  await fs.writeFile(path.join(project, 'tb', 'tb.sv'), 'module top1; initial #1 $finish; endmodule\nmodule top2; initial #2 $finish; endmodule');
  const checked = await call('check'); assert.deepEqual(checked.tests.map(test => test.top).sort(), ['top1', 'top2']);
  assert.deepEqual(await call('history'), []);
  await assert.rejects(call('test', '--all', '--jobs', '5'), error => error.code === 1 && /1~4/.test(error.stderr));
  await assert.rejects(call('init'), error => error.code === 1 && /비어 있지 않은/.test(error.stderr));
  await assert.rejects(call('history', '--limit', '1001'), error => error.code === 1 && /1..1000/.test(error.stderr));
  assert.deepEqual(await fs.readFile(path.join(project, 'rtl.toml')), original);
  assert.equal(await fs.stat(path.join(project, '.rtl')).then(() => true, () => false), false);
  console.log(JSON.stringify({ passed: true, checks: 8, bundledEntry: true, unicodeAndSpaces: true, sourceAndManifestPreserved: true, toolsInvoked: false }));
} finally {
  assert.equal(path.dirname(directory), base);
  await fs.rm(directory, { recursive: true, force: true });
}
