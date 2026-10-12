# H6A1 — 원본 무변경 자동 파형 prototype·방식 결정

2026-10-12. **실제 Verilator prototype 비교 완료. 기본 IDE/CLI 실행 연결은 다음 H6A2이며 아직 자동 dump 기본 동작이 아니다.** H6/베타 전체 미완료.

## 선택한 방식

IDE가 생성하는 C++ driver에서 모델의 eval 후 trace를 기록한다. 사용자는 C++를 작성하지 않는다. RTL source에 문자열/regex로 dump 구문을 삽입하거나 RTL wrapper를 기본 top으로 추가하지 않는다. simulator adapter 내부 구현으로 두고 Core와 편집기 경계를 유지한다.

[Verilator 공개 연결 API](https://verilator.org/guide/latest/connecting.html)는 timing 모델의 eventsPending/nextTimeSlot 및 final 호출을 설명한다. [공식 trace FAQ](https://verilator.org/guide/latest/faq.html)는 SV dump 또는 C++ trace 객체를 사용할 수 있다고 설명한다. 이 공개 API를 기반으로 실제 설치된 **Verilator 5.050 / Windows UCRT64**에서 검증했다. 웹 문서의 최신 버전과 설치 버전을 혼동하지 않는다.

별도 SV wrapper도 실제 성공했지만 scope에 rtl_wrapper.child가 추가됐다. 기존 신호 보기/계층/향후 source mapping에 영향을 주므로 기본 경로로 선택하지 않는다. C++ driver는 공식 --binary가 생성하는 main처럼 모델 이름을 빈 문자열로 사용하여 원래 top 계층을 유지한다. top output alias($rootio) 등 Verilator 고유 표현은 존재한다.

## 추가한 코드·검증 경계

- ide/runtime/verilator/trace-harness.ts: prototype driver 생성기. VCD/FST/off, local 안전 파일명 검증·timing eval loop. 현재 VerilatorBackend에서 import/선택하지 않는다.
- ide/scripts/verify-managed-trace.mjs: 자체 소유 fixture에서 실제 --cc/--exe/--build와 --binary wrapper 비교. 기존 tool detection/buildPaths/common process를 재사용한다. VSIX/부모 코드 import·도구 설치 없음.
- ide/tests/trace-harness.test.mjs: 경로 탈출/C++ 문자열 삽입·확장자 불일치 거절.

사용자 원본은 수정하지 않았으며 .dev/h6a-trace-한글 공백-AFmVcj의 기준 source bytes가 불변이다. 검증용 driver/입력/빌드/trace/log/receipt는 그 fixture의 .rtl 안에 모았다. unsafe Windows 경로는 기존 tools cache alias를 생성·폐기했다. fixture에 receipt가 있는 동일한 source/driver만 개발 verifier가 재사용할 수 있다. **이 재사용은 제품의 증분 빌드 기능이 아니다.**

## 실제 검증 결과

| 항목 | 근거 |
|---|---|
| 전체 회귀/runtime·language build | **134 PASS / 0 FAIL / 0 SKIP / exit0**, ide/.dev/h6a-tests.log/.exit |
| 최종 runtime build | prototype model 이름 보강 후 build:runtime 성공 |
| 관련 안전 입력 검사 | **1 PASS**, ide/.dev/h6a-focused.log/.exit |
| 실제 prototype 최종 | **9항목 PASS / exit0**, ide/.dev/h6a-prototype-final-5.log/.exit 및 fixture .rtl/receipt.json |
| verifier syntax | node --check PASS |

9항목:

1. managed VCD: top output·clock/marker·assert/timing, 2.125ns 신호 변화와 17ns 종료, VCD 1ps/17000 ticks 및 first 계층.
2. 실제 $fatal을 비정상 종료로 전달.
3. +loop 무한 실행을 공통 process layer에서 실제 취소(cancelled:true).
4. 기존 SV $dumpfile/$dumpvars와 managed C++ trace가 동시에 존재하면 둘 다 파일을 생성함을 확인.
5. 같은 source에 있는 두 번째 top을 별도 실행해 FST 생성. **nonempty 파일과 정상 top 출력 확인이며 FST 내부 신호/내장 viewer 읽기 검증은 아직 아니다.**
6. off 빌드에서는 managed 및 기존 SV dump 모두 trace 파일 생성 없음.
7. wrapper 실제 실행은 성공하나 rtl_wrapper.child 계층이 생김을 VCD에서 확인.
8. **$dump 토큰이 전혀 없는 별도 RTL**에서 clean output/3ns endpoint VCD 생성. 앞의 호환 fixture에는 +legacy로만 활성화되는 dump 코드가 있어서 이 독립 검증을 추가했다.
9. 원본 bytes 불변·.rtl 격리. 실패/취소 실행은 별도 cwd로 격리했고 앞선 정상 VCD bytes도 그대로 확인.

전체134 검증은 모델 이름/실제 검증 assertion 보강 전 결과다. 보강 후 runtime build·관련1시험·실제 최종9항목을 확인했으며 전체를 반복했다고 표현하지 않는다. 화면/IPC 코드 변경이 없어 upstream 화면 emission을 다시 수행하지 않았다. 실제 GUI 기본 실행/내장 파형 탭은 이번 변경으로 검증하지 않았다.

## 발견·보완 기록

1. Windows --cc/--exe 연결의 첫 시도는 sc_time_stamp 미정의였다. 공식 --binary가 생성한 Makefile의 -DVL_TIME_CONTEXT와 설치 공개 header를 확인하고 동일 context time 옵션을 추가해 실제 성공했다. h6a-prototype.log/.exit 및 94caey fixture 실패 근거 보존.
2. 초기 모델 이름은 기본 TOP이었다. 공식 generated main과 같은 빈 이름으로 보완했다. bus path는 이름에 [7:0] 표기가 포함되므로 endsWith(first.count)라는 시험 가정이 잘못됐다. 실제 범위 표기/계층을 확인해 assertion을 고쳤다. h6a-prototype-final.log, final-2.log와 fixture receipt.previous* 근거 보존.
3. fractional delay에 신호 변화가 없으면 VCD는 그 timestamp를 생략한다. fixture에 marker를 두어 2125 tick에 실제 변화가 있는 시간 검증으로 보완했다.
4. final-3/4/5는 source/driver 동일성을 확인한 자체 fixture의 성공 빌드를 재사용했다. final-5에서 dump 구문 없는 clean RTL 빌드 하나를 추가했다. 각 global log/exit와 .rtl 이전 receipt/log를 보존하며 실패 결과를 PASS에 합산하지 않는다.

## 다음 H6A2 구현 계약

- backend의 기본 경로로 IDE 생성 driver를 연결하고 현재 --binary와 기능 차이를 검증한다. timing=false, final/무이벤트 종료, 컴파일 오류·취소·time limit 및 기존 테스트 회귀도 확인한다.
- managed 파일명을 top 기반 안전한 이름으로 생성하고 BuildArtifact에서 **명시적 managed waveform**을 Core에 전달한다. runner가 디렉터리의 첫 파일을 고르는 정책에 맡기지 않는다. 기존 dump를 수정/제거하지 않고 managed 파일을 결과로 선택한다. 중복 파일·사용자 dump delay/depth와의 차이를 안내하며 상호 파일명 충돌은 방지해야 한다.
- VCD/FST/off·시뮬레이션 실패 시 부분 파형·이전 결과 보존을 실제 검증한다. 원본에 dump 코드를 요구하는 기존 ‘No waveform’ 안내도 backend capability에 맞춰 교체한다.
- 생성 driver는 .rtl/run 안 instrumentation artifact이며 retained 입력 원형과 구분한다. GUI/CLI가 같은 adapter/Core 결과를 사용하도록 한다.
- 이후 H6B는 실제 editor unsaved snapshot·source identity/mapping이다. 지금 Core의 recorded saved inputs를 미저장 실행 완료라고 설명하지 않는다.

남은 gate: GUI/CLI 적용, native 자동 파형 열기, FST viewer·enum·대표 규모/물리 UX·clean Windows/실제 설치, H7 종료/재시작. 자체 compiler/simulator/Diagram·배포 패키징은 범위 밖이다.

재개: docs/handoff.md와 이 기록부터 읽는다. ide에서 build:runtime 후 verify-managed-trace.mjs를 실행한다. 기존 fixture를 명시할 때 검증 소유 위치/source/driver 동일성 검사가 필요하다. 기본 앱은 기존 --binary 경로 그대로이며 사용자 프로필/신뢰·retained history14를 변경하지 않았다.
