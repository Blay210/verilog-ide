import * as vscode from 'vscode';
import { registerEditor } from './editor';
import { registerSemantic } from './semantic';
import { registerTools } from './tools';
let closeTools: (() => Promise<void>) | undefined;
let closeSemantic: (() => Promise<void>) | undefined;

// Product-owned built-in, not a user-installable extension or simulator service.
export function activate(context: vscode.ExtensionContext): void {
  registerEditor(context);
  closeSemantic = registerSemantic(context);
  closeTools = registerTools(context);
}
export async function deactivate(): Promise<void> {
  const results = await Promise.allSettled([closeSemantic?.(), closeTools?.()]);
  for (const result of results) if (result.status === 'rejected') throw result.reason;
}
