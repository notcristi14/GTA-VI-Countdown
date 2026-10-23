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


const TRAILERS_CACHE_MS = 30 * 60 * 1000;
let trailersCache = { at: 0, data: null };

/* Official Rockstar upload dates (UTC). Seeded so we never scrape youtube.com/watch (429). */
const KNOWN_PUBLISHED_AT = {
  'QdBZY2fkU-0': '2023-12-04T00:00:00.000Z',
  'VQRLujxTm3c': '2025-05-06T00:00:00.000Z',
  'EiQEBYDox_k': '2026-06-18T00:00:00.000Z',
  'INjHGpMRjRA': '2026-06-18T00:00:00.000Z',
  'tJbzMqJGH4k': '2026-08-28T01:00:00.000Z',
  'MJOrsRRa9GM': '2026-08-28T01:00:00.000Z',
  'qq76pQsI1iw': '2026-08-06T00:00:00.000Z',
  'icy-lhqJhMQ': '2026-10-15T00:00:00.000Z',
  'rz1B4B2yBZY': '2026-10-15T00:00:00.000Z'
};

const SEED_TRAILERS = [
  { id: 'launch', title: 'Launch Trailer', label: 'Launch Trailer', meta: 'Official launch trailer · Rockstar Games', youtubeId: 'icy-lhqJhMQ', publishedAt: KNOWN_PUBLISHED_AT['icy-lhqJhMQ'] },
  { id: 'extended', title: 'An Extended Look', label: 'An Extended Look', meta: 'Official gameplay presentation · Rockstar Games', youtubeId: 'tJbzMqJGH4k', publishedAt: KNOWN_PUBLISHED_AT['tJbzMqJGH4k'] },
  { id: 'cover', title: 'Cover Art Reveal', label: 'Cover Art Reveal', meta: 'Official cover art reveal · Rockstar Games', youtubeId: 'EiQEBYDox_k', publishedAt: KNOWN_PUBLISHED_AT['EiQEBYDox_k'] },
  { id: 'trailer2', title: 'Trailer 2', label: 'Trailer 2', meta: 'Official trailer · Rockstar Games', youtubeId: 'VQRLujxTm3c', publishedAt: KNOWN_PUBLISHED_AT['VQRLujxTm3c'] },
  { id: 'trailer1', title: 'Trailer 1', label: 'Trailer 1', meta: 'Official reveal trailer · Rockstar Games', youtubeId: 'QdBZY2fkU-0', publishedAt: KNOWN_PUBLISHED_AT['QdBZY2fkU-0'] }
];

function isGtaViTitle(title) {
  if (!title) return false;
  const t = String(title).toLowerCase();
  return /(grand theft auto\s*vi|gta\s*vi|gtavi)/i.test(t);
}

function slugId(title, youtubeId) {
  const base = String(title || youtubeId || 'video')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return base || youtubeId;
}

function parsePublishedAt(value) {
  if (!value || typeof value !== 'string') return null;
  const t = Date.parse(value);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString();
}

function textFromYt(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (obj.simpleText) return obj.simpleText;
  if (Array.isArray(obj.runs)) return obj.runs.map((x) => x.text || '').join('');
  return '';
}

function resolvePublishedAt(youtubeId, existing) {
  if (existing) {
    const p = parsePublishedAt(existing);
    if (p) return p;
  }
  if (youtubeId && KNOWN_PUBLISHED_AT[youtubeId]) {
    return KNOWN_PUBLISHED_AT[youtubeId];
  }
  return null;
}

async function enrichPublishedDates(items) {
  const out = [];
  for (const item of items) {
    const publishedAt = resolvePublishedAt(item.youtubeId, item.publishedAt);
    let meta = item.meta || item.title || '';
    if (publishedAt) {
      const d = new Date(publishedAt);
      const dateLabel = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
      meta = (item.title || item.label || 'Trailer') + ' · ' + dateLabel + ' · Rockstar Games';
    } else if (item.publishedTimeText) {
      meta = (item.title || item.label || 'Trailer') + ' · ' + item.publishedTimeText + ' · Rockstar Games';
    }
    out.push(Object.assign({}, item, { publishedAt: publishedAt || null, meta: meta }));
  }
  return out;
}

function sortTrailersNewestFirst(list) {
  return list.slice().sort(function (a, b) {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : NaN;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : NaN;
    const aOk = !Number.isNaN(ta);
    const bOk = !Number.isNaN(tb);
    if (aOk && bOk && ta !== tb) return tb - ta;
    if (aOk && !bOk) return -1;
    if (!aOk && bOk) return 1;
    const titleCmp = String(a.title || '').localeCompare(String(b.title || ''));
    if (titleCmp) return titleCmp;
    return String(a.youtubeId || '').localeCompare(String(b.youtubeId || ''));
  });
}

