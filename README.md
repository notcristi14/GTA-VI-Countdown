# 🌴 Grand Theft Auto VI Countdown

Real-time, responsive countdown for Grand Theft Auto VI with regional PlayStation Store and Xbox Store unlock times.

🚀 Live Demo: https://gta-vi-countdown.onrender.com/

💻 Windows desktop app: see `desktop/` — a WPF + WebView2 wrapper for the live GTA VI countdown site, styled with a neon Vice City-inspired aesthetic and a custom GTA VI app icon.

---

## ✨ Features

- Live GTA VI countdown experience from the official project site
- Desktop shell powered by WPF + WebView2
- Clean, neon GTA VI-inspired visual theme
- Custom executable icon for the Windows app
- Smooth minimize, maximize, and close transitions
- Browser navigation controls for the embedded countdown site

---

## 🌐 Site

The desktop app loads the live countdown site directly from:

https://gta-vi-countdown.onrender.com/

The app is intentionally simplified to open the main experience without a region switcher UI.

---

## 💻 Windows desktop app (`desktop/`)

The project includes a WPF desktop wrapper for the live countdown site.

```bash
cd desktop/GtaViCountdownWpf
dotnet restore
dotnet run -c Release
```

Requirements:

- Windows 10/11
- .NET 8 SDK
- Microsoft Edge WebView2 Runtime

---

## 📁 Project Structure

```text
├── bgs/                    # Background artwork set
├── logo.png                # GTA VI branding asset
├── bg.jpeg                 # Default cover image
├── gta-vi-countdown.html   # Main countdown experience
├── app.js                  # Node server / API logic
├── stats.json              # Optional stats state file
├── package.json            # Node project config
├── desktop/                # WPF desktop wrapper
│   └── GtaViCountdownWpf/
│       ├── App.xaml
│       ├── MainWindow.xaml
│       ├── GtaViCountdownWpf.csproj
│       ├── Assets/
│       └── README.md
├���─ README.md               # Root project overview
└── LICENSE                 # License / disclaimer info
```

---

## 🛠️ Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Desktop: WPF (.NET 8) + WebView2

---

## License

Fan-made countdown. Grand Theft Auto, Rockstar Games and related marks are trademarks of Take-Two Interactive. Not affiliated with or endorsed by Rockstar Games / Take-Two.
