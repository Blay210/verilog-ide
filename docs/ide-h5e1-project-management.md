# H5E1 — 등록 후 테스트 관리와 적용 시 source 재탐색

2026-10-11. **이번 관리 흐름 구현·수용 완료. H5 전체/베타 완료는 아니다. background 파일 변경 추적은 H5E2로 남는다.**

## 사용 흐름

Simulation 홈의 **테스트 관리**를 누르면 현재 폴더를 다시 탐색하고 등록된 top을 미리 체크한다. 새 테스트를 체크하고 제거할 테스트를 해제한 뒤 **테스트 목록 적용**을 누른다. 적용 시 실제 slang으로 선택한 top과 package 순서를 재검증하며, 현재 역할에 맞는 RTL/package/header 목록을 다시 작성한다. 새로고침으로 관리 화면을 취소할 수 있다. 확인/탐색만으로는 TOML을 변경하지 않는다. 기존 source code와 retained run/파형은 지우지 않는다.

현재 설정은 IDE가 생성한 **변경되지 않은 imported execution v1**만 관리한다. 일반 사용자 TOML이나 수동 수정한 설정은 자동 채택/덮어쓰기하지 않는다. `rtl.toml`에 미저장 변경이 있으면 GUI 관리/적용을 거절한다. 신뢰하지 않는 프로젝트는 관리·의미 분석을 하지 않으며 설치도 자동 실행하지 않는다. 기존 실행 흐름은 일반 TOML에서도 유지된다.

이번 source 자동 반영은 **사용자가 관리 목록을 적용할 때**다. 파일 변경 이벤트마다 source 목록을 자동 저장하거나 Run 직전에 갱신하는 동작은 아직 없다. 새로운 TB top도 후보로 찾지만 사용자가 선택해 등록한다. 후보는 lexical 발견이며 실제 slang 확인 전에는 실행 가능성을 보장하지 않는다. file/folder 역할과 추가 include/defines를 유지한다. 자동 header include 경로가 사라졌으면 추가 설정에서 경로를 조정해야 한다.

## 구현과 보호 정책

- Core `readImportedExecution`은 생성 marker, 엄격한 schema, role comment와 byte-for-byte canonical serialization을 검사한다. 기존 source의 존재 여부를 여기서 검사하지 않아 삭제된 파일 때문에 실행 reader가 실패해도 관리 진입으로 복구할 수 있다. 임의/수동 수정된 TOML의 범용 편집기는 아니다. FST/timeout 등 고급 설정을 사람이 바꾸면 현재 canonical 관리에서는 제외된다.
- 동일한 `import-review.lock`과 revision 확인, linked/hardlinked/oversize/read-only 보호, `.rtl` temp sync→rename 경로를 재사용한다. 저장 직전 fresh discovery/semantic analysis를 다시 수행하며 cached preview를 저장 권한으로 삼지 않는다. 다른 창/외부 편집 때문에 revision이 달라지면 기존 데이터를 보존한다. 비협력 writer의 최종 검사/rename 경쟁 및 crash lock recovery 제한은 이전과 같다.
- 등록된 file+top이 유지되는 동안 기존 test name을 유지한다. 나중에 같은 basename/top 후보가 추가돼도 기존 이력/preset 키를 갑자기 바꾸지 않고 새 테스트 쪽을 구분한다. 모든 테스트를 제외하는 것도 허용한다. 선택한 top이 없으면 hierarchy elaboration은 하지 않지만 common input 관찰/package dependency 경로는 유지한다. 삭제 후 재등록/복잡한 rename의 영구 ID 체계는 후속 범위다.
- 적용 후 Core manifest reader와 retained history를 다시 읽어 남은 테스트의 최신 결과를 복원한다. 제거된 테스트의 run 디렉터리/history를 삭제하지 않는다. 이미 열린 파형 reader도 유지한다. 관리 중 Run을 비활성화하며 취소/창 종료는 기존 discovery cancellation/close 경로를 사용한다.
- GUI/Node IPC에 `manage`와 `rtlIde.simulation.manage`를 연결했다. `DiscoveryReview.execution`은 현재 이름/소스/include/defines의 UI 초기값이다. Core·Node 모델은 VS Code API를 참조하지 않는다. VSIX/상위 source imports·workspace links·배포 패키징 없음.

## 실제 검증

