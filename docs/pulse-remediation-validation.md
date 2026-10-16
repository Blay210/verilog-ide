> 2026-10-15 최신: [첫 조회 비용·Simulation UI 지연 구성·독립 로컬 built 실행본](pulse-performance-final.md)을 적용했다. 전체405 PASS/1 POSIX SKIP와 후속8 PASS·공식 bundle/파일/CLI를 확인했다. 기존 Setup은 이전 버전이며 최신 실행은 `ide/Start-Pulse.cmd`다. 실제 새 화면/Windows startup·부분 compiler 증분은 잔여다. 아래의 소스 개발 실행/모든 첫 조회 비용 미보완 설명은 이전 기록이다.

# Pulse 보완 통합 검증 (2026-10-14)

현재 설정·최근 목록의 추가 사용자 피드백 보완은 [후속 기록](pulse-settings-refinement.md)을 우선 읽는다. 최근 목록 X/설정 직접 표시·설명·제외 전체 복원·아이콘/버튼 스타일, 관련38 PASS/타입0이며 새 물리 UI는 미확인이다. 아래 이전 근거를 새 설정 화면의 수용 완료로 재사용하지 않는다.

**최신 추가:** 사용자 실제 사용 사진에 따른 시작·Simulation UX 보완은 [별도 기록](pulse-start-simulation-ux.md)을 우선 읽는다. 관련36 PASS·runtime/language build·전체 본체 타입/owned emission0 errors. 새로운 화면 수용은 미실시이며 이전 물리 복원 결과를 새 UI 수용으로 재사용하지 않는다. prepared --check11.1ms와 Core 프로젝트 생성26.6/8.9/8.8ms는 실제 앱 화면 지연을 입증하지 않는다. Setup 미변경.

대상은 [보완 계획](pulse-remediation-plan.md)의 A~G 소스다. 기존 배포 Setup/ZIP 또는 깨끗한 Windows 설치를 이 결과로 수용 완료 처리하지 않는다. 모든 화면 확인은 별도 사용자 승인 후 한 세션으로 모은다.

| 검사 | 실제 결과 | 근거 |
|---|---|---|
| IDE runtime/language build | 각각 exit0 | npm build:runtime/build:language |
| guarded overlay·language/runtime/waveform/CLI 자산 | exit0 | applyPatches/prepareLanguage/prepareRuntime |
| 최종 본체 전체 타입 및 owned emission | 0 errors/exit0 | ide/.dev/windows-integrated/pulse-remediation-types-final.log |
| 최종 Windows 전체 회귀 | 356건:355 PASS/0 FAIL/1 POSIX SKIP, exit0; 약414초 | ide/.dev/windows-integrated/pulse-remediation-tests-final.log |
| 실제 생성한 standalone RTL CLI 번들 | 8 checks PASS/exit0, 도구 실행 없음 | verify-remediation-cli.mjs; init/check/history/오류 코드·한글/공백·원본 보존 |
| 본체 제품 정책 | 설치/사용자 확장 차단·명시적 debugger 보존·기본 inspector 제외·언어/agent/CLI 정책 PASS | verify-policy/verify-host-policy/verify-language-policy/verify-cli-policy |
| scripts 문법·git diff 공백 | exit0 | build-beta/prepare-cli-launcher/prepare-runtime/rtl, git diff --check |
| 실제 Verilator/Core/CLI 자동 파형 | 8 checks PASS/exit0 | ide/.dev/windows-integrated/pulse-remediation-verilator.log |
| 새 관리 프로젝트 실제 package provider→Verilator→enum metadata | 3 checks PASS/exit0 | ide/.dev/windows-integrated/pulse-remediation-host-final.log |
| 물리 화면: 개별 실행·새 VCD·탭·커서·공간 왕복 | 확인 | 아래 20:41~20:52 전용 개발 창 세션 |
| 물리 화면: 재시작 파형 복원 | 확인; 마지막 작업 구역은 보완/재확인 필요 | tb.first/first.y/600ps 복원, 최초 Code 표시 |
| 새 후보·설치 수용 | 미실시 | 기존 배포물 미변경 |

추가로 신규 프로젝트2 PASS, discovery+bounded workspace state9 PASS, 가져오기/보관 소스 관련20 PASS, late restored tab close/긴 cursor/지연 복원 포함 Home18 PASS, 병렬 격리 포함 서비스12 PASS를 확인했다. 별도 검사이며 최종 전체에 합산하지 않는다.

## 실패와 복구

