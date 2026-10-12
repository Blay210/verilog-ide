import path from 'node:path';
import { detectSemanticRuntime } from './toolchain/semantic';
import { toolsHome } from './toolchain/detect';
import { SlangProvider } from './semantic/slang';
import type { OperationContext } from './core/model';
export async function importProvider(root: string, bridge: string, context: OperationContext, toolsDirectory?: string): Promise<SlangProvider> {
  const home = path.resolve(toolsDirectory || toolsHome());
  const cache = path.join(home, 'cache', 'import-analysis');
  const relative = path.relative(root, cache);
  if (relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative)) throw Error('Semantic tools/cache must be outside the project.');
  const python = await detectSemanticRuntime(context, home);
  if (!python) throw Error('의미 분석 도구가 없습니다. 도구 설정에서 설치 또는 위치를 확인해 주세요.');
  return new SlangProvider(python, bridge, cache);
}
