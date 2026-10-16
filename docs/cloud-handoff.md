## 최신: Pulse (beta) Setup 생성 완료 (2026-10-16)

최신 앱에서 검증 전용 DOM/강제 클릭 명령·계측/개발 확장을 제외하고 Setup을 생성했다. 전체436건:435 PASS/0 FAIL/0 CANCEL/1 POSIX SKIP, 본체 타입0 errors, 앱2,558파일/native integrity10개·payload2,563개·라이선스30개·Inno6.4.1 exit0·최종 EXE/SHA256 대조 PASS다. `ide/release/Pulse-Setup-windows-x64-beta-20261016.exe`(260,697,847 bytes), 제어판 이름 Pulse (beta)·기존 제품 identity/경로 유지. `Start-Pulse.cmd`도 최신 후보를 선택했다. [산출물·해시·실패 보완·정확한 검증 범위·다음 작업](pulse-beta-20261016.md)가 기준이다. 실제 설치/upgrade/uninstall·새 화면/clean Windows는 미검증이며 사전 승인 없이 진행하지 않는다. 이전 artifact/사용자 창·신뢰·프로필은 보존했고 업로드/공개 게시 없음. H7 성능/대표 설계·후속 diagram/엔진 잔여는 유지한다.

## 최신: 프로젝트 모듈 이름 catalogue (2026-10-16)

새 위치의 모듈 추천 누락을 actual compiler/LSP로 재현하고 위치 독립적인 compiler-confirmed 이름 목록을 연결했다. 일반 module item/generate 위치만 빠르게 추가하며 정밀 scope 분석으로 부르지 않는다. rename/삭제/외부·설정 무효화와 Class/빈 cursor snippet은 유지한다. [최종 근거·실행·한도·잔여](pulse-module-catalog-completion.md)가 최신이며 새 화면/설치·배포 없음.

## 최신: 편집 중 의미 표시·추천 연속성 (2026-10-16)

module 색상·검증된 기존 포트·동일 identifier/qualifier 후보를 정밀 최신 모델과 별개 snapshot으로 유지한다. 이전 타입/위치를 hover·이동·진단에 쓰지 않는다. 전체420 PASS/1 POSIX SKIP·최종 관련40 PASS·language build0. [현재 조사·구현·한도·실행·검증](pulse-semantic-continuity.md)을 우선 읽는다. 실제 UI/대표 성능·부분 compiler 증분은 잔여이며 새 화면/설치·배포 없음.

## 자동 추천 표시·패키지 namespace 보완 (2026-10-15)

사용자 Ctrl+Space 의존 증상에서 빈 첫 결과 뒤 visible-widget만 갱신한 경로, snippet 중 quick suggest 차단 기본값, 일반 lookup에서 누락된 unimported package 이름을 확인했다. 실제 native pending typing intent(10초, Esc/이동/포커스/Code 전환 보호)·RTL 자동 추천 설정·project package 명시 열거·LSP 전체 후보 pool/로컬 필터를 연결했다. 패키지·bare-dot 미완성 포트의 actual compiler/LSP PASS. 전체413건412 PASS/0 FAIL/1 POSIX SKIP, 이후 expiry/native/restore 관련15 PASS(합산 금지)·runtime/language build0·최종 전체 본체 타입/emission0 errors. 최초 실패는 fixture의 native helper 누락/callback binding을 보완하고 전체 재실행했다.

최신 실행은 `ide/Start-Pulse.cmd`와 `.dev/latest-launch.json`을 기준으로 하며, 아래의 고정 후보 경로/이미 열린 목록만 갱신 설명은 이전 단계다. UI/Computer Use·Setup 실행 없음. 최초 정밀 분석 시간·부분 compiler 증분은 별도 잔여이고 새 자동 popup은 사용자 직접 체험 대상으로 남긴다. [원인·동작·검증·현재 실행](pulse-automatic-completion.md).

## 모듈 자동완성 입력 위치 보완 (2026-10-15)

사용자가 속도 개선 체감을 확인했다. 모듈 추천의 `instance_name` 문구를 제거하고 빈 인스턴스 이름 위치→Tab→포트 괄호 안의 순서를 유지했다. language build0·관련5 PASS·실제 Code-OSS snippet parser 빈 위치/순서 PASS. 새 화면은 열지 않았다. 언어 bundle만 갱신한 별도 로컬 앱의 파일/무결성·CLI·최신 실행 경로 검사를 마쳤으며, 최신 경로는 `ide/.dev/latest-launch.json`/`ide/Start-Pulse.cmd`를 기준으로 한다. 아래 고정된 이전 후보 경로는 과거 이력이다. [현재 수정·검증·실행 안내](pulse-performance-final.md).

## H7 첫 추천·초기 화면 보완과 최신 실행본 준비 (2026-10-15)

첫 query의 중복 실경로·전체 파일 좌표 변환·native scope 접근과 root module 이름 조회를 줄였다. 과도한 owning-instance 후보 분류는 계측상 악화해 제거했다. Simulation provider/Explorer는 유지하고 버튼·설정 DOM은 첫 진입으로 미뤘다. 전체406건405 PASS/0 FAIL/1 POSIX SKIP, 이후 resource/launch/overlay 관련8 PASS(합산 금지)·runtime/language build0·전체 native 타입/emission0 errors·compiled 정책 PASS. Windows 합성200파일의 첫 정밀 조회109~205ms·반복 중앙값2.95ms이며 실제 UI 수치는 아니다.

공식25 bundle·2,564파일 inventory·10 integrity·headless native/RTL CLI 두 top 검사 PASS. 최신 `ide/Start-Pulse.cmd`는 별도 `.dev/pulse-bundled-9G7Hqv`의 built 앱을 실행한다. 개발 소스 인자/VSCODE_DEV 없이 고유 native cache key와 기존 전용 프로필을 사용한다. 기존 Pulse 창을 정상 종료하고 실행한다. GUI/Computer Use/Setup 실행 없음. 다음은 사용자 직접 체험→문제 보완/필요 시 승인된 통합 화면 확인→사용자 요청 후 Setup이다. 부분 compiler 증분·최초 AST 준비·저장 watcher 중복·대표 실제 설계/Windows UI 성능은 잔여다. 아래의 E1/첫 query/startup 미구현 설명은 이전 기록이다.

[현재 코드·계측·실패 복구·최신 실행·잔여 검증](pulse-performance-final.md)를 우선 읽는다.

## H7 변경 후 compiler worker 재사용 적용 — 비화면 검증 완료 (2026-10-15)

source 편집 후 동일 worker에서 이전 모델/캐시를 해제하고 새 독립 compilation을 준비한다. id/revision·query별 soft cancel/15초 deadline·32슬롯·root hard cleanup·준비 중 open 정리 합류·64회 rebuild 후 교체를 연결했다. 최종 전체401건400 PASS/0 FAIL/1 POSIX SKIP·언어 build0·guarded overlay/compiled 정책/diff·9자산 launcher 준비/검사 PASS. Windows200개 작은 RTL의 모델 준비 중앙값은 새 worker502ms/재사용333ms였으며 첫 정밀 조회190~262ms는 남았다. 다음은 첫 정밀 조회 비용 분해/E2·E4 및 startup S1/S2다. 부분 compiler 증분/최초 정밀 조회/앱 startup·실제 UI 수용은 잔여다. [현재 계약·측정·검증·다음 순서](pulse-worker-rebuild.md)를 우선 읽는다. 화면/앱/Setup 실행 없음. 아래의 변경마다 worker 재사용이 미구현이라는 설명은 이전 기록이다.

## H7 편집 추천/분석 예약 분리 적용 — 비화면 검증 완료 (2026-10-15)

입력 중 추천 요청이 전체 분석을 앞당기거나 기다리는 경로를 built-in에서 분리했다. 일반400ms/구문 완료120ms debounce·최신 작업 하나·구 generation 게시 차단·이미 열린 suggest만 file/version/caret/focus 재검사 후 갱신을 연결했다. 최종 전체391건390 PASS/0 FAIL/1 POSIX SKIP·언어 build0·전체 native 타입/emission0 errors·compiled 정책/diff PASS,9자산 최신 launcher prepare/check 완료. 다음 구현은 같은 worker의 변경 후 rebuild와 최신 후보 준비 비용 감소이며 startup S1/S2도 잔여다. 부분 compiler 증분/같은 worker의 변경 후 rebuild·앱 cold startup 최적화·화면 수용은 아직 미완료다. 화면/앱/Setup 실행 없음. [현재 계약·검증·실패 복구·다음 순서](pulse-edit-scheduling.md)를 우선 읽는다. 아래의 모든 요청이 분석을 기다린다는 설명은 이전 기록이다.

## H7 프로젝트 진입·자동완성 재사용 보완 완료 — 비화면 기준 (2026-10-15)

빈 창의 별도 Ready 프로젝트 시작·Code/Simulation 전환 차단·최근 프로젝트/X·프로젝트 전환 전 native layout 복구를 연결했다. 사용자 새 정책: 실행 중 공간 왕복은 보존하되 종료 후 Pulse 공간/파형 탭/커서를 자동 복원하지 않는다. 최근/이력·보관 소스/trace·미저장 복구는 보존한다. 신호/모듈 아이콘·module/port snippet·RTL 색상/Emmet 억제와 EOF 단일 module에서 wire/reg/logic 후보가 빠지는 compiler scope 충돌을 보완했다.

편집 후 generation별 compiler 모델/source manager·범위 인덱스·선언 경계/qualifier별 후보를 메모리에 유지하고 실제 built-in 언어 클라이언트에서 조회한다. 파일/설정/watch/root 변경 시 폐기·확인 후 갱신, 취소/종료는 실제 leaf exit를 확인한다.2 retained worker·4 context·source32MiB/관측 RSS512MiB·scope cache128/8MiB·120초 유휴 해제이며 비지원/한도 초과는 기존 compiler 경로다. **compiler 자체의 변경 부분만 재분석하는 증분 구현은 아니다.** 최초/변경 직후 분석 대기·native static imports/개발 본체 cold startup은 잔여다.

