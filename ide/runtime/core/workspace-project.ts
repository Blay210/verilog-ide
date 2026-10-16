import path from 'node:path';
import { lstat, realpath, readdir, mkdir, open } from 'node:fs/promises';
import { executionDocument } from './execution-document';
import type { ImportPreview } from '../discovery-model';
const key = (value: string) => process.platform === 'win32' ? value.toLowerCase() : value;

export function validateProjectName(name: string): string {
  if (!name || name !== name.trim() || name.length > 100 || /[<>:"/\\|?*\x00-\x1f]/.test(name) || /[. ]$/.test(name) || ['.', '..'].includes(name) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) throw Error('프로젝트 이름에 경로 구분자나 Windows 예약 이름을 사용할 수 없습니다.');
  return name;
}
/** Explicit user creation only. Empty folder; no tool probe/example/run. */
export async function initializeSourceProject(directory: string, name: string): Promise<string> {
  validateProjectName(name);
  const root = path.resolve(directory), info = await lstat(root);
  if (!info.isDirectory() || info.isSymbolicLink() || key(path.resolve(await realpath(root))) !== key(root)) throw Error('링크가 아닌 실제 프로젝트 폴더를 선택해 주세요.');
  if ((await readdir(root)).some(entry => entry !== '.git')) throw Error('비어 있지 않은 폴더입니다. 기존 프로젝트 열기로 가져와 주세요. 파일은 변경하지 않았습니다.');
  const preview: ImportPreview = { sources: [], packages: [], tests: [], includeDirs: [], defines: {}, warnings: [] };
  const roles = { folders: [{ path: 'rtl', role: 'source' as const }, { path: 'tb', role: 'simulation' as const }], files: [] };
  await mkdir(path.join(root, 'rtl')); await mkdir(path.join(root, 'tb'));
  // Every file uses exclusive creation. On a concurrent writer, leave the
  // partial project for review rather than deleting or overwriting user files.
  for (const [file, content] of [
    ['README.md', `# ${name}\n\nRTL 코드는 rtl/, 테스트벤치는 tb/에 작성하세요. Simulation에서 테스트를 실행하고 파형을 확인합니다. 파형 기록 코드를 작성할 필요는 없습니다.\n`],
    ['.gitignore', '.rtl/\n'],
    ['rtl.toml', executionDocument(name, preview, roles)]
  ]) {
    const handle = await open(path.join(root, file), 'wx');
    try { await handle.writeFile(content, 'utf8'); await handle.sync(); } finally { await handle.close(); }
  }
  return root;
}
export async function createSourceProject(parent: string, name: string): Promise<string> {
  validateProjectName(name);
  const selected = path.resolve(parent), info = await lstat(selected);
  if (!info.isDirectory() || info.isSymbolicLink() || key(path.resolve(await realpath(selected))) !== key(selected)) throw Error('실제 상위 폴더를 선택해 주세요.');
  const root = path.join(selected, name);
  // Not recursive: never adopt an existing directory or escape the selected parent.
  await mkdir(root);
  return initializeSourceProject(root, name);
}
