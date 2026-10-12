import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root } from '../scripts/environment.mjs';
import { readAcceptanceDiagnostics } from '../scripts/acceptance-log.mjs';

test('acceptance catches extension-only API warnings and renderer language loader errors', () => {
  const fixture = fs.mkdtempSync(path.join(root, '.dev/log-check-'));
  const directory = path.join(fixture, 'profile/logs/private/window1/exthost');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(fixture, 'host.log'), 'Started local extension host.');
  const extensionLog = path.join(directory, 'exthost.log');
  fs.writeFileSync(extensionLog, 'Could not identify extension for vscode require call');
  assert.deepEqual(readAcceptanceDiagnostics(fixture), { languageDetectionError: false, attributionWarning: true });
  fs.writeFileSync(extensionLog, 'Eager extensions activated');
  fs.writeFileSync(path.join(fixture, 'host.log'), 'ReferenceError: require is not defined');
  assert.deepEqual(readAcceptanceDiagnostics(fixture), { languageDetectionError: true, attributionWarning: false });
  fs.writeFileSync(path.join(fixture, 'host.log'), 'Test passed');
  assert.deepEqual(readAcceptanceDiagnostics(fixture), { languageDetectionError: false, attributionWarning: false });
});
