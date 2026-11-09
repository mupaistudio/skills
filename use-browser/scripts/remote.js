#!/usr/bin/env node
/**
 * use-browser scripts/remote.js — CDP/Playwright 즉석 조작 CLI.
 *
 * 전제: start.ps1 로 CDP Chrome 이 떠 있어야 함. 포트 = env CDP_PORT, 없으면 9333.
 *       playwright-core 는 ensure-deps.js 가 PC 한 자리에 깐 고정 판을 쓴다.
 *
 * 사용:
 *   node remote.js tabs
 *   node remote.js navigate <url> [--tab=<sel>] [--new]
 *   node remote.js reload [--hard] [--nuke] [--url=<url>] [--ms=3000] [--tab=<sel>]  # --hard 캐시 비움 · --nuke SW·Cache API 까지
 *   node remote.js shot <name> [--tab=<sel>] [--full] [--clip=x,y,w,h] [--cdp] [--case=<slug>]
 *   node remote.js click <selector> [--tab=<sel>]
 *   node remote.js mouse <x> <y> [--dbl] [--watch=<ms>] [--tab=<sel>]  # 좌표 클릭(isTrusted). --watch 동안 쓰기·오류·대화상자·토스트 수집
 *   node remote.js mousetest [<x> <y>] [--tab=<sel>]                    # 입력 생존 확인: 실제 도달한 마우스 이벤트
 *   node remote.js type <selector> <text> [--tab=<sel>]                 # React 호환 native setter 사용
 *   node remote.js keys <text> [--select-all] [--enter] [--tab=<sel>]   # 지금 포커스에 키보드 입력(그리드 셀 · contenteditable)
 *   node remote.js eval "<js expr>" [--tab=<sel>]
 *   node remote.js wait <selector> [--tab=<sel>] [--ms=10000]
 *   node remote.js attrs <selector> [--tab=<sel>]                       # DOM 속성 검사
 *   node remote.js collect [<ms>] [--tab=<sel>]                         # 콘솔 에러 + 네트워크 실패 수집 (기본 5000ms)
 *   node remote.js close --tab=<sel>
 *   node remote.js workdir [--case=<slug>] [--clean]                    # 캡처 임시 폴더 경로 (--clean 으로 지움)
 *
 * 탭 선택: --tab=<idx> 인덱스 · --tab=<url부분> 부분 일치 · 없으면 마지막 탭
 * collect 권장값: 3000 정적 화면 · 5000 일반(기본) · 10000 자동 갱신/비동기 많은 화면
 *
 * shot 저장 위치 (스킬 폴더에는 쓰지 않는다):
 *   --case=<slug> : <임시>/use-browser/<slug>/shots/<name>.png (다 쓰면 workdir --case=<slug> --clean 으로 지움)
 *   미지정         : <임시>/use-browser/_scratch/<name>.png
 *   --cdp         : Page.captureScreenshot 직접(폰트 대기로 shot 이 30초 멈출 때, tool.md §24)
 */
const fs = require('fs');
const path = require('path');
const { connect, pickPage, workDir } = require('./lib/cdp');

const argv = process.argv.slice(2);
const cmd = argv[0];
const HELP_LINES = 32;

function getOpt(name, def) {
    const m = argv.find(a => a.startsWith(`--${name}=`));
    if (!m) return def;
    return m.slice(name.length + 3);
}
function hasFlag(name) {
    return argv.includes(`--${name}`);
}
function positional() {
    return argv.filter(a => !a.startsWith('--'));
}

