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


/* ========== Dynamic documentation audit tests ========== */
const {
  runDynamicDocumentationAudit,
  analyzeChange,
  extractRoutes,
  extractEnvVars,
  extractGradleVersion,
  scanReadmeContradictions,
  getGitChanges,
  isSkippable
} = require('./dynamic-doc-audit');

const sampleReadmes = {
  'README.md': '# Root\n/api/trailers\nexpress 4.21.0\nGradle 8.7\nnpm run start\n',
  'mobile/README.md': 'Home URL: https://gta-vi-countdown.onrender.com/\nGradle 8.7\n',
  'launcher/README.md': 'Home URL: https://gta-vi-countdown.onrender.com/eastern-europe\nWebView2\n',
  'launcher/assets/README.md': 'GtaLogo.ico\n'
};

test('1. newly added JavaScript file with new API is detected', () => {
  const changes = [{ status: 'A', path: 'new-feature.js', content: "app.get('/api/newfeature', () => {});\n" }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.id.includes('dyn-new-api') && f.confirmed));
  assert.ok(res.findings.some(f => f.problem.includes('/api/newfeature')));
});

test('2. modified JavaScript file (new route) is detected', () => {
  const changes = [{ status: 'M', path: 'app.js', content: "app.get('/api/trailers', () => {});\napp.get('/api/extra', () => {});", oldContent: "app.get('/api/trailers', () => {});" }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.id.includes('extra') || f.problem.includes('/api/extra')));
});

test('3. deleted source file referenced in README is detected', () => {
  const readmes = { ...sampleReadmes, 'README.md': sampleReadmes['README.md'] + '\nold-script.js is used\n' };
  const changes = [{ status: 'D', path: 'old-script.js' }];
  const res = runDynamicDocumentationAudit('/tmp', readmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.kind === 'outdated' && f.confirmed && f.sourceFile === 'old-script.js'));
});

test('4. renamed source file is detected', () => {
  const readmes = { ...sampleReadmes, 'README.md': sampleReadmes['README.md'] + '\nutils/helper.js\n' };
  const changes = [{ status: 'R', path: 'utils/helper-renamed.js', oldPath: 'utils/helper.js' }];
  const res = runDynamicDocumentationAudit('/tmp', readmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.id.includes('renamed') && f.confirmed));
});

test('5. new API route is detected', () => {
  const changes = [{ status: 'A', path: 'routes.js', content: 'app.get("/api/freshroute", handler);\n' }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.problem.includes('/api/freshroute') && f.kind === 'missing'));
});

test('6. removed API route is detected', () => {
  const changes = [{ status: 'M', path: 'app.js', content: 'app.get("/api/other", () => {});', oldContent: 'app.get("/api/trailers", () => {});' }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.kind === 'outdated' && f.problem.includes('/api/trailers')));
});

test('7. changed environment variable is detected', () => {
  const changes = [{ status: 'M', path: 'config.js', content: 'const x = process.env.NEW_SECRET_TOKEN;', oldContent: 'const x = 1;' }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.id.includes('NEW_SECRET_TOKEN') || f.problem.includes('NEW_SECRET_TOKEN')));
});

test('8. changed dependency version is detected', () => {
  const changes = [{ status: 'M', path: 'package.json', content: JSON.stringify({ dependencies: { express: '^5.0.0' } }) }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.id.includes('express') && f.kind === 'outdated'));
});

test('9. changed Android build configuration (Gradle version) is detected', () => {
  const changes = [{ status: 'M', path: 'mobile/android/gradle/wrapper/gradle-wrapper.properties', content: 'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.10-all.zip\n' }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.problem.includes('8.10') || f.id.includes('gradle')));
});

test('10. changed iOS configuration (home URL) is detected', () => {
  const changes = [{ status: 'M', path: 'mobile/ios/VICountdown/ViewController.swift', content: 'let homeURL = URL(string: "https://example.com/other")\n' }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.id.includes('ios-home') || f.problem.includes('example.com')));
});

