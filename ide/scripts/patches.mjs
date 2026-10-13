import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { root, inside } from './environment.mjs';

export const patches = JSON.parse(fs.readFileSync(path.join(root, 'config/patches.json'), 'utf8'));
export const productConfig = JSON.parse(fs.readFileSync(path.join(root, 'config/product.json'), 'utf8'));
export const sourceOverlay = JSON.parse(fs.readFileSync(path.join(root, 'config/source-overlay.json'), 'utf8'));
const digest = text => createHash('sha256').update(text).digest('hex');
export function productText(text, config = productConfig) {
  if (digest(text) === config.appliedSha256) return text;
  if (digest(text) !== config.baselineSha256 && digest(text) !== config.previousAppliedSha256) throw Error('Product baseline differs; review before applying.');
  const value = { ...JSON.parse(text), ...config.values };
  for (const key of config.remove) delete value[key];
  const sorted = Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]]));
  const result = JSON.stringify(sorted, null, '\t') + '\n';
  if (digest(result) !== config.appliedSha256) throw Error('Product overlay digest differs; review the recorded overlay.');
  return result;
}
export function patchedText(text, patch) {
  const count = needle => text.split(needle).length - 1;
  if (count(patch.before) === 1 && count(patch.after) === 0) return text.replace(patch.before, patch.after);
  if (count(patch.after) === 1 && !text.replace(patch.after, '').includes(patch.before)) return text;
  throw Error(`Patch ${patch.id} baseline differs; review before applying.`);
}
export function applyPatches(source, productSettings = productConfig) {
  if (!inside(root, fs.realpathSync(source))) throw Error('Patch source escaped ide.');
  const updates = new Map();
  for (const patch of patches) {
    const file = path.resolve(source, patch.file);
    if (!inside(source, fs.realpathSync(file))) throw Error('Patch file escaped source.');
    const update = updates.get(file) ?? { file, before: fs.readFileSync(file, 'utf8') };
    update.after = patchedText(update.after ?? update.before, patch);
    updates.set(file, update);
  }
  const productFile = path.join(source, 'product.json');
  if (!inside(source, fs.realpathSync(productFile))) throw Error('Product file escaped source.');
  const productBefore = fs.readFileSync(productFile, 'utf8');
  updates.set(productFile, { file: productFile, before: productBefore, after: productText(productBefore, productSettings) });
  for (const entry of sourceOverlay) {
    const origin = path.resolve(root, entry.source);
    const file = path.resolve(source, entry.target);
    if (!inside(root, fs.realpathSync(origin)) || !inside(source, file)) throw Error('Source overlay escaped ide.');
    let ancestor = file;
    while (!fs.existsSync(ancestor)) ancestor = path.dirname(ancestor);
    if (!inside(source, fs.realpathSync(ancestor))) throw Error('Source overlay destination escaped source.');
    const after = fs.readFileSync(origin, 'utf8');
    const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : undefined;
    const accepted = [entry.previousSha256, ...(entry.previousSha256s ?? [])];
    if (before !== undefined && before !== after && !accepted.includes(digest(before))) throw Error('Source overlay differs; review before applying.');
    updates.set(file, { file, before, after });
  }
  // Validate every anchor before making any change.
  for (const update of updates.values()) if (update.before !== update.after) {
    fs.mkdirSync(path.dirname(update.file), { recursive: true });
    fs.writeFileSync(update.file, update.after);
  }
}
