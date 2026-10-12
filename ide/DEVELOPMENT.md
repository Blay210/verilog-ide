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

> 2026-10-10 H2K 최신: 좁은 화면에서 floating 버튼이 코드/탭을 덮는 문제를 발견해40px 전용 전환 줄로 보완했다. grid cache·EditorPart 원래 입력 크기·하단 panel/분할 그룹 최소 높이를 수정했다. 최종 파일 emission+전체 타입 검사0 errors/exit0, 자동28 PASS, 기본 native RjNE0x22항목/20 round PASS/exit0:695×435 네 배치 hit target·group/home 비겹침·dirty/disk 보존. 확대 hidden 실제 클릭/type는 중간 보완 빌드에서 수용했다. 중간 FAIL/120초 timeout·일반 host10초 경고를 보존한다. 다음은 auxiliary 상세/최종 물리 배치의 지원 범위 판정 후 H3 자체 이식이다. 물리 resize/H2 전체/베타·배포 완료는 아니다. 공통 docs/ide-h2k-narrow-layout-validation.md를 따른다.

> 2026-10-10 H2J 최신: 소스 자동 Code 진입에서 이전 editor focus를 강제하던 경로를 보완했다. 실제 Output focus+preserveFocus 소스 열기 실패(9rO53F/exit1)를 재현했고 소스 open의 focus 정책에 맡기도록 수정했다. 최종 파일 공식 emission+전체 타입 검사0 errors/exit0, 자동28 PASS, native wI7osu/qvp82r 각각22항목 PASS/exit0: Output focus와 총40 round/80 새·동일 소스 즉시 입력 및 기존 배치/dirty/disk 회귀. H2I의 간헐 일반 입력 실패와 동일 원인 확정은 아니다. 다음은 작은 viewport/물리 navigation·auxiliary 상세 수용 후 H3 자체 이식이다. H2 전체/베타·배포 완료 아님. 공통 docs/ide-h2j-focus-validation.md의 결과/다음 순서를 따른다.

> H2I 최신: Activity Bar hidden/top/bottom에서 같은 Code/Simulation 버튼을 editor의 작은 floating navigation으로 이동하고 기본 visible rail은 유지했다. 사용자 layout 설정은 변경하지 않는다. 전체 빌드0 errors/exit0(8.23분), 최종 파일 공식 emission+전체 타입 검사0 errors/exit0, 자동28 PASS, native gR12TZ/1DXgJL 각각20항목 PASS/exit0. 최초 x6yrg1 source 입력 대기 FAIL은 보존하며 원인 미확정/진단 추가 상태다. 다음은 간헐 focus·작은 viewport/물리 click·auxiliary 상세 수용 후 H3 자체 이식이다. H2 전체/베타 완료·배포 아님. 공통 docs/ide-h2i-layout-validation.md를 먼저 읽는다.

> H2H 최신: 현재 private 개발 앱에서 실제 Save As로 .sv 저장/디스크 exact 확인, Simulation→SCM→같은 파일 복귀와 실제 type/dirty·disk 자동 저장 없음 PASS. 저장 dialog의 cached element 실패는 재관찰·좌표/타이핑으로 복구했다. 작은 창 border drag는 크기가 유지돼 미수용. H2 기본 공간 전환·데이터 보존 지원 흐름은 수용, 남은 H2는 작은 viewport/Activity Bar 위치·숨김과 auxiliary 세부 상태로 묶어 확인한다. 이번 제품 코드/재빌드/자동 시험 재실행 없음. 공통 docs/ide-h2h-acceptance-summary.md의 표/다음 순서를 먼저 읽는다. private 창은 .dev/h2h-physical-probe.sv 미저장 주석 상태다.

> H2G 최신: 신뢰 설정 override 없는 private empty window의 실제 Terminal PID 생성·3회 공간 왕복 생존·명시 dispose 후 종료3항목 PASS/exit0(hE9zZm). 프로젝트 untrusted 제한은 유지한다. 자동28 PASS, 이번 본체 재빌드 없음. 물리 Simulation→Search→Code 및 Ctrl+N/실제 RTL 텍스트 입력 PASS. private h2f-surface 창의 Untitled-1은 미저장 상태로 보존했다. Alt+Space 시도 뒤 다른 앱 전면 screenshot으로 UI 입력 중단; 작은 viewport는 미완료다. npm run verify:terminal로 empty-window 검증을 재현한다. 공통 docs/ide-h2g-terminal-ui-validation.md를 먼저 읽는다.

