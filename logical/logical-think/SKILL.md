---
name: logical-think
description: "Create numbered logical-thinking documents from complex topics using MECE and same-criteria sibling branch principles. Use for complex problem decomposition, requirements analysis, system design, root cause analysis, project planning, MECE reviews, logical trees, structured thinking, and numbered hierarchy documents."
---

# Logical Think

Decompose a complex topic into a numbered logical tree using MECE and consistent sibling branch criteria. Produce a Markdown thinking result that can be read directly or passed to `logical-tree` to create executable `small_pictures/` worksets.

## Inputs

Accept one of:

- A topic or problem statement.
- A Markdown/text file path containing raw notes or requirements.
- A directory containing source material to analyze.

Options the user may provide:

- `--depth shallow|medium|deep`: default to `medium`.
- `--criteria <criterion>`: use a requested decomposition basis such as `시간축`, `도메인`, `우선순위`, `기능`, or `리스크`.

## Core Principles

### MECE

- ME: branches must not overlap.
- CE: branches must collectively cover all required areas.

### Same-Criteria Sibling Branches

All siblings under the same parent must use the same decomposition criterion.

Correct:

```text
인프라(도메인별) / 데이터(도메인별) / 실행(도메인별)
```

Incorrect:

```text
1단계(시간순) / DB(기술스택) / 높은우선순위(우선순위)
```

### Set Type

- Closed set: complete logical enumeration is possible, so `기타` is unnecessary.
- Open set: future expansion is possible, so include `기타`.

## Decomposition Criteria

Choose one primary criterion for level 1 unless the user explicitly specifies it.

```yaml
시간축: "현재 -> 단기 -> 장기"
도메인: "Frontend -> Backend -> Database"
우선순위: "필수 -> 중요 -> 선택"
기능: "입력 -> 처리 -> 출력"
리스크: "안전 -> 위험 -> 실험"
```

For lower levels, choose the most useful criterion for that parent, but keep siblings under that parent consistent.

## Workflow

1. Define the top-level goal in concrete, measurable terms.
2. Select the primary decomposition criterion.
3. Create sibling branches using the same criterion.
4. Check ME: ask whether branches overlap or one item belongs in multiple branches.
5. Check CE: ask whether any necessary area is missing.
6. Mark set type as closed or open; include `기타` for open sets.
7. Decompose until atomic tasks are visible. Atomic tasks should be completable in 1-3 days, independently executable, and judged pass/fail.
8. Output a numbered Markdown document.

## Depth Guidance

- `shallow`: stop at 2 levels; use for quick framing.
- `medium`: target 3 levels and include concrete tasks where obvious.
- `deep`: continue until atomic 1-3 day tasks are listed and dependencies are clear.

## Output

Filename convention when writing a file:

```text
thinking_result_[topic_slug].md
```

Use this template:

```markdown
# [주제명] 로지컬 씽킹 결과

## 최상위 목표
**[구체적이고 측정 가능한 목표]**

## 1차 분해 ([선택된 기준])

### 1. [브랜치명]
- **1.1 [하위 브랜치]**
  - 1.1.1 [구체적 Task]
  - 1.1.2 [구체적 Task]

### 2. [브랜치명]
- **2.1 [하위 브랜치]**
  - 2.1.1 [구체적 Task]

### n. 기타 (열린 집합인 경우)

## MECE 검증 결과
- **ME 확인**: [중복 여부]
- **CE 확인**: [누락 여부]
- **집합 유형**: [닫힌|열린]
- **분해 기준 일관성**: [준수 여부]

## 품질 체크리스트
- [ ] 모든 형제 브랜치가 동일 기준으로 분해됨
- [ ] 브랜치 간 겹치는 내용 없음
- [ ] 누락된 중요 영역 없음
- [ ] 열린 집합에 "기타" 항목 존재
- [ ] 각 브랜치가 상위 목표에 직접 기여
- [ ] 원자적 Task 수준 (1-3일 완료 가능)
```

## Follow-On Skills

- Use `logical-tree` to convert a numbered thinking result into folders and Module Process files.
- Use `/logical:csv` if available to convert the numbered hierarchy into spreadsheet-ready CSV.
- Use `/logical:verification` if available to produce a dedicated MECE verification report.
