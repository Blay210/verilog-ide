# E4 클럭 취소·시간 제한·복구·reader 회수 (2026-10-08)

## 수정

`structure.ts`의 recorded clock search는 cancel flag를 검사했지만, 진행 중인 `clockEdgePage` promise가 끝나기 전에는 취소/닫기/15초 timer가 caller를 종료시키지 못했다. worker page와 abort notification을 race하고 listener를 정리하도록 보완했다. cancellation 뒤에는 기존 generation/revision/page/reader guard로 늦은 결과를 차단한다. 같은 reader를 이용하는 파형/다른 view를 유지하기 위해 취소할 때 공유 worker를 무조건 종료하지 않는다. 실제 query가 전달된 경우 현재 page는 worker에서 완료될 수 있으나 새 page나 cursor publication으로 이어지지 않는다.

## 실제 extension host 시험

`tests/vscode/structure-cancel.ts`가 실제 파형 worker의 `clockEdge` dispatch 한 건을 보류한 뒤 production command/close/timer를 실행하고, 실제 worker에 늦게 전달해 결과 차단·재시도를 확인한다. 인위적 dispatch hold를 쓰므로 실제 자연 발생 고부하 측정이나 화면 Cancel 버튼 클릭이라고 표현하지 않는다. production timeout15,000ms는 줄이지 않았다.

최종 격리 host `run-MI2irN` 결과:

| 항목 | 결과 |
|---|---|
| 취소 command 종료 | 31ms, 기존35000 tick 유지 |
| 검색 중 diagram 닫기 | 101ms, panelOpen=false |
| 15초 timeout | 15038ms, 기존 cursor 유지 |
| 늦은 요청 전달 | 취소/timeout 뒤 cursor 변경 없음 |
| retry | 실제 worker로 rising edge45000 tick 성공 |
| 닫기 뒤 복구 | workspace 열기→Update→instance/clock 재선택→retry 성공 |

최초 cancel/close host도 PASS(31/56ms)했으며 timeout을 추가한 위 최종 결과를 우선한다. `.dev/e4-clock-cancel-timeout-verified.log` PASS/exit0, `.dev/e3-host/run-MI2irN/cancel-receipt.json` passed=true. 후자는 실행 직후 actual project `.rtl/e3-host.json`을 별도 보존한 사본이다. 이전 pipeline117값 실행의 같은 project receipt는 이번 cancellation 결과로 갱신되었으며 과거 근거는 이전 로그/문서로 추적한다. retained run 자체·source/input snapshot/waveform은 바꾸지 않았다. `RTL_E4_CANCEL_TEST=1`은 test runner의 전용 entrypoint 선택이고 제품 설정이 아니다.

## 반복 reader·메모리 측정

기존 4096신호/192step fixture로 lifecycle8회·worker16개를 실행했다. 오류 후 reload, 닫은 reader의 대기 요청 처리, 살아 있는 peer 보존/값 일치, 모든 worker 실제 종료, 원본 hash 보존을 확인했다. `node --expose-gc` 측정은 parent GC만 사용한다.

`.dev/e4-reader-memory.log`/exit0, `.dev/scale-tests/lifecycle-W2fncs/report.json`: passedCorrectness=true, startedWorkers16/exitedWorkers16, sourceHashPreserved=true. final process RSS약364.9MiB, post-close RSS growth−753664bytes, parent heap growth275144bytes, provisional plateau=true. 이는 이 PC의 1회 diagnostic이며 전체 VS Code memory leak 부재나 browser frame 성능의 증명이 아니다.

## 회귀·다음 지점

clock-edge/camera/trace-links 관련13 PASS/0 FAIL/0 SKIP (`.dev/e4-cancel-camera-regression.log`), 전체 최상위224 PASS/0 FAIL/0 SKIP (`.dev/e4-cancel-full-verified.log`)/exit0. 타입 검사·개발 build exit0. 이번 camera keyboard 시험은 synthetic DOM의 focus guard 회귀이며 실제 keyboard tab-order 수용은 아니다. 코드 수정 후 기록117값 전체 native host를 다시 실행한 것은 아니며 cancel host에서 실재 recorded reader/retry를 검증했다.

다음은 actual progress Cancel 버튼, analysis 중 닫기/취소, 실제 keyboard tab-order/focus와 diagram browser frame/layout 성능이다. reader 메모리 회수·programmatic clock cancel/timeout 수용과 구분한다. E4 전체 완료/독립 IDE 및 자체 engine 착수를 주장하지 않는다. 패키징/설치·사용자 예제 원본 수정 없음.
