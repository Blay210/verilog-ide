## 독립 IDE H1 구현 시작 (2026-10-09)

Code-OSS1.141.0/revision2a59476c9bfcb90b3ddc372c36762471b7dfad1c를 고정해 ide/upstream에 준비했다. ide 자체 환경 검사·bootstrap·install/compile/start wrapper, 기준 lock/hash와 테스트를 구현했다. 최종IDE4 PASS/Node syntax check exit0. 실제 doctor는 Node/source PASS, Python/MSVC MISSING으로 exit1; build tools 설치 승인을 요청했고 아직 설치/compile/앱 실행 없음. [H1 결과·남은 gate](ide-h1-validation.md). H1 진행 중이며 다음은 사용자 설치 답변에 따른 도구 준비/실제 빌드다. H2~H7/배포/엔진 미착수, VSIX 수정 없음.

## 독립 IDE 계획 점검 완료 (2026-10-09)

[구현 계획](ide-implementation-plan.md)에 H1 기반→H2 공간→H3 기능 이식/진단→H4 Simulation 홈→H5 자동 프로젝트/여러 top→H6 미저장·자동 파형→H7 종료/복원/내부 수용 순서와 완료 기준·요구 추적표를 작성했다. 현재 결정 기록과 대조했고, 여러 top 선택 방식의 옛 제안은 개별 테스트 정책으로 대체한다. 파형 옆 소스·Search/Git 배치·TOML 충돌·자동 trace 상세는 미결로 유지한다. ide는 준비 상태이며 다음은 H1 공식 기준선/빌드 환경 조사다. 이번은 문서만 변경, 새 코드/checkout/설치/테스트/빌드/패키징 없음. 기존 VSIX227 PASS를 IDE 완료 근거로 사용하지 않는다.

## 프로젝트 분리 (2026-10-09)

기존 구현은 vsix/로 이동했고 독립 앱은 ide/에서 자체 코드/설정/의존성으로 개발한다. 프로젝트 간 source import/link/build 입력 공유를 금지한다. 공통 중요 문서는 루트/docs에 보존했다. 자세한 이동/검증·과거 경로 해석은 [구조 기록](project-layout.md)을 참조한다. IDE는 준비 디렉터리이며 앱 구현은 시작하지 않았다.

## 최신 H0 사용자 합의 (2026-10-08)

[제품 결정 기록](h0-product-decisions.md)에 Code/Simulation 두 공간·상태 보존·공통 하단 패널·Simulation 홈/파형과 Diagram 첫 앱 제외를 정리했다. 사용자는 미저장 입력 사본 실행(원본 자동 저장 없음), 최초 가져오기 분류 확인, 종료 선택 시 하위 실행 정리를 승인하고 외부 extension 지원 제외를 명시했다. 다음은 가져오기→편집→실행→파형→재실행 화면 및 설정/이력 정책 설계다. 현재 구현하지 않고 함께 구체화한다. 문서만 변경; 새 시험/빌드/패키징/설치/앱·엔진 착수 없음. E4 지원 범위 완료와 열린 Windows gate는 유지한다.

## 최신 이정표 — E4 지원 범위 내 완료·H0 논의 준비 (2026-10-08)

recorded native run-kH0Z78 실제 source 왕복 focus/Tab·clock35→45ns PASS/receipt/exit0. 누적 E4 기준을 [종합 수용표](e4-acceptance-summary.md)로 대조해 read-only 지원 부분집합·현재 Windows 개발 환경에서 완료 판정했다. 전체227 PASS/타입·개발 build 근거 유지, 이번 제품 코드 변경·전체 재실행 없음. generate/array 내부 연산·연속 hierarchy zoom/live 디버깅·전체 접근성/여러기기 성능은 후속 범위, 깨끗한 Windows 설치 gate는 계속 열려 있다. 다음은 [H0 준비 자료](h0-discussion-brief.md)로 사용자와 독립 IDE 아이디어/범위를 합의하는 것이다. 독립 앱·엔진 구현/Code-OSS fork·패키징/설치는 시작하지 않았다. 아래 과거 E4 진행/다음 검증 기록보다 이 판정을 우선한다.

## 최신 구현 — 카드 우회 배선·교차 표시와 recorded 디버깅 재검증 (2026-10-08)

