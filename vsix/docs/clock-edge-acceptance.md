# D4 — 선택 클럭의 기록된 에지 탐색 (2026-10-07)

## 기능과 사용 흐름

개발 호스트에서 시뮬레이션 결과의 Explore Recorded Structure를 연 뒤 Choose clock…에서 기록된 1bit 신호를 직접 선택한다. Edge를 Rising/Falling으로 선택하고 Previous edge / Next edge를 누르면 같은 실행의 공유 커서가 이동한다. 포트 보기와 Internal operations에서 모두 사용할 수 있다. 신호 이름으로 clock을 자동 확정하지 않는다. 여러 clock이 있어도 하나만 기준으로 선택한다. 새 실행/Refresh/창 재열기에서는 clock을 다시 선택한다.

찾는 에지는 **현재 시각보다 엄격히 이전/이후인 0→1 또는 1→0**이다. 초기 dump와 X/Z 포함 전이는 세지 않는다. 같은 시각의 여러 VCD 변화는 parser가 보존한 최종값 기준이며 delta-cycle/NBA를 복원하지 않는다. 화면은 Final recorded values at that time을 명시한다. 실제 simulator pause/step/실시간 전파 animation은 없다. 표준 SystemVerilog event-control의 전체 posedge/negedge 정의와도 구분한다.

에지가 없으면 알림을 표시하고 시각을 유지한다. one-bit integral trace 신호가 없으면 dump 후 재실행을 안내한다. bus/real/미지의 signal과 잘못된 요청은 거부한다. signed/parameter 내부값 지원 범위는 기존 [E1](internal-operations-e1.md)/[E2](internal-operations-e2.md)를 따른다. 큰 정수 시각을 decimal string/BigInt로 유지한다.

## 실행 계층과 수명

waveform의 editor-independent queryClockEdge/ClockEdgeRequest/ClockEdgePage와 worker/client 경로를 추가했다. 기존 nearest/adjacentChange 파형 동작은 바꾸지 않았다. 한 query는 최대4096개 channel 기록을 확인하며 continuation index만 반환한다. 전체 channel을 host/UI로 보내거나 별도 큰 edge index를 만들지 않는다. 기존 VCD32MiB/10000신호/100만change 한도 안에서 동작한다.

host는 페이지 사이에서 취소·generation/page/reader/cursor revision과 검증 상태를 확인한다. 동시에 새 탐색·scope 전환·창 닫기·run 교체가 일어나면 오래된 결과로 시각을 움직이지 않는다. 사용자 Cancel과15초 제한을 지원하고 제한 초과는 안내한다. 진행 중인 한 bounded worker query는 완료 후 폐기할 수 있으며 공유 reader를 강제로 종료해 peer를 손상시키지 않는다. 시뮬레이터 subprocess를 시작하는 작업이 아니다.

시간 이동은 Core/worker가 검증한 동일 retained run의 reader.set을 사용한다. 선택 clock과 edge는 현재 host의 임시 상태이며 파일에 저장하지 않는다. 기록 입력/파형 무효화 시 기존 값·시간·clock 버튼이 차단된다. 현재 소스에 과거 값을 붙이지 않는다. 물리 UI 가독성/키·마우스 수용은 E4에 남는다.

## 검증 근거

- 전체 .dev/d4-full-regression.log: **198 PASS / 0 FAIL / 0 SKIP**, 타입 검사 exit0, 개발 build exit0.
- query/실제 worker5 PASS: initial/XZ/current tick 제외, 양방향 rising/falling/alias·bus/real/invalid 요청, zero duration, 2^53보다 큰 시간, 같은 tick 최종값, 9000개 이상 기록의3페이지 탐색과 역방향 continuation, 검증 bytes 및 worker 종료.
- 구조 host/renderer 포함 관련24 PASS. 명시적 선택/복수clock 전환/clock 없음, 페이지와 run 격리, Cancel/닫기/시각 변경 뒤 늦은 응답 폐기, timeout callback으로 제한 안내·cursor 유지, 실제 webview script의 Edge 값/버튼/nonce 전달 확인. timeout은 결정적 mock callback 검증이며15초 실제 wall-time 지연이나 물리 Cancel 클릭 수용은 아니다.
- 실제 개발 VS Code/Verilator 최종 .dev/e1-host/run-5Xkabh: .rtl/d4-host.json passed=true, .dev/d4-host-verified.log RTL_D4_HOST_PASS, host/runner exit0. MAC4의56→55→45→55ns rising,50ns falling, 첫/마지막 edge 없음/시각 유지,0→5ns 이동을 확인했다.45ns acc=42와55ns stage=-6 raw 값을 대조하고 복구 뒤 다시 연 verified 파형의 cursor가55ns/5ns로 이동하는 것도 확인했다. 기존 E1/E2 current/recorded graph·source·손상/복구·시뮬레이션 검사도 통과했다.
- 0.3.1 VSIX/ZIP SHA256 유지, 새 배포물/설치 없음. 사용자 examples/counter는 수정하지 않았다.

## 발견 문제와 수정

초기 host mock에서 timer API가 없어1 FAIL: 실제 timer 계약을 VM에 추가한 뒤 관련 검사 통과했다. 첫 native run-HC8Xjx는 no-edge 안내의 showInformationMessage Promise를 기다려 끝나지 않았다. 사용자 알림의 dismiss를 실행 완료 조건으로 삼지 않도록 void 호출로 수정했고 격리 검사 프로세스만 종료했다. 실패/중단 로그 .dev/d4-host.log와 runner exit1을 보존한다. 수정 후 run-tPpSon PASS와 최종 run-5Xkabh의 파형 재연결/공유 커서까지 PASS를 확인했다. native mutex/window load 경고는 보존하며 API host 수용을 물리 화면 검증으로 확대하지 않는다.

## 다음 작업과 열린 항목

다음 구현은 **E3 pipeline MAC 종단 예제/reference 검증**이다. 지금의 두 MAC fixture는 재사용 가능한 기반이고 E3 완료가 아니다. signed/unsigned와 parameter 폭, overflow/잘림, pipeline latency, 동기 reset/enable의 기대값을 별도 reference/assertion으로 명시하고 clock별 기록 관측값과 대조한다. 기존 사용자 예제는 덮어쓰지 않는다.

E4 실제 graph/clock 버튼 조작·가독성·대표 규모/복구 수용, 깨끗한 Windows·대표 사용자 설계·장시간/일부 프로필 게이트는 유지한다. H0 이후 독립 IDE와 I 자체 엔진은 사용자와 아이디어를 논의한 뒤 별도 계획을 합의한다.
