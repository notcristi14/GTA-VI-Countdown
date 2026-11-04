# VI Countdown — mobile app

Native-shell WebView app for the live GTA VI countdown (Android + iOS packaging):

**https://gta-vi-countdown.onrender.com/eastern-europe**

| | |
|---|---|
| **Display name** | **VI Countdown** |
| **Application ID / Bundle ID** | `com.notcristi.vicountdown` |
| **Min Android** | API 21 (Android 5.0+) |
| **Android build** | **Gradle 8.7** — use **`gradlew.bat`** (Windows) or **`gradlew`** (macOS/Linux) |
| **AGP / Kotlin** | **8.6.0** / **1.9.24** |
| **Home URL** | Eastern Europe regional countdown |
| **App icon** | `assets/logo.png` |

## Features

- Full-screen WebView of the live site (countdown, music, trailers, Newswire, backgrounds, pre-order, repo stats)
- External links open in the system browser (Safari / Chrome)
- Same-origin embeds stay in-app (`gta-vi-countdown.onrender.com` only)
- Dark neon theme (`#1A0A2E`)

## Requirements (Android APK)

- **JDK 17**
- **Android SDK** (API 21+)
- **Gradle 8.7 wrapper** (committed under `android/` — do not install Gradle separately)

Create `android/local.properties` before the first build:

```properties
sdk.dir=C:\\Users\\YOU\\AppData\\Local\\Android\\Sdk
```

(On macOS/Linux: `sdk.dir=/Users/you/Library/Android/sdk`.)

---

## Build the APK — Gradle wrapper only

**Do not use other CLI build tools for the APK.** Use the included wrapper.

### Windows — `gradlew.bat`

```bat
cd mobile\android

REM Debug APK
gradlew.bat assembleDebug

REM Release APK
gradlew.bat assembleRelease
```

| Build | Output |
|-------|--------|
| Debug | `mobile\android\app\build\outputs\apk\debug\app-debug.apk` |
| Release | `mobile\android\app\build\outputs\apk\release\app-release.apk` |

Useful:

```bat
gradlew.bat clean
gradlew.bat tasks
gradlew.bat assembleRelease --stacktrace
```

### macOS / Linux — `./gradlew`

```bash
cd mobile/android
chmod +x gradlew

./gradlew assembleDebug
./gradlew assembleRelease
```

| Build | Output |
|-------|--------|
| Debug | `mobile/android/app/build/outputs/apk/debug/app-debug.apk` |
| Release | `mobile/android/app/build/outputs/apk/release/app-release.apk` |

---

## iOS IPA — not built with `gradlew.bat`

`gradlew.bat` / Gradle only build **Android**. An **IPA** is an Apple package and must be produced on **macOS with Xcode** (Product → Archive → Distribute, or `xcodebuild`). There is no Gradle task that outputs an IPA.

Open the iOS project under `mobile/ios/` in Xcode, set your Team under Signing, then Archive.

---

## Integrity checklist

| Requirement | Status |
|-------------|--------|
| Android APK | ✅ **`gradlew.bat assembleRelease`** (or `./gradlew` on Unix) |
| Gradle | ✅ **8.7** wrapper under `android/` |
| URL `…/eastern-europe` | ✅ home URL in app |
| App name **VI Countdown** | ✅ Android label + iOS display name |
| External links → system browser | ✅ |
| Site embeds stay in-app | ✅ |
| GTA VI logo | ✅ `mobile/assets/logo.png` |
| IPA | ⚠️ macOS + Xcode only (not Gradle) |

## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two. Grand Theft Auto and related marks are trademarks of their respective owners.
