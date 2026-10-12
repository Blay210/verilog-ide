# H3L — 격리된 의미 분석 GUI 검증 준비 (2026-10-10)

> 2026-10-11 업데이트: 사용자 직접 trust 후 실제 편집기 의미 분석 7항목 PASS/exit0. 검증기의 test-mode 메모리 저장소 문제를 일반 개발 host 방식으로 보완했다. 현재 결과/남은 범위는 [H3M 수용 기록](ide-h3m-trusted-semantic-acceptance.md)이 우선이며 아래 대기 상태는 당시 기록이다.

신뢰된 화면 검증은 **준비 완료·실행 대기**다. 사용자는 직접 신뢰 처리를 현재 하기 어렵다고 답했다. 신뢰를 자동 변경하지 않으며 GUI 의미 분석 PASS/H3 전체 완료로 표시하지 않는다.

## 확인된 결과

별도 프로필의 실제 앱 **w8eGoW 7항목 PASS/exit0**: 비신뢰 semantic 및 도구 설정 차단, 네 RTL 확장자, module Tab 필드, procedural/begin/case/package·기존 end 재사용, 기본 completion·주석/string 제외, Simulation 도구 설정 버튼. `ide/.dev/h3l-untrusted.log/.exit`, `editor-acceptance-w8eGoW/receipt.json/exit.json`. attribution/language detection 오류 없음. 기존91개 자동 검증은 H3K 근거이며 이번에 전부 재실행하지 않았다.

새 두 script Node syntax 검사·내장 언어/runtime bundle 생성 성공. trusted acceptance는 미실행. 제품 기능 변경·실제 설치·배포 없음.

## 재개 방법

`ide/scripts/verify-semantic-ui.mjs prepare`는 자체 `.dev/semantic-ui-*` 프로젝트와 독립 profile/shared/extensions 위치로 일반 창을 연다. `verify <fixture>`는 IDE 내부의 자체 marker fixture만 받으며 test extension을 해당 fixture에만 연결한다. 기존 사용자 세션·profile·신뢰 설정을 복사/공유하지 않는다. 새 실행은 receipt를 running으로 초기화한다.

`ide/tests/native/semantic.cjs`는 사람이 부여한 신뢰가 있을 때만 built-in LanguageClient→실제 slang, module/scope/남은 named port completion, 함수 인자, 미저장 오류·복구·디스크 불변, Code/Simulation 왕복·TOML 진단 제외를 검사한다. 도구 설치는 하지 않는다. 실제 editor API 검증이며 물리 입력 수용 전체를 대체하지 않는다.

현재 fixture는 `D:/Dev/verilog_ide/ide/.dev/semantic-ui-te972r`, 창 제목은 **의미 분석 프로젝트 - RTL IDE (Development) Dev**. 사용자가 가능할 때 직접 신뢰하고 **이 검증 창만 닫은 뒤** ide 폴더에서 실행한다. 기존 h3b-preview 창은 보존한다.

```powershell
node scripts/verify-semantic-ui.mjs verify .dev/semantic-ui-te972r
```

새 fixture는 `node scripts/verify-semantic-ui.mjs prepare`로 준비하며 신뢰는 다시 사람이 처리한다. 다음 담당자는 창 상태를 재관찰한다.

2026-10-11 재개: 사용자가 당시 외부에 있어 처리하지 못했다고 답했다. 이전 격리 검증 창이 닫혀 있음을 재관찰한 뒤 `node scripts/verify-semantic-ui.mjs open .dev/semantic-ui-te972r`로 같은 자체 환경을 다시 열었다. open은 test 주입 없이 일반 창만 열며 신뢰 설정을 변경하지 않는다. 사용자 직접 trust·해당 창 닫기 확인 후 verify를 수행한다.

## 자동 승인 거절과 대안

기존 h3b-simulation trusted profile에 새 일반 창을 요청했으나 자동 승인 검토가 **동일 user-data/shared 디렉터리의 사용자 세션 변경·충돌 위험**으로 거절했다. 재시도/우회 실행하지 않았다. 새 자체 fixture/profile 대안은 승인되어 실행됐다. 기존 trusted 창2623398은 예전 Simulation 빌드였고 보존했다. 다른 세 창은 Restricted Mode였다.

화면 관찰은 [computer-use SKILL.md](C:/Users/nanoi/.codex/plugins/cache/openai-bundled/computer-use/26.1007.21434/skills/computer-use/SKILL.md)를 따랐다. 연결된 guidance의 “Do not change Windows security settings, Windows privacy settings, or any in-app security or privacy settings.”와 AGENTS의 신뢰 보존 원칙 때문에 직접 처리를 요청했다. 사용자 답변은 현재 처리 어려움이며 설치 승인과 별개다.

## 다음 실행 순서

사용자 trust 가능시 위 GUI검증·실패 보완. 기다리는 동안 독립적인 **H5A 읽기 전용 프로젝트 탐색·분류 Core 기반**을 진행할 수 있다. 최초 탐색은 파일/폴더/TOML 변경 없이 검토 결과를 제공하며 폴더 역할·파일 override·여러 top을 이후 UI/설정에 연결한다. 후보 추정은 compiler-confirmed top과 구분한다.

이후 H5→H6 자동 dump/미저장 simulation→H7 복원·규모·베타 수용. trusted GUI/설치/clean Windows, FST/enum/package 순서 simulation 연결/history 정리·layout/host/audit gate는 열린 항목이다.
