# RTL IDE 개발 저장소

두 프로젝트를 각각의 디렉터리에서 독립적으로 개발합니다. 루트는 공통 제품 계획과 인수인계 문서를 관리하며 npm workspace가 아닙니다.

- [vsix/](vsix/README.md): 기존 VS Code 확장·CLI·Core·테스트·예제. 빌드와 실행은 이 디렉터리를 기준으로 합니다.
- [ide/](ide/README.md): 독립 IDE 프로젝트 준비 영역. 앱 구현은 아직 시작하지 않았습니다.
- [제품 결정](docs/h0-product-decisions.md), [실행 순서](docs/delivery-plan.md), [인수인계](docs/handoff.md), [진행현황](PROGRESS.md).
- [분리 구조와 검증](docs/project-layout.md).

두 프로젝트 사이의 source import, 의존성 링크, 상대 경로 로딩 또는 빌드 입력 공유를 금지합니다. IDE에 기존 기능을 이식할 때는 필요한 코드를 ide 내부에 복사하여 자체 관리하고 관련 라이선스/출처를 보존합니다. 루트의 .dev는 이동 전 도구·검증 기록 보관소이며 앱 소스 의존성이 아닙니다.

독립 앱 개발 순서와 완료 기준: [독립 IDE 구현 계획](docs/ide-implementation-plan.md).
