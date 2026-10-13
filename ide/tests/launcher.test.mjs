import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root } from '../scripts/environment.mjs';
import { prepareDevelopmentExecutable } from '../scripts/launcher.mjs';

test('branded cache preserves originals and always validates Electron and cached executable', async () => {
  const source = fs.mkdtempSync(path.join(root, '.dev/runtime-check-'));
  const runtime = path.join(source, '.build/electron');
  fs.mkdirSync(runtime, { recursive: true });
  fs.writeFileSync(path.join(source, '.npmrc'), 'target="43.7.7"\n');
  fs.writeFileSync(path.join(runtime, 'version'), '43.7.6');
  fs.writeFileSync(path.join(runtime, 'Code - OSS.exe'), 'fixture executable');
  const edited = [];
  const editor = async (file, options) => { edited.push(options); fs.appendFileSync(file, '\nbranded'); };
  await assert.rejects(prepareDevelopmentExecutable(source,editor), /version differs/);
  assert.equal(fs.existsSync(path.join(runtime, 'RTL IDE.exe')), false);
  fs.writeFileSync(path.join(runtime, 'version'), '43.7.7');
  const target = await prepareDevelopmentExecutable(source,editor);
  assert.equal(await prepareDevelopmentExecutable(source,editor),target);
  assert.equal(edited.length,1);
  assert.equal(edited[0]['version-string'].ProductName,'Pulse');
  assert.equal(fs.readFileSync(target,'utf8'),'fixture executable\nbranded');
  assert.equal(fs.readFileSync(path.join(runtime, 'Code - OSS.exe'), 'utf8'), 'fixture executable');
  fs.writeFileSync(path.join(runtime,'version'),'43.7.6');
  await assert.rejects(prepareDevelopmentExecutable(source,editor),/version differs/);
  fs.writeFileSync(path.join(runtime,'version'),'43.7.7');
  fs.appendFileSync(target,'corrupt');
  await assert.rejects(prepareDevelopmentExecutable(source,editor),/cache differs/);
});

test('resource editing failure never changes official executables or leaves staged files',async()=>{
  const source=fs.mkdtempSync(path.join(root,'.dev/runtime-check-'));
  const runtime=path.join(source,'.build/electron');
  fs.mkdirSync(runtime,{recursive:true});
  fs.writeFileSync(path.join(source,'.npmrc'),'target="43.7.7"\n');
  fs.writeFileSync(path.join(runtime,'version'),'43.7.7');
  fs.writeFileSync(path.join(runtime,'RTL IDE.exe'),'official fixture');
  await assert.rejects(prepareDevelopmentExecutable(source,async()=>{throw Error('fixture edit failed');}),/fixture edit failed/);
  assert.equal(fs.readFileSync(path.join(runtime,'RTL IDE.exe'),'utf8'),'official fixture');
  assert.equal(fs.readdirSync(runtime).some(name=>name.startsWith('rtl-brand-')||name.startsWith('Pulse Dev-')),false);
});
