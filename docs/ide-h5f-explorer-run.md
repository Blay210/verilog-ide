# H5F — Explorer 테스트벤치 파일 행 실행

2026-10-12. **Explorer 행 실행 구현·관련 실제 앱 수용 완료. 폴더 역할 우클릭/아이콘/분류 UI와 H5/베타 전체는 미완료다.**

## 사용자 동작

Code 공간의 실제 Explorer에서 등록된 테스트벤치 파일 행을 hover하거나 키보드로 focus하면 오른쪽에 작은 ▶ 버튼이 나타난다. 한 파일의 등록 대상이 하나면 바로 실행하며, 여러 top이면 테스트 이름과 top을 표시하는 선택 창을 연다. 선택하면 기존 공통 실행 서비스로 그 대상만 실행하고 Simulation 홈으로 이동한다. 선택을 취소하면 실행하거나 공간을 전환하지 않는다.

Simulation을 먼저 방문하지 않아도 Code 초기화에서 등록된 프로젝트를 읽어 버튼을 표시한다. 파일명 `tb_*`나 폴더 이름 `tb/`로 테스트를 추측하지 않는다. 미등록 파일·폴더·프로젝트 밖 URI에는 실행 버튼을 제공하지 않는다. 실행/취소/관리/설정 loading 중, 비신뢰 프로젝트, 미저장 rtl.toml에서는 버튼을 비활성화한다. 선택 창을 연 뒤 대상 또는 프로젝트 상태가 변경되면 다시 확인하여 오래된 선택으로 실행하지 않는다. 키보드 Enter/Space의 파일 행 열기와 버튼 동작이 겹치지 않도록 이벤트를 분리한다.

현재 파일 식별 기준은 Core가 테스트에 제공하는 **대표 source(첫 test source)**다. imported execution의 file+top 한 파일 테스트는 정확한 대상이다. 일반 TOML에서 여러 test source를 지정했고 실제 top이 첫 파일에 없으면 실제 선언 위치를 의미 분석으로 찾아 버튼을 배치하는 기능은 아직 없다. GUI 기존 소스 이동도 동일 대표 source를 사용한다. 이 제한을 전체 프로젝트 TB 자동 식별 완료라고 설명하지 않는다.

## 구현 경계

- `runtime/test-files.ts`는 editor/Node import 없는 exact path 비교 함수다. 프로젝트 경계·Windows 대소문자/경로 구분·여러 top을 다루며 저장된 테스트 모델을 사용한다. Core 언어/시뮬레이터를 새로 구현하거나 VSIX/부모 source를 참조하지 않는다.
- `src/rtlExplorerRun.ts`는 Code-OSS의 기존 내부 `explorerFileContribRegistry`를 사용한다. Explorer renderer 파일을 직접 수정하거나 전체 복사하지 않았다. virtual row의 resource 갱신/편집 모드/폐기 수명에 맞춰 버튼과 listener를 관리한다. 버튼은 22×20px, 등록된 행만 우측 공간을 예약하며 hover/focus에 표시한다.
- `RtlSimulationHome.startFile`은 현재 대상 조회→필요한 경우 QuickPick→상태 재확인→기존 start/IPC 경로를 사용한다. 자체 Core의 실제 실행과 결과 이력을 재사용한다. `RtlSpaces`가 명시적 실행에 한해 Simulation 이동을 연결한다.
- `rtlIde.simulation.runFile`은 파일 실행 명령이며, `rtlIde.explorer.state`/`activateRun`은 내부 행 상태/실제 DOM click 수용 경로다. 외부 extension 설치 지원을 추가한 것은 아니다.
- 등록 정보나 실행 가능 상태가 바뀔 때만 행 event를 통지한다. virtual row마다 listener를 소유/폐기하며 정상 row pool을 위한 유한 leak threshold를 사용한다. 이번 변경을 대규모 성능 수용이라고 설명하지 않는다.

## 검증

| 항목 | 근거 |
|---|---|
| 전체 자동 회귀·runtime/language build | **126 PASS / 0 FAIL / 0 SKIP / exit0**, ide/.dev/h5f-tests.log/.exit. 신규 exact file 비교3시험 포함 |
| 최종 화면 emission·전체 upstream 타입 | **0 errors / exit0**, ide/.dev/h5f-compile-final-2.log/.exit |
| verifier/native syntax | 두 script `node --check` PASS |
| 실제 앱 | **5항목 PASS / trusted:true / exit0**, ide/.dev/h5f-ui-final-2.log/.exit 및 fixture receipt.json/exit.json |
| 실제 실행 | actual row DOM click→여러 top QuickPick에서 두 번째 선택→**tb.second 실제 Verilator PASS + nonempty VCD**. 실행 중 Code 왕복에서 실제 행 disabled, 완료 후 활성화, 미등록 DUT 직접 실행 거절 |

