'use strict';
/**
 * Dynamic documentation impact audit.
 *
 * Analyzes Git changes (or an injected change list) against all discovered
 * README files using deterministic static extraction. Does not invent facts
 * and does not require any external API.
 *
 * Findings are marked:
 *   confirmed: true  — high-confidence inconsistency (may fail CI if severity critical/high)
 *   potentialRisk: true — needs human review; must not fail CI by itself
 */

const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SKIP_DIR_NAMES = new Set([
  '.git', 'node_modules', 'build', 'DerivedData', '.gradle', 'coverage',
  '.idea', '.vscode', 'dist', 'out', '.next', 'Pods'
]);

const BINARY_OR_ASSET = /\.(png|jpe?g|gif|webp|ico|jar|zip|gz|tgz|woff2?|ttf|otf|mp4|mp3|wav|pdf)$/i;


function isTestOrAuditScript(rel) {
  if (!rel) return false;
  const n = rel.replace(/\\/g, '/');
  if (/\/(test|spec|__tests__)\//.test(n)) return true;
  if (/\.(test|spec)\.(js|ts|mjs)$/.test(n)) return true;
  if (n.endsWith('test-doc-audit.js') || n.endsWith('dynamic-doc-audit.js') || n.endsWith('doc-audit.js') || n.endsWith('readme-integrity-check.js')) return true;
  return false;
}

const CI_ENV_IGNORE = new Set([
  'GITHUB_SHA', 'GITHUB_REF', 'GITHUB_OUTPUT', 'GITHUB_ENV', 'GITHUB_WORKSPACE',
  'GITHUB_ACTOR', 'GITHUB_EVENT_NAME', 'GITHUB_RUN_ID', 'CI', 'NODE_ENV'
]);

function isSkippable(rel) {
  if (!rel) return 'empty path';
  const norm = rel.replace(/\\/g, '/');
  const parts = norm.split('/');
  if (parts.some((p) => SKIP_DIR_NAMES.has(p))) return 'excluded directory';
  const base = path.basename(norm);
  if (base === 'local.properties' || base === '.DS_Store' || base === 'Thumbs.db') return 'local/artifact';
  if (/\.(log|tmp|temp)$/i.test(base)) return 'temporary file';
  if (BINARY_OR_ASSET.test(norm) && !norm.endsWith('.md')) return 'binary or generated asset';
  if (norm.endsWith('.lock') || norm.endsWith('-lock.json')) return 'lockfile';
  return false;
}

function safeExec(cmd, cwd) {
  try {
    return execSync(cmd, {
      cwd,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (e) {
    return null;
  }
}

/**
 * Discover changed files via Git. Handles initial commit and missing history.
 * Returns { historyAvailable, baseCommit, headCommit, changes, skipped, error }.
 */
function gitText(root, args, maxBuffer = 20 * 1024 * 1024) {
  try { return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer, stdio: ['ignore', 'pipe', 'pipe'] }); } catch { return null; }
}
function validSha(value) { return typeof value === 'string' && /^[0-9a-f]{40}$/i.test(value); }
function readGitFile(root, sha, rel) {
  if (!sha || !rel) return { ok: false, content: '', reason: 'missing revision or path' };
  try {
    const data = execFileSync('git', ['show', sha + ':' + rel], { cwd: root, encoding: 'buffer', maxBuffer: 2 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true, content: data.toString('utf8'), reason: null };
  } catch (error) { return { ok: false, content: '', reason: 'git object unavailable: ' + (error.code || error.message) }; }
}
function parseNameStatusZ(raw) {
  const f = raw.split('\0'), out = [];
  for (let i = 0; i < f.length;) {
    const code = f[i++]; if (!code) continue;
    if (code[0] === 'R' || code[0] === 'C') {
      const oldPath = f[i++], filePath = f[i++];
      if (oldPath === undefined || filePath === undefined) throw new Error('Malformed rename/copy record');
      out.push({ status: code[0], path: filePath, oldPath });
    } else {
      const filePath = f[i++];
      if (filePath === undefined) throw new Error('Malformed Git diff record');
      out.push({ status: code[0], path: filePath, oldPath: null });
    }
  }
  return out;
}
function getGitChanges(root, options = {}) {
  const r = { historyAvailable: false, baseCommit: null, headCommit: null, changes: [], skipped: [], error: null, status: 'unavailable' };
  const cwd = root || process.cwd();
  const inside = gitText(cwd, ['rev-parse', '--is-inside-work-tree']);
  if (!inside || inside.trim() !== 'true') { r.error = 'not a Git repository or Git unavailable'; return r; }
  const headInput = options.headSha || process.env.DYNAMIC_AUDIT_HEAD_SHA || process.env.GITHUB_SHA || 'HEAD';
  const head = gitText(cwd, ['rev-parse', '--verify', headInput + '^{commit}']);
  if (!head) { r.error = 'cannot resolve requested head commit: ' + headInput; return r; }
  r.headCommit = head.trim();
  const shallow = (gitText(cwd, ['rev-parse', '--is-shallow-repository']) || '').trim() === 'true';
  let baseInput = options.baseSha || process.env.DYNAMIC_AUDIT_BASE_SHA || process.env.GITHUB_EVENT_BEFORE || '';
  const firstPush = /^0{40}$/.test(baseInput); if (firstPush) baseInput = '';
  if (!baseInput && !firstPush) {
    const parent = gitText(cwd, ['rev-parse', '--verify', r.headCommit + '^']);
    if (!parent) {
      const rawCommit = gitText(cwd, ['cat-file', '-p', r.headCommit]) || '';
      if (shallow && /^parent [0-9a-f]{40}$/m.test(rawCommit)) { r.error = 'shallow Git history: fetch full history or provide base SHA'; return r; }
      const tree = gitText(cwd, ['ls-tree', '-r', '-z', '--name-only', r.headCommit]);
      if (tree === null) { r.error = 'cannot enumerate initial commit'; return r; }
      r.changes = tree.split('\0').filter(Boolean).map(path => ({ status: 'A', path, oldPath: null })).filter(c => {
        const reason = isSkippable(c.path); if (reason) r.skipped.push({ path: c.path, reason }); return !reason;
      });
      r.status = 'initial-commit'; return r;
    }
    if (shallow) { r.error = 'shallow Git history: fetch full history or provide base SHA'; return r; }
    baseInput = parent.trim();
  }
  if (firstPush) {
    const tree = gitText(cwd, ['ls-tree', '-r', '-z', '--name-only', r.headCommit]);
    if (tree === null) { r.error = 'cannot enumerate first-push tree'; return r; }
    r.changes = tree.split('\0').filter(Boolean).map(path => ({ status: 'A', path, oldPath: null })).filter(c => {
      const reason = isSkippable(c.path); if (reason) r.skipped.push({ path, reason }); return !reason;
    });
    r.status = 'initial-commit'; return r;
  }
  if (!validSha(baseInput)) { r.error = 'invalid base commit SHA'; return r; }
  const base = gitText(cwd, ['rev-parse', '--verify', baseInput + '^{commit}']);
  if (!base) { r.error = 'base commit object missing; fetch full history'; return r; }
  r.baseCommit = base.trim();
  if (gitText(cwd, ['merge-base', '--is-ancestor', r.baseCommit, r.headCommit]) === null) {
    r.error = 'base is not an ancestor of head (force-push, unrelated or incomplete history)'; return r;
  }
  const raw = gitText(cwd, ['diff', '--name-status', '-z', '--find-renames', '--find-copies', '--find-copies-harder', r.baseCommit, r.headCommit, '--']);
  if (raw === null) { r.error = 'Git could not compare requested base and head'; return r; }
  try {
    for (const c of parseNameStatusZ(raw)) {
      const reason = isSkippable(c.path); if (reason) r.skipped.push({ path: c.path, reason }); else r.changes.push(c);
    }
  } catch (error) { r.error = error.message; return r; }
  r.historyAvailable = true; r.status = 'complete'; return r;
}

function readFileSafe(root, rel) {
  try {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) return { ok: false, content: '', reason: 'missing' };
    const st = fs.statSync(p);
    if (!st.isFile()) return { ok: false, content: '', reason: 'not a file' };
    // Avoid reading huge binaries accidentally
    if (st.size > 2 * 1024 * 1024) return { ok: false, content: '', reason: 'file too large' };
    return { ok: true, content: fs.readFileSync(p, 'utf8'), reason: null };
  } catch (e) {
    return { ok: false, content: '', reason: 'unreadable: ' + (e.code || e.message) };
  }
}

function extractRoutes(content) {
  if (!content) return [];
  const routes = [];
  const re = /(?:app|router)\.(?:get|post|put|delete|patch)\(\s*['"](\/api\/[a-zA-Z0-9_-]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) routes.push(m[1]);
  return [...new Set(routes)];
}

function extractEnvVars(content) {
  if (!content) return [];
  const vars = [];
  const re = /process\.env\.([A-Z][A-Z0-9_]*)/g;
  let m;
  while ((m = re.exec(content)) !== null) vars.push(m[1]);
  return [...new Set(vars)];
}

function extractGradleVersion(content) {
  if (!content) return null;
  const m = content.match(/gradle-(\d+\.\d+(?:\.\d+)?)/);
  return m ? m[1] : null;
}

function extractApplicationId(content) {
  if (!content) return null;
  const m = content.match(/applicationId\s*=\s*"([^"]+)"/) || content.match(/applicationId\s+"([^"]+)"/);
  return m ? m[1] : null;
}

function extractHomeUrl(content) {
  if (!content) return null;
  const m =
    content.match(/HOME_URL\s*=\s*"([^"]*)"/) ||
    content.match(/homeURL\s*=\s*URL\(string:\s*"([^"]*)"\)/) ||
    content.match(/https?:\/\/[^\s"'<>]*onrender\.com[^\s"'<>]*/);
  return m ? m[1] || m[0] : null;
}

function fileMentionedIn(text, rel) {
  if (!text) return false;
  const base = path.basename(rel);
  // Prefer full relative path; fall back to basename only when unique enough
  if (text.includes(rel)) return true;
  if (base.length > 3 && text.includes(base)) return true;
  return false;
}

function allReadmeText(readmes) {
  return Object.values(readmes || {}).join('\n');
}

/**
 * Analyze a single change object against READMEs.
 * change: { status, path, oldPath?, content?, oldContent? }
 * options.skipGitContent — when true, use provided content fields only (for tests)
 */
function analyzeChange(change, root, readmes, options = {}) {
  const findings = [];
  const rel = change.path;
  const status = change.status || 'M';
  const combined = allReadmeText(readmes);

  let content = change.content;
  let oldContent = change.oldContent;
  let unreadable = false;
  if (!options.skipGitContent && options.headSha) {
    if (options.baseSha && status !== 'A' && oldContent === undefined) {
      const old = readGitFile(root, options.baseSha, change.oldPath || rel);
      if (old.ok) oldContent = old.content;
      else {
        unreadable = true;
        findings.push({ id: 'dyn-old-unreadable-' + rel.replace(/\W/g, '_'), severity: 'medium',
          documentationFile: '(none)', sourceFile: rel, problem: 'Base-version content for ' + rel + ' could not be read (' + old.reason + ').',
          suggestedCorrection: 'Ensure the base commit object and path are available.', kind: 'risk',
          deterministic: true, confirmed: false, potentialRisk: true, unreadable: true });
      }
    }
    if (status !== 'D' && content === undefined) {
      const fresh = readGitFile(root, options.headSha, rel);
      if (fresh.ok) content = fresh.content;
      else {
        unreadable = true;
        findings.push({ id: 'dyn-new-unreadable-' + rel.replace(/\W/g, '_'), severity: 'medium',
          documentationFile: '(none)', sourceFile: rel, problem: 'Head-version content for ' + rel + ' could not be read (' + fresh.reason + ').',
          suggestedCorrection: 'Ensure the head commit object and path are available.', kind: 'risk',
          deterministic: true, confirmed: false, potentialRisk: true, unreadable: true });
      }
    }
  } else if (!options.skipGitContent && content === undefined && status !== 'D') {
    const current = readFileSafe(root, rel);
    if (current.ok) content = current.content;
    else {
      unreadable = true;
      findings.push({ id: 'dyn-unreadable-' + rel.replace(/\W/g, '_'), severity: 'medium',
        documentationFile: '(none)', sourceFile: rel, problem: 'Changed file ' + rel + ' could not be read (' + current.reason + ').',
        suggestedCorrection: 'Ensure the file is readable and not excluded.', kind: 'risk',
        deterministic: true, confirmed: false, potentialRisk: true, unreadable: true });
    }
  }

  content = content || '';
  oldContent = oldContent || '';

  // --- New / removed API routes ---
  // Skip test and audit scripts: they contain example snippets that are not production routes.
  if (/\.(js|ts|mjs|cjs)$/.test(rel) && !unreadable && !isTestOrAuditScript(rel)) {
    const routes = status === 'D' ? [] : extractRoutes(content);
    const oldRoutes = extractRoutes(oldContent);
    for (const r of routes) {
      if (!oldRoutes.includes(r) && !combined.includes(r)) {
        findings.push({
          id: 'dyn-new-api-' + r.replace(/\W/g, ''),
          severity: 'high',
          documentationFile: 'README.md',
          sourceFile: rel,
          problem: 'New API route ' + r + ' introduced in ' + rel + ' but not found in any README.',
          suggestedCorrection: 'Document `' + r + '` in the root README API section (and any other relevant README).',
          kind: 'missing',
          deterministic: true,
          confirmed: true,
          potentialRisk: false,
          changeType: status
        });
      }
    }
    for (const r of oldRoutes) {
      if (!routes.includes(r) && combined.includes(r)) {
        findings.push({
          id: 'dyn-removed-api-' + r.replace(/\W/g, ''),
          severity: 'high',
          documentationFile: 'README.md',
          sourceFile: rel,
          problem: 'API route ' + r + ' no longer present in ' + rel + ' but still referenced in README(s).',
          suggestedCorrection: 'Remove documentation of `' + r + '` or restore the route.',
          kind: 'outdated',
          deterministic: true,
          confirmed: true,
          potentialRisk: false,
          changeType: status
        });
      }
    }
  }

  // --- Environment variables (new ones) ---
  if (!unreadable && !isTestOrAuditScript(rel)) {
    const envs = status === 'D' ? [] : extractEnvVars(content);
    const oldEnvs = extractEnvVars(oldContent);
    for (const v of envs) {
      if (CI_ENV_IGNORE.has(v)) continue;
      if (!oldEnvs.includes(v) && !combined.includes(v)) {
        // Common public config vars are higher confidence; others are potential
        const highConf = /^(GITHUB_TOKEN|GH_TOKEN|GA_|PORT|NODE_ENV|SPOTIFY_|RENDER_)/.test(v);
        findings.push({
          id: 'dyn-new-env-' + v,
          severity: highConf ? 'medium' : 'low',
          documentationFile: 'README.md',
          sourceFile: rel,
          problem: 'Environment variable ' + v + ' is newly referenced in ' + rel + ' and is not mentioned in any README.',
          suggestedCorrection: 'Document `' + v + '` in the environment section of the appropriate README, or confirm it is internal-only.',
          kind: 'missing',
          deterministic: true,
          confirmed: highConf,
          potentialRisk: !highConf,
          changeType: status
        });
      }
    }
    for (const v of oldEnvs) {
      if (CI_ENV_IGNORE.has(v)) continue;
      if (!envs.includes(v) && combined.includes(v)) findings.push({
        id: 'dyn-removed-env-' + v, severity: 'medium', documentationFile: 'README.md', sourceFile: rel,
        problem: 'Environment variable ' + v + ' is no longer referenced in ' + rel + ' but remains documented in README(s).',
        suggestedCorrection: 'Remove or update documentation for \`' + v + '\`.', kind: 'outdated',
        deterministic: true, confirmed: true, potentialRisk: false, changeType: status
      });
    }
  }

  // --- Deleted file still referenced ---
  if (status === 'D') {
    const base = path.basename(rel);
    for (const [rf, text] of Object.entries(readmes || {})) {
      if (fileMentionedIn(text, rel) || (base.length > 4 && text.includes(base))) {
        findings.push({
          id: 'dyn-deleted-ref-' + base.replace(/\W/g, ''),
          severity: 'medium',
          documentationFile: rf,
          sourceFile: rel,
          problem: 'Deleted file `' + rel + '` is still referenced in ' + rf + '.',
          suggestedCorrection: 'Update or remove the reference to `' + rel + '` in ' + rf + '.',
          kind: 'outdated',
          deterministic: true,
          confirmed: true,
          potentialRisk: false,
          changeType: 'D'
        });
      }
    }
  }

  // --- Renamed file ---
  if ((status === 'R' || status === 'C') && change.oldPath) {
    const oldBase = path.basename(change.oldPath);
    for (const [rf, text] of Object.entries(readmes || {})) {
      if (text.includes(change.oldPath) || (text.includes(oldBase) && !text.includes(rel))) {
        findings.push({
          id: 'dyn-renamed-ref-' + oldBase.replace(/\W/g, ''),
          severity: 'medium',
          documentationFile: rf,
          sourceFile: rel,
          problem: 'File renamed from `' + change.oldPath + '` to `' + rel + '`; ' + rf + ' still references the old name/path.',
          suggestedCorrection: 'Update references from `' + change.oldPath + '` to `' + rel + '` in ' + rf + '.',
          kind: 'outdated',
          deterministic: true,
          confirmed: true,
          potentialRisk: false,
          changeType: 'R'
        });
      }
    }
  }

  // --- package.json dependency / version changes ---
  if (rel === 'package.json' && status !== 'D' && !unreadable) {
    try {
      const pkg = JSON.parse(content);
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      for (const [name, ver] of Object.entries(deps)) {
        for (const [rf, text] of Object.entries(readmes || {})) {
          if (!text.includes(name)) continue;
          const m = text.match(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^\\n]*?(\\d+\\.\\d+(?:\\.\\d+)?)', 'i'));
          const docVer = m ? m[1] : null;
          const cleanVer = String(ver).replace(/^[^\d]*/, '');
          if (docVer && cleanVer && docVer !== cleanVer) {
            findings.push({
              id: 'dyn-dep-version-' + name.replace(/\W/g, ''),
              severity: 'medium',
              documentationFile: rf,
              sourceFile: rel,
              problem: 'package.json declares ' + name + '@' + ver + ' but ' + rf + ' documents version ' + docVer + '.',
              suggestedCorrection: 'Update the documented version of ' + name + ' in ' + rf + ' to match package.json.',
              kind: 'outdated',
              deterministic: true,
              confirmed: true,
              potentialRisk: false,
              changeType: status
            });
          }
        }
      }
    } catch { /* invalid json — skip */ }
  }

  // --- Removed package dependencies and npm scripts ---
  if (rel === 'package.json' && !unreadable && oldContent) {
    try {
      const oldPkg = JSON.parse(oldContent), newPkg = status === 'D' ? {} : JSON.parse(content);
      const oldDeps = { ...(oldPkg.dependencies || {}), ...(oldPkg.devDependencies || {}) };
      const newDeps = { ...(newPkg.dependencies || {}), ...(newPkg.devDependencies || {}) };
      for (const name of Object.keys(oldDeps)) if (!Object.prototype.hasOwnProperty.call(newDeps, name) && combined.includes(name)) {
        findings.push({ id: 'dyn-removed-dep-' + name.replace(/\W/g, ''), severity: 'medium',
          documentationFile: 'README.md', sourceFile: rel,
          problem: 'Dependency ' + name + ' was removed from package.json but remains referenced in README(s).',
          suggestedCorrection: 'Remove or replace documentation referring to dependency \`' + name + '\`.',
          kind: 'outdated', deterministic: true, confirmed: true, potentialRisk: false, changeType: status });
      }
      const oldScripts = oldPkg.scripts || {}, newScripts = newPkg.scripts || {};
      for (const name of Object.keys(oldScripts)) if (!Object.prototype.hasOwnProperty.call(newScripts, name) &&
        (combined.includes('npm run ' + name) || combined.includes('\`' + name + '\`'))) {
        findings.push({ id: 'dyn-removed-script-' + name.replace(/\W/g, ''), severity: 'medium',
          documentationFile: 'README.md', sourceFile: rel,
          problem: 'npm script "' + name + '" was removed from package.json but remains documented in README(s).',
          suggestedCorrection: 'Update or remove the documented \`npm run ' + name + '\` command.',
          kind: 'outdated', deterministic: true, confirmed: true, potentialRisk: false, changeType: status });
      }
    } catch { /* malformed package metadata is reported by other checks */ }
  }

  // --- Android / Gradle configuration ---
  if ((rel.includes('gradle-wrapper.properties') || rel.endsWith('.gradle') || rel.endsWith('.kt')) && status !== 'D' && !unreadable) {
    const gver = extractGradleVersion(content);
    if (gver) {
      for (const [rf, text] of Object.entries(readmes || {})) {
        if (!rf.includes('mobile') && rf !== 'README.md') continue;
        if (/Gradle/i.test(text) && !text.includes(gver)) {
          findings.push({
            id: 'dyn-gradle-ver-' + gver.replace(/\W/g, ''),
            severity: 'medium',
            documentationFile: rf,
            sourceFile: rel,
            problem: 'Gradle wrapper version is ' + gver + ' (' + rel + ') but ' + rf + ' does not mention this version.',
            suggestedCorrection: 'Document Gradle **' + gver + '** in ' + rf + '.',
            kind: 'outdated',
            deterministic: true,
            confirmed: true,
            potentialRisk: false,
            changeType: status
          });
        }
      }
    }
    const appId = extractApplicationId(content);
    if (appId) {
      for (const [rf, text] of Object.entries(readmes || {})) {
        if (rf.includes('mobile') && text.includes('applicationId') && !text.includes(appId)) {
          findings.push({
            id: 'dyn-appid-mismatch',
            severity: 'medium',
            documentationFile: rf,
            sourceFile: rel,
            problem: 'applicationId is `' + appId + '` in ' + rel + ' but ' + rf + ' documents a different value.',
            suggestedCorrection: 'Update the documented applicationId in ' + rf + ' to `' + appId + '`.',
            kind: 'outdated',
            deterministic: true,
            confirmed: true,
            potentialRisk: false,
            changeType: status
          });
        }
      }
    }
    const home = extractHomeUrl(content);
    if (home && rel.endsWith('.kt')) {
      for (const [rf, text] of Object.entries(readmes || {})) {
        if (rf.includes('mobile') && /Home URL|HOME_URL|homeURL/i.test(text) && !text.includes(home.replace(/\/$/, ''))) {
          findings.push({
            id: 'dyn-android-home-mismatch',
            severity: 'high',
            documentationFile: rf,
            sourceFile: rel,
            problem: 'Android HOME_URL is `' + home + '` but ' + rf + ' does not document this URL.',
            suggestedCorrection: 'Set the mobile README Home URL to match `' + home + '`.',
            kind: 'outdated',
            deterministic: true,
            confirmed: true,
            potentialRisk: false,
            changeType: status
          });
        }
      }
    }
  }

  // --- iOS configuration ---
  if ((rel.endsWith('.swift') || rel.endsWith('.plist')) && status !== 'D' && !unreadable) {
    const home = extractHomeUrl(content);
    if (home) {
      for (const [rf, text] of Object.entries(readmes || {})) {
        if (rf.includes('mobile') && /Home URL|homeURL/i.test(text) && !text.includes(home.replace(/\/$/, ''))) {
          findings.push({
            id: 'dyn-ios-home-mismatch',
            severity: 'high',
            documentationFile: rf,
            sourceFile: rel,
            problem: 'iOS homeURL is `' + home + '` but ' + rf + ' does not document this URL.',
            suggestedCorrection: 'Set the mobile README Home URL to match `' + home + '`.',
            kind: 'outdated',
            deterministic: true,
            confirmed: true,
            potentialRisk: false,
            changeType: status
          });
        }
      }
    }
  }

  // --- Windows launcher configuration ---
  if ((rel.endsWith('.cpp') || rel.endsWith('.vcxproj') || rel.endsWith('.sln')) && status !== 'D' && !unreadable) {
    const home = extractHomeUrl(content);
    if (home) {
      for (const [rf, text] of Object.entries(readmes || {})) {
        if (rf.includes('launcher') && /Home URL|homeURL|onrender\.com/i.test(text) && !text.includes(home.replace(/\/$/, ''))) {
          findings.push({
            id: 'dyn-launcher-home-mismatch',
            severity: 'high',
            documentationFile: rf,
            sourceFile: rel,
            problem: 'Launcher home URL appears as `' + home + '` in ' + rel + ' but ' + rf + ' does not document it.',
            suggestedCorrection: 'Document the launcher home URL as `' + home + '` in ' + rf + '.',
            kind: 'outdated',
            deterministic: true,
            confirmed: true,
            potentialRisk: false,
            changeType: status
          });
        }
      }
    }
    if (/WebView2/i.test(content)) {
      for (const [rf, text] of Object.entries(readmes || {})) {
        if (rf.includes('launcher') && !/WebView2/i.test(text)) {
          findings.push({
            id: 'dyn-launcher-webview2-undocumented',
            severity: 'medium',
            documentationFile: rf,
            sourceFile: rel,
            problem: 'Launcher source ' + rel + ' uses WebView2 but ' + rf + ' does not mention WebView2.',
            suggestedCorrection: 'Mention WebView2 in ' + rf + ' features or requirements.',
            kind: 'missing',
            deterministic: true,
            confirmed: true,
            potentialRisk: false,
            changeType: status
          });
        }
      }
    }
  }

  // --- Added or removed GitHub Actions workflows ---
  if (rel.startsWith('.github/workflows/') && (status === 'A' || status === 'D')) {
    const base = path.basename(rel);
    if (status === 'A' && !combined.includes(base)) findings.push({
      id: 'dyn-new-workflow-' + base.replace(/\W/g, ''), severity: 'low', documentationFile: 'README.md', sourceFile: rel,
      problem: 'New workflow \`' + rel + '\` added but not listed in any README structure section.',
      suggestedCorrection: 'Consider listing \`' + base + '\` under .github/workflows in the root README.',
      kind: 'missing', deterministic: true, confirmed: false, potentialRisk: true, changeType: 'A'
    });
    if (status === 'D' && (combined.includes(rel) || combined.includes(base))) findings.push({
      id: 'dyn-removed-workflow-' + base.replace(/\W/g, ''), severity: 'medium', documentationFile: 'README.md', sourceFile: rel,
      problem: 'Workflow \`' + rel + '\` was removed but is still referenced in README(s).',
      suggestedCorrection: 'Remove or replace references to \`' + base + '\` in README(s).',
      kind: 'outdated', deterministic: true, confirmed: true, potentialRisk: false, changeType: 'D'
    });
  }

  // --- New source file not covered by existing static DOC_SPECS and not mentioned ---
  if (status === 'A' && /\.(js|ts|kt|swift|cpp|yml|gradle|html|css)$/.test(rel) && !unreadable && !isTestOrAuditScript(rel)) {
    const base = path.basename(rel);
    const mentioned = fileMentionedIn(combined, rel) || combined.includes(base);
    // Avoid flagging every tiny internal helper; only flag files that look public/structural
    const looksPublic = /^(app|server|index|main)\.|api|workflow|gradle|Activity|ViewController|AppWindow/i.test(base) ||
      rel.split('/').length <= 2;
    if (!mentioned && looksPublic) {
      findings.push({
        id: 'dyn-new-file-' + base.replace(/\W/g, ''),
        severity: 'low',
        documentationFile: 'README.md',
        sourceFile: rel,
        problem: 'New source file `' + rel + '` introduced. It is not mentioned in any README and has no matching static DOC_SPECS entry.',
        suggestedCorrection: 'Review whether `' + rel + '` should appear in the project structure or feature documentation.',
        kind: 'missing',
        deterministic: true,
        confirmed: false,
        potentialRisk: true,
        changeType: 'A'
      });
    }
  }

  // --- Outdated documented commands (heuristic on changed scripts / package.json scripts) ---
  if ((rel === 'package.json' || rel.endsWith('.sh') || rel.endsWith('gradlew') || rel.endsWith('gradlew.bat')) && status !== 'D' && !unreadable) {
    // If README mentions a command that no longer exists in package.json scripts
    if (rel === 'package.json') {
      try {
        const pkg = JSON.parse(content);
        const scripts = Object.keys(pkg.scripts || {});
        for (const [rf, text] of Object.entries(readmes || {})) {
          const cmdRe = /npm run ([a-zA-Z0-9:_-]+)/g;
          let m;
          while ((m = cmdRe.exec(text)) !== null) {
            if (!scripts.includes(m[1])) {
              findings.push({
                id: 'dyn-outdated-npm-script-' + m[1].replace(/\W/g, ''),
                severity: 'medium',
                documentationFile: rf,
                sourceFile: rel,
                problem: rf + ' documents `npm run ' + m[1] + '` but that script is not present in package.json.',
                suggestedCorrection: 'Remove or update the documented `npm run ' + m[1] + '` command in ' + rf + '.',
                kind: 'outdated',
                deterministic: true,
                confirmed: true,
                potentialRisk: false,
                changeType: status
              });
            }
          }
        }
      } catch { /* ignore */ }
    }
  }


  return findings;
}

/**
 * Cross-README contradiction scan (always runs, independent of the diff).
 * Looks for conflicting version / URL claims that static analysis can detect.
 */
function scanReadmeContradictions(readmes) {
  const findings = [];
  const entries = Object.entries(readmes || {}).filter(([, t]) => t);
  // Simple: if two READMEs both mention a Gradle version but differ
  const gradleMentions = [];
  for (const [rf, text] of entries) {
    const m = text.match(/Gradle[^0-9]*(\d+\.\d+(?:\.\d+)?)/i);
    if (m) gradleMentions.push({ rf, ver: m[1] });
  }
  if (gradleMentions.length >= 2) {
    const versions = new Set(gradleMentions.map((g) => g.ver));
    if (versions.size > 1) {
      findings.push({
        id: 'dyn-contradict-gradle',
        severity: 'medium',
        documentationFile: gradleMentions.map((g) => g.rf).join(', '),
        sourceFile: '(multiple READMEs)',
        problem: 'Conflicting Gradle versions documented across README files: ' +
          gradleMentions.map((g) => g.rf + '=' + g.ver).join('; ') + '.',
        suggestedCorrection: 'Align the Gradle version claims across all README files with the actual gradle-wrapper.properties.',
        kind: 'outdated',
        deterministic: true,
        confirmed: true,
        potentialRisk: false
      });
    }
  }
  return findings;
}

/**
 * Main entry. Accepts either a real root (uses Git) or injected changes (for tests).
 *
 * options:
 *   changes: array of change objects (skips Git discovery)
 *   skipGitContent: boolean
 *   docSpecsSourceFiles: Set of paths already covered by static DOC_SPECS (optional, for "no existing entry" detection)
 */
function runDynamicDocumentationAudit(root, readmes, options = {}) {
  let gitInfo;
  if (options.changes) {
    gitInfo = {
      historyAvailable: true,
      baseCommit: options.baseCommit || 'injected',
      headCommit: options.headCommit || 'injected',
      changes: options.changes,
      skipped: options.skipped || [],
      error: null
    };
  } else {
    gitInfo = getGitChanges(root || process.cwd(), options);
  }

  const findings = [];
  const perFile = [];
  let unreadableCount = 0;

  for (const change of gitInfo.changes) {
    const fileFindings = analyzeChange(change, root, readmes, { ...options, baseSha: validSha(gitInfo.baseCommit) ? gitInfo.baseCommit : null, headSha: validSha(gitInfo.headCommit) ? gitInfo.headCommit : null });
    const unreadable = fileFindings.some((f) => f.unreadable);
    if (unreadable) unreadableCount++;
    findings.push(...fileFindings);
    perFile.push({
      path: change.path,
      status: change.status,
      oldPath: change.oldPath || null,
      findings: fileFindings.filter((f) => !f.unreadable).length,
      relevant: fileFindings.some((f) => !f.unreadable && (f.confirmed || f.potentialRisk)),
      unreadable
    });
  }

  // Always scan for cross-README contradictions
  findings.push(...scanReadmeContradictions(readmes));

  const confirmed = findings.filter((f) => f.confirmed);
  const potential = findings.filter((f) => f.potentialRisk);

  let status = 'complete';
  if (gitInfo.error) status = 'unavailable';
  else if (gitInfo.status === 'initial-commit') status = 'initial-commit';
  if (unreadableCount > 0) status = 'partial';

  const summary = {
    historyAvailable: gitInfo.historyAvailable,
    baseCommit: gitInfo.baseCommit,
    headCommit: gitInfo.headCommit,
    changedFiles: gitInfo.changes.length + (gitInfo.skipped || []).length,
    analyzedFiles: gitInfo.changes.length - unreadableCount,
    skippedFiles: gitInfo.skipped || [],
    unreadableFiles: unreadableCount,
    readmeFilesDiscovered: Object.keys(readmes || {}).length,
    documentationRelevantChanges: perFile.filter((p) => p.relevant).length,
    missingDocumentationFindings: findings.filter((f) => f.kind === 'missing' && f.confirmed).length,
    outdatedDocumentationFindings: findings.filter((f) => f.kind === 'outdated' && f.confirmed).length,
    potentialRisks: potential.length,
    confirmedFindings: confirmed.length,
    perFileImpact: perFile,
    status,
    error: gitInfo.error || null
  };

  return { findings, summary, gitInfo };
}

module.exports = {
  runDynamicDocumentationAudit,
  getGitChanges,
  analyzeChange,
  extractRoutes,
  extractEnvVars,
  extractGradleVersion,
  scanReadmeContradictions,
  isSkippable,
  readGitFile,
  parseNameStatusZ
};
