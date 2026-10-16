import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { root, inside, inspect, validateSource } from './environment.mjs';
import { prepareRuntime } from './prepare-runtime.mjs';
import { prepareLanguage } from './prepare-language.mjs';
import { prepareBranding, prepareDesktopBranding } from './prepare-branding.mjs';
import { prepareCliLauncher } from './prepare-cli-launcher.mjs';

// Local, unsigned Windows beta preparation. Never installs or publishes.
const mode=process.argv.slice(2).join(' ');
if (!['--build','--finish','--refresh','--resume-refresh'].includes(mode)) throw Error('Use --build, --finish, --refresh, or --resume-refresh after the process guard alone interrupted a completed refresh bundle.');
const source=path.join(root,'upstream'), output=path.join(root,'VSCode-win32-x64');
const product=JSON.parse(fs.readFileSync(path.join(root,'config/product.json'),'utf8')).values;
if(mode==='--finish'&&JSON.parse(fs.readFileSync(path.join(output,'resources/app/product.json'),'utf8')).nameShort!==product.nameShort)throw Error('Existing package predates current branding. Preserve it and build a new candidate.');
if (!inside(root,output) || (mode==='--build'&&fs.existsSync(output))) throw Error('Output must be a new directory inside ide; review existing output before retrying.');
const previousReceipt=mode!=='--build'?JSON.parse(fs.readFileSync(path.join(root,'.dev/windows-integrated/beta-receipt.json'),'utf8')):undefined;
if(mode==='--refresh') {
 const inventory=JSON.parse(fs.readFileSync(path.join(root,'.dev/windows-integrated/beta-inventory.json'),'utf8'));
 if(!previousReceipt.passed||previousReceipt.output!==output||!inventory.passed||!inside(root,fs.realpathSync(output)))throw Error('Refresh requires a completed validated owned package.');
 for(const file of inventory.files)if(createHash('sha256').update(fs.readFileSync(path.join(output,file.relative))).digest('hex')!==file.sha256)throw Error('Validated package changed: '+file.relative);
}
if(mode==='--resume-refresh') {
 const inventory=JSON.parse(fs.readFileSync(path.join(root,'.dev/windows-integrated/beta-inventory.json'),'utf8'));
 const appProduct=JSON.parse(fs.readFileSync(path.join(output,'resources/app/product.json'),'utf8'));
 const log=fs.readFileSync(path.join(root,'.dev/windows-integrated/beta-esbuild-bundle-win32-x64.log'),'utf8');
 if(previousReceipt.passed||previousReceipt.error!=='Error: A Pulse process is running or cannot be checked; preserve it before refreshing.'||previousReceipt.codeBackup||previousReceipt.output!==output||previousReceipt.tasks.length!==1||previousReceipt.tasks[0].name!=='esbuild-bundle-win32-x64'||previousReceipt.tasks[0].code!==0||!previousReceipt.previous?.passed||previousReceipt.previous.output!==output||inventory.passed||inventory.reason!=='Code refresh in progress; revalidate after completion'||appProduct.nameShort!==product.nameShort||appProduct.applicationName!=='rtl-ide'||!inside(root,fs.realpathSync(output))||!log.includes('(25 bundles)'))throw Error('No completed owned refresh interrupted solely before directory exchange.');
}
let ownedPartial=previousReceipt;
for(let depth=0;ownedPartial&&depth<16;depth++) {
 if(ownedPartial.output===output&&ownedPartial.tasks.some(t=>t.name==='esbuild-bundle-win32-x64'&&t.code===0)&&ownedPartial.tasks.some(t=>t.name==='vscode-win32-x64-ci'&&t.code===1))break;
 ownedPartial=ownedPartial.previous;
}
if(mode==='--finish'&&(!ownedPartial||!fs.existsSync(output)||!inside(root,fs.realpathSync(output))||previousReceipt.output!==output))throw Error('No matching owned partial distribution to finish.');
if (!inspect().ready) throw Error('Existing Windows build environment is not ready.');
validateSource(source);
const patchesFile=path.join(root,'config/patches.json');
const patches=JSON.parse(fs.readFileSync(patchesFile,'utf8'));
const assetAnchor='const desktopResourcePatterns = [';
const extensionAnchor="\t\tconst extensions = gulp.src(['.build/extensions/**', ...platformSpecificBuiltInExtensionsExclusions], { base: '.build', dot: true });";
const additions=[
 {id:'rtl-distribution-assets',file:'build/next/resources.ts',before:assetAnchor,after:assetAnchor+"\n\t'vs/platform/rtl/node/{waveform-worker.cjs,waveform.html,analyze.py}',"},
 {id:'rtl-distribution-excludes',file:'build/gulpfile.vscode.ts',before:extensionAnchor,after:"\t\tconst rtlExcludes = product.applicationName === 'rtl-ide' ? ['!.build/extensions/copilot/**', '!.build/extensions/github-authentication/**', '!.build/extensions/microsoft-authentication/**'] : [];\n\t\tconst extensions = gulp.src(['.build/extensions/**', ...platformSpecificBuiltInExtensionsExclusions, ...rtlExcludes], { base: '.build', dot: true });"},
 {id:'rtl-distribution-cli-asset',file:'build/next/resources.ts',before:"\t'vs/platform/rtl/node/{waveform-worker.cjs,waveform.html,analyze.py}',",after:"\t'vs/platform/rtl/node/{waveform-worker.cjs,waveform.html,analyze.py}',\n\t'vs/platform/rtl/node/rtl-cli.cjs',"},
 {id:'rtl-distribution-skip-copilot-shim',file:'build/gulpfile.vscode.ts',before:"\t\tconst builtInCopilotExtensionDir = path.join(appBase, 'extensions', 'copilot');",after:"\t\tif (product.applicationName === 'rtl-ide') { return; }\n\t\tconst builtInCopilotExtensionDir = path.join(appBase, 'extensions', 'copilot');"},
 {id:'rtl-distribution-finish-task',file:'build/gulpfile.vscode.ts',before:'const buildRoot = path.dirname(root);',after:"task.task(task.define('rtl-win32-x64-finish-beta', task.series(patchWin32DependenciesTask('VSCode-win32-x64'))));\n\nconst buildRoot = path.dirname(root);"}
];
for(const patch of additions) if(!patches.some(p=>p.id===patch.id)) {
 const text=fs.readFileSync(path.join(source,patch.file),'utf8');
 if(text.split(patch.before).length!==2) throw Error('Distribution baseline differs: '+patch.id);
 patches.push(patch);
}
fs.writeFileSync(patchesFile,JSON.stringify(patches,null,2)+'\n');
// Import after recording the reviewed anchors; patches.mjs loads once per process.
const {applyPatches}=await import('./patches.mjs'); applyPatches(source);
prepareBranding(source);
prepareDesktopBranding(source);
await prepareRuntime(source,{sourceBuild:true}); await prepareLanguage(source);
const reportDir=path.join(root,'.dev/windows-integrated');fs.mkdirSync(reportDir,{recursive:true});
const receipt={passed:false,scope:'Local Windows beta build only, no packaged-app smoke/ZIP/install/publication',tasks:[],output};
async function task(name) {
 const log=fs.openSync(path.join(reportDir,'beta-'+name+'.log'),'w');
 const npmCli=path.join(path.dirname(fs.realpathSync(process.execPath)),'node_modules/npm/bin/npm-cli.js');
 const env={...process.env,GIT_CEILING_DIRECTORIES:root};
 if(process.env.RTL_IDE_SIGNTOOL_DIRECTORY){
  const key=Object.keys(env).find(k=>k.toUpperCase()==='PATH')??'Path';
  env[key]=[path.dirname(process.execPath),process.env.RTL_IDE_SIGNTOOL_DIRECTORY,env[key]??''].join(path.delimiter);
 }
 for(const key of ['GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','NODE_PATH'])delete env[key];
 if(inspect().python){env.NODE_GYP_FORCE_PYTHON=inspect().python;env.npm_config_python=inspect().python;}
 try {
  // The upstream esbuild subtask is defined inside vscodeTask but is not
  // registered as a standalone gulp task. Invoke its official CLI directly.
  const args=name==='esbuild-bundle-win32-x64'
    ? ['build/next/index.ts','bundle','--out','out-vscode','--target','desktop','--nls']
    : [npmCli,'run','gulp','--',name];
  const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{cwd:source,env,stdio:['ignore',log,log],windowsHide:true});child.once('error',reject);child.once('exit',resolve);});
  receipt.tasks.push({name,code});fs.writeFileSync(path.join(reportDir,'beta-receipt.json'),JSON.stringify(receipt,null,2));
  if(code!==0)throw Error('Official task failed: '+name+' (see beta task log)');
 } finally {fs.closeSync(log);}
}
try {
 if(mode==='--refresh'||mode==='--resume-refresh') {
  receipt.previous=previousReceipt;
  fs.writeFileSync(path.join(reportDir,'beta-receipt.json'),JSON.stringify(receipt,null,2));
  fs.writeFileSync(path.join(reportDir,'beta-inventory.json'),JSON.stringify({passed:false,reason:'Code refresh in progress; revalidate after completion'}));
  if(mode==='--refresh') await task('esbuild-bundle-win32-x64');
  else receipt.tasks.push(...previousReceipt.tasks);
  // Keep executable/native dependencies unchanged. No running package may use
  // an output while we exchange complete, freshly built code directories.
  const probe=spawnSync('powershell.exe',['-NoProfile','-Command',"if(Get-CimInstance Win32_Process -Filter \"Name = 'Pulse.exe'\"){exit 1}"],{windowsHide:true,timeout:15000});
  if(probe.error||probe.status!==0)throw Error('A Pulse process is running or cannot be checked; preserve it before refreshing.');
  const stage=fs.mkdtempSync(path.join(reportDir,'code-refresh-'));
  const copy=(from,to)=>fs.cpSync(from,to,{recursive:true,filter:file=>{if(fs.lstatSync(file).isSymbolicLink())throw Error('Linked build input: '+file);return true;}});
  copy(path.join(source,'out-vscode'),path.join(stage,'new-out'));
  copy(path.join(source,'extensions/rtl-language'),path.join(stage,'new-language'));
  const swap=(name,destination)=>{
   if(!inside(output,fs.realpathSync(destination))||!inside(root,fs.realpathSync(stage)))throw Error('Code refresh escaped owned package.');
   const saved=path.join(stage,'old-'+name),fresh=path.join(stage,'new-'+name);
   fs.renameSync(destination,saved);
   try{fs.renameSync(fresh,destination);}catch(error){fs.renameSync(saved,destination);throw error;}
  };
  swap('out',path.join(output,'resources/app/out'));
  swap('language',path.join(output,'resources/app/extensions/rtl-language'));
  prepareBranding(output,{packaged:true}); prepareDesktopBranding(output,{packaged:true});
  const { refreshPackageIntegrity } = await import('./package-integrity.mjs');
  receipt.integrityFiles = refreshPackageIntegrity(path.join(output,'resources/app'));
  prepareCliLauncher(output); receipt.passed=true; receipt.codeBackup=stage;
 } else if(mode==='--finish') {
  receipt.previous=previousReceipt; await task('rtl-win32-x64-finish-beta'); prepareCliLauncher(output); receipt.passed=true;
 } else {
 // Reuse the completed official non-native extension preparation from the first
 // build; do not repeat its unused Copilot packaging step. Fail if absent.
 if(!fs.existsSync(path.join(source,'.build/extensions/json/package.json')))throw Error('Prepare official non-native extensions before this continuation.');
 await task('copy-codicons');
 await task('compile-extension-media-build');
 await task('esbuild-bundle-win32-x64');
 if(fs.existsSync(output)||!inside(fs.realpathSync(root),path.resolve(output)))throw Error('Distribution output appeared or escaped during build; preserve it for review.');
 await task('vscode-win32-x64-ci');
 prepareBranding(output,{packaged:true}); prepareDesktopBranding(output,{packaged:true}); prepareCliLauncher(output); receipt.passed=true;
 }
} catch(error){receipt.error=String(error);throw error;}
finally {fs.writeFileSync(path.join(reportDir,'beta-receipt.json'),JSON.stringify(receipt,null,2));}
