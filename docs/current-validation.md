## 최신: Pulse (beta) Setup 생성 완료 (2026-10-16)

최신 앱에서 검증 전용 DOM/강제 클릭 명령·계측/개발 확장을 제외하고 Setup을 생성했다. 전체436건:435 PASS/0 FAIL/0 CANCEL/1 POSIX SKIP, 본체 타입0 errors, 앱2,558파일/native integrity10개·payload2,563개·라이선스30개·Inno6.4.1 exit0·최종 EXE/SHA256 대조 PASS다. `ide/release/Pulse-Setup-windows-x64-beta-20261016.exe`(260,697,847 bytes), 제어판 이름 Pulse (beta)·기존 제품 identity/경로 유지. `Start-Pulse.cmd`도 최신 후보를 선택했다. [산출물·해시·실패 보완·정확한 검증 범위·다음 작업](pulse-beta-20261016.md)가 기준이다. 실제 설치/upgrade/uninstall·새 화면/clean Windows는 미검증이며 사전 승인 없이 진행하지 않는다. 이전 artifact/사용자 창·신뢰·프로필은 보존했고 업로드/공개 게시 없음. H7 성능/대표 설계·후속 diagram/엔진 잔여는 유지한다.

## 새 위치 모듈 이름 추천 — 비화면 검증 (2026-10-16)

수정 전 actual LSP 재현1 FAIL, 수정 후 최종 전체426건425 PASS/0 FAIL/1 POSIX SKIP(252.1초)·language build0·diff PASS. module source 삭제 즉시 후보 제거·기존 port/package/scope/시뮬레이션 회귀를 포함한다. 관련4/단위12 PASS는 전체와 겹쳐 합산하지 않는다. 별도 언어 수정 앱의2,564파일·native integrity10·headless native/RTL CLI 두 top PASS. [최종 근거·현재 실행·미검증](pulse-module-catalog-completion.md)을 기준으로 한다. 새 화면/Computer Use·설치·배포 없음.

## 편집 연속성 — 비화면 검증 (2026-10-16)

전체421건420 PASS/0 FAIL/1 POSIX SKIP(254.2초), 마지막 경계/UTF-16 보강 후 관련40건40 PASS(51.9초), language build0. 합산 금지. actual slang rebuild gate 중 module token3개/미연결 포트2개 유지·ready/hover에 이전 결과 미사용·외부 변경 즉시 폐기·같은 package 후보 유지/다른 qualifier 거절을 확인했다. gate API3.26/1.33ms는 작은 fixture이며 UI 성능 수치가 아니다. 초기 단위1 FAIL은 dot 뒤 offset을 한 글자 지나친 fixture를 수정하고 후속 검사로 확인했다. 새 화면/Computer Use·설치·배포 없음. [최신 실행·근거·잔여](pulse-semantic-continuity.md).

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

## H7S 최신 — enum 표시 정보 재사용·lookup/요청 대기 구분 (2026-10-13 UTC)

