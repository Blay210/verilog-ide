> 2026-10-15 후속: [자동 추천 표시·패키지 namespace 보완](pulse-automatic-completion.md)을 적용했다. 처음 빈 결과 뒤에도 유효한 최근 typing intent로 표시하며 Esc/포커스/이동은 보존한다. snippet 자동 추천과 실제 package 이름/전체 후보 pool도 연결했다. 아래의 visible widget만 갱신하는 설명은 과거 동작이다.

> 2026-10-15 최신: [첫 조회 비용·Simulation UI 지연 구성·독립 로컬 built 실행본](pulse-performance-final.md)을 적용했다. 전체405 PASS/1 POSIX SKIP와 후속8 PASS·공식 bundle/파일/CLI를 확인했다. 기존 Setup은 이전 버전이며 최신 실행은 `ide/Start-Pulse.cmd`다. 실제 새 화면/Windows startup·부분 compiler 증분은 잔여다. 아래의 소스 개발 실행/모든 첫 조회 비용 미보완 설명은 이전 기록이다.

# Pulse 편집 중 추천과 분석 예약 분리 (2026-10-15)

후속으로 [변경 후 worker 재사용](pulse-worker-rebuild.md)을 구현했다. 아래391건 회귀/2프로세스 계측과 ‘같은 worker rebuild 미구현’은 이번 예약 분리 단계의 당시 기록이다. 최신 입력·취소 계약과 다음 작업은 후속 문서를 우선하며, 재실행되는 합성 측정 JSON은 최신 회귀 값으로 갱신된다.

사용자의 ‘입력 중에는 추천하고, 구문 완료 또는 입력 멈춤 뒤 분석 정보를 갱신하자’는 제안을 실제 built-in 언어 클라이언트에 적용한 첫 단계다. [성능 후보](pulse-performance-options.md)의 E1 예약 부분과 E4 즉시/정밀 응답 분리에 해당한다. E1의 **같은 Python worker 안에서 새 compilation 구성**, E2 진단 분리, E3 compiler 입력/구문 트리 재사용까지 완료한 것으로 계산하지 않는다.

## 현재 동작

- 연속 입력은 마지막 변경 하나로 합친다. 일반 편집은 마지막 입력 후400ms, code 문맥의 구문 종료 `;`·`end`/`endmodule`/`endfunction` 등은120ms 뒤 분석을 예약한다. 실측을 거쳐 조정할 초기 값이며 사용자 설정 UI는 추가하지 않았다.
- 문자열·주석·directive/macro 내부, `for(...)` 괄호 안의 세미콜론은 빠른 분석 신호로 취급하지 않는다. Enter·삭제·불완전 구문도 일반 idle 갱신 대상이므로 세미콜론이 없다고 편집 지원이 영구 정지하지 않는다. 이 검사는 구문 유효성 판정이나 compiler 분석이 아닌 lexical 예약 힌트다.
- completion/hover/signature/tokens/definition/code action 요청은 예약을 앞당기거나 진행 중인 전체 분석을 기다리지 않는다. 준비되지 않은 generation의 의미 후보·탐색/변환 결과는 비워 둔다. 별도 basic provider가 예약어/시스템 항목/현재 문서 범위의 wire·reg·logic 보조 후보를 제공한다. 이 보조 정보는 compiler 확정 결과와 구분한다.
- 입력 즉시 이전 의미 결과·진단을 무효화한다. 이미 실행 중인 bounded 분석은 입력마다 강제 종료하지 않으며, 완료되어도 generation이 바뀌었으면 게시하지 않는다. root마다 현재 분석 하나와 최신 대기 변경 하나만 유지한다. 조용한 시간이 지난 뒤 현재 분석이 끝나면 최신 입력을 분석한다. 외부 header·설정·root 제거·종료는 여전히 기존 취소/실제 프로세스 정리 경계를 따른다.
- 최신 모델 준비 시 문서 version과 함께 `rtl/analysisReady`를 알린다. 클라이언트의 마지막 추천 요청·현재 file/version/caret가 같고, Code 화면의 편집기에 포커스가 있으며 **추천 목록이 이미 열려 있을 때만** 재조회한다. Esc로 닫았거나 커서/문서/공간이 바뀌면 다시 열지 않는다. 지연 import 이후에도 조건을 다시 확인한다. 지원 클라이언트에는 semantic tokens 갱신도 요청한다.
- 분석 예약 힌트용 이전 문서는 최대16개·각1MiB다. 초과/비보관 문서는400ms idle만 사용하며 문서나 진단 정확성을 바꾸지 않는다. 기존 worker2/context4/15초 deadline/유휴120초/메모리·작업 큐 한도를 유지한다.
- `rtl/languagePerformance`에 편집 횟수·분석 작업 시작 횟수·게시하지 않은 obsolete 작업 횟수·대기 여부를 추가했다. 분석 작업 하나에 watch 등록 후 확인 재분석이 들어갈 수 있으므로 이 시작 횟수를 OS compiler 프로세스 개수와 혼동하지 않는다.

