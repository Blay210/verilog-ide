# 모듈 중심 RTL 구조도 방향 — 2026-10-07

## 사용자 그림으로 명확해진 요구

기준은 사용자 제공 4×4 WS Systolic Array / mac_pe 그림이다. 현재 그래프의 검증 통과를 이 목표 화면의 완성으로 해석하지 않는다.

- 프로젝트 hierarchy에서 현재 모듈 인스턴스를 고르면 그 모듈의 RTL 구조를 중앙 canvas에 표시한다.
- systolic_array에서는 input_skewer, output_harvester, mac_pe 16개를 포트가 있는 블록으로 표시한다. 현재 모듈이 정의한 배선·연산·저장소와 입출력도 함께 보여준다. 자식의 내부 구현은 이 단계에서 펼치지 않는다.
- 특정 mac_pe 인스턴스로 들어가면 그 인스턴스의 parameter가 적용된 포트, 곱셈·덧셈·레지스터/저장 값과 연결을 보여준다. 다른 수준의 상세를 한 화면에 무조건 펼치지 않는다.
- 그림은 RTL의 의미와 데이터 흐름을 이해하기 위한 읽기 전용 구조도다. synthesis 결과의 기술 셀/최적화된 gate netlist를 요구하는 것으로 해석하지 않는다. 레지스터와 단순 신호선, 계산 결과와 실제 저장값을 구분한다.
- 별도 Structure 작업 공간을 원한다. 후속 사용자 답변으로 진입점을 확정했다: Simulation처럼 가장 왼쪽 Activity Bar에 전용 아이콘을 두고, 아이콘을 누르면 왼쪽 RTL Hierarchy와 중앙 구조도 canvas를 함께 사용하는 그림의 화면으로 들어간다. 중앙 editor 탭만 추가하는 요구가 아니다. 자유 pan/zoom과 hierarchy 탐색을 유지한다. 자식 모듈 선택/내부 진입과 소스 열기 동작이 혼동되지 않아야 한다.
- 최종적으로 블록 확대가 임계점을 넘으면 내부 구조가 나타나는 연속적인 계층 확대를 원한다. 단순히 현재 화면을 크게 만드는 기능과 다르며 미구현이다.
- 코드 편집마다 구조도를 자동 재분석/재배치하지 않는다. 사용자가 구조도에서 Update할 때 갱신한다. 편집 시 변경됨 표시는 가능하되 마지막 분석 화면과 그 문맥을 유지한다.
- 구조 관찰은 시뮬레이션 없이도 가능해야 한다. 기록된 실행값은 별도 문맥으로 연결하고, 현재 코드로 Update한 구조에 과거 trace를 임의로 붙이지 않는다.

## 현재 구현과의 차이

후속 블록 우회/기록 디버깅 재검증(2026-10-08): bounds 기반 빈 통로 routing과 다른 net 공선 겹침 검사, T 접속점/비접속 crossing gap, 불완전 표시 안내를 추가했다. 실제2×2/MAC 화면 및 recorded MAC3종의117기대값·모든 route·clock/wave/source host API를 확인했다. [실패·보완·검증과 남은 E4](schematic-routing-acceptance.md).4×4/조밀한 표시·실제 디버깅 왕복과 접근성·성능/복구 수용은 남아 있다.

후속 모듈 경계/배선 분기(2026-10-08): exact compiler declaration/폭 기반 왼쪽 입력·오른쪽 출력과 외곽선, source별 spine/fanout junction을 적용했다. 실제2×2의10포트/4PE·100%/pan/Fit·PE00 내부/부모 복귀를 확인했다. [215 회귀 PASS와 물리 검증 범위](schematic-boundary-acceptance.md). 카드 우회·다른 net 교차 표시·4×4·E4B 접근성/복구는 아직 남는다.

후속 심볼 첫 개선(2026-10-08): 부모 결합/leaf Schematic에서 +/×·MUX·Register/클럭 단자와 분리 operand 접점, 종류별 폭을 적용했다. 변환·타입·관측 identity를 유지한다. [213 회귀 PASS·actual host 근거와 미완료](schematic-symbol-acceptance.md). 모듈 외곽/상위 포트·fanout/교차선·실제 화면 가독성·4×4 수용은 다음이며 최종 schematic 완료가 아니다.

후속 첫 구현: Activity Bar의 Structure 아이콘/Hierarchy 이동·canvas 진입·Update/변경 표시·편집 후 이전 static graph 유지·재진입을 구현했다. [실제 host 검증과 제한](structure-workspace-acceptance.md)을 따른다. 아래 나머지 scope 결합/배치/계층 확대 요구는 여전히 남아 있다.

후속 배선 첫 범위: compiler whole-signal identity 기반 module 경계/자식 블록/net 모델과 topology column/직교 배선을 구현했다. [2×2 실제 semantic·simulation 검증과 미완료](scope-connections-acceptance.md). 부모 자체의 연산/저장소 결합은 아직 미구현이며 diagram 전체 완료로 표시하지 않는다.

후속 결합 첫 범위: 직접 child instance를 opaque port card로 묶고 부모 자체 assign/operator/register와 연결하는 scopeOperations 및 Show module logic을 구현했다. [native/actual host 검증·제한](scope-operations-acceptance.md). generate/array와 기본 화면 정책·간결한 회로 표현·물리 UI 수용은 남아 있다. 위 배선 단계의 미구현 문구는 당시 기록이다.

후속 기본 화면: module 선택/Update는 선택한 Display(Schematic 기본)로 분석하며, 미지원은 이유와 connection fallback을 제공한다. current static graph 재열기와 표시 모드 유지, canvas 아래 접힌 Details를 추가했다. [새 흐름 검증·잔여](structure-default-view-acceptance.md). 위 기본 화면 미구현 문구는 당시 기록이며 간결한 schematic 표현·물리 UI/기타 지원 경계는 유지한다.

