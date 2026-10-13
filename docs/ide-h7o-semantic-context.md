# H7O — 미설정 폴더 재검사·inline macro 뒤 편집 문맥 (2026-10-13 UTC)

> H7P의 기존 pyslang 경로/위치 계산 비용은 [H7P](ide-h7p-pyslang-positions.md)에서 개선했다. 최신 결과/다음 H7Q는 해당 문서와 H7 수용표를 따른다. 아래는 H7O 당시 근거다.

H7N에서 확인한 두 가지 경계를 수정했다. `rtl.toml`이 실제로 없는 폴더의 source/peer 이벤트가 설정 검사를 반복하던 일을 줄이고, 같은 줄의 macro 뒤에서 실제 컴파일러 기반 자동완성·package 후보·함수 서명이 동작하게 한다. Code/Simulation UX와 IDE/VSIX의 독립성은 유지한다.

## 설정 부재와 안전한 복구

Core `ProjectManifestMissing`은 **실제 manifest read의 ENOENT 및 lstat의 부재 확인**에만 사용한다. dangling manifest link·parse/schema 오류·누락 include/literal source·다른 ENOENT는 이 오류가 아니다. 오류 문자열에 `rtl.toml`과 `ENOENT`가 있다는 이유로 미설정 상태로 판정하지 않는다. publication/journal gate를 부재 확인 뒤에도 검사하고, valid load의 기존 scan·schema·glob·link·defines 검사를 그대로 수행한다.

언어 서버의 `manifestMissing`은 최근 부재 결과를 이벤트 범위에만 적용한다. 해당 root의 manifest, active journal와 ancestor 사건은 계속 분석을 예약한다. nested project discovery는 추가하지 않는다. 일반 source·header·peer 편집은 manifest를 만들 수 없으므로 예약하지 않는다. malformed/unknown/권한·컴파일·등록 실패에는 기존 보수적인 감시/재시도를 유지한다.

부재 root의 recursive `**/*` 대신 root와 parent에 shallow `*` 복구 감시를 등록한다. literal basename에 glob 문자가 있어도 escape에 의존하지 않는다. 새로운 감시 acknowledgement 뒤에는 설정을 다시 읽어 등록 도중 생성된 manifest/root를 확인한다. 최초 부재 판정에는 확인 read 비용1회가 추가될 수 있고, 관련 없는 이벤트의 반복 read를 없앤다. physical parent/root rename 전달과 Windows native RelativePattern 수용은 여전히 미검증이다.

삭제된 manifest의 이전 Project/search scope와 header 감시는 해제한다. 마지막 실제 header membership만 open plaintext buffer의 복원 overlay 선택에 남긴다. 부재 root의 event/watch routing은 이 비활성 입력 목록을 무시하고 query는 Project 없이는 실행하지 않는다. 따라서 static RTL header를 plaintext로 연 뒤 manifest 삭제 중 편집했어도 복원 시 미저장 text를 반영한다. membership은 파일 bytes/validation/settled compilation cache가 아니다.

root/generation/version·파일/설정·신뢰·journal guard, provider2 active/32 waiting·요청 안의 독립 test·동시 query 공유·15초 compiler budget·checkedProcess 실제 group cleanup/quarantine/drain은 유지했다.

## 편집 lexer 경계

IDE 내부 `runtime/semantic/lexical.ts`와 `language/src/lexical.ts`를 동일하게 관리한다. 실제 compiler directive는 기존처럼 continuation을 포함한 줄 전체를 가리고, object macro는 이름만, function macro는 balanced argument list까지 가린다. argument의 nested 괄호·comment/string·escaped identifier, CRLF/UTF-16 offset을 유지한다. macro를 펼치거나 scope/type/조건부 컴파일을 자체 추측하지 않는다. 이후 code의 의미 후보·서명은 계속 pyslang으로 검증한다.

