import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { launchPlan } from '../scripts/launch-plan.mjs';

test('bundled launch uses real app resources and preserves profile paths without inherited development mode', () => {
  const root = path.resolve('.'), executable = path.join(root, '.dev/pulse-bundled-test/Pulse.exe');
  const inherited = { VSCODE_DEV: '1', NODE_ENV: 'development', NODE_OPTIONS: '--inspect', ELECTRON_RUN_AS_NODE: '1', NODE_PATH: 'other', GIT_DIR: 'other', VSCODE_CODE_CACHE_PATH: 'stale', KEEP_ME: 'yes' };
  const plan = launchPlan(root, { version: 3, kind: 'bundled', executable }, inherited);
  assert.equal(plan.executable, executable); assert.equal(plan.cwd, path.dirname(executable));
  assert.equal(plan.args.includes(path.join(root, 'upstream')), false);
  for (const key of Object.keys(inherited).filter(k => k !== 'KEEP_ME')) assert.equal(key in plan.env, false, key);
  assert.equal(plan.env.KEEP_ME, 'yes'); assert.equal(inherited.VSCODE_DEV, '1');
  for (const [flag, name] of [['--user-data-dir', 'profile'], ['--shared-data-dir', 'shared'], ['--extensions-dir', 'extensions']]) assert.equal(plan.args[plan.args.indexOf(flag) + 1], path.join(root, '.dev/rtl-ide', name));
});

test('source development fallback remains explicit and unknown prepared modes are rejected', () => {
  const root = path.resolve('.'), plan = launchPlan(root, { version: 2, executable: 'dev.exe' }, {});
  assert.equal(plan.args[0], path.join(root, 'upstream')); assert.equal(plan.env.VSCODE_DEV, '1');
  assert.equal(plan.env.NODE_ENV, 'development');
  assert.throws(() => launchPlan(root, { version: 3, kind: 'wrong' }), /Unsupported/);
});
