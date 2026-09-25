# 🌴 Grand Theft Auto VI Countdown

A real-time, responsive countdown web application tracking the release of **Grand Theft Auto VI** across global time zones and regional console store unlocks.

🚀 **Live Demo:** [gta-vi-countdown.onrender.com](https://gta-vi-countdown.onrender.com/)

---

## ✨ Features

* **Timezone & Region Awareness:** Dynamic routing (`/europe`, `/uk`, `/us-canada`, etc.) to show exact local PlayStation Store and Xbox Store launch target countdowns.
* **Region Switcher:** Built-in interactive dropdown to switch between global regions instantly.
* **Responsive Neon Glassmorphism UI:** Mobile-first layout styled with Vice City-inspired aesthetics, blurred backdrops, and glowing typography.
* **Platform Badges:** High-contrast PlayStation 5 and Xbox Series X|S vector badges.
* **Single-Page Routing:** Node.js/Express server catch-all route ensuring direct subpath navigation works cleanly on web deployments.

---

## 🌐 Supported Regions & Routes

| Route | Region | Launch Time Target (UTC) |
| :--- | :--- | :--- |
| **`/` / `/europe`** | Central Europe (CET / Central) | `Nov 18, 2026 - 23:00 UTC` |
| **`/uk`** | United Kingdom & Ireland | `Nov 19, 2026 - 00:00 UTC` |
| **`/us-canada`** | United States & Canada (EST) | `Nov 19, 2026 - 05:00 UTC` |
| **`/new-zealand`** | New Zealand | `Nov 18, 2026 - 11:00 UTC` |
| **`/australia`** | Australia | `Nov 18, 2026 - 13:00 UTC` |
| **`/japan-korea`** | Japan & South Korea | `Nov 18, 2026 - 15:00 UTC` |
| **`/asia-pacific`** | Hong Kong, Taiwan, Singapore, Malaysia | `Nov 18, 2026 - 16:00 UTC` |
| **`/indonesia-thailand`** | Indonesia & Thailand | `Nov 18, 2026 - 17:00 UTC` |
| **`/india`** | India | `Nov 18, 2026 - 18:30 UTC` |
| **`/uae`** | United Arab Emirates | `Nov 18, 2026 - 20:00 UTC` |
| **`/saudi-turkey`** | Saudi Arabia & Turkey | `Nov 18, 2026 - 21:00 UTC` |
| **`/eastern-europe`** | Eastern Europe (Greece, Romania, Finland, etc.) | `Nov 18, 2026 - 22:00 UTC` |
| **`/south-america`** | Brazil, Argentina, Chile | `Nov 19, 2026 - 03:00 UTC` |
| **`/mexico`** | Mexico & Central America | `Nov 19, 2026 - 06:00 UTC` |

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Flexbox, Clamp, Glassmorphism), Vanilla JavaScript ES6+
* **Backend:** Node.js, Express.js
* **Hosting / Deployment:** [Render](https://render.com/)

---

## 📁 Project Structure

```text
├── bg.jpeg               # Background wallpaper asset
├── logo.png              # GTA VI logo asset
├── gta-vi-countdown.html # Main HTML/CSS/JS web application
├── server.js             # Express.js server & catch-all region router
├── package.json          # Dependencies and npm startup scripts
└── README.md             # Project documentation
```

---

## 🚀 Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/gta-vi-countdown.git](https://github.com/your-username/gta-vi-countdown.git)
   cd gta-vi-countdown
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000/` or `http://localhost:3000/us-canada`.
