import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pipeline } from 'node:stream/promises';
import { root } from '../scripts/environment.mjs';
import { payloadTarget, extractPayload, hashFile } from '../scripts/installer-payload.mjs';
const require = createRequire(path.join(root, 'upstream/package.json'));
const { ZipFile } = require('yazl');
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(root, '.dev/installer-test-'));
  t.after(() => { if (!dir.startsWith(path.join(root, '.dev/installer-test-'))) throw Error('Cleanup escaped fixture'); fs.rmSync(dir, { recursive: true, force: true }); });
  const payload = path.join(dir, 'payload'); fs.mkdirSync(payload); return { dir, payload };
}
async function archive(dir, entries) {
  const file = path.join(dir, 'test.zip'), zip = new ZipFile();
  const done = pipeline(zip.outputStream, fs.createWriteStream(file));
  for (const [name, bytes] of entries) zip.addBuffer(Buffer.from(bytes), name);
  zip.end(); await done; return file;
}
test('payload handles Korean and spaces; blocks traversal, Windows aliases and case collisions', () => {
  const dir = path.join(root, '.dev/payload-paths'), seen = new Set();
  assert.equal(payloadTarget(dir, 'resources/한글 이름.sv', seen), path.join(dir, 'resources/한글 이름.sv'));
  for (const name of ['../outside', '/absolute', 'C:/outside', 'x\\outside', 'a/../b', 'a.', 'a ', 'CON.txt', 'aux/log', 'a//b']) assert.throws(() => payloadTarget(dir, name, seen), /Unsafe/);
  payloadTarget(dir, 'Pulse.exe', seen); assert.throws(() => payloadTarget(dir, 'pulse.EXE', seen), /Duplicate/);
});
test('actual ZIP extraction records exact bytes/hashes and refuses a mismatched accepted entry count', async t => {
  const f = fixture(t), zip = await archive(f.dir, [['Pulse.exe', 'MZ payload'], ['docs/한글 안내.txt', '사용 안내\n']]);
  const files = await extractPayload(zip, f.payload, 2);
  assert.equal(files.length, 2); assert.equal(fs.readFileSync(path.join(f.payload, 'docs/한글 안내.txt'), 'utf8'), '사용 안내\n');
  assert.equal(files[0].sha256, await hashFile(path.join(f.payload, 'Pulse.exe')));
  const other = path.join(f.dir, 'other'); fs.mkdirSync(other);
  await assert.rejects(extractPayload(zip, other, 3), /count differs/);
});
test('actual ZIP cannot overwrite a differently cased file already extracted', async t => {
  const f = fixture(t), zip = await archive(f.dir, [['Pulse.exe', 'original'], ['pulse.EXE', 'replacement']]);
  await assert.rejects(extractPayload(zip, f.payload, 2), /Duplicate/);
  assert.equal(fs.readFileSync(path.join(f.payload, 'Pulse.exe'), 'utf8'), 'original');
});
