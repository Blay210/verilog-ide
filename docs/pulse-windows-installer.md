# Pulse Windows 설치판 (2026-10-14)

사용자가 ZIP 외에 Setup 파일을 요청했다. 기존 수용된 Windows x64 스터디 베타 ZIP을 설치 내용으로 사용한다. 앱의 동작을 다시 바꾸거나 VSIX를 참조하지 않는다.

## 최종 산출물

- `ide/release/Pulse-Setup-windows-x64-beta-20261014.exe`: **260,255,047 bytes**, Inno compile exit0·PE 검사·원본2,565개 staged 파일 hash 보존 PASS.
- SHA256: `776b282224a23753034f57793d8de158d5e07e6f82cbc70067df775ae8ae5275`. `.exe.sha256` 및 `installer-manifest.json`에 기록했다.
- 검증된 기존 ZIP은 그대로 보존했다. 실제 설치/업그레이드/제거 및 새 Windows 검증은 **미실시**이며 `installed:false`, `screenVerified:false`로 표시한다. 사용자 프로필이나 시작 메뉴를 바꾸는 설치 검증은 이번 빌드에서 하지 않았다.

## 설치 동작

`Pulse-Setup-windows-x64-beta-20261014.exe`를 실행하면 한국어/영어 설치 마법사로 설치한다. 기본 위치는 사용자 계정의 `%LOCALAPPDATA%\Programs\Pulse`이다. 관리자 승격을 요청하지 않는 사용자 설치이며 Windows10 이상 x64 OS 대상으로 한정한다. 시작 메뉴에 Pulse를 등록하고 바탕화면 바로가기는 선택 사항이다. 완료 후 앱 실행도 선택할 수 있다.

Windows ‘설치된 앱’의 `Pulse (Study Beta)`에서 제거한다. 자체 설정·신뢰 저장소·공유 도구·프로젝트는 installer의 파일 범위에 포함하지 않는다. 제거에는 wildcard delete/사용자 profile cleanup을 넣지 않았으며 Inno의 설치 기록으로 설치한 파일·바로가기를 제거한다. 실행 중인 앱을 강제 종료하지 않으며 시스템 PATH/파일 연결을 변경하지 않는다. Verilator/C++·slang/Python은 이전과 동일하게 앱에서 별도 승인·검증·재사용한다.

설치판 버전은 `0.1.0-beta.20261014`이고 앱 기반 Code-OSS 표시는 기존 `1.141.0`이다. 동일 제품의 이후 설치판은 기존 user AppId와 위치를 재사용한다. 실제 upgrade/uninstall은 별도 수용 대상이다. 서명·공개 게시·자동 업데이트는 이번 요청에 포함하지 않는다.

## 재현과 검증

`ide/`에서 `node scripts/build-installer.mjs`. 현재 upstream에 이미 있는 `innosetup@6.4.1`/ISCC를 사용하며 추가 설치를 하지 않는다. 기존 EXE를 덮어쓰지 않는다. `release/manifest.json`의 수용된 ZIP SHA256/크기→own `.dev/pulse-installer-*` staging으로 모든 entry 추출/Windows 경로·중복·link 보호→Pulse.exe 수용 hash와 upstream integrity10개 확인→own `installer/pulse.iss` compile→PE/전체 staged file hash 유지 검사→release EXE 및 SHA256·installer-manifest 기록 순서다. 실패 staging과 compile.log는 보존한다.

빌드/테스트 근거는 `ide/.dev/windows-integrated/pulse-installer-build.*`, `pulse-installer-tests.*` 및 `release/installer-manifest.json`이다. 실제 ZIP 추출의 한글/공백·payload count 불일치·case 중복/원본 보존 등 신규3개 검사 PASS다. 컴파일은 실제 설치·제거나 마법사 화면 수용을 대신하지 않는다. 별도 깨끗한 Windows 환경은 없으며 화면 검증이 필요하면 사용자 승인을 받은 최종 세션에서 묶어 수행한다.

Inno 원칙은 [사용자 설치/권한](https://jrsoftware.org/ishelp/topic_setup_privilegesrequired.htm), [비관리자 설치](https://jrsoftware.org/ishelp/topic_admininstallmode.htm), [OS 아키텍처](https://jrsoftware.org/ishelp/topic_setup_architecturesallowed.htm)를 참고했다. 기존 [베타 수용·잔여 gate](pulse-internal-beta.md)를 유지한다.
