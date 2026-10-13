# H6 수용 범위 판정 (2026-10-12)

H6A2～H6D의 **기본 개발 흐름은 구현되고 단계별 수용 근거가 있다.** H6 기능 추가를 계속하는 대신 잔여 안정성·성능·복원 항목을 H7에서 다룬다. 이 판정은 독립 IDE 전체 베타·배포 수용을 뜻하지 않는다.

## 기본 경로와 근거

| 기능 | 수용한 동작 | 기존 Windows 근거 | 이번 Linux 확인 |
|---|---|---|---|
| 자동 trace | IDE 생성 driver, VCD/FST/off, 원래 top 계층, 원본 dump·RTL 보존, run별 격리 | [H6A2](ide-h6a2-managed-waveform.md): service/CLI 8항목, 예제 4회, trusted native 3시나리오 | 온보딩의 예제 VCD/FST 4회·retained 입력/trace hash·원본 보존 PASS |
| 시작 시점 미저장 입력 | 첫 await 전 동결, 기존 RTL/package/header/include, provenance, 실패 시 디스크 fallback 없음 | [H6B1](ide-h6b1-editor-input-snapshot.md): 실제 5회·3묶음; [H6B2](ide-h6b2-unsaved-run-ui.md): GUI/Explorer·native 5시나리오·실제 6회 | 온보딩 자동 Core/host 회귀 PASS; GUI 실행은 이번에 미실행 |
| saved/current 비교 | 현재 bytes/settings와 디스크 비교 분리, 동일 text/다른 version 일치, 후속 편집 무효화, TOML 보호 | [H6B3](ide-h6b3-current-input-comparison.md): package/header/DUT/TB·BOM, native 3시나리오·새 프로세스 1 | 실제 slang/LSP를 포함한 자동 회귀 PASS; GUI·재시작은 이번에 미실행 |
| 보관 소스 | runId에 연결된 검증된 원문, 읽기 전용, 삭제 원본 지원, 변조/비등록 경로 거절 | [H6C](ide-h6c-recorded-source-view.md): native 3 + 새 프로세스 3시나리오 | host 회귀 PASS; native provider 화면은 이번에 미실행 |
| 선택한 과거 run 비교·diff | 명시적 요청, buffer 동결·root/선택 guard, 편집 후 다시 비교, 삭제 파일 무생성 | [H6D](ide-h6d-selected-run-comparison.md): native 4시나리오, 공식 본체 타입/emission 0 errors | 결정적 host 회귀 PASS; Code-OSS diff 화면·물리 race는 이번에 미실행 |

Windows H6D의 145 PASS/0 FAIL/0 SKIP은 과거 로컬 결과다. Linux 온보딩은 같은 145개 중 **144 PASS/0 FAIL/1 SKIP**(Windows batch)이며, 서로 다른 OS·도구 버전의 근거를 합산하지 않는다. 이후 H7 결과는 [H7A](ide-h7a-history-recovery.md)·[H7B](ide-h7b-input-validation-cost.md)·[H7C](ide-h7c-process-cleanup.md)·[H7D](ide-h7d-waveform-restoration.md)·[H7E](ide-h7e-cache-memory.md)·[H7F](ide-h7f-project-recovery.md)·[H7G](ide-h7g-import-publication.md)·[H7H](ide-h7h-import-journal.md)·[H7I](ide-h7i-import-save-cost.md)·[H7J](ide-h7j-semantic-burst.md)·[H7K](ide-h7k-language-lifecycle.md)·[H7L](ide-h7l-semantic-inputs.md)·[H7M](ide-h7m-semantic-scale.md)·[H7N](ide-h7n-semantic-request.md)·[H7O](ide-h7o-semantic-context.md)·[H7P](ide-h7p-pyslang-positions.md)·[H7Q](ide-h7q-semantic-agreement.md)·[H7R](ide-h7r-package-session.md)·[H7S](ide-h7s-lookup-wait.md)에 별도 기록하고 [H7 잔여 수용표](ide-h7-acceptance-summary.md)와 [성능 계획](ide-performance-plan.md)을 따른다. H7D는 headless retained/view 복원과 worker 종료를 확인했으며 RSS 회복·Windows 앱 복원 전체 수용은 남는다.

