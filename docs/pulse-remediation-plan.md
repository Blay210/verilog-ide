# Pulse 제품 보완 실행 계획 (2026-10-14)

현재 우선 작업은 [설정·최근 목록 후속 정리](pulse-settings-refinement.md)다. 최신 개발 빌드에 반영했고 관련38 PASS/타입0. 사용자 직접 화면 확인 후 추가 피드백 또는 화면 승인, 이후 Setup 순서를 유지한다.

**실제 사용 피드백 우선:** 시작 화면/최근 프로젝트·Simulation 설정 통합·TB native picker/외부 복사·Pulse SVG out/빠른 준비 앱 launch를 보완했다. 관련36 PASS·build/type0, 물리 UI/실제 startup은 새 확인이 남는다. [현재 보완과 실행 순서](pulse-start-simulation-ux.md). Setup은 사용자 직접 검증 후 요청 때 진행한다.

**복원 후속 완료:** editorGroups.whenRestored/초기 inspect join을 보완하고 관련26 PASS·본체 타입/owned emission0 errors, 실제 자동 Simulation/동일 파형/선택 신호/600ps 재시작 복원을 확인했다. 최신 개발 앱은 `ide/Start-Pulse.cmd`; 사용자가 직접 검증한 뒤 문제가 없으면 Setup을 진행한다. 이번 복원 화면 세션은 종료했다. 아래 ‘재확인 대기’는 이전 단계다.

**현재 우선순위:** 승인된 Pulse Dev 물리 세션에서 개별 PASS/새 VCD/홈·탭·커서 정렬·공간 왕복/재시작 파형 상태는 확인했다. 마지막 작업 구역의 자동 Simulation 진입은 미수용: shutdown 초기 공간 보존/종료 이벤트 전환·late mount 보호를 추가하고 실제 contribution 4건 포함 복원 관련24 PASS, 전체 본체 타입/owned emission0 errors를 확인했다. 수정 후 화면 재시작은 별도 승인을 받은 다음 세션에서 확인한다. 새/빈/기존 프로젝트 준비 UI·일반 VCD routing·F5·다중 root·외부 도구·설치 수용도 남는다. [현재 검증 범위](pulse-remediation-validation.md). 기존 Setup/ZIP은 보완 전 파일이고 새 배포는 만들지 않았다. 아래 중간 상태/미검증 기록은 이 최신 결과로 대체한다.

## 새 기준과 실행 원칙

사용자가 승인한 보완 범위는 [직접 VSIX 대조](pulse-vsix-parity-audit.md)의 제품 기능 gap과 [IDE 감사](pulse-current-product-audit.md)의 TOML/프로젝트 생성·열기/Simulation UX다. 제공 기능은 VSIX + α를 기본으로 하되 **Diagram와 Counter 예제 등 검증용 기능은 제품에서 제외**한다. 검증 fixture·개발용 계측은 유지할 수 있지만 시작 화면·제품 메뉴·설치판에 사용자 기능처럼 노출하지 않는다. 내부 진단/API 자체를 무조건 삭제하지 않고 실제 제품의 사용 경로 여부로 dead API를 판정한다.

기존 사용자 소스/일반 TOML/설정·프로필/열린 창은 보존한다. IDE 관리 설정은 승인된 생성/가져오기에서 만들고, 이후 저장된 폴더 역할·사용자 제외/수동 등록을 기준으로 추적한다. 자동 변경은 목록·설정 관리이며 자동 compile/run이 아니다. Core/CLI/GUI는 같은 정책을 사용하고 ide는 vsix를 runtime/build input으로 참조하지 않는다.

사용자 지시에 따라 **전체 보완 뒤 마지막 통합 검증**으로 모은다. 중간 단계는 구현/문서화이며 테스트나 화면 검증을 반복하지 않는다. 필요한 검증 시나리오는 누적 기록하고 ‘구현/미검증’을 분리한다. 마지막 비화면 build/typecheck/회귀→필요한 실제 도구 실행→사전 사용자 승인된 화면/설치 세션 순서다. 이 작업 중 Setup/ZIP을 갱신하지 않으며 검증 후 새 후보를 준비한다.

## 제품 흐름