기존 pyslang의 동일 native enum identity/고정 lookup scope에서 해석한 표시 값·spelling을 요청 안에서만 재사용한다(최대64 types/4096 values/1MiB UTF-8 payload, 상한 거절 시 원래 계산·각 output 별도 복사). native lookup·default/decl order·shadowing·parameterization·Core/journal·신뢰/미저장/파일/실제 cleanup 보호를 유지하며 자체 compiler/simulator·상시 worker/settled cache는 추가하지 않았다. dense enum32/variables96의 실제 lookup9332→950/두 contexts·전후5회 전체 semantic/hierarchy30쌍 JSON 일치, unqualified 완성 중앙값1405.0→642.6ms·해당 Python peak55.6→41.4MiB를 확인했다. 일반 IPC 편집→완성949.5→979.4ms는 개선 미확인이다. snapshot 현재 분석403.7ms/query active561.8ms와 pool queue 약0.1ms를 구분했고, 제어된100ms hold의 실제 queue/종료/third start도 검증했다. 전체 앱/RSS/Windows 수용으로 일반화하지 않는다. Linux 전체 **322 PASS/0 FAIL/1 Windows batch SKIP(총323개)**·신규6 PASS·runtime/language build. 모든 상한 fallback·native identity/owned output·257/unknown enum 미표시·다른 parameterization ambiguity와 다음 편집 fresh 복구를 통과했다. 다음은 Windows 통합 검증 준비: P0 공식 본체/NTFS/취소·종료→P1 native watcher/한 번의 화면 통합·실제 대표 baseline 순서다. default/candidate/포화 queue·장시간/RSS·전체 disk·미구현 내부 연산/FST/파형 enum 등은 잔여이고 화면은 마지막 통합까지 보류한다. [구현·전후 계측·검증](ide-h7s-lookup-wait.md)·[통합 검증 우선순위](ide-h7-integration-gates.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7R 최신 — 요청 안에서 package 시작 비용 공유 (2026-10-13 UTC)

기존 pyslang의 auto package dependency와 분석을 한 요청의 Python process에서 이어가되 graph 게시→Core orderPackages 검증→소유 continuation/approval 확인 뒤에만 새 test compilation을 만든다. Core 오류/순서·독립 manager/default/lookup·미저장/신뢰/FS/journal·실제 취소/join/cleanupFailed 보호를 유지하고 상시 worker/cache·자체 compiler/simulator는 만들지 않았다. 300 RTL/package/tests의 Python 시작2→1, 실제 IPC startup/edit4→2·전후5회 semantic/hierarchy20쌍 JSON 일치다. 이번 Linux IPC 편집→완성 중앙값1779.0→900.5ms, 공유 완성899.1→756.4ms를 관찰했다. shared Node CPU29.5→46.1ms·Python peak40.6→41.2MiB도 기록하며 전체 앱 지연/RSS 수용으로 일반화하지 않는다. Linux 전체 **316 PASS/0 FAIL/1 Windows batch SKIP(총317개)**·최종 관련19 PASS·runtime/language build. 승인 전/후 취소·조기/다른 응답·atomic 쓰기 실패·실제15초 승인 누락/종료·fresh 복구를 확인했다. 내부 연산 조회의 Python adapter 부재는 기존 미구현 잔여이며 hierarchy 수용과 구분한다. 다음 H7S는 default/완성 lookup CPU·실제 요청 대기 분리와 H7 성능 잔여/최종 Windows 통합 우선순위 정리다. Windows 공식 본체/native watcher/client/NTFS 파일 왕복/taskkill/화면·대표 설계/장시간/RSS/전체 disk gate는 잔여이고 화면은 마지막 통합까지 보류한다. [구현·전후 계측·검증·다음 단계](ide-h7r-package-session.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7Q 최신 — 독립 테스트 완성 비교·scope 좌표 비용 (2026-10-13 UTC)

기존 pyslang 연동의 전체 symbol JSON 교집합을 순서·중복·타입/선언/default/enum/callable 동의 그대로 선형 비교하고, query 파일 밖 scope의 불필요한 end 좌표 계산을 줄였다. 자체 compiler/simulator 개발은 아니다. 실제300 RTL의 symbol 직렬화93,326→608회, 큰 공유 완성5회 Node CPU 중앙값319.9→33.7ms·wall1158.5→865.8ms·semantic/hierarchy20쌍 JSON 일치다. wall 편차와 작은 IPC 편집→완성1277.2→1472.2ms를 기록하며 전체 지연/RSS 개선으로 판정하지 않는다. Linux 전체 **310 PASS/0 FAIL/1 Windows batch SKIP(총311개)**·기존43/새guard3 PASS·runtime/language build. Core package 오류의 분석 전 거절·취소/실제 process join/임시 파일 회수·원본/신뢰/FS/journal 보호를 유지했다. 별도 package process/import 비용은 남으며 다음 H7R은 Core 검증 뒤 분석하는 요청 내 양방향 protocol과 취소/정리 경계다. Windows 공식 본체/native watcher/client/화면·대표 설계/장시간/RSS/전체 disk gate는 잔여이고 화면은 마지막 통합까지 보류한다. [구현·전후 계측·검증·다음 단계](ide-h7q-semantic-agreement.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7P 최신 — pyslang 연동 경로·위치 계산 비용 (2026-10-13 UTC)

기존 pyslang bridge의 완성 호출 안에서 canonical 경로를 재사용하고, 같은 SourceManager의 UTF-8→UTF-16 좌표를 최대4MiB payload/64 buffer/4096 point로 재사용한다. 다음 요청/independent test에는 공유하지 않고 source/파일·Core·journal 검증과 의미 lookup/default·실제 취소/cleanup은 유지한다. 자체 compiler/simulator 개발은 아니다. 실제 Python helper lstat14675→9763/테스트,300 RTL+대형 Unicode/ports/선언의 공유 완성5회 중앙값1417.6→991.9ms·completion CPU556.5→224.1ms·분석/완성/hierarchy20쌍 JSON hash 일치를 확인했다. 작은 IPC 지연 개선과 전체 RSS 감소는 확인하지 않았다. Linux 전체 **307 PASS/0 FAIL/1 Windows batch SKIP(총308개)**·기존39/새guard4 PASS·runtime/language build. 좌표 전체 byte/BOM/CRLF/astral·상한 fallback·fresh manager/overlay·alias retarget과 복구/정리/원본 보존을 통과했다. 다음 H7Q는 pyslang 연동의 별도 package 시작·default/완성 traversal/lookup·실제 요청 대기 비용이다. Windows 공식 본체/native watcher/client/화면·대표 설계/장시간/RSS/전체 disk gate 유지·화면은 마지막 통합으로 보류한다. [구현·전후 계측·검증·다음 단계](ide-h7p-pyslang-positions.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7O 최신 — 미설정 폴더 재검사·inline macro 문맥 (2026-10-13 UTC)

실제 read/lstat 부재만 ProjectManifestMissing으로 분류하고 missing root의 source/peer 이벤트 재검사를 멈췄다. root/parent shallow 복구 감시와 등록 뒤 재읽기·manifest/journal/ancestor 복구를 유지하며 malformed/include/source ENOENT는 보수적으로 처리한다. inline object/function macro 뒤 실제 compiler 기반 signal/package/서명 완성을 복구하고 directive/argument·block/template 보호를 유지했다. plaintext static header의 미저장 복원도 통과했다. Linux 전체 **303 PASS/0 FAIL/1 Windows batch SKIP(총304개)**·최종guard28 PASS·초기관련59 PASS·runtime/language build. actual IPC의 missing unrelated read1→0·mixed read2→1과 baseline inline query 미실행→fresh symbol을 확인했다. 최초 recovery watch 확인 read 비용과 새로 정상 실행되는 query 시간을 latency 개선으로 표현하지 않는다. 다음 H7P는 compiler point/path·default signature/완성 traversal와 별도 package 시작 비용이다. Windows 공식 본체/실제 watcher/client/화면·대표 설계/RSS/전체 disk gate를 유지하고 화면은 마지막 통합으로 보류한다. [구현·재현·검증·다음 단계](ide-h7o-semantic-context.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7N 최신 — 요청 안에서 컴파일러 시작 비용 공유 (2026-10-13 UTC)

독립 테스트를 한 요청의 Python 프로세스에서 순차 분석하여 시작/import만 공유한다. 각 compilation·macro/header·같은 top의 격리와 공유 RTL 완성 교집합, 자동 package 검증·미저장/FS/journal·취소/실제 cleanup을 유지했다. 300 RTL/package/테스트2개에서 provider launch3→2, actual IPC 편집→완성6→4를 확인했다. Linux 전체 **293 PASS/0 FAIL/1 Windows batch SKIP(총294개)**·관련33 PASS·runtime/language build. incomplete batch 거절·두 번째 group 중 취소/retry·manifest 생성/오류 복구와 idle/status 추가 load/compiler0도 통과했다. 지연 변동과 Python peak RSS를 별도 기록하며 모든 응답/앱 메모리 개선으로 판정하지 않는다. 다음 H7O는 미설정 manifest의 typed 분류·안전한 복구 감시와 inline macro 뒤 code completion 제한, package/default/완성 비용이다. Windows 공식 본체/실제 watcher/client/화면·실제 설계/RSS/전체 disk gate 유지·화면은 마지막 통합으로 보류한다. [구현·단계별 계측·검증·다음 단계](ide-h7n-semantic-request.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7M 최신 — 소스 범위별 분석·감시 비용 (2026-10-13 UTC)

validated source prefix(package/test/literal/external 포함)로 healthy root의 파일/편집 이벤트를 좁히고, 기존 RTL watcher가 덮는 경로의 dynamic 등록과 recursive parent 아래 중복을 제거했다. 신규 감시 확인 read는 자기 root의 nonempty 감시 변경에만 적용하며 include/journal·unknown/error 안전성을 유지한다. actual IPC/Python 3 roots×300 RTL(900개)/3회에서 startup compilation6→3·local edit/100 notifications3→1·normal dynamic900→0(unknown peak 약903→4), shared header3→실제2 roots, unconfigured/generated/status 이벤트 추가분석0을 확인했다. 외부 glob 누락 뒤 생성·비RTL source 구성·held peer query 유지와 watch ack 뒤 old error 상태 차단도 통과했다. 288 PASS/0 FAIL/1 Windows batch SKIP(총289개, 순차 전체)·관련25 PASS/최종guard23 PASS·runtime/language build. CPU/작업 수 감소를 모든 응답 지연 개선으로 판정하지 않는다. 다음 H7N은 compiler 시작/parse/elaboration·package/test와 편집→완성 대기 경로, mixed/error root idle 비용 분리다. Windows native watcher/LanguageClient/host·공식 본체/화면·실제 설계/RSS/전체 disk gate는 잔여다. [구현·규모 계측·검증·다음 단계](ide-h7m-semantic-scale.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7L 최신 — 실제 입력·파일 감시·설정 복구 무효화 (2026-10-13)

컴파일러가 실제로 읽은 source/header와 expanded include·누락 후보를 추적하고, 확인된 입력 밖의 generated 이벤트만 제외한다. 비RTL·외부 include의 directory 감시를 표준 LSP 등록/해제 ack로 관리하고 신규 감시 뒤 재읽기한 결과만 게시한다. 동일 실제 IPC/Python fixture의 generated100개 추가분석1→0, .inc WIDTH4→8의 기존 stale3:0→갱신7:0, previous.toml 변경 뒤 기존 stale Ready→Analysis failed/복구 전 query 차단을 확인했다. 실제2 roots 공유 header 갱신·root 제거 감시 해제·late old-handle held query 취소/명시적 recovery·drain cache/live0도 통과했다. 이전 headless의 workspaceFolders capability 누락을 바로잡아 remove/add 경계를 다시 검증했다. 278 PASS/0 FAIL/1 Windows batch SKIP(총279개, 순차 전체)·관련16 PASS·runtime/language build. 일반 RTL 이벤트는 공유/glob 안전성을 위해 여전히 all-root이며 새 의존성 감시 발견 시 확인용 compilation 비용이 있다. 다음 H7M은 수백 RTL 규모의 감시/재분석 비용과 일반 이벤트 root 범위다. Windows 실제 watcher/LanguageClient/host·공식 본체/화면·실제 설계/RSS/전체 disk gate는 잔여다. [구현·전후 근거·검증·다음 단계](ide-h7l-semantic-inputs.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7K 최신 — 언어 서비스 재시작·idle·종료 확인 (2026-10-13)

최신 요청 하나로 runtime probe/restart를 모으고 실제 취소/정리 뒤에만 replacement한다. 상태 bar는 조회1개·완료 뒤1500ms·focus/RTL 가드로 바꿨다. actual adapter/API 모델20 restart의 probe/client20→1, held probe21→2/최종client21→1, slow status11→1을 확인했다. prepareShutdown의 provider join→native stop→소유 IPC parent close를 사용하고 불확실한 cleanup/stop/disconnect는 quarantine·자동/수동 새 시작 거절한다. 이전/expected-close callback은 새 client를 막지 않는다. 실제 runtime probe/Node IPC/Python4 exit·drain cache/live0·포함한 .rtl header3:0→7:0/원본 불변을 확인했다. 264 PASS/0 FAIL/1 Windows batch SKIP(총265개, 순차 전체)·관련51 PASS·최종 신규18 PASS·runtime/language build. Generated notification100개는 여전히추가분석1회여서 다음 H7L에서 실제 입력 의존성/파일 이벤트·journal 무효화 범위를 확인한다. Windows/Electron 실제 client/host 종료·공식 본체/화면·실제 설계/RSS/전체 disk gate는 잔여다. [구현·전후 계측·실제 IPC·검증·다음 단계](ide-h7k-language-lifecycle.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7J 최신 — 언어 분석 burst·공유·종료 (2026-10-13)

언어 서버 provider 작업을2 active/32 대기로 제한하고 root/generation/exact query의 동시 요청만 공유한다. caller별 취소·마지막 caller 취소 뒤 실제 cleanup slot 유지·stale 결과 차단·close join·cleanup 실패 quarantine을 적용했다. 실제 stdio LSP/Python에서3 roots/100 watch/20 concurrent query의 초기 실제 query20→1, held root process3→2·원본/unsaved/peer 취소/새 요청 재분석·root remove/add·종료 cache0을 확인했다. 기존 debounce의 초기 root 분석3회는 양쪽 동일하다. 이전 종료 응답 뒤 temp3 잔류 FAIL을 재현했고 transient capacity는 새 편집 없는 on-demand 재시도로 복구한다. 246 PASS/0 FAIL/1 Windows SKIP(총247개: 전체246개 + 최종 신규capacity1개 분리 검증)·최종 관련35 PASS·runtime/language build. 다음 H7K는 언어 서비스 시작/재시작·idle/generated 이벤트 비용이다. Windows LanguageClient stop/IPC/taskkill·공식 본체/앱·실제 설계/RSS/전체 archive disk gate는 잔여이며 화면 검증은 보류한다. [구현·실제 진단·검증·다음 단계](ide-h7j-semantic-burst.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7I 최신 — 반복 설정 검사 비용·성능 요구 (2026-10-13)

요청 내 검증한 설정 snapshot을 parser와 최종 게시 검사에 공유해 반복 저장 전체 scan7→3회/current 읽기18→7회·고정1MiB 버퍼 제거를 구현했다. SHA/경로·membership/short read·late old-handle/실제 crash·lease/recovery·abort/join을 유지한다. 동일96개/67KB 합성 fixture3회에서 저장 중앙값1270→662ms·읽은 bytes91.7→39.3MB·file open2716→1169, 신규 회귀의 이전 코드3 FAIL/3 PASS를 재현했다. 238 PASS/0 FAIL/1 Windows batch SKIP(총239개, 순차 전체)·runtime/language build·최종 신규7 PASS·writer protected true/exit0. 실제160회 저장/주기적 retirement도 PASS(이번 약110초; 과거252초와 별도 실행 관측). 가볍고 빠른 VS Code/PyCharm 느낌을 제품 요구와 성능 계획에 기록했다. 다음 H7J는 파일 이벤트/의미 분석 요청 burst·중복 작업과 취소/갱신을 headless로 점검한다. Windows 공식 본체/NTFS/앱 화면·실제 설계/RSS·전체 archive disk gate는 잔여다. [구현·계측·검증·다음 단계](ide-h7i-import-save-cost.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7H 최신 — 설정 기록 별도 보관·조회 비용 (2026-10-13)

명시적 검토·확인 뒤 오래된 정상 설정 기록을 별도 보관하고 최근32개·pending/unknown 기록은 active에 유지한다. 현재 설정·파일 bytes/inode를 보존하며 archived 기록은 자동 변경 검사에서 제외한다는 정책을 UI에 설명한다. 128개 중96개 보관→다음 저장과 실제160회 저장·partial abort/crash/fresh retry·close join을 통과했다. 요청 내 current2회/8개 병렬 검증으로 같은128개 합성 기록의 bytes25.8→17.3MB·중앙값2440→272ms를 관찰했다. 231 PASS/0 FAIL/1 Windows SKIP(총232개: 전체 본체230개 + 최종 신규guard2개 분리 검증)·최종 관련30 PASS·runtime/language build. Windows case-only realpath와 invalid UUID temp2 FAIL을 재현해 보완했고 Windows 실제 파일/화면 수용은 미실행이다. 자동 삭제·전체 disk cap은 없다. 다음 H7I는 반복 저장 guard/scan 중복 비용 분리와 안정화 잔여 수용표다. RSS/실제 설계·Windows 공식 본체/NTFS/물리 통합 gate를 유지한다. [구현·정책·계측·검증·다음 단계](ide-h7h-import-journal.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7G 최신 — 설정 게시 후보 보존·명시적 복구 (2026-10-12)

외부 writer의 마지막 변경을 포착해 현재/이전/요청한 설정을 journal에 보존하고, 비어 있는 경로에만 게시한다. 중단·충돌 후보는 자동 채택하지 않고 설정 복구에서 읽기 전용 비교 후 명시적으로 선택한다. old open handle 지연 쓰기·실제 capture/link/commit crash4경계·복구 자체 경합·stale/readonly/BOM·읽기 중 게시 중단 차단을 확인했다. 보관 이력/로그/source/파형을 유지하고 현재 설정이 유효하면 복구 후 Run을 해제한다. 관련43 PASS·overlay3 PASS·Git HEAD의 실제 owned3파일 migration PASS·Linux 전체215 PASS/0 FAIL/1 Windows batch SKIP(총216)·runtime/language build. H7F의 외부 bytes overwrite FAIL 진단은 H7G 재실행에서 protected true/저장 거절/세 후보 확인 PASS/exit0이다. 다음 H7H는 journal 보관량·반복 저장/조회 비용과 장기 사용 정책이다. 현재128 transaction gate·자동 prune 없음·전체 scan 한계, RSS/실제 설계·Windows 공식 본체/NTFS/실제 복구 UI·물리 통합은 잔여다. [구현·회귀·최종 근거·한계](ide-h7g-import-publication.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7F 최신 — 손상 프로젝트 보관 이력·writer crash 복구 (2026-10-12)

현재 DUT/TOML 손상·삭제/linked 상태에서도 retained history를 먼저 읽고 historyOnly 행의 로그/source/파형을 보존한다. Run/Explorer·현재 입력 비교/diff는 잠그고 복구 inspect/Apply에서 해제하며 source row도 다시 연결한다. log root/epoch·A/B/A/close join을 보완했다. 새 PID/UUID lease directory는 실제 writer의 게시 전/후 종료와 fresh retry, 지연 stale reclaimer의 새 owner 보호를 통과했다. legacy/unknown/live lock과 orphan temp는 무조건 삭제/승격하지 않는다. 이전 inspect1 FAIL 재현·관련26 PASS·client/overlay8 PASS·Linux 전체196 PASS/0 FAIL/1 Windows batch SKIP(총197)·runtime/language build. 별도 비협력 writer 진단은 마지막 검사/rename gap에서 external bytes overwrite를 재현해 FAIL/exit1이며 일반 PASS에 합산하지 않는다. 다음 H7G는 이 최종 경합의 보관/복구 journal·publication 설계다. Home/contract 이전 owned hash를 기록했고 공식 TS7/target emission·Windows 실제 lease/보관 UI·RSS/실제 설계/물리 통합은 잔여다. [구현·재현·FAIL 경계·다음 단계](ide-h7f-project-recovery.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7E 최신 — 보관 소스 cache 해제·RSS 원인 분리 (2026-10-12)

보관 source cache를64MiB/256 entries LRU로 바꾸고 model removal·project 전환·dispose 시 해제, stat/read coalescing·무효 pending 거절·root/epoch·A/B/A/late 탭 open 보호를 보완했다. 이전 provider의 모델 제거 무효/stale navigation2 FAIL 재현, 관련13 PASS·Linux 전체187 PASS/0 FAIL/1 Windows batch SKIP(총188)·runtime/language build. 같은4,096신호 retained VCD로 idle/trace/default/arena2 진단을12회씩 수행해144 worker 전부 exit·thread11→15→11·worker live heap 첫/마지막 약19.8MiB를 확인했다. glibc helper에서 RSS 일부 반환을 확인했지만 default trace 종료375.7→진단 trim345.3MiB, Anonymous317.3MiB가 남아 RSS 회복 전체는 미해결이다. allocator 변경/trim은 진단 child 한정이며 app에 넣지 않았다. Home 이전 owned hash와 새 cache overlay를 기록했다. 공식 본체 TS7/target emission·실제 model/tab/diff 해제·Windows 화면은 미실행. 다음 H7F는 손상/누락 프로젝트의 보관 이력 접근·외부 writer/crash 복구이며 RSS/native profiler·실제 설계/Windows 통합 gate는 유지한다. [구현·재현·계측·한계](ide-h7e-cache-memory.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7D 최신 — 보관 결과 복원·파형 reader 종료·메모리 계측 (2026-10-12)

파형 열기에 root/epoch·A/B/A·종료 guard를 연결하고, trace 검증 abort/join·반복 close/dispose join·실제 worker 종료까지4개 slot 유지로 보완했다. 기존 경로의 gated 종료/반복 close2개와 stale open1개 실패를 재현했다. 새 host의 과거 run/최신 분리·저장 뷰·원본 삭제·trace/settings 손상 복원 보호, 별도 OS process의 runId/default view/32개 신호 재열기를 확인했다. Linux 전체176 PASS/0 FAIL/1 Windows batch SKIP(총177)·runtime/language build. 4,096 신호/262,144 changes·reader4개×6회 및 기존 실제 Verilator VCD2개 조회 PASS·parent26 created/26 exited/live0, 새 simulation/화면 없음. RSS는61.4→종료 후365.8MiB·main heap8.6→10.8MiB로 worker 종료와 별개 잔여다. 다음 H7E는 RSS 원인 분리·장시간/실제 설계와 보관 source64MiB cache/탭 해제 경계이며 Windows 공간/탭/선택·종료/taskkill·공식 본체 수용은 마지막 통합으로 남긴다. [근거·계측·한계](ide-h7d-waveform-restoration.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7C 최신 — 실제 취소·정리 실패·IPC 종료 보호 (2026-10-12)

실제3단계 child tree/peer·leader 선종료·timeout·정리 거절/지연·result 쓰기 실패를 검증했다. 기존 group kill 실패의 parent-only fallback/무한 대기를 재현·보완: cleanup failure는 FAIL/별도 kind·history 보존·batch 중단·session quarantine·close reject, 정리 확인5초 상한·late log/notify 억제. Node IPC close finally 해제와 disconnect/dispose error routing도 보완했다. 관련31+channel3 PASS·Linux 전체171 PASS/0 FAIL/1 Windows batch SKIP(총172), runtime/language build. 실제 Verilator3회 passed→cancelled→passed·취소 전 live build group8/후0·원본/이전 VCD/이력3 보존 PASS, pinned base+real host의 headless Node adapter3묶음 PASS. 앱 화면/Windows taskkill·공식 전체 본체 TS7 타입/target emission은 이번 미실행. Node overlay는 이전 owned bytes hash를 기록했다. 다음 H7D는 재시작 복원·파형 reader lifecycle/메모리이며 Windows 종료 안내·join/미저장 보호는 마지막 통합 수용으로 남긴다. [구현·실패·실제 근거·한계](ide-h7c-process-cleanup.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7B 최신 — 보관 검증 비용·조회 취소 보호 (2026-10-12)

300 RTL/1000 이력의 history·설정·보관 검증·saved/editor 포착·host 조회 비용을 분리했다. 요청별 identity Map·최대8개 병렬 retained 읽기를 적용하며 모든 경로/hash/include/provenance 검증을 유지한다. 실패/abort 시 reader join, source/compare의 project epoch·A/B/A 전환 거절과 close 시 조회 취소/대기를 보완했다. 관련21 PASS·Linux 전체157 PASS/0 FAIL/1 Windows batch SKIP(총158)·runtime/language build, 기존 실제 VCD/FST4개 retained 입력/trace 재검증 PASS(새 simulation 없음). 동일 fixture 중앙값 retained797→133ms·host 비교1827→918ms·소스 읽기623→393ms 관찰, 계측한 I/O 수 동일·부하 변동/전체 성능 gate 유지. 앱 화면/Windows 전체 본체는 이번 미실행. 다음 H7C는 실행 취소/종료·child tree 정리/실패 경계이며 Windows 안내·복원은 마지막 통합 수용으로 남긴다. [구현·계측·회귀·남은 범위](ide-h7b-input-validation-cost.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7A 최신 — H6 범위 판정·이력 삭제 복구 (2026-10-12)

[H6 수용표](ide-h6-acceptance-summary.md)에서 기본 경로를 판정하고 H7을 시작했다. 최신 trace/log 삭제로 이력이 사라져 과거 run이 최신이 되던 결함을 보완했다. status/runId·보관 입력 유지, missing artifact 안내·무쓰기 복원, 이력 I/O 최대8개 병렬 검증/정렬을 적용했다. Linux 최종150 PASS/0 FAIL/1 Windows batch SKIP(총151)·runtime/language build. 300 RTL/1000 이력 합성 검증 PASS, 동일 fixture 이력 중앙값100개793→326ms/1000개1486→261ms 관찰; 부하 변동이 크고 비교·보관 읽기 비용은 미해결. 앱 화면/Windows 전체 본체는 이번 미실행. 다음 H7B는 비교·보관 검증 비용 분리→종료/복원·중간 규모/메모리·마지막 Windows 통합 수용. clean Windows/FST 표시/enum 등 gate 유지·H7/베타/배포 전체 아님. [구현·실패·측정·한계·인수인계](ide-h7a-history-recovery.md). 아래는 역사다.

## 클라우드 인수인계 진입점 (2026-10-12)

대화 기록 없이 이어받는 실행자는 [클라우드 인수인계](cloud-handoff.md)부터 읽는다. 확정 제품/UX·H6D 현재 상태·H6 범위 판정→H7 순서·Windows/cloud 환경 제약·최종 통합 화면 검증 정책을 모았다. 루트 CLOUD_HANDOFF.md에 새 작업용 시작 안내문이 있다. 이 갱신은 문서 정리이며 cloud 구축·업로드·새 테스트 실행 근거가 아니다. 아래 실제 검증 결과는 기존 로컬 환경의 근거다.

## 검증 운영 원칙 — 사용자 작업 공간 보존 (2026-10-12)

사용자 결정: 구현과 일반 자동 검증은 기존처럼 계속 진행한다. Computer Use로 화면을 조작하는 검증은 각 기능 작업마다 반복하지 않고, 구현·일반 검증을 마친 뒤 마지막에 통합 체크리스트로 모아 한 세션에서 진행한다.

- 코드 수정, 빌드, 타입 검사, 화면 조작 없는 자동 테스트·실제 도구 검증은 계속 수행한다.
- 화면/포커스를 차지하는 실제 앱 검증도 마지막 통합 세션에 포함한다. 개발 중 사용자 화면을 사용하는 검증 창을 반복 실행하지 않는다.
- 남은 화면 검증은 관련 검증 문서에 미검증으로 누적하며, 자동 검증 통과를 물리 UI 검증 통과로 간주하지 않는다.
- 통합 세션 전 대상·순서·예상 소요를 안내하고 사용자 작업과 충돌하지 않는 시점에 진행한다. 기존 창·프로필·신뢰 설정 보존 원칙은 유지한다.
- 화면 검증에서 수정이 필요하면 관련 자동 회귀 검사를 먼저 수행하고 필요한 항목만 재확인한다.

## H6D 최신 — 과거 run 명시적 비교·소스 차이 (2026-10-12)

선택 이력 ‘입력 비교’→saved/current 상태 분리·runId 바인딩·buffer 동결·root/epoch/선택 guard·편집 후 다시 비교, ‘소스 차이’→읽기 전용 보관/현재 편집기·삭제 파일 무생성을 연결했다. 최신 비교/결과·history 보존, 전체 history 자동 반복 검사 없음. 최종145 PASS/0 FAIL/0 SKIP·runtime/language build·공식 전체 본체 타입0 errors/emission3파일0 errors. trusted native4시나리오/exit0: 과거 matching→dirty 무효화/changed→실제 diff/삭제 package 거절→복구 matching·원형/최신 runId/history29/창 보존, 새 시뮬레이션 없음. Core gated 프로젝트 변경/요청 동결 수용, UI 진행 중 물리 race/규모 등은 별도. 다음 H6 수용표/잔여 범위 판정→H7 안정화. clean Windows/FST/enum/encoding·물리/복원 등 gate 유지·H6/베타 전체 아님·배포 없음. [근거·범위·다음 작업](ide-h6d-selected-run-comparison.md). 아래는 역사다.

## H6C 최신 — 보관 소스 읽기 전용 보기 (2026-10-12)

결과/선택 이력 ‘보관 소스’→검증된 RTL/package/header 목록·내용→runId 가상 읽기 전용 Code 탭을 연결했다. 원본 수정/삭제·비등록 경로/변조 보호, 내용 hash/UTF-8·64MiB cache·저장/미저장 분류·현재 소스 구분, 기존 잘못된 실행 안내 수정. 최종144 PASS/0 FAIL/0 SKIP·runtime/language build·공식 전체 본체 타입0 errors/emission3파일0 errors. trusted native3시나리오 및 새 프로세스3시나리오 각 PASS/exit0: 삭제된 package VALUE8/SystemVerilog·실제 typing/provider write 거절·보관 TB/동일 파형·원형 source/TOML/history29 보존·정상 종료, 새 시뮬레이션 없음. 다음 H6D 선택한 과거 run의 명시적 입력 비교/소스 탐색 UX→H6 범위 판정→H7. 물리/encoding/규모·clean Windows 등 gate와 UTF-8/cache/의미 분석 제한 유지; H6/베타 전체 아님·배포 없음. [구현·수용·한계·다음 단계](ide-h6c-recorded-source-view.md). 아래는 역사다.

## H6B3 최신 — 현재 내용 비교·package/header/BOM·복원 (2026-10-12)

saved/current 입력 비교를 분리하고 dirty/content debounce·동결·최신 revision 게시·동일 text/다른 버전 matching·이전 run 비교 미실시 표시를 연결했다. 실제 UTF-8 BOM 수집 누락을 발견해 한 번만 포함하도록 수정. 최종144 PASS/0 FAIL/0 SKIP·runtime/language build·공식 본체 전체 타입0 errors/emission2파일0 errors. trusted native3시나리오/실제4파일 VALUE10 PASS·TOML 보호·current 일치→편집 changed→복원 matching·원형 소스/설정 복구, 새 프로세스1시나리오/동일 retained VCD·4파일 provenance/정렬 PASS·각 exit0/history29. timescale fixture/BOM 제품 오류/검증 include 복구 실패와 hash 대조·관리 Apply 복구 근거 보존. 다음 H6C 보관 소스 읽기 전용 보기/이전 run UX→H6 범위 판정→H7; encoding/물리/규모·clean Windows 등 gate 유지·H6/베타 전체 아님·배포 없음. [구현·실패/복구·다음 인수인계](ide-h6b3-current-input-comparison.md). 아래는 역사다.

## H6B2 최신 — GUI 미저장 Run·실제 앱 수용 (2026-10-12)

개별/선택/전체·Explorer 실행의 동기 dirty RTL/header 수집→공통 IPC/host/Core snapshot을 연결했다. 원본 저장 없음·UTF-8/BOM·크기/경로/신뢰·미저장 TOML 보호, 결과/이력 ‘미저장 입력’·사용 파일 안내. 최종143 PASS/0 FAIL/0 SKIP·runtime/language build·공식 본체 TS7 전체 타입0 errors/공식 emission3파일0 errors. trusted native5시나리오/exit0·실제6회(선택1/전체2/invalid FAIL/취소/Explorer retry)·history21→27, 빌드 중 추가 편집 격리·managed VCD 정렬/이전 탭·dirty/원본 bytes 보존·owned edit 복구/정상 종료. scalar fixture/행 준비 대기와 잘못 선택한 TS5.9 heap 실패를 보완하고 근거 보존. 현재 buffer 정확 비교·dirty package/header/BOM/encoding/restart·과거 source UX는 H6B3 잔여. 다음 H6B3→H6 범위 판정→H7; H6/베타 전체 아님·기존 gate·배포 없음. [실제 수용·한계·인수인계](ide-h6b2-unsaved-run-ui.md). 아래는 역사다.

## H6B1 최신 — 미저장 입력 Core/서비스 snapshot (2026-10-12)

실행 요청 시 편집 text/version 동결→복사본 source/package/header/include 포착·검증→원본 무저장 실행·provenance/history 보존을 구현했다. 실패/비지원 backend의 디스크 fallback 금지·경로/크기/junction/생성물 보호. 최종142 PASS/0 FAIL/0 SKIP·runtime/language build, actual Verilator5회(저장 VALUE1→미저장 두 top VALUE2→잘못된 TB FAIL→저장 VALUE1)/3묶음 PASS·VCD 값/원본5파일/이전 trace/history5/격리 확인. 첫 전체139/140의 source 갱신 경쟁을 보완·후속 검사 coalesce 재현 테스트 추가·실패 근거 보존. GUI/IPC는 아직 미연결이며 현재 앱/CLI 기본 실행은 저장된 입력이다. 다음 H6B2 dirty buffer 수집/Run IPC/host·결과 표시/실제 앱 수용→H6 잔여/H7. H6/베타 전체 완료 아님·기존 gate/배포 없음. [계약·근거·다음 인수인계](ide-h6b1-editor-input-snapshot.md). 아래는 역사다.

## H6A2 최신 — 기본 자동 파형·GUI/CLI 수용 (2026-10-12)

Verilator 기본 실행을 IDE 생성 C++ driver로 전환했다. 원본 dump 코드/C++ 작성 없이 VCD/FST/off·원래 top 계층 유지, run별 고유 trace를 artifact로 명시하고 Core fallback 혼동을 차단했다. 새 예제 dump 제거·기존 dump/원본 보존. 최종136 PASS/0 FAIL/0 SKIP·runtime/language build, actual service/CLI8항목 PASS·새 예제 VCD/FST4회+보존 PASS·trusted native3항목/exit0(기존 dump 동시 생성·managed 내장파형 정렬·이전 탭/공간 왕복/원본 유지), history14→15. 검증 JS/숨겨진 frame 대기 오류를 보완하고 실패 기록 보존. browser overlay 미변경으로 전체 upstream 타입/emission 반복 없음, 기존 H5G3 근거 유지. H6A 기본 경로 완료·H6/베타 전체 아님. 다음 H6B 미저장 입력 snapshot 계약/실행→H7 잔여. 기존 clean Windows/FST 표시/enum/규모/물리·복원 gate·배포 없음. [근거·한계·다음 작업](ide-h6a2-managed-waveform.md). 아래는 역사다.

## H6A1 최신 — 자동 파형 prototype·방식 결정 (2026-10-12)

IDE 생성 C++ driver로 원본 RTL 무변경 VCD/FST/off·timing/assert/다중 top/기존 dump/$fatal/취소·dump 토큰 없는 별도 RTL을 실제 검증했다. wrapper는 계층을 추가하여 기본 후보에서 제외. 전체134 PASS·runtime/language build, 최종 보강 runtime/관련1 PASS·실제9항목/exit0. Windows context 시간 링크 옵션·모델 이름/버스 범위/시간 fixture 시험 보완과 실패 근거 보존. 현재 prototype만이며 기본 IDE/CLI --binary 경로 미변경·자동 dump 기본 적용/H6 완료 아님. 다음 H6A2 driver backend/Core 명시적 trace 연결·중복/파일명 정책·GUI/CLI 수용→H6B unsaved snapshot. 기존 gate·배포 없음. [근거·한계·다음 계약](ide-h6a1-managed-trace-prototype.md). 아래는 역사다.

## H5G3 최신 — 폴더 역할 보호·상속/예외 수용 (2026-10-12)

생성물/의존성 폴더·직접/상위 링크 지정 거절을 보완했다. 전체133 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 실제 앱4항목 PASS/trusted:true/exit0: 미저장 TOML Undo/무쓰기·실제 g++ 빌드 중 변경 거절/취소·링크/생성물 거절·상속/파일 override/제외/해제 및 실제 배지. 원형 TOML·이전 VCD 보존/history14(취소1추가), 임시 소유 폴더/junction 정리·정상 종료. 명령/IPC/DOM 수용이며 물리 메뉴/DPI/규모·H5/베타 전체 완료 아님. 다음 구현 H6A Verilator 자동 dump prototype→H6B saved/unsaved snapshot→H7 잔여. 배포 없음. [근거·한계·다음 단계](ide-h5g3-folder-guards.md). 아래는 역사다.

## H5G2 최신 — 저장된 폴더 역할·앱 재시작 복원 (2026-10-12)

역할 적용 후/새 프로세스 Code 초기 읽기에서 Explorer 아이콘 유지, 저장됨/초안 구분·canonical TOML/root/revision 보호. 빈/제외 경계 디렉터리 수집·링크/생성물 제외, 파일 override/실행 흐름 보존. 전체132 PASS/0 FAIL/0 SKIP·runtime/language build·전체 타입0 errors·최종 관련10 PASS, 실제 앱 저장3/새 프로세스 복원2항목 PASS/trusted:true/각 exit0. 기존 관리 Apply로 원형 TOML/DUT bytes/test 이름/history13 복구·전용 창 정상 종료. 물리 메뉴·상속/override/dirty/busy 종합 UX와 H5/베타 전체 미완료. 다음 폴더 잔여 수용→H6 자동 dump/snapshot. 배포 없음. [근거·한계·인수인계](ide-h5g2-saved-folder-roles.md). 아래는 역사다.

## H5G1 최신 — Explorer 폴더 역할 검토 UI (2026-10-12)

폴더 우클릭 RTL/Simulation/제외/상속 해제→기존 관리·분류 검토 연결, 검토 중 폴더 아이콘/직접·상속 표시. 파일 override·하위 규칙·원본/TOML/이력 보존. 최종129 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 실제 전용 앱4항목 PASS/trusted:true/exit0·history13 불변. 최초 타입 오류와 제한 환경 검증 실패/중단 기록 보존. 저장/적용 후 배지 지속은 아직 미구현: 다음 H5G2 저장된 역할 표시/재시작 수용→H6 자동 dump/snapshot. H5/베타 전체·배포 미완료. [근거·한계·다음 작업](ide-h5g1-folder-role-review.md). 아래는 역사다.

## H5F 최신 — Explorer TB 파일 행 실행 (2026-10-12)

Code 초기 프로젝트 읽기→등록된 대표 TB source의 실제 Explorer 행 hover/focus ▶·단일 실행/여러 top QuickPick·취소 무실행·공통 runner/Simulation 이동 연결. Code-OSS 내부 file registry 재사용, renderer 직접 수정 없음. exact 경로/Core 대표 source 기준·busy/비신뢰/미저장 TOML 제한. 전체126 PASS/0 FAIL/0 SKIP·runtime/language build, 최종 공식 전체 타입0 errors, actual 행/DOM/QuickPick5항목 PASS/trusted:true/exit0·tb.second 실제 Verilator PASS/VCD·Code 왕복/활성화·원본3개 bytes 불변·history13 유지. Emitter threshold0 listener 거절 결함을1024로 보완, URI 타입/숨겨진 row 시험·실패 정리 보강과 근거 보존. 물리 hover/키 조합/DPI·일반 multi-source top 선언 위치는 별도. H5F 행 실행 완료·폴더 역할/H5/베타 미완료. 다음 폴더 역할 우클릭/표시/분류 UX→H6 snapshot/자동 dump. 기존 gate·배포 없음. [근거·한계·인수인계](ide-h5f-explorer-run.md). 아래는 역사다.

## H5E2 실제 앱 수용 최신 — 파일 이벤트·미저장 보호·취소/복구 (2026-10-11)

사용자 직접 닫은 전용 창을 기존 trust로 재사용하여 actual watcher→추가/header/TB 후보 안내·미저장 TOML 보호·관리 Apply→matching·실제 g++ 빌드 중 header 삭제/Cancel 후 감지·이전 VCD 보존·삭제 source 복구5항목 PASS/trusted:true/exit0. 원형 config/source2 bytes 복원·history11(기존9+cancelled2)·reader 보존. 최종 공식 화면 emission/전체 타입0 errors·script syntax2 PASS. 최초 timescale fixture와 include 보존 정책 검증 실패를 기록/보강했으며 강제 overwrite 없이 managed Apply로 복구했다. 전체123/관련7 PASS는 H5E2 이전 자동 근거로 이번 반복 아님. H5E2 실제 흐름 수용 완료·H5/베타 전체 미완료. 다음 구현 Explorer TB hover Run/여러 top 선택·폴더 역할 UI→H6 snapshot/자동 dump. cold 시작 지연·세션 baseline/include override 한계·기존 gate 유지·배포 없음. [근거·한계·인수인계](ide-h5e2-source-sync-acceptance.md). 아래는 역사다.

## H5E2 최신 — 파일 구성 변경 감지·동기화 안내 (2026-10-11)

IDE 소유 imported 원형의 source/package/header 추가·삭제/분류 변경·세션 새 TB 후보를 읽기 전용 비교하고 Simulation 안내→테스트 관리 Apply로 연결했다. 감지 시 TOML 쓰기/의미 분석/Run 전 자동 반영 없음. debounce·실행/관리 중 보류·검사 중 이벤트 재확인·취소/revision 보호·기존 결과/수동 설정 보존. 전체123 PASS/0 FAIL/0 SKIP·runtime/language build, 최종 관련7 PASS·전체 upstream 타입0 errors/exit0. 실제 앱 파일 이벤트→안내 수용은 남으며 사용자 재개한 import-ui 창/신뢰를 유지했다. 세션 baseline의 재시작 제한과 bounded 전체 lexical scan을 명시. H5E2 구현/자동검증 완료·native 수용/H5/베타 미완료. 다음 실제 감지 UI 수용→Explorer/폴더 UX→H6 snapshot/자동 dump. 기존 gate·배포 없음. [근거·한계·인수인계](ide-h5e2-source-sync.md). 아래 기록은 역사다.

## H5E1 최신 — 등록 후 테스트 관리·적용 시 source 재탐색 (2026-10-11)

Simulation 테스트 관리→기존 top 체크/추가·제외→실제 slang 재분석/새 RTL-package-header 반영→Core 설정/이력 복원. canonical imported 원형만 명시적으로 관리, 일반/수동/미저장 TOML·원본·기존 결과 보호. 최종120 PASS/0 FAIL/0 SKIP·runtime/language build, CLI 보강 관리4 PASS·전체 upstream 타입0 errors·trusted native4항목/exit0·새 top 실제 Verilator/VCD/내장파형 PASS·원형 복원/이력9·reader2 유지. H5E1 완료·H5/베타 전체 미완료. source 자동 갱신은 적용 시점이며 background 감지/Run 전 자동 반영은 미구현. 다음 H5E2 변경 감지·동기화 UX→Explorer/폴더 UX→H6 snapshot/자동 dump. 기존 gate 유지·배포 없음. [근거·한계·인수인계](ide-h5e1-project-management.md). 아래는 역사다.

## H5D3 최신 — Windows source 파일명·trusted GUI 수용 (2026-10-11)

한글/공백/대괄호 source/header 실제 Verilator·VCD 및 오류/취소 cache 정리 PASS. GUI 기본 tool-directory 빈 값 탐색 결함 보완. 최종116 PASS/0 FAIL/0 SKIP·runtime/language build, 사용자 직접 trust 후 실제 top2 등록 substeps PASS→등록 복원/개별1·선택2·전체2 총5회 Verilator PASS/VCD·내장파형 정렬/이전 탭 보존·원본 불변·native 최종5항목/exit0. 초기 실패·검증 race/인자 보완 기록 보존. H5D3 수용 완료·H5/베타 전체 미완료·물리 클릭 수용은 별도. 다음 등록 후 test 관리/자동 source 추적·Explorer/폴더 UI→H6 snapshot/자동 dump. clean Windows/설치/FST/enum/규모/복원 gate 유지·배포 없음. [근거·재개 절차](ide-h5d3-source-paths.md). 아래는 역사다.

## H5D2 최신 — 실행 설정 전환·테스트 등록 (2026-10-11)

선택한 top 등록→lock/revision 보호 하 실제 slang 재분석→게시 전 Core 설정 검증→실행 TOML 전환→Simulation 목록 연결. literal source 표기/file.top name을 Core/CLI에 연결, 일반/수동 변경 TOML·원본 보존. 전체113 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 비신뢰 native7항목 PASS. 실제 Host 선택2+CLI named1/all2 총5회 Verilator PASS/VCD·한글/공백 root·.rtl 격리 확인. bracket 파일은 reader/semantic과 달리 기존 Windows adapter가 거절함을 실제 발견/기록. H5D2 구현 완료·trusted GUI 등록 성공/물리 수용·H5/베타 전체 미완료. 다음 trusted GUI 수용/어댑터 파일명 제한 보완→등록 후 테스트 관리/자동 source 추적·Explorer/폴더 UI→H6 snapshot/자동 dump. 기존 gate 유지·배포 없음. [실제 근거·제한·인수인계](ide-h5d2-execution-registration.md). 아래는 역사다.

## H5D1 최신 — 실행 top 의미 분석 확인 (2026-10-11)

가져오기 top 선택→기존 slang 독립 정교화→읽기전용 preview 구현. multi-top/file.top·package 의존 순서·header/include·옵션/정의·source 변경/취소 검증. 전체109 PASS/0 FAIL/0 SKIP·최종 보강5시험 재검증 PASS·전체 upstream 타입0 errors·비신뢰 actual앱7항목 PASS. trusted GUI 성공 표시/물리 top 선택은 미검증이며 실제 slang 성공은 Core/host 근거. pending TOML·테스트 목록·원본 변경 없음. H5D1 확인 단계 완료·H5D/베타 전체 미완료. 다음 H5D2 저장 직전 재검증→실행 TOML 전환/file.top reader 연결→GUI/CLI 실행 등록 수용. 기존 gate 유지. [근거·한계·인수인계](ide-h5d1-top-confirmation.md). 아래는 역사다.

## H5C 최신 — 가져오기 분류 저장·복원 (2026-10-11)

Simulation 분류 저장 버튼→IDE 소유 pending rtl.toml→새 host/refresh 역할 복원 연결. 명시적 저장만 작성·원본 불변·일반/수동 변경 TOML 보존, revision/협력 writer lock·원자적 공개·취소/읽기 전용/linked 경계, 미저장 TOML 저장 차단. 최종104 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 실제 import6항목 PASS. 실제 Windows 대소문자 경로 결함을 발견·보완했다. pending은 실행 manifest가 아니며 CLI/LSP 프로젝트 연결은 H5D에서 전환해야 한다. 물리/프로세스 재시작 복원·외부 writer 최종 경쟁/crash복구와 기존 베타 gate 유지. H5C 분류 저장 단계 완료·H5/베타 전체 미완료. 다음 H5D semantic top 확정·실행 manifest 전환/여러 top 실행 연결→Explorer/폴더 UI→H6 snapshot/자동 dump. [근거·소유 정책·인수인계](ide-h5c-import-persistence.md). 아래는 역사다.

## H5B 최신 — 프로젝트 가져오기 확인 UI (2026-10-11)

TOML 없는 프로젝트의 읽기전용 탐색을 Simulation 홈/실제 IPC에 연결했다. 파일 검색·소스 열기·폴더/파일 역할·제외/초기화·취소/재시도, 공간 왕복/refresh 상태 유지. 원본/TOML/.rtl 작성 및 테스트 자동 등록 없음. 최종100 PASS/0 FAIL/0 SKIP·runtime/language 빌드, 공식 화면 emission/전체 upstream 타입0 errors, 실제 앱 import4항목·기존 Simulation3항목 PASS/exit0. 명령 API 수용이며 물리 dropdown/규모 UX는 남는다. H5B 읽기전용 검토 완료·H5/베타 전체 미완료. 다음 H5C managed TOML 정책/원자적 저장·복원→H5D semantic 확정/여러 top 실행 연결→H6 snapshot/자동 dump. 기존 clean Windows/설치/FST/enum/규모/복원 gate 유지. [검증·인수인계·다음 순서](ide-h5b-import-review.md). 아래 H5A 이하는 역사다.

## H5A 최신 — 읽기 전용 프로젝트 탐색·분류 Core (2026-10-11)

IDE 소유 Core discoverProject로 .v/.sv/.vh/.svh·package/module/header/mixed·파일/최장 폴더 역할·여러 top 후보를 읽기전용 탐색. lexical 후보는 모두 확인 필요이며 semantic 확정 아님. .rtl/의존성/link 제외·stable 순서·취소/읽기 한도·TOML/원본 불변. 최종97 PASS/0 SKIP·runtime/language 타입/build PASS, 기존 preview 해시 불변,335파일/320top후보/20package/5header 약196ms(1회 합성 탐색; GUI/전체성능 수용 아님). H5A 기반 완료·H5 전체 미완료. 다음 H5B 탐색 확인 UI/host→managed TOML 정책/저장→semantic 확인·실행 연결. H3M trusted7 PASS와 기존 설치/FST/enum/규모/복원 gate 유지. [구현·검증·다음 단계](ide-h5a-project-discovery.md).
## H3M 최신 — trusted 실제 편집기 의미 분석 수용 (2026-10-11)

사용자 직접 trust 후 자체 격리 프로필의 일반 개발 host에서 module/scope/미연결port·함수 인자·미저장 진단/복구·definition/hover·module 의미토큰·Code/Simulation 왕복/TOML 제외7항목 PASS/exit0·디스크 불변. 최초 창 충돌과 extensionTestsPath의 메모리 저장소 trust:false 실패를 보존·verifier 보완; trust override/기존 profile 공유 없음. 두 script syntax PASS. 기존91개 자동 검증은 H3K 근거이며 이번 반복 아님. H3/H4/베타 전체 미완료·설치/clean Windows/FST/enum/규모/물리 gate 유지. 다음 H5A 읽기전용 탐색·분류 Core→H5 UI/설정→H6 snapshot/자동 dump. [실제 수용·실패·다음 작업](ide-h3m-trusted-semantic-acceptance.md).
## H3L 최신 — 의미 분석 GUI 검증 격리·대기 (2026-10-10)

사용자 직접 trust 처리는 현재 어려움. 자체 semantic-ui-te972r 프로젝트/profile과 prepare/verify·native semantic 절차 준비; trusted GUI 미실행. 실제 비신뢰 앱 w8eGoW7항목 PASS/exit0·두 script syntax PASS·자체 bundle 성공. 기존 profile 새 창은 자동 검토가 세션 충돌 위험으로 거절해 실행하지 않고 격리 대안 사용. 기존 창/신뢰/소스 보존, 설치/배포 없음. H3/H4/베타 전체 미완료. 다음 사용자 trust 가능시 GUI검증; 대기 중 독립 H5A 읽기전용 탐색/분류 기반 가능. [근거·재개·남은 순서](ide-h3l-semantic-ui-preparation.md).
## H3K 최신 — 도구 설정 UI 연결 검증·신뢰 변경 보완 (2026-10-10)

실제 editor adapter+실제 승인 서비스를 연결해 설치 거절/실패 재시도/승인 중 신뢰 해제/Notification 취소·정리/dispose를 검증했다. 신뢰 해제 시 설치 차단 예외를 정상 취소·안내로 보완. 최종91 PASS/0 FAIL/0 SKIP·runtime/language 타입 통과·내장 언어 bundle 성공. 외부 planner/UI 응답 대체 시험이며 물리 GUI/실제 설치 E2E 아님. trusted semantic GUI/물리 설치 UX·clean Windows·기존 잔여 gate 유지; H3K/H3/H4 전체·베타 완료 아님. 다음 trusted GUI 수용→H5 자동 탐색/폴더/multi-top→H6 자동 dump/미저장 simulation. [이번 결과·남은 범위](ide-h3k-tool-ui-validation.md). 아래는 역사다.
## H3J 최신 — 도구 설치 승인 UI·검증/진행/취소/재시도 (2026-10-10)

Simulation 홈 도구 설정·언어 상태 메뉴→editor-free 계획/승인 서비스→IDE 소유 MSYS2/slang installer 연결. 명시적 승인/만료 ID·프로젝트 밖 realpath 경계·captured tool home·취소/종료 정리, 사용자 지정 위치 Simulation 전달. 최종86 PASS/0 SKIP·runtime/language 타입·공식 emission/전체 upstream 타입0 errors, 실제 기존 simulation/language ready·설치0, native esJNBJ7항목 PASS. 초기 타입·native2회 실패는 보완/근거 보존. 다음 H3K는 trusted semantic/설치 UX 잔여 수용과 범위 판정→H5 discovery/폴더/multi-top→H6 자동 dump. clean Windows 실제 설치·물리/규모/기존 gate 유지; 사용자 trusted 기존 창 보존·자동 trust 금지, H3/H4/베타 완료 아님. [구현·수용·남은 범위](ide-h3j-tool-setup.md). 아래는 역사다.
## H3I 최신 — 의미 분석·모듈/포트/스코프·RTL 진단 (2026-10-10)

MIT semantic provider/Python bridge/LSP를 IDE 소유로 이식하고 내장 adapter·기존 slang 검증/재사용·신뢰 제한을 연결했다. 미저장 scope/포트·함수 인자·module tokens/정의 이동·RTL 진단, TOML 제외/설정 오류 상태 안내. 최종81 PASS/0 SKIP·runtime/language 타입 성공, 실제 slang/LSP·기존 tool probe PASS, native lEPFsB5항목 PASS(신뢰 제한+lexical). TOML parser1.9.1 보완·glob 중첩 제한; upstream glob advisory3개 경고는 열린 항목. 다음 H3J는 도구 설치 승인/진행/취소/재시도 UI와 trusted semantic GUI 수용. 물리/규모·H5 discovery·H6 자동 dump 등 유지; H3/H4/베타 완료 아님. [구현·검증·경계·인수인계](ide-h3i-semantic-editing.md). 아래는 역사다.
## H3H 최신 — 독립 IDE 내장 RTL 편집 (2026-10-10)

VSIX의 검증된 lexical 엔진·editor adapter·TextMate grammar/언어 설정/아이콘을 MIT 출처와 함께 IDE 소유로 복사했다. 내장 기능 등록/기본 예약어·시스템 함수/명시적 module·package·case·begin·always* 템플릿/Enter 연결; sibling import·외부 확장 지원 없음. 최종70 PASS/runtime·언어 타입 성공, native gj9pRi4항목 PASS(신뢰 없이 파일4종/실제 snippet cursor/완성), 기존 파형 ez5zG3 4항목 PASS. 공식 emission/전체 upstream 타입0 errors·exit0도 확인. 다음은 H3I semantic module/port/scope·RTL 진단 이식→도구 설치 승인 UI. 물리 Tab/Enter·테마와 규모 수용은 별도이며 H3/H4/베타 완료 아님. [범위·근거·인수인계](ide-h3h-lexical-editing.md). 아래는 역사다.
## H3G 최신 — 실행 이력·코드 변경 표시 (2026-10-10)

테스트별 최근100개 project history에서 이전 run을 선택해 로그/파형을 열고, 최근 실행의 saved-input 변경·비교 불가와 미저장 변경을 구분했다. 파일 변경 debounce·비교 취소/revision guard·이전 reader/default 유지. 최종54 PASS·전체 타입0 errors·native UpFkgw4항목 PASS/exit0(저장 이벤트→stale/기존파형 보존), 실제 과거 b6119f7e 선택/로그/파형 PASS. 최초 타입 API 오류와2회 초기화 시험 race는 보완·기록 보존. 원본6개 불변/retained5개 run 유지. 다음은 H3 언어 등록/highlight/snippets/lexical 편집 이식→semantic/설치 UI. H4 이력 정리/개별 과거 비교·규모/파형 잔여 수용은 남는다. 베타·배포 완료 아님. [구조·수용·실패·다음 순서](ide-h3g-history-stale.md). 아래는 역사다.

## H3F 최신 — 테스트별 신호 보기·기본값 저장 (2026-10-10)

내장 파형의 여러 보기 저장/덮어쓰기/이름 변경/삭제/default를 IDE 소유 store·Node IPC에 연결했다. 경로/순서/radix/색/bus 펼침 저장, 누락 신호 유지·다른 탭 revision 충돌 거절·.rtl 안 설정 격리. 최종53 PASS·전체 타입0 errors·native DC5Tja default bus+8bit9행/정렬/왕복 PASS, 실제 Save→기본 지정→닫기/재열기 복원 PASS. 최초 junction EPERM과QuickInput 타입1오류는 최종 검증으로 보완하고 기록 보존. 원본6개 불변/retained5개 run 유지. 다음은 history/stale·기록run 선택/열기; preset 관리 상세 물리/기존 파형 잔여 수용도 유지. H3/H4 전체·베타·배포 완료 아님. [구조·사용·수용·한계·다음 순서](ide-h3f-waveform-presets.md). 아래는 역사다.

## H3E 최신 — 파형 실제 조작·시간 이동 보완 (2026-10-10)

실제 앱에서 Go 시간 이동 미동작을 발견해 form 제출 의존을 제거하고 버튼/Enter 직접 호출로 수정했다. 실제 VCD2개 탭·bus 펼침/드래그·신호 추가/제거·확대/구간 확대/Fit·Code 왕복 상태 유지 PASS. 전체51 PASS/exit0(runtime 타입 포함), native blTGbN2항목 PASS/exit0, 새 실행의 이전 reader/bytes 보존 회귀 보강, 원본6개 해시/retained5개 run 불변. 새 profile은 untrusted이며 GUI 새 Run은 하지 않았다. 다음은 테스트별 preset/default→history/stale 연결; Ctrl/Shift 그룹 드래그·긴 시간 실제 화면·새 GUI 실행 중 이전 탭은 추가 수용으로 남는다. H3/H4 전체·베타·배포 완료 아님. [실패·수정·수용표·인수인계](ide-h3e-waveform-interaction.md). 아래는 역사다.

## H3D 최신 — 실행별 내장 VCD 파형 연결 (2026-10-10)

Simulation 결과의 파형 버튼→실행별 sandbox 파형 탭·최대4 reader·Code 왕복 보존을 연결했다. 기존 renderer/worker를 IDE 소유로 수동 이식했고 VSIX/부모 runtime/build 참조가 없다. 절대 시간 눈금·bus 펼치기 등 기존 화면 유지, 취소에 dump 안내를 붙이던 문구 보완. 최종51 PASS·전체 타입0 errors·실제 retained Verilator VCD2개 read/query PASS·native TYZYUm canvas2/정렬/왕복/동일run 재사용 PASS. 최초 srcdoc native LPhen0 FAIL은 고정 앱 리소스 URL로 보완; 실패 기록 보존·보안 정책 변경 없음. 다음은 실제 파형 interaction/닫기/이전run 보존 수용→preset/default·history/stale 연결. FST 표시·enum 소스 매핑·언어/설치 등 미완료; H3/H4 전체·베타·배포 아님. [구현·검증·실패·다음 순서](ide-h3d-waveform.md). 아래는 역사다.
## H3C 최신 — 실제 Simulation 버튼 검증 완료 (2026-10-10)

사용자가 preview 폴더를 직접 신뢰한 후 실제 GUI의 개별 Run·g++ 빌드 중 Cancel·선택 재시도·전체 순차 실행을 확인했다. 4 PASS/1 cancelled, 실행 중 Code/Simulation 왕복·선택 보존·retained 로그·새로고침 최신 결과 복구 PASS. 취소 후 해당 빌드 프로세스0, 원본 파일/해시 불변·생성물 .rtl 안·성공4회의 이전 VCD 보존 확인. 제품 코드 변경/재빌드/패키징 없음; H3B 자동43 PASS·타입0 errors는 이전 근거다. 다음은 내장 파형 이식/해당 run 열기와 취소 결과의 부정확한 dump 안내 보완, 이후 history/stale·언어/설치 흐름. H3/H4 전체·베타 완료 아님. [물리 수용·근거·남은 순서](ide-h3c-simulation-gui-validation.md). 아래는 역사다.
## H3B 최신 — Simulation 홈·앱 Node 실행 연결 (2026-10-10)

Simulation placeholder를 테스트 목록·전체/선택/개별 실행·취소·실시간 로그·최근 결과로 교체했다. IDE 자체 shared-process IPC/창별 실행 소유자를 사용하며 renderer의 직접 FS/process와 user extension 의존성이 없다. runtime/전체43 PASS·변경 emission+전체 타입0 errors, compiled Node 채널 실제 Verilator/VCD·C++ 빌드 중 취소 PASS. native untrusted 홈3·기존editor22/20 round PASS, 물리 목록/홈 확인. 현재 trusted GUI Run/Cancel은 사용자의 preview trust 직접 처리를 기다리는 열린 수용이며 권한 설정은 바꾸지 않았다. 다음은 이 UI 수용→기존 내장 파형 이식/해당 run 열기, 이후 history/stale·언어/설치 흐름이다. H2/H3/H4 전체·베타·배포 완료 아님. [구조·근거·실패·인수인계](ide-h3b-simulation-home.md). 아래는 역사다.
## H3A 최신 — Simulation 실행 기반 이식 (2026-10-10)

독립 IDE 안에 Core·Verilator·기존 도구 탐색과 공통 Node SimulationService/개발 CLI를 이식했다. 자체 runtime 타입/빌드·전체37 PASS. 실제 두 예제 VCD/FST 총4회 실행 성공; 최초 verifier의 diagram 전용 FST 제한을 보완해 같은 실물4개 재검증 PASS, 실패 근거도 보존했다. Simulation 화면은 아직 placeholder다. 다음은 Node host 연결→홈 테스트 목록/Run/Cancel/결과·로그이며 이어 파형 renderer/언어/설치 승인 흐름을 이식한다. H2 물리 resize/auxiliary 상세·host 지연/clean Windows gate를 유지하며 H2/H3 전체·베타/배포 완료가 아니다. [소유권·근거·한계·다음 순서](ide-h3a-simulation-runtime.md). 아래는 역사다.
## H2K 최신 — 좁은 화면·전환 줄 겹침 보완 (2026-10-10)

좁은 화면에서 floating 버튼이 코드/탭을 덮는 문제를 발견해40px 전용 전환 줄로 보완했다. grid cache·EditorPart 원래 입력 크기·하단 panel/분할 그룹 최소 높이를 수정했다. 최종 파일 emission+전체 타입 검사0 errors/exit0, 자동28 PASS, 기본 native RjNE0x22항목/20 round PASS/exit0:695×435 네 배치 hit target·group/home 비겹침·dirty/disk 보존. 확대 hidden 실제 클릭/type는 중간 보완 빌드에서 수용했다. 중간 FAIL/120초 timeout·일반 host10초 경고를 보존한다. 다음은 auxiliary 상세/최종 물리 배치의 지원 범위 판정 후 H3 자체 이식이다. 물리 resize/H2 전체/베타·배포 완료는 아니다. [실패·최종 근거·다음 순서](ide-h2k-narrow-layout-validation.md). 아래는 역사다.

## H2J 최신 — 소스 진입 focus 정책 보완 (2026-10-10)

소스 자동 Code 진입에서 이전 editor focus를 강제하던 경로를 보완했다. 실제 Output focus+preserveFocus 소스 열기 실패(9rO53F/exit1)를 재현했고 소스 open의 focus 정책에 맡기도록 수정했다. 최종 파일 공식 emission+전체 타입 검사0 errors/exit0, 자동28 PASS, native wI7osu/qvp82r 각각22항목 PASS/exit0: Output focus와 총40 round/80 새·동일 소스 즉시 입력 및 기존 배치/dirty/disk 회귀. H2I의 간헐 일반 입력 실패와 동일 원인 확정은 아니다. 다음은 작은 viewport/물리 navigation·auxiliary 상세 수용 후 H3 자체 이식이다. H2 전체/베타·배포 완료 아님. [실패·최종 근거·다음 순서](ide-h2j-focus-validation.md). 아래는 역사다.

## H2I 최신 — 배치 변경 navigation·보조 sidebar 복원 (2026-10-09)

Activity Bar hidden/top/bottom에서 같은 Code/Simulation 버튼을 editor의 작은 floating navigation으로 이동하고 기본 visible rail은 유지했다. 사용자 layout 설정은 변경하지 않는다. 전체 빌드0 errors/exit0(8.23분), 최종 파일 공식 emission+전체 타입 검사0 errors/exit0, 자동28 PASS, native gR12TZ/1DXgJL 각각20항목 PASS/exit0. 최초 x6yrg1 source 입력 대기 FAIL은 보존하며 원인 미확정/진단 추가 상태다. 다음은 간헐 focus·작은 viewport/물리 click·auxiliary 상세 수용 후 H3 자체 이식이다. H2 전체/베타 완료·배포 아님. [상세 근거·실패·다음 순서](ide-h2i-layout-validation.md). 아래는 역사다.

## H2H 최신 — 물리 파일/SCM 복귀·누적 수용표 (2026-10-09)

현재 private 개발 앱에서 실제 Save As로 .sv 저장/디스크 exact 확인, Simulation→SCM→같은 파일 복귀와 실제 type/dirty·disk 자동 저장 없음 PASS. 저장 dialog의 cached element 실패는 재관찰·좌표/타이핑으로 복구했다. 작은 창 border drag는 크기가 유지돼 미수용. H2 기본 공간 전환·데이터 보존 지원 흐름은 수용, 남은 H2는 작은 viewport/Activity Bar 위치·숨김과 auxiliary 세부 상태로 묶어 확인한다. 이번 제품 코드/재빌드/자동 시험 재실행 없음. [수용표·실패·한계·다음 순서](ide-h2h-acceptance-summary.md). private window1639674의 .dev/h2h-physical-probe.sv는 미저장 주석을 보존한다. 레이아웃 수용 후 H3 이식, H1 host 지연/audit·배포 전 Windows gate는 별도 추적. H2 전체/베타 완료·패키징 아님. 아래는 역사다.

## H2G 최신 — 실제 Terminal·물리 Search/Untitled 수용 (2026-10-09)

신뢰 설정 override 없는 private empty window의 실제 Terminal PID 생성·3회 공간 왕복 생존·명시 dispose 후 종료3항목 PASS/exit0(hE9zZm). 프로젝트 untrusted 제한은 유지한다. 자동28 PASS, 이번 본체 재빌드 없음. 물리 Simulation→Search→Code 및 Ctrl+N/실제 RTL 텍스트 입력 PASS. private h2f-surface 창의 Untitled-1은 미저장 상태로 보존했다. Alt+Space 시도 뒤 다른 앱 전면 screenshot으로 UI 입력 중단; 작은 viewport는 미완료다. [근거·범위·다음 순서](ide-h2g-terminal-ui-validation.md). 다음은 창 재선택/관찰·작은 창/Activity Bar·SCM/파일 소스/보조 sidebar 잔여 수용과 H2 범위 판정 후 H3 이식이다. H2 전체/베타 완료·패키징 아님. 아래는 역사다.

## H2F 최신 — 내장 기능 유지·실제 Explorer 복귀 수용 (2026-10-09)

내장 기능까지 끄던 start의 --disable-extensions를 제거하고 RTL 사용자 profile 확장 scan을 filesystem 접근 전에 제외했다. 내장 언어/Git 검색·개발 시험 및 Code-OSS 경로는 유지한다. 본체0 errors/exit0(1.97분)·자동28 PASS·compiled host10 PASS·native t30mLT15항목/exit0. 새 private h2f-surface 창의 안내 없음·Simulation 실제 클릭→Explorer 클릭→Code/Explorer visible 복귀 PASS. 일반 host 약3.8초 unresponsive→responsive 재발은 보존하며 해결 아님. 작은 창 resize는 적용되지 않아 미완료, 물리 source/Search/SCM·Terminal PID·Activity Bar/보조 sidebar 세부 수용은 남는다. [근거·범위·다음 순서](ide-h2f-builtin-validation.md). H2 전체/베타 완료·패키징 아님. 아래는 역사다.

## H2E 최신 — 동일 소스 재진입 보완·보조 sidebar/Untitled 수용 (2026-10-09)

동일 active source 재열기 때 Simulation이 유지되는 결함을 aI5xpl FAIL/exit1로 재현하고 main onWillOpenEditor의 Code 복귀를 추가했다. 본체0 errors/exit0(3.72분)·자동27 PASS·최종 native 42e2Yu 15항목 PASS/exit0: 같은 source·보조 sidebar2회·새 Untitled/type와 기존 탭/dirty/Output 회귀. 첫 수정 후 xXiWXX의 Untitled LF/CRLF 비교 실패는 시험 정규화 후 통과했으며 실패를 보존한다. [근거·실패·한계·다음 순서](ide-h2e-reentry-validation.md). 다음은 현재 빌드의 물리 도구/source/focus·작은 창/Activity Bar, Terminal PID 및 start 확장 비활성화 안내 정책 정리 후 H3 이식이다. 보조 sidebar 세부 복원/H2 전체/베타 완료·패키징 아님. 아래는 역사다.

## H2D 최신 — 소스 진입/focus 보완·Output 내용 수용 (2026-10-09)

Simulation에서 새 소스를 열어도 홈 뒤에 숨는 결함을 1BvAte FAIL/exit1로 재현하고 active editor 변경 시 Code 복귀로 보완했다. 본체0 errors/exit0(2.2분)·자동27 PASS·최종 native SF5i6k 12항목 PASS/exit0: 새 문서 type 입력/dirty·disk 원본과 기존 탭/스크롤/Explorer/panel 회귀, 실제 output TextDocument의 기존·Simulation 추가 줄 보존. [근거·실패·제한·다음 순서](ide-h2d-source-output-validation.md). Output 내용 검증은 이번 통과, trusted Terminal PID/물리 도구·소스 진입/auxiliary·작은 창과 이미 active 파일 재진입 등은 남는다. 일반 start 확장 비활성화 안내 정리 후 H3 이식 순서다. H2 전체/베타 완료·패키징 아님. 아래는 역사다.

## H2C 최신 — Explorer 복귀 결함 보완·공통 panel toggle 수용 (2026-10-09)

Code sidebar hidden→Simulation→Explorer에서 sidebar가 다시 숨겨지는 결함을 실제 ciyf17 FAIL/exit1로 재현하고, 새 도구 열기 요청의 visible 상태를 보존하도록 own contribution을 보완했다. 본체0 errors/exit0(1.97분), 자동27 PASS, 최종 native qNTR2a 10항목 PASS/exit0: Explorer visible 복귀·공통 panel hidden 유지/Simulation에서 열기/Code 복귀 보존과 기존 두 group/세 tab·dirty/disk·선택/스크롤3회 왕복. [실패·근거·미검증·다음 순서](ide-h2c-sidebar-validation.md). 다음은 실제 도구 진입/focus·auxiliary/작은 창과 Output 내용/Terminal PID, 일반 개발 확장 비활성화 안내 정리 후 H3 이식이다. 이번 새 경로의 물리 클릭/Terminal 수용·H2 전체/베타 완료는 아니며 패키징 없음. 아래는 역사다.

## H2B 최신 — 여러 탭·분할 편집·스크롤 및 실제 화면 수용 (2026-10-09)

두 그룹/세 탭·선택/커서·viewport·활성 문서·미저장/disk·sidebar·Output panel visibility를 세 번 왕복해 최종 native eAXZc9 PASS/8항목/exit0. Output 비동기 표시 전 기준값을 읽던 첫 추가 시험 FAIL은 대기 기준 보완으로 최종 통과했으며 기록을 보존했다. 독립 IDE 자동27 PASS. private 일반 개발 화면의 Simulation 클릭→홈→Tab focus→Enter Code 물리 왕복도 PASS. 이번 제품 코드/재빌드 없음. Terminal PID/Output 내용·작은 창·sidebar 도구 진입은 아직 미완료이고 --disable-extensions 안내가 남는다. [근거·실패·제한·다음 순서](ide-h2b-state-validation.md). 다음은 H2 sidebar 초기 숨김/도구 진입·focus/공통 panel 잔여 수용과 개발 안내 정리 후 H3 기능 이식이다. H2 전체/베타 완료가 아니며 패키징 없음. 아래는 역사다.

## H2A 최신 — Code/Simulation 첫 화면·상태 보존 (2026-10-09)

RTL 제품 전용 왼쪽 Code/Simulation 버튼과 중앙 홈을 구현했다. Simulation은 사이드 영역을 숨기고 기존 Code editor/model은 유지하며 공통 panel은 변경하지 않는다. ide 자체 owned source overlay를 guarded 배치하고 upstream import/layout을 패치한다. 자동27 PASS·본체0 errors/exit0(2.33분)·compiled 설치5/host8/언어6 PASS. 최종 native LvDXtQ의 기존7항목+3회 공간 왕복 PASS/exit0: 미저장 text/dirty·disk 원본·커서·document·sidebar 복원·panel visibility 유지. 첫 Terminal 생성은 trust dialog 대기로 timeout/exit1; 신뢰를 변경하지 않고 최종 시험에 미수행을 기록했다. physical 화면은 Computer Use 접근 승인 timeout으로 미완료, h2a-surface private 창은 열려 있다. [실패·근거·한계·다음 순서](ide-h2a-validation.md)를 따른다. 다음은 실제 버튼/홈·키보드/작은 창 확인, H2B 여러 탭/group/스크롤·Output 내용/기존 Terminal 유지 수용이다. 실행/파형은 H3/H4 미연결이며 H2 전체/베타 완료가 아니다. 아래는 역사다.

## H1 최신 — 검증 소속·단계 측정 보완, H2A 진입 준비 (2026-10-09)

시험 entry를 private extension 내부로 옮겨 API attribution 경고를 제거하고 UTC/단계별 시간을 기록한다. stdout뿐 아니라 exthost.log도 검사하며 과거 경고 재검출/새3회 무경고를 확인했다. 자동25 PASS, native3/3 편집·감지/시작 PASS·exit0, 정상 preLaunch/batch7항목 PASS·exit0. 제품 본체 변경/재빌드/배포 없음. [기반 수용·잔여 항목·H2A 순서](ide-h1-baseline-acceptance.md)에 표로 정리했다. 개발 기반을 사용해 다음은 Code/Simulation 진입·중앙 홈/Code 모델 보존·공통 panel 유지 H2A를 구현한다. 이전 간헐 지연 원인·잔여 UI/설정/명령·audit·배포 전 검증은 계속 열려 있으며 H1 전체/안정 베타 완료가 아니다. H2A는 아직 미구현이다. 아래는 역사다.

## H1 최신 — 임시 앱 아이콘·안전한 개발 실행 사본 (2026-10-09)

원본 임시 칩 SVG/멀티 해상도 ICO와 fingerprint별 개발 exe/metadata·SHA256 receipt를 구현했다. 기존 원본/실행 중 앱을 보존하며 cache 존재 시에도 Electron 버전/무결성을 검사한다. 최종 자동24 PASS, Windows 실제 exe의 아이콘/제품 정보 추출 확인·native 반복3/3(편집/감지/시작) PASS/exit0, 실제 CLI 설치 차단 PASS, 정상 preLaunch/batch 편집7항목 PASS/exit0. 직접 --version batch probe는 예상과 달리 홈 프로필을 생성해 이번 트리만 종료했으며 파일은 보존했다. 세 격리 flag 누락을 준비 전에 차단하도록 보완하고 거부/최종 batch 재수용까지 확인했다. 실패·홈 경로·근거는 [개발 앱 검증](ide-branding-validation.md)에 기록한다. 본체 source 수정/재컴파일·배포 없음. 이전 간헐 지연 원인은 미확정이며 fixture API attribution/단계별 시간 분석과 잔여 UI surface 판정 후 H2 공간으로 진행한다. H1 전체/H2/RTL 이식/베타 완료가 아니다. 아래는 역사다.

## H1 최신 — 저장 후 언어 추측 오류 보완 (2026-10-09)

이전 physical 저장 성공 뒤 content 언어 감지 worker의 require 오류/누락 regex module을 전체 로그에서 추가 발견했다. RTL 제품은 파일명 association과 사용자 언어 선택을 기준으로 하고 content-model worker/history 조회를 사용하지 않도록 보완했다. upstream 경로는 보존한다. 자동21 PASS·본체0 errors/exit0(5.72분)·compiled 언어6/host8/설치5 PASS. 실제 .sv/JSON 감지·편집/저장 native3/3 PASS·각 앱 exit0/감지 오류 재발 없음. 첫 앱의 일시 무응답/복구 때문에 startup gate=false·반복 wrapper exit1이며 이를 숨기지 않는다. 본체 재빌드/실앱 결과는 [최신 검증 기록](ide-language-detection-validation.md)을 따른다. H1 전체/H2/RTL 이식 완료가 아니며 일반 host 지연·아이콘/runtime metadata·잔여 surface 판정이 남는다. 아래 이전 기록은 당시 결과다.
## H1 최신 — 반복 native3회·실제 문서 입력/저장 수용 (2026-10-09)

새 profile native 편집/시작 반복3/3 PASS·wrapper exit0, 준비~종료 전체14968/16005/16303ms(순수 시작 성능 아님). 일반 개발 별도 창에서 Ctrl+N→실제 RTL 텍스트 입력→Save As→한글/공백 .sv 경로 저장→디스크 exact 일치·미저장 표시 해제까지 physical PASS. 일반 모드에는 짧은 unresponsive→responsive가 다시 있어 완전한 기동 안정성은 아니다. Agents start/기본 inspector/자동 profiling/10초 경고는 이번 일반 로그에도 없었다. 자동20/compiled8·설치5·본체2.68분 결과는 직전 변경 결과 유지; 이번 제품 수정/재빌드/VSIX·배포 없음. [근거·프로필/fixture·제한](ide-repeat-physical-validation.md). H1 전체/H2/베타 완료가 아니다. 다음: 일반 host eager 활성화/지연 분석, 아이콘/runtime metadata 및 잔여 product surface 범위 판정 → H1 마무리 → H2 공간. physical-editor-acceptance 창은 저장된 private 파일을 연 상태이며 기존 사용자 창은 건드리지 않았다. 아래 기록은 역사다.
## H1 최신 — 기본 inspector/자동 profiling 제외·실제 편집 수용 (2026-10-09)

RTL 기본 extension inspector/자동 ExtensionsAutoProfiler 등록을 제외하고 명시 inspect/inspect-brk와 응답 경고는 유지했다. 자동20 PASS/0 FAIL/0 SKIP·본체0 errors/exit0(2.68분), compiled host8 PASS·설치5 PASS. 실제 자체 native 테스트 호스트의 한글·공백 폴더/파일 열기·active editor·dirty 상태/저장 전 원본 유지·저장/재열기·Output API와 source 외 생성물 없음5항목 PASS. 첫 manifest 버전 경고를 보완한 최종 editor-acceptance-jWcTwP receipt/host/wrapper exit0. 마지막 기동에 Agents 시작·기본 debugger·자동 profiling·10초 경고/무응답 없음. 그러나 첫 editor-acceptance-mQxR4P에서10초 경고/일시 무응답이 재현되어 반복 시작 안정성은 열린 게이트다. API 수용과 physical UI/신뢰/공간 왕복은 구분한다. H1 전체/H2/베타 완료가 아니다. 다음: 반복 기동/일시 host 지연·기본 UI 입력과 아이콘/runtime·잔여 등록 범위 판정 → H1 마무리 → H2 Code/Simulation 공간. [검증·초기 실패·제한](ide-startup-editor-validation.md). 아래 기록은 역사다.
## H1 최신 — 개발 시험 built-in·Agent runtime 보완 (2026-10-09)

이전 최종 앱 전체 로그에서 agent host started/연결을 실제 발견했다. contribution14곳 제외는 프로세스 시작 차단이 아니었다. 별도 enablement observable을 RTL에서 false로 하고 서비스 쪽 prewarm 등록도 제외했다. scanner에서 개발 시험 built-in3개를 제외하며 Git/언어 기능은 보존한다. 자동18 PASS/0 FAIL/0 SKIP. 본체 재빌드0 errors/exit0(5.03분), 실제 compiled scanner/enablement4 PASS·설치5 PASS. 별도 앱에서 Hello World/Chat/Extensions 없음과 이번 시작 로그의 Agents 시작·10초 경고 없음 확인. host 일시 unresponsive→responsive는 남는다. 실제 근거/재실행 제한은 [host 정책 기록](ide-host-policy-validation.md)을 따른다. 이전 native 화면 Chat/Extensions 없음·Output/Terminal·Untitled 생성은 유지하지만 시작 경고는 이번 단일 실행에서 재현되지 않았으며 성능/반복 기동 게이트 완료는 아니다. 파일/저장/폴더·아이콘·잔여 등록도 남아 H1 전체/H2/베타 완료가 아니다. 다음: 빌드 → compiled 정책 → 별도 실제 앱 host/시험 contribution 확인 → 기본 편집 수용 → H1 판정 → H2. 아래 기록은 역사다.
## H1 최신 — 기본 화면 정리·실제 CLI/패널 수용 (2026-10-09)

Extensions 기본 view/열기·설치/추천 action과 local/remote Agents contribution14곳을 RTL 제품에서 제외했다. 실제 화면에서 남은 Chat panel을 발견해 view when/default container/열기 명령을 보완했다. 최종 자동15 PASS/0 FAIL/0 SKIP, 추가 본체 빌드0 errors/exit0(3.45분), compiled native 설치5곳 PASS. 실제 CLI의 한글·공백 inert fixture 설치는 정책 오류 exit1/설치 없음/receipt PASS. 별도 프로필 실제 화면에서 Chat/Extensions 없음·Output/Terminal 표시·새 Untitled 생성 확인. 기존 파일 열기는 신뢰 확인에서 취소했으며 편집/저장은 미완료다. 사용자 입력 감지 후 추가 UI 입력을 중단했다. 개발용 Hello World/self-host 시험 항목·extension host10초 경고는 남는다. H1 전체/H2/RTL 베타 완료가 아니다. 다음 순서: 개발 시험 built-in/host 시작 원인 정리 → 파일/저장/폴더 수용 및 남은 등록·아이콘 범위 점검 → H1 판정 → H2 Code/Simulation 공간. 기존 개발/검증 창은 열려 있으며 임의로 닫지 않는다. 상세 실패/근거/제한은 [화면 수용 기록](ide-surface-validation.md)을 따른다. 아래 이전 문구는 역사적 기록이다.
## H1 최신 — 제품 정책 보완·재빌드/실서비스 통과 (2026-10-09)

임시 RTL IDE identity·분리된 개발 프로필과 Chat hidden 정책, native 확장 설치 entry 5곳의 선행 거부를 적용했다. 다중 patch 덮어쓰기를 보완한 재빌드0 errors/exit0(5.77분), 최종 자동13 PASS, 실제 compiled service5 PASS/exit0. 초기 안내 eager import의 필수 Chat 설정으로 시작 실패를 발견해 호환 데이터만 유지하고 재실행했다. 복구 로그에 초기 assert 재발 없음·격리 shared storage를 확인했으나 물리 화면 수용은 Computer Use 앱 승인 대기 시간 초과로 미완료다. Chat/Agents 코드 완전 제거·Extensions UI/CLI 전체 수용·전용 아이콘·편집/저장/패널은 남은 H1이다. 다음은 이 잔여 수용 후 H2 공간 구현. [상세 결과·한계](ide-product-policy-validation.md).
## H1 후속 — 임시 제품 identity·Chat/확장 설치 정책 (2026-10-09)

RTL IDE 임시 이름/설정·ID overlay와 Chat hidden 정책, native VSIX/location/profile 및 공통 gallery/install task 선행 거부를 구현했다. 다중 patch 덮어쓰기 문제를 실제 compiled probe에서 발견해 파일별 누적 적용으로 보완했다. 자동13 PASS. 초기 전체 빌드 exit0은 누락 guard가 있던 상태라 정책 완료 근거가 아니다. 보완 후 공개 compile-client 작업 재빌드 진행 중. 자세한 실패/근거/남은 UI·CLI·H1 수용은 [정책 검증](ide-product-policy-validation.md)을 따른다. H1 전체/H2/베타 완료가 아니다. 기존 개발 창/VSIX/배포물은 임의 변경하지 않는다.
## H1 최신 — 개발 앱 실행 확인 (2026-10-09)

도구/의존성 설치·컴파일 exit0·IDE8 PASS에 이어 실제 Code - OSS Dev 창과 재실행을 확인했다. 첫 실행의 홈 shared storage 생성을 발견해 --shared-data-dir로 ide/.dev/shared에 격리했고 로그로 재확인했다. 최초 홈 파일은 삭제하지 않았다. 재실행 앱은 열려 있으며 마지막 Output 조작은 사용자 입력 감지로 실행되지 않았다. 추가 UI 입력은 중단했다. H1 identity/기능 진입 정리와 실제 폴더·입력/저장·Terminal/Output 수용은 남아 있다. 다음은 이 H1 잔여 작업 후 H2 Code/Simulation 공간이다. H1 전체/베타 완료로 판정하지 않는다. [상세 결과](ide-h1-validation.md).
## H1 재개 — 실제 의존성·컴파일 성공 (2026-10-09)

승인된 MSVC/Python 준비·doctor exit0, 고정 Code-OSS 의존성/native 설치 exit0, compile-client 본체/확장 0 errors·exit0(8.42분), IDE 자동 테스트8 PASS/0 FAIL/0 SKIP. 개발 앱 시작은 진행 중이며 실제 화면 수용은 아직 완료하지 않았다. built-in control 설정의 사용자 홈 접근을 발견해 ide 내부로 한정하는 tracked patch와 반복 적용/변경 기준선 차단 시험을 추가했다. root npm audit37건(critical2/high14 포함)은 제품 영향·완화 검토가 남았으며 lock 자동 변경은 하지 않았다. H1 전체 완료·H2~H7 이식·배포 완료가 아니다. 다음은 실제 개발 앱 폴더/편집/패널 수용 및 앱 identity/기능 진입 정리다. [상세 근거](ide-h1-validation.md).
## H1 도구 설치 완료·의존성 빌드 진행 (2026-10-09)

사용자가 MSVC/Python 설치를 명시적으로 승인했다. VS2022 Build Tools17.14.37710.0 관리자 권한 재시도 exit0, Python3.14.8 embedded 공식 SHA256·실행 확인, doctor 전체 exit0. 최초 Python MSI exit3/Build Tools UAC exit1602는 보존한다. Code-OSS 자체 Git metadata/HEAD 경계를 구성해 upstream 설치의 git config가 상위 repo로 향하지 않게 했다. IDE 테스트6 PASS. 고정 의존성 설치는 진행 중이며 compile/앱 실행은 아직 미완료. 사용자 설치 승인을 다시 요청하지 않는다. [H1 기록](ide-h1-validation.md).

## 독립 IDE H1 구현 시작 (2026-10-09)

Code-OSS1.141.0/revision2a59476c9bfcb90b3ddc372c36762471b7dfad1c를 고정해 ide/upstream에 준비했다. ide 자체 환경 검사·bootstrap·install/compile/start wrapper, 기준 lock/hash와 테스트를 구현했다. 최종IDE4 PASS/Node syntax check exit0. 실제 doctor는 Node/source PASS, Python/MSVC MISSING으로 exit1; build tools 설치 승인을 요청했고 아직 설치/compile/앱 실행 없음. [H1 결과·남은 gate](ide-h1-validation.md). H1 진행 중이며 다음은 사용자 설치 답변에 따른 도구 준비/실제 빌드다. H2~H7/배포/엔진 미착수, VSIX 수정 없음.

## 독립 IDE 계획 점검 완료 (2026-10-09)

[구현 계획](ide-implementation-plan.md)에 H1 기반→H2 공간→H3 기능 이식/진단→H4 Simulation 홈→H5 자동 프로젝트/여러 top→H6 미저장·자동 파형→H7 종료/복원/내부 수용 순서와 완료 기준·요구 추적표를 작성했다. 현재 결정 기록과 대조했고, 여러 top 선택 방식의 옛 제안은 개별 테스트 정책으로 대체한다. 파형 옆 소스·Search/Git 배치·TOML 충돌·자동 trace 상세는 미결로 유지한다. ide는 준비 상태이며 다음은 H1 공식 기준선/빌드 환경 조사다. 이번은 문서만 변경, 새 코드/checkout/설치/테스트/빌드/패키징 없음. 기존 VSIX227 PASS를 IDE 완료 근거로 사용하지 않는다.

## 분리 후 검증 (2026-10-09)

vsix cwd 타입 검사·개발 build exit0, 전체227 PASS/0 FAIL/0 SKIP. 로컬 npm 연결 경계와 기존0.3.1 배포물 SHA 일치 확인. IDE는 독립 준비 상태로 앱 구현/빌드 없음. 새 패키징/설치·이동 후 물리 UI/native simulation 종단은 수행하지 않았다. [구조·검증 기록](project-layout.md).

## 최신 H0 정리 — 기술 제안·현재 TOML/진단 확인·미결 사항 (2026-10-08)

[H0 결정 기록](h0-product-decisions.md)에 사용자 확정 사항과 기술/엔진 제안을 구분했다. TOML은 생성 템플릿/읽기·glob 검색이 현재 기능이며 분류 기반 자동 관리·새 TB 등록은 미구현이다. RTL 분석 예외를 TOML 첫 줄에 게시하는 catch 경로를 코드에서 확인했으며 사용자 오류 원인 확정이나 수정 완료는 아니다. 다음은 가져오기/실행/파형 화면 흐름과 자동 설정/수동 override 정책 논의다. 엔진 시점·방식은 권장 순서만 있고 별도 합의 전 착수하지 않는다. 문서만 변경/코드 읽기 확인, 새 테스트·빌드·패키징 없음.

## 최신 이정표 — E4 지원 범위 내 완료·H0 논의 준비 (2026-10-08)

recorded native run-kH0Z78 실제 source 왕복 focus/Tab·clock35→45ns PASS/receipt/exit0. 누적 E4 기준을 [종합 수용표](e4-acceptance-summary.md)로 대조해 read-only 지원 부분집합·현재 Windows 개발 환경에서 완료 판정했다. 전체227 PASS/타입·개발 build 근거 유지, 이번 제품 코드 변경·전체 재실행 없음. generate/array 내부 연산·연속 hierarchy zoom/live 디버깅·전체 접근성/여러기기 성능은 후속 범위, 깨끗한 Windows 설치 gate는 계속 열려 있다. 다음은 [H0 준비 자료](h0-discussion-brief.md)로 사용자와 독립 IDE 아이디어/범위를 합의하는 것이다. 독립 앱·엔진 구현/Code-OSS fork·패키징/설치는 시작하지 않았다. 아래 과거 E4 진행/다음 검증 기록보다 이 판정을 우선한다.

## 최신 E4 — 선택기·소스 왕복 실제 수용과 포커스 복구 (2026-10-08)

run-U8ruBs에서100% offscreen Tab→pe00/Enter, Display Down/Enter Connections·Detailed, keyboard definition→source→diagram을 실제 확인하고 focus 유실을 발견했다. context별32개 control identity를 보관하는 독립 webview helper로 보완, run-hjw5s7 source 왕복 후 Open definition focus→Tab Display 복구 PASS/receipt/exit0. private 미저장 편집의 stale 안내/graph 유지/source·selector 비활성화 및 Undo clean 확인. 관련18/전체227 PASS/0 FAIL/0 SKIP·타입/개발 build 성공. [방법·발견·근거·제한](structure-keyboard-roundtrip-acceptance.md). 다음은 누적 E4 완료 기준/검증표 종합·recorded focus 회귀 확인 후 완료 범위 판정이다. 임의 scroll 복원/전체 screen reader 수용은 하지 않았고 E4 완료·독립 IDE 착수·패키징/설치 없음.

## 최신 E4 — 화면 밖 모듈 포커스 보완·카메라 반복 측정 (2026-10-08)

keyboard focusin으로 화면 밖 module을 보이게 pan하고 확대 비율을 유지하도록 보완했다. disabled/큰 module/이미 보이는 bounds 단위6 PASS. 실제4×4 browser-only host run-4Bm8OR에서 offscreen 마지막 MAC focus/100% 유지·viewport 안 bounds·SVG keyboard PASS/receipt/exit0. camera3구간×3회×120frames에서 median16.7/p95 16.8ms, handler p95 0.8~1.1ms/layout p95 3.2~3.4ms, 50ms 초과0. 이전 부하와 차이가 있어 개선 원인/FPS 보장으로 표현하지 않는다. 전체225 PASS/0 FAIL/0 SKIP·타입/개발 build 성공. [방법·근거·한계](structure-focus-performance-acceptance.md). 다음은 selector/source 왕복·stale와 offscreen 실제 Tab 수용이다. E4 전체 완료·독립 IDE/엔진 착수·패키징/설치 없음.

## 최신 E4 — browser 프레임·canvas/Hierarchy 키보드 수용 (2026-10-08)

실제4×4 host run-fx3XHC에서 Fit→Tab canvas→Tab pe00→Enter 내부 진입 및 Hierarchy Down→Enter pe01 이동 확인, native receipt/PASS/exit0. 별도 실제 Chromium product HTML probe의 SVG focus·Enter/Space·camera zoom/Fit assert PASS.2170 SVG elements/120frame idle median16.7/p95 16.8ms, 합성 camera+강제 layout median33.4/p95 50.1ms(50ms 초과18회). RAF opportunity·부하 시험이며 실제 pointer/pixel FPS 게이트 완료가 아니다. [방법·로그·한계](structure-browser-keyboard-acceptance.md). 타입/개발 build 성공; 제품 수정 없이 시험 확장. 다음은 selector/source 왕복·stale/화면 밖 focus 키보드, camera 비용 분해·반복 측정. E4 완료·패키징/설치·독립 IDE 착수 없음.

## 최신 E4 — 분석 닫기·프로세스 트리 정리와 실제 Cancel (2026-10-08)

native run-NwNO9r에서 hierarchy/scopeOperations/internalOperations 분석 중 tab API 닫기 → Python 부모/자식 종료(466/429/460ms)·늦은 panel 재열기 차단·실제 slang 재시도 PASS/receipt/exit0. 별도 run-LO9ODL은 실제 progress Cancel 클릭 → cancelled 안내/프로세스 종료 → 실제 Schematic 복구 PASS/receipt/exit0. physical 관찰용 timeout만300초로 연장한 시험이며 제품15초 측정이 아니다. [방법·초기 실패·근거·한계](structure-analysis-cancel-acceptance.md). 관련19 PASS/타입 검사·개발 build 성공; 제품 코드 변경 없이 harness/runner 확장, 전체224는 직전 결과 유지. 다음은 전체 keyboard/focus(계층·SVG·선택기·source 왕복), diagram browser frame/layout 성능이다. E4 완료·독립 IDE/엔진 착수·패키징/설치 없음.

## 최신 E4 — 실제 progress Cancel·키보드 부분 수용 (2026-10-08)

격리 host run-QfsfM5에서 화면 Cancel 클릭 → 보류 요청 전 caller 종료/35ns 유지 → 늦은 native page 차단 → 실제 retry45ns PASS/고유 receipt/exit0. 시간 입력 Tab→Go, Shift+Tab 복귀, 35ns 입력+Enter→Values35ns를 실제 화면 확인했다. 관찰 도구 지연으로 physical 시험에서만 deadline을300초로 연장했으며 elapsed24563ms는 클릭 latency/제품15초 timeout 결과가 아니다. 초기 실패3건과 방법·한계는 [수용 기록](structure-physical-cancel-acceptance.md)에 남겼다. 제품 소스 수정 없음, 타입 검사/개발 build 성공. 전체224 회귀는 직전 제품 변경 결과를 유지하며 이번 재실행 없음. 다음은 semantic/module 분석 취소·닫기/복구, 전체 keyboard/focus와 diagram browser frame/layout 성능이다. E4 완료·독립 IDE 착수·패키징/설치 없음.

## 최신 E4 — 클럭 취소·timeout·복구와 reader 회수 (2026-10-08)

worker page 대기 중에도 clock cancel/닫기/15초 timer가 caller를 종료하도록 abort race와 listener cleanup을 보완했다. 실제 native worker dispatch hold host run-MI2irN은 cancel31ms/close101ms/timeout15038ms·늦은 cursor publication 차단·실제 worker retry·닫기/Update 복구 PASS/receipt/exit0.4096신호 lifecycle8회 worker16/16종료·원본hash/peer유지·provisional RSS plateau PASS. 관련13/전체224 PASS·타입/개발 build exit0. [방법·근거·한계](structure-cancel-recovery-acceptance.md). 다음은 physical progress Cancel/analysis 닫기·취소, 실제 keyboard tab-order/focus와 diagram browser frame/layout 성능이다. 인위적 dispatch hold/프로그램 cancel·reader memory 측정이며 physical Cancel/전체키보드/browser성능 수용과 E4 완료를 주장하지 않는다. 패키징/설치·사용자 소스 수정 없음.

## 최신 E4B — 기록 디버깅 왕복·닫기/재연결 (2026-10-08)

Windows 파형 command가 D:/d: 경로 차이로 열린 reader를 못 찾는 오류를 실제 host에서 발견하고 OS별 경로 비교를 보완했다. 최종 native run-aEBmL5는 Schematic3종/117값/양방향 cursor·wave 닫기/재열기·diagram 닫기/Update 재연결·clock 앞뒤 수용 PASS/receipt/exit0. 실제 UI run-9osJbW는35→45→35ns edge, linked wave35ns, 파형 Go45ns+Enter→diagram45ns, 기록 definition 열기를 확인했다. 전체224 PASS/0 FAIL/0 SKIP·타입/개발 build exit0. [실패·수정·근거·제한](recorded-debug-roundtrip-acceptance.md). 다음은 긴 작업 취소/timeout/닫기·복구, keyboard tab-order/focus, browser/frame/memory 성능·규모다. E4 전체 완료나 이번 취소/성능 시험을 주장하지 않는다. retained run을 재사용했고 새 simulation/패키징/설치·사용자 소스 수정 없음.

## 최신 수용 — 실제4×4 화면 조작·소스 왕복 (2026-10-08)

격리 실제 host run-inrwoa에서16MAC/26boundary ports·배선 completeness를 확인하고 Fit21%/100%/pan·scroll21→31%·pe00 double-click/leaf ×·MUX·Register·clock/state 배선·keyboard0 Fit40%·hierarchy 부모 복귀·Open definition→소스 line1→diagram 탭 camera31% 보존→Fit을 물리 확인했다. receipt passed=true/로그 PASS/host exit0·타입/개발 build exit0. [근거·fixture 옵션·제한](schematic-4x4-ui-acceptance.md). Fit 라벨이 작음·공통 제어선/상수 변환 밀집·source 왕복 page scroll 초기화는 남은 UX 제한이다. 아키텍처4×4 자동 배치/실제 frame 성능·전체E4 완료를 주장하지 않는다. 다음은 기록 simulation의 source/diagram/wave/clock 왕복·값/keyboard/focus·취소/닫기/복구/성능(E4B)이며 가독성 개선 후보를 기록했다. 이번 제품 수정 없이 physical harness만 확장했고 패키징/설치 없음.

## 최신 재개 — 구조 시험 복구·4×4 graph 검증 (2026-10-08)

사용자 재개 요청으로 작업을 이어갔다. closed-editor 실패를 단독 host에서 재현하고 시험의 오래된 TextEditor 참조를 현재 editor로 재획득하도록 보완했다. 미저장 문서 보존·structure refresh/parent fallback 및 최신 편집/semantic/포트/색상과 통합 native host run-cgbxeo receipt/exit0를 확인했다. 전체 최상위 회귀224 PASS/0 FAIL/0 SKIP·타입/개발 build exit0. 별도 실제 slang4×4 시험은16MAC·142nodes/100edges·26boundary ports·누락 배선0, 분석약1.25s/SVG약76ms PASS. [재현·보완·검증 근거·제한](schematic-scale-acceptance.md). 다음은 실제4×4 화면 가독성/pan/zoom/Fit/leaf 진입, 이어 E4B 왕복/keyboard/focus/취소·복구·성능이다. 실제 browser 성능/물리 화면 수용과 E4 전체 완료를 주장하지 않는다. 패키징/설치·사용자 소스 수정 없음. 아래 과거 중단 기록은 이 사용자 재개 요청으로 해제되었다.

## 현재 작업 중단·재개 기준 (2026-10-08)

사용자 요청으로 진행사항을 기록하고 다음 요청까지 작업을 멈춘다. 최신 편집 개선은 관련 시험/실제 host 수용까지 완료했으며 E4 diagram/기록 디버깅은 미완료다. 재개 첫 작업은 closed-editor 구조 시험 오류 재현/보완, 이후 4×4/조밀한 구조·source/diagram/wave/clock 왕복·취소/복구/성능 검증이다. [완료 항목·검증 근거·제한·다음 실행 순서](checkpoint-2026-10-08.md)를 이어받기 기준으로 사용한다. 새 패키징/설치 및 독립 IDE/엔진 착수 없음.

## 최신 편집 개선 — predefined 이름·전처리 지시어 추천 (2026-10-08)

`initial` 예약어와 `$display`/`$monitor` 등의 기존 시스템 태스크/함수 추천을 유지하고 백틱으로 시작하는 compiler directive 추천을 추가했다. `timescale`, `include`, `define`/`undef`, `ifdef`/`ifndef`/`elsif`/`else`/`endif`, `default_nettype`, `resetall`, `celldefine`/`endcelldefine`, `unconnected_drive`/`nounconnected_drive`, `begin_keywords`/`end_keywords`, `line`을 지원한다(삽입 시 백틱 포함). `$`/백틱 trigger와 전체 prefix 교체로 기호 중복을 방지한다. 지시어 이름은 들여쓴 행 시작에서 제공하며 주석/문자열·매크로 본문/지시어 인자에서 억제한다. 사용자 매크로/모든 표준 predefined 이름의 exhaustive 지원은 이번 범위가 아니다. slang 설치 없이 기본 추천이 동작하며 기존 scope/module/port 추천 경로는 유지한다.

검증: language13 PASS/0 FAIL, 타입 검사·개발 build exit0. native 격리 host `run-XmdKef`에서 `initial`/`$display`/`$monitor`/`timescale` 추천 및 prefix 교체 범위/삽입 문자열, 기존 편집·VCD custom editor 시험 PASS, `.rtl/extension-test.json` passed=true/exit0. 로그 `.dev/predefined-editor-verified.log`. release 패키징/설치 없음. 개발 확장 재실행으로 반영. 전체 회귀를 다시 실행한 것은 아니며 E4 다음 실행 및 기존 closed-editor 시험 점검은 유지한다.

## 최신 편집 개선 — 프로젝트 모듈 추천·범위별 신호 추천·모듈 색상 (2026-10-08)

프로젝트 공통 source/include와 현재 test의 컴파일에 있는 slang definition을 일반 이름 추천에 추가했다. `alu` 같은 미사용/미저장 모듈 이름도 추천하며 선언 이름 충돌은 임의 선택하지 않는다. 기존 slang scope lookup으로 wire/reg/logic·포트·현재 함수/블록과 module 신호, import된 package 멤버 또는 `pkg::` 멤버를 추천한다. 다른 모듈 내부·형제 함수/블록 신호는 섞지 않으며 다른 testbench 컴파일은 기존처럼 격리한다. 연결식에서는 모듈 후보를 제외한다. `.포트`는 기존 우선 경로로 실제 대상 모듈의 아직 연결 안 된 포트를 유지한다.

VS Code 독립 semantic helper가 compiler-confirmed declaration/instance type 위치에만 class 의미 토큰을 생성하고 LSP에서 전달한다. 표준 theme type 색상/언어별 fallback scope를 사용하며 변수의 같은 이름·주석·문자열은 색칠하지 않는다. 색상은 theme와 사용자 semantic highlighting 설정을 따른다. 전체 신호 reference semantic coloring은 이번 범위가 아니다. 분석 도구·manifest source 등록이 필요하며 폴더 모든 파일을 임의 검색하는 방식은 아니다.

검증: geometry 아닌 관련 semantic helper/query10 PASS, 실제 slang completion/분석10 PASS/0 FAIL/0 SKIP, 타입 검사 및 개발 build exit0. native 격리 host `run-QIa4EO`에서 module 추천·wire/reg/logic kind·declaration/instance semantic token·미저장 scope/package·기존 bare dot/implicit 연결 제외·폭 ranking/포트 signature·진단/재시작 수용 PASS, receipt `{passed:true,projectSymbols:true}`/exit0. 로그 `.dev/module-completion-verified.log`, `.dev/project-symbol-native-verified.log`. 최초 제한 환경 native 파일 읽기 오류는 허용 환경에서 재검증했다. 최초 통합 host `.dev/project-symbol-native.log`는 편집/포트 수용은 통과했으나 후속 기존 `testStructure`에서 closed-editor 오류로 exit1; 이 별도 다이어그램 시험 오류는 다음 E4에서 재현/보완할 항목이며 전체 통과로 표현하지 않는다. 이번 변경 후 전체 회귀 재실행 없음. 패키징/설치·사용자 예제 원본 수정 없음. 개발 확장 재실행으로 반영. 다음 실행 순서는 E4 마무리와 위 구조 시험 오류 점검을 유지한다.

## 최신 편집 개선 — begin·always 계열 명시적 자동완성 (2026-10-08)

사용자 요청에 따라 `begin` Tab/제안 수락은 즉시 여러 줄 `begin → 들여쓴 본문 → end`로 펼친다. `always`/`always_ff`는 `@(이벤트)` 첫 입력 후 Tab으로 본문에 이동하고, `always_comb`/`always_latch`는 곧바로 본문으로 이동한다. 모두 begin/end를 포함한다. SV 전용 키워드는 Verilog에서 제외하며 기존 closer 재사용·주석/문자열/매크로 보호를 유지한다. 기존 inline begin 커서 보정 명령은 제거했다. 이 동작은 사용자가 명시적으로 자동완성한 경우에 적용하며 일반 if/for/always 문장 입력에 block을 강제하지 않는다. 이번 사용자 요청이 이전 always 템플릿 미삽입 정책보다 우선한다.

검증: language12 PASS/0 FAIL, 타입 검사·개발 build exit0. 격리 VS Code host `.dev/vscode-tests/run-YpCEsk`에서 begin 직접 확장/제안 수락, always4종 실제 이벤트→본문 Tab/커서/내용, 기존 editor 회귀와 VCD custom editor 시험 PASS; `.rtl/extension-test.json` passed=true 및 host exit0. 로그 `.dev/editor-block-verified.log`. 이번 변경 후 전체221개 회귀를 다시 실행한 것은 아니며 위 관련 검증으로 한정한다. release VSIX 패키징/설치 없음. 개발 확장 재실행으로 반영하며 기존 study VSIX는 이전 코드 그대로다. 다음 작업은 E4 diagram/기록 디버깅 마무리이며 TOML/자동 trace 요구는 `docs/simulation-setup-ux-direction.md` 후속 방향을 따른다.

## 최신 구현 — 카드 우회 배선·교차 표시와 recorded 디버깅 재검증 (2026-10-08)

Schematic에 bounds/column/terminal 기반 직교 우회, 다른 source의 공선 겹침 방지, T 접속점/비접속 crossing gap과 canvas 위 불완전 안내를 추가했다. graph/type/conversion/source/관측 identity는 유지한다. 관련 geometry/renderer13 PASS·최종 전체221 PASS/0 FAIL/0 SKIP·타입 검사/개발 build exit0. 실제2×2 host run-ZHOpQB는10포트/4PE·routing 완성 assert와 부모100%/Fit·PE00/leaf 카드 우회·clock/feedback/gap을 물리 확인했다. recorded host run-z6ycAb는 Schematic MAC3종 모든 route·117기대값·clock/wave shared cursor·readonly source PASS/receipt/exit0. 최초 공선 통로 겹침과 실제 MAC edge15 product→enable 누락을 보완하고 private path 없는 fixture 회귀를 추가했다. [실패·보완·근거·제한](schematic-routing-acceptance.md). 다음은4×4/조밀한 graph 표시·규모와 E4B 실제 source/diagram/wave/clock 왕복·keyboard/focus·성능·취소/닫기/복구 수용이다. E4 전체 완료가 아니며2M crossing pair 한도/가까운 평행선·복합 교차와 generate/array·연속 확대 제한은 유지한다. 현재 목표는 기록 기반 read-only 디버깅까지이며 live breakpoint/simulator step/operator 값 계산은 제외한다. semantic/Verilator 실행 변경·새 simulation/패키징/설치·사용자 counter 수정 없음. H0 별도 논의 유지. 아래 이전 다음 작업보다 이 실행 지점을 우선한다.

## 최신 구현 — 모듈 외곽·입출력 배치와 배선 분기 (2026-10-08)

Schematic에서 exact compiler declaration/동일 폭/유일 port identity만 왼쪽 입력·오른쪽 출력으로 배치하고 내부 연산/opaque child를 외곽선으로 묶었다. source별 routing spine과 fanout junction을 적용하며 기존 graph/type/conversion/source/관측 identity는 보존한다. 관련 renderer10 PASS, 전체 순차215 PASS/0 FAIL/0 SKIP·타입 검사/개발 build exit0. 격리 실제2×2 host run-i6FCdG는10 boundary ports/4PE assert, Fit→100%·pan·Fit·PE00 double-click/leaf symbols·부모 toolbar Up를 물리 확인하고 receipt passed=true/exit0. 초기 source spine 겹침은 보완/재확인했다. [근거·초기 발견·제한](schematic-boundary-acceptance.md). 다음은 카드 bounds를 우회하는 배선과 다른 net 교차/접속점 구분·실제 화면 확인이다. 현재 긴 배선이 중간 카드 아래를 지나는 문제와 화면 밖 accessibility index 입력 문제는 남아 있고 E4 완료가 아니다.4×4·generate/array·연속 계층 확대·E4B source/wave/clock 왕복/접근성/성능/취소·복구·H0 별도 논의 유지. semantic/Verilator 실행은 변경하지 않았고 이전 simulation 근거를 유지한다. 새 패키징/설치·사용자 counter 수정 없음. 아래 이전 다음 작업보다 이 실행 지점을 우선한다.

## 최신 구현 — Schematic 심볼·입력 접점 첫 개선 (2026-10-08)

Schematic의 부모 결합/leaf 그래프에 공통 심볼(+/× 원형, MUX, Register D→Q/아래 클럭 단자)을 적용했다. compiler 노드·폭/부호/변환·source/관측 identity는 유지하며 operand 입력 접점을 분리하고 column 폭을 조정했다. Detailed leaf logic은 기존 상세 화면을 유지한다. 관련 renderer8 PASS, 전체 순차213 PASS/0 FAIL/0 SKIP·타입 검사/개발 build exit0. 실제 격리 host run-iRLRYg receipt passed=true/exit0로 진입·Update·미저장 RTL·모드/재열기 흐름을 확인했다. 최초 제한 환경 local HTTP 시험 실패·대기 종료1은 보존하며 로컬 서버 접근 가능한 환경의 전체 재검증을 통과했다. [구현·근거·제한](schematic-symbol-acceptance.md). 다음은 실제2×2/leaf MAC 화면을 보며 모듈 외곽/상위 포트·fanout/교차선 가독성을 개선하고4×4·E4B 물리 왕복/접근성/성능/취소·복구 수용이다. 새 심볼 물리 화면 수용·generate/array·연속 계층 확대는 미완료. H0/H/I 별도 논의는 유지하고 새 패키징/설치·사용자 counter 수정 없음. 아래 이전 다음 작업보다 이 실행 지점을 우선한다.

## 최신 구현 — 기본 Schematic/표시 모드와 큰 canvas 흐름 (2026-10-07)

module 선택은 Schematic을 기본으로 분석하며 unsupported는 이유와 Connections fallback을 표시한다. Display selector(Schematic/Connections/Detailed leaf logic)는 Update·scope 이동에서 선택을 유지한다. current graph 재열기/편집은 재분석 없이 static 그림을 유지하고 stale 이동도 그림을 지우지 않는다. 늦은 분석·취소/재시도 경계를 검증했다. parameters/modules/connection 상세를 canvas 아래 접힌 Details로 옮겼다. 전체 순차211 PASS/타입·개발 build exit0, 실제 host run-s7uAg5 기본 분석·Update 모드/미저장 RTL·재열기 graph 보존 receipt/exit0. [근거·초기 대기/실패·제한](structure-default-view-acceptance.md). 다음은 module 경계·연산/register의 간결한 schematic 표현과 fanout/배치 개선, 실제2×2→4×4·E4B 물리 입력/접근성·browser 비용/취소·복구 수용이다. semantic/Verilator 추출은 이번에 변경하지 않았고 이전 근거를 유지한다. generate/arrays·연속 확대·H/I 별도 합의는 남아 있다. 새 배포 패키징/설치·사용자 counter 수정 없음. 아래 이전 다음 작업 문구보다 이 실행 지점을 우선한다.

## 최신 구현 — 부모 연산/register와 자식 경계 결합 첫 범위 (2026-10-07)

별도 scopeOperations가 부모 자체 assign/operator/register와 직접 child instance의 opaque module-port를 연결한다. leaf internalOperations 계약은 유지하고 child output writer/폭·부모 입력·unsupported/partial-free 경계를 검사한다. Show module logic 버튼/명령과 그룹 module card/직교 배선·source/내부 진입·부모 named signal 관측을 연결했다. 전체 순차208 PASS/타입 검사·개발 build exit0, E1 포함 native18 PASS/새 semantic+실제 Verilator·retained7값 native2 PASS, actual host run-iIL6MT scopeOperations/편집·명시 Update/재열기 receipt·exit0. [근거·지원범위·미완료](scope-operations-acceptance.md). 다음은 결합 분석의 기본 화면/Update 모드 정책, module 경계·register/연산 심볼·배선/큰 canvas의 간결한 표현과 실제 UI 수용이다. generate/arrays·4×4·E4B 물리/접근성/성능·취소/복구·연속 확대는 남아 있다. 사용자 counter 변경·새 배포 패키징/설치 없음. 아래 이전 다음 작업 문구보다 이 실행 지점을 우선한다.

## 최신 구현 — 모듈 경계·직접 신호 배선 첫 범위 (2026-10-07)

compiler-confirmed internalSignal/directSignal을 hierarchy에 공급하고 VS Code 독립 buildScopeConnections가 모듈 경계와 immediate 자식 블록을 exact declaration identity로 연결한다. 직접 whole-signal만 단일 driver→sink 직교 배선/topology column으로 그리며 식·slice·cast·폭 변환·상수·interface·다중 driver/inout은 추정하지 않는다. examples/systolic-mini의4 PE/12nets/20wires·expression 격리/leaf 연산·실제 Verilator PASS 및 retained VCD의4값 대조 native2 PASS; 전체 순차205 PASS/타입 검사·개발 build exit0. [근거·초기 오류·범위](scope-connections-acceptance.md). 다음은 자식 경계가 있는 모듈의 자체 assign/연산/register 추출과 net 모델 결합이다. 현재 schematic 전체 완성이 아니며 새 레이아웃의 물리 UI/4×4 및 E4B 접근성·성능/복구를 유지한다. 사용자 counter 변경·새 배포 패키징/설치 없음. 아래 이전 다음 작업 문구보다 이 실행 지점을 우선한다.

## 최신 구현 — Structure 전용 작업 공간 첫 범위 (2026-10-07)

Activity Bar Structure 아이콘/컨테이너와 RTL Hierarchy 이동, visibility→중앙 canvas 진입, 최초 분석 전 Update 화면, 기존 panel 재사용을 구현했다. 편집 시 마지막 hierarchy/static graph를 유지하고 변경 표시·오래된 소스 이동 차단, 명시적 Update는 기존 미저장 RTL overlay를 반영하며 저장하지 않는다(사용자 입력 정책 답변은 대기). 최종 전체 순차202 PASS/0 FAIL/0 SKIP·타입 검사/개발 build exit0. 최초 모형/contribution 가정 실패는 보완, 기존40ms 취소 시험 병행 부하 실패는 미해결로 기록. 실제 host run-djoKya receipt passed=true/exit0: 분석 없는 진입·편집/수동 갱신·재진입·닫기/재열기 확인. [구현·검증·제한](structure-workspace-acceptance.md). 다음은 자식 블록과 현재 모듈 자체 net/연산/저장소의 scope 모델·표시/배치 결합, 작은 2×2 fixture다. E4B 전체 물리 입력·접근성·browser 비용/복구는 유지하며 목표 schematic 완료가 아니다. 새 배포 패키징/설치 없음.

## 최신 사용자 방향 — 모듈 중심 schematic 작업 공간 (2026-10-07)

사용자 4×4 systolic_array / mac_pe 그림으로 목표를 명확히 했다. 현재 모듈의 배선·연산·저장소와 자식 모듈의 경계 블록을 함께 보여주고, 내부 진입 시 해당 자식의 구조를 보여주는 별도 작업 공간이다. 자동 편집 갱신 대신 명시적 Update, 최종적으로 계층 확대에 따른 내부 펼침을 원한다. **현재 port 연결도와 leaf 연산 그래프는 기반이며 목표 schematic 완료가 아니다.** [요구·현재 차이·제안 순서·확인 대기](structure-schematic-direction.md)를 먼저 읽는다. E4B 정확성/접근성/복구 게이트는 유지하되 기존 외형 수용만으로 목표 완료를 선언하지 않는다. 다음은 사용자 화면/Update 답변 반영 후 scope 모델·표시/배치 재설계 범위 구체화이며 H/I 착수 합의는 별도다. 이번은 문서만 변경, 새 구현/시험/패키징 없음. 아래 이전 다음 작업 문구는 이 방향과 함께 읽는다.

## 최신 작업 — E4A 실제 graph 가독성·기본 규모 검사 (2026-10-07)

MAC24node graph의 실제 +/pan, 추가100% 버튼→첫 신호 가독성→Fit44% 복귀를 격리 개발 창에서 확인했다. 실제 확인 중 중앙 wire-only 확대를 발견해100%는 graph 시작20/20으로 보완했다. native98/146node 분석·SVG 생성과256node 초과의 partial-free 거부1 PASS, 최종전체200 PASS/타입·개발 build/실제 host run-FyR9NC receipt·exit0. 초기40ms 취소 시험 timedOut 실패와 단독 재실행 통과를 보존하며 해결됐다고 하지 않는다. [측정·실제범위·초기실패·남은작업](visual-debugging-e4a.md). **E4 진행 중, 다음 E4B**는 모듈/source/wave/clock 실제 왕복·접근성·browser 비용·취소/복구 수용이다. H0 진입 전 E4 완료 판단이 필요하다.0.3.1 배포물 SHA 유지·새 패키징/설치 없음. 아래 기록은 이전 시점 근거다.

## 최신 작업 — E3 pipeline MAC 예제/reference 종단 검증 (2026-10-07)

별도 examples/pipeline-mac에 signed4/signed8 parameter 변형과 unsigned4,13cycle reset/hold/latency/overflow·잘림 예제를 추가했다. SV longint assertion과 독립 BigInt/reference 표, retained graph/trace의117기대값·edge 전/최종값을 대조했다. 잘못된 same-cycle product 누적은 cycle2 runtime assertion FAIL을 확인했다. 전체199 PASS/native integration1 PASS/타입·개발 build, 실제 host run-qMDhox 세 graph·117값·clock/wave cursor·readonly source/receipt/exit0 통과. [근거·사용·초기 시험 오류·제한](pipeline-mac-acceptance.md). 다음은 **E4 실제 시각화 UX·성능·복구 수용**이다. 물리 조작/가독성·대표 규모 및 열린 Windows/사용자설계 게이트는 유지한다. 기존 counter/0.3.1 배포물 SHA 유지·새 패키징/설치 없음. 아래 기록은 이전 시점의 근거다.

## 최신 작업 — D4 선택 클럭 에지 기록 탐색 (2026-10-07)

명시적 one-bit clock 선택·Rising/Falling·Previous/Next 버튼을 보존 포트/내부 연산 화면에 추가했다. strict 0→1/1→0만 탐색하고 X/Z·초기값·현재 tick을 제외한다. 최대4096기록/query와 continuation·Cancel/15초 제한·page/job/reader/revision 경계를 사용하며 공유 cursor/최종 기록값을 유지한다. 전체198 PASS/타입·개발 build, 실제 host run-5Xkabh MAC 값·첫/끝·상승/하강·복구 뒤 파형 cursor 및 receipt/exit0 확인. no-edge 알림 dismiss 대기를 수정했다. [근거·지원 범위·초기 실패](clock-edge-acceptance.md). 다음은 **E3 pipeline MAC 종단 예제/reference 검증**이다. 물리 graph/clock UI와 대표 규모 수용은 E4, Windows/사용자설계 등 열린 게이트는 유지한다. 0.3.1 배포물 SHA 유지·재패키징/설치 없음. 아래 기록은 이전 시점의 근거다.

## 최신 작업 — E2 기록된 내부 신호 관측값 (2026-10-07)

검증된 retained graph의 compiler 선언 이름과 segmented instance path를 같은 run의 VCD에 연결했다. named signal만 조회하고 operator/next-state 값은 추정하지 않는다. missing/ambiguous/width/unsupported·X/Z·무효화, 기존 page/job/revision·reader 경계와 공유 커서를 유지한다. 최종전체191 PASS/native semantic20 PASS/타입·개발 build, 실제 host run-H5FiNt에서 8/16bit MAC raw 값·양방향 커서·닫기/재열기·현재 소스 격리·trace 손상/복구·시뮬레이션PASS/receipt 및 exit0 확인. [구현·근거·제한](internal-operations-e2.md). 물리 graph 조작/가독성·대표 규모 수용과 E3 전체MAC 예제는 남아 있다. 다음 구현은 **D4 선택 clock/edge 기록 탐색**이며 live simulator step이 아니다. 0.3.1 배포물 SHA 유지, 재패키징/설치 없음. 아래 이전 작업/검증 기록은 당시 근거로 보존한다.

## 최신 작업 — E1 정적 내부 연산 그래프 첫 범위 (2026-10-07)

편집기 독립 graph 계약·slang AST allowlist/변환과 기존 구조 창 Internal operations/Port connections 전환·소스 이동·canvas 재사용을 구현했다. next-state/register feedback/hold·계산 폭/부호·형 변환을 구분하고 unsupported/multiple-writer/cycle·한도를 검사한다. current overlay와 검증된 recorded 입력/readonly 소스, stale/nonce/취소·late result 경계를 유지한다. 최종전체186 PASS/native semantic20 PASS/타입·개발 build, 실제 개발 host run-U5Hfge receipt passed=true/시뮬레이션PASS/current·recorded graph·source·무효화/host exit0 확인. [구현·초기 실패·검증·제한](internal-operations-e1.md), [업데이트한 로드맵](pre-ide-roadmap.md). 물리 클릭/화면 가독성·대표 graph 규모 수용은 E4에 유지, 내부 관측값과 clock replay 미구현. 다음은 E2 보존 graph named signal의 segmented trace 매핑이다. 원래0.3.1 VSIX/ZIP SHA 유지·재배포/설치 없음.

## 최신 작업 — E0 내부 연산 추출 가능성 검증 (2026-10-07)

개발용 pyslang probe와 counter/adder·두 parameter 폭의 signed MAC/unsupported fixture를 추가했다. net initializer와 variable startup 구분, 연산/형변환 폭·부호·source, always_ff clock/edge·reset/enable·NBA 추출을 확인했다. 실제 Verilator 내부 product/stage/acc의 segmented trace identity·폭·raw 값 대조 native2 PASS, 최종 전체184 PASS/타입 검사·개발 build exit0. 초기 display path 시험 실패와 병행 부하의 기존 취소 시험 실패를 보존하며 timing 민감성은 해결했다고 하지 않는다. [결과·계약·제한](internal-operations-e0.md), [업데이트한 로드맵](pre-ide-roadmap.md). E0 실험 완료이며 graph 제품 화면/내부값 연결은 미구현. 다음은 E1 allowlist/모델 변환·counter/adder 정적 화면이다. VSIX0.3.1·사용자 예제는 유지하고 재배포/설치는 하지 않았다.

## 최신 실행 지점 — F1X 스터디 비공개 베타 (2026-10-06)

사용자 승인으로 0.3.1 VSIX/CLI/새 예제/안내 ZIP 배포를 준비했다. 정식 stable·독립 앱이 아니다. 전체184 PASS(초기 오래된 DOM 참조2 FAIL 수정)/타입 검사·build, 실제 VSIX 격리 설치 및 설치 폴더 native 편집/semantic/두 PASS/내장 파형·보존 구조 ready/host exit0, 배포 CLI check·두 PASS·hierarchy exit0와 GUI/CLI 결과 일치를 확인했다. 언어 빠른 재시작의 pending changes TypeError가 발견돼 알려진 제한으로 남긴다. 깨끗한Windows/대표사용설계·장시간/프로필·일부 실제입력 게이트는 유지한다. 다음은 스터디 설치·실사용 피드백 수집 → 언어 재시작 경쟁 및 중단 오류 우선 수정 → 0.3.x 회귀 검증이며, 후속 U12/독립 앱은 기존 순서를 따른다. [수용·발견 문제·재현](private-beta-acceptance.md), [설치 안내](private-beta-guide.md). 이전 VSIX 금지/미배포 기록은 당시 상태이며 이번 명시적 배포 요청이 우선한다.

# 현재 구현 재검증과 피드백

F1W 실제 progress Cancel 버튼 검증 통과(run-odiLDS): 테스트 전용20초 load dispatch 지연에서 native 클릭으로 target reader 종료·document 제거, 기존 peer 값 유지, 정상 재열기/값 복구·3/3worker exit/SHA/host exit0 확인. 관련4 PASS/타입 검사·개발 build 통과. [실제 조작·제한 조건](waveform-physical-cancel-acceptance.md). 제품 코드 변경 없음. 일반 parse 중 물리 취소 latency/전체 안정화 수용은 아니며 실제 입력/Escape·프로필 잔여 및 대표 설계·장시간/깨끗한Windows 게이트를 유지한다.

F1V 합성 중간 규모 취소·메모리 회복 검증: 4096신호 두 reader의 native loading중 닫기/peer 보존/4cycle/worker9개 종료/SHA 검증 통과. 최종15초 자연 idle 두 실행에서 RSS baseline221–222MiB→191–193MiB 회복을 재현했다. 초기3초 미회복도 보존한다. 독립8cycle16reader exit, 256RTL파일 분석·실행중 취소/재시도1 PASS, 관련23 PASS/타입 검사·개발 build 통과. [근거·측정조건·제한](waveform-memory-recovery-acceptance.md). 제품변경 없음. 다음 물리 Cancel 조작·취소 복구와 잔여 입력/프로필 수용, 실제 설계 경로 제공 시 대표 프로젝트 검증. 전체 규모·메모리 수용/깨끗한Windows 완료는 아니다.

F1U 기본 사용자 편집 설정과 설치된 Verilog HDL 1.29.0을 격리 복제해 editor/semantic native 검사 통과(run-22Vp8d), 실제 module/package/begin Tab 및 begin Enter의 내용·커서 검증 통과(run-MmeiXH), 두 host exit0. 11 lexical PASS/semantic unit7 SKIP/타입 검사·개발 build 통과, 원본 설정 SHA 유지. 외부 linter는 PATH의 실행 파일 미발견으로 동작하지 않았으므로 정상 외부 diagnostics 충돌은 미검증이다. [근거·범위·재현](editor-profile-acceptance.md). 다음 대표 규모·loading 취소·두 reader 메모리 복구, 편집 프로필 잔여는 별도로 유지한다.

F1T 보존 결과·구조·파형 경계 재검증: 관련 32 PASS/타입 검사·개발 build 통과. 실제 VS Code run-Mpz1Al에서 package/include를 포함한 두 시뮬레이션, 보존 소스/구조/값·양방향 커서·닫기/재열기·손상 차단/복구 통과, host exit0. 별도 generate/array/escaped·한글/공백 경로 Core/worker 실제 검사 1 PASS. 제품 변경 없이 late values 무효화 회귀를 추가했다. [근거·초기 대기·지원 범위](recorded-boundary-acceptance.md). 다음 실제 사용자 편집 프로필 충돌→대표 설계·loading 취소·두 reader 메모리 복구. 전체 안정화/배포 완료는 아니며 깨끗한 Windows 보류는 유지한다.

2026-10-06 F1S: run-xbQA9K 실제drag/zoom/pan/하단scroll·Reload/32부모128bit oracle·equality/SHA/host exit0. 제품변경없음. [관측과가림/입력제한](waveform-cursor-physical-acceptance.md). 다음retained 연동경계 및남은3묶음안정화. viewport조회143.7–168.1ms를성능수용으로쓰지않음.

2026-10-06 F1R: cursor reuse 기본적용/42 PASS/typecheck/build/native run-lGGL2k8exit/값·latest/Reload-close/peer/SHA/host exit0. 혼합viewport late응답·errorfull복구 및real/wide/zero/ordinary무진단 회귀. [범위](waveform-cursor-reuse-acceptance.md). 실제드래그체감/전체성능·대표설계 수용미완료.

2026-10-06 F1Q: 검증전용cursor-only 후보/41 PASS/typecheck/build, 원본1·후보2native 각각8exit/값·X/Z/latest/Reload-close/peer/SHA/host exit0. [정확한범위·초기VM검사실패·다음경계](waveform-cursor-reuse-candidate.md). 기본사용경로미활성/전체성능수용아님.

2026-10-06 F1P: 40 PASS/typecheck/build, run-ZPfvt9/run-qgFuCm 각각8workerexit/값·latest burst/Reload-close/peer/SHA/host exit0. dev/test host duration 및실제payload 비용계측, 제품캐시채택없음. [수치·한계·다음후보](waveform-transport-profile.md). dense 성능/RSS/대표설계 수용은미완료.

2026-10-06 F1O: run-ljPKYm 장시간 cursor32/128값 oracle·overflow/최대화복원/앱zoom 정렬·Ctrl+-범위보존/일반확대pan 확인. 39 PASS/typecheck/build/native exit0/sourceSHA 유지. [범위와 한계](waveform-native-layout-acceptance.md). 다음 dense query/전달 조사이며 전체성능/OS DPI/대표설계 수용 아님.

2026-10-06 F1M: 사용자선호로 절대눈금복원/긴값두줄·sharedscroll정렬유지. 관련6 PASS/타입 검사·빌드 exit0, 원래시각합/단위·carry·겹침및bundled cursor정렬회귀. native재검증미수행. [결정](waveform-absolute-time.md). F1L잔여순서유지.

2026-10-06 F1L: bundled group/Esc/late response/resize·DPR/160→1→160 회귀·modifier shortcut guard 보완. 관련37 PASS/타입 검사·빌드 exit0. native Shift선택group drag 및label앱zoom관찰/SHA/host exit0. 최종container Ctrl+-는사용자입력과겹쳐 미검증, 다음짧은native 회귀대상. [범위](waveform-interaction-regression.md).

2026-10-06 F1K: 사용자제보 cursor/ruler 어긋남의 scrollbar 폭 구조 보완·상대시간눈금·viewport paint/reveal·Reload scroll복원. 관련35 PASS/타입 검사·빌드 exit0, run-T0BtBf32/128값/8exit/latest/peer/SHA/host exit0. run-7uWK3q 물리cursor/ruler클릭/아래reveal/Reload위치/panel폭정렬 및전체값oracle 확인. dense query 수백ms/전체resize·DPI/그룹·Esc/실제설계/RSS 남음. [결과](waveform-viewport-alignment.md).

2026-10-06 F1J:160행 실제 Windows 마우스 scroll/zoom/reorder/cursor/Reload 확인. 32/128전체값 및 Reload cursor/rows/details equality/SHA/host exit0. 최종수동준비코드 run-KuVyAh160행/종료 확인, 관련31 PASS/타입 검사·빌드 exit0. Reload scroll초기화/큰절대시간 라벨/일시 빈plot 발견, dense 수백ms 성능은 미수용. 다음 visible-row 비용·복구 후보. [범위와 남은 검증](waveform-physical-ui.md).

2026-10-06 F1I: query/renderer 비용 분리·경계/좌표 재사용, 최종 관련31 PASS/typecheck/build exit0. run-Qv9vJv20연속 요청 최종값·Reload 로딩 중 닫기/peer/재열기·8exit/SHA/host exit0. dense RTT111.4ms/draw127.1ms/worker20.61ms 관찰, 보장된 성능비율 아님. 물리 scroll/drag·visible-row/전달·RSS 수용은 남음. [계약과 초기 관찰 실패](waveform-dense-recovery.md).

2026-10-06 F1H: 최대160행 기능/Reload equality·peer·4exit/SHA 검증 중 draw1초 문제 발견·layout read/write 및 눈금 공유 보완. 최종 run-a7v4rO draw45.9–188ms, 부모/bit 모든 값·dense/zoom·host exit0, 관련29 PASS/typecheck/build exit0. dense 요청200.2ms/그리기188ms 반응성·물리 입력/RSS는 남음. [증거·다음 비용 분리](waveform-render-stress.md).

2026-10-06 F1G: 명시적dev/test renderer계측·관련28 PASS/typecheck/build exit0. 실제 run-risLLx8editor/32visible sample/24cursor probe·9exit/peer/SHA/host exit0. 기본8신호 querymedian7.75ms/draw4.65ms/init→firstdoubleRAF62.1–97.7ms, phase loop52.36ms. frame기회는 실제pixel표시/물리조작이아님. 다음 최대행·bit/활동viewport UI스트레스; RSS 초기회수/대표설계게이트열림. [정의와근거](waveform-render-profile.md).

2026-10-06 F1F: bounded short-value 공유 적용, 원본/후보24worker3종 digest·SHA 동일. 반복자료31.6% 메모리 감소/중앙값parse+8.1% 절충, 고유/wide 중앙값 증가 없음(편차 존재). 관련26 PASS/typecheck/build exit0. native run-w4sxss4cycle/9exit/peer/SHA/host exit0·loop41.75ms. RSS 초기회수/renderer 수용 미완료. 다음 명시적 renderer/query 구간 계측. [근거](waveform-value-reuse.md).

2026-10-06 F1E: CPU/할당·worker-local live heap 계측. run-SvRWin5worker exit/SHA·전체값digest·X/Z query, post-parse 값공유3회 불변성 통과. retained 증가56.878MiB/진단공유17.937MiB 감소/자료해제 기준선+0.117MiB. native RSS/renderer 수용 근거는 아니다. 관련24 PASS·타입 검사/개발 빌드 exit0. 다음 제한된 per-parse 값공유 비교; 제품 최적화는 아직 없음. [측정과 한계](waveform-parser-profile.md).

2026-10-06 F1D: opt-in 구간별 계측·관련24 PASS·타입 검사/개발 빌드 exit0. 실제 run-hA0nMr4cycle/9exit/SHA 불변/host exit0. parse0.716–0.958s가 open0.828–1.118s 대부분, warm phase host loop41.88ms. 이전900ms 미재현/원인 미규명이며 개선 성공으로 취급하지 않는다. RSS 초기 회수 미입증; 다음은 CPU/할당·live heap 구분. [측정 경계](waveform-phase-profile.md).

2026-10-06 F1C: enum 준비 중 취소의 metadata/ready link 잔류 보완, 관련26 PASS/타입 검사·개발 빌드 exit0. 실제 run-5rYxEQ 로딩 중 tab 닫기→재열기·두 editor4cycle·9/9 worker exit/peer 값 보존/SHA 불변·receipt passed=true/host exit0. RSS 초기 회수 미입증, loop900.20ms가 임시200ms 초과하므로 성능 수용은 열려 있다. 다음은 구간별/warm 지연 계측. [범위·근거](waveform-cancel-lifecycle-acceptance.md).

2026-10-06 U05 1차: 보존 enum 이름·Auto/숫자 override·raw bit·자료 부족 fallback·분석 전/후 identity 검증, 최종 관련52 PASS/native1 PASS/타입 검사·개발 빌드 exit0. 실제 enum/Hex 전환·수정 후 Reload7.486ns LOAD 유지, 최종 receipt passed=true/sourceUnchanged=true/enumNames=true/traceReady=true·host exit0. [범위와 기존 Reload 문제 보완](waveform-enum-acceptance.md). 다음은 A3/F 잔여 안정화이며 전체 회귀·대표 규모 완료가 아니다.

2026-10-05 U04 1차: 회로도 pan/zoom/Fit·scope 복원 구현, 관련23 PASS/타입 검사·개발 빌드 통과. 실제 보존 화면 물리 조작과 기록 값 유지, 최종 소스 불변/trace ready receipt passed=true/host exit0. [정확한 범위와 초기 fixture 오류](structure-canvas-acceptance.md). 다음은 U05이며 기존 잔여 게이트 유지.

2026-10-05 U03: Simulation 입력 변경 상태 구현, 관련33+보존 회귀10 PASS/타입 검사·개발 빌드 통과. 실제 host/native2 PASS·입력 변경/dirty 분리/복원 수용, receipt passed=true/exit0. [정확한 범위와 미검증](input-freshness-acceptance.md). 다음은 U04이며 기존 큰 잔여 게이트는 유지한다.

현재 요구·구현/미구현·다음 순서는 [제품 로드맵](project-roadmap.md), 최신 작업 결과는 [PROGRESS](../PROGRESS.md)가 기준이다. 아래 체크포인트는 당시 검증 이력이며 최신 UI 변경은 [단일 커서 수용](waveform-cursor-acceptance.md)을 확인한다. 잔여 큰 검증3묶음과 깨끗한 Windows 별도 보류1은 유지한다.

## 최신 체크포인트 — 버스 비트 펼치기·묶음 이동 수용

2026-10-05: 버스 ▸/▾로 개별 bit 표시, 선언 방향/인덱스·X/Z·정확한 시간 투영과 저장 보기/편집기 상태 복원을 구현했다. 32부모+최대128 추가 bit 행; 원본 worker 채널을 추가하지 않는다. 자식은 부모 아래 고정 순서이며 독립 정렬/Edge/스타일은 후속. 실제8bit 펼침/접힘, 두 신호 범위 선택(Shift+Space) 후 묶음 drag, 보기 저장·Reload 복원 및 cursor4.556ns 유지 확인. Ctrl/Shift+마우스는 자동 이벤트 범위.

관련32 PASS/0 fail/skip, 타입 검사·개발 빌드 통과, 격리 개발 창 exit0. [구현·제한·검증 이력](waveform-bits-acceptance.md). VSIX/설치 없음. 다음 구현 enum 상태 이름 표시 → RTL 실행 화면 UX → 기존 대표 설계/loading 취소/두 reader 메모리 등 안정화 검증 재개. 큰 검증3묶음+깨끗한 Windows 별도 보류1 유지; 전체A3/F 완료 아님.

## 최신 체크포인트 — 파형 UX 정렬·눈금 개선

2026-10-05: 사용자 피드백을 우선 반영해 파형 행 X/위아래 버튼을 제거했다. 신호 포함/제외는 Signals에 통일하고 Ctrl/Shift 선택·그룹 드래그, 좁은 이름 열, 1/2/5 간격 큰/작은 눈금을 구현했다. 기본 HTML drag는 실제 화면에서 이동되지 않아 pointer capture 경로를 보완했다. 실제 clk 마지막 이동 및 cursor 4.556ns/4신호 유지 확인. Ctrl/Shift 물리 조합·그룹 이동/재시작은 아직 자동 이벤트 검증 범위다.

관련29 PASS/0 fail/skip, 최종 타입 검사·개발 빌드 통과, 두 개발 창 exit0. 합성 VCD 화면 수용이며 native 실행 완료로 세지 않는다. VSIX/설치 없음. [7개 요구·수용·후속 설계](waveform-ux-plan.md). RTL Start 재배치·비트 펼치기·enum 이름 표시 미구현. 다음은 다중 선택 물리 수용 → 비트 펼치기 → enum → 실행 화면 UX, 이후 남은 대표 설계/loading 취소/두 reader 메모리 등 검증 재개. 큰 검증3묶음+깨끗한 Windows 별도 보류1 유지; 전체 A3/F 완료 아님.

## 최신 체크포인트 — 구조 상태 표시·보기 관리 취소 수용

2026-10-05: 실제 parser/mapTracePorts/renderStructure 기반 합성 개발 화면에서 X/Z·Not recorded·Ambiguous path·Width mismatch·Unsupported type 구분과 표의 전체 문구를 확인했다. 검증용 보기의 기본 지정/해제, 이름 입력 취소, 덮어쓰기 확인창 Cancel, 삭제 확인창 Cancel 후 원래 보기·두 신호·11ns 유지를 실제 확인했다. 구조 호스트의 정확한 X/Z 채널만 조회/잘못된 binding 미조회/손상 후 전체 Unavailable 회귀 및 보기 취소의 전체 storage 불변 assertion을 추가했다.

최종 관련28 PASS/0 fail/skip, 타입 검사·개발 빌드 및 최종 두 검증 창 exit0. 제품 코드/설치/VSIX 변경 없음. [범위·fixture 준비 실패 이력·증거](structure-states-management-acceptance.md). 합성 rendering 수용은 native/보존 archive 종단 X/Z 성공이 아니며 물리 삭제 확정은 실행하지 않았다.

남은 큰 검증3묶음: 기록 자료 기반 구조 종단/남은 세부 경계, 실제 사용자 프로필 충돌, 실제 대표 설계/loading 취소/두 reader 메모리 회수. 깨끗한 Windows는 별도 PC/VM 없음으로 보류1. 다음은 loading 취소·재열기와 두 reader 실제 호스트 메모리 관측이며 전체 A3/F 완료가 아니다. 검증 이후 파형 UX 사용자 피드백을 반영한다.


## 최신 체크포인트 — 구조 내부 탐색·파형 예외·보기 갱신 보완

2026-10-05: 실제 보존 run의 DUT 더블 클릭/Up 이동, 독립 합성 파형의 X/Z 표시와 보존 구조 시간 비혼입, 보기 이름 변경·누락 1개 안내·누락 상태 새 저장 뒤 두 신호 복원을 실제 확인했다. 다른 파형 탭에 새 보기 목록이 Reload까지 반영되지 않던 A3-WAVE-VIEW-SYNC-1을 보완했다. 같은 테스트의 열린 패널에 목록을 통지하며 현재 신호·커서·보기를 강제 변경하지 않는다. 수정 후 실제 두 탭에서 Reload 없는 새 보기 반영 및 두 신호/11ns 유지 확인.

최종 관련27 PASS/0 fail/skip, 타입 검사·개발 빌드 및 두 개발 창 exit0. 앞선25/집중7은 반복 실행으로 합산하지 않는다. [상세 수용·증거·재개](structure-wave-edge-ui-acceptance.md). VSIX/설치 없음.

남은 큰 검증3묶음: 구조 X/Z·미기록/모호한 연결과 관리 예외의 남은 물리 수용, 실제 사용자 프로필 충돌, 실제 대표 설계/loading 취소/두 reader 메모리 회수. 깨끗한 Windows 별도 보류1(PC/VM 없음). 독립 합성 파형 X/Z를 보존 구조 X/Z 수용으로 세지 않는다. 다음은 남은 구조·관리 경계이며 파형 UX 개선은 검증 후 사용자 피드백을 받는다. 전체 A3/F 완료가 아니다.


## 최신 체크포인트 — 탭/CRLF·파일 간 package·분석 상태 수용

2026-10-05: 격리 VS Code1.140.0 실제 입력으로 탭/CRLF begin Tab→Enter·각 Undo·직접 Enter, module 이름→포트→본문 Tab 이동을 확인하고 저장 바이트의 탭/CRLF 보존을 검사했다. 다른 파일의 미저장 EXPORTED→UPDATED 선언 변경이 consumer의 package 추천에 반영되고 Tab 수락/Ready 복구됨을 확인했다. 디스크 EXPORTED 보존 근거도 기록했다. Disabled/Tools missing 표시와 복구 메뉴, 기존 도구 경로 복원·Retry→Ready를 실제 확인했다.

관련 자동20 PASS/0 fail/skip, 타입 검사·개발 빌드 및 개발 창 exit0. 제품 코드/설치/VSIX 변경 없음. 설정 변경은 격리 fixture 파일에서 준비했으며 사용자 설정 토글 화면 수용으로 세지 않는다. [범위·근거·재개](editing-edge-ui-acceptance.md).

남은 큰 검증3묶음: 구조 X/Z·미기록/Up/double-click 및 저장 보기 관리/누락 신호 등 세부 예외, 실제 사용자 프로필 충돌, 대표 실제 설계/loading 취소/두 reader 메모리 회수. 깨끗한 Windows는 별도 환경 없음으로 보류1. 다음은 구조·저장 보기 예외의 실제 화면이며 파형 UX 개선은 검증 이후 사용자 피드백을 받는다. 전체 검증/A3/F 완료가 아니다.


## 최신 체크포인트 — 실행 예외 화면 수용·F5 연결 보완

2026-10-05: 격리 VS Code1.140.0 지속 저장 개발 창에서 컴파일 오류 FAIL/진단 로그 열기, 준비 중 도구 검증 Stop, g++ 빌드 중 Stop, 하위 프로세스0개 및 취소 후 F5 재실행 PASS를 확인했다. 등록된 TB에서 F5가 일반 디버거를 열던 A3-RUN-F5-1을 보완했다. 활성 파일/manifest 갱신으로 TB 컨텍스트를 계산하고 편집기에 초점이 있는 등록된 Verilog/SystemVerilog TB에만 연결한다. 일반 DUT에서 기존 디버거 안내 유지도 실제 확인했다.

관련 자동18 PASS/0 fail/skip(기존16+활성 파일/manifest 갱신·현재 TB 실행 경계2), 최종 타입 검사·개발 빌드 통과. 실제 정상 실행3 PASS, 의도한 컴파일 실패1, 준비/빌드 취소2. 빌드 Stop 두 번의 늦은 클릭은 PASS로 끝났으므로 취소 성공으로 세지 않는다. 수정 전후 개발 창 exit0. [상세 근거·남은 범위](execution-detail-ui-acceptance.md). VSIX/설치 없음.

남은 큰 검증3묶음: 편집/도구/구조·저장 보기 세부 예외, 실제 사용자 프로필 충돌, 대표 실제 설계/loading 취소/두 reader 메모리 회수. 깨끗한 Windows 별도 보류1(사용 가능한 PC/VM 없음). 다음은 탭/CRLF·파일 간 package 변경·분석 비활성화/도구 누락, 이어 구조 X/Z·미기록/Up/double-click와 저장 보기 관리 예외다. 전체 A3/F 또는 모든 검증 완료가 아니다. 파형 UX 개선은 검증 후 사용자 피드백을 받는다.


## 최신 체크포인트 — Windows 빌드 종료 지연 보완

2026-10-05: MSYS Perl/셸 경로에서 제한 신호가 제때 발생해도 빌드가 계속되는 결함을 계측 재현했다(1500ms 제한→16425ms, 빌드 취소→16215ms). Windows 도구 검색을 공식 verilator_bin.exe 직접 호출로 바꿨고 비교에서1819ms 시간 초과/406ms 취소 및 정상 PASS를 확인했다. 기존190465/229258ms의 전체 지연은 계측이 없으므로 단일 원인으로 단정하지 않는다. [재현·보완·한계](timeout-termination-validation.md).

검증: Core/프로세스10 PASS, 실제 native10 PASS, 종료 뒤 Windows 프로세스 잔존 검사 강화 회귀1 PASS(중복 실행), 모두0 fail/skip 및 exit0. typecheck/development build 통과. VCD/FST·무한 실행 취소/시간 초과·공백/한글 경로·reset 복구 정상. 전체 suite/slang/물리 GUI Stop 검증을 새로 완료한 것으로 세지 않는다. VSIX/설치 없음.

남은 큰 검증3묶음 및 깨끗한 Windows 별도 보류1 유지. 다음은 실제 GUI 컴파일 실패 결과·준비/빌드 중 Stop·F5, 이어 편집/도구/구조 세부 예외, 실제 사용자 프로필 충돌, 대표 실제 설계/loading 취소/두 reader 메모리 회수다. 전체 A3/F·베타 배포 준비 완료가 아니다.


## 최신 체크포인트 — 저장 보기 복원·격리 수용 완료

2026-10-05: 같은 지속 저장 개발 프로필의 실제 UI에서 원본 basic의 두 보기 재시작/전환(3신호·2신호), 다른 TB의 Custom-only 목록, 동명 프로젝트·테스트의 별도 기본 보기 저장 및 재시작(1신호), 원본 두 보기/기본 설정 비혼입을 확인했다. 두 개발 창 exit0. 관련 회귀5 PASS/0 fail/skip, typecheck/development build exit0. 제품 코드/VSIX/설치 변경 없음. [범위·근거·이전 중단 기록](waveform-isolation-acceptance.md).

남은 큰 검증3묶음: 세부 예외·실행 안정화, 실제 사용자 프로필 충돌, 대표 실제 설계/파형 loading 취소/두 reader 메모리 회수. 깨끗한 Windows 별도 보류1. 다음 우선 작업은 비교 사본 CLI의60000ms 제한 대비190465/229258ms timedOut 결과 기록 원인 재현과 종료 경로 점검이다(원인 미확정, 로그 보존). 관리 대화상자/모든 예외·전체 A3/F·배포 준비 완료로 확대하지 않는다. 아래 중단/4묶음 기록은 재개 전 이력이다.


## 최신 체크포인트 — 저장 보기 격리 검증 중단

2026-10-05: rQSqPW 지속 저장 프로필에서 기존 기본 카운터★/3신호 복원과 리셋과 결과/2신호 두 번째 보기 저장을 실제 확인했다. 다른 TB·프로젝트 격리와 두 보기 재시작 복원은 미완료. 비교용 새 사본의 CLI 두 테스트는60000ms 제한에 대해 실제190465/229258ms 후 timedOut/exit1; 원인은 미확정이며 실행 시간 제한/종료 재검증 필요. 비교 fixture를 이전 정상 native 실행 사본으로 전환하고 첫 개발 창 exit0 후 사용자 물리 Escape로 Computer Use가 중단되어 추가 GUI 조작을 멈췄다.

[중단 기록 및 재개 순서](waveform-isolation-acceptance.md). 재개 실행기 .dev/launch-wave-isolation.mjs, 다중 프로젝트 .dev/wave-isolation.code-workspace, 동일 기존 프로필. 제품 코드/VSIX/설치 변경 없음. 이번 새 typecheck/build/회귀 PASS 주장 없음. 남은 큰 검증4묶음과 깨끗한 Windows 별도 보류1은 유지한다.


## 최신 체크포인트 — 보존 구조·파형 연동 수용과 배치 보완

2026-10-05: VS Code1.140.0 격리 지속 저장 개발 창에서 보존 top→dut/Back/Forward·정의 소스 이동, 구조25ns↔파형35ns의 시간/포트 값 동기화, 두 화면 각각 닫기/재열기와 다른 run5ns의 시간 격리를 실제 키·마우스로 확인했다. 파형을 닫아도 구조15ns/count1 조회 유지, 구조를 닫아도 파형35ns/count3 조회 유지. 구조를 계층 목록에서 재열면 안내된 Refresh가 필요하며 재연결 후35ns 복구를 확인했다.

발견한 A3-WAVE-LAYOUT-1: 좁은 화면 또는 Signals 숨김에서 main이 폭0 grid 열에 자동 배치되어 파형이 사라짐. main을 두 번째 열/첫 행에 고정하고 실제 좁은 화면 및 넓은 화면의 browser 숨김에서 시간축/세 신호/값 표시를 재검증했다. 관련31 PASS/0 fail/skip, 최종 typecheck/development build 및 수정 전후 창 exit0, 주 VCD SHA256 일치. 새 native 실행/전체 suite/VSIX/설치 없음. [실제 수용 기록](structure-ui-acceptance.md).

남은 큰 검증4묶음: 다른 TB·프로젝트 저장 보기 격리/두 보기 재시작, 세부 예외(탭/CRLF·파일 간 package·도구 누락/비활성화·컴파일 오류/빌드 Stop/F5 및 구조 X/Z·미기록/Up/double-click), 실제 사용자 프로필 충돌, 대표 실제 설계/파형 loading 취소/두 reader 메모리 회수. 개별 테스트 개수 아님. 깨끗한 Windows는 별도 PC/VM 없음으로 별도 보류1. 다음 주 작업은 저장 보기 격리이며 전체 A3/F·배포 준비 완료 아님.


## 최신 체크포인트 — 자동 안내·scope·Enter 추가 수용

2026-10-05: 격리 VS Code1.140.0 실제 키로 pkg:: 자동 추천, 미저장 EXPORTED→UPDATED 후보 갱신/디스크 보존, 안쪽 scope_arg/inner/local 및 바깥 inner 제외, wildcard import 후보를 확인했다. 함수 ( 첫 인자 및 쉼표 두 번째 인자 자동 강조, if/always/for·주석/문자열 Enter의 블록 강제 삽입 부재와 각 Undo, 상태 메뉴의 RTL Language 로그 열기를 확인했다.

제품 코드 변경/확정 새 결함 없음; typecheck/development build 및 창 exit0. [세부 화면 수용 기록](editing-detail-ui-acceptance.md). 기본4칸/LF 격리 범위이며 탭/CRLF·타 확장/사용자 설정·별도 파일 package 변경·도구 누락/비활성화 화면은 열린 항목이다. 다음 주 작업은 보존 구조 내부 탐색/시간과 파형 동기화→두 화면 독립 수명→다른 TB·프로젝트 저장 보기 격리, 이어 사용자 프로필 및 실제 설계·메모리. 전체 A3/F 완료 아님; 깨끗한 OS 보류, VSIX/설치 없음.



## 최신 체크포인트 — 인자·package·기본 편집 화면 수용

2026-10-05: 격리 VS Code1.140.0 지속 저장 개발 창에서 function 두 번째 인자의 string/default, task output int, parameter int WIDTH=8 안내를 실제 화면으로 확인했다. implicit .clk/.rst_n 제외 후 count만 추천, package EXPORTED/helper/word_t 추천 및 Tab 수락을 확인했다. Source errors→Ready 복구, Language Status 메뉴/Retry 접근과 기존 end 중복 없는 Enter/한 단계 Undo, 주석·문자열의 일반 Tab/Undo도 확인했다. 초기 팝업 부재는 분석 완료 후 정상 표시되어 제품 결함으로 확정하지 않았다.

제품 코드 변경/새 결함 없음; typecheck/development build 통과, 개발 창 exit0. 근거는 [편집 화면 수용 기록](editing-ui-acceptance.md). 함수/parameter와 package는 명시적 안내 요청, task/implicit 포트는 실제 괄호/점 자동 트리거다. 모든 자동 트리거 완료로 확대하지 않는다. 다음은 if/always/for·주석/문자열 Enter·미저장 package 변경/import/중첩 scope 및 나머지 상태 화면, 이어 구조·시간/두 화면·저장 보기 격리와 실제 사용자 프로필/설계·메모리. 전체 A3/F 완료 아님; 깨끗한 Windows 보류, VSIX/새 설치 없음.



## 최신 체크포인트 — RTL Start 실행·취소 버튼 실제 수용

2026-10-05: VS Code1.140.0 격리 지속 저장 개발 창에서 테스트 선택/선택 실행/단일 Run/전체 Run All, 결과 로그·내장 VCD 열기 및 결과 재실행을 실제 키·마우스로 확인했다. native 정상6 PASS와 의도한 failed/timedOut/cancelled 각1을 기록했다. 실제 Stop 후 사본 경로의 하위 프로세스 부재 및 reset 재실행 PASS를 확인했다. 첫 Stop 시도는 입력 전에 시간 초과됐으므로 별도 취소 성공으로 세지 않았다.

새 제품 결함/제품 코드 변경 없음. 사용자 변경 예제를 보존하고 Core 템플릿으로 사본을 준비했다. typecheck/development build 통과, 개발 창 정상 종료 exit0, 생성물 사본 .rtl/ 내 확인. 근거는 [실행 버튼 수용 기록](execution-ui-acceptance.md). 전체 A3 완료 아님; 컴파일 실패 화면/준비·빌드 중 Stop/F5·사용자 프로필은 미수용. 다음은 남은 기본 편집/implicit 포트/parameter·function/task/package scope/분석 상태의 물리 화면, 이어 구조·시간/다른 TB·프로젝트 저장 보기 격리 및 실제 설계·메모리. 깨끗한 Windows는 별도 환경 없음으로 보류; 새 D4/E·VSIX/설치 없음.



## 최신 체크포인트 — 4,096신호 화면 수용·눈금 가독성 보완

2026-10-05: 격리 지속 저장 개발 창에서 4,096신호/786,432전이의 검색·마지막 신호 선택, 큰 정수 시간 이동/Edge, 확대·축소·좌우 이동·드래그 구간 확대, 두 커서 Δ, 범위 밖 시간 오류/복구를 실제 키·마우스로 확인했다. A3-WAVE-RULER-1의 긴 눈금 글자 겹침을 측정 폭 기반 배치로 보완하고 시간 입력에 Go 버튼을 추가했다. 정확한 BigInt 시간/원본 SHA와 기존 조회·저장 보기 경계를 유지한다.

검증: 관련24 PASS/0 fail/skip, typecheck/development build 통과; 수정 전후 개발 창 exit0. 합성 standalone 화면의 부분 수용이며 전체 A3/F·실제 설계/메모리·사용자 프로필 완료 아님. 근거/열린 항목은 [중간 파형 수용 기록](medium-waveform-acceptance.md). 다음은 RTL Start의 테스트 선택/Run/Stop/결과/재실행 버튼 실제 수용, 이어 남은 편집·저장 보기 격리/구조 연결 및 사용자 프로필. 깨끗한 Windows는 별도 환경 부재로 보류; 새 D4/E·VSIX/설치 없음.


## 최신 체크포인트 — 테스트별 파형 보기 저장·재시작 수용

2026-10-05: 격리 개발 창에서 한글 이름의 두 보기 저장/전환, 기본 지정, 선택 변경 표시를 실제 키·마우스로 확인했다. 지속 저장 개발 프로필에서 기본 보기 3신호가 창 재시작 및 새 CLI native 실행 결과에서도 복원됐다. extension test 모드의 메모리 저장 제한을 확인하여 실행기에 RTL_MANUAL_PERSISTENT/RTL_MANUAL_RESUME_ROOT를 추가했다. 제품 파형/Core 변경 없이 검증 실행기를 보완했다.

검증: typecheck/development build 및 관련 회귀5 PASS, native 예제 총5 PASS. 검증용 창 정상 종료 exit0. 전체 suite/전체 A3 완료 아님; 두 보기 모두의 재시작·다른 TB/프로젝트 물리 격리·GUI Run/Stop 수용은 남는다. 근거와 재현은 [저장 보기 수용 기록](waveform-view-acceptance.md). 다음은 4,096신호 실제 검색/선택/zoom/time 화면, 이어 남은 편집·실행/사용자 프로필 및 실제 설계/메모리 수용. 깨끗한 Windows는 별도 환경 없음으로 보류; VSIX/설치 없음.


## 최신 체크포인트 — A3-EDIT-OPEN-1 포트 추천 복구

2026-10-04: 미완성 인스턴스의 실제 slang 범위가 다음 source buffer로 넘어가 커서가 인스턴스 밖으로 처리되는 문제를 보완했다. 컴파일러가 확인한 인스턴스의 끝 범위를 원래 파일 EOF로 제한한다. 또 manifest test top에서 도달하지 않는 새 모듈은 모든 module의 기본 elaboration에서 누락된 source 위치만 추가한다. 실제 selected-top 시그니처는 우선 유지하고 generated/shared 위치의 서로 다른 타입은 기존 ambiguity 차단을 유지한다. 원본 파일/진단/계층/시뮬레이션 입력을 수정하지 않는다.

초기 관측 정정: 선택된 TB가 마지막 source buffer인 단순 EOF 문맥은 slang 자체가 이미 복구했다. 모든 EOF가 파서 실패였던 것은 아니다. 회귀 테스트에서 다음 파일로 넘어가는 end.file/end.offset을 직접 관측하여 원인을 확정했다. tests/semantic/recovery.test.ts는 closer 없음/괄호만 있음/endmodule 있음, parameter override, 한글·emoji UTF-16 offset, 미연결 제외, 새 모듈의 폭11과 .data( 인자 안내, 저장 소스 보존을 검사한다. tests/vscode/semantic.ts는 실제 LSP의 EOF . 추천·.tally( 안내를 추가 검증한다.

검증: 실제 slang13 PASS/0 fail/skip(.dev/port-recovery-semantic.log), 실제 editor/semantic/structure/waveform host run-qKTkGA receipt passed=true/editor=true/exit0(.dev/port-recovery-vscode.log), typecheck/development build 통과. 실제 키 검증 run-xtSwWB(VS Code1.140.0 격리 개발 프로필)에서 새 ui_probe의 닫는 구문 없는 EOF에 점 키를 눌러 count·rst_n Field 팝업과 output logic[7:0] 표시, 이미 연결한 clk 제외를 관측했다. .rtl/manual-input.json에 미저장 text/커서가 기록되어 있다. 정상 stop/exit0이며 manual receipt의 acceptancePassed=false는 전체 A3 수용 완료가 아님을 뜻한다.

다음 순서: 저장된 테스트별 파형 보기의 실제 UI/재시작 수용 →4,096신호 검색/선택/zoom/time 화면 → 사용자 프로필 충돌·실제 설계/메모리. parameter·function/task/package scope의 전체 물리 수용은 아직 남고, 깨끗한 Windows 종단은 별도 환경 없음으로 보류다. 이번에 전체 일반/Verilator/full-simulation suite를 재실행했다고 하지 않는다. VSIX/설치 없음. 새 큰 D4/E보다 남은 A3/F 수용을 먼저 진행한다.


## 최신 체크포인트 — A3 실제 키 입력 1차 확인

2026-10-04: computer-use의 실제 Windows 키 입력으로 격리된 VS Code 1.140.0 개발 창을 확인했다. module→Tab→이름→Tab→포트→Tab→본문, package/case 템플릿 필드 이동, begin→Tab(인라인)→Enter 및 begin→직접 Enter(들여쓴 본문/end)가 정상 동작했다. run-6ujQus의 .rtl/manual-input.json에 문서/커서 관측 기록이 있다. 사용자 중단 동안 이 창은 15분 제한으로 종료되어 완료 receipt가 없으며, 이를 수용 실패나 완료로 대신 해석하지 않는다.

재개한 run-bsLVeC에서는 설정된 counter_basic_tb의 미저장 .clk(clk), . 문맥에서 실제 점 키로 count/rst_n만 표시되고 이미 연결한 clk는 제외되는 팝업을 확인했다. Tab으로 count를 수락하고 인자 안내에서 output logic[7:0] count 강조를 확인했다. 이 실행은 정상 stop→exit0이며 extension-test.json의 manualHarness=true는 검증 창 종료만 뜻하고 acceptancePassed=false다. 이 실행 당시 recorder는 scratch만 기록하므로 TB 팝업 근거는 대화의 실제 screenshot/accessibility 관측이다. 이후 recorder를 격리 사본 안의 SV/V 문서로 확대하고 workspace 경로 검증/5,000건 제한을 추가했다.

발견한 제한 A3-EDIT-OPEN-1: 괄호/endmodule가 없는 EOF 작성 중에는 설정된 TB에서도 포트 추천을 관측하지 못했다. closer가 있는 동일 문맥에서는 동작한다. 또 현재 analyze는 manifest test top의 elaborated instance를 사용하므로 테스트에서 도달하지 않는 새 ui_probe 인스턴스는 추천 대상에 없었다. 실제 parser recovery/독립 모듈 편집 지원을 진단·회귀 검증한 뒤 보완할 것; 정규식으로 임의 시그니처를 추정하지 않는다.

개발 전용 RTL_MANUAL_ACCEPTANCE=1 idle harness를 추가했다(tests/vscode/manual.ts). 실행기가 창을 숨기는 원인을 찾아 수동 모드만 visible로 변경했고 자동 모드는 유지했다. 도구는 기존 .dev/rtl-dev, SystemVerilog/4-space lexical fixture, 다른 설치 확장 비활성화. 사용자 프로필 충돌·일반 function/task/parameter/package scope·저장 보기·중간 canvas·깨끗한 OS 수용까지 완료했다는 뜻이 아니다. typecheck 및 개발 build 통과, VSIX/설치 없음. 다음은 A3-EDIT-OPEN-1의 실제 slang 재현/보완 → 저장 보기/중간 파형의 물리 UI → 실제 설계/메모리 수용이다.


## 최신 체크포인트 — 현재 구현 종합 재검증

2026-10-04: 사용자 요청에 따라 새 D4/E 작업 전에 현재 지원 범위 전체를 재검증했다. 일반138/실제 slang12/실제 Verilator13 모두 PASS·fail/skip0, 최종 typecheck/development build 통과. 실제 전체 GUI 최종 run-krwREi(성공5/의도 FAIL1/취소1), 보존/include run-deQoAI(native2), 경로·중복 이름 다중 프로젝트 host-JdlchZ(native3),4,096신호 editor3회 run-uv8IAh 모두 receipt passed=true/exit0. 같은 전체 GUI fixture의 CLI check/개별/all/입력 비교/실패 exit1/manifest 없는 보존 hierarchy·trace/파형 손상 차단도 최종 통과(.dev/audit/cli-receipt.json: 같은 입력 지문·PASS3/의도FAIL1 추가).

발견/보완: AUD-FIXTURE-TS-1 — 전체 GUI fixture의 두 package에 시간 단위가 없어 GUI simulation은 성공했지만 후속 CLI 보존 hierarchy가 MissingTimeScale로 실패했다. fixture에 동일 timeunit/timeprecision을 추가하고 GUI package 실행 후 보존 구조 roots/trace-ready assertion을 넣어 새 run에서 GUI/CLI로 재검증했다. 초기 run-qblct1/CLI 실패는 보존하며 기존 archive나 사용자 소스/진단을 수정하지 않았다. AUD-HELP-2 — 구현된 rtl trace가 기본 도움말에 빠져 usage를 추가하고 build/실제 출력 확인.

중간 규모 reader와 반복8회/16 worker exit·원본 SHA 보존도 재검증했다(waveform-SPMS7L/lifecycle-YK4poq). 동시 GUI/native 부하 조건의 로컬 측정이며 이전 단독 측정과 성능 비율로 비교하지 않는다. 종료 후 높은 RSS의 제품 수용·실제 사용자 설계는 계속 열려 있다. 실제 키 입력/팝업/버튼/타 확장 충돌·캔버스·저장 보기 대화상자/재시작 수용은 자동 host로 대체 완료하지 않는다. 사용자 답변상 별도 PC/VM이 없어 깨끗한 OS 종단은 보류다. 종합 표/전체 근거/발견 문제는 [종합 검증](comprehensive-validation.md), 다음 실제 수용은 [체크리스트](manual-acceptance.md). VSIX/새 설치 없음.

다음 담당자는 이번 전체 suite를 이유 없이 다시 반복하지 말고 **A3 실제 사용자 프로필·중간 규모 화면 및 보기 저장 경험 → 실제 설계/메모리 수용 → 별도 환경 확보 후 깨끗한 Windows 종단**을 진행한다. 아직 첫 베타 준비/전체 제품 안정화 완료는 아니며 큰 D4/E 확장은 위 조건을 먼저 정리한다.

## 이전 체크포인트 — F1B 반복 수명·두 화면 닫기 안정화

2026-10-04: WaveformSession의 중복 dispose가 실제 worker 종료를 기다리지 않던 경합을 수정했다. error로 요청이 먼저 닫힌 경우에도 같은 종료 promise를 기다린다. 4,096신호 두 reader를8회 열기/닫기·불량 reload/재시도·queued 조회 중 닫기로 검증하여16/16 worker exit, 살아 있는 peer의 값/재읽기 및 원본 SHA 보존을 확인했다. 종료 후 process RSS는 약522~525MiB로 plateau였고 첫 cycle 대비 마지막+0.94MiB, 부모 heap+0.28MiB였다. 이는 누적 증가 미관측이며 초기55MiB 수준으로 메모리 회수가 완료됐다는 뜻은 아니다.

검증: 일반138 PASS/0 fail/skip 및 typecheck/build(.dev/f1-lifecycle-unit.log). .dev/scale-tests/lifecycle-kCgJq7/report.json passedCorrectness=true. 실제 보존/include GUI 최종 run-N3IrdK receipt passed=true/peerCloseReopen=true, native2 PASS: 실제 파형 탭과 구조 패널을 각각 닫고 다시 열어 peer reader/커서가 유지됨을 확인했다(.dev/f1-lifecycle-vscode-final.log). 실제4,096신호 custom editor3회 여닫기 run-rc8U1S receipt passed=true/mediumWaveform=true, 열기1.92~2.22초·host event-loop max31.69ms·원본 보존(.dev/f1-medium-vscode-final.log). 최초 medium run-RpWAvM은 테스트 cwd 경로 가정으로 fixture를 못 찾아 실패했고 확장 경로 기준으로 수정해 통과했다.

사용자는 별도 Windows PC/VM이 현재 없다고 답했다. 깨끗한 OS 승인 설치 종단은 환경 확보 전 **보류/미검증**이다. computer-use 초기화/창 관측을 시도했으나 격리 개발 창을 제어 가능한 창으로 찾지 못해 실제 키/캔버스 수용은 미완료다. 개인 프로필 신뢰 설정은 변경하지 않았으며 테스트 전용 숨은 개발 프로세스는 식별 후 정리했다. 다음은 **A3 일반 개발 실행의 물리 입력/추천·팝업·버튼 및 중간 규모 화면 수용**, 실제 프로젝트·메모리 회수 판단이다. F 전체/베타 준비 완료로 표시하지 않는다. CLI/full GUI/all-semantic은 이번에 재실행하지 않았고 VSIX/새 설치도 없다. 상세는 [안정화 검증](stability-validation.md).

## 이전 체크포인트 — F1 중간 규모 측정·취소/복구 기반

2026-10-04: 사용자가 초기 베타 대상 규모를 **RTL 수백 파일·파형 신호 수천 개**로 확정했다. 합의한 A3/F 필수 안정화에 진입했다. 재현 가능한 합성 VCD(256/4,096/8,192신호, 최대983,040전이)와 실제 slang의 생성 RTL256파일+top을 측정하고, 파형의 같은 시각 문자열을 공유하도록 중복 변환/저장을 줄였다. 미저장 폭 변경·진행 중 분석/파형 읽기 취소·실패 후 복구·원본 지문 보존을 확인했다. F1 전체/실제 사용자 설계/베타 수용 완료는 아니다.

최종 근거: 일반137 PASS/0 fail/skip 및 typecheck/development build; 실제 semantic 관련2 PASS/0 skip(.dev/f1-semantic-scale.log); 실제 보존/include VS Code run-bkh3j8 receipt passed=true, native 2 PASS, recordedValues/sharedCursor/traceInvalidation=true(.dev/f1-recorded-vscode.log). 파형 최종 .dev/scale-tests/waveform-0PfKkS/report.json: 4,096신호 두 reader 읽기1.24초·값p95 2.77ms·window p95 11.17ms·최고process RSS640.95MiB. 동일 격리 조건의 변경 전은1.47초/700.57MiB(.dev/f1-waveform-before.json). RSS는 부모+worker·실패 재시도 포함이며 VS Code 전체/worker heap/steady state 메모리가 아니다. 시간 목표는 로컬 임시 기준이다.

다음 순서: **반복 열기/닫기·메모리 회수와 두 view 자원 검증 → 실제 사용자 프로필 A3 입력/팝업/버튼·중간 규모 화면 수용 → 깨끗한 Windows 승인 설치 종단 → 사용자 준비 판단 후 베타 패키지**. 현재 환경으로 깨끗한 OS를 대신하거나 자동 host API로 물리 UI 수용을 대신하지 않는다. CLI/full GUI/전체 native는 이번에 별도 재실행하지 않았고 이전 날짜 근거를 유지한다. 새 설치/VSIX 없음. 재현 방법·전체 측정 표·열린 항목은 [안정화 검증](stability-validation.md)을 먼저 읽는다.

## 이전 체크포인트 — D3B2 보존 구조 값·파형 커서 연결

2026-10-04: 지원된 보존 실행의 integral module port/VCD 범위에서 D3B GUI 연결을 구현했다. 결과의 Explore Recorded Structure에서 카드/표의 포트 관측값을 보고 Time에 `5 ns`처럼 입력하여 Go/Enter로 이동한다. Open linked waveform은 내장 VCD를 명시적으로 열며 cursor A와 양방향으로 시각을 공유한다. current design에는 기록 값을 붙이지 않는다. missing/ambiguous/width-mismatch/unsupported는 추측값 대신 상태/이유를 표시하고 X/Z와 큰 정수 시간은 유지한다.

구현: VS Code API 없는 trace-links.ts가 Core 검증→같은 bytes의 worker SHA 확인→보존 입력 후검증을 조합하고 양쪽 host에 하나의 TraceCursorHub를 공급한다. run/보존 directory/source·trace 지문으로 격리, nonce/세대/값 요청 revision/파형 token으로 늦은 응답 차단, 최대200 표시 포트·32개 조회 batch, 30초 읽기 취소/닫기/reader 정리를 제공한다. 보존 inputs/metadata/파형/상위 디렉터리 watcher는 값을 무효화한다. trace만 손상되면 정상 구조/소스 탐색은 유지하며 파형은 Reload로 다시 열 수 있다. legacy/미지원 VCD는 일반 보기로 남고 FST는 기존 외부 경로다.

검증: 일반136 PASS/0 fail/skip, typecheck/development build 통과(.dev/d3b-gui-unit.log). 실제 보존/include VS Code 최종 .dev/d3b-gui-vscode-final.log / run-fSFRCq receipt passed=true, recordedValues/sharedCursor/traceInvalidation=true, exit0, native 2 PASS. 현재 manifest 없이 원본/package/header가 잘못된 상황의 값 조회·양방향 cursor·다른 실행 격리·파형 손상 차단/복원·기록 입력 손상·현재 모드 전환을 확인했다. 실제 full host .dev/d3b-full-vscode-final.log / run-6MUb5Z receipt passed=true/exit0, 성공5/의도한 실패1/취소1. 초기 full run-KrVsKg는 package preflight 중 취소하여 statuses=[]인데 fixture가 cancelled record를 요구해 실패했다. 시뮬레이션 시작 로그를 기다린 뒤 취소하도록 fixture를 보완한 최종 run은 통과했다. 물리 클릭/캔버스 시각 수용은 아니며 CLI/전체 native suite는 이번에 별도 재실행하지 않았다. VSIX/새 설치 없음.

다음은 합의한 A3/F 필수 안정화다. 새 D4/E 기능을 바로 늘리지 않고 실제 사용자 프로필의 키/추천/인자 팝업·버튼과 커서 시각 수용, 깨끗한 Windows GUI 승인 설치→실행→파형, 실패/취소/재시도와 대표 설계 응답성·메모리·데이터 보존을 점검한다. 아직 베타 패키징 gate 통과는 아니다. D3B의 첫 지원 범위 완료와 전체 제품 안정성을 구분하며 FST/내부 신호 전체/클럭 재생/실제 step/MAC/독립 host는 후속이다.

## 이전 체크포인트 — D3B1 분석·값·커서 기반

2026-10-04: D3B를 나누어 첫 기반 범위를 구현했다. WaveformSession.loadVerified는 Core가 검증한 Uint8Array를 worker에 복사하여 전달하고 worker가 같은 바이트의 SHA256을 다시 확인한 뒤 파싱한다. 파일 경로를 재개방하지 않는다. worker 요청을 순서대로 처리하고 새 load 실패 시 이전 데이터를 지워 과거 값 재사용을 차단한다. values/queryValues는 최대32개 신호의 지정 시간 관측값만 반환하며 전이/viewport를 전달하지 않는다. X/Z·alias·정확한 큰 정수 시간·end=0을 유지한다.

VS Code 독립 TraceCursorHub는 보존 directory(Windows host가 정규화)·run UUID·source fingerprint·trace SHA256이 모두 같은 view만 연결한다. 시간/end/timescale 검증, revision·dispose·invalidation·멤버/그룹 제한을 제공하며 손상으로 무효화된 이전 연결은 새 그룹을 되살릴 수 없다. 이것은 파일 검증/권한 계층이 아니다. host는 Core 검증과 보존 semantic 문맥을 공급하고 파일 변경·취소·늦은 응답을 별도로 처리해야 한다.

검증: 일반128 PASS/0 fail/skip, typecheck/build 통과(.dev/d3b-foundation-unit.log). 실제 Verilator+slang 관련2 tests PASS/0 skip(.dev/d3b-foundation-native.log), .dev/d3b-foundation-native-receipt.json passed=true: 현재 manifest 제거/원본 손상 후 검증 바이트를 worker로 읽어 7개 instance/generate/array/escaped-dot 포트 값 대조, 양방향 커서 모델·다른 프로젝트 격리·무효화 확인. 이번 GUI/CLI host suite/물리 UI는 재검증하지 않았다. D3A GUI/CLI는 이전 날짜 근거다. 새 패키징/설치 없음.

다음은 D3B2 GUI 연결: structure.ts의 보존 문맥에서만 Core loadRecordedInputs/loadRecordedTrace→worker.loadVerified→mapTracePorts로 관측값을 표시하고, waveform.ts와 같은 hub를 공유한다. stale/세대/nonce/revision/취소·닫기·trace/source watcher로 연결과 늦은 응답을 차단하고 missing/ambiguous/width-mismatch/unsupported를 명시한다. 보통/legacy/FST 파형 보기와 현재 구조는 유지한다. 현재 GUI에는 값이나 공유 커서가 아직 없다. D3B 전체 완료로 표시하지 않는다. D3B2 후 A3/F 필수 안정화→사용자 준비 판단 후 첫 베타 패키지→피드백 보완 순서를 유지한다.

## 이전 체크포인트 — D3A

D3A 첫 범위 완료 (2026-10-04): 새 실행은 source snapshot과 run ID에 연결된 waveform hash/size/format을 기록한다. 공통 Core가 변경·교체·다른 run·과거/미지원 trace를 검증하며 정상 로그/파형 보기는 유지한다. waveform의 VS Code 독립 mapTracePorts가 정확한 segmented instance/port 경로로 VCD를 연결한다. bare top/명시적 TOP wrapper, alias, generate/instance array, escaped dot를 지원하며 missing/ambiguous/width-mismatch/unsupported는 값을 추측하지 않는다. 현재 범위는 integral module ports와 ready snapshot의 VCD이며 내부 신호 전체/FST 매핑/GUI 값 표시는 아니다.

검증: 일반122/typecheck/build 통과(.dev/d3a-unit.log), 실제 Verilator VCD+slang hierarchy 관련2 native tests 통과(.dev/d3a-native.log 및 .dev/d3a-native-receipt.json). final native에서 동일 모듈 2개·generate 2개·array 2개·escaped dot의 경로와 값을 확인했다. actual recorded/include GUI run-jzzec5 receipt passed=true/recordedTrace=true/exit0(2 PASS), CLI .dev/d3a-cli-receipt.json은 두 기록 각3 port matched, 현재 manifest 없이 분석·파형 변경/다른 run/legacy 차단을 확인했다. 물리 UI 검증이 아니며 full native/full GUI suite 재실행은 이번에 하지 않았다.

초기 native의 일반 경로는 통과했으나 escaped 이름은 pretty-print hierarchicalPath에 backslash/공백이 남아 missing이었다. semantic instancePath를 compiler symbol.name에서 만들고 array index만 실제 부모와 합쳐 재검증하여 matched로 통과했다. 기존 navigation id/표시 경로는 유지했다. hierarchy port에 기존 signal_type 모델도 공급한다. 매핑 모델 자체는 인증 계층이 아니므로 모든 소비자는 Core loadRecordedInputs/loadRecordedTrace와 archived hierarchy 검증을 거쳐야 한다.

다음은 D3B: 보존 구조의 port 관측값과 waveform 공유 cursor UX. worker가 실제 분석한 bytes와 검증한 trace hash를 일치시키고 current/recorded·run·세대/취소를 분리한다. source/trace 손상 시 값 연결을 차단하며 정상 구조/로그/파형을 가능한 범위에서 유지한다. 이후 새 기능 추가를 멈추고 A3/F 필수 안정화 검증→첫 베타 패키지→실사용 문제 보완→초기 안정 버전 판단 순서다(사용자 합의). 이번에는 VSIX/새 설치를 하지 않았다.


## 이전 체크포인트 — D2B3B

D2B3B configured literal include 보존 완료 (2026-10-04): 프로젝트 내부 `sources.include_dirs`의 순서와 전체 파일 트리를 실행 사본으로 옮기고 빈 configured root도 유지한다. standalone quoted literal include는 첫 configured 경로를 쓰며 하위 경로(`nested/width.svh`)도 지원한다. 사본 package 분석·빌드·기록 구조가 같은 include 사본을 사용한다. 원본 설정/헤더가 바뀌거나 없어도 검증된 보존 구조와 readonly 헤더를 열 수 있다.

지원 경계: 소스/헤더 옆 파일과 첫 configured 결과가 충돌하면 unavailable, configured 경로 없이 source-relative만으로 찾는 경우도 unavailable이다. dynamic/inline/매크로 본문/continued directive·absolute/`..`/backslash 경로·외부 source/include root·symlink/junction 경로는 보존 지원에서 제외하고 기존 실행+이유를 유지한다. 주석/일반 문자열 속 include 텍스트는 더 이상 일괄 차단하지 않는다. inactive includes와 전체 include tree는 보수적으로 관측하여 불필요한 파일도 비교/용량에 포함될 수 있다. 완전한 전처리기나 글로벌 atomic save/tool environment/runtime data 보존은 아니다.

검증: 일반117/typecheck/build, 실제 native 1 test(원본 baseline + VCD/FST 사본 2, 실제 slang hierarchy/port 8-bit 검증), actual VS Code run-rskbus(2 PASS·recordedIncludes=true·receipt passed=true/exit0), CLI 두 기록 matching→changed/현재 manifest 없는 hierarchy 통과. `.dev/d2b3-include-unit.log`, `d2b3-include-native.log`/`.dev/d2b3-include-native-receipt.json`, `d2b3-include-vscode.log`, `d2b3-include-cli.log`/`.dev/d2b3-include-cli-receipt.json`. 초기 native test는 hierarchy에 없는 signalType 필드를 검사해 실패했고, 실제 instance semantic 모델로 폭을 검증하여 통과했다. 물리 UI 수용/전체 native·full GUI suite 재실행과 구분한다.

새 예제: `examples/include-counter` (package 자동 정렬 + 두 configured root의 동일 이름 헤더 + nested include + 2 TB). 폭이 잘못 선택되면 `$fatal`로 실패한다. GUI 재현은 RTL_RECORDED_TEST=1와 RTL_RECORDED_INCLUDE_TEST=1, 기존 scripts/test-vscode.mjs. 다음은 D3A 보존 run/trace 식별·full instance path 매핑의 작은 범위다. ready snapshot이 없는 기존/미지원 실행은 현재 소스에 자동 결합하지 않는다. FST 내장 해석·클럭 재생·MAC 연산·독립 IDE 호스트는 후속이며 VSIX 배포·새 설치는 수행하지 않았다.


## 이전 체크포인트 — D2B3A

D2B3A package 보존 완료 (2026-10-04): 프로젝트 내부 package 파일도 실행 소스 사본으로 보존한다. 자동 순서는 원본 preflight 이후 사본에서 기존 package provider로 다시 분석하며, 실제 빌드 순서로 지문·result.sources를 기록한다. 사본 분석 실패/취소는 원본 재시도 없이 FAIL/cancelled다. manifest 수동 순서도 지원한다. 결과 GUI/CLI 구조 분석과 readonly package 소스 이동은 검증된 사본만 사용한다.

검증: 일반112/typecheck/build 통과, 실제 native 관련2 tests(3 PASS 실행·package 병렬2/명시적 소스1), 실제 package GUI run-WhaR8u receipt passed=true/recordedPackages=true/exit0(2 PASS), 실제 CLI matching→changed/현재 manifest 없이 두 보존 hierarchy 통과. `.dev/d2b3-package-unit.log`, `d2b3-package-native.log`, `d2b3-package-vscode.log`, `d2b3-package-cli.log`/`d2b3-package-cli-receipt.json`. 전체 native/full GUI suite 재실행은 이번에 하지 않았고, 이전 D2B2 full GUI는 과거 기준점이다. 물리 UI 수용 검증은 아니다.

실제 native 첫 검증에서 예제 package에 timeunit/timeprecision이 없어 slang MissingTimeScale로 구조 분석이 막혔다. examples/package-counter의 세 package에도 DUT/TB와 같은 시간 단위를 선언하고 native/GUI/CLI로 재검증했다. Windows 대소문자 파일명 매핑과 사본 분석 실패/취소도 일반 회귀에 추가했다.

다음은 D2B3B literal include 보존 계약이다. includeDirs/모든 `include 문자열(주석 포함)/외부 경로는 아직 unavailable fallback이며 일반 실행은 유지한다. include 탐색 우선순위·shadowing·nested relative 해석을 두 adapter와 일치시키기 전 지원 확대를 선언하지 않는다. D3 trace 값/클럭/MAC는 미구현이다. 배포 패키징·새 도구 설치는 수행하지 않았다.


## 최신 추가 — D2B2

D2B2 보존 실행 GUI 구조 탐색 완료 (2026-10-04): 결과 메뉴 Explore Recorded Structure가 특정 run의 검증된 Project/TestTarget을 기존 SlangProvider에 전달한다. 현재 manifest/미저장 overlay를 읽지 않고 화면·tree·탐색 이력을 current/recorded 및 run ID로 구분한다. 현재 원본 변경은 보존 view를 덮지 않으며 보존 입력 변경/손상은 stale·재검증 실패로 이동을 차단한다.

최신 검증: 일반108/typecheck/build 통과. 실제 보존 GUI run-A2LYPy(2 PASS + archived 구조/readonly 정의/손상 차단/현재 전환) 및 전체 GUI run-gQnoQ5(성공5/의도한 실패1/취소1) receipts passed=true/exit0. `.dev/d2b2-final-unit.log`, `.dev/d2b2-final-recorded-vscode.log`, `.dev/d2b2-full-vscode.log`. 실제 host API 검증이며 물리 UI 수용은 아니다. Compiler/runner/CLI 동작은 바꾸지 않았고 이전 native11/CLI receipts는 과거 근거로 유지한다.

보존 구조의 instance/definition/port/parameter source 링크는 공통 recorded-source host를 통해 당시 사본의 정확한 위치를 readonly 문서로 연다. Core가 검증한 sourceMappings 외의 파일은 열지 않고 URI는 run directory까지 포함해 중복 ID/다중 프로젝트를 분리한다. Explore current design은 명시적으로 현재 문맥으로 돌아간다. 다음은 D2B3 include/package 보존 계약; 값/클럭/trace 연결은 여전히 후속이다.

## 최신 추가 — D2B1

D2B1 보존 소스 첫 범위 (2026-10-04): Verilator가 프로젝트 안의 명시적 소스 사본을 `.rtl/runs/<run>/inputs/`에서 빌드한다. 원본이 컴파일 직전 바뀌어도 결과와 사본의 연결이 유지된다. include 디렉터리·include 문자열·package 그룹·외부 경로는 아직 보존을 지원하지 않으며 기존 입력으로 실행하고 inputSnapshot=unavailable/이유를 기록한다. 기존 backend는 capability opt-in 없이 사본으로 전환하지 않는다.

최신 근거: 일반105/typecheck/build, native11, 보존 GUI run-VwRA80 receipt(2 PASS/readonly type 경로), CLI d2b-cli-receipt(2 PASS/현재 manifest 없이 archive hierarchy) 통과. 초기 전체 host run-xSyxi3에서 취소가 정리 지연 중 timedOut으로 바뀌는 문제를 발견해 timer 우선순위를 수정했고 final unit에 slow-cleanup 회귀를 추가했다. 실제 전체 suite 재검증 최종 근거는 verification 상단을 따른다. 초기 WorkspaceEdit 기반 readonly 테스트는 실패했으며 사용자 type 경로의 최종 테스트만 수용 근거다.

최종 전체 VS Code도 통과: `.dev/d2b-final-vscode.log`, run-XDlo5D receipt passed=true/exit0, 성공5/의도한 실패1/취소1. 취소 결과는 cancelled로 유지됐고 이번 fixture의 정리는 756ms였다. MSYS2 지연 전체를 해결했다고 확대하지 않는다. 일반105·native11·보존 GUI2 PASS·CLI2 PASS와 함께 verification 상단을 최신 기준으로 사용한다.

Core loadRecordedInputs는 run/result·원래 설정·파일 해시·경로/심볼릭링크·추가 파일을 검증하여 같은 top/defines/waveform의 Project/TestTarget을 반환한다. CLI hierarchy --run RUN_ID는 이 입력을 기존 SlangProvider에 전달하며 현재 rtl.toml 없이도 동작한다. GUI 결과의 Open Recorded Source는 당시 첫 테스트벤치 사본을 rtl-recorded 읽기 전용 문서로 보여준다. 현재 구조와 파형의 자동 결합은 아직 하지 않는다. 다음은 D2B2 보존 실행의 GUI 구조 탐색 및 include/package 지원 계약이다.

## 최신 추가 기록 — D2A

D2A 입력 식별 첫 범위 구현 (2026-10-04): 공통 Core runner가 runId와 versioned SHA256 입력 지문을 결과에 저장한다. 저장된 sources/packages/test sources·include 경로/트리와 literal include 의존성·defines·top·backend/timing/waveform을 추적하고 실행 전후 변경을 구분한다. 결과 메뉴 Check Source Version 및 CLI history --verify-inputs가 같은 비교 모델을 사용한다. 과거/미지원 identity는 로그·파형을 보존하면서 legacy/unavailable로 안내한다. 미저장 입력은 GUI에 별도 안내하며 자동 저장하지 않는다.

최신 검증: 일반100/typecheck/build, 실제 Verilator 통합10, 실제 VS Code 전체 suite(성공5/의도한 실패1/취소1), 실제 CLI 두 테스트와 일치→변경 비교 모두 통과. `.dev/d2-final-unit.log`, `.dev/d2-integration.log`, `.dev/d2-vscode.log`/run-mskgxC receipt, `.dev/d2-cli.log`/d2-cli-receipt.json. 실제 host는 API 기반이며 물리 UI 수용은 아니다.

지문은 원자적 compiler snapshot이 아니다. 동적/찾을 수 없는 include·symlink·크기 제한은 unavailable, 실행 중 변경은 changed-during-run이다. 전후 관측 사이 변경 후 원복/도구 환경/모든 implicit backend 입력은 보장하지 않는다. matching은 과거 trace와 현재 diagram 결합 허가가 아니다. 다음은 D2B 불변 입력과 semantic/run 문맥 일치 계약이며 D3는 아직 시작하지 않는다.

## 최신 추가 기록 — 2026-10-04 D1

D1 계층 탐색의 첫 범위를 구현·검증했다. 내부 보기/더블클릭, 전체 인스턴스 경로, 뒤로/앞으로/상위, 테스트 변경 시 이력 초기화, 갱신 후 가장 가까운 잔존 부모 복귀를 제공한다. generate/instance array도 실제 부모 관계를 따른다. 일반 94개·최종 관련 12개·typecheck/build와 실제 VS Code 전체 suite(성공 5/의도한 실패 1/취소 1)를 통과했다. 증거는 verification 상단. 이 기록이 아래 과거 감사보다 최신이다.

D1은 정적 구조 탐색이며 run/source 일치·파형값 연결·클럭 재생·MAC 내부 연산 모델은 아직 미구현이다. 다음은 D2. 물리 입력/팝업/canvas, 완전 GUI 설치, 깨끗한 OS, 큰 설계 수용 검증은 계속 미완료다.

검증: 2026-10-03, Windows x64, 현재 작업 폴더. 대상은 현재 개발 호스트와 구현된 기능이며 독립 IDE 전체의 완료 판정은 아니다. 제품 코드는 이번 감사에서 변경하지 않았다. 배포/VSIX 설치와 새 도구 설치도 수행하지 않았다.

## 판정

**10-04 실제 설치 후속 완료:** 사용자 재개 요청에 따라 fresh-tools 독립 MSYS2/Verilator/GCC 설치와 RTL smoke 검증 통과. 새 도구 native integration 10개, 실제 VS Code 전체 suite(성공 5/의도한 실패 1/취소 1), CLI check/개별/all(3 PASS/VCD) 통과. 기존 설치→독립 새 설치 전환/다중 workspace도 PASS 3개로 검증했다. 두 설치의 compiler 버전은 5.050으로 동일하다. 최신 receipts/실행 근거는 verification 상단. 현재 PC의 새 tool storage 검증이며 깨끗한 OS/GUI 설치 확인부터 파형까지의 물리 수용은 아니다. GTKWave UI 접근은 computer-use 앱 승인 시간 초과로 검증하지 못했다. 새 설치 승인은 이미 해소했다.

**10-04 추가 검증:** 실제 VS Code에서 toolsDirectory A→B 변경 후 native build/run과 두 workspace의 중복 이름 테스트를 확인했다 (PASS 3개, host-SAlcqJ receipt). B는 같은 MSYS2 바이너리로 연결한 다른 경로이며 버전 업그레이드 검증이 아니다. 실제 HTTP 다운로드 취소/재시도와 provider 실패 후 잠금 정리, 기존 GTKWave 버전 검증도 통과했다. 일반 85개·typecheck 통과. 현재 개발 호스트 물리 입력은 computer-use에서 해당 창을 찾지 못해 미완료이며, 새 저장소 설치는 사용자 재개 요청 후 실제 RTL smoke 검증까지 통과했다. 깨끗한 Windows 성공 설치로 확대하지 않는다. 상세 증거는 verification 상단.

**10-04 후속 보완:** AUD-CACHE-1/AUD-CLI-1 수정. 설정 listener가 공유 toolsHome을 즉시 갱신하고 verified 캐시를 지운다. 진행 중 검증/설치는 generation이 일치할 때만 캐시를 저장하며 현재 작업에는 로컬 Toolchain을 반환한다. 다음 실행은 다시 검색/검증한다. CLI check는 IDE 내장 VCD와 외부 FST viewer를 구분한다. 일반 82개·typecheck/build 통과 (`.dev/audit-fix-unit.log`); 추가 회귀 6개는 재사용/무관 설정/수동 경로 변경/검증·설치·실행 도중 변경/설치 거절과 실제 CLI entry point check 출력을 확인한다. 실제 VS Code 전체 suite도 통과 (`.dev/audit-fix-vscode.log`, run-PU4KDL receipt passed=true/exit 0, PASS 5/의도한 FAIL 1/취소 1). 아래 미수정 표는 10-03 감사 당시 기록이며 Windows 실물 compiler 교체/깨끗한 설치 수용은 별도로 미검증이다.

현재 지원하는 예제/검증 문맥에서 핵심 편집→실행→결과→파형 흐름은 정상 동작한다. 실행한 테스트 중 실패/skip은 없다. 예상 실패 테스트는 FAIL 결과와 실패 종료 코드를 확인하는 성공한 검증이다. 단위 테스트만으로 내린 판정이 아니라 실제 slang, Verilator와 VS Code 호스트 결과를 포함한다.

다만 사용자 실제 프로필의 물리 키/추천창 수용, 깨끗한 Windows 설치 흐름, 실제 대규모 설계와 다중 workspace는 완료로 판정하지 않는다. 아래 코드 검토 사항은 감사 당시 미해결이었으며 10-04 후속 보완에서 수정했다. 지원한 좁은 범위의 통과를 모든 SystemVerilog 문맥이나 최종 제품 완료로 확대하지 않는다.

## 이번에 새로 실행한 검증

| 영역 | 실제 결과 | 근거 |
|---|---|---|
| TypeScript / 개발 빌드 | 통과 | tsc --noEmit, scripts/build.mjs |
| 일반/adapter/host mock | 76 pass, fail/skip 0 | `.dev/recheck-unit.log` |
| 실제 slang | 11 pass, fail/skip 0 | `.dev/recheck-semantic.log` |
| 실제 Verilator 통합 | 10 pass, fail/skip 0 | `.dev/recheck-integration.log` |
| 실제 VS Code + Verilator | 전체 suite 통과, 실행 결과 7개 | `.dev/recheck-vscode.log`, run-SKYUOY receipt |
| 실제 CLI | check/개별/all 종료 0, 예상 실패 종료 1 | `.dev/recheck-cli.log` |

Verilator 통합은 package 자동 순서/병렬 격리, 두 예제 VCD, 선택 FST, 파형 비활성화, 컴파일 오류, assertion 실패, 파형 미생성, 실제 시뮬레이션 취소/시간 초과, 한글·공백 경로와 생성물 경계를 확인한다. 일반 process test는 취소 후 자식 프로세스 종료도 확인한다.

VS Code는 module/인자 필드, begin Tab/Enter/Undo, class/fork 선택과 탭·CRLF, closing label, enum case 생성, 미연결 포트 추천, 연결 신호 순위, 모듈/parameter/function/task 인자 안내, 미저장 package/scope/diagnostic, 언어 준비 상태, 계층/정적 diagram/소스 이동, 내장 VCD와 실행 UI를 확인한다. 실제 시뮬레이션 결과는 PASS 5개, 의도한 FAIL 1개, 취소 1개이며 전체 검증 receipt는 passed=true다.

CLI는 GUI 검증 프로젝트를 생성물 없이 격리 복사해 같은 두 top/테스트를 실행했다. 개별 1회 + 전체 2개가 PASS/VCD를 생성했고 의도한 fatal은 FAIL/종료 1이었다. 결과 모델의 name/top/status/waveform 의미가 GUI와 일치한다. 실행 ID/경로/시간/로그의 바이트 일치를 주장하지 않는다. 복사 프로젝트 최상위 파일은 `.gitignore`, `.rtl`, README, rtl, rtl.toml, tb이며 생성물이 밖으로 새지 않았다.

실제 VS Code receipt: `.dev/vscode-tests/run-SKYUOY/project/.rtl/extension-test.json`, passed=true, test process exit 0. CLI fixture: `.dev/recheck/CLI 한글 i0PVsu`. `.dev` 자료는 다른 PC에 없을 수 있으므로 재현 테스트와 제품 소스를 기준으로 인수한다. 임시 CLI 감사 도우미는 `.dev/recheck-cli.mjs`다.

## 10-03 코드 검토에서 찾은 보완 사항 — 당시 미수정, 10-04 보완 완료

| ID | 우선순위 | 문제와 근거 | 다음 조치 |
|---|---|---|---|
| AUD-CACHE-1 | 중간, 다음 기능 전 권장 | 한번 검증된 toolchain은 `extension.ts` ensureTools의 `if (verified) return verified`로 재사용된다. Choose Tool Storage Folder/Verify/Install 명령은 캐시를 지우지만 수동 `rtl.toolsDirectory` 설정 변경에는 실행 계층의 무효화 listener가 없다. semantic restart는 공유 toolsHome을 새 경로로 바꾼다. 따라서 표시/semantic 경로는 새 값인데 시뮬레이션은 이전 compiler/env를 사용할 수 있다. | 설정 변경 시 명시적으로 캐시 무효화; 진행 중 실행은 기존 snapshot 유지, 다음 실행부터 재검증. 설정 변경/거절/재실행 회귀 추가. |
| AUD-CLI-1 | 낮음 | `cli.ts:98`은 GTKWave가 없으면 파형을 열려면 viewer가 필요하다고 안내한다. 현재 IDE의 내장 VCD와 외부 FST를 구분하지 않아 오해를 줄 수 있다. | VCD 내장 열기와 FST 외부 viewer 필요성을 구분한 문구로 수정. |

위 두 항목은 코드 경로 검토에서 확인한 사항이다. 수동 설정 변경 후 실제 Windows compiler 교체와 GTKWave 없는 깨끗한 설치를 이번에 종단 재현하지는 않았다. 정상 설정의 전체 검증이 통과한 것과 이 결함 경로가 해결된 것은 별개다.

## 구현되었지만 지원 범위가 좁은 기능

- enum 생성은 단순 enum 신호의 빈 일반 case만 지원한다. 기존 항목 보충/복잡한 표현식은 제외한다.
- closing label과 class/fork 템플릿은 macro/기존 closer/복잡한 구문에서 보수적으로 생략한다. class 템플릿은 class semantic 기능이 아니다.
- 포트 연결 순위는 폭/부호/2·4-state 기반이며 전체 대입 호환성이나 output 쓰기 가능성을 판정하지 않는다.
- 내장 파형은 제한된 VCD 읽기이며 FST 내장/live trace는 미구현이다. 테스트별 저장 보기는 현재 프로필의 로컬 설정이다.
- C3는 빌드·실행을 하나의 상태로 보여주며 대상 선택을 재시작 후 저장하지 않는다. 최초 저장/대상 확인은 Stop 대상이 아니다.
- 실제 host 검증은 명령/API·데이터·editor lifecycle을 확인했다. 모든 파형 캔버스/색/커서/저장보기 버튼을 사람이 클릭한 시각 수용 검증은 아니며, 디자인의 직관성은 별도 실제 사용 평가가 필요하다.
- 구조 diagram은 정적 계층/연결과 검증된 보존 VCD 포트 관측값/공유 cursor A(D3B2)를 제공한다. 내부 신호 전체·클럭 재생·실제 step·MAC 연산 모델은 후속이며 A3/F 수용을 먼저 진행한다.

## 추천 실행 순서

1. AUD-CACHE-1/AUD-CLI-1 보완은 10-04 구현 및 회귀 검증했다. 상세 증거는 후속 verification 기록을 따른다.
2. 사용자의 실제 개발 프로필에서 A3 키 입력/팝업/선택 UI 수용을 확인한다. 자동 host API 통과를 대체 근거로 삼지 않는다.
3. D1/D2/D3B 첫 지원 범위 구현은 완료했다. 새 D4/E 기능 전에 A3/F 필수 안정화와 베타 준비 조건을 점검한다.
4. 큰 설계 응답성과 깨끗한 Windows 설치/거절/복구는 별도 수용 환경에서 검증한다. 배포 여부는 사용자가 결정한다.
