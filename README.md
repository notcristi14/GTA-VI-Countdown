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
- ✅ **Available now!** — When the timer hits zero (even if you stay on the page), the UI switches to **Available now!**, hides pre-order chrome, and makes PS5 / Xbox badges static (no pre-order links) for that region.
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

### 📰 News & analytics
- 🗨️ **Rockstar Newswire** — Live feed via `/api/news` (GraphQL NewswireList, 30s cache); toggleable panel.
- 📊 **GA4 stats** (optional) — `/api/stats` when `GA_PROPERTY_ID`, `GA_CLIENT_EMAIL`, `GA_PRIVATE_KEY` are set; UI hides when unavailable. Site also uses GA measurement ID `G-QPLS07EN95` in the page head.

### 🖼️ Backgrounds & UX
- 🌆 **Background gallery** — **26** official Rockstar Artwork & Wallpapers landscapes in `bgs/` (postcards, Jason & Lucia key art including Lock & Load, characters, cover art, album art). Manual cycle, reset, and **auto-rotate** option (persisted in `localStorage`).
- 🔄 **Auto-check for new backgrounds** — Server `HEAD`s the official [Rockstar Artwork & Wallpapers zip](https://media-rockstargames-com.akamaized.net/VI/downloads/artwork_wallpapers/GTAVI_Artwork_Wallpapers.zip) every **6 hours**; status on `/api/backgrounds` (`rockstar.lastModified`, `changed`). Client polls the file list hourly so new files in `bgs/` appear without a full reload.
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
├── gta-vi-countdown.html   # Frontend UI (countdown, trailers, music, news, repo)
├── app.js                  # Express server + API routes + music/trailer discovery hooks
├── music-discovery.js      # /api/music + 30m Spotify album auto-check + trailer jobs
├── music.js / music.css    # Music panel UI
├── github-api.js           # GitHub API + GITHUB_TOKEN auth
├── backgrounds-api.js      # /api/backgrounds + Rockstar pack HEAD check
├── bgs/                    # Background images (26 official Rockstar landscapes)
├── logo.png                # Site / launcher logo
├── launcher/               # C++ WebView2 desktop shell
├── mobile/
│   ├── android/            # Kotlin WebView + Gradle 8.7
│   ├── ios/                # Swift WKWebView (VICountdown.xcodeproj)
│   ├── generate_icons.sh   # App icons from logo.png
│   └── README.md
├── .github/workflows/      # ensure-gradle-wrapper · ios-build
├── package.json
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
| 🗨️ `/api/news` | 30 s | Newswire |
| 📊 `/api/stats` | 30 s | GA4 if configured |
| 🖼️ `/api/backgrounds` | 6 h (pack) / live list | Files in `bgs/` + Rockstar zip HEAD metadata |

### 🔐 Environment (Render)

| Variable | Purpose |
| --- | --- |
| **`GITHUB_TOKEN`** (or `GH_TOKEN`) | Authenticated GitHub (~5k/hr). Without it: 60/hr per IP → often **403** on Render. |
| `GA_PROPERTY_ID` / `GA_CLIENT_EMAIL` / `GA_PRIVATE_KEY` | Optional GA4 panel |

---

## 📜 License

Fan-made countdown. Grand Theft Auto, Rockstar Games and related marks are trademarks of Take-Two Interactive. Not affiliated with or endorsed by Rockstar Games / Take-Two. Soundtrack embeds use **official Spotify** players; all rights belong to their respective owners.
