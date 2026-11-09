// Load Playwright from this PC's deps folder, not from the skill folder.
// Tools write:  const { chromium } = require('./lib/pw');  (from scripts/)
//
// Deps folder: $USE_BROWSER_DEPS, else ~/.local/share/use-browser/browser — installed by ensure-deps.js.
'use strict';
const os = require('os');
const path = require('path');
const { createRequire } = require('module');

const depsDir = process.env.USE_BROWSER_DEPS || path.join(os.homedir(), '.local', 'share', 'use-browser', 'browser');

try {
  module.exports = createRequire(path.join(depsDir, 'package.json'))('playwright-core');
} catch (e) {
  const err = new Error(
    `playwright-core not found (${depsDir}). Run first: node ${path.join(__dirname, '..', 'ensure-deps.js')}`);
  err.code = 'USE_BROWSER_DEPS_MISSING';
  throw err;
}
