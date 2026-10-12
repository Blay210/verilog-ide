# H3I — 독립 IDE 의미 분석·추천·진단 (2026-10-10)

## 구현과 소유권

VSIX의 MIT semantic provider/query/model/Python bridge와 LSP server를 IDE 소유 코드로 복사했다. `ide/runtime/semantic/`, `ide/language/python/analyze.py`, `language/src/server.ts`에서 독립 관리한다. 이전 구조/내부 연산 provider 메서드도 bridge의 일부로 보존했지만 첫 앱에 Diagram UI를 활성화하지 않았다. 라이선스와 PORTING 출처를 유지한다. sibling source/import/빌드 입력은 없다.

`language/src/semantic.ts`는 얇은 product built-in adapter다. 문서 selector는 file-scheme Verilog/SystemVerilog만 사용한다. LanguageClient/LanguageServer 9.0.1·TextDocument 1.0.12를 ide의 package/lockfile에 추가했다. provider와 Core는 VS Code API를 사용하지 않는다. simulator와 semantic compiler는 별도다. `prepare-language`는 client/server bundle과 guarded metadata/Python resource를 배치한다. 기존 runtime bundle은 언어 host에 의존하지 않는다.

공유 도구 저장소의 기존 Python/slang 11.0.0을 실제 작은 module/port 컴파일로 검증하고 재사용한다. 도구/semantic cache는 사용자 프로젝트 밖이다. Python -I/-B·timeout/abort와 Core의 프로세스 정리 경계를 유지한다. 자동 설치·시스템 PATH 변경은 없다. 새 도구가 없으면 **Tools missing**, 검증 실패는 **Tools invalid**로 안내한다. 설치 승인 UI는 다음 단계다.

## 동작

- 프로젝트 module 이름 추천, instance의 미연결 포트 추천, parameter/port/function/task 인자 안내, hover/definition 이동과 사용자 module semantic 색상 제공.
- signal은 compiler가 판단한 접근 가능한 module/function/block scope와 선언 순서·shadowing·import/export를 따른다. 다른 module 지역 신호를 전역으로 추천하지 않는다. package namespace와 미저장 package/local 변경을 처리한다. 기본 예약어·시스템 함수 추천은 H3H와 별도로 유지한다.
- 250ms debounce·generation/version·abort로 이전 분석 결과를 버리고 미저장 file document overlay를 compiler에 전달한다. 소스·manifest를 자동 저장하지 않는다.
- source diagnostic은 `.v/.sv/.vh/.svh`에만 게시한다. TOML은 RTL overlay/completion/semantic token 대상에서 제외한다. manifest 변경은 프로젝트 설정을 다시 읽는 이벤트이며, 잘못된 설정은 **Analysis failed** 상태/언어 로그로 안내하고 TOML에 RTL 오류를 게시하지 않는다.
- 신뢰하지 않는 프로젝트에서는 외부 semantic compiler를 실행하지 않는다. lexical editing은 계속 사용할 수 있다. `rtl.editor.semantic`으로 끄고, **RTL: Retry Analysis**와 **RTL: Language Status**/RTL 상태 표시에서 상태·로그·설정을 확인한다. 아직 구현하지 않은 setup/toolchain 명령을 상태 메뉴에 넣지 않았다.

## 검증

최종 **81 PASS / 0 FAIL / 0 SKIP**, runtime와 language 타입/build 통과. `ide/.dev/h3i-tests-complete.log/exit`에 보존했다. 이전 parser 보완 전80 PASS 기록도 유지한다.

