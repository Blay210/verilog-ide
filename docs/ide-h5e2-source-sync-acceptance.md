# H5E2 실제 앱 파일 변경 감지 수용

2026-10-11. **파일 변경 감지·관리 적용 흐름의 실제 앱 수용 완료. H5/베타 전체 완료는 아니다.** 다음 구현은 Explorer TB 실행과 폴더 역할 UX다.

## 실제 수용

사용자가 `가져오기 실행 프로젝트 - RTL IDE` 전용 검증 창을 직접 닫은 후, 이미 직접 신뢰한 `ide/.dev/import-ui-dbJf2o` 프로필을 재사용했다. 기존 다른 창/프로필은 변경하지 않았으며 trust 복사·override·변경을 하지 않았다.

`ide/scripts/verify-import-ui.mjs verify-source-sync .dev/import-ui-dbJf2o`가 독립 개발 앱을 실행하고 실제 파일 watcher·Workbench command·IPC·렌더된 UI를 연결하여 다음 **5항목 PASS / trusted:true / exit0**를 확인했다. 물리 마우스 클릭 수용과는 구분한다.

| 항목 | 확인한 동작 |
|---|---|
| 파일 이벤트만으로 감지 | RTL/header/TB 후보를 디스크에 추가한 뒤 새로고침·관리·inputs 호출 없이 실제 watcher가 상태를 갱신. 화면의 추가/후보 안내·경로 tooltip·변경 확인 버튼 표시. TOML bytes 불변 |
| 미저장 설정 보호 | 실제 TOML 문서 buffer에 미저장 변경을 만들면 안내에 미저장 경고, 관리 명령 거절. 디스크 bytes 불변. 검증용 변경은 Undo로 복원 |
| 명시적 Apply | 기존 두 top 선택으로 source/header 경로 반영→matching·안내 해제. 새 TB 후보는 선택하지 않아 자동 등록되지 않음. 실행 이력 유지 |
| 빌드 중 변경·취소 | 실제 Verilator/C++ 빌드의 g++ 로그를 기다린 뒤 header 삭제. 실행 중 비교는 보류, 실제 Cancel 완료 후 header 삭제 감지. 이전 retained VCD의 reader/run ID/눈금 정렬 유지 |
| 삭제된 등록 source 복구 | 임시 source/TB를 삭제하면 등록 source 누락 감지. 관리 Apply로 임시 입력과 include 설정을 명시적으로 제외. 원형 TOML/원본 두 source의 bytes 복원, 이전 이력·파형 유지 |

최종 fixture는 원래 RTL 한 파일과 두 top이 들어 있는 TB 파일, 원형 TOML이다. 임시 세 파일은 없다. retained history는 이전 9개에 실제 취소 run 2개가 추가된 **11개**다. 실제 waveform은 기존 passing run의 보존 VCD이며, 이번 검증에서 새 passing VCD를 생성했다고 설명하지 않는다. 최종 native에서 실행한 run은 cancelled이며 종료 후 생성물은 `.rtl` 아래에 유지한다. 검증 창은 verifier가 정상 종료했다.

## 근거와 수정 내역

- 최종 `ide/.dev/h5e2-ui-final-2.log/.exit=0`, fixture `receipt.json`의 passed:true/checks5/trusted:true, `exit.json`의 passed:true/code0 및 진단 오류 없음.
- 제품 변경은 화면 진단에 실제 notice 표시/문구/tooltip/관리 버튼 라벨을 노출한 것뿐이다. `ide/.dev/h5e2-ui-compile.log/.exit=0`: 공식 화면 emission·전체 upstream 타입 **0 errors**. verifier/native script 두 개의 syntax check PASS. 기존 전체123 PASS·관련7 PASS는 H5E2 구현 기록의 이전 근거이며 이번에 반복하거나 날짜가 다른 수치를 합산하지 않았다.
- 최초 native는 감지·미저장 보호 두 항목 통과 후, 검증용 helper에 timescale이 없어 실제 slang이 혼합 timescale을 거절했다. `h5e2-ui.log/.exit=1`, fixture `h5e2-failed-timescale-{receipt,exit,host}`를 보존했다. 원형 TOML이 변경되지 않았음을 확인한 뒤 내용이 일치하는 임시 세 파일만 제거하고 검증용 모듈의 timescale을 맞췄다.
- 두 번째 native는 네 항목 통과 후 원형 TOML bytes 비교에서 실패했다. H5E1은 이미 기록된 include override를 유지하므로 임시 header의 `rtl` include 경로가 남아 있었다. `h5e2-ui-final.log/.exit=1`, fixture `h5e2-failed-include-{receipt,exit,host}`를 보존했다. 실제 slang·기존 guarded 관리 Apply로 include 설정만 복구하고, 최종 native의 원형 복원 단계에 `includeDirs: []`를 명시했다. 임의 강제 TOML 덮어쓰기로 문제를 숨기지 않았다.
- H5E1의 이전 성공 receipt/exit/host는 같은 fixture의 `h5e1-{receipt,exit,host}`로 보존했다. H5D3의 보존 기록도 유지한다. 첫 cold 앱 시작에서 extension host 시작 지연/일시 무응답과 network service 재시작 로그가 있었으며 최종 검증 통과를 일반적인 시작 성능 보장으로 설명하지 않는다.

include 자동 추가 값과 사용자 override를 분리해 자동 제거하는 기능은 여전히 후속 개선이다. 이번 검증은 보존 정책에 맞춰 명시적으로 제거한 것이다. 세션 baseline 재시작 한계·bounded 전체 lexical scan·macro 조건 분기의 탐색 불확실성·Run 전 자동 반영 미구현은 [H5E2 구현 기록](ide-h5e2-source-sync.md)과 동일하다.

## 다음 실행자

1. **H5 Explorer/폴더 UX**: 실제 Explorer TB 파일 행 hover Run, 공유 파일의 여러 top 선택, 폴더 역할 우클릭·아이콘 표시·분류 UX. 등록된 실행 대상과 lexical 후보를 구분하고 Core 실행을 재사용한다.
2. H6 자동 dump와 미저장 simulation snapshot. 이후 이력/복원 잔여를 마무리한다.
3. clean Windows 실제 설치·FST/enum·대표 규모·물리 UI/복원 등 열린 gate는 계속 유지한다. 자체 compiler/simulator/Diagram·배포 패키지는 이번 범위가 아니다.

재현은 변경·실패가 있을 때만 위 verifier를 사용한다. 준비된 전용 창이 열려 있으면 사용자가 그 창을 닫아야 하며 기존 다른 프로필/신뢰를 건드리지 않는다. fixture가 원형 canonical 설정이고 임시 파일이 없음을 먼저 확인한다. 실패 시 원인과 현재 설정을 읽고 scoped 복구하며 일괄 삭제/강제 복원을 하지 않는다.

코드: ide/src/rtlSimulationHome.ts(진단), scripts/verify-import-ui.mjs(verify-source-sync 모드), tests/native/source-sync.cjs. Core 동작 변경은 이번에 없다. docs/handoff.md와 이 기록을 먼저 읽는다.

후속 2026-10-12: Explorer 행 실행 H5F 구현·actual5항목 수용 완료. 다음 순서·잔여는 [H5F 기록](ide-h5f-explorer-run.md)을 우선한다.
