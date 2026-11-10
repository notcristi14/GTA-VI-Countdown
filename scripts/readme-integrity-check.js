#!/usr/bin/env node
/** README feature claims vs repo — update READMEs + scripts/integrity-report.json */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const exists = (r) => fs.existsSync(path.join(ROOT, r));
const read = (r) => (exists(r) ? fs.readFileSync(path.join(ROOT, r), 'utf8') : '');
const has = (r, n) => read(r).includes(n);
const countImgs = (d) => {
  const a = path.join(ROOT, d);
  if (!fs.existsSync(a)) return 0;
  return fs.readdirSync(a).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f)).length;
};

const checks = [];
const check = (id, claim, ok, detail) => checks.push({ id, readmeClaim: claim, ok: !!ok, detail });

check('html-main', 'gta-vi-countdown.html frontend', exists('gta-vi-countdown.html'), 'file');
check('app-js', 'Express app.js', exists('app.js'), 'file');
const slugs = ['new-zealand','australia','japan-korea','asia-pacific','indonesia-thailand','india','uae','saudi-turkey','eastern-europe','europe','uk','south-america','bolivia','us-canada','mexico'];
const blob = read('gta-vi-countdown.html') + read('app.js');
check('regions-15', '15 regional unlock targets', slugs.filter((s) => blob.includes(s)).length >= 15, 'slugs in HTML/JS');
check('digit-reels', 'requestAnimationFrame digit reels', has('gta-vi-countdown.html', 'requestAnimationFrame') || has('music.js', 'requestAnimationFrame'), 'rAF');
check('api-trailers', '/api/trailers', has('app.js', '/api/trailers') || has('music-discovery.js', 'trailer'), 'API');
check('api-music', '/api/music', exists('music-discovery.js') && (has('app.js', '/api/music') || has('music-discovery.js', '/api/music')), 'API');
check('api-repo', '/api/repo', has('app.js', '/api/repo') || has('github-api.js', 'repo'), 'API');
check('api-news', '/api/news', has('app.js', '/api/news'), 'API');
check('api-backgrounds', '/api/backgrounds', has('app.js', '/api/backgrounds') || has('gta-vi-countdown.html', '/api/backgrounds'), 'API');
check('music-files', 'music.js + music.css', exists('music.js') && exists('music.css'), 'files');
const bgs = countImgs('bgs');
check('bgs-count', 'Background images in bgs/', bgs >= 20, bgs + ' images');
check('sync-bgs', 'scripts/sync-backgrounds.js', exists('scripts/sync-backgrounds.js'), 'script');
check('android-gradle', 'Gradle 8.7 wrapper', exists('mobile/android/gradlew.bat') && has('mobile/android/gradle/wrapper/gradle-wrapper.properties', 'gradle-8.7'), 'wrapper');
const mainKt = 'mobile/android/app/src/main/kotlin/com.notcristi.vicountdown/MainActivity.kt'.replace('com.notcristi', 'com/notcristi').replace(/\./g, '/').replace('com/notcristi/vicountdown/MainActivity/kt', 'com/notcristi/vicountdown/MainActivity.kt');
const mainKtPath = 'mobile/android/app/src/main/kotlin/com/notcristi/vicountdown/MainActivity.kt';
check('android-main', 'Kotlin MainActivity WebView', exists(mainKtPath) && has(mainKtPath, 'WebView'), 'MainActivity');
check('android-no-flutter', 'Android without Flutter plugin', !has('mobile/android/settings.gradle', 'flutter.sdk') && !has('mobile/android/settings.gradle', 'flutter-plugin'), 'pure Gradle');
check('android-label', 'Android label VI Countdown', has('mobile/android/app/src/main/AndroidManifest.xml', 'VI Countdown'), 'manifest');
check('android-ee', 'Android home /eastern-europe', has(mainKtPath, 'eastern-europe'), has(mainKtPath, 'eastern-europe') ? 'yes' : 'home is site root');
check('ios-xcode', 'VICountdown.xcodeproj', exists('mobile/ios/VICountdown.xcodeproj/project.pbxproj'), 'project');
const vc = 'mobile/ios/VICountdown/ViewController.swift';
check('ios-webview', 'Swift WKWebView', exists(vc) && has(vc, 'WKWebView') && has(vc, 'gta-vi-countdown.onrender.com'), 'ViewController');
check('ios-ee', 'iOS home /eastern-europe', has(vc, 'eastern-europe'), has(vc, 'eastern-europe') ? 'yes' : 'home is site root');
check('ios-icon', 'iOS AppIcon-1024.png', exists('mobile/ios/VICountdown/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png'), 'icon');
check('ios-name', 'iOS display name VI Countdown', has('mobile/ios/VICountdown/Info.plist', 'VI Countdown'), 'Info.plist');
check('launcher', 'C++ launcher solution', exists('launcher/GtaViCountdown.sln') || exists('launcher/GtaViCountdown.vcxproj'), 'launcher');
check('launcher-ico', 'launcher/assets/GtaLogo.ico', exists('launcher/assets/GtaLogo.ico'), 'exe icon');
check('readme-launcher-assets', 'launcher/assets/README.md', exists('launcher/assets/README.md'), 'doc');
check('readme-root', 'README.md', exists('README.md'), 'doc');
check('readme-mobile', 'mobile/README.md', exists('mobile/README.md'), 'doc');
check('readme-launcher', 'launcher/README.md', exists('launcher/README.md'), 'doc');

