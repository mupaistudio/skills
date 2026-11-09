/**
 * CDP 공용 — 포트 · 연결 · 탭 고르기 · 캡처 임시 폴더 · 비밀값 가림.
 * 포트: env CDP_PORT, 없으면 9333.
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
    const { chromium } = require('./pw'); // 고정 판 playwright-core (ensure-deps.js 가 깐 자리)
    const port = cdpPort();
    try {
        return await chromium.connectOverCDP('http://127.0.0.1:' + port);
    } catch (e) {
        console.error(`[ERR] CDP 연결 실패(포트 ${port}). start.ps1 -Port ${port} 먼저 실행하세요.`);
        console.error(`     ${e.message}`);
        process.exit(1);
    }
}

// --tab=<idx> | <URL 부분> | 없음(마지막 탭)
function pickPage(context, tabSelector) {
    const pages = context.pages();
    if (pages.length === 0) return null;
    if (tabSelector === undefined || tabSelector === '') return pages[pages.length - 1];
    const idx = parseInt(tabSelector, 10);
    if (String(idx) === String(tabSelector) && idx >= 0 && idx < pages.length) return pages[idx];
    const matched = pages.find(p => p.url().includes(tabSelector));
    if (matched) return matched;
    console.error(`[ERR] 탭 매칭 실패: ${tabSelector}`);
    pages.forEach((p, i) => console.error(`  [${i}] ${p.url()}`));
    process.exit(2);
}

// 캡처 · 진단은 임시 폴더에 둔다(스킬 폴더에 쓰지 않음)
function workDir(slug) {
    const dir = path.join(process.env.USE_BROWSER_WORK || path.join(os.tmpdir(), 'use-browser'), slug || '_scratch');
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

// 진단 파일에 적기 전에 비밀값을 가림
const RED = s => String(s)
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '<jwt>')
    .replace(/("(?:password|refresh_token|access_token)"\s*:\s*")[^"]*/g, '$1***');

module.exports = { SKILL_DIR, cdpPort, connect, pickPage, workDir, RED };