최종 전체379건은378 PASS/0 FAIL/1 POSIX SKIP. 이후 EOF/별칭 경계 보완의 최신 관련56건55 PASS/0 FAIL/1 POSIX SKIP·retained multi-root 별도1 PASS(합산 금지). runtime/language build0·전체 본체 타입/owned emission0 errors·compiled 정책/script syntax/diff PASS.200파일 Windows 합성 API: 모델619ms/최초 조회360ms/반복 중앙값3.16ms, 기존 새 분석 경로941~1419ms·관측 RSS약38MiB. 실제 editor UI/전체 앱 startup 수용 수치가 아니다. 계측 fixture의 고정된 함수 hook22건 실패와 복구, UTF-8/한글 경로 및 EOF 원인도 기록했다.

최신 개발 실행은 ide/Start-Pulse.cmd; 새9자산 launcher 준비/검사 완료. **이번 화면/Computer Use·Setup 실행 없음.** 사용자가 직접 사용하거나 별도로 승인한 한 화면 세션에서 새 진입·native 지연·편집 추천·종료 정책·시뮬레이션을 확인한 뒤 Setup을 결정한다. 기존 Setup/ZIP은 이전 버전이다. [현재 코드·원시 근거 경로·한도·실패 복구·다음 순서](pulse-completion-performance.md)를 우선 읽는다. 아래의 재사용 미구현/종료 복원 요구는 이전 기록이다.

## 프로젝트 진입·종료 정책 변경과 자동완성 성능 방향 (2026-10-15)

빈 창은 Ready에서 별도 경량 프로젝트 진입으로 표시하며 Code/Simulation 전환·SimulationHome 생성/검사 대기를 분리했다. 사용자 새 결정: 실행 중 공간 왕복은 보존하되 프로젝트/앱 종료 후 Pulse 마지막 공간/파형/커서는 자동 복원하지 않는다. 최근 기록·이력·보관 source/trace와 미저장 복구는 보존한다. module/port snippet·종류 아이콘·scope별 lexical 신호 보조 추천·RTL 기본 색상/Emmet 억제를 반영했다. language build0·전체 본체 타입/owned emission0 errors·관련30 PASS·실제 slang/언어 서버/입력 무효화50 PASS(두 묶음 합산 금지). 빠른 lexical 우회 시도는 취소/generation 회귀2건으로 제거했다.

**자동완성 속도 개선은 미완료:** snapshot 분석 대기+별도 compiler query가 남는다. 다음은 Windows 요청 지연 계측→장기 분석 세션/의미 모델·메모리 인덱스 재사용→의존 항목 무효화/범위 축소다. 사용자 제안인 편집 중 백그라운드 갱신을 채택할 방향으로 구체화했으며 전체 compiler 증분 처리 구현 완료가 아니다. static SimulationHome import·개발 본체 초기화 지연도 잔여다. 새 UI/체감 성능/Setup은 미검증·이번 화면 실행 없음. [정책·검증 로그·실패 복구·다음 순서](pulse-completion-performance.md)을 우선 읽는다. 아래 복원 요구/상태는 이전 기록이다.

## 최근 행 강조·시작 지연 조사 (2026-10-14)

최근 제목 구분선/행 hover를 반영했다. 사용자 빈 프로젝트 Core 읽기14.9/5.0/4.6ms·무변경 확인, 기존 main→renderer 로그 구간10.695/21.229초 및 전환 reload 약11.1초. 개발 본체 초기화가 주요 후보이며 정확한 개별 CPU/I/O 원인은 미확정이다. RTL 생성/editor restore/UI mount/inspect timing을 추가했다. 관련26 PASS/타입·owned emission0 errors; 새 앱/화면/Setup은 실행하지 않았다. 다음 사용자 실행의 phase 로그→승인된 실제 UI 준비 시간→최적화된 최신 본체 번들(Setup과 별도) 검토 순서. [측정·한계·인수인계](pulse-startup-investigation.md)을 우선 읽는다. 아래는 이전 기록이다.

## 이전 Simulation 카드 통합 (2026-10-14)

사용자 요청으로 실행/테스트 두 카드를 합치고 프로젝트/개수/새로고침→추적 상태→좌 실행/우 이력·TB 파일/폴더→구분선/목록으로 정리했다. 목록은 남은 높이를 채우며 하단 로그를 펼치면 목록이 줄어든다. 설정은 제목 우측 테두리 없는 icon으로 이동했다. 관련26 PASS/타입·owned emission0 errors; 새 CSS 물리 화면은 미검증/화면·Setup 없음. 최신 실행 ide/Start-Pulse.cmd. [구현·근거·범위](pulse-unified-simulation-home.md)을 우선 읽는다. 아래는 이전 기록이다.

## 이전 설정·최근 목록 정리 (2026-10-14)

중복 최근 버튼 제거·목록별 X(native 최근 기록만 제거/확인창0), source 설정 토글 제거·설정 항목 바로 표시·용도별 설명/펼친 폴더·모듈 section, 현재 tool 위치 표시, 제외 TB 개별/한번의 전체 복원, 테두리 없는 아이콘·filled/hover 버튼을 연결했다. runtime build0·전체 본체 타입/owned emission0 errors·관련38 PASS/0 FAIL. 새로운 물리 UI는 미검증이며 화면/Setup을 실행하지 않았다. 최신 launcher 준비 후 ide/Start-Pulse.cmd로 실행한다. [구현·근거·한계](pulse-settings-refinement.md)을 우선 읽는다. 아래는 이전 기록이다.

## 이전 시작·Simulation 보완 (2026-10-14)

사용자 사진의 시작 화면 실행 카드 노출은 hidden보다 display가 우선한 스타일 문제였다. 숨김 규칙·카드 없는 프로젝트 시작·실제 최근12개 프로젝트 목록, 작업 구역/Code 도구 구분선, Simulation 상단 외부 파형/폴더 버튼 제거, 새로고침 아이콘, TB 가져오기/폴더/추적 상태, blur 설정 팝업 통합을 반영했다. 사용자는 외부 TB를 프로젝트 안으로 복사하기로 선택했고 원본/TOML 보존·충돌/링크/stale/신뢰 보호·두 top 등록을 구현했다. Pulse SVG의 개발 out 자산도 갱신한다.

관련36 PASS/0 FAIL·runtime/language build0·전체 본체 타입/owned emission0 errors. 준비된 개발 launcher는 시작마다 번들 작성/대형 exe 해시/probe를 생략: prepare1390.4ms, --check11.1ms. Windows Core 생성3회26.6/8.9/8.8ms이며 **앱 화면 준비/생성 후 UI 성능은 미측정**이다. 최신 실행은 ide/Start-Pulse.cmd. 새 화면/Setup은 진행하지 않았으며 사용자 직접 검증/별도 화면 승인 후 결정한다. [결정·실패 복구·범위·후속](pulse-start-simulation-ux.md)을 우선 읽는다. 아래는 이전 기록이다.

## 이전 복원 완료 기록 (2026-10-14)

종료 보호만으로 해결되지 않은 마지막 공간 복원을 실제 editorGroups.whenRestored 이후에 적용하고, 초기 inspect와 Simulation enter의 경쟁은 refreshPending join으로 보완했다. 복원 관련26 PASS/0 FAIL, 전체 본체 타입/owned emission0 errors. 물리 재확인에서 Simulation 자동 진입을 확인했고 최종 activeWave 자동 표시를 같은 승인 세션에서 확인 중이다. 최신 실행은 ide/Start-Pulse.cmd 더블클릭; ide/TRY_LATEST.md 참고. 사용자가 직접 검증한 뒤 문제없으면 새 Setup을 요청하기로 했으므로 아직 만들지 않는다. [상세](pulse-remediation-validation.md)의 ‘복원 보완 재확인’을 우선 읽는다. 아래는 이전 기록이다.

**최종 화면 결과:** 재시작 뒤 별도 클릭 없이 Simulation과 동일 tb.first 파형·first.y 선택·600ps 커서가 자동 복원됐다. 정상 종료했고 이번 복원 확인은 완료했다. 다음은 사용자 직접 사용/피드백 후 Setup 결정이다. 새/빈/가져오기 프로젝트 및 설치 등 다른 잔여 수용까지 끝났다는 뜻은 아니다.

## 이전 화면 부분 확인 (2026-10-14)

승인된 전용 Pulse Dev 화면에서 실제 tb.first PASS(26.834초), 새 VCD·정리된 홈/탭·600ps 눈금/파형 커서 정렬·Code/Simulation 왕복·정상 종료/재시작 뒤 같은 파형 탭/신호/커서 복원을 확인했다. 최초 작업 구역은 Code로 보여 마지막 Simulation 자동 진입은 미수용이다. 확정 shutdown 초기에 공간을 보존하고 종료 중 editor/layout 전환·late mount를 막도록 보완; contribution 4건 포함 복원 관련24 PASS·보완 후 전체 본체 타입/owned emission0 errors. 물리 재시작 재확인은 하지 않았다. [실제 근거·잔여](pulse-remediation-validation.md)의 물리 세션 항목을 우선 읽는다.

화면 세션은 끝냈으며 새 화면 검증은 다시 사용자 승인을 받는다. 다음은 마지막 공간 복원과 새/빈/가져오기 프로젝트의 물리 UX 확인→남은 파일 열기/도구/설치 수용→새 후보/Setup 갱신이다. 기존 Setup/ZIP은 그대로이며 보완 코드가 포함되지 않았다. 비화면 전체355 PASS/1 SKIP은 직전 코드, 복원 관련24 PASS는 이후 변경에 대한 별도 검사다. 아래는 이전 기록이다.

