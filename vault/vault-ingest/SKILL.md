---
name: vault-ingest
description: "Organize and merge raw material from the inbox or other sources into proper documents of a personal knowledge vault: read topic/_inbox/ items (first priority), pasted text, decisions settled in conversation and work products, decide which topic and document each belongs to, create the document from the convention's six-section template if missing and add one INDEX line, or merge into the right section if it exists. Long code and originals go in by location (pointer) only. Delete inbox items once organized. Triggers: vault ingest, organize the inbox, empty the inbox, merge knowledge, write it up as a document, update INDEX."
---

# Vault Ingest

Organize and merge raw material from the inbox or other sources **into proper documents.** Creating a new document and merging into an existing one are both its job. The single source for structure and the document template is the root `CLAUDE.md`; open that document instead of copying values here.

## Input

- **Source**: pending items in `<topic>/_inbox/` (first priority), pasted text, decisions settled in conversation, work products.
- (Optional) Target hint: which topic and document.

## Steps

1. **Read the source**: separate what is fact (rules, decisions, history) from noise (guesses, trial and error, implementation detail). Only what is settled goes into vault documents.
2. **Decide where it belongs**: which topic and which document. First check whether the same document already exists within the topic.
3. **Secure the document**: if there is none, create `<topic>/docs/<document>.md` from the six-section template in `CLAUDE.md` and add one line to `INDEX.md`. **If the topic folder does not exist**, tell the user to run `vault-provision` first.
4. **Integrate into sections**: put it in the right section (key content, evidence, connections, original location). **Do not copy long code, data or original text; point to its location.**
5. **Merge first**: if a document on the same subject exists, merge instead of creating a new one (no duplicates).
6. **Update history and INDEX**: add `date: what and why` to the history section (section 6), and update the INDEX line too if the status changed.
7. **Empty the inbox**: if the item came from `_inbox/`, delete the file once integration is done. Report where it went before deleting.
8. **Secrets and personal data**: if the raw material contains tokens, passwords, phone numbers or bank accounts, do not carry them into the document; write only where they are.

## Output

- Organized and merged documents (plus a new document and INDEX line if needed) and an emptied inbox.

## Principles

- **One home for the original**: organizing means setting knowledge in its place, not duplicating the original.
- **Only what is decided**: anything undecided stays in `_inbox` or goes to history, not into documents.
