import * as vscode from 'vscode';
import { registerEditor } from './editor';
import { registerSemantic } from './semantic';
import { registerTools } from './tools';
let closeTools: (() => Promise<void>) | undefined;

// Product-owned built-in, not a user-installable extension or simulator service.
export function activate(context: vscode.ExtensionContext): void {
  registerEditor(context);
  registerSemantic(context);
  closeTools = registerTools(context);
}
export async function deactivate(): Promise<void> { await closeTools?.(); }
