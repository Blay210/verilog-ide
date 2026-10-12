# H2K — 좁은 작업 영역과 전환 버튼 겹침 보완

2026-10-10. H2J 다음 순서의 작은 화면/실제 버튼 검증을 진행했다. 제품 변경은 `ide/` 자체 contribution과 pinned Code-OSS EditorPart tracked patch다. VSIX/배포 패키지·사용자 프로젝트는 변경하지 않았다.

## 발견과 보완

Computer Use/Sky로 새 `h2k-surface` private 프로필의 창1902416을 선택했다. 첫 inventory에는 이전 RTL 창이 없었다. 기본 Simulation 버튼 실제 클릭은 통과했다. 창 border drag는 여전히1203×804 크기가 유지돼 물리 resize 수용으로 판정하지 않았다. 앱 Zoom In3회로 유효 CSS 작업 영역을 줄이고 Customize Layout에서 Activity Bar를 숨겼다.

기존 floating 버튼이 코드 첫 줄 오른쪽을 덮는 것을 실제 화면에서 발견했다. fallback navigation을 editor 위의40px 전용 줄로 바꾸고 Code 탭/그룹 및 Simulation 홈의 영역을 따로 확보했다. 기본 visible Activity Bar의 왼쪽 버튼은 유지한다.

단순 CSS 여백으로는 충분하지 않았다. GridView의 동일 크기 layout cache, EditorPart의 저장되지 않는 base dimension, 하단 panel/두 그룹과 함께 쓰는 좁은 화면의 minimumHeight 제약을 차례로 확인했다. 현재는 원래 layout 입력 크기를 보존하고 fallback class의 실제 변경만 관찰해 해당 Part와 grid 제약을 갱신한다. 편집기 최소 높이에40px을 포함하고 실제 콘텐츠 높이를 줄이며 padding으로 그룹을 배치한다. observer는 dispose 시 해제하고 같은 class 상태에서는 다시 layout하지 않는다. 임의 크기 흔들기/timeout으로 가리지 않는다.

정확한 anchor의 기존 개발 patch를 baseline으로 되돌린 후 updated tracked patch를 적용했다. patch 반복 적용2회도 확인했다. compiled JS를 수동 수정하지 않았다. root/vsix 파일을 build 입력으로 사용하지 않는다.

## 실패 기록

| fixture | 결과/원인 |
|---|---|
| KADA4l | 좁은 viewport assertion FAIL. global window.zoomLevel만으로 해당 창이 확대되지 않아 앱 zoom 명령과 실제 innerWidth 측정으로 시험을 보완 |
| H77VxK, iUaEjx | 실제 editor group과 header 겹침 FAIL. 여백 변경만으로는 cached layout이 갱신되지 않음 |
| ddfNJ6 | observer 재배치 FAIL. EditorPart.layout은 base dimension을 저장하지 않아 원래 layout 입력값 별도 보존 필요 |
| ZeqVR0 | 120초 timeout/own process tree 종료/FAIL. 동시에 물리 창 검증 중 발생했으나 동시 작업이 원인이라고 확정하지 않음; 최종 receipt 없음 |
| qrWiXF, XKXGV9 | 분할/하단 panel 조합 겹침 FAIL. XKXGV9의 측정은 header bottom100.997/group top91.995, group height28.066, viewport695×435. 최소 높이 제약에 header 누락을 보완 |

XKXGV9 및 다음8waiXZ는 `RTL_IDE_FOCUS_ROUNDS=1`을 명시한 진단 실행이다. 입력 반복 수를 숨겨서20회 통과로 표현하지 않는다. 기본은20, 허용 범위1~20을 검사한다. 실패/receipt/log는 각 `ide/.dev/editor-acceptance-*`에 보존한다.

## 현재 검증 결과

- 최종 두 파일 공식 emission+전체 프로젝트 타입 검사0 errors/exit0: `.dev/h2k-minimum-build.log`, `h2k-minimum-build-exit.txt`. 전체 본체 기반은 H2I 빌드이며 이번은 pinned `createCompile`/gulp·`spawnTsgo` incremental 검증이다.
- 최종 자동28 PASS/0 FAIL/0 SKIP: `.dev/h2k-minimum-tests.log`.
- 진단 `8waiXZ`:22항목 PASS/앱·wrapper exit0, 실제 CSS viewport695×435에서 hidden/top/bottom/default × Code→Simulation→Code. 버튼 hit target·non-inert·실제 editor group/home와 수직 분리·draft/disk 보존 및 기존 회귀. 입력 반복1 round라는 제한을 유지한다.
- 기본20 round의 최종 `RjNE0x`:22항목 PASS/앱·wrapper exit0 (`.dev/h2k-acceptance-native.log`, fixture receipt/exit). 실제 viewport695×435, 네 배치의 Code/Simulation/Code 버튼 접근·비겹침과 새/동일 소스 즉시 입력20 round 및 기존 상태 보존을 통과했다. language detection error/API attribution warning 없음. 이는 physical click이 아닌 native renderer/API 수용이다.
- 실제 확대/hidden 배치의 Code/Simulation 버튼 클릭→홈/Code 복귀와 Untitled에 `// narrow viewport probe` 실제 입력 통과. 패딩/원래 입력 크기 보완 빌드에서 Code 탭과 첫 줄이 버튼 아래에 분리된 것을 확인했다. 마지막 minimumHeight 보완의 물리 재검증과 top/bottom의 실제 클릭은 아직 수용하지 않았다. 기본 좌측 실제 클릭과 native 네 배치 검증의 범위를 구분한다.
- 일반 private 창 재읽기 후 extension host10초 시작 지연 알림을 관찰했다. H1 기존 지연 추적을 유지하며 해결로 표현하지 않는다.

## 보존 상태와 다음 순서

private 창1902416은 zoom 확대/Activity Bar hidden에서 Untitled의 미저장 `// narrow viewport probe`를 보존한다. 사용자 파일을 저장/삭제하지 않았다. 앱 신뢰/보안 설정과 다른 앱에는 입력하지 않았다. 이번 검증에는 [Computer Use 스킬](C:/Users/nanoi/.codex/plugins/cache/openai-bundled/computer-use/26.1007.21434/skills/computer-use/SKILL.md)의 Sky만 사용했다.

다음은 보조 sidebar view/폭/scroll 상세와 최종 물리 작은 화면/다른 배치 수용을 묶어 H2 지원 범위를 판정한 뒤 H3 자체 언어/Core/toolchain/실행/파형 이식을 진행하는 것이다. 물리 창 resize 미성공을 CSS viewport 검증으로 완료했다고 바꾸지 않는다. H1 host 지연/audit·별도 깨끗한 Windows gate, H7 종료/재실행 복원은 계속 열린다. H2 전체/독립 앱 RTL 실행/베타 완료는 아니다.
