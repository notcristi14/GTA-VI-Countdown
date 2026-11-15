'use strict';

const fs = require('fs');
const path = require('path');

const SOURCE_EXTENSIONS = new Set([
  '.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.html', '.css',
  '.kt', '.swift', '.cpp', '.cc', '.c', '.h', '.hpp', '.cs'
]);
const EXCLUDED_DIRS = new Set([
  '.git', 'node_modules', 'build', 'DerivedData', '.gradle',
  'coverage', '.idea', '.vscode', 'dist', 'vendor', 'Pods', 'test', 'tests'
]);
const VALID_SCOPES = new Set(['root', 'mobile', 'launcher', 'assets', 'all']);

/**
 * Product-source annotation:
 * Annotation format: a comment marker with id, title, group and scopes attributes.
 *
 * Add one annotation beside the implementation. The integrity workflow discovers it,
 * validates its metadata, and includes it in every applicable generated README table.
 */
function parseAttributes(raw) {
  const attrs = {};
  const pattern = /([a-z][a-z0-9_-]*)="([^"]*)"/g;
  let match;
  while ((match = pattern.exec(raw))) attrs[match[1]] = match[2];
  return attrs;
}

function listSourceFiles(root) {
  const found = [];
  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
      } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        found.push(path.join(dir, entry.name));
      }
    }
  }
  walk(root);
  return found;
}

function scanFeatureMarkers(root) {
  const checks = [];
  const features = [];
  const seen = new Map();
  const markerPattern = /^\s*(?:\/\/|\/\*|\*|<!--|#)\s*@feature\s+(.+?)\s*(?:-->\*\/)?\s*$/;
  for (const file of listSourceFiles(root)) {
    const relative = path.relative(root, file).split(path.sep).join('/');
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      const match = line.match(markerPattern);
      if (!match) return;
      const attrs = parseAttributes(match[1]);
      const lineNo = index + 1;
      const location = relative + ':' + lineNo;
      const id = attrs.id || 'missing-id-' + lineNo;
      const scopes = (attrs.scopes || '').split(',').map((scope) => scope.trim()).filter(Boolean);
      const missing = ['id', 'title', 'group', 'scopes'].filter((key) => !attrs[key]);
      const invalidScopes = scopes.filter((scope) => !VALID_SCOPES.has(scope));
      const errors = [];
      if (missing.length) errors.push('missing required attributes: ' + missing.join(', '));
      if (invalidScopes.length) errors.push('invalid scopes: ' + invalidScopes.join(', '));
      if (attrs.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(attrs.id)) errors.push('id must be lowercase kebab-case');
      if (attrs.id && seen.has(attrs.id)) errors.push('duplicate feature id; first declared at ' + seen.get(attrs.id));
      if (attrs.id && !seen.has(attrs.id)) seen.set(attrs.id, location);
      const ok = errors.length === 0;
      checks.push({
        id: 'feature-marker-' + id,
        claim: 'Auto-discovered feature: ' + (attrs.title || id),
        ok,
        detail: ok ? 'registered from ' + location : location + ' · ' + errors.join('; '),
        critical: !ok,
        autoDiscovered: true,
        featureId: attrs.id || null,
        group: attrs.group || 'Auto-discovered features',
        scopes: scopes.length ? scopes : ['all']
      });
      if (ok) {
        features.push({
          id: attrs.id,
          claim: attrs.title,
          ok: true,
          detail: 'source: ' + location,
          autoDiscovered: true,
          group: attrs.group,
          scopes
        });
      }
    });
  }
  return { checks, features, sourceFilesScanned: listSourceFiles(root).length };
}

module.exports = { scanFeatureMarkers, parseAttributes, listSourceFiles, VALID_SCOPES };
