# 모듈 경계와 직접 신호 배선 첫 범위 — 2026-10-07

## 실제 구현

semantic hierarchy의 PortBinding에 compiler 내부 포트 선언 identity인 internalSignal과, 부모의 whole integral 선언에 직접 연결된 경우에만 directSignal을 추가했다. 출력 implicit assignment는 기존처럼 LHS를 사용한다. 같은 폭의 implicit conversion만 벗겨서 확인하며 폭 변환·명시적 cast·slice·연산·상수·interface·hierarchical expression은 직접 배선으로 추정하지 않는다. 문자열 이름/표현식 비교나 dotted path 분해로 net을 합치지 않는다. 기존 metadata 없는 hierarchy는 기존 연결도 fallback을 사용한다.

편집기 독립 buildScopeConnections가 현재 모듈 경계 포트와 immediate 자식 모듈(중간 generate/array만 통과)을 같은 compiler 선언으로 묶는다. 자식 내부는 방문하지 않는다. 경계 input/자식 output은 driver, 경계 output/자식 input은 sink다. 여러 driver, driver 없음, inout은 단일 방향 flow를 주장하지 않고 상세/이유로 남긴다. 최대64블록/512포트로 제한한다.

새 renderer는 module boundary·포트·자식 카드와 직교 배선을 그린다. 단일 visible driver가 있는 net의 fanout을 표시하며 topology에 따라 column을 배치한다. cycle은 같은 column으로 되돌리고 이유를 표시한다. clock/data 역할이나 physical 2×2 위치를 이름만으로 단정하지 않는다. module 카드의 기존 내부 진입/keyboard·source mapping·nonce·scope별 camera·recorded port values 계약을 재사용한다.

**이 첫 범위는 모듈 간 직접 배선이다. 부모 자체의 continuous assign/연산/저장소를 함께 나타내는 모델은 아직 없다.** 화면에도 이 제한을 안내한다. constants/slices/operators는 기존 포트 상세에 남으며, 모든 회로가 그려졌다고 주장하지 않는다. 단일 driver가 보이지 않는 내부 신호도 임의 값을 생성하지 않는다. 내부 연산은 기존 leaf 전용 화면에서 확인한다. 연속적인 계층 확대는 미구현이다.

## 새 예제

examples/systolic-mini에는 4개 mac_pe의 weight register와 두 accumulation chain이 있다. PE마다 weight를 저장하고 data×weight+acc_in을 조합 연산한다. 작은 weight-stationary connectivity fixture이며 streaming/pipelined systolic array 전체 구현이 아니다. input skewer/output harvester도 아직 없다. topology column 배치가 도식의 2×2 물리 배치와 일치한다고 보장하지 않는다.

Structure → Update → matrix_basic → matrix_tb.dut에서 부모 배선을 확인하고 각 PE로 내부 진입할 수 있다. 원래 examples/counter는 변경하지 않았다. 테스트/개발 사본과 결과는 .dev/ 아래, 프로젝트 생성물은 .rtl/ 아래에 둔다.

## 검증 근거

- 새 model/renderer 단위 시험: exact identity/fanout·자식 내부 비노출·expression 비추정·multiple driver/inout·cycle 종료·stale 키보드·limit·escaping. 관련 structure-view 포함 초기13 PASS. 최초 type 검사에서 시험 SignalType.text 누락을 보완했다.
- 실제 slang hierarchy 시험은 direct/internal signal identity와 slice/constant 비배선, 기존 parameter/generate/instance array/interface/overlay 경계를 확인했다.
- .dev/scope-connections-native-complete.log **2 PASS/0 FAIL/0 SKIP**, .dev/scope-connections/한글 matrix sVsmRu/.rtl/scope-receipt.json passed=true. 실제2×2 fixture의4블록/12nets/20wires, partial0의pe00→pe10, 표현식 overlay 격리, child PE의 multiplication graph supported, Verilator simulation PASS를 확인했다.
- Core로 검증된 retained 입력을 다시 분석하고 verified VCD와 매핑하여 y0/y1의5ns(-7,-25)·7ns(-2,58) 네 값을 확인했다. testbench 자체 assertion도 두 signed 입력 조합을 검사한다.
- 실제 mouse/canvas 가독성·브라우저 paint·통합 module 진입/Back/Up의 새 레이아웃 물리 입력 검증은 아직 하지 않았다. native SVG serialization 검증과 GUI 수용을 구분한다.

초기 .dev/scope-connections-native.log는 새 RTL의 timescale 누락으로 분석 실패했다. timeunit/precision을 명시했다. native-final.log는 시험의 포트 수20 기대가 틀려 실패했으며 실제24개(child당6개)로 수정했다. native-verified.log에서는 TB의 첫 y0 기대값-13이 산술적으로 잘못돼 FAIL했고 -7로 수정한 뒤 assertion/파형 비교를 통과했다. 중간 accepted.log의2 PASS 뒤 retained 파형 비교를 추가해 native-complete.log를 최종 근거로 사용한다. 실패 기록을 지우지 않는다.

최종 전체 순차 회귀 .dev/scope-connections-full.log **205 PASS/0 FAIL/0 SKIP**, 타입 검사 .dev/scope-connections-final-types.log 및 개발 build .dev/scope-connections-final-build.log exit0. 새 VSIX/ZIP 생성·설치를 하지 않았다. 기존40ms 취소 시험의 병행 부하 timing 제한은 이번 순차 통과로 해결됐다고 하지 않는다.

## 다음 실행 순서

1. 자식 경계가 있는 module의 자체 assign/연산/register 추출과 net 모델을 결합한다. 현재 leaf allowlist의 child/generate 거부를 단순 삭제해서 의미를 오인하지 않는다. 미지원 부분을 명시하고 driver/clock/NBA·폭/부호 경계를 유지한다.
2. module boundary/연산/저장소를 함께 배치하고 constants/선택/변환의 기본 표시 정책, fanout/교차 wire와 large canvas 중심 화면을 다듬는다.
3. 2×2 fixture의 실제 UI 탐색/Update/복구와 4×4 확장, E4B 물리 입력/접근성·browser 비용·취소/복구를 검증한다. 미래 continuous hierarchical zoom과 H/I 사용자 논의는 별도 단계로 남긴다.
