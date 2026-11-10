# GTA VI Countdown — desktop launcher (C++)

Win32 + **WebView2** shell that embeds the live countdown site.

## Features

- Loads the live site in WebView2
- Toolbar: Back · Forward · Home · Refresh
- Links can stay inside the app
- **GTA VI logo** as `.exe` / taskbar icon when `GtaLogo.ico` is embedded via `src/app.rc`

Site content comes from the **live web app**. See [root README](../README.md).

## Requirements

- Windows 10/11
- **Visual Studio 2022** with **Desktop development with C++**
- [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)

## Build

1. Open **`GtaViCountdown.sln`**
2. Restore NuGet packages
3. **Release | x64** → Build Solution
4. Run: `bin\x64\Release\GtaViCountdown.exe`

## Assets

See [launcher/assets/README.md](assets/README.md).

<!-- AUTO-GENERATED: readme-integrity-check — do not edit by hand -->
## 🔍 Automated integrity status

Last run: **2026-11-10T13:24:53.813Z** · Launcher files: **✅**

*From `scripts/readme-integrity-check.js`.*
<!-- END AUTO-GENERATED -->

