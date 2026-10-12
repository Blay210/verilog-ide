# H5G2 — 저장된 폴더 역할 표시·실제 앱 재시작 복원

2026-10-12. **역할 적용 후/새 창의 Explorer 표시 완료. H5/베타 전체 완료는 아니다.**

## 구현과 사용자 경험

폴더 역할을 적용하면 Explorer 아이콘은 계속 표시되고 설명이 ‘적용 전 검토’에서 ‘저장됨’으로 바뀐다. 앱을 종료하고 새 프로세스로 다시 열어도 Code 공간 초기 읽기만으로 복원한다. Simulation 관리 화면에 들어갈 필요가 없다. 기존 ▶ 실행 버튼과 테스트 목록·이력을 유지한다.

검토 규칙과 저장된 규칙/revision을 별도로 비교한다. 역할 변경 초안은 저장 완료로 표시하지 않으며 초기화/새로고침은 기존 관리 정책을 따른다. 실행 원형/가져오기 원형처럼 IDE가 관리할 수 있는 canonical TOML만 저장 역할 출처로 사용한다. 일반 TOML·수동 변경·읽기/비교 실패에서는 저장 배지를 제거하고 설정을 쓰지 않는다. 실행/취소 및 root/revision 변경 중에는 기존 비교 취소·게시 guard를 재사용한다. 미저장 TOML은 실제 저장된 역할 표시를 유지할 수 있으나 역할 변경/적용은 기존 dirty guard로 차단한다.

Discovery의 bounded traversal에 실제 디렉터리 목록을 추가했다. 빈 폴더·제외 폴더 경계도 표시 가능하며 일반 파일을 폴더라고 표시하지 않는다. 링크·.rtl/.git/node_modules는 목록에서 제외한다. 제외 폴더 아래는 탐색하지 않으므로 경계만 표시하고 그 안의 자식 배지를 약속하지 않는다. 기존 파일 override/최장 폴더 역할과 의미 분석·Core 실행을 그대로 사용한다. 새 디렉터리 목록은 semantic 모델이나 합성 hierarchy가 아니다.

## 변경 위치

- ide/runtime/discovery-model.ts, contract.ts: directory inventory·savedFolderRoles IPC 모델.
- ide/runtime/core/discovery.ts: 기존 bounded 디렉터리 탐색에 표시용 목록 수집.
- ide/runtime/host.ts: pending 저장/새 host inspect, managed Apply/refreshInputs의 canonical saved 역할 상태 게시 및 보호 설정 제거. GUI root/revision 취소 경계 유지.
- ide/runtime/folder-roles.ts: draft/saved 비교·상속·실제 폴더 identity 배지 함수.
- ide/src/rtlSimulationHome.ts, rtlExplorerRun.ts: 저장 상태 전달·아이콘 설명 및 이벤트 갱신.
- ide/tests/saved-folder-roles.test.mjs, folder-roles.test.mjs, project-management.test.mjs: 디렉터리/link/빈 폴더·pending 새 host 복원·실행 프로젝트 새 host/수동 TOML 보호 회귀.
- ide/tests/native/saved-folders.cjs, scripts/verify-import-ui.mjs: 저장→정상 종료→새 프로세스 복원→정상 관리 Apply로 원형 복구 수용. ide 내부 의존성만 사용, VSIX/부모 source 접근 없음.

## 실제 검증

| 항목 | 결과·근거 |
|---|---|
| 전체 회귀·runtime/language build | **132 PASS / 0 FAIL / 0 SKIP / exit0**, ide/.dev/h5g2-tests.log/.exit |
| 최종 보강 관련 시험 | **10 PASS / exit0**, ide/.dev/h5g2-focused-final.log/.exit. 전체132 이후 수동 변경/일반 TOML의 saved 상태 제거 assertion2개를 추가해 관련 시험을 다시 수행 |
| owned emission·전체 upstream 타입 | **0 errors / exit0**, ide/.dev/h5g2-compile.log/.exit |
| 실제 앱 저장·새로고침 | **3항목 PASS / trusted:true / exit0**, h5g2-ui-save.log/.exit 및 fixture h5g2-save-{receipt,exit,host} |
| 실제 새 프로세스 복원·원형 복구 | **2항목 PASS / trusted:true / exit0**, h5g2-ui-restore.log/.exit 및 fixture receipt.json/exit.json/host.log |
| verifier/native syntax | 두 script node --check PASS |

실제 저장 검증은 폴더 우클릭 명령의 draft 아이콘→기존 의미 분석 Apply→saved 아이콘·새로고침 유지이다. 정상 종료 후 새 native 프로세스에서는 Code에서 saved 아이콘을 바로 복원했고, 마지막에 원래 roles를 기존 관리 Apply로 복원했다. TOML 원본 bytes·DUT bytes·test 이름·history13 보존을 확인했다. 직접 manifest 덮어쓰기로 복구하지 않았다. baseline은 fixture h5g2-original-completed.json, 이전 H5G1/H5F 근거도 별도 보존했다. 사용자 신뢰/기존 창/프로필 변경·설치·배포 없음. 새 시뮬레이션 실행은 하지 않았고 기존 H5F Verilator/VCD 근거를 이번 실행으로 계산하지 않는다.

이번 실제 검증은 내부 명령/IPC·실제 Explorer DOM 및 서로 다른 app process 수용이다. 물리 우클릭 선택/hover/DPI·규모·실행 중/미저장 조작의 종합 UX는 아직 별도다. bounded 탐색의 기존 디렉터리 교체 경쟁 제한은 유지한다. 창 복원이 전체 Code/파형/이력 상태 복원 완료라는 뜻은 아니다.

## 다음 순서

1. H5 폴더 역할 잔여 수용: 실제 상속/파일 override, 제외·미저장/실행 중 변경 차단과 메뉴 오류 안내. 분류 drag는 파일 이동과 구분하여 별도로 계획한다.
2. H6 자동 dump와 미저장 simulation snapshot. 파일마다 dump 코드를 요구하지 않는 IDE 관리 흐름으로 전환한다.
3. history/복원·clean Windows/실제 설치/FST/enum/대표 규모·물리 UX gate 유지. 베타 배포 판정은 후속이며 이번 패키징 없음.

새 owner는 docs/handoff.md와 이 파일부터 읽는다. owned overlay bytes/previousSha256를 수정 전에 확인한다. 검증 cwd ide, compile-owned.mts cwd ide/upstream. actual modes는 verify-saved-folders/verify-restored-folders .dev/import-ui-dbJf2o. 첫 단계의 미완료 baseline h5g2-original.json이 있으면 덮어쓰지 말고 상태를 확인해 두 번째 managed restore 절차로 복구한다. 현재는 완료 marker이고 원형 복구·전용 창 정상 종료 상태다.

## 후속 최신

H5G3에서 폴더 보호/상속·예외 실제 수용을 완료했다. [최신 기록](ide-h5g3-folder-guards.md)에 따라 다음 H6A 자동 dump prototype을 진행한다.
