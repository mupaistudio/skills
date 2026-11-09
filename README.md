# skills

Claude Code skills by mupaistudio.

## use-browser

Claude Code drives a dedicated Chrome through the Chrome DevTools Protocol (CDP): open pages, click, type, take screenshots, collect console and network errors, run multi-step scenarios. It never touches your everyday Chrome (separate profile). **Windows only.**

Requirements: Node.js 18+ (with npm), Google Chrome, PowerShell 5.1+.

Install in Claude Code:

```
/plugin marketplace add mupaistudio/skills
/plugin install use-browser@mupaistudio-skills
```

On first use Claude runs `ensure-deps.js`, which installs a pinned `playwright-core` once (internet needed; no browser download).

Then just ask, for example: "use-browser: open https://example.com and take a screenshot", "collect console errors on this page".

## vault

A personal knowledge vault you grow topic by topic. Create as many topics as you like; each topic is a folder with an overview, a document map and an inbox. (Not a secrets manager — it stores notes and decisions.)

| Skill | Does |
|---|---|
| `vault-provision` | Creates a new topic skeleton (README, INDEX, _inbox) and installs the vault's `CLAUDE.md` conventions on first use. Several topics at once is fine. |
| `vault-push` | Drops raw notes / decisions / pointers into a topic's `_inbox/`. |
| `vault-ingest` | Organizes the inbox into proper documents (6-section template) and updates INDEX. |
| `vault-search` | Answers from the vault with source paths; says "not there" instead of inventing. |
| `vault-lint` | Checks dead pointers, INDEX mismatches, pasted bulk copies, stale and duplicate docs. |
| `vault-session` | Writes a session record **per topic** (`history/<topic>/<person>/`), cross-linked when a session spans topics, so the next session can resume. |

Install:

```
/plugin marketplace add mupaistudio/skills
/plugin install vault@mupaistudio-skills
```

Start with: "vault-provision: create topics `cooking` and `invest-notes`".

## logical

A toolkit around MECE logical thinking. The skills chain: think, then verify, then build or export.

| Skill | Does |
|---|---|
| `logical-think` | Decomposes a complex topic into a numbered MECE tree (same-criteria sibling branches, closed/open set check, atomic 1-3 day tasks). |
| `logical-verification` | Checks a thinking result for ME/CE violations, criteria consistency and quality, and writes a scored report. |
| `logical-tree` | Turns a numbered thinking result into an executable `small_pictures/` workset: one folder per unit with four process files plus a `workset_controller`. |
| `logical-csv` | Exports the numbered hierarchy to spreadsheet-ready CSV (vertical columns or sitemap). |
| `logical-memory` | Verifies and reorganizes Claude Code auto-memory (MEMORY.md plus topic files) with MECE; moves, never deletes, and only after approval. |

Install:

```
/plugin marketplace add mupaistudio/skills
/plugin install logical@mupaistudio-skills
```

Start with: "logical-think: break down 'launch a newsletter' (depth deep)", then "logical-tree: build the workset from that result".

## License

MIT
