# H3H — 독립 IDE 내장 RTL 편집 (2026-10-10)

## 이식 방식과 범위

VSIX에서 검증된 코드 중 필요한 부분을 MIT 출처/라이선스와 함께 `ide/`로 복사했다. VSIX를 설치하거나 그 코드를 링크하지 않는다. 이후 빌드와 실행은 IDE 소유 코드만 사용한다. 제품 내장 기능을 Code-OSS의 built-in extension host로 연결하며, 외부 확장 설치 금지 정책은 유지한다. Core/시뮬레이션과 언어 분석의 경계도 유지한다.

- `ide/language/src`: editor-independent lexer, 블록 Enter, 명시적 템플릿, 예약어/기본 시스템 함수·directive 추천, closing-label 계획. 작은 editor adapter가 native snippet/command/completion/code-action API에 연결한다.
- `ide/language/package.json`: `.v`/`.vh` Verilog, `.sv`/`.svh` SystemVerilog 등록. TextMate grammar·언어 설정·파일 종류 아이콘·편집 설정·두 keybinding만 포함한다. 미연결 semantic 설정은 노출하지 않는다.
- `ide/config/source-overlay.json`: metadata/grammar/icon/LICENSE를 `ide/upstream/extensions/rtl-language/`에 guarded 배치. `scripts/prepare-language.mjs`가 IDE 소유 CommonJS bundle을 만들며 foreign target/부모 범위 배치를 거절한다. 개발 build/start/native verifier에 연결했다. `prepare-runtime` 자체는 언어 adapter와 분리한다.
- `language/PORTING.md`와 LICENSE에 이식 출처를 기록한다. source/build input에 sibling dependency가 없다. 사용자 프로젝트에 파일을 추가하지 않는다.

## 사용

RTL 파일을 열면 언어 인식·문법 색상이 적용되고 기본 자동완성을 사용할 수 있다. `module`에서 Tab하면 이름 → 포트 → 본문으로 이동한다. `package`, `case`, `begin`, `always`, `always_ff`, `always_comb`, `always_latch` 등은 명시적 템플릿으로 확장한다. 요청한 procedural 템플릿은 event 자리와 본문을 제공하고 begin/end를 포함한다. `begin`은 처음부터 여러 줄이다. 사용자가 if/for/always 코드를 직접 작성한 경우 블록을 강제로 추가하지 않는다.

Enter는 begin/case 뒤에 필요한 닫는 구문과 사용자 들여쓰기를 처리하고 기존 end/endcase를 존중한다. 주석/문자열/전처리·기존 코드가 안전한 확장을 허용하지 않으면 일반 편집 동작으로 돌아간다. snippet field 이동, Tab focus, 여러 커서, 읽기 전용, 제안 UI 조건을 보존한다. `rtl.editor.templates`, `autoCloseBlocks`, `basicCompletions`를 끌 수 있다. 설치나 workspace trust 승인이 필요 없다.

이것은 **lexical 편집**이다. 프로젝트 module 추천·해당 module의 미연결 포트·package/함수/block 스코프 신호·사용자 정의 module 의미 색상·slang 진단은 아직 독립 앱에 이식하지 않았다. 기본 예약어 추천과 의미 분석을 혼동하지 않는다. TOML은 RTL 언어로 등록하지 않는다.

## 검증과 실제 근거

- 최종 전체 **70 PASS / 0 FAIL / 0 SKIP**. 기존54 + 복사한 lexical 회귀13 + grammar1 + guarded 배포1 + keybinding/metadata1. runtime 및 언어 TypeScript 검사 통과. `ide/.dev/h3h-tests-final.log/exit`.
- 실제 TextMate/Oniguruma engine으로 양쪽 grammar의 type/keyword/comment/string/directive scope를 검증했다. 최초 시험은 module을 keyword scope로 기대해 실패했으나 실제 grammar는 `storage.type`이 맞아 기대값을 수정했다. 제품 grammar는 변경하지 않았다. 최초 `h3h-language-tests.log/exit` 보존.
- 실제 개발 앱 native **gj9pRi 4항목 PASS / exit0**: built-in 발견/activation 및 한글·공백 경로 RTL 네 확장자 인식, module name/port/body 실제 snippet field 이동, package/case/procedural/begin 템플릿과 기존 end Enter 재사용, 실제 completion provider의 initial/$monitor/`timescale 및 comment/string/member 영역 배제. `trusted:false`; 도구 설치/신뢰 설정/자동 저장 없음. `h3h-native.log/exit`, `editor-acceptance-gj9pRi/receipt.json`.
- 기존 파형 native **ez5zG3 4항목 PASS / exit0**: 실행 이력2개·저장 입력 비교·기본 bus+8bit9행/정렬·Code 왕복/동일run 재사용·미저장→저장 stale·기존 파형/default 보존. synthetic fixture이며 이번에 실제 Verilator 새 GUI 실행을 했다는 의미는 아니다. `h3h-waveform-regression.log/exit`, 해당 receipt.
- 문법 색상 scope 시험과 실제 API 커서/완성 동작 수용은 완료했다. 이번에 물리 키보드 Tab/Enter와 눈으로 보는 테마 색상 수용은 하지 않았다. native 시험은 명령을 직접 실행하며 keybinding 조건은 자동 검사한다. 대규모 문서/이벤트 비용과 다양한 설정 조합은 추가 수용이다.

공식 overlay emission/전체 upstream 타입 검사도 **0 errors / exit0**로 완료했다 (`ide/.dev/h3h-build.log/exit`). 별도 release VSIX/앱 패키징·설치는 없다.

## 다음 작업

H3I에서 기존 semantic provider/LSP와 module·port·scope completion/diagnostics를 IDE 소유로 이식한다. 사용자 module 추천은 프로젝트 범위, signal은 접근 가능한 scope, 외부 instance의 포트 추천은 대상 module 범위라는 합의를 유지한다. RTL/header만 분석하고 TOML 진단 경계를 확인한다. tool discovery와 명시적 설치 승인 UI는 이어 연결한다.

H3/H4 전체·독립 앱 베타 완료가 아니다. FST 내장/enum·history 정리·파형 잔여 물리 수용·H5 discovery/폴더 역할/multi-top·H6 자동 dump/미저장 snapshot·H7 규모/재시작, 기존 Windows/host/layout 열린 gate를 유지한다. Diagram과 자체 compiler/simulator는 이번 첫 앱 범위에 추가하지 않는다.