## 지원 경계

- 실행 입력은 프로젝트 안에 이미 존재하는 일반 RTL/header 파일의 UTF-8/UTF-8 BOM 편집 내용이다. untitled·삭제된 원본·프로젝트 밖 입력·미저장 TOML은 자동 저장하거나 대체하지 않는다.
- 비교는 포착한 bytes/settings의 일치다. 전체 파일시스템의 원자적 snapshot이나 동일한 도구 환경을 보증하지 않는다.
- configured literal include·package 경계와 기존 크기/경로/hash 검증을 유지한다. 전체 전처리·임의 동적 include 지원을 주장하지 않는다.
- FST **생성**과 내장 FST **표시**는 별개다. 현재 내장 FST 표시 및 enum 소스 매핑은 미연결이다.
- 보관 소스 cache는 H7E에서 창당64MiB/256 entries LRU·model removal/project 전환/dispose 해제로 보완했다. 이 byte cache 한도는 text models·진행 중 읽기를 포함한 앱 전체 메모리 한도가 아니다. 과거 run 비교는 선택한 실행의 명시적 요청이며 history 전체를 타이핑마다 비교하지 않는다.

## 남은 수용과 담당 단계

| 남은 항목 | 진행 위치 | 실행 가능한 검증 / 최종 대상 |
|---|---|---|
| 가볍고 빠른 UX·수백 RTL/비교/스캔/보관·history 비용 | H7A～K 계측·H7L 실제 dependency/event 범위·최종 Windows 성능 baseline | Linux headless 합성 Core/host + 이후 실제 설계·Windows 앱 |
| 삭제 trace/log, 손상 기록, 복원 시 최신 run 보존 | H7A 복구 | 자동 회귀 + 이후 Windows 결과/이력 화면 |
| 실행 중 종료·종료 취소·하위 프로세스 정리·정리 실패 안내 | H7 후속 | Linux 가능한 프로세스 회귀 + Windows taskkill/native 종료 |
| 공간/탭/미저장 문서·파형·선택 이력 재시작 복원 | H7D headless run/view 복원 확인·앱 복원 잔여 | Windows Code-OSS 통합 세션 |
| 수천 신호·읽기/편집/파형 지연·메모리·cache 한도/탭 정리 | H7D reader 계측·H7E source LRU/model 해제·native RSS 부분 분리, 전체 RSS/실제 설계 잔여 | Linux profiler + Windows 앱 및 실제 설계 |
| UTF-8 외 encoding·untitled/deleted/foreign UX, 빠른 root/선택/편집 전환 | H7 경계 수용 | 결정적 자동 보호 + Windows 통합 조작 |
| 외부 writer/crash와 H5 설정 복구 | H7F 협력 lease 복구·H7G journal/no-replace 게시·명시적 복구/최종 경합 보존 PASS, H7H explicit archive·current2/병렬8·160회 저장 통과, H7I 반복 scan7→3·short read/membership/abort, 전체 archive disk/Windows 잔여 | 자동 journal/publication 보완 + Windows 실제 파일/종료 동작 |
| 물리 마우스·키 입력/DPI·그룹 drag·layout/긴 시간 | 마지막 통합 세션 | Windows 화면 검증, 현재 보류 |
| 깨끗한 Windows 설치·서명/다운로드·network/retry/reuse | 별도 설치 gate | Windows PC/VM 확보 필요 |
| FST 표시·enum | 기존 미구현 항목 | 별도 구현/수용 범위; H6 기본 경로 판정에 섞지 않음 |

앱 화면 검증은 이 작업에서 실행하지 않는다. 필요한 Windows 조작을 위 표에 누적하고 구현·일반 검증 후 통합한다. 사용 수용·릴리스 패키징은 별도 사용자 판단에 따른다.
