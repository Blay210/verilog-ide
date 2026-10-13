# H7D — 보관 결과 복원·파형 reader 종료·메모리 계측 (2026-10-12)

[H7C](ide-h7c-process-cleanup.md) 이후 화면 없이 보관 결과/저장 뷰의 재사용, 파형을 여는 중의 프로젝트 전환·종료, 실제 worker 종료와 수천 신호 메모리를 검증했다. **headless 복원·reader lifecycle은 통과했지만 RSS 회복과 Windows 앱 복원 수용은 남는다.** 새 RTL 시뮬레이션·앱 화면·배포는 실행하지 않았다.

## 재현과 보완

기존 `WaveformHost.dispose`는 worker만 종료하고 진행 중 `loadRecordedTrace`의 입력 검증을 기다리지 않았다. `close(token)`은 즉시 reader를 map에서 제거해 반복 close가 먼저 끝나고, 실제 worker가 종료하기 전에 다음 reader 자리가 열렸다. 기존 host의 `openWaveform`도 project epoch 없이 await 뒤의 현재 root에 view store를 연결했으므로 프로젝트 A/B/A를 지나도 이전 요청이 성공했다.

- `runtime/waveform-host.ts`: 열기별 AbortController를 보관 입력/trace 검증에 전달한다. 외부 project cancellation은 worker도 종료한다. disposal은 진행 중 열기와 실제 termination을 함께 기다리고, 반복 호출은 같은 promise를 반환한다.
- 닫는 reader의 자리는 termination 완료까지 유지한다. 이후 query는 거절하고, 이미 대기 중인 worker 요청은 기존 `WaveformSession.dispose`가 reject한다. 최대4 reader·32MiB VCD·32 selected·worker old generation256MiB 등 기존 한도를 유지했다.
- `runtime/host.ts`: waveform open을 H7B의 `readProject`에 넣어 root/epoch를 고정하고 A/B/A·close 뒤의 응답을 거절한다. view store는 요청 당시 root를 사용한다. 이미 열린 문서는 해당 run의 snapshot을 계속 사용한다. 마지막 guard에서 거절된 문서는 닫아 reader/store를 남기지 않는다.
- 소스/trace 경로·hash·run identity 검증과 저장 뷰의 revision/atomic-write 정책은 변경하지 않았다. browser source와 Node IPC overlay는 이번에 변경하지 않았다.

## 결정적 회귀와 전체 결과

`tests/waveform-lifecycle.test.mjs`의 신규5개는 실제 Worker를 관찰하고, 실제 snapshot 파일을 읽은 뒤 gate를 걸어 취소 이후에도 아직 진행 중인 I/O를 종료가 기다리는지 검사한다. 실패한 요청·닫힌 reader를 map에서 지웠다는 확인만으로 worker 종료를 판정하지 않는다.

| 검증 | 결과/근거 |
|---|---|
| 기존 reader 코드로 gated 종료/반복 close 재현 | **3 PASS/2 FAIL**, `.dev/cloud/h7d-reader-before-final.log`; worker exit 후에도 held I/O가 남는데 dispose 완료, 반복 close 조기 완료 |
| H7C의 waveform open 경로만 복원한 A/B/A 재현 | **0 PASS/1 FAIL**, `.dev/cloud/h7d-host-aba-before.log`; stale open을 성공으로 반환 |
| 관련 회귀 | **8 PASS/0 FAIL**: 신규5 + 기존 waveform-host1/views2, `.dev/cloud/h7d-related-final.log`; gated dispose는 이후 worker exit까지 기다리는 assertion으로 강화 |
| 최종 전체 IDE | **176 PASS/0 FAIL/1 Windows batch SKIP**, 총177개·runtime/language build, `.dev/cloud/h7d-full-final.log` |
| 4,096 신호·6회 reader 반복/별도 프로세스 복원 | **기능/lifecycle PASS**, 아래 receipt; 메모리 수용 전체 PASS를 뜻하지 않음 |
| 실제 Verilator의 보관 VCD2개 재열기/값 조회 | **2 PASS**, H7C의 정상/retry artifacts를 재사용, 새 simulation 없음 |

원래 reader/open 경로는 진단 중 generated dist에서만 잠시 실행하고 원래 bytes로 복구했다. 소스를 되돌리지 않았고 최종 전체는 진단 복구 후 다시 build/test했다. 첫 관련 실행7 PASS/1 FAIL은 원본 DUT를 inspect 전에 삭제한 fixture 문제였다: 현재 프로젝트의 필수 소스가 없으면 project load가 거절된다. 복원 검증은 원본 변경 상태에서 새 host를 inspect하고, 그 뒤 삭제하여 retained 파형 조회가 원본 재생성을 하지 않는지 확인했다. **필수 소스가 삭제된 invalid project의 앱 시작 복원까지 수용한 것은 아니다.**

신규 회귀는 새 host에서 과거 runId와 새 token·최신 run 분리, 원본 변경/삭제 중 과거 값 유지, 신호 순서/색/기본 뷰와 missing path 유지, 설정 손상 시 무덮어쓰기·reader 계속 사용, trace 변조 거절·실패 slot 반환, 최신 trace 삭제 시 최신 run 보존·과거 파형 자동 대체 없음, gated open 종료/join, A/B/A 거절·다른 root에 설정 무생성, 반복 close/join·4개 한도·peer reader 유지까지 검사한다.