const EXTRA = {
    async shot(context) {
        const [, name] = positional();
        if (!name) { console.error('Usage: shot <name> [--case=<slug>] [--full] [--clip=x,y,w,h] [--cdp]'); process.exit(1); }
        const page = pickPage(context, getOpt('tab'));
        if (!page) { console.error('[ERR] 탭 없음'); process.exit(1); }
        const slug = getOpt('case');
        const dir = slug ? path.join(workDir(slug), 'shots') : workDir();
        fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, `${name}.png`);
        const c = getOpt('clip');
        const clip = c ? (([x, y, width, height]) => ({ x, y, width, height }))(c.split(',').map(Number)) : undefined;
        if (hasFlag('cdp')) {
            const cdp = await context.newCDPSession(page);
            const args = { format: 'png' };
            if (clip) args.clip = { ...clip, scale: 1 };
            const { data } = await cdp.send('Page.captureScreenshot', args);
            fs.writeFileSync(file, Buffer.from(data, 'base64'));
        } else {
            await page.screenshot({ path: file, fullPage: hasFlag('full'), clip });
        }
        console.log(`[OK] ${file}`);
    },

    async reload(context) {
        const page = pickPage(context, getOpt('tab'));
        const cdp = await context.newCDPSession(page);
        if (hasFlag('hard') || hasFlag('nuke')) {
            await cdp.send('Network.clearBrowserCache');
            await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
        }
        if (hasFlag('nuke')) {
            await page.evaluate(async () => {
                try { for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); } catch (e) {}
                try { for (const k of await caches.keys()) await caches.delete(k); } catch (e) {}
            }).catch(() => {});
        }
        const url = getOpt('url');
        // F5 키는 CDP 로 새로고침이 안 된다 — Page.reload 를 쓴다
        if (url) await page.goto(url, { waitUntil: 'domcontentloaded' });
        else await cdp.send('Page.reload', { ignoreCache: hasFlag('hard') || hasFlag('nuke') });
        await page.waitForTimeout(parseInt(getOpt('ms', '3000'), 10));
        console.log(`[OK] reloaded → ${page.url()}`);
    },

    async mouse(context) {
        const [, xs, ys] = positional();
        const x = parseFloat(xs), y = parseFloat(ys);
        if (isNaN(x) || isNaN(y)) { console.error('Usage: mouse <x> <y> [--dbl] [--watch=<ms>]'); process.exit(1); }
        const page = pickPage(context, getOpt('tab'));
        const watch = parseInt(getOpt('watch', '0'), 10);
        const W = { writes: [], bad: [], dialogs: [], consoleErrs: [] };
        if (watch) {
            page.on('dialog', async d => { W.dialogs.push({ type: d.type(), message: d.message() }); await d.dismiss().catch(() => {}); });
            page.on('console', m => { if (m.type() === 'error') W.consoleErrs.push(m.text().slice(0, 200)); });
            page.on('request', r => { if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method())) W.writes.push({ m: r.method(), url: r.url().replace(/^https?:\/\/[^/]+/, '').slice(0, 140) }); });
            page.on('response', r => { if (r.status() >= 400) W.bad.push({ s: r.status(), m: r.request().method(), url: r.url().replace(/^https?:\/\/[^/]+/, '').slice(0, 140) }); });
        }
        const hit = await page.evaluate(([px, py]) => {
            const e = document.elementFromPoint(px, py);
            return e ? `${e.tagName}.${String(e.className).slice(0, 40)} "${(e.innerText || '').trim().slice(0, 30)}"` : null;
        }, [x, y]);
        if (hasFlag('dbl')) await page.mouse.dblclick(x, y); else await page.mouse.click(x, y);
        if (watch) {
            await page.waitForTimeout(watch);
            W.toasts = await page.evaluate(() => [...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=toast i]')]
                .map(e => (e.innerText || '').trim()).filter(Boolean).slice(0, 10)).catch(() => []);
        }
        console.log(JSON.stringify({ clicked: [x, y], hit, ...(watch ? W : {}) }, null, 1));
    },

    async mousetest(context) {
        const [, xs, ys] = positional();
        const page = pickPage(context, getOpt('tab'));
        const vp = page.viewportSize() || await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
        const x = xs ? parseFloat(xs) : vp.width / 2, y = ys ? parseFloat(ys) : vp.height / 2;
        await page.evaluate(() => {
            window.__ubEv = [];
            for (const t of ['mousedown', 'mouseup', 'click'])
                document.addEventListener(t, e => window.__ubEv.push({ type: t, trusted: e.isTrusted, tag: e.target.tagName }), true);
        });
        await page.mouse.move(x, y); await page.mouse.click(x, y); await page.waitForTimeout(300);
        const events = await page.evaluate(() => window.__ubEv);
        const alive = events.some(e => e.trusted);
        console.log(JSON.stringify({ alive, at: [x, y], hasFocus: await page.evaluate(() => document.hasFocus()), events }, null, 1));
        if (!alive) console.error('[WARN] 실제 입력이 도달하지 않음 — 네이티브 탭 모달 의심. start.ps1 -Force (tool.md §26)');
    },

    async keys(context) {
        const [, ...rest] = positional();
        const text = rest.join(' ');
        const page = pickPage(context, getOpt('tab'));
        if (hasFlag('select-all')) await page.keyboard.press('Control+A');
        await page.keyboard.type(text, { delay: 30 });
        if (hasFlag('enter')) await page.keyboard.press('Enter');
        await page.waitForTimeout(300);
        console.log(`[OK] keys "${text}"`);
    },
};

