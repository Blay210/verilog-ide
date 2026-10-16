# Pulse Windows 내부 베타 전달 기록 (2026-10-14 KST)

> 후속: [2026-10-16 Pulse (beta) Setup 전달](pulse-beta-20261016.md)가 최신이다. 현재 앱·제품 정리를 반영한 새 Setup을 생성했으며 과거 화면 수용을 최신 패키지에 복사하지 않는다. 아래 ZIP/Setup 파일과 수용은 2026-10-14 당시 기록이다.

사용자가 남은 검증·화면 검증·빌드·배포 준비를 승인했다. 스터디 내부 Windows x64 무설치 ZIP을 준비하며, 공개 업로드/설치/안정판 수용과 구분한다. 이번 요청은 최종 한 화면 세션에 대한 명시적 승인이다. 이후 새 Computer Use 세션도 사용자 확인을 받아 진행한다.

후속 요청으로 **Setup 설치판도 생성 완료**했다: `ide/release/Pulse-Setup-windows-x64-beta-20261014.exe`(260,255,047 bytes)·SHA256·installer-manifest. 기존 ZIP/app은 변경하지 않았고 compiler/PE/2,565 staged hash 및 신규3개 payload 회귀 PASS다. 실제 설치·제거·마법사 화면/clean Windows 수용은 미실시다. [설치 방식·근거·인수인계](pulse-windows-installer.md). 아래 ZIP 작업 당시 ‘설치 프로그램 없음’ 기록은 이 후속 작업 전 상태다.

## 현재 상태 — 스터디 내부 베타 전달 준비 완료

### 최종 전달 산출물

- `ide/release/Pulse-windows-x64-beta-20261014.zip`: **366,892,027 bytes**, 2,565개 entry의 전체 decompression/원본 크기·SHA256 비교 **PASS/exit0**. `.partial`에서 검증 완료 후 최종 이름으로 교환했다.
- SHA256: `d2762552d31a1e820c573a53d6eb067e6db6fc48e109ada05a53bcc59e2e8f60`. 같은 이름의 `.zip.sha256`와 `release/manifest.json`에 기록했다.
- ZIP 내부 `PULSE-README.md`, `PULSE-NOTICES.txt`(자체 MIT·28개 의존 package 전체 고지), `PULSE-ACCEPTANCE.json` 및 upstream/Chromium 고지. 검증 프로젝트/프로필/공유 개발 도구는 포함하지 않았다. 압축을 풀고 Pulse.exe를 실행하며 개발용 Node/checkout은 필요 없다. Verilator/C++ 및 slang/Python은 별도 승인 설치/기존 도구 검증·재사용이다.
- `pulse-package.log/.exit`가 실제 압축 검증 근거다. 공개 업로드·Git push·설치 프로그램·서명·clean Windows 수용·정식 stable 선언은 하지 않았다. VSIX 코드는 수정하지 않았다. 다음은 사용자/스터디 실사용 피드백과 별도 clean Windows 수용이며 아래 잔여 gate를 유지한다.

### 최신 정상 앱 수용 완료 (2026-10-14 03:22 KST)

추가 사용자 승인 후03:17:49~03:22:00 KST, 약4분11초의 전용 화면 세션에서 **검증 extension 없는 일반 Pulse**를 확인했다. 보관 TB 텍스트가 자동 복원되고 source/provider 오류와 설치 손상 경고가 없었다. 기존2개 TB/이력 재사용, 행의 실행 버튼으로 `tb.first` 실제 PASS(23,478ms, run `c960fb67-5c0d-43db-be7b-9692084510a3`), 내장 VCD/테스트 이름만 있는 탭/집 아이콘·607ps 커서 눈금/파형 선 정렬·Code 왕복 후 source/파형/cursor 보존을 확인했다. 전용 창 Alt+F4 정상 닫기 후 창 목록에는 기존 Codex만 남고 CIM Pulse.exe0을 확인했다. 종료 코드를 capture한 것은 아니므로 exit0로 바꾸어 기록하지 않는다. run의 두 원본 입력 hash는 현재 파일과 동일하다.

