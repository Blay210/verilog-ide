> 후속 2026-10-11: 실제 watcher·미저장 보호·Apply·실제 빌드 중 변경/Cancel·원형 복구 **5항목 PASS/exit0**. 다음은 Explorer/폴더 UX다. 현재 수용 근거·실패/보강·제한은 [실제 앱 수용 기록](ide-h5e2-source-sync-acceptance.md)을 먼저 읽는다. 아래는 구현 시점 기록이다.

# H5E2 — 파일 구성 변경 감지와 동기화 안내

2026-10-11. **구현·자동 검증 완료. 실제 앱의 파일 이벤트→안내 표시 수용은 남아 있다. H5/베타 전체 완료가 아니다.**

## 사용 흐름과 적용 정책

IDE가 만든 원형 imported execution v1 프로젝트에서 RTL/package 파일이 추가·삭제되거나 package 분류가 바뀌면 Simulation 홈에 추가/삭제·누락 개수를 안내한다. 세션 시작 후 새로 발견된 simulation top도 별도 후보 개수로 표시한다. header 추가/삭제와 새로운 include 폴더도 비교한다. 테스트 관리 버튼은 **테스트 관리 · 변경 확인**으로 표시한다. 안내에 마우스를 올리면 해당 경로/후보 목록을 볼 수 있다.

확인·적용은 H5E1의 테스트 관리 흐름을 사용한다. 기존 top을 유지하거나 새 후보를 선택한 뒤 **테스트 목록 적용**을 누르면 fresh discovery와 실제 slang 확인 후 설정을 갱신한다. 감지 자체는 읽기 전용이며 source/TOML/실행 이력을 쓰지 않는다. Run 직전에 자동 변경하지 않는다. 경고가 있어도 Run은 현재 manifest에 등록된 저장 코드를 사용한다. 미저장 rtl.toml이 있으면 안내에 먼저 검토하라고 표시하고 관리/적용은 기존 보호 규칙으로 차단한다.

기존 실행 결과의 코드 변경 경고와 이번 **파일 구성 변경** 안내는 서로 다른 정보다. 일반 사용자 TOML은 자동 관리 대상으로 채택하지 않는다. 수동 변경/읽기 실패는 비교 불가로 안내하고 원본을 보존한다. 설정에 등록된 source가 사라져 정상 실행 reader가 실패해도 별도 비교로 삭제/누락을 확인하여 테스트 관리 진입으로 복구할 수 있다.

## 구현

- Core `source-sync.ts`의 lexical inventory 비교는 설정된 common source/package 목록, 등록된 file+top 존재, header 디렉터리와 세션 baseline을 비교한다. 소스 내용의 계산 의미나 top 실행 가능성을 판정하지 않는다. 임시 offset 기반 후보 ID 대신 file+top을 비교하여 앞쪽 코드 편집만으로 새 후보가 되지 않도록 한다.
- Host `refreshInputs`의 기존 stale 비교와 같은 취소/revision/root 경계를 사용한다. 실행·관리·창 종료 중 비교 결과를 늦게 반영하지 않는다. 명시적 Apply 이후 baseline을 다시 초기화한다. 경로 대소문자는 Windows 규칙에 맞추고 top 이름은 대소문자를 구분한다.
- 화면은 파일 이벤트를 500ms로 모으고 `.rtl`, `.git`, `node_modules` 이벤트를 제외한다. 실행·loading·review 중 이벤트는 보류하며 idle/관리 종료 후 재확인한다. 검사 도중 새 이벤트가 들어오면 완료 후 재검사한다. 기존 Code/Simulation 진입에도 재확인을 사용한다.
- 전체 의미 분석이나 manifest 쓰기를 매번 저장할 때 실행하지 않는다. 현재 lexical discovery는 기존 최대 10,000파일/64MiB 한도 안에서 전체 읽기 비교를 하므로 대규모 incremental indexing 완료라고 설명하지 않는다. UI/Node가 Core를 사용하며 VSIX/부모 source 의존성은 없다.

