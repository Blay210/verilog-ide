# Simulation 홈 디자인 정리 (2026-10-13 UTC)

사용자가 Simulation 홈 캡처를 검토한 뒤 모던하고 단순한 디자인, 관련 기능의 카드/컨테이너 그룹화와 둥근 버튼을 요청했다. 기존 Code/Simulation 작업 공간과 실행·선택·이력·입력 비교 UX를 유지하며 독립 IDE의 홈 화면만 정리했다. H7S 이후의 디자인 개선이며 H7 전체 수용이나 새 기능 단계 완료로 해석하지 않는다.

## 변경

후속 사용자 명칭 요청으로 코드 관련 기능 그룹의 이름을 `입력`에서 **Source Code**로 변경했다. 화면 레이블과 접근성 그룹 이름을 함께 바꿨으며 RTL·테스트벤치·package·header를 포함한다.

- 제목/설명과 폴더 열기를 헤더에 배치한다. 프로젝트 상태와 실행 도구는 하나의 카드에서 실행 그룹/프로젝트 관리 그룹으로 나눈다.
- 테스트 목록은 개수와 빈 상태를 갖는 영역이다. 각 테스트 카드에서 이름과 top, 실행 결과/입력 상태를 먼저 읽고 개별 실행 버튼을 찾을 수 있다. 카드 오른쪽에 실행·로그·파형을 나란한 아이콘 버튼으로 묶고, 보관 소스·입력 비교·소스 차이는 아래의 ‘Source Code’ 그룹에 둔다. 여러 실행이 있으면 기존 이력 선택기를 결과 상태 옆에 표시한다.
- 주요 전체 실행 버튼은 강조색을, 개별 실행 아이콘은 초록색을 사용한다. 나머지 버튼은 보조색/투명 배경이며 버튼 6px, 카드 8–12px 모서리와 일정한 간격을 사용한다. 선택한 카드의 테두리, 텍스트를 유지한 결과 색, 기존 키보드 focus outline을 제공한다.
- 기존 열린 로그의 기본 동작은 유지하며 독립된 접기 가능한 패널로 정리했다. 긴 로그는 패널 안에서 스크롤한다. 홈은 최대 1200px이며 작은 폭에서 그룹을 줄바꿈한다. 다크/라이트/고대비용 Code-OSS 테마 토큰과 대비 테두리를 따른다.
- `ide/src/rtlSimulationHome.ts`, `ide/src/rtlSpaces.contribution.ts`와 이전 소유 홈 버전의 안전한 이동을 위한 `ide/config/source-overlay.json`만 제품 코드/설정으로 수정했다. VSIX/런타임/시뮬레이터/파형 renderer는 변경하지 않았다.

새 UI 의존성, 이미지/웹폰트 다운로드, 애니메이션, 타이머나 background polling은 추가하지 않았다. 기존 요청 수명/선택/로그 repaint와 행 재사용을 유지한다. 테스트 개수 텍스트도 실제 값이 달라질 때만 갱신한다. 앱 전체 메모리나 지연을 측정한 성능 수용은 아니다.

## 후속 아이콘 배치와 TB 폴더 동작

사용자 요청으로 각 테스트의 실행·로그·파형 버튼을 같은 오른쪽 그룹에 배치했다. 실행은 초록색 삼각형, 로그는 터미널, 파형은 기존 프로젝트 사각 디지털 파형 도형이다. 기존 파형 SVG의 rect/path 모양을 IDE 소유 CSS에 이식했다. 세 아이콘 모두 inline SVG mask와 테마 색을 사용하며 다른 프로젝트 파일, 아이콘 패키지/웹폰트, 네트워크를 불러오지 않는다. 32px 버튼의 tooltip과 테스트 이름을 포함한 aria-label, 장식 아이콘의 aria-hidden을 적용했다. 기존 data-action/콜백·활성/잠금 조건은 유지했다.

최종 관련 검사 **27 PASS / 0 FAIL / 0 SKIP**(기존 24개 + `source-sync.test.mjs` 3개), 화면 두 파일 구문 변환 PASS. Chromium에서 세 버튼의 인접 배치/순서와 mask 표시, tooltip/접근성 이름, 실제 Tab 이벤트의 실행→로그→파형 이동을 확인했다. 이력 선택/행 보존/잠금/로그 접기 및 800/480/320px 가로 넘침 검사를 다시 통과했다. Windows 본체/물리 수용을 추가로 확인한 것은 아니다. 근거: ignored `ide/.dev/design-capture/icon-regression.log`, `layout-review.json` 및 갱신 캡처.

