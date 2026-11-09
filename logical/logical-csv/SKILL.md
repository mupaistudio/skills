---
name: logical-csv
description: "로지컬 씽킹 결과를 엑셀 활용 목적의 계층적 CSV 형태로 변환. 트리거: 번호체계를 CSV로, 엑셀 트리뷰, 진행관리 스프레드시트, sitemap CSV, 계층 CSV"
---

# logical-csv [thinking_result_파일경로]

로지컬 씽킹 번호체계를 엑셀 최적화 CSV로 변환한다.

## 옵션
- `--columns basic|extended|full` (기본: extended)
- `--format vertical|sitemap` (기본: vertical)
- `--status-init pending|ready` (기본: pending)

## Format 1: Vertical Column (기본)

계층을 Level1~4 컬럼에 배치. 빈 셀로 트리 구조 표현.

### 컬럼 구조
```
basic:    Level1,Level2,Level3,Level4,Status
extended: Level1,Level2,Level3,Level4,Status,Duration,Priority,Owner
full:     Level1,Level2,Level3,Level4,Status,Duration,Priority,Owner,Dependencies,Start_Date,End_Date,Completion,Risk_Level,Notes
```

### 배치 규칙
- Level1: 최상위만 입력, 나머지 행은 빈 셀
- Level2: Level1이 빈 행에만 입력
- Level3: Level1,2가 빈 행에만 입력
- Level4: Level1,2,3이 빈 행에만 입력

### 예시
```csv
Level1,Level2,Level3,Level4,Status,Duration,Priority,Owner
신제품 출시,,,Planning,375분,P0,Team
,데이터 영역,,,In Progress,165분,P0,Backend
,,API 개발,,Pending,60분,P0,Dev1
,,,주문 조회 API,Pending,30분,P0,Dev1
,,,주문 생성 API,Pending,30분,P1,Dev1
,,DB 스키마,,Completed,45분,P0,Dev2
,실행 영역,,,Pending,90분,P1,Frontend
```

## Format 2: Sitemap (--format sitemap)

Sitemap/UI 구조용. 번호 체계 없이 순수 계층만 표현.

### 핵심 규칙
- 제목 위치 = 계층 깊이 (1뎁스→컬럼1, 2뎁스→컬럼2, ... 5뎁스→컬럼5)
- 설명 위치 = **항상 컬럼12** (고정)
- Padding commas = `11 - depth`

### 예시
```csv
제목,,,,,,,,,,,설명,타입,상태,우선순위
웹사이트,,,,,,,,,,,회원이 가입하고 주문하는 사이트,시스템,완료,P0
,회원,,,,,,,,,,회원 가입 · 인증,기능모듈,완료,P0
,,로그인 화면,,,,,,,,,로그인 페이지,페이지,완료,P0
,,,로그인 폼,,,,,,,,이메일/비밀번호 입력 폼,컴포넌트,완료,P0
```

## Status 값
```yaml
Planning: 계획 단계
Pending: 대기 중
Ready: 시작 준비됨
In Progress: 진행 중
Review: 검토 중
Completed: 완료
Blocked: 차단됨
On Hold: 보류
Cancelled: 취소
```

## Priority
```yaml
P0: Critical (블로킹, 즉시 필요)
P1: High (중요, 대기 가능)
P2: Medium (일반)
P3: Low (여유 시)
```

## 파일명
`logical_tree_[주제명].csv`

## 연계
- 이전: `logical-think` → 번호체계 생성
- 병행: `logical-tree` — 폴더구조와 병행
- 워크플로우: think → tree(실행) + csv(관리)
