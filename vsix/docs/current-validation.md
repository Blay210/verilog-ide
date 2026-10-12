## 최신 H0 정리 — 기술 제안·현재 TOML/진단 확인·미결 사항 (2026-10-08)

[H0 결정 기록](h0-product-decisions.md)에 사용자 확정 사항과 기술/엔진 제안을 구분했다. TOML은 생성 템플릿/읽기·glob 검색이 현재 기능이며 분류 기반 자동 관리·새 TB 등록은 미구현이다. RTL 분석 예외를 TOML 첫 줄에 게시하는 catch 경로를 코드에서 확인했으며 사용자 오류 원인 확정이나 수정 완료는 아니다. 다음은 가져오기/실행/파형 화면 흐름과 자동 설정/수동 override 정책 논의다. 엔진 시점·방식은 권장 순서만 있고 별도 합의 전 착수하지 않는다. 문서만 변경/코드 읽기 확인, 새 테스트·빌드·패키징 없음.

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

## 최신 편집 개선 — predefined 이름·전처리 지시어 추천 (2026-10-08)

`initial` 예약어와 `$display`/`$monitor` 등의 기존 시스템 태스크/함수 추천을 유지하고 백틱으로 시작하는 compiler directive 추천을 추가했다. `timescale`, `include`, `define`/`undef`, `ifdef`/`ifndef`/`elsif`/`else`/`endif`, `default_nettype`, `resetall`, `celldefine`/`endcelldefine`, `unconnected_drive`/`nounconnected_drive`, `begin_keywords`/`end_keywords`, `line`을 지원한다(삽입 시 백틱 포함). `$`/백틱 trigger와 전체 prefix 교체로 기호 중복을 방지한다. 지시어 이름은 들여쓴 행 시작에서 제공하며 주석/문자열·매크로 본문/지시어 인자에서 억제한다. 사용자 매크로/모든 표준 predefined 이름의 exhaustive 지원은 이번 범위가 아니다. slang 설치 없이 기본 추천이 동작하며 기존 scope/module/port 추천 경로는 유지한다.

검증: language13 PASS/0 FAIL, 타입 검사·개발 build exit0. native 격리 host `run-XmdKef`에서 `initial`/`$display`/`$monitor`/`timescale` 추천 및 prefix 교체 범위/삽입 문자열, 기존 편집·VCD custom editor 시험 PASS, `.rtl/extension-test.json` passed=true/exit0. 로그 `.dev/predefined-editor-verified.log`. release 패키징/설치 없음. 개발 확장 재실행으로 반영. 전체 회귀를 다시 실행한 것은 아니며 E4 다음 실행 및 기존 closed-editor 시험 점검은 유지한다.

## 최신 편집 개선 — 프로젝트 모듈 추천·범위별 신호 추천·모듈 색상 (2026-10-08)

프로젝트 공통 source/include와 현재 test의 컴파일에 있는 slang definition을 일반 이름 추천에 추가했다. `alu` 같은 미사용/미저장 모듈 이름도 추천하며 선언 이름 충돌은 임의 선택하지 않는다. 기존 slang scope lookup으로 wire/reg/logic·포트·현재 함수/블록과 module 신호, import된 package 멤버 또는 `pkg::` 멤버를 추천한다. 다른 모듈 내부·형제 함수/블록 신호는 섞지 않으며 다른 testbench 컴파일은 기존처럼 격리한다. 연결식에서는 모듈 후보를 제외한다. `.포트`는 기존 우선 경로로 실제 대상 모듈의 아직 연결 안 된 포트를 유지한다.

VS Code 독립 semantic helper가 compiler-confirmed declaration/instance type 위치에만 class 의미 토큰을 생성하고 LSP에서 전달한다. 표준 theme type 색상/언어별 fallback scope를 사용하며 변수의 같은 이름·주석·문자열은 색칠하지 않는다. 색상은 theme와 사용자 semantic highlighting 설정을 따른다. 전체 신호 reference semantic coloring은 이번 범위가 아니다. 분석 도구·manifest source 등록이 필요하며 폴더 모든 파일을 임의 검색하는 방식은 아니다.

검증: geometry 아닌 관련 semantic helper/query10 PASS, 실제 slang completion/분석10 PASS/0 FAIL/0 SKIP, 타입 검사 및 개발 build exit0. native 격리 host `run-QIa4EO`에서 module 추천·wire/reg/logic kind·declaration/instance semantic token·미저장 scope/package·기존 bare dot/implicit 연결 제외·폭 ranking/포트 signature·진단/재시작 수용 PASS, receipt `{passed:true,projectSymbols:true}`/exit0. 로그 `.dev/module-completion-verified.log`, `.dev/project-symbol-native-verified.log`. 최초 제한 환경 native 파일 읽기 오류는 허용 환경에서 재검증했다. 최초 통합 host `.dev/project-symbol-native.log`는 편집/포트 수용은 통과했으나 후속 기존 `testStructure`에서 closed-editor 오류로 exit1; 이 별도 다이어그램 시험 오류는 다음 E4에서 재현/보완할 항목이며 전체 통과로 표현하지 않는다. 이번 변경 후 전체 회귀 재실행 없음. 패키징/설치·사용자 예제 원본 수정 없음. 개발 확장 재실행으로 반영. 다음 실행 순서는 E4 마무리와 위 구조 시험 오류 점검을 유지한다.

## 최신 편집 개선 — begin·always 계열 명시적 자동완성 (2026-10-08)

사용자 요청에 따라 `begin` Tab/제안 수락은 즉시 여러 줄 `begin → 들여쓴 본문 → end`로 펼친다. `always`/`always_ff`는 `@(이벤트)` 첫 입력 후 Tab으로 본문에 이동하고, `always_comb`/`always_latch`는 곧바로 본문으로 이동한다. 모두 begin/end를 포함한다. SV 전용 키워드는 Verilog에서 제외하며 기존 closer 재사용·주석/문자열/매크로 보호를 유지한다. 기존 inline begin 커서 보정 명령은 제거했다. 이 동작은 사용자가 명시적으로 자동완성한 경우에 적용하며 일반 if/for/always 문장 입력에 block을 강제하지 않는다. 이번 사용자 요청이 이전 always 템플릿 미삽입 정책보다 우선한다.

검증: language12 PASS/0 FAIL, 타입 검사·개발 build exit0. 격리 VS Code host `.dev/vscode-tests/run-YpCEsk`에서 begin 직접 확장/제안 수락, always4종 실제 이벤트→본문 Tab/커서/내용, 기존 editor 회귀와 VCD custom editor 시험 PASS; `.rtl/extension-test.json` passed=true 및 host exit0. 로그 `.dev/editor-block-verified.log`. 이번 변경 후 전체221개 회귀를 다시 실행한 것은 아니며 위 관련 검증으로 한정한다. release VSIX 패키징/설치 없음. 개발 확장 재실행으로 반영하며 기존 study VSIX는 이전 코드 그대로다. 다음 작업은 E4 diagram/기록 디버깅 마무리이며 TOML/자동 trace 요구는 `docs/simulation-setup-ux-direction.md` 후속 방향을 따른다.

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

## 최신 실행 지점 — F1X 스터디 비공개 베타 (2026-10-06)

사용자 승인으로 0.3.1 VSIX/CLI/새 예제/안내 ZIP 배포를 준비했다. 정식 stable·독립 앱이 아니다. 전체184 PASS(초기 오래된 DOM 참조2 FAIL 수정)/타입 검사·build, 실제 VSIX 격리 설치 및 설치 폴더 native 편집/semantic/두 PASS/내장 파형·보존 구조 ready/host exit0, 배포 CLI check·두 PASS·hierarchy exit0와 GUI/CLI 결과 일치를 확인했다. 언어 빠른 재시작의 pending changes TypeError가 발견돼 알려진 제한으로 남긴다. 깨끗한Windows/대표사용설계·장시간/프로필·일부 실제입력 게이트는 유지한다. 다음은 스터디 설치·실사용 피드백 수집 → 언어 재시작 경쟁 및 중단 오류 우선 수정 → 0.3.x 회귀 검증이며, 후속 U12/독립 앱은 기존 순서를 따른다. [수용·발견 문제·재현](private-beta-acceptance.md), [설치 안내](private-beta-guide.md). 이전 VSIX 금지/미배포 기록은 당시 상태이며 이번 명시적 배포 요청이 우선한다.

# 현재 구현 재검증과 피드백

F1W 실제 progress Cancel 버튼 검증 통과(run-odiLDS): 테스트 전용20초 load dispatch 지연에서 native 클릭으로 target reader 종료·document 제거, 기존 peer 값 유지, 정상 재열기/값 복구·3/3worker exit/SHA/host exit0 확인. 관련4 PASS/타입 검사·개발 build 통과. [실제 조작·제한 조건](waveform-physical-cancel-acceptance.md). 제품 코드 변경 없음. 일반 parse 중 물리 취소 latency/전체 안정화 수용은 아니며 실제 입력/Escape·프로필 잔여 및 대표 설계·장시간/깨끗한Windows 게이트를 유지한다.

F1V 합성 중간 규모 취소·메모리 회복 검증: 4096신호 두 reader의 native loading중 닫기/peer 보존/4cycle/worker9개 종료/SHA 검증 통과. 최종15초 자연 idle 두 실행에서 RSS baseline221–222MiB→191–193MiB 회복을 재현했다. 초기3초 미회복도 보존한다. 독립8cycle16reader exit, 256RTL파일 분석·실행중 취소/재시도1 PASS, 관련23 PASS/타입 검사·개발 build 통과. [근거·측정조건·제한](waveform-memory-recovery-acceptance.md). 제품변경 없음. 다음 물리 Cancel 조작·취소 복구와 잔여 입력/프로필 수용, 실제 설계 경로 제공 시 대표 프로젝트 검증. 전체 규모·메모리 수용/깨끗한Windows 완료는 아니다.

F1U 기본 사용자 편집 설정과 설치된 Verilog HDL 1.29.0을 격리 복제해 editor/semantic native 검사 통과(run-22Vp8d), 실제 module/package/begin Tab 및 begin Enter의 내용·커서 검증 통과(run-MmeiXH), 두 host exit0. 11 lexical PASS/semantic unit7 SKIP/타입 검사·개발 build 통과, 원본 설정 SHA 유지. 외부 linter는 PATH의 실행 파일 미발견으로 동작하지 않았으므로 정상 외부 diagnostics 충돌은 미검증이다. [근거·범위·재현](editor-profile-acceptance.md). 다음 대표 규모·loading 취소·두 reader 메모리 복구, 편집 프로필 잔여는 별도로 유지한다.

