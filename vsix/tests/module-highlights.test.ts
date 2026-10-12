import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { moduleHighlights, type Analysis } from '../packages/semantic/src/index';

test('module colors use compiler identities, skip comments, strings and same-spelling variables', () => {
  const file = path.resolve('design 한글.sv');
  const text = '/* alu */ module alu; endmodule\nmodule top; logic alu; initial $display("alu", alu);\nalu #(.W(1+(2))) u();\n// alu ignored();\nendmodule';
  const point = (offset: number) => ({file, offset, line: 0, character: offset});
  const analysis: Analysis = {
    modules: [{name: 'alu', kind: 'module', location: point(text.indexOf('alu;')), ports: []}, {name: 'top', kind: 'module', location: point(text.indexOf('top;')), ports: []}],
    instances: [{name: 'u', module: 'alu', start: point(text.indexOf('u();')), end: point(text.indexOf('u();')+4), ports: []}], diagnostics: []
  };
  assert.deepEqual(moduleHighlights(analysis, file, text), [
    {start: text.indexOf('alu;'), length: 3, declaration: true},
    {start: text.indexOf('top;'), length: 3, declaration: true},
    {start: text.indexOf('alu #'), length: 3, declaration: false}
  ]);
  assert.deepEqual(moduleHighlights(analysis, path.resolve('outside.sv'), text), []);
});
