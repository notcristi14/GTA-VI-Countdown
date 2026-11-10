#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const parts = [];
for (let i = 0; i < 20; i++) {
  const f = path.join(dir, 'integrity.full.b64.' + i);
  if (!fs.existsSync(f)) break;
  parts.push(fs.readFileSync(f, 'utf8').trim());
}
if (!parts.length) {
  console.error('Missing scripts/integrity.full.b64.*');
  process.exit(2);
}
const code = Buffer.from(parts.join(''), 'base64').toString('utf8');
const out = path.join(dir, '.integrity-assembled.js');
fs.writeFileSync(out, code);
require(out);
