# VSIX 프로젝트 작업 규칙

이 디렉터리가 기존 확장/CLI 프로젝트 루트다. 모든 개발 명령은 여기서 실행한다. Core/언어 로직은 VS Code와 분리하고 생성물은 사용자 프로젝트 .rtl 아래에 둔다. 실제 검증과 제한을 문서화한다. 사용자 승인 없는 release 패키징/설치는 하지 않는다.

ide 또는 상위 디렉터리의 source/config를 import/load하지 않는다. 자체 packages/scripts/tests/examples/docs/package-lock으로 빌드한다. 이 프로젝트의 docs는 이동 시점의 로컬 문서이며 저장소 공통 최신 인수인계와 제품 계획도 읽는다. 공통 문서는 코드/빌드 의존성이 아니다.