F1T 보존 결과·구조·파형 경계 재검증: 관련 32 PASS/타입 검사·개발 build 통과. 실제 VS Code run-Mpz1Al에서 package/include를 포함한 두 시뮬레이션, 보존 소스/구조/값·양방향 커서·닫기/재열기·손상 차단/복구 통과, host exit0. 별도 generate/array/escaped·한글/공백 경로 Core/worker 실제 검사 1 PASS. 제품 변경 없이 late values 무효화 회귀를 추가했다. [근거·초기 대기·지원 범위](recorded-boundary-acceptance.md). 다음 실제 사용자 편집 프로필 충돌→대표 설계·loading 취소·두 reader 메모리 복구. 전체 안정화/배포 완료는 아니며 깨끗한 Windows 보류는 유지한다.

2026-10-06 F1S: run-xbQA9K 실제drag/zoom/pan/하단scroll·Reload/32부모128bit oracle·equality/SHA/host exit0. 제품변경없음. [관측과가림/입력제한](waveform-cursor-physical-acceptance.md). 다음retained 연동경계 및남은3묶음안정화. viewport조회143.7–168.1ms를성능수용으로쓰지않음.

2026-10-06 F1R: cursor reuse 기본적용/42 PASS/typecheck/build/native run-lGGL2k8exit/값·latest/Reload-close/peer/SHA/host exit0. 혼합viewport late응답·errorfull복구 및real/wide/zero/ordinary무진단 회귀. [범위](waveform-cursor-reuse-acceptance.md). 실제드래그체감/전체성능·대표설계 수용미완료.

2026-10-06 F1Q: 검증전용cursor-only 후보/41 PASS/typecheck/build, 원본1·후보2native 각각8exit/값·X/Z/latest/Reload-close/peer/SHA/host exit0. [정확한범위·초기VM검사실패·다음경계](waveform-cursor-reuse-candidate.md). 기본사용경로미활성/전체성능수용아님.

2026-10-06 F1P: 40 PASS/typecheck/build, run-ZPfvt9/run-qgFuCm 각각8workerexit/값·latest burst/Reload-close/peer/SHA/host exit0. dev/test host duration 및실제payload 비용계측, 제품캐시채택없음. [수치·한계·다음후보](waveform-transport-profile.md). dense 성능/RSS/대표설계 수용은미완료.

2026-10-06 F1O: run-ljPKYm 장시간 cursor32/128값 oracle·overflow/최대화복원/앱zoom 정렬·Ctrl+-범위보존/일반확대pan 확인. 39 PASS/typecheck/build/native exit0/sourceSHA 유지. [범위와 한계](waveform-native-layout-acceptance.md). 다음 dense query/전달 조사이며 전체성능/OS DPI/대표설계 수용 아님.

2026-10-06 F1M: 사용자선호로 절대눈금복원/긴값두줄·sharedscroll정렬유지. 관련6 PASS/타입 검사·빌드 exit0, 원래시각합/단위·carry·겹침및bundled cursor정렬회귀. native재검증미수행. [결정](waveform-absolute-time.md). F1L잔여순서유지.

2026-10-06 F1L: bundled group/Esc/late response/resize·DPR/160→1→160 회귀·modifier shortcut guard 보완. 관련37 PASS/타입 검사·빌드 exit0. native Shift선택group drag 및label앱zoom관찰/SHA/host exit0. 최종container Ctrl+-는사용자입력과겹쳐 미검증, 다음짧은native 회귀대상. [범위](waveform-interaction-regression.md).

2026-10-06 F1K: 사용자제보 cursor/ruler 어긋남의 scrollbar 폭 구조 보완·상대시간눈금·viewport paint/reveal·Reload scroll복원. 관련35 PASS/타입 검사·빌드 exit0, run-T0BtBf32/128값/8exit/latest/peer/SHA/host exit0. run-7uWK3q 물리cursor/ruler클릭/아래reveal/Reload위치/panel폭정렬 및전체값oracle 확인. dense query 수백ms/전체resize·DPI/그룹·Esc/실제설계/RSS 남음. [결과](waveform-viewport-alignment.md).

2026-10-06 F1J:160행 실제 Windows 마우스 scroll/zoom/reorder/cursor/Reload 확인. 32/128전체값 및 Reload cursor/rows/details equality/SHA/host exit0. 최종수동준비코드 run-KuVyAh160행/종료 확인, 관련31 PASS/타입 검사·빌드 exit0. Reload scroll초기화/큰절대시간 라벨/일시 빈plot 발견, dense 수백ms 성능은 미수용. 다음 visible-row 비용·복구 후보. [범위와 남은 검증](waveform-physical-ui.md).

2026-10-06 F1I: query/renderer 비용 분리·경계/좌표 재사용, 최종 관련31 PASS/typecheck/build exit0. run-Qv9vJv20연속 요청 최종값·Reload 로딩 중 닫기/peer/재열기·8exit/SHA/host exit0. dense RTT111.4ms/draw127.1ms/worker20.61ms 관찰, 보장된 성능비율 아님. 물리 scroll/drag·visible-row/전달·RSS 수용은 남음. [계약과 초기 관찰 실패](waveform-dense-recovery.md).

2026-10-06 F1H: 최대160행 기능/Reload equality·peer·4exit/SHA 검증 중 draw1초 문제 발견·layout read/write 및 눈금 공유 보완. 최종 run-a7v4rO draw45.9–188ms, 부모/bit 모든 값·dense/zoom·host exit0, 관련29 PASS/typecheck/build exit0. dense 요청200.2ms/그리기188ms 반응성·물리 입력/RSS는 남음. [증거·다음 비용 분리](waveform-render-stress.md).

2026-10-06 F1G: 명시적dev/test renderer계측·관련28 PASS/typecheck/build exit0. 실제 run-risLLx8editor/32visible sample/24cursor probe·9exit/peer/SHA/host exit0. 기본8신호 querymedian7.75ms/draw4.65ms/init→firstdoubleRAF62.1–97.7ms, phase loop52.36ms. frame기회는 실제pixel표시/물리조작이아님. 다음 최대행·bit/활동viewport UI스트레스; RSS 초기회수/대표설계게이트열림. [정의와근거](waveform-render-profile.md).

2026-10-06 F1F: bounded short-value 공유 적용, 원본/후보24worker3종 digest·SHA 동일. 반복자료31.6% 메모리 감소/중앙값parse+8.1% 절충, 고유/wide 중앙값 증가 없음(편차 존재). 관련26 PASS/typecheck/build exit0. native run-w4sxss4cycle/9exit/peer/SHA/host exit0·loop41.75ms. RSS 초기회수/renderer 수용 미완료. 다음 명시적 renderer/query 구간 계측. [근거](waveform-value-reuse.md).

2026-10-06 F1E: CPU/할당·worker-local live heap 계측. run-SvRWin5worker exit/SHA·전체값digest·X/Z query, post-parse 값공유3회 불변성 통과. retained 증가56.878MiB/진단공유17.937MiB 감소/자료해제 기준선+0.117MiB. native RSS/renderer 수용 근거는 아니다. 관련24 PASS·타입 검사/개발 빌드 exit0. 다음 제한된 per-parse 값공유 비교; 제품 최적화는 아직 없음. [측정과 한계](waveform-parser-profile.md).

2026-10-06 F1D: opt-in 구간별 계측·관련24 PASS·타입 검사/개발 빌드 exit0. 실제 run-hA0nMr4cycle/9exit/SHA 불변/host exit0. parse0.716–0.958s가 open0.828–1.118s 대부분, warm phase host loop41.88ms. 이전900ms 미재현/원인 미규명이며 개선 성공으로 취급하지 않는다. RSS 초기 회수 미입증; 다음은 CPU/할당·live heap 구분. [측정 경계](waveform-phase-profile.md).

2026-10-06 F1C: enum 준비 중 취소의 metadata/ready link 잔류 보완, 관련26 PASS/타입 검사·개발 빌드 exit0. 실제 run-5rYxEQ 로딩 중 tab 닫기→재열기·두 editor4cycle·9/9 worker exit/peer 값 보존/SHA 불변·receipt passed=true/host exit0. RSS 초기 회수 미입증, loop900.20ms가 임시200ms 초과하므로 성능 수용은 열려 있다. 다음은 구간별/warm 지연 계측. [범위·근거](waveform-cancel-lifecycle-acceptance.md).

2026-10-06 U05 1차: 보존 enum 이름·Auto/숫자 override·raw bit·자료 부족 fallback·분석 전/후 identity 검증, 최종 관련52 PASS/native1 PASS/타입 검사·개발 빌드 exit0. 실제 enum/Hex 전환·수정 후 Reload7.486ns LOAD 유지, 최종 receipt passed=true/sourceUnchanged=true/enumNames=true/traceReady=true·host exit0. [범위와 기존 Reload 문제 보완](waveform-enum-acceptance.md). 다음은 A3/F 잔여 안정화이며 전체 회귀·대표 규모 완료가 아니다.

2026-10-05 U04 1차: 회로도 pan/zoom/Fit·scope 복원 구현, 관련23 PASS/타입 검사·개발 빌드 통과. 실제 보존 화면 물리 조작과 기록 값 유지, 최종 소스 불변/trace ready receipt passed=true/host exit0. [정확한 범위와 초기 fixture 오류](structure-canvas-acceptance.md). 다음은 U05이며 기존 잔여 게이트 유지.

2026-10-05 U03: Simulation 입력 변경 상태 구현, 관련33+보존 회귀10 PASS/타입 검사·개발 빌드 통과. 실제 host/native2 PASS·입력 변경/dirty 분리/복원 수용, receipt passed=true/exit0. [정확한 범위와 미검증](input-freshness-acceptance.md). 다음은 U04이며 기존 큰 잔여 게이트는 유지한다.

현재 요구·구현/미구현·다음 순서는 [제품 로드맵](project-roadmap.md), 최신 작업 결과는 [PROGRESS](../PROGRESS.md)가 기준이다. 아래 체크포인트는 당시 검증 이력이며 최신 UI 변경은 [단일 커서 수용](waveform-cursor-acceptance.md)을 확인한다. 잔여 큰 검증3묶음과 깨끗한 Windows 별도 보류1은 유지한다.

## 최신 체크포인트 — 버스 비트 펼치기·묶음 이동 수용

2026-10-05: 버스 ▸/▾로 개별 bit 표시, 선언 방향/인덱스·X/Z·정확한 시간 투영과 저장 보기/편집기 상태 복원을 구현했다. 32부모+최대128 추가 bit 행; 원본 worker 채널을 추가하지 않는다. 자식은 부모 아래 고정 순서이며 독립 정렬/Edge/스타일은 후속. 실제8bit 펼침/접힘, 두 신호 범위 선택(Shift+Space) 후 묶음 drag, 보기 저장·Reload 복원 및 cursor4.556ns 유지 확인. Ctrl/Shift+마우스는 자동 이벤트 범위.

