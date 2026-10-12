import path from 'node:path';
import { exists, toolsHome } from './toolchain/detect';
import { checkedProcess } from './core/index';

export const semanticRoot = () => path.join(toolsHome(), 'tools', 'slang-11.0.0-python-3.14.7');
/** Reuse a shared tool only after a real compiler probe. Never downloads or installs. */
export async function detectSemanticRuntime(signal?: AbortSignal): Promise<string | undefined> {
  const python = path.join(semanticRoot(), 'python.exe');
  if (!await exists(python)) return;
  await checkedProcess({ executable: python, args: ['-I', '-B', '-c',
    "import pyslang as s; assert s.__version__ == '11.0.0'; c=s.ast.Compilation(); c.addSyntaxTree(s.syntax.SyntaxTree.fromText('module probe(input logic a); endmodule\\n')); assert c.getRoot().topInstances[0].body.portList[0].name == 'a'"], cwd: path.dirname(python) },
    { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
  return python;
}
