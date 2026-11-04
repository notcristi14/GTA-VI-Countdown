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
- Path to the **Flutter SDK** (required by the Android Gradle plugin in this project)
- **Gradle 8.7 wrapper** (committed under `android/`)

---

## Fix: `local.properties` (required before first build)

If you see:

```text
local.properties (The system cannot find the file specified)
```

the project is missing machine-specific paths. Create the file once:

### Windows

1. Open folder: `GTA-VI-Countdown\mobile\android\`
2. Copy `local.properties.example` → rename copy to **`local.properties`**
3. Edit `local.properties` (use your real paths):

```properties
sdk.dir=C:\\Users\\User\\AppData\\Local\\Android\\Sdk
flutter.sdk=C:\\src\\flutter
```

Or from **cmd** in `mobile\android`:

```bat
copy local.properties.example local.properties
notepad local.properties
```

Typical Android SDK location on Windows:

`C:\Users\User\AppData\Local\Android\Sdk`

### macOS / Linux

```bash
cd mobile/android
cp local.properties.example local.properties
# edit sdk.dir and flutter.sdk
```

---

## Build the APK — Gradle wrapper only

### Windows — `gradlew.bat`

```bat
cd mobile\android

gradlew.bat assembleDebug
gradlew.bat assembleRelease
```

| Build | Output |
|-------|--------|
| Debug | `mobile\android\app\build\outputs\apk\debug\app-debug.apk` |
| Release | `mobile\android\app\build\outputs\apk\release\app-release.apk` |

```bat
gradlew.bat clean
gradlew.bat assembleRelease --stacktrace
```

### macOS / Linux — `./gradlew`

```bash
cd mobile/android
chmod +x gradlew
./gradlew assembleDebug
./gradlew assembleRelease
```

---

## iOS IPA — not built with `gradlew.bat`

Gradle only builds **Android**. An **IPA** needs **macOS + Xcode** (Product → Archive). Open `mobile/ios/` in Xcode, set Signing Team, then Archive.

---

## Integrity checklist

| Requirement | Status |
|-------------|--------|
| Android APK | ✅ `gradlew.bat assembleRelease` after `local.properties` exists |
| Gradle | ✅ **8.7** wrapper under `android/` |
| URL `…/eastern-europe` | ✅ home URL in app |
| App name **VI Countdown** | ✅ |
| External links → system browser | ✅ |
| Site embeds stay in-app | ✅ |
| GTA VI logo | ✅ `mobile/assets/logo.png` |
| IPA | ⚠️ macOS + Xcode only (not Gradle) |

## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two. Grand Theft Auto and related marks are trademarks of their respective owners.