공식25 bundle은 완료했지만 제한된 실행의 CIM 조회가 거절돼 교환 직전 멈췄다. `--resume-refresh`는 정확한 실패 사유·직전 검증 후보·25 bundles/단일 성공 task·미교환 receipt·invalid inventory·제품 identity를 확인한 뒤 프로세스 guard부터 재개한다. 승인된 파일 빌드 권한으로 정상 완료했고 이전 코드 디렉터리를 보존했다. 프로세스 guard를 제거하지 않았다. 최신 `verify-beta.mjs` **PASS**: upstream integrity10개·브랜드/타일/파일·제외 확장·CLI exit0이다.

`pulse-package-acceptance.json`은 최신 inventory 및 executable hash에 연결됐으며 과거 native11/전체340 PASS와 최신 localized23/normal UI를 구분한다. `pulse-normal-final-renderer.log`와 기존 open-launch/result가 근거다. ZIP 생성/전체 entry 해시 재독출은 `pulse-package.*`에서 완료됐으며 위 최종 산출물과 release/manifest.json이 근거다. clean Windows/고해상도·대표 설계/장시간 및 FST/enum 등 아래 미확인은 유지한다.

### 재시작 실패·보완 기록 — 위 정상 앱 수용 이전 (2026-10-14 03:12 KST)

전체 회귀는 `pulse-release-suite.log`: **341개 중340 PASS/0 FAIL/1 POSIX SKIP**, runtime/language build PASS. 이후 보관 소스 초기 복원을 별도로 보완했다. 개발 검증 host의 native11 PASS/exit0·실제 전체 실행2 PASS·파형/비트 펼침/행 drag/탭 닫기/Code 왕복 수용은 완료됐으나, 이것을 검증 extension 없는 정상 앱 재시작 수용으로 대신하지 않는다.

사용자가 승인한 재검증에서 정상 앱의 보관 소스 자동 복원이 실패했고, 검증 창만 정상적으로 닫았다. `BlockRestore` 시점에는 workbench DOM이 없는데 activity에 prepend하면서 contribution 생성이 중단됐기 때문이다. 제공자는 detached Simulation home으로 동기 등록하고, 실제 navigation/home 부착·commands는 `LifecyclePhase.Restored` 이후 수행하도록 분리했다. 복원 중 dispose되면 늦은 UI 초기화를 하지 않는다. 기존 source stat/read가 진행 중인 initial inspect를 join하는 보완도 유지한다.

동시에 이전 bundle 교환이 packaged product.checksums를 갱신하지 않아 설치 손상 알림을 띄우는 문제를 확인했다. `package-integrity.mjs`는 pinned upstream의 정확한10개 파일과 같은 SHA256/base64 포맷으로 metadata를 갱신한다. 검사 기능을 비활성화하지 않으며 inventory 검증도10개 실제 파일을 모두 비교한다. 예기치 않은 파일 목록/외부 경로는 쓰기 전에 거절한다.

최신 관련 **23 PASS/0 FAIL/0 SKIP**(`pulse-restore-lifecycle-regression.*`), 공식 전체 본체 typecheck/owned emission **0 errors/exit0**(`pulse-restore-lifecycle-types.*`). 실제 early contribution constructor의 provider 등록→복원 후 DOM 접근 및 dispose 차단, source stat/read 공유, integrity 새 bundle/이후 손상 검출/비정상 목록 무변경을 포함한다. 공식25 bundle refresh는 `pulse-lifecycle-build.*`; 완료 후 `verify-beta.mjs`를 실행한다. 실패 화면 renderer 로그와 기록은 `pulse-normal-lifecycle-failure.*`로 보존했다.

**당시 배포 gate:** 수정 후보의 일반 앱에서 자동 보관 소스 복원→시뮬레이션→파형→정상 닫기가 미확인이었고 승인 전 새 화면을 열지 않았다. 이 gate는 위03:22 정상 앱 수용으로 충족했다. 이전 전체 회귀와23개 관련 검사를 합산하거나 최신 전체 실행으로 표현하지 않는다.

### 이전 빌드·회귀 보완 기록

