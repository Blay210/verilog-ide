> 2026-10-15 후속: [자동 추천 표시·패키지 namespace 보완](pulse-automatic-completion.md)을 적용했다. 처음 빈 결과 뒤에도 유효한 최근 typing intent로 표시하며 Esc/포커스/이동은 보존한다. snippet 자동 추천과 실제 package 이름/전체 후보 pool도 연결했다. 아래의 visible widget만 갱신하는 설명은 과거 동작이다.

# Pulse 시작·추천 후속 보완 (2026-10-15)

## 후속 피드백: 모듈 인스턴스 입력 위치

사용자가 속도 개선을 체감했다고 확인했고, module 추천 시 `instance_name` 기본 문구를 없애 달라고 요청했다. `moduleSnippet`을 `module_a ${1} (${2});$0` 형태로 바꿨다. 첫 위치에서 이름을 직접 입력하고 다음 Tab은 포트 괄호 안, 마지막 Tab은 세미콜론 뒤다. 포트 추천과 신호 범위·아이콘은 그대로다. 언어 타입 검사 exit0·관련5 PASS, 실제 Code-OSS SnippetParser에서 빈 입력 위치와1→2→0 순서/offset을 확인했다. 실제 editor 화면 검사는 실행하지 않았다.

현재 사용 중일 수 있는 앱은 수정하지 않고, 검증된 기존 native bundle을 복사한 별도 로컬 앱의 built-in 언어 bundle만 갱신했다. 최종 `ide/.dev/pulse-bundled-iWEtHc`의2,564파일 inventory·10 integrity·native CLI 버전/RTL CLI 두 top 발견과14자산 launcher 준비/검사 PASS. 최신 실행 파일은 `ide/.dev/latest-launch.json`이 선택하며 `ide/Start-Pulse.cmd`로 실행한다. 원시 근거는 `ide/.dev/windows-integrated/pulse-empty-instance-{snippet-tests,native-parser,build,verify,launch}.log`와 `pulse-empty-instance-candidate.json`이다. 아래9G7Hqv/405 PASS 등은 직전 성능 개선의 근거이고 이 작은 후속 수정의 전체 회귀 재실행 결과가 아니다.

이 기록은 [편집 예약](pulse-edit-scheduling.md)·[worker 재사용](pulse-worker-rebuild.md) 이후의 첫 조회 비용 및 로컬 실행 경로 보완이다. 사용자 요청에 따라 앱 창·Computer Use는 실행하지 않고 사용자가 최신 앱을 직접 체험한다. 기존 Setup/ZIP은 이번 변경을 포함하지 않는다.

## 적용한 변경

- compiler 입력 추적에서 이미 확인한 source/include 실경로를 같은 모델의 조회에 재사용한다. 경로 철자·Windows 대소문자/구분자를 정규화하고 모델별 최대4096개를 유지한다. **요청 파일의 실경로는 매번 다시 확인**하므로 외부 alias를 바꿔 예전 모델에 접근할 수 없다.
- 각 compiler scope의 원시 source 범위를 한 번 기록하고, 현재 조회 파일의 좌표만 UTF-16 위치로 변환한다. scope의 syntax/sourceRange 접근도 중복하지 않는다.
- root instance/instance body에서 나온 module 정의 이름은 로컬 변수 후보 조회에서 제외한다. module 정의 자체는 기존 별도 경로로 추천한다. 실제 하위 instance 이름·전역 선언·함수/블록 신호·package 후보는 남기고 최종 가시성과 선언 순서·독립 parameter/test 문맥 합의는 slang이 판단한다.
- 모든 symbol의 owning instance를 찾아 후보를 좁히는 시도는 첫 조회를 오히려 느리게 해서 제거했다. 함수 단위 cProfile에서 native property 접근이 지배적임을 확인한 뒤 단순한 후보 수집을 유지했다.
- `RtlSimulationHome`의 source provider와 Explorer 목록 연결은 생성 시 유지하고, 버튼·설정·테스트 DOM 구성은 Simulation 첫 진입 시 수행한다. source 복원 때문에 Simulation 화면까지 미리 만들지 않는다. 일부 빈 element 초기화와 정적 import는 남으므로 Simulation 전체 코드의 lazy import를 구현했다고 부르지 않는다.
- 로컬 최신 실행은 새 디렉터리에 official desktop bundle을 준비한다. 검증된 기존 Electron/native dependency를 복사하고 새 `out`/RTL 언어 bundle을 넣으며 이전 앱/Setup/ZIP/프로필은 덮어쓰지 않는다. native10개 integrity checksum을 갱신·검증하고 현재 code hash에서 고유 cache key를 만든다. 앱 resources가 준비된 built 모드로 실행하므로 개발 소스 실행의 `VSCODE_DEV`/소스 인자/상속 inspector 옵션을 사용하지 않는다.

## 검증 기록

전체 회귀406건은 **405 PASS / 0 FAIL / 1 POSIX SKIP**,401.1초다. 이후 독립 CLI 리소스 목록 보완과 새 회귀를 포함한 관련8건을 별도로 실행해 **8 PASS**를 확인했다. 서로 겹치므로 합산하지 않는다. runtime/language build exit0·전체 본체 타입/owned emission0 errors·compiled 설치/host/language/CLI 정책 및 diff 검사를 통과했다. 공식 desktop bundle은25개, post-process JS17개 syntax 검사 PASS다. 대표적인 작은200파일 시험은 실제 대형 RTL 프로젝트나 UI 응답 시간의 증거가 아니다.

