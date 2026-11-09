---
name: vault-session
description: "Write what a session did as a per-topic record in a personal knowledge vault (history/topic/person-id/): a history, a hand-off link the next session resumes from, and a link to other topics involved. If one session spans several topics, write a separate summary per topic with what that topic needs, and make the records point to each other (session ID, working folder, path of the sibling record). The vault holds only what is decided; history holds what happened, what is unfinished and what is next. Records are checked for secrets and personal data before going into git. Triggers: vault session, save session record, session log, hand off to next session, wrap up the session, save work history, continue tomorrow."
---

# Vault Session (history and hand-off link)

Record what the session did, **split by topic.** A record does three jobs.

- **History**: what was done and why, and what remains.
- **Hand-off link for the next work**: the next session resumes from this one record.
- **Link to other topics**: if work in topic A touches B, leave a record in each of A and B and have them point to each other.

This is not writing the same summary in two places; you write **the summary each topic needs.** But the links (session ID, path of the sibling record) go into all of them. That is the core.

**Boundary with the vault**: vault documents (`<topic>/README`, `docs/`, ...) contain only what is exactly decided. History is a record, so pre-decision content, unfinished work and trial and error sit together. The only route from a decision in a record to the vault is Step 7 (the `_inbox`).

In the summary, keep what cannot be derived from the code: **why it was done that way, what is unfinished and what comes next.** What changed is already known to git. Put a one-line "Purpose" first so the next session does not drift into its own agenda.

## Location

```
<root>/history/<topic>/<person-id>/YY-MM-DD_NN_title.md
```

- **Topic** = the name of a topic folder at the root (a folder that has README.md), exactly. For a topic with no folder, do not record; tell the user to run `vault-provision` first.
- **Order is topic then person.** Links connect topics, and people are split within each.
- **Each person only adds new files to their own folder.** Never overwrite, so several sessions can use the same repository without colliding.
- **Never write to a repository outside the vault.** Pointing to one by path is fine.
- `NN` is the sequence number of that day's records in that person folder (01, 02, ...).

## Step 1: This session (session ID, working folder, person ID)

```bash
SID="${CLAUDE_CODE_SESSION_ID:-}"                                    # this session's ID
J=$(ls ~/.claude/projects/*/"$SID".jsonl 2>/dev/null | head -1)       # conversation log file
WORKDIR=$(python3 -c 'import json,sys
for l in open(sys.argv[1],encoding="utf-8"):
    try: c=json.loads(l).get("cwd")
    except Exception: continue
    if c: print(c); break' "$J" 2>/dev/null)                          # folder the session was opened in
[ -n "$WORKDIR" ] || WORKDIR="$PWD"
ROOT=$(git -C "$WORKDIR" rev-parse --show-toplevel 2>/dev/null || echo "$WORKDIR")   # vault root
```

- **Read the session ID from the environment variable.** Do not guess from folders. If missing, write "session ID not confirmed". (On Windows, use `python` if `python3` is missing.)
- **The working folder is the folder the session was opened in.** The conversation log is stored under that folder's name, so it must be opened from that folder to restore it.
- **Person ID**: environment variable `VAULT_USER`, else `git config user.name` as a slug, else ask once.
- If `ROOT` has no `CLAUDE.md` (the structure convention) and no topic folders, stop and point to `vault-provision`.

## Step 2: Topics this session touched

Pick topics from the paths of the files changed in this session and from the conversation.

| Path | Topic |
|---|---|
| `<topic>/...` | that topic |
| Only shared root places (`CLAUDE.md`, tool settings, ...) | ask the user once |

