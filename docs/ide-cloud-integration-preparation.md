# 클라우드 통합 준비 (2026-10-13 KST)

사용자 PC를 사용하지 않고 기존 H7S·Simulation 디자인·TB 자동 목록 뒤의 통합 준비를 진행했다. 사용자 화면/프로필/신뢰를 조작하거나 앱/배포 패키지를 설치하지 않았다. 현재 Linux checkout에서 실행 가능한 본체 타입/owned 출력, 실제 Node 채널, TB filesystem·규모·수명 회귀를 검증한다. Windows native 실행과 물리 UI 수용은 별도로 남긴다.

## 이번 변경

- frozen upstream root/build dependencies를 native install/postinstall 없이 준비했다. npm integrity·pinned manifest/lock 검사를 유지한다. Electron 선언은 공식 build helper와 저장소 checksum으로 검증한다. 첫 direct fetch의 DNS 실패는 `NODE_USE_ENV_PROXY=1`로 지원 proxy를 사용해 해결했으며 TLS/checksum을 낮추지 않았다.
- 본체 전체 검사에서 Simulation 홈의 미사용 `ImportRecovery` import를 발견해 제거했다. 기존 owned 파일 hash를 overlay 이동 목록에 보존했다. 첫 타입 검사는 Electron 선언 준비와 겹쳐 missing Electron 오류도 포함했다. 최종 검사와 혼합하지 않는다. 반복 standalone 검사는 동일 전체 검사를 포함하는 공식 owned build로 통합하고 이 작업의 중복 checker만 종료했다.
- `scripts/verify-channel-cleanup.mjs`에 production command dispatch의 TB 등록·stale/missing/untrusted·두 top/삭제·제외의 새 세션 복원과 tool 호출0을 추가했다. 기존 pinned event/explicit close/disconnect/dispose/cleanup failure 검증을 유지한다. 실제 Node channel/host를 쓰되 Electron 창 사이 native IPC transport는 아니다. stale edit는 runtime 계약대로 error state를 반환하며 진단의 초기 잘못된 reject 기대를 바로잡았다.
- `tests/test-catalog.test.mjs`에 실제 Core를 읽은 뒤 지연한 scan으로 늦은 100 caller를 한 후속 scan에 모으는 회귀와 host close의 취소/join·늦은 목록 무게시 회귀를 추가했다. 총10개 PASS. clock timeout/지연 예산을 성공 기준으로 삼지 않는다.
- `scripts/verify-tb-catalog.mjs`는 private `.dev/cloud-tb-integration-*` 프로젝트에서 recursive Node OS watcher→production host를 연결한다. workbench event forwarding/debounce만 진단 fixture이며 Windows watcher/실제 UI의 대체 수용은 아니다. 파일 rename·등록 폴더 밖 이동·빈 폴더 재생성·삭제,300 RTL+100 TB 파일/202 rows 및20 add/delete 반복, idle notification·tool/history·설정 보존·double close를 검사한다. 임의 사용자 프로젝트를 받거나 기존 이력을 삭제하지 않는다.

## 소스 읽기 할당 비용

300 RTL/100 TB 파일의202개 테스트를 해석하는 한 실제 Core load에서 작은 파일도64KiB buffer를두 번 할당해 `Buffer.allocUnsafe`806회/52,822,016 bytes를 관찰했다. 파일 크기에 맞춘4–64KiB chunk로 바꾸되 실제 read의 EOF/성장·2MiB 파일/64MiB 전체 상한·취소와 close를 유지한다. 요청 사이 source cache나 파일 검사를 생략하지 않는다. stat 뒤 파일이 증가하는 회귀로 complete 내용 읽기와 file/total byte 상한 거절을 검사한다. 동일 private fixture의202개 test·source 선택 SHA256이 전후 동일했고 read buffer 호출806회를 유지하며52,822,016→3,301,376 bytes(50.375→3.148MiB, **93.75% 감소**)였다. 할당량을 heap/RSS/전체 응답 속도와 구분한다.

## 최종 검증 기록

- 공식 upstream TS7 **7.0.2** `src/tsconfig.json` 전체 타입 검사 **0 errors/exit0**, 공식 `createCompile` owned output **0 errors**. `compile-owned.mts` 완료 로그를 확인했다. runtime/language 최종 build PASS. Windows native 앱 빌드/실행 근거는 아니다.
- 실제 owned Node channel+pinned base+real host의 TB dispatch·명시적 close·실패/disconnect/dispose **4묶음 PASS**. native Electron 창 사이 IPC가 아니다.
- 최종 관련 discovery7/catalog10/overlay3 **20 PASS/0 FAIL/0 SKIP**. stat 뒤 파일 성장·파일/전체 byte 상한·100 late callers→한 후속 scan·close join/늦은 목록 무게시·설정/신뢰/alias·owned migration을 포함한다.
- 버퍼 변경 전 순차 전체 회귀 **334 PASS/0 FAIL/1 Windows batch SKIP(총335개)**,343.5초/exit0. 버퍼 변경 후 최종 순차 전체 회귀 **335 PASS/0 FAIL/1 Windows batch SKIP(총336개)**,408.3초/exit0. 최종 runtime/language build 뒤 제품 코드 변경 없이 실행했고 별도 통과 결과를 합산하지 않았다. `git diff --check`·진단2파일 syntax·현재 문서 링크 PASS.
- 최종 private workload **PASS**: actual Linux OS events12→모델 forwarding의 refresh5, file rename·폴더 밖 이동·빈 폴더 재생성·삭제. compiler/simulator0·history0·원본 TOML/JSON 불변·idle500ms notification0·double close.

