const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

const FALLBACK_NEWS = [
  {
    title: 'Pre-Order The Goodtime State – Vice City Collection Now While Supplies Last',
    date: 'Sep 24, 2026',
    category: 'Grand Theft Auto VI',
    url: 'https://www.rockstargames.com/newswire'
  },
  {
    title: 'Announcing Grand Theft Auto VI: The Album, Coming November 19',
    date: 'Sep 17, 2026',
    category: 'Grand Theft Auto VI',
    url: 'https://www.rockstargames.com/newswire'
  },
  {
    title: 'GTA+ Members Enjoy One Week of Early Access to the New Pegassi Horus Supercar',
    date: 'Sep 10, 2026',
    category: 'GTA Online',
    url: 'https://www.rockstargames.com/newswire'
  },
  {
    title: 'Compete Across Entrepreneurial Endeavors in the GTA Online Business Rivalries Event',
    date: 'Sep 3, 2026',
    category: 'GTA Online',
    url: 'https://www.rockstargames.com/newswire'
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
      res.on('data', (c) => { data += c; });
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
  const items = [];
  const blocks = xml.split('<item>').slice(1);
  for (const block of blocks) {
    const title = decode((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
    const link = decode((block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '');
    const pub = decode((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '');
    if (!title) continue;
    const cleanTitle = title.replace(/\s+-\s+Rockstar Games\s*$/i, '');
    let date = '';
    if (pub) {
      const d = new Date(pub);
      if (!isNaN(d)) {
        date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    items.push({
      title: cleanTitle,
      date,
      category: 'Rockstar Newswire',
      url: link || 'https://www.rockstargames.com/newswire'
    });
  }
  return items;
}

let newsCache = { at: 0, items: FALLBACK_NEWS };

app.get('/api/news', async (req, res) => {
  try {
    if (Date.now() - newsCache.at < 10 * 60 * 1000 && newsCache.items.length) {
      return res.json({ items: newsCache.items, source: 'cache' });
    }
    const xml = await fetchText(
      'https://news.google.com/rss/search?q=site:rockstargames.com/newswire&hl=en-US&gl=US&ceid=US:en'
    );
    const items = parseRss(xml).slice(0, 8);
    if (items.length) {
      newsCache = { at: Date.now(), items };
      return res.json({ items, source: 'live' });
    }
  } catch (err) {
    // fall through
  }
  res.json({ items: FALLBACK_NEWS, source: 'fallback' });
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'gta-vi-countdown.html'));
});

app.listen(PORT, () => {
  console.log(`GTA VI Countdown running at http://localhost:${PORT}`);
});
