# GTA VI Countdown (WPF)

Windows **WPF (.NET 8) + WebView2** desktop shell for the live countdown site.

**App name:** GTA VI Countdown  
**Default route:** https://gta-vi-countdown.onrender.com/eastern-europe  
**Icon:** `Assets/GtaLogo.ico`

## Features

- Embeds the **live site** (full UI inside the window — not a thin launcher that only opens a browser)
- **Eastern Europe** as the home URL
- Vice City neon chrome: deep purple `#1A0A2E`, pink borders, cyan/pink logo gradient
- Custom title bar (back / forward / refresh / home, minimize / maximize / close)
- Smooth window transitions on chrome actions
- Loading overlay with VI mark until first navigation completes

## Build

```bash
cd desktop/GtaViCountdownWpf
dotnet restore
dotnet run -c Release
```

Publish:

```bash
dotnet publish -c Release -r win-x64 --self-contained false
```

## Requirements

- Windows 10/11
- .NET 8 SDK
- [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)

## Assets

| File | Purpose |
|------|---------|
| `Assets/GtaLogo.ico` | Executable / window icon |
| `Assets/GtaLogo.png` | Optional marketing / splash asset |

## Related

Native **C++** WebView2 shell (same URL + theme): see [`../../launcher/`](../../launcher/).

## Disclaimer

Fan-made. Not affiliated with Rockstar Games / Take-Two.
