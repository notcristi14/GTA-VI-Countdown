#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const parts = [];
for (let i = 0; i < 10; i++) {
  const f = path.join(dir, 'ric.' + i + '.txt');
  if (!fs.existsSync(f)) break;
  parts.push(fs.readFileSync(f, 'utf8'));
}
if (!parts.length) {
  console.error('Missing scripts/ric.*.txt integrity source parts');
  process.exit(2);
}
const code = parts.join('');
const out = path.join(dir, '.integrity-assembled.js');
fs.writeFileSync(out, code);
require(out);