> H2F 최신: 내장 기능까지 끄던 start의 --disable-extensions를 제거하고 RTL 사용자 profile 확장 scan을 filesystem 접근 전에 제외했다. 내장 언어/Git 검색·개발 시험 및 Code-OSS 경로는 유지한다. 본체0 errors/exit0(1.97분)·자동28 PASS·compiled host10 PASS·native t30mLT15항목/exit0. 새 private h2f-surface 창의 안내 없음·Simulation 실제 클릭→Explorer 클릭→Code/Explorer visible 복귀 PASS. 일반 host 약3.8초 unresponsive→responsive 재발은 보존하며 해결 아님. 작은 창 resize는 적용되지 않아 미완료, 물리 source/Search/SCM·Terminal PID·Activity Bar/보조 sidebar 세부 수용은 남는다. 공통 docs/ide-h2f-builtin-validation.md를 먼저 읽는다.

> H2E 최신: 동일 active source 열기 요청의 Code 복귀를 보완했다. 본체0 errors/exit0(3.72분), 자동27 PASS, native42e2Yu 15항목/exit0: 같은 source·보조 sidebar2회·Untitled/type 및 기존 탭/dirty/Output 회귀. aI5xpl 결함 재현과 xXiWXX 줄바꿈 비교 실패를 보존한다. 공통 docs/ide-h2e-reentry-validation.md를 먼저 읽는다. 물리/작은 창/Activity Bar·보조 sidebar 세부 복원·Terminal PID·start disable-extensions 정책은 남는다.

> H2D 최신: main active editor 변경 시 Simulation→Code 복귀를 보완했다. 새 문서 type 입력/dirty/disk와 실제 output TextDocument의 기존/추가 줄 보존 PASS, 기존 탭/Explorer/panel 회귀 포함 SF5i6k 12항목/exit0. 본체0 errors/exit0(2.2분)·자동27 PASS. 수정 전1BvAte FAIL 보존. 공통 docs/ide-h2d-source-output-validation.md를 먼저 읽는다. 물리 도구/source 진입·same-active 문서·auxiliary/작은 창·Terminal PID·start disable-extensions 정책은 남는다.

> H2C 최신: Simulation→Explorer가 이전 hidden sidebar를 다시 숨기는 결함을 보완했다. owned overlay previousSha256을 기록해 재빌드0 errors/exit0(1.97분), 자동27 PASS, 실제 native qNTR2a 10항목 PASS/exit0. 공통 panel hidden→Simulation 내 열기→Code 유지와 기존 탭/dirty/스크롤 회귀도 PASS. 수정 전 ciyf17 FAIL/exit1 보존. 공통 docs/ide-h2c-sidebar-validation.md를 먼저 읽는다. 새 Explorer 경로의 physical/auxiliary/focus·Output 내용/Terminal PID·작은 창·start disable-extensions 안내는 남는다.

> H2B 최신: 두 group/세 tab·선택/스크롤·dirty/disk·Output visibility 세 차례 왕복 native eAXZc9 PASS/exit0, 자동27 PASS. Output 비동기 표시 baseline 대기를 보완한 최종 결과이며 첫 추가 시험 FAIL을 보존한다. private 일반 창에서 Simulation 클릭→홈→Tab/Enter Code 물리 왕복 PASS. 제품 코드/재빌드 없음. 공통 Output 내용/Terminal PID·sidebar 초기 hidden/도구 진입·작은 창은 남아 있다. start의 --disable-extensions 안내는 실제 화면에 남으며 H3 built-in 연결 전에 검토한다. 공통 최신 기록 docs/ide-h2b-state-validation.md를 먼저 읽는다. 아래는 역사다.

