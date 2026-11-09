#!/usr/bin/env node
/**
 * use-browser scripts/run.js — reference runner. Runs a multi-step scenario from a step file and records what it observed.
 *
 * Usage: node run.js <step.js> [--case=<slug>] [--tab=<sel>] [--accept-dialogs]
 *   step.js = `module.exports = async (H) => { ... return result }`
 *   H = { page, cdp, context, wait, front, shot, mouse, clickAt, dragTo, key, type, ime, ev, S, mark, DIR }
 *   - writes, errors and dialogs after mark('step name') are grouped under that step
 *   - shot(name, clip?) = Page.captureScreenshot directly (no 30 s stall) → <DIR>/shots/<name>.png
 * Result: <DIR>/diagnostics/<step name>.json (secrets masked) + stdout (MAXOUT chars, default 12000)
 *   DIR = <temp>/use-browser/<slug>. Move what you need to references/cases, then delete it.
 * Write watch: POST/PUT/PATCH/DELETE are logged to S.writes (not blocked; the write scope is set by the request or policy).
 *
 * So that old runners (attached to records as a runner) can also be run through this file, require('playwright' | 'playwright-core')
 * is redirected to the plugin's pinned copy (lib/pw.js):  node run.js --legacy <old-runner.js> [args...]
 */
const Module = require('module');
const fs = require('fs');
const path = require('path');

const PW = require.resolve('./lib/pw');
require(PW); // Load the real playwright-core once before intercepting so it is cached (avoids a cycle with pw.js's own require)
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
    if (request === 'playwright' || request === 'playwright-core') return PW;
    return origResolve.call(this, request, ...rest);
};

const { connect, pickPage, workDir, RED } = require('./lib/cdp');

const argv = process.argv.slice(2);
const getOpt = (n, d) => { const m = argv.find(a => a.startsWith(`--${n}=`)); return m ? m.slice(n.length + 3) : d; };
const pos = argv.filter(a => !a.startsWith('--'));

if (argv[0] === '--legacy') {
    const file = path.resolve(argv[1] || '');
    if (!argv[1]) { console.error('Usage: run.js --legacy <old-runner.js> [args...]'); process.exit(1); }
    process.argv = [process.argv[0], file, ...argv.slice(2)];
    require(file);
    return;
}