## 이전 비화면 완료 기록 (2026-10-14)

최종 전체356건:355 PASS/0 FAIL/1 POSIX SKIP·exit0, runtime/language build0, 본체 전체 타입/owned emission0 errors. 실제 Verilator 자동 VCD/FST/CLI/FAIL·취소8 checks PASS, 새 관리 프로젝트 actual package provider→Verilator→recorded enum metadata3 checks PASS, standalone CLI bundle8 checks PASS·제품 정책/script syntax/diff PASS. [최종 근거와 미수용 목록](pulse-remediation-validation.md)을 우선 읽는다. 다음은 사용자 사전 승인된 한 통합 화면 세션과 설치 수용이며 기존 Setup/ZIP은 보완 전 버전으로 그대로 보존했다. 아직 stable/새 배포 완료가 아니다. 아래 검사 진행/미검증 표시는 당시의 중간 기록이다.

C의 VCD/FST 기본 editor routing, F의 root 제거/reset·복원 순서/늦은 닫기, G의 접힌 목록 관리/빈 TB 안내/Debug·Testing 진입 정리·제품 범위 문서까지 연결했다. runtime/language build와 자산 준비 exit0, 본체 타입 오류7건 수정 후 전체0 errors/owned emission0 errors. 신규 프로젝트2 PASS·경로/metadata9 PASS·관련20 PASS·Home 복원18 PASS·실행/병렬12 PASS는 서로 별도 검사이며 합산하지 않는다. 첫 Windows 전체351건(331 PASS/19 FAIL/1 POSIX SKIP)의 실패 원인은 모두 보완했으며 최종 전체/타입 재검사 진행 중이다. 화면/설치/새 배포는 아직 하지 않았다. [현재 계획·실패/복구·검증 기록](pulse-remediation-plan.md)의 ‘C/F/G 마무리 및 V 시작’을 우선 읽는다. 아래의 미검증/다음 구현 기록은 이전 상태다.

## 이전 보완 연결 기록 (2026-10-14)

이번 추가: E 배포용 pulse-rtl.cmd/CLI asset/필수 파일·사용 안내를 source 준비에 연결했다. F는 다중 로컬 root의 명시적 Simulation 프로젝트 선택, 이전 reader 정리, root별 metadata/선택 TB·이력·jobs, Code/Simulation 공간과 파형 탭·신호·커서의 bounded storage/지연 복원을 연결했다. workspace-state 회귀 테스트는 작성만 했고 실행하지 않았다. 기존 Setup/ZIP은 그대로이며 source overlay/실제 본체에도 아직 적용하지 않았다. 다음은 C 기본 파일 열기와 F 상태/경계 잔여→G 제품 표면 정리→마지막 V다. build/typecheck/tests/실제 도구/화면 검증은 사용자 요청대로 전체 보완 뒤에 한다.

사용자가 Diagram와 Counter 예제 등 검증용 제품 UI를 제외하고 VSIX + α 및 첫 진입/TOML/Simulation UX 보완을 승인했다. [보완 실행 계획](pulse-remediation-plan.md)을 새 실행 기준으로 사용한다. A/B의 빈 프로젝트 생성·새/기존/최근 진입·한 번 준비/고급 분리·import grid·관리 source 자동 목록·F5/editor Run·Code 유지·표시 이름, C의 일반 VCD/GTKWave/FST/fallback/recorded enum 실제 연결, D의 tags/jobs·최근 최대1,000개 이력/제외 TB 접근을 소스에서 연결했다. GUI auto package dependency provider 미연결도 보완했다. **이번 새 코드의 build/typecheck/tests/실제 도구/화면 검증은 아직 실행하지 않았다.**

추가로 E의 공유 도구 위치 선택/관리 환경 update 승인·CLI init/check/test/history/tools/tag/jobs/project/취소130와 실제 package provider를 연결했다. 빈 프로젝트에서 도구 명령이 활성화되지 않는 경로도 activation event로 보완했다. CLI 번들 생성 경로는 있으나 배포 launcher는 잔여다. 다음은 C 기본 파일 열기·E 제품 launcher 마무리→F 다중 root/작업 복원→G 제품 표면 정리→V 최종 통합 검증이다. 중간 검증을 반복하지 않고 전체 보완 후 묶는다. Computer Use/visible 앱·설치 검증은 매 세션 사용자 명시적 승인 후에만 진행한다. 기존 Setup/ZIP은 보완 전 코드로 그대로 보존하며 새 기능의 수용 근거가 아니다. 새 owner는 계획의 현재 구현 내역/미검증/한도를 읽고 소스부터 이어간다.

## VSIX + α 직접 대조 — Diagram만 제외 (2026-10-14)

사용자 기준에 따라 VSIX0.3.1 실제37 command 중 Diagram10 제외/27 command·6 setting·3 key·view/menu/custom editor·CLI·공통48 source 파일을 직접 대조했다. 최소/예제 생성, F5/editor Run, 태그 실행, jobs1 고정, 전체/제거된 TB 이력, 임의 VCD 열기, GTKWave/FST/viewer 설정, recorded enum metadata, 도구 폴더 picker/update, multi-root, 제품/개발 CLI 동작, theme fallback의12 gap군을 기록했다. 기존 helper/기능 방향 감사와 구분하며 공통 export 존재를 사용자 기능 완료로 계산하지 않는다. 제품 코드·release·추가 테스트/화면/설치 없음. 다음은 첫 진입 α와 G01/G02부터 사용자 승인된 개발로 이식 gap을 닫는 순서다. [명령 전체 대응표·직접 근거·완료 기준](pulse-vsix-parity-audit.md). Diagram 외 baseline 축소를 임의 제외하지 않는다.

## Pulse 현재 독립 앱 요구 감사 — 첫 진입 누락 확인 (2026-10-14)

사용자 무설정 프로젝트 캡처를 계기로 기존25개/H0～H7 합의와 ide 코드를 대조했다. 새 프로젝트 생성·시작/가져오기 안내·최소 개입 TOML UX 미완성, 가져오기 행 grid 겹침 P0. Explorer 실행 완료 공간 강제 전환·자동 TB hash 표시·restart 파형 tab/공간 저장·일반 source 관리·FST/enum 데이터 연결·CLI/한도/디스크 정책 등 부분 구현을 구분했다. Diagram/자체 엔진 등 의도적 후속과 설치/DPI/실제 설계 검증 잔여도 별도다. 기존 관련50 PASS/0 FAIL/0 SKIP; 제품 코드·release·Setup 수정/화면/설치 없음. 다음은 사용자와 첫 진입 흐름 구체화→N01～05 우선 보완, 이후 정상 초기 이용 상태별 검증. [현재 기능표·근거·우선순위](pulse-current-product-audit.md). 아래 배포 수용을 최초 이용 UX/H7 전체 완료로 읽지 않는다.

## Pulse Setup 전달 준비 완료 (2026-10-14 KST)

사용자 요청으로 검증된 기존 ZIP을 그대로 사용한 Windows x64 사용자 설치판을 생성했다. release/Pulse-Setup-windows-x64-beta-20261014.exe(260,255,047 bytes)·.sha256·installer-manifest.json; 기존 Inno6.4.1 compile exit0·PE/원본2,565 staged hash PASS·신규 payload3 PASS. 관리자 승격 없는 사용자 설치·한국어/영어·시작 메뉴/선택 desktop·uninstall 기록 방식, profile/project/PATH 보호. 앱/VSIX·이전 ZIP 미변경. 실제 설치/upgrade/uninstall 및 마법사 화면/clean Windows 미검증; 화면 검증은 새 사용자 승인을 받아 마지막 통합 세션에서 진행한다. [재현·최종 근거·다음 작업](pulse-windows-installer.md). 아래는 이전 기록이다.

## Pulse 스터디 내부 베타 전달 준비 완료 (2026-10-14 KST)

초기 복원 provider/DOM 순서와 bundle integrity10개 metadata를 보완했다. 최신 관련23 PASS·공식 전체 타입/emission0 errors·공식25 bundle/파일/브랜드/CLI PASS. 추가 승인된 정상 앱 화면 검증은 약4분11초: 읽기 전용 보관 소스 자동 복원·tb.first 실제 PASS23.478초·내장 VCD/607ps 정렬·Code 왕복 보존·정상 닫기/잔류0 확인. 이전 전체340 PASS/1 POSIX SKIP와 native11 PASS는 별도 범위다. 최신 inventory/hash에 묶인 수용 기록으로 ZIP 전체2,565 entry 재독출/해시 검증 PASS: ide/release/Pulse-windows-x64-beta-20261014.zip(366,892,027 bytes)·.sha256·manifest.json·내부 사용 안내/전체 고지 준비 완료. clean Windows·DPI/대표 설계·장시간/RSS·FST/enum 잔여 유지; 공개 업로드/안정판 선언 없음. [최신 근거·인수인계](pulse-internal-beta.md). 아래는 이전 기록이다.

## Pulse 내부 베타 검증·배포 작업 중 (2026-10-14 KST)

Windows 공식 후보·브랜드/타일·파일/CLI 검사 완료. 검증 계측 JSONL 손상·실패 cleanup 보완 뒤 실제 taskkill128 자연 종료 경쟁을 확인해 Python leaf의 retained handle 종료로 보완했다. 관련43 PASS/1 POSIX SKIP; 전체 회귀/공식 코드 bundle refresh 진행 중. 최종 승인된 한 화면 세션/일반 앱 수용→검증된 ZIP/해시가 남는다. [현재 상태·실패 근거·재현·다음 작업](pulse-internal-beta.md). 아래는 이전 기록이다.

