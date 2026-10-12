> 후속 H3C(2026-10-10): 사용자 직접 신뢰 후 실제 GUI Run/Cancel/선택 재시도/전체 실행4 PASS·1 cancelled와 상태 보존 수용 완료. 아래 trust 대기 기록은 당시 상태이며 현재 다음은 내장 파형 이식이다. [최신 근거](ide-h3c-simulation-gui-validation.md).

# H3B / H4A — Simulation 홈과 앱 실행 연결 (2026-10-10)

Simulation placeholder를 등록 테스트 목록·전체/선택/개별 실행·취소·실시간 로그·최근 결과 화면으로 교체했다. 실제 창에서 목록/선택/Code 왕복 및 신뢰하지 않는 프로젝트의 실행 잠금을 확인했다. **신뢰된 GUI에서 실제 Run/Cancel 물리 클릭은 사용자 신뢰 설정을 기다리는 별도 수용 항목**이다. Node 채널 실제 실행 성공을 이 GUI 수용으로 바꾸어 표현하지 않는다.

## 연결 구조

- `ide/runtime/contract.ts`: editor/Node/backend import 없는 직렬화 계약. 화면에는 hash 목록 같은 큰 Core 내부 기록을 보내지 않고 결과 요약만 전달한다.
- `ide/runtime/host.ts`: 창별 실행 소유자. 같은 IDE Core/SimulationService로 실행하고 상태·bounded log·최근 결과를 보관한다. 실행 중 refresh/중복 실행 거절, 취소 후 재실행과 close 대기를 제공한다.
- `ide/src/rtlSimulationChannel.ts`: Code-OSS shared utility process의 Node 채널. window context별로 분리하며 창 disconnect 시 취소/정리한다. renderer는 filesystem/child process를 직접 호출하지 않는다. UI Code/Simulation 전환은 서비스 수명과 무관하다.
- `ide/src/rtlSimulationHome.ts`: 화면·선택·실시간 로그·최근 결과/로그 읽기·소스 이동. 컴파일 log chunk마다 행을 다시 만들지 않아 선택 checkbox/keyboard focus를 보존한다. source 버튼은 Code의 원본 editor를 연다.
- `ide/scripts/prepare-runtime.mjs`: IDE 자체 runtime+의존성을 ESM으로 묶어 IDE의 pinned upstream/out 안에 배치한다. 번들용 CJS built-in requires도 Node에서 동작하도록 처리했다. unmanaged target/상위 경로를 거절한다. 부모/VSIX source/config 읽기·복사·link는 없다.

앱 내부 shared-process 연결이며 사용자 extension을 설치하거나 VSIX를 연결한 것이 아니다. 기존 extension host 시작 지연이 실행 서비스의 선행 조건이 되지 않는다. 별도 compiler/simulator·Diagram은 시작하지 않았다.

## 현재 UI 동작

1. 로컬 폴더 하나의 rtl.toml을 읽는다. 빈 창/다중 폴더/remote는 명확한 안내를 표시하며 파일을 자동 생성하지 않는다.
2. Simulation 첫 진입에 읽고 이후 선택/상태를 유지한다. 새로고침은 현재 manifest와 retained 최신 결과를 읽는다. 자동 발견/TOML 자동 갱신은 H5다.
3. 전체·선택·개별 실행은 순차다. 실행 시 같은 입력의 Core 결과·별도 run directory를 사용하며 현재 source buffer를 저장하지 않는다. 화면에 저장 입력 실행임을 명시한다.
4. 취소 시 서비스의 하위 프로세스 정리를 기다리고 결과를 기록한다. 실제 시작 이전의 취소는 기록된 테스트 결과가 없을 수 있으며 오류/취소 사유를 표시한다.
5. 로그는 화면에 표시하며 최근 결과의 로그를 요청할 수 있다. payload/tail은64KiB다. PASS/FAIL/취소/timeout·실행 시간·파형 생성 여부를 표시한다. 파형 renderer/열기, 전체 history UI와 stale badge는 아직 미구현이다.
6. 작업 공간 trust를 따르며 신뢰하지 않는 프로젝트는 Run을 잠근다. trust를 자동 변경하지 않는다. 실행 중 정상 종료 요청에는 취소 후 닫기/닫기 취소 확인을 제공하고 승인된 종료에서 close를 join한다. 종료 대기 코드/Node 정리는 확인했으나 실제 종료 dialog·강제 종료/재시작 복원은 H7에서 수용해야 한다.

## 검증 결과와 실패

