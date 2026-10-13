import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { root, inside } from './environment.mjs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

// Headless adapter integration with real pinned base modules; not a workbench build/UI test.
const directory = path.join(root, '.dev/h7c-channel');
const upstream = path.join(root, 'upstream');
if (!inside(root, await fs.realpath(upstream))) throw Error('Pinned source escaped IDE.');
await fs.mkdir(directory, { recursive: true });
const resolveDir = path.join(upstream, 'src/vs/platform/rtl/node');
await fs.mkdir(resolveDir, { recursive: true });
const source = await fs.readFile(path.join(root, 'src/rtlSimulationChannel.ts'), 'utf8');
const file = path.join(directory, 'channel.mjs');
await build({ stdin: { contents: source + "\nexport { errorHandler, setUnexpectedErrorHandler } from '../../../base/common/errors.js';\n", resolveDir, sourcefile: 'rtlSimulationChannel.ts', loader: 'ts' },
  outfile: file, bundle: true, platform: 'node', format: 'esm', target: 'node24', legalComments: 'inline',
  banner: { js: 'import {createRequire as h7cRequire} from "node:module"; const require=h7cRequire(import.meta.url);' },
  plugins: [{ name: 'owned-runtime', setup(build) { build.onResolve({ filter: /^\.\/runtime\.js$/ }, () => ({ path: path.join(root, 'runtime/host.ts') })); } }] });
const { RtlSimulationChannel, errorHandler, setUnexpectedErrorHandler } = await import(pathToFileURL(file).href);
const { createProject } = createRequire(import.meta.url)('../dist/runtime/core/index.js');
const project = await fs.mkdtemp(path.join(root, '.dev/h7c-channel-project-')); await createProject(project, true);
const channel = new RtlSimulationChannel(), errors = [], states = [];
const previous = errorHandler.getUnexpectedErrorHandler(); setUnexpectedErrorHandler(error => { errors.push(error); });
const receipt = { passed: false, project, checks: [], scope: 'Actual owned Node channel + pinned Code-OSS base + real host. Failure flags injected on idle services; no simulator or GUI.' };
const tick = () => new Promise(resolve => setImmediate(resolve));
try {
  const listener = channel.listen('window:910', 'state')(state => states.push(state));
  await channel.call('window:910', 'inspect', { root: project });
  assert.equal((await channel.call('window:910', 'state')).phase, 'idle'); assert.ok(states.length > 0);
  await assert.rejects(channel.call('window:910', 'start', { approved: false }), /신뢰/);
  // Exercise the real command dispatch and per-window session ownership. These
  // guards fail before any compiler/simulator could be resolved in this fixture.
  let tools = 0;
  const host = channel.session('window:910').host;
  host.service.resolveBackend = async () => { tools++; throw Error('Unexpected automatic simulator'); };
  host.resolveImport = async () => { tools++; throw Error('Unexpected automatic compiler'); };
  await fs.mkdir(path.join(project, 'verification'));
  const before = await channel.call('window:910', 'state');
  await assert.rejects(channel.call('window:910', 'test-list-edit', { testEdit: { action: 'folder', path: 'verification' } }), /버전/);
  await assert.rejects(channel.call('window:910', 'test-list-edit', { testEdit: { action: 'folder', path: 'verification' }, revision: before.testList.revision, approved: false }), /신뢰/);
  let state = await channel.call('window:910', 'test-list-edit', { testEdit: { action: 'folder', path: 'verification' }, revision: before.testList.revision, approved: true });
  const stale = await channel.call('window:910', 'test-list-edit', { testEdit: { action: 'folder', path: 'verification' }, revision: before.testList.revision, approved: true });
  assert.match(stale.error, /changed/);
  const code = path.join(project, 'verification/two.sv');
  await fs.writeFile(code, 'module channel_a; endmodule\nmodule channel_b; endmodule\n');
  state = await channel.call('window:910', 'inputs');
  assert.equal(state.tests.filter(test => test.top.startsWith('channel_')).length, 2);
  const name = state.tests.find(test => test.top === 'channel_a').name;
  state = await channel.call('window:910', 'test-list-edit', { testEdit: { action: 'exclude', file: 'verification/two.sv', top: 'channel_a', name }, revision: state.testList.revision, approved: true });
  assert.ok(!state.tests.some(test => test.top === 'channel_a'));
  const preferences = await fs.readFile(path.join(project, 'rtl-tests.json'));
  await channel.call('window:914', 'inspect', { root: project });
  const peer = await channel.call('window:914', 'state');
  assert.ok(!peer.tests.some(test => test.top === 'channel_a'));
  await fs.unlink(code); state = await channel.call('window:910', 'inputs');
  assert.ok(!state.tests.some(test => test.top.startsWith('channel_')));
  assert.deepEqual(await fs.readFile(path.join(project, 'rtl-tests.json')), preferences);
  assert.equal(tools, 0); assert.equal(state.history.length, 0);
  await channel.call('window:914', 'close');
  receipt.checks.push('Real TB command dispatch rejects missing/stale/untrusted requests, detects two tops/deletion, persists exclusion across sessions and invokes zero tools');
  await channel.call('window:910', 'close'); listener.dispose();
  receipt.checks.push('Pinned event lifecycle and real host inspect/approval/awaited close work without a native window');
  await channel.call('window:911', 'state');
  const explicitListener = channel.listen('window:911', 'state')(() => {});
  // Set the same runtime quarantine flag tested through real process failures in process-host tests.
  const explicit = channel.session('window:911'); explicit.host.service.failedCleanup = 'injected cleanup failure';
  assert.equal(explicit.events.hasListeners(), true);
  await assert.rejects(channel.call('window:911', 'close'), /cleanup failure/);
  assert.equal(explicit.events.hasListeners(), false); explicitListener.dispose();
  receipt.checks.push('Explicit close rejects cleanup failure and disposes its real emitter');
  await channel.call('window:912', 'state');
  channel.session('window:912').host.service.failedCleanup = 'injected disconnect failure';
  channel.disconnect('window:912'); await tick(); assert.ok(errors.some(error => error.message === 'injected disconnect failure'));
  await channel.call('window:913', 'state');
  channel.session('window:913').host.service.failedCleanup = 'injected disposal failure';
  channel.dispose(); await tick(); assert.ok(errors.some(error => error.message === 'injected disposal failure'));
  receipt.checks.push('Disconnect/dispose route both rejected closes through real Code-OSS unexpected-error handler');
  receipt.passed = true;
} catch (error) { receipt.error = String(error); process.exitCode = 1; }
finally {
  channel.dispose(); await tick(); setUnexpectedErrorHandler(previous);
  await fs.writeFile(path.join(directory, 'receipt.json'), JSON.stringify(receipt, null, 2)); console.log(JSON.stringify(receipt, null, 2));
}
