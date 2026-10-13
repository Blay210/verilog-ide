# Simulation TB 자동 목록 (2026-10-13 UTC)

사용자가 지정한 TB 폴더의 코드 추가·삭제를 Simulation 목록에 자동 반영한다. 감지는 실행 준비 목록만 바꾸며 자동 컴파일·시뮬레이션·파형 열기를 하지 않는다. 독립 IDE의 기능이며 VSIX는 변경하지 않았다. 기존 H7S와 홈 디자인 다음의 사용자 요청으로, H7 전체 수용/배포 완료를 의미하지 않는다.

## 사용자 동작

| 동작 | 결과 |
|---|---|
| `TB 폴더 등록` | 프로젝트 안의 폴더를 등록한다. 빈 폴더도 이후 파일 생성 이벤트를 감시한다. |
| 등록 폴더에 `.sv`/`.v` 파일 추가·삭제/선언 변경 | 완성된 고유 module별 행을 추가·제거한다. 한 파일의 두 TB는 각각 다른 행이다. |
| 행의 `목록에서 제외` | 코드 파일은 보존하고 해당 file/top의 재등록을 막는다. 코드 수정·삭제 후 재생성·재시작에도 유지한다. |
| `TB 파일 추가` | 자동 폴더 밖의 프로젝트 내 파일도 등록한다. 파일의 여러 module을 각각 반영하며 그 파일의 기존 제외를 명시적으로 해제한다. |
| `제외한 TB 복원` | 선택한 제외 항목을 해제한다. 파일/선언이 현재 존재하면 행이 돌아온다. |
| 실행·로그·파형 아이콘 hover | 각각 정확히 `실행`, `로그`, `파형`을 표시한다. 접근성 이름에는 TB 이름도 포함한다. |

홈은 기존 전체 세로 스크롤을 사용한다. 목록 추가·삭제 시 같은 프로젝트의 영향 없는 행은 DOM을 재사용하고 선택·포커스를 유지한다. 기존 결과/로그/보관 소스/파형 탭은 파일 삭제나 목록 제외로 삭제하지 않는다. 제거된 행의 실행 결과는 history에 남고 같은 identity 복원 때 재연결한다.

## 설정·Core 계약

`rtl-tests.json`은 프로젝트 루트의 source-first 사용자 선택 파일이다. version 1, 폴더/파일 역할, 수동 파일 목록, 제외한 file/top을 저장한다. 기존 이름을 가진 manifest alias는 optional name으로 독립 제외/복원이 가능하다. 자동 이벤트는 JSON/TOML/원본 소스를 쓰지 않으며, 명시적 등록/제외/복원만 JSON을 게시한다. 파일이 없으면 canonical IDE 관리 TOML의 기존 Simulation 역할을 읽어 시작한다. 수정된/custom TOML의 관리 metadata를 자동 채택하지 않는다. 별도 JSON을 만든 뒤에는 TOML 변경으로 사용자 선택을 지우지 않는다.

Core의 `loadProject`가 읽기 전용 목록을 해석하므로 GUI·CLI·언어 서비스가 같은 등록 결과를 사용한다. 기존 manifest 테스트 이름·태그·timeout·source를 보존하며 새 행만 안정적인 file/top hash 이름을 사용한다. 자동 역할의 후보는 완성된 고유 lexical module만 선택한다. duplicate 선언·macro 생성/조건부 모호성을 compiler처럼 추측하지 않는다. 사용자 Run 때 기존 semantic/package 검사와 Verilator adapter가 검증한다. 자체 compiler/simulator를 만들지 않았다.

삭제된 TB가 관리 TOML의 공통 RTL literal에도 있으면 해당 TB의 누락 항목만 effective 입력에서 제외한다. 원본 TOML은 유지한다. 일반 DUT/package 누락은 여전히 실행 오류이며, valid 설정과 TB metadata가 있으면 목록 동기화는 계속하고 Run은 잠근다. DUT 복구 뒤 정상 실행 상태를 회복한다. multi-source/glob/external custom test는 단일 파일 identity로 추측하여 재작성하지 않는다.

새 polling·worker·UI 의존성은 없다. 기존 파일 이벤트/500ms debounce·취소/join을 사용하고 하나의 Core inventory를 목록/구성 비교에 공유한다. 감지에 simulator·Python 호출은 없다. 기존 lexical scan 상한에 더해 live tests 1000, 폴더/파일 역할·수동 파일 각1000, 제외10000, JSON1MiB 상한이 있다. 넓은 프로젝트의 scan/전체 history 비교 비용까지 없어진 것은 아니며 대표 Windows 설계 성능 수용은 별도다.

