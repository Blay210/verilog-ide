> 2026-10-15 최신: [첫 조회 비용·Simulation UI 지연 구성·독립 로컬 built 실행본](pulse-performance-final.md)을 적용했다. 전체405 PASS/1 POSIX SKIP와 후속8 PASS·공식 bundle/파일/CLI를 확인했다. 기존 Setup은 이전 버전이며 최신 실행은 `ide/Start-Pulse.cmd`다. 실제 새 화면/Windows startup·부분 compiler 증분은 잔여다. 아래의 소스 개발 실행/모든 첫 조회 비용 미보완 설명은 이전 기록이다.

# Pulse 남은 성능 병목: 후보 비교 (2026-10-15)

최신 후속: [E1 변경 후 worker 재사용](pulse-worker-rebuild.md)을 제품 built-in에 연결했다. 새 revision마다 독립 모델을 구성하며 compiler 자체의 부분 증분은 후속 E3다. 아래의 E1 전체가 미구현이라는 설명은 비교 당시 기록이다.

후속 구현: 사용자 승인으로 E1의 편집 예약/현재 작업과 최신 대기 변경 분리 및 E4의 비대기 응답/보호된 suggest 갱신을 적용했다. [현재 구현·한계·검증](pulse-edit-scheduling.md)이 최신이다. 같은 worker rebuild/E2/E3·S1/S2는 여전히 후속 작업이며 아래 ‘이번 검토’는 구현 전 비교 기록이다.

사용자 요청에 따른 검토 문서다. 이번에는 제품 코드·실행 방식·설정·Setup을 변경하지 않았다. 화면/Computer Use도 실행하지 않았다. 아래 효과는 명시한 기존 관측을 제외하면 설계상 기대이며 실측 개선 수치가 아니다. 현재 구현과 검증은 [이전 보완 기록](pulse-completion-performance.md)을 유지한다.

## 확인된 출발점

- 준비된 모델의 반복 조회는200개 작은 RTL의 Windows 합성 API 검사에서 중앙값3.16ms였다. 최초 모델 준비 약619ms, 첫 범위 조회 약360ms다. 실제 편집 화면의 응답 시간이나 복잡한200파일 설계 수용 수치가 아니다.
- `language/src/server.ts`의 `schedule()`은 편집마다 현재 generation을 취소하고 compiler 세션을 종료한다.250ms 뒤 분석을 예약하지만 `snapshot()`에서 completion/hover 등의 요청이 오면 이 예약을 취소하고 즉시 분석한다. 따라서 타이핑과 추천 요청이 겹칠 때 프로세스 시작/취소를 반복할 수 있는 구조다. 이 반복의 실제 비중은 아직 계측하지 않았다.
- Python `analyze()`는 준비 응답 전 전체 diagnostics·선택 top instance traversal·모든 module의 default elaboration을 수행한다. 자동완성에 필요한 준비와 전체 프로젝트 검사 완료가 같은 경로에 있다.
- 현재 `SyntaxTree.fromBuffers`는 source 그룹 전체를 하나의 compilation unit으로 읽는다. 파일별 parser cache를 곧바로 적용하면 앞 파일의 macro·directive·파일 순서·compilation-unit scope 의미를 바꿀 수 있다.
- 최신 개발 launcher는 `VSCODE_DEV=1`이다. 로컬 Code-OSS `nodeCompileCache.ts`와 `mainImpl.getCodeCachePath()`가 이 경우 각각 Node compile cache와 code cache 준비를 건너뛴다. 배포형 실행도 matching cache 생성·정확한 runtime/commit 등이 충족되어야 한다. 환경변수 하나 제거로 동일한 앱이 자동 최적화된다고 가정하지 않는다.
- 기존 main→최초 renderer log10.695/21.229초와 프로젝트 전환 reload 약11.1초, 작은 프로젝트 Core 읽기4.6~14.9ms를 관측했다. native 초기 구간이 주요 조사 대상이나 개별 CPU/I/O 원인은 미확정이다. 새 프로젝트 진입 화면의 실제 최초 사용 가능 시간도 미측정이다.

## 자동완성 후보

