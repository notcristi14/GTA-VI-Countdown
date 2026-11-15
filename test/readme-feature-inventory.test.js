'use strict';
const assert = require('assert');
const { scopeForReadme, buildFeatureInventoryMarkdown } = require('../scripts/readme-feature-inventory');

const checks = [
  { id: 'regions-count', claim: 'All 15 regions configured', ok: true, detail: '15/15 implemented' },
  { id: 'github-latest-commit', claim: 'Latest GitHub commit card', ok: true, detail: '60s refresh' },
  { id: 'github-commit-history', claim: 'GitHub commit history', ok: true, detail: 'up to 15 commits' },
  { id: 'github-repo-stats', claim: 'Live GitHub repository statistics', ok: true, detail: '60s refresh' },
  { id: 'newswire-ui', claim: 'Rockstar Newswire panel', ok: true, detail: 'show/hide' },
  { id: 'background-controls', claim: 'Background gallery controls', ok: true, detail: 'manual/reset/auto' },
  { id: 'fps-toggle', claim: 'FPS counter', ok: true, detail: 'persistent toggle' },
  { id: 'android-webview', claim: 'Android uses WebView', ok: true, detail: 'MainActivity.kt' },
  { id: 'ios-webview', claim: 'iOS uses WKWebView', ok: false, detail: 'missing' },
  { id: 'launcher-webview2', claim: 'Launcher uses WebView2', ok: true, detail: 'AppWindow.cpp' },
  { id: 'launcher-ico', claim: 'Launcher icon exists', ok: true, detail: 'present' },\n  { id: 'auto-test-feature', claim: 'Automatically discovered feature', ok: true, detail: 'source: src/example.js:1', autoDiscovered: true, group: 'Newly discovered features', scopes: ['all'] }
];

assert.strictEqual(scopeForReadme('README.md'), 'root');
assert.strictEqual(scopeForReadme('mobile/README.md'), 'mobile');
assert.strictEqual(scopeForReadme('launcher/README.md'), 'launcher');
assert.strictEqual(scopeForReadme('launcher/assets/README.md'), 'assets');
assert.strictEqual(scopeForReadme('new-area/README.md'), 'root');

const root = buildFeatureInventoryMarkdown('README.md', checks);
assert.match(root, /All 15 regions configured/);
assert.match(root, /Latest GitHub commit card/);
assert.match(root, /GitHub commit history/);
assert.match(root, /Live GitHub repository statistics/);
assert.match(root, /Rockstar Newswire panel/);
assert.match(root, /Background gallery controls/);
assert.match(root, /FPS counter/);
assert.match(root, /Android uses WebView/);
assert.match(root, /Launcher uses WebView2/);\nassert.match(root, /Automatically discovered feature/);

const mobile = buildFeatureInventoryMarkdown('mobile/README.md', checks);
assert.match(mobile, /All 15 regions configured/);
assert.match(mobile, /Latest GitHub commit card/);
assert.match(mobile, /Rockstar Newswire panel/);
assert.match(mobile, /Android uses WebView/);
assert.match(mobile, /iOS uses WKWebView/);
assert.match(mobile, /\*\*FAIL\*\*/);

const launcher = buildFeatureInventoryMarkdown('launcher/README.md', checks);
assert.match(launcher, /All 15 regions configured/);
assert.match(launcher, /Latest GitHub commit card/);
assert.match(launcher, /Rockstar Newswire panel/);
assert.match(launcher, /Launcher uses WebView2/);
assert.doesNotMatch(launcher, /Android uses WebView/);\nassert.match(launcher, /Automatically discovered feature/);

const assets = buildFeatureInventoryMarkdown('launcher/assets/README.md', checks);
assert.match(assets, /All 15 regions configured/);
assert.match(assets, /Latest GitHub commit card/);
assert.match(assets, /Rockstar Newswire panel/);
assert.match(assets, /Launcher icon exists/);
assert.doesNotMatch(assets, /Launcher uses WebView2/);\nassert.match(assets, /Automatically discovered feature/);

console.log('README feature inventory tests: shared website features + scoped platform checks passed.');