Schematic에 bounds/column/terminal 기반 직교 우회, 다른 source의 공선 겹침 방지, T 접속점/비접속 crossing gap과 canvas 위 불완전 안내를 추가했다. graph/type/conversion/source/관측 identity는 유지한다. 관련 geometry/renderer13 PASS·최종 전체221 PASS/0 FAIL/0 SKIP·타입 검사/개발 build exit0. 실제2×2 host run-ZHOpQB는10포트/4PE·routing 완성 assert와 부모100%/Fit·PE00/leaf 카드 우회·clock/feedback/gap을 물리 확인했다. recorded host run-z6ycAb는 Schematic MAC3종 모든 route·117기대값·clock/wave shared cursor·readonly source PASS/receipt/exit0. 최초 공선 통로 겹침과 실제 MAC edge15 product→enable 누락을 보완하고 private path 없는 fixture 회귀를 추가했다. [실패·보완·근거·제한](schematic-routing-acceptance.md). 다음은4×4/조밀한 graph 표시·규모와 E4B 실제 source/diagram/wave/clock 왕복·keyboard/focus·성능·취소/닫기/복구 수용이다. E4 전체 완료가 아니며2M crossing pair 한도/가까운 평행선·복합 교차와 generate/array·연속 확대 제한은 유지한다. 현재 목표는 기록 기반 read-only 디버깅까지이며 live breakpoint/simulator step/operator 값 계산은 제외한다. semantic/Verilator 실행 변경·새 simulation/패키징/설치·사용자 counter 수정 없음. H0 별도 논의 유지. 아래 이전 다음 작업보다 이 실행 지점을 우선한다.

## 최신 구현 — 모듈 외곽·입출력 배치와 배선 분기 (2026-10-08)

Schematic에서 exact compiler declaration/동일 폭/유일 port identity만 왼쪽 입력·오른쪽 출력으로 배치하고 내부 연산/opaque child를 외곽선으로 묶었다. source별 routing spine과 fanout junction을 적용하며 기존 graph/type/conversion/source/관측 identity는 보존한다. 관련 renderer10 PASS, 전체 순차215 PASS/0 FAIL/0 SKIP·타입 검사/개발 build exit0. 격리 실제2×2 host run-i6FCdG는10 boundary ports/4PE assert, Fit→100%·pan·Fit·PE00 double-click/leaf symbols·부모 toolbar Up를 물리 확인하고 receipt passed=true/exit0. 초기 source spine 겹침은 보완/재확인했다. [근거·초기 발견·제한](schematic-boundary-acceptance.md). 다음은 카드 bounds를 우회하는 배선과 다른 net 교차/접속점 구분·실제 화면 확인이다. 현재 긴 배선이 중간 카드 아래를 지나는 문제와 화면 밖 accessibility index 입력 문제는 남아 있고 E4 완료가 아니다.4×4·generate/array·연속 계층 확대·E4B source/wave/clock 왕복/접근성/성능/취소·복구·H0 별도 논의 유지. semantic/Verilator 실행은 변경하지 않았고 이전 simulation 근거를 유지한다. 새 패키징/설치·사용자 counter 수정 없음. 아래 이전 다음 작업보다 이 실행 지점을 우선한다.

## 최신 구현 — Schematic 심볼·입력 접점 첫 개선 (2026-10-08)

Schematic의 부모 결합/leaf 그래프에 공통 심볼(+/× 원형, MUX, Register D→Q/아래 클럭 단자)을 적용했다. compiler 노드·폭/부호/변환·source/관측 identity는 유지하며 operand 입력 접점을 분리하고 column 폭을 조정했다. Detailed leaf logic은 기존 상세 화면을 유지한다. 관련 renderer8 PASS, 전체 순차213 PASS/0 FAIL/0 SKIP·타입 검사/개발 build exit0. 실제 격리 host run-iRLRYg receipt passed=true/exit0로 진입·Update·미저장 RTL·모드/재열기 흐름을 확인했다. 최초 제한 환경 local HTTP 시험 실패·대기 종료1은 보존하며 로컬 서버 접근 가능한 환경의 전체 재검증을 통과했다. [구현·근거·제한](schematic-symbol-acceptance.md). 다음은 실제2×2/leaf MAC 화면을 보며 모듈 외곽/상위 포트·fanout/교차선 가독성을 개선하고4×4·E4B 물리 왕복/접근성/성능/취소·복구 수용이다. 새 심볼 물리 화면 수용·generate/array·연속 계층 확대는 미완료. H0/H/I 별도 논의는 유지하고 새 패키징/설치·사용자 counter 수정 없음. 아래 이전 다음 작업보다 이 실행 지점을 우선한다.

