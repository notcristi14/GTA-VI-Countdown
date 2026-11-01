const https = require('https');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const Module = require('module');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'GTA-VI-Countdown' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => res.statusCode === 200 ? resolve(d) : reject(new Error('status ' + res.statusCode)));
    }).on('error', reject);
  });
}

function restoreHtml() {
  try {
    const b64 = [0,1,2,3,4,5,6,7].map(function (i) {
      return fs.readFileSync(path.join(__dirname, 'html.p' + i), 'utf8');
    }).join('');
    const html = zlib.inflateSync(Buffer.from(b64, 'base64'));
    const out = path.join(__dirname, 'gta-vi-countdown.html');
    let existing = '';
    try { existing = fs.readFileSync(out, 'utf8'); } catch (_) {}
    if (!existing || existing.indexOf('RESTORE_IN_PROGRESS') >= 0 || existing.length < 1000) {
      fs.writeFileSync(out, html);
      console.log('  \ud83d\udcc4  Restored gta-vi-countdown.html (' + html.length + ' bytes)');
    }
  } catch (err) {
    console.log('  \ud83d\udcc4  HTML restore skipped:', err && err.message ? err.message : err);
  }
}

(async () => {
  restoreHtml();
  const url = 'https://raw.githubusercontent.com/notcristi14/GTA-VI-Countdown/c7df45d79b662fbdceab17fe2a4f14afea4811b1/app.js';
  let code = await get(url);
  const marker = "app.get('/api/stats'";
  const hook = `
try {
  require('./music-discovery')(app, {
    fetchText,
    trailersCache,
    TRAILERS_CACHE_MS,
    fetchRockstarGtaViVideos,
    mergeTrailers
  });
} catch (err) {
  console.log('  \ud83c\udfb5  music-discovery load failed:', err && err.message ? err.message : err);
}

`;
  if (code.indexOf('music-discovery') < 0 && code.indexOf(marker) >= 0) {
    code = code.replace(marker, hook + marker);
  }
  const filename = path.join(__dirname, 'app.runtime.js');
  const m = new Module(filename);
  m.filename = filename;
  m.paths = Module._nodeModulePaths(__dirname);
  m._compile(code, filename);
})().catch((err) => {
  console.error('Failed to bootstrap app.js:', err);
  process.exit(1);
});
