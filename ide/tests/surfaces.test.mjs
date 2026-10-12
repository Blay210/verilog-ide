import test from 'node:test';
import assert from 'node:assert/strict';
import { patches } from '../scripts/patches.mjs';

test('RTL excludes user extensions before scanning while Code-OSS retains scanning', () => {
  const patch = patches.find(p => p.id === 'rtl-no-user-extension-scan');
  const body = patch.after.slice(patch.after.indexOf('// RTL'));
  const evaluate = new Function(body + '\nreturn "scan upstream";');
  assert.deepEqual(evaluate.call({ productService: { applicationName: 'rtl-ide' } }), []);
  assert.equal(evaluate.call({ productService: { applicationName: 'code-oss' } }), 'scan upstream');
});

test('RTL unknown language detection skips history and model workers; upstream keeps them', async () => {
  const history = patches.find(p => p.id === 'rtl-language-detection-no-history-scan');
  const body = history.after.slice(history.after.indexOf('// RTL'), history.after.lastIndexOf('\n\t\tconst useHistory'));
  const evaluate = new Function('product', 'resource', 'supportedLangs', body + '\nreturn "upstream";');
  const calls = [];
  const context = { _languageDetectionWorkerClient: { detectLanguage: (...args) => { calls.push(args); return 'json'; } } };
  assert.equal(evaluate.call(context, { applicationName: 'rtl-ide' }, 'file', ['json']), 'json');
  assert.deepEqual(calls, [['file', undefined, false, ['json']]]);
  assert.equal(evaluate.call(context, { applicationName: 'code-oss' }, 'file', []), 'upstream');
  const guard = patches.find(p => p.id === 'rtl-language-detection-no-model-worker');
  const noWorker = new Function('product', guard.after + '\nreturn workerClient;');
  const worker = { _getOrCreateLanguageDetectionWorker: () => ({ workerClient: 'upstream worker' }) };
  assert.equal(noWorker.call(worker, { applicationName: 'rtl-ide' }), undefined);
  assert.equal(noWorker.call(worker, { applicationName: 'code-oss' }), 'upstream worker');
});

test('RTL disables only the default extension inspector and preserves explicit debug requests', () => {
  const patch = patches.find(p => p.id === 'rtl-no-default-extension-inspector');
  const expression = patch.after.match(/return (.*); }/)[1];
  const evaluate = new Function('parseExtensionHostDebugPort', `return ${expression};`);
  for (const applicationName of ['rtl-ide', 'code-oss']) for (const isBuilt of [true, false]) {
    const args = { 'inspect-extensions': '9231' };
    const context = { args, isBuilt, productService: { applicationName } };
    const result = evaluate.call(context, (actualArgs, builtDefaults) => ({ actualArgs, builtDefaults }));
    assert.equal(result.actualArgs, args);
    assert.equal(result.builtDefaults, isBuilt || applicationName === 'rtl-ide');
  }
});

test('automatic extension profiler is omitted for RTL and retained for Code-OSS', () => {
  const patch = patches.find(p => p.id === 'rtl-no-auto-extension-profiler');
  const evaluate = new Function('product', 'workbenchRegistry', 'ExtensionsAutoProfiler', 'LifecyclePhase', patch.after);
  const calls = [];
  const registry = { registerWorkbenchContribution: (...args) => calls.push(args) };
  evaluate({ applicationName: 'rtl-ide' }, registry, 'profiler', { Eventually: 4 });
  assert.equal(calls.length, 0);
  evaluate({ applicationName: 'code-oss' }, registry, 'profiler', { Eventually: 4 });
  assert.deepEqual(calls, [['profiler', 4]]);
});

test('RTL system scanning excludes self-host test extensions and preserves language and Git built-ins', () => {
  const patch = patches.find(p => p.id === 'exclude-development-test-builtins');
  const scan = new Function('defaultSystemExtensions', 'devSystemExtensions', patch.after + '\nreturn allSystemExtensions;');
  const ids = ['vscode.vscode-api-tests', 'VSCODE.VSCODE-TEST-RESOLVER', 'vscode.debug-auto-launch', 'vscode.git', 'vscode.git-base', 'vscode.json-language-features'];
  const extensions = ids.map(id => ({ identifier: { id } }));
  const rtl = scan.call({ productService: { applicationName: 'rtl-ide' } }, extensions.slice(0, 3), extensions.slice(3));
  assert.deepEqual(rtl.map(e => e.identifier.id), ids.slice(3));
  assert.deepEqual(scan.call({ productService: { applicationName: 'code-oss' } }, extensions, []), extensions);
});

