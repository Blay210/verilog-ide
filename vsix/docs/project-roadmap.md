## 최신 H0 합의 — 파일 내 여러 top·파형 자동 관리 (2026-10-09)

[결정 기록](h0-product-decisions.md)에 tb.v의 top1/top2를 tb.top1/tb.top2 독립 테스트로 관리하는 정책과 사용자 dump 코드 작성 없이 IDE 파형 관리를 반영했다. DUT/helper 모두 자동 테스트 등록은 아니며 발견/identity/자동 trace 구현은 설계 필요하다. 새 프로젝트에서만 기본 폴더 생성, TOML 수동 설정 존중/충돌 방지, 이력 보존·자동 정리 방향도 수용됐다. Simulation 옆 소스 보기는 설명/세부 합의 단계다. 문서만 변경, 구현/시험/빌드/패키징 없음.

## 최신 H0 정리 — 기술 제안·현재 TOML/진단 확인·미결 사항 (2026-10-08)

[H0 결정 기록](h0-product-decisions.md)에 사용자 확정 사항과 기술/엔진 제안을 구분했다. TOML은 생성 템플릿/읽기·glob 검색이 현재 기능이며 분류 기반 자동 관리·새 TB 등록은 미구현이다. RTL 분석 예외를 TOML 첫 줄에 게시하는 catch 경로를 코드에서 확인했으며 사용자 오류 원인 확정이나 수정 완료는 아니다. 다음은 가져오기/실행/파형 화면 흐름과 자동 설정/수동 override 정책 논의다. 엔진 시점·방식은 권장 순서만 있고 별도 합의 전 착수하지 않는다. 문서만 변경/코드 읽기 확인, 새 테스트·빌드·패키징 없음.

## 최신 H0 사용자 합의 (2026-10-08)

[제품 결정 기록](h0-product-decisions.md)에 Code/Simulation 두 공간·상태 보존·공통 하단 패널·Simulation 홈/파형과 Diagram 첫 앱 제외를 정리했다. 사용자는 미저장 입력 사본 실행(원본 자동 저장 없음), 최초 가져오기 분류 확인, 종료 선택 시 하위 실행 정리를 승인하고 외부 extension 지원 제외를 명시했다. 다음은 가져오기→편집→실행→파형→재실행 화면 및 설정/이력 정책 설계다. 현재 구현하지 않고 함께 구체화한다. 문서만 변경; 새 시험/빌드/패키징/설치/앱·엔진 착수 없음. E4 지원 범위 완료와 열린 Windows gate는 유지한다.

## 최신 이정표 — E4 지원 범위 내 완료·H0 논의 준비 (2026-10-08)

recorded native run-kH0Z78 실제 source 왕복 focus/Tab·clock35→45ns PASS/receipt/exit0. 누적 E4 기준을 [종합 수용표](e4-acceptance-summary.md)로 대조해 read-only 지원 부분집합·현재 Windows 개발 환경에서 완료 판정했다. 전체227 PASS/타입·개발 build 근거 유지, 이번 제품 코드 변경·전체 재실행 없음. generate/array 내부 연산·연속 hierarchy zoom/live 디버깅·전체 접근성/여러기기 성능은 후속 범위, 깨끗한 Windows 설치 gate는 계속 열려 있다. 다음은 [H0 준비 자료](h0-discussion-brief.md)로 사용자와 독립 IDE 아이디어/범위를 합의하는 것이다. 독립 앱·엔진 구현/Code-OSS fork·패키징/설치는 시작하지 않았다. 아래 과거 E4 진행/다음 검증 기록보다 이 판정을 우선한다.

## 최신 E4 — 선택기·소스 왕복 실제 수용과 포커스 복구 (2026-10-08)

run-U8ruBs에서100% offscreen Tab→pe00/Enter, Display Down/Enter Connections·Detailed, keyboard definition→source→diagram을 실제 확인하고 focus 유실을 발견했다. context별32개 control identity를 보관하는 독립 webview helper로 보완, run-hjw5s7 source 왕복 후 Open definition focus→Tab Display 복구 PASS/receipt/exit0. private 미저장 편집의 stale 안내/graph 유지/source·selector 비활성화 및 Undo clean 확인. 관련18/전체227 PASS/0 FAIL/0 SKIP·타입/개발 build 성공. [방법·발견·근거·제한](structure-keyboard-roundtrip-acceptance.md). 다음은 누적 E4 완료 기준/검증표 종합·recorded focus 회귀 확인 후 완료 범위 판정이다. 임의 scroll 복원/전체 screen reader 수용은 하지 않았고 E4 완료·독립 IDE 착수·패키징/설치 없음.

## 최신 E4 — 화면 밖 모듈 포커스 보완·카메라 반복 측정 (2026-10-08)

keyboard focusin으로 화면 밖 module을 보이게 pan하고 확대 비율을 유지하도록 보완했다. disabled/큰 module/이미 보이는 bounds 단위6 PASS. 실제4×4 browser-only host run-4Bm8OR에서 offscreen 마지막 MAC focus/100% 유지·viewport 안 bounds·SVG keyboard PASS/receipt/exit0. camera3구간×3회×120frames에서 median16.7/p95 16.8ms, handler p95 0.8~1.1ms/layout p95 3.2~3.4ms, 50ms 초과0. 이전 부하와 차이가 있어 개선 원인/FPS 보장으로 표현하지 않는다. 전체225 PASS/0 FAIL/0 SKIP·타입/개발 build 성공. [방법·근거·한계](structure-focus-performance-acceptance.md). 다음은 selector/source 왕복·stale와 offscreen 실제 Tab 수용이다. E4 전체 완료·독립 IDE/엔진 착수·패키징/설치 없음.

## 최신 E4 — browser 프레임·canvas/Hierarchy 키보드 수용 (2026-10-08)

