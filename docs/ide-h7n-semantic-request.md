# H7N — 요청 안에서 컴파일러 시작 비용 공유 (2026-10-13 UTC)

> 다음 H7O의 미설정 분류/복구 감시와 inline macro 문맥은 [H7O](ide-h7o-semantic-context.md)에서 보완했다. 최신 결과/다음 H7P는 해당 문서와 H7 수용표를 따른다. 아래 수치/소스 hash·다음 단계는 H7N 당시 기록이다.

H7M의 source routing 뒤, 300 RTL/자동 package 순서/독립 테스트 2개의 Python 시작·import·입력 읽기·parse·selected/default elaboration·diagnostics·완성·JSON 직렬화를 분리했다. 같은 테스트 이름이나 macro가 있는 독립 compilation을 합치지 않고, **한 분석/완성 요청의 테스트들만 한 Python 프로세스에서 순차 실행**한다. 앱 UX, semantic/simulation 경계와 ide/vsix 독립성을 유지한다.

## 구현과 보호

`ide/runtime/semantic/slang.ts`는 테스트별 sources/top을 batch로 전달하고 완전한 분석 배열만 수용한다. `ide/language/python/analyze.py`의 `run_request`는 각 group마다 기존 `analyze`를 호출하여 새 SourceManager·overlay·preprocessor·syntax tree·Compilation/default Compilation을 만든다. 같은 top/helper 이름, 서로 다른 header·macro와 parameterization은 기존처럼 독립적이다. 진단/모듈/실제 입력 union과 공유 RTL의 동일 symbol 교집합은 그대로 유지한다. 선택한 TB 파일의 완성은 그 테스트만 분석한다.

일반 프로젝트/테스트 1개와 dependencies/hierarchy/internalOperations/scopeOperations의 기존 단일 요청도 유지한다. 자동 package graph 검증/정렬은 Core의 기존 별도 작업이다. settled query/설정/파일 cache나 persistent Python worker는 없다. provider 작업2 active/32 waiting, generation/version/신뢰/FS·journal guard와 checkedProcess의 실제 close/group cleanup·quarantine/drain을 바꾸지 않았다. 기존 evaluate의 테스트 분석 전체15초 및 별도 dependency timeout을 늘리지 않았고, 중간 group 결과를 성공으로 게시하지 않는다.

검증 helper는 소유 임시 bridge에서만 단계별 wall/CPU와 Linux Python peak RSS를 기록한다. 제품에는 profiling 코드/설정/상시 로그를 넣지 않았다. 공개 helper의 일반 모드는 현재 소스만 사용하며 `--compare`는 `ide/.dev/cloud/h7n/slang-before.ts`의 private H7M snapshot이 있을 때만 실행한다. private snapshot은 앱 빌드 입력이 아니다.

## 계측 범위

동일 내용·구성의 fixture를 매번 새 디렉터리에 재생성하고 전후 순서 AB/BA로 번갈아 실행한 **5회 paired 관측**이다. 처음3회는 항상 before→after였으며 변동이 커 counterbalance5회를 추가했다. 두 결과를 합산/평균하지 않고 각각 보존한다. 자동 packages 2개(발견 순서와 실제 의존 순서가 반대), RTL 300개, 같은 top/helper 이름의 TB 2개, source/TB마다 동일 basename의 다른 header, 미저장 source/package를 사용한다. 전후 분석/완성의 경로를 정규화한 전체 JSON hash가 같아야 한다. 각 compiler process 종료와 cache 빈 상태, 원본 bytes 보존을 확인한다. 단일 테스트 완성은 원래도 launch 2개이므로 감소 효과를 주장하지 않는다.

actual IPC 측정은 healthy/manifest 없음/malformed 3 roots, acknowledgement를 주는 등록 모델, 직접 전달한 이벤트다. 편집 직후 완성 요청은 debounce를 flush하고 최신 analysis를 기다린다. Core load 전체 시간과 snapshot 대기, provider analyze/complete 및 Python 내부 단계를 따로 기록한다. Python import에는 bridge 모듈 compile/import가 포함되고 process bootstrap/teardown·Node JSON/I/O/merge는 provider residual이다. Core load에는 기존 publication scan/manifest/glob가 포함된다. snapshot은 Core/analysis/등록 대기를 포함하므로 서로 중복 합산하지 않는다. queue/dispatch/등록 계획을 각각 완전히 분리한 native 계측은 아직 아니다.

