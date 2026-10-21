# GTA VI Countdown — C++ Desktop Launcher

Native **Windows C++** shell for the live countdown site. Embeds the web app in **WebView2**, with neon chrome matching the site theme.

**App name:** `GTA VI Countdown`  
**Home URL:** https://gta-vi-countdown.onrender.com/eastern-europe  
**Exe icon:** GTA VI logo — `desktop/GtaViCountdownWpf/Assets/GtaLogo.ico` (shared asset; not a WPF app)

## Features

- Full-window WebView2 (the site is the UI)
- **GTA VI logo** as `.exe` / taskbar / Alt+Tab icon (`IDI_APPICON`)
- Deep purple + pink border chrome
- F5 refresh · Alt+Left/Right history · Alt+Home home

## Requirements

- Windows 10/11
- Visual Studio 2022 (C++) or MSVC + CMake
- [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)

## Build

```bat
cd launcher
cmake -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
```

CMake embeds the logo into the binary from (first match):

1. `launcher/assets/GtaLogo.ico` or `launcher/assets/app.ico`
2. `desktop/GtaViCountdownWpf/Assets/GtaLogo.ico`

```bat
build\Release\GtaViCountdown.exe
```

## Notes

Fan-made. Not affiliated with Rockstar Games / Take-Two.
