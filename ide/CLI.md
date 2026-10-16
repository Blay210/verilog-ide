# Pulse RTL CLI

GUI와 같은 Core의 프로젝트·TB 선택·실행·이력 정책을 사용합니다. 사용자 프로젝트 안의 터미널에서 설치 폴더의 `bin/pulse-rtl.cmd`를 호출합니다. 시스템 PATH 등록은 필요하지 않습니다. 이 launcher는 2026-10-16 Setup에 포함되며 이전 2026-10-14 Setup과 구분합니다.

```powershell
& 'C:\설치 위치\Pulse\bin\pulse-rtl.cmd' init
& 'C:\설치 위치\Pulse\bin\pulse-rtl.cmd' check --tools --source-order
& 'C:\설치 위치\Pulse\bin\pulse-rtl.cmd' test --all
& 'C:\설치 위치\Pulse\bin\pulse-rtl.cmd' test tb.first --jobs 2
& 'C:\설치 위치\Pulse\bin\pulse-rtl.cmd' test --tag smoke --tag fast
& 'C:\설치 위치\Pulse\bin\pulse-rtl.cmd' history --limit 1000 --verify-inputs
& 'C:\설치 위치\Pulse\bin\pulse-rtl.cmd' tools
```

`init`은 빈 현재 폴더를 준비합니다. `init 새이름`은 현재 폴더 아래 새 프로젝트를 만듭니다. 기존 소스가 있는 폴더의 가져오기는 GUI에서 프로젝트 준비를 사용합니다. Counter 예제를 추가하지 않습니다.

공통 옵션 `--project "프로젝트 경로"`, `--tools-directory "공유 도구 경로"`, `--json`을 지원합니다. 출력은 JSON이며 도구 로그는 stderr로 보냅니다. 태그 여러 개는 전부 일치하는 테스트를 선택합니다. jobs는 1~4이며 생략하면 프로젝트 설정을 따릅니다. 입력 소스·TOML을 자동 저장하지 않습니다.

`check` 기본은 설정·파일 검사이며 `--source-order`는 필요한 package 의미 분석, `--tools`는 실제 작은 RTL 빌드·실행 검사를 추가합니다. `tools`는 기존 도구를 검사하고 부족하면 설치 계획을 반환하며 설치하지 않습니다. 계획을 확인한 뒤 `tools --yes`를 명시적으로 호출해야 설치합니다. 공유 도구는 프로젝트 밖에 있어야 합니다. 이력 조회는 최대1,000개로 제한합니다.

성공0, 설정/실행/도구 실패1, SIGINT/SIGTERM 취소130입니다. 개발 중에는 ide의 runtime 빌드 후 `node scripts/rtl.mjs`로 같은 명령을 호출합니다. 제품 CLI 번들·launcher·취소 및 새 명령은 현재 구현 연결 상태이며 최종 통합 검증이 남아 있습니다.
