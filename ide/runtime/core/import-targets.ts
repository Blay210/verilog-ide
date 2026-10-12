import path from 'node:path';
import { lstat, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { discoverProject } from './discovery';
import { captureInputs } from './identity';
import { orderPackages } from './project';
import type { Project, PackageGraph, OperationContext } from './model';
import type { DesignHierarchy } from '../semantic/model';
import type { DiscoveryReview, ImportSelection, ImportPreview } from '../discovery-model';

export interface ImportSemanticProvider {
  dependencies(project: Project, context: OperationContext): Promise<PackageGraph>;
  hierarchy(project: Project, test: string, overlays: [], signal?: AbortSignal): Promise<DesignHierarchy>;
}
const key = (file: string) => process.platform === 'win32' ? path.resolve(file).toLowerCase() : path.resolve(file);
const schema = z.object({ ids: z.array(z.string().min(1).max(8192)).max(32),
  includeDirs: z.array(z.string().max(4096)).max(100).default([]),
  defines: z.record(z.string().max(4096)).default({}) }).strict();
/** Read-only execution preview. Never registers tests or publishes a manifest. */
export async function prepareImportTargets(review: DiscoveryReview, request: ImportSelection, provider: ImportSemanticProvider, signal?: AbortSignal): Promise<ImportPreview> {
  const selection = schema.parse({ ...request, includeDirs: request.includeDirs ?? review.execution?.includeDirs, defines: request.defines ?? review.execution?.defines });
  if (!selection.ids.length && !review.execution) throw Error('Select at least one execution top.');
  if (Object.keys(selection.defines).length > 100 || Object.keys(selection.defines).some(name => !/^[A-Za-z_][A-Za-z0-9_$]*$/.test(name) || ['RTL_WAVEFORM', 'RTL_FST'].includes(name))) throw Error('Invalid or reserved define; waveform defines are managed by the IDE.');
  const operation = signal ? AbortSignal.any([signal, AbortSignal.timeout(60000)]) : AbortSignal.timeout(60000);
  operation.throwIfAborted();
  const inventory = await discoverProject(review.inventory.root, { folders: review.folders, files: review.files, signal: operation });
  const selected = [...new Set(selection.ids)].map(id => {
    const candidate = inventory.tops.find(top => top.id === id);
    if (!candidate) throw Error('Selected top changed or disappeared. Refresh the import review.');
    const source = inventory.sources.find(file => file.path === candidate.file)!;
    const declaration = source.declarations.find(item => item.offset === candidate.offset);
    if (!declaration?.complete || declaration.kind !== 'module') throw Error('Only complete module tops are supported in this import step.');
    return candidate;
  });
  const absolute = (file: string) => path.join(inventory.root, ...file.split('/'));
  const common = inventory.sources.filter(file => file.role === 'source' && file.kind !== 'header');
  if (common.some(file => file.kind === 'mixed')) throw Error('Mixed package/module files need explicit source ordering; separate them before this import preview.');
  const packages = common.filter(file => file.kind === 'package').map(file => absolute(file.path));
  const rtl = common.filter(file => file.kind !== 'package').map(file => absolute(file.path));
  const includeDirs = [...new Set([...inventory.sources.filter(file => file.kind === 'header').map(file => path.dirname(absolute(file.path))), ...selection.includeDirs.map(file => {
    if (path.isAbsolute(file) || /^[A-Za-z]:/.test(file) || file.replaceAll('\\', '/').split('/').includes('..')) throw Error('Include directories must be project-relative.');
    return path.resolve(inventory.root, file);
  })])];
  for (const directory of includeDirs) {
    operation.throwIfAborted();
    const stat = await lstat(directory), resolved = await realpath(directory);
    const relative = path.relative(inventory.root, resolved);
    if (!stat.isDirectory() || stat.isSymbolicLink() || relative.startsWith('..') || path.isAbsolute(relative)) throw Error('Include directory is missing, linked or outside this project.');
  }
  const testNames = new Set<string>();
  let project: Project = { root: inventory.root, name: path.basename(inventory.root), sources: [...packages, ...rtl], packageSources: packages, packageOrder: 'manifest', includeDirs,
    defines: selection.defines, backend: 'verilator', timing: true, waveform: 'vcd', jobs: 1,
    tests: selected.map(candidate => {
      const base = path.basename(candidate.file, path.extname(candidate.file));
      const readable = `${base}.${candidate.top}`;
      // A readable file.top identity plus stable disambiguation for same filenames.
      const conflicts = inventory.tops.some(other => other.file !== candidate.file && `${path.basename(other.file, path.extname(other.file))}.${other.top}` === readable);
      const hash = createHash('sha256').update(candidate.file + '\0' + candidate.top).digest('hex').slice(0, 12);
      const previous = review.execution?.tests.find(test => test.file === candidate.file && test.top === candidate.top);
      const name = previous?.name ?? (/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(readable) ? readable + (conflicts ? '-' + hash : '') : 'tb-' + hash);
      if (testNames.has(name.toLowerCase())) throw Error('Ambiguous duplicate top declarations; choose a unique definition.'); testNames.add(name.toLowerCase());
      return { name, top: candidate.top, sources: [absolute(candidate.file)], timeoutMs: 60000 };
    }) };
  const identities = async () => Promise.all((project.tests.length ? project.tests : [{ name: 'management', top: '__rtl_management__', sources: [], timeoutMs: 60000 }]).map(async target => {
    const identity = await captureInputs(project, target, operation);
    if (identity.state !== 'observed-stable' || !identity.fingerprint) throw Error(`Cannot verify stable saved inputs: ${identity.reason ?? identity.state}`);
    return identity.fingerprint;
  }));
  // Observe inputs both before and after compiler calls, including package discovery.
  const before = await identities();
  if (packages.length) {
    const ordered = orderPackages(project, await provider.dependencies(project, { signal: operation }));
    project = { ...ordered, packageSources: ordered.sources.filter(file => packages.includes(file)) };
  }
  const warnings = inventory.warnings.map(warning => `${warning.file ?? ''} ${warning.message}`);
  for (const target of project.tests) {
    operation.throwIfAborted();
    const hierarchy = await provider.hierarchy(project, target.name, [], operation);
    const errors = hierarchy.diagnostics.filter(diagnostic => diagnostic.severity === 'error');
    if (errors.length) throw Error(`${target.name}: ${errors.slice(0, 5).map(diagnostic => diagnostic.message).join('\n')}`);
    const root = hierarchy.roots.find(node => node.module === target.top && node.definition && key(node.definition.file) === key(target.sources[0]));
    if (!root) throw Error(`${target.name}: selected top was not elaborated from the selected file.`);
    warnings.push(...hierarchy.diagnostics.filter(diagnostic => diagnostic.severity === 'warning').map(diagnostic => `${target.name}: ${diagnostic.message}`));
  }
  // Package reordering changes the settings fingerprint; restore its original order for comparison.
  const prepared = project;
  project = { ...project, sources: [...packages, ...rtl], packageSources: packages };
  const after = await identities();
  if (before.some((fingerprint, index) => fingerprint !== after[index])) throw Error('Source or include files changed during analysis. Refresh and retry.');
  operation.throwIfAborted();
  const relative = (file: string) => path.relative(inventory.root, file).replaceAll('\\', '/');
  return { tests: prepared.tests.map(target => ({ name: target.name, top: target.top, file: relative(target.sources[0]) })), packages: prepared.packageSources!.map(relative), sources: rtl.map(relative), includeDirs: includeDirs.map(file => relative(file) || '.'), defines: selection.defines, warnings: warnings.slice(0, 200) };
}
