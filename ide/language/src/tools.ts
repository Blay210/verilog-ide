import * as vscode from 'vscode';
import os from 'node:os';
import path from 'node:path';
import { ToolSetupService, planToolUpdate, requireExternalTools, type ToolKind, type ToolSetupState } from '../../runtime/tool-setup';

/** Product UI for an explicit, reviewable tool plan. No automatic install. */
export function registerTools(context: vscode.ExtensionContext): () => Promise<void> {
  const output = vscode.window.createOutputChannel('RTL Tools');
  let service: ToolSetupService | undefined, busy = false, disposed = false;
  async function progress(work: () => Promise<ToolSetupState>): Promise<ToolSetupState> {
    return vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'RTL 도구 설정', cancellable: true }, async (progress, token) => {
      const subscription = token.onCancellationRequested(() => service?.cancel());
      const timer = setInterval(() => { progress.report({ message: service?.state.log.trim().split('\n').at(-1) ?? service?.state.phase }); }, 250);
      try { const operation = work(); if (token.isCancellationRequested) service?.cancel(); return await operation; } finally { clearInterval(timer); subscription.dispose(); }
    });
  }
  async function setup(kind?: ToolKind, update = false): Promise<ToolSetupState | undefined> {
    if (!vscode.workspace.isTrusted) { await vscode.window.showInformationMessage('프로젝트를 신뢰한 후 도구를 설정할 수 있습니다. 기본 코드 편집은 계속 사용할 수 있습니다.'); return; }
    if (busy || disposed) { output.show(); return service?.state; }
    if (!kind) {
      const choice = await vscode.window.showQuickPick([
        { label: '시뮬레이션 도구', description: 'Verilator · C++ 빌드 도구 · GTKWave', group: 'simulation' as const },
        { label: '언어 분석 도구', description: 'slang · 전용 Python', group: 'language' as const },
        { label: '도구 저장 위치 선택', description: '프로젝트 밖의 공유 폴더', action: 'directory' },
        { label: '관리 시뮬레이션 도구 업데이트', description: '설치 계획 확인 후 승인', group: 'simulation' as const, action: 'update' }
      ], { title: '도구 설정', placeHolder: '기존 도구를 먼저 검증합니다.' });
      if (!choice) return;
      if (choice.action === 'directory') {
        const selected = await vscode.window.showOpenDialog({ title: '공유 도구 저장 위치', canSelectFiles: false, canSelectFolders: true, canSelectMany: false });
        if (!selected?.length) return;
        if (selected[0].scheme !== 'file') throw Error('로컬 폴더를 선택해 주세요.');
        await requireExternalTools(selected[0].fsPath, (vscode.workspace.workspaceFolders ?? []).map(folder => folder.uri.fsPath));
        await vscode.workspace.getConfiguration('rtl').update('toolsDirectory', selected[0].fsPath, vscode.ConfigurationTarget.Global);
        return setup();
      }
      kind = choice.group; update = choice.action === 'update';
    }
    if (busy || disposed) return service?.state;
    busy = true;
    try {
      const home = path.resolve(vscode.workspace.getConfiguration('rtl').get<string>('toolsDirectory') || process.env.RTL_DEV_HOME || path.join(os.homedir(), '.rtl-dev'));
      const projects = (vscode.workspace.workspaceFolders ?? []).map(folder => folder.uri.fsPath);
      service = new ToolSetupService(home, projects, update ? planToolUpdate : undefined, state => { if (!disposed) output.replace(state.log + (state.error ? '\n' + state.error : '')); });
      for (;;) {
        let result = await progress(() => service!.prepare(kind!, vscode.workspace.isTrusted));
        if (disposed) { service.cancel(); return service.state; }
        if (result.phase === 'awaitingApproval') {
          const plan = result.plan!;
          const approved = await vscode.window.showInformationMessage('RTL 도구를 설치할까요?', { modal: true,
            detail: `설치 위치: ${plan.location}\n구성 요소: ${plan.components.join(', ')}\n공식 배포 SHA256 검증${kind === 'simulation' ? ' 및 패키지 서명 검증' : ''}을 유지합니다. 시스템 PATH는 변경하지 않습니다. 다운로드 용량과 시간은 구성에 따라 달라집니다.` }, '설치');
          if (disposed) { service.cancel(); return service.state; }
          if (service.state.phase !== 'awaitingApproval') return service.state;
          if (!vscode.workspace.isTrusted) {
            service.cancel();
            await vscode.window.showInformationMessage('프로젝트 신뢰 상태가 변경되어 도구 설치를 취소했습니다. 기본 코드 편집은 계속 사용할 수 있습니다.');
            return service.state;
          }
          result = await progress(() => service!.approve(plan.id, approved === '설치', vscode.workspace.isTrusted));
        }
        if (result.phase === 'ready') {
          if (kind === 'language') await vscode.commands.executeCommand('rtl.restartLanguage');
          await vscode.window.showInformationMessage('도구 검증이 완료되었습니다. 기존 도구 또는 설치한 도구를 사용할 수 있습니다.', '로그 보기').then(choice => { if (choice) output.show(); });
          return result;
        }
        if (result.phase === 'cancelled') return result;
        const choice = await vscode.window.showErrorMessage(`도구 설정 실패: ${result.error ?? result.phase}`, '재시도', '로그 보기');
        if (choice === '로그 보기') output.show();
        if (choice !== '재시도' || disposed) return result;
      }
    } finally { busy = false; }
  }
  context.subscriptions.push(output,
    vscode.commands.registerCommand('rtl.setupTools', () => setup()),
    vscode.commands.registerCommand('rtl.setupLanguage', () => setup('language')),
    vscode.commands.registerCommand('rtl.toolSetupState', () => service?.state ?? { phase: 'idle', log: '' }),
    vscode.commands.registerCommand('rtl.cancelToolSetup', () => service?.cancel()),
    { dispose: () => { disposed = true; service?.cancel(); } });
  return async () => { disposed = true; await service?.close(); };
}
