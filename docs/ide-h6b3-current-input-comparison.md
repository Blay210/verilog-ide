# H6B3 — 현재 편집 내용 비교·package/header/BOM·복원 (2026-10-12)

최근 실행에 사용한 snapshot과 현재 편집 내용을 비교하는 흐름을 연결했다. 미저장 package/header 조합과 BOM 보존을 실제 앱에서 검증하고, 원본/설정을 복구한 뒤 새 프로세스에서 과거 파형을 다시 열었다. VSIX 변경/배포는 없다. H6/베타 전체 완료로 표현하지 않는다.

## 동작

- Core `compareConfiguredResultInputs`/`compareResultInputs`는 선택적 editor overrides를 동결하고, 기존 source membership·literal include/header·settings/content fingerprint를 그대로 재사용한다. document version이 달라도 bytes/settings가 같으면 matching이다. 기록 source 변조·지원 불가 include 등은 비교 불가다. tool environment 또는 simulation 성공 여부의 보증은 아니다.
- `SimulationResultView.inputs`는 디스크에 저장된 입력 비교, `currentInputs`는 디스크+최근 캡처한 편집 내용을 적용한 비교다. 현재 편집 내용은 실행 snapshot과 일치하지만 디스크와는 다른 상태를 동시에 표현한다. 미저장 TOML은 비교/실행에 적용하지 않는다.
- host는 editor revision으로 오래된 검사 결과의 게시를 막고, 겹친 요청을 후속 검사로 모아 최신 buffers를 비교한다. 프로젝트 재읽기 시 buffer cache를 초기화한다. 저장된 설정 오류는 두 비교를 모두 unavailable로 바꾼다.
- GUI는 dirty/content 변경을 debounce하여 Run과 같은 UTF-8 입력 수집 경로를 사용한다. 비교 중에는 ‘입력 비교 중…’, 같은 편집 내용은 ‘현재 편집 내용 일치 · 미저장’, 다른 입력은 ‘△ 실행 후 변경됨’으로 표시한다. 비교 오류는 matching으로 남기지 않는다. 디스크와 다르다는 설명은 tooltip에서 분리한다.
- 이전 실행을 선택한 행에는 최신 run의 비교 결과를 붙이지 않고 ‘이전 실행 · 현재 입력 비교 미실시’를 명시한다. 과거 개별 run의 buffer 비교와 직접 소스 보기 UX는 후속 단계다.
- **BOM 수정:** TextFile model은 BOM을 인코딩 metadata로 따로 보관해 `getValue(..., true)`만으로 BOM이 나오지 않는 경우가 있었다. `utf8bom`이면 text 앞에 BOM을 한 번만 포함한다. Run/비교 모두 같은 수집 경로를 사용한다.

## 검증

| 범위 | 실제 결과/근거 |
|---|---|
| 최종 전체 회귀 | **144 PASS/0 FAIL/0 SKIP**, runtime/language build. `ide/.dev/h6b3-complete-tests.log/.exit0` |
| 내용 비교 | 동일 text/다른 document version matching·추가 편집 changed·빈 overrides의 디스크 비교·host saved/current 분리·invalid config unavailable |
| 경쟁 조건 | gated 검사 중 최신 buffer 요청/요청 객체 후속 mutation: 오래된 검사 게시 없이 최신 matching. `tests/simulation-host.test.mjs` 추가 회귀 |
| 본체 | 공식 source emission2파일0 errors/exit0 `.dev/h6b3-bom-emit.*`; 공식 TS7 전체 타입0 errors/exit0 `.dev/h6b3-bom-types.*`. 적용 전 owned/upstream hash 및 중간 버전 previousSha256 검증 |
| 실제 trusted 앱 | **3시나리오 PASS/exit0**, `.dev/h6b3-ui-bom.log/.exit0`, fixture의 `h6b3-comparison-receipt.json/exit.json/host.log` |
| 새 프로세스 | **1시나리오 PASS/exit0**, `.dev/h6b3-restore.log/.exit0`, fixture 최신 `receipt.json/exit.json/host.log` |

