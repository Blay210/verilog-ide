# H7Q — pyslang 결과의 독립 테스트 합치기·scope 좌표 비용 (2026-10-13 UTC)

이 단계의 다음 H7R은 [요청별 package 시작 공유](ide-h7r-package-session.md)로 수행했다. 아래 수치와 다음 단계 표현은 H7Q 당시 기록이며 최신 잔여는 H7R/H7 수용표를 따른다.

기존 pyslang 연동의 자동완성 비용을 계측해 Node에서 같은 symbol을 테스트 간 반복 직렬화하는 병목을 확인했다. 자체 compiler/simulator 개발은 아니며 Code/Simulation UX·IDE/VSIX 독립성과 기존 Verilator simulation을 유지한다.

## 의미 결과와 계산 방식

독립 test context의 완성 후보는 이름/타입/선언 위치/enum/callable/default를 포함한 **전체 JSON이 모든 context에서 동일**해야 한다. 이전 pairwise `filter/some`은 symbol마다 다른 context의 후보와 비교하며 동일 JSON을 O(n²)번 만들었다. 현재는 상대 context의 전체 JSON을 Set에 한 번씩 넣고 첫 context를 순서대로 필터링한다. 첫 context의 순서/중복과 기존 JSON property order를 포함한 정확한 동의 조건은 유지한다. 이름만 비교하거나 우연히 같은 hash를 갖는 symbol로 통합하지 않는다.

Set은 해당 merge iteration에만 보관하며 크기는 이미 받아둔 context 결과 수 이하이다. 새로운 결과 cache나 request 사이의 공유는 없다. 단일 test는 기존처럼 직접 반환하고, 각 test의 실제 SourceManager/compilation/defaults와 공유 RTL ambiguity를 유지한다.

Python scope traversal에서는 모든 symbol 이름을 먼저 수집한 후, scope 시작 위치가 query file에 속하지 않으면 그 end의 좌표를 계산하지 않는다. 기존 range 조건에서 해당 scope는 항상 제외됐으므로 이름 후보·pyslang lookup/decl order/shadowing/visibility는 그대로다. 실제 scope/type 해석을 자체 구현하거나 default elaboration을 생략하지 않았다. H7P의4MiB/64 buffer/4096 coordinate와4096 canonical 경로 상한도 유지한다.

Core의 package graph/순서/duplicate·unknown explicit import·cycle·같은 파일의 선언 앞 사용 검증은 그대로 둔다. 현재 이 graph가 검사된 뒤 별도 analysis process를 시작한다. package의 고정 process/import 비용은 남으며 이 단계에서 감소했다고 주장하지 않는다. 이를 합치려면 Core가 정렬/오류를 판정한 뒤에만 analysis를 시작하는 요청 내 protocol과 실제 취소/join을 먼저 설계해야 한다. Core 검증을 Python에 복사하거나 settled graph cache로 대체하지 않는다.

provider2 active/32 waiting·generation/version·신뢰·manifest/journal/FS/미저장 보호와15초 compiler budget·checkedProcess 실제 process-group cleanup/quarantine/drain은 유지한다. 새로운 native watcher/설정 UI·persistent Python worker를 추가하지 않았다.

## 재현·계측과 회귀 범위

소유 H7P provider/bridge snapshot은 `ide/.dev/cloud/h7q/`이다. 일반 tests는 현재 소스만 사용한다. diagnostic `verify-semantic-merge-calls.mjs --compare`는 실제 Node/Python/pyslang 요청에서 semantic-symbol에 대한 JSON.stringify 호출 수/문자 수를 센다. 계수 wrapper를 씌운 실행 시간은 일반 latency 결과로 사용하지 않는다.

