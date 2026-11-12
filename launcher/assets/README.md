# Launcher assets

| File | Role |
|------|------|
| **`GtaLogo.ico`** | GTA VI logo — Windows **executable icon** (taskbar, Explorer, Alt+Tab). Embedded via `src/app.rc` as `IDI_APPICON`. |

Do not remove `GtaLogo.ico` if you want a branded `.exe`.

Related docs:

- [launcher/README.md](../README.md) — build and toolbar
- [root README](../../README.md) — site features, `github-api.js`, **`GITHUB_TOKEN`** on Render
<!-- AUTO-GENERATED: readme-integrity-check -->
## Automated integrity status

Last content update: **2026-11-12T12:03:21.564Z** · commit `9c5dd99` · **69/70 passed** · **1 dynamic findings** · launcher/assets

Expected mobile home URL: `https://gta-vi-countdown.onrender.com/`  
Android actual: `https://gta-vi-countdown.onrender.com/` · iOS actual: `https://gta-vi-countdown.onrender.com/`

| ID | Claim | Status | Detail |
|----|-------|--------|--------|
| `file-html` | gta-vi-countdown.html exists | PASS | present |
| `file-app` | app.js Express entry exists | PASS | present |
| `regions-count` | All 15 region slug+UTC pairs in HTML | PASS | 15/15 implemented |
| `region-new-zealand` | Region new-zealand configured | PASS | 2026-11-18T11:00:00Z |
| `region-australia` | Region australia configured | PASS | 2026-11-18T13:00:00Z |
| `region-japan-korea` | Region japan-korea configured | PASS | 2026-11-18T15:00:00Z |
| `region-asia-pacific` | Region asia-pacific configured | PASS | 2026-11-18T16:00:00Z |
| `region-indonesia-thailand` | Region indonesia-thailand configured | PASS | 2026-11-18T17:00:00Z |
| `region-india` | Region india configured | PASS | 2026-11-18T18:30:00Z |
| `region-uae` | Region uae configured | PASS | 2026-11-18T20:00:00Z |
| `region-saudi-turkey` | Region saudi-turkey configured | PASS | 2026-11-18T21:00:00Z |
| `region-eastern-europe` | Region eastern-europe configured | PASS | 2026-11-18T22:00:00Z |
| `region-europe` | Region europe configured | PASS | 2026-11-18T23:00:00Z |
| `region-uk` | Region uk configured | PASS | 2026-11-19T00:00:00Z |
| `region-south-america` | Region south-america configured | PASS | 2026-11-19T03:00:00Z |
| `region-bolivia` | Region bolivia configured | PASS | 2026-11-19T04:00:00Z |
| `region-us-canada` | Region us-canada configured | PASS | 2026-11-19T05:00:00Z |
| `region-mexico` | Region mexico configured | PASS | 2026-11-19T06:00:00Z |
| `default-europe` | Default activeSlug is 'europe' | PASS | activeSlug = 'europe' |
| `region-persist` | Region path + localStorage gtaRegion | PASS | ok |
| `digit-reels` | requestAnimationFrame countdown | PASS | HTML |
| `available-now` | Available now UI string | PASS | present |
| `preorder` | Pre-order UI in HTML | PASS | present |
| `music-files` | music.js + music.css | PASS | files |
| `music-center` | Music panel CSS align-items:center | PASS | music.css |
| `music-discovery` | Spotify album discovery registered | PASS | music-discovery.js |
| `music-cache` | Music cache ~30 minutes | PASS | MUSIC_CACHE_MS |
| `trailers-cache` | Trailers cache ~30 minutes | PASS | TRAILERS_CACHE_MS |
| `bgs-job` | Backgrounds register + 6h check | PASS | backgrounds-api.js |
| `api-apitrailers` | Route registered /api/trailers | PASS | app.get found |
| `api-apimusic` | Route registered /api/music | PASS | app.get found |
| `api-apirepo` | Route registered /api/repo | PASS | app.get found |
| `api-apicommits` | Route registered /api/commits | PASS | app.get found |
| `api-apicommit` | Route registered /api/commit | PASS | app.get found |
| `api-apinews` | Route registered /api/news | PASS | app.get found |
| `api-apistats` | Route registered /api/stats | PASS | app.get found |
| `api-apibackgrounds` | Route registered /api/backgrounds | PASS | app.get found |
| `bgs-disk` | Background images on disk (bgs/) | PASS | 143 image files |
| `pwa-manifest` | Web App Manifest standalone | PASS | HTML |
| `no-service-worker` | No service worker (document honestly) | PASS | manifest-only PWA |
| `android-home-url` | Android HOME_URL is https://gta-vi-countdown.onrender.com/ | PASS | actual="https://gta-vi-countdown.onrender.com/" expected="https://gta-vi-countdown.onrender.com/" |
| `android-webview` | Android uses android.webkit WebView | PASS | mobile/android/app/src/main/kotlin/com/notcristi/vicountdown/MainActivity.kt |
| `android-loadurl` | Android loadUrl(HOME_URL) | PASS | loadUrl(HOME_URL) |
| `android-external` | Android external links ACTION_VIEW | PASS | Intent.ACTION_VIEW |
| `android-host` | Android ALLOWED_HOST is site host | PASS | actual="gta-vi-countdown.onrender.com" |
| `android-pure-gradle` | Android Gradle has no Flutter plugin | PASS | pure Gradle |
| `android-gradle-ver` | Gradle wrapper 8.7 | PASS | actual=8.7 |
| `ios-home-url` | iOS homeURL is https://gta-vi-countdown.onrender.com/ | PASS | actual="https://gta-vi-countdown.onrender.com/" expected="https://gta-vi-countdown.onrender.com/" |
| `ios-webview` | iOS uses WKWebView | PASS | mobile/ios/VICountdown/ViewController.swift |
| `ios-load` | iOS loads homeURL into WKWebView | PASS | webView.load(URLRequest(url: homeURL)) |
| `ios-external` | iOS external UIApplication.shared.open | PASS | present |
| `ios-host` | iOS allowedHost is site host | PASS | actual="gta-vi-countdown.onrender.com" |
| `ios-icon` | iOS AppIcon-1024.png present | PASS | present |
| `launcher-sln` | launcher/GtaViCountdown.sln exists | PASS | present |
| `launcher-webview2` | AppWindow.cpp WebView2 usage | PASS | launcher/src/AppWindow.cpp |
| `launcher-nav` | Launcher navigation chrome in AppWindow | PASS | nav patterns found |
| `launcher-ico` | launcher/assets/GtaLogo.ico exists | PASS | present |
| `readme-README_md-exists` | README.md exists and is readable | PASS | present |
| `readme-README_md-markers` | README.md has ordered AUTO-GENERATED integrity markers | PASS | markers ordered |
| `readme-launcher_README_md-exists` | launcher/README.md exists and is readable | PASS | present |
| `readme-launcher_README_md-markers` | launcher/README.md has ordered AUTO-GENERATED integrity markers | PASS | markers ordered |
| `readme-launcher_assets_README_md-exists` | launcher/assets/README.md exists and is readable | PASS | present |
| `readme-launcher_assets_README_md-markers` | launcher/assets/README.md has ordered AUTO-GENERATED integrity markers | PASS | markers ordered |
| `readme-mobile_README_md-exists` | mobile/README.md exists and is readable | PASS | present |
| `readme-mobile_README_md-markers` | mobile/README.md has ordered AUTO-GENERATED integrity markers | PASS | markers ordered |
| `readme-discovery` | At least one README.md discovered recursively | PASS | 4 files: README.md, launcher/README.md, launcher/assets/README.md, mobile/README.md |
| `readme-no-hardcoded-list` | README checks are driven by findReadmes() discovery | PASS | dynamic discovery of 4 README.md file(s) |
| `doc-audit-clean` | Documentation audit: no missing/outdated deterministic issues | PASS | DOC_SPECS (21) + API claim scan clean |
| `dyn-dyn-new-workflow-desktopbuildreleaseyml` | Dynamic doc impact: dyn-new-workflow-desktopbuildreleaseyml | FAIL | missing · README.md · Consider listing `desktop-build-release.yml` under .github/workflows in the root README. |
| `dyn-audit-coverage` | Dynamic audit analyzed all relevant changed files | PASS | status=complete analyzed=1 |
### Documentation audit

No missing or outdated documentation findings from deterministic DOC_SPECS / API registration comparison.


### Dynamic change audit

Status: **complete** · changed files: 1 · analyzed: 1 · confirmed findings: 0 · potential risks: 1 · base `ed590ed`

*Static analysis plus dynamic Git-diff documentation impact audit (`scripts/readme-integrity-check.js` + `scripts/dynamic-doc-audit.js`). Dynamic findings are deterministic extractions — not full prose review. **Last content update** advances only when non-volatile generated content changes. Confirmed high/critical dynamic inconsistencies fail the job; potential risks do not.*
<!-- END AUTO-GENERATED -->