## Pulse 브랜드 확정 (2026-10-14 KST)

사용자가 Pulse를 선택했다. 독립 IDE 표시 이름과 별+디지털 파형 벡터/ICO를 반영하고 기존 내부 identity/설정·신뢰 경로는 유지한다. 관련11 PASS·script syntax PASS·PNG 산출물 관찰. 앱 화면/Windows shell 아이콘은 미검증이며 기존 배포 후보는 탭/Pulse 반영 전 버전이다. 다음 승인된 화면 통합→새 후보 build/packaged 수용→ZIP 순서. [결정·파일·검증·인수인계](pulse-branding.md). 아래는 이전 기록이다.

## Simulation 탭 개선 / 배포 후보 현황 (2026-10-14 KST)

홈은 고정 집 아이콘, 파형 탭은 TB 이름만 표시·실행 ID/시각 tooltip·내부 ×·테마 색/한 줄 스크롤로 정리했다. 비활성 닫기 보존/활성 인접 이동/마지막 홈·reader 해제 회귀 포함 관련18 PASS·공식 전체 타입/owned emission0 errors. 화면 미검증·기존 배포 후보는 수정 전 버전. 직전 배포 후처리/파일/CLI PASS·packaged native11 PASS/실제 파형 화면 확인 뒤 사용자가 Esc로 중지했으며 물리 클릭/정상 종료·ZIP는 미완료다. Computer Use/visible 검증은 매번 사용자 확인을 받아 진행한다. [상세·근거·다음 작업](ide-simulation-tabs.md). 아래는 이전 기록이다.

## 실제 앱·화면 통합 / 내부 베타 빌드 준비 (2026-10-13 KST)

사전 안내 후 기존 trusted 전용 창 한 세션에서 native FileService TB add/rename/delete/recreate·보관 source/diff·actual Verilator/내장 파형11개 PASS/exit0, 직접 선택 실행/Cancel·All2 PASS·로그·cursor599ps 정렬·bus/drag·Code 왕복/정상 종료를 확인했다. history29→33·원형/기존 trace 보존. development extension host 시작 지연 경고를 기록하고 DPI/고대비·group drag/긴 시간·종료 중 dialog/대형 실제 설계 등 미확인을 유지한다. 사용자 승인으로 Windows 내부 베타 배포 준비 시작: 공식 기본 경로의 불필요 Copilot 단계 중단 후 IDE 자체 build-beta 경로·resource asset/번들 상대경로 보완·Copilot/인증 확장 제외·BETA 안내 작성. 관련8+overlay3 PASS·공식 전체 타입/emission0 errors. 본체 배포 bundle 실행 중이며 ZIP/패키지 smoke/설치/공개 완료 아님. [화면 범위·근거·미검증·다음](ide-windows-integrated-ui.md). 아래는 이전 기록이다.

## Windows 종료 실패·복구 검증 최신 (2026-10-13 KST)

알려진 private tree의 taskkill 응답만 주입해 Windows cleanupFailed/deadline·history 실패 기록/재실행 차단·host close/tool probe/result write 경계를 확인했다. 관련 process11개:10 PASS/0 FAIL/1 POSIX SKIP·NTFS 종료/partial 보관→current 명시적 복구→재보관5개 PASS, fixture 잔류0·syntax/diff PASS. 제품 runtime 미변경으로 관련 테스트만 실행했으며 이전 전체331 PASS와 합산하지 않는다. 화면/Computer Use/설치/배포 없음. 다음은 native watcher/앱 종료·복원과 마지막 통합 화면 체크리스트 준비; 화면 시작 전 반드시 사용자에게 알림(AGENTS 반영). [구현·근거·재현·잔여](ide-windows-cleanup-recovery.md). 아래는 이전 기록이다.

## Windows 클라우드 복귀 검증 (2026-10-13 KST)

클라우드 최신 HEAD 878ad84에서 기존 Windows 환경으로 복귀했다. 알려진 이전 분석기 LF/CRLF 소유 hash migration, Python 준비 알림 CRLF 인식, legacy lease 파일 보호를 보완하고 NTFS 열린 handle·junction·검증 artifact/승인 거절 fixture를 Windows에 맞게 검증했다. 공식 전체 본체 타입/owned emission0 errors·runtime/language build·최종 bundle 준비 PASS, actual Node channel4묶음·Windows OS TB 이벤트/202 rows 반복 PASS(자동 도구0·설정 보존). 최초 전체 실패와 분리10항목 PASS를 보존했고 최종 Windows 전체337개:331 PASS/0 FAIL/6 POSIX SKIP·241.5초/exit0 및 actual Verilator 두 예제×VCD/FST4회 PASS·원본/보관 hash/생성물 격리를 확인했다. 화면/Computer Use/native workbench·배포·설치·commit/push 없음. P0 추가 cleanup/NTFS와 P1 native watcher/마지막 한 화면 통합·실제 설계 성능 gate 유지. [근거·보완·재현·남은 순서](ide-windows-cloud-return.md). 아래는 이전 기록이다.

## 클라우드 통합 준비 최신 (2026-10-13 KST)

사용자 PC 없이 pinned upstream root/build frozen type 의존성과 checksum Electron 선언을 준비해 공식 TS7 7.0.2 본체 전체 타입·owned 출력 **0 errors/exit0**, runtime/language build를 확인했다. 홈 미사용 import를 제거하고 이전 owned hash를 보존했다. 실제 Node channel4묶음·TB file/folder rename/빈 폴더 재생성·20 add/delete/202 rows·idle/도구0/설정 불변,100 late caller의 한 후속 scan과 close join/무게시를 검증했다. 작은 소스 읽기 chunk를4–64KiB로 조정해 같은 선택 hash/read806회의 buffer 할당52.8→3.30MB(**93.75% 감소**), 최종 관련20 PASS/0 FAIL/0 SKIP. 버퍼 변경 후 최종 순차 전체 회귀 **335 PASS/0 FAIL/1 Windows batch SKIP(총336개)**. 합성 단독 계측의 Core 중앙값/반복 tail은 개선 미확인이며 전체 RSS/Windows UI 성능으로 확대하지 않는다. install_script/start_skill 초안을 추가 저장했고 게시/새 task 복원은 별도다. Windows native IPC/watcher/NTFS/taskkill·마지막 화면/대표 실제 설계 성능 및 별도 FST/전체 disk 정책 잔여를 유지한다. [변경·근거·재현·제한](ide-cloud-integration-preparation.md). 아래는 이전 기록이다.

## Simulation TB 자동 목록 최신 (2026-10-13 UTC)

사용자 요청의 TB 폴더 자동 추가·삭제/한 파일 여러 top 분리·파일이 남아도 사용자 제외 우선/폴더 밖 프로젝트 내 수동 등록·명시적 복원을 구현했다. 실행·로그·파형 hover는 정확히 해당 이름을 표시한다. source-first `rtl-tests.json`에 선택을 보존하며 자동 이벤트는 원본/TOML/JSON 쓰기·컴파일·시뮬레이션 없이 목록만 갱신한다. 기존 이름/이력/읽기 전용 보관 소스/파형·trust/dirty/root/revision/cleanup·IDE/VSIX 독립성을 유지한다. runtime/language build와 최종 관련 **38 PASS/0 FAIL/0 SKIP**, 실제 Linux OS 이벤트→production 홈/real host의 두 top 추가·삭제/제외/수동 등록·행 재사용/idle·tool calls0/history0을 확인했다. 별도 private fixture에서 명시적 Verilator Run 두 TB PASS/VCD·삭제 후 history2 보존. 최종 순차 전체 회귀 **332 PASS/0 FAIL/1 Windows batch SKIP(총333개)**. Windows 공식 전체 본체 타입/emission·native IPC/watcher/NTFS·물리 hover/대형 목록 성능은 미검증이며 P0→P1 마지막 통합 계획을 유지한다. [동작·검증·제한·다음 작업](ide-tb-auto-catalog.md). 아래 기록의 TB 수동 Apply-only 설명은 이전 계약이다.

## Simulation 홈 디자인 최신 (2026-10-13 UTC)

사용자 캡처 검토 요청으로 독립 IDE의 Simulation 홈을 실행/관리 카드·테스트별 카드·로그 패널로 정리했다. 오른쪽 실행(초록 삼각형)·로그(터미널)·파형 아이콘과 Source Code 기능 그룹, 전체 실행 버튼 강조·둥근 모서리/간격·테마 토큰·좁은 폭 줄바꿈을 적용했고 기존 실행/이력/신뢰/입력 비교 동작과 VSIX 독립성을 유지한다. 새 UI 의존성/애니메이션/상시 작업 없음. runtime build·화면2파일 구문 변환·최종 관련 **27 PASS/0 FAIL/0 SKIP**(변경 감지3 포함)·아이콘 tooltip/접근성/Tab 순서, Chromium 실제 화면 코드의 다크/라이트 및 800/480/320px 가로 넘침·선택/행 유지·과거 이력/최신 복원·잠금/로그 접기 수용을 확인했다. 캡처는 클라우드 컴포넌트이며 Windows 전체 창/본체 전체 타입·emission/IPC·DPI·고대비/물리 수용은 별도다. 기존 예제의 retained PASS를 재사용했고 새 simulation/파형 열기 없음. 다음은 기존 H7S 후 Windows 통합 준비/P0→P1 순서이며 이번 디자인을 H7 전체 완료로 표현하지 않는다. [변경·근거·제한·인수인계](ide-simulation-home-design.md). 아래는 이전 진행 기록이다.

# 독립 RTL IDE 클라우드 인수인계

