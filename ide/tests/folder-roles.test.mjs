import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { relativeFolder, folderRoleAt, changeFolderRole, folderBadge, isReservedRoleFolder } = createRequire(import.meta.url)('../dist/runtime/folder-roles.js');

test('folder identities include root and Korean/space paths but reject siblings and traversal', () => {
  assert.equal(relativeFolder('D:\\설계 폴더', 'd:/설계 폴더/VERIFY', true), 'VERIFY');
  assert.equal(relativeFolder('D:/work', 'D:/work', true), '');
  for (const path of ['D:/work2/tb', 'D:/work/../tb', 'D:/work/./tb', 'D:/work//tb']) assert.equal(relativeFolder('D:/work', path, true), undefined);
  assert.equal(relativeFolder('D:/Work', 'D:/work/tb', false), undefined);
});
test('generated and dependency trees are blocked even below ordinary folders, with platform case handling', () => {
  for (const folder of ['.rtl', 'rtl/.git/private', 'tb/node_modules/a', 'RTL/.RTL/sub']) assert.equal(isReservedRoleFolder(folder, true), true);
  for (const folder of ['', 'rtl', 'verification', 'rtl/.rtl_sources', 'node_modules_extra']) assert.equal(isReservedRoleFolder(folder, true), false);
  assert.equal(isReservedRoleFolder('rtl/.RTL', false), false);
});
test('saved folder badges survive without review and distinguish modified drafts while never decorating files', () => {
  const saved = { folders: [{ path: 'tb', role: 'simulation' }], directories: ['', 'tb', 'tb/empty'], manifestRevision: 'r1' };
  assert.deepEqual(folderBadge(undefined, saved, 'TB/empty', true), { role: 'simulation', inherited: true, saved: true });
  assert.equal(folderBadge(undefined, saved, 'tb/test.sv', true), undefined);
  assert.equal(folderBadge(undefined, undefined, 'tb', true), undefined);
  const review = { folders: saved.folders, inventory: { directories: saved.directories }, manifestRevision: 'r1' };
  assert.equal(folderBadge(review, saved, 'tb', true).saved, true);
  assert.deepEqual(folderBadge({ ...review, folders: [{ path: 'tb', role: 'source' }] }, saved, 'tb', true), { role: 'source', inherited: false, saved: false });
  assert.equal(folderBadge({ ...review, manifestRevision: 'r2' }, saved, 'tb', true).saved, false);
});
test('nearest folder rule wins and reset restores inheritance without changing child or file overrides', () => {
  const original = { folders: [{ path: '', role: 'source' }, { path: 'tb', role: 'simulation' }, { path: 'tb/private', role: 'excluded' }], files: [{ path: 'tb/dut.sv', role: 'source' }] };
  assert.deepEqual(folderRoleAt(original.folders, 'TB/nested', true), { role: 'simulation', inherited: true });
  assert.deepEqual(folderRoleAt(original.folders, 'tb/private', true), { role: 'excluded', inherited: false });
  const updated = changeFolderRole(original, 'TB', undefined, true);
  assert.deepEqual(folderRoleAt(updated.folders, 'tb/nested', true), { role: 'source', inherited: true });
  assert.deepEqual(folderRoleAt(updated.folders, 'tb/private', true), { role: 'excluded', inherited: false });
  assert.deepEqual(updated.files, original.files);
  assert.equal(original.folders.length, 3);
  assert.equal(folderRoleAt([], 'tb', true), undefined);
});
test('replacement is explicit and invalid roles/relative paths are rejected', () => {
  const changed = changeFolderRole({ folders: [{ path: 'TB', role: 'source' }] }, 'tb', 'simulation', true);
  assert.deepEqual(changed.folders, [{ path: 'tb', role: 'simulation' }]);
  for (const path of ['../tb', '/tb', 'tb/./a', 'tb\\a']) assert.throws(() => changeFolderRole({}, path, 'source', true));
  assert.throws(() => changeFolderRole({}, 'tb', 'other', true));
});