## 최신 구현 — 기본 Schematic/표시 모드와 큰 canvas 흐름 (2026-10-07)

module 선택은 Schematic을 기본으로 분석하며 unsupported는 이유와 Connections fallback을 표시한다. Display selector(Schematic/Connections/Detailed leaf logic)는 Update·scope 이동에서 선택을 유지한다. current graph 재열기/편집은 재분석 없이 static 그림을 유지하고 stale 이동도 그림을 지우지 않는다. 늦은 분석·취소/재시도 경계를 검증했다. parameters/modules/connection 상세를 canvas 아래 접힌 Details로 옮겼다. 전체 순차211 PASS/타입·개발 build exit0, 실제 host run-s7uAg5 기본 분석·Update 모드/미저장 RTL·재열기 graph 보존 receipt/exit0. [근거·초기 대기/실패·제한](structure-default-view-acceptance.md). 다음은 module 경계·연산/register의 간결한 schematic 표현과 fanout/배치 개선, 실제2×2→4×4·E4B 물리 입력/접근성·browser 비용/취소·복구 수용이다. semantic/Verilator 추출은 이번에 변경하지 않았고 이전 근거를 유지한다. generate/arrays·연속 확대·H/I 별도 합의는 남아 있다. 새 배포 패키징/설치·사용자 counter 수정 없음. 아래 이전 다음 작업 문구보다 이 실행 지점을 우선한다.

## 최신 구현 — 부모 연산/register와 자식 경계 결합 첫 범위 (2026-10-07)

별도 scopeOperations가 부모 자체 assign/operator/register와 직접 child instance의 opaque module-port를 연결한다. leaf internalOperations 계약은 유지하고 child output writer/폭·부모 입력·unsupported/partial-free 경계를 검사한다. Show module logic 버튼/명령과 그룹 module card/직교 배선·source/내부 진입·부모 named signal 관측을 연결했다. 전체 순차208 PASS/타입 검사·개발 build exit0, E1 포함 native18 PASS/새 semantic+실제 Verilator·retained7값 native2 PASS, actual host run-iIL6MT scopeOperations/편집·명시 Update/재열기 receipt·exit0. [근거·지원범위·미완료](scope-operations-acceptance.md). 다음은 결합 분석의 기본 화면/Update 모드 정책, module 경계·register/연산 심볼·배선/큰 canvas의 간결한 표현과 실제 UI 수용이다. generate/arrays·4×4·E4B 물리/접근성/성능·취소/복구·연속 확대는 남아 있다. 사용자 counter 변경·새 배포 패키징/설치 없음. 아래 이전 다음 작업 문구보다 이 실행 지점을 우선한다.

## 최신 구현 — 모듈 경계·직접 신호 배선 첫 범위 (2026-10-07)

compiler-confirmed internalSignal/directSignal을 hierarchy에 공급하고 VS Code 독립 buildScopeConnections가 모듈 경계와 immediate 자식 블록을 exact declaration identity로 연결한다. 직접 whole-signal만 단일 driver→sink 직교 배선/topology column으로 그리며 식·slice·cast·폭 변환·상수·interface·다중 driver/inout은 추정하지 않는다. examples/systolic-mini의4 PE/12nets/20wires·expression 격리/leaf 연산·실제 Verilator PASS 및 retained VCD의4값 대조 native2 PASS; 전체 순차205 PASS/타입 검사·개발 build exit0. [근거·초기 오류·범위](scope-connections-acceptance.md). 다음은 자식 경계가 있는 모듈의 자체 assign/연산/register 추출과 net 모델 결합이다. 현재 schematic 전체 완성이 아니며 새 레이아웃의 물리 UI/4×4 및 E4B 접근성·성능/복구를 유지한다. 사용자 counter 변경·새 배포 패키징/설치 없음. 아래 이전 다음 작업 문구보다 이 실행 지점을 우선한다.

## 최신 구현 — Structure 전용 작업 공간 첫 범위 (2026-10-07)

