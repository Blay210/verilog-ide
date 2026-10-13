# Simulation 탭 개선 (2026-10-14 KST)

사용자 요청에 따라 독립 IDE 탭을 정리했다. 표시 이름은 TB 이름만 사용하며 실행 시각/ID는 툴팁·접근성 이름에 남는다. 동일 TB의 여러 실행은 별도 runId/reader로 유지한다. 홈은 왼쪽 고정 집 아이콘(36px), 닫기는 탭 내부의 작은 ×이다. 둥근 상단·테마 활성/비활성 색·hover/focus와 높은 대비 경계를 사용하며 탭은 한 줄 가로 스크롤, 긴 이름은 말줄임한다.

비활성 탭을 닫아도 현재 파형은 유지된다. 활성 탭을 닫으면 인접 파형, 마지막 탭을 닫으면 홈으로 이동한다. 해당 reader만 해제한다. VSIX는 미변경이다.

공식 Code-OSS 전체 타입·owned 개발 출력 컴파일 **0 errors/exit0**, provider/overlay 회귀 **18 PASS/0 FAIL/0 SKIP**. 동일 이름 세 실행의 identity·비활성/활성/마지막 닫기·reader 해제를 확인했다. 로그: `ide/.dev/windows-integrated/tab-types.*`, `tab-regression.*`.

새 디자인의 실제 화면·테마·작은 창·가로 스크롤은 **미검증**이다. Computer Use/visible 검증 전에 매번 명시적 사용자 확인을 받는다(2026-10-14 정책). 개발 출력은 갱신했지만 기존 `ide/VSCode-win32-x64` 배포 후보는 이번 탭 변경 이전 버전이다. 실행 중 앱 자동 재시작 없음.

## 직전 배포 작업 인수인계

child PATH 대소문자 보완 후 `build-beta.mjs --finish` exit0. `verify-beta.mjs`의 identity·RTL 언어/worker/Python/HTML·license 포함·Copilot/인증 확장 부재·packaged headless CLI(1.141.0/revision2a59476c/x64) PASS. 비소스 cwd의 CLI 성공은 checkout 없는 PC의 전체 앱 수용을 뜻하지 않는다.

5분 이내 조건으로 승인된 packaged native 통합 **11개 PASS**. 첫 창은 launcher windowsHide 때문에 숨겨졌다. 완료 receipt/log를 보존한 후 검증 프로젝트가 일치하는 소유 프로세스만 강제 종료했다. packaged windowsHide:false로 보완해 다시 실행하고 동일 native11개 PASS와 파형 화면 표시를 확인했다. 다음 cursor 클릭 직전에 사용자가 물리 Escape로 중지했고 이후 Computer Use 입력 없음. **배포 앱 물리 클릭/커서·정상 종료는 미수용**이다. `exit.json`은 이전 숨김 실행의 강제 종료 결과일 수 있으므로 receipt PASS와 정상 exit PASS를 혼동하지 않는다. 다음 승인 세션에서 전용 창/launcher timeout 상태를 확인한다.

첫 숨김 실행 로그에 개발 profile의 이전 Seti font 경로 거절이 있다. 새 profile/clean Windows·startup/장시간 메모리 수용은 남는다. Copilot 확장은 제외했지만 upstream 관련 라이브러리 전부 제거는 아니다. ZIP·설치·공개 게시·commit/push 없음.

다음은 새 탭의 승인된 화면 검증 → 반영된 배포 후보 재빌드/packaged 수용 → portable ZIP·SHA256·사용 안내다. builder는 기존 배포 폴더를 덮어쓰지 않으므로 새 빌드 전 별도 보관/소유 경로 검토가 필요하다. clean Windows/FST 내장 표시/파형 enum/대표 실제 설계 성능 등 기존 열린 항목 유지.
