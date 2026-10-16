> 2026-10-15 후속: [자동 추천 표시·패키지 namespace 보완](pulse-automatic-completion.md)을 적용했다. 처음 빈 결과 뒤에도 유효한 최근 typing intent로 표시하며 Esc/포커스/이동은 보존한다. snippet 자동 추천과 실제 package 이름/전체 후보 pool도 연결했다. 아래의 visible widget만 갱신하는 설명은 과거 동작이다.

> 2026-10-15 최신: [첫 조회 비용·Simulation UI 지연 구성·독립 로컬 built 실행본](pulse-performance-final.md)을 적용했다. 전체405 PASS/1 POSIX SKIP와 후속8 PASS·공식 bundle/파일/CLI를 확인했다. 기존 Setup은 이전 버전이며 최신 실행은 `ide/Start-Pulse.cmd`다. 실제 새 화면/Windows startup·부분 compiler 증분은 잔여다. 아래의 소스 개발 실행/모든 첫 조회 비용 미보완 설명은 이전 기록이다.

# Pulse 시작·자동완성 현재 상태와 다음 구현 (2026-10-15)

최신 후속은 [변경 후 분석 프로세스 재사용](pulse-worker-rebuild.md)이다. interactive source 편집은 같은 worker에서 이전 모델을 해제하고 새 모델을 구성하며 아래의 ‘같은 worker rebuild 미구현’은 이전 단계 설명이다. 부분 compiler 증분/첫 정밀 조회/앱 시작·실제 UI 수용은 여전히 잔여다.

후속: [편집 중 추천/분석 예약 분리](pulse-edit-scheduling.md)를 실제 built-in에 적용했다. 입력 묶음400ms/구문 완료120ms·한 root의 최신 대기 하나·구 generation 게시 차단·이미 열린 suggest의 안전한 갱신을 추가했다. 아래250ms/요청 시 분석 대기 설명은 이전 동작이다. compiler의 변경 부분 재분석과 같은 Python worker의 새 compilation 재구성은 여전히 미구현이며 앱 startup 수용도 별도다.

후속 병목 해결안의 비교·코드 경로와 slang11 API 확인·추천 순서는 [성능 후보 검토](pulse-performance-options.md)를 참고한다. 검토이며 추가 구현 또는 화면 검증 완료가 아니다.

## 최신 구현 — compiler 모델·범위 조회 재사용

이번 후속에서 `ide/language/src/analysis-session.ts`와 Python `editor-session` 프로토콜을 구현하고 실제 built-in 언어 클라이언트에서 활성화했다. 편집 후 기존250ms 예약/취소·Core 설정 로드·의존 파일 watch 등록을 거쳐 해당 입력 generation의 slang compilation/default elaboration/source manager를 메모리에 유지한다. 자동완성은 stdin/stdout의 UTF-8 프로토콜로 이 모델을 조회하며, 요청마다 Python 실행·source 재읽기·전체 compilation을 반복하지 않는다. 프로젝트 Python/시뮬레이션은 실행하지 않는다.

이름·scope 범위·package 이름의 compiler 인덱스와 compiler lookup 결과를 재사용한다. 결과 캐시 키는 입력 generation 안의 파일·정확한 compiler scope/parameterization·다음 선언의 경계·package qualifier다. prefix만으로 재사용하지 않는다. 선언 순서·shadowing·테스트별 문맥은 slang 조회와 공통 RTL 결과 교집합 규칙을 그대로 따른다. named-port 후보 제외/타입 추천·signature/enum 질의도 기존 경계를 유지한다. 인스턴스 이름과 새로 인스턴스화할 module 정의를 구분해 기존 인스턴스 이름에는 module 작성 snippet을 넣지 않는다.

편집/헤더/include 대안/설정/프로젝트 root 이벤트는 이전 세션을 종료하고 새 generation을 만든다. 새 watch를 발견하면 등록 후 재분석하는 기존 확인 규칙도 유지한다. root 제거/종료/취소는 공통 process runner의 실제 leaf 종료를 확인하고 임시 editor 디렉터리를 정리한다. 정리 실패는 교체를 차단한다. 일반 compiler 종료 오류와 종료 미확인은 구분해 확인된 종료 후에는 재시도할 수 있다.

