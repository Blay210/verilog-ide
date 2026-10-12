# H2I — Activity Bar 배치 변경과 공간 전환

2026-10-09. H2H의 남은 배치 검증을 이어간다. 독립 IDE 자체 코드만 변경하며 VSIX/배포 패키지를 만들지 않는다.

## 구현

기존 Code/Simulation navigation은 Activity Bar 내부에만 있어 숨김 또는 위/아래 배치에서 접근이 사라질 수 있었다. 기본 visible 배치에서는 기존 rail을 유지하고, 다른 배치 또는 hidden에서는 같은 버튼을 중앙 editor 오른쪽 위의 작은 floating navigation으로 이동한다. 사용자 설정을 강제로 변경하지 않는다. 임시 floating UI의 가독성·겹침은 실제 작은 viewport에서 별도 수용해야 하며 최종 디자인 확정이 아니다.

Simulation에서 editor content는 숨기고 inert 처리하지만 navigation은 제외한다. `.content`의 96px 여백은 기본 rail에만 적용해 floating navigation이 Code 편집 영역을 밀지 않도록 한다. 설정 변경/part visibility 이벤트로 navigation 위치를 동기화하며 기존 소스/탭 모델과 공통 하단 panel은 유지한다.

내부 `rtlIde.spaceState`는 보조 sidebar 표시 상태와 navigation 배치 및 실제 renderer hit target의 접근 가능 여부를 보고한다. 이는 시험 진단용이며 공개 자동화 API 계약이 아니다.

## 검증

- 자동 시험28 PASS/0 FAIL/0 SKIP (`ide/.dev/h2i-tests.log`).
- 본체 전체 빌드0 errors/exit0, 8.23분 (`ide/.dev/h2i-build.log`, `h2i-build-exit.txt`). 빌드 시작 후 CSS 범위를 추가 보완했으므로 이 결과만으로 최종 소스를 수용하지 않았다.
- 최종 owned source를 guarded overlay로 배치하고 pinned upstream의 `createCompile`/gulp emission으로 변경 파일을 재생성, `spawnTsgo`로 전체 프로젝트 타입 검사0 errors/exit0 (`ide/.dev/h2i-final-build.log`, `h2i-final-build-exit.txt`). private 재현 entry는 `ide/.dev/h2i-incremental.mts`; 제품 개발 빌드 명령은 기존 `npm run compile:core`를 유지한다. 출력 JS를 수동 수정하지 않았다.
- native 시험에 hidden/top/bottom/default × Code→Simulation→Code 경로를 추가했다. 실제 renderer 버튼 면적/중앙 hit target·inert 상태·미저장 text/원본 disk 보존을 확인하며 private profile의 layout 설정은 finally에서 원복한다. 실제 mouse click 수용으로 표현하지 않는다.
- 보조 sidebar hidden/visible 각각에서 Simulation으로 숨김→Code 원래 표시 상태 복원을 추가했다. view 내용/폭/scroll 복원 검증을 대체하지 않는다.
- 최초 native `x6yrg1`은 새 source 진입 뒤 `type` 입력이 반영되지 않아5초 대기 FAIL/exit1. 배치 변경 시험 전의 실패이며 원인 미확정이다. 로그/receipt를 보존하고 다음 실패부터 active 문서/text/selection을 receipt에 기록하도록 시험 진단을 추가했다. 지연을 추가하거나 실패 assertion을 제거하지 않았다.
- 이후 동일 제품 코드 native `gR12TZ`, `1DXgJL` 각각20항목 PASS/exit0, 언어 감지 오류/API attribution warning 없음. 네 가지 배치의 버튼 면적/실제 중앙 hit target·non-inert와 source/disk 보존, 보조 sidebar 표시 상태 복원 및 기존15항목을 수용했다. 근거는 두 fixture의 `receipt.json`/`exit.json`, `.dev/h2i-native-retry.log`, `h2i-native-repeat.log`다. 최초 입력 실패가 해결됐다는 근거는 아니며 간헐 focus 추적을 남긴다.

## 남은 작업

다음은 최초 source 입력 실패의 timing/focus 추적과 작은 viewport/물리 버튼 클릭, 보조 sidebar view/폭/scroll 상태의 잔여 수용을 묶어 지원 범위를 판정하는 것이다. 이후 H3 언어/Core/toolchain 기능을 `ide/` 소유 코드로 이식한다. H1 간헐 host 지연·audit 영향과 깨끗한 Windows gate, H7 종료/재실행 복원은 계속 열려 있다. H2 전체/베타 완료가 아니다. H2H의 미저장 private 파일/기존 개발 창은 변경하지 않았다.
