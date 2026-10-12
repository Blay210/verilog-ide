# H1 기본 화면·설치 진입점 정리 (2026-10-09)

작업은 ide 내부 tracked patches와 검증 스크립트로 관리한다. VSIX 이식/수정·새 배포 패키지는 없다.

## 이번 구현

- Extensions container는 hideIfEmpty이며 RTL IDE에서는 기본 view 목록을 등록하지 않는다. 자동 열기 명령/단축키 등록도 제외했다. 내부 관리 서비스와 built-in 사용은 유지한다.
- ExtensionsContributions의 install/recommend/search 관련 action을 등록하지 않는다. native 설치 거부 정책도 계속 유지한다. 모든 extension 명령/URL을 전면 감사 완료한 상태는 아니다.
- local AgentHost12곳·remote/cloud2곳의 workbench contribution 자동 등록을 RTL IDE에서 제외한다. delayed service와 원 소스 import는 남는다. 전체 Agents 코드 제거/메모리 절감 수치를 주장하지 않는다.
- Chat view/update view에 제품 조건 false를 적용하고 기본 Auxiliary container/열기 명령을 제외했다. 이 추가 보완의 실제 재실행 수용은 아래 결과를 따른다.
- RTL_IDE_DEV_SESSION으로 짧은 식별자를 지정하면 기존 개발 프로필을 건드리지 않는 ide/.dev/rtl-ide/<session> 환경을 사용한다. session 문자는 경로 이탈이 없는 소문자/숫자/하이픈으로 제한한다.

## 확인과 실제 발견

자동15 PASS/0 FAIL/0 SKIP. registration14곳 RTL에서 미호출/Code-OSS에서는 호출, 설치·추천 action 제외, 기존 정책/다중 patch 반복 적용을 검증했다. ide/.dev/h1-surface-final-tests.log.

첫 화면 정리 빌드3.3분/0 errors/exit0, h1-surface-compile.log/exit.txt. 실제 CLI에서 inert VSIX fixture의 한글·공백 파일명 설치가 제품 정책 오류로 exit1, 설치 디렉터리 없음/receipt passed=true. h1-cli-policy-final.log/exit.txt 및 .dev/cli-policy-ZdE4Q1/receipt.json. 작은 테스트 archive이며 배포 VSIX가 아니다. 최초 CLI 시도는 아직 빌드 중이라 nodejsWatcherLib.js가 없어 실패했고 h1-cli-policy.log에 보존한다. GUI/CLI 사용자 명령은 정상 빌드 완료 후 수용해야 한다.

surface-acceptance 격리 앱의 실제 screenshot/접근성 tree에서 Extensions 아이콘 없음과 title Search/Explorer·Source Control·Run and Debug를 확인했다. 관찰 로그에서 agent host started/uncaught 시작 오류 없음과 격리 shared storage를 확인했다. startup 로그의 부재만으로 모든 AgentHost 동작이 차단됐다고 주장하지 않는다.

같은 화면에 Chat panel은 남아 있었다. entitlement hidden만으로는 panelParticipantRegistered OR 조건을 막지 못한다. 따라서 chatParticipant.contribution.ts의 view when을 RTL에서 false로 만들고 기본 container/열기 명령도 제외했다. 추가 본체 빌드3.45분/0 errors/exit0(h1-chat-view-compile.log, h1-chat-view-compile-exit.txt). surface-final-acceptance 격리 창을 다시 실행하여 실제 화면과 접근성 tree에서 Chat panel 및 Extensions 아이콘 없음, 기존 Explorer/Search/Source Control/Run and Debug 표시를 확인했다. 최신 compiled native 설치 entry5곳 재검증 PASS(h1-surface-compiled-policy.log).

같은 최종 창에서 Output 패널/Tasks selector, Terminal 탭/PowerShell prompt 표시를 실제 확인했다. Terminal에 명령은 입력하지 않았다. 한글·공백 검증 파일 surface 편집 확인.sv의 Open File 대화상자 경로 입력 후 파일 신뢰 확인까지 도달했으며 신뢰 설정을 변경하지 않고 Cancel했다. 따라서 파일 열기 완료/저장은 PASS가 아니다. 이후 메뉴의 New Text File로 Untitled-1 생성은 확인했다. 본문 입력 직전 사용자 입력이 감지되어 재관찰했고 screenshot이 Codex 화면이므로 추가 UI 입력을 중단했다. 저장·폴더 열기 수용은 다음 실행에 남긴다. native file dialog의 접근성 index 클릭은 캐시 오류가 있어 관찰한 screenshot 좌표로 filename focus/입력을 확인했으며 제품 오류로 단정하지 않는다.

개발 source의 vscode-api-tests Hello World 상태 항목과 extension host10초 시작 경고가 여전히 표시된다. disable-extensions만으로 self-host built-in 시험 코드를 제외하지 못한다. 다음 작업에서 built-in 개발 시험 contribution 선택과 host startup 원인을 정리한 뒤 재수용한다. RTL 편집/시뮬레이션 기능 이식은 아직 하지 않았으므로 이 창은 사용 가능한 RTL 베타가 아니다.

## 남은 범위

파일 열기·편집/저장·폴더 열기, 전용 아이콘·런타임 metadata, 개발 시험 built-in/host 시작 경고, 기타 Chat/Agents/settings/onboarding 등록 제거와 remote/web/URL 전체 경로는 남아 있다. 하단 패널 표시는 확인했지만 작업 공간 왕복/프로세스 유지 검증은 H2다. H1 전체·H2·베타 완료가 아니다. 기존 개발 창과 surface-acceptance/surface-final-acceptance 창을 구분하고 사용자 작업 창을 임의로 닫지 않는다. 최종 창은 Untitled-1 빈 문서·Terminal 탭 상태로 남아 있다. 로그 h1-surface-launch.log/h1-chat-view-launch.log는 실행 로그이며 앱 종료 성공 판정은 아직 없다.
