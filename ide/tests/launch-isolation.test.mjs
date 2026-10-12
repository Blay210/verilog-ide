import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { root } from '../scripts/environment.mjs';
import { patches, patchedText } from '../scripts/patches.mjs';

test('Windows batch refuses missing private data flags before preLaunch and preserves upstream entry',{skip:process.platform!=='win32'},()=>{
  const fixture=fs.mkdtempSync(path.join(root,'.dev/launch-gate-'));
  const patch=patches.find(p=>p.id==='rtl-development-require-isolated-data');
  fs.writeFileSync(path.join(fixture,'gate.bat'),patchedText(`@echo off\r\nsetlocal\r\npushd %~dp0\r\n${patch.before}\r\necho HOST_ENTERED\r\npopd\r\nendlocal\r\nexit /b 0\r\n`,patch));
  const flags=['--user-data-dir','--shared-data-dir','--extensions-dir'];
  for(const omitted of [0,1,2,3]){
    const args=flags.filter((_,i)=>i!==omitted).flatMap(flag=>[flag,'private-fixture']);
    const result=spawnSync(process.env.ComSpec??'cmd.exe',['/d','/c','gate.bat',...args],{cwd:fixture,env:{...process.env,RTL_IDE_DEV_EXECUTABLE:'fixture.exe'},encoding:'utf8',windowsHide:true});
    assert.equal(result.error,undefined);
    assert.equal(result.status,omitted===3?0:1);
    if(omitted===3)assert.match(result.stdout,/HOST_ENTERED/);
    else {assert.doesNotMatch(result.stdout,/HOST_ENTERED/);assert.match(result.stderr,/requires profile, shared and extensions paths/);}
  }
  const env={...process.env};delete env.RTL_IDE_DEV_EXECUTABLE;
  const upstream=spawnSync(process.env.ComSpec??'cmd.exe',['/d','/c','gate.bat'],{cwd:fixture,env,encoding:'utf8',windowsHide:true});
  assert.equal(upstream.status,0);assert.match(upstream.stdout,/HOST_ENTERED/);
});
