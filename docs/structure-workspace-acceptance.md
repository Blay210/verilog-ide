# Structure 작업 공간 첫 구현 — 2026-10-07

## 구현 범위

가장 왼쪽 Activity Bar에 Structure 전용 아이콘/컨테이너를 추가하고 RTL Hierarchy를 Explorer에서 이곳으로 옮겼다. 컨테이너 visibility 이벤트가 중앙 구조도 webview를 열거나 다시 보여준다. 처음에는 Update 버튼이 있는 분석 전 화면을 열며 자동으로 hierarchy 분석·도구 설치를 시작하지 않는다. rtl.openStructureWorkspace도 같은 진입 흐름을 사용한다.

기존 구조 창의 Refresh 표시를 Update로 바꿨다. 편집 이벤트는 현재 hierarchy와 정적 내부 연산 graph를 유지하고 변경 표시를 갱신한다. 미완료 분석·관측 작업은 취소하고 오래된 source 위치/탐색은 Update 전까지 막는다. recorded 입력/trace 손상 경계는 유지하며 과거 값의 사용을 허용하지 않는다. Update 자체는 기존 공통 semantic 분석을 호출한다.

미저장 RTL 반영 여부는 사용자의 답변이 아직 없으므로 기존 동작을 유지했다. Update는 미저장 RTL overlay를 분석하되 파일을 저장하지 않는다. 미저장 rtl.toml은 저장 안내로 차단한다. 이는 새 사용자 합의로 간주하지 않는다. recorded 모드는 보존된 입력만 사용한다.

창을 다시 진입할 때 기존 panel을 재사용하고 자동 재분석하지 않는다. 닫았다 다시 열면 마지막 hierarchy를 표시한다. 닫을 때 내부 graph/trace reader는 기존 정책대로 해제하므로 마지막 내부 연산 화면·값까지 자동 복원하는 기능은 아니다. Update 실패/취소는 기존 재시도 안내를 유지한다. 현재 분석 중에는 이전 내부 graph가 지워질 수 있으며 완전한 transactional 화면 보존은 후속이다.

## 실제 개발 host 검증

scripts/test-structure-workspace.mjs는 .dev/structure-workspace 아래에 별도 project/profile을 만들고 실제 VS Code 개발 확장과 slang을 실행한다. 사용자 counter를 수정하지 않는다.

- .dev/structure-workspace/run-djoKya, .dev/structure-workspace-host.log, runner exit0.
- project/.rtl/structure-workspace-host.json passed=true.
- 실제 Activity Bar container 명령 → visibility → panel 열림, 분석 전 design 없음 확인.
- 명시적 분석 → dut 내부 graph supported → 미저장 W=4→8 변경 후 stale/이전 hierarchy 및 graph 유지 확인.
- 재진입은 stale 및 이전 hierarchy 유지, 명시적 Update는 parameter8 반영, 원본 파일은 parameter4 유지 확인.
- panel 한 개 재사용과 닫기/재열기 후 hierarchy 유지 확인.

이 검증은 실제 host API/visibility 흐름이며 마우스로 아이콘이나 webview Update 버튼을 누른 물리 입력 수용은 아니다. 첫 창 시작 지연과 unresponsive/responsive 로그를 보존한다. host 수용은 최종 receipt와 종료 코드로 확인했다. welcome 버튼의 실제 script는 단위 VM에서 초기 무요청과 클릭 후 nonce 메시지를 검사했다.

관련 자동 시험 .dev/structure-workspace-unit.log 30 PASS/0 FAIL. 최종 전체 순차 회귀 .dev/structure-workspace-full-verified.log **202 PASS/0 FAIL/0 SKIP**, exit0. 타입 검사 .dev/structure-workspace-types-verified.log exit0, runner의 개발 build exit0. 새 VSIX/ZIP 패키징·설치를 하지 않았다.

최초 전체 회귀 .dev/structure-workspace-full.log는 189 PASS/12 FAIL였다. 새 TreeView visibility 이벤트를 반영하지 않은 host 모형의 10개 실패와, Explorer 컨테이너가 항상 있다는 오래된 contribution 시험 가정 1개를 수정했다. 나머지 기존 40ms 취소 시험은 timedOut을 반환했고 제품 원인을 수정했다고 하지 않는다. 첫 순차 재실행 .dev/structure-workspace-full-final.log는 201 PASS/1 FAIL(Explorer 가정)였고, 해당 모형/가정 보완 뒤 최종 전체 결과를 별도 기록한다. 순차 실행 통과는 병행 부하의 timing 문제 해결 근거가 아니다.

## 다음 작업과 미완료

다음은 [구조도 방향](structure-schematic-direction.md)의 scope 모델과 표시/배치 결합이다. 현재 화면은 기존 port 연결도/leaf 연산 graph이며 자식 블록·모듈 자체의 연산·net을 통합한 schematic 완성이 아니다. 큰 canvas 중심 화면 구성, Update 버튼의 진행/실패 상태, 전체 물리 입력/접근성·취소/복구 및 E4B 게이트를 유지한다. 2×2→4×4 fixture/직교 배선/연속적인 계층 확대도 남아 있다. 독립 IDE/자체 엔진은 별도 사용자 논의 전 시작하지 않는다.
