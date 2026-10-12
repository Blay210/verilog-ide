# E3 — Pipeline MAC 종단 예제와 reference 검증 (2026-10-07)

## 산출물과 범위

[새 예제](../examples/pipeline-mac/README.md)는 RTL/TB/rtl.toml/README/.gitignore 구조를 유지한다. signed4(W4/ACC6), signed8(W8/ACC10) 두 동일 모듈의 parameter 변형과 unsigned4(W4/ACC6) 변형을 함께 시뮬레이션한다. 예제의 13cycle 표가 latency/hold/reset/부호/overflow·잘림의 의미를 보여준다. 사용자가 수정한 기존 counter 예제는 건드리지 않았다. 새 배포물은 만들지 않았으며0.3.1 VSIX에 이 예제/기능이 들어 있다고 하지 않는다.

product는2W 폭의 조합 곱셈, stage는2W 폭의 register, acc는 더 좁은 ACC_W register다. enable일 때 acc에 이전 stage를 더하고 현재 product를 stage에 저장한다. 동기 reset은 enable보다 우선한다. enable=0에서도 product는 입력을 따라 바뀌지만 stage/acc는 유지한다. 입력을 signed/unsigned 폭으로 해석하고 stage/acc 경계에서 잘림을 적용한다.

TB는 하강 에지 입력 변경 → 상승 에지 → #1 assertion을 사용한다. 넓은 longint reference를 계산하고 입력/acc 경계에서 명시적으로 wrap한다. 별도 TypeScript BigInt reference는 RTL/graph를 해석하지 않고 동일 명세를 계산한다. 손으로 고정한 accumulator 표를 unit 검사에 둬 reference의 latency/잘림도 검사한다. 내부 graph에 계산값을 주입하거나 없는 중간값을 추정하지 않는다.

## 검증

- 전체 .dev/e3-full-regression.log: **199 PASS / 0 FAIL / 0 SKIP**, 타입 검사와 개발 build exit0.
- 실제 Verilator/native semantic .dev/e3-integration-verified.log: 1 PASS. 최종 fixture .dev/e3/mac 한글 i9Z8iB의 .rtl/e3-receipt.json passed=true. baseline TB 13cycles assertion PASS; retained 입력의 slang hierarchy와 각 instance graph가 supported, product Multiply 폭/부호와 accumulator conversion을 확인한다.
- 세 인스턴스×13cycles×product/stage/acc = **117개 기대값**을 검증 trace의 정확한 segmented binding/raw bit와 비교한다. 상승 에지 및 에지+1ns에서 최종값을, 첫 cycle 이후의 stage/acc는 에지 직전의 이전값도 비교한다.5ns 초기 reset edge와 마지막 edge 경계를 구분한다.
- RTL private 복사본을 acc+stage에서 acc+product로 변경한 negative control은 컴파일 후 **cycle2 signed4 reference mismatch**의 runtime assertion으로 FAIL했다. 실패 상태만 검사하지 않고 로그의 원인을 검사하며 원본 private RTL을 복구한다. 예제 원본은 변경하지 않는다.
- 실제 VS Code 개발 호스트 .dev/e3-host/run-qMDhox, .dev/e3-host.log RTL_E3_HOST_PASS/host 및 runner exit0. project .dev/e3/mac 한글 7zFLLd/.rtl/e3-host.json passed=true/117 observations. integration에서 생성한 PASS 결과를 열어 세 내부 graph·13 rising edges·117 raw 값·각 에지의 파형 shared cursor·readonly recorded source를 실제 API로 대조했다. GUI에서 새 simulation을 실행한 시험은 아니며 actual simulation은 Core/Verilator integration이 수행했다. GUI 실행 자체는 앞선 E1/E2/D4 검사 근거를 유지한다.
- 0.3.1 VSIX/ZIP SHA256은 기존 값 그대로다. 검증 산출물은 .dev/와 해당 fixture .rtl/이며 새 예제 원본에는 .rtl/가 생성되지 않았다.

초기 integration1 FAIL은 graph의 곱셈 label을 *로 기대한 시험 오류였다. 기존 renderer/schema는 ×를 사용한다. 시험을 계약에 맞춰 수정한 뒤 native integration을 통과했다. .dev/e3-integration.log의 초기 실패를 보존한다. native의 mutex/agent channel/window 경고는 API receipt/exit0와 구분한다. 실제 물리 UI 조작·가독성 수용을 완료했다고 하지 않는다.

## 재현과 인수인계

환경의 RTL_DEV_HOME/RTL_SEMANTIC_PYTHON을 검증된 runtime으로 설정하고 RTL_INTEGRATION=1로 tests/semantic/pipeline-mac.test.ts를 실행한다. 이는 .dev/e3 아래 새 fixture와 baseline/negative-control 실행을 만든다. 기존 예제의 .rtl/ 결과는 fixture 복사에서 제외한다.

scripts/test-pipeline-mac.mjs는 VSCODE_EXECUTABLE과 RTL_E3_PROJECT(위 integration fixture 경로)를 받아 격리된 개발 profile에서 보존 결과 UI 검사를 수행한다. 릴리스 VSIX를 만들거나 설치하지 않는다. tests/pipeline-mac-reference.ts는 기대값 helper, tests/pipeline-mac.test.ts는 고정 표 검사, tests/vscode/pipeline-mac.ts는 실제 host 관측 검증이다.

다음 작업은 **E4 시각화 UX·성능·복구 수용**이다. 새 예제로 top→자식→내부 연산→소스/파형 왕복, Back/Up, pan/zoom/Fit, clock 선택/edge 이동을 실제 조작하면서 화면/경고/지원 한도를 확인한다. graph256node 등 한도와 대표 graph의 query/표시·닫기/취소·복구 및 측정한 범위만 기록한다. E4를 자체 simulator/합성 schematic/자동 전파 animation 구현으로 확대하지 않는다.

깨끗한 Windows·대표 사용자 설계·장시간/일부 profile 검증은 열려 있다. E4 이후 H0에서 사용자와 독립 IDE 아이디어를 논의하고 H 상세 계획을 합의한다. 자체 engine I도 별도 시점에 논의한다.
