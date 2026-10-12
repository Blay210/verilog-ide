# H3K — 도구 설정 UI 연결 검증·신뢰 변경 보완 (2026-10-10)

## 이번 범위

H3J 설치 서비스의 단위 검증에 더해 실제 `ide/language/src/tools.ts` 화면 adapter와 실제 `ToolSetupService`를 함께 실행했다. VS Code 화면 응답과 외부 도구 planner만 대체하며 다운로드·설치·신뢰 설정 변경은 수행하지 않는다. 물리 GUI 수용이나 clean Windows 설치 E2E와는 다른 검증이다.

승인 modal이 열린 동안 프로젝트 신뢰가 해제되는 경로에서 서비스는 설치를 차단하지만 adapter는 예외를 정상 취소로 처리하지 않았다. 승인 직전 신뢰를 다시 확인하고 계획을 취소·안내하도록 보완했다. 설치 승인 원칙은 유지한다.

## 검증

`ide/tests/tool-setup-ui.test.mjs`의 새 5항목 PASS:

- 비신뢰 상태에서는 service/probe 생성 없음. 신뢰 상태의 설치 거절은 installer 호출 없이 취소하며 위치·구성 요소·SHA256 안내를 확인한다.
- 검사 실패→재시도→새 계획의 명시적 승인→완료→언어 client 재시작을 확인한다.
- 승인 창에서 신뢰가 해제되면 설치 0회, cancelled와 이유 안내를 확인한다.
- Notification 취소는 진행 중 installer 정리를 기다리며 완료 안내를 표시하지 않는다.
- 승인 창 중 adapter dispose는 대기 계획을 무효화하고 설치하지 않는다.

초기 테스트 harness의 CJS filename 미지정은 Node assertion으로 실패해 명시적인 filename으로 수정했다. 제한 실행의 realpath EPERM은 제품 결함과 구분하며 같은 프로젝트 내부 검사에 대해 승인된 실행으로 최종 5항목을 통과했다. actual editor adapter 코드를 메모리에서 변환해 실행하며 테스트 때문에 제품의 의존성 경계를 변경하지 않는다.

최종 전체 **91 PASS /0 FAIL /0 SKIP**, runtime/language 타입 검사 통과, 내장 언어 bundle 생성 성공. 전체 회귀 결과는 `ide/.dev/h3k-tests.log`와 `.exit`(0)에 보존한다. 기존 실제 slang/LSP 및 simulation/파형 회귀를 포함한다. 이번 adapter 변경에 전체 upstream 재검사를 새로 수행한 것은 아니며 H3J의 upstream 타입 검사 근거와 구분한다.

## 남은 범위·인수인계

**H3K 전체 완료, H3/H4 전체 완료 또는 베타 완료가 아니다.** trusted GUI built-in LanguageClient의 실제 추천·진단·공간 왕복, 물리 설치 승인 UI와 실제 설치 E2E는 아직 남는다. 사용자가 신뢰한 기존 h3b-simulation 창은 종료하거나 테스트 옵션을 주입하지 않았다. 새 fixture를 자동 신뢰하거나 기존 profile 신뢰 설정을 복사하지 않는다.

다음은 trusted semantic GUI 수용을 현재 창 상태를 보존하며 진행하거나 사용자가 직접 신뢰한 별도 fixture에서 확인한다. 기존 사용자 답변에 따라 clean Windows 환경은 현재 없으므로 미완료 gate로 유지한다. 이후 H5 discovery/폴더 역할/multi-top/자동 TOML, H6 미저장 simulation snapshot/자동 dump, H7 복원/규모/내부 베타 순서다. FST/enum/자동 package 순서 simulation 연결/history 정리·기존 layout/host/audit gate도 남아 있다. 새 패키징·배포·도구 설치 없음.