Activity Bar Structure 아이콘/컨테이너와 RTL Hierarchy 이동, visibility→중앙 canvas 진입, 최초 분석 전 Update 화면, 기존 panel 재사용을 구현했다. 편집 시 마지막 hierarchy/static graph를 유지하고 변경 표시·오래된 소스 이동 차단, 명시적 Update는 기존 미저장 RTL overlay를 반영하며 저장하지 않는다(사용자 입력 정책 답변은 대기). 최종 전체 순차202 PASS/0 FAIL/0 SKIP·타입 검사/개발 build exit0. 최초 모형/contribution 가정 실패는 보완, 기존40ms 취소 시험 병행 부하 실패는 미해결로 기록. 실제 host run-djoKya receipt passed=true/exit0: 분석 없는 진입·편집/수동 갱신·재진입·닫기/재열기 확인. [구현·검증·제한](structure-workspace-acceptance.md). 다음은 자식 블록과 현재 모듈 자체 net/연산/저장소의 scope 모델·표시/배치 결합, 작은 2×2 fixture다. E4B 전체 물리 입력·접근성·browser 비용/복구는 유지하며 목표 schematic 완료가 아니다. 새 배포 패키징/설치 없음.

## 최신 사용자 방향 — 모듈 중심 schematic 작업 공간 (2026-10-07)

사용자 4×4 systolic_array / mac_pe 그림으로 목표를 명확히 했다. 현재 모듈의 배선·연산·저장소와 자식 모듈의 경계 블록을 함께 보여주고, 내부 진입 시 해당 자식의 구조를 보여주는 별도 작업 공간이다. 자동 편집 갱신 대신 명시적 Update, 최종적으로 계층 확대에 따른 내부 펼침을 원한다. **현재 port 연결도와 leaf 연산 그래프는 기반이며 목표 schematic 완료가 아니다.** [요구·현재 차이·제안 순서·확인 대기](structure-schematic-direction.md)를 먼저 읽는다. E4B 정확성/접근성/복구 게이트는 유지하되 기존 외형 수용만으로 목표 완료를 선언하지 않는다. 다음은 사용자 화면/Update 답변 반영 후 scope 모델·표시/배치 재설계 범위 구체화이며 H/I 착수 합의는 별도다. 이번은 문서만 변경, 새 구현/시험/패키징 없음. 아래 이전 다음 작업 문구는 이 방향과 함께 읽는다.

# 독립 IDE 전환 전 실행 로드맵

기준일: 2026-10-07. 사용자 요청으로 **독립 IDE 착수 전까지**의 개발을 구체화한 계획이다. 다음 기능 구현 순서는 이 문서가 기준이며, 전체 요구/구현 상태는 [제품 로드맵](project-roadmap.md), 이전 검증 근거는 [비공개 베타 수용](private-beta-acceptance.md)을 따른다.

**E0/E1/E2 및 D4의 제한된 내부 관측·클럭 기록 탐색/개발 화면·API 기반 host 검증 및 E3 pipeline MAC 예제/reference 검증 완료**, E4A 실제 가독성/기본 규모 검증을 진행했고 E4B 전체 흐름·접근성/복구 수용이 남아 있다. [E4A 근거](visual-debugging-e4a.md)를 참고한다. [E3 결과](pipeline-mac-acceptance.md)를 참고한다. [D4 구현·검증·제한](clock-edge-acceptance.md)을 참고한다. [E2 구현·검증·제한](internal-operations-e2.md)을 참고한다. [E0 추출 근거](internal-operations-e0.md), [E1 지원 범위·실제 검증·제한](internal-operations-e1.md)을 참고한다. graph 물리 조작/시각 수용은 E4의 잔여다. 내부 named signal 관측은 지원 부분집합에서 구현했다. 대화에서 말한 ‘6번 내부 연산 시각화 / 7번 독립 IDE’는 다음 작업 묶음 이름이고, 원래 6단계 제품 로드맵 번호와는 별개다. 기존 delivery의 D4/E/H/I ID를 유지한다.

## 제품 목표와 이번 합의

