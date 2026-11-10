# VI Countdown — mobile apps

Native WebView shells for the live GTA VI countdown. **No Flutter.**

| Platform | Stack | Home URL | Build |
|----------|--------|----------|--------|
| **Android** | Kotlin + WebView + **Gradle 8.7** (AGP 8.6.0, Kotlin 1.9.24) | `https://gta-vi-countdown.onrender.com/` | `gradlew.bat assembleRelease` |
| **iOS** | Swift + **WKWebView** + Xcode | `https://gta-vi-countdown.onrender.com/` | Open `VICountdown.xcodeproj` → Archive |

Shared behavior (from source):

- Display name **VI Countdown** · Application ID / bundle **`com.notcristi.vicountdown`**
- Allowed in-app host: **`gta-vi-countdown.onrender.com`**
- Other http(s) hosts and non-http schemes open in the **system browser**
- Theme background **#1A0A2E**
- iOS app icon asset: **AppIcon-1024.png present**

---

## Android (Gradle only)

### Requirements

- JDK 17 · Android SDK
- `mobile/android/local.properties` → `sdk.dir=...` only (no Flutter SDK)

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

**Source:** `mobile/android/app/src/main/kotlin/com/notcristi/vicountdown/MainActivity.kt`

---

## iOS (native Swift / Xcode)

### Requirements

- **macOS** + **Xcode 15+**
- Apple ID (free for device install; paid team for App Store)

### Open & run

1. Open **`mobile/ios/VICountdown.xcodeproj`** in Xcode
2. Select target **VICountdown**
3. **Signing & Capabilities** → choose your **Team**
4. Run on a simulator or device

### Build IPA

Product → **Archive** → Organizer → **Distribute App**

**Source:** `mobile/ios/VICountdown/ViewController.swift`

---

## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two.

<!-- AUTO-GENERATED: readme-integrity-check — do not edit by hand -->
## 🔍 Automated integrity status

Last run: **2026-11-10T13:24:53.813Z** · Failed mobile checks: **2**

- ❌ **Android home /eastern-europe** — home is site root
- ❌ **iOS home /eastern-europe** — home is site root

*From `scripts/readme-integrity-check.js`.*
<!-- END AUTO-GENERATED -->

