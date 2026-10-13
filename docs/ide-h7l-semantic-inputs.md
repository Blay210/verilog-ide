# H7L 실제 의미 분석 입력·감시·설정 복구 무효화 (2026-10-13)

> 이후 H7M에서 ordinary RTL all-root·중복 dynamic 감시를 줄이고 외부/비RTL glob 구성·stale failure 경계를 보완했다. 아래는 H7L 당시 기록이며 최신 근거/다음 단계는 [H7M](ide-h7m-semantic-scale.md)을 따른다.

문서 날짜는 기존 인수인계의 KST 표기다. 이번 cloud 실행일은2026-10-12 UTC(2026-10-13 KST)이며 Windows/화면 검증은 하지 않았다. H7J/K의2 active/32 대기·in-flight 공유·취소/실제 정리 join·restart quarantine·status idle 가드를 유지한다.

## 발견과 변경

기존 서버는 모든 RTL watcher 이벤트에 모든 root를 재분석했고, 확장자가 RTL이 아닌 실제 header와 활성 journal `previous.toml`/metadata 이벤트는 무시했다. Core가 `.rtl/.git/node_modules` source 탐색을 제한해도 compiler include는 그 안을 읽을 수 있다. `.rtl`이라는 이름만으로 일괄 무시하면 유효한 header 편집을 놓친다.

- Python bridge가 slang SourceManager의 실제 source/include buffer와 SyntaxTree IncludeMetadata의 **expanded include 이름**을 보고한다. unrelated overlay·macro synthetic buffer는 membership에서 제외한다. 실제 include 위치/ancestor·include_dirs/cwd의 대체 경로와 compiler의 `CouldNotOpenIncludeFile` 인자에 있는 누락 경로를 후보로 보존한다. 전체 source-directory×include-name 교차곱을 만들지 않는다. 각 독립 테스트 결과의 입력을 합친다.
- 서버의 입력 index는 해당 metadata 객체에 약하게 연결한 path Set이다. query 결과/파일 bytes/검증 권한을 request 간 캐시하지 않는다. 실제 source/header·후보·ancestor directory 이벤트는 무효화한다. healthy 확인 뒤 Core가 source 탐색에서 제외하는 generated 경로의 unrelated 이벤트만 무시한다. unknown/error는 보수적인 search directory 감시를 유지한다. 일반 RTL 이벤트는 새 glob 구성과 공유 source를 보호하려고 여전히 all-root다.
- 확장자와 무관한 실제 include 및 workspace 밖 경로를 표준 LSP RelativePattern directory 감시로 등록한다. 정상 때 필요한 parent `*`, 오류/불확실 때 search directory `**/*`를 사용한다. filename glob metacharacter를 직접 pattern으로 만들지 않는다. 최신 요구 하나로 registration 변경을 모으고 새 감시 등록 ack 뒤 이전 것을 해제한다. 해제도 표준 RPC ack를 기다린다. 제거한 root와 종료 때 감시를 정리한다.
- 등록 사이에 바뀐 파일을 첫 분석 결과로 게시하지 않는다. 신규 감시가 생기면 등록 확인 뒤 compiler로 다시 읽고, 감시 집합이 안정될 때의 결과만 현재 generation으로 게시한다. 첫 의존성 발견의 비용은 추가 compilation1회(시험 startup2회)다. 기존 감시 안의 header 내용 변경은 metadata가 같으면 확인 compilation을 추가하지 않는다. 무한 idle 재시도 timer는 없다. registration 실패는 Ready가 되지 않으며 다음 입력 이벤트로 재시도할 수 있다.
- client raw watcher에 `.rtl`/`import-transactions` 경계와 전체 활성 journal child를 추가했다. `previous.toml`, intent/candidate/complete/acknowledged와 unknown child·record 생성/삭제는 stored Project·현재 query generation을 무효화한다. recovery gate를 우회하거나 자동 repair하지 않는다. journal 변화 없이 polling마다 SHA scan을 추가하지 않았다. archived 기록은 기존 명시적 정책대로 자동 integrity gate에서 제외되며 실제 include인 경우는 입력으로 감시한다.
- 실제로 포함한 plain text `.inc` editor도 overlay를 전달하고 close 때 disk 내용으로 돌아간다. 원본을 저장하지 않는다. languageStatus는 compiler-confirmed included header membership을 사용한다. 파일 URI containment의 `..local` 정상 이름도 정확히 판정한다.

