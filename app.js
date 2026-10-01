const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const NEWS_CACHE_MS = 30 * 1000;
const NEWSWIRE_URL = 'https://www.rockstargames.com/newswire';
const NEWS_FEED =
  'https://graph.rockstargames.com/?origin=https://www.rockstargames.com&operationName=NewswireList&variables=' +
  encodeURIComponent(JSON.stringify({
    tagIdHash: null,
    page: 1,
    metaUrl: '/newswire',
    limit: 8,
    locale: 'en_us'
  })) +
  '&extensions=' +
  encodeURIComponent(JSON.stringify({
    persistedQuery: {
      version: 1,
      sha256Hash: '7ec00215aecc70de257b0719a1dfcfa84fe57fdc7bf5c10ec2e8f377defede58'
    }
  }));

function fetchText(url, extraHeaders) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: Object.assign({ 'User-Agent': 'Mozilla/5.0 GTA-VI-Countdown' }, extraHeaders || {})
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

function parseNewswire(payload) {
  const results = payload && payload.data && payload.data.posts && payload.data.posts.results;
  if (!Array.isArray(results)) return [];
  return results.reduce((items, post) => {
    const title = decode(post && post.title);
    if (!title) return items;
    const path = post.url ? String(post.url) : '';
    const tag = post.primary_tags && post.primary_tags[0] && post.primary_tags[0].name;
    items.push({
      title,
      date: post.created_formatted || post.created || '',
      category: tag || 'Rockstar Newswire',
      url: path ? 'https://www.rockstargames.com' + path : NEWSWIRE_URL
    });
    return items;
  }, []);
}

let newsCache = { at: 0, items: [] };

const crypto = require('crypto');
const GA_CACHE_MS = 30 * 1000;
const GA_UNAVAILABLE = { source: 'unavailable' };

function b64url(value) {
  const buf = Buffer.isBuffer(value)
    ? value
    : Buffer.from(typeof value === 'string' ? value : JSON.stringify(value));
  return buf.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function gaPropertyId() {
  return String(process.env.GA_PROPERTY_ID || '')
    .trim()
    .replace(/^properties\//, '')
    .replace(/^G-/i, '');
}

function gaConfigured() {
  const propertyId = gaPropertyId();
  return Boolean(
    /^\d{6,12}$/.test(propertyId) &&
    process.env.GA_CLIENT_EMAIL &&
    process.env.GA_PRIVATE_KEY
  );
}

function normalizeKey(key) {
  let k = String(key || '').trim();
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1);
  }
  k = k.replace(/\r/g, '').replace(/\\n/g, '\n').trim();
  if (k && !k.includes('BEGIN PRIVATE KEY')) {
    k = '-----BEGIN PRIVATE KEY-----\n' + k + '\n-----END PRIVATE KEY-----\n';
  }
  return k;
}

function postJson(url, body, headers) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: Object.assign({
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }, headers || {})
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('timeout')));
    req.write(payload);
    req.end();
  });
}

let gaToken = { access: '', exp: 0 };
async function getGaToken() {
  if (gaToken.access && Date.now() < gaToken.exp - 30000) return gaToken.access;
  const email = String(process.env.GA_CLIENT_EMAIL || '').trim();
  const key = normalizeKey(process.env.GA_PRIVATE_KEY);
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
  const res = await postJson('https://oauth2.googleapis.com/token', body, {
    'Content-Type': 'application/x-www-form-urlencoded'
  });
  const json = JSON.parse(res.data || '{}');
  if (!json.access_token) throw new Error(json.error || 'no token');
  gaToken = { access: json.access_token, exp: Date.now() + (json.expires_in || 3600) * 1000 };
  return gaToken.access;
}

let gaStatsCache = { at: 0, data: null };

async function fetchGaStats() {
  const propertyId = gaPropertyId();
  const token = await getGaToken();
  const payload = {
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'eventCount' }],
    metricAggregations: ['TOTAL']
  };
  const res = await postJson(
    'https://analyticsdata.googleapis.com/v1beta/properties/' + propertyId + ':runReport',
    payload,
    { Authorization: 'Bearer ' + token }
  );
  const json = JSON.parse(res.data || '{}');
  if (json.error) throw new Error(json.error.message || json.error.status || 'ga4 error');
  const row = (json.totals && json.totals[0] && json.totals[0].metricValues)
    || (json.rows && json.rows[0] && json.rows[0].metricValues)
    || [];
  const num = (cell) => {
    const n = Number(cell && cell.value);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    source: 'ga4',
    visitors: num(row[0]),
    visits: num(row[1]),
    events: num(row[2])
  };
}

app.get('/api/stats', async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!gaConfigured()) {
    return res.status(200).json(GA_UNAVAILABLE);
  }
  try {
    if (gaStatsCache.data && Date.now() - gaStatsCache.at < GA_CACHE_MS) {
      return res.status(200).json(gaStatsCache.data);
    }
    const data = await fetchGaStats();
    gaStatsCache = { at: Date.now(), data };
    return res.status(200).json(data);
  } catch (err) {
    console.log('  📊  GA stats unavailable:', err && err.message ? err.message : err);
    return res.status(200).json(GA_UNAVAILABLE);
  }
});


const REPO = 'notcristi14/GTA-VI-Countdown';
const COMMIT_CACHE_MS = 60 * 1000;
let commitCache = { at: 0, data: null };

function fetchJson(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: Object.assign({
        'User-Agent': 'GTA-VI-Countdown',
        Accept: 'application/vnd.github+json'
      }, headers || {})
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location, headers).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error('status ' + res.statusCode));
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(12000, () => req.destroy(new Error('timeout')));
  });
}

app.get('/api/commit', async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  if (commitCache.data && Date.now() - commitCache.at < COMMIT_CACHE_MS) {
    return res.json(commitCache.data);
  }
  try {
    const list = await fetchJson('https://api.github.com/repos/' + REPO + '/commits?per_page=1');
    const item = Array.isArray(list) ? list[0] : null;
    if (!item || !item.sha) throw new Error('no commit');
    const message = String((item.commit && item.commit.message) || '').split('\n')[0].slice(0, 180);
    const when = item.commit && item.commit.author && item.commit.author.date;
    const parsed = when ? new Date(when) : null;
    const data = {
      sha: item.sha.slice(0, 7),
      fullSha: item.sha,
      message,
      author: (item.author && item.author.login) || (item.commit && item.commit.author && item.commit.author.name) || '',
      date: parsed && !isNaN(parsed) ? parsed.toISOString() : '',
      url: item.html_url || ('https://github.com/' + REPO + '/commit/' + item.sha),
      repo: 'https://github.com/' + REPO
    };
    commitCache = { at: Date.now(), data };
    return res.json(data);
  } catch (err) {
    console.log('  🐙  GitHub commit unavailable:', err && err.message ? err.message : err);
    if (commitCache.data) return res.json(commitCache.data);
    return res.status(200).json({ source: 'unavailable' });
  }
});

app.get('/api/news', async (_req, res) => {
  try {
    const fresh = newsCache.at && Date.now() - newsCache.at < NEWS_CACHE_MS && newsCache.items.length;
    if (fresh) {
      return res.json({ items: newsCache.items, source: 'cache' });
    }

    const items = parseNewswire(JSON.parse(await fetchText(NEWS_FEED, {
      Origin: 'https://www.rockstargames.com',
      Referer: NEWSWIRE_URL
    }))).slice(0, 8);
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
    console.log('  📊  Google Analytics stats: env vars not set — /api/stats stays hidden');
    console.log('      Set GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY to use GA4');
  }
  console.log('');
});
