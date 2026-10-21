# GTA VI Countdown — C++ Desktop Launcher

Native **Windows C++** shell for the live countdown site. Embeds the web app in **WebView2**, with neon chrome matching the site theme.

**App name:** `GTA VI Countdown`  
**Home URL:** https://gta-vi-countdown.onrender.com/eastern-europe  
**Exe icon:** [`assets/GtaLogo.ico`](assets/GtaLogo.ico) (GTA VI logo)

## Features

- Full-window WebView2 (the site is the UI)
- **GTA VI logo** embedded as the `.exe` / taskbar / Alt+Tab icon (`IDI_APPICON`)
- Deep purple + pink border chrome matching the site
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

CMake picks up `assets/GtaLogo.ico` and links it into `GtaViCountdown.exe`.

```bat
build\Release\GtaViCountdown.exe
```

## Assets

| File | Role |
|------|------|
| `assets/GtaLogo.ico` | GTA VI logo — Windows executable / window icon |

## Notes

Fan-made. Not affiliated with Rockstar Games / Take-Two.