## 최종 5회 계측과 자동 검증

`.dev/cloud/h7n-request-results.json`/`h7n-edit-results.json`은 각각10개(전후×5) receipt다. `h7n-request-counterbalanced.log`/`h7n-edit-counterbalanced.log`는 exit0이며 request의 분석/완성 **15쌍 전체 JSON hash 일치**를 검증했다. `h7n-final-sources.json`은 최종 server/Core/events/provider/bridge/helper/script SHA와 receipt source 일치를 확인했다. H7M provider snapshot SHA는 `791a4b130789223ce1333f8d56c040aeb51023031e2ce1222b5fd5fb2061033f`다. 양쪽 모두 현재 bridge의 기존 단일 operation/새 batch dispatch를 사용하며 기존 `analyze` 본체는 변경하지 않았다. raw artifacts는 ide/.dev의 private 기록이고 일반 tests에 필요하지 않다.

| 단계 | Python launches before / after (매회 동일) | wall 중앙값 before / after, ms | 관측 범위 before / after, ms |
|---|---|---|---|
| analysis-two-tests | 3 / 2 | 756.5 / 559.7 | 551.8～783.4 / 411.8～796.1 |
| unsaved-shared-completion | 3 / 2 | 1090.6 / 891.1 | 975.2～1155.1 / 665.6～1218.6 |
| one-test-completion | 2 / 2 | 493.2 / 637.1 | 422.4～570.2 / 427.0～708.4 |
| mixed-startup | 6 / 4 | 1922.1 / 1557.0 | 1633.5～2098.3 / 1362.0～4574.6 |
| edit-to-completion | 6 / 4 | 1722.6 / 1356.3 | 1600.8～1949.4 / 1324.8～2579.6 |

동일 요청의 compiler group 수는 dependencies 포함3회 또는 선택 TB2회로 유지된다. auto package graph process는1회 별도로 남고, 테스트2개의 analysis/query process2→1만 줄었다. 즉 launch3→2와 IPC edit6→4는 **실제 compilation 수 감소와 다르다**. 직접/shared 완성의 결과 내용은 같으며, latency 관측 범위가 겹치고 after의 IPC worst sample은 더 느렸다. 단일 TB query의 launch2→2와 경로는 같고 중앙값493.2→637.1ms여서 개선으로 표시하지 않는다. 이 fixture의 관측 중앙값을 일반 latency 목표/p95/native 수용으로 사용하지 않는다.

shared completion에서 bridge import CPU 중앙값262.5→187.1ms, 계측한 Python 전체 CPU787.0→673.6ms, provider의 미계측 wall residual292.1→216.4ms다. 남은 completion traversal/lookup CPU264.1→250.5ms와 default signatures63.4→62.1ms는 여전히 큰 분석 비용이다. 별도 dependency CPU10.7→12.6ms·parse2.9→2.5ms·입력 tracking34.3→35.8ms는 같은 작업을 계속한다. CPU 전체 중앙값은 단계별 중앙값들의 합과 같지 않다.

IPC 편집→완성에서 snapshot 대기 중앙값777.1→510.2ms, provider analysis751.4→478.0ms, complete946.4→856.7ms, 세 root의 Core load 합14.4→24.7ms다. snapshot은 analyze/Core/등록 대기를 포함하므로 겹치는 값을 더해 전체 시간을 만들지 않는다. 요청 즉시 debounce flush이며 고정250ms timer를 기다리는 결과는 아니다. 슬롯/등록은 기존 의미를 유지했고 별도 queue-only/native 등록 비용 예산을 확보한 것은 아니다.

Python process별 최대 RSS의 중앙값은 analysis35.6→36.0MiB/shared completion37.1→37.5MiB였다. 시작 횟수 감소와 함께 약0.4MiB 더 큰 peak가 관측됐으며 메모리 감소라고 주장하지 않는다. 프로세스는 매 요청 실제 종료되어 장기 유지되는 worker/cache가 없고 all fixtures의 live Python0/cache0/registrations0/parent exit0·원본 보존을 확인했다. 앱/renderer/기존 waveform RSS 회복은 별도 미해결 gate다.