실제4×4 host run-fx3XHC에서 Fit→Tab canvas→Tab pe00→Enter 내부 진입 및 Hierarchy Down→Enter pe01 이동 확인, native receipt/PASS/exit0. 별도 실제 Chromium product HTML probe의 SVG focus·Enter/Space·camera zoom/Fit assert PASS.2170 SVG elements/120frame idle median16.7/p95 16.8ms, 합성 camera+강제 layout median33.4/p95 50.1ms(50ms 초과18회). RAF opportunity·부하 시험이며 실제 pointer/pixel FPS 게이트 완료가 아니다. [방법·로그·한계](structure-browser-keyboard-acceptance.md). 타입/개발 build 성공; 제품 수정 없이 시험 확장. 다음은 selector/source 왕복·stale/화면 밖 focus 키보드, camera 비용 분해·반복 측정. E4 완료·패키징/설치·독립 IDE 착수 없음.

## 최신 E4 — 분석 닫기·프로세스 트리 정리와 실제 Cancel (2026-10-08)

native run-NwNO9r에서 hierarchy/scopeOperations/internalOperations 분석 중 tab API 닫기 → Python 부모/자식 종료(466/429/460ms)·늦은 panel 재열기 차단·실제 slang 재시도 PASS/receipt/exit0. 별도 run-LO9ODL은 실제 progress Cancel 클릭 → cancelled 안내/프로세스 종료 → 실제 Schematic 복구 PASS/receipt/exit0. physical 관찰용 timeout만300초로 연장한 시험이며 제품15초 측정이 아니다. [방법·초기 실패·근거·한계](structure-analysis-cancel-acceptance.md). 관련19 PASS/타입 검사·개발 build 성공; 제품 코드 변경 없이 harness/runner 확장, 전체224는 직전 결과 유지. 다음은 전체 keyboard/focus(계층·SVG·선택기·source 왕복), diagram browser frame/layout 성능이다. E4 완료·독립 IDE/엔진 착수·패키징/설치 없음.

## 최신 E4 — 실제 progress Cancel·키보드 부분 수용 (2026-10-08)

격리 host run-QfsfM5에서 화면 Cancel 클릭 → 보류 요청 전 caller 종료/35ns 유지 → 늦은 native page 차단 → 실제 retry45ns PASS/고유 receipt/exit0. 시간 입력 Tab→Go, Shift+Tab 복귀, 35ns 입력+Enter→Values35ns를 실제 화면 확인했다. 관찰 도구 지연으로 physical 시험에서만 deadline을300초로 연장했으며 elapsed24563ms는 클릭 latency/제품15초 timeout 결과가 아니다. 초기 실패3건과 방법·한계는 [수용 기록](structure-physical-cancel-acceptance.md)에 남겼다. 제품 소스 수정 없음, 타입 검사/개발 build 성공. 전체224 회귀는 직전 제품 변경 결과를 유지하며 이번 재실행 없음. 다음은 semantic/module 분석 취소·닫기/복구, 전체 keyboard/focus와 diagram browser frame/layout 성능이다. E4 완료·독립 IDE 착수·패키징/설치 없음.

## 최신 E4 — 클럭 취소·timeout·복구와 reader 회수 (2026-10-08)

worker page 대기 중에도 clock cancel/닫기/15초 timer가 caller를 종료하도록 abort race와 listener cleanup을 보완했다. 실제 native worker dispatch hold host run-MI2irN은 cancel31ms/close101ms/timeout15038ms·늦은 cursor publication 차단·실제 worker retry·닫기/Update 복구 PASS/receipt/exit0.4096신호 lifecycle8회 worker16/16종료·원본hash/peer유지·provisional RSS plateau PASS. 관련13/전체224 PASS·타입/개발 build exit0. [방법·근거·한계](structure-cancel-recovery-acceptance.md). 다음은 physical progress Cancel/analysis 닫기·취소, 실제 keyboard tab-order/focus와 diagram browser frame/layout 성능이다. 인위적 dispatch hold/프로그램 cancel·reader memory 측정이며 physical Cancel/전체키보드/browser성능 수용과 E4 완료를 주장하지 않는다. 패키징/설치·사용자 소스 수정 없음.

## 최신 E4B — 기록 디버깅 왕복·닫기/재연결 (2026-10-08)

Windows 파형 command가 D:/d: 경로 차이로 열린 reader를 못 찾는 오류를 실제 host에서 발견하고 OS별 경로 비교를 보완했다. 최종 native run-aEBmL5는 Schematic3종/117값/양방향 cursor·wave 닫기/재열기·diagram 닫기/Update 재연결·clock 앞뒤 수용 PASS/receipt/exit0. 실제 UI run-9osJbW는35→45→35ns edge, linked wave35ns, 파형 Go45ns+Enter→diagram45ns, 기록 definition 열기를 확인했다. 전체224 PASS/0 FAIL/0 SKIP·타입/개발 build exit0. [실패·수정·근거·제한](recorded-debug-roundtrip-acceptance.md). 다음은 긴 작업 취소/timeout/닫기·복구, keyboard tab-order/focus, browser/frame/memory 성능·규모다. E4 전체 완료나 이번 취소/성능 시험을 주장하지 않는다. retained run을 재사용했고 새 simulation/패키징/설치·사용자 소스 수정 없음.

## 최신 수용 — 실제4×4 화면 조작·소스 왕복 (2026-10-08)