### 자원과 fallback

- retained worker 최대2개, worker마다 독립 test context 최대4개와 context source 최대2048개. 넘으면 기존 일회성 분석/조회 경로를 쓴다.
- 관측 source text32MiB 또는 Windows working set512MiB 초과 모델은 유지하지 않는다. 조회 중 지연 elaboration으로 커지면 응답 후 종료한다. 이는 **유지 여부의 사후 검사**이며 초기 compilation의 순간 peak까지 하드 제한하는 OS 격리는 아니다.
- scope별 후보 캐시 context당128개/직렬화 크기8MiB, source 좌표 캐시의 기존 제한도 유지.120초 유휴 worker는 stdin EOF로 종료한다. 유휴 중 디스크 polling은 없다.
- dependency dynamic watch 등록을 지원하지 않는 클라이언트, 한도 초과 프로젝트, 유휴 종료/질의 취소로 세션이 해제된 경우 일회성 compiler 조회로 돌아간다. 다음 편집의 분석 때 다시 세션을 준비한다. 같은 worker의 질의 취소는 그 worker의 대기 질의도 취소하므로 현재 후보를 다시 요청할 수 있다.
- LSP 내부 `rtl/languagePerformance`는 generation·retained 여부·build/query 시간/횟수·source bytes·RSS만 반환하고 소스 text/경로는 반환하지 않는다.

### 현재 성능 근거와 정확한 한계

Windows 실제 설치된 slang11/Python3.14로200개 작은 RTL 파일(16,704 source bytes)의 합성 fixture를 측정했다. scope 캐시 전 반복 조회 중앙값 약105ms, 이후 측정은 최초 약253ms·반복 중앙값 약3.37ms·일회성 기존 조회 약869~1016ms·최초 모델 준비 약568ms·관측 peak working set 약38MiB였다. 원시값은 `ide/.dev/windows-integrated/pulse-completion-session-measurement.json`; 최종 전체 회귀에서 갱신된 값이 있으면 그것을 우선한다. 완성 후보의 editor 렌더링 시간은 포함하지 않는다. 작은 모듈200개는 복잡한 실제 수백 파일 설계나 Windows 물리 UI의 성능 수용을 대신하지 않는다.

**변경된 문서의 compilation 자체를 부분 갱신하는 compiler 증분 API는 아직 구현하지 않았다.** 편집 직후 최신 generation이 준비되기까지는 전체 분석 대기가 남는다. 현재는 compiler 객체·인덱스·같은 의미 문맥의 후보 재사용 단계다. 오래된 generation 후보를 최신 결과로 표시하지 않는다. 다음 성능 단계는 실제 편집 시 처음 후보가 뜨는 시간 계측→공개 slang API의 syntax tree/의존 범위 재사용 가능성 조사→정확한 입력 무효화 하의 분석 범위 축소다.

### 통합 근거와 실패 복구