- 최종 목표는 엔지니어가 RTL 설계에 집중하는 독립 VS Code/Code-OSS 기반 IDE다. 현재 확장은 초기 실행 호스트다.
- VSIX 0.3.1은 스터디 피드백용 기준 버전으로 유지한다. 새 개발 코드는 개발 호스트에서 검증하며 추가 배포는 별도 요청 때 한다. 사용자가 수정한 예제나 기존 결과는 덮어쓰지 않는다.
- 주 개발은 제한된 내부 구조/연산 시각화로 이동한다. 베타의 실행 중단·잘못된 값·손상·편집 핵심 오류는 병행해서 수정하며, 해당 작업의 정확성을 막는 결함은 먼저 해결한다.
- 깨끗한 Windows·대표 사용자 프로젝트·장시간 메모리·일부 실제 입력/프로필 검증은 열린 항목으로 유지한다. 외부 환경이 필요한 검증을 완료했다고 하지 않으며 모든 항목이 닫힐 때까지 신규 개발을 무기한 중단하지 않는다.
- **독립 IDE를 시작할 때 사용자와 화면/사용 흐름/배포·유지보수 아이디어를 발전시키고 합의한 뒤 상세 계획을 확정한다.** 지금 Code-OSS fork, 브랜드, 설치 방식, F5 정책 등을 확정하거나 구현하지 않는다.
- **자체 compiler/simulator도 착수 시점에 사용자와 목표·언어 의미·속도·증분 빌드 방향을 논의한 뒤 별도 계획을 확정한다.** 독립 IDE 전환의 선행 조건이 아니다. Verilator/GTKWave와 semantic/simulation 분리 경계를 유지한다.

## 현재 출발점

이미 있는 기반은 elaborated hierarchy, 모듈 내부 이동/Back/Up, 읽기 전용 연결도와 pan/zoom/Fit, 보존된 실행 입력/trace 검증, 포트 관측값, 내장 VCD와 공유 커서다. 제한된 register/operator graph와 내부 named signal 관측은 추가했고 선택 clock 기준 strict 이전/다음 에지 기록 탐색도 추가했다. 새 모델은 이 기반 위에 추가하며 기존 diagram을 완전한 합성 schematic이라고 표현하지 않는다.

현재 베타에서 발견한 빠른 언어 재시작 pending-changes 오류는 별도 수정 우선 항목이다. 기존 184 PASS와 native 수용은 2026-10-06의 근거이며 새 그래프 기능을 검증한 숫자가 아니다.

## 작업 단위와 진입 기준

| 순서 / ID | 산출물 | 이번 범위 | 완료와 다음 단계 진입 기준 | 상태 |
|---|---|---|---|---|
| 1 / E0 | 지원 범위·semantic 추출 가능성·예제/검증 표 | 현재 slang에서 연산·레지스터·폭/부호·소스 위치를 얻는 작은 분석 실험; counter/adder/MAC fixture | 실제 AST와 Verilator 내부 named 신호 확인·native2 PASS·E1 계약 문서화; 제품 provider/화면은 다음 작업 | 완료 — 실험 범위 |
| 2 / E1 | 편집기 독립 내부 그래프와 정적 화면 | leaf counter/adder 등의 bounded AST allowlist, signal/operator/conversion/register/control, 기존 canvas/소스 이동 | 전체186 PASS/native20 PASS/타입·build 및 current/recorded host·기존 실행 PASS. 물리·시각 수용 E4에 유지 | 완료 — 지원 부분집합/개발 호스트 |
| 3 / E2 | 내부 신호 관측값과 공유 시각 | 실행 당시 그래프와 검증 VCD의 내부 integral 신호를 연결, missing/ambiguous/unsupported 표시 | 전체191 PASS/native20 PASS/개발 host 두 MAC·공유 cursor·손상 복구·닫기/재열기 확인, 자동 run/page/late/XZ/폭/alias 경계 | 완료 — 지원 부분집합/개발 호스트 |
| 4 / D4 | 선택 clock/edge 기준 이전·다음 이동 | 기록된 상승/하강 edge 탐색, 명시적 clock 선택, 파형·구조 커서 공유 | 전체198 PASS/개발 host MAC rising/falling·첫/끝·파형 cursor·관측값 확인, bounded query/취소·late/timeout 자동 검사 | 완료 — 지원 부분집합/개발 호스트 |
| 5 / E3 | 작은 pipeline MAC 종단 예제 | 두 MAC 인스턴스, parameter 폭·signed/unsigned 변형, 동기 reset·enable, pipeline과 결과 잘림 | 전체199 PASS/native1 PASS/실제 host 세 graph·117값·shared cursor, negative latency runtime FAIL 확인 | 완료 — 작은 종단 예제/개발 호스트 |
| 6 / E4 | 시각화 UX·성능·복구 수용 | 기존 모듈 diagram→내부 연산→소스/파형 왕복, scope별 보기, 긴 graph 제한·취소·재시도 | 개발 호스트 실제 조작과 자동 회귀, 작은 예제 종단 통과. 측정한 규모/시간/메모리와 지원 한도 기록 | 완료 — 지원 부분집합/현재 Windows 개발 host; [수용표](e4-acceptance-summary.md)와 열린 gate 유지 |
| 7 / H0 | 독립 IDE 논의용 준비 자료 | 구현/미구현 표, 사용 흐름의 불편, editor 의존성 목록, 열린 게이트와 선택할 질문 | 사용자와 독립 IDE 아이디어를 논의하고 별도 H 상세 계획을 합의. 이 합의 전에는 독립 앱 구현에 착수하지 않음 | 준비 자료 완료 — H0 사용자 합의 대기 |

