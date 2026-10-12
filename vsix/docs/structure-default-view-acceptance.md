# 기본 구조도와 표시 모드/화면 정리 — 2026-10-07

## 변경된 흐름

Structure의 최초 아이콘 진입은 여전히 분석 전 Update 화면이다. 사용자가 Update로 hierarchy를 읽은 뒤 실제 module instance로 진입하면 기본 Schematic 분석도 이어서 실행한다. 단순히 아이콘을 다시 누르거나 코드를 편집하는 것만으로 분석하지 않는다. module 내부 진입/Back/Forward/Up은 승인된 hierarchy의 scope를 사용하고 현재 표시 모드로 분석한다.

표시 모드는 하나의 Display selector에 Schematic / Connections / Detailed leaf logic을 모았다. 현재 Structure 창의 선택은 Update와 scope 이동에서 유지한다. extension reload 이후 영구 보존이나 scope별 개별 표시 모드 저장은 아직 아니다. 기존 명령과 내부 메시지는 호환한다. rtl.showStructureConnections를 추가하고 showInternalOperations/showScopeOperations도 이 모드를 명시적으로 선택한다.

- Schematic: scopeOperations가 부모 자체 로직과 opaque child boundary를 보여준다. unsupported는 이유를 항상 보이며 기존 connection diagram으로 fallback한다.
- Connections: 현재 전체 hierarchy의 기존 직접 연결도/포트 상세를 사용한다. scope logic 분석을 추가하지 않는다.
- Detailed leaf logic: 기존 internalOperations의 leaf 지원 범위를 사용한다. unsupported 이유를 표시한다.

비동기 scope 분석의 AbortController/job/generation/run/instance/page 경계를 유지했다. 모드/모듈이 바뀐 뒤 늦은 결과는 표시하지 않는다. 취소하면 Reading 상태를 남기지 않고 Update 재시도를 안내한다. 미지원과 실패도 마지막 정적 연결도에서 이유를 볼 수 있다. current design의 창 닫기/재열기는 마지막 static graph와 mode를 보존하며 분석하지 않는다. reader/관측값은 기존처럼 해제한다. recorded graph의 자동 복원/값 연결은 기존 Update 재검증이 필요하다.

편집 시 static graph를 유지하며 source navigation은 Update 전까지 막는다. stale Back/Forward/Up 요청도 graph를 지우지 않는다. Update 시작 시 이전 graph가 지워질 수 있는 기존 제한과 transactional 취소/실패 후 전체 이전 화면 복원은 별도로 남아 있다. hierarchy/source/trace 무효화나 승인 없는 도구 설치를 우회하지 않는다.

## 화면

파라미터 표·child 내부 진입 버튼 목록·연결 상세·기술 설명을 닫힌 Details로 canvas 아래에 옮겼다. 큰 camera canvas는72vh/최대1100px, compact heading/간격을 사용한다. 모드 상태와 unsupported 이유는 접히지 않는다. 기록 시각/clock/source/current-versus-recorded 문맥은 유지한다. parameter·port source·child 내부 진입의 상세 버튼도 계속 사용할 수 있다.

이번 변경은 화면 공간/기본 흐름이다. 연산 심볼/레지스터/폭 변환을 더 간결하게 그리는 schematic 디자인, parent module의 외곽 포트 표현과 wire 교차, 연속 확대는 아직 완료되지 않았다.

## 검증 근거

- .dev/structure-default-host.log 실제 개발 VS Code run-s7uAg5, project/.rtl/structure-workspace-host.json passed=true/host·runner exit0. 별도 Show Module Logic 없이 초기 module scope 분석, 선택한 Detailed logic 모드 유지/미저장 W=4→8 Update, 실제 node 내부 진입 및 닫기/재열기 후 같은 current static graph를 확인했다. 실제 mouse로 Display/Update를 누르는 물리 UI 수용은 아니다.
- 새로운 host 모형 시험은 최초 analysis-free 진입, default schematic, Connections의 불필요한 scope 분석 없음, Update의 모드 유지, 편집/재열기에서 static graph 재사용, stale 이동 시 graph 보존, 늦은 default scope 응답 차단, progress cancellation/late response 차단/Update 복구를 검사한다.
- 최초 관련 시험은 legacy mock scopeOperations가 old internal gate를 재사용해 대기했다. 기본 scope 분석을 분리한 mock으로 수정했다. 기존 late-internal 시험은 새 scope에서도 자동 분석이 시작되므로 새 결과의 유지와 외부 instance 거부를 검사하도록 갱신했다. 대기 시험은 세션을 종료했고 완료/통과로 세지 않는다.
- 최초 전체 .dev/structure-default-full.log는209 PASS/1 FAIL: 접힌 상세로 옮기며 leaf 안내를 누락했다. Details에 No child modules를 복원했다. 중간 full-final 통과와 최종 full-verified를 별도 보존한다.
- 실제 semantic 추출/Verilator 연산은 이번에 바꾸지 않았다. [이전 부모 로직/시뮬레이션 근거](scope-operations-acceptance.md)를 유지하며 새 UI 변경의 검증과 구분한다.

최종 전체 순차 .dev/structure-default-full-verified.log **211 PASS/0 FAIL/0 SKIP**, 타입 검사 .dev/structure-default-types-accepted.log 및 개발 build .dev/structure-default-build-accepted.log exit0. 새 VSIX/ZIP 패키징·설치 및 사용자 counter 수정 없음. 기존40ms 취소 시험의 병행 부하 timing 제한도 유지한다.

## 다음 실행

연산/저장소·모듈 경계 포트를 간결한 schematic 표현으로 정리하고 fanout/교차 배선과 읽기 좋은 배치를 다듬는다. 그다음 새 기본 흐름을 실제 2×2 화면으로 조작/가독성·Update/취소/복구 수용하고4×4까지 확장한다. generate/instance arrays의 자체 로직 추출, E4B 접근성/browser 비용/복구·연속 hierarchical zoom 및 독립 IDE H/I 별도 논의는 남아 있다.
