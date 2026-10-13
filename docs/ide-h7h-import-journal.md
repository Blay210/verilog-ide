# H7H — 설정 기록의 장기 보관과 조회 비용 (2026-10-13)

후속 상태: [H7I](ide-h7i-import-save-cost.md)에서 반복 저장의 전체 검사7→3회·고정1MiB 버퍼 제거·membership/short read/abort 검증을 완료했다. 가볍고 빠른 UX 요구를 [성능 계획](ide-performance-plan.md)에 기록하고 다음 H7J는 event/semantic burst 비용이다. 아래는 H7H 당시 정책·검증·계측의 역사다.

[H7G](ide-h7g-import-publication.md)는 외부 writer와 중단 시 후보를 보존했지만 모든 기록을 계속 검사하고 128번째 이후 저장을 거절했다. H7H는 **명시적으로 오래된 기록을 별도 보관해 저장을 이어가는 경로**와 요청 안의 현재 설정 공유·제한 병렬 검증을 구현했다. 앱 화면·Windows native·새 실제 RTL 시뮬레이션은 실행하지 않았다.

## 보관 정책과 사용자 흐름

- `.rtl/import-transactions`에는 최대128개를 유지한다. 자동 삭제나 자동 보관은 없다. 기록이64개 이상이면 기존 관리 버튼이 **테스트 관리 · 기록 보관**이 되고, 기존 테스트 관리 또는 별도 보관을 선택한다.
- 읽기 전용 `inspectImportJournal`이 현재 내용과 기록의 검증 revision, 보관 개수/예상 bytes/남는 개수를 제시한다. 확인 대화상자는 파일을 삭제하지 않으며 **별도 보관한 기록은 자동 변경 검사에서 제외된다**는 조건을 설명한다. 이전 파일을 열어 둔 외부 프로그램을 닫도록 안내한다. 취소·미저장 TOML·비신뢰·busy/loading·root/epoch/A/B/A·바뀐 plan은 쓰기를 거절한다.
- Core는 PID/UUID writer lease를 획득하고 검토 revision을 다시 검사한다. 클라이언트가 보낸 개수나 경로를 사용하여 이동 대상을 고르지 않는다. 완료/acknowledged/unpublished가 검증된 정상 기록 중 directory 생성 시각과 동률 UUID 순으로 최근32개를 유지하고, 나머지를 `.rtl/import-archive/<batch UUID>/<record UUID>`로 이동한다. pending·touch되지 않은 preparation·unknown children을 가진 기록은 유지한다. 따라서 남는 개수는32개보다 클 수 있다.
- candidate/previous/metadata와 inode를 **그대로 유지**하며 현재 `rtl.toml`은 쓰지 않는다. 각 이동 전에 revision·일반 파일/type/nlink·1MiB·UUID temp 이름·directory realpath를 재확인한다. archive parent link·populated destination 충돌·unknown data를 덮어쓰거나 삭제하지 않는다.
- `archive.json`을 먼저 file fsync+atomic metadata rename으로 기록하고, 개별 record directory를 atomic rename한다. 전체 완료 후 `complete.json`을 쓴다. 여러 기록 이동은 하나의 원자적 transaction이 아니다. 취소/강제 종료 시 이미 이동한 기록은 별도 보관 위치에 있고, 나머지는 active에 남는다. 새 소유자는 dead lease만 회수하고 fresh plan으로 나머지를 처리한다. partial batch를 삭제하거나 자동 복원하지 않는다.
- Host는 작업을 tracking하여 close가 실제 파일 읽기/이동과 lease release까지 기다린다. 성공·실패 뒤 actual count와 retained history를 다시 읽는다. Apply/분류 저장 뒤에도 journal state를 갱신한다. 로그/source/파형·runnable 설정과 원본을 보존한다. Node IPC는 검토 plan과 literal approval을 전달한다.

