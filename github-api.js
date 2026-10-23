'use strict';
const https = require('https');

function githubAuthHeaders() {
  const token = String(process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '').trim();
  const headers = {
    'User-Agent': 'GTA-VI-Countdown',
    Accept: 'application/vnd.github+json'
  };
  if (token) headers.Authorization = 'Bearer ' + token;
  return headers;
}

const githubLogThrottle = {};
function logGithubOnce(key, msg) {
  const now = Date.now();
  if (githubLogThrottle[key] && now - githubLogThrottle[key] < 60 * 60 * 1000) return;
  githubLogThrottle[key] = now;
  console.log(msg);
}

function fetchJson(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: Object.assign({}, githubAuthHeaders(), headers || {})
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location, headers).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          const err = new Error('status ' + res.statusCode);
          err.status = res.statusCode;
          return reject(err);
        }
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(12000, () => req.destroy(new Error('timeout')));
  });
}

module.exports = { fetchJson, logGithubOnce, githubAuthHeaders };
