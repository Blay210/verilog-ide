## GitHub 전달용 ignore 점검 (2026-10-12)

root/ide/vsix ignore 규칙과 Git 후보를 점검했다. 소스·tests·examples·config·lockfile·CLOUD_HANDOFF/docs는 포함, upstream/node_modules/dist/out/.dev/.rtl 및 패키징 중 복제 README/LICENSE/docs/notices는 제외한다. 각 프로젝트에 Python __pycache__/pyc/pyo 제외를 보완하고 ide의 .env.sample 포함 예외를 추가했다. 이미 추적된 ignore 대상은 없었다. 현재 ide/vsix 및 신규 문서는 untracked이므로 실제 Git 등록/커밋은 별도 필요하며 이번에 stage/commit/push하지 않았다. root의 이전 경로 삭제는 프로젝트 분리 상태로 보존했다. 코드 변경/앱 테스트/화면 검증 없음.

## 클라우드 인수인계 정리 (2026-10-12)

CLOUD_HANDOFF.md와 docs/cloud-handoff.md 작성: 제품 의도/확정 UX/편집·파형·TOML/후속 Diagram·엔진 경계, H6D 구현·이전145 PASS/native4 근거와 잔여, H6 판정→H7, cloud 환경 준비 제약·최종 통합 화면 검증 운영을 정리했다. 새 실행자 진입 링크를 AGENTS/handoff/delivery/current-validation에 추가했다. 코드·패키징·설치·GitHub 업로드·cloud 구축은 하지 않았고 새 테스트도 실행하지 않았다.

## H6D 최신 — 과거 run 명시적 비교·소스 차이 (2026-10-12)

선택 이력 ‘입력 비교’→saved/current 상태 분리·runId 바인딩·buffer 동결·root/epoch/선택 guard·편집 후 다시 비교, ‘소스 차이’→읽기 전용 보관/현재 편집기·삭제 파일 무생성을 연결했다. 최신 비교/결과·history 보존, 전체 history 자동 반복 검사 없음. 최종145 PASS/0 FAIL/0 SKIP·runtime/language build·공식 전체 본체 타입0 errors/emission3파일0 errors. trusted native4시나리오/exit0: 과거 matching→dirty 무효화/changed→실제 diff/삭제 package 거절→복구 matching·원형/최신 runId/history29/창 보존, 새 시뮬레이션 없음. Core gated 프로젝트 변경/요청 동결 수용, UI 진행 중 물리 race/규모 등은 별도. 다음 H6 수용표/잔여 범위 판정→H7 안정화. clean Windows/FST/enum/encoding·물리/복원 등 gate 유지·H6/베타 전체 아님·배포 없음. [근거·범위·다음 작업](docs/ide-h6d-selected-run-comparison.md). 아래는 역사다.

## H6C 최신 — 보관 소스 읽기 전용 보기 (2026-10-12)

결과/선택 이력 ‘보관 소스’→검증된 RTL/package/header 목록·내용→runId 가상 읽기 전용 Code 탭을 연결했다. 원본 수정/삭제·비등록 경로/변조 보호, 내용 hash/UTF-8·64MiB cache·저장/미저장 분류·현재 소스 구분, 기존 잘못된 실행 안내 수정. 최종144 PASS/0 FAIL/0 SKIP·runtime/language build·공식 전체 본체 타입0 errors/emission3파일0 errors. trusted native3시나리오 및 새 프로세스3시나리오 각 PASS/exit0: 삭제된 package VALUE8/SystemVerilog·실제 typing/provider write 거절·보관 TB/동일 파형·원형 source/TOML/history29 보존·정상 종료, 새 시뮬레이션 없음. 다음 H6D 선택한 과거 run의 명시적 입력 비교/소스 탐색 UX→H6 범위 판정→H7. 물리/encoding/규모·clean Windows 등 gate와 UTF-8/cache/의미 분석 제한 유지; H6/베타 전체 아님·배포 없음. [구현·수용·한계·다음 단계](docs/ide-h6c-recorded-source-view.md). 아래는 역사다.

## H6B3 최신 — 현재 내용 비교·package/header/BOM·복원 (2026-10-12)

saved/current 입력 비교를 분리하고 dirty/content debounce·동결·최신 revision 게시·동일 text/다른 버전 matching·이전 run 비교 미실시 표시를 연결했다. 실제 UTF-8 BOM 수집 누락을 발견해 한 번만 포함하도록 수정. 최종144 PASS/0 FAIL/0 SKIP·runtime/language build·공식 본체 전체 타입0 errors/emission2파일0 errors. trusted native3시나리오/실제4파일 VALUE10 PASS·TOML 보호·current 일치→편집 changed→복원 matching·원형 소스/설정 복구, 새 프로세스1시나리오/동일 retained VCD·4파일 provenance/정렬 PASS·각 exit0/history29. timescale fixture/BOM 제품 오류/검증 include 복구 실패와 hash 대조·관리 Apply 복구 근거 보존. 다음 H6C 보관 소스 읽기 전용 보기/이전 run UX→H6 범위 판정→H7; encoding/물리/규모·clean Windows 등 gate 유지·H6/베타 전체 아님·배포 없음. [구현·실패/복구·다음 인수인계](docs/ide-h6b3-current-input-comparison.md). 아래는 역사다.

## H6B2 최신 — GUI 미저장 Run·실제 앱 수용 (2026-10-12)

개별/선택/전체·Explorer 실행의 동기 dirty RTL/header 수집→공통 IPC/host/Core snapshot을 연결했다. 원본 저장 없음·UTF-8/BOM·크기/경로/신뢰·미저장 TOML 보호, 결과/이력 ‘미저장 입력’·사용 파일 안내. 최종143 PASS/0 FAIL/0 SKIP·runtime/language build·공식 본체 TS7 전체 타입0 errors/공식 emission3파일0 errors. trusted native5시나리오/exit0·실제6회(선택1/전체2/invalid FAIL/취소/Explorer retry)·history21→27, 빌드 중 추가 편집 격리·managed VCD 정렬/이전 탭·dirty/원본 bytes 보존·owned edit 복구/정상 종료. scalar fixture/행 준비 대기와 잘못 선택한 TS5.9 heap 실패를 보완하고 근거 보존. 현재 buffer 정확 비교·dirty package/header/BOM/encoding/restart·과거 source UX는 H6B3 잔여. 다음 H6B3→H6 범위 판정→H7; H6/베타 전체 아님·기존 gate·배포 없음. [실제 수용·한계·인수인계](docs/ide-h6b2-unsaved-run-ui.md). 아래는 역사다.

## H6B1 최신 — 미저장 입력 Core/서비스 snapshot (2026-10-12)

실행 요청 시 편집 text/version 동결→복사본 source/package/header/include 포착·검증→원본 무저장 실행·provenance/history 보존을 구현했다. 실패/비지원 backend의 디스크 fallback 금지·경로/크기/junction/생성물 보호. 최종142 PASS/0 FAIL/0 SKIP·runtime/language build, actual Verilator5회(저장 VALUE1→미저장 두 top VALUE2→잘못된 TB FAIL→저장 VALUE1)/3묶음 PASS·VCD 값/원본5파일/이전 trace/history5/격리 확인. 첫 전체139/140의 source 갱신 경쟁을 보완·후속 검사 coalesce 재현 테스트 추가·실패 근거 보존. GUI/IPC는 아직 미연결이며 현재 앱/CLI 기본 실행은 저장된 입력이다. 다음 H6B2 dirty buffer 수집/Run IPC/host·결과 표시/실제 앱 수용→H6 잔여/H7. H6/베타 전체 완료 아님·기존 gate/배포 없음. [계약·근거·다음 인수인계](docs/ide-h6b1-editor-input-snapshot.md). 아래는 역사다.

## H6A2 최신 — 기본 자동 파형·GUI/CLI 수용 (2026-10-12)

Verilator 기본 실행을 IDE 생성 C++ driver로 전환했다. 원본 dump 코드/C++ 작성 없이 VCD/FST/off·원래 top 계층 유지, run별 고유 trace를 artifact로 명시하고 Core fallback 혼동을 차단했다. 새 예제 dump 제거·기존 dump/원본 보존. 최종136 PASS/0 FAIL/0 SKIP·runtime/language build, actual service/CLI8항목 PASS·새 예제 VCD/FST4회+보존 PASS·trusted native3항목/exit0(기존 dump 동시 생성·managed 내장파형 정렬·이전 탭/공간 왕복/원본 유지), history14→15. 검증 JS/숨겨진 frame 대기 오류를 보완하고 실패 기록 보존. browser overlay 미변경으로 전체 upstream 타입/emission 반복 없음, 기존 H5G3 근거 유지. H6A 기본 경로 완료·H6/베타 전체 아님. 다음 H6B 미저장 입력 snapshot 계약/실행→H7 잔여. 기존 clean Windows/FST 표시/enum/규모/물리·복원 gate·배포 없음. [근거·한계·다음 작업](docs/ide-h6a2-managed-waveform.md). 아래는 역사다.

## H6A1 최신 — 자동 파형 prototype·방식 결정 (2026-10-12)

IDE 생성 C++ driver로 원본 RTL 무변경 VCD/FST/off·timing/assert/다중 top/기존 dump/$fatal/취소·dump 토큰 없는 별도 RTL을 실제 검증했다. wrapper는 계층을 추가하여 기본 후보에서 제외. 전체134 PASS·runtime/language build, 최종 보강 runtime/관련1 PASS·실제9항목/exit0. Windows context 시간 링크 옵션·모델 이름/버스 범위/시간 fixture 시험 보완과 실패 근거 보존. 현재 prototype만이며 기본 IDE/CLI --binary 경로 미변경·자동 dump 기본 적용/H6 완료 아님. 다음 H6A2 driver backend/Core 명시적 trace 연결·중복/파일명 정책·GUI/CLI 수용→H6B unsaved snapshot. 기존 gate·배포 없음. [근거·한계·다음 계약](docs/ide-h6a1-managed-trace-prototype.md). 아래는 역사다.

## H5G3 최신 — 폴더 역할 보호·상속/예외 수용 (2026-10-12)

생성물/의존성 폴더·직접/상위 링크 지정 거절을 보완했다. 전체133 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 실제 앱4항목 PASS/trusted:true/exit0: 미저장 TOML Undo/무쓰기·실제 g++ 빌드 중 변경 거절/취소·링크/생성물 거절·상속/파일 override/제외/해제 및 실제 배지. 원형 TOML·이전 VCD 보존/history14(취소1추가), 임시 소유 폴더/junction 정리·정상 종료. 명령/IPC/DOM 수용이며 물리 메뉴/DPI/규모·H5/베타 전체 완료 아님. 다음 구현 H6A Verilator 자동 dump prototype→H6B saved/unsaved snapshot→H7 잔여. 배포 없음. [근거·한계·다음 단계](docs/ide-h5g3-folder-guards.md). 아래는 역사다.

## H5G2 최신 — 저장된 폴더 역할·앱 재시작 복원 (2026-10-12)

역할 적용 후/새 프로세스 Code 초기 읽기에서 Explorer 아이콘 유지, 저장됨/초안 구분·canonical TOML/root/revision 보호. 빈/제외 경계 디렉터리 수집·링크/생성물 제외, 파일 override/실행 흐름 보존. 전체132 PASS/0 FAIL/0 SKIP·runtime/language build·전체 타입0 errors·최종 관련10 PASS, 실제 앱 저장3/새 프로세스 복원2항목 PASS/trusted:true/각 exit0. 기존 관리 Apply로 원형 TOML/DUT bytes/test 이름/history13 복구·전용 창 정상 종료. 물리 메뉴·상속/override/dirty/busy 종합 UX와 H5/베타 전체 미완료. 다음 폴더 잔여 수용→H6 자동 dump/snapshot. 배포 없음. [근거·한계·인수인계](docs/ide-h5g2-saved-folder-roles.md). 아래는 역사다.

## H5G1 최신 — Explorer 폴더 역할 검토 UI (2026-10-12)

폴더 우클릭 RTL/Simulation/제외/상속 해제→기존 관리·분류 검토 연결, 검토 중 폴더 아이콘/직접·상속 표시. 파일 override·하위 규칙·원본/TOML/이력 보존. 최종129 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 실제 전용 앱4항목 PASS/trusted:true/exit0·history13 불변. 최초 타입 오류와 제한 환경 검증 실패/중단 기록 보존. 저장/적용 후 배지 지속은 아직 미구현: 다음 H5G2 저장된 역할 표시/재시작 수용→H6 자동 dump/snapshot. H5/베타 전체·배포 미완료. [근거·한계·다음 작업](docs/ide-h5g1-folder-role-review.md). 아래는 역사다.

## H5F 최신 — Explorer TB 파일 행 실행 (2026-10-12)

Code 초기 프로젝트 읽기→등록된 대표 TB source의 실제 Explorer 행 hover/focus ▶·단일 실행/여러 top QuickPick·취소 무실행·공통 runner/Simulation 이동 연결. Code-OSS 내부 file registry 재사용, renderer 직접 수정 없음. exact 경로/Core 대표 source 기준·busy/비신뢰/미저장 TOML 제한. 전체126 PASS/0 FAIL/0 SKIP·runtime/language build, 최종 공식 전체 타입0 errors, actual 행/DOM/QuickPick5항목 PASS/trusted:true/exit0·tb.second 실제 Verilator PASS/VCD·Code 왕복/활성화·원본3개 bytes 불변·history13 유지. Emitter threshold0 listener 거절 결함을1024로 보완, URI 타입/숨겨진 row 시험·실패 정리 보강과 근거 보존. 물리 hover/키 조합/DPI·일반 multi-source top 선언 위치는 별도. H5F 행 실행 완료·폴더 역할/H5/베타 미완료. 다음 폴더 역할 우클릭/표시/분류 UX→H6 snapshot/자동 dump. 기존 gate·배포 없음. [근거·한계·인수인계](docs/ide-h5f-explorer-run.md). 아래는 역사다.

## H5E2 실제 앱 수용 최신 — 파일 이벤트·미저장 보호·취소/복구 (2026-10-11)

사용자 직접 닫은 전용 창을 기존 trust로 재사용하여 actual watcher→추가/header/TB 후보 안내·미저장 TOML 보호·관리 Apply→matching·실제 g++ 빌드 중 header 삭제/Cancel 후 감지·이전 VCD 보존·삭제 source 복구5항목 PASS/trusted:true/exit0. 원형 config/source2 bytes 복원·history11(기존9+cancelled2)·reader 보존. 최종 공식 화면 emission/전체 타입0 errors·script syntax2 PASS. 최초 timescale fixture와 include 보존 정책 검증 실패를 기록/보강했으며 강제 overwrite 없이 managed Apply로 복구했다. 전체123/관련7 PASS는 H5E2 이전 자동 근거로 이번 반복 아님. H5E2 실제 흐름 수용 완료·H5/베타 전체 미완료. 다음 구현 Explorer TB hover Run/여러 top 선택·폴더 역할 UI→H6 snapshot/자동 dump. cold 시작 지연·세션 baseline/include override 한계·기존 gate 유지·배포 없음. [근거·한계·인수인계](docs/ide-h5e2-source-sync-acceptance.md). 아래는 역사다.

## H5E2 최신 — 파일 구성 변경 감지·동기화 안내 (2026-10-11)

