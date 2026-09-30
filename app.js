const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const NEWS_CACHE_MS = 10 * 60 * 1000;
const NEWSWIRE_URL = 'https://www.rockstargames.com/newswire';
const NEWS_FEED =
  'https://news.google.com/rss/search?q=site:rockstargames.com/newswire&hl=en-US&gl=US&ceid=US:en';


function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 GTA-VI-Countdown' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('status ' + res.statusCode));
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(12000, () => req.destroy(new Error('timeout')));
  });
}

function decode(str) {
  return String(str || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseRss(xml) {
  return xml.split('<item>').slice(1).reduce((items, block) => {
    const title = decode((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
    if (!title) return items;

    const link = decode((block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '');
    const pub = decode((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '');
    const parsed = pub ? new Date(pub) : null;

    items.push({
      title: title.replace(/\s+-\s+Rockstar Games\s*$/i, ''),
      date: parsed && !isNaN(parsed)
        ? parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '',
      category: 'Rockstar Newswire',
      url: link || NEWSWIRE_URL
    });
    return items;
  }, []);
}

let newsCache = { at: 0, items: [] };


const fs = require('fs');
const crypto = require('crypto');
const STATS_FILE = path.join(__dirname, 'stats.json');
function readStats() {
  try {
    const s = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    if (!Array.isArray(s.ids)) s.ids = [];
    return s;
  } catch (_) {
    return { visits: 0, events: 0, visitors: 0, ids: [] };
  }
}
function writeStats(s) {
  try { fs.writeFileSync(STATS_FILE, JSON.stringify(s)); } catch (_) {}
}

function b64url(value) {
  const buf = Buffer.isBuffer(value)
    ? value
    : Buffer.from(typeof value === 'string' ? value : JSON.stringify(value));
  return buf.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function gaConfigured() {
  return process.env.GA_PROPERTY_ID && process.env.GA_CLIENT_EMAIL && process.env.GA_PRIVATE_KEY;
}

function normalizeKey(key) {
  let k = String(key || '').trim();
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1);
  }
  return k.replace(/\r/g, '').replace(/\\n/g, '\n').trim();
}

let gaToken = { access: '', exp: 0 };
function getGaToken() {
  if (gaToken.access && Date.now() < gaToken.exp - 30000) return Promise.resolve(gaToken.access);
  const email = String(process.env.GA_CLIENT_EMAIL || '').trim();
  let key = normalizeKey(process.env.GA_PRIVATE_KEY);
  if (key && !key.includes('BEGIN PRIVATE KEY')) {
    key = '-----BEGIN PRIVATE KEY-----\n' + key + '\n-----END PRIVATE KEY-----\n';
  }
  const now = Math.floor(Date.now() / 1000);
  const header = b64url({ alg: 'RS256', typ: 'JWT' });
  const claim = b64url({
    iss: email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  });
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(header + '.' + claim);
  const jwt = header + '.' + claim + '.' + b64url(sign.sign(key));
  const body = 'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') +
    '&assertion=' + encodeURIComponent(jwt);
  return new Promise((resolve, reject) => {
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.access_token) return reject(new Error(json.error || 'no token'));
          gaToken = { access: json.access_token, exp: Date.now() + (json.expires_in || 3600) * 1000 };
          resolve(gaToken.access);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

let gaStatsCache = { at: 0, data: null };
const GA_CACHE_MS = 3 * 60 * 60 * 1000;
function fetchGaStats() {
  const propertyId = String(process.env.GA_PROPERTY_ID).replace(/^properties\//, '');
  const payload = JSON.stringify({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }]
  });
  return getGaToken().then((token) => new Promise((resolve, reject) => {
    const req = https.request(
      'https://analyticsdata.googleapis.com/v1beta/properties/' + propertyId + ':runReport',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const row = (json.rows && json.rows[0] && json.rows[0].metricValues) || [];
            resolve({
              visits: Number((row[0] && row[0].value) || 0),
              events: Number((row[1] && row[1].value) || 0),
              source: 'ga4'
            });
          } catch (e) { reject(e); }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  }));
}

app.get('/api/stats', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (gaConfigured()) {
    try {
      if (gaStatsCache.data && Date.now() - gaStatsCache.at < GA_CACHE_MS) {
        return res.json(gaStatsCache.data);
      }
      const data = await fetchGaStats();
      gaStatsCache = { at: Date.now(), data };
      return res.json(data);
    } catch (err) {
      console.log('  📊  GA stats unavailable:', err && err.message ? err.message : err);
      return res.json({ configured: false, source: 'none' });
    }
  }
  res.json({ configured: false, source: 'none' });
});

app.get('/api/news', async (_req, res) => {
  try {
    const fresh = newsCache.at && Date.now() - newsCache.at < NEWS_CACHE_MS && newsCache.items.length;
    if (fresh) {
      return res.json({ items: newsCache.items, source: 'cache' });
    }

    const items = parseRss(await fetchText(NEWS_FEED)).slice(0, 8);
    if (items.length) {
      newsCache = { at: Date.now(), items };
      return res.json({ items, source: 'live' });
    }
  } catch (_) {
    // Live feed unavailable.
  }

  res.json({ items: [], source: 'live' });
});

app.use(express.static(__dirname));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'gta-vi-countdown.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('  🌴  GTA VI Countdown');
  console.log(`  🚗  Running at http://localhost:${PORT}`);
  console.log('  🎮  Regions, Newswire & Vice City backgrounds ready');
  if (gaConfigured()) {
    console.log('  📊  Google Analytics stats: env vars present');
  } else {
    console.log('  📊  Google Analytics stats: env vars not set — using local counter');
    console.log('      Set GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY to use GA4');
  }
  console.log('');
});
