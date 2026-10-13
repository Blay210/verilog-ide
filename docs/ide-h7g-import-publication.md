# H7G — 설정 게시 경합의 후보 보존과 명시적 복구 (2026-10-12)

후속 상태: [H7H](ide-h7h-import-journal.md)에서 active128개 제한을 명시적 별도 보관으로 해소하고 최근32개 감시 유지·조회 공유/병렬 검증을 보완했다. archived record는 승인 후 자동 변경 검사에서 제외되며 전체 disk cap은 아니다. 아래는 H7G 당시의 구현·계측·검증 근거다.

[H7F](ide-h7f-project-recovery.md)의 마지막 검사/rename 경합에서는 외부 편집이 덮어써졌다. H7G는 현재 파일을 먼저 보관하고, 비어 있는 경로에만 요청한 설정을 게시한다. 충돌이나 중단이 있으면 보관 내용을 읽기 전용으로 확인한 뒤 사용자가 복구할 내용을 선택한다. **H7F의 FAIL 진단을 재실행해 external bytes 보존·저장 거절·세 후보 확인 PASS/exit0을 얻었다.** Windows 앱 화면·새 실제 시뮬레이션·배포는 실행하지 않았다.

## 저장과 중단 상태

`ide/runtime/core/import-publication.ts`가 `.rtl/import-transactions/<UUID>/`에 저장 기록을 만든다. 기존 PID/UUID writer lease와 revision 검사를 유지한다.

1. `candidate.toml`과 별도 inode의 `publish.tmp`, 원래/요청한 내용의 SHA256을 가진 `intent.json`을 file fsync한다. metadata는 unique temp를 sync한 뒤 rename한다.
2. 기존 `rtl.toml`을 `previous.toml`로 atomic rename하여 실제 게시 직전 파일을 포착한다. 외부 프로그램의 atomic replacement도 이 포착 대상이다. 이전 파일을 열어 둔 writer의 후속 쓰기도 이 inode에 남는다.
3. 포착한 내용이 검토한 revision과 다르면 저장을 거절한다. 관측한 외부 내용을 복사하여 canonical 경로가 아직 비어 있을 때만 no-replace link로 복원한다. 다른 writer가 이미 만든 현재 파일은 그대로 유지한다. 보관된 원래 inode와 요청한 후보는 삭제하지 않는다.
4. revision이 일치하면 `publish.tmp`를 canonical 경로에 hard link한다. 그 사이 외부 writer가 경로를 채웠으면 EEXIST로 거절하며 현재/이전/요청한 내용을 모두 보존한다. 정상 게시 후 자신의 임시 alias를 제거한다.
5. 현재/보관 hash를 확인하고 `complete.json`을 게시한다. 완료 기록이 없거나 이후 보관 inode의 내용이 달라지면 복구가 필요한 상태다. 완료된 저장 이후의 정상적인 현재 파일 편집만으로 과거 모든 기록을 다시 복구 대상으로 만들지는 않는다.

**전체 절차는 원자적 compare-and-swap이 아니다.** capture와 link 사이에는 canonical 경로가 잠깐 없을 수 있다. 그 중간에 죽으면 canonical 파일을 자동 생성하거나 후보를 자동 승격하지 않는다. 파일/intent sync와 실제 process kill을 검증했으며, 전원 장애·파일시스템 전체 durability 수용은 아니다. Windows rename/hard-link/open-handle 의미는 별도 검증 대상이다.

읽기 전용 검사에서는 disk를 변경하지 않는다. capture 이전에 죽은 준비 기록은 현재 hash가 base와 같으면 미게시 상태로 취급한다. 다음 lease 소유자가 저장할 때 `unpublished.json`으로 이를 기록하므로 그 다음 정상 저장이 옛 후보를 다시 pending으로 만들지 않는다. 후보 bytes는 보존한다. capture/link 이후 중단은 사용자 복구를 요구한다. link 직후 남은 nlink2는 해당 journal의 `publish.tmp`와 실제 inode/dev가 같은 소유 alias일 때만 읽고, 복구 시 자기 alias만 정리한다. 임의의 hard link는 거절한다.

## 복구 동작과 보호

