> 후속 E2에서 recorded 내부 named signal 관측과 공유 시각 toolbar를 추가했다. 아래 미구현/toolbar 숨김은 E1 완료 당시 상태다. 현재 상태는 [E2](internal-operations-e2.md)를 따른다.

# E1 — 제한된 정적 내부 연산 그래프

기준일: 2026-10-07. [전환 전 로드맵](pre-ide-roadmap.md)의 첫 제품 그래프 범위다. 개발 호스트에만 반영하며 VSIX 0.3.1/ZIP은 재생성·설치하지 않는다. E2 내부 관측값과 D4 clock replay는 아직 없다.

## 구현 범위와 사용 흐름

기존 구조 창에서 모듈 내부로 이동한 뒤 **Internal operations** 버튼을 누른다. 그래프 노드를 클릭하면 해당 선언/연산의 소스로 이동한다. **Port connections**로 기존 포트 연결 보기로 돌아간다. 기존 pan/zoom/Fit을 재사용하며 포트/연산 보기의 camera를 구분한다.

첫 범위는 leaf module의 simple integral input/output·wire/variable, 정수 상수, Add/Multiply/concat/고정 literal range select/조건식/형 변환, single posedge always_ff의 plain NBA와 if/else·동기 reset/enable이다. register는 next-state 입력과 state-output 피드백을 구분하며 hold를 명시한다. 순차 if와 조합 ?:를 다른 노드로 표시한다. 계산값을 직접 평가하지 않는다.

연산·조건·다음 상태는 compiler AST/type에서 추출한다. 폭/부호/4-state와 implicit conversion을 보존한다. net initializer는 연속 대입으로 다루며 variable startup·port default는 첫 범위에서 제외한다. 동일 모듈의 parameter별 인스턴스가 독립된 모델을 갖는다. MAC의 정적 Multiply/상태 관계도 추출되지만 pipeline MAC 전체 시각 디버깅 E3 완료가 아니다.

**합성 netlist나 실제 simulator stepping이 아니다.** 노드/선택지·조건·state 관계를 보여주며 최적화된 물리 회로를 보장하지 않는다. 내부 파형값과 인과적인 전파 animation은 표시하지 않는다. 내부 연산 보기에서는 기존 포트 관측값 toolbar도 숨겨 혼동을 줄인다.

## 정확성 경계

- 지원하지 않는 식/문장/member, async reset/always_comb, negedge/복수 clock/iff, inout/ref, input 쓰기, 부분 대입, delay/drive strength/resolved net, unique/priority/pattern, 다중 writer·같은 블록 반복 NBA는 전체 선택 모듈을 unsupported로 표시한다.
- generate/array/자식 인스턴스를 포함한 scope는 leaf module을 선택하도록 안내한다. 일반 expression parameter reference/class/task/function/복잡한 aggregate·loop는 첫 범위 밖이다. 기존 hierarchy 탐색은 유지한다.
- 연속 대입 dependency에 순환이 있으면 그래프를 거부한다. register state-output은 조합 순환과 별도 경계다. 일부만 만든 graph를 완전한 모델로 반환하지 않는다.
- 직접 member512/node256/edge1024/식·문장 depth64/신호 폭16384bit 제한, 기존 shared semantic15초 timeout·취소·package source order·overlay를 재사용한다.
- source point는 compiler의 원본 위치(UTF-16)다. HTML에는 파일 경로 대신 host가 관리하는 source ID만 넣고 내용을 escape/CSP로 보호한다. 기존 snapshot nonce/stale/generation 및 별도 operation job/abort로 이전 scope·닫힌 창의 늦은 결과를 버린다.
- current는 미저장 RTL overlay를 포함한다. recorded는 Core가 검증한 실행 입력으로 분석하고 분석 뒤 다시 검증하며 소스는 기존 readonly recorded document로 연다. 현재 소스와 기록값을 섞지 않는다.

graph schema version1과 type 모델/SlangProvider는 editor API를 참조하지 않는다. graph는 현재 분석 요청의 임시 결과이며 host의 current/recorded/test/run 문맥에 귀속한다. 기록 파일로 저장하거나 예전 run에 새 graph를 자동 부착하지 않는다. E2 매핑은 segmented hierarchy/source identity를 확인하는 별도 단계이며 `signalPath` 문자열을 점으로 나누어 관측값에 연결하면 안 된다.

