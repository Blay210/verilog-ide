# Pipeline MAC — 내부 구조와 기록값 탐색 예제

이 폴더를 개발용 RTL 확장에서 열고 Simulation의 `pipeline_mac`을 실행합니다. 결과의 **Explore Recorded Structure**에서 `signed4`, `signed8`, `unsigned4`를 선택하고 **Internal operations**를 열어 product/stage/acc를 확인합니다. **Choose clock…**에서 해당 인스턴스의 clk를 선택하고 Rising → Next edge로 이동합니다. **Open linked waveform**은 같은 실행의 커서를 공유합니다. E1/E2/D4 기능은 개발 소스에 있으며 기존 0.3.1 VSIX에는 포함되지 않습니다.

| 인스턴스 | 입력 | product/stage | accumulator |
|---|---|---|---|
| signed4 | signed 4bit | signed 8bit | signed 6bit |
| signed8 | signed 8bit | signed 16bit | signed 10bit |
| unsigned4 | unsigned 4bit | unsigned 8bit | unsigned 6bit |

각 상승 에지에서 reset이 우선합니다. reset이 없고 enable이 1이면 `stage`에 현재 product를 저장하고 `acc`에 **이전 stage**를 더합니다. enable이 0이면 stage/acc는 유지됩니다. product는 조합 신호라 입력이 바뀌면 enable과 관계없이 바뀝니다. accumulator는 지정한 폭으로 잘립니다. signed/unsigned의 동일한 입력 비트도 해석이 다릅니다.

TB는 하강 에지에 입력을 바꾸고 상승 에지 1ns 후에 넓은 정수 reference와 DUT를 assertion으로 비교합니다. 실패는 `$fatal`로 표현합니다. wave.vcd는 실행 디렉터리 `.rtl/` 아래에 생성됩니다. 기존 RTL을 자동 수정하거나 중간 식을 추정해 파형값으로 보여주지 않습니다.

| cycle | 상승 시각(ns) | reset/en | a,b | signed4 acc | signed8 acc | unsigned4 acc |
|---|---:|---|---|---:|---:|---:|
| 1 | 15 | 1/1 | 7,7 | 0 | 0 | 0 |
| 2 | 25 | 0/1 | 7,7 | 0 | 0 | 0 |
| 3 | 35 | 0/1 | 7,7 | -15 | 49 | 49 |
| 4 | 45 | 0/0 | -2,3 | -15 | 49 | 49 |
| 5 | 55 | 0/1 | -2,3 | -30 | 98 | 34 |
| 6 | 65 | 0/1 | -8,-8 | 28 | 92 | 12 |
| 7 | 75 | 0/1 | 15,15 | 28 | 156 | 12 |
| 8 | 85 | 0/1 | -1,2 | 29 | 381 | 45 |
| 9 | 95 | 1/0 | 0,0 | 0 | 0 | 0 |
| 10 | 105 | 0/0 | 7,7 | 0 | 0 | 0 |
| 11 | 115 | 0/1 | 127,127 | 0 | 0 | 0 |
| 12 | 125 | 0/1 | 127,127 | 1 | -255 | 33 |
| 13 | 135 | 0/1 | 127,127 | 2 | -510 | 2 |

5ns 상승 에지는 초기 reset 구간입니다. 위 표는 15ns부터의 13개 자극을 보여줍니다. 화면 값은 기본 hex이므로 signed 값은 2의 보수 비트로 보입니다. 예를 들어 signed4의 35ns acc=-15는 6bit `110001`(0x31)입니다. 75ns product는 signed4=1, signed8/unsigned4=225로 다릅니다.

기록 탐색은 그 시각의 최종 VCD 값입니다. 같은 에지의 NBA 전후나 delta-cycle 순서를 복원하는 live simulator step이 아닙니다. TB의 #1 assertion과 별도 자동 검사는 에지/에지+1ns의 관측값을 대조합니다. 지원 범위·검증은 [E3 문서](../../docs/pipeline-mac-acceptance.md)를 확인하세요.
