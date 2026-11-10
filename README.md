# Grand Theft Auto VI Countdown

Real-time, regional GTA VI release countdown with trailers, soundtrack embeds, Rockstar Newswire, live GitHub project stats, artwork backgrounds, plus native **Android**, **iOS**, and **Windows** shells that load the live site.

**Live site:** [gta-vi-countdown.onrender.com](https://gta-vi-countdown.onrender.com/)  
**Example region path:** […/eastern-europe](https://gta-vi-countdown.onrender.com/eastern-europe)

> Core documentation is kept aligned with the repository by `scripts/readme-integrity-check.js` and workflow `readme-integrity.yml`.

---

## Features (implementation-verified)

### Countdown and regions

- **15 / 15** regional unlock targets with fixed **UTC** timestamps in `gta-vi-countdown.html`
- Default region when no path/preference: **Central Europe (`europe`)**
- URL path slug + `localStorage` key `gtaRegion` keep selection in sync
- Smooth digit animation via `requestAnimationFrame`
- **Available now** UI path when the selected region’s timer reaches zero

| Region slug | Label (from HTML) | Unlock (UTC) |
|-------------|-------------------|---------------|
| `new-zealand` | New Zealand | 2026-11-18T11:00:00Z |
| `australia` | Australia | 2026-11-18T13:00:00Z |
| `japan-korea` | Japan & South Korea | 2026-11-18T15:00:00Z |
| `asia-pacific` | Hong Kong, Taiwan, Singapore, Malaysia | 2026-11-18T16:00:00Z |
| `indonesia-thailand` | Indonesia & Thailand | 2026-11-18T17:00:00Z |
| `india` | India | 2026-11-18T18:30:00Z |
| `uae` | United Arab Emirates | 2026-11-18T20:00:00Z |
| `saudi-turkey` | Saudi Arabia & Turkey | 2026-11-18T21:00:00Z |
| `eastern-europe` | Eastern Europe / UTC+2 (Greece, Romania, Finland, Israel, South Africa, etc.) | 2026-11-18T22:00:00Z |
| `europe` | Central Europe (CET) | 2026-11-18T23:00:00Z |
| `uk` | United Kingdom, Ireland, Iceland, Portugal | 2026-11-19T00:00:00Z |
| `south-america` | Brazil, Argentina, Chile, Paraguay, Uruguay | 2026-11-19T03:00:00Z |
| `bolivia` | Bolivia | 2026-11-19T04:00:00Z |
| `us-canada` | United States, Canada + Colombia, Ecuador, Panama, Peru | 2026-11-19T05:00:00Z |
| `mexico` | Mexico & Central America | 2026-11-19T06:00:00Z |

### Trailers, music, news, GitHub

- **GET /api/trailers** — server route in `app.js` / discovery hooks; **30 minute** cache
- **GET /api/music** — `music-discovery.js` + client `music.js` / `music.css` (centered panel CSS); Spotify official embeds; **30 minute** cache
- **GET /api/news** — Newswire-style feed (**30s** cache)
- **GET /api/repo**, **/api/commits**, **/api/commit** — ~**60s** caches; optional **GITHUB_TOKEN** / **GH_TOKEN**
- **GET /api/stats** — optional GA4 when env is set

### Backgrounds and PWA

- Artwork under `bgs/` with **GET /api/backgrounds** (`backgrounds-api.js`, **6 hour** pack check)
- Workflow `sync-backgrounds.yml` can sync pack assets into the repo
- Inline **Web App Manifest** (`display: standalone`, theme `#1a0a2e`)
- **No service worker** in the current HTML (manifest-only installability)

### Native shells

| | Android | iOS |
|--|---------|-----|
| Home URL | `https://gta-vi-countdown.onrender.com/` | `https://gta-vi-countdown.onrender.com/` |
| Stack | Kotlin `WebView`, Gradle **8.7** (no Flutter) | Swift `WKWebView` |
| External links | System browser | System browser |

Details: [mobile/README.md](mobile/README.md) · Windows: [launcher/README.md](launcher/README.md)

---

## HTTP API (routes registered in source)

| Endpoint | Module |
|----------|--------|
| `/api/trailers` | `app.js` / `music-discovery.js` |
| `/api/music` | `music-discovery.js` |
| `/api/repo` | `app.js` |
| `/api/commits` | `app.js` |
| `/api/commit` | `app.js` |
| `/api/news` | `app.js` |
| `/api/stats` | `app.js` |
| `/api/backgrounds` | `backgrounds-api.js` |

```bash
npm install
npm start
```

---

## Documentation automation

Workflow **README integrity check** (`.github/workflows/readme-integrity.yml`):

- Schedule: every **4 hours** (`15 */4 * * *` UTC)
- Manual: `workflow_dispatch`
- On push to watched **source** paths (not README-only)
- Runs `node scripts/readme-integrity-check.js`
- Regenerates README files + `scripts/integrity-report.json`
- Commits/pushes **only if content changed**, message includes **`[skip ci]`** to avoid loops
- Uploads integrity report as a workflow artifact

---

## License

Fan-made countdown. Grand Theft Auto, Rockstar Games and related marks are trademarks of Take-Two Interactive. Not affiliated with or endorsed by Rockstar Games / Take-Two. Soundtrack embeds use official Spotify players; all rights belong to their respective owners.

<!-- AUTO-GENERATED: readme-integrity-check -->
## Automated integrity status

Last run: **2026-11-10T13:46:50.999Z** · commit `907f0d0` · **60/62 passed** · **2 critical failures** · root

Expected mobile home URL: `https://gta-vi-countdown.onrender.com/eastern-europe`  
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
| `android-home-url` | Android HOME_URL is https://gta-vi-countdown.onrender.com/eastern-europe | FAIL | actual="https://gta-vi-countdown.onrender.com/" expected="https://gta-vi-countdown.onrender.com/eastern-europe" |
| `android-webview` | Android uses android.webkit WebView | PASS | mobile/android/app/src/main/kotlin/com/notcristi/vicountdown/MainActivity.kt |
| `android-loadurl` | Android loadUrl(HOME_URL) | PASS | loadUrl(HOME_URL) |
| `android-external` | Android external links ACTION_VIEW | PASS | Intent.ACTION_VIEW |
| `android-host` | Android ALLOWED_HOST is site host | PASS | actual="gta-vi-countdown.onrender.com" |
| `android-pure-gradle` | Android Gradle has no Flutter plugin | PASS | pure Gradle |
| `android-gradle-ver` | Gradle wrapper 8.7 | PASS | actual=8.7 |
| `ios-home-url` | iOS homeURL is https://gta-vi-countdown.onrender.com/eastern-europe | FAIL | actual="https://gta-vi-countdown.onrender.com/" expected="https://gta-vi-countdown.onrender.com/eastern-europe" |
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
