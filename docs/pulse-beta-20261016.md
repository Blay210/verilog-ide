# Pulse (beta) Setup 전달 — 2026-10-16

사용자가 최신 편집/프로젝트/시뮬레이션 기능을 포함한 Setup과 배포 구성을 요청했다. 제어판 표시 이름은 **Pulse (beta)**다. 공개 업로드·Git push·실제 설치·Computer Use는 이번 작업에서 실행하지 않는다. 화면 확인은 별도 사전 승인이 필요하다.

## 제품 코드 정리

- `rtlIde.explorer.state`, `rtlIde.explorer.activateRun`, `rtlIde.simulation.state`, `rtlIde.spaceState`를 제품 등록에서 제거했다. DOM 좌표/상태 조회와 테스트용 강제 클릭을 위한 명령이다. Simulation의 검증용 전체 상태 getter와 `[Pulse timing]` console 계측도 제거했다.
- 실제 Run/F5/Explorer 실행·프로젝트 생성/열기·소스 분류/테스트 설정·파형/보관 소스·자동완성 준비/갱신은 유지한다. 언어·도구 오류 확인과 재시도는 제품 유지보수 기능이며 그대로다. Counter 예제 생성/검증 프로젝트 UI는 이미 제품에서 제외돼 있다.
- 기존 native verification helper의 위 상태/클릭 명령 의존은 이제 **역사적 개발 경로**다. 배포 앱에 그 명령을 다시 추가해 화면 검증을 통과시키지 않는다. 새 화면 수용은 승인 후 실제 UI 또는 외부 검증 adapter로 진행하며 이전 native helper 결과를 이번 앱의 화면 수용으로 바꾸어 기록하지 않는다.
- source overlay의 owned/upstream byte 일치를 먼저 확인하고 기존 hash를 이력에 기록한 뒤 정리했다. vsix는 변경/참조하지 않는다.
- 실제 배포 inventory 점검에서 기존 기본 후보에 비활성 개발 확장 `debug-auto-launch` 파일이 남아 있는 것을 추가로 발견했다. 후보 복사에서 debug-auto-launch/API tests/test resolver를 제외하도록 보완했다. 진행 중인 이전 복사 코드로 만든 **선택하지 않은** 후보는 전체 hash 검증 후 해당 폴더를 소유 `.dev/excluded-extensions-*`에 보존 이동하고 전체 inventory/CLI를 다시 검증한다. 설치판/실행 중 앱을 재귀 삭제하지 않는다. release audit는 이 파일들이 남은 후보를 거절한다.

## 설치 구성

`ide/config/release.json`의 버전은 `0.1.0-beta.20261016`, Setup 파일은 `Pulse-Setup-windows-x64-beta-20261016.exe`다. 기존 사용자 AppId·설치 위치·바로가기 identity는 유지하고 AppVerName/UninstallDisplayName만 Pulse (beta)로 바꾼다. 추가 관리자 승격 없이 `%LOCALAPPDATA%\Programs\Pulse`에 설치하며, PATH/파일 연결·신뢰·프로필/공유 도구를 변경하는 설치 동작은 넣지 않는다.

`ide/scripts/build-installer.mjs --candidate <verified .dev/pulse-bundled-...>`는 **최신 현재 앱의 검증 receipt**를 입력으로 받는다. 인자 생략은 `.dev/latest-launch.json`의 현재 후보를 쓴다. 과거 2026-10-14 ZIP을 실수로 새 설치판에 담는 기본 경로는 제거했다. 기존 `package-beta.mjs`의 과거 ZIP/실제 수용 gate는 약화하거나 재사용하지 않는다.

1. candidate의 모든 파일/hash/size/코드 identity/native integrity를 확인하고, 개발 명령·계측 문자열·검증 확장/프로필/fixture/receipt 유입을 거절한다.
2. 소유 staging으로 hash를 보존해 복사하고 BETA/CLI/PRODUCT_SCOPE 안내와 자체·실제 runtime dependency 전체 라이선스 고지를 포함한다. 최신 zod 고지도 포함한다. 과거 배포/실행 중 앱은 덮어쓰지 않는다.
3. 기존 Inno Setup6.4.1으로 `pulse.iss`를 compile한다. 새 도구 설치나 마법사 실행은 없다.
4. PE header·모든 staged 파일 hash/목록 보존을 검사한 뒤 EXE·SHA256·버전별 manifest·latest-installer.json을 쓴다. 실패 기록은 소유 staging에 남기며 기존 산출물은 보호한다.

