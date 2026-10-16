# VSIX → Pulse 기능 동등성 감사 — Diagram 제외 (2026-10-14)

## 기준

사용자가 독립 IDE의 기본 제공 기능을 **VSIX + α**로 지정하고, 이번 비교에서 **Diagram만 제외**했다. IDE의 이전 축소 범위를 이유로 기존 VSIX 기능을 누락 목록에서 제외하지 않는다. 사용자 진입 방식은 Code-OSS command palette/Testing API와 동일할 필요가 없으나, 제공 동작·설정·데이터 연결·사용 범위는 대응돼야 한다. 예제 기능은 기본 홈을 복잡하게 만드는 것과 별개로 선택형 진입을 보존할 수 있다.

이번은 실제 `vsix/packages/vscode/package.json`의 **37개 command 중 Diagram 관련10개를 제외한27개**, 6개 설정·3개 keybinding, views/menus/customEditor, extension/editor/LSP/waveform/result/tool 코드, CLI의 subcommand/option, 공통6개 계층을 직접 대조했다. 과거 요구사항 문서만 대조한 [이전 IDE 감사](pulse-current-product-audit.md)와 다르다. 제품/테스트 코드·release는 변경하지 않았고 Computer Use/설치/전체 회귀는 실행하지 않았다.

비교 범위는 저장소 VSIX 구현0.3.1이다. 설치된 VSIX binary의 실제 사용 환경까지 검사한 것이 아니다. 정적 진입·동작 연결 감사이며, 동등한 Windows 물리 사용 수용까지 완료했다고 주장하지 않는다.

## 결론 — 아직 VSIX + α 동등성 미충족

공통 code 파일48개를 참고 비교했다. 같은 위치 대응46개 중20개는 LF 정규화 후 동일했고, 나머지는 이식/보완됐다. 대응 파일에서 공개 export 이름 누락은 발견하지 못했다. 단 **toolchain/viewer.ts(GTKWave provider)는 이식돼 있지 않다**. toolchain/index.ts의 barrel 경로 차이 자체는 기능 누락으로 계산하지 않는다. 이 기계 비교에는 semantic 구조 타입도 들어가므로 ‘48개 비Diagram 기능 완료’라는 뜻이 아니다.

핵심 차이는 아래12개 사용자 기능군이다. 공통 helper가 존재해도 GUI/CLI adapter가 연결되지 않았거나 기존 사용 범위가 축소됐다.

