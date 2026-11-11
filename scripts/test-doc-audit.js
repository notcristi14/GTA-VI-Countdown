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

/* Timestamp / stripVolatile semantics (mirrors scripts/readme-integrity-check.js) */
function stripVolatile(s) {
  return s
    .replace(/Last content update: \*\*[^*]+\*\*/g, 'Last content update: **STABLE**')
    .replace(/Last run: \*\*[^*]+\*\*/g, 'Last content update: **STABLE**')
    .replace(/commit `[a-f0-9]+`/gi, 'commit `SHA`')
    .replace(/"lastContentUpdateAt":\s*"[^"]+"/g, '"lastContentUpdateAt":"STABLE"')
    .replace(/"generatedAt":\s*"[^"]+"/g, '"lastContentUpdateAt":"STABLE"')
    .replace(/"commit":\s*"[^"]+"/g, '"commit":"STABLE"');
}

test('stripVolatile: only timestamp/SHA change compares equal (no commit)', () => {
  const a = '## Automated integrity status\n\nLast content update: **2026-11-11T08:00:00.000Z** · commit `abc1234` · **63/63 passed**\n';
  const b = '## Automated integrity status\n\nLast content update: **2026-11-11T10:00:00.000Z** · commit `def5678` · **63/63 passed**\n';
  assert.strictEqual(stripVolatile(a), stripVolatile(b));
});

test('stripVolatile: legacy Last run label still normalizes', () => {
  const legacy = 'Last run: **2026-01-01T00:00:00.000Z** · commit `aaaaaaa`';
  const modern = 'Last content update: **2026-11-11T00:00:00.000Z** · commit `bbbbbbb`';
  assert.strictEqual(stripVolatile(legacy), stripVolatile(modern));
});

test('stripVolatile: real content change is detected', () => {
  const a = 'Last content update: **2026-11-11T08:00:00.000Z** · **63/63 passed**\n| `x` | PASS |';
  const b = 'Last content update: **2026-11-11T08:00:00.000Z** · **62/63 passed**\n| `x` | FAIL |';
  assert.notStrictEqual(stripVolatile(a), stripVolatile(b));
});

test('stripVolatile: report lastContentUpdateAt is volatile', () => {
  const a = '{"lastContentUpdateAt":"2026-11-11T08:00:00.000Z","commit":"abc","summary":{"total":63}}';
  const b = '{"lastContentUpdateAt":"2026-11-11T10:00:00.000Z","commit":"def","summary":{"total":63}}';
  assert.strictEqual(stripVolatile(a), stripVolatile(b));
});

/* Dynamic README discovery — uses production findReadmes from readme-integrity-check.js */
const { findReadmes: prodFindReadmes, upsertGenerated, MARKER_START, MARKER_END } = require('./readme-integrity-check');

test('production findReadmes discovers known READMEs (count is not fixed)', () => {
  const path = require('path');
  const root = path.resolve(__dirname, '..');
  const found = prodFindReadmes(root);
  assert.ok(found.includes('README.md'));
  assert.ok(found.includes('mobile/README.md'));
  assert.ok(found.includes('launcher/README.md'));
  assert.ok(found.includes('launcher/assets/README.md'));
  // Must not assume a fixed count — additional READMEs are allowed
  assert.ok(found.length >= 4);
});

test('production findReadmes discovers nested README and skips excluded dirs', () => {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ric-readme-'));
  try {
    fs.mkdirSync(path.join(tmp, 'nested', 'deep'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'README.md'), '# root\n');
    fs.writeFileSync(path.join(tmp, 'nested', 'deep', 'README.md'), '# deep\n');
    fs.mkdirSync(path.join(tmp, 'node_modules'));
    fs.writeFileSync(path.join(tmp, 'node_modules', 'README.md'), '# skip\n');
    fs.mkdirSync(path.join(tmp, 'build'));
    fs.writeFileSync(path.join(tmp, 'build', 'README.md'), '# skip build\n');
    const found = prodFindReadmes(tmp, null, tmp);
    assert.deepStrictEqual(found, ['README.md', 'nested/deep/README.md']);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('production findReadmes discovers a fifth README without failing', () => {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ric-fifth-'));
  try {
    fs.writeFileSync(path.join(tmp, 'README.md'), '# root\n');
    fs.mkdirSync(path.join(tmp, 'docs', 'extra'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'docs', 'README.md'), '# docs\n');
    fs.writeFileSync(path.join(tmp, 'docs', 'extra', 'README.md'), '# extra\n');
    const found = prodFindReadmes(tmp, null, tmp);
    assert.ok(found.includes('README.md'));
    assert.ok(found.includes('docs/README.md'));
    assert.ok(found.includes('docs/extra/README.md'));
    assert.ok(found.length >= 3);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('upsertGenerated repairs missing markers', () => {
  const before = '# Hand written\n\nNo markers yet.\n';
  const after = upsertGenerated(before, '## Automated integrity status\n\nstatus');
  assert.ok(after.includes(MARKER_START));
  assert.ok(after.includes(MARKER_END));
  assert.ok(after.includes('Hand written'));
  assert.strictEqual(after.split(MARKER_START).length - 1, 1);
  assert.strictEqual(after.split(MARKER_END).length - 1, 1);
});

test('upsertGenerated repairs incomplete / orphaned markers', () => {
  const before = '# Hand\n' + MARKER_START + '\npartial only\n';
  const after = upsertGenerated(before, '## status');
  assert.strictEqual(after.split(MARKER_START).length - 1, 1);
  assert.strictEqual(after.split(MARKER_END).length - 1, 1);
  assert.ok(after.includes('Hand'));
});

test('upsertGenerated repairs duplicated markers', () => {
  const before = '# Hand\n\n' + MARKER_START + '\nold\n' + MARKER_END + '\n\n' + MARKER_START + '\ndupe\n' + MARKER_END + '\n';
  const after = upsertGenerated(before, '## clean');
  assert.strictEqual(after.split(MARKER_START).length - 1, 1);
  assert.strictEqual(after.split(MARKER_END).length - 1, 1);
  assert.ok(after.includes('## clean'));
  assert.ok(!after.includes('old'));
  assert.ok(!after.includes('dupe'));
});

test('upsertGenerated repairs reversed markers', () => {
  const before = '# Hand\n' + MARKER_END + '\nthen start\n' + MARKER_START + '\n';
  const after = upsertGenerated(before, '## fixed');
  assert.strictEqual(after.split(MARKER_START).length - 1, 1);
  assert.strictEqual(after.split(MARKER_END).length - 1, 1);
  const si = after.indexOf(MARKER_START);
  const ei = after.indexOf(MARKER_END);
  assert.ok(si < ei);
});

test('no hardcoded four-file existence-check list in integrity script', () => {
  const fs = require('fs');
  const path = require('path');
  const src = fs.readFileSync(path.join(__dirname, 'readme-integrity-check.js'), 'utf8');
  assert.ok(!src.includes("['README.md', 'mobile/README.md', 'launcher/README.md', 'launcher/assets/README.md'].forEach"));
  assert.ok(src.includes('for (const rf of readmeFiles)'));
  assert.ok(src.includes('findReadmes'));
  // The production check itself should not use a meaningless !false condition
  assert.ok(!src.includes('readmeFiles.length >= 1 && !false'));
});

console.log(JSON.stringify({ passed, failed, total: passed + failed }));
process.exit(failed ? 1 : 0);
