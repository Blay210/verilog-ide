import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { buildSync } from 'esbuild';
import Module from 'node:module';
const built=buildSync({entryPoints:['language/src/module-catalog.ts'],bundle:true,write:false,platform:'node',format:'cjs'});
const loaded=new Module('catalog');loaded._compile(built.outputFiles[0].text,'module-catalog.cjs');
const {ModuleCatalog,moduleItemContext}=loaded.exports;
const file=path.resolve('.dev/counter.sv'),other=path.resolve('.dev/other.sv');
const entry=(name='counter',origin=file)=>({name,kind:'module',location:{file:origin,offset:0,line:0,character:0},ports:[]});
const analysis=modules=>({modules,instances:[],diagnostics:[]});
const names=catalog=>catalog.candidates('module top;\n coun','module top;\n coun'.length).map(symbol=>symbol.name);

test('known project module names are available at a new malformed instance without a previous query',()=>{
 const catalog=new ModuleCatalog();catalog.publish(analysis([entry()]));
 const text='module top;\n counter c1(.clk(), .count())\n counter ();\n coun';
 assert.deepEqual(catalog.candidates(text,text.length).map(symbol=>symbol.name),['counter']);
 assert.equal(catalog.candidates(text,text.length)[0].instantiable,true);
 assert.equal(catalog.candidates(text,text.length)[0].location.file,'');
});

test('module names are not injected into ports, expressions, headers, functions, packages, strings or comments',()=>{
 const yes=['module top;\n coun','module top; generate\n coun','module top; generate for(genvar i=0;i<4;i++) begin : g\n coun'];
 for(const text of yes)assert.equal(moduleItemContext(text,text.length),true,text);
 const no=['coun','module coun','module top(input coun','module top; initial begin\n coun','module top; initial\n coun',
  'module top; always_ff @(posedge clk)\n coun','module top; assign x =\n coun','module top; counter u(\n coun',
  'module top; function f;\n coun','package p;\n coun','module top;\n cfg::coun','module top;\n // coun','module top; initial $display("coun',
  'module top;\n x.coun','module top; class C;\n coun','module top;\n logic\n coun'];
 for(const text of no)assert.equal(moduleItemContext(text,text.length),false,text);
});

test('renamed/deleted definitions are retired immediately, other project files survive ordinary editing',()=>{
 const catalog=new ModuleCatalog(),before='`timescale 1ns/1ps\nmodule counter; endmodule\n';catalog.publish(analysis([entry(),entry('other',other)]));
 catalog.edit(file,before.replace('counter','renamed'),before);assert.deepEqual(names(catalog),['other']);
 catalog.publish(analysis([entry(),entry('other',other)]));catalog.edit(other,'module other;\n logic edited; endmodule','module other; endmodule');assert.deepEqual(names(catalog),['counter','other']);
 catalog.edit(file,before.replace('1ns','10ns'),before);assert.deepEqual(names(catalog),[],'changed directives can affect all definitions');
});

test('ambiguity, configured replacement, limits and clear never leak stale or foreign definitions',()=>{
 const catalog=new ModuleCatalog();catalog.publish(analysis([entry(),entry('counter',other),entry('good',file)]));assert.deepEqual(names(catalog),['good']);
 catalog.publish(analysis([entry('fresh')]));assert.deepEqual(names(catalog),['fresh']);
 catalog.publish(analysis(Array.from({length:4097},(_,i)=>entry('m'+i))));assert.deepEqual(names(catalog),[]);
 catalog.publish(analysis([entry()]));catalog.clear();assert.deepEqual(names(catalog),[]);
});
