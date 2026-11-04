#!/bin/bash
set -euo pipefail
# Run on macOS with Xcode. Usage: ./build-ipa.sh YOUR_TEAM_ID

TEAM_ID="${1:-}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

ICON_DIR="VICountdown/Assets.xcassets/AppIcon.appiconset"
if [ ! -f "$ICON_DIR/icon-1024.png" ]; then
  echo "==> Generating AppIcon from ../logo.png…"
  python3 << 'PY'
from pathlib import Path
try:
    from PIL import Image, ImageDraw
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "-q"])
    from PIL import Image, ImageDraw
root = Path("VICountdown/Assets.xcassets/AppIcon.appiconset")
root.mkdir(parents=True, exist_ok=True)
src_path = Path("../logo.png")
if not src_path.exists():
    src_path = Path("logo.png")
src = Image.open(src_path).convert("RGBA")
size = 1024
icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(icon)
for y in range(size):
    t = y / (size - 1)
    r = int(26 + (255 - 26) * t * 0.55)
    g = int(10 + (105 - 10) * t * 0.45)
    b = int(46 + (180 - 46) * t * 0.7)
    draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
pad = 90
ratio = min((size - 2 * pad) / src.width, (size - 2 * pad) / src.height)
nw, nh = int(src.width * ratio), int(src.height * ratio)
logo = src.resize((nw, nh), Image.Resampling.LANCZOS)
icon.paste(logo, ((size - nw) // 2, (size - nh) // 2), logo)
master = icon.convert("RGB")
for name, s in {
    "icon-20.png": 20, "icon-29.png": 29, "icon-40.png": 40, "icon-58.png": 58,
    "icon-60.png": 60, "icon-76.png": 76, "icon-80.png": 80, "icon-87.png": 87,
    "icon-120.png": 120, "icon-152.png": 152, "icon-167.png": 167,
    "icon-180.png": 180, "icon-1024.png": 1024,
}.items():
    master.resize((s, s), Image.Resampling.LANCZOS).save(root / name, "PNG")
print("icons ok")
PY
fi

if [[ -z "$TEAM_ID" ]]; then
  echo "Usage: $0 YOUR_APPLE_TEAM_ID"
  echo "Find Team ID at https://developer.apple.com/account → Membership"
  exit 1
fi

mkdir -p build
echo "==> Archiving VI Countdown (Release)…"
xcodebuild -project VICountdown.xcodeproj \
  -scheme VICountdown \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ROOT/build/VICountdown.xcarchive" \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  CODE_SIGN_STYLE=Automatic \
  archive

python3 - << PY
import plistlib
from pathlib import Path
p = Path("ExportOptions.plist")
d = plistlib.loads(p.read_bytes())
d["teamID"] = "$TEAM_ID"
p.write_bytes(plistlib.dumps(d))
print("ExportOptions teamID =", d["teamID"])
PY

echo "==> Exporting IPA…"
xcodebuild -exportArchive \
  -archivePath "$ROOT/build/VICountdown.xcarchive" \
  -exportPath "$ROOT/build/ipa" \
  -exportOptionsPlist ExportOptions.plist

echo ""
echo "IPA ready:"
find "$ROOT/build/ipa" -name '*.ipa' -print
