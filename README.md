# 🌴 Grand Theft Auto VI Countdown

Real-time, responsive countdown for **Grand Theft Auto VI** with regional PlayStation Store / Xbox Store unlock times.

🚀 **Live Demo:** [gta-vi-countdown.onrender.com](https://gta-vi-countdown.onrender.com/)

---

## ✨ Features

- **Regional countdowns** – Exact local unlock times via routes (`/europe`, `/uk`, `/us-canada`, etc.)
- **Region switcher** – Dropdown to jump between regions instantly
- **Platform badges** – PlayStation 5 & Xbox Series X|S
- **Official Rockstar socials** – Website, X, Instagram, Facebook, YouTube, Discord, Twitch, Threads, TikTok, Support
- **Vice City theme** – Neon glassmorphism UI, official logo, sunset artwork background
- **Fully responsive** – Mobile & desktop optimized
- **PWA-ready** – Favicons, theme color, web app manifest

---

## 🌐 Supported Regions

| Route | Region | Unlock (UTC) |
| :--- | :--- | :--- |
| `/` or `/europe` | Central Europe (CET) | Nov 18, 2026 · 23:00 |
| `/uk` | United Kingdom & Ireland | Nov 19, 2026 · 00:00 |
| `/us-canada` | United States & Canada | Nov 19, 2026 · 05:00 |
| `/new-zealand` | New Zealand | Nov 18, 2026 · 11:00 |
| `/australia` | Australia | Nov 18, 2026 · 13:00 |
| `/japan-korea` | Japan & South Korea | Nov 18, 2026 · 15:00 |
| `/asia-pacific` | Hong Kong, Taiwan, Singapore, Malaysia | Nov 18, 2026 · 16:00 |
| `/indonesia-thailand` | Indonesia & Thailand | Nov 18, 2026 · 17:00 |
| `/india` | India | Nov 18, 2026 · 18:30 |
| `/uae` | United Arab Emirates | Nov 18, 2026 · 20:00 |
| `/saudi-turkey` | Saudi Arabia & Turkey | Nov 18, 2026 · 21:00 |
| `/eastern-europe` | Eastern Europe | Nov 18, 2026 · 22:00 |
| `/south-america` | Brazil, Argentina, Chile | Nov 19, 2026 · 03:00 |
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
├── bg.jpeg                 # Background artwork
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
