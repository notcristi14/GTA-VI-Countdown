# VI Countdown — mobile apps

Native WebView shells for the live GTA VI countdown site.

**Home URL:** [https://gta-vi-countdown.onrender.com/](https://gta-vi-countdown.onrender.com/)

| Platform | Stack | ID |
|----------|--------|-----|
| **Android** | Kotlin + `WebView` + Gradle **8.7** | `com.notcristi.vicountdown` |
| **iOS** | Swift + `WKWebView` + Xcode | `com.notcristi.vicountdown` |

**Display name:** VI Countdown

### Behavior (both platforms)

- Loads the live site at the home URL above (pick region on the page)
- Navigation to `gta-vi-countdown.onrender.com` stays **in-app**
- Official embeds (Spotify `/embed`, YouTube `/embed`) stay **in-app**
- All other links open in the **system browser** (Chrome / Safari)
- App icons generated from the repo `logo.png` (see `generate_icons.sh`)

---

## Android

### Requirements

- **JDK 17**
- **Android SDK**
- Copy `local.properties.example` → `local.properties` and set `sdk.dir=...`  
  (Windows example: `sdk.dir=C\:\\Users\\You\\AppData\\Local\\Android\\Sdk`)

### Build APK

**Windows**

```bat
cd mobile\android
gradlew.bat assembleDebug
gradlew.bat assembleRelease
```

**macOS / Linux**

```bash
cd mobile/android
./gradlew assembleDebug
./gradlew assembleRelease
```

| Build | Output |
|-------|--------|
| Debug | `app/build/outputs/apk/debug/app-debug.apk` |
| Release | `app/build/outputs/apk/release/app-release.apk` |

Release uses the debug keystore by default (fine for personal installs). For Play Store, add your own signing config in `app/build.gradle`.

### Sources

```
mobile/android/
  app/src/main/kotlin/com/notcristi/vicountdown/MainActivity.kt
  app/src/main/AndroidManifest.xml
  app/src/main/res/mipmap-*/          # launcher icons
  gradlew / gradlew.bat
```

---

## iOS

### Requirements

- **macOS** + **Xcode 15+**
- Apple ID (free account works for device install; paid team for App Store / longer profiles)

### Build in Xcode

1. Open `mobile/ios/VICountdown.xcodeproj`
2. **Signing & Capabilities** → select your Team
3. Select your iPhone (or a simulator) → **Run**
4. For an IPA: **Product → Archive** → **Distribute App**

### Install with Sideloadly (Windows / macOS)

Use a release IPA (e.g. [ios-v1.0.0 / gta-countdown.ipa](https://github.com/notcristi14/GTA-VI-Countdown/releases/download/ios-v1.0.0/gta-countdown.ipa)) or one you exported from Xcode.

1. Install [Sideloadly](https://sideloadly.io/)
2. Connect the iPhone by USB → unlock → **Trust**
3. Drag the `.ipa` into Sideloadly
4. Sign in with your Apple ID → **Start**
5. On the phone: **Settings → General → VPN & Device Management** → trust the developer profile
6. Open **VI Countdown**

Notes:

- Free Apple ID signing lasts about **7 days**, then re-sign with Sideloadly
- If you hit the free app limit, remove other free-signed apps first
- Keep the phone unlocked until install finishes

### Sources

```
mobile/ios/
  VICountdown.xcodeproj/
  VICountdown/
    AppDelegate.swift
    SceneDelegate.swift
    ViewController.swift    # WKWebView + link policy
    Info.plist
    Assets.xcassets/        # AppIcon-1024.png
```

---

## Icons

Source logo: `mobile/assets/logo.png` (copied from repo-root `logo.png` when generating).

```bash
# From repo root (needs ImageMagick)
./mobile/generate_icons.sh
```

Writes iOS `AppIcon-1024.png` (`Assets.xcassets/AppIcon.appiconset/`) and Android `mipmap-*` icons from that logo.

---

## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two. Grand Theft Auto and related marks are trademarks of their respective owners.

<!-- AUTO-GENERATED: mobile-config-facts -->
<!-- END AUTO-GENERATED: mobile-config-facts -->

<!-- AUTO-GENERATED: readme-integrity-check -->
<!-- END AUTO-GENERATED -->
