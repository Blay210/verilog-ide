# 독립 RTL IDE 클라우드 인수인계

기준일: **2026-10-12 / H6D 완료 후**. 목적은 대화 기록 없는 실행자에게 사용자와 함께 발전시킨 제품 의도, 현재 코드, 근거와 다음 순서를 전달하는 것이다. 이것은 클라우드 환경을 실제 구축하거나 검증했다는 기록이 아니다.

## 1. 반드시 먼저 알아야 할 것

- 최종 제품은 **VS Code/Code-OSS 기반 독립 Verilog/SystemVerilog 설계·시뮬레이션 IDE**다. 일반 VS Code 확장 배포가 최종 목표가 아니다.
- 현재 독립 앱은 Code-OSS 소스를 직접 수정하는 방식이다. pinned upstream에 소유한 patch/overlay를 적용한다. 언어 기능은 내장 extension/LSP를 사용한다. 외부 extension 지원과는 다르다.
- `vsix/`는 기존 확장 프로젝트, `ide/`는 현재 독립 앱. **서로 완전히 독립**해야 한다. 코드가 필요하면 출처·라이선스를 보존해 명시적으로 이식하고 해당 프로젝트에서 관리한다. 형제/부모 소스 import/load, workspace/file/link 의존성, alias/junction을 금지한다.
- 제품은 FPGA 배포까지 모두 넣는 무거운 Vivado 대체물이 아니다. RTL 설계·시뮬레이션에 집중한다. 후속 Synthesis는 아이디어이며 첫 앱 범위가 아니다.
- **독립 앱은 아직 안정판/베타 전체 완료 상태가 아니다.** 최신 개발 검증이 통과한 것과 배포 수용은 다르다.
- 사용자 목표 규모는 **RTL 수백 파일 / 파형 신호 수천 개**다. 실제 대표 설계가 제공됐다는 뜻은 아니다.
- 클라우드로 옮겨도 제품의 첫 지원 환경은 Windows x64다. 클라우드 편의를 위해 Windows 경계나 기존 테스트를 제거하지 않는다.

## 2. 읽기 순서와 문서 우선순위

1. 루트 `AGENTS.md`, `ide/AGENTS.md`의 적용 가능한 지침.
2. 이 문서와 `docs/handoff.md` 상단, `docs/current-validation.md` 상단.
3. `docs/delivery-plan.md`, `docs/ide-implementation-plan.md`의 현재 H 단계 표.
4. `docs/architecture.md`, `ide/README.md`, `ide/DEVELOPMENT.md`.
5. 작업에 해당하는 최신 단계 acceptance 문서. H6는 H6A2/B1/B2/B3/C/D 문서.
6. 요구를 더 이해해야 하면 `docs/h0-product-decisions.md`, `docs/original-product-ideas.md`, `docs/product-audit.md`, `docs/project-roadmap.md`.

많은 문서가 새 상태를 상단에 추가하고 과거 기록을 아래 보존한다. 아래의 'H1부터 시작', '아직 fork하지 않음', '저장된 파일만 실행' 등은 당시 상태일 수 있다. 최신 사용자 합의와 최신 단계 근거가 우선한다. 초기 AGENTS의 premature fork 금지는 이미 승인·진행한 독립 앱 작업을 되돌리라는 뜻이 아니다. 기존 VSIX의 완료/시험 수를 IDE 완료로 재사용하지 않는다.

## 3. 사용자가 원하는 스타일

**엔지니어가 코드를 쓰고 실행·관측하는 데 집중하게 하며, IDE 설정을 배우게 하지 않는다.** 깔끔한 VS Code 느낌, 가벼운 화면, 눈에 보이는 명시적 버튼, 기능별 자연스러운 위치가 중요하다.

