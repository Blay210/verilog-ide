// Produce an installer from a verified current app. Never install or open UI.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { root, inside } from './environment.mjs';
import { hashFile } from './installer-payload.mjs';
import { copyVerifiedFiles, verifyReleaseCandidate, inventoryFiles, validateReleaseEvidence } from './release-payload.mjs';
import { distributionNotices } from './distribution-notices.mjs';
const require = createRequire(path.join(root,'upstream/package.json'));
if (process.platform !== 'win32' || process.arch !== 'x64' || ![2,4].includes(process.argv.length) || process.argv.length === 4 && process.argv[2] !== '--candidate') throw Error('Use build-installer.mjs [--candidate <verified local build>] on Windows x64.');
const version = JSON.parse(fs.readFileSync(path.join(root,'config/release.json'),'utf8'));
if (!/^\d+\.\d+\.\d+-beta\.\d{8}$/.test(version.version) || !/^\d+\.\d+\.\d+\.\d+$/.test(version.windowsVersion)
  || !/^Pulse-Setup-windows-x64-beta-\d{8}$/.test(version.setupBaseName) || version.displayName !== 'Pulse (beta)') throw Error('Invalid release metadata.');
const selected = process.argv.length === 4 ? process.argv[3] : path.dirname(JSON.parse(fs.readFileSync(path.join(root,'.dev/latest-launch.json'),'utf8')).executable);
const candidate = await verifyReleaseCandidate(path.resolve(selected));
const evidenceFile=path.join(root,'.dev/windows-integrated',`pulse-beta-${version.date.replaceAll('-','')}-validation.json`);
if(!inside(root,fs.realpathSync(evidenceFile)))throw Error('Validation evidence escaped IDE.');
const evidence=validateReleaseEvidence(JSON.parse(fs.readFileSync(evidenceFile,'utf8')),candidate.receipt.codeIdentity);
const release = path.join(root,'release'); fs.mkdirSync(release,{recursive:true});
if (!inside(root,fs.realpathSync(release))) throw Error('Release escaped IDE.');
const name=version.setupBaseName+'.exe',target=path.join(release,name),report=path.join(release,version.setupBaseName+'.manifest.json');
for (const file of [target,target+'.sha256',report]) if(fs.existsSync(file))throw Error('Preserve existing release: '+file);
const compiler=path.join(path.dirname(path.dirname(require.resolve('innosetup'))),'bin/ISCC.exe');
if(!inside(root,fs.realpathSync(compiler)))throw Error('Compiler escaped build dependencies.');
const stage=fs.mkdtempSync(path.join(root,'.dev/pulse-installer-')),payload=path.join(stage,'payload'),output=path.join(stage,'output');fs.mkdirSync(payload);fs.mkdirSync(output);
const receipt={passed:false,installed:false,screenVerified:false,published:false,stage,version:version.version,displayName:version.displayName,
  sourceCodeIdentity:candidate.receipt.codeIdentity,validation:evidence,checks:['Current code-bound native typecheck and automated regression passed','Current candidate full inventory/code identity/integrity verified','Development DOM/click commands, timing logs, fixtures/profiles/test extensions absent'],knownLimits:['Unsigned beta','Installer wizard, actual install/upgrade/uninstall and clean Windows not verified','Verilator/C++ and slang/Python require separate approval/install']};
