## Pulse (beta) Setup 전달 완료 (2026-10-16)

사용자 배포 요청으로 DOM 상태/강제 클릭 검증 명령·계측 및 개발 확장 payload를 제품에서 제외했고 최신 Setup을 생성했다. 전체435 PASS/1 POSIX SKIP·0 FAIL/0 CANCEL, 본체 타입0 errors, Inno6.4.1 exit0·EXE/hash 대조 PASS다. 최신 산출물 포인터는 `release/latest-installer.json`이다. 기존 native verification helper의 제거된 명령 의존은 역사적 경로이며 배포 앱에 hook을 다시 넣어 검증하지 않는다. 실제 실행/설정·언어/도구 오류 확인은 유지한다. 현재 candidate에 묶인 타입/회귀 증거+전체 hash/policy 통과 후만 Setup을 만들며 [최신 결과·산출물·재개](../docs/pulse-beta-20261016.md)가 기준이다. 제어판 이름 Pulse (beta), 기존 AppId/프로필/경로 보존. 새 화면·실제 설치/업로드는 별도다.

## 프로젝트 모듈 이름 추천 (2026-10-16)

SemanticContinuity의 ModuleCatalog는 위치별 후보 pool과 별개로 compiler-confirmed root definition 이름만 보존한다. 최대4,096개/serialized UTF-16 계산1MiB/root·기존 최대2 root 경계다. 빠른 module item/generate 판별은 lexical 보조이며 semantic scope로 설명하지 않는다. rename/삭제·directive/외부/설정 무효화와 정확한 진단/hover/이동 gate를 유지한다. [검증·실행·한계](../docs/pulse-module-catalog-completion.md)가 최신이며 새 화면/설치·배포 없음.

## 편집 중 의미 표시·추천 연속성 (2026-10-16)

언어 server는 최신 정확성 모델과 SemanticContinuity 표시 snapshot을 분리한다. module token 위치 매핑·검증된 기존 포트·동일 identifier/qualifier 후보를 유지하지만 이전 타입/위치를 진단·hover·이동에 쓰지 않는다. 최대2 root/각16문서·8MiB 계산 예산이며 외부/설정/선언 변경은 보수적으로 폐기한다. 전체420 PASS/1 POSIX SKIP·최종 관련40 PASS·language build0. [한도·조사·실행·검증·잔여](../docs/pulse-semantic-continuity.md)를 우선 읽는다. 새 화면·설치·배포 없음, 실제 UI/부분 compiler 증분은 잔여다.

## 자동 추천 표시·패키지 namespace 보완 (2026-10-15)

사용자 Ctrl+Space 의존 증상에서 빈 첫 결과 뒤 visible-widget만 갱신한 경로, snippet 중 quick suggest 차단 기본값, 일반 lookup에서 누락된 unimported package 이름을 확인했다. 실제 native pending typing intent(10초, Esc/이동/포커스/Code 전환 보호)·RTL 자동 추천 설정·project package 명시 열거·LSP 전체 후보 pool/로컬 필터를 연결했다. 패키지·bare-dot 미완성 포트의 actual compiler/LSP PASS. 전체413건412 PASS/0 FAIL/1 POSIX SKIP, 이후 expiry/native/restore 관련15 PASS(합산 금지)·runtime/language build0·최종 전체 본체 타입/emission0 errors. 최초 실패는 fixture의 native helper 누락/callback binding을 보완하고 전체 재실행했다.

최신 실행은 `ide/Start-Pulse.cmd`와 `.dev/latest-launch.json`을 기준으로 하며, 아래의 고정 후보 경로/이미 열린 목록만 갱신 설명은 이전 단계다. UI/Computer Use·Setup 실행 없음. 최초 정밀 분석 시간·부분 compiler 증분은 별도 잔여이고 새 자동 popup은 사용자 직접 체험 대상으로 남긴다. [원인·동작·검증·현재 실행](../docs/pulse-automatic-completion.md).

## 모듈 자동완성 입력 위치 보완 (2026-10-15)

사용자가 속도 개선 체감을 확인했다. 모듈 추천의 `instance_name` 문구를 제거하고 빈 인스턴스 이름 위치→Tab→포트 괄호 안의 순서를 유지했다. language build0·관련5 PASS·실제 Code-OSS snippet parser 빈 위치/순서 PASS. 새 화면은 열지 않았다. 언어 bundle만 갱신한 별도 로컬 앱의 파일/무결성·CLI·최신 실행 경로 검사를 마쳤으며, 최신 경로는 `ide/.dev/latest-launch.json`/`ide/Start-Pulse.cmd`를 기준으로 한다. 아래 고정된 이전 후보 경로는 과거 이력이다. [현재 수정·검증·실행 안내](../docs/pulse-performance-final.md).

## H7 첫 추천·초기 화면 보완과 최신 실행본 준비 (2026-10-15)

첫 query의 중복 실경로·전체 파일 좌표 변환·native scope 접근과 root module 이름 조회를 줄였다. 과도한 owning-instance 후보 분류는 계측상 악화해 제거했다. Simulation provider/Explorer는 유지하고 버튼·설정 DOM은 첫 진입으로 미뤘다. 전체406건405 PASS/0 FAIL/1 POSIX SKIP, 이후 resource/launch/overlay 관련8 PASS(합산 금지)·runtime/language build0·전체 native 타입/emission0 errors·compiled 정책 PASS. Windows 합성200파일의 첫 정밀 조회109~205ms·반복 중앙값2.95ms이며 실제 UI 수치는 아니다.

공식25 bundle·2,564파일 inventory·10 integrity·headless native/RTL CLI 두 top 검사 PASS. 최신 `ide/Start-Pulse.cmd`는 별도 `.dev/pulse-bundled-9G7Hqv`의 built 앱을 실행한다. 개발 소스 인자/VSCODE_DEV 없이 고유 native cache key와 기존 전용 프로필을 사용한다. 기존 Pulse 창을 정상 종료하고 실행한다. GUI/Computer Use/Setup 실행 없음. 다음은 사용자 직접 체험→문제 보완/필요 시 승인된 통합 화면 확인→사용자 요청 후 Setup이다. 부분 compiler 증분·최초 AST 준비·저장 watcher 중복·대표 실제 설계/Windows UI 성능은 잔여다. 아래의 E1/첫 query/startup 미구현 설명은 이전 기록이다.

[현재 코드·계측·실패 복구·최신 실행·잔여 검증](../docs/pulse-performance-final.md)를 우선 읽는다.

