# H7R — 요청 안에서 package 시작 비용 공유 (2026-10-13 UTC)

이 단계의 다음 H7S는 [enum 표시 재사용·lookup/요청 대기 구분](ide-h7s-lookup-wait.md)으로 수행했다. 아래 수치와 다음 단계 표현은 H7R 당시 기록이며 최신 잔여와 통합 준비는 H7S/H7 수용표를 따른다.

기존 pyslang 연동의 auto package 검증과 분석을 한 요청의 Python process에서 이어간다. 자체 compiler/simulator를 만드는 단계가 아니며 기존 Verilator·Code/Simulation UX와 IDE/VSIX 독립성을 유지한다. Core의 package 순서 알고리즘을 Python에 복사하거나 검증 없는 graph cache로 대체하지 않는다.

## 요청 protocol과 정리 경계

1. 소유 임시 analysis/hierarchy directory의 `input.json`으로 `package-session` version1을 시작한다. Python은 project sources와 같은 overlays/defines/include 경로로 dependency만 parse한다. test compilation은 아직 만들지 않는다.
2. Python은 graph envelope를 임시 파일에 완전히 쓴 뒤 `os.replace`로 게시하고 stdout 준비 marker를 flush한다. Node는 기존 checkedProcess의 onLog 경로에서 최대128 character notification buffer로 marker를 받는다. 시작 중 disk 반복 polling이나 native watcher를 추가하지 않는다.
3. Node는 graph version을 검사하고 기존 Core `orderPackages`가 duplicate·unknown explicit import·cycle·같은 파일의 선언 앞 사용과 순서를 판정한다. 성공한 경우에만 소유 continuation을 임시 파일에 쓴 뒤 rename한다. 요청별 approval UUID는 이 continuation에만 넣는다.
4. Python은 승인 뒤 ordered sources·test group/top/조회 정보를 읽고 새 SourceManager/compilation으로 분석한다. overlays/defines/include/query 내용은 초기 요청에 한 번만 전달한다. 각 독립 test의 manager/default/lookup/같은 이름/매크로/header는 계속 격리한다. 최종 response의 protocol/approval 확인 후에만 결과를 반환한다.
5. 종료·Core 거절·잘못된 응답·승인 쓰기 실패·취소 모두 실제 checkedProcess join 뒤에 directory를 회수한다. 원래 Core 오류는 유지하며 cleanupFailed는 그 오류보다 우선 전파해 기존 quarantine/drain을 보존한다. 부분 분석은 성공으로 게시하지 않는다.

dependency와 analysis 각각 기존15초 예산을 유지하고 hierarchy에는 기존 전체15초 deadline도 적용한다. Python의 continuation 확인은 요청 중에만10ms interval이며 승인 누락/소유 Node 종료에 대비해15초 후 자체 실패한다. persistent worker·settled cache·상시 profiling/제품 성능 설정·새 감시는 없다. public `dependencies()`와 명시적 manifest 순서는 기존 직접 요청 경로를 유지한다. provider2 active/32 waiting, generation/version·신뢰/미저장·파일/FS/journal·H7P 좌표/경로 상한·H7Q 전체 symbol 동의와 순서/중복은 유지한다.

## 검증 범위와 발견한 잔여

기존 300 RTL/독립 tops/includes·auto packages/완성 ambiguity·두 번째 group 취소·부분 batch 거절·actual IPC fresh query/복구 검증의 시작 횟수 기대값만 새 공유 경계에 맞춰 바꿨다. dependency parse와 test group 수는 줄이지 않았다. Core package 오류의 실제 test 분석 전 거절과 다음 요청 복구를 계속 검사한다.

신규6개는 graph 게시 후 승인된 상태에서 분석 전 취소·실제 종료/재시도, 잘못된 graph version/조기 process 성공, 승인 파일 atomic 게시 실패와 waiting process join, 다른 approval 응답 거절, public dependency/manifest 경로 및 hierarchy 비교, Python의 실제15초 승인 누락 실패다. 실제 Python/pyslang을 실행하고 모든 기록 PID의 ESRCH·cache/temp0·원본 bytes를 확인한다. 일반 tests는 private baseline 없이 현재 소스로 실행한다.

