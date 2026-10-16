import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getResourcePaths } from '../upstream/build/next/resources.ts';

test('official desktop resource discovery retains the standalone RTL CLI and its simulation assets', async t => {
  const base = path.resolve('.dev'), directory = await fs.mkdtemp(path.join(base, 'desktop-assets-'));
  t.after(async () => { assert.equal(path.dirname(directory), base); await fs.rm(directory, { recursive: true, force: true }); });
  const names = ['rtl-cli.cjs', 'waveform-worker.cjs', 'waveform.html', 'analyze.py'];
  const target = path.join(directory, 'vs/platform/rtl/node'); await fs.mkdir(target, { recursive: true });
  for (const name of names) await fs.writeFile(path.join(target, name), 'owned fixture');
  const files = await getResourcePaths(directory, 'desktop');
  for (const name of names) assert.ok(files.includes('vs/platform/rtl/node/' + name), name);
});