- `readImportRecovery`는 보관/현재 hash와 metadata로 검토 revision을 만든다. `readImportRecoveryText`는 해당 revision의 current/previous/candidate 중 존재하는 내용을 UTF-8로 읽고 BOM bytes를 유지한다. 임의 경로나 변조된 candidate를 받지 않는다.
- 일반 설정 읽기와 disk 기반 `loadProject`는 unresolved journal을 거절한다. 설정 내용 읽기 전후와 async source 검증 이후에도 검사하여 미완료 후보가 Core/CLI/Run의 실행 설정으로 조용히 채택되지 않는다. 명시적으로 전달한 preview text는 기존 preview 검증을 유지한다.
- Host는 retained history를 먼저 유지하고 복구 목록을 state에 표시한다. 복구 대기 중 새 Run/Explorer·현재 입력 비교는 잠기며, 보관 로그/source/파형 조회는 유지한다. 복구 읽기도 project epoch·A/B/A·close join에 연결한다.
- Simulation의 기존 관리 버튼은 필요한 경우 **설정 복구**가 된다. 존재하는 현재 유지/이전 복원/요청한 설정 적용 중 선택 → 읽기 전용 탭 또는 현재와 후보의 읽기 전용 diff → 명시적 확인 순서다. 확인 취소 시 쓰기 없다. 후보가 여러 개면 하나씩 검토한다.
- 선택·조회·editor open·확인 이후 root/epoch·신뢰·미저장 TOML·busy/loading·복구 revision을 확인한다. Node IPC는 허용된 choice와 literal `approved === true`를 전달하고 Host가 미승인 복구를 거절한다. 화면 테스트의 가짜 services가 권한을 대신 보증하는 것은 아니다.
- `current`는 현재 파일을 쓰지 않고 보관 revision을 acknowledge한다. `previous/candidate`는 같은 journal publisher로 다시 저장하므로 복구 도중 외부 writer가 나타나도 새 경합과 모든 후보가 남는다. stale review·readonly current·변조된 보관 파일은 거절한다. 이후 old handle의 추가 쓰기는 acknowledge 뒤에도 다시 감지된다.
- UUID·directory realpath/type·regular file/nlink·1MiB 상한·열기/읽기 전후 inode/size/mtime·candidate SHA를 검사한다. unknown/linked/oversized/corrupt 기록과 legacy/live/unknown lease를 삭제하지 않는다. 고유 orphan review temp도 자동 승격/삭제하지 않는다.

## 자동 검증과 근거

| 검사 | 결과/근거 |
|---|---|
| runtime 타입/build | PASS, `ide/.dev/cloud/h7g-build-final-2.log` |
| language 타입/build | PASS, `ide/.dev/cloud/h7g-language-build.log` |
| publication/import/host/provider/IPC 관련 | **43 PASS/0 FAIL/0 SKIP**, `ide/.dev/cloud/h7g-related-final-2.log` |
| H7F의 마지막 writer 경합 진단 재실행 | **PASS/exit0**, `ide/.dev/cloud/h7g-writer-current.log`; `ide/.dev/cloud-h7f-writer-no18xW/receipt.json`: protected true, injected true, 저장 거절, current/previous/candidate 모두 존재 |
| 최종 전체 IDE | **215 PASS/0 FAIL/1 Windows batch SKIP(총216)**, `ide/.dev/cloud/h7g-full-serial.log` |

관련43개는 기존25개와 신규18개다. 신규 publication11개는 마지막 native capture 직전 in-place/atomic external edit, 빈 경로를 채우는 writer, 완료 후 old open handle 쓰기, capture 후 abort, 실제 fork writer의 **capture 이후/link 이전/link 직후/commit 직전** SIGKILL과 exit·fresh owner 복구, stale/변조/invalid choice, 복구 자체의 writer 경합, symlink/unknown/oversize/128 record gate, readonly 파일·UTF-8 BOM bytes 보존·초기 readiness 검사 후 발생한 게시 중단의 disk 기반 Core load 차단을 검증한다. 실제 중간 crash4경계에서 후보 자동 적용 없이 Core 읽기를 거절하고 explicit 복구 후 nlink1·원본/candidate·lease release를 확인했다. fixture child만 종료했다.

신규 host2개는 retained log/history 유지·미승인/stale 거절·복구 후 runnable state, recovery read의 A/B/A·close/file-handle join을 확인했다. 신규 client4개는 owned Home constructor/provider/paint와 pinned URI/Event/Disposable을 실행하고 DOM/services/IPC를 대체하여 readonly diff→confirm→write 순서, 취소/dirty/trust/loading, await 중 A/B/A/바뀐 review/종료/running, 늦은 조회 무탭을 확인했다. 신규 IPC1개는 실제 owned adapter의 choice/approval 전달을 확인했다. native pixels·실제 dialog/editor group·물리 클릭 수용은 아니다.

