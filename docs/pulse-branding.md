# Pulse 이름·아이콘 결정 (2026-10-14 KST)

사용자가 Silica/Sol/Orbit/Pulse 시안 중 **Pulse**를 선택했다. 독립 IDE의 표시 이름은 Pulse, 심볼은 네 방향 별과 디지털 사각 파형이다. 민트/흰색과 짙은 배경, 평면 형태를 사용한다. 처음 생성한 콘셉트의 질감·그라데이션을 제거하고 저장소 소유 벡터로 정리했다.

## 구현과 산출물

- `ide/scripts/icon.mjs`: SVG와 Windows ICO가 동일한 geometry/palette를 사용한다. ICO는16/32/48/64/256px·투명 모서리·안티앨리어싱이다.
- `ide/assets/branding/pulse.svg`, `pulse.ico`, `pulse.png`: 실제 앱용 벡터·Windows 아이콘·256px 미리보기. `node scripts/export-branding.mjs`로 재생성한다. 기존 후보 시안은 생성 이미지 저장소에 있으며 앱이 참조하지 않는다.
- `ide/config/product.json`: 표시 이름/Windows 표시 이름을 Pulse로 변경했다. 알려진 이전 product hash를 보존해 guarded overlay migration을 유지했다.
- 데이터/신뢰/설정 연속성을 위해 내부 `applicationName=rtl-ide`, 저장 폴더·protocol·mutex·registry/app IDs는 유지한다. 새 이름 때문에 사용자 설정을 복사/초기화하지 않는다.
- 개발 launcher는 기존 executable을 보존하고 Pulse Dev fingerprint 복사본을 만든다. 다음 배포 build의 Windows icon resource도 Pulse로 준비하며, pinned upstream/동일한 소유 icon만 허용한다. 임의 resource를 덮어쓰지 않는다.
- 배포 검사/launch는 표시 이름에서 executable 경로를 읽고, 이전 이름의 후보를 현재 Pulse 배포라고 수용하지 않는다.

## 검증·배포 상태

icon/branding/launcher/product/source-overlay 관련 **11 PASS/0 FAIL/0 SKIP**, 배포/검증 스크립트 syntax 검사 PASS. PNG 산출물을 직접 열어 형태를 확인했다. Windows shell/taskbar/DPI의 실제 아이콘과 표시 이름은 미검증이다. 이번 작업은 Computer Use/앱 실행/설치/배포 rebuild/ZIP/공개 게시를 하지 않았다. 기존 `ide/VSCode-win32-x64`는 탭 개선과 Pulse 반영 전 후보이며 그대로 보존한다.

다음은 승인된 화면 통합에서 새 탭·Pulse 표시/작은 아이콘을 확인하고, 별도 소유 출력으로 새 후보를 빌드해 packaged 수용과 portable ZIP을 준비하는 순서다. Computer Use/visible 검증은 매번 사용자 확인을 받아야 한다. Pulse 이름의 외부 제품/상표 중복은 확인 전이며 독점성을 주장하지 않는다. 독립 IDE와 VSIX의 코드/빌드 격리 및 기존 열린 gate를 유지한다.
