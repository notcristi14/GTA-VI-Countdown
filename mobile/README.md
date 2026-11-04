# VI Countdown — mobile apps

Native WebView shells for the live GTA VI countdown. **No Flutter.**

**https://gta-vi-countdown.onrender.com/eastern-europe**

| Platform | Stack | Build |
|----------|--------|--------|
| **Android** | Kotlin + WebView + **Gradle 8.7** | `gradlew.bat assembleRelease` |
| **iOS** | Swift + **WKWebView** + Xcode | Open `VICountdown.xcodeproj` → Archive |

Shared behavior:

- Display name **VI Countdown** · ID `com.notcristi.vicountdown`
- Home URL: Eastern Europe countdown
- Same-origin stays in-app; other links open in the system browser
- Theme `#1A0A2E`

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

### Sources

```
mobile/ios/
  VICountdown.xcodeproj/
  VICountdown/
    AppDelegate.swift
    SceneDelegate.swift
    ViewController.swift   # WKWebView + link policy
    Info.plist
    Assets.xcassets/
```

---

## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two.
