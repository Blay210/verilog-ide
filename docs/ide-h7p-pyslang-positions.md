# H7P — 기존 pyslang 연동의 경로·위치 계산 비용 (2026-10-13 UTC)

이 단계의 다음 H7Q는 [완성 후보 동의·scope 좌표 비용](ide-h7q-semantic-agreement.md)으로 수행했다. 아래 수치와 다음 단계 표현은 H7P 당시 기록이며 최신 잔여는 H7Q/H7 수용표를 따른다.

자체 compiler/simulator를 개발하는 단계가 아니다. 기존 pyslang bridge가 같은 filename/coordinate를 반복 계산하던 비용을 줄였다. scope/type/import/의미 진단·elaboration은 계속 pyslang이 처리하며 simulation은 기존 Verilator 연동을 유지한다. IDE/VSIX 독립성과 Code/Simulation UX는 바꾸지 않았다.

## 구현과 상한

`analyze.py`의 완성 호출 안에서만 canonical path를 재사용한다(최대4096개). 첫 경로 해석은 기존 `realpath`/`normcase`이고 상한 밖의 새 경로는 기존 계산을 수행한다. source/overlay read 및 실제 input/candidate tracking의 경로 확인·Core publication/파일 검증은 줄이지 않았다. 다음 요청/independent test에는 새 목록을 만든다. 파일 읽기/검증이나 설정·settled 결과를 요청 사이에 유지하는 cache는 없다.

같은 SourceManager의 immutable buffer/fully-original location을 `SourcePositions`로 변환한다. 최대64 buffer·encoded bytes/line index payload4MiB·4096 coordinate만 요청에 보관한다. buffer budget 밖에서는 원래 UTF-8 prefix→UTF-16 계산을 수행하고 point budget 밖에서도 새 위치를 계산한다. ASCII는 byte/UTF-16 offset이 같고, Unicode는 줄별 byte/UTF-16 시작점에서 해당 줄의 prefix를 변환한다. LF만 line으로 세던 기존 계약, CRLF/BOM/astral·중간 UTF-8 replacement·EOF 밖 offset clamp를 유지한다. coordinate 결과는 매번 독립 dict를 반환해 caller 변경이 다른 위치에 영향을 주지 않는다.

4MiB는 encoded data/line-array payload이며 Python 객체·allocator·기존 compiler AST·transient conversion까지 포함한 전체 RSS 상한이 아니다. 각 buffer index의 크기를 먼저 계산하여 newline이 매우 많은 입력도 상한을 넘는 index를 만들지 않는다. 같은 파일명/BufferID라도 manager가 바뀌면 재사용하지 않는다. byte/파일 재검증을 우회하는 cache나 persistent worker를 추가하지 않았다.

독립 test/default elaboration·definition 서명·scope traversal/lookup과 교집합·decl order/shadowing/enum/callable·실제 include/macro 위치는 유지한다. hierarchy도 같은 coordinate 변환을 사용한다. Node의2 active/32 waiting·generation/version·신뢰·manifest/journal/FS guard, request-local batch·checkedProcess의 실제 group cleanup/quarantine/drain·15초 provider budget은 그대로다. internal/scope operations의 수용 범위를 새로 확장했다고 주장하지 않는다.

## 계측 방법과 회귀

cProfile로 작은300 RTL/자동 package/독립 test2개에서 Python 경로 helper의 호출 수만 확인했다. native pyslang 파일 I/O 전체 횟수나 이 profiler의 wall time을 성능 결과로 사용하지 않는다. 첫 분석에서 test별 `realpath`1834/`posix.lstat`14675 호출을 확인했다. 요청 안의 canonical 재사용 뒤1220/9763으로 감소했다. 이 경로 해석 중복은 실제 source read나 Core 입력 검증 제거와 다르다.