IDE 소유 imported 원형의 source/package/header 추가·삭제/분류 변경·세션 새 TB 후보를 읽기 전용 비교하고 Simulation 안내→테스트 관리 Apply로 연결했다. 감지 시 TOML 쓰기/의미 분석/Run 전 자동 반영 없음. debounce·실행/관리 중 보류·검사 중 이벤트 재확인·취소/revision 보호·기존 결과/수동 설정 보존. 전체123 PASS/0 FAIL/0 SKIP·runtime/language build, 최종 관련7 PASS·전체 upstream 타입0 errors/exit0. 실제 앱 파일 이벤트→안내 수용은 남으며 사용자 재개한 import-ui 창/신뢰를 유지했다. 세션 baseline의 재시작 제한과 bounded 전체 lexical scan을 명시. H5E2 구현/자동검증 완료·native 수용/H5/베타 미완료. 다음 실제 감지 UI 수용→Explorer/폴더 UX→H6 snapshot/자동 dump. 기존 gate·배포 없음. [근거·한계·인수인계](docs/ide-h5e2-source-sync.md). 아래 기록은 역사다.

## H5E1 최신 — 등록 후 테스트 관리·적용 시 source 재탐색 (2026-10-11)

Simulation 테스트 관리→기존 top 체크/추가·제외→실제 slang 재분석/새 RTL-package-header 반영→Core 설정/이력 복원. canonical imported 원형만 명시적으로 관리, 일반/수동/미저장 TOML·원본·기존 결과 보호. 최종120 PASS/0 FAIL/0 SKIP·runtime/language build, CLI 보강 관리4 PASS·전체 upstream 타입0 errors·trusted native4항목/exit0·새 top 실제 Verilator/VCD/내장파형 PASS·원형 복원/이력9·reader2 유지. H5E1 완료·H5/베타 전체 미완료. source 자동 갱신은 적용 시점이며 background 감지/Run 전 자동 반영은 미구현. 다음 H5E2 변경 감지·동기화 UX→Explorer/폴더 UX→H6 snapshot/자동 dump. 기존 gate 유지·배포 없음. [근거·한계·인수인계](docs/ide-h5e1-project-management.md). 아래는 역사다.

## H5D3 최신 — Windows source 파일명·trusted GUI 수용 (2026-10-11)

한글/공백/대괄호 source/header 실제 Verilator·VCD 및 오류/취소 cache 정리 PASS. GUI 기본 tool-directory 빈 값 탐색 결함 보완. 최종116 PASS/0 FAIL/0 SKIP·runtime/language build, 사용자 직접 trust 후 실제 top2 등록 substeps PASS→등록 복원/개별1·선택2·전체2 총5회 Verilator PASS/VCD·내장파형 정렬/이전 탭 보존·원본 불변·native 최종5항목/exit0. 초기 실패·검증 race/인자 보완 기록 보존. H5D3 수용 완료·H5/베타 전체 미완료·물리 클릭 수용은 별도. 다음 등록 후 test 관리/자동 source 추적·Explorer/폴더 UI→H6 snapshot/자동 dump. clean Windows/설치/FST/enum/규모/복원 gate 유지·배포 없음. [근거·재개 절차](docs/ide-h5d3-source-paths.md). 아래는 역사다.

## H5D2 최신 — 실행 설정 전환·테스트 등록 (2026-10-11)

선택한 top 등록→lock/revision 보호 하 실제 slang 재분석→게시 전 Core 설정 검증→실행 TOML 전환→Simulation 목록 연결. literal source 표기/file.top name을 Core/CLI에 연결, 일반/수동 변경 TOML·원본 보존. 전체113 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 비신뢰 native7항목 PASS. 실제 Host 선택2+CLI named1/all2 총5회 Verilator PASS/VCD·한글/공백 root·.rtl 격리 확인. bracket 파일은 reader/semantic과 달리 기존 Windows adapter가 거절함을 실제 발견/기록. H5D2 구현 완료·trusted GUI 등록 성공/물리 수용·H5/베타 전체 미완료. 다음 trusted GUI 수용/어댑터 파일명 제한 보완→등록 후 테스트 관리/자동 source 추적·Explorer/폴더 UI→H6 snapshot/자동 dump. 기존 gate 유지·배포 없음. [실제 근거·제한·인수인계](docs/ide-h5d2-execution-registration.md). 아래는 역사다.

## H5D1 최신 — 실행 top 의미 분석 확인 (2026-10-11)

가져오기 top 선택→기존 slang 독립 정교화→읽기전용 preview 구현. multi-top/file.top·package 의존 순서·header/include·옵션/정의·source 변경/취소 검증. 전체109 PASS/0 FAIL/0 SKIP·최종 보강5시험 재검증 PASS·전체 upstream 타입0 errors·비신뢰 actual앱7항목 PASS. trusted GUI 성공 표시/물리 top 선택은 미검증이며 실제 slang 성공은 Core/host 근거. pending TOML·테스트 목록·원본 변경 없음. H5D1 확인 단계 완료·H5D/베타 전체 미완료. 다음 H5D2 저장 직전 재검증→실행 TOML 전환/file.top reader 연결→GUI/CLI 실행 등록 수용. 기존 gate 유지. [근거·한계·인수인계](docs/ide-h5d1-top-confirmation.md). 아래는 역사다.

## H5C 최신 — 가져오기 분류 저장·복원 (2026-10-11)

Simulation 분류 저장 버튼→IDE 소유 pending rtl.toml→새 host/refresh 역할 복원 연결. 명시적 저장만 작성·원본 불변·일반/수동 변경 TOML 보존, revision/협력 writer lock·원자적 공개·취소/읽기 전용/linked 경계, 미저장 TOML 저장 차단. 최종104 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 실제 import6항목 PASS. 실제 Windows 대소문자 경로 결함을 발견·보완했다. pending은 실행 manifest가 아니며 CLI/LSP 프로젝트 연결은 H5D에서 전환해야 한다. 물리/프로세스 재시작 복원·외부 writer 최종 경쟁/crash복구와 기존 베타 gate 유지. H5C 분류 저장 단계 완료·H5/베타 전체 미완료. 다음 H5D semantic top 확정·실행 manifest 전환/여러 top 실행 연결→Explorer/폴더 UI→H6 snapshot/자동 dump. [근거·소유 정책·인수인계](docs/ide-h5c-import-persistence.md). 아래는 역사다.

## H5B 최신 — 프로젝트 가져오기 확인 UI (2026-10-11)

TOML 없는 프로젝트의 읽기전용 탐색을 Simulation 홈/실제 IPC에 연결했다. 파일 검색·소스 열기·폴더/파일 역할·제외/초기화·취소/재시도, 공간 왕복/refresh 상태 유지. 원본/TOML/.rtl 작성 및 테스트 자동 등록 없음. 최종100 PASS/0 FAIL/0 SKIP·runtime/language 빌드, 공식 화면 emission/전체 upstream 타입0 errors, 실제 앱 import4항목·기존 Simulation3항목 PASS/exit0. 명령 API 수용이며 물리 dropdown/규모 UX는 남는다. H5B 읽기전용 검토 완료·H5/베타 전체 미완료. 다음 H5C managed TOML 정책/원자적 저장·복원→H5D semantic 확정/여러 top 실행 연결→H6 snapshot/자동 dump. 기존 clean Windows/설치/FST/enum/규모/복원 gate 유지. [검증·인수인계·다음 순서](docs/ide-h5b-import-review.md). 아래 H5A 이하는 역사다.

## H5A 최신 — 읽기 전용 프로젝트 탐색·분류 Core (2026-10-11)

IDE 소유 Core discoverProject로 .v/.sv/.vh/.svh·package/module/header/mixed·파일/최장 폴더 역할·여러 top 후보를 읽기전용 탐색. lexical 후보는 모두 확인 필요이며 semantic 확정 아님. .rtl/의존성/link 제외·stable 순서·취소/읽기 한도·TOML/원본 불변. 최종97 PASS/0 SKIP·runtime/language 타입/build PASS, 기존 preview 해시 불변,335파일/320top후보/20package/5header 약196ms(1회 합성 탐색; GUI/전체성능 수용 아님). H5A 기반 완료·H5 전체 미완료. 다음 H5B 탐색 확인 UI/host→managed TOML 정책/저장→semantic 확인·실행 연결. H3M trusted7 PASS와 기존 설치/FST/enum/규모/복원 gate 유지. [구현·검증·다음 단계](docs/ide-h5a-project-discovery.md).
## H3M 최신 — trusted 실제 편집기 의미 분석 수용 (2026-10-11)

사용자 직접 trust 후 자체 격리 프로필의 일반 개발 host에서 module/scope/미연결port·함수 인자·미저장 진단/복구·definition/hover·module 의미토큰·Code/Simulation 왕복/TOML 제외7항목 PASS/exit0·디스크 불변. 최초 창 충돌과 extensionTestsPath의 메모리 저장소 trust:false 실패를 보존·verifier 보완; trust override/기존 profile 공유 없음. 두 script syntax PASS. 기존91개 자동 검증은 H3K 근거이며 이번 반복 아님. H3/H4/베타 전체 미완료·설치/clean Windows/FST/enum/규모/물리 gate 유지. 다음 H5A 읽기전용 탐색·분류 Core→H5 UI/설정→H6 snapshot/자동 dump. [실제 수용·실패·다음 작업](docs/ide-h3m-trusted-semantic-acceptance.md).
## H3L 최신 — 의미 분석 GUI 검증 격리·대기 (2026-10-10)

사용자 직접 trust 처리는 현재 어려움. 자체 semantic-ui-te972r 프로젝트/profile과 prepare/verify·native semantic 절차 준비; trusted GUI 미실행. 실제 비신뢰 앱 w8eGoW7항목 PASS/exit0·두 script syntax PASS·자체 bundle 성공. 기존 profile 새 창은 자동 검토가 세션 충돌 위험으로 거절해 실행하지 않고 격리 대안 사용. 기존 창/신뢰/소스 보존, 설치/배포 없음. H3/H4/베타 전체 미완료. 다음 사용자 trust 가능시 GUI검증; 대기 중 독립 H5A 읽기전용 탐색/분류 기반 가능. [근거·재개·남은 순서](docs/ide-h3l-semantic-ui-preparation.md).
## H3K 최신 — 도구 설정 UI 연결 검증·신뢰 변경 보완 (2026-10-10)

실제 editor adapter+실제 승인 서비스를 연결해 설치 거절/실패 재시도/승인 중 신뢰 해제/Notification 취소·정리/dispose를 검증했다. 신뢰 해제 시 설치 차단 예외를 정상 취소·안내로 보완. 최종91 PASS/0 FAIL/0 SKIP·runtime/language 타입 통과·내장 언어 bundle 성공. 외부 planner/UI 응답 대체 시험이며 물리 GUI/실제 설치 E2E 아님. trusted semantic GUI/물리 설치 UX·clean Windows·기존 잔여 gate 유지; H3K/H3/H4 전체·베타 완료 아님. 다음 trusted GUI 수용→H5 자동 탐색/폴더/multi-top→H6 자동 dump/미저장 simulation. [이번 결과·남은 범위](docs/ide-h3k-tool-ui-validation.md). 아래는 역사다.
## H3J 최신 — 도구 설치 승인 UI·검증/진행/취소/재시도 (2026-10-10)

Simulation 홈 도구 설정·언어 상태 메뉴→editor-free 계획/승인 서비스→IDE 소유 MSYS2/slang installer 연결. 명시적 승인/만료 ID·프로젝트 밖 realpath 경계·captured tool home·취소/종료 정리, 사용자 지정 위치 Simulation 전달. 최종86 PASS/0 SKIP·runtime/language 타입·공식 emission/전체 upstream 타입0 errors, 실제 기존 simulation/language ready·설치0, native esJNBJ7항목 PASS. 초기 타입·native2회 실패는 보완/근거 보존. 다음 H3K는 trusted semantic/설치 UX 잔여 수용과 범위 판정→H5 discovery/폴더/multi-top→H6 자동 dump. clean Windows 실제 설치·물리/규모/기존 gate 유지; 사용자 trusted 기존 창 보존·자동 trust 금지, H3/H4/베타 완료 아님. [구현·수용·남은 범위](docs/ide-h3j-tool-setup.md). 아래는 역사다.
## H3I 최신 — 의미 분석·모듈/포트/스코프·RTL 진단 (2026-10-10)

MIT semantic provider/Python bridge/LSP를 IDE 소유로 이식하고 내장 adapter·기존 slang 검증/재사용·신뢰 제한을 연결했다. 미저장 scope/포트·함수 인자·module tokens/정의 이동·RTL 진단, TOML 제외/설정 오류 상태 안내. 최종81 PASS/0 SKIP·runtime/language 타입 성공, 실제 slang/LSP·기존 tool probe PASS, native lEPFsB5항목 PASS(신뢰 제한+lexical). TOML parser1.9.1 보완·glob 중첩 제한; upstream glob advisory3개 경고는 열린 항목. 다음 H3J는 도구 설치 승인/진행/취소/재시도 UI와 trusted semantic GUI 수용. 물리/규모·H5 discovery·H6 자동 dump 등 유지; H3/H4/베타 완료 아님. [구현·검증·경계·인수인계](docs/ide-h3i-semantic-editing.md). 아래는 역사다.
## H3H 최신 — 독립 IDE 내장 RTL 편집 (2026-10-10)

VSIX의 검증된 lexical 엔진·editor adapter·TextMate grammar/언어 설정/아이콘을 MIT 출처와 함께 IDE 소유로 복사했다. 내장 기능 등록/기본 예약어·시스템 함수/명시적 module·package·case·begin·always* 템플릿/Enter 연결; sibling import·외부 확장 지원 없음. 최종70 PASS/runtime·언어 타입 성공, native gj9pRi4항목 PASS(신뢰 없이 파일4종/실제 snippet cursor/완성), 기존 파형 ez5zG3 4항목 PASS. 공식 emission/전체 upstream 타입0 errors·exit0도 확인. 다음은 H3I semantic module/port/scope·RTL 진단 이식→도구 설치 승인 UI. 물리 Tab/Enter·테마와 규모 수용은 별도이며 H3/H4/베타 완료 아님. [범위·근거·인수인계](docs/ide-h3h-lexical-editing.md). 아래는 역사다.
## H3G 최신 — 실행 이력·코드 변경 표시 (2026-10-10)

테스트별 최근100개 project history에서 이전 run을 선택해 로그/파형을 열고, 최근 실행의 saved-input 변경·비교 불가와 미저장 변경을 구분했다. 파일 변경 debounce·비교 취소/revision guard·이전 reader/default 유지. 최종54 PASS·전체 타입0 errors·native UpFkgw4항목 PASS/exit0(저장 이벤트→stale/기존파형 보존), 실제 과거 b6119f7e 선택/로그/파형 PASS. 최초 타입 API 오류와2회 초기화 시험 race는 보완·기록 보존. 원본6개 불변/retained5개 run 유지. 다음은 H3 언어 등록/highlight/snippets/lexical 편집 이식→semantic/설치 UI. H4 이력 정리/개별 과거 비교·규모/파형 잔여 수용은 남는다. 베타·배포 완료 아님. [구조·수용·실패·다음 순서](docs/ide-h3g-history-stale.md). 아래는 역사다.

## H3F 최신 — 테스트별 신호 보기·기본값 저장 (2026-10-10)

