# Windows 실제 앱·화면 통합 수용 (2026-10-13 KST)

사용자에게 시작 전 알린 뒤, 기존에 직접 신뢰한 `ide/.dev/import-ui-dbJf2o` 전용 창에서 마지막 통합 세션을 진행했다. 사용자 다른 창/profile/trust를 변경하지 않았다. `computer-use`의 공식 sky API로 물리 입력을 수행했고 보안 설정·터미널 UI·사용자 인증을 조작하지 않았다. 창은 Alt+F4로 정상 종료됐다.

## Native workbench 수용

`scripts/verify-import-ui.mjs verify-integrated`와 `tests/native/integrated.cjs`를 추가했다. 한 일반 development host에서 native FileService→home→shared-process→Core를 검증하고 보관 source/diff·actual Verilator/internal waveform 검사를 연속 실행한다. 기존 H6 검사를 재사용하되 이번 receipt를 별도로 보존한다. 준비된 소유 fixture만 받으며 trust를 복사/주입하지 않는다.

**11개 확인 PASS, trusted:true, 정상 exit0.** Native receipt와 단계별 기록은 `.dev/windows-integrated/native-receipt.json`, `native-exit.json` 및 fixture의 `integrated-*.json`. 기존 receipt/log/exit는 `before-*`로 보존했다.

- 실제 native watcher가 두 module을 독립 TB로 추가·rename/delete·빈 child 폴더 재생성을 반영했다. 감지 후 별도 refresh/Run을 호출하지 않았고 history/log/원본 TOML·source·선택 JSON이 유지됐다.
- 선택한 과거 saved run의 명시적 matching/dirty 무효화/changed/현재 source diff·삭제 파일 무생성, 원형 복구 후 matching/최신 이력 보존.
- 보관 source picker→실제 SystemVerilog readonly editor·typing/provider 쓰기 거절·원문 hash/삭제 원본 대응·같은 run 파형.
- GUI runner의 actual Verilator 실행이 기존 dump와 managed VCD를 함께 만들고, 결과가 managed trace만 선택했다. 내장 viewer 정렬·이전 run 탭과 원본 bytes가 유지됐다.

## Computer Use 직접 조작

표준 desktop 창에서 직접 확인했다. 아래와 다른 DPI/테마/크기의 수용으로 일반화하지 않는다.

| 동작 | 관찰 |
|---|---|
| Simulation 홈/행 checkbox | 선택 실행 버튼 활성화·선택 행 유지 |
| 선택 실행→취소 | running→cancelling→cancelled, 실행 버튼 재활성화; actual 기록 tb.first cancelled |
| 전체 실행 | 두 테스트 순차 PASS(15.1초/15.7초), 같은 홈 유지 |
| 로그 아이콘→scroll | 해당 tb.second 실행 로그 패널 표시 |
| 기존 파형 탭 | 취소·새 결과 후 이전 run waveform 유지 |
| Cursor |599ps에서 ruler와 waveform 수직선 정렬 |
| 8bit bus | 펼침/접기, 각 bit의0/1 표시 |
| 신호 drag | VALUE를 y 위로 이동, 시간/cursor 유지 |
| Code→Simulation | 원문/보관 editor 구분, 파형599ps·순서·탭 복원 |
| 전용 창 종료 | 정상 exit0, readonly source 포함; 같은 workspace의 trust 유지 |

직접 조작 기록은 `.dev/windows-integrated/physical-receipt.json`. screenshots는 Computer Use 반환 화면을 관찰했으며 별도 캡처 파일로 저장하지 않았다. fixture history29→33: native tb.second PASS1·physical tb.first Cancel1·All PASS2. 이전 보관 source/trace는 삭제하지 않았다.

## 발견과 한계

첫 개발 창에서 **extension host did not start in 10 seconds** 경고가 나타났다. 실제 extension host는 이후 시작했고 통합 단계들은 통과했다. main 시작22:07:03 KST→local extension host 시작22:07:55→extension host 로그22:08:09→검증 extension 활성화22:08:25. 무응답/응답 전환도 관찰했다. 이전에도 간헐 startup 지연이 있었지만 같은 원인이라고 확정하지 않는다. 이는 사용자에게 약속한 가벼움의 열린 병목이며 packaged build의 cold/warm baseline과 분리해 추적한다. 경고를 없애기 위해 timeout을 늘리거나 성공 판정을 숨기지 않았다.

DPI/고대비·작은 창, Ctrl/Shift 그룹 drag, 긴 절대시간 물리 보기, 실행 중 앱 종료/미저장 dialog의 실제 승인·취소, 대표 실제 설계/장시간 메모리·clean Windows 설치는 이번 화면 범위에서 미확인이다. 이 세션의 PASS는 **핵심 개발 흐름 수용**이며 H7 전체/안정판/설치 제품 수용이 아니다. FST 내장 표시·파형 enum·전체 disk 정책도 기존 잔여다.

## 다음: 내부 베타 배포 준비

사용자가 화면 검증 뒤 빌드·배포 준비를 요청했다. 우선 Windows x64 portable 내부 베타를 대상으로 공식 pinned Code-OSS 배포 build를 시도한다. VSIX 프로젝트 배포를 새로 만들지 않는다. 제품 코드·내장 RTL extension/runtime/worker·license/notices가 실제 artifact에 들어가는지 확인하고, 개발 checkout/부모/VSIX 없이 동작하는지 smoke 검증해야 한다.

ZIP/해시·사용 안내·지원 범위/기존 startup 및 미검증을 준비하며, 검증되지 않은 개발 executable 복사본을 완성된 독립 배포라고 제공하지 않는다. clean Windows 별도 환경은 없으므로 기존 도구가 있는 스터디 내부 테스트와 새 환경 설치를 구분한다. 공식 build의 첫 출력 경로는 ide 안의 새 `VSCode-win32-x64`, 기존 출력이 있으면 자동 교체하지 않는다. 배포 artifact 실행 화면 확인은 시작 전에 다시 알린다.
