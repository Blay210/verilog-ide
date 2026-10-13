import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { root } from '../scripts/environment.mjs';
const require = createRequire(import.meta.url), fs = require('node:fs/promises');
const { readImportRecovery, inspectImportJournal, archiveImportJournal, readImportSettings, saveImportSettings, resolveImportRecovery } = require('../dist/runtime/core/index.js');
const { populate } = require('./helpers/import-journal.cjs');
const { acquireImportLease } = require('../dist/runtime/core/import-lease.js');
const tick = () => new Promise(resolve => setImmediate(resolve));
function gate() { let release; return { promise: new Promise(resolve => {release=resolve;}), release }; }
async function fixture(t, count=40) {
  const dir = await fs.mkdtemp(path.join(root, '.dev/import-journal-')); t.after(() => fs.rm(dir,{recursive:true,force:true}));
  return {dir,...await populate(dir,count)};
}
async function snapshot(folder) {
  const result={}; for (const name of await fs.readdir(folder)) result[name]=await fs.readFile(path.join(folder,name)); return result;
}

test('reviewed archiving preserves every file/inode and current settings, keeps 32 active records and permits a 129th save', async t => {
  const f=await fixture(t,128), before=new Map();
  for (const name of await fs.readdir(f.active)) before.set(name,{bytes:await snapshot(path.join(f.active,name)), ino:(await fs.stat(path.join(f.active,name,'previous.toml'))).ino});
  const {journal}=await inspectImportJournal(f.dir); assert.equal(journal.archive.count,96); assert.equal(journal.archive.retained,32);
  await assert.rejects(saveImportSettings(f.dir,(await readImportSettings(f.dir)).revision,{}),/128 transactions/);
  const receipt=await archiveImportJournal(f.dir,journal.archive); assert.equal(receipt.count,96);
  assert.equal(await fs.readFile(f.manifest,'utf8'),f.text); assert.equal((await fs.readdir(f.active)).length,32);
  const archiveNames=(await fs.readdir(receipt.directory)).filter(name=>before.has(name)); assert.equal(archiveNames.length,96);
  for (const name of before.keys()) {
    const folder=path.join(archiveNames.includes(name)?receipt.directory:f.active,name);
    assert.deepEqual(await snapshot(folder),before.get(name).bytes); assert.equal((await fs.stat(path.join(folder,'previous.toml'))).ino,before.get(name).ino);
  }
  await saveImportSettings(f.dir,(await readImportSettings(f.dir)).revision,{files:[{path:'tb.sv',role:'simulation'}]});
  assert.deepEqual(await readImportRecovery(f.dir),[]); assert.equal((await inspectImportJournal(f.dir)).journal.count,33);
});

test('archived handles retain late bytes without automatic gating while active retained handles still require recovery', async t => {
  const f=await fixture(t), old=await fs.open(path.join(f.active,f.template,'previous.toml'),'r+'); let closed=false; t.after(()=>closed?undefined:old.close());
  const plan=(await inspectImportJournal(f.dir)).journal.archive;
  if (process.platform==='win32') {
    // NTFS refuses moving a directory with this open child handle. Preserve
    // the active record and partial archive for explicit recovery/retry.
    await assert.rejects(archiveImportJournal(f.dir,plan),/EPERM|EACCES|EBUSY/);
    await old.truncate(0); await old.writeFile('late active writer'); await old.sync();
    assert.equal(await fs.readFile(path.join(f.active,f.template,'previous.toml'),'utf8'),'late active writer');
    const recovery=await readImportRecovery(f.dir); assert.ok(recovery.some(record=>record.id===f.template));
    assert.equal(await fs.readFile(f.manifest,'utf8'),f.text);
    await assert.rejects(fs.stat(path.join(f.dir,'.rtl/import-review.lock')),/ENOENT/);
    await old.close(); closed=true;
    await resolveImportRecovery(f.dir,recovery.find(record=>record.id===f.template),'current');
    assert.deepEqual(await readImportRecovery(f.dir),[]);
    const retried=await archiveImportJournal(f.dir,(await inspectImportJournal(f.dir)).journal.archive);
    assert.equal(retried.count,1);
    assert.equal(await fs.readFile(path.join(retried.directory,f.template,'previous.toml'),'utf8'),'late active writer');
    assert.equal((await fs.readdir(f.active)).length,32);
    assert.equal(await fs.readFile(f.manifest,'utf8'),f.text);
    return;
  }
  const receipt=await archiveImportJournal(f.dir,plan);
  await old.truncate(0); await old.writeFile('late archived writer'); await old.sync();
  assert.equal(await fs.readFile(path.join(receipt.directory,f.template,'previous.toml'),'utf8'),'late archived writer');
  assert.deepEqual(await readImportRecovery(f.dir),[]); assert.equal(await fs.readFile(f.manifest,'utf8'),f.text);
  const retained=(await fs.readdir(f.active))[0]; await fs.appendFile(path.join(f.active,retained,'previous.toml'),'# retained writer\n');
  const pending=await readImportRecovery(f.dir); assert.equal(pending.length,1); assert.equal(pending[0].id,retained);
});

