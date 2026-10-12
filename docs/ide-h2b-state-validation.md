# H2B 여러 탭·분할 편집 상태 및 실제 화면 수용

> 후속 최신: 초기 hidden sidebar의 Explorer 복귀 결함 재현/보완과 공통 panel toggle 수용은 [H2C 기록](ide-h2c-sidebar-validation.md)을 따른다. 아래는 당시 근거와 미검증 기록이다.

2026-10-09. H2 상태 보존 검증을 확장했다. 이번 제품 소스 변경/본체 재빌드는 없으며 H2A의 compiled 개발 앱으로 확인했다. H2 전체, RTL 실행 이식 또는 베타 완료 판정은 아니다.

## 실제 앱 검증

`ide/tests/native/editor.cjs`는 두 editor group에 세 탭을 열고, 첫 그룹의 미저장 원본과 둘째 그룹의 800줄 문서를 유지한다. 둘째 문서의 선택420:2→420:8, 실제 viewport 시작415, 원본 커서1:3을 잡고 Code/Simulation 세 차례 왕복에서 다음을 검사했다.

- 탭 수·순서·URI·dirty·활성 탭과 활성 group, 활성 문서 identity 일치.
- 두 문서의 선택/커서, 긴 문서의 실제 visibleRanges 시작 위치 복원.
- 미저장 text/dirty 보존, 원본 disk 자동 저장 없음.
- 홈 표시/숨김, primary sidebar 복원, 열린 Output panel visibility 보존.
- 기존 한글/공백 workspace·파일 열기/저장/재열기, .sv/JSON 감지 수용 유지.

최종 fixture `ide/.dev/editor-acceptance-eAXZc9`의 receipt passed=true/8항목, spaceCheck={groups:2,tabs:3,roundtrips:3,scrollLine:415}, 앱/검증 exit0. 단계 test-entry→test-complete4639ms는 시험 실행 시간이며 앱 시작 성능 측정이 아니다. 로그는 `.dev/h2b-tabs-final-native.log`, exit와 fixture receipt/host/launch/exit에 보존한다. 언어감지 오류/extension API 소속 경고 재발 없음. 독립 IDE 자동27 PASS/0 FAIL/0 SKIP도 재확인했다.

처음 두 그룹/각 한 탭 시험 `editor-acceptance-0WggiY`는 PASS/exit0. 같은 그룹에 두 탭을 추가한 첫 시험 `editor-acceptance-tW0lFe`는 panel visible true≠false로 FAIL/exit1이었다. Output.show의 비동기 표시 전에 baseline을 읽던 시험을 보완했다. 그룹 구성 후 Output을 표시하고 실제 panel visible을 bounded 대기한 뒤 baseline을 확보해 최종 검증을 통과했다. 생산 코드 버그 해결로 보고하지 않는다. 실패 receipt/로그는 삭제하지 않았다.

Terminal processId 시험은 untrusted fixture여서 미수행으로 기록한다. 신뢰 설정을 변경하지 않았다. Output의 **표시 상태** 검증과 내용/Terminal 프로세스 검증을 구분한다.

## 실제 버튼·키보드 화면

기존 private `h2a-surface` 개발 창(window524436, fingerprint RTL IDE exe)을 Computer Use/Sky로 관찰했다. 첫 관찰에 Codex 창이 앞을 가리고 있어 입력하지 않고 대상 RTL 앱을 활성화한 뒤 재관찰했다. 사용자/Codex 창에는 입력하지 않았다.

1203×804 화면에서 왼쪽 Code/Simulation 아이콘과 기존 Explorer/Search/SCM 등의 구분을 확인했다. Simulation 버튼 클릭→중앙 홈·사이드바 숨김→Tab으로 ‘코드로 돌아가기’ 버튼의 가시적 focus outline→Enter로 Code 복귀 PASS. 홈의 개발 중/테스트 미연결 안내가 읽히고 기존 Code 빈 editor 화면으로 돌아왔다. 이는 물리 입력 수용이며 API 결과와 별도로 기록한다. 파일 편집 상태에서의 실제 물리 왕복·작은 viewport·전체 접근성 수용은 아니다.

이전 H2A Computer Use 승인 timeout은 역사로 보존한다. 이번 성공이 그 당시 실패를 없애는 것은 아니다. 창은 Code 공간에 그대로 열려 있다.

## 발견 및 다음 순서

1. Simulation 중 Explorer/Search/SCM 진입과 sidebar 초기 숨김 상태를 조합해 검사한다. 현재 visibility handler의 Code 복귀가 저장된 hidden 상태를 재적용할 수 있으므로 사용자 요청이 사라지지 않는지 확인하고 보완한다. 보조 sidebar/새 문서 진입, 실제 편집 focus와 작은 창도 검사한다.
2. 일반 개발 실행의 `--disable-extensions` 때문에 ‘All installed extensions are temporarily disabled.’/Reload 안내가 실제 화면에 남는다. H3 built-in RTL 편집 연결 전 실행 정책을 검토한다. 이번에 reload/enable 또는 신뢰 설정은 변경하지 않았다.
3. 공통 Output 내용·기존 trusted Terminal 프로세스, Activity Bar 위치/숨김, 종료/재진입 상태는 아직 미완료다. H2 상태 보존 완료 판정 전 확인하고 H7 재시작 복원과 구분한다.
4. 이후 H3에서 편집/Core/toolchain/실행/파형을 출처를 보존해 ide 내부 소유 코드로 이식한다. H4의 Simulation 홈 테스트/결과/이력으로 연결한다. 지금 홈에는 실행 기능이 없다.

H1 간헐 host 지연, npm audit 영향 검토와 깨끗한 Windows 설치 gate는 열려 있다. 기존 VSIX/배포물/사용자 설계는 수정하지 않았고 release 패키징·독립 엔진 작업은 하지 않았다.
