---
name: logical-tree
description: "Convert logical thinking results with numbered hierarchies into executable folder structures and Module Process files. Use when the user asks to structure logical thinking results, turn numbering systems into folders, prepare execution environments, create Module Process worksets, extract atomic_tasks, or build small_pictures."
---

# Logical Tree

Transform a logical-thinking result document into an executable `small_pictures/` workset. Use the source numbering to identify independent execution units, then create a folder and four Module Process files for each unit.

## Inputs

Accept one of:

- A Markdown/text file path containing the thinking result.
- A directory containing the latest thinking result.
- User-provided thinking text in the prompt.

Options the user may provide:

- `--workspace <path>`: target workspace. Default to `sessions/current`.
- `--extract atomic_tasks`: only extract atomic tasks.

## Workflow

1. Analyze the source numbering and hierarchy.
2. Extract atomic tasks: each task should be completable in 1-3 days, independently executable, and have a clear success/failure judgment.
3. Structure output under `[workspace]/small_pictures/`.
4. Create one folder per execution unit using lowercase `snake_case`.
5. Create the four Module Process files in every unit folder.
6. Always create `workset_controller/` with the same four files to coordinate dependencies and progress.
7. Verify folder completeness and report created paths.

When a high-level numbered item is not atomic, split it into smaller execution units. Preserve the original number and title inside the files so the tree remains traceable to the source document.

## Output Structure

```text
[workspace]/small_pictures/
├── [execution_unit_snake_case]/
│   ├── scope_[unit].md
│   ├── status_analysis_[unit].md
│   ├── final_design_[unit].md
│   └── execution_[unit].md
└── workset_controller/
    ├── scope_workset_controller.md
    ├── status_analysis_workset_controller.md
    ├── final_design_workset_controller.md
    └── execution_workset_controller.md
```

## File Templates

### `scope_[unit].md`

```markdown
# [Unit Name] - 범위 정의

## 실행 단위 목표
**[Goal extracted from the logical thinking result]**

## 원본 추적
- 원본 번호: [number]
- 원본 제목: [title]

## 범위 경계
### 포함 사항
- [Items handled in this unit]

### 제외 사항
- [Items handled by other units]

## 의존관계
- 선행: [Conditions required before starting]
- 후속: [Work enabled after completion]

## 완료 기준
- [Measurable success condition]

## 추정
- 예상 시간: [1-3일]
- 복잡도/리스크: [Low|Medium|High]
```

### `status_analysis_[unit].md`

```markdown
# [Unit Name] - 현황 분석

## 현재 상태
- 기존 구현: [Related function/code]
- 환경 준비: [Tools and dependencies]

## 제약사항
- 기술적: [Stack, performance, security]
- 의존성 블로커: [External system/team blockers]

## 준비도
- 기술: __%
- 리소스: __%
- 의존성: __%
```

### `final_design_[unit].md`

```markdown
# [Unit Name] - 최종 설계

## 아키텍처
- 구조: [Components/modules]
- 기술 스택: [Libraries/frameworks]
- 데이터: [Models/APIs]

## 구현 순서
1. [Step]
2. [Step]

## 리스크 대응
- [Expected risk] -> [Response plan]
```

### `execution_[unit].md`

```markdown
# [Unit Name] - 실행 기록

## 상태: 준비
- 시작일: YYYY-MM-DD
- 완료일: YYYY-MM-DD

## 진행 체크리스트
- [ ] [Task item]

## 실행 로그
### [Date]
- [Work performed and result]

## 이슈
- 문제: -> 원인: -> 해결: -> 학습:
```

## Workset Controller

Use `workset_controller` to summarize:

- 전체 실행 목표
- execution units list
- cross-unit dependency order
- integration risks
- current progress board
- final completion checklist

Do not duplicate all unit details in the controller. Link to each unit folder and keep it useful for orchestration.

## Validation

Before finishing:

- Confirm every selected execution unit has exactly the four Module Process files.
- Confirm `workset_controller` exists with the four files.
- Confirm filenames are UTF-8 safe and use lowercase snake_case for unit slugs.
- Confirm atomic task extraction did not leave obvious 1-3 day execution units buried only inside parent text.
- Summarize the number of units created and list the workspace path.
