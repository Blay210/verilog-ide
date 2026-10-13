import path from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'smol-toml';
import { z } from 'zod';
import type { ImportSettings } from './import-settings';
import type { RoleSelection, ImportPreview } from '../discovery-model';
const digest = (text: string) => createHash('sha256').update(text).digest('hex');
const role = z.object({ path: z.string().max(4096), role: z.enum(['source', 'simulation', 'excluded']) }).strict();
export function validatedImportRoles(entries: NonNullable<RoleSelection['files']>) {
  const seen = new Set<string>();
  return entries.map(entry => {
    const value = entry.path.replaceAll('\\', '/');
    if (path.isAbsolute(entry.path) || /^[A-Za-z]:/.test(value) || value.startsWith('/') || value.split('/').includes('..')) throw Error('Import roles must use project-relative paths.');
    const normalized = value.split('/').filter(part => part && part !== '.').join('/');
    if (normalized.split('/').some(part => ['.rtl', '.git', 'node_modules'].includes(part.toLowerCase()))) throw Error('Generated or dependency folders cannot be assigned import roles.');
    const key = process.platform === 'win32' ? normalized.toLowerCase() : normalized;
    if (seen.has(key)) throw Error('Duplicate import role.'); seen.add(key);
    return { path: normalized, role: entry.role };
  }).sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}
const executionMarker = '# RTL IDE imported execution project v1\n';
export function executionDocument(name: string, preview: ImportPreview, roles: RoleSelection): string {
  const quote = JSON.stringify;
  const files = (paths: string[]) => `[${paths.map(file => `{ file = ${quote(file)} }`).join(', ')}]`;
  let text = executionMarker + 'version = 1\n\n[project]\nname = ' + quote(name) + '\n\n[sources]\n';
  text += `rtl = ${files(preview.sources)}\npackages = ${files(preview.packages)}\npackage_order = "manifest"\ninclude_dirs = ${quote(preview.includeDirs)}\n`;
  if (Object.keys(preview.defines).length) text += '\n[sources.defines]\n' + Object.entries(preview.defines).map(([key, value]) => `${quote(key)} = ${quote(value)}\n`).join('');
  text += '\n[simulation]\nbackend = "verilator"\ntiming = true\nwaveform = "vcd"\ntimeout_ms = 60000\njobs = 1\n';
  for (const test of preview.tests) text += `\n[[test]]\nname = ${quote(test.name)}\ntop = ${quote(test.top)}\nsources = ${files([test.file])}\n`;
  return text + '\n# Import roles: ' + quote({ folders: roles.folders ?? [], files: roles.files ?? [] }) + '\n';
}
const literal = z.object({ file: z.string().min(1).max(4096) }).strict();
const executable = z.object({ version: z.literal(1), project: z.object({ name: z.string().min(1) }).strict(),
  sources: z.object({ rtl: z.array(literal).max(10000), packages: z.array(literal).max(10000), package_order: z.literal('manifest'), include_dirs: z.array(z.string().max(4096)).max(100), defines: z.record(z.string()).optional() }).strict(),
  simulation: z.object({ backend: z.literal('verilator'), timing: z.literal(true), waveform: z.literal('vcd'), timeout_ms: z.literal(60000), jobs: z.literal(1) }).strict(),
  test: z.array(z.object({ name: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.-]*$/), top: z.string().regex(/^[A-Za-z_][A-Za-z0-9_$]*$/), sources: z.array(literal).length(1) }).strict()).max(32).default([])
}).strict();
export function parseImportedExecution(_root: string, text: string | undefined): (ImportSettings & { preview: ImportPreview }) | undefined {
  if (!text?.startsWith(executionMarker)) return undefined;
  const value = executable.parse(parse(text));
  const comment = text.match(/^# Import roles: (.+)$/m);
  if (!comment) throw Error('Imported project role metadata is missing. Preserve the manifest.');
  const roles = z.object({ folders: z.array(role).max(1000), files: z.array(role).max(1000) }).strict().parse(JSON.parse(comment[1]));
  validatedImportRoles(roles.folders); validatedImportRoles(roles.files);
  const preview: ImportPreview = { tests: value.test.map(test => ({ name: test.name, top: test.top, file: test.sources[0].file })),
    sources: value.sources.rtl.map(file => file.file), packages: value.sources.packages.map(file => file.file), includeDirs: value.sources.include_dirs, defines: value.sources.defines ?? {}, warnings: [] };
  if (text !== executionDocument(value.project.name, preview, roles)) throw Error('Imported rtl.toml was manually changed. Preserve it; automatic management is unavailable.');
  return { revision: digest(text), name: value.project.name, roles, preview };
}
