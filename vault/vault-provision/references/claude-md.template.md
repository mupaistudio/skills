# Knowledge Vault Structure Convention

This folder is a **personal knowledge vault divided by topic.** The convention below is the single source of structure, and `vault-provision`, `vault-push`, `vault-ingest`, `vault-search`, `vault-lint` and `vault-session` all open this document. Do not copy values into the skills; fix them here.

## Structure

```
<root>/
├── CLAUDE.md                  ← this document
├── <topic>/                   ← 1 topic = 1 folder (any number)
│   ├── README.md              overview, scope, terms, pointers to external material, history
│   ├── INDEX.md               document map (1 document = 1 line: summary, status, location)
│   ├── _inbox/                inbox for material waiting to be organized (date-topic.md, emptied after organizing)
│   └── docs/                  organized documents (1 document = 1 file)
└── history/
    └── <topic>/<person-id>/YY-MM-DD_NN_title.md    session records
```

- Do not pre-create empty folders. Create them when content arrives.
- Naming: lowercase slugs; the main document = the folder name; dates are `YYYY-MM-DD` (record files use `YY-MM-DD`). `NN` in a record file name is the sequence number of that day's records, counted per person folder.

## Document template (docs/<document>.md)

1. **Summary**: one or two sentences, status (confirmed / in progress / on hold), last modified date
2. **Key content**: decided things only. Guesses and trial and error go to history.
3. **Evidence / sources**: where the content came from (link, file location, date)
4. **Connections**: related documents, paths to documents in other topics
5. **Original location**: where the real material (code, data, original text) lives. Do not copy it here.
6. **History**: one line each, `date: what changed and why`

## Principles

- **One home for the original**: real material stays where it is, and the vault only points to it (pointer). Do not paste long code, data or original text.
- **The vault holds only what is decided**: anything undecided, unfinished or trial and error stays in history. The only route from a decision in history to the vault is `_inbox`.
- **Do not invent**: write "needs confirmation" for what is unknown.
- **No duplicates**: if a document on the same subject exists, merge instead of creating a new one. The same resource appearing in different topics is normal (the check unit is one topic folder).

## Inbox (_inbox)

- Put memos, decisions, pasted documents and original-location pointers that are not yet classified into `<topic>/_inbox/date-topic.md` (`vault-push`). A person dropping a file in directly counts the same.
- `vault-ingest` organizes them into `docs/` and deletes the used files. The inbox is not a place to pile things up.

## Session records (history)

- What a session did is recorded in `history/<topic>/<person-id>/YY-MM-DD_NN_title.md` (`vault-session`). If one session spans several topics, write **a separate record per topic** and have them point to each other by path.
- Each person only adds **new files** to their own folder. Never overwrite.

## Secrets and personal data

- Do not write secrets (tokens, keys, passwords, connection strings) or personal data (phone numbers, bank accounts, lists of real names) into documents or records. Write only the location (which file, which entry).
- Once pushed to a repository, they remain in history even if deleted, so check before pushing.