| Gap | VSIX에서 실제 제공 | Pulse 현재 상태·근거 | 동등성 완료 기준 |
|---|---|---|---|
| G01 / P0 | `rtl.createProject`, `rtl.createExample` 및 설정 부재 시작 안내 | **미연결**. Core template만 있고 생성/예제 workbench 동작 없음. 새 폴더 생성과 간결한 가져오기 UX는 α에서도 필요. | IDE에서 최소/예제 생성 가능·기존 파일 미덮어쓰기. 기본 화면에 예제를 강제로 노출할 필요는 없음. |
| G02 / P0 | F5 현재 TB 실행·editor title Run 버튼 | **누락**. IDE keybindings는 Enter/Tab뿐이며 editor/title 메뉴 없음. Explorer hover 실행은 이와 별개로 구현됨. | 현재 파일/복수 top 선택·F5/편집기 버튼 또는 합의한 동등 진입, Code 유지. |
| G03 / P1 | 태그 표시·`rtl.runTag`·Testing tag 선택 | **누락**. Core target.tags는 있지만 홈 표시/태그별 선택·실행 진입 없음. | 저장된 tags로 필터/실행, 개별·전체와 같은 취소/로그/결과 보호. |
| G04 / P1 | 제한된 병렬 실행 (`project.jobs`, CLI `--jobs 1..4`) | **축소**. Core scheduler는 있지만 IDE `SimulationService.run`이 jobs1을 고정한다. | 기존 jobs 설정과 명시적 선택을 동일한 제한/격리로 적용. UI progress/취소·history 경합 검증. |
| G05 / P1 | `Run History` 전체 실행 목록·현재 TB와 무관한 이전 결과 동작 | **부분**. 홈은 현재 `state.tests`별 dropdown을 만든다. 결과는 저장되어도 정상 프로젝트에서 삭제/제외된 TB의 결과를 전체 이력 화면으로 선택하는 진입이 없다. historyOnly 오류 복구 화면은 이와 다르다. | 전체 history 목록·삭제/제외 TB 결과 읽기·로그/파형/보관 소스 접근. 결과 파일 보존만으로 완료 처리하지 않기. |
| G06 / P1 | 임의 VCD 열기·`.vcd` 기본 custom editor·파일 선택 dialog | **누락**. IDE는 등록/보관 run의 검증된 trace만 `WaveformHost.open(result)`로 연다. 자체 결과 열기는 구현됐지만 외부/기존 VCD 파일을 단독 열 수 없다. | 일반 VCD 파일 열기, 프로젝트 설정 없이도 viewer 사용. provenance 없는 파일을 기록된 결과로 오인하지 않기. |
| G07 / P1 | GTKWave 열기·FST 자동 외부 열기·내장 실패 fallback·`rtl.waveform.viewer` | **누락/미연결**. GTKWave adapter 파일 없음, 외부 버튼 숨김, 설정 항목 없음. FST 생성은 되나 앱에서 열기 불가. | 검증한 기존 viewer 재사용/필요 설치·internal/external 선택·FST/실패 fallback. |
| G08 / P1 | recorded RTL enum 이름을 실제 파형 metadata에 공급 | **미연결**. VSIX `recorded-enums.ts`→`recordedEnums()`→`mapTraceEnums()`→document.metadata가 실제 호출된다. IDE는 formatter/map helper만 있고 host에서 enumLabels를 만들지 않는다. | 동일 retained inputs/trace를 재검증해 실제 metadata 공급; 모호함/도구 실패는 안전한 숫자 fallback과 안내. |
| G09 / P1 | 도구 저장 폴더 선택·기존 설치 업데이트 동작 | **부분**. IDE toolsDirectory 설정/승인·검증/재시도 UI는 있지만 VSIX의 폴더 picker와 ‘Install missing components / update’ 선택이 없다. 모두 발견되면 planner가 Ready를 반환한다. | 프로젝트 밖 폴더 선택/저장·명시적 기존 도구 업데이트 진입, 공유 설치/승인/취소 보호. 기존 viewer 실행은 G07. |
| G10 / P1 | 여러 workspace folder의 프로젝트·테스트·결과 취급 | **축소**. VSIX refresh는 workspaceFolders를 순회한다. IDE 홈 refresh는 로컬 폴더1개만 허용한다. LSP의 다중 root 능력이 홈/실행 지원을 의미하지 않음. | 다중 프로젝트 사용자 흐름을 제공하거나 사용자와 명시적으로 제외 결정. 현재는 제외 승인 없는 baseline gap으로 기록. |
| G11 / P1 | 제품 CLI와 풍부한 옵션·동작 | **부분/미배포**. IDE 개발 `rtl.mjs`는 check/test name/all만 제공한다. 별도 아래 CLI 표 참조. | 기본 설치판 CLI 진입과 기존 비Diagram subcommand/option/실패·취소 의미를 보존. |
| G12 / P2 | Verilog/SV semantic token의 module TextMate fallback scope | **metadata 누락**. VSIX는 language별 `class`→`entity.name.type.module.*`를 선언하지만 IDE manifest에는 semanticTokenScopes가 없다. LSP module token 자체와 generic class coloring은 존재. | 기존 theme의 module 색 fallback mapping 보존·라이트/다크/semantic coloring 꺼짐 조합 검증. ‘module highlight 전체 미구현’으로 확대하지 않기. |

G01/G02는 이전 IDE 감사에서 첫 진입/편의로만 분류했지만, 직접 비교 결과 **이미 제공된 VSIX baseline의 누락**이다. G03/G04/G06/G09/G10/G11/G12도 원래 제품 요구 또는 후속 아이디어만이 아니라 실제 VSIX 구현 근거가 있다.

## 27개 비Diagram 명령의 대응표

명령 ID를 그대로 복제하라는 표가 아니다. 동일 기능을 다른 IDE UI로 제공하면 동등 진입으로 인정한다.

