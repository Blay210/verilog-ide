import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { lifecycleFixture } from './helpers/semantic-lifecycle.mjs';
import { root } from './environment.mjs';
// Exercise actual adapter watcher selection with the pinned Code-OSS glob parser.
// Editor/client APIs are modeled; physical filesystem delivery remains a native gate.
const fixture = await lifecycleFixture();
try {
  await fixture.restart();
  const selected = fixture.clients.at(-1).options.synchronize.fileEvents;
  assert.equal(selected.length, 2);
  const outfile = path.join(root, '.dev/h7l-glob.cjs');
  await build({ entryPoints: [path.join(root, 'upstream/src/vs/base/common/glob.ts')], outfile, bundle: true, platform: 'node', format: 'cjs' });
  const { match } = createRequire(import.meta.url)(outfile);
  const cases = [
    ['/project/.rtl', true], ['/project/.rtl/import-transactions', true],
    ['/project/.rtl/import-transactions/id/previous.toml', true], ['/project/.rtl/import-transactions/id/intent.json', true],
    ['/project/.rtl/import-archive/id/previous.toml', false], ['/project/.rtl/unrelated.txt', false]
  ];
  for (const [file, expected] of cases) assert.equal(selected.some(watcher => match(watcher.pattern, file)), expected, file);
  await fs.writeFile(path.join(root, '.dev/cloud/h7l-watch-patterns.json'), JSON.stringify({ scope: 'Actual adapter watcher selection, modeled editor/client API, pinned Code-OSS glob parser. Native watcher delivery is unverified.', patterns: selected.map(w => w.pattern), cases }, null, 2));
} finally { await fixture.cleanup(); }
async function run(before) {
  if (before) await fs.access(path.join(root, '.dev/cloud/h7l/server-before.ts'));
  const child = spawn(process.execPath, ['--test', '--test-name-pattern=actual LSP generated burst', 'tests/semantic-inputs.test.mjs'], {
    cwd: root, env: { ...process.env, RTL_H7L_COMPARE_BEFORE: before ? '1' : '0' }, stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', bytes => { output += bytes; }); child.stderr.on('data', bytes => { output += bytes; });
  const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('close', resolve); });
  await fs.writeFile(path.join(root, `.dev/cloud/h7l-diagnostic-${before ? 'before' : 'after'}.log`), output);
  if (code !== 0) throw Error(`Semantic input diagnostic exited ${code}; inspect its private log.`);
  return JSON.parse(await fs.readFile(path.join(root, `.dev/cloud/h7l-inputs-${before ? 'before' : 'after'}.json`), 'utf8'));
}
if (process.argv.includes('--compare')) {
  const before = await run(true), after = await run(false), receipt = { before, after };
  await fs.writeFile(path.join(root, '.dev/cloud/h7l-paired-inputs.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
} else console.log(JSON.stringify(await run(process.argv.includes('--before')), null, 2));