test('pending, untouched preparations and unknown children remain active; stale/root-edited plans never move data', async t => {
  const f=await fixture(t), names=await fs.readdir(f.active);
  await fs.appendFile(path.join(f.active,names[0],'previous.toml'),'# pending\n');
  await fs.writeFile(path.join(f.active,names[1],'user-owned.bin'),'preserve');
  await fs.unlink(path.join(f.active,names[2],'complete.json')); await fs.unlink(path.join(f.active,names[2],'previous.toml'));
  const state=await inspectImportJournal(f.dir); assert.equal(state.recoveries.length,1); assert.equal(state.journal.archive.count,5); assert.equal(state.journal.archive.retained,35);
  await fs.appendFile(f.manifest,'# external\n');
  await assert.rejects(archiveImportJournal(f.dir,state.journal.archive),/바뀌었/); assert.equal((await fs.readdir(f.active)).length,40);
  await fs.writeFile(f.manifest,f.text); const fresh=(await inspectImportJournal(f.dir)).journal.archive;
  const receipt=await archiveImportJournal(f.dir,fresh);
  for (const name of names.slice(0,3)) assert.ok(await fs.stat(path.join(f.active,name)));
  assert.equal(await fs.readFile(path.join(f.active,names[1],'user-owned.bin'),'utf8'),'preserve'); assert.equal(receipt.count,5);
});

test('linked archive destinations and populated collisions preserve external files and all uncommitted records', async t => {
  const f=await fixture(t), parent=path.join(f.dir,'.rtl/import-archive'), outside=path.join(f.dir,'outside'); await fs.mkdir(outside); await fs.writeFile(path.join(outside,'marker'),'outside');
  const plan=(await inspectImportJournal(f.dir)).journal.archive;
  await fs.symlink(outside,parent,'junction'); await assert.rejects(archiveImportJournal(f.dir,plan),/link/); assert.equal(await fs.readFile(path.join(outside,'marker'),'utf8'),'outside'); await fs.unlink(parent);
  const rename=fs.rename; let collided;
  fs.rename=async(from,to)=>{if(path.dirname(from)===f.active){await fs.mkdir(to);await fs.writeFile(path.join(to,'user-marker'),'preserve');collided=to;}return rename(from,to);};
  try {await assert.rejects(archiveImportJournal(f.dir,plan),/ENOTEMPTY|EEXIST|EPERM/);} finally {fs.rename=rename;}
  assert.equal(await fs.readFile(path.join(collided,'user-marker'),'utf8'),'preserve'); assert.equal((await fs.readdir(f.active)).length,40);
});

test('cancellation and a later record change leave partial archives intact and fresh review can finish remaining retirement', async t => {
  for(const mode of ['abort','change']) {
    const f=await fixture(t), plan=(await inspectImportJournal(f.dir)).journal.archive, rename=fs.rename, controller=new AbortController(); let moved=0, folder;
    fs.rename=async(from,to)=>{await rename(from,to);if(path.dirname(from)===f.active){moved++;folder=path.dirname(to);if(moved===1){if(mode==='abort')controller.abort();else for(const name of await fs.readdir(f.active))await fs.appendFile(path.join(f.active,name,'previous.toml'),'# changed\n');}}};
    try {await assert.rejects(archiveImportJournal(f.dir,plan,controller.signal),/1개 기록/);} finally {fs.rename=rename;}
    assert.equal(moved,1); assert.equal((await fs.readdir(f.active)).length,39); assert.equal((await fs.readdir(folder)).filter(name=>name!=='archive.json').length,1);
    assert.equal(await fs.readFile(f.manifest,'utf8'),f.text); await assert.rejects(fs.stat(path.join(f.dir,'.rtl/import-review.lock')),/ENOENT/);
    if(mode==='abort'){const fresh=(await inspectImportJournal(f.dir)).journal.archive;assert.equal(fresh.count,7);await archiveImportJournal(f.dir,fresh);assert.equal((await fs.readdir(f.active)).length,32);}
    else assert.equal((await readImportRecovery(f.dir)).length,39);
  }
});

