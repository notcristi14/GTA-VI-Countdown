#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { runDocumentationAudit, formatDocFindingsMarkdown, DOC_SPECS } = require('./doc-audit');
const ROOT = path.resolve(__dirname, '..');
const now = new Date().toISOString();
const commitSha = process.env.GITHUB_SHA || 'local';
const EXPECTED_MOBILE_HOME = 'https://gta-vi-countdown.onrender.com/';
const EXPECTED_MOBILE_HOST = 'gta-vi-countdown.onrender.com';
const EXPECTED_REGIONS = [['new-zealand','New Zealand','2026-11-18T11:00:00Z'],['australia','Australia','2026-11-18T13:00:00Z'],['japan-korea','Japan & South Korea','2026-11-18T15:00:00Z'],['asia-pacific','Hong Kong, Taiwan, Singapore, Malaysia','2026-11-18T16:00:00Z'],['indonesia-thailand','Indonesia & Thailand','2026-11-18T17:00:00Z'],['india','India','2026-11-18T18:30:00Z'],['uae','United Arab Emirates','2026-11-18T20:00:00Z'],['saudi-turkey','Saudi Arabia & Turkey','2026-11-18T21:00:00Z'],['eastern-europe','Eastern Europe / UTC+2 (Greece, Romania, Finland, Israel, South Africa, etc.)','2026-11-18T22:00:00Z'],['europe','Central Europe (CET)','2026-11-18T23:00:00Z'],['uk','United Kingdom, Ireland, Iceland, Portugal','2026-11-19T00:00:00Z'],['south-america','Brazil, Argentina, Chile, Paraguay, Uruguay','2026-11-19T03:00:00Z'],['bolivia','Bolivia','2026-11-19T04:00:00Z'],['us-canada','United States, Canada + Colombia, Ecuador, Panama, Peru','2026-11-19T05:00:00Z'],['mexico','Mexico & Central America','2026-11-19T06:00:00Z']];
const MARKER_START = '<!-- AUTO-GENERATED: readme-integrity-check -->';
const MARKER_END = '<!-- END AUTO-GENERATED -->';
const exists = (r) => fs.existsSync(path.join(ROOT, r));
const read = (r) => { try { const p = path.join(ROOT, r); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''; } catch { return ''; } };
const stripVolatile = (s) => s.replace(/Last run: \*\*[^*]+\*\*/g, 'Last run: **STABLE**').replace(/commit `[a-f0-9]+`/gi, 'commit `SHA`').replace(/"generatedAt":\s*"[^"]+"/g, '"generatedAt":"STABLE"').replace(/"commit":\s*"[^"]+"/g, '"commit":"STABLE"');
const writeIfChanged = (rel, content) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); const body = content.endsWith('\n') ? content : content + '\n'; const prev = exists(rel) ? fs.readFileSync(p, 'utf8') : null; if (prev !== null && stripVolatile(prev) === stripVolatile(body)) return false; fs.writeFileSync(p, body); console.log('Wrote', rel); return true; };
const countImgs = (d) => { const a = path.join(ROOT, d); if (!fs.existsSync(a)) return 0; return fs.readdirSync(a).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f)).length; };
function findReadmes(dir, acc) { acc = acc || []; let names; try { names = fs.readdirSync(dir); } catch { return acc; } for (const name of names) { if (name === '.git' || name === 'node_modules' || name === 'build' || name === 'DerivedData') continue; const full = path.join(dir, name); let st; try { st = fs.statSync(full); } catch { continue; } if (st.isDirectory()) findReadmes(full, acc); else if (name === 'README.md') acc.push(path.relative(ROOT, full).replace(/\\/g, '/')); } return acc.sort(); }
function normalizeUrl(u) { if (!u) return null; try { const x = new URL(u); let pathname = x.pathname.replace(/\/+$/, '') || '/'; return (x.origin + (pathname === '/' ? '/' : pathname)).toLowerCase(); } catch { return String(u).trim().toLowerCase().replace(/\/+$/, '') || null; } }
function urlsMatchExpected(actual) { if (!actual) return false; const a = normalizeUrl(actual); const e = normalizeUrl(EXPECTED_MOBILE_HOME); return a === e || a === e.replace(/\/$/, '') || a + '/' === e; }
function routeRegistered(source, apiPath) { const esc = apiPath.replace(/\//g, '\\/'); return new RegExp('app\\.get\\(\\s*[\'"]' + esc + '[\'"]').test(source); }
function upsertGenerated(content, generatedBody) { const block = MARKER_START + '\n' + generatedBody.trim() + '\n' + MARKER_END; const i = content.indexOf(MARKER_START); const j = content.indexOf(MARKER_END); if (i !== -1 && j !== -1 && j > i) return content.slice(0, i) + block + content.slice(j + MARKER_END.length).replace(/^\n+/, '\n'); return content.trimEnd() + '\n\n' + block + '\n'; }
const MAIN_KT = 'mobile/android/app/src/main/kotlin/com/notcristi/vicountdown/MainActivity.kt';
const IOS_VC = 'mobile/ios/VICountdown/ViewController.swift';
const APP_WINDOW = 'launcher/src/AppWindow.cpp';
const html = read('gta-vi-countdown.html');
const appJs = read('app.js');
const musicCss = read('music.css');
const musicDisc = read('music-discovery.js');
const bgsApi = read('backgrounds-api.js');
const mainKt = read(MAIN_KT);
const iosVc = read(IOS_VC);
const appWindowCpp = read(APP_WINDOW);
const androidHomeMatch = mainKt.match(/HOME_URL\s*=\s*"([^"]*)"/);
const iosHomeMatch = iosVc.match(/homeURL\s*=\s*URL\(string:\s*"([^"]*)"\)/);
const androidHome = androidHomeMatch ? androidHomeMatch[1] : null;
const iosHome = iosHomeMatch ? iosHomeMatch[1] : null;
const androidHostMatch = mainKt.match(/ALLOWED_HOST\s*=\s*"([^"]*)"/);
const iosHostMatch = iosVc.match(/allowedHost\s*=\s*"([^"]*)"/);
const androidHost = androidHostMatch ? androidHostMatch[1] : null;
const iosHost = iosHostMatch ? iosHostMatch[1] : null;
const bgsCount = countImgs('bgs');
const gradleProps = read('mobile/android/gradle/wrapper/gradle-wrapper.properties');
const gradleVer = (gradleProps.match(/gradle-(\d+\.\d+(?:\.\d+)?)/) || [])[1] || null;
const settingsG = read('mobile/android/settings.gradle');
const agpVer = (settingsG.match(/com\.android\.application"\s+version\s+"([^"]+)"/) || [])[1] || null;
const kotlinVer = (settingsG.match(/kotlin\.android"\s+version\s+"([^"]+)"/) || [])[1] || null;
const appId = (read('mobile/android/app/build.gradle').match(/applicationId\s*=\s*"([^"]+)"/) || [])[1] || null;
const pureAndroid = settingsG.length > 0 && !settingsG.includes('flutter.sdk') && !settingsG.includes('flutter-plugin');
const iosIcon = exists('mobile/ios/VICountdown/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png');
const launcherIco = exists('launcher/assets/GtaLogo.ico');
const launcherSln = exists('launcher/GtaViCountdown.sln');
const readmeFiles = findReadmes(ROOT);
const apis = { '/api/trailers': routeRegistered(appJs, '/api/trailers') || routeRegistered(musicDisc, '/api/trailers'), '/api/music': routeRegistered(musicDisc, '/api/music') || routeRegistered(appJs, '/api/music'), '/api/repo': routeRegistered(appJs, '/api/repo'), '/api/commits': routeRegistered(appJs, '/api/commits'), '/api/commit': routeRegistered(appJs, '/api/commit'), '/api/news': routeRegistered(appJs, '/api/news'), '/api/stats': routeRegistered(appJs, '/api/stats'), '/api/backgrounds': routeRegistered(bgsApi, '/api/backgrounds') || routeRegistered(appJs, '/api/backgrounds') };
const regionImpl = {};
for (const [slug, name, target] of EXPECTED_REGIONS) { const hasSlug = html.includes("'" + slug + "'"); const hasTarget = html.includes(target); regionImpl[slug] = { expectedName: name, expectedTarget: target, slugPresent: hasSlug, targetPresent: hasTarget, implemented: hasSlug && hasTarget }; }
const regionsOkCount = Object.values(regionImpl).filter((r) => r.implemented).length;
const features = { regions15: regionsOkCount === 15, defaultEurope: /let\s+activeSlug\s*=\s*'europe'/.test(html), pathPersist: /localStorage\.getItem\(\s*'gtaRegion'\s*\)/.test(html), digitReels: html.includes('requestAnimationFrame'), availableNow: /Available now/i.test(html), preorder: html.includes('preorder'), musicPanel: exists('music.js') && exists('music.css'), musicCentered: /align-items:\s*center/.test(musicCss), musicDiscoveryJob: /fetchSpotifyAlbumTracks|SPOTIFY_ALBUM/.test(musicDisc) && /registerMusic/.test(musicDisc), musicCache30m: /30\s*\*\s*60\s*\*\s*1000/.test(musicDisc), trailersCache30m: /TRAILERS_CACHE_MS\s*=\s*30\s*\*\s*60\s*\*\s*1000/.test(appJs), backgroundsJob: /registerBackgrounds/.test(bgsApi) && /6\s*\*\s*60\s*\*\s*60\s*\*\s*1000/.test(bgsApi), pwaManifest: html.includes('manifest') && html.includes('standalone'), serviceWorker: /serviceWorker|navigator\.serviceWorker/.test(html), androidWebViewClass: /WebView/.test(mainKt), androidLoadsHome: /loadUrl\(\s*HOME_URL\s*\)/.test(mainKt), androidExternal: /ACTION_VIEW/.test(mainKt), iosWebViewClass: /WKWebView/.test(iosVc), iosLoadsHome: /webView\.load\(\s*URLRequest\(\s*url:\s*homeURL/.test(iosVc), iosExternal: /UIApplication\.shared\.open/.test(iosVc), launcherWebView2: /ICoreWebView2|WebView2|CreateCoreWebView2Environment/i.test(appWindowCpp), launcherNav: /GoBack|GoForward|Navigate|Back|Forward|Home|Refresh/i.test(appWindowCpp) };
const checks = [];
function check(id, claim, ok, detail, critical) { checks.push({ id, claim, ok: !!ok, detail: String(detail), critical: critical === true }); }
check('file-html', 'gta-vi-countdown.html exists', exists('gta-vi-countdown.html'), exists('gta-vi-countdown.html') ? 'present' : 'MISSING', true);
check('file-app', 'app.js Express entry exists', exists('app.js'), exists('app.js') ? 'present' : 'MISSING', true);
check('regions-count', 'All 15 region slug+UTC pairs in HTML', regionsOkCount === 15, regionsOkCount + '/15 implemented', true);
for (const [slug, , target] of EXPECTED_REGIONS) { const r = regionImpl[slug]; check('region-' + slug, 'Region ' + slug + ' configured', r.implemented, r.implemented ? target : 'slugPresent=' + r.slugPresent + ' targetPresent=' + r.targetPresent, true); }
check('default-europe', "Default activeSlug is 'europe'", features.defaultEurope, features.defaultEurope ? "activeSlug = 'europe'" : 'not found', false);
check('region-persist', 'Region path + localStorage gtaRegion', features.pathPersist, features.pathPersist ? 'ok' : 'missing', false);
check('digit-reels', 'requestAnimationFrame countdown', features.digitReels, features.digitReels ? 'HTML' : 'missing', false);
check('available-now', 'Available now UI string', features.availableNow, features.availableNow ? 'present' : 'missing', false);
check('preorder', 'Pre-order UI in HTML', features.preorder, features.preorder ? 'present' : 'missing', false);
check('music-files', 'music.js + music.css', features.musicPanel, features.musicPanel ? 'files' : 'MISSING', true);
check('music-center', 'Music panel CSS align-items:center', features.musicCentered, features.musicCentered ? 'music.css' : 'not centered', false);
check('music-discovery', 'Spotify album discovery registered', features.musicDiscoveryJob, features.musicDiscoveryJob ? 'music-discovery.js' : 'missing discovery', true);
check('music-cache', 'Music cache ~30 minutes', features.musicCache30m, features.musicCache30m ? 'MUSIC_CACHE_MS' : 'not detected', false);
check('trailers-cache', 'Trailers cache ~30 minutes', features.trailersCache30m, features.trailersCache30m ? 'TRAILERS_CACHE_MS' : 'not detected', false);
check('bgs-job', 'Backgrounds register + 6h check', features.backgroundsJob, features.backgroundsJob ? 'backgrounds-api.js' : 'missing job', true);
Object.keys(apis).forEach((k) => { check('api-' + k.replace(/\W/g, ''), 'Route registered ' + k, apis[k], apis[k] ? 'app.get found' : 'NOT registered in backend sources', true); });
check('bgs-disk', 'Background images on disk (bgs/)', bgsCount >= 20, bgsCount + ' image files', false);
check('pwa-manifest', 'Web App Manifest standalone', features.pwaManifest, features.pwaManifest ? 'HTML' : 'missing', false);
check('no-service-worker', 'No service worker (document honestly)', !features.serviceWorker, features.serviceWorker ? 'serviceWorker found' : 'manifest-only PWA', false);
const androidHomeOk = urlsMatchExpected(androidHome);
check('android-home-url', 'Android HOME_URL is ' + EXPECTED_MOBILE_HOME, androidHomeOk, androidHome == null ? 'HOME_URL constant not found in MainActivity.kt' : 'actual="' + androidHome + '" expected="' + EXPECTED_MOBILE_HOME + '"', true);
check('android-webview', 'Android uses android.webkit WebView', features.androidWebViewClass && exists(MAIN_KT), features.androidWebViewClass ? MAIN_KT : 'WebView not found', true);
check('android-loadurl', 'Android loadUrl(HOME_URL)', features.androidLoadsHome, features.androidLoadsHome ? 'loadUrl(HOME_URL)' : 'loadUrl(HOME_URL) not found', true);
check('android-external', 'Android external links ACTION_VIEW', features.androidExternal, features.androidExternal ? 'Intent.ACTION_VIEW' : 'missing', true);
check('android-host', 'Android ALLOWED_HOST is site host', androidHost === EXPECTED_MOBILE_HOST, androidHost == null ? 'ALLOWED_HOST missing' : 'actual="' + androidHost + '"', true);
check('android-pure-gradle', 'Android Gradle has no Flutter plugin', pureAndroid, pureAndroid ? 'pure Gradle' : 'flutter references remain', true);
check('android-gradle-ver', 'Gradle wrapper 8.7', gradleVer === '8.7', gradleVer == null ? 'wrapper properties missing' : 'actual=' + gradleVer, false);
const iosHomeOk = urlsMatchExpected(iosHome);
check('ios-home-url', 'iOS homeURL is ' + EXPECTED_MOBILE_HOME, iosHomeOk, iosHome == null ? 'homeURL not found in ViewController.swift' : 'actual="' + iosHome + '" expected="' + EXPECTED_MOBILE_HOME + '"', true);
check('ios-webview', 'iOS uses WKWebView', features.iosWebViewClass && exists(IOS_VC), features.iosWebViewClass ? IOS_VC : 'WKWebView not found', true);
check('ios-load', 'iOS loads homeURL into WKWebView', features.iosLoadsHome, features.iosLoadsHome ? 'webView.load(URLRequest(url: homeURL))' : 'load pattern not found', true);
check('ios-external', 'iOS external UIApplication.shared.open', features.iosExternal, features.iosExternal ? 'present' : 'missing', true);
check('ios-host', 'iOS allowedHost is site host', iosHost === EXPECTED_MOBILE_HOST, iosHost == null ? 'allowedHost missing' : 'actual="' + iosHost + '"', true);
check('ios-icon', 'iOS AppIcon-1024.png present', iosIcon, iosIcon ? 'present' : 'MISSING asset', false);
check('launcher-sln', 'launcher/GtaViCountdown.sln exists', launcherSln, launcherSln ? 'present' : 'MISSING', true);
check('launcher-webview2', 'AppWindow.cpp WebView2 usage', features.launcherWebView2, features.launcherWebView2 ? APP_WINDOW : 'WebView2 patterns not found', true);
check('launcher-nav', 'Launcher navigation chrome in AppWindow', features.launcherNav, features.launcherNav ? 'nav patterns found' : 'not detected (non-critical)', false);
check('launcher-ico', 'launcher/assets/GtaLogo.ico exists', launcherIco, launcherIco ? 'present' : 'MISSING', false);
['README.md', 'mobile/README.md', 'launcher/README.md', 'launcher/assets/README.md'].forEach((r) => { check('readme-' + r.replace(/\W/g, '_'), r + ' exists', exists(r), exists(r) ? 'present' : 'MISSING', r === 'README.md'); });
check('readme-discovery', 'At least one README.md discovered', readmeFiles.length >= 1, readmeFiles.length + ' files: ' + readmeFiles.join(', '), true);
const readmesMap = {};
for (const rf of readmeFiles) readmesMap[rf] = read(rf);
const sourceText = [appJs, musicDisc, bgsApi, read('github-api.js'), appWindowCpp].join('\n');
const docFindings = runDocumentationAudit({
  apis, readmes: readmesMap, sourceText, regionsImplemented: regionsOkCount,
  androidHomeOk, iosHomeOk, gradleVer, pureAndroid, launcherIco,
  launcherWebView2: features.launcherWebView2, hasBackgroundsApi: exists('backgrounds-api.js'),
  bgsCount, hasGradlew: exists('mobile/android/gradlew') || exists('mobile/android/gradlew.bat'),
  hasIntegrityWorkflow: exists('.github/workflows/readme-integrity.yml')
});
for (const f of docFindings) {
  check('doc-finding-' + f.id, 'Documentation issue: ' + f.id, false, f.kind + ' · ' + f.documentationFile + ' · ' + String(f.suggestedCorrection).slice(0, 120), false);
}
if (docFindings.length === 0) {
  check('doc-audit-clean', 'Documentation audit: no missing/outdated deterministic issues', true, 'DOC_SPECS (' + DOC_SPECS.length + ') + API claim scan clean', false);
}
const passed = checks.filter((c) => c.ok).length;
const failed = checks.filter((c) => !c.ok);
const criticalFailed = failed.filter((c) => c.critical);
const report = { generatedAt: now, commit: commitSha, analysisType: 'static-source-only', expectedMobileHome: EXPECTED_MOBILE_HOME, readmeFilesScanned: readmeFiles, readmeFileCount: readmeFiles.length, summary: { total: checks.length, passed, failed: failed.length, criticalFailed: criticalFailed.length, documentationFindings: docFindings.length }, detectedFeatures: features, apiEndpoints: apis, countdownRegions: regionImpl, regionsImplemented: regionsOkCount, backgroundImageCount: bgsCount, mobile: { expectedHome: EXPECTED_MOBILE_HOME, androidHome, androidHomeMatchesExpected: androidHomeOk, iosHome, iosHomeMatchesExpected: iosHomeOk, androidHost, iosHost, appId, gradleVer, agpVer, kotlinVer, pureAndroid, iosIcon, sources: { android: MAIN_KT, ios: IOS_VC } }, launcher: { solution: launcherSln, gtaLogoIco: launcherIco, webView2: features.launcherWebView2, source: APP_WINDOW }, missingOrOutdatedDocumentation: docFindings, documentationAudit: { deterministic: true, specsEvaluated: DOC_SPECS.length, note: 'Findings from explicit DOC_SPECS and registered-route comparison; not a full prose review.' }, failedChecks: failed.map((c) => ({ id: c.id, claim: c.claim, detail: c.detail, critical: c.critical })), checks };
writeIfChanged('scripts/integrity-report.json', JSON.stringify(report, null, 2));
function statusTable() { return '| ID | Claim | Status | Detail |\n|----|-------|--------|--------|\n' + checks.map((c) => '| `' + c.id + '` | ' + c.claim.replace(/\|/g, '/') + ' | ' + (c.ok ? 'PASS' : 'FAIL') + ' | ' + c.detail.replace(/\|/g, '/') + ' |').join('\n'); }
function integritySection(scope) { return '## Automated integrity status\n\nLast run: **' + now + '** · commit `' + commitSha.slice(0, 7) + '` · **' + passed + '/' + checks.length + ' passed**' + (criticalFailed.length ? ' · **' + criticalFailed.length + ' critical failures**' : '') + (docFindings.length ? ' · **' + docFindings.length + ' doc findings**' : '') + (scope ? ' · ' + scope : '') + '\n\nExpected mobile home URL: `' + EXPECTED_MOBILE_HOME + '`  \nAndroid actual: `' + (androidHome || '(not found)') + '` · iOS actual: `' + (iosHome || '(not found)') + '`\n\n' + statusTable() + formatDocFindingsMarkdown(docFindings) + '\n*Static analysis only (`scripts/readme-integrity-check.js`). Documentation findings are deterministic DOC_SPECS + route checks — not full prose review. Failures remain until source or documentation is fixed.*\n'; }
let changed = false;
function updateReadmeGenerated(rel, scope) { if (!exists(rel)) return; const before = read(rel); const after = upsertGenerated(before, integritySection(scope)); if (writeIfChanged(rel, after)) changed = true; }
for (const rf of readmeFiles) { let scope = rf; if (rf === 'README.md') scope = 'root'; else if (rf.startsWith('mobile/')) scope = 'mobile'; else if (rf.startsWith('launcher/assets')) scope = 'launcher/assets'; else if (rf.startsWith('launcher/')) scope = 'launcher'; updateReadmeGenerated(rf, scope); }
if (exists('mobile/README.md')) { let m = read('mobile/README.md'); const mobileFactsStart = '<!-- AUTO-GENERATED: mobile-config-facts -->'; const mobileFactsEnd = '<!-- END AUTO-GENERATED: mobile-config-facts -->'; const facts = mobileFactsStart + '\n### Mobile home URL (integrity)\n\n| Shell | Expected | Actual (source) | Match |\n|-------|----------|-----------------|-------|\n| Android `HOME_URL` | `' + EXPECTED_MOBILE_HOME + '` | `' + (androidHome || 'NOT FOUND') + '` | ' + (androidHomeOk ? 'yes' : '**NO**') + ' |\n| iOS `homeURL` | `' + EXPECTED_MOBILE_HOME + '` | `' + (iosHome || 'NOT FOUND') + '` | ' + (iosHomeOk ? 'yes' : '**NO**') + ' |\n\nIntended mobile landing page is the **site root** (`/`). Regional paths such as `/eastern-europe` remain available in the web UI for all 15 countdown regions; they are not required as the native shell home URL.\nIf Match is **NO**, the native shell home URL does not match the intended root URL.\n' + mobileFactsEnd; const fi = m.indexOf(mobileFactsStart); const fj = m.indexOf(mobileFactsEnd); let next; if (fi !== -1 && fj !== -1 && fj > fi) next = m.slice(0, fi) + facts + m.slice(fj + mobileFactsEnd.length).replace(/^\n+/, '\n'); else { const gi = m.indexOf(MARKER_START); if (gi !== -1) next = m.slice(0, gi) + facts + '\n\n' + m.slice(gi); else next = m.trimEnd() + '\n\n' + facts + '\n'; } if (writeIfChanged('mobile/README.md', next)) changed = true; }
console.log(JSON.stringify(report.summary));
if (docFindings.length) { console.log('DOC_FINDINGS=' + docFindings.length); docFindings.forEach((f) => console.log('DOC', f.severity, f.id, f.documentationFile)); }
failed.forEach((c) => console.log('FAIL', c.id, c.detail));
console.log(changed ? 'README_CHANGED=1' : 'README_CHANGED=0');
if (criticalFailed.length > 0) { console.error('CRITICAL_FAILURES=' + criticalFailed.length + ' ' + criticalFailed.map((c) => c.id).join(',')); process.exit(1); }
process.exit(0);
