# E4 완료 판정 — 지원 범위 내 기록 시각 디버깅 (2026-10-08)

## 판정

**E4를 지원 부분집합·현재 Windows 개발 환경에서 완료로 판정한다. 다음은 H0 독립 IDE 논의 준비/사용자 합의다.** 개발 host에서 모듈→자식 내부 연산→소스/파형·clock 왕복, 취소/닫기/재시도, 실제 기본 키보드 조작, 대표 규모/비용 기록이라는 pre-ide-roadmap 기준을 충족했다. 모든 RTL의 합성 schematic·모든 접근성·모든 Windows 환경의 배포 안정성 완료를 뜻하지 않는다.

이 문서가 E4 현재 판정의 기준이다. 아래 링크의 과거 ‘E4 진행 중/다음 검증’ 문구는 당시 기록이며 이번 종합 판정이 우선한다. 전체 RTL/모든 operator 완성이 H0 진입 조건이 아니라는 기존 로드맵 원칙을 적용했다. 기능을 추가하지 않고 검증 범위를 계속 확대하는 작업은 여기서 종료한다. 새 결함/사용자 피드백/지원 범위 변경이 있으면 관련 gate를 다시 연다.

## 완료 기준 대조표

| 검증 묶음 | 실제 근거 | 판정·범위 |
|---|---|---|
| 정적 모델·관측 정확성 | [E3 pipeline MAC](pipeline-mac-acceptance.md), [scope 의미](scope-operations-acceptance.md), [기록 왕복](recorded-debug-roundtrip-acceptance.md) | 지원 subset; parameter signed4/signed8/unsigned4, product/stage/acc117값 기대 일치. 없는 중간값을 계산해 보여주지 않음 |
| 실제 화면·배선 | [4×4 UI](schematic-4x4-ui-acceptance.md), [routing](schematic-routing-acceptance.md) |16MAC/26boundary ports/전체 fixture route, parent/leaf 진입·source·pan/zoom/Fit 수용. 아키텍처4×4 grid 추정 배치가 아님 |
| source/diagram/wave/clock 왕복 | [기록 디버깅](recorded-debug-roundtrip-acceptance.md) |117값, 양방향 cursor, 소스/닫기/재연결 자동 native 및 실제 기본 조작 수용 |
| 취소·닫기·복구 | [클럭 native](structure-cancel-recovery-acceptance.md), [실제 Cancel](structure-physical-cancel-acceptance.md), [분석 process tree](structure-analysis-cancel-acceptance.md) | 늦은 publication 차단·15초 clock timer·실제 Cancel·Windows 부모/자식 종료·실제 retry. physical 관찰 시험에서만 timeout 연장 사용; 자연발생 부하 latency라고 하지 않음 |
| 기본 키보드·focus | [browser/실제 조작](structure-browser-keyboard-acceptance.md), [offscreen](structure-focus-performance-acceptance.md), [selector/source](structure-keyboard-roundtrip-acceptance.md), 아래 마지막 recorded 수용 | Tab/Enter 모듈, Hierarchy 방향키, Display 변경, current/recorded 소스 복귀 focus·stale 비활성화 수용. 모든 screen reader/임의 page scroll 복원 미검증 |
| 규모·성능·reader 회수 | [graph scale](visual-debugging-e4a.md), [4×4](schematic-scale-acceptance.md), [반복 frame 비용](structure-focus-performance-acceptance.md), [reader lifecycle](structure-cancel-recovery-acceptance.md) | 실제98/146node 및256 초과 거부,4×4 142node/100edge,2170 SVG element 반복 RAF p95 약16.8ms;4096signal8cycle/16worker 회수. RAF/parent RSS는 pixel latency/전체 VS Code leak 보장이 아님 |
| 기존 회귀 | [최신 제품 보완](structure-keyboard-roundtrip-acceptance.md) | 전체227 PASS/0 FAIL/0 SKIP, 타입 검사/개발 build 성공. 최신 전체 로그 .dev/e4-focus-return-regression.log; 이번 제품 코드 변경 없어서 재실행 없음 |

## 마지막 recorded focus 회귀

native run-kH0Z78, .dev/e4-recorded-focus-final.log, host별 receipt.json passed=true/RTL_E4_HOST_PASS/exit0. 기존 retained MAC run을 재사용했다. 실제 Open definition → pipeline_mac recorded source → Ctrl+PageUp → Open definition 포커스 테두리 복원 → Tab Display → Next edge35→45ns를 확인했다. 자동 host observations는35k/45k cursor 상태를 기록했다. source가 읽기 전용 scheme이라는 자동 근거는 기존 recorded-debug-roundtrip 수용을 유지하며 이번 화면 클릭만으로 readonly 전체 정책을 재검증했다고 하지 않는다. 새 simulation/사용자 소스 변경/패키징·설치 없음.

## 지원 한도와 열린 gate

- 내부 연산은 AST allowlist/명시적 unsupported 사유의 read-only 의미 모델이다. generate/array 내부 연산, 전체 SystemVerilog, 복잡한多writer/CDC 등은 지원 범위를 넓히는 별도 작업이다.
- 계층을 연속 zoom으로 펼치기, 아키텍처 추정 grid 배치, live breakpoint/pause/step/연산 중간값 평가·자동 데이터 전파 animation은 미구현이며 E4 완료 항목에 넣지 않는다.
- Fit의 작은 label/밀집 제어선, 임의 page scroll·전체 screen reader, 여러 기기/장시간 browser 성능·전체 VS Code memory, 특수 subprocess 실패 모든 조합은 제한 또는 추가 수용 후보다.
- 깨끗한 Windows의 최초 설치 종단은 별도 환경이 없어서 계속 열려 있다. 기존 장기 베타 게이트/스터디 피드백·배포판 업데이트도 E4와 별개다.
- 과거40ms 취소 시험의 병행 부하 실패와 최초 UI harness 실패는 각 기록에 보존한다. 최신 전체227 PASS가 있었지만 모든 부하의 비결정적 타이밍 문제를 해결했다고 주장하지 않는다.
- frozen study VSIX0.3.1은 그대로이며 현재 개발 기능이 그 배포물에 포함됐다고 하지 않는다.

## 다음 단계

[H0 논의 준비](h0-discussion-brief.md)를 바탕으로 사용자와 IDE의 첫 화면/프로젝트 자동화/기본 simulation·wave·structure 배치를 정한다. 합의 전 Code-OSS fork·배포 변경·자체 compiler/simulator 구현을 시작하지 않는다. E4 한도는 숨기지 않고 H 계획의 사용자 기대/지원 범위에 반영한다.
