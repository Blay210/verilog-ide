# H7B — 보관 입력 검증 비용·진행 중 조회 보호 (2026-10-12)

[H7A](ide-h7a-history-recovery.md)에서 남긴 입력 비교/보관 읽기 지연을 단계별로 측정하고 보관 입력 검증을 보완했다. 같은 요청 안의 identity 검색을 선형으로 준비하고 파일 읽기를 제한 병렬 처리했다. 모든 요청의 전체 경로·bytes/hash·include/provenance 검증은 유지한다. 앱 화면 검증은 실행하지 않았다.

## 계측과 병목

`scripts/verify-input-cost.mjs`는 H7A private fixture(300 RTL/1,213,090 source bytes·1000 history)를 읽고 history→설정→보관 검증→디스크/편집 입력 포착→host 비교/소스 조회를 따로 측정한다. production flag/IPC/코드에 계측 hook을 추가하지 않았다. 별도 Node 프로세스에서 선택한 fs.promises 메서드의 호출 수만 기록하고 각 샘플 후 복구한다. fast-glob 내부의 다른 fs API 호출까지 모두 센 값은 아니다.

보관 검증 한 번에 lstat906/readFile301/readdir2가 발생했다. 기존 코드는 각 mapping/provenance 항목마다 전체 identity.files를 다시 검색하면서 경로를 normalize했고, 보관 파일을 순차 읽었다. 한 host 비교는 saved/current 각각의 보관 검증·current capture를 수행한다. 이 구조에서 단순 설정 읽기보다 보관 검증이 컸다.

## 구현과 보호

- `runtime/core/snapshot.ts`: identity path/hash를 요청마다 한 번 Map으로 준비한다. 중복 normalized identity, 중복/불일치 mapping·provenance를 거절하며 manifest/설정/결과 fingerprint·file membership 검증은 유지한다. 파일별 전체 목록 검색을 제거해 lookup 비용을 선형으로 만든다.
- 보관 파일 검증은 최대8개 readMapping 작업을 동시에 진행한다. 각 작업은 모든 상위 경로와 파일 상태·bytes/hash를 확인한다. stat 크기 외에 실제 읽은 bytes도 파일32MiB/합계128MiB 한도를 적용한다. tree의 unrecorded file·symlink 및 configured include 검증도 그대로 수행한다.
- 오류나 abort 발생 시 새 작업을 시작하지 않고 진행 중인 reader 모두가 끝난 뒤 요청을 reject한다. 외부 AbortSignal은 manifest/파일 readFile에도 전달하며 이미 취소된 요청은 즉시 거절한다. 성공으로 돌아오는 partial snapshot은 없다.
- `runtime/host.ts`: 명시적 run 비교·보관 목록/소스 조회를 root와 project epoch에 연결한다. 프로젝트를 다시 읽으면 이전 요청을 abort하고, A→B→A로 돌아와 경로가 다시 같아져도 과거 요청을 거절한다. host 종료는 조회를 취소하고 진행 중 I/O 종료도 기다린다.
- 조회마다 모든 retained inputs를 다시 검증한다. request 간 cache/mtime shortcut이나 전체 검증 생략을 도입하지 않았다. saved/current 두 검사와 source-list/source-read 두 요청의 중복 I/O는 유지한다. 이미 GUI에 열린 검증된 읽기 전용 문서를 유지하는 H6C 정책은 바꾸지 않았다.
- 현재 파일/보관 파일의 전역 atomic snapshot은 여전히 보증하지 않는다. 같은 요청에서 경로/hash를 검사한 시점 이후의 모든 외부 변화를 감시하는 기능은 아니다. compare 결과를 historical trace의 인증으로 사용하지 않는다.

## 이번 검증

| 범위 | 결과/근거 |
|---|---|
| 관련 Core/host 회귀 | **21 PASS/0 FAIL/0 SKIP**. editor-inputs·simulation-host·snapshot-reads. `ide/.dev/cloud/h7b-related.log` |
| 최종 IDE 전체 | **157 PASS/0 FAIL/1 Windows batch SKIP**, 총158개. runtime/language build 포함. `ide/.dev/cloud/h7b-final-tests.log` |
| 기존 실제 VCD/FST 재검증 | 온보딩에서 생성한 4개 run의 retained inputs/trace bytes/hash·원본 보존 PASS. `scripts/verify-simulation.mjs --retained .dev/h3a-real-tHmcnk`, `.dev/cloud/h7b-retained-simulation.log`. 이번에 새 simulator build/run은 없음 |
| 비용 분리 전후 | 같은 private fixture의 assertions PASS. `.dev/cloud/h7b-cost-before.log`, `.dev/cloud/h7b-cost-after.log` |
| Windows 전체 본체/native/physical | 이번 미실행. browser overlay 변경 없이 runtime/host만 수정했다. Windows taskkill·종료 안내·화면 복원 수용은 별도 |