관련32 PASS/0 fail/skip, 타입 검사·개발 빌드 통과, 격리 개발 창 exit0. [구현·제한·검증 이력](waveform-bits-acceptance.md). VSIX/설치 없음. 다음 구현 enum 상태 이름 표시 → RTL 실행 화면 UX → 기존 대표 설계/loading 취소/두 reader 메모리 등 안정화 검증 재개. 큰 검증3묶음+깨끗한 Windows 별도 보류1 유지; 전체A3/F 완료 아님.

## 최신 체크포인트 — 파형 UX 정렬·눈금 개선

2026-10-05: 사용자 피드백을 우선 반영해 파형 행 X/위아래 버튼을 제거했다. 신호 포함/제외는 Signals에 통일하고 Ctrl/Shift 선택·그룹 드래그, 좁은 이름 열, 1/2/5 간격 큰/작은 눈금을 구현했다. 기본 HTML drag는 실제 화면에서 이동되지 않아 pointer capture 경로를 보완했다. 실제 clk 마지막 이동 및 cursor 4.556ns/4신호 유지 확인. Ctrl/Shift 물리 조합·그룹 이동/재시작은 아직 자동 이벤트 검증 범위다.

관련29 PASS/0 fail/skip, 최종 타입 검사·개발 빌드 통과, 두 개발 창 exit0. 합성 VCD 화면 수용이며 native 실행 완료로 세지 않는다. VSIX/설치 없음. [7개 요구·수용·후속 설계](waveform-ux-plan.md). RTL Start 재배치·비트 펼치기·enum 이름 표시 미구현. 다음은 다중 선택 물리 수용 → 비트 펼치기 → enum → 실행 화면 UX, 이후 남은 대표 설계/loading 취소/두 reader 메모리 등 검증 재개. 큰 검증3묶음+깨끗한 Windows 별도 보류1 유지; 전체 A3/F 완료 아님.

## 최신 체크포인트 — 구조 상태 표시·보기 관리 취소 수용

2026-10-05: 실제 parser/mapTracePorts/renderStructure 기반 합성 개발 화면에서 X/Z·Not recorded·Ambiguous path·Width mismatch·Unsupported type 구분과 표의 전체 문구를 확인했다. 검증용 보기의 기본 지정/해제, 이름 입력 취소, 덮어쓰기 확인창 Cancel, 삭제 확인창 Cancel 후 원래 보기·두 신호·11ns 유지를 실제 확인했다. 구조 호스트의 정확한 X/Z 채널만 조회/잘못된 binding 미조회/손상 후 전체 Unavailable 회귀 및 보기 취소의 전체 storage 불변 assertion을 추가했다.

최종 관련28 PASS/0 fail/skip, 타입 검사·개발 빌드 및 최종 두 검증 창 exit0. 제품 코드/설치/VSIX 변경 없음. [범위·fixture 준비 실패 이력·증거](structure-states-management-acceptance.md). 합성 rendering 수용은 native/보존 archive 종단 X/Z 성공이 아니며 물리 삭제 확정은 실행하지 않았다.

남은 큰 검증3묶음: 기록 자료 기반 구조 종단/남은 세부 경계, 실제 사용자 프로필 충돌, 실제 대표 설계/loading 취소/두 reader 메모리 회수. 깨끗한 Windows는 별도 PC/VM 없음으로 보류1. 다음은 loading 취소·재열기와 두 reader 실제 호스트 메모리 관측이며 전체 A3/F 완료가 아니다. 검증 이후 파형 UX 사용자 피드백을 반영한다.


## 최신 체크포인트 — 구조 내부 탐색·파형 예외·보기 갱신 보완

2026-10-05: 실제 보존 run의 DUT 더블 클릭/Up 이동, 독립 합성 파형의 X/Z 표시와 보존 구조 시간 비혼입, 보기 이름 변경·누락 1개 안내·누락 상태 새 저장 뒤 두 신호 복원을 실제 확인했다. 다른 파형 탭에 새 보기 목록이 Reload까지 반영되지 않던 A3-WAVE-VIEW-SYNC-1을 보완했다. 같은 테스트의 열린 패널에 목록을 통지하며 현재 신호·커서·보기를 강제 변경하지 않는다. 수정 후 실제 두 탭에서 Reload 없는 새 보기 반영 및 두 신호/11ns 유지 확인.

최종 관련27 PASS/0 fail/skip, 타입 검사·개발 빌드 및 두 개발 창 exit0. 앞선25/집중7은 반복 실행으로 합산하지 않는다. [상세 수용·증거·재개](structure-wave-edge-ui-acceptance.md). VSIX/설치 없음.

남은 큰 검증3묶음: 구조 X/Z·미기록/모호한 연결과 관리 예외의 남은 물리 수용, 실제 사용자 프로필 충돌, 실제 대표 설계/loading 취소/두 reader 메모리 회수. 깨끗한 Windows 별도 보류1(PC/VM 없음). 독립 합성 파형 X/Z를 보존 구조 X/Z 수용으로 세지 않는다. 다음은 남은 구조·관리 경계이며 파형 UX 개선은 검증 후 사용자 피드백을 받는다. 전체 A3/F 완료가 아니다.


## 최신 체크포인트 — 탭/CRLF·파일 간 package·분석 상태 수용

2026-10-05: 격리 VS Code1.140.0 실제 입력으로 탭/CRLF begin Tab→Enter·각 Undo·직접 Enter, module 이름→포트→본문 Tab 이동을 확인하고 저장 바이트의 탭/CRLF 보존을 검사했다. 다른 파일의 미저장 EXPORTED→UPDATED 선언 변경이 consumer의 package 추천에 반영되고 Tab 수락/Ready 복구됨을 확인했다. 디스크 EXPORTED 보존 근거도 기록했다. Disabled/Tools missing 표시와 복구 메뉴, 기존 도구 경로 복원·Retry→Ready를 실제 확인했다.

관련 자동20 PASS/0 fail/skip, 타입 검사·개발 빌드 및 개발 창 exit0. 제품 코드/설치/VSIX 변경 없음. 설정 변경은 격리 fixture 파일에서 준비했으며 사용자 설정 토글 화면 수용으로 세지 않는다. [범위·근거·재개](editing-edge-ui-acceptance.md).

남은 큰 검증3묶음: 구조 X/Z·미기록/Up/double-click 및 저장 보기 관리/누락 신호 등 세부 예외, 실제 사용자 프로필 충돌, 대표 실제 설계/loading 취소/두 reader 메모리 회수. 깨끗한 Windows는 별도 환경 없음으로 보류1. 다음은 구조·저장 보기 예외의 실제 화면이며 파형 UX 개선은 검증 이후 사용자 피드백을 받는다. 전체 검증/A3/F 완료가 아니다.


## 최신 체크포인트 — 실행 예외 화면 수용·F5 연결 보완

2026-10-05: 격리 VS Code1.140.0 지속 저장 개발 창에서 컴파일 오류 FAIL/진단 로그 열기, 준비 중 도구 검증 Stop, g++ 빌드 중 Stop, 하위 프로세스0개 및 취소 후 F5 재실행 PASS를 확인했다. 등록된 TB에서 F5가 일반 디버거를 열던 A3-RUN-F5-1을 보완했다. 활성 파일/manifest 갱신으로 TB 컨텍스트를 계산하고 편집기에 초점이 있는 등록된 Verilog/SystemVerilog TB에만 연결한다. 일반 DUT에서 기존 디버거 안내 유지도 실제 확인했다.

관련 자동18 PASS/0 fail/skip(기존16+활성 파일/manifest 갱신·현재 TB 실행 경계2), 최종 타입 검사·개발 빌드 통과. 실제 정상 실행3 PASS, 의도한 컴파일 실패1, 준비/빌드 취소2. 빌드 Stop 두 번의 늦은 클릭은 PASS로 끝났으므로 취소 성공으로 세지 않는다. 수정 전후 개발 창 exit0. [상세 근거·남은 범위](execution-detail-ui-acceptance.md). VSIX/설치 없음.

남은 큰 검증3묶음: 편집/도구/구조·저장 보기 세부 예외, 실제 사용자 프로필 충돌, 대표 실제 설계/loading 취소/두 reader 메모리 회수. 깨끗한 Windows 별도 보류1(사용 가능한 PC/VM 없음). 다음은 탭/CRLF·파일 간 package 변경·분석 비활성화/도구 누락, 이어 구조 X/Z·미기록/Up/double-click와 저장 보기 관리 예외다. 전체 A3/F 또는 모든 검증 완료가 아니다. 파형 UX 개선은 검증 후 사용자 피드백을 받는다.


## 최신 체크포인트 — Windows 빌드 종료 지연 보완

2026-10-05: MSYS Perl/셸 경로에서 제한 신호가 제때 발생해도 빌드가 계속되는 결함을 계측 재현했다(1500ms 제한→16425ms, 빌드 취소→16215ms). Windows 도구 검색을 공식 verilator_bin.exe 직접 호출로 바꿨고 비교에서1819ms 시간 초과/406ms 취소 및 정상 PASS를 확인했다. 기존190465/229258ms의 전체 지연은 계측이 없으므로 단일 원인으로 단정하지 않는다. [재현·보완·한계](timeout-termination-validation.md).

검증: Core/프로세스10 PASS, 실제 native10 PASS, 종료 뒤 Windows 프로세스 잔존 검사 강화 회귀1 PASS(중복 실행), 모두0 fail/skip 및 exit0. typecheck/development build 통과. VCD/FST·무한 실행 취소/시간 초과·공백/한글 경로·reset 복구 정상. 전체 suite/slang/물리 GUI Stop 검증을 새로 완료한 것으로 세지 않는다. VSIX/설치 없음.

남은 큰 검증3묶음 및 깨끗한 Windows 별도 보류1 유지. 다음은 실제 GUI 컴파일 실패 결과·준비/빌드 중 Stop·F5, 이어 편집/도구/구조 세부 예외, 실제 사용자 프로필 충돌, 대표 실제 설계/loading 취소/두 reader 메모리 회수다. 전체 A3/F·베타 배포 준비 완료가 아니다.


## 최신 체크포인트 — 저장 보기 복원·격리 수용 완료

2026-10-05: 같은 지속 저장 개발 프로필의 실제 UI에서 원본 basic의 두 보기 재시작/전환(3신호·2신호), 다른 TB의 Custom-only 목록, 동명 프로젝트·테스트의 별도 기본 보기 저장 및 재시작(1신호), 원본 두 보기/기본 설정 비혼입을 확인했다. 두 개발 창 exit0. 관련 회귀5 PASS/0 fail/skip, typecheck/development build exit0. 제품 코드/VSIX/설치 변경 없음. [범위·근거·이전 중단 기록](waveform-isolation-acceptance.md).

남은 큰 검증3묶음: 세부 예외·실행 안정화, 실제 사용자 프로필 충돌, 대표 실제 설계/파형 loading 취소/두 reader 메모리 회수. 깨끗한 Windows 별도 보류1. 다음 우선 작업은 비교 사본 CLI의60000ms 제한 대비190465/229258ms timedOut 결과 기록 원인 재현과 종료 경로 점검이다(원인 미확정, 로그 보존). 관리 대화상자/모든 예외·전체 A3/F·배포 준비 완료로 확대하지 않는다. 아래 중단/4묶음 기록은 재개 전 이력이다.