**보관은 자동 감시를 종료하는 사용자 결정이다.** old handle의 후속 쓰기는 이동한 inode에 남지만 archived record는 정상 프로젝트 검사를 차단하지 않는다. 최근 active record의 후속 쓰기는 H7G처럼 다시 복구를 요구한다. 이동 직전 검사와 rename은 compare-and-swap이 아니므로 확인 뒤 들어온 쓰기의 완전한 동결을 보증하지 않는다. 다만 archive는 파일 내용을 덮어쓰거나 unlink하지 않는다. 전원 장애·NTFS 실제 동작·archive 전체의 원자적 복원 수용은 아니다.

## 조회와 취소 개선

`import-publication.ts`의 scan은 현재 설정을 시작/종료에 두 번 읽어 SHA 일치 여부를 확인하고, 요청 내 공유 snapshot을 사용한다. 각 후보/보관 파일의 type/nlink·inode/size/mtime·candidate SHA와 strict metadata 검증은 유지한다. request 간 payload cache를 만들지 않는다. 최대8개 record를 병렬로 검사하며 결과에는 summary만 남기므로 128개 payload 전체를 계속 참조하지 않는다. 실패/abort 시 해당 batch의 모든 reader를 join하고 실제 handle을 닫은 뒤 거절한다. 복구 읽기와 preparation 정리에도 같은 signal/scan 경계를 사용한다.

archived namespace는 정상 조회에서 스캔하지 않는다. 이 비용 제한은 앞의 명시적 retirement 정책과 함께 성립한다. payload는 batch당 최대 약16MiB에 현재 bytes/metadata/일시 객체가 추가될 수 있다. 이는 V8/IPC/editor/앱 전체 메모리 한도나 RSS 회복 수용이 아니다.

## 동일 fixture 계측

H7G runtime을 private snapshot에 보존한 뒤, **같은32/64/128개 정상 기록**을 H7H에서 재검사했다. canonical managed 설정67,092 bytes/250 role paths, 실제 semantic/RTL 실행 없는 합성 fixture다. 크기마다3회 중앙값이며 캐시/머신 부하 영향을 포함한 관측이다.

| 기록 | 현재 파일 읽기 H7G→H7H | 전체 bytes H7G→H7H | 중앙값 ms H7G→H7H |
|---|---|---|---|
| 32 | 32→2 | 6,450,304→4,437,544 | 363→70 |
| 64 | 64→2 | 12,900,608→8,740,904 | 797→113 |
| 128 | 128→2 | 25,801,216→17,347,624 | 2,440→272 |

128개에서 open640→514, 현재 bytes 반복 읽기를 줄이면서 이전/candidate 검증은 유지했다. 이전 runtime은129번째 저장을 거절했다. 같은 fixture의 H7H는96개를 별도 보관→active32개·원형 bytes 보존→다음 저장 성공을 확인했다. 근거: `ide/.dev/cloud/h7h-journal-before.log`, `h7h-journal-after.log`, 양쪽 directory identity를 대조해 저장한 `h7h-journal-paired.json`. private artifact는 Git에 포함되지 않는다.

## 자동 검증

| 검사 | 결과/근거 |
|---|---|
| runtime/language 타입·build | PASS, `h7h-build-final.log`, `h7h-language-build.log` |
| 기존 publication/recovery/host/provider/IPC | 35 PASS, `h7h-existing.log` |
| 신규 journal 기능 | 9 PASS, `h7h-journal-tests.log` |
| client/host/IPC | 25 PASS, `h7h-client-host.log` |
| 순차 전체 본체230개 | **229 PASS/0 FAIL/1 Windows batch SKIP**, `h7h-full.log` |
| 최종 guard 보강과 관련 후속 | **30 PASS/0 FAIL**: 신규2 + 기존28 재검증, `h7h-guards-final.log` |
| H7G 마지막 외부 writer 경합 진단 | PASS/exit0·protected true·저장 거절·세 후보, `h7h-writer-boundary.log`, `ide/.dev/cloud-h7f-writer-0B73Rp/receipt.json` |
| 독립 진단 재실행 | PASS, `h7h-journal-repeat-final.log`; 사용한 fixture가 변경/누락됐으면 private fixture를 재생성 |

