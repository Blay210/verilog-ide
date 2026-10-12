# H5D1 — 실행 top 의미 분석 확인 (2026-10-11)

H5C 분류 검토에 **top 선택과 읽기 전용 의미 분석 확인**을 추가했다. H5D1 완료이며 **H5D 전체/실행 등록 완료는 아니다**. 이번에는 manifest와 원본을 변경하지 않는다. 다음 H5D2가 확인 결과의 실행 설정 생성·등록 단계다.

## 구현·사용

- Simulation 가져오기 화면의 ‘실행 top 선택’을 펼쳐 파일별 module을 선택하고 ‘선택한 top 확인’을 누른다. 한 파일의 여러 top을 각각 선택할 수 있다. 후보 200개 표시/최대32개 분석 제한이며 역할 분류로 범위를 좁힌다.
- 검증된 기존 slang을 재사용하고 각 top을 독립 정교화한다. 도구가 없으면 도구 설정 안내를 반환하며 자동 설치하지 않는다. 비신뢰 프로젝트에서는 실행을 차단한다.
- RTL 역할의 non-header 파일이 공통 source 그룹, package 파일이 package 그룹이다. 선택한 TB 파일만 해당 테스트의 추가 source가 된다. simulation 폴더의 다른 helper는 자동 포함하지 않으며 공통 helper는 RTL 역할로 분류해야 한다.
- package 의존성을 slang으로 구하고 Core가 정렬한다. header의 폴더는 include 후보에 포함한다. ‘추가 분석 설정’에서 프로젝트 상대 include 폴더를 한 줄씩 추가한다. defines는 Core/IPC 요청에서 검증하지만 GUI define 편집은 아직 없다.
- top은 선택한 파일의 완전한 module이고 실제 elaborated root의 definition이 그 파일을 가리켜야 한다. program top·mixed package/module 파일은 이번 자동 경로에서 지원하지 않고 명시적 오류로 안내한다. 의미 분석 오류는 확인 결과를 만들지 않는다.
- `tb.sv`의 first/second는 미리보기에서 `tb.first`/`tb.second`로 구분한다. 같은 파일 이름/top의 충돌 또는 Unicode 이름은 안정적 경로 hash로 구분한다. 기존 실행 manifest test name 스키마의 점 허용은 H5D2에서 연결해야 한다.
- 결과는 확인한 테스트와 경고를 화면에 표시한다. **슬랭 확인은 Verilator 빌드 성공 보장이 아니며, 아직 테스트 목록 등록/시뮬레이션 실행은 없다.** pending TOML의 CLI/LSP 연결도 이전 단계와 동일하다.

## 경계·취소·변경

Core prepareImportTargets는 provider 계약을 받는다. Slang/기존 도구 검증은 runtime adapter에 있고 GUI/IPC와 분리된다. Python bridge는 IDE 자체 language/python에서 소유 runtime 빌드로 배치한다. 프로젝트 밖 공유 cache 사용, sibling/부모 구현 의존 및 설치 없음.

분석 전에 다시 탐색해 없어진/바뀐 후보를 거절한다. 선택된 source/include 입력을 분석 전후 fingerprint로 비교해 분석 중 변경을 거절한다. 이는 관찰된 저장 파일 검증이며 원자적 snapshot은 아니다. 미저장 RTL 편집은 포함하지 않는다. Core 분석60초 제한과 기존 slang 개별15초 제한, 공통 process 취소를 사용한다. Host는 신뢰·중복 실행을 막고 취소 후 재시도를 허용한다. 역할 변경·refresh는 기존 preview를 무효화한다. 표시된 preview는 분석 시점 정보이며 **H5D2에서 저장 직전에 다시 분석해야 한다**.

## 검증

| 검증 | 실제 결과 |
|---|---|
| 전체 자동 회귀 | **109 PASS / 0 FAIL / 0 SKIP**, runtime/language build 포함. ide/.dev/h5d1-tests-final.log 및 .exit=0 |
| 새 실제 분석5시험 | 독립 두 top·무작성, unknown module/후보 변경/취소 거절, package dependency/include 추론·unsafe 옵션 거절, host trust/preview 무효화, 분석 중 source 변경 거절·host 취소/재시도 |
| 캐시 경계 최종 보강 | 프로젝트 내부 `..cache`도 거절하도록 경로 구분자 경계 보완. 신규5시험을 재실행한 근거 ide/.dev/h5d1-targets-final.log/.exit |
| 공식 화면 emission/전체 upstream 타입 | **0 errors / exit0**, ide/.dev/h5d1-compile-final.log |
| 실제 앱 공식 명령 API | **7항목 PASS / exit0**, ide/.dev/editor-acceptance-QhtgsB/receipt.json 및 exit.json. 기존 review/분류/저장/미저장 보호와 새 의미 분석 신뢰 차단 |

최초 upstream 타입 검사에서 runtime bridge의 세 번째 인자가 소유 .d.ts에 누락되어 오류1개를 발견했다. 선언을 보완한 최종 검사는0 errors이며 최초 실패 로그는 보존한다.

실제 앱 시험은 비신뢰 격리 프로필이므로 **trusted GUI에서 실제 top 확인 결과를 표시하는 수용은 아직 미검증**이다. 실제 slang 성공 경로는 Core/host 시험 근거다. checkbox 물리 조작·대형 목록 UX, 앱 재시작 복원, clean Windows/실제 설치/FST/enum/규모 등 기존 gate 유지. 기존 창·신뢰 설정 변경과 배포 패키징 없음.

## 다음 H5D2 인수인계

1. 명시적 확정 동작에서 선택/옵션과 source·manifest revision을 다시 검증·분석한다. 현재 preview를 영구 권위로 저장하지 않는다.
2. package 순서·RTL/include/define·각 top 테스트를 실행 가능한 TOML로 원자적 전환한다. 기존 사용자 설정 보호/충돌/취소와 H5C 소유 정책을 유지한다. test name의 `file.top`와 충돌 정책을 Core reader/CLI에 일관되게 연결한다.
3. 실제 GUI의 신뢰된 확인→등록→개별/선택/전체 실행과 CLI 결과 일치를 검증한다. slang과 Verilator 진단 차이도 기록한다.
4. 그 뒤 Explorer/폴더 UI 및 H6 snapshot/자동 dump. 아직 후속 compiler나 독립 synthesis를 시작하지 않는다.

주요 파일: ide/runtime/core/import-targets.ts, import-runtime.ts, host.ts, discovery-model.ts, contract.ts, src/rtlSimulationHome.ts/rtlSimulationChannel.ts/rtlRuntime.d.ts, scripts/prepare-runtime.mjs. 시험 ide/tests/import-targets.test.mjs 및 tests/native/import.cjs. 공통 root docs는 계획/인수인계이며 빌드 입력이 아니다.
