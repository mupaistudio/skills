---
name: logical-memory
description: "Verify and reorganize Claude Code auto-memory (MEMORY.md plus topic files) using MECE principles: find duplicates, orphan files, broken links and inconsistent decomposition criteria, and propose moving detail out of an oversized MEMORY.md (over 200 lines) into topic files. Runs only after user approval and never deletes content, only moves it. Use when asked to clean up memory, verify memory, reorganize MEMORY.md, slim down memory, apply MECE to memory, or structure knowledge."
---

# logical-memory - Memory Structure Verification and Reorganization

Verify and optimize the structure of auto-memory files using MECE principles.

## Memory Directory

```
~/.claude/projects/<project folder name>/memory/
├── MEMORY.md          # index + core rules (200-line limit, always loaded)
├── details.md         # detailed reference (if present)
└── <topic>.md         # per-topic split files
```

The project folder name is the working directory path with `/`, `\` and `:` replaced by `-`. If unsure, open `~/.claude/projects/` and find the folder matching the current working directory.

## Two-Layer Principle

### Layer 1: MEMORY.md (always loaded, 200-line limit)
```yaml
role: pointer index (no inline content)
include:
  - Pointers to detail files (link + one-line summary)
  - Standalone rules with no topic file may be inlined as an exception
forbid:
  - Code snippets
  - Implementation details
  - History/dates (one reference date is allowed)
  - Content already in a skill (no duplication)
  - Patterns derivable from code (checkable with grep/ls)
```

### Layer 2: Topic Files (loaded when needed)
```yaml
role: detailed knowledge on one topic
split criterion: MECE - one topic per file
naming: kebab-case, 20 characters or fewer
size: 200 lines or fewer recommended
include:
  - Gotchas/experience that "you could get wrong from the code alone"
  - Decision history
  - Implementation pattern details
  - Tables/comparison tables
forbid:
  - Procedures/methods already in a skill
  - Structure/paths/signatures derivable from code
update rules:
  - When new knowledge appears, add it to the existing topic file if there is one (do not create a new file)
  - Only for a new topic with no existing file: create a new file + add a pointer to the index
```

## Procedure

### Step 1: Current State Analysis
```yaml
collect:
  1. MEMORY.md line count (200-line limit)
  2. List of all detail files + line counts
  3. Extract the MEMORY.md section list
  4. Extract the section list of each detail file
```

### Step 2: MECE Verification

#### ME (Mutual Exclusivity) - duplicate check
```yaml
check:
  - Duplicates between sections inside MEMORY.md
  - Duplicates between MEMORY.md and detail files (excluding pointers)
  - Duplicates between detail files
  - Duplicates with skills (is content in a skill also in memory?)

violation marker: (duplicate) [content] - MEMORY.md L42 <-> details.md L108
```

#### CE (Collective Exhaustiveness) - gap check
```yaml
check:
  - Detail files with no pointer in MEMORY.md (orphan files)
  - Topics in detail files with no summary in MEMORY.md
  - Topics with a pointer in MEMORY.md but no detail file (broken links)

violation marker: (gap) [content] - no pointer/summary/file
```

#### Decomposition Criterion Consistency
```yaml
check:
  - Are the top-level MEMORY.md sections decomposed by the same criterion?
  - Recommended criterion: by domain (topic)
  - Do not mix: domain + technology + time (dates)
```

### Step 3: Propose Improvements

#### MEMORY.md Diet (when over 200 lines)
```yaml
move candidates:
  1. Code snippets -> topic files
  2. Detailed rules (3+ lines) -> topic files, keep a one-line summary in MEMORY.md
  3. History dates -> remove (keep only in topic files)

keep:
  1. ❌/✅ patterns (mistake-prevention rules)
  2. Core one-line summaries
  3. Pointer links
```

#### details.md Split (at 150+ lines)
```yaml
split criteria:
  - Independent topic -> separate file
  - Keep related topics grouped

split procedure:
  1. Create new files (per topic)
  2. Remove those sections from details.md
  3. Update MEMORY.md pointers (details.md#anchor -> new-file.md)
```

### Step 4: Output Report

```markdown
# Memory Structure Verification Report

## Current State
- MEMORY.md: __ lines (limit: 200)
- Detail files: [line count per file]

## MECE Verification
### ME (duplicates)
- (duplicate) [content] - location 1 <-> location 2
### CE (gaps)
- (gap) [content] - reason
### Decomposition criterion
- [assessment]

## Proposals
### Immediate (resolve the 200-line overflow)
1. [item to move] -> [destination]

### Short term (structure improvement)
1. [item to split/merge]

### Expected after cleanup
- MEMORY.md: __ lines -> __ lines
- File structure: [after the change]

Shall I proceed?
```

### Step 5: Execute (after user approval)

```yaml
procedure:
  1. Create new topic files
  2. Remove moved content from MEMORY.md + add pointers
  3. Remove split content from details.md
  4. Fix broken links
  5. Confirm final line count

principles:
  - Never delete content - only move it
  - Never execute without user approval
  - One change at a time (so it can be reviewed)
```

## Ideal MEMORY.md Structure

```markdown
# [Project Name] Core Patterns

> Details: [topic-a.md](topic-a.md) | [topic-b.md](topic-b.md) | ...

## Topic A
- Rule 1 (one line)
- Rule 2 (one line)
- Details -> [topic-a.md](topic-a.md)

## Topic B
- Rule 1 (one line)
- Details -> [topic-b.md](topic-b.md)

(keep to 150-180 lines, leaving 20 lines of headroom)
```

## Related Skills
- `logical-verification` - general-purpose MECE verification (not memory-specific)