| VSIX command | IDE 대응·판정 |
|---|---|
| rtl.runTarget | 홈의 선택/행 실행은 대응. 독립 ‘chosen target 실행’ palette 동작은 직접 복제 안 됨; F5/current 진입은 G02. |
| rtl.selectTarget | checkbox/행·복수 top picker 대응. 다른 화면의 전역 selected target 모델은 그대로 이식하지 않음. |
| rtl.latestResult | 행의 최신 결과/로그·파형·source 동작 대응. toolbar 전역 last-result shortcut은 별도 없음. |
| rtl.createExample | **G01 누락** |
| rtl.createProject | **G01 누락** |
| rtl.refresh | 홈 새로고침/파일 이벤트 대응 |
| rtl.runAll | 전체 실행 대응 |
| rtl.runSelected | checkbox 선택 실행 대응 |
| rtl.runCurrent | **G02 현재 editor/F5 진입 누락**; Explorer 파일 실행 부분 대응 |
| rtl.toolchain | 승인 setup/검증/로그·재시도 대응, **G09 폴더 picker/update 누락** |
| rtl.resultActions | 최신/과거 행에서 로그·source·readonly recorded source·입력 비교·파형·현재 rerun 대응. **G05 전체 이력/제거된 TB 접근 부분** |
| rtl.setupLanguage | 내장 language tool setup 대응 |
| rtl.restartLanguage | 내장 retry analysis 대응 |
| rtl.runTag | **G03 누락** |
| rtl.history | 현재 TB별 dropdown 대응, **G05 전체 history 진입 부분** |
| rtl.openWaveform | 자체 recorded 결과 대응, **G06 임의 파일 열기 누락** |
| rtl.openWaveformExternal | **G07 누락** |
| rtl.stopSimulation | 홈 취소·공통 service cancel 대응 |
| rtl.resultLog | 홈의 선택 결과 로그 패널 대응. 파일 editor와 동일 배치일 필요는 없음. |
| rtl.resultWaveform | 결과 VCD 대응, **G07 FST/외부 부분** |
| rtl.resultRerun | 현재 등록 TB의 행 실행 대응. 보관된 코드를 다시 실행하는 기능이라는 뜻은 아님. |
| rtl.languageStatus | 내장 상태 bar/명령 대응 |
| rtl.runFile | Explorer hover·현재 파일의 복수 top picker 대응, editor/title는 **G02**, 실행 완료 공간 전환 불일치는 α 감사 N06 |
| rtl.runSimulationTest | 행 실행 대응 |
| rtl.runSimulationSelection | checkbox 선택 실행 대응 |
| rtl.openSimulationSource | 테스트 이름/source 열기 대응 |
| rtl.openSimulationWaveform | 최근/선택 run의 VCD 대응, **G07 FST/외부 부분** |

완전 동등이라고 단정하지 않은 chosen-target/global-last-result shortcut은 현재 홈의 대체 진입과 함께 남은 UX 확인 항목으로 기록한다. 별도 기능이 필요하면 숨겨진 command라도 유지할 수 있다. Testing API를 새 IDE에서 다시 중복 노출할 필요는 없지만 실행·필터·상태 기능은 빠지면 안 된다.

## 설정·키·CLI의 직접 비교

VSIX 설정6개 중 `rtl.toolsDirectory`, `rtl.editor.autoCloseBlocks`, `rtl.editor.basicCompletions`, `rtl.editor.semantic`, `rtl.editor.templates`는 IDE 내장 설정에 대응된다. `rtl.waveform.viewer`는 **G07 미이식**이다. 설정 존재가 G09의 picker/update UX를 대신하지 않는다.

Enter/Tab 명시적 편집 keybinding은 이식됐고 current-TB F5는 **G02 누락**이다. keyword/directive/system-task 완성과 module/package/case/always template·closing-label action, LSP module/scope/port/signature/hover/definition/enum-case는 코드 경로가 대응된다. class/object·fuzzy 등 **VSIX에도 미구현이었던 범위**는 이식 누락으로 새로 세지 않는다.

| VSIX CLI | IDE 개발 CLI/설치판 상태 |
|---|---|
| rtl check | 이름/테스트 inspect만 대응. VSIX의 실제 compiler build/run verify·prepared source order 출력과 동등하지 않음. |
| rtl test name / --all | 개발 script 대응; 사용자 설치판 runner 진입은 미배포. |
| rtl test --tag TAG / --jobs 1..4 | parser 없음; service jobs1 고정. G03/G04/G11. |
| --project folder | parser 없음. 현재 process.cwd만 사용. |
| rtl history --limit / --json / --verify-inputs | 개발 CLI 동작 없음. Core history·비교 helper만 존재. |
| rtl init / --example | CLI 진입 없음. template helper만 존재. |
| rtl tools install/language --yes | CLI 진입 없음. GUI setup은 대체 제공하지만 script 자동화의 동등 기능은 아님. |
| SIGINT 취소 exit130 | IDE 개발 CLI는 결과/예외를 exit1로 반환하며 VSIX의130 분기가 없음. process cleanup 존재와 CLI exit 의미를 구분. |
| hierarchy / trace | Diagram·구조/recorded-port mapping 관련 CLI로 이번 비교 제외. 일반 waveform file opening/enum 표시까지 제외한 것은 아님. |

## 대응 구현으로 확인한 나머지 영역

