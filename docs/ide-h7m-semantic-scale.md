# H7M 소스 범위별 의미 분석·감시 규모 (2026-10-13 UTC)

> 이 문서의 다음 H7N은 [요청별 compiler 시작 공유](ide-h7n-semantic-request.md)에서 실행했다. 최신 결과/다음 H7O는 해당 문서와 H7 수용표를 따른다. 아래는 H7M 당시 근거다.

H7L의 실제 input/include·candidate·journal 무효화,2 active/32 대기·in-flight 공유와 실제 취소/정리 join을 유지하면서 **관계없는 root 분석과 중복 감시 등록**을 줄였다. 이번은 cloud/Linux 자동 검증이다. 실제 Windows 앱·화면 검증을 실행하지 않았다.

## 원인과 구현

H7L은 healthy root에서도 일반 RTL watcher/편집 이벤트를 모든 root로 보냈다. 각 source directory에 dynamic watch를 추가했고, 전체 등록 집합 변화는 peer에도 확인 compilation을 요구했다. 수백 source가 각 폴더에 놓이면 source 수에 비례해 등록 명세가 늘었다.

- Core는 이미 검증한 source pattern(package·RTL·각 test, glob/명시적 literal)의 **static directory prefix**와 선언된 include directory를 산출한다. 기존 fast-glob의 공개 generateTasks를 재사용하며 길이/brace/negative/literal 보호를 그 호출 전에 적용한다. prefix는 완전한 glob membership matcher가 아니므로 같은 범위의 불필요한 이벤트가 남을 수 있다.
- metadata는 해당 parsed Project 또는 discovery 오류 객체에 WeakMap으로 연결한 immutable 값이다. Project JSON/계약·input fingerprint를 바꾸지 않고 다음 요청의 파일/manifest bytes 검증을 대신하지 않는다. 정상 source discovery·include stat·기존 publication readiness 검사 횟수/내용은 유지한다. 명세를 파싱했지만 외부 source가 아직 없는 오류도 prefix를 보존해 생성 감시/재시도를 가능하게 한다.
- healthy 상태에서 실제 inputs/candidates/ancestor·manifest/active journal은 계속 무효화한다. 그 외 source event는 prefix에 해당하는 root를 갱신한다. 새 glob member·test/package/literal 폴더·외부/공유 source도 포함한다. metadata가 없거나 분석이 실패하면 기존 보수적 routing을 유지한다. plain text include는 actual membership으로, 일반 RTL 문서는 같은 prefix routing으로 처리한다. unrelated README/비RTL editor 타이핑은 의미 분석을 새로 시작하지 않는다.
- workspace 내부의 보통 RTL 경로는 기존 raw watcher를 재사용한다. generated 실제 include·외부 경로·비RTL input/candidate에는 dynamic RelativePattern을 유지하고, 외부/비RTL source prefix는 recursive auxiliary watch로 신규 구성을 감지한다. recursive parent가 덮는 child 명세를 제거한다. 이는 **프로토콜 등록 명세 수** 개선이며 실제 OS handle 수 감소를 측정한 것으로 표현하지 않는다.
- 확인 read는 자기 root의 nonempty 감시 집합이 바뀔 때만 수행한다. peer 등록 변경과 static RTL 감시만 남는 removal-only 전환은 compiler를 다시 실행하지 않는다. 신규/변경된 include 감시에는 registration ack 뒤 확인 read를 유지하며 replacement 순서·unregistration ack·실패/close join을 지킨다.
- Core glob이 실제로 탐색할 수 있는 explicit case variant 경로는 새 member 알림을 숨기지 않는다. generated 판정은 Core glob ignore의 정확한 이름과 일치시키고 기존 literal 제한을 그대로 유지한다. 초기 test는 dot directory를 명시하지 않은 glob이 그 파일을 탐색한다고 잘못 가정했다. 명시적 .RTL glob/known member→new member로 실제 Core truth를 검증했다.
- 상태 조회는 실제 input Set을 먼저 사용하고 예외 때 listed source 검사로 돌아간다. 감시 ack를 기다리는 실패 처리도 generation/abort를 다시 확인한다. missing manifest를 고쳐 새 분석이 진행 중인데 이전 실패가 Project not configured로 덮는 경계를 차단했다.