격리 실제 host run-inrwoa에서16MAC/26boundary ports·배선 completeness를 확인하고 Fit21%/100%/pan·scroll21→31%·pe00 double-click/leaf ×·MUX·Register·clock/state 배선·keyboard0 Fit40%·hierarchy 부모 복귀·Open definition→소스 line1→diagram 탭 camera31% 보존→Fit을 물리 확인했다. receipt passed=true/로그 PASS/host exit0·타입/개발 build exit0. [근거·fixture 옵션·제한](schematic-4x4-ui-acceptance.md). Fit 라벨이 작음·공통 제어선/상수 변환 밀집·source 왕복 page scroll 초기화는 남은 UX 제한이다. 아키텍처4×4 자동 배치/실제 frame 성능·전체E4 완료를 주장하지 않는다. 다음은 기록 simulation의 source/diagram/wave/clock 왕복·값/keyboard/focus·취소/닫기/복구/성능(E4B)이며 가독성 개선 후보를 기록했다. 이번 제품 수정 없이 physical harness만 확장했고 패키징/설치 없음.

## 최신 재개 — 구조 시험 복구·4×4 graph 검증 (2026-10-08)

사용자 재개 요청으로 작업을 이어갔다. closed-editor 실패를 단독 host에서 재현하고 시험의 오래된 TextEditor 참조를 현재 editor로 재획득하도록 보완했다. 미저장 문서 보존·structure refresh/parent fallback 및 최신 편집/semantic/포트/색상과 통합 native host run-cgbxeo receipt/exit0를 확인했다. 전체 최상위 회귀224 PASS/0 FAIL/0 SKIP·타입/개발 build exit0. 별도 실제 slang4×4 시험은16MAC·142nodes/100edges·26boundary ports·누락 배선0, 분석약1.25s/SVG약76ms PASS. [재현·보완·검증 근거·제한](schematic-scale-acceptance.md). 다음은 실제4×4 화면 가독성/pan/zoom/Fit/leaf 진입, 이어 E4B 왕복/keyboard/focus/취소·복구·성능이다. 실제 browser 성능/물리 화면 수용과 E4 전체 완료를 주장하지 않는다. 패키징/설치·사용자 소스 수정 없음. 아래 과거 중단 기록은 이 사용자 재개 요청으로 해제되었다.

## 현재 작업 중단·재개 기준 (2026-10-08)

사용자 요청으로 진행사항을 기록하고 다음 요청까지 작업을 멈춘다. 최신 편집 개선은 관련 시험/실제 host 수용까지 완료했으며 E4 diagram/기록 디버깅은 미완료다. 재개 첫 작업은 closed-editor 구조 시험 오류 재현/보완, 이후 4×4/조밀한 구조·source/diagram/wave/clock 왕복·취소/복구/성능 검증이다. [완료 항목·검증 근거·제한·다음 실행 순서](checkpoint-2026-10-08.md)를 이어받기 기준으로 사용한다. 새 패키징/설치 및 독립 IDE/엔진 착수 없음.

## 최신 사용자 요구 확인 — 설정·파형 자동화와 Simulation 단일 UX (2026-10-08)

TOML은 IDE가 관리하고 필요한 조정만 사람이 한다는 원칙을 재확인했다. 현재 코드에서 glob/예제/최소 설정 생성은 자동이나 test name/top/sources 등록은 명시적이며 U12 GUI 등록/자동 후보 발견은 미구현이다. 현재 Verilator --binary/trace flags는 TB dump 코드가 필요하다. 원본 소스 수정 없이 adapter 소유 tracing 보조 코드/runner, 기존 수동 dump와의 정책·top 기반 이름·recorded hierarchy/trace identity 보존과 GUI/CLI 일치 검증을 후속 방향으로 기록했다. Simulation은 제품 전용 UI, Testing은 공통 API UI이며 최종 제품 기본 진입점 통합은 H0에서 정한다. [현재 상태와 후속 방향](simulation-setup-ux-direction.md). 이번은 코드 확인/요구 기록뿐이고 신규 구현/시험 없음. block diagram/기록 디버깅 E4 마무리 실행 순서를 유지하며 독립 IDE/자체 엔진을 조기 착수하지 않는다.

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

## 최신 작업 — E4A 실제 graph 가독성·기본 규모 검사 (2026-10-07)

MAC24node graph의 실제 +/pan, 추가100% 버튼→첫 신호 가독성→Fit44% 복귀를 격리 개발 창에서 확인했다. 실제 확인 중 중앙 wire-only 확대를 발견해100%는 graph 시작20/20으로 보완했다. native98/146node 분석·SVG 생성과256node 초과의 partial-free 거부1 PASS, 최종전체200 PASS/타입·개발 build/실제 host run-FyR9NC receipt·exit0. 초기40ms 취소 시험 timedOut 실패와 단독 재실행 통과를 보존하며 해결됐다고 하지 않는다. [측정·실제범위·초기실패·남은작업](visual-debugging-e4a.md). **E4 진행 중, 다음 E4B**는 모듈/source/wave/clock 실제 왕복·접근성·browser 비용·취소/복구 수용이다. H0 진입 전 E4 완료 판단이 필요하다.0.3.1 배포물 SHA 유지·새 패키징/설치 없음. 아래 기록은 이전 시점 근거다.

## 최신 작업 — E3 pipeline MAC 예제/reference 종단 검증 (2026-10-07)

별도 examples/pipeline-mac에 signed4/signed8 parameter 변형과 unsigned4,13cycle reset/hold/latency/overflow·잘림 예제를 추가했다. SV longint assertion과 독립 BigInt/reference 표, retained graph/trace의117기대값·edge 전/최종값을 대조했다. 잘못된 same-cycle product 누적은 cycle2 runtime assertion FAIL을 확인했다. 전체199 PASS/native integration1 PASS/타입·개발 build, 실제 host run-qMDhox 세 graph·117값·clock/wave cursor·readonly source/receipt/exit0 통과. [근거·사용·초기 시험 오류·제한](pipeline-mac-acceptance.md). 다음은 **E4 실제 시각화 UX·성능·복구 수용**이다. 물리 조작/가독성·대표 규모 및 열린 Windows/사용자설계 게이트는 유지한다. 기존 counter/0.3.1 배포물 SHA 유지·새 패키징/설치 없음. 아래 기록은 이전 시점의 근거다.

