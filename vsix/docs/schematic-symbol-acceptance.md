# Schematic 심볼 첫 개선 — 2026-10-08

## 구현

- Schematic에서 부모 결합 그래프와 leaf 그래프가 같은 심볼을 사용한다. Detailed leaf logic은 기존 상세 검사 화면을 유지한다.
- 덧셈/곱셈은 원형 +/×, 선택 논리는 MUX 사다리꼴, 레지스터는 이름과 Register·D→Q 및 클럭 단자로 구별한다. 신호·상수·변환·slice는 별도 표기를 유지한다.
- implicit conversion/cast를 삭제하거나 계산하지 않는다. 모든 compiler node/type/source, named signal 관측 identity, child opaque 경계를 보존한다.
- 여러 operand 입력은 서로 다른 접점으로 들어가고 클럭은 아래 단자로 들어간다. 역할 tooltip과 state-output/clock 점선은 유지한다. 클럭 선은 상승/하강 의미를 기존 edge role에서 확인할 수 있다.
- 고정 220px 카드 대신 종류별 폭을 사용하고 column 간격을 해당 column의 가장 넓은 노드에 맞춘다. topology/feedback 정책 자체는 바꾸지 않는다.

## 검증 근거

- 관련 renderer 8 PASS. 신규 2개 시험은 심볼/escape/노드 보존/분리 접점/클럭 진입, leaf 모드 선택과 named signal 관측 범위를 검사한다.
- 전체 순차 회귀 213 PASS/0 FAIL/0 SKIP (`.dev/schematic-symbol-full-verified.log`), 타입 검사/개발 build exit0.
- 실제 격리 VS Code `.dev/schematic-symbol-host.log` exit0, `.dev/structure-workspace/run-iRLRYg/project/.rtl/structure-workspace-host.json` passed=true. 분석 없는 진입·수동 Update·미저장 RTL·모드 유지·graph 재열기 경계 통과. 이 API 검증은 새 심볼의 물리 화면 가독성 수용을 대신하지 않는다.
- 최초 제한 환경 전체 시험 `.dev/schematic-symbol-full.log`는 local HTTP download retry 실패 뒤 진행 대기로 종료1. 해당 실행은 통과로 계산하지 않는다. 로컬 서버 접근이 가능한 환경에서 전체 재실행했고 download retry도 통과했다. 제품 다운로드 코드는 변경하지 않았다.

## 남은 범위 / 다음 실행

현재는 심볼 구분의 첫 개선이다. 모듈 외곽/상위 입출력 단자 배치, fanout junction/교차선·겹침, reset/enable/control 입력의 공간 분리, 물리 화면 가독성은 완료가 아니다. compiler graph를 단순화하는 재작성·합성·연산값 계산은 하지 않았다. generate/array 및 연속 계층 확대 제한도 유지한다.

다음은 실제 2×2/leaf MAC 화면을 확인하면서 모듈 경계와 배선 가독성을 개선하고 4×4와 E4B 물리 왕복·접근성·성능·취소/복구 수용을 진행한다. 독립 IDE/자체 엔진은 H0 별도 사용자 논의 이후다. 사용자 counter, 기존 배포물은 수정하지 않았고 새 VSIX 제작/설치는 하지 않았다.