전후 비교는 같은 현재 Core/server/events/lexer와 동일 구성·내용의 재생성 fixture(300 RTL/package2/독립 test2/한글·이모지·CRLF2000줄/ports96/common int128)이며 provider와 bridge만 바꾼다. 분석/공유 완성/선택 TB/hierarchy 전체 JSON을 정규화해 비교하고, provider phase의 Node CPU와 Python 단계 CPU·별도 dependency 시작 비용을 구분한다. actual IPC는 양쪽 모두 fresh inline query·missing/malformed 복구를 실행한다. RPC watcher는 acknowledgement/직접 notification 모델로 native Windows/UI 지연 수용이 아니다.

## 최종 5회 비교와 자동 검증

최종 runtime/language build 뒤 순차 전체 **311개: 310 PASS / 0 FAIL / 1 Windows batch SKIP**, 158,759ms였다. 기존 의미·입력·요청·좌표 회귀43개와 신규3개도 각각 PASS다. 신규 검증은 전체 nested JSON 동의·property order·첫 순서/중복, 실제 package duplicate/cycle/unknown/same-file order의 분석 전 거절과 fresh 복구, held dependency process 취소 후 실제 종료/임시 파일 회수다. 이전 구현도 보호해야 하는 의미 계약이며 baseline의 의미 오류를 새로 발견했다는 뜻은 아니다. timeout 연장이나 추가 skip은 없다.

최종 별도 5회 AB/BA 교대 비교의 분석/공유 완성/선택 TB/hierarchy **20쌍 전체 JSON hash가 동일**했다. 양쪽 actual IPC는 매회 inline fresh symbol을 실제 반환했다. 모든 소유 Python PID가 종료했고 temp/cache·IPC 등록 잔류0, parent exit0·원본 bytes 보존을 확인했다. baseline/current provider·bridge와 동일 Core/server/events/lexer/helper hash를 receipt와 `ide/.dev/cloud/h7q-final-sources.json`에 기록했다.

| 큰 입력의 실제 provider 작업 | wall 중앙값 H7P → H7Q, ms | 관측 범위 H7P / H7Q, ms | Node CPU 중앙값 H7P → H7Q, ms |
|---|---|---|---|
| 분석·독립 테스트2개 | 604.5 → 570.8 | 484.9–812.7 / 499.5–643.7 | 29.4 → 42.7 |
| 미저장 공유 RTL 완성 | 1158.5 → 865.8 | 963.4–1683.2 / 767.0–2505.1 | 319.9 → 33.7 |
| 선택 TB 완성 | 591.9 → 578.9 | 555.1–707.6 / 506.0–926.3 | 22.4 → 18.6 |
| 선택 TB hierarchy | 383.9 → 410.0 | 325.6–454.6 / 352.6–938.9 | 15.7 → 19.6 |

Node CPU는 정규화/hash 전에 전체 provider operation에 사용한 현재 Node process의 CPU이며 merge만의 CPU나 child Python CPU가 아니다. 공유 완성 범위는265.3–339.1 →27.3–205.1ms였다. Python completion CPU 합 중앙값306.1 →263.6ms(215.6–434.4 /223.8–710.8), process peak RSS 중앙값40.6 →40.6MiB다. 개선 후 wall 최댓값2505.1ms와 Python CPU의 큰 편차도 그대로 남겼다. 전체 응답 지연·tail latency·메모리 수용을 완료했다고 판정하지 않는다.

별도 계수 실행은 semantic-symbol JSON.stringify **93,326 →608회**, 직렬화한 문자 **19,013,967 →123,654개**였다. 계수 wrapper의 wall 시간은 위 latency 표에 포함하지 않는다. 이 fixture의 symbol 수/비교 작업 수가 결과이며 모든 설계의 고정 절감률은 아니다.