- **Main topic**: the center of the work. Write the full summary.
- **Linked topics**: only where something that topic needs to know **actually arose** (what came over, what is pending there, decisions that are that side's to make). Do not include places that were merely named; being related does not mean there is something to record.
- **Previous record**: if a history record was inherited when this session started, note it.

## Step 3: Sequence number and file name

Count per topic within its own folder.

```bash
ls "$ROOT/history/<topic>/<ID>/$(date +%y-%m-%d)"_* 2>/dev/null | wc -l   # +1 is the sequence number
```

The file name is `YY-MM-DD_NN_title.md`; the title joins key words with hyphens. Choose the title separately per topic from that record's content. Create the folder if missing. **Settle all file names first** so both sides' paths can be written at once.

## Step 4: Work state snapshot

Capture it so the next session immediately knows "how far did it get".

1. **Vault git**: did this session's changes reach a commit?
   ```bash
   git -C "$ROOT" status -sb | head -1; git -C "$ROOT" log --oneline -3
   ```
   If the working tree has changes this session did not make, write "owner unknown, not included". Do not assume they belong to another session.
2. **Other repositories**: only if this session read or wrote another repository, its `status -sb` and `log --oneline -3`. Do not modify it.
3. **Remaining work**: items left in that topic's `_inbox/`, and pending to-do lists.

## Step 5: Write the summary

### Main topic record

Fill in this template. Leave empty sections as "N/A", so the next session can tell a missing section from "checked and none".

```markdown
# Session record: [one line on the core topic]

## Links
- **This record**: history/<topic>/<ID>/<file> (main)
- **This session**: `<session ID>` · working folder `<WORKDIR>`
- **Other records of the same session**: history/<topic2>/<ID>/<file> (that side's part in one line; "none" if none)
- **Previous record**: history/<topic>/<ID>/<file> (what was inherited; "none" if none)
- **Other repositories**: path ("none" if none)

## Session info
- **Date**: YYYY-MM-DD
- **Topic**: <topic> (person <ID>)
- **Session restore**: `cd '<WORKDIR>' && claude --resume '<session ID>'`

## Purpose (Why)
What is this meant to enable: one line on the goal beyond the change itself.

## Goal (Outcome)
Results that can be checked at the end of the session (files, links, data state).

## Short-term goal (Next Action)
1 to 3 things the next session can start on right away. Actions, not analysis.
- [ ] ...

## Work summary
3 to 7 things done.

## What succeeded
What was actually solved or confirmed, and "why it was done this way". Write confirmation as values (the value read back). "Done" is a claim; "read back and it was X" is a value.

## Decisions
- Quote the user's decisions **verbatim**. Write proposals (interpretations) separately as "Interpretation:".
- Separate what you decided on your own judgment as "My judgment (reported)".

## Lessons
Detours, mistakes, preventing recurrence: the judgment level that code cannot solve.

## Constraints and problems found
Tool, environment and external constraints; unresolved problems (symptom, suspected cause, handling).

## Current state
Done / in progress / on hold.

## Work state (Step 4 snapshot)
- Vault git:
- Other repositories:
- Remaining work:

## To do in later sessions (backlog)
Things to do someday, separate from the short-term goal.

## Session restore
cd '<WORKDIR>' && claude --resume '<session ID>'
```

### Linked topic record

Write only what that topic needs to know. Do not abridge the main record into it; if the same content is in two places, only one gets fixed and they drift apart.

```markdown
# Session record: [one line from this topic's view]

## Links
- **This record**: history/<topic2>/<ID>/<file> (linked)
- **Main record**: history/<topic>/<ID>/<file> (full summary is there)
- **This session**: `<session ID>` · working folder `<WORKDIR>`

## What came into this topic
What came over and why it touches this topic.

## What is pending in this topic
What must be done or awaited here. Decisions that are this topic's to make (verbatim).

## Next to do
- [ ] ...

## Session restore
cd '<WORKDIR>' && claude --resume '<session ID>'
```

- A linked record goes **no further than adding one new file** to that topic's history. What to reflect in that topic's documents is for that topic to decide.
- Records write each other's paths.

## Step 6: Check, save, git

History goes into git. Whatever goes in remains in the log even if deleted, so check before saving.

1. **Secrets and personal data check**: run it over every file written and look at each hit line by line:
   ```bash
   grep -nEi '(token|secret|passw(or)?d|private[_ -]?key|api[_-]?key)[^|]{0,20}[:=]|-----BEGIN|\b[0-9]{10,}\b' <files>
   ```
   - Do not write secrets (tokens, keys, passwords, connection strings). Write only where they are (e.g. "the token in `.env`").
   - Do not write personal data (phone numbers, bank account numbers, lists of real names). Keep only counts or batch numbers.
   - If a hit is a legitimate value (a number, amount or ID), leave it. If you fixed something, run it again.
2. **Save**: create new files only. If the name already exists, raise the sequence number.
3. **git**: if the vault is a git repository, commit limited to your own files (several sessions may share one working tree):
   ```bash
   cd "$ROOT" && git add -- <my files>
   git diff --cached --name-only          # look at everything: did someone else's staged work get mixed in?
   git commit -m "docs(history): <topic> - <title>" -- <my files>
   ```
   If there is a remote and the repository is normally merged by PR, follow the branch then PR flow. Otherwise stop at the commit and ask the user whether to push.

## Step 7: Decisions to the inbox

Do this **only when the current state is done and there are decisions.** In the main topic's `<topic>/_inbox/date-topic.md`, put the decisions verbatim as raw material (same form as `vault-push`). Organizing them into vault documents is done by `vault-ingest`. If anything is unfinished, do not create it; create it after the next session completes the work.

- Do not put anything in a linked topic's `_inbox`; that side learns of it through the linked record in history.
- Include the `_inbox` file in Step 6's check and commit as well.

## Step 8: Report

Facts first, in plain words. Write steps not done as "not run: reason".

```
Session record complete
- <topic>: history/<topic>/<ID>/<file> (main)
- <topic2>: history/<topic2>/<ID>/<file> (linked)
Inbox: <topic>/_inbox/<file> (or "not complete: next session" / "no decisions")
git: commit <hash> (or reason)
Restore: cd '<WORKDIR>' && claude --resume '<session ID>'
```

## Prohibitions

- **Record only**: no code changes or execution, and no edits to other topics' documents. For other topics, only add new files to history.
- **Do not write secrets or personal data**: never skip the Step 6 check.
- **Do not overwrite**: always a new file.
- **Do not write to repositories outside the vault.**
