# E4B 기록 디버깅 왕복·닫기/재연결 수용 (2026-10-08)

## 발견·수정

실제 host에서 `rtl.setWaveformTime`이 열린 기록 파형을 찾지 못했다. 결과의 절대 경로는 `D:\…`, VS Code Uri.fsPath는 `d:\…`였다. `packages/vscode/src/waveform.ts`의 command lookup이 case-sensitive 비교를 사용했다. Windows에서 resolve된 경로의 대소문자를 정규화하고 다른 OS의 대소문자 구분은 유지하도록 보완했다. scope/module/trace identity와 시뮬레이터 동작은 변경하지 않았다.

초기 `.dev/e4-roundtrip-lifecycle.log`와 `.dev/e4-roundtrip-lifecycle-verified.log`는 이 command 오류로 exit1이며 성공 근거가 아니다. 테스트 작성 시 cursor가 string임을 반영했고, 기록 소스 이동으로 VS Code 미리보기 파형 탭이 교체될 수 있어 inverse cursor 시험 전에 명시적으로 다시 연다. 최종 `.dev/e4-roundtrip-path-fixed.log`의 `E4_WAVE_PATH_IDENTITY`에 requested/opened 드라이브 대소문자 차이를 보존했고 같은 command가 정상 동작한다. 처음 미리보기 교체만을 원인으로 추정한 것은 최종 경로 비교 원인 확인으로 갱신한다.

## 자동 실제 host 수용

격리 host `run-aEBmL5`, private project `.dev/e3/mac 한글 i9Z8iB`, retained run `c63cf2c4-2faf-4c11-9d83-2e1722ae88dd`를 사용했다. 새 simulation build는 하지 않았다.

- signed4/signed8/unsigned4의 compiler-confirmed Schematic과 모든 route 표시 확인.
- product/stage/acc 117개 기대값 일치 및 diagram clock→wave cursor 공유.
- readonly recorded source scheme 확인.
- waveform command→diagram time35,000 tick 역방향 동기화.
- 파형 탭 닫기 후 reader 제거와 diagram cursor 유지, 재열기 후 같은 run/time 재연결.
- diagram 탭 닫기 후 재열면 `unavailable` 안내, 명시적 Update로 retained run 재연결.
- 갱신 후 Schematic·clock 선택 재설정, rising 다음45,000/이전35,000과 파형 일치.

`.dev/e4-roundtrip-path-fixed.log` PASS/exit0 및 project `.rtl/e3-host.json` passed=true, observations117, waveToDiagram/waveCloseReopen/diagramCloseRefresh/clockBothDirections=true. 오래된 receipt만으로 성공 판단하지 않고 최종 프로세스 exit0와 로그를 함께 확인했다.

## 실제 화면 수용

격리 visible host `run-9osJbW`에서 computer-use로 반환된 유일한 development window만 조작했다. 기존 physical gate는 Detailed leaf 대신 기본 Schematic과 명시적 clk 선택으로 준비하며 gate/receipt를 새 host root에 분리해 이전 verdict 재사용을 방지한다.

실제 Next edge35ns→45ns, Previous45ns→35ns, Open linked waveform35ns 공유 커서를 확인했다. 파형의 Go time에45ns를 입력하고 Enter로 이동한 뒤 diagram 탭에서 Time45ns/Values at45ns를 확인했다. Open definition으로 retained `pipeline_mac.sv` 선언을 열고 diagram 탭 복귀 동작을 수행했다. readonly source는 위 native scheme assertion과 제품 provider로 검증한다. 복귀 직후 렌더링 완료 전에 gate가 종료되었으므로 그 마지막 source→diagram 화면의 시각적 재표시까지 별도로 확인했다고 주장하지 않는다.

근거 `.dev/e4-schematic-debug-ui.log`의 `RTL_E4_HOST_PASS`/exit0, `.dev/e4-host/run-9osJbW/receipt.json` passed=true. 실시간 state 관측 cursor35000→45000→35000→45000, clock20, operations supported, stale=false를 보존했다. screenshot은 tool에서 관찰했고 별도 영구 파일은 저장하지 않았다.

## 회귀·남은 범위

전체 최상위 단위 회귀224 PASS/0 FAIL/0 SKIP, `.dev/e4-roundtrip-full.log`/exit0. 타입 검사 exit0 및 두 native runner의 개발 build exit0. 전체 native 하위 시험을 모두 재실행한 것은 아니다. release 패키징/설치·사용자 예제 수정 없음.

E4 전체 완료는 아니다. 남은 수용은 긴 clock/analysis 작업의 실제 취소·timeout·닫기 후 복구, keyboard tab-order/focus 이동, browser/frame/memory 성능과 규모다. 이번은 취소 시험을 수행했다고 표현하지 않는다. 4×4 Fit 라벨·공통 제어선/상수 밀집·source 왕복 page scroll 및 generate/array/연속 계층 확대 제한은 이전 문서를 따른다. live simulator single-step/breakpoint·자체 compiler/simulator·독립 IDE fork는 후속 별도 논의 범위다.
