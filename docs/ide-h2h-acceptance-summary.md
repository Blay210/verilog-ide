# H2H 물리 파일 저장·SCM 복귀와 H2 누적 수용표

2026-10-09. 이번 제품 코드/의존성/시험 코드 변경과 본체 재빌드 없음. H2F의 일반 개발 앱에서 화면 수용을 이어갔다. 새로운 자동 검사를 실행한 것으로 집계하지 않는다.

## 실제 화면 결과

Computer Use/Sky returned-window 목록으로 h2f-surface private window1639674를 다시 선택/활성화했다. 기존 window524436와 Codex 창에는 입력하지 않았다. 이전 Untitled의 시험 내용이 유지됨을 관찰했다.

- 새 private 파일 `ide/.dev/h2h-physical-probe.sv`가 없는 것을 먼저 확인했다.
- 실제 Ctrl+Shift+S→Save As에서 위 경로로 저장. 대화상자의 set_value는 ‘element258 is not available in cached app state’로 실패했다. 새로 관찰하고 좌표 클릭/filename selection·타이핑으로 전환해 복구했다. 최초 실패를 제품의 저장 오류로 단정하지 않는다.
- Save 클릭 후 .sv 파일 이름/dirty 해제, 두 줄 RTL 표시를 확인했다. 디스크 내용을 읽어 `module physical_space_probe;\r\nendmodule\r\n`와 일치함을 확인했다. 파일을 shell 도구로 생성해서 물리 저장으로 대체하지 않았다.
- Simulation 실제 클릭→Source Control 실제 클릭→Code와 SCM sidebar 표시, 같은 .sv 파일 복귀 PASS. empty-window SCM의 ‘Open Folder/Clone’ 안내만 확인했으며 repository 동작/commit은 실행하지 않았다.
- 편집 영역을 클릭/focus 확인한 뒤 실제 `// after Simulation\n` 입력, 화면의 dirty 표시/line4 column1과 기존 내용 보존 PASS. 디스크는 저장 당시 내용 그대로이며 미저장 주석이 자동 저장되지 않았음을 확인했다.

입력 직후 screenshot이 이전 상태인 경우 다음 관찰로 완료 상태를 확인했다. 현재 private 창은 Code/SCM에서 이 파일의 미저장 draft를 보존하고 있다. 임의로 저장/닫기/삭제하지 않았다. 언어 모드는 H3 등록 전 Plain Text이고 highlighting 수용 근거가 아니다.

## 작은 창 시도

현재1203×804 창의 오른쪽 border drag는 이후 screenshot 크기가 그대로여서 작은 viewport를 확보하지 못했다. title bar 우클릭은 앱 layout context menu를 열었고 Escape로 닫았다. app icon 클릭도 resize 경로를 제공하지 않았다. 이전 Alt+Space의 다른 앱 전면 문제를 반복하지 않았다. **작은 viewport 검증 미완료**를 유지하고 native UI는 Sky만 사용했다. 레이아웃 파일 직접 변경이나 우회 UI API로 완료를 만들지 않았다.

## H2 누적 판정

| 수용 항목 | 현재 판정 | 근거/한계 |
|---|---|---|
| Code/Simulation 첫 rail·홈/복귀 | 기본 왼쪽 rail에서 통과 | H2A/B 실제 화면, H2F/G/H 물리 왕복 |
| 여러 tab/group·활성 문서·선택/scroll·dirty/disk | 통과 | H2B~F native15 지원 범위; 물리 전체 조합은 아님 |
| Explorer/Search/SCM 진입과 Code 복귀 | 기본 화면에서 통과 | Explorer H2F, Search H2G, SCM H2H; SCM repository 작업은 제외 |
| 새/동일 source 재진입·Untitled focus | API 지원 범위 통과 | H2J Output preserveFocus 결함 보완/native22항목2회·즉시 입력40 round; H2I 첫 간헐 실패와 동일 원인 확정 아님. H2G/H 물리 근거 유지 |
| 공통 panel visibility/toggle·Output 실제 내용 | 통과 | H2C~F native model 내용/표시 상태 |
| 실제 Terminal PID 유지/정리 | empty-window에서 통과 | H2G3항목/exit0; untrusted 프로젝트는 기존 제한 |
| 보조 sidebar 진입 | 표시 상태까지 통과 | H2I native20항목2회: 초기 hidden/visible 복원; view/폭/scroll 세부 복원 미수용 |
| Activity Bar 이동/숨김 | 좁은 native renderer 범위 통과 | H2K header 겹침·cache/최소 높이 보완, 네 배치의 hit target/non-inert/실제 group·home 비겹침 PASS; hidden 실제 클릭은 중간 보완 빌드에서 수용, 다른 배치·최종 물리 수용 남음 |
| 작은 viewport | CSS 작업 영역 통과 | H2K695×435/native22항목/기본20 round PASS, 확대 hidden 실제 클릭/type 수용. 물리 resize 미성공·최종 여러 배치 물리 확인은 구분 |
| 종료·재실행·장기 세션 복원 | H7 | 이번 in-window 왕복과 구분 |
| 일반 host 시작 지연 | 열린 H1 추적 | H2F 약3.8초 unresponsive→responsive, 원인 해결 아님 |

**H2 기본 공간 전환과 데이터 보존의 지원 흐름은 수용됐다. 전체 H2 완료는 아니다.** 남은 H2 항목은 레이아웃/보조 sidebar 세부 수용으로 묶고 이미 통과한 동일 native15항목을 매번 새로 반복하지 않는다. 코드 변경 시 관련 회귀는 다시 수행한다.

다음 실행은 작은 viewport를 관찰 가능한 환경과 Activity Bar 위치/숨김 정책을 확인하고 보조 sidebar 세부 상태를 함께 검사한다. 그 결과로 H2 지원 레이아웃/제한을 확정한 뒤 H3 편집/Core/toolchain/실행/파형 자체 이식에 진입한다. H1 일반 시작 지연·audit 영향, 배포 전 깨끗한 Windows gate는 별도 추적한다.

최신 자동28/본체1.97분·compiled host10/native15와 Terminal3 결과는 해당 날짜 기록을 유지한다. 이번 새 build/전체 시험 PASS로 합산하지 않는다. root/vsix 런타임 의존성·VSIX/installer/배포·독립 엔진 작업 없음.