- 프로젝트가 없으면 Pulse 시작 화면에 **새 프로젝트 / 기존 프로젝트 열기 / 최근 프로젝트**만 먼저 제공한다. 마지막 작업 복원은 유지한다.
- 생성은 이름/위치로 빈 프로젝트 폴더와 rtl/tb·관리 설정·.gitignore를 준비한다. Counter/example을 넣지 않는다. 기존 파일 덮어쓰기 금지.
- 기존 폴더는 자동 탐색 요약과 **프로젝트 준비**로 시작한다. 명확한 TB 후보를 기본 선택하고 모호한 후보/특수 include만 필요할 때 확인한다. 분류 저장·top 확인·등록을 별도 사용자 단계로 강요하지 않는다.
- 유효한 기존 프로젝트는 바로 홈을 연다. 일반 사용자 TOML을 자동 관리 문서로 강제로 채택하지 않는다. 잘못된 설정은 복구/편집을 안내하며 소스를 조용히 재구성하지 않는다.
- 빈 폴더는 간결한 생성/준비 안내를 보여주며 disabled 실행/빈 이력/고급 import 화면을 동시에 펼치지 않는다.
- 준비된 Simulation 홈은 테스트 실행·선택·최신/과거 결과를 중심으로 유지한다. 분류/include/defines/고급 설정은 프로젝트 설정에서 연다. 파형은 기존 내부 UX를 유지한다.

## 순서·완료 기준·진행 표

| 순서 | 범위 | 완료 기준 | 상태 |
|---|---|---|---|
| A | 프로젝트 생성/열기·최소 개입 TOML·준비/고급 설정 분리·import grid | 새/빈/기존 무설정/유효 설정/불량 설정 각각 자연스러운 진입, 원본 보호, 기본 TB 선택·한 번 등록, 겹침 없음 | 구현 연결·미검증 |
| B | dead 실행 경로·F5/editor Run·Code 유지·TB 표시 이름·theme | 실제 등록 대상의 공통 실행 진입, 복수 top 선택, 실행 완료로 공간 이동 없음, 내부 hash는 ID로만, semantic scope fallback | 구현 연결·미검증 |
| C | 파형 연결: 일반 VCD/GTKWave/FST/fallback/enum | 기존 외부 VCD도 viewer 진입, viewer 설정·도구 공유, recorded enum이 실제 metadata에 연결, 안전한 fallback | 기본 파일 routing 포함 연결·비화면 검사 진행/화면 대기 |
| D | 실행·결과: 태그/병렬/전체 이력/제거 TB 결과 | Core/GUI 동일 selection/jobs, 로그·취소·snapshot 격리, 전체 history에서 과거 소스/파형 접근 | 구현 연결·미검증 |
| E | 도구 관리·제품 CLI·package-order 실행 경로 | 폴더 선택/기존 update, CLI init(예제 없음)/check/test/history/tools·project/tag/jobs/cancel codes, 자동 package provider 실제 연결 | launcher/자산 경로 포함 구현 연결·미검증 |
| F | 작업 복원·자동 source 정책·다중 root | 명시적 active project와 독립 상태/결과·tools 경계, 재시작 공간/파형 selection 복원, source/TB 역할·제외 추적 | root 제거/복원 race 보완·비화면 검사 진행/화면 대기 |
| G | 제품 표면 정리·규모/이력 안내·문서 | Counter/검증 메뉴 제거·미지원 기능 안내·필요한 고급 설정만 노출, 기본 debug와 RTL 실행 혼동 제거, dead API 재감사 | 제품 표면/지원 안내 연결·화면 대기 |
| V | 마지막 통합 검증·새 배포 후보 | 전체 build/typecheck·실제 회귀/도구/초기 이용 상태·승인된 UI/설치 수용과 미검증 명시 후 새 Setup/ZIP | 비화면 최종 통과; 화면/설치/새 패키지 미실시 |

단계 E의 자동 package-order는 기반 실행 기능이다. 구현 중 호출 경로를 확인해 현재 SimulationService의 ‘not ported yet’ 차단과 provider 미연결도 직접 보완해야 한다. 공통 export가 있다는 것으로 완료 처리하지 않는다.

## 마지막에 실행할 수용 목록

