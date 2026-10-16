# Pulse 편집 중 의미 표시·추천 연속성 (2026-10-16)

> 후속: [새 위치 프로젝트 모듈 이름 추천](pulse-module-catalog-completion.md)을 추가했다. 아래의 같은 query 위치 cache/포트 보존만으로는 새 줄의 첫 module 추천이 해결되지 않았으며 actual FAIL 재현 후 별도 이름 catalogue로 보완했다. 최신 실행본과 전체 회귀는 후속 문서를 기준으로 한다.

## 문제와 근거

사용자는 `counter u_counter (...)`의 연결 목록에서 `.` 입력 시 모듈 이름이 흰색으로 바뀌었다가 초록색으로 복귀하며 그때 추천이 나타난다고 보고했다. 언어 server는 source edit마다 authoritative analysis/project를 비우고, 분석 예약/진행 중에는 빈 semantic tokens와 빈 incomplete completion을 반환했다. 직전 자동 popup 재연결 보완은 이 공백 자체를 제거하지 않았다. worker는 살아 있었으므로 프로세스 재시작이나 slang/Code-OSS의 필수 제약으로 설명하지 않는다.

## 공식 IDE 구현 조사와 선택

2026-10-16 공식 문서 확인:

- [VS Code semantic highlighting](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide): 단일 파일 TextMate 기본 색상에 프로젝트 의미 token을 추가하는 층을 둔다. 기본 문법과 정밀 의미 분석이 같은 응답 시점일 필요는 없다.
- [clangd 요청 처리](https://clangd.llvm.org/design/threads): 쓰기 작업을 debounce/coalesce한다. completion은 별도 parse 경로이며 최신 preamble을 기다리지 않고 즉시 사용 가능한 것을 활용한다. 이것은 오래된 AST의 모든 결과를 그대로 현재 결과로 돌려준다는 뜻이 아니다.
- [clangd index](https://clangd.llvm.org/design/indexing): 열린 파일의 dynamic index와 background index를 합쳐 사용하며, 본문과 preamble 정보를 별도 갱신한다.
- [rust-analyzer architecture](https://rust-analyzer.github.io/book/contributing/architecture.html): 작은 입력 변화에 대한 lazy/incremental 계산, 본문 편집이 다른 함수의 전역 정보를 무효화하지 않는 경계, revision/cancellation을 설명한다.

이 사례들은 모든 IDE가 같은 엔진을 쓴다는 증거가 아니다. Pulse에 적용한 판단은 **정밀 최신 모델과 빠른 표시/추천 자료를 분리하고, 편집 영향 범위가 확인되는 자료만 유지**하는 것이다. clang의 preamble이나 rust-analyzer의 Salsa를 slang에 이미 구현했다고 주장하지 않는다.

| 후보 | 판단 |
| --- | --- |
| 분석 대기 시간만 줄이기 | 공백의 원인은 남고 잦은 재분석으로 CPU 비용 증가. 기존 예약 정책 유지 |
| 이전 전체 compiler 모델을 모든 기능에 계속 사용 | scope/offset/parameter 오류와 native 모델 이중 보존 위험. 채택하지 않음 |
| 가벼운 표시 snapshot·검증된 후보를 보존하고 최신 모델로 교체 | 이번 구현. compiler 정확성 경로와 분리 |
| compiler 내부 부분 parse/elaboration | 장기 병목 과제. 현재 slang worker rebuild와 구분하며 이번 구현 범위 아님 |

## 구현 계약

`ide/language/src/semantic-continuity.ts`는 editor API가 없는 표시 계층이다. latest generation 분석이 게시될 때 열린 파일의 module token 범위와 instance 포트 signature를 저장한다. compiler/native 객체·진단·Project·다른 파일의 본문은 보관하지 않는다.

- 문서 편집의 공통 prefix/suffix로 UTF-16 위치를 매핑한다. 수정하지 않은 module token은 현재 문자열·기본 선언/인스턴스 문맥을 확인해 유지한다. 주석/문자열로 가려지거나 이름/선언이 바뀐 token은 제외한다.
- 기존 instance의 연결 목록 안을 편집할 때는 elaborated 포트 signature를 재사용한다. 현재 코드의 중첩·이미 연결한 포트·식별자 범위·닫힌 괄호를 다시 검사한다. header/parameter/다른 선언을 변경하면 이전 signature를 버린다.
- 정밀 조회에서 받은 후보는 같은 qualifier·같은 위치에서 **요청 식별자 밖의 본문이 완전히 같을 때만** 재사용한다. prefix 추가/삭제/변경은 로컬 필터가 담당한다. 다른 package/scope/declaration 변경으로 목록을 넘겨쓰지 않는다. 저장 metadata는 이름/kind/삽입 여부뿐이며 이전 location/타입/호출 정보를 쓰지 않는다.
- 추천 재사용 결과는 `isIncomplete:true`다. 새 분석 완료 후 기존 사용자 의도 검사에 따라 최신 목록으로 갱신한다. Esc/포커스 이동 보호는 기존대로다.
- 다른 입력 파일 편집, directive/macro 변경, 파일/설정 watch·root 변경/종료, 분석 실패에서는 보존 정보를 보수적으로 제거한다. 기존 `timescale` 줄이 있다는 이유만으로 일반 연결 편집의 snapshot을 지우지는 않는다.
- hover·소스 이동·진단·signature help·compiler 조회에는 이전 snapshot을 제공하지 않는다. 최신 generation/version 확인과 stale 분석 게시 차단을 유지한다. passive 조회가 분석을 앞당기거나 기다리는 경로로 되돌리지 않는다.

보존 한도: 최대2개 root, root별16개 문서/합계8MiB 계산 예산, 문서1Mi UTF-16 code unit. 후보 snapshot은 문서128Ki code unit 이하·최대4개 위치·pool 2,000개/serialized256Ki char 이하이며 위 총량 예산에도 포함된다. JS 객체 실제 heap/RSS의 강제 상한이라는 뜻은 아니다. eviction은 표시 재사용을 포기하며 compiler 정확성은 바꾸지 않는다. 디스크 cache/polling/timer·추가 worker를 만들지 않는다.

## 검증과 현재 상태

실제 slang/LSP에서 변경 후 rebuild를 gate로 막고 module 색상·미연결 포트 추천이 유지되는지, 최신 ready 알림/hover에는 이전 정보를 쓰지 않는지 확인한다. 같은 위치의 package 후보 재사용과 다른 qualifier 거절도 검사한다. 단위 검증은 위치 이동·directive·외부 입력·잘못된 header·닫힌 목록·문서 한도·다음 모델 교체를 다룬다.

- 전체421건:420 PASS/0 FAIL/1 POSIX SKIP,254.2초. 마지막 경계/한글·surrogate pair 보강 후 관련40건40 PASS,51.9초. 겹치는 검사는 합산하지 않는다. language TypeScript build exit0·전체 diff check PASS. runtime/native TypeScript source는 이번에 변경하지 않았다.
- 실제 compiler/LSP gate에서 module token3개와 미연결 포트2개를 dirty/pending 모두 유지했다. 미완성 bare dot의 새 모델 게시 후에도 tokens/포트가 일치했다. 같은 qualifier 후보 유지/다른 qualifier 거절·watch의 즉시 snapshot 폐기·정밀 hover에 이전 모델 미사용·종료 후 실제 프로세스/파일 cleanup도 PASS했다.
- 작은 Windows gate fixture의 dirty 추천3.2609ms/진행 중 rebuild 추천1.3343ms. 이것은 실제 editor UI나 수백 파일 설계의 성능 측정이 아니다. 기존 전체 회귀의200-file 시험도 이 사용자 시나리오의 물리 체감 수치로 대체하지 않는다.
- 초기 단위1 FAIL은 bare dot 뒤 offset을 한 글자 지나친 fixture였다. 현재 UTF-16 offset으로 고쳐5개 단위/전체/최종 관련 검사를 통과했다. 제품의 불변식/경로 검증을 약화하지 않았다.
- 공식 desktop25 bundle·후처리 JS17 syntax 검사·2,564파일 inventory·native integrity10개·headless native 버전과 RTL CLI 두 top 인식 PASS. native bundle 진행 중 마지막 언어 경계 보완이 있어 **선택 전 전용 새 후보에 최종 language bundle을 다시 반영**하고 code identity/전체 inventory·CLI 검증을 재실행했다. 최종 server bundle이 현재 준비된 소스 bundle과 hash가 같은 것도 확인했다. 공식 `scripts/prepare-local-bundle.mjs` 전체 경로로 현재 소스를 재현할 수 있다.

최신 실행은 [Start-Pulse.cmd](../ide/Start-Pulse.cmd)다. 기존 Pulse 창을 정상 종료한 뒤 실행한다. `.dev/latest-launch.json`은 v3/bundled의 `ide/.dev/pulse-bundled-OvKa60/Pulse.exe`를 가리킨다. 최종 code identity는 `d1f811ffeac39650a2cb75262a14a3647b2d76856a46d498953ec36b1f7d3659`이며14개 자산 검사/launcher prepare35.5ms·check260.2ms PASS. 이 시간은 앱 UI 준비 시간이 아니다. 기존 설치판/Setup/ZIP은 이번 코드 이전 버전이다.

원시 근거: `ide/.dev/windows-integrated/pulse-continuity-{initial,all-tests,final-tests,bundle,language-refresh,final-bundle-verify}.log`, `pulse-continuity-measurement.json`, 최종 후보 `.pulse-build.json`. 처음 bundle도 자체 통과했지만 최종 language 갱신 후의 receipt/code identity가 기준이다. 이 로컬 개발 실행본은 설치/배포 패키지가 아니다.

**Computer Use/visible 앱 검증은 실행하지 않았으며 별도 사용자 승인 전에는 시작하지 않는다.** 기존 창·프로필·신뢰·Setup/ZIP은 보존했다. 실제 화면의 무깜빡임과 자동 popup 수용은 사용자 직접 체험 대상이다.

## 남은 한계와 다음 순서

아직 조회한 적 없는 package 멤버/새 scope/새 instance에 대한 첫 정밀 정보는 분석이 필요하다. 임의의 여러 구간 편집은 보수적으로 재사용을 포기할 수 있다. 이 기능은 의미 분석 전체 증분화가 아니며 일반 변수/타입을 새로 컴파일한 것처럼 즉시 확정하지 않는다. native 컴파일 단계/첫 AST 준비·대표 설계의 실제 Windows UI 반응 측정·save watcher 중복은 기존 잔여다.

다음은 최신 로컬 실행본으로 사용자 직접 타이핑 체험, 필요 시 승인된 마지막 통합 화면 검증이다. 확인 전 전 구간 무깜빡임/화면 수용/배포 완료로 표시하지 않는다.
