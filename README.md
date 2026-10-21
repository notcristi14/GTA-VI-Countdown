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
| **Icon** | `launcher/assets/GtaLogo.ico` |
| **Home URL** | https://gta-vi-countdown.onrender.com/eastern-europe |

```bat
cd launcher
cmake -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
```

**Icon:** place `GtaLogo.ico` in `launcher/assets/`. Restore from git if needed:

```bash
git show d93ba1c9:desktop/GtaViCountdownWpf/Assets/GtaLogo.ico > launcher/assets/GtaLogo.ico
```

Requirements: Windows 10/11, MSVC/CMake, [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/).

See [launcher/README.md](launcher/README.md).

---

## ✨ Site features

- **Release line** – “Releasing November 19, 2026”. Title `GTA VI Countdown - {region}`.
- **Regional countdowns** – Official store unlock windows (e.g. `/eastern-europe`).
- **Live countdown** – Digit reels, continuous seconds, progress under Secs.
- **Platform badges** – PS5 / Xbox pre-order; static at countdown zero.
- **Watch Trailers** – Official Rockstar embeds; newest → oldest by YouTube `publishDate`.
- **Commit history / repo stats** – GitHub panel + stars/forks/watchers/issues.
- **Welcome lights** – Vice City neon (CSS only, no audio).
- **License + vibecoded** – Footer disclaimer.

---

## 📁 Structure

```text
├── gta-vi-countdown.html
├── app.js
├── bgs/
├── logo.png
├── launcher/                 # C++ Win32 + WebView2 desktop app
│   ├── assets/
│   │   └── GtaLogo.ico       # GTA VI logo (exe icon)
│   ├── src/
│   └── CMakeLists.txt
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
- Backend: Node.js + Express
- Desktop: C++ (Win32 + WebView2)

---

## License

Fan-made countdown. Grand Theft Auto, Rockstar Games and related marks are trademarks of Take-Two Interactive. Not affiliated with or endorsed by Rockstar Games / Take-Two.
