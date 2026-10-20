# GTA VI Countdown — WPF Desktop App

Windows desktop wrapper for the live [GTA VI Countdown](https://gta-vi-countdown.onrender.com/eastern-europe) site (Eastern Europe region).

The window chrome uses the site’s Vice City palette (`#1A0A2E`, hot pink `#FF69B4`, soft purple `#E0B0FF`). The content area is a **WebView2** host of the live site, so the countdown UI matches the website 1:1 and stays fully interactive.

## Requirements

- Windows 10/11
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/) (usually already installed with Edge)

## Build & run

From this folder (`desktop/`):

```bash
dotnet restore
dotnet build -c Release
dotnet run -c Release
```

Or open `GtaViCountdownWpf.csproj` in Visual Studio 2022 and press F5.

## Assets

- **`Assets/GtaLogo.png`** / **`Assets/GtaLogo.svg`** — GTA VI wordmark for the desktop app (separate from the web project’s `logo.png`).
- **`Assets/app.ico`** — Application icon derived from the same wordmark.

Source of the wordmark: [Wikimedia Commons — Grand Theft Auto VI logo](https://commons.wikimedia.org/wiki/File:Grand_Theft_Auto_VI_logo.svg) (text logo; trademarks belong to Rockstar / Take-Two).

## Features

- Custom borderless title bar with GTA VI logo and “EASTERN EUROPE” badge
- Back / Forward / Refresh / Home navigation
- Loads `https://gta-vi-countdown.onrender.com/eastern-europe`
- Full site interactivity (region switcher, trailers, commits, pre-order, etc.)
- `target=_blank` links open inside the same window
- Keyboard: F5 refresh, Alt+Left/Right back/forward, Alt+Home home

## Interactivity

The main area is a full **WebView2** browser control:

- Click every control on the site (region switcher, trailers, commit history, pre-order, backgrounds, news, etc.)
- Scroll, zoom, and use the site’s own modals
- Scripts, dialogs, context menu, and swipe navigation are enabled

## Notes

- Fan-made. Not affiliated with Rockstar Games / Take-Two.
- Needs network access to load the hosted countdown.
- Parent repo: https://github.com/notcristi14/GTA-VI-Countdown
