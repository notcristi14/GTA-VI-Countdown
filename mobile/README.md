# VI Countdown — Android app (Gradle only)

Pure **Android / Kotlin / Gradle** WebView shell — **no Flutter**.

**https://gta-vi-countdown.onrender.com/eastern-europe**

| | |
|---|---|
| **Display name** | **VI Countdown** |
| **Application ID** | `com.notcristi.vicountdown` |
| **Min Android** | API 21 |
| **Build** | **Gradle 8.7** via `gradlew.bat` / `gradlew` |
| **AGP / Kotlin** | 8.6.0 / 1.9.24 |

## Requirements

- **JDK 17**
- **Android SDK** (path in `local.properties`)
- **No Flutter SDK**

### `local.properties`

```properties
sdk.dir=C:\\Users\\User\\AppData\\Local\\Android\\Sdk
```

Edit if your SDK is elsewhere. There is **no** `flutter.sdk` line.

---

## Build APK (Windows)

```bat
cd mobile\android

gradlew.bat assembleDebug
gradlew.bat assembleRelease
```

| Build | APK |
|-------|-----|
| Debug | `app\build\outputs\apk\debug\app-debug.apk` |
| Release | `app\build\outputs\apk\release\app-release.apk` |

```bat
gradlew.bat clean
gradlew.bat assembleRelease --stacktrace
```

## Build APK (macOS / Linux)

```bash
cd mobile/android
chmod +x gradlew
./gradlew assembleRelease
```

## Features

- Full-screen WebView of the live site
- Same-origin (`gta-vi-countdown.onrender.com`) stays in-app
- Other links open in the system browser
- Dark theme `#1A0A2E`

## Project layout

```
mobile/android/
  settings.gradle          # pure Gradle (no Flutter plugins)
  local.properties         # sdk.dir only
  gradlew.bat / gradlew
  app/
    build.gradle
    src/main/kotlin/.../MainActivity.kt
```

## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two.
