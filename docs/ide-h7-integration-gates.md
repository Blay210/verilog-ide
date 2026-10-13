# H7 잔여 수용과 마지막 Windows 통합 순서 (2026-10-13 UTC)

H7A～S의 구현과 Linux 자동 근거를 유지하면서, 마지막 Windows 세션에서 확인해야 할 것을 실행 순서로 묶는다. 현재 cloud에는 Windows native 실행 근거가 없고 화면/Computer Use를 실행하지 않았다. 과거 H6D의 Windows 수용을 H7 변경 전체에 소급하지 않는다. [H7 수용표](ide-h7-acceptance-summary.md)와 [성능 계획](ide-performance-plan.md)의 상세 항목은 계속 유효하다.

| 우선순위·순서 | 준비/검증 | 통과 근거와 남길 기록 | 현재 판정 |
|---|---|---|---|
| P0·화면 점유 전 | Windows 개발 checkout·pinned 도구/owned overlay migration·runtime/language 및 공식 TS7 전체 타입/target emission | 실제 실행 버전/commit·출력·0 error·원본/기존 창·profile·trust 보존. Linux build로 대체하지 않는다 | cloud 공식 TS7 전체 src 타입/owned 출력0 errors·runtime/language PASS; Windows native build 미검증 |
| P0·headless 먼저 | NTFS 설정 게시/lease/journal·old handle·partial retirement/복구·alias/case/junction/권한 | 외부 bytes·후보·history/log/source/trace 보존, explicit recovery와 실패/취소 후 fresh retry. 전원 장애/CAS 보증으로 확대하지 않는다 | Linux/API 모델 근거 있음, 실제 NTFS 미검증 |
| P0·headless 먼저 | H7R package graph→Core 승인 왕복·취소/taskkill·LanguageClient/host shutdown | 오류 때 test compilation0·실제 소유 tree/IPC 종료·cleanupFailed quarantine/drain·새 시작 거절·retry, NTFS atomic 파일 전달 | Linux actual process/IPC PASS, native Windows client/tree/file 전달 미검증 |
| P1·headless부터 | native 파일 감시/등록 ack·missing/malformed root·header/journal·root rename/제거/복구 | 실제 전달·exclude·RelativePattern·shared roots·편집/dirty header/version/generation·late 결과 차단. modeled notification으로 대체하지 않는다 | 실제 Linux IPC와 모델 PASS, Windows native watcher 미검증 |
| P1·마지막 한 화면 세션 | Code/Simulation 공간·Run/Cancel·현재/과거 source/diff·복원/파형·언어 완성/진단 | 기존 UX·탭/결과 보존, 신뢰/미저장 TOML/설정 복구 안내와 물리 입력/DPI/그룹 drag/긴 viewport. 실패/복원도 같은 기록에 남긴다 | 화면 점유 검증 보류 |
| P1·같은 화면 세션과 장시간 | 대표 실제 설계의 cold/warm·idle·편집/완성·전환/Run·파형·메모리 | IDE/언어 서버/각 Python/worker의 CPU·heap/RSS/handle·대기·p50/tail·디스크 추이를 분리. 정상 baseline 뒤 예산을 확정한다 | 합성300 RTL/수천 signals만으로 미수용; 대표 실제 설계/Windows baseline 미확보 |
| P2·기록 정책 | active/archived journal·run artifact 전체 disk와 사용자 정리 정책 | active gate와 명시적 retirement는 존재하지만 archive 전체 cap/자동 삭제 정책은 없다. 기존 데이터 삭제를 검증 준비로 사용하지 않는다 | 전체 disk cap/정리 UX 잔여 |
| 별도 범위·배포 gate | clean Windows 설치/network/retry·FST 내장 표시/파형 enum/encoding·외부 extension/Diagram/전용 엔진 | 개발 검증과 기능 미구현·첫 앱 제외·배포 요구를 구분한다. 사용자 배포 요청 전 release/설치 패키지 생산 없음 | clean install 미검증, FST/파형 enum 등 미연결, 내부 연산 Python adapter 부재·Diagram/자체 엔진 새 착수 없음 |

현재 Linux 환경에서 계속할 수 있는 것은 결함 재현·일반 build/test·소유 진단의 개선이다. Windows 전용 검증은 실행 가능한 Windows checkout과 native 도구/host가 있어야 한다. 화면 검증은 위 P0 준비를 마친 뒤 마지막 통합 세션으로 모으며 기존 사용자 창/profile/trust와 원본을 보존한다. 이것은 이번에 Windows 검증을 실행했거나 통합 수용을 완료했다는 기록이 아니다.

H7S의 첫 enum 표시 metadata 재사용은 query scope의 계산 비용을 줄이는 작업이다. default signatures·전체 candidate/scope 발견과 파일/신뢰/journal·현재 분석 대기는 여전히 필요하다. 실제 saturated queue는 다른 살아 있는 compiler와 cleanup을 기다려야 하며, 단일 healthy root의 idle queue 측정으로 혼잡을 판정하지 않는다. 제어된100ms hold를 Windows 자연 지연이나 목표 예산으로 사용하지 않는다.

H7S 다음은 이 표의 P0 준비와 잔여 결함을 확인하는 **Windows 통합 검증 준비**다. cloud에서 가능한 재현/문서/비화면 검증은 계속할 수 있지만 default 해석·전체 scope 방문을 근거 없이 생략하거나 상시 worker/무검증 결과 cache로 대신하지 않는다. 더 작은 micro benchmark 개선을 전체 H7 완료의 조건으로 계속 늘리지 않는다. 실제 설계와 Windows baseline에서 확인한 병목을 후속 최적화의 근거로 삼는다.

## TB 자동 목록의 추가 통합 항목

[TB 자동 목록](ide-tb-auto-catalog.md)의 cloud component/실제 Linux filesystem 근거는 Windows 본체 수용과 별개다. P0 공식 TS7 타입/emission에 새 contract/channel/home/Core를 포함하고 NTFS `rtl-tests.json` 저장·case/junction/권한·외부 편집·취소/종료를 확인한다. P1 native watcher로 빈 등록 폴더의 생성/rename/delete/recreate·두 top/사용자 제외/수동 파일/재시작·누락 DUT 복구를 확인한다. 마지막 화면 세션에서 정확한 hover·키보드·dirty JSON/TOML 보호·행 선택/포커스·긴 목록 스크롤·기존 source/history/파형 탭 보존을 묶는다. 감지 중 simulation/tool 호출0, 자동 설정 쓰기0, idle 추가 요청0을 실제 앱에서도 계측한다. 대표 규모의 scan/목록/history 비용을 기록하고 cloud 합성 근거로 전체 앱 성능을 판정하지 않는다.

## 클라우드 통합 준비 이후

[최신 클라우드 준비](ide-cloud-integration-preparation.md)에서 본체 전체 타입/owned emission·실제 Node channel·TB actual Linux filesystem/규모/수명과 bounded read buffer 할당 비용을 검증했다. 위 P0/P1의 native OS/transport/물리 항목은 그대로 남는다. cloud 타입 검사로 새 UI 타입 결함을 찾을 수 있게 되었으나 native addon/Electron executable/extensions/media 준비나 Windows 공식 빌드 수용은 아니다. 환경 초안의 추가 install/start 지침은 저장되었으며 게시/새 task 복원은 별도다. 별도 기능 backlog(FST 표시/전체 disk 정책)를 검증으로 완료 처리하지 않는다.