## 최신 작업 — D4 선택 클럭 에지 기록 탐색 (2026-10-07)

명시적 one-bit clock 선택·Rising/Falling·Previous/Next 버튼을 보존 포트/내부 연산 화면에 추가했다. strict 0→1/1→0만 탐색하고 X/Z·초기값·현재 tick을 제외한다. 최대4096기록/query와 continuation·Cancel/15초 제한·page/job/reader/revision 경계를 사용하며 공유 cursor/최종 기록값을 유지한다. 전체198 PASS/타입·개발 build, 실제 host run-5Xkabh MAC 값·첫/끝·상승/하강·복구 뒤 파형 cursor 및 receipt/exit0 확인. no-edge 알림 dismiss 대기를 수정했다. [근거·지원 범위·초기 실패](clock-edge-acceptance.md). 다음은 **E3 pipeline MAC 종단 예제/reference 검증**이다. 물리 graph/clock UI와 대표 규모 수용은 E4, Windows/사용자설계 등 열린 게이트는 유지한다. 0.3.1 배포물 SHA 유지·재패키징/설치 없음. 아래 기록은 이전 시점의 근거다.

## 최신 작업 — E2 기록된 내부 신호 관측값 (2026-10-07)

검증된 retained graph의 compiler 선언 이름과 segmented instance path를 같은 run의 VCD에 연결했다. named signal만 조회하고 operator/next-state 값은 추정하지 않는다. missing/ambiguous/width/unsupported·X/Z·무효화, 기존 page/job/revision·reader 경계와 공유 커서를 유지한다. 최종전체191 PASS/native semantic20 PASS/타입·개발 build, 실제 host run-H5FiNt에서 8/16bit MAC raw 값·양방향 커서·닫기/재열기·현재 소스 격리·trace 손상/복구·시뮬레이션PASS/receipt 및 exit0 확인. [구현·근거·제한](internal-operations-e2.md). 물리 graph 조작/가독성·대표 규모 수용과 E3 전체MAC 예제는 남아 있다. 다음 구현은 **D4 선택 clock/edge 기록 탐색**이며 live simulator step이 아니다. 0.3.1 배포물 SHA 유지, 재패키징/설치 없음. 아래 이전 작업/검증 기록은 당시 근거로 보존한다.

## 최신 작업 — E1 정적 내부 연산 그래프 첫 범위 (2026-10-07)

편집기 독립 graph 계약·slang AST allowlist/변환과 기존 구조 창 Internal operations/Port connections 전환·소스 이동·canvas 재사용을 구현했다. next-state/register feedback/hold·계산 폭/부호·형 변환을 구분하고 unsupported/multiple-writer/cycle·한도를 검사한다. current overlay와 검증된 recorded 입력/readonly 소스, stale/nonce/취소·late result 경계를 유지한다. 최종전체186 PASS/native semantic20 PASS/타입·개발 build, 실제 개발 host run-U5Hfge receipt passed=true/시뮬레이션PASS/current·recorded graph·source·무효화/host exit0 확인. [구현·초기 실패·검증·제한](internal-operations-e1.md), [업데이트한 로드맵](pre-ide-roadmap.md). 물리 클릭/화면 가독성·대표 graph 규모 수용은 E4에 유지, 내부 관측값과 clock replay 미구현. 다음은 E2 보존 graph named signal의 segmented trace 매핑이다. 원래0.3.1 VSIX/ZIP SHA 유지·재배포/설치 없음.

## 최신 작업 — E0 내부 연산 추출 가능성 검증 (2026-10-07)

개발용 pyslang probe와 counter/adder·두 parameter 폭의 signed MAC/unsupported fixture를 추가했다. net initializer와 variable startup 구분, 연산/형변환 폭·부호·source, always_ff clock/edge·reset/enable·NBA 추출을 확인했다. 실제 Verilator 내부 product/stage/acc의 segmented trace identity·폭·raw 값 대조 native2 PASS, 최종 전체184 PASS/타입 검사·개발 build exit0. 초기 display path 시험 실패와 병행 부하의 기존 취소 시험 실패를 보존하며 timing 민감성은 해결했다고 하지 않는다. [결과·계약·제한](internal-operations-e0.md), [업데이트한 로드맵](pre-ide-roadmap.md). E0 실험 완료이며 graph 제품 화면/내부값 연결은 미구현. 다음은 E1 allowlist/모델 변환·counter/adder 정적 화면이다. VSIX0.3.1·사용자 예제는 유지하고 재배포/설치는 하지 않았다.

## 최신 실행 계획 — 독립 IDE 전환 전 로드맵 (2026-10-07)

사용자 합의: VSIX 0.3.1은 스터디 피드백용으로 유지하고 새 개발은 **E0 지원 범위/semantic 추출 확인 → E1 정적 내부 그래프 → E2 기록된 내부 신호값 → D4 선택 clock/edge 기록 탐색 → E3 pipeline MAC 검증 → E4 UX·복구 수용 → H0 사용자와 독립 IDE 아이디어 논의** 순서다. [작업별 산출물·지원 범위·완료 기준·검증 표](pre-ide-roadmap.md)가 상세 실행 기준이다. 독립 IDE H와 자체 compiler/simulator I는 착수 시점에 사용자와 아이디어를 발전시키고 별도 계획을 합의한 뒤 구현한다. 지금 Code-OSS fork/엔진 방식이나 화면 사양을 확정하지 않는다. 베타 중단·정확성 결함은 병행 수정하고 열린 검증 게이트를 보존한다. 이번에는 문서만 정리했으며 신규 기능 구현·시험·VSIX 재생성은 하지 않았다. 아래 과거 다음 작업 문구보다 이 계획을 우선한다.

