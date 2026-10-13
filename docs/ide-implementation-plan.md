## H7S 최신 — enum 표시 정보 재사용·lookup/요청 대기 구분 (2026-10-13 UTC)

기존 pyslang의 동일 native enum identity/고정 lookup scope에서 해석한 표시 값·spelling을 요청 안에서만 재사용한다(최대64 types/4096 values/1MiB UTF-8 payload, 상한 거절 시 원래 계산·각 output 별도 복사). native lookup·default/decl order·shadowing·parameterization·Core/journal·신뢰/미저장/파일/실제 cleanup 보호를 유지하며 자체 compiler/simulator·상시 worker/settled cache는 추가하지 않았다. dense enum32/variables96의 실제 lookup9332→950/두 contexts·전후5회 전체 semantic/hierarchy30쌍 JSON 일치, unqualified 완성 중앙값1405.0→642.6ms·해당 Python peak55.6→41.4MiB를 확인했다. 일반 IPC 편집→완성949.5→979.4ms는 개선 미확인이다. snapshot 현재 분석403.7ms/query active561.8ms와 pool queue 약0.1ms를 구분했고, 제어된100ms hold의 실제 queue/종료/third start도 검증했다. 전체 앱/RSS/Windows 수용으로 일반화하지 않는다. Linux 전체 **322 PASS/0 FAIL/1 Windows batch SKIP(총323개)**·신규6 PASS·runtime/language build. 모든 상한 fallback·native identity/owned output·257/unknown enum 미표시·다른 parameterization ambiguity와 다음 편집 fresh 복구를 통과했다. 다음은 Windows 통합 검증 준비: P0 공식 본체/NTFS/취소·종료→P1 native watcher/한 번의 화면 통합·실제 대표 baseline 순서다. default/candidate/포화 queue·장시간/RSS·전체 disk·미구현 내부 연산/FST/파형 enum 등은 잔여이고 화면은 마지막 통합까지 보류한다. [구현·전후 계측·검증](ide-h7s-lookup-wait.md)·[통합 검증 우선순위](ide-h7-integration-gates.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7R 최신 — 요청 안에서 package 시작 비용 공유 (2026-10-13 UTC)

기존 pyslang의 auto package dependency와 분석을 한 요청의 Python process에서 이어가되 graph 게시→Core orderPackages 검증→소유 continuation/approval 확인 뒤에만 새 test compilation을 만든다. Core 오류/순서·독립 manager/default/lookup·미저장/신뢰/FS/journal·실제 취소/join/cleanupFailed 보호를 유지하고 상시 worker/cache·자체 compiler/simulator는 만들지 않았다. 300 RTL/package/tests의 Python 시작2→1, 실제 IPC startup/edit4→2·전후5회 semantic/hierarchy20쌍 JSON 일치다. 이번 Linux IPC 편집→완성 중앙값1779.0→900.5ms, 공유 완성899.1→756.4ms를 관찰했다. shared Node CPU29.5→46.1ms·Python peak40.6→41.2MiB도 기록하며 전체 앱 지연/RSS 수용으로 일반화하지 않는다. Linux 전체 **316 PASS/0 FAIL/1 Windows batch SKIP(총317개)**·최종 관련19 PASS·runtime/language build. 승인 전/후 취소·조기/다른 응답·atomic 쓰기 실패·실제15초 승인 누락/종료·fresh 복구를 확인했다. 내부 연산 조회의 Python adapter 부재는 기존 미구현 잔여이며 hierarchy 수용과 구분한다. 다음 H7S는 default/완성 lookup CPU·실제 요청 대기 분리와 H7 성능 잔여/최종 Windows 통합 우선순위 정리다. Windows 공식 본체/native watcher/client/NTFS 파일 왕복/taskkill/화면·대표 설계/장시간/RSS/전체 disk gate는 잔여이고 화면은 마지막 통합까지 보류한다. [구현·전후 계측·검증·다음 단계](ide-h7r-package-session.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7Q 최신 — 독립 테스트 완성 비교·scope 좌표 비용 (2026-10-13 UTC)

기존 pyslang 연동의 전체 symbol JSON 교집합을 순서·중복·타입/선언/default/enum/callable 동의 그대로 선형 비교하고, query 파일 밖 scope의 불필요한 end 좌표 계산을 줄였다. 자체 compiler/simulator 개발은 아니다. 실제300 RTL의 symbol 직렬화93,326→608회, 큰 공유 완성5회 Node CPU 중앙값319.9→33.7ms·wall1158.5→865.8ms·semantic/hierarchy20쌍 JSON 일치다. wall 편차와 작은 IPC 편집→완성1277.2→1472.2ms를 기록하며 전체 지연/RSS 개선으로 판정하지 않는다. Linux 전체 **310 PASS/0 FAIL/1 Windows batch SKIP(총311개)**·기존43/새guard3 PASS·runtime/language build. Core package 오류의 분석 전 거절·취소/실제 process join/임시 파일 회수·원본/신뢰/FS/journal 보호를 유지했다. 별도 package process/import 비용은 남으며 다음 H7R은 Core 검증 뒤 분석하는 요청 내 양방향 protocol과 취소/정리 경계다. Windows 공식 본체/native watcher/client/화면·대표 설계/장시간/RSS/전체 disk gate는 잔여이고 화면은 마지막 통합까지 보류한다. [구현·전후 계측·검증·다음 단계](ide-h7q-semantic-agreement.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7P 최신 — pyslang 연동 경로·위치 계산 비용 (2026-10-13 UTC)

기존 pyslang bridge의 완성 호출 안에서 canonical 경로를 재사용하고, 같은 SourceManager의 UTF-8→UTF-16 좌표를 최대4MiB payload/64 buffer/4096 point로 재사용한다. 다음 요청/independent test에는 공유하지 않고 source/파일·Core·journal 검증과 의미 lookup/default·실제 취소/cleanup은 유지한다. 자체 compiler/simulator 개발은 아니다. 실제 Python helper lstat14675→9763/테스트,300 RTL+대형 Unicode/ports/선언의 공유 완성5회 중앙값1417.6→991.9ms·completion CPU556.5→224.1ms·분석/완성/hierarchy20쌍 JSON hash 일치를 확인했다. 작은 IPC 지연 개선과 전체 RSS 감소는 확인하지 않았다. Linux 전체 **307 PASS/0 FAIL/1 Windows batch SKIP(총308개)**·기존39/새guard4 PASS·runtime/language build. 좌표 전체 byte/BOM/CRLF/astral·상한 fallback·fresh manager/overlay·alias retarget과 복구/정리/원본 보존을 통과했다. 다음 H7Q는 pyslang 연동의 별도 package 시작·default/완성 traversal/lookup·실제 요청 대기 비용이다. Windows 공식 본체/native watcher/client/화면·대표 설계/장시간/RSS/전체 disk gate 유지·화면은 마지막 통합으로 보류한다. [구현·전후 계측·검증·다음 단계](ide-h7p-pyslang-positions.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7O 최신 — 미설정 폴더 재검사·inline macro 문맥 (2026-10-13 UTC)

실제 read/lstat 부재만 ProjectManifestMissing으로 분류하고 missing root의 source/peer 이벤트 재검사를 멈췄다. root/parent shallow 복구 감시와 등록 뒤 재읽기·manifest/journal/ancestor 복구를 유지하며 malformed/include/source ENOENT는 보수적으로 처리한다. inline object/function macro 뒤 실제 compiler 기반 signal/package/서명 완성을 복구하고 directive/argument·block/template 보호를 유지했다. plaintext static header의 미저장 복원도 통과했다. Linux 전체 **303 PASS/0 FAIL/1 Windows batch SKIP(총304개)**·최종guard28 PASS·초기관련59 PASS·runtime/language build. actual IPC의 missing unrelated read1→0·mixed read2→1과 baseline inline query 미실행→fresh symbol을 확인했다. 최초 recovery watch 확인 read 비용과 새로 정상 실행되는 query 시간을 latency 개선으로 표현하지 않는다. 다음 H7P는 compiler point/path·default signature/완성 traversal와 별도 package 시작 비용이다. Windows 공식 본체/실제 watcher/client/화면·대표 설계/RSS/전체 disk gate를 유지하고 화면은 마지막 통합으로 보류한다. [구현·재현·검증·다음 단계](ide-h7o-semantic-context.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7N 최신 — 요청 안에서 컴파일러 시작 비용 공유 (2026-10-13 UTC)

독립 테스트를 한 요청의 Python 프로세스에서 순차 분석하여 시작/import만 공유한다. 각 compilation·macro/header·같은 top의 격리와 공유 RTL 완성 교집합, 자동 package 검증·미저장/FS/journal·취소/실제 cleanup을 유지했다. 300 RTL/package/테스트2개에서 provider launch3→2, actual IPC 편집→완성6→4를 확인했다. Linux 전체 **293 PASS/0 FAIL/1 Windows batch SKIP(총294개)**·관련33 PASS·runtime/language build. incomplete batch 거절·두 번째 group 중 취소/retry·manifest 생성/오류 복구와 idle/status 추가 load/compiler0도 통과했다. 지연 변동과 Python peak RSS를 별도 기록하며 모든 응답/앱 메모리 개선으로 판정하지 않는다. 다음 H7O는 미설정 manifest의 typed 분류·안전한 복구 감시와 inline macro 뒤 code completion 제한, package/default/완성 비용이다. Windows 공식 본체/실제 watcher/client/화면·실제 설계/RSS/전체 disk gate 유지·화면은 마지막 통합으로 보류한다. [구현·단계별 계측·검증·다음 단계](ide-h7n-semantic-request.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7M 최신 — 소스 범위별 분석·감시 비용 (2026-10-13 UTC)

validated source prefix(package/test/literal/external 포함)로 healthy root의 파일/편집 이벤트를 좁히고, 기존 RTL watcher가 덮는 경로의 dynamic 등록과 recursive parent 아래 중복을 제거했다. 신규 감시 확인 read는 자기 root의 nonempty 감시 변경에만 적용하며 include/journal·unknown/error 안전성을 유지한다. actual IPC/Python 3 roots×300 RTL(900개)/3회에서 startup compilation6→3·local edit/100 notifications3→1·normal dynamic900→0(unknown peak 약903→4), shared header3→실제2 roots, unconfigured/generated/status 이벤트 추가분석0을 확인했다. 외부 glob 누락 뒤 생성·비RTL source 구성·held peer query 유지와 watch ack 뒤 old error 상태 차단도 통과했다. 288 PASS/0 FAIL/1 Windows batch SKIP(총289개, 순차 전체)·관련25 PASS/최종guard23 PASS·runtime/language build. CPU/작업 수 감소를 모든 응답 지연 개선으로 판정하지 않는다. 다음 H7N은 compiler 시작/parse/elaboration·package/test와 편집→완성 대기 경로, mixed/error root idle 비용 분리다. Windows native watcher/LanguageClient/host·공식 본체/화면·실제 설계/RSS/전체 disk gate는 잔여다. [구현·규모 계측·검증·다음 단계](ide-h7m-semantic-scale.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7L 최신 — 실제 입력·파일 감시·설정 복구 무효화 (2026-10-13)

컴파일러가 실제로 읽은 source/header와 expanded include·누락 후보를 추적하고, 확인된 입력 밖의 generated 이벤트만 제외한다. 비RTL·외부 include의 directory 감시를 표준 LSP 등록/해제 ack로 관리하고 신규 감시 뒤 재읽기한 결과만 게시한다. 동일 실제 IPC/Python fixture의 generated100개 추가분석1→0, .inc WIDTH4→8의 기존 stale3:0→갱신7:0, previous.toml 변경 뒤 기존 stale Ready→Analysis failed/복구 전 query 차단을 확인했다. 실제2 roots 공유 header 갱신·root 제거 감시 해제·late old-handle held query 취소/명시적 recovery·drain cache/live0도 통과했다. 이전 headless의 workspaceFolders capability 누락을 바로잡아 remove/add 경계를 다시 검증했다. 278 PASS/0 FAIL/1 Windows batch SKIP(총279개, 순차 전체)·관련16 PASS·runtime/language build. 일반 RTL 이벤트는 공유/glob 안전성을 위해 여전히 all-root이며 새 의존성 감시 발견 시 확인용 compilation 비용이 있다. 다음 H7M은 수백 RTL 규모의 감시/재분석 비용과 일반 이벤트 root 범위다. Windows 실제 watcher/LanguageClient/host·공식 본체/화면·실제 설계/RSS/전체 disk gate는 잔여다. [구현·전후 근거·검증·다음 단계](ide-h7l-semantic-inputs.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7K 최신 — 언어 서비스 재시작·idle·종료 확인 (2026-10-13)

최신 요청 하나로 runtime probe/restart를 모으고 실제 취소/정리 뒤에만 replacement한다. 상태 bar는 조회1개·완료 뒤1500ms·focus/RTL 가드로 바꿨다. actual adapter/API 모델20 restart의 probe/client20→1, held probe21→2/최종client21→1, slow status11→1을 확인했다. prepareShutdown의 provider join→native stop→소유 IPC parent close를 사용하고 불확실한 cleanup/stop/disconnect는 quarantine·자동/수동 새 시작 거절한다. 이전/expected-close callback은 새 client를 막지 않는다. 실제 runtime probe/Node IPC/Python4 exit·drain cache/live0·포함한 .rtl header3:0→7:0/원본 불변을 확인했다. 264 PASS/0 FAIL/1 Windows batch SKIP(총265개, 순차 전체)·관련51 PASS·최종 신규18 PASS·runtime/language build. Generated notification100개는 여전히추가분석1회여서 다음 H7L에서 실제 입력 의존성/파일 이벤트·journal 무효화 범위를 확인한다. Windows/Electron 실제 client/host 종료·공식 본체/화면·실제 설계/RSS/전체 disk gate는 잔여다. [구현·전후 계측·실제 IPC·검증·다음 단계](ide-h7k-language-lifecycle.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7J 최신 — 언어 분석 burst·공유·종료 (2026-10-13)

언어 서버 provider 작업을2 active/32 대기로 제한하고 root/generation/exact query의 동시 요청만 공유한다. caller별 취소·마지막 caller 취소 뒤 실제 cleanup slot 유지·stale 결과 차단·close join·cleanup 실패 quarantine을 적용했다. 실제 stdio LSP/Python에서3 roots/100 watch/20 concurrent query의 초기 실제 query20→1, held root process3→2·원본/unsaved/peer 취소/새 요청 재분석·root remove/add·종료 cache0을 확인했다. 기존 debounce의 초기 root 분석3회는 양쪽 동일하다. 이전 종료 응답 뒤 temp3 잔류 FAIL을 재현했고 transient capacity는 새 편집 없는 on-demand 재시도로 복구한다. 246 PASS/0 FAIL/1 Windows SKIP(총247개: 전체246개 + 최종 신규capacity1개 분리 검증)·최종 관련35 PASS·runtime/language build. 다음 H7K는 언어 서비스 시작/재시작·idle/generated 이벤트 비용이다. Windows LanguageClient stop/IPC/taskkill·공식 본체/앱·실제 설계/RSS/전체 archive disk gate는 잔여이며 화면 검증은 보류한다. [구현·실제 진단·검증·다음 단계](ide-h7j-semantic-burst.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7I 최신 — 반복 설정 검사 비용·성능 요구 (2026-10-13)

요청 내 검증한 설정 snapshot을 parser와 최종 게시 검사에 공유해 반복 저장 전체 scan7→3회/current 읽기18→7회·고정1MiB 버퍼 제거를 구현했다. SHA/경로·membership/short read·late old-handle/실제 crash·lease/recovery·abort/join을 유지한다. 동일96개/67KB 합성 fixture3회에서 저장 중앙값1270→662ms·읽은 bytes91.7→39.3MB·file open2716→1169, 신규 회귀의 이전 코드3 FAIL/3 PASS를 재현했다. 238 PASS/0 FAIL/1 Windows batch SKIP(총239개, 순차 전체)·runtime/language build·최종 신규7 PASS·writer protected true/exit0. 실제160회 저장/주기적 retirement도 PASS(이번 약110초; 과거252초와 별도 실행 관측). 가볍고 빠른 VS Code/PyCharm 느낌을 제품 요구와 성능 계획에 기록했다. 다음 H7J는 파일 이벤트/의미 분석 요청 burst·중복 작업과 취소/갱신을 headless로 점검한다. Windows 공식 본체/NTFS/앱 화면·실제 설계/RSS·전체 archive disk gate는 잔여다. [구현·계측·검증·다음 단계](ide-h7i-import-save-cost.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7H 최신 — 설정 기록 별도 보관·조회 비용 (2026-10-13)

명시적 검토·확인 뒤 오래된 정상 설정 기록을 별도 보관하고 최근32개·pending/unknown 기록은 active에 유지한다. 현재 설정·파일 bytes/inode를 보존하며 archived 기록은 자동 변경 검사에서 제외한다는 정책을 UI에 설명한다. 128개 중96개 보관→다음 저장과 실제160회 저장·partial abort/crash/fresh retry·close join을 통과했다. 요청 내 current2회/8개 병렬 검증으로 같은128개 합성 기록의 bytes25.8→17.3MB·중앙값2440→272ms를 관찰했다. 231 PASS/0 FAIL/1 Windows SKIP(총232개: 전체 본체230개 + 최종 신규guard2개 분리 검증)·최종 관련30 PASS·runtime/language build. Windows case-only realpath와 invalid UUID temp2 FAIL을 재현해 보완했고 Windows 실제 파일/화면 수용은 미실행이다. 자동 삭제·전체 disk cap은 없다. 다음 H7I는 반복 저장 guard/scan 중복 비용 분리와 안정화 잔여 수용표다. RSS/실제 설계·Windows 공식 본체/NTFS/물리 통합 gate를 유지한다. [구현·정책·계측·검증·다음 단계](ide-h7h-import-journal.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7G 최신 — 설정 게시 후보 보존·명시적 복구 (2026-10-12)

외부 writer의 마지막 변경을 포착해 현재/이전/요청한 설정을 journal에 보존하고, 비어 있는 경로에만 게시한다. 중단·충돌 후보는 자동 채택하지 않고 설정 복구에서 읽기 전용 비교 후 명시적으로 선택한다. old open handle 지연 쓰기·실제 capture/link/commit crash4경계·복구 자체 경합·stale/readonly/BOM·읽기 중 게시 중단 차단을 확인했다. 보관 이력/로그/source/파형을 유지하고 현재 설정이 유효하면 복구 후 Run을 해제한다. 관련43 PASS·overlay3 PASS·Git HEAD의 실제 owned3파일 migration PASS·Linux 전체215 PASS/0 FAIL/1 Windows batch SKIP(총216)·runtime/language build. H7F의 외부 bytes overwrite FAIL 진단은 H7G 재실행에서 protected true/저장 거절/세 후보 확인 PASS/exit0이다. 다음 H7H는 journal 보관량·반복 저장/조회 비용과 장기 사용 정책이다. 현재128 transaction gate·자동 prune 없음·전체 scan 한계, RSS/실제 설계·Windows 공식 본체/NTFS/실제 복구 UI·물리 통합은 잔여다. [구현·회귀·최종 근거·한계](ide-h7g-import-publication.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7F 최신 — 손상 프로젝트 보관 이력·writer crash 복구 (2026-10-12)

현재 DUT/TOML 손상·삭제/linked 상태에서도 retained history를 먼저 읽고 historyOnly 행의 로그/source/파형을 보존한다. Run/Explorer·현재 입력 비교/diff는 잠그고 복구 inspect/Apply에서 해제하며 source row도 다시 연결한다. log root/epoch·A/B/A/close join을 보완했다. 새 PID/UUID lease directory는 실제 writer의 게시 전/후 종료와 fresh retry, 지연 stale reclaimer의 새 owner 보호를 통과했다. legacy/unknown/live lock과 orphan temp는 무조건 삭제/승격하지 않는다. 이전 inspect1 FAIL 재현·관련26 PASS·client/overlay8 PASS·Linux 전체196 PASS/0 FAIL/1 Windows batch SKIP(총197)·runtime/language build. 별도 비협력 writer 진단은 마지막 검사/rename gap에서 external bytes overwrite를 재현해 FAIL/exit1이며 일반 PASS에 합산하지 않는다. 다음 H7G는 이 최종 경합의 보관/복구 journal·publication 설계다. Home/contract 이전 owned hash를 기록했고 공식 TS7/target emission·Windows 실제 lease/보관 UI·RSS/실제 설계/물리 통합은 잔여다. [구현·재현·FAIL 경계·다음 단계](ide-h7f-project-recovery.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7E 최신 — 보관 소스 cache 해제·RSS 원인 분리 (2026-10-12)

보관 source cache를64MiB/256 entries LRU로 바꾸고 model removal·project 전환·dispose 시 해제, stat/read coalescing·무효 pending 거절·root/epoch·A/B/A/late 탭 open 보호를 보완했다. 이전 provider의 모델 제거 무효/stale navigation2 FAIL 재현, 관련13 PASS·Linux 전체187 PASS/0 FAIL/1 Windows batch SKIP(총188)·runtime/language build. 같은4,096신호 retained VCD로 idle/trace/default/arena2 진단을12회씩 수행해144 worker 전부 exit·thread11→15→11·worker live heap 첫/마지막 약19.8MiB를 확인했다. glibc helper에서 RSS 일부 반환을 확인했지만 default trace 종료375.7→진단 trim345.3MiB, Anonymous317.3MiB가 남아 RSS 회복 전체는 미해결이다. allocator 변경/trim은 진단 child 한정이며 app에 넣지 않았다. Home 이전 owned hash와 새 cache overlay를 기록했다. 공식 본체 TS7/target emission·실제 model/tab/diff 해제·Windows 화면은 미실행. 다음 H7F는 손상/누락 프로젝트의 보관 이력 접근·외부 writer/crash 복구이며 RSS/native profiler·실제 설계/Windows 통합 gate는 유지한다. [구현·재현·계측·한계](ide-h7e-cache-memory.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7D 최신 — 보관 결과 복원·파형 reader 종료·메모리 계측 (2026-10-12)

파형 열기에 root/epoch·A/B/A·종료 guard를 연결하고, trace 검증 abort/join·반복 close/dispose join·실제 worker 종료까지4개 slot 유지로 보완했다. 기존 경로의 gated 종료/반복 close2개와 stale open1개 실패를 재현했다. 새 host의 과거 run/최신 분리·저장 뷰·원본 삭제·trace/settings 손상 복원 보호, 별도 OS process의 runId/default view/32개 신호 재열기를 확인했다. Linux 전체176 PASS/0 FAIL/1 Windows batch SKIP(총177)·runtime/language build. 4,096 신호/262,144 changes·reader4개×6회 및 기존 실제 Verilator VCD2개 조회 PASS·parent26 created/26 exited/live0, 새 simulation/화면 없음. RSS는61.4→종료 후365.8MiB·main heap8.6→10.8MiB로 worker 종료와 별개 잔여다. 다음 H7E는 RSS 원인 분리·장시간/실제 설계와 보관 source64MiB cache/탭 해제 경계이며 Windows 공간/탭/선택·종료/taskkill·공식 본체 수용은 마지막 통합으로 남긴다. [근거·계측·한계](ide-h7d-waveform-restoration.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7C 최신 — 실제 취소·정리 실패·IPC 종료 보호 (2026-10-12)

실제3단계 child tree/peer·leader 선종료·timeout·정리 거절/지연·result 쓰기 실패를 검증했다. 기존 group kill 실패의 parent-only fallback/무한 대기를 재현·보완: cleanup failure는 FAIL/별도 kind·history 보존·batch 중단·session quarantine·close reject, 정리 확인5초 상한·late log/notify 억제. Node IPC close finally 해제와 disconnect/dispose error routing도 보완했다. 관련31+channel3 PASS·Linux 전체171 PASS/0 FAIL/1 Windows batch SKIP(총172), runtime/language build. 실제 Verilator3회 passed→cancelled→passed·취소 전 live build group8/후0·원본/이전 VCD/이력3 보존 PASS, pinned base+real host의 headless Node adapter3묶음 PASS. 앱 화면/Windows taskkill·공식 전체 본체 TS7 타입/target emission은 이번 미실행. Node overlay는 이전 owned bytes hash를 기록했다. 다음 H7D는 재시작 복원·파형 reader lifecycle/메모리이며 Windows 종료 안내·join/미저장 보호는 마지막 통합 수용으로 남긴다. [구현·실패·실제 근거·한계](ide-h7c-process-cleanup.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7B 최신 — 보관 검증 비용·조회 취소 보호 (2026-10-12)

300 RTL/1000 이력의 history·설정·보관 검증·saved/editor 포착·host 조회 비용을 분리했다. 요청별 identity Map·최대8개 병렬 retained 읽기를 적용하며 모든 경로/hash/include/provenance 검증을 유지한다. 실패/abort 시 reader join, source/compare의 project epoch·A/B/A 전환 거절과 close 시 조회 취소/대기를 보완했다. 관련21 PASS·Linux 전체157 PASS/0 FAIL/1 Windows batch SKIP(총158)·runtime/language build, 기존 실제 VCD/FST4개 retained 입력/trace 재검증 PASS(새 simulation 없음). 동일 fixture 중앙값 retained797→133ms·host 비교1827→918ms·소스 읽기623→393ms 관찰, 계측한 I/O 수 동일·부하 변동/전체 성능 gate 유지. 앱 화면/Windows 전체 본체는 이번 미실행. 다음 H7C는 실행 취소/종료·child tree 정리/실패 경계이며 Windows 안내·복원은 마지막 통합 수용으로 남긴다. [구현·계측·회귀·남은 범위](ide-h7b-input-validation-cost.md). H7/베타/배포 전체 완료는 아니며 아래는 역사다.

## H7A 최신 — H6 범위 판정·이력 삭제 복구 (2026-10-12)

[H6 수용표](ide-h6-acceptance-summary.md)에서 기본 경로를 판정하고 H7을 시작했다. 최신 trace/log 삭제로 이력이 사라져 과거 run이 최신이 되던 결함을 보완했다. status/runId·보관 입력 유지, missing artifact 안내·무쓰기 복원, 이력 I/O 최대8개 병렬 검증/정렬을 적용했다. Linux 최종150 PASS/0 FAIL/1 Windows batch SKIP(총151)·runtime/language build. 300 RTL/1000 이력 합성 검증 PASS, 동일 fixture 이력 중앙값100개793→326ms/1000개1486→261ms 관찰; 부하 변동이 크고 비교·보관 읽기 비용은 미해결. 앱 화면/Windows 전체 본체는 이번 미실행. 다음 H7B는 비교·보관 검증 비용 분리→종료/복원·중간 규모/메모리·마지막 Windows 통합 수용. clean Windows/FST 표시/enum 등 gate 유지·H7/베타/배포 전체 아님. [구현·실패·측정·한계·인수인계](ide-h7a-history-recovery.md). 아래는 역사다.

## H6D 최신 — 과거 run 명시적 비교·소스 차이 (2026-10-12)

선택 이력 ‘입력 비교’→saved/current 상태 분리·runId 바인딩·buffer 동결·root/epoch/선택 guard·편집 후 다시 비교, ‘소스 차이’→읽기 전용 보관/현재 편집기·삭제 파일 무생성을 연결했다. 최신 비교/결과·history 보존, 전체 history 자동 반복 검사 없음. 최종145 PASS/0 FAIL/0 SKIP·runtime/language build·공식 전체 본체 타입0 errors/emission3파일0 errors. trusted native4시나리오/exit0: 과거 matching→dirty 무효화/changed→실제 diff/삭제 package 거절→복구 matching·원형/최신 runId/history29/창 보존, 새 시뮬레이션 없음. Core gated 프로젝트 변경/요청 동결 수용, UI 진행 중 물리 race/규모 등은 별도. 다음 H6 수용표/잔여 범위 판정→H7 안정화. clean Windows/FST/enum/encoding·물리/복원 등 gate 유지·H6/베타 전체 아님·배포 없음. [근거·범위·다음 작업](ide-h6d-selected-run-comparison.md). 아래는 역사다.

## H6C 최신 — 보관 소스 읽기 전용 보기 (2026-10-12)

결과/선택 이력 ‘보관 소스’→검증된 RTL/package/header 목록·내용→runId 가상 읽기 전용 Code 탭을 연결했다. 원본 수정/삭제·비등록 경로/변조 보호, 내용 hash/UTF-8·64MiB cache·저장/미저장 분류·현재 소스 구분, 기존 잘못된 실행 안내 수정. 최종144 PASS/0 FAIL/0 SKIP·runtime/language build·공식 전체 본체 타입0 errors/emission3파일0 errors. trusted native3시나리오 및 새 프로세스3시나리오 각 PASS/exit0: 삭제된 package VALUE8/SystemVerilog·실제 typing/provider write 거절·보관 TB/동일 파형·원형 source/TOML/history29 보존·정상 종료, 새 시뮬레이션 없음. 다음 H6D 선택한 과거 run의 명시적 입력 비교/소스 탐색 UX→H6 범위 판정→H7. 물리/encoding/규모·clean Windows 등 gate와 UTF-8/cache/의미 분석 제한 유지; H6/베타 전체 아님·배포 없음. [구현·수용·한계·다음 단계](ide-h6c-recorded-source-view.md). 아래는 역사다.

## H6B3 최신 — 현재 내용 비교·package/header/BOM·복원 (2026-10-12)

saved/current 입력 비교를 분리하고 dirty/content debounce·동결·최신 revision 게시·동일 text/다른 버전 matching·이전 run 비교 미실시 표시를 연결했다. 실제 UTF-8 BOM 수집 누락을 발견해 한 번만 포함하도록 수정. 최종144 PASS/0 FAIL/0 SKIP·runtime/language build·공식 본체 전체 타입0 errors/emission2파일0 errors. trusted native3시나리오/실제4파일 VALUE10 PASS·TOML 보호·current 일치→편집 changed→복원 matching·원형 소스/설정 복구, 새 프로세스1시나리오/동일 retained VCD·4파일 provenance/정렬 PASS·각 exit0/history29. timescale fixture/BOM 제품 오류/검증 include 복구 실패와 hash 대조·관리 Apply 복구 근거 보존. 다음 H6C 보관 소스 읽기 전용 보기/이전 run UX→H6 범위 판정→H7; encoding/물리/규모·clean Windows 등 gate 유지·H6/베타 전체 아님·배포 없음. [구현·실패/복구·다음 인수인계](ide-h6b3-current-input-comparison.md). 아래는 역사다.

## H6B2 최신 — GUI 미저장 Run·실제 앱 수용 (2026-10-12)

개별/선택/전체·Explorer 실행의 동기 dirty RTL/header 수집→공통 IPC/host/Core snapshot을 연결했다. 원본 저장 없음·UTF-8/BOM·크기/경로/신뢰·미저장 TOML 보호, 결과/이력 ‘미저장 입력’·사용 파일 안내. 최종143 PASS/0 FAIL/0 SKIP·runtime/language build·공식 본체 TS7 전체 타입0 errors/공식 emission3파일0 errors. trusted native5시나리오/exit0·실제6회(선택1/전체2/invalid FAIL/취소/Explorer retry)·history21→27, 빌드 중 추가 편집 격리·managed VCD 정렬/이전 탭·dirty/원본 bytes 보존·owned edit 복구/정상 종료. scalar fixture/행 준비 대기와 잘못 선택한 TS5.9 heap 실패를 보완하고 근거 보존. 현재 buffer 정확 비교·dirty package/header/BOM/encoding/restart·과거 source UX는 H6B3 잔여. 다음 H6B3→H6 범위 판정→H7; H6/베타 전체 아님·기존 gate·배포 없음. [실제 수용·한계·인수인계](ide-h6b2-unsaved-run-ui.md). 아래는 역사다.

## H6B1 최신 — 미저장 입력 Core/서비스 snapshot (2026-10-12)

실행 요청 시 편집 text/version 동결→복사본 source/package/header/include 포착·검증→원본 무저장 실행·provenance/history 보존을 구현했다. 실패/비지원 backend의 디스크 fallback 금지·경로/크기/junction/생성물 보호. 최종142 PASS/0 FAIL/0 SKIP·runtime/language build, actual Verilator5회(저장 VALUE1→미저장 두 top VALUE2→잘못된 TB FAIL→저장 VALUE1)/3묶음 PASS·VCD 값/원본5파일/이전 trace/history5/격리 확인. 첫 전체139/140의 source 갱신 경쟁을 보완·후속 검사 coalesce 재현 테스트 추가·실패 근거 보존. GUI/IPC는 아직 미연결이며 현재 앱/CLI 기본 실행은 저장된 입력이다. 다음 H6B2 dirty buffer 수집/Run IPC/host·결과 표시/실제 앱 수용→H6 잔여/H7. H6/베타 전체 완료 아님·기존 gate/배포 없음. [계약·근거·다음 인수인계](ide-h6b1-editor-input-snapshot.md). 아래는 역사다.

## H6A2 최신 — 기본 자동 파형·GUI/CLI 수용 (2026-10-12)

Verilator 기본 실행을 IDE 생성 C++ driver로 전환했다. 원본 dump 코드/C++ 작성 없이 VCD/FST/off·원래 top 계층 유지, run별 고유 trace를 artifact로 명시하고 Core fallback 혼동을 차단했다. 새 예제 dump 제거·기존 dump/원본 보존. 최종136 PASS/0 FAIL/0 SKIP·runtime/language build, actual service/CLI8항목 PASS·새 예제 VCD/FST4회+보존 PASS·trusted native3항목/exit0(기존 dump 동시 생성·managed 내장파형 정렬·이전 탭/공간 왕복/원본 유지), history14→15. 검증 JS/숨겨진 frame 대기 오류를 보완하고 실패 기록 보존. browser overlay 미변경으로 전체 upstream 타입/emission 반복 없음, 기존 H5G3 근거 유지. H6A 기본 경로 완료·H6/베타 전체 아님. 다음 H6B 미저장 입력 snapshot 계약/실행→H7 잔여. 기존 clean Windows/FST 표시/enum/규모/물리·복원 gate·배포 없음. [근거·한계·다음 작업](ide-h6a2-managed-waveform.md). 아래는 역사다.

## H6A1 최신 — 자동 파형 prototype·방식 결정 (2026-10-12)

IDE 생성 C++ driver로 원본 RTL 무변경 VCD/FST/off·timing/assert/다중 top/기존 dump/$fatal/취소·dump 토큰 없는 별도 RTL을 실제 검증했다. wrapper는 계층을 추가하여 기본 후보에서 제외. 전체134 PASS·runtime/language build, 최종 보강 runtime/관련1 PASS·실제9항목/exit0. Windows context 시간 링크 옵션·모델 이름/버스 범위/시간 fixture 시험 보완과 실패 근거 보존. 현재 prototype만이며 기본 IDE/CLI --binary 경로 미변경·자동 dump 기본 적용/H6 완료 아님. 다음 H6A2 driver backend/Core 명시적 trace 연결·중복/파일명 정책·GUI/CLI 수용→H6B unsaved snapshot. 기존 gate·배포 없음. [근거·한계·다음 계약](ide-h6a1-managed-trace-prototype.md). 아래는 역사다.

## H5G3 최신 — 폴더 역할 보호·상속/예외 수용 (2026-10-12)

생성물/의존성 폴더·직접/상위 링크 지정 거절을 보완했다. 전체133 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 실제 앱4항목 PASS/trusted:true/exit0: 미저장 TOML Undo/무쓰기·실제 g++ 빌드 중 변경 거절/취소·링크/생성물 거절·상속/파일 override/제외/해제 및 실제 배지. 원형 TOML·이전 VCD 보존/history14(취소1추가), 임시 소유 폴더/junction 정리·정상 종료. 명령/IPC/DOM 수용이며 물리 메뉴/DPI/규모·H5/베타 전체 완료 아님. 다음 구현 H6A Verilator 자동 dump prototype→H6B saved/unsaved snapshot→H7 잔여. 배포 없음. [근거·한계·다음 단계](ide-h5g3-folder-guards.md). 아래는 역사다.

## H5G2 최신 — 저장된 폴더 역할·앱 재시작 복원 (2026-10-12)

역할 적용 후/새 프로세스 Code 초기 읽기에서 Explorer 아이콘 유지, 저장됨/초안 구분·canonical TOML/root/revision 보호. 빈/제외 경계 디렉터리 수집·링크/생성물 제외, 파일 override/실행 흐름 보존. 전체132 PASS/0 FAIL/0 SKIP·runtime/language build·전체 타입0 errors·최종 관련10 PASS, 실제 앱 저장3/새 프로세스 복원2항목 PASS/trusted:true/각 exit0. 기존 관리 Apply로 원형 TOML/DUT bytes/test 이름/history13 복구·전용 창 정상 종료. 물리 메뉴·상속/override/dirty/busy 종합 UX와 H5/베타 전체 미완료. 다음 폴더 잔여 수용→H6 자동 dump/snapshot. 배포 없음. [근거·한계·인수인계](ide-h5g2-saved-folder-roles.md). 아래는 역사다.

## H5G1 최신 — Explorer 폴더 역할 검토 UI (2026-10-12)

폴더 우클릭 RTL/Simulation/제외/상속 해제→기존 관리·분류 검토 연결, 검토 중 폴더 아이콘/직접·상속 표시. 파일 override·하위 규칙·원본/TOML/이력 보존. 최종129 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 실제 전용 앱4항목 PASS/trusted:true/exit0·history13 불변. 최초 타입 오류와 제한 환경 검증 실패/중단 기록 보존. 저장/적용 후 배지 지속은 아직 미구현: 다음 H5G2 저장된 역할 표시/재시작 수용→H6 자동 dump/snapshot. H5/베타 전체·배포 미완료. [근거·한계·다음 작업](ide-h5g1-folder-role-review.md). 아래는 역사다.

## H5F 최신 — Explorer TB 파일 행 실행 (2026-10-12)

Code 초기 프로젝트 읽기→등록된 대표 TB source의 실제 Explorer 행 hover/focus ▶·단일 실행/여러 top QuickPick·취소 무실행·공통 runner/Simulation 이동 연결. Code-OSS 내부 file registry 재사용, renderer 직접 수정 없음. exact 경로/Core 대표 source 기준·busy/비신뢰/미저장 TOML 제한. 전체126 PASS/0 FAIL/0 SKIP·runtime/language build, 최종 공식 전체 타입0 errors, actual 행/DOM/QuickPick5항목 PASS/trusted:true/exit0·tb.second 실제 Verilator PASS/VCD·Code 왕복/활성화·원본3개 bytes 불변·history13 유지. Emitter threshold0 listener 거절 결함을1024로 보완, URI 타입/숨겨진 row 시험·실패 정리 보강과 근거 보존. 물리 hover/키 조합/DPI·일반 multi-source top 선언 위치는 별도. H5F 행 실행 완료·폴더 역할/H5/베타 미완료. 다음 폴더 역할 우클릭/표시/분류 UX→H6 snapshot/자동 dump. 기존 gate·배포 없음. [근거·한계·인수인계](ide-h5f-explorer-run.md). 아래는 역사다.

## H5E2 실제 앱 수용 최신 — 파일 이벤트·미저장 보호·취소/복구 (2026-10-11)

사용자 직접 닫은 전용 창을 기존 trust로 재사용하여 actual watcher→추가/header/TB 후보 안내·미저장 TOML 보호·관리 Apply→matching·실제 g++ 빌드 중 header 삭제/Cancel 후 감지·이전 VCD 보존·삭제 source 복구5항목 PASS/trusted:true/exit0. 원형 config/source2 bytes 복원·history11(기존9+cancelled2)·reader 보존. 최종 공식 화면 emission/전체 타입0 errors·script syntax2 PASS. 최초 timescale fixture와 include 보존 정책 검증 실패를 기록/보강했으며 강제 overwrite 없이 managed Apply로 복구했다. 전체123/관련7 PASS는 H5E2 이전 자동 근거로 이번 반복 아님. H5E2 실제 흐름 수용 완료·H5/베타 전체 미완료. 다음 구현 Explorer TB hover Run/여러 top 선택·폴더 역할 UI→H6 snapshot/자동 dump. cold 시작 지연·세션 baseline/include override 한계·기존 gate 유지·배포 없음. [근거·한계·인수인계](ide-h5e2-source-sync-acceptance.md). 아래는 역사다.

## H5E2 최신 — 파일 구성 변경 감지·동기화 안내 (2026-10-11)

IDE 소유 imported 원형의 source/package/header 추가·삭제/분류 변경·세션 새 TB 후보를 읽기 전용 비교하고 Simulation 안내→테스트 관리 Apply로 연결했다. 감지 시 TOML 쓰기/의미 분석/Run 전 자동 반영 없음. debounce·실행/관리 중 보류·검사 중 이벤트 재확인·취소/revision 보호·기존 결과/수동 설정 보존. 전체123 PASS/0 FAIL/0 SKIP·runtime/language build, 최종 관련7 PASS·전체 upstream 타입0 errors/exit0. 실제 앱 파일 이벤트→안내 수용은 남으며 사용자 재개한 import-ui 창/신뢰를 유지했다. 세션 baseline의 재시작 제한과 bounded 전체 lexical scan을 명시. H5E2 구현/자동검증 완료·native 수용/H5/베타 미완료. 다음 실제 감지 UI 수용→Explorer/폴더 UX→H6 snapshot/자동 dump. 기존 gate·배포 없음. [근거·한계·인수인계](ide-h5e2-source-sync.md). 아래 기록은 역사다.

## H5E1 최신 — 등록 후 테스트 관리·적용 시 source 재탐색 (2026-10-11)

Simulation 테스트 관리→기존 top 체크/추가·제외→실제 slang 재분석/새 RTL-package-header 반영→Core 설정/이력 복원. canonical imported 원형만 명시적으로 관리, 일반/수동/미저장 TOML·원본·기존 결과 보호. 최종120 PASS/0 FAIL/0 SKIP·runtime/language build, CLI 보강 관리4 PASS·전체 upstream 타입0 errors·trusted native4항목/exit0·새 top 실제 Verilator/VCD/내장파형 PASS·원형 복원/이력9·reader2 유지. H5E1 완료·H5/베타 전체 미완료. source 자동 갱신은 적용 시점이며 background 감지/Run 전 자동 반영은 미구현. 다음 H5E2 변경 감지·동기화 UX→Explorer/폴더 UX→H6 snapshot/자동 dump. 기존 gate 유지·배포 없음. [근거·한계·인수인계](ide-h5e1-project-management.md). 아래는 역사다.

## H5D3 최신 — Windows source 파일명·trusted GUI 수용 (2026-10-11)

한글/공백/대괄호 source/header 실제 Verilator·VCD 및 오류/취소 cache 정리 PASS. GUI 기본 tool-directory 빈 값 탐색 결함 보완. 최종116 PASS/0 FAIL/0 SKIP·runtime/language build, 사용자 직접 trust 후 실제 top2 등록 substeps PASS→등록 복원/개별1·선택2·전체2 총5회 Verilator PASS/VCD·내장파형 정렬/이전 탭 보존·원본 불변·native 최종5항목/exit0. 초기 실패·검증 race/인자 보완 기록 보존. H5D3 수용 완료·H5/베타 전체 미완료·물리 클릭 수용은 별도. 다음 등록 후 test 관리/자동 source 추적·Explorer/폴더 UI→H6 snapshot/자동 dump. clean Windows/설치/FST/enum/규모/복원 gate 유지·배포 없음. [근거·재개 절차](ide-h5d3-source-paths.md). 아래는 역사다.

## H5D2 최신 — 실행 설정 전환·테스트 등록 (2026-10-11)

선택한 top 등록→lock/revision 보호 하 실제 slang 재분석→게시 전 Core 설정 검증→실행 TOML 전환→Simulation 목록 연결. literal source 표기/file.top name을 Core/CLI에 연결, 일반/수동 변경 TOML·원본 보존. 전체113 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 비신뢰 native7항목 PASS. 실제 Host 선택2+CLI named1/all2 총5회 Verilator PASS/VCD·한글/공백 root·.rtl 격리 확인. bracket 파일은 reader/semantic과 달리 기존 Windows adapter가 거절함을 실제 발견/기록. H5D2 구현 완료·trusted GUI 등록 성공/물리 수용·H5/베타 전체 미완료. 다음 trusted GUI 수용/어댑터 파일명 제한 보완→등록 후 테스트 관리/자동 source 추적·Explorer/폴더 UI→H6 snapshot/자동 dump. 기존 gate 유지·배포 없음. [실제 근거·제한·인수인계](ide-h5d2-execution-registration.md). 아래는 역사다.

## H5D1 최신 — 실행 top 의미 분석 확인 (2026-10-11)

가져오기 top 선택→기존 slang 독립 정교화→읽기전용 preview 구현. multi-top/file.top·package 의존 순서·header/include·옵션/정의·source 변경/취소 검증. 전체109 PASS/0 FAIL/0 SKIP·최종 보강5시험 재검증 PASS·전체 upstream 타입0 errors·비신뢰 actual앱7항목 PASS. trusted GUI 성공 표시/물리 top 선택은 미검증이며 실제 slang 성공은 Core/host 근거. pending TOML·테스트 목록·원본 변경 없음. H5D1 확인 단계 완료·H5D/베타 전체 미완료. 다음 H5D2 저장 직전 재검증→실행 TOML 전환/file.top reader 연결→GUI/CLI 실행 등록 수용. 기존 gate 유지. [근거·한계·인수인계](ide-h5d1-top-confirmation.md). 아래는 역사다.

## H5C 최신 — 가져오기 분류 저장·복원 (2026-10-11)

Simulation 분류 저장 버튼→IDE 소유 pending rtl.toml→새 host/refresh 역할 복원 연결. 명시적 저장만 작성·원본 불변·일반/수동 변경 TOML 보존, revision/협력 writer lock·원자적 공개·취소/읽기 전용/linked 경계, 미저장 TOML 저장 차단. 최종104 PASS/0 FAIL/0 SKIP·runtime/language build·전체 upstream 타입0 errors, 실제 import6항목 PASS. 실제 Windows 대소문자 경로 결함을 발견·보완했다. pending은 실행 manifest가 아니며 CLI/LSP 프로젝트 연결은 H5D에서 전환해야 한다. 물리/프로세스 재시작 복원·외부 writer 최종 경쟁/crash복구와 기존 베타 gate 유지. H5C 분류 저장 단계 완료·H5/베타 전체 미완료. 다음 H5D semantic top 확정·실행 manifest 전환/여러 top 실행 연결→Explorer/폴더 UI→H6 snapshot/자동 dump. [근거·소유 정책·인수인계](ide-h5c-import-persistence.md). 아래는 역사다.

## H5B 최신 — 프로젝트 가져오기 확인 UI (2026-10-11)

TOML 없는 프로젝트의 읽기전용 탐색을 Simulation 홈/실제 IPC에 연결했다. 파일 검색·소스 열기·폴더/파일 역할·제외/초기화·취소/재시도, 공간 왕복/refresh 상태 유지. 원본/TOML/.rtl 작성 및 테스트 자동 등록 없음. 최종100 PASS/0 FAIL/0 SKIP·runtime/language 빌드, 공식 화면 emission/전체 upstream 타입0 errors, 실제 앱 import4항목·기존 Simulation3항목 PASS/exit0. 명령 API 수용이며 물리 dropdown/규모 UX는 남는다. H5B 읽기전용 검토 완료·H5/베타 전체 미완료. 다음 H5C managed TOML 정책/원자적 저장·복원→H5D semantic 확정/여러 top 실행 연결→H6 snapshot/자동 dump. 기존 clean Windows/설치/FST/enum/규모/복원 gate 유지. [검증·인수인계·다음 순서](ide-h5b-import-review.md). 아래 H5A 이하는 역사다.

## H5A 최신 — 읽기 전용 프로젝트 탐색·분류 Core (2026-10-11)

IDE 소유 Core discoverProject로 .v/.sv/.vh/.svh·package/module/header/mixed·파일/최장 폴더 역할·여러 top 후보를 읽기전용 탐색. lexical 후보는 모두 확인 필요이며 semantic 확정 아님. .rtl/의존성/link 제외·stable 순서·취소/읽기 한도·TOML/원본 불변. 최종97 PASS/0 SKIP·runtime/language 타입/build PASS, 기존 preview 해시 불변,335파일/320top후보/20package/5header 약196ms(1회 합성 탐색; GUI/전체성능 수용 아님). H5A 기반 완료·H5 전체 미완료. 다음 H5B 탐색 확인 UI/host→managed TOML 정책/저장→semantic 확인·실행 연결. H3M trusted7 PASS와 기존 설치/FST/enum/규모/복원 gate 유지. [구현·검증·다음 단계](ide-h5a-project-discovery.md).
## H3M 최신 — trusted 실제 편집기 의미 분석 수용 (2026-10-11)

사용자 직접 trust 후 자체 격리 프로필의 일반 개발 host에서 module/scope/미연결port·함수 인자·미저장 진단/복구·definition/hover·module 의미토큰·Code/Simulation 왕복/TOML 제외7항목 PASS/exit0·디스크 불변. 최초 창 충돌과 extensionTestsPath의 메모리 저장소 trust:false 실패를 보존·verifier 보완; trust override/기존 profile 공유 없음. 두 script syntax PASS. 기존91개 자동 검증은 H3K 근거이며 이번 반복 아님. H3/H4/베타 전체 미완료·설치/clean Windows/FST/enum/규모/물리 gate 유지. 다음 H5A 읽기전용 탐색·분류 Core→H5 UI/설정→H6 snapshot/자동 dump. [실제 수용·실패·다음 작업](ide-h3m-trusted-semantic-acceptance.md).
## H3L 최신 — 의미 분석 GUI 검증 격리·대기 (2026-10-10)

사용자 직접 trust 처리는 현재 어려움. 자체 semantic-ui-te972r 프로젝트/profile과 prepare/verify·native semantic 절차 준비; trusted GUI 미실행. 실제 비신뢰 앱 w8eGoW7항목 PASS/exit0·두 script syntax PASS·자체 bundle 성공. 기존 profile 새 창은 자동 검토가 세션 충돌 위험으로 거절해 실행하지 않고 격리 대안 사용. 기존 창/신뢰/소스 보존, 설치/배포 없음. H3/H4/베타 전체 미완료. 다음 사용자 trust 가능시 GUI검증; 대기 중 독립 H5A 읽기전용 탐색/분류 기반 가능. [근거·재개·남은 순서](ide-h3l-semantic-ui-preparation.md).
## H3K 최신 — 도구 설정 UI 연결 검증·신뢰 변경 보완 (2026-10-10)

실제 editor adapter+실제 승인 서비스를 연결해 설치 거절/실패 재시도/승인 중 신뢰 해제/Notification 취소·정리/dispose를 검증했다. 신뢰 해제 시 설치 차단 예외를 정상 취소·안내로 보완. 최종91 PASS/0 FAIL/0 SKIP·runtime/language 타입 통과·내장 언어 bundle 성공. 외부 planner/UI 응답 대체 시험이며 물리 GUI/실제 설치 E2E 아님. trusted semantic GUI/물리 설치 UX·clean Windows·기존 잔여 gate 유지; H3K/H3/H4 전체·베타 완료 아님. 다음 trusted GUI 수용→H5 자동 탐색/폴더/multi-top→H6 자동 dump/미저장 simulation. [이번 결과·남은 범위](ide-h3k-tool-ui-validation.md). 아래는 역사다.
## H3J 최신 — 도구 설치 승인 UI·검증/진행/취소/재시도 (2026-10-10)

Simulation 홈 도구 설정·언어 상태 메뉴→editor-free 계획/승인 서비스→IDE 소유 MSYS2/slang installer 연결. 명시적 승인/만료 ID·프로젝트 밖 realpath 경계·captured tool home·취소/종료 정리, 사용자 지정 위치 Simulation 전달. 최종86 PASS/0 SKIP·runtime/language 타입·공식 emission/전체 upstream 타입0 errors, 실제 기존 simulation/language ready·설치0, native esJNBJ7항목 PASS. 초기 타입·native2회 실패는 보완/근거 보존. 다음 H3K는 trusted semantic/설치 UX 잔여 수용과 범위 판정→H5 discovery/폴더/multi-top→H6 자동 dump. clean Windows 실제 설치·물리/규모/기존 gate 유지; 사용자 trusted 기존 창 보존·자동 trust 금지, H3/H4/베타 완료 아님. [구현·수용·남은 범위](ide-h3j-tool-setup.md). 아래는 역사다.
## H3I 최신 — 의미 분석·모듈/포트/스코프·RTL 진단 (2026-10-10)

MIT semantic provider/Python bridge/LSP를 IDE 소유로 이식하고 내장 adapter·기존 slang 검증/재사용·신뢰 제한을 연결했다. 미저장 scope/포트·함수 인자·module tokens/정의 이동·RTL 진단, TOML 제외/설정 오류 상태 안내. 최종81 PASS/0 SKIP·runtime/language 타입 성공, 실제 slang/LSP·기존 tool probe PASS, native lEPFsB5항목 PASS(신뢰 제한+lexical). TOML parser1.9.1 보완·glob 중첩 제한; upstream glob advisory3개 경고는 열린 항목. 다음 H3J는 도구 설치 승인/진행/취소/재시도 UI와 trusted semantic GUI 수용. 물리/규모·H5 discovery·H6 자동 dump 등 유지; H3/H4/베타 완료 아님. [구현·검증·경계·인수인계](ide-h3i-semantic-editing.md). 아래는 역사다.
## H3H 최신 — 독립 IDE 내장 RTL 편집 (2026-10-10)

VSIX의 검증된 lexical 엔진·editor adapter·TextMate grammar/언어 설정/아이콘을 MIT 출처와 함께 IDE 소유로 복사했다. 내장 기능 등록/기본 예약어·시스템 함수/명시적 module·package·case·begin·always* 템플릿/Enter 연결; sibling import·외부 확장 지원 없음. 최종70 PASS/runtime·언어 타입 성공, native gj9pRi4항목 PASS(신뢰 없이 파일4종/실제 snippet cursor/완성), 기존 파형 ez5zG3 4항목 PASS. 공식 emission/전체 upstream 타입0 errors·exit0도 확인. 다음은 H3I semantic module/port/scope·RTL 진단 이식→도구 설치 승인 UI. 물리 Tab/Enter·테마와 규모 수용은 별도이며 H3/H4/베타 완료 아님. [범위·근거·인수인계](ide-h3h-lexical-editing.md). 아래는 역사다.
## H3G 최신 — 실행 이력·코드 변경 표시 (2026-10-10)

테스트별 최근100개 project history에서 이전 run을 선택해 로그/파형을 열고, 최근 실행의 saved-input 변경·비교 불가와 미저장 변경을 구분했다. 파일 변경 debounce·비교 취소/revision guard·이전 reader/default 유지. 최종54 PASS·전체 타입0 errors·native UpFkgw4항목 PASS/exit0(저장 이벤트→stale/기존파형 보존), 실제 과거 b6119f7e 선택/로그/파형 PASS. 최초 타입 API 오류와2회 초기화 시험 race는 보완·기록 보존. 원본6개 불변/retained5개 run 유지. 다음은 H3 언어 등록/highlight/snippets/lexical 편집 이식→semantic/설치 UI. H4 이력 정리/개별 과거 비교·규모/파형 잔여 수용은 남는다. 베타·배포 완료 아님. [구조·수용·실패·다음 순서](ide-h3g-history-stale.md). 아래는 역사다.

## H3F 최신 — 테스트별 신호 보기·기본값 저장 (2026-10-10)

내장 파형의 여러 보기 저장/덮어쓰기/이름 변경/삭제/default를 IDE 소유 store·Node IPC에 연결했다. 경로/순서/radix/색/bus 펼침 저장, 누락 신호 유지·다른 탭 revision 충돌 거절·.rtl 안 설정 격리. 최종53 PASS·전체 타입0 errors·native DC5Tja default bus+8bit9행/정렬/왕복 PASS, 실제 Save→기본 지정→닫기/재열기 복원 PASS. 최초 junction EPERM과QuickInput 타입1오류는 최종 검증으로 보완하고 기록 보존. 원본6개 불변/retained5개 run 유지. 다음은 history/stale·기록run 선택/열기; preset 관리 상세 물리/기존 파형 잔여 수용도 유지. H3/H4 전체·베타·배포 완료 아님. [구조·사용·수용·한계·다음 순서](ide-h3f-waveform-presets.md). 아래는 역사다.

## H3E 최신 — 파형 실제 조작·시간 이동 보완 (2026-10-10)

실제 앱에서 Go 시간 이동 미동작을 발견해 form 제출 의존을 제거하고 버튼/Enter 직접 호출로 수정했다. 실제 VCD2개 탭·bus 펼침/드래그·신호 추가/제거·확대/구간 확대/Fit·Code 왕복 상태 유지 PASS. 전체51 PASS/exit0(runtime 타입 포함), native blTGbN2항목 PASS/exit0, 새 실행의 이전 reader/bytes 보존 회귀 보강, 원본6개 해시/retained5개 run 불변. 새 profile은 untrusted이며 GUI 새 Run은 하지 않았다. 다음은 테스트별 preset/default→history/stale 연결; Ctrl/Shift 그룹 드래그·긴 시간 실제 화면·새 GUI 실행 중 이전 탭은 추가 수용으로 남는다. H3/H4 전체·베타·배포 완료 아님. [실패·수정·수용표·인수인계](ide-h3e-waveform-interaction.md). 아래는 역사다.

## H3D 최신 — 실행별 내장 VCD 파형 연결 (2026-10-10)

Simulation 결과의 파형 버튼→실행별 sandbox 파형 탭·최대4 reader·Code 왕복 보존을 연결했다. 기존 renderer/worker를 IDE 소유로 수동 이식했고 VSIX/부모 runtime/build 참조가 없다. 절대 시간 눈금·bus 펼치기 등 기존 화면 유지, 취소에 dump 안내를 붙이던 문구 보완. 최종51 PASS·전체 타입0 errors·실제 retained Verilator VCD2개 read/query PASS·native TYZYUm canvas2/정렬/왕복/동일run 재사용 PASS. 최초 srcdoc native LPhen0 FAIL은 고정 앱 리소스 URL로 보완; 실패 기록 보존·보안 정책 변경 없음. 다음은 실제 파형 interaction/닫기/이전run 보존 수용→preset/default·history/stale 연결. FST 표시·enum 소스 매핑·언어/설치 등 미완료; H3/H4 전체·베타·배포 아님. [구현·검증·실패·다음 순서](ide-h3d-waveform.md). 아래는 역사다.
## H3C 최신 — 실제 Simulation 버튼 검증 완료 (2026-10-10)

사용자가 preview 폴더를 직접 신뢰한 후 실제 GUI의 개별 Run·g++ 빌드 중 Cancel·선택 재시도·전체 순차 실행을 확인했다. 4 PASS/1 cancelled, 실행 중 Code/Simulation 왕복·선택 보존·retained 로그·새로고침 최신 결과 복구 PASS. 취소 후 해당 빌드 프로세스0, 원본 파일/해시 불변·생성물 .rtl 안·성공4회의 이전 VCD 보존 확인. 제품 코드 변경/재빌드/패키징 없음; H3B 자동43 PASS·타입0 errors는 이전 근거다. 다음은 내장 파형 이식/해당 run 열기와 취소 결과의 부정확한 dump 안내 보완, 이후 history/stale·언어/설치 흐름. H3/H4 전체·베타 완료 아님. [물리 수용·근거·남은 순서](ide-h3c-simulation-gui-validation.md). 아래는 역사다.
## H3B 최신 — Simulation 홈·앱 Node 실행 연결 (2026-10-10)

Simulation placeholder를 테스트 목록·전체/선택/개별 실행·취소·실시간 로그·최근 결과로 교체했다. IDE 자체 shared-process IPC/창별 실행 소유자를 사용하며 renderer의 직접 FS/process와 user extension 의존성이 없다. runtime/전체43 PASS·변경 emission+전체 타입0 errors, compiled Node 채널 실제 Verilator/VCD·C++ 빌드 중 취소 PASS. native untrusted 홈3·기존editor22/20 round PASS, 물리 목록/홈 확인. 현재 trusted GUI Run/Cancel은 사용자의 preview trust 직접 처리를 기다리는 열린 수용이며 권한 설정은 바꾸지 않았다. 다음은 이 UI 수용→기존 내장 파형 이식/해당 run 열기, 이후 history/stale·언어/설치 흐름이다. H2/H3/H4 전체·베타·배포 완료 아님. [구조·근거·실패·인수인계](ide-h3b-simulation-home.md). 아래는 역사다.
## H3A 최신 — Simulation 실행 기반 이식 (2026-10-10)

독립 IDE 안에 Core·Verilator·기존 도구 탐색과 공통 Node SimulationService/개발 CLI를 이식했다. 자체 runtime 타입/빌드·전체37 PASS. 실제 두 예제 VCD/FST 총4회 실행 성공; 최초 verifier의 diagram 전용 FST 제한을 보완해 같은 실물4개 재검증 PASS, 실패 근거도 보존했다. Simulation 화면은 아직 placeholder다. 다음은 Node host 연결→홈 테스트 목록/Run/Cancel/결과·로그이며 이어 파형 renderer/언어/설치 승인 흐름을 이식한다. H2 물리 resize/auxiliary 상세·host 지연/clean Windows gate를 유지하며 H2/H3 전체·베타/배포 완료가 아니다. [소유권·근거·한계·다음 순서](ide-h3a-simulation-runtime.md). 아래는 역사다.
> 2026-10-10 H2K 최신: 좁은 화면에서 floating 버튼이 코드/탭을 덮는 문제를 발견해40px 전용 전환 줄로 보완했다. grid cache·EditorPart 원래 입력 크기·하단 panel/분할 그룹 최소 높이를 수정했다. 최종 파일 emission+전체 타입 검사0 errors/exit0, 자동28 PASS, 기본 native RjNE0x22항목/20 round PASS/exit0:695×435 네 배치 hit target·group/home 비겹침·dirty/disk 보존. 확대 hidden 실제 클릭/type는 중간 보완 빌드에서 수용했다. 중간 FAIL/120초 timeout·일반 host10초 경고를 보존한다. 다음은 auxiliary 상세/최종 물리 배치의 지원 범위 판정 후 H3 자체 이식이다. 물리 resize/H2 전체/베타·배포 완료는 아니다. 공통 docs/ide-h2k-narrow-layout-validation.md를 따른다.

> 2026-10-10 H2J 최신: 소스 자동 Code 진입에서 이전 editor focus를 강제하던 경로를 보완했다. 실제 Output focus+preserveFocus 소스 열기 실패(9rO53F/exit1)를 재현했고 소스 open의 focus 정책에 맡기도록 수정했다. 최종 파일 공식 emission+전체 타입 검사0 errors/exit0, 자동28 PASS, native wI7osu/qvp82r 각각22항목 PASS/exit0: Output focus와 총40 round/80 새·동일 소스 즉시 입력 및 기존 배치/dirty/disk 회귀. H2I의 간헐 일반 입력 실패와 동일 원인 확정은 아니다. 다음은 작은 viewport/물리 navigation·auxiliary 상세 수용 후 H3 자체 이식이다. H2 전체/베타·배포 완료 아님. 공통 docs/ide-h2j-focus-validation.md의 결과/다음 순서를 따른다.

> 2026-10-09 H2I 최신: Activity Bar hidden/top/bottom에서 같은 Code/Simulation 버튼을 editor의 작은 floating navigation으로 이동하고 기본 visible rail은 유지했다. 사용자 layout 설정은 변경하지 않는다. 전체 빌드0 errors/exit0(8.23분), 최종 파일 공식 emission+전체 타입 검사0 errors/exit0, 자동28 PASS, native gR12TZ/1DXgJL 각각20항목 PASS/exit0. 최초 x6yrg1 source 입력 대기 FAIL은 보존하며 원인 미확정/진단 추가 상태다. 다음은 간헐 focus·작은 viewport/물리 click·auxiliary 상세 수용 후 H3 자체 이식이다. H2 전체/베타 완료·배포 아님. [검증 기록](ide-h2i-layout-validation.md). H3~H7은 미착수이며 아래 계획 작성 시점의 미착수 표현은 역사다.

> 2026-10-09 최신: H1 도구/의존성 설치·컴파일 exit0, IDE27 PASS, 추가 본체 빌드·실제 CLI 정책/Chat·Extensions 제외/패널 표시 확인. H1 전체 수용은 진행 중이다. [최신 결과](ide-h1-validation.md). 아래 미착수 문구는 계획 작성 시점 기록이다.

# 독립 RTL IDE 구현 계획

2026-10-09. [제품 결정 기록](h0-product-decisions.md)과 [프로젝트 분리](project-layout.md)를 기준으로 작성했다. **계획 작성 완료 / 앱 구현 미착수**다. 이 문서는 구현 순서를 정하며 제품 합의나 테스트 결과를 임의로 늘리지 않는다.

## 범위와 경계

첫 목표는 Windows 기반 독립 IDE에서 프로젝트를 열어 Code에서 편집하고 Simulation에서 테스트 실행·결과·파형을 확인하는 것이다. VS Code 확장은 별도 프로젝트로 유지한다. Code-OSS 기반을 조사·구성하되 기준 버전, 세부 빌드 환경, 배포/업데이트 방식은 H1에서 공식 자료와 실제 빌드로 확정한다.

모든 앱 소스·설정·의존성·테스트·빌드 입력은 ide 안에 둔다. vsix나 상위 소스의 import/load, file:/link: 의존성, path alias, workspace link, junction과 빌드 시 복사를 금지한다. 이전 코드의 수동 이식은 출처/라이선스와 이식 기준을 기록하고 ide 자체 파일·테스트로 관리한다. 루트 문서는 공통 관리 자료이지 런타임/빌드 입력이 아니다. 설치한 실행 도구와 사용자 프로젝트는 명시적인 외부 입력이며 프로젝트 코드 연결과 구분한다.

외부 extension 설치/Marketplace·Chat을 제공하지 않는다. Diagram은 첫 앱에서 제외하고 기존 VSIX 코드는 보존한다. Synthesis, 자체 compiler/simulator, 연속 계층 확대와 live debugging은 제외한다. 기존 파형 뷰어 내부 UX를 재설계하지 않는다.

## 단계와 완료 기준

| 단계 | 작업 | 완료 기준 | 현재 상태 |
|---|---|---|---|
| H0 | 요구·미결·분리 경계·구현 계획 | 모든 합의를 추적 가능하게 기록 | 문서 정리 완료, 세부 미결은 아래 참조 |
| H1 | Code-OSS 기준선·개발 실행 환경 | ide 자체 checkout/lock/config로 재현 가능한 개발 앱 실행, 변경 내역·출처·유지보수 방식 기록 | 진행 중: 설치/컴파일·25 PASS·실제 CLI 정책/화면·패널 확인, 개발 시험/Agents·자동 profiling 제외·native 파일/폴더 편집 API PASS, native 반복3회/physical 입력·저장 PASS, 저장 후 언어 추측 오류 보완/native 감지 수용 추가, 임시 exe 아이콘/metadata·cache/격리 guard·native3회/batch/CLI 수용 PASS, API 소속/단계 측정·native3/batch PASS, 개발 기반 H2A 진입 가능; 간헐 host 지연/잔여 surface/배포 전 audit는 열린 추적 항목 |
| H2 | 앱 외형과 Code/Simulation 공간 | 실제 공간 왕복 시 문서·선택·배치 보존, 공통 하단 패널 유지 | 기본 흐름 수용: tab/dirty/source/Output native15·empty-window Terminal3, 물리 홈/Explorer/Search/SCM/파일 저장·type PASS; 작은 viewport/Activity Bar 위치·숨김·auxiliary 세부 레이아웃 수용 남음 ([표](ide-h2h-acceptance-summary.md)) |
| H3 | 기존 편집·Core·도구·실행·파형 이식 | ide 자체 예제와 도구로 한 테스트 실행/파형까지 실제 확인, 경계 검사 통과 | 진행: Core/Verilator·Run/Cancel·VCD/preset·이력/stale·lexical/semantic·도구 UI 연결. H3K91 PASS·H3M trusted 실제 편집기 module/scope/port/signature/진단/정의/토큰/공간 왕복7항목 PASS. 설치 UX·새 Windows 설치·FST·enum/물리·규모 등 남음 ([최신 근거](ide-h3m-trusted-semantic-acceptance.md)) |
| H4 | Simulation 홈·결과/이력·변경 표시 | 전체/선택/개별 실행과 이전 파형 보존·명시적 결과 이동 | 진행: Run/Cancel/로그·실행별 파형/기본 보기·최근100 project history 선택·saved stale/미저장 경고 연결. 실제 과거 run 선택/로그/파형 및 native 저장 이벤트→stale/기존reader 유지 PASS. 이력 정리/개별 과거 비교·규모 및 세부 물리 수용 남음. 전체 완료 아님 |
| H5 | 가져오기·폴더 역할·자동 TOML·여러 top | 기존 파일 유지, 최초 확인 후 설정 저장, 각 top 독립 실행/이력 | H5A～D 가져오기/분류/등록·여러 top 실제 실행, H5E 관리/source 감지, H5F Explorer TB 행 실행, H5G 폴더 역할·저장/재시작·상속/예외/dirty/busy 보호까지 구현·단계별 actual 수용. H5G3 전체133/native4 PASS. 물리 메뉴/DPI/규모·외부 writer/crash 등 잔여 gate 유지, H5 전체 완료 아님 ([최신 근거](ide-h5g3-folder-guards.md)) |
| H6 | 미저장 입력·자동 trace | 시작 시점 snapshot으로 실행, 원본 무변경, VCD/FST/off 검증 | H6A1 방식 검증→H6A2 기본 자동 trace 완료:136 PASS·actual service/CLI8·새 예제 VCD/FST4회·native3 PASS. H6B1 미저장 Core/서비스 snapshot·동결/provenance/no fallback 구현:142 PASS·actual5회/3묶음 PASS. H6B2 GUI Run 연결·trusted native5시나리오/실제6회·143 PASS/전체 타입0 errors 수용. H6B3 현재 내용 비교/BOM 보완·package/header GUI·restart 수용:144 PASS·native3+restart1 PASS/전체 타입0 errors. H6C 보관 소스 읽기 전용 Code 탭·144 PASS/native3+새 프로세스3 PASS/전체 타입0 errors 수용. H6D 과거 run 명시적 비교/현재 diff·145 PASS/native4 PASS/전체 타입0 errors 수용. [H6 수용표](ide-h6-acceptance-summary.md)에서 기본 경로 판정·잔여 gate를 H7로 이관. 베타/배포 전체 수용 아님 ([H6D 근거](ide-h6d-selected-run-comparison.md)) |
| H7 | 종료·복원·크기/성능·내부 사용 수용 | 프로세스 정리·상태 복원·중간 규모·실제 사용 흐름 검증 | H7A～J 뒤 H7K 최신 probe/restart·status1/focus·IPC drain/parent close·quarantine/late callback. 264 PASS/0 FAIL/1 Windows batch SKIP(총265개, 순차 전체). 다음 H7L 실제 입력·파일 이벤트/journal 무효화·generated 비용. Windows/Electron/공식/RSS/실제 설계 잔여 ([수용표](ide-h7-acceptance-summary.md), [성능 계획](ide-performance-plan.md)) |

H3/H4는 이미 등록된 테스트를 사용해 먼저 동작시킨다. 자동 발견을 선행 조건으로 만들지 않는다. H6 전의 저장된 입력 실행은 중간 구현 상태이며 미저장 정책 완료로 표현하지 않는다. 단계별 실패는 보완한 뒤 다음 단계로 간다. 배포 패키징/설치는 별도 사용자 요청 시 진행한다.

### H1: 기반과 유지보수

- 현재 공식 저장소·빌드 문서를 확인해 기준 revision과 필요한 Windows 환경을 기록한다. 다운로드 크기/실제 환경 부족 등 제약은 숨기지 않는다.
- 소스는 ide 내부에 관리하고 upstream 변경과 제품 변경을 구분해 재적용/업데이트할 수 있게 한다. 대규모 무관한 core 수정은 피한다.
- 앱 이름/아이콘/application ID/설정·cache 위치를 VS Code와 분리한다. 실제 앱 이름/브랜드는 임시값을 명시하고 별도 결정한다.
- built-in feature/extension 목록과 활성 서비스를 조사한다. 외부 확장 설치 진입/명령/파일 연결 경로를 확인하고 Chat 포함 불필요한 기능을 제외한다. UI를 숨겼다고 제거·성능 개선을 주장하지 않는다.
- 첫 검증은 자체 앱 실행·폴더 열기·파일 편집/저장·Terminal/Output. 앱과 toolchain, vendored dependency의 라이선스/출처를 확인한다.

### H2: 공간과 공통 상태

- 왼쪽 Code/Simulation은 작업 공간 전환이다. Code는 Explorer와 소스 탭, Simulation은 보조 사이드바 없이 홈/파형 탭을 사용한다.
- 공간별 탭·active tab·editor group 배치·커서/스크롤·Simulation 선택·파형 시각/zoom/신호 구성을 보관한다. 문서 model/dirty 상태는 공유한다.
- Terminal/Output 및 실행 서비스는 공통이며 공간 전환으로 재생성/종료하지 않는다. 공통 패널을 숨김/펼침하는 세부 규칙도 기록한다.
- Simulation 첫 진입은 홈, 이후는 마지막 탭 복원. 실행 완료/실패로 강제 공간 전환하지 않는다.
- Search/Source Control 위치와 파형 옆 소스 패널은 아직 세부 합의가 필요하다. 먼저 두 공간의 실제 흐름을 보여준 뒤 결정한다.
- 완료: 미저장 파일·여러 탭·Terminal 작업을 둔 채 반복 왕복하고 내용/커서/배치/실행이 유지됨을 확인한다. 재시작 복원은 H7에서 따로 검사한다.

### H3: 기능 이식과 진단 정리

- 필요한 Core/언어/semantic/LSP/Verilator/toolchain/waveform/host 코드를 라이선스와 함께 ide 안으로 이식한다. 임의 diagram 의존성과 사용하지 않는 기능까지 일괄 이식하지 않는다.
- 언어 진단·자동완성·snippets·모듈/포트·signature·highlight·아이콘과 기존 파형 기능/저장 view를 보존한다. 이식 범위와 미지원은 목록으로 남긴다.
- GUI와 CLI는 ide 내부의 같은 Core 계약을 사용한다. semantic은 simulator와 독립이며 파형과 실행 backend 교체 경계를 유지한다.
- 설정 오류/RTL 오류/분석 도구 실패·timeout/backend 미지원/빌드·실행 오류를 구분한다. 기존 분석 catch의 모든 실패→TOML 첫 줄 게시 문제를 그대로 이식하지 않는다. stale 진단 정리/취소/재시도도 검증한다.
- 기존 도구 먼저 검증하고 부족하면 설치 계획/위치와 명시적 승인을 제공한다. PATH 수정 없이 관리하며 편집은 설치 거절 상태에서도 가능하다.
- 완료: ide 자체 테스트와 실제 도구의 예제로 편집→실행→로그·파형, 취소/실패, 도구 설치 거절 흐름 확인. VSIX 227 PASS는 참고 기준이지 IDE 검증 결과가 아니다.

### H4: Simulation 홈과 실행 결과

- 홈 기본 목록은 테스트별 최신 결과, 행별 Run/Waveform, 전체/선택 실행·취소다. 선택/펼침으로 실행 이력과 로그·실패 원인을 보여준다.
- 초기 구현은 순차 실행을 기본 제안으로 두고 기존 병렬 설정 이전과 UI 정책을 별도 설계한다. 중복 실행/대기/재실행 동작을 명시한다.
- 결과는 test/run/input/trace identity로 구분한다. 동일 결과 탭은 재사용하고 이전 파형은 덮어쓰지 않는다. 실패 또는 trace 없는 최신 결과에서 이전 파형을 최신처럼 열지 않는다.
- 코드 변경 표시와 새 결과 안내는 구분한다. TB뿐 아니라 실제 source/package/include/defines/top 등 사용 입력이 판정 대상이다. 의존성이 불명확하면 무변경이라고 단정하지 않고 이유를 표시한다.
- 이력 수동 보존·자동 정리를 지원하는 방향은 합의됐다. 한도/열린 reader 보호/삭제 동작은 H4 설계와 크기 측정에서 확정한다.

### H5: 프로젝트와 실행 top

- 새 프로젝트 만들기에서만 rtl/tb 최소 구조 생성. 기존/빈 폴더 열기 자체로 파일을 만들지 않는다. 기존 TOML은 읽고 사용자 설정을 존중한다.
- TOML 없는 프로젝트는 탐색 결과 확인 화면에서 RTL/Simulation/확인 필요로 분류한다. 폴더 우클릭 역할 지정·아이콘 배지·분류 드래그를 제공한다. 분류 드래그는 실제 파일 이동이 아니다.
- Simulation 역할과 package/helper 코드 종류, 실행 top은 별개다. parser/elaboration 정보를 이용해 후보를 찾고 불확실한 것을 사용자 확인 없이 확정하지 않는다. 컴파일에 필요한 sources/include/defines/package 순서를 함께 관리한다.
- tb.v의 top1/top2는 tb.top1/tb.top2 독립 대상으로 목록·실행·결과·파형 설정을 관리한다. 경로+top identity와 동일 basename 충돌/rename 처리를 설계한다. 각 실행에는 해당 top을 지정한다.
- Explorer 인식 TB 파일 행 hover Run을 제공한다. 여러 top 파일의 클릭 UI는 후보 선택/목록 표시 중 구체 설계하되 독립 테스트 정책을 유지한다.
- TOML schema 버전/managed 값·override 우선순위/주석 보존·원자적 갱신·외부 변경 충돌 정책을 먼저 작성한다. 새 파일 자동 추적은 테스트 top 확인과 구분한다.

### H6: snapshot과 IDE 관리 파형

- 실행 시작 시점의 saved/unsaved 입력과 설정을 일관된 snapshot으로 보관한다. 사용자의 소스와 미저장 buffer를 자동 저장/변경하지 않는다. 이후 편집이 실행 입력을 바꾸면 안 된다.
- 보존 입력과 실행용 instrumentation 입력을 구분하고 source mapping/identity로 결과의 출처를 확인할 수 있게 한다. include 경로, 한글/공백 경로, 다중 top 격리를 검사한다.
- 사용자는 dump 코드를 쓸 필요 없다. Verilator에서 가능한 방법을 먼저 소규모 prototype으로 검증하고 VCD/FST/off·파일명·기존 dump 중복 정책을 정한다. 원본 수정이나 textual regex 삽입을 전제로 하지 않는다.
- 생성 input/build/log/result/trace는 .rtl 안에 격리한다. GUI snapshot 실행과 CLI 디스크/명시적 retained 입력 실행의 차이를 설명하고 같은 입력이면 결과가 일치하는지 검증한다.

### H7: 종료와 내부 수용

- 실행 중 종료 안내→종료 선택 시 하위 프로세스까지 정리. 종료 취소/미저장 문서 보호, 정리 실패 시 안내를 검증한다. 백그라운드 지속 실행은 제외한다.
- 재시작 시 공간/탭/설정을 복원하며 종료된 실행을 진행 중으로 표시하지 않는다. 손상/삭제된 이력이나 trace에서 명확하게 복구한다.
- 실제 중간 규모(RTL 수백 파일/신호 수천 개)에서 시작/편집/파형/메모리/취소·복구를 측정한다. Electron을 쓴다고 또는 기능을 숨겼다고 가벼움을 보장하지 않는다.
- 자체 앱 개발 수용과 패키지 설치 수용을 구분한다. 깨끗한 Windows 설치 gate는 여전히 열려 있고 별도 PC/VM 부재를 기록한다. 확보 전 전체 배포 안정성을 선언하지 않는다.

## 요구 추적 / 실행 예

| 요구 | 담당 단계 |
|---|---|
| 격리된 ide 프로젝트와 독립 빌드 | H1, 각 단계의 경계 검증 |
| Code/Simulation과 공통 하단·상태 보존 | H2, H7 |
| 기존 편집·파형 보존 / 도구 승인 | H3 |
| 통합 Testing·Simulation 홈/명시적 이동 | H4 |
| 이전 결과·소스 변경/새 결과 표시 | H4, H6 |
| 폴더 역할·드래그 분류·TOML 자동 관리 | H5 |
| 여러 top 개별 관리·Explorer hover Run | H5 |
| 미저장 코드·원본 무변경·파형 자동 생성 | H6 |
| 종료 프로세스 정리·복원·이력 보존 | H4, H7 |
| 외부 extension/Chat 제외·Diagram 제외 | H1, H2, H3 |

수용 흐름: 기존 폴더 열기 → 분류 확인/설정 저장 → 소스 미저장 편집 → 실행(화면 유지) → Simulation 결과 → 파형 → 소스 추가 수정/변경 표시 → 재실행 → 이전 파형 보존/새 결과 → 공간 복귀/종료·복원.

각 단계는 타입·관련 자동 테스트와 실제 앱 수용을 수행한다. 중요 이정표에서 ide 자체 전체 회귀를 실행한다. 현재 완료 근거는 VSIX 분리 후 227 PASS/타입/개발 build뿐이며 **IDE에 그대로 적용되지 않는다**. 결과/실패/미검증 항목을 공통 PROGRESS·handoff·current-validation과 IDE 로컬 개발 문서에 기록한다.

## 다음 실행자

첫 작업은 H1 기준 revision/빌드 환경·최소 변경 경계 조사다. 현재 ide에는 준비 manifest와 README/AGENTS만 있다. 설치된 VS Code 실행 파일을 개조하거나 vsix 소스를 링크하지 않는다. 자체 엔진은 별도 I 트랙에서 사용자와 언어 의미/성능 목표를 논의하고, frontend 공유와 backend 미지원 구분을 먼저 설계한다. 이번 요청에서는 문서 점검/계획만 작성했으며 checkout·설치·빌드·앱 구현을 하지 않았다.
