# 부모 자체 연산과 자식 모듈 경계 결합 첫 범위 — 2026-10-07

## 구현과 사용

SlangProvider.scopeOperations와 SemanticProvider의 선택적 계약을 추가했다. 기존 internalOperations의 leaf 전용 거부/지원 범위를 유지한다. 새 요청만 현재 모듈의 직접 자식 InstanceSymbol을 opaque boundary로 분석하고 부모 자체 assign/연산/register graph와 연결한다. 자식 내부 procedural/continuous 로직은 방문하거나 평가하지 않는다.

InternalGraph의 선택적 modules에는 실제 child instance ID·module/name·포트 nodeId/direction/connected를 기록한다. module-port 노드는 자식 경계 terminal이다. 부모 signal은 기존 관측용 signalName과 별도로 compiler declarationId를 제공한다. declarationId는 scope 연결 identity이며 trace 권한/경로 분해에 쓰지 않는다. 부모 입력 expression은 기존 expr allowlist/형 변환 폭을 유지하고 module input으로 연결한다. 자식 출력은 whole local signal·같은 폭에 한정하여 module output으로 연결하며 부모 assign/다른 child와 driver 검사를 공유한다.

renderScopeOperations는 child terminal을 한 모듈 카드로 묶고 부모 signal/operator/conversion/control/register와 직교 배선으로 연결한다. rank는 renderer의 표시 목적이며 child latency/내부 input→output 의미를 분석한 결과가 아니다. 상태 출력은 기존처럼 점선, hold/clock/state feedback은 rank에서 제외한다. opaque module feedback의 레이아웃이 순환하면 같은 column으로 두고 이유를 표시한다.

Structure → Update → 부모 instance 선택 → **Show module logic** 버튼이 새 결합 분석을 수행한다. rtl.showScopeOperations도 같은 동작이다. 기존 Internal operations/Port connections는 유지한다. 아직 선택/Update마다 통합 schematic을 기본 화면으로 자동 구성하는 정책은 구현하지 않았다. source·module 내부 진입·nonce·generation/job 취소·편집 후 마지막 static graph 보존 및 recorded trace 경계를 재사용한다. 관측값은 부모의 실제 named signal만 표시한다. module-port/intermediate expression/next-state 값은 추정하지 않는다.

## 지원 경계 / 미완료

- 직접 child instance만 지원한다. generate/instance array의 자체 로직 결합은 아직 거부한다. 기존 hierarchy/직접 배선 탐색은 계속 사용할 수 있다.
- child interface/inout/ref·default port, 복잡한 output binding과 output 폭 변환은 unsupported다. input의 허용된 expression/constant/conversion은 graph 노드로 표시한다.
- 부모의 기존 simple-integral·512members/256nodes/1024edges/16384bit·single-posedge always_ff/NBA·driver·delay/strength·local combinational cycle 지원 경계를 유지한다. child가 graph limit를 소비하며 child boundary는 최대64개다.
- 지원 불가/진단 오류는 nodes/edges/modules 부분 결과를 표시하지 않는다. child internals가 opaque이므로 child를 통과하는 combinational cycle/CDC/latency 검증은 수행하지 않는다.
- 회로다운 단순화, module 외곽 경계/포트와 register의 표시 정책, 큰 canvas/교차 배선·기본 화면 통합은 남아 있다. compiler 표현 노드를 현재 그대로 보이는 부분은 최종 UX가 아니다.

## 검증

1. .dev/scope-operations-native.log **18 PASS**: 기존 E1 native 거부/overlay/취소를 유지하고 부모 assign+register와 child boundary의 최초 추출/연결을 검사했다.
2. .dev/scope-operations-native-verified.log **2 PASS/0 FAIL/0 SKIP**:
   - .dev/scope-operations/parent 한글 5EDh0Q/.rtl/scope-receipt.json passed=true. 부모 operator1/register1/child1, child 내부의 별도 + 비노출, sum→child input 및 child output→부모 named signal, 다중 writer/child inout/output 폭 변환/generate 4거부 및 partial-free/사전 취소 확인.
   - .dev/scope-operations/simulation 한글 53zA26/.rtl/scope-simulation-receipt.json passed=true. 실제 Verilator reset/8bit wrap/child 계산/clocked 결과 assertion PASS. Core로 검증한 retained 입력에서 hierarchy/scope graph를 다시 분석해 verified VCD의 y/sum/child_out7개 기록값을 대조했다. synthetic child terminal은 관측값을 얻지 않는다.
   - 前 native-complete.log도2 PASS였으며, 분석 receipt를 private project 루트에서 .rtl/ 아래로 옮긴 뒤 최종 native-verified.log를 재검증했다. 이전 사본은 기록으로 보존한다.
3. .dev/scope-operations-host.log actual development host run-iIL6MT, project/.rtl/structure-workspace-host.json passed=true/scopeOperations=true, runner/host exit0. 부모 scope 분석→실제 child ID→내부 분석·편집/명시 Update·재진입/닫기/재열기 기존 회귀 확인. 실제 mouse 버튼/diagram 가독성 수용은 아니다.
4. 초기 관련 .dev/scope-operations-unit.log23 PASS/타입 검사 exit0. 새 renderer에는 group 카드/한 번의 navigation ID·named-only observation·state edge·cycle bounded/stale/escaping, renderStructure의 child authorization와 부모 관측 ID 계약 시험을 추가했다. 최종 전체 순차 .dev/scope-operations-full.log **208 PASS/0 FAIL/0 SKIP**, 타입 검사 .dev/scope-operations-types-final.log/개발 build .dev/scope-operations-build-final.log exit0.

새 VSIX/ZIP 생성·설치 없음. 사용자 counter 변경 없음. 기존40ms 취소 시험의 병행 부하 제한은 유지한다.

## 다음 작업

먼저 결합 분석을 실제 프로젝트 화면의 기본 모듈 구조 흐름으로 정리한다: Update/현재 scope와 graph 표시 모드·취소/실패 상태를 일관되게 유지하고 compiler 세부 표현을 간결하게 표현한다. module 경계 포트·register·연산 심볼/선택·변환의 역할을 정리하고 배선 교차/팬아웃과 canvas 공간을 개선한다. generate/instance array의 자체 로직 지원은 별도 추출·writer 경계 검증 후 확장한다. 2×2→4×4 및 E4B의 실제 UI/접근성·browser 비용/취소·복구 게이트와 연속 hierarchical zoom은 남아 있다. 독립 IDE/자체 엔진 H/I의 사용자 논의는 별도다.
