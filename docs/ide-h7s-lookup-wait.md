# H7S — enum 표시 정보 재사용·lookup/요청 대기 구분 (2026-10-13 UTC)

기존 pyslang의 완성 후보/타입/값·이름 해석을 유지하면서, 한 query의 같은 lookup scope와 native enum identity에 대한 표시 정보를 반복 계산하는 비용을 줄였다. 기존 Verilator와 제품 UX·IDE/VSIX 독립성을 유지한다. 자체 compiler/simulator 또는 언어 규칙을 새로 구현하는 단계가 아니다.

## 범위와 자원 경계

기존에는 동일 enum을 쓰는 각 변수/상수마다 모든 member의 값과 bare/qualified spelling을 실제 slang으로 다시 해석했다. 현재는 각 innermost scope의 고정 LookupLocation/flags에서 **exact native canonical enum object identity**가 같을 때만 이미 해석한 표시 정보를 재사용한다. 이름/폭/선언 위치만으로 서로 다른 enum을 합치지 않으며 native object를 보관해 Python id 재사용을 막는다. query/독립 test/parameterization/다른 scope/SourceManager에는 공유하지 않는다.

scope 하나의 memo는 **최대64 types /4096 values /1MiB UTF-8 텍스트 payload**다. 상한을 넘으면 기존 계산을 그대로 수행한다. dict/tuple/native handle overhead와 compiler graph 자체의 RSS까지1MiB로 제한했다는 뜻은 아니다. output마다 list/dict를 새로 만들어 직접 bridge 사용자의 변경도 다른 entry에 전파되지 않는다. 기존256 enum 값 한도·unknown/보이지 않는 값의 빈 표시 결과도 유지한다.

모든 candidate의 native lookup, import/shadowing·decl order·class/비지원 scope 차단·typed/default signature와 다중 문맥의 전체 JSON 동의/첫 순서·모듈 namespace는 그대로다. 첫 enum 해석은 실제 slang의 scope.lookupName·member.location/value·package resolution 결과를 쓴다. default compilation과 전체 scope 발견은 생략하지 않았다. H7R graph/approval·각15초 예산·실제 cleanup/quarantine, H7P 경로/좌표 상한과2 active/32 waiting·신뢰/미저장·파일/FS/journal·generation/version 보호도 유지한다. 상시 worker·settled cache·프로파일링 UI/새 감시는 없다.

## 실제 계측과 대기 구분

소유 bridge copy에서 completion membership/candidate-scopes/package-names/lookup-enum/agreement-definitions를 단계별 wall/CPU로 기록한다. 초기 cProfile은 일부 pyslang native lookup을 호출 수로 노출하지 않아0을 실제 호출 수로 사용하지 않았다. 별도의 `--profile` 실행은 actual scope.lookupName을 호출하는 소유 wrapper로 계수한다. 이 wrapper의 interval/phase 시간은 일반 latency 결과에 넣지 않는다.

별도 소유 SemanticWork copy의 job enqueue→work callback 시작을 queue, callback 시작→실제 작업/정리 완료를 active로 기록한다. actual IPC snapshot은 현재 분석을 기다리는 시간을 별도로 측정하며 query pool wait/active와 구분한다. malformed root의 보수적 Core 실패 job을 healthy compilation과 합산하지 않는다. 첫 timing guard1 PASS/1 FAIL은 두 번째 analysis를 없다고 가정한 harness 오류였다. 반환 여부/operation/id로 실제 healthy job을 구분하도록 고쳤고 안전한 오류 root 검사는 유지했다. production SemanticWork/server는 변경하지 않았다.

실제2개 Python slot을 두 번째 test group에서100ms 의도적으로 붙잡고 세 번째 TB query를 대기시켰다. hold 중 Python 시작2개, 실제 기존 PID 종료 뒤 세 번째 시작·선택 TB fresh symbol·전체3 process 종료/temp0을 확인했다. 이 대기는 제어된 진단이며 자연 latency나 Windows budget이 아니다.

일반 비교는 같은300 RTL/package2/tests2/Unicode·CRLF2000줄·ports96/common128의 기존 workload와 enum32/package variables96/one shadowed enum name/default callable의 dense fixture를 사용한다. bridge만 H7R private snapshot과 H7S로 바꾸고 현재 provider/Core/server/queue/lexer는 동일하다. analysis/일반 공유 완성/선택 TB/hierarchy와 dense unqualified/qualified의 전체 JSON hash를 비교한다. actual3 roots IPC는 양쪽 모두 inline fresh query·복구/idle/실제 process join을 실행한다. modeled ack/notifications이며 native Windows/physical UI 수용은 아니다.

