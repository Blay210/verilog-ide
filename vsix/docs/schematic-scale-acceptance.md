# E4 구조 시험 복구·4×4 graph 검증 (2026-10-08)

사용자 재개 요청으로 checkpoint 이후 작업을 이어갔다. 독립 IDE/engine 착수 및 release 패키징은 하지 않았다.

## 닫힌 편집기 오류

격리 실제 VS Code host `run-mV9kyl`에서 `testStructure`를 단독 실행하여 이전 오류를 재현했다. `.dev/structure-editor-reproduce.log`는 exit1/성공 receipt 없음이다. 구조 refresh/inspect 이후 두 번째 미저장 parameter 수정에 예전 `TextEditor`를 재사용하던 시험 코드가 `TextEditor#edit not possible on closed editors`로 실패했다. diagram reveal은 텍스트 editor 객체를 dispose할 수 있지만 unsaved `TextDocument`는 유지된다.

시험은 소스 이동 후 현재 editor를 받고, diagram inspect 후에는 기존 document를 다시 보여줘 새 editor를 얻도록 보완했다. 같은 document identity·dirty 상태·미저장 parameter 유지와 edit 성공 여부를 명시적으로 확인한다. 제품에서 소스가 사라지거나 저장되는 오류로 확인된 것은 아니므로 제품 navigation 코드는 변경하지 않았다. 재현에 대한 보완을 단순 retry/예외 무시로 처리하지 않았다.

최종 통합 실제 host `run-cgbxeo`는 최신 begin/always·predefined 추천·module/scope/port/색상·semantic 진단 시험 이후 구조 test까지 통과했다. generate/instance array/parameter 문맥, source definition/instance 이동, 미저장 hierarchy 갱신, stale navigation 차단, surviving parent fallback, 다른 test로 context reset, VCD custom editor 확인을 포함한다. 로그 `.dev/structure-editor-integrated-verified.log`, `.rtl/extension-test.json` `{passed:true,editor:true}`, exit0. 이 receipt의 editor 표시는 기존 `RTL_EDITOR_ONLY` 종료 지점이며 로그에서 `RTL_STRUCTURE_TEST_PASS`까지 확인했다. 실제 simulation을 새로 실행한 시험은 아니다.

## 4×4 규모 검증

`tests/semantic/schematic-scale.test.ts`가 private `.dev/e4/`에 16개 명시적 MAC 인스턴스를 생성한다. 기존 2×2 fixture의 mac_pe와 같은 weight-stationary 연결 형태를 확장한 구조 검증용이며 cycle-accurate streaming systolic 기능을 주장하지 않는다. generate/array unsupported 범위를 우회해 지원됐다고 주장하지 않고 explicit instance만 사용한다. 사용자 프로젝트는 수정하지 않는다.

실제 slang hierarchy/scope graph와 Schematic SVG 렌더링 결과:

| 항목 | 결과 |
|---|---:|
| opaque MAC 블록 | 16 |
| graph nodes / edges | 142 / 100 |
| 외곽 포트 | 26, 모두 표시 |
| 배선 누락 | 0 (`routingIncomplete=false`, `routingUnrouted=[]`) |
| hierarchy + graph 분석 | 약 1,252ms |
| SVG 생성 | 약 76ms |
| canvas | 2,955 × 2,615 |
| SVG 크기 | 128,994 bytes |

근거: `.dev/schematic-4x4-verified.log`, `.dev/e4/schematic-4x4-e82tYb/.rtl/schematic-scale.json` 및 `schematic.svg`. 실제 native 시험1 PASS/0 FAIL/0 SKIP/exit0. 위 시간은 이 PC에서의 1회 측정이며 browser frame/사용성·메모리 회수 성능은 아니다. 블록 identity/모든 외곽 포트/visible route를 assertion으로 확인했다. 사람이 보는 실제 화면의 긴 배선·포트 라벨 가독성, pan/zoom/Fit, keyboard/focus는 아직 수용하지 않았다.

## 회귀 및 다음 지점

최신 편집 변경을 포함한 전체 최상위 단위 시험224 PASS/0 FAIL/0 SKIP, `.dev/editor-structure-full-verified.log`/exit0. 이는 `tests/*.test.ts`이며 native semantic 하위 폴더의 모든 시험을 포함하는 명령은 아니다. 새 4×4 시험은 별도 실행했고 위 통합 VS Code host도 별도 근거다. 타입 검사 exit0 및 native runner의 개발 build exit0. release VSIX 생성/설치 없음.

다음은 실제 4×4 화면에서 가독성/확대·이동·Fit·leaf 계층 진입을 확인하고 필요하면 개선하는 것이다. 이어 source/diagram/wave/clock 실제 왕복·keyboard/focus·취소/닫기/복구·성능 수용을 마무리한다. E4 전체 완료가 아니며 live breakpoint/simulator single-step/연속 hierarchy zoom과 독립 IDE/자체 engine은 별도 후속 범위로 유지한다.
