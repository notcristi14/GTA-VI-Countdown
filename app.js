const express = require('express');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const NEWS_CACHE_MS = 10 * 60 * 1000;
const NEWSWIRE_URL = 'https://www.rockstargames.com/newswire';
const NEWS_FEED =
  'https://news.google.com/rss/search?q=site:rockstargames.com/newswire&hl=en-US&gl=US&ceid=US:en';

// Frontend polls every 30s; 10 minutes keeps GA4 Data API usage low
// while staying fresher than a multi-hour cache.
const GA_CACHE_MS = 10 * 60 * 1000;
const GA_UNAVAILABLE = { source: 'unavailable' };
const GA_PERIOD = '7days';

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

function b64url(value) {
  const buf = Buffer.isBuffer(value)
    ? value
    : Buffer.from(typeof value === 'string' ? value : JSON.stringify(value));
  return buf.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function gaPropertyId() {
  return String(process.env.GA_PROPERTY_ID || '')
    .trim()
    .replace(/^properties\//i, '');
}

function gaConfigured() {
  return Boolean(
    /^\d{6,12}$/.test(gaPropertyId()) &&
    String(process.env.GA_CLIENT_EMAIL || '').includes('@') &&
    process.env.GA_PRIVATE_KEY
  );
}

function normalizeKey(key) {
  let k = String(key || '').trim();
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1);
  }
  return k.replace(/\r/g, '').replace(/\\n/g, '\n').trim();
}

function postGoogle(url, body, headers) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  const extra = headers || {};
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': extra['Content-Type'] || 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: extra.Authorization || undefined
      }
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode || 0, data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('timeout')));
    req.write(payload);
    req.end();
  });
}

let gaToken = { access: '', exp: 0 };

async function getGaToken(force) {
  if (!force && gaToken.access && Date.now() < gaToken.exp - 30000) {
    return gaToken.access;
  }
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
  const res = await postGoogle('https://oauth2.googleapis.com/token', body, {
    'Content-Type': 'application/x-www-form-urlencoded'
  });
  let json = {};
  try { json = JSON.parse(res.data || '{}'); } catch (_) {}
  if (!json.access_token) {
    throw new Error('token ' + (res.status || json.error || 'failed'));
  }
  gaToken = {
    access: json.access_token,
    exp: Date.now() + (Number(json.expires_in) || 3600) * 1000
  };
  console.log('  📊  GA4 token obtained');
  return gaToken.access;
}

function safeMetric(cell) {
  const n = Number(cell && cell.value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

async function runGaReport(token) {
  // Last 7 days including today. Totals are used because this report has no dimensions.
  const payload = {
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'eventCount' }
    ],
    metricAggregations: ['TOTAL']
  };
  const res = await postGoogle(
    'https://analyticsdata.googleapis.com/v1beta/properties/' + gaPropertyId() + ':runReport',
    payload,
    { Authorization: 'Bearer ' + token }
  );
  let json = {};
  try { json = JSON.parse(res.data || '{}'); } catch (_) {
    throw new Error('ga4 invalid json');
  }
  return { status: res.status, json };
}

async function fetchGaStats() {
  let token = await getGaToken(false);
  let result = await runGaReport(token);

  if (result.status === 401) {
    gaToken = { access: '', exp: 0 };
    token = await getGaToken(true);
    result = await runGaReport(token);
  }

  if (result.status === 429 || result.status >= 500) {
    throw new Error('ga4 ' + result.status);
  }
  if (result.status !== 200 || result.json.error) {
    const code = result.status || (result.json.error && result.json.error.status) || 'error';
    throw new Error('ga4 ' + code);
  }

  const row = (result.json.totals && result.json.totals[0] && result.json.totals[0].metricValues)
    || (result.json.rows && result.json.rows[0] && result.json.rows[0].metricValues)
    || [];

  return {
    source: 'ga4',
    visitors: safeMetric(row[0]),
    visits: safeMetric(row[1]),
    events: safeMetric(row[2]),
    period: GA_PERIOD
  };
}

let gaStatsCache = { at: 0, data: null };
let gaInFlight = null;

function cacheFresh() {
  return gaStatsCache.data && Date.now() - gaStatsCache.at < GA_CACHE_MS;
}

async function loadGaStats() {
  if (cacheFresh()) return gaStatsCache.data;
  if (gaInFlight) return gaInFlight;
  gaInFlight = fetchGaStats()
    .then((data) => {
      gaStatsCache = { at: Date.now(), data };
      console.log('  📊  GA4 stats request succeeded');
      return data;
    })
    .finally(() => {
      gaInFlight = null;
    });
  return gaInFlight;
}

app.get('/api/stats', async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!gaConfigured()) {
    return res.status(200).json(GA_UNAVAILABLE);
  }
  try {
    const data = await loadGaStats();
    return res.status(200).json(data);
  } catch (err) {
    const msg = err && err.message ? String(err.message) : 'failed';
    console.log('  📊  GA4 stats request failed:', msg.slice(0, 80));
    if (gaStatsCache.data && gaStatsCache.data.source === 'ga4') {
      return res.status(200).json(gaStatsCache.data);
    }
    return res.status(200).json(GA_UNAVAILABLE);
  }
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
    console.log('  📊  Google Analytics stats: configured');
  } else {
    console.log('  📊  Google Analytics stats: env vars not set — /api/stats stays hidden');
  }
  console.log('');
});
