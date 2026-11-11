#!/usr/bin/env node
'use strict';
/**
 * Unit tests for documentation audit (scripts/doc-audit.js).
 * Does not modify the repository; uses in-memory contexts only.
 */
const assert = require('assert');
const {
  DOC_SPECS,
  KNOWN_API_ROUTES,
  runDocumentationAudit,
  auditDocumentedApis
} = require('./doc-audit');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('PASS', name);
  } catch (e) {
    failed++;
    console.error('FAIL', name);
    console.error(' ', e.message);
  }
}

function baseCtx(over = {}) {
  const apis = {};
  for (const r of KNOWN_API_ROUTES) apis[r] = true;
  return {
    apis,
    readmes: {
      'README.md': `
# GTA VI
/api/trailers /api/music /api/repo /api/commits /api/commit /api/news /api/stats /api/backgrounds
GITHUB_TOKEN GH_TOKEN GA_PROPERTY_ID GA_CLIENT_EMAIL GA_PRIVATE_KEY
new-zealand australia japan-korea asia-pacific indonesia-thailand india uae saudi-turkey eastern-europe europe uk south-america bolivia us-canada mexico
backgrounds-api.js
**143 image files** on disk
readme-integrity.yml
`,
      'mobile/README.md': `
Home URL: https://gta-vi-countdown.onrender.com/
Gradle **8.7**
gradlew.bat assembleRelease
./gradlew assembleDebug
Kotlin WebView
`,
      'launcher/README.md': `
Home URL: https://gta-vi-countdown.onrender.com/eastern-europe
WebView2
`,
      'launcher/assets/README.md': 'GtaLogo.ico executable icon'
    },
    sourceText: 'GITHUB_TOKEN GH_TOKEN GA_PROPERTY_ID GA_CLIENT_EMAIL GA_PRIVATE_KEY onrender.com/eastern-europe WebView2',
    regionsImplemented: 15,
    androidHomeOk: true,
    iosHomeOk: true,
    gradleVer: '8.7',
    pureAndroid: true,
    launcherIco: true,
    launcherWebView2: true,
    hasBackgroundsApi: true,
    bgsCount: 143,
    hasGradlew: true,
    hasIntegrityWorkflow: true,
    ...over
  };
}

test('correctly documented features yield empty findings', () => {
  const findings = runDocumentationAudit(baseCtx());
  assert.strictEqual(findings.length, 0, 'expected 0 findings, got ' + JSON.stringify(findings, null, 2));
});

test('missing API documentation is detected', () => {
  const ctx = baseCtx({
    readmes: {
      ...baseCtx().readmes,
      'README.md': 'No API table here. GITHUB_TOKEN GA_PROPERTY_ID GA_CLIENT_EMAIL GA_PRIVATE_KEY\nnew-zealand australia japan-korea asia-pacific indonesia-thailand india uae saudi-turkey eastern-europe europe uk south-america bolivia us-canada mexico\nbackgrounds-api.js\nreadme-integrity.yml\n**143 image files**'
    }
  });
  const findings = runDocumentationAudit(ctx);
  const ids = findings.map((f) => f.id);
  assert.ok(ids.includes('doc-api-trailers'), 'missing trailers');
  assert.ok(ids.includes('doc-api-music'), 'missing music');
  assert.ok(ids.includes('doc-api-backgrounds'), 'missing backgrounds');
  assert.ok(findings.every((f) => f.deterministic === true));
});

test('outdated mobile home (eastern-europe) is detected', () => {
  const ctx = baseCtx({
    readmes: {
      ...baseCtx().readmes,
      'mobile/README.md': 'Home URL: https://gta-vi-countdown.onrender.com/eastern-europe\nGradle 8.7\ngradlew assembleRelease'
    }
  });
  const findings = runDocumentationAudit(ctx);
  assert.ok(findings.some((f) => f.id === 'doc-mobile-home-root'), JSON.stringify(findings));
  assert.ok(findings.some((f) => f.kind === 'outdated'));
});

test('Flutter claim is flagged when pure Android', () => {
  const ctx = baseCtx({
    pureAndroid: true,
    readmes: {
      ...baseCtx().readmes,
      'mobile/README.md': 'Built with Flutter\nHome URL: https://gta-vi-countdown.onrender.com/\nGradle 8.7\ngradlew assembleRelease'
    }
  });
  const findings = runDocumentationAudit(ctx);
  assert.ok(findings.some((f) => f.id === 'doc-mobile-no-flutter'));
});

test('ghost API in README is detected', () => {
  const ctx = baseCtx({
    readmes: {
      ...baseCtx().readmes,
      'README.md': baseCtx().readmes['README.md'] + '\nAlso /api/does-not-exist-xyz'
    }
  });
  const findings = auditDocumentedApis(ctx);
  assert.ok(findings.some((f) => f.id.includes('doesnotexist') || f.problem.includes('/api/does-not-exist-xyz')));
});

test('wrong bgs count is detected', () => {
  const ctx = baseCtx({
    bgsCount: 143,
    readmes: {
      ...baseCtx().readmes,
      'README.md': baseCtx().readmes['README.md'].replace('**143 image files**', '**24 image files**')
    }
  });
  const findings = runDocumentationAudit(ctx);
  assert.ok(findings.some((f) => f.id === 'doc-root-bgs-count-not-inflated'));
});

test('newly introduced API requires documentation (implemented true, docs false)', () => {
  const ctx = baseCtx({
    apis: { ...baseCtx().apis, '/api/music': true },
    readmes: {
      ...baseCtx().readmes,
      'README.md': baseCtx().readmes['README.md'].replace(/\/api\/music/g, '')
    }
  });
  const findings = runDocumentationAudit(ctx);
  assert.ok(findings.some((f) => f.id === 'doc-api-music' && f.kind === 'missing'));
});

test('false-positive prevention: no exact bgs count claim is OK', () => {
  const ctx = baseCtx({
    bgsCount: 143,
    readmes: {
      ...baseCtx().readmes,
      'README.md': baseCtx().readmes['README.md'].replace('**143 image files** on disk', 'many image files on disk')
    }
  });
  const findings = runDocumentationAudit(ctx);
  assert.ok(!findings.some((f) => f.id === 'doc-root-bgs-count-not-inflated'));
});

test('false-positive prevention: unimplemented feature does not require docs', () => {
  const ctx = baseCtx({
    hasIntegrityWorkflow: false,
    readmes: {
      ...baseCtx().readmes,
      'README.md': baseCtx().readmes['README.md'].replace('readme-integrity.yml', '')
    }
  });
  const findings = runDocumentationAudit(ctx);
  assert.ok(!findings.some((f) => f.id === 'doc-workflow-integrity'));
});

test('DOC_SPECS is non-empty maintainable mapping', () => {
  assert.ok(DOC_SPECS.length >= 10);
  for (const s of DOC_SPECS) {
    assert.ok(s.id && s.severity && s.readme && s.kind);
    assert.ok(typeof s.implemented === 'function');
    assert.ok(typeof s.documented === 'function');
  }
});

test('empty findings when everything synchronized (repeat)', () => {
  assert.strictEqual(runDocumentationAudit(baseCtx()).length, 0);
});

console.log(JSON.stringify({ passed, failed, total: passed + failed }));
process.exit(failed ? 1 : 0);