1. 새 프로젝트의 한글/공백 경로·이미 존재하는 파일/취소/읽기 전용·선택 폴더 외부 보호·원본 hash.
2. 처음 연 무설정 DUT/TB·빈 폴더·일반 TOML·IDE 설정·수동 변경/충돌·불량 설정·untrusted/dirty 설정.
3. 기본 TB와 복수 top 등록/자동 추가·삭제·제외/복원, 일반 RTL/package/header·include 변경, 명시적 실행 전 tool calls0.
4. UI의 compact 준비/설정/정상 홈 상태, import row 긴 이름·좁은 폭/테마·keyboard 접근성, 완료 후 Code/선택 파형 보존.
5. F5/Explorer/editor button·태그·jobs1/2/4·FAIL/timeout/취소·cleanupFailed·전체/제거 TB 이력.
6. 임의 VCD·보관 VCD·FST/external·도구 부재/거절·enum matching/unknown/width/도구 실패·reader 정리.
7. CLI의 모든 비Diagram 동작/exit codes·GUI/Core 결과 비교, 자동 package ordering 실제 분석·원본 무변경.
8. 다중 root/재시작·고해상도/그룹 drag/긴 절대시간·대표 실제 설계/RSS, Setup install/upgrade/uninstall은 실제 가능한 범위와 미확인을 구분.

깨끗한 Windows PC/VM 부재는 계속 별도 제한이다. Counter fixture는 개발 테스트에서만 쓰며 설치판의 사용자 기능에는 포함하지 않는다. 마지막 화면 세션은 자동 시작하지 않고 사용자 확인을 받는다.

## 이번 작업 인수인계

현재 문서를 기준으로 순차 구현한다. 구현이 진행된 항목은 상태/파일/미검증을 함께 갱신한다. 이전 release 수용 기록은 새 코드 수용으로 재사용하지 않는다. 완료 전 ‘VSIX + α 달성’이나 ‘안정판’으로 표현하지 않는다.

### 현재 구현 연결 내역 — 아직 검증하지 않음

- A: `runtime/core/workspace-project.ts`의 빈 프로젝트 생성/기존 빈 폴더 초기화, exclusive 생성·이름/실제 경로 보호·rtl/tb/README/.gitignore/관리 TOML. 시작의 새/기존/최근 프로젝트와 한 번의 프로젝트 준비, 고급 분류 화면 분리, import 파일/폴더 전용 grid. Counter 추가 없음. DUT-only도 도구 설치 없이 설정 생성; 추가 include/defines 검증·보존. 자동 테스트 등록과 일반 소스/package/header 갱신은 untouched IDE 관리 문서만 Core에서 읽기 시 반영한다. 일반/수정 TOML은 보존한다.
- B: 등록된 실제 TB만 F5/편집기 제목 Run에 연결; 기존 Explorer 실행 재사용·복수 top 선택. Code에서 실행해도 강제 Simulation 이동 없음. 자동 이름의 해시는 내부 identity로 유지하고 `file.top` 표시; 언어 manifest의 module semantic scope fallback 유지.
- C: `waveform-host.ts` 일반 VCD reader, 제품 파형 파일 선택/Explorer 우클릭, 내장/GTKWave 설정·FST 외부 전환·사용자가 고르는 오류 fallback·내장 파형 GTKWave 버튼. 원본 VSIX MIT adapter를 독립 경로에 복사해 외부 spawn 경계를 연결했다. 기록 파형은 기존 snapshot/hash 검증을 유지; 일반 파일은 recorded=false로 분리하고 테스트별 보기/보관 소스를 연결하지 않는다. recorded enum은 보관 입력 재검증→slang hierarchy→정확한 path/width 매핑→metadata에 연결; 15초 상한, 실패 시 숫자와 경고. 파형 reader 최대4·parser 한도는 유지. **일반 파일을 더블클릭했을 때 기본 뷰어로 열리는 editor resolver는 아직 잔여**다.
- D: tags/jobs가 SimulationService→host→IPC→GUI로 연결됐다. 태그는 모두 일치하는 Core 정책, 기본 순차/선택2·4, 실행 옵션 접기. 실행 이력 QuickPick은 명시적으로 최근 최대1,000개를 읽으며 목록 제외 TB도 로그/보관 소스/파형에 접근하고 재실행은 현재 등록 TB만 제공한다. 과거 기록을 열 때 최신 파형으로 바꾸지 않는다. 현재 홈 history100 제한과 별도 전체 이력1000 제한을 구분한다.
- E: GUI `SimulationService`의 auto package-order ‘not ported’ 차단을 제거하고 실제 semantic dependency provider를 연결했다. `runtime/cli.ts`를 GUI와 같은 Core/SimulationService로 연결하고 개발 launcher를 교체했다: init(예제 없음), check/명시적 tool smoke·source-order, test name/all/tag/jobs, history/limit/verify-inputs, tools/명시적 --yes, project/tools-directory/JSON, 취소130. CLI도 auto package provider를 사용한다. prepare-runtime에 독립 `rtl-cli.cjs` 번들 생성 경로를 추가했으며 **실제 배포 폴더용 launcher와 안내는 잔여**다. 도구 설정 UI에서 공유 저장 폴더 선택/프로젝트 밖 보호/글로벌 설정, 관리 MSYS2만 업데이트하는 별도 승인 계획을 연결했다. 재사용하는 시스템 설치는 업데이트 대상으로 바꾸지 않는다. 모든 새 경로 미검증.