| Windows 비화면 계측 | 최종 관측 | 해석 |
|---|---|---|
| source 편집 뒤4회 모델 재구성 | 유지 worker 중앙값577.7ms / 매번 새 worker806.7ms | 약16.7KiB의 합성200파일. 빌드/회귀가 함께 진행된 PC 부하를 포함한다. |
| 변경 뒤 첫 정밀 조회4회 | 109.5 / 155.9 / 202.2 / 205.0ms 범위 | 처음 AST scope 인덱스 준비는 여전히 남는다. 직전 기록190~262ms와 실행 부하가 달라 일정 비율의 개선을 보장하지 않는다. |
| 별도200파일 retained 조회 | 첫181.0ms / 반복 중앙값2.95ms | 새 일회성 전체 query726.5~912.9ms. 최초 모델 준비758.2ms와 별개다. |
| cProfile 첫 조회 분해 | 총164ms 중 AST 인덱스151ms | 모든 symbol owning-instance 접근 시302ms까지 악화한 시도는 제거했다. source 좌표/경로 외 native AST 접근이 다음 병목이다. |

초기 guard가 이전 중간 Python 산출물을 거절해 실제 diff를 검토하고 해당 이전 hash만 기록했다. 첫 로컬 후보의 최종 launcher 준비에서 `rtl-cli.cjs` 누락을 확인해 그 후보를 무효화하고 공식 리소스 목록에 추가했다. native CLI `--version`만 통과한 것을 RTL CLI 수용으로 오인하지 않는다. 기존 RTL CLI가 제공하지 않는 `--help`를 쓴 검증 가정도 수정해, 실제 소유 프로젝트의 `check`·한 파일 두 top 인식을 확인하는 검사로 바꿨다. Windows sandbox realpath EPERM은 path 보호를 완화하지 않고 소유 fixture 검사만 승인된 범위에서 다시 실행했다.

주요 새 회귀는 nested instance/전역 신호/module 정의 추천 공존, Simulation UI를 만들지 않은 상태의 보관 source/Explorer 정보 및 종료, built/development launch 인자·환경·동일 프로필 경계다. 기존 취소/deadline/alias/UTF-16/package/포트/원본 보존/파형 검사를 함께 유지한다.

최종 로컬 앱은 `ide/.dev/pulse-bundled-9G7Hqv/Pulse.exe`다.2,564개 파일 hash inventory·native10개 integrity·Electron-as-Node `--version`/x64·bundled RTL CLI의 임시 프로젝트/한 파일 두 top 발견을 확인했다. 그 프로젝트를 컴파일/실행하거나 GUI를 열지 않았다. code identity는 `c596dcecc5303bcac313f8472898409aec9eaa8edd1fad52b709803c8a2ac5e9`이며 원래 Code-OSS commit은 receipt에 보존한다. `Start-Pulse.cmd`는14개 자산을 확인하는 v3/bundled manifest로 선택 완료. prepare48.2ms·후속 `--check`284.6ms는 로컬 파일 준비 검사 수치이고 앱 startup 시간으로 사용하지 않는다.

빌드 중 실패한 후보는 최신 실행 대상으로 선택하지 않았다. 재검증은 `node scripts/prepare-local-bundle.mjs --verify <후보 경로>`로 **같은 code hash·cache identity·integrity**를 재확인하고 CLI/전체 파일 inventory만 다시 검사할 수 있다. 소스 수정 후 새 본체를 만드는 명령을 대체하지 않는다. 첫 실패 후보 `pulse-bundled-arwhX0`는 필수 CLI 자산 누락으로 receipt를 명시적으로 무효화했다. 이전 Setup/ZIP/`VSCode-win32-x64` 및 사용자 창·프로필·신뢰는 그대로다.

원시 근거는 `ide/.dev/windows-integrated/`의 `pulse-perf-all-tests.log`, `pulse-query-final-tests.log`, `pulse-perf-final-types.log`, `pulse-worker-rebuild-measurement.json`, `pulse-completion-session-measurement.json`, `pulse-persistent-cprofile.txt`, `pulse-local-bundle*.log/json`이다. 계측 JSON은 재실행 시 갱신되므로 최종 대표 수치는 이 문서에 별도 고정한다.

## 실행·후속 순서

사용자는 최신 코드 준비 후 `ide/Start-Pulse.cmd`를 실행한다. 상세는 [최신 실행 안내](../ide/TRY_LATEST.md). `.dev/latest-launch.json`이 가리키는 준비된 앱을 사용하며 실행 시 큰 파일의 전체 hash를 다시 계산하지 않는다. 자산 size/mtime가 바뀌면 재준비를 요구한다. 이는 로컬 개발 실행 확인이며 배포물 전체 검증을 대신하지 않는다.

1. 사용자 직접 확인: 빈 창이 별도의 프로젝트 시작으로 표시되는지, 첫 화면/폴더 열기 체감 시간, 편집 중 즉시 보조 추천과 준비 후 module/port 정밀 추천, Simulation·파형 및 Code 왕복.
2. 보고된 문제만 보완하고 필요할 때 승인된 한 화면 세션으로 통합 확인한다.
3. 사용자 수용/별도 요청 후 새 Setup 준비. 지금 설치판을 만들거나 설치하지 않는다.

**잔여:** compiler 부분 증분 parse/elaboration, 저장 watcher의 보수적 hard 무효화 중복, 처음 모델·query AST 순회, 자동 package 사전 process, static import/main thread 초기화 및 실제 Windows cold/warm UI 지연, 대표 수백파일/수천신호 설계의 메모리·장시간 검증. UI 시작과 실제 키 입력을 재지 않았으므로 ‘완전한 성능 안정화’나 이전 startup 경고의 해결을 확정하지 않는다.
