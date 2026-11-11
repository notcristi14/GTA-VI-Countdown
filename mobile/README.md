# VI Countdown — mobile apps

Native WebView shells for the live GTA VI countdown site.

**Home URL:** [https://gta-vi-countdown.onrender.com/](https://gta-vi-countdown.onrender.com/)

| Platform | Stack | ID |
|----------|--------|-----|
| **Android** | Kotlin + `WebView` + Gradle **8.7** | `com.notcristi.vicountdown` |
| **iOS** | Swift + `WKWebView` + Xcode | `com.notcristi.vicountdown` |

**Display name:** VI Countdown

### Behavior (both platforms)

- Loads the live site at the home URL above (pick region on the page)
- Navigation to `gta-vi-countdown.onrender.com` stays **in-app**
- Official embeds (Spotify `/embed`, YouTube `/embed`) stay **in-app**
- All other links open in the **system browser** (Chrome / Safari)
- App icons generated from the repo `logo.png` (see `generate_icons.sh`)

---

## Android

### Requirements

- **JDK 17**
- **Android SDK**
- Copy `local.properties.example` → `local.properties` and set `sdk.dir=...`  
  (Windows example: `sdk.dir=C\:\\Users\\You\\AppData\\Local\\Android\\Sdk`)

### Build APK

**Windows**

```bat
cd mobile\android
gradlew.bat assembleDebug
gradlew.bat assembleRelease
```

**macOS / Linux**

```bash
cd mobile/android
./gradlew assembleDebug
./gradlew assembleRelease
```

| Build | Output |
|-------|--------|
| Debug | `app/build/outputs/apk/debug/app-debug.apk` |
| Release | `app/build/outputs/apk/release/app-release.apk` |

Release uses the debug keystore by default (fine for personal installs). For Play Store, add your own signing config in `app/build.gradle`.

### Sources

```
mobile/android/
  app/src/main/kotlin/com/notcristi/vicountdown/MainActivity.kt
  app/src/main/AndroidManifest.xml
  app/src/main/res/mipmap-*/          # launcher icons
  gradlew / gradlew.bat
```

---

## iOS

### Requirements

- **macOS** + **Xcode 15+**
- Apple ID (free account works for device install; paid team for App Store / longer profiles)

### Build in Xcode

1. Open `mobile/ios/VICountdown.xcodeproj`
2. **Signing & Capabilities** → select your Team
3. Select your iPhone (or a simulator) → **Run**
4. For an IPA: **Product → Archive** → **Distribute App**

### Install with Sideloadly (Windows / macOS)

Use a release IPA (e.g. [ios-v1.0.0 / gta-countdown.ipa](https://github.com/notcristi14/GTA-VI-Countdown/releases/download/ios-v1.0.0/gta-countdown.ipa)) or one you exported from Xcode.

1. Install [Sideloadly](https://sideloadly.io/)
2. Connect the iPhone by USB → unlock → **Trust**
3. Drag the `.ipa` into Sideloadly
4. Sign in with your Apple ID → **Start**
5. On the phone: **Settings → General → VPN & Device Management** → trust the developer profile
6. Open **VI Countdown**

Notes:

- Free Apple ID signing lasts about **7 days**, then re-sign with Sideloadly
- If you hit the free app limit, remove other free-signed apps first
- Keep the phone unlocked until install finishes

### Sources

```
mobile/ios/
  VICountdown.xcodeproj/
  VICountdown/
    AppDelegate.swift
    SceneDelegate.swift
    ViewController.swift    # WKWebView + link policy
    Info.plist
    Assets.xcassets/        # AppIcon-1024.png
```

---

## Icons

Source logo: `mobile/assets/logo.png` (copied from repo-root `logo.png` when generating).

```bash
# From repo root (needs ImageMagick)
./mobile/generate_icons.sh
```

Writes iOS `AppIcon-1024.png` (`Assets.xcassets/AppIcon.appiconset/`) and Android `mipmap-*` icons from that logo.

---

## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two. Grand Theft Auto and related marks are trademarks of their respective owners.

<!-- AUTO-GENERATED: mobile-config-facts -->
### Mobile home URL (integrity)

| Shell | Expected | Actual (source) | Match |
|-------|----------|-----------------|-------|
| Android `HOME_URL` | `https://gta-vi-countdown.onrender.com/` | `https://gta-vi-countdown.onrender.com/` | yes |
| iOS `homeURL` | `https://gta-vi-countdown.onrender.com/` | `https://gta-vi-countdown.onrender.com/` | yes |

Intended mobile landing page is the **site root** (`/`). Regional paths such as `/eastern-europe` remain available in the web UI for all 15 countdown regions; they are not required as the native shell home URL.
If Match is **NO**, the native shell home URL does not match the intended root URL.
<!-- END AUTO-GENERATED: mobile-config-facts -->
<!-- AUTO-GENERATED: readme-integrity-check -->
## Automated integrity status

Last content update: **2026-11-11T08:35:57.358Z** · commit `dce25d9` · **63/63 passed** · mobile

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
| `readme-README_md` | README.md exists | PASS | present |
| `readme-mobile_README_md` | mobile/README.md exists | PASS | present |
| `readme-launcher_README_md` | launcher/README.md exists | PASS | present |
| `readme-launcher_assets_README_md` | launcher/assets/README.md exists | PASS | present |
| `readme-discovery` | At least one README.md discovered | PASS | 4 files: README.md, launcher/README.md, launcher/assets/README.md, mobile/README.md |
| `doc-audit-clean` | Documentation audit: no missing/outdated deterministic issues | PASS | DOC_SPECS (21) + API claim scan clean |
### Documentation audit

No missing or outdated documentation findings from deterministic DOC_SPECS / API registration comparison.

*Static analysis only (`scripts/readme-integrity-check.js`). Documentation findings are deterministic DOC_SPECS + route checks — not full prose review. **Last content update** advances only when non-volatile generated content changes (volatile-only runs do not rewrite timestamps). Failures remain until source or documentation is fixed.*
<!-- END AUTO-GENERATED -->
