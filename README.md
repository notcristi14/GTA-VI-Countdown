# 🌴 Grand Theft Auto VI Countdown

Real-time, responsive countdown for **Grand Theft Auto VI** with regional PlayStation Store / Xbox Store unlock times.

🚀 **Live Demo:** [gta-vi-countdown.onrender.com](https://gta-vi-countdown.onrender.com/)

---

## ✨ Features

- **Release line** – Subtitle reads “Releasing November 19, 2026”. The page title is `GTA VI Countdown - {region}`.
- **Regional countdowns** – 15 official PlayStation Store unlock windows. Each region has its own route (`/europe`, `/uk`, `/us-canada`, and the rest in the table below). The timer uses that region’s UTC target.
- **Region switcher** – Dropdown jumps between all 15 windows. A known path wins and is saved. Otherwise the saved region is restored and the URL is rewritten so it stays in sync.
- **Remembers your region** – `gtaRegion` in localStorage.
- **Live countdown** – Days, hours, minutes, and seconds, updated every 1 second.
- **Available now** – At that region’s unlock time the timer becomes “Available now”.
- **Platform badges** – PlayStation 5 and Xbox Series X|S. Store links are only in Pre-order.
- **Pre-order** – Enter-style button. Opens a platform picker for PlayStation Store and Xbox. Closes with Close, a backdrop click, or Escape. Hidden once that region is out.
- **Watch on Netflix** – Official *GTA VI: An Extended Look* ([netflix.com/GTAVI](https://www.netflix.com/GTAVI)), also in the social row.
- **Rockstar Newswire** – Up to 8 official posts from Rockstar’s Newswire GraphQL (`graph.rockstargames.com`, `NewswireList`). Not Google News. Each item shows date, tag, and title, and links to the article. “View all” opens the Newswire. If the feed fails, the panel links there instead.
- **News refresh** – Page polls `/api/news` every 60 seconds while the tab is visible, and once more when you return to the tab. Server cache is 30 seconds.
- **News toggle** – Show or hide the panel with a fade/slide. Saved as `gtaNewsHidden`.
- **Latest commit** – Card with the GitHub mark, message, short SHA, author, and local time. Loads on open and every 60 seconds from `/api/commit`, then the public GitHub API if that fails. The card is not a link.
- **GitHub** – Social icon links to https://github.com/notcristi14/GTA-VI-Countdown.
- **Rockstar R\*** – White mark in the same style as the X icon.
- **Official Rockstar socials** – Website, Support, X, Instagram, Facebook, YouTube, Discord, Twitch, Threads, TikTok, Support on X, Netflix.
- **Rockstar Support** – Text button to support.rockstargames.com, plus the support social icon.
- **Background switcher** – Cycles 24 official artworks in `bgs/` with a stacked 1.8s crossfade on three layers. Fast clicks stay smooth.
- **Default background** – Resets to `main.jpeg`.
- **Auto background switch** – ON/OFF slideshow every 9 seconds. Loops all 24. Pauses while the tab is hidden.
- **Remembers background** – `gtaBgIndex` and `gtaBgAuto` in localStorage.
- **Welcome screen** – Enter button on every visit. Fades into the countdown.
- **Siren** – Red/blue police lights and a looping two-tone sound until Enter. Sound stops when the gate closes.
- **Vice City theme** – Neon glassmorphism, dark overlay, official GTA VI logo.
- **Google Analytics** – gtag `G-QPLS07EN95` in `<head>`.
- **On-page stats** – Visitors, visits, and events from GA4 for the last 7 days. Shown only when GA4 is configured and responds. Page checks `/api/stats` every 30 seconds. Server cache is 30 seconds. Bar stays hidden if env vars are missing or the call fails.
- **FPS counter** – Fixed top-right readout. Samples frames every 0.5 seconds. **FPS: ON/OFF** eases color and scale (0.35s), fades the label, and fades the chip out. Saved as `gtaFps`.
- **Fully responsive** – Mobile and desktop.
- **PWA-ready** – Favicons, theme color, web app manifest.

---

## 🌐 Supported Regions

All 15 official PlayStation Store unlock windows:

| Route | Region | Unlock (UTC) |
| :--- | :--- | :--- |
| `/new-zealand` | New Zealand | Nov 18, 2026 · 11:00 |
| `/australia` | Australia | Nov 18, 2026 · 13:00 |
| `/japan-korea` | Japan & South Korea | Nov 18, 2026 · 15:00 |
| `/asia-pacific` | Hong Kong, Taiwan, Singapore, Malaysia | Nov 18, 2026 · 16:00 |
| `/indonesia-thailand` | Indonesia & Thailand | Nov 18, 2026 · 17:00 |
| `/india` | India | Nov 18, 2026 · 18:30 |
| `/uae` | United Arab Emirates | Nov 18, 2026 · 20:00 |
| `/saudi-turkey` | Saudi Arabia & Turkey | Nov 18, 2026 · 21:00 |
| `/eastern-europe` | Eastern Europe / UTC+2 | Nov 18, 2026 · 22:00 |
| `/` or `/europe` | Central Europe (CET) | Nov 18, 2026 · 23:00 |
| `/uk` | UK, Ireland, Iceland, Portugal | Nov 19, 2026 · 00:00 |
| `/south-america` | Brazil, Argentina, Chile, Paraguay, Uruguay | Nov 19, 2026 · 03:00 |
| `/bolivia` | Bolivia | Nov 19, 2026 · 04:00 |
| `/us-canada` | US, Canada + Colombia, Ecuador, Panama, Peru | Nov 19, 2026 · 05:00 |
| `/mexico` | Mexico & Central America | Nov 19, 2026 · 06:00 |

---

## 📱 Official Links

- [Website](https://www.rockstargames.com/)
- [Support](https://support.rockstargames.com/)
- [Newswire](https://www.rockstargames.com/newswire)
- [X](https://x.com/RockstarGames)
- [Instagram](https://www.instagram.com/rockstargames/)
- [Facebook](https://www.facebook.com/rockstargames)
- [YouTube](https://www.youtube.com/rockstargames)
- [Discord](https://discord.gg/rockstargames)
- [Twitch](https://www.twitch.tv/rockstargames)
- [Threads](https://www.threads.com/@rockstargames)
- [TikTok](https://www.tiktok.com/@rockstargames)
- [Support (X)](https://x.com/RockstarSupport)
- [Watch on Netflix](https://www.netflix.com/GTAVI)
- [PlayStation Store](https://store.playstation.com/en-us/product/EP1004-PPSA01547_00-GTAVISTANDARD001)
- [Xbox](https://www.xbox.com/en-US/games/grand-theft-auto-vi)

---

## ⚙️ Saved Preferences

These stay in the browser via localStorage:

- Selected region
- Selected background
- Auto background switch on/off
- News panel on/off
- FPS counter on/off

## News source

`/api/news` reads Rockstar’s official Newswire, not Google News.

- Endpoint: `https://graph.rockstargames.com` (`operationName=NewswireList`)
- Locale: `en_us`, page 1, 8 posts
- Each item: `title`, `date`, `category` (primary tag), `url` (`https://www.rockstargames.com` + post path)
- If the feed fails, the API returns `{ items: [], source: 'live' }` and the page links to the Newswire

To pick up this change on an existing deploy, replace `app.js` and restart the Node process. No HTML or env var changes.

---

## Website functions

### Page (`gta-vi-countdown.html`)

- **Welcome** – Full-screen enter gate. `startSiren()` plays a looping two-tone sawtooth sweep (620–980 Hz) until Enter. `hideWelcome()` stops the siren and fades the gate out.
- **Region select** – 15 unlock windows. A known path (`/uk`, `/us-canada`, …) wins and is saved. Otherwise the saved region is restored and the URL is rewritten with `history.replaceState`. Changing the dropdown saves `gtaRegion` and loads `/{slug}`. The document title becomes `GTA VI Countdown - {region}`.
- **Countdown (`tick`)** – Runs every 1 second against that region’s UTC target. Shows days, hours, minutes, seconds. At zero it replaces the timer with “Available now” and hides Pre-order.
- **Pre-order** – `openPreorder()` / `closePreorder()`. Overlay with PlayStation Store and Xbox links. Closes on the close button, backdrop click, or Escape. Hidden once that region’s unlock time has passed.
- **Backgrounds** – 24 files in `bgs/`, stacked on three layers. `setBg()` crossfades (1.8s) and saves `gtaBgIndex`. Switch Background cycles; Default Background resets to `main.jpeg`. Auto Switch runs every 9 seconds and pauses while the tab is hidden (`gtaBgAuto`).
- **News** – `loadNews()` fetches `/api/news` and `renderNews()` lists title, date, and tag. Polls every 60 seconds while the tab is visible, and once more when the tab becomes visible. Hide News / Show News uses `setNewsVisible()` and saves `gtaNewsHidden`.
- **Stats** – `loadStats()` every 30 seconds. Shows Visitors, Visits, and Events only when `/api/stats` returns GA4 numbers. Hides the bar if GA is not configured or the call fails.
- **Latest commit** – `loadCommit()` every 60 seconds. Uses `/api/commit`, then falls back to the public GitHub commits API. Card shows message, short SHA, author, and local time. Not a link; the GitHub icon is the repo link.
- **Socials** – Rockstar site, Support, X, Instagram, Facebook, YouTube, Discord, Twitch, Threads, TikTok, Support on X, Netflix, GitHub.
- **Watch on Netflix** – Link to the official extended look (`netflix.com/GTAVI`).
- **FPS counter** – Fixed top-right chip. Counts `requestAnimationFrame` frames and updates every 0.5 seconds. **FPS: ON/OFF** eases the button color and scale over 0.35s, fades the label, and fades and slides the chip out (0.4s). Saves `gtaFps`.

### Server (`app.js`)

- **`GET /api/news`** – Rockstar Newswire GraphQL. `parseNewswire()` maps posts to title, date, category, url. Cached 30 seconds. Empty list if the feed fails.
- **`GET /api/stats`** – GA4 Data API for the last 7 days (active users, sessions, events). Needs `GA_PROPERTY_ID`, `GA_CLIENT_EMAIL`, `GA_PRIVATE_KEY`. Cached 30 seconds. Returns `{ source: 'unavailable' }` if unset or the call fails, so the bar stays hidden.
- **`GET /api/commit`** – Latest commit on `notcristi14/GTA-VI-Countdown`. Cached 60 seconds. Serves the last good payload if GitHub fails.
- **`GET *`** – Serves `gta-vi-countdown.html` for every region path. Static files (`bgs/`, `logo.png`, `bg.jpeg`) are served first.
- **Port** – `PORT` or 3000.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Flexbox, Clamp, Glassmorphism), Vanilla JS
- **Backend:** Node.js + Express (`/api/news` + catch-all region routes)
- **Hosting:** Render

---

## 📁 Project Structure

```
├── bgs/                    # All 24 official GTA VI background artworks
├── logo.png                # Official GTA VI logo
├── bg.jpeg                 # Default/main cover artwork
├── gta-vi-countdown.html   # Welcome screen, countdown, news, stats UI
├── app.js                  # Express server, Rockstar Newswire /api/news, /api/stats, static files
├── stats.json              # Optional local counter file
├── package.json            # npm config; start script runs node app.js
└── README.md               # Features, setup, regions, GA env vars, license
```

---

## 🚀 Local Setup

Node.js is required to run the web server.

### 1. Install Node.js

Download the LTS build from [https://nodejs.org](https://nodejs.org) or use a package manager:

**Windows**
1. Go to [nodejs.org](https://nodejs.org)
2. Download the **LTS** installer
3. Run it and keep the defaults (this also installs `npm`)
4. Open a new Command Prompt / PowerShell and check:

```bash
node -v
npm -v
```

**macOS**
```bash
# Homebrew
brew install node
```

Or download the LTS installer from [nodejs.org](https://nodejs.org).

**Linux (Debian / Ubuntu)**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Confirm:

```bash
node -v
npm -v
```

You need Node.js 18 or newer.

### 2. Run the site

```bash
npm install
npm start
```

This runs `node app.js`.

You should see:

```
🌴  GTA VI Countdown
🚗  Running at http://localhost:3000
🎮  Regions, Newswire & Vice City backgrounds ready
```

Open http://localhost:3000 (or any region route, e.g. `/us-canada`).

---



## Show Google Analytics stats on the page

Backend: Express in `app.js`. `GET /api/stats` reads **GA4 Data API** for the last 7 days.

| Field | GA4 metric |
| :--- | :--- |
| `visitors` | `activeUsers` |
| `visits` | `sessions` |
| `events` | `eventCount` |

Success:

```json
{ "source": "ga4", "visitors": 6, "visits": 10, "events": 125 }
```

If env vars are missing or GA4 fails:

```json
{ "source": "unavailable" }
```

The stats bar is shown only when `source === "ga4"`. No mock numbers. Property ID is **never** taken from the query string. Results are cached **30 seconds** on the server. gtag `G-QPLS07EN95` only *sends* events; it is not the Data API Property ID.

### 1. Google Cloud
1. [Google Cloud Console](https://console.cloud.google.com/)
2. Project with **No organization** if key creation is blocked
3. Enable **Google Analytics Data API**
4. **Credentials → Service account → Keys → JSON**

### 2. Google Analytics
1. From the JSON: `client_email` and `private_key`
2. Analytics → **Admin → Property access management**
3. Add `client_email` as **Viewer** (not Render’s `render@...` email)
4. **Admin → Property settings → Property ID** (9–10 digits)  
   Never use Measurement ID `G-QPLS07EN95`

### 3. Render env vars
**Environment → Add**, then redeploy:

```
GA_PROPERTY_ID=123456789
GA_CLIENT_EMAIL=name@your-project.iam.gserviceaccount.com
GA_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n
```

Keep `\n` in the private key. No extra npm packages.

### 4. Test
Local: `GA_PROPERTY_ID=... GA_CLIENT_EMAIL=... GA_PRIVATE_KEY=... npm start` then `curl http://localhost:3000/api/stats`  
Render: open `https://gta-vi-countdown.onrender.com/api/stats` — must be `"source":"ga4"` for chips to show. Logs: `GA4 token obtained` / `GA4 stats request succeeded` / `GA4 stats request failed:` (no secrets).

## License

Fan-made countdown. Grand Theft Auto, Rockstar Games and related marks are trademarks of Take-Two Interactive. Not affiliated with or endorsed by Rockstar Games / Take-Two.