E0→E1→E2→D4→E3→E4→H0 순서로 한 작업 단위를 완료하고 검증한다. E0에서 MAC fixture의 요구를 함께 잡되 첫 추출/화면부터 복잡한 MAC 전체를 구현하지 않는다. 전체 RTL 구문/모든 연산/모든 OS 지원은 H0 진입 조건이 아니다. 심각한 데이터 오류나 지원 범위의 반복 실행 실패는 진입을 막는다.

G structural RTL 생성, P01 반복 빌드 캐시, U12 자동 프로젝트/TB 발견은 기존 백로그에 남긴다. 독립 IDE 전까지 모두 끝내야 하는 작업으로 추가하지 않으며, 실사용 우선순위가 바뀌면 사용자와 순서를 다시 정한다.

## E0/E1: 첫 지원 부분집합

다음은 E0에서 실제 semantic 추출을 확인할 **첫 후보 범위**다. 확인 전 지원 선언하지 않는다.

| 영역 | 첫 후보 | 다음 범위로 미루는 것 |
|---|---|---|
| 데이터 | parameter로 확정된 폭의 단순 integral port/net/variable, 정수 상수, 단순 bit/고정 slice | class/object, interface/modport, unpacked memory, 동적 index, 복잡한 aggregate |
| 조합 연산 | 단순 연속 assign의 연결·덧셈·곱셈·조건 선택; 필요한 비교와 enable/reset 제어 관계 | 임의 함수/task 내부 전개, loop 전개, 복잡한 procedural always_comb, 모든 operator 일반화 |
| 순차 연산 | 단일 clock의 제한된 always_ff, nonblocking 갱신, 동기 reset/enable, 명시적인 if/else 우선순위 | async reset, latch, 다중 writer, 복수 clock/CDC, blocking/nonblocking 혼합, fork/delay |
| 계층 | 기존 elaboration이 확인한 instance/parameter 문맥; 부모·자식 이동 | 임의 RTL을 gate-level/netlist로 합성하거나 회로를 생성 |

폭·부호·상수·조건 우선순위·assignment 변환은 compiler metadata를 근거로 한다. 정규식으로 RTL을 회로로 추정하지 않는다. expression 폭과 assignment 대상 폭/변환을 구분하고 metadata가 없으면 의미를 지어내지 않는다. register는 상태 경계이며 조합 순환/다중 writer/미지원 문맥을 일반 DAG로 숨기지 않는다.

노드에는 해당 instance, 원본 소스 위치, 값 연결 대상, 지원 상태/이유를 담는다. 예를 들어 `acc <= acc + product`의 acc는 현재 상태와 다음 상태 관계가 명확해야 하며 단순한 조합 되먹임으로 표시하지 않는다. 그래프는 **지원 RTL의 의미 구조**다. 실제 합성 최적화 결과·물리 회로와 다를 수 있음을 화면/안내에 표시한다.

기존 semantic 결과와 별도 내부 graph 모델을 검토하되 VS Code API를 모델/분석 계층에 넣지 않는다. Core는 프로젝트·보존 입력/결과 검증, semantic은 구문/의미 추출, waveform은 기록값 조회, host는 화면과 사용자 동작을 담당한다. 실제 요구가 생긴 계약만 추가하고 독립 앱용 빈 프레임워크를 만들지 않는다.

