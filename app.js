const fs = require('fs');
const path = require('path');
const Module = require('module');
const parts = [0, 1, 2].map(function (i) {
  return fs.readFileSync(path.join(__dirname, 'app.core.p' + i), 'utf8');
});
const code = parts.join('');
const filename = path.join(__dirname, 'app.runtime.js');
const m = new Module(filename);
m.filename = filename;
m.paths = Module._nodeModulePaths(__dirname);
m._compile(code, filename);
