# H5G1 — Explorer 폴더 역할 지정·검토 아이콘

2026-10-12. **우클릭→분류 검토 연결과 실제 앱 수용 완료. 폴더 역할 UX 전체/H5/베타 완료는 아니다.**

## 사용자 흐름

Explorer 폴더 우클릭에 RTL 소스 / 테스트벤치 / RTL 탐색 제외 / 역할 지정 해제(상속)를 제공한다. 실제 로컬 프로젝트 폴더만 허용한다. 등록된 IDE 소유 원형 설정은 기존 테스트 관리로 진입하고, 설정 없는 프로젝트는 기존 가져오기 검토를 재사용한다. 기존 일반·수동 변경 TOML은 덮어쓰지 않는다.

선택하면 Simulation 검토 화면으로 이동한다. 분류를 바꾸는 것만으로 TOML 저장·실행·파일 이동을 하지 않는다. 기존 ‘분류 저장’ 또는 ‘테스트 목록 적용’이 저장 경계이며, 적용은 기존 의미 분석/재탐색/검증을 사용한다. 새로고침은 적용하지 않은 초안을 버리고 저장된 프로젝트를 다시 읽는다.

검토 중 Explorer 폴더에 circuit-board / beaker / circle-slash 아이콘을 표시한다. 설명에는 역할·직접 지정/상속·적용 전 검토 상태를 표시한다. 파일에는 폴더 배지를 붙이지 않는다. 하위 폴더는 가장 가까운 명시적 규칙을 상속하며 파일 override와 하위 폴더 명시 규칙은 보존한다. 해제는 현재 폴더 규칙 하나만 제거한다. 이름이나 tb 관례를 명시적 사용자 지정이라고 표시하지 않는다.

**이번 배지는 검토 상태만 표시한다. 적용/재시작 후 저장된 역할을 Code Explorer에서 계속 표시하는 것은 다음 H5G2 작업이다.** 역할 저장/복원 Core 자체는 기존 H5C/E1 기능이다. 드래그 분류, 실행 중 전환·미저장 보호의 새 물리 UI 수용도 아직 전체 완료가 아니다.

## 구현

- `ide/runtime/folder-roles.ts`: editor-free 경로 경계/Windows 비교·최장 폴더 상속·단일 규칙 변경. 기존 discovery-model 타입 재사용. 실제 링크/제외 경계와 파일 override 적용은 기존 Core 탐색이 검증한다.
- `ide/src/rtlSimulationHome.ts`: 실제 file service 폴더 확인, trust/busy/dirty TOML 및 async 상태 재확인, 기존 manage/classify 연결. 수동 TOML 관리 거절 결과는 오류로 안내한다.
- `ide/src/rtlSpaces.contribution.ts`: Code-OSS 내부 Explorer context 메뉴 등록·폴더 명령4개. 기존 Simulation 공간/전체 runner를 보존한다.
- `ide/src/rtlExplorerRun.ts`: 기존 virtual row registry에 검토 역할 아이콘 추가. resource 갱신/dispose와 emitter 상태 전달을 재사용한다. renderer 직접 패치·외부 extension 지원·vsix/부모 코드 import 없음.
- `ide/tests/native/folder-roles.cjs`, `verify-import-ui.mjs verify-folders`: 기존 사용자 신뢰된 전용 fixture에서 명령/IPC/실제 Explorer DOM 배지 수용. 물리 우클릭 메뉴 선택은 별도다.

## 검증 결과

| 검증 | 실제 결과 |
|---|---|
| 전체 회귀·runtime/language build | **129 PASS / 0 FAIL / 0 SKIP / exit0**, ide/.dev/h5g1-tests-final.log/.exit |
| 역할/행 경계 관련 | **6 PASS / exit0**, ide/.dev/h5g1-focused.log/.exit |
| owned emission·전체 upstream 타입 | **0 errors / exit0**, ide/.dev/h5g1-compile-final.log/.exit |
| 실제 앱 | **4항목 PASS / trusted:true / exit0**, ide/.dev/h5g1-ui.log/.exit 및 fixture receipt.json/exit.json |
| native script | node --check PASS |

실제 앱4항목: 파일/프로젝트 밖 폴더 거절, 등록 프로젝트의 관리 진입·후보 역할 반영/TOML·TB·이력 불변, 실제 Explorer 폴더 배지 및 TB 파일 배지 없음, 해제/새로고침 후 기존 runnable tests·history 복원. 이번에는 시뮬레이션을 새로 실행하지 않았다. 기존 H5F 실제 Verilator PASS/VCD 근거는 fixture h5f-{receipt.json,exit.json,host.log}로 별도 보존했다. history13과 원본 파일을 유지하고 전용 창은 정상 종료했다. 신뢰·기존 사용자 창/프로필을 변경하지 않았다.

최초 타입 검증은 await 이후 상태를 TypeScript가 이전 loading 검사로 좁혀 TS2367 오류였다. 최신 diagnostic 상태를 다시 읽도록 보완하고 최종 전체 타입0 errors를 확인했다. h5g1-compile.log 보존. 최초 제한된 환경의 전체 검증에서 기존 외부 slang 관련 여러 실패 및 종료 대기가 발생하여 해당 실행을 중단했고, 실제 도구 실행이 허용된 환경에서 전체129 통과를 다시 확인했다. h5g1-tests.log 보존; 이 실행을 PASS로 계산하지 않는다. 다른 프로세스/설치/신뢰 설정 변경 없음.

## 다음 작업과 인수인계

1. **H5G2 저장된 역할 표시**: 저장/적용 후 및 새 창에서도 Code Explorer 배지 유지. 저장된 roles와 검토 초안을 구분하고 root/revision·수동 TOML 보호를 유지한다. 빈 폴더/제외/link 표시 범위를 검토한다.
2. 역할 변경→저장/적용→재시작의 실제 수용, 상속/파일 override/미저장·실행 중 보호의 물리 UX.
3. H6 자동 dump·미저장 simulation snapshot, 이후 history/복원 잔여 및 기존 clean Windows/실제 설치/FST/enum/대표 규모 gate.

루트 docs/handoff.md와 이 기록부터 읽는다. owned overlay 수정 전 source/upstream bytes 확인 후 previousSha256를 기록한다. ide에서 검증하며 compile-owned.mts는 ide/upstream에서 실행한다. 실제 앱 재현은 `node scripts/verify-import-ui.mjs verify-folders .dev/import-ui-dbJf2o`. 해당 전용 창이 이미 실행 중이면 기존 세션에 합치지 않는다. 배포 패키징/자체 compiler/simulator/Diagram은 이번 작업 범위에 없다.

## 후속 최신

H5G2에서 적용/재시작 후 역할 배지 표시 및 실제2프로세스 수용을 완료했다. [최신 기록](ide-h5g2-saved-folder-roles.md)을 따른다.