## 실제 compiler/IPC 전후 진단

동일한 private fixture 정의·Node IPC LSP·Python3.12.14/pyslang11.0.0을 사용했다. 전후 진단은 dynamic registration을 선언하지 않은 수동 알림 클라이언트로 compiler 횟수와 무효화 routing을 비교한다. 실제 Windows filesystem event 전달/앱 반응 시간 비교가 아니다.

| workload | H7K server | H7L server |
|---|---|---|
| unrelated generated RTL 알림100개 | 추가 compilation1 | 추가 compilation0 |
| 실제 `.rtl/defs.inc` WIDTH4→8 알림 | hover3:0 유지(stale) | hover7:0 갱신 |
| 완료 journal의 previous bytes 변경 알림 | stored Project/Ready·hover 유지(stale) | Analysis failed·복구 안내/old hover 미게시 |

`ide/.dev/cloud/h7l-paired-inputs.json`·`h7l-diagnostic-before.log`·`h7l-diagnostic-after.log`. baseline은 private `h7l/server-before.ts`, SHA256 `52e62add35a8c700ccc1e2c2d61387b2e12edee1851757b1440e58e5cc23433d`다. baseline 파일은 ignored이며 새 checkout에 항상 있다고 가정하지 않는다. ordinary suite는 baseline 없이 현재 코드만 실행한다.

별도로 registration을 지원하는 actual RPC 클라이언트에서 새 `.rtl` parent 감시 ack 직전 header4→8 쓰기를 주입해 확인 read가7:0을 게시하는 것을 확인했다. external `.inc` 변경4→8, dirty plain text12→close/disk8, nearer header 생성16→삭제/disk8, macro/nested include·독립 test union·unrelated overlay 제외, search dir 밖 누락 `.inc` 생성10의 복구도 통과했다.

2 roots의 실제 shared external header4→6 갱신은 compiler2회, root 제거/감시 해제 뒤 header6→8은 compiler1회였다. actual publication이 보존한 previous open handle에 늦게 쓰고 그 watcher 알림을 전송했을 때 held Python completion을 취소/join하고 stale 결과를 버렸다. current bytes를 보존한 명시적 recovery/ack 알림 뒤 다시 Ready/완성이 가능했다. fixture 종료 ack 시 모든 기록한 Python PID 종료·analysis/dependencies temp0·등록0·Node exit0을 검사한다. 원본 및 private fixture 파일은 시험 뒤 정리했다.

actual adapter가 선택한 raw watcher2개의 pattern을 **pinned Code-OSS glob 모듈**로 검사했다. `.rtl`/활성 journal parent/previous/intent4종류는 감시되고 archived previous/unrelated generated text는 journal 감시에서 제외된다. Editor/LanguageClient API는 모델링한 진단이며 실제 OS 전달을 수용했다고 표시하지 않는다. 근거 `h7l-watch-patterns.json`.

기존 실제 runtime probe/owned IPC 시험도 갱신했다. generated100개 추가분석0과 `.rtl/defs.vh`3:0→7:0 유지·status20개 추가분석0·실제 Python3 exit/drain cache/live0·drain 이후 추가분석0·parent exit0·원본 불변이다. `h7l-ipc.json`; H7K receipt는 과거 근거로 보존했다.

## 검증 보정과 자동 결과

H7J headless fixture는 `capabilities:{}`를 사용했고 pinned SDK의 folder-change handler는 `workspaceFolders:true`일 때만 활성화된다. 당시 root remove/add 알림 전송은 실제 handler 수용을 입증하지 못했다. 기존 query/worker/shutdown 결과를 지우거나 새로운 검증으로 합산하지 않는다. 이번 helper는 capability를 선언했고 같은 burst의 actual remove/add/shutdown 및 별도2-root watcher 해제를 다시 검증했다. 서버도 그 기능을 지원하지 않는 클라이언트에서 무조건 handler getter를 호출하지 않는다.

