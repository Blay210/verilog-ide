# H7F — 손상·누락 프로젝트의 보관 이력과 저장 중단 복구 (2026-10-12)

후속 상태: [H7G](ide-h7g-import-publication.md)에서 마지막 외부 writer 경합을 journal/no-replace 게시와 명시적 복구로 보완했다. 현재 진단 재실행은 protected true/저장 거절/세 후보 확인 PASS/exit0이다. 아래 FAIL/exit1과 복구 방식은 H7F 당시의 역사적 근거이며 현재 구현은 H7G 문서가 우선한다.

[H7E](ide-h7e-cache-memory.md) 이후 현재 source/TOML이 유효하지 않을 때 보관 결과가 사라지는 경로와 import writer의 process crash 복구를 보완했다. **보관 이력 조회와 협력 writer의 복구는 통과했지만, 비협력 writer의 마지막 검사/rename 경합은 FAIL로 재현되어 H7G에 남는다.** 앱 화면·새 실제 RTL 시뮬레이션·배포는 실행하지 않았다.

## 현재 프로젝트와 보관 결과 분리

기존 inspect는 현재 `loadProject` 성공 뒤에만 history를 읽었다. 필수 DUT가 삭제되거나 TOML이 손상되면 fresh host에서 history/tests가0개가 되어, 여전히 정상인 보관 입력/trace를 UI에서 열 수 없었다. H7F 이전 inspect 경로만 사용한 private bundle로 **0 PASS/1 FAIL**(`0 !== 2`)를 재현했다. `.dev/cloud/h7f-history-before.log`.

- `runtime/host.ts`: history를 현재 설정 검증 전에 읽는다. 현재 project를 load할 수 없거나 설정 전 review 상태라면 검증된 retained metadata의 최신 name/top/result를 **historyOnly** 행으로 표시한다. 새 runnable project/test를 등록하지 않고 현재 설정 오류를 유지한다. canonical root가 같으면 history를 다시 스캔하지 않는다.
- 보관 로그·source-list/source-read·파형은 기존 Core의 path/run identity/hash 검증으로 읽는다. 최신 trace가 없으면 최신 결과는 유지하고 그 trace의 열기만 거절한다. 손상/partial 결과는 정상 결과를 대체하지 않는다.
- `start`는 historyOnly/project 없는 상태를 거절하고 명시적 입력 비교도 현재 project 복구를 요구한다. 정상 복구→inspect 또는 explicit imported Apply 성공 시 historyOnly를 해제한다. 원본/DUT/TOML을 자동 생성하거나 수정하지 않는다.
- 로그도 H7B의 `readProject`에 연결했다. root/epoch·A/B/A/close 뒤 응답을 거절하고 실제 file handle close까지 join한다. 기존64KiB tail과 missing/unsafe log 안내는 유지한다.
- Home은 보관 결과 버튼을 유지하고 Run/Explorer Run·입력 비교/현재 diff를 잠근다. 보관 이력이라는 안내를 표시한다. row signature에 source도 포함하여, missing project 복구 뒤 같은 name/top의 현재 source 버튼이 정상적으로 다시 연결된다.

fallback은 최근100개의 검증된 이력에서 name별 최신 top을 사용한다. 동일 name이 과거에 다른 top으로 재사용된 모든 버전을 별도 행으로 표시하는 새 UX는 추가하지 않았다. 기존 정상 프로젝트의 top 기준 history 선택 정책을 유지한다. record metadata를 읽었다고 source/trace 전체를 미리 검증한 것은 아니며, 실제 artifact 요청에서 다시 검증한다.

## 협력 writer lock의 crash 복구

기존 빈 `import-review.lock` 파일은 소유자가 죽은 뒤에도 남았고, 안전하게 소유자를 확인할 metadata가 없어 save 재시도가 막혔다. `core/import-lease.ts`는 다음 절차를 사용한다.