macro 이름/미완성 또는 argument 내부·directive body·comment/string/escaped name에서는 기존 보수적인 완성 억제를 유지한다. 같은 줄의 macro를 포함한 surface code로 begin/end나 template을 강제하지 않도록 기존 거절을 보존한다. 다음 일반 code 줄의 명시적 Enter/template은 유지한다. enum/port/call/hover 조회와 lexer 두 복사본의 일치·기존 기본 editor 회귀를 함께 검사한다. Core의 제한적인 source discovery/snapshot include scanner를 변경한 것은 아니다.

## 실제 재현과 검증 범위

H7N server/events/lexer의 소유 snapshot을 `ide/.dev/cloud/h7o/`에 보관했다. 일반 tests는 현재 소스만 사용한다. 별도 `verify-semantic-context.mjs --compare`에서만 private H7N snapshot을 읽는다. 양쪽은 같은 현재 Core/provider/Python과 같은 내용·구성의 재생성 fixture(300 RTL·자동 package·독립 test2개·healthy/missing/malformed3 roots)를 사용하고, server/event/lexer 차이를 확인한다. source SHA를 receipt에 기록한다.

baseline inline macro 뒤 completion은 lexical context 없음으로 query를 실행하지 않아 빈 결과였다. 현재는 실제 fresh symbol을 반환하므로 provider query가 추가 실행된다. 이 before/after의 전체 편집 시간을 같은 기능의 latency 개선으로 비교하지 않는다. 실제 Core read 수/복구 감시 범위와 positive 의미 후보·실제 cleanup을 주 근거로 삼는다. watcher RPC는 acknowledgement와 직접 알림을 제공하는 모델이며 native filesystem/UI/frame 수용이 아니다.

## 최종 5회 계측·자동 검증

동일 구성/내용의 fixture를 매회 새 directory에 생성하고 AB/BA 순서를 번갈아 전후5회씩 실행했다. `h7o-context-results.json`(10 receipts)/`h7o-context-final.log`는 exit0이다. `.dev/cloud/h7o-final-sources.json`에서 최종 Core/server/events/두 lexer/helper/test SHA와 receipt 일치를 확인했다. baseline server/events/lexer SHA는 각각 `d317e37a18b8e09dcc2ffdc2b4d3e639311ee3ed0ba3d1ac7dc1438c993914d2` / `a82862d465dcc439b3d3ceb5373b7c7b5f4c8596208a2ec2e602fec74a79adf3` / `80f6ffbac2c4204cc1a5ce46b2a69ebc6fba18b86ec7b57b21e88e0ee1fd2f0f`다. private artifacts는 앱/일반 tests의 입력이 아니다.

| 경계/단계 | H7N baseline | H7O (5회 모두 동일한 작업 수) |
|---|---|---|
| inline macro 뒤 완성 | fresh 없음 / query 미실행 | 실제 fresh symbol 반환 / query 실행 |
| healthy root 편집 때 missing root read | 1 | **0** |
| unrelated100개 mixed burst | missing1+malformed1 = Core load2, Python0 | **missing0+malformed1 = load1**, Python0 |
| absent root recovery 감시 | root `**/*`1개 | **root/parent `*`2개**, 등록 뒤 추가 확인 read |
| initial mixed startup | load3 / Python4 | **load4 / Python4** (absence 확인1회 추가) |
| edit→completion | load3 / Python2 (analysis만) | **load2 / Python4** (analysis+정상 query) |
| idle500ms + readonly20 | load0 / Python0 | load0 / Python0 |
| manifest 생성/repair | load2 / Python2 / Ready | load2 / Python2 / Ready, recovery 감시 해제 |
| 마지막 종료 | Python0/cache0/등록0/parent exit0 | Python0/cache0/등록0/parent exit0, 원본 bytes 보존 |

총 watch 개수를 줄였다고 주장하지 않는다. missing root의 subtree 전체 감시를 두 shallow 감시로 바꾸었다. malformed의 recursive fallback은 그대로다. burst wall 중앙값297.4→281.0ms는 debounce250ms를 포함하며 설정 load 수 감소의 관측일 뿐 native 처리 지연 예산이 아니다. mixed startup1626.2→1721.6ms에는 최초 recovery 확인 read가 추가됐다. 편집→완성593.8→1497.4ms는 baseline이 query를 하지 않았으므로 동등 기능의 성능 회귀/개선으로 판정하지 않는다. 정상 query/default/완성 비용은 다음 H7P에서 따로 개선한다.

