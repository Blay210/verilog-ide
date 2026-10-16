import path from 'node:path';
import { runCli } from './cli';
void runCli(process.argv.slice(2), path.join(__dirname, 'analyze.py')).then(code => { process.exitCode = code; }, error => { process.stderr.write(String(error) + '\n'); process.exitCode = 1; });
