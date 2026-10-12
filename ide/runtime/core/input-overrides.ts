import path from 'node:path';
import type { InputOverride } from './model';

/** Validate/copy before the first await. Do not retain mutable caller arrays/objects. */
export function freezeInputOverrides(values?: readonly InputOverride[]): readonly InputOverride[] {
  if (values === undefined) return Object.freeze([]);
  if (!Array.isArray(values) || values.length > 10000) throw Error('Invalid editor input list.');
  const seen = new Set<string>(); let bytes = 0;
  return Object.freeze(values.map(value => {
    if (!value || typeof value.path !== 'string' || !path.isAbsolute(value.path) || !/\.(sv|v|svh|vh)$/i.test(value.path) || typeof value.text !== 'string' ||
        (value.version !== undefined && (!Number.isSafeInteger(value.version) || value.version < 0))) throw Error('Editor inputs require absolute RTL/header paths, text and a valid document version.');
    const file = path.resolve(value.path), key = process.platform === 'win32' ? file.toLowerCase() : file;
    if (seen.has(key)) throw Error('Duplicate editor input path.');
    seen.add(key);
    const size = Buffer.byteLength(value.text, 'utf8');
    if (size > 32 * 1024 * 1024 || (bytes += size) > 128 * 1024 * 1024) throw Error('Editor input byte limit exceeded.');
    return Object.freeze({ path: file, text: value.text, ...(value.version === undefined ? {} : { version: value.version }) });
  }));
}