## 최신 체크포인트 — 저장 보기 격리 검증 중단

2026-10-05: rQSqPW 지속 저장 프로필에서 기존 기본 카운터★/3신호 복원과 리셋과 결과/2신호 두 번째 보기 저장을 실제 확인했다. 다른 TB·프로젝트 격리와 두 보기 재시작 복원은 미완료. 비교용 새 사본의 CLI 두 테스트는60000ms 제한에 대해 실제190465/229258ms 후 timedOut/exit1; 원인은 미확정이며 실행 시간 제한/종료 재검증 필요. 비교 fixture를 이전 정상 native 실행 사본으로 전환하고 첫 개발 창 exit0 후 사용자 물리 Escape로 Computer Use가 중단되어 추가 GUI 조작을 멈췄다.

[중단 기록 및 재개 순서](waveform-isolation-acceptance.md). 재개 실행기 .dev/launch-wave-isolation.mjs, 다중 프로젝트 .dev/wave-isolation.code-workspace, 동일 기존 프로필. 제품 코드/VSIX/설치 변경 없음. 이번 새 typecheck/build/회귀 PASS 주장 없음. 남은 큰 검증4묶음과 깨끗한 Windows 별도 보류1은 유지한다.


## 최신 체크포인트 — 보존 구조·파형 연동 수용과 배치 보완

2026-10-05: VS Code1.140.0 격리 지속 저장 개발 창에서 보존 top→dut/Back/Forward·정의 소스 이동, 구조25ns↔파형35ns의 시간/포트 값 동기화, 두 화면 각각 닫기/재열기와 다른 run5ns의 시간 격리를 실제 키·마우스로 확인했다. 파형을 닫아도 구조15ns/count1 조회 유지, 구조를 닫아도 파형35ns/count3 조회 유지. 구조를 계층 목록에서 재열면 안내된 Refresh가 필요하며 재연결 후35ns 복구를 확인했다.

발견한 A3-WAVE-LAYOUT-1: 좁은 화면 또는 Signals 숨김에서 main이 폭0 grid 열에 자동 배치되어 파형이 사라짐. main을 두 번째 열/첫 행에 고정하고 실제 좁은 화면 및 넓은 화면의 browser 숨김에서 시간축/세 신호/값 표시를 재검증했다. 관련31 PASS/0 fail/skip, 최종 typecheck/development build 및 수정 전후 창 exit0, 주 VCD SHA256 일치. 새 native 실행/전체 suite/VSIX/설치 없음. [실제 수용 기록](structure-ui-acceptance.md).

남은 큰 검증4묶음: 다른 TB·프로젝트 저장 보기 격리/두 보기 재시작, 세부 예외(탭/CRLF·파일 간 package·도구 누락/비활성화·컴파일 오류/빌드 Stop/F5 및 구조 X/Z·미기록/Up/double-click), 실제 사용자 프로필 충돌, 대표 실제 설계/파형 loading 취소/두 reader 메모리 회수. 개별 테스트 개수 아님. 깨끗한 Windows는 별도 PC/VM 없음으로 별도 보류1. 다음 주 작업은 저장 보기 격리이며 전체 A3/F·배포 준비 완료 아님.


## 최신 체크포인트 — 자동 안내·scope·Enter 추가 수용