## E2: 값의 출처와 정확성

- 기본 관측 모드는 **실행 당시 보존 입력의 graph + 같은 run의 검증 trace**다. 현재 편집 중인 소스에 과거 값을 붙이지 않는다. 현재 소스의 정적 보기에는 기록값을 표시하지 않는다.
- 내부 신호도 full instance path/폭/alias를 확인한다. 같은 이름으로 연결하거나 두 MAC 중 임의 인스턴스를 선택하지 않는다. array/generate 등의 범위는 기존 port 매핑 지원이 곧 내부 전체 지원이라는 뜻이 아니다.
- 값 상태는 최소한 관측됨, 기록 없음, 모호함, 폭 불일치, 미지원, 무효화/로딩을 구분한다. X/Z는 유지하며 0으로 바꾸지 않는다. 큰 시각은 기존 정확한 정수 시간 모델을 사용한다.
- operator의 출력이 이름 있는 신호로 dump되지 않으면 구조만 보여주고 관측값은 없음으로 표시한다. 이번에는 임의 expression을 실행하거나 추정값을 표시하지 않는다.
- 예제는 product/acc 등 관측할 중간 신호와 dump 코드를 명시적으로 갖춘다. 기존 사용자 RTL을 자동 수정하지 않는다. instrumentation과 원본/생성 코드 경계는 별도 후속 논의다.
- 기존 run/input/trace 식별, nonce/generation/revision, 손상 무효화와 취소/reader 종료 경계를 재사용한다. graph는 검증된 retained 입력에서 요청 시 다시 추출한다. 입력/trace identity가 없는 legacy 결과에는 값을 연결하지 않고 기존 파형/포트 보기를 유지한다. 모델 저장이 필요하면 버전과 legacy 처리를 먼저 설계한다.

## D4: 클럭 이동은 기록 탐색

사용자는 clock 신호와 상승/하강 edge를 선택하고 이전/다음 edge 버튼으로 이동한다. clock 이름만으로 자동 확정하지 않는다. 처음에는 재생 속도/자동 animation보다 수동 이동·현재 시각·값 대응을 완성한다. 다중 clock은 한 번에 하나의 기준 clock을 고르는 수준으로 제한한다.

edge 판정은 첫 버전에서 명시적인 0→1 / 1→0 전이로 제한하고 X/Z 포함 변화는 edge로 세지 않는다. 현재 시각과 같은 edge를 되풀이하지 않고 엄격히 이전/다음으로 이동한다. 범위 밖/edge 없음은 설명하고 종료 시각을 만들지 않는다. fixture에서 이 정책을 검증한다.

현재 VCD는 한 시각의 마지막 기록값을 조회하므로 delta-cycle/NBA 이전·이후의 정확한 단계가 복원되지 않는다. 화면에는 ‘해당 시각 최종 기록값’을 표시하고 register 입력이 그 clock에 실제 sampling된 값이라고 단정하지 않는다. pipeline이 바뀌었다는 표현도 관측 변화에 근거하며 인과적인 신호 전파 animation은 후속이다. 실제 simulator pause/step/live execution은 I 단계다.

edge 조회는 waveform query/worker 경계에서 수행하는 방향을 우선 검토한다. 큰 VCD를 host/UI에 전부 전달하지 않고 조회 한도·취소·늦은 응답 차단을 마련한다. 상세 API와 한도 수치는 E0/E2 측정 후 확정한다.

## E3/E4: 예제와 검증 표

| 검증 묶음 | 확인할 내용 |
|---|---|
| 정적 모델 | counter, adder, MAC의 operator/register/조건·소스 위치, parameter가 다른 폭, signed 곱셈·잘림, unsupported 사유 |
| 관측값 | actual Verilator VCD와 BigInt/raw X/Z 대조, 두 동일 모듈의 인스턴스 격리, dump 없는 중간값, alias/폭 불일치 |
| MAC 동작 | 단순 정수 reference와 assertion으로 예상 결과 검증; reset·enable 유지/갱신, pipeline latency, overflow/잘림을 명시 |
| 클럭 이동 | 첫/마지막/clock 없음/복수 clock/긴 시간/zero-duration, edge 정책 및 시각 최종값 제한 |
| 결과 보존 | 실행 뒤 현재 소스 수정/삭제, 기록 입력·trace 손상, 다른 run 교체, legacy 입력에서도 잘못된 값 연결 차단 |
| 생명주기 | 분석·읽기 취소, 닫기/재열기, 빠른 scope/time 변경, peer 창 값 보존, worker/subprocess 종료 |
| 실제 UI | top→자식→연산 보기, Back/Up와 소스 이동, pan/zoom/Fit, 같은 시각 파형 연결, 경고/미지원 상태 이해 가능성 |
| 기존 기능 | 관련 편집/semantic/simulation/structure/waveform 회귀·타입 검사·개발 build. 이정표에서는 전체 자동 회귀 실행과 실제 지원 예제 확인 |