아직 승인된 새 화면/설치 수용이 없으므로 payload의 `PULSE-ACCEPTANCE.json`과 Setup manifest에 `installed:false`, `screenVerified:false`를 기록한다. ‘Study’ 문구를 제거하는 것과 안정판/새 환경 수용은 별개다. 서명·공개 게시·자동 업데이트는 수행하지 않는다.

## 실패·보완·검증

첫 native 타입 검사에서, 검증용 getter를 직접 상태 참조로 바꾸며 이미 앞선 guard로 제외된 loading 상태를 중복 비교한 오류1개가 나왔다. 기존 `this.loading` guard를 유지하고 중복 조건만 제거했다. unsafe cast로 검사를 숨기지 않았다.

첫 전체426건은424 PASS/1 FAIL/1 POSIX SKIP이었다.900-file scale 계측이 startup compiler3개 중2개만 기록했다. 서로 다른 Python 프로세스가 하나의 JSONL에 append하던 Windows 기록 경쟁을 확인해 source/제품 검사를 약화하지 않고 전용 원자적 개별 record로 바꿨다. Core load 계측도 같은 방식으로 바꿨으며 expected compilation3·root별 routing·cleanup 검사는 유지한다. 이후 scale/배포 payload 관련9 PASS다. 처음 중단된 bundle은 수용 대상으로 사용하지 않는다.

새 payload 단위 검사는 한글/공백·원본 보존·변조·예상 외 파일·중복/경로 탈출·nonempty stage 거절·표시 이름/설치 정책·모든 runtime 고지를 다룬다. 실제 설치/업그레이드/제거·깨끗한 Windows·최신 실제 화면은 미검증으로 남긴다.

이후 전체431건에서428 PASS/1 FAIL/1 CANCEL/1 SKIP를 관찰했다. 실제 package 승인 파일을 rename 직후 Python이 열 때 일시적인 Windows PermissionError가 발생했다. 기존15초 승인 예산 안에서 FileNotFound/PermissionError만 재시도하도록 보완하고 malformed JSON/승인 protocol 검사는 그대로 유지했다. 두 실제 semantic bridge에 반영하며 새 code identity/전체 파일·CLI/policy를 다시 검사한다. 계측 fixture도 옛 `deadline/open` 문자열 대신 새 읽기 함수 호출에 hook을 연결했다. 처음 fixture hook 불일치 실패 기록도 보존한다.

enum cache 거절 동등성 검사는 독립된8개 compiler 요청 전체를 단일60초에 묶어 취소됐다. 데이터(2,000줄 Unicode/CRLF·32개 enum·96개 변수)와 비교/cleanup·각 provider의15초 예산은 유지하고 cache mode별60초 하위 검사/전체180초로 나눴다. **검증 harness 예산 변경이며 성능 개선/제품 latency gate 통과로 주장하지 않는다.** 부하 시 uncached 정밀 조회 비용은 잔여 병목이다. 최신 전체 순차 실행 결과를 최종 수용 근거로 삼는다.

## 최종 자동 검사와 앱 후보

- Windows 전체 순차 회귀 **436건: 435 PASS / 0 FAIL / 0 CANCEL / 1 POSIX SKIP**, 약716.7초. 최종 로그는 `ide/.dev/windows-integrated/pulse-beta-20261016-release-all-tests.log`다. 실제 semantic approval 읽기·900 RTL 규모·취소/정리·편집 추천·프로젝트/테스트/파형/종료 정책 회귀를 포함한다. 실제 화면 속도나 설치 수용 결과로 해석하지 않는다.
- 공식 본체 전체 타입·owned emission **0 errors**, runtime/language build 성공. `pulse-beta-20261016-final-types.log`와 각 runtime/language 로그에 근거를 보존한다.
- 공식 desktop25 bundle/후처리17 JS syntax 성공. 현재 후보는 `ide/.dev/pulse-bundled-YFqq2V`, code identity는 `99edaeb4f4d7c2888dafdf7f3d24a185b94af32543f2d37d448f46ac521664ea`다.
- 최종 후보 전체 **2,558파일** hash/size·code identity·native integrity **10개**, 검증 전용 명령/확장 부재·양쪽 Python bridge 원본 일치·headless native/RTL CLI(두 top 인식)를 확인했다. 앱 창은 열지 않았다. 추가 payload 관련 **9 PASS**다.
- `pulse-beta-20261016-validation.json`은 위 최종 로그의 SHA256·실제 집계와 이 code identity를 묶는다. installer builder는 이 근거가 맞아야 진행한다. 이전 실패·취소 로그를 최종 성공 근거로 재사용하지 않는다.
- `ide/Start-Pulse.cmd`의 로컬 후보를 위 앱으로 선택하고 `latest-launch --check`를 통과했다. 선택은 파일 metadata 준비만 하며 앱 창/사용자 프로필/신뢰를 열거나 바꾸지 않았다. 준비 검사 시간은 실제 UI 시작 시간과 구분한다.

