> 후속 H5E1(2026-10-11): 등록 후 관리/적용 시 source 재탐색을 구현했다. [현재 진행/검증](ide-h5e1-project-management.md)을 참고한다. H5D3 성공 receipt는 같은 fixture의 h5d3-receipt.json/h5d3-exit.json/h5d3-host.log로 보존했다. 아래는 당시 기록이다.

# H5D3 — Windows source filename support and trusted GUI acceptance

2026-10-11. **파일명 제한 보완과 trusted 실제 IDE command/IPC/renderer 수용 완료. H5 및 베타 전체 완료 아님. 물리 클릭 UX 수용과 구분한다.**

## 구현과 경계

IDE 소유 `runtime/verilator/paths.ts`는 기존 디렉터리 junction을 유지하고, Windows 빌드 인자로 직접 전달할 수 없는 source basename을 공유 ASCII cache의 실행별 `build-*` 디렉터리에 복사한다. 파일마다 고유한 `source-N.sv/v` 경로를 사용하며 동일 source는 재사용한다. 원본은 수정하지 않는다. 기존 Core retained input snapshot이 준비되면 그 recorded 파일에서 복사한다. 이것은 미저장 editor snapshot 기능이 아니다.

복사 앞에 SystemVerilog `line` directive를 붙여 원래 입력 경로·행 번호와 `__FILE__`를 보존한다. UTF-8 BOM은 directive 뒤에 남기지 않는다. diagnostic 로그의 임시 source/junction 경로는 기존 입력 경로로 복원한다. junction 이름 prefix 충돌을 피하려고 긴 경로부터 복원한다. source package 순서와 configured include_dirs 순서를 바꾸거나 소스 상대 include 디렉터리를 임의로 추가하지 않는다.

성공·컴파일 실패·빌드 취소 모두 backend finally에서 복사와 junction을 정리한다. 하나의 정리 실패로 다른 정리가 중단되지 않게 처리하고 실패를 보고한다. 없는 경로의 반복 정리는 허용한다. 생성 중 일부 파일이 남더라도 cleanup 목록에 들어간다. 실행 산출물과 retained 원본은 계속 프로젝트 `.rtl/`에 두고 공유 cache는 프로젝트 밖이다. 시스템 PATH·도구 설치·원본 프로젝트·기존 앱 profile 변경 없음.

실제 검증 범위는 한글/공백/대괄호 source·header 이름, 한글/공백 root 및 include directory다. 임의의 모든 파일명·인코딩·다른 OS/Verilator 조합을 검증했다는 의미가 아니다. 기존 snapshot literal include/프로젝트 경계 제한과 ASCII tool cache 요구를 유지한다. `.rtl` 안 recorded source 경로가 `__FILE__`에 보이는 것은 기존 snapshot 실행 방식이다.

trusted GUI에서 추가 제품 결함을 발견했다. `rtl.toolsDirectory` 기본값인 빈 문자열이 `detectTools`에 그대로 들어가면 관리 도구 위치를 프로세스 cwd 기준으로 탐색하여 기존 Verilator를 놓쳤다. `detectTools`가 빈 값과 생략 값을 동일한 configured/default 공유 tool home으로 정규화하도록 수정했다. import semantic provider는 이미 같은 의미로 처리하고 있었다. 새 시험은 파일 probe fixture와 대체 version command를 이용해 빈/생략 설정의 도구 경로 및 cache 위치가 같음을 확인한다. 최종 실제 GUI는 기본 설정 그대로 기존 도구를 재사용했고 설치는 하지 않았다.

## 검증 근거

| 항목 | 결과/근거 |
|---|---|
| runtime/language build + 최종 전체 회귀 | **116 PASS / 0 FAIL / 0 SKIP**, `ide/.dev/h5d3-tests-final.log`, `.exit=0`. 최초115 PASS 로그도 보존 |
| 보강한 경로2시험 | **2 PASS**, 고유 source 복사/동일 이름 분리/BOM/원본 보존/junction·copy cleanup/복사 후 실패/반복 dispose. `ide/.dev/h5d3-paths-tests.log`, `.exit=0` |
| 실제 Verilator 5.050 | 성공1회 + 의도한 syntax failure1회 + g++ 시작 후 취소1회. 예상 상태 **passed/failed/cancelled**와 세 수용항목 모두 PASS, `ide/.dev/h5d3-real-final.log`, `.exit=0` |
| 실제 파일·파형 | `ide/.dev/h5d3-paths-한글 공백-qSBuaq/receipt.json`: retained snapshot/trace 로드, nonempty VCD, 헤더 값7 assertion, `__FILE__` 이름 보존, syntax error 원본 filename:4, cache 목록 전후 일치, 원본3파일 해시 일치·root 산출물 격리 |
| runtime deployment | import UI prepare에서 자체 runtime/language bundle 배치 성공. 화면 overlay 수정 없음; 전체 upstream 타입 검사는 이번에 반복하지 않음(H5D2 0 errors는 이전 근거) |
| 검증 스크립트 문법 | source-paths/import-ui/native import-trusted 문법 PASS |
| trusted GUI 등록 | 사용자 직접 신뢰 후 actual UI/IPC에서 top2 선택/실제 slang 확인/실행 TOML 등록/행2 표시 통과. `ide/.dev/import-ui-dbJf2o/registration-receipt.json`의 checks2는 PASS; 이어진 최초 Run은 기본 tool-home 결함 때문에 실패했으므로 이 receipt 전체를 PASS로 표현하지 않음 |
| trusted GUI 최종 | **5항목 PASS / exit0**, 같은 fixture의 h5d3-receipt.json/h5d3-exit.json(H5E1 실행 전에 보존), `ide/.dev/h5d3-import-final-3.log`, `.exit=0`. 등록된 프로젝트 복원/개별1+선택2+전체2 총5회 실제 Verilator PASS와 VCD·native sandbox rows/눈금 정렬·Code 왕복·이전 run 탭 유지/최신 별도 탭·원본2파일 bytes/root 격리. 앞서 등록된 프로젝트에서 재개한 수용 |

