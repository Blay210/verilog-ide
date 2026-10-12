# H2G 실제 Terminal 프로세스와 물리 Search/Untitled 수용

2026-10-09. 이번 제품 본체 변경/재빌드 없음. H2F 본체로 남은 Terminal 검증을 수행했다. H2 전체/베타 완료는 아니다.

## Terminal 검증 방법과 결과

기존 untrusted 프로젝트 fixture의 신뢰를 바꾸는 대신 **폴더를 열지 않은 private empty window**로 검증했다. 빈 창의 기본 workspace.isTrusted=true를 assert하며 --disable-workspace-trust 등 override를 사용하지 않는다. 이 결과가 untrusted 프로젝트에서 Terminal을 허용한다는 뜻은 아니다.

`ide/scripts/verify-editor.mjs terminal` 모드를 추가해 workspace 인자 없이 자체 profile/shared/extensions와 private test entry로 실행한다. `tests/native/terminal.cjs`는 실제 cmd shell을 private fixture cwd, /d /q로 시작한다(autorun 비활성화). shell에 명령을 입력하지 않는다. npm의 verify:terminal로 재현 가능하다.

최종 fixture `ide/.dev/editor-acceptance-hE9zZm`: receipt passed=true/3항목, PID28560, 앱/검증 exit0. 기존 editor 모드와 혼동하지 않도록 후속 wrapper의 terminal PASS 문구를 구분했다. `.dev/h2g-terminal.log`/exit 및 fixture receipt/launch/host/exit 보존.

1. 실제 Terminal 생성/PID 확인·process.kill(pid,0)로 살아 있음을 확인.
2. Code/Simulation3회 왕복에서 같은 Terminal 등록·같은 PID·프로세스 생존 유지.
3. 시험용 Terminal만 명시적으로 dispose하고 해당 PID가 ESRCH로 사라지는지 bounded 대기해 확인.

사용자 Terminal/프로세스에 입력·정리하지 않았다. Windows Terminal UI 자동화도 하지 않았다. 테스트는 extension-host API/Node process 수용이며 실제 화면의 Terminal 입력 검증과 구분한다. 기존 editor15항목은 H2F 통과 근거를 유지했고 이번에 다시 실행한 것으로 집계하지 않는다.

독립 IDE 자동28 PASS/0 FAIL/0 SKIP를 재확인했으며 wrapper/terminal test 문법 검사 exit0. 의존성/새 도구 설치·패키징 없음.

## 실제 화면 검증

Computer Use/Sky로 이전 h2f-surface private 창(window1639674)을 returned window 목록에서 다시 선택했다. 다른 기존 RTL/Codex 창에는 입력하지 않았다.

Simulation 클릭→Search 아이콘 클릭→Code 화면/검색 sidebar 표시 PASS. 입력 직후 snapshot이 이전 화면을 보이는 경우 재관찰해 최종 상태를 확인했다. 검색 실행/replace는 하지 않았다.

다시 Simulation 클릭→실제 Ctrl+N→Code의 Untitled-1 표시 PASS. 편집 영역을 클릭해 focus를 확인하고 실제 `module physical_space_probe;\nendmodule\n` 텍스트를 입력했다. 화면에서 두 줄·dirty 탭 표시·line3/column1을 확인했다. 이 문서는 private 창에 미저장 상태로 남아 있으며 임의 저장/닫기/삭제하지 않았다. 현재 H3 언어 등록 전이라 Plain Text이며 이 화면을 syntax highlighting 완료 근거로 쓰지 않는다.

작은 창 검증을 위해 Alt+Space로 system menu를 시도했으나 뒤의 관찰 screenshot에 다른 앱이 전면에 나타났다. 다른 앱을 조작하지 않고 UI 입력을 중단했다. **창 크기 변경/작은 viewport 검증은 미완료**다. 원인을 사용자 입력 또는 제품 결함으로 단정하지 않는다. 다음 담당자는 창을 재선택/관찰하고 기존 좌표를 재사용하지 않는다.

## 누적 H2 상태와 다음 순서

- 기능 수용: 여러 tab/group·dirty/disk/scroll/선택, Explorer 복귀, 새/동일 source와 Untitled API focus, Output 실제 내용, 보조 sidebar 진입, 기본 empty-window Terminal 프로세스 보존/정리 통과.
- 물리 수용: Simulation 홈/Code 복귀, Explorer/Search 진입, Ctrl+N 및 실제 편집 입력 통과.
- 잔여: 작은 viewport·Activity Bar 위치/숨김, SCM 물리 경로, 파일 소스/동일 파일 실제 왕복, 보조 sidebar 세부 복원, 프로젝트 문맥 Terminal 수용 범위와 일반 host 간헐 지연.
- 다음은 현재 private 창 재관찰과 잔여 화면/레이아웃 수용을 묶어 확인한 뒤 H2 완료 범위를 판정한다. 제품 baseline의 일반 host 지연/audit·깨끗한 Windows gate는 계속 별도 추적한다. 이후 H3 편집/Core/toolchain/실행/파형 자체 이식→H4 홈 테스트/결과/이력 순서다.

VSIX/installer/배포물 생성·vsix 수정·상위 코드 참조·자체 엔진 착수 없음.