기준일: **2026-10-13 / H6 범위 판정·H7S enum 표시 재사용·lookup/대기 분리 후**. 목적은 대화 기록 없는 실행자에게 사용자와 함께 발전시킨 제품 의도, 현재 코드, 근거와 다음 순서를 전달하는 것이다. 이 문서의 과거 Windows 근거와 아래의 실제 Linux 온보딩/H7A～H7S 결과를 구분한다.

## 현재 클라우드 결과와 다음 진입점

GitHub main 확인 시 HEAD85ba1fe6f245182faf90602628560cd04f8bcf69와 클라우드 work 기준이 같았다. Debian13/Node24.19.0, Python3.12.14/pyslang11.0.0, Verilator5.032를 준비했다. 온보딩에서 IDE144 PASS/1 Windows SKIP·VSIX225 PASS/2 platform SKIP·build/typecheck와 실제 VCD/FST4회 PASS를 확인했다. Windows native 전체 빌드·화면은 실행하지 않았다. install_script/start_skill 저장 초안과 실제 머신 검증은 완료했지만 게시/새 task 복원은 별도다.

[H6 수용표](ide-h6-acceptance-summary.md)에서 기본 개발 경로를 판정했다. [H7A](ide-h7a-history-recovery.md)는 최신 trace/log 삭제 시 결과 보존·이력 병렬 조회·300 RTL/1000 history 합성 계측을 완료했다. Linux 최종150 PASS/0 FAIL/1 Windows batch SKIP·runtime/language build. [H7B](ide-h7b-input-validation-cost.md)에서 retained 검증 비용을 분리하고 identity lookup/제한 병렬 읽기, project epoch·A/B/A 거절·조회 취소/close 대기를 보완했다. Linux157 PASS/0 FAIL/1 Windows SKIP·runtime/language build, 기존 실제 VCD/FST4개 retained 재검증 PASS(새 simulation 없음). 동일 fixture retained 중앙값797→133ms/host 비교1827→918ms를 관찰했고 파일 검사 수는 유지했다. [H7C](ide-h7c-process-cleanup.md)는 실제 tree/peer/timeout·정리 실패/지연·기록 실패의 분류 보존, session quarantine·close reject·IPC error routing을 완료했다. Linux171 PASS/0 FAIL/1 Windows SKIP·runtime/language build, 실제 Verilator3회 정상→취소→retry PASS(live build group8→0·이전 trace/원본 보존), pinned base+real host Node adapter headless3묶음 PASS. Node channel 이전 owned hash를 overlay에 기록했다. Windows taskkill/종료·공식 본체 TS7 타입/target emission·앱 화면은 미실행이다. [H7D](ide-h7d-waveform-restoration.md)는 waveform open의 root/epoch·A/B/A 보호, trace 검증 취소/join·반복 close/dispose join·실제 worker 종료까지4개 slot 유지, 새 host/별도 OS process의 retained run/default view 재열기를 완료했다. Linux176 PASS/0 FAIL/1 Windows SKIP·runtime/language build. 4,096 신호/262,144 changes·동시4 reader×6회와 기존 실제 Verilator VCD2개 조회 PASS·parent26 created/26 exited/live0. 새 simulation/앱 화면 없음. RSS는baseline61.4→최종닫힘365.8MiB·main heap8.6→10.8MiB이며 RSS 회복 수용은 남는다. [H7E](ide-h7e-cache-memory.md)에서 보관 source64MiB/256 entries LRU·model removal/project 전환/dispose 해제·coalescing/epoch/late navigation 보호를 보완했다. 이전 provider2 FAIL 재현·관련13 PASS·Linux187 PASS/0 FAIL/1 Windows SKIP·runtime/language build. 동일4,096신호의 Linux3case×12회에서144worker 전부 exit·thread11→15→11, worker live heap 약19.8MiB로 유지됐다. 진단 glibc trim은 default RSS375.7→345.3MiB를 반환했으나 Anonymous317.3MiB가 남아 전체 RSS 원인은 미해결이다. allocator 설정/helper는 진단 child 한정이다. Home 이전 owned hash와 새 cache overlay를 기록했고 공식 전체 TS7/target emission·실제 model/tab/diff 해제·앱 화면은 미실행이다. [H7F](ide-h7f-project-recovery.md)는 현재 DUT/TOML이 손상·삭제/linked 상태여도 historyOnly 보관 행의 로그/source/파형을 유지하고 Run/Explorer·현재 비교를 잠그며 복구 후 해제한다. log epoch/close join·source row 재연결, PID/UUID lease의 real writer 게시 전/후 crash/fresh retry와 delayed reclaimer race를 보완했다. Linux196 PASS/0 FAIL/1 Windows SKIP·runtime/language build·관련26 PASS/client8 PASS. 별도 비협력 writer의 마지막 검사/rename 진단은 외부 bytes overwrite로 **FAIL/exit1**이며 정상 suite에 합산하지 않는다. 이 H7F 시점의 다음 작업이 H7G journal·publication 설계였다. unknown/legacy lock과 orphan temp를 무조건 삭제/승격하지 않는다. native RSS/장시간·실제 설계·Windows 공식 본체/실제 lease/보관 UI/통합 gate는 유지한다. 아래 H6 문서의 '다음 단계'는 각 시점의 역사이며 최신 진입점은 이 문단이다.

## H7S 최신 — enum 표시 정보 재사용·lookup/요청 대기 구분 (2026-10-13 UTC)

기존 pyslang의 동일 native enum identity/고정 lookup scope에서 해석한 표시 값·spelling을 요청 안에서만 재사용한다(최대64 types/4096 values/1MiB UTF-8 payload, 상한 거절 시 원래 계산·각 output 별도 복사). native lookup·default/decl order·shadowing·parameterization·Core/journal·신뢰/미저장/파일/실제 cleanup 보호를 유지하며 자체 compiler/simulator·상시 worker/settled cache는 추가하지 않았다. dense enum32/variables96의 실제 lookup9332→950/두 contexts·전후5회 전체 semantic/hierarchy30쌍 JSON 일치, unqualified 완성 중앙값1405.0→642.6ms·해당 Python peak55.6→41.4MiB를 확인했다. 일반 IPC 편집→완성949.5→979.4ms는 개선 미확인이다. snapshot 현재 분석403.7ms/query active561.8ms와 pool queue 약0.1ms를 구분했고, 제어된100ms hold의 실제 queue/종료/third start도 검증했다. 전체 앱/RSS/Windows 수용으로 일반화하지 않는다. Linux 전체 **322 PASS/0 FAIL/1 Windows batch SKIP(총323개)**·신규6 PASS·runtime/language build. 모든 상한 fallback·native identity/owned output·257/unknown enum 미표시·다른 parameterization ambiguity와 다음 편집 fresh 복구를 통과했다. 다음은 Windows 통합 검증 준비: P0 공식 본체/NTFS/취소·종료→P1 native watcher/한 번의 화면 통합·실제 대표 baseline 순서다. default/candidate/포화 queue·장시간/RSS·전체 disk·미구현 내부 연산/FST/파형 enum 등은 잔여이고 화면은 마지막 통합까지 보류한다. [상세 근거](ide-h7s-lookup-wait.md)·[통합 우선순위](ide-h7-integration-gates.md)·[H7 수용표](ide-h7-acceptance-summary.md). 기존 pinned 도구/변경과 main85ba1fe6f245182faf90602628560cd04f8bcf69 유지·setup 재설치/초안 저장·게시·commit/push·화면 검증은 하지 않았다.

## H7R 최신 — 요청 안에서 package 시작 비용 공유 (2026-10-13 UTC)

기존 pyslang의 auto package dependency와 분석을 한 요청의 Python process에서 이어가되 graph 게시→Core orderPackages 검증→소유 continuation/approval 확인 뒤에만 새 test compilation을 만든다. Core 오류/순서·독립 manager/default/lookup·미저장/신뢰/FS/journal·실제 취소/join/cleanupFailed 보호를 유지하고 상시 worker/cache·자체 compiler/simulator는 만들지 않았다. 300 RTL/package/tests의 Python 시작2→1, 실제 IPC startup/edit4→2·전후5회 semantic/hierarchy20쌍 JSON 일치다. 이번 Linux IPC 편집→완성 중앙값1779.0→900.5ms, 공유 완성899.1→756.4ms를 관찰했다. shared Node CPU29.5→46.1ms·Python peak40.6→41.2MiB도 기록하며 전체 앱 지연/RSS 수용으로 일반화하지 않는다. Linux 전체 **316 PASS/0 FAIL/1 Windows batch SKIP(총317개)**·최종 관련19 PASS·runtime/language build. 승인 전/후 취소·조기/다른 응답·atomic 쓰기 실패·실제15초 승인 누락/종료·fresh 복구를 확인했다. 내부 연산 조회의 Python adapter 부재는 기존 미구현 잔여이며 hierarchy 수용과 구분한다. 다음 H7S는 default/완성 lookup CPU·실제 요청 대기 분리와 H7 성능 잔여/최종 Windows 통합 우선순위 정리다. Windows 공식 본체/native watcher/client/NTFS 파일 왕복/taskkill/화면·대표 설계/장시간/RSS/전체 disk gate는 잔여이고 화면은 마지막 통합까지 보류한다. [상세 근거](ide-h7r-package-session.md)·[H7 수용표](ide-h7-acceptance-summary.md)·[성능 계획](ide-performance-plan.md). 기존 pinned 도구/변경과 main85ba1fe6f245182faf90602628560cd04f8bcf69 유지·setup 재설치/초안 저장·게시·commit/push·화면 검증은 하지 않았다.

## H7Q 최신 — 독립 테스트 완성 비교·scope 좌표 비용 (2026-10-13 UTC)

