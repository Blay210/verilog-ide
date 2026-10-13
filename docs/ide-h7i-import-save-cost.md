# H7I 반복 설정 저장 비용 (2026-10-13)

후속 상태: [H7J](ide-h7j-semantic-burst.md)에서 실제 LSP event/query burst·2 active/32 waiting·동일 in-flight 공유·cancel/close/quarantine·과부하 재시도를 검증했다. 다음 H7K는 시작/재시작·idle/generated 이벤트 비용이다. 아래는 H7I 당시의 구현·계측·검증 기록이다.

H7H 뒤에도 `saveImportSettings`는 초기 읽기·lease 획득 후 읽기·임시 파일 fsync 후 읽기에 각각 journal scan 두 번을 쓰고, 실제 publisher에서 다시 한 번 검사했다. 저장 한 번당 전체 scan7회, current 읽기18회였고 작은 설정도 읽을 때마다1MiB 버퍼를 할당했다. 사용자가 강조한 가볍고 빠른 경험은 [성능 수용 계획](ide-performance-plan.md)과 `AGENTS.md`에 제품 요구로 기록했다.

## 검증한 내용을 요청 안에서 공유

- `readImportConfiguration`은 active journal과 시작/종료의 current bytes를 검증한 **요청 내 snapshot**을 반환한다. 관리 설정/실행 설정 parser는 그 bytes를 직접 사용한다. readiness gate 후 경로를 다시 열거나 요청 간 payload cache를 사용하지 않는다. 설정 읽기는 전체 scan2회→1회, current 읽기5회→2회다.
- scan 끝에서 active directory 존재와 UUID 목록도 다시 검사한다. 같은 bytes를 게시하다가 중단된 새 transaction은 current SHA만으로 구분되지 않으므로 membership 변경을 거절한다. journal이 없었던 설정 읽기 도중 첫 journal이 생기는 경우도 거절한다. 기존 journal-free ordinary project의 별도 readiness 조회에 새 manifest size 제한을 추가하지 않았다.
- 저장의 초기 읽기, lease 획득 후 fresh 읽기를 유지한다. 실제 semantic 분석/명시적 preview 검증과 임시 파일 fsync 뒤의 fresh snapshot을 publisher의 최종 scan과 공유하고, 관리 원형/revision을 그 snapshot으로 검사한다. 정상 저장은 pending을 거절하며 명시적 복구는 기존 선택 revision으로 pending을 처리한다. **전체 scan7→3회**, current 읽기18→7회다.
- 기존 bounded file reader로 크기+1 버퍼를 쓰고 short read를 끝까지 읽으며, file type/nlink·inode/size/mtime·SHA·strict metadata를 유지한다. writer lease, read-only 거절, 128 transaction gate, 준비 후보 fsync, capture→no-replace link, old handle 보존, 완료 metadata와 명시적 recovery/retirement는 유지한다.
- signal은 initial/current/final scan과 파일 읽기에 전달한다. reader batch는 실패/abort 후 모두 join하고 close한다. 마지막 membership listing 도중 취소도 결과를 반환하기 전에 확인한다. `.rtl/import-review-*.tmp`의 기존 실제 writer crash/외부 수정 검증 경계도 유지한다.

이번 변경은 runtime Core와 독립 IDE 안의 검증에 한정한다. `ide/src`/contract/overlay를 다시 바꾸거나 visible 앱을 실행하지 않았다. `ide/`와 `vsix/` 독립성을 유지했다.

## 같은 fixture 전후 계측

H7H runtime을 ignored private snapshot에 보존하고 **같은 디렉터리·같은 active UUID/bytes**의32/96개 settled 기록을 전후 각각3회 측정했다. 작은 managed 설정201 bytes와250 role paths의67,089 bytes 설정이다. 매 저장 결과의 bytes가 원형과 같은지 확인한 뒤 진단이 만든 새 기록만 private fixture에서 정리해 다음 표본을 동일한 입력으로 시작했다. 사용자 프로젝트/기록에는 이 정리를 적용하지 않는다.

| active 기록 | 설정 bytes | 설정 읽기 중앙값 ms H7H→H7I | 저장 중앙값 ms H7H→H7I | 저장 중 읽은 bytes H7H→H7I |
|---|---|---|---|---|
| 32 | 201 | 137→54 | 531→268 | 160,372→68,817 |
| 32 | 67,089 | 182→70 | 660→321 | 31,463,956→13,513,305 |
| 96 | 201 | 302→136 | 1,178→508 | 473,076→202,833 |
| 96 | 67,089 | 400→244 | 1,270→662 | 91,708,308→39,332,313 |

