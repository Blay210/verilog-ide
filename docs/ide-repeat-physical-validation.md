> 후속 전체 로그 점검에서 physical 저장 후 언어 감지 오류를 추가 발견했다. 저장 자체 PASS는 유지하지만 로그 무오류 근거가 아니다. 보완 후 native 감지/편집3회 PASS, 첫 회 일시 무응답으로 startup gate는 실패했다. 최신 상태는 [언어 감지 보완 기록](ide-language-detection-validation.md)을 따른다. 아래 이전 반복3/3 startup PASS는 당시 결과다.
# H1 반복 기동·기본 화면 입력 (2026-10-09)

## 반복 native 수용

verify-startup.mjs는 실제 verify-editor 호스트를 새 workspace/profile에서3회 순차 실행하고 warning/unresponsive/inspector/자동 profiling/Agents/uncaught 예외를 기록한다. 단순 receipt PASS만으로 시작 안정성을 합산하지 않는다. 실행 시간은 fixture 준비/환경 검사/앱 실행/편집 시험/종료까지 포함하며 순수 앱 시작 시간이 아니다. warm runtime/source cache를 공유하는 동일 PC의 새 프로필 검증이다. clean Windows/장시간 기동 성능 검증을 대체하지 않는다.

최종3/3 editor PASS·3/3 startup gate PASS, wrapper exit0. T1KxG5/UWi3QE/eCoo2v 각각14968/16005/16303ms; startupWarning/unresponsive/defaultInspector/automaticProfiling/agentStarted/unexpectedException 전부 false. 각 fixture의 receipt/exit/host.log와 ide/.dev/h1-startup-repeat.log/exit.txt·h1-startup-repeat-receipt.json을 보존한다. 직전 mQxR4P의 시작 경고·일시 무응답은 역사적 실패로 남기고 이번3회의 결과로 원인/전체 성능 해소를 단정하지 않는다.

## Physical 입력

사용자 기존 host-policy 창(id197768)과 분리된 physical-editor-acceptance 프로필 개발 앱(id1181044)을 실행했다. 처음 반환 창 없음/빈 로드 상태에서는 입력하지 않고 준비된 화면을 다시 확인했다. Ctrl+N 새 Untitled→본문 클릭/커서 확인→module physical_probe; endmodule // 저장 확인 입력→Ctrl+S native Save As→한글/공백 절대 경로를 입력→Return 저장을 실제 수행했다. Save As의 accessibility focus가 SearchEditBox로 남는 도구 불일치는 screenshot의 filename caret/선택/값으로 확인하고 진행했다. shell 명령이나 사용자 파일 경로를 UI에 입력하지 않았다.

저장 대상은 ide/.dev/physical-input-67f90be7/입력 저장.sv. 파일명 자동 .txt 추가를 피하도록 filename에 따옴표로 감싼 절대 경로를 입력했다. 실제 디스크 내용 exact 일치/49bytes와 저장 후 탭 파일명·미저장 표시 해제를 확인했다. ide/.dev/h1-physical-input-path.txt·h1-physical-input-receipt.json(hash 포함), h1-physical-editor-launch.log를 보존한다. 문서의 Plain Text는 H3 RTL 언어 이식 전 제한이며 syntax highlight/RTL 기능 완료 근거가 아니다. physical open-folder/reopen은 이번에 추가 수행하지 않았고 이전 native API 수용과 구분한다. 신뢰 설정은 자동으로 승인하지 않았다.

일반 개발 앱 로그에는 새 host 일시 unresponsive→responsive가 다시 기록됐다. 10초 시작 경고·Agents start·기본 debugger/자동 profiling은 없었다. 따라서 시험 모드3회 통과를 일반 개발 모드의 완전한 시작 안정성으로 확대하지 않는다. 다음은 정상 개발 host의 eager built-in 활성화·startup 구간 분석을 제한된 범위에서 검토하며 timeout/경고를 숨기지 않는다. 앱은 저장된 private 파일 상태로 열려 있고 사용자 기존 창을 임의로 닫지 않는다.

현재 H1 전체 완료가 아니다. 기본 파일 입력/저장과 native folder/edit/reopen·이전 하단 패널 표시 수용은 확보했다. 남은 것은 정상 모드 일시 host 지연 분석·아이콘/runtime metadata·잔여 product surfaces 범위 판정이다. H2는 Code/Simulation 공간·문서/배치 보존·공통 하단 패널 단계이며 아직 구현하지 않았다. 새 upstream build/패키징/도구 설치·VSIX 기능 수정은 없었다. 제품 코드 변경 없이 반복 검증 runner와 실제 수용 근거를 추가했다.
