# H7K 언어 서비스 시작·재시작·idle (2026-10-13)

> 이후 H7L에서 generated 이벤트·비RTL/외부 include·active journal 무효화를 보완했다. 아래는 H7K 당시 기록이며 최신 결과/다음 단계는 [H7L](ide-h7l-semantic-inputs.md)을 따른다.

H7J의 LSP 작업2 active/32 대기·동시 query 공유를 유지하면서 **클라이언트 재시작 요청과 상태 조회의 중복**을 줄였다. 이전 adapter는 요청마다 Promise chain에 restart를 추가했고, 상태 bar는 이전 응답이 끝나지 않아도1.5초마다 요청했다. pinned LanguageClient9.0.1의 stop 실패 뒤 상태가 Stopped로 바뀌는 경계도 확인했다. 화면 검증은 하지 않았다.

## 최신 요청과 종료 경계

- `LatestTask`는 진행 중인 전환 하나와 최신 revision 하나만 유지한다. 같은 turn의 burst는 하나로 합치고, probe 도중 추가 요청은 현재 signal을 취소한다. 실제 probe/전환이 끝난 뒤 최신 설정으로 다시 검사한다. 요청마다 restart closure를 계속 보관하지 않으며 idle retry timer를 만들지 않는다.
- probe·lazy client import·실제 factory 시작·start 완료 뒤 signal/신뢰/semantic 설정을 확인한다. 검증된 Python과 같은 시점에 포착한 tools home을 cache에 사용한다. 늦게 완료한 이전 start는 Ready로 게시하지 않고 정리한다. 새 명시적 요청은 실제 compiler probe를 다시 수행하며 완료된 tool 검증 결과를 캐시하지 않는다.
- stop 전에 `rtl/prepareShutdown`으로 서버를 drain한다. 서버는 새 분석을 막고 기존 provider의 실제 finally/파일·프로세스 정리까지 join한 뒤 `ready:true`를 응답한다. 그 뒤 native `client.stop()`과 소유한 Node process의 **close event**까지 기다려야 replacement를 시작한다.
- 공개 `MessageTransports` factory와 IPC reader/writer를 사용해 Node process를 직접 소유한다. 라이브러리의 private `_serverProcess`를 읽거나 수정하지 않는다. NodeModule 경로의 parent-only 종료 fallback에 의존하지 않으며 Electron fork의 `ELECTRON_RUN_AS_NODE`/`ELECTRON_NO_ASAR`/client PID·silent/inspect 제외 정책을 유지한다.
- drain 확인10초·parent close 확인5초를 각각 제한한다. pinned SDK의 기본 stop2초와 compiler15초/core tree cleanup5초를 늘리지 않았다. 확인 실패/부정확한 ack/Native stop 실패/예상 밖 disconnect/cleanup 실패는 해당 서비스 인스턴스를 quarantine한다. 이후 요청이 두 번째 stop의 형식상 성공을 보고 새 process를 시작하지 못한다. 늦은 ack가 자동으로 quarantine을 해제하지 않는다. 실제 정리를 확인한 뒤 host/IDE 재시작이 필요하다.
- failure callback은 생성한 client/process에 바인딩한다. 확인된 종료 중 또는 이전 client의 늦은 오류로 새 정상 client를 quarantine하지 않는다. 실제 stop/exit 실패는 별도로 실패를 유지한다. 자동 library crash restart도 비활성화해 adapter의 probe/정리 경계를 우회하지 않는다.
- extension `deactivate`는 언어 서비스와 도구 서비스 정리를 모두 기다린 뒤 실패를 전달한다. dispose와 deactivate의 언어 close는 같은 완료 promise를 사용하며 새 client를 만들지 않는다.

## 상태 bar의 background 조회

고정 setInterval을 없애고 완료 뒤1.5초에 다음 조회를 예약한다. **진행 중 조회는 하나**이며 editor 변경 burst는 최신 문서에 대한 후속 조회 하나로 모은다. 바뀐 editor·focus·disposed generation의 이전 응답은 표시하지 않는다. 비RTL editor 또는 focus를 잃은 창에서는 poll timer를 유지하지 않는다. focus 복귀 때 현재 RTL 상태를 읽는다. 일시적 상태 실패는 다음 visible poll에서 재시도한다. 기존 상태 메뉴/설정·재시도·로그 command와 lexical 편집은 유지한다.

## 전후 계측 — API 모델과 실제 process를 구분

실제 `semantic.ts`/`language-status.ts`를 bundle해 **VS Code/client API와 timer만 대체한** 전후 진단이다. runtime probe의 결과/시작·stop/close 제어도 모델링했다. 실제 Code-OSS 기동 시간이나 Windows 클라이언트 전체의 수용은 아니다.

| workload | H7J adapter | H7K adapter |
|---|---|---|
| 이미 연결된 뒤 같은 turn의 restart20개 | probe20/client start20/stop20 | probe1/client start1/stop1 |
| held probe 중 요청20개와 늦은 결과 | probe21/client start21 | probe2(기존 취소+최신)/client start1 |
| 느린 상태 응답 중 virtual timer10 ticks | pending 조회11개 | 조회1개 |
| modeled Native stop failure 후 추가 요청 | client3·마지막 Ready | client1·Language cleanup failed/추가 시작 거절 |