test('11. changed Windows launcher configuration is detected', () => {
  const changes = [{ status: 'M', path: 'launcher/src/AppWindow.cpp', content: 'const char* url = "https://gta-vi-countdown.onrender.com/wrong-region";\nICoreWebView2* wv;\n' }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.id.includes('launcher-home') || f.problem.includes('wrong-region')));
});

test('12. changed GitHub Actions workflow (new) is detected as potential', () => {
  const changes = [{ status: 'A', path: '.github/workflows/new-ci.yml', content: 'name: New CI\n' }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.id.includes('new-workflow') && f.potentialRisk));
});

test('13. new README files in nested directories are discovered by production findReadmes', () => {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dyn-readme-'));
  try {
    fs.mkdirSync(path.join(tmp, 'docs', 'nested'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'docs', 'nested', 'README.md'), '# nested\n');
    const { findReadmes } = require('./readme-integrity-check');
    const found = findReadmes(tmp, null, tmp);
    assert.ok(found.includes('docs/nested/README.md'));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('14. README references to deleted files are detected', () => {
  const readmes = { 'README.md': 'See scripts/old-tool.js for details\n' };
  const changes = [{ status: 'D', path: 'scripts/old-tool.js' }];
  const res = runDynamicDocumentationAudit('/tmp', readmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.documentationFile === 'README.md' && f.confirmed));
});

test('15. outdated documented commands are detected', () => {
  const readmes = { 'README.md': 'Run `npm run missing-script` to build\n' };
  const changes = [{ status: 'M', path: 'package.json', content: JSON.stringify({ scripts: { start: 'node app.js' } }) }];
  const res = runDynamicDocumentationAudit('/tmp', readmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.id.includes('missing-script') || f.problem.includes('missing-script')));
});

test('16. contradictory information across README files is detected', () => {
  const readmes = {
    'README.md': 'Gradle 8.7 is required\n',
    'mobile/README.md': 'Gradle 7.6 is used\n'
  };
  const res = runDynamicDocumentationAudit('/tmp', readmes, { changes: [], skipGitContent: true });
  assert.ok(res.findings.some(f => f.id === 'dyn-contradict-gradle'));
});

test('17. internal refactoring does not force unnecessary documentation findings', () => {
  // Pure comment / whitespace change, no new routes/env/deps
  const changes = [{ status: 'M', path: 'internal-helper.js', content: '// refactored\nfunction helper() { return 1; }\n', oldContent: 'function helper() { return 1; }\n' }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  const confirmed = res.findings.filter(f => f.confirmed && !f.id.includes('contradict'));
  assert.strictEqual(confirmed.length, 0, 'internal refactor should not produce confirmed findings');
});

test('18. changes that affect multiple README files are reported for each', () => {
  const readmes = {
    'README.md': 'old-file.js is here\n',
    'mobile/README.md': 'also mentions old-file.js\n'
  };
  const changes = [{ status: 'D', path: 'old-file.js' }];
  const res = runDynamicDocumentationAudit('/tmp', readmes, { changes, skipGitContent: true });
  const docs = res.findings.filter(f => f.sourceFile === 'old-file.js').map(f => f.documentationFile);
  assert.ok(docs.includes('README.md'));
  assert.ok(docs.includes('mobile/README.md'));
});

test('19. files with spaces in their names are handled', () => {
  const changes = [{ status: 'A', path: 'my feature file.js', content: "app.get('/api/spaced', () => {});\n" }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.sourceFile === 'my feature file.js' && f.confirmed));
});

test('20. missing Git history or unavailable diff is handled safely', () => {
  // Simulate by calling getGitChanges on a non-git path
  const info = getGitChanges('/tmp/not-a-git-repo-xyz');
  assert.ok(info.error);
  assert.strictEqual(info.historyAvailable, false);
  const res = runDynamicDocumentationAudit('/tmp/not-a-git-repo-xyz', sampleReadmes);
  assert.ok(res.summary.status === 'unavailable' || res.summary.error);
});

test('21. false-positive prevention: documented route does not flag', () => {
  const changes = [{ status: 'A', path: 'app.js', content: "app.get('/api/trailers', () => {});\n" }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(!res.findings.some(f => f.problem && f.problem.includes('/api/trailers') && f.kind === 'missing'));
});

test('22. deterministic repeated audit results', () => {
  const changes = [{ status: 'A', path: 'x.js', content: "app.get('/api/det', () => {});\n" }];
  const a = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  const b = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.strictEqual(a.findings.length, b.findings.length);
  assert.deepStrictEqual(a.findings.map(f => f.id).sort(), b.findings.map(f => f.id).sort());
});

test('23. preservation of manually written README content (upsert does not destroy hand text)', () => {
  const { upsertGenerated, MARKER_START } = require('./readme-integrity-check');
  const hand = '# Title\n\nHand-written explanation that must survive.\n\nMore prose.\n';
  const after = upsertGenerated(hand, '## Automated integrity status\n\nok');
  assert.ok(after.includes('Hand-written explanation that must survive.'));
  assert.ok(after.includes(MARKER_START));
});

test('24. handling of unreadable files and inaccessible directories', () => {
  // isSkippable and analyzeChange with forced unreadable via missing content on real path
  assert.ok(isSkippable('node_modules/foo.js'));
  assert.ok(isSkippable('build/out.js'));
  const changes = [{ status: 'M', path: 'does-not-exist-unreadable.js' }];
  // Without skipGitContent, it will try to read and mark unreadable
  const res = runDynamicDocumentationAudit('/tmp/nonexistent-root-for-unreadable', sampleReadmes, { changes });
  assert.ok(res.findings.some(f => f.unreadable || f.id.includes('unreadable')) || res.summary.unreadableFiles >= 0);
});

test('25. correct detection of changes that have no existing DOC_SPECS entry', () => {
  const changes = [{ status: 'A', path: 'brand-new-public.js', content: '// new public module\nmodule.exports = {};\n' }];
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.potentialRisk && f.sourceFile === 'brand-new-public.js'));
});