최초 실제 재현 스크립트에 잘못된 TOML key `timeout_seconds`/`[[tests]]`를 사용해 설정 검증에서 실패했다(`h5d3-real.log`, fixture aa69JA). 스크립트를 실제 schema의 timeout_ms/[[test]]로 수정했다. 최초 성공 fixture CGbYxl 및 final qSBuaq 결과를 따로 보존한다. 제품 schema 변경으로 오류를 우회하지 않았다.

GUI 실패도 보존했다. 최초 verify는 준비용 main process에 전달되어 launcher가 조기 종료했고, forwarded window는 초기화에 실패했다(initial-receipt/exit/host). 실행 파일·전용 profile·프로젝트가 모두 일치하는 owned main tree만 확인하고 정리했으며 다른 사용자 창/신뢰는 수정하지 않았다. 새 실행은 top 등록을 성공한 뒤 위 tool-home 결함을 드러냈다(registration-*). 이후 restore 시험은 animation-frame paint 이전에 rowCount를 검사해 실패했다(restore-race-*); 실제 행/컨트롤 갱신을 기다리도록 시험을 수정했다. 다음 실행의 개별/선택3회와 waveform 표시는 통과했으나 Extension API의 explicit undefined argument가 null로 직렬화되어 전체 실행 호출이 거절됐다(run-argument-*). 시험에서 전체 실행 버튼처럼 인자를 생략해 고쳤다. 제품 IPC의 잘못된 null 선택 거절을 완화하지 않았다. 마지막 재실행5회 전체 성공이며 이 fixture에는 이전 성공3회의 retained 결과도 함께 남는다.

## 다음 owner 실행 순서

1. 이번 source-path/trusted command 수용은 끝났다. 다음은 등록 후 test 추가/삭제·자동 source tracking과 Explorer/폴더 UX다. H5D2의 static literal source 목록과 ordinary TOML 보호를 유지한다. 이어 H6 자동 dump/미저장 simulation snapshot. clean Windows/실제 설치/FST/enum/규모/복원/물리 gate는 유지한다. 배포 없음.

2. 실제 새 실패나 제품 변경으로 재검증이 필요할 때만 등록된 전용 fixture를 다시 사용한다. **신뢰 설정을 복사하거나 override하지 않는다.**

   ```powershell
   # cwd: ide
   node scripts/verify-import-ui.mjs verify-registered .dev/import-ui-dbJf2o
   ```

   verifier는 일반 development extension activation을 사용한다. extensionTestsPath는 upstream 메모리 저장소 때문에 사용자 persisted trust를 읽지 못하므로 쓰지 않는다. 테스트는 시작 시 실제 vscode.workspace.isTrusted를 확인하며 false면 실패한다. 정상 등록·개별1/선택2/전체2 총5회 실제 run·VCD sandbox render/눈금 정렬·Code 왕복·이전 waveform run 보존·source bytes/격리를 계획했다. command API/실제 IPC/renderer 수용이며 물리 checkbox/버튼 조작과 구분한다. 최대360초(프로세스 감시, 모델 blocking wait 아님), 정리 대상은 이 실행의 child tree만이다.

   새 등록 경로를 다시 시험하려면 새로운 prepare fixture를 만들고 사용자 직접 trust 후 `verify`로 실행한다. 이미 등록된 fixture의 TOML이나 이전 결과를 삭제하지 않는다. `verify-registered`는 owned marker와 예상 테스트2개를 확인한 뒤 등록 없이 실행/파형을 수용한다. 외부 extension 지원을 제품에 추가한 것이 아니다.

3. 새 receipt/exit/실패 로그가 생기면 이 문서와 root 진행표를 갱신한다. trusted UI 수용의 완료로 물리 UX/전체 베타를 완료 처리하지 않는다.

개발 재현: `npm run verify:source-paths`. 설치 없이 기존 도구를 탐색하고 새 `.dev` fixture에서만 원본 테스트 코드를 작성한다. `npm run verify:import-ui -- prepare`는 새 창을 열며, `open`은 준비 fixture 재표시, `verify`는 사용자가 직접 신뢰하고 닫은 fixture만 사용한다. 구현/테스트/빌드 입력은 ide 안에만 있다.