## H7 변경 후 compiler worker 재사용 적용 — 비화면 검증 완료 (2026-10-15)

source 편집 후 동일 worker에서 이전 모델/캐시를 해제하고 새 독립 compilation을 준비한다. id/revision·query별 soft cancel/15초 deadline·32슬롯·root hard cleanup·준비 중 open 정리 합류·64회 rebuild 후 교체를 연결했다. 최종 전체401건400 PASS/0 FAIL/1 POSIX SKIP·언어 build0·guarded overlay/compiled 정책/diff·9자산 launcher 준비/검사 PASS. Windows200개 작은 RTL의 모델 준비 중앙값은 새 worker502ms/재사용333ms였으며 첫 정밀 조회190~262ms는 남았다. 다음은 첫 정밀 조회 비용 분해/E2·E4 및 startup S1/S2다. 부분 compiler 증분/최초 정밀 조회/앱 startup·실제 UI 수용은 잔여다. [현재 계약·측정·검증·다음 순서](../docs/pulse-worker-rebuild.md)를 우선 읽는다. 화면/앱/Setup 실행 없음. 아래의 변경마다 worker 재사용이 미구현이라는 설명은 이전 기록이다.

## H7 편집 추천/분석 예약 분리 적용 — 비화면 검증 완료 (2026-10-15)

입력 중 추천 요청이 전체 분석을 앞당기거나 기다리는 경로를 built-in에서 분리했다. 일반400ms/구문 완료120ms debounce·최신 작업 하나·구 generation 게시 차단·이미 열린 suggest만 file/version/caret/focus 재검사 후 갱신을 연결했다. 최종 전체391건390 PASS/0 FAIL/1 POSIX SKIP·언어 build0·전체 native 타입/emission0 errors·compiled 정책/diff PASS,9자산 최신 launcher prepare/check 완료. 다음 구현은 같은 worker의 변경 후 rebuild와 최신 후보 준비 비용 감소이며 startup S1/S2도 잔여다. 부분 compiler 증분/같은 worker의 변경 후 rebuild·앱 cold startup 최적화·화면 수용은 아직 미완료다. 화면/앱/Setup 실행 없음. [현재 계약·검증·실패 복구·다음 순서](../docs/pulse-edit-scheduling.md)를 우선 읽는다. 아래의 모든 요청이 분석을 기다린다는 설명은 이전 기록이다.

## 프로젝트 시작·편집 성능 최신 정책 (2026-10-15 KST)

빈 창은 별도 프로젝트 진입이며 Code/Simulation으로 빠져나가지 않는다. 실행 중 공간 전환은 유지하지만 프로젝트/앱 종료 뒤 Pulse 공간·파형 탭/커서 세션 자동 복원은 사용자 요청으로 중단했다. 최근/실행 이력·보관 소스/파형·미저장 파일 복구는 보존한다. compiler 모델/범위 조회를 input generation 안에서 재사용하는 editor session을 연결했다. compiler 자체의 변경 부분만 재분석하는 증분 API와 새 Windows UI 체감 수용은 아직 완료가 아니다. [현재 구현·한도·검증·다음 작업](../docs/pulse-completion-performance.md)을 우선 읽는다. Computer Use/visible 앱·Setup은 새 사용자 승인/요청 전 실행하지 않는다. 아래 배포/복원 정책은 이전 기록이다.

## Pulse Setup 전달 준비 완료 (2026-10-14 KST)

사용자 요청으로 검증된 기존 ZIP을 그대로 사용한 Windows x64 사용자 설치판을 생성했다. release/Pulse-Setup-windows-x64-beta-20261014.exe(260,255,047 bytes)·.sha256·installer-manifest.json; 기존 Inno6.4.1 compile exit0·PE/원본2,565 staged hash PASS·신규 payload3 PASS. 관리자 승격 없는 사용자 설치·한국어/영어·시작 메뉴/선택 desktop·uninstall 기록 방식, profile/project/PATH 보호. 앱/VSIX·이전 ZIP 미변경. 실제 설치/upgrade/uninstall 및 마법사 화면/clean Windows 미검증; 화면 검증은 새 사용자 승인을 받아 마지막 통합 세션에서 진행한다. [재현·최종 근거·다음 작업](../docs/pulse-windows-installer.md). 아래는 이전 기록이다.

## Pulse 내부 베타 전달 최신 (2026-10-14 KST)

Windows 공식 후보·일반 앱 자동 보관 source 복원/실제 PASS/내장 파형·작업 공간 보존/정상 닫기를 확인했고, ZIP2,565 entry 전체 재독출/hash 검사 PASS다. 스터디 전달 파일은 release/Pulse-windows-x64-beta-20261014.zip·.sha256·manifest.json. source/provider early 등록과 Restored 이후 DOM, bundle integrity10개 갱신을 유지한다. 전체340 PASS/1 POSIX SKIP 이후 관련23 PASS와 공식 타입0 errors를 구분한다. clean Windows·대표 설계/장시간 등은 잔여다. [최종 근거·인수인계](../docs/pulse-internal-beta.md). 아래는 이전 기록이다.

## Pulse 내부 베타 검증·배포 작업 중 (2026-10-14 KST)

Windows 공식 후보·브랜드/타일·파일/CLI 검사 완료. 검증 계측 JSONL 손상·실패 cleanup 보완 뒤 실제 taskkill128 자연 종료 경쟁을 확인해 Python leaf의 retained handle 종료로 보완했다. 관련43 PASS/1 POSIX SKIP; 전체 회귀/공식 코드 bundle refresh 진행 중. 최종 승인된 한 화면 세션/일반 앱 수용→검증된 ZIP/해시가 남는다. [현재 상태·실패 근거·재현·다음 작업](../docs/pulse-internal-beta.md). 아래는 이전 기록이다.

## Pulse 브랜드 확정 (2026-10-14 KST)

사용자가 Pulse를 선택했다. 독립 IDE 표시 이름과 별+디지털 파형 벡터/ICO를 반영하고 기존 내부 identity/설정·신뢰 경로는 유지한다. 관련11 PASS·script syntax PASS·PNG 산출물 관찰. 앱 화면/Windows shell 아이콘은 미검증이며 기존 배포 후보는 탭/Pulse 반영 전 버전이다. 다음 승인된 화면 통합→새 후보 build/packaged 수용→ZIP 순서. [결정·파일·검증·인수인계](../docs/pulse-branding.md). 아래는 이전 기록이다.

## Simulation 탭 개선 / 배포 후보 현황 (2026-10-14 KST)

