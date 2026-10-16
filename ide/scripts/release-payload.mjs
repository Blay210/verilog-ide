import fs from 'node:fs';
import path from 'node:path';
import { createHash, timingSafeEqual } from 'node:crypto';
import { root, inside } from './environment.mjs';
import { payloadTarget, hashFile } from './installer-payload.mjs';
import { verifyPackageIntegrity } from './package-integrity.mjs';

export const developmentCommands = ['rtlIde.explorer.state', 'rtlIde.explorer.activateRun', 'rtlIde.simulation.state', 'rtlIde.spaceState', '[Pulse timing]'];
export function validateReleaseEvidence(evidence, codeIdentity) {
  if (evidence?.passed !== true || evidence.sourceCodeIdentity !== codeIdentity || evidence.nativeTypeErrors !== 0
    || evidence.tests?.failed !== 0 || (evidence.tests?.cancelled ?? 0) !== 0 || !Number.isSafeInteger(evidence.tests?.passed) || evidence.tests.passed < 1) throw Error('Current code-bound release checks required.');
  return evidence;
}
export function auditReleaseNames(names) {
  for (const name of names) {
    if (/^(?:\.dev|\.git|data|tests?|fixtures?|scripts|upstream|node_modules)(?:\/|$)/i.test(name)
      || /(?:^|\/)(?:\.pulse-build\.json|\.vscode-test)(?:\/|$)/i.test(name)
      || /^resources\/app\/extensions\/[^/]*(?:copilot|authentication|verification|fixture|vscode-api-tests|vscode-test-resolver|debug-auto-launch)[^/]*(?:\/|$)/i.test(name)) throw Error('Development/private payload entry: ' + name);
  }
}
export function inventoryFiles(directory) {
  const files = [];
  const visit = parent => {
    for (const entry of fs.readdirSync(parent, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name,'en'))) {
      const file = path.join(parent, entry.name);
      if (entry.isSymbolicLink() || !inside(directory, fs.realpathSync(file))) throw Error('Linked/escaped release input.');
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile()) files.push(path.relative(directory, file).replaceAll(path.sep, '/'));
      else throw Error('Unsupported release input.');
    }
  };
  visit(directory); return files;
}
export async function verifyInventory(directory, inventory) {
  if (!inside(root, fs.realpathSync(directory)) || !Array.isArray(inventory) || !inventory.length) throw Error('Missing owned inventory.');
  const seen = new Set();
  for (const entry of inventory) {
    const file = payloadTarget(directory, entry.relative, seen);
    if (!/^[a-f0-9]{64}$/.test(entry.sha256) || !Number.isSafeInteger(entry.size) || entry.size < 0
      || !inside(directory, fs.realpathSync(file)) || !fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink()
      || fs.statSync(file).size !== entry.size || await hashFile(file) !== entry.sha256) throw Error('Release input differs: ' + entry.relative);
  }
  const actual = inventoryFiles(directory).filter(name => name !== '.pulse-build.json');
  if (actual.length !== inventory.length || actual.some(name => !seen.has(name.toLowerCase()))) throw Error('Unlisted release input.');
  return inventory;
}
export async function copyVerifiedFiles(source, destination, inventory) {
  if (!inside(root, fs.realpathSync(destination)) || fs.readdirSync(destination).length) throw Error('Expected empty owned installer stage.');
  await verifyInventory(source, inventory);
  const seen = new Set();
  for (const entry of inventory) {
    const target = payloadTarget(destination, entry.relative, seen), original = path.join(source, entry.relative);
    fs.mkdirSync(path.dirname(target), {recursive:true});
    fs.copyFileSync(original, target, fs.constants.COPYFILE_EXCL);
    if (fs.statSync(target).size !== entry.size || await hashFile(target) !== entry.sha256) throw Error('Payload changed during staging: ' + entry.relative);
  }
}
export async function verifyReleaseCandidate(directory) {
  directory = fs.realpathSync(directory);
  if (path.dirname(directory) !== fs.realpathSync(path.join(root,'.dev')) || !/^pulse-bundled-/.test(path.basename(directory))) throw Error('Expected dedicated local build.');
  const receipt = JSON.parse(fs.readFileSync(path.join(directory,'.pulse-build.json'),'utf8'));
  if (!receipt.passed || receipt.kind !== 'local-bundled' || receipt.output !== directory || !/^[a-f0-9]{64}$/.test(receipt.codeIdentity)) throw Error('Candidate is not verified.');
  auditReleaseNames(receipt.files.map(file => file.relative));
  await verifyInventory(directory, receipt.files);
  const app = path.join(directory,'resources/app'), product = JSON.parse(fs.readFileSync(path.join(app,'product.json'),'utf8'));
  if (product.nameShort !== 'Pulse' || product.applicationName !== 'rtl-ide' || product.rtlLocalBuild !== receipt.codeIdentity || product.commit !== receipt.codeIdentity.slice(0,40)) throw Error('Wrong release identity.');
  const code = [];
  for (const base of [path.join(app,'out'),path.join(app,'extensions/rtl-language')]) for (const relative of inventoryFiles(base)) {
    const file = path.join(base, relative); code.push({relative,size:fs.statSync(file).size,sha256:await hashFile(file)});
  }
  const codeIdentity = createHash('sha256').update(JSON.stringify(code)).digest('hex');
  if (!timingSafeEqual(Buffer.from(codeIdentity),Buffer.from(receipt.codeIdentity))) throw Error('Code identity differs from receipt.');
  const workbench = fs.readFileSync(path.join(app,'out/vs/workbench/workbench.desktop.main.js'),'utf8');
  for (const command of developmentCommands) if (workbench.includes(command)) throw Error('Development hook remains in app: ' + command);
  if (!workbench.includes('rtlIde.simulation.run') || !workbench.includes('rtlIde.editor.prepareCompletion')) throw Error('Required product command missing.');
  const integrity = verifyPackageIntegrity(app);
  return { directory, receipt, integrityFiles: integrity.length, developmentAudit: true };
}
