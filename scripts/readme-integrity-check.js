#!/usr/bin/env node
/** Scan repo and rewrite all README.md files to match current code. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const now = new Date().toISOString();
const exists = (r) => fs.existsSync(path.join(ROOT, r));
const read = (r) => (exists(r) ? fs.readFileSync(path.join(ROOT, r), 'utf8') : '');
const write = (rel, content) => {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const prev = exists(rel) ? fs.readFileSync(p, 'utf8') : null;
  if (prev === content) return false;
  fs.writeFileSync(p, content);
  console.log('Wrote', rel);
  return true;
};
const has = (r, n) => read(r).includes(n);
const countImgs = (d) => {
  const a = path.join(ROOT, d);
  if (!fs.existsSync(a)) return 0;
  return fs.readdirSync(a).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f)).length;
};

const mainKt = 'mobile/android/app/src/main/kotlin/com/notcristi/vicountdown/MainActivity.kt';
const iosVc = 'mobile/ios/VICountdown/ViewController.swift';
const androidHome = (read(mainKt).match(/HOME_URL\s*=\s*"([^"]+)"/) || [])[1] || 'https://gta-vi-countdown.onrender.com/';
const iosHome = (read(iosVc).match(/homeURL\s*=\s*URL\(string:\s*"([^"]+)"/) || [])[1] || 'https://gta-vi-countdown.onrender.com/';
const androidHost = (read(mainKt).match(/ALLOWED_HOST\s*=\s*"([^"]+)"/) || [])[1] || 'gta-vi-countdown.onrender.com';
const iosHost = (read(iosVc).match(/allowedHost\s*=\s*"([^"]+)"/) || [])[1] || 'gta-vi-countdown.onrender.com';
const bgsCount = countImgs('bgs');
const gradleProps = read('mobile/android/gradle/wrapper/gradle-wrapper.properties');
const gradleVer = (gradleProps.match(/gradle-(\d+\.\d+(?:\.\d+)?)/) || [])[1] || '8.7';
const settingsGradle = read('mobile/android/settings.gradle');
const agpVer = (settingsGradle.match(/com\.android\.application"\s+version\s+"([^"]+)"/) || [])[1] || '8.6.0';
const kotlinVer = (settingsGradle.match(/kotlin\.android"\s+version\s+"([^"]+)"/) || [])[1] || '1.9.24';
const appId = (read('mobile/android/app/build.gradle').match(/applicationId\s*=\s*"([^"]+)"/) || [])[1] || 'com.notcristi.vicountdown';
const iosIcon = exists('mobile/ios/VICountdown/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png');
const launcherIco = exists('launcher/assets/GtaLogo.ico');
const launcherSln = exists('launcher/GtaViCountdown.sln') || exists('launcher/GtaViCountdown.vcxproj');
const pureAndroid = !has('mobile/android/settings.gradle', 'flutter.sdk') && !has('mobile/android/settings.gradle', 'flutter-plugin');
const slugList = ['new-zealand','australia','japan-korea','asia-pacific','indonesia-thailand','india','uae','saudi-turkey','eastern-europe','europe','uk','south-america','bolivia','us-canada','mexico'];
const htmlJs = read('gta-vi-countdown.html') + read('app.js');
const regionsFound = slugList.filter((s) => htmlJs.includes(s));
const apis = {
  trailers: has('app.js', '/api/trailers'),
  music: has('app.js', '/api/music') || has('music-discovery.js', '/api/music'),
  repo: has('app.js', '/api/repo'),
  news: has('app.js', '/api/news'),
  backgrounds: has('app.js', '/api/backgrounds') || has('gta-vi-countdown.html', '/api/backgrounds'),
  commits: has('app.js', '/api/commits'),
  commit: has('app.js', '/api/commit'),
  stats: has('app.js', '/api/stats'),
};

const checks = [];
const check = (id, claim, ok, detail) => checks.push({ id, readmeClaim: claim, ok: !!ok, detail });
check('html', 'gta-vi-countdown.html', exists('gta-vi-countdown.html'), 'file');
check('app-js', 'app.js', exists('app.js'), 'file');
check('regions', regionsFound.length + ' region slugs', regionsFound.length >= 15, regionsFound.length + ' found');
check('music', 'music.js/css', exists('music.js') && exists('music.css'), 'files');
check('bgs', 'bgs/ images (' + bgsCount + ')', bgsCount >= 1, bgsCount + ' images');
check('android-gradle', 'Gradle ' + gradleVer, exists('mobile/android/gradlew.bat') && gradleProps.includes(gradleVer), gradleVer);
check('android-main', 'MainActivity WebView', exists(mainKt) && has(mainKt, 'WebView'), androidHome);
check('android-pure', 'No Flutter in Android Gradle', pureAndroid, pureAndroid ? 'pure' : 'flutter refs');
check('ios-xcode', 'VICountdown.xcodeproj', exists('mobile/ios/VICountdown.xcodeproj/project.pbxproj'), 'project');
check('ios-webview', 'WKWebView', exists(iosVc) && has(iosVc, 'WKWebView'), iosHome);
check('ios-icon', 'AppIcon-1024.png', iosIcon, iosIcon ? 'present' : 'missing');
check('launcher', 'Launcher project', launcherSln, launcherSln ? 'present' : 'missing');
check('launcher-ico', 'GtaLogo.ico', launcherIco, launcherIco ? 'present' : 'missing');

const passed = checks.filter((c) => c.ok).length;
const failedList = checks.filter((c) => !c.ok);
const report = {
  generatedAt: now,
  commit: process.env.GITHUB_SHA || 'local',
  summary: { total: checks.length, passed, failed: failedList.length },
  facts: { androidHome, iosHome, androidHost, iosHost, bgsCount, gradleVer, agpVer, kotlinVer, appId, regionsFound: regionsFound.length, apis, pureAndroid, iosIcon, launcherIco },
  checks,
};
write('scripts/integrity-report.json', JSON.stringify(report, null, 2) + '\n');

function statusTable() {
  return '| Check | Status | Detail |\n|-------|--------|--------|\n' + checks.map((c) => '| ' + c.readmeClaim.replace(/\|/g, '/') + ' | ' + (c.ok ? 'YES' : 'NO') + ' | ' + String(c.detail).replace(/\|/g, '/') + ' |').join('\n');
}
function integrityFooter(extra) {
  return '<!-- AUTO-GENERATED: readme-integrity-check -->\n## Automated integrity status\n\nLast run: **' + now + '** · **' + passed + '/' + checks.length + ' passed** · Background images: **' + bgsCount + '**' + (extra || '') + '\n\n' + statusTable() + '\n\n*Regenerated by scripts/readme-integrity-check.js from the current tree.*\n<!-- END AUTO-GENERATED -->\n';
}

const mobileReadme = '# VI Countdown — mobile apps\n\nNative WebView shells for the live GTA VI countdown. **No Flutter.**\n\n| Platform | Stack | Home URL | Build |\n|----------|--------|----------|--------|\n| **Android** | Kotlin + WebView + **Gradle ' + gradleVer + '** (AGP ' + agpVer + ', Kotlin ' + kotlinVer + ') | `' + androidHome + '` | `gradlew.bat assembleRelease` |\n| **iOS** | Swift + **WKWebView** + Xcode | `' + iosHome + '` | Open `VICountdown.xcodeproj` → Archive |\n\nShared behavior (from source):\n\n- Display name **VI Countdown** · Application ID / bundle **`' + appId + '`**\n- Allowed in-app host: **`' + androidHost + '`**\n- Other links open in the **system browser**\n- Theme **#1A0A2E**\n- iOS app icon: **' + (iosIcon ? 'AppIcon-1024.png present' : 'missing') + '**\n\n---\n\n## Android (Gradle only)\n\n### Requirements\n\n- JDK 17 · Android SDK\n- `mobile/android/local.properties` → `sdk.dir=...` only\n\n### Build APK (Windows)\n\n```bat\ncd mobile\\android\ngradlew.bat assembleDebug\ngradlew.bat assembleRelease\n```\n\n| Build | Output |\n|-------|--------|\n| Debug | `app\\build\\outputs\\apk\\debug\\app-debug.apk` |\n| Release | `app\\build\\outputs\\apk\\release\\app-release.apk` |\n\n### Build APK (macOS / Linux)\n\n```bash\ncd mobile/android\n./gradlew assembleRelease\n```\n\n**Source:** `' + mainKt + '`\n\n---\n\n## iOS (native Swift / Xcode)\n\n### Requirements\n\n- **macOS** + **Xcode 15+**\n\n### Open & run\n\n1. Open **`mobile/ios/VICountdown.xcodeproj`** in Xcode\n2. Signing → Team\n3. Run\n\n### Build IPA\n\nProduct → Archive → Distribute App\n\n**Source:** `' + iosVc + '`\n\n---\n\n' + integrityFooter('') + '\n## Legal\n\nFan-made companion. Not affiliated with Rockstar Games / Take-Two.\n';

const launcherReadme = '# GTA VI Countdown — desktop launcher (C++)\n\nWin32 + **WebView2** shell that embeds the live countdown site.\n\n## Status (from repo)\n\n| Item | Present |\n|------|---------|\n| Solution / project | **' + (launcherSln ? 'yes' : 'no') + '** |\n| `launcher/assets/GtaLogo.ico` | **' + (launcherIco ? 'yes' : 'no') + '** |\n\n## Features\n\n- Loads the live site in WebView2\n- Toolbar: Back · Forward · Home · Refresh\n- **GTA VI logo** as `.exe` icon when GtaLogo.ico is embedded\n\nSee [root README](../README.md). Assets: [launcher/assets/README.md](assets/README.md).\n\n## Requirements\n\n- Windows 10/11 · Visual Studio 2022 (C++) · WebView2 Runtime\n\n## Build\n\n1. Open `GtaViCountdown.sln`\n2. Restore NuGet · Release | x64 · Build\n3. Run `bin\\x64\\Release\\GtaViCountdown.exe`\n\n' + integrityFooter(' · launcher');

const assetsReadme = '# Launcher assets\n\n| File | Role | On disk |\n|------|------|---------|\n| **`GtaLogo.ico`** | Windows executable icon (`IDI_APPICON` in `src/app.rc`) | **' + (launcherIco ? 'present' : 'missing') + '** |\n\nRelated: [launcher/README.md](../README.md) · [root README](../../README.md)\n\n' + integrityFooter(' · launcher/assets');

function upsertSection(content, startMarker, endMarker, body) {
  const block = startMarker + '\n' + body + '\n' + endMarker;
  const i = content.indexOf(startMarker);
  const j = content.indexOf(endMarker);
  if (i !== -1 && j !== -1 && j > i) return content.slice(0, i) + block + content.slice(j + endMarker.length);
  const lic = content.search(/\n## .{0,3} License|\n## Legal\b/);
  if (lic !== -1) return content.slice(0, lic) + '\n' + block + '\n' + content.slice(lic);
  return content.trimEnd() + '\n\n' + block + '\n';
}

function patchRootReadme(src) {
  let t = src;
  t = t.replace(/\*\*\d+\*\*\s+Vice City/g, '**' + bgsCount + '** Vice City');
  t = t.replace(/\d+\s+official-style artworks in `bgs\//g, bgsCount + ' official-style artworks in `bgs/');
  t = t.replace(/Background images \(\d+/g, 'Background images (' + bgsCount);
  t = t.replace(/\((\d+) images,/g, '(' + bgsCount + ' images,');

  const mobileBody = '### Mobile apps — VI Countdown (native, no Flutter)\n\n> Auto-synced from source by `scripts/readme-integrity-check.js`.\n\n- **Android** — Kotlin WebView · Gradle **' + gradleVer + '** · AGP ' + agpVer + ' · Kotlin ' + kotlinVer + '\n  - Home: `' + androidHome + '`\n  - Build: `cd mobile\\android` → `gradlew.bat assembleRelease`\n  - App ID: `' + appId + '` · pure Gradle (no Flutter): **' + (pureAndroid ? 'yes' : 'no') + '**\n- **iOS** — Swift WKWebView · `mobile/ios/VICountdown.xcodeproj`\n  - Home: `' + iosHome + '`\n  - Icon: **' + (iosIcon ? 'AppIcon-1024.png present' : 'missing') + '**\n  - Build IPA: Xcode → Archive\n- In-app host: `' + androidHost + '` · external links → system browser\n- Details: [mobile/README.md](mobile/README.md)\n';
  t = t.replace(/### .{0,4}Mobile[\s\S]*?(?=\n---\n|\n### |\n## )/, mobileBody + '\n');

  const apiNote = Object.entries(apis).map(([k, v]) => '- `/api/' + k + '`: **' + (v ? 'present' : 'not found') + '**').join('\n');
  const codeFactsBody = '### Code facts (auto)\n\n| Fact | Value |\n|------|--------|\n| Background images in `bgs/` | **' + bgsCount + '** |\n| Region slugs detected | **' + regionsFound.length + '** / 15 |\n| Android home URL | `' + androidHome + '` |\n| iOS home URL | `' + iosHome + '` |\n| Gradle | **' + gradleVer + '** · AGP **' + agpVer + '** · Kotlin **' + kotlinVer + '** |\n| App ID | `' + appId + '` |\n| Launcher GtaLogo.ico | ' + (launcherIco ? 'yes' : 'no') + ' |\n| iOS AppIcon-1024 | ' + (iosIcon ? 'yes' : 'no') + ' |\n\nAPI routes detected:\n\n' + apiNote + '\n';
  t = upsertSection(t, '<!-- AUTO-GENERATED-CODE-FACTS -->', '<!-- END AUTO-GENERATED-CODE-FACTS -->', codeFactsBody);
  t = upsertSection(t, '<!-- AUTO-GENERATED: readme-integrity-check -->', '<!-- END AUTO-GENERATED -->', integrityFooter('').replace('<!-- AUTO-GENERATED: readme-integrity-check -->\n', '').replace('\n<!-- END AUTO-GENERATED -->\n', ''));
  return t;
}

let changed = false;
changed = write('mobile/README.md', mobileReadme) || changed;
changed = write('launcher/README.md', launcherReadme) || changed;
changed = write('launcher/assets/README.md', assetsReadme) || changed;
if (exists('README.md')) {
  if (write('README.md', patchRootReadme(read('README.md')))) changed = true;
}
console.log(JSON.stringify(report.summary));
failedList.forEach((c) => console.log('FAIL', c.id, c.detail));
console.log(changed ? 'README_CHANGED=1' : 'README_CHANGED=0');
