# E4 실제 클럭 Cancel·키보드 부분 수용 (2026-10-08)

## 결과와 근거

격리 개발 host run-QfsfM5에서 실제 화면의 **Finding recorded clock edge → Cancel**을 클릭했다. 테스트는 native waveform worker의 clockEdge 요청 하나만 보류한다. Cancel 후 command가 보류 요청 전달 전에 종료되고 cursor 35000ps가 유지되는 것을 assert했다. 보류 요청을 실제 worker에 전달한 뒤에도 35000ps를 유지했고, 재시도는 실제 worker에서 rising edge 45000ps를 반환했다. 생산 코드의 rtl.cancelStructureClock 명령은 이 모드에서 호출하지 않는다.

- 로그: .dev/e4-clock-physical-verified.log
- 고유 receipt: .dev/e4-host/run-QfsfM5/receipt.json (passed=true, physicalProgressCancel=true)
- native host exit0 / PASS, TypeScript noEmit exit0, host 실행 과정 개발 build 성공.
- 기존 retained MAC run c63cf2c4-2faf-4c11-9d83-2e1722ae88dd를 재사용했다. 새 simulation/사용자 예제 소스 변경/VSIX 패키징·설치 없음.

실제 키보드에서는 시간 입력칸 클릭 → Tab으로 Go 포커스 테두리 확인 → Shift+Tab으로 시간 입력 복귀/기존 텍스트 선택 → 35 ns 입력 → Enter → 표시값과 Values at 35 ns 일치를 화면으로 확인했다. UI Automation의 focused_element는 webview 내부 입력 대신 RootWebArea를 반환하여 입력 caret/선택/버튼 focus 테두리를 시각 근거로 사용했다. 전체 tab order·SVG node/계층 keyboard 접근성 수용을 주장하지 않는다.

## 시험 지연과 실패 기록

화면 관찰/입력 도구 지연 때문에 첫 15초 시험(run-TemWKJ)과 60초 관찰 시험(run-qUpzCH)은 Cancel 입력 전에 deadline으로 종료했다. 두 receipt passed=false, UI 입력은 foreground window did not report a process id로 실패했다. run-l0M573은 시험 extension의 withProgress wrapper가 제품 extension의 별도 API 인스턴스를 관찰하지 못해 observation timeout으로 실패했다. 해당 wrapper는 제거했다. 제품 취소 실패로 단정하지 않으며 성공 시험으로 집계하지 않는다.

최종 physical 모드는 첫 15000ms timer 하나를 **시험 host에서만 300000ms**로 늘렸다. 즉 실제 Cancel 경로를 충분한 관찰 시간으로 검증한 것이다. 보류 시작부터 취소 완료 관찰까지 elapsedMs=24563이며, 이것은 도구·관찰 시간을 포함한다. 클릭 후 처리 latency나 제품 15초 deadline 측정값이 아니다. timer 함수는 보류 관찰 직후 및 finally에서 원복한다. 제품 소스/15초 설정은 수정하지 않았다. 원래 15초 deadline/프로그램 cancel/닫기는 별도 [기존 native 수용](structure-cancel-recovery-acceptance.md) 근거를 유지한다.

## 재현과 다음 순서

scripts/test-visual-debugging.mjs에 RTL_E4_PHYSICAL_CLOCK=1을 주면 tests/vscode/structure-cancel.ts의 physical 모드를 선택한다. 각 host root의 verdict.json에 start=true를 기록해 시작하고, 실제 Cancel 클릭/자동 retry-passed 후 화면 검증을 마쳐 finish=true를 기록한다. receipt는 host별 경로를 사용하므로 이전 성공 receipt를 재사용하지 않는다. 이 gate는 시험 관찰용이며 제품 기능이 아니다.

다음은 semantic/module 분석 중 실제 취소·닫기/복구, 남은 전체 keyboard/focus(계층·SVG·선택기·source 왕복), diagram browser frame/layout 성능이다. 현재 E4 전체 완료 또는 독립 IDE 진입을 선언하지 않는다. 이번 변경은 시험 harness와 실행기뿐이라 전체224 회귀를 재실행하지 않았고 직전 제품 수정의224 PASS 근거를 유지한다.