내장 파형의 여러 보기 저장/덮어쓰기/이름 변경/삭제/default를 IDE 소유 store·Node IPC에 연결했다. 경로/순서/radix/색/bus 펼침 저장, 누락 신호 유지·다른 탭 revision 충돌 거절·.rtl 안 설정 격리. 최종53 PASS·전체 타입0 errors·native DC5Tja default bus+8bit9행/정렬/왕복 PASS, 실제 Save→기본 지정→닫기/재열기 복원 PASS. 최초 junction EPERM과QuickInput 타입1오류는 최종 검증으로 보완하고 기록 보존. 원본6개 불변/retained5개 run 유지. 다음은 history/stale·기록run 선택/열기; preset 관리 상세 물리/기존 파형 잔여 수용도 유지. H3/H4 전체·베타·배포 완료 아님. [구조·사용·수용·한계·다음 순서](docs/ide-h3f-waveform-presets.md). 아래는 역사다.

## H3E 최신 — 파형 실제 조작·시간 이동 보완 (2026-10-10)

실제 앱에서 Go 시간 이동 미동작을 발견해 form 제출 의존을 제거하고 버튼/Enter 직접 호출로 수정했다. 실제 VCD2개 탭·bus 펼침/드래그·신호 추가/제거·확대/구간 확대/Fit·Code 왕복 상태 유지 PASS. 전체51 PASS/exit0(runtime 타입 포함), native blTGbN2항목 PASS/exit0, 새 실행의 이전 reader/bytes 보존 회귀 보강, 원본6개 해시/retained5개 run 불변. 새 profile은 untrusted이며 GUI 새 Run은 하지 않았다. 다음은 테스트별 preset/default→history/stale 연결; Ctrl/Shift 그룹 드래그·긴 시간 실제 화면·새 GUI 실행 중 이전 탭은 추가 수용으로 남는다. H3/H4 전체·베타·배포 완료 아님. [실패·수정·수용표·인수인계](docs/ide-h3e-waveform-interaction.md). 아래는 역사다.

## H3D 최신 — 실행별 내장 VCD 파형 연결 (2026-10-10)

Simulation 결과의 파형 버튼→실행별 sandbox 파형 탭·최대4 reader·Code 왕복 보존을 연결했다. 기존 renderer/worker를 IDE 소유로 수동 이식했고 VSIX/부모 runtime/build 참조가 없다. 절대 시간 눈금·bus 펼치기 등 기존 화면 유지, 취소에 dump 안내를 붙이던 문구 보완. 최종51 PASS·전체 타입0 errors·실제 retained Verilator VCD2개 read/query PASS·native TYZYUm canvas2/정렬/왕복/동일run 재사용 PASS. 최초 srcdoc native LPhen0 FAIL은 고정 앱 리소스 URL로 보완; 실패 기록 보존·보안 정책 변경 없음. 다음은 실제 파형 interaction/닫기/이전run 보존 수용→preset/default·history/stale 연결. FST 표시·enum 소스 매핑·언어/설치 등 미완료; H3/H4 전체·베타·배포 아님. [구현·검증·실패·다음 순서](docs/ide-h3d-waveform.md). 아래는 역사다.
## H3C 최신 — 실제 Simulation 버튼 검증 완료 (2026-10-10)

사용자가 preview 폴더를 직접 신뢰한 후 실제 GUI의 개별 Run·g++ 빌드 중 Cancel·선택 재시도·전체 순차 실행을 확인했다. 4 PASS/1 cancelled, 실행 중 Code/Simulation 왕복·선택 보존·retained 로그·새로고침 최신 결과 복구 PASS. 취소 후 해당 빌드 프로세스0, 원본 파일/해시 불변·생성물 .rtl 안·성공4회의 이전 VCD 보존 확인. 제품 코드 변경/재빌드/패키징 없음; H3B 자동43 PASS·타입0 errors는 이전 근거다. 다음은 내장 파형 이식/해당 run 열기와 취소 결과의 부정확한 dump 안내 보완, 이후 history/stale·언어/설치 흐름. H3/H4 전체·베타 완료 아님. [물리 수용·근거·남은 순서](docs/ide-h3c-simulation-gui-validation.md). 아래는 역사다.
## H3B 최신 — Simulation 홈·앱 Node 실행 연결 (2026-10-10)

Simulation placeholder를 테스트 목록·전체/선택/개별 실행·취소·실시간 로그·최근 결과로 교체했다. IDE 자체 shared-process IPC/창별 실행 소유자를 사용하며 renderer의 직접 FS/process와 user extension 의존성이 없다. runtime/전체43 PASS·변경 emission+전체 타입0 errors, compiled Node 채널 실제 Verilator/VCD·C++ 빌드 중 취소 PASS. native untrusted 홈3·기존editor22/20 round PASS, 물리 목록/홈 확인. 현재 trusted GUI Run/Cancel은 사용자의 preview trust 직접 처리를 기다리는 열린 수용이며 권한 설정은 바꾸지 않았다. 다음은 이 UI 수용→기존 내장 파형 이식/해당 run 열기, 이후 history/stale·언어/설치 흐름이다. H2/H3/H4 전체·베타·배포 완료 아님. [구조·근거·실패·인수인계](docs/ide-h3b-simulation-home.md). 아래는 역사다.
## H3A 최신 — Simulation 실행 기반 이식 (2026-10-10)

독립 IDE 안에 Core·Verilator·기존 도구 탐색과 공통 Node SimulationService/개발 CLI를 이식했다. 자체 runtime 타입/빌드·전체37 PASS. 실제 두 예제 VCD/FST 총4회 실행 성공; 최초 verifier의 diagram 전용 FST 제한을 보완해 같은 실물4개 재검증 PASS, 실패 근거도 보존했다. Simulation 화면은 아직 placeholder다. 다음은 Node host 연결→홈 테스트 목록/Run/Cancel/결과·로그이며 이어 파형 renderer/언어/설치 승인 흐름을 이식한다. H2 물리 resize/auxiliary 상세·host 지연/clean Windows gate를 유지하며 H2/H3 전체·베타/배포 완료가 아니다. [소유권·근거·한계·다음 순서](docs/ide-h3a-simulation-runtime.md). 아래는 역사다.
## H2K 최신 — 좁은 화면·전환 줄 겹침 보완 (2026-10-10)

좁은 화면에서 floating 버튼이 코드/탭을 덮는 문제를 발견해40px 전용 전환 줄로 보완했다. grid cache·EditorPart 원래 입력 크기·하단 panel/분할 그룹 최소 높이를 수정했다. 최종 파일 emission+전체 타입 검사0 errors/exit0, 자동28 PASS, 기본 native RjNE0x22항목/20 round PASS/exit0:695×435 네 배치 hit target·group/home 비겹침·dirty/disk 보존. 확대 hidden 실제 클릭/type는 중간 보완 빌드에서 수용했다. 중간 FAIL/120초 timeout·일반 host10초 경고를 보존한다. 다음은 auxiliary 상세/최종 물리 배치의 지원 범위 판정 후 H3 자체 이식이다. 물리 resize/H2 전체/베타·배포 완료는 아니다. [실패·최종 근거·다음 순서](docs/ide-h2k-narrow-layout-validation.md). 아래는 역사다.

## H2J 최신 — 소스 진입 focus 정책 보완 (2026-10-10)

소스 자동 Code 진입에서 이전 editor focus를 강제하던 경로를 보완했다. 실제 Output focus+preserveFocus 소스 열기 실패(9rO53F/exit1)를 재현했고 소스 open의 focus 정책에 맡기도록 수정했다. 최종 파일 공식 emission+전체 타입 검사0 errors/exit0, 자동28 PASS, native wI7osu/qvp82r 각각22항목 PASS/exit0: Output focus와 총40 round/80 새·동일 소스 즉시 입력 및 기존 배치/dirty/disk 회귀. H2I의 간헐 일반 입력 실패와 동일 원인 확정은 아니다. 다음은 작은 viewport/물리 navigation·auxiliary 상세 수용 후 H3 자체 이식이다. H2 전체/베타·배포 완료 아님. [실패·최종 근거·다음 순서](docs/ide-h2j-focus-validation.md). 아래는 역사다.

## H2I 최신 — 배치 변경 navigation·보조 sidebar 복원 (2026-10-09)

Activity Bar hidden/top/bottom에서 같은 Code/Simulation 버튼을 editor의 작은 floating navigation으로 이동하고 기본 visible rail은 유지했다. 사용자 layout 설정은 변경하지 않는다. 전체 빌드0 errors/exit0(8.23분), 최종 파일 공식 emission+전체 타입 검사0 errors/exit0, 자동28 PASS, native gR12TZ/1DXgJL 각각20항목 PASS/exit0. 최초 x6yrg1 source 입력 대기 FAIL은 보존하며 원인 미확정/진단 추가 상태다. 다음은 간헐 focus·작은 viewport/물리 click·auxiliary 상세 수용 후 H3 자체 이식이다. H2 전체/베타 완료·배포 아님. [상세 근거·실패·다음 순서](docs/ide-h2i-layout-validation.md). 아래는 역사다.

## H2H 최신 — 물리 파일/SCM 복귀·누적 수용표 (2026-10-09)

현재 private 개발 앱에서 실제 Save As로 .sv 저장/디스크 exact 확인, Simulation→SCM→같은 파일 복귀와 실제 type/dirty·disk 자동 저장 없음 PASS. 저장 dialog의 cached element 실패는 재관찰·좌표/타이핑으로 복구했다. 작은 창 border drag는 크기가 유지돼 미수용. H2 기본 공간 전환·데이터 보존 지원 흐름은 수용, 남은 H2는 작은 viewport/Activity Bar 위치·숨김과 auxiliary 세부 상태로 묶어 확인한다. 이번 제품 코드/재빌드/자동 시험 재실행 없음. [수용표·실패·한계·다음 순서](docs/ide-h2h-acceptance-summary.md). private window1639674의 .dev/h2h-physical-probe.sv는 미저장 주석을 보존한다. 레이아웃 수용 후 H3 이식, H1 host 지연/audit·배포 전 Windows gate는 별도 추적. H2 전체/베타 완료·패키징 아님. 아래는 역사다.

## H2G 최신 — 실제 Terminal·물리 Search/Untitled 수용 (2026-10-09)

신뢰 설정 override 없는 private empty window의 실제 Terminal PID 생성·3회 공간 왕복 생존·명시 dispose 후 종료3항목 PASS/exit0(hE9zZm). 프로젝트 untrusted 제한은 유지한다. 자동28 PASS, 이번 본체 재빌드 없음. 물리 Simulation→Search→Code 및 Ctrl+N/실제 RTL 텍스트 입력 PASS. private h2f-surface 창의 Untitled-1은 미저장 상태로 보존했다. Alt+Space 시도 뒤 다른 앱 전면 screenshot으로 UI 입력 중단; 작은 viewport는 미완료다. [근거·범위·다음 순서](docs/ide-h2g-terminal-ui-validation.md). 다음은 창 재선택/관찰·작은 창/Activity Bar·SCM/파일 소스/보조 sidebar 잔여 수용과 H2 범위 판정 후 H3 이식이다. H2 전체/베타 완료·패키징 아님. 아래는 역사다.

## H2F 최신 — 내장 기능 유지·실제 Explorer 복귀 수용 (2026-10-09)

내장 기능까지 끄던 start의 --disable-extensions를 제거하고 RTL 사용자 profile 확장 scan을 filesystem 접근 전에 제외했다. 내장 언어/Git 검색·개발 시험 및 Code-OSS 경로는 유지한다. 본체0 errors/exit0(1.97분)·자동28 PASS·compiled host10 PASS·native t30mLT15항목/exit0. 새 private h2f-surface 창의 안내 없음·Simulation 실제 클릭→Explorer 클릭→Code/Explorer visible 복귀 PASS. 일반 host 약3.8초 unresponsive→responsive 재발은 보존하며 해결 아님. 작은 창 resize는 적용되지 않아 미완료, 물리 source/Search/SCM·Terminal PID·Activity Bar/보조 sidebar 세부 수용은 남는다. [근거·범위·다음 순서](docs/ide-h2f-builtin-validation.md). H2 전체/베타 완료·패키징 아님. 아래는 역사다.

## H2E 최신 — 동일 소스 재진입 보완·보조 sidebar/Untitled 수용 (2026-10-09)

동일 active source 재열기 때 Simulation이 유지되는 결함을 aI5xpl FAIL/exit1로 재현하고 main onWillOpenEditor의 Code 복귀를 추가했다. 본체0 errors/exit0(3.72분)·자동27 PASS·최종 native 42e2Yu 15항목 PASS/exit0: 같은 source·보조 sidebar2회·새 Untitled/type와 기존 탭/dirty/Output 회귀. 첫 수정 후 xXiWXX의 Untitled LF/CRLF 비교 실패는 시험 정규화 후 통과했으며 실패를 보존한다. [근거·실패·한계·다음 순서](docs/ide-h2e-reentry-validation.md). 다음은 현재 빌드의 물리 도구/source/focus·작은 창/Activity Bar, Terminal PID 및 start 확장 비활성화 안내 정책 정리 후 H3 이식이다. 보조 sidebar 세부 복원/H2 전체/베타 완료·패키징 아님. 아래는 역사다.

## H2D 최신 — 소스 진입/focus 보완·Output 내용 수용 (2026-10-09)

Simulation에서 새 소스를 열어도 홈 뒤에 숨는 결함을 1BvAte FAIL/exit1로 재현하고 active editor 변경 시 Code 복귀로 보완했다. 본체0 errors/exit0(2.2분)·자동27 PASS·최종 native SF5i6k 12항목 PASS/exit0: 새 문서 type 입력/dirty·disk 원본과 기존 탭/스크롤/Explorer/panel 회귀, 실제 output TextDocument의 기존·Simulation 추가 줄 보존. [근거·실패·제한·다음 순서](docs/ide-h2d-source-output-validation.md). Output 내용 검증은 이번 통과, trusted Terminal PID/물리 도구·소스 진입/auxiliary·작은 창과 이미 active 파일 재진입 등은 남는다. 일반 start 확장 비활성화 안내 정리 후 H3 이식 순서다. H2 전체/베타 완료·패키징 아님. 아래는 역사다.

## H2C 최신 — Explorer 복귀 결함 보완·공통 panel toggle 수용 (2026-10-09)

Code sidebar hidden→Simulation→Explorer에서 sidebar가 다시 숨겨지는 결함을 실제 ciyf17 FAIL/exit1로 재현하고, 새 도구 열기 요청의 visible 상태를 보존하도록 own contribution을 보완했다. 본체0 errors/exit0(1.97분), 자동27 PASS, 최종 native qNTR2a 10항목 PASS/exit0: Explorer visible 복귀·공통 panel hidden 유지/Simulation에서 열기/Code 복귀 보존과 기존 두 group/세 tab·dirty/disk·선택/스크롤3회 왕복. [실패·근거·미검증·다음 순서](docs/ide-h2c-sidebar-validation.md). 다음은 실제 도구 진입/focus·auxiliary/작은 창과 Output 내용/Terminal PID, 일반 개발 확장 비활성화 안내 정리 후 H3 이식이다. 이번 새 경로의 물리 클릭/Terminal 수용·H2 전체/베타 완료는 아니며 패키징 없음. 아래는 역사다.

## H2B 최신 — 여러 탭·분할 편집·스크롤 및 실제 화면 수용 (2026-10-09)

두 그룹/세 탭·선택/커서·viewport·활성 문서·미저장/disk·sidebar·Output panel visibility를 세 번 왕복해 최종 native eAXZc9 PASS/8항목/exit0. Output 비동기 표시 전 기준값을 읽던 첫 추가 시험 FAIL은 대기 기준 보완으로 최종 통과했으며 기록을 보존했다. 독립 IDE 자동27 PASS. private 일반 개발 화면의 Simulation 클릭→홈→Tab focus→Enter Code 물리 왕복도 PASS. 이번 제품 코드/재빌드 없음. Terminal PID/Output 내용·작은 창·sidebar 도구 진입은 아직 미완료이고 --disable-extensions 안내가 남는다. [근거·실패·제한·다음 순서](docs/ide-h2b-state-validation.md). 다음은 H2 sidebar 초기 숨김/도구 진입·focus/공통 panel 잔여 수용과 개발 안내 정리 후 H3 기능 이식이다. H2 전체/베타 완료가 아니며 패키징 없음. 아래는 역사다.

