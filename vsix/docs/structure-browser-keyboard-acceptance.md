# E4 browser 프레임·실제 키보드 부분 수용 (2026-10-08)

격리4×4 host run-fx3XHC에서 실제 slang supported graph/16MAC/26 boundary ports/전체 배선 completeness를 확인했다. 제품 renderStructure HTML과 camera script를 별도 실제 Chromium webview에 넣고 시험 script만 같은 nonce 안에 주입했다. 생산 panel에 측정 hook을 추가하지 않았다. tests/vscode/structure-browser-probe.ts 및 RTL_SCHEMATIC_BROWSER_PROBE=1로 재현한다.

## 측정

.dev/e4-browser-keyboard.log 및 .dev/schematic-ui/run-fx3XHC/project/.rtl/schematic-browser.json. SVG elements2170/module targets16/viewport735.3×577.4.

| 구간 | RAF intervals | 중앙값 | p95 | 최대 | 50ms 초과 |
|---|---:|---:|---:|---:|---:|
| idle |120|16.7ms|16.8ms|116.7ms|1|
| camera |120|33.4ms|50.1ms|66.8ms|18|

camera 구간은 각 frame에 합성 방향키+wheel 이벤트를 보내고 getBoundingClientRect로 layout read를 강제했다. idle에도 초기 host 영향을 포함한 outlier가 있다. RAF는 렌더링 기회 간격이며 pixel presentation/FPS·실제 pointer latency·보통 사용성 수치가 아니다. 단일 짧은 측정이며 장시간 안정성/여러 기기 성능 게이트 완료를 주장하지 않는다. camera 부하의50ms 구간은 후속 비용 분해·재현 측정 대상이다. 로그의 CodeWindow failed to load code -3도 보존했으며 별도 probe receipt와 실제 화면 수용은 완료됐다; 원인을 해결했다고 주장하지 않는다.

## 키보드

실제 browser DOM에서 SVG 모듈 focus, Enter/Space 각각 node navigation message, canvas focus + zoom/0 Fit 복귀를 assert했다. 합성 입력이고 product host navigation은 probe에서 실행하지 않는다.

별도 실제 제품 화면을 computer-use로 조작했다: Fit button 클릭 → Tab canvas focus 테두리 → Tab pe00 SVG module focus 테두리 → Enter → pe00 내부 ×/MUX/register 구조 표시. Hierarchy pe00 행 클릭 → Down pe01 focus 이동 → Enter → pe01 내부 진입. native host observations에 해당 inspected 전환이 기록됐다. 최종 schematic-ui-host.json passed=true/RTL_SCHEMATIC_UI_PASS/host exit0. 기존 기계 graph/routing asserts도 통과했다.

## 범위와 다음 작업

이번 제품 코드 변경 없이 browser probe와 기존 private fixture 시험을 확장했다. 타입 검사 exit0·host 실행 과정 개발 build 성공. 전체224 회귀는 직전 제품 변경 결과를 유지하며 이번 재실행하지 않았다. 새 simulation/사용자 예제 수정/패키징·설치 없음.

전체 keyboard 수용은 아직 미완료: View/Display selector의 keyboard 변경, source 열기→diagram 복귀 focus, stale 상태와 화면 밖 module focus 동작. 다음은 이 흐름 및 camera frame 비용 분해/반복 측정이다. E4 완료·독립 IDE/내장 엔진 착수는 아직 선언하지 않는다.
