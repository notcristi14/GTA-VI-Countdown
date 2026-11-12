# GTA VI Countdown — C++ Desktop Launcher

Native **Windows C++** shell for the live countdown site. **WebView2** with a compact navigation toolbar. Links open inside the app.

**App name:** `GTA VI Countdown`  
**Home URL:** https://gta-vi-countdown.onrender.com/eastern-europe  
**Exe icon:** [`assets/GtaLogo.ico`](assets/GtaLogo.ico)

## Features

- Toolbar: **Back** · **Forward** · **Home** · **Refresh**
- Flat owner-drawn buttons (purple/pink, **no white system border**)
- Back/Forward enable only when history allows
- All links stay **in the app** (`target=_blank` / `window.open`)
- Keyboard: F5 refresh · Alt+Left/Right · Alt+Home
- **GTA VI logo** as `.exe` / taskbar icon
- Dark neon window chrome matching the site

Site content (countdown, trailers, repo stats) is served by the **live web app** on Render — not by this executable.

See the [root README](../README.md) for:

- Trailers (seeded publish dates, no watch-page scrape; 30 min background refresh)
- Music tracks auto-discovery via `/api/music` (30 min background refresh from Spotify album)
- `/api/repo` 60s auto-check
- **`GITHUB_TOKEN`** on the server (required to avoid GitHub **403** on shared Render IPs)
- Optional GA4 env vars

## Requirements

- Windows 10/11
- **Visual Studio 2022** with **Desktop development with C++**
- [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)

## Build

1. Open **`GtaViCountdown.sln`**
2. Restore NuGet packages
3. **Release | x64** → Build Solution
4. Run: `bin\x64\Release\GtaViCountdown.exe`
<!-- AUTO-GENERATED: readme-integrity-check -->
## Automated integrity status

Last content update: **2026-11-12T13:32:18.122Z** · commit `b816791` · **114/114 passed** · launcher

Expected mobile home URL: `https://gta-vi-countdown.onrender.com/`  
Android actual: `https://gta-vi-countdown.onrender.com/` · iOS actual: `https://gta-vi-countdown.onrender.com/`

