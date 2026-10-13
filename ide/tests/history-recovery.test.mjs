import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';

const require = createRequire(import.meta.url);
const { readHistory } = require('../dist/runtime/core/index.js');

async function fixture(t) {
  const project = await fs.mkdtemp(path.join(root, '.dev/history-recovery-'));
  t.after(() => fs.rm(project, { recursive: true, force: true }));
  async function record(name, time, waveform = true) {
    const directory = path.join(project, '.rtl/runs', name);
    await fs.mkdir(directory, { recursive: true });
    const value = { name: 'counter', top: 'counter_tb', runId: randomUUID(),
      status: 'passed', durationMs: 1, directory, log: path.join(directory, 'run.log'),
      startedAt: time, message: 'Original result message.' };
    await fs.writeFile(value.log, name);
    if (waveform) {
      value.waveform = path.join(directory, 'trace.vcd');
      await fs.writeFile(value.waveform, 'recorded trace');
    }
    const file = path.join(directory, 'result.json');
    const bytes = JSON.stringify(value);
    await fs.writeFile(file, bytes);
    return { value, file, bytes };
  }
  return { project, record };
}

test('missing newest trace keeps its result/log and never promotes an older waveform', async t => {
  const { project, record } = await fixture(t);
  const old = await record('old', '2026-10-10T00:00:00.000Z');
  const recent = await record('recent', '2026-10-11T00:00:00.000Z');
  await fs.unlink(recent.value.waveform);
  const rows = await readHistory(project);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].runId, recent.value.runId);
  assert.equal(rows[0].status, 'passed');
  assert.equal(rows[0].waveform, undefined);
  assert.equal(rows[0].traceIdentity.state, 'unavailable');
  assert.match(rows[0].message, /파형/);
  assert.match(rows[0].message, /Original result message/);
  assert.equal(await fs.readFile(rows[0].log, 'utf8'), 'recent');
  assert.equal(rows[1].waveform, old.value.waveform);
  assert.equal(await fs.readFile(recent.file, 'utf8'), recent.bytes);
  await fs.writeFile(recent.value.waveform, 'recorded trace');
  const restored = (await readHistory(project))[0];
  assert.equal(restored.waveform, recent.value.waveform);
  assert.equal(restored.message, recent.value.message);
});

test('missing log and trace preserve run identity/status without changing stored metadata', async t => {
  const { project, record } = await fixture(t);
  const recent = await record('recent', '2026-10-11T00:00:00.000Z');
  await fs.unlink(recent.value.log); await fs.unlink(recent.value.waveform);
  const [row] = await readHistory(project);
  assert.equal(row.runId, recent.value.runId);
  assert.equal(row.status, 'passed');
  assert.match(row.message, /로그/); assert.match(row.message, /파형/);
  assert.equal(await fs.readFile(recent.file, 'utf8'), recent.bytes);
});

test('damaged records and unsafe artifacts remain excluded while other history survives', async t => {
  const { project, record } = await fixture(t);
  const good = await record('good', '2026-10-10T00:00:00.000Z');
  const broken = await record('broken', '2026-10-11T00:00:00.000Z');
  await fs.writeFile(broken.file, '{interrupted');
  const foreign = await record('foreign', '2026-10-11T00:00:00.000Z');
  await fs.writeFile(foreign.file, JSON.stringify({ ...foreign.value, waveform: path.join(project, 'absent.vcd') }));
  const directory = await record('directory', '2026-10-11T00:00:00.000Z');
  await fs.unlink(directory.value.waveform); await fs.mkdir(directory.value.waveform);
  const linked = await record('linked', '2026-10-11T00:00:00.000Z');
  await fs.unlink(linked.value.log);
  await fs.symlink(good.value.directory, linked.value.log, process.platform === 'win32' ? 'junction' : 'dir');
  const rows = await readHistory(project);
  assert.deepEqual(rows.map(row => row.runId), [good.value.runId]);
  await assert.rejects(readHistory(project, 0), /limit/);
});

test('legacy records with missing logs retain mtime ordering and history limits', async t => {
  const { project, record } = await fixture(t);
  const legacy = await record('legacy', '2026-10-10T00:00:00.000Z', false);
  const value = { ...legacy.value }; delete value.startedAt; delete value.runId;
  await fs.writeFile(legacy.file, JSON.stringify(value));
  await fs.utimes(legacy.file, new Date('2026-10-10T00:00:00.000Z'), new Date('2026-10-10T00:00:00.000Z'));
  await fs.unlink(value.log);
  const latest = await record('latest', '2026-10-11T00:00:00.000Z', false);
  const rows = await readHistory(project);
  assert.equal(rows.length, 2); assert.equal(rows[1].startedAt, '2026-10-10T00:00:00.000Z');
  assert.deepEqual((await readHistory(project, 1)).map(row => row.runId), [latest.value.runId]);
});

test('bounded parallel history reads preserve timestamp ties, limit and fresh deletion recovery', async t => {
  const { project, record } = await fixture(t);
  const records = [];
  for (let i = 39; i >= 0; i--) records.push(await record(`run-${String(i).padStart(2, '0')}`, '2026-10-11T00:00:00.000Z', false));
  const expected = records.map(row => row.value).sort((a, b) => a.directory.localeCompare(b.directory));
  assert.deepEqual((await readHistory(project, 10)).map(row => row.runId), expected.slice(0, 10).map(row => row.runId));
  await fs.unlink(expected[0].log);
  const rows = await readHistory(project, 1000);
  assert.deepEqual(rows.map(row => row.runId), expected.map(row => row.runId));
  assert.match(rows[0].message, /로그/);
  assert.equal(rows.length, 40);
});