1. private prepared directory에 unique owner UUID/PID JSON을 쓰고 sync한다.
2. **이미 채워진 directory를 canonical `import-review.lock`으로 atomic rename**하여 lock을 획득한다. occupied lease는 덮어쓰지 않는다.
3. PID signal0 조회에서 ESRCH로 죽은 소유자만 확인한 뒤 그 **unique owner filename**을 제거하고 empty directory를 정리한다. live/reused PID·EPERM/unknown owner는 busy로 보존한다. PID를 종료하는 기능은 없다.
4. release는 자신의 filename만 제거한다. 다른 writer가 새 populated directory를 게시한 경우 rmdir의 ENOTEMPTY를 통해 그 lease를 보존한다. stale reclaimer를 gate로 지연시킨 실제 경쟁 회귀에서 확인했다.

canonical empty directory는 중단된 release의 정리를 완료할 수 있다. legacy regular lock files, unknown populated directories, linked/invalid owner data는 자동 삭제하지 않는다. 기존 버전의 empty lock file은 죽은 소유자를 증명할 수 없으므로 **소유 writer가 끝났음을 확인한 뒤 수동 복구**가 필요하다. 모든 stale lock을 무조건 자동 회복한다고 주장하지 않는다.

기존 temp write+file fsync·revision 재검사·first publication의 no-replace hard link·update rename을 유지했다. crash 후 남은 owned temp는 자동으로 TOML로 승격하거나 삭제하지 않는다. 현재 `rtl.toml`을 authoritative 설정으로 읽고 fresh writer가 그 revision을 기준으로 다시 저장한다. process crash 수용이며 전원 장애/전체 filesystem durability 수용이 아니다.

## 회귀와 실제 process 중단

| 검증 | 결과/근거 |
|---|---|
| H7F 이전 inspect의 missing DUT 재현 | **0 PASS/1 FAIL**, `.dev/cloud/h7f-history-before.log`; source/dist는 되돌리지 않고 private bundle 사용 |
| host/history/import 관련 | **26 PASS/0 FAIL**, `.dev/cloud/h7f-related-final.log`; 신규 history4/import4 + 기존18 |
| owned provider/Home/overlay | **8 PASS/0 FAIL**, `.dev/cloud/h7f-client.log`; 기존 provider5/overlay2 + 신규 실제 paint 코드의 retained-only 행/복구1 |
| 최종 전체 IDE | **196 PASS/0 FAIL/1 Windows batch SKIP**, 총197개·runtime/language build, `.dev/cloud/h7f-full-final.log` |
| 비협력 writer 마지막 검사/rename 진단 | **FAIL/exit1**, 아래 receipt. 일반 suite의 PASS에 포함하지 않음 |

history 회귀는 새 host에서 DUT 삭제, TOML 손상/삭제/hard-link, 원본 무생성·무수정, old/new run 분리, retained log/source/실제 worker VCD 값 조회, 최신 trace 삭제/손상 result/partial 보존, project 복구 후 run 등록 상태 회복, 로그 A/B/A와 close/file handle join을 검증했다. VCD는 synthetic backend의 fixture이며 실제 Verilator를 새로 실행한 근거가 아니다.

writer 회귀는 실제 fork한 Node writer를 **게시 직전·직후 SIGKILL**하고 exit를 기다린 다음 fresh writer를 실행했다. 중단 전에는 active lease가 새 writer를 거절했고, 죽은 뒤에는 old 또는 published revision을 보존한 채 재시도가 성공했다. orphan temp bytes도 보존했다. 다른 writer가 lease를 재획득한 뒤 지연된 stale reclaimer가 진행해도 새 owner file이 유지됐다. fsync 뒤 외부 edit는 마지막 revision 검사에서 거절되며 외부 bytes·temp/lease cleanup을 확인했다. tests가 만든 child만 종료했다.

