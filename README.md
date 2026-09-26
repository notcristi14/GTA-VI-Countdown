# 🌴 Grand Theft Auto VI Countdown

Real-time, responsive countdown for **Grand Theft Auto VI** with regional PlayStation Store / Xbox Store unlock times.

🚀 **Live Demo:** [gta-vi-countdown.onrender.com](https://gta-vi-countdown.onrender.com/)

---

## ✨ Features

- **Regional countdowns** – Exact local unlock times via routes (`/europe`, `/uk`, `/us-canada`, etc.)
- **Region switcher** – Dropdown to jump between all 15 official unlock windows
- **Remembers your region** – Selected timezone is saved in localStorage
- **Platform badges** – PlayStation 5 & Xbox Series X|S
- **Official Rockstar socials** – Website, X, Instagram, Facebook, YouTube, Discord, Twitch, Threads, TikTok, Support
- **Background switcher** – Single button cycles through 24 official Rockstar artworks (also remembered)
- **Vice City theme** – Neon glassmorphism UI with official GTA VI logo
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

## 📱 Official Rockstar Socials

- [Website](https://www.rockstargames.com/)
- [X](https://x.com/RockstarGames)
- [Instagram](https://www.instagram.com/rockstargames/)
- [Facebook](https://www.facebook.com/rockstargames)
- [YouTube](https://www.youtube.com/rockstargames)
- [Discord](https://discord.gg/rockstargames)
- [Twitch](https://www.twitch.tv/rockstargames)
- [Threads](https://www.threads.com/@rockstargames)
- [TikTok](https://www.tiktok.com/@rockstargames)
- [Support (X)](https://x.com/RockstarSupport)

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Flexbox, Clamp, Glassmorphism), Vanilla JS
- **Backend:** Node.js + Express
- **Hosting:** Render

---

## 📁 Project Structure

```
├── bgs/                    # Official Rockstar background artworks (24 images)
├── logo.png                # GTA VI logo
├── gta-vi-countdown.html   # Main app (HTML/CSS/JS)
├── server.js               # Express server + catch-all routes
├── package.json
└── README.md
```

---

## 🚀 Local Setup

```bash
npm install
npm start
```

Open http://localhost:3000 (or any region route, e.g. `/us-canada`).

---

## License

Fan-made countdown. Grand Theft Auto, Rockstar Games and related marks are trademarks of Take-Two Interactive. Not affiliated with or endorsed by Rockstar Games / Take-Two.
