const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

module.exports = function restoreHtml() {
  try {
    const out = path.join(__dirname, 'gta-vi-countdown.html');
    let existing = '';
    try { existing = fs.readFileSync(out, 'utf8'); } catch (_) {}
    if (existing && existing.indexOf('RESTORE_IN_PROGRESS') < 0 && existing.length > 5000 && existing.indexOf('musicBtn') >= 0) {
      return;
    }
    let b64 = '';
    for (let i = 0; i < 10; i++) {
      b64 += fs.readFileSync(path.join(__dirname, 'p' + i + '.b64'), 'utf8').replace(/\s+/g, '');
    }
    const buf = zlib.inflateSync(Buffer.from(b64, 'base64'));
    fs.writeFileSync(out, buf);
    console.log('  \ud83d\udcc4  Restored gta-vi-countdown.html (' + buf.length + ' bytes)');
  } catch (err) {
    console.log('  \ud83d\udcc4  HTML restore failed:', err && err.message ? err.message : err);
  }
};