작은 실제 IPC의 편집→완성 중앙값1277.2 →1472.2ms(1127.8–1532.3 /1083.2–2588.4), mixed startup1401.6 →1533.5ms였다. 이 경로의 개선은 확인하지 않았다. watcher ack/settle debounce/대기·Core load/provider가 함께 포함되어 각각의 native/queue 비용으로 분리할 수 없다. 양쪽 startup/edit Python 시작4회, create/repair2회가 유지되고 unrelated100 notifications/idle20 status의 추가 compiler0·missing root read0/malformed read1 보호도 유지됐다. idle phase에는 의도한500ms 관찰 대기가 포함된다.

모든 큰 provider phase는 양쪽 Python 시작2회다. 자동 package dependencies process에서 계측된 단계 wall 합의 공유 완성 중앙값110.9 →125.3ms(104.9–169.1 /98.6–688.4), bridge import CPU75.2 →85.6ms, dependency traversal CPU15.2 →12.8ms였다. process bootstrap/IPC 잔여는 이 합에 포함되지 않는다. package traversal만으로 시작/import 비용 전체를 설명하지 않으며, 이 별도 process 비용은 남는다. 대표 실제 설계/Windows·tail/queue 검증은 잔여다.

최종 근거는 `ide/.dev/cloud/h7q-{runtime-final,language-final,full,agreement-final,merge-final}.log`, `h7q-agreement-{before,after}-{1..5}.json`, `h7q-agreement-results.json`, `h7q-merge-calls.json`이다. private H7P provider SHA `57a0a28959c6650b1972c5b47103c2c27c453b83cbb242dbe798f229fc44f99b` / bridge `23d52b0c841b91275de8a0c2400fca0b1914dea5afb8f8858732342fe0a25bfd`, current provider `6b225440e3877554f9cad9295cd57e5d3d28cb0cdcab8beac7ba5b6d1c915104` / bridge `9ede2aaf92fc3dd8a4ccf905446ec130adb70dfe30fe2bacaec3efe12731c9ae`다. 이 ignored 로그/snapshot은 별도 보존이 없으면 다른 checkout에서 복원되지 않는다. 현재 진단·일반 tests는 현재 소스만으로 실행하며 비교 옵션은 보존한 두 snapshot이 있어야 한다.

최종 source manifest의15개 파일과10개 receipt의 전후 provider/bridge identity를 재확인했다. `/proc`에서 소유 fixture의 compiler/IPC process 잔류0, 갱신 문서13개의 로컬 링크830개 누락0·`git diff --check` PASS다.

## 남은 범위와 다음 H7R

다음 H7R은 남은 별도 package process/import 시작 비용을 요청 안에서 공유할 protocol의 설계·취소/정리 경계와 재현이다. Core의 graph 오류·정렬을 authoritative하게 유지하고 검증 완료 전에 test 분석을 실행하지 않는다. 구현 근거가 부족하면 생략/무검증 cache나 자체 package/언어 엔진을 대신 추가하지 않는다. default/완성 lookup과 실제 queue/watcher/native latency·대표 설계/장시간도 남는다.

Windows 공식 본체 TS7 전체 타입/target emission·실제 watcher/root rename/case/junction·LanguageClient/host/taskkill·physical UI·대표 실제 설계/장시간/RSS·전체 archive disk·clean Windows/FST/enum/encoding은 잔여다. 화면/Computer Use는 마지막 통합 세션으로 보류한다. 기존 pinned Node24.19.0/Python3.12.14/pyslang11.0.0/Verilator5.032와 변경을 재사용했고 main85ba1fe6f245182faf90602628560cd04f8bcf69를 읽기 전용으로 확인했다. setup 재설치/초안 저장·게시·deps/lockfile·VSIX 변경·commit/push·패키징·배포는 하지 않았다.

```bash
cd ide
source /workspace/.cloud-tools/activate.sh
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-semantic-agreement.mjs
node scripts/verify-semantic-merge-calls.mjs
# 이 작업의 private H7P provider/bridge가 있을 때만:
node scripts/verify-semantic-agreement.mjs --compare --samples=5
node scripts/verify-semantic-merge-calls.mjs --compare
```
