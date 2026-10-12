# H2F 내장 기능 유지·외부 사용자 확장 제외와 실제 Explorer 수용

2026-10-09. 일반 개발 실행의 전체 확장 비활성화 옵션을 제거하고 RTL 제품의 사용자 확장 검색 정책을 보완했다. H2 전체/베타 완료 판정은 아니다.

## 변경과 경계

기존 start의 --disable-extensions는 내장 언어/Git 기능까지 비활성화하고 ‘All installed extensions are temporarily disabled.’ 안내를 표시했다. H3에 필요한 내장 편집 연결을 위해 `ide/scripts/dev.mjs`에서 이 옵션을 제거했다. profile/extensions/shared 경로 격리는 유지한다.

`ide/config/patches.json`의 rtl-no-user-extension-scan은 RTL 제품에서 scanUserExtensions를 filesystem/profile 접근 전에 빈 목록으로 반환한다. 기존 내장(system) 확장 검색·개발 시험 경로와 Code-OSS 제품 동작은 유지한다. 기존 설치/Marketplace/Chat 정책도 유지한다. 표준 사용자 profile 확장을 제외하는 정책이며 모든 remote/development 확장 진입이나 모든 지원하지 않는 플랫폼을 검증했다는 뜻은 아니다. 외부 extension 지원을 새로 제공하지 않는다.

`tests/surfaces.test.mjs`와 `scripts/verify-host-policy.mjs`에 RTL 선행 제외/Code-OSS 정상 scanner 진입 대조를 추가했다. ignored upstream만 수정하지 않고 tracked patch로 배치/재빌드했다. vsix/root source 의존성 없음.

## 결과

- 독립 IDE 자동28 PASS/0 FAIL/0 SKIP.
- 본체 compile-core0 errors/exit0·1.97분, `.dev/h2f-build.log`/exit.
- 실제 compiled host 정책10항목 PASS/exit0. 새2항목은 RTL 빈 목록 반환과 Code-OSS scanner 시작 sentinel이다. 실제 내장 scanner의 RTL/Code-OSS 보존 검증도 통과했다.
- native `editor-acceptance-t30mLT`: 기존15항목 PASS/앱·검증 exit0, 언어감지/API attribution 오류 없음. `.dev/h2f-native.log`/exit 및 fixture receipt/host/launch/exit. 탭·dirty·source 열기·Untitled·Output 보존 회귀를 유지했다. 신뢰 설정을 바꾸지 않았고 해당 untrusted workspace Terminal PID는 계속 미수행이다.
- 변경된 두 스크립트 문법 검사 exit0.

## 실제 일반 개발 화면

Computer Use 스킬/Sky로 새 private `RTL_IDE_DEV_SESSION=h2f-surface` 창을 확인했다. 이전 returned-window 목록과 비교해 새 window1639674/fingerprint RTL exe를 유일하게 선택했고 기존 window524436/Codex 창에는 입력하지 않았다. 새 앱은 own profile/shared/extensions 경로로 실행됐으며 열린 상태다.

1203×804 화면에 확장 일시 비활성화 안내 없음. Simulation 버튼 실제 클릭→홈 표시→Explorer 실제 클릭→Code와 Explorer visible 복귀 PASS. 입력 직후 첫 snapshot은 이전 화면을 보였으며 추가 관찰에서 Explorer 복귀 완료를 확인했다. 홈/Code 모델의 실제 전환을 API 결과와 구분해 기록한다.

작은 창을 만들기 위해 private 창 모서리를 drag했지만 이후 screenshot 크기가 그대로였다. **작은 viewport 수용은 완료하지 않았다.** 창은 Explorer/Code 빈 편집 영역 상태로 남아 있다. 새 소스/실제 typing·Search/SCM 물리 경로까지 이번에 수행하지 않았다. 삭제/신뢰 변경/터미널 명령 UI 입력 없음.

일반 개발 log에서 host unresponsive19:12:40.232→responsive19:12:44.037(약3.8초)을 다시 확인했다. 회복됐으나 원인 해결/완전한 시작 안정성을 주장하지 않는다. `.dev/h2f-surface.log`에 보존한다.

## 다음 순서

1. 현재 앱에서 Search/SCM/새·동일 source 물리 진입/focus, 작은 viewport·Activity Bar 위치/숨김, 보조 sidebar 세부 복원 확인.
2. 기본 신뢰 정책을 변경하지 않고 실제 Terminal PID·프로세스 유지 검증이 가능한 private empty-window/fixture 구성을 검토한다. Output 실제 내용은 이미 H2D~F 지원 시험 PASS.
3. 잔여 H2 수용과 간헐 host 시작 지연의 완료 범위를 정리한 뒤 H3 편집/Core/toolchain/실행/파형을 ide 내부로 이식하고 H4 홈에 연결한다. 현재 홈에는 RTL 실행이 없다.

배포 전 audit 영향·깨끗한 Windows gate 유지. release 패키징·VSIX/installer·vsix 수정·자체 엔진 착수 없음.