- 실제 slang provider 회귀8 + 실제 stdio LSP 종단1 **9 PASS/0 SKIP**, `h3i-semantic-tests.log/exit`. 프로젝트 module/국소 신호, enum alias/미저장 package, package export/모호한 import, lexical 선언 순서/loop 범위, incomplete expression, 함수 기본값/task/package 인자를 확인했다.
- 실제 LSP에서 미저장 instance의 이미 채운 포트 제외·local signal·project module·함수 active parameter·RTL 오류/version·TOML 제외/잘못된 manifest 상태와 원본 bytes 보존을 확인했다. 최종 전체 시험에는 module semantic tokens·definition 이동과 lexer 복사 일치/입력 glob 경계도 추가했다.
- native **NpphBV 5항목 PASS/exit0**, 신뢰되지 않은 실제 앱의 semantic **Trust required**와 lexical 기능 유지, 네 확장자·한글/공백 파일, snippet field/기본 completion을 확인했다. 앱에서 실제 compiler를 실행한 trusted GUI 수용으로 해석하지 않는다.
- 최종 의존성/guard bundle의 native **lEPFsB 5항목 PASS/exit0**도 확인했다. `h3i-native-final.log/exit`와 `editor-acceptance-lEPFsB/receipt.json`.
- IDE의 existing-tool 실제 컴파일/port probe **PASS/exit0**, `h3i-runtime-probe.log/exit`. Python/slang 새 설치 없음.
- runtime 및 language 타입/build 통과. workbench TS overlay는 이번에 변경하지 않았으며 H3H의 전체 upstream 타입 근거와 구분한다. release 패키징·설치 없음.

ignored 근거는 `ide/.dev/h3i-*`와 native receipt에 보존한다. 준비 중 첫 의존성 명령의 root 위치 오류는 중지했으며 root package/lockfile/node_modules 생성 없음 확인; 실제 추가/lockfile은 ide 안에서만 수행했다. 실행 시험의 FAIL을 숨기거나 tool approval/trust 설정을 바꾸지 않았다.

## 의존성 점검과 보완

추가 의존성 설치 시 npm advisory가 기존 smol-toml/fast-glob 체인에 4 high를 보고했다. 새 LSP 세 패키지는 보고 대상이 아니었다. `h3i-audit.json`에 원본을 보존했다. smol-toml을 수정 버전 **1.9.1**로 올려 malformed TOML·comment/키 처리 취약점을 보완했다. 최종81개 Core·언어 회귀로 호환성을 확인했다. 설치 후 registry 경고는 fast-glob 체인의3 high가 남으며 guard 완화와 경고 제거는 구분한다.

braces→micromatch→fast-glob의 stack-exhaustion advisory는 registry에서 fix unavailable이다. Core discover에 **4096자/brace depth16/brace count64** 제한을 넣어 깊은 중첩을 parser 호출 전에 거절하고 일반 `*.{sv,v}` 검색은 유지한다. 이 완화는 모든 glob 비용 공격을 해결했다는 뜻이 아니며 upstream 경고 자체는 남는다. 중간 규모/복잡한 source pattern 성능은 H7에서 수용하고 패치가 나오면 갱신한다. [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

## 남은 범위와 다음 순서

trusted GUI에서 실제 built-in LanguageClient→LSP→slang 추천/진단·저장/공간 왕복을 확인하는 수용은 아직 남는다. native fixture는 새 profile로 untrusted이며 자동 trust 금지다. 미저장 의미 분석은 실제 server/provider 시험으로 검증했으나 물리 추천 popup/색상 가독성 검증과 같지는 않다.

다음 **H3J**는 도구 설치 승인/진행/취소/재시도 UI와 위 semantic GUI 수용이다. 기존 도구 검증/재사용을 우선한다. 기존 설치 승인 범위를 확인하되 새 사용자 프로젝트 trust는 직접 처리한다. manifest discovery/폴더 역할·multi-top은 H5, 자동 dump/미저장 simulation snapshot은 H6이다.

class scope 일부는 의도적으로 추천을 억제한다. arbitrary nested project discovery·header membership status·대규모 분석 비용·진단/완성 취소 stress도 추가 검증이다. slang과 Verilator의 해석 차이는 아직 가능하며 자체 공통 compiler/engine 작업을 시작했다는 의미가 아니다. H3/H4 전체·베타·배포 완료가 아니다. 기존 파형/FST/enum/history/규모/Windows/host/layout gate를 유지한다.
