---
name: vault-push
description: "Drop raw material into a topic's inbox (topic/_inbox/) in a personal knowledge vault: unorganized notes, decisions, pasted documents and pointers to material, saved as a date-topic.md file. No classifying, documenting or INDEX work (that is vault-ingest). A person dropping a file into _inbox directly counts as the same push. Code and long originals go in by location (pointer) only. Triggers: vault push, drop a note into the inbox, inbox, save for later, throw raw material in, save this to organize later."
---

# Vault Push (drop into the inbox)

All it does is **put raw material into that topic's `<topic>/_inbox/`.** No classifying or documenting; that is `vault-ingest`. **A person dropping a file into `_inbox/` directly is the same push.** The structure is defined by the root `CLAUDE.md`, the single source.

## Input

- **Raw material**: a memo, a decision, a pasted document, or a pointer like "the rules are here [location]".
- **Target topic**: which `<topic>/_inbox/`. Ask if unknown (if truly ambiguous, put only a hint in the file and drop it). If the topic folder does not exist, tell the user to run `vault-provision` first.

## Steps

1. **Confirm the target**: settle the `<topic>/_inbox/` path. Create the `_inbox/` folder if only it is missing.
2. **Drop it as a file**: save as `date-topic.md` (e.g. `2026-11-09-refund-rules-memo.md`). It is fine if it is not yet decided which document it belongs to.
3. **Pointer principle**: do not paste long code, data or original text; point to its location.
4. **Exclude secrets and personal data**: do not write tokens, passwords, phone numbers or bank accounts. Write only where they are.

## Output

- One or more raw-material files accumulated in `<topic>/_inbox/`. (Next: `vault-ingest` organizes them and empties the inbox.)

## Boundaries

- **No documenting, INDEX or templates here**: push is capture, `vault-ingest` does the structuring.
- The inbox is temporary; ingest empties it after consuming.
