# H1 언어 감지 정책·저장 후 오류 보완

2026-10-09. 독립 IDE만 변경하며 VSIX 이식/배포 작업은 아니다.

## 발견과 원인

이전 physical 입력/저장 검증 자체는 성공했다. 그러나 전체 `.dev/h1-physical-editor-launch.log`를 다시 읽어 저장 후 07:30:08 UTC의 `ReferenceError: require is not defined`와 `vscode-regexp-languagedetection/dist/index.js`의 `ERR_FILE_NOT_FOUND`를 확인했다. 고정 upstream에는 후자의 dependency가 없고 전자의 content model은 개발 worker에서 로딩되지 않았다. 저장 성공과 앱 로그 무오류를 같은 완료 기준으로 볼 수 없다. 이전 native 반복은 이 감지 명령을 명시적으로 실행하지 않았으며 일반 exception 정규식도 이 오류를 잡지 못했다.

## 제품 정책

RTL IDE는 등록된 파일 확장자/사용자 언어 선택을 사용한다. 범용 content-model 언어 추측과 감지를 위한 workspace history 조회를 실행하지 않는다. 파일명에 해당하는 언어가 없으면 undefined를 반환하며 현재 모드를 강제로 변경하지 않는다. Code-OSS 제품의 기존 추측 경로는 보존한다. worker client의 파일명 quick guess 뒤에서 차단하고 service 진입에서도 history 조회를 우회하므로 자동/명시적 호출 모두 같은 정책이다.

이는 ML loader를 고친 것이 아니라 RTL 제품에서 해당 기능을 사용하지 않는 경계 설정이다. H1의 `.sv`는 아직 Plain Text이며 H3에서 RTL 언어 association/문법 강조/편집 기능을 이식해야 한다. 언어 메뉴에서 명시적으로 모드를 선택할 수 있다. content detection 명령은 미등록 파일에 감지 불가 안내를 낼 수 있다. 진단/컴파일 기능이 추가된 것은 아니다.

## 검증

- 정책 자동 테스트: 21 PASS, 0 FAIL, 0 SKIP. RTL history/worker 차단과 upstream 보존을 검사한다.
- `verify:editor`에 실제 `editor.detectLanguage` 호출을 추가했다. 미등록 `.sv`의 Plain Text 유지와 알려진 JSON association 보존을 검사한다.
- native wrapper와 반복 시작 gate는 발견한 두 로그 오류를 명시적으로 실패 처리한다. 테스트 receipt 성공만으로 통과시키지 않는다.
- 본체 `compile:core`: 0 errors, exit0, 5.72분. `.dev/h1-language-detection-build.log`/`-exit.txt`.
- 실제 compiled 언어 정책 6 PASS, host 정책8 PASS, 설치 차단5 PASS. 언어 정책은 `verify:language-policy`로 재현하고 `.dev/h1-language-policy-compiled.log`/`-exit.txt`를 보존한다. 컴파일 완료 전 import probe 2회는 산출물 부재로 실패했으며 실제 서비스 검증 결과에 포함하지 않는다.

| native fixture | 편집/감지7항목 | wrapper exit | 전체 소요 | 일시 무응답 | 언어 감지 오류 |
|---|---|---|---|---|---|
| editor-acceptance-2vus4D | PASS | 0 | 35622ms | 발생 후 복구 | 없음 |
| editor-acceptance-GBmBCm | PASS | 0 | 22261ms | 없음 | 없음 |
| editor-acceptance-HoAEMq | PASS | 0 | 21795ms | 없음 | 없음 |

실제 `editor.detectLanguage`의 미등록 .sv/등록 JSON 처리, 한글·공백 폴더/파일 편집·저장·재열기·Output API/생성물 경계를 모두 통과했다. 각 fixture의 receipt/host.log/exit.json에 근거가 있다. 3회 모두 Agents 시작/기본 inspector/자동 profiling/10초 경고/감지 오류 없음. **editorPassed=true, startupPassed=false**, 반복 wrapper exit1: 첫 실행의 일시 unresponsive/복구를 실패 기준 그대로 기록했다. `.dev/h1-language-detection-native.log`/`-exit.txt`, `.dev/h1-language-detection-repeat-receipt.json`을 사용한다. 소요 시간은 준비~API 시험~종료 전체이며 순수 시작 성능 수치가 아니다. 같은 PC/cache의 새 프로필이며 clean Windows/physical 입력 재검증이 아니다.

이전 physical 일반 앱은 원본 로그에 07:36:31 UTC extension host exit0를 남겼다. 이번 검증은 별도 private native 호스트만 실행/종료하며 기존 사용자 창을 제어하지 않았다.

## 남은 범위

일반 개발 host의 짧은 응답 지연, 전용 아이콘/runtime metadata, 잔여 product surface 판정은 별도 H1 항목이다. H2 공간/RTL 기능 이식/베타/깨끗한 Windows 검증 완료를 주장하지 않는다. npm audit 영향 검토도 내부 배포 전 남아 있다.
