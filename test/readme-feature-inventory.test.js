'use strict';
const assert = require('assert');
const { scopeForReadme, buildFeatureInventoryMarkdown } = require('../scripts/readme-feature-inventory');

const checks = [
  { id: 'regions-count', claim: 'All 15 regions configured', ok: true, detail: '15/15 implemented' },
  { id: 'android-webview', claim: 'Android uses WebView', ok: true, detail: 'MainActivity.kt' },
  { id: 'ios-webview', claim: 'iOS uses WKWebView', ok: false, detail: 'missing' },
  { id: 'launcher-webview2', claim: 'Launcher uses WebView2', ok: true, detail: 'AppWindow.cpp' },
  { id: 'launcher-ico', claim: 'Launcher icon exists', ok: true, detail: 'present' }
];

assert.strictEqual(scopeForReadme('README.md'), 'root');
assert.strictEqual(scopeForReadme('mobile/README.md'), 'mobile');
assert.strictEqual(scopeForReadme('launcher/README.md'), 'launcher');
assert.strictEqual(scopeForReadme('launcher/assets/README.md'), 'assets');
assert.strictEqual(scopeForReadme('new-area/README.md'), 'root');

const root = buildFeatureInventoryMarkdown('README.md', checks);
assert.match(root, /All 15 regions configured/);
assert.match(root, /Android uses WebView/);
assert.match(root, /Launcher uses WebView2/);

const mobile = buildFeatureInventoryMarkdown('mobile/README.md', checks);
assert.match(mobile, /Android uses WebView/);
assert.match(mobile, /iOS uses WKWebView/);
assert.match(mobile, /\*\*FAIL\*\*/);
assert.doesNotMatch(mobile, /All 15 regions configured/);

const launcher = buildFeatureInventoryMarkdown('launcher/README.md', checks);
assert.match(launcher, /Launcher uses WebView2/);
assert.doesNotMatch(launcher, /Android uses WebView/);

const assets = buildFeatureInventoryMarkdown('launcher/assets/README.md', checks);
assert.match(assets, /Launcher icon exists/);
assert.doesNotMatch(assets, /Launcher uses WebView2/);

console.log('README feature inventory tests: 5 assertions passed.');