- 최초 제한된 검사 환경은 전용 .dev 폴더의 Windows realpath/junction 작업을 EPERM으로 거절했다. 승인 계획을 기다리는 fixture도 진입하지 못해 정지하여 해당 소유 검사를 중지했다. 같은 discovery+metadata9개를 정상 Windows 권한에서 통과시킨 뒤 전체 검사를 다시 실행했다. sandbox 오류를 제품 오류로 조용히 고치거나 파일 경로 보호를 삭제하지 않았다.
- overlay 보호는 declaration/package 원본2개의 해시 기록이 오래되어 실패했다. upstream bytes가 Git HEAD의 동일 파일과 byte-identical임을 확인하고 알려진 이전 SHA만 추가했다. 모든 anchor/hash 보호 유지, 임의 파일 덮어쓰기 없음.
- 첫 본체 타입7 errors는 IPC의 새 parent/options/limit/request 필드와 native input validator의 Promise 계약을 반영해 해결했다. 현재 전체0 errors/owned emission0 errors다.
- 첫 정상 Windows 전체는351건:331 PASS/19 FAIL/1 SKIP였다. import 순서의 옛 manifest 기대1, 새 workspace-state import/DOM fixture 미반영16, 기존 강제 jobs1 기대2였다. managed project의 실제 auto package 정책과 source 무쓰기 보존을 검사에 반영하고, 순차 검사는 jobs1을 명시하며 별도 실제 두 build 격리/결과 순서 회귀를 추가했다. CLI 빈 tags 필드 출력은 이전 JSON 호환성을 유지했다.
- 복원 중 사용자가 닫은 tab의 reader가 늦게 응답하면 다시 mount될 수 있는 경쟁도 보완했다. 실제 Home adapter gate 회귀가 reader 해제/미부활을 확인한다.

## 아직 수용하지 않은 항목

첫 시작·새/빈/가져오기/일반·손상 TOML, 실제 native editor 기본 VCD routing(명령 등록 전 startup 포함)/Open With, import 긴 이름 grid/DPI/테마, F5·TB hover·Code 유지, 다중 root 제거·재시작·선택/reader 복원, FST GTKWave/enum/tool picker/update 승인·거절, Debug/Testing 제거, 대표 중간 규모 설계·장시간 메모리/반응성, 설치/upgrade/uninstall. 실제 Windows 새 PC/VM은 여전히 없다. 외부 뷰어와 화면은 이번 자동 검사로 확인했다고 표현하지 않는다.

실제 Verilator8 checks는 dump 없는 원형 RTL VCD·CLI 동일 transitions·동일 파일 두 번째 top FST·timing/trace off·시간0 종료/final·$fatal FAIL와 부분 trace·C++ 취소/이전 trace 보존·잘못된 RTL 컴파일 FAIL/원본 경로/.rtl 격리를 확인했다. 예상된 compile/$fatal 실패 로그는 수용 시나리오의 일부이며 검사 자체는 exit0이다.

추가 관리 프로젝트는 새 최소 생성→source/package/TB 자동 추적→실제 package dependency provider→Verilator PASS→기록 VCD reader→IDLE/RUN/DONE enum metadata 연결까지3 checks PASS다. 원형 source/TOML bytes 보존, 생성물 .rtl 격리와 reader 종료를 확인했다. 최초 fixture는 TB에만 timescale이 있어서 slang MissingTimeScale을 반환했고 숫자 fallback으로 안전하게 열렸다. 이 실패 fixture는 보존했다. 일치한 timescale을 각 설계 단위에 지정한 새 fixture로 성공을 확인했으며 오류를 무시하거나 사용자 소스를 자동 수정하지 않았다. Verilator와 slang의 진단 차이는 자체 엔진 통합 전의 실제 제한이다.

비화면 최종 검사 완료. 다음은 새로 사용자 승인받은 통합 화면 세션과 실제 설치 수용이다. 재현 가능한 제품 오류가 나오면 범위를 수정하고 관련 검사를 재실행한다. 확인 전 새 배포를 만들거나 ‘stable/완전한 VSIX + α’라고 선언하지 않는다.

## 승인된 물리 화면 세션 — 부분 수용 (2026-10-14 KST)

사용자 ‘응 바로 진행해보자’ 승인으로 기존 trusted 전용 fixture `ide/.dev/import-ui-dbJf2o`의 **Pulse Dev 소스 빌드**를 20:41경 열고 정상 닫기/재시작까지 20:52경 확인했다. 설치판 수용이 아니다. Computer Use는 이 세션에서 종료했으며 다른 Chrome/Codex 창·프로필·신뢰 설정은 바꾸지 않았다. 정상 닫기 뒤 목록에 Pulse 창이 없는 것을 확인했다.

- Simulation 실제 버튼으로 `tb.first` 실행: PASS, 26,834ms. 실행 ID `ecbdd7f2-62c1-4a72-a72e-9ae89951e035`; 해당 프로젝트 `.rtl/runs/tb.first-<ID>/result.json`으로 대조했다.
- 새 VCD 파형: 2신호/1변화/1ns, `first.y` 선택 값1. 홈은 집 아이콘, 파형 탭은 `tb.first`만 표시하며 실행 ID는 tooltip에만 남는다. 접힌 목록 관리·기존 고급 가져오기 폼이 없는 정상 홈·Debug/Testing 아이콘 제거를 관찰했다.
- 파형 클릭 후 600ps 커서의 ruler/파형 선 정렬 확인. Code→Simulation 왕복 후 같은 탭·신호·커서 유지.
- 정상 종료→같은 전용 환경 재시작→Simulation 진입 후 지연 로딩이 완료되자 같은 실행 탭·`first.y`·600ps 복원. 잠깐 보인 홈/placeholder를 복원 실패로 판정하지 않았다. **재시작 직후 최초 작업 구역은 Code로 보여 마지막 Simulation 공간의 자동 진입은 수용하지 않았다.** 종료 이후 자체 storage의 `pulse.activeSpace`/`pulse.simulation.session.v1`만 읽기 전용 조회해 Simulation 및 activeWave/600 메타데이터를 확인했다. 저장 유실/정확한 발생 시점은 확정하지 않았다.
- source 개발 창은 과거 설치판 검증 프로필을 재사용한다. 로그에 이전 Seti font 절대 URI 접근 거절이 있으므로 테마/아이콘의 설치판 수용 근거로 삼지 않는다. 사용자 설정/캐시를 삭제하지 않았다.

