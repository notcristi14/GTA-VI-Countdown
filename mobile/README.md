# VI Countdown — mobile app

WebView shell for the live GTA VI countdown:

**https://gta-vi-countdown.onrender.com/eastern-europe**

| | |
|---|---|
| **Display name** | **VI Countdown** |
| **Application ID** | `com.notcristi.vicountdown` |
| **Min Android** | API 21 |
| **Android build** | **Gradle 8.7** — **`gradlew.bat`** (Windows) / **`gradlew`** (macOS/Linux) |
| **Config** | `mobile/android/settings.gradle` + `mobile/android/local.properties` |

## Files you need under `mobile/android/`

| File | Purpose |
|------|--------|
| `settings.gradle` | Gradle project settings (committed) |
| `local.properties` | **SDK paths on your PC** (committed with Windows defaults — edit if needed) |
| `gradlew.bat` | Windows build entry point |
| `gradlew` | macOS/Linux build entry point |

### `local.properties` (already in the repo)

Default Windows paths:

```properties
sdk.dir=C:\\Users\\User\\AppData\\Local\\Android\\Sdk
flutter.sdk=C:\\src\\flutter
```

If your Android SDK or Flutter SDK is elsewhere, edit `mobile\android\local.properties` before building.

---

## Build the APK (Windows)

```bat
cd C:\Users\User\Downloads\GTA-VI-Countdown\mobile\android

gradlew.bat assembleDebug
gradlew.bat assembleRelease
```

| Build | Output |
|-------|--------|
| Debug | `app\build\outputs\apk\debug\app-debug.apk` |
| Release | `app\build\outputs\apk\release\app-release.apk` |

```bat
gradlew.bat clean
gradlew.bat assembleRelease --stacktrace
```

## Build the APK (macOS / Linux)

```bash
cd mobile/android
chmod +x gradlew
./gradlew assembleRelease
```

## iOS IPA

Not built with `gradlew.bat`. Use **Xcode on macOS** (open `mobile/ios/`, Archive).

## Requirements

- JDK 17
- Android SDK at the path in `local.properties` → `sdk.dir`
- Flutter SDK at the path in `local.properties` → `flutter.sdk` (used by the Android Gradle plugin)

## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two.