const passed = checks.filter((c) => c.ok);
const failed = checks.filter((c) => !c.ok);
const report = {
  generatedAt: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || 'local',
  summary: { total: checks.length, passed: passed.length, failed: failed.length },
  backgroundImageCount: bgs,
  checks,
};
fs.writeFileSync(path.join(ROOT, 'scripts/integrity-report.json'), JSON.stringify(report, null, 2) + '\n');

function table() {
  return ['| Check | Status | Detail |', '|-------|--------|--------|']
    .concat(checks.map((c) => `| ${c.readmeClaim.replace(/\|/g, '/')} | ${c.ok ? '\u2705' : '\u274c'} | ${String(c.detail).replace(/\|/g, '/')} |`))
    .join('\n');
}

function block(titleExtra) {
  return (
    '<!-- AUTO-GENERATED: readme-integrity-check \u2014 do not edit by hand -->\n' +
    '## \ud83d\udd0d Automated integrity status\n\n' +
    `Last run: **${report.generatedAt}** \u00b7 **${passed.length}/${checks.length} passed** \u00b7 Background images: **${bgs}**${titleExtra || ''}\n\n` +
    table() +
    '\n\n*Updated by `scripts/readme-integrity-check.js` (workflow `readme-integrity.yml`).*\n' +
    '<!-- END AUTO-GENERATED -->\n'
  );
}

function upsert(content, b) {
  const s = '<!-- AUTO-GENERATED: readme-integrity-check';
  const e = '<!-- END AUTO-GENERATED -->';
  const i = content.indexOf(s);
  const j = content.indexOf(e);
  if (i !== -1 && j > i) return content.slice(0, i) + b + content.slice(j + e.length).replace(/^\n+/, '\n');
  const lic = content.search(/\n## \ud83d\udcdc License|\n## Legal\b/);
  if (lic !== -1) return content.slice(0, lic) + '\n' + b + '\n' + content.slice(lic);
  return content.trimEnd() + '\n\n' + b + '\n';
}

function fixBg(t, n) {
  return t
    .replace(/\*\*\d+\*\*\s+Vice City/g, `**${n}** Vice City`)
    .replace(/\d+\s+official-style artworks in `bgs\//g, `${n} official-style artworks in \`bgs/`);
}

let changed = false;
function update(rel, fn) {
  const p = path.join(ROOT, rel);
  if (!exists(rel)) return;
  const before = fs.readFileSync(p, 'utf8');
  const after = fn(before);
  if (after !== before) {
    fs.writeFileSync(p, after);
    changed = true;
    console.log('Updated', rel);
  }
}

update('README.md', (t) => upsert(fixBg(t, bgs), block('')));
update('mobile/README.md', (t) =>
  upsert(
    t,
    '<!-- AUTO-GENERATED: readme-integrity-check \u2014 do not edit by hand -->\n' +
      '## \ud83d\udd0d Automated integrity status\n\n' +
      `Last run: **${report.generatedAt}** \u00b7 Failed mobile checks: **${failed.filter((c) => c.id.startsWith('android') || c.id.startsWith('ios')).length}**\n\n` +
      (failed.filter((c) => c.id.startsWith('android') || c.id.startsWith('ios')).map((c) => `- \u274c **${c.readmeClaim}** \u2014 ${c.detail}`).join('\n') ||
        '- All mobile shell checks passed.') +
      '\n\n*From `scripts/readme-integrity-check.js`.*\n<!-- END AUTO-GENERATED -->\n'
  )
);
update('launcher/README.md', (t) =>
  upsert(
    t,
    '<!-- AUTO-GENERATED: readme-integrity-check \u2014 do not edit by hand -->\n' +
      '## \ud83d\udd0d Automated integrity status\n\n' +
      `Last run: **${report.generatedAt}** \u00b7 Launcher files: **${checks.find((c) => c.id === 'launcher').ok ? '\u2705' : '\u274c'}**\n\n*From \`scripts/readme-integrity-check.js\`.*\n` +
      '<!-- END AUTO-GENERATED -->\n'
  )
);

update('launcher/assets/README.md', (t) => {
  const ico = checks.find((c) => c.id === 'launcher-ico');
  const sol = checks.find((c) => c.id === 'launcher');
  return upsert(
    t,
    '<!-- AUTO-GENERATED: readme-integrity-check \u2014 do not edit by hand -->\n' +
      '## \ud83d\udd0d Automated integrity status\n\n' +
      `Last run: **${report.generatedAt}**` +
      ` \u00b7 GtaLogo.ico: **${ico && ico.ok ? '\u2705' : '\u274c'}**` +
      ` \u00b7 Launcher project: **${sol && sol.ok ? '\u2705' : '\u274c'}**\n\n` +
      '*From `scripts/readme-integrity-check.js`.*\n' +
      '<!-- END AUTO-GENERATED -->\n'
  );
});

console.log(JSON.stringify(report.summary));
failed.forEach((c) => console.log('FAIL', c.id, c.detail));
console.log(changed ? 'README_CHANGED=1' : 'README_CHANGED=0');
