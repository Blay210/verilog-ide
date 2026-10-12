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
> 현재 독립 IDE 방향·분리 경계는 [제품 결정](h0-product-decisions.md), 단계/완료 기준은 [구현 계획](ide-implementation-plan.md)을 우선한다. 아래 구현 기록은 기존 VSIX 기반의 역사다. Diagram은 첫 독립 앱에서 제외하며 엔진은 별도 논의한다.

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

## 최신 실행 계획 — 독립 IDE 전환 전 로드맵 (2026-10-07)

사용자 합의: VSIX 0.3.1은 스터디 피드백용으로 유지하고 새 개발은 **E0 지원 범위/semantic 추출 확인 → E1 정적 내부 그래프 → E2 기록된 내부 신호값 → D4 선택 clock/edge 기록 탐색 → E3 pipeline MAC 검증 → E4 UX·복구 수용 → H0 사용자와 독립 IDE 아이디어 논의** 순서다. [작업별 산출물·지원 범위·완료 기준·검증 표](pre-ide-roadmap.md)가 상세 실행 기준이다. 독립 IDE H와 자체 compiler/simulator I는 착수 시점에 사용자와 아이디어를 발전시키고 별도 계획을 합의한 뒤 구현한다. 지금 Code-OSS fork/엔진 방식이나 화면 사양을 확정하지 않는다. 베타 중단·정확성 결함은 병행 수정하고 열린 검증 게이트를 보존한다. 이번에는 문서만 정리했으며 신규 기능 구현·시험·VSIX 재생성은 하지 않았다. 아래 과거 다음 작업 문구보다 이 계획을 우선한다.

## 최신 실행 지점 — F1X 스터디 비공개 베타 (2026-10-06)

사용자 승인으로 0.3.1 VSIX/CLI/새 예제/안내 ZIP 배포를 준비했다. 정식 stable·독립 앱이 아니다. 전체184 PASS(초기 오래된 DOM 참조2 FAIL 수정)/타입 검사·build, 실제 VSIX 격리 설치 및 설치 폴더 native 편집/semantic/두 PASS/내장 파형·보존 구조 ready/host exit0, 배포 CLI check·두 PASS·hierarchy exit0와 GUI/CLI 결과 일치를 확인했다. 언어 빠른 재시작의 pending changes TypeError가 발견돼 알려진 제한으로 남긴다. 깨끗한Windows/대표사용설계·장시간/프로필·일부 실제입력 게이트는 유지한다. 다음은 스터디 설치·실사용 피드백 수집 → 언어 재시작 경쟁 및 중단 오류 우선 수정 → 0.3.x 회귀 검증이며, 후속 U12/독립 앱은 기존 순서를 따른다. [수용·발견 문제·재현](private-beta-acceptance.md), [설치 안내](private-beta-guide.md). 이전 VSIX 금지/미배포 기록은 당시 상태이며 이번 명시적 배포 요청이 우선한다.

# Architecture and next milestones

F1W 실제 progress Cancel 버튼 검증 통과(run-odiLDS): 테스트 전용20초 load dispatch 지연에서 native 클릭으로 target reader 종료·document 제거, 기존 peer 값 유지, 정상 재열기/값 복구·3/3worker exit/SHA/host exit0 확인. 관련4 PASS/타입 검사·개발 build 통과. [실제 조작·제한 조건](waveform-physical-cancel-acceptance.md). 제품 코드 변경 없음. 일반 parse 중 물리 취소 latency/전체 안정화 수용은 아니며 실제 입력/Escape·프로필 잔여 및 대표 설계·장시간/깨끗한Windows 게이트를 유지한다.

F1V 합성 중간 규모 취소·메모리 회복 검증: 4096신호 두 reader의 native loading중 닫기/peer 보존/4cycle/worker9개 종료/SHA 검증 통과. 최종15초 자연 idle 두 실행에서 RSS baseline221–222MiB→191–193MiB 회복을 재현했다. 초기3초 미회복도 보존한다. 독립8cycle16reader exit, 256RTL파일 분석·실행중 취소/재시도1 PASS, 관련23 PASS/타입 검사·개발 build 통과. [근거·측정조건·제한](waveform-memory-recovery-acceptance.md). 제품변경 없음. 다음 물리 Cancel 조작·취소 복구와 잔여 입력/프로필 수용, 실제 설계 경로 제공 시 대표 프로젝트 검증. 전체 규모·메모리 수용/깨끗한Windows 완료는 아니다.

F1U 기본 사용자 편집 설정과 설치된 Verilog HDL 1.29.0을 격리 복제해 editor/semantic native 검사 통과(run-22Vp8d), 실제 module/package/begin Tab 및 begin Enter의 내용·커서 검증 통과(run-MmeiXH), 두 host exit0. 11 lexical PASS/semantic unit7 SKIP/타입 검사·개발 build 통과, 원본 설정 SHA 유지. 외부 linter는 PATH의 실행 파일 미발견으로 동작하지 않았으므로 정상 외부 diagnostics 충돌은 미검증이다. [근거·범위·재현](editor-profile-acceptance.md). 다음 대표 규모·loading 취소·두 reader 메모리 복구, 편집 프로필 잔여는 별도로 유지한다.

F1T 보존 결과·구조·파형 경계 재검증: 관련 32 PASS/타입 검사·개발 build 통과. 실제 VS Code run-Mpz1Al에서 package/include를 포함한 두 시뮬레이션, 보존 소스/구조/값·양방향 커서·닫기/재열기·손상 차단/복구 통과, host exit0. 별도 generate/array/escaped·한글/공백 경로 Core/worker 실제 검사 1 PASS. 제품 변경 없이 late values 무효화 회귀를 추가했다. [근거·초기 대기·지원 범위](recorded-boundary-acceptance.md). 다음 실제 사용자 편집 프로필 충돌→대표 설계·loading 취소·두 reader 메모리 복구. 전체 안정화/배포 완료는 아니며 깨끗한 Windows 보류는 유지한다.

F1S physically exercised default cursor reuse through native drag/zoom/pan/bottom scroll/Reload, with all raw parent/bit values checked and Reload equality/source identity retained. No product code change; viewport-changing full-query latency remains material. Next return to retained structure/waveform integration boundaries, then real editing profiles and representative-scale/memory gates. [Evidence and input/visibility limits](waveform-cursor-physical-acceptance.md).

F1R supersedes F1Q: cursor-only viewport reuse is enabled normally. Host init explicitly enables it; a render-diagnostic Development/Test env0 override permits baseline comparisons only. Loading/init/latest error clear the renderer entry; mismatched values fall back to a full query. Mixed resize/zoom/pan/reorder and real/wide/zero/empty regressions passed. Core/worker/view contracts remain unchanged. [Acceptance and actual-UI remainder](waveform-cursor-reuse-acceptance.md).

F1Q Development/Test-only cursor reuse candidate retains one renderer viewport keyed by ordered signals/from/to/pixels and fetches fresh raw values using the existing values API. Loading/init clear it; latest request and value cursor/row identity guards precede merge. Production remains on full-window queries. No Core/worker cache or persistent view contract change. [Candidate/A-B and pre-adoption boundaries](waveform-cursor-reuse-candidate.md).

