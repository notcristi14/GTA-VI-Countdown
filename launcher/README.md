# GTA VI Countdown — C++ Desktop Launcher

Native **Windows C++** shell for the live countdown site. Embeds the real web app in **WebView2**, with custom chrome styled to the site’s Vice City neon theme (deep purple, hot pink, cyan).

**App name:** `GTA VI Countdown`  
**Home URL:** https://gta-vi-countdown.onrender.com/eastern-europe  
**Icon:** use project `logo.png` / `desktop/.../Assets/GtaLogo.ico` (see Build)

## Features

- Full-window **WebView2** host (not a browser tab — the site *is* the UI)
- Borderless chrome with neon pink border and title bar
- Back / Forward / Refresh / Home
- Minimize, maximize, close
- Loading overlay on first navigation
- Keyboard: **F5** refresh, **Alt+Left/Right** history, **Alt+Home** home

## Requirements

- Windows 10/11
- Visual Studio 2022 (Desktop development with C++) **or** MSVC + CMake
- [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)
- [WebView2 SDK](https://www.nuget.org/packages/Microsoft.Web.WebView2) (NuGet restore / CMake FetchContent)

## Build (CMake + MSVC)

```bat
cd launcher
cmake -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
```

Run:

```bat
build\Release\GtaViCountdown.exe
```

### Icon

Copy `../desktop/GtaViCountdownWpf/Assets/GtaLogo.ico` to `launcher/assets/app.ico` (or convert `../logo.png` to `.ico`).  
`app.rc` references `assets/app.ico` when present.

## Project layout

```text
launcher/
  CMakeLists.txt
  README.md
  src/
    main.cpp
    AppWindow.h
    AppWindow.cpp
    resource.h
    app.rc
  assets/          # place app.ico here
```

## Theme tokens (match site)

| Role        | Color     |
|------------|-----------|
| Background | `#1A0A2E` |
| Title bar  | `#140A28` |
| Border     | `#FF8CC8` |
| Accent text| `#E0B0FF` |
| Hot pink   | `#FF69B4` |
| Cyan       | `#22D3EE` |

## Notes

Fan-made. Not affiliated with Rockstar Games / Take-Two.