홈은 고정 집 아이콘, 파형 탭은 TB 이름만 표시·실행 ID/시각 tooltip·내부 ×·테마 색/한 줄 스크롤로 정리했다. 비활성 닫기 보존/활성 인접 이동/마지막 홈·reader 해제 회귀 포함 관련18 PASS·공식 전체 타입/owned emission0 errors. 화면 미검증·기존 배포 후보는 수정 전 버전. 직전 배포 후처리/파일/CLI PASS·packaged native11 PASS/실제 파형 화면 확인 뒤 사용자가 Esc로 중지했으며 물리 클릭/정상 종료·ZIP는 미완료다. Computer Use/visible 검증은 매번 사용자 확인을 받아 진행한다. [상세·근거·다음 작업](../docs/ide-simulation-tabs.md). 아래는 이전 기록이다.

## 실제 앱·화면 통합 / 내부 베타 빌드 준비 (2026-10-13 KST)

사전 안내 후 기존 trusted 전용 창 한 세션에서 native FileService TB add/rename/delete/recreate·보관 source/diff·actual Verilator/내장 파형11개 PASS/exit0, 직접 선택 실행/Cancel·All2 PASS·로그·cursor599ps 정렬·bus/drag·Code 왕복/정상 종료를 확인했다. history29→33·원형/기존 trace 보존. development extension host 시작 지연 경고를 기록하고 DPI/고대비·group drag/긴 시간·종료 중 dialog/대형 실제 설계 등 미확인을 유지한다. 사용자 승인으로 Windows 내부 베타 배포 준비 시작: 공식 기본 경로의 불필요 Copilot 단계 중단 후 IDE 자체 build-beta 경로·resource asset/번들 상대경로 보완·Copilot/인증 확장 제외·BETA 안내 작성. 관련8+overlay3 PASS·공식 전체 타입/emission0 errors. 본체 배포 bundle 실행 중이며 ZIP/패키지 smoke/설치/공개 완료 아님. [화면 범위·근거·미검증·다음](../docs/ide-windows-integrated-ui.md). 아래는 이전 기록이다.

## Windows 종료 실패·복구 검증 최신 (2026-10-13 KST)

알려진 private tree의 taskkill 응답만 주입해 Windows cleanupFailed/deadline·history 실패 기록/재실행 차단·host close/tool probe/result write 경계를 확인했다. 관련 process11개:10 PASS/0 FAIL/1 POSIX SKIP·NTFS 종료/partial 보관→current 명시적 복구→재보관5개 PASS, fixture 잔류0·syntax/diff PASS. 제품 runtime 미변경으로 관련 테스트만 실행했으며 이전 전체331 PASS와 합산하지 않는다. 화면/Computer Use/설치/배포 없음. 다음은 native watcher/앱 종료·복원과 마지막 통합 화면 체크리스트 준비; 화면 시작 전 반드시 사용자에게 알림(AGENTS 반영). [구현·근거·재현·잔여](../docs/ide-windows-cleanup-recovery.md). 아래는 이전 기록이다.

## Windows 복귀 최신 (2026-10-13 KST)

공통 docs/ide-windows-cloud-return.md가 cloud H7A～S/TB 자동 목록 이후 Windows 비화면 인수인계다. runtime/language·guarded overlay/bundle·공식 본체 emission/type·Node channel·Windows OS TB 목록 workload를 확인하고 CRLF 알림/legacy lease 보호를 보완했다. docs/handoff.md와 docs/ide-h7-integration-gates.md의 P0/P1 잔여를 따르며 화면 점유 검증은 마지막 통합 세션까지 실행하지 않는다. 아래 H6D/H3 등은 이전 기록이고 TB 자동 목록의 현재 계약은 docs/ide-tb-auto-catalog.md다.

## H6D 최신 — 과거 run 명시적 비교·소스 차이 (2026-10-12)

선택 이력 ‘입력 비교’→saved/current 상태 분리·runId 바인딩·buffer 동결·root/epoch/선택 guard·편집 후 다시 비교, ‘소스 차이’→읽기 전용 보관/현재 편집기·삭제 파일 무생성을 연결했다. 최신 비교/결과·history 보존, 전체 history 자동 반복 검사 없음. 최종145 PASS/0 FAIL/0 SKIP·runtime/language build·공식 전체 본체 타입0 errors/emission3파일0 errors. trusted native4시나리오/exit0: 과거 matching→dirty 무효화/changed→실제 diff/삭제 package 거절→복구 matching·원형/최신 runId/history29/창 보존, 새 시뮬레이션 없음. Core gated 프로젝트 변경/요청 동결 수용, UI 진행 중 물리 race/규모 등은 별도. 다음 H6 수용표/잔여 범위 판정→H7 안정화. clean Windows/FST/enum/encoding·물리/복원 등 gate 유지·H6/베타 전체 아님·배포 없음. [근거·범위·다음 작업](../docs/ide-h6d-selected-run-comparison.md). 아래는 역사다.

## H6C 최신 — 보관 소스 읽기 전용 보기 (2026-10-12)

결과/선택 이력 ‘보관 소스’→검증된 RTL/package/header 목록·내용→runId 가상 읽기 전용 Code 탭을 연결했다. 원본 수정/삭제·비등록 경로/변조 보호, 내용 hash/UTF-8·64MiB cache·저장/미저장 분류·현재 소스 구분, 기존 잘못된 실행 안내 수정. 최종144 PASS/0 FAIL/0 SKIP·runtime/language build·공식 전체 본체 타입0 errors/emission3파일0 errors. trusted native3시나리오 및 새 프로세스3시나리오 각 PASS/exit0: 삭제된 package VALUE8/SystemVerilog·실제 typing/provider write 거절·보관 TB/동일 파형·원형 source/TOML/history29 보존·정상 종료, 새 시뮬레이션 없음. 다음 H6D 선택한 과거 run의 명시적 입력 비교/소스 탐색 UX→H6 범위 판정→H7. 물리/encoding/규모·clean Windows 등 gate와 UTF-8/cache/의미 분석 제한 유지; H6/베타 전체 아님·배포 없음. [구현·수용·한계·다음 단계](../docs/ide-h6c-recorded-source-view.md). 아래는 역사다.

## H6B3 최신 — 현재 내용 비교·package/header/BOM·복원 (2026-10-12)

