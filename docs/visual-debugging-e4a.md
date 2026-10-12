# E4A — 실제 내부 그래프 가독성과 기본 규모 검사 (2026-10-07)

**E4는 진행 중이며 완료가 아니다.** 이번에는 실제 MAC 화면의 확대/이동/전체 보기와 발견한 가독성 문제 보완, native graph 한도·SVG 생성 비용을 확인했다. 다음은 E4B 전체 화면 왕복/clock 조작·키보드 접근성·취소/복구 수용이다.

## 실제 화면과 수정

computer-use 스킬의 sky API로 격리된 개발 VS Code 창만 선택해 조작했다. 사용자 기존 VS Code 작업 창은 조작하지 않았다. 기존 검증 결과 .dev/e3/mac 한글 i9Z8iB의 signed4,35ns 내부 graph24node/29edge를 열었다. viewport 약1443×902에서 Explorer와 기본 Chat sidebar가 열린 상태의 canvas Fit은44%였다. 글자가 약6px로 축소돼 읽기 어려웠다.

기존 + 버튼은44→56%로 확대됐고 background drag는 scope를 바꾸지 않고 graph를 이동했다. 100% 버튼을 추가했다. 첫 구현은 viewport 중심을 유지해 연결선만 있는 영역이 크게 보였다. 실제 screenshot 확인 후 actual-size는 scale1, graph 시작 offset20/20으로 바꿨다. 마지막 실제 클릭에서 clk/rst/en/a와 폭·부호·값 및 conversion/operator 라벨을 읽을 수 있었고 Fit으로44% 전체 보기로 돌아갔다. 전체 맞춤은 개요이며 큰 graph 모든 라벨의 가독성을 보장하지 않는다.

window/dev profile을 종료하는 API gate를 tests/vscode/visual-debugging.ts와 scripts/test-visual-debugging.mjs에 추가했다. 제품용 명령/telemetry hook은 아니다. UI gate는10분 제한, 시작 시 결과/graph를 준비하고 observed scope/time 상태 및 외부 검증 verdict를 private .rtl/에 기록한다.

최종 .dev/e4-host/run-FyR9NC, .dev/e4-ui-verified.log RTL_E4_HOST_PASS/host·runner exit0, project .rtl/e4-host.json passed=true/completeE4=false. 실제100%/Fit은 최종 run, +/pan은 .dev/e4-ui-visible.log의 앞선 run에서 확인했다. screenshot은 computer-use의 관찰 근거이며 파일 PNG를 별도로 저장하지 않았다.

## native graph 규모

.dev/e4-scale-verified.log / .dev/e4/graph-scale-6BLIVj/.rtl/e4-scale.json,1 PASS. 실제 slang → 내부 graph → SVG serialization을 한 번씩 측정했다.

| 연속 덧셈 수 | 결과 | node/edge | 분석(ms) | SVG 생성(ms) | SVG bytes | scene 크기 |
|---:|---|---:|---:|---:|---:|---|
|24|supported|98/97|331.64|2.20|36338|11025×2435|
|36|supported|146/145|270.20|0.74|54506|16185×3575|
|80|unsupported|0/0|287.74|0.03|0|empty scene|

80연산은 compiler의 실제 conversion/constant 노드 때문에256node 한도를 넘는다. 부분 graph를 표시하지 않고 smaller module을 안내한다. 최초 시험의80연산 supported 가정과 /limit/ 오류 문구 기대를 수정했다. 제품 한도는 늘리지 않았다. 초기 .dev/e4-scale.log / e4-scale-final.log 실패를 보존한다.

RSS78.30→78.68MiB는 이 Node 시험 프로세스 관찰치다. Python/VS Code 전체 사용량·메모리 회수 수용이 아니다. 위 비용은 browser frame/query RTT가 아니며 한 번의 synthetic measurement다.146node graph의 실제 canvas 조작/표시 latency 검증은 아직 하지 않았다.

## 회귀와 초기 실패

- 최종 .dev/e4a-full-final.log **200 PASS /0 FAIL /0 SKIP**, 타입 검사·개발 build exit0. camera actual-size→Fit5 PASS.
- 첫 전체 회귀 .dev/e4a-full.log는 기존 짧은40ms cancel 시험이 timedOut을 반환해1 FAIL했다. 다른 native/UI 검사 종료 뒤 재실행은 통과했다. 타이밍 민감성은 기존 알려진 제한이며 원인을 고쳤다고 하지 않는다.
- 첫 UI runner는 windowsHide=true라 targetable window가 없었다. 시험 전용 visible runner로 변경했다. hidden run의 수용 false/exit1은 제품 graph 실패가 아니다.
- actual-size unit 최초 mock에 새 camera 버튼이 없어1 FAIL; mock을 새 버튼 계약으로 갱신했다. 실제 확대 뒤 중앙 wire-only 영역 문제는 제품 수정으로 해결했다.
- 최종 VSIX/ZIP0.3.1 SHA256 유지. 새 패키징/설치와 사용자 counter 수정 없음.

## 다음 E4B와 완료 기준

1. 실제 top→module double-click/Back/Up→operations→source→waveform 왕복, explicit clock/edge selector·Previous/Next, 손상/미지원 안내를 조작한다. E3/D4의 API host 검사는 근거로 유지하되 실제 입력 수용과 구분한다.
2. 내부 node source의 키보드 접근성은 별도 확인/보완이 필요하다. 현재 SVG source group은 hierarchy card와 달리 명시적인 button/tabindex 처리가 없다. 긴 안내/parameter 표로 canvas가 아래에 밀리는 구성, source/clock toolbar 배치, 교차 wire를 따라가기 어려운 점도 UX 잔여다.
3.146node 이상의 실제 browser paint/조작 비용을 측정하고 한도 초과·취소/닫기/빠른 scope 전환·Refresh 복구를 확인한다. synthetic 정적 serialization만으로 전체 규모 수용을 선언하지 않는다.
4. 작은 예제 전체 물리 사용 흐름과 회귀/복구의 수용 근거를 기록한 뒤 E4 완료 판단, H0 자료 준비로 이동한다. H/I 구현은 사용자 아이디어 논의/상세 계획 합의 전 시작하지 않는다.

깨끗한 Windows·실사용 대표 설계·장시간/일부 편집 profile의 열린 검증은 유지한다.
