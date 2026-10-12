# 블록 우회 배선과 기록 기반 디버깅 재검증 — 2026-10-08

## 구현

- Schematic 배선은 블록의 bounds/column과 실제 terminal을 사용한다. source 쪽 빈 corridor→블록 사이의 수평 통로→target 쪽 corridor로 직교 우회한다. 레지스터 clock은 아래 단자로, state feedback은 외부 통로로 진입한다. source/target의 자기 terminal 구간 외에는 카드의 확장 bounds를 관통하지 않는 경로만 표시한다.
- 서로 다른 source의 수평/수직 공선 겹침을 검사하고 다른 통로를 찾는다. 같은 source의 실제 T 분기는 접속점, 서로 다른 source의 내부 수직/수평 교차는 작은 gap으로 구분한다. 공통 꺾임만 있는 경우는 접속점이 아니다. graph edge/node/type/conversion/source/trace identity는 그대로다.
- 교차 검사 최대 2,000,000 pair 제한이 있다. 모든 형태의 wiring을 해결하는 최적 router는 아니다. 경로/교차 표시를 완성하지 못하면 **canvas 위에 안내**하고 원본 semantic graph는 유지한다. 막힌 경로를 블록을 관통하는 선으로 대체하지 않는다.
- 새 `schematic-routing.ts`는 VS Code API를 참조하지 않는 표시용 geometry 함수다. semantic 분석이나 합성·시뮬레이션을 수행하지 않는다.

## 실패에서 보완한 부분

1. 첫 실제2×2에서 서로 다른 net이 같은 수평 우회 통로에 겹치는 것을 발견했다. source별 channel과 공선 겹침 검사를 추가했다. 초기 run-7xygQY는 `finalRoutesVerified=false`로 보존한다.
2. recorded pipeline MAC 검증에서 edge15 `product → if / else [true]`가 누락됐다. 앞서 배치된 선 때문에 고정 escape corridor를 쓸 수 없는 경우였으며 가까운 다른 source/target corridor도 찾도록 보완했다. 최초 `.dev/schematic-routing-recorded.log` / 진단 `.dev/schematic-routing-diagnostic.log` exit1은 통과로 세지 않는다.
3. 재현 graph를 private source path/diagnostics 없이 `tests/fixtures/pipeline-routing.json`에 보존했다. product→enable과 모든 state feedback edge가 표시되는 회귀 시험을 추가했다. 이전 source-lane 시험의 임의 두 net→같은 module terminal은 충돌하는 geometry였으므로 독립 register input terminal로 바꾸고, 충돌 terminal은 별도 fail-visible 안내 시험으로 남겼다.

## 검증 근거

- geometry/renderer 13개 관련 시험 통과: forward/backward 카드 관통 방지, clock/same-block feedback, 다른 net의 공선 겹침 방지, T/crossing/shared-bend 분류, exact port/관측 identity, recorded MAC의 모든 edge, 불완전 안내가 접힌 Details 밖에 보이는지 검사한다.
- 최종 전체 회귀 **221 PASS / 0 FAIL / 0 SKIP** (`.dev/schematic-routing-full-verified.log`), 타입 검사 및 개발 build exit0.
- 실제2×2 `.dev/schematic-routing-ui-verified.log`, `.dev/schematic-ui/run-ZHOpQB/project/.rtl/schematic-ui-host.json`: passed=true, runner/extension host exit0. native 부모10포트/4PE와 `routingIncomplete=false`를 assert했고, computer-use로 부모 Fit/100%·PE00 double-click·leaf MAC100%·카드 우회/feedback/아래 clock/gap 표시를 확인했다. 조밀한 배선의 가독성은 추가 개선 대상이다. corridor 대안 탐색 보완 후 recorded 검증이 아래 최종 근거이며 2×2 전체 물리 조작을 다시 반복한 것으로 계산하지 않는다.
- 실제 recorded MAC `.dev/schematic-routing-recorded-verified.log`, 격리 host `.dev/e3-host/run-z6ycAb`, `.dev/e3/mac 한글 i9Z8iB/.rtl/e3-host.json`: passed=true/exit0. **Schematic** 모드로 signed4/signed8/unsigned4의 모든 route가 완성됨을 assert하고, **117개** product/stage/acc 기대값, clock rising 이동·wave shared cursor·readonly recorded source를 대조했다. 이는 실제 host API 검증이며 버튼으로 모든 source/wave/clock을 왕복한 물리 검증은 아니다.
- semantic/Verilator 실행 코드는 변경하지 않았다. 보존된 실제 실행 결과로 재검증했고 새 simulation을 돌렸다고 계산하지 않는다. 사용자 counter/기존 배포물은 유지하며 새 패키징/설치는 없다.

## 현재 목표와 남은 마무리

이번 목표는 모듈별 RTL 구조와 **기록된 simulation의 신호값/시간/clock을 연결하는 읽기 전용 디버깅**이다. live breakpoint·simulator single-step·operator/next-state 자동 계산은 범위 밖이다.

배선 첫 보완과 retained 디버깅 재검증은 완료했다. **E4 전체 완료는 아직 아니다.** 다음은4×4/조밀한 배선 가독성과 규모 검사, 실제 source↔diagram↔wave/clock 왕복·keyboard/focus·취소/닫기/복구·browser 비용 수용이다. 유사 위치의 crossing/junction, 가까운 평행선 및 최대 pair 초과를 포함해 일반적인 큰 graph 수용은 추가 확인해야 한다. generate/arrays·연속 계층 확대 제한은 유지한다. 독립 IDE/자체 엔진은 H0에서 별도 아이디어 논의 후 계획한다.
