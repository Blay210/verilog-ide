import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { root, inside } from './environment.mjs';
import { readAcceptanceDiagnostics } from './acceptance-log.mjs';

// Sequential real native hosts, each with a new private workspace/profile.
const report = { runs: [], editorPassed: false, startupPassed: false };
for (let index = 0; index < 3; index++) {
  const start = performance.now();
  const output = await new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const child = spawn(process.execPath, [path.join(root, 'scripts/verify-editor.mjs')], {
      cwd: root, env: process.env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', chunk => { stdout += chunk; process.stdout.write(chunk); });
    child.stderr.on('data', chunk => { stderr += chunk; process.stderr.write(chunk); });
    child.on('error', reject);
    child.on('exit', code => resolve({ code, stdout, stderr }));
  });
  const fixture = output.stdout.match(/Private editor acceptance: (.+)\r?\n/)?.[1]?.trim();
  if (!fixture || !inside(path.join(root, '.dev'), fixture)) throw Error('Missing or escaped native fixture.');
  const log = fs.readFileSync(path.join(fixture, 'host.log'), 'utf8');
  const receiptFile = path.join(fixture, 'receipt.json');
  const receipt = fs.existsSync(receiptFile) ? JSON.parse(fs.readFileSync(receiptFile, 'utf8')) : null;
  const run = {
    fixture, exit: output.code, elapsedMs: Math.round(performance.now() - start),
    editorPassed: output.code === 0 && receipt?.passed === true,
    startupWarning: /did not start in 10 seconds/.test(log),
    unresponsive: /is unresponsive/.test(log),
    responsiveRecovery: /is responsive/.test(log),
    defaultInspector: /debugger listening|Debugger attached|debugger inspector/.test(log),
    automaticProfiling: /starting to profile NOW/.test(log),
    agentStarted: /agent host started|MessagePort acquired/.test(log),
    unexpectedException: /uncaught exception|uncaught Error|UnhandledPromiseRejection/i.test(log),
    ...readAcceptanceDiagnostics(fixture),
    stages: receipt?.stages ?? [],
  };
  report.runs.push(run);
  fs.writeFileSync(path.join(root, '.dev/h1-startup-repeat-receipt.json'), JSON.stringify(report, null, 2));
  console.log(`Run ${index + 1}: editor=${run.editorPassed}, startupWarning=${run.startupWarning}, unresponsive=${run.unresponsive}, elapsed=${run.elapsedMs}ms`);
}
report.editorPassed = report.runs.every(run => run.editorPassed);
report.startupPassed = report.runs.every(run => run.editorPassed && !run.startupWarning && !run.unresponsive && !run.defaultInspector && !run.automaticProfiling && !run.agentStarted && !run.unexpectedException && !run.languageDetectionError && !run.attributionWarning);
fs.writeFileSync(path.join(root, '.dev/h1-startup-repeat-receipt.json'), JSON.stringify(report, null, 2));
console.log(`Editor gate: ${report.editorPassed}; startup gate: ${report.startupPassed}`);
if (!report.editorPassed || !report.startupPassed) process.exitCode = 1;
