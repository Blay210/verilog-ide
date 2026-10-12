# 독립 IDE H1 제품 정책 검증 (2026-10-09)

H1 후속 작업이다. RTL IDE는 임시 이름이고 제품 브랜드 확정이 아니다. config/product.json은 official product.json 원본 SHA256과 적용 SHA256을 고정해 이름/설정/프로토콜/Windows ID를 분리한다. 다운로드 builtInExtensions/Marketplace 설정은 제외하지만 MIT 고지와 eager onboarding 호환용 defaultChatAgent 데이터는 유지한다. ide/PRODUCT-POLICY.md에 지원 범위와 남은 진입점을 기록했다.

## 구현과 확인

- native VSIX·location·profile와 공통 gallery/install task의 5개 entry point에 rtl-ide NotAllowed 선행 거부를 추가했다.
- Chat entitlement context에서 제품 정책으로 hidden을 유지해 사용자 AI 설정 false로도 다시 노출하지 않도록 했다. Chat/Agents 코드/서비스 전체 제거나 실행 비용 감소는 이번 결과가 아니다.
- cached runtime의 이름 이행은 같은 디렉터리 내 실행 파일 복사이며 버전 불일치를 차단한다. 기존 실행 중 앱/원본 executable을 rename/delete하지 않는다. 기존 코드 아이콘/바이너리 metadata는 임시다.
- 자동 시험13 PASS/0 FAIL/0 SKIP, ide/.dev/h1-product-tests.log. 제품 원본/적용 digest, MIT 보존, 설정 false Chat 정책, 거부 guard 동작, runtime 버전/복사 보존, 동일 파일 다중 패치/반복 적용·알 수 없는 product 변경 시 무변경을 검증했다.

## 발견과 보완

첫 시험은 삽입형 patch.after가 patch.before를 포함하는 경우 이미 적용 상태를 인식하지 못했다. 적용 후 anchor를 제외한 남은 텍스트에서 중복 여부를 검사하도록 보완했다.

초기 실제 compiled service probe는 install이 logService.trace에 접근해 실패했다. 조사 결과 같은 파일의 여러 patch를 각각 원본에서 만들고 기록해 마지막 patch가 앞선 guard를 덮어썼다. 파일별 Map으로 변경을 누적하고 모든 검증 완료 후 최종 내용을 기록하도록 수정했다. fixture로 5개 guard 유지/반복 적용을 추가 검증했다. 첫 전체 빌드 exit0(7.23분)은 불완전 patch 적용 상태이므로 정책 완료 근거가 아니다. 수정 후 공개 compile-client 작업과 compiled probe를 순차 확인한다.

첫 본체 재빌드 호출은 compile-src가 내부 이름일 뿐 공개 gulp task가 아니어서 exit1이었다. logs h1-product-core-compile.log/exit.txt를 보존하고 compile:core wrapper를 공개 compile-client 작업으로 수정했다. 최초 전체 빌드의 대체 명령은 아니며 extension 변경이 없을 때만 사용한다.

## 현재 열린 수용

보완 후 공개 compile-client 재빌드 exit0/0 errors(5.77분), 실제 compiled service probe5 PASS/exit0. 근거는 ide/.dev/h1-product-rebuild.log/exit.txt, h1-compiled-policy-final.log/exit.txt다. 최종 정책/overlay 시험13 PASS/0 FAIL/0 SKIP(671ms), h1-product-final-tests.log. probe는 실제 서비스 entry point 선행 거부이며 UI/CLI 설치 종단 수용은 아니다.

새 identity 앱 프로세스/RTL IDE (Development) Dev 창은 inventory로 확인했지만 OnboardingVariationA eager import가 defaultChatAgent 필수 assert로 시작 실패했다. 호환 데이터를 고정 product overlay에 복구하고 top-level key 정렬 및 정확한 이전 overlay hash 이행을 추가했다. 이 변경은 제품 JSON/개발 스크립트만이라 앱 본체는 재컴파일하지 않았다. 최종13 시험과 compiled5 probe를 재확인했다. 이번 private profile main 프로세스만 경로/인자/단일 instance로 확인 후 정리하고 h1-product-recovery-launch.log로 재시도했다. 기존 Code-OSS 사용자 창은 종료 대상으로 삼지 않았다.

Computer Use의 앱 접근 승인 대기가 시간 초과돼 실제 화면 입력·저장 수용을 중단했다. 재시도 로그 확인과 물리 화면 수용을 구분한다. Extensions UI/설치 명령의 노출 제거, remote/web/URL/CLI 전체 흐름, Chat 설정·Agents 등록/onboarding 의존성 제거, 전용 아이콘·런타임 metadata, 실제 폴더/편집/저장·Terminal/Output은 남아 있다. H1/H2/베타 완료를 주장하지 않는다. VSIX 코드/배포물 변경, root/vsix import/link, 새 패키징은 없다. 기존 audit 영향·완화 검토도 열린 상태다.