- 최종 전체 회귀379건: **378 PASS/0 FAIL/1 POSIX SKIP**, 약358초·exit0. `ide/.dev/windows-integrated/pulse-project-completion-all-tests-final.log`. 이후 alias/EOF 경계를 보완하고 수행한 최신 관련56건은 **55 PASS/0 FAIL/1 POSIX SKIP**, 약83초·exit0(`pulse-completion-final-boundaries.log`). 두 집합은 중복되므로 합산하지 않는다. retained 두 root/공유 header 변경·root 제거 별도1 PASS(`pulse-completion-multiroot-tests.log`).
- 최초 전체378건은355 PASS/22 FAIL/1 SKIP이었다.22건 모두 검증용 `semantic-request.mjs`가 이전 `def analyze(request):` 및 traversal hook에 고정되어 fixture 시작을 거절한 경우였다. 지원하는 정확한 새/이전 함수 서명을 구분하고 hook의 단일 존재 검증을 유지해 보완했다. 해당 계측27 PASS 및 위 최종 전체 회귀로 확인했다. 제품 검사를 생략하거나 기준을 낮추지 않았다.
- 추가 검사에서 **단일 module 파일이 끝 개행 없이 끝나면 CompilationUnit과 InstanceBody의 source 범위가 같아 module 신호가 후보 교집합에서 빠지는 기존 문제**를 발견했다. 명확한 내부 scope가 있으면 바깥 CompilationUnit을 제외하도록 보완했고 wire/reg/logic EOF 재현과 기존 scope/선언 순서/package/미저장 입력을 다시 확인했다. 조회용 별칭 경로는 매 요청 실제 경로를 해석해 별칭 재지정 뒤 옛 compiler identity가 재사용되지 않도록 했다.
- 최종200파일 측정: 모델 준비618.8ms, 최초 조회360.1ms, 반복 중앙값3.16ms, 새 프로세스/분석을 하는 기존 경로940.5~1418.8ms, 관측 peak RSS39,952,384 bytes. 합성 API fixture의 결과이며 전체 editor UI 지연이나 일반 설계의 보장 수치가 아니다.
- runtime/language build exit0, 전체 본체 타입/owned emission0 errors, compiled 제품/host/언어 정책 검사·script syntax·diff check PASS. 최신 runtime/language/Python overlay와 새 프로젝트 진입 JS를 준비하고 launcher version2의9개 자산 검사/실행 정보 갱신을 완료했다. 실제 앱은 열지 않았다.
- 최초 retained session 검사에서 한글 경로의 redirected stdin ANSI 해석으로3건 실패했다. Python stdin UTF-8 명시 후 실제 저장/미저장·package·범위·독립 TB·취소 검사가 통과했다.
- 전체 본체 타입 검사에서 layout part union1건을 발견해 `as const`로 single-window parts를 좁혔다. 최종 `pulse-completion-project-types-final.log`0 errors/owned emission0 errors.
- cache 전 통합63건 중62 PASS/1 Windows 비대상 POSIX SKIP·0 FAIL: `pulse-completion-integration-tests.log`.
- cache·RSS·새 layout 보호 후 관련37 PASS/0 FAIL: `pulse-project-completion-final-tests.log`. 전체 회귀 결과는 아래 또는 공통 handoff 최신 항목을 우선한다. 겹치는 검사 수를 합산하지 않는다.
- 새 프로젝트 진입에서 navigation을 잠시 숨기되 프로젝트 전환/종료 전 이전 native layout 가시성을 되돌린다. 빈 창에서 숨긴 activity/sidebar가 다음 Code 프로젝트에 저장되는 부작용을 보호했다.
- Computer Use/visible 앱/Setup은 실행하지 않았다. 실제 프로젝트 시작·편집 추천 UX와 전체 앱 cold startup은 여전히 사용자 승인 후 확인할 항목이다.

## 사용자 결정

- 폴더가 없는 첫 화면은 Code/Simulation과 별도의 프로젝트 진입이다. 프로젝트를 열기 전 stock Code 빈 화면으로 전환하지 않는다.
- Code↔Simulation 전환 중 상태는 유지한다. 프로젝트/앱 종료 후 Pulse의 마지막 공간·파형 탭·커서 세션을 자동 복원하는 이전 요구는 철회됐다. 최근 프로젝트, 실행 이력, 보관 소스/파형은 지우지 않는다. Code-OSS의 미저장 파일 복구를 제거하는 요청으로 해석하지 않는다.
- 사용자 제안: 편집 중 백그라운드에서 의미 분석 결과를 갱신하고 자동완성은 준비된 정보를 재사용한다. 위의 모델/범위 캐시 단계는 구현했으며, compiler 자체 부분 갱신은 후속이다.

## 이번 소스 구현과 검증

