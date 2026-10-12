# H2A Code/Simulation 첫 화면 구현

> 후속 최신: 여러 탭/두 그룹·스크롤 native 수용과 실제 버튼→홈→키보드 Code 복귀는 [H2B 기록](ide-h2b-state-validation.md)을 따른다. 아래 승인 timeout/단일 문서 결과는 당시 기록이며 전체 H2 완료는 아니다.

2026-10-09. 독립 ide만 변경했다. H2A 부분 구현이며 H2 전체/RTL 실행 이식/베타 완료가 아니다.

## 구현과 경계

왼쪽 Activity Bar 위쪽에 Code/Simulation 버튼을 추가했다. RTL 제품에서만 contribution을 등록하며 기존 Explorer/Search/SCM 등은 아래에 유지한다. 공간 navigation 높이96px를 activity bar layout에서 예약한다. 다른 Code-OSS 제품은 기존 높이/등록 동작을 유지한다.

Simulation은 중앙 홈을 표시하고 primary/auxiliary sidebar를 숨긴다. 원래 editor DOM/model/group은 닫거나 교체하지 않고 visibility/inert로 가리므로 미저장 모델을 저장하거나 dispose하지 않는다. Code 복귀 시 sidebar 상태/inert를 복원하고 원래 editor에 focus를 돌려준다. 기존 sidebar 도구를 여는 경우 Code로 돌아간다. Terminal/Output의 container/service에는 변경/clear/dispose를 하지 않는다. 홈은 개발 중/실행 미연결을 명시한다. 가짜 테스트나 결과를 표시하지 않는다.

새 코드 소유권은 `ide/src/rtlSpaces.contribution.ts`에 있다. `config/source-overlay.json`의 명시적 target으로 own upstream 안에 배치해 본체가 import한다. 런타임이 root/vsix source를 참조하지 않는다. 배치는 기존 target의 동일 내용 또는 명시적인 previousSha256만 인정하며 알 수 없는 변경/경계 밖 경로를 덮어쓰지 않는다. 모든 patch/product/overlay 검증이 끝난 뒤 기록한다. 앞으로 owned source를 수정할 때는 이전 적용 target의 SHA256을 overlay의 previousSha256에 기록하고 변경을 검토한다. upstream 소스 출처/MIT는 유지한다.

## 실제 검증과 실패

- 자동27 PASS/0 FAIL/0 SKIP. overlay 반복 적용/외부 경로 거부/변조 target 거부와 실패 전 다른 patch 원본 유지, 기존 제품/런처 정책을 검사한다.
- 본체 compile:core 0 errors·exit0, 2.33분. `.dev/h2a-build.log`/`-exit.txt`.
- 첫 native fixture `editor-acceptance-xMpkAx`는 Terminal 생성이 untrusted workspace 확인을 요구했고 test mode가 dialog를 거절했다. terminal.processId 대기 때문에120초 timeout으로 이번 process tree만 종료했다. wrapper exit1, receipt 없음. `.dev/h2a-native.log`/`-exit.txt`와 fixture host/exit를 보존한다. 성공으로 집계하지 않는다.
- 신뢰 설정을 바꾸지 않고, terminal PID 시험은 trusted workspace에서만 수행하도록 검증을 보완했다. 현재 private fixture가 untrusted여서 terminalCheck에 미수행 이유를 기록한다.
- 최종 fixture `editor-acceptance-LvDXtQ`: 기존 편집/저장·.sv/JSON 감지7항목과 세 번의 Code/Simulation 왕복1항목 PASS·앱/검증 exit0·감지/소속 경고 없음. 매 전환에서 home 표시/숨김, sidebar 숨김/복원, 미저장 text/dirty, disk 원본, 커서 line1/character3, 공통 panel visibility와 원래 document identity를 검사했다. 전환 때 저장하지 않았고 시험 종료 전에 private draft만 명시적으로 revert했다. 터미널 PID 유지 검증은 미수행이다. `.dev/h2a-native-final.log`/`-exit.txt`, fixture launch/receipt/host/exit.
- 기존 실제 compiled 설치5/host8/언어6 정책 회귀를 재실행해 모두 PASS를 확인했다.

## 화면 확인 제한

`RTL_IDE_DEV_SESSION=h2a-surface` 일반 개발 창을 자체 profile/shared/extensions 경로로 실행했다. 실제 log의 private shared storage 생성을 확인했다. 새 반환 window524436의 app은 fingerprint RTL exe였고 기존 사용자 창에는 입력하지 않았다. Computer Use 스킬의 Sky로 화면 상태를 요청했으나 **Computer Use app approval timed out**으로 결과를 받지 못했다. 실제 버튼 클릭/화면·작은 창 overflow/색상/홈 배치·physical 왕복을 완료했다고 주장하지 않는다. 창은 열린 상태다. [사용한 스킬](C:/Users/nanoi/.codex/plugins/cache/openai-bundled/computer-use/26.1002.52244/skills/computer-use/SKILL.md)의 대상 창 관찰 절차를 따랐으며 관찰 실패 후 좌표 입력을 하지 않았다. 도구 접근 승인 대기 실패이며 자동 승인 검토의 정책 거부가 아니다.

## 다음 작업

1. H2A 실제 버튼/키보드·홈 레이아웃/작은 viewport·sidebar 복원·일반 editor focus를 확인하고 보완한다. Activity Bar 위치/숨김 설정, 보조 창과 기존 sidebar tool 활성화의 세부 상태는 아직 수용하지 않았다.
2. H2B에서 여러 source 탭·editor group·커서/스크롤/selection·공통 Output 내용, trusted workspace의 기존 Terminal 프로세스 유지·복원/닫기/재진입을 검증한다. 이번 단일 문서 API 시험을 그 전체 수용으로 확대하지 않는다.
3. H3에 RTL 편집/Core/toolchain/실행/파형을 ide 내부로 이식한다. Simulation 탭/홈 결과와 state/history는 H3/H4의 실제 기능으로 연결한다. 현재 홈은 해당 기능이 없다.

이전 H1 간헐 host 지연·잔여 UI/설정/명령/audit/배포 전 Windows gate는 유지한다. release VSIX/installer/배포나 독립 엔진 작업은 하지 않았다.