> H2A 최신: RTL 전용 Code/Simulation rail과 중앙 홈/Code 모델 보존을 구현했다. src/rtlSpaces.contribution.ts를 config/source-overlay.json의 own upstream target으로 guarded 배치한다. 수정 시 이전 target SHA256을 previousSha256에 명시해 검토한다. 자동27 PASS·본체0 errors/exit0(2.33분)·최종 native 공간 왕복 PASS. Terminal PID 수용은 untrusted fixture에서 수행하지 않는다(첫 무조건 생성은 timeout). 실제 화면 접근 승인 timeout으로 physical 수용은 미완료다. RTL_IDE_DEV_SESSION=h2a-surface 창은 private 데이터로 열려 있다. 다음은 physical/H2B 상태 수용이며 실행/파형은 아직 없다.

> 최신: native 시험 entry는 private test-extension/editor.cjs에 배치해 API 소속 경고를 제거했다. receipt.stages에 UTC/단계 elapsed를 기록하고 host.log + profile/logs/**/exthost.log를 함께 검사한다. 자동25 PASS·native3회/정상 batch7항목 PASS·exit0. .dev/h1-attribution-*와 각 fixture의 receipt/launch/host/exit를 보존한다. 이전 간헐 지연 해결을 주장하지 않는다. 개발 기반으로 다음 H2A(Code/Simulation 진입·중앙 홈·Code 모델/공통 panel 보존)를 구현하며 전체 H1/베타/배포 완료는 아니다.

> 최신 개발 실행: 자동24 PASS, 임시 앱 아이콘/제품 metadata와 fingerprint exe를 적용했다. verify:launcher는 정상 preLaunch/code.bat + private data 경로 + 자동 종료 편집 시험을 실행하며 최종7항목 PASS/exit0다. 직접 code.bat --version을 격리 경로 없이 사용하면 안 된다. RTL override의 세 data flag 누락은 이제 준비 전에 거부한다. 앞선 실패 probe가 생성한 홈 데이터는 삭제하지 않고 공통 검증 기록에 남겼다. native3회/CLI도 PASS이며 과거 간헐 host 지연 원인은 아직 미확정이다.

> 최신 H1: 자동21 PASS·본체0 errors/exit0(5.72분). verify:language-policy의 실제 compiled6 PASS, host8/설치5 PASS. 언어 감지 명령을 포함한 native 편집3/3 PASS이나 첫 회 일시 무응답/복구로 startup gate=false·wrapper exit1. 이전 반복3/3 PASS는 역사다. .dev/h1-language-detection-repeat-receipt.json에 최신 결과를 보존한다. 다음은 일반 host 지연·아이콘/runtime metadata·잔여 surface 점검이며 H2 미착수다.
> 최신: 승인한 VS2022 Build Tools 설치 exit0·Python3.14.8 embedded 실행·doctor exit0·의존성 설치/본체 컴파일 exit0·IDE8 PASS·실제 개발 앱 창 확인. H1 전체 수용/RTL 이식은 남아 있다. root npm audit37건(critical2/high14 포함)의 영향·완화 검토는 배포 전 남아 있다. 최초 실패 기록은 공통 H1 문서에 보존한다.

개발 profile/extensions/shared storage는 ide/.dev 안에 둔다. 첫 실행의 기본 홈 shared storage 생성은 CLI shared-data-dir 추가로 보완했으며 최초 파일은 삭제하지 않았다. config/patches.json은 preLaunch built-in control을 로컬로 바꾸는 재현 가능한 최소 patch다. upstream anchor가 다르면 자동 진행하지 않는다.

# 독립 IDE 개발 기반 — H1 진행 중

2026-10-09. 공식 Code-OSS 1.141.0 / revision `2a59476c9bfcb90b3ddc372c36762471b7dfad1c`를 고정했고 기본 앱 컴파일/창을 확인했다. 제품 identity·불필요한 기능 제거·폴더/편집/패널 수용은 다음 H1 작업이다.

## 파일과 재현

- `config/upstream.json`: 공식 source URL, revision, archive SHA256, dependency lock SHA256, Node 기준.
- `scripts/bootstrap.ps1`: 고정 archive 다운로드/해시 검증/경로 이탈 차단 후 `upstream/` 생성. 기존 source가 있으면 덮어쓰지 않는다.
- `scripts/environment.mjs`: Windows x64, Node, local baseline, 실행 가능한 Python, MSVC 검사.
- `scripts/dev.mjs`: doctor/install/compile/start. 미충족 환경에서는 설치·실행하지 않는다. npm/node-gyp cache와 개발 profile/extensions는 IDE의 `.dev/`에 분리한다.
- `upstream/`: 공식 소스, upstream lockfile과 라이선스 포함. 크기 때문에 Git에서 제외하고 bootstrap으로 재현한다. 이후 제품 변경은 별도 tracked patch/overlay와 검증으로 관리해야 하며 ignored source만 고치고 완료하지 않는다.
- `UPSTREAM-LICENSE.txt`: upstream MIT 고지. 수정 시 저작권/의존성 라이선스를 함께 보존한다.

