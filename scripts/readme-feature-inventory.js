'use strict';

/**
 * Builds a source-verified feature snapshot for each discovered README.
 * The inventory is generated from integrity checks, never from hand-maintained
 * feature prose. New README files are included automatically by the caller.
 */
const GROUPS = {
  root: [
    { title: 'Website · countdown and regions', ids: ['regions-count','default-europe','region-persist','digit-reels','available-now','preorder'] },
    { title: 'Website · media, APIs and backgrounds', ids: ['music-files','music-center','music-discovery','music-cache','trailers-cache','bgs-job','bgs-disk','pwa-manifest','no-service-worker','api-apitrailers','api-apimusic','api-apirepo','api-apicommits','api-apicommit','api-apinews','api-apistats','api-apibackgrounds'] },
    { title: 'Native mobile apps', ids: ['android-home-url','android-webview','android-loadurl','android-external','android-host','android-pure-gradle','android-gradle-ver','ios-home-url','ios-webview','ios-load','ios-external','ios-host','ios-icon'] },
    { title: 'Windows desktop launcher', ids: ['launcher-sln','launcher-webview2','launcher-nav','launcher-ico'] }
  ],
  mobile: [
    { title: 'Android', ids: ['android-home-url','android-webview','android-loadurl','android-external','android-host','android-pure-gradle','android-gradle-ver'] },
    { title: 'iOS', ids: ['ios-home-url','ios-webview','ios-load','ios-external','ios-host','ios-icon'] }
  ],
  launcher: [
    { title: 'Windows desktop launcher', ids: ['launcher-sln','launcher-webview2','launcher-nav','launcher-ico'] }
  ],
  assets: [
    { title: 'Launcher assets', ids: ['launcher-ico'] }
  ]
};

function scopeForReadme(readmePath) {
  if (readmePath === 'README.md') return 'root';
  if (readmePath.startsWith('mobile/')) return 'mobile';
  if (readmePath.startsWith('launcher/assets/')) return 'assets';
  if (readmePath.startsWith('launcher/')) return 'launcher';
  return 'root';
}

function buildFeatureInventoryMarkdown(readmePath, checks) {
  const scope = scopeForReadme(String(readmePath || 'README.md'));
  const checkMap = new Map((Array.isArray(checks) ? checks : []).map((item) => [item.id, item]));
  const groups = GROUPS[scope] || GROUPS.root;
  const sections = [];
  for (const group of groups) {
    const rows = group.ids.map((id) => checkMap.get(id)).filter(Boolean);
    if (!rows.length) continue;
    sections.push('#### ' + group.title + '\n\n' + rows.map((item) =>
      '- **' + (item.ok ? 'PASS' : 'FAIL') + '** — ' + item.claim + ' (' + item.detail.replace(/[\\r\\n|]/g, ' ').trim() + ')'
    ).join('\n'));
  }
  return '### Source-verified feature inventory\n\n' +
    '_Generated from the current source tree and integrity checks; this section refreshes automatically in every discovered README._\n\n' +
    (sections.length ? sections.join('\n\n') : '_No scoped feature checks are currently defined._');
}

module.exports = { GROUPS, scopeForReadme, buildFeatureInventoryMarkdown };
