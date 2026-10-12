# H6C — 실행 당시 보관 소스 읽기 전용 보기 (2026-10-12)

Simulation 결과/이력에서 **보관 소스**를 눌러 해당 run의 RTL/package/header를 고르고 Code 공간에서 읽기 전용으로 연다. 테스트 이름 버튼은 기존처럼 현재 파일을 연다. 결과 선택과 보관 소스 runId를 함께 고정하여 현재 코드로 대체하지 않는다. 첫 사용에는 도구 설치/새 시뮬레이션이 필요하지 않다.

## 구현

- editor-free `SimulationHost.recordedSources/recordedSource`: 현재 프로젝트의 검증된 history에서 name/runId를 찾고 `loadRecordedInputs`로 기록된 설정·파일 경계·content hash·provenance를 검증한다. 보관된 `.v/.sv/.vh/.svh` 목록만 제공하며 선택된 파일을 다시 hash 확인하고 UTF-8 텍스트로 읽는다. 원본 소스의 존재를 요구하지 않는다.
- Node channel에 source-list/source-read를 추가했다. 임의 절대 경로·현재 소스 fallback은 없다. 기록 없는 run/비등록 파일/변조된 snapshot은 오류다. 기존 version1 snapshot 계약을 그대로 사용한다.
- GUI는 선택한 결과의 runId를 이용한다. 파일 목록의 ‘미저장 입력’/‘저장된 입력’ 설명, 탭의 ‘보관 <runId>’, 테스트 이름·읽기 전용 description으로 현재 파일과 구분한다. no result/busy 행에서는 버튼을 비활성화한다. 직접 명령 `rtlIde.simulation.recordedSource(name, runId?, file?)`도 같은 검증 경로를 사용한다.
- IDE 소유 `rtl-run-source` 가상 파일 provider는 Readonly capability와 파일 permission을 제공하며 쓰기/삭제/이름 변경을 거절한다. 검증된 text를 창 단위로 캐시하고 readFile은 복사본을 반환한다. 캐시 합계64MiB, 개별 보관 입력은 기존32MiB 한도를 따른다. URI만 다시 여는 경우에도 cache miss는 Node 검증을 거친다. 초기 프로젝트 읽기를 요청하며 새 창의 현재 프로젝트 범위를 벗어난 run은 읽지 않는다.
- 읽기 전용 문서는 일반 RTL syntax 등록을 사용한다. 실제 URI scheme은 file이 아니며 원본 프로젝트 파일이나 기록된 입력 파일을 편집 가능한 경로로 노출하지 않는다. 현재 source/Simulation 왕복·기존 파형 UI는 유지한다.
- Simulation의 오래된 ‘저장된 코드만 실행’ 안내 문구를 실행 시점의 편집 내용 보존/보관 소스 안내로 수정했다.

## 검증

| 범위 | 결과/근거 |
|---|---|
| 최종 전체 회귀 | **144 PASS/0 FAIL/0 SKIP**·runtime/language build. `ide/.dev/h6c-final-tests.log/.exit0` |
| host 입력 검증 | 원본 수정/삭제 후 동일 retained text·미저장 분류·잘못된 file/run 거절·snapshot 변조 거절. `tests/simulation-host.test.mjs` 기존 의미 있는 회귀에 추가 |
| 본체 | 공식 emission3파일0 errors/exit0·공식 TS7 전체 타입0 errors/exit0. `.dev/h6c-final-emit.*`, `.dev/h6c-final-types.*` |
| 실제 앱 | 최초3시나리오 PASS/trusted:true/exit0. `.dev/h6c-ui.*`, fixture의 `h6c-first-receipt.json/exit.json/host.log` |
| 새 프로세스 보강 | 최종3시나리오 PASS/trusted:true/exit0. `.dev/h6c-ui-final.log/.exit0`, fixture 최신 `receipt.json/exit.json/host.log`. 초기 프로젝트 읽기 보강 후 다시 열기·typing/write 거절·파형/원형 보존 확인. 기본 fixture는 `ide/.dev/import-ui-dbJf2o`, 기존 사용자 trust 재사용 |

`tests/native/recorded-source.cjs`/`scripts/verify-import-ui.mjs verify-recorded-source`는 실제 QuickPick을 받아 삭제된 원본 `rtl/h6b3_pkg.sv`를 **VALUE8**·SystemVerilog 문서로 연다. 타입 명령으로 내용을 넣어도 dirty/text가 바뀌지 않으며 provider write가 거절되고 retained bytes가 유지된다. 동일 run의 TB(**y===10**)와 내장 파형을 공간 왕복으로 열고 잘못된 소스 요청 거절·원형 TOML/RTL/TB·history29 불변을 확인한다. 시뮬레이션/도구 설치를 추가 실행하지 않았다. 실제 명령/IPC/renderer 수용이며 물리 마우스·키 입력/DPI 수용으로 표현하지 않는다.

## 한계와 다음 단계

목록 조회 시 전체 retained input 검증을 수행한다. 큰 프로젝트에서 반복 조회 비용과 cache 한계/탭 정리는 H7 성능 수용이 필요하다. 이미 연 문서는 당시 검증한 내용으로 유지하고 원본/기록 변경을 따라 자동 새로고침하지 않는다. 캐시 limit 도달 안내는 제공하지만 자동 eviction은 없다. Save As로 별도 복사하는 일반 편집기 동작을 막지 않는다.

UTF-8/BOM 보기만 제공한다. byte/hash 검증을 통과해도 UTF-8로 해석할 수 없는 source는 오류이며 현재 파일로 바꾸어 열지 않는다. 소스 목록은 기록된 compilation context 범위이며 현재 파일·파형 signal의 정확한 선언 위치/줄·semantic 지원을 연결한 기능은 아니다. 가상 scheme의 내장 lexical syntax와 실제 파일의 의미 분석은 구분한다.

현재 내용 비교는 최근 run만 수행한다. 이전 run을 선택하면 ‘비교 미실시’ 안내를 유지한다. **다음 H6D는 명시적으로 선택한 이전 run의 입력 비교 요청과 과거/현재 소스 탐색 UX**를 한정 비용으로 보완하고 H6 범위를 판정한다. 이후 H7 종료/복원·중간 규모·물리 UI/encoding 등의 기존 잔여 gate를 진행한다. 독립 앱 베타/배포 완료, clean Windows 설치 완료, FST/enum 완료를 주장하지 않는다. VSIX/자체 엔진/Diagram은 변경하지 않았다.
