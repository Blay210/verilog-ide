import path from 'node:path';
import { mkdir, mkdtemp, symlink, unlink, rmdir, readFile, writeFile } from 'node:fs/promises';

// GNU make and native Verilator do not reliably accept spaces/non-ASCII paths.
// Junctions alias directories; unsafe basenames use private source copies.
// Original RTL and configured include search order stay intact.
export async function buildPaths(root: string, cache: string | undefined) {
  const aliases = new Map<string, string>();
  const sources = new Map<string, string>();
  let temporary: string | undefined;
  const unsafe = (value: string) => /[^A-Za-z0-9_./:\\-]/.test(value);
  async function workspace(): Promise<string> {
    if (!cache || unsafe(cache)) throw Error('Windows build paths need an ASCII tool-cache location. Choose a short tools directory from RTL: Toolchain.');
    if (!temporary) { await mkdir(cache, { recursive: true }); temporary = await mkdtemp(path.join(cache, 'build-')); }
    return temporary;
  }
  async function alias(directory: string): Promise<string> {
    const absolute = path.resolve(directory);
    if (process.platform !== 'win32' || !unsafe(absolute)) return absolute;
    const base = await workspace();
    let existing = aliases.get(absolute);
    if (!existing) { existing = path.join(base, String(aliases.size)); await symlink(absolute, existing, 'junction'); aliases.set(absolute, existing); }
    return existing;
  }
  const projectAlias = await alias(root);
  return {
    async map(file: string): Promise<string> {
      const relative = path.relative(root, file);
      if (relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative)) {
        const mapped = path.join(projectAlias, relative);
        if (!unsafe(mapped)) return mapped.replaceAll('\\', '/');
      }
      const directory = await alias(path.dirname(file));
      const mapped = path.join(directory, path.basename(file));
      if (process.platform === 'win32' && unsafe(mapped)) {
        const absolute = path.resolve(file);
        let copied = sources.get(absolute);
        if (!copied) {
          copied = path.join(await workspace(), `source-${sources.size}${path.extname(file)}`);
          // Preserve diagnostic locations and __FILE__, without giving make an
          // unsafe source argument. Configured include directories stay in order.
          const location = absolute.replaceAll('\\', '/').replaceAll('"', '\\"');
          const bytes = await readFile(absolute);
          const body = bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])) ? bytes.subarray(3) : bytes;
          sources.set(absolute, copied);
          await writeFile(copied, Buffer.concat([Buffer.from(`\`line 1 "${location}" 0\n`), body]), { flag: 'wx' });
        }
        return copied.replaceAll('\\', '/');
      }
      return mapped.replaceAll('\\', '/');
    },
    async directory(directory: string): Promise<string> { return (await alias(directory)).replaceAll('\\', '/'); },
    original(text: string): string {
      for (const [original, copy] of sources) text = text.replaceAll(copy.replaceAll('\\', '/'), original.replaceAll('\\', '/')).replaceAll(copy, original);
      for (const [original, link] of [...aliases].sort((a, b) => b[1].length - a[1].length)) text = text.replaceAll(link.replaceAll('\\', '/'), original.replaceAll('\\', '/')).replaceAll(link, original);
      return text;
    },
    async dispose(): Promise<void> {
      const remove = async (file: string) => { try { await unlink(file); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; } };
      const removed = await Promise.allSettled([...sources.values(), ...aliases.values()].map(remove));
      const failures = removed.filter((item): item is PromiseRejectedResult => item.status === 'rejected').map(item => item.reason);
      if (temporary) {
        try { await rmdir(temporary); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') failures.push(error); }
      }
      if (failures.length) throw new AggregateError(failures, 'Could not clean Windows build path aliases.');
    }
  };
}

