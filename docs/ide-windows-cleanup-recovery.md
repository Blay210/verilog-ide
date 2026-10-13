# Windows 종료 실패·NTFS 복구 수용 (2026-10-13 KST)

[Windows 클라우드 복귀](ide-windows-cloud-return.md) 뒤 P0의 종료 실패·재개 경계를 비화면으로 확인했다. 앱 창·Computer Use·사용자 profile/trust·배포·설치·commit/push는 사용하지 않았다. 이번 변경은 IDE 소유 **검증 코드와 문서**이며 제품 runtime은 이전 복귀 검증 뒤 바꾸지 않았다.

## Windows 종료 실패 검사

이전 전체 회귀에서 Windows가 건너뛰던5개 POSIX termination 주입 검사를 실제 Windows 실행 경로에도 연결했다. `tests/helpers/termination-control.cjs`는 알려진 private fixture의 leader PID에 대한 `taskkill.exe /PID`만 대체한다. 반환코드7(거절) 또는0(실제 종료 없는 승인)을 보내는 실제 숨김 Node child를 사용한다. production runProcess의 taskkill 결과 처리·5초 deadline·pipe 정리·service/host quarantine은 그대로 실행한다.

이는 실제 권한을 바꾸거나 Windows가 자연적으로 taskkill을 거절했다는 수용이 아니다. **실제 Windows tree 위에 termination 응답을 주입한 실패 경계 검사**다. 다른 PID의 spawn/termination은 가로채지 않는다. POSIX에서는 기존 process-group kill 주입을 유지한다.

- literal 인자/비정상 종료/도구 없음/pre-abort 분리.
- 실제 parent/child/grandchild 취소·별도 peer 보존.
- 종료 거절 때 cleanupFailed를 반환하고 더 이상 late log를 게시하지 않음.
- 반환코드0이어도 tree가 끝나지 않으면 실제5초 deadline의 cleanupFailed.
- host cancel→cancelled 기록/기존 trace 보존/fresh retry.
- host close→owned tree join/late 알림 차단/다른 active host 보존.
- timeout→timedOut와 사용자 취소 구분/fresh retry.
- 실패 결과/history에 cleanupFailure 저장, 같은 service 재실행 차단, host close 거절. fixture를 실제 정리한 뒤 새 host에서 정상 실행.
- tool probe 종료 실패를 보통 cancellation으로 낮추지 않음.
- result write 실패가 cleanupFailure를 덮지 않으며 history 기록 실패 후에도 재실행 차단.

injector는 finally에서 복원하고 real taskkill로 이 시험이 보고한 PID만 정리한다. 이후 모든 fixture PID 종료를 확인한다. 검증 후 별도의 read-only CIM inventory에서도 전용 `process-tree.cjs` 프로세스0개였다. process-name 일괄 종료나 사용자 프로세스 정리는 하지 않았다.

## NTFS 보관 실패→명시적 복구→재보관

`import-journal.test.mjs`의 Windows 경계를 확장했다. 열린 previous.toml 때문에 parent directory 이동이 EPERM인 경우 partial archive와 active record를 보존한다. 열린 handle로 쓴 새 bytes를 active recovery가 인식하고 현재 manifest와 lease 해제를 확인한다. handle을 닫은 뒤 **명시적 current 선택**으로 해당 기록을 acknowledge하고 새 계획으로 다시 보관한다. 재보관1개/active32개·지연 쓰기 bytes·원래 manifest를 확인했다. 자동 승격/삭제/강제 파일 덮어쓰기를 하지 않는다.

실제 archiver 종료 후 partial namespace/fresh lease 재개, capture/link/commit 각 경계의 실제 process 종료 후 검토, writer의 atomic 게시 전/후 종료·기존 legacy/live/unknown/junction lock 보호도 Windows에서 다시 확인했다. 전원 장애 또는 악의적 최종 외부 경쟁의 filesystem CAS 보증으로 확대하지 않는다.

## 결과와 재현

| 실행 | 결과/근거 |
|---|---|
| process cleanup/host 두 파일 | **10 PASS/0 FAIL/1 POSIX 전용 SKIP**,11개·15.18초/exit0. `ide/.dev/windows-cleanup/tests.log/.exit0` |
| NTFS 종료/재개 관련 선택5개 | **5 PASS/0 FAIL/0 SKIP**,4.75초/exit0. `.dev/windows-cleanup/recovery.log/.exit0` |
| JS 구문/diff | helper/process 두 검사 구문·git diff --check PASS |
| 잔류 fixture | read-only Windows CIM 검사0개. 제한 sandbox의 CIM 거절 뒤 승인된 읽기 환경에서 재확인 |

```powershell
# ide에서, 기존 dist/runtime build 사용. 창을 열지 않는다.
node --test --test-concurrency=1 tests/process-cleanup.test.mjs tests/process-host.test.mjs
node --test --test-concurrency=1 --test-name-pattern='archived handles retain|real archiver termination|live, legacy|real writer termination|real process termination across' tests/import-journal.test.mjs tests/import-recovery.test.mjs tests/import-publication.test.mjs
```

전체337개 회귀는 이전 Windows 복귀에서 **331 PASS/0 FAIL/6 POSIX SKIP**였으며 이번에는 관련 파일만 검증했다. 이번 결과를 합산해 새 전체 회귀 수로 표시하지 않는다.5개 Windows skip을 해제했으며 **POSIX leader 종료 후 group cleanup**1개는 플랫폼 고유 검사로 계속 skip한다. 제품 source/API는 미변경이어서 본체 빌드/전체 회귀를 무관하게 반복하지 않았다.

## 남은 단계와 화면 운영

P0의 Windows termination 실패/host 차단·join과 NTFS partial 복구 재개 근거가 보강됐다. 네이티브 workbench의 LanguageClient/FileService/창 사이 IPC, 실제 앱 종료 승인/취소·미저장 문서·UI 복원은 아직 별도다. 임의 외부 writer 최종 경쟁·장기 전체 disk·대표 실제 설계 성능, clean Windows 설치/FST 표시/파형 enum 등의 기존 잔여는 유지한다.

다음은 P1 통합용 native watcher/종료·복원 절차와 마지막 화면 체크리스트 준비다. **화면 검증을 시작하기 전에 반드시 사용자에게 알려야 한다.** 구현/일반 자동 검증 사이에 창을 반복 띄우지 않고 마지막 한 세션에 모은다. 이번에는 화면을 열지 않았다. H7/베타/배포 전체 완료로 선언하지 않는다.
