# 🌴 Grand Theft Auto VI Countdown

Real-time, responsive countdown for **Grand Theft Auto VI** with regional unlock times — plus official trailers, soundtrack playback, GitHub live data, and a **C++ desktop shell** that embeds the live site.

🚀 **Live Demo:** [gta-vi-countdown.onrender.com](https://gta-vi-countdown.onrender.com/)  
🌍 **Eastern Europe:** [gta-vi-countdown.onrender.com/eastern-europe](https://gta-vi-countdown.onrender.com/eastern-europe)

---

## ✨ Features (complete)

### Countdown & regions
- **Release line** — Subtitle: “Releasing November 19, 2026”. Document title: `GTA VI Countdown - {region}`.
- **Regional unlock targets** — Fixed **UTC** instants (DST clock changes do not shift remaining time). Includes Eastern Europe / Romania (`/eastern-europe`), Europe, US, Asia, Oceania, and more.
- **Smooth digit reels** — Rolling numbers, continuous seconds, progress bar under Secs.
- **Available now** — When the timer hits zero (even if you stay on the page), the UI switches to **Available now**, hides pre-order chrome, and makes PS5 / Xbox badges static (no pre-order links) for that region.
- **Welcome lights** — GTA VI / Vice City neon wash (pink, magenta, cyan, sunset), continuous CSS pulse, **no audio**.

### Platforms & commerce
- **PS5 / Xbox Series X|S badges** — Link to official pre-order pages until that region’s countdown reaches zero.
- **Pre-Order button** — Platform picker overlay (PlayStation / Xbox).
- **Netflix** — Link to *An Extended Look* on Netflix (kept alongside other media).

### Trailers
- **Watch Trailers** — In-page YouTube embeds of official Rockstar GTA VI videos.
- Sorted **newest → oldest** by real publish dates (`KNOWN_PUBLISHED_AT` seeds; no per-video watch-page scrape — avoids YouTube **429** log spam).
- Rockstar channel discovery every **30 minutes** (`/api/trailers`) merges new finds with seeds.
- Seeded dates (UTC): Trailer 1 `2023-12-04`, Trailer 2 `2025-05-06`, Cover Art `2026-06-18`, Extended Look `2026-08-28`, Launch Trailer `2026-10-15`.
- Smooth tab switch animation; “Open on YouTube” link.

### Music (soundtrack)
- **Play Music** — Panel matching site neon design; **official Spotify embeds** only (no pirated audio).
- **Released singles** from *Grand Theft Auto VI: The Album* (Atlantic / Rockstar), playable in-page:
  - That’s It — Yung Lean feat. Future & Metro Boomin  
  - RHYNO — Travis Scott  
  - Sexy Magic — CA7RIEL & Paco Amoroso, PinkPantheress, Fred again.. & Étienne de Crécy  
  - Flower in a Hurricane — Justice feat. Tame Impala, SZA & King Gizzard  
  - Last Thing You Need — Morgan Wallen  
  - Suzuki — Fuerza Regida  
  - Macacoa 2000 — Rauw Alejandro  
  - Don’t Chart — Cardi B  
- **Full album embed** — Spotify album player (`5BYKG4MHfySZthe2W6r7n4`); remaining tracks unlock when the album releases **Nov 19, 2026** (34 tracks total).
- Links out to Spotify and Rockstar’s VI hub. Radio station full playlists are not mirrored (licensed in-game only).

### GitHub & project meta
- **Latest commit card** — Opens that commit on GitHub when pressed.
- **Commit history panel** — Recent commits list (scrollable).
- **Repo stats** — Stars, forks, watchers, issues, language; **`/api/repo` background refresh every 60s** + client poll; `checkedAt` in response.
- **`github-api.js`** — Shared GitHub fetch with optional **`GITHUB_TOKEN`** / `GH_TOKEN` (recommended on Render to avoid **403** on shared IPs). 403 logs throttled ~1/hour.

### News, stats, UX
- **Rockstar Newswire** — Live feed via `/api/news`.
- **GA4 stats** (optional) — `/api/stats` when `GA_PROPERTY_ID`, `GA_CLIENT_EMAIL`, `GA_PRIVATE_KEY` are set; UI hides when unavailable.
- **Background gallery** — Vice City / Leonida art switcher, auto-rotate option.
- **FPS counter** toggle.
- **Shared button press** — Opacity/scale pulse on controls.
- **Footer** — License disclaimer + **“100% vibecoded — built fully with AI.”**

### Desktop launcher (C++)
- **Win32 + WebView2** app loads the live site (default Eastern Europe).
- Toolbar: Back · Forward · Home · Refresh (flat owner-draw, no white borders).
- Links stay **inside** the app (`NewWindowRequested`).
- **GtaLogo.ico** embedded as `.exe` icon.
- Build with **Visual Studio 2022** (`launcher/GtaViCountdown.sln`). See [launcher/README.md](launcher/README.md).

---

## 📁 Structure

```text
├── gta-vi-countdown.html   # Frontend UI
├── app.js                  # Express: regions APIs, trailers, news, GA
├── github-api.js           # GitHub API + GITHUB_TOKEN auth
├── bgs/                    # Background images
├── logo.png
├── launcher/               # C++ WebView2 desktop shell
│   ├── GtaViCountdown.sln
│   ├── assets/GtaLogo.ico
│   └── src/
├── package.json
└── README.md
```

---

## 🛠️ Run the web app

```bash
npm install
npm start
```

### API endpoints

| Endpoint | Cache | Notes |
|----------|-------|--------|
| `/api/trailers` | 30 min | Seeded dates + Rockstar discovery; `publishedAt-desc` |
| `/api/repo` | 60 s | Background refresh; `checkedAt` |
| `/api/commits` | 60 s | Recent commits |
| `/api/commit` | 60 s | Latest commit |
| `/api/news` | 30 s | Newswire |
| `/api/stats` | 30 s | GA4 if configured |

### Environment (Render)

| Variable | Purpose |
|----------|---------|
| **`GITHUB_TOKEN`** (or `GH_TOKEN`) | Authenticated GitHub (~5k/hr). Without it: 60/hr per IP → often **403** on Render. |
| `GA_PROPERTY_ID` / `GA_CLIENT_EMAIL` / `GA_PRIVATE_KEY` | Optional GA4 panel |

---

## License

Fan-made countdown. Grand Theft Auto, Rockstar Games and related marks are trademarks of Take-Two Interactive. Not affiliated with or endorsed by Rockstar Games / Take-Two. Soundtrack embeds use **official Spotify** players; all rights belong to their respective owners.