(async () => {
    if (!pos[0]) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 17).join('\n')); process.exit(1); }
    const stepFile = path.resolve(pos[0]);
    const DIR = workDir(getOpt('case'));
    fs.mkdirSync(path.join(DIR, 'shots'), { recursive: true });
    fs.mkdirSync(path.join(DIR, 'diagnostics'), { recursive: true });

    const browser = await connect();
    const context = browser.contexts()[0];
    const page = pickPage(context, getOpt('tab'));
    const cdp = await context.newCDPSession(page);
    const wait = ms => page.waitForTimeout(ms);
    const S = { ms: [], writes: [], bad: [], consoleErrs: [], pageErrs: [], dialogs: [] };
    const cur = () => S.ms.length ? S.ms[S.ms.length - 1] : '-';
    const mark = n => S.ms.push(n);
    const strip = u => u.replace(/^https?:\/\/[^/]+/, '');
    const accept = argv.includes('--accept-dialogs');

    page.on('dialog', async d => { S.dialogs.push({ step: cur(), type: d.type(), message: d.message() }); try { await (accept ? d.accept() : d.dismiss()); } catch (e) {} });
    page.on('console', m => { if (m.type() === 'error') S.consoleErrs.push({ step: cur(), text: m.text().slice(0, 300) }); });
    page.on('pageerror', e => S.pageErrs.push({ step: cur(), message: String(e.message).slice(0, 300) }));
    page.on('request', r => { if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method())) S.writes.push({ step: cur(), m: r.method(), url: strip(r.url()), body: RED(r.postData() || '').slice(0, 200) }); });
    page.on('response', r => { if (r.status() >= 400) S.bad.push({ step: cur(), m: r.request().method(), url: strip(r.url()), status: r.status() }); });

    const front = async () => { try { await cdp.send('Page.bringToFront'); } catch (e) {} };
    const shot = async (name, clip) => {
        try {
            const a = { format: 'png' };
            if (clip) a.clip = { ...clip, scale: 1 };
            const r = await cdp.send('Page.captureScreenshot', a);
            fs.writeFileSync(path.join(DIR, 'shots', name + '.png'), Buffer.from(r.data, 'base64'));
            return name + '.png';
        } catch (e) { return 'ERR ' + e.message; }
    };
    // Real input (isTrusted) via Input.dispatchMouseEvent
    const mouse = (type, x, y, b = 0, extra = {}) => cdp.send('Input.dispatchMouseEvent', {
        type, x, y, button: type === 'mouseMoved' ? (b ? 'left' : 'none') : 'left', buttons: b,
        clickCount: type === 'mouseMoved' ? 0 : (extra.clickCount || 1), modifiers: extra.modifiers || 0,
    });
    const clickAt = async (x, y, n = 1) => {
        await mouse('mouseMoved', x, y);
        for (let i = 1; i <= n; i++) { await mouse('mousePressed', x, y, 1, { clickCount: i }); await mouse('mouseReleased', x, y, 0, { clickCount: i }); }
    };
    const dragTo = async (x, y, x2, y2, { steps = 15, hold = 80, during = null } = {}) => {
        await mouse('mouseMoved', x, y); await mouse('mousePressed', x, y, 1); await wait(hold);
        let mid = null;
        for (let i = 1; i <= steps; i++) {
            await mouse('mouseMoved', x + (x2 - x) * i / steps, y + (y2 - y) * i / steps, 1); await wait(30);
            if (during && i === steps) mid = await during();
        }
        await mouse('mouseReleased', x2, y2, 0); await wait(500);
        return mid;
    };
    const MODS = { Alt: 1, Control: 2, Meta: 4, Shift: 8 };
    const VK = { Delete: 46, Backspace: 8, Enter: 13, Escape: 27, Tab: 9, ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39, Home: 36, End: 35 };
    const key = async (combo, w = 300) => {
        const parts = combo.split('+'); const k = parts.pop(); let mod = 0;
        for (const p of parts) mod |= MODS[p];
        const isChar = k.length === 1;
        const code = isChar ? (/[a-z]/i.test(k) ? 'Key' + k.toUpperCase() : (/\d/.test(k) ? 'Digit' + k : '')) : k;
        const vk = isChar ? k.toUpperCase().charCodeAt(0) : (VK[k] || 0);
        const d = { type: 'keyDown', key: (mod & 8) && isChar ? k.toUpperCase() : k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers: mod };
        if (isChar && !(mod & 7)) d.text = k;
        if (k === 'Enter' && !mod) d.text = '\r';
        await cdp.send('Input.dispatchKeyEvent', d);
        await cdp.send('Input.dispatchKeyEvent', { ...d, type: 'keyUp', text: undefined });
        if (w) await wait(w);
    };
    const type = async (text, delay = 40) => { for (const ch of text) { await cdp.send('Input.insertText', { text: ch }); await wait(delay); } };
    // Simulate Korean IME composition: go through in-progress characters with imeSetComposition, commit with insertText
    const ime = async (steps, finalText, delay = 120) => {
        for (const s of steps) { await cdp.send('Input.imeSetComposition', { text: s, selectionStart: s.length, selectionEnd: s.length }); await wait(delay); }
        await cdp.send('Input.insertText', { text: finalText }); await wait(delay);
    };
    const ev = (fn, arg) => page.evaluate(fn, arg);

    const H = { page, cdp, context, wait, front, shot, mouse, clickAt, dragTo, key, type, ime, ev, S, mark, DIR };
    const step = require(stepFile);
    let res;
    try { res = await step(H); } catch (e) { res = { FATAL: String(e.stack || e).slice(0, 800) }; }
    const out = { res, S: { writes: S.writes, bad: S.bad, consoleErrs: S.consoleErrs, pageErrs: S.pageErrs, dialogs: S.dialogs } };
    const text = RED(JSON.stringify(out, null, 1));
    const nm = path.basename(stepFile, path.extname(stepFile));
    fs.writeFileSync(path.join(DIR, 'diagnostics', nm + '.json'), text, 'utf8');
    console.log(text.slice(0, +(process.env.MAXOUT || 12000)));
    console.error(`[run] ${path.join(DIR, 'diagnostics', nm + '.json')}`);
    await browser.close().catch(() => {});
    process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
