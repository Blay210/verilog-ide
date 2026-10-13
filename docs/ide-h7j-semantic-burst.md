# H7J 언어 분석 burst·공유·종료 (2026-10-13)

> H7L 검증 보정: 이 단계 headless 클라이언트의 `capabilities:{}`는 SDK가 workspace folder 변경 알림을 활성화하지 않는다. 당시 worker/query/shutdown 근거는 유지하지만 remove/add 알림 전송만으로 실제 handler 수용을 판정하지 않는다. H7L에서 `workspaceFolders:true`로 고친 burst 및 실제 shared2 roots/remove 감시 해제를 다시 통과했다. [최신 검증과 한계](ide-h7l-semantic-inputs.md).

후속 상태: [H7K](ide-h7k-language-lifecycle.md)에서 최신 startup/probe/restart·상태 single/focus·실제 IPC drain/parent close·quarantine·late callback/deactivation join을 검증했다. 다음 H7L은 실제 dependencies/이벤트/journal 무효화·generated 비용이다. 아래는 H7J 당시 구현·계측·검증의 역사다.

H7I 뒤의 언어 서버는250ms 파일 이벤트 debounce를 이미 사용했지만, 같은 위치의 동시 완성 요청마다 독립적인 slang 작업을 실행했다. 편집으로 이전 요청을 취소해도 실제 provider 정리가 끝나기 전에 새 분석을 시작할 수 있었고 shutdown은 controller만 취소한 뒤 바로 응답했다. 가볍고 빠른 UX를 위해 **진행 중인 같은 요청의 공유와 실행/대기 수 제한**을 구현했다. 화면 검증은 실행하지 않았다.

## 작업과 결과의 경계

`ide/language/src/semantic-work.ts`는 언어 서버 인스턴스 하나에서 provider 작업을 **동시2개·대기32개**로 제한한다. 여러 roots의 설정 읽기/분석과 completion·signature·enum query가 같은 제한을 사용한다. 대기 중에 취소된 작업은 시작하지 않는다. 실행 중에는 모든 caller가 취소돼도 실제 함수의 finally/파일·프로세스 정리가 끝나야 slot을 반환한다. 이 수치는 초기 자원 상한이며 Windows 최적 동시성이나 앱 전체 CPU/메모리/프로세스 예산이 아니다.

root·generation·정확한 file/offset/qualifier가 같은 동시 query만 공유한다. 결과가 끝나면 entry를 제거하므로 이후 요청은 새 provider 작업을 실행한다. 한 caller의 취소는 그 caller만 종료하며 다른 caller는 결과를 받을 수 있다. 마지막 caller가 취소되거나 source generation이 바뀌면 공유 작업을 취소한다. 정리 중 같은 key로 새 요청이 들어와도 이전 slot의 종료를 기다린다. queued work는 시작 직전, 결과는 실제 함수 종료 뒤 signal을 다시 검사한다.

generation controller를 파일 이벤트를 받은 시점에 교체한다. 설정 읽기가 끝났을 때 이미 취소된 세대는 provider를 호출하지 않는다. 기존 generation/document version·진단/완성 결과 보호를 유지한다. 새 pool이250ms debounce를 새로 만든 것은 아니며 공유 source/header가 roots 사이에 걸칠 수 있어 모든 root의 기존 보수적 무효화를 유지했다.

대기열 포화는 `Analysis busy` 상태로 구분한다. 이후 같은 문서의 요청으로 fresh 분석을 재시도할 수 있으며 이를 위해 idle retry timer를 추가하지 않는다. 명시적 compiler cleanup 실패는 pool을 quarantine하고 추가 작업을 거절한다. shutdown은 removed root를 포함해 pool이 추적하는 작업의 실제 정리까지 join하며 cleanup 실패를 정상 종료로 보고하지 않는다.

## 실제 LSP/Python 진단

실제 stdio LSP 서버와 Python3.12.14/pyslang11.0.0 bridge를 사용했다. 이전 `server.ts`를 private snapshot에 보존했고 두 실행은 동일한 형태의 **3 workspace roots·각1 RTL·100 watch notifications·같은 위치의20 동시 completion**이다. 서로 다른 private 디렉터리이며 같은 inode를 비교한 시험은 아니다.

Python wrapper가 process 시작을 기록하고 private gate에서 잠시 기다린 뒤 실제 `language/python/analyze.py`를 실행한다. 따라서 아래 시간은 controlled gate 해제 뒤 전체 결과까지의 관측으로, 자연 타이핑/완성 UI latency나 p95가 아니다.

| 관측 | H7I 서버 | H7J 서버 |
|---|---|---|
| 초기3 roots 실제 분석 횟수 | 3 | 3 |
| gate에서 동시에 대기한 root provider processes | 3 | 2 |
| 초기20 요청의 실제 query processes | 20 | 1 |
| query gate 해제→결과 수신 | 약3,190ms | 약241ms |
| 종료 응답 시 실제 실행 중인 기록된 process | 0 | 0 |
| 종료 응답 시 analysis temporary directories | 3개 잔류·FAIL/exit1 | 0개·PASS/exit0 |

