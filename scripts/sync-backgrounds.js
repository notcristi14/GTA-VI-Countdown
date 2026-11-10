#!/usr/bin/env node
/**
 * Sync official Rockstar artwork backgrounds into bgs/ and the HTML seed list.
 *
 * Flow:
 *  1. HEAD the Rockstar Artwork & Wallpapers ZIP (and optionally hit /api/backgrounds)
 *  2. Compare etag / last-modified / content-length to bgs/.rockstar-meta.json
 *  3. If unchanged → exit 0 (no-op)
 *  4. If changed (or --force) → download ZIP, extract image files, merge into bgs/
 *  5. Rewrite the `let backgrounds = [...]` seed in gta-vi-countdown.html
 *  6. Write updated meta; exit 0
 *
 * Env:
 *   BACKGROUNDS_API_URL  — default https://gta-vi-countdown.onrender.com/api/backgrounds
 *   ROCKSTAR_ARTWORK_ZIP — override pack URL
 *   FORCE_SYNC=1         — skip change detection
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BGS_DIR = path.join(ROOT, 'bgs');
const META_PATH = path.join(BGS_DIR, '.rockstar-meta.json');
const HTML_PATH = path.join(ROOT, 'gta-vi-countdown.html');
const DEFAULT_ZIP =
  'https://media-rockstargames-com.akamaized.net/VI/downloads/artwork_wallpapers/GTAVI_Artwork_Wallpapers.zip';
const DEFAULT_API = 'https://gta-vi-countdown.onrender.com/api/backgrounds';
const BG_EXT = /\.(jpe?g|png|webp)$/i;

const ZIP_URL = process.env.ROCKSTAR_ARTWORK_ZIP || DEFAULT_ZIP;
const API_URL = process.env.BACKGROUNDS_API_URL || DEFAULT_API;
const FORCE = process.env.FORCE_SYNC === '1' || process.argv.includes('--force');

function request(method, url, opts = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(
      url,
      {
        method,
        headers: Object.assign(
          { 'User-Agent': 'GTA-VI-Countdown-BackgroundSync/1.0' },
          opts.headers || {}
        )
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return request(method, res.headers.location, opts).then(resolve).catch(reject);
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          resolve({ status: res.statusCode, headers: res.headers, body: buf });
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(opts.timeout || 120000, () => req.destroy(new Error(method + ' timeout')));
    req.end();
  });
}

async function headMeta(url) {
  const res = await request('HEAD', url, { timeout: 30000 });
  if (res.status !== 200 && res.status !== 206) {
    throw new Error('HEAD status ' + res.status);
  }
  return {
    lastModified: res.headers['last-modified'] || null,
    contentLength: res.headers['content-length'] || null,
    etag: res.headers.etag || null
  };
}

function readMeta() {
  try {
    return JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
  } catch (_) {
    return {};
  }
}

function writeMeta(meta) {
  fs.writeFileSync(
    META_PATH,
    JSON.stringify(
      Object.assign({}, meta, { updatedAt: new Date().toISOString() }),
      null,
      2
    ) + '\n'
  );
}

function listLocal() {
  if (!fs.existsSync(BGS_DIR)) fs.mkdirSync(BGS_DIR, { recursive: true });
  return fs
    .readdirSync(BGS_DIR)
    .filter((f) => BG_EXT.test(f) && !f.startsWith('.'))
    .sort((a, b) => {
      if (a.toLowerCase().startsWith('main.')) return -1;
      if (b.toLowerCase().startsWith('main.')) return 1;
      return a.localeCompare(b);
    });
}

function metaUnchanged(prev, next) {
  if (!prev || !next) return false;
  if (prev.etag && next.etag && prev.etag === next.etag) return true;
  if (
    prev.lastModified &&
    next.lastModified &&
    prev.lastModified === next.lastModified &&
    prev.contentLength &&
    next.contentLength &&
    String(prev.contentLength) === String(next.contentLength)
  ) {
    return true;
  }
  return false;
}

function updateHtmlSeed(files) {
  let html = fs.readFileSync(HTML_PATH, 'utf8');
  const arr = files.map((f) => "'" + f.replace(/'/g, "\\'") + "'").join(', ');
  const next = 'let backgrounds = [' + arr + '];';
  const re = /let backgrounds = \[[^\]]*\];/;
  if (!re.test(html)) {
    throw new Error('Could not find `let backgrounds = [...]` in gta-vi-countdown.html');
  }
  html = html.replace(re, next);
  fs.writeFileSync(HTML_PATH, html);
}

async function fetchLiveApi() {
  try {
    const res = await request('GET', API_URL, { timeout: 20000 });
    if (res.status !== 200) return null;
    return JSON.parse(res.body.toString('utf8'));
  } catch (_) {
    return null;
  }
}

async function downloadZip(dest) {
  console.log('Downloading artwork pack…');
  const res = await request('GET', ZIP_URL, { timeout: 600000 });
  if (res.status !== 200) throw new Error('ZIP GET status ' + res.status);
  fs.writeFileSync(dest, res.body);
  console.log('Downloaded', res.body.length, 'bytes');
}

function extractImages(zipPath, outDir) {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'gta-bgs-'));
  try {
    execFileSync('unzip', ['-o', '-q', zipPath, '-d', tmp], { stdio: 'inherit' });
  } catch (err) {
    execFileSync(
      'python3',
      [
        '-c',
        '\nimport zipfile, sys, os\nz = zipfile.ZipFile(sys.argv[1])\nz.extractall(sys.argv[2])\n',
        zipPath,
        tmp
      ],
      { stdio: 'inherit' }
    );
  }

  const added = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (BG_EXT.test(name) && !name.startsWith('.')) {
        const base = path.basename(name);
        const dest = path.join(outDir, base);
        fs.copyFileSync(full, dest);
        added.push(base);
      }
    }
  }
  walk(tmp);
  try {
    fs.rmSync(tmp, { recursive: true, force: true });
  } catch (_) {}
  return added;
}

async function main() {
  console.log('Background sync starting…');
  console.log('ZIP:', ZIP_URL);
  console.log('API:', API_URL);

  const live = await fetchLiveApi();
  if (live && live.rockstar) {
    console.log('Live /api/backgrounds count:', live.count, 'changed flag:', live.rockstar.changed);
  }

  const remote = await headMeta(ZIP_URL);
  console.log('Remote pack meta:', remote);
  const prev = readMeta();

  if (!FORCE && metaUnchanged(prev, remote)) {
    console.log('No pack change detected — nothing to do.');
    const files = listLocal();
    updateHtmlSeed(files);
    process.exit(0);
  }

  if (FORCE) console.log('FORCE_SYNC enabled — downloading pack');
  else console.log('Pack changed — downloading');

  const zipPath = path.join(require('os').tmpdir(), 'GTAVI_Artwork_Wallpapers.zip');
  await downloadZip(zipPath);
  const beforeFiles = new Set(listLocal());
  const extracted = extractImages(zipPath, BGS_DIR);
  try {
    fs.unlinkSync(zipPath);
  } catch (_) {}

  const after = listLocal();
  const newOnes = after.filter((f) => !beforeFiles.has(f));
  console.log('Extracted/copied images:', extracted.length);
  console.log('New files vs previous bgs/:', newOnes.length ? newOnes.join(', ') : '(none — same names updated)');

  writeMeta(remote);
  updateHtmlSeed(after);
  console.log('Updated HTML seed list (' + after.length + ' backgrounds)');
  console.log('Done.');
}

main().catch((err) => {
  console.error('sync-backgrounds failed:', err && err.stack ? err.stack : err);
  process.exit(1);
});