## 최종 설치 파일

- 경로: `ide/release/Pulse-Setup-windows-x64-beta-20261016.exe`
- 크기: **260,697,847 bytes** (약261MB)
- SHA256: `204f706cc2b746381e63e7d22668d158250107e6a849d6fc66d7b4ae17c0ffb4`
- Inno Setup **6.4.1 / exit0**, PE 실행 파일 확인. EXE version resource는 `0.1.2026.1016`, ProductVersion은 `0.1.0-beta.20261016`다. 설치 스크립트의 제어판 표시 이름은 **Pulse (beta)**이며 실제 제어판 화면 검증과 구분한다.
- **2,563 payload entries** = 검증된 앱2,558개 + 사용 안내/CLI/범위/라이선스/검증 기록5개. 실제 runtime dependency **30개**의 라이선스 고지를 보존했다. 압축 완료 뒤 전체 staged 파일 목록·크기·hash 보존을 다시 확인했다.
- compiler 출력과 최종 전달 EXE의 SHA256·별도 `.exe.sha256`·버전별 `.manifest.json`·`latest-installer.json`이 일치한다. 최신 포인터는 `ide/release/latest-installer.json`이다. 기존 2026-10-14 EXE/ZIP·기존 비버전 manifest는 덮어쓰지 않았다.
- staging과 compiler 기록은 `ide/.dev/pulse-installer-G9RYdf/`, 최종 추가 대조는 `ide/.dev/windows-integrated/pulse-beta-20261016-installer-verification.json`이다. 공개 업로드/설치 실행/새 화면 검증은 하지 않았으며 manifest와 동봉 `PULSE-ACCEPTANCE.json`의 `installed:false`, `screenVerified:false`를 유지했다.

기존 Pulse 창을 정상 종료한 뒤 위 Setup을 사용한다. Node/npm/저장소 없이 설치할 수 있으며, Verilator/C++·slang/Python·GTKWave 도구는 앱에서 별도 승인·검증한다. 개발 저장소에서 실행하려면 `ide/Start-Pulse.cmd`를 사용한다. 사용 안내는 `ide/BETA.md`, CLI는 `ide/CLI.md`다.

## 다음 작업·재개할 때

사용자에게 Setup 전달까지 완료했다. 다음은 사용자 실사용 피드백과, 별도 승인된 설치/업그레이드/제거·깨끗한 Windows/대표 실제 설계/최신 화면 수용이다. compiler 부분 증분·부하 시 uncached 정밀 조회 비용·실제 startup/편집 응답 측정과 후속 diagram/엔진은 기존 H7/후속 로드맵의 잔여다. 이번 Setup 생성으로 해당 항목들을 완료 처리하지 않는다.

최종 전체 회귀는 `pulse-beta-20261016-release-all-tests.log`, 타입은 `pulse-beta-20261016-final-types.log`, 빌드는 `pulse-beta-20261016-final-bundle.log`·`pulse-local-bundle.log`, 설치 생성은 `pulse-beta-20261016-installer.log`다. 앞선 실패/취소 로그와 혼동하지 않는다. 중단된 작업을 재개할 때는 같은 쓰기 작업을 겹쳐 시작하지 말고 해당 빌드 프로세스가 없는지 읽기 전용 확인한다. 이전 artifact/실패 로그를 지우지 않고 새 버전명으로 생성한다. 실제 설치·Computer Use는 새 사전 승인을 받아야 한다.
