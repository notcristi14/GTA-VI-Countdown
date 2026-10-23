# 🌴 Grand Theft Auto VI Countdown

Real-time, responsive countdown for **Grand Theft Auto VI** with regional unlock times — plus a **C++ desktop shell** that embeds the live site.

🚀 **Live Demo:** [gta-vi-countdown.onrender.com](https://gta-vi-countdown.onrender.com/)  
🌍 **Eastern Europe:** [gta-vi-countdown.onrender.com/eastern-europe](https://gta-vi-countdown.onrender.com/eastern-europe)

---

## 💻 Desktop app (C++)

**GTA VI Countdown** — native **Win32 + WebView2** wrapper. Loads the live site inside the window (default: Eastern Europe).

| | |
|--|--|
| **App name** | GTA VI Countdown |
| **Folder** | [`launcher/`](launcher/) |
| **Icon** | [`launcher/assets/GtaLogo.ico`](launcher/assets/GtaLogo.ico) |
| **Home URL** | https://gta-vi-countdown.onrender.com/eastern-europe |
| **Open in VS** | [`launcher/GtaViCountdown.sln`](launcher/GtaViCountdown.sln) |
| **Toolbar** | Back · Forward · Home · Refresh (flat, no white border) |
| **Links** | Open inside the app |

### Visual Studio 2022

1. Open `launcher/GtaViCountdown.sln`
2. Restore NuGet packages (automatic or right-click solution → Restore)
3. **Release | x64** → Build Solution (`Ctrl+Shift+B`)
4. Run: `launcher/bin/x64/Release/GtaViCountdown.exe`

Requirements: VS 2022 (**Desktop development with C++**), [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/).

See [launcher/README.md](launcher/README.md).

---

## ✨ Site features

- **Release line** – “Releasing November 19, 2026”. Title `GTA VI Countdown - {region}`.
- **Regional countdowns** – Official store unlock windows (e.g. `/eastern-europe`).
- **Live countdown** – Digit reels, continuous seconds, progress under Secs.
- **Platform badges** – PS5 / Xbox pre-order; static at countdown zero.
- **Watch Trailers** – Official Rockstar YouTube embeds, sorted **newest → oldest**.
  - Publish dates come from a seeded map (`KNOWN_PUBLISHED_AT` in `app.js`) for known IDs — **no per-video `youtube.com/watch` scraping** (avoids YouTube 429 rate-limit log spam).
  - Rockstar channel search still runs on a **30-minute** cache (`/api/trailers`) to discover new GTA VI videos; new IDs without a seed date use relative time text only for labels.
  - Seeded dates (UTC day): Trailer 1 `2023-12-04`, Trailer 2 `2025-05-06`, Cover Art `2026-06-18`, Extended Look `2026-08-28` (YouTube window), Launch Trailer `2026-10-15`.
- **Commit history / repo stats** – GitHub panel + stars/forks/watchers/issues. **`/api/repo` auto-checks GitHub every 60s** (server background refresh + client poll); response includes `checkedAt`. GitHub calls go through [`github-api.js`](github-api.js) and use **`GITHUB_TOKEN`** when set.
- **Welcome lights** – Vice City neon (CSS only, no audio).
- **License + vibecoded** – Footer disclaimer.

---

## 📁 Structure

```text
├── gta-vi-countdown.html
├── app.js                 # Express app, trailers, GA, routes
├── github-api.js          # GitHub fetch + optional GITHUB_TOKEN auth
├── bgs/
├── logo.png
├── launcher/
│   ├── GtaViCountdown.sln      # Open this in Visual Studio
│   ├── GtaViCountdown.vcxproj
│   ├── packages.config         # WebView2 NuGet
│   ├── assets/GtaLogo.ico      # GTA VI logo (exe icon)
│   └── src/
├── package.json
└── README.md
```

---

## 🛠️ Web stack

```bash
npm install
npm start
```

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express (`app.js` + `github-api.js`)
- Desktop: C++ (Win32 + WebView2) via Visual Studio

### Notable API endpoints

| Endpoint | Cache | Notes |
|----------|-------|--------|
| `/api/trailers` | 30 min | Seeded `publishedAt` + Rockstar channel discovery; sort `publishedAt-desc` |
| `/api/repo` | 60 s | Background refresh via `github-api.js`; includes `checkedAt` |
| `/api/commits` | 60 s | Recent commit list |
| `/api/commit` | 60 s | Latest commit card |
| `/api/stats` | 30 s | GA4 when env is set; UI hides panel if unavailable |

### Environment variables (Render)

| Variable | Required | Purpose |
|----------|----------|--------|
| **`GITHUB_TOKEN`** (or `GH_TOKEN`) | Recommended | Authenticated GitHub API (~5,000/hr). Without it, unauthenticated **60/hr per shared IP** often returns **403** on Render. Classic PAT with `public_repo`, or fine-grained **Contents: Read** on this repo. |
| `GA_PROPERTY_ID` | Optional | Google Analytics 4 property id (numeric) |
| `GA_CLIENT_EMAIL` | Optional | GA service account email |
| `GA_PRIVATE_KEY` | Optional | GA service account private key |

On startup the server logs whether `GITHUB_TOKEN` is present. GitHub **403** and GA **ETIMEDOUT** messages are throttled to about once per hour so logs stay readable.

---

## License

Fan-made countdown. Grand Theft Auto, Rockstar Games and related marks are trademarks of Take-Two Interactive. Not affiliated with or endorsed by Rockstar Games / Take-Two.
