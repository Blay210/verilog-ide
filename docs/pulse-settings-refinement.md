# Pulse 설정·최근 목록 정리 (2026-10-14)

사용자 실제 화면 피드백을 반영했다. 화면과 Setup은 이번 작업에서 실행하지 않았다. latest launcher를 갱신한 개발 빌드가 대상이며 기존 Setup/ZIP은 그대로다.

- 시작의 최근 프로젝트 버튼을 제거했다. 아래 실제 최근 목록만 사용한다. 각 항목 우측 X는 native removeRecentlyOpened로 해당 항목만 제거하며 파일/프로젝트/실행 이력은 지우지 않는다. 확인 대화상자를 띄우지 않고 목록을 갱신한다.
- 소스·include·top 설정 토글 버튼을 제거했다. Simulation 설정을 열면 기존 프로젝트 검토를 읽어 설정 항목을 바로 표시한다. 헤더 검색 폴더는 include 파일을 찾는 경로, 폴더/파일 종류는 RTL/TB/제외 분류, 실행 모듈은 테스트별 시뮬레이션 시작점이라고 설명한다. 폴더와 모듈 항목은 접힌 details 대신 펼친 section으로 구성한다. 변경은 기존 명시적 적용/의미 분석·보호 흐름을 사용한다.
- 도구 설정은 제목/설명/현재 시뮬레이터와 configured shared storage 위치/설정 버튼으로 구성한다. 저장 위치를 실행 파일 검증 완료 상태처럼 표현하지 않는다. 설치 승인은 기존 별도 흐름을 유지한다.
- 제외된 테스트벤치 목록에는 top/file, 개별 복원 아이콘, 모두 복원을 제공한다. 목록은200개까지 표시하며 모두 복원은 전체 제외 설정을 한번의 saveTestCatalog로 갱신한다. busy/dirty/trust/revision/root 보호 유지, 실제 실행과 파일 삭제 없음. 적용 전 소스 변경이 있으면 복원을 거절하고 먼저 적용하거나 창을 닫고 다시 열도록 안내한다. 변경 없는 검토 draft는 복원 직전에 refresh로 취소한다.
- refresh/닫기/복원/최근 X는 테두리 없는 아이콘과 hover/focus/접근성 이름을 사용한다. 일반 버튼은 채운 secondary 배경/hover, 주요 실행은 primary 배경으로 구분한다. 콤보/입력은 테마 input 색상과 패딩으로 통일한다. popup blur/focus trap/배경 inert 유지.

검증: runtime build0, 전체 본체 타입/owned emission0 errors, 관련38 PASS/0 FAIL/exit0(`ide/.dev/windows-integrated/pulse-settings-tests.log`, `pulse-settings-types.log`). 최근 제거의 확인/파일 열기0, 일괄 제외 복원·원래 preferences/TOML/도구 호출0·stale 거절, 기존 TB import/복원/provider guards를 확인했다. 초기 타입 오류는 삭제한 section의 unused 변수와 async 분기의 반환을 수정했다. root 상대 실행 경로 착오도 ide에서 다시 실행하여 복구했으며 보호를 제거하지 않았다.

물리 새 설정 레이아웃/좁은 창/키보드/native 최근 제거 화면·실제 popup 상호작용은 미검증이다. 사용자가 새 Computer Use 세션을 승인하거나 직접 확인하면 수용한다. 최신 실행은 ide/Start-Pulse.cmd 더블클릭. 이전 화면 수용을 새 UI 전체 수용으로 재사용하지 않는다.
