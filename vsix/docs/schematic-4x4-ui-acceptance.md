# 4×4 실제 화면 조작 수용 (2026-10-08)

격리된 실제 VS Code development host `run-inrwoa`에서 16개 MAC/26개 외곽 포트의 Schematic 표시와 실제 입력을 검증했다. Computer Use 스킬의 `sky`로 반환된 유일한 개발 host 창만 선택하여 화면 관찰 후 입력/재관찰했다. 사용자 작업 창은 조작하지 않았다.

## 확인한 동작

- 기본 Schematic의 4×4 graph를 Fit(21%) 및 100%로 확인했다. 100%에서 포트명/폭/방향이 읽히고 모든 fixture edge가 렌더링된다는 native assertion을 유지했다.
- 배경 drag로 부모 연결부와 MAC 내부를 pan했다. 스크롤 확대는 포인터 위치를 기준으로 21%→31%로 변경됐다.
- 부모 `pe00` 블록 더블클릭으로 leaf 내부에 진입했다. 분석 완료 뒤 ×/MUX/Register D→Q/클럭 단자와 점선 state/feedback 배선을 실제 화면에서 확인했다.
- canvas focus 후 키보드 `0`으로 leaf Fit(40%)을 복구했다.
- 왼쪽 hierarchy의 부모 dut 선택으로 복귀했다. 실제 host 상태 기록에 parent supported → pe00 loading → pe00 supported → parent loading → parent supported가 남았다.
- 부모 Open definition으로 `matrix.sv` line1 선언을 열었다. 다이어그램 탭으로 복귀할 때 31% camera state를 유지했고 마지막 Fit으로 21%를 복구했다. RTL 코드를 수정/저장하지 않았다.

테스트 harness는 기존 2×2 physical host에 `RTL_SCHEMATIC_4X4_FIXTURE` 옵션을 추가했다. `.dev/e4/` 안의 생성 fixture만 복사하여 새 private project/manifest/testbench를 준비하고 기존 2×2 예제는 그대로 사용 가능하다. 테스트 기대 module 수는 4/16으로 구분한다. 이 TB는 구조 표시용이며 이번 실행에서 simulation/파형을 생성하지 않았다.

## 근거

- `.dev/schematic-4x4-ui.log`: `RTL_SCHEMATIC_UI_PASS`, host exit0.
- `.dev/schematic-ui/run-inrwoa/project/.rtl/schematic-ui-host.json`: passed=true, modules16, boundaries26, 실시간 inspected/mode/status 관측과 physical checks/limitations.
- 개발 build 및 타입 검사 exit0. 제품 코드 변경 없음. 테스트 harness만 확장했고 이전 전체224 PASS를 다시 실행하지 않았다.
- 실제 화면은 이번 tool screenshot으로 관찰했다. 영구 screenshot 파일을 별도로 저장한 것은 아니다. native scene의 edge completeness는 이전 4×4 시험과 이 host의 `routingIncomplete=false` assertion으로 검증했다.

## 남은 가독성 제한과 다음 순서

Fit은 전체 배치 파악용이며 21%에서 포트 라벨을 읽기에는 너무 작다. 100%/scroll/pan으로 세부 확인은 가능하다. 공통 clk/load_weight fanout과 상수/폭 변환 노드가 많은 Schematic은 화면이 빽빽하다. 현재는 graph dependency column 배치이며 사용자가 그린 물리적 systolic 4×4 아키텍처 배치를 자동 추론하는 기능은 아니다. 이러한 제한을 숨기거나 구조 가독성 개선 전체가 끝났다고 표시하지 않는다.

소스 탭 왕복은 camera state를 보존하지만 문서 페이지 scroll은 상단으로 돌아간다. browser frame latency/메모리 회수와 화면 크기별 UI 성능은 이번 수용에서 측정하지 않았다. 화면 녹화/파형 값/clock stepping은 검증하지 않았다. generate/array의 scope operations·연속 계층 zoom은 여전히 별도 범위다.

다음 E4B는 기록된 simulation에서 source ↔ diagram ↔ waveform ↔ clock 실제 왕복·값 일치와 keyboard/focus, 취소/닫기/재열기/복구·성능이다. 가독성 개선 후보는 공통 제어선/상수 표시 정돈과 viewport 활용이며 source/graph/type identity를 보존해야 한다. release VSIX 생성/설치·독립 IDE/자체 engine 착수 없음.
