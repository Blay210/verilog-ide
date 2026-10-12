# H3G — 실행 이력 선택과 코드 변경 표시 (2026-10-10)

독립 IDE Simulation 홈에서 이전 실행의 로그·파형을 선택해 열고, 최근 실행과 현재 코드의 차이를 표시한다. 기존 Core의 retained history/input comparison을 IDE 소유 Node host에서 재사용한다. VSIX 변경·배포 패키징·설치는 없다.

## 사용과 구현

- 테스트 행에 실행 이력 선택 목록을 둔다. 기록이2개 이상일 때만 표시하며 날짜·결과·run ID 앞8자와 최근 실행을 구분한다. 선택한 이전 실행에는 **이전 실행**을 표시하고 로그·파형 버튼은 그 run ID를 사용한다. 실행 버튼은 해당 테스트를 새로 실행한다.
- 최신 결과를 기본으로 따른다. 사용자가 이전 run을 명시적으로 골랐다면 새 결과나 새로고침에도 선택을 유지한다. 삭제/조회 범위 밖 기록은 최신으로 돌아간다. 프로젝트가 바뀌면 선택을 비운다. 현재 등록된 name+top에 맞는 이력을 표시하며 전체 프로젝트의 최근100개 검증된 기록을 사용한다. 기록 자동 삭제/보존 설정은 이번 범위에 없다.
- 작은 △ 배지는 **최근 실행**의 저장 입력 비교를 나타낸다. `코드 변경됨`은 saved RTL/package/include/manifest 실행 설정 fingerprint가 달라졌다는 의미다. 동적 include·손상 identity·설정 오류/legacy 결과는 `비교 불가`로 표시한다. tooltip에 Core 비교 이유를 제공한다. 이전 실행을 고른 경우에는 별도의 `이전 실행` 결과 표기를 사용하며 모든 역사 run을 매번 재해시하지 않는다.
- 프로젝트 내 RTL/header/rtl.toml 미저장 working copy는 별도로 `미저장 변경`을 우선 표시한다. 이는 보수적인 프로젝트 알림으로 해당 테스트에 반드시 영향을 준다는 의미는 아니다. 저장 뒤에는 saved-input 비교로 바뀐다. source·manifest 자동 저장은 하지 않는다.
- 최초 로드·실행 완료·Simulation 진입·프로젝트 파일 변경에서 비교한다. 파일 이벤트는500ms debounce, `.rtl/`와 `.git/` 제외. 같은 host의 비교 요청은 합치고 revision/root가 달라진 오래된 결과는 적용하지 않는다. 실행 시작/프로젝트 변경/종료 시 비교를 abort하며 Core의 파일/byte 한도와 순차 읽기를 유지한다. 비교는 saved bytes 관찰이며 semantic 분석이나 실행 허가가 아니다.
- 과거 로그도 renderer가 경로를 지정하지 않고 name/run ID로 Node의 검증된 history에서 찾는다. 로그 tail64KiB 한도 유지. 과거 waveform은 기존 verified worker reader로 열고 탭 title/본문에 recorded run ID를 표시한다. 코드 변경·새 결과로 열린 reader를 교체하지 않는다. 신호 default/preset도 유지된다.

파일: `ide/runtime/host.ts`/`contract.ts`, `src/rtlSimulationChannel.ts`/`rtlSimulationHome.ts`/`rtlSpaces.contribution.ts`; core/history·identity 동작은 변경하지 않았다. IPC에서 raw identity files를 renderer로 보내지 않는다. 새 trust 설정/외부 extension/임의 경로 입력은 없다.

## 검증과 실패 근거

