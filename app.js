/**
 * Bootstrap: load last good app.js body from GitHub, then register backgrounds.
 * (Recovered after a truncated push; once stable, replace with the full monolith.)
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const GOOD_SHA = 'a14a65624599c25dbd0e40f8cb73c47a3931b9e0';
const CACHE = path.join(__dirname, '.app-body-cache.js');

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'GTA-VI-Countdown-restore', Accept: 'application/vnd.github.raw' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('status ' + res.statusCode));
      }
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  let body;
  try {
    if (fs.existsSync(CACHE)) {
      body = fs.readFileSync(CACHE, 'utf8');
    } else {
      const url = 'https://raw.githubusercontent.com/notcristi14/GTA-VI-Countdown/' + GOOD_SHA + '/app.js';
      body = await fetchText(url);
      fs.writeFileSync(CACHE, body, 'utf8');
    }
  } catch (err) {
    console.error('Failed to restore app body:', err && err.message ? err.message : err);
    process.exit(1);
  }

  // Patch: ensure backgrounds-api is registered before static
  if (!body.includes("require('./backgrounds-api')")) {
    body = body.replace(
      'app.use(express.static(__dirname));',
      "try { require('./backgrounds-api').registerBackgrounds(app); } catch (e) { console.log('  🖼️  backgrounds-api:', e && e.message ? e.message : e); }\napp.use(express.static(__dirname));"
    );
  }

  const tmp = path.join(__dirname, '.app-body-run.js');
  fs.writeFileSync(tmp, body, 'utf8');
  require(tmp);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
