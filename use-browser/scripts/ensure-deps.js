#!/usr/bin/env node
// Make sure the pinned browser dependencies are installed in this PC's deps folder.
// node_modules must not live inside the skill folder.
//
//   node ensure-deps.js            check, and install when missing or a different version
//   node ensure-deps.js --check    check only (exit 20 when not ready)
//
// Deps folder: $USE_BROWSER_DEPS, else ~/.local/share/use-browser/browser
//   (Windows: %USERPROFILE%\.local\share\use-browser\browser)
// Versions: deps.json next to this file — the single source of the pinned versions.
//
// Prints one line and exits with:
//   0  DEPS_OK <folder>         already installed at the pinned version
//   0  DEPS_INSTALLED <folder>  installed or replaced just now
//   20 DEPS_MISSING <folder>    --check and not ready
//   21 DEPS_FAILED              npm failed (its last lines follow)
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const depsDir = process.env.USE_BROWSER_DEPS || path.join(os.homedir(), '.local', 'share', 'use-browser', 'browser');
const pinned = JSON.parse(fs.readFileSync(path.join(__dirname, 'deps.json'), 'utf8'));
const checkOnly = process.argv.includes('--check');

function installedVersion(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(depsDir, 'node_modules', name, 'package.json'), 'utf8')).version;
  } catch (e) {
    return null;
  }
}

const wrong = Object.entries(pinned).filter(([name, ver]) => installedVersion(name) !== ver);
if (wrong.length === 0) {
  console.log(`DEPS_OK ${depsDir}`);
  process.exit(0);
}
if (checkOnly) {
  console.log(`DEPS_MISSING ${depsDir} — ${wrong.map(([n, v]) => `${n}@${v}`).join(' ')} (install with: node ${path.basename(__filename)})`);
  process.exit(20);
}

fs.mkdirSync(depsDir, { recursive: true });
const pkg = path.join(depsDir, 'package.json');
if (!fs.existsSync(pkg)) {
  fs.writeFileSync(pkg, JSON.stringify({ name: 'use-browser-deps', private: true }, null, 2) + '\n');
}
const args = ['install', '--prefix', depsDir, '--no-audit', '--no-fund', '--save-exact',
  ...wrong.map(([n, v]) => `${n}@${v}`)];
// Windows: npm is npm.cmd, and Node refuses to run .cmd without a shell (EINVAL since 20.12).
// Passing an argument array together with shell:true is deprecated (DEP0190) because the
// arguments are only concatenated — so build the one command line ourselves and quote
// anything with spaces (e.g. a user folder whose name has a space).
const win = process.platform === 'win32';
const r = win
  ? spawnSync(['npm.cmd', ...args].map(a => (/[\s&()^]/.test(a) ? `"${a}"` : a)).join(' '),
      { encoding: 'utf8', shell: true })
  : spawnSync('npm', args, { encoding: 'utf8' });
if (r.status !== 0) {
  console.log('DEPS_FAILED');
  const tail = `${r.stdout || ''}${r.stderr || ''}`.trim().split('\n').slice(-8).join('\n');
  if (tail) console.log(tail);
  if (r.error) console.log(String(r.error));
  process.exit(21);
}
const still = Object.entries(pinned).filter(([name, ver]) => installedVersion(name) !== ver);
if (still.length) {
  console.log(`DEPS_FAILED — version still does not match after install: ${still.map(([n, v]) => `${n}@${v}`).join(' ')}`);
  process.exit(21);
}
console.log(`DEPS_INSTALLED ${depsDir}`);
