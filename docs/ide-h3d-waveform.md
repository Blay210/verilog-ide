# H3D — 독립 IDE 내장 VCD 파형 연결 (2026-10-10)

Simulation 결과 행의 **파형** 버튼에서 실행별 내장 파형 탭을 연다. 기존 파형 renderer와 bounded VCD worker를 IDE 소유로 수동 이식했다. 파형 파일은 기록된 run/source/trace identity로 검증하고 별도 Node worker에서 읽는다. VSIX·상위 source runtime/build 참조, 사용자 extension 설치, 보안 정책 완화, 배포 패키징은 없다.

## 구현과 사용

- 새 개발 빌드에서 프로젝트 → Simulation → 완료된 결과의 파형 버튼. 최대4개 파형을 연다. 탭 제목에는 테스트 이름과 run ID 앞8자, 화면에는 전체 recorded run ID를 표시한다. 같은 run은 기존 탭을 선택하고 새 실행은 별도 탭으로 연다. 탭 닫기는 worker 종료를 기다린다.
- Simulation 홈 버튼으로 목록에 돌아간다. Code/Simulation 왕복 시 iframe·선택 신호·스크롤·cursor·zoom을 재생성하지 않는다. 새 결과가 생겨도 기존 reader는 실행 당시 읽은 내용을 유지한다. Reload는 같은 snapshot을 다시 표시하며 파일을 다시 읽거나 최신 run으로 교체하지 않는다. 재시작 복원은 H7 미수용이다.
- 기존 신호 검색/hierarchy 필터·정렬/다중 선택·bus bit 펼치기·색/표현 형식·cursor/zoom range·pan·Fit·큰/작은 눈금 및 절대 시간 분할 표시 코드를 유지했다. 중복 X 제거 및 cursor B 없는 기존 화면이다. 이 기능들의 모든 물리 interaction을 이번에 재수용한 것은 아니다.
- `.rtl/runs/`에 남은 결과만 이름/run ID로 연다. reader token은 창별로 분리되며 임의 파일 경로를 IPC로 받지 않는다. recorded waveform/source snapshot 검증을 거쳐 worker가 동일 bytes hash를 확인한다. 새로 열기에서 수정된 파형은 거절하며 이미 열린 reader는 immutable snapshot이다.
- 화면은 `allow-scripts`만 허용하는 sandbox iframe이다. 앱의 고정된 `waveform.html`만 읽으며 extension API 대신 제한된 parent message bridge를 사용한다. parent는 event.source가 등록 iframe과 같은지 확인하고 window/values/edge만 Node로 전달한다. parser는32MiB/1만 signal/100만 change 등 기존 제한과256MiB worker heap을 유지한다. renderer에 FS/process API를 주지 않는다.
- 취소/FAIL/timeout의 파형 미생성에 dump 코드 추가 안내를 덧붙이던 Core 문구를 보완했다. 정상 종료 후 파형이 없을 때만 dump 안내가 붙는다. 취소 회귀에서 이를 확인했다.

파일 소유권: `ide/runtime/waveform/`, `runtime/waveform-host.ts`, `waveform-ui/`, `render-probe.ts`; MIT 출처/범위는 `ide/runtime/PORTING.md`/LICENSE에 기록한다. 이식은 이번에 한 번 수행했으며 개발/빌드/테스트 스크립트는 IDE 안의 사본만 읽는다. Node worker와 HTML/client/CSS는 `prepare-runtime.mjs`가 IDE의 upstream/out에 생성한다. source overlay에 공유 waveform model을 추가했다.

## 실제 검증·실패 근거

