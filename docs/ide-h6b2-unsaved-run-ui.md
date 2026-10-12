# H6B2 — GUI Run의 미저장 RTL snapshot 연결 (2026-10-12)

Simulation의 개별/선택/전체 실행과 Code Explorer TB 실행이 H6B1 snapshot 요청을 전달하도록 연결했다. 원본 코드와 dirty 상태를 자동 저장/변경하지 않는다. 실제 적용 범위와 아래 검증을 기준으로 사용하며 H6/베타 전체 완료는 별도다.

## 동작과 경계

`RtlSimulationHome.start`는 첫 IPC/await 전에 프로젝트 root 안의 dirty TextFile model을 동기 수집한다. `.v/.sv/.vh/.svh`만 대상으로 삼고 `.rtl/.git/node_modules`는 제외한다. 현재 UTF-8/UTF-8 BOM을 지원하며 BOM·document version·편집 text를 보존한다. 다른 encoding은 저장된 코드로 바꾸어 실행하지 않고 안내한다. 파일32MiB/합계128MiB/10000파일 제한을 browser와 Core에서 확인한다. untitled/아직 등록되지 않은 새 source를 자동 등록하지 않는다. 프로젝트 외 dirty 문서는 전달하지 않는다.

모든 Run 진입은 같은 `start`를 사용한다. TB에 여러 top이 있으면 Explorer QuickPick에서 선택한 뒤 당시 buffers를 캡처한다. 선택 전의 낡은 편집 내용을 사용하지 않는다. 미저장 TOML은 기존처럼 검토 전 실행을 거절한다. 프로젝트 신뢰·실행 상태·source membership·include/경로 제한은 유지한다.

Serializable `EditorInput` 계약→Node channel→host.start→SimulationService를 연결했다. Node host는 running 상태를 게시하기 전에 payload를 검증/동결한다. 잘못된 payload로 busy 상태가 남지 않는다. snapshot을 지원하지 않는 backend/복사 실패/잘못된 RTL은 디스크 fallback 없이 실패한다. 원본 자체의 editor autosave 설정은 변경하지 않는다.

결과/이력의 `unsavedFiles`를 전달하고 실제 사용한 파일이 있으면 **미저장 입력**을 표시한다. 결과 tooltip에 파일 목록을 보여준다. 원래 content identity/trace identity·이전 파형 탭·이력·기록 source bytes를 유지한다. 미저장 변경 경고 tooltip은 실행 시점의 내용이 사용된다는 안내로 바꿨다.

## 검증 기록

- 전체143 PASS/0 FAIL/0 SKIP·runtime/language build: `ide/.dev/h6b2-tests.log/.exit0`. 추가 host 회귀는 request 동결, malformed version의 idle 유지, 결과/history provenance 복원과 디스크 bytes 불변을 확인한다.
- 공식 Code-OSS source emission 3파일·0 errors/exit0: `.dev/h6b2-emit.log/.exit0`. 본체 전체 공식 TS7 타입 검사0 errors/exit0: `.dev/h6b2-official-types.log/.exit0`. overlay 적용 전 owned/upstream bytes 비교·previousSha256 기록. 중간 적용 후 추가 변경의 hash guard 거절은 현재 IDE 소유 중간 버전 hash를 기록해 정상 재적용했다.
- 처음 잘못 선택한 IDE-local TS5.9 본체 타입 검사는 V8 heap 한도로 종료했다(`h6b2-types*`, `h6b2-final-types*`). Code-OSS가 사용하는 고정 공식 `upstream/node_modules/@typescript/native/bin/tsc`로 재검증했다. 새 compiler 설치나 dependency 변경은 없다.
- actual native 검증은 `tests/native/editor-inputs.cjs`, `scripts/verify-import-ui.mjs verify-editor-inputs .dev/import-ui-dbJf2o`. 기존 사용자가 승인한 trust/profile을 재사용하고 일반 dev-host activation으로 검사한다. 테스트가 작성한 정확한 dirty text만 검증 후 revert하고, 사용자 창/원본/TOML을 보존한다. 처음 scalar1bit DUT에 값2를 넣어 assertion FAIL한 fixture 오류는 source/TB를 함께8bit로 바꾸어 보완했다. `.dev/import-ui-dbJf2o/h6b2-first-receipt.json/exit.json/host.log` 및 실제 실패 run을 보존했다.

최종 actual native **5시나리오 PASS/trusted:true/exit0**: `.dev/h6b2-ui-complete.log/.exit0`, `.dev/import-ui-dbJf2o/receipt.json/exit.json`. 실제 실행6회는 선택1 PASS·전체2 PASS·invalid1 FAIL·취소1·Explorer retry1 PASS이며, 총 결과 수21→27. 테스트벤치와 DUT의 미저장 text/version2개가 retained source에 들어간 것을 직접 확인했고, 빌드 중 VALUE2→VALUE3 편집은 앞 실행에 영향을 주지 않았다. 첫 run managed VCD의 실제 native renderer 정렬·Code/Simulation 왕복/dirty 유지·뒤 run의 이전 탭 보존·prior trace bytes를 확인했다. 검증 후 정확한 owned edits만 revert, 원본 RTL/TB/TOML bytes 유지·전용 창 정상 종료. 별도 사용자 창과 trust 설정을 수정하지 않았다.

두 번째 앱 시도는 앞4시나리오를 통과했으나 취소 후 Explorer 행이 re-render되기 전에 action을 활성화해 거절됐다. 실제 행의 `hidden/disabled/width`가 다시 준비되기를 기다리도록 테스트를 보완해 마지막 시도5시나리오를 모두 통과했다. 두 번째 실패 receipt/exit/host는 fixture의 `h6b2-second-*`에 보존했다. 물리 클릭/DPI 수용으로 표현하지 않는다.

## 한계·다음 단계

△ 미저장 변경은 현재 프로젝트 dirty 상태, △ 코드 변경됨은 저장된 입력과 최근 run의 bytes/settings 비교다. 현재 buffer가 실행 snapshot과 정확히 같은지의 자동 hash 비교는 아직 제공하지 않는다. 따라서 미저장 입력으로 실행한 직후에도 dirty 표시가 남고, 디스크와 다르면 saved 비교는 changed다. 서로 다른 비교 의미를 없애거나 성공 실행을 outdated 아님으로 단정하지 않는다.

실제 앱의 dirty package/header·UTF-8 BOM/다른 encoding 거절·미저장 TOML·restart provenance 복원, 현재 buffer 비교와 과거 run source를 직접 여는 UX는 H6B3 잔여 수용/보완이다. H6B1 actual service는 dirty package/header/TB 실행을 검증했지만 GUI 수집의 이 조합까지 수용한 것으로 합산하지 않는다. 임의 코드 파일의 외부 I/O·unguarded dump는 sandbox로 격리하지 않는다. 일부 runtime `$fatal` 로그의 Windows path-alias 표시는 기존 열린 문제이며 result/source 경로는 원본에 연결된다.

다음은 H6B3의 비교 의미/남은 조합·복원 확인→H6 완료 범위 판정→H7 종료/복원/중간 규모/물리 UI 등이다. clean Windows 설치·FST 내장 표시·enum/성능 gate를 유지한다. 배포 패키지·설치·VSIX·자체 엔진은 변경하지 않았다.
