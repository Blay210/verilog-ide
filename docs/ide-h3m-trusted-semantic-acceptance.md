# H3M — 신뢰된 실제 편집기 의미 분석 수용 (2026-10-11)

## 최종 결과

사용자가 격리된 `ide/.dev/semantic-ui-te972r` 프로젝트를 직접 신뢰한 뒤 실제 일반 개발 host에서 **7항목 PASS/exit0**, `trusted:true`, `diskUnchanged:true`를 확인했다. H3L의 trusted semantic GUI 대기를 이 범위에 한해 해소했다. 신뢰 설정 변경/복사/override·실제 도구 설치·새 패키징 없음.

1. 내장 LanguageClient가 기존 slang 도구로 실제 RTL을 분석한다.
2. 실제 completion provider가 프로젝트 module, 현재 scope의 신호와 미연결 named port를 추천한다. 이미 연결한 포트는 제외하며 미저장 문서를 사용한다.
3. 실제 함수 signature help가 foo/boo 인자를 제공한다.
4. 미저장 unknown signal 오류를 slang 진단으로 표시하고 수정 시 제거한다. 디스크는 원본 그대로다.
5. 실제 definition/hover provider가 module instance에서 RTL 선언을 찾는다.
6. 실제 semantic token provider가 module 선언과 instance type에 class 토큰을 제공한다.
7. Code/Simulation 왕복 시 문서·의미 분석을 유지하고 TOML에는 slang 진단을 게시하지 않는다.

최종 근거: `ide/.dev/h3m-semantic-ui-final.log/.exit`, `semantic-ui-te972r/receipt.json/exit.json/host.log`. attribution/language detection 오류 없음. 첫 5항목 PASS도 `h3m-first-pass-receipt.json/-exit.json`에 보존한다. 단순 모형/서버 직접 호출이 아니라 실제 editor command→내장 adapter→LanguageClient→slang 연결을 확인했다. 마우스로 추천을 선택하거나 테마의 색을 육안 비교하는 물리 수용 전체를 뜻하지 않는다.

## 재현 중 실패와 보완

첫 실행은 격리된 일반 준비 창이 아직 남아 있어 single-instance 충돌로 시작하지 못했다. 실제 창을 재관찰해 열린 문서가 없는 **검증 창만** 닫았고 원래 h3b-preview 창은 보존했다. `h3m-attempt1-host.log/-exit.json`.

두 번째 실행은 사용자 trust와 별개로 `extensionTestsPath` 모드가 upstream `storageMainService.ts`의 `useInMemoryStorage`를 활성화해 저장된 trust를 읽지 않았다. 실제 의미 분석 기능의 실패가 아닌 verifier 설계 오류다. `h3m-attempt2-host.log/-receipt.json`에 trusted:false 실패를 보존했다. 권한을 우회하거나 trust 정보를 주입하지 않았다.

`verify-semantic-ui.mjs`를 일반 `extensionDevelopmentPath` host로 바꾸고 자체 검증 extension의 onStartupFinished에서 native 절차를 실행한다. 기존 세션에 주입하지 않으며 fixture 전용 profile/shared/extensions를 사용한다. 검증 후 자체 문서만 revert하여 미저장 확인 창이 남지 않도록 하고 검증 앱을 정상 종료한다. `open <fixture>`는 test 주입 없이 일반 창을 다시 열 수 있다. 준비·신뢰는 사람이 처리한다. 두 script Node syntax 검사가 통과했다.

## 재개와 남은 범위

ide 폴더에서 `node scripts/verify-semantic-ui.mjs verify .dev/semantic-ui-te972r`로 재현한다. 해당 격리 창이 실행 중이면 먼저 그 창만 종료하고 실행한다. fixture를 새로 만들 때는 prepare→사용자 직접 trust→검증 순서를 따른다.

제품 TS 코드는 변경하지 않았으며 이번 변경은 개발 verifier/native 절차다. H3K의91개 자동 테스트·타입 검사는 이전 근거이며 이번에 전부 반복하지 않았다. H3J 전체 upstream 타입 검사 역시 이전 근거다. 최종 native 검증은 위7항목이며 최초5항목 결과에 추가2항목을 확장했다.

**H3/H4 전체·초기 베타 완료는 아니다.** 실제 설치 승인/다운로드/pacman·clean Windows, FST/enum/package 순서 simulation 연결, 이력 정리/물리 waveform/layout/규모·복원·host 지연/audit gate는 남는다. 기존 clean Windows 별도 환경이 없다는 답변도 유지한다.

다음 독립 실행 작업은 **H5A 읽기 전용 소스 탐색·분류 Core 기반**이다. source/package/testbench/header 후보와 여러 module/top 후보를 검토 모델로 제공하고, 처음 탐색에는 사용자 파일/TOML/폴더를 만들거나 수정하지 않는다. 폴더 역할·override·자동 설정/Simulation UI 연결은 후속 H5에 포함한다. 이후 H6 미저장 simulation snapshot/자동 dump→H7 내부 베타 수용이다.
