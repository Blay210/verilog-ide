# H3C — 독립 IDE 실제 Simulation 버튼 수용 (2026-10-10)

사용자가 전용 `h3b-preview - RTL IDE` 창의 프로젝트 신뢰 설정을 직접 처리했다. 그 창에서 Computer Use로 실제 버튼을 눌러 H3B의 열린 trusted GUI 실행 수용을 완료했다. 권한 설정 자동 변경이나 테스트 API를 통한 Run 대체는 하지 않았다. 이번 제품 코드 변경·재빌드·패키징은 없다. H3B의 43 PASS/전체 타입0 errors와 별개의 물리 수용이며 전체 H3/H4 완료나 베타 판정은 아니다.

## 실제 수행과 디스크 대조

| 동작 | 결과 | run ID | 실행 시간 |
| --- | --- | --- | --- |
| counter_basic 행의 실행 버튼 | PASS, VCD 생성 | b6119f7e-6fd3-4c06-9b40-525590a3c9a0 | 17.465초 |
| counter_reset 행 실행 → g++ 빌드 중 취소 | cancelled, UI 취소 표시, idle 복귀 | c02f54e0-b18d-40ed-9a73-dbf177251335 | 10.060초 |
| reset만 선택 → 선택 실행으로 재시도 | PASS, basic의 이전 결과 유지 | 3162d296-fdb7-4d3f-894a-8937bbbf1353 | 17.686초 |
| 전체 실행의 basic | PASS, 새 VCD | 0191f81c-4262-4a99-afb1-2dd2b5cfd442 | 17.846초 |
| 전체 실행의 reset | PASS, 새 VCD | b8852906-6fe2-4188-a621-86151c0bf1c8 | 17.694초 |

- 첫 개별 실행과 전체 실행 중 Code→Simulation 왕복을 실제 클릭했다. 전체 실행에서는 복귀 후 basic 빌드가 진행 중인 화면을 확인했다. 선택 checkbox·실행 상태·로그·완료 결과가 유지됐다.
- 취소 중에는 실행 버튼이 잠겼고 정리 후 다시 활성화됐다. 취소 후 읽기 전용 프로세스 조회에서 preview run 경로를 사용하는 빌드 프로세스가 없었다. 첫 sandbox CIM 조회는 접근 실패했으며 escalation의 동일 읽기 조회는 exit0/매칭0이었다. 임의 프로세스 종료는 하지 않았다.
- 전체 실행은 basic 완료 이후 reset 시작임을 result.json 시간으로 대조했다. 총5개 run 중4 PASS/1 cancelled이며 모두 독립 경로다.
- reset의 로그 버튼에서 최신 run `b8852906…`의 retained 로그와 `PASS counter_reset`를 확인했다. 새로고침 후 두 최신 PASS와 선택 상태도 유지됐다. 새로고침은 화면 로그를 비우는 현재 정책이다.
- 실행 전 프로젝트의 모든 `.rtl/` 밖 파일 목록/해시를 저장하고 완료 후 대조했다. 원본 RTL/TB/manifest/README/.gitignore에 추가·변경 없음. 생성물은 `.rtl/` 안에만 있다. 성공4회의 VCD가 모두 존재하며 timescale 헤더를 확인했고 이전 파형도 남아 있다. 파형 화면을 열어 확인한 것은 아니다.

ignored 재현 근거: `ide/.dev/h3b-source-before.json`, `ide/.dev/h3c-physical-acceptance.json`, `ide/.dev/verify-h3c-receipt.mjs`, `ide/.dev/h3b-preview/.rtl/runs/`의5개 result.json/run.log/VCD. receipt 검증 스크립트 exit0. GUI 화면은 Computer Use 도구 출력으로 관찰했으며 별도 screenshot 파일은 저장하지 않았다. 기존 untrusted native fixture `jMgYSd`의 executionAccepted=false 기록은 그대로 유지한다.

## 발견한 작은 한계와 다음 순서

취소 결과 tooltip에 `No waveform generated. Add $dumpfile/$dumpvars…`가 같이 붙는다. 실제 취소를 dump 코드 누락처럼 안내하는 부정확한 문구다. 상태/취소·재실행 기능은 정상이며 다음 파형 작업에서 취소/컴파일 실패/정상 종료 후 trace 미생성 안내를 구분한다. Verilator 설치본의 STDOUT_FILENO/STDERR_FILENO 재정의 warning은 발생했으나 이번4회 실행은 정상 종료했다.

다음은 **기존 내장 파형 parser/renderer/view를 IDE 소유로 이식하고 결과의 run ID와 연결해 열기**다. 이미 생성된 파일을 read-only로 읽고 이전 run을 보존한다. VSIX 폴더의 코드를 runtime import/link하지 않는다. 이식 출처·라이선스를 기록하며 Code/Simulation의 공간 상태와 공통 하단 panel을 유지한다. 이어 H4 이력/최신·이전 구분/stale badge, H3 언어·도구 설치 흐름, H5 자동 발견/폴더 역할/multi-top, H6 unsaved snapshot/자동 dump, H7 종료/재시작/규모를 진행한다. H2 물리 resize/auxiliary 상세, host 지연/audit, 별도 환경 없는 clean Windows gate도 남는다.

현재 앱은 `.dev/h3b-preview`를 연 `RTL_IDE_DEV_SESSION=h3b-simulation` 검증 창이며 사용자 신뢰가 적용되어 있다. 최신 결과 화면을 남겼다. 다른 fixture/profile로 신뢰를 복사하거나 자동 승인하지 않는다. 실행 중 정상 닫기 dialog/강제 종료/재시작은 이번에 시험하지 않았다.
