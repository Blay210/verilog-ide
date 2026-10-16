import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root, inside } from './environment.mjs';

export function distributionNotices() {
  let text = fs.readFileSync(path.join(root,'runtime/LICENSE'),'utf8') + '\n';
  const visited = new Set();
  const read = file => JSON.parse(fs.readFileSync(file,'utf8'));
  function dependency(name, from=root) {
    const resolver = createRequire(path.join(from,'package.json'));
    let directory;
    try { directory = path.dirname(resolver.resolve(name+'/package.json')); }
    catch {
      directory = path.dirname(resolver.resolve(name));
      while (!fs.existsSync(path.join(directory,'package.json')) || read(path.join(directory,'package.json')).name !== name) {
        const parent=path.dirname(directory); if(parent===directory)throw Error('Dependency manifest missing: '+name); directory=parent;
      }
    }
    if(!inside(root,fs.realpathSync(directory)))throw Error('Notice dependency escaped IDE.');
    if(visited.has(directory))return;visited.add(directory);
    const manifest=read(path.join(directory,'package.json'));
    const files=fs.readdirSync(directory).filter(file=>/^(?:licen[sc]e|copying|notice)(?:\..*)?$/i.test(file)&&fs.statSync(path.join(directory,file)).isFile());
    if(!files.length)throw Error('Missing full license: '+name);
    text+=`\n--- ${manifest.name} ${manifest.version} (${manifest.license??'see notice'}) ---\n`;
    for(const file of files)text+=fs.readFileSync(path.join(directory,file),'utf8')+'\n';
    for(const child of Object.keys(manifest.dependencies??{}))dependency(child,directory);
  }
  for(const name of Object.keys(read(path.join(root,'package.json')).dependencies??{}))dependency(name);
  return {text, packages:visited.size};
}