`ide/src/rtlProjectStart.ts`를 독립된 경량 진입으로 추가했다. 빈 창은 Ready 단계에서 진입 화면을 표시하며 SimulationHome 생성/검사와 editor restoration 대기를 피한다. 새/기존/최근 프로젝트, 개별 최근 제거를 제공하고 빈 창의 Code/Simulation 명령은 진입 화면에 머문다. 프로젝트가 있으면 Code로 시작하고 Pulse 세션 저장 주입/자동 복원은 중단한다. 기존 Pulse storage 키만 제거한다.

언어 편집기는 현재/상위 lexical scope의 wire/reg/logic·포트 보조 추천을 제공한다. 이는 compiler 의미 분석을 대체하지 않으며 별도 lexical fallback이다. module 추천은 Class 종류와 인스턴스 이름/연결부 tab stop, named port는 연결 괄호 tab stop을 제공하고 기존 `(` 중복을 피한다. RTL 기본 설정에서 Emmet/색상 장식/일반 단어 추천을 억제한다. 사용자 설정을 강제로 초기화하지 않는다.

- language build exit0.
- 전체 본체 타입 검사/owned emission0 errors: `ide/.dev/windows-integrated/pulse-project-entry-editing-types.log`.
- 진입/종료 정책·보조 추천·보관 소스 관련30 PASS: `pulse-project-entry-editing-tests.log`.
- 실제 slang·언어 서버·입력 무효화 관련50 PASS/0 FAIL, 약46.7초: `pulse-project-entry-semantic-tests.log`. 위30건과 중복 가능하므로 합산하지 않는다.
- 최초 일반 completion을 lexical/cached 이름으로 우회한 시도는 취소/입력 generation 회귀2건이 실패하여 제거했다. 최종50 PASS는 그 우회를 제거한 코드다. compiler scope/입력 무효화 계약을 속도 명목으로 약화하지 않는다.
- 새 물리 화면·최초 표시 시간·실제 자동완성 지연·설치판은 미검증. Computer Use/visible 앱은 시작하지 않았다. 새 세션은 사용자 명시적 승인이 필요하다.

## 재사용 구현 전 확인한 병목 (이전 기록)

이전 `language/src/server.ts`의 completion은 `snapshot()`에서 분석을 기다리고 `provider.complete()`로 별도 compiler query를 수행했다. 위 후속에서 retained 모델/인덱스 조회를 연결했고 지원하지 않는 환경만 기존 경로로 돌아간다. 첫 분석 대기는 남는다. 단순 lexical 보조 추천으로 이 문제가 해결됐다고 보고하지 않는다.

빈 창의 Simulation 객체/IPC 초기화는 분리했지만 native contribution에 정적 SimulationHome import가 남아 있다. 전체 module graph lazy loading이나 Code-OSS 개발 본체 cold startup 병목을 모두 해결한 것이 아니다. 기존 main→renderer10.695/21.229초 측정과 작은 프로젝트 Core 읽기4.6~14.9ms는 `pulse-startup-investigation.md` 참조. 새 UI 준비 시간은 아직 측정하지 않았다.

## 최초 구현 순서와 후속 기준

현재2·3번의 모델/인덱스 재사용은 상단과 같이 연결했다.4번은 기존 generation/watch 무효화를 유지하며,5번의 compiler 자체 분석 범위 축소와 실제 UI 지연 계측이 남는다. 아래 항목을 모두 미구현으로 다시 시작하지 않는다.

