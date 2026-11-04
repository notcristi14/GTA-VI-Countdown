# VI Countdown — Flutter app

Cross-platform (**iOS + Android**) WebView shell for the live GTA VI countdown:

**https://gta-vi-countdown.onrender.com/eastern-europe**

| | |
|---|---|
| **Display name** | **VI Countdown** |
| **Application ID / Bundle ID** | `com.notcristi.vicountdown` |
| **Min Android** | API 21 (Android 5.0+) |
| **Min iOS** | 12.0+ (use latest Xcode for current devices) |
| **Home URL** | Eastern Europe regional countdown (`kHomeUrl` in `lib/main.dart`) |
| **App icon** | `assets/logo.png` (GTA VI logo, committed) → `dart run flutter_launcher_icons` |

## Features

- Full-screen **WebView** of the live site (all web features: countdown, music, trailers, Newswire, backgrounds, pre-order, repo stats)
- **External links open in the system browser** (Safari on iOS / Chrome on Android) — Spotify, YouTube, Rockstar, GitHub, etc.
- **Same-origin embeds stay in-app** (only `gta-vi-countdown.onrender.com` navigates inside the WebView)
- Dark neon theme matching the site (`#1A0A2E`)

## Requirements

- [Flutter](https://docs.flutter.dev/get-started/install) 3.22+ (stable)
- **iOS builds:** macOS + Xcode 15/16
- **Android builds:** Android SDK / Android Studio

## First-time setup

```bash
cd mobile

# Regenerate platform folders if ios/ or android/ are incomplete after clone:
flutter create . --project-name vi_countdown --org com.notcristi --platforms=android,ios

flutter pub get
dart run flutter_launcher_icons   # uses committed assets/logo.png
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

Free Apple ID is enough to run on your own device; App Store distribution needs a paid membership.

## Integrity checklist (matches product requirements)

| Requirement | Status |
|-------------|--------|
| iOS app | ✅ Flutter `ios/` + `flutter build ios` / `ipa` |
| Android app | ✅ Flutter `android/` + `flutter build apk` |
| URL `…/eastern-europe` | ✅ `kHomeUrl` in `lib/main.dart` |
| App name **VI Countdown** | ✅ `MaterialApp.title` + Android label + iOS display name |
| External links → system browser | ✅ `LaunchMode.externalApplication` for non-site hosts |
| Site embeds stay in-app | ✅ Only `gta-vi-countdown.onrender.com` stays in WebView |
| Current iPhones / OS | ✅ Current Flutter + Xcode; raise `MinimumOSVersion` in Xcode if desired |
| GTA VI logo as icon | ✅ `mobile/assets/logo.png` committed; run `dart run flutter_launcher_icons` |
| Build IPA | ⚠️ On macOS + Xcode only |

## Legal

Fan-made companion. Not affiliated with Rockstar Games / Take-Two. Grand Theft Auto and related marks are trademarks of their respective owners.
