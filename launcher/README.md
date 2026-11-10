# GTA VI Countdown — Windows desktop launcher

Native **Win32 + WebView2** application that hosts the live countdown website.

## Repository status

| Item | Status |
|------|--------|
| Visual Studio solution `GtaViCountdown.sln` | present |
| Sources under `launcher/src/` | present |
| `launcher/assets/GtaLogo.ico` | present |
| WebView2 usage in `AppWindow.cpp` | yes |

## Implemented behaviour

- Embeds the live site via **WebView2**
- Window toolbar actions implemented in `AppWindow.cpp` (navigation chrome)
- Application icon resource pipeline via `src/app.rc` / `resource.h` when `GtaLogo.ico` is linked

Countdown content, APIs, and media are served by the **hosted web application**, not bundled inside the `.exe`.

## Requirements

- Windows 10 or 11
- Visual Studio 2022 with **Desktop development with C++**
- [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)

## Build

1. Open `launcher/GtaViCountdown.sln`
2. Restore NuGet packages
3. Configuration **Release | x64** → Build Solution
4. Run `bin\x64\Release\GtaViCountdown.exe` (path may vary with project settings)

## Assets

See [launcher/assets/README.md](assets/README.md).

More product context: [root README](../README.md).
