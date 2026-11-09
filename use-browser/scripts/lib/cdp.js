/**
 * CDP helpers: port, connection, tab picking, capture temp folder, secret masking.
 * Port: env CDP_PORT, else 9333.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const SKILL_DIR = path.join(__dirname, '..', '..');

function cdpPort() {
    if (process.env.CDP_PORT) return process.env.CDP_PORT;
    return '9333';
}

async function connect() {
    const { chromium } = require('./pw'); // pinned playwright-core (installed by ensure-deps.js)
    const port = cdpPort();
    try {
        return await chromium.connectOverCDP('http://127.0.0.1:' + port);
    } catch (e) {
        console.error(`[ERR] CDP connection failed (port ${port}). Run start.ps1 -Port ${port} first.`);
        console.error(`     ${e.message}`);
        process.exit(1);
    }
}

// --tab=<idx> | <part of URL> | none (last tab)
function pickPage(context, tabSelector) {
    const pages = context.pages();
    if (pages.length === 0) return null;
    if (tabSelector === undefined || tabSelector === '') return pages[pages.length - 1];
    const idx = parseInt(tabSelector, 10);
    if (String(idx) === String(tabSelector) && idx >= 0 && idx < pages.length) return pages[idx];
    const matched = pages.find(p => p.url().includes(tabSelector));
    if (matched) return matched;
    console.error(`[ERR] No tab matched: ${tabSelector}`);
    pages.forEach((p, i) => console.error(`  [${i}] ${p.url()}`));
    process.exit(2);
}

// Captures and diagnostics go to a temp folder (never the skill folder)
function workDir(slug) {
    const dir = path.join(process.env.USE_BROWSER_WORK || path.join(os.tmpdir(), 'use-browser'), slug || '_scratch');
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

// Mask secrets before writing to diagnostics files
const RED = s => String(s)
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '<jwt>')
    .replace(/("(?:password|refresh_token|access_token)"\s*:\s*")[^"]*/g, '$1***');

module.exports = { SKILL_DIR, cdpPort, connect, pickPage, workDir, RED };