모든 명령은 ide 폴더에서 실행한다.

```powershell
npm.cmd run bootstrap  # 처음 source가 없을 때만
npm.cmd run doctor
npm.cmd test
# 환경 준비 완료 후 사용. 의존성을 바꾸는 새 도구 설치는 승인 필요
npm.cmd run deps:install
npm.cmd run compile
npm.cmd run compile:core # 전체 빌드 이후 본체만 변경했을 때. 최초 전체 빌드 대체 아님
npm.cmd start
```

개발 실행은 Code-OSS 기반이며 Code/Simulation 두 공간과 RTL 이식은 아직 구현하지 않았다. `--disable-extensions`는 시험 격리 옵션이다. 별도 제품 정책 patch가 native 설치 경로를 거부하며 전체 UI/CLI 수용 완료는 아니다. 배포 패키지를 생성하는 명령은 없다.

H1 후속 변경: 임시 제품 이름 RTL IDE 및 자체 설정/ID를 config/product.json overlay로 적용한다. 개발 데이터는 .dev/rtl-ide 내부다. Chat hidden 정책·native 확장 설치 선행 거부를 tracked patch로 관리하며 UI 메뉴/Agents 코드 전체 제거는 아직 남아 있다. 세부 범위와 한계는 PRODUCT-POLICY.md를 따른다. node scripts/verify-policy.mjs는 최신 본체 컴파일 완료 후 실행해야 한다. 빌드 도중에는 이전 out 코드가 남아 있을 수 있다.

별도 화면 검증에는 `$env:RTL_IDE_DEV_SESSION='surface-check'` 후 `npm.cmd start`를 사용한다. 식별자는 소문자/숫자/하이픈 1~40자로 제한되며 .dev/rtl-ide/<session> 프로필을 사용한다. 기존 개발 창과 혼동하지 않는다. 최신 본체 빌드 후 `npm.cmd run verify:policy`와 `npm.cmd run verify:cli-policy`를 실행한다. 후자는 .dev/cli-policy-*에 inert fixture와 receipt를 남기며 외부 확장 설치 거부를 실제 CLI로 검사한다. 배포 VSIX를 만들거나 설치하는 명령이 아니다.

후속 host 보완 검증은 최신 본체 빌드 후 `npm.cmd run verify:host-policy`로 실제 compiled scanner/Agent enablement를 호출한다. product 데이터는 ide/upstream 자체 설정만 주입한다. 자동18 PASS와 실제 compiled/앱 수용은 별개이며 경고 해소를 자동 시험만으로 판단하지 않는다.

현재 자동21 PASS. 언어 감지 수용은 실제 editor.detectLanguage의 미등록 .sv/등록된 JSON 처리와 model loader 오류 로그를 검사한다. RTL 제품에서는 기본 extension inspector와 자동 profiling contribution을 제외하지만 명시 inspect/inspect-brk 요청과 응답/시작 경고는 보존한다. 최신 본체 빌드 후 `npm.cmd run verify:editor`는 ide/.dev/editor-acceptance-*의 별도 native 테스트 호스트로 한글·공백 workspace/source 열기, dirty 변경/저장/재열기, Output API를 확인한다. 사용자 파일을 수정하거나 확장을 설치하지 않는다. 이 수용은 extension-host API 기반이며 physical UI/Workspace Trust/Code·Simulation 왕복 수용과 구분한다. receipt/host.log/exit.json을 fixture에 남긴다. 검증 호스트는 정상 종료하며 120초 timeout 시 자신이 시작한 process tree만 취소한다.