전용 환경은 `ide/.dev/import-ui-dbJf2o`의 사용자 승인 trust를 재사용한다. 실제 명령/IPC/renderer 수용이며 물리 마우스/DPI 수용은 아니다. `tests/native/editor-comparison.cjs`와 `scripts/verify-import-ui.mjs verify-editor-comparison|verify-editor-comparison-restore`로 재현한다. 검증의 저장 설정 복구는 기존 관리 Apply를 사용한다.

실제 앱: 임시 package/header를 자동 탐색·관리 Apply로 등록→dirty TOML Run 차단/무쓰기→미저장 package/header/DUT/TB 4개로 **VALUE10 PASS**→기록 header의 UTF-8 BOM bytes 확인→현재 편집 내용 일치 표시→package 추가 편집 changed→같은 text 복원(새 version) matching→내장 VCD 열기→owned edit만 revert·임시 원본 삭제·원형 TOML/RTL/TB bytes 복구. saved 비교는 changed로 남고 current 비교는 matching임을 확인했다.

재시작: 임시 package/header와 dirty buffers가 없어도 **4파일 미저장 provenance와 동일 VCD bytes**가 복원되고 실제 viewer의 rows/aligned를 확인했다. 새 실행은 없으며 history29를 보존했다. 최신 검증 run은 `daadbc74-5126-4d8a-87b8-1b4bc2347901`, fixture의 `h6b3-retained.json`이 restart checkpoint다. 임시 파일은 프로젝트에서 없어졌고 복사본은 해당 run `.rtl/` 안에 유지된다.

## 실패·보완·복구 근거

1. 처음 임시 package의 timescale 누락으로 slang 등록이 거절됐다. 모든 design element에 같은 timescale을 넣고 검증이 오류를 즉시 확인하도록 보완했다. `h6b3-first-*` 보존, 원본/설정 복구.
2. 다음 실제 실행은 성공했으나 BOM byte 확인에서 제품 수집 결함을 발견했다. 위 BOM 수집 보완으로 해결했다. `h6b3-second-*`와 BOM 없는 과거 run을 보존했다.
3. 이때 검증 cleanup이 자동 추론된 `rtl` include root를 계속 보존해 원형 TOML byte 확인도 실패했다. 이는 기존 관리의 include 경로 보존 정책이며, 검증이 원래 include 목록을 명시적으로 복원하도록 수정했다. 직전 H6B2 checkpoint의 manifest hash와 알려진 단일 변경을 대조한 후 **관리 Apply**로 복구했다. 임의 TOML overwrite를 하지 않았다. 최종 native 기록의 `recoveredKnownIncludeRoot:true`, 최종 원형 hash/bytes 확인·정상 종료. history27→28(초기 BOM 검사 실행)→29(최종 수정 실행).

## 남은 작업/인수인계

H6의 실제 미저장 Run·snapshot·자동 trace·현재 내용 비교와 package/header/BOM·restart provenance의 기본 경로는 수용했다. 다음은 **H6C: 과거 run의 보관 소스를 읽기 전용으로 열기/이전 run 선택 UX**를 먼저 구체화하고 구현한다. 파형이 생성된 시점의 소스와 현재 코드를 혼동하지 않게 해야 한다. 이전 run 개별 비교는 전체 history를 매 타이핑마다 재분석하지 않도록 명시적 요청/한정 비용으로 설계한다.

UTF-8 이외 인코딩 거절 UI·untitled/deleted/foreign file 세부 UX는 자동 보호와 별도로 추가 실제 수용이 필요하다. 저장된 파일/설정의 완전한 원자적 파일시스템 snapshot, 중간 규모의 비교 비용·종료/복원·물리 UI, clean Windows 설치, FST 표시/enum 등의 기존 gate는 유지한다. H6 범위 판정 후 H7에 진입한다. 자체 엔진/Diagram/배포는 별도 합의 범위다. 루트 계획·진행·handoff와 IDE 개발/사용 안내를 함께 갱신한다.