명시적 저장은 trust·busy/복구/미저장 설정·root/epoch/revision 보호와 import lease, 임시 파일 sync→rename을 사용한다. root escape·생성물/의존성·링크·malformed/duplicate 설정과 stale revision을 거절한다. 진행 중 picker의 프로젝트 A/B/A 응답은 적용하지 않는다. `rtl.toml`과 `rtl-tests.json` 미저장 편집을 보호한다. 기존 테스트 관리 Apply는 compiler 검토 후 TOML과 사용자 선택을 각각 명시적으로 게시한다. 두 파일의 원자적 묶음 transaction/CAS나 전원 장애 보증으로 표현하지 않는다.

## 검증 근거

- runtime/language TypeScript build PASS. 최종 관련 **38 PASS/0 FAIL/0 SKIP**: 자동 두 top/삭제/재생성/재시작·수동 등록·named alias·누락 DUT/공통 TB source·설정 경계·프로젝트 복구·실제 UI stale/dirty/trust·owned overlay.
- 최종 순차 전체 회귀 **332 PASS/0 FAIL/1 Windows batch SKIP(총333개)**, exit0/286.0초. runtime 최종 빌드 뒤 제품 코드 변경 없이 `node --test --test-concurrency=1 tests/*.test.mjs`를 실행했다. Windows batch 검사는 Linux에서 SKIP이며 실행한 검사와 구분한다. 변경 화면/channel 세 파일의 esbuild 구문 변환·`git diff --check` PASS.
- private fixture의 real host에서 자동 등록 직후 backend0/semantic0/history0. 명시적 Run 뒤 실제 Verilator 두 TB PASS/VCD 생성. 파일 삭제 뒤 행0/history2·원본 설정 보존. 파형 화면은 열지 않았다.
- Linux `fs.watch`의 실제 OS 이벤트→HTTP/SSE로 대체한 파일 서비스→현재 production 홈 컴포넌트→real host에서 빈 폴더 등록/두 top 추가/삭제/제외 유지/폴더 밖 수동 파일/영향 없는 행 재사용/자동 설정 쓰기0/idle 추가 요청0을 확인했다. compiler/simulator0/history0. native Code-OSS IPC 자체의 수용은 아니다.
- Chromium 실제 컴포넌트와 실제 CSS에서 icon tooltip·aria·Tab 실행→로그→파형, selection/history/trust/log/hidden 전환, dark/light 및800/480/320px 가로 넘침 검사를 통과했다. 클라우드 화면 캡처이며 Windows 전체 앱을 검증하지 않았다.

ignored 근거: `ide/.dev/design-capture/catalog-ready-targeted.log`, `catalog-complete.log`, `catalog-final-runtime.log`, `catalog-language-final.log`, `catalog-real-run-receipt.json`, `catalog-browser-receipt.json`, `layout-review.json`, `simulation-catalog-live.png`. 로그/캡처/도구는 GitHub checkout에 따라오지 않는다. 재현 가능한 계약은 `ide/tests/test-catalog.test.mjs`, UI provider/overlay/project-management/history recovery 검사에 있다.

초기 전체 회귀에서 linked manifest를 live 프로젝트로 승격한 오류를 발견하고 regular/unlinked 검사를 복구했다. 다음 회귀의 custom TOML 역할 기대는 별도 명시적 사용자 선택을 유지하는 새 계약에 맞게 수정했다. 처음부터 전체 통과했다고 기록하지 않는다. 초기 cloud helper의 경로/Node compile filename/service stub 오류는 보완했고 제품 수용과 구분한다.

## 인수인계·미검증

클라우드 환경의 pinned 도구/activation을 재사용했고 설치·environment 초안·배포/commit/push는 추가하지 않았다. 최신 소유 overlay hash migration 검사를 유지한다. Windows 공식 TS7 전체 타입/target emission, 실제 client/channel IPC·native watcher의 빈 폴더/rename/delete/recreate·NTFS case/junction/권한·JSON 외부 편집/미저장·취소/종료·DPI/고대비/물리 hover/키보드/큰 목록 성능은 미검증이다. Linux 모델/구문 변환을 대체 근거로 사용하지 않는다.

다음 작업은 [H7 통합 검증 우선순위](ide-h7-integration-gates.md)의 P0 공식 본체/NTFS/cleanup 후 P1 native watcher와 마지막 한 화면 통합이다. 기존 창/프로필/신뢰를 유지하고 Windows 실제 근거를 별도로 기록한다. 이전 [홈 디자인](ide-simulation-home-design.md)·[H5E2](ide-h5e2-source-sync.md)의 TB 수동 Apply-only 설명은 이 요청 이전의 역사이며 일반 RTL/package/header 구성 변경 안내는 기존 명시적 관리 흐름을 유지한다.

후속 [클라우드 통합 준비](ide-cloud-integration-preparation.md)에서 전체 본체 TS7/owned 출력0 errors·actual Node channel/OS rename/recreate·100 late caller/close join·read chunk 할당 감소와 최종336개 검사를 확인했다. 위333개는 이 기능 최초 검증의 역사이며 Windows native 수용은 여전히 별도다.