기존 pyslang 연동의 전체 symbol JSON 교집합을 순서·중복·타입/선언/default/enum/callable 동의 그대로 선형 비교하고, query 파일 밖 scope의 불필요한 end 좌표 계산을 줄였다. 자체 compiler/simulator 개발은 아니다. 실제300 RTL의 symbol 직렬화93,326→608회, 큰 공유 완성5회 Node CPU 중앙값319.9→33.7ms·wall1158.5→865.8ms·semantic/hierarchy20쌍 JSON 일치다. wall 편차와 작은 IPC 편집→완성1277.2→1472.2ms를 기록하며 전체 지연/RSS 개선으로 판정하지 않는다. Linux 전체 **310 PASS/0 FAIL/1 Windows batch SKIP(총311개)**·기존43/새guard3 PASS·runtime/language build. Core package 오류의 분석 전 거절·취소/실제 process join/임시 파일 회수·원본/신뢰/FS/journal 보호를 유지했다. 별도 package process/import 비용은 남으며 다음 H7R은 Core 검증 뒤 분석하는 요청 내 양방향 protocol과 취소/정리 경계다. Windows 공식 본체/native watcher/client/화면·대표 설계/장시간/RSS/전체 disk gate는 잔여이고 화면은 마지막 통합까지 보류한다. [상세 근거](ide-h7q-semantic-agreement.md)·[H7 수용표](ide-h7-acceptance-summary.md)·[성능 계획](ide-performance-plan.md). 기존 pinned 도구/변경과 main85ba1fe6f245182faf90602628560cd04f8bcf69 유지·setup 재설치/초안 저장·게시·commit/push·화면 검증은 하지 않았다.

## H7P 최신 — pyslang 연동 경로·위치 계산 비용 (2026-10-13 UTC)

기존 pyslang bridge의 완성 호출 안에서 canonical 경로를 재사용하고, 같은 SourceManager의 UTF-8→UTF-16 좌표를 최대4MiB payload/64 buffer/4096 point로 재사용한다. 다음 요청/independent test에는 공유하지 않고 source/파일·Core·journal 검증과 의미 lookup/default·실제 취소/cleanup은 유지한다. 자체 compiler/simulator 개발은 아니다. 실제 Python helper lstat14675→9763/테스트,300 RTL+대형 Unicode/ports/선언의 공유 완성5회 중앙값1417.6→991.9ms·completion CPU556.5→224.1ms·분석/완성/hierarchy20쌍 JSON hash 일치를 확인했다. 작은 IPC 지연 개선과 전체 RSS 감소는 확인하지 않았다. Linux 전체 **307 PASS/0 FAIL/1 Windows batch SKIP(총308개)**·기존39/새guard4 PASS·runtime/language build. 좌표 전체 byte/BOM/CRLF/astral·상한 fallback·fresh manager/overlay·alias retarget과 복구/정리/원본 보존을 통과했다. 다음 H7Q는 pyslang 연동의 별도 package 시작·default/완성 traversal/lookup·실제 요청 대기 비용이다. Windows 공식 본체/native watcher/client/화면·대표 설계/장시간/RSS/전체 disk gate 유지·화면은 마지막 통합으로 보류한다. [상세 근거](ide-h7p-pyslang-positions.md)·[H7 수용표](ide-h7-acceptance-summary.md)·[성능 계획](ide-performance-plan.md). 기존 변경/pinned 도구/main85ba1fe6f245182faf90602628560cd04f8bcf69 유지·setup 재설치/초안 변경·게시·commit/push·화면 검증은 하지 않았다.

## H7O 최신 — 미설정 폴더 재검사·inline macro 문맥 (2026-10-13 UTC)

실제 read/lstat 부재만 ProjectManifestMissing으로 분류하고 missing root의 source/peer 이벤트 재검사를 멈췄다. root/parent shallow 복구 감시와 등록 뒤 재읽기·manifest/journal/ancestor 복구를 유지하며 malformed/include/source ENOENT는 보수적으로 처리한다. inline object/function macro 뒤 실제 compiler 기반 signal/package/서명 완성을 복구하고 directive/argument·block/template 보호를 유지했다. plaintext static header의 미저장 복원도 통과했다. Linux 전체 **303 PASS/0 FAIL/1 Windows batch SKIP(총304개)**·최종guard28 PASS·초기관련59 PASS·runtime/language build. actual IPC의 missing unrelated read1→0·mixed read2→1과 baseline inline query 미실행→fresh symbol을 확인했다. 최초 recovery watch 확인 read 비용과 새로 정상 실행되는 query 시간을 latency 개선으로 표현하지 않는다. 다음 H7P는 compiler point/path·default signature/완성 traversal와 별도 package 시작 비용이다. Windows 공식 본체/실제 watcher/client/화면·대표 설계/RSS/전체 disk gate를 유지하고 화면은 마지막 통합으로 보류한다. [상세 근거](ide-h7o-semantic-context.md)·[H7 수용표](ide-h7-acceptance-summary.md)·[성능 계획](ide-performance-plan.md). 기존 변경과 pinned 환경/main85ba1fe6f245182faf90602628560cd04f8bcf69를 확인했다. setup 재설치/초안 변경·게시·commit/push·화면 검증은 하지 않았다.

## H7N 최신 — 요청 안에서 컴파일러 시작 비용 공유 (2026-10-13 UTC)

독립 테스트를 한 요청의 Python 프로세스에서 순차 분석하여 시작/import만 공유한다. 각 compilation·macro/header·같은 top의 격리와 공유 RTL 완성 교집합, 자동 package 검증·미저장/FS/journal·취소/실제 cleanup을 유지했다. 300 RTL/package/테스트2개에서 provider launch3→2, actual IPC 편집→완성6→4를 확인했다. Linux 전체 **293 PASS/0 FAIL/1 Windows batch SKIP(총294개)**·관련33 PASS·runtime/language build. incomplete batch 거절·두 번째 group 중 취소/retry·manifest 생성/오류 복구와 idle/status 추가 load/compiler0도 통과했다. 지연 변동과 Python peak RSS를 별도 기록하며 모든 응답/앱 메모리 개선으로 판정하지 않는다. 다음 H7O는 미설정 manifest의 typed 분류·안전한 복구 감시와 inline macro 뒤 code completion 제한, package/default/완성 비용이다. Windows 공식 본체/실제 watcher/client/화면·실제 설계/RSS/전체 disk gate 유지·화면은 마지막 통합으로 보류한다. [상세 근거](ide-h7n-semantic-request.md)·[H7 수용표](ide-h7-acceptance-summary.md)·[성능 계획](ide-performance-plan.md). 기존 pinned 도구/이전 변경과 main85ba1fe6f245182faf90602628560cd04f8bcf69를 확인했다. setup 재설치/초안 변경·게시·commit/push·화면 검증은 하지 않았다.

## H7M 최신 — 소스 범위별 분석·감시 비용 (2026-10-13 UTC)

validated source prefix(package/test/literal/external 포함)로 healthy root의 파일/편집 이벤트를 좁히고, 기존 RTL watcher가 덮는 경로의 dynamic 등록과 recursive parent 아래 중복을 제거했다. 신규 감시 확인 read는 자기 root의 nonempty 감시 변경에만 적용하며 include/journal·unknown/error 안전성을 유지한다. actual IPC/Python 3 roots×300 RTL(900개)/3회에서 startup compilation6→3·local edit/100 notifications3→1·normal dynamic900→0(unknown peak 약903→4), shared header3→실제2 roots, unconfigured/generated/status 이벤트 추가분석0을 확인했다. 외부 glob 누락 뒤 생성·비RTL source 구성·held peer query 유지와 watch ack 뒤 old error 상태 차단도 통과했다. 288 PASS/0 FAIL/1 Windows batch SKIP(총289개, 순차 전체)·관련25 PASS/최종guard23 PASS·runtime/language build. CPU/작업 수 감소를 모든 응답 지연 개선으로 판정하지 않는다. 다음 H7N은 compiler 시작/parse/elaboration·package/test와 편집→완성 대기 경로, mixed/error root idle 비용 분리다. Windows native watcher/LanguageClient/host·공식 본체/화면·실제 설계/RSS/전체 disk gate는 잔여다. [상세 근거](ide-h7m-semantic-scale.md)·[H7 수용표](ide-h7-acceptance-summary.md)·[성능 계획](ide-performance-plan.md). 기존 pinned 도구/기존 변경 보존·GitHub main/HEAD85ba1fe6f245182faf90602628560cd04f8bcf69 확인. setup 재설치/초안 변경·게시·commit/push·화면 검증은 하지 않았다.

## H7L 최신 — 실제 입력·파일 감시·설정 복구 무효화 (2026-10-13)

컴파일러가 실제로 읽은 source/header와 expanded include·누락 후보를 추적하고, 확인된 입력 밖의 generated 이벤트만 제외한다. 비RTL·외부 include의 directory 감시를 표준 LSP 등록/해제 ack로 관리하고 신규 감시 뒤 재읽기한 결과만 게시한다. 동일 실제 IPC/Python fixture의 generated100개 추가분석1→0, .inc WIDTH4→8의 기존 stale3:0→갱신7:0, previous.toml 변경 뒤 기존 stale Ready→Analysis failed/복구 전 query 차단을 확인했다. 실제2 roots 공유 header 갱신·root 제거 감시 해제·late old-handle held query 취소/명시적 recovery·drain cache/live0도 통과했다. 이전 headless의 workspaceFolders capability 누락을 바로잡아 remove/add 경계를 다시 검증했다. 278 PASS/0 FAIL/1 Windows batch SKIP(총279개, 순차 전체)·관련16 PASS·runtime/language build. 일반 RTL 이벤트는 공유/glob 안전성을 위해 여전히 all-root이며 새 의존성 감시 발견 시 확인용 compilation 비용이 있다. 다음 H7M은 수백 RTL 규모의 감시/재분석 비용과 일반 이벤트 root 범위다. Windows 실제 watcher/LanguageClient/host·공식 본체/화면·실제 설계/RSS/전체 disk gate는 잔여다. [상세 근거](ide-h7l-semantic-inputs.md)·[H7 수용표](ide-h7-acceptance-summary.md)·[성능 계획](ide-performance-plan.md). 복원된 Node24.19.0/Python3.12.14/pyslang11.0.0/Verilator5.032와 기존 변경을 확인했다. GitHub main은85ba1fe6f245182faf90602628560cd04f8bcf69로 work 기준과 같았다. 기존 setup 초안을 다시 쓰거나 게시했다고 주장하지 않으며 commit/push·화면 검증은 하지 않았다.

