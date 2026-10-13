# 클라우드 변경 Windows 복귀·비화면 검증 (2026-10-13 KST)

클라우드의 H7A～S, Simulation 홈 디자인, TB 자동 목록, 통합 준비를 기존 Windows 개발 환경으로 이어받았다. 기준 HEAD는 `878ad84`(cloud/ide-integration merge)이며 VSIX는 변경하지 않았다. 기존 사용자 창/profile/trust를 조작하지 않았고 GUI·Computer Use·배포 패키징·새 도구 설치·commit/push는 수행하지 않았다.

## 발견과 보완

1. **기존 분석기 overlay migration 누락.** Windows upstream의 `extensions/rtl-language/dist/analyze.py`는 초기 `85ba1fe` 커밋의 분석기와 줄바꿈 정규화 후 완전히 일치했다. 해당 소유 원문의 LF/CRLF SHA256만 `source-overlay.json.previousSha256s`에 추가했다. unknown 파일을 허용하거나 guard를 제거하지 않았다. 모든 파일을 검사한 뒤 적용하는 기존 방식을 유지한다.
2. **Windows Python 준비 알림 CRLF.** package-session이 `RTL_PACKAGE_READY_V1\n`만 인식해 Windows의 `\r\n`을 놓치고 15초 후 취소됐다. bounded notification buffer에서 LF/CRLF를 모두 인식하도록 수정했다. 실제 Python이 CRLF bytes를 보내는 회귀를 추가했다. Core 승인·요청 identity·test compilation·취소/join 경계는 유지한다.
3. **Windows legacy lease 파일 보호.** 기존 일반 파일 형태의 `import-review.lock` 앞에 Windows rename을 시도하면 다른 플랫폼과 달리 파일을 대체할 수 있었다. 게시 전에 lstat로 기존 일반 파일/링크를 확인해 거절한다. 기존 lease 회귀에서 파일 bytes 유지·unknown/live/link·종료 후 fresh owner를 검사한다. 이 사전 검사를 임의 외부 writer와의 filesystem CAS/전원 장애 보증으로 표현하지 않는다.
4. **NTFS 열린 child handle.** previous.toml이 열린 동안 parent transaction 보관 이동이 EPERM으로 거절되는 실제 동작을 확인했다. 제품은 partial archive와 active record를 이미 보존하며 lock을 반환한다. Windows 회귀는 거절→열린 handle 지연 쓰기→active recovery 감지·현재 manifest 불변을 검증한다. POSIX 회귀는 기존 archived handle 지연 쓰기를 유지한다. Windows에서 이동 성공을 강제하거나 파일을 복사/삭제하지 않는다.
5. **링크 fixture 권한.** 일반 Windows 사용자는 symlink 생성 권한이 없을 수 있다. TB 폴더와 journal candidate의 보호 회귀는 Windows에서는 실제 junction, POSIX에서는 원래 symlink로 검증한다. candidate junction 바깥 bytes가 보존되는지 확인한다. Windows 파일 symlink 자체의 새 수용으로 주장하지 않는다.
6. **검증 artifact 준비.** 언어 inputs/process/scale 검사가 ignored `.dev/cloud`의 기존 존재를 전제했다. 각 기록 작성 경로가 폴더를 준비하도록 수정했다. Git 제외된 cloud artifact나 baseline을 제품 입력으로 사용하지 않는다.
7. **승인 거절 검사 수명 경쟁.** 고의로 continue.json 경로에 directory를 만든 검사에서 Python이 directory read 오류로 먼저 종료한 뒤 taskkill이 128을 반환할 수 있었다. fixture를 준비 알림 이후 명시적으로 hold해 실제 살아 있는 compiler의 게시 거절→taskkill/join→fresh retry를 검증한다. 제품 cleanupFailed 처리를 약화하지 않는다.

## 실행 근거

모든 로그는 `ide/.dev/windows-cloud-return/`이며 Git에 포함되지 않는다. 실제 source/config/tests와 이 문서가 재현 계약이다.

