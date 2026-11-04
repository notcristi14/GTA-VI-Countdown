#!/usr/bin/env bash
# Generate iOS AppIcon + Android mipmap launcher icons from logo.png
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOGO="${ROOT}/logo.png"
BG="#1A0A2E"

if [[ ! -f "$LOGO" ]]; then
  echo "Missing $LOGO" >&2
  exit 1
fi

if ! command -v convert >/dev/null 2>&1; then
  echo "ImageMagick 'convert' required (e.g. apt install imagemagick)" >&2
  exit 1
fi

TMP="$(mktemp -t appicon-XXXXXX.png)"
trap 'rm -f "$TMP"' EXIT

echo "Building 1024×1024 square icon on $BG …"
convert "$LOGO" -resize 1024x1024 -background "$BG" -gravity center -extent 1024x1024 "$TMP"

# iOS
IOS_DIR="${ROOT}/mobile/ios/VICountdown/Assets.xcassets/AppIcon.appiconset"
mkdir -p "$IOS_DIR"
cp "$TMP" "${IOS_DIR}/AppIcon-1024.png"
cat > "${IOS_DIR}/Contents.json" << 'JSON'
{
  "images" : [
    {
      "filename" : "AppIcon-1024.png",
      "idiom" : "universal",
      "platform" : "ios",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
JSON
echo "  → ${IOS_DIR}/AppIcon-1024.png"

# Android densities
RES="${ROOT}/mobile/android/app/src/main/res"
declare -A SIZES=( [mdpi]=48 [hdpi]=72 [xhdpi]=96 [xxhdpi]=144 [xxxhdpi]=192 )
for dens in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  dir="${RES}/mipmap-${dens}"
  mkdir -p "$dir"
  size="${SIZES[$dens]}"
  convert "$TMP" -resize "${size}x${size}" "${dir}/ic_launcher.png"
  convert "$TMP" -resize "${size}x${size}" "${dir}/ic_launcher_round.png"
  echo "  → ${dir}/ic_launcher.png (${size}px)"
done

echo "Done. Rebuild the apps to pick up the new icons."