## H2A 최신 — Code/Simulation 첫 화면·상태 보존 (2026-10-09)

RTL 제품 전용 왼쪽 Code/Simulation 버튼과 중앙 홈을 구현했다. Simulation은 사이드 영역을 숨기고 기존 Code editor/model은 유지하며 공통 panel은 변경하지 않는다. ide 자체 owned source overlay를 guarded 배치하고 upstream import/layout을 패치한다. 자동27 PASS·본체0 errors/exit0(2.33분)·compiled 설치5/host8/언어6 PASS. 최종 native LvDXtQ의 기존7항목+3회 공간 왕복 PASS/exit0: 미저장 text/dirty·disk 원본·커서·document·sidebar 복원·panel visibility 유지. 첫 Terminal 생성은 trust dialog 대기로 timeout/exit1; 신뢰를 변경하지 않고 최종 시험에 미수행을 기록했다. physical 화면은 Computer Use 접근 승인 timeout으로 미완료, h2a-surface private 창은 열려 있다. [실패·근거·한계·다음 순서](docs/ide-h2a-validation.md)를 따른다. 다음은 실제 버튼/홈·키보드/작은 창 확인, H2B 여러 탭/group/스크롤·Output 내용/기존 Terminal 유지 수용이다. 실행/파형은 H3/H4 미연결이며 H2 전체/베타 완료가 아니다. 아래는 역사다.

## H1 최신 — 검증 소속·단계 측정 보완, H2A 진입 준비 (2026-10-09)

시험 entry를 private extension 내부로 옮겨 API attribution 경고를 제거하고 UTC/단계별 시간을 기록한다. stdout뿐 아니라 exthost.log도 검사하며 과거 경고 재검출/새3회 무경고를 확인했다. 자동25 PASS, native3/3 편집·감지/시작 PASS·exit0, 정상 preLaunch/batch7항목 PASS·exit0. 제품 본체 변경/재빌드/배포 없음. [기반 수용·잔여 항목·H2A 순서](docs/ide-h1-baseline-acceptance.md)에 표로 정리했다. 개발 기반을 사용해 다음은 Code/Simulation 진입·중앙 홈/Code 모델 보존·공통 panel 유지 H2A를 구현한다. 이전 간헐 지연 원인·잔여 UI/설정/명령·audit·배포 전 검증은 계속 열려 있으며 H1 전체/안정 베타 완료가 아니다. H2A는 아직 미구현이다. 아래는 역사다.

## H1 최신 — 임시 앱 아이콘·안전한 개발 실행 사본 (2026-10-09)

원본 임시 칩 SVG/멀티 해상도 ICO와 fingerprint별 개발 exe/metadata·SHA256 receipt를 구현했다. 기존 원본/실행 중 앱을 보존하며 cache 존재 시에도 Electron 버전/무결성을 검사한다. 최종 자동24 PASS, Windows 실제 exe의 아이콘/제품 정보 추출 확인·native 반복3/3(편집/감지/시작) PASS/exit0, 실제 CLI 설치 차단 PASS, 정상 preLaunch/batch 편집7항목 PASS/exit0. 직접 --version batch probe는 예상과 달리 홈 프로필을 생성해 이번 트리만 종료했으며 파일은 보존했다. 세 격리 flag 누락을 준비 전에 차단하도록 보완하고 거부/최종 batch 재수용까지 확인했다. 실패·홈 경로·근거는 [개발 앱 검증](docs/ide-branding-validation.md)에 기록한다. 본체 source 수정/재컴파일·배포 없음. 이전 간헐 지연 원인은 미확정이며 fixture API attribution/단계별 시간 분석과 잔여 UI surface 판정 후 H2 공간으로 진행한다. H1 전체/H2/RTL 이식/베타 완료가 아니다. 아래는 역사다.

## H1 최신 — 저장 후 언어 추측 오류 보완 (2026-10-09)

이전 physical 저장 성공 뒤 content 언어 감지 worker의 require 오류/누락 regex module을 전체 로그에서 추가 발견했다. RTL 제품은 파일명 association과 사용자 언어 선택을 기준으로 하고 content-model worker/history 조회를 사용하지 않도록 보완했다. upstream 경로는 보존한다. 자동21 PASS·본체0 errors/exit0(5.72분)·compiled 언어6/host8/설치5 PASS. 실제 .sv/JSON 감지·편집/저장 native3/3 PASS·각 앱 exit0/감지 오류 재발 없음. 첫 앱의 일시 무응답/복구 때문에 startup gate=false·반복 wrapper exit1이며 이를 숨기지 않는다. 본체 재빌드/실앱 결과는 [최신 검증 기록](docs/ide-language-detection-validation.md)을 따른다. H1 전체/H2/RTL 이식 완료가 아니며 일반 host 지연·아이콘/runtime metadata·잔여 surface 판정이 남는다. 아래 이전 기록은 당시 결과다.
## H1 최신 — 반복 native3회·실제 문서 입력/저장 수용 (2026-10-09)

새 profile native 편집/시작 반복3/3 PASS·wrapper exit0, 준비~종료 전체14968/16005/16303ms(순수 시작 성능 아님). 일반 개발 별도 창에서 Ctrl+N→실제 RTL 텍스트 입력→Save As→한글/공백 .sv 경로 저장→디스크 exact 일치·미저장 표시 해제까지 physical PASS. 일반 모드에는 짧은 unresponsive→responsive가 다시 있어 완전한 기동 안정성은 아니다. Agents start/기본 inspector/자동 profiling/10초 경고는 이번 일반 로그에도 없었다. 자동20/compiled8·설치5·본체2.68분 결과는 직전 변경 결과 유지; 이번 제품 수정/재빌드/VSIX·배포 없음. [근거·프로필/fixture·제한](docs/ide-repeat-physical-validation.md). H1 전체/H2/베타 완료가 아니다. 다음: 일반 host eager 활성화/지연 분석, 아이콘/runtime metadata 및 잔여 product surface 범위 판정 → H1 마무리 → H2 공간. physical-editor-acceptance 창은 저장된 private 파일을 연 상태이며 기존 사용자 창은 건드리지 않았다. 아래 기록은 역사다.
## H1 최신 — 기본 inspector/자동 profiling 제외·실제 편집 수용 (2026-10-09)

RTL 기본 extension inspector/자동 ExtensionsAutoProfiler 등록을 제외하고 명시 inspect/inspect-brk와 응답 경고는 유지했다. 자동20 PASS/0 FAIL/0 SKIP·본체0 errors/exit0(2.68분), compiled host8 PASS·설치5 PASS. 실제 자체 native 테스트 호스트의 한글·공백 폴더/파일 열기·active editor·dirty 상태/저장 전 원본 유지·저장/재열기·Output API와 source 외 생성물 없음5항목 PASS. 첫 manifest 버전 경고를 보완한 최종 editor-acceptance-jWcTwP receipt/host/wrapper exit0. 마지막 기동에 Agents 시작·기본 debugger·자동 profiling·10초 경고/무응답 없음. 그러나 첫 editor-acceptance-mQxR4P에서10초 경고/일시 무응답이 재현되어 반복 시작 안정성은 열린 게이트다. API 수용과 physical UI/신뢰/공간 왕복은 구분한다. H1 전체/H2/베타 완료가 아니다. 다음: 반복 기동/일시 host 지연·기본 UI 입력과 아이콘/runtime·잔여 등록 범위 판정 → H1 마무리 → H2 Code/Simulation 공간. [검증·초기 실패·제한](docs/ide-startup-editor-validation.md). 아래 기록은 역사다.
## H1 최신 — 개발 시험 built-in·Agent runtime 보완 (2026-10-09)

이전 최종 앱 전체 로그에서 agent host started/연결을 실제 발견했다. contribution14곳 제외는 프로세스 시작 차단이 아니었다. 별도 enablement observable을 RTL에서 false로 하고 서비스 쪽 prewarm 등록도 제외했다. scanner에서 개발 시험 built-in3개를 제외하며 Git/언어 기능은 보존한다. 자동18 PASS/0 FAIL/0 SKIP. 본체 재빌드0 errors/exit0(5.03분), 실제 compiled scanner/enablement4 PASS·설치5 PASS. 별도 앱에서 Hello World/Chat/Extensions 없음과 이번 시작 로그의 Agents 시작·10초 경고 없음 확인. host 일시 unresponsive→responsive는 남는다. 실제 근거/재실행 제한은 [host 정책 기록](docs/ide-host-policy-validation.md)을 따른다. 이전 native 화면 Chat/Extensions 없음·Output/Terminal·Untitled 생성은 유지하지만 시작 경고는 이번 단일 실행에서 재현되지 않았으며 성능/반복 기동 게이트 완료는 아니다. 파일/저장/폴더·아이콘·잔여 등록도 남아 H1 전체/H2/베타 완료가 아니다. 다음: 빌드 → compiled 정책 → 별도 실제 앱 host/시험 contribution 확인 → 기본 편집 수용 → H1 판정 → H2. 아래 기록은 역사다.
## H1 최신 — 기본 화면 정리·실제 CLI/패널 수용 (2026-10-09)

Extensions 기본 view/열기·설치/추천 action과 local/remote Agents contribution14곳을 RTL 제품에서 제외했다. 실제 화면에서 남은 Chat panel을 발견해 view when/default container/열기 명령을 보완했다. 최종 자동15 PASS/0 FAIL/0 SKIP, 추가 본체 빌드0 errors/exit0(3.45분), compiled native 설치5곳 PASS. 실제 CLI의 한글·공백 inert fixture 설치는 정책 오류 exit1/설치 없음/receipt PASS. 별도 프로필 실제 화면에서 Chat/Extensions 없음·Output/Terminal 표시·새 Untitled 생성 확인. 기존 파일 열기는 신뢰 확인에서 취소했으며 편집/저장은 미완료다. 사용자 입력 감지 후 추가 UI 입력을 중단했다. 개발용 Hello World/self-host 시험 항목·extension host10초 경고는 남는다. H1 전체/H2/RTL 베타 완료가 아니다. 다음 순서: 개발 시험 built-in/host 시작 원인 정리 → 파일/저장/폴더 수용 및 남은 등록·아이콘 범위 점검 → H1 판정 → H2 Code/Simulation 공간. 기존 개발/검증 창은 열려 있으며 임의로 닫지 않는다. 상세 실패/근거/제한은 [화면 수용 기록](docs/ide-surface-validation.md)을 따른다. 아래 이전 문구는 역사적 기록이다.
## H1 최신 — 제품 정책 보완·재빌드/실서비스 통과 (2026-10-09)

임시 RTL IDE identity·분리된 개발 프로필과 Chat hidden 정책, native 확장 설치 entry 5곳의 선행 거부를 적용했다. 다중 patch 덮어쓰기를 보완한 재빌드0 errors/exit0(5.77분), 최종 자동13 PASS, 실제 compiled service5 PASS/exit0. 초기 안내 eager import의 필수 Chat 설정으로 시작 실패를 발견해 호환 데이터만 유지하고 재실행했다. 복구 로그에 초기 assert 재발 없음·격리 shared storage를 확인했으나 물리 화면 수용은 Computer Use 앱 승인 대기 시간 초과로 미완료다. Chat/Agents 코드 완전 제거·Extensions UI/CLI 전체 수용·전용 아이콘·편집/저장/패널은 남은 H1이다. 다음은 이 잔여 수용 후 H2 공간 구현. [상세 결과·한계](docs/ide-product-policy-validation.md).
## H1 후속 — 임시 제품 identity·Chat/확장 설치 정책 (2026-10-09)

RTL IDE 임시 이름/설정·ID overlay와 Chat hidden 정책, native VSIX/location/profile 및 공통 gallery/install task 선행 거부를 구현했다. 다중 patch 덮어쓰기 문제를 실제 compiled probe에서 발견해 파일별 누적 적용으로 보완했다. 자동13 PASS. 초기 전체 빌드 exit0은 누락 guard가 있던 상태라 정책 완료 근거가 아니다. 보완 후 공개 compile-client 작업 재빌드 진행 중. 자세한 실패/근거/남은 UI·CLI·H1 수용은 [정책 검증](docs/ide-product-policy-validation.md)을 따른다. H1 전체/H2/베타 완료가 아니다. 기존 개발 창/VSIX/배포물은 임의 변경하지 않는다.
## H1 최신 — 개발 앱 실행 확인 (2026-10-09)

도구/의존성 설치·컴파일 exit0·IDE8 PASS에 이어 실제 Code - OSS Dev 창과 재실행을 확인했다. 첫 실행의 홈 shared storage 생성을 발견해 --shared-data-dir로 ide/.dev/shared에 격리했고 로그로 재확인했다. 최초 홈 파일은 삭제하지 않았다. 재실행 앱은 열려 있으며 마지막 Output 조작은 사용자 입력 감지로 실행되지 않았다. 추가 UI 입력은 중단했다. H1 identity/기능 진입 정리와 실제 폴더·입력/저장·Terminal/Output 수용은 남아 있다. 다음은 이 H1 잔여 작업 후 H2 Code/Simulation 공간이다. H1 전체/베타 완료로 판정하지 않는다. [상세 결과](docs/ide-h1-validation.md).
## H1 재개 — 실제 의존성·컴파일 성공 (2026-10-09)

승인된 MSVC/Python 준비·doctor exit0, 고정 Code-OSS 의존성/native 설치 exit0, compile-client 본체/확장 0 errors·exit0(8.42분), IDE 자동 테스트8 PASS/0 FAIL/0 SKIP. 개발 앱 시작은 진행 중이며 실제 화면 수용은 아직 완료하지 않았다. built-in control 설정의 사용자 홈 접근을 발견해 ide 내부로 한정하는 tracked patch와 반복 적용/변경 기준선 차단 시험을 추가했다. root npm audit37건(critical2/high14 포함)은 제품 영향·완화 검토가 남았으며 lock 자동 변경은 하지 않았다. H1 전체 완료·H2~H7 이식·배포 완료가 아니다. 다음은 실제 개발 앱 폴더/편집/패널 수용 및 앱 identity/기능 진입 정리다. [상세 근거](docs/ide-h1-validation.md).
## H1 도구 설치 완료·의존성 빌드 진행 (2026-10-09)

사용자가 MSVC/Python 설치를 명시적으로 승인했다. VS2022 Build Tools17.14.37710.0 관리자 권한 재시도 exit0, Python3.14.8 embedded 공식 SHA256·실행 확인, doctor 전체 exit0. 최초 Python MSI exit3/Build Tools UAC exit1602는 보존한다. Code-OSS 자체 Git metadata/HEAD 경계를 구성해 upstream 설치의 git config가 상위 repo로 향하지 않게 했다. IDE 테스트6 PASS. 고정 의존성 설치는 진행 중이며 compile/앱 실행은 아직 미완료. 사용자 설치 승인을 다시 요청하지 않는다. [H1 기록](docs/ide-h1-validation.md).

## 독립 IDE H1 구현 시작 (2026-10-09)