## H7K 최신 — 언어 서비스 재시작·idle·종료 확인 (2026-10-13)

최신 요청 하나로 runtime probe/restart를 모으고 실제 취소/정리 뒤에만 replacement한다. 상태 bar는 조회1개·완료 뒤1500ms·focus/RTL 가드로 바꿨다. actual adapter/API 모델20 restart의 probe/client20→1, held probe21→2/최종client21→1, slow status11→1을 확인했다. prepareShutdown의 provider join→native stop→소유 IPC parent close를 사용하고 불확실한 cleanup/stop/disconnect는 quarantine·자동/수동 새 시작 거절한다. 이전/expected-close callback은 새 client를 막지 않는다. 실제 runtime probe/Node IPC/Python4 exit·drain cache/live0·포함한 .rtl header3:0→7:0/원본 불변을 확인했다. 264 PASS/0 FAIL/1 Windows batch SKIP(총265개, 순차 전체)·관련51 PASS·최종 신규18 PASS·runtime/language build. Generated notification100개는 여전히추가분석1회여서 다음 H7L에서 실제 입력 의존성/파일 이벤트·journal 무효화 범위를 확인한다. Windows/Electron 실제 client/host 종료·공식 본체/화면·실제 설계/RSS/전체 disk gate는 잔여다. [상세 근거](ide-h7k-language-lifecycle.md)·[H7 수용표](ide-h7-acceptance-summary.md)·[성능 계획](ide-performance-plan.md). read-only GitHub main 확인은85ba1fe6f245182faf90602628560cd04f8bcf69로 work 기준과 같다. 기존 변경을 보존하고 commit/push·앱 화면 검증은 하지 않았다.

## H7J 최신 — 언어 분석 burst·공유·종료 (2026-10-13)

언어 서버 provider 작업을2 active/32 대기로 제한하고 root/generation/exact query의 동시 요청만 공유한다. caller별 취소·마지막 caller 취소 뒤 실제 cleanup slot 유지·stale 결과 차단·close join·cleanup 실패 quarantine을 적용했다. 실제 stdio LSP/Python에서3 roots/100 watch/20 concurrent query의 초기 실제 query20→1, held root process3→2·원본/unsaved/peer 취소/새 요청 재분석·root remove/add·종료 cache0을 확인했다. 기존 debounce의 초기 root 분석3회는 양쪽 동일하다. 이전 종료 응답 뒤 temp3 잔류 FAIL을 재현했고 transient capacity는 새 편집 없는 on-demand 재시도로 복구한다. 246 PASS/0 FAIL/1 Windows SKIP(총247개: 전체246개 + 최종 신규capacity1개 분리 검증)·최종 관련35 PASS·runtime/language build. 다음 H7K는 언어 서비스 시작/재시작·idle/generated 이벤트 비용이다. Windows LanguageClient stop/IPC/taskkill·공식 본체/앱·실제 설계/RSS/전체 archive disk gate는 잔여이며 화면 검증은 보류한다. [상세 근거](ide-h7j-semantic-burst.md)·[H7 수용표](ide-h7-acceptance-summary.md)·[성능 계획](ide-performance-plan.md). read-only GitHub main 재확인은85ba1fe6f245182faf90602628560cd04f8bcf69로 work 기준과 같다. 기존 변경을 보존하고 commit/push·화면 검증은 하지 않았다.

## H7I 최신 — 반복 설정 검사 비용·성능 요구 (2026-10-13)

요청 내 검증한 설정 snapshot을 parser와 최종 게시 검사에 공유해 반복 저장 전체 scan7→3회/current 읽기18→7회·고정1MiB 버퍼 제거를 구현했다. SHA/경로·membership/short read·late old-handle/실제 crash·lease/recovery·abort/join을 유지한다. 동일96개/67KB 합성 fixture3회에서 저장 중앙값1270→662ms·읽은 bytes91.7→39.3MB·file open2716→1169, 신규 회귀의 이전 코드3 FAIL/3 PASS를 재현했다. 238 PASS/0 FAIL/1 Windows batch SKIP(총239개, 순차 전체)·runtime/language build·최종 신규7 PASS·writer protected true/exit0. 실제160회 저장/주기적 retirement도 PASS(이번 약110초; 과거252초와 별도 실행 관측). 가볍고 빠른 VS Code/PyCharm 느낌을 제품 요구와 성능 계획에 기록했다. 다음 H7J는 파일 이벤트/의미 분석 요청 burst·중복 작업과 취소/갱신을 headless로 점검한다. Windows 공식 본체/NTFS/앱 화면·실제 설계/RSS·전체 archive disk gate는 잔여다. [상세 근거](ide-h7i-import-save-cost.md)·[H7 수용표](ide-h7-acceptance-summary.md)·[성능 계획](ide-performance-plan.md). read-only GitHub main 재확인은85ba1fe6f245182faf90602628560cd04f8bcf69로 work 기준과 같다. 기존 변경을 보존하고 push/commit·화면 검증은 하지 않았다.

## H7H 최신 — 설정 기록 별도 보관·조회 비용 (2026-10-13)

명시적 검토·확인 뒤 오래된 정상 설정 기록을 별도 보관하고 최근32개·pending/unknown 기록은 active에 유지한다. 현재 설정·파일 bytes/inode를 보존하며 archived 기록은 자동 변경 검사에서 제외한다는 정책을 UI에 설명한다. 128개 중96개 보관→다음 저장과 실제160회 저장·partial abort/crash/fresh retry·close join을 통과했다. 요청 내 current2회/8개 병렬 검증으로 같은128개 합성 기록의 bytes25.8→17.3MB·중앙값2440→272ms를 관찰했다. 231 PASS/0 FAIL/1 Windows SKIP(총232개: 전체 본체230개 + 최종 신규guard2개 분리 검증)·최종 관련30 PASS·runtime/language build. Windows case-only realpath와 invalid UUID temp2 FAIL을 재현해 보완했고 Windows 실제 파일/화면 수용은 미실행이다. 자동 삭제·전체 disk cap은 없다. 다음 H7I는 반복 저장 guard/scan 중복 비용 분리와 안정화 잔여 수용표다. RSS/실제 설계·Windows 공식 본체/NTFS/물리 통합 gate를 유지한다. [상세 근거](ide-h7h-import-journal.md). 이번 read-only GitHub main 재확인도85ba1fe6f245182faf90602628560cd04f8bcf69이며 기존 작업 공간 변경을 보존했다. push/commit·화면 검증은 하지 않았다.

## H7G 최신 — 설정 게시 후보 보존·명시적 복구 (2026-10-12)

외부 writer의 마지막 변경을 포착해 현재/이전/요청한 설정을 journal에 보존하고, 비어 있는 경로에만 게시한다. 중단·충돌 후보는 자동 채택하지 않고 설정 복구에서 읽기 전용 비교 후 명시적으로 선택한다. old open handle 지연 쓰기·실제 capture/link/commit crash4경계·복구 자체 경합·stale/readonly/BOM·읽기 중 게시 중단 차단을 확인했다. 보관 이력/로그/source/파형을 유지하고 현재 설정이 유효하면 복구 후 Run을 해제한다. 관련43 PASS·overlay3 PASS·Git HEAD의 실제 owned3파일 migration PASS·Linux 전체215 PASS/0 FAIL/1 Windows batch SKIP(총216)·runtime/language build. H7F의 외부 bytes overwrite FAIL 진단은 H7G 재실행에서 protected true/저장 거절/세 후보 확인 PASS/exit0이다. 다음 H7H는 journal 보관량·반복 저장/조회 비용과 장기 사용 정책이다. 현재128 transaction gate·자동 prune 없음·전체 scan 한계, RSS/실제 설계·Windows 공식 본체/NTFS/실제 복구 UI·물리 통합은 잔여다. [상세 근거](ide-h7g-import-publication.md). 이번 read-only GitHub main 재확인도85ba1fe6f245182faf90602628560cd04f8bcf69로 기존 work 기준과 같았다. 구현 변경은 작업 공간에 보존하며 push/commit을 수행하지 않았다.

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

**엔지니어가 코드를 쓰고 실행·관측하는 데 집중하게 하며, IDE 설정을 배우게 하지 않는다.** 사용자 추가 요구(2026-10-13)는 **VS Code/PyCharm처럼 가볍고 빠른 반응**이다. 불필요한 I/O/background/메모리·process 사용을 줄이고 실제 병목을 계측한다. [성능 계획](ide-performance-plan.md)을 유지한다. 깔끔한 VS Code 느낌, 가벼운 화면, 눈에 보이는 명시적 버튼, 기능별 자연스러운 위치가 중요하다.

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
| H7 | H7A～J 뒤 H7K 최신 probe/restart·status1개/focus·IPC drain/parent close·cleanup quarantine·late callback 보호. 264 PASS/0 FAIL/1 Windows batch SKIP(총265개, 순차 전체). 다음 H7L 실제 입력/파일 이벤트/journal 무효화·generated 비용. Windows/Electron/client host 종료·공식/앱·실제 설계/RSS/disk 잔여 ([수용표](ide-h7-acceptance-summary.md), [성능 계획](ide-performance-plan.md)) |