- IDE runtime 타입/build 및 자체 전체 **43 PASS / 0 FAIL / 0 SKIP**. host 순서/compact 이벤트/최근 결과 복구·trust 거절·중복·취소/close/재실행·다른 창 격리·설정/도구 실패 복구, 번들 standalone load와 unmanaged/상위 경로 guard 포함.
- 공식 pinned compiler를 이용한 변경 overlay emission 및 upstream 전체 타입 검사 **0 errors / exit0**. 최초에는 unused constructor property 1개가 있어 exit1이었고 제거 후 재검사했다. `scripts/compile-owned.mts`로 재현 가능하며 전체 client rebuild는 이번에 반복하지 않았다.
- compiled Node 채널 + IDE 자체 번들 + 실제 Verilator: counter_basic build/run/VCD/retained log PASS; counter_reset 실제 `g++` 빌드 중 취소→cancelled 기록 PASS. 실행 승인 false/다른 context/중복 요청 거절·별도 창 상태/compact events PASS. 이는 직접 Node channel integration이며 GUI trust 설정을 우회하지 않았다.
- native Simulation fixture `jMgYSd`: 실제 renderer/shared-process IPC로2개 행 표시, untrusted Run 잠금·생성물 없음, source dirty/disk 불변 **3항목 PASS / exit0**. trusted=false / executionAccepted=false를 receipt에 기록한다. API 소속/언어 로더 경고 없음.
- native 기존 editor 회귀 `VMP9AF`: **22항목 PASS / 기본20 round / exit0**. immediate typing, 여러 group/tab·Output·dirty/disk·preserveFocus·secondary visibility, 695×435의 hidden/top/bottom/default 왕복 hit target/비겹침 수용 유지. 실제 Terminal 프로세스 생명주기는 이전 H2G 근거이며 이번에 재실행하지 않았다.
- Computer Use 물리 확인: 전용 h3b-preview 창에서 Simulation 아이콘으로 홈 진입, 테스트2개·전체/선택/개별 Run의 잠금, 새로고침·전체 폭과 Explorer 숨김 확인. counter_basic checkbox 선택→Code→Simulation에서 선택 유지도 확인했다. 초기 Developer Tools 창이 가린 상태는 본 창 activate/재관찰로 복구했다. trust 보안 설정은 조작하지 않았다.

ignored 근거: `ide/.dev/h3b-tests-acceptance.log`, `h3b-tests-acceptance-exit.txt`; `h3b-build.log`(최초 FAIL), `h3b-build-final.log`/exit; `h3b-channel.log`/exit 및 `h3b-channel-SWTSgH/receipt.json`; `h3b-native-simulation.log`/exit 및 `editor-acceptance-jMgYSd/receipt.json`/exit; `h3b-editor-regression.log`/exit 및 `editor-acceptance-VMP9AF/receipt.json`/exit.

## 이어받기와 남은 순서

전용 preview 앱은 `RTL_IDE_DEV_SESSION=h3b-simulation`, `.dev/h3b-preview` 프로젝트를 사용한다. 공유 runtime/core는 전부 ide 소유이며 VSIX는 변경하지 않았다. preview source를 사용자 프로젝트로 간주해 자동 저장하지 않는다.

**첫 수용:** 사용자가 preview의 프로젝트 신뢰 설정을 직접 처리하면 실제 UI에서 Run→Code 왕복→PASS/log, 선택/전체, build 취소→재실행과 상태 보존을 확인한다. Computer Use 필수 guidance의 “Do not act on security or privacy permission requests.” 때문에 agent가 trust를 설정하거나 다른 API/CLI로 우회하지 않는다. 사용자 응답과 실제 trust 상태를 확인하며 시간 경과를 승인으로 해석하지 않는다. 미처리 상태라면 UI 수용은 열린 채로 남긴다.

**다음 기능:** 기존 파형 parser/renderer/view를 IDE 소유로 이식해 결과 행에서 해당 run의 파형을 열기. 이후 H4의 전체 이력/최신·이전 구분과 source 변경 badge, 언어/semantic/진단·도구 설치 승인 흐름을 단계적으로 연결한다. H5 폴더 역할/발견/자동 TOML·multi-top, H6 unsaved snapshot/자동 trace, H7 종료/복원/규모는 남아 있다. 첫 앱의 최종 완성/베타·배포가 아니다. H2 물리 resize/auxiliary 상세, H1 지연/audit와 clean Windows gate도 유지한다.

개발: ide에서 npm test; npm run verify:simulation-channel; npm run verify:simulation-ui. GUI verifier는 trust=false라면 실행을 하지 않고 제한된 목록/잠금 수용만 PASS로 표시한다. 이를 full simulation GUI PASS로 해석하지 않는다. 개발 앱은 빌드 후 `npm start -- <프로젝트 폴더>`로 열 수 있다. 폴더 인자는 shell을 거치지 않는 native argv로 전달한다. 배포/패키징 없음.