아직 새 코드의 typecheck/build/tests/실제 도구/화면 검증을 실행하지 않았다. 이전 Setup/ZIP은 이번 보완 전의 기존 베타이며 변경하지 않았다. 소스 overlay의 알려진 기존 해시를 먼저 보존했고 upstream 적용/번들 생성도 마지막 비화면 검증 때 한다.

빈 프로젝트의 추가 dead 경로도 보완했다: built-in 언어 패키지가 RTL 파일을 연 경우에만 활성화되면 첫 Simulation 화면의 도구 설정 명령이 미등록일 수 있었다. setupTools/setupLanguage/restartLanguage의 명시적 activation event를 추가했다. 실제 extension host 최초 실행은 마지막 수용에서 확인한다.

현재 V 비화면 통합 검사를 시작했다. A~G의 UI/IPC/CLI 계약과 실제 source-only/new managed project·auto package ordering·enum/fallback·orphan history·jobs/tag·tool update 승인/취소·다중 root/재시작 수용을 확인한다. 첫 가져오기32 top 분석 상한, 내장 trace32MiB/기록 외부128MiB, 자동 include 폴더 삭제/수동 설정 구분은 지원 고지에 유지한다.

### C/F/G 마무리 및 V 시작

**최종 비화면 결과:** 전체356건:355 PASS/0 FAIL/1 POSIX SKIP·exit0, runtime/language build0, 최종 전체 본체 타입/owned emission0 errors, 독립 CLI bundle8 checks PASS, 실제 Verilator 자동 VCD/FST/CLI/취소·FAIL8 checks PASS, 새 관리 프로젝트 실제 package provider→Verilator→recorded enum metadata3 checks PASS. 제품 정책·script syntax·git diff 검사도 통과했다. 화면/설치와 새 배포는 아직 하지 않았다. [최종 근거·실패/복구·미수용](pulse-remediation-validation.md). 아래의 진행 중 표시는 중간 검사 기록이다.

- C: guarded native editor resolver patch는 ready Pulse에서 일반 local VCD/FST open을 Simulation으로 보내고 정상 ABORT 결과로 텍스트 탭 생성을 건너뛴다. explicit Open With/복합/diff/merge/untitled 및 다른 Code-OSS 제품은 기존 동작을 유지한다. 명령 등록 전 startup routing은 fallback 상태이며 마지막 화면 수용에서 확인한다. 외부 기록 파형은128MiB streaming hash 검증으로 메모리 전체 보관 없이 연다. parser32MiB 한도와 분리했다.
- F: workspace 마지막 root 제거 시 host reset/reader/cache 정리, 실행 중 root 제거는 종료 후 다시 읽기, 현재 root 밖 선택 거절을 연결했다. metadata 실제 write도2MiB로 제한하고 이전 root/비활성 wave 순으로 줄이며 tab DOM 순서를 보존한다. 복원 중 닫은 tab의 늦은 reader는 mount하지 않고 정리하도록 수정했다. headless 실제 Home adapter의 지연 복원/긴 cursor/탭 순서/자동 Run·외부 viewer0/늦은 닫기 회귀를 추가했다.
- G: TB folder/file/제외 복원은 홈의 접힌 목록 관리로 이동, 첫 빈 TB 안내 정리. Pulse에서 native Debug/Testing view container 진입을 제거하고 RTL F5가 기본 debugger로 빠지지 않도록 공통 실행 명령으로 묶었다. 서비스/숨겨진 진단 명령을 개발용으로 남기며 Counter 메뉴/예제 생성은 제품에 추가하지 않았다. [제품 범위/한도](../ide/PRODUCT_SCOPE.md), [CLI](../ide/CLI.md), 기존 배포와 보완 소스의 차이를 BETA 안내에 기록했다.
- V: runtime/language build exit0, source/language/waveform/CLI 자산 준비 exit0. 초기 overlay 보호 실패는 upstream 파일2개가 Git HEAD 원본과 byte-identical함을 확인한 뒤 알려진 이전 hash만 등록하여 복구했으며 보호를 비활성화하지 않았다. 첫 본체 전체 타입7 errors는 IPC 필드와 async input validator를 수정, 재검사 전체0 errors/owned emission0 errors exit0. 마지막 source 반영 후 타입 검사를 다시 진행 중이다.
- 최초 sandbox 전체 검사는 realpath/junction EPERM과 승인 대기 fixture 정지로 중단했다. 동일 discovery와 workspace metadata를 정상 Windows 권한에서9 PASS로 확인했다. 새 프로젝트 entry2 PASS. 정상 Windows 전체 첫 검사351건:331 PASS/19 FAIL/1 POSIX SKIP. 실패는 old import package-order expectation1, 새 Home 모듈 mock16, 기존 강제순차 기대2였다. 정책/fixture를 명시적으로 보강하고 CLI 빈 tag 출력 backward compatibility를 보완했다. 관련20 PASS, Home 복원 포함18 PASS, 실행/실제 병렬 격리 포함12 PASS; 이 결과는 전체와 합산하지 않는다. 최종 전체 회귀를 `pulse-remediation-tests-final.log`에 다시 기록 중이며 아직 완료로 간주하지 않는다.
- 화면·native 앱 launch·설치·배포는 하지 않았다. 기존 Setup/ZIP은 그대로다. 최종 비화면 통과 뒤 새로 승인받은 한 화면 세션에서 first entry/import/grid/F5/TB/다중 root·restart/일반 VCD·FST·enum/Debug·Testing 제거와 실제 도구/설치 수용을 확인한다. clean Windows 환경 부재는 별도 제한이다.

