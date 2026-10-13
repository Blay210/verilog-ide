import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { pipeline } from 'node:stream/promises';
import { root, inside } from './environment.mjs';
const require = createRequire(path.join(root, 'upstream/package.json'));
const yauzl = require('yauzl');
export async function hashFile(file) {
  const hash = createHash('sha256');
  for await (const bytes of fs.createReadStream(file)) hash.update(bytes);
  return hash.digest('hex');
}
export function payloadTarget(directory, name, seen) {
  const parts = name.split('/');
  if (!name || /[\\:\x00-\x1f]/.test(name) || parts.some(p => !p || p === '.' || p === '..' || /[. ]$/.test(p) || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p))) throw Error('Unsafe installer payload name: ' + name);
  const key = name.toLowerCase();
  if (seen.has(key)) throw Error('Duplicate Windows payload path: ' + name);
  const file = path.resolve(directory, ...parts);
  if (!inside(directory, file)) throw Error('Payload escaped staging directory.');
  seen.add(key); return file;
}
export async function extractPayload(archive, directory, expectedCount) {
  if (!inside(root, fs.realpathSync(directory))) throw Error('Installer stage escaped ide.');
  const seen = new Set(), files = [];
  await new Promise((resolve, reject) => yauzl.open(archive, { lazyEntries: true }, (error, reader) => {
    if (error) return reject(error);
    const fail = error => { reader.close(); reject(error); };
    reader.on('error', fail);
    reader.on('end', () => files.length === expectedCount ? resolve() : reject(Error('Installer payload count differs from verified ZIP.')));
    reader.on('entry', entry => {
      let destination;
      try {
        if (((entry.externalFileAttributes >>> 16) & 0o170000) === 0o120000) throw Error('Linked installer input.');
        destination = payloadTarget(directory, entry.fileName, seen);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
      } catch (error) { return fail(error); }
      reader.openReadStream(entry, async (error, input) => {
        if (error) return fail(error);
        try {
          await pipeline(input, fs.createWriteStream(destination, { flags: 'wx' }));
          if (fs.statSync(destination).size !== entry.uncompressedSize) throw Error('Extracted payload size differs.');
          files.push({ name: entry.fileName, bytes: entry.uncompressedSize, sha256: await hashFile(destination) });
          reader.readEntry();
        } catch (error) { fail(error); }
      });
    }); reader.readEntry();
  }));
  return files;
}
