---
name: logical-verification
description: "Systematically verify a logical thinking result for MECE compliance and quality. Use when asked to verify MECE, check logical thinking quality, review structure, find duplicates or gaps, or confirm decomposition criterion consistency."
---

# logical-verification [result_file_path]

Verify a logical thinking result against MECE principles and quality criteria, and produce a report.

## Options
- `--focus me|ce|structure|quality` (default: all)
- `--strict` (strict mode)
- `--report detailed|summary` (default: detailed)

## Five Verification Steps

### Step 1: Structure Analysis
- Clarity of the top-level goal
- Appropriateness of decomposition depth at each level
- Logical relationships between branches

### Step 2: ME (Mutual Exclusivity) Check
```yaml
questions:
  - "Do any branches overlap?"
  - "Could one item belong to several branches?"
  - "Is the decomposition criterion consistent across sibling branches?"

violation markers:
  - (duplicate id01), (duplicate id02): identical content
  - criterion mismatch: point where decomposition criteria are mixed

pass conditions:
  - No item belongs to 2+ branches
  - Branch boundaries are clear
  - The same decomposition criterion is applied consistently
```

### Step 3: CE (Collective Exhaustiveness) Check
```yaml
questions:
  - "Are all cases covered?"
  - "Is any area missing?"
  - "Could new sub-items appear?"

gap markers:
  - (gap): missing content
  - set type judgment: closed vs open
  - need for an "Other" branch in open sets

pass conditions:
  - All areas included
  - Closed set: logically complete definition
  - Open set: extensibility guaranteed by "Other"
```

### Step 4: Quality Criteria Evaluation
```yaml
structure quality:
  - Same-criterion principle followed
  - No duplicates
  - No gaps
  - Extensibility

content quality:
  - Contribution to the top-level goal
  - Feasibility
  - Clarity of completion conditions

practicality:
  - Team understanding
  - Ease of management
  - Structure maintainability
```

### Step 5: Atomic Task Check
- Is it small enough to complete in 1-3 days?
- Can it be executed independently?
- Does it have pass/fail criteria?

## Scoring
```yaml
A (90-100): perfect MECE, ready to use immediately
B (80-89): mostly met, minor improvements
C (70-79): basics met, moderate improvements needed
D (60-69): partly unmet, substantial improvements needed
F (<60): mostly unmet, rework required

required to pass: 0 ME violations, 0 CE gaps, total score 80+
```

## Report Template

File name: `verification_report_[topic_name].md`

```markdown
# [Topic Name] Verification Report

## Overview
- Target: [file name]
- Overall grade: [A-F]

## Structure Analysis
- Goal clarity: [assessment]
- Decomposition criterion: [criterion name] - [assessment]

## ME (Mutual Exclusivity) - [Pass/Violation]
### Violations
- [Duplicate item]: [content] -> [location]

### Improvements
- [Method]

## CE (Collective Exhaustiveness) - [Pass/Violation]
### Gaps
- [Missing area]: [content] -> [where to add]

### Improvements
- [Method]

## Quality Score
- Structure: __/100
- Content: __/100
- Practicality: __/100

## Improvement Roadmap
### Priority 1 (immediate)
- Problem -> impact -> solution

### Priority 2 (short term)
- Problem -> solution

## Re-verification Checklist
- [ ] ME violations resolved
- [ ] CE gaps filled
- [ ] Quality score 80+ reached
- [ ] Atomic task criteria met
```

## Related Skills
- Quality gate: `logical-think` -> `logical-verification` -> proceed only after passing
- Improvement cycle: verification -> revise -> re-verification
- Pre-check: verification -> `logical-tree` or `logical-csv`
