# H1 개발 앱 아이콘·실행 사본 검증

2026-10-09. 독립 ide 내부만 변경했다. VSIX/배포/installer/정식 브랜드 확정 작업이 아니다.

## 구현

`ide/scripts/icon.mjs`에 원본 임시 칩/파형 도형을 작성했다. 같은 geometry로 SVG와 Windows 16/32/48/64/256px, 32bit alpha ICO를 생성한다. 다른 프로젝트의 로고를 사용하지 않는다. 프로젝트 자체 코드와 고정 upstream의 기존 MIT rcedit1.1.0으로 생성하며 새 도구 설치는 없다.

launcher는 공식 원본을 그대로 두고 같은 runtime 폴더의 UUID staging 사본에 아이콘/제품 metadata를 적용한다. fingerprint별 `RTL IDE Dev-<hash>.exe`와 SHA256 receipt로 보관한다. 기존 `RTL IDE.exe`/`Code - OSS.exe`나 실행 중 창을 덮어쓰거나 이름 변경하지 않는다. 원본/아이콘/metadata가 달라지면 새 사본을 만든다. 캐시가 있어도 pinned Electron 버전과 사본 SHA256/경로를 검사한다. 이전 target 존재 시 버전 검사를 건너뛰던 경로를 보완했다. 실패하면 검증한 staging만 정리하고 원본을 보존한다.

일반 dev wrapper는 생성 경로를 고정 환경 변수로 code.bat에 전달하며 기존 preLaunch 경로를 유지한다. native 편집/CLI 검증도 같은 launcher 반환 값을 사용한다. 제품 source 본체는 바뀌지 않아 새 본체 compile은 불필요하며 이전0 errors/exit0(5.72분)의 compiled 결과를 사용한다. icon/metadata 생성물은 ignored ide/upstream/.build/electron 내부이며 사용자 RTL 프로젝트에는 생성하지 않는다.

첫 실제 probe에서 상대 source 경로의 createRequire 오류가 발생했다. launcher 진입에서 절대 경로로 정규화한 뒤 실제 resource 편집과 native 실행을 통과했다. 초기 실패를 성공 근거에 포함하지 않는다.

## 실제 근거

- 최종 자동24 PASS/0 FAIL/0 SKIP. 멀티 해상도 ICO의 bounds/alpha, cache 버전/무결성, 원본 보존, resource 편집 실패 시 staging 정리, Windows batch의 각 격리 flag 누락 차단/upstream 진입 보존을 검사한다. source multi-patch 반복 적용도 유지한다.
- 실제 exe: `ide/upstream/.build/electron/RTL IDE Dev-ff1bb57953d1a55f.exe`. Windows FileVersionInfo: ProductName `RTL IDE`, FileDescription `RTL IDE (Development)`, CompanyName `RTL IDE contributors`, InternalName `rtl-ide`. FileVersion/ProductVersion `1.141.0`는 고정 host 버전을 유지한다. `.dev/h1-branding-version-info.json`.
- Windows가 해당 exe에서 추출한 실제 아이콘을 PNG로 저장하고 눈으로 확인했다: `.dev/h1-branding-extracted-icon.png`. 이는 실행 파일 resource 검증이며 실제 작업 표시줄/모든 workbench 화면 아이콘 수용은 아니다.
- 새 exe의 native 편집/저장·.sv/JSON 감지7항목: 아래3회 모두 PASS/앱 exit0. Agents/기본 inspector/자동 profiling/10초 경고/언어 감지 오류/무응답 없음. 반복 wrapper exit0, editorPassed/startupPassed=true.

| fixture | 전체 소요 |
|---|---|
| editor-acceptance-EEwIS8 | 23842ms |
| editor-acceptance-088xsY | 22986ms |
| editor-acceptance-eK57EI | 22593ms |

`.dev/h1-branding-native.log`/`-exit.txt`, `.dev/h1-branding-repeat-receipt.json`, 각 fixture의 receipt/host.log/exit.json을 보존한다. 준비/브랜딩 캐시 검사~API~종료 전체 시간이며 순수 시작 성능 수치가 아니다. 같은 PC/cache의 새 프로필 검증이다.

