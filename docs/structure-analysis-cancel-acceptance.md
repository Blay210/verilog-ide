# E4 분석 취소·프로세스 트리·닫기 복구 수용 (2026-10-08)

## 검증 방법

tests/vscode/structure-analysis-cancel.ts는 격리 개발 host에서 실제 slang으로 pipeline_mac test의 hierarchy와 signed4 모듈을 먼저 분석한다. 이후 hierarchy/scopeOperations/internalOperations 중 정확히 한 analyzer 호출만 시험용 Python sleeper로 대체한다. sleeper는 별도 Python 자식 프로세스를 생성하고 두 PID를 출력한다. 원래 공통 process runner/AbortSignal/taskkill /T 경로는 그대로 사용한다. 따라서 실제 slang의 장시간 분석 성능 시험이 아니라 제품 취소 경로와 Windows 프로세스 트리 정리 시험이다. child_process.spawn 후킹은 finally에서 복원된다.

## 닫기·복구 결과

격리 host run-NwNO9r, .dev/e4-analysis-cancel-retry.log, 해당 host receipt.json passed=true, RTL_ANALYSIS_CANCEL_PASS 및 exit0.

| 요청 | 닫기부터 종료·확인까지 | 부모/자식 종료 | 실제 slang 재시도 |
|---|---:|---|---|
| hierarchy | 466ms | 둘 다 확인 | PASS |
| scopeOperations | 429ms | 둘 다 확인 | PASS |
| internalOperations | 460ms | 둘 다 확인 | PASS |

각 경우 VS Code tabGroups.close로 개발 diagram 탭을 닫았다(물리 X 버튼 클릭 시험이 아님). command settle/child close를 기다린 뒤 process.kill(pid,0)의 ESRCH로 두 PID가 사라진 것을 assert했다. 닫힌 panel이 늦게 재열리지 않고 operations가 없는 것을 확인했다. openStructureWorkspace → refresh → signed4 inspect는 교체하지 않은 실제 slang으로 supported graph를 복구했다. private RTL source 첫 파일의 내용 보존을 각 경우 확인했다. 입력 경로에 공백·한글이 포함된다.

첫 host run-4Bvwt5/.dev/e4-analysis-cancel.log는 시험에서 pipeline-mac이라고 잘못 쓴 test name 때문에 initial command가 실패해 observation timeout/exit1이었다. product regression으로 단정하거나 성공으로 집계하지 않았다. manifest의 project.tests[0].name을 사용하고 초기 real hierarchy assert를 추가하여 보완했다.

## 실제 Cancel 버튼

격리 host run-LO9ODL/.dev/e4-analysis-physical.log의 Reading internal RTL operations 알림에서 실제 Cancel 버튼을 computer-use로 클릭했다. product cancel command/API를 대신 호출하지 않았다. harness는 parent/child 종료, command settle, panel 유지, cancelled 안내, operations 미게시를 assert했다. 이어 실제 slang scopeOperations 재시도가 supported로 완료됐고, 화면에 Schematic 재표시를 확인했다. 고유 receipt.json passed=true/physicalProgressCancel=true, RTL_ANALYSIS_PHYSICAL_CANCEL_PASS/exit0.

화면 관찰을 위해 이 physical 모드에서만 AbortSignal.timeout(15000)을 잠시 300000으로 대체하고, sleeper도300초로 설정했다. spawn과 child PID 관찰 직후 static timeout 함수를 원복하며 finally에서도 원복한다. 이번 결과는 실제 progress Cancel 경로 수용이며 제품15초 deadline 측정이 아니다. 제품 코드는 변경하지 않았다. physical receipt의 cases=[]는 위 닫기3건을 이 host에서 반복하지 않았음을 뜻한다. 별도 run-NwNO9r receipt와 구분한다.

## 실행·회귀와 한계

scripts/test-visual-debugging.mjs에서 RTL_E4_ANALYSIS_CANCEL=1로 선택한다. 실제 화면 Cancel 모드는 추가 RTL_E4_PHYSICAL_ANALYSIS=1 및 host별 verdict.json의 start/finish gate를 사용한다. 개발 VS Code와 RTL_E3_PROJECT/private fixture, 기존 semantic runtime 환경 변수가 필요하다.

관련 structure-host/navigation **19 PASS/0 FAIL/0 SKIP**, .dev/e4-analysis-related.log. 타입 검사 exit0, native host 실행 시 개발 build 성공. 제품 소스 변경 없이 harness/runner만 확장했으므로 전체224 회귀는 직전 제품 변경 결과를 유지하고 이번 다시 실행하지 않았다. 새 simulation/VSIX 패키징·설치/사용자 예제 수정 없음.

남은 E4: 전체 keyboard/focus 수용(계층·SVG module node·view selector·소스 왕복), diagram browser frame/layout 비용 측정. recorded 작업에서의 모듈 분석 physical Cancel, 실제15초 semantic timeout·특수 process 실패의 모든 조합을 이번 새 수용으로 주장하지 않는다. 기존 단위/native 범위와 함께 읽는다. 전체 E4 완료 및 독립 IDE/내장 엔진 착수는 아직 선언하지 않는다.