## 최신 실행 지점 — F1X 스터디 비공개 베타 (2026-10-06)

사용자 승인으로 0.3.1 VSIX/CLI/새 예제/안내 ZIP 배포를 준비했다. 정식 stable·독립 앱이 아니다. 전체184 PASS(초기 오래된 DOM 참조2 FAIL 수정)/타입 검사·build, 실제 VSIX 격리 설치 및 설치 폴더 native 편집/semantic/두 PASS/내장 파형·보존 구조 ready/host exit0, 배포 CLI check·두 PASS·hierarchy exit0와 GUI/CLI 결과 일치를 확인했다. 언어 빠른 재시작의 pending changes TypeError가 발견돼 알려진 제한으로 남긴다. 깨끗한Windows/대표사용설계·장시간/프로필·일부 실제입력 게이트는 유지한다. 다음은 스터디 설치·실사용 피드백 수집 → 언어 재시작 경쟁 및 중단 오류 우선 수정 → 0.3.x 회귀 검증이며, 후속 U12/독립 앱은 기존 순서를 따른다. [수용·발견 문제·재현](private-beta-acceptance.md), [설치 안내](private-beta-guide.md). 이전 VSIX 금지/미배포 기록은 당시 상태이며 이번 명시적 배포 요청이 우선한다.

# 제품 전체 로드맵과 현재 상태

F1W 실제 progress Cancel 버튼 검증 통과(run-odiLDS): 테스트 전용20초 load dispatch 지연에서 native 클릭으로 target reader 종료·document 제거, 기존 peer 값 유지, 정상 재열기/값 복구·3/3worker exit/SHA/host exit0 확인. 관련4 PASS/타입 검사·개발 build 통과. [실제 조작·제한 조건](waveform-physical-cancel-acceptance.md). 제품 코드 변경 없음. 일반 parse 중 물리 취소 latency/전체 안정화 수용은 아니며 실제 입력/Escape·프로필 잔여 및 대표 설계·장시간/깨끗한Windows 게이트를 유지한다.

F1V 합성 중간 규모 취소·메모리 회복 검증: 4096신호 두 reader의 native loading중 닫기/peer 보존/4cycle/worker9개 종료/SHA 검증 통과. 최종15초 자연 idle 두 실행에서 RSS baseline221–222MiB→191–193MiB 회복을 재현했다. 초기3초 미회복도 보존한다. 독립8cycle16reader exit, 256RTL파일 분석·실행중 취소/재시도1 PASS, 관련23 PASS/타입 검사·개발 build 통과. [근거·측정조건·제한](waveform-memory-recovery-acceptance.md). 제품변경 없음. 다음 물리 Cancel 조작·취소 복구와 잔여 입력/프로필 수용, 실제 설계 경로 제공 시 대표 프로젝트 검증. 전체 규모·메모리 수용/깨끗한Windows 완료는 아니다.

F1U 기본 사용자 편집 설정과 설치된 Verilog HDL 1.29.0을 격리 복제해 editor/semantic native 검사 통과(run-22Vp8d), 실제 module/package/begin Tab 및 begin Enter의 내용·커서 검증 통과(run-MmeiXH), 두 host exit0. 11 lexical PASS/semantic unit7 SKIP/타입 검사·개발 build 통과, 원본 설정 SHA 유지. 외부 linter는 PATH의 실행 파일 미발견으로 동작하지 않았으므로 정상 외부 diagnostics 충돌은 미검증이다. [근거·범위·재현](editor-profile-acceptance.md). 다음 대표 규모·loading 취소·두 reader 메모리 복구, 편집 프로필 잔여는 별도로 유지한다.

F1T 보존 결과·구조·파형 경계 재검증: 관련 32 PASS/타입 검사·개발 build 통과. 실제 VS Code run-Mpz1Al에서 package/include를 포함한 두 시뮬레이션, 보존 소스/구조/값·양방향 커서·닫기/재열기·손상 차단/복구 통과, host exit0. 별도 generate/array/escaped·한글/공백 경로 Core/worker 실제 검사 1 PASS. 제품 변경 없이 late values 무효화 회귀를 추가했다. [근거·초기 대기·지원 범위](recorded-boundary-acceptance.md). 다음 실제 사용자 편집 프로필 충돌→대표 설계·loading 취소·두 reader 메모리 복구. 전체 안정화/배포 완료는 아니며 깨끗한 Windows 보류는 유지한다.

최신F1S(2026-10-06): 기본cursor 재사용 실제drag/zoom/pan/하단scroll·Reload/전체값 확인. 다음retained 구조·파형 연동경계→실제프로필→대표규모·메모리복구의열린3묶음으로돌아간다. [이번근거·한계](waveform-cursor-physical-acceptance.md). viewport변경지연/물리Esc/DPI/깨끗한Windows 보류유지.

최신F1R(2026-10-06): cursor-only 재사용 기본적용 및혼합경계 검증완료(42 PASS/native8exit). 다음 실제 연속cursor/zoom·pan UI반응성 확인, 대표설계·실제프로필·retained/RSS/깨끗한Windows 게이트유지. [근거·제한](waveform-cursor-reuse-acceptance.md). 아래F1Q 검증전용 문구는 이전상태다.

최신 F1Q(2026-10-06): cursor-only 검증후보 구현/A-B 통과(41 PASS/3native각각8exit). 다음viewport·resize/reorder 혼합/real·wide·zero/error 경계검증 후기본채택판단. 일반사용은기존full query. [구현·측정·남은게이트](waveform-cursor-reuse-candidate.md). 아래F1P 후보탐색순서는과거기록이다.

