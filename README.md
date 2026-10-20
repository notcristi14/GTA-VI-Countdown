# 🌴 Grand Theft Auto VI Countdown

Real-time, responsive countdown for Grand Theft Auto VI with regional PlayStation Store / Xbox Store unlock times.

🚀 Live Demo: https://gta-vi-countdown.onrender.com/

💻 Windows desktop app: see `desktop/` — a WPF + WebView2 wrapper for the Eastern Europe countdown route (`/eastern-europe`), styled in a neon Vice City-inspired theme and packaged with a custom GTA VI application icon.

---

## ✨ Features

- Real-time regional countdowns for all supported GTA VI unlock windows
- Route-based region handling, including the Eastern Europe default
- Custom desktop shell with GTA VI neon styling and glows
- Custom executable icon support for the Windows app
- WebView2-hosted live countdown experience with browser navigation controls
- Smooth desktop wrapper for the live web app experience

---

## 🌐 Supported Regions

The project supports all official PlayStation Store unlock windows, including:

- `/new-zealand`
- `/australia`
- `/japan-korea`
- `/asia-pacific`
- `/indonesia-thailand`
- `/india`
- `/uae`
- `/saudi-turkey`
- `/eastern-europe`
- `/europe`
- `/uk`
- `/south-america`
- `/bolivia`
- `/us-canada`
- `/mexico`

---

## 💻 Windows desktop app (`desktop/`)

The desktop app is a WPF + WebView2 host for the Eastern Europe countdown route.

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
├── gta-vi-countdown.html   # Main web experience
├── app.js                  # Web server / API logic
├── stats.json              # Optional stats state file
├── package.json            # Node project config
├── desktop/                # WPF desktop project
│   └── GtaViCountdownWpf/
│       ├── App.xaml
│       ├── MainWindow.xaml
│       ├── GtaViCountdownWpf.csproj
│       ├── Assets/
│       └── README.md
├── README.md               # Root project overview
└── LICENSE                 # License / disclaimer info (if present)
```

---

## 🛠️ Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Desktop: WPF (.NET 8) + WebView2

---

## License

Fan-made countdown. Grand Theft Auto, Rockstar Games and related marks are trademarks of Take-Two Interactive. Not affiliated with or endorsed by Rockstar Games / Take-Two.
