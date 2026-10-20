# GtaViCountdownWpf

Windows WPF (.NET 8) + WebView2 desktop app for the live
[GTA VI Countdown — Eastern Europe](https://gta-vi-countdown.onrender.com/eastern-europe).

## Build

```bash
cd desktop/GtaViCountdownWpf
dotnet restore
dotnet run -c Release
```

## Assets

| File | Purpose |
|------|---------|
| `Assets/GtaLogo.png` | App / title-bar logo (**not** the web project `logo.png`) |
| `Assets/GtaLogo.svg` | Vector source for the same wordmark |
| `Assets/GtaLogo.png.b64` | Base64 of the PNG (decoded on first build if PNG is missing) |
| `Assets/app.ico` | Optional executable icon |

`GtaLogo` is a dedicated desktop asset (pink/purple **GRAND THEFT AUTO / VI** wordmark). It does not use or copy the countdown site’s `logo.png`.

## Notes

Fan-made. Not affiliated with Rockstar Games / Take-Two.
