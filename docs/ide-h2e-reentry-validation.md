# H2E 동일 소스 재진입·보조 사이드바·Untitled 수용

2026-10-09. H2의 동일 활성 source 재진입 누락을 보완하고 보조 사이드바/새 빈 문서 경로를 실제 앱으로 검증했다. H2 전체/독립 IDE RTL 실행/베타 완료가 아니다.

## 보완

Simulation 홈에서 이미 active인 동일 파일을 다시 열면 active-editor-change가 발생하지 않아 홈이 유지됐다. 수정 전 fixture `editor-acceptance-aI5xpl`는 동일 source 재열기 assertion FAIL/exit1. `.dev/h2e-before-native.log`, receipt/host/exit에 실패를 보존한다.

`ide/src/rtlSpaces.contribution.ts`에 main editor의 onWillOpenEditor 처리를 추가해 동일 input의 열기 요청도 Code로 복귀시킨다. 기존 active editor change 처리는 유지한다. common panel Output은 main editor의 열기와 구분되며 Simulation 내 Output append가 공간을 바꾸지 않는 기존 시험도 유지했다. owned source overlay previousSha256을 직전 target digest로 갱신하고 자체 본체를 재빌드했다.

## 검증

- 본체 compile-core0 errors/exit0·3.72분, `.dev/h2e-build.log`/exit.
- 독립 IDE 자동27 PASS/0 FAIL/0 SKIP, native test 문법 검사 exit0.
- 첫 수정 후 시험 `editor-acceptance-xXiWXX`는 같은 source 재진입·보조 sidebar 두 회 방문까지 PASS였으나 Untitled text 비교에서 FAIL/exit1. LF fixture와 달리 Windows Untitled의 CRLF 기본값을 고려하지 않았던 비교를 시험에서 정규화했다. 제품의 줄바꿈 설정은 바꾸지 않았다. `.dev/h2e-final-native.log`와 receipt/host/exit를 보존한다.
- 최종 `editor-acceptance-42e2Yu`: receipt passed=true/15항목·앱/검증 exit0, 언어감지 오류/API attribution 경고 없음. `.dev/h2e-final2-native.log`, exit와 fixture receipt/host/launch/exit.
- 동일 active source를 Simulation에서 다시 열기→Code 복귀 PASS.
- 보조 sidebar 열기 명령→Code 복귀를 두 번 연속 확인, 기존 dirty text/disk 원본 보존 PASS. **보조 sidebar의 폭·내부 view/scroll 및 visibility 세부 복원**까지 검증했다는 뜻은 아니다.
- 새 Untitled 명령으로 Code 복귀→type 명령 입력→TextDocument exact 내용(줄바꿈 정규화) 확인 PASS. private Untitled만 명시적으로 revert했다.
- 기존 두 group/세 tab·선택/viewport415·dirty/disk3회 왕복, Explorer 복귀/panel toggle·새 source type focus, 실제 Output 기존/추가 내용 보존까지 함께 회귀 PASS.

이 시험은 실제 native 앱의 API/명령 수용이며 물리 키보드/마우스 입력과 구분한다. 기존 일반 개발 창을 재시작하거나 입력하지 않았다. untrusted fixture의 실제 Terminal PID는 미수행으로 기록하고 신뢰 설정은 변경하지 않았다. 전체 앱 시작 성능/간헐 지연 해결을 주장하지 않는다.

## 다음 실행 순서

1. 현재 빌드의 private 일반 앱에서 실제 Explorer/Search/SCM/소스 진입·focus, 작은 viewport 및 Activity Bar 위치/숨김을 확인한다. 보조 sidebar의 세부 복원도 남아 있다.
2. 공통 Output 내용은 H2D/E 시험에서 PASS이며 실제 Terminal 프로세스 유지 gate는 별도 미완료다. 기본 보안 정책을 바꾸지 않고 검사 가능한 격리 환경을 검토한다.
3. start의 --disable-extensions 안내/정책과 H3 built-in 편집 준비를 정리한다. 이번 실행 정책 변경 없음.
4. H2 잔여 수용 후 H3의 편집/Core/toolchain/실행/파형 자체 이식, H4 홈 테스트/결과/이력 연결 순서다.

H1 간헐 host 지연·배포 전 audit 영향·깨끗한 Windows gate 유지. root/vsix 구현 참조·vsix 수정·release VSIX/installer/배포·독립 엔진 착수 없음.

