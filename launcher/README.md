# GTA VI Countdown — C++ Desktop Launcher

Native **Windows C++** shell for the live countdown site. Embeds the web app in **WebView2**, with neon chrome matching the site theme.

**App name:** `GTA VI Countdown`  
**Home URL:** https://gta-vi-countdown.onrender.com/eastern-europe  
**Exe icon:** [`assets/GtaLogo.ico`](assets/GtaLogo.ico) (GTA VI logo)

## Features

- Full-window WebView2 (the site is the UI)
- **GTA VI logo** embedded as the `.exe` / taskbar / Alt+Tab icon
- Deep purple + pink border chrome matching the site
- F5 refresh · Alt+Left/Right history · Alt+Home home

## Requirements

- Windows 10/11
- **Visual Studio 2022** with workload **Desktop development with C++**
- [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/) (usually already installed with Edge)

## Build with Visual Studio

1. Open **`GtaViCountdown.sln`** in Visual Studio 2022.
2. Restore NuGet packages (VS usually does this automatically on open).  
   If not: right-click the solution → **Restore NuGet Packages**.
3. Set configuration to **Release** and platform to **x64** (recommended).
4. **Build → Build Solution** (or `Ctrl+Shift+B`).
5. Run with **Debug → Start Without Debugging** (`Ctrl+F5`), or open:
   ```
   bin\x64\Release\GtaViCountdown.exe
   ```

WebView2 comes from the NuGet package in `packages.config` (`Microsoft.Web.WebView2`).

## Assets

| File | Role |
|------|------|
| `assets/GtaLogo.ico` | GTA VI logo — Windows executable / window icon |

## Notes

Fan-made. Not affiliated with Rockstar Games / Take-Two.
