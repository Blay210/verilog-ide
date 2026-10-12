// Development CLI; the future GUI calls the same IDE-owned SimulationService.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { SimulationService } = require('../dist/runtime/simulation.js');
const service = new SimulationService();
const cancel = () => service.cancel();
process.on('SIGINT', cancel);
process.on('SIGTERM', cancel);
try {
  const [command, selection, ...extra] = process.argv.slice(2);
  if (extra.length || !['check', 'test'].includes(command) || (command === 'check' && selection) || (command === 'test' && !selection)) {
    throw Error('Usage: node scripts/rtl.mjs check | test <name> | test --all (current directory is the project)');
  }
  if (command === 'check') {
    const project = await service.inspect(process.cwd());
    process.stdout.write(JSON.stringify({ name: project.name, tests: project.tests.map(t => ({ name: t.name, top: t.top })) }, null, 2) + '\n');
  } else {
    const results = await service.run({ root: process.cwd(), ...(selection === '--all' ? {} : { names: [selection] }) }, { onLog: text => process.stderr.write(text) });
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');
    process.exitCode = results.length && results.every(r => r.status === 'passed') ? 0 : 1;
  }
} catch (error) { process.stderr.write(String(error) + '\n'); process.exitCode = 1; }
finally { process.off('SIGINT', cancel); process.off('SIGTERM', cancel); }
