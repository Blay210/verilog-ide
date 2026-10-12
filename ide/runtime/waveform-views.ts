import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deleteView, parseViewBook, putView, type ViewBook } from './waveform/views';
import type { SavedWaveViews, WaveViewEdit } from './contract';

const queues = new Map<string, Promise<unknown>>();
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const missing = (error: unknown) => (error as NodeJS.ErrnoException).code === 'ENOENT';
/** Per-test project settings. Never edit the manifest, source or retained trace. */
export class WaveViewStore {
  constructor(private readonly root: string, private readonly name: string, private readonly top: string) {}
  private async file(create = false): Promise<string> {
    for (const directory of [this.root, path.join(this.root, '.rtl'), path.join(this.root, '.rtl', 'waveform-views')]) {
      try { const stat = await lstat(directory); if (!stat.isDirectory() || stat.isSymbolicLink()) throw Error('Waveform settings directories must not be links.'); }
      catch (error) {
        if (!missing(error) || directory === this.root) throw error;
        if (!create) break;
        try { await mkdir(directory); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
        const stat = await lstat(directory); if (!stat.isDirectory() || stat.isSymbolicLink()) throw Error('Invalid waveform settings directory.');
      }
    }
    return path.join(this.root, '.rtl', 'waveform-views', digest(JSON.stringify([this.name, this.top])) + '.json');
  }
  private async load(file: string): Promise<SavedWaveViews> {
    try {
      const stat = await lstat(file);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1048576) throw Error('Invalid or oversized waveform settings; existing data was not changed.');
      const text = await readFile(file, 'utf8');
      if (Buffer.byteLength(text) > 1048576) throw Error('Oversized waveform settings.');
      return { book: parseViewBook(JSON.parse(text)), revision: digest(text), label: this.name };
    } catch (error) { if (!missing(error)) throw error; return { book: parseViewBook(undefined), revision: 'empty', label: this.name }; }
  }
  async read(): Promise<SavedWaveViews> { return this.load(await this.file()); }
  async edit(edit: WaveViewEdit): Promise<SavedWaveViews> {
    const file = await this.file(true);
    const previous = queues.get(file) ?? Promise.resolve();
    const work = previous.catch(() => {}).then(async () => {
      const current = await this.load(file);
      if (edit.revision !== current.revision) throw Error('Saved views changed in another tab. Reload views and retry; no data was overwritten.');
      let book: ViewBook = current.book!;
      if (edit.action === 'save' && edit.view) book = putView(book, edit.view);
      else if (edit.action === 'delete' && typeof edit.id === 'string') book = deleteView(book, edit.id);
      else if (edit.action === 'default') book = parseViewBook({ ...book, defaultId: edit.id });
      else throw Error('Invalid waveform view operation.');
      const text = JSON.stringify(book, null, 2) + '\n';
      if (Buffer.byteLength(text) > 1048576) throw Error('Waveform settings exceed 1 MiB.');
      const temporary = file + '.' + randomUUID() + '.tmp';
      try { await writeFile(temporary, text, { flag: 'wx' }); await rename(temporary, file); }
      finally { await unlink(temporary).catch(error => { if (!missing(error)) throw error; }); }
      return { book, revision: digest(text), label: this.name };
    });
    queues.set(file, work);
    try { return await work; } finally { if (queues.get(file) === work) queues.delete(file); }
  }
}
