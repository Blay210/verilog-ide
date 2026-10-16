import { moduleHighlights, portCompletions, symbolCompletionContext, type Analysis, type InstanceInfo, type SemanticSymbol } from '../../runtime/semantic/index';
import { scanCode } from './lexical';
import { fileKey } from './input-events';
import { ModuleCatalog } from './module-catalog';

type Highlight = { start: number; length: number; declaration: boolean };
type Pool = { before: string; after: string; qualifier?: string; symbols: SemanticSymbol[] };
type View = { file: string; text: string; tokens: Highlight[]; instances: InstanceInfo[]; pools: Pool[] };
const maxText = 1024 * 1024, maxBytes = 8 * 1024 * 1024;

/** Presentation only. Never used by diagnostics, navigation, hover or compiler queries. */
export class SemanticContinuity {
  readonly modules = new ModuleCatalog();
  private views = new Map<string, View>();
  private bytes = 0;
  clear() { this.views.clear(); this.bytes = 0; this.modules.clear(); }
  forget(uri: string) {
    const view = this.views.get(uri);
    if (view) { this.bytes -= this.size(view); this.views.delete(uri); }
  }
  private size(view: View) { return 2 * view.text.length + JSON.stringify([view.tokens, view.instances, view.pools]).length * 2; }
  private put(uri: string, view: View) {
    this.forget(uri);
    const size = this.size(view);
    if (view.text.length > maxText || size > maxBytes) return;
    while (this.views.size >= 16 || this.bytes + size > maxBytes) this.forget(this.views.keys().next().value!);
    this.views.set(uri, view); this.bytes += size;
  }
  publish(uri: string, file: string, text: string, analysis: Analysis) {
    if (text.length > maxText) { this.forget(uri); return; }
    // Keep no compiler/native model, diagnostics, project object or other file text.
    const instances = analysis.instances.filter(instance => fileKey(instance.start.file) === fileKey(file)).map(instance => ({
      ...instance, ports: instance.ports.map(port => ({ ...port, location: { ...port.location } })),
      start: { ...instance.start }, end: { ...instance.end }
    }));
    this.put(uri, { file, text, tokens: moduleHighlights(analysis, file, text), instances, pools: [] });
  }
  edit(uri: string, text: string, file?: string) {
    const view = this.views.get(uri);
    if (view?.text === text) return;
    if (file ?? view?.file) this.modules.edit((file ?? view?.file)!, text, view?.text);
    // Other files can change declarations, macros and parameter contexts. Only
    // the document being edited has a proven positional mapping here.
    for (const key of [...this.views.keys()]) if (key !== uri) this.forget(key);
    if (!view || text.length > maxText) { this.forget(uri); return; }
    const before = view.text;
    let start = 0, end = before.length, nextEnd = text.length;
    while (start < end && start < nextEnd && before[start] === text[start]) start++;
    while (end > start && nextEnd > start && before[end - 1] === text[nextEnd - 1]) { end--; nextEnd--; }
    const delta = nextEnd - end, code = scanCode(text).code, oldCode = scanCode(before).code;
    // A new/preexisting macro or directive may change all compiler bindings.
    if (scanCode(before.slice(0, start)).context === 'directive' || before.slice(before.lastIndexOf('\n', start - 1) + 1, end).includes('`') || text.slice(start, nextEnd).includes('`')) { this.forget(uri); return; }
    const shift = (position: number) => position >= end ? position + delta : position;
    let tokens = view.tokens.flatMap(token => {
      if (start < token.start + token.length && end > token.start || start > token.start && start < token.start + token.length) return [];
      const mapped = { ...token, start: shift(token.start) }, name = before.slice(token.start, token.start + token.length);
      if (code.slice(mapped.start, mapped.start + mapped.length) !== name || /[\w$\\.:]/.test(code[mapped.start - 1] ?? '') || /[\w$]/.test(code[mapped.start + mapped.length] ?? '')) return [];
      const left = code.slice(Math.max(0, mapped.start - 128), mapped.start), right = code.slice(mapped.start + mapped.length, mapped.start + mapped.length + 8192);
      if (token.declaration ? !/\b(?:module|interface|program)\s+(?:(?:automatic|static)\s+)?$/.test(left) : !/^\s*(?:#\s*\([\s\S]*?\)\s*)?[A-Za-z_][\w$]*\s*(?:\[[^\]]*\]\s*)*\(/.test(right)) return [];
      return [mapped];
    });
    const retainedDeclarations = new Set(tokens.filter(token => token.declaration).map(token => `${token.start}:${token.length}`));
    const retiredNames = new Set(view.tokens.filter(token => token.declaration && !retainedDeclarations.has(`${shift(token.start)}:${token.length}`))
      .map(token => before.slice(token.start, token.start + token.length)));
    tokens = tokens.filter(token => !retiredNames.has(text.slice(token.start, token.start + token.length)));
    const whitespaceOnly = before.slice(start, end).trim() === '' && text.slice(start, nextEnd).trim() === ''
      && !(start > 0 && end < before.length && /\S/.test(before[start - 1]) && /\S/.test(before[end]));
    const instances = view.instances.flatMap(instance => {
      const open = oldCode.indexOf('(', instance.start.offset);
      // Connection-list edits don't change elaborated module/parameter identity.
      // All other substantive edits retire port signatures immediately.
      if (!whitespaceOnly && !(open >= 0 && start > open && end <= instance.end.offset
        && !/[;`]/.test(before.slice(start, end) + text.slice(start, nextEnd)))) return [];
      if (start < instance.start.offset && end > instance.start.offset || start < open && end > open) return [];
      return [{ ...instance, start: { ...instance.start, offset: shift(instance.start.offset) }, end: { ...instance.end, offset: shift(instance.end.offset) } }];
    });
    // A pool is reusable only if everything outside the requested identifier is
    // byte-for-byte unchanged. It can never cross a scope/declaration edit.
    const pools = view.pools.filter(pool => text.startsWith(pool.before) && text.endsWith(pool.after)
      && text.length >= pool.before.length + pool.after.length
      && /^[\w$]*$/.test(text.slice(pool.before.length, text.length - pool.after.length)));
    this.put(uri, { file: view.file, text, tokens, instances, pools });
  }
  tokens(uri: string) { return this.views.get(uri)?.tokens ?? []; }
  ports(uri: string, file: string, offset: number) {
    const view = this.views.get(uri);
    if (!view) return;
    const code = scanCode(view.text).code;
    const instances = view.instances.map(instance => {
      const open = code.indexOf('(', instance.start.offset);
      let depth = 1, end = open + 1;
      if (open >= 0) for (; end < Math.min(code.length, instance.end.offset); end++) {
        if (code[end] === '(') depth++;
        if (code[end] === ')' && --depth === 0) break;
      }
      return { ...instance, end: { ...instance.end, offset: open < 0 ? instance.start.offset : end } };
    });
    return portCompletions({ modules: [], diagnostics: [], instances }, file, view.text, offset, false);
  }
  remember(uri: string, text: string, offset: number, symbols: SemanticSymbol[]) {
    const view = this.views.get(uri), context = symbolCompletionContext(text, offset);
    if (!view || view.text !== text || !context || symbols.length > 2000 || text.length > 128 * 1024) return;
    // Candidate insertion metadata only: no stale locations, types or call info.
    const pool: Pool = { before: text.slice(0, context.start), after: text.slice(context.end), qualifier: context.qualifier,
      symbols: symbols.map(symbol => ({ name: symbol.name, kind: symbol.kind, detail: symbol.kind,
        instantiable: symbol.instantiable, location: { file: '', offset: 0, line: 0, character: 0 } })) };
    if (JSON.stringify(pool).length > 256 * 1024) return;
    this.put(uri, { ...view, pools: [...view.pools.filter(entry => entry.before !== pool.before || entry.after !== pool.after), pool].slice(-4) });
  }
  candidates(uri: string, offset: number) {
    const view = this.views.get(uri);
    if (!view) return;
    const context = symbolCompletionContext(view.text, offset);
    if (!context) return;
    return view.pools.find(pool => pool.qualifier === context.qualifier && pool.before === view.text.slice(0, context.start) && pool.after === view.text.slice(context.end))?.symbols;
  }
}