| 검사 | 현재 결과와 근거 |
|---|---|
| 기존 환경 | doctor PASS: Windows x64, Node24.18.0, pinned Code-OSS/독립 Git metadata, 기존 MSVC2022 및 build Python3.14.8. 설치 없음 |
| runtime/language | 최초·보완 후 TypeScript build PASS, `runtime-fixed.log`, `language-fixed.log` |
| overlay/bundles | 소유 hash 대조 후 guarded migration·runtime/language 배포용 개발 bundle 준비 PASS, `prepare.log`, `prepare-final.log` |
| 공식 본체 | pinned 공식 TS7 whole source 타입0 errors·owned emission0 errors/exit0, `owned-build.log/.exit0`. Code-OSS native dependency 전체 재설치·전체 제품 packaging과 구분 |
| actual Node channel | 최종4묶음 PASS/exit0: TB dispatch/stale/missing/untrusted·두 top/삭제/제외 복원·자동 tool0, explicit close/cleanup failure·disconnect/dispose. `channel-final.log/.exit0`. 창 사이 native Electron IPC는 아님 |
| 첫 전체 | 331개:270 PASS/55 FAIL/6 POSIX SKIP,396.6초. 일부 신규 시험에 필요한 `RTL_SEMANTIC_PYTHON` 미지정과 실제 Windows 결함 포함. `tests.log/.exit1` |
| 1차 보완 전체 | 337개:327 PASS/4 FAIL/6 POSIX SKIP. CRLF 회귀1개 추가, verified Python env 지정. 남은4 실패는 artifact 경로3·fixture 종료 경쟁1. `tests-fixed.log/.exit1` |
| 실패 분리 | 1차6개 PASS, `fixes.log/.exit0`; 2차4개 PASS, `fixes-second.log/.exit0`. 전체 결과로 합산하지 않음 |
| 최종 전체 | **337개:331 PASS/0 FAIL/6 POSIX SKIP**,241.5초/exit0. 최종 source/tests에서 순차 실행. `tests-final.log/.exit0` |
| 실제 Windows Verilator | 두 예제×VCD/FST **4회 PASS**·input/trace hash·원본 RTL 불변·고유 run·`.rtl` 격리 확인. `simulation.log/.exit0`, private `.dev/h3a-real-j6Grgb/receipt.json`. 파형 화면은 열지 않음 |
| Windows OS 이벤트·규모 | 아래 private workload PASS/exit0, `tb-catalog-elevated.log/.exit0`. 첫 제한 sandbox 실행은 realpath EPERM 후 testList 미생성으로 실패했으며 `tb-catalog.log/.exit1`에 보존 |

자동 시험의 semantic runtime은 기존 verified `slang-11.0.0-python-3.14.7/python.exe`를 명시적으로 사용했다. build Python과 semantic Python을 혼동하지 않는다. Windows에서 기존6개의 POSIX 전용 cleanup failure 주입/leader 종료 검사는 skip이며 Windows failure injection 수용을 대신하지 않는다. Windows batch 검사는 실행 대상이다.

## Windows private 목록 workload

`verify-tb-catalog.mjs`의 실제 Windows recursive Node watcher→production Core/host를 실행했다. workbench event forwarding/debounce는 여전히 진단 모델이다. 실제 Code-OSS FileService/LanguageClient/native transport/화면은 별도다.

- 실제 OS event14개→refresh6회. TB file rename, 등록 폴더 밖 이동, 빈 폴더 재생성, delete 반영 PASS.
- 300 RTL+100 TB files/202 test rows, 20회 add/delete 반복, compiler/simulator0, history0, TOML/rtl-tests.json bytes 불변, idle500ms notification0, double close PASS.

| 관측(동시에 전체 회귀 진행) | 중앙값 | max |
|---|---:|---:|
| Core load5회 |479.6ms|495.4ms|
| host refresh5회 |495.4ms|536.1ms|
| add+delete 두 refresh20회 |862.8ms|1157.0ms|

반복 후 GC heap 약9.05MiB/RSS 약179.0MiB. 합성 fixture의 한 실행이며 단독 baseline·장기 누수·전체 앱 CPU/RSS·물리 반응성 수용이 아니다. cloud 숫자와 성능 개선율을 산출하지 않는다. startup/idle/edit/파형·대표 실제 설계는 여전히 미확보다.

## 재현(ide에서, 창을 열지 않음)

```powershell
$env:RTL_SEMANTIC_PYTHON = Join-Path $env:USERPROFILE '.rtl-dev/tools/slang-11.0.0-python-3.14.7/python.exe'
npm run build:runtime
npm run build:language
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/verify-channel-cleanup.mjs
node --expose-gc scripts/verify-tb-catalog.mjs
```

소유 patch/bundle을 준비한 뒤 공식 본체 emission/type은 `ide/upstream`에서 `node --experimental-transform-types ../scripts/compile-owned.mts`. 환경 sandbox가 기존 도구/realpath를 막으면 승인된 실행 범위에서 검사하고 제한 실패를 제품 오류나 성공으로 바꾸지 않는다.

## 남은 순서

[H7 통합 우선순위](ide-h7-integration-gates.md)에 따라 P0의 추가 Windows taskkill/cleanupFailed quarantine·NTFS 외부 writer 최종 경쟁·장기/복구와 P1 실제 native watcher/LanguageClient/IPC를 구분해 이어간다. 일반 Node/IPC+NTFS 시험 통과를 native workbench 전체 수용으로 올리지 않는다.

Computer Use와 화면을 차지하는 native 앱 검증은 **마지막 하나의 통합 세션**에 누적한다. Code↔Simulation·개별/선택/전체 Run/Cancel·TB 추가/삭제/제외·과거 source/diff/파형/preset·키보드/hover/DPI·dirty/trust/복구·장시간 실제 설계 baseline을 묶는다. clean Windows 별도 환경 없음, FST 내장 표시/파형 enum·전체 disk 정리 정책은 기존 잔여다. H7/베타/배포 전체 완료로 선언하지 않는다.
