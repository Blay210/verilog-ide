import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { parseWorkspaceSession, parseWaveSession } = require('../dist/runtime/workspace-state.js');
const state = { paths: ['tb.dut.data'], expanded: ['tb.dut.data', 'missing'], styles: [['tb.dut.data', { radix: 'hex', color: 'pink' }], ['missing', { color: 'blue' }]], radix: 'auto', from: '9002193029001000000', to: '9002193029011000000', a: '9002193029005000000' };
test('wave state preserves exact long timestamps and only selected signal styles', () => {
  const parsed = parseWaveSession(state);
  assert.equal(parsed.a, state.a); assert.deepEqual(parsed.expanded, ['tb.dut.data']); assert.equal(parsed.styles.length, 1);
  assert.equal(parseWaveSession({ ...state, from: '-1' }), undefined);
  assert.equal(parseWaveSession({ ...state, paths: Array(33).fill('signal') }), undefined);
});
test('workspace metadata is bounded, rejects damaged state and never restores executable FST entries', () => {
  assert.deepEqual(parseWorkspaceSession('{'), { version: 1, projects: [] });
  const wave = { id: '11111111-1111-4111-8111-111111111111', name: 'tb.first', state };
  const parsed = parseWorkspaceSession(JSON.stringify({ version: 1, activeRoot: 'D:/설계 폴더', projects: Array.from({ length: 25 }, (_, index) => ({ root: `D:/p${index}`, waves: [wave, { ...wave, id: '22222222-2222-4222-8222-222222222222', file: 'wave.fst' }], jobs: 100, selected: ['tb.first'] })) }));
  assert.equal(parsed.projects.length, 20); assert.equal(parsed.projects[0].waves.length, 1); assert.equal(parsed.projects[0].jobs, 1);
  assert.equal(parsed.projects[0].waves[0].state.from, state.from);
});