async function fetchRockstarGtaViVideos() {
  const url = 'https://www.youtube.com/@RockstarGames/search?query=Grand+Theft+Auto+VI';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  if (!res.ok) throw new Error('yt status ' + res.status);
  const page = await res.text();
  const m = page.match(/var ytInitialData = (\{.*?\});<\/script>/s) || page.match(/ytInitialData\s*=\s*(\{.*?\});/s);
  if (!m) throw new Error('no ytInitialData');
  const data = JSON.parse(m[1]);
  const found = [];
  function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(walk);
    if (o.videoRenderer && o.videoRenderer.videoId) {
      const vr = o.videoRenderer;
      found.push({
        youtubeId: vr.videoId,
        title: textFromYt(vr.title),
        publishedTimeText: textFromYt(vr.publishedTimeText) || null
      });
    }
    Object.keys(o).forEach(function (k) { walk(o[k]); });
  }
  walk(data);
  const seen = new Set();
  const items = [];
  for (let idx = 0; idx < found.length; idx++) {
    const row = found[idx];
    if (!row.youtubeId || seen.has(row.youtubeId)) continue;
    if (!isGtaViTitle(row.title)) continue;
    seen.add(row.youtubeId);
    items.push({
      id: slugId(row.title, row.youtubeId),
      title: row.title,
      label: row.title.replace(/^Grand Theft Auto VI:\s*/i, '').replace(/^Grand Theft Auto VI\s*/i, '') || row.title,
      meta: row.title + ' · Rockstar Games',
      youtubeId: row.youtubeId,
      publishedTimeText: row.publishedTimeText,
      publishedAt: null,
      source: 'rockstar-youtube'
    });
  }
  return items;
}

async function mergeTrailers(discovered) {
  const byId = new Map();
  SEED_TRAILERS.forEach(function (s) {
    byId.set(s.youtubeId, Object.assign({}, s, { publishedAt: s.publishedAt || KNOWN_PUBLISHED_AT[s.youtubeId] || null, source: 'seed' }));
  });
  (discovered || []).forEach(function (d) {
    if (!d.youtubeId) return;
    if (byId.has(d.youtubeId)) {
      const existing = byId.get(d.youtubeId);
      byId.set(d.youtubeId, Object.assign({}, existing, {
        publishedTimeText: d.publishedTimeText || existing.publishedTimeText,
        source: existing.source === 'seed' ? 'seed+youtube' : d.source
      }));
      return;
    }
    var sameTitle = null;
    byId.forEach(function (x) {
      if (sameTitle) return;
      if (String(x.title || '').toLowerCase() === String(d.title || '').toLowerCase()) sameTitle = x;
    });
    if (sameTitle) {
      if (d.publishedTimeText && !sameTitle.publishedTimeText) {
        sameTitle.publishedTimeText = d.publishedTimeText;
      }
      return;
    }
    byId.set(d.youtubeId, d);
  });
  const merged = Array.from(byId.values());
  const enriched = await enrichPublishedDates(merged);
  return sortTrailersNewestFirst(enriched);
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
    trailersCache = { at: Date.now(), data: data };
    return res.json(data);
  } catch (err) {
    console.log('  🎬  Trailer discovery failed:', err && err.message ? err.message : err);
    try {
      const items = await mergeTrailers([]);
      const fallback = {
        items: items,
        source: 'seed',
        sort: 'publishedAt-desc',
        checkedAt: new Date().toISOString(),
        channel: 'https://www.youtube.com/@RockstarGames',
        error: 'discovery_failed'
      };
      if (trailersCache.data) return res.json(trailersCache.data);
      return res.json(fallback);
    } catch (err2) {
      const items = sortTrailersNewestFirst(SEED_TRAILERS.map(function (s) {
        return Object.assign({}, s, { publishedAt: s.publishedAt || KNOWN_PUBLISHED_AT[s.youtubeId] || null });
      }));
      return res.json({
        items: items,
        source: 'seed',
        sort: 'publishedAt-desc',
        checkedAt: new Date().toISOString(),
        channel: 'https://www.youtube.com/@RockstarGames',
        error: 'discovery_failed'
      });
    }
  }
});

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
    const gaMsg = String(err && err.message ? err.message : err).split('\n')[0];
    if (!global.__gaLogAt || Date.now() - global.__gaLogAt > 3600000) {
      global.__gaLogAt = Date.now();
      console.log('  📊  GA stats unavailable:', gaMsg);
    }
    return res.status(200).json(GA_UNAVAILABLE);
  }
});

const REPO = 'notcristi14/GTA-VI-Countdown';
const COMMIT_CACHE_MS = 60 * 1000;
let commitCache = { at: 0, data: null };

const { fetchJson, logGithubOnce } = require('./github-api');

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
    logGithubOnce('commit', '  🐙  GitHub commit unavailable: ' + (err && err.message ? err.message : err) + (!(process.env.GITHUB_TOKEN || process.env.GH_TOKEN) && String(err && err.message).includes('403') ? ' — set GITHUB_TOKEN on Render' : ''));
    if (commitCache.data) return res.json(commitCache.data);
    return res.status(200).json({ source: 'unavailable' });
  }
});