### 이번 추가 연결 — E/F, 미검증

- `prepare-cli-launcher.mjs`는 다음 명시적 build-beta에서 `bin/pulse-rtl.cmd`를 생성한다. 별도 Node 설치 없이 Pulse.exe의 Electron Node 모드로 자체 `rtl-cli.cjs`를 실행한다. 기존 CLI/시스템 PATH는 변경하지 않고 알 수 없는 launcher를 덮어쓰지 않는다. 공식 배포 resource에 CLI asset를 추가하는 별도 additive patch와 verify-beta 필수 파일을 연결했다. [CLI 안내](../ide/CLI.md). 실제 build/package는 아직 실행하지 않았다.
- Simulation 홈의 프로젝트 선택은 열린 로컬 workspace root만 선택한다. 이전 선택을 복원하며 실행/파형 열기 중·미저장 TOML 보호를 유지한다. 전환 시 이전 프로젝트 reader/iframe을 정리하고 보관 소스 cache와 비교 상태를 분리한다. 프로젝트 전환은 자동 compile/run하지 않는다.
- `workspace-state.ts`는 Node/VS Code 의존 없는 화면 metadata 파서다. workspace storage에 최근20 root, root별 최대4 파형 탭, 선택 TB/이력/jobs, 선택 신호/순서·radix·색·bus expansion·정확한 decimal cursor/time range를 보존한다. 입력2MiB/선택32/decimal40자리 등 한도를 검증하며 source/trace bytes나 tool 정보를 저장하지 않는다. metadata 회귀 테스트를 추가했지만 실행하지 않았다.
- BlockRestore provider 초기화 순서를 유지하며 공간은 native workspace storage로 복원한다. 비활성 파형은 placeholder 탭만 만들고 선택 시 reader를 연다. 이전 active 파형은 Simulation에 들어왔을 때 내장 reader로 복원하며 외부 GTKWave/시뮬레이션을 자동 실행하지 않는다. 기록 파일의 신뢰·hash 검증을 다시 사용하고 없어졌거나 손상되면 오류를 표시하며 자동 재실행하지 않는다. generic VCD는 현재 파일을 다시 읽는 경로로 보관 provenance와 구분한다.
- 잔여: 일반 파일 기본 editor routing, 복원 탭의 순서/취소·root 제거·상태 저장 race·선택 상태와 semantic multi-root 경계 종합 확인, 제품 검증용 표면/기본 Debug 혼동/한도/이력 관리 안내 정리. 사용자 요구대로 아직 이번 보완의 build/typecheck/tests/화면/설치를 실행하지 않았다.