마지막 공간 보호 보완: `RtlSpaces`가 확정된 `onWillShutdown`에서 먼저 현재 공간을 저장하고 shutdown/dispose 중 layout/editor 자동 Code 전환을 막는다. 원래 dispose에만 있던 보호는 다른 서비스 종료 이벤트보다 늦을 수 있었다. 복원 전에 종료하면 기존 공간을 덮어쓰거나 늦게 DOM을 mount하지 않는다. 실제 contribution 회귀4건 포함 복원 관련24 PASS/0 FAIL/exit0: `ide/.dev/windows-integrated/pulse-remediation-restore-tests.log`. 최종 전체 본체 타입/owned emission0 errors/exit0: `pulse-remediation-restore-types.log`. 이 결과는 직전 전체355 PASS/1 SKIP과 합산하지 않는다. 이 보완은 현재 현상의 원인을 확정한 것이 아니며 **보완 후 물리 재시작은 아직 미확인**이다. 새 Computer Use 세션은 다시 승인받아야 한다.

첫 시작·새/빈 프로젝트·TOML 없는 가져오기·손상 TOML, 일반 VCD 기본 routing/Open With, F5/TB hover, 다중 root, FST 외부/enum/tool picker/update, 대표 설계/장시간·새 Setup 설치/upgrade/uninstall은 이번 물리 세션에서 확인하지 않았다. 비화면 통과와 구분하여 잔여로 유지한다. 기존 Setup/ZIP은 보완 전 파일 그대로다.

## 복원 보완 재확인 (2026-10-14 KST)

사용자는 최신 앱을 직접 검증한 뒤 문제가 없으면 Setup을 만들기로 했다. 현 단계에서 새 Setup은 만들지 않는다. 첫 재확인은 종료 보호만으로 Code 최초 진입이 해결되지 않았음을 확인했다. `LifecyclePhase.Restored`만 기다리지 않고 `IEditorGroupsService.whenRestored`까지 기다려 느린 보관 소스 편집기의 실제 복원 이후 마지막 공간을 적용하도록 수정했다. 이후 사용자 승인을 받은 재확인에서는 별도 클릭 없이 Simulation 자동 진입을 관찰했다.

초기 inspect가 이미 진행 중일 때 `enter()`가 이를 기다리지 않아 activeWave 복원이 건너뛰어지는 두 번째 경쟁도 보완했다. `refreshPending`을 join한 뒤 저장된 activeWave를 읽는다. contribution의 held editor restore·Home의 held initial inspection 회귀를 추가했다. 최종 복원 관련26 PASS/0 FAIL/exit0, 전체 본체 타입/owned emission0 errors/exit0. 근거 로그는 같은 `pulse-remediation-restore-tests.log`/`pulse-remediation-restore-types.log`에 최종 결과로 갱신했다. 최초 doctor는 root에서 실행하여 잘못된 상대 경로로 실패했고 ide에서 실행하여 준비 환경 OK를 확인했다. 제품 오류로 판정하지 않는다.

최신 로컬 실행 안내는 `ide/TRY_LATEST.md`, 더블클릭 launcher는 `ide/Start-Pulse.cmd`다. 일반 사용용 개발 프로필과 검증 프로필은 분리한다. 기존 Setup/ZIP은 최신 보완을 포함하지 않는다.

**최종 물리 복원 확인:** 21:10경의 새 프로세스에서 별도 Simulation/파형 클릭 없이 마지막 Simulation과 `tb.first` 기록 파형이 자동 표시됐다. `first.y` 선택·값1·600ps 커서/시간 범위0~1ns·눈금/파형 선 정렬을 관찰했다. 기존 ecbdd7f2 실행을 읽었으며 새 시뮬레이션은 하지 않았다. 전용 창을 정상 종료했다. 사용자가 승인한 두 재확인 범위에서 검사했으며 다른 창/프로필/신뢰는 보존했다. 개발 창의 오래된 프로필은 Developer Tools 창도 함께 복원했으므로 개발 profile 상태와 제품 설치판의 첫 시작 수용을 구분한다. 첫 새/빈/가져오기 프로젝트 및 설치 수용은 여전히 잔여다. 다음은 사용자가 최신 개발 버전을 직접 확인한 뒤 피드백 또는 새 Setup 요청을 주는 순서다.