`tests/snapshot-reads.test.mjs`의 새7개 회귀:

1. mapping 목록 뒤쪽 파일 변조/삭제·추가 파일·부모 symlink 거절과 원형 복구 후 새 요청 성공.
2. 중복 mapping/hash 불일치 거절. 다른 파일 identity를 빌려 정상으로 처리하지 않음.
3. 손상 파일의 reader가 실패해도 다른 실제 I/O를 기다린 뒤 reject; 동시에 진행 중인 read 수 상한 확인.
4. pre-abort 및 읽기 중 abort 거절·모든 reader 정리.
5. 실제 보관 source-read를 gate한 A/B/A 전환에서 오래된 응답 거절·후속 정상 요청 성공.
6. host close가 미완료 source-list I/O를 기다리고 unavailable로 거절.
7. 명시적 compare의 A/B/A 전환 거절·후속 matching 복구.

gated read는 실제 파일 bytes를 읽은 뒤 반환 시점을 보류한다. 시간만으로 race를 추측하지 않고 요청·종료 순서를 결정적으로 검사한다. 기존 frozen buffer/최신 revision·package/header/include·legacy 기록·원본 무변경 회귀도 전체 실행에서 통과했다. Linux 결과이며 Windows native 수용으로 합산하지 않는다.

## 전후 측정

동일 `ide/.dev/cloud-h7a-scale-MrDcAt`에서 warmup 후3회 순차 측정했다. baseline은 H7A 구현, after는 H7B 구현이다. 같은 시각의 교대 A/B 시험이나 cold-start 시험이 아니므로 공유 머신 부하·I/O 변동이 섞여 있다. 각 결과는 확인한 관찰값이며 제품 성능 합격선/개선 비율을 확정하지 않는다.

| 단계 | before 중앙값 (최소～최대) | after 중앙값 (최소～최대) |
|---|---|---|
| history100 (전체1000 검증) | 372ms (352～494) | 272ms (247～332) |
| project 설정 읽기 | 10ms (7～33) | 8ms (5～9) |
| retained 전체 검증 | 797ms (607～2102) | 133ms (116～142) |
| saved input 포착 | 205ms (199～255) | 170ms (150～252) |
| editor input 포착 | 201ms (193～209) | 197ms (136～231) |
| host saved/current 비교 | 1827ms (1365～1962) | 918ms (896～992) |
| host 보관 목록 | 980ms (740～1027) | 506ms (324～507) |
| host 보관 한 파일 읽기 | 623ms (564～662) | 393ms (304～534) |

계측한 정상 요청의 I/O 수는 전후 같다. retained 검증 lstat906/readFile301/readdir2, host 비교4414/2202/5, source-list2908/1301/3, source-read2908/1302/3이다. 검증량을 줄인 결과가 아니라 identity lookup과 I/O scheduling을 바꾼 결과다. 수정하지 않은 history/포착 단계도 변동했으므로 표 전체를 코드 개선으로 해석하지 않는다. host 조회에는 여전히 전체1000개 history 검증이 포함된다.

재현: `cd ide`, `npm run build:runtime`, `node scripts/verify-input-cost.mjs .dev/cloud-h7a-scale-MrDcAt`. fixture가 없으면 먼저 `node --expose-gc scripts/verify-history-scale.mjs`로 생성한다. 계측은 source/manifest/run을 재생성하지 않으며 UUID receipt를 별도로 보존한다. GUI/worker/실제 설계·수천 파형 신호·peak memory/메모리 회복 측정은 이 스크립트 범위가 아니다.

## 다음 H7C

다음은 **실행 중 취소·host 종료·하위 프로세스 정리/실패 경계**다. Linux에서 실제 child tree의 종료·peer 보존·재시도와 late output/정리 실패를 결정적으로 검사하고 필요한 보완을 한다. Windows taskkill/native 종료 안내·미저장 보호는 마지막 통합 세션의 별도 항목이다.

history가 커질 때 root별 조회 취소 비용(현재 readHistory 자체는 중간 abort 미지원), 동일 요청의 안전한 중복 검증 재사용, source capture의 순차 I/O, cache64MiB/탭 정리·파형 메모리·재시작 복원은 남는다. H7B에서 전체 H7/베타/배포 완료를 주장하지 않는다. vsix/부모 code/config/lock 의존성·사용자 trust/profile·제품 방향과 UX는 변경하지 않았다.
