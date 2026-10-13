# H7C — 실행 취소·프로세스 정리 실패·종료 보호 (2026-10-12)

[H7B](ide-h7b-input-validation-cost.md) 이후 실제 parent/child/grandchild·독립 peer, 종료 거절과 지연, 결과 쓰기 실패를 자동 검증했다. 정상 취소·timeout·정리 실패를 구분하고 정리 실패 후 새 실행 및 종료 성공으로 잘못 표시하는 경로를 보완했다. 앱 화면 검증은 실행하지 않았다.

## 재현한 결함

기존 POSIX process-group SIGKILL이 거절되면 root child만 kill하고 정상 cancellation을 기다렸다. descendants가 stdout/stderr를 보유한 경우 close가 오지 않아 무한 대기할 수 있었다. 실제3단계 Node tree에서 group 종료에만 EPERM을 주입해 재현했다. 변경 전4개 process 회귀는 **3 PASS/1 FAIL**이며 cleanup failure가1500ms 이내 settle하지 않았다. `ide/.dev/cloud/h7c-before.log`에 보존했다.

기존 Windows taskkill 시작 실패/비정상 종료도 parent만 kill하는 fallback이었다. 이 분기는 실제 Windows에서 실행하지 않았지만 같은 성공 오인 경로를 제거하고 명시적 실패 처리로 통일했다.

## 구현

- `core/process.ts`: 정상 POSIX group kill/Windows taskkill /T /F를 유지한다. group kill의 ESRCH는 이미 종료된 경우로 처리하고 그 외 오류, taskkill 시작/exit 실패는 `ProcessFailure.cleanupFailed`로 reject한다. parent-only fallback으로 tree 정리를 성공처럼 표현하지 않는다.
- cancellation 후 tree close가5000ms 안에 확인되지 않으면 명시적 cleanup failure다. 실패에서는 pipes를 닫고 child/helper handles를 unref해 요청의 무기한 대기와 late log 전달을 끝낸다. 이것은 OS process를 실제로 종료했다는 뜻이 아니므로 소유 process 정리가 확인되기 전 retry를 허용하지 않는다.
- `core/runner.ts`: cleanup failure는 일반 cancelled/timedOut 대신 **failed**이며 `cleanupFailure`를 result/history에 보존한다. batch의 뒤 테스트를 시작하지 않고 같은 batch worker의 signal도 중단한다. log/result finalization까지 실패하면 원래 cleanup failure를 유지해 service에 전달한다.
- `SimulationService`: execution/tool probe의 cleanup failure를 별도 kind로 유지한다. session을 quarantine하여 이후 run을 거절한다. 취소 성공의 정상 retry는 가능하다. 실패한 경우에는 소유 process를 확인·정리한 뒤 새 session으로 복구한다; historical PID만으로 자동 재종료하지 않는다.
- `SimulationHostSession`: cleanup failure는 error state와 메시지로 남으며 close도 reject한다. close 시작 후 외부 notify를 중단하되 내부 상태/기록 정리는 완료한다. H7B의 진행 중 source read 취소/join도 유지한다.
- owned Node IPC channel: explicit close는 실패를 호출자에게 전달하면서 finally에서 emitter를 해제한다. disconnect/dispose의 비동기 close rejection은 Code-OSS `onUnexpectedError`로 전달한다. void disconnect/dispose 자체가 전체 app shutdown을 await한다는 뜻은 아니며 workbench의 explicit close join 수용은 아래 Windows gate다.
- Node channel의 이전 owned bytes SHA256 `c9a6b6adc1559279c2645e6b229f5a0d5d462a7386da9f4490608b7600b4e341`를 source-overlay previousSha256로 기록했다. upstream/자체 source를 무조건 덮어쓰는 경로를 추가하지 않았다.

## 자동 회귀

| 검증 | 결과/근거 |
|---|---|
| process/host/service 관련 | **31 PASS/0 FAIL/0 SKIP**: 신규 process-cleanup/process-host + 기존 simulation/simulation-host. `.dev/cloud/h7c-final-related-2.log` |
| Node IPC 종료 오류 회귀 | **3 PASS/0 FAIL/0 SKIP**, 실제 owned adapter를 변환 실행하고 platform/host response만 대체. `tests/channel-close.test.mjs`, `.dev/cloud/h7c-channel.log` |
| 전체 IDE | **171 PASS/0 FAIL/1 Windows batch SKIP**, 총172개·runtime/language build. `.dev/cloud/h7c-full.log` |
| pinned Node adapter headless 통합 | **3묶음 PASS**. 실제 owned channel·고정 Code-OSS Emitter/Disposable/error handler·real host. `.dev/h7c-channel/receipt.json`, `.dev/cloud/h7c-pinned-channel-final.log` |
| 실제 Verilator/GCC 취소/재시도 | **3회 passed→cancelled→passed**, 아래 receipt. 새 실제 실행이며 GUI 없음 |

새 process-cleanup5개 + process-host6개는 literal args/exit/spawn/pre-abort, 실제3단계 tree 종료와 peer 유지, leader가 먼저 끝난 POSIX tree, 종료 거절 및 종료 확인 timeout, host 취소/종료·late notify 억제·정상 retry, timeout 분류, cleanup failure의 persisted FAIL/quarantine/close reject, tool resolution 및 result write 실패의 오류 분류 보존을 검사한다. 실패 주입 후 test가 자신이 만든 group을 원래 kill 함수로 정리한다.

