---
name: use-browser
description: "Controls a dedicated Chrome directly through the Chrome DevTools Protocol (CDP): open pages, click, type, take screenshots, evaluate JS, collect console errors and failed network requests, and run multi-step browser scenarios without writing a one-off Playwright script each time. Use when the user asks to open the browser, take a screenshot, check console errors, use CDP or remote debugging, automate clicks and typing, or test a page in a real browser."
---

# use-browser

Drives a **dedicated Chrome** (its profile is separate from your everyday Chrome) listening on a CDP port. Your everyday Chrome is never touched.
Windows only (PowerShell). Below, `<skill>` is the "Base directory" reported when this skill is invoked (the folder containing `SKILL.md`).

## First-time setup

1. Requirements: Node.js 18+ (with npm), Google Chrome, PowerShell 5.1+.
2. Run `node <skill>/scripts/ensure-deps.js`. `DEPS_OK` or `DEPS_INSTALLED` means done. On failure, report the printed reason (no Node/npm, no internet) to the user as is.
   A pinned playwright-core version is installed under `~/.local/share/use-browser/browser`. Nothing is installed into the skill folder.

## Working order

1. **Look up past work**: check `references/INDEX.md` for the same site and task; if there is one, read the matching `references/cases/` file and absorb its pitfalls.
2. **Start Chrome**: `powershell -ExecutionPolicy Bypass -File <skill>/scripts/start.ps1 [-Port 9333] [-Profile <name>] [-Url <address>]`. Does nothing if it is already running. Login state is kept in the profile.
3. **Run commands**: port is `-Port`, else env `CDP_PORT`, else `9333`. The JS commands connect using the same `CDP_PORT`, so set it to match, e.g. `$env:CDP_PORT=9333`.
4. **Check the result**: verify the screen and values after every step. Do not guess; look with `shot` and `eval`.
5. **Clean up**: when finished, run `stop.ps1` (stops only its own port's Chrome). Use `-All` only when the user explicitly asks.
6. **Record**: for work likely to repeat, write `references/cases/<date>_<slug>.md` (request, steps taken, result, pitfalls) and add one line to `references/INDEX.md`. Never write passwords or tokens.

## Instant commands `scripts/remote.js`

```
node <skill>/scripts/remote.js tabs
node <skill>/scripts/remote.js navigate <url> [--tab=<index|part of url>] [--new]
node <skill>/scripts/remote.js reload [--hard]
node <skill>/scripts/remote.js shot <name> [--case=<slug>] [--full] [--clip=x,y,w,h]
node <skill>/scripts/remote.js click <selector>
node <skill>/scripts/remote.js mouse <x> <y> [--dbl]     # click at coordinates (real input)
node <skill>/scripts/remote.js type <selector> <text>    # React-compatible typing
node <skill>/scripts/remote.js keys <text> [--select-all] [--enter]   # type into the current focus
node <skill>/scripts/remote.js wait <selector> [--ms=10000]
node <skill>/scripts/remote.js attrs <selector>
node <skill>/scripts/remote.js eval "<js expression>"
node <skill>/scripts/remote.js collect 5000               # 5 s of console errors + network failures
node <skill>/scripts/remote.js close --tab=<index>
node <skill>/scripts/remote.js workdir [--case=<slug>] [--clean]    # temp capture folder
```

Captures go to a temp folder (`%TEMP%/use-browser/<slug>/`, override with env `USE_BROWSER_WORK`). Nothing is written into the skill folder.

## Multi-step scenarios `scripts/run.js`

```
node <skill>/scripts/run.js <step.js> --case=<slug> [--tab=<selector>] [--accept-dialogs]
```

`step.js` is `module.exports = async (H) => { ...; return result }`. `H` = `page · cdp · context · wait · front · shot · mouse · clickAt · dragTo · key · type · ime · ev · S · mark · DIR`.
After `mark('step')`, write requests, 4xx/5xx responses, console errors and dialogs are grouped under that step in `<DIR>/diagnostics/<step>.json` (tokens and passwords are masked).

## Rules

- **Judge by real input.** `clickAt`, `key` and `type` send real browser input (isTrusted). Do not claim success from scripted `element.click()` or value assignment alone; some fields do not recognize such values (for select fields, focus then arrow keys is reliable).
- Perform writes (save, delete, pay, send) only when the user has allowed them. Before clicking, read back the value to confirm the target field and selection registered in the app.
- Automation gets blocked by JS alert and confirm dialogs. Warn before pressing a button that may raise one, and handle it with `--accept-dialogs` or `H.page.on('dialog')`.
- Logins and passwords are the user's to enter. Never leave account values in skill files or records.
- A minimized window or a tab behind others can stall capture and input. If there is no response, bring the tab forward with `front`.
- Never start or stop a port another program uses. When several instances are needed, use different `-Port` and `-Profile` values.
- Sites that need a long login can expire the session (401). If it expires just before a write, the request is cut off mid-way, so log in again partway through long tasks.
