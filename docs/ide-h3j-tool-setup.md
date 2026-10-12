# H3J — 도구 설정·승인·진행·취소·재시도 (2026-10-10)

## 구현과 사용

Simulation 홈의 **도구 설정** 버튼에서 시뮬레이션 도구 또는 언어 분석 도구를 선택한다. 언어 상태 메뉴에서도 **언어 도구 설정**으로 접근한다. 기존 도구를 검증하고 필요한 설치가 없으면 완료 안내만 보여준다. 설치가 필요하면 **위치·구성 요소·SHA256/패키지 서명 검증·시스템 PATH 비변경**을 modal에 표시한다. 사용자가 **설치**를 선택한 경우에만 실행한다. 거절해도 기본 편집은 유지한다.

Notification의 취소 버튼, 단계/다운로드 MB/빌드 로그, **RTL Tools** Output, 실패 이유와 **재시도/로그 보기**를 연결했다. 임의의 진행률을 표시하지 않는다. 재시도는 다시 검증하고 현재의 계획을 보여준다. 언어 도구 완료 후 LSP를 재시작한다. Simulation에서 돌아오면 목록을 새로고침한다. 실행 중에는 도구 설정 버튼을 비활성화한다.

`rtl.toolsDirectory` 또는 기본 `.rtl-dev` 공유 저장소를 사용한다. 저장소는 사용자 프로젝트 밖이어야 하며 기존 ancestor의 realpath를 검사해 project 내부로 향하는 link도 거절한다. 각 작업이 도구 위치를 캡처하며 installer/provider에 명시적으로 전달한다. Simulation 시작 IPC에도 설정 값을 전달해 설치한 사용자 지정 도구 위치를 사용할 수 있게 했다. source/manifest 자동 변경·저장·PATH 변경은 없다.

## 구조와 승인 경계

- `ide/runtime/tool-setup.ts`: editor-free 서비스. checking/awaitingApproval/installing/ready/cancelled/failed, bounded64KiB 로그, 내부 설치 action과 계획 ID, 중복 작업 거절, 취소 후 정리 대기. 승인 전에는 내부 installer를 호출하지 않고 거절/만료 ID/비신뢰 상태로는 실행할 수 없다. UI의 component 텍스트를 변경해도 installer 입력이 되지 않는다. initial path check 취소 후 늦게 compiler probe를 시작하지 않는다.
- `runtime/toolchain/install.ts`/`verify.ts`/`semantic.ts`: VSIX의 MIT adapter를 독립 복사했다. 공식 MSYS2 SHA256·signed pacman·작은 RTL 실제 빌드/실행, 고정 Python/slang 배포 SHA256·compiler 검증·staging/lock 정리를 유지한다. GTKWave도 기존 version 검증 후 재사용한다. 포팅 출처는 `language/PORTING.md`/runtime LICENSE에 보존한다.
- `language/src/tools.ts`: 내장 command/QuickPick/modal/progress/Output adapter. 신뢰하지 않는 프로젝트에서 서비스 생성과 probe/install을 거절한다. 종료 시 취소하고 진행 중인 서비스 정리를 기다린다. 설정 계획/설치 승인 원칙은 실제 사용자 설치 시에도 적용한다.
- `src/rtlSimulationHome.ts`/channel/contract/host/simulation: 버튼·공유 설정 전달. Core/semantic/backend 교체 경계, 기존 결과와 파형 동작을 유지했다. VSIX/부모 code import/build 입력이나 외부 확장 지원은 없다.

## 검증 결과

- 최종 **86 PASS /0 FAIL /0 SKIP**, runtime·language 타입/build 통과. 이전85 + initial check 취소 회귀1. 승인 전 호출0/거절/위조·만료 ID/비신뢰/중복 작업, 재사용, 실패/취소/정리 대기/재시도, project/link 경계, 네트워크503/SHA256 실패·partial 삭제·재시도와 기존 actual slang/LSP/실행/파형 회귀 포함. `ide/.dev/h3j-tests-complete.log/exit`; 중간85 기록 유지.
- guarded 공식 overlay emission·**전체 upstream 타입0 errors/exit0**. `h3j-build.log/exit`. 첫 adapter QuickPick 데이터에 API 예약 property `kind`를 써 타입 오류가 나서 `group`으로 수정했고 최초 로그를 보존했다.
- 실제 현재 PC **simulation ready + language ready**, 설치0. `scripts/verify-tool-setup.mjs`가 공통 서비스를 통해 Verilator/C++/GTKWave를 탐색하고 작은 RTL을 실제 빌드·실행했으며 slang도 실제 module/port 검증했다. 부족하면 계획을 거절하도록 만든 검증 스크립트로 자동 설치하지 않는다. `h3j-existing-tools.json/log/exit`.
- 실제 앱 native **esJNBJ 7항목 PASS/exit0**. 신뢰되지 않은 profile에서 semantic 차단과 기본 편집 유지, 실제 setup command가 service 생성 전 거절/idle 유지, 네 확장자·한글/공백·snippet fields/기본 completion, Simulation 홈의 설정 버튼을 확인했다. `h3j-native-complete.log/exit`, `editor-acceptance-esJNBJ/receipt.json`.
- 초기 native **KAXIOb**는 없는 notification 명령을 시험에 사용해 FAIL. **4b7ieO**는 홈이 로딩 중일 때 설정 버튼 상태를 먼저 읽어 FAIL. 현재 notification 명령과 bounded 로딩 대기로 시험을 수정한 뒤 통과했다. 권한/trust 정책을 약화하지 않았고 두 실패 receipt/log를 유지했다.
- 공통 Runtime/언어 검증 fixture는 `.dev/` 아래에 격리했다. 기존 preview 소스와 실행 이력을 새 테스트로 덮어쓰지 않았다. 새 도구 다운로드·설치·VSIX/앱 패키징 없음.

## 남은 검증과 다음 작업

**설치 코드와 UI 구현은 연결했지만 clean Windows GUI 설치 E2E가 완료된 것은 아니다.** 현재 PC의 도구가 모두 있어 실제 installer를 재실행하지 않았다. 승인/거절·취소/네트워크/검증 실패는 injected planner와 실제 download verifier의 fake response 시험으로 수용했으며 물리 modal 클릭/실제 다운로드·pacman/bootstrap 검증과 구분한다. 별도 깨끗한 환경이 없다는 기존 사용자 답변도 유지한다.

H3I부터 남은 trusted GUI의 built-in LanguageClient→slang 추천/진단·저장/Code/Simulation 왕복도 별도 수용이다. 이미 사용자 신뢰가 적용된 `h3b-simulation` profile에 기존 앱 프로세스들이 실행 중임을 읽기 전용으로 확인했다. native test 옵션을 주입하거나 그 창들을 닫아 사용자 상태를 잃게 하지 않았다. 신뢰 설정 복사/자동 변경 금지. 이후 해당 검증 창의 상태를 보존하며 물리 수용하거나, 사용자가 직접 신뢰한 별도 fixture에서 확인한다.

다음 **H3K**는 trusted semantic/설치 UX 잔여 수용과 첫 앱 범위 판정이다. 이후 H5의 소스 탐색·폴더 역할·multi-top과 H6 자동 dump/미저장 simulation snapshot을 진행한다. 자동 package 순서는 provider 이식과 별개로 Simulation 연결이 아직 필요하며 현재 manifest 순서 안내를 유지한다. FST/enum/history 정리·규모/기존 host/layout/Windows gate와 glob upstream advisory도 남아 있다. H3/H4 전체·베타·배포 완료가 아니다.