F1P explicit Development/Test renderer diagnostics carry host queue/window durations separately from renderer roundtrip/draw; clock origins are never subtracted across processes. Post-lifecycle payload benchmarks retain only two fixtures and are local JSON/clone proxies, not a pure IPC or RSS-baseline trial. Product query/payload behavior is unchanged. Next compare bounded same-viewport cursor-only reuse against original with exact values/latest/Reload/peer checks. [Measurements and candidate contract](waveform-transport-profile.md).

F1O native long-session diagnostic and limited actual window layout acceptance completed: canvas-focused host shortcuts, absolute ruler alignment through overflow/window restore/UI zoom, exact late cursor/parent/bit values. The manual harness accepts only four named fixture layout revisions; it never replaces physical-input evidence. Next measure dense query/transport separately from draw. [Evidence and limits](waveform-native-layout-acceptance.md).

User correction F1M supersedes the earlier relative-ruler presentation: all ruler labels are absolute, independent of viewport origin. Long decimals split into additive integer/remainder lines using exact BigInt source units; short labels stay single-line. Ruler and wave still share scroll/gutter geometry. Ordinary cursor/input/footer use full absolute time. [Presentation contract](waveform-absolute-time.md).

Waveform keyboard zoom/pan applies only to the trace container with no Ctrl/Meta/Alt modifiers; ordinary host editor shortcuts are preserved. Pointer row selection/reordering does not change simulation time. Bundled regressions cover group bit retention and Escape/late-event rollback; mocked DPR/resize checks are distinct from physical OS DPI acceptance. [F1L evidence and native remainder](waveform-interaction-regression.md).

Ruler and trace rows now share one scroll surface and column geometry, preventing scrollbar-width cursor drift. Long-origin ruler labels may use offsets with an explicit footer origin; ticks/cursor remain exact absolute BigInt. Canvas plotting/bit projection is viewport+43px only, while all values remain current; scroll reuses the validated window through a coalesced RAF and resize requests a fresh window. Reload/rebuild preserve bounded browser scrollTop separately from persistent views. The previous all160-row drawing paragraph is historical. [F1K contract and regression evidence](waveform-viewport-alignment.md).

Manual physical waveform acceptance uses an isolated development harness; preparation may use bounded diagnostics but mouse input is separate. Diagnostic samples stay nonce-bounded and outside saved views. A manual harness receipt confirms preparation/termination and source identity, not whole UI acceptance. Current draw still processes all160rows; a viewport candidate must preserve offscreen values and redraw on scroll/reveal/resize without stale generation publication. Reload currently resets vertical scroll while retaining signal/time state. [F1J observations](waveform-physical-ui.md).

Dense window buckets reuse query-local boundaries and consecutive upper-bound indices without changing exact values/edge counts. Renderer positions reuse the original BigInt-normalized computation in a4096-entry draw-local cache. Opt-in timings separate worker query and renderer prepare/parent plot/bit projection/bit plot, never normal results or persisted views. Native latest-request burst and loading-Reload close/reopen preserve peers and8actual exits. Visible-row optimizations must retain offscreen values and scroll/reveal redraw. [F1I evidence](waveform-dense-recovery.md).

Waveform drawing reads all canvas layout dimensions and theme colors before label/backing-store writes, and reuses ruler results by width within one draw. No persistent theme/resize cache or skipped rows. Maximum-row diagnostics add bounded shared probe/detail schemas; they remain Development/Test-only and never enter saved views. Native160-row functional/Reload/peer checks pass; dense query/draw latency remains open. Dense bit buckets preserve parent activity approximation, not exact bit edges. [F1H evidence and next cost split](waveform-render-stress.md).

Renderer diagnostics require an explicit flag and Development/Test host mode; Production does not register diagnostic commands. Per-init nonce, bounded pending/sample/row counts and loading reset reject obsolete frames; no diagnostic data enters saved views. Renderer-local intervals distinguish request roundtrip, synchronous draw and double-RAF opportunity, while host init→telemetry duration is separate. Frame opportunity is not compositor presentation; neither interval includes parser/iframe startup. Next stress maximum rows/bits and transition-visible viewports. [F1G evidence](waveform-render-profile.md). Older next-step paragraphs below are historical.

VCD parsing now shares validated normalized bit strings locally, capped at4096 entries/65536 characters and64-character values. Saturation disables further lookups for that parse; real/wide values bypass and caches never cross readers. Logical limits/identity/query contracts stay unchanged. Matched synthetic A/B retained memory improves31.6% with +8.1% median parse time; this is a memory tradeoff, not a speed claim. Next instrument explicitly enabled renderer first-ready/frame and webview RTT. [F1F evidence](waveform-value-reuse.md). The F1E paragraph below is historical pre-adoption evidence.

Development-only parser profiling runs CPU/allocation sampling and worker-local forced GC in isolated workers; production readers never enable inspector or forced GC. HeapUsed is worker-local, RSS process-wide, and sampled allocations include temporary objects. Post-parse value canonicalization saved17.937MiB in a repeat-heavy fixture without changing the digest, but is not a validated production cache. Next compare bounded per-parse value reuse against original/high-uniqueness inputs before adoption. See [F1E evidence](waveform-parser-profile.md).

Waveform worker profiling is explicit per-request and returns timings only in a separate response envelope; ordinary metadata/value/verified-byte APIs stay unchanged. The isolated host harness measures worker read/decode/parse, request round trips and warm editor open/query/close phases. Residual round-trip time includes startup/queue/scheduling/serialization and must not be called pure IPC. Native steady phase max41.88ms does not explain the earlier900ms global observation. Parse dominates current open time; RSS return remains unproven. See [phase evidence and next allocation investigation](waveform-phase-profile.md).

Waveform load cancellation clears the attached trace/metadata, advances generation and awaits worker disposal before completing progress cleanup. A late standalone load cannot publish metadata after abort; cancel detaches only this cursor member and preserves live peers. Actual two-editor synthetic lifecycle has9/9 worker exits, but RSS does not return to baseline and900ms host delay exceeds the provisional target. Do not treat functional exit assertions as performance acceptance. See [F1C evidence and next measurements](waveform-cancel-lifecycle-acceptance.md).

Recorded enum presentation uses optional enumSignals on semantic hierarchy nodes (direct integral enum variables/nets, canonical types, fixed-width binary labels). mapTraceEnums reuses exact segmented trace port rules and binds by declaration ID, never by aliased channel code. The host analyzes only Core-validated retained inputs without overlays, revalidates after analysis, and requires a ready recorded trace before attaching labels. Existing semantic runtime only; no install on waveform open. Labels remain ephemeral metadata; Auto display falls back to hex and explicit numeric formats remain compatible with saved views. One-bit enum segments can show names while projected bit children stay raw. Runtime detection accepts cancellation. Same-identity Reload restores a vanished cursor group only at revision0 and never overwrites a surviving peer's updated time. See [U05 acceptance](waveform-enum-acceptance.md).

Structure camera is a self-contained webview projection: bounded SVG transform, pointer-centered zoom, pan capture, Fit and resize. It sends no execution/navigation messages. Webview state isolates up to32 cameras by root/mode/run/test/scope while existing retained-trace validation and navigation nonce/revision checks remain authoritative. Existing vertical module/port layout is retained; node repositioning/internal operation graphs are separate. See [acceptance](structure-canvas-acceptance.md).

