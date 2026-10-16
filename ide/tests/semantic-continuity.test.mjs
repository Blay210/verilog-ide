import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { buildSync } from 'esbuild';
import Module from 'node:module';
const built = buildSync({entryPoints:['language/src/semantic-continuity.ts'],bundle:true,write:false,platform:'node',format:'cjs'});
const loaded = new Module('continuity'); loaded._compile(built.outputFiles[0].text,'continuity.cjs');
const {SemanticContinuity} = loaded.exports;
const file=path.resolve('.dev/continuity.sv'),uri='file:///continuity.sv';
const source='`timescale 1ns/1ps\nmodule child(input logic clk, input logic reset); endmodule\nmodule top; child u(.clk()); initial $display(settings_pkg::WIDTH); endmodule\n';
const point=offset=>({file,offset,line:0,character:offset});
const ports=['clk','reset'].map(name=>({name,direction:'input',type:'logic',location:point(source.indexOf(name))}));
const analysis={modules:[{name:'child',kind:'module',location:point(source.indexOf('child')),ports},{name:'top',kind:'module',location:point(source.indexOf('top')),ports:[]}],instances:[{name:'u',module:'child',start:point(source.indexOf('u(')),end:point(source.indexOf('u(')+'u(.clk())'.length),ports}],diagnostics:[]};
const setup=()=>{const value=new SemanticContinuity();value.publish(uri,file,source,analysis);return value;};

test('keeps module colors and unused ports through dot edits with an existing timescale',()=>{
 const value=setup(),edited=source.replace('.clk()', '.clk(),\n  .');
 const initial=value.tokens(uri);assert.equal(initial.length,3);
 value.edit(uri,edited);assert.deepEqual(value.tokens(uri),initial);
 const result=value.ports(uri,file,edited.indexOf('\n  .')+4);
 assert.deepEqual(result.ports.map(port=>port.name),['reset']);
 const moved='\n// explanation\n'+edited;value.edit(uri,moved);
 assert.deepEqual(value.tokens(uri).map(token=>token.start),initial.map(token=>token.start+16));
 const korean='// 한글 경로와 🚀\n';value.edit(uri,korean+moved);
 assert.deepEqual(value.tokens(uri).map(token=>token.start),initial.map(token=>token.start+16+korean.length),'mapping uses UTF-16 offsets including surrogate pairs');
});

test('retains a compiler candidate pool only for identifier edits in exactly the same context',()=>{
 const value=setup(),at=source.indexOf('::WIDTH')+2;
 const symbols=['WIDTH','DEPTH'].map(name=>({name,kind:'constant',detail:'parameter int',location:point(1)}));
 value.remember(uri,source,at,symbols);
 let edited=source.replace('::WIDTH','::DE');value.edit(uri,edited);
 assert.deepEqual(value.candidates(uri,edited.indexOf('::DE')+4).map(symbol=>symbol.name),['WIDTH','DEPTH']);
 assert.equal(value.candidates(uri,edited.indexOf('::DE')+4)[0].location.file,'','no stale navigation location');
 edited=edited.replace('settings_pkg','different_pkg');value.edit(uri,edited);
 assert.equal(value.candidates(uri,edited.indexOf('::DE')+4),undefined);
});

test('retires changed module tokens, signatures, external dependencies and directives',()=>{
 let value=setup(),edited=source.replace('child u','other u');value.edit(uri,edited);
 assert.equal(value.tokens(uri).some(token=>token.start===edited.indexOf('other u')),false);
 assert.deepEqual(value.ports(uri,file,edited.indexOf('.clk')+1).ports,[]);
 value=setup();value.edit(uri,source.replace('input logic reset','output logic reset'));
 assert.deepEqual(value.ports(uri,file,source.indexOf('.clk')+1).ports,[]);
 value=setup();value.edit('file:///dependency.sv','module changed; endmodule');assert.deepEqual(value.tokens(uri),[]);
 value=setup();value.edit(uri,source.replace('1ns/1ps','10ns/1ps'));assert.deepEqual(value.tokens(uri),[]);
 value=setup();value.edit(uri,source.replace('child u','/* child u'));assert.equal(value.tokens(uri).length,2);
});

test('updates with the next published model, bounds retained documents and drops explicit clears',()=>{
 const value=setup();value.publish(uri,file,source,{modules:[],instances:[],diagnostics:[]});assert.deepEqual(value.tokens(uri),[]);
 for(let i=0;i<20;i++)value.publish(uri+i,file,source,analysis);
 assert.deepEqual(value.tokens(uri+'0'),[]);assert.equal(value.tokens(uri+'19').length,3);
 value.publish(uri,file,' '.repeat(1024*1024+1),analysis);assert.deepEqual(value.tokens(uri),[]);
 value.clear();assert.deepEqual(value.tokens(uri+'19'),[]);
});

test('whitespace cannot merge an instance header and a closed list cannot leak candidates into following expressions',()=>{
 let value=setup(),edited=source.replace('child u','childu');value.edit(uri,edited);
 assert.deepEqual(value.ports(uri,file,edited.indexOf('.clk')+1).ports,[]);
 value=setup();edited=source.replace('u(.clk())','u(.clk()), other(.)');value.edit(uri,edited);
 assert.deepEqual(value.ports(uri,file,edited.indexOf('other(.)')+'other(.'.length).ports,[]);
});
