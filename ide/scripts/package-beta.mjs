// Local study distribution only. No installation, upload or release publishing.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { root, inside } from './environment.mjs';
const require = createRequire(path.join(root, 'upstream/package.json'));
const { ZipFile } = require('yazl'), yauzl = require('yauzl');
const output = path.join(root, 'VSCode-win32-x64'), reports = path.join(root, '.dev/windows-integrated');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
// Full notices for our bundled dependency closure, alongside upstream notices.
let notices = fs.readFileSync(path.join(root, 'runtime/LICENSE'), 'utf8') + '\n';
const visited = new Set();
function dependency(name, from = root) {
  const resolver = createRequire(path.join(from, 'package.json'));
  let directory;
  try { directory = path.dirname(resolver.resolve(name + '/package.json')); }
  catch {
    directory = path.dirname(resolver.resolve(name));
    while (!fs.existsSync(path.join(directory, 'package.json')) || readJson(path.join(directory, 'package.json')).name !== name) {
      const parent = path.dirname(directory); if (parent === directory) throw Error('Dependency manifest missing: ' + name); directory = parent;
    }
  }
  if (!inside(root, fs.realpathSync(directory))) throw Error('Notice dependency escaped IDE: ' + name);
  if (visited.has(directory)) return; visited.add(directory);
  const manifest = readJson(path.join(directory, 'package.json'));
  const licenses = fs.readdirSync(directory).filter(file => /^(?:licen[sc]e|copying|notice)(?:\..*)?$/i.test(file) && fs.statSync(path.join(directory, file)).isFile());
  if (!licenses.length) throw Error('Missing full license notice: ' + name);
  notices += `\n--- ${manifest.name} ${manifest.version} (${manifest.license ?? 'see notice'}) ---\n`;
  for (const file of licenses) notices += fs.readFileSync(path.join(directory, file), 'utf8') + '\n';
  for (const child of Object.keys(manifest.dependencies ?? {})) dependency(child, directory);
}
for (const name of ['fast-glob', 'smol-toml', 'vscode-languageclient', 'vscode-languageserver']) dependency(name);
if (process.argv[2] === '--check-notices') { console.log(JSON.stringify({packages: visited.size, noticeBytes: Buffer.byteLength(notices)})); process.exit(0); }

const inventory = readJson(path.join(reports, 'beta-inventory.json'));
const acceptance = readJson(path.join(reports, 'pulse-package-acceptance.json'));
const product = readJson(path.join(output, 'resources/app/product.json'));
if (!inventory.passed || !acceptance.passed || !acceptance.normalExit || product.nameShort !== 'Pulse') throw Error('Current packaged inventory, physical/native acceptance and normal exit required.');
if (acceptance.executableSha256 !== inventory.files.find(file => file.relative === 'Pulse.exe')?.sha256) throw Error('Acceptance belongs to a different executable.');
if (acceptance.inventorySha256 !== createHash('sha256').update(fs.readFileSync(path.join(reports,'beta-inventory.json'))).digest('hex')) throw Error('Acceptance belongs to a different code/resource inventory.');
if (!inside(root, fs.realpathSync(output))) throw Error('Distribution escaped IDE.');
const release = path.join(root, 'release'), archive = path.join(release, 'Pulse-windows-x64-beta-20261014.zip');
const partial = archive + '.partial';
fs.mkdirSync(release, { recursive: true });
if (!inside(root, fs.realpathSync(release)) || fs.existsSync(archive) || fs.existsSync(partial)) throw Error('Release directory escaped IDE or archive/partial already exists. Preserve existing artifacts.');
for (const file of inventory.files) {
  const hash = createHash('sha256').update(fs.readFileSync(path.join(output, file.relative))).digest('hex');
  if (hash !== file.sha256) throw Error('Validated resource changed before packaging: ' + file.relative);
}

const userGuide = fs.readFileSync(path.join(root, 'BETA.md'), 'utf8');
const files = [];
async function collect(directory) {
  for (const entry of await fsp.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    const stat = await fsp.lstat(file);
    if (stat.isSymbolicLink() || !inside(output, await fsp.realpath(file))) throw Error('Linked/escaped distribution file: ' + file);
    if (stat.isDirectory()) await collect(file);
    else if (stat.isFile()) files.push({ file, name: path.relative(output, file).split(path.sep).join('/'), size: stat.size });
    else throw Error('Unsupported distribution entry: ' + file);
  }
}
await collect(output); files.sort((a, b) => a.name.localeCompare(b.name, 'en'));
const zip = new ZipFile();
const stream = fs.createWriteStream(partial, { flags: 'wx' });
const finished = pipeline(zip.outputStream, stream);
for (const item of files) zip.addFile(item.file, item.name);
const extras = new Map([
  ['PULSE-README.md', Buffer.from(userGuide)],
  ['PULSE-NOTICES.txt', Buffer.from(notices)],
  ['PULSE-ACCEPTANCE.json', Buffer.from(JSON.stringify({ date: '2026-10-14 KST', baseline: inventory.version, scope: 'Windows x64 study internal beta; not clean-Windows or stable/public acceptance', checks: acceptance.checks, knownLimits: acceptance.knownLimits }, null, 2))]
]);
for (const [name, bytes] of extras) zip.addBuffer(bytes, name);
zip.end(); await finished;
const expected = new Map(files.map(item => [item.name, item]));
for (const [name, bytes] of extras) expected.set(name, { size: bytes.length, bytes });
const digestFile = async file => { const hash = createHash('sha256'); for await (const chunk of fs.createReadStream(file)) hash.update(chunk); return hash.digest('hex'); };

// Read every entry back, including decompression and source hash comparison.
await new Promise((resolve, reject) => yauzl.open(partial, { lazyEntries: true }, (error, reader) => {
  if (error) return reject(error);
  reader.on('error', reject); reader.on('end', () => expected.size ? reject(Error('ZIP entries missing')) : resolve());
  reader.on('entry', entry => {
    const original = expected.get(entry.fileName);
    if (!original || entry.uncompressedSize !== original.size) { reader.close(); return reject(Error('Unexpected ZIP entry: ' + entry.fileName)); }
    reader.openReadStream(entry, async (error, input) => {
      if (error) { reader.close(); return reject(error); }
      try {
        const hash = createHash('sha256'); for await (const chunk of input) hash.update(chunk);
        const source = original.bytes ? createHash('sha256').update(original.bytes).digest('hex') : await digestFile(original.file);
        if (hash.digest('hex') !== source) throw Error('ZIP/source differs: ' + entry.fileName);
        expected.delete(entry.fileName); reader.readEntry();
      } catch (error) { reader.close(); reject(error); }
    });
  }); reader.readEntry();
}));
const sha256 = await digestFile(partial);
fs.renameSync(partial, archive);
fs.writeFileSync(archive + '.sha256', `${sha256}  ${path.basename(archive)}\n`);
const manifest = { name: 'Pulse', kind: 'study-internal-beta', platform: 'win32-x64', baseline: inventory.version, archive: path.basename(archive), bytes: fs.statSync(archive).size, sha256, verifiedEntries: files.length + extras.size, packagedAcceptance: acceptance, published: false };
fs.writeFileSync(path.join(release, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ archive, sha256, bytes: manifest.bytes, verifiedEntries: manifest.verifiedEntries }, null, 2));