별도 actual IPC 분류 진단은 없는 include directory 이름에 `rtl.toml`이 들어갔을 때 이전 server가 **Project not configured로 잘못 표시**하는 것을 재현했다. 현재는 **Analysis failed**, 실제 directory 생성 후 Ready다. `h7o-classification-before.log`/`after.log` 각각1 PASS는 해당 expected-fault/positive 진단이며 일반 suite 수에 더하지 않는다. 첫 paired1회는 `h7o-context-first.log`에 보존하며 최종5회와 합산하지 않는다.

| 검사 | 이번 결과/근거 |
|---|---|
| pinned 환경/main | Node24.19.0/Python3.12.14/pyslang11.0.0/Verilator5.032 / main85ba1fe… 유지·기존 변경 보존 |
| runtime/language build | PASS, h7o-runtime-final.log/h7o-language-final.log |
| 기존 editor/semantic/input 초기 | 45 PASS, h7o-initial.log |
| lexer/context/actual input/request/editor cohort | **59 PASS**, h7o-targeted.log (최종 plain header 추가 전) |
| 최종 context/input/새 plain header guard | **28 PASS**, h7o-guards-final.log |
| 최종 순차 전체304개 | **303 PASS/0 FAIL/1 Windows batch SKIP**, h7o-full.log,219513ms |
| actual IPC counterbalance5회/분류 진단 | PASS/exit0, source SHA/typed failure·fresh/복구·실제 종료 확인 |

전체304개에는 새10개를 모두 포함한다. typed 실제 부재·dangling link/parse/source/include 오류, missing event/패턴, macro masking·UTF-16/CRLF/중첩 comment/string/escaped argument, block/template 보호, actual mixed/inline와 실제 signal/package/서명, 잘못된 오류 이름 분류, ack 도중 manifest 생성, 삭제/ancestor/journal 복구, static plaintext header 미저장 복원을 검사했다. 기존 stale-error ack/generation·shared/외부/비RTL include·package/test ambiguity·cancel/cleanup/quarantine·시뮬레이션 회귀도 최종 suite에 포함된다. build/deps/lockfile·15초 provider timeout·work queue 한도를 변경하거나 실패 검사를 skip으로 숨기지 않았다.


## 다음 순서와 남은 gate

다음 H7P는 compiler query의 request-local point/path·기본 signature/완성 traversal 및 별도 auto-package 시작 비용을 계측하고 확인된 병목을 개선한다. 실제 의미 결과·UTF-8→UTF-16·macro/include 위치·다중 test ambiguity를 유지한다. persistent worker/settled 결과 cache나 임의의 latency 예산을 도입하지 않는다. malformed root의 broad fallback·native watch 계획/queue 대기·대표 실제 설계/장시간·메모리는 잔여다.

Windows 공식 본체 TS7 전체 타입/target emission·LanguageClient/host/taskkill·실제 watcher/root rename/case/junction·미저장/복원·physical UI, waveform RSS/전체 archive disk·clean Windows/FST/enum/encoding gate는 유지한다. 화면/Computer Use는 마지막 통합 세션에 모으며 이번에는 실행하지 않는다. GitHub main85ba1fe6f245182faf90602628560cd04f8bcf69를 읽기 전용으로 확인했고 기존 uncommitted 작업과 pinned Node24.19.0/Python3.12.14/pyslang11.0.0/Verilator5.032를 재사용했다. setup 초안 재저장/게시·deps/lockfile·VSIX 변경·commit/push·패키징·배포는 하지 않았다.

```bash
cd ide
source /workspace/.cloud-tools/activate.sh
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-semantic-context.mjs
# 이 작업의 private H7N snapshot이 있을 때만:
node scripts/verify-semantic-context.mjs --compare --samples=5
```
