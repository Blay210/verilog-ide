# H6D — 선택한 과거 실행 입력 비교·소스 차이 (2026-10-12)

Simulation에서 이력을 고른 뒤 **입력 비교**를 누르면 그 실행과 현재 입력을 비교한다. **소스 차이**는 선택한 실행의 읽기 전용 복사본과 현재 파일/편집 내용을 나란히 연다. 새 시뮬레이션·도구 설치·원본 저장은 수행하지 않는다.

## 계약과 보호

- editor-free host `compareRun(name,runId,inputOverrides)`가 buffers를 첫 await 전에 동결하고 해당 history record를 찾는다. saved/current 비교는 기존 Core의 settings·source membership·include/content fingerprint와 기록 검증을 사용한다. 반환 데이터는 name/runId·saved/current 비교 상태/설명뿐이며 host 최신 결과나 history를 바꾸지 않는다. 프로젝트가 도중에 바뀌면 응답을 거절한다.
- Node channel `run-compare`는 명시적인 runId를 요구한다. 현재 프로젝트의 존재하는 history만 비교하고, 잘못된 run·payload는 오류다. 모든 history를 타이핑마다 검사하지 않는다.
- GUI는 한 창에 한 비교 요청만 허용하고, root/input epoch/현재 선택 runId가 그대로일 때만 응답을 표시한다. 파일/dirty/content 변경은 이전 비교를 무효화하고 **비교 후 변경됨 · 다시 비교**를 표시한다. 최신 run의 자동 비교는 유지한다. 가상 보관 소스의 초기 로드는 실제 RTL 입력 편집으로 취급하지 않는다.
- 선택한 run의 saved/current 상태를 분리해 표시한다. 이력 선택만으로 자동 비교하지 않으며, 미저장 TOML이나 실행/다른 비교 중에는 명시적 비교를 막는다. unknown/removed run은 최신 run으로 대체하지 않는다.
- 소스 차이는 H6C의 검증된 목록/읽기 전용 provider를 재사용한다. 왼쪽은 **보관 <runId>**, 오른쪽은 **현재 소스**다. 현재 파일이 없으면 안내하고 새 파일을 만들지 않는다. 현재 쪽은 일반 코드 편집기이므로 사용자 편집은 가능하고, 보관 쪽은 immutable이다. 프로젝트가 선택 도중 바뀌면 열기를 거절한다.
- 최근 결과의 ‘실행 후 변경됨’ 표시는 유지하고, 과거 실행은 ‘선택한 실행과 다름’으로 표현한다. 결과 선택·보관 소스·파형·입력 비교 모두 같은 선택 runId를 기준으로 한다.

## 검증 결과

| 범위 | 결과/근거 |
|---|---|
| 전체 IDE 회귀 | **145 PASS/0 FAIL/0 SKIP**, runtime/language build. `ide/.dev/h6d-tests.log/.exit0` |
| host 회귀 | 두 run의 saved/current 독립 비교·요청 후 buffer 객체 mutation 동결·unknown run 거절·gated 요청 중 프로젝트 전환 거절·최신 결과/history 무변경. `tests/simulation-host.test.mjs` 추가 테스트 |
| 본체 | 공식 emission3파일0 errors/exit0·공식 TS7 전체 타입0 errors/exit0. `.dev/h6d-final-emit.*`, `.dev/h6d-complete-types.*` |
| actual trusted 앱 | **4시나리오 PASS/exit0**. `.dev/h6d-ui.log/.exit0`, `.dev/import-ui-dbJf2o/receipt.json/exit.json/host.log` |

`tests/native/run-comparison.cjs`/`scripts/verify-import-ui.mjs verify-run-comparison .dev/import-ui-dbJf2o`로 검증했다. 과거 정상 저장 run을 선택해 현재 입력 matching→TB 미저장 편집 후 캐시 무효화/재비교 changed→실제 `TabInputTextDiff`에서 보관 원문과 dirty current TB 구분→삭제된 package의 현재 파일을 만들지 않음→원형 복구 후 matching, 최신 runId/history29·원형 TOML/DUT/TB bytes 보존을 확인했다. 전용 창 정상 종료·사용자의 기존 trust와 다른 창 보존. 시뮬레이션 실행 횟수는 증가하지 않았다.

실제 명령/IPC/diff editor 수용이며 물리 마우스/DPI 검증은 아니다. native 검증은 완료된 비교 이후 편집의 무효화를 확인했다. UI 요청이 진행 중일 때의 빠른 선택/편집 전환은 guard를 구현했으나 물리 race 수용은 별도다. Core에서는 gated 프로젝트 전환·요청 동결을 결정적으로 검증했다.

중간 overlay 적용 후 추가 변경의 hash guard는 현재 IDE 소유 중간 버전 hash를 기록하고 재적용했다. 최종 소스에 대한 emission/type 검사를 완료했다. 구현 source/config는 ide 안에 유지하고 vsix/상위 source 의존성을 추가하지 않았다.

## 범위와 다음 작업

H6의 기본 경로(자동 파형, 기존 파일의 미저장 snapshot 실행, saved/current·선택한 과거 run 비교, 읽기 전용 보관 소스·현재 소스 diff, package/header/BOM·보관 기록 복원)를 구현/수용했다. 다음은 **H6 수용표와 잔여 gate를 한 번 정리해 범위를 판정한 뒤 H7 안정화**다. 중간 규모(수백 RTL/수천 신호)의 비교·보관 소스 비용, 종료/복원·물리 화면/키 입력·비UTF8/untitled/deleted 세부 UX가 남는다. clean Windows 설치·FST 내장 표시/enum 등의 기존 열린 gate를 유지한다.

비교는 샘플링한 bytes/settings의 일치이며 tool environment 동일성이나 원자적 파일시스템 snapshot을 보증하지 않는다. 빠르게 바뀌는 외부 파일 이벤트의 전달 지연까지 완전히 제거한 것은 아니다. history는 현재 최근100개 범위이며 정리/대규모 history 처리는 H7에서 평가한다. H6/독립 IDE 베타/배포 전체 완료로 표현하지 않는다. 외부 패키징·설치, 자체 compiler/simulator·Diagram은 이번에 변경하지 않았다.
