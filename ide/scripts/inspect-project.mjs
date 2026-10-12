import path from 'node:path';
import { createRequire } from 'node:module';

// Developer inspection only. No config generation, external tools or caching.
if (process.argv.length !== 3) throw Error('Usage: node scripts/inspect-project.mjs <project-folder>');
const { discoverProject } = createRequire(import.meta.url)('../dist/runtime/core/index.js');
console.log(JSON.stringify(await discoverProject(path.resolve(process.argv[2])), null, 2));
