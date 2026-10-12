> 최신 합의는 [H0 제품 결정 기록](h0-product-decisions.md)을 우선한다. 아래 질문은 논의 전 준비 자료이며 현재 확정/미결 상태는 결정 기록을 참조한다. 구현은 시작하지 않는다.

# H0 독립 RTL IDE 논의 준비 (2026-10-08)

E4의 지원 범위 내 완료 판정은 [수용표](e4-acceptance-summary.md)를 기준으로 한다. 이 문서는 사용자 논의를 위한 준비 자료이며 앱 구현/Code-OSS 구성/엔진 선택을 확정한 설계가 아니다.

## 제품 방향과 현재 기반

최종 제품은 Code-OSS/VS Code 기반 RTL 전용 IDE다. extension은 초기 host이며 최종 제품이 아니다. 편집/RTL 의미 분석/프로젝트·test 실행/파형 및 read-only 구조 시각화가 이미 분리되어 있다. Core·semantic은 VS Code API 없이 유지하고 Verilator·GTKWave/파형 provider 경계를 보존한다. simulator와 semantic 분석은 서로 교체 가능한 별도 경로다.

현재 host 결합은 packages/vscode의 commands/Testing API/TreeView·Activity Bar/webview·editor URI·settings/storage와 실행·설치 알림에 있다. 문서/사용흐름의 독립은 먼저 논의하되 IDE 구현 때 실제 파일/API를 다시 점검한다. 구조/파형 렌더러의 DOM·theme·acquireVsCodeApi 부분은 UI adapter 경계로 옮길 후보다.

## 합의할 질문

1. 첫 화면: 프로젝트 열기/가져오기 중심으로 할지, 최근 프로젝트와 Simulation/Structure 진입을 같이 보여줄지. 예제 생성은 학습 진입으로 분리할지.
2. 기본 배치: 소스 editor 중심에 simulation 결과/파형을 아래 두거나, 파형·Structure를 별도 중앙 탭으로 유지할지. 클릭·toolbar/F5 흐름과 전문 엔지니어의 넓은 파형 화면을 함께 고려한다.
3. 기존 프로젝트 가져오기: source/TB 후보를 자동 제안하고 사용자가 확인하는 정책, TOML 자동 관리와 수동 override의 경계를 정한다. U12와 원본 TB를 수정하지 않는 자동 trace 요구를 첫 IDE 범위에 넣을지.
4. Simulation/Testing 중 기본 UI의 단일 진입, Explorer TB hover 실행 U11의 우선순위, 필요없는 editor 기능의 기본 노출을 정한다.
5. 첫 독립 IDE의 완료 범위: 스터디 Windows x64 우선인지, extension 개발판과 프로젝트/settings를 어떻게 이전할지. 깨끗한 Windows gate를 언제 확보할지.

각 질문에 대한 사용자 답변 후 결정/미결을 기록하고 H의 작업 순서·완료 기준을 합의한다. 코드와 유지보수/라이선스·업데이트 기술 검토는 구체 구현 시점의 공식 자료로 확인한다. 지금 임의로 Code-OSS fork나 새 배포 방식을 선택하지 않는다.

## 별도 엔진 논의

자체 compiler/simulator는 H와 별도 I 트랙이다. 지원 SV 범위/timing/4-state/assertion, 빠른 첫 빌드·반복 실행 목표, 증분 cache 무효화·정확성, live pause/step을 사용자와 논의한 뒤 계획한다. C++ 변환/직접 native compile 방식은 아직 선택하지 않았다. 전용 waveform 기술 역시 기존 provider 경계에서 확장한다.