- Pulse 이름·SVG/다중 해상도 ICO·시작 메뉴 70/150 PNG/타일 표시 이름·새 탭을 공식 Windows 후보에 반영했다. 기본 Code-OSS revision2a59476c, baseline1.141.0이다.
- 공식 본체25 bundle 및 Windows native package/후처리 exit0. 파일/CLI·아이콘/타일/이름·Copilot 및 인증 확장 부재 검사 PASS.
- 첫 전체 실행은 테스트 전용 RTL_SEMANTIC_PYTHON 누락으로 실패했다. 검증된 기존 Python3.14.7/pyslang11.0.0을 설정했으며 새 설치 없음.
- Windows 다중 Python의 공유 JSONL append 계측 손상과 실패 후 gate/fixture 종료 지연을 보완했다. semantic-burst는 원자적 개별 start record, semantic-inputs도 같은 방식과 bounded 실패 cleanup이다. 제품 분석기의 JSON 프로토콜 오류로 혼동하지 않는다.
- 다음 전체340개 중338 PASS/1 FAIL/1 POSIX SKIP. 실제 실패는 retained handle 복구 후 Ready를 막는 Windows taskkill128 자연 종료 경쟁이었다. 실패 상태 detail을 추가해 원인을 확인했다. 로그를 지우거나 테스트를 건너뛰지 않았다.
- 자체 Python/slang bridge가 자식을 만들지 않는다는 계약을 ProcessSpec의 명시적 `termination:process`에 연결했다. Windows에서는 retained ChildProcess handle로 종료 요청하고 실제 close를 기다린다. 거절/error·5초 미종료는 cleanupFailed다. 기본 빌드/시뮬레이터는 기존 tree cleanup 및 실패 보존이다. taskkill128을 임의 성공으로 바꾸지 않는다.
- 관련44개: **43 PASS/0 FAIL/1 POSIX SKIP**, 자연 종료와 취소 경쟁20회 포함. 전체 회귀 및 새 코드 배포 번들 갱신은 진행 중이다. 화면/native 최종 수용 및 ZIP은 아직 미완료다.

## 빌드·검증 경로

이전 RTL IDE 후보는 `ide/.dev/pre-pulse-distribution-20261014`, 이전 receipt/log는 `ide/.dev/windows-integrated/pre-pulse-build`에 보존했다. `build-beta.mjs --refresh`는 검사한 동일 Windows 후보의 실행 파일/native 의존성을 유지하고 공식 전체 본체 bundle과 내장 RTL language를 갱신한다. 현재 후보 hash 검증→inventory 무효화→빌드→Pulse 프로세스 없음 확인→소유 staged 디렉터리 교환이며 이전 out/language를 `.dev/windows-integrated/code-refresh-*`에 보존한다. 최신 파일/CLI 검사를 다시 해야 화면/압축으로 넘어갈 수 있다.

로그: `.dev/windows-integrated/pulse-build.*`, `pulse-refresh-build.*`, `pulse-leaf-cleanup.*`, `pulse-final-suite-leaf.*`. 앞선 실패는 `pulse-full-tests-missing-env.log`, `pulse-full-tests-append-failure.log`, `pulse-full-tests-input-failure.log`, `pulse-final-suite.log`에 있다. 전체 검증에는 환경 변수 `RTL_SEMANTIC_PYTHON=C:\Users\nanoi\.rtl-dev\tools\slang-11.0.0-python-3.14.7\python.exe`를 명시한다. runtime/language build 후 `node --test --test-concurrency=1 tests/*.test.mjs`.

## 전달 gate

현재 검증된 패키지의 native 통합→Computer Use 새 탭/홈/실행/파형→정상 종료→검증용 extension 없는 일반 실행을 한 세션에서 확인한다. 전용으로 이미 신뢰된 import-ui-dbJf2o fixture/profile을 재사용하며 trust를 복사/변경하지 않는다. 다른 창은 보존한다. 실제 측정과 미검증을 구분하며 별도 clean Windows 환경은 없다.

`package-beta.mjs`는 packaged inventory, 그 inventory hash/실행 파일에 연결된 수용 기록·정상 종료를 요구한다. 자체 MIT와 bundled28 packages 전체 license/notice를 포함한다(사전 notice 검사 PASS). `.partial` ZIP 생성 후 **모든 entry를 읽어 원본과 SHA256/크기 비교**하고서 최종 ZIP 이름으로 바꾼다. ZIP SHA256·manifest·사용 안내를 함께 작성하며 공개 게시하지 않는다.

clean Windows/DPI/고대비·긴 시간/그룹 drag/대표 실제 설계·장시간 메모리/전체 디스크 정책·FST 내장 표시/파형 enum 등 미확인은 최종 확인 범위에 따라 그대로 기록한다. 기존 개발 앱 startup 지연은 해결됐다고 주장하지 않는다.
