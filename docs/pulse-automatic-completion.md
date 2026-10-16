# Pulse 자동 추천 연결 보완 (2026-10-15)

> 2026-10-16 후속: [편집 의미 표시·추천 연속성](pulse-semantic-continuity.md)을 구현했다. 마지막 표시 snapshot·검증된 포트·동일 식별자 후보 재사용과 최신 정확성 모델을 분리한다. 아래 ‘원인 확인만/미보완’은 후속 구현 전 진단이다. 실제 화면 수용·compiler 부분 증분은 아직 별개다.

## 후속 진단: 편집 중 의미 색상·추천의 연속성 — 미보완

사용자는 `counter u_counter (` 안에서 `.`를 입력할 때 module 이름이 흰색으로 돌아갔다가 초록색으로 복귀하며 그때 추천이 나타난다고 보고했다. 현재 코드에서 이 현상을 설명하는 경로를 확인했다. `language/src/server.ts`의 source edit `schedule()`은 매번 `invalidate()`로 `state.analysis/project`를 즉시 비운다. interactive `snapshot()`은 debounce·pending·queued 동안 결과를 제공하지 않는다. semantic tokens handler는 그 경우 **빈 token 목록**, completion handler는 빈 incomplete 목록을 반환한다. 분석 완료 후 모델 게시·semantic token refresh·analysisReady 추천 갱신이 이뤄진다. 따라서 compiler process 자체를 끄는 것은 아니지만, 편집 중 기존 의미 표시와 정밀 추천이 끊기는 정책이 남아 있다. 사용자의 실제 화면을 새로 열어 확인한 결과는 아니며 소스 경로 진단이다.

직전 보완은 빈 첫 결과 뒤 자동 popup 재연결·package 누락·후보 로컬 필터를 해결했다. **마지막 정상 의미 표시/추천 snapshot 유지까지 구현한 것은 아니다.** slang/Code-OSS의 필수 제약으로 설명하지 않는다.

다음 우선 작업은 최신 분석의 정확성과 표시 연속성을 분리하는 것이다. 마지막 정상 결과의 가벼운 표시/심볼 snapshot을 유지하고, 문서 편집에 맞춰 위치를 매핑하며 변경 범위·scope가 불확실하면 해당 정보만 보수적으로 제외한다. 안전한 module/package/port signature와 후보는 background 모델 교체 동안 사용할 수 있도록 별도 경계를 설계한다. 기존 offsets나 타입·진단을 검증 없이 현재 정밀 결과로 재사용해서는 안 된다. 새 결과는 최신 version/generation일 때 원자적으로 교체하며 설정·root·외부 입력 변경 시 보존 범위를 별도로 검증한다. 두 전체 native compiler 모델 동시 보존이나 compiler 부분 증분 구현과는 다르다.

현재 턴은 원인 확인·계획 기록만 수행했다. 코드/실행본 변경·새 테스트/화면 검증은 없으며, 이 연속성 문제는 아직 해결 완료가 아니다.

사용자 보고: module 내 wire/reg/logic·input/output·외부 module과 package 추천이 늦거나 Ctrl+Space가 필요하다. 특히 `package::` 뒤 목록이 자동으로 열리지 않는다. 화면을 열지 않고 실제 소스·compiler·LSP·native command 경계를 확인했다.

## 확인한 원인과 변경

1. dirty 문서는 빠른 기본 추천만 반환하고 정밀 조회는 분석 완료 후 제공한다. 그런데 기존 `analysisReady` 처리가 **이미 열린 suggest widget**만 갱신했다. 첫 조회가 빈 목록이면 widget이 자동으로 닫혀, 새 결과가 준비돼도 사용자가 Ctrl+Space를 눌러야 했다.
2. Code-OSS `snippetsPreventQuickSuggestions` 기본값은 snippet 입력 중 quick suggest를 막는다. 모듈 인스턴스와 포트 입력도 snippet을 쓰므로 영향을 받는다. RTL 언어 기본값에 일반 code quick suggestion·trigger character를 켜고 이 차단을 끈다. comment/string 자동 추천은 끈 채로 유지한다. 사용자 명시적 언어 설정을 강제로 덮어쓰지 않는다.
3. slang의 일반 `scope.lookupName('package_name')` 결과만으로는 import하지 않은 package 이름이 나오지 않았다. 실제 compiler fixture에서 누락을 재현했다. 같은 compilation의 실제 project package를 별도 열거해 이름 후보에 넣는다. `std`, 비입력/타 프로젝트 source는 포함하지 않으며 `pkg::`는 실제 compiler qualified lookup으로 멤버를 확인한다.
4. LSP가 접두사에 맞는 후보만 미리 잘라 반환했다. 이제 전체 유효 scope/qualified package/미연결 포트 pool을 편집기에 전달해 추가 입력은 native editor가 로컬에서 필터링한다. 이미 연결한 포트 제외·문서 범위·snippet 삽입·compiler visibility/parameter context 합의는 유지한다. Core `portCompletions` 기본 prefix 필터는 기존 계약 그대로이고 LSP만 full pool을 요청한다.