실제 앱 5항목은 (1) Code 초기화만으로 등록 TB 행의 22px action·focused 표시/다른 행 숨김, (2) 실제 버튼 click·여러 top 선택 창/취소 무실행·Code 유지, (3) 실제 미저장 TOML 편집 시 기존 행 disabled/활성화 거절·Undo/디스크 불변, (4) 두 번째 top 단독 실제 실행·VCD, (5) 종료 후 활성화/미등록 파일 거절/원본 source2·TOML bytes 불변이다. Workbench/DOM click·QuickPick command 수용이며 **물리 마우스 hover/click·Tab/Enter 조합·DPI/좁은 Explorer 수용은 별도**다. 단일 대상 바로 실행 분기는 exact-target 자동 시험과 구현 근거이며, 이번 native는 여러 top 파일을 실행했다.

기존 사용자 창/프로필/신뢰를 변경하지 않고 사용자가 직접 신뢰한 `ide/.dev/import-ui-dbJf2o` 전용 프로필을 사용했다. 최종 전용 창은 정상 종료했다. retained history는 이전11개와 이번 두 native에서 생성한 PASS2개로 **13개**다. 예전 결과/입력/VCD를 삭제하거나 덮어쓰지 않았다. 생성물은 `.rtl` 안에 보존하며 원본 파일을 수정하지 않았다. H5E2 성공 근거는 fixture의 `h5e2-{receipt,exit,host}`로 보존했다.

## 발견·보완한 문제와 실패 근거

1. 최초 upstream 타입 검사는 명령의 unknown URI 인자 때문에 1 error였다. 명시적인 URI 입력 검증/타입을 추가하여 전체0 errors를 확인했다. `h5f-compile.log/.exit=1`과 중간 성공 `h5f-compile-final.log`를 보존했다.
2. 최초 native는 행 표시·선택 취소2항목 통과 후 미저장 TOML 상태가 기존 행에 반영되지 않았다. Code-OSS Emitter의 threshold **0은 비활성화 옵션이 아니라 listener 거절을 유발**함을 실제 source에서 확인했다. 정상 virtual row pool을 수용하는 유한1024 threshold/name으로 수정했다. `h5f-ui.log/.exit=1`, fixture `h5f-failed-listeners-{receipt,exit,host}` 보존. 최종 native에서 여러 기존 행의 상태 전환을 다시 확인했다.
3. 두 번째 native는 위3항목과 tb.second 실제 PASS/VCD를 수행했으나 숨긴 Explorer의 virtual row가 계속 존재한다고 가정하여 undefined.disabled 오류가 났다. 정상 view 폐기에 맞춰 실행 중 Code를 다시 열어 살아 있는 행을 확인하도록 시험을 보완했다. 실패 시 실행 Cancel/정리를 기다리는 finally도 추가했다. 이미 PASS 결과가 보존된 후 종료 확인에 남은 **전용 테스트 main의 executable/profile/extension 인자를 확인하고 그 tree만 종료**했으며 다른 창은 건드리지 않았다. `h5f-ui-final.log/.exit=1`, fixture `h5f-failed-hidden-row-{receipt,exit,host}` 보존. 최종 native는 강제 종료 없이 exit0.

전체126 자동 검증은 최종 browser 이벤트 설정 보강 이전 결과다. 해당 보강 이후 공식 전체 타입0 errors와 actual native5 PASS를 확인했으며 자동 시험을 반복했다고 쓰지 않는다. 실패 근거를 삭제하거나 수치를 합산하지 않는다. 검증이 남긴 정확한 미저장 TOML 편집은 격리 fixture에서 원본 bytes+고정 시험 문자열임을 확인한 경우에만 정상 Revert로 복구한다. 임의 사용자 편집은 자동 취소하지 않는다.

## 다음 순서 / 인수인계

1. **H5 폴더 역할 UX**: 우클릭 RTL/Simulation/제외 역할 지정과 아이콘/배지 표시. 상속/파일 override/설정 저장 정책을 기존 관리 흐름과 연결한다. 분류 drag는 파일 이동과 구분한다.
2. H6 IDE 자동 dump와 미저장 simulation snapshot, 이후 이력/복원 잔여.
3. clean Windows/실제 설치/FST/enum/대표 규모/물리 UI gate 유지. 자체 compiler/simulator/Diagram·배포 패키징은 이번 범위가 아니다.

먼저 docs/handoff.md와 이 기록을 읽는다. 코드는 ide 내부에서만 관리한다. owned overlay 변경 전 source/upstream bytes 확인·previousSha256 갱신을 유지한다. 검증 cwd ide, compile-owned.mts cwd ide/upstream. actual 재현은 변경·실패가 있을 때만 `node scripts/verify-import-ui.mjs verify-explorer .dev/import-ui-dbJf2o`. 전용 프로필이 이미 실행 중이면 새 시험을 기존 창에 합치지 않는다. 재현 전 상태/실패 근거를 확인하고 필요하면 사용자에게 전용 창만 닫도록 요청한다.
