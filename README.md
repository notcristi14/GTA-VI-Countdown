# 🌴 Grand Theft Auto VI Countdown

Real-time GTA VI countdown experience with the live project site embedded in a custom Windows desktop shell.

🚀 Live site: https://gta-vi-countdown.onrender.com/

💻 Windows desktop app: a WPF + WebView2 wrapper for the live countdown, styled in a GTA VI neon theme with a custom icon and smooth window animations.

---

## ✨ Features

- Live countdown experience from the project site
- Embedded WebView2 desktop shell for Windows
- GTA VI-inspired pink/purple neon UI styling
- Custom executable icon and polished chrome
- Smooth minimize, maximize, and close transitions
- Simple desktop wrapper focused on the root site without region switching UI

---

## 🌐 Site

The desktop app opens the live site directly at:

https://gta-vi-countdown.onrender.com/

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
│       ├── MainWindow.xaml.cs
│       ├── GtaViCountdownWpf.csproj
│       ├── Assets/
│       └── README.md
├── README.md               # Root project overview
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