100 이벤트가3회 분석으로 모인 것은 양쪽 모두 기존 debounce의 결과다. H7J 이득은 동시 query20→1과 provider 동시 실행 제한이다. 뒤의 별도 query는 다시 실행됐으며, 한 caller를 취소해도 나머지19개는 정확한 symbol을 받았다. query가 gate에 있을 때 unsaved source를 바꾸면 이전 결과는 빈 응답으로 거절되고 새 `local_latest` symbol만 반환됐다. 디스크 소스는 원형을 유지했다. root remove/re-add 중 shutdown도 provider exit·cache 정리를 확인했다.

근거: `ide/.dev/cloud/h7j-semantic-before-final2.log` / fixture `cloud-h7j-lsp-u4ztCN`은 이전 상태의 실제 FAIL이며 정상 결과에 합산하지 않는다. `h7j-semantic-after-final.log` / `cloud-h7j-lsp-zFt0l7/receipt.json`은 PASS다. 이전 source SHA256은 `594cc72ea6b039442750239be82974dd1dfeb79b5974d7a346cc12f20f709458`이고 private copy와 진단 산출물은 Git에 포함하지 않는다.

초기 진단 harness에 optional token의 `undefined`를 JSON-RPC 인자로 보내 gate에 도달하지 못한 실행이 있었다(`h7j-semantic-before-final.log`). 실제 protocol 인자를 고친 뒤 위 결과를 얻었다. 실패 시 server가 살아 있는 동안 graceful shutdown/기록된 bridge 종료와 reaping을 시도하도록 harness도 보완했다. 해당 초기 실패 fixture `cloud-h7j-lsp-NOHdt2`의 PID52166은 PID1 아래 defunct로 남았으며 실행/CPU/메모리를 쓰는 Python worker가 아니다. 기존 실패 artifact를 삭제하거나 이 PID를 성공적인 shutdown 근거로 사용하지 않는다.

## 자동 검증과 실행 범위

- runtime/language 타입·build PASS: `h7j-runtime-build.log`, `h7j-language-build.log`.
- 전체246개 **245 PASS/0 FAIL/1 Windows batch SKIP**: `h7j-full.log`, 약192초. 기존 실제160회 저장/보관·Core/host/language/파형 회귀 포함.
- 최종 overload 재시도 guard 뒤 관련 **35 PASS/0 FAIL**: `h7j-final-guards.log`. 신규 capacity1개와 기존34개를 재검증했다. 최종 고유 범위는 **246 PASS/0 FAIL/1 Windows SKIP, 총247개**다. 전체 wildcard를247개로 다시 실행했다는 뜻이 아니며 cohort를 중복 합산하지 않는다.

신규8개는 concurrent-only 공유와 settled result 재분석, peer cancellation, 마지막 caller 취소 뒤 실제 cleanup slot 유지·같은 key 재요청, capacity/queued 취소/재시도, close join·늦은 결과 차단·반복 close, cleanup failure quarantine, 실제 LSP burst/세대 갱신/root 재추가/종료, queue 포화 뒤 추가 편집 없는 on-demand recovery다. 마지막 recovery 시험은 **private server bundle에서만1 active/0 waiting**으로 줄여 두 roots로 포화를 재현했다. 제품 default2/32를 바꾸거나 compiler 결과를 mock한 시험이 아니다. 기존 실제 slang module/port/package/scope/signature/enum·원본 불변과 owned 언어 bundle 배치 검증도 통과했다. timeout/skip을 늘리지 않았다.

```bash
cd ide
source /workspace/.cloud-tools/activate.sh
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-semantic-burst.mjs
```

위 wildcard는 현재247개를 한 번에 실행한다. `--before`는 이 작업의 ignored 이전 source snapshot을 요구하며 새 task에서 자동 복원된다고 주장하지 않는다. before 진단의 FAIL은 실제 과거 결함 관측이다.

## 잔여와 다음 단계

H7J는 언어 서버의 provider 작업 수를 제한한 것이며 모든 JSON-RPC caller 수·문서/분석 payload 크기·앱 전체 RSS를 제한한 것은 아니다. queue 기다림은 실제 compiler15초 예산과 구분된다. 많은 roots/큰 프로젝트의 대기 지연과 합리적인 동시성은 후속 측정이 필요하다. 별도 simulation/import semantic provider는 이 LSP pool에 들어오지 않는다.

all-root 무효화·완료 뒤 재분석·package/test별 실제 compilation 비용은 남는다. **다음 H7K는 언어 서비스 시작/재시작과 idle·generated file 이벤트 비용을 분리**한다. `semantic.ts`의 probe/restart queue는 이번에 바꾸지 않았다. 선언된 입력을 검증하지 않고 generated/dependency 이벤트를 무조건 무시하지 않는다. 실제 Code-OSS LanguageClient의 stop deadline/IPC·Windows taskkill 및 실패/재시작 정책, 공식 본체 TS7/target emission·앱/물리 UI, 실제 설계·RSS는 계속 잔여다. Computer Use/화면 검증은 마지막 Windows 통합 세션에 모은다. ide/vsix의 코드·deps·lock 독립성과 미배포 정책을 유지했다.