1. 최종 runtime build 및 전체 **51 PASS /0 FAIL /0 SKIP**, exit0. 기존43 + reader integration1 + 수동 이식 ruler/bit 회귀7. 실제 worker load/hash/window/value/reader4개 제한/수정 거절/기존 snapshot/invalid query/close/dispose, 큰 BigInt 절대 시간·눈금 비겹침·bit X/Z/범위 포함. 최초 추가 test는 reader limit4 상태에서 FST 오류를 기대한 순서 오류로 FAIL했고 test 순서를 보완했다. 실패 log는 보존한다.
2. 최종 overlay 공식 emission과 upstream **전체 타입 검사0 errors/exit0**. `h3d-build-resource.log`가 최종이다. 이전 build도 통과했으나 srcdoc 로딩은 아래에서 실패했다.
3. compiled Node channel + 실제 H3C Verilator VCD 두 파일 읽기/query PASS: basic run `0191f81c-4262-4a99-afb1-2dd2b5cfd442`, reset `b8852906-6fe2-4188-a621-86151c0bf1c8`, 각각6개 signal/6개 window row. 새 Verilator 실행은 하지 않았고 H3C 생성물을 read-only로 확인했다.
4. native waveform fixture **TYZYUm**:2항목 PASS/exit0. 실제 renderer→shared process→worker→sandbox iframe에서2개 canvas와 cursor `0 ns`, ruler/row left 및 width 일치 확인. Code 왕복 후 동일 run/tab 보존, 같은 run 재열기 중복 없음. 테스트 entry는 전용 native test extension의 public command API를 사용하며 실제 마우스 클릭은 아니다. trace는 recorded synthetic fixture이며 real Verilator GUI E2E라고 표현하지 않는다. trusted=false 상태에서 읽기만 했고 Run 잠금은 유지했다. 언어 로더/API 소속 경고 없음.
5. 최초 native fixture **LPhen0**는 srcdoc 화면이 render되지 않아 FAIL/exit1. Code-OSS에는 Trusted Types/script CSP가 있으므로 고정 앱 리소스 URL로 변경했다. 해당 실패의 정확한 browser sink 오류는 receipt에 수집하지 않아 확정하지 않는다. CSP/Trusted Types/trust 설정을 완화하지 않았고 TYZYUm에서 렌더링을 수용했다. 최초 fixture에는 일반 extension host10초 경고도 있었지만 종료는 timeout가 아닌 파형 렌더링 검증 실패였다.

ignored 근거: `ide/.dev/h3d-tests.log`(초기 test 순서 FAIL), `h3d-tests-complete.log`/exit(최종51 PASS), `h3d-build-resource.log`/exit, `h3d-real-trace.json`, `h3d-native-waveform.log`/exit와 `editor-acceptance-LPhen0/receipt.json`/exit, `h3d-native-resource.log`/exit와 `editor-acceptance-TYZYUm/receipt.json`/exit. 실제 GUI 검증 스크립트는 `npm run verify:waveform-ui`. 제품 개발은 `npm start -- <프로젝트 폴더>`; 이미 열린 구버전 preview 창은 새 renderer가 자동 적용되지 않으므로 새 앱 실행/정상 재시작이 필요하다.

## 남은 범위와 다음 실행 순서

현재 **VCD 내장 표시**만 연결했다. FST simulation/보관은 Core에서 유지하지만 내장 화면은 명확한 VCD 지원 안내를 반환한다. 외부 GTKWave 열기, saved signal presets/default 편집·저장, 소스 enum 이름 매핑, light theme 동기화, 전체 history/stale badge는 아직 연결하지 않았다. 미연결 preset/외부 버튼은 표시하지 않는다. Diagram/debug 연동은 첫 앱에서 제외한다. 미저장 입력과 자동 dump는 H6이며 현재 저장 코드+기존 dump 코드 사용을 유지한다.

다음은 **파형 탭의 실제 버튼/드래그·bus 펼치기·zoom/시간 눈금/닫기와 새 실행 중 이전 파형 보존 수용**, 이어 **테스트별 신호 프리셋/default와 결과 이력/변경 표시 연결**이다. 기존 VSIX UI/worker 검증을 참고하되 IDE 소유 사본의 실제 근거로 기록한다. 현재 열린 과거 preview의 trust를 다른 profile에 복사하지 않는다. H3/H4 전체 완료·앱 베타 판정은 아니다. H3 언어/도구 설치, H5 discovery/폴더 역할/multi-top, H6 snapshot/자동 dump, H7 종료/재시작/규모, H2 물리 resize/auxiliary·host 지연/audit·clean Windows gate는 유지한다.
