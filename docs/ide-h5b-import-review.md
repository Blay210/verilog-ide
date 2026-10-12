# H5B — 독립 IDE 프로젝트 가져오기 검토 (2026-10-11)

H5A 탐색 Core를 Simulation 홈과 실제 shared-process IPC에 연결했다. **읽기 전용 검토 단계 완료이며 H5 전체 완료는 아니다.** TOML이 없는 프로젝트를 열고 Simulation의 새로고침을 누르면 파일·선언 후보와 역할을 검토할 수 있다.

## 구현과 사용

- 파일 검색, 소스 열기, 폴더 역할 지정, 파일별 예외 지정, 분류 초기화 제공. 역할은 자동 / RTL 소스 / 시뮬레이션 / 제외이며 파일 예외가 폴더 규칙보다 우선한다.
- 여러 module/program의 이름을 표시하지만 lexical 실행 후보일 뿐이다. 의미 분석 확정 및 실제 테스트 등록은 아직 연결하지 않았다. 후보 파일을 테스트 목록으로 자동 실행하지 않는다.
- 역할 변경은 해당 창의 검토 상태에만 적용된다. Code/Simulation 왕복과 같은 프로젝트 새로고침에서는 유지된다. 앱 재시작 후 복원이나 TOML 저장은 제공하지 않는다.
- 원본·TOML·.rtl을 생성하거나 수정하지 않는다. 기존 TOML이 있으면 기존 프로젝트 읽기를 유지하며 잘못된 TOML을 탐색 화면으로 우회하거나 복구하지 않는다.
- 파일/폴더/경고는 각각 처음 200개를 표시하며 파일 검색으로 목록을 좁힌다. 탐색 중 취소/재시도 지원, IPC 역할 수와 경로 길이 제한, 상대 경로 검증 유지.
- 독립적인 serializable discovery-model을 contract와 Core가 사용한다. renderer가 Node 탐색기를 가져오지 않으며 vsix/나 루트 구현을 참조하지 않는다.

## 실제 검증

| 항목 | 결과와 근거 |
|---|---|
| 전체 자동 검증 | **100 PASS / 0 FAIL / 0 SKIP**, runtime/language 빌드 포함. ide/.dev/h5b-tests-approved.log 및 .exit=0 |
| 이번 host 검증 3개 | multi-top/한글·공백 경로, 폴더/파일 우선순위·제외/복원·refresh 유지, 원본/생성물 불변·실행 차단, 잘못된 IPC/상대 경로·기존 불량 TOML 보존, 취소/재시도/종료 |
| 공식 화면 emit + 전체 upstream 타입 | **0 errors / exit 0**. ide/.dev/h5b-compile-final.log |
| 실제 앱 가져오기 | **4항목 PASS / exit 0**. ide/.dev/editor-acceptance-n3BMfs/receipt.json 및 exit.json. 실제 renderer/IPC, 역할 변경·제외/초기화, 공간 왕복/refresh 유지, 무작성 확인 |
| 기존 Simulation 앱 회귀 | **3항목 PASS / exit 0**. ide/.dev/editor-acceptance-SQdUxx/receipt.json 및 exit.json. 기존 2테스트 목록/IPC, 신뢰 제한, 미저장 소스 보존 |

앱 시험은 새 격리 프로젝트·프로필과 공식 명령 API로 진행했다. 실제 마우스 드롭다운/검색 조작, 200행 화면 가독성·큰 프로젝트 UI 성능은 별도 수용으로 남는다. Simulation 회귀는 비신뢰 상태였으며 새 trusted Verilator 실행을 반복한 것은 아니다. 기존 H3M trusted 편집 검증과 H3C 등의 실행 근거를 대체하지 않는다.

최초 전체 시험은 sandbox 경로/프로세스 권한 제한으로 실패·미완료했으며 해당 프로세스만 확인 후 정리했다. 승인된 재실행은 100개 통과했다. 최초 upstream 타입 검사에서 command의 unknown 인자 오류 1개를 발견해 경계 타입과 host 런타임 검증을 연결한 후 0 errors를 확인했다. 최초 로그는 보존한다. 원래 사용 중인 앱·프로필·신뢰 설정은 변경하지 않았으며 설치/배포 패키징 없음.

## 다음 실행 순서 / 인수인계

1. **H5C managed TOML 정책과 저장**: review 역할/여러 top을 저장할 스키마·소유 경계 정의. 기존 사용자 manifest 보존, 명시적 확정 후 원자적 생성/갱신, 변경 충돌·읽기 전용·취소 처리. 앱 재시작 후 복원 정책도 연결한다.
2. **H5D 의미 분석 확정과 실행 연결**: 파일 내 여러 top을 각각 관리하고 lexical 후보만으로 등록하지 않는다. include/define/package 설정을 검증하고 기존 시뮬레이션 결과 모델로 실행한다.
3. 폴더 우클릭 역할/아이콘·Explorer 실행 버튼·드래그 분류는 아직 미구현이며 managed 역할과 확정 테스트를 기반으로 연결한다.
4. 이후 H6 미저장 snapshot·IDE 자동 dump와 H4/H7 잔여 수용을 진행한다. clean Windows 설치, FST/enum/실제 규모/복원/물리 UX 및 기존 베타 gate는 유지한다.

주요 소유 파일: ide/runtime/discovery-model.ts, core/discovery.ts, contract.ts, host.ts, src/rtlSimulationChannel.ts, rtlSimulationHome.ts, rtlSpaces.contribution.ts, config/source-overlay.json. 검증: tests/import-review.test.mjs, tests/native/import.cjs, scripts/verify-editor.mjs import. ide/에서 npm test 후 owned overlay emit/전체 타입 검사, native import 실행. 새 owner는 root docs/handoff.md와 이 문서를 먼저 읽는다.