전후 비교는 같은 현재 provider/Core/server/events/lexer·동일 fixture 구성을 사용하고, private H7O `ide/.dev/cloud/h7p/analyze-before.py`와 현재 bridge만 바꾼다. helper의 `__file__`는 양쪽 모두 실제 IDE bridge 위치로 설정하여 own imports/CWD 조건을 유지한다. 일반 tests는 snapshot이 없어도 실행된다. private baseline은 앱 빌드 입력이 아니다.

기준 workload는 RTL300개·의존 순서와 발견 순서가 반대인 package2개·같은 top/helper 이름의 TB2개·서로 다른 same-basename include·미저장 package/source이다. 추가 source는 한글/이모지/CRLF 주석2000줄·ports96개·common int128개를 포함한다. 분석/공유 RTL 완성/선택 TB 완성/선택 hierarchy의 전체 JSON을 path-normalize하여 전후 hash가 같아야 한다. actual IPC는 H7O의 정상 inline completion/missing/malformed recovery fixture이고 전후 모두 실제 fresh query를 실행한다. AB/BA 순서를 번갈아 전후5회씩 기록한다. RPC watcher는 ack/직접 notification 모델이며 physical Windows/UI latency가 아니다.

## 최종 5회 계측과 자동 검증

`h7p-positions-results.json`(전후×5 =10 receipts)/`h7p-positions-final.log`는 exit0이며 분석·공유 완성·선택 TB 완성·hierarchy **20쌍 전체 JSON hash가 일치**한다. `h7p-final-sources.json`은 현재/이전 bridge와 helper/script/test SHA 및 receipt source 일치를 확인한다. baseline bridge의 SHA는 `3aac90617e3db85299e4561e29ee5431b432776f3854cdddf40e808cd9852d7c`다. 실제 SourceManager/입력/결과를 사용했고 lexical completion이나 모형 coordinate로 의미 결과를 대신하지 않는다.

| 큰 입력 작업 | wall 중앙값 H7O / H7P, ms | 관측 범위 H7O / H7P, ms | Python 시작 (매회) |
|---|---|---|---|
| analysis-two-tests | 612.9 / 561.1 | 581.4～1996.1 / 491.7～721.4 | 2 / 2 |
| unsaved-shared-completion | **1417.6 / 991.9** | 1312.3～1622.3 / 923.4～1391.4 | 2 / 2 |
| one-test-completion | 605.6 / 563.6 | 548.5～1071.5 / 441.0～718.2 | 2 / 2 |
| hierarchy-one-test | 449.1 / 388.0 | 370.9～2439.9 / 361.1～527.1 | 2 / 2 |

공유 완성의 계측 CPU 중앙값은 completion556.5→224.1ms/default signature98.5→63.3ms, input tracking27.8→28.6ms/bridge import129.6→148.8ms다. SourcePosition 변환을 사용하는 단계의 비용과 완성 경로 해석의 중복을 줄였고, 원래 분석/정렬/입력 검증을 생략하지 않았다. 호출 수 계측 `h7p-call-counts.json`/`h7p-calls-final.log`는 dependencies realpath302/lstat2416을 양쪽 그대로 유지하고, 각 test completion group의 realpath1834→1220/lstat14675→9763을 확인했다. profiler는 순수 호출 수 근거이며 latency 측정과 별도 실행했다.

Python peak RSS 중앙값은 analysis37.8→37.7MiB/shared completion40.5→40.7MiB/선택 TB39.1→39.6MiB/hierarchy36.0→35.6MiB다. 작은 증가와 감소가 섞였고 전체 메모리 개선으로 판정하지 않는다. 4MiB payload·64 buffer·4096 point의 상한은 별도 계약 검사이며 RSS 상한이나 그만큼 항상 추가 할당한다는 뜻이 아니다.

