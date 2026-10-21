# 🌴 Grand Theft Auto VI Countdown

Real-time, responsive countdown for **Grand Theft Auto VI** with regional unlock times — plus **desktop shells** that embed the live site.

🚀 **Live Demo:** [gta-vi-countdown.onrender.com](https://gta-vi-countdown.onrender.com/)  
🌍 **Eastern Europe:** [gta-vi-countdown.onrender.com/eastern-europe](https://gta-vi-countdown.onrender.com/eastern-europe)

---

## 💻 Desktop apps

Both wrappers load the **live site inside the window** (WebView2). Default home route: **Eastern Europe**.

| Shell | Stack | Folder |
|-------|--------|--------|
| **GTA VI Countdown** (recommended C++) | Win32 + WebView2 | [`launcher/`](launcher/) |
| **GTA VI Countdown** (WPF) | .NET 8 + WebView2 | [`desktop/GtaViCountdownWpf/`](desktop/GtaViCountdownWpf/) |

**App name:** `GTA VI Countdown`  
**Icon:** GTA VI logo (`logo.png` / `desktop/.../Assets/GtaLogo.ico`)

### C++ launcher

```bat
cd launcher
cmake -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
```

See [launcher/README.md](launcher/README.md).

### WPF shell

```bash
cd desktop/GtaViCountdownWpf
dotnet restore && dotnet run -c Release
```

See [desktop/GtaViCountdownWpf/README.md](desktop/GtaViCountdownWpf/README.md).

---

## ✨ Site features

- **Release line** – Subtitle reads “Releasing November 19, 2026”. Page title `GTA VI Countdown - {region}`.
- **Regional countdowns** – Official store unlock windows with routes (e.g. `/eastern-europe`).
- **Live countdown** – Digit reels, continuous seconds, progress under Secs.
- **Platform badges** – PS5 / Xbox pre-order links; static when countdown hits zero.
- **Watch Trailers** – Official Rockstar embeds; sorted newest → oldest by YouTube `publishDate`; auto-refresh via `/api/trailers`.
- **Commit history / repo stats** – GitHub panel + stars/forks/watchers/issues.
- **Welcome lights** – Vice City neon wash (pink / magenta / cyan), CSS only, no audio.
- **License + vibecoded** – Footer disclaimer and “100% vibecoded — built fully with AI.”

---

## 📁 Structure

```text
├── gta-vi-countdown.html   # Main web UI
├── app.js                  # Express APIs
├── bgs/                    # Background art
├── logo.png
├── launcher/               # C++ Win32 + WebView2 desktop app
├── desktop/GtaViCountdownWpf/  # WPF + WebView2 desktop app
├── package.json
└── README.md
```

---

## 🛠️ Web stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express

```bash
npm install
npm start
```

---

## License

Fan-made countdown. Grand Theft Auto, Rockstar Games and related marks are trademarks of Take-Two Interactive. Not affiliated with or endorsed by Rockstar Games / Take-Two.