96개/67KB 저장의 전체 file open2,716→1,169, 계측된 CPU 중앙값1,849→814ms였다. CPU는 여러 thread의 합이라 wall time보다 클 수 있다. 같은 작은96개 저장에서 read에 제공된 버퍼의 누적 크기는3,620,909→203,994 bytes, 단일 최대 버퍼1,048,577→206 bytes였다. 큰 설정의 누적 버퍼94,655,477→39,333,474 bytes, 단일 최대67,090 bytes다. 누적 버퍼는 실제 read에서 사용한 buffer별 크기 합이며 parser/문자열/전체 heap/RSS를 포함하지 않는다.

성능 결과는 sequential warm-cache 합성 관측이다. 파일시스템/머신 부하를 포함하며 startup·typing·실제 설계·Windows UI의 p95 수용을 의미하지 않는다. 하나의 scan은 기존 candidate/previous payload를 계속 읽고 membership listing이 추가된다. 이번 이득은 전체 scan의 중복을 줄인 결과이며 개별 scan 자체가 모두 빨라졌다는 주장도 아니다.

근거: `ide/.dev/cloud/h7i-save-before-final.log`, `h7i-save-after-final.log`, directory/size/operation identity를 대조한 `h7i-save-paired.json`. 이전 runtime과 fixture/receipt는 ignored private artifact이며 새 task에서 자동 복원된다고 주장하지 않는다.

## 자동 검증

| 검사 | 결과/근거 |
|---|---|
| runtime/language 타입·build | PASS, `h7i-build.log`, `h7i-language-build.log` |
| publication/recovery/기존 settings + 초기 신규6 | 25 PASS, `h7i-core-final.log` |
| 최종 신규7 | 7 PASS/0 FAIL, `h7i-cost-final.log` |
| 전체 자동 검증239개 | **238 PASS/0 FAIL/1 Windows batch SKIP**, `h7i-full.log`, 약228.5초 |
| 실제160회 저장·explicit periodic retirement | PASS, 전체 suite의 실제 publisher/lease/보관 테스트, 약110.0초 |
| 마지막 capture 직전 외부 writer | PASS/exit0·protected true·저장 거절·현재/이전/요청 후보 확인, `h7i-writer-boundary.log` |

전체 결과는 최종 신규7개를 포함한다. 관련 cohort의 중복 테스트 수를 전체에 더하지 않는다. 첫 신규6개와 뒤의 마지막 membership listing 취소1개는 구분해 기록한다. 실제160회는 H7H와 같은 테스트의 새 실행이며 이전약252초와 환경/cache 조건을 완전히 고정한 paired wall-time 비교는 아니다. timeout/skip을 늘리지 않고 CPU4 환경에 맞춰 concurrency1을 유지했다. 외부 writer receipt는 `ide/.dev/cloud-h7f-writer-1oJ33v/receipt.json`이다. Windows-only batch1개는 실행하지 못했다.


신규7개는 scan/버퍼 비용 상한, 관리/실행 TOML의11-byte OS short read, 동일 bytes의 interrupted publication과 membership, journal-free→첫 journal race, 임시 fsync 후 active previous의 old-handle 쓰기, batch abort/실제 handle close/fresh retry, 마지막 listing의 취소를 확인한다. H7H runtime에 먼저 적용한6개 중 **3 PASS/3 FAIL**로 중복 비용·short read·취소 전달 결함을 재현했다(`h7i-regressions-before.log`). 새 final-listing 취소 guard 추가 뒤 신규7 PASS를 확인했다(`h7i-cost-final.log`). 정상 코드에서 실패/skip을 늘려 통과시키지 않았다.

## 재현과 잔여

```bash
cd ide
source /workspace/.cloud-tools/activate.sh
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-import-save-cost.mjs
node scripts/verify-import-writer-boundary.mjs
```

`--before`는 이 작업의 private H7H runtime snapshot을 요구한다. 일반 실행은 private fixture를 생성하거나 검증한 namespace에서 재사용한다. 제품용 cross-request 캐시·자동 profiling·환경 allocator 변경을 추가하지 않는다.

source/history/config의 다른 경로와 filesystem 전체의 원자적 snapshot, 비협력 writer에 대한 CAS/전원 장애 내구성을 완료했다고 주장하지 않는다. active128/명시적 정상32 유지·archive 자동 감시 제외 정책과 전체 archive disk 증가가 남는다. Linux waveform anonymous RSS 잔류·실제 설계·Windows 공식 본체 TS7/target emission·NTFS 실제 handle/lease/link·전체 UI/종료/재시작/DPI도 잔여다. [H7 수용표](ide-h7-acceptance-summary.md)에 묶었다. 다음 H7J는 이벤트 폭주·의미 분석 요청의 중복 비용과 취소/갱신을 headless로 점검한다. Computer Use/화면 검증은 마지막 통합 세션에 모은다.