| 검사 | 이번 결과/근거 |
|---|---|
| 복원 환경·기준 | Node24.19.0/Python3.12.14/pyslang11.0.0/Verilator5.032, GitHub main/HEAD85ba1fe6f245182faf90602628560cd04f8bcf69·이전 작업 보존 |
| runtime/language build | PASS, `h7l-runtime-build-final.log`, `h7l-language-build-final.log` |
| 신규 입력14개+corrected burst2개 | 16 PASS/0 FAIL, `h7l-inputs-capabilities.log` |
| 순차 전체279개 | **278 PASS/0 FAIL/1 Windows batch SKIP**, `h7l-full.log`, 약292초 |
| 실제 IPC/Python 전후 + adapter/pinned glob 선택 | PASS, paired JSON·diagnostic 로그·`h7l-watch-patterns.json` |

관련 cohort를 전체에 더해 중복 합산하지 않는다. concurrency1·기존 timeout/Windows skip을 유지했고 deps/lockfile·vsix·workbench overlay는 바꾸지 않았다. 전체 wall time은 실제160회 journal 저장 등도 포함하므로 generated 이벤트 최적화 지연 비교로 쓰지 않는다.

초기 타입 실패는 공개 registration Disposable의 `dispose()`가 void인 것을 확인한 뒤 typed 표준 등록/해제 RPC로 바꿨다(`h7l-language-build.log`). 초기 test fixture의 잘못된 import/role와 아직 preview인 관리 설정을 일반 loadProject로 읽은 오류를 정상 manifest publication fixture로 수정했다. 다중 root 실패에서 위 capability 누락을 발견했다. 초기 실패 로그(`h7l-inputs-first/second/third/final.log`, `h7l-multi-root-debug.log`, `h7l-related.log`)는 보존하고 최종 성공 수에 합산하지 않는다.

```bash
cd ide
source /workspace/.cloud-tools/activate.sh
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-semantic-inputs.mjs
# 이 작업의 private H7K server baseline이 있을 때만:
node scripts/verify-semantic-inputs.mjs --compare
```

## 잔여와 다음 단계

다음 **H7M은 수백 RTL 규모의 감시·재분석 비용과 일반 이벤트 root 범위**다. 일반 RTL 이벤트의 all-root, Core load/readiness scan·package auto-order/독립 test compiler 실행 비용, initial dependency discovery confirmation read·감시 directory 수/등록 churn을 먼저 분리 계측한다. 실제 대표 프로젝트가 제공됐다고 가정하지 않는다. 현재 입력 index·감시가 같은 process의 FS snapshot이나 CAS를 제공하는 것은 아니며 이벤트 지연/누락을 완전히 보증하지 않는다.

실제 Windows/Electron watcher의 create/change/delete/rename·exclude/junction·RelativePattern 외부/존재 전 경로 전달, LanguageClient stop/disconnect·host/app 종료, 공식 TS7 전체 타입/target emission·physical UI는 미실행이다. Linux RPC에서 감시 등록을 확인해도 Windows 이벤트 전달 수용은 남는다. 일반 비RTL source glob의 신규 구성 범위는 새 최적화의 수용 대상이 아니며 언어 editor 자체는 기존 RTL 문서 선택을 유지한다.

대표 설계·native cold/warm/idle/frame latency·실제 입력 체감·anonymous RSS 원인·전체 archive disk 정책과 clean Windows/FST/enum/encoding 등 기존 gate도 남는다. 화면/Computer Use는 마지막 Windows 통합 세션으로 모은다. 독립 ide/vsix 경계·확정 UX·source-first·원본/보관 bytes·신뢰/미저장 보호와 cleanup quarantine을 유지했고 commit/push·release 패키징은 하지 않았다.
