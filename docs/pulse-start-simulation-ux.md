# Pulse 첫 시작·Simulation UX 보완 (2026-10-14)

사용자 실제 사용 사진과 피드백을 기준으로 보완했다. 단순히 VSIX 기능이 연결됐다는 이유로 첫 사용 UX까지 수용 완료로 표현하지 않는다. Setup은 사용자 직접 검증 후 요청을 받은 뒤 만든다. Computer Use/visible 앱은 이번 작업에서 실행하지 않았다.

## 결정과 구현

- 시작 화면은 프로젝트 시작과 최근 프로젝트로 구성한다. 프로젝트 시작은 둥근 카드 없이 왼쪽 정렬·큰 제목·새/기존/최근 세 버튼. 최근 프로젝트는 하나의 컨테이너 안에서 얇은 구분선과 이름/경로로 표시한다. 실제 Code-OSS 최근 workspace/folder 목록에서 최대12개를 가져오며 파일 목록은 섞지 않고, 클릭해야 연다.
- 시작 화면에 Simulation 버튼이 남던 원인은 hidden 상태보다 우선하는 display 스타일이었다. 숨겨진 요소의 표시를 명시적으로 막고 시작 화면에는 실행/이력/도구/로그 카드를 표시하지 않는다.
- Code/Simulation은 작업 구역 진입, Explorer/Search/SCM은 Code 도구라는 구분을 activity bar 선과 간격으로 표현한다.
- Simulation 상단의 폴더 열기/파형 파일 열기를 제거했다. 다른 프로젝트는 프로젝트 메뉴에서 열고, 일반 파형 provider/API는 유지하되 홈의 주요 진입점으로 노출하지 않는다.
- 실행 옵션·중복 테스트/목록 관리는 홈에서 제거하고 Simulation 설정 팝업으로 통합한다. blur backdrop, 닫기/Esc/바깥 클릭, 배경 inert·키보드 focus 순환·닫은 뒤 focus 복구. 실행 수/태그, 소스/include/top 검토, 제외 복원, 도구 설정을 한곳에 둔다. 기존 네이티브 도구 설치 승인 대화상자는 유지한다.
- TB 파일 가져오기와 TB 폴더 설정은 테스트 목록 옆에 둔다. 자동 추적 폴더와 폴더 미설정 상태를 근처에 표시한다. 새로고침은 프로젝트/테스트 수 옆 아이콘 버튼과 tooltip/접근성 이름으로 제공한다.
- 사용자가 외부 원본 참조보다 **프로젝트로 복사**를 선택했다. native picker로 고른 외부 .v/.sv를 첫 지정 TB 폴더(없으면 tb/)로 복사하고 수동 등록한다. 원본/TOML 보존, wx 충돌 거절, 링크/프로젝트 경로/8MiB/검토 revision/신뢰·dirty·busy 보호. 복사 뒤 등록 실패 시 파일은 남겨 검토할 수 있으며 삭제·덮어쓰지 않는다. 프로젝트 내부 파일은 기존 등록을 사용한다. 외부 include/package 의존성을 자동으로 복사하지 않는다. 설정 팝업에서 추가 의존성을 조정해야 한다.
- 개발 창의 제목/빈 편집기 logo도 Pulse SVG로 연결한다. Windows 실행 파일 브랜딩은 기존 승인된 벡터를 유지한다. source에 이미 바뀐 제목 아이콘이 있어도 owned TS만 emit하면 out의 SVG는 그대로였으므로 owned compile에 자산 복사를 추가했다. baseline 또는 이미 승인된 Pulse bytes를 확인한 guarded overlay만 사용한다.

## 성능 범위

`Start-Pulse.cmd`는 준비된 개발 앱을 바로 실행하는 latest-launch.mjs를 사용한다. 매번 esbuild 번들 작성/큰 Electron 파일 해시/개발 환경 Python probe를 수행하지 않는다. build 준비에서 알려진 실행 파일을 검증한 뒤 six asset 경로/크기/수정 시각을 기록하고 실행 때 확인한다. 개발용 stamp이며 배포물의 SHA 검증을 대체하지 않는다. 준비된 파일이 달라지면 시작을 중단하고 build 후 prepare가 필요하다. 프로젝트 생성/창 열기는 원래 별개이며 신뢰 설정을 자동 변경하지 않는다.

준비 측정1390.4ms, prepared --check11.1ms. **실제 UI startup/생성 후 화면이 준비되는 시간은 미측정**이다. Windows Core 빈 프로젝트 생성3회는 `.dev/windows-integrated/pulse-ux-project-performance.json`에 기록한다. 첫 sandbox 측정은 realpath EPERM으로 실패하여 정상 Windows 권한의 전용 fixture로 재측정했다. source 개발 앱의 extension host cold start/전체 편집기 복원/Code-OSS 비용은 잔여이며 체감 성능 해결로 선언하지 않는다.

## 검증·인수인계

runtime/language build exit0, 전체 본체 타입/owned emission0 errors, TB catalog+실제 Home+복원 관련36 PASS/0 FAIL. 외부 TB 복사/두 top/원본과 TOML 보존/같은 이름 거절/stale 거절/시뮬레이터·분석 호출0, 최근12개/클릭 시 열기/설정 배경 inert, 기존 보관 소스/복원/취소 guards를 확인했다. 초기 실패3건은 설정 버튼의 옛 이름 기대였고 실제 정책을 새 통합 설정 이름에 맞췄다. refresh icon union 타입 오류1건도 보완했다. 잘못된 cwd의 emit 및 잘못 가정한 SVG 경로는 수정했으며 SVG가 이미 Pulse로 바뀐 이유를 prepare-branding.mjs로 확인했다. 근거 `ide/.dev/windows-integrated/pulse-ux-tests.log`, `pulse-ux-types.log`.

다음: 사용자 화면 승인 후 first entry/recent/Simulation popup·좁은 폭·focus/native picker/제한 모드/외부 TB 복사/UI responsiveness 한 세션 수용. 현재 사진의 Restricted Mode는 실행 잠금이며 신뢰 승인 없이 자동 해제하지 않는다. 일반 파형 API 삭제나 전체 기능 수용/새 Setup 완료로 판정하지 않는다. 최신 실행은 ide/Start-Pulse.cmd, 안내 ide/TRY_LATEST.md. 기존 Setup/ZIP은 이전 보완 버전 그대로다.