| 후보 | 구체적인 변경 | 기대 효과 | 비용·주의점 |
|---|---|---|---|
| E1. 분석 예약과 프로세스 수명 분리 | 최신 편집을 한 작업으로 합치고 자동완성 요청이 무조건 전체 분석을 앞당기지 않게 한다. bounded 상주 worker는 유지하면서 새 compilation/snapshot을 준비한다. 이전 결과는 version이 맞을 때만 게시한다. | 타이핑 중 반복 spawn/import/강제 종료와 쓸모없는 중간 분석을 줄임 | 중간 비용. Python이 분석 중이면 stdin 취소를 즉시 읽을 수 없어 obsolete 결과 폐기·최신 작업 큐·실제 종료 fallback 설계가 필요. 단순히 취소를 없애면 오히려 대기 시간이 늘 수 있다. |
| E2. 자동완성 준비와 전체 진단 분리 | 현재 문서/필요한 module·package·port의 의미 질의를 우선하고 전체 diagnostics와 모든 테스트 문맥의 무거운 순회를 뒤로 배치한다. unrelated TB 변경은 해당 test compilation만 갱신한다. | 편집 후 최초 유효 후보까지의 시간을 단축할 가능성 | 중간~높음. 공유 RTL은 여러 parameter/test 문맥의 기존 합의 규칙을 보존. module top만 보면 된다고 임의로 common RTL 후보를 좁히지 않는다. 전체 진단을 누락하지 않고 늦게 게시하며 ready/diagnosing 상태를 구분한다. |
| E3. 구문 트리·입력·의존 관계 재사용 | 변경되지 않은 compilation unit의 syntax tree와 compiler 입력을 캐시하고 변경 영향 범위만 다시 parse한다. 새 compilation에 유효한 tree들을 전달한다. | 프로젝트 규모가 커질 때 반복 parse/I/O 비용 절감. 사용자 제안의 다음 단계에 가장 가까움 | 높은 비용. include 대안·macro/define·source 순서·package·미저장 buffer·SourceManager lifetime을 키와 무효화에 포함. 현재 한 unit 구성을 파일별로 무조건 분해하면 안 된다. 새 compilation의 의미 분석까지 자동 증분이 되는 것은 아니다. |
| E4. 즉시 후보와 정밀 후보 응답 분리 | 예약어/현재 text의 안전한 보조 후보를 먼저 제공하고 최신 의미 분석이 준비되면 문맥을 확인해 보강한다. 이미 제공하는 basic provider가 실제 화면에서 지연되지 않는지도 계측한다. | backend가 준비되는 동안 사용자가 느끼는 공백 감소 | 중간 비용. VS Code가 여러 provider의 Promise를 합치는 경로와 suggest 갱신을 함께 검토해야 한다. provider만 하나 더 등록하면 즉시 표시된다는 보장은 없다. 후보 선택/키보드 위치를 흔들지 말고 lexical 추측을 compiler 확정 결과로 위장하지 않는다. |

### 사용자 추가 제안: 입력 중 추천, 구문 완료/잠시 멈춤 뒤 분석

사용자는 입력 중에는 자동완성을 제공하고, 한 구문/줄의 입력이 마무리되거나 세미콜론 등을 만났을 때 변경 부분을 분석해 준비된 정보를 갱신하는 방식을 제안했다. E1의 예약·수명 분리와 E3의 변경 영향 범위 갱신을 구체화하는 아이디어다. 구문 완료 trigger 정책 자체는 이전 후보에서 확정하거나 구현하지 않았다. 아래는 추천 설계이며 제품 동작 변경이 아니다.