mixed root의 unrelated100개 burst는 양쪽 load2/Python0(각 root load1), readonly20/500ms idle은 양쪽 load0/Python0, manifest 생성·repair는 양쪽 Python2/Ready를 유지했다. missing/malformed 검사 각각의 after 관측은 약1.1～2.5ms/1.8～9.9ms이며 debounce 약250ms 뒤 진행한다. 물리 watcher가 실제로 이 모든 이벤트를 전달했다는 근거는 아니다.

| 검사 | 이번 결과/근거 |
|---|---|
| 도구/기준 | 기존 Node24.19.0/Python3.12.14/pyslang11.0.0/Verilator5.032·이전 변경 보존·GitHub main85ba1fe… 확인 |
| runtime/language build | PASS, h7n-runtime.log/h7n-language.log |
| actual inputs/ported semantic/신규 group4 | **33 PASS**, h7n-targeted.log |
| 최종 순차 전체294개 | **293 PASS/0 FAIL/1 Windows batch SKIP**, h7n-full-final.log,180616ms |
| counterbalance5×전후 provider/IPC | PASS/exit0, 최종 receipt/hash·원본/실제 종료·cache/감시 해제 |

전체에는 새 회귀5개(300 RTL/package/독립 test·macro 누출/오류 복구·second group 취소/retry·부분 batch 거절·actual IPC/mixed 복구)를 모두 포함하며 중복 합산하지 않는다. 첫 전체는 fixture1 FAIL로292 PASS/1 FAIL/1 SKIP(총294개, h7n-full.log)였다. 그때 inline macro 뒤 context 없음과 실제 query 미실행을 확인했고, 일반 code 줄의 positive fresh symbol을 최종 전체/paired에서 검사했다. 첫 request/edit3회는 h7n-request-first-three.json/h7n-edit-first-three.json 및 paired-final.log에 보존하며 위5회와 혼합하지 않는다. 실패/초기 debug 로그를 PASS 근거로 쓰지 않는다.


## 발견한 잔여와 다음 H7O

미설정·malformed root는 현재 각각 recursive `**/*` 감시를 유지한다. 관련 없는 파일 이벤트100개를 두 root에 전달하면 debounce 뒤 Core load가 각1회이며 Python은0회다. healthy root에서 편집할 때도 unknown-root fallback 때문에 각 오류 root가 설정을 재검사한다. 이벤트 없는 idle/상태 조회20개는 load/compiler0이다. manifest 생성·수정 이벤트 뒤 두 root가 Ready로 복구되는 경계를 검증했다. 해당 안전한 복구 동작을 먼저 보존해야 하므로 이번 batch 변경에서 감시를 줄이지 않았다.

초기 IPC fixture는 parameter의 inline macro 뒤 같은 줄에 caret을 두었다. 기존 lexical scanner는 backtick부터 줄 끝까지 directive로 가려 context가 없어 query를 실행하지 않았다. 제품의 기존 제한이며 H7N batch 오류가 아니다. 일반 code 줄에 caret을 옮겨 실제 fresh symbol 반환을 검증했고, 처음 빈 결과/전체 fixture1 FAIL 로그를 성공에 합산하지 않는다. **H7O에서 실제 ENOENT manifest의 typed 분류·복구 감시와 inline macro 뒤 code completion 제한을 먼저 다룬다.** 또한 별도 auto-package 시작 비용과 defaults/완성 traversal·path/point 비용을 계측 근거로 개선한다. lexer 변경 시 ide 내부 복사본만 관리하며 vsix를 참조하지 않는다.

수백 RTL 합성 Linux 결과는 모든 설계/Windows UI의 응답성이나 앱 RSS 회복 수용이 아니다. Windows native watcher/LanguageClient/host/taskkill·공식 본체 TS7 타입/target emission·실제 설계/장시간/RSS·archive disk·clean Windows/FST/enum/encoding과 물리 통합 gate는 남는다. 화면/Computer Use는 마지막 Windows 통합 세션으로 모은다. 기존 변경 보존, GitHub main/HEAD85ba1fe6f245182faf90602628560cd04f8bcf69를 읽기 전용으로 확인했다. setup 도구/lockfile/dependencies 재설치나 초안 재저장·게시·commit/push·패키징·배포는 하지 않았다.

```bash
cd ide
source /workspace/.cloud-tools/activate.sh
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-semantic-request.mjs
node scripts/verify-semantic-edit.mjs
# 이 작업의 private H7M snapshot이 있을 때만:
node scripts/verify-semantic-request.mjs --compare --samples=5
node scripts/verify-semantic-edit.mjs --compare --samples=5
```
