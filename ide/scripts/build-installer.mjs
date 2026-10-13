// Build the installer from the already accepted ZIP. No installation or UI.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { root, inside } from './environment.mjs';
import { extractPayload, hashFile } from './installer-payload.mjs';
import { verifyPackageIntegrity } from './package-integrity.mjs';
const require = createRequire(path.join(root, 'upstream/package.json'));
const release = path.join(root, 'release');
const manifest = JSON.parse(fs.readFileSync(path.join(release, 'manifest.json'), 'utf8'));
if (process.platform !== 'win32' || manifest.platform !== 'win32-x64' || manifest.kind !== 'study-internal-beta' || !manifest.packagedAcceptance?.passed) throw Error('Accepted Windows study release required.');
if (path.basename(manifest.archive) !== manifest.archive) throw Error('Unsafe archive name.');
const archive = path.join(release, manifest.archive);
if (!inside(release, fs.realpathSync(archive)) || await hashFile(archive) !== manifest.sha256 || fs.statSync(archive).size !== manifest.bytes) throw Error('Release ZIP differs from its verified manifest.');
const name = 'Pulse-Setup-windows-x64-beta-20261014.exe';
const target = path.join(release, name);
if (fs.existsSync(target)) throw Error('Setup already exists; preserve it before making another candidate.');
const compiler = path.join(path.dirname(path.dirname(require.resolve('innosetup'))), 'bin/ISCC.exe');
if (!inside(root, fs.realpathSync(compiler))) throw Error('Compiler escaped own build dependencies.');
const stage = fs.mkdtempSync(path.join(root, '.dev/pulse-installer-'));
const payload = path.join(stage, 'payload'), output = path.join(stage, 'output');
fs.mkdirSync(payload); fs.mkdirSync(output);
const receipt = { passed: false, installed: false, screenVerified: false, stage, sourceArchive: manifest.archive, sourceSha256: manifest.sha256, checks: [] };
const report = path.join(release, 'installer-manifest.json');
try {
  console.log('Verified release ZIP; extracting accepted payload.');
  const files = await extractPayload(archive, payload, manifest.verifiedEntries);
  fs.writeFileSync(path.join(stage, 'payload-inventory.json'), JSON.stringify(files, null, 2));
  const product = JSON.parse(fs.readFileSync(path.join(payload, 'resources/app/product.json'), 'utf8'));
  if (product.nameShort !== 'Pulse' || await hashFile(path.join(payload, 'Pulse.exe')) !== manifest.packagedAcceptance.executableSha256) throw Error('Accepted application identity differs.');
  verifyPackageIntegrity(path.join(payload, 'resources/app'));
  for (const file of ['PULSE-README.md', 'PULSE-NOTICES.txt', 'PULSE-ACCEPTANCE.json']) if (!files.some(f => f.name === file)) throw Error('Missing delivery document: ' + file);
  receipt.checks.push('Verified accepted ZIP hash/size, all 2565 payload entries, executable identity and all ten upstream integrity files');
  const config = JSON.parse(fs.readFileSync(path.join(root, 'config/product.json'), 'utf8')).values;
  if (!/^\{\{[A-F0-9-]+\}$/.test(config.win32x64UserAppId)) throw Error('Invalid installer identity.');
  const script = path.join(root, 'installer/pulse.iss');
  const log = fs.openSync(path.join(stage, 'compile.log'), 'w');
  try {
    console.log('Compiling user installer with existing Inno Setup.');
    receipt.compileCode = await new Promise((resolve, reject) => {
      const child = spawn(compiler, ['/Qp', script, `/dPayloadDir=${payload}`, `/dOutputDir=${output}`, `/dUserAppId=${config.win32x64UserAppId}`], { windowsHide: true, stdio: ['ignore', log, log] });
      child.once('error', reject); child.once('exit', resolve);
    });
  } finally { fs.closeSync(log); }
  if (receipt.compileCode !== 0) throw Error('Installer compilation failed; see ' + path.join(stage, 'compile.log'));
  const built = path.join(output, name);
  const fd = fs.openSync(built, 'r'), head = Buffer.alloc(64);
  try { fs.readSync(fd, head); if (head.toString('ascii', 0, 2) !== 'MZ') throw Error('Missing installer PE header.'); const signature = Buffer.alloc(4); fs.readSync(fd, signature, 0, 4, head.readUInt32LE(60)); if (!signature.equals(Buffer.from([80, 69, 0, 0]))) throw Error('Invalid installer PE signature.'); } finally { fs.closeSync(fd); }
  // Detect input changes during compilation before publishing the setup artifact.
  for (const file of files) if (await hashFile(path.join(payload, file.name)) !== file.sha256) throw Error('Payload changed during compilation.');
  receipt.checks.push('Inno Setup compile exit0, PE executable, all staged source hashes unchanged after compile');
  receipt.sha256 = await hashFile(built); receipt.bytes = fs.statSync(built).size; receipt.payloadEntries = files.length;
  receipt.scriptSha256 = await hashFile(script); receipt.compilerSha256 = await hashFile(compiler); receipt.compilerVersion = require('innosetup/package.json').version;
  if (fs.existsSync(target)) throw Error('Setup destination appeared during compilation.');
  fs.renameSync(built, target); fs.writeFileSync(target + '.sha256', `${receipt.sha256}  ${name}\n`);
  receipt.file = name; receipt.passed = true;
  receipt.limits = ['Unsigned study beta', 'Setup wizard, actual install/upgrade/uninstall and clean Windows are not verified by compiling', 'Simulator and semantic tools require separate approval/install'];
  console.log(JSON.stringify({ file: target, bytes: receipt.bytes, sha256: receipt.sha256, payloadEntries: files.length }));
} catch (error) { receipt.error = String(error); process.exitCode = 1; console.error(error); }
finally { fs.writeFileSync(report, JSON.stringify(receipt, null, 2) + '\n'); }