새 예제/fixture는 기존 사용자 예제와 분리하고 생성물은 `.rtl/`, 측정 fixture·프로필은 `.dev/`, 공유 도구는 프로젝트 밖에 둔다. 실제 측정 결과/시험 개수/제약을 기록하고 관련 시험만으로 전체 안정성을 선언하지 않는다. 성능 목표 수치는 작은 모델과 대표 fixture를 먼저 측정한 뒤 사용자 기대와 함께 정한다.

## H0 이후: 사용자와 논의한 뒤 계획 확정

독립 IDE 준비 때 다음 자료만 정리하고 합의 없이 선택을 확정하지 않는다.

1. 시작/프로젝트 열기·기존 RTL 가져오기, Simulation 전용 화면, toolbar/F5/Explorer 실행, editor/graph/wave 배치의 실제 사용 흐름.
2. 지금 host에 묶인 명령/Testing API/settings/storage/editor/webview 기능과 독립 모델 경계, 파형 보기·설정 이전 요구.
3. Code-OSS 기반 구성 방식과 업데이트/배포/라이선스 유지보수, 최소 제품 범위. 구체 기술 조사는 그때 실제 코드·공식 자료를 확인한다.
4. 미완료 U12 가벼운 프로젝트/TB 발견, U11 Explorer 행 hover 실행 등을 독립 IDE 첫 범위에 넣을지 결정한다. 이들을 지금 별도 구현으로 자동 확대하지 않는다.
5. 베타 실사용에서 나온 장애와 열린 Windows/규모/프로필 게이트의 수용·보류 근거.

이후 **사용자 아이디어 논의 → 결정/미결 사항 기록 → H 세부 로드맵·완료 기준 합의 → 구현** 순서다. 전체 compiler/모든 operator 완성은 필요 없지만 사용 중인 지원 범위에서 잘못된 값을 보여주는 결함은 먼저 해결한다.

자체 엔진 I는 별도 시점에 같은 절차를 따른다. 그때 지원 Verilog/SystemVerilog 범위, event/timing/4-state/assertion 의미, 빠른 첫 빌드와 반복 빌드·실행의 측정 목표, 증분 무효화/캐시 정확성, pause/step/live 요구와 reference 대조를 함께 논의한다. C++ 변환/직접 native compile 등의 구현 방식과 일정은 지금 확정하지 않는다. 내부 파형 기술의 추가 발전도 별도 요구와 사용 경험을 근거로 선택한다.

## 다음 담당자 시작 절차

1. [handoff](handoff.md)와 이 문서, [architecture](architecture.md), 최신 검증/베타 알려진 제한을 읽는다.
2. 현재 다음 작업은 **H0 사용자 논의**다. [E4 완료 판정](e4-acceptance-summary.md)과 [H0 준비](h0-discussion-brief.md)를 읽고 사용자 아이디어/첫 IDE 범위를 합의한다. 지원 범위 확장이나 새 검증을 자동으로 추가하지 않는다.
3. 완료한 ID/실제 검증/남은 제한을 이 문서의 상태 표·project-roadmap·PROGRESS·handoff에 기록한다. 상세 증거는 별도 acceptance 문서에 남긴다.
4. 이전 날짜의 ‘다음은 A3/F/U12/패키징’ 문구는 당시 기록이다. 주요 베타 오류는 병행하되 최신 사용자 합의의 주 개발 순서를 따른다.
5. H/I 착수 시 사용자 논의 단계로 돌아가고 이번 후보 범위를 전체 RTL 지원이나 독립 IDE 사양 확정으로 해석하지 않는다.
