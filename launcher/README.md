# GTA VI Countdown — C++ Desktop Launcher

Native **Windows C++** shell for the live countdown site. Embeds the real web app in **WebView2**, with custom chrome styled to the site’s Vice City neon theme.

**App name:** `GTA VI Countdown`  
**Home URL:** https://gta-vi-countdown.onrender.com/eastern-europe  
**Exe icon:** `desktop/GtaViCountdownWpf/Assets/GtaLogo.ico` (GTA VI logo)

## Features

- Full-window **WebView2** host (the site *is* the UI)
- **GTA VI logo** embedded as the `.exe` / taskbar / Alt+Tab icon (`IDI_APPICON`)
- Neon pink border, deep purple chrome matching the site
- F5 refresh, Alt+Left/Right history, Alt+Home home

## Requirements

- Windows 10/11
- Visual Studio 2022 (Desktop development with C++) **or** MSVC + CMake
- [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)

## Build (CMake + MSVC)

```bat
cd launcher
cmake -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
```

CMake **requires** the logo icon and links it into the binary:

1. Uses `../desktop/GtaViCountdownWpf/Assets/GtaLogo.ico` when present  
2. Else `launcher/assets/app.ico`  
3. Generates `build/app_icon.rc` → embeds `IDI_APPICON` into `GtaViCountdown.exe`

Run:

```bat
build\Release\GtaViCountdown.exe
```

## Icon asset

| Path | Role |
|------|------|
| `desktop/GtaViCountdownWpf/Assets/GtaLogo.ico` | Canonical GTA VI logo used as exe icon |
| `launcher/assets/app.ico` | Optional local override |

WPF shell uses the same file via `<ApplicationIcon>`.

## Theme tokens

| Role | Color |
|------|-------|
| Background | `#1A0A2E` |
| Title bar | `#140A28` |
| Border | `#FF8CC8` |
| Accent text | `#E0B0FF` |

## Notes

Fan-made. Not affiliated with Rockstar Games / Take-Two.
