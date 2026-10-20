# GtaViCountdownWpf

Windows WPF (.NET 8) + WebView2 desktop app for the live GTA VI Countdown experience, centered on the Eastern Europe region and styled with a neon Vice City-inspired aesthetic.

## Features

- Embedded WebView2 browser for the live countdown site
- Eastern Europe default route and region awareness
- GTA VI-inspired neon UI styling with pink/cyan glow accents
- Custom executable icon support via `Assets/GtaLogo.ico`
- Window chrome with custom minimize, maximize, and close controls
- Smooth, lightweight desktop wrapper for the live countdown site

## Build

```bash
cd desktop/GtaViCountdownWpf
dotnet restore
dotnet run -c Release
```

## Assets

| File | Purpose |
|------|---------|
| `Assets/GtaLogo.ico` | Executable icon for the generated Windows app |
| `Assets/GtaLogo.png` | Desktop logo / marketing asset |
| `Assets/GtaLogo.svg` | Vector source for the GTA VI wordmark |
| `Assets/GtaLogo.png.b64` | Base64 backup of the PNG asset |

`GtaLogo` is a dedicated desktop asset tailored for the WPF wrapper and is used to keep the app visually aligned with the GTA VI brand while staying independent from the web project’s `logo.png`.

## Requirements

- Windows 10/11
- .NET 8 SDK
- Microsoft Edge WebView2 Runtime

## Notes

Fan-made. Not affiliated with Rockstar Games / Take-Two.