`npm.cmd run verify:startup`은 같은 native 수용을 새 프로필3개로 순차 반복하고 .dev/h1-startup-repeat-receipt.json에 실제 warning/무응답·inspector/profiling/Agents와 종료 상태를 기록한다. API 성공과 startup gate를 별도로 판정한다. 같은 PC/runtime cache를 사용하는 검증으로 clean Windows/순수 시작 성능 보장은 아니다. 이번3회 모두 PASS지만 일반 개발 창의 짧은 무응답/복구는 여전히 관찰됐다. 별도 physical-editor-acceptance 창의 실제 본문 입력/Save As/한글 공백 .sv 저장·disk 일치도 수용했으며 .dev/h1-physical-input-receipt.json을 보존한다.

현재 자동15 PASS·실제 compiled guard5 PASS·CLI 정책 거부/미설치·Chat/Extensions 제외·Output/Terminal 표시를 확인했다. 파일 편집/저장·폴더·개발 시험 built-in/host 시작 경고·아이콘은 남아 있다. 아래 초기 환경 부족 문구는 설치 전 기록이다. 승인된 MSVC/Python 준비와 의존성/native 전체 설치 및 본체 컴파일은 완료했다. 추가 설치 승인을 다시 요청할 필요는 없다.

## 실제 환경과 남은 준비

- Windows x64 / Node24.18.0 / npm11.16.0: 확인.
- 공식 source 다운로드와 SHA256 검증·local manifest/Node/dependency lock: 확인.
- Python: 현재 PATH의 Store alias는 실행되지 않으며 실제 interpreter를 찾지 못했다. 설치 후 `RTL_IDE_PYTHON`으로 명시할 수 있다. VSIX의 Python이나 node_modules를 자동 연결하지 않는다.
- MSVC: vswhere/일반 설치 경로에서 supported C++ 설치를 찾지 못했다. pinned preinstall은 VS2019/2022를 검사한다. 최신 wiki의 VS2026 설명과 pinned source의 차이를 기록하며 무조건 최신 도구로 대체하지 않는다.
- 해당 compiler·Windows SDK·ATL/Spectre 지원을 공식 문서와 native install로 확인해야 한다. 시스템 Build Tools 설치와 Python 준비는 사용자 승인 후 진행 중이다.
- doctor는 MSVC 존재의 예비 검사이지 전체 SDK/Spectre 구성·native build 성공 판정이 아니다. 실제 `npm ci`와 compile/native 실행을 통과해야 H1 완료다.

archive SHA256는 2026-10-09 공식 codeload 응답에서 직접 계산해 재현 기준으로 고정한 값이다. upstream 서명/공식 checksum 발표로 표현하지 않는다. bootstrap의 source manifest 검사는 전체 소스의 매 실행 무결성을 보장하지 않는다.

## 검증과 다음 작업

Node 정책·경로 격리·기준 revision/hash·변경 lock 차단 시험을 수행한다. 초기 경로 시험은 trailing slash fixture 때문에 실패했고 root 정규화 후 보완했다. 실제 결과는 공통 H1 검증 기록을 참조한다. 제품 실행/기능/성능 검증은 아직 없다.

설치 승인 후 요구 도구를 준비하고 doctor → 고정 dependency 설치 → compile → 격리 개발 실행 순서로 진행한다. H2에서 앱 외형과 Code/Simulation 공간을 구현한다. 실제 native dependency 실패가 발생하면 오류/원인/재시도 결과를 기록한다.

공식 근거: [contribution/build guide](https://github.com/microsoft/vscode/wiki/How-to-Contribute), [고정 preinstall](https://github.com/microsoft/vscode/blob/2a59476c9bfcb90b3ddc372c36762471b7dfad1c/build/npm/preinstall.ts), [소스·라이선스](https://github.com/microsoft/vscode/tree/2a59476c9bfcb90b3ddc372c36762471b7dfad1c).

## 로컬 Git metadata 경계

Code-OSS postinstall은 git config를 호출하므로 upstream 자체 .git/고정 official HEAD를 준비한다. bootstrap은 archive 추출 뒤 같은 revision metadata를 fetch하고 mixed reset으로 index만 구성한다. npm wrapper는 GIT_CEILING_DIRECTORIES와 inherited Git env 제거로 상위 저장소 발견을 차단한다. metadata는 source/설정 import가 아니며 ide 밖 code 연결은 없다. Git boundary/source/node/tool checks가 모두 통과해야 install/compile/start를 수행한다. 설치 중간 실제 결과는 공통 H1 검증 기록을 참조한다.