| 단독 합성 Linux 측정 | 변경 전 중앙값 / max | 변경 후 중앙값 / max |
|---|---|---|
| Core load·5회 | 428.0 /755.5ms |448.0 /580.7ms |
| host refresh·5회 |606.4 /725.5ms |446.1 /663.9ms |
| add+delete 각2 refresh·20회 |962.2 /1487.3ms |803.1 /2548.5ms |

최종 반복 후 GC heap은8.83→8.86MiB, RSS180.5→170.6MiB였다. 한 전후 실행의 관측이며 Core 중앙값은 개선되지 않았고 반복 tail도 증가했다. **할당 bytes 감소만 확정**하고 latency/전체 RSS/장기 누수/Windows 빠릿함 완료로 확대하지 않는다. 전체 프로젝트 scan·history 비용과 큰 배열/allocator/RSS 잔여는 대표 실제 baseline에 남긴다.

클라우드 설정의 `install_script`/`start_skill` 초안에 frozen root/build type 의존성과 checksum Electron 타입·proxy 경로·공식 owned compile 및4 CPU 병렬 제한·재현 검사를 추가 저장했다(status saved/requires_publish:true). 네트워크/secret/repository membership은 변경하지 않았다. 현재 머신에서 각 추가 단계를 실행해 확인했으며 사용자 환경 설정에서 확인·저장 후 게시하는 것은 별도다. 새 task restoration/publication 완료로 표현하지 않는다.

 초기 설치와 본체 검사에 겹친 첫 규모 결과는 비교용 단독 baseline으로 사용하지 않는다. wall/CPU/heap/RSS를 구분하고 cold startup/Windows UI/대표 실제 설계 결과로 확대하지 않는다.

ignored 출력: `ide/.dev/cloud-integration/`의 upstream/build deps·Electron type·owned build·runtime/language·channel·race·whole regression·TB measurement 로그. 실제 fixture별 `receipt.json`도 보존한다. GitHub checkout에는 따라오지 않으므로 위 scripts/tests로 새 private fixture를 생성해 재현한다.

## 재실행

```bash
source /workspace/.cloud-tools/activate.sh
cd /workspace/verilog-ide/ide
npm run build:runtime
npm run build:language
node scripts/verify-channel-cleanup.mjs
node --expose-gc scripts/verify-tb-catalog.mjs
node --test --test-concurrency=1 tests/*.test.mjs
```

전체 본체/owned 출력은 pinned source와 root/build frozen dependencies, checksum Electron 타입이 준비되어야 한다. `scripts/compile-owned.mts`는 공식 upstream `createCompile`/`spawnTsgo` 경로를 사용한다. cloud에서는 다음 명령을 사용하며 native 앱을 띄우지 않는다.

```bash
cd /workspace/verilog-ide/ide/upstream
node --experimental-transform-types ../scripts/compile-owned.mts
```

root/build 설치는 `npm ci --ignore-scripts --no-audit --no-fund`, Electron 선언은 `NODE_USE_ENV_PROXY=1 node build/npm/electronTypes.ts`이다. native module 설치와 전체 Electron executable·extension/media 준비를 생략한 타입/owned 출력 환경이다. 이를 Windows 또는 Linux native 앱 빌드·실행 준비 완료로 표현하지 않는다. standalone source Git metadata도 기존대로 미준비다. ide/vsix 소스·config·dependency 경계를 유지하고 main/work의 기존 미커밋 변경을 보존한다.

## 다음 Windows 검증

1. Windows 공식 build/emission 재실행 및 NTFS 설정/lease/journal/case/junction/권한·취소/taskkill/종료.
2. 실제 native watcher/LanguageClient/channel로 빈 폴더·rename/delete/recreate·두 top/사용자 제외·수동 파일·재시작·누락 DUT 복구.
3. 마지막 한 화면 세션: Code↔Simulation, Run/Cancel·이력/보관 source/diff/파형·hover·키보드·긴 목록·DPI/고대비·dirty/trust 보호.
4. 대표 실제 설계의 startup/idle/edit/전환·장기 heap/RSS/handle·전체 disk baseline. 클라우드 합성 수치로 빠릿한 제품 경험의 전체 수용을 선언하지 않는다.

[통합 우선순위](ide-h7-integration-gates.md)와 [성능 계획](ide-performance-plan.md)을 따른다. 별도 기능 잔여인 FST 내장 표시/파형 enum·전체 archive/run artifact disk 정리 정책은 이번 통합 검증 완료에 포함하지 않는다. 자동 삭제·자체 compiler/simulator·무검증 요청 간 cache를 추가하지 않았다. release/commit/push는 하지 않았다.