- 입력 중에는 유효한 기존 module/package/port 인덱스와 현재 문서의 가벼운 문맥 처리를 사용한다. 자동완성 요청 때문에 무거운 전체 의미 분석을 즉시 시작하지 않는다. 바뀐 문서의 범위/이름을 과거 캐시에서 그대로 확정하지 말고 수정 위치·문서 version에 따라 영향받은 항목을 제외하거나 안전하게 보정한다. 새로 입력한 선언은 compiler 확정 전의 보조 정보와 구분한다.
- 분석 예약 신호는 code 문맥의 구문 종료 세미콜론·`end`/`endfunction`/`endmodule` 등 완료 지점과 짧은 무입력 시간을 조합한다.300~500ms 같은 무입력 대기는 실험 시작 후보일 뿐 확정 값이 아니다. Enter만으로 구문 완료를 확정하지 않는다.
- 문자열/주석의 `;`, `for(init; condition; step)` 중간의 `;`는 완료 신호로 보지 않는다. 포트/parameter 목록·함수 인자·enum·단순 이름 변경은 세미콜론 없이도 의미가 바뀌므로 `;` 하나만 기다리지 않는다. 완료 신호마다 동기 전체 분석을 실행하지 않고 연속 변경을 합친다.
- 준비 중 추가 입력이 들어오면 최신 변경을 다음 작업 하나로 합치고 구버전 결과의 게시를 막는다. 전체 작업을 매 키마다 강제 종료하는 기존 동작은 E1에서 바꿀 대상이다. 오래 걸리거나 취소/종료가 필요한 작업의 실제 프로세스 종료 보호는 유지한다.
- 저장/외부 header·package·설정 변경은 사용자의 입력 멈춤과 별도로 갱신을 예약한다. 실행을 요청하면 해당 입력 snapshot을 검증한다. 자동완성 캐시를 simulator의 실행 검증으로 대신하지 않는다.
- 분석 예약 시점과 분석 범위 축소는 별개다. 이 trigger를 적용해도 현재 slang 경로의 전체 compilation이 곧바로 부분 갱신으로 바뀌지는 않는다. E3에서 compilation unit/macro/include/package 의존 관계를 검증하며 재사용 범위를 넓힌다.

추천 흐름: **연속 입력 → 즉시 추천/변경 누적 → 구문 완료 또는 잠시 멈춤 → 영향 범위 분석 → 현재 version 결과만 인덱스에 반영**. 사용자가 입력을 멈췄는지와 ‘틀린 코드가 아닌 완성된 구문인지’는 구분한다. 불완전 코드 상태로 멈춰도 편집 지원이 영구 정지해서는 안 된다.

### slang11에서 가능한 것과 아직 확정할 수 없는 것

설치된 pyslang11.0.0으로 파일을 만들지 않는 작은 in-memory probe를 수행했다. 같은 SyntaxTree를 서로 다른 두 Compilation에 추가해 각각 같은 module을 얻었고, `getRoot()` 후 같은 Compilation에 `addSyntaxTree()`를 호출하면 `The compilation has already been finalized` 오류가 발생했다. 공식 API 문서도 이 제한을 설명한다.

따라서 E3의 현실적인 첫 실험은 **유효한 syntax tree 재사용 + 새로운 compilation 구성**이다. 완성된 compilation 안의 module을 삭제/교체하는 방식이나 compiler 전체가 즉시 증분 갱신된다는 가정으로 설계하지 않는다. 이 probe는 buffer/include/macro가 바뀌는 실제 프로젝트의 tree 재사용 정확성을 검증한 것이 아니다.

Python→C++ 상주 서비스 교체도 후속 후보지만 slang의 parser/semantic 본체는 이미 native 코드다. 먼저 Python 시작·traversal·직렬화가 지배적인지 계측해야 한다. 편집마다 전체 분석하는 구조를 그대로 두고 언어만 바꾸면 남는 비용이 크며 이번 우선안은 아니다. 자체 compiler/simulator 개발도 이번 성능 보완의 선행 조건이 아니다.

## 앱 시작 후보

| 후보 | 구체적인 변경 | 기대 효과 | 비용·주의점 |
|---|---|---|---|
| S1. 최신 소스의 최적화된 실행본과 시작 구간 계측 | Setup과 별개로 최신 bundled/production형 실행본을 준비하고 cache가 실제 enabled인지 확인. main/renderer/extension-host/RTL entry의 단계별 cold/warm 시간을 비교한다. | 개발 실행 특유의 모듈 로드·cache 차이를 분리. 잘못된 병목을 최적화하는 일을 줄임 | 중간 비용. 이전 Setup으로 새 소스를 평가하지 않는다. 큰 개선 가능성이 있는 후보지만 속도 배수는 아직 미확정. profile·trust·창 보존. visible 실행/`--prof-startup`은 새 사용자 승인 후 한 세션에 모은다. |
| S2. 시작 필수 기능과 Simulation UI의 실제 지연 로드 | 시작/프로젝트/필수 source provider 등록만 먼저 수행. SimulationHome·설정 UI·history/waveform 관련 실제 import/DOM 준비는 해당 기능 진입 또는 제한된 idle 시점으로 미룬다. | 첫 화면의 JS 평가/DOM/불필요 IPC 작업량 감소 | 중간 비용. 현재는 빈 창에서 객체 생성만 피하고 static SimulationHome import는 남는다. 보관 source provider는 editor restoration 전에 등록해야 하므로 provider 등록과 무거운 UI를 먼저 분리해야 한다. waveform worker가 이미 지연 실행되는 범위까지 다시 구현하지 않는다. |
| S3. 가벼운 프로젝트 시작 renderer를 앞단에 배치 | Electron 시작 초기에 project entry만 띄우고 Code-OSS workbench는 선택/제한된 background 시점에 준비한다. | 첫 프로젝트 시작 화면을 native workbench 준비와 분리할 수 있음 | 높은 구조 비용. project open 자체의 workbench 대기는 사라지지 않으며 화면 전환/오류/중복 초기화 처리가 필요. S1/S2 뒤에도 첫 화면이 충분히 느릴 때 검토한다. |