추가 검증 최초6개 실행에서5 PASS/1 FAIL은 독립 IDE에 `internal_operations.py`가 없다는 기존 미구현 경로였다. 실제 hierarchy는 제공되지만 internalOperations/scopeOperations는 ModuleNotFoundError로 실패한다. 이 단계에서 Diagram/backend를 구현하거나 VSIX 코드를 가져오지 않았다. 현재 경계 검증은 양쪽 auto/manifest가 그 실패를 그대로 전달하고 정리한 뒤 hierarchy가 복구되는지 확인하며 **내부 연산의 의미 결과 수용 PASS로 기록하지 않는다**. 다음 실행의5 PASS/1 FAIL은 test가 cache directory 생성 전에 readdir한 대기 경합이었다. ENOENT 동안만 계속 기다리도록 harness를 보완했다. 승인/정리 assertion이나 budget은 약화하지 않았다.

## 전후 실제 계측과 최종 결과

H7Q provider/bridge snapshot을 `ide/.dev/cloud/h7r/`에 보존하고 현재 Core/server/events/lexer와 같은 fixture에서 provider/bridge만 바꾼다. `verify-semantic-package.mjs --compare --samples=5`는 AB/BA 교대의 큰300 RTL/Unicode·CRLF2000줄/ports96/공통 선언128/package2/tests2와 실제3 roots IPC를 실행한다. 분석/공유 완성/선택 TB/hierarchy 전체 JSON hash를 비교하며 양쪽 IPC가 inline fresh symbol을 실제 반환해야 한다. modeled watcher ack/직접 notification이며 native Windows/UI/queue 단독 계측이 아니다.

최종 runtime/language build와 관련19개 **19 PASS /0 FAIL/0 SKIP**, 순차 전체 **317개:316 PASS /0 FAIL/1 Windows batch SKIP**, 180,206ms였다. 실제 승인 누락 검증도15초 기다린 뒤 compiler의 실패/종료를 확인했다. budget 연장·추가 skip은 없다.

| 큰 입력의 실제 provider 작업 | wall 중앙값 H7Q → H7R, ms | 관측 범위 H7Q / H7R, ms | Python 시작/import 횟수 (매회) |
|---|---|---|---|
| 분석·독립 테스트2개 | 633.6 →459.1 | 534.0–1322.7 /388.0–735.8 | 2 →1 |
| 미저장 공유 RTL 완성 | 899.1 →756.4 | 858.7–1483.9 /613.0–891.8 | 2 →1 |
| 선택 TB 완성 | 609.5 →449.1 | 504.8–877.1 /349.3–573.7 | 2 →1 |
| 선택 TB hierarchy | 475.8 →266.0 | 349.9–567.2 /216.2–291.6 | 2 →1 |

이 최종 실행의 전후5회 **20쌍 semantic/hierarchy 전체 JSON hash가 동일**했다. dependency+test group은 각각3/3/2/2회로 동일하고 parse/lookup/default를 생략하지 않았다. 매회 fresh SourceManager/compilation, 같은 top/매크로/header·미저장 package 및 Unicode/UTF-16 결과를 유지했다.

공유 완성의 Python bridge import CPU 합 중앙값168.9 →76.5ms(165.2–286.0 /66.5–85.2), 계측한 전체 Python 단계 CPU 합718.5 →559.5ms였다. dependency traversal15.0 →14.7ms와 completion267.1 →237.1ms는 남는다. 계측된 단계 합은 process bootstrap/IPC 잔여까지 포함한 전체 OS CPU는 아니다. startup/import 한 번 제거를 언어 계산 전체 제거로 표현하지 않는다. graph 게시 뒤 Core 승인/파일 왕복을 포함한 Python wait wall 중앙값은 각 phase에서10.2ms, 관측 범위10.1–79.1ms였다. 이를 서버 queue만의 지연으로 판정하지 않는다.

Node CPU 중앙값은 분석31.1 →25.5ms·공유 완성29.5 →46.1ms·선택 TB25.9 →20.1ms·hierarchy16.1 →13.2ms였다. shared Node CPU 관측 범위29.1–69.2 /23.5–64.0ms이고 graph/continuation/ack 처리도 포함한다. Python process peak RSS 중앙값은 각각37.7 →38.2MiB·40.6 →41.2MiB·39.4 →40.0MiB·35.7 →36.2MiB였다. 한 process에서 dependency와 analysis가 이어지므로 시작 수 감소가 peak/RSS 감소를 보장하지 않는다. 전체 앱 RSS·retained/native allocation 수용은 미확인이다.

