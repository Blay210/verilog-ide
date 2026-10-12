# H2C Explorer 복귀와 공통 패널 상태 보완

> 후속 최신: 새 source 진입/focus와 Output 실제 내용 수용은 [H2D 기록](ide-h2d-source-output-validation.md)을 따른다. 아래는 당시 결과다.

2026-10-09. 독립 IDE H2의 사이드바 복귀 결함을 실제 앱에서 재현·수정하고 공통 panel 상태 검증을 확장했다. H2 전체/RTL 실행/베타 완료는 아니다.

## 결함과 보완

Code에서 primary sidebar를 숨긴 후 Simulation으로 이동해 Explorer를 열면, 공간은 Code로 돌아가지만 sidebar가 다시 숨겨졌다. visibility handler가 사용자 요청을 받으면서도 이전 Code의 hidden 상태를 복원했기 때문이다.

`ide/src/rtlSpaces.contribution.ts`에서 Simulation 중 사용자가 새로 연 primary/auxiliary sidebar의 저장 상태를 visible로 갱신하고 Code로 복귀한다. 나머지 Code layout은 그대로 복원한다. 일반 Code 버튼 복귀와 Simulation 진입 시 숨기는 정책은 유지했다. auxiliary 분기의 동일 처리는 구현했지만 실제 auxiliary 수용은 아직 남아 있다.

own source overlay의 이전 적용 target SHA256을 `ide/config/source-overlay.json`에 명시해 검토 후 배치했다. root/vsix 코드 참조 없이 ide 내부 owned source로 본체를 재빌드했다. 테스트는 `ide/tests/native/editor.cjs`에 추가했다.

## 실제 결과

- 수정 전 fixture `editor-acceptance-ciyf17`: 기존 탭/스크롤 왕복까지 PASS, Explorer sidebar visible=false에 FAIL/exit1. `.dev/h2c-before-native.log` 및 receipt/host/exit 보존.
- 본체 `compile-core`: 0 errors/exit0, 1.97분. `.dev/h2c-build.log` 및 exit 기록.
- 독립 IDE 자동27 PASS/0 FAIL/0 SKIP, native test 문법 검사 exit0.
- 수정 후 `editor-acceptance-qNTR2a`: receipt passed=true/10항목·앱/검증 exit0. 기존 파일 열기/저장/감지와 두 group/세 tab·선택420:2→420:8·viewport415·dirty/disk 보존3회 왕복 PASS. 초기 hidden sidebar에서 Simulation→Explorer 요청 후 Code/home hidden/sidebar visible=true PASS.
- 공통 panel을 닫은 상태로 Simulation에 들어가도 hidden 유지, Simulation 안에서 panel을 열어도 공간은 Simulation 유지, Code 복귀 후 열린 panel 유지 PASS. 원본 dirty text/disk도 유지했다. `.dev/h2c-final-native.log`와 fixture receipt/launch/host/exit 보존. 감지 오류/API attribution 경고 없음.

위 결과는 실제 native 앱의 extension-host API 시험이다. 이번에 수정한 Explorer 경로의 **물리 마우스 클릭**을 완료했다고 하지 않는다. H2B의 기존 실제 버튼→홈→Tab/Enter Code 결과는 역사로 유지한다. 기존 열려 있던 일반 개발 창은 새 본체로 재시작하지 않았으며 다음 화면 검증에서 현재 빌드/대상 창을 구분해야 한다.

## 남은 순서

1. 초기 sidebar hidden/visible에서 Explorer/Search/SCM 물리 진입, auxiliary sidebar와 새 source 문서 진입/focus, 작은 viewport와 Activity Bar 위치/숨김을 검사한다.
2. Output 내용과 trusted Terminal PID/프로세스 유지 수용은 아직 남는다. 현재 fixture는 untrusted이며 신뢰 설정을 바꾸지 않았다. 이번 검증은 panel visibility/사용자 toggle 동작이다.
3. 일반 개발 start의 --disable-extensions 안내와 H3 built-in 편집 연결을 정리한다. 지금 실행 정책은 변경하지 않았다.
4. H2 잔여 수용 후 H3 편집/Core/toolchain/실행/파형 이식, H4 홈 테스트/결과/이력 연결 순서로 진행한다.

H1 간헐 host 지연·배포 전 audit 영향·깨끗한 Windows gate는 열려 있다. release VSIX/installer/배포·독립 엔진 착수·vsix 변경 없음.
