# H3E — 내장 파형 실제 조작 검증과 시간 이동 수정 (2026-10-10)

H3D의 독립 IDE 소유 VCD 화면을 실제 Windows 마우스/키보드로 확인했다. **Go 시간 이동이 미동작하는 결함을 발견하고 수정했다.** VSIX 코드는 변경하지 않았고 배포 패키징도 하지 않았다.

## 수정 내용

`ide/waveform-ui/waveform.ts`의 시간 이동은 form submit에 의존했다. 실제 Go 클릭 후 35 ns 입력에도 커서가 24.881 ns에 머무르는 것을 재현했다. 내장 iframe은 `allow-scripts`만 허용하므로 form 제출에 의존하면 안 된다. 버튼을 `type=button`으로 바꾸고 직접 시간 이동 함수를 호출하며, 입력의 Enter도 기본 제출을 막고 같은 함수를 호출한다. sandbox/CSP/trust 정책을 변경하지 않았다. 고정 HTML/client 자산을 다시 생성한 후 탭을 닫고 재열어 수정본을 수용했다.

## 물리 수용 범위

개발 session `h3e-waveform`, 프로젝트 `ide/.dev/h3b-preview`, 새 창2228428에서 Computer Use로 확인했다. 기존 H3C Verilator 결과를 read-only로 열었으며 이번에 새 Verilator GUI 실행을 한 것은 아니다. 이 새 profile은 신뢰되지 않은 상태여서 Run 잠금이 정상 유지된다. 과거 profile의 trust를 복사하거나 자동으로 설정하지 않았다.

| 항목 | 실제 관찰 | 결과 |
|---|---|---|
| 홈 → basic 파형 버튼 | run `0191f81c-4262-4a99-afb1-2dd2b5cfd442`, 6개 signal 선언/기본3개 채널, 41 ns | PASS |
| count[7:0] 펼치기 | bus 유지 및 [7]~[0] 8개 행 | PASS |
| 파형 클릭 커서 | 24.881 ns, count=0x01, clk=0/rst_n=1; ruler와 row 선 정렬 | PASS |
| Go 버튼 | 최초 미동작; 수정 후 35 ns, count=0x03/clk=1 | 수정 후 PASS |
| 시간 입력 Enter | 25 ns, count=0x02/bit[1]=1/bit[0]=0 | PASS |
| bus 드래그 순서 변경 | count와 펼친8비트가 함께 clk 앞으로 이동 | PASS |
| Zoom in | 14.75~35.25 ns, 25 ns 커서/눈금 정렬 유지 | PASS |
| Code → Simulation | 같은 run·25 ns·확대·bus 펼침·순서 유지 | PASS |
| 다른 파형 탭 | reset `b8852906-6fe2-4188-a621-86151c0bf1c8`, 6개 선언/기본3채널/41 ns; basic 복귀 시 기존 상태 유지 | PASS |
| Signals에서 rst_n 제거/추가 | 3→2→3 채널; 파형 행 삭제/복귀, 나머지 상태 유지 | PASS |
| Zoom range 드래그 | 19.564~28.76 ns로 확대; 절대 눈금과 25 ns 커서 정렬 | PASS |
| Fit | 0~41 ns 복귀, 25 ns·bus·순서 유지 | PASS |
| 탭 닫고 재열기 | 홈 복귀 및 같은 run 재열기 성공; 닫은 탭의 임시 UI 설정은 기본으로 초기화 | PASS |

물리 스크린샷은 이번 도구 응답의 관찰 근거이며 별도 PNG 파일로 저장하지 않았다. 자동 native fixture와 구분한다. 오래된 UIA element가 화면 전환 뒤 유효하지 않은 경우 새 상태/좌표로 재관찰했으며 제품 실패로 집계하지 않는다.

## 자동 회귀와 파일 보존

- 전체 `npm test`: 최종 **51 PASS /0 FAIL /0 SKIP**, runtime 타입 빌드 성공. `tests/waveform-host.test.mjs`를 보강해 같은 테스트의 새 실행에서 새 waveform 경로/reader/값이 분리되고 기존 reader 값과 원본 VCD bytes가 유지됨을 확인한다. mock backend+실제 Core/worker 검사이며 GUI 새 실행 수용이라고 표현하지 않는다.
- `npm run verify:waveform-ui`: native fixture **blTGbN**, 2개 검증 항목 PASS/exit0. 실제 iframe 실행·IPC·canvas2/눈금 정렬·Code 왕복/동일 run 탭 재사용을 확인한다. trace는 synthetic fixture다.
- 실제 preview의 source/manifest/README/.gitignore **6개 SHA256 불변**, retained run 디렉터리 **5개** 유지. `.dev/h3e-integrity.json`에 기록한다.
- 근거: `ide/.dev/h3e-tests.log`/exit, `h3e-tests-final.log`/exit, `h3e-native-waveform.log`/exit, `editor-acceptance-blTGbN/receipt.json`, `h3e-integrity.json`, `h3e-preview.log`. 제품 수정은 브라우저 파형 자산에 한정하므로 이번 upstream 전체 타입 검사는 재실행하지 않았다; H3D의 전체0 errors 결과는 이전 근거다.

## 다음 순서와 미수용

1. **테스트별 신호 프리셋/default 편집·저장**을 IDE 소유 runtime/IPC에 연결한다. run 탭별 임시 선택은 유지하고 프로젝트의 기본 보기는 명시적으로 저장한다. 기존 파형 화면을 다시 디자인하지 않는다.
2. 결과 이력/소스 변경 표시를 홈과 run 탭에 연결한다. 최신 결과가 생겨도 과거 탭을 교체하지 않는다.
3. Ctrl/Shift 그룹 드래그, 긴 절대 시간의 실제 IDE 화면, 새 GUI 실행 중 이전 파형 탭 보존은 추가 수용으로 남긴다. 기존 모델 회귀 또는 Core/worker 시험을 물리 수용으로 대체 표기하지 않는다. 새 profile의 실제 Run 검증은 사용자가 직접 신뢰한 뒤 진행한다.

FST 내장 표시, 소스 enum 매핑, light theme, 언어 지원/도구 설치 UI 이식은 여전히 미완료다. H5 discovery/폴더 역할/multi-top, H6 snapshot/자동 dump, H7 재시작/규모, H2/H1 잔여 및 clean Windows 검증을 유지한다. H3/H4 전체 완료·베타 준비·배포 판정이 아니다. 첫 독립 앱에 Diagram/debug를 넣지 않으며 자체 엔진은 별도 논의한다.
