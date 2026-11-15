'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const FEATURE_PREFIX = /^(?:add|apply|attach|build|calculate|change|check|clear|close|connect|create|delete|detect|discover|display|download|draw|enable|export|fetch|filter|find|format|generate|get|handle|hide|init|insert|install|load|manage|mount|navigate|open|pause|play|preload|process|refresh|register|remove|render|reset|restore|save|schedule|search|select|send|set|show|start|stop|sync|toggle|track|update|validate|verify|watch)(?:[A-Z_]|$)/;
const PRODUCT_FILE = /^(?:app\.js|backgrounds-api\.js|github-api\.js|gta-vi-countdown\.html|music(?:-discovery)?\.js|mobile\/(?:android\/app\/src\/main\/kotlin\/.*\.kt|ios\/.*\.swift)|launcher\/src\/.*\.cpp)$/;

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
function kebab(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}
function title(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^./, (c) => c.toUpperCase());
}
function scopeFor(file) {
  if (file.startsWith('mobile/')) return 'mobile';
  if (file.startsWith('launcher/assets/')) return 'assets';
  if (file.startsWith('launcher/')) return 'launcher';
  return 'root';
}
function groupFor(file) {
  if (file.startsWith('mobile/android/')) return 'Android';
  if (file.startsWith('mobile/ios/')) return 'iOS';
  if (file.startsWith('launcher/')) return 'Windows desktop launcher';
  if (file.endsWith('.html') || file === 'app.js' || file.startsWith('music') || file.startsWith('backgrounds') || file.startsWith('github-api')) return 'Website · automatically discovered';
  return 'Application · automatically discovered';
}
function declarations(source, file) {
  const found = [];
  const lines = source.split(/\r?\n/);
  const patterns = file.endsWith('.kt')
    ? [/^\s*(?:(?:public|private|internal|protected|override|open|final|suspend|inline|tailrec|operator|infix)\s+)*fun\s+([A-Za-z_][\w]*)\s*\(/]
    : file.endsWith('.swift')
      ? [/^\s*(?:(?:public|private|fileprivate|internal|open|override|static|class|final|mutating|nonmutating|async|throws)\s+)*func\s+([A-Za-z_][\w]*)\s*\(/]
      : (file.endsWith('.cpp') || file.endsWith('.cc') || file.endsWith('.c'))
        ? [/^\s*(?:(?:static|inline|virtual|constexpr|const)\s+)*(?:[A-Za-z_][\w:<>&*]*\s+)+([A-Za-z_][\w]*)\s*\([^;]*\)\s*(?:const\s*)?(?:noexcept\s*)?\{/]
        : [/^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/,
           /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/];
  lines.forEach((line, index) => {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) { found.push({ name: match[1], line: index, indent: (line.match(/^\s*/) || [''])[0] }); break; }
    }
  });
  return found;
}
function existingIds(source) {
  return new Set([...source.matchAll(/@feature\s+id="([^"]+)"/g)].map((m) => m[1]));
}
function annotateSource(source, file, baseSource) {
  const baseNames = new Set(declarations(baseSource, file).map((item) => item.name));
  const candidates = declarations(source, file).filter((item) => !baseNames.has(item.name) && FEATURE_PREFIX.test(item.name));
  if (!candidates.length) return { content: source, added: [] };
  const lines = source.split(/\r?\n/);
  const ids = existingIds(source);
  const added = [];
  for (const candidate of candidates.sort((a, b) => b.line - a.line)) {
    const previous = lines.slice(Math.max(0, candidate.line - 2), candidate.line).join('\n');
    if (/@feature\s+id=/.test(previous)) continue;
    const baseId = kebab(candidate.name) || 'new-feature';
    let id = baseId;
    let suffix = 2;
    while (ids.has(id)) id = baseId + '-' + suffix++;
    ids.add(id);
    const metadata = '@feature id="' + id + '" title="' + title(candidate.name) + '" group="' + groupFor(file) + '" scopes="all"';
    lines.splice(candidate.line, 0, candidate.indent + '// ' + metadata);
    added.push({ id, name: candidate.name, file, title: title(candidate.name), group: groupFor(file), scopes: ['all'] });
  }
  return { content: lines.join('\n'), added };
}
function runAutoDiscovery(root, baseSha) {
  const repoRoot = root || ROOT;
  const base = baseSha || process.env.FEATURE_DISCOVERY_BASE_SHA || process.env.GITHUB_EVENT_BEFORE || '';
  if (!base || /^0+$/.test(base)) return { changedFiles: [], added: [], skipped: 'no valid base commit supplied' };
  const files = git(['diff', '--name-only', base, 'HEAD', '--']).split(/\r?\n/).filter((file) => file && PRODUCT_FILE.test(file));
  const changedFiles = [];
  const added = [];
  for (const file of files) {
    const full = path.join(repoRoot, file);
    if (!fs.existsSync(full)) continue;
    let baseSource = '';
    try { baseSource = git(['show', base + ':' + file]); } catch { baseSource = ''; }
    const source = fs.readFileSync(full, 'utf8');
    const result = annotateSource(source, file, baseSource);
    if (result.added.length) {
      fs.writeFileSync(full, result.content);
      changedFiles.push(file);
      added.push(...result.added);
    }
  }
  return { changedFiles, added, skipped: null };
}
if (require.main === module) {
  const result = runAutoDiscovery(ROOT, process.env.FEATURE_DISCOVERY_BASE_SHA || process.env.GITHUB_EVENT_BEFORE || '');
  console.log(JSON.stringify({ changedFiles: result.changedFiles, discovered: result.added, skipped: result.skipped }, null, 2));
}
module.exports = { runAutoDiscovery, annotateSource, declarations, kebab, title, PRODUCT_FILE };
