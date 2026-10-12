import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { root, validateSource, validateGitBoundary } from './environment.mjs';
import { prepareDevelopmentExecutable } from './launcher.mjs';

const source = path.join(root, 'upstream');
validateSource(source);
validateGitBoundary(source);
const executable = await prepareDevelopmentExecutable(source);
const requireUpstream = createRequire(path.join(source, 'package.json'));
const { ZipFile } = requireUpstream('yazl');
const fixture = fs.mkdtempSync(path.join(root, '.dev/cli-policy-'));
const vsix = path.join(fixture, '정책 확인 fixture.vsix');
const zip = new ZipFile();
zip.addBuffer(Buffer.from(JSON.stringify({ name: 'policy-fixture', publisher: 'rtl-internal-test', version: '0.0.1', engines: { vscode: '*' } })), 'extension/package.json');
await new Promise((resolve, reject) => {
  const output = fs.createWriteStream(vsix);
  output.on('close', resolve);
  output.on('error', reject);
  zip.outputStream.on('error', reject).pipe(output);
  zip.end();
});
const env = { ...process.env, ELECTRON_RUN_AS_NODE: '1', VSCODE_DEV: '1', NODE_ENV: 'development', GIT_CEILING_DIRECTORIES: root };
for (const key of ['NODE_PATH', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE']) delete env[key];
const result = spawnSync(executable, [path.join(source, 'out/cli.js'), source,
  '--user-data-dir', path.join(fixture, 'profile'), '--shared-data-dir', path.join(fixture, 'shared'),
  '--extensions-dir', path.join(fixture, 'extensions'), '--install-extension', vsix, '--force'],
  { cwd: source, env, encoding: 'utf8', windowsHide: true, timeout: 60000 });
fs.writeFileSync(path.join(fixture, 'cli.log'), `${result.stdout ?? ''}\n${result.stderr ?? ''}`);
assert.equal(result.error, undefined);
assert.notEqual(result.status, 0, 'CLI must reject external installation');
assert.match(`${result.stdout}\n${result.stderr}`, /External extensions are not supported in RTL IDE/);
assert.equal(fs.existsSync(path.join(fixture, 'extensions/rtl-internal-test.policy-fixture-0.0.1')), false);
const receipt = { passed: true, exit: result.status, fixture, unicodeAndSpaces: true, installed: false };
fs.writeFileSync(path.join(fixture, 'receipt.json'), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt));