## 파일과 호환성

- `ide/language/src/edit-scheduling.ts`: lexical 예약 힌트와 completion 요청 identity.
- `ide/language/src/server.ts`: 예약과 passive 요청 분리·직렬 최신 작업·version/generation 검사·ready 알림.
- `ide/language/src/semantic.ts`: built-in 클라이언트에서 `interactiveEditing:true` 활성화·현재 추천 요청 확인.
- `ide/src/rtlSpaces.contribution.ts`: 이미 열린 native suggest만 갱신하는 보호된 명령. SuggestController는 명령 실행 때 지연 import한다.
- `ide/tests/edit-scheduling.test.mjs`, `completion-refresh.test.mjs`, `semantic-inputs.test.mjs`: 예약 힌트·실제 LSP/기존 slang·native handler 비화면 경계 검증.

`interactiveEditing`은 내부 클라이언트 계약이다. 기존/검증용 LSP 클라이언트는 지정하지 않으면 이전의 요청 시 준비 대기 동작을 유지하며, 제품 built-in은 새 동작을 사용한다. retained session과 dynamic watch가 없는 환경의 기존 일회성 compiler fallback은 유지한다. Core/CLI/시뮬레이션 입력 검증은 추천 캐시를 사용하지 않으며 변경하지 않았다. VSIX 프로젝트는 수정하지 않았다.

## 검증 현황

관련51건 PASS/0 FAIL/0 SKIP: `ide/.dev/windows-integrated/pulse-edit-scheduling-regression.log`. actual Windows slang/Python을 사용한 gated LSP에서 compiler를 멈춰 둔 동안 추천 요청이 먼저 응답하고,11회 편집 후에도 최초 프로세스가 유지되며 추가 분석을 시작하지 않는 것을 확인했다. gate 해제 후 이전 모델은 게시하지 않고12번째 문서 version의 최신 이름만 추천했다. header width 변경·잘못된 TOML·복구·캐시/프로세스 정리도 확인했다. native handler는 Esc/포커스/파일/버전/커서/공간 변경 및 import 중 변경을 검사했다.

최종 전체 회귀 중 같은 gated fixture의12회 LSP 응답은 p50약0.63ms/p95약1.68ms였고 compiler 시작2회/분석 작업2개/obsolete1개였다(`ide/.dev/windows-integrated/pulse-edit-scheduling-measurement.json`). **이는 최신 의미 후보가 아직 준비되지 않았다는 incomplete 응답 시간**이다. 별도 lexical 후보와 합쳐 화면에 표시되는 시간, 최신 의미 후보까지의 시간, 일반 프로젝트 성능을 이 수치로 주장하지 않는다.

첫 제한 환경 LSP2건은10초 안에 준비 경계에 도달하지 못했다(`pulse-edit-scheduling-lsp.log`). 최초 로그만으로 구체 원인은 확정하지 못했다. fixture 전용 Windows 접근 권한으로 다시 실행해2 PASS(`pulse-edit-scheduling-lsp-retry.log`), 이어 위51 PASS다. 처음 추가한 refresh test는 arrow 함수의 lexical `this`를 잘못 만든 시험 wrapper 때문에 실패했으며 실제 constructor와 동일한 owner closure로 고친 뒤13개 guard/lifecycle PASS다. semanticTokens.refresh의 반환형을 Promise로 가정한 언어 build 오류도 실제 API의 void 반환형에 맞게 고쳤다. 검사를 제거하거나 실패 기준을 낮추지 않았다.