- Command Palette나 단축키 암기를 기본 사용 흐름으로 삼지 않는다. 키보드 실행은 보조로 지원한다.
- 같은 기능의 버튼을 여러 곳에 늘려 복잡하게 만들지 않는다. 진행/결과/경고는 작고 명확하게 표현하고 반복 팝업은 피한다.
- 입력이 애매하면 의미 분석과 검토로 확인한다. 이름/폴더만 보고 확실한 사실처럼 표시하지 않는다.
- 원본 RTL과 폴더 구조를 보존한다. 기존 프로젝트를 열었다는 이유로 rtl/tb를 만들거나 설정을 덮어쓰지 않는다.
- 편리함을 위해 자동 저장, 무승인 설치, 보안/신뢰 변경, 잘못된 과거 결과 대체를 하지 않는다.
- 구현 요청은 실제로 끝까지 진행한다. 일상적인 가역 선택을 매번 사용자에게 묻지 않는다. 큰 제품 방향·엔진 착수·새 설치 승인은 별도다.
- 한국어로 간결하게 결과와 다음 할 일을 설명한다. 무엇을 검사했는지와 남은 한계를 솔직하게 구분한다.

## 4. 확정된 작업 공간 UX

- 왼쪽 아이콘 바의 핵심은 **Code / Simulation** 두 작업 공간이다.
- Code는 Explorer/소스 탭을 제공한다. Search와 Source Control은 기존 결정/구현 범위를 확인하고 임의 제거하지 않는다.
- Simulation은 Explorer 폭의 별도 목록 사이드바 대신 **중앙 Simulation 홈과 파형 탭**을 사용한다. 파형에 넓은 공간을 준다.
- Terminal/Output 하단 패널과 실행 서비스는 공통이다. 공간 전환으로 내용을 지우거나 실행을 종료하지 않는다.
- 공간별 탭·선택·커서·스크롤·배치·파형 신호·zoom·시각을 보존한다. 미저장 소스 문서는 공유한다.
- Simulation 최초 진입은 홈, 이후 마지막 탭 복원. 실행 성공/실패가 파형을 자동 열거나 화면을 강제로 바꾸지 않는다. 출발 화면을 유지하고 결과 버튼으로 이동한다.
- Testing과 Simulation의 사용자 진입을 Simulation으로 통합한다.
- 첫 독립 앱에서 **Diagram, Chat, 외부 extension 설치/Marketplace는 제외**한다. 내장 언어 extension은 허용된 내부 구현 방식이다.

## 5. 프로젝트·테스트·TOML 정책

- source-first: rtl/tb/README/rtl.toml 중심의 작은 프로젝트. 모든 생성 input/build/log/result/trace는 `.rtl/`에, 공유 도구/캐시는 프로젝트 밖에 둔다.
- 새 프로젝트 생성 명령에서만 최소 rtl/tb 구조를 만든다. TOML 없는 기존 폴더는 먼저 읽기 전용 탐색 → 사용자 분류 검토 → 명시적 저장/등록.
- TOML은 IDE가 보통 관리를 돕고 사용자는 고급 조정만 한다. **현재 모든 TOML을 무조건 자동 수정하는 구조는 아니다.** IDE가 소유한 canonical imported 설정만 관리하며 수동/외부/미저장 변경을 보호한다.
- 폴더 우클릭 RTL/Simulation/제외/상속 해제와 역할 아이콘이 있다. 폴더 역할과 파일 kind/package/helper/실행 top은 다른 개념이다.
- 새 source 구성 변경은 감지·안내한 뒤 관리 Apply에서 재탐색/검증/적용한다. Run 전에 조용히 TOML을 바꾸는 정책이 아니다.
- 한 파일의 두 실행 top은 각각 독립 테스트다: `tb.v`의 `top1/top2` → `tb.top1/tb.top2`. 목록·결과·파형·이력·기본 보기 모두 구분한다.
- 인식된 TB 파일의 **Explorer 파일 행 hover ▶**가 있다. 여러 top이면 QuickPick, 취소는 무실행. 단순히 tb 폴더 안 모든 파일을 실행 대상으로 보지 않는다.
- manifest 기준 경로, 안정적 source 순서/중복 제거, package/include/defines, timing/assertion과 timeout/취소를 보존한다.

## 6. 편집 기능의 의미와 요구

