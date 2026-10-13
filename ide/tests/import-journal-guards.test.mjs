import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
const require=createRequire(import.meta.url), fs=require('node:fs/promises');
const {populate}=require('./helpers/import-journal.cjs');
const {inspectImportJournal}=require('../dist/runtime/core/index.js');
async function fixture(t) {
  const dir=await fs.mkdtemp(path.join(root,'.dev/journal-guards-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  return {dir,...await populate(dir,40)};
}
test('Windows case-only realpath changes remain valid while a different real directory is refused',async t=>{
  const f=await fixture(t), original=fs.realpath, descriptor=Object.getOwnPropertyDescriptor(process,'platform');let outside=false;
  // Model only Windows comparison rules; filesystem calls still use the real Linux fixture.
  Object.defineProperty(process,'platform',{...descriptor,value:'win32'});
  fs.realpath=async(...args)=>{const value=await original(...args);return outside?value+'/outside':value.toUpperCase();};
  try {
    assert.equal((await inspectImportJournal(f.dir)).journal.count,40);
    outside=true;await assert.rejects(inspectImportJournal(f.dir),/link/);
  } finally {fs.realpath=original;Object.defineProperty(process,'platform',descriptor);}
});
test('a metadata-looking filename with an invalid UUID remains unknown and cannot be retired',async t=>{
  const f=await fixture(t), name='intent.json-'+ '-'.repeat(36)+'.tmp', file=path.join(f.active,f.template,name);
  await fs.writeFile(file,'user temporary data');
  const state=await inspectImportJournal(f.dir);
  assert.equal(state.journal.archive.count,7);assert.equal(state.journal.archive.retained,33);
  assert.equal(await fs.readFile(file,'utf8'),'user temporary data');
});
