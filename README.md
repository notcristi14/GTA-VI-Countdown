# 🌴 Grand Theft Auto VI Countdown

Real-time, responsive countdown for **Grand Theft Auto VI** with regional PlayStation Store / Xbox Store unlock times.

🚀 **Live Demo:** [gta-vi-countdown.onrender.com](https://gta-vi-countdown.onrender.com/)

---

## ✨ Features

- **Regional countdowns** – Exact local unlock times via routes (`/europe`, `/uk`, `/us-canada`, etc.)
- **Region switcher** – Dropdown to jump between all 15 official unlock windows
- **Remembers your region** – Selected timezone is saved in localStorage
- **Platform badges** – PlayStation 5 & Xbox Series X|S (store links are only in Pre-order)
- **Google Analytics** – gtag `G-QPLS07EN95` in `<head>`
- **Google Analytics stats on the page** – Visitors (active users), visits (sessions), and events from GA4 for the last 7 days. The stats bar stays on the page. Numbers fill in when GA4 responds; otherwise they stay blank. Cached **30 minutes** on the server; the page checks `/api/stats` every 30 seconds.
- **Pre-order** – Same style as the welcome Enter button (no outline) with a smooth hover animation; platform picker for PlayStation Store and Xbox; hides when that region is out
- **Watch on Netflix** – Official *GTA VI: An Extended Look* link ([netflix.com/GTAVI](https://www.netflix.com/GTAVI))
- **Rockstar Newswire** – Latest official news via `/api/news`, refreshed every 60s while the page is open
- **News toggle** – Show or hide the Newswire panel with a smooth fade/slide (saved in localStorage)
- **Rockstar R\*** – White mark in the same style as the X social icon
- **Official Rockstar socials** – Website, Support, X, Instagram, Facebook, YouTube, Discord, Twitch, Threads, TikTok, Support on X, Netflix
- **Rockstar Support** – Text button linking to support.rockstargames.com
- **Background switcher** – Cycles through 24 official Rockstar artworks in `bgs/` with a stacked 1.8s crossfade (stays smooth on fast clicks)
- **Default background** – Reset button returns to the main artwork
- **Auto background switch** – ON/OFF slideshow every 9 seconds, 1.8s crossfade, loops all 24 artworks, pauses when the tab is hidden
- **Remembers background** – Selected artwork is saved in localStorage
- **Welcome screen** – Enter button fades into the countdown on every visit, with visible red/blue police siren lights and sound
- **Vice City theme** – Neon glassmorphism UI, dark overlay, and official GTA VI logo
- **Fully responsive** – Mobile & desktop optimized
- **PWA-ready** – Favicons, theme color, web app manifest

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
├── app.js                  # Express server, /api/news, /api/stats, static files
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

The stats bar stays on the page. Numbers fill in when `source === "ga4"`. No mock numbers. Property ID is **never** taken from the query string. Results are cached **30 minutes** on the server. gtag `G-QPLS07EN95` only *sends* events; it is not the Data API Property ID.

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
