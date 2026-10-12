# 프로젝트 분리 기록 (2026-10-09)

## 소유권과 디렉터리

저장소 루트는 Git 저장소/공통 LICENSE/AGENTS/README/PROGRESS와 docs를 관리한다. 루트 package.json/workspace는 두지 않는다.

- vsix/: 기존 packages, scripts, tests, examples, .vscode, package.json, package-lock.json, tsconfig.json, node_modules, 기존 dist를 이동했다. 자체 LICENSE/README/.gitignore/AGENTS와 로컬 docs를 보유한다.
- ide/: 자체 package.json/package-lock.json/.gitignore/README/AGENTS로 준비했다. 아직 앱 source/Code-OSS checkout/build/dependencies는 없다. 앱 구현 시작/기술 선택 완료를 주장하지 않는다.
- 두 프로젝트는 서로 또는 상위의 source/config를 import/load하지 않는다. file:/link: 의존성, cross-project workspace/path alias, junction, runtime 파일 로딩과 빌드 입력 공유도 금지한다. 이후 기존 기능을 재사용할 때는 라이선스/출처를 보존해 필요한 코드를 복사 이식하고 각자 버전/검증한다.
- 공통 문서는 루트/docs가 최신 기준이다. vsix/docs는 이동 시점의 독립 문서 사본이며 VSIX 패키징에 필요한 private-beta-guide도 로컬에 있다. 향후 VSIX 동작 변경은 로컬 문서에도 반영한다. 두 문서 집합 사이에 symlink나 빌드 참조는 없다.

## 개발·이전 경로

기존 확장 작업은 vsix를 프로젝트 폴더로 열고 그 안에서 명령을 실행한다. 로컬 .vscode의 기존 F5/빌드 상대 경로는 그대로 유효하다. ide는 별도로 연다. 상위 저장소에 별도 Git 저장소를 만들지 않았으며 각 디렉터리는 다른 위치에 복사해도 자체 구성으로 관리할 수 있다.

과거 문서의 packages/scripts/tests/examples/dist 경로와 명령은 이제 vsix 기준으로 읽는다. 고정 D:/Dev/verilog_ide/packages 등 개인 설정은 D:/Dev/verilog_ide/vsix/packages로 사용자가 변경해야 한다. 열려 있는 기존 개발 host도 새 위치에서 다시 시작해야 한다. IDE의 사용 상태/자동화가 과거 절대 경로를 자동 변경했다고 주장하지 않는다.

루트 .dev는 기존 private toolchains/실행 입력·trace/검증 receipt와 절대 경로의 증거 보존을 위해 이동하지 않았다. 공통 도구/cache를 프로젝트 밖에 두는 기존 원칙과 같다. 새로운 VSIX 검증 생성물은 vsix/.dev에 쌓인다. 과거 .dev 보관소는 앱 코드 의존성이 아니며 새 IDE는 기존 프로젝트 출력/도구를 암묵적으로 읽지 않는다. 향후 도구 경로는 승인된 사용자 설정으로 관리한다.

## 이동 후 검증

- vsix cwd에서 TypeScript 검사 exit0와 개발 build exit0.
- 전체 최상위 자동 회귀 227 PASS / 0 FAIL / 0 SKIP, 약33.42초. 로그 vsix/.dev/layout-regression.log.
- VSIX npm package junction을 이동 후 새 로컬 packages로 복구했다. 모든 @rtl-dev junction의 실제 경로가 vsix 내부임을 확인했다. 최초 sandbox의 junction 생성 EPERM 뒤 허용 환경에서 복구 성공.
- 두 프로젝트는 각각 manifest/lockfile을 보유한다. IDE는 외부 파일 의존성/코드 연결 없이 비어 있는 준비 상태다. 향후 작성된 IDE 전체 코드의 격리는 해당 구현 검증에서 다시 확인한다.
- 기존 0.3.1 VSIX와 비공개 zip은 기존 SHA256SUMS 값과 일치한다. 새 패키징/설치 없음.
- 이동 후 실제 VS Code UI/Verilator 종단은 이번에 재실행하지 않았다. 기존 E4 근거는 역사 기록이며 이동 후 전체 UI 수용을 주장하지 않는다.

다음 작업은 ide 내부 기반 설계/host 의존성 점검과 Code/Simulation 첫 앱 구현 순서 합의다. 자체 엔진은 별도 사용자 논의 후 진행한다.
