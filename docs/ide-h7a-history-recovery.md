# H7A — 이력 파일 삭제 복구·중간 규모 비용 (2026-10-12)

[H6 수용 범위](ide-h6-acceptance-summary.md)를 정리하고 H7 안정화를 시작했다. 첫 대상은 손상/삭제된 이력·trace 복구와 수백 RTL 입력의 비교/보관 읽기 비용이다. 제품 UX·프로젝트 독립성은 유지하고 앱 화면은 실행하지 않았다.

## 환경과 기준선

GitHub `main`과 현재 작업 시작 HEAD는 `85ba1fe6f245182faf90602628560cd04f8bcf69`로 같다. 작업 브랜치는 클라우드가 제공한 `work`다. 확인 시 다른 원격 브랜치는 없었다.

Debian 13/Linux x64, Node24.19.0, Python3.12.14/pyslang11.0.0, workspace-local Verilator5.032를 준비했다. Node는 IDE의24.18+ same-major 기준을 만족한다. Windows 로컬의 Python3.14.7/Verilator5.050/MSYS2/GCC16과 다른 검증 환경이다. 고정 Code-OSS archive와 lock hash, grammar artifact integrity를 검증했고 language/runtime 타입 검사를 수행할 수 있다. native 전체 dependency/Git metadata/MSVC 및 GUI 실행 환경은 준비하지 않았다.

온보딩 근거: IDE144 PASS/0 FAIL/1 Windows batch SKIP, VSIX225 PASS/0 FAIL/2 platform SKIP·build/typecheck, 실제 두 counter의 VCD/FST4회 PASS·입력/trace hash·원본 보존. 기존 로그를 확인한 결과이며 이번 개발 작업에서 VSIX와 실제 Verilator 실행을 반복하지 않았다. 클라우드 설정의 install_script/start_skill은 저장된 초안이며 게시/새 작업 복원은 이 결과로 증명하지 않는다.

## 재현한 문제와 보완

`readHistory`는 기록된 log 또는 waveform 파일의 `lstat` 실패를 결과 전체의 무효화로 처리했다. 최신 실행의 trace/log 하나만 지워도 실행 이력이 사라지고, 새 host가 프로젝트를 읽으면 과거 실행을 최신처럼 선택할 수 있었다. 새 회귀의 변경 전 결과는 **3 FAIL/1 PASS**였다.

- run 안의 artifact가 ENOENT이면 실행의 status/runId/time과 보관 입력은 유지한다. 없어진 waveform만 제거하고 trace identity를 unavailable로 반환한다. 없어진 log는 명시적 안내와 원래 경로를 유지하며 열기는 오류로 끝난다.
- 최근 결과가 과거 파형/실행으로 바뀌지 않는다. 원래 PASS/FAIL을 artifact 삭제 때문에 바꾸지 않으며 다른 실행·로그·보관 소스·입력 비교도 그대로 사용할 수 있다.
- 누락 설명은 기존 결과 메시지에 추가한다. 파형/로그 열기는 해당 파일이 없다는 구체적 오류를 반환한다. 첫 host 회귀에서 generic reader 오류를 확인하고 파형 존재 검사를 reader 생성보다 앞에 두었다.
- result.json은 쓰지 않는다. artifact를 정상 복원한 후 재조회하면 저장된 원래 metadata로 읽는다. 기록의 JSON/스키마·directory 불일치·run 밖 artifact·symlink·일반 파일이 아닌 artifact는 계속 제외한다. hash 변조 검사는 기존 snapshot/trace loader가 담당한다.
- 전체 이력 I/O는 최대8개 record 작업으로 제한해 병렬 처리한다. 모든 record를 검증하고 기존 timestamp/directory 정렬 후100/최대1000개를 반환한다. 검증 cache·mtime-only shortcut을 추가하지 않았다. record당1MiB 크기 제한과 경로 검증도 유지한다. 전체 run 개수에 비례하는 작업량 자체는 남는다.

## 이번 검증

