# 🌴 Grand Theft Auto VI Countdown

Real-time, responsive countdown for **Grand Theft Auto VI** with regional unlock times — plus official trailers, auto-updating soundtrack, live GitHub data, Rockstar Newswire, Vice City backgrounds, and a **C++ desktop shell** that embeds the live site.

🚀 **Live Demo:** [gta-vi-countdown.onrender.com](https://gta-vi-countdown.onrender.com/)  
🌍 **Eastern Europe:** [gta-vi-countdown.onrender.com/eastern-europe](https://gta-vi-countdown.onrender.com/eastern-europe)

---

## ✨ Features (complete)

### ⏱️ Countdown & regions
- 📅 **Release line** — Subtitle: “Releasing November 19, 2026” (with selected region name). Document title: `GTA VI Countdown - {region}`.
- 🌐 **15 regional unlock targets** — Fixed **UTC** instants (DST clock changes do not shift remaining time). Path slug + `localStorage` persistence; URL stays in sync with the selected region. Default when no path / saved preference: **Central Europe (`europe`)**. Launcher home URL uses **Eastern Europe**.

| Region slug | Label | Unlock (UTC) |
|-------------|-------|--------------|
| `new-zealand` | New Zealand | 2026-11-18 11:00 |
| `australia` | Australia | 2026-11-18 13:00 |
| `japan-korea` | Japan & South Korea | 2026-11-18 15:00 |
| `asia-pacific` | Hong Kong, Taiwan, Singapore, Malaysia | 2026-11-18 16:00 |
| `indonesia-thailand` | Indonesia & Thailand | 2026-11-18 17:00 |
| `india` | India | 2026-11-18 18:30 |
| `uae` | United Arab Emirates | 2026-11-18 20:00 |
| `saudi-turkey` | Saudi Arabia & Turkey | 2026-11-18 21:00 |
| `eastern-europe` | Eastern Europe / UTC+2 (Greece, Romania, Finland, Israel, South Africa, etc.) | 2026-11-18 22:00 |
| `europe` | Central Europe (CET) | 2026-11-18 23:00 |
| `uk` | United Kingdom, Ireland, Iceland, Portugal | 2026-11-19 00:00 |
| `south-america` | Brazil, Argentina, Chile, Paraguay, Uruguay | 2026-11-19 03:00 |
| `bolivia` | Bolivia | 2026-11-19 04:00 |
| `us-canada` | United States, Canada + Colombia, Ecuador, Panama, Peru | 2026-11-19 05:00 |
| `mexico` | Mexico & Central America | 2026-11-19 06:00 |

- 🎰 **Smooth digit reels** — Rolling numbers via `requestAnimationFrame`, continuous seconds, progress bar under Secs.
- ✅ **Available now** — When the timer hits zero (even if you stay on the page), the UI switches to **Available now**, hides pre-order chrome, and makes PS5 / Xbox badges static (no pre-order links) for that region.
- 💜 **Welcome screen** — GTA VI / Vice City neon wash (pink, magenta, cyan, sunset), continuous CSS pulse, logo, **no audio**.

### 🎮 Platforms & commerce
- 🕹️ **PS5 / Xbox Series X|S badges** — Link to official pre-order pages until that region’s countdown reaches zero; become static at zero.
- 🛒 **Pre-Order button** — Platform picker overlay (PlayStation / Xbox); Escape / click-outside to close.
- 📺 **Netflix** — Link to *An Extended Look* on Netflix (`netflix.com/GTAVI`).

### 🎬 Trailers
- ▶️ **Watch Trailers** — In-page YouTube embeds of official Rockstar GTA VI videos.
- 🆕 Sorted **newest → oldest** by real publish dates (`KNOWN_PUBLISHED_AT` seeds; no per-video watch-page scrape — avoids YouTube **429** log spam).
- 🔄 Rockstar channel discovery every **30 minutes** (`/api/trailers`) with **server background refresh** + on-demand cache; merges new finds with seeds.
- 📌 Seeded dates (UTC):
  - Trailer 1 — `2023-12-04` (`QdBZY2fkU-0`)
  - Trailer 2 — `2025-05-06` (`VQRLujxTm3c`)
  - Cover Art Reveal — `2026-06-18` (`EiQEBYDox_k`)
  - An Extended Look — `2026-08-28` (`tJbzMqJGH4k`)
  - Launch Trailer — `2026-10-15` (`icy-lhqJhMQ`)
- ✨ Smooth tab switch animation; “Open on YouTube” link; Escape / click-outside to close.

### 🎵 Music (soundtrack) — every released song playable + auto-discovery
- 🎧 **Play Music** — Compact neon panel centered on every screen (mobile + desktop); live **Days · Hrs · Mins · Secs** countdown to album unlock (Nov 19) with smooth digit-reel animation + second progress bar (matches main timer style); larger touch targets; **official Spotify embeds** only (no pirated audio).
- 🔎 **Auto-check for new tracks** — Server scrapes the official Spotify album embed (`Grand Theft Auto VI: The Album`, id `5BYKG4MHfySZthe2W6r7n4`) every **30 minutes**, merges any newly playable singles into the list, and exposes them via **`/api/music`**. Client also polls every 30 minutes and on tab focus (`visibilitychange`).
- 💿 Seeded released singles (always present even if discovery fails):
  1. **That’s It** — Yung Lean feat. Future & Metro Boomin
  2. **RHYNO** — Travis Scott (prod. Guy-Manuel de Homem-Christo)
  3. **Sexy Magic** — CA7RIEL & Paco Amoroso, PinkPantheress, Fred again.. & Étienne de Crécy
  4. **Flower in a Hurricane** — Justice feat. Tame Impala, SZA & King Gizzard
  5. **Last Thing You Need** — Morgan Wallen
  6. **Suzuki** — Fuerza Regida
  7. **Macacoa 2000** — Rauw Alejandro
  8. **Don’t Chart** — Cardi B
  9. **Bright Lights, Big City** — Keith Richards
- 🎹 **Score preview** — **Pusher** (Justice feat. Gesaffelstein) from the Original Score.
- 💿 **Full album embed** — Spotify album player; remaining placeholder tracks unlock when the album releases **Nov 19, 2026** (34 tracks total).
- 🪄 New playable album tracks discovered after a single drop are added automatically (no redeploy required).
- 📱 Scrollable tab strip, smooth switch animation, “Open on Spotify” link, Escape / click-outside to close.
- 📻 Radio station full playlists are not mirrored (licensed in-game only).

### 🐙 GitHub & project meta
- 📝 **Latest commit card** — Opens that commit on GitHub when pressed.
- 📜 **Commit history panel** — Recent commits list (scrollable, up to 15).
- ⭐ **Repo stats** — Stars, forks, watchers, issues, language; **`/api/repo` background refresh every 60s** + client poll; `checkedAt` in response.
- 🔑 Optional **`GITHUB_TOKEN`** / **`GH_TOKEN`** on the server for authenticated GitHub rate limits (avoids **403** on shared Render IPs).
- 📦 **GitHub Releases integrity audit** — `scripts/release-audit.js` checks the Windows, iOS, and Android release tags and assets, then downloads assets up to 100 MiB to verify their byte size and SHA-256 against GitHub metadata.
- 🗂️ **Complete project structure audit** — `scripts/project-structure-audit.js` inventories every repository file/directory (including binary assets) and checks that every GitHub Actions workflow is listed in the root README Structure tree.

### 📰 News & analytics
- 💬 **Rockstar Newswire** — Live feed via `/api/news` (GraphQL NewswireList, 30s cache); toggleable panel.
- 📊 **GA4 stats** (optional) — `/api/stats` when `GA_PROPERTY_ID`, `GA_CLIENT_EMAIL`, `GA_PRIVATE_KEY` are set; UI hides when unavailable. Site also uses GA measurement ID `G-QPLS07EN95` in the page head.

### 🖼️ Backgrounds & UX
- 🌆 **Background gallery** — Vice City / Leonida artworks in `bgs/` (multi-size variants: landscape / portrait / phone / tablet / square). **143 image files** on disk (not 143 unique scenes — many assets have several crops/sizes). Manual cycle, reset, and **auto-rotate** (persisted in `localStorage`). Served via **`/api/backgrounds`**; `scripts/sync-backgrounds.js` + `sync-backgrounds.yml` refresh the pack.
- 📈 **FPS counter** toggle (persisted).
- 👆 **Shared button press** — Opacity/scale pulse on controls (buttons, badges, social links).
- 🔗 **Social links** — Rockstar site, Support, X, Instagram, Facebook, YouTube (plus Rockstar Support on X).
- 📱 **PWA-ready** — Web App Manifest (standalone, theme colors, icons) for install on Android / desktop Chrome.
- 📄 **Footer** — License disclaimer + **“100% vibecoded — built fully with AI.”**

### 💻 Desktop launcher (C++)
- 🚪 **Win32 + WebView2** app loads the live site (default Eastern Europe).
- ⬅️ Toolbar: Back · Forward · Home · Refresh (flat owner-draw, no white borders).
- 🔗 Links stay **inside** the app (`NewWindowRequested`).
- 🎨 **GtaLogo.ico** embedded as .exe icon.
- 🛠️ Build with **Visual Studio 2022** (`launcher/GtaViCountdown.sln`). See [launcher/README.md](launcher/README.md).

### 📱 Mobile apps — VI Countdown (native)
- 🤖 **Android** — Kotlin + WebView · `mobile/android/` · **Gradle 8.7**
  - `cd mobile/android` → `./gradlew assembleRelease` (Windows: `gradlew.bat`)
  - APK: `app/build/outputs/apk/release/app-release.apk`
- 🍎 **iOS** — Swift + WKWebView · `mobile/ios/VICountdown.xcodeproj`
  - Xcode → Run / Archive · install via [Sideloadly](https://sideloadly.io/)
- 🏷️ **VI Countdown** · `com.notcristi.vicountdown`
- 🏠 [gta-vi-countdown.onrender.com](https://gta-vi-countdown.onrender.com/) (region picker on the site)
- 🔗 Site host + Spotify/YouTube embeds stay in-app; other links → system browser
- 🎨 Icons from `logo.png` (`mobile/generate_icons.sh`)
- 📖 [mobile/README.md](mobile/README.md)

---

## 📁 Structure

```
├── gta-vi-countdown.html      # Frontend UI (countdown, trailers, music, news, repo)
├── app.js                     # Express entry — routes, static, discovery hooks
├── music-discovery.js         # /api/music + trailer discovery (30 min jobs)
├── music.js / music.css       # Music panel UI (centered neon panel)
├── github-api.js              # GitHub API helpers + GITHUB_TOKEN / GH_TOKEN
├── backgrounds-api.js         # /api/backgrounds + pack registration
├── bgs/                       # Artwork pack (multi-size JPGs; 143 image files on disk)
├── logo.png                   # Site / app logo source
├── bg.jpeg                    # Fallback background
├── stats.json                 # Optional GA / stats snapshot
├── package.json               # npm start → node app.js (express)
├── scripts/
│   ├── readme-integrity-check.js
│   ├── project-structure-audit.js
│   ├── release-audit.js
│   ├── integrity-report.json
│   └── sync-backgrounds.js
├── test/
│   ├── release-audit.test.js
│   └── project-structure-audit.test.js
├── launcher/                  # Windows C++ WebView2 shell
│   ├── GtaViCountdown.sln
│   ├── src/                   # AppWindow.cpp, main.cpp, app.rc
│   └── assets/GtaLogo.ico
├── mobile/
│   ├── android/               # Kotlin WebView · Gradle 8.7 · gradlew / gradlew.bat
│   ├── ios/                   # Swift WKWebView · VICountdown.xcodeproj
│   ├── assets/logo.png
│   ├── generate_icons.sh
│   └── README.md
├── .github/workflows/
│   ├── readme-integrity.yml   # every 4h + on source push
│   ├── sync-backgrounds.yml
│   ├── ensure-gradle-wrapper.yml
│   ├── ios-build.yml
│   └── desktop-build-release.yml
└── README.md
```

---

## 🛠️ Run the web app

```bash
npm install
npm start
```

### 🔌 API endpoints

| Endpoint | Interval | Notes |
| --- | --- | --- |
| 🎬 `/api/trailers` | 30 min | Seeded dates + Rockstar discovery; **background refresh**; publishedAt-desc |
| 🎵 `/api/music` | 30 min | Spotify album embed discovery; **background refresh**; seeds + new playable tracks |
| ⭐ `/api/repo` | 60 s | Background refresh; checkedAt |
| 📜 `/api/commits` | 60 s | Recent commits |
| 📝 `/api/commit` | 60 s | Latest commit |
| 💬 `/api/news` | 30 s | Newswire |
| 📊 `/api/stats` | 30 s | GA4 if configured |
| 🖼️ `/api/backgrounds` | pack check | `backgrounds-api.js` |

### 🔐 Environment (Render)

| Variable | Purpose |
| --- | --- |
| **`GITHUB_TOKEN`** (or `GH_TOKEN`) | Authenticated GitHub (~5k/hr). Without it: 60/hr per IP → often **403** on Render. |
| `GITHUB_REPOSITORY` | GitHub Actions-provided `owner/repo` slug used by the Releases audit to inspect tags and downloadable assets. |
| `GA_PROPERTY_ID` / `GA_CLIENT_EMAIL` / `GA_PRIVATE_KEY` | Optional GA4 panel |

---

## 📜 License

Fan-made countdown. Grand Theft Auto, Rockstar Games and related marks are trademarks of Take-Two Interactive. Not affiliated with or endorsed by Rockstar Games / Take-Two. Soundtrack embeds use **official Spotify** players; all rights belong to their respective owners.
<!-- AUTO-GENERATED: readme-integrity-check -->
## Automated integrity status

Last content update: **2026-11-12T12:46:20.189Z** · commit `21a1b73` · **107/107 passed** · root

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


### GitHub Releases

| Platform | Tag | Audit | Assets |
|---|---|---|---:|
| Windows x64 | `desktop-v1.0.0` | bytes + SHA-256 verified | 1 asset(s) |
| iOS | `ios-v1.0.0` | bytes + SHA-256 verified | 1 asset(s) |
| Android | `android-v1.0.0` | bytes + SHA-256 verified | 1 asset(s) |

Release audit: **38/38 checks passed** · status: **success**. Downloadable assets are fetched and their byte size/SHA-256 are compared with GitHub metadata (assets above the 100 MiB safety limit are metadata-only).


### Dynamic change audit

Status: **complete** · changed files: 1 · analyzed: 1 · confirmed findings: 0 · potential risks: 0 · base `c3b1af0`

*Static analysis plus dynamic Git-diff documentation impact audit (`scripts/readme-integrity-check.js` + `scripts/dynamic-doc-audit.js`). Dynamic findings are deterministic extractions — not full prose review. **Last content update** advances only when non-volatile generated content changes. Confirmed high/critical dynamic inconsistencies fail the job; potential risks do not.*
<!-- END AUTO-GENERATED -->