- 원본 source-first/TOML 읽기·source/include/define·package 의존 순서·프로젝트 밖 tool home, 도구 탐색/승인·재시도·취소/검증 기본 기능. GTKWave 실행/provider·수동 update는 위 gap이다.
- Verilator 실제 build/run, PASS/FAIL/timeout/cancel, 생성물/이력/보관 trace·source 검증, 결과 source/log·입력 변경 표시. IDE에는 dirty-input snapshot과 관리 trace 등 추가 보완이 있다.
- VCD signal browser/search/scope, radix·signal color, signal 순서/drag·Ctrl/Shift 그룹 선택, bus 펼침, 단일 cursor/zoom range·major/minor 절대시간·edge/snap/go-to, per-TB 여러 preset/default. waveform UI의 render-profile/order/CSS는 동일, waveform/window-reuse는 이식 보완. 이들은 **검사할 구현 경로 있음** 판정이며 모든 사용자 profile/DPI/물리 조합을 이번에 실행해 통과시킨 것은 아니다.
- read-only recorded source·unknown/damaged trace 보호·취소/reader disposal·그룹별 상태/미지원 언어 보호는 대응. provenance 검증 강화가 외부 임의 VCD 진입을 아예 없애야 한다는 뜻은 아니다.
- source file language 등록/grammars/icons와 semantic 도구 retry/status·diagnostics 경로는 대응. theme metadata 차이는 G12.

## 제외·α·검증 부족을 분리

**유일한 기능군 제외는 Diagram**: showStructure/showStructureConnections/showScopeOperations/openStructureWorkspace/refreshStructure/openStructureSource/openStructureDefinition/structureBack/Forward/Up의10개 public command와 내부 schematic/operations/recorded hierarchy/공유 구조 cursor/clock 탐색. VS Code 자체의 Marketplace/외부 extension/Chat은 RTL VSIX가 제공한 기능이 아니므로 이식 baseline에 포함하지 않는다.

α 미완성은 기존 [IDE 감사 N01～16](pulse-current-product-audit.md)에 기록된 간결한 첫 진입/가져오기, grid 겹침, 자동 TB 표시 hash, source 자동 관리, Code 실행 후 공간 유지, restart 공간/파형 tab 상태 등이다. VSIX baseline gap과 겹치는 생성/F5/FST/enum/CLI 항목은 이제 이 비교표를 우선한다.

VSIX에도 있던 32MiB/32선택/동시 reader 등 제한, 전체 디스크 정책·자체 compiler/simulator·synthesis·추가 OS의 미완성을 IDE가 VSIX 기능을 빠뜨린 것처럼 계산하지 않는다. 단 사용자가 요구한 중간 규모 제품 수용과 향후 확장 gate로는 유지한다. 기존 설치판 실제 설치/제거·clean Windows·DPI/그룹 drag·대표 실제 설계/장시간/RSS의 미검증도 기능 누락과 별도다.

## 근거·다음 순서

직접 원문 근거: `vsix/packages/vscode/package.json`, `src/extension.ts`, `editor.ts`, `waveform.ts`, `recorded-enums.ts`, `recorded-source.ts`, `webview/*`; `packages/cli/src/cli.ts`, `packages/toolchain/src/viewer.ts` 및 공통 packages의 public exports. 대응은 `ide/language/package.json`, `src/*`, `language/src/*`, `runtime/*`, `waveform-ui/*`, `scripts/rtl.mjs`, `prepare-runtime.mjs`다. 기계 inventory는 ignored `ide/.dev/windows-integrated/pulse-vsix-code-inventory.json`; 재현 핵심은 TypeScript AST public export 목록·LF 정규화 동일성·manifest command/setting/key 추출이다. raw command/API 개수는 기능 동등성 점수가 아니다.

이전 감사의 기존 관련50 PASS는 유지하되 이번은 코드를 바꾸지 않아 반복하지 않았다. 이 결과를 VSIX 대조 전체 통과로 합산하지 않는다. 새 연결은 IDE 자체 구현/독립 copy만 사용해야 하며 런타임에 vsix 코드를 import하지 않는다.

권장 실행 순서: **G01 + α 첫 진입/레이아웃** → **G02 + Code 유지/표시 이름** → **G06/G07/G08 파형 연결** → **G03/G04/G05 실행·이력** → **G09/G11 도구·CLI** → **G10 지원 범위와 다중 프로젝트 UX + G12 theme**. 다중 root를 제외하려면 사용자에게 별도 결정받고 baseline 예외로 기록한다. 각 gap은 기능 구현·진입 연결·비화면 회귀·마지막 승인된 화면/설치 수용으로 닫고 새 후보를 갱신한다. 현재 ‘Diagram 제외 VSIX + α 완료’는 선언할 수 없다.
