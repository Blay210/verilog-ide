# E4 실제 선택기·소스 왕복·포커스 복구 (2026-10-08)

## 실제 UI 수용과 발견

격리4×4 host run-U8ruBs에서 100% → Tab Fit → Tab canvas → Tab pe00을 실제 입력했다. 화면 밖 pe00이 줌100%를 유지하면서 완전히 드러나고 focus 테두리를 표시했다. Enter로 leaf 내부에 진입했다. Display를 클릭해 입력점을 잡고 Down+Enter로 Connections, 다시 Down+Enter로 Detailed leaf logic을 적용했다. 실제 diagram과 host mode observations가 일치했다.

Display에서 Escape → Shift+Tab Open definition → Enter로 mac_pe.sv line1을 열고 Ctrl+PageUp으로 diagram에 복귀했다. graph/camera는 유지됐지만 page scroll 초기화와 focus 유실을 발견했다. 최초 run의 receipt/PASS/exit0는 물리 시험 완료를 뜻하며 이 UX 결함이 없다는 의미가 아니다. 로그 .dev/e4-keyboard-roundtrip.log, .dev/schematic-ui/run-U8ruBs/project/.rtl/schematic-ui-host.json.

## 보완과 재수용

VS Code 독립 webview helper structure-focus.ts가 project/run/test/instance별로 마지막 control identity를 보관한다. 화면 모드는 focus identity에서 제외하여 selector 변경에도 동일 control을 찾는다. source/action/camera/node/selector/canvas를 지원하고32개 context로 제한한다. camera state를 보존하고 disabled/aria-disabled control과 이미 활성화된 다른 control의 focus를 건드리지 않는다. 복원은 focus만 수행하며 클릭/host command를 보내지 않는다.

보완 native run-hjw5s7: Display Escape → Shift+Tab Open definition → Enter → matrix.sv line1 → Ctrl+PageUp → Open definition의 실제 focus 테두리 복원 → Tab Display로 연속 이동을 확인했다. .dev/e4-focus-return-verified.log의 RTL_SCHEMATIC_UI_PASS/exit0, 해당 host 고유 receipt passed=true/focusRestored=true. 이 run에서 최초 run의 Connections/Detailed 조작을 반복한 것은 아니다.

같은 private source에서 Ctrl+End/Enter로 미저장 줄바꿈을 추가했다. Sources changed 안내, 마지막 graph 유지, source/selector 비활성화를 실제 화면으로 확인했다. Ctrl+Z로 편집을 원복하고 clean tab을 확인했으며 저장하지 않았다. stale 상태에서 이전 source button에 focus를 복원하지 않는 것은 helper 단위 시험으로 확인했다. stale의 모든 key 조합을 실제 조작한 것으로 주장하지 않는다.

## 검증·범위

관련 focus/view/camera18 PASS/0 FAIL/0 SKIP, TypeScript noEmit exit0, native 실행 시 개발 build 성공. source 왕복의 마지막 control focus 복구는 수용했다. 임의 page scroll 위치를 정확히 복구하는 기능은 추가하지 않았으며 focus되는 control이 보이도록 browser scroll 동작을 사용한다. recorded source 왕복/모든 screen reader/모든 selector 키 조합을 이번 보완 후 physical 재검증한 것은 아니다.

생성물은 private .dev fixture/.rtl 아래에 두었고 사용자 프로젝트/예제 원본·새 simulation/패키징·설치를 수정·실행하지 않았다. frozen study VSIX에는 개발 보완이 아직 포함되지 않는다.

## 다음 실행

이제 새 검증 항목을 계속 늘리기보다 pre-ide-roadmap.md의 E4 완료 기준과 누적 수용 근거를 하나의 표로 대조해 완료/지원 한도/미해결 gate를 판정한다. recorded 흐름에 focus 보완을 회귀 확인하고 필요한 결함만 처리한다. H0는 사용자와 독립 IDE 아이디어 논의이며 독립 앱/자체 엔진 구현을 자동 시작하지 않는다. 이번 기록만으로 E4 전체 완료를 선언하지 않는다.

제품 변경 후 전체 회귀 .dev/e4-focus-return-regression.log: 227 PASS/0 FAIL/0 SKIP, 약66.01초·exit0.
