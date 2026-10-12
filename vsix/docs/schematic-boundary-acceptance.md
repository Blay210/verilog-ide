# 모듈 외곽·입출력 배치와 배선 분기 — 2026-10-08

## 구현과 정확성 경계

Schematic에서 현재 모듈의 compiler-confirmed port를 왼쪽 입력/오른쪽 출력 terminal로 표시하고, 자체 연산·신호·register와 opaque child block을 외곽선 안에 묶었다. 외곽선 제목은 모듈 이름이다. 같은 선언 이름을 추정하는 대신 `PortBinding.internalSignal`과 graph의 `declarationId`가 정확히 일치하고 폭이 같으며 양쪽 identity가 유일할 때만 배치한다. 다른 instance, 이름만 같음, 폭 불일치, alias, inout은 일반 신호로 유지한다. 현 범위에서 boundary port source/trace identity는 기존 compiler signal의 것을 보존한다.

같은 source의 앞으로 향하는 배선은 공통 spine을 쓰고 fanout junction을 표시한다. 다른 source는 서로 다른 spine offset으로 나눈다. 직교 배선의 crossing을 전기적 연결로 새로 해석하지 않으며 graph edge, 연산 node/type/conversion과 child 경계는 변경하지 않는다. state-output/clock 경계와 기존 상세 leaf 검사 모드도 유지한다.

## 검증

- 관련 renderer 10 PASS. 새 시험은 boundary exact identity/width/alias/instance/inout 격리, 입력만 있는 모듈의 유효 크기, named signal 관측 유지, source별 spine 구분과 graph 불변성을 확인한다.
- 전체 순차 회귀 **215 PASS / 0 FAIL / 0 SKIP**, `.dev/schematic-boundary-full.log`, exit0. 로컬 HTTP fixture를 포함하므로 로컬 서버 접근 가능한 환경에서 실행했다.
- 타입 검사 및 개발 build exit0. 새 VSIX 제작/설치 없음, 사용자 counter 수정 없음. semantic 추출/Verilator 실행 코드는 변경하지 않았다. 이전 실제 simulation 근거는 유지하며 이번에 simulation을 다시 실행한 것으로 계산하지 않는다.
- `scripts/test-schematic-ui.mjs` / `tests/vscode/schematic-ui.ts`는 예제의 rtl/tb/manifest만 별도 `.dev/schematic-ui/run-*` 프로젝트에 복사하고 독립 profile을 사용한다. 실제 semantic 결과의 입출력 **10개**·child module **4개**·boundary/junction 표시를 assert한다. UI 작업 중 scope/mode/status 변화를 기록하고 `.rtl/schematic-ui-finish.json` gate로 검사 대상 창만 종료한다. 사용자의 열린 작업 창은 조작하지 않는다.

## 실제 화면 확인

computer-use 스킬로 격리된 실제 VS Code 개발 창에서 다음을 확인했다.

- 부모 systolic_array의 외곽선, 왼쪽 입력/오른쪽 출력과 PE 4개.
- Fit→100%에서 port/모듈 글자 읽기, background drag pan, Fit 복귀.
- PE00 double-click→해당 MAC 내부 Schematic. +/×·MUX·register와 아래 clock terminal 및 MAC 입출력 경계 확인.
- hierarchy toolbar Up→부모 Schematic 복귀. host observations의 parent→PE00→parent 및 supported 상태와 일치한다.

최종 `.dev/schematic-boundary-ui-verified.log`, `.dev/schematic-ui/run-i6FCdG/project/.rtl/schematic-ui-host.json`: passed=true, runner/extension host exit0. **completeE4=false**다. 물리 확인은 이번 2×2/PE00와 위 동작에 한정한다.

초기 `.dev/schematic-ui/run-Er9od6`에서는 서로 다른 입력 신호의 spine 겹침을 발견했다. source별 offset을 보완한 뒤 새 profile/run-i6FCdG로 재확인했다. 초기 receipt는 `finalRoutingVerified=false`로 보존했고 최종 확인으로 대체한다.

## 남은 문제와 다음 실행

1. 긴 배선은 중간 column의 카드 아래를 지날 수 있다. 현재는 source spine 분리와 fanout 첫 개선이며 **obstacle-aware routing 완료가 아니다**. 카드 bounds/port terminal을 기준으로 우회 경로를 만들고 다른 net 교차와 실제 접속점을 시각적으로 구분하는 것이 다음 작업이다. 특히 MAC state feedback와 부모 clock/data fanout을 확인한다.
2. Fit에서 작은 글자가 나오는 것은 현재 그래프 규모/viewport 제한이며 100%/pan으로 읽기를 확인했다. 전체 보기의 정보량과 port/constant/conversion 밀도 개선은 남는다. 어떤 conversion도 임의로 지우지 않는다.
3. webview의 화면 밖 Up 버튼을 accessibility index로 클릭하려다 Quick Access가 열린 경우가 있었다. Escape로 복구하고 **화면에 보이는 hierarchy toolbar Up**으로 정상 복귀를 확인했다. 화면 밖 element 자동화 기하 또는 keyboard focus/scroll 문제를 구분해야 하므로 접근성 수용 통과로 처리하지 않는다. 사용자 파일 수정/명령 실행은 없었다.
4. 임의 RTL의 물리적인 2×2/4×4 배열 배치는 추정하지 않는다. 예제는 streaming systolic model이 아니라 weight-stationary connectivity fixture다. 4×4와 generate/array, 연속 hierarchy 확대, E4B source/wave/clock 물리 왕복·접근성·browser 비용·취소/복구는 남아 있다.

다음은 카드 우회/교차선 표시와 해당 실제 화면 확인이다. 독립 IDE/자체 compiler·simulator는 H0 별도 사용자 논의 이후에 구체화한다.