이후 사용자 요청으로 TB 폴더 자동 목록을 구현했다. 파일 추가·삭제/여러 top을 자동 반영하고 사용자 제외를 영구 유지하며 폴더 밖 수동 파일도 등록한다. 자동 실행/설정 쓰기는 없다. 아이콘 hover는 정확히 실행/로그/파형이다. 최신 동작과 최종 회귀·Windows 제한은 [TB 자동 목록](ide-tb-auto-catalog.md)을 따른다. 이전 TB 수동 Apply-only 계약은 역사이며 일반 RTL/package/header 구성 관리는 명시적 검토 흐름을 유지한다.

## 검증

- IDE runtime build PASS, 변경 화면 TypeScript 두 파일의 esbuild 구문 변환 PASS(기존 upstream experimentalDecorators 옵션 사용).
- 관련 기존 검사 **24 PASS / 0 FAIL / 0 SKIP**: `tests/recorded-source-provider.test.mjs`, `tests/simulation-host.test.mjs`, `tests/source-overlay.test.mjs`. 읽기 전용 보관 소스/복구·신뢰/미저장/프로젝트 변경 보호, 실제 host 실행/취소/정리/이력, overlay 반복/알 수 없는 수정 거절을 확인했다. 전체 323개 회귀를 이번 디자인 작업에서 반복하지 않았다.
- Chromium에서 현재 `RtlSimulationHome` 코드와 `rtlSpaces.contribution.ts`의 실제 스타일을 렌더링했다. Code-OSS 환경 서비스는 로컬 fixture로 대체하고 모든 backend 명령은 막았다. 기존 캡처용 예제 프로젝트의 실제 Verilator PASS/보관 결과를 재사용했으며 이번 디자인 검증에서 새 실행/파형 열기는 하지 않았다.
- DOM event로 테스트 선택, 로그 갱신 중 기존 행/선택/run 유지, fixture 신뢰 해제 시 실행 잠금/읽기 버튼 유지, 과거 이력 표시→최신 복원, 로그 접기/펼치기를 확인했다. 홈/파형 영역의 hidden 전환도 확인했다(파형 데이터/iframe을 열지는 않음).
- 1440×1080 다크/라이트 캡처 및 800/480/320px 폭에서 버튼/이력 선택기/카드의 가로 넘침 없음. 480px 캡처의 추가 이력 항목 하나는 배치/선택용 fixture이며 실제 새 run이 아니다.
- `git diff --check` PASS. 제품 파일/테스트에 임시 preview helper를 추가하지 않았다.

로컬 근거는 ignored `ide/.dev/design-capture/`의 `regression-final.log`, `layout-review.json`, `capture-after-receipt.json`, `simulation-results.png`, `simulation-light.png`, `simulation-narrow.png`에 있다. 이 경로는 GitHub checkout에 따라오지 않는다. 이전 캡처는 `*-before.png`로 보존했다.

초기 검증 helper의 로그 선택기가 숨겨진 가져오기 summary를 선택했고, 구문 변환에는 기존 decorator 옵션이 빠져 있었다. 각각 로그 패널의 정확한 선택기와 upstream 옵션으로 보완하여 최종 검사를 통과했다. 제품 기능 회귀로 판정하지 않는다.

## 인수인계와 제한

이 결과는 클라우드 브라우저에서 본 홈 컴포넌트이다. Windows 앱 전체 창/제목 표시줄/Activity Bar/상태 표시줄이나 실제 서비스 IPC, Windows 글꼴/DPI, 고대비 테마의 실제 화면 수용은 검증하지 않았다. pinned Windows upstream 전체 타입 검사/공식 emission도 이번에는 실행하지 않았다(이 디자인 검증 시점의 클라우드에는 전체 client 의존성/TS7 도구가 없었다). 구문 변환과 runtime 타입 검사를 본체 전체 타입 검사로 표현하지 않는다.

사용자의 이번 요청 범위에서만 화면 코드를 캡처했다. 기존 Windows 통합 검증의 우선순위와 마지막 화면 세션 계획은 [H7 통합 검증 우선순위](ide-h7-integration-gates.md)를 따른다. Windows에서 최신 overlay를 적용하고 공식 본체 타입/emission 후 Code↔Simulation, 실제 이력/비교/파형 왕복, 좁은 배치·DPI·고대비와 키보드 포커스를 함께 확인한다. 기존 창/프로필/신뢰를 변경하거나 배포/commit/push하지 않았다.

후속 [클라우드 통합 준비](ide-cloud-integration-preparation.md)에서 pinned client root/build 의존성과 checksum Electron 선언을 준비하고 공식 전체 TS7 타입/owned 출력0 errors를 확인했다. Windows native 앱/물리 화면 수용과 구분한다.