최신 F1P(2026-10-06): 밀집파형 조회·전달 비용계측/40 PASS/두native 각각8exit 및복구확인. 다음은 같은viewport cursor-only 제한재사용 후보 비교다. 제품캐시/압축은아직채택하지않았다. [근거·후보조건·남은게이트](waveform-transport-profile.md). 아래 이전 체크포인트의 다음순서를 대체한다.

# 최신 실행 체크포인트 — F1O (2026-10-06)

장시간 진단 누락 보완을 실제 host에서 확인했고, 제한된 실제 waveform shortcut/overflow/창크기·앱zoom 정렬 검증을 마쳤다. 관련39 PASS/타입검사·개발build/native exit0. [범위와 다음 작업](waveform-native-layout-acceptance.md). 다음은 dense query/전달 비용 계측이다. OS DPI/물리Escape/대표설계/실제프로필/보존경계/RSS/깨끗한OS 게이트는 남아 있으며 전체안정화·배포완료로 표시하지 않는다.

기준일: 2026-10-07. **현재 범위·구현 상태·다음 실행 순서의 기준 문서**다. 과거 체크포인트의 다음 작업 순서보다 이 문서가 우선한다. 구현과 검증은 별도 판단한다. 지원 부분집합의 구현을 전체 기능 완료로 표시하지 않는다.

## 제품 목표와 기록 방식

2026-10-06 사용자선호(F1M): 시간눈금은절대시각이기본이다. 긴소수표시만정수부/나머지두줄로분리하고viewport-relative값을기본으로쓰지않는다. 커서정렬은sharedscroll/gutter로해결하며표시기준변경과분리한다. 관련6 PASS/타입 검사·빌드 exit0, F1L native잔여검증순서유지. [표시계약](waveform-absolute-time.md).

최종 제품은 독립 VS Code/Code-OSS 기반 RTL 설계·시뮬레이션 IDE다. 확장은 초기 호스트다. source-first 프로젝트, 편집기 독립 Core/semantic, simulator/waveform 교체 경계, 사용자 승인 설치를 유지한다. 자체 엔진과 Code-OSS fork는 후속 단계이며 지금 착수하지 않는다. 사용자 배포 지시 전에는 개발 빌드·검증만 하고 VSIX를 만들거나 설치하지 않는다.

- 이 문서: 기능별 현재 상태와 실행 순서. 요청을 받으면 기존 항목과 대조하고 새 요구에 ID를 붙인다.
- [PROGRESS](../PROGRESS.md): 가장 최근 작업·검증·다음 작업의 짧은 체크포인트. [이전 진행 이력](../PROGRESS-history.md)은 보존한다.
- [handoff](handoff.md): 다른 모델의 재시작 절차·실행 방법·주의점. 아래 과거 체크포인트는 당시 기록이다.
- [delivery-plan](delivery-plan.md): A–I 세부 작업과 진입 기준. [architecture](architecture.md): 공통 계약과 경계.
- [product-audit](product-audit.md), [원래 25개 아이디어](original-product-ideas.md): 요구 출처와 상세 감사. [verification](verification.md), 각 acceptance 문서: 날짜별 실제 증거·미검증.
- packages/vscode/docs의 문서는 기존 배포용 사본이고 현재 개발 상태의 기준이 아니다. handoff-gpt6-sol은 과거 인수인계 시나리오다.

작업마다 해당 ID의 구현/제한/검증 상태, PROGRESS, handoff의 다음 작업을 갱신한다. 통과한 시험의 날짜·명령·개수를 기록하고 실제 GUI/대표 설계 수용을 자동 시험으로 대체하지 않는다. 완료하지 않은 요구와 보류 사유를 지우지 않는다.

## 원래 6단계에서의 위치

| 단계 | 현재 위치 | 남은 제품 완료 조건 |
|---|---|---|
| 1 실행 MVP | 프로젝트·설치·Verilator·테스트·CLI·파형 경로 구현 | 깨끗한 Windows 승인 설치→실행→파형 종단 수용은 별도 환경 부재로 보류 |
| 2 편집 지원 | 2A lexical, 2B module/port, 2C package/scope 구현 부분집합 | 실제 사용자 프로필 충돌, 일부 의미 모델·정확성 경계 검증 |
| 3 프로젝트·검증 확장 | semantic package 자동 정렬·태그·실행 이력·입력 보존·1–4 jobs 구현 | 대표 프로젝트 규모와 취소·복구 수용; 정밀 최소 source graph 등 후속 |
| 4 구조 탐색 | elaborated hierarchy·읽기 전용 연결도·canvas pan/zoom/Fit·보존 포트 값/커서 연동 | 노드 자유 배치, 클럭 재생, 지원된 내부 연산 그래프 |
| 5 제품 확장 | 내장 VCD·저장 보기·눈금·정렬·버스 비트·보존 enum 표시 부분집합 구현 | enum array/struct 확장, 내부 FST, 다른 OS/backend, 안정화와 제품 UX |
| 6 구조 작성·독립 앱 | 계약/방향 문서화 | structural RTL 생성과 독립 IDE 구현; 자체 compiler/simulator는 별도 장기 트랙 |

단계 1–5의 일부를 함께 진행한 상태다. 단계 5 전체 완료나 초기 안정판 수용 완료로 간주하지 않는다.

## 초기 25개 요구의 추적표

ID는 original-product-ideas의 항목 번호다. 상세 근거는 product-audit와 acceptance 문서를 함께 읽는다.