**서로 다른 검사를 중복 합산하지 않은 최종 범위는231 PASS/0 FAIL/1 Windows SKIP, 232개다.** 전체 본체230개가 끝난 후 신규 guard2개를 별도 실행했다. 최신 파일 전체를 한 번 더 wildcard로 반복했다는 뜻이 아니다. 새 guard 보강 뒤 기존 publication/provider/channel28개를 다시 확인했다. 본체 전체는 H7G 시간 제한 근거에 따라 처음부터 concurrency1이며 timeout/skip을 늘리지 않았다.

신규 journal9개는 모든 파일/previous inode 유지·128개 이후 저장, archived vs active old-handle 쓰기, pending/preparation/unknown·stale current, parent link/target 충돌, partial abort/변경·fresh plan, 실제 fork archiver3회 이동 후 SIGKILL·exit·dead lease 회수, 최대8 reader/current2회/실패·abort join/매 요청 재검증, scan 중 current 변경 거절, **실제160회 저장과 주기적 explicit retirement**를 확인했다. 160회 검증은161개 기록 중128개를 별도 보관하고33개를 active에 유지했으며 모두 남아 있었다. 첫160회에는약252초가 걸렸다. payload가 작아도 여러 설정 guard의 반복 scan 비용이 남는다는 근거이며 장기 UI 응답 전체 수용은 아니다.

신규 host2개는 미승인/stale 거절·history/runId/원형·실제 capacity 갱신, close 중 held directory move join과 late notify 억제를 확인했다. client2개는 기존 버튼/QuickPick→정책 설명→confirmation→write 순서, 취소/dirty/trust/loading/stale/A/B/A/close를 확인했다. IPC1개는 literal approval과 plan shape 전달을 확인했다. DOM/services는 대체했고 native dialog/물리 조작은 미실행이다.

마지막 guard2개는 수정 전 **0 PASS/2 FAIL**(`h7h-guards-before.log`)을 재현했다. Windows case-only realpath를 link로 오인하던 비교를 Windows에서만 case-insensitive하게 바꾸되 실제 다른 directory는 거절한다. Windows 비교 규칙만 모델링한 Linux fixture이며 NTFS 수용이 아니다. metadata처럼 보이는 invalid UUID temp는 unknown으로 남도록 정확한 UUID 검사를 적용했다. 최초 runtime build의 implicit array type 오류도 명시적 summary type으로 보완했다. failure 로그를 삭제하지 않았다.

## 재현과 다음 범위

```bash
cd ide
source /workspace/.cloud-tools/activate.sh
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-import-journal.mjs
node scripts/verify-import-writer-boundary.mjs
```

새 task의 위 전체 명령은232개를 한 번에 실행한다. `verify-import-journal.mjs`는 private namespace의 fixture만 재사용하거나 재생성하며 사용자 프로젝트를 대상으로 하지 않는다. `--before`는 이 작업에서 보존한 ignored H7G private runtime snapshot이 필요하고 새 task에서 자동 재구성된다고 주장하지 않는다.

**active 상한을 해소할 사용자 경로가 생긴 것이며 전체 disk 사용량을 자동 제한한 것은 아니다.** archive는 계속 쌓인다. 자동 삭제·압축·dedup·외부 export·별도 archive browser/자동 수용은 없다. unknown/손상 기록이 많으면 active128개 제한을 계속 만날 수 있으며 무조건 이동/삭제해 우회하지 않는다. 오래된 virtual recovery tab의 bytes cache는 model이 남아 있는 동안 유지될 수 있지만 제거 뒤 archived record를 active 후보처럼 다시 열지는 않는다.

다음 **H7I는 반복 저장에 남는 설정 guard/scan 비용의 중복을 분리하고 안정화 잔여 수용표를 정리**한다. 무조건 캐시하거나 검증을 생략하지 않는다. native RSS/실제 설계·장시간·Windows 공식 TS7/target emission/overlay, NTFS rename/link/handle/lease·partial archive·신뢰/미저장/확인 UX·복원/종료·물리/DPI 통합은 계속 잔여다. 화면 검증은 마지막 세션으로 모은다. ide/vsix·package/lock 독립성과 미배포 정책을 유지했다.