현재 프로젝트 전환은 `host.openWindow(... forceReuseWindow:true)` 경로다. workbench 재시작 없이 active project를 바꾸는 방식도 장기 후보지만 dirty editor/terminal/source control/언어 host/신뢰 경계가 함께 바뀌므로 별도 설계가 필요하다. 즉시 적용할 성능 패치로 취급하지 않는다.

## 추천 순서와 판정 기준

1. 비화면에서 E1의 취소/시작/입력 generation 계측과 작은 E3 prototype을 준비한다. 기능 적용은 다음 사용자 실행 지시 후 진행한다.
2. 최초 추천의 지배 항목이 전체 진단/모든 TB traversal이면 E2를 우선한다. 단순히250ms를0으로 만들거나 worker 수/메모리 한도를 늘리는 방식을 우선하지 않는다.
3. S1로 최신 최적화 실행본을 준비하고 S2의 경량 provider/UI 분리를 적용할 범위를 확인한다. 배포 installer 생성과 별개로 관리한다. visible 비교는 사용자 승인 후 묶는다.
4. 결과가 부족하면 E3의 의존 compilation unit 재사용을 본격 구현하고, S3/C++ 서비스/무reload project 전환은 비용과 증거를 다시 비교한다. 네 후보를 동시에 큰 변경으로 묶지 않는다.

비교는 API 반복 중앙값만이 아니라 **연속 입력 중 첫 유효 후보까지의 p50/p95·한 번 편집의 compiler 시작/취소 횟수·CPU/retained RSS·진단 최신성**, **프로세스 시작→프로젝트 버튼 사용 가능/소스 첫 편집 가능 시간·첫 Simulation 진입 시간**으로 한다. 지연을 다른 첫 클릭으로 옮기거나 정확도를 낮춰 얻은 숫자를 개선으로 판정하지 않는다. 절대 목표 ms는 실제 Windows 편집 측정 후 확정한다.

## 출처

- [slang Compilation API](https://sv-lang.com/classslang_1_1ast_1_1_compilation.html): getRoot 이후 변경 제한과 syntax tree 추가 API.
- [slang SyntaxTree API](https://sv-lang.com/classslang_1_1syntax_1_1_syntax_tree.html): fromBuffers의 compilation-unit 결합과 parser/source manager 경계.
- [VS Code 성능 진단](https://github.com/microsoft/vscode/wiki/Performance-Issues): startup CPU profile과 startup timer로 구간을 분리하는 방법.
- [VS Code 개발 성능 도구](https://github.com/microsoft/vscode/wiki/%5BDEV%5D-Perf-Tools-for-VS-Code-Development): startup 단계·활성화·code loading 계측.
- 로컬 근거: `ide/language/src/server.ts`, `analysis-session.ts`, `ide/language/python/analyze.py`, `ide/scripts/latest-launch.mjs`, `ide/src/rtlSpaces.contribution.ts`, `ide/upstream/src/vs/base/node/nodeCompileCache.ts`, `ide/upstream/src/mainImpl.ts`.

공식 웹 문서는 최신 API 설명이고 설치본11.0.0의 전체 보장으로 대신하지 않는다. 위 in-memory probe는 명시한 두 동작만 확인했다. 코드/빌드/회귀 테스트/앱 실행은 이번 검토에서 변경·수행하지 않았다.
