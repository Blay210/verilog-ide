# H5C — 가져오기 분류 저장·복원 (2026-10-11)

**분류 저장·복원 단계 완료. H5 전체 및 독립 IDE 베타 완료는 아니다.** H5B 검토 화면의 ‘분류 저장’ 버튼으로 IDE 소유 pending rtl.toml을 생성/갱신한다. 단순 역할 선택이나 새로고침에서는 저장하지 않는다. 사용자 RTL 파일은 수정하지 않는다.

## 사용과 소유 정책

1. TOML 없는 폴더를 열고 Simulation에서 탐색한 파일을 검토한다. 폴더/파일의 RTL·시뮬레이션·제외 역할을 조정한다.
2. **분류 저장**을 누르면 루트 rtl.toml에 상대 경로 역할을 기록한다. 이 버튼이 명시적 저장 동작이며 도구 설치나 코드 실행은 하지 않는다.
3. 새 host/앱에서 프로젝트를 다시 읽으면 저장한 역할을 복원한다. 같은 창에서는 아직 저장하지 않은 검토도 동일 manifest revision의 새로고침 동안 유지한다. 디스크 설정이 바뀌면 저장된 새 revision을 다시 읽는다.
4. 기존 일반 사용자 TOML은 IDE 소유 설정으로 채택하거나 덮어쓰지 않는다. IDE가 만든 TOML을 직접 변경한 경우에도 자동 갱신을 거절한다. 변경된 내용은 그대로 보존하며 명시적 병합/고급 설정 전환은 후속 단계다.
5. 다른 창의 먼저 완료된 저장, 손상/연결/읽기 전용 파일, 미저장 TOML 편집은 덮어쓰지 않는다. 충돌 뒤에는 새로고침·변경 검토가 필요하다.

‘설정 파일 있음’ 표시는 저장 파일 존재를 나타낸다. 이후의 역할 변경은 다시 저장해야 한다. 현재 저장됨/미저장 변경을 세밀하게 구분하는 배지나 닫기 경고는 미구현이다.

## 버전·상태

IDE 소유 첫 줄 marker: `# RTL IDE managed import review v1`.

```toml
version = 1
test = []

[project]
name = "설계 프로젝트"

[sources]
rtl = []
packages = []

[import_review]
version = 1
pending = true
folders = [{ path = "verification", role = "simulation" }]
files = []
```

루트 설정 version과 import_review version을 따로 검증한다. 상대 경로 정규화·안정적 순서·역할 수/길이/파일 크기 제한을 적용한다. 후보 위치 offset을 영구 실행 ID로 저장하지 않는다. 아직 lexical 후보를 의미 분석으로 확정하지 않았으므로 source/test 실행 설정은 만들지 않는다.

**이 pending TOML은 실행 가능한 프로젝트 manifest가 아니다.** host는 검토 화면으로 복원하고 실행을 비활성화한다. 기존 Core/CLI 실행 reader는 import_review를 허용하지 않아 실행을 거절한다. LSP의 프로젝트 기반 semantic 분석도 아직 이 검토 설정을 실행 프로젝트로 사용하지 않는다. H5D에서 include/define/package와 top을 확정한 뒤 실행 manifest로 전환하는 정책·연결을 구현해야 한다.

## 저장 경계와 실패 처리

- readImportSettings/saveImportSettings는 editor-free Core API. UI → serializable contract → per-window host → Node IPC 경계를 유지한다. vsix/ 및 부모 구현 의존 없음.
- 읽기는 최대 1MiB로 제한하고 일반 파일·연결 여부·handle identity를 확인한다. IDE 소유 문서의 canonical 내용과 revision(SHA256)을 검증한다.
- 저장 전 역할/소유권/revision을 검사한다. `.rtl/import-review.lock`을 배타적으로 생성해 협력하는 IDE writer를 직렬화한다. 임시 파일은 `.rtl/` 안에서 쓰고 sync한다.
- 최초 공개는 hard link로 기존 rtl.toml을 원자적으로 대체하지 않고 생성한다. 갱신은 다시 revision 검사 후 rename한다. 취소는 commit 직전까지 확인하며, commit이 완료된 뒤 취소 요청이 오면 완료된 저장으로 취급한다. 정상 성공/실패/취소는 자기 임시 파일·잠금만 정리한다.
- 프로세스 강제 종료로 남은 lock은 자동으로 삭제하지 않는다. 실행 중인 writer가 없는지 확인 후 복구해야 한다. 비협력 외부 프로그램의 최종 revision 검사와 rename 사이 변경까지 OS 수준 CAS로 차단하는 보장은 없다. crash recovery/외부 writer 경쟁의 추가 강화는 후속 수용 항목이다.
- 쓰기 자체를 프로젝트 신뢰 승인으로 취급하지 않는다. 실행/도구 설치의 기존 신뢰 및 승인 경계는 유지한다.