2026-10-05: 격리 VS Code1.140.0 실제 키로 pkg:: 자동 추천, 미저장 EXPORTED→UPDATED 후보 갱신/디스크 보존, 안쪽 scope_arg/inner/local 및 바깥 inner 제외, wildcard import 후보를 확인했다. 함수 ( 첫 인자 및 쉼표 두 번째 인자 자동 강조, if/always/for·주석/문자열 Enter의 블록 강제 삽입 부재와 각 Undo, 상태 메뉴의 RTL Language 로그 열기를 확인했다.

제품 코드 변경/확정 새 결함 없음; typecheck/development build 및 창 exit0. [세부 화면 수용 기록](editing-detail-ui-acceptance.md). 기본4칸/LF 격리 범위이며 탭/CRLF·타 확장/사용자 설정·별도 파일 package 변경·도구 누락/비활성화 화면은 열린 항목이다. 다음 주 작업은 보존 구조 내부 탐색/시간과 파형 동기화→두 화면 독립 수명→다른 TB·프로젝트 저장 보기 격리, 이어 사용자 프로필 및 실제 설계·메모리. 전체 A3/F 완료 아님; 깨끗한 OS 보류, VSIX/설치 없음.



## 최신 체크포인트 — 인자·package·기본 편집 화면 수용

2026-10-05: 격리 VS Code1.140.0 지속 저장 개발 창에서 function 두 번째 인자의 string/default, task output int, parameter int WIDTH=8 안내를 실제 화면으로 확인했다. implicit .clk/.rst_n 제외 후 count만 추천, package EXPORTED/helper/word_t 추천 및 Tab 수락을 확인했다. Source errors→Ready 복구, Language Status 메뉴/Retry 접근과 기존 end 중복 없는 Enter/한 단계 Undo, 주석·문자열의 일반 Tab/Undo도 확인했다. 초기 팝업 부재는 분석 완료 후 정상 표시되어 제품 결함으로 확정하지 않았다.

제품 코드 변경/새 결함 없음; typecheck/development build 통과, 개발 창 exit0. 근거는 [편집 화면 수용 기록](editing-ui-acceptance.md). 함수/parameter와 package는 명시적 안내 요청, task/implicit 포트는 실제 괄호/점 자동 트리거다. 모든 자동 트리거 완료로 확대하지 않는다. 다음은 if/always/for·주석/문자열 Enter·미저장 package 변경/import/중첩 scope 및 나머지 상태 화면, 이어 구조·시간/두 화면·저장 보기 격리와 실제 사용자 프로필/설계·메모리. 전체 A3/F 완료 아님; 깨끗한 Windows 보류, VSIX/새 설치 없음.



## 최신 체크포인트 — RTL Start 실행·취소 버튼 실제 수용

2026-10-05: VS Code1.140.0 격리 지속 저장 개발 창에서 테스트 선택/선택 실행/단일 Run/전체 Run All, 결과 로그·내장 VCD 열기 및 결과 재실행을 실제 키·마우스로 확인했다. native 정상6 PASS와 의도한 failed/timedOut/cancelled 각1을 기록했다. 실제 Stop 후 사본 경로의 하위 프로세스 부재 및 reset 재실행 PASS를 확인했다. 첫 Stop 시도는 입력 전에 시간 초과됐으므로 별도 취소 성공으로 세지 않았다.

새 제품 결함/제품 코드 변경 없음. 사용자 변경 예제를 보존하고 Core 템플릿으로 사본을 준비했다. typecheck/development build 통과, 개발 창 정상 종료 exit0, 생성물 사본 .rtl/ 내 확인. 근거는 [실행 버튼 수용 기록](execution-ui-acceptance.md). 전체 A3 완료 아님; 컴파일 실패 화면/준비·빌드 중 Stop/F5·사용자 프로필은 미수용. 다음은 남은 기본 편집/implicit 포트/parameter·function/task/package scope/분석 상태의 물리 화면, 이어 구조·시간/다른 TB·프로젝트 저장 보기 격리 및 실제 설계·메모리. 깨끗한 Windows는 별도 환경 없음으로 보류; 새 D4/E·VSIX/설치 없음.



## 최신 체크포인트 — 4,096신호 화면 수용·눈금 가독성 보완

2026-10-05: 격리 지속 저장 개발 창에서 4,096신호/786,432전이의 검색·마지막 신호 선택, 큰 정수 시간 이동/Edge, 확대·축소·좌우 이동·드래그 구간 확대, 두 커서 Δ, 범위 밖 시간 오류/복구를 실제 키·마우스로 확인했다. A3-WAVE-RULER-1의 긴 눈금 글자 겹침을 측정 폭 기반 배치로 보완하고 시간 입력에 Go 버튼을 추가했다. 정확한 BigInt 시간/원본 SHA와 기존 조회·저장 보기 경계를 유지한다.

검증: 관련24 PASS/0 fail/skip, typecheck/development build 통과; 수정 전후 개발 창 exit0. 합성 standalone 화면의 부분 수용이며 전체 A3/F·실제 설계/메모리·사용자 프로필 완료 아님. 근거/열린 항목은 [중간 파형 수용 기록](medium-waveform-acceptance.md). 다음은 RTL Start의 테스트 선택/Run/Stop/결과/재실행 버튼 실제 수용, 이어 남은 편집·저장 보기 격리/구조 연결 및 사용자 프로필. 깨끗한 Windows는 별도 환경 부재로 보류; 새 D4/E·VSIX/설치 없음.


## 최신 체크포인트 — 테스트별 파형 보기 저장·재시작 수용

2026-10-05: 격리 개발 창에서 한글 이름의 두 보기 저장/전환, 기본 지정, 선택 변경 표시를 실제 키·마우스로 확인했다. 지속 저장 개발 프로필에서 기본 보기 3신호가 창 재시작 및 새 CLI native 실행 결과에서도 복원됐다. extension test 모드의 메모리 저장 제한을 확인하여 실행기에 RTL_MANUAL_PERSISTENT/RTL_MANUAL_RESUME_ROOT를 추가했다. 제품 파형/Core 변경 없이 검증 실행기를 보완했다.

검증: typecheck/development build 및 관련 회귀5 PASS, native 예제 총5 PASS. 검증용 창 정상 종료 exit0. 전체 suite/전체 A3 완료 아님; 두 보기 모두의 재시작·다른 TB/프로젝트 물리 격리·GUI Run/Stop 수용은 남는다. 근거와 재현은 [저장 보기 수용 기록](waveform-view-acceptance.md). 다음은 4,096신호 실제 검색/선택/zoom/time 화면, 이어 남은 편집·실행/사용자 프로필 및 실제 설계/메모리 수용. 깨끗한 Windows는 별도 환경 없음으로 보류; VSIX/설치 없음.


## 최신 체크포인트 — A3-EDIT-OPEN-1 포트 추천 복구

2026-10-04: 미완성 인스턴스의 실제 slang 범위가 다음 source buffer로 넘어가 커서가 인스턴스 밖으로 처리되는 문제를 보완했다. 컴파일러가 확인한 인스턴스의 끝 범위를 원래 파일 EOF로 제한한다. 또 manifest test top에서 도달하지 않는 새 모듈은 모든 module의 기본 elaboration에서 누락된 source 위치만 추가한다. 실제 selected-top 시그니처는 우선 유지하고 generated/shared 위치의 서로 다른 타입은 기존 ambiguity 차단을 유지한다. 원본 파일/진단/계층/시뮬레이션 입력을 수정하지 않는다.

초기 관측 정정: 선택된 TB가 마지막 source buffer인 단순 EOF 문맥은 slang 자체가 이미 복구했다. 모든 EOF가 파서 실패였던 것은 아니다. 회귀 테스트에서 다음 파일로 넘어가는 end.file/end.offset을 직접 관측하여 원인을 확정했다. tests/semantic/recovery.test.ts는 closer 없음/괄호만 있음/endmodule 있음, parameter override, 한글·emoji UTF-16 offset, 미연결 제외, 새 모듈의 폭11과 .data( 인자 안내, 저장 소스 보존을 검사한다. tests/vscode/semantic.ts는 실제 LSP의 EOF . 추천·.tally( 안내를 추가 검증한다.

검증: 실제 slang13 PASS/0 fail/skip(.dev/port-recovery-semantic.log), 실제 editor/semantic/structure/waveform host run-qKTkGA receipt passed=true/editor=true/exit0(.dev/port-recovery-vscode.log), typecheck/development build 통과. 실제 키 검증 run-xtSwWB(VS Code1.140.0 격리 개발 프로필)에서 새 ui_probe의 닫는 구문 없는 EOF에 점 키를 눌러 count·rst_n Field 팝업과 output logic[7:0] 표시, 이미 연결한 clk 제외를 관측했다. .rtl/manual-input.json에 미저장 text/커서가 기록되어 있다. 정상 stop/exit0이며 manual receipt의 acceptancePassed=false는 전체 A3 수용 완료가 아님을 뜻한다.

다음 순서: 저장된 테스트별 파형 보기의 실제 UI/재시작 수용 →4,096신호 검색/선택/zoom/time 화면 → 사용자 프로필 충돌·실제 설계/메모리. parameter·function/task/package scope의 전체 물리 수용은 아직 남고, 깨끗한 Windows 종단은 별도 환경 없음으로 보류다. 이번에 전체 일반/Verilator/full-simulation suite를 재실행했다고 하지 않는다. VSIX/설치 없음. 새 큰 D4/E보다 남은 A3/F 수용을 먼저 진행한다.


## 최신 체크포인트 — A3 실제 키 입력 1차 확인

2026-10-04: computer-use의 실제 Windows 키 입력으로 격리된 VS Code 1.140.0 개발 창을 확인했다. module→Tab→이름→Tab→포트→Tab→본문, package/case 템플릿 필드 이동, begin→Tab(인라인)→Enter 및 begin→직접 Enter(들여쓴 본문/end)가 정상 동작했다. run-6ujQus의 .rtl/manual-input.json에 문서/커서 관측 기록이 있다. 사용자 중단 동안 이 창은 15분 제한으로 종료되어 완료 receipt가 없으며, 이를 수용 실패나 완료로 대신 해석하지 않는다.

재개한 run-bsLVeC에서는 설정된 counter_basic_tb의 미저장 .clk(clk), . 문맥에서 실제 점 키로 count/rst_n만 표시되고 이미 연결한 clk는 제외되는 팝업을 확인했다. Tab으로 count를 수락하고 인자 안내에서 output logic[7:0] count 강조를 확인했다. 이 실행은 정상 stop→exit0이며 extension-test.json의 manualHarness=true는 검증 창 종료만 뜻하고 acceptancePassed=false다. 이 실행 당시 recorder는 scratch만 기록하므로 TB 팝업 근거는 대화의 실제 screenshot/accessibility 관측이다. 이후 recorder를 격리 사본 안의 SV/V 문서로 확대하고 workspace 경로 검증/5,000건 제한을 추가했다.

발견한 제한 A3-EDIT-OPEN-1: 괄호/endmodule가 없는 EOF 작성 중에는 설정된 TB에서도 포트 추천을 관측하지 못했다. closer가 있는 동일 문맥에서는 동작한다. 또 현재 analyze는 manifest test top의 elaborated instance를 사용하므로 테스트에서 도달하지 않는 새 ui_probe 인스턴스는 추천 대상에 없었다. 실제 parser recovery/독립 모듈 편집 지원을 진단·회귀 검증한 뒤 보완할 것; 정규식으로 임의 시그니처를 추정하지 않는다.

개발 전용 RTL_MANUAL_ACCEPTANCE=1 idle harness를 추가했다(tests/vscode/manual.ts). 실행기가 창을 숨기는 원인을 찾아 수동 모드만 visible로 변경했고 자동 모드는 유지했다. 도구는 기존 .dev/rtl-dev, SystemVerilog/4-space lexical fixture, 다른 설치 확장 비활성화. 사용자 프로필 충돌·일반 function/task/parameter/package scope·저장 보기·중간 canvas·깨끗한 OS 수용까지 완료했다는 뜻이 아니다. typecheck 및 개발 build 통과, VSIX/설치 없음. 다음은 A3-EDIT-OPEN-1의 실제 slang 재현/보완 → 저장 보기/중간 파형의 물리 UI → 실제 설계/메모리 수용이다.


## 최신 체크포인트 — 현재 구현 종합 재검증

2026-10-04: 사용자 요청에 따라 새 D4/E 작업 전에 현재 지원 범위 전체를 재검증했다. 일반138/실제 slang12/실제 Verilator13 모두 PASS·fail/skip0, 최종 typecheck/development build 통과. 실제 전체 GUI 최종 run-krwREi(성공5/의도 FAIL1/취소1), 보존/include run-deQoAI(native2), 경로·중복 이름 다중 프로젝트 host-JdlchZ(native3),4,096신호 editor3회 run-uv8IAh 모두 receipt passed=true/exit0. 같은 전체 GUI fixture의 CLI check/개별/all/입력 비교/실패 exit1/manifest 없는 보존 hierarchy·trace/파형 손상 차단도 최종 통과(.dev/audit/cli-receipt.json: 같은 입력 지문·PASS3/의도FAIL1 추가).

발견/보완: AUD-FIXTURE-TS-1 — 전체 GUI fixture의 두 package에 시간 단위가 없어 GUI simulation은 성공했지만 후속 CLI 보존 hierarchy가 MissingTimeScale로 실패했다. fixture에 동일 timeunit/timeprecision을 추가하고 GUI package 실행 후 보존 구조 roots/trace-ready assertion을 넣어 새 run에서 GUI/CLI로 재검증했다. 초기 run-qblct1/CLI 실패는 보존하며 기존 archive나 사용자 소스/진단을 수정하지 않았다. AUD-HELP-2 — 구현된 rtl trace가 기본 도움말에 빠져 usage를 추가하고 build/실제 출력 확인.

중간 규모 reader와 반복8회/16 worker exit·원본 SHA 보존도 재검증했다(waveform-SPMS7L/lifecycle-YK4poq). 동시 GUI/native 부하 조건의 로컬 측정이며 이전 단독 측정과 성능 비율로 비교하지 않는다. 종료 후 높은 RSS의 제품 수용·실제 사용자 설계는 계속 열려 있다. 실제 키 입력/팝업/버튼/타 확장 충돌·캔버스·저장 보기 대화상자/재시작 수용은 자동 host로 대체 완료하지 않는다. 사용자 답변상 별도 PC/VM이 없어 깨끗한 OS 종단은 보류다. 종합 표/전체 근거/발견 문제는 [종합 검증](comprehensive-validation.md), 다음 실제 수용은 [체크리스트](manual-acceptance.md). VSIX/새 설치 없음.

다음 담당자는 이번 전체 suite를 이유 없이 다시 반복하지 말고 **A3 실제 사용자 프로필·중간 규모 화면 및 보기 저장 경험 → 실제 설계/메모리 수용 → 별도 환경 확보 후 깨끗한 Windows 종단**을 진행한다. 아직 첫 베타 준비/전체 제품 안정화 완료는 아니며 큰 D4/E 확장은 위 조건을 먼저 정리한다.

## 이전 체크포인트 — F1B 반복 수명·두 화면 닫기 안정화

2026-10-04: WaveformSession의 중복 dispose가 실제 worker 종료를 기다리지 않던 경합을 수정했다. error로 요청이 먼저 닫힌 경우에도 같은 종료 promise를 기다린다. 4,096신호 두 reader를8회 열기/닫기·불량 reload/재시도·queued 조회 중 닫기로 검증하여16/16 worker exit, 살아 있는 peer의 값/재읽기 및 원본 SHA 보존을 확인했다. 종료 후 process RSS는 약522~525MiB로 plateau였고 첫 cycle 대비 마지막+0.94MiB, 부모 heap+0.28MiB였다. 이는 누적 증가 미관측이며 초기55MiB 수준으로 메모리 회수가 완료됐다는 뜻은 아니다.

검증: 일반138 PASS/0 fail/skip 및 typecheck/build(.dev/f1-lifecycle-unit.log). .dev/scale-tests/lifecycle-kCgJq7/report.json passedCorrectness=true. 실제 보존/include GUI 최종 run-N3IrdK receipt passed=true/peerCloseReopen=true, native2 PASS: 실제 파형 탭과 구조 패널을 각각 닫고 다시 열어 peer reader/커서가 유지됨을 확인했다(.dev/f1-lifecycle-vscode-final.log). 실제4,096신호 custom editor3회 여닫기 run-rc8U1S receipt passed=true/mediumWaveform=true, 열기1.92~2.22초·host event-loop max31.69ms·원본 보존(.dev/f1-medium-vscode-final.log). 최초 medium run-RpWAvM은 테스트 cwd 경로 가정으로 fixture를 못 찾아 실패했고 확장 경로 기준으로 수정해 통과했다.

사용자는 별도 Windows PC/VM이 현재 없다고 답했다. 깨끗한 OS 승인 설치 종단은 환경 확보 전 **보류/미검증**이다. computer-use 초기화/창 관측을 시도했으나 격리 개발 창을 제어 가능한 창으로 찾지 못해 실제 키/캔버스 수용은 미완료다. 개인 프로필 신뢰 설정은 변경하지 않았으며 테스트 전용 숨은 개발 프로세스는 식별 후 정리했다. 다음은 **A3 일반 개발 실행의 물리 입력/추천·팝업·버튼 및 중간 규모 화면 수용**, 실제 프로젝트·메모리 회수 판단이다. F 전체/베타 준비 완료로 표시하지 않는다. CLI/full GUI/all-semantic은 이번에 재실행하지 않았고 VSIX/새 설치도 없다. 상세는 [안정화 검증](stability-validation.md).

## 이전 체크포인트 — F1 중간 규모 측정·취소/복구 기반

2026-10-04: 사용자가 초기 베타 대상 규모를 **RTL 수백 파일·파형 신호 수천 개**로 확정했다. 합의한 A3/F 필수 안정화에 진입했다. 재현 가능한 합성 VCD(256/4,096/8,192신호, 최대983,040전이)와 실제 slang의 생성 RTL256파일+top을 측정하고, 파형의 같은 시각 문자열을 공유하도록 중복 변환/저장을 줄였다. 미저장 폭 변경·진행 중 분석/파형 읽기 취소·실패 후 복구·원본 지문 보존을 확인했다. F1 전체/실제 사용자 설계/베타 수용 완료는 아니다.

최종 근거: 일반137 PASS/0 fail/skip 및 typecheck/development build; 실제 semantic 관련2 PASS/0 skip(.dev/f1-semantic-scale.log); 실제 보존/include VS Code run-bkh3j8 receipt passed=true, native 2 PASS, recordedValues/sharedCursor/traceInvalidation=true(.dev/f1-recorded-vscode.log). 파형 최종 .dev/scale-tests/waveform-0PfKkS/report.json: 4,096신호 두 reader 읽기1.24초·값p95 2.77ms·window p95 11.17ms·최고process RSS640.95MiB. 동일 격리 조건의 변경 전은1.47초/700.57MiB(.dev/f1-waveform-before.json). RSS는 부모+worker·실패 재시도 포함이며 VS Code 전체/worker heap/steady state 메모리가 아니다. 시간 목표는 로컬 임시 기준이다.

다음 순서: **반복 열기/닫기·메모리 회수와 두 view 자원 검증 → 실제 사용자 프로필 A3 입력/팝업/버튼·중간 규모 화면 수용 → 깨끗한 Windows 승인 설치 종단 → 사용자 준비 판단 후 베타 패키지**. 현재 환경으로 깨끗한 OS를 대신하거나 자동 host API로 물리 UI 수용을 대신하지 않는다. CLI/full GUI/전체 native는 이번에 별도 재실행하지 않았고 이전 날짜 근거를 유지한다. 새 설치/VSIX 없음. 재현 방법·전체 측정 표·열린 항목은 [안정화 검증](stability-validation.md)을 먼저 읽는다.

## 이전 체크포인트 — D3B2 보존 구조 값·파형 커서 연결

2026-10-04: 지원된 보존 실행의 integral module port/VCD 범위에서 D3B GUI 연결을 구현했다. 결과의 Explore Recorded Structure에서 카드/표의 포트 관측값을 보고 Time에 `5 ns`처럼 입력하여 Go/Enter로 이동한다. Open linked waveform은 내장 VCD를 명시적으로 열며 cursor A와 양방향으로 시각을 공유한다. current design에는 기록 값을 붙이지 않는다. missing/ambiguous/width-mismatch/unsupported는 추측값 대신 상태/이유를 표시하고 X/Z와 큰 정수 시간은 유지한다.

구현: VS Code API 없는 trace-links.ts가 Core 검증→같은 bytes의 worker SHA 확인→보존 입력 후검증을 조합하고 양쪽 host에 하나의 TraceCursorHub를 공급한다. run/보존 directory/source·trace 지문으로 격리, nonce/세대/값 요청 revision/파형 token으로 늦은 응답 차단, 최대200 표시 포트·32개 조회 batch, 30초 읽기 취소/닫기/reader 정리를 제공한다. 보존 inputs/metadata/파형/상위 디렉터리 watcher는 값을 무효화한다. trace만 손상되면 정상 구조/소스 탐색은 유지하며 파형은 Reload로 다시 열 수 있다. legacy/미지원 VCD는 일반 보기로 남고 FST는 기존 외부 경로다.

검증: 일반136 PASS/0 fail/skip, typecheck/development build 통과(.dev/d3b-gui-unit.log). 실제 보존/include VS Code 최종 .dev/d3b-gui-vscode-final.log / run-fSFRCq receipt passed=true, recordedValues/sharedCursor/traceInvalidation=true, exit0, native 2 PASS. 현재 manifest 없이 원본/package/header가 잘못된 상황의 값 조회·양방향 cursor·다른 실행 격리·파형 손상 차단/복원·기록 입력 손상·현재 모드 전환을 확인했다. 실제 full host .dev/d3b-full-vscode-final.log / run-6MUb5Z receipt passed=true/exit0, 성공5/의도한 실패1/취소1. 초기 full run-KrVsKg는 package preflight 중 취소하여 statuses=[]인데 fixture가 cancelled record를 요구해 실패했다. 시뮬레이션 시작 로그를 기다린 뒤 취소하도록 fixture를 보완한 최종 run은 통과했다. 물리 클릭/캔버스 시각 수용은 아니며 CLI/전체 native suite는 이번에 별도 재실행하지 않았다. VSIX/새 설치 없음.

다음은 합의한 A3/F 필수 안정화다. 새 D4/E 기능을 바로 늘리지 않고 실제 사용자 프로필의 키/추천/인자 팝업·버튼과 커서 시각 수용, 깨끗한 Windows GUI 승인 설치→실행→파형, 실패/취소/재시도와 대표 설계 응답성·메모리·데이터 보존을 점검한다. 아직 베타 패키징 gate 통과는 아니다. D3B의 첫 지원 범위 완료와 전체 제품 안정성을 구분하며 FST/내부 신호 전체/클럭 재생/실제 step/MAC/독립 host는 후속이다.

## 이전 체크포인트 — D3B1 분석·값·커서 기반

2026-10-04: D3B를 나누어 첫 기반 범위를 구현했다. WaveformSession.loadVerified는 Core가 검증한 Uint8Array를 worker에 복사하여 전달하고 worker가 같은 바이트의 SHA256을 다시 확인한 뒤 파싱한다. 파일 경로를 재개방하지 않는다. worker 요청을 순서대로 처리하고 새 load 실패 시 이전 데이터를 지워 과거 값 재사용을 차단한다. values/queryValues는 최대32개 신호의 지정 시간 관측값만 반환하며 전이/viewport를 전달하지 않는다. X/Z·alias·정확한 큰 정수 시간·end=0을 유지한다.

VS Code 독립 TraceCursorHub는 보존 directory(Windows host가 정규화)·run UUID·source fingerprint·trace SHA256이 모두 같은 view만 연결한다. 시간/end/timescale 검증, revision·dispose·invalidation·멤버/그룹 제한을 제공하며 손상으로 무효화된 이전 연결은 새 그룹을 되살릴 수 없다. 이것은 파일 검증/권한 계층이 아니다. host는 Core 검증과 보존 semantic 문맥을 공급하고 파일 변경·취소·늦은 응답을 별도로 처리해야 한다.

검증: 일반128 PASS/0 fail/skip, typecheck/build 통과(.dev/d3b-foundation-unit.log). 실제 Verilator+slang 관련2 tests PASS/0 skip(.dev/d3b-foundation-native.log), .dev/d3b-foundation-native-receipt.json passed=true: 현재 manifest 제거/원본 손상 후 검증 바이트를 worker로 읽어 7개 instance/generate/array/escaped-dot 포트 값 대조, 양방향 커서 모델·다른 프로젝트 격리·무효화 확인. 이번 GUI/CLI host suite/물리 UI는 재검증하지 않았다. D3A GUI/CLI는 이전 날짜 근거다. 새 패키징/설치 없음.

다음은 D3B2 GUI 연결: structure.ts의 보존 문맥에서만 Core loadRecordedInputs/loadRecordedTrace→worker.loadVerified→mapTracePorts로 관측값을 표시하고, waveform.ts와 같은 hub를 공유한다. stale/세대/nonce/revision/취소·닫기·trace/source watcher로 연결과 늦은 응답을 차단하고 missing/ambiguous/width-mismatch/unsupported를 명시한다. 보통/legacy/FST 파형 보기와 현재 구조는 유지한다. 현재 GUI에는 값이나 공유 커서가 아직 없다. D3B 전체 완료로 표시하지 않는다. D3B2 후 A3/F 필수 안정화→사용자 준비 판단 후 첫 베타 패키지→피드백 보완 순서를 유지한다.

## 이전 체크포인트 — D3A

D3A 첫 범위 완료 (2026-10-04): 새 실행은 source snapshot과 run ID에 연결된 waveform hash/size/format을 기록한다. 공통 Core가 변경·교체·다른 run·과거/미지원 trace를 검증하며 정상 로그/파형 보기는 유지한다. waveform의 VS Code 독립 mapTracePorts가 정확한 segmented instance/port 경로로 VCD를 연결한다. bare top/명시적 TOP wrapper, alias, generate/instance array, escaped dot를 지원하며 missing/ambiguous/width-mismatch/unsupported는 값을 추측하지 않는다. 현재 범위는 integral module ports와 ready snapshot의 VCD이며 내부 신호 전체/FST 매핑/GUI 값 표시는 아니다.

검증: 일반122/typecheck/build 통과(.dev/d3a-unit.log), 실제 Verilator VCD+slang hierarchy 관련2 native tests 통과(.dev/d3a-native.log 및 .dev/d3a-native-receipt.json). final native에서 동일 모듈 2개·generate 2개·array 2개·escaped dot의 경로와 값을 확인했다. actual recorded/include GUI run-jzzec5 receipt passed=true/recordedTrace=true/exit0(2 PASS), CLI .dev/d3a-cli-receipt.json은 두 기록 각3 port matched, 현재 manifest 없이 분석·파형 변경/다른 run/legacy 차단을 확인했다. 물리 UI 검증이 아니며 full native/full GUI suite 재실행은 이번에 하지 않았다.

초기 native의 일반 경로는 통과했으나 escaped 이름은 pretty-print hierarchicalPath에 backslash/공백이 남아 missing이었다. semantic instancePath를 compiler symbol.name에서 만들고 array index만 실제 부모와 합쳐 재검증하여 matched로 통과했다. 기존 navigation id/표시 경로는 유지했다. hierarchy port에 기존 signal_type 모델도 공급한다. 매핑 모델 자체는 인증 계층이 아니므로 모든 소비자는 Core loadRecordedInputs/loadRecordedTrace와 archived hierarchy 검증을 거쳐야 한다.

다음은 D3B: 보존 구조의 port 관측값과 waveform 공유 cursor UX. worker가 실제 분석한 bytes와 검증한 trace hash를 일치시키고 current/recorded·run·세대/취소를 분리한다. source/trace 손상 시 값 연결을 차단하며 정상 구조/로그/파형을 가능한 범위에서 유지한다. 이후 새 기능 추가를 멈추고 A3/F 필수 안정화 검증→첫 베타 패키지→실사용 문제 보완→초기 안정 버전 판단 순서다(사용자 합의). 이번에는 VSIX/새 설치를 하지 않았다.


## 이전 체크포인트 — D2B3B

D2B3B configured literal include 보존 완료 (2026-10-04): 프로젝트 내부 `sources.include_dirs`의 순서와 전체 파일 트리를 실행 사본으로 옮기고 빈 configured root도 유지한다. standalone quoted literal include는 첫 configured 경로를 쓰며 하위 경로(`nested/width.svh`)도 지원한다. 사본 package 분석·빌드·기록 구조가 같은 include 사본을 사용한다. 원본 설정/헤더가 바뀌거나 없어도 검증된 보존 구조와 readonly 헤더를 열 수 있다.

지원 경계: 소스/헤더 옆 파일과 첫 configured 결과가 충돌하면 unavailable, configured 경로 없이 source-relative만으로 찾는 경우도 unavailable이다. dynamic/inline/매크로 본문/continued directive·absolute/`..`/backslash 경로·외부 source/include root·symlink/junction 경로는 보존 지원에서 제외하고 기존 실행+이유를 유지한다. 주석/일반 문자열 속 include 텍스트는 더 이상 일괄 차단하지 않는다. inactive includes와 전체 include tree는 보수적으로 관측하여 불필요한 파일도 비교/용량에 포함될 수 있다. 완전한 전처리기나 글로벌 atomic save/tool environment/runtime data 보존은 아니다.

검증: 일반117/typecheck/build, 실제 native 1 test(원본 baseline + VCD/FST 사본 2, 실제 slang hierarchy/port 8-bit 검증), actual VS Code run-rskbus(2 PASS·recordedIncludes=true·receipt passed=true/exit0), CLI 두 기록 matching→changed/현재 manifest 없는 hierarchy 통과. `.dev/d2b3-include-unit.log`, `d2b3-include-native.log`/`.dev/d2b3-include-native-receipt.json`, `d2b3-include-vscode.log`, `d2b3-include-cli.log`/`.dev/d2b3-include-cli-receipt.json`. 초기 native test는 hierarchy에 없는 signalType 필드를 검사해 실패했고, 실제 instance semantic 모델로 폭을 검증하여 통과했다. 물리 UI 수용/전체 native·full GUI suite 재실행과 구분한다.

새 예제: `examples/include-counter` (package 자동 정렬 + 두 configured root의 동일 이름 헤더 + nested include + 2 TB). 폭이 잘못 선택되면 `$fatal`로 실패한다. GUI 재현은 RTL_RECORDED_TEST=1와 RTL_RECORDED_INCLUDE_TEST=1, 기존 scripts/test-vscode.mjs. 다음은 D3A 보존 run/trace 식별·full instance path 매핑의 작은 범위다. ready snapshot이 없는 기존/미지원 실행은 현재 소스에 자동 결합하지 않는다. FST 내장 해석·클럭 재생·MAC 연산·독립 IDE 호스트는 후속이며 VSIX 배포·새 설치는 수행하지 않았다.


## 이전 체크포인트 — D2B3A

D2B3A package 보존 완료 (2026-10-04): 프로젝트 내부 package 파일도 실행 소스 사본으로 보존한다. 자동 순서는 원본 preflight 이후 사본에서 기존 package provider로 다시 분석하며, 실제 빌드 순서로 지문·result.sources를 기록한다. 사본 분석 실패/취소는 원본 재시도 없이 FAIL/cancelled다. manifest 수동 순서도 지원한다. 결과 GUI/CLI 구조 분석과 readonly package 소스 이동은 검증된 사본만 사용한다.

검증: 일반112/typecheck/build 통과, 실제 native 관련2 tests(3 PASS 실행·package 병렬2/명시적 소스1), 실제 package GUI run-WhaR8u receipt passed=true/recordedPackages=true/exit0(2 PASS), 실제 CLI matching→changed/현재 manifest 없이 두 보존 hierarchy 통과. `.dev/d2b3-package-unit.log`, `d2b3-package-native.log`, `d2b3-package-vscode.log`, `d2b3-package-cli.log`/`d2b3-package-cli-receipt.json`. 전체 native/full GUI suite 재실행은 이번에 하지 않았고, 이전 D2B2 full GUI는 과거 기준점이다. 물리 UI 수용 검증은 아니다.

실제 native 첫 검증에서 예제 package에 timeunit/timeprecision이 없어 slang MissingTimeScale로 구조 분석이 막혔다. examples/package-counter의 세 package에도 DUT/TB와 같은 시간 단위를 선언하고 native/GUI/CLI로 재검증했다. Windows 대소문자 파일명 매핑과 사본 분석 실패/취소도 일반 회귀에 추가했다.

다음은 D2B3B literal include 보존 계약이다. includeDirs/모든 `include 문자열(주석 포함)/외부 경로는 아직 unavailable fallback이며 일반 실행은 유지한다. include 탐색 우선순위·shadowing·nested relative 해석을 두 adapter와 일치시키기 전 지원 확대를 선언하지 않는다. D3 trace 값/클럭/MAC는 미구현이다. 배포 패키징·새 도구 설치는 수행하지 않았다.


## 최신 추가 — D2B2

D2B2 보존 실행 GUI 구조 탐색 완료 (2026-10-04): 결과 메뉴 Explore Recorded Structure가 특정 run의 검증된 Project/TestTarget을 기존 SlangProvider에 전달한다. 현재 manifest/미저장 overlay를 읽지 않고 화면·tree·탐색 이력을 current/recorded 및 run ID로 구분한다. 현재 원본 변경은 보존 view를 덮지 않으며 보존 입력 변경/손상은 stale·재검증 실패로 이동을 차단한다.

최신 검증: 일반108/typecheck/build 통과. 실제 보존 GUI run-A2LYPy(2 PASS + archived 구조/readonly 정의/손상 차단/현재 전환) 및 전체 GUI run-gQnoQ5(성공5/의도한 실패1/취소1) receipts passed=true/exit0. `.dev/d2b2-final-unit.log`, `.dev/d2b2-final-recorded-vscode.log`, `.dev/d2b2-full-vscode.log`. 실제 host API 검증이며 물리 UI 수용은 아니다. Compiler/runner/CLI 동작은 바꾸지 않았고 이전 native11/CLI receipts는 과거 근거로 유지한다.

보존 구조의 instance/definition/port/parameter source 링크는 공통 recorded-source host를 통해 당시 사본의 정확한 위치를 readonly 문서로 연다. Core가 검증한 sourceMappings 외의 파일은 열지 않고 URI는 run directory까지 포함해 중복 ID/다중 프로젝트를 분리한다. Explore current design은 명시적으로 현재 문맥으로 돌아간다. 다음은 D2B3 include/package 보존 계약; 값/클럭/trace 연결은 여전히 후속이다.

## 최신 추가 — D2B1

D2B1 보존 소스 첫 범위 (2026-10-04): Verilator가 프로젝트 안의 명시적 소스 사본을 `.rtl/runs/<run>/inputs/`에서 빌드한다. 원본이 컴파일 직전 바뀌어도 결과와 사본의 연결이 유지된다. include 디렉터리·include 문자열·package 그룹·외부 경로는 아직 보존을 지원하지 않으며 기존 입력으로 실행하고 inputSnapshot=unavailable/이유를 기록한다. 기존 backend는 capability opt-in 없이 사본으로 전환하지 않는다.

최신 근거: 일반105/typecheck/build, native11, 보존 GUI run-VwRA80 receipt(2 PASS/readonly type 경로), CLI d2b-cli-receipt(2 PASS/현재 manifest 없이 archive hierarchy) 통과. 초기 전체 host run-xSyxi3에서 취소가 정리 지연 중 timedOut으로 바뀌는 문제를 발견해 timer 우선순위를 수정했고 final unit에 slow-cleanup 회귀를 추가했다. 실제 전체 suite 재검증 최종 근거는 verification 상단을 따른다. 초기 WorkspaceEdit 기반 readonly 테스트는 실패했으며 사용자 type 경로의 최종 테스트만 수용 근거다.

최종 전체 VS Code도 통과: `.dev/d2b-final-vscode.log`, run-XDlo5D receipt passed=true/exit0, 성공5/의도한 실패1/취소1. 취소 결과는 cancelled로 유지됐고 이번 fixture의 정리는 756ms였다. MSYS2 지연 전체를 해결했다고 확대하지 않는다. 일반105·native11·보존 GUI2 PASS·CLI2 PASS와 함께 verification 상단을 최신 기준으로 사용한다.

Core loadRecordedInputs는 run/result·원래 설정·파일 해시·경로/심볼릭링크·추가 파일을 검증하여 같은 top/defines/waveform의 Project/TestTarget을 반환한다. CLI hierarchy --run RUN_ID는 이 입력을 기존 SlangProvider에 전달하며 현재 rtl.toml 없이도 동작한다. GUI 결과의 Open Recorded Source는 당시 첫 테스트벤치 사본을 rtl-recorded 읽기 전용 문서로 보여준다. 현재 구조와 파형의 자동 결합은 아직 하지 않는다. 다음은 D2B2 보존 실행의 GUI 구조 탐색 및 include/package 지원 계약이다.

## 최신 추가 기록 — D2A

D2A 입력 식별 첫 범위 구현 (2026-10-04): 공통 Core runner가 runId와 versioned SHA256 입력 지문을 결과에 저장한다. 저장된 sources/packages/test sources·include 경로/트리와 literal include 의존성·defines·top·backend/timing/waveform을 추적하고 실행 전후 변경을 구분한다. 결과 메뉴 Check Source Version 및 CLI history --verify-inputs가 같은 비교 모델을 사용한다. 과거/미지원 identity는 로그·파형을 보존하면서 legacy/unavailable로 안내한다. 미저장 입력은 GUI에 별도 안내하며 자동 저장하지 않는다.

최신 검증: 일반100/typecheck/build, 실제 Verilator 통합10, 실제 VS Code 전체 suite(성공5/의도한 실패1/취소1), 실제 CLI 두 테스트와 일치→변경 비교 모두 통과. `.dev/d2-final-unit.log`, `.dev/d2-integration.log`, `.dev/d2-vscode.log`/run-mskgxC receipt, `.dev/d2-cli.log`/d2-cli-receipt.json. 실제 host는 API 기반이며 물리 UI 수용은 아니다.

지문은 원자적 compiler snapshot이 아니다. 동적/찾을 수 없는 include·symlink·크기 제한은 unavailable, 실행 중 변경은 changed-during-run이다. 전후 관측 사이 변경 후 원복/도구 환경/모든 implicit backend 입력은 보장하지 않는다. matching은 과거 trace와 현재 diagram 결합 허가가 아니다. 다음은 D2B 불변 입력과 semantic/run 문맥 일치 계약이며 D3는 아직 시작하지 않는다.

## 최신 추가 기록 — 2026-10-04 D1

D1 계층 탐색의 첫 범위를 구현·검증했다. 내부 보기/더블클릭, 전체 인스턴스 경로, 뒤로/앞으로/상위, 테스트 변경 시 이력 초기화, 갱신 후 가장 가까운 잔존 부모 복귀를 제공한다. generate/instance array도 실제 부모 관계를 따른다. 일반 94개·최종 관련 12개·typecheck/build와 실제 VS Code 전체 suite(성공 5/의도한 실패 1/취소 1)를 통과했다. 증거는 verification 상단. 이 기록이 아래 과거 감사보다 최신이다.

D1은 정적 구조 탐색이며 run/source 일치·파형값 연결·클럭 재생·MAC 내부 연산 모델은 아직 미구현이다. 다음은 D2. 물리 입력/팝업/canvas, 완전 GUI 설치, 깨끗한 OS, 큰 설계 수용 검증은 계속 미완료다.

검증: 2026-10-03, Windows x64, 현재 작업 폴더. 대상은 현재 개발 호스트와 구현된 기능이며 독립 IDE 전체의 완료 판정은 아니다. 제품 코드는 이번 감사에서 변경하지 않았다. 배포/VSIX 설치와 새 도구 설치도 수행하지 않았다.

## 판정

**10-04 실제 설치 후속 완료:** 사용자 재개 요청에 따라 fresh-tools 독립 MSYS2/Verilator/GCC 설치와 RTL smoke 검증 통과. 새 도구 native integration 10개, 실제 VS Code 전체 suite(성공 5/의도한 실패 1/취소 1), CLI check/개별/all(3 PASS/VCD) 통과. 기존 설치→독립 새 설치 전환/다중 workspace도 PASS 3개로 검증했다. 두 설치의 compiler 버전은 5.050으로 동일하다. 최신 receipts/실행 근거는 verification 상단. 현재 PC의 새 tool storage 검증이며 깨끗한 OS/GUI 설치 확인부터 파형까지의 물리 수용은 아니다. GTKWave UI 접근은 computer-use 앱 승인 시간 초과로 검증하지 못했다. 새 설치 승인은 이미 해소했다.

**10-04 추가 검증:** 실제 VS Code에서 toolsDirectory A→B 변경 후 native build/run과 두 workspace의 중복 이름 테스트를 확인했다 (PASS 3개, host-SAlcqJ receipt). B는 같은 MSYS2 바이너리로 연결한 다른 경로이며 버전 업그레이드 검증이 아니다. 실제 HTTP 다운로드 취소/재시도와 provider 실패 후 잠금 정리, 기존 GTKWave 버전 검증도 통과했다. 일반 85개·typecheck 통과. 현재 개발 호스트 물리 입력은 computer-use에서 해당 창을 찾지 못해 미완료이며, 새 저장소 설치는 사용자 재개 요청 후 실제 RTL smoke 검증까지 통과했다. 깨끗한 Windows 성공 설치로 확대하지 않는다. 상세 증거는 verification 상단.

**10-04 후속 보완:** AUD-CACHE-1/AUD-CLI-1 수정. 설정 listener가 공유 toolsHome을 즉시 갱신하고 verified 캐시를 지운다. 진행 중 검증/설치는 generation이 일치할 때만 캐시를 저장하며 현재 작업에는 로컬 Toolchain을 반환한다. 다음 실행은 다시 검색/검증한다. CLI check는 IDE 내장 VCD와 외부 FST viewer를 구분한다. 일반 82개·typecheck/build 통과 (`.dev/audit-fix-unit.log`); 추가 회귀 6개는 재사용/무관 설정/수동 경로 변경/검증·설치·실행 도중 변경/설치 거절과 실제 CLI entry point check 출력을 확인한다. 실제 VS Code 전체 suite도 통과 (`.dev/audit-fix-vscode.log`, run-PU4KDL receipt passed=true/exit 0, PASS 5/의도한 FAIL 1/취소 1). 아래 미수정 표는 10-03 감사 당시 기록이며 Windows 실물 compiler 교체/깨끗한 설치 수용은 별도로 미검증이다.

현재 지원하는 예제/검증 문맥에서 핵심 편집→실행→결과→파형 흐름은 정상 동작한다. 실행한 테스트 중 실패/skip은 없다. 예상 실패 테스트는 FAIL 결과와 실패 종료 코드를 확인하는 성공한 검증이다. 단위 테스트만으로 내린 판정이 아니라 실제 slang, Verilator와 VS Code 호스트 결과를 포함한다.

다만 사용자 실제 프로필의 물리 키/추천창 수용, 깨끗한 Windows 설치 흐름, 실제 대규모 설계와 다중 workspace는 완료로 판정하지 않는다. 아래 코드 검토 사항은 감사 당시 미해결이었으며 10-04 후속 보완에서 수정했다. 지원한 좁은 범위의 통과를 모든 SystemVerilog 문맥이나 최종 제품 완료로 확대하지 않는다.

## 이번에 새로 실행한 검증

| 영역 | 실제 결과 | 근거 |
|---|---|---|
| TypeScript / 개발 빌드 | 통과 | tsc --noEmit, scripts/build.mjs |
| 일반/adapter/host mock | 76 pass, fail/skip 0 | `.dev/recheck-unit.log` |
| 실제 slang | 11 pass, fail/skip 0 | `.dev/recheck-semantic.log` |
| 실제 Verilator 통합 | 10 pass, fail/skip 0 | `.dev/recheck-integration.log` |
| 실제 VS Code + Verilator | 전체 suite 통과, 실행 결과 7개 | `.dev/recheck-vscode.log`, run-SKYUOY receipt |
| 실제 CLI | check/개별/all 종료 0, 예상 실패 종료 1 | `.dev/recheck-cli.log` |

Verilator 통합은 package 자동 순서/병렬 격리, 두 예제 VCD, 선택 FST, 파형 비활성화, 컴파일 오류, assertion 실패, 파형 미생성, 실제 시뮬레이션 취소/시간 초과, 한글·공백 경로와 생성물 경계를 확인한다. 일반 process test는 취소 후 자식 프로세스 종료도 확인한다.

VS Code는 module/인자 필드, begin Tab/Enter/Undo, class/fork 선택과 탭·CRLF, closing label, enum case 생성, 미연결 포트 추천, 연결 신호 순위, 모듈/parameter/function/task 인자 안내, 미저장 package/scope/diagnostic, 언어 준비 상태, 계층/정적 diagram/소스 이동, 내장 VCD와 실행 UI를 확인한다. 실제 시뮬레이션 결과는 PASS 5개, 의도한 FAIL 1개, 취소 1개이며 전체 검증 receipt는 passed=true다.

CLI는 GUI 검증 프로젝트를 생성물 없이 격리 복사해 같은 두 top/테스트를 실행했다. 개별 1회 + 전체 2개가 PASS/VCD를 생성했고 의도한 fatal은 FAIL/종료 1이었다. 결과 모델의 name/top/status/waveform 의미가 GUI와 일치한다. 실행 ID/경로/시간/로그의 바이트 일치를 주장하지 않는다. 복사 프로젝트 최상위 파일은 `.gitignore`, `.rtl`, README, rtl, rtl.toml, tb이며 생성물이 밖으로 새지 않았다.

실제 VS Code receipt: `.dev/vscode-tests/run-SKYUOY/project/.rtl/extension-test.json`, passed=true, test process exit 0. CLI fixture: `.dev/recheck/CLI 한글 i0PVsu`. `.dev` 자료는 다른 PC에 없을 수 있으므로 재현 테스트와 제품 소스를 기준으로 인수한다. 임시 CLI 감사 도우미는 `.dev/recheck-cli.mjs`다.

## 10-03 코드 검토에서 찾은 보완 사항 — 당시 미수정, 10-04 보완 완료

| ID | 우선순위 | 문제와 근거 | 다음 조치 |
|---|---|---|---|
| AUD-CACHE-1 | 중간, 다음 기능 전 권장 | 한번 검증된 toolchain은 `extension.ts` ensureTools의 `if (verified) return verified`로 재사용된다. Choose Tool Storage Folder/Verify/Install 명령은 캐시를 지우지만 수동 `rtl.toolsDirectory` 설정 변경에는 실행 계층의 무효화 listener가 없다. semantic restart는 공유 toolsHome을 새 경로로 바꾼다. 따라서 표시/semantic 경로는 새 값인데 시뮬레이션은 이전 compiler/env를 사용할 수 있다. | 설정 변경 시 명시적으로 캐시 무효화; 진행 중 실행은 기존 snapshot 유지, 다음 실행부터 재검증. 설정 변경/거절/재실행 회귀 추가. |
| AUD-CLI-1 | 낮음 | `cli.ts:98`은 GTKWave가 없으면 파형을 열려면 viewer가 필요하다고 안내한다. 현재 IDE의 내장 VCD와 외부 FST를 구분하지 않아 오해를 줄 수 있다. | VCD 내장 열기와 FST 외부 viewer 필요성을 구분한 문구로 수정. |

위 두 항목은 코드 경로 검토에서 확인한 사항이다. 수동 설정 변경 후 실제 Windows compiler 교체와 GTKWave 없는 깨끗한 설치를 이번에 종단 재현하지는 않았다. 정상 설정의 전체 검증이 통과한 것과 이 결함 경로가 해결된 것은 별개다.

## 구현되었지만 지원 범위가 좁은 기능

- enum 생성은 단순 enum 신호의 빈 일반 case만 지원한다. 기존 항목 보충/복잡한 표현식은 제외한다.
- closing label과 class/fork 템플릿은 macro/기존 closer/복잡한 구문에서 보수적으로 생략한다. class 템플릿은 class semantic 기능이 아니다.
- 포트 연결 순위는 폭/부호/2·4-state 기반이며 전체 대입 호환성이나 output 쓰기 가능성을 판정하지 않는다.
- 내장 파형은 제한된 VCD 읽기이며 FST 내장/live trace는 미구현이다. 테스트별 저장 보기는 현재 프로필의 로컬 설정이다.
- C3는 빌드·실행을 하나의 상태로 보여주며 대상 선택을 재시작 후 저장하지 않는다. 최초 저장/대상 확인은 Stop 대상이 아니다.
- 실제 host 검증은 명령/API·데이터·editor lifecycle을 확인했다. 모든 파형 캔버스/색/커서/저장보기 버튼을 사람이 클릭한 시각 수용 검증은 아니며, 디자인의 직관성은 별도 실제 사용 평가가 필요하다.
- 구조 diagram은 정적 계층/연결과 검증된 보존 VCD 포트 관측값/공유 cursor A(D3B2)를 제공한다. 내부 신호 전체·클럭 재생·실제 step·MAC 연산 모델은 후속이며 A3/F 수용을 먼저 진행한다.

## 추천 실행 순서

1. AUD-CACHE-1/AUD-CLI-1 보완은 10-04 구현 및 회귀 검증했다. 상세 증거는 후속 verification 기록을 따른다.
2. 사용자의 실제 개발 프로필에서 A3 키 입력/팝업/선택 UI 수용을 확인한다. 자동 host API 통과를 대체 근거로 삼지 않는다.
3. D1/D2/D3B 첫 지원 범위 구현은 완료했다. 새 D4/E 기능 전에 A3/F 필수 안정화와 베타 준비 조건을 점검한다.
4. 큰 설계 응답성과 깨끗한 Windows 설치/거절/복구는 별도 수용 환경에서 검증한다. 배포 여부는 사용자가 결정한다.