Code-OSS1.141.0/revision2a59476c9bfcb90b3ddc372c36762471b7dfad1c를 고정해 ide/upstream에 준비했다. ide 자체 환경 검사·bootstrap·install/compile/start wrapper, 기준 lock/hash와 테스트를 구현했다. 최종IDE4 PASS/Node syntax check exit0. 실제 doctor는 Node/source PASS, Python/MSVC MISSING으로 exit1; build tools 설치 승인을 요청했고 아직 설치/compile/앱 실행 없음. [H1 결과·남은 gate](docs/ide-h1-validation.md). H1 진행 중이며 다음은 사용자 설치 답변에 따른 도구 준비/실제 빌드다. H2~H7/배포/엔진 미착수, VSIX 수정 없음.

## 독립 IDE 계획 점검 완료 (2026-10-09)

[구현 계획](docs/ide-implementation-plan.md)에 H1 기반→H2 공간→H3 기능 이식/진단→H4 Simulation 홈→H5 자동 프로젝트/여러 top→H6 미저장·자동 파형→H7 종료/복원/내부 수용 순서와 완료 기준·요구 추적표를 작성했다. 현재 결정 기록과 대조했고, 여러 top 선택 방식의 옛 제안은 개별 테스트 정책으로 대체한다. 파형 옆 소스·Search/Git 배치·TOML 충돌·자동 trace 상세는 미결로 유지한다. ide는 준비 상태이며 다음은 H1 공식 기준선/빌드 환경 조사다. 이번은 문서만 변경, 새 코드/checkout/설치/테스트/빌드/패키징 없음. 기존 VSIX227 PASS를 IDE 완료 근거로 사용하지 않는다.

## 분리 후 검증 (2026-10-09)

vsix cwd 타입 검사·개발 build exit0, 전체227 PASS/0 FAIL/0 SKIP. 로컬 npm 연결 경계와 기존0.3.1 배포물 SHA 일치 확인. IDE는 독립 준비 상태로 앱 구현/빌드 없음. 새 패키징/설치·이동 후 물리 UI/native simulation 종단은 수행하지 않았다. [구조·검증 기록](docs/project-layout.md).

## 프로젝트 분리 (2026-10-09)

기존 구현은 vsix/로 이동했고 독립 앱은 ide/에서 자체 코드/설정/의존성으로 개발한다. 프로젝트 간 source import/link/build 입력 공유를 금지한다. 공통 중요 문서는 루트/docs에 보존했다. 자세한 이동/검증·과거 경로 해석은 [구조 기록](docs/project-layout.md)을 참조한다. IDE는 준비 디렉터리이며 앱 구현은 시작하지 않았다.

## 최신 H0 합의 — 파일 내 여러 top·파형 자동 관리 (2026-10-09)

[결정 기록](docs/h0-product-decisions.md)에 tb.v의 top1/top2를 tb.top1/tb.top2 독립 테스트로 관리하는 정책과 사용자 dump 코드 작성 없이 IDE 파형 관리를 반영했다. DUT/helper 모두 자동 테스트 등록은 아니며 발견/identity/자동 trace 구현은 설계 필요하다. 새 프로젝트에서만 기본 폴더 생성, TOML 수동 설정 존중/충돌 방지, 이력 보존·자동 정리 방향도 수용됐다. Simulation 옆 소스 보기는 설명/세부 합의 단계다. 문서만 변경, 구현/시험/빌드/패키징 없음.

## 최신 H0 정리 — 기술 제안·현재 TOML/진단 확인·미결 사항 (2026-10-08)

[H0 결정 기록](docs/h0-product-decisions.md)에 사용자 확정 사항과 기술/엔진 제안을 구분했다. TOML은 생성 템플릿/읽기·glob 검색이 현재 기능이며 분류 기반 자동 관리·새 TB 등록은 미구현이다. RTL 분석 예외를 TOML 첫 줄에 게시하는 catch 경로를 코드에서 확인했으며 사용자 오류 원인 확정이나 수정 완료는 아니다. 다음은 가져오기/실행/파형 화면 흐름과 자동 설정/수동 override 정책 논의다. 엔진 시점·방식은 권장 순서만 있고 별도 합의 전 착수하지 않는다. 문서만 변경/코드 읽기 확인, 새 테스트·빌드·패키징 없음.

## 최신 H0 사용자 합의 (2026-10-08)

[제품 결정 기록](docs/h0-product-decisions.md)에 Code/Simulation 두 공간·상태 보존·공통 하단 패널·Simulation 홈/파형과 Diagram 첫 앱 제외를 정리했다. 사용자는 미저장 입력 사본 실행(원본 자동 저장 없음), 최초 가져오기 분류 확인, 종료 선택 시 하위 실행 정리를 승인하고 외부 extension 지원 제외를 명시했다. 다음은 가져오기→편집→실행→파형→재실행 화면 및 설정/이력 정책 설계다. 현재 구현하지 않고 함께 구체화한다. 문서만 변경; 새 시험/빌드/패키징/설치/앱·엔진 착수 없음. E4 지원 범위 완료와 열린 Windows gate는 유지한다.

## 최신 이정표 — E4 지원 범위 내 완료·H0 논의 준비 (2026-10-08)

recorded native run-kH0Z78 실제 source 왕복 focus/Tab·clock35→45ns PASS/receipt/exit0. 누적 E4 기준을 [종합 수용표](docs/e4-acceptance-summary.md)로 대조해 read-only 지원 부분집합·현재 Windows 개발 환경에서 완료 판정했다. 전체227 PASS/타입·개발 build 근거 유지, 이번 제품 코드 변경·전체 재실행 없음. generate/array 내부 연산·연속 hierarchy zoom/live 디버깅·전체 접근성/여러기기 성능은 후속 범위, 깨끗한 Windows 설치 gate는 계속 열려 있다. 다음은 [H0 준비 자료](docs/h0-discussion-brief.md)로 사용자와 독립 IDE 아이디어/범위를 합의하는 것이다. 독립 앱·엔진 구현/Code-OSS fork·패키징/설치는 시작하지 않았다. 아래 과거 E4 진행/다음 검증 기록보다 이 판정을 우선한다.

## 최신 E4 — 선택기·소스 왕복 실제 수용과 포커스 복구 (2026-10-08)

run-U8ruBs에서100% offscreen Tab→pe00/Enter, Display Down/Enter Connections·Detailed, keyboard definition→source→diagram을 실제 확인하고 focus 유실을 발견했다. context별32개 control identity를 보관하는 독립 webview helper로 보완, run-hjw5s7 source 왕복 후 Open definition focus→Tab Display 복구 PASS/receipt/exit0. private 미저장 편집의 stale 안내/graph 유지/source·selector 비활성화 및 Undo clean 확인. 관련18/전체227 PASS/0 FAIL/0 SKIP·타입/개발 build 성공. [방법·발견·근거·제한](docs/structure-keyboard-roundtrip-acceptance.md). 다음은 누적 E4 완료 기준/검증표 종합·recorded focus 회귀 확인 후 완료 범위 판정이다. 임의 scroll 복원/전체 screen reader 수용은 하지 않았고 E4 완료·독립 IDE 착수·패키징/설치 없음.

## 최신 E4 — 화면 밖 모듈 포커스 보완·카메라 반복 측정 (2026-10-08)

keyboard focusin으로 화면 밖 module을 보이게 pan하고 확대 비율을 유지하도록 보완했다. disabled/큰 module/이미 보이는 bounds 단위6 PASS. 실제4×4 browser-only host run-4Bm8OR에서 offscreen 마지막 MAC focus/100% 유지·viewport 안 bounds·SVG keyboard PASS/receipt/exit0. camera3구간×3회×120frames에서 median16.7/p95 16.8ms, handler p95 0.8~1.1ms/layout p95 3.2~3.4ms, 50ms 초과0. 이전 부하와 차이가 있어 개선 원인/FPS 보장으로 표현하지 않는다. 전체225 PASS/0 FAIL/0 SKIP·타입/개발 build 성공. [방법·근거·한계](docs/structure-focus-performance-acceptance.md). 다음은 selector/source 왕복·stale와 offscreen 실제 Tab 수용이다. E4 전체 완료·독립 IDE/엔진 착수·패키징/설치 없음.

## 최신 E4 — browser 프레임·canvas/Hierarchy 키보드 수용 (2026-10-08)

실제4×4 host run-fx3XHC에서 Fit→Tab canvas→Tab pe00→Enter 내부 진입 및 Hierarchy Down→Enter pe01 이동 확인, native receipt/PASS/exit0. 별도 실제 Chromium product HTML probe의 SVG focus·Enter/Space·camera zoom/Fit assert PASS.2170 SVG elements/120frame idle median16.7/p95 16.8ms, 합성 camera+강제 layout median33.4/p95 50.1ms(50ms 초과18회). RAF opportunity·부하 시험이며 실제 pointer/pixel FPS 게이트 완료가 아니다. [방법·로그·한계](docs/structure-browser-keyboard-acceptance.md). 타입/개발 build 성공; 제품 수정 없이 시험 확장. 다음은 selector/source 왕복·stale/화면 밖 focus 키보드, camera 비용 분해·반복 측정. E4 완료·패키징/설치·독립 IDE 착수 없음.

## 최신 E4 — 분석 닫기·프로세스 트리 정리와 실제 Cancel (2026-10-08)

native run-NwNO9r에서 hierarchy/scopeOperations/internalOperations 분석 중 tab API 닫기 → Python 부모/자식 종료(466/429/460ms)·늦은 panel 재열기 차단·실제 slang 재시도 PASS/receipt/exit0. 별도 run-LO9ODL은 실제 progress Cancel 클릭 → cancelled 안내/프로세스 종료 → 실제 Schematic 복구 PASS/receipt/exit0. physical 관찰용 timeout만300초로 연장한 시험이며 제품15초 측정이 아니다. [방법·초기 실패·근거·한계](docs/structure-analysis-cancel-acceptance.md). 관련19 PASS/타입 검사·개발 build 성공; 제품 코드 변경 없이 harness/runner 확장, 전체224는 직전 결과 유지. 다음은 전체 keyboard/focus(계층·SVG·선택기·source 왕복), diagram browser frame/layout 성능이다. E4 완료·독립 IDE/엔진 착수·패키징/설치 없음.

## 최신 E4 — 실제 progress Cancel·키보드 부분 수용 (2026-10-08)

격리 host run-QfsfM5에서 화면 Cancel 클릭 → 보류 요청 전 caller 종료/35ns 유지 → 늦은 native page 차단 → 실제 retry45ns PASS/고유 receipt/exit0. 시간 입력 Tab→Go, Shift+Tab 복귀, 35ns 입력+Enter→Values35ns를 실제 화면 확인했다. 관찰 도구 지연으로 physical 시험에서만 deadline을300초로 연장했으며 elapsed24563ms는 클릭 latency/제품15초 timeout 결과가 아니다. 초기 실패3건과 방법·한계는 [수용 기록](docs/structure-physical-cancel-acceptance.md)에 남겼다. 제품 소스 수정 없음, 타입 검사/개발 build 성공. 전체224 회귀는 직전 제품 변경 결과를 유지하며 이번 재실행 없음. 다음은 semantic/module 분석 취소·닫기/복구, 전체 keyboard/focus와 diagram browser frame/layout 성능이다. E4 완료·독립 IDE 착수·패키징/설치 없음.

## 최신 E4 — 클럭 취소·timeout·복구와 reader 회수 (2026-10-08)

worker page 대기 중에도 clock cancel/닫기/15초 timer가 caller를 종료하도록 abort race와 listener cleanup을 보완했다. 실제 native worker dispatch hold host run-MI2irN은 cancel31ms/close101ms/timeout15038ms·늦은 cursor publication 차단·실제 worker retry·닫기/Update 복구 PASS/receipt/exit0.4096신호 lifecycle8회 worker16/16종료·원본hash/peer유지·provisional RSS plateau PASS. 관련13/전체224 PASS·타입/개발 build exit0. [방법·근거·한계](docs/structure-cancel-recovery-acceptance.md). 다음은 physical progress Cancel/analysis 닫기·취소, 실제 keyboard tab-order/focus와 diagram browser frame/layout 성능이다. 인위적 dispatch hold/프로그램 cancel·reader memory 측정이며 physical Cancel/전체키보드/browser성능 수용과 E4 완료를 주장하지 않는다. 패키징/설치·사용자 소스 수정 없음.

## 최신 E4B — 기록 디버깅 왕복·닫기/재연결 (2026-10-08)

Windows 파형 command가 D:/d: 경로 차이로 열린 reader를 못 찾는 오류를 실제 host에서 발견하고 OS별 경로 비교를 보완했다. 최종 native run-aEBmL5는 Schematic3종/117값/양방향 cursor·wave 닫기/재열기·diagram 닫기/Update 재연결·clock 앞뒤 수용 PASS/receipt/exit0. 실제 UI run-9osJbW는35→45→35ns edge, linked wave35ns, 파형 Go45ns+Enter→diagram45ns, 기록 definition 열기를 확인했다. 전체224 PASS/0 FAIL/0 SKIP·타입/개발 build exit0. [실패·수정·근거·제한](docs/recorded-debug-roundtrip-acceptance.md). 다음은 긴 작업 취소/timeout/닫기·복구, keyboard tab-order/focus, browser/frame/memory 성능·규모다. E4 전체 완료나 이번 취소/성능 시험을 주장하지 않는다. retained run을 재사용했고 새 simulation/패키징/설치·사용자 소스 수정 없음.

## 최신 수용 — 실제4×4 화면 조작·소스 왕복 (2026-10-08)

격리 실제 host run-inrwoa에서16MAC/26boundary ports·배선 completeness를 확인하고 Fit21%/100%/pan·scroll21→31%·pe00 double-click/leaf ×·MUX·Register·clock/state 배선·keyboard0 Fit40%·hierarchy 부모 복귀·Open definition→소스 line1→diagram 탭 camera31% 보존→Fit을 물리 확인했다. receipt passed=true/로그 PASS/host exit0·타입/개발 build exit0. [근거·fixture 옵션·제한](docs/schematic-4x4-ui-acceptance.md). Fit 라벨이 작음·공통 제어선/상수 변환 밀집·source 왕복 page scroll 초기화는 남은 UX 제한이다. 아키텍처4×4 자동 배치/실제 frame 성능·전체E4 완료를 주장하지 않는다. 다음은 기록 simulation의 source/diagram/wave/clock 왕복·값/keyboard/focus·취소/닫기/복구/성능(E4B)이며 가독성 개선 후보를 기록했다. 이번 제품 수정 없이 physical harness만 확장했고 패키징/설치 없음.

## 최신 재개 — 구조 시험 복구·4×4 graph 검증 (2026-10-08)

사용자 재개 요청으로 작업을 이어갔다. closed-editor 실패를 단독 host에서 재현하고 시험의 오래된 TextEditor 참조를 현재 editor로 재획득하도록 보완했다. 미저장 문서 보존·structure refresh/parent fallback 및 최신 편집/semantic/포트/색상과 통합 native host run-cgbxeo receipt/exit0를 확인했다. 전체 최상위 회귀224 PASS/0 FAIL/0 SKIP·타입/개발 build exit0. 별도 실제 slang4×4 시험은16MAC·142nodes/100edges·26boundary ports·누락 배선0, 분석약1.25s/SVG약76ms PASS. [재현·보완·검증 근거·제한](docs/schematic-scale-acceptance.md). 다음은 실제4×4 화면 가독성/pan/zoom/Fit/leaf 진입, 이어 E4B 왕복/keyboard/focus/취소·복구·성능이다. 실제 browser 성능/물리 화면 수용과 E4 전체 완료를 주장하지 않는다. 패키징/설치·사용자 소스 수정 없음. 아래 과거 중단 기록은 이 사용자 재개 요청으로 해제되었다.