최신 Windows 개발 환경 근거: **145 PASS / 0 FAIL / 0 SKIP**, runtime/language build, 공식 본체 TS7 전체 타입 0 errors, 공식 emission 3파일 0 errors. H6D trusted native 4시나리오 PASS: 과거 matching→dirty 무효화/changed→실제 diff/삭제 package 거절→복구 matching. 최신 결과/history29/원형 보존, 새 simulation 없음.

이 숫자는 **과거 로컬 Windows 실행 결과**다. 이번 문서 작업이나 클라우드 실행 결과가 아니다. 자세한 근거는 `ide-h6d-selected-run-comparison.md` 및 이전 H6 문서. `.dev/h6d-*` 로그와 `.dev/import-ui-dbJf2o` 실제 fixture/profile/receipt는 Git 제외로 클라우드에 없을 수 있다. 문서만 보고 해당 파일이 클라우드에도 존재한다고 가정하지 않는다.

## 11. 클라우드 준비에서 실제로 주의할 제약

위의 Linux runtime/language 빌드·자동 회귀와 실제 counter 시뮬레이션은 확인했다. **Windows Code-OSS 전체 native 빌드/시험은 클라우드에서 검증하지 않았다.** 런타임 분리 구조가 Linux에서 Windows 앱 수용을 보장하지 않는다.

- Git에 포함: root 문서/AGENTS, ide 소유 src/runtime/language/config/scripts/tests/examples/lock/license, 유지할 vsix 코드. 제외: node_modules/dist/out, `ide/upstream`, `.dev`, `.rtl`, 설치 도구, 사용자 profile/trust/secrets.
- 로컬 작업 경로 `D:\Dev\verilog_ide`는 설명용이다. 클라우드 repo root를 감지하고 상대 경로로 작업한다.
- `ide/scripts/bootstrap.ps1`, `environment.mjs`, `dev.mjs`, launcher는 Windows x64/MSVC/배치 중심이다. Linux cloud에서 doctor가 실패하는 것은 예상 환경 제약이며 guard를 삭제해 통과시키지 않는다.
- upstream은 `upstream.json`의 공식 archive/revision/hash/lock 기준으로 재구성한다. 독립 Git metadata와 pinned HEAD 필요. 클라우드용 준비가 필요하면 ide 안의 별도 작은 script/문서로 지원하고 Windows bootstrap은 보존한다. source baseline/version을 편의상 바꾸지 않는다.
- Node는 pinned 24.18.0 기준을 확인한다. ide 자체는 `npm ci`와 `npm run build:runtime`, `npm run build:language`가 시작점이다. lockfile을 자동 갱신하지 않는다.
- 전체 `npm test`는 pretest로 두 build 후 tests를 실행한다. H7F의 cgroup4 CPU에서 기본 병렬 전체가 deadline/semantic timeout을 만나 분리 재검증 후 runtime/language build + `node --test --test-concurrency=2 tests/*.test.mjs`로197개 전체를 완료했다. H7G의 concurrency2 전체는 기존 slang completion15초 제한의 Cancelled1 FAIL을 만나 해당 semantic suite를 단독 재검증했다. 최종 H7G는 runtime/language build 뒤 `node --test --test-concurrency=1 tests/*.test.mjs`로216개 전체를 완료했다. Linux에서는 기본 병렬을 피하고 제한된 병렬/필요 시 serial을 사용하며 제품/시험 timeout이나 skip을 늘리지 않는다. 일부 semantic/import 관리 시험은 로컬 `.rtl-dev/tools/slang-11.0.0-python-3.14.7/python.exe` 경로를 사용한다. `semantic.test.mjs`에는 `RTL_SEMANTIC_PYTHON`이 있지만 모든 시험이 이를 사용하는 것은 아니다. Cloud용 verified slang runtime/경로 주입을 먼저 점검해야 한다.
- 로컬 사용 도구: Verilator 5.050/MSYS2 UCRT64/GCC16, slang11.0.0/Python3.14.7. 이 Windows executable을 Linux에서 사용하지 않는다. cloud simulator/frontend 설치·버전·지원 범위를 별도로 기록한다.
- 전체 시험이 준비되지 않았다면 가능한 순수 시험을 명시적 목록으로 수행하고 전체 미실행 원인을 남긴다. 의존성을 제거/가짜 성공/조용한 skip으로 기존 검증 요구를 낮추지 않는다.
- Windows batch/path/process-tree/설치 검증과 physical UI는 Windows 재확인 대상이다. POSIX 대소문자/프로세스 동작을 Windows 규약으로 바꾸지 않는다.
- 본체 전체 타입은 upstream **공식 `@typescript/native` TS7**을 사용했다. ide-local TS5.9로 whole upstream 검사하면 이전에 heap limit이 발생했다. `src/tsconfig.json` 기준 `--noEmit --skipLibCheck` 사용, 실제 새 환경 요구도 확인한다.
- Windows 로컬 설치 승인은 과거 해당 환경의 승인이다. 새 사용자 PC의 도구 설치를 포괄 승인한 것으로 재사용하지 않는다. cloud 준비도 적용되는 권한/네트워크 정책을 따른다.

## 12. 다음 작업 순서와 열린 항목

1. Cloud 작업 준비: 현재 commit/파일/lock 확인, 사용 가능한 OS/Node/도구 확인, 가능한 build/test 실행과 불가능한 항목 기록. 준비가 기존 제품 기능을 바꾸는 큰 작업으로 번지지 않게 한다.
2. **H6 기본 경로 판정 완료.** [수용표](ide-h6-acceptance-summary.md)에 자동 trace·미저장 snapshot·비교·보관/diff와 잔여 gate를 묶었다. H6 기능을 끝없이 추가하지 않는다.
3. **H7 안정화:** H7A～J 뒤 H7K probe/restart 최신 요청·status1개/focus·prepareShutdown/provider join/소유 IPC parent close·cleanup quarantine·late callback 보호를 확인했다. 다음 H7L은 실제 입력 의존성과 파일 이벤트/journal 무효화 범위·generated 이벤트 비용이다. [H7 수용표](ide-h7-acceptance-summary.md), [성능 계획](ide-performance-plan.md)을 따른다. .rtl의 포함 header가 실제 입력일 수 있으므로 폴더 이름으로 무조건 제외하지 않는다. Windows/Electron 실제 LanguageClient/host 종료 deadline·taskkill/신뢰·공식 본체/NTFS/UI·실제 설계/RSS/전체 archive disk는 잔여다.
4. 비UTF8/untitled/deleted/foreign source 경계, 외부 writer/crash·빠른 root/선택/편집 race를 검증 가능한 범위부터 정리한다.
5. 남은 실제 화면 체크리스트를 누적 → 마지막 Windows 통합 세션 → 필요한 수정과 관련 회귀. 이후 사용 수용/배포는 사용자 판단에 따른다.

현재 알려진 제한: H7H active128 상한·명시적 정상32 유지/별도 보관·archived 자동 감시 제외·전체 disk cap 없음·H7I scan 공유/H7J LSP2/32 및 in-flight 공유 후 config·all-root/settled query/package compilation·H7K 최신 probe/status single/focus·IPC 종료 확인 후 generated/실제 dependencies·native startup/idle 비용 잔여, 보관 source UTF8·64MiB/256 entries 창 LRU cache(model 제거/project 전환/dispose 해제 구현; 전체 model/IPC 메모리 한도 아님·Windows 실제 해제 수용 필요), history 기본 최근100(확장 읽기 최대1000), saved/current 비교 비용·전체 filesystem atomic snapshot 아님·tool environment 동일성 보증 아님. FST 내장 표시/enum 미연결. UI 요청 도중 물리 race/DPI/긴 시간·그룹 drag 등 종합 재수용이 남는다.

별도 깨끗한 Windows PC/VM은 **현재 사용자에게 없음**. 설치 승인→다운로드/pacman 서명→실행→파형 종단 및 network/retry/reuse 전 범위 검증을 완료라고 선언하지 않는다. 현재 도구 재사용 검증은 새 환경 설치 검증과 다르다. 확보 전에도 다른 구현/검증은 진행 가능하다.

## 13. 검증 운영·인수인계 갱신

사용자 최신 결정: 구현과 **화면 조작 없는 일반 자동 검증은 계속**한다. **Computer Use 및 화면/포커스를 차지하는 실제 앱 검증은 마지막에 한 통합 세션으로 모은다.** 기능마다 앱 창을 반복 띄워 사용자 작업을 방해하지 않는다. 화면 검증을 없애는 합의는 아니다.

누적 표에는 항목/관련 기능/자동 근거/남은 실제 조작/대상 환경을 남긴다. 자동 PASS를 물리 PASS로 쓰지 않는다. 실제 창·프로필·trust를 보존하고 신뢰 설정은 사용자가 처리한다. 통합 세션 전 범위/순서/예상 소요를 알린다. 실패 후는 관련 수정/자동 회귀 후 필요한 항목만 재확인한다.

작업마다 `PROGRESS.md`, `docs/handoff.md`, `docs/current-validation.md`, `docs/delivery-plan.md`, 관련 acceptance와 `ide/DEVELOPMENT.md`를 필요한 만큼 업데이트한다. 이 문서의 현재 단계/다음 순서도 이정표에서 갱신한다. 과거 로그를 새 테스트 결과로 표기하지 않는다. 문서 작업만 했다면 테스트 재실행 없음이라고 명시한다.

릴리스 패키징/설치/새 VSIX 생성, 사용자 창 종료/신뢰 변경, sibling 프로젝트 수정, 자체 compiler/simulator와 Diagram 재개는 현재 클라우드 인수인계 작업에 포함하지 않는다.