첫 전체 회귀는 기존 modeled LanguageClient에 `onNotification`이 없어 수명 테스트4개가 실패했고, 후속 held-start 검사에서 대기하여 중단했다(`pulse-edit-scheduling-all-tests.log`, 전체 완료/합격으로 계산하지 않음). 실제 라이브러리 API에 맞춰 대역에 notification 등록과 command 실행 기록을 추가했다. 제품의 알림 경로를 끄지 않았다. 기존 lifecycle 및 새 현재/이전 client·version/caret/selection·비신뢰/disabled/disposed guard17개 PASS(`pulse-edit-scheduling-lifecycle-final.log`), 현재 분석+최신 대기가 있는 상태에서 shutdown의 실제 process/cache 정리를 포함한 interactive LSP3개 PASS(`pulse-edit-scheduling-lsp-final.log`) 후 전체를 다시 실행했다.

최종 전체 회귀 **391건:390 PASS/0 FAIL/1 POSIX SKIP**, 약325초·exit0: `ide/.dev/windows-integrated/pulse-edit-scheduling-all-tests-final.log`. 앞선 관련51/17/3건과 중복되므로 합산하지 않는다. 언어 build exit0(`pulse-edit-scheduling-language-final.log`), 전체 upstream 타입/owned emission0 errors(`pulse-edit-scheduling-types.log`), compiled policy/host/language 정책·diff 검사 PASS다. guarded overlay와 runtime/language bundle 준비 후9자산의 최신 launcher prepare/check도 통과했다. 최신 실행은 `ide/Start-Pulse.cmd`이며 기존 Setup/ZIP은 이번 소스가 아니다.

화면/Computer Use·앱 시작·Setup은 실행하지 않았다. 추천 목록의 실제 표시·선택 안정성·Code/Simulation 전환 중 notification·대형 설계 CPU/RSS 및 Windows UI 체감은 미검증이다. 최종 승인된 화면 세션까지 유예한다.

## 남은 병목과 다음 순서

1. 이번 변경은 **편집 묶음마다 여전히 새 compiler 모델/프로세스를 준비한다.** 바뀌지 않은 모델 조회의 기존 재사용은 유지하지만 변경 후 같은 Python worker에서 rebuild하는 프로토콜은 다음 E1 작업이다. root 수명과 generation 수명을 분리하고 취소·deadline·cleanupFailed·RSS 제한을 검증해야 한다. 오래 걸리는 이전 분석이 최신 분석을 늦출 수 있어 bounded 선점 정책/최신 유효 후보까지의 시간도 함께 측정한다. 입력마다 무조건 종료하거나 반대로 무제한 기다리는 방식으로 되돌리지 않는다.
2. 갱신 중 module/package/port의 정밀 후보는 새 모델이 준비될 때까지 잠시 빠질 수 있다. 오래된 scope/좌표/타입을 최신 결과처럼 사용하는 방식을 피했다. 안전한 미변경 module metadata와 현재 text의 문맥 보정, 최초 조회 비용/전체 진단 분리는 후속 E2/E4에서 다룬다. 유휴 세션 종료/한도 초과 시 기존 일회성 조회 비용도 남는다.
3. compiler 자체의 변경 부분만 재분석하는 기능은 미구현이다. compilation unit의 macro/include/source 순서 의미를 보존하며 E3 syntax tree 재사용 범위를 검증한다.
4. 이 fixture의 LSP 응답 시간은 실제 추천 목록 표시 시간이나 수백 파일 복잡 설계 수용 수치가 아니다. 작은 실제 Windows 편집 프로젝트에서 첫 유효 추천 p50/p95·목록 갱신 시 선택 안정성·CPU/RSS를 나중에 승인받은 화면 세션에서 확인한다.
5. 앱 시작 지연은 별도 S1/S2 작업이다. 최신 소스의 최적화 실행본/cache 계측과 시작 provider/Simulation UI의 실제 import 분리를 진행하며, 개발 launcher의 `VSCODE_DEV=1`만 제거하는 식으로 우회하지 않는다. 기존 소스 보관 provider의 editor 복원 전 등록은 유지한다.

다른 모델은 위 구현과 한계를 먼저 읽고 `docs/delivery-plan.md` 순서를 따른다. 이번 변경을 제품 전체 성능 또는 Windows UI 수용 완료로 요약하지 않는다. visible 검증은 **새 사용자 승인 후** 마지막 통합 세션에서 진행하고 기존 창·프로필·신뢰 설정을 보존한다.
