import path from 'node:path';
import { SimulationService } from './simulation';
import { importProvider } from './import-runtime';
import { initializeSourceProject, createSourceProject } from './core/workspace-project';
import { readHistory, prepareProject, compareConfiguredResultInputs } from './core/index';
import { toolsHome, detectTools } from './toolchain/detect';
import { verifyToolchain } from './toolchain/verify';
import { ToolSetupService } from './tool-setup';

const usage = 'rtl init [name] | check [--tools] [--source-order] | test <name|--all> [--tag tag] [--jobs 1..4] | history [--limit 1..1000] [--verify-inputs] | tools [--yes]\nCommon: --project directory --tools-directory directory --json';
/** IDE-owned CLI using the same Core and explicit install boundary as the GUI. */
export async function runCli(args: string[], bridge: string, cwd = process.cwd()): Promise<number> {
  const controller = new AbortController(); let cancelled = false, setup: ToolSetupService | undefined;
  const cancel = () => { cancelled = true; controller.abort(); setup?.cancel(); };
  process.on('SIGINT', cancel); process.on('SIGTERM', cancel);
  const log = (text: string) => process.stderr.write(text);
  const emit = (value: unknown) => process.stdout.write(JSON.stringify(value, null, 2) + '\n');
  try {
    const command = args[0], positional: string[] = [], flags = new Set<string>(), values = new Map<string, string>(), tags: string[] = [];
    for (let i = 1; i < args.length; i++) {
      const token = args[i];
      if (['--project', '--tools-directory', '--jobs', '--limit', '--tag'].includes(token)) {
        const value = args[++i]; if (!value || value.startsWith('--')) throw Error(`Missing value for ${token}.`);
        if (token === '--tag') tags.push(value);
        else { if (values.has(token)) throw Error(`Duplicate ${token}.`); values.set(token, value); }
      } else if (['--all', '--json', '--yes', '--verify-inputs', '--tools', '--source-order'].includes(token)) flags.add(token);
      else if (token.startsWith('-')) throw Error(`Unknown option ${token}.`);
      else positional.push(token);
    }
    if (!['init', 'check', 'test', 'history', 'tools'].includes(command)) throw Error(usage);
    const allowed: Record<string, string[]> = { init: [], check: ['--tools', '--source-order'], test: ['--all', '--tag', '--jobs'], history: ['--limit', '--verify-inputs'], tools: ['--yes'] };
    for (const option of [...flags, ...values.keys(), ...(tags.length ? ['--tag'] : [])]) if (!['--project', '--tools-directory', '--json', ...allowed[command]].includes(option)) throw Error(`${option} is unavailable for ${command}.`);
    if ((command === 'init' ? positional.length > 1 : command === 'test' ? positional.length > 1 || (flags.has('--all') && positional.length > 0) || (!positional.length && !flags.has('--all') && !tags.length) : positional.length > 0)) throw Error(usage);
    const root = path.resolve(cwd, values.get('--project') ?? '.'), home = path.resolve(values.get('--tools-directory') || toolsHome());
    const context = { signal: controller.signal, onLog: log };
    const service = new SimulationService(undefined, (project, context, directory) => importProvider(project.root, bridge, context, directory));
    if (command === 'init') {
      emit({ root: positional[0] ? await createSourceProject(root, positional[0]) : await initializeSourceProject(root, path.basename(root)) });
    } else if (command === 'test') {
      const results = await service.run({ root, names: positional.length ? positional : undefined, tags, jobs: values.has('--jobs') ? Number(values.get('--jobs')) : undefined, toolsDirectory: home }, context);
      emit(results); return cancelled ? 130 : results.length && results.every(result => result.status === 'passed') ? 0 : 1;
    } else if (command === 'check') {
      let project = await service.inspect(root, controller.signal);
      if (flags.has('--source-order') && project.packageOrder === 'auto' && project.packageSources?.length) project = await prepareProject(project, await importProvider(root, bridge, context, home), context);
      if (flags.has('--tools')) { const tools = await detectTools(context, home); if (!tools.toolchain) throw Error('Simulation toolchain unavailable.'); await verifyToolchain(tools.toolchain, context, home); }
      emit({ name: project.name, tests: project.tests.map(test => ({ name: test.name, top: test.top, ...(test.tags?.length ? { tags: test.tags } : {}) })), ...(flags.has('--source-order') ? { sources: project.sources } : {}) });
    } else if (command === 'history') {
      const history = await readHistory(root, values.has('--limit') ? Number(values.get('--limit')) : 100);
      if (flags.has('--verify-inputs')) {
        const project = await service.inspect(root, controller.signal), results = [];
        for (const result of history) { controller.signal.throwIfAborted(); results.push({ ...result, inputs: await compareConfiguredResultInputs(result, project, controller.signal) }); }
        emit(results);
      } else emit(history);
    } else {
      setup = new ToolSetupService(home, [root]);
      let state = await setup.prepare('simulation', true);
      if (state.phase === 'awaitingApproval' && flags.has('--yes')) state = await setup.approve(state.plan!.id, true, true);
      emit(state); if (state.phase !== 'ready') return cancelled ? 130 : 1;
    }
    return cancelled ? 130 : 0;
  } catch (error) { log(String(error) + '\n'); return cancelled ? 130 : 1; }
  finally { await setup?.close(); process.off('SIGINT', cancel); process.off('SIGTERM', cancel); }
}