saved/current 입력 비교를 분리하고 dirty/content debounce·동결·최신 revision 게시·동일 text/다른 버전 matching·이전 run 비교 미실시 표시를 연결했다. 실제 UTF-8 BOM 수집 누락을 발견해 한 번만 포함하도록 수정. 최종144 PASS/0 FAIL/0 SKIP·runtime/language build·공식 본체 전체 타입0 errors/emission2파일0 errors. trusted native3시나리오/실제4파일 VALUE10 PASS·TOML 보호·current 일치→편집 changed→복원 matching·원형 소스/설정 복구, 새 프로세스1시나리오/동일 retained VCD·4파일 provenance/정렬 PASS·각 exit0/history29. timescale fixture/BOM 제품 오류/검증 include 복구 실패와 hash 대조·관리 Apply 복구 근거 보존. 다음 H6C 보관 소스 읽기 전용 보기/이전 run UX→H6 범위 판정→H7; encoding/물리/규모·clean Windows 등 gate 유지·H6/베타 전체 아님·배포 없음. [구현·실패/복구·다음 인수인계](../docs/ide-h6b3-current-input-comparison.md). 아래는 역사다.

## H6B2 최신 — GUI 미저장 Run·실제 앱 수용 (2026-10-12)

개별/선택/전체·Explorer 실행의 동기 dirty RTL/header 수집→공통 IPC/host/Core snapshot을 연결했다. 원본 저장 없음·UTF-8/BOM·크기/경로/신뢰·미저장 TOML 보호, 결과/이력 ‘미저장 입력’·사용 파일 안내. 최종143 PASS/0 FAIL/0 SKIP·runtime/language build·공식 본체 TS7 전체 타입0 errors/공식 emission3파일0 errors. trusted native5시나리오/exit0·실제6회(선택1/전체2/invalid FAIL/취소/Explorer retry)·history21→27, 빌드 중 추가 편집 격리·managed VCD 정렬/이전 탭·dirty/원본 bytes 보존·owned edit 복구/정상 종료. scalar fixture/행 준비 대기와 잘못 선택한 TS5.9 heap 실패를 보완하고 근거 보존. 현재 buffer 정확 비교·dirty package/header/BOM/encoding/restart·과거 source UX는 H6B3 잔여. 다음 H6B3→H6 범위 판정→H7; H6/베타 전체 아님·기존 gate·배포 없음. [실제 수용·한계·인수인계](../docs/ide-h6b2-unsaved-run-ui.md). 아래는 역사다.

## H6B1 최신 — 미저장 입력 Core/서비스 snapshot (2026-10-12)

실행 요청 시 편집 text/version 동결→복사본 source/package/header/include 포착·검증→원본 무저장 실행·provenance/history 보존을 구현했다. 실패/비지원 backend의 디스크 fallback 금지·경로/크기/junction/생성물 보호. 최종142 PASS/0 FAIL/0 SKIP·runtime/language build, actual Verilator5회(저장 VALUE1→미저장 두 top VALUE2→잘못된 TB FAIL→저장 VALUE1)/3묶음 PASS·VCD 값/원본5파일/이전 trace/history5/격리 확인. 첫 전체139/140의 source 갱신 경쟁을 보완·후속 검사 coalesce 재현 테스트 추가·실패 근거 보존. GUI/IPC는 아직 미연결이며 현재 앱/CLI 기본 실행은 저장된 입력이다. 다음 H6B2 dirty buffer 수집/Run IPC/host·결과 표시/실제 앱 수용→H6 잔여/H7. H6/베타 전체 완료 아님·기존 gate/배포 없음. [계약·근거·다음 인수인계](../docs/ide-h6b1-editor-input-snapshot.md). 아래는 역사다.

## H6A2 최신 — 기본 자동 파형·GUI/CLI 수용 (2026-10-12)

Verilator 기본 실행을 IDE 생성 C++ driver로 전환했다. 원본 dump 코드/C++ 작성 없이 VCD/FST/off·원래 top 계층 유지, run별 고유 trace를 artifact로 명시하고 Core fallback 혼동을 차단했다. 새 예제 dump 제거·기존 dump/원본 보존. 최종136 PASS/0 FAIL/0 SKIP·runtime/language build, actual service/CLI8항목 PASS·새 예제 VCD/FST4회+보존 PASS·trusted native3항목/exit0(기존 dump 동시 생성·managed 내장파형 정렬·이전 탭/공간 왕복/원본 유지), history14→15. 검증 JS/숨겨진 frame 대기 오류를 보완하고 실패 기록 보존. browser overlay 미변경으로 전체 upstream 타입/emission 반복 없음, 기존 H5G3 근거 유지. H6A 기본 경로 완료·H6/베타 전체 아님. 다음 H6B 미저장 입력 snapshot 계약/실행→H7 잔여. 기존 clean Windows/FST 표시/enum/규모/물리·복원 gate·배포 없음. [근거·한계·다음 작업](../docs/ide-h6a2-managed-waveform.md). 아래는 역사다.

## H6A1 최신 — 자동 파형 prototype·방식 결정 (2026-10-12)

IDE 생성 C++ driver로 원본 RTL 무변경 VCD/FST/off·timing/assert/다중 top/기존 dump/$fatal/취소·dump 토큰 없는 별도 RTL을 실제 검증했다. wrapper는 계층을 추가하여 기본 후보에서 제외. 전체134 PASS·runtime/language build, 최종 보강 runtime/관련1 PASS·실제9항목/exit0. Windows context 시간 링크 옵션·모델 이름/버스 범위/시간 fixture 시험 보완과 실패 근거 보존. 현재 prototype만이며 기본 IDE/CLI --binary 경로 미변경·자동 dump 기본 적용/H6 완료 아님. 다음 H6A2 driver backend/Core 명시적 trace 연결·중복/파일명 정책·GUI/CLI 수용→H6B unsaved snapshot. 기존 gate·배포 없음. [근거·한계·다음 계약](../docs/ide-h6a1-managed-trace-prototype.md). 아래는 역사다.

## H5G3 최신 — 폴더 역할 보호·상속/예외 수용 (2026-10-12)

생성물/의존성 폴더·직접/상위 링크 지정 거절을 보완했다. 전체133 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 실제 앱4항목 PASS/trusted:true/exit0: 미저장 TOML Undo/무쓰기·실제 g++ 빌드 중 변경 거절/취소·링크/생성물 거절·상속/파일 override/제외/해제 및 실제 배지. 원형 TOML·이전 VCD 보존/history14(취소1추가), 임시 소유 폴더/junction 정리·정상 종료. 명령/IPC/DOM 수용이며 물리 메뉴/DPI/규모·H5/베타 전체 완료 아님. 다음 구현 H6A Verilator 자동 dump prototype→H6B saved/unsaved snapshot→H7 잔여. 배포 없음. [근거·한계·다음 단계](../docs/ide-h5g3-folder-guards.md). 아래는 역사다.

