# H2D 소스 진입·입력 포커스와 Output 내용 보존

> 후속 최신: 동일 active source 재진입 보완·보조 sidebar/Untitled 수용은 [H2E 기록](ide-h2e-reentry-validation.md)을 따른다. 아래는 당시 결과다.

2026-10-09. 독립 IDE 공간 전환의 새 source 진입 결함을 재현·수정하고 Output **실제 텍스트** 보존을 검증했다. H2 전체/RTL 실행 이식/베타 완료는 아니다.

## 구현과 실제 근거

Simulation 홈에서 새 파일을 열면 active editor는 바뀌지만 Simulation 화면이 유지되어 새 소스가 뒤에 숨겨졌다. 수정 전 `editor-acceptance-1BvAte`는 기존10항목 후 ‘Opening a source must leave Simulation’ assertion FAIL/exit1. receipt/host/exit 및 `.dev/h2d-before-native.log`를 보존한다.

`ide/src/rtlSpaces.contribution.ts`가 main editor의 active-editor-change를 관찰해 Simulation에서 새 editor가 활성화되면 Code로 복귀하도록 보완했다. common panel의 Output model은 main editor와 분리되어 해당 이벤트로 공간을 바꾸지 않는다. 변경 전 owned target SHA256을 `config/source-overlay.json`에 갱신해 guarded 배치했고 ide 본체를 재빌드했다. root/vsix 코드 참조 없음.

- 본체 compile-core0 errors/exit0·2.2분: `.dev/h2d-build.log`와 exit.
- 독립 IDE 자동27 PASS/0 FAIL/0 SKIP, native test 문법 검사 exit0.
- 최종 실제 앱 `editor-acceptance-SF5i6k` receipt passed=true/12항목·앱/검증 exit0: `.dev/h2d-final-native.log`, fixture receipt/launch/host/exit.
- 새 source를 Simulation에서 열기→Code active→type 명령으로 새 문서에 입력→dirty와 disk 원본 보존 PASS. 기존 미저장 source도 유지된다. 이것은 실제 editor 명령/API 시험이며 물리 키보드 수용은 아니다.
- Output 채널의 실제 `output:` TextDocument에서 기존 줄을 확인하고, Simulation에서 줄을 추가한 후 model 내용이 반영되는지 bounded 대기했다. Simulation 공간 유지와 Code 복귀 후 두 줄 모두 존재 PASS. 단순 append 호출 성공이나 panel visible로 내용 보존을 추정하지 않았다.
- 기존 한글/공백 workspace·파일 저장/재열기·언어 감지, 두 group/세 tab·선택/viewport415·dirty/disk3회 왕복, Explorer visible 복귀와 panel toggle10항목도 함께 PASS. 감지 오류/extension API attribution 경고 없음.

시험의 private 새 문서/기존 source draft만 종료 전에 명시적으로 revert했다. 사용자 파일을 자동 저장하지 않았다. Terminal은 untrusted workspace여서 processId 검사를 미수행으로 기록했고 신뢰 설정을 변경하지 않았다. 이전 일반 개발 창은 이번 빌드로 재시작하거나 물리 입력하지 않았다.

## 다음 작업 / 제한

1. Explorer/Search/SCM 물리 진입·새 source 물리 focus, auxiliary sidebar와 작은 viewport/Activity Bar 위치·숨김 수용. 이미 active인 같은 파일을 다시 열기, Ctrl+N 등 editor 이벤트 변형도 검사한다. 이번 수정은 active editor가 바뀌는 경우를 실제 확인한 것이다.
2. 공통 Output **내용** gate는 이번 지원 시험에서 통과했다. trusted Terminal PID·프로세스 유지는 여전히 별도 미완료다.
3. 일반 start의 --disable-extensions 안내/정책과 H3 built-in 편집 준비를 정리한다. 정책은 이번에 변경하지 않았다.
4. H2 잔여 수용 뒤 H3 편집/Core/toolchain/실행/파형 이식, H4 Simulation 홈·테스트·결과·이력 연결. 현재 홈의 시뮬레이션 실행은 아직 없다.

H1 간헐 host 지연·배포 전 audit 검토·깨끗한 Windows gate는 유지한다. VSIX/installer/배포물 생성·vsix 수정·독립 엔진 착수 없음.