## 현재 작업 중단·재개 기준 (2026-10-08)

사용자 요청으로 진행사항을 기록하고 다음 요청까지 작업을 멈춘다. 최신 편집 개선은 관련 시험/실제 host 수용까지 완료했으며 E4 diagram/기록 디버깅은 미완료다. 재개 첫 작업은 closed-editor 구조 시험 오류 재현/보완, 이후 4×4/조밀한 구조·source/diagram/wave/clock 왕복·취소/복구/성능 검증이다. [완료 항목·검증 근거·제한·다음 실행 순서](docs/checkpoint-2026-10-08.md)를 이어받기 기준으로 사용한다. 새 패키징/설치 및 독립 IDE/엔진 착수 없음.

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

## 최신 사용자 요구 확인 — 설정·파형 자동화와 Simulation 단일 UX (2026-10-08)

TOML은 IDE가 관리하고 필요한 조정만 사람이 한다는 원칙을 재확인했다. 현재 코드에서 glob/예제/최소 설정 생성은 자동이나 test name/top/sources 등록은 명시적이며 U12 GUI 등록/자동 후보 발견은 미구현이다. 현재 Verilator --binary/trace flags는 TB dump 코드가 필요하다. 원본 소스 수정 없이 adapter 소유 tracing 보조 코드/runner, 기존 수동 dump와의 정책·top 기반 이름·recorded hierarchy/trace identity 보존과 GUI/CLI 일치 검증을 후속 방향으로 기록했다. Simulation은 제품 전용 UI, Testing은 공통 API UI이며 최종 제품 기본 진입점 통합은 H0에서 정한다. [현재 상태와 후속 방향](docs/simulation-setup-ux-direction.md). 이번은 코드 확인/요구 기록뿐이고 신규 구현/시험 없음. block diagram/기록 디버깅 E4 마무리 실행 순서를 유지하며 독립 IDE/자체 엔진을 조기 착수하지 않는다.

## 최신 구현 — 카드 우회 배선·교차 표시와 recorded 디버깅 재검증 (2026-10-08)

Schematic에 bounds/column/terminal 기반 직교 우회, 다른 source의 공선 겹침 방지, T 접속점/비접속 crossing gap과 canvas 위 불완전 안내를 추가했다. graph/type/conversion/source/관측 identity는 유지한다. 관련 geometry/renderer13 PASS·최종 전체221 PASS/0 FAIL/0 SKIP·타입 검사/개발 build exit0. 실제2×2 host run-ZHOpQB는10포트/4PE·routing 완성 assert와 부모100%/Fit·PE00/leaf 카드 우회·clock/feedback/gap을 물리 확인했다. recorded host run-z6ycAb는 Schematic MAC3종 모든 route·117기대값·clock/wave shared cursor·readonly source PASS/receipt/exit0. 최초 공선 통로 겹침과 실제 MAC edge15 product→enable 누락을 보완하고 private path 없는 fixture 회귀를 추가했다. [실패·보완·근거·제한](docs/schematic-routing-acceptance.md). 다음은4×4/조밀한 graph 표시·규모와 E4B 실제 source/diagram/wave/clock 왕복·keyboard/focus·성능·취소/닫기/복구 수용이다. E4 전체 완료가 아니며2M crossing pair 한도/가까운 평행선·복합 교차와 generate/array·연속 확대 제한은 유지한다. 현재 목표는 기록 기반 read-only 디버깅까지이며 live breakpoint/simulator step/operator 값 계산은 제외한다. semantic/Verilator 실행 변경·새 simulation/패키징/설치·사용자 counter 수정 없음. H0 별도 논의 유지. 아래 이전 다음 작업보다 이 실행 지점을 우선한다.

## 최신 구현 — 모듈 외곽·입출력 배치와 배선 분기 (2026-10-08)

Schematic에서 exact compiler declaration/동일 폭/유일 port identity만 왼쪽 입력·오른쪽 출력으로 배치하고 내부 연산/opaque child를 외곽선으로 묶었다. source별 routing spine과 fanout junction을 적용하며 기존 graph/type/conversion/source/관측 identity는 보존한다. 관련 renderer10 PASS, 전체 순차215 PASS/0 FAIL/0 SKIP·타입 검사/개발 build exit0. 격리 실제2×2 host run-i6FCdG는10 boundary ports/4PE assert, Fit→100%·pan·Fit·PE00 double-click/leaf symbols·부모 toolbar Up를 물리 확인하고 receipt passed=true/exit0. 초기 source spine 겹침은 보완/재확인했다. [근거·초기 발견·제한](docs/schematic-boundary-acceptance.md). 다음은 카드 bounds를 우회하는 배선과 다른 net 교차/접속점 구분·실제 화면 확인이다. 현재 긴 배선이 중간 카드 아래를 지나는 문제와 화면 밖 accessibility index 입력 문제는 남아 있고 E4 완료가 아니다.4×4·generate/array·연속 계층 확대·E4B source/wave/clock 왕복/접근성/성능/취소·복구·H0 별도 논의 유지. semantic/Verilator 실행은 변경하지 않았고 이전 simulation 근거를 유지한다. 새 패키징/설치·사용자 counter 수정 없음. 아래 이전 다음 작업보다 이 실행 지점을 우선한다.

## 최신 구현 — Schematic 심볼·입력 접점 첫 개선 (2026-10-08)

Schematic의 부모 결합/leaf 그래프에 공통 심볼(+/× 원형, MUX, Register D→Q/아래 클럭 단자)을 적용했다. compiler 노드·폭/부호/변환·source/관측 identity는 유지하며 operand 입력 접점을 분리하고 column 폭을 조정했다. Detailed leaf logic은 기존 상세 화면을 유지한다. 관련 renderer8 PASS, 전체 순차213 PASS/0 FAIL/0 SKIP·타입 검사/개발 build exit0. 실제 격리 host run-iRLRYg receipt passed=true/exit0로 진입·Update·미저장 RTL·모드/재열기 흐름을 확인했다. 최초 제한 환경 local HTTP 시험 실패·대기 종료1은 보존하며 로컬 서버 접근 가능한 환경의 전체 재검증을 통과했다. [구현·근거·제한](docs/schematic-symbol-acceptance.md). 다음은 실제2×2/leaf MAC 화면을 보며 모듈 외곽/상위 포트·fanout/교차선 가독성을 개선하고4×4·E4B 물리 왕복/접근성/성능/취소·복구 수용이다. 새 심볼 물리 화면 수용·generate/array·연속 계층 확대는 미완료. H0/H/I 별도 논의는 유지하고 새 패키징/설치·사용자 counter 수정 없음. 아래 이전 다음 작업보다 이 실행 지점을 우선한다.

## 최신 구현 — 기본 Schematic/표시 모드와 큰 canvas 흐름 (2026-10-07)

module 선택은 Schematic을 기본으로 분석하며 unsupported는 이유와 Connections fallback을 표시한다. Display selector(Schematic/Connections/Detailed leaf logic)는 Update·scope 이동에서 선택을 유지한다. current graph 재열기/편집은 재분석 없이 static 그림을 유지하고 stale 이동도 그림을 지우지 않는다. 늦은 분석·취소/재시도 경계를 검증했다. parameters/modules/connection 상세를 canvas 아래 접힌 Details로 옮겼다. 전체 순차211 PASS/타입·개발 build exit0, 실제 host run-s7uAg5 기본 분석·Update 모드/미저장 RTL·재열기 graph 보존 receipt/exit0. [근거·초기 대기/실패·제한](docs/structure-default-view-acceptance.md). 다음은 module 경계·연산/register의 간결한 schematic 표현과 fanout/배치 개선, 실제2×2→4×4·E4B 물리 입력/접근성·browser 비용/취소·복구 수용이다. semantic/Verilator 추출은 이번에 변경하지 않았고 이전 근거를 유지한다. generate/arrays·연속 확대·H/I 별도 합의는 남아 있다. 새 배포 패키징/설치·사용자 counter 수정 없음. 아래 이전 다음 작업 문구보다 이 실행 지점을 우선한다.

## 최신 구현 — 부모 연산/register와 자식 경계 결합 첫 범위 (2026-10-07)

별도 scopeOperations가 부모 자체 assign/operator/register와 직접 child instance의 opaque module-port를 연결한다. leaf internalOperations 계약은 유지하고 child output writer/폭·부모 입력·unsupported/partial-free 경계를 검사한다. Show module logic 버튼/명령과 그룹 module card/직교 배선·source/내부 진입·부모 named signal 관측을 연결했다. 전체 순차208 PASS/타입 검사·개발 build exit0, E1 포함 native18 PASS/새 semantic+실제 Verilator·retained7값 native2 PASS, actual host run-iIL6MT scopeOperations/편집·명시 Update/재열기 receipt·exit0. [근거·지원범위·미완료](docs/scope-operations-acceptance.md). 다음은 결합 분석의 기본 화면/Update 모드 정책, module 경계·register/연산 심볼·배선/큰 canvas의 간결한 표현과 실제 UI 수용이다. generate/arrays·4×4·E4B 물리/접근성/성능·취소/복구·연속 확대는 남아 있다. 사용자 counter 변경·새 배포 패키징/설치 없음. 아래 이전 다음 작업 문구보다 이 실행 지점을 우선한다.

## 최신 구현 — 모듈 경계·직접 신호 배선 첫 범위 (2026-10-07)

compiler-confirmed internalSignal/directSignal을 hierarchy에 공급하고 VS Code 독립 buildScopeConnections가 모듈 경계와 immediate 자식 블록을 exact declaration identity로 연결한다. 직접 whole-signal만 단일 driver→sink 직교 배선/topology column으로 그리며 식·slice·cast·폭 변환·상수·interface·다중 driver/inout은 추정하지 않는다. examples/systolic-mini의4 PE/12nets/20wires·expression 격리/leaf 연산·실제 Verilator PASS 및 retained VCD의4값 대조 native2 PASS; 전체 순차205 PASS/타입 검사·개발 build exit0. [근거·초기 오류·범위](docs/scope-connections-acceptance.md). 다음은 자식 경계가 있는 모듈의 자체 assign/연산/register 추출과 net 모델 결합이다. 현재 schematic 전체 완성이 아니며 새 레이아웃의 물리 UI/4×4 및 E4B 접근성·성능/복구를 유지한다. 사용자 counter 변경·새 배포 패키징/설치 없음. 아래 이전 다음 작업 문구보다 이 실행 지점을 우선한다.

## 최신 구현 — Structure 전용 작업 공간 첫 범위 (2026-10-07)

Activity Bar Structure 아이콘/컨테이너와 RTL Hierarchy 이동, visibility→중앙 canvas 진입, 최초 분석 전 Update 화면, 기존 panel 재사용을 구현했다. 편집 시 마지막 hierarchy/static graph를 유지하고 변경 표시·오래된 소스 이동 차단, 명시적 Update는 기존 미저장 RTL overlay를 반영하며 저장하지 않는다(사용자 입력 정책 답변은 대기). 최종 전체 순차202 PASS/0 FAIL/0 SKIP·타입 검사/개발 build exit0. 최초 모형/contribution 가정 실패는 보완, 기존40ms 취소 시험 병행 부하 실패는 미해결로 기록. 실제 host run-djoKya receipt passed=true/exit0: 분석 없는 진입·편집/수동 갱신·재진입·닫기/재열기 확인. [구현·검증·제한](docs/structure-workspace-acceptance.md). 다음은 자식 블록과 현재 모듈 자체 net/연산/저장소의 scope 모델·표시/배치 결합, 작은 2×2 fixture다. E4B 전체 물리 입력·접근성·browser 비용/복구는 유지하며 목표 schematic 완료가 아니다. 새 배포 패키징/설치 없음.

## 사용자 확인 — Structure 아이콘 진입점 (2026-10-07)

가장 왼쪽 Activity Bar의 전용 아이콘을 누르면 RTL Hierarchy와 중앙 구조도 화면으로 들어가는 것으로 확정했다. Simulation과 같은 진입 방식이며 추가 명령 없이 구조도를 열거나 다시 보여주는 흐름이다. [확정 요구](docs/structure-schematic-direction.md). 미저장 코드의 Update 반영 정책은 확인 대기, 제품 구현/새 검증 없음.

## 최신 사용자 방향 — 모듈 중심 schematic 작업 공간 (2026-10-07)

사용자 4×4 systolic_array / mac_pe 그림으로 목표를 명확히 했다. 현재 모듈의 배선·연산·저장소와 자식 모듈의 경계 블록을 함께 보여주고, 내부 진입 시 해당 자식의 구조를 보여주는 별도 작업 공간이다. 자동 편집 갱신 대신 명시적 Update, 최종적으로 계층 확대에 따른 내부 펼침을 원한다. **현재 port 연결도와 leaf 연산 그래프는 기반이며 목표 schematic 완료가 아니다.** [요구·현재 차이·제안 순서·확인 대기](docs/structure-schematic-direction.md)를 먼저 읽는다. E4B 정확성/접근성/복구 게이트는 유지하되 기존 외형 수용만으로 목표 완료를 선언하지 않는다. 다음은 사용자 화면/Update 답변 반영 후 scope 모델·표시/배치 재설계 범위 구체화이며 H/I 착수 합의는 별도다. 이번은 문서만 변경, 새 구현/시험/패키징 없음. 아래 이전 다음 작업 문구는 이 방향과 함께 읽는다.

## 최신 작업 — E4A 실제 graph 가독성·기본 규모 검사 (2026-10-07)

MAC24node graph의 실제 +/pan, 추가100% 버튼→첫 신호 가독성→Fit44% 복귀를 격리 개발 창에서 확인했다. 실제 확인 중 중앙 wire-only 확대를 발견해100%는 graph 시작20/20으로 보완했다. native98/146node 분석·SVG 생성과256node 초과의 partial-free 거부1 PASS, 최종전체200 PASS/타입·개발 build/실제 host run-FyR9NC receipt·exit0. 초기40ms 취소 시험 timedOut 실패와 단독 재실행 통과를 보존하며 해결됐다고 하지 않는다. [측정·실제범위·초기실패·남은작업](docs/visual-debugging-e4a.md). **E4 진행 중, 다음 E4B**는 모듈/source/wave/clock 실제 왕복·접근성·browser 비용·취소/복구 수용이다. H0 진입 전 E4 완료 판단이 필요하다.0.3.1 배포물 SHA 유지·새 패키징/설치 없음. 아래 기록은 이전 시점 근거다.

## 최신 작업 — E3 pipeline MAC 예제/reference 종단 검증 (2026-10-07)

별도 examples/pipeline-mac에 signed4/signed8 parameter 변형과 unsigned4,13cycle reset/hold/latency/overflow·잘림 예제를 추가했다. SV longint assertion과 독립 BigInt/reference 표, retained graph/trace의117기대값·edge 전/최종값을 대조했다. 잘못된 same-cycle product 누적은 cycle2 runtime assertion FAIL을 확인했다. 전체199 PASS/native integration1 PASS/타입·개발 build, 실제 host run-qMDhox 세 graph·117값·clock/wave cursor·readonly source/receipt/exit0 통과. [근거·사용·초기 시험 오류·제한](docs/pipeline-mac-acceptance.md). 다음은 **E4 실제 시각화 UX·성능·복구 수용**이다. 물리 조작/가독성·대표 규모 및 열린 Windows/사용자설계 게이트는 유지한다. 기존 counter/0.3.1 배포물 SHA 유지·새 패키징/설치 없음. 아래 기록은 이전 시점의 근거다.

