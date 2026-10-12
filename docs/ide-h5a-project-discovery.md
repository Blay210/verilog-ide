# H5A — 읽기 전용 프로젝트 탐색·분류 기반 (2026-10-11)

## 구현 범위

`ide/runtime/core/discovery.ts`의 `discoverProject()`를 Core에서 공개한다. VS Code API·semantic/compiler 실행·설치·쓰기·캐시 생성이 없는 읽기 전용 import inventory다. 소스 .v/.sv와 헤더 .vh/.svh를 찾고 파일 종류(package/module/mixed/header/unknown), 역할(source/simulation), module/program 실행 top 후보와 근거·경고를 제공한다. 경로는 프로젝트 상대 `/` 형식이며 파일 순서는 locale과 무관하게 안정적으로 정렬한다.

역할은 **파일 지정 > 가장 가까운 폴더 지정 > tb/testbench/simulation 등 관례 > source 기본값**이다. 종류와 역할은 별개라 Simulation 폴더의 package/helper를 모두 실행 대상으로 확정하지 않는다. excluded 폴더는 탐색 경계이며 하위 파일 override로 다시 포함하지 않는다. `.rtl/.git/node_modules`는 항상 제외하며 symlink/junction을 따라가지 않는다. 경로 역할 지정은 프로젝트 상대 경로만 허용하며 중복 역할은 오류로 돌려준다.

한 파일의 여러 module/program을 각각 후보로 제공한다. tb.v의 top1/top2는 tb.top1/tb.top2로 표시할 수 있고 다른 폴더의 같은 basename은 상대 경로로 구분한다. 후보 ID에는 파일/이름/선언 offset을 포함한다. **이 ID는 탐색 확인용이며 영속 실행 identity가 아니다.** rename/offset 변경을 포함한 실제 테스트 identity와 TOML의 dot 이름 지원은 후속 H5에서 구현한다.

주석·문자열·directive continuation·escaped identifier를 마스킹하고 선언/닫는 키워드와 initial/시뮬레이션 task 근거를 순차적으로 찾는다. preprocessing, escaped 이름, incomplete 코드, 중복 module에 경고를 붙인다. 모든 top은 `confirmation: required`이며 compiler-confirmed 실행 top이 아니다. 상호 instantiation/parameter/generate·조건부 branch/package 의존성은 판정하지 않는다. **lexical 후보 탐색을 semantic analysis라고 부르지 않는다.**

기존 rtl.toml은 존재 여부만 보고 보존한다. present는 유효한 설정이라는 뜻이 아니며 실제 schema 검증은 기존 loadProject가 담당한다. manifest를 만들거나 수정하지 않는다. 빈 폴더에서도 rtl/tb/.rtl을 만들지 않는다. GUI·Simulation 자동 등록·TOML managed 설정과 아직 연결하지 않았다.

## 비용·취소

기본 한도는 파일10000·directory entry100000·파일2MiB·총 읽기64MiB다. 파일 크기 한도 초과는 경고와 수동 확인, 전체 file/entry/byte 한도 초과는 오류로 처리해 누락된 inventory를 완전한 결과로 제시하지 않는다. AbortSignal을 디렉터리·파일·read chunk 사이에서 검사하고 handle을 정리한다. 실제 읽기는64KiB chunk로 제한해 initial stat 이후 파일이 커지는 경우에도 무제한 readFile을 하지 않는다. 정적 link 및 project 밖으로 resolve되는 파일은 건너뛴다. 이것은 시뮬레이션 입력 snapshot이나 모든 동시 파일 변경에 대한 원자적 일관성 보장이 아니다.

개발 확인용 `ide/scripts/inspect-project.mjs`는 Core 결과를 stdout JSON으로 출력하고 사용자 프로젝트에 파일을 쓰지 않는다. ide 폴더에서 `node scripts/inspect-project.mjs <folder>`로 사용한다. 사용자 GUI 기능을 CLI로 대신 제공했다고 간주하지 않는다.

## 검증 결과

새 `ide/tests/discovery.test.mjs` **6항목 PASS**: manifest 없는 한글/공백 프로젝트·안정 순서·multi-top·원본 bytes/tree 불변; 주석/string/directive/escaped 오인식 제외; 파일/최장 폴더 역할·Windows 경로·중복/외부 경로 거절; 생성물/link 제외; mixed/duplicate/incomplete 및 basename 충돌; 시작 전/진행 중 취소·비용 한도·빈 폴더·기존 손상 manifest 보존.

최종 전체 **97 PASS /0 FAIL /0 SKIP**, runtime/language 타입/build 통과. `ide/.dev/h5a-tests.log/.exit`(0). 기존 실제 slang/LSP·simulation·waveform 회귀 포함. TS workbench overlay 변경이 없어 새 전체 upstream typecheck는 수행하지 않았으며 이전 H3J 근거와 구분한다.

실제 기존 `.dev/h3b-preview`는 source3/top후보3·manifest present, RTL/TB/manifest 해시 불변. 자체 `.dev/h5a-scale-jnn2el`에서 **335파일/320top후보/20package/5header**, 약 **195.63ms**, 원본 해시 불변·rtl.toml 생성 없음. `ide/.dev/h5a-inventory-receipt.json`, 재현 `.dev/h5a-inventory.mjs`. 이 수치는 작은 합성 RTL의 한 번 탐색 비용이며 의미 분석·빌드·실제 GUI·최종 IDE 성능 수용이 아니다.

## 다음 실행 지점·인수인계

**H5A 기반 완료, H5 전체 완료 아님.** 다음 H5B는 manifest 없는 프로젝트의 탐색 확인 화면과 Core/host 연결, 역할 지정/재분류 결과를 UI에서 확인하게 한다. 이후 managed TOML의 schema/override/주석 보존/원자적 저장/외부 변경 충돌 정책을 정하고 쓰기 연결을 구현한다. 사용자 승인된 분류를 compiler/semantic으로 확인해 top을 실행 목록에 연결하며 helper/중복/여러 top을 처리한다. 처음 폴더 열기로 파일을 생성하지 않는 원칙을 유지한다.

H3M trusted editor7 PASS는 기존 완료 근거다. 실제 설치/clean Windows, FST/enum/package 순서 simulation 연결/history 정리·물리 waveform/layout/규모·복원·host 지연/audit gate는 남아 있다. H6 미저장 simulation snapshot/자동 dump→H7 내부 베타 수용을 유지한다. VSIX/부모 코드 참조, 도구 설치, 배포 패키징 없음.