| ID | 요구 | 현재 구현·남은 범위 |
|---|---|---|
| O01 | module 정보/서명·인수 안내 | module/parameter/port 및 일반 function/task 서명·hover/이동 구현; class/object/system call 전체 지원 아님 |
| O02 | . 미연결 포트 추천·연결 추천 | 사용 포트 제외·implicit 연결 필터 보완, 폭/타입/이름 순위 구현; 완전한 assignability 보장 아님 |
| O03 | package/import 추천 | compiler scope 기반 부분집합 구현; class/object 중첩 등 제외 |
| O04 | 현재 scope 변수 추천 | 선언 순서·shadowing·import 포함 prefix 구현; fuzzy/타입 위치 필터 미구현 |
| O05 | begin Tab/Enter와 closer 존중 | 구현·격리 실제 편집 수용; 사용자 프로필 충돌 검증 남음 |
| O06 | module/package/case 등 템플릿 | lexical snippet 구현; class 템플릿은 class semantic 지원 의미 아님 |
| O07 | 여러 TB 실행 | 현재/선택/전체와 Testing API, 전용 Simulation 화면 U02 구현; 새 toolbar 물리 조합 수용은 별도 |
| O08 | 결과·로그·시간·재실행 | 취소/시간 초과 포함 구현; 대규모 이력 관리 후속 |
| O09 | 여러 simulator 교체 | SimulatorBackend 계약+Verilator 구현; 다른 backend 미구현 |
| O10 | 공통 실행 설정 | timing/assertion/VCD/FST/off 구현; coverage 지원 없음 |
| O11 | source/include/package 관리 | glob·중복 제거·안정 순서·semantic package 자동 정렬/manifest 모드 구현; top 최소 source graph 미구현 |
| O12 | 가벼운 폴더 프로젝트 | rtl.toml 구현; top은 테스트별 지정 |
| O13 | 생성물과 도구 분리 | .rtl/와 프로젝트 밖 공유 도구 구현; 임의 RTL 파일 출력 자체를 sandbox하지 않음 |
| O14 | 승인 기반 Windows 도구 설치 | 발견·공식 설치·실제 smoke 경로 구현; 깨끗한 Windows GUI 수용 보류, update/rollback 후속 |
| O15 | 여러 OS | Windows x64/UCRT64 우선; Linux/macOS 제품 수용 미완료 |
| O16 | toolchain과 프로젝트 분리 | 구현; U02에서 설정을 toolbar overflow/빈 화면 안내로 분리 |
| O17 | semantic과 simulator 분리 | slang/LSP와 Verilator 분리 구현 |
| O18 | 편집기 독립성과 자체 IDE | 공통 계층 구현; 독립 앱 H 미구현 |
| O19 | GUI/CLI 공통 실행 | Core 공유 구현; 저장 파형 보기 등 UI 기능이 CLI와 모두 동일한 것은 아님 |
| O20 | hierarchy 탐색 | elaborated instance/parameter/generate/array/source 구현; 대표 실제 대규모 수용 남음 |
| O21 | module diagram과 내부 탐색 | SVG 연결도·더블클릭 내부·Back/Up·기록 포트 값·U04 pan/zoom/Fit 구현; 노드 배치 변경·내부 연산 E 남음 |
| O22 | 블록 연결로 RTL 생성 | 미구현 G; 읽기 전용 배치 변경과 소스 생성은 별도 |
| O23 | enum case 생성 | 명시적 code action 구현; 누락 case 자동 채움 미구현. 파형 enum 이름 U05는 별도 |
| O24 | end 라벨과 변경 동기화 | 명시적 action/Undo 구현; 자동 이름 동기화 미구현 |
| O25 | 결과→파형 | 내장 VCD·외부 GTKWave VCD/FST 구현; 내장 FST/live 미구현 |

## 최근 요청과 다음 작업

| ID | 요구·상태 | 다음 완료 기준 |
|---|---|---|
| U01 | 단일 커서: 구현·관련 자동/GUI 수용 | A/B·B checkbox·Delta strip 제거; Cursor/Zoom range만 제공, 기존 B 저장값 무시; 공유 커서 자동 회귀. [이번 증거·범위](waveform-cursor-acceptance.md) |
| U02 | Simulation Activity Bar: 구현·관련 수용 | Tests/Run History, Run All/선택 실행·Stop·행 실행/파형/소스, 공통 runner 재사용. 샘플은 빈 화면 안내로 분리. [검증 범위](simulation-panel-acceptance.md) |
| U03 | 테스트별 outdated 표시: 구현·관련 수용 | Simulation 행 경고/Outdated, Checking inputs/Inputs unknown/Unsaved edits 구분, 이전 PASS/FAIL 유지. 관련33+보존 회귀10 PASS·실제 host/native2 PASS. [검증·제한](input-freshness-acceptance.md) |
| U04 | schematic canvas: 1차 구현·관련 수용 | 기존 scope 세로 배치에 pan·포인터 중심 zoom·Fit·scope별 camera 복원. 관련23 PASS·실제 화면/소스 불변 확인. 노드 자유 배치는 후속. [증거·제한](structure-canvas-acceptance.md) |
| U05 | 파형 enum 이름: 1차 구현·관련 수용 | 보존 입력 분석 전/후 검증·정확한 경로/폭 매핑, Auto 이름/숫자 override·X/Z fallback·1bit 이름/자식 bit 숫자. 관련52 PASS·native1 PASS·실제 화면/Reload 시간 보존. array/struct/class·단독 VCD 추정은 제외. [범위·증거](waveform-enum-acceptance.md) |
| U06 | 테스트별 여러 저장 보기·default | 구현; 누락 신호 보존·다른 실행/프로젝트 격리. 관련 acceptance 유지 |
| U07 | 행 X/이동 버튼 제거, 그룹 drag·Ctrl/Shift | 구현; 삭제 Signals로 통일. 실제 Shift 범위+묶음 drag 수용, Ctrl/Shift 마우스 조합은 자동 이벤트 검증 |
| U08 | 좁은 신호 열·큰/작은 시간 눈금 | 구현: 1/2/5 간격과 정밀 시간 계산; timescale은 단위/정밀도이며 눈금 간격과 별개 |
| U09 | bus 개별 bit 펼침 | 구현: 부모 최대32·추가 bit 최대128, 저장/복원. 자식 독립 정렬/스타일/Edge 후속 |
| U10 | syntax 색·RTL 파일 아이콘 | grammar/아이콘 구현; 테마 적용 확인 필요, 전체 semantic coloring은 별도 |
| U11 | Explorer TB 파일 행 hover ▶: 자체 IDE 후속 | 사용자가 지칭한 것은 tb/의 실제 파일 행. 기본 Explorer의 공개 확장 API로 hover 액션 추가 불가; 현재 등록 TB 우클릭/편집기 상단 실행 구현. 임의 tb_ 이름 판별 없이 manifest로 대상을 식별하고 공유 파일은 설정 선택 |
| U12 | 가벼운 프로젝트·TB/소스 자동 탐색: 설계 제안·미구현 | 후보 발견 + 실행 top/설정 기억 + 모호할 때만 범위 선택. 폴더 구조 비강제, 기존 설정 우선, Core/CLI 공유. [방식 비교·단계별 완료 조건](project-discovery-direction.md) |
| P01 | 빠른 반복 빌드·증분 캐시 | 조사/설계만. 현재 실행별 새 build 디렉터리로 cross-run 재사용 없음; 도구/입력/옵션 키·불변 결과 경계 필요 |