- 최종 전체 **54 PASS /0 FAIL /0 SKIP**, runtime 타입/build 성공. 기존53 + host history 비교 시험1: 두 run 로그 구분/unknown ID 거절/새 실행 보존·source 변경→matching 복원·설정 오류 unavailable·이전 로그 접근. 기존 실행/취소/worker/preset 회귀 포함.
- overlay 공식 emission + 전체 upstream 타입 **0 errors/exit0**. 최초 파일 이벤트의 `.changes` API 가정으로2 타입 오류. 실제 `rawAdded/rawUpdated/rawDeleted` URI API로 보완한 뒤 통과했다. 실패 log 보존.
- native fixture의 초기2회는 각각 입력 비교 완료 전 조회(`LGPQ4V`)와 workbench 명령 등록 전 시작(`oQxTtV`)으로 FAIL. 제품 경계를 약화하지 않고 시험이 공개 명령 등록/비교 완료를 제한 시간 내 기다리도록 보완했다. `b4TLNL`에서4항목 PASS:2개 history selector·matching·default bus+8bit9canvas/정렬·Code 왕복/동일run 재사용·미저장 badge→Save 이후 changed badge·기존 run/default 보존. trace는 synthetic fixture이며 마우스 실행이나 새 Verilator GUI E2E와 구분한다. 최종 abort 보완 후 native 재검증 결과는 아래 최신 근거로 기록한다.
- 물리 session `h3g-history`/창460836의 실제 H3C retained 프로젝트: basic history2개 목록 → 이전 `b6119f7e` 선택 → **이전 실행 PASS17.5초** → 로그의 동일run build 경로 → 파형의 동일run ID/기본 비트 보기·8bit 펼침 확인 PASS. 목록은 최근 `0191f81c`와 구분한다. 새 Run은 하지 않았고 fresh profile untrusted/Run 잠금 유지. 이 physical 앱에는 최종 비교 abort 직전 runtime이 로드됐지만 이력 UI/채널은 최종과 동일하다.
- 실제 preview 원본6개 해시 불변/retained run5개 유지. 시험에서 저장한 코드 변경은 전용 native fixture 안에서만 수행했다. screenshot은 Computer Use tool 관찰이며 별도 PNG로 저장하지 않았다.

최종 abort 보완 runtime의 native **UpFkgw4항목 PASS/exit0**도 확인했다. 위 b4TLNL과 동일 범위를 재수용했으며 열린 reader/run/default9행이 저장 이벤트 뒤에도 유지된다.

ignored 근거: `ide/.dev/h3g-tests.log`/exit, `h3g-tests-final.log`/exit, **h3g-tests-complete.log/exit**, `h3g-build.log`/exit(최초), **h3g-build-final.log/exit**, `h3g-native.log`/exit 및 `editor-acceptance-LGPQ4V/receipt.json`, `h3g-native-final.log`/exit 및 `editor-acceptance-oQxTtV/receipt.json`, `h3g-native-settled.log`/exit 및 `editor-acceptance-b4TLNL/receipt.json`, **h3g-native-complete.log/exit** 및 `editor-acceptance-UpFkgw/receipt.json`, `h3g-preview.log`, `h3g-integrity.json`.

## 다음 지점과 한계

H3의 **편집 기능 이식**을 다음 구현 순서로 잡는다: IDE 소유 Verilog/SystemVerilog 언어 등록·highlight/snippets/기본 lexical 편집부터 검증하고 이후 semantic module/port/scope와 도구 설치 승인 UI를 연결한다. 기존 Core/실행/파형 회귀를 유지한다. 설치가 필요하면 기존 승인 범위를 확인한다. 자체 엔진·Diagram을 이번 앱에 임의로 추가하지 않는다.

H4 전체 완료가 아니다. 과거 run 자체의 개별 stale 비교, 전체 이력 삭제/자동 정리·열린 reader 보호, 대규모 변경 비교 비용/연속 저장·닫기 stress, 세부 물리 preset 관리와 Ctrl/Shift 그룹 드래그/긴 시간 화면·새 GUI Run 중 과거 탭 보존 수용이 남는다. 지금은 저장된 코드 실행이며 자동 dump/미저장 snapshot은 H6이다. FST 내장/enum/light theme, H5 discovery/폴더 역할/multi-top, H7 재시작/규모 및 기존 H1/H2/clean Windows gate도 유지한다. 독립 앱 베타·배포 완료 판정은 아니다.
