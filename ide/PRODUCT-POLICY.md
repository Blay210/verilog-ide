# H1 제품 정책과 이식 경계

임시 이름은 RTL IDE / RTL IDE (Development)다. 최종 브랜드가 아니다. config/product.json은 고정 공식 product.json의 원본/적용 SHA256을 확인한 뒤 이름·프로토콜·Windows application ID·설정 폴더를 교체한다. MIT 고지와 upstream 출처는 유지한다. 프로젝트는 이 설정을 직접 관리하며 root/vsix 설정을 읽지 않는다.

## 이번 적용 범위

- Marketplace 설정과 다운로드 대상 builtInExtensions를 제품 설정에서 제외한다. defaultChatAgent 설정 데이터는 eager onboarding import의 assert 의존성 때문에 호환용으로 유지한다. Chat 활성화 정책 차단과 코드 전체 제거는 구분한다. 기존에 받았던 JS debug 파일을 삭제하지는 않는다. 소스에 포함된 언어·Git·Terminal 등의 built-in 기능은 아직 유지한다.
- Chat entitlement context는 rtl-ide에서 항상 hidden이다. 사용자가 chat.disableAIFeatures=false로 설정해도 제품 정책이 우선한다. Chat/Agents 코드 전체를 삭제하거나 실행 비용을 제거한 것은 아니다.
- native extension install(VSIX), installFromLocation, installExtensionsFromProfile 및 공통 installGalleryExtensions/installExtensions는 rtl-ide에서 NotAllowed로 실패한다. 거부는 로그/다운로드/파일 읽기/작업 생성 전에 한다. 자체 built-in 코드는 source 배치로 관리할 예정이며 사용자 확장 설치 경로를 다시 열지 않는다.
- tracked config/patches.json과 scripts/patches.mjs로 변경을 재현한다. 원본 anchor 또는 이미 적용한 anchor만 인정한다. 전체 검사 후 파일을 기록한다. 제품 overlay도 알 수 없는 변경을 덮어쓰지 않는다.
- 개발 앱은 .dev/rtl-ide/{profile,shared,extensions}를 사용한다. 최초 Code-OSS 실험의 .dev/profile은 보존한다. built-in download control은 별도 .dev/extensions/control.json이다.
- 원본 runtime을 보존하고 임시 칩 아이콘/RTL 제품 metadata를 적용한 fingerprint별 개발 exe를 만든다. 실행 중 파일을 덮어쓰지 않는다. 준비된 cache도 Electron 버전/SHA256/경로를 다시 검사한다. 일반 wrapper와 native/CLI 검증이 같은 사본을 사용한다. code.bat RTL override는 profile/shared/extensions flag 누락을 preLaunch 전에 거부한다. 모든 UI 브랜드/정식 배포 리소스의 수용은 별도다.

## 파일 언어 감지

RTL 제품은 등록된 파일명 association/명시적 언어 선택을 사용하고 범용 content-model worker와 감지용 history 조회는 사용하지 않는다. 미등록 파일은 현재 모드를 유지한다. 고정 upstream loader의 require/누락 regex module 오류를 저장 후 로그에서 발견해 제품 경계를 정했다. RTL 언어 association과 편집 지원은 H3 이식 항목이며 H1의 .sv는 Plain Text다. upstream 제품의 감지 동작은 보존한다. native 편집 수용은 실제 감지 명령/JSON association과 발견한 로그 오류도 검사한다.

## 남은 H1 수용

Extensions 기본 view/열기 명령과 install/recommend/search action, local/remote Agents workbench contribution14곳을 RTL 제품에서 제외했다. Chat view/update view는 RTL에서 false이며 기본 container/열기 명령도 제외했다. 실제 격리 화면에서 Chat/Extensions 없음·Output/Terminal 표시를 확인했다. 실제 CLI의 inert fixture 설치는 정책 오류로 거부되고 설치 디렉터리를 만들지 않았다. 이것은 개발 검증용 archive이며 배포 패키지가 아니다.

설정의 Chat 항목, 기타 명령과 delayed Agents 서비스/import 등은 남는다. 코드 전체 삭제나 성능 절감을 주장하지 않는다. remote/web extension host와 URL/파일 연결·CLI 전체 경로 감사도 완료가 아니다. 개발용 vscode-api-tests Hello World 및 extension host 시작 경고를 정리해야 한다. 파일 열기·편집/저장·폴더 열기, 전용 아이콘과 런타임 리소스도 남은 수용이다. 신뢰 설정 확인은 자동으로 승인하지 않았다.

정책 단위 시험은 patch guard 동작을 검사한다. scripts/verify-policy.mjs는 실제 컴파일된 서비스 entry point를 네트워크/파일 협력자 없이 호출해 선행 거부를 확인한다. GUI/CLI 종단 설치 시도와 동일하다고 표현하지 않는다. npm audit의 영향·완화 검토는 내부 베타 수용 전 별도 작업이다.

scripts/verify-cli-policy.mjs는 실제 개발 runtime CLI를 별도 profile/shared/extensions 경로에서 실행하고 한글·공백 파일명의 inert archive 설치 거부를 검사한다. 정상 본체 빌드 완료 후 실행한다. 전체 GUI 설치/URL 수용을 대체하지 않는다. RTL_IDE_DEV_SESSION을 지정하면 .dev/rtl-ide/<session>에 별도 개발 프로필을 둔다.

후속 보완: 이전 앱 전체 로그에서는 Agents 프로세스 시작이 확인됐다. contribution 제외만으로 시작 차단을 주장하지 않는다. AgentHostEnablementService를 RTL 제품에서 false로 하고 별도 prewarm 등록을 제외한다. system scanner는 vscode.vscode-api-tests/vscode.vscode-test-resolver/vscode.debug-auto-launch 개발 시험3개를 읽지 않으며 다른 언어/Git built-in은 유지한다. 실제 재빌드/compiled/실행 결과는 공통 host 정책 기록을 따른다. 시작 경고가 해소되었다고 아직 단정하지 않는다.

RTL의 기본 extension inspector는 자동으로 열지 않는다. 명시 inspect/inspect-brk는 기존 parser로 유지하고 자동 ExtensionsAutoProfiler contribution만 제외한다. 응답 상태 로그/10초 시작 경고는 그대로 유지하며 일시 지연을 숨기지 않는다. native 테스트 호스트에서 시작 경고가 재현되어 시작 안정성 게이트는 열린 상태다.
