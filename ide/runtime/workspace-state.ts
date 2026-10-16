/** Bounded UI metadata only. No source/trace bytes, tools, or editor dependencies. */
export interface WaveSessionState { paths: string[]; expanded: string[]; styles: [string, { radix?: string; color?: string }][]; radix: string; from: string; to: string; a: string; viewId?: string }
export interface RestoredWave { id: string; name: string; file?: string; state?: WaveSessionState }
export interface ProjectSession { root: string; selected: string[]; runs: [string, string][]; jobs: number; activeWave?: string; waves: RestoredWave[] }
export interface WorkspaceSession { version: 1; activeRoot?: string; projects: ProjectSession[] }
const text = (value: unknown, length = 8192): value is string => typeof value === 'string' && value.length > 0 && value.length <= length && !/[\x00-\x1f]/.test(value);
const time = (value: unknown): value is string => typeof value === 'string' && /^\d{1,40}$/.test(value);
const uuid = (value: unknown): value is string => typeof value === 'string' && /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(value);
const radix = (value: unknown): value is string => ['auto', 'hex', 'unsigned', 'signed', 'binary'].includes(value as string);
export function parseWaveSession(value: any): WaveSessionState | undefined {
  if (!value || !Array.isArray(value.paths) || value.paths.length > 32 || !value.paths.every((path: unknown) => text(path)) || !time(value.from) || !time(value.to) || !time(value.a) || !radix(value.radix)) return;
  const paths: string[] = [...new Set<string>(value.paths)];
  const expanded = Array.isArray(value.expanded) ? value.expanded.filter((path: unknown) => typeof path === 'string' && paths.includes(path)).slice(0, 32) : [];
  const styles: WaveSessionState['styles'] = [];
  if (Array.isArray(value.styles)) for (const entry of value.styles.slice(0, 10000)) {
    if (!Array.isArray(entry) || !paths.includes(entry[0]) || !entry[1] || styles.some(item => item[0] === entry[0])) continue;
    const style = entry[1]; styles.push([entry[0], { radix: radix(style.radix) ? style.radix : undefined, color: ['blue', 'pink', 'amber'].includes(style.color) ? style.color : undefined }]);
  }
  return { paths, expanded, styles, radix: value.radix, from: value.from, to: value.to, a: value.a, viewId: text(value.viewId, 80) ? value.viewId : undefined };
}
export function parseWorkspaceSession(contents?: string): WorkspaceSession {
  const empty: WorkspaceSession = { version: 1, projects: [] };
  if (!contents || contents.length > 2 * 1024 * 1024) return empty;
  try {
    const value = JSON.parse(contents); if (value.version !== 1 || !Array.isArray(value.projects)) return empty;
    const projects: ProjectSession[] = [];
    for (const entry of value.projects.slice(-20)) {
      if (!entry || !text(entry.root) || projects.some(project => project.root === entry.root)) continue;
      const waves: RestoredWave[] = [];
      if (Array.isArray(entry.waves)) for (const wave of entry.waves.slice(0, 4)) {
        if (!wave || !uuid(wave.id) || !text(wave.name, 256) || waves.some(item => item.id === wave.id) || (wave.file !== undefined && (!text(wave.file) || !/\.vcd$/i.test(wave.file)))) continue;
        waves.push({ id: wave.id, name: wave.name, file: wave.file, state: parseWaveSession(wave.state) });
      }
      projects.push({ root: entry.root, waves, activeWave: waves.some(wave => wave.id === entry.activeWave) ? entry.activeWave : undefined,
        selected: Array.isArray(entry.selected) ? entry.selected.filter((name: unknown) => text(name, 256)).slice(0, 1000) : [],
        runs: Array.isArray(entry.runs) ? entry.runs.filter((row: any) => Array.isArray(row) && text(row[0], 256) && uuid(row[1])).slice(0, 1000) : [], jobs: [1, 2, 4].includes(entry.jobs) ? entry.jobs : 1 });
    }
    return { version: 1, activeRoot: text(value.activeRoot) ? value.activeRoot : undefined, projects };
  } catch { return empty; }
}
