import fs from 'node:fs';
import path from 'node:path';

// Some extension API warnings appear only in the extension-host log, not stdout.
export function readAcceptanceDiagnostics(fixture) {
  const host = fs.readFileSync(path.join(fixture, 'host.log'), 'utf8');
  const logRoot = path.join(fixture, 'profile/logs');
  const extensionLogs = fs.existsSync(logRoot) ? fs.readdirSync(logRoot, { recursive: true })
    .filter(name => /(?:^|[\\/])exthost\.log$/i.test(name))
    .map(name => fs.readFileSync(path.join(logRoot, name), 'utf8')).join('\n') : '';
  const all = `${host}\n${extensionLogs}`;
  return {
    languageDetectionError: /require is not defined|vscode-regexp-languagedetection.*ERR_FILE_NOT_FOUND/.test(all),
    attributionWarning: /Could not identify extension for/.test(all),
  };
}
