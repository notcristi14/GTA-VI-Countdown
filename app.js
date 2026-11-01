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
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
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
  const tokenRes = await postJson('https://oauth2.googleapis.com/token', {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt
  });
  if (tokenRes.status !== 200) throw new Error('ga token ' + tokenRes.status);
  const parsed = JSON.parse(tokenRes.data);
  gaToken = { access: parsed.access_token, exp: Date.now() + (parsed.expires_in || 3600) * 1000 };
  return gaToken.access;
}

let gaCache = { at: 0, data: null };
async function fetchGaStats() {
  if (!gaConfigured()) return GA_UNAVAILABLE;
  if (gaCache.data && Date.now() - gaCache.at < GA_CACHE_MS) return gaCache.data;
  try {
    const token = await getGaToken();
    const propertyId = gaPropertyId();
    const body = {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }]
    };
    const r = await postJson(
      'https://analyticsdata.googleapis.com/v1beta/properties/' + propertyId + ':runReport',
      body,
      { Authorization: 'Bearer ' + token }
    );
    if (r.status !== 200) throw new Error('ga report ' + r.status);
    const report = JSON.parse(r.data);
    const row = report.rows && report.rows[0] && report.rows[0].metricValues;
    const data = {
      source: 'ga4',
      activeUsers: row && row[0] ? Number(row[0].value) : 0,
      sessions: row && row[1] ? Number(row[1].value) : 0,
      pageViews: row && row[2] ? Number(row[2].value) : 0,
      checkedAt: new Date().toISOString()
    };
    gaCache = { at: Date.now(), data };
    return data;
  } catch (err) {
    console.log('  GA stats failed:', err && err.message ? err.message : err);
    return GA_UNAVAILABLE;
  }
}

// --- Trailers ---
const TRAILERS_CACHE_MS = 15 * 60 * 1000;
const trailersCache = { at: 0, data: null };

const KNOWN_PUBLISHED_AT = {
  'rz1B4B2yBZY': '2026-10-15T00:00:00.000Z',
  'QdBZYHLqY8k': '2025-05-06T00:00:00.000Z',
  'VQRLujxTm3c': '2023-12-04T00:00:00.000Z'
};

const SEED_TRAILERS = [
  {
    id: 'grand-theft-auto-vi-launch-trailer',
    title: 'Grand Theft Auto VI Launch Trailer',
    label: 'Launch Trailer',
    youtubeId: 'rz1B4B2yBZY',
    publishedTimeText: 'Oct 15, 2026',
    publishedAt: KNOWN_PUBLISHED_AT['rz1B4B2yBZY']
  },
  {
    id: 'grand-theft-auto-vi-trailer-2',
    title: 'Grand Theft Auto VI Trailer 2',
    label: 'Trailer 2',
    youtubeId: 'QdBZYHLqY8k',
    publishedTimeText: 'May 6, 2025',
    publishedAt: KNOWN_PUBLISHED_AT['QdBZYHLqY8k']
  },
  {
    id: 'grand-theft-auto-vi-trailer-1',
    title: 'Grand Theft Auto VI Trailer 1',
    label: 'Trailer 1',
    youtubeId: 'VQRLujxTm3c',
    publishedTimeText: 'Dec 4, 2023',
    publishedAt: KNOWN_PUBLISHED_AT['VQRLujxTm3c']
  }
];

async function fetchRockstarGtaViVideos() {
  // Prefer seeded list to avoid YouTube 429s; discovery can still enrich titles.
  return SEED_TRAILERS.map(function (t) {
    return Object.assign({}, t, {
      meta: t.title + ' · ' + (t.publishedTimeText || '') + ' · Rockstar Games',
      source: 'seed'
    });
  });
}

async function mergeTrailers(discovered) {
  const byId = new Map();
  SEED_TRAILERS.forEach(function (t) {
    byId.set(t.youtubeId, Object.assign({}, t, {
      meta: t.title + ' · ' + (t.publishedTimeText || '') + ' · Rockstar Games',
      source: 'seed'
    }));
  });
  (discovered || []).forEach(function (d) {
    if (!d.youtubeId) return;
    const existing = byId.get(d.youtubeId);
    if (existing) {
      byId.set(d.youtubeId, Object.assign({}, existing, d, {
        publishedAt: existing.publishedAt || d.publishedAt || KNOWN_PUBLISHED_AT[d.youtubeId]
      }));
    } else {
      byId.set(d.youtubeId, Object.assign({}, d, {
        publishedAt: d.publishedAt || KNOWN_PUBLISHED_AT[d.youtubeId] || null,
        source: d.source || 'youtube'
      }));
    }
  });
  const items = Array.from(byId.values());
  items.sort(function (a, b) {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });
  return items;
}