| 범위 | 결과와 근거 |
|---|---|
| 변경 전 결함 재현 | `ide/.dev/cloud/h7a-before.log`: history recovery4개 중3 FAIL/1 PASS |
| 삭제 복구·보호·정렬 | `tests/history-recovery.test.mjs`: 최신 trace 삭제·log/trace 동시 삭제·원형 metadata 무쓰기/복원·legacy mtime/limit·손상/unsafe 거절·40개 동률 record 병렬 정렬/재조회 |
| 새 host 복원 | `tests/simulation-host.test.mjs`: 두 run 후 최신 trace/log 삭제, 새 host에서도 같은 latest runId/status·보관 소스/비교 유지, missing artifact 안내·이전 로그 보존 |
| 최종 전체 회귀 | **150 PASS/0 FAIL/1 SKIP**, 총151개. runtime/language build 포함. `ide/.dev/cloud/h7a-final-tests.log` |
| 최종 관련 회귀 | **14 PASS/0 FAIL/0 SKIP**. artifact symlink 시험은 Windows에서 junction을 사용하도록 정리 후 재실행. `ide/.dev/cloud/h7a-final-related.log` |
| 중간 규모 합성 | 300 RTL/1,213,090 source bytes·1,000 history records, 목록/읽기·matching/changed·소스/이력 무변경 assertions PASS. `scripts/verify-history-scale.mjs` |
| Windows 본체·native/physical | 이번 미실행. runtime/host만 변경해 browser overlay/Code-OSS 공식 전체 타입/emission을 반복하지 않음 |

## 비용 측정과 한계

동일 fixture `ide/.dev/cloud-h7a-scale-MrDcAt`을 `--retained`로 읽었다. 두 실행 모두 warmup 후3회 순차 측정이며 캐시를 비우지 않았다. baseline/after는 다른 시점의 실행이다. 공유 머신의 부하·I/O 변동이 커 제품 성능 합격선이나 개선 비율을 확정하지 않는다.

| 동작 | 순차 baseline 중앙값 (최소～최대) | 제한 병렬 after 중앙값 (최소～최대) |
|---|---|---|
| 최근100 조회 (전체1000 record 검증) | 793ms (736～902) | 326ms (234～850) |
| 1000 조회 | 1486ms (1059～2723) | 261ms (236～358) |
| 300 source lexical scan | 450ms (423～566) | 251ms (250～301) |
| saved/current 비교 | 2249ms (2157～2942) | 2292ms (1422～4401) |
| 보관 목록 + 한 파일 읽기 | 1674ms (1505～1771) | 2307ms (1572～3045) |

이력 조회 비용 감소를 관찰했지만 **비교·보관 읽기 지연은 해결되지 않았다.** 수정하지 않은 scan에서도 변동이 있으므로 표 전체를 구현 개선으로 해석하지 않는다. source-list와 source-read는 각각 전체 snapshot 검증을 하며 saved/current도 공통 파일을 반복 검사한다. 자동 검증을 생략하는 cache를 도입하지 않았다.

각 단계의 rssAfter는 전체 Node process 값이다. baseline 이력 약116～117MiB/비교193MiB/보관206MiB, after 이력119MiB/비교195MiB/보관208MiB였다. heapDelta는 일시 객체·미회수 객체를 포함하며 peak/retained memory·누수·메모리 회복 판정이 아니다. 스크립트는 GUI/worker/실제 simulator를 실행하지 않아 수천 파형 신호/편집기·앱 시작 성능을 검증하지 않는다. generated RTL은 합성 workload이며 사용자 실제 설계 수용과 구분한다.

재현: `cd ide`, `npm run build:runtime`, `node --expose-gc scripts/verify-history-scale.mjs`. 같은 private fixture 재측정은 `--retained .dev/cloud-h7a-scale-MrDcAt`이며 원본 소스/manifest/run은 재생성하지 않는다. 새 receipt는 별도 UUID 파일로 저장한다. 전후 로그는 `.dev/cloud/h7a-scale-baseline.log`, `.dev/cloud/h7a-scale-after.log`다.

## 다음 H7 작업

1. **H7B: 입력 비교·보관 조회 비용 분리.** history/설정/경로·retained hash/current capture 비용을 각각 계측하고, 한 요청의 안전한 검증 재사용 가능성을 검토한다. 외부 편집/삭제·변조·요청 취소/root 전환과 최신 bytes 계약을 유지한다.
2. 실행 중 종료·하위 프로세스 정리 실패/취소와 Linux 가능한 결정적 회귀. Windows taskkill·native 종료 안내/미저장 보호는 별도 수용한다.
3. 큰 history의 조회 한계/정리 정책, cache64MiB/탭 정리·worker 수천 신호 메모리, 손상 기록 추가 경계.
4. 최종 Windows 통합 세션에서 삭제 artifact 안내/최신 result 유지, 공간/탭/선택/파형 복원, encoding·물리 race/키 입력/DPI를 확인한다. 현재 앱 화면 검증은 보류다.

H7 전체 완료·독립 IDE 베타/배포·clean Windows 설치·FST 내장 표시/enum 완료는 아니다. vsix source/config/lock, 제품 방향·확정 UX, 사용자 trust/profile은 변경하지 않았다.
