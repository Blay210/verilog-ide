# H7E — 보관 소스 cache 해제·RSS 원인 분리 (2026-10-12)

[H7D](ide-h7d-waveform-restoration.md) 이후 보관 소스64MiB cache의 누적/해제와 같은 retained VCD의 worker 메모리를 확인했다. **소스 cache 누적과 stale 소스 탭 열기를 보완했다. RSS는 일부 allocator 영향을 확인했지만 회복 전체는 미해결이다.** 앱 화면·새 시뮬레이션·배포는 실행하지 않았다.

## 보관 소스 cache와 실제 보완

기존 `rtlSimulationHome.ts`의 Map은 모델 해제·프로젝트 전환·dispose 때 비워지지 않았다. 64MiB에 도달하면 ‘앱을 다시 열어 주세요’ 오류가 났다. 소스를 선택한 뒤 실제 bytes 응답을 기다리는 동안 A/B/A 전환하거나 창이 종료되어도 이전 요청으로 탭을 열 수 있었다.

- `runtime/recorded-source-cache.ts`: 순수 browser/Core 사용 가능한 **64MiB UTF-8 bytes/256 entries LRU**. 한도 도달 시 오래된 항목부터 비우며 계속 읽을 수 있다. 빈 파일도 entry 한도로 제한한다. 단일 oversized 값은 cache하지 않고 반환한다; Core의 기존 source 검증/파일 한도는 그대로다.
- 같은 URI의 동시 stat/read를 한 번의 loader로 합친다. 실패는 cache하지 않고 retry 때 다시 검증한다. release/clear/dispose 이전의 pending 응답은 뒤 요청의 cache를 덮어쓰지 못한다. 시작 전에 무효화된 loader는 호출하지 않는다.
- owned provider는 **TextFileEditorModelManager.onDidRemove**에서 해당 URI bytes를 해제한다. 단순 editor 탭 close 이벤트를 쓰지 않는다: 다른 그룹/diff/참조가 같은 model을 유지할 수 있기 때문이다. pinned `textfiles.ts`의 event와 manager 실제 remove→fire 경로를 확인했다.
- project root 변경은 cache clear와 별도 epoch 증가, 창 dispose는 cache dispose다. source-list/선택/bytes 조회/exists 뒤에 root/epoch/종료를 확인하므로 A/B/A·late 응답으로 탭을 열지 않는다. 새 보관 URI에는 root를 넣어 다른 프로젝트에서 다시 읽는 요청을 거절한다.
- 이전 버전의 root 없는 URI는 현재 프로젝트에서 Core 검증을 거쳐 읽을 수 있다. 명시적인 새 URI context를 자동으로 다른 root에 붙이지 않는다. readFile은 cache bytes의 복사본을 반환하며 readonly provider 정책과 labels/diff UX를 유지한다.

**64MiB는 provider가 보관하는 bytes의 예산**이다. Code-OSS text models·이미 반환된 읽기 복사본·진행 중 IPC/UTF-8 encoding·모든 editor 메모리 합계의 상한이 아니다. eviction은 이미 열린 모델의 표시 내용이나 탭을 닫지 않는다. 다시 실제 파일을 읽는 경우에는 Core hash 검증을 거치므로 삭제/변조된 artifact를 예전 cache로 무조건 대체하지 않는다.

browser owned source의 변경 전 SHA256 `de83174f50ab48f644f4d8696066ee10b2fc7f31b7b262dc40443884eea26e9e`를 `git show HEAD`와 대조해 overlay previousSha256에 기록했다. 새 cache module의 owned common target도 추가했다. 기존 Node channel의 H7C hash는 유지했다. foreign source 강제 overwrite/형제 프로젝트 import는 추가하지 않았다.

## 재현·회귀와 정확한 범위

| 검증 | 결과/근거 |
|---|---|
| 이전 owned provider로 모델 제거/stale navigation 재현 | **0 PASS/2 FAIL**, `.dev/cloud/h7e-provider-before.log`; 모델 제거 뒤 변조 검증 loader를 호출하지 않음, A/B/A 뒤 stale 탭 open 성공 |
| cache/provider/overlay 관련 | **13 PASS/0 FAIL**, `.dev/cloud/h7e-related-final.log`: cache6 + provider5 + overlay2 |
| 전체 IDE | **187 PASS/0 FAIL/1 Windows batch SKIP**, 총188개·runtime/language build, `.dev/cloud/h7e-full-final.log` |
| Linux RSS matrix 최종 | **3 case 기능/worker lifecycle PASS**, 12회씩·144 created/144 exited/live0; RSS gate 전체 PASS 아님 |

cache 회귀는 실제 default64MiB budget에16MiB files5개를 읽어4개만 유지/oldest 재검증, UTF-8 byte count, empty/oversized, LRU touch, 실패/retry·coalescing, pending release/clear의 새 요청 보호·dispose/no-late-loader를 검사한다. provider 회귀는 실제 owned Home constructor/provider/navigation/dispose 코드를 실행한다. **URI/Event/Disposable/resources는 고정 Code-OSS의 실제 구현**, DOM/render·file service·channel 응답·model removal event source는 대체했다. 실제 text-model manager가 탭/그룹/diff에서 model을 언제 제거하는지는 마지막 Windows 통합 수용이다. 화면 표시·official 전체 TS7 타입/target emission 통과를 이 시험으로 대신하지 않는다.

이전 source 재현은 private `.dev` test copy에 `git show HEAD`의 원문을 넣었다. 추적 소스나 dist를 되돌리지 않았다. 첫 provider 시험은 test harness가 Module._compile에 filename 대신 null을 전달해 Node assertion으로 종료했다. harness를 문자열 filename으로 보완했고 최종 관련/전체에서 제품 회귀를 포함해 모두 통과했다. pending cache 회귀는 loader 시작을 기다린 뒤 release/clear/dispose하는 gate로 강화했고 최종 전체를 다시 실행했다.

