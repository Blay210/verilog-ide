# H6B1 — 미저장 입력 실행 Core 계약 (2026-10-12)

독립 IDE 소유 Core/SimulationService에 편집 내용 snapshot 실행을 구현했다. GUI 버튼은 아직 이 요청을 보내지 않으며 현재 앱/CLI 기본 실행은 저장된 파일을 사용한다. 다음 H6B2에서 GUI buffer 수집·IPC·결과 표시를 연결한다. 이 문서는 H6 전체 완료나 사용자 Run 버튼의 미저장 실행 완료를 뜻하지 않는다.

## 계약과 구현

`SimulationRequest.inputOverrides`와 `RunContext.inputOverrides`는 `{path, text, version?}` 배열이다. path는 프로젝트 안의 기존 일반 `.v/.sv/.vh/.svh` 파일의 절대 경로, text는 실행 요청 당시 편집기 내용(UTF-8로 기록), version은 선택적 안전한 비음수 document version이다. 새 untitled 파일/미저장 TOML/프로젝트 밖 source/동적 include는 지원하지 않는다.

`core/input-overrides.ts`에서 첫 await 전에 배열과 각 항목을 복사·동결한다. 최대10000파일, 파일32MiB/합계128MiB, 중복 경로·잘못된 형식/버전을 거절한다. 실행 중 원래 요청 객체나 편집 내용을 변경해도 선택/전체 실행의 다음 테스트는 동일한 요청 내용을 사용한다. 직접 Core runTest/runTests 경로도 동결한다.

`snapshot.ts`는 모든 override의 기존 경로와 상위 symlink/junction·프로젝트/생성물 경계를 확인한다. Windows 생성물 폴더 대소문자 및 alternate stream 경계도 거절한다. `captureInputs`는 파일 membership와 include-directory 검색을 유지하고 관련 파일 bytes만 교체한다. 편집된 include가 새 literal header를 참조하면 그 실제 header를 추가 포착한다. 다른 테스트/미등록 파일의 열린 buffer는 해당 테스트에서 사용하지 않으면 빌드·보관·provenance에 들어가지 않는다. override가 source를 자동 등록하거나 TOML을 수정하지 않는다.

snapshot 검증과 copied package 분석은 바뀐 bytes에서 수행한다. 미저장 요청에서는 원본 package 분석으로 먼저 거절하지 않는다. 복사본 만들기 실패/비지원 backend에서는 디스크 입력 fallback 없이 FAIL이며, 잘못된 미저장 RTL도 그대로 보관해 compiler 오류를 확인할 수 있다. 일반 디스크 실행의 기존 fallback 계약은 유지한다. 현재 SimulationService의 auto package-order 미지원은 별도 기존 제한이며 production 검증은 manifest 순서를 사용했다.

`input-snapshot.json`의 선택적 `overrides`는 실제 사용한 path·content hash·document version을, result/history의 `inputSnapshot.unsavedFiles`는 사용한 경로를 기록한다. loader는 provenance hash/path와 identity/result의 일치·중복·기록 bytes를 검증한다. 과거 version1 디스크 snapshot도 계속 읽는다. content fingerprint는 편집기 version 대신 실제 bytes/settings로 결정해 동일 입력의 CLI/GUI 비교 의미를 보존한다. version은 기록 metadata이지 외부 서명/진위 보증이 아니다.

저장된 파일과의 기존 stale 비교는 미저장 run에 사용한 내용이 디스크와 다르면 `changed`를 반환한다. 현재 editor buffer와의 비교 및 '미저장 입력으로 실행' 사용자 표시는 H6B2에서 연결해야 한다. 취소·trace identity·snapshot 내 소스 읽기는 기존 공통 계층을 사용한다.

## 검증과 발견한 결함

- `tests/editor-inputs.test.mjs`: 첫 await 전 동결/순차 테스트, 원본 불변/과거 retained source/history, provenance 변조 거절, 바뀐 header/include, 미등록 source 무컴파일, 실패 시 no fallback·비지원 backend, payload bounds, junction/대소문자 생성물 보호. 최종 관련5 PASS.
- `scripts/verify-editor-inputs.mjs`: `.dev/h6b1-real-한글 공백-anVsP6/.rtl/acceptance.json`, `.dev/h6b1-real.log/.exit0`. 실제 Verilator5.050로 저장된 VALUE1 baseline→미저장 package/header/TB 두 top VALUE2→invalid TB compile FAIL→디스크 VALUE1 복귀, 총5회 실행/3묶음 PASS. VCD의 실제 8bit 값2·document versions·한글/공백/대괄호 오류 원래 경로·원본5파일 bytes·이전 trace·history5·`.rtl/` 격리 확인. package/header/TB를 주입하며 DUT 자체 변경은 자동 관련 테스트에서 확인한다.
- 최초 전체140 중139 PASS/1 FAIL은 `project-management` 변경 안내의 기존 경쟁 조건이었다. 실행 완료 후 자동 검사와 명시적 refresh가 겹치면 진행 중 검사의 오래된 inventory를 그대로 돌려줬다. 단독4 PASS로 timing 차이를 확인한 뒤 `host.ts`에서 겹친 요청을 하나의 후속 검사로 모으고 종료 대기도 연결했다. 결정적 gate 테스트를 추가해 검사 후 파일 변경/두 refresh의 최신 안내 수용을 확인했다. `.dev/h6b1-tests.log/.exit1` 보존.
- 최종 전체142 PASS/0 FAIL/0 SKIP·runtime/language build는 `.dev/h6b1-complete-tests.log/.exit0`. 중간141 PASS는 `.dev/h6b1-final-tests.log/.exit0`, 추가 경계5 PASS는 `.dev/h6b1-boundary.log/.exit0`에 보존했다. browser overlay/Code-OSS 코드는 변경하지 않아 전체 upstream 타입/emission은 반복하지 않았다. native GUI는 이 단계에서 검증하지 않았다.

## 다음 H6B2 인수인계

1. Run 명령을 받는 시점에 프로젝트의 기존 관련 dirty RTL/header 문서 `{path,text,version}`를 동기 수집한다. editor encoding과 UTF-8 정책, untitled/deleted/foreign 파일 안내를 명확히 한다. TOML은 기존 dirty 보호를 유지한다. 원본 저장/dirty 상태 변경은 하지 않는다.
2. Code-OSS browser adapter→Simulation channel IPC→host.start→SimulationService에 한 번 캡처한 요청을 전달한다. IPC 타입/크기/경로 검증을 유지하고 두 프로젝트 간 연결을 만들지 않는다. 전체/선택/파일 행 Run 모두 같은 경로를 사용한다.
3. 결과/이력에 사용한 미저장 입력을 구분하고 saved 및 현재 buffer 비교를 혼동하지 않는다. 실제 run snapshot의 source 읽기와 과거 파형을 보존한다. 실행 중 이후 buffer 변화는 실행 입력을 바꾸지 않는다.
4. 실제 trusted 앱에서 미저장 RTL/package/header 실행·잘못된 편집 FAIL/원본 복구·Code/Simulation 왕복·이전 파형·전체/선택·취소 수용을 한다. closed/trusted fixture는 `ide/.dev/import-ui-dbJf2o`, history15/기존 승인 trust 유지, 다른 사용자 창 보존. 자동 trust/프로필 공유 금지.

H6B2 후 H6 잔여 범위 판정→H7 종료·복원·중간 규모/물리 UI·clean Windows 및 기존 FST/enum gate를 이어간다. 이번 작업은 배포/설치·자체 엔진·VSIX 변경을 하지 않았다.
