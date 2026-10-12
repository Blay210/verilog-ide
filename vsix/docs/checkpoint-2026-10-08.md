> 재개됨: 이후 사용자 요청으로 작업을 이어갔다. 최신 지점은 [구조 시험 복구·4×4 검증](schematic-scale-acceptance.md) 및 handoff/delivery-plan 상단을 따른다. 아래는 중단 당시의 역사 기록이다.

# 작업 중단·재개 기준 (2026-10-08)

사용자가 현재 진행사항을 기록하고 다음 요청까지 작업을 멈추도록 지시했다. 이 문서 저장 후 신규 구현·검증·패키징은 진행하지 않는다. 사용자가 재개를 요청하면 아래 순서부터 이어간다.

## 현재 위치

최종 목표는 독립 VS Code/Code-OSS 기반 RTL 설계·시뮬레이션 IDE다. 현재 extension은 초기 host이며 study 배포판 0.3.1은 피드백 수집용으로 유지한다. 현재 개발 지점은 블록 다이어그램/기록 기반 디버깅 E4 마무리 전이다. 독립 IDE fork나 자체 compiler/simulator는 아직 착수하지 않는다.

이번 편집 개선으로 다음이 반영되었다.

- `begin`: 명시적 Tab/제안 수락 시 여러 줄 begin/end와 들여쓴 본문 커서.
- `always`/`always_ff`: 이벤트 괄호 첫 입력 → Tab → 본문, begin/end 포함. `always_comb`/`always_latch`: 바로 본문 커서.
- 기본 제공 이름: 주요 예약어, 시스템 태스크/함수, 전처리 지시어 추천. 전체 표준 목록을 빠짐없이 지원한다고 검증한 상태는 아니다.
- 사용자 신호: 현재 위치에서 접근 가능한 모듈·함수·블록 및 import/qualified package 범위. 다른 모듈 내부 신호를 섞지 않는다.
- 모듈 이름: manifest에 등록된 공통 RTL/include와 현재 테스트의 컴파일에 속하는 모듈 정의 추천. 다른 테스트벤치 컴파일은 격리한다. 미저장 선언 변경도 반영한다.
- `.포트`: 기존 대상 모듈의 미연결 포트 추천·방향/폭·signature·연결식 신호 ranking 유지.
- 모듈 색상: compiler-confirmed 선언/인스턴스 타입 위치에 의미 토큰 적용. 테마 및 semantic highlighting 설정을 따르며 같은 이름의 변수/주석/문자열은 제외한다.

위 추천 범위 구분은 사용자가 재확인하고 수용했다. 일반 문장 입력에 begin/end를 강제하지 않는다. 자동 trace와 TOML 관리 개선은 요구/방향 기록 상태이며 이번에 구현하지 않았다.

## 검증 근거와 한계

| 변경 | 확인된 결과 | 근거 |
|---|---|---|
| begin/always | language12 PASS, 타입/개발 build exit0, 실제 editor Tab/커서/제안 수락 PASS | `.dev/editor-block-verified.log`, host `run-YpCEsk` |
| 모듈/신호/색상 | helper/query10 PASS, 실제 slang10 PASS, 타입/build exit0, 실제 editor 모듈/신호 kind·의미 토큰·기존 포트/package/진단 PASS | `.dev/module-completion-verified.log`, `.dev/project-symbol-native-verified.log`, host `run-QIa4EO` |
| 기본 제공 이름/지시어 | language13 PASS, 타입/build exit0, 실제 editor 추천·prefix 교체 범위·기존 편집/VCD editor PASS | `.dev/predefined-editor-verified.log`, host `run-XmdKef` |

native 성공 host의 `.rtl/extension-test.json` passed=true와 프로세스 exit0 확인. 로그/host는 로컬 `.dev/` 자료이며 Git 배포 대상이 아니다. 시험 개수는 각각의 실행 결과이며 중복되므로 합쳐 전체 회귀 개수로 표현하지 않는다. 직전 diagram 전체 회귀221 PASS 근거는 유지하지만 그 후 편집 변경 전체를 포함한 전체 회귀를 재실행한 것은 아니다. 새 VSIX 생성/설치·사용자 예제 원본 수정 없음. 최신 변경은 개발 확장을 재실행해야 반영되며 기존 study VSIX는 갱신되지 않았다.

제한 환경의 native 파일 읽기 실패는 허용 환경에서 관련 시험을 다시 통과했다. 별도 최초 통합 host `.dev/project-symbol-native.log`는 편집/포트 시험 이후 `testStructure`에서 `TextEditor#edit not possible on closed editors` 오류로 exit1이다. 편집 기능의 분리 수용은 통과했으나 이 구조 시험 오류는 해결되지 않았다. 제품 문제/시험 수명 관리 문제인지 아직 판정하지 않았으므로 전체 통합 성공으로 표시하지 않는다.

## 재개 시 실행 순서

1. 기존 `tests/vscode/structure.ts`의 closed-editor 실패를 재현하고 원인을 구분하여 보완한다.
2. E4의 4×4/조밀한 구조에서 배치·카드 우회·교차·확대/축소·pan·계층 진입 가독성과 규모를 검증한다. generate/array·연속 계층 zoom은 현재 미완료이며 임의로 완료 표시하지 않는다.
3. source ↔ diagram ↔ waveform 이동과 기록된 시점/clock 선택·값 표시, keyboard/focus 흐름을 실제 host에서 확인한다.
4. 취소·닫기/재열기·복구·성능과 필요한 회귀를 마무리하고 E4 수용 근거를 갱신한다.
5. 다음 개선 후보인 TOML/테스트 등록·원본 수정 없는 자동 trace는 [설정 UX 방향](simulation-setup-ux-direction.md)과 [프로젝트 발견 방향](project-discovery-direction.md)을 따라 별도 구현한다.
6. 독립 IDE(H0)와 자체 엔진은 사용자와 아이디어/범위/기술 결정을 구체화한 후 진행한다. live breakpoint/실행 single-step/operator 값 계산은 이번 기록 기반 디버깅 완료 목표에 포함하지 않는다.

이어받는 작업자는 [handoff](handoff.md), [delivery-plan](delivery-plan.md), [architecture](architecture.md), [현재 검증 기록](current-validation.md)을 함께 읽는다. 사용자 재개 요청 전에는 여기서 대기한다.
