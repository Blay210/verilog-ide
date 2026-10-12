import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { inside, compatibleNode, baseline, root, validateSource, supportedMsvc, validateGitBoundary } from '../scripts/environment.mjs';

test('Node policy rejects unsupported majors, old patches and malformed versions', () => {
  assert.equal(compatibleNode('24.18.0', baseline.node), true);
  assert.equal(compatibleNode('24.19.0', baseline.node), true);
  for (const version of ['24.17.9', '22.20.0', '25.0.0', '24.18', 'invalid']) assert.equal(compatibleNode(version, baseline.node), false);
});
test('isolation rejects sibling-prefix and parent traversal paths', () => {
  assert.equal(inside(root, path.join(root, 'upstream')), true);
  assert.equal(inside(root, path.resolve(root, '../vsix')), false);
  assert.equal(inside(root, root + '-other'), false);
  assert.equal(inside(root, path.resolve(root, '../docs')), false);
});
test('baseline is pinned to a revision URL and an archive digest', () => {
  assert.match(baseline.revision, /^[a-f0-9]{40}$/);
  assert.match(baseline.archiveSha256, /^[a-f0-9]{64}$/);
  assert.match(baseline.packageLockSha256, /^[a-f0-9]{64}$/);
  assert.equal(new URL(baseline.archiveUrl).hostname, 'codeload.github.com');
  assert.equal(new URL(baseline.archiveUrl).pathname, `/microsoft/vscode/zip/${baseline.revision}`);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(manifest.workspaces, undefined);
  for (const deps of ['dependencies', 'devDependencies']) for (const value of Object.values(manifest[deps] ?? {})) assert.doesNotMatch(value, /^(file:|link:).*\.\./);
});
test('source validation fails closed on a wrong version or changed dependency lock', () => {
  fs.mkdirSync(path.join(root, '.dev'), { recursive: true });
  const fixture = fs.mkdtempSync(path.join(root, '.dev/source-check-'));
  fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ name: 'code-oss-dev', version: '0.0.0' }));
  assert.throws(() => validateSource(fixture), /Unexpected Code-OSS baseline/);
  fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ name: 'code-oss-dev', version: baseline.tag }));
  fs.writeFileSync(path.join(fixture, '.nvmrc'), baseline.node);
  for (const name of ['package-lock.json', 'LICENSE.txt', 'scripts/code.bat', 'build/npm/preinstall.ts']) {
    const target = path.join(fixture, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, '{}');
  }
  assert.throws(() => validateSource(fixture), /dependency lock changed/);
});
test('a pending, broken or unsupported Visual Studio instance cannot satisfy the build gate', () => {
  const valid = { installationVersion: '17.14.37710.0', isComplete: true, isLaunchable: true };
  const instances = [valid, { ...valid, isComplete: false }, { ...valid, isLaunchable: false },
    { ...valid, installationVersion: '18.0.0' }, { installationVersion: '17.14.0' }];
  assert.deepEqual(supportedMsvc(instances), [valid]);
});
test('source tooling must not inherit the outer repository when local metadata is missing', () => {
  fs.mkdirSync(path.join(root, '.dev'), { recursive: true });
  const fixture = fs.mkdtempSync(path.join(root, '.dev/git-boundary-'));
  assert.throws(() => validateGitBoundary(fixture), /own local Git metadata/);
});
