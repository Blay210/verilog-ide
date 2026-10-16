/* Owned pending-suggestion intent; no compiler or simulator dependencies. */
import type { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';

export interface CompletionRequest { uri: string; version: number; line: number; character: number }
/** An empty initial response must not erase a live typing request. */
export class RtlCompletionIntent {
  constructor(private readonly now: () => number = Date.now) {}
  private ticket?: { request: CompletionRequest; valid: () => boolean; ready: boolean };
  private listeners: { dispose(): void }[] = [];
  arm(editor: ICodeEditor, request: CompletionRequest, active: () => boolean) {
    this.dispose();
    let alive = true;
    const created = this.now();
    const cancel = () => { alive = false; };
    const ticket = { request: { ...request }, ready: false, valid: () => {
      const model = editor.getModel(), position = editor.getPosition();
      const age = this.now() - created;
      return alive && age >= 0 && age <= 10000 && active() && editor.hasTextFocus() && editor.getSelection()?.isEmpty() === true
        && model?.uri.toString() === request.uri && model.getVersionId() === request.version
        && position?.lineNumber === request.line + 1 && position.column === request.character + 1;
    } };
    this.ticket = ticket;
    this.listeners = [
      { dispose: cancel },
      editor.onKeyDown(event => { if ([9, 3, 2].includes(event.keyCode)) cancel(); }), // Escape, Enter, Tab
      editor.onMouseDown(cancel), editor.onDidBlurEditorText(cancel),
      editor.onDidChangeCursorSelection(cancel), editor.onDidChangeModelContent(cancel), editor.onDidChangeModel(cancel)
    ];
    return ticket;
  }
  allows(request: CompletionRequest): boolean {
    const ticket = this.ticket;
    return !!ticket?.ready && ticket.valid() && Object.keys(ticket.request).every(key => ticket.request[key as keyof CompletionRequest] === request[key as keyof CompletionRequest]);
  }
  dispose(): void {
    this.ticket = undefined;
    for (const listener of this.listeners.splice(0)) listener.dispose();
  }
}
