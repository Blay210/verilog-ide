# H3A — 독립 IDE 실행 기반 이식 (2026-10-10)

Simulation 구현을 시작했다. 현재 화면은 여전히 placeholder이며 버튼 실행은 다음 연결 작업이다. 이번 결과는 IDE 내부 Node 실행 서비스와 개발 CLI의 결과다. H3 전체/베타/배포 완료로 표현하지 않는다.

## 진행 순서 판단

H2K의 기본 화면과 695×435 renderer 네 배치, 상태/즉시 입력 수용을 실행 기능 개발의 기반으로 사용한다. 남은 물리 resize·최종 다른 배치·auxiliary 상세는 삭제하지 않고 초기 앱 수용 전 확인 목록에 남긴다. 새로 발견한 미해결 실행 차단 결함은 없다. 독립 실행 서비스는 화면 배치와 별개로 개발/검증할 수 있으므로 H3A에 진입했다. H2 전체 완료를 선언한 것은 아니다.

## 구현과 소유권

- `ide/runtime/core`: manifest 검증/source 검색, 프로세스 실행/취소, 테스트 결과와 이력, 저장 입력 snapshot/identity, trace identity, 개발 예제.
- `ide/runtime/verilator`: Verilator 5+의 binary/assert/timing, VCD/FST/off와 Windows 경로 어댑터.
- `ide/runtime/toolchain/detect.ts`: 기존 도구 탐색만 이식. 설치는 하지 않으며 시스템 PATH를 수정하지 않는다. 도구 버전 probe도 취소 신호를 받도록 보완했다.
- `ide/runtime/simulation.ts`: GUI와 CLI가 공유할 Node 서비스. 설정/도구/중복 실행/사전 취소 오류를 구분하며 전체 또는 이름 목록의 순차 실행, 실시간 로그/결과 callback, 취소를 제공한다. manifest의 jobs 값에 관계없이 이번 서비스는 1개씩 실행한다.
- `ide/scripts/rtl.mjs`: 개발용 check/test 이름/test --all. 결과 JSON은 stdout, 로그는 stderr, 실패 시 exit1. check는 설정/소스 검사이며 실제 tool build 검증을 의미하지 않는다.

기존 MIT 코드의 일회 수동 이식이며 출처와 라이선스는 `ide/runtime/PORTING.md` 및 LICENSE에 있다. IDE 자체 npm dependencies/lock/TypeScript build/dist를 사용한다. 빌드·런타임·테스트에 vsix/상위 코드 읽기·import·workspace/file link가 없다. VSIX 파일은 변경하지 않았다. 문법/semantic/설치/파형 renderer/diagram은 아직 이식하지 않았다.

## 검증과 발견 사항

최종 IDE runtime 타입/빌드 성공, 자체 전체 **37 PASS / 0 FAIL / 0 SKIP**. 기존28개+새 실행9개: 한글/공백 경로, 중복 source, 순서/선택, retained 입력/변경 판정, 설정/backend 거절, 중복 실행, 실제 Node 프로세스 취소/timeout, 도구 오류·사전/probe 취소와 복구, CLI 설정/실패 종료, import/lock 경계, VCD/FST artifact 변조 거절. compile failure는 fake backend이며 Verilator 실패/자식 프로세스 전체 정리 수용을 대신하지 않는다.

현재 PC의 기존 MSYS2 UCRT64 Verilator 5.050을 사용해 counter_basic/counter_reset을 각각 VCD/FST로 총4회 실제 build/run PASS. 각 run의 saved input snapshot, trace hash/byte 수, 원본 RTL hash 불변과 `.rtl/runs/<test>-<uuid>` 격리를 확인했다. 파일 생성/identity 검증이며 파형 UI에서 보기까지의 수용은 아니다.

