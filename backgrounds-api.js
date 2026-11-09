/**
 * Official Rockstar Artwork & Wallpapers backgrounds
 * registerBackgrounds(app) — mounts /api/backgrounds and starts 6h pack check
 */
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const BGS_DIR = path.join(__dirname, 'bgs');
const ROCKSTAR_ARTWORK_ZIP =
  'https://media-rockstargames-com.akamaized.net/VI/downloads/artwork_wallpapers/GTAVI_Artwork_Wallpapers.zip';
const BGS_CHECK_MS = 6 * 60 * 60 * 1000; // 6 hours
const BG_EXT = /\.(jpe?g|png|webp)$/i;

function listLocalBackgrounds() {
  try {
    return fs
      .readdirSync(BGS_DIR)
      .filter((f) => BG_EXT.test(f) && !f.startsWith('.'))
      .sort((a, b) => {
        if (a.toLowerCase().startsWith('main.')) return -1;
        if (b.toLowerCase().startsWith('main.')) return 1;
        return a.localeCompare(b);
      });
  } catch (_) {
    return [];
  }
}

let backgroundsCache = { at: 0, files: listLocalBackgrounds() };
let rockstarArtworkMeta = {
  checkedAt: 0,
  lastModified: null,
  contentLength: null,
  etag: null,
  changed: false,
  error: null
};

function headRequest(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0 GTA-VI-Countdown' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return headRequest(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200 && res.statusCode !== 206) {
        res.resume();
        return reject(new Error('HEAD status ' + res.statusCode));
      }
      resolve({
        lastModified: res.headers['last-modified'] || null,
        contentLength: res.headers['content-length'] || null,
        etag: res.headers.etag || null
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('HEAD timeout')));
    req.end();
  });
}

async function checkRockstarArtworkPack() {
  try {
    const meta = await headRequest(ROCKSTAR_ARTWORK_ZIP);
    const prev = rockstarArtworkMeta;
    const changed =
      (prev.lastModified && meta.lastModified && prev.lastModified !== meta.lastModified) ||
      (prev.contentLength && meta.contentLength && prev.contentLength !== meta.contentLength) ||
      (prev.etag && meta.etag && prev.etag !== meta.etag);
    rockstarArtworkMeta = {
      checkedAt: Date.now(),
      lastModified: meta.lastModified,
      contentLength: meta.contentLength,
      etag: meta.etag,
      changed: !!changed && !!prev.lastModified,
      error: null
    };
    if (rockstarArtworkMeta.changed) {
      console.log('  🖼️  Rockstar Artwork & Wallpapers pack changed (Last-Modified / size). Re-download landscape JPGs into bgs/ and redeploy.');
    }
    backgroundsCache = { at: Date.now(), files: listLocalBackgrounds() };
    return rockstarArtworkMeta;
  } catch (err) {
    rockstarArtworkMeta = Object.assign({}, rockstarArtworkMeta, {
      checkedAt: Date.now(),
      error: err && err.message ? err.message : String(err)
    });
    return rockstarArtworkMeta;
  }
}

function registerBackgrounds(app) {
  app.get('/api/backgrounds', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    const files = listLocalBackgrounds();
    backgroundsCache = { at: Date.now(), files };
    res.json({
      files,
      count: files.length,
      rockstar: {
        zip: ROCKSTAR_ARTWORK_ZIP,
        checkedAt: rockstarArtworkMeta.checkedAt || null,
        lastModified: rockstarArtworkMeta.lastModified,
        contentLength: rockstarArtworkMeta.contentLength,
        changed: rockstarArtworkMeta.changed,
        error: rockstarArtworkMeta.error
      }
    });
  });

  setInterval(function () {
    checkRockstarArtworkPack().catch(function () {});
  }, BGS_CHECK_MS);
  checkRockstarArtworkPack().catch(function () {});
}

module.exports = { registerBackgrounds, listLocalBackgrounds };