## H5G2 최신 — 저장된 폴더 역할·앱 재시작 복원 (2026-10-12)

역할 적용 후/새 프로세스 Code 초기 읽기에서 Explorer 아이콘 유지, 저장됨/초안 구분·canonical TOML/root/revision 보호. 빈/제외 경계 디렉터리 수집·링크/생성물 제외, 파일 override/실행 흐름 보존. 전체132 PASS/0 FAIL/0 SKIP·runtime/language build·전체 타입0 errors·최종 관련10 PASS, 실제 앱 저장3/새 프로세스 복원2항목 PASS/trusted:true/각 exit0. 기존 관리 Apply로 원형 TOML/DUT bytes/test 이름/history13 복구·전용 창 정상 종료. 물리 메뉴·상속/override/dirty/busy 종합 UX와 H5/베타 전체 미완료. 다음 폴더 잔여 수용→H6 자동 dump/snapshot. 배포 없음. [근거·한계·인수인계](../docs/ide-h5g2-saved-folder-roles.md). 아래는 역사다.

## H5G1 최신 — Explorer 폴더 역할 검토 UI (2026-10-12)

폴더 우클릭 RTL/Simulation/제외/상속 해제→기존 관리·분류 검토 연결, 검토 중 폴더 아이콘/직접·상속 표시. 파일 override·하위 규칙·원본/TOML/이력 보존. 최종129 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 실제 전용 앱4항목 PASS/trusted:true/exit0·history13 불변. 최초 타입 오류와 제한 환경 검증 실패/중단 기록 보존. 저장/적용 후 배지 지속은 아직 미구현: 다음 H5G2 저장된 역할 표시/재시작 수용→H6 자동 dump/snapshot. H5/베타 전체·배포 미완료. [근거·한계·다음 작업](../docs/ide-h5g1-folder-role-review.md). 아래는 역사다.

## H5F 최신 — Explorer TB 파일 행 실행 (2026-10-12)

Code 초기 프로젝트 읽기→등록된 대표 TB source의 실제 Explorer 행 hover/focus ▶·단일 실행/여러 top QuickPick·취소 무실행·공통 runner/Simulation 이동 연결. Code-OSS 내부 file registry 재사용, renderer 직접 수정 없음. exact 경로/Core 대표 source 기준·busy/비신뢰/미저장 TOML 제한. 전체126 PASS/0 FAIL/0 SKIP·runtime/language build, 최종 공식 전체 타입0 errors, actual 행/DOM/QuickPick5항목 PASS/trusted:true/exit0·tb.second 실제 Verilator PASS/VCD·Code 왕복/활성화·원본3개 bytes 불변·history13 유지. Emitter threshold0 listener 거절 결함을1024로 보완, URI 타입/숨겨진 row 시험·실패 정리 보강과 근거 보존. 물리 hover/키 조합/DPI·일반 multi-source top 선언 위치는 별도. H5F 행 실행 완료·폴더 역할/H5/베타 미완료. 다음 폴더 역할 우클릭/표시/분류 UX→H6 snapshot/자동 dump. 기존 gate·배포 없음. [근거·한계·인수인계](../docs/ide-h5f-explorer-run.md). 아래는 역사다.

## H5E2 실제 앱 수용 최신 — 파일 이벤트·미저장 보호·취소/복구 (2026-10-11)

사용자 직접 닫은 전용 창을 기존 trust로 재사용하여 actual watcher→추가/header/TB 후보 안내·미저장 TOML 보호·관리 Apply→matching·실제 g++ 빌드 중 header 삭제/Cancel 후 감지·이전 VCD 보존·삭제 source 복구5항목 PASS/trusted:true/exit0. 원형 config/source2 bytes 복원·history11(기존9+cancelled2)·reader 보존. 최종 공식 화면 emission/전체 타입0 errors·script syntax2 PASS. 최초 timescale fixture와 include 보존 정책 검증 실패를 기록/보강했으며 강제 overwrite 없이 managed Apply로 복구했다. 전체123/관련7 PASS는 H5E2 이전 자동 근거로 이번 반복 아님. H5E2 실제 흐름 수용 완료·H5/베타 전체 미완료. 다음 구현 Explorer TB hover Run/여러 top 선택·폴더 역할 UI→H6 snapshot/자동 dump. cold 시작 지연·세션 baseline/include override 한계·기존 gate 유지·배포 없음. [근거·한계·인수인계](../docs/ide-h5e2-source-sync-acceptance.md). 아래는 역사다.

## H5E2 최신 — 파일 구성 변경 감지·동기화 안내 (2026-10-11)

IDE 소유 imported 원형의 source/package/header 추가·삭제/분류 변경·세션 새 TB 후보를 읽기 전용 비교하고 Simulation 안내→테스트 관리 Apply로 연결했다. 감지 시 TOML 쓰기/의미 분석/Run 전 자동 반영 없음. debounce·실행/관리 중 보류·검사 중 이벤트 재확인·취소/revision 보호·기존 결과/수동 설정 보존. 전체123 PASS/0 FAIL/0 SKIP·runtime/language build, 최종 관련7 PASS·전체 upstream 타입0 errors/exit0. 실제 앱 파일 이벤트→안내 수용은 남으며 사용자 재개한 import-ui 창/신뢰를 유지했다. 세션 baseline의 재시작 제한과 bounded 전체 lexical scan을 명시. H5E2 구현/자동검증 완료·native 수용/H5/베타 미완료. 다음 실제 감지 UI 수용→Explorer/폴더 UX→H6 snapshot/자동 dump. 기존 gate·배포 없음. [근거·한계·인수인계](../docs/ide-h5e2-source-sync.md). 아래 기록은 역사다.

## H5E1 최신 — 등록 후 테스트 관리·적용 시 source 재탐색 (2026-10-11)

