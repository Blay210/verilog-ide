# H1 기본 실행·문서 편집 수용 (2026-10-09)

## 보완 범위

직전 앱의 잠깐 unresponsive/복구 때 ExtensionsAutoProfiler가 자동으로 inspector에 붙는 경로를 확인했다. RTL 제품의 기본 extension inspector는 자동 활성화하지 않으며 명시 inspect/inspect-brk 요청은 보존한다. 자동 ExtensionsAutoProfiler contribution 등록은 RTL에서 제외한다. responsive 로그/10초 시작 경고/timeout 자체는 유지한다. 이것만으로 최초 지연의 원인이 해결되었다거나 성능이 개선되었다고 주장하지 않는다. 다른 개발용 main/pty/shared inspector와 수동 profiling 명령은 이번 범위가 아니다.

tracked patch와 자체 시험을 사용한다. 자동20 PASS/0 FAIL/0 SKIP(561ms), ide/.dev/h1-startup-tests.log. 기존18개에 inspector 기본값/명시 args 보존과 자동 profiling 등록의 제품/upstream 경계를 추가했다. 본체 재빌드0 errors/exit0·2.68분: ide/.dev/h1-startup-compile.log/exit.txt. actual compiled getter4조합·scanner2조합·enablement2조합8 PASS(h1-startup-compiled-policy.log), 설치5 entry도 PASS(h1-startup-install-policy.log).

## 편집 검증 방법

ide/scripts/verify-editor.mjs는 자체 임시 workspace/test extension/profile/shared/extensions를 ide/.dev/editor-acceptance-*에 만들고 실제 Electron/native extension host 테스트 경로로 실행한다. 확장 설치나 배포 패키징이 아니다. ide/tests/native/editor.cjs는 한글·공백 폴더/소스를 열고 active editor, dirty 변경, save 전 원본 유지, 저장 후 디스크/모델 일치, 닫기/재열기, Output API와 workspace 생성물 경계를 확인한다. API 기반 실제 앱 수용이며 physical 키보드/마우스 입력·폴더 신뢰 확인·작업 공간 왕복·Terminal 유지 수용을 대체하지 않는다. 사용자 프로젝트/기존 창을 수정하지 않으며 타임아웃 시 자신이 시작한 테스트 프로세스 트리만 취소한다.

## 실제 결과와 실패 기록

첫 editor-acceptance-mQxR4P receipt passed=true/host exit0로 API 수용5항목을 통과했다. 그러나 검증용 manifest engines.vscode='*'가 구체적이지 않다는 경고를 발견해 ^1.141.0으로 보완했다. 이 첫 실행은 확장 host10초 시작 경고·일시 unresponsive→responsive가 있었으며 정책 개선으로 기동 지연이 해결됐다고 주장하지 않는다. 첫 fixture/log/receipt를 보존한다.

수정 후 editor-acceptance-jWcTwP는 정상 development extension 로딩, receipt passed=true/exit.json code0·passed=true, wrapper exit0. API 수용5항목 전체 PASS. 마지막 host.log에 agent host started/MessagePort acquired·기본 debugger listening/Debugger attached·자동 starting to profile·10초 시작 경고·unresponsive·manifest version 경고 없음. 두 실행 모두 자동 profiling/기본 debugger 연결은 없지만 clean 최종 한 번의 기동은 반복 성능/장시간 안정성 게이트가 아니다. 시험 모드 shared storage는 :memory:로 upstream이 동작했고 정상 개발 모드의 영구 storage 격리는 이전 native 화면 기록과 구분한다. .dev/h1-editor-acceptance-final.log/exit.txt 및 fixture별 receipt/exit/host.log를 참조한다.

파일/폴더 API 수용은 완료했지만 physical 키보드/메뉴/저장 dialog·Workspace Trust·실제 작업 공간 왕복 수용은 남아 있다. H1 잔여는 반복 기동/일시 host 지연, 기본 UI 입력, 전용 아이콘/runtime metadata, 기타 Chat/Agents/settings/URL 경계 점검이다. 현재 H1 전체/H2/베타 완료가 아니다. 다음은 이 범위 판정·재현 가능성 점검 후 H2 Code/Simulation 공간 구현이다. 사용자의 기존 앱 창/파일과 VSIX 프로젝트는 수정하지 않았다.
