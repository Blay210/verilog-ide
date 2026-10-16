import path from 'node:path';

// Pure argument/environment construction, shared by the checked launcher tests.
export function launchPlan(root, saved, environment = process.env) {
  const bundled = saved.version === 3 && saved.kind === 'bundled';
  if (!bundled && saved.version !== 2) throw Error('Unsupported prepared launch.');
  const data = path.join(root, '.dev/rtl-ide');
  const env = { ...environment, GIT_CEILING_DIRECTORIES: root };
  for (const key of ['ELECTRON_RUN_AS_NODE', 'NODE_PATH', 'NODE_OPTIONS', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'VSCODE_DEV', 'VSCODE_CODE_CACHE_PATH', 'NODE_ENV']) delete env[key];
  if (!bundled) Object.assign(env, { VSCODE_DEV: '1', NODE_ENV: 'development' });
  const source = path.join(root, 'upstream');
  const args = [...(bundled ? [] : [source]), '--new-window', '--skip-welcome', '--skip-release-notes',
    '--user-data-dir', path.join(data, 'profile'), '--shared-data-dir', path.join(data, 'shared'), '--extensions-dir', path.join(data, 'extensions')];
  return { executable: saved.executable, args, cwd: bundled ? path.dirname(saved.executable) : source, env };
}