근거: `ide/.dev/cloud/h7k-lifecycle-before-paired.log`, `h7k-lifecycle-after-paired.log`와 paired JSON. source snapshot은 ignored `ide/.dev/cloud/h7k/`이며 새 task에서 자동 재구성된다고 주장하지 않는다. 모델의 probe가 취소 후에도 검증된 경로를 반환하는 경우를 포함해 늦은 결과 거절을 검사했다. 실제 프로세스가21개 실행됐다는 뜻은 아니다.

별도로 **실제 runtime probe·소유 Node IPC process·Python/pyslang11**을 실행했다. 한 프로젝트/실제로 포함한 `.rtl/defs.vh`/controlled Python gate다.20개 readonly languageStatus 요청은 추가 compilation0회였다. 별도 generated RTL notification100개는 추가 compilation1회였다. `.rtl` 헤더의 WIDTH4→8 변경은 실제 module port3:0→7:0으로 갱신됐다. 포함된 입력이 generated namespace에 있을 수 있으므로 이벤트를 일괄 제외하지 않았다.

실제 Python4개가 모두 종료됐고 drain ack 시 live Python0·analysis temp0, drain 이후 이벤트/요청의 추가 compilation0·Node parent exit0·원본 소스 불변을 확인했다. 근거 `h7k-ipc.json`과 테스트 로그. fixture는 시험 뒤 제거했으며 성능 receipt만 private 위치에 남겼다. **불필요한 generated 이벤트 비용은 아직 해소하지 않았다.** 루트/공유 include 입력을 실제로 확인하는 H7L에서 이어간다.

## 자동 검증

| 검사 | 결과/근거 |
|---|---|
| runtime/language 타입·build | PASS, `h7k-runtime-build.log`, `h7k-language-build-final.log` |
| 기존 semantic/language + 초기 신규16 | 51 PASS/0 FAIL, `h7k-related-final.log` |
| 최종 신규18(이전/expected callback guard 포함) | 18 PASS/0 FAIL, `h7k-guards-final.log` |
| 순차 전체265개 | **264 PASS/0 FAIL/1 Windows batch SKIP**, `h7k-full.log`, 약401초 |
| adapter/status 전후 계측 | paired workload PASS, `h7k-lifecycle-before-paired.log`, `h7k-lifecycle-after-paired.log`, `h7k-lifecycle-paired.json` |
| 실제 runtime/IPC/Python·generated include | PASS, `h7k-ipc.json`·전체 및 신규 guard 로그 |

전체265개는 최종 신규18개를 포함하며 관련 cohort를 중복 합산하지 않는다. 이전 H7J의 마지막 capacity guard도 전체에 포함했다. Concurrency1을 유지하고 timeout/skip을 늘리지 않았다. 전체 wall time은 환경/부하/기존 실제160회 저장 등 여러 작업을 포함하므로 이번 최적화의 속도 비교로 쓰지 않는다.

신규18개는 최신 설정/burst·probe cancel join·trust/disable/dispose·drain/actual close 전 replacement 금지·stop 실패 후 재시도 차단·부정확한 ack·late start·disconnect·이전 client/expected close callback·probe cleanup 실패와 일반 오류 재시도·status overlap/editor/focus/dispose·transient status retry·두 서비스 deactivation join·실제 runtime/IPC/Python/포함된 generated header·실제 비정상 parent exit/deadline을 확인한다. Native VS Code/client 경계는 모델링했고 실제 process 시험은 별도로 구분했다.

초기 language 타입 검사는 ForkOptions의 `windowsHide` 필드로 실패했다(`h7k-language-build.log`). pinned fork와 같은 지원 필드로 정리했다. 초기 진단의 Module.filename 미설정은 Node CJS compile assertion/exit134를 일으켰다(`h7k-lifecycle-before.log`). 명시적 파일명으로 보완한 paired 실행을 사용하며 이 실패를 환경 준비 실패나 정상 통과 수로 합산하지 않는다.

```bash
cd ide
source /workspace/.cloud-tools/activate.sh
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-semantic-lifecycle.mjs
```

`--before`는 이 작업의 private source snapshot을 필요로 한다. dependency/lockfile·vsix·workbench overlay는 변경하지 않았다.

## 잔여와 다음 단계

다음 **H7L은 실제 입력 의존성과 파일 이벤트 무효화 범위·generated 이벤트 비용**이다. core는 `.rtl/.git/node_modules`의 직접 source 탐색을 제한하지만 compiler include 경로까지 배제하지는 않는다. 선언된/실제로 포함한 입력과 journal previous/metadata 변경 경계 없이 단순 폴더 필터를 넣지 않는다. 기존 all-root 무효화와 H7J 작업 제한을 유지한다.

Windows/Electron에서 실제 LanguageClient public factory·stop/disconnect/restart·extension host/app 종료 deadline·taskkill tree·신뢰 UI, 공식 본체 TS7/target emission 및 물리 화면은 미실행이다. drain의 filesystem work가 시간 제한을 넘으면 성공으로 보지 않는다. Linux API 모델/IPC 결과를 이 전체 native 수용으로 재사용하지 않는다. startup/typing/frame latency·대표 설계·app 전체 idle CPU/RSS·H7D/E anonymous RSS·전체 archive disk gate는 계속 남는다. UI/Computer Use는 마지막 Windows 통합 세션으로 모으며 배포/패키징은 하지 않았다.
