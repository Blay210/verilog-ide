// One-time migration of an unselected verified candidate built by the old copier.
// Preserve excluded files outside the app; never touch an installed/running app.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { root, inside } from './environment.mjs';
import { verifyInventory, inventoryFiles } from './release-payload.mjs';
import { hashFile } from './installer-payload.mjs';
const directory=fs.realpathSync(process.argv[2]);
if(path.dirname(directory)!==fs.realpathSync(path.join(root,'.dev'))||!/^pulse-bundled-/.test(path.basename(directory)))throw Error('Expected dedicated local candidate');
const selected=JSON.parse(fs.readFileSync(path.join(root,'.dev/latest-launch.json'),'utf8'));
if(path.dirname(selected.executable)===directory)throw Error('Do not modify the selected development app');
const file=path.join(directory,'.pulse-build.json'),receipt=JSON.parse(fs.readFileSync(file));
if(!receipt.passed||receipt.output!==directory||receipt.kind!=='local-bundled')throw Error('Expected completed candidate');
await verifyInventory(directory,receipt.files);
const removed=['debug-auto-launch','vscode-api-tests','vscode-test-resolver'].filter(name=>fs.existsSync(path.join(directory,'resources/app/extensions',name)));
const refreshBridge=process.argv[3]==='--refresh-semantic-bridge';
if(process.argv.length>(refreshBridge?4:3))throw Error('Unknown migration argument');
if(!removed.length&&!refreshBridge){console.log('No development extension payloads');process.exit(0);}
const archive=fs.mkdtempSync(path.join(root,'.dev/excluded-extensions-'));
receipt.passed=false;receipt.removedDevelopmentExtensions=removed;receipt.checks.push('Development-only extension payloads preserved outside the unselected candidate; final re-verification required');fs.writeFileSync(file,JSON.stringify(receipt,null,2)+'\n');
for(const name of removed){
 const original=fs.realpathSync(path.join(directory,'resources/app/extensions',name)),target=path.resolve(archive,name);
 if(!inside(directory,original)||path.dirname(original)!==fs.realpathSync(path.join(directory,'resources/app/extensions'))||!inside(archive,target)||fs.existsSync(target))throw Error('Extension move escaped checked boundaries');
 fs.renameSync(original,target);
}
if(refreshBridge){
 const app=path.join(directory,'resources/app'),source=fs.readFileSync(path.join(root,'language/python/analyze.py'));
 const language=path.join(app,'extensions/rtl-language/dist/analyze.py'),native=path.join(app,'out/vs/platform/rtl/node/analyze.py');
 const prepared=fs.readFileSync(path.join(root,'upstream/extensions/rtl-language/dist/analyze.py'));
 if(!source.equals(prepared)||!inside(directory,fs.realpathSync(language))||!inside(directory,fs.realpathSync(native))||!fs.readFileSync(native,'utf8').startsWith('# RTL IDE owned import semantic bridge\n'))throw Error('Unprepared semantic bridge');
 fs.writeFileSync(language,source);fs.writeFileSync(native,Buffer.concat([Buffer.from('# RTL IDE owned import semantic bridge\n'),source]));
 const files=[];for(const base of [path.join(app,'out'),path.join(app,'extensions/rtl-language')])for(const relative of inventoryFiles(base)){
  const file=path.join(base,relative);files.push({relative,size:fs.statSync(file).size,sha256:await hashFile(file)});
 }
 receipt.codeIdentity=createHash('sha256').update(JSON.stringify(files)).digest('hex');
 const productFile=path.join(app,'product.json'),product=JSON.parse(fs.readFileSync(productFile));product.commit=receipt.codeIdentity.slice(0,40);product.rtlLocalBuild=receipt.codeIdentity;
 fs.writeFileSync(productFile,JSON.stringify(product,null,'\t')+'\n');
 receipt.checks.push('Final bounded Windows package approval read present in both semantic bridges; code identity refreshed');
 fs.writeFileSync(file,JSON.stringify(receipt,null,2)+'\n');
}
console.log(JSON.stringify({directory,removed,archive,passed:false,next:'prepare-local-bundle --verify'}));
