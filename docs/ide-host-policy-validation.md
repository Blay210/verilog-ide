# H1 개발 host·built-in 정리 (2026-10-09)

이 기록은 ide 자체 source와 tracked patch만 대상으로 한다. VSIX 기능 이식/배포는 하지 않는다.

## 실제 발견과 보완

직전 surface-final-acceptance의 전체 로그를 다시 읽었더니 AgentHostProcessManager: agent host started와 agent renderer 연결이 실제 존재했다. 앞선 부분 contribution14곳 제외만으로 프로세스 미시작을 보장하지 않는다. 이전 문서의 전체 Agents 제거 미완료 한계를 유지하며, 로그 부재 관찰을 새 결과로 대체한다.

AgentHostEnablementService의 enabled observable에 RTL 제품의 false 조건을 추가했다. 사용자가 AI 비활성화 설정을 false로 바꾸더라도 적용하며 Code-OSS 원 동작은 보존한다. workbench/services의 별도 AgentHostPrewarmContribution 등록도 RTL에서 제외했다. 실제 재실행의 프로세스/화면 결과는 아래 상태에 따라 판정한다. 모든 Agent service/import 제거는 아니다.

system extension scanner에서 vscode.vscode-api-tests/vscode.vscode-test-resolver/vscode.debug-auto-launch 세 개발 시험 built-in을 RTL에서 제외했다. default/dev 스캔 결합 후 적용하므로 개발 소스의 시험 contribution도 읽히지 않는다. Git/언어 built-in은 보존한다. 기존 scripts/code.bat의 disable-extension만으로 contribution 제외를 보장하지 못했으며 소스 파일/패키지를 삭제하지 않는다.

확장 host10초 시작 경고는 로그상 host 기동/handshake 지연과 관련되어 있지만 원인과 해소를 확정하지 않는다. agent inspector 포트 충돌과 여러 개발 창도 기록되어 있다. 경고 timeout을 늘리거나 숨기는 방법을 쓰지 않았다.

## 현재 검증

자동18 PASS/0 FAIL/0 SKIP, 568ms: .dev/h1-host-policy-tests.log. 기존15개에 scanner의 default/dev·대소문자·Git/언어 보존 및 upstream 유지, runtime/설정4조합 enablement, prewarm 등록 경계를 추가했다. compile:core0 errors/exit0·5.03분(.dev/h1-host-policy-compile.log/exit.txt). scripts/verify-host-policy.mjs로 실제 compiled scanner RTL/Code-OSS와 Agent enablement 설정2종4 PASS(.dev/h1-host-compiled-policy.log). 실제 설치 entry5곳도 재검증 PASS(.dev/h1-host-install-policy.log).

host-policy-acceptance 별도 profile/shared/extensions로 실제 앱 실행, 격리 shared storage 생성과 Git built-in 활성화를 확인했다. .dev/h1-host-launch.log에 agent host started/MessagePort acquired/기존10초 시작 경고 없음, native 실제 화면의 Hello World/Chat/Extensions 없음 확인. 단일 개발 실행의 시작 구간 관찰이며 모든 요청 경로·반복 기동/성능 완료를 뜻하지 않는다. 로그에는 RemoteAgentHost reconciling desired=[] 서비스와 extension host 일시 unresponsive→responsive 복구/자동 profiling·debugger 연결이 남아 있다. 전체 서비스 제거가 아니며 추가 시작 안정성 검증이 필요하다.

최초 screenshot은 실제 RTL IDE 화면을 확인했으나 다음 capture는 사용자 Codex 화면이 겹쳐 나타났다. 이 상태에서 파일 입력/창 활성화·닫기를 수행하지 않았다. 실제 앱은 열린 상태로 남기고 파일/저장/폴더 수용은 계속 미완료로 기록한다. .dev/h1-host-policy-receipt.json은 이번 검증 시점 결과이고 launch-exit 파일은 앱 종료 후 생성될 예정이다. 실행 중 앱을 종료 성공으로 판정하지 않는다.

H1 전체/H2/베타 완료가 아니다. 다음은 확장 host 일시 무응답/개발 debugger·자동 profiling 원인과 반복 시작 확인 → 파일 편집·저장/폴더 수용 → 아이콘/runtime metadata·잔여 설정/명령/remote 경계 점검 → H1 완료 범위 판정이다. 이후 H2 Code/Simulation 공간을 구현한다. 이전 사용자 개발 창을 임의로 종료하지 않는다.
