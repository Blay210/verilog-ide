import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { root, inside } from './environment.mjs';

// Same SHA256/base64 format as the pinned upstream packageTask. Refreshing
// bundles must also refresh their integrity metadata, never disable the check.
export const integrityFiles = [
  'vs/base/parts/sandbox/electron-browser/preload.js',
  'vs/workbench/workbench.desktop.main.js',
  'vs/workbench/workbench.desktop.main.css',
  'vs/workbench/api/node/extensionHostProcess.js',
  'vs/code/electron-browser/workbench/workbench.html',
  'vs/code/electron-browser/workbench/workbench.js',
  'vs/sessions/sessions.desktop.main.js',
  'vs/sessions/sessions.desktop.main.css',
  'vs/sessions/electron-browser/sessions.html',
  'vs/sessions/electron-browser/sessions.js'
];
function inspect(app) {
  const real = fs.realpathSync(app);
  if (!inside(root, real)) throw Error('Integrity input escaped ide.');
  const productPath = path.join(real, 'product.json');
  if (!inside(real, fs.realpathSync(productPath))) throw Error('Linked product metadata.');
  const product = JSON.parse(fs.readFileSync(productPath, 'utf8'));
  if (product.applicationName !== 'rtl-ide') throw Error('Unexpected package identity.');
  if (JSON.stringify(Object.keys(product.checksums ?? {}).sort()) !== JSON.stringify([...integrityFiles].sort())) throw Error('Integrity file list differs from pinned upstream.');
  const checksums = {};
  for (const name of integrityFiles) {
    const file = path.join(real, 'out', name);
    if (!inside(path.join(real, 'out'), fs.realpathSync(file))) throw Error('Linked integrity resource.');
    checksums[name] = createHash('sha256').update(fs.readFileSync(file)).digest('base64').replace(/=+$/, '');
  }
  return { productPath, product, checksums };
}
export function refreshPackageIntegrity(app) {
  const { productPath, product, checksums } = inspect(app);
  const temporary = productPath + '.rtl-refresh';
  fs.writeFileSync(temporary, JSON.stringify({ ...product, checksums }, null, '\t') + '\n', { flag: 'wx' });
  fs.renameSync(temporary, productPath);
  return Object.keys(checksums);
}
export function verifyPackageIntegrity(app) {
  const { product, checksums } = inspect(app);
  for (const name of integrityFiles) if (checksums[name] !== product.checksums[name]) throw Error('Packaged integrity mismatch: ' + name);
  return Object.keys(checksums);
}