실제 CLI `cli-policy-RDnIUl`: 설치 요청 정책 거부 exit1·installed=false·receipt PASS, 검증 wrapper exit0. `.dev/h1-branding-cli.log`/`-exit.txt`. 사용자 확장을 설치한 것이 아니다.

## 일반 launcher probe의 실패와 보완

code.bat에 `--version`만 주는 probe는 버전 출력 대신 실제 일반 앱을 열었다. 격리 profile/shared/extensions 인자를 누락하여 홈의 `AppData/Roaming/code-oss-dev`, `.rtl-ide-shared`, `.rtl-ide-dev/extensions` 경로를 사용했고 shared database 생성 로그가 있다. 이 결과는 성공/격리 근거가 아니다. 실행 파일8596/부모 cmd26028의 정확한 path와 probe command를 검증한 뒤 이번 process tree만 taskkill로 종료했다. 기존 사용자 창/파일은 종료·삭제하지 않았다. 생성된 홈 파일도 임의로 삭제하지 않는다. `.dev/h1-branding-batch-version.log`/`-exit.txt`를 보존하며 wrapper exit0가 찍혀도 강제 종료한 probe의 합격 근거로 사용하지 않는다.

재발 방지를 위해 `verify:launcher`는 정상 preLaunch/code.bat 경로에 private workspace/profile/shared/extensions와 native 시험 종료 경로를 모두 전달한다. native와 batch 진입을 같은 editor 수용으로 검사하고 fixture launch.json에 실제 executable/격리 인자를 보존한다. 직접 code.bat probe 대신 이 명령 또는 세 격리 경로를 항상 전달하는 dev.mjs start를 사용한다.

최종 batch fixture `editor-acceptance-9ReOKs`: 편집/저장·감지7항목 PASS, 앱/검증 wrapper exit0, 감지 오류 없음. launch.json의 transport=batch/새 exe/한글·공백 workspace와 세 private data 경로를 확인했다. `.dev/h1-branding-batch-acceptance.log`/`-exit.txt`, fixture receipt/host.log/exit.json을 보존한다. preLaunch를 건너뛰는 환경 변수를 제거했으며 정상 준비 후 자동 종료했다. 실제 일반 launcher의 격리 인자 처리를 통과했지만 test mode의 in-memory shared storage와 일반 persistent storage의 수용은 구분한다.

이후 code.bat의 RTL override 진입에 세 격리 flag 필수 guard를 preLaunch 이전에 추가했다. 실제 같은 `--version` probe 재시도는 명확한 정책 메시지/exit1로 앱을 띄우기 전에 차단했다(`.dev/h1-branding-batch-guard.log`/`-exit.txt`). 최종 guard 적용 후 batch fixture `editor-acceptance-JzpJPH`에서도7항목 PASS·앱/검증 exit0를 확인했다(`.dev/h1-branding-batch-final.log`/`-exit.txt`, fixture launch/receipt/host/exit). guard는 필수 flag 존재를 검사하며 세 경로의 ide 내부 생성/검증은 dev wrapper가 담당한다. 임의 사용자 제공 경로의 실경로 검증 전체를 batch가 수행한다고 주장하지 않는다.

## 시작 지연 분석과 남은 범위

이전 실패 fixture 2vus4D의 renderer log에서16:48:38.264→47.319(약9.1초) 무응답/복구를 확인했다. 같은 시점 JSON language 기능/extension-editing/npm activation이 겹치며 Git/GitHub/Emmet eager activation도 존재한다. 로그만으로 어느 extension이 원인인지 확정할 수 없다. native test 파일이 test-extension 밖에 있어 API attribution 경고가 나는 검증 fixture 문제도 확인했다. 다음은 이 fixture 위치를 바로잡고 단계별 시간을 기록해 일반 개발 host/JSON activation 지연을 구분하는 것이다. 타임아웃을 늘리거나 경고를 숨기지 않았다. 이번3회 PASS가 이전 간헐 지연을 해결한 증거는 아니다.

정식 icon/installer/signing/file association, 모든 UI brand/help/settings/remote/Chat 잔여 surface 수용은 미완료다. H1 전체/H2/RTL 이식/내부 베타 완료로 판정하지 않는다. 다음 H1 잔여 판정 이후 H2 Code/Simulation 공간으로 진행한다. VSIX/독립 엔진/배포 패키징은 변경하지 않았다.