## 늦은 추천창의 사용자 의도 보호

실제 completion middleware가 compiler 조회 전에 native `prepareCompletion`을 호출한다. 이때 현재 Code editor·file/version/caret·빈 selection을 묶은 intent를 한 개만 기록한다. native SuggestController가 Auto/Manual 요청 중인 것을 확인한 뒤 arm한다. 처음 응답이 비어서 widget이 닫힌 경우에만 이 기록이 새 결과를 자동 표시할 수 있게 한다.

Esc·Enter/Tab·mouse·focus loss·cursor/model/content 변화는 intent를 영구 무효화한다. Code/Simulation 전환과 editor 변경도 현재 active editor 검사를 통과할 수 없다. 빈 결과 뒤 자동 표시를 허용하는 기록은10초 이내이며, 시간이 지난 후 unrelated file 분석 때문에 갑자기 popup을 열 수 없다. 이미 보이는 목록의 갱신은 이 유효시간과 구분한다. 동적 import 전후에 다시 검사하며, Esc가 native arm 명령보다 먼저 도착하면 Idle controller이므로 arm하지 않는다. 이전 client/문서 version/generation 결과는 기존 gate대로 거부한다. 단일 listener 묶음을 다음 요청/종료 때 해제하며 반복 timer·백그라운드 polling을 추가하지 않는다.

## 검증과 남은 범위

import하지 않은 package 이름 누락이 실제 compiler에서 FAIL한 뒤 수정 후 PASS했다. 실제 LSP로 `:`·`.` trigger, package 멤버 전체 pool, prefix가 늘어나도 같은 pool, 사용한 포트 제외 및 **미완성 bare dot** 포트 연결을 확인했다.

- 전체413건:412 PASS / 0 FAIL / 1 POSIX SKIP,222.5초(test concurrency2). 이후 intent 유효시간 보완 관련15건15 PASS를 추가 확인했다. 겹치는 검사는 합산하지 않는다.
- runtime/language build exit0·최종 전체 native 타입/owned emission0 errors. native/controller·언어 client/lifecycle·시작/복원 관련34 PASS도 별도 확인했다.
- 첫 전체의9 FAIL은 새 native helper를 알지 못한 복원 fixture8건과, arrow callback factory의 `this`를 잘못 바인딩한 새 검증1건이었다. 실제 helper를 fixture에 연결하고 factory binding을 수정한 후 위 전체를 다시 실행해0 FAIL을 확인했다. 테스트만 삭제하거나 제품 gate를 완화하지 않았다.
- 첫 native 타입 검사에서 타입 import 경로 오류를 발견해 pinned `editorBrowser`의 실제 interface로 수정했다. 최종 검사는0 errors다. CLI fixture의 Windows sandbox realpath EPERM은 보호 코드를 바꾸지 않고 해당 소유 fixture 검증만 승인된 범위에서 다시 실행한다.
- 최종 local built 앱은 `ide/.dev/pulse-bundled-qNRQ7N/Pulse.exe`다. 공식25 bundle·JS17 syntax·2,564파일 inventory·10 integrity·headless native 버전/RTL CLI 두 top 인식 PASS.14자산 v3/bundled launcher prepare/check를 마쳤다. `ide/Start-Pulse.cmd`로 기존 Pulse 창을 정상 종료한 뒤 실행한다. 이전 설치판/Setup/ZIP 및 사용자 창·신뢰·프로필을 변경하지 않았다. 이전 중간 앱은 최신 선택 대상으로 사용하지 않는다. 최종 준비 근거는 `pulse-auto-completion-bundle-verify.log`·`pulse-auto-completion-launch.log`와 후보 `.pulse-build.json`이다.

**화면 검증은 실행하지 않는다.** 새 editor에서 실제 타이핑 후 popup 표시와 선택 위치는 사용자 직접 체험 대상으로 남긴다. slang을 제거하거나 compiler를 새로 만들지 않았다. 최초/변경 직후 정밀 모델 준비 시간·부분 parse/elaboration·저장 watcher 중복은 기존 한계다. 기본 lexical 추천과 정밀 의미 추천을 혼동하지 않는다. 분석 완료를 기다리느라 매 글자 전체 분석을 앞당기는 방식으로 되돌리지 않았다.

원시 근거: `ide/.dev/windows-integrated/pulse-auto-{package-initial,package-final,trigger-lsp-tests,completion-adapter-tests,completion-types,completion-all-tests,completion-bundle}.log`. 빌드/테스트 fixture는 사용자 source·신뢰·프로필을 변경하지 않는다. 기존 Setup/ZIP과 열려 있는 앱은 보존하고, 확인된 새 로컬 앱을 `ide/Start-Pulse.cmd`로 선택한다.