- 예약어/지시문/시스템 함수(`initial`, `` `timescale``, `$display`, `$monitor` 등) 자동완성은 기본 제공 범위다.
- module 이름은 프로젝트 전체에서, wire/reg/logic 등 신호는 실제 접근 가능한 module/function/block/package/import scope에서 추천한다.
- 외부 모듈 인스턴스의 `.` 포트 추천은 해당 모듈의 아직 채우지 않은 포트를 사용한다. parameter/port/function signature, type/width 안내, definition/diagnostic/semantic token 경계를 유지한다.
- 단순 keyword snippet을 semantic 분석이라고 부르지 않는다. semantic은 slang 기반 별도 서비스, simulation은 Verilator다. 진단 출처와 backend 미지원/실행 오류를 구분한다.
- module/package/case 등 명시적 template의 Tab placeholder를 유지한다. 사용자 마지막 요구의 `begin`은 즉시 여러 줄, `always`/`always_ff`는 이벤트 placeholder+본문 begin/end, `always_comb`/`always_latch`는 begin/end template다.
- 이는 **명시적 snippet 선택**이다. 임의 if/always/for 입력/Enter에 begin/end를 강제 삽입하지 않는다. 기존 closer/comment/string/indent와 보통 editor 단축키를 보존한다.
- Verilog 계열 syntax highlight와 전용 파일 아이콘을 보존한다. 현재 native 편집기 의미 기능 수용 근거는 `ide-h3m-trusted-semantic-acceptance.md`다. 물리 추천 선택/색깔 육안 검증 전체와 구분한다.

## 7. 파형과 결과 UX

- 현재 내장 파형 UX를 독립 앱 전환 때문에 새로 갈아엎지 않는다. Vivado 같은 읽기 쉬움과 가벼움을 원한다.
- 신호 추가/제거는 Signals catalogue에서 관리한다. 행의 중복 X 제거 방향, 순서 변경은 drag/drop, Ctrl/Shift 선택과 그룹 이동을 유지한다.
- 큰 눈금/작은 눈금, 정확한 cursor/grid 정렬을 유지한다. **viewport 시작 기준 상대 시간은 사용자가 싫어한다.** 절대시간을 기본으로, 긴 시각은 두 줄 등 정확한 표시로 압축한다. `waveform-absolute-time.md`와 alignment 문서 참조.
- Cursor A/B UI를 다시 만들지 않는다. 단일 Cursor와 pointer mode **Cursor / Zoom range**다.
- bus 전체/개별 비트 펼침, test별 여러 saved view와 default preset을 유지한다. 내부 저장 위치는 `.rtl/waveform-views/`.
- enum을 숫자 대신 이름으로 표시하는 것은 요구다. **독립 IDE enum 소스 매핑은 아직 연결 완료가 아니다.** VSIX의 기능 완료를 이식 완료로 오해하지 않는다.
- PASS/FAIL은 당시 실행 결과다. 현재 입력 변경(stale)과 새 결과 존재는 별도 상태이며 PASS를 변경 때문에 FAIL로 바꾸지 않는다.
- test/run/input/trace identity를 명시한다. 이전 파형을 새 결과로 덮어쓰지 않으며 최신 실패/no trace에서 이전 파형을 최신처럼 열지 않는다.
- 미저장 기존 RTL/header는 실행 시작 시점 복사본으로 실행한다. 원본 자동 저장 없음, 실행 후 추가 편집은 진행 중 입력을 바꾸지 않는다. 미저장 TOML은 실행/관리 보호 대상이다.
- 사용자는 `$dumpfile/$dumpvars`나 C++ harness를 쓰지 않는다. IDE/CLI의 managed Verilator C++ driver가 자동 trace를 생성한다. 기존 dump 코드는 원본에서 제거하지 않는다.
- VCD/FST/off **생성**은 지원한다. 내장 뷰어의 FST **표시**는 미연결이다. 두 가지를 혼동하지 않는다.

## 8. Diagram·자체 엔진은 보존된 후속 방향

첫 독립 앱에서는 제외한다. 다시 시작할 시점에 사용자와 구체화한다.

Diagram의 의도는 hierarchy tree만이 아닌 회로/schematic/architecture canvas다. 현재 scope의 submodule은 내부를 숨긴 block, 이 scope의 배선·연산·저장값을 보여준다. 4×4 WS systolic array는 input_skewer, 16 mac_pe, output_harvester와 그 연결, mac_pe 내부로 들어가면 곱셈/덧셈/weight storage 등 해당 module 연산을 본다. pan/zoom/Fit/내부 진입, 나중에 임계 zoom에서 내부가 펼쳐지는 연속성을 원한다. 업데이트는 코드 입력마다 강제하지 않고 사용자가 구조 화면에서 명시적 Update한다.

실제 기록된 값과 계산/추측값, waveform replay와 simulator live pause/step을 구분한다. arbitrary procedural RTL을 완전한 합성 회로라고 주장하지 않는다. `structure-schematic-direction.md`, `visual-debugging-roadmap.md`, `pre-ide-roadmap.md`에 요구와 이전 VSIX 근거가 있다.

장기 자체 linter/compiler/simulator의 핵심은 언어 의미 일관성, 빠른 실행/컴파일, 변경 부분의 증분 재사용이다. C++ 경유 자체를 비효율로 단정하지 않는다. frontend 공유, 4-state/timing/NBA/assertion 범위, invalidation/caching, 정확성·성능 목표를 별도 논의한다. slang 교체나 자체 parser/backend 착수는 아직 승인된 다음 작업이 아니다.

## 9. 현재 코드와 구현 위치

| 위치 | 역할 |
|---|---|
| `ide/config/upstream.json` | Code-OSS 1.141.0, revision `2a59476c9bfcb90b3ddc372c36762471b7dfad1c`, archive/lock hash, Node 24.18.0 |
| `ide/config/patches.json`, `product.json`, `source-overlay.json` | pinned source에 재적용할 제품 변경/소유 파일/guard |
| `ide/src/rtlSpaces.contribution.ts` | Code/Simulation 공간·명령·진입 |
| `ide/src/rtlSimulationHome.ts` | 중앙 홈·관리·실행/결과·working copy·보관 소스/diff |
| `ide/src/rtlSimulationChannel.ts` | shared-process Node IPC |
| `ide/runtime/contract.ts`, `host.ts` | editor-free 계약/서비스 host·실행/이력/비교/보관 읽기 |
| `ide/runtime/core/` | 설정·탐색·입력 snapshot·identity·프로세스·이력 |
| `ide/runtime/verilator/` | managed C++ driver/build/run/trace adapter |
| `ide/runtime/waveform/` | 내장 VCD 모델/worker/view |
| `ide/language/` | 독립 앱 소유 내장 언어 확장·LSP/slang adapter |
| `ide/scripts/` | bootstrap/patch/prepare/build/검증 도구 |
| `ide/tests/`, `ide/tests/native/` | 자동 회귀 및 별도 실제 앱 수용 절차 |

소유 파일을 바꾸고 upstream overlay를 재적용하기 전에 현재 target이 이전 소유 원문과 같은지 확인한다. 기존 파일을 임의 덮어쓰지 않는다. 필요한 경우 확인된 이전 소유 bytes의 SHA256를 `previousSha256`로 기록한다. fresh upstream에 없던 overlay target은 바로 생성 가능하다. 수정은 ignored upstream에만 남기지 않고 소유 source/config에 기록해야 클라우드·다음 clone에 전달된다.

## 10. 현재 단계와 검증 근거

| 단계 | 현재 요약 |
|---|---|
| H1/H2 | pinned 독립 개발 앱·제품 정책·Code/Simulation·공통 패널·상태 보존 기반 구현. 세부 layout/복원/배포 audit 잔여 |
| H3/H4 | 자체 Core/Verilator·편집·Simulation 홈·VCD·preset·이력/stale 연결. 설치/내장FST/enum/규모/종합 물리 수용 잔여 |
| H5 | 기존 프로젝트 탐색/분류/managed TOML·여러 top·관리/변경 감지·Explorer ▶·폴더 역할 구현 및 단계별 실제 수용. writer/crash/규모/물리 종합 잔여 |
| H6A2 | 자동 managed VCD/FST/off, 원래 top 계층·원본 무변경·GUI/CLI 수용 |
| H6B1/B2/B3 | 기존 파일 미저장 실행 snapshot·동결·GUI 연결·saved/current 비교·package/header/BOM·재시작 보존 수용 |
| H6C | run별 보관 RTL/package/header 가상 읽기 전용 Code 탭·UTF8/hash 검증·삭제 원본 대응 |
| H6D | 선택한 과거 run 명시적 입력 비교, 편집 후 무효화, 보관/현재 소스 diff·삭제 파일 무생성 |
| H7 | 다음 안정화 단계. 전체 완료/수용 근거는 아직 없음 |

최신 Windows 개발 환경 근거: **145 PASS / 0 FAIL / 0 SKIP**, runtime/language build, 공식 본체 TS7 전체 타입 0 errors, 공식 emission 3파일 0 errors. H6D trusted native 4시나리오 PASS: 과거 matching→dirty 무효화/changed→실제 diff/삭제 package 거절→복구 matching. 최신 결과/history29/원형 보존, 새 simulation 없음.

이 숫자는 **과거 로컬 Windows 실행 결과**다. 이번 문서 작업이나 클라우드 실행 결과가 아니다. 자세한 근거는 `ide-h6d-selected-run-comparison.md` 및 이전 H6 문서. `.dev/h6d-*` 로그와 `.dev/import-ui-dbJf2o` 실제 fixture/profile/receipt는 Git 제외로 클라우드에 없을 수 있다. 문서만 보고 해당 파일이 클라우드에도 존재한다고 가정하지 않는다.

## 11. 클라우드 준비에서 실제로 주의할 제약

현재 저장소를 **클라우드에서 그대로 전체 빌드/시험 가능하다고 검증하지 않았다.** 런타임 분리 구조가 Linux에서 Windows 앱 수용을 보장하지 않는다.

- Git에 포함: root 문서/AGENTS, ide 소유 src/runtime/language/config/scripts/tests/examples/lock/license, 유지할 vsix 코드. 제외: node_modules/dist/out, `ide/upstream`, `.dev`, `.rtl`, 설치 도구, 사용자 profile/trust/secrets.
- 로컬 작업 경로 `D:\Dev\verilog_ide`는 설명용이다. 클라우드 repo root를 감지하고 상대 경로로 작업한다.
- `ide/scripts/bootstrap.ps1`, `environment.mjs`, `dev.mjs`, launcher는 Windows x64/MSVC/배치 중심이다. Linux cloud에서 doctor가 실패하는 것은 예상 환경 제약이며 guard를 삭제해 통과시키지 않는다.
- upstream은 `upstream.json`의 공식 archive/revision/hash/lock 기준으로 재구성한다. 독립 Git metadata와 pinned HEAD 필요. 클라우드용 준비가 필요하면 ide 안의 별도 작은 script/문서로 지원하고 Windows bootstrap은 보존한다. source baseline/version을 편의상 바꾸지 않는다.
- Node는 pinned 24.18.0 기준을 확인한다. ide 자체는 `npm ci`와 `npm run build:runtime`, `npm run build:language`가 시작점이다. lockfile을 자동 갱신하지 않는다.
- 전체 `npm test`는 pretest로 두 build 후 tests를 실행한다. 일부 semantic/import 관리 시험은 로컬 `.rtl-dev/tools/slang-11.0.0-python-3.14.7/python.exe` 경로를 사용한다. `semantic.test.mjs`에는 `RTL_SEMANTIC_PYTHON`이 있지만 모든 시험이 이를 사용하는 것은 아니다. Cloud용 verified slang runtime/경로 주입을 먼저 점검해야 한다.
- 로컬 사용 도구: Verilator 5.050/MSYS2 UCRT64/GCC16, slang11.0.0/Python3.14.7. 이 Windows executable을 Linux에서 사용하지 않는다. cloud simulator/frontend 설치·버전·지원 범위를 별도로 기록한다.
- 전체 시험이 준비되지 않았다면 가능한 순수 시험을 명시적 목록으로 수행하고 전체 미실행 원인을 남긴다. 의존성을 제거/가짜 성공/조용한 skip으로 기존 검증 요구를 낮추지 않는다.
- Windows batch/path/process-tree/설치 검증과 physical UI는 Windows 재확인 대상이다. POSIX 대소문자/프로세스 동작을 Windows 규약으로 바꾸지 않는다.
- 본체 전체 타입은 upstream **공식 `@typescript/native` TS7**을 사용했다. ide-local TS5.9로 whole upstream 검사하면 이전에 heap limit이 발생했다. `src/tsconfig.json` 기준 `--noEmit --skipLibCheck` 사용, 실제 새 환경 요구도 확인한다.
- Windows 로컬 설치 승인은 과거 해당 환경의 승인이다. 새 사용자 PC의 도구 설치를 포괄 승인한 것으로 재사용하지 않는다. cloud 준비도 적용되는 권한/네트워크 정책을 따른다.

## 12. 다음 작업 순서와 열린 항목

1. Cloud 작업 준비: 현재 commit/파일/lock 확인, 사용 가능한 OS/Node/도구 확인, 가능한 build/test 실행과 불가능한 항목 기록. 준비가 기존 제품 기능을 바꾸는 큰 작업으로 번지지 않게 한다.
2. **H6 acceptance matrix를 한 번 정리하고 범위 판정.** 자동 trace·미저장 snapshot·비교·보관/diff의 완료 근거와 잔여를 묶는다. H6 기능을 끝없이 추가하지 않는다.
3. **H7 안정화:** 중간 규모 비교/스캔/보관 읽기 비용, 시작/편집/파형 메모리, 취소·종료 child cleanup, 공간/탭/이력 복원, 손상/삭제 기록 회복을 측정하고 필요한 보완.
4. 비UTF8/untitled/deleted/foreign source 경계, 외부 writer/crash·빠른 root/선택/편집 race를 검증 가능한 범위부터 정리한다.
5. 남은 실제 화면 체크리스트를 누적 → 마지막 Windows 통합 세션 → 필요한 수정과 관련 회귀. 이후 사용 수용/배포는 사용자 판단에 따른다.

현재 알려진 제한: 보관 source UTF8·64MiB 창 cache(한도/eviction 평가 필요), history 기본 최근100(확장 읽기 최대1000), saved/current 비교 비용·전체 filesystem atomic snapshot 아님·tool environment 동일성 보증 아님. FST 내장 표시/enum 미연결. UI 요청 도중 물리 race/DPI/긴 시간·그룹 drag 등 종합 재수용이 남는다.

별도 깨끗한 Windows PC/VM은 **현재 사용자에게 없음**. 설치 승인→다운로드/pacman 서명→실행→파형 종단 및 network/retry/reuse 전 범위 검증을 완료라고 선언하지 않는다. 현재 도구 재사용 검증은 새 환경 설치 검증과 다르다. 확보 전에도 다른 구현/검증은 진행 가능하다.

## 13. 검증 운영·인수인계 갱신

사용자 최신 결정: 구현과 **화면 조작 없는 일반 자동 검증은 계속**한다. **Computer Use 및 화면/포커스를 차지하는 실제 앱 검증은 마지막에 한 통합 세션으로 모은다.** 기능마다 앱 창을 반복 띄워 사용자 작업을 방해하지 않는다. 화면 검증을 없애는 합의는 아니다.

누적 표에는 항목/관련 기능/자동 근거/남은 실제 조작/대상 환경을 남긴다. 자동 PASS를 물리 PASS로 쓰지 않는다. 실제 창·프로필·trust를 보존하고 신뢰 설정은 사용자가 처리한다. 통합 세션 전 범위/순서/예상 소요를 알린다. 실패 후는 관련 수정/자동 회귀 후 필요한 항목만 재확인한다.

작업마다 `PROGRESS.md`, `docs/handoff.md`, `docs/current-validation.md`, `docs/delivery-plan.md`, 관련 acceptance와 `ide/DEVELOPMENT.md`를 필요한 만큼 업데이트한다. 이 문서의 현재 단계/다음 순서도 이정표에서 갱신한다. 과거 로그를 새 테스트 결과로 표기하지 않는다. 문서 작업만 했다면 테스트 재실행 없음이라고 명시한다.

릴리스 패키징/설치/새 VSIX 생성, 사용자 창 종료/신뢰 변경, sibling 프로젝트 수정, 자체 compiler/simulator와 Diagram 재개는 현재 클라우드 인수인계 작업에 포함하지 않는다.
