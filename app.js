const fs = require('fs');
const path = require('path');
const parts = [];
for (let i = 0; i < 32; i++) {
  const p = path.join(__dirname, 'app.js.b64.' + i);
  if (!fs.existsSync(p)) break;
  parts.push(fs.readFileSync(p, 'utf8'));
}
if (!parts.length) {
  console.error('Missing app.js.b64.* fragments');
  process.exit(1);
}
const code = Buffer.from(parts.join(''), 'base64').toString('utf8');
new Function('require', 'module', 'exports', '__dirname', '__filename', 'process', 'console', 'Buffer', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', code)(
  require, module, exports, __dirname, __filename, process, console, Buffer, setTimeout, setInterval, clearTimeout, clearInterval
);
