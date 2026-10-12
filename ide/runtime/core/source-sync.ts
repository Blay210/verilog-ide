import path from 'node:path';
import type { DiscoveryResult, ImportPreview } from '../discovery-model';
import type { SourceSyncState } from '../contract';

const key = (value: string) => process.platform === 'win32' ? value.toLowerCase() : value;
const topKey = (file: string, top: string) => `${key(file)}::${top}`;
/** Read-only lexical comparison. This never confirms a top or writes settings. */
export function compareSourceInventory(inventory: DiscoveryResult, configured: ImportPreview, baseline?: DiscoveryResult): SourceSyncState {
  const common = inventory.sources.filter(file => file.role === 'source' && file.kind !== 'header');
  const expected = [...configured.packages, ...configured.sources];
  const current = common.map(file => file.path);
  const added = current.filter(file => !expected.some(old => key(old) === key(file)));
  const removed = expected.filter(file => !current.some(now => key(now) === key(file)));
  for (const file of common) {
    const group = file.kind === 'package' ? configured.packages : configured.sources;
    if (expected.some(old => key(old) === key(file.path)) && !group.some(old => key(old) === key(file.path))) added.push(`${file.path} (분류 변경)`);
  }
  for (const target of configured.tests) {
    if (!inventory.tops.some(top => topKey(top.file, top.top) === topKey(target.file, target.top))) removed.push(`${target.file} (${target.top})`);
  }
  const headers = inventory.sources.filter(file => file.kind === 'header');
  for (const header of headers) {
    const directory = path.posix.dirname(header.path);
    if (!configured.includeDirs.some(dir => key(dir) === key(directory))) added.push(header.path);
  }
  if (baseline) {
    const oldHeaders = baseline.sources.filter(file => file.kind === 'header');
    for (const header of headers) if (!oldHeaders.some(old => key(old.path) === key(header.path))) added.push(header.path);
    for (const header of oldHeaders) if (!headers.some(now => key(now.path) === key(header.path))) removed.push(header.path);
  }
  const candidates = baseline ? inventory.tops.filter(top => top.intent === 'simulation'
    && !baseline.tops.some(old => topKey(old.file, old.top) === topKey(top.file, top.top))
    && !configured.tests.some(old => topKey(old.file, old.top) === topKey(top.file, top.top))).map(top => top.displayName) : [];
  const unique = (items: string[]) => [...new Set(items)].sort();
  const additions = unique(added), deletions = unique(removed);
  return { state: additions.length || deletions.length || candidates.length ? 'changed' : 'matching',
    added: additions, removed: deletions, candidates: unique(candidates),
    message: additions.length || deletions.length || candidates.length
      ? '파일 구성이 바뀌었습니다. 테스트 관리에서 변경을 확인하고 적용해 주세요.' : '' };
}
