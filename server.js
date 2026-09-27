const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const NEWS_CACHE_MS = 10 * 60 * 1000;
const NEWSWIRE_URL = 'https://www.rockstargames.com/newswire';
const NEWS_FEED =
  'https://news.google.com/rss/search?q=site:rockstargames.com/newswire&hl=en-US&gl=US&ceid=US:en';

const FALLBACK_NEWS = [
  {
    title: 'Pre-Order The Goodtime State – Vice City Collection Now While Supplies Last',
    date: 'Sep 24, 2026',
    category: 'Grand Theft Auto VI',
    url: NEWSWIRE_URL
  },
  {
    title: 'Announcing Grand Theft Auto VI: The Album, Coming November 19',
    date: 'Sep 17, 2026',
    category: 'Grand Theft Auto VI',
    url: NEWSWIRE_URL
  },
  {
    title: 'GTA+ Members Enjoy One Week of Early Access to the New Pegassi Horus Supercar',
    date: 'Sep 10, 2026',
    category: 'GTA Online',
    url: NEWSWIRE_URL
  },
  {
    title: 'Compete Across Entrepreneurial Endeavors in the GTA Online Business Rivalries Event',
    date: 'Sep 3, 2026',
    category: 'GTA Online',
    url: NEWSWIRE_URL
  },
  {
    title: 'Grand Theft Auto VI: An Extended Look — Now Playing',
    date: 'Aug 27, 2026',
    category: 'Grand Theft Auto VI',
    url: 'https://www.rockstargames.com/newswire/article/4k138k8okkk483/grand-theft-auto-vi-an-extended-look-now-playing'
  },
  {
    title: 'Pre-Order Grand Theft Auto VI on June 25',
    date: 'Jun 24, 2026',
    category: 'Grand Theft Auto VI',
    url: 'https://www.rockstargames.com/newswire/article/5171972o3ak5oa/pre-order-grand-theft-auto-vi-on-june-25'
  }
];

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

let newsCache = { at: 0, items: FALLBACK_NEWS };

app.get('/api/news', async (_req, res) => {
  try {
    const fresh = Date.now() - newsCache.at < NEWS_CACHE_MS && newsCache.items.length;
    if (fresh) {
      return res.json({ items: newsCache.items, source: 'cache' });
    }

    const items = parseRss(await fetchText(NEWS_FEED)).slice(0, 8);
    if (items.length) {
      newsCache = { at: Date.now(), items };
      return res.json({ items, source: 'live' });
    }
  } catch (_) {
    // Use fallback headlines if the live feed is unavailable.
  }

  res.json({ items: FALLBACK_NEWS, source: 'fallback' });
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
  console.log('');
});
