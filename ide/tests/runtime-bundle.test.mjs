import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root } from '../scripts/environment.mjs';
import { prepareRuntime } from '../scripts/prepare-runtime.mjs';

test('owned runtime bundle loads without VSIX, VS Code API or parent dependencies', async t => {
  const source = await fs.mkdtemp(path.join(root, '.dev/runtime-bundle-'));
  t.after(() => fs.rm(source, { recursive: true, force: true }));
  await fs.writeFile(path.join(source, 'package.json'), '{"type":"module"}');
  await prepareRuntime(source);
  await prepareRuntime(source, { sourceBuild: true });
  const productionFile = path.join(source, 'src/vs/platform/rtl/node/runtime.js');
  const production = await import(pathToFileURL(productionFile).href);
  const productionSession = production.createSimulationHost(() => {});
  assert.equal(productionSession.state.phase, 'idle'); await productionSession.close();
  for (const asset of ['waveform-worker.cjs', 'waveform.html', 'analyze.py']) assert.ok((await fs.stat(path.join(path.dirname(productionFile),asset))).size > 0);
  const file = path.join(source, 'out/vs/platform/rtl/node/runtime.js');
  const text = await fs.readFile(file, 'utf8');
  assert.ok(text.startsWith('// RTL IDE owned runtime bundle;'));
  assert.doesNotMatch(text, /@rtl-dev\/|["']vscode["']|\.\.\/vsix/);
  const module = await import(pathToFileURL(file).href);
  const session = module.createSimulationHost(() => {});
  assert.equal(session.state.phase, 'idle'); await session.close();
  await prepareRuntime(source);
});

test('runtime deployment refuses unmanaged targets and a parent source directory', async t => {
  const source = await fs.mkdtemp(path.join(root, '.dev/runtime-guard-'));
  t.after(() => fs.rm(source, { recursive: true, force: true }));
  const file = path.join(source, 'out/vs/platform/rtl/node/runtime.js');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, 'foreign input');
  await assert.rejects(prepareRuntime(source), /Unmanaged runtime/);
  assert.equal(await fs.readFile(file, 'utf8'), 'foreign input');
  await assert.rejects(prepareRuntime(path.dirname(root)), /escaped IDE/);
});
