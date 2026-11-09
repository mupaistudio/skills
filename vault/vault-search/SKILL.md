---
name: vault-search
description: "Search a personal knowledge vault and answer with source document paths: lookups like what was this, what was the rule, where is it, plus onboarding summaries for newcomers. Start from INDEX.md for the whole topic, then search docs/. If the vault has no answer, never invent one: state clearly that it is not there and suggest vault-push or vault-ingest. Triggers: vault search, search the vault, find in vault, what was that rule, where is it, onboarding, find the document."
---

# Vault Search

Pull answers out of the knowledge vault. Always give the **source document path** with the answer.

## Input

- **Question or keyword**: "what was the refund rule", "list this topic's documents", "onboarding".
- (Optional) Topic: if unknown, first skim the names of the topic folders at the root.

## Steps

1. **INDEX first**: get the overview from the target topic's `INDEX.md` (document list, status, location). If the topic is unknown, pick by the first line of each `<topic>/README.md`.
2. **Search the body**: grep `<topic>/docs/` to find the relevant section. If needed also look at `history/<topic>/`, but say that history mixes in pre-decision content.
3. **Compose the answer**: answer + **source document path** + the section 5 "Original location" pointer if relevant.
4. **If it is not there, say so**: if the vault has no basis, do not invent. Make clear it is "not there yet" and suggest `vault-push` / `vault-ingest` to record it.
5. **For an onboarding request**, summarize "what the topic is, the document map, where to start" around that topic's `README.md` + `INDEX.md`.

## Output

- Answer + source paths. (Onboarding gives a summary document.)

## Principles

- The vault is a pointer store: if implementation detail is needed, **point to the original location** and send the reader there. Never answer with invented content.
- Read-only. Changing things is `vault-ingest`'s job.
