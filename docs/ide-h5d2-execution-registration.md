> 후속 H5D3(2026-10-11): 아래 Windows source basename 제한은 보완했고 실제 한글/공백/대괄호 source/header 실행·실패·취소를 검증했다. trusted UI 등록·복원·실제 Verilator5회/내장파형 수용도 완료했다(물리 클릭 수용은 별도). 최신 [근거와 재개 절차](ide-h5d3-source-paths.md)를 참고한다. 아래는 H5D2 당시 기록이다.

# H5D2 — 실행 설정 전환·테스트 등록 (2026-10-11)

‘선택한 top 등록’으로 저장 직전 의미 분석을 다시 수행하고, pending/manifest 없는 프로젝트를 실행 가능한 rtl.toml로 전환한다. Host의 Simulation 목록에 등록하고 기존 개별/선택/전체 Run 경로와 개발 CLI가 같은 Core 설정을 사용한다. H5D2 구현 완료이며 trusted GUI 성공 수용 및 H5 전체/베타 완료와 구분한다.

## 흐름과 소유 경계

1. 가져오기 화면에서 폴더/파일 역할과 top을 선택한다. 필요하면 상대 include 폴더를 추가한다.
2. ‘선택한 top 확인’은 읽기전용 preview이고 ‘선택한 top 등록’은 명시적 저장이다. 등록은 기존 preview를 권위로 사용하지 않고 실제 slang 분석을 다시 한다.
3. 협력 writer lock 안에서 manifest revision·원본·include 입력을 검증하고 package 의존 순서/선택한 top 정교화를 확인한다. 생성한 TOML은 게시 전에 동일 loadProject reader로 검증한다.
4. 원자적 최초 공개/rename과 H5C의 충돌·취소·링크·읽기 전용 보호를 유지한다. 일반 또는 사용자가 수정한 TOML은 자동 채택/덮어쓰기하지 않는다. 실행은 별도의 Run 동작이며 등록 자체는 시뮬레이터를 실행하거나 도구를 설치하지 않는다.
5. 등록 후 pending review를 닫고 독립 테스트 목록을 표시한다. 한 `tb.sv`의 first/second는 `tb.first`, `tb.second`로 구분된다. 점이 포함된 test name을 Core reader/CLI에 연결했으며 경로 구분자나 `..` 단독 테스트 이름은 허용하지 않는다.

## 실행 manifest

생성물은 기존 version1 schema와 `[project]`, `[sources]`, `[simulation]`, `[[test]]`를 사용한다. waveform VCD/timing/assertion 기본값과 테스트당60초·순차 실행은 기존 경로다. package_order는 정렬을 마친 manifest 순서다.

source 그룹의 문자열은 기존 glob이며, 새 `{ file = "rtl/foo[0].sv" }`는 정확한 프로젝트 상대 파일이다. generated/link/부모 경로를 거절한다. 자동 생성 설정은 정확한 파일 표기를 사용해 대괄호/공백/한글이 glob으로 오인되지 않는다. include_dirs는 폴더 문자열로 유지한다.

원래 역할 선택은 주석으로 남긴다. 등록된 TOML은 일반 실행 설정으로 읽고 IDE pending writer가 다시 관리하지 않는다. **등록 후 새 파일 자동 추적, 테스트 추가/삭제 UI, 기존 사용자 manifest 병합, 역할 재편집·변환은 아직 없다.** 현재는 고급 TOML 편집 또는 후속 관리 UI가 필요하다. 새 파일을 자동 포함하는 glob은 기존 수동 설정에서 지원한다.

## 검증 기록