처음 기본 병렬 전체는194 PASS/1 FAIL/1 CANCEL/1 Windows SKIP이었다. 기존 process deadline fixture20초와 slang enum 조회가 시간 제한에 걸렸다. process6개·semantic 파일을 별도로 재검증하고, 제품/시험 timeout과 skip을 바꾸지 않은 채 전체 test concurrency를2로 제한해 최종 검증했다. 최초 로그는 `.dev/cloud/h7f-full.log`, 분리 로그는 `h7f-timeout-check.log`·`h7f-semantic-check.log`에 보존한다. Node의 available CPU는5지만 실제 cgroup quota는4 CPU다. 단독 성공을 최초 failure가 제품 문제일 수 없다는 증명으로 취급하지 않으며 최종 전체 결과로 구분한다.

첫 관련24 PASS/1 FAIL은 fixture의 unresolved promise만으로 child가 살아 있지 않아 active-writer assertion이 실패한 결과였다. owned crash helper에 explicit keep-alive를 넣고 재실행했다. 최종26 PASS/전체에서 두 crash boundary와 race가 모두 실제로 실행됐다.

Home 검증은 pinned URI/Event/Disposable와 owned constructor/provider/**paint 코드**를 실행하되 DOM/services/IPC response를 대체했다. native pixel/layout/실제 editor group 수용은 아니다. `historyOnly` contract와 Home 이전 owned SHA256을 overlay에 기록했다: Home `22c92ef1ed8d301cc4611e5d9705d3703d9eb5b15beb466d6e0967ca66168cf4`, contract `5498aea961a1e5fb99bbe5b5ad37a21e7b87fa9242549ca77223d150596e9e37`. H7E Home bytes를 보존한 private source와 hash를 대조했다. 공식 전체 TS7 타입/target emission과 Windows overlay 재적용은 미실행이다.

## 비협력 writer의 확인된 FAIL과 다음 H7G

`scripts/verify-import-writer-boundary.mjs`는 private fixture에서 마지막 revision 검사 **뒤**, native rename **직전** 외부 프로그램처럼 TOML을 변경했다. 결과는 **protected false / exit1**: 기존 update rename이 외부 내용을 덮어썼다.

- `ide/.dev/cloud-h7f-writer-OWftwC/receipt.json`, `.dev/cloud/h7f-writer-boundary.log`.
- 외부 bytes는 진단용 `external-written.toml`에만 별도로 보존했다. 이는 product의 backup/recovery 구현이 아니다.
- 검사와 rename은 원자적 compare-and-swap이 아니며, 이번 cooperative lease는 이를 우회하는 editor/다른 프로그램의 마지막 변경까지 보호하지 못한다.
- 수용되지 않은 진단을 passing unit test로 바꾸거나 조용히 skip하지 않았다. 정상 cooperative writer/crash suite와 명확히 분리한다. 저장 전체/외부 writer 전체 수용은 아직 아니다.

다음 **H7G는 이 최종 경합의 보관/복구 journal과 publication 설계**를 다룬다. 외부 bytes를 잃지 않고 중단 이후에도 양쪽 후보와 설정 상태를 판별할 수 있는 방식이 필요하다. unknown/user 설정을 자동으로 채택·overwrite하거나 마지막 수정 검사만 반복해 CAS라고 부르지 않는다.

재현: `cd ide`, `source /workspace/.cloud-tools/activate.sh`, `npm run build:runtime`, `node --test tests/project-history-recovery.test.mjs tests/import-recovery.test.mjs`. Linux 전체 재현은 runtime/language build 뒤 `node --test --test-concurrency=2 tests/*.test.mjs`다. 미해결 진단은 `node scripts/verify-import-writer-boundary.mjs`이며 현재 **exit1이 실제 미수용 상태**다. 새 private fixture를 만들고 사용자 프로젝트를 변경하지 않는다.

Windows 실제 rename/lease/process-liveness, legacy lock 복구 안내, 보관 이력 UI/실제 model/tab/diff, 공식 본체 TS7/target emission·taskkill/종료/공간 복원·physical 통합 gate를 유지한다. H7E RSS anonymous pages·장시간/실제 설계, FST 내장 표시/enum·clean Windows 설치·베타/배포 전체도 잔여다. ide/vsix와 package/lock 독립성을 유지했고 commit/push·화면·릴리스 패키징은 수행하지 않았다.
