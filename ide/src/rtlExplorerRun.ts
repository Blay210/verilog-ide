/* Owned RTL Explorer row contribution. Uses Code-OSS's internal file registry. */
import { addDisposableListener } from '../../../../base/browser/dom.js';
import type { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import type { URI } from '../../../../base/common/uri.js';
import type { IExplorerFileContribution } from '../../files/browser/explorerFileContrib.js';

interface RunProvider {
  changed: Event<void>;
  targetCount(resource: URI): number;
  enabled(): boolean;
  run(resource: URI): Promise<unknown>;
  error(error: unknown): void;
  folderRole(resource: URI): { role: 'source' | 'simulation' | 'excluded'; inherited: boolean; saved: boolean } | undefined;
}
export class RtlExplorerRun extends Disposable implements IExplorerFileContribution {
  private resource?: URI;
  private readonly button: HTMLButtonElement;
  private readonly badge: HTMLSpanElement;
  constructor(private readonly container: HTMLElement, private readonly provider: RunProvider) {
    super();
    this.button = container.ownerDocument.createElement('button');
    this.button.type = 'button'; this.button.className = 'rtl-explorer-run codicon codicon-play';
    this.button.hidden = true; this.button.dataset.action = 'rtl-run-file';
    container.append(this.button);
    this.badge = container.ownerDocument.createElement('span'); this.badge.hidden = true;
    this.badge.className = 'rtl-folder-role'; container.append(this.badge);
    for (const event of ['keydown', 'keyup']) this._register(addDisposableListener(this.button, event, e => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }));
    for (const event of ['mousedown', 'dblclick', 'dragstart']) this._register(addDisposableListener(this.button, event, e => { e.stopPropagation(); if (event === 'dragstart') e.preventDefault(); }));
    this._register(addDisposableListener(this.button, 'click', event => {
      event.stopPropagation(); event.preventDefault();
      const resource = this.resource;
      if (resource && !this.button.hidden && !this.button.disabled) void this.provider.run(resource).catch(error => this.provider.error(error));
    }));
    this._register(this.provider.changed(() => this.paint()));
  }
  setResource(resource: URI | undefined): void { this.resource = resource; this.paint(); }
  private paint(): void {
    const count = this.resource?.scheme === 'file' ? this.provider.targetCount(this.resource) : 0;
    this.button.hidden = count === 0; this.button.disabled = !this.provider.enabled();
    this.container.classList.toggle('rtl-explorer-testbench', count > 0);
    const label = count > 1 ? `시뮬레이션 대상 선택 (${count}개)` : '시뮬레이션 실행';
    this.button.title = label; this.button.setAttribute('aria-label', label);
    this.button.dataset.resource = this.resource?.toString() ?? '';
    const role = this.resource && this.provider.folderRole(this.resource);
    this.badge.hidden = !role;
    this.badge.className = 'rtl-folder-role codicon ' + (role?.role === 'simulation' ? 'codicon-beaker' : role?.role === 'excluded' ? 'codicon-circle-slash' : 'codicon-circuit-board');
    this.badge.dataset.resource = this.resource?.toString() ?? '';
    this.badge.dataset.role = role?.role ?? '';
    this.badge.title = role ? `${role.role === 'simulation' ? '테스트벤치' : role.role === 'source' ? 'RTL 소스' : '탐색 제외'} · ${role.inherited ? '상위 폴더에서 상속' : '직접 지정'} · ${role.saved ? '저장됨' : '적용 전 검토'}` : '';
    this.badge.setAttribute('aria-label', this.badge.title);
  }
  override dispose(): void { this.button.remove(); this.badge.remove(); this.container.classList.remove('rtl-explorer-testbench'); super.dispose(); }
}
