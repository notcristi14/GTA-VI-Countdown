# GTA VI Countdown — C++ Desktop Launcher

Native **Windows C++** shell for the live countdown site. Full-window **WebView2** (no extra chrome). Links open inside the app.

**App name:** `GTA VI Countdown`  
**Home URL:** https://gta-vi-countdown.onrender.com/eastern-europe  
**Exe icon:** [`assets/GtaLogo.ico`](assets/GtaLogo.ico)

## Features

- Site fills the entire window (OS title bar only)
- **GTA VI logo** as `.exe` / taskbar / Alt+Tab icon
- All links (`target=_blank`, `window.open`, in-page) stay **in the app**
- F5 refresh · Alt+Left/Right history · Alt+Home home
- Dark / neon window border matching the site

## Requirements

- Windows 10/11
- **Visual Studio 2022** with **Desktop development with C++**
- [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)

## Build

1. Open **`GtaViCountdown.sln`**
2. Restore NuGet packages
3. **Release | x64** → Build Solution
4. Run: `bin\x64\Release\GtaViCountdown.exe`

## Notes

Fan-made. Not affiliated with Rockstar Games / Take-Two.
