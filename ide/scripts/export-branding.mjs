// Deterministic previews from the same original vector geometry as the app ICO.
import fs from 'node:fs';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { root } from './environment.mjs';
import { iconSvg, createIcon } from './icon.mjs';
const directory = path.join(root, 'assets/branding');
fs.mkdirSync(directory, { recursive: true });
const icon = createIcon();
fs.writeFileSync(path.join(directory, 'pulse.svg'), iconSvg);
fs.writeFileSync(path.join(directory, 'pulse.ico'), icon);
const entry = 6 + 16 * 4, offset = icon.readUInt32LE(entry + 12), size = 256;
const pixels = Buffer.alloc(size * (1 + size * 4));
for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
  const source = offset + 40 + ((size - 1 - y) * size + x) * 4;
  const target = y * (1 + size * 4) + 1 + x * 4;
  pixels.set([icon[source + 2], icon[source + 1], icon[source], icon[source + 3]], target);
}
function chunk(name, body) {
  const type = Buffer.from(name), data = Buffer.concat([type, body]);
  let crc = 0xffffffff;
  for (const byte of data) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  const header = Buffer.alloc(4), footer = Buffer.alloc(4);
  header.writeUInt32BE(body.length); footer.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([header, data, footer]);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(size); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 6;
fs.writeFileSync(path.join(directory, 'pulse.png'), Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))
]));
console.log('Exported Pulse SVG, multi-resolution ICO and PNG preview.');
