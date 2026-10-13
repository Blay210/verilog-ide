import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { root, inside } from './environment.mjs';
import { createIcon, createPng, iconSvg } from './icon.mjs';

export function prepareDesktopBranding(source, {packaged=false}={}) {
  const file=path.join(source,packaged?'resources/app/out/media/code-icon.svg':'src/vs/workbench/browser/media/code-icon.svg');
  const config=JSON.parse(fs.readFileSync(path.join(root,'config/branding.json'),'utf8'));
  const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
  if(!inside(root,fs.realpathSync(source))||!inside(source,fs.realpathSync(file)))throw Error('Desktop brand escaped owned source/package.');
  if(![config.upstreamDesktopSvgSha256,hash(iconSvg)].includes(hash(fs.readFileSync(file))))throw Error('Desktop icon is not the pinned upstream or owned Pulse asset.');
  fs.writeFileSync(file,iconSvg);
}

export function prepareBranding(source, { packaged = false } = {}) {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'config/branding.json'), 'utf8'));
  const directory = path.join(source, packaged ? 'resources/app/resources/win32' : 'resources/win32');
  const file = path.join(directory, 'code.ico');
  if (!inside(root, fs.realpathSync(source)) || !inside(source, fs.realpathSync(file))) throw Error('Brand resource escaped owned upstream.');
  const icon = createIcon();
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  const manifestFile=path.join(source,packaged?'Pulse.VisualElementsManifest.xml':'resources/win32/VisualElementsManifest.xml');
  const original=fs.readFileSync(manifestFile);
  const manifest=Buffer.from(original.toString('utf8').replace('ShortDisplayName="Code - OSS"','ShortDisplayName="Pulse"'));
  const updates=[
    [file,icon,config.upstreamWindowsIconSha256],
    [path.join(directory,'code_70x70.png'),createPng(70),config.upstreamWindowsTile70Sha256],
    [path.join(directory,'code_150x150.png'),createPng(150),config.upstreamWindowsTile150Sha256],
    [manifestFile,manifest,packaged?config.packagedVisualManifestSha256:config.upstreamVisualManifestSha256]
  ];
  for(const [target,bytes,baseline] of updates){
    if(!inside(source,fs.realpathSync(target)))throw Error('Brand resource escaped owned output.');
    const actual=fs.readFileSync(target), normalized=actual.toString('utf8').replace('ShortDisplayName="Pulse"','ShortDisplayName="Code - OSS"');
    const manifestOwned=target===manifestFile&&hash(Buffer.from(normalized))===baseline;
    if(![baseline,hash(bytes)].includes(hash(actual))||target===manifestFile&&!manifestOwned)throw Error('Windows icon differs from pinned upstream or owned Pulse artwork: '+target);
  }
  for(const [target,bytes] of updates)fs.writeFileSync(target,bytes);
  return { name: config.name, iconSha256: hash(icon), svg: iconSvg };
}