## 코드와 빌드

- semantic `internal-operations.ts`: graph/node/edge 계약. optional SemanticProvider 기능과 SlangProvider의 공통 structure query 경로.
- Python `internal_operations.py`: AST allowlist/변환·writer/cycle/한도 검사. analyze.py의 명시적 internalOperations 요청으로만 호출한다. -I 환경에서도 배포 bridge 폴더의 이 helper만 import하도록 경로를 지정한다.
- VS Code `internal-operations-view.ts`, `structure-view.ts`/`structure.ts`: 읽기 전용 레이어 배치, graph/포트 전환, source ID 및 취소·stale 경계. source 이동은 기존 host 검증 경로를 재사용한다.
- `scripts/build.mjs`는 helper를 extension/CLI dist에 함께 복사한다. 미래 package script도 CLI helper를 포함하지만 이번 작업에서는 package를 실행하지 않는다. 임의 사용자 Python hook은 실행하지 않는다.

## 검증과 발견 문제

실제 compiler 시험에서 counter의 두 reset/enable control·hold·clock·state 경계, adder의9bit 합/8bit select, 두 MAC 폭/형 변환/소스 위치를 대조했다. 미지원 구문은 빈 nodes/edges와 이유를 반환하는지 검사한다. 미저장 overlay/취소·cache 정리 및 기존 hierarchy/semantic fixture도 확인한다.

초기 graph native 시험은 포트 초기값이 PortSymbol에 있고 internal VariableSymbol에는 없는 것을 놓쳐11 PASS/1 FAIL이었다. PortSymbol 초기값도 차단한 뒤 통과했다. 명시적 drive strength는 pyslang 바인딩의 enum 반환 TypeError가 발생하여 이 경우도 unsupported로 반환하도록 보완했다.

개발 host 초기 두 실행은 새 시험의 webview type 식별/Windows drive letter 대소문자 비교 때문에 실패했다. 창의 실제 tab label과 Windows 경로 동등성으로 시험을 수정했다. 이후 API 기반 실제 host에서 current counter/adder graph·소스 이동·scope 복귀·unsupported·미저장 무효화/refresh·Verilator PASS·보존 graph/readonly source 경로를 확인했다. 실제 물리 클릭/화면 가독성·layout 시각 수용과는 구분한다. 개발 host 로그의 CodeWindow load -3 경고는 assertion 성공과 별도 관측이며 전체 UI 무결함으로 판단하지 않는다.

최종 전체 자동 회귀 **186 PASS / 0 FAIL / 0 SKIP** (`.dev/e1-full-regression.log`), 실제 semantic/graph·기존 hierarchy/semantic **20 PASS / 0 FAIL / 0 SKIP** (`.dev/e1-semantic-final.log`), 타입 검사/개발 build 통과. native20개 중 graph17개이며 view2개는 전체186개에 포함된다. E0 결과/중간 집중 시험과 합쳐 전체 개수를 부풀리지 않는다.

최종 현재 코드의 개발 호스트는 `.dev/e1-host-verified.log`, 해당 `run-*/project/.rtl/e1-host.json` passed=true, `RTL_E1_HOST_PASS`와 host/runner exit0으로 확인했다. current/recorded graph·source·unsaved invalidation·unsupported·simulation PASS를 검사했다. 시험은 실제 extension host API를 사용하며 실제 버튼 mouse 클릭/graph 레이아웃 시각 수용/물리 pan·zoom을 완료한 것은 아니다. helper가 개발 dist로 복사된 SHA256과 기존0.3.1 VSIX/ZIP의 원래 SHA256 유지도 확인했다.

## 다음 작업

E2에서 이 **보존 입력 graph의 named internal signal**과 검증 trace를 segmented instance/reference/폭으로 연결한다. no dump/missing/ambiguous/width mismatch/unsupported는 값을 추측하지 않는다. 동시각 최종 VCD 값·run/input/trace identity·늦은 응답과 invalidation을 지킨다. E4에서 추가 레이아웃·물리 조작·대표 graph 규모를 수용하고, H/I 착수 전에 사용자와 별도 아이디어 논의 원칙을 유지한다.