| 요구 | 현재 근거 | 남은 차이 |
|---|---|---|
| 모듈 hierarchy/내부 진입 | elaborated hierarchy, Back/Up, 인스턴스별 parameter와 연결도 구현 | 공간 배치와 블록 간 실제 net 중심 표현 개선 |
| 현재 모듈의 배선+자식 블록+자체 연산/저장소 | port 연결도와 E1/E2 leaf 내부 연산 화면을 분리해 구현 | 하나의 scope 모델/화면으로 결합; 자식이 있는 모듈의 연산 추출은 현재 allowlist 밖 |
| 회로/아키텍처 형태의 간결한 표현 | compiler signal/operator/conversion/register 그래프 | compiler 세부 노드를 기본 화면에 모두 노출하지 않는 표시 정책, fanout/net/포트·배선 경로, feedback 명확화 |
| 반복 인스턴스 구조 | generate/instance hierarchy 기반 있음 | 배열/반복 그룹과 grid 등 배치 규칙 및 사용자가 바꿀 수 있는 배치 범위 미정 |
| 전용 작업 공간/수동 Update | 기존 구조 webview와 무효화/문맥 구분 기반 | 전용 진입점, 큰 canvas 중심 구성, 명시적 갱신 정책 수용 필요 |
| 확대에 따른 자식 내부 펼침 | pan/zoom/Fit/100% 구현 | 계층별 상세 수준, 내부 경계 포트 연결, 카메라 연속성과 렌더 비용 미구현 |

기존 E4A는 실제 가독성과 native graph 규모에 대한 검증이다. E0–E3의 의미/값 정확성 근거도 보존한다. 이 요구에 맞는 시각적 제품 수용은 아직 끝나지 않았다. 기존 구조도나 E4A를 최종 schematic 완료로 표시하지 않는다.

## 제안하는 다음 실행 순서

이 순서는 이번 대화에서 구체화한 제안이며 구현 완료/사용자 세부 사양 확정이 아니다. E4B의 기존 정확성·접근성·복구 검증을 유지하되, 기존 화면의 외형만 검증하고 목표 달성을 선언하지 않는다. H0 전에 구조도 방향과 남은 범위를 함께 판단한다.

1. 전용 작업 공간과 수동 Update의 화면/상태 계약을 정한다. 마지막 분석 문맥, 변경 표시, 분석 중/취소/실패 후 기존 화면, 현재/기록 모드 구분을 포함한다. 포트와 자식 블록이 잘 보이는 작은 fixture부터 확인한다.
2. 현재 모듈 경계 포트, 자식 인스턴스의 경계 포트, net 연결, 모듈 자체의 연산/저장소를 편집기 독립 scope 모델로 결합한다. 자식 내부를 펼치지 않고 지원하지 않는 부분은 이유를 표시한다. 기존 leaf·trace 검증을 유지한다.
3. port 위치, 직교 배선/fanout, 연산 심볼과 레지스터, 정보 상세 수준을 개선한다. compiler conversion을 숨기더라도 계산 폭/부호/잘림의 의미를 보존한다. 단순 assign은 배선으로 표현할 수 있으나 상태·latency를 없애지 않는다.
4. 2×2 → 4×4 systolic fixture에서 반복 인스턴스·배선·개별 PE 진입·돌아오기·소스 이동·수동 갱신·취소/복구와 성능을 확인한다. 소스에서 정확히 도출할 수 없는 grid 방향이나 data/clock 역할을 이름만으로 확정하지 않는다. 배치 힌트/수동 배치 여부는 별도 결정한다.
5. 기본 module 경계와 탐색이 안정된 뒤 연속적인 계층 확대를 별도 작업으로 구현한다. 여러 상세 수준의 지연 로딩, 경계 연결, 펼침/접힘 임계값의 진동 방지, Back/Up와 키보드 대안을 포함한다.

지금 자체 synthesis/compiler 구현이나 Code-OSS fork를 시작할 이유는 없다. semantic 추출/관측값/renderer의 분리를 유지한다. 내부 표현과 레이아웃의 변경은 VS Code webview에서 시작할 수 있다.

## 확정된 진입점 / 확인 대기

- 전용 진입점 확정: 가장 왼쪽 Activity Bar 아이콘 → RTL Hierarchy + 중앙 구조도 작업 화면. 아이콘 진입으로 구조도도 열거나 기존 화면을 다시 보여주는 흐름이며, hierarchy만 연 뒤 추가 명령을 요구하는 흐름으로 설계하지 않는다. 이는 UI 요구 확정이며 구현 완료는 아니다.
- Update 입력: 미저장 editor overlay도 반영할지, 저장된 파일만 반영할지 질문했다. 답변 전 첫 구현은 기존 overlay 포함 동작을 유지하고 화면에 안내한다. 새 사용자 합의로 간주하지 않는다. 자동 분석 금지는 사용자 요구이며 두 선택 모두 이를 지킨다.
- 그림의 4×4 배치가 모든 코드에서 완전 자동 추론되는 것은 아니다. 반복 hierarchy/연결을 기반으로 한 자동 배치를 먼저 제안하며 세부 grid/배치 편집은 아직 합의하지 않았다.
- 연속 확대는 최종 요구로 기록하되 첫 재설계의 필수 구현으로 섞지 않는다. 우선 명시적 내부 진입으로 수준별 의미/배선을 검증한다.

최초 요구 명확화 작업은 문서화만 수행했고 당시 200 PASS는 E4A 근거였다. 후속 Structure 작업 공간 구현과 새 검증은 [별도 수용 기록](structure-workspace-acceptance.md)을 따른다. 신규 배포 패키징은 하지 않았다.