| 항목 | 결과/근거 |
|---|---|
| 전체 자동 회귀 + runtime/language build | **120 PASS / 0 FAIL / 0 SKIP**, ide/.dev/h5e-tests.log, .exit=0 |
| 신규 관리4시험 | 실제 slang 추가/제외·새 package/module/header·package 우선 순서·defines 유지·zero tests·기존 run/name 보존, 수동/일반 TOML/stale/컴파일 오류 보호, 삭제 source 복구/같은 basename 추가, 취소/lock/read-only/temp 정리 |
| CLI 보강 후 관리4시험 재검증 | **4 PASS / exit0**, ide/.dev/h5e-management-tests-final.log. 적용 후 `rtl check`가 같은 tb.first/tb.third를 반환함. run backend는 이 Core 시험에서 대체하므로 실제 simulator 증거와 구분 |
| 공식 overlay emission + 전체 upstream 타입 | 최종 **0 errors / exit0**, ide/.dev/h5e-compile-final-2.log. 첫 전체 검사 h5e-compile.log도 PASS. 중간 compile-owned를 ide cwd에서 잘못 호출해 실패한 h5e-compile-final.log를 보존했으며, 지정 cwd ide/upstream에서 재검증 |
| trusted 실제 IDE | **4항목 PASS / exit0**, ide/.dev/import-ui-dbJf2o/receipt.json, exit.json 및 ide/.dev/h5e-ui.log/.exit=0. 실제 command/IPC/renderer 수용이며 물리 클릭 UX는 별도 |
| 실제 새 테스트 | additional.third **실제 Verilator PASS + nonempty VCD**, native sandbox rows/눈금 정렬. 기존 tb.first reader 열린 상태에서 새 top/공통 source 추가·tb.second 제외 후 적용; 이후 임시 source/top을 삭제하고 관리로 원형 manifest/source2개 복원. 이전 run8개 + 새 run1개 history9개·reader2개 유지 |

GUI 검증은 사용자가 H5D3에서 직접 신뢰한 전용 fixture를 재사용했다. 신뢰를 복사하거나 변경하지 않았다. H5D3의 이전 성공 receipt/exit/host는 같은 fixture의 **h5d3-receipt.json / h5d3-exit.json / h5d3-host.log**로 보존했다. 기존 사용자 창과 프로젝트를 검증에 사용하지 않았다. 현재 fixture는 원래 두 테스트/원본 bytes/원형 TOML로 복원됐고 새 실행 artifact만 `.rtl` 아래에 남는다.

## 다음 작업 / 인수인계

1. **H5E2 파일 변경 감지·동기화 UX**: 새로운/삭제된 source 후보를 감지하여 관리 적용이 필요한 상황을 표시하고, 자동 반영 시점/동시 실행·미저장 TOML·취소·수동 설정 보존 정책을 구체적으로 연결한다. 이번 explicit apply를 background 자동 관리 완료라고 표현하지 않는다. 파일 저장마다 전체 semantic scan/manifest rewrite를 반복하지 않도록 한다.
2. Explorer testbench 실행/폴더 역할 우클릭·아이콘/분류 drag UX를 연결한다. 여러 top 파일은 각각 독립 테스트를 유지한다.
3. H6 IDE 자동 dump 및 미저장 simulation snapshot. clean Windows/실제 설치/FST/enum/규모/복원/물리 UX의 기존 gate도 유지한다. 독립 compiler/simulator/Diagram은 이번 범위가 아니다.

재현(변경/새 실패가 있을 때만): cwd ide에서 `node scripts/verify-import-ui.mjs verify-management .dev/import-ui-dbJf2o`. 이미 존재하는 managed-helper.sv/additional.sv는 덮어쓰지 않는다. 실패하면 receipt와 생성된 목록을 읽고 상황에 맞게 복구하며 자동 삭제/강제 manifest 복원으로 문제를 숨기지 않는다. native 시험은 scoped temporary source를 생성/제외하고 마지막에 관리 적용으로 복원한다. 이전 snapshot/result를 지우지 않는다.

핵심 파일: ide/runtime/core/import-settings.ts·import-targets.ts, runtime/host.ts·contract.ts·discovery-model.ts, src/rtlSimulationHome.ts·rtlSimulationChannel.ts·rtlSpaces.contribution.ts. 시험: tests/project-management.test.mjs, tests/native/management.cjs. 다음 owner는 docs/handoff.md와 이 기록을 먼저 읽는다.

후속 2026-10-11: H5E2 파일 변경 감지/동기화 안내를 구현·자동검증했다. 현재 순서·실제 UI 잔여·세션 baseline 제한은 [H5E2 기록](ide-h5e2-source-sync.md)을 우선한다.