이전 실행 순서(2026-10-06, 최신 계획이 우선): U01/U02/U03 및 U04/U05 1차 구현 후 **A3/F 잔여 안정화 수용 중**. F1R cursor-only 최적화를 기본 적용했고 F1S에서 실제 drag/zoom/pan/하단 scroll·Reload와32부모/128bit 값 대조를 확인했다. F1T에서 보존 결과와 구조·파형의 지원 VCD 부분집합 종단/경계를 재검증했다. F1U에서 기본 편집 프로필·활성 Verilog 확장의 제한된 호환성과 네 가지 실제 키 입력을 확인했다. F1V에서 합성 256파일 분석·취소/재시도와 4096신호 두 reader의 종료 및 15초 자연 메모리 회복을 재현했다. F1W에서 지연 dispatch 조건의 실제 Cancel 버튼·peer 보존·재열기 복구를 확인했다. **다음은 잔여 실제 입력/Escape·프로필 수용**이며 실제 설계 경로가 제공되면 대표 프로젝트를 검증한다. 정상 외부 linter/사용자 snippets·추가 프로필 충돌 잔여는 유지한다. viewport를 바꾸는 full-query 지연/RSS/이전900ms 원인과 physical Esc/OS DPI는 미완료다. [F1S 실제 범위](waveform-cursor-physical-acceptance.md), [F1R 기본 적용](waveform-cursor-reuse-acceptance.md). U12 자동 발견은 제안, U11 정확한 Explorer hover는 H 후속이다.

## delivery A–I와 장기 기능

A: 편집 신뢰성 보완 구현, A3 사용자 환경 검증 남음. B: 서명 도움 부분집합 구현. C: 연결 추천/code actions 구현. D1: 구조 탐색, D2: 보존 입력 소스, D3: 관측 포트 값/공유 커서 부분집합 구현. **D4 선택 clock/strict 이전·다음 에지 기록 탐색 구현**이며 실제 simulator pause/step과 다르다. E: E1 제한된 register/control/adder/MAC 정적 그래프와 E2 named 내부 신호 관측 구현, E3 작은 pipeline MAC 종단 예제/reference 검증 완료, E4 UX·규모·복구 수용 남음; 기록되지 않은 값을 관측값으로 추측하지 않는다. F: 규모·취소·복구 안정화 진행 중, 내장 FST indexed reader 후속. G: structural 작성 미구현. H: 독립 IDE 미구현. I: 자체 compiler/simulator 미구현; P01 성능 계측/증분 설계와 별도다.

## 베타 이전 검증 게이트와 출하 판단 — 열린 항목은 유지

기존 3묶음 중 보존 데이터 구조 연동 종단/경계는 F1T에서 지원 VCD/관측 포트 범위를 통과했다([근거와 제한](recorded-boundary-acceptance.md)). 남은 큰 검증은 2묶음이다: (1) F1U 제한 수용 이후 실제 사용자 편집 프로필의 외부 linter/사용자 snippets·추가 설정 잔여, (2) 대표 실제 프로젝트 규모·loading 취소·두 reader 메모리 복구. F1V에서 (2)의 합성 규모 loading중 닫기/worker 종료/15초 자연 RSS 회복을 제한적으로 통과했다. 실제 설계·물리 Cancel/장시간·전체 workbench 메모리는 남는다. F1W 실제 Cancel 버튼/복구는 지연 dispatch 조건에서 통과했으며 무지연 parse중 물리 취소·기록 enum subprocess 취소는 별도 잔여다. 다음 실행은 잔여 실제 입력/Escape·프로필 검증이다. 합성 중간 규모 시험 통과는 실제 수백 RTL 파일/수천 신호 수용 완료가 아니다. 깨끗한 Windows는 별도 PC/VM 부재로 보류 1건이며 재검증할 조건을 유지한다.

날짜가 다른 테스트 수를 합쳐 전체 회귀 완료로 쓰지 않는다. 이번 waveform 34 PASS와 structure-view 7 PASS는 관련 범위이며 과거 전체 138 PASS를 갱신한 전체 회귀가 아니다. 전체 출하 여부는 잔여 게이트와 사용자 실제 사용 피드백 후 판단한다.

관련 설계: [IDE UX](ide-ux-direction.md), [파형 UX](waveform-ux-plan.md), [시각 디버깅](visual-debugging-roadmap.md), [증분 성능](simulation-performance-direction.md), [현재 검증](current-validation.md).
