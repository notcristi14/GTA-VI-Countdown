'use strict';
/**
 * Deterministic documentation audit for GTA VI Countdown.
 * Compares implemented source facts against README evidence.
 * Does not claim semantic prose review is complete.
 */

const EXPECTED_REGIONS = [
  'new-zealand', 'australia', 'japan-korea', 'asia-pacific', 'indonesia-thailand',
  'india', 'uae', 'saudi-turkey', 'eastern-europe', 'europe', 'uk',
  'south-america', 'bolivia', 'us-canada', 'mexico'
];

const KNOWN_API_ROUTES = [
  '/api/trailers', '/api/music', '/api/repo', '/api/commits',
  '/api/commit', '/api/news', '/api/stats', '/api/backgrounds'
];

const DOC_SPECS = [
  {
    id: 'doc-api-trailers',
    severity: 'high',
    readme: 'README.md',
    section: 'API endpoints / Trailers',
    sourceFiles: ['app.js'],
    kind: 'must-document',
    description: 'GET /api/trailers is registered and must appear in root README',
    implemented: (ctx) => ctx.apis['/api/trailers'] === true,
    documented: (ctx) => /\/api\/trailers/.test(ctx.readmes['README.md'] || ''),
    suggestion: 'Document `/api/trailers` in the root README API table or Trailers section.'
  },
  {
    id: 'doc-api-music',
    severity: 'high',
    readme: 'README.md',
    section: 'API endpoints / Music',
    sourceFiles: ['music-discovery.js'],
    kind: 'must-document',
    description: 'GET /api/music is registered and must appear in root README',
    implemented: (ctx) => ctx.apis['/api/music'] === true,
    documented: (ctx) => /\/api\/music/.test(ctx.readmes['README.md'] || ''),
    suggestion: 'Document `/api/music` in the root README API table or Music section.'
  },
  {
    id: 'doc-api-repo',
    severity: 'high',
    readme: 'README.md',
    section: 'API endpoints / GitHub',
    sourceFiles: ['app.js'],
    kind: 'must-document',
    description: 'GET /api/repo is registered and must appear in root README',
    implemented: (ctx) => ctx.apis['/api/repo'] === true,
    documented: (ctx) => /\/api\/repo/.test(ctx.readmes['README.md'] || ''),
    suggestion: 'Document `/api/repo` in the root README.'
  },
  {
    id: 'doc-api-commits',
    severity: 'medium',
    readme: 'README.md',
    section: 'API endpoints',
    sourceFiles: ['app.js'],
    kind: 'must-document',
    description: 'GET /api/commits is registered and must appear in root README',
    implemented: (ctx) => ctx.apis['/api/commits'] === true,
    documented: (ctx) => /\/api\/commits/.test(ctx.readmes['README.md'] || ''),
    suggestion: 'Document `/api/commits` in the root README API table.'
  },
  {
    id: 'doc-api-commit',
    severity: 'medium',
    readme: 'README.md',
    section: 'API endpoints',
    sourceFiles: ['app.js'],
    kind: 'must-document',
    description: 'GET /api/commit is registered and must appear in root README',
    implemented: (ctx) => ctx.apis['/api/commit'] === true,
    documented: (ctx) => /\/api\/commit(?!s)/.test(ctx.readmes['README.md'] || ''),
    suggestion: 'Document `/api/commit` (latest commit) in the root README API table.'
  },
  {
    id: 'doc-api-news',
    severity: 'medium',
    readme: 'README.md',
    section: 'News & analytics',
    sourceFiles: ['app.js'],
    kind: 'must-document',
    description: 'GET /api/news is registered and must appear in root README',
    implemented: (ctx) => ctx.apis['/api/news'] === true,
    documented: (ctx) => /\/api\/news/.test(ctx.readmes['README.md'] || ''),
    suggestion: 'Document `/api/news` in the root README.'
  },
  {
    id: 'doc-api-stats',
    severity: 'medium',
    readme: 'README.md',
    section: 'News & analytics',
    sourceFiles: ['app.js'],
    kind: 'must-document',
    description: 'GET /api/stats is registered and must appear in root README',
    implemented: (ctx) => ctx.apis['/api/stats'] === true,
    documented: (ctx) => /\/api\/stats/.test(ctx.readmes['README.md'] || ''),
    suggestion: 'Document `/api/stats` in the root README.'
  },
  {
    id: 'doc-api-backgrounds',
    severity: 'high',
    readme: 'README.md',
    section: 'Backgrounds / API endpoints',
    sourceFiles: ['backgrounds-api.js'],
    kind: 'must-document',
    description: 'GET /api/backgrounds is registered and must appear in root README',
    implemented: (ctx) => ctx.apis['/api/backgrounds'] === true,
    documented: (ctx) => /\/api\/backgrounds/.test(ctx.readmes['README.md'] || ''),
    suggestion: 'Document `/api/backgrounds` in the root README API table and Backgrounds section.'
  },
  {
    id: 'doc-env-github-token',
    severity: 'high',
    readme: 'README.md',
    section: 'Environment (Render)',
    sourceFiles: ['app.js', 'github-api.js'],
    kind: 'must-document',
    description: 'Server uses GITHUB_TOKEN / GH_TOKEN; root README must document it',
    implemented: (ctx) => /GITHUB_TOKEN|GH_TOKEN/.test(ctx.sourceText || ''),
    documented: (ctx) => /GITHUB_TOKEN|GH_TOKEN/.test(ctx.readmes['README.md'] || ''),
    suggestion: 'Document `GITHUB_TOKEN` (or `GH_TOKEN`) under Environment (Render) in the root README.'
  },
  {
    id: 'doc-env-ga4',
    severity: 'medium',
    readme: 'README.md',
    section: 'Environment (Render)',
    sourceFiles: ['app.js'],
    kind: 'must-document',
    description: 'GA4 env vars are read in app.js and should be documented',
    implemented: (ctx) =>
      /GA_PROPERTY_ID/.test(ctx.sourceText || '') &&
      /GA_CLIENT_EMAIL/.test(ctx.sourceText || '') &&
      /GA_PRIVATE_KEY/.test(ctx.sourceText || ''),
    documented: (ctx) => {
      const r = ctx.readmes['README.md'] || '';
      return /GA_PROPERTY_ID/.test(r) && /GA_CLIENT_EMAIL/.test(r) && /GA_PRIVATE_KEY/.test(r);
    },
    suggestion: 'Document `GA_PROPERTY_ID`, `GA_CLIENT_EMAIL`, and `GA_PRIVATE_KEY` in the root README environment section.'
  },
  {
    id: 'doc-regions-count',
    severity: 'high',
    readme: 'README.md',
    section: 'Countdown & regions',
    sourceFiles: ['gta-vi-countdown.html'],
    kind: 'must-document',
    description: 'All 15 region slugs must be listed in the root README',
    implemented: (ctx) => ctx.regionsImplemented === 15,
    documented: (ctx) => {
      const r = ctx.readmes['README.md'] || '';
      return EXPECTED_REGIONS.every((slug) => r.includes(slug));
    },
    suggestion: 'Ensure the root README region table lists all 15 region slugs from gta-vi-countdown.html.'
  },
  {
    id: 'doc-mobile-home-root',
    severity: 'high',
    readme: 'mobile/README.md',
    section: 'Home URL',
    sourceFiles: [
      'mobile/android/app/src/main/kotlin/com/notcristi/vicountdown/MainActivity.kt',
      'mobile/ios/VICountdown/ViewController.swift'
    ],
    kind: 'value-match',
    description: 'Mobile README home URL must match intended site root (not /eastern-europe as app home)',
    implemented: (ctx) => ctx.androidHomeOk === true && ctx.iosHomeOk === true,
    documented: (ctx) => {
      const r = ctx.readmes['mobile/README.md'] || '';
      if (/Home URL:.*eastern-europe/i.test(r)) return false;
      if (/onrender\.com\/eastern-europe/.test(r) && /Home URL/i.test(r)) return false;
      return /https:\/\/gta-vi-countdown\.onrender\.com\/?/.test(r);
    },
    suggestion: 'Set mobile README Home URL to https://gta-vi-countdown.onrender.com/ (site root).'
  },
  {
    id: 'doc-mobile-gradle-87',
    severity: 'medium',
    readme: 'mobile/README.md',
    section: 'Android / Gradle',
    sourceFiles: ['mobile/android/gradle/wrapper/gradle-wrapper.properties'],
    kind: 'must-document',
    description: 'Gradle 8.7 must be documented when wrapper uses 8.7',
    implemented: (ctx) => ctx.gradleVer === '8.7',
    documented: (ctx) => /8\.7/.test(ctx.readmes['mobile/README.md'] || ''),
    suggestion: 'Document Gradle **8.7** in mobile/README.md to match gradle-wrapper.properties.'
  },
  {
    id: 'doc-mobile-no-flutter',
    severity: 'high',
    readme: 'mobile/README.md',
    section: 'Platform stack',
    sourceFiles: ['mobile/android/settings.gradle', 'mobile/android/app/build.gradle'],
    kind: 'must-not-claim',
    description: 'Mobile/root docs must not claim Flutter when project is pure native WebView',
    implemented: (ctx) => ctx.pureAndroid === true,
    documented: (ctx) => {
      const r = (ctx.readmes['mobile/README.md'] || '') + '\n' + (ctx.readmes['README.md'] || '');
      const hand = r.replace(/<!-- AUTO-GENERATED:[\s\S]*?<!-- END AUTO-GENERATED[^>]*-->/g, '');
      return !/\bFlutter\b/.test(hand);
    },
    suggestion: 'Remove Flutter references from mobile and root README; apps are native WebView shells.'
  },
  {
    id: 'doc-launcher-home-ee',
    severity: 'high',
    readme: 'launcher/README.md',
    section: 'Home URL',
    sourceFiles: ['launcher/src/AppWindow.cpp'],
    kind: 'value-match',
    description: 'Launcher README home URL must match AppWindow.cpp eastern-europe URL',
    implemented: (ctx) => /onrender\.com\/eastern-europe/.test(ctx.sourceText || ''),
    documented: (ctx) => /onrender\.com\/eastern-europe/.test(ctx.readmes['launcher/README.md'] || ''),
    suggestion: 'Document launcher home as https://gta-vi-countdown.onrender.com/eastern-europe.'
  },
  {
    id: 'doc-launcher-ico',
    severity: 'medium',
    readme: 'launcher/assets/README.md',
    section: 'GtaLogo.ico',
    sourceFiles: ['launcher/assets/GtaLogo.ico'],
    kind: 'must-document',
    description: 'GtaLogo.ico role must be documented when the icon file exists',
    implemented: (ctx) => ctx.launcherIco === true,
    documented: (ctx) => /GtaLogo\.ico/.test(ctx.readmes['launcher/assets/README.md'] || ''),
    suggestion: 'Document `GtaLogo.ico` in launcher/assets/README.md.'
  },
  {
    id: 'doc-launcher-webview2',
    severity: 'medium',
    readme: 'launcher/README.md',
    section: 'Features / Requirements',
    sourceFiles: ['launcher/src/AppWindow.cpp'],
    kind: 'must-document',
    description: 'WebView2 usage must be documented in launcher README',
    implemented: (ctx) => ctx.launcherWebView2 === true,
    documented: (ctx) => /WebView2/i.test(ctx.readmes['launcher/README.md'] || ''),
    suggestion: 'Mention WebView2 in launcher/README.md features or requirements.'
  },
  {
    id: 'doc-root-structure-backgrounds-api',
    severity: 'medium',
    readme: 'README.md',
    section: 'Structure',
    sourceFiles: ['backgrounds-api.js'],
    kind: 'must-document',
    description: 'backgrounds-api.js exists and should appear in root Structure section',
    implemented: (ctx) => ctx.hasBackgroundsApi === true,
    documented: (ctx) => /backgrounds-api\.js/.test(ctx.readmes['README.md'] || ''),
    suggestion: 'List `backgrounds-api.js` in the root README Structure tree.'
  },
  {
    id: 'doc-root-bgs-count-not-inflated',
    severity: 'low',
    readme: 'README.md',
    section: 'Background gallery',
    sourceFiles: ['bgs/'],
    kind: 'value-match',
    description: 'If README states an exact image file count, it must match disk',
    implemented: (ctx) => (ctx.bgsCount || 0) > 0,
    documented: (ctx) => {
      const r = ctx.readmes['README.md'] || '';
      const m = r.match(/\*\*(\d+)\s+image files\*\*/i) || r.match(/(\d+)\s+image files on disk/i);
      if (!m) return true;
      return Number(m[1]) === ctx.bgsCount;
    },
    suggestion: (ctx) =>
      'Update the background image file count in the root README to match bgs/ on disk (' +
      ctx.bgsCount +
      ' files).'
  },
  {
    id: 'doc-mobile-gradlew',
    severity: 'medium',
    readme: 'mobile/README.md',
    section: 'Build APK',
    sourceFiles: ['mobile/android/gradlew', 'mobile/android/gradlew.bat'],
    kind: 'must-document',
    description: 'gradlew / gradlew.bat build commands should be documented',
    implemented: (ctx) => ctx.hasGradlew === true,
    documented: (ctx) => {
      const r = ctx.readmes['mobile/README.md'] || '';
      return /gradlew(\.bat)?/i.test(r) && /assemble/i.test(r);
    },
    suggestion: 'Document `./gradlew assembleRelease` / `gradlew.bat assembleRelease` in mobile/README.md.'
  },
  {
    id: 'doc-workflow-integrity',
    severity: 'low',
    readme: 'README.md',
    section: 'Structure / automation',
    sourceFiles: ['.github/workflows/readme-integrity.yml'],
    kind: 'must-document',
    description: 'readme-integrity workflow exists; root structure may list it',
    implemented: (ctx) => ctx.hasIntegrityWorkflow === true,
    documented: (ctx) => /readme-integrity\.yml/.test(ctx.readmes['README.md'] || ''),
    suggestion: 'List `readme-integrity.yml` under .github/workflows in the root README Structure section.'
  }
];

