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

- 🎰 **Smooth digit reels** — Rolling numbers via `requestAnimationFrame`, continuous seconds, progress bare under Secs.
- ✅ **Available now** — When the timer hits zero (even if you stay on the page), the UI switches to **Available now**, hides pre-order chrome, and makes PS5 / Xbox badges static (no pre-order links) for that region.
- 💜 **Welcome screen** — GTA VI / Vice City neon wash (pink, magenta, cyan, sunset),

### 🎥 Trailers, music, news & live data
- 🎬 **Official trailers** — Seeded + Rockstar discovery; publishedAt-desc; background refresh.
- 🎵 **Music panel** — Spotify album embed discovery; seeds + new playable tracks; 30m auto-check.
- 💬 **Rockstar Newswire** — Live feed via `/api/news` (GraphQL NewswireList, 30s cache); toggleable panel.
- 📊 **GA4 stats** (optional) — `/api/stats` when `GA_PROPERTY_ID`, `GA_CLIENT_EMAIL`, `GA_PRIVATE_KEY` are set; UI hides when unavailable. Site also uses GA measurement ID `G-QPLS07EN95` in the page head.

### 🖼️ Backgrounds & UX
- 🌆 **Background gallery** — **24** Vice City / Leonida official artworks in `bgs/` (postcards, Jason & Lucia key art, characters, cover art, album art). Manual cycle, reset, and **auto-rotate** option (persisted in `localStorage`).
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

### 📱 Mobile apps — VI Countdown (native, no Flutter)
- 🤖 **Android** — Kotlin WebView under `mobile/android/` · **Gradle 8.7** only:
  - `cd mobile\android` → `gradlew.bat assembleRelease`
  - Output: `app/build/outputs/apk/release/app-release.apk`
  - **App icon** — GTA VI logo via `mobile/generate_icons.sh` (mipmap densities + round icon)
- 🍎 **iOS** — Swift **WKWebView** under `mobile/ios/` · open **`VICountdown.xcodeproj`** in Xcode → Run / Archive (IPA)
  - **App icon** — 1024×1024 AppIcon via `mobile/generate_icons.sh` (Assets.xcassets)
- 🏷️ Display name **VI Countdown** · ID `com.notcristi.vicountdown`
- 🔗 Eastern Europe URL; site host + official embeds stay in-app on both platforms; other links → system browser
- 📖 Full steps: [mobile/README.md](mobile/README.md)

---

## 📁 Structure

```
├── gta-vi-countdown.html   # Frontend UI (countdown, trailers, music, news, repo)
├── app.js                  # Express server + API routes + music/trailer discovery hooks
├── music-discovery.js      # /api/music + 30m Spotify album auto-check + trailer jobs
├── music.js / music.css    # Music panel UI
├── github-api.js           # GitHub API + GITHUB_TOKEN auth
├── bgs/                    # Background images (24 official-style artworks)
├── logo.png                # Site / launcher logo
├── launcher/               # C++ WebView2 desktop shell
├── mobile/
│   ├── android/            # Gradle/Kotlin WebView (gradlew.bat)
│   └── ios/                # Native Swift WKWebView (VICountdown.xcodeproj)
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
| 💬 `/api/news` | 30 s | Newswire |
| 📊 `/api/stats` | 30 s | GA4 if configured |

### 🔐 Environment (Render)

| Variable | Purpose |
| --- | --- |
| **`GITHUB_TOKEN`** (or `GH_TOKEN`) | Authenticated GitHub (~5k/hr). Without it: 60/hr per IP → often **403** on Render. |
| `GA_PROPERTY_ID` / `GA_CLIENT_EMAIL` / `GA_PRIVATE_KEY` | Optional GA4 panel |

---

## 📜 License

Fan-made countdown. Grand Theft Auto, Rockstar Games and related marks are trademarks of Take-Two Interactive. Not affiliated with or endorsed by Rockstar Games / Take-Two. Soundtrack embeds use **official Spotify** players; all rights belong to their respective owners.
