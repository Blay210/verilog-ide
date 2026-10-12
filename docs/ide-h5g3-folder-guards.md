# H5G3 — 폴더 역할 상속·예외·실행/미저장 보호 수용

2026-10-12. **폴더 역할의 명령/IPC/실제 앱 보호 검증 완료. 다음 구현은 H6이다.** 물리 우클릭 메뉴 선택/DPI/대표 규모 및 H5/베타 전체 완료를 선언하지 않는다.

## 발견한 경계와 보완

Explorer 폴더 역할 명령에 생성물·Git·의존성 폴더(.rtl/.git/node_modules)의 지정 거절을 추가했다. 하위 경로와 Windows 대소문자도 고려한다. 실제 file service의 isSymbolicLink로 직접 링크 및 링크 아래 폴더를 거절한다. 탐색은 원래 해당 경계를 건너뛰었지만 명령에서 명확한 이유를 먼저 안내하도록 보완했다. 사용자 소스/설정/runner 및 폴더 역할 저장 계약은 유지한다.

미저장 rtl.toml·실행/로딩/비신뢰 차단, 실제 프로젝트 폴더 확인, async 이후 상태 재확인은 기존 경로를 사용한다. 단일 폴더 변경·해제는 하위 명시 규칙과 파일 override를 보존한다. 제외 폴더는 탐색 경계이므로 그 아래 파일을 개별 override로 되살리는 것은 지원하지 않는다. 파일 override는 탐색하는 폴더 내에서 우선한다. 디렉터리 검사 후 외부 교체 경쟁을 완전히 제거한다고 주장하지 않는다.

변경 파일: ide/runtime/folder-roles.ts, ide/src/rtlSimulationHome.ts, ide/tests/folder-roles.test.mjs, ide/tests/native/folder-guards.cjs, ide/scripts/verify-import-ui.mjs. 모든 코드/의존성은 ide 내부이며 배포 패키징·설치·신뢰 변경 없음.

## 검증

| 항목 | 결과 |
|---|---|
| 전체 자동/runtime·language build | **133 PASS / 0 FAIL / 0 SKIP / exit0**, ide/.dev/h5g3-tests.log/.exit |
| owned emission·전체 upstream 타입 | **0 errors / exit0**, ide/.dev/h5g3-compile.log/.exit |
| 실제 앱 | **4항목 PASS / trusted:true / exit0**, ide/.dev/h5g3-ui.log/.exit 및 import-ui-dbJf2o/receipt.json·exit.json |
| verifier/native syntax | 두 script node --check PASS |

실제 앱 검증은 다음을 수행했다.

1. 실제 편집기로 TOML에 고정 시험 주석을 미저장 삽입→폴더 명령 거절/관리 진입 없음/디스크 불변→Undo로 복구.
2. 실제 Verilator tb.first 빌드의 g++ 로그를 확인→폴더 명령 거절→Cancel/idle/취소 이력 확인. 이전 VCD bytes와 원형 TOML을 보존했다.
3. .rtl, 실제 Windows junction, junction 아래 실제 폴더의 역할 명령을 거절하고 관리 진입 전에 안내했다.
4. 전용 임시 디렉터리의 상속·하위 source 규칙·파일 simulation override·excluded 경계를 실제 관리 탐색/Explorer DOM 아이콘으로 확인했다. 폴더 지정/해제 후 파일 예외·하위 제외 규칙과 TOML bytes가 유지됐다.

이 검증은 내부 명령 호출/actual editor/IPC/DOM이며 물리 메뉴 선택 검증은 별도다. GUI 전체 자유 조작이 검증됐다고 표현하지 않는다. 정상 종료/프로세스 정리 및 임시 소유 폴더/junction 삭제를 확인했다. 삭제 경로를 fixture 프로젝트 하위 절대 경로로 확인했고 junction은 비재귀적으로 제거했다. 원형 TOML 불변, 이전 결과/파형 보존, history는13→14(취소1 추가)이다. 기존 사용자 창/프로필/신뢰를 건드리지 않았다. H5G2 복원 근거는 fixture h5g2-restore-{receipt,exit,host}로 별도 보존했다.

## 다음 실행 순서

**H6A 자동 dump prototype부터 시작한다.** ide/runtime/verilator/index.ts는 현재 --trace/--trace-fst와 RTL_WAVEFORM/RTL_FST defines를 제공하지만 테스트벤치의 $dumpfile/$dumpvars 작성이 필요하다. 현재 IDE 자동 dump가 구현됐다고 설명하지 않는다.

1. 원본 수정/regex 삽입을 전제로 하지 않고 Verilator에서 별도 instrumentation/top wrapper 또는 전용 생성 harness 경로를 소규모로 비교·실제 검증한다. 단일/다중 top·timescale·포트·계층 경로·assert/timing 보존을 확인한다.
2. 사용자는 dump 코드를 쓰지 않는 기본 경로, VCD/FST/off, 기존 dump 중복/파일명 정책을 확정한다. 생성물은 .rtl 아래, Core/backend 경계를 유지한다.
3. H6B 저장/미저장 입력 snapshot과 source identity/mapping을 연결한다. 사용자 buffer/파일 자동 저장 없음, 실행 도중 편집은 보존 입력을 바꾸지 않음.
4. GUI/CLI 동일 입력의 결과 일치·실제 내장 파형 열기·실패/취소/이전 결과 보존 수용. 이후 H7 종료/재시작/대표 규모 gate.

분류 drag는 실제 파일 이동과 구분하여 별도 후속 UX로 유지한다. clean Windows/실제 설치/FST viewer/enum/대표 규모/물리 UI gate도 열려 있다. 자체 compiler/simulator/Diagram과 배포는 이번 범위가 아니다.

인수인계: docs/handoff.md와 이 기록을 먼저 읽는다. owned overlay 수정 전 source/upstream bytes와 previousSha256를 확인한다. 실제 재현은 ide에서 `node scripts/verify-import-ui.mjs verify-folder-guards .dev/import-ui-dbJf2o`. 이미 전용 창이 실행 중이면 다른 세션에 합치지 않는다. 이번 최종 전용 창은 정상 종료했고 원형 설정/소스는 보존됐다.

## 후속 최신

H6A1 실제 자동 trace prototype 비교를 완료했다. [최신 기록](ide-h6a1-managed-trace-prototype.md)에 따라 다음 H6A2 기본 실행 연결을 진행한다.
