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
- `--criteria <criterion>`: use a requested decomposition basis such as `time axis`, `domain`, `priority`, `function`, or `risk`.

## Core Principles

### MECE

- ME: branches must not overlap.
- CE: branches must collectively cover all required areas.

### Same-Criteria Sibling Branches

All siblings under the same parent must use the same decomposition criterion.

Correct:

```text
Infrastructure (by domain) / Data (by domain) / Execution (by domain)
```

Incorrect:

```text
Phase 1 (by time) / DB (by tech stack) / High priority (by priority)
```

### Set Type

- Closed set: complete logical enumeration is possible, so `Other` is unnecessary.
- Open set: future expansion is possible, so include `Other`.

## Decomposition Criteria

Choose one primary criterion for level 1 unless the user explicitly specifies it.

```yaml
time axis: "now -> short term -> long term"
domain: "Frontend -> Backend -> Database"
priority: "must -> important -> optional"
function: "input -> processing -> output"
risk: "safe -> risky -> experimental"
```

For lower levels, choose the most useful criterion for that parent, but keep siblings under that parent consistent.

## Workflow

1. Define the top-level goal in concrete, measurable terms.
2. Select the primary decomposition criterion.
3. Create sibling branches using the same criterion.
4. Check ME: ask whether branches overlap or one item belongs in multiple branches.
5. Check CE: ask whether any necessary area is missing.
6. Mark set type as closed or open; include `Other` for open sets.
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
# [Topic Name] Logical Thinking Result

## Top-Level Goal
**[Specific, measurable goal]**

## Level 1 Decomposition ([selected criterion])

### 1. [Branch Name]
- **1.1 [Sub-branch]**
  - 1.1.1 [Specific task]
  - 1.1.2 [Specific task]

### 2. [Branch Name]
- **2.1 [Sub-branch]**
  - 2.1.1 [Specific task]

### n. Other (for open sets)

## MECE Verification Result
- **ME check**: [overlap or not]
- **CE check**: [gaps or not]
- **Set type**: [closed|open]
- **Criterion consistency**: [followed or not]

## Quality Checklist
- [ ] All sibling branches decomposed by the same criterion
- [ ] No overlap between branches
- [ ] No important area missing
- [ ] Open sets include an "Other" item
- [ ] Each branch contributes directly to the top-level goal
- [ ] Atomic task level (completable in 1-3 days)
```

## Follow-On Skills

- Use `logical-tree` to convert a numbered thinking result into folders and Module Process files.
- Use `logical-csv` to convert the numbered hierarchy into spreadsheet-ready CSV.
- Use `logical-verification` to produce a dedicated MECE verification report.
- Use `logical-memory` to verify and reorganize auto-memory files with the same MECE rules.