## 실제900 RTL·3회 전후 계측

private fixture3 roots×300 RTL, source별 directory900개, shared header와 unsaved buffers를 사용했다. actual Node IPC LSP/Python3.12.14/pyslang11이며 클라이언트는 표준 registration/unregistration에 ack하고 파일 알림을 **수동 전송**한다. Native filesystem event 전달/Windows UI latency는 이 결과의 수용 범위가 아니다. both modes에 동일한 현재 Core를 private wrapper로 계측한다. 작업 횟수 개선을 Core 단일 호출 자체의 최적화로 표현하지 않는다.

| workload | H7L 실제 compilation(3회) | H7M 실제 compilation(3회) | 입력→세 root Ready/hover 중앙값 |
|---|---|---|---|
| startup | 6/6/6 | 3/3/3 | 2241.1→1535.7ms |
| local unsaved edit | 3/3/3 | 1/1/1 | 973.0→823.6ms |
| 100 local source notifications | 3/3/3 | 1/1/1 | 988.3→711.4ms |
| unconfigured RTL notification | 3/3/3 | 0/0/0 | 1417.9→7.6ms |
| new nested glob member | 4/4/4 | 1/1/1 | 1639.3→604.3ms |
| two roots add shared include | 5/5/5 | 4/4/4 | 1262.9→1126.9ms |
| shared header change | 3/3/3 | 2/2/2 | 1135.1→728.7ms |
| 100 generated notifications | 0/0/0 | 0/0/0 | 26.3→22.5ms |
| 20 readonly status requests | 0/0/0 | 0/0/0 | 27.2→18.2ms |

startup의 dynamic 등록 명세 peak는 903/902/902→4, Ready 후 workspace RTL 중복900→0이었다. raw watcher2개는 유지하고 shared include가 생기면 필요한 auxiliary 명세를 등록한다. 전체 driver의 Python bridge/compiler CPU 중앙값은 9267.3→3547.3 ms였다(공통 source/header workload·query 없음, import/parse/elaboration 등을 합친 bridge CPU; process 시작 이전/Node/native 비용은 제외).

local unsaved edit의 settle 중앙값은 973.0→823.6 ms다. **컴파일/CPU 수 감소를 모든 응답 대기 시간 개선으로 판정하지 않는다.** 이 진단의 wait는250ms debounce·process/import·compiler·Core·RPC/poll·기계 부하가 합쳐진 값이며 typing frame이나 native UI 응답 시간도 아니다. 공유 include를 새로 발견하면 두 root의 confirmation compilation은 계속 필요하다. 다음 단계에서 각 비용과 critical path를 분리한다.

local edit/100 source 알림은 새 구현에서[1,0,0] compiler/각 load1회, shared header 변경은[1,1,0]/load2회였다. unconfigured/generated/status 알림은 추가분석0이다. 기존 metadata와 Scope가 갱신되지 않은 실험 결과를 전체 root 수용으로 재사용하지 않는다. 마지막 drain은 모든 기록한 Python PID 종료·temp0·등록0·Node exit0, 원래900개 RTL bytes 불변을 확인하고 private fixture를 제거한다.

표의 unconfigured RTL notification은 정상 프로젝트의 source prefix 밖 `notes/unlisted.sv` 알림이다. TOML이 없는 프로젝트의 idle 비용은 H7N 측정 대상에 남긴다.

근거 `ide/.dev/cloud/h7m-scale-paired.json`, `h7m-scale-before/after-1/2/3.json`, final paired 로그 및 suite receipt. 각 receipt는 실제 server/events/Core/helper source SHA256을 기록한다. baseline은 ignored `h7m/server-before.ts` SHA256827d591a086f70f6ea9aae066571ea3c425c81824914ef38cc24bc443133e62c와 `input-events-before.ts` SHA256f46b4d871b39065127b5fe9745f796a076bbb07749735de3d8a58d59ae425ca3이다. before가 없는 새 checkout의 ordinary suite는 현재 구현만 실행한다.

