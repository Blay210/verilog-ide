# E0 — 내부 연산 semantic 추출 실험과 E1 계약

기준일: 2026-10-07. [전환 전 로드맵](pre-ide-roadmap.md)의 E0 근거다. 개발용 probe와 fixture이며 **제품 그래프 provider/화면/내부 관측값 연동은 아직 없다**. VSIX 0.3.1 및 사용자 예제는 변경하지 않는다.

## 재현 가능한 산출물

- `scripts/probe-internal-operations.py`: 현재 설치된 pyslang 11.0.0으로 explicit top을 elaboration하고 signal, 연속 대입, net initializer, 순차 statement의 compiler metadata를 JSON으로 기록한다. 사용자 소스나 signal 값을 실행/수정하지 않는다.
- `tests/fixtures/internal-operations/design.sv`: counter, 9bit adder와 8bit slice/조건 선택, 8bit/4bit 입력의 두 signed pipeline MAC.
- `unsupported.sv`: async reset event list와 always_comb를 첫 순차 후보에서 제외하는 fixture.
- `tb.sv`: reset/enable/pipeline/signed product를 assertion으로 확인하고 내부 named 신호를 dump하는 작은 실행 fixture. 최종 사용자용 MAC 예제 E3의 전체 검증 범위는 아니다.
- `tests/semantic/internal-operations.test.ts`: 실제 native AST와 실제 Verilator VCD를 확인한다. native 경로/실행 플래그가 없으면 SKIP하므로 skip을 통과로 세지 않는다.

개발 환경의 `RTL_SEMANTIC_PYTHON`에 private Python 실행 파일, `RTL_DEV_HOME`에 공유 도구 저장소를 지정하고 `RTL_INTEGRATION=1`로 native 시험을 실행한다. `node node_modules/tsx/dist/cli.mjs --test tests/semantic/internal-operations.test.ts`. Python 단독 probe는 `python -I -B scripts/probe-internal-operations.py SOURCE TOP OUTPUT`이며 출력 디렉터리는 호출자가 마련한다. 실험 생성물은 `.dev/e0/`/해당 임시 프로젝트 `.rtl/`에만 둔다.

## 확인한 추출 범위

| 항목 | 실제 AST에서 확인한 근거 | E1에서 필요한 해석 |
|---|---|---|
| net initializer | `wire product = a*b`, `wire sum = ...`는 NetSymbol.initializer | ContinuousAssignSymbol만 모으면 곱셈/덧셈이 누락됨. net initializer는 조합 대입, variable initializer는 startup 초기화로 분리 |
| 연산 | BinaryExpression의 operator/left/right/type | MAC Multiply는16bit/8bit signed; adder Add는9bit. 표면적 피연산자 폭만으로 결과 폭을 계산하지 않음 |
| 형 변환 | ConversionExpression의 operand/type/isImplicit | MAC 피연산자8→16/4→8 context 확장과 assignment 잘림을 별도로 표현 |
| 선택/연결 | ConditionalExpression, RangeSelectExpression, ConcatenationExpression | choose 조건과 sum[7:0], 두 concatenate를 보존. 첫 제품 allowlist는 E1에서 결정 |
| 순차 블록 | ProceduralBlockSymbol.procedureKind, TimedStatement, SignalEventControl | single posedge named clock를 후보로 식별. reset/enable은 ConditionalStatement의 중첩 ifTrue/ifFalse 순서로 보존 |
| 대입 | AssignmentExpression.isNonBlocking/left/right | acc의 현재 state→Add→다음 state 관계, stage/acc 각각의 갱신을 분리 |
| 신호 | VariableSymbol/NetSymbol의 type·hierarchicalPath·location | parameter별 instance 범위/폭/부호와 source line/UTF-16 character를 얻음 |
| 후보 제외 | async reset은 EventList, always_comb는 다른 procedureKind | 둘 다 candidate=false와 이유를 제공. 모든 RTL의 안전한 허용/거절 판정기는 아직 아님 |

fixture의 signed 입력을 unsigned adder에 연결하거나 slice로 signed MAC에 연결할 때 compiler signedness 경고가 발생한다. 의도적으로 보존하며 error/fatal 없이 elaboration되는지 검사한다. ‘경고 없음’으로 기록하지 않는다.

## 기록값 매핑 가능성