const COMMITS_CACHE_MS = 60 * 1000;
let commitsCache = { at: 0, data: null };

const REPO_CACHE_MS = 60 * 1000;
let repoCache = { at: 0, data: null };

function repoFingerprint(data) {
  if (!data || data.source === 'unavailable') return '';
  return [data.stars, data.forks, data.watchers, data.openIssues, data.language, data.pushedAt].join('|');
}

async function refreshRepoStats() {
  try {
    const repo = await fetchJson('https://api.github.com/repos/' + REPO, {
      Accept: 'application/vnd.github+json'
    });
    if (!repo || !repo.full_name) throw new Error('no repo');
    const data = {
      fullName: repo.full_name,
      description: repo.description || '',
      url: repo.html_url || ('https://github.com/' + REPO),
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      watchers: repo.subscribers_count != null ? repo.subscribers_count : (repo.watchers_count || 0),
      openIssues: repo.open_issues_count || 0,
      language: repo.language || '',
      size: repo.size || 0,
      defaultBranch: repo.default_branch || 'main',
      createdAt: repo.created_at || '',
      updatedAt: repo.updated_at || '',
      pushedAt: repo.pushed_at || '',
      checkedAt: new Date().toISOString()
    };
    const prevFp = repoFingerprint(repoCache.data);
    const nextFp = repoFingerprint(data);
    repoCache = { at: Date.now(), data: data };
    if (prevFp && prevFp !== nextFp) {
      console.log('  🐙  Repo stats changed:', data.stars + ' stars,', data.forks + ' forks,', data.openIssues + ' issues');
    }
    return data;
  } catch (err) {
    logGithubOnce('repo-bg', '  🐙  Repo stats auto-check failed: ' + (err && err.message ? err.message : err) + (!(process.env.GITHUB_TOKEN || process.env.GH_TOKEN) && String(err && err.message).includes('403') ? ' — set GITHUB_TOKEN on Render' : ''));
    return repoCache.data || null;
  }
}

app.get('/api/repo', async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  if (repoCache.data && Date.now() - repoCache.at < REPO_CACHE_MS) {
    return res.json(repoCache.data);
  }
  try {
    const data = await refreshRepoStats();
    if (data) return res.json(data);
    return res.status(200).json({ source: 'unavailable' });
  } catch (err) {
    logGithubOnce('repo', '  🐙  GitHub repo stats unavailable: ' + (err && err.message ? err.message : err));
    if (repoCache.data) return res.json(repoCache.data);
    return res.status(200).json({ source: 'unavailable' });
  }
});

setInterval(function () {
  refreshRepoStats().catch(function () {});
}, REPO_CACHE_MS);
refreshRepoStats().catch(function () {});

app.get('/api/commits', async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  if (commitsCache.data && Date.now() - commitsCache.at < COMMITS_CACHE_MS) {
    return res.json(commitsCache.data);
  }
  try {
    const list = await fetchJson('https://api.github.com/repos/' + REPO + '/commits?per_page=15');
    if (!Array.isArray(list) || !list.length) throw new Error('no commits');
    const items = list.map((item) => {
      const message = String((item.commit && item.commit.message) || '').split('\n')[0].slice(0, 180);
      const when = item.commit && item.commit.author && item.commit.author.date;
      const parsed = when ? new Date(when) : null;
      return {
        sha: item.sha ? item.sha.slice(0, 7) : '',
        fullSha: item.sha || '',
        message,
        author: (item.author && item.author.login) || (item.commit && item.commit.author && item.commit.author.name) || '',
        date: parsed && !isNaN(parsed) ? parsed.toISOString() : '',
        url: item.html_url || ('https://github.com/' + REPO + '/commit/' + item.sha)
      };
    }).filter((x) => x.sha);
    const data = { items, repo: 'https://github.com/' + REPO };
    commitsCache = { at: Date.now(), data };
    return res.json(data);
  } catch (err) {
    logGithubOnce('commits', '  🐙  GitHub commits unavailable: ' + (err && err.message ? err.message : err));
    if (commitsCache.data) return res.json(commitsCache.data);
    return res.status(200).json({ source: 'unavailable', items: [] });
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
  if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
    console.log('  🐙  GitHub API: GITHUB_TOKEN present (authenticated rate limit)');
  } else {
    console.log('  🐙  GitHub API: unauthenticated (60/hr per IP) — set GITHUB_TOKEN on Render if you see 403');
  }
  if (gaConfigured()) {
    console.log('  📊  Google Analytics stats: env vars present');
  } else {
    console.log('  📊  Google Analytics stats: env vars not set — /api/stats stays hidden');
    console.log('      Set GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY to use GA4');
  }
  console.log('');
});
