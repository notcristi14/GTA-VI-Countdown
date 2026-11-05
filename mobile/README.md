# VI Countdown — mobile apps

Native WebView shells for the live GTA VI countdown. **No Flutter.**

**https://gta-vi-countdown.onrender.com/**

| Platform | Stack | Build |
|----------|--------|--------|
| **Android** | Kotlin + WebView + **Gradle 8.7** | `gradlew.bat assembleRelease` |
| **iOS** | Swift + **WKWebView** + Xcode | Open `VICountdown.xcodeproj` → Archive |

Shared behavior:

- Display name **VI Countdown** · ID `com.notcristi.vicountdown`
- Home URL: site root (region is chosen on the page)
- Site host + official embeds (Spotify `/embed`, YouTube `/embed`) stay in-app
- Other links open in the system browser
- **iOS**: iframe/subframe loads stay in-app (Spotify embed does not open Safari on launch)
- **iOS**: `window.open` / `target="_blank"` (Latest update card, social links) open in Safari
- Theme `#1A0A2E`
- **App icon** — GTA VI logo from `logo.png` (committed; regenerate with `generate_icons.sh` if needed)

---

## App icon

Source: repo root `logo.png`, resized to a 1024×1024 square on `#1A0A2E`.

Icons are already in the repo. To regenerate (requires ImageMagick):

```bash
cd mobile
./generate_icons.sh
```

| Platform | Location |
|----------|----------|
| **iOS** | `mobile/ios/VICountdown/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png` |
| **Android** | `mobile/android/app/src/main/res/mipmap-*/ic_launcher.png` (+ `_round`) |

Manifest uses `@mipmap/ic_launcher` and `@mipmap/ic_launcher_round`.  
`Contents.json` references `AppIcon-1024.png`.

---

## Android (Gradle only)

### Requirements

- JDK 17 · Android SDK
- `mobile/android/local.properties` → `sdk.dir=...` only

### Build APK (Windows)

```bat
cd mobile\android
gradlew.bat assembleDebug
gradlew.bat assembleRelease
```

| Build | Output |
|-------|--------|
| Debug | `app\build\outputs\apk\debug\app-debug.apk` |
| Release | `app\build\outputs\apk\release\app-release.apk` |

### Build APK (macOS / Linux)

```bash
cd mobile/android
./gradlew assembleRelease
```

---

## iOS (native Swift / Xcode)

### Requirements

- **macOS** + **Xcode 15+**
- Apple ID (free for device install; paid team for App Store)

### Open & run

1. Open **`mobile/ios/VICountdown.xcodeproj`** in Xcode  
2. Select target **VICountdown**  
3. **Signing & Capabilities** → choose your **Team**  
4. Pick a simulator or device → **Run** (▶)

### Build IPA (Archive)

1. Product → **Destination** → **Any iOS Device**  
2. Product → **Archive**  
3. Organizer → **Distribute App** (Ad Hoc / Development / App Store)

### Install with Sideloadly (Windows / macOS)

Use the release IPA ([`ios-v1.0.0` / gta-countdown.ipa](https://github.com/notcristi14/GTA-VI-Countdown/releases/download/ios-v1.0.0/gta-countdown.ipa)) or one you built in Xcode.

1. Download **Sideloadly** from [sideloadly.io](https://sideloadly.io/) and install it.
2. Connect your iPhone with a USB cable. Unlock the phone and tap **Trust**.
3. Open Sideloadly. Your device should appear in the device dropdown.
4. Drag **gta-countdown.ipa** into Sideloadly (or click the IPA icon and pick the file).
5. Enter the **Apple ID** you want to sign with (free Apple ID is fine).
6. Click **Start**. Enter the Apple ID password when asked, then the 2FA code if prompted.
7. Wait until Sideloadly says the install finished.
8. On the iPhone:
   - Open **Settings → General → VPN & Device Management** (or **Profiles & Device Management**)
   - Tap your Apple ID under **Developer App**
   - Tap **Trust** → **Trust**
9. Open **VI Countdown** from the home screen.

Notes:

- Free Apple ID signing lasts about **7 days**, then you must re-sign with Sideloadly.
- If Sideloadly reports “maximum number of apps”, remove other free-signed apps first.
- Keep the phone unlocked and connected until the install completes.

### Sources

```
mobile/ios/
  VICountdown.xcodeproj/
  VICountdown/
    AppDelegate.swift
    SceneDelegate.swift
    ViewController.swift   # WKWebView + link policy
    Info.plist
    Assets.xcassets/       # AppIcon 1024×1024 from logo.png
```

---

## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two.
