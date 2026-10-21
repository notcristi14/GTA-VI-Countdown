# Launcher assets

## `GtaLogo.ico` (required for branded exe icon)

Place the **GTA VI logo** icon here as `GtaLogo.ico`. CMake embeds it into `GtaViCountdown.exe`.

### Restore from git history

The file previously lived at `desktop/GtaViCountdownWpf/Assets/GtaLogo.ico`. Restore it with:

```bash
mkdir -p launcher/assets
git show d93ba1c9:desktop/GtaViCountdownWpf/Assets/GtaLogo.ico > launcher/assets/GtaLogo.ico
git add launcher/assets/GtaLogo.ico
git commit -m "Restore GtaLogo.ico under launcher/assets"
```

Or download from that commit on GitHub and save as `launcher/assets/GtaLogo.ico`.
