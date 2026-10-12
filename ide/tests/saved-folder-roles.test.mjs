import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url);
const { SimulationHostSession } = require('../dist/runtime/host.js');
const { discoverProject } = require('../dist/runtime/core/index.js');

test('safe directory inventory includes empty/excluded boundaries but omits links and reserved trees', async t => {
  const dir = await fs.mkdtemp(path.join(root, '.dev/role-dirs-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  for (const folder of ['tb/empty', 'excluded/hidden', '.rtl/generated', 'node_modules/hidden']) await fs.mkdir(path.join(dir, folder), { recursive: true });
  await fs.symlink(path.join(dir, 'tb'), path.join(dir, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  const result = await discoverProject(dir, { folders: [{ path: 'excluded', role: 'excluded' }] });
  assert.deepEqual(result.directories, ['', 'excluded', 'tb', 'tb/empty']);
});

test('pending role save reloads in a fresh host and protected TOML clears saved badges without rewriting', async t => {
  const dir = await fs.mkdtemp(path.join(root, '.dev/role-persistence-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, 'verification/empty'), { recursive: true });
  const first = new SimulationHostSession(() => {}); t.after(() => first.close());
  await first.inspect(dir); await first.classify({ folders: [{ path: 'verification', role: 'simulation' }] });
  await first.saveReview(true);
  assert.equal(first.state.savedFolderRoles.folders[0].role, 'simulation');
  const second = new SimulationHostSession(() => {}); t.after(() => second.close());
  await second.inspect(dir);
  assert.deepEqual(second.state.savedFolderRoles, first.state.savedFolderRoles);
  const file = path.join(dir, 'rtl.toml'); const bytes = await fs.readFile(file, 'utf8');
  await fs.writeFile(file, bytes + '# user edit\n');
  await second.inspect(dir);
  assert.equal(second.state.savedFolderRoles, undefined);
  assert.equal(await fs.readFile(file, 'utf8'), bytes + '# user edit\n');
});