function auditDocumentedApis(ctx) {
  const findings = [];
  for (const [file, text] of Object.entries(ctx.readmes || {})) {
    if (!text) continue;
    // Ignore machine-generated integrity sections so findings listed there do not become ghost-API noise.
    const hand = String(text).replace(/<!-- AUTO-GENERATED:[\s\S]*?<!-- END AUTO-GENERATED[^>]*-->/g, '');
    const re = /\/api\/[a-z0-9-]+/gi;
    let m;
    const seen = new Set();
    while ((m = re.exec(hand)) !== null) {
      const api = m[0].toLowerCase();
      if (seen.has(api)) continue;
      seen.add(api);
      if (KNOWN_API_ROUTES.includes(api)) continue;
      if (ctx.apis && ctx.apis[api] === true) continue;
      findings.push({
        id: 'doc-ghost-api-' + api.replace(/\W/g, ''),
        severity: 'high',
        documentationFile: file,
        section: 'API documentation',
        sourceFile: 'app.js / music-discovery.js / backgrounds-api.js',
        problem:
          'README documents `' +
          api +
          '` but no matching app.get route was found in backend source.',
        suggestedCorrection:
          'Remove `' + api + '` from ' + file + ' or implement the route in the server.',
        kind: 'outdated',
        deterministic: true
      });
    }
  }
  return findings;
}

