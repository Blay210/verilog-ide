import test from 'node:test';
import assert from 'node:assert/strict';
import { createIcon, iconSvg } from '../scripts/icon.mjs';

test('Pulse icon has bounded multiresolution DIBs and transparent antialiased edges',()=>{
  const icon=createIcon();
  assert.equal(icon.readUInt16LE(2),1);
  assert.equal(icon.readUInt16LE(4),5);
  let end=6+16*5;
  for(const [i,size] of [16,32,48,64,256].entries()){
    const entry=6+16*i;
    assert.equal(icon[entry],size%256);
    assert.equal(icon[entry+1],size%256);
    const bytes=icon.readUInt32LE(entry+8),offset=icon.readUInt32LE(entry+12);
    assert.equal(offset,end);end+=bytes;
    const body=icon.subarray(offset,end);
    assert.equal(body.length,bytes);
    assert.equal(body.readInt32LE(4),size);
    assert.equal(body.readInt32LE(8),2*size);
    assert.equal(body.readUInt16LE(14),32);
    const alpha=Array.from({length:size*size},(_,p)=>body[40+4*p+3]);
    assert.ok(alpha.includes(0));assert.ok(alpha.includes(255));
    assert.ok(alpha.some(a=>a>0&&a<255));
  }
  assert.equal(end,icon.length);
  assert.match(iconSvg,/<svg .*viewBox="0 0 32 32"/);
});
