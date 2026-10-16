> 2026-10-15 최신: [첫 조회 비용·Simulation UI 지연 구성·독립 로컬 built 실행본](pulse-performance-final.md)을 적용했다. 전체405 PASS/1 POSIX SKIP와 후속8 PASS·공식 bundle/파일/CLI를 확인했다. 기존 Setup은 이전 버전이며 최신 실행은 `ide/Start-Pulse.cmd`다. 실제 새 화면/Windows startup·부분 compiler 증분은 잔여다. 아래의 소스 개발 실행/모든 첫 조회 비용 미보완 설명은 이전 기록이다.

# Pulse 변경 후 분석 프로세스 재사용 (2026-10-15)

[편집 예약 분리](pulse-edit-scheduling.md)에 이어, 실제 built-in의 source 편집 후 동일한 Python/slang 프로세스에서 새 compiler 모델을 구성하도록 연결했다. 이는 E1의 worker 수명과 문서 generation 분리 단계다. 기존 모델 조회 캐시는 같은 revision 안에서 유지하고, 새 revision은 이전 compiler 객체·범위/enum/좌표 캐시를 해제한다. **변경 부분만 parse/elaborate하는 compiler 증분 처리는 아직 구현하지 않았다.**

## 구현과 사용자 동작

- 입력 중 basic 추천과400ms/구문 완료120ms 예약 정책을 유지한다. 최신 작업 하나를 모으고, 준비되지 않은 정밀 결과는 게시하지 않는다. 실행 중 전체 분석을 입력마다 강제 종료하지 않는다.
- idle 뒤 새 입력을 준비할 때 기존 worker의 root·Python·bridge·cache identity와 사용 가능 여부·한도를 확인한다. 조건을 만족하면 프로세스를 다시 시작하지 않고 새 모델을 준비한다. watch 등록 후 확인 재분석도 같은 worker를 사용할 수 있다.
- 각 모델은 새 SourceManager/SyntaxTree/Compilation/default elaboration을 사용한다. 이전 모델은 새 모델 구성 **전에** 해제하고 Python GC를 수행한다. source 순서·macro·include·독립 test context 의미를 보존하며 finalized Compilation을 수정하지 않는다.
- bootstrap은 소유 cache leaf의 `input.json`, 후속 입력은 고유 `model-<id>.json`을 완전히 쓴 뒤 작은 stdin 명령으로 전달한다. 응답 후 임시 model 파일을 지운다. Python은 같은 소유 디렉터리의 정확한 파일 이름과 실제 경로만 허용한다. 프로젝트 Python이나 시뮬레이션을 실행하지 않는다.
- 모든 요청/응답은 id와 model revision을 확인한다. 예상하지 못한 종류/버전/응답·잘못된 JSON은 worker를 닫아 실패 처리한다. 진행 중 이전 query는 새 revision으로 바뀌면 최신 결과로 반환하지 않는다. LSP도 문서 version/generation을 계속 검사한다.
- source 편집과 달리 외부 header·설정/파일 감지·root 제거·종료는 기존 강제 무효화/정리를 유지한다. source 모델을 준비하던 중 hard event가 발생해 아직 공개 session이 없더라도 실제 open/cleanup을 기다린 뒤 새 프로세스를 시작한다.
- 자동 package 순서는 매 모델마다 Core의 dependency 검증과 정렬을 거친다. 이 검증은 별도 프로세스를 사용할 수 있다. 따라서 자동 package 프로젝트의 모든 compiler 프로세스 시작이1회로 줄었다고 주장하지 않는다.
- 저장에 따라 들어오는 파일 watcher 이벤트도 현재의 보수적인 hard 무효화 경로를 따른다. source 편집 중 재사용과 구분하며, 같은 내용의 저장 알림 중복 제거는 외부 변경을 놓치지 않도록 후속 검증할 대상이다.

## 취소와 자원 경계