try {
  console.log('Staging the verified current application; existing app and releases preserved.');
  await copyVerifiedFiles(candidate.directory,payload,candidate.receipt.files);
  const notices=distributionNotices();
  for(const [source,destination]of [['BETA.md','PULSE-README.md'],['CLI.md','CLI.md'],['PRODUCT_SCOPE.md','PRODUCT_SCOPE.md']])fs.copyFileSync(path.join(root,source),path.join(payload,destination),fs.constants.COPYFILE_EXCL);
  fs.writeFileSync(path.join(payload,'PULSE-NOTICES.txt'),notices.text,{flag:'wx'});
  fs.writeFileSync(path.join(payload,'PULSE-ACCEPTANCE.json'),JSON.stringify({date:version.date,version:version.version,sourceCodeIdentity:receipt.sourceCodeIdentity,
    scope:'Windows x64 beta. Automated/code checks and user feedback; no new installer/UI acceptance.',checks:receipt.checks,
    installed:false,screenVerified:false,automated:{nativeTypeErrors:evidence.nativeTypeErrors,tests:evidence.tests},knownLimits:receipt.knownLimits},null,2)+'\n',{flag:'wx'});
  receipt.noticePackages=notices.packages;
  const files=[];for(const relative of inventoryFiles(payload)){const file=path.join(payload,relative);files.push({relative,size:fs.statSync(file).size,sha256:await hashFile(file)});}
  fs.writeFileSync(path.join(stage,'payload-inventory.json'),JSON.stringify(files,null,2)+'\n');
  const config=JSON.parse(fs.readFileSync(path.join(root,'config/product.json'),'utf8')).values;
  if(!/^\{\{[A-F0-9-]+\}$/.test(config.win32x64UserAppId))throw Error('Invalid installer identity.');
  const script=path.join(root,'installer/pulse.iss'),log=fs.openSync(path.join(stage,'compile.log'),'w');
  try {
    console.log('Compiling Pulse (beta) user installer with existing Inno Setup.');
    receipt.compileCode=await new Promise((resolve,reject)=>{
      const child=spawn(compiler,['/Qp',script,`/dPayloadDir=${payload}`,`/dOutputDir=${output}`,`/dUserAppId=${config.win32x64UserAppId}`,
        `/dProductVersion=${version.version}`,`/dWindowsVersion=${version.windowsVersion}`,`/dSetupBaseName=${version.setupBaseName}`],{windowsHide:true,stdio:['ignore',log,log]});
      child.once('error',reject);child.once('exit',resolve);
    });
  } finally {fs.closeSync(log);}
  if(receipt.compileCode!==0)throw Error('Installer compile failed; see '+path.join(stage,'compile.log'));
  const built=path.join(output,name),fd=fs.openSync(built,'r'),head=Buffer.alloc(64);
  try {fs.readSync(fd,head);if(head.toString('ascii',0,2)!=='MZ')throw Error('Missing PE header');const signature=Buffer.alloc(4);fs.readSync(fd,signature,0,4,head.readUInt32LE(60));if(!signature.equals(Buffer.from([80,69,0,0])))throw Error('Invalid PE executable');}finally{fs.closeSync(fd);}
  if(inventoryFiles(payload).length!==files.length)throw Error('Staged payload membership changed.');
  for(const file of files)if(fs.statSync(path.join(payload,file.relative)).size!==file.size||await hashFile(path.join(payload,file.relative))!==file.sha256)throw Error('Staged payload changed during compile.');
  receipt.checks.push('Inno Setup compile exit0; PE executable; all staged payload hashes unchanged');
  receipt.sha256=await hashFile(built);receipt.bytes=fs.statSync(built).size;receipt.payloadEntries=files.length;
  receipt.compilerVersion=require('innosetup/package.json').version;receipt.compilerSha256=await hashFile(compiler);receipt.scriptSha256=await hashFile(script);
  if(fs.existsSync(target))throw Error('Setup destination appeared during compile.');
  fs.copyFileSync(built,target,fs.constants.COPYFILE_EXCL);
  if(await hashFile(target)!==receipt.sha256)throw Error('Setup differs from compiler output.');
  fs.writeFileSync(target+'.sha256',`${receipt.sha256}  ${name}\n`,{flag:'wx'});
  receipt.file=name;receipt.passed=true;
  console.log(JSON.stringify({file:target,bytes:receipt.bytes,sha256:receipt.sha256,payloadEntries:files.length,displayName:receipt.displayName}));
}catch(error){receipt.error=String(error);process.exitCode=1;console.error(error);}
finally{
  fs.writeFileSync(path.join(stage,'installer-manifest.json'),JSON.stringify(receipt,null,2)+'\n');
  if(receipt.passed){
    fs.writeFileSync(report,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
    fs.writeFileSync(path.join(release,'latest-installer.json'),JSON.stringify({version:receipt.version,file:receipt.file,displayName:receipt.displayName,bytes:receipt.bytes,sha256:receipt.sha256,manifest:path.basename(report)},null,2)+'\n');
  }
}