## 최신 작업 — D4 선택 클럭 에지 기록 탐색 (2026-10-07)

명시적 one-bit clock 선택·Rising/Falling·Previous/Next 버튼을 보존 포트/내부 연산 화면에 추가했다. strict 0→1/1→0만 탐색하고 X/Z·초기값·현재 tick을 제외한다. 최대4096기록/query와 continuation·Cancel/15초 제한·page/job/reader/revision 경계를 사용하며 공유 cursor/최종 기록값을 유지한다. 전체198 PASS/타입·개발 build, 실제 host run-5Xkabh MAC 값·첫/끝·상승/하강·복구 뒤 파형 cursor 및 receipt/exit0 확인. no-edge 알림 dismiss 대기를 수정했다. [근거·지원 범위·초기 실패](docs/clock-edge-acceptance.md). 다음은 **E3 pipeline MAC 종단 예제/reference 검증**이다. 물리 graph/clock UI와 대표 규모 수용은 E4, Windows/사용자설계 등 열린 게이트는 유지한다. 0.3.1 배포물 SHA 유지·재패키징/설치 없음. 아래 기록은 이전 시점의 근거다.

## 최신 작업 — E2 기록된 내부 신호 관측값 (2026-10-07)

검증된 retained graph의 compiler 선언 이름과 segmented instance path를 같은 run의 VCD에 연결했다. named signal만 조회하고 operator/next-state 값은 추정하지 않는다. missing/ambiguous/width/unsupported·X/Z·무효화, 기존 page/job/revision·reader 경계와 공유 커서를 유지한다. 최종전체191 PASS/native semantic20 PASS/타입·개발 build, 실제 host run-H5FiNt에서 8/16bit MAC raw 값·양방향 커서·닫기/재열기·현재 소스 격리·trace 손상/복구·시뮬레이션PASS/receipt 및 exit0 확인. [구현·근거·제한](docs/internal-operations-e2.md). 물리 graph 조작/가독성·대표 규모 수용과 E3 전체MAC 예제는 남아 있다. 다음 구현은 **D4 선택 clock/edge 기록 탐색**이며 live simulator step이 아니다. 0.3.1 배포물 SHA 유지, 재패키징/설치 없음. 아래 이전 작업/검증 기록은 당시 근거로 보존한다.

## 최신 작업 — E1 정적 내부 연산 그래프 첫 범위 (2026-10-07)

편집기 독립 graph 계약·slang AST allowlist/변환과 기존 구조 창 Internal operations/Port connections 전환·소스 이동·canvas 재사용을 구현했다. next-state/register feedback/hold·계산 폭/부호·형 변환을 구분하고 unsupported/multiple-writer/cycle·한도를 검사한다. current overlay와 검증된 recorded 입력/readonly 소스, stale/nonce/취소·late result 경계를 유지한다. 최종전체186 PASS/native semantic20 PASS/타입·개발 build, 실제 개발 host run-U5Hfge receipt passed=true/시뮬레이션PASS/current·recorded graph·source·무효화/host exit0 확인. [구현·초기 실패·검증·제한](docs/internal-operations-e1.md), [업데이트한 로드맵](docs/pre-ide-roadmap.md). 물리 클릭/화면 가독성·대표 graph 규모 수용은 E4에 유지, 내부 관측값과 clock replay 미구현. 다음은 E2 보존 graph named signal의 segmented trace 매핑이다. 원래0.3.1 VSIX/ZIP SHA 유지·재배포/설치 없음.

## 최신 작업 — E0 내부 연산 추출 가능성 검증 (2026-10-07)

개발용 pyslang probe와 counter/adder·두 parameter 폭의 signed MAC/unsupported fixture를 추가했다. net initializer와 variable startup 구분, 연산/형변환 폭·부호·source, always_ff clock/edge·reset/enable·NBA 추출을 확인했다. 실제 Verilator 내부 product/stage/acc의 segmented trace identity·폭·raw 값 대조 native2 PASS, 최종 전체184 PASS/타입 검사·개발 build exit0. 초기 display path 시험 실패와 병행 부하의 기존 취소 시험 실패를 보존하며 timing 민감성은 해결했다고 하지 않는다. [결과·계약·제한](docs/internal-operations-e0.md), [업데이트한 로드맵](docs/pre-ide-roadmap.md). E0 실험 완료이며 graph 제품 화면/내부값 연결은 미구현. 다음은 E1 allowlist/모델 변환·counter/adder 정적 화면이다. VSIX0.3.1·사용자 예제는 유지하고 재배포/설치는 하지 않았다.

## 최신 실행 계획 — 독립 IDE 전환 전 로드맵 (2026-10-07)

사용자 합의: VSIX 0.3.1은 스터디 피드백용으로 유지하고 새 개발은 **E0 지원 범위/semantic 추출 확인 → E1 정적 내부 그래프 → E2 기록된 내부 신호값 → D4 선택 clock/edge 기록 탐색 → E3 pipeline MAC 검증 → E4 UX·복구 수용 → H0 사용자와 독립 IDE 아이디어 논의** 순서다. [작업별 산출물·지원 범위·완료 기준·검증 표](docs/pre-ide-roadmap.md)가 상세 실행 기준이다. 독립 IDE H와 자체 compiler/simulator I는 착수 시점에 사용자와 아이디어를 발전시키고 별도 계획을 합의한 뒤 구현한다. 지금 Code-OSS fork/엔진 방식이나 화면 사양을 확정하지 않는다. 베타 중단·정확성 결함은 병행 수정하고 열린 검증 게이트를 보존한다. 이번에는 문서만 정리했으며 신규 기능 구현·시험·VSIX 재생성은 하지 않았다. 아래 과거 다음 작업 문구보다 이 계획을 우선한다.

> 2026-10-06 저장소 준비: 루트 .gitignore를 정리했다. workspace dist/node_modules, .dev/.rtl, 생성 VSIX/notice, 환경 파일 등을 제외하고 소스·tests·docs·예제·lockfile·공유 .vscode 설정을 유지한다. 격리 Git 저장소에서 제외8/유지9 경로 확인. 실제 프로젝트 git init/업로드 및 배포 패키지 재생성은 하지 않았다.

## 최신 실행 지점 — F1X 스터디 비공개 베타 (2026-10-06)

사용자 승인으로 0.3.1 VSIX/CLI/새 예제/안내 ZIP 배포를 준비했다. 정식 stable·독립 앱이 아니다. 전체184 PASS(초기 오래된 DOM 참조2 FAIL 수정)/타입 검사·build, 실제 VSIX 격리 설치 및 설치 폴더 native 편집/semantic/두 PASS/내장 파형·보존 구조 ready/host exit0, 배포 CLI check·두 PASS·hierarchy exit0와 GUI/CLI 결과 일치를 확인했다. 언어 빠른 재시작의 pending changes TypeError가 발견돼 알려진 제한으로 남긴다. 깨끗한Windows/대표사용설계·장시간/프로필·일부 실제입력 게이트는 유지한다. 다음은 스터디 설치·실사용 피드백 수집 → 언어 재시작 경쟁 및 중단 오류 우선 수정 → 0.3.x 회귀 검증이며, 후속 U12/독립 앱은 기존 순서를 따른다. [수용·발견 문제·재현](docs/private-beta-acceptance.md), [설치 안내](docs/private-beta-guide.md). 이전 VSIX 금지/미배포 기록은 당시 상태이며 이번 명시적 배포 요청이 우선한다.

# 현재 진행현황

기준일: 2026-10-06. 전체 요구/구현 상태/다음 순서는 [제품 로드맵](docs/project-roadmap.md), 재시작은 [인수인계](docs/handoff.md)를 읽는다. 과거 작업 결과는 [진행 이력](PROGRESS-history.md)에 보존했다.

## 이번 작업

F1W 실제 progress Cancel 버튼 검증 통과(run-odiLDS): 테스트 전용20초 load dispatch 지연에서 native 클릭으로 target reader 종료·document 제거, 기존 peer 값 유지, 정상 재열기/값 복구·3/3worker exit/SHA/host exit0 확인. 관련4 PASS/타입 검사·개발 build 통과. [실제 조작·제한 조건](docs/waveform-physical-cancel-acceptance.md). 제품 코드 변경 없음. 일반 parse 중 물리 취소 latency/전체 안정화 수용은 아니며 실제 입력/Escape·프로필 잔여 및 대표 설계·장시간/깨끗한Windows 게이트를 유지한다.

F1V 합성 중간 규모 취소·메모리 회복 검증: 4096신호 두 reader의 native loading중 닫기/peer 보존/4cycle/worker9개 종료/SHA 검증 통과. 최종15초 자연 idle 두 실행에서 RSS baseline221–222MiB→191–193MiB 회복을 재현했다. 초기3초 미회복도 보존한다. 독립8cycle16reader exit, 256RTL파일 분석·실행중 취소/재시도1 PASS, 관련23 PASS/타입 검사·개발 build 통과. [근거·측정조건·제한](docs/waveform-memory-recovery-acceptance.md). 제품변경 없음. 다음 물리 Cancel 조작·취소 복구와 잔여 입력/프로필 수용, 실제 설계 경로 제공 시 대표 프로젝트 검증. 전체 규모·메모리 수용/깨끗한Windows 완료는 아니다.

F1U 기본 사용자 편집 설정과 설치된 Verilog HDL 1.29.0을 격리 복제해 editor/semantic native 검사 통과(run-22Vp8d), 실제 module/package/begin Tab 및 begin Enter의 내용·커서 검증 통과(run-MmeiXH), 두 host exit0. 11 lexical PASS/semantic unit7 SKIP/타입 검사·개발 build 통과, 원본 설정 SHA 유지. 외부 linter는 PATH의 실행 파일 미발견으로 동작하지 않았으므로 정상 외부 diagnostics 충돌은 미검증이다. [근거·범위·재현](docs/editor-profile-acceptance.md). 다음 대표 규모·loading 취소·두 reader 메모리 복구, 편집 프로필 잔여는 별도로 유지한다.

F1T 보존 결과·구조·파형 경계 재검증: 관련 32 PASS/타입 검사·개발 build 통과. 실제 VS Code run-Mpz1Al에서 package/include를 포함한 두 시뮬레이션, 보존 소스/구조/값·양방향 커서·닫기/재열기·손상 차단/복구 통과, host exit0. 별도 generate/array/escaped·한글/공백 경로 Core/worker 실제 검사 1 PASS. 제품 변경 없이 late values 무효화 회귀를 추가했다. [근거·초기 대기·지원 범위](docs/recorded-boundary-acceptance.md). 다음 실제 사용자 편집 프로필 충돌→대표 설계·loading 취소·두 reader 메모리 복구. 전체 안정화/배포 완료는 아니며 깨끗한 Windows 보류는 유지한다.

F1S 기본커서 재사용 실제drag/zoom/pan/하단scroll·Reload 확인완료. run-xbQA9K 모든관측32/128값 oracle·Reload equality/SHA/host exit0. cursor RTT3.3–4.5ms, viewport변경143.7–168.1ms는 남음. 외부전원알림에가린중앙품질은미검증. [근거·범위](docs/waveform-cursor-physical-acceptance.md). 제품코드변경없음. 다음 열린3묶음중retained 구조·파형 연동경계검증, 이후실제프로필/대표설계·RSS. 아래F1R다음UI문구는이전상태다.

F1R cursor-only 기본적용: 진행중values+resize/zoom/pan/pointer reorder·late응답/오류full복구 및real/128bit/zero/empty 검증. 오류시cache폐기 보완. 42 PASS/typecheck/build, 기본flag없는native run-lGGL2k8exit/값·latest/Reload-close·peer/SHA/host exit0. [범위·기본적용·남은게이트](docs/waveform-cursor-reuse-acceptance.md). 다음 실제연속cursor/확대혼합UI 반응성, 전체안정화게이트유지.

F1Q 검증전용 cursor-only 재사용 후보 구현/A/B: 동일viewport 최근1개+새raw값만조회, loading/init/latest/ID순서 guard. 관련41 PASS/typecheck/build, 원본1·후보2 native 각각8exit/값·X/Z·latest/Reload-close·peer/SHA/host exit0. 동일fixture cursor왕복 원본73.5–98.7ms→후보2.2–4.3ms, 신규payload1020bytes(기존923982). [근거·초기검사실패·범위](docs/waveform-cursor-reuse-candidate.md). 기본경로미활성화; 다음혼합viewport/resize/reorder/real·wide·zero/error 경계검증 후채택판단.

F1P 밀집조회/전달계측 추가: 명시dev/test host queue/window duration 및 실제payload post-lifecycle 복사벤치. 두 native run-ZPfvt9/run-qgFuCm 각각8exit/값·latest burst/Reload-close·peer/SHA/host exit0, 관련40 PASS/typecheck/build exit0. 두번째dense worker28.87ms/host39.65ms/full84ms/draw9.7ms, payload923982bytes. [측정의미·한계](docs/waveform-transport-profile.md). 다음 동일viewport cursor-only 제한재사용 후보A/B. 이번작업은 제품캐시/압축 채택이 아니며 RSS/대표설계 전체게이트유지.

F1O F1N 잔여 실제 창 검증 완료: 2분 이후 최신 cursor32부모/128bit 값 대조, 같은 창1→160행 overflow전환/최대화·복원/앱zoom 커서정렬, Ctrl+- 정확한범위유지 및 일반 확대·pan 확인. run-ljPKYm 원본SHA/host exit0, 관련39 PASS/타입검사·개발build exit0. [근거와 제한](docs/waveform-native-layout-acceptance.md). 다음 dense query/전달비용. OS DPI/physical Esc/대표설계·프로필/RSS 등 전체게이트유지.

F1N 실제 canvas 포커스 Ctrl+-/일반 minus·equal, 오른쪽 cursor 정렬/Signals 폭 변경 및 긴 절대시간 두 줄 표시를 관찰했다. 2분 뒤 진단이 새 결과를 거부하는 문제를 보완하고 관련39 PASS/타입 검사·개발 build exit0. 수정 후 native 창에서 사용자 물리 Escape로 중단되어 최종 장시간 프로필/overflow 검증은 남았다. [실제 범위와 재시작](docs/waveform-native-checkpoint.md). 절대시간 디자인은 추후 실제 사용 피드백에 따라 개선할 수 있다.

F1M 사용자 피드백에 따라 viewport-relative 눈금/Origin을 제거하고 절대 시간으로 복원했다. 짧은 값은 기존한줄, 긴소수값은 정수시각/나머지(source unit) 두줄이며 둘의합은 정확한 절대시각이다. shared scroll/gutter 커서정렬·viewport 그리기는 유지. 관련6 PASS/타입 검사·빌드 exit0, native픽셀재검증 없음. [표시결정과검증](docs/waveform-absolute-time.md). 다음F1L native잔여→dense전달 순서유지. 아래 F1L는 이전 기록이다.

F1L 그룹 이동/Esc 취소/폭·DPR 회귀를 bundled 실제 화면 코드에 추가했다. modifier 없는 zoom/pan만 가로채도록 보완해 Ctrl/Meta/Alt 편집기 단축키 충돌을 방지한다. 관련37 PASS/타입 검사·빌드 exit0. 실제 run-sGbRnL Shift 범위선택+두행 drag 순서/앱zoom 관찰/SHA/host exit0. 최종run-Pz50OV160행준비·종료/SHA/host exit0이나 사용자 입력과 겹쳐 최종container Ctrl+-는 물리 미검증. [범위와 남은 검사](docs/waveform-interaction-regression.md).