| ID | Claim | Status | Detail |
|----|-------|--------|--------|
| `project-structure-inventory` | Complete project file/directory inventory generated | PASS | 220 files · 32 directories · 5 workflows |
| `project-structure-readme` | Root README Structure section is present | PASS | complete |
| `workflow-doc--github-workflows-desktop-build-release-yml` | Workflow documented: .github/workflows/desktop-build-release.yml | PASS | listed in root README Structure |
| `workflow-doc--github-workflows-ensure-gradle-wrapper-yml` | Workflow documented: .github/workflows/ensure-gradle-wrapper.yml | PASS | listed in root README Structure |
| `workflow-doc--github-workflows-ios-build-yml` | Workflow documented: .github/workflows/ios-build.yml | PASS | listed in root README Structure |
| `workflow-doc--github-workflows-readme-integrity-yml` | Workflow documented: .github/workflows/readme-integrity.yml | PASS | listed in root README Structure |
| `workflow-doc--github-workflows-sync-backgrounds-yml` | Workflow documented: .github/workflows/sync-backgrounds.yml | PASS | listed in root README Structure |
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
| `dyn-audit-coverage` | Dynamic audit analyzed all relevant changed files | PASS | status=complete analyzed=1 |
| `releases-api` | GitHub Releases API returned a valid release collection | PASS | 3 release(s) retrieved |
| `releases-published-count` | At least one published GitHub Release exists | PASS | 3 published release(s) |
| `release-desktop-v1_0_0-published` | Release desktop-v1.0.0 is published (not a draft) | PASS | draft=false; prerelease=false; published_at=2026-11-12T12:05:39Z |
| `release-desktop-v1_0_0-tag` | Release desktop-v1.0.0 points to an existing Git tag | PASS | tag ref resolves to commit 9c5dd99da15efd4f7726a282f7ec39cc2f7394e3 |
| `release-desktop-v1_0_0-asset-GTA-VI-Countdown-Windows-x64.zip-uploaded` | Release asset GTA-VI-Countdown-Windows-x64.zip is uploaded | PASS | state=uploaded |
| `release-desktop-v1_0_0-asset-GTA-VI-Countdown-Windows-x64.zip-size` | Release asset GTA-VI-Countdown-Windows-x64.zip has a non-zero size | PASS | 332892 bytes |
| `release-desktop-v1_0_0-asset-GTA-VI-Countdown-Windows-x64.zip-digest` | Release asset GTA-VI-Countdown-Windows-x64.zip exposes a SHA-256 digest | PASS | sha256:9471f0d1e67b55fa032224dee024dd3e16f67ecc45c9b77f581d3555e7291b00 |
| `release-desktop-v1_0_0-asset-GTA-VI-Countdown-Windows-x64.zip-url` | Release asset GTA-VI-Countdown-Windows-x64.zip has a valid GitHub download URL | PASS | https://github.com/notcristi14/GTA-VI-Countdown/releases/download/desktop-v1.0.0/GTA-VI-Countdown-Windows-x64.zip |
| `release-desktop-v1_0_0-asset-GTA-VI-Countdown-Windows-x64.zip-bytes` | Downloaded bytes for GTA-VI-Countdown-Windows-x64.zip match GitHub size and SHA-256 | PASS | downloaded=332892 bytes; API size=332892; digest=MATCH |
| `release-desktop-v1_0_0-assets` | Release desktop-v1.0.0 contains at least one downloadable asset | PASS | 1 asset(s) |
| `release-ios-v1_0_0-published` | Release ios-v1.0.0 is published (not a draft) | PASS | draft=false; prerelease=false; published_at=2026-11-05T12:09:26Z |
| `release-ios-v1_0_0-tag` | Release ios-v1.0.0 points to an existing Git tag | PASS | tag ref resolves to commit 4f09f049882af8a0f8168636af3cd7c220d06526 |
| `release-ios-v1_0_0-asset-gta-countdown.ipa-uploaded` | Release asset gta-countdown.ipa is uploaded | PASS | state=uploaded |
| `release-ios-v1_0_0-asset-gta-countdown.ipa-size` | Release asset gta-countdown.ipa has a non-zero size | PASS | 1654904 bytes |
| `release-ios-v1_0_0-asset-gta-countdown.ipa-digest` | Release asset gta-countdown.ipa exposes a SHA-256 digest | PASS | sha256:4e38a383e8f16bc43e0c00f94fd9d633a55d047004397f979d7cb2d5cc929a56 |
| `release-ios-v1_0_0-asset-gta-countdown.ipa-url` | Release asset gta-countdown.ipa has a valid GitHub download URL | PASS | https://github.com/notcristi14/GTA-VI-Countdown/releases/download/ios-v1.0.0/gta-countdown.ipa |
| `release-ios-v1_0_0-asset-gta-countdown.ipa-bytes` | Downloaded bytes for gta-countdown.ipa match GitHub size and SHA-256 | PASS | downloaded=1654904 bytes; API size=1654904; digest=MATCH |
| `release-ios-v1_0_0-assets` | Release ios-v1.0.0 contains at least one downloadable asset | PASS | 1 asset(s) |
| `release-android-v1_0_0-published` | Release android-v1.0.0 is published (not a draft) | PASS | draft=false; prerelease=false; published_at=2026-11-05T12:09:25Z |
| `release-android-v1_0_0-tag` | Release android-v1.0.0 points to an existing Git tag | PASS | tag ref resolves to commit 4f09f049882af8a0f8168636af3cd7c220d06526 |
| `release-android-v1_0_0-asset-app-debug.apk-uploaded` | Release asset app-debug.apk is uploaded | PASS | state=uploaded |
| `release-android-v1_0_0-asset-app-debug.apk-size` | Release asset app-debug.apk has a non-zero size | PASS | 3396767 bytes |
| `release-android-v1_0_0-asset-app-debug.apk-digest` | Release asset app-debug.apk exposes a SHA-256 digest | PASS | sha256:609f3dcab01e58ad54eb2e4acbb9a265c8f5ab82374e4b7bb0c41b1f3462d181 |
| `release-android-v1_0_0-asset-app-debug.apk-url` | Release asset app-debug.apk has a valid GitHub download URL | PASS | https://github.com/notcristi14/GTA-VI-Countdown/releases/download/android-v1.0.0/app-debug.apk |
| `release-android-v1_0_0-asset-app-debug.apk-bytes` | Downloaded bytes for app-debug.apk match GitHub size and SHA-256 | PASS | downloaded=3396767 bytes; API size=3396767; digest=MATCH |
| `release-android-v1_0_0-assets` | Release android-v1.0.0 contains at least one downloadable asset | PASS | 1 asset(s) |
| `expected-desktop-v1_0_0` | Expected Windows x64 release desktop-v1.0.0 exists | PASS | found |
| `expected-desktop-v1_0_0-asset` | Windows x64 release contains GTA-VI-Countdown-Windows-x64.zip | PASS | present |
| `expected-desktop-v1_0_0-type` | Windows x64 asset has expected content type | PASS | actual=application/zip; expected=application/zip |
| `expected-desktop-v1_0_0-release-state` | Windows x64 stable release is publicly published | PASS | draft=false; prerelease=false; published_at=2026-11-12T12:05:39Z |
| `expected-ios-v1_0_0` | Expected iOS release ios-v1.0.0 exists | PASS | found |
| `expected-ios-v1_0_0-asset` | iOS release contains gta-countdown.ipa | PASS | present |
| `expected-ios-v1_0_0-type` | iOS asset has expected content type | PASS | actual=application/octet-stream; expected=application/octet-stream |
| `expected-ios-v1_0_0-release-state` | iOS stable release is publicly published | PASS | draft=false; prerelease=false; published_at=2026-11-05T12:09:26Z |
| `expected-android-v1_0_0` | Expected Android release android-v1.0.0 exists | PASS | found |
| `expected-android-v1_0_0-asset` | Android release contains app-debug.apk | PASS | present |
| `expected-android-v1_0_0-type` | Android asset has expected content type | PASS | actual=application/vnd.android.package-archive; expected=application/vnd.android.package-archive |
| `expected-android-v1_0_0-release-state` | Android stable release is publicly published | PASS | draft=false; prerelease=false; published_at=2026-11-05T12:09:25Z |
### Documentation audit