- 실제 interactive worker는 root 수명 신호와 각 분석/조회 요청 신호를 분리한다. 추천 요청 하나가 취소되면 해당 호출은 즉시 끝내고 다른 요청과 worker는 유지한다. 아직 Python이 처리 중인 취소 요청은 실제 응답 또는 deadline까지 슬롯을 점유한다. 숨은 무제한 큐를 만들지 않는다.
- query 슬롯32개·각 wire 요청15초 deadline을 유지한다. 취소된 호출도 deadline이 남아 멈춘 worker를 종료한다. rebuild 취소·root 종료는 실제 leaf 종료를 확인한다. 자동 package 사전 검증은 기존 별도 deadline을 가지므로 전체 작업 시간이 항상15초 이하인 것은 아니다.
- worker 최대2개·독립 context 최대4개/context source2048개·관측 source32MiB/working set512MiB·유휴120초를 유지한다.64회 rebuild 뒤에는 다음 모델 준비 때 worker를 교체한다(초기 모델 포함 최대65개). 초기 parse의 순간 메모리 peak를 OS 수준으로 하드 제한하는 기능은 아니다.
- 위2개는 유지 worker 수다. Core 자동 package 검증은 SemanticWork 최대2개의 활성 작업 안에서 별도의 일회성 프로세스를 사용하므로 전체 OS 프로세스 수가 항상2개 이하인 것은 아니다. 사전 검증 동안 이전 모델이 잠시 남을 수 있어 실제 대형 package 설계의 peak도 후속 측정한다.
- 한도/지원 조건을 벗어나거나 유휴 종료된 worker는 정리를 확인하고 기존 일회성/새 worker 경로를 사용한다. 정리 실패는 새로운 분석과 조회에서 확인해 교체를 차단한다. fallback으로 오래된 모델을 반환하지 않는다.
- 기존 내부 LSP 클라이언트에서 interactiveEditing을 지정하지 않은 경우의 세션 교체·질의 취소 계약을 유지한다. 제품 built-in만 interactive 경로를 사용한다. VSIX/Core/CLI/시뮬레이션 동작은 변경하지 않았다.

## 변경 파일

- `ide/language/src/analysis-session.ts`: worker identity/revision·rebuild·ticket별 deadline·취소된 query의 bounded 유지·횟수 재활용.
- `ide/language/python/analyze.py`: editor session의 rebuild 프로토콜·이전 native 객체/인덱스 해제·새 독립 compiler 모델.
- `ide/language/src/server.ts`: source 편집의 worker 유지·hard invalidation/준비 중 cleanup 합류·한도 밖 fallback·query 전 cleanup 실패 검사.
- `ide/tests/analysis-session.test.mjs`, `semantic-inputs.test.mjs`: 실제 slang·LSP·프로세스 수명/최신성·합성 성능 비교.
- `ide/config/source-overlay.json`: 수정 전 owned/upstream Python bytes 일치를 확인한 후 허용 hash를 기록했다. 미확인 upstream 파일을 덮어쓰는 우회는 사용하지 않았다.

## 비화면 검증과 측정

초기 통합45 PASS/0 FAIL/0 SKIP(`ide/.dev/windows-integrated/pulse-worker-rebuild-integration.log`)에서 다음을 확인했다. 이후 준비 중 프로세스 cleanup 합류/한도 검사와 취소된 wire 요청의 실제15초 deadline 검증을 보강했다.

- 같은 PID에서 source buffer·include macro·define·waveform mode·독립 test top/삭제 context가 바뀌고, 결과가 fresh compiler 조회와 정확히 일치한다. 원본 파일은 저장하지 않는다.
- query 하나 취소 시 다른 query와 worker가 살아 있으며,32개 취소 대기 이후 추가 query를 거절한다. root 종료는 held query를 포함해 실제 PID/cache를 정리한다.
- query 도중 rebuild가 시작되면 이전 결과를 superseded로 거절한다. rebuild 취소는 실제 leaf 종료를 확인한다. 잘못된 응답 revision은 거절/정리하고 새 정상 session으로 복구된다.
-64회 rebuild 뒤 재사용을 거절한다. 다른 project identity를 재사용하지 않는다. 모델 입력 파일이 쌓이지 않는다.
- 실제 LSP의 이미 준비된 worker에서 rebuild를 멈춰 두고 추가 편집을 여러 번 보내도 OS 프로세스가 늘지 않는다. 이전 version은 Ready로 알리지 않고 마지막 version의 이름만 추천하며 종료 시 cache/프로세스를 정리한다.