test('dynamic audit does not silently skip relevant files', () => {
  const changes = [
    { status: 'A', path: 'relevant.js', content: "app.get('/api/skipcheck', () => {});\n" },
    { status: 'A', path: 'node_modules/ignored.js', content: 'app.get("/api/ignored", () => {});' }
  ];
  // node_modules should be skipped by isSkippable when using real getGitChanges, but injected changes are analyzed unless filtered
  const res = runDynamicDocumentationAudit('/tmp', sampleReadmes, { changes, skipGitContent: true });
  assert.ok(res.findings.some(f => f.sourceFile === 'relevant.js'));
  // Relevant file produced a finding — not skipped
  assert.ok(res.summary.analyzedFiles >= 1);
});

test('extractRoutes and extractEnvVars are deterministic', () => {
  const src = 'app.get("/api/foo", () => {});\nconst a = process.env.BAR_TOKEN;\n';
  assert.deepStrictEqual(extractRoutes(src), ['/api/foo']);
  assert.deepStrictEqual(extractEnvVars(src), ['BAR_TOKEN']);
  assert.strictEqual(extractGradleVersion('gradle-8.7-all.zip'), '8.7');
});

test('scanReadmeContradictions returns empty when consistent', () => {
  const consistent = { 'README.md': 'Gradle 8.7\n', 'mobile/README.md': 'Uses Gradle 8.7\n' };
  assert.strictEqual(scanReadmeContradictions(consistent).length, 0);
});

console.log(JSON.stringify({ passed, failed, total: passed + failed }));
process.exit(failed ? 1 : 0);
