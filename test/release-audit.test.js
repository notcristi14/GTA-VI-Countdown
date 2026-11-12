'use strict';
const assert = require('assert');
const { auditReleases, EXPECTED_RELEASES } = require('../scripts/release-audit');

let passed = 0;
let failed = 0;
function test(name, fn) {
  return Promise.resolve().then(fn).then(() => { passed++; console.log('PASS', name); }).catch((error) => { failed++; console.error('FAIL', name); console.error(' ', error.stack || error); });
}
function response(data, status = 200, headers = {}) {
  return { ok: status >= 200 && status < 300, status, headers: { get: (name) => headers[name.toLowerCase()] || null }, json: async () => data, arrayBuffer: async () => Buffer.from(data) };
}
function fixtures() {
  return EXPECTED_RELEASES.map((spec, index) => {
    const bytes = Buffer.from('release-asset-' + spec.tag);
    const crypto = require('crypto');
    return {
      id: index + 1, tag_name: spec.tag, name: spec.platform + ' v1.0.0',
      draft: false, prerelease: false, published_at: '2026-11-12T12:00:00Z',
      html_url: 'https://github.com/notcristi14/GTA-VI-Countdown/releases/tag/' + spec.tag,
      assets: [{
        name: spec.asset, state: 'uploaded', size: bytes.length, content_type: spec.contentType,
        digest: 'sha256:' + crypto.createHash('sha256').update(bytes).digest('hex'),
        browser_download_url: 'https://github.com/notcristi14/GTA-VI-Countdown/releases/download/' + spec.tag + '/' + encodeURIComponent(spec.asset),
        _bytes: bytes
      }]
    };
  });
}
function mockFetch(releases, overrides = {}) {
  return async (url) => {
    if (url.includes('/releases?')) return response(releases);
    if (url.includes('/git/ref/tags/')) {
      const tag = decodeURIComponent(url.split('/').pop());
      if (overrides.missingTag === tag) return response({}, 404);
      return response({ ref: 'refs/tags/' + tag, object: { type: 'commit', sha: 'a'.repeat(40) } });
    }
    const asset = releases.flatMap((r) => r.assets || []).find((a) => a.browser_download_url === url);
    if (!asset) return response({}, 404);
    return response(overrides.badBytes === asset.name ? Buffer.from('tampered') : asset._bytes);
  };
}
async function main() {
  await test('all expected platform releases and binary digests pass', async () => {
    const report = await auditReleases({ fetchImpl: mockFetch(fixtures()) });
    assert.strictEqual(report.status, 'success');
    assert.strictEqual(report.summary.failed, 0);
    assert.strictEqual(report.releases.length, 3);
    assert.ok(report.releases.every((r) => r.assets[0].bytesVerified));
  });
  await test('missing expected release fails integrity', async () => {
    const report = await auditReleases({ fetchImpl: mockFetch(fixtures().slice(1)) });
    assert.ok(report.summary.criticalFailed > 0);
    assert.ok(report.checks.some((c) => c.id === 'expected-desktop-v1_0_0' && !c.ok));
  });
  await test('missing required release asset fails integrity', async () => {
    const releases = fixtures();
    releases[0].assets = [];
    const report = await auditReleases({ fetchImpl: mockFetch(releases) });
    assert.ok(report.checks.some((c) => c.id === 'expected-desktop-v1_0_0-asset' && !c.ok));
  });
  await test('tampered downloaded bytes fail SHA-256 verification', async () => {
    const releases = fixtures();
    const report = await auditReleases({ fetchImpl: mockFetch(releases, { badBytes: releases[0].assets[0].name }) });
    assert.ok(report.checks.some((c) => c.id.includes('-bytes') && !c.ok));
    assert.ok(report.summary.criticalFailed > 0);
  });
  await test('missing Git tag fails integrity', async () => {
    const releases = fixtures();
    const report = await auditReleases({ fetchImpl: mockFetch(releases, { missingTag: releases[1].tag_name }) });
    assert.ok(report.checks.some((c) => c.id === 'release-ios-v1_0_0-tag' && !c.ok));
  });
  await test('wrong asset content type fails expected platform validation', async () => {
    const releases = fixtures();
    releases[2].assets[0].content_type = 'application/zip';
    const report = await auditReleases({ fetchImpl: mockFetch(releases) });
    assert.ok(report.checks.some((c) => c.id === 'expected-android-v1_0_0-type' && !c.ok));
  });
  await test('API outage is reported as a critical audit failure', async () => {
    const report = await auditReleases({ fetchImpl: async () => response({}, 503) });
    assert.strictEqual(report.status, 'failure');
    assert.ok(report.summary.criticalFailed > 0);
  });
  console.log('Release audit tests: ' + passed + ' passed, ' + failed + ' failed.');
  if (failed) process.exit(1);
}
main().catch((error) => { console.error(error); process.exit(1); });