| 실제3 roots IPC | wall 중앙값 H7Q → H7R, ms | 관측 범위 H7Q / H7R, ms | Python 시작 (매회) |
|---|---|---|---|
| mixed startup | 1598.8 →1181.8 | 1453.4–2199.1 /1172.5–1253.5 | 4 →2 |
| 편집→완성 | 1779.0 →900.5 | 1103.3–3279.9 /797.4–1048.4 | 4 →2 |
| unrelated100 notifications | 294.6 →290.9 | 284.0–379.0 /282.3–292.6 | 0 →0 |
| idle20 status | 509.6 →508.9 | 505.4–597.7 /506.9–519.3 | 0 →0 |
| missing/malformed manifest 생성·복구 | 549.1 →480.5 | 444.0–674.3 /417.2–486.0 | 2 →2 |

양쪽 모든 IPC는 실제 inline fresh symbol을 반환했고 missing root read0/malformed1·복구 shallow 감시2개/등록 뒤 확인·repair 뒤 해제·idle/status 추가 load/compiler0을 유지했다. IPC wall은 modeled ack/settle debounce·Core/provider/대기를 함께 포함하며 idle에는 의도한500ms 관찰 대기가 있다. Linux fixture의 개선 관측이고 Windows physical 응답성이나 p95/대표 설계의 수용 예산은 아니다. H7Q의 이전 실행 수치를 이번 baseline으로 합산하지 않는다.

10개 receipt의 모든 소유 Python PID ESRCH·cache/temp0·IPC 등록0·parent exit0·원본 bytes 보존을 확인했다. 원본은 `ide/.dev/cloud/h7r-{runtime-final,language-final,guards-final,full,package-final}.log`, `h7r-package-{before,after}-{1..5}.json`, `h7r-package-results.json`, `h7r-final-sources.json`이다. 별도 보존이 없으면 ignored private 파일은 다른 checkout에 복원되지 않는다. 실패한 cache 대기 실행은 `h7r-guards-cache-race.log`로 보존했고 첫 내부 연산 missing-module 실패는 대화의 tool 출력에 남았다.

소유 H7Q provider SHA `6b225440e3877554f9cad9295cd57e5d3d28cb0cdcab8beac7ba5b6d1c915104` / bridge `9ede2aaf92fc3dd8a4ccf905446ec130adb70dfe30fe2bacaec3efe12731c9ae`, H7R provider `9350ca93d5f043bc8f8e5ff827e20e4811326310b1c351b5b4a6af1eb3f403c6` / bridge `11a2ff9e2dcf55f90b65410ed95af941f712507a546785bd442dbc509a84add0`다. 같은 현재 Core/server/events/lexer/helper identity를 각 receipt와 final source manifest로 기록했다. 일반 tests·현재 진단은 현재 소스만 사용하고 전후 옵션만 이 두 baseline snapshot이 필요하다.

최종17개 source hash·10개 receipt identity·변경 없는3/3/2/2 group 수·20쌍 hash·실제 정리를 재확인했다. `/proc`의 소유 compiler/IPC process 잔류0, 갱신 문서13개의 로컬 링크841개 누락0, 새 script/helper/test의 node syntax·`git diff --check` PASS다.

## 다음 단계와 Windows 잔여

다음 H7S는 남은 default/완성 lookup CPU와 실제 요청 대기를 구분해 계측하고, H7의 성능 잔여와 마지막 Windows 통합 항목의 우선순위를 정리한다. 모든 compiler 계산을 없애거나 요청 사이 무검증 cache/상시 worker·자체 엔진을 추가하는 목표가 아니다. 실제 대표 설계/장시간·tail/queue·전체 RSS 수용은 별도다.

Windows 공식 본체 TS7 전체 타입/target emission·native watcher/root rename/case/junction·LanguageClient/host/taskkill·실제 UI/physical 입력·대표 설계/장시간/RSS·전체 archive disk·clean Windows/FST/enum/encoding은 남는다. 새 파일 왕복의 NTFS 실제 rename/소유 process 종료도 Windows 확인 항목이다. 화면/Computer Use는 마지막 통합까지 보류한다. 기존 pinned 도구(Node24.19.0/Python3.12.14/pyslang11.0.0/Verilator5.032)와 변경을 재사용하고 main85ba1fe6f245182faf90602628560cd04f8bcf69를 읽기 전용으로 확인했다. setup 재설치/초안 저장·게시·deps/lockfile/VSIX 변경·commit/push·패키징·배포는 하지 않았다.

```bash
cd ide
source /workspace/.cloud-tools/activate.sh
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-semantic-package.mjs
# 이 작업의 private H7Q provider/bridge가 있을 때만:
node scripts/verify-semantic-package.mjs --compare --samples=5
```
