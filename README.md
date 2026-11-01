# 🌴 Grand Theft Auto VI Countdown

Real-time, responsive countdown for **Grand Theft Auto VI** with regional unlock times — plus official trailers, full playable soundtrack panel, live GitHub data, Rockstar Newswire, and a **C++ desktop shell** that embeds the live site.

🚀 **Live Demo:** [gta-vi-countdown.onrender.com](https://gta-vi-countdown.onrender.com/)  
🌍 **Eastern Europe:** [gta-vi-countdown.onrender.com/eastern-europe](https://gta-vi-countdown.onrender.com/eastern-europe)

---

## ✨ Features (complete)

### Countdown & regions
- **Release line** — Subtitle: “Releasing November 19, 2026”. Document title: `GTA VI Countdown - {region}`.
- **Regional unlock targets** — Fixed **UTC** instants (DST clock changes do not shift remaining time). Includes Eastern Europe / Romania (`/eastern-europe`), Europe, US, Asia, Oceania, and more.
- **Smooth digit reels** — Rolling numbers via `requestAnimationFrame`, continuous seconds, progress bar under Secs.
- **Available now** — When the timer hits zero (even if you stay on the page), the UI switches to **Available now**, hides pre-order chrome, and makes PS5 / Xbox badges static (no pre-order links) for that region.
- **Welcome lights** — GTA VI / Vice City neon wash (pink, magenta, cyan, sunset), continuous CSS pulse, **no audio**.

### Platforms & commerce
- **PS5 / Xbox Series X|S badges** — Link to official pre-order pages until that region’s countdown reaches zero; become static at zero.
- **Pre-Order button** — Platform picker overlay (PlayStation / Xbox).
- **Netflix** — Link to *An Extended Look* on Netflix (kept alongside other media).

### Trailers
- **Watch Trailers** — In-page YouTube embeds of official Rockstar GTA VI videos.
- Sorted **newest → oldest** by real publish dates (`KNOWN_PUBLISHED_AT` seeds; no per-video watch-page scrape — avoids YouTube **429** log spam).
- Rockstar channel discovery every **30 minutes** (`/api/trailers`) with **server background refresh** + on-demand cache; merges new finds with seeds.
- Seeded dates (UTC): Trailer 1 `2023-12-04`, Trailer 2 `2025-05-06`, Cover Art `2026-06-18`, Extended Look `2026-08-28`, Launch Trailer `2026-10-15`.
- Smooth tab switch animation; “Open on YouTube” link.

### Music (soundtrack) — every released song playable + auto-discovery
- **Play Music** — Neon panel matching site design; **official Spotify embeds** only (no pirated audio).
- **Auto-check for new tracks** — Server scrapes the official Spotify album embed (`Grand Theft Auto VI: The Album`, id `5BYKG4MHfySZthe2W6r7n4`) every **30 minutes**, merges any newly playable singles into the list, and exposes them via **`/api/music`**. Client also polls every 30 minutes and on tab focus.
- Seeded released singles (always present even if discovery fails):
  1. **That’s It** — Yung Lean feat. Future & Metro Boomin
  2. **RHYNO** — Travis Scott (prod. Guy-Manuel de Homem-Christo)
  3. **Sexy Magic** — CA7RIEL & Paco Amoroso, PinkPantheress, Fred again.. & Étienne de Crécy
  4. **Flower in a Hurricane** — Justice feat. Tame Impala, SZA & King Gizzard
  5. **Last Thing You Need** — Morgan Wallen
  6. **Suzuki** — Fuerza Regida
  7. **Macacoa 2000** — Rauw Alejandro
  8. **Don’t Chart** — Cardi B
  9. **Bright Lights, Big City** — Keith Richards
- **Score preview** — **Pusher** (Justice feat. Gesaffelstein) from the Original Score.
- **Full album embed** — Spotify album player; remaining placeholder tracks unlock when the album releases **Nov 19, 2026** (34 tracks total).
- New playable album tracks discovered after a single drop are added automatically (no redeploy required).
- Scrollable tab strip, smooth switch animation, “Open on Spotify” link, Escape / click-outside to close.
- Radio station full playlists are not mirrored (licensed in-game only).

### GitHub & project meta
- **Latest commit card** — Opens that commit on GitHub when pressed.
- **Commit history panel** — Recent commits list (scrollable).
- **Repo stats** — Stars, forks, watchers, issues, language; **`/api/repo` background refresh every 60s** + client poll; `checkedAt` in response.
- Optional **`GITHUB_TOKEN`** / **`GH_TOKEN`** on the server for authenticated GitHub rate limits (avoids **403** on shared Render IPs).

### News & analytics
- **Rockstar Newswire** — Live feed via `/api/news`.
- **GA4 stats** (optional) — `/api/stats` when `GA_PROPERTY_ID`, `GA_CLIENT_EMAIL`, `GA_PRIVATE_KEY` are set; UI hides when unavailable.

### License & vibecoded
- Footer license + **100% vibecoded — built fully with AI.**

---

## 💻 Desktop app (C++)

See [`launcher/`](launcher/) — Win32 + WebView2, loads the live Eastern Europe URL, owner-drawn toolbar, in-app links, GTA VI exe icon.

---

## API caches

| Endpoint | Interval | Notes |
|----------|----------|-------|
| `/api/trailers` | 30 min | Seeded dates + Rockstar discovery; **background refresh**; `publishedAt-desc` |
| `/api/music` | 30 min | Spotify album embed discovery; **background refresh**; seeds + new playable tracks |
| `/api/repo` | 60 s | Background refresh; `checkedAt` |
| `/api/commits` | 60 s | Recent commits |
| `/api/commit` | 60 s | Latest commit |
| `/api/news` | 30 s | Newswire |
| `/api/stats` | 30 s | GA4 if configured |

---

## Project layout

```
├── app.js                  # Express API + discovery jobs
├── gta-vi-countdown.html  # Main UI
├── music.js                # Music panel (seeds + /api/music auto-discovery)
├── music.css
├── github-api.js
├── launcher/               # C++ WebView2 desktop shell
└── README.md
```

## License

See site footer / repo license notice.