다음짧은native canvas포커스 Ctrl+-/일반shortcut·overflow/오른쪽cursor resize 확인 후dense query/전달 조사. VM Esc/DPR 통과를물리전체합격으로쓰지 않는다. 대표설계/프로필/RSS/기록경계보류 유지, VSIX/사용자예제 변경 없음. 아래 F1K는 이전 기록이다.

F1K 눈금/파형의 스크롤바 폭 차이를 없애려고 ruler와trace를 같은 scroll surface로 묶었다. 큰 원점은 기준시각+상대 눈금, viewport+43px만 plot/bit 투영, offscreen 값 갱신·scroll reveal/resize redraw·Reload 위치 복원 적용. [구현·초기 실패·검증](docs/waveform-viewport-alignment.md).

관련35 PASS/타입 검사·빌드 exit0, 최종native run-T0BtBf32/128값·20연속 요청·Reload-close/peer/재열기·8exit/SHA/host exit0. dense draw14.3ms/RTT99.6ms는 단일 관측이며 전체성능 수용 아님. 실제 run-7uWK3q 물리cursor/ruler클릭/scroll reveal/Reload 아래위치/Signals폭변경 정렬·32/128값 oracle/SHA/host exit0. 다음 그룹이동/Esc/overflow/resize·DPI 회귀, dense 전달 비용. 대표설계/실제프로필/RSS/보존경계 게이트유지. 아래 F1J는 이전 기록이다.

F1J 실제 Windows 마우스로160행 파형의 스크롤/범위 확대/행 재배치/커서 드래그/Reload를 확인했다. 32부모+128bit 값 전체 대조 및 Reload 순서·확장·범위·커서 equality/SHA/host exit0. 관련31 PASS/타입 검사·개발 빌드 exit0. 격리 수동 harness 준비 대기·프로필 관찰을 추가하고 최종 준비/종료도 native 재검증했다. [결과와 한계](docs/waveform-physical-ui.md).

밀집 왕복192–348ms/그리기182–268ms로 매끄러운 반응성은 미수용. Reload 스크롤 초기화/큰 절대 시간 라벨 가독성/재배치 대기 시 빈 plot을 후속 개선으로 기록했다. 다음 visible-row 비용 계측과 scroll/reveal 안전한 후보 검증. Ctrl/Shift 그룹·Esc·resize·빠른 물리 입력/실제 프로필/대표 설계/보존 경계/RSS 게이트 유지. 배포/사용자 예제 변경 없음. 아래 F1I는 이전 기록이다.

F1I dense 비용을 worker query/왕복과 renderer 준비·부모plot·bit투영·bitplot으로 분리했다. 인접 bucket 검색 결과와 현재 query 경계를 재사용하고, 그리기마다4096항목 이내 시간 좌표를 공유한다. 최종 run-Qv9vJv 밀집 요청111.4ms/그리기127.1ms, worker조회20.61ms(추가 burst35ms)로 관찰됐다. 단일 native 전후 측정이며 성능 비율/전체 수용을 주장하지 않는다.

조회 중20연속 요청의 최종 값·Reload 로딩 중 닫기/peer 유지/재열기·8exit/SHA/host exit0. 최종 관련31 PASS/typecheck/build exit0. 짧은 요청을 놓치던 검증 폴링은 실제 시작 이벤트로 바꿨다. [초기 실패·최종 근거·한계](docs/waveform-dense-recovery.md). 밀집 전달/bit plot 비용과 물리 조작/RSS 회수는 남으며 VSIX/사용자 예제 변경 없음. 아래 F1H는 이전 기록이다.

F1H32부모+128bit/활동 구간·dense/확대·Reload·peer/닫기 스트레스를 검증했다. 160행 그리기1004–1236ms 문제를 찾아 크기/테마 읽기를 쓰기 전에 모으고, 같은 폭의 눈금 계산을 공유하도록 수정했다. 최종 run-a7v4rO 그리기45.9–188ms, 모든 부모/비트 값·Reload 범위/커서 복원·4exit/SHA/host exit0, 관련29 PASS/typecheck/build exit0.

dense32행 요청200.2ms+그리기188ms는 아직 반응성 개선 대상이다. host loop46.14ms를 renderer 지연으로 쓰지 않는다. RSS 초기227→최종330MiB로 회수 미입증. [발견·수정·최종 근거](docs/waveform-render-stress.md). VSIX/사용자 예제 변경 없음. 아래 F1G는 이전 기록이다.

F1G 실제 webview 요청왕복·canvas 그리기·프레임 기회 계측을 추가했다. Development/Test + 명시적 flag에서만 켜지고, nonce/샘플 한도·Reload 취소 보호·저장 보기 분리를 유지한다. 실제 run-risLLx8editor/32visible sample/24cursor probe·X/Z·9exit/peer/SHA/host exit0, 관련28 PASS/typecheck/build exit0.

기본8신호에서 query왕복 중앙값7.75ms, canvas그리기4.65ms, init수신→첫 doubleRAF62.1–97.7ms, renderer 관측 포함 phase host loop52.36ms. 실제 픽셀 표시/물리 조작 검증과는 다르다. RSS 초기204→최종403MiB로 회수 미입증. [정의·근거·한계](docs/waveform-render-profile.md). 다음 최대행/비트·활동 구간 확대·dense/reload UI 스트레스, VSIX/사용자 예제 변경 없음. 아래 F1F는 이전 결과다.

F1F 제한된 값 공유를 제품 파서에 적용했다. parse별4096항목/65536문자/64bit 이하만 공유하고 예산이 차면 그 parse의 조회를 중단한다. 원본/후보3종×4쌍24worker 비교에서 전체digest·SHA 동일. 반복8bit 자료56.871→38.878MiB(31.6% 감소), parse중앙값663.64→717.33ms(+8.1%) 절충이다. 고유16bit/256bit 중앙값 증가 없지만 편차가 있어 속도 개선으로 쓰지 않는다.

관련26 PASS/타입 검사·개발 빌드 exit0. 실제 run-w4sxss4cycle/9exit/로딩 중 닫기·재열기/peer 값·SHA 유지/host exit0, phase loop max41.75ms. RSS 초기206→close347–370/최종386MiB로 초기 회수는 미입증. [비교·지원·한계](docs/waveform-value-reuse.md). VSIX/사용자 예제 변경 없음. 아래 F1E는 이전 기록이다.

F1E CPU/할당·live worker heap 진단을 마쳤다. 새 개발용 계측 도구가 worker 내부에서 직접 GC/heap을 측정하고 CPU·할당 원본 profile을 보존한다. 중간 규모4096신호/786432전이에서 파형 자료의 retained 증가56.878MiB, 자료 해제 후 입력을 유지한 기준선 대비 잔여0.117MiB다. 프로세스 전체 RSS 회수 판정과는 다르다.

258종류의 값을 공유하는 **해석 후 진단 실험**은17.937MiB(자료 증가분의31.5%)를 줄이고 전체 시간/값 digest를 유지했다. 제품 파서에는 아직 적용하지 않았다. 최종 plain parse1.91–2.04s는 환경 통제 없는 진단이며 F1D와 속도를 비교하지 않는다.5worker exit/불변성 통과·관련24 PASS·타입 검사/개발 빌드 exit0. [근거·한계·재현](docs/waveform-parser-profile.md). VSIX/사용자 예제 변경 없음. 아래 F1D는 이전 결과다.

F1D 구간별 계측을 추가했다. 일반 요청은 기존대로 두고 명시적 진단 요청에만 worker read/decode/parse/hash 시간을 반환한다. 격리 실제 host에서 warm editor open/query/close와 loop 지연을 분리했다. 관련24 PASS/0 fail/skip·타입 검사/개발 빌드 exit0, run-hA0nMr 실제4cycle/9exit/peer 값·SHA 보존/host exit0.

파일 read3.61–9.83ms, parse715.99–957.57ms, editor open828.42–1118.35ms, warm phase host loop max41.88ms. 이번 열기 비용은 주로 parse다. 이전900ms는 미재현/원인 미규명이며 성능 개선 전후 비교로 취급하지 않는다. RSS 초기199→close422–448/최종469MiB로 초기 회수 미입증. [측정 경계·receipt·재개](docs/waveform-phase-profile.md). VSIX/사용자 소스 변경 없음. 아래 F1C 등은 이전 결과다.

F1C 파형 안정화: enum 준비 중 취소 후 ready 커서/metadata가 남던 문제를 수정했다. 취소 시 연결·화면 자료를 비우고 worker 종료를 기다리며 늦은 standalone 응답을 게시하지 않는다. 다른 reader는 유지하고 Reload로 재시도할 수 있다.

관련26 PASS/0 fail/skip, 타입 검사·개발 빌드 exit0. 실제 run-5rYxEQ에서 loading tab 닫기→재열기·두 custom editor4회·다른 reader 정확한 조회·9/9 실제 worker exit·SHA 불변, receipt passed=true/host exit0. RSS 초기202MiB→close338–412MiB/최종433MiB, host 지연 max900.20ms로 임시200ms 초과. 기능 정리는 통과했지만 메모리 회수/성능 수용은 미완료다. [증거·제한·다음 계측](docs/waveform-cancel-lifecycle-acceptance.md). VSIX/사용자 예제 변경 없음. 아래 U05 등은 이전 작업 결과다.

U05 enum 파형 이름 1차 구현: Auto (enum names)에서 보존 실행의 IDLE/LOAD/DONE을 표시한다. 정확한 경로/폭·분석 전후 보존 입력 검증, X/Z·알 수 없는 값 숫자 fallback, 숫자 override·1bit enum/펼친 bit 분리를 유지한다. 현재 RTL 이름을 옛 파형에 섞지 않고 runtime을 자동 설치하지 않는다. array/struct/class·단독 VCD 타입 추정은 제외한다.

최종 관련52 PASS/0 fail/skip·실제 Verilator/slang 통합1 PASS(17.907s)·타입 검사/개발 빌드 exit0. 실제 VS Code에서 enum/Hex 전환을 확인했고 Reload 커서 초기화 문제를 발견·보완했다. 최종 run-enum-PiWgE4에서7.486ns LOAD 유지, receipt passed=true/enumNames=true/traceReady=true/sourceUnchanged=true/cursor7486·host exit0. [지원 범위·증거·이전 결함](docs/waveform-enum-acceptance.md). 전체 회귀/대표 규모/VSIX 없음. 아래 U04 등은 이전 작업 근거다.

U04 회로도 canvas 1차를 구현했다. 빈 공간 drag·포인터 중심 휠 zoom·+/−·Fit, scope별 camera 복원/resize, 기존 내부 탐색·소스·기록 값 경계 유지. 관련23 PASS·타입 검사/개발 빌드 exit0. 실제 VS Code에서101→124% 확대·drag·내부 진입/상위 복원·Fit·15ns 포트 값 확인, 최종 profile receipt passed=true/sourceUnchanged=true/traceReady=true와 host exit0. 초기 fixture 종료 실패와 재검증 범위는 [수용 문서](docs/structure-canvas-acceptance.md)에 기록했다. 노드 자유 배치/내부 연산은 미구현이며 새 native 실행/전체 회귀/VSIX 없음.

U03 Simulation 테스트 입력 변경 표시를 구현했다. Outdated 경고와 Checking inputs/Inputs unknown/Unsaved edits를 구분하며 이전 PASS/FAIL·파형은 유지한다. 자동 package 순열의 기록 비교를 Core에 추가하여 변경 감시마다 semantic 분석을 실행하지 않는다. 취소·세대 검증으로 과거 응답의 덮어쓰기를 차단한다.

관련33 PASS + 보존 입력/trace 회귀10 PASS, 타입 검사·개발 빌드 exit0. 실제 격리 VS Code에서 native2 PASS(counter_basic19.545s/counter_reset19.155s), DUT 변경/복원·dirty TB·저장 후 해당 대상 격리·설정 변경/복원, receipt passed=true/host exit0 확인. [정확한 범위·미검증·제한](docs/input-freshness-acceptance.md). 시각 물리 수용/전체 회귀/대표 설계 완료 아님. VSIX 없음.

U12 가벼운 프로젝트/테스트벤치 자동 탐색 요구를 검토하고 [설계 제안](docs/project-discovery-direction.md)을 기록했다. 권장은 후보 자동 탐색 + 사용자가 실행한 top/설정 기억 + 모호한 입력만 GUI 선택이다. 현재 glob 추적/package 순서와 미구현 후보 발견/최소 source graph를 구분했다. 코드 변경·추가 실행 시험 없음. 기존 U03 다음 순서를 이번 논의만으로 변경하지 않는다.

U02 Simulation 전용 Activity Bar를 구현했다. Tests/Run History, Run All·다중 선택 실행·Stop, 테스트 행 ▶/파형/소스 액션. 설정은 제목 overflow, 샘플은 빈 화면 안내에 둔다. 기존 Core/Testing API를 재사용한다. 등록 TB의 Explorer 우클릭/편집기 상단 실행을 추가했다. **U11 요청의 파일 행 hover ▶ 자체는 미구현**이며 독립 IDE workbench 항목으로 보존한다.

관련24 PASS/0 fail/cancel/skip, 타입 검사·개발 빌드 exit0. 실제 VS Code1.140.0에서 Simulation 분리·행 선택·소스·최근 파형 열기와 native counter_basic PASS16.052s/새 VCD를 확인했다. TB 우클릭 메뉴 표시·DUT 제외 확인. [정확한 수용·제한](docs/simulation-panel-acceptance.md). 새 전체 회귀/대표 설계 수용/VSIX 없음.

기존 25개 아이디어·6단계·delivery A–I·최근 UI 제안을 대조해 하나의 상태표로 통합했다. hierarchy는 탐색 기반이다. 현재 Structure는 고정 배치 연결도에 camera 이동/확대를 제공하며 노드 자유 배치와 내부 연산 그래프는 남아 있다.

U01 단일 커서를 구현했다. Cursor/Zoom range 두 도구, toolbar 현재 시각, B/Delta/별도 strip 제거. 기존 B 상태를 무시하고 저장 보기·구조 공유 커서 계약을 유지한다. 관련 waveform 34 PASS + structure-view 7 PASS, 타입 검사·개발 빌드 통과. 격리 VS Code1.140.0에서 두 도구 표시·구간 확대·14.788ns 값 조회·10ns Snap 확인, host exit0. [정확한 시험 범위](docs/waveform-cursor-acceptance.md). 전체 회귀/대표 설계 수용을 다시 수행한 것은 아니다.

## 다음 순서

다음은160행 물리 scroll/zoom/drag 반응을 확인하고, 필요하면 visible-row 그리기와 전달/serialization 비용을 측정한다. offscreen 값을 유지하고 scroll/reveal 재그리기·latest request·Reload/취소 복구를 보장한 뒤에만 최적화한다. bit bucket은 부모 활동 근사값이므로 정확한 bit edge를 추측하지 않는다. 대표 규모/실제 편집 프로필/보존 구조 경계와 native RSS 회수는 열려 있다. U12 자동 발견은 제안, U04 노드 자유 배치와 U11 Explorer 파일 행 hover ▶는 후속이다. Core/Testing API 재사용과 읽기 전용 구조 경계를 유지한다.

## 열린 검증

보존 데이터 구조 종단/경계, 사용자 편집 프로필, 대표 실제 프로젝트·loading 취소·두 reader 복구의 큰 3묶음. 깨끗한 Windows는 별도 환경 부재로 보류 1건. 전체 안정화 완료 아님; VSIX/배포 없음.
