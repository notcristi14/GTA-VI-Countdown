# VI Countdown — mobile apps

Native WebView shells for the live GTA VI countdown website. **This project does not use Flutter.**

| Platform | Technology | Home URL (from source) | How to build |
|----------|------------|------------------------|---------------|
| **Android** | Kotlin `WebView`, Gradle **8.7**, AGP **8.6.0**, Kotlin **1.9.24** | `https://gta-vi-countdown.onrender.com/` | `gradlew.bat assembleRelease` |
| **iOS** | Swift `WKWebView`, Xcode project `VICountdown.xcodeproj` | `https://gta-vi-countdown.onrender.com/` | Xcode → Run / Archive |

## Behaviour (verified in source)

- Application ID / bundle identifier: **`com.notcristi.vicountdown`**
- Display name: **VI Countdown**
- In-app navigation allowed only for host **`gta-vi-countdown.onrender.com`** (and subdomains)
- All other `http`/`https` URLs and non-web schemes open in the **system browser** (Android `ACTION_VIEW`, iOS `UIApplication.shared.open`)
- UI chrome colour **#1A0A2E**
- iOS marketing icon: **`AppIcon-1024.png` is present in the asset catalog**
- Android Gradle project is **pure (no Flutter plugin)**

The full countdown experience (regions, music, trailers, Newswire, backgrounds) is provided by the **live website** loaded in the WebView.

---

## Android

### Requirements

- JDK **17**
- Android SDK (API 21+)
- `mobile/android/local.properties` with `sdk.dir=...` only

### Build (Windows)

```bat
cd mobile\android
gradlew.bat assembleDebug
gradlew.bat assembleRelease
```

| Variant | Output path |
|---------|-------------|
| Debug | `app\build\outputs\apk\debug\app-debug.apk` |
| Release | `app\build\outputs\apk\release\app-release.apk` |

### Build (macOS / Linux)

```bash
cd mobile/android
./gradlew assembleRelease
```

Primary source: `mobile/android/app/src/main/kotlin/com/notcristi/vicountdown/MainActivity.kt`

---

## iOS

### Requirements

- macOS with **Xcode 15+**
- Apple ID (device runs); paid team for App Store distribution

### Run

1. Open `mobile/ios/VICountdown.xcodeproj`
2. Select target **VICountdown** and your **Signing Team**
3. Run on a simulator or device

### IPA

Product → **Archive** → Organizer → **Distribute App**

Primary source: `mobile/ios/VICountdown/ViewController.swift`

---

## Legal

Fan-made companion. Not affiliated with Rockstar Games or Take-Two Interactive.
