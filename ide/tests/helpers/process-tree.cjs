const { spawn } = require('node:child_process');
const level = Number(process.argv[2]);
if (!Number.isInteger(level) || level < 0 || level > 2) throw Error('Invalid private process-tree fixture');
process.stdout.write(`TREE ${JSON.stringify({ pid: process.pid, level })}\n`);
if (level > 0) spawn(process.execPath, [__filename, String(level - 1)], { stdio: ['ignore', 'inherit', 'inherit'], windowsHide: true });
setInterval(() => process.stdout.write(`tick ${level}\n`), 100);
if (level === 2 && process.argv.includes('--exit-leader')) setTimeout(() => process.exit(0), 400);
