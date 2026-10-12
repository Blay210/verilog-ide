# 실행 설정·파형 자동화와 단일 Simulation UX — 2026-10-08

## 사용자 원칙

사용자는 rtl.toml 편집/테스트 등록 및 매 testbench의 dump 코드를 반복 작성하고 싶지 않다. IDE가 기본 작업을 처리하고, 모호하거나 세부 조정이 필요한 경우만 사람에게 묻는다. 독립 IDE는 Simulation을 중심으로 불필요한 workbench 기능을 줄인다. 블록 다이어그램/기록 기반 디버깅 마무리를 유지하며 이 요청만으로 작업 순서를 변경하지 않는다.

## 현재 코드 확인

- Core config의 source/package/test glob 검색은 자동이고 예제/최소 manifest 생성은 가능하다. test name/top/source 설정은 manifest에 명시적으로 등록해야 한다. `testbench-targets.ts`는 manifest test sources에 속한 파일만 실행 대상으로 연결한다. 후보 발견/실행 대상 GUI 등록/설정 자동 저장은 아직 미구현이다. 기존 [U12 계획](project-discovery-direction.md)을 구현 완료로 해석하지 않는다.
- VerilatorBackend는 --binary, --trace 또는 --trace-fst와 RTL_WAVEFORM/RTL_FST define을 전달한다. testbench에서 dump 활성화 코드를 작성해야 하는 현재 구조다. 실행 때 자동 tracing을 붙이는 기능은 미구현이다.
- Simulation은 제품 전용 대상/결과/파형/실행 이력 UI, Testing은 VS Code의 공통 Testing API 화면이다. 실행은 공통 Core/Testing 계층을 사용한다. 독립 IDE에서 공통 테스트 실행 기반을 유지하면서 기본 UI를 Simulation으로 통합하는 것은 별개 결정이다.

## 후속 설계 방향

1. 자동 후보 탐색과 파일 Run→top 선택/기억, GUI 실행 설정으로 manifest를 관리한다. RTL/package/include/define 소스 범위가 모호할 때만 사용자에게 묻는다. 기존 명시적 설정과 주석/사용자 설정을 보존하고 무제한 workspace 실행이나 임의 build-script 자동 실행을 하지 않는다. TOML은 버전 관리 가능한 공유 설정이며 기본 사용에 직접 편집을 요구하지 않는다.
2. 기본 파형 생성은 IDE/adapter가 담당한다. 원본 RTL/testbench는 수정하지 않고 `.rtl/` 실행 생성물에 필요한 보조 코드를 만든다. 외부 사용을 위한 수동 dump 제어도 허용한다. 자동/수동/파형 끔의 중복 활성화 정책과 VCD/FST 이름/보존 결과 모델을 먼저 정의한다. 파일명은 선택한 test top을 기본으로 안전하게 만들고 run directory로 격리한다.
3. 구현 후보는 adapter가 소유하는 trace runner 또는 명시적으로 생성한 tracing 보조 소스다. 원본 문자열을 대충 치환하거나 top wrapper를 무조건 추가하지 않는다. 기존 hierarchy/segmented trace identity/enum/preset/recorded graph·source 검증을 보존해야 한다. 사용자에게 C++ harness를 쓰게 하지 않는 원칙은 유지한다. 전용 engine 없이 현재 Verilator adapter에서도 자동 tracing은 구현 가능하다.
4. --binary의 timing/$finish 처리, time zero·최종 trace, assertion/timeout/cancel·프로세스 정리, 기존 dump 코드와의 호환, GUI/CLI 일치·재현 가능한 입력 기록을 실제 Verilator로 검증한다. 실행 보조 코드와 사용자 소스를 구분하고 build cache/결과 identity에서 누락하지 않는다.
5. 최종 독립 IDE의 기본 실행 진입점은 Simulation 하나로 단순화한다. Testing UI와 Extension Marketplace 등 workbench 기능의 포함/숨김 여부는 H0 독립 IDE 논의에서 결정한다. 현재 확장이 사용자 VS Code의 일반 Testing/Marketplace를 임의로 제거하지 않는다.

## 상태

이번은 코드 확인·요구/방향 기록이며 신규 자동화 구현이나 검증은 아니다. 다음 구현 순서는 기존 block diagram/기록 디버깅 E4 수용을 유지한다. 이후 사용자의 다른 개선사항과 함께 U12 및 자동 tracing의 구체적인 실행 순서를 정한다.
