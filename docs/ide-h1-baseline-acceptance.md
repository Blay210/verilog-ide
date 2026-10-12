# H1 개발 기반 수용과 H2 진입

2026-10-09. 개발 기반을 이용해 H2 화면 구현을 진행할 수 있다. **전체 H1 잔여 수용/시작 안정성/RTL 베타/배포 완료 판정은 아니다.** 기반 검증을 계속 반복하는 대신 아래 열린 항목을 추적하며 두 공간의 실제 동작을 구현한다.

## 이번 보완·실제 결과

native 시험 entry를 `.dev/editor-acceptance-*/test-extension/editor.cjs`에 복사하고 해당 경로로 실행한다. 이는 ide 자체 테스트를 private fixture에 배치한 것이며 vsix/root 소스 연결이나 확장 설치가 아니다. 이전 test-extension 밖 `require('vscode')`의 API attribution 경고를 바로잡았다. 시험은 UTC/단조 elapsed 시간을 파일 열기/저장·RTL 감지·JSON 열기/감지/복귀·완료 단계에 기록한다. 제품이나 컴파일된 본체는 변경하지 않았다.

stdout에 안 나오는 경고가 있어 `acceptance-log.mjs`로 host.log와 profile/logs 내 실제 exthost.log를 함께 검사한다. `editor-acceptance-2vus4D`의 이전 로그는 attributionWarning=true, 아래 세 새 fixture는 모두 false로 검출했다. 자동25 PASS/0 FAIL/0 SKIP에는 extension-host만의 경고/renderer 감지 오류/정상 로그 회귀가 포함된다.

| fixture | 편집/감지7항목·exit | 전체 준비~종료 | test-entry~완료 | JSON 열림~감지/Code 복귀 |
|---|---|---|---|---|
| editor-acceptance-jN3Oqh | PASS/0 | 17782ms | 1781ms | 816ms |
| editor-acceptance-xrlGeC | PASS/0 | 17052ms | 1851ms | 818ms |
| editor-acceptance-OI9ARN | PASS/0 | 17270ms | 1697ms | 747ms |

모든 실행에서 startup gate=true·무응답/10초 경고/Agents 시작/기본 inspector/자동 profiling/감지 오류/attribution 경고 없음, 반복 wrapper exit0. 같은 PC/runtime cache에서 새 프로필을 쓴 측정이며 pure startup 성능이나 clean Windows 보장이 아니다. 이전9.1초 지연 원인 해결 또는 fixture 이동으로 속도 향상이 났다는 인과 주장은 하지 않는다.

최종 정상 preLaunch/batch `editor-acceptance-Heu30U`:7항목 PASS·앱/검증 exit0·감지/소속 경고 없음, test-entry~완료1487ms. `.dev/h1-attribution-batch.log`/`-exit.txt`. 각 fixture launch/receipt/host/exit와 `.dev/h1-attribution-native.log`/`-exit.txt`, `.dev/h1-attribution-repeat-receipt.json`, `.dev/h1-attribution-analysis.json`을 보존한다. 이번은 API 수용이며 physical 키보드/Workspace Trust 재검증이 아니다.

## 기반·잔여 수용표

| 항목 | 현재 근거/판정 | 다음 처리 |
|---|---|---|
| 독립 source/lock/도구/빌드 | ide 자체 pinned Code-OSS, 승인 도구, 본체0 errors/exit0 | H2 변경 후 본체 재빌드 |
| 제품 이름/Windows runtime 아이콘 | 임시 칩·metadata 실제 추출/검증, 원본 보존·cache 검사 | 모든 UI 로고/Help 문구는 H2 shell 정리에서 추적 |
| 파일/폴더/저장·Output/Terminal | native 편집 API·physical 입력/저장, 이전 패널 화면 수용 | H2 미저장/선택·배치/Terminal 왕복 검증 |
| Chat/Extensions 기본 진입 | 기존 실제 화면 제외와 제품 guard 유지, native install5곳·CLI 거부 | 잔여 명령/palette/설정은 H2 실제 화면에서 점검; 전체 코드 삭제 아님 |
| Agents/developer test·자동 profiler | scanner/enablement/prewarm/등록 guard·native 시작 로그 | 범용 remote/web 기능은 첫 Windows local 앱 범위 밖; 공유 서비스 잔여는 추적 |
| 일반 host 간헐 무응답 | 이전9.1초 복구, 이후 반복 PASS, 이번 단계별 기록 | 열린 안정성 항목. H2/H7 실제 사용에서 재현되면 단계/activation log로 분석 |
| Git/Search/언어 built-in | 보존하며 일부 eager activation 확인 | H2 Code 기능으로 유지/배치; Git 실제 프로젝트 종단 수용은 별도 |
| Marketplace/외부 extension | 제공하지 않음; 설치는 사전 거부 | file association/드래그·URL/remote 전체 감사는 배포 전 |
| dependency audit37건 | 기존 기준선의 critical2/high14 포함 영향 미분석 | H7 내부 배포 전에 영향/완화 판정; 자동 lock 갱신 없음 |
| installer/signing/정식 브랜드/clean Windows | 미완료·이번 미수행 | 별도 배포 준비 단계. 현재 없음/새 환경 없음 유지 |

홈 프로필을 생성했던 이전 batch probe는 [브랜딩 검증](ide-branding-validation.md)에 보존한다. 실제 생성물을 임의로 지우지 않았고 이후 누락 flag guard/격리 batch를 검증했다. 이번 probe는 private data 경로만 사용했다.

## 바로 다음 구현: H2A

1. RTL 제품에 Code/Simulation 진입과 중앙 Simulation 홈을 추가한다. 첫 홈은 아직 실행 엔진을 연결하지 않으므로 실제 테스트/실행 결과가 있는 것처럼 표시하지 않는다. 다른 제품의 원래 workbench는 보존한다.
2. 전환 시 Code의 열린 editor/model을 유지하고 Simulation에서는 Explorer 영역을 숨겨 중앙 공간을 확보한다. 공유 Terminal/Output은 전환으로 dispose/clear하지 않는다. Search/SCM은 우선 기존 Code 사용 흐름을 유지하고 세부 배치는 실제 화면을 보며 정한다.
3. 다음 H2B에서 여러 탭·active/커서/스크롤·group 배치/미저장 문서와 공통 panel의 왕복 상태를 실제 native 호스트로 수용한다. Simulation 홈/파형 선택 상태는 H3/H4 이식 후 실제 데이터로 연결한다. 재시작 복원은 H7이다.

고정 source의 EditorParts.saveWorkingSet/applyWorkingSet을 조사했다. snapshot/복원 API가 있지만 dirty editor 처리와 auxiliary state도 적용하므로 이를 단순 호출하는 것만으로 무저장·무확인 전환을 보장할 수 없다. H2A에서 닫기/자동 저장/저장 확인 없이 Code 모델을 보존하는 화면 경계를 먼저 구현·검증한다. 빈 SemanticProvider/engine/framework나 vsix import를 새로 만들지 않는다. H2A/H2B는 아직 구현되지 않았다.
