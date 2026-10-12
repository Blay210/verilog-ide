import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { ToolSetupService, requireExternalTools } = require('../dist/runtime/tool-setup.js');
const { downloadVerified } = require('../dist/runtime/toolchain/install.js');
const { createHash } = await import('node:crypto');

async function fixture() {
  const root = await fs.mkdtemp(path.resolve('.dev/tool-setup-'));
  const project = path.join(root, 'project'), home = path.join(root, 'shared');
  await fs.mkdir(project); return { root, project, home };
}
test('explicit plan approval, denial, stale token and immutable installer inputs', async () => {
  const f = await fixture(); let installs = 0, checks = 0;
  const service = new ToolSetupService(f.home, [f.project], async () => {
    checks++; return { location: f.home, components: ['compiler'], install: async () => { installs++; } };
  });
  await assert.rejects(service.prepare('language', false), /Trust/); assert.equal(checks, 0);
  let result = await service.prepare('language', true); assert.equal(result.phase, 'awaitingApproval'); assert.equal(installs, 0);
  const id = result.plan.id;
  await assert.rejects(service.approve('forged', true, true), /expired/); assert.equal(installs, 0);
  await service.approve(id, false, true); assert.equal(service.state.phase, 'cancelled'); assert.equal(installs, 0);
  result = await service.prepare('language', true);
  await assert.rejects(service.approve(id, true, true), /expired/);
  await assert.rejects(service.approve(result.plan.id, true, false), /Trust/);
  result.plan.components[0] = 'arbitrary UI text';
  await service.approve(result.plan.id, true, true); assert.equal(installs, 1); assert.equal(service.state.phase, 'ready');
  await assert.rejects(service.approve(result.plan.id, true, true), /expired/);
});
test('reuse needs no installation and failure, cancellation, close cleanup and retry remain separate', async () => {
  const f = await fixture(); let mode = 'reuse', cleaned = false;
  const service = new ToolSetupService(f.home, [f.project], async (kind, home, context) => {
    context.onLog('checking\n');
    if (mode === 'failed') throw Error('Network unavailable');
    return { location: home, components: [], ...(mode === 'install' ? { install: async ({signal}) => {
      try { await new Promise((resolve, reject) => { signal.addEventListener('abort', () => reject(Error('cancelled')), {once:true}); }); }
      finally { await new Promise(resolve => setTimeout(resolve, 20)); cleaned = true; }
    } } : {}) };
  });
  assert.equal((await service.prepare('simulation', true)).phase, 'ready');
  mode = 'failed'; assert.equal((await service.prepare('simulation', true)).phase, 'failed');
  mode = 'install'; const plan = (await service.prepare('simulation', true)).plan;
  const work = service.approve(plan.id, true, true);
  await new Promise(resolve => setTimeout(resolve, 30));
  await assert.rejects(service.prepare('language', true), /already running/);
  await service.close(); await work; assert.ok(cleaned); assert.equal(service.state.phase, 'cancelled');
  mode = 'reuse'; assert.equal((await service.prepare('simulation', true)).phase, 'ready');
});
test('tool storage rejects project-contained paths and links before probing or installing', async () => {
  const f = await fixture();
  await assert.rejects(requireExternalTools(f.project, [f.project]), /outside user project/);
  await assert.rejects(requireExternalTools(path.join(f.project, '.rtl/tools'), [f.project]), /outside user project/);
  const link = path.join(f.root, 'linked-project');
  await fs.symlink(f.project, link, 'junction');
  await assert.rejects(requireExternalTools(path.join(link, 'tools'), [f.project]), /outside user project/);
  await requireExternalTools(f.home, [f.project]);
});
test('cancelling during the initial path check prevents late tool probes or approval plans', async () => {
  const f = await fixture(); let probes = 0;
  const service = new ToolSetupService(f.home, [f.project], async () => { probes++; return { location: f.home, components: [] }; });
  const pending = service.prepare('language', true);
  await service.close(); const result = await pending;
  assert.equal(probes, 0); assert.equal(result.phase, 'cancelled'); assert.equal(result.plan, undefined);
});
test('official download verification rejects network and checksum failures, cleans partial data and supports retry', async () => {
  const f = await fixture(); const originalFetch = globalThis.fetch;
  const bytes = Buffer.from('fixture download'), hash = createHash('sha256').update(bytes).digest('hex');
  const file = path.join(f.root, 'verified.zip');
  try {
    globalThis.fetch = async () => new Response('Unavailable', {status:503});
    await assert.rejects(downloadVerified('https://example.test/file', 'https://example.test/hash', file), /HTTP 503/);
    globalThis.fetch = async url => new Response(String(url).endsWith('hash') ? '0'.repeat(64) : bytes);
    await assert.rejects(downloadVerified('https://example.test/file', 'https://example.test/hash', file), /SHA256 mismatch/);
    await assert.rejects(fs.stat(file + '.partial'), /ENOENT/);
    globalThis.fetch = async url => new Response(String(url).endsWith('hash') ? hash : bytes);
    await downloadVerified('https://example.test/file', 'https://example.test/hash', file);
    assert.deepEqual(await fs.readFile(file), bytes);
  } finally { globalThis.fetch = originalFetch; }
});