Simulation input freshness uses Core compareConfiguredResultInputs for bounded saved-input equality, with only a recorded package permutation reused in auto mode; it never prepares execution or authorizes trace binding. The host runs sequential debounced comparisons with cancellation/revision guards. Unsaved document state is a separate overlay. Historical result status and waveform identity stay unchanged. See [acceptance and limits](input-freshness-acceptance.md).

Simulation uses a custom Activity Bar container (`rtl-simulation`) with the existing test/result view identities. View nodes expose stable target IDs, not executable state; Testing API/Core still own execution and cancellation. File actions resolve the requested file against current manifest targets, ask for a configuration when shared, and reject non-file/archived sources. Generic Explorer file-row inline actions remain a future workbench feature; public context menus provide the initial shortcut. See [acceptance](simulation-panel-acceptance.md).

Current product scope and execution order: [project roadmap](project-roadmap.md). The independent IDE remains the final host; extension development does not start a Code-OSS fork. The waveform now uses one cursor and Cursor/Zoom range tools. Retain the existing recorded-trace identity/revision contract and legacy a state; never restore a second cursor from old b state. See [implementation and acceptance](waveform-cursor-acceptance.md).

## Future simulation performance investigation

Cross-run build reuse is not implemented: each run builds retained sources in its own build directory. Keep recorded runs isolated while evaluating content-addressed executable/object caches; the current input identity is not a complete toolchain cache key. Measure build, runtime and trace/load separately. Incremental compilation does not imply resuming a changed model from an old simulation state. See [performance direction](simulation-performance-direction.md). This investigation does not start a custom compiler or replace the current enum/UX execution order.

## Saved waveform view notifications

After a view collection is persisted, waveform panels for the same project/test key in the same extension host receive a collection-only update. Other test keys and standalone files remain isolated. Receiving panels preserve their current signals, styling, range and cursor; a removed selected preset becomes Custom without clearing displayed signals. Panel disposal removes its listener. A peer default update affects future opens, not current display. Cross-window notifications are not implemented. See [edge UI acceptance](structure-wave-edge-ui-acceptance.md).

## Windows compiler process ownership

MSYS2 UCRT64 detection selects the official verilator_bin.exe directly with the existing private environment and VERILATOR_ROOT. The MSYS Perl/shell wrapper lost the compiler tree during Windows cancellation in a measured native build: abort fired on time but inherited pipes stayed open until descendant compilation completed. Direct binary invocation retains the native compiler as the taskkill tree root. The shared process layer still waits for tree termination; it does not report cancellation early. Native regression checks build timeout, cancellation during g++ compilation, no remaining build processes and recovery. See [termination validation](timeout-termination-validation.md). This does not guarantee an exact wall-clock cleanup deadline under arbitrary machine load.

## Waveform ruler readability

The editor-independent timelineRuler helper uses zero-aligned 1/2/5 intervals with exact BigInt ticks, major/minor grids and measured non-colliding labels. Display grid density adapts to viewport width; cursor queries retain exact physical times. The older rulerLabels helper remains compatible but no longer drives the waveform canvas. The canvas title retains the full visible range. The time form offers a visible Go submit button alongside Enter. See [medium UI acceptance](medium-waveform-acceptance.md) for physical checks and limitations.

## Incomplete instance editing recovery

The slang adapter retains compiler-derived port types for incomplete unsaved instances. A recovered syntax range that crosses into another source buffer ends at its original buffer EOF in the editor model (UTF-16 coordinates). Default elaboration adds instance locations not present in the selected test tops, enabling standalone RTL module editing without replacing parameter-specialized selected-top signatures. Diagnostics remain from the original compilation; hierarchy and simulation do not use repaired source text. Ambiguous generated signatures remain suppressed. See tests/semantic/recovery.test.ts and the real language-server EOF checks.

## Reader lifetime stabilization (F1B)

WaveformSession separates request closure from worker termination. dispose returns one memoized termination promise to every caller, including overlapping abort/error/close paths. A closed pending map alone is not evidence that the worker has exited. The public request model and verified-byte boundary remain unchanged. The repeated lifecycle harness observes exit events/thread termination, surviving peers, retry and process RSS; actual host tests close both custom waveform tabs and structure panels independently. Sixteen workers exit across eight medium two-reader cycles, but post-close RSS stays at a high plateau: memory return/user-design acceptance is not complete. See [stability validation](stability-validation.md).

## Medium-scale stabilization baseline (F1)

The initial beta target is hundreds of RTL sources and thousands of waveform signals. The bounded VCD reader shares a canonical decimal timestamp across changes at the same tick; exact BigInt time comparison, same-tick final values, X/Z and reader limits remain intact. scripts/verify-waveform-scale.mjs measures independent fresh processes with one/two workers and records exact-value correctness, host event-loop delay, process RSS and pending-load disposal. tests/semantic/scale.test.ts exercises actual slang hierarchy, unsaved overlays, pending-job cancellation and saved-input preservation for256 generated RTL sources plus top. These are synthetic measurements, not an incremental semantic cache, shared parsed reader, trace index or full UI performance acceptance.

Two views currently parse independently. The observed two-reader peak is about641MiB including parent and failed reload/retry; memory lifecycle and medium-scale GUI acceptance remain stabilization gates. Any future reader sharing must retain verified-byte/hash identity, run isolation, reference-counted disposal and invalidation semantics. Do not implement a shared cache solely to improve a synthetic metric before lifecycle evidence. See [stability validation](stability-validation.md) for evidence and next execution order.

## Archived GUI observations and shared cursor (D3B2)

extension.ts owns one RecordedTraceLinks coordinator and filesystem watcher, passed to both structure.ts and waveform.ts. The coordinator has no VS Code API: it pins a cloned TestResult, validates Core loadRecordedTrace, supplies identical bytes/hash to loadVerified, and revalidates recorded inputs after worker parsing. Pending opens receive cancellation on matching recorded artifact/source/metadata/ancestor changes; reads time out after30s. Per-view workers/cursor subscriptions dispose independently; invalidation broadcasts to same-identity peers. Closing one view does not invalidate the other. File changes invalidate availability instead of inferring from current sources. This is integrity checking and watcher-based lifecycle, not a file sandbox or malicious-metadata signature.

Archived structure elaboration and the verified reader feed mapTracePorts. Only visible card/table ports (maximum200) query values in batches of32; messages carry page nonce, generation, request revision and shared cursor revision, so older time/run/navigation replies cannot repaint newer observations. Placeholder values clear prior observations immediately while queries are pending. Hex values preserve X/Z; table hover exposes raw bits. Trace-only failure retains valid graph/source navigation. Source failures also stale the graph as before. Current mode has no trace values. UI Time accepts physical units; internal time remains exact decimal ticks.

