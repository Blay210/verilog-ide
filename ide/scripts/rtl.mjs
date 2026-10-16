// Development launcher for the IDE-owned shared CLI.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { runCli } = require('../dist/runtime/cli.js');
process.exitCode = await runCli(process.argv.slice(2), fileURLToPath(new URL('../language/python/analyze.py', import.meta.url)));