## 최종 검증과 전후 결과

runtime/language build·신규6개 **6 PASS/0 FAIL/0 SKIP**, 순차 전체 **323개:322 PASS/0 FAIL/1 Windows batch SKIP**, 209,687ms였다. 새로운 actual native identity/UTF-8 상한/output ownership, 모든 상한 거절의 전체 JSON, 두 parameterizations의 다른 enum 값 ambiguity/후속 편집 fresh 복구,257개/unknown enum 미표시·real pool wait/actual IPC span을 확인했다. budget 연장·추가 skip은 없다.

최종 AB/BA 교대5회에서 **30쌍 전체 JSON hash(기존4작업20쌍+dense enum2작업10쌍)가 동일**했다. 두 test의 scope/type/default·모듈/진단/input/hierarchy와 bare/qualified enum spelling을 유지했다. 모든 provider Python 시작1회와 독립 group 수3/3/2/2·dense3회도 동일하다.

| enum32/변수96의 완성 | wall 중앙값 H7R →H7S, ms | 관측 범위 H7R /H7S, ms | lookup·enum 단계 CPU 중앙값, ms | Python process peak RSS 중앙값, MiB |
|---|---|---|---|---|
| unqualified·E_1 local shadow | 1405.0 →642.6 | 1198.9–2616.4 /569.9–752.5 | 797.6 →110.2 | 55.6 →41.4 |
| qualified base:: | 1752.9 →726.0 | 1371.0–5287.1 /584.1–812.9 | 1062.4 →121.6 | 55.6 →41.1 |

이 표는 계수 wrapper를 넣지 않은 동일 단계 계측 copy의 관측이다. 별도 `--profile`에서 각 query의2개 test context를 합한 실제 scope.lookupName은 양쪽 unqualified/qualified 모두 **9332 →950회**였다. wrapper 시간을 위 latency/CPU 표에 합산하지 않는다. memo가 compiler 계산의 반복 부분을 줄였으며 template/키워드 후보로 바꾸지 않았다.

나머지 dense 단계 CPU 중앙값도 유지해 기록한다: unqualified default signatures60.0 →57.4ms·membership13.3 →13.3ms·candidate/scopes112.2 →94.7ms·package names11.4 →11.5ms·agreement/definitions20.4 →12.7ms; qualified default82.2 →72.5ms·candidate/scopes119.7 →108.1ms다. 해당 단계에서 scope 발견/default 해석을 생략했다고 판정하지 않는다. Node CPU 중앙값32.5 →24.9ms/28.7 →23.9ms도 기록했지만 전체 IDE/renderer 비용은 아니다. dense Python peak 개선을 waveform/전체 앱 RSS·장시간 plateau의 해결로 확대하지 않는다.

| 기존 큰 일반 provider 입력 | wall 중앙값 H7R →H7S, ms | 관측 범위 H7R /H7S, ms | Python peak RSS 중앙값, MiB |
|---|---|---|---|
| 분석·독립 test2개 | 482.3 →455.0 | 349.7–675.8 /397.6–493.7 | 38.6 →38.7 |
| 미저장 공유 완성 | 821.8 →757.3 | 570.0–920.6 /667.4–831.2 | 40.9 →41.3 |
| 선택 TB 완성 | 457.2 →376.1 | 372.5–472.4 /367.9–464.2 | 39.6 →40.1 |
| 선택 TB hierarchy | 277.4 →248.7 | 219.3–373.8 /221.6–317.7 | 36.2 →36.4 |

일반 shared 완료의 default/candidate/lookup CPU78.6/105.3/90.4 →87.0/118.5/105.9ms는 줄지 않았다. 작은 차이/환경 변동과 일반 peak의 증가도 남기며 모든 workload 개선으로 표현하지 않는다. 이전 H7R 실행의 수치를 이번 baseline으로 합산하지 않는다.

actual3 roots IPC의 startup 중앙값1308.6 →1268.8ms, 편집→완성949.5 →979.4ms(916.7–1103.7 /911.6–1012.7)는 **편집 latency 개선 미확인**이다. 각 startup/edit Python 시작2개·repair2개, unrelated100 events/idle20 status 추가 compiler0·missing read0/malformed1·복구/해제 보호는 유지됐다. idle phase는 의도한500ms 관찰 대기를 포함한다.