No missing or outdated documentation findings from deterministic DOC_SPECS / API registration comparison.


### Project structure inventory

Repository inventory: **220 files** across **32 directories** · **4 README.md files** discovered recursively.

Workflow documentation: **5/5** current workflow files listed in the root README Structure section.

| Workflow file | Listed in root README |
|---|---|
| .github/workflows/desktop-build-release.yml | yes |
| .github/workflows/ensure-gradle-wrapper.yml | yes |
| .github/workflows/ios-build.yml | yes |
| .github/workflows/readme-integrity.yml | yes |
| .github/workflows/sync-backgrounds.yml | yes |


The complete file and directory inventory, including binary assets, is recorded in scripts/integrity-report.json. Cache/build directories and temporary OS files are excluded.


### GitHub Releases

| Platform | Tag | Audit | Assets |
|---|---|---|---:|
| Windows x64 | `desktop-v1.0.0` | bytes + SHA-256 verified | 1 asset(s) |
| iOS | `ios-v1.0.0` | bytes + SHA-256 verified | 1 asset(s) |
| Android | `android-v1.0.0` | bytes + SHA-256 verified | 1 asset(s) |

Release audit: **38/38 checks passed** · status: **success**. Downloadable assets are fetched and their byte size/SHA-256 are compared with GitHub metadata (assets above the 100 MiB safety limit are metadata-only).


### Dynamic change audit

Status: **complete** · changed files: 1 · analyzed: 1 · confirmed findings: 0 · potential risks: 0 · base `3f21a13`

*Static analysis plus dynamic Git-diff documentation impact audit (`scripts/readme-integrity-check.js` + `scripts/dynamic-doc-audit.js`). Dynamic findings are deterministic extractions — not full prose review. **Last content update** advances only when non-volatile generated content changes. Confirmed high/critical dynamic inconsistencies fail the job; potential risks do not.*
<!-- END AUTO-GENERATED -->
