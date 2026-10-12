# E2 — 기록된 내부 신호 관측값 (2026-10-07)

## 구현과 사용 흐름

개발 호스트에서 시뮬레이션 결과의 Explore Recorded Structure → leaf module → Internal operations를 열면 이름 있는 신호에 기록된 값이 표시된다. Time/Go와 Open linked waveform을 재사용하며 양쪽 커서는 같은 실행의 시각을 공유한다. Current design에는 과거 기록값을 붙이지 않는다. 기존 0.3.1 VSIX/ZIP에는 E1/E2가 없고 이번에 재패키징하지 않았다.

compiler의 실제 선언 이름 signalName과 보존된 hierarchy의 instancePath 배열을 연결한다. signalPath는 표시 전용이다. 점으로 경로를 나누거나 모듈/신호 이름의 suffix로 찾지 않는다. waveform의 mapTraceInternalSignals는 기존 정확한 포트 매핑의 TOP wrapper·폭·alias·중복 경로/채널 검사를 재사용한다. hierarchy와 graph의 selected instance도 확인한다. mapper는 인증 기능이 아니며 Core의 보존 입력/trace 검증과 SHA 검증 worker, host의 같은 run 문맥이 먼저 필요하다.

signal 노드만 값 조회 대상이다. operator/conversion/select/control와 register next-state에는 계산값을 만들지 않는다. 실제 이름 있는 register 현재 상태 신호는 관측할 수 있다. Not recorded / Ambiguous path / Width mismatch / Unsupported type / Unavailable을 구분하고 raw X/Z를 유지한다. 값은 hex로 표시하며 raw 값은 tooltip에 보존한다. 긴 값은 화면에서 줄일 수 있다.

한 시각의 최종 VCD 기록값이며 delta-cycle/NBA sampling 직전·직후나 인과적 전파를 복원하지 않는다. live simulator stepping이나 자체 simulator가 아니다. 지원 RTL AST 부분집합과 그래프 한도는 [E1](internal-operations-e1.md)을 그대로 따른다. 내부 FST 관측은 이번 범위 밖이다.

## 수명과 정확성

기존 shared reader/커서와 최대32신호 query batch를 사용한다. page nonce/generation/value job/trace revision/reader identity가 달라지면 늦은 결과를 폐기한다. scope 전환·창 닫기·새 분석은 내부 binding과 이전 관측값을 비운다. 분석 결과의 instanceId가 선택한 instance와 다르면 표시를 거부한다. 기록된 입력으로 분석한 뒤 입력을 다시 검증하며 소스 이동은 readonly recorded 문서를 사용한다.

파형 손상은 값과 커서 조작을 막고 검증된 정적 그래프는 유지한다. 원본 bytes 복구 후 Refresh → Internal operations로 다시 연결한다. 현재 RTL 수정은 retained graph/value에 섞이지 않는다. 과거 run의 graph를 파일로 저장하는 기능은 아직 없으며 요청 시 검증된 retained 입력에서 다시 추출한다. 입력/trace identity가 없는 legacy 결과에는 값을 연결하지 않는다.

## 실제 검증

- 전체 회귀: 최종 .dev/e2-full-final.log, 191 PASS / 0 FAIL / 0 SKIP. 타입 검사 exit0, 개발 build exit0.
- native semantic: .dev/e2-semantic.log, 20 PASS / 0 FAIL / 0 SKIP. compiler signalName·기존 graph/폭·semantic/hierarchy 회귀 확인.
- 실제 개발 VS Code/Verilator: .dev/e1-host/run-H5FiNt/project/.rtl/e1-host.json passed=true, .dev/e2-host-final.log RTL_E2_HOST_PASS, host/runner exit0. 현재/보존 graph·readonly source·미저장 수정 무효화·시뮬레이션 PASS를 재확인했다.
- 같은 모듈의 mac8/mac4에서 26ns product/acc=21, 56ns stage=-6/acc=36을 각각16/8bit raw 값과 대조했다. 양방향 파형 cursor, 구조 창 닫기/재열기 및 파형 peer 유지, 현재 RTL을 invalid 코드로 교체했을 때 보존 값 유지, trace 손상 차단·복구를 실제 host에서 확인했다.
- host 자동 검사: 다른 run/이전 page/cursor 응답·닫힌 창 늦은 응답 배제, 외부 instance graph 거부·scope 변경 중 늦은 graph 폐기, X/Z·누락/모호/폭/미지원 채널 조회 차단. pure mapper는 TOP/alias/동일 모듈·escaped dot segmented identity를 확인한다.
- 원래0.3.1 VSIX/ZIP SHA256 유지. 사용자 examples/counter 수정 없음. 생성물은 .dev/ 또는 fixture 프로젝트 .rtl/ 아래다.

초기 host run-rj6jVa는 값·손상 복구까지 통과했고 최종 run-H5FiNt는 닫기/재열기까지 추가했다. host mock 확장 초기2 FAIL은 mock의 loadRecordedInputs에 target이 없어서 발생했다. 실제 Core 반환 형태를 mock에 반영한 뒤 관련9 PASS와 전체 회귀를 통과했다. native 시작 로그의 mutex already exists/초기 window load 경고는 보존하며, receipt와 exit0는 API 기반 개발 호스트 수용이다. 물리 클릭/픽셀 가독성 수용을 주장하지 않는다.

## 다음 담당자

다음은 [사전 IDE 로드맵](pre-ide-roadmap.md)의 **D4 선택 clock/edge 기록 탐색**이다. 기존 waveform query/worker에 bounded 이전·다음 strict edge 조회를 추가하는 방향을 검토하고 clock을 사용자에게 명시적으로 선택하게 한다. 0→1/1→0만 첫 edge 정책으로 삼고 X/Z는 edge로 세지 않는다. 기록 시각 최종값 탐색임을 표시한다. 첫/끝·clock 없음/복수·큰 정수 시각·취소/늦은 응답을 검증한다.

E3 MAC 전체 예제/reference 수용, E4 실제 graph 조작·가독성/대표 규모·복구 검증, 깨끗한 Windows/사용자 설계/장시간/일부 프로필 잔여는 계속 열려 있다. H0/H/I는 합의한 시점에 사용자와 아이디어를 논의한 뒤 별도 계획을 확정한다.
