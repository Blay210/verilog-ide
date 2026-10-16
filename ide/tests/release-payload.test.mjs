import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root } from '../scripts/environment.mjs';
import { hashFile } from '../scripts/installer-payload.mjs';
import { auditReleaseNames, verifyInventory, copyVerifiedFiles, validateReleaseEvidence } from '../scripts/release-payload.mjs';
import { distributionNotices } from '../scripts/distribution-notices.mjs';
function fixture(t){const directory=fs.mkdtempSync(path.join(root,'.dev/release-test-'));t.after(()=>{assert.equal(path.dirname(directory),path.join(root,'.dev'));assert.ok(path.basename(directory).startsWith('release-test-'));fs.rmSync(directory,{recursive:true,force:true});});const source=path.join(directory,'source'),payload=path.join(directory,'payload');fs.mkdirSync(source);fs.mkdirSync(payload);return {source,payload};}
async function entry(source,relative,content){const file=path.join(source,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content);return{relative,size:fs.statSync(file).size,sha256:await hashFile(file)};}

test('release excludes project fixtures, private profiles, verification extensions and build receipts',()=>{
 auditReleaseNames(['Pulse.exe','resources/app/node_modules/library/index.js','resources/app/extensions/rtl-language/dist/server.cjs']);
 for(const name of ['tests/native/run.cjs','fixtures/code.sv','data/profile/settings.json','.dev/token','node_modules/private/index.js','.pulse-build.json',
  'resources/app/extensions/rtl-verification/test.cjs','resources/app/extensions/debug-auto-launch/package.json','resources/app/extensions/vscode-api-tests/package.json','resources/app/extensions/vscode-test-resolver/package.json','resources/app/extensions/copilot/package.json'])assert.throws(()=>auditReleaseNames([name]),/Development\/private/,name);
});

test('release evidence belongs to this code and requires actual successful types and tests',()=>{
 const evidence={passed:true,sourceCodeIdentity:'current',nativeTypeErrors:0,tests:{passed:430,failed:0,skipped:1}};
 assert.equal(validateReleaseEvidence(evidence,'current'),evidence);
 for(const invalid of [{...evidence,sourceCodeIdentity:'old'},{...evidence,passed:false},{...evidence,nativeTypeErrors:1},{...evidence,tests:{passed:0,failed:0}},{...evidence,tests:{passed:430,failed:1}},{...evidence,tests:{passed:430,failed:0,cancelled:1}}])assert.throws(()=>validateReleaseEvidence(invalid,'current'),/code-bound/);
});

test('verified staging preserves all source bytes including Korean names and rejects unexpected files',async t=>{
 const {source,payload}=fixture(t),files=[await entry(source,'Pulse.exe','MZ bytes'),await entry(source,'docs/한글 안내.txt','사용 안내\n')];
 fs.writeFileSync(path.join(source,'.pulse-build.json'),'private receipt excluded from payload');
 await copyVerifiedFiles(source,payload,files);
 for(const file of files){assert.equal(await hashFile(path.join(payload,file.relative)),file.sha256);assert.equal(await hashFile(path.join(source,file.relative)),file.sha256);}
 assert.equal(fs.existsSync(path.join(payload,'.pulse-build.json')),false);
 fs.writeFileSync(path.join(source,'extra'),'unexpected');await assert.rejects(verifyInventory(source,files),/Unlisted/);
});

test('modified bytes, wrong sizes, duplicate aliases, traversal and nonempty staging fail before replacement',async t=>{
 const {source,payload}=fixture(t),file=await entry(source,'Pulse.exe','original');
 await assert.rejects(verifyInventory(source,[{...file,size:999}]),/differs/);
 await assert.rejects(verifyInventory(source,[file,{...file,relative:'pulse.EXE'}]),/Duplicate/);
 await assert.rejects(verifyInventory(source,[{...file,relative:'../Pulse.exe'}]),/Unsafe/);
 fs.writeFileSync(path.join(payload,'keep'),'keep');await assert.rejects(copyVerifiedFiles(source,payload,[file]),/empty/);assert.equal(fs.readFileSync(path.join(payload,'keep'),'utf8'),'keep');
 fs.writeFileSync(path.join(source,'Pulse.exe'),'changed!');await assert.rejects(verifyInventory(source,[file]),/differs/);
});

test('installer has the requested display name and retains identity, per-user path and non-destructive removal',()=>{
 const text=fs.readFileSync(path.join(root,'installer/pulse.iss'),'utf8'),config=JSON.parse(fs.readFileSync(path.join(root,'config/release.json')));
 assert.equal(config.displayName,'Pulse (beta)');assert.match(text,/UninstallDisplayName=Pulse \(beta\)/);assert.doesNotMatch(text,/Study Beta/i);
 assert.match(text,/AppId=\{#UserAppId\}/);assert.match(text,/PrivilegesRequired=lowest/);assert.match(text,/DefaultDirName=\{localappdata\}\\Programs\\Pulse/);
 assert.doesNotMatch(text,/^\[UninstallDelete\]|^\[Registry\]/m);assert.match(text,/CloseApplications=no/);
 assert.match(text,/OutputBaseFilename=\{#SetupBaseName\}/);
});

test('distribution notices include every runtime dependency, including zod and language document support',()=>{
 const notices=distributionNotices();assert.ok(notices.packages>=29);
 const dependencies=Object.keys(JSON.parse(fs.readFileSync(path.join(root,'package.json'))).dependencies);
 for(const name of dependencies)assert.ok(notices.text.includes('--- '+name+' '),name);
});