test('RTL agent runtime remains disabled regardless of user AI setting or runtime availability', () => {
  const patch = patches.find(p => p.id === 'agent-enablement-product-policy');
  const evaluate = new Function('product', 'derived', 'aiFeaturesDisabled', patch.after);
  for (const available of [true, false]) for (const disabled of [true, false]) {
    const context = { _isAgentHostRuntimeAvailable: available };
    const derived = (_owner, read) => read({});
    evaluate.call(context, { applicationName: 'rtl-ide' }, derived, { read: () => disabled });
    assert.equal(context.enabled, false);
    evaluate.call(context, { applicationName: 'code-oss' }, derived, { read: () => disabled });
    assert.equal(context.enabled, available && !disabled);
  }
});

test('RTL agent prewarming is not registered and upstream prewarming remains available', () => {
  const patch = patches.find(p => p.id === 'agent-prewarm-no-registration');
  const evaluate = new Function('product', 'registerWorkbenchContribution2', 'AgentHostPrewarmContribution', 'WorkbenchPhase', patch.after);
  const calls = [];
  const contribution = { ID: 'prewarm-fixture' };
  evaluate({ applicationName: 'rtl-ide' }, (...args) => calls.push(args), contribution, { BlockRestore: 1 });
  assert.equal(calls.length, 0);
  evaluate({ applicationName: 'code-oss' }, (...args) => calls.push(args), contribution, { BlockRestore: 1 });
  assert.deepEqual(calls, [['prewarm-fixture', contribution, 1]]);
});

test('agent registrations are skipped for RTL IDE while upstream registrations remain available', () => {
  const registrations = patches.filter(p => /^(agent|remote-agent)-registration-/.test(p.id));
  assert.equal(registrations.length, 14);
  for (const patch of registrations) {
    const match = patch.before.match(/registerWorkbenchContribution2\((\w+)\.ID, (\w+), WorkbenchPhase\.(\w+)\);/);
    assert.ok(match, patch.id);
    assert.equal(match[1], match[2]);
    const calls = [];
    const contribution = { ID: 'fixture-contribution' };
    const evaluate = new Function('product', 'registerWorkbenchContribution2', 'WorkbenchPhase', match[1], patch.after);
    const register = (...args) => calls.push(args);
    evaluate({ applicationName: 'rtl-ide' }, register, { [match[3]]: 'fixture-phase' }, contribution);
    assert.equal(calls.length, 0, patch.id);
    evaluate({ applicationName: 'code-oss' }, register, { [match[3]]: 'fixture-phase' }, contribution);
    assert.deepEqual(calls, [['fixture-contribution', contribution, 'fixture-phase']], patch.id);
  }
});

test('install and recommendation actions are omitted without suppressing unrelated extension utilities', () => {
  const patch = patches.find(p => p.id === 'extensions-no-install-menus');
  class DisposableStore { }
  const evaluate = new Function('product', 'extensionActionOptions', 'DisposableStore', patch.after.slice(patch.before.length) + '\nreturn "registered";');
  for (const id of ['workbench.extensions.action.installVSIX', 'workbench.extensions.command.installFromVSIX', 'workbench.extensions.action.installExtensionFromLocation', 'workbench.extensions.action.installWorkspaceRecommendedExtensions']) {
    assert.ok(evaluate({ applicationName: 'rtl-ide' }, { id }, DisposableStore) instanceof DisposableStore);
    assert.equal(evaluate({ applicationName: 'code-oss' }, { id }, DisposableStore), 'registered');
  }
  assert.equal(evaluate({ applicationName: 'rtl-ide' }, { id: 'workbench.extensions.action.copyExtension' }, DisposableStore), 'registered');
});