app.get('/api/trailers', async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  if (trailersCache.data && Date.now() - trailersCache.at < TRAILERS_CACHE_MS) {
    return res.json(trailersCache.data);
  }
  try {
    const discovered = await fetchRockstarGtaViVideos();
    const items = await mergeTrailers(discovered);
    const data = {
      items: items,
      source: 'rockstar-youtube',
      sort: 'publishedAt-desc',
      checkedAt: new Date().toISOString(),
      channel: 'https://www.youtube.com/@RockstarGames'
    };
    trailersCache.at = Date.now();
    trailersCache.data = data;
    return res.json(data);
  } catch (err) {
    console.log('  trailers failed:', err && err.message ? err.message : err);
    if (trailersCache.data) return res.json(trailersCache.data);
    const items = await mergeTrailers([]);
    return res.json({
      items: items,
      source: 'seed',
      sort: 'publishedAt-desc',
      checkedAt: new Date().toISOString(),
      channel: 'https://www.youtube.com/@RockstarGames',
      error: 'discovery_failed'
    });
  }
});

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

app.get('/api/stats', async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  const data = await fetchGaStats();
  res.json(data);
});

const { fetchJson, logGithubOnce } = require('./github-api');
const REPO = 'notcristi14/GTA-VI-Countdown';
const REPO_CACHE_MS = 60 * 1000;
let repoCache = { at: 0, data: null };

app.get('/api/repo', async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  if (repoCache.data && Date.now() - repoCache.at < REPO_CACHE_MS) {
    return res.json(repoCache.data);
  }
  try {
    const [repo, commits] = await Promise.all([
      fetchJson('https://api.github.com/repos/' + REPO),
      fetchJson('https://api.github.com/repos/' + REPO + '/commits?per_page=8')
    ]);
    const data = {
      full_name: repo.full_name,
      html_url: repo.html_url,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      open_issues_count: repo.open_issues_count,
      pushed_at: repo.pushed_at,
      commits: (commits || []).map(function (c) {
        return {
          sha: c.sha,
          html_url: c.html_url,
          message: c.commit && c.commit.message ? c.commit.message.split('\n')[0] : '',
          author: c.commit && c.commit.author ? c.commit.author.name : '',
          date: c.commit && c.commit.author ? c.commit.author.date : ''
        };
      }),
      checkedAt: new Date().toISOString()
    };
    repoCache = { at: Date.now(), data: data };
    return res.json(data);
  } catch (err) {
    logGithubOnce('repo', err);
    if (repoCache.data) return res.json(repoCache.data);
    return res.status(502).json({ error: 'github_unavailable' });
  }
});

app.get('/api/news', async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  if (newsCache.items.length && Date.now() - newsCache.at < NEWS_CACHE_MS) {
    return res.json({ items: newsCache.items, source: 'cache' });
  }
  try {
    const items = parseNewswire(JSON.parse(await fetchText(NEWS_FEED, {
      Origin: 'https://www.rockstargames.com',
      Referer: NEWSWIRE_URL
    }))).slice(0, 8);
    if (items.length) {
      newsCache = { at: Date.now(), items: items };
      return res.json({ items: items, source: 'live' });
    }
  } catch (_) {}
  res.json({ items: [], source: 'live' });
});

app.use(express.static(__dirname));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'gta-vi-countdown.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('  \ud83c\udf34  GTA VI Countdown');
  console.log('  \ud83d\ude97  Running at http://localhost:' + PORT);
  console.log('  \ud83c\udfae  Regions, Newswire & Vice City backgrounds ready');
  if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
    console.log('  \ud83d\udc19  GitHub API: GITHUB_TOKEN present (authenticated rate limit)');
  } else {
    console.log('  \ud83d\udc19  GitHub API: unauthenticated (60/hr per IP) — set GITHUB_TOKEN on Render if you see 403');
  }
  if (gaConfigured()) {
    console.log('  \ud83d\udcca  Google Analytics stats: env vars present');
  } else {
    console.log('  \ud83d\udcca  Google Analytics stats: env vars not set — /api/stats stays hidden');
    console.log('      Set GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY to use GA4');
  }
  console.log('');
});