function workdirCmd() {
    const slug = getOpt('case');
    if (hasFlag('clean')) {
        if (!slug) { console.error('[ERR] --clean 은 --case=<slug> 와 함께'); process.exit(1); }
        const dir = workDir(slug);
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`[OK] removed ${dir}`);
    } else console.log(workDir(slug));
}

const COMMANDS = {
    async tabs(context) {
        const pages = context.pages();
        console.log(`[INFO] 컨텍스트 ${context.browser().contexts().length}개, 탭 ${pages.length}개`);
        for (let i = 0; i < pages.length; i++) {
            const url = pages[i].url();
            const title = await pages[i].title().catch(() => '?');
            console.log(`  [${i}] ${url}`);
            console.log(`       ${title}`);
        }
    },

    async navigate(context) {
        const [, url] = positional();
        if (!url) { console.error('Usage: navigate <url>'); process.exit(1); }
        let page;
        if (hasFlag('new')) {
            page = await context.newPage();
            console.log('[OK] 새 탭 생성');
        } else {
            page = pickPage(context, getOpt('tab'));
            if (!page) page = await context.newPage();
        }
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        console.log(`[OK] navigated → ${page.url()}`);
        console.log(`     title: ${await page.title()}`);
    },

    async click(context) {
        const [, selector] = positional();
        if (!selector) { console.error('Usage: click <selector>'); process.exit(1); }
        const page = pickPage(context, getOpt('tab'));
        await page.click(selector, { timeout: 10000 });
        console.log(`[OK] clicked ${selector}`);
    },

    async type(context) {
        const [, selector, ...rest] = positional();
        const text = rest.join(' ');
        if (!selector || !text) { console.error('Usage: type <selector> <text>'); process.exit(1); }
        const page = pickPage(context, getOpt('tab'));

        // React controlled inputs do not react to fill(). Use native setter + input event.
        await page.evaluate(({ sel, val }) => {
            const el = document.querySelector(sel);
            if (!el) throw new Error(`selector not found: ${sel}`);
            const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
            setter.call(el, val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }, { sel: selector, val: text });
        console.log(`[OK] typed into ${selector}`);
    },

    async eval(context) {
        const [, ...exprParts] = positional();
        const expr = exprParts.join(' ');
        if (!expr) { console.error('Usage: eval "<js>"'); process.exit(1); }
        const page = pickPage(context, getOpt('tab'));
        const result = await page.evaluate(expr);
        console.log(JSON.stringify(result, null, 2));
    },

    async wait(context) {
        const [, selector] = positional();
        if (!selector) { console.error('Usage: wait <selector>'); process.exit(1); }
        const page = pickPage(context, getOpt('tab'));
        const ms = parseInt(getOpt('ms', '10000'), 10);
        await page.waitForSelector(selector, { timeout: ms });
        console.log(`[OK] selector appeared: ${selector}`);
    },

    async attrs(context) {
        const [, selector] = positional();
        if (!selector) { console.error('Usage: attrs <selector>'); process.exit(1); }
        const page = pickPage(context, getOpt('tab'));
        const result = await page.evaluate((sel) => {
            const els = Array.from(document.querySelectorAll(sel));
            return els.map((el, i) => {
                const rect = el.getBoundingClientRect();
                return {
                    i,
                    tag: el.tagName,
                    id: el.id || undefined,
                    className: el.className?.toString?.().slice(0, 100) || undefined,
                    text: (el.innerText || el.value || '').slice(0, 100),
                    visible: rect.width > 0 && rect.height > 0,
                    disabled: el.disabled,
                    href: el.href,
                    name: el.name,
                    type: el.type,
                    placeholder: el.placeholder?.slice(0, 50),
                };
            });
        }, selector);
        console.log(JSON.stringify(result, null, 2));
    },

    async collect(context) {
        const ms = parseInt(positional()[1] || '5000', 10);
        const page = pickPage(context, getOpt('tab'));
        if (!page) { console.error('[ERR] 탭 없음'); process.exit(1); }

        const consoleErrors = [];
        const consoleWarnings = [];
        const pageErrors = [];
        const networkFails = [];

        const consoleHandler = (msg) => {
            const t = msg.type();
            const text = msg.text();
            if (t === 'error') consoleErrors.push(text);
            else if (t === 'warning') consoleWarnings.push(text);
        };
        const pageErrorHandler = (err) => pageErrors.push(err.message);
        const reqFailedHandler = (req) => {
            networkFails.push({
                kind: 'requestfailed',
                url: req.url(),
                method: req.method(),
                failure: req.failure()?.errorText,
            });
        };
        const responseHandler = (resp) => {
            const status = resp.status();
            if (status >= 400) {
                networkFails.push({
                    kind: 'http_error',
                    url: resp.url(),
                    method: resp.request().method(),
                    status,
                });
            }
        };

        page.on('console', consoleHandler);
        page.on('pageerror', pageErrorHandler);
        page.on('requestfailed', reqFailedHandler);
        page.on('response', responseHandler);

        console.error(`[INFO] Collecting for ${ms}ms on tab ${page.url()}`);
        await new Promise((r) => setTimeout(r, ms));

        page.off('console', consoleHandler);
        page.off('pageerror', pageErrorHandler);
        page.off('requestfailed', reqFailedHandler);
        page.off('response', responseHandler);

        console.log(JSON.stringify({
            durationMs: ms,
            url: page.url(),
            consoleErrors,
            consoleWarnings: consoleWarnings.slice(-20),
            pageErrors,
            networkFails,
            summary: {
                errors: consoleErrors.length + pageErrors.length,
                warnings: consoleWarnings.length,
                netFails: networkFails.length,
            },
        }, null, 2));
    },

    async close(context) {
        const page = pickPage(context, getOpt('tab'));
        const url = page.url();
        await page.close();
        console.log(`[OK] closed: ${url}`);
    },
    ...EXTRA,
};

(async () => {
    if (!cmd || cmd === '-h' || cmd === '--help' || !COMMANDS[cmd] && cmd !== 'workdir') {
        console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, HELP_LINES).join('\n'));
        process.exit(cmd ? 1 : 0);
    }

    if (cmd === 'workdir') { workdirCmd(); return; }
    const browser = await connect();
    const context = browser.contexts()[0];
    if (!context) { console.error('[ERR] 컨텍스트 없음'); process.exit(1); }

    try {
        await COMMANDS[cmd](context);
    } catch (e) {
        console.error(`[ERR] ${cmd} 실패: ${e.message}`);
        process.exit(1);
    } finally {
        await browser.close().catch(() => {});
    }
})();