Simulation 테스트 관리→기존 top 체크/추가·제외→실제 slang 재분석/새 RTL-package-header 반영→Core 설정/이력 복원. canonical imported 원형만 명시적으로 관리, 일반/수동/미저장 TOML·원본·기존 결과 보호. 최종120 PASS/0 FAIL/0 SKIP·runtime/language build, CLI 보강 관리4 PASS·전체 upstream 타입0 errors·trusted native4항목/exit0·새 top 실제 Verilator/VCD/내장파형 PASS·원형 복원/이력9·reader2 유지. H5E1 완료·H5/베타 전체 미완료. source 자동 갱신은 적용 시점이며 background 감지/Run 전 자동 반영은 미구현. 다음 H5E2 변경 감지·동기화 UX→Explorer/폴더 UX→H6 snapshot/자동 dump. 기존 gate 유지·배포 없음. [근거·한계·인수인계](../docs/ide-h5e1-project-management.md). 아래는 역사다.

## H5D3 최신 — Windows source 파일명·trusted GUI 수용 (2026-10-11)

한글/공백/대괄호 source/header 실제 Verilator·VCD 및 오류/취소 cache 정리 PASS. GUI 기본 tool-directory 빈 값 탐색 결함 보완. 최종116 PASS/0 FAIL/0 SKIP·runtime/language build, 사용자 직접 trust 후 실제 top2 등록 substeps PASS→등록 복원/개별1·선택2·전체2 총5회 Verilator PASS/VCD·내장파형 정렬/이전 탭 보존·원본 불변·native 최종5항목/exit0. 초기 실패·검증 race/인자 보완 기록 보존. H5D3 수용 완료·H5/베타 전체 미완료·물리 클릭 수용은 별도. 다음 등록 후 test 관리/자동 source 추적·Explorer/폴더 UI→H6 snapshot/자동 dump. clean Windows/설치/FST/enum/규모/복원 gate 유지·배포 없음. [근거·재개 절차](../docs/ide-h5d3-source-paths.md). 아래는 역사다.

## H5D2 최신 — 실행 설정 전환·테스트 등록 (2026-10-11)

선택한 top 등록→lock/revision 보호 하 실제 slang 재분석→게시 전 Core 설정 검증→실행 TOML 전환→Simulation 목록 연결. literal source 표기/file.top name을 Core/CLI에 연결, 일반/수동 변경 TOML·원본 보존. 전체113 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 비신뢰 native7항목 PASS. 실제 Host 선택2+CLI named1/all2 총5회 Verilator PASS/VCD·한글/공백 root·.rtl 격리 확인. bracket 파일은 reader/semantic과 달리 기존 Windows adapter가 거절함을 실제 발견/기록. H5D2 구현 완료·trusted GUI 등록 성공/물리 수용·H5/베타 전체 미완료. 다음 trusted GUI 수용/어댑터 파일명 제한 보완→등록 후 테스트 관리/자동 source 추적·Explorer/폴더 UI→H6 snapshot/자동 dump. 기존 gate 유지·배포 없음. [실제 근거·제한·인수인계](../docs/ide-h5d2-execution-registration.md). 아래는 역사다.

## H5D1 최신 — 실행 top 의미 분석 확인 (2026-10-11)

가져오기 top 선택→기존 slang 독립 정교화→읽기전용 preview 구현. multi-top/file.top·package 의존 순서·header/include·옵션/정의·source 변경/취소 검증. 전체109 PASS/0 FAIL/0 SKIP·최종 보강5시험 재검증 PASS·전체 upstream 타입0 errors·비신뢰 actual앱7항목 PASS. trusted GUI 성공 표시/물리 top 선택은 미검증이며 실제 slang 성공은 Core/host 근거. pending TOML·테스트 목록·원본 변경 없음. H5D1 확인 단계 완료·H5D/베타 전체 미완료. 다음 H5D2 저장 직전 재검증→실행 TOML 전환/file.top reader 연결→GUI/CLI 실행 등록 수용. 기존 gate 유지. [근거·한계·인수인계](../docs/ide-h5d1-top-confirmation.md). 아래는 역사다.

## H5C 최신 — 가져오기 분류 저장·복원 (2026-10-11)

Simulation 분류 저장 버튼→IDE 소유 pending rtl.toml→새 host/refresh 역할 복원 연결. 명시적 저장만 작성·원본 불변·일반/수동 변경 TOML 보존, revision/협력 writer lock·원자적 공개·취소/읽기 전용/linked 경계, 미저장 TOML 저장 차단. 최종104 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 실제 import6항목 PASS. 실제 Windows 대소문자 경로 결함을 발견·보완했다. pending은 실행 manifest가 아니며 CLI/LSP 프로젝트 연결은 H5D에서 전환해야 한다. 물리/프로세스 재시작 복원·외부 writer 최종 경쟁/crash복구와 기존 베타 gate 유지. H5C 분류 저장 단계 완료·H5/베타 전체 미완료. 다음 H5D semantic top 확정·실행 manifest 전환/여러 top 실행 연결→Explorer/폴더 UI→H6 snapshot/자동 dump. [근거·소유 정책·인수인계](../docs/ide-h5c-import-persistence.md). 아래는 역사다.

## H5B 최신 — 프로젝트 가져오기 확인 UI (2026-10-11)

TOML 없는 프로젝트의 읽기전용 탐색을 Simulation 홈/실제 IPC에 연결했다. 파일 검색·소스 열기·폴더/파일 역할·제외/초기화·취소/재시도, 공간 왕복/refresh 상태 유지. 원본/TOML/.rtl 작성 및 테스트 자동 등록 없음. 최종100 PASS/0 FAIL/0 SKIP·runtime/language 빌드, 공식 화면 emission/전체 upstream 타입0 errors, 실제 앱 import4항목·기존 Simulation3항목 PASS/exit0. 명령 API 수용이며 물리 dropdown/규모 UX는 남는다. H5B 읽기전용 검토 완료·H5/베타 전체 미완료. 다음 H5C managed TOML 정책/원자적 저장·복원→H5D semantic 확정/여러 top 실행 연결→H6 snapshot/자동 dump. 기존 clean Windows/설치/FST/enum/규모/복원 gate 유지. [검증·인수인계·다음 순서](../docs/ide-h5b-import-review.md). 아래 H5A 이하는 역사다.

## H5A 최신 — 읽기 전용 프로젝트 탐색·분류 Core (2026-10-11)

IDE 소유 Core discoverProject로 .v/.sv/.vh/.svh·package/module/header/mixed·파일/최장 폴더 역할·여러 top 후보를 읽기전용 탐색. lexical 후보는 모두 확인 필요이며 semantic 확정 아님. .rtl/의존성/link 제외·stable 순서·취소/읽기 한도·TOML/원본 불변. 최종97 PASS/0 SKIP·runtime/language 타입/build PASS, 기존 preview 해시 불변,335파일/320top후보/20package/5header 약196ms(1회 합성 탐색; GUI/전체성능 수용 아님). H5A 기반 완료·H5 전체 미완료. 다음 H5B 탐색 확인 UI/host→managed TOML 정책/저장→semantic 확인·실행 연결. H3M trusted7 PASS와 기존 설치/FST/enum/규모/복원 gate 유지. [구현·검증·다음 단계](../docs/ide-h5a-project-discovery.md).
## H3M 최신 — trusted 실제 편집기 의미 분석 수용 (2026-10-11)

