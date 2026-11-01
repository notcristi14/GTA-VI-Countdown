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

// NOTE: truncated in this attempt - see next commit
module.exports = {};
app.listen(PORT, () => console.log('temp'));