최초 기존 회귀8개 중2개 실패(`h7g-existing.log`)는 linked 오류 문자열의 대소문자와, 미게시 준비 기록이 다음 정상 저장 뒤 다시 pending이 되는 오류였다. linked 안내를 기존 정책과 맞추고 lease 소유자의 미게시 기록 처리를 보완해8/8 재검증했다. 강제 종료 후 독립 review staging file이 양쪽 boundary에 남는 새 구조도 실제 bytes 보존 assertion으로 검사했다. assertion을 삭제하거나 skip을 늘리지 않았다. 이후 관련43개가 모두 통과했다. 기본 병렬 전체는 H7F에서 cgroup4 CPU 부하/시간 제한 실패가 있었으므로 이번 전체는 처음부터 concurrency2를 사용했다. 첫 전체는210 PASS/2 FAIL/1 Windows SKIP으로, 새 journal 디렉터리를 예상하지 않던 기존 confirmation cleanup2개 assertion이 실패했다. 정상 journal만 남고 임시 파일/lease와 unresolved 복구가 없는 조건으로 보완했다. 후속 concurrency2 전체는213 PASS/1 FAIL/1 SKIP이며 기존 slang unsaved completion이15초 process 제한으로 Cancelled를 반환했다. 테스트/제품 timeout을 늘리지 않았으며 semantic 단독11 PASS(`h7g-semantic-check.log`) 후 최신 전체를 concurrency1로 재검증했다. 단독 성공만으로 최초 실패가 제품 결함일 수 없다고 단정하지 않는다. 최초 두 전체 로그 `h7g-full.log`·`h7g-full-final.log`도 보존한다.

overlay는 마지막 owned SHA뿐 아니라 확인된 이전 owned SHA 목록도 허용한다. Windows H6 작업본이 클라우드 H7E/F 중간 배포를 거치지 않고 최신 overlay로 이동할 수 있게 했다. unknown/외부 변경은 여전히 전체 쓰기 전에 거절한다. `source-overlay.test.mjs` 3 PASS(`h7g-overlay.log`). Git HEAD의 실제 Home/Node channel/contract3파일 bytes/hash를 읽어 private patch fixture에서 직접 migration·반복 적용을 확인했다: `ide/.dev/cloud-h7g-overlay-5xdXqn/receipt.json`, `h7g-baseline-overlay.log`. 이 검증은 Windows upstream 실파일 적용·공식 emission 수용이 아니다.

## 재현과 남은 범위

```bash
cd ide
source /workspace/.cloud-tools/activate.sh
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-import-writer-boundary.mjs
```

기존 writer 진단 스크립트/fixture prefix의 h7f 표기는 원래 FAIL과 후속 PASS의 동일 경계를 비교하기 위해 유지했다. H7F의 `cloud-h7f-writer-OWftwC/receipt.json` protected false/exit1은 역사적 실패 근거로 남는다. 로그/fixture는 ignored local artifacts이며 새 cloud task에 자동 제공된다고 주장하지 않는다.

**다음 H7H는 journal 보관량·반복 저장/조회 비용과 장기 사용 정책**을 다룬다. 현재 transaction 최대128개·파일 최대1MiB로 제한하며 완료된 기록도 보관 inode의 late write 감지를 위해 읽는다. 자동 prune은 없다. 128개가 되면 새 저장을 거절하며 Core가 임의로 사용자 backup을 지우지 않는다. 이 상한과 전체 scan은 장기 사용 수용이 아니고, 명시적 검토/보관·정리 정책과 비용을 다음 단계에서 해결해야 한다. UTF-8 외 설정/linked·손상 journal은 보존 후 차단하며 자동 수선하지 않는다.

Windows 최종 통합에는 (1) 공식 TS7 전체 타입/target emission 및 overlay 재적용, (2) 실제 NTFS rename/hard-link/open-handle·dead lease/프로세스 종료, (3) read-only diff/취소/승인·미저장 TOML/신뢰/프로젝트 전환, (4) crash 이후 fresh app과 보관 이력/파형·공간/탭 복원, (5) taskkill·종료 취소/join·기존 창 보존을 포함한다. 화면을 차지하는 검증은 사용자 결정대로 마지막에 모은다. H7E RSS 잔여·실제 설계/장시간·clean Windows 설치·FST 표시/enum·베타/배포 전체 gate도 유지한다. ide/vsix 의존성과 lockfile 독립성은 유지했다.