사용자 직접 trust 후 자체 격리 프로필의 일반 개발 host에서 module/scope/미연결port·함수 인자·미저장 진단/복구·definition/hover·module 의미토큰·Code/Simulation 왕복/TOML 제외7항목 PASS/exit0·디스크 불변. 최초 창 충돌과 extensionTestsPath의 메모리 저장소 trust:false 실패를 보존·verifier 보완; trust override/기존 profile 공유 없음. 두 script syntax PASS. 기존91개 자동 검증은 H3K 근거이며 이번 반복 아님. H3/H4/베타 전체 미완료·설치/clean Windows/FST/enum/규모/물리 gate 유지. 다음 H5A 읽기전용 탐색·분류 Core→H5 UI/설정→H6 snapshot/자동 dump. [실제 수용·실패·다음 작업](../docs/ide-h3m-trusted-semantic-acceptance.md).
## H3L 최신 — 의미 분석 GUI 검증 격리·대기 (2026-10-10)

사용자 직접 trust 처리는 현재 어려움. 자체 semantic-ui-te972r 프로젝트/profile과 prepare/verify·native semantic 절차 준비; trusted GUI 미실행. 실제 비신뢰 앱 w8eGoW7항목 PASS/exit0·두 script syntax PASS·자체 bundle 성공. 기존 profile 새 창은 자동 검토가 세션 충돌 위험으로 거절해 실행하지 않고 격리 대안 사용. 기존 창/신뢰/소스 보존, 설치/배포 없음. H3/H4/베타 전체 미완료. 다음 사용자 trust 가능시 GUI검증; 대기 중 독립 H5A 읽기전용 탐색/분류 기반 가능. [근거·재개·남은 순서](../docs/ide-h3l-semantic-ui-preparation.md).
## H3K 최신 — 도구 설정 UI 연결 검증·신뢰 변경 보완 (2026-10-10)

실제 editor adapter+실제 승인 서비스를 연결해 설치 거절/실패 재시도/승인 중 신뢰 해제/Notification 취소·정리/dispose를 검증했다. 신뢰 해제 시 설치 차단 예외를 정상 취소·안내로 보완. 최종91 PASS/0 FAIL/0 SKIP·runtime/language 타입 통과·내장 언어 bundle 성공. 외부 planner/UI 응답 대체 시험이며 물리 GUI/실제 설치 E2E 아님. trusted semantic GUI/물리 설치 UX·clean Windows·기존 잔여 gate 유지; H3K/H3/H4 전체·베타 완료 아님. 다음 trusted GUI 수용→H5 자동 탐색/폴더/multi-top→H6 자동 dump/미저장 simulation. [이번 결과·남은 범위](../docs/ide-h3k-tool-ui-validation.md). 아래는 역사다.
## H3J 최신 — 도구 설치 승인 UI·검증/진행/취소/재시도 (2026-10-10)

Simulation 홈 도구 설정·언어 상태 메뉴→editor-free 계획/승인 서비스→IDE 소유 MSYS2/slang installer 연결. 명시적 승인/만료 ID·프로젝트 밖 realpath 경계·captured tool home·취소/종료 정리, 사용자 지정 위치 Simulation 전달. 최종86 PASS/0 SKIP·runtime/language 타입·공식 emission/전체 upstream 타입0 errors, 실제 기존 simulation/language ready·설치0, native esJNBJ7항목 PASS. 초기 타입·native2회 실패는 보완/근거 보존. 다음 H3K는 trusted semantic/설치 UX 잔여 수용과 범위 판정→H5 discovery/폴더/multi-top→H6 자동 dump. clean Windows 실제 설치·물리/규모/기존 gate 유지; 사용자 trusted 기존 창 보존·자동 trust 금지, H3/H4/베타 완료 아님. [구현·수용·남은 범위](../docs/ide-h3j-tool-setup.md). 아래는 역사다.
## H3I 최신 — 의미 분석·모듈/포트/스코프·RTL 진단 (2026-10-10)

MIT semantic provider/Python bridge/LSP를 IDE 소유로 이식하고 내장 adapter·기존 slang 검증/재사용·신뢰 제한을 연결했다. 미저장 scope/포트·함수 인자·module tokens/정의 이동·RTL 진단, TOML 제외/설정 오류 상태 안내. 최종81 PASS/0 SKIP·runtime/language 타입 성공, 실제 slang/LSP·기존 tool probe PASS, native lEPFsB5항목 PASS(신뢰 제한+lexical). TOML parser1.9.1 보완·glob 중첩 제한; upstream glob advisory3개 경고는 열린 항목. 다음 H3J는 도구 설치 승인/진행/취소/재시도 UI와 trusted semantic GUI 수용. 물리/규모·H5 discovery·H6 자동 dump 등 유지; H3/H4/베타 완료 아님. [구현·검증·경계·인수인계](../docs/ide-h3i-semantic-editing.md). 아래는 역사다.
## H3H 최신 — 독립 IDE 내장 RTL 편집 (2026-10-10)