Waveform opens a validated retained run from coordinator memory or bounded history (1000 rows) without requiring current rtl.toml for trace association. Ready reads use verified bytes; legacy/unsupported or failed association keeps ordinary file-based VCD viewing with an unlinked reason. Each reload creates a fresh cursor token; cursor A messages and peer updates use that token/revision. Invalidated readers clear displayed wave data and require Reload, which can reopen an ordinary unlinked trace if archive verification remains unavailable. Existing test presets still require a matching current project manifest. Explicit Open linked waveform selects the internal editor; normal waveform open retains viewer preferences and FST external handling.

This completes the first D3B supported integral-port/VCD GUI slice. Physical input/visual acceptance, clean OS installation and representative-design performance/data acceptance are A3/F gates before any beta package. Clock replay, live stepping, full internal/interface signals and FST mapping are not delivered here.

## Verified waveform worker and shared cursor foundation (D3B1)

WaveformSession.loadVerified receives Core's verified byte payload, structured-clones it synchronously and verifies SHA256 in the worker against the actual parsed buffer. Its response includes metadata/hash/byte length. SharedArrayBuffer-backed payloads are rejected because structured cloning does not copy shared memory; accepted input is an ordinary Uint8Array/Buffer. It never reopens the artifact path. Worker loads/queries are serialized; a failed new load clears previous data. Client rejects uncloneable requests without retaining pending jobs. Normal file-based VCD loading stays supported.

queryValues / session.values return only cursor values for at most32 unique signal IDs, using binary-search observations with alias/X/Z behavior and decimal bigint timestamps. Cursor must be within the actual end (including zero); unlike viewport queries it does not introduce a synthetic end=1. No transition payload or all-hierarchy batch is emitted.

TraceCursorHub is a pure editor-independent session model. A group key includes host-normalized archive directory, run UUID, source fingerprint and parsed trace SHA256. Matching groups must agree on end/timescale. State includes revision/time/readiness; updates are canonical decimal strings, invalidation blocks all old members, dispose releases membership, and reentrant invalidation suppresses obsolete broadcasts. Member/group bounds prevent unbounded live groups. Listener failure cannot prevent peer updates. The hub is not authorization and cannot watch files; host integration must revalidate Core inputs/trace, handle cancellation and stale async replies, and invalidate on recorded source/trace changes. Normalized paths alone are not identity.

At the D3B1 checkpoint, D3B2 GUI integration was still pending (now implemented above): one host-owned hub shared by archived structure and verified waveform readers; nonce/generation/revision guards for visible port values and cursor messages. Current structure, legacy/unverified trace and FST cannot be linked automatically. No GUI value display/shared cursor or clock replay is available in D3B1.

## Recorded VCD identity and exact port mapping (D3A)

Core captures traceIdentity after source-snapshot validation and artifact discovery, binding a UUID/source fingerprint to waveform basename/format/size/SHA256. This adds optional result metadata; legacy/future/damaged trace identity does not remove valid ordinary history. Streaming capture is bounded at 128 MiB, verified VCD load at 32 MiB. Reads check regular-file containment, symlinks, descriptor/path identity, size/mtime and cancellation. FST artifact identity can be recorded but the structure reader remains VCD-only. Trace bytes are hashed/read together; parseVcd performs syntax validation. This is ordinary integrity, not tamper-proof signing of editable metadata.

loadRecordedTrace first validates the retained source context and run/source/format binding, then returns hash-verified bytes. CLI trace --run uses those bytes plus the selected recorded hierarchy, revalidates sources after semantic analysis, and invokes a pure waveform mapTracePorts model. No current manifest/overlays are used. Diagram values/GUI shared cursor are not implemented by this command; D3B must ensure worker-consumed bytes carry the same identity rather than re-reading a path without verification.

Hierarchy supplies optional instancePath segments from compiler symbol spelling and actual array parent/index edges, plus existing SignalType for ports. Navigation IDs remain unchanged. VCD metadata adds scopeSegments/reference/range while preserving existing display path/name. Segments retain dots inside escaped identifiers and avoid parsing joined display paths. Exact bare-top or explicit TOP-wrapper paths are supported; competing wrappers, duplicate semantic paths/declaration codes and width mismatches block binding. Same-channel aliases remain valid. Only simple integral module ports are mapped; interface/internal signal coverage, backend encodings and FST mapping remain future work.

The pure mapper is not authorization: consumers must combine Core's recorded inputs/trace validation and pinned archived semantic context. Source fingerprint matching against current files never authorizes historical trace/current diagram binding. No GUI values, clock playback or simulator stepping yet. Next D3B adds observed port values/shared cursor with worker identity, watcher invalidation, nonce/generation/run guards and exact timestamps.

## Recorded configured literal includes (D2B3B)

Core retains configured include trees and their ordered project-local roots alongside source/package files. Empty configured roots are created explicitly. Version1 archive metadata retains the same shape while allowing nonempty includeDirs; loading verifies their containment/directory type/parent symlinks and maps them into inputs/. Existing empty-root records remain readable. Older builds reject include records conservatively. All files retain bounded hashes and sourceMappings, so readonly header navigation uses the same host provider.

snapshot-includes.ts is a restricted lexical guard, not a preprocessor. It ignores comments and ordinary strings, requires standalone quoted literals, follows selected headers recursively, and checks that the first configured root supplies each name. Lower-priority configured shadows are retained and order preserved. A conflicting source/header-local or captured root-local candidate disables snapshot support because compiler/semantic search can differ. Relative-only includes without a configured root, dynamic/inline/generated/continued directives, absolute/traversal/backslash paths and external or symlink/junction inputs remain unavailable fallback. Inactive dependencies/all include trees are conservatively fingerprinted; unrelated files can produce false mismatches or hit existing bounds.

