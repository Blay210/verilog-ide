import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { inside, root } from './environment.mjs';
import { productConfig } from './patches.mjs';
import { createIcon, iconSvg } from './icon.mjs';

// Keep official/running executables intact. Brand a fingerprinted development
// copy in the runtime directory so Electron can resolve its adjacent resources.
export async function prepareDevelopmentExecutable(source, editResources) {
  source = path.resolve(source);
  const runtime = path.join(source, '.build/electron');
  if (!fs.existsSync(runtime)) throw Error('Development runtime is missing.');
  if (!inside(root, fs.realpathSync(runtime))) throw Error('Runtime directory escaped ide.');
  const expected = fs.readFileSync(path.join(source, '.npmrc'), 'utf8').match(/^target="([^"]+)"/m)?.[1];
  const actual = fs.readFileSync(path.join(runtime, 'version'), 'utf8').trim().replace(/^v/, '');
  if (!expected || actual !== expected) throw Error('Cached runtime version differs; prepare the pinned Electron before launching.');
  const base = ['Code - OSS.exe', `${productConfig.values.nameShort}.exe`, 'RTL IDE.exe'].map(name=>path.join(runtime,name)).find(file=>fs.existsSync(file));
  if (!base) throw Error('Official development executable is missing.');
  if (!inside(runtime, fs.realpathSync(base))) throw Error('Runtime executable escaped its directory.');
  const digest = data => createHash('sha256').update(data).digest('hex');
  const icon = createIcon();
  const metadata = { ProductName: productConfig.values.nameShort, FileDescription: productConfig.values.nameLong, CompanyName: 'RTL IDE contributors', InternalName: 'rtl-ide' };
  const fingerprint = digest(Buffer.concat([fs.readFileSync(base), icon, Buffer.from(JSON.stringify(metadata))]));
  const target = path.join(runtime, `${productConfig.values.nameShort} Dev-${fingerprint.slice(0,16)}.exe`);
  const receiptFile = `${target}.json`;
  if (fs.existsSync(target)) {
    if (!inside(runtime, fs.realpathSync(target)) || !inside(runtime, fs.realpathSync(receiptFile))) throw Error('Branded executable escaped runtime.');
    const receipt = JSON.parse(fs.readFileSync(receiptFile,'utf8'));
    if (receipt.fingerprint !== fingerprint || receipt.sha256 !== digest(fs.readFileSync(target))) throw Error('Branded executable cache differs; review before launching.');
    return target;
  }
  if (!editResources) {
    const require = createRequire(path.join(source, 'package.json'));
    const editor = require('rcedit'); // upstream pinned MIT tool; no new installation
    editResources = (file,options) => new Promise((resolve,reject)=>editor(file,options,error=>error?reject(error):resolve()));
  }
  const iconFile = path.join(runtime,'rtl-ide-dev.ico');
  for (const file of [iconFile,path.join(runtime,'rtl-ide-dev.svg')]) {
    if (fs.existsSync(file) && !inside(runtime,fs.realpathSync(file))) throw Error('Brand asset escaped runtime.');
  }
  fs.writeFileSync(iconFile,icon);
  fs.writeFileSync(path.join(runtime,'rtl-ide-dev.svg'),iconSvg);
  const staging = path.join(runtime,`rtl-brand-${randomUUID()}.exe`);
  fs.copyFileSync(base,staging,fs.constants.COPYFILE_EXCL);
  try {
    await editResources(staging,{icon:iconFile,'version-string':metadata});
    if (!inside(runtime,fs.realpathSync(staging))) throw Error('Staged executable escaped runtime.');
    const receipt = {fingerprint,sha256:digest(fs.readFileSync(staging)),base,version:actual,metadata,iconSha256:digest(icon)};
    // Move only our unique staged file; preserve official/other running apps.
    fs.renameSync(staging,target);
    fs.writeFileSync(receiptFile,JSON.stringify(receipt,null,2));
  } catch(error) {
    if (fs.existsSync(staging) && inside(runtime,fs.realpathSync(staging))) fs.unlinkSync(staging);
    throw error;
  }
  return target;
}