VSIX의 검증된 lexical 엔진·editor adapter·TextMate grammar/언어 설정/아이콘을 MIT 출처와 함께 IDE 소유로 복사했다. 내장 기능 등록/기본 예약어·시스템 함수/명시적 module·package·case·begin·always* 템플릿/Enter 연결; sibling import·외부 확장 지원 없음. 최종70 PASS/runtime·언어 타입 성공, native gj9pRi4항목 PASS(신뢰 없이 파일4종/실제 snippet cursor/완성), 기존 파형 ez5zG3 4항목 PASS. 공식 emission/전체 upstream 타입0 errors·exit0도 확인. 다음은 H3I semantic module/port/scope·RTL 진단 이식→도구 설치 승인 UI. 물리 Tab/Enter·테마와 규모 수용은 별도이며 H3/H4/베타 완료 아님. [범위·근거·인수인계](../docs/ide-h3h-lexical-editing.md). 아래는 역사다.
> 2026-10-10 H3G 최신: history 선택/이전 로그·파형·saved stale/미저장 표시 연결. 최종54 PASS·전체 타입0 errors·native UpFkgw4항목 PASS·실제 이전run 로그/파형 PASS. 공통 docs/ide-h3g-history-stale.md를 먼저 읽는다. 다음은 H3 언어 등록/highlight/snippets/lexical 편집 이식, 이후 semantic/설치 UI. 이력 정리/과거 개별 비교·규모·기존 파형 잔여 수용 유지. 자동 trust/베타/배포 아님.
> 2026-10-10 H3F 최신: 테스트별 신호 보기 저장/관리/default 연결. 최종53 PASS·전체 타입0 errors·native DC5Tja 기본bus+8bit9행/정렬/왕복 PASS·실제 Save/default/닫기 재열기 복원 PASS. 공통 docs/ide-h3f-waveform-presets.md를 먼저 읽는다. 다음은 history/stale와 기록run 선택/열기. 프리셋 관리 물리/파형 잔여 수용도 유지. H3/H4 전체·베타·배포 완료 아님. 아래는 역사다.
> 2026-10-10 H3E 최신: Go 시간 이동을 form submit 대신 직접 버튼/Enter 호출로 보완. 실제 VCD2탭·bus/드래그/zoom range/Fit·신호 추가 제거·Code 왕복 PASS. 최종51 PASS, native blTGbN2항목 PASS; 새 실행의 이전 reader/bytes 보존 회귀 보강. 공통 docs/ide-h3e-waveform-interaction.md를 먼저 읽는다. 다음은 preset/default→history/stale; 그룹 드래그/긴 시간/새 GUI 실행 중 탭은 추가 수용. 새 profile untrusted이며 자동 trust 금지. H3/H4 전체·베타·배포 완료 아님.
> 2026-10-10 H3D 최신: 실행별 내장 VCD 파형 탭·reader/IPC·Code 왕복 연결, 취소 dump 안내 보완. 최종51 PASS·전체 타입0 errors·retained 실제 Verilator VCD2개·native TYZYUm canvas/정렬/왕복 PASS. srcdoc 최초 LPhen0 FAIL은 앱 고정 리소스로 보완. 공통 docs/ide-h3d-waveform.md를 먼저 읽는다. 다음은 실제 파형 interaction/닫기/이전run 보존 수용→preset/default·history/stale. FST 표시/enum 매핑/언어/설치 미완료. H3/H4 전체·베타·배포 완료 아님. 아래는 역사다.
> 2026-10-10 H3C: 사용자 직접 신뢰 후 실제 GUI 개별 실행/빌드 취소/선택 재시도/전체 실행4 PASS·1 cancelled. 실행 중 공간 왕복·선택/결과/로그·새로고침 보존, 원본 불변·.rtl 격리·이전 VCD 보존·취소 후 빌드 프로세스0 확인. 공통 docs/ide-h3c-simulation-gui-validation.md가 최신이다. 다음은 IDE 소유 내장 파형 이식/해당 run 열기와 취소 dump 안내 보완. H3/H4 전체·베타/배포 미완료. 아래는 역사다.
> 2026-10-10 H3B: Simulation 홈 목록/Run/Cancel/로그/최근 결과와 자체 Node IPC 구현. 타입0 errors·43 PASS·actual channel Verilator/VCD/build 취소 PASS·untrusted native홈3/기존editor22 PASS. trusted GUI 클릭 수용은 사용자의 preview 신뢰 직접 처리 대기이며 자동 trust 금지. 공통 docs/ide-h3b-simulation-home.md를 먼저 읽는다. 다음은 이 UI 수용과 내장 파형 이식. H3/H4 전체/베타 미완료.

> 2026-10-10 H3A: IDE 자체 Core/Verilator/기존 도구 탐색·Node 실행 서비스·개발 CLI 이식. 타입/build·37 PASS, 실제 두 예제 VCD/FST4회 성공과 보완 reader 재검증 PASS. GUI 버튼/파형·언어/설치 미연결. 다음은 Node host 연결과 Simulation 홈 Run/Cancel/결과. 공통 docs/ide-h3a-simulation-runtime.md를 먼저 읽는다. H2 물리/auxiliary 잔여·host 지연/clean Windows gate 유지.

# 독립 IDE 작업 규칙

최신 H2K는 공통 docs/ide-h2k-narrow-layout-validation.md를 먼저 읽는다. fallback은40px 전용 header이며 EditorPart의 원래 입력 크기/제약 변경/최소 높이를 반영한다. 최종 타입 검사0 errors·자동28 PASS·native RjNE0x22항목/기본20 round·695×435 네 배치 PASS. 물리 resize/최종 다른 배치와 auxiliary 상세 수용은 남는다. 기존 H2I floating overlay 겹침 설계를 최종 상태로 사용하지 않는다.

최신 H2J는 공통 docs/ide-h2j-focus-validation.md를 먼저 읽는다. 소스 자동 진입은 이전 editor 강제 focus를 하지 않고 open 동작의 preserveFocus 정책을 따른다. 실제 preserveFocus 결함 재현 뒤 보완·타입 검사0 errors, 자동28 PASS, native22항목2회/즉시 입력40 round 수용. H2I 간헐 실패와 동일 원인 확정은 아니며 작은 viewport/물리 navigation·auxiliary 상세 수용이 다음 순서다.

사용자가 구현 시작과 MSVC/Python 설치를 명시적으로 승인했다. 개발 앱 기반과 H2 공간 구현/상태 보존·배치 변경 수용을 진행 중이다. 기존 승인 범위의 설치 승인을 다시 요청하지 않는다. DEVELOPMENT.md와 공통 docs/handoff.md 및 docs/ide-h2i-layout-validation.md의 최신 결과/남은 순서를 읽고 이어간다. H2I native20항목2회 PASS지만 최초 source 입력 FAIL 원인·작은 viewport/물리 배치·보조 sidebar 상세 수용은 남는다. Code/Simulation 두 작업 공간·상태 보존·공통 Terminal/Output을 구현 목표로 한다. 외부 extension 설치/Chat과 첫 앱 Diagram은 제외한다.

모든 코드·빌드 설정·의존성·테스트는 ide 내부에 둔다. vsix 또는 상위 source를 import/load하거나 file: 의존성·symlink·path alias로 참조하지 않는다. 재사용이 필요하면 라이선스/출처를 보존해 코드를 이식하고 자체 관리한다. 공통 제품 문서는 구현 입력이 아니다. 자체 compiler/simulator는 별도 합의 없이 시작하지 않는다.