## 검증 근거

| 검증 | 결과 |
|---|---|
| 최종 전체 자동 검증 | **104 PASS / 0 FAIL / 0 SKIP**, runtime/language 빌드 포함. ide/.dev/h5c-tests-final.log, .exit=0 |
| 신규 저장 시험 4개 | 새 host 복원·갱신·승인 없이 무작성·실행 차단·원본 보존, stale writer/외부 편집/일반 TOML 보존, 동시 생성 winner1·취소/invalid path·손상 처리, 읽기 전용/hardlink/junction 거절 |
| 공식 owned emission/전체 upstream 타입 | **0 errors / exit0**, ide/.dev/h5c-compile-final.log |
| 실제 앱 가져오기 | **6항목 PASS / exit0**, ide/.dev/editor-acceptance-a4p0FX/receipt.json, exit.json. 실제 renderer/IPC·역할 변경/초기화·공간 전환·저장/refresh 복원·미저장 TOML 차단 |
| 기존 Simulation 최종 회귀 | **3항목 PASS / exit0**, ide/.dev/editor-acceptance-7pp0Gg/receipt.json, exit.json. 기존 테스트 목록/IPC·비신뢰 실행 차단·미저장 소스 보존. trusted 실행 반복 아님 |

첫 실제 앱 iwkpCB는 미저장 TOML의 예상 거절이 없어 실패했다. 조사 결과 resource 비교 helper의 세 번째 인자를 ignoreCase로 잘못 사용한 기존 패턴을 발견했다(실제로 ignoreFragment). Windows에 맞는 extUriBiasedIgnorePathCase로 파일 이벤트/미저장 표시/저장 보호를 보완했다. a4p0FX에서 dirtyDocument/dirtyManifest와 원본 bytes 유지·저장 거절을 확인했다. 최초 실패 로그 보존.

실제 앱 검증은 공식 명령 API이며 물리 클릭·큰 프로젝트 화면 가독성 수용은 아니다. 새 host 복원은 Core/host 시험, 실제 앱 복원은 새로고침으로 확인했다. 앱 프로세스 재시작을 통한 별도 GUI 복원은 아직 미검증이다. 기존 창·프로필·신뢰 설정을 변경하지 않았고 설치/배포 없음.

## 다음 순서 / 인수인계

**H5D**: pending import_review → 의미 분석 기반 top 선택·확정 → include/define/package/source 설정 → 실행 가능한 manifest 생성/전환. 여러 top은 각각 독립 테스트/이력으로 관리한다. 사용자 수동 변경/기존 manifest 병합과 충돌 UI도 이 경계를 기준으로 정한다. Lexical 후보만으로 테스트를 자동 등록하지 않는다.

그 뒤 폴더 우클릭 역할/아이콘·Explorer 실행 버튼·드래그 분류, H6 미저장 snapshot/자동 dump와 H4/H7 잔여 수용을 이어간다. clean Windows·실제 설치·FST/enum·규모/복원·물리 UX 등 기존 베타 gate는 유지한다.

주요 파일: ide/runtime/core/import-settings.ts, discovery-model.ts, contract.ts, host.ts, src/rtlSimulationHome.ts, rtlSimulationChannel.ts, rtlSpaces.contribution.ts. 테스트: ide/tests/import-settings.test.mjs, tests/native/import.cjs. ide/에서 npm test 및 verify-editor.mjs import. Root docs는 제품/인수인계 문서이며 코드 빌드 입력이 아니다.