Linux `/proc`에서 Z/X는 더 이상 실행하거나 pipe를 보유하지 않는 종료 상태로 구분했다. 모든 PID가 즉시 제거/재수거됐다는 주장이 아니라 **live descendants가0개**라는 검증이다. 첫 중간 회귀에서 `/proc` 파일이 읽기 도중 사라지는 ESRCH를 만나 helper의 종료 관측을 보완했다. product failure를 숨기는 skip으로 바꾸지 않았으며 최종 전체에서 새14개 모두 PASS다.

중간 정상 related28 PASS 및 최종 process10 PASS 로그도 `.dev/cloud/h7c-final-related.log`, `.dev/cloud/h7c-process-final.log`에 있다. result write failure 회귀와 IPC 회귀는 그 뒤 추가했고 최종31/3/전체172 결과가 현재 근거다.

## 실제 Linux backend 실행

Node24.19.0, Verilator5.032/GCC, CPU5개·가용 RAM 약33GiB에서 기본 compiler parallelism2를 유지했다. `scripts/verify-cancellation.mjs`가 private project를 생성해 정상 counter VCD→실제 g++ build 중 취소→같은 service에서 정상 counter 재실행을 수행했다.

- `.dev/cloud-h7c-real-I1zcnU/receipt.json`, `.dev/cloud/h7c-real.log`: **passed true**.
- cancellation 직전 group scan에서 live build group member8개 관찰, 종료 후 live0개 확인. scope는 해당 spawned compiler group이며 독립 peer 보호는 별도 실제 Node tree 회귀에서 확인했다.
- baseline의 retained VCD bytes/hash, original RTL/TOML bytes, 각 run의 고유 directory/runId와3개 이력 보존. retry의 새 VCD도 identity 검증 PASS.
- cleanup failure 주입을 실제 Verilator binary에 적용한 결과는 아니다. failure는 실제 Node trees와 OS 호출 fault injection으로 결정적으로 검증했고 real Verilator 검증은 정상 termination/cancel/retry 경로다.

재현: `cd ide`, `source /workspace/.cloud-tools/activate.sh`, `npm run build:runtime`, `node scripts/verify-cancellation.mjs`. build/run은 새 private fixture에 생성되며 사용자 프로젝트를 변경하지 않는다.

## Node channel 검증의 정확한 범위

`scripts/verify-channel-cleanup.mjs`는 owned Node channel을 pinned source의 base modules·real IDE runtime과 esbuild로 묶어 window context/inspect/실행 승인 거절/awaited close를 실행했다. idle service의 quarantine flag에 진단 값을 넣어 explicit close rejection과 real emitter 해제, disconnect/dispose의 real unexpected-error routing도 확인했다. 이 flag의 생성 자체는 실제 tree fault-injection 회귀에서 따로 검증했다.

이것은 화면 없는 Node adapter 통합이며 공식 Code-OSS 전체 본체 TS7 타입/전체 native emission·native workbench lifecycle 검증이 아니다. Linux에서는 Windows/MSVC 전체 dev build가 준비되지 않았다. browser overlay는 변경하지 않았고 앱 창/프로필/trust도 사용하지 않았다. pinned integration의 최초 esbuild는 존재하지 않는 virtual resolve directory 때문에 실패했고 ignored upstream의 빈 target directory만 준비한 후 성공했다; source/lock/archive hash 검증을 변경하지 않았다.

## Windows에서 남은 항목과 다음 H7D

| 남은 수용 | 대상 |
|---|---|
| 실제 taskkill /T /F 정상·시작/exit 오류·종료 지연·child/peer 보호 | Windows Node/native 통합 |
| Run 중 종료 확인/종료 취소, 미저장 문서 보호, cleanup failure의 join/error 안내, shared-process disconnect 순서 | 마지막 Windows 앱 통합 세션 |
| 변경된 Node channel의 공식 본체 TS7 타입/target emission와 owned overlay 재적용 | Windows 공식 개발 toolchain |
| 공간/탭/선택 이력·파형/뷰 재시작 복원, 손상·삭제된 기록/trace 안내 | H7D headless 가능한 부분 + Windows UI |
| 수천 신호의 reader·memory 회복, cache64MiB·탭 정리·실제 설계 | H7D/후속 규모 수용 |

POSIX 처리는 spawn한 session의 같은 process group에 속한 descendants를 대상으로 한다. 의도적으로 detached/disowned된 외부 process까지 추적하는 기능을 추가하지 않았다. cleanup deadline5초는 API의 실패 감지 상한이며 Windows/모든 OS 상태에서 실제 종료를 보증하지 않는다. 실패는 확인·정리 후 새 session이 필요하다.

다음 **H7D는 재시작 복원·보관 결과/파형 reader lifecycle·메모리 경계**를 화면 없이 가능한 부분부터 진행한다. Windows 물리 조작은 마지막 통합 세션으로 유지한다. H7 전체/베타/배포·clean Windows 설치·FST 내장 표시/enum 완료를 주장하지 않는다. vsix와 source/lock의 독립성·제품 방향은 유지했다.