최종 Windows200파일/약16.7KiB RTL 합성 비교4회에서 모델 준비 중앙값은 새 worker 약502ms, 재사용 약333ms였다. rebuild 후 첫 정밀 조회는 약190~262ms로 별도 비용이 남았다. 유지 worker는 프로세스1회/모델5개(초기+갱신4개), 관측 peak working set38,973,440bytes(약37MiB)였다. 원시값: `ide/.dev/windows-integrated/pulse-worker-rebuild-measurement.json`. 초기 통합의 약496/329ms와 같은 조건에서 다시 측정한 최종 값이다. 이 검사는 작은 모듈200개이며 복잡한 실제 수백 파일 설계·물리 편집기의 최초 추천 시간·CPU/RSS 장기 수용을 대신하지 않는다. 속도 배수나 절대 응답 시간의 제품 보장으로 사용하지 않는다.

최종 전체 회귀 **401건:400 PASS/0 FAIL/1 POSIX SKIP**, 약348초·exit0: `ide/.dev/windows-integrated/pulse-worker-rebuild-all-tests.log`. 초기39/15/45건 및 직전391건과 중복되므로 합산하지 않는다. 실제15초 deadline 후 취소 query가 남긴 PID/cache 종료, warm LSP의 여러 편집/구 generation 폐기, 기존 package/input/root/cancellation 및 simulation/history/복구/파형 회귀도 통과했다. 이번 최종 전체에서 실패한 테스트는 없다.

최신 언어 build0(`pulse-worker-rebuild-language-final.log`)/guarded overlay/언어 bundle·compiled language 정책/diff 검사,9자산 최신 launcher prepare/check(`pulse-worker-rebuild-launch-check.log`)가 통과했다. 본체 native 소스는 이번에 변경하지 않아 전체 upstream 타입/owned emission은 직전0 errors 근거를 유지한다. 최신 실행은 `ide/Start-Pulse.cmd`다. 화면/Computer Use·앱 시작/Setup/배포는 실행하지 않았다. 기존 Setup/ZIP에는 이번 변경이 없다.

## 다음 작업과 인수인계

1. **최신 모델의 최초 정밀 조회 비용**을 나눠 측정한다. scope/name inventory·타입/enum 표현·전체 진단/모든 test traversal 중 지배 항목을 확인하고 E2/E4를 적용한다. 단순히 이전 scope/좌표/타입을 새 코드에 재사용하지 않는다. pending 중 explicit definition/code action이 비어 재시도가 필요한 동작도 UX 검토 대상으로 유지한다.
2. 긴 obsolete 분석의 bounded 선점 정책을 검토한다. 현재는 실행 중 모델 작업이 끝나거나 deadline에 도달할 때까지 최신 작업이 기다릴 수 있다. 마구 취소/재시작하는 방식으로 되돌리지 않는다.
3. E3 compilation unit 단위 SyntaxTree 재사용은 macro/include/package/순서·미저장 buffer의 무효화 검증 후 진행한다. 이번 worker 재사용을 compiler 자체의 부분 증분 완료로 요약하지 않는다.
4. 앱 시작 S1/S2: 최적화 실행본/cache 및 startup 계측·필수 provider와 실제 Simulation UI import 분리를 별도로 진행한다. recorded source provider의 editor restore 전 등록 경계를 유지한다.
5. 실제 Windows 추천 목록의 표시/선택 안정성·대형 프로젝트 CPU/RSS·오래된 응답/공간 전환 UI·최초 시작은 사용자 승인을 받은 마지막 통합 화면 세션에서 확인한다. 기존 창·프로필·신뢰 설정은 보존한다. 새 Setup/ZIP은 요청 전 만들지 않는다.
