## Windows 비화면 합성 관측 (2026-10-13 KST)

[클라우드 복귀 검증](ide-windows-cloud-return.md)에서 300 RTL/100 TB/202 rows·20 add/delete를 실제 Windows Node watcher/Core/host로 관측했다. Core load 중앙값479.6ms·host refresh495.4ms·add+delete862.8ms, 반복 후 heap 약9.05MiB/RSS179.0MiB. 전체 회귀와 겹친 합성 실행으로 단독 baseline/이전 cloud 대비 개선율/전체 앱 빠릿함/장기 누수를 판정하지 않는다. 대표 실제 설계·native workbench·파형 startup/idle/edit/CPU/RSS/handle은 잔여다.

# 가볍고 빠른 IDE 수용 계획 (2026-10-13)

사용자는 Visual Studio/Vivado보다 VS Code/PyCharm에 가까운 가볍고 직관적인 경험을 원한다. 기능을 찾기 쉬운 기존 Code/Simulation 흐름을 유지하고, 불필요한 자원 사용과 지연을 줄이는 것을 제품 요구로 관리한다. 보기 좋은 화면이나 단일 합성 benchmark만으로 최적화 완료를 판정하지 않는다.

H7에서 기능별 비용을 먼저 계측하고 확인된 병목을 개선한다. 시작·idle·편집·공간 전환·실제 설계의 체감 응답성은 마지막 Windows 통합 검증에 함께 넣는다. 사용자 화면을 차지하는 검증은 그때까지 보류한다.

| 범위 | 측정할 것 | 진행 순서와 현재 근거 |
|---|---|---|
| 설정 읽기·저장 | 같은 입력의 읽은 bytes, 파일 열기, 임시 버퍼, CPU 시간, 중앙값·지연 분포 | H7H journal 조회 개선 → H7I 반복 저장 검사 공유 완료. request 간 무검증 캐시를 만들지 않는다 |
| 파일 변경·의미 분석·입력 비교 | 이벤트/실제 분석·Core load 횟수, 감시 등록 수/계획·native 비용, CPU와 결과 지연 | H7J query20→1 → H7K startup/status → H7L inputs/journal → H7M actual900 RTL/3회: startup6→3/local3→1/normal dynamic900→0/shared3→2. prefix·static 재사용/등록 압축·peer 유지 완료. H7N 요청 안의 Python 시작 공유로 provider3→2/IPC edit6→4·compiler 내부/대기·peak RSS 계측, missing/malformed root idle/status0·burst 설정 read 잔여. H7O typed 미설정·shallow 복구 감시/등록 뒤 확인·missing unrelated read1→0/mixed2→1·inline macro 뒤 실제 완성·서명/미저장 header 복원 완료. H7P 요청별 경로/좌표 상한·큰 shared 완성1418→992ms·lstat14675→9763/그룹·semantic/hierarchy20쌍 일치 완료. H7Q 전체 symbol 동의/순서·중복 유지·JSON 직렬화93,326→608/큰 shared Node CPU319.9→33.7ms/20 JSON쌍 일치 완료. H7R graph→Core 검증→승인 후 fresh 분석·시작2→1/IPC4→2/20 JSON쌍 일치 완료. 이번 IPC1779→901ms이며 shared Node CPU/peak RSS 증가도 기록. H7S 정확한 native identity/고정 scope의 enum 표시 재사용·lookup9332→950/dense1405→643ms/30 JSON쌍 일치·snapshot vs queue/active 구분 완료. 일반 IPC 개선 미확인. 다음은 [통합 검증 준비](ide-h7-integration-gates.md)의 P0/P1와 실제 baseline. Linux settle 관측을 Windows/전체 응답 지연 개선으로 일반화하지 않는다 |
| 시작·idle·Code/Simulation 전환 | cold/warm 편집 가능 시간, idle CPU/I/O, 전환 지연, host/worker/handle 수 | H7K 실제 adapter/API 모델 restart20→1·slow status11→1·inactive/focus timer0, 실제 IPC/Python drain/parent exit0 확인. Windows/Electron native client/host stop·전체 startup/idle/frame 비용은 최종 통합 gate |
| 편집·탐색·Run | 입력→화면 반영/진단/완성 지연, 프로젝트 열기, Run 입력 포착과 실제 빌드 비용 분리, 취소 후 다시 사용 가능 시간 | 수백 RTL 파일 합성 fixture로 자동 비용 확인 후 실제 대표 설계와 Windows UI에서 확인. 컴파일러 실행 시간을 IDE 자체 지연으로 섞지 않는다 |
| 보관 source·파형·재시작 | cache bytes/entries, 열린 모델·worker 수, 열기·닫기·반복 사용 시 heap/RSS·handle 추이, 실제 파형 이동 지연 | H7D/E의 worker4·source64MiB/256 entries·join/해제 유지. Linux anonymous RSS 잔류 원인은 미해결이며 실제 renderer/model 해제와 Windows 메모리를 별도로 확인한다 |
| 장기 사용·디스크 | 반복 저장·열기·닫기 후 자원 plateau, active/archived journal과 run artifact 증가량 | H7H의 active128/명시적 최근32 유지와160회 저장 근거. archive 전체 disk cap·정리 UX는 아직 미구현이며 자동 삭제를 추가하지 않는다 |

