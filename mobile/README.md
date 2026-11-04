# VI Countdown — Flutter app

Cross-platform (iOS + Android) wrapper for the live GTA VI countdown:

**https://gta-vi-countdown.onrender.com/eastern-europe**

| | |
|---|---|
| **Display name** | **VI Countdown** |
| **Application ID / Bundle ID** | `com.notcristi.vicountdown` |
| **Min Android** | API 21 (Android 5.0+) |
| **Min iOS** | 12.0+ (use latest Xcode for current devices) |
| **Home URL** | Eastern Europe regional countdown |
| **Icon** | Copy repo-root `logo.png` → `assets/logo.png`, then `dart run flutter_launcher_icons` |

## Features

- Full-screen **WebView** of the live site
- **External links open in the system browser** (Safari / Chrome) — Spotify, YouTube, Rockstar, Netflix, GitHub, etc.
- Site embeds (Spotify / YouTube players) stay **in-app**
- Dark neon theme matching the site (`#1A0A2E`)

## Requirements

- [Flutter](https://docs.flutter.dev/get-started/install) 3.22+ (stable)
- For iOS builds: macOS + Xcode 15/16
- For Android builds: Android SDK / Android Studio

## Run

```bash
cd mobile
# First time on a fresh clone — regenerate platform folders if needed:
flutter create . --project-name vi_countdown --org com.notcristi --platforms=android,ios

cp ../logo.png assets/logo.png   # app icon source
flutter pub get
dart run flutter_launcher_icons
flutter run
```

### Android release APK

```bash
flutter build apk --release
# → build/app/outputs/flutter-apk/app-release.apk
```

### iOS (Mac only)

```bash
flutter build ios --release
# Open ios/Runner.xcworkspace in Xcode → Signing → your Team → Archive
# Or: flutter build ipa
```

## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two. Grand Theft Auto and related marks are trademarks of their respective owners.
