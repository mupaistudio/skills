---
name: vault-provision
description: "Create the empty skeleton for a new topic in a personal knowledge vault (a store for notes and decisions, not a password or secrets manager): README (overview), INDEX (document map) and _inbox/ under the topic folder, and install CLAUDE.md (the structure convention) at the vault root if it is missing. Any number of topics can be created, several at once. Idempotent: only missing pieces are added, unknowns are marked as needs confirmation and never invented. Triggers: vault provision, new topic, create topic, add a topic, set up a knowledge vault, initialize topic."
---

# Vault Provision (topic initialization)

Whenever a new topic appears, **lay down its empty skeleton once.** Topics are unlimited; one topic = one folder. Organizing raw material into documents is `vault-ingest`'s job. This skill only builds the frame.

## Input

- **Topic slug** (required): the folder name. Lowercase, hyphenated, short (e.g. `cooking`, `invest-notes`). If several are given at once, repeat for each.
- **Overview** (optional): one line to one paragraph on what the topic is. If missing, ask the user or leave "needs confirmation".
- **Vault root** (optional): defaults to the current working folder (the git repo root if it is one). On first use, confirm once which folder is the root.

## Steps

1. **Check the root and install the convention**: if the root has no `CLAUDE.md`, copy this skill's `references/claude-md.template.md` to `CLAUDE.md` (never overwrite an existing one). The vault root's `CLAUDE.md` is the structure convention, and the other vault-* skills open it as the single source of structure.
2. **Check existence (idempotent)**: if `<topic>/` already exists, do not recreate it; **add only the missing files**.
3. **Create the minimal skeleton** per the convention:
   - `<topic>/README.md`: overview, scope (what it holds and what it does not), terms, pointers to external material, a one-line history. Fill in only what is known; mark the rest "needs confirmation".
   - `<topic>/INDEX.md`: document map (table header only): `| Document | Summary | Status | Location |`
   - `<topic>/_inbox/.gitkeep`: the inbox for material waiting to be organized
4. **Do not pre-create empty folders**: `docs/` is created by `vault-ingest` with the first document, and `history/<topic>/` by `vault-session` with the first record.
5. **Report**: summarize each file created or filled in, one line each. If the convention file was newly installed, say so too.

## Output

- Initial skeleton of `<topic>/` (README, INDEX, _inbox) and, on first use, the root `CLAUDE.md`.
- Afterwards, raw material accumulates through `vault-push` then `vault-ingest`, and what a session did is recorded with `vault-session`.

## Principles

- **Idempotent**: safe to rerun. Never overwrite what exists; fill in only what is missing.
- **No invention**: unknowns are "needs confirmation". Real material is referenced by location (pointer).
- **One skill, one job**: the skeleton here, individual documents in `vault-ingest`, records in `vault-session`.
