# H2J — 소스 진입 시 포커스 정책 보완

2026-10-10. H2I의 source 즉시 입력 실패 추적을 이어갔다. 변경은 독립 `ide/` 소유 contribution/overlay guard/native 시험이며 VSIX·배포물·사용자 문서·기존 개발 창은 변경하지 않았다.

## 재현과 수정

Simulation→소스 열기 이벤트에서 `show('code')`가 이전 active pane을 강제로 focus했다. Code 버튼에 필요한 복귀 동작을 소스 열기에도 적용해, 실제 open 동작의 포커스 정책과 충돌할 수 있었다. 특히 공통 Output이 focused인 상태에서 `showTextDocument(..., preserveFocus: true)`를 호출하면 Output 대신 이전 editor로 이동하는 문제를 native `9rO53F`에서 재현했다. receipt의 `preserveFocusState.focusArea`는 기대 `panel` 대신 `editor`, wrapper/앱 exit1이었다. 첫 실패를 보존한다.

소스 열기/active editor 변경으로 자동 Code 진입할 때는 화면·inert·sidebar 상태만 복구하고 이전 pane의 focus를 호출하지 않는다. 실제 새 pane focus 및 preserveFocus 정책은 기존 editor open 동작이 담당한다. 명시적인 Code 버튼/홈 복귀와 도구 진입의 기존 focus 복귀는 유지한다. 지연·sleep·입력 재시도로 가리지 않는다.

내부 `rtlIde.spaceState`에 실제 DOM activeElement의 영역(`panel`/`editor`/`other`)을 추가했다. 판정에는 문서 내용/사용자 설정을 노출하지 않는다. 공개 API 계약이 아닌 시험 진단이다.

## 검증 결과

| 항목 | 결과·근거 |
|---|---|
| 기존 문제 재현 | `ide/.dev/editor-acceptance-9rO53F/receipt.json`, `h2j-baseline-native.log`; preserveFocus FAIL/exit1 |
| 최종 파일 emission·전체 타입 검사 | pinned upstream `createCompile`/gulp 및 `spawnTsgo`, 0 errors/exit0; `.dev/h2j-final-build.log`, `h2j-final-build-exit.txt` |
| 자동 시험 | 28 PASS/0 FAIL/0 SKIP; `.dev/h2j-tests.log` |
| 실제 앱 회귀 | `wI7osu`, `qvp82r` 각각22항목 PASS/앱·wrapper exit0; 각 fixture의 receipt/exit 및 `.dev/h2j-final-native.log`, `h2j-repeat-native.log` |
| Output focus 보존 | 실제 focused panel baseline→Simulation 소스 open/preserveFocus→Code에서 panel focus 유지 |
| 즉시 입력 반복 | 각 profile에서20 round, 두 group을 교대로 새 소스/같은 active 소스 열기와 즉시 type. 총40 round/80 source 진입·입력. 이전 source의 dirty text/disk 원본 불변; source 열기 후 인위적인 입력 전 대기 없음 |
| 기존 회귀 | 네 Activity Bar 배치 hit target·공통 Output·auxiliary 표시 복원·여러 tab/group·선택/scroll·dirty/disk 및 기존 소스 진입 유지 |

이전 H2I `x6yrg1`의 일반 source type 실패와 이번 preserveFocus 결함이 동일 원인이라고 확정하지 않는다. 이번 수정 뒤 두 profile의 반복 즉시 입력에서 재발하지 않았지만 장기/물리 입력 수용을 대신하지 않는다. 실패 시 active 문서/text/selection·현재 focusProbe 진단을 계속 보존한다.

최종 source/적용 overlay 동일 SHA256을 확인한다. 전체 본체 기반은 H2I 전체 빌드이며 이번 변경 파일만 공식 emission으로 재생성하고 전체 타입 검사를 수행했다. 재현은 `ide/`의 `npm run compile:core`, `npm test`, `npm run verify:editor`; private incremental entry `.dev/h2i-incremental.mts`도 보존했다. 새로운 의존성 설치/패키징 없음.

## 다음 순서와 미검증

H2의 작은 viewport와 floating 버튼의 물리 클릭/겹침, 보조 sidebar view/폭/scroll 상세 수용을 묶어 지원 범위를 판정한다. native DOM hit target 검증은 실제 클릭 수용이 아니다. 그 뒤 H3 언어/Core/toolchain/실행/파형을 `ide/` 자체 소유 코드로 이식한다. 일반 host 간헐 지연/audit·깨끗한 Windows 설치는 H1/배포 gate, 종료/재실행 상태 복원은 H7이다. H2 전체/독립 앱 RTL 실행/베타 완료로 판정하지 않는다.
