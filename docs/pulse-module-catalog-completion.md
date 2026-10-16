# Pulse 프로젝트 모듈 이름 추천 보완 (2026-10-16)

## 사용자 재현과 원인

포트 추천은 정상이나 새 줄의 `coun` 입력에는 `counter`가 없고 `continue`/`$countones`만 보인다는 사용자 보고다. 사진처럼 앞에 세미콜론이 빠진 인스턴스와 `counter ();`가 있는 코드를 실제 slang/LSP에 넣어, 새 입력 위치에서 모듈 추천이 빠지는 **제품 실패를 먼저 재현**했다.

직전 연속성 보완은 기존 인스턴스의 포트와 동일 위치에서 조회한 후보를 보존했다. 새 줄/새 위치에서 처음 입력하는 모듈 이름에는 그 위치의 후보 cache가 없었다. 미완성 문서의 현재 semantic scope가 비어 있는 경우에도 프로젝트 정의 이름을 독립적으로 제공하는 경로가 부족했다. 이전 단계의 ‘포트/동일 위치 연속성’ 수용을 프로젝트 모듈 이름 전체 수용으로 확대하지 않는다.

## 변경

- `ide/language/src/module-catalog.ts`: compiler가 확인한 프로젝트 definition의 이름·종류·원본 파일만 root별로 저장한다. 특정 completion 위치·instance elaboration·후보 query 성공에 의존하지 않는다. 이름 중복이 서로 다른 파일의 정의이면 보수적으로 제외한다.
- 새로운 모듈 항목 위치의 첫 입력에도 기존 catalogue를 제공한다. dirty 상태에는 incomplete 결과로 바로 제공하고, 정밀 조회 후에는 기존 결과와 이름별로 합친다. 따라서 주변 구문의 오류로 정밀 scope 조회가 빈 결과를 줘도 알려진 모듈 이름이 빠지지 않는다.
- 모듈은 Class 아이콘·`module_name ${1} (${2});$0` snippet을 유지한다. 빈 instance 이름→Tab→괄호 안 순서이며 이미 알려진 포트 추천 코드는 변경하지 않는다.
- 빠른 위치 판별은 bounded lexical 보조다. module/interface/program 본문·structural generate 위치를 허용하고 헤더/포트 연결/표현식/package/function/class/프로시저/주석/문자열/qualified member에는 catalogue를 추가하지 않는다. 이것을 semantic scope 분석이라 부르지 않는다. 정밀 compiler 조회 경로는 그대로다.
- source 편집 시 해당 파일의 이름 변경/선언 삭제를 즉시 제외한다. 보통의 다른 TB 본문 편집으로 외부 파일의 모듈 이름까지 지우지 않는다. directive/macro 변경·파일/설정 watch·root/도구 종료·분석 실패는 기존 보수적 무효화에 합류한다. 새 이름 추가는 compiler 확인 후 게시한다.
- 최대4,096개 이름·serialized UTF-16 계산1MiB/root, 기존 preview 최대2 root 경계 안에서 동작한다. 정밀 type/진단/hover/소스 이동이나 native compiler 객체를 보존하지 않는다. 먼저 확인한 일반 identifier를 대상으로 하며 escaped identifier/복잡한 새 문맥은 기존 정밀 경로에 맡긴다.

## 검증

실제 재현은 수정 전1 FAIL이었다. 수정 후 실제 compiler/LSP 관련4 PASS: gate 중 새 위치의 첫 모듈 추천·Class/snippet·중복 없음, parser recovery 이후 추천, 기존 포트·패키지 추천 보존을 확인했다. 최종 전체 회귀에는 모듈 source 삭제 후 즉시 이전 이름 제거도 포함한다. 별도 lexical/catalogue/continuity/snippet 단위12 PASS는 문맥 제한·rename·다른 파일 유지·directive 변경·중복/한도·UTF-16 이동 등을 다룬다. language TypeScript build exit0.

최종 전체426건: **425 PASS/0 FAIL/1 POSIX SKIP**,252.1초. 위 관련4/단위12 검사는 전체와 겹치므로 합산하지 않는다. 모듈 파일 삭제 후 즉시 이전 이름 제거·기존 semantic scope/port/package·실제 compiler 프로세스 정리·시뮬레이션 회귀를 포함한다. 최종 코드의 language build exit0·diff check PASS. native/runtime TypeScript source는 변경하지 않았다.

최신 개발 실행본은 `ide/.dev/pulse-bundled-ZXQ7Tm/Pulse.exe`, code identity `c53a32f4d5a63f3eb620daeb24f61ce1607fe090cdd4a43978510713607fc9e7`이다. 검증된 이전 `pulse-bundled-OvKa60`의 전체 파일 hash를 확인해 별도 후보에 복사하고, 최종 language bundle만 교체했다. 전체2,564파일 inventory·native integrity10개·headless native 버전/RTL CLI 두 top 인식 PASS다. 최종 server bundle이 현재 준비된 소스 bundle과 같은 hash인 것도 확인했다. v3/bundled launcher의14개 자산 prepare/check PASS이며41.4/276.8ms는 앱 UI 준비 시간이 아니다. `ide/Start-Pulse.cmd`와 `.dev/latest-launch.json`을 기준으로 실행하며 기존 Pulse 창을 정상 종료하고 시작한다. 예전 Setup/ZIP은 이번 수정 이전 버전이다.

원시 근거는 `ide/.dev/windows-integrated/pulse-module-catalog-{initial,repaired,all-tests,bundle,bundle-verify}.log`와 `pulse-module-catalog-candidate.json`, 최종 후보 `.pulse-build.json`이다. 초기 FAIL은 실제 누락을 재현한 결과이며 fixture 오류로 분류하지 않는다.

**Computer Use/visible 앱 검증은 실행하지 않았다.** 기존 창·프로필·신뢰·설치판/Setup/ZIP을 보존했다. native source가 바뀌지 않아 검증된 본체 bytes를 복사하며 프로젝트 간 코드 링크는 없다. 다른 환경에서는 공식 `scripts/prepare-local-bundle.mjs` 전체 빌드로 현재 소스를 재현할 수 있다. 이 로컬 개발 실행본은 설치/배포 패키지가 아니다.

## 남은 범위

처음 프로젝트를 열어 compiler가 정의를 한 번도 확인하기 전, 새 정의 추가 직후, directive 변경 후에는 새 분석이 필요하다. 기존 포트·이름 추천은 compiler 내부의 부분 증분 분석이 아니다. 임의의 미완성 구문에서의 모든 의미 추천/실제 화면 수용은 아직 주장하지 않는다. 사용자 직접 타이핑 체험 후 남은 문제를 보완하며, 새 화면 검증은 별도 사전 승인을 받는다.
