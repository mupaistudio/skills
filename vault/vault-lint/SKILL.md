---
name: vault-lint
description: "Lint a personal knowledge vault for rot: dead pointers (do the paths and links in Original location exist), INDEX vs docs mismatches (documents present on only one side), pasted bulk copies (long code or originals that should be pointers), stale documents (old last-modified date or missing status), and duplicate or conflicting documents within one topic. Duplicate and consistency checks are limited to one topic folder (the same resource across topics is normal). Report only; fix after user confirmation. Triggers: vault lint, lint the vault, health check, dead links, INDEX mismatch, vault rot, consistency check."
---

# Vault Lint (integrity check)

Check whether the vault has drifted from the originals or rotted on its own. **Checking and reporting is the default**; fixes happen only after user confirmation.

## Five checks

1. **Dead pointers**: do the file paths and links in section 5 "Original location" of each `docs/<document>.md` **actually exist** (verify local paths; for external addresses just mark them without checking reachability). If missing, it was moved or deleted.
2. **INDEX vs docs consistency**: documents listed in `INDEX.md` with no file, or present in `docs/` but missing from INDEX.
3. **Pasted-copy smell**: does a document contain code blocks, data or original text **at length as real material** (criterion: a single block of 30 lines or more)? The vault should hold pointers only.
4. **Stale**: documents whose section 1 last-modified date is old (default 6 months) or whose status (confirmed / in progress / on hold) is empty.
5. **Duplicates/conflicts**: two or more documents covering the same content **within one topic folder**.

## Check unit: within one topic folder

**Duplicate/conflict and consistency checks (2 and 5) run only within one topic (`<topic>/`).** Topics are independent units, so **the same resource appearing in different topics is not rot.** Do not flag "duplicates" across topic boundaries. (Checks 1, 3 and 4 are per document, so scope does not matter.)

## Steps

1. Pick the target topic (even for a full check, run per topic separately).
2. Run the five checks. **Read only.**
3. **Report**: item, location (file:line), what is wrong, recommended action.
4. If a fix is needed, make it **after user confirmation** (update pointers, fix INDEX consistency, replace pasted copies with pointers). Never delete or overwrite automatically.

## Output

- Lint report (findings and actions per check). Only confirmed items are fixed.

## Principles

- Lint is the guardian of the **one home for the original** principle: surface the drift, but ask the person before any fix that is hard to undo.
