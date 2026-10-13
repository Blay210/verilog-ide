# H7 안정화 수용 범위 (2026-10-13)

H6 기본 흐름을 유지하면서 H7A～S에서 아래 Core/host 보호와 비용 개선을 진행했다. **Linux 자동 검증을 Windows 앱 전체 사용 수용이나 베타/배포 완료로 판정하지 않는다.** 최신 실행 결과는 [H7S](ide-h7s-lookup-wait.md)를 따르고 이전 단계의 별도 OS/fixture 결과를 합산하지 않는다.

| 범위 | 현재 자동 근거 | 남은 수용 |
|---|---|---|
| history/artifact 손상·삭제 | H7A: 최신 run identity/상태 보존·missing 안내·bounded history 조회 | Windows 실제 결과/로그/원본 삭제 UX, 장기 사용 |
| 입력 비교·보관 source | H7B/E: hash·path 검증, 요청 identity lookup/병렬8, epoch/A/B/A·close join, source64MiB/256 LRU | 실제 model/tab/diff 해제·실제 설계·encoding/빠른 물리 전환 |
| 실행 취소·종료 | H7C: 실제 Linux child tree/peer/timeout·cleanup 실패 분류·quarantine·close reject | Windows taskkill tree/정리 실패 안내, 실행 중 종료/취소/미저장 문서 UX |
| 파형/retained 복원 | H7D/E: 실제 worker 종료까지 slot4, view/run 재열기, 반복 worker/thread 회수 | Windows 앱 restart/공간/파형 탭 복원, 실제 viewport 지연·RSS 잔류 원인 |
| 현재 프로젝트 손상 | H7F: historyOnly에서 retained log/source/wave 유지, current Run/비교 잠금·복구 | 실제 Windows 결과 행과 잠금/복구 안내 |
| 설정 게시/복구 | H7G: 외부 bytes/old handle 보존, capture/link/commit crash·명시적 후보 비교/recovery | NTFS 실제 capture/link/alias/lease·권한, native 확인/복구/dirty/trust 흐름. CAS/전원 장애 보증 아님 |
| 설정 기록 누적 | H7H: explicit retirement·최근32 유지·active128 gate, partial abort/crash/fresh retry·160회 실제 저장 | archive 전체 disk cap/정리 정책·장기 사용·Windows 실제 partial 이동/취소. 자동 삭제 없음 |
| 반복 설정 검사 | H7I: 검증 snapshot 사용·최종 게시 scan 공유·7→3회, bounded 읽기·short read·membership/abort | 실제 프로젝트/Windows 저장 체감, 그 밖의 config/semantic/갱신 중복 비용 |
| 언어 분석 요청·종료 | H7J LSP2/32·in-flight 공유·actual query20→1·caller 취소/실제 cleanup join/quarantine·shutdown cache0·과부하 retry | Windows LanguageClient stop deadline/IPC·taskkill/실패 재시작, all-root/settled/package compilation·대표 입력 대기 지연 |
| 언어 시작/재시작·상태/종료 | H7K 최신 probe/restart·status single/focus·actual IPC drain/Python4/parent exit·quarantine·late callback/deactivation join | Windows/Electron 실제 client/host stop deadline·IPC/disconnect/trust UI·native cold/warm/idle |
| 실제 입력·파일 감시/설정 무효화 | H7L expanded/누락 include 후보·source/header membership, 등록/해제 ack·신규 감시 뒤 확인 read, generated100개1→0·.inc 갱신·active previous/query 차단·shared2 roots/remove 감시 해제 | Windows native watcher 실제 전달/rename·exclude/junction, 등록 규모/native 전달·coarse prefix·config/compiler 비용, 실제 설계 |
| source 범위·감시 규모 | H7M validated prefix/Weak metadata·static watcher 재사용/recursive 압축, actual900 RTL×3회 startup6→3/local3→1/dynamic900→0·peer query/외부 glob/비RTL 신규 구성·stale failure guard | coarse prefix의 불필요한 이벤트, mixed/error broad 감시·native 실제 비용·compiler critical path/latency·대표 설계 |
| compiler 시작·편집→완성 | H7N 요청별 process만 공유·독립 compilation 유지, actual300 RTL/tests2 provider launch3→2/IPC edit6→4·취소/부분 batch 거절·복구·Linux293 PASS/1 Windows SKIP | 단계별 지연 변동/peak RSS·별도 package 시작/default/완성 비용, inline macro 뒤 code context와 typed missing-manifest/감시, 대표 설계/Windows |
| 미설정 폴더·macro code 문맥 | H7O typed 부재·root/parent shallow 복구/설치 확인 read·unrelated missing read1→0/mixed2→1, inline signal/package/서명·plaintext header 복원/부분 오류 분류·Linux303 PASS/1 Windows SKIP | native root/parent rename·RelativePattern/create/delete/case/junction, malformed broad fallback·point/path/default/완성 CPU와 대표 설계/Windows |
| pyslang 연동의 좌표/경로 중복 | H7P 요청별 canonical·4MiB/64 buffer/4096 point·lstat14675→9763/그룹·큰 shared 완성1418→992ms/20 JSON쌍 일치·좌표/manager/alias guard·Linux307 PASS/1 Windows SKIP | 작은 IPC/전체 RSS 개선 미확인, 별도 package/default/완성 lookup·queue·native 대표 설계/Windows; 자체 엔진 개발 아님 |
| 완성 후보 동의·scope 좌표 비용 | H7Q 전체 JSON 선형 교집합·첫 순서/중복 유지·symbol stringify93,326→608·큰 shared Node CPU319.9→33.7ms·20 JSON쌍 일치·실제 package 오류/취소/복구·Linux310 PASS/1 Windows SKIP | 별도 package process/import·default/lookup/queue 잔여, wall 편차·작은 IPC/전체 RSS 개선 미확인·대표 설계/Windows |
| auto package 요청 내 시작 공유 | H7R graph/version→Core 검증→atomic approval/ack·fresh manager·Python 시작2→1/IPC4→2·20 JSON쌍 일치·취소/쓰기에러/조기 응답/실제15초 누락 종료·Linux316 PASS/1 Windows SKIP | NTFS 실제 왕복/taskkill·default/lookup/queue·대표 설계/Windows; shared Node CPU/peak RSS 증가·내부 연산 adapter 미구현 |
| enum 표시 중복·대기 구분 | H7S native identity/같은 scope·64 types/4096 values/1MiB UTF-8·fallback/owned copies·lookup9332→950·dense1405→643ms/Python peak55.6→41.4MiB·30 JSON쌍 일치·현재 분석/queue/active 구분·Linux322 PASS/1 Windows SKIP | 일반 IPC949.5→979.4ms 개선 미확인·default/candidate·포화 queue/대표 설계·Windows·전체 앱 RSS 잔여 |
| 가볍고 직관적인 경험 | 사용자 요구를 AGENTS·[성능 로드맵](ide-performance-plan.md)에 명시하고 기능별 비용을 분리 | H7J actual LSP burst·H7K 모델 restart/status 및 실제 IPC 종료 → H7L 실제 dependency/event 범위 완료 → H7M 수백 RTL source/감시 비용 완료 → H7N 요청별 compiler 시작 공유/편집→완성 계측 → H7O typed 미설정·macro context 완료 → H7P pyslang 위치/완성 비용 완료 → H7Q 완성 비교/좌표 비용 완료 → H7R package 요청 protocol/취소·join 완료 → H7S enum 표시/lookup·대기 분리 완료 → [통합 준비 우선순위](ide-h7-integration-gates.md) → Windows cold/warm·idle·편집/공간 전환·Run/파형, baseline 후 예산 확정 |
| 공식 본체/물리 통합 | runtime/language와 pinned modules의 headless 근거는 각 단계에 기록 | cloud 공식 TS7 전체 타입/owned emission0 errors 확인 후 Windows native build 재실행·NTFS/IPC·물리 입력/DPI/그룹 drag·긴 세션. 화면 검증 계속 보류 |
| 설치/배포·지원 경계 | 개발 체크아웃만 사용, ide/vsix 각각 code/config/deps 소유 | clean Windows 설치·network/retry/서명 gate, 사용자 판단 후 패키징. FST 내장 표시/enum은 미연결 범위 |

다음은 **[Windows 통합 검증 준비와 실행 우선순위](ide-h7-integration-gates.md)**다. P0 공식 본체/owned overlay·NTFS/취소·종료를 화면 점유 전에 확인하고 P1 native watcher와 마지막 한 화면 세션·대표 실제 baseline을 준비한다. H7S의 dense Python/lookup 개선을 일반 IPC·tail/포화 queue·전체 앱 RSS 수용으로 표현하지 않는다. 현재 분석과 query의 실제 compiler 작업은 남으며 파일/신뢰/journal·Core 승인·scope/parameterization·generation/version·취소/실제 join/quarantine을 유지한다. 내부 연산 조회 adapter 부재와 FST/파형 enum·전체 archive disk/배포는 별도 잔여다. 요청 사이 무검증 cache나 자체 compiler/simulator를 새로 시작하지 않으며 기존 창/profile/trust를 보존한다. H7/전체 성능/베타·배포 완료를 선언하지 않는다.

최신 TB 자동 목록과 클라우드 통합 준비의 별도 결과는 [TB 계약](ide-tb-auto-catalog.md)·[클라우드 준비](ide-cloud-integration-preparation.md)를 따른다. H7S의323개 결과와 합산하지 않는다.
