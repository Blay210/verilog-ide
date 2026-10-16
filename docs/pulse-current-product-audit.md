> 2026-10-14 후속: 사용자가 baseline을 VSIX + α, 제외를 Diagram만으로 지정했다. [VSIX 실제 기능 직접 대조](pulse-vsix-parity-audit.md)가 27개 비Diagram command·설정/키·CLI·진입 연결을 확인한 최신 이식 판정이다. 이전 첫 앱 축소 범위/일반 요구 감사와 구분하며 F5·생성·CLI·parallel/tag·GTKWave 등은 실제 baseline gap으로 관리한다.

# Pulse 독립 IDE 요구·구현 감사 (2026-10-14)

## 판정 기준과 범위

사용자가 설정 없는 기존/새 폴더의 복잡한 Simulation 화면과 생성 흐름 부재를 보고한 뒤, 과거 합의·원래25개 아이디어·H0～H7 계획과 **현재 ide/** 코드를 대조했다. VSIX에서 구현한 기능을 독립 앱의 구현 완료로 간주하지 않는다. 이번 작업은 분석·기존 비화면 검사·문서 정리다. 제품 코드, 테스트 코드, 앱/ZIP/Setup은 변경하지 않았으며 Computer Use/설치/신뢰 설정 조작은 하지 않았다.

상태는 **구현**, **부분**, **미구현**, **의도적 후속**, **검증 부족**으로 구분한다. helper/타입/adapter 함수가 있어도 사용자 진입과 데이터 연결이 없으면 완료가 아니다. 정적 확인은 실제 화면·설치 검증을 대신하지 않는다.

현재 배포 후보는 Pulse ZIP/Setup 스터디 베타다. 실행·보관 소스·파형의 수용은 존재하지만 최초 이용 경험과 H7 전체 제품 수용이 완료됐다는 뜻은 아니다. 아래가 과거 roadmap의 VSIX 기능표보다 현재 독립 앱 상태를 판단하는 우선 자료다.

## 우선 해결할 제품 누락과 불일치

| ID / 우선순위 | 항목 | 판정·현재 근거 | 다음 완료 기준 |
|---|---|---|---|
| N01 / P0 | 새 프로젝트 생성 UI | **미구현**. Core의 `createProject()`는 있지만 workbench의 생성 진입/이름·위치/빈 폴더 안내에 연결되지 않았다. 최소 template는 TOML 중심이고 기본 RTL/TB 폴더 생성 UX가 아니다. | 새 프로젝트 동작 하나로 이름·위치·기본 구조/설정 생성, 기존 파일 미덮어쓰기, Code 진입. 예제는 선택 사항. |
| N02 / P0 | 최초 시작/기존 프로젝트 준비 흐름 | **부분**. File/Open Folder→설정 부재→Simulation 안의 import review로 진입한다. 프로젝트 생성/가져오기/최근 프로젝트를 안내하는 Pulse 전용 시작 흐름이 없다. | 프로젝트가 없을 때 생성/열기/최근; 기존 설정 있으면 바로 복원; 설정 없으면 짧은 자동 탐색 요약과 한 번의 프로젝트 사용 확인. 매 시작마다 강제 마법사 금지. |
| N03 / P0 | 최소 개입 자동 TOML | **부분**. 분류 저장은 pending TOML을 만들고, top 확인/등록은 별도의 실행 설정 공개다. 엔진 쓰기 경로는 구현됐지만 사용자가 내부 단계를 알아야 한다. 단순 폴더 열기는 의도적으로 쓰지 않는다. | 사용자가 생성/가져오기를 확정하면 내부 탐색·검증·설정 공개를 IDE가 처리; 모호한 항목만 질문. 기존 사용자 TOML/주석·수동 수정·충돌은 보존하고 설명. |
| N04 / P0 | Simulation의 준비/실행/고급 관리 분리 | **부분/UX 결함**. 설정 전에도 실행 toolbar·import review·빈 테스트 목록·로그가 동시에 나온다. 첨부 화면은 이 상태이며 테스트 홈 자체가 고장났다는 의미는 아니다. | 준비 전 간결한 안내; 준비 후 기존 깔끔한 테스트 홈; 분류/include/top 관리는 별도 프로젝트 설정에서 필요할 때만 노출. |
| N05 / P0 | 가져오기 파일 행 겹침 | **확인된 레이아웃 결함**. `paintReview()`의 파일/폴더 행에 `.rtl-simulation-test`를 재사용한다. 이 스타일은 checkbox/name/run/meta용 grid이며 import-source 버튼/설명에는 대응 배치가 없다. 첨부 사진에도 겹침이 보인다. | 가져오기 전용 행/열, 긴 파일명·한글·좁은 폭·다크/라이트에서 겹침 없는 실제 렌더 검증. |
| N06 / P1 | Code에서 실행하면 Code 유지 | **합의 불일치**. `RtlSpaces`의 `runFile`은 `await startFile()` 뒤 `show('simulation')`; `startFile`도 `await start()` 뒤 `showWave()`로 홈을 선택한다. Explorer 실행 완료가 공간/파형 선택을 바꿀 수 있다. | Code 실행은 Code 유지, 홈 실행은 홈 유지; 실행 완료만으로 이동하지 않기. 파형 버튼은 명시적 이동. |
| N07 / P1 | 재시작 작업 공간 복원 | **부분**. 열린 창 안의 Code↔Simulation 왕복은 보존·수용됐다. `active='code'`, waveform tab/selection은 메모리 상태이며 동일 파일들에 workspace storage 연결이 없다. 저장 preset과 Code-OSS source 탭 복원은 별개로 구현됐다. | 앱 재시작 시 마지막 공간/열린 run 탭/선택/커서·zoom 복원 범위 합의 후 구현. 사라진 결과·읽기 실패에 대한 복구 UX 포함. |
| N08 / P1 | 일반 RTL/package/header 자동 구성 관리 | **부분**. TB 폴더 catalog는 자동 추가/삭제하나 일반 imported source 구성 변경은 `sourceSync` 안내→테스트 관리·확인/적용 경로다. 기존 사용자 glob이 새 파일을 포함하는 경우와 IDE 전체 자동 관리의 완료는 다르다. | source/TB 선택 기억·원본 보존·자동 목록 갱신 정책 통합; 컴파일/실행은 자동으로 시작하지 않기. 모호한 구성 변경만 명시적 확인. |
| N09 / P1 | 자동 TB 표시 이름 | **표시 UX 누락**. `automaticName()`은 정상 basename.top에도12자리 hash를 붙인다. 홈/파형 탭은 `test.name`을 표시하므로 run ID를 탭에서 지운 뒤에도 새 자동 TB의 해시가 노출될 수 있다. | 내부 안정 identity는 유지하고 별도 display label로 `tb.top1`, `tb.top2` 표시; 중복은 폴더/tooltip으로 구분. |
| N10 / P1 | FST 파형 열기 | **부분**. 실제 FST 생성은 가능하나 `WaveformHost`는 VCD만 허용한다. 외부 열기 버튼도 `prepareRuntime`에서 숨긴다. 독립 앱에서 선택한 FST를 GUI로 확인하는 완결 흐름이 없다. | FST→내장 또는 명시적 외부 viewer 진입 연결, 지원 불가 상태/설정 안내. |
| N11 / P1 | 파형 enum 이름 표시 | **데이터 연결 미구현**. enum formatter/map helper/UI Auto(enum names)는 있다. 그러나 `mapTraceEnums`는 정의만 있고 host/GUI 호출이 없으며 `openReader()`는 reader metadata만 반환한다. | 동일 recorded run의 정확한 elaborated enum metadata를 VCD signal에 연결; 모호함·width mismatch는 숫자로 안전하게 fallback. |
| N12 / P1 | 중간 규모 파형 사용 범위 | **제한 구현/검증 부족**. VCD32MiB/10,000 signals/1,000,000 changes, 선택32 signals, 동시 reader4개, 저장 view20개 제한이다. 수천 신호를 읽는 것과 수백 신호 동시 표시/큰 trace 지원은 다르다. | 지원 한도 UX·실제 대표 trace 성능/메모리 측정; 필요한 범위를 측정한 뒤 lazy data/표시 한도 개선. |
| N13 / P1 | 결과 이력·전체 디스크 관리 | **부분**. 기본 최근100개 project history, 설정 journal 별도 보관은 있다. 오래된 run/build/snapshot/trace를 전체 디스크 예산으로 관리하는 정책·UI는 없다. | 사용자가 선택하는 보관/정리, pinned/open 결과 보호, 용량 표시·중단/복구 정책. |
| N14 / P2 | F5/공통 실행 진입과 기본 workbench 표면 정리 | **미연결/일부 후속**. RTL 명령·행 버튼은 있지만 own keybindings에 F5 RTL 실행을 등록하지 않았다. 사용자 첨부 화면에 기본 Run/Debug 아이콘·Run 메뉴도 남는다. | F5의 현재 TB/선택 테스트 의미·기존 편집 단축키 존중을 정하고 연결; 불필요 workbench 진입 정리. 단순히 기본 Debug를 RTL simulator로 설명하지 않기. |
| N15 / P2 | 사용자용 CLI 배포 | **부분**. `scripts/rtl.mjs check/test`는 같은 SimulationService를 쓰는 개발 CLI다. Setup에 이 개발 script 진입을 `rtl check/test` 제품 명령으로 배포하지 않는다. 기본 Code-OSS `bin/rtl-ide`는 RTL runner와 다르다. | 독립 설치판 CLI 지원 여부·호출명/탐색 경로를 정하고 배포/회귀. VSIX CLI 완료와 구분. |
| N16 / P2 | 세부 시뮬레이션 설정 UI | **부분**. TOML/Core는 defines/timing/waveform/timeout/tags/jobs 등을 가진다. 홈에는 이 전부를 조정하는 GUI가 없다. Core scheduler1～4와 별개로 SimulationService는 jobs1을 전달한다. | 필요한 고급 설정만 점진 노출; GUI/CLI 같은 모델. 병렬/태그 필터는 후속 범위로 구분. |

P0는 다음 기능 개발보다 먼저 해결할 초기 이용 경험이다. 아직 이 수정이나 새 release 빌드는 시작하지 않았다.

## 원래25개 요구의 현재 독립 앱 매핑

| 원래 ID | 요구 | 현재 판정 |
|---|---|---|
| O01 | module/parameter/port·함수 인수 정보 | **구현한 부분집합**: LSP signature/hover/definition. class/object/system callable 전체 semantic 지원은 아님. 유효한 프로젝트·semantic 도구가 필요. |
| O02 | 미연결 `.port`와 연결 신호 추천 | **구현한 부분집합**: 사용 port 제외·폭/타입/이름 순위. 완전한 assignability 보장은 아님. |
| O03 | `pkg::`/import 완성 | **구현한 부분집합**: compiler scope. class/object 전체는 후속. |
| O04 | 접근 가능한 변수·프로젝트 module 추천 | **구현한 부분집합**: scope/order/shadowing 및 project module·module tokens. prefix 기반이며 fuzzy/타입 위치 필터와 semantic rename/reference/outline은 미구현 확장 항목. 기본 예약어·directive·system task 완성은 별도 lexical 기능. |
| O05 | begin/end 명시적 Tab/Enter | **구현**: 현재 begin은 즉시 여러 줄, existing closer·주석·indent 보존. |
| O06 | module/package/case/always 템플릿 | **구현**: tabstops와 명시적 procedural begin/end template. 일반 if/for/always 입력마다 강제로 삽입하는 기능이 아니다. |
| O07 | 여러 TB·선택/전체/개별 실행 | **구현**: 여러 module/file·catalog/Explorer 버튼. 최초 설정 N01～05, 완료 전환 N06은 별도. |
| O08 | PASS/FAIL/취소/timeout·시간·로그 | **구현**: 실제 실행·보관 이력. 대규모 history 관리 N13 잔여. |
| O09 | simulator 교체 | **부분**: 계약+Verilator만 제품 연결. Icarus/XSim/상용 backend는 미구현 후속. |
| O10 | backend CLI 옵션 숨기기 | **구현한 기본 범위**: assert/timing/trace 관리. 고급 설정 UI N16, coverage는 후속. |
| O11 | source/package/include 관리 | **부분**: glob/안정 순서·package 의존 정렬·분류/변경 감지. N08; top별 최소 의존 source graph 및 mixed package/module 가져오기 지원은 미완성. |
| O12 | TOML 기반 가벼운 프로젝트 | **부분**: 설정 생성/보존 기반은 구현. N01～03은 미완성; 사람이 TOML을 먼저 써야 한다는 제품 방향은 아님. |
| O13 | 생성물 최소화 | **구현**: IDE 생성물 `.rtl/`. 사용자 RTL의 임의 파일 I/O를 전부 sandbox하는 기능은 아님. |
| O14 | GUI 승인 도구 설치 | **기본 구현/검증 잔여**: 발견·approval·진행/취소·smoke. clean Windows/network/retry/update 전체 수용 미완료. |
| O15 | Windows-first·다중 OS | **Windows 제품 우선**: 다른 OS의 unit 근거와 설치판 제품 지원을 구분. macOS/Linux 독립 앱 제품화는 후속. |
| O16 | 공유 toolchain과 프로젝트 분리 | **구현**: shared home/cache 밖, IDE/VSIX 코드 독립. |
| O17 | semantic과 simulation 분리 | **구현**: slang/LSP와 Verilator. 공통 자체 엔진은 후속 논의. |
| O18 | 독립 IDE/Core 경계 | **기본 구현**: Code-OSS 기반 Pulse/Setup 존재. 과거 roadmap의 ‘독립 앱 H 미구현’은 이전 VSIX 단계 기록. 전체 UX/성능 완성을 의미하지 않음. |
| O19 | GUI/CLI 공통 Core | **개발 CLI 범위 구현**, 설치판 CLI N15 잔여. |
| O20 | hierarchy 탐색 | **첫 앱에서 의도적 제외**. semantic hierarchy 기반 일부 이식, UI 없음. VSIX 기능과 구분. |
| O21 | module schematic·내부 연산·기록 디버깅 | **첫 앱에서 의도적 제외**. own Python에 analyze.py만 있고 internalOperations가 import하는 internal_operations.py는 없다. 타입/함수 존재를 전체 기능 이식으로 계산하지 않음. 이후 검토/이식 필요. |
| O22 | 블록 연결로 RTL 생성 | **미구현·의도적 후속**. 자유 배치/계층 zoom/live debugging도 별도 설계. |
| O23 | enum case skeleton | **명시적 code action 구현**. 기존 case의 누락 항목 자동 채움은 미구현 후속. N11의 파형 enum과 다름. |
| O24 | closing label | **명시적 action 구현**. 이름 수정에 따른 label 자동 동기화 미구현. |
| O25 | 실행 결과에서 파형 | **VCD 구현**, N10 FST/외부 진입 및 live 파형은 미연결/후속. |

## 최근 UX 합의 매핑

| 요구 | 현재 |
|---|---|
| Code/Simulation 분리·공통 Terminal/Output | 기본 구현/왕복 수용. N06/N07 및 작은 화면/보조 sidebar 세부 수용 잔여. |
| home icon·테스트 이름 탭·내부 × | 구현·최근 화면 수용. 자동 catalog label N09 잔여. |
| 파형 signal X/위아래 버튼 제거 | 현재 viewer는 hierarchy 선택/drag 중심. |
| Ctrl/Shift 다중 선택·그룹 이동 | 코드/자동 검증 존재. Windows 실제 그룹 drag 물리 수용은 남음. |
| major/minor 눈금·절대시간·커서 정렬 | 구현, 일반 짧은 파형 실제 수용. 매우 긴 절대시간/다양한 DPI는 별도 미검증. |
| bus 개별 bit 펼침 | 구현·실제 펼침/값 수용 근거 존재. |
| TB별 여러 saved view/default | 구현·이번 관련 검사 PASS. 최대20 view/선택32 제한, restart 열림 상태 N07은 별개. |
| TB 파일 hover Run | 구현·같은 파일 여러 top 선택. 미설정 프로젝트에서 자동 runnable은 아님; N06 전환 문제. |
| TB 폴더 역할·자동 추가/삭제·사용자 제외 | 구현·source/이력 보존. 후보는 complete module/폴더 역할·lexical hint 기반이며 helper module의 완전한 semantic 판별은 아님; 모호한 인식 UX 개선 필요. |
| 테스트별 코드 변경 표시 | 구현: 저장/현재 dirty input 상태를 PASS/FAIL과 구분. |
| 사용자 dump 코드 없이 trace | 구현: IDE managed C++ harness 사용, RTL 원본 무변경·VCD/FST/off. 별도 자체 엔진이 있어야만 가능한 기능이 아님. |
| Chat/외부 extension 설치 제외·SCM 유지 | 기본 정책 구현. 기본 workbench 잔여 surface/F5는 N14. |
| installer | 파일 생성 완료. 실제 설치·업그레이드·제거 수용은 미검증. |

## 구현 완료와 분리해야 할 검증 잔여

1. **최초 이용 경험**: 빈 폴더/기존 무설정/기존 일반 TOML/IDE 소유 설정/잘못된 설정을 같은 기능이라고 취급하지 말고 실제 화면 상태별 수용. 사용자 첨부 화면은 새 실패 근거다.
2. **Setup 설치·업그레이드·제거**: 아직 컴파일/PE/payload/hash만 확인. 현재 PC 프로필/기존 창을 보존하며 사전 승인 후 최종 세션에서 확인. clean Windows PC/VM은 없음.
3. **도구 새 설치**: clean MSYS2·slang 승인/거절·network 실패/재시도·부분 설치 복구의 Windows 종단 수용.
4. **파형·workbench 물리 경계**: DPI/고대비/긴 절대시간·Ctrl/Shift 그룹 drag, 작은 화면/Activity Bar 위치/auxiliary panel 조합.
5. **대표 실제 중간 설계**: 수백 RTL/수천 신호의 Windows cold/warm startup, idle, 편집→진단/완성, 첫 Run/파형, 오래 사용한 RSS/reader/source 회복. Linux 합성 개선을 앱 전체 수용으로 확대하지 않기.
6. **종료/복구 경계**: 실행 중 앱 닫기·미저장 안내 조합·재시작 UI 상태, 실제 외부 writer/crash와 디스크 예산 정책.

이번에 기존 관련 **50 PASS/0 FAIL/0 SKIP**: discovery, import-review, import-settings, language, waveform-views, recorded-source-provider, workspace-restore-lifecycle. 실제 이름·경로·중복/설정 소유 보호·lexical·view 저장·readonly/초기 provider 수명을 확인했다. 로그는 `ide/.dev/windows-integrated/pulse-product-audit-tests.log/.exit`이며 Git에 포함되지 않는다. 이50개는 최신 전체 회귀가 아니며 가져오기 레이아웃/설치/파형 enum 미연결을 통과시킨 검사가 아니다.

## 근거 파일과 다음 작업 순서

- 합의: `h0-product-decisions.md`, `original-product-ideas.md`, `ide-implementation-plan.md`. 과거 `project-roadmap.md`/`product-audit.md`의 기능표는 VSIX 시점과 후속 독립 앱을 구분한다.
- 실제 진입/화면: `ide/src/rtlSimulationHome.ts`, `rtlSpaces.contribution.ts`, `rtlExplorerRun.ts`; 생성 기반 `runtime/core/templates.ts`; import `discovery.ts`, `import-settings.ts`, `execution-document.ts`, `test-catalog.ts`, `runtime/host.ts`.
- 편집: `ide/language/src/server.ts`, `editor.ts`, `templates.ts`, `completions.ts`, `runtime/semantic/queries.ts`; semantic 도구 부재/미설정은 lexical 가능과 semantic 가능을 구분.
- 파형: `runtime/waveform-host.ts`, `runtime/waveform/model.ts`, `views.ts`, `enums.ts`, `waveform-ui/*`, `scripts/prepare-runtime.mjs`. 파형 formatter 존재와 recorded semantic metadata 연결은 별개.
- 배포·실제 근거: `pulse-internal-beta.md`, `pulse-windows-installer.md`, Windows 통합/current-validation. 새 UI/기능 변경 뒤 수용 기록과 후보는 다시 갱신해야 한다.

권장 순서: **N01～N05 프로젝트 진입/간결한 준비 UX 합의→구현** → **N06/N09 공간 전환·표시 이름 보완** → N08 관리 정책/N07 복원 범위 구체화 → N10/N11 파형 연결 → 설치/대표 성능과 필요한 화면 수용을 마지막에 묶기. 기존 엔진/VSIX 확장·Diagram·자체 compiler/simulator 착수보다 첫 사용자가 프로젝트를 준비하고 실제 Run까지 가는 흐름을 우선한다. 이 문서는 구현 승인을 대신하지 않으며 이번에는 기능 개발을 시작하지 않았다.
