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

## License

MIT