function runDocumentationAudit(ctx) {
  const findings = [];
  for (const spec of DOC_SPECS) {
    const impl = !!spec.implemented(ctx);
    const doc = !!spec.documented(ctx);
    const suggestion =
      typeof spec.suggestion === 'function' ? spec.suggestion(ctx) : spec.suggestion;

    if (spec.kind === 'must-document') {
      if (impl && !doc) {
        findings.push({
          id: spec.id,
          severity: spec.severity,
          documentationFile: spec.readme,
          section: spec.section,
          sourceFile: (spec.sourceFiles || []).join(', '),
          problem:
            spec.description +
            ' — implemented in source but missing or incomplete in documentation.',
          suggestedCorrection: suggestion,
          kind: 'missing',
          deterministic: true
        });
      }
    } else if (spec.kind === 'must-not-claim') {
      if (impl && !doc) {
        findings.push({
          id: spec.id,
          severity: spec.severity,
          documentationFile: spec.readme,
          section: spec.section,
          sourceFile: (spec.sourceFiles || []).join(', '),
          problem:
            spec.description +
            ' — documentation still claims removed or incorrect stack/feature.',
          suggestedCorrection: suggestion,
          kind: 'outdated',
          deterministic: true
        });
      }
    } else if (spec.kind === 'value-match') {
      if (impl && !doc) {
        findings.push({
          id: spec.id,
          severity: spec.severity,
          documentationFile: spec.readme,
          section: spec.section,
          sourceFile: (spec.sourceFiles || []).join(', '),
          problem: spec.description + ' — documentation value does not match source.',
          suggestedCorrection: suggestion,
          kind: 'outdated',
          deterministic: true
        });
      }
    }
  }
  findings.push(...auditDocumentedApis(ctx));
  const seen = new Set();
  return findings.filter((f) => {
    const k = f.id + '|' + f.documentationFile;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function formatDocFindingsMarkdown(findings) {
  if (!findings.length) {
    return (
      '\n### Documentation audit\n\n' +
      'No missing or outdated documentation findings from deterministic DOC_SPECS / API registration comparison.\n'
    );
  }
  let md =
    '\n### Documentation audit (' +
    findings.length +
    ' finding' +
    (findings.length === 1 ? '' : 's') +
    ')\n\n' +
    '| ID | Severity | README | Problem | Suggested correction |\n' +
    '|----|----------|--------|---------|----------------------|\n';
  for (const f of findings) {
    md +=
      '| `' +
      f.id +
      '` | ' +
      f.severity +
      ' | ' +
      f.documentationFile +
      ' | ' +
      String(f.problem).replace(/\|/g, '/') +
      ' | ' +
      String(f.suggestedCorrection).replace(/\|/g, '/') +
      ' |\n';
  }
  return md;
}

module.exports = {
  DOC_SPECS,
  KNOWN_API_ROUTES,
  EXPECTED_REGIONS,
  runDocumentationAudit,
  auditDocumentedApis,
  formatDocFindingsMarkdown
};
