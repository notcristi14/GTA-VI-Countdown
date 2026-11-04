# VI Countdown — Flutter app

Cross-platform (**iOS + Android**) WebView shell for the live GTA VI countdown:

**https://gta-vi-countdown.onrender.com/eastern-europe**

| | |
|---|---|
| **Display name** | **VI Countdown** |
| **Application ID / Bundle ID** | `com.notcristi.vicountdown` |
| **Min Android** | API 21 (Android 5.0+) |
| **Android build** | **Gradle 8.7** via `gradlew.bat` / `gradlew` · AGP **8.6.0** · Kotlin **1.9.24** |
| **Min iOS** | 12.0+ (use latest Xcode for current devices) |
| **Home URL** | Eastern Europe regional countdown (`kHomeUrl` in `lib/main.dart`) |
| **App icon** | `assets/logo.png` (GTA VI logo, committed) → `dart run flutter_launcher_icons` |

## Features

- Full-screen **WebView** of the live site (all web features: countdown, music, trailers, Newswire, backgrounds, pre-order, repo stats)
- **External links open in the system browser** (Safari on iOS / Chrome on Android) — Spotify, YouTube, Rockstar, GitHub, etc.
- **Same-origin embeds stay in-app** (only `gta-vi-countdown.onrender.com` navigates inside the WebView)
- Dark neon theme matching the site (`#1A0A2E`)

## Requirements

- [Flutter](https://docs.flutter.dev/get-started/install) 3.22+ (stable) — needed once for `pub get` / icons / iOS
- **Android builds:** JDK 17 · Android SDK · **Gradle 8.7** wrapper (`android/gradlew.bat` on Windows, `android/gradlew` on macOS/Linux)
- **iOS builds:** macOS + Xcode 15/16

## First-time setup

```bash
cd mobile

# Regenerate platform folders if ios/ or android/ are incomplete after clone:
flutter create . --project-name vi_countdown --org com.notcristi --platforms=android,ios

flutter pub get
dart run flutter_launcher_icons   # uses committed assets/logo.png
```

Create `android/local.properties` if it does not exist (Gradle needs the SDK path):

```properties
sdk.dir=C:\\Users\\YOU\\AppData\\Local\\Android\\Sdk
flutter.sdk=C:\\path\\to\\flutter
```

(On macOS/Linux use forward-slash paths, e.g. `sdk.dir=/Users/you/Library/Android/sdk`.)

---

## Android — build with the Gradle wrapper (recommended)

APKs are produced with the **included Gradle 8.7 wrapper**, not `flutter build`.

### Windows (`gradlew.bat`)

```bat
cd mobile\android

REM Debug APK
gradlew.bat assembleDebug

REM Release APK (signed with the debug keystore in this scaffold)
gradlew.bat assembleRelease
```

Outputs:

| Build | APK path |
|-------|----------|
| Debug | `mobile\android\app\build\outputs\apk\debug\app-debug.apk` |
| Release | `mobile\android\app\build\outputs\apk\release\app-release.apk` |

### macOS / Linux (`./gradlew`)

```bash
cd mobile/android
chmod +x gradlew   # once, if needed

./gradlew assembleDebug
./gradlew assembleRelease
```

Outputs:

| Build | APK path |
|-------|----------|
| Debug | `mobile/android/app/build/outputs/apk/debug/app-debug.apk` |
| Release | `mobile/android/app/build/outputs/apk/release/app-release.apk` |

### Useful Gradle tasks

```bat
gradlew.bat tasks
gradlew.bat clean
gradlew.bat assembleRelease --stacktrace
```

> **Note:** The Flutter Gradle plugin still compiles the Dart side. Keep the Flutter SDK installed and `flutter.sdk` set in `local.properties`. You do **not** need `flutter build apk` for everyday Android APKs.

---

### iOS (Mac only)

```bash
flutter build ios --release
# Open ios/Runner.xcworkspace in Xcode → Signing → your Team → Archive
# Or: flutter build ipa
```

Free Apple ID is enough to run on your own device; App Store distribution needs a paid membership.

## Integrity checklist (matches product requirements)

| Requirement | Status |
|-------------|--------|
| iOS app | ✅ Flutter `ios/` + `flutter build ios` / `ipa` |
| Android app | ✅ Build with **`gradlew.bat` / `gradlew assembleRelease`** (Gradle 8.7) |
| Gradle | ✅ **8.7** wrapper committed under `android/` |
| URL `…/eastern-europe` | ✅ `kHomeUrl` in `lib/main.dart` |
| App name **VI Countdown** | ✅ `MaterialApp.title` + Android label + iOS display name |
| External links → system browser | ✅ `LaunchMode.externalApplication` for non-site hosts |
| Site embeds stay in-app | ✅ Only `gta-vi-countdown.onrender.com` stays in WebView |
| Current iPhones / OS | ✅ Current Flutter + Xcode; raise `MinimumOSVersion` in Xcode if desired |
| GTA VI logo as icon | ✅ `mobile/assets/logo.png` committed; run `dart run flutter_launcher_icons` |
| Build IPA | ⚠️ On macOS + Xcode only |

## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two. Grand Theft Auto and related marks are trademarks of their respective owners.