| 편집 RPC에서 구분한 시간 | 중앙값 H7R →H7S, ms | 관측 범위 H7R /H7S, ms |
|---|---|---|
| snapshot: 현재 분석 준비 대기 | 408.1 →403.7 | 329.6–542.4 /395.8–436.1 |
| healthy analysis의 pool queue | 0.1 →0.1 | 0.1–0.3 /0.1–0.3 |
| healthy analysis callback/실제 정리 | 406.8 →402.9 | 328.3–541.6 /394.8–435.6 |
| query pool queue | 0.2 →0.1 | 0.1–0.4 /0.1–0.2 |
| query callback/실제 정리 | 554.4 →561.8 | 493.3–610.2 /502.8–584.6 |

snapshot에는 현재 분석의 Core/provider/등록 ack·게시 준비가 포함되어 analysis active와 겹친다. 각각의 중앙값은 서로 다른 표본에 해당할 수 있으므로 이 표를 합해 전체 latency를 재구성하지 않는다. 이 fixture의 queue가 작다는 것은 포화 workspace에서 대기가 없다는 뜻이 아니다. 기록된100ms controlled hold에서는 third query queue172.2ms·active215.5ms, 시작 시 기존 PID2개 ESRCH를 확인했다. 이 controlled 수치를 자연 UI/queue budget으로 사용하지 않는다.

10개 일반 receipt와2개 계수 receipt 모두 실제 Python 종료·temp/cache0·원본 bytes 보존을 확인했고 모든 IPC parent exit0·등록0이었다. 원본은 `ide/.dev/cloud/h7s-{runtime-final,language-final,guards-final,full,lookup-final,lookup-counts-final}.log`, `h7s-lookup-{before,after}-{1..5}.json`, `h7s-lookup-results.json`, `h7s-lookup-counts-{before,after}-1.json`, `h7s-lookup-counts-results.json`, `h7s-queue-wait.json`, `h7s-final-sources.json`이다. 초기 cProfile 관측은 `h7s-lookup-profile-before.json`/`h7s-lookup-first.log`에 보존하며 Native 호출0을 최종 계수로 사용하지 않는다. timing guard의 초기 잘못된 job 가정1 FAIL은 `h7s-wait-first.log`, 수정 뒤2 PASS는 `h7s-wait-final.log`다.

provider SHA는 양쪽 `9350ca93d5f043bc8f8e5ff827e20e4811326310b1c351b5b4a6af1eb3f403c6`, H7R bridge `11a2ff9e2dcf55f90b65410ed95af941f712507a546785bd442dbc509a84add0`, H7S bridge `6fa4036c1c8c5f1a1316147343ae39b791583948c028ee96dee634728476ba69`다. production queue SHA `e42acc1d601c33d5debfde9e61e2da57a9d6f21d4c9332b5a52816a9963d6ebf`는 변경하지 않았다. provider/Core/server/queue/lexer/helper와 final source19개 identity를 기록했다. ignored private baseline/log는 별도 보존이 없으면 다른 checkout에 복원되지 않는다. 일반 tests/현재 진단은 baseline 없이 현재 소스를 사용한다.

최종19개 source hash·12개 receipt identity·30쌍 일반 결과와 별도 계수 결과 일치·동일 group/시작 수·원본/실제 정리를 재확인했다. `/proc`의 소유 compiler/IPC process 잔류0, 갱신 문서14개의 로컬 링크865개 누락0, 새 helper/script의 node syntax·`git diff --check` PASS다.

## 다음 실행 순서와 잔여

다음은 [Windows 통합 검증 준비와 우선순위](ide-h7-integration-gates.md)다. default/candidate/lookup·실제 포화 queue/Native·대표 실제 설계/장시간/RSS·전체 disk는 남는다. 더 작은 micro benchmark를 계속 쌓기 전에 P0 Windows 본체/NTFS/취소·종료와 P1 실제 watcher/한 번의 화면 통합·대표 baseline을 확인한다. 화면/Computer Use는 계속 마지막 세션까지 보류한다.

내부 연산 Python adapter 부재는 H7R에서 확인한 미구현이며 hierarchy와 구분한다. FST 내장 표시/파형 enum·clean Windows/encoding·Diagram/외부 extension/전용 엔진·배포도 별도 범위다. 기존 pinned 도구/변경과 main85ba1fe6f245182faf90602628560cd04f8bcf69를 재사용했고 setup 재설치/초안 저장·게시·deps/lockfile/VSIX 변경·commit/push·패키징·배포·화면 실행은 하지 않았다.

```bash
cd ide
source /workspace/.cloud-tools/activate.sh
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-semantic-lookup.mjs
# 이 작업의 private H7R bridge가 있을 때만:
node scripts/verify-semantic-lookup.mjs --compare --samples=5
node scripts/verify-semantic-lookup.mjs --compare --profile
```
