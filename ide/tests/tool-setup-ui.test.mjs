import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import { transformSync } from 'esbuild';

const require = createRequire(import.meta.url);
const { ToolSetupService } = require('../dist/runtime/tool-setup.js');
const source = await fs.readFile(new URL('../language/src/tools.ts', import.meta.url), 'utf8');
const code = transformSync(source, { loader: 'ts', format: 'cjs', target: 'node22' }).code;

// Exercise the actual editor adapter and real approval service. Only editor UI
// responses and the external tool planner are substituted; no install/network.
async function fixture(planner, choices = []) {
  const directory = await fs.mkdtemp(path.resolve('.dev/tool-ui-'));
  const project = path.join(directory, '설계 프로젝트'); await fs.mkdir(project);
  const commands = new Map(), messages = [], subscriptions = [];
  let service, tokenHandler;
  const api = {
    ProgressLocation: { Notification: 15 },
    workspace: { isTrusted: true, workspaceFolders: [{ uri: { fsPath: project } }],
      getConfiguration: () => ({ get: () => path.join(directory, 'shared tools') }) },
    commands: {
      registerCommand: (name, action) => { commands.set(name, action); return { dispose() {} }; },
      executeCommand: async name => messages.push({ restart: name })
    },
    window: {
      createOutputChannel: () => ({ replace() {}, show() {}, dispose() {} }),
      showQuickPick: async () => ({ group: 'simulation' }),
      withProgress: async (options, action) => action({ report() {} }, {
        isCancellationRequested: false,
        onCancellationRequested: handler => { tokenHandler = handler; return { dispose() {} }; }
      }),
      showInformationMessage: async (...args) => {
        messages.push({ info: args });
        if (args[1]?.modal) { const response = choices.shift(); return typeof response === 'function' ? response(api) : response; }
      },
      showErrorMessage: async (...args) => { messages.push({ error: args }); return choices.shift(); }
    }
  };
  class Service extends ToolSetupService {
    constructor(home, projects, unused, notify) { super(home, projects, planner, notify); service = this; }
  }
  const loaded = new Module(path.join(directory, 'tools.cjs'));
  loaded.require = name => name === 'vscode' ? api : name === '../../runtime/tool-setup' ? { ToolSetupService: Service } : require(name);
  loaded._compile(code, path.join(directory, 'tools.cjs'));
  const close = loaded.exports.registerTools({ subscriptions });
  return { api, commands, messages, close, get service() { return service; }, cancel: () => tokenHandler?.(),
    dispose: () => subscriptions.at(-1).dispose() };
}

test('tool UI denies install, shows concrete plan and preserves editable untrusted workspace', async () => {
  let installs = 0, probes = 0;
  const f = await fixture(async (kind, home) => { probes++; return { location: home, components: ['compiler'], install: async () => installs++ }; });
  try {
    f.api.workspace.isTrusted = false;
    await f.commands.get('rtl.setupTools')(); assert.equal(probes, 0); assert.equal(f.service, undefined);
    f.api.workspace.isTrusted = true;
    const result = await f.commands.get('rtl.setupLanguage')();
    assert.equal(result.phase, 'cancelled', result.error); assert.equal(installs, 0);
    const modal = f.messages.find(message => message.info?.[1]?.modal).info;
    assert.match(modal[1].detail, /shared tools/); assert.match(modal[1].detail, /compiler/); assert.match(modal[1].detail, /SHA256/);
  } finally { await f.close(); }
});

test('tool UI retries using a fresh plan and explicit approval, then restarts language client', async () => {
  let attempts = 0, installs = 0;
  const f = await fixture(async (kind, home) => {
    if (++attempts === 1) throw Error('Network unavailable');
    return { location: home, components: ['slang'], install: async () => installs++ };
  }, ['재시도', '설치']);
  try {
    assert.equal((await f.commands.get('rtl.setupLanguage')()).phase, 'ready');
    assert.equal(attempts, 2); assert.equal(installs, 1);
    assert.ok(f.messages.some(message => message.error?.[0].includes('Network unavailable')));
    assert.ok(f.messages.some(message => message.restart === 'rtl.restartLanguage'));
  } finally { await f.close(); }
});

test('tool UI cancels without installing when trust changes while approval dialog is open', async () => {
  let installs = 0;
  const f = await fixture(async (kind, home) => ({ location: home, components: ['slang'], install: async () => installs++ }),
    [api => { api.workspace.isTrusted = false; return '설치'; }]);
  try {
    assert.equal((await f.commands.get('rtl.setupLanguage')()).phase, 'cancelled');
    assert.equal(installs, 0); assert.ok(f.messages.some(message => message.info?.[0].includes('신뢰 상태가 변경')));
  } finally { await f.close(); }
});

test('tool UI notification cancellation awaits installer cleanup and does not report success', async () => {
  let started, cleaned = false;
  const running = new Promise(resolve => { started = resolve; });
  const f = await fixture(async (kind, home) => ({ location: home, components: ['compiler'], install: async ({ signal }) => {
    started();
    try { await new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(Error('cancel')), { once: true })); }
    finally { await new Promise(resolve => setTimeout(resolve, 20)); cleaned = true; }
  } }), ['설치']);
  try {
    const operation = f.commands.get('rtl.setupTools')(); await running; f.cancel();
    assert.equal((await operation).phase, 'cancelled'); assert.equal(cleaned, true);
    assert.ok(!f.messages.some(message => message.info?.[0].includes('검증이 완료')));
  } finally { await f.close(); }
});

test('tool UI disposal during approval invalidates pending installation', async () => {
  let installs = 0, f;
  f = await fixture(async (kind, home) => ({ location: home, components: ['compiler'], install: async () => installs++ }),
    [() => { f.dispose(); return '설치'; }]);
  try {
    assert.equal((await f.commands.get('rtl.setupLanguage')()).phase, 'cancelled'); assert.equal(installs, 0);
  } finally { await f.close(); }
});