## 규모·메모리와 별도 프로세스

`scripts/verify-waveform-lifecycle.mjs`는 private synthetic project에서 **4,096 signals × 64 timestamps = 262,144 changes**, VCD **1,893,143 bytes**, 선택32개·동시 reader4개·6회를 수행했다. receipt의 `passed`는 값/window/edge·취소·reader 한도·worker 종료·복원 assertions의 성공이며 RSS 예산 검사가 아니다.

- 최종 fixture `ide/.dev/cloud-h7d-wave-FVU777/receipt.json`, 로그 `.dev/cloud/h7d-scale-final.log`.
- parent worker **26 created/26 exited/live0/peak4**: synthetic24 + 기존 실제 VCD2. 별도 프로세스는 worker **1 created/1 exited/live0**이며 같은 runId·default view·32개 경로를 읽어 cursor31의 값1을 확인했다.
- 32개 query를 pending으로 둔 채 닫을 때 rejection 확인, reader2개를 닫아도 다른 reader 값 조회 유지, 닫힌 token 거절, 5번째 reader 거절. 각 round 종료 후 worker0이다.
- open24회의 중앙값 **419ms**, 범위 **304～1003ms**. hash/입력 검증·worker parse 포함, 공유 머신의 다른 테스트 부하도 겹쳤다. 실제 설계/Windows 지연 수용 수치가 아니다.

`process.memoryUsage().rss`는 **현재 parent의 모든 worker를 포함한 process RSS**이며 child reopen은 포함하지 않는다. `heapUsed`는 main isolate만 측정한다. 각 sample은 main `global.gc()`·event-loop turn 뒤 관찰하며 worker heap 전체에 GC를 강제로 적용했다는 뜻은 아니다.

| sample | live workers | RSS MiB | main heap MiB |
|---|---:|---:|---:|
| baseline | 0 | 61.4 | 8.6 |
| round1 four-open | 4 | 341.4 | 15.0 |
| round1 all-closed | 0 | 329.8 | 10.5 |
| round2 all-closed | 0 | 362.7 | 10.6 |
| round3 all-closed | 0 | 363.8 | 10.7 |
| round4 all-closed | 0 | 365.8 | 10.7 |
| round5 all-closed | 0 | 367.6 | 10.8 |
| round6 all-closed | 0 | 365.8 | 10.8 |

worker0과 main heap 감소는 확인했지만 RSS는 초기61.4MiB로 복귀하지 않았다. Linux allocator/V8 reservation과 실제 retained allocation을 이 계측만으로 구분할 수 없다. 마지막 구간에서 RSS가 대략 유지되었다고 장시간 누수 없음·메모리 회복 완료로 판정하지 않는다. raw receipt에 모든 intermediate sample을 보존했다. 런타임 allocator에 강제 trim을 넣거나 worker 한도를 줄여 관찰을 숨기지 않았다.

재현: `cd ide`, `source /workspace/.cloud-tools/activate.sh`, `npm run build:runtime`, `node --expose-gc scripts/verify-waveform-lifecycle.mjs --rounds 6 --real-retained .dev/cloud-h7c-real-I1zcnU`. 이전 실제 fixture가 없는 새 cloud에서는 마지막 flag를 생략한다. 이 경우 synthetic/fresh-process 검증은 실행하고 real retained는 **unrun**으로 기록한다. `--rounds`는1～12이며 default3이다. 각 실행은 새 private fixture를 만들고 사용자 프로젝트를 수정하지 않는다.

## 다음 H7E와 Windows 잔여 수용

다음 H7E는 **RSS 회복 원인 분리·장시간/실제 설계 메모리와 보관 소스64MiB cache/탭 해제 경계**를 먼저 확인한다. read-only/worker 계측을 Windows 앱 수용으로 합산하지 않는다.

| 남은 항목 | 실행 위치 |
|---|---|
| RSS의 allocator reservation/retained object 구분·장시간 반복·실제 수천 신호 설계 | 후속 headless profiler + Windows native app |
| 보관 source64MiB 한도/eviction·탭/공간 정리와 메모리 | H7E browser/provider 경계 + 마지막 Windows 통합 |
| Code/Simulation 공간·탭/선택 이력·미저장 문서·zoom/cursor/scroll/group 재시작 복원 | 마지막 Windows 화면 통합 |
| invalid project·손상/삭제 trace/settings의 실제 앱 안내·복구 동선 | Windows 통합; 해당 source-first/headless guard만 이번 확인 |
| H7C taskkill·종료 안내/취소·미저장 보호·shared process join·공식 본체 TS7 타입/emission | Windows 공식 개발 환경/통합 세션 |

FST 내장 표시·enum·clean Windows 설치·서명/배포 gate는 유지한다. ide/vsix 독립성, 기존 UX, 원본/기록 보호를 유지했고 commit/push/패키징은 수행하지 않았다.
