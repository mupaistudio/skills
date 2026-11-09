---
name: logical-csv
description: "Convert logical thinking results (numbered hierarchies) into hierarchical CSV for Excel use. Use when asked to convert a numbered hierarchy to CSV, build an Excel tree view, create a progress-tracking spreadsheet, or produce a sitemap CSV or hierarchical CSV."
---

# logical-csv [thinking_result_file_path]

Convert a logical thinking numbered hierarchy into an Excel-optimized CSV.

## Options
- `--columns basic|extended|full` (default: extended)
- `--format vertical|sitemap` (default: vertical)
- `--status-init pending|ready` (default: pending)

## Format 1: Vertical Column (default)

Place the hierarchy in Level1-4 columns. Empty cells express the tree structure.

### Column Structure
```
basic:    Level1,Level2,Level3,Level4,Status
extended: Level1,Level2,Level3,Level4,Status,Duration,Priority,Owner
full:     Level1,Level2,Level3,Level4,Status,Duration,Priority,Owner,Dependencies,Start_Date,End_Date,Completion,Risk_Level,Notes
```

### Placement Rules
- Level1: fill only for the top level; leave empty in all other rows
- Level2: fill only in rows where Level1 is empty
- Level3: fill only in rows where Level1 and Level2 are empty
- Level4: fill only in rows where Level1, 2 and 3 are empty

### Example
```csv
Level1,Level2,Level3,Level4,Status,Duration,Priority,Owner
New Product Launch,,,Planning,375 min,P0,Team
,Data Area,,,In Progress,165 min,P0,Backend
,,API Development,,Pending,60 min,P0,Dev1
,,,Order Query API,Pending,30 min,P0,Dev1
,,,Order Create API,Pending,30 min,P1,Dev1
,,DB Schema,,Completed,45 min,P0,Dev2
,Execution Area,,,Pending,90 min,P1,Frontend
```

## Format 2: Sitemap (--format sitemap)

For sitemap/UI structure. Express pure hierarchy without a numbering scheme.

### Key Rules
- Title position = hierarchy depth (depth 1 -> column 1, depth 2 -> column 2, ... depth 5 -> column 5)
- Description position = **always column 12** (fixed)
- Padding commas = `11 - depth`

### Example
```csv
Title,,,,,,,,,,,Description,Type,Status,Priority
Website,,,,,,,,,,,Site where members sign up and place orders,System,Done,P0
,Members,,,,,,,,,,Member signup and authentication,Feature module,Done,P0
,,Login Screen,,,,,,,,,Login page,Page,Done,P0
,,,Login Form,,,,,,,,Email/password input form,Component,Done,P0
```

## Status Values
```yaml
Planning: planning stage
Pending: waiting
Ready: ready to start
In Progress: in progress
Review: under review
Completed: done
Blocked: blocked
On Hold: on hold
Cancelled: canceled
```

## Priority
```yaml
P0: Critical (blocking, needed immediately)
P1: High (important, can wait)
P2: Medium (normal)
P3: Low (when time allows)
```

## File Name
`logical_tree_[topic_name].csv`

## Related Skills
- Before: `logical-think` creates the numbered hierarchy
- In parallel: `logical-tree` creates the folder structure
- Workflow: think -> tree (execution) + csv (tracking)
