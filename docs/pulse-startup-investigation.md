> 2026-10-15 최신: [첫 조회 비용·Simulation UI 지연 구성·독립 로컬 built 실행본](pulse-performance-final.md)을 적용했다. 전체405 PASS/1 POSIX SKIP와 후속8 PASS·공식 bundle/파일/CLI를 확인했다. 기존 Setup은 이전 버전이며 최신 실행은 `ide/Start-Pulse.cmd`다. 실제 새 화면/Windows startup·부분 compiler 증분은 잔여다. 아래의 소스 개발 실행/모든 첫 조회 비용 미보완 설명은 이전 기록이다.

# Pulse 최근 목록·시작 지연 조사 (2026-10-14)

> 2026-10-15 후속: 빈 창을 별도의 경량 `RtlProjectStart`로 분리해 Ready에서 표시하고 SimulationHome 생성/IPC·editor restoration 대기를 피했다. navigation은 진입 중에만 숨기며 프로젝트 전환 전 native layout을 되돌린다. Pulse 종료 후 공간/파형 세션 복원을 중단하는 새 사용자 정책도 반영했다. compiler 모델/범위 인덱스 재사용의 실제200파일 Windows 비화면 측정은 [자동완성 성능 기록](pulse-completion-performance.md) 참조. 본체 전체 module graph의 static import와 개발 Code-OSS 초기화 지연은 남으며 새 화면 준비 시간은 아직 미측정이다. 이번 수정으로 전체 앱 startup이 빨라졌다고 판정하지 않는다.

최근 프로젝트 제목 아래 구분선, 행 전체 hover/focus-within 강조를 반영했다. 실제 앱을 열거나 Computer Use를 실행하지 않았다. 기존 사용자 개발 프로필 로그를 읽고 현재 열린 적 있는 프로젝트의 Core 읽기만 비화면으로 측정했다. 신뢰·프로필·원본은 변경하지 않는다.

## 확인된 근거

| 범위 | 관측 | 해석 |
|---|---|---|
| prepared launcher 검증 | 직전9.2ms | wrapper의 매번 번들/대형 해시 비용은 이미 분리했지만 실제 창 준비 시간은 아니다 |
| 사용자 D:/rtl-project Core loadProject | 14.9/5.0/4.6ms, 테스트0 | TOML 읽기/자동 source 검색은 이 작은 프로젝트에서 초 단위 지연이 아님 |
| 22:46:40.839 main log→22:46:51.534 최초 renderer log | 10.695초 | 본체/렌더러 초기화 구간 지연; 첫 화면 준비 시각으로 판정하지 않음 |
| 22:31:01.905 main→22:31:23.134 최초 renderer | 21.229초 | 실행 간 변동도 큰 동일 초기화 구간 |
| 프로젝트 전환 시 기존 host 종료22:47:14.817→다음 renderer22:47:25.914 | 약11.1초 | 본체 reload 구간이 큰 후보; 폴더 열기 요청 시작점 자체는 기존 로그에 없음 |
| 개발 CSS 준비 | 해당 실행286ms | 이 한 작업만으로10초 이상을 설명할 수 없음 |
| built-in activation | 첫 renderer 뒤 Git/Emmet/GitHub auth 등, RTL activation 기록 없음 | 이 실행의 긴 선행 구간을 slang 시작 비용이라고 판정할 근거 없음 |

프로젝트 읽기는 TOML bytes와 루트 목록을 전후 대조해 무변경을 확인했다. `.dev/windows-integrated/pulse-startup-project-read.json`에 측정값을 보관했다. 전체 GUI inspect/잔여 history 비교/슬랭 작업 시간을 이 값으로 대신하지 않는다.

현재 사용자는 최적화된 최신 제품 번들 대신 `VSCODE_DEV=1`의 개발 Code-OSS를 실행한다. 로그의 node compile cache는 status:development로 비활성화다. upstream/out에는9869개의 JS 파일이 있으나 모두 실제 로드됐다고 판단하지 않는다. 다수 ESM 자산·본체 초기화·cold I/O·보안 프로그램 검사 등이 후보다. **개별 원인/CPU/I/O 비중은 아직 확정하지 않았다.** 개발 실행이 지배적인 원인 후보이며, 프로젝트 source 검색을 무작정 단순화하거나 linter/신뢰 기능을 비활성화하지 않는다.

## 다음 계측과 실행 순서

RTL contribution 생성 시점, 실제 editor restoration 완료/RTL UI mount, 프로젝트 inspect 시작과 완료를 `[Pulse timing]`으로 renderer 로그에 남긴다. 파일 경로나 소스 내용은 추가 로그에 기록하지 않는다. 다음 사용자 실행 로그에서 initial module load→workbench restoration→project IPC를 구분할 수 있다. 이 계측은 아직 실제 새 앱에서 읽지 않았다.

다음은 사용자가 새로 실행한 로그의 phase 비교 및 승인된 한 화면 세션에서 첫 사용 가능 시각 확인, 이후 최신 소스의 최적화된 Code-OSS 본체 번들 준비(Setup 생성과 별도)를 검토한다. 오래된 Setup/ZIP은 빠르더라도 새 소스 성능 수용으로 재사용하지 않는다. 사용자 PC의 Defender/보안/신뢰 설정은 바꾸지 않는다.

관련 Home/복원26 PASS/0 FAIL·본체 전체 타입/owned emission0 errors. 근거 `pulse-startup-tests.log`, `pulse-startup-types.log`. 화면/실제 체감 개선은 미확인이다. 최근 UI·계측의 최신 개발 실행 정보는 latest-launch prepare로 갱신하며 `ide/Start-Pulse.cmd`로 확인한다. Setup 미변경.
