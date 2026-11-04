# VI Countdown — iOS App

Native iOS wrapper for the live GTA VI countdown (Eastern Europe region):

**https://gta-vi-countdown.onrender.com/eastern-europe**

| | |
|---|---|
| **Display name** | **VI Countdown** |
| **Bundle ID** | `com.notcristi.vicountdown` |
| **Min iOS** | **16.0** (iPhone SE 3 → iPhone 16 / 16 Pro / 16 Pro Max + iPad) |
| **Arch** | arm64 |
| **Icon** | GTA VI–style logo on Vice City neon gradient (generated from `logo.png` in CI) |
| **Home URL** | Eastern Europe regional countdown |

## Features

- Full-screen **WKWebView** of the live site
- **External links open in Safari** (Spotify, YouTube, Rockstar, Netflix, GitHub, etc.)
- Spotify / YouTube **embeds stay in-app**
- `target="_blank"` / `window.open` → Safari
- Portrait + landscape; dark neon chrome

## Build with GitHub Actions (recommended)

Workflow: [`.github/workflows/build-ipa.yml`](../.github/workflows/build-ipa.yml)

1. Create an [App Store Connect API key](https://appstoreconnect.apple.com/access/integrations/api) (Developer access).
2. Register App ID `com.notcristi.vicountdown` in the [Apple Developer portal](https://developer.apple.com/account/resources/identifiers/list).
3. Add repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Description |
|--------|-------------|
| `APP_STORE_CONNECT_API_KEY_ID` | Key ID |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID |
| `APP_STORE_CONNECT_API_KEY_P8` | Full `.p8` private key contents |
| `APPLE_TEAM_ID` | 10-character Team ID |

4. **Actions → Build IPA → Run workflow**
5. Download the **VICountdown-ipa** artifact

`ExportOptions.plist` defaults to **development** (good for device install / AltStore). Change `method` to `ad-hoc` or `app-store-connect` in the workflow if needed.

## Build locally (Mac + Xcode 15/16)

```bash
cd ios
open VICountdown.xcodeproj
# Signing & Capabilities → select your Team
# Product → Archive → Distribute App

# Or:
./build-ipa.sh YOUR_TEAM_ID
```

App icons are generated from the repo-root `logo.png` when missing.

## Layout

```
ios/
├── VICountdown.xcodeproj/
├── VICountdown/
│   ├── VICountdownApp.swift
│   ├── ContentView.swift
│   ├── Info.plist
│   └── Assets.xcassets/
├── ExportOptions.plist
├── build-ipa.sh
└── README.md
```

## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two. Grand Theft Auto and related marks are trademarks of their respective owners.