## 검증과 보정

Core prefix/metadata identity·serialization 불변·literal/package/test/external·실제 case glob, unsafe parser 앞 guard·recursive coverage/외부/generated 보존을 검사했다. 실제 RPC에서 외부 glob 누락 뒤 새 source 생성, 비RTL source glob nested 추가/삭제, held unrelated completion을 취소하지 않는 local 편집, Root close/registration ack·journal late-handle 회귀를 검사했다.

추가 stale-failure 진단은 이전 구현에서 missing manifest를 고친 뒤 현재 Python 분석을 held 상태로 두고 Project not configured가 덮어쓰는 것을 재현했다. 현재는 Analyzing을 유지하고 최신 read 뒤 Ready가 된다. `h7m-stale-failure-before-final.log`/`h7m-stale-failure-after.log`와 최종 guard/full. 초기 진단은 잘못된 H7K baseline(등록 기능 없음)을 선택해 ack를 기다렸다. compiler descendants 없음과 server exit를 확인하고 시험 worker를 종료·owned fixture를 제거했다. 이 실패 로그를 성공 수로 합산하지 않는다.

| 검사 | 이번 결과/근거 |
|---|---|
| 환경/기준 | 기존 Node24.19.0/Python3.12.14/pyslang11.0.0/Verilator5.032·이전 변경 보존, GitHub main/HEAD85ba1fe6f245182faf90602628560cd04f8bcf69 |
| runtime/language build | PASS, h7m-runtime-final.log/h7m-language-final.log |
| 초기 semantic cohort | 27 PASS(신규 scope 전), h7m-related-first.log |
| scope/actual input/burst/900 RTL | 25 PASS, h7m-targeted.log |
| 최종 input/scope/stale/case guard | 23 PASS, h7m-guards-final.log |
| 순차 전체289개 | **288 PASS/0 FAIL/1 Windows batch SKIP**, h7m-full.log, 약168초 |
| 최종 코드3회 paired 계측 | PASS, final receipt source hashes와 전후 로그 |

full은 신규10개(scope5·actual source/peer3·900RTL1·stale1)를 모두 포함한다. cohort를 중복 합산하지 않는다. 첫 full288개의 case fixture1 FAIL을 h7m-full-first.log에 보존했고 명시적 glob으로 보정한 최종 full을 사용한다. timeout/skip/semantic work bound를 늘리지 않았고 deps/lockfile·vsix·workbench overlay는 바꾸지 않았다.

```bash
cd ide
source /workspace/.cloud-tools/activate.sh
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-semantic-scale.mjs
# 현재 작업의 private H7L server/events baseline이 있을 때만:
node scripts/verify-semantic-scale.mjs --compare --samples=3
```

## 잔여와 다음 순서

다음 **H7N은 compiler 시작·parse/elaboration/package/test 및 편집→완성 대기 경로, mixed/error root idle 비용**이다. 대표 규모에서 Python import/process, dependency pass, 독립 test/default elaboration과 Core scan·watch planning·query queue·debounce를 분리한다. settled compiler/query cache나 persistent worker를 근거 없이 추가하지 않고 stale/cancel/실제 cleanup 경계를 유지한다.

source prefix는 coarse하다. unknown/error/unconfigured root의 broad 감시·기존 all-root fallback과 외부/비RTL recursive 범위, 대규모 pattern planning/rename 경계는 추가 측정 대상이다. 실제 대표 설계가 제공됐다고 가정하지 않는다. Windows native RelativePattern create/delete/rename·exclude/case/junction/존재 전 경로, 실제 watcher 비용·LanguageClient/host 종료, 공식 TS7 타입/target emission 및 physical UI는 미실행이다.

native cold/warm/idle/frame latency·오래된 anonymous RSS 원인·전체 archive disk 정책·clean Windows/FST/enum/encoding 등 기존 gate를 유지한다. 최종 화면/Computer Use는 한 Windows 통합 세션으로 모은다. 개발·테스트와 문서만 갱신했으며 commit/push·패키징·배포는 하지 않았다.
