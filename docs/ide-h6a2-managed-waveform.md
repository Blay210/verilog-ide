# H6A2 — 기본 실행의 IDE 자동 파형 (2026-10-12)

H6A1 prototype의 생성 C++ driver를 독립 IDE/개발 CLI의 기본 Verilator 경로에 적용했다. 사용자는 `$dumpfile/$dumpvars` 또는 C++ harness를 작성하지 않아도 된다. 원본 RTL, 저장된 TOML, 모듈 계층을 다시 쓰지 않는다. VSIX 프로젝트는 변경하지 않았다. H6B 미저장 simulation 입력과 H6/H7 전체·베타 완료는 별도다.

## 구현 계약

- `ide/runtime/verilator/index.ts`: `--cc --exe --build`, assertion/timing/trace 옵션 및 Windows `-DVL_TIME_CONTEXT`. `.rtl/runs/<test>-<runId>/instrumentation/managed-main.cpp`에서 eval→시간 이동→trace→final/close를 관리한다. 모델 이름은 기존 `--binary`와 같은 빈 문자열이며 wrapper 계층을 추가하지 않는다.
- `trace-harness.ts`: VCD/FST/off 및 timing on/off. timing 모델에서 pending event가 없으면 정상 종료, `final` 호출. 일반 `$finish`/assert/`$fatal` 동작은 Verilator가 처리한다. 무한 모델은 기존 공통 timeout/취소가 처리한다.
- 파일은 run 루트에 `rtl_<safeTop>_<UUID>.vcd|fst`로 둔다. top의 파일명 안전 문자만 사용하고 64자로 제한한다. UI는 원래 테스트 이름/실행 이력으로 보여준다. 고유 이름은 기존 고정 dump 이름과 충돌을 줄이기 위한 내부 정책이다.
- `BuildArtifact.waveform`과 `SimulatorBackend.capabilities.managedWaveform`으로 생성 대상 경로를 명시한다. Core는 이 run 안의 선택된 형식·일반 파일·nonempty 여부를 검사한다. trace identity/hash와 기록된 입력 검증은 기존 경로를 재사용한다. 명시적 파형이 없으면 임의의 legacy 파일로 대체하지 않는다. 기존 비관리 backend는 이전 파일 탐색을 유지한다.
- 기존 `RTL_WAVEFORM`/`RTL_FST` defines와 사용자 dump 코드는 유지한다. 사용자가 별도로 지정한 파일도 생성될 수 있지만 파형 버튼은 IDE trace만 연다. 사용자 dump 범위·`$dumpoff`는 IDE trace 정책을 제어하지 않는다. `waveform="none"`은 IDE trace/guarded template trace를 끄며, 사용자 unguarded dump 코드를 제거하지 않는다.
- 새 counter 예제는 dump 블록 없이 생성한다. 기존 프로젝트는 자동 수정하지 않는다. source-first·`.rtl/` 격리·취소/process layer·GUI/CLI 공통 Core·두 프로젝트 독립 경계를 유지한다.

## 검증

자동 회귀와 실제 실행 근거는 IDE 내부 `.dev/`에 두며 Git 배포 입력이 아니다.

| 범위 | 결과/근거 |
|---|---|
| 전체 IDE 회귀 | 최종136 PASS/0 FAIL/0 SKIP·runtime/language build. `.dev/h6a2-final-tests.log/.exit0`. 초기136 PASS도 `.dev/h6a2-tests.log/.exit`에 보존 |
| Core 계약 | 명시적 managed trace 우선·누락 시 legacy fallback 금지·run 외부 경로는 실행 전 거절. `tests/simulation.test.mjs`의 두 추가 회귀 |
| production service + 실제 CLI | `.dev/h6a2-auto-한글 공백-X26mUb/.rtl/acceptance.json`, `.dev/h6a2-real.log/.exit0`, 8항목 PASS |
| 새 예제 실제 실행 | `.dev/h6a2-example.log/.exit0`, `.dev/h3a-real-QBSfmN/receipt.json`: counter_basic/reset 각각 VCD/FST 4회 PASS + 원본 불변/고유 run/격리 1항목 PASS |
| 실제 앱 | native3항목 PASS/trusted:true/exit0. `.dev/h6a2-ui-final.log/.exit0`·`.dev/import-ui-dbJf2o/receipt.json/exit.json`. 사용자 승인된 trust 재사용·실제 Verilator/기존 dump 동시 생성/명시적 trace 선택·내장 VCD 정렬·이전 reader/bytes·공간 왕복·원본 불변. history14→15(새 tb.second PASS 1회), 전용 창 정상 종료 |

production service/CLI 8항목: dump 토큰 없는 동일 파일의 두 top, 1ps 정밀도/17ns VCD와 원래 계층/final, 실제 CLI 상태·신호 path·전체 transition 일치, FST retained hash/bytes, timing=false/off 무파형, timing=true/no-pending 종료, `$fatal` FAIL/partial trace, 실제 C++ 빌드 취소와 이전 trace 보존, 컴파일 오류의 한글/대괄호 원래 경로·원본 복원·`.rtl/` 격리. FST는 byte/hash 검증이며 내부 값 해석·내장 표시 검증이 아니다.

초기 검증 스크립트의 JS 템플릿에서 SV backtick 이스케이프를 수정했다(실제 실행 전 syntax 실패). CLI stdout JSON과 stderr 로그를 분리해서 비교한다. 앱 첫 시도는 Code 공간에서 숨겨진 파형 frame의 렌더를 기다려 시간 초과했다. Simulation 공간을 먼저 활성화하도록 검증 절차를 보완하고 IPC 결과 요약에 없는 directory/trace identity는 해당 result.json에서 확인한다. 첫 실패는 fixture의 `h6a2-first-receipt.json/exit.json/host.log`에 보존했다. 제품 trust/프로필을 수정하지 않았다.

## 한계와 다음 순서

현재 검증 도구는 Windows x64 UCRT64 Verilator5.050/GCC16이며 모든 도구 버전의 동작을 보증하지 않는다. 전체 모델 trace는 큰 설계의 파일/성능 비용을 늘릴 수 있다. FST 내장 뷰어·enum 연결·물리 UI/DPI·중간 규모·clean Windows 설치·종료/복원 수용 gate는 남는다. 취소/비정상 종료는 trace close 이전에 끝날 수 있어 항상 읽을 수 있는 partial 파형을 보장하지 않는다. 일반 `$fatal` fixture의 partial trace는 확인했다.

다음 구현은 **H6B 시작 시점 미저장 입력 snapshot**이다. 현재는 저장된 sources만 snapshot으로 실행한다. Core/GUI dirty buffer 전달 계약, project/source/include/package 경계, provenance·stale 비교와 이전 run 소스 보존부터 설계한다. 디스크 자동 저장 없이 실행하고 미저장 TOML은 계속 별도 보호한다. 이후 H7의 종료·복원·중간 규모(수백 RTL/수천 신호) 및 잔여 사용자 수용을 진행한다. 배포 패키지는 만들거나 설치하지 않았다.
