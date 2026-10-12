# E4 화면 밖 포커스 보완·카메라 비용 반복 측정 (2026-10-08)

## 변경

카메라는 이전에 g[data-node]로 키보드 포커스가 이동해도 화면 밖 graph를 다시 보이게 하지 않았다. focusin에서 module의 실제 browser bounds를 읽고 잘린 방향만 이동한다. 확대 비율은 유지한다.16px 여백, viewport보다 큰 module의 중앙 배치, aria-disabled=true 및0/비정상 bounds 무시를 처리했다. host/semantic/simulation 경로와 원본 소스는 바꾸지 않는다.

## 검증

camera 단위6 PASS: 기존 pan/zoom/Fit/camera 복원과 offscreen/이미 보이는 module/disabled/큰 module 처리를 포함한다. TypeScript noEmit exit0, native host 실행 시 개발 build 성공.

실제4×4 browser host run-4Bm8OR의 product HTML probe에서100% actual size → 화면 밖 마지막 MAC focus({preventScroll:true}) → module 전체가 viewport 안에 들어오고 zoom1 유지 assert PASS. 기존 SVG Enter/Space message와 canvas zoom/Fit도 PASS.16MAC/2170 SVG elements/viewport735.3×577.4. browser-only receipt에 physicalInput=false를 명시했으며 이번 새로운 물리 Tab 수용을 주장하지 않는다. 기존 물리 Tab/Hierarchy 수용은 이전 기록을 유지한다.

- .dev/e4-focus-performance.log: RTL_SCHEMATIC_BROWSER_PROBE / RTL_SCHEMATIC_UI_PASS, host exit0
- .dev/schematic-ui/run-4Bm8OR/project/.rtl/schematic-browser.json
- 같은 경로 schematic-ui-host.json passed=true

## 반복 성능 결과

각120frames의 idle, 합성 방향키+wheel, 합성 방향키+wheel+강제getBoundingClientRect를3회 반복했다. 전체1080 RAF intervals에서50ms 초과0회, 각 phase median16.7/p95 약16.8ms였다. camera handler p95 0.8~1.1ms, 추가layout read p95 3.2~3.4ms였다. 모든 이벤트/layout 호출은 실제 webview에서 실행했지만 입력은 합성이다. RAF는 pixel presentation/실제 pointer latency 보장이 아니다.

이전 단일 camera 시험의median33.4/p95 50.1ms와 차이가 크다. 이전 환경 부하·초기 상태 차이를 통제하지 않았으므로 이번 focus 보완이 성능 개선 원인이라고 말하지 않는다. 반복 결과상 현재 환경에서 큰 병목을 재현하지 못했으며 불필요한 카메라 scheduling 변경을 추가하지 않았다. 장시간/다른 기기의 성능 수용은 별도다.

## 다음 작업

선택기 keyboard 변경·소스 열기/diagram 복귀 focus와 stale 상태 실제 키보드 수용은 아직 남아 있다. 이번 offscreen 변경의 실제 Tab 재수용도 후속으로 확인한다. E4 완료·독립 IDE/내장 엔진 착수·패키징/설치는 선언하지 않는다. 생성물은 private .dev fixture/.rtl 아래에만 두며 사용자 예제/새 simulation을 수정·실행하지 않았다.

전체 회귀: .dev/e4-focus-full-regression.log, 225 PASS/0 FAIL/0 SKIP, 약36.18초·exit0. 제품 변경 뒤 관련 검증과 전체 회귀를 모두 통과했다.