최초 verifier exit1: 기존 trace reader에 diagram 관측용 VCD 제한이 남아 FST 파일 검증을 거절했다. 실제4회 시뮬레이션 자체는 모두 PASS였다. 불필요한 diagram 제한을 제거해 VCD/FST의 파일 bytes/identity 검증으로 보완했고 변조 회귀를 추가했다. 기존 실패 receipt를 덮어쓰지 않고 동일 실제 생성물4개의 재검증 receipt PASS/exit0를 별도 보존했다. 이 reader는 최대32MiB이며 format parser/렌더러는 아니다; identity 생성은128MiB 한도다.

근거(모두 ignored private 개발 산출물):

- `ide/.dev/h3a-tests-final.log`, `h3a-tests-final-exit.txt`: 최종37 PASS/exit0.
- `ide/.dev/h3a-real.log`, `h3a-real-exit.txt`: 실제4회 로그와 최초 verifier FAIL/exit1.
- `ide/.dev/h3a-real-tHei6Z/receipt.json`: 최초 오류 보존.
- `ide/.dev/h3a-retained.log`, `h3a-real-tHei6Z/retained-receipt.json`: 보완 reader의4개 실물 재검증 PASS/exit0.
- `ide/.dev/h3a-cli-results.json`, `h3a-cli.log`, `h3a-cli-exit.txt`: 최종 CLI counter_basic FST 실제 build/run PASS/exit0, 약26.9초. 같은 설정/저장 입력의 서비스 FST 결과와 input fingerprint 일치 및 보완 reader의 trace bytes 재검증 PASS. 따라서 실제 실행은 총5회이며 위4회는 format×test 조합 검증이다.

기존 H2 Code-OSS workbench 소스는 이번에 바꾸거나 전체 재빌드하지 않았다. 따라서 H2K native 근거는 이전 수용 결과로 유지하며 새 Simulation GUI 수용으로 간주하지 않는다.

## 한계와 다음 실행 순서

1. **다음 H3B/H4A:** Node host 실행 서비스와 workbench 사이의 메시지/취소/수명 경계를 연결하고, Simulation 홈에 등록 테스트 목록·개별/전체/선택 Run·Cancel·결과/로그를 표시한다. renderer에서 filesystem/child process 직접 호출을 하지 않는다. 실제 버튼 실행과 화면 왕복 중 실행 유지부터 수용한다. 언어 기능 전부를 먼저 이식해야 실행 버튼을 만들 수 있는 구조로 묶지 않는다.
2. 기존 파형 renderer/view와 언어/semantic을 IDE 소유로 단계적으로 이식한다. 최신 결과와 과거 trace를 명확히 구분하고 파형 열기/실제 UI 수용을 연결한다. 도구 설치 계획/사용자 승인 UI도 필요하다.
3. 이번 slice는 저장된 명시적 manifest 테스트만 실행한다. package auto ordering은 provider가 없어 분명한 오류로 거절하며 manifest 순서만 허용한다. 소스 미저장 buffer는 아직 연결하지 않았다. snapshot은 기존 Core의 지원 범위이며 snapshot 준비 일부 실패 시 원본 입력 fallback 경고 정책도 이식 상태다; H6에서 IDE의 엄격한 입력 정책을 정리해야 한다.
4. 테스트벤치의 기존 dump 코드가 필요하다. IDE 자동 instrumentation은 H6에서 구현한다. 현재 native 실물 검증은 ASCII 프로젝트 경로이며 한글/공백 경로 실제 Verilator·assertion/compile failure·timeout/cancel tree·no trace·네트워크/설치 거절·clean Windows는 이후 실제 수용 항목이다.

개발 재현: `ide/`에서 npm ci → npm test (자체 runtime build 포함) → npm run verify:simulation (기존 도구 필요). 개발 CLI는 build 후 `ide/scripts/rtl.mjs`의 절대 경로를 프로젝트 cwd에서 호출한다. 일반 사용자의 터미널 작업을 최종 UX로 삼지 않는다. 패키징/배포 없음.