test('real archiver termination leaves both namespaces readable and a fresh lease owner continues without deleting partial data', async t => {
  const f=await fixture(t), child=fork(new URL('./helpers/import-archive-crash.cjs',import.meta.url),[f.dir],{stdio:['ignore','ignore','pipe','ipc']}), exit=once(child,'exit'); let timer;
  try {
    const [message]=await Promise.race([once(child,'message'),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Archiver boundary timed out')),10000);})]);clearTimeout(timer);assert.equal(message.moved,3);
    await assert.rejects(acquireImportLease(path.join(f.dir,'.rtl')),/busy/);child.kill('SIGKILL');await exit;
    assert.equal((await fs.readdir(f.active)).length,37);const parent=path.join(f.dir,'.rtl/import-archive'), batch=path.join(parent,(await fs.readdir(parent))[0]), saved=await fs.readFile(path.join(batch,'archive.json'));
    assert.deepEqual(await readImportRecovery(f.dir),[]);assert.equal((await readImportSettings(f.dir)).revision.length,64);
    const plan=(await inspectImportJournal(f.dir)).journal.archive;assert.equal(plan.count,5);await archiveImportJournal(f.dir,plan);
    assert.equal((await fs.readdir(f.active)).length,32);assert.deepEqual(await fs.readFile(path.join(batch,'archive.json')),saved);assert.equal(await fs.readFile(f.manifest,'utf8'),f.text);
  } finally {clearTimeout(timer);child.kill('SIGKILL');await exit;}
});

test('bounded scan reads current bytes twice, joins failed/aborted readers and revalidates payloads every request', async t => {
  const f=await fixture(t,64), open=fs.open; let current=0, live=0, maximum=0;
  fs.open=async(file,...args)=>{const handle=await open(file,...args);if(file===f.manifest)current++;live++;maximum=Math.max(maximum,live);const close=handle.close.bind(handle);handle.close=async()=>{try{await close();}finally{live--;}};return handle;};
  try {assert.deepEqual(await readImportRecovery(f.dir),[]);} finally {fs.open=open;}
  assert.equal(current,2);assert.ok(maximum<=8);assert.equal(live,0);
  const names=(await fs.readdir(f.active)).sort();
  for(const mode of ['error','abort']) {
    const entered=gate(), held=gate(), controller=new AbortController(); let first=true, settled=false, handles=0;
    fs.open=async(file,...args)=>{const handle=await open(file,...args);handles++;const close=handle.close.bind(handle);handle.close=async()=>{try{await close();}finally{handles--;}};
      if(file===path.join(f.active,names[1],'candidate.toml')){const read=handle.read.bind(handle);handle.read=async(...args)=>{const result=await read(...args);if(first){first=false;entered.release();await held.promise;}return result;};}
      if(mode==='error'&&file===path.join(f.active,names[0],'candidate.toml'))handle.read=async()=>{throw Error('gated read failure');};return handle;};
    const pending=readImportRecovery(f.dir,controller.signal).then(()=>undefined,error=>error).finally(()=>{settled=true;});
    try {await entered.promise;if(mode==='abort')controller.abort();await tick();assert.equal(settled,false);held.release();assert.match(String(await pending),mode==='abort'?/abort/i:/gated read failure/);assert.equal(handles,0);} finally {held.release();await pending;fs.open=open;}
  }
  await fs.appendFile(path.join(f.active,names[0],'candidate.toml'),'# corrupted');await assert.rejects(readImportRecovery(f.dir),/candidate was modified/);
});

test('a writer changing current bytes during a parallel scan rejects the stale snapshot without overwriting it', async t => {
  const f=await fixture(t), open=fs.open;let hit=false;
  fs.open=async(file,...args)=>{const handle=await open(file,...args);if(path.basename(file)==='candidate.toml'){const read=handle.read.bind(handle);handle.read=async(...args)=>{const result=await read(...args);if(!hit){hit=true;await fs.writeFile(f.manifest,f.text+'# outside writer\n');}return result;};}return handle;};
  try {await assert.rejects(readImportRecovery(f.dir),/changed while inspecting/);} finally {fs.open=open;}
  assert.ok(hit);assert.equal(await fs.readFile(f.manifest,'utf8'),f.text+'# outside writer\n');
});

test('160 genuine saves with explicit periodic retirement stay within active limits and retain every archived transaction', async t => {
  const f=await fixture(t,1);let archived=0;
  for(let i=0;i<160;i++) {
    const settings=await readImportSettings(f.dir);await saveImportSettings(f.dir,settings.revision,{files:[{path:`rtl/file-${i}.sv`,role:'source'}]});
    if((await fs.readdir(f.active)).length>=64){const plan=(await inspectImportJournal(f.dir)).journal.archive;archived+=(await archiveImportJournal(f.dir,plan)).count;}
  }
  const count=(await fs.readdir(f.active)).length;assert.ok(count<64);assert.equal(count+archived,161);assert.ok(archived>=128);
  assert.equal((await readImportSettings(f.dir)).roles.files[0].path,'rtl/file-159.sv');assert.deepEqual(await readImportRecovery(f.dir),[]);
  let retained=0;for(const batch of await fs.readdir(path.join(f.dir,'.rtl/import-archive')))retained+=(await fs.readdir(path.join(f.dir,'.rtl/import-archive',batch))).filter(name=>/^[a-f0-9-]{36}$/.test(name)).length;
  assert.equal(retained,archived);
});