작은 정상 IPC inline 편집→완성은 시작4→4, wall 중앙값1186.7→1302.8ms(관측1026.4～1950.1 / 1069.0～1637.2)였고 개선으로 표시하지 않는다. mixed startup1353.2→1476.4ms, source/missing/malformed 재검사·idle/status·manifest 생성/복구의 작업 수는 전후 같다. 대표 Windows latency/p95·native watcher 비용·전체 앱 체감 개선을 주장하지 않는다. 변동이 겹치는 관측을 일반적인 성능 예산으로 삼지 않는다.

모든 fixture의 실제 Python exit/cache0와 IPC registration0/parent exit0·원본 bytes 보존을 확인했다. 고정 corpus의 계층/의미 JSON hash 일치와 함께 기존 real enum·callable·package visibility·decl order/shadowing·independent test·macro/include/journal·미저장 plaintext header·취소/cleanup/quarantine 회귀를 최종 suite에서 검사했다.

| 검사 | 이번 결과/근거 |
|---|---|
| runtime/language build | PASS, h7p-runtime.log/h7p-language.log |
| 기존 semantic/input/request | **39 PASS**, h7p-initial.log |
| 새 coordinate/fresh manager/alias 최종 | **4 PASS**, h7p-guards-final.log |
| 최종 순차 전체308개 | **307 PASS/0 FAIL/1 Windows batch SKIP**, h7p-full.log,148749ms |
| 5회 paired provider/actual IPC | PASS/exit0,20 semantic hash pairs와 source/cleanup/원본 보존 |
| 실제 Python helper 호출 수 | PASS/exit0, dependency 검사 수 유지·test별 중복 해석 감소 |

새4개는 BOM/CRLF/한글/astral/Unicode line separator/중간 byte/EOF의 모든 좌표를10,000회 이상 기존 prefix 계약과 대조하고, zero/작은 예산 fallback·dict 독립성·대형 Unicode prefix의 정확한 scope/order/좌표·새 overlay/manager·같은 file/buffer id·alias의 실제 source 허용과 다음 요청의 foreign retarget 거절을 확인했다. 첫 coordinate wrapper2 FAIL은 checkedProcess의 반환 string을 stdout 객체로 잘못 읽은 시험 오류였다(`h7p-points-first.log`); Python의 좌표 assertion은 통과했고 wrapper를 수정한3 PASS와 alias 추가 뒤4 PASS/전체를 사용한다. 첫 작은 paired1회는 h7p-paired-first.log에 보존하고 최종 큰 입력5회와 합산하지 않는다. timeout/queue 한도를 늘리거나 검사를 skip하지 않았다.


## 다음과 남은 범위

다음 H7Q는 남은 별도 package dependency 시작·default signature/완성 traversal/lookup 비용과 실제 query 대기를 분리하고, 필요하다면 요청 안의 작업만 공유하는 설계를 검증한다. 프로젝트 파일 재검증·snapshot/version·independent test ambiguity·macro/include/UTF-16 위치·실제 취소/join을 유지한다. 자체 compiler/simulator·persistent process/settled cache·새 성능 설정 화면·임의의 native latency 예산을 추가하지 않는다.

Windows 공식 TS7 전체 타입/target emission·native watcher/RelativePattern/root rename/case/junction·LanguageClient/host/taskkill·실제 앱/physical UI·대표 설계/장시간/RSS·전체 archive disk/clean Windows/FST/enum/encoding은 남는다. 화면/Computer Use는 마지막 통합 세션으로 보류한다. 기존 도구/변경을 유지하고 GitHub main85ba1fe6f245182faf90602628560cd04f8bcf69를 읽기 전용으로 확인했다. setup 재설치/초안 저장·게시·deps/lockfile·VSIX 변경·commit/push·패키징·배포는 하지 않았다.

```bash
cd ide
source /workspace/.cloud-tools/activate.sh
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-semantic-positions.mjs
node scripts/verify-semantic-position-calls.mjs
# 이 작업의 private H7O bridge가 있을 때만:
node scripts/verify-semantic-positions.mjs --compare --samples=5
node scripts/verify-semantic-position-calls.mjs --compare
```
