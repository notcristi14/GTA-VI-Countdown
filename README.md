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