## 검증 근거

| 항목 | 결과 |
|---|---|
| runtime build | PASS, ide/.dev/h5e2-build.log |
| 전체 회귀 + runtime/language build | **123 PASS / 0 FAIL / 0 SKIP / exit0**, ide/.dev/h5e2-tests.log 및 .exit |
| 관리/감지 관련 시험 | **7 PASS**, ide/.dev/h5e2-targeted-2.log. 실제 slang 관리 시험4개와 비교 시험3개. 추가/누락/top/header/package 분류·Apply 후 matching·원본 bytes 보존·기존 history/name 보호 |
| 첫 공식 화면 emission / 전체 upstream 타입 | **0 errors / exit0**, ide/.dev/h5e2-compile.log 및 .exit |
| 최종 화면 보강/수동 설정 보호 | **전체 upstream 타입 0 errors / exit0**, h5e2-compile-final.log/.exit; **관련7 PASS / exit0**, h5e2-targeted-final.log/.exit |

최종 화면 보강(검사 중 이벤트 재확인/버튼 안내)과 수동 설정 보호 assertion은 위 최종 근거로 통과했다. 전체 123 시험은 이 화면 보강 전 통과 기록이다. 최초 제한 환경의 `h5e2-targeted.log`는 Windows realpath EPERM 때문에 관리4시험 실패/비교3시험 PASS였고, 동일 범위의 정상 Windows 검증에서 7 PASS를 확인했다. 실패 근거는 삭제하지 않았다.

이번에는 실제 GUI watcher·물리 클릭·새 Verilator 실행을 반복하지 않았다. 직전 H5E1의 실제 Verilator/VCD/GUI 근거를 이번 변경의 신규 수용으로 계산하지 않는다. 사용자가 다시 열어 달라고 한 `import-ui-dbJf2o` 창은 유지하며 신뢰를 변경하거나 창을 닫지 않았다. 현재 열려 있는 프로세스에 새 화면/runtime이 자동 반영됐다고 보장하지 않는다.

## 한계와 다음 순서

1. 실제 앱에서 source/TB/header 생성·삭제→파일 이벤트→안내 표시→관리 적용 후 안내 해제, 실행 중 보류/미저장 설정/기존 파형 보존을 수용한다. 기존 사용자 창을 강제로 닫거나 신뢰를 자동 변경하지 않는다.
2. Explorer testbench 실행, 폴더 역할 우클릭·표시/분류 UX를 연결한다.
3. H6 자동 dump와 미저장 simulation snapshot을 구현한다. 독립 compiler/simulator/Diagram은 이번 범위가 아니다.

후보/header baseline은 세션 메모리이며 저장하거나 복구하지 않는다. 앱 재시작 전에 추가된 미등록 TB top, 동일 include 폴더 안의 header 삭제는 시작 시 baseline 비교로 알 수 없을 수 있다. common source 목록 차이·등록 top 누락·새 include 폴더는 manifest와 직접 비교한다. 의도적으로 미등록 상태로 둔 기존 후보를 계속 경고하지 않는다. macro/conditional 선언·link/읽기 한도 때문에 lexical inventory가 불완전할 수 있어 안내는 의미 분석 성공 보장이 아니다. Run 전 자동 동기화·background TOML 쓰기·영구 inventory/증분 색인·외부 writer/crash lock recovery는 미구현이다. clean Windows/설치/FST/enum/규모/복원/물리 UX gate도 유지한다.

인수인계: 먼저 docs/handoff.md와 이 문서를 읽는다. 코드: ide/runtime/core/source-sync.ts·runtime/host.ts·contract.ts·src/rtlSimulationHome.ts. 시험: tests/source-sync.test.mjs·project-management.test.mjs. owned overlay 수정 전 원본/upstream bytes 확인과 previousSha256 갱신을 유지한다. 검증 cwd는 ide, 공식 compile-owned.mts cwd는 ide/upstream이다.
