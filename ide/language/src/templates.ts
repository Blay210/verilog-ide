import { scanCode } from './lexical';
import { planBlockEnter } from './blocks';

const templates: Record<string, { body: string; close: string; sv?: boolean; svBody?: string }> = {
  module: { body: 'module $1 (\n\t$2\n);\n\t$0\nendmodule', close: 'endmodule' },
  package: { body: 'package $1;\n\t$0\nendpackage', close: 'endpackage', sv: true },
  class: { body: 'class $1;\n\t$0\nendclass', close: 'endclass', sv: true },
  fork: { body: 'fork\n\t$0\njoin', svBody: 'fork\n\t$0\n${1|join,join_any,join_none|}', close: 'join(?:_any|_none)?' },
  interface: { body: 'interface $1 (\n\t$2\n);\n\t$0\nendinterface', close: 'endinterface', sv: true },
  program: { body: 'program $1 (\n\t$2\n);\n\t$0\nendprogram', close: 'endprogram', sv: true },
  function: { body: 'function $1 $2 ($3);\n\t$0\nendfunction', close: 'endfunction' },
  task: { body: 'task $1 ($2);\n\t$0\nendtask', close: 'endtask' },
  generate: { body: 'generate\n\t$0\nendgenerate', close: 'endgenerate' },
  case: { body: 'case ($1)\n\t$0\nendcase', close: 'endcase' },
  casex: { body: 'casex ($1)\n\t$0\nendcase', close: 'endcase' },
  casez: { body: 'casez ($1)\n\t$0\nendcase', close: 'endcase' }
};
const procedural:Record<string,{header:string;body:string;sv?:boolean}>={
  always:{header:'always @() begin',body:'always @($1) begin\n\t$0\nend'},
  always_ff:{header:'always_ff @() begin',body:'always_ff @($1) begin\n\t$0\nend',sv:true},
  always_comb:{header:'always_comb begin',body:'always_comb begin\n\t$0\nend',sv:true},
  always_latch:{header:'always_latch begin',body:'always_latch begin\n\t$0\nend',sv:true}
};
export interface TemplateEdit { start: number; end: number; snippet: string; label: string }
/** Templates are explicit keyword expansions, not semantic completion or forced blocks. */
export function planTemplate(text: string, offset: number, language: 'verilog' | 'systemverilog', completion?: string): TemplateEdit | undefined {
  if (offset < 0 || offset > text.length || /[\w$]/.test(text[offset] ?? '')) return;
  const prefix = text.slice(0, offset), scan = scanCode(prefix);
  if (scan.context !== 'code') return;
  if (scanCode(prefix.slice(prefix.lastIndexOf('\n') + 1)).hasDirective) return;
  const word = /[A-Za-z_][\w$]*$/.exec(prefix)?.[0]; if (!word) return;
  const label = completion ?? word; if (!label.startsWith(word)) return;
  const start = offset - word.length, before = scan.code.slice(0, start);
  if (/(?:\.|::)\s*$/.test(before)) return;
  if (label === 'begin') {
    const complete = text.slice(0, start) + 'begin' + text.slice(offset);
    const enter = planBlockEnter(complete, start + 5, { unit: '\t', eol: '\n' });
    if (!enter) return;
    const inline=scanCode(complete.slice(start+5,complete.indexOf('\n',start+5)<0?complete.length:complete.indexOf('\n',start+5))).code.trim().startsWith('end');
    return { start, end: offset+enter.replaceEnd-(start+5), snippet: 'begin\n\t$0'+(enter.afterCursor.endsWith('end')?'\nend':inline?'\n':''), label };
  }
  const block=procedural[label];
  if(block) {
    if(block.sv&&language!=='systemverilog'||!/^\s*$/.test(before.slice(before.lastIndexOf('\n')+1)))return;
    const complete=text.slice(0,start)+block.header+text.slice(offset),headerEnd=start+block.header.length;
    const enter=planBlockEnter(complete,headerEnd,{unit:'\t',eol:'\n'});if(!enter)return;
    const inline=scanCode(complete.slice(headerEnd,complete.indexOf('\n',headerEnd)<0?complete.length:complete.indexOf('\n',headerEnd))).code.trim().startsWith('end');
    return {start,end:offset+enter.replaceEnd-headerEnd,snippet:enter.afterCursor.endsWith('end')?block.body:block.body.replace(/\nend$/,'')+(inline?'\n':''),label};
  }
  const template = templates[label]; if (!template || (template.sv && language !== 'systemverilog')) return;
  // New class/fork templates cannot resolve preprocessing or safely move inline comments.
  if (label === 'class' || label === 'fork') {
    if (scanCode(text).hasDirective) return;
    const lineEnd = text.indexOf('\n', offset);
    if (text.slice(offset, lineEnd < 0 ? text.length : lineEnd).trim()) return;
  }
  const line = before.slice(before.lastIndexOf('\n') + 1);
  if (!(label.startsWith('case') ? /^\s*(?:(?:unique|priority)\s+)?$/ : /^\s*$/).test(line)) return;
  // Existing source takes precedence; never append a second declaration/case closer.
  const suffix = scanCode(text.slice(offset)).code;
  if (suffix.trim() || /\S/.test(text.slice(offset, text.indexOf('\n', offset) < 0 ? text.length : text.indexOf('\n', offset)))) {
    if (new RegExp(`\\b${template.close}\\b`).test(suffix)) return;
    if (/\S/.test(suffix.split('\n')[0])) return;
  }
  return { start, end: offset, snippet: language === 'systemverilog' && template.svBody ? template.svBody : template.body, label };
}