## RSS 분리 계측

`scripts/verify-waveform-memory.mjs`는 H7D의 **4,096 signals/262,144 changes/1,893,143 VCD bytes**를 읽기 전용으로 재사용한다. 독립 Linux child에서 idle worker4개, 실제 retained 검증/parse4개, 동일 trace와 `MALLOC_ARENA_MAX=2`를 비교했다. 각12회·case별48 worker가 모두 종료됐고 `/proc/self/task`는11→열기15→종료11이다. glibc 설정은 진단 child에만 적용했다.

최종 receipt: `ide/.dev/cloud-h7e-memory-qkm7ua/receipt.json`, 로그 `.dev/cloud/h7e-memory-final.log`. pinned 실제 worker에 진단 메시지 wrapper를 얹어 parser/query는 그대로 실행했다. worker GC 후 heap, main heap/ArrayBuffer, process RSS, smaps Anonymous, thread count를 수집했다.

| case | 초기 RSS MiB | 12회 종료 RSS MiB | 진단 trim 뒤 RSS MiB | 종료 main heap MiB | 열려 있는 worker heap MiB/개 |
|---|---:|---:|---:|---:|---:|
| idle/default | 44.3 | 83.6 | 78.9 | 7.8 | 5.6 |
| trace/default | 44.6 | 375.7 | 345.3 | 8.6 | 19.7～19.8 |
| trace/arena2 | 43.9 | 354.7 | 330.2 | 8.6 | 19.7～19.8 |

worker heap은 첫/마지막 회차가 비슷하고 main ArrayBuffer는 약0.2MiB였다. 그러나 이는 main/worker의 현재 V8 live heap 관측이며 process의 native page 전체를 설명하지 않는다. 각 case는 생성한 child가 종료하면 끝나며 native app의 장시간·실제 대표 설계 검증은 아니다.

추가 진단은 `scripts/helpers/malloc-trim.c`의 **격리된 N-API helper**로 glibc `malloc_info`와 종료 뒤 `malloc_trim(0)`을 호출했다. GCC `-Wall -Wextra -Werror`로 빌드했다. app/runtime/worker bundle에 넣지 않았고 OS/앱의 allocator 설정도 변경하지 않았다.

- default trace: glibc arenas14, system 약63.7MiB/free chunks55.2MiB; 진단 trim은 RSS 약30.4MiB를 줄였다.
- arena2 trace: arenas2, system 약40.9MiB/free chunks32.4MiB; trim은 RSS 약24.5MiB를 줄였다.
- 이후 default trace의 **Anonymous 약317.3MiB**, arena2의 **약302.1MiB**가 남았다. glibc 통계가 이 나머지를 설명하지 못한다. allocator가 RSS 일부를 유지한다는 근거이며, 전부 allocator 문제/누수 없음/회복 완료라는 근거가 아니다.

**원인 분리 결과:** live worker/thread 누적과 현재 JS heap의 큰 증가를 이번 workload에서 관찰하지 않았고 glibc의 일부 영향은 직접 확인했다. 나머지 anonymous resident pages는 V8/native page reservation·다른 retained allocation을 추가 profiler로 구분해야 한다. production에 강제 trim·arena 변경·reader 축소를 넣어 수치를 숨기지 않았다. RSS 회복 gate는 남긴다. 앞선 helper 없는/trim-only matrix는 `.dev/cloud/h7e-memory.log`, `h7e-memory-trim.log`이며 최신 allocator 통계 근거는 final이다.

## 재현과 다음 단계

`cd ide`, `source /workspace/.cloud-tools/activate.sh`, `npm run build:runtime` 후:

```sh
node scripts/verify-waveform-memory.mjs --retained .dev/cloud-h7d-wave-FVU777 --rounds 12
```

optional `--headers /workspace/.cloud-tools/node24-headers/node-v24.19.0/include/node`를 붙이면 GCC/N-API glibc helper도 실행한다. 이번 header archive는 공식 Node24.19.0 SHASUMS256과 SHA256 **54f14a297d47ea0794fe272363703d9dc419c96ac68f20d890f98b63754a3e4c**를 대조했다. SDK는 checkout 밖에 있고 새 cloud에서는 별도 verified 준비가 필요하다. header flag를 생략하면 기본 matrix는 실행하고 native helper를 **unrun**으로 기록한다. retained fixture가 없으면 H7D lifecycle script로 새 private fixture를 먼저 만든다. 모든 진단은 Linux/glibc 한정이고 대표 설계/Windows 수용이 아니다.

다음 **H7F는 필수 source/설정이 손상·누락된 프로젝트의 보관 이력 접근과 외부 writer/crash 복구 잔여**를 headless 가능한 부분부터 확인한다. RSS 나머지 원인·장시간/실제 설계와 다음 Windows gate는 유지한다.

- 변경된 Home/cache overlay의 공식 전체 TS7 타입·target emission·재적용.
- 실제 Code-OSS model/tab/diff/group/공간 참조 해제와 복원, cache eviction 뒤 read-only/변조 안내·표시 snapshot 유지.
- Windows taskkill/종료·미저장 보호·공간/선택/파형 복원·물리 통합 세션.
- native RSS·실제 수천 신호 설계·clean Windows 설치, FST 내장 표시/enum·베타/배포 전체 수용.

ide/vsix 독립성을 유지했고 vsix·각 package/lock을 변경하지 않았다. commit/push·설치/릴리스 패키징·앱 화면은 수행하지 않았다.
