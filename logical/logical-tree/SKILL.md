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
# [Unit Name] - Scope Definition

## Execution Unit Goal
**[Goal extracted from the logical thinking result]**

## Source Traceability
- Source number: [number]
- Source title: [title]

## Scope Boundary
### In Scope
- [Items handled in this unit]

### Out of Scope
- [Items handled by other units]

## Dependencies
- Prerequisites: [Conditions required before starting]
- Follow-ups: [Work enabled after completion]

## Completion Criteria
- [Measurable success condition]

## Estimate
- Expected time: [1-3 days]
- Complexity/risk: [Low|Medium|High]
```

### `status_analysis_[unit].md`

```markdown
# [Unit Name] - Status Analysis

## Current State
- Existing implementation: [Related function/code]
- Environment readiness: [Tools and dependencies]

## Constraints
- Technical: [Stack, performance, security]
- Dependency blockers: [External system/team blockers]

## Readiness
- Technical: __%
- Resources: __%
- Dependencies: __%
```

### `final_design_[unit].md`

```markdown
# [Unit Name] - Final Design

## Architecture
- Structure: [Components/modules]
- Tech stack: [Libraries/frameworks]
- Data: [Models/APIs]

## Implementation Order
1. [Step]
2. [Step]

## Risk Response
- [Expected risk] -> [Response plan]
```

### `execution_[unit].md`

```markdown
# [Unit Name] - Execution Record

## Status: Ready
- Start date: YYYY-MM-DD
- End date: YYYY-MM-DD

## Progress Checklist
- [ ] [Task item]

## Execution Log
### [Date]
- [Work performed and result]

## Issues
- Problem: -> Cause: -> Fix: -> Lesson:
```

## Workset Controller

Use `workset_controller` to summarize:

- Overall execution goal
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