1. **계측:** 요청→첫 후보/의미 후보 시간, background 분석 횟수/시간, 취소율, 편집 중 메모리를 기록한다. 실제 Windows 수백 RTL 파일 프로젝트에서 중간값과 느린 요청을 비교한다. 키워드 응답과 의미 응답을 구분한다.
2. **재사용 가능한 분석 세션:** slang/pyslang의 실제 API 범위를 확인하고 장기 실행 worker·열린 문서 메모리 overlay·프로젝트 설정 revision을 관리한다. 기존 provider 경계를 유지하며 자체 compiler는 시작하지 않는다. 객체 재사용과 진정한 compiler 증분 분석을 구분한다.
3. **메모리 인덱스:** 프로젝트 module/port·package 공개 심볼과 현재 문서 lexical/semantic scope를 분리해 보관한다. 커서 위치/선언 순서/가림/이미 연결된 포트/불완전 코드 문맥을 반영해 조회한다. 인덱스만 조회하면 모든 의미 질의가 해결된다고 가정하지 않는다.
4. **갱신/정확성:** 짧은 편집 debounce와 오래된 작업 취소/합치기, 문서 version·root·설정 generation 일치 시 게시, package/include/define/모듈 포트 변경의 의존 항목 무효화를 구현한다. 파일 수정 시 그 파일만 갱신하면 항상 정확하다는 가정은 금지한다. 미저장 buffer를 지원한다.
5. **범위 축소:** compiler가 지원하는 재사용/증분 분석만 활용한다. 전체 재분석이 필요한 입력에는 정확성을 유지한다. 요청마다 전체 재분석하는 경로를 줄이되 과거 generation 결과를 현재 범위의 확정 후보로 노출하지 않는다. 캐시/worker 큐 크기와 메모리를 제한한다.
6. **필요할 때만 디스크 캐시:** 자동완성 조회의 기본은 메모리다. 재시작용 프로젝트 인덱스가 유효할 때만 `.rtl/` 또는 도구 공용 캐시에 버전/설정/hash를 붙인다. 매 키 입력마다 디스크 파일을 읽고 쓰지 않는다. 세션 복원 정책과 분석 캐시 유효성은 별개다.

요약 구조: 편집 변경 → 예약/취소 → 필요한 분석 갱신 → 최신 의미 모델·인덱스 게시 → 커서 문맥을 적용한 자동완성. 당장 모든 파일의 모든 의미를 선계산할 필요는 없으며 열린 파일을 우선하고 무거운 질의는 필요한 순간에 계산한다.

## 설계 참고

- [clangd index](https://clangd.llvm.org/design/indexing): 열린 파일의 동적 인덱스와 프로젝트 background 인덱스를 결합한다.
- [clangd request handling](https://clangd.llvm.org/design/threads): completion은 캐시 외에도 커서 위치 파싱이 필요할 수 있다.
- [rust-analyzer architecture](https://rust-analyzer.github.io/book/contributing/architecture.html): 메모리 입력·증분/필요 시 계산과 구조화된 의미 모델을 사용한다.

이는 실무에서 쓰이는 대표 구조의 근거이며 언어 서버별 사용률 통계나 slang이 동일 기능을 지원한다는 근거는 아니다.

다음 owner는 상단의 실제 구현/한도를 우선 읽고 실제 편집 요청 계측·변경 후 분석 범위 축소부터 진행한다. 화면 검증과 Setup은 사용자 요청 전 진행하지 않는다. `ide/`와 `vsix/` 사이 import/load/build 입력을 만들지 않는다.

## 다음 한 번의 승인된 화면 검증 항목

1. 폴더 없는 시작이 Code/Simulation이 아닌 별도 진입이며, 최근 행 hover/X·새/기존 프로젝트가 동작하는지 확인한다. 프로젝트 전환 후 activity/sidebar가 사라져 있지 않아야 한다.
2. 실제 Windows 첫 사용 가능 시각과 프로젝트 전환의 `[Pulse timing]` 로그를 비교한다. 컴파일/API의 ms를 창 준비 시간으로 대체하지 않는다. static native imports/개발 본체 cold load는 미해결 후보로 남긴다.
3. 신뢰된 기존 프로젝트에서 준비 후 module/신호 아이콘·instance/port tab stop·다른 scope 신호 제외·#10 색상 추천 억제, 편집 직후/준비 후 응답 시간을 확인한다.
4. Code↔Simulation은 사용 중 보존하고 종료/다시 열기 뒤 Pulse 세션은 자동 복원하지 않는 새 정책을 확인한다. 최근/이력/보관 소스·파형·미저장 데이터는 보존한다.
5. 정상 시뮬레이션/파형과 공통 Terminal/Output을 회귀 확인한다. 사용자 직접 사용 후 요청이 있을 때 새 Setup을 준비한다. 기존 Setup/ZIP은 이번 소스의 근거가 아니다.