실제 실행은 assertion으로 초기화, enable hold, 이전 stage를 사용하는 누적, 음수 곱셈을 확인한다. VCD에서 두 MAC 각각의 `product`/`stage`/`acc`와16bit/8bit 폭을 확인하고 지정 시각 raw 값을 대조한다. 이는 **이 fixture에서 내부 named 신호를 dump하면 관측 가능하다는 실험**이다. 임의 사용자 RTL의 모든 중간 연산값/동일 시각 NBA 이전값을 복원한다는 뜻이 아니다.

VCD의 display `path`에는 `product [15:0]` 같은 range가 포함된다. 매핑은 `scopeSegments + reference`를 사용하고 폭을 검증해야 하며 range 문자를 정규식으로 지워서 임의 신호에 붙이지 않는다. 처음 추가한 시험의 display path 비교는 이 때문에 실패했고, segmented identity를 사용하도록 시험을 수정했다. 제품 parser/기존 매핑 코드는 바꾸지 않았다.

## E1 모델 계약 — 구현 전 설계

Graph는 schema version, 분석 문맥, root instance, nodes, edges, 지원 상태/diagnostics를 갖는다. 문맥은 current 정적 분석 또는 검증된 recorded run으로 구분하며 recorded의 input fingerprint/instance 문맥을 누락하지 않는다. 모델과 변환 코드는 editor API를 참조하지 않는다.

각 node는 모델 내 고유 ID, kind(signal/constant/operator/conversion/select/register/control/unsupported), 표시명, 소스 위치, compiler type(폭/부호/4-state), instance segments를 갖는 방향이다. 관측 대상은 실제 named signal에만 optional로 연결한다. operator 이름을 임의 VCD 신호명으로 만들지 않는다. 배열/escaped 경로의 일반화는 검증 후 확대한다.

edge는 source/target ID와 operand/control/state-update 역할을 구분한다. register의 output/current state와 next-state 입력을 분리한다. reset·enable 우선순위와 else 없음의 hold를 명시한다. implicit conversion을 생략해 계산 폭과 대입 폭을 혼동하지 않는다. UI는 graph kind가 RTL 의미 구조임을 표시하고 synthesis netlist라고 부르지 않는다.

실제 E1 첫 구현은 counter/adder의 작은 allowlist부터 한다. probe의 candidate=true만으로 process를 허용하지 않는다. 모든 하위 expression/statement, 다중 writer, 조합 순환, delayed assign/net 및 변수를 먼저 검사한다. 모호한 영역은 그 범위를 unsupported로 표시하며 부분 그래프를 완전한 결과처럼 보여주지 않는다. 임의 function/task/class/loop/always_comb와 async reset은 이번 첫 화면에서 제외한다.

지연/크기/노드 수에 한도를 둔 semantic 추출, 취소·늦은 응답 차단 및 source bounds 검증은 생산 provider에 연결할 때 마련한다. 현재 probe는 native 시험 timeout15초와 test runner 취소 경계에서만 실행하며 runtime provider에 노출하지 않는다. 소스 코드에 임의 Python hook을 추가하지 않는다.

## 검증 결과와 다음 작업

최종 native 2 PASS / 0 FAIL / 0 SKIP(약29.4초), 기존 전체 자동 회귀184 PASS / 0 FAIL / 0 SKIP(약15.6초), 타입 검사 및 개발 build exit0. 전체 로그는 `.dev/e0-full-regression.log`, 실제 MAC 수용 receipt는 `.dev/e0/probe-*/.rtl/e0-receipt.json`이다. native2개는 전체184개와 별도 suite이며 단독 core7개는 전체184개에 포함되므로 더하지 않는다. GUI/새 Windows 설치/graph 화면은 이번에 검증하지 않았다.

초기 native 시험은 display path에 range가 포함된 것을 놓쳐1 PASS/1 FAIL였으며 segmented identity로 수정 후 재실행하여2 PASS를 확인했다. 기존 전체 회귀 첫 실행도 병행 build/native 부하에서 시간 의존 취소 시험 하나가 timedOut으로 실패했고, 단독 core7개와 최종 전체184개는 통과했다. 제품 취소 로직/시험 시간을 바꾸지 않았으며 이번 재실행으로 부하 조건의 timing 민감성까지 해결했다고 하지 않는다.

다음은 E1: **제한된 추출 allowlist와 graph 모델/변환 → counter/adder 정적 화면·소스 이동 → 관련 회귀와 실제 개발 호스트 검증**. MAC 정적 metadata 가능성은 확인했지만 전체 MAC 시각화나 E2 값 연결을 완료했다고 표시하지 않는다. H/I 착수 시 사용자 논의 원칙은 유지한다.
