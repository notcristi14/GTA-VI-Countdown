# VI Countdown — mobile apps

Native WebView shells for the live GTA VI countdown. **No Flutter.**

| Platform | Stack | Home URL | Build |
|----------|--------|----------|--------|
| **Android** | Kotlin + WebView + **Gradle 8.7** (AGP 8.6.0, Kotlin 1.9.24) | `https://gta-vi-countdown.onrender.com/` | `gradlew.bat assembleRelease` |
| **iOS** | Swift + **WKWebView** + Xcode | `https://gta-vi-countdown.onrender.com/` | Open `VICountdown.xcodeproj` → Archive |

Shared behavior (from source):

- Display name **VI Countdown** · Application ID / bundle **`com.notcristi.vicountdown`**
- Allowed in-app host: **`gta-vi-countdown.onrender.com`**
- Other links open in the **system browser**
- Theme **#1A0A2E**
- iOS app icon: **AppIcon-1024.png present**

---

## Android (Gradle only)

### Requirements

- JDK 17 · Android SDK
- `mobile/android/local.properties` → `sdk.dir=...` only

### Build APK (Windows)

```bat
cd mobile\android
gradlew.bat assembleDebug
gradlew.bat assembleRelease
```

| Build | Output |
|-------|--------|
| Debug | `app\build\outputs\apk\debug\app-debug.apk` |
| Release | `app\build\outputs\apk\release\app-release.apk` |

### Build APK (macOS / Linux)

```bash
cd mobile/android
./gradlew assembleRelease
```

**Source:** `mobile/android/app/src/main/kotlin/com/notcristi/vicountdown/MainActivity.kt`

---

## iOS (native Swift / Xcode)

### Requirements

- **macOS** + **Xcode 15+**

### Open & run

1. Open **`mobile/ios/VICountdown.xcodeproj`** in Xcode
2. Signing → Team
3. Run

### Build IPA

Product → Archive → Distribute App

**Source:** `mobile/ios/VICountdown/ViewController.swift`

---

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

Last run: **2026-11-10T14:07:37.728Z** · commit `0f90039` · **62/62 passed** · mobile

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
| `bgs-disk` | Background images on disk (bgs/) | PASS | 26 image files |
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

*Static analysis only (`scripts/readme-integrity-check.js`). Failures remain until source or expectations are fixed.*
<!-- END AUTO-GENERATED -->
## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two.
