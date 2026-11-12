'use strict';

const crypto = require('crypto');

const EXPECTED_RELEASES = [
  { platform: 'Windows x64', tag: 'desktop-v1.0.0', asset: 'GTA-VI-Countdown-Windows-x64.zip', contentType: 'application/zip' },
  { platform: 'iOS', tag: 'ios-v1.0.0', asset: 'gta-countdown.ipa', contentType: 'application/octet-stream' },
  { platform: 'Android', tag: 'android-v1.0.0', asset: 'app-debug.apk', contentType: 'application/vnd.android.package-archive' }
];

const MAX_DOWNLOAD_BYTES = 100 * 1024 * 1024;
const API_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'GTA-VI-Countdown-Release-Integrity'
};

function makeCheck(checks, id, claim, ok, detail, critical = true) {
  checks.push({ id, claim, ok: !!ok, detail: String(detail), critical: !!critical });
}

async function auditReleases(options = {}) {
  const repository = options.repository || process.env.GITHUB_REPOSITORY || 'notcristi14/GTA-VI-Countdown';
  const token = options.token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
  const fetchImpl = options.fetchImpl || global.fetch;
  const expected = options.expectedReleases || EXPECTED_RELEASES;
  const maxDownloadBytes = options.maxDownloadBytes || MAX_DOWNLOAD_BYTES;
  const checks = [];
  const errors = [];
  const releasesReport = [];

  if (typeof fetchImpl !== 'function') {
    throw new Error('A fetch implementation is required for the GitHub Releases audit.');
  }

  const headers = { ...API_HEADERS };
  if (token) headers.Authorization = 'Bearer ' + token;

  async function fetchJson(url) {
    const response = await fetchImpl(url, { headers });
    if (!response || !response.ok) {
      throw new Error('GitHub API request failed (' + (response ? response.status : 'no response') + '): ' + url);
    }
    return response.json();
  }

  async function fetchAllReleases() {
    const all = [];
    let url = 'https://api.github.com/repos/' + repository + '/releases?per_page=100&page=1';
    let pages = 0;
    while (url && pages < 10) {
      const response = await fetchImpl(url, { headers });
      if (!response || !response.ok) {
        throw new Error('GitHub Releases API failed (' + (response ? response.status : 'no response') + ')');
      }
      const page = await response.json();
      if (!Array.isArray(page)) throw new Error('GitHub Releases API returned a non-array response.');
      all.push(...page);
      const link = response.headers && response.headers.get ? response.headers.get('link') : null;
      const next = link && link.match(/<([^>]+)>;\s*rel="next"/i);
      url = next ? next[1] : null;
      pages++;
    }
    if (url) throw new Error('Release pagination exceeded the 10-page safety limit.');
    return all;
  }

  async function verifyAsset(asset, release) {
    const result = {
      name: asset.name || '',
      size: Number(asset.size || 0),
      state: asset.state || '',
      contentType: asset.content_type || '',
      digest: asset.digest || null,
      downloadUrl: asset.browser_download_url || '',
      bytesVerified: false,
      actualSha256: null
    };
    const prefix = 'release-' + String(release.tag_name || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_') + '-asset-' + String(asset.name || 'unnamed').replace(/[^a-zA-Z0-9_.-]/g, '_');
    makeCheck(checks, prefix + '-uploaded', 'Release asset ' + result.name + ' is uploaded', result.state === 'uploaded', 'state=' + result.state);
    makeCheck(checks, prefix + '-size', 'Release asset ' + result.name + ' has a non-zero size', Number.isFinite(result.size) && result.size > 0, result.size + ' bytes');
    const digestMatch = typeof result.digest === 'string' && /^sha256:[a-f0-9]{64}$/i.test(result.digest);
    makeCheck(checks, prefix + '-digest', 'Release asset ' + result.name + ' exposes a SHA-256 digest', digestMatch, result.digest || 'missing/invalid digest');

    try {
      const url = new URL(result.downloadUrl);
      const expectedPrefix = 'https://github.com/' + repository + '/releases/download/';
      const safeUrl = url.protocol === 'https:' && url.hostname === 'github.com' && result.downloadUrl.startsWith(expectedPrefix);
      makeCheck(checks, prefix + '-url', 'Release asset ' + result.name + ' has a valid GitHub download URL', safeUrl, result.downloadUrl || 'missing URL');
      if (!safeUrl) return result;
    } catch (_) {
      makeCheck(checks, prefix + '-url', 'Release asset ' + result.name + ' has a valid GitHub download URL', false, result.downloadUrl || 'missing/invalid URL');
      return result;
    }

    if (!digestMatch) return result;
    if (result.size > maxDownloadBytes) {
      makeCheck(checks, prefix + '-bytes', 'Release asset ' + result.name + ' bytes match the published digest', true, 'not downloaded: exceeds ' + maxDownloadBytes + '-byte safety limit; GitHub digest metadata checked', false);
      return result;
    }

    try {
      const response = await fetchImpl(result.downloadUrl, {
        headers: { 'User-Agent': API_HEADERS['User-Agent'] },
        redirect: 'follow'
      });
      if (!response || !response.ok) throw new Error('download HTTP ' + (response ? response.status : 'no response'));
      const bytes = Buffer.from(await response.arrayBuffer());
      const actual = 'sha256:' + crypto.createHash('sha256').update(bytes).digest('hex');
      result.actualSha256 = actual;
      result.bytesVerified = true;
      const sizeOk = bytes.length === result.size;
      const digestOk = actual.toLowerCase() === result.digest.toLowerCase();
      makeCheck(checks, prefix + '-bytes', 'Downloaded bytes for ' + result.name + ' match GitHub size and SHA-256', sizeOk && digestOk, 'downloaded=' + bytes.length + ' bytes; API size=' + result.size + '; digest=' + (digestOk ? 'MATCH' : 'MISMATCH'));
    } catch (error) {
      errors.push({ release: release.tag_name, asset: result.name, error: error.message });
      makeCheck(checks, prefix + '-bytes', 'Downloaded bytes for ' + result.name + ' match GitHub size and SHA-256', false, 'verification failed: ' + error.message);
    }
    return result;
  }

  try {
    const releases = await fetchAllReleases();
    const published = releases.filter((r) => !r.draft);
    const byTag = new Map(releases.map((r) => [r.tag_name, r]));

    makeCheck(checks, 'releases-api', 'GitHub Releases API returned a valid release collection', true, releases.length + ' release(s) retrieved');
    makeCheck(checks, 'releases-published-count', 'At least one published GitHub Release exists', published.length > 0, published.length + ' published release(s)');

    for (const release of published) {
      const tag = String(release.tag_name || '');
      const releaseEntry = {
        tag,
        name: release.name || tag,
        platform: (expected.find((x) => x.tag === tag) || {}).platform || 'Unmapped release',
        draft: !!release.draft,
        prerelease: !!release.prerelease,
        publishedAt: release.published_at || null,
        htmlUrl: release.html_url || '',
        tagRef: null,
        assets: []
      };
      const safeTag = tag.replace(/[^a-zA-Z0-9_-]/g, '_');
      const publishedOk = !release.draft && !!release.published_at && !Number.isNaN(Date.parse(release.published_at));
      makeCheck(checks, 'release-' + safeTag + '-published', 'Release ' + tag + ' is published (not a draft)', publishedOk, 'draft=' + !!release.draft + '; prerelease=' + !!release.prerelease + '; published_at=' + (release.published_at || 'missing'));

      try {
        const ref = await fetchJson('https://api.github.com/repos/' + repository + '/git/ref/tags/' + encodeURIComponent(tag));
        const refOk = !!(ref && ref.ref === 'refs/tags/' + tag && ref.object && /^[a-f0-9]{40}$/i.test(ref.object.sha || ''));
        releaseEntry.tagRef = ref && ref.object ? { type: ref.object.type || '', sha: ref.object.sha || '' } : null;
        makeCheck(checks, 'release-' + safeTag + '-tag', 'Release ' + tag + ' points to an existing Git tag', refOk, refOk ? 'tag ref resolves to ' + ref.object.type + ' ' + ref.object.sha : 'tag ref missing or malformed');
      } catch (error) {
        errors.push({ release: tag, error: error.message });
        makeCheck(checks, 'release-' + safeTag + '-tag', 'Release ' + tag + ' points to an existing Git tag', false, error.message);
      }

      const assets = Array.isArray(release.assets) ? release.assets : [];
      for (const asset of assets) {
        const checked = await verifyAsset(asset, release);
        releaseEntry.assets.push(checked);
      }
      makeCheck(checks, 'release-' + safeTag + '-assets', 'Release ' + tag + ' contains at least one downloadable asset', assets.length > 0, assets.length + ' asset(s)');
      releasesReport.push(releaseEntry);
    }

    for (const spec of expected) {
      const release = byTag.get(spec.tag);
      const safeTag = spec.tag.replace(/[^a-zA-Z0-9_-]/g, '_');
      makeCheck(checks, 'expected-' + safeTag, 'Expected ' + spec.platform + ' release ' + spec.tag + ' exists', !!release, release ? 'found' : 'MISSING');
      if (!release) continue;
      const asset = (release.assets || []).find((a) => a.name === spec.asset);
      makeCheck(checks, 'expected-' + safeTag + '-asset', spec.platform + ' release contains ' + spec.asset, !!asset, asset ? 'present' : 'MISSING');
      if (asset) {
        makeCheck(checks, 'expected-' + safeTag + '-type', spec.platform + ' asset has expected content type', asset.content_type === spec.contentType, 'actual=' + (asset.content_type || 'missing') + '; expected=' + spec.contentType);
      }
      const expectedStateOk = !release.draft && !release.prerelease && !!release.published_at && !Number.isNaN(Date.parse(release.published_at));
      makeCheck(checks, 'expected-' + safeTag + '-release-state', spec.platform + ' stable release is publicly published', expectedStateOk, 'draft=' + !!release.draft + '; prerelease=' + !!release.prerelease + '; published_at=' + (release.published_at || 'missing'));
    }
  } catch (error) {
    errors.push({ error: error.message });
    makeCheck(checks, 'releases-api-available', 'GitHub Releases and asset metadata are reachable', false, error.message);
  }

  const passed = checks.filter((c) => c.ok).length;
  const failed = checks.filter((c) => !c.ok);
  const criticalFailed = failed.filter((c) => c.critical);
  const report = {
    repository,
    checkedAt: new Date().toISOString(),
    status: criticalFailed.length ? 'failure' : failed.length ? 'warning' : 'success',
    releaseCount: releasesReport.length,
    expectedReleaseCount: expected.length,
    summary: { total: checks.length, passed, failed: failed.length, criticalFailed: criticalFailed.length },
    releases: releasesReport,
    errors,
    checks
  };
  return report;
}

module.exports = { EXPECTED_RELEASES, auditReleases };
