# H3F — 테스트별 파형 보기와 기본값 (2026-10-10)

독립 IDE의 기존 파형 화면에 테스트별 저장 보기를 연결했다. 사용자가 신호를 매번 다시 고르지 않도록 여러 보기를 저장하고 하나를 기본값으로 지정한다. VSIX/부모 source 의존성·보안 정책 변경·배포 패키징은 없다.

## 사용과 동작

1. Simulation → 결과의 **파형** → Signals에서 신호 선택, 드래그로 순서 조정, 필요하면 bus 펼치기/표현 형식/색 조정.
2. **Save view…**로 이름을 붙인다. 저장된 보기가 선택되어 있으면 현재 보기 덮어쓰기 또는 새 보기 저장을 고른다.
3. **Use as default**로 이 테스트의 기본값을 지정한다. 기본 보기는 ★와 Default ✓로 표시하며 다시 누르면 기본 지정만 해제한다.
4. View 목록에서 저장 보기를 선택한다. **⋯**에서 이름 변경·삭제를 제공한다. 취소는 저장된 설정과 현재 신호 선택을 바꾸지 않는다.

저장 범위는 신호 경로·순서·전체/개별 radix·개별 색·bus 펼침이다. 커서/zoom/scroll은 열린 run 탭의 임시 상태다. 새로 연 파형에는 기본 보기를 적용하며 이미 열린 다른 run의 선택을 자동 교체하지 않는다. 같은 테스트의 다른 탭에는 저장 목록/기본 표시만 동기화한다. 닫고 재열기 또는 앱 재시작 이후에도 파일에서 기본 보기를 읽는다; 전체 앱 재시작의 물리 수용은 아직 별도다.

저장 신호를 signal ID가 아닌 경로로 해석하므로 실행마다 ID가 달라도 적용한다. 이번 run에 없는 신호는 안내하고 저장된 경로는 유지한다. 기존 보기를 덮어써도 누락 경로를 조용히 삭제하지 않는다. 경로 자체가 이름 변경되면 사용자가 보기를 갱신해야 한다. 다른 보기를 선택해도 현재 커서/시간 범위를 초기화하지 않는다.

## 소유권과 저장 경계

- IDE 소유 `runtime/waveform-views.ts`와 `runtime/waveform/views.ts`, 창별 SimulationHost/Node channel, 기존 sandbox UI bridge에 연결한다. upstream에는 IDE 소유 pure model/views 사본과 계약만 overlay한다. 새 의존성/설치 없음.
- `.rtl/waveform-views/<SHA256(test name, top)>.json`: 테스트 이름+top별 분리, 다중 top 향후 사용 가능. 이름이 바뀌면 새 key이며 자동 마이그레이션은 하지 않는다. source·manifest·retained waveform을 수정하지 않는다. 읽기만 할 때는 설정 디렉터리를 만들지 않는다.
- 최대20개 보기/보기당32개 신호/설정1MiB, 이름1~60자. parser로 id/name/중복/스타일/default를 검증한다. malformed·oversized·link 디렉터리/파일은 거절하며 기존 bytes를 덮어쓰지 않는다. UI는 파형 표시를 계속하고 저장 불가 원인을 보여준다.
- revision hash와 shared-process 내 파일별 queue를 사용한다. 다른 탭/창이 수정한 오래된 revision의 저장은 거절하고 목록을 갱신해 재시도하도록 안내한다. 임시 파일을 exclusive 생성하고 rename 후 정리한다. 서로 다른 앱 프로세스의 동시 writer나 외부 편집과의 완전한 원자적 경쟁 제어까지 수용한 것은 아니다.
- renderer는 경로를 보내지 않는다. 열린 reader token이 캡처한 프로젝트/테스트/top으로만 설정 파일에 접근한다. 닫힌 token은 거절한다. Restricted Mode에서도 파형 보기 설정은 가능하지만 시뮬레이션 Run은 계속 잠긴다. 임의 실행·도구 설치·trust 변경과는 별개다.

## 실제 검증과 실패

- 최종 전체 **53 PASS /0 FAIL /0 SKIP**, runtime 타입/build 성공. 51개 기존 회귀+2개 저장소 시험: 여러 보기/순서/색/expansion/default·새 store 복원·다중 top 분리·누락 유지·동시 revision 충돌·중복 이름·삭제/default 정리·손상 bytes 보존·Windows junction 거절·임시 파일 정리·한글/공백 경로. 최초 일반 sandbox 실행은 junction 생성 EPERM으로1 FAIL이었다. 권한 허용된 workspace 내부 fixture 검증에서53 PASS; 실패 기록 보존.
- overlay 공식 emission+전체 upstream 타입 **0 errors/exit0**. 최초 QuickInput validateInput을 동기 함수로 지정해1 타입 오류; 실제 API의 async 계약으로 수정한 최종 검증 통과. 이 실패도 보존.
- native fixture **DC5Tja**:2항목 PASS/exit0. 저장소에 준비한 기본 보기의 `tb.count` bus+8bit **9개 canvas**·눈금 정렬·Code 왕복/같은 run 재사용 확인. 이는 synthetic trace/default fixture이며 물리 Save 버튼 검증과 구분한다.
- 물리 Windows 창985010/session `h3f-views`: 실제 H3C retained basic VCD 열기 → count8bit 펼치기 → Save view… → 이름 **기본 비트 보기** 입력/Enter → Use as default → ★/Default ✓ 확인 → 탭 닫기/재열기 → 기본 보기와8bit 복원 PASS. 실제 설정 JSON의3개 신호 경로/순서/expanded/defaultId 확인. 새 Run은 하지 않았고 fresh profile untrusted 유지. rename/delete/여러 보기 전환·다른 창 동기화 전체를 물리 수용했다고 표현하지 않는다.
- preview source/manifest/README/.gitignore6개 해시 불변, retained run5개 유지, 새 설정 JSON1개가 `.rtl/` 안에 생성됐다. UI 스크린샷은 tool 응답 관찰이며 PNG로 저장하지 않았다.

ignored 근거: `ide/.dev/h3f-tests.log`/exit(최초 EPERM), `h3f-tests-approved.log`/exit, **`h3f-tests-final.log`/exit**(최종), `h3f-build.log`/exit(최초 타입 오류), **`h3f-build-final.log`/exit**, `h3f-native-waveform.log`/exit, `editor-acceptance-DC5Tja/receipt.json`, `h3f-preview.log`, `h3f-integrity.json`. 개발 창은 새로 시작해야 새 workbench Node 채널을 사용한다. 파형 iframe만 reload해 이전 앱 채널을 업그레이드하지 않는다.

## 다음 실행 지점

다음은 **Simulation 홈의 실행 이력과 소스 변경(stale) 표시**, 기록된 run 선택/열기다. 새로운 결과가 생겨도 이전 파형 탭을 바꾸지 않는다. 필요시 preset rename/delete/중복·missing 안내의 물리 수용을 함께 진행한다. H3E의 Ctrl/Shift 그룹 드래그/긴 시간 실제 화면/새 GUI Run 중 이전 탭 수용은 계속 추적한다.

FST 내장 표시/enum 소스 매핑/light theme·언어/설치 UI, H5 discovery/폴더 역할/multi-top, H6 snapshot/자동 dump, H7 종료/재시작/규모 및 기존 H2/H1/clean Windows gate가 남는다. 현재 H3/H4 전체 완료 또는 독립 앱 베타/배포 준비 완료는 아니다. 첫 앱에서 Diagram/debug 제외·자체 엔진 별도 합의를 유지한다.