동일 fixture·같은 버전/환경·여러 회수로 전후 결과를 비교하고 I/O·할당·CPU·대기 시간을 구분한다. warm-cache 중앙값은 cold 시작이나 p95를 대신하지 않는다. 대표 Windows baseline을 확보한 뒤 동작별 수용 예산을 정하며 지금 임의의 ms/RSS 목표를 성공 기준으로 선언하지 않는다.

실제 사용자 흐름에서 멈춤·누적 사용량 증가·쓸모없는 idle 작업이 발견되면 H7 잔여 수용표에 결함으로 남긴다. 임시 버퍼 할당 감소를 전체 앱 RSS 감소로 표현하지 않는다. 원본/보관 파일 검증, 신뢰·미저장 보호, 결과 identity, 취소·종료 join을 유지하고 기존 메뉴/탭/버튼 흐름을 보존한다. 제품에 항상 켜진 profiling이나 새 성능 설정 화면을 추가하는 작업은 아니다.

H7N의 실제 단계별 비용·전후 지연 분포·peak RSS·Linux 전체294개 결과는 [요청별 compiler 시작 공유](ide-h7n-semantic-request.md)를 따른다. 프로세스 수 감소와 전체 앱 지연/메모리 수용을 구분한다.

H7O의 미설정 재검사·inline macro 문맥·복구 회귀와 Linux 전체304개는 [상세 근거](ide-h7o-semantic-context.md)를 따른다. baseline은 query가 실행되지 않았으므로 새로 수행되는 query 시간을 latency 개선으로 비교하지 않는다.

H7P의 기존 pyslang 연동 개선·큰 workload/작은 IPC·좌표/경로 상한·전체308개 결과는 [상세 근거](ide-h7p-pyslang-positions.md)를 따른다. 자체 엔진 개발이 아니며 작은 IPC/RSS 개선 미확인을 구분한다.

H7Q의 실제 전체 JSON 비교·scope 좌표·package 거절/취소·전후5회와 Linux 전체311개는 [상세 근거](ide-h7q-semantic-agreement.md)를 따른다. 큰 공유 완성의 Node CPU 감소를 전체 latency/RSS 수용으로 판정하지 않는다. 작은 IPC 편집→완성은1277.2→1472.2ms로 개선 미확인이고 별도 package process/import 비용은 남는다.

H7R의 요청별 package protocol·승인/정리 경계·실제5회 전후·Linux 전체317개는 [상세 근거](ide-h7r-package-session.md)를 따른다. Node의 시작 중 disk polling 없이 소유 stdout 알림을 재사용한다. Python의 승인 대기만 요청 안에서10ms/최대15초이며 상시 worker는 없다. Python 시작 감소와 IPC 개선 관측을 전체 메모리/Windows 수용으로 표현하지 않는다.

H7S의 bounded enum 표시 재사용·모든 한도 fallback/native identity/독립 output·actual CPU 단계와 pool 대기·Linux 전체323개는 [상세 근거](ide-h7s-lookup-wait.md)를 따른다. dense Python peak55.6→41.4MiB와 lookup 감소는 해당 fixture의 관측이며 waveform/전체 앱 RSS 수용이 아니다. 일반 IPC는 개선되지 않았고, 현재 분석403.7ms와 query active561.8ms가 queue 약0.1ms와 구분됐다. [Windows 통합 우선순위](ide-h7-integration-gates.md)에 따라 대표 baseline 뒤 응답/자원 예산을 정한다.

## 클라우드 TB 목록 후속 계측

[통합 준비](ide-cloud-integration-preparation.md)에서300 RTL+100 TB 파일/202 rows·20 add/delete·actual OS rename/recreate·idle/설정 보존을 검증했다. 요청 내 small source chunk4–64KiB로806회 읽기 buffer 할당52,822,016→3,301,376 bytes(93.75% 감소)·동일 source/test 선택 hash·파일 성장/실제 byte 상한 보호를 확인했다. Core 중앙값과 반복 tail 개선은 미확인이며 전체 project scan·history 비교·allocator/RSS·대표 실제 설계의 startup/idle/편집/파형/장기 사용은 별도다. 0 compiler/simulator는 TB 목록 감지 경로의 근거이며 일반 언어 분석 기능을 중단한 것이 아니다.