No adapter search options changed: Verilator keeps its existing -I order and run cwd; slang keeps its existing SourceManager behavior. Native reference-original vs retained builds and semantic width checks establish the supported configured-root slice. See [Verilator relative-includes/search documentation](https://verilator.org/guide/latest/exe_verilator.html) and [slang SourceManager documentation](https://www.sv-lang.com/classslang_1_1_source_manager.html). Compiler-consumed headers are copies, and copied package ordering uses their includeDirs. No original permissions/content or system PATH is changed.

Next is D3A run/trace integrity and exact instance/alias mapping for supported ready archives/VCD. Source identity alone does not authenticate a subsequently replaced waveform. There are no diagram values/shared cursor/clock replay yet; environment/runtime data/global multi-file atomic save and general preprocessing remain outside the supported slice.

## Recorded project-local packages (D2B3A)

Snapshot creation now supports project-local explicit package groups without include directives/directories. The original package preflight remains, but runner retains the requested auto mode and Core recomputes the authoritative dependency graph using copied Project/source/package paths. runTests no longer converts the entire batch to manifest order before individual snapshots. The existing semantic dependency provider is reused, without VS Code dependencies. Manual manifest ordering remains available.

The snapshot saves the original-path equivalent of the actual copied source order. inputSettings is shared by fingerprint capture, snapshot finalization and archive loading, so the fingerprint and result.sources identify the actual order consumed. Result path translation normalizes Windows case. Copied package analysis errors/cancellation use SnapshotPreparationError, fail/cancel the run and record unavailable reason; they cannot retry original-source compilation. Unsupported capture settings still explicitly fall back. Original preflight failures retain existing behavior before a run directory is allocated.

The existing version1 snapshot manifest shape is retained, extending packageSources from empty-only to validated mapped files. Existing explicit-source archives remain readable; older builds conservatively reject package archives. Loaded archives force manifest order because their actual ordered sources are already stored. Integrity/containment/size checks cover package files as well. Current editor overlays and manifest are not read for archived analysis.

Include directories, any include substring (including comments), external inputs, tool environment and runtime data remain outside this slice. D2B3B must define include resolution before D3 trace association. The package-counter example now declares package time units matching its DUT/TBs; the previous omission compiled in Verilator but was rejected by slang hierarchy as MissingTimeScale.

## Archived GUI hierarchy (D2B2)

Result actions offer Explore Recorded Structure only for ready snapshot records. The structure host loads Core-validated recorded inputs before and after elaboration, passes the saved top/defines/waveform Project to the same SlangProvider, and uses no current manifest or editor overlays. Navigation context includes current/recorded mode plus run identity; switching runs resets history even if instance IDs match. Title, tree message and diagram identify recorded versus current provenance. The current-design action explicitly leaves recorded mode.

Current source/workspace changes do not invalidate or replace archived graphs. Changes to the selected inputs tree/manifest invalidate its graph and block navigation; refresh revalidates bytes and never falls back to current analysis. Source clicks verify the archive again. Existing generation/abort and webview nonce/target checks apply to both modes. Watcher notifications arriving during current-source analysis may conservatively cancel it; this existing behavior requires refresh when sources are actively changing.

Core RecordedInputs now supplies validated original/recorded sourceMappings. recorded-source.ts owns the shared virtual readonly document provider and open command used by result actions and all archived hierarchy links. It allows only mapped files, preserves line/character and language coloring, and includes run directory in document URI identity. Original paths are available for later explicit current-source actions; links do not silently open originals. Normal typing remains readonly; virtual model edits by other extension APIs are not an integrity guarantee.

This completes archived GUI exploration for D2B1's explicit-source subset. Includes/package groups/external dependencies still use unavailable snapshot fallback. D2B3 must freeze/resolve those dependencies correctly before expanding supported trace association. No live data, trace mapping or clock replay is implemented here.

## Recorded explicit sources (D2B1)

Verilator opts into the Core inputSnapshot backend capability. Core captures bounded saved source bytes once and writes per-run copies under inputs/, retaining the original path/hash/settings mapping in input-snapshot.json. The backend receives a mapped Project/TestTarget and consumes those copies; original files are not rewritten. This is an exact record of explicit HDL bytes consumed, not an atomic multi-file editor save, a toolchain/environment snapshot or all simulation runtime data. Generated source files are marked read-only, and post-build validation disables their association if retained bytes are damaged.

The first supported slice has project-local explicit sources and no include directories, any `include substring, or package group. Unsupported/cancelled/failed capture falls back to the existing runner and records inputSnapshot unavailable with reason; the normal simulation status is unchanged. This deliberately avoids changing include resolution or trusting pre-copy package analysis. Other backends must explicitly opt in. D2A fingerprints remain available for fallback runs. Per-run copies add storage up to the existing bounded input limits; no automatic history deletion is introduced.

loadRecordedInputs verifies version/run/result identity, original settings digest, file/mapping completeness, hashes, regular-file/size limits and containment. Symlinks, traversal, unrecorded files and damaged/future metadata cannot authorize archived analysis. Valid logs/waveforms remain readable. It constructs an editor-independent saved Project/TestTarget with mapped source paths. CLI hierarchy --run RUN_ID uses this context with the existing semantic provider and no overlays/current manifest. GUI Open Recorded Source uses a TextDocumentContentProvider virtual document for the recorded first testbench. Normal editor typing is disabled; the host WorkspaceEdit API can still mutate a virtual in-memory model and is not a security boundary. The underlying files remain hash-validated.

This begins the run/semantic-input contract for a restricted source slice. Archived GUI exploration and readonly source navigation are implemented by D2B2 above. Include/package freezing, environment reproducibility, trace mapping and automatic current-source binding remain outside this slice. D2B3 extends dependency support before D3. Snapshot semantic locations refer to saved files; do not silently translate them to current editable originals.

## Run input identity (D2A fallback observations)

Core assigns a UUID runId and optional versioned InputIdentity to every new result, using the same runner for GUI and CLI. SHA256 covers the resolved ordered source/package/test inputs, project root/test/top, ordered include paths, sorted defines, backend/timing/waveform and per-file contents. Existing parameter overrides live in source and are covered by file hashes; the manifest has no parameter override option. Timeout/tags/jobs are scheduling metadata and do not affect this design fingerprint. Backend/toolchain binary version and environment are not yet a reproducibility contract.

The initial choice is bounded fingerprints, not full source snapshots. Capture observes saved files before build and after execution. Include trees are conservatively tracked (extra files may cause false mismatches); literal include dependencies also expand recursively from source-relative/configured include paths. Dynamic/unresolved includes, symlink entries, cancellation and resource limits produce unavailable identity without changing simulation status. Limits are 10,000 files/directories, 32 MiB/file, 128 MiB total and 512 KiB metadata. Generated .rtl/.git/node_modules directories are excluded from include-tree walking; explicitly referenced files remain observable. Fallback capture retains no source text; supported recorded runs use the D2B1 copies described above. Original source text is never rewritten.

States distinguish observed-stable, changed-during-run and unavailable. Core compareResultInputs returns matching/changed/unavailable/legacy. Malformed/future identity metadata remains unavailable while valid legacy logs/waveforms stay readable. Matching refers only to sampled saved configured inputs: it is not an atomic compiler snapshot and cannot detect edit-and-restore between observations, tool environment changes or all backend-specific implicit inputs. It MUST NOT authorize a historic trace/current diagram association. D2B must establish an immutable input/semantic context contract before D3 mapping.

Results offer Check Source Version, including a notice for tracked dirty editor documents; comparison does not save buffers. CLI history --verify-inputs optionally reports the same Core comparison (JSON includes inputComparison). Ordinary history/artifact opening does not require current source compatibility. Package-auto projects are prepared with the existing semantic dependency provider. No simulator invocation or installation is triggered by comparison.

## Hierarchy navigation (D1)

The structural diagram offers explicit View inside and card double-click/Enter/Space drill-down, full-path breadcrumbs, Back/Forward/Up, a test-top versus module-instance scope chooser and Change test. The existing hierarchy tree/source links remain. Labels describe manifest test tops and module instances; no DUT-name heuristic is applied. Scope options include roots and their immediate module children through generate/array containers (at most 200 options), with deeper scopes available through cards/tree/breadcrumbs. Leaf views show port bindings, not an operator graph.

`structure-navigation.ts` is a plain TypeScript view model with no VS Code API or simulator dependency. It uses parent edges from SemanticProvider.hierarchy, never parses hierarchy IDs by splitting dots. It preserves valid history within the same project/test, discards forward history on a new branch, finds the nearest surviving parent after refresh, and resets across project/test contexts even when IDs match. It is initially located alongside the host view files and can be reused/lifted by a future thin app host without changing semantic analysis.

The host snapshots root/test before asynchronous elaboration; old generation results cannot replace the current graph. Rendered webview messages require the current nonce and an ID in the current rendered scope/navigation target map. Stale snapshots block source and hierarchy movement; refresh/context selection remain available. Disposing a panel invalidates its nonce. The native toolbar enablement is projected from this same navigation state. History is session-only; recorded waveform values, run/source identity and live simulation remain D2–D4/E work. No Core, compiler bridge or simulation changes.

## Host tool settings and verification cache

The extension owns shared tools-home configuration even when semantic support is disabled. A toolsDirectory event updates the home and invalidates the verified Toolchain cache. Verification and installation capture a generation before asynchronous work and only populate the cache if it remains current. They return their local Toolchain to the current operation; an already constructed backend retains its captured tools. Subsequent runs detect and verify again. Unrelated settings preserve reuse. Installation still requires explicit approval and existing installer root checks apply; changing settings is not approval to install into a new location.

## Simulation target and state UI (C3 initial slice)

RTL Start now displays native target rows, an explicit chosen-target Run action, cancel availability, a session summary and selected-test latest-result actions. Existing setup/explore/all/multiple-run entry points remain available. A compact native status bar opens the same view. Selection uses the Testing API's workspace-qualified item identity; active tests are keyed by that identity to avoid collisions across equal project/test names. Project roots remain visible in target tooltips.

`simulation-ui.ts` renders a snapshot; `simulation-summary.ts` formats it without VS Code. `extension.ts` projects its existing execute/onStart/onResult/abort/finally events into presentation-only state. Core runner, tools approval, TestRun and result/history stores remain authoritative. Terminal status counts survive history refresh by storing callback status values in the session projection. Setup refusal yields blocked with no fabricated result; parent cancellation wins over verification exceptions. Stop availability derives from the existing simulations abort-controller set, so save/target-resolution is not presented as cancellable. Full build/run stage separation, persistent target preferences and native physical UI acceptance remain future scope.

## Class/fork lexical templates (C2)

`language/templates.ts` supplies a class name/body snippet and a fork body with a native join/join_any/join_none choice in SystemVerilog. The join choice is tab stop 1 and the body is final stop 0, making wait behavior explicit before writing processes. Verilog supplies fork/join only and withholds class. Both direct Tab expansion and completion use the existing host snippet path; class semantic/member analysis is unchanged and unsupported.

New templates require standalone keyword lines and reject same-line trivia, directive-containing files and any existing relevant closer in the suffix. This is conservative rather than a full nested closer grammar. Native snippets preserve document indentation/EOL and Undo. Added fork/named-fork and class declaration opener indentation rules to match existing decrease rules; real-host testing exposed that typing the join choice otherwise removed one indentation level. No forced if/always/for blocks or new compiler dependency was introduced.

## Optional closing labels (C2 lexical slice)

`language/labels.ts` plans a single insertion independently of the editor/compiler. It balances recognized nested block/declaration keywords, masks comments/strings and withholds ambiguous, unbalanced or macro-containing files. Only named begin and module/package/interface/program declarations offer labels, at their header or closer; existing labels are never renamed. Full grammar parsing, escaped identifiers and function/task/class labels are outside this initial slice.

The VS Code host registers a SystemVerilog-only refactor.rewrite action. It works without manifest/tool installation and does not alter automatic template/Enter behavior. One native WorkspaceEdit preserves existing trivia and Undo. The lexical scanner reports directive presence during its existing scan, avoiding repeated prefix scans for macro detection. More complex valid syntax such as extern prototypes or assertion property invocations can conservatively suppress the action; this is lexical assistance, not semantic rename.

## Explicit enum case action (C2 initial slice)

The native completion model carries canonical enum members with evaluated values and compiler-verified visible spellings. Alias types reuse their canonical enum; shadowed or non-imported package members use a qualified spelling only after successful lookup. Unknown/invalid values and conflicting elaborations do not produce an action. Invalid native type display conversions are isolated to the broken symbol rather than failing the whole query.

The independent `semantic/enum-case.ts` planner recognizes an empty ordinary case of a simple identifier with an existing endcase. The LSP exposes a refactor.rewrite code action and makes one versioned insertion, preserving comments/closers and rejecting stale snapshots. Existing branches, complex expressions, casez/casex and macros are withheld; filling missing branches is future scope. Duplicate values and more than 256 members are withheld. No VS Code analysis logic or typing-time automatic rewrite was introduced.

## Product requirements and audit

The user’s [original 25 ideas](original-product-ideas.md), [implementation audit and P0 backlog](product-audit.md), and [hierarchical visual debugging roadmap](visual-debugging-roadmap.md) are tracked separately from implemented baselines. Module port signature help is implemented as an initial slice; parameter-list guidance is now implemented too, and scope-resolved function/task signature help is also implemented. Hover is separate. Resolve editor readiness and port-completion acceptance gaps before expanding visual debugging. Basic hierarchical drill-down is implemented in D1. Clock-based trace replay and internal MAC/operator views remain explicit future requirements, not capabilities of the current structural diagram.

## Product destination

The committed destination is our own VS Code/Code-OSS-based RTL IDE, in the product category of Cursor/Antigravity, rather than an extension-only product. The extension is the initial delivery and validation host. Engineers should focus on RTL structure, while the environment integrates editing, project management, simulation, verification, setup and waveforms.

Dedicated compiler/simulator and waveform technology are long-term product goals. Existing Verilator and GTKWave adapters provide the initial execution path without defining the permanent product boundary. Independent language logic and Core must be reusable when the host becomes a standalone IDE. Do not begin the compiler rewrite or Code-OSS fork before these integrated workflows are sufficiently stable.

The repository is the source of truth. User projects contain RTL, testbenches and one manifest. Tool installations and verification caches are shared outside projects. Only generated run data belongs in `.rtl/`.

## Interaction direction

Primary workflows must be discoverable through visible UI: project setup, tool readiness and approved installation, test selection, Run/Stop, results, logs and waveforms. The command palette and keyboard shortcuts are optional accelerators, not prerequisites. Surface the selected simulation target and running state next to actions. Keep errors actionable with retry/navigation buttons. The eventual standalone IDE can assign F5 to simulation; the current extension must respect the host editor's normal debug shortcuts. Prototype this UI in the extension before the Code-OSS transition, reusing Core operations rather than creating a separate execution path.

The first visible entry points are native RTL Start welcome buttons, editor/run toolbars and inline result actions. These invoke the existing registered commands and Core runner. Syntax highlighting uses bundled TextMate grammars; native language contributions supply original theme-aware V/SV chip icons as defaults without replacing the user’s file icon theme. Preserve both features in a standalone host. Semantic token coloring is separate future work.

## Implementation boundaries

GUI/CLI → Core → SimulatorBackend. The composition roots select Verilator and obtain a Toolchain from the independent tool manager. Core contains no editor imports or Verilator command flags. GTKWave is a separate WaveformProvider. There are no automatic shell hooks from project manifests.

The manifest is versioned and strict. Core orders package files using a PackageDependencyProvider graph; slang supplies preprocessed syntax imports/exports and scoped references. A stable topological sort preserves manifest order among ready files. Explicit manifest mode remains available for macro-order-sensitive or class/package-name-ambiguous inputs. This is a pre-elaboration dependency pass, separate from compiler-resolved completion visibility. Replacing the simulator must not require replacing the editor's future semantic frontend. Adding another backend requires capability checks and adapter integration tests, not a second test runner.

Editing has a separate path: VS Code LSP client → `language-server` → `SemanticProvider` → slang (pyslang). The server and semantic packages contain no VS Code imports. The client owns trust, installation approval and lifecycle. The provider receives Core's resolved project plus unsaved document overlays and returns editor-independent modules, instance ports, locations and diagnostics. Compilation is separate per testbench, matching the simulation source boundary. No simulation is run during editing.

The slang adapter launches an isolated Python process for each compilation. Windows runtime files are installed under shared tool storage, with pinned python.org/PyPI SHA256 checks; project Python, pip hooks and PATH changes are not involved. Short-lived request/result JSON goes into the shared semantic cache and is removed after success, error or cancellation. Python normalizes filesystem paths and enables the native UTF-8 locale on Windows; slang byte offsets are converted to UTF-16 editor offsets.

The server debounces changes, cancels obsolete work, rejects stale results, and gives each native dependency/analysis operation a 15-second deadline. This is full analysis, not incremental parsing. Modules use default-parameter signatures and instances use elaborated port types; incompatible signatures sharing one source position deliberately produce no instance recommendation until a hierarchy context can be selected.

Phase 2C adds `SemanticProvider.complete`: a file/UTF-16 position and optional package qualifier produce resolved symbols. Candidate names come from slang's symbol tree, while `Scope.lookupName` and `LookupLocation` determine visibility, imports, declaration order and shadowing. TypeScript only recognizes the lexical completion context and maps the result to LSP. Completion requests currently recompile a snapshot in their own cancellable native process; this favors correct unsaved snapshots over caching a mutable compiler. A query in a registered testbench uses that test's compilation. Shared-source queries intersect compatible results across test contexts. Open documents outside the compiled source/include set do not inherit project symbols.

Supported completion contexts are packages, module bodies, functions/tasks, procedural blocks and loops. Class bodies, object members and chained `pkg::class::` queries are intentionally excluded. Completion inside headers that only partially form an enclosing scope is conservative; a complete source scope is required for local-variable lookup. Symbol completion is scope-aware but not filtered by every expression/type grammar position. Incremental analysis and large-project performance remain future work.

During feature development, build and validate in a development host. Do not generate or install new VSIX release packages until the user considers the product ready and requests distribution.

Core `runTests` prepares source order once, schedules bounded workers and returns results in selection order. Completion callbacks are delivered as tests finish. Cancellation stops queue admission, aborts active processes and awaits all workers before returning; normal assertion failures do not stop other tests. GUI workspace projects run one after another, each using its configured concurrency. The host does not implement a second scheduler.

Each run atomically publishes its result after closing its log in a unique `.rtl/runs` directory. History reconstructs from complete validated records, including timestamps, tags and resolved source lists, without a shared mutable index. Reruns resolve the current test definition. No project source snapshot or retention/deletion policy is introduced.

Phase 4 adds `SemanticProvider.hierarchy(project, test, overlays, signal)`. It returns host-independent nested instance/generate/array nodes with stable elaborated paths, actual parameter values, instance and definition locations, typed port bindings and referenced-symbol locations. A selected test is one compilation; without registered tests slang identifies design roots. Compilation errors return diagnostics and no hierarchy. No simulator or C++ harness participates. The operation has a total 15-second budget, including dependency preparation, and an explicit 10,000-node / 128-level export limit.

The structure host uses a dedicated on-demand snapshot, independent of LSP completion scheduling. Open unsaved RTL is included; manifest changes must be saved. Changes cancel pending requests, mark displayed snapshots stale and disable stale source links until refreshed. Messages from the read-only webview carry a snapshot nonce and IDs, which the host resolves against its current model; the page cannot supply file paths. The renderer imports no VS Code API and uses escaped text, a restrictive CSP and no remote assets. Diagrams show instance port bindings, not synthesized logic or always/assign dataflow. Unsupported interface connections are explicit; implicit instance-array bit selections are materialized from the compiler AST. CLI exposes the same provider as structured JSON or a textual tree.

## Phase 5A: native waveform boundary

`packages/waveform` owns VCD parsing, an editor-independent trace model, exact BigInt time/value operations, window queries and formatting. Transport times are decimal strings. Aliased declarations share stored channel data; same-timestamp updates retain the final value. The Node worker/client boundary can be reused by a future desktop host without the VS Code API. Simulation and semantic providers do not participate in reading a waveform.

The VS Code custom readonly editor owns file selection, lifecycle/cancellation, progress and the optional GTKWave action. Its canvas renderer receives metadata and bounded windows, never the complete event history. Query detail is limited by both pixel count and value width, including aliases, with dense intervals explicitly represented as activity. Cursor values remain exact. The renderer uses local assets, a restrictive CSP and text-only labels. Webview messages cannot select an external executable or arbitrary file path.

The first reader is a bounded snapshot, not a streaming index: 32 MiB source, 10,000 declarations, one million stored changes, 16,384-bit width, 64 MiB decoded values, 256 MiB worker old-generation heap, four open documents and a cancellable 30-second load deadline. Files changing during the bounded read are rejected. Closing/reloading terminates the worker; view state belongs to the editor rather than source projects. Internal VCD is default; FST and unsupported/large VCD can use the existing GTKWave adapter. Real values have text display only. Native FST, analog curves, live traces, disk indexes and large-design performance remain subsequent work.

## Phase 5B: waveform interaction baseline

Canvas pointer capture implements explicit A/B/zoom tools, reverse-direction range selection, Escape/lost-capture cancellation and drag feedback. Exact tick conversion/range normalization remain in the editor-independent waveform package. Nearest-edge lookup extends the existing worker query (direction 0) using binary search on stored changes, including initial records, with earlier ties. It never snaps against downsampled canvas geometry. Previous/next remain strict direction −1/+1 queries.

Per-signal radix and a small theme-aware color palette are keyed by declaration path in editor state; unknown/high-impedance colors take precedence. Restored styles are whitelisted and bounded to known declarations. Defaults follow the global format; aliases can have different presentation while sharing trace storage. This is snapshot-view customization, not project layout export. Test-specific saved views and a hierarchy filter are described below. Named signal groups, portable layout export, cross-source navigation and native FST remain follow-up work.

## Test-specific saved waveform views

The waveform package owns versioned `ViewBook`/`WaveView` validation, mutation, path-based resolution and missing-signal retention. It has no editor dependency. One book has up to 20 named views; each stores at most 32 ordered hierarchy paths, global radix and per-signal format/color. Defaults reference stable view IDs so renaming preserves the choice; deleting the default clears it. No dump identifier, cursor or absolute trace time is used for cross-run reuse.

The host infers a test only from an open project’s real `.rtl/runs/<run>/` artifact, a bounded matching `result.json`, and a matching name/top in the current manifest. The webview cannot supply project paths or persistence keys. Keys hash canonical project path + test name + top, excluding run ID. Persistence uses VS Code profile-local extension globalState; no generated or source project files are added. The plain model can be hosted by the standalone IDE later. Books are serialized through a host queue, validated before writing and left unchanged on invalid/unsupported data or cancelled edits. Separate IDE windows do not have a cross-process transaction lock; concurrent edits to the same book should be avoided in this baseline.

Only a fresh editor without saved per-file state applies the test default automatically. Named views select by full hierarchy path so changed dump identifiers and file ordering do not matter. Missing paths are reported and retained when editing/saving the view. Local edits show an unsaved label; making a default requires a saved state. The hierarchy selector filters available signals plus descendant scopes without changing the selected waveform rows. External VCD, FST, team sharing, portable import/export and named signal groups remain out of scope.

## Roadmap

The list below records the original phase boundaries and implemented baselines. For the next execution order and remaining requirements, use [delivery-plan.md](delivery-plan.md); the next owner starts with [handoff.md](handoff.md). Additional OS/backend support and a custom compiler are not prerequisites for a future standalone-host transition.

1. **Execution slice (implemented):** source discovery, Windows setup, GUI/CLI tests and external waveforms. Gate: real tool build/run, failure/cancellation coverage and extension packaging. Fresh Windows release acceptance remains a separate check.
2. **Editing (implemented baseline):** 2A provides lexical context, Enter-based block closing and keyword/system-task completion. 2B provides the separate language server and slang-backed SemanticProvider for named-port completion, module/port hover, definition navigation and diagnostics on unsaved files. 2C provides package/scope symbol completion with compiler-resolved visibility. These reuse the manifest's sources/includes/defines. Unsaved editing and scope exclusions have native and editor-host coverage; class/member intelligence and large-design optimization remain outside this baseline.
3. **Verification/project growth (implemented baseline):** slang package dependency extraction, stable ordering, tags, persisted history and 1..4 bounded workers shared by GUI/CLI. Gate: dependency correctness and isolated concurrent outputs. Complex class/package shadow resolution and history retention policies remain outside this baseline.
4. **Structural exploration (implemented baseline):** test-scoped elaborated hierarchy, parameter values, active generate/instance arrays, port-binding diagrams and source navigation. Gate: native elaboration and editor source-navigation checks. This is not synthesis/dataflow analysis; interface/modport wiring detail and large-design optimization remain future work.
5. **Product expansion (5A baseline implemented):** native VCD waveform viewer. Native FST, larger indexed traces, other operating systems and simulator adapters remain future work. Gate: existing contract tests and platform-specific end-to-end verification.
6. **Structural authoring / standalone delivery:** generated top-module source with explicit ownership and product packaging on the VS Code/Code-OSS foundation. Keep feature logic reusable before this transition. Do not attempt arbitrary bidirectional code/diagram synchronization initially.

Custom frontend/simulator development remains a long-term option, not a current dependency. Prefer small behavior-driven changes; avoid prebuilding APIs for speculative features.

## Explicit lexical templates

Phase 2A templates live in `packages/language` as editor-independent snippet plans. They are explicit keyword expansions, not semantic analysis. The host supplies native snippet fields for declaration names, ports and bodies, guarded Tab/Enter bindings, and cursor restoration for inline begin/end acceptance. A valid block Enter may override suggestion acceptance; ordinary snippet navigation, Tab focus mode, selections and multiple cursors keep host behavior. Comments, strings, member access and existing closers are guarded. No if/always/for block is forced and no global editor setting is rewritten.

## Language readiness visibility

The initial host exposes an RTL status-bar item and a Language Status action in RTL Start. Runtime trust/config/install/start failures come from the host lifecycle. A read-only `rtl/languageStatus` LSP request reports the owning root and analysis phase without triggering compilation. It checks manifest-listed source membership; included headers are explicitly uncertain rather than falsely classified as unsupported. The current root-only project discovery is disclosed. Only active RTL editors poll (1.5 seconds); stale UI replies are discarded and the unreferenced timer is disposed with the extension. This is readiness visibility, not semantic analysis or signature help.

## Module port signature guidance

`portSignature` in the editor-independent semantic query layer uses the current analysis snapshot and actual elaborated instance ports. The LSP adapter maps its result to signatureHelp, triggered by parentheses and commas. Named connections choose the declared port index; positional connections count top-level arguments while preserving concatenations/indices. Nested function calls, comments, strings, wildcard connections, unknown names and incompatible elaborations withhold this guidance. Parameter overrides affect displayed port widths, and parameter argument lists use compiler-provided syntax ranges and module declaration defaults. No simulator is invoked and no user source is changed.

Parameter metadata is exported from the default elaboration of each module, including value/type parameters and excluding localparams. Instance syntax supplies the exact `#(...)` source range. Queries use those ranges rather than guessing a module name lexically. The displayed values are declaration defaults evaluated under default parameters, not the edited override or a reconstruction of its source expression. Unknown parameters, conflicting declaration models and unavailable parser recovery suppress guidance.

## Callable signature guidance

Callable metadata extends SemanticSymbol with subroutine kind, return type and structured formal-argument names/labels. The native compiler supplies direction/type and declaration initializer syntax. The lexical query only finds the innermost open call and argument position; existing compiler scope lookup resolves the actual visible declaration, including packages/imports and the existing cross-test intersection. The LSP shares completion snapshot/cancellation boundaries and discards stale signatures. No lookup table based on function spelling is maintained in the host. Class/object/system calls remain unsupported, and the current full-analysis latency limitation also applies here.

## Port connection recommendation ranking

SignalType contains compiler-reported simple-bit-vector eligibility, bit width, signedness and 2/4-state information. Slang's `isSimpleBitVector` excludes enum/aggregate shapes, including packed enum arrays; no widths are inferred from display strings. `connectionPort` recognizes a direct named-port identifier slot using the actual instance snapshot. Scope lookup supplies the candidates. Matching width/sign/state ranks first, then width-only matches and differing widths, with name similarity resolving ties. Ranking stays in the editor-independent query layer. The LSP offers completion on `(` only for a recognized connection slot; existing port-name and other scope completion are preserved.

These are sort hints, not assignment-compatibility or writable-lvalue proofs. Constants, complex types, qualifiers, concatenations/member access and nested calls retain ordinary completion behavior. Prefix/fuzzy ranking in the editor can affect visual order. Metadata and candidates must survive existing ambiguity/cross-test intersection checks; unknown data is never treated as a type match.

## Waveform row interaction

Signal inclusion lives in the Signals catalogue. Name cells select rows with Ctrl/Meta toggles and Shift ranges; captured pointer dragging moves the chosen rows as a stable block without changing time or inclusion. Pointer cancellation/Escape clears only the pending reorder. Native drag handlers remain a fallback. Selection is transient; persisted view paths retain order. Name-cell Shift selection is separate from canvas Shift/cursor B. Bus expansion uses pure bit projections and optional per-path expanded view state; enum labels remain pending; see [UX plan](waveform-ux-plan.md).

## Bus projections

The worker transports only selected parent channels. busBits validates VCD declaration ranges and explicitly labels unknown indexes as positional offsets. bitRow projects cursor/changes without unrelated bit edges; dense buckets retain parent activity uncertainty. The webview renders children beneath parents with a bounded 128-row expansion budget, persisting optional expanded flags in version1 saved views. Children are not independently reorderable or styled. See [bit acceptance](waveform-bits-acceptance.md).