| 항목 | 결과 |
|---|---|
| 전체 자동 회귀 | **113 PASS / 0 FAIL / 0 SKIP**, runtime/language build 포함. ide/.dev/h5d2-tests-final.log 및 .exit=0 |
| 신규4시험 | 실제 slang pending 전환·Host file.top 등록/선택 run(대체 backend)·CLI check 일치, 재분석 오류/stale/외부 편집 거절, literal bracket/링크/경계, 취소/읽기 전용/잠금 정리 |
| 공식 화면 emission/전체 upstream 타입 | **0 errors / exit0**, ide/.dev/h5d2-compile.log |
| 실제 앱 격리 시험 | **7항목 PASS / exit0**, ide/.dev/editor-acceptance-O0g3xA/receipt.json, exit.json. 분류/저장/미저장 보호와 확인·등록 신뢰 차단. trusted GUI 등록 성공은 이 시험에 포함되지 않음 |
| 실제 slang→Host/CLI→Verilator/VCD | **5회 PASS / exit0**. Host 선택2회 + CLI 이름 지정1회 + CLI --all2회, 각 retained VCD 확인. 한글/공백 프로젝트 폴더·ASCII source 파일명. ide/.dev/h5d2-real-receipt.json 및 h5d2-real-ascii.log/.exit=0, fixture h5d2-real-한글 공백-aUVUcc. TB 원본 불변·root 파일 목록 확인 |

최초 runtime 타입 검사에서 literal source 표기가 include_dirs에도 적용되어 타입 오류1개가 발생했다. include_dirs를 폴더 문자열 배열로 분리한 뒤 최종 전체 검증이 통과했다. 최초 로그 보존.

실제 Verilator 시험의 첫 fixture는 DUT에 timescale이 없어 slang이 다른 설계 단위와의 불일치를 거절했다. 검증용 코드만 보완했다. 두 번째 fixture는 source의 `dut[0].sv`가 기존 Windows buildPaths 제한으로 실제 빌드 실패했다. **literal reader/semantic이 경로를 읽는 것과 Windows simulator adapter 지원은 다르다.** 현재 어댑터는 허용된 ASCII source filename을 요구한다. 한글·공백 프로젝트 폴더는 alias 경로로 지원하지만 같은 문자가 source 파일명에 있거나 bracket 등 제한된 문자가 있으면 빌드 오류로 안내한다. 등록 전 backend별 제한 안내 및 이름 alias 확장은 후속 과제다. 실패 로그/fixture는 보존한다.

## 남은 수용과 다음 순서

- 신뢰된 실제 앱에서 선택→등록→테스트 행 Run/선택/전체/파형을 물리 조작으로 수용한다. 현재는 Core/host 실제 도구 시험과 비신뢰 GUI 시험을 분리해 기록한다. 기존 사용자 신뢰 설정은 자동 변경하지 않는다.
- 등록 후 테스트 관리/자동 source 추적·Explorer hover Run·폴더 역할 아이콘/우클릭·drag 분류를 연결한다. 이번 static source 목록을 자동 탐색 완료라고 표현하지 않는다.
- H6 미저장 snapshot/IDE 자동 dump는 아직 미구현이다. 기존 테스트벤치에서 dump 코드가 없으면 파형 미생성 안내를 유지한다.
- 원자적 source snapshot은 아니다. 마지막 source 관찰과 manifest 게시 사이의 외부 변경, 최종 revision 검사/rename 사이 비협력 writer 경쟁, crash lock recovery는 기존 제한이다. 실제 실행은 다시 빌드하므로 의미 분석 성공을 실행 성공으로 간주하지 않는다.
- clean Windows/실제 설치/FST/enum/규모/복원/물리 UX 등의 기존 베타 gate와 프로젝트 간 격리를 유지한다. 배포 패키징 없음.

주요 코드: ide/runtime/core/import-settings.ts(config 생성/publish), config.ts(literal+file.top), host.ts(confirmReview), contract.ts, src/rtlSimulationHome.ts/rtlSimulationChannel.ts/rtlSpaces.contribution.ts. 신규 tests/import-confirm.test.mjs, 실제 도구 재현 .dev/h5d2-real.mjs. 다음 owner는 docs/handoff.md와 이 문서를 먼저 읽는다.
